import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIST_ID = '1367894360';
const OUTPUT_FILE = path.join(__dirname, '../src/data/apps.json');

// Use curl for robust fetching (handles redirects/TLS/network better than node fetch in some envs)
async function fetchWithTimeout(url, timeout = 60000, customHeaders = {}) {
    // Construct headers string for curl
    let headerStr = '';
    const headers = {
        'User-Agent': customHeaders['User-Agent'] || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Connection': 'keep-alive',
        ...customHeaders
    };

    for (const [key, value] of Object.entries(headers)) {
        headerStr += ` -H "${key}: ${value}"`;
    }

    try {
        // Use /usr/bin/curl explicitly and -sS to show errors
        // Added: --compressed (gzip) to reduce size, --retry 3 for stability
        const cmd = `/usr/bin/curl -sS -L --compressed --retry 3 --retry-delay 2 --retry-connrefused --max-time ${timeout / 1000} ${headerStr} "${url}"`;
        const { stdout } = await execAsync(cmd, { maxBuffer: 10 * 1024 * 1024 });

        return {
            ok: true,
            json: async () => JSON.parse(stdout),
            text: async () => stdout
        };
    } catch (error) {
        // exec error includes stderr usually, but let's be explicit
        throw new Error(`Curl failed (${error.code}): ${error.message} \nStderr: ${error.stderr}`);
    }
}

// Alias for compatibility
const fetchUrlWithProxy = fetchWithTimeout;

async function fetchAppReviews(appId) {
    const countries = ['us', 'cn', 'tw', 'hk'];
    const allReviews = [];
    const seenReviewIds = new Set();

    console.log(`Fetching reviews for app ${appId}...`);

    for (const country of countries) {
        try {
            const rssUrl = `https://itunes.apple.com/${country}/rss/customerreviews/id=${appId}/sortby=mostrecent/json`;
            const response = await fetchUrlWithProxy(rssUrl);
            const data = await response.json();
            const entry = data.feed?.entry;

            if (entry && Array.isArray(entry)) {
                const reviews = entry.map((item) => {
                    if (item.im$name) return null; // Skip app info entry

                    return {
                        id: item.id?.label,
                        title: item.title?.label,
                        content: item.content?.label,
                        rating: parseInt(item['im:rating']?.label || '0'),
                        author: item.author?.name?.label,
                        version: item['im:version']?.label,
                        date: item.updated?.label,
                        country: country
                    };
                }).filter(review => review !== null && review.rating >= 4);

                reviews.forEach((review) => {
                    const uniqueKey = review.id || `${review.author}-${review.content.substring(0, 20)}`;
                    if (!seenReviewIds.has(uniqueKey)) {
                        seenReviewIds.add(uniqueKey);
                        allReviews.push(review);
                    }
                });
            }
        } catch (e) {
            // console.warn(`Failed to fetch reviews for ${country}:`, e.message);
        }
    }

    return allReviews
        .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
        .slice(0, 20);
}

async function fetchAppScreenshotsFromWeb(appId, country) {
    const result = { iphone: [], ipad: [], mac: [], rating: undefined };

    try {
        const appUrl = `https://apps.apple.com/${country}/app/id${appId}`;

        let headers = {};
        if (country === 'cn') headers['Accept-Language'] = 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7';
        else if (country === 'tw') headers['Accept-Language'] = 'zh-TW,zh-Hant;q=0.9,en-US;q=0.8,en;q=0.7';
        else headers['Accept-Language'] = 'en-US,en;q=0.9';

        // Increase timeout to 60s
        const response = await fetchWithTimeout(appUrl, 60000, headers);
        const html = await response.text();

        if (!html) return result;

        // Validating if it's the new page structure (no shelfMapping usually)
        // Extract all image URLs from <source srcset="..."> and <img src="...">
        // We capture more context to filter properly
        const urlRegex = /(?:srcset|src)="([^"]*mzstatic\.com\/image\/thumb\/[^"]*)"/g;
        let match;

        // Map of UUID -> Best Candidate URL
        const bestScreenshots = new Map();

        while ((match = urlRegex.exec(html)) !== null) {
            // Some URLs might be comma separated in srcset, or have ' 1x' suffix
            const raw = match[1];
            // Split by comma first (for srcset), then space (for descriptors like 2x)
            const candidates = raw.split(',').map(s => s.trim().split(' ')[0]);

            for (const cleanUrl of candidates) {
                // FILTER 1: Must be a likely screenshot source
                if (!cleanUrl.includes('mzstatic.com')) continue;

                // FILTER 2: Exclude known non-screenshot types
                if (cleanUrl.includes('AppIcon') ||
                    cleanUrl.includes('ProfilePhoto') ||
                    cleanUrl.includes('favicon') ||
                    cleanUrl.includes('icon')) {
                    continue;
                }

                // FILTER 3: Must look like a screenshot source (usually contains 'Purple' or 'Source' or high res pattern)
                // However, some new apps might not have 'Purple'. 
                // But typically they do have a UUID.

                // Extract UUID
                const uuidMatch = cleanUrl.match(/\/([a-f0-9-]{36})\//i);
                if (!uuidMatch) continue; // No UUID? content is suspicious or not a standard asset
                const uuid = uuidMatch[1];

                // Extract Dimensions for scoring
                const sizeMatch = cleanUrl.match(/\/(\d+)x(\d+)([a-z]*)\.[a-z]+$/);
                let width = 0, height = 0, score = 0;

                if (sizeMatch) {
                    width = parseInt(sizeMatch[1]);
                    height = parseInt(sizeMatch[2]);
                    score = width * height;
                }

                // Prefer 'bb' suffix (highest quality/bitbucket)
                if (cleanUrl.includes('bb.')) score += 1000000;

                // Compare with existing best for this UUID
                if (!bestScreenshots.has(uuid) || score > bestScreenshots.get(uuid).score) {
                    bestScreenshots.set(uuid, { url: cleanUrl, width, height, score });
                }
            }
        }

        // Categorize the best unique screenshots
        for (const [uuid, data] of bestScreenshots) {
            const { url, width, height } = data;

            // Heuristic filter: Screenshots must be reasonably large
            if (width < 300 && height < 300) continue;

            // Categorize
            // iPad: 4:3 or 3:4 aspect ratio, large dims (approx > 2000 on long side usually, but dependent on model)
            // Mac: Landscape, wide aspect ratio (16:10 etc), very large
            // iPhone: 19.5:9 usually (~ 2.16) or 16:9 

            const maxDim = Math.max(width, height);
            const ratio = width > height ? width / height : height / width;

            if (data.url.includes('Mac') || (width > height && width > 1200 && ratio > 1.5)) {
                // Likely Mac
                result.mac.push(url);
            } else if (ratio < 1.45 && ratio > 1.25 && maxDim > 1000) {
                // 4:3 (1.33) is typical iPad
                result.ipad.push(url);
            } else {
                // Default to iPhone
                result.iphone.push(url);
            }
        }

        // Final Sort (optional, but keep consistent order if possible? UUID order is random-ish)
        result.iphone.sort();
        result.ipad.sort();
        result.mac.sort();

        // Rating
        const ratingMatch = html.match(/class="we-customer-ratings__averages__display">([\d.]+)<\/span>/) ||
            html.match(/class="l-row">([\d.]+) out of 5/);
        if (ratingMatch && ratingMatch[1]) {
            result.rating = parseFloat(ratingMatch[1]);
        }

        return result;

    } catch (error) {
        console.error(`Error scraping screenshots for ${appId}:`, error);
        return result;
    }
}



async function main() {
    console.log('Starting data fetch...');
    const country = 'us'; // Default country for lookup

    try {
        const fetchJson = async (url) => {
            const response = await fetchUrlWithProxy(url);
            return await response.json();
        };

        console.log('Fetching apps list...');
        const [iosData, macData] = await Promise.all([
            fetchJson(`https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=software&country=${country}`),
            fetchJson(`https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=macSoftware&country=${country}`)
        ]);

        const processResults = (results, isMac = false) => {
            return results
                .filter((item) => item.wrapperType === 'software')
                .map((item) => {
                    let device = 'iphone';
                    if (isMac || item.kind === 'mac-software') {
                        device = 'mac';
                    } else if (item.features?.includes('iosUniversal')) {
                        device = 'universal';
                    } else if (item.ipadScreenshotUrls?.length > 0 && item.screenshotUrls?.length === 0) {
                        device = 'ipad';
                    }

                    const screenshots = {
                        iphone: item.screenshotUrls || [],
                        ipad: item.ipadScreenshotUrls || [],
                        mac: isMac ? (item.screenshotUrls || []) : []
                    };

                    return {
                        id: item.trackId,
                        title: item.trackName,
                        description: item.description,
                        icon: item.artworkUrl100 || item.artworkUrl512,
                        screenshots,
                        url: item.trackViewUrl,
                        version: item.version,
                        rating: item.averageUserRating || 0,
                        genres: item.genres,
                        formattedPrice: item.formattedPrice,
                        device,
                        reviews: []
                    };
                });
        };

        const iosApps = processResults(iosData.results || []);
        const macApps = processResults(macData.results || [], true);

        const allApps = [...iosApps, ...macApps];
        const uniqueApps = Array.from(new Map(allApps.map(app => [app.id, app])).values());

        console.log(`Found ${uniqueApps.length} apps. Fetching details...`);

        const appsWithDetails = [];
        const allReviews = [];

        // Helper to fetch localized data
        const fetchLocalizedData = async (appId) => {
            const countries = ['us', 'cn', 'tw'];
            const locales = {};

            for (const c of countries) {
                try {
                    const [iosInfo, macInfo] = await Promise.all([
                        fetchJson(`https://itunes.apple.com/lookup?id=${appId}&entity=software&country=${c}`),
                        fetchJson(`https://itunes.apple.com/lookup?id=${appId}&entity=macSoftware&country=${c}`)
                    ]);

                    const info = (iosInfo.results?.[0]) || (macInfo.results?.[0]);

                    // Fetch screenshots using web scraper for the specific region
                    const webScraped = await fetchAppScreenshotsFromWeb(appId, c);

                    if (info) {
                        // Priority: API data > Scraped data (API handles localization better than proxies)
                        const getScreenshots = (apiUrls, scrapedUrls) => {
                            if (apiUrls && apiUrls.length > 0) return apiUrls;
                            return scrapedUrls;
                        };

                        locales[c] = {
                            title: info.trackName,
                            description: info.description,
                            subtitle: info.subtitle,
                            screenshots: {
                                iphone: getScreenshots(info.screenshotUrls, webScraped.iphone),
                                ipad: getScreenshots(info.ipadScreenshotUrls, webScraped.ipad),
                                mac: getScreenshots(info.screenshotUrls, webScraped.mac) // API usually puts mac shots in screenshotUrls for mac apps
                            },
                            rating: info.averageUserRating || 0,
                            url: info.trackViewUrl // Store localized URL too if available
                        };
                    }
                } catch (e) {
                    console.warn(`Failed to fetch localized info for ${appId} in ${c}`);
                }
            }
            return locales;
        };

        // Process sequentially to be nice to the API
        for (const app of uniqueApps) {
            console.log(`Processing ${app.title}...`);

            // Fetch validation and additional data
            const [scrapedScreenshots, reviews, locales] = await Promise.all([
                fetchAppScreenshotsFromWeb(app.id, country),
                fetchAppReviews(app.id),
                fetchLocalizedData(app.id)
            ]);

            let updatedScreenshots = app.screenshots;
            if (scrapedScreenshots.iphone.length > 0 || scrapedScreenshots.ipad.length > 0 || scrapedScreenshots.mac.length > 0) {
                updatedScreenshots = {
                    iphone: scrapedScreenshots.iphone.length > 0 ? scrapedScreenshots.iphone : app.screenshots.iphone,
                    ipad: scrapedScreenshots.ipad.length > 0 ? scrapedScreenshots.ipad : app.screenshots.ipad,
                    mac: scrapedScreenshots.mac.length > 0 ? scrapedScreenshots.mac : app.screenshots.mac
                };
            }

            // Add reviews to global list
            reviews.forEach(r => allReviews.push({ ...r, appId: app.id, appName: app.title }));

            appsWithDetails.push({
                ...app,
                screenshots: updatedScreenshots,
                rating: scrapedScreenshots.rating || app.rating,
                reviews: reviews, // Keep reviews in app object too if needed, but we'll use global list mostly
                locales: locales // Add localized data
            });
        }

        // Sort reviews globally by date
        allReviews.sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

        const output = {
            lastUpdated: new Date().toISOString(),
            apps: appsWithDetails,
            reviews: allReviews.slice(0, 50) // Keep top 50 recent reviews globally
        };

        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
        console.log(`Successfully saved data to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error in main fetch:', error);
        process.exit(1);
    }
}

main();
