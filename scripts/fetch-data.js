import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIST_ID = '1367894360';
const OUTPUT_FILE = path.join(__dirname, '../src/data/apps.json');

async function fetchUrlWithProxy(url) {
    const proxies = [
        (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`
    ];

    // Try direct fetch first (works in Node.js, unlike browser due to CORS)
    try {
        const response = await fetch(url);
        if (response.ok) return response;
    } catch (e) {
        console.log(`Direct fetch failed for ${url}, trying proxies...`);
    }

    for (const proxy of proxies) {
        try {
            const response = await fetch(proxy(url));
            if (response.ok) {
                return response;
            }
        } catch (e) {
            console.warn(`Proxy failed for ${url}, trying next...`);
        }
    }
    throw new Error(`All proxies failed for ${url}`);
}

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
        const response = await fetchUrlWithProxy(appUrl);
        const html = await response.text();

        if (!html) return result;

        const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
        let jsonData = null;

        for (const tag of scriptTags) {
            if (tag.includes('shelfMapping')) {
                const contentMatch = tag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
                if (contentMatch) {
                    try {
                        jsonData = JSON.parse(contentMatch[1]);
                        break;
                    } catch (e) {
                        const content = contentMatch[1];
                        const firstBrace = content.indexOf('{');
                        const lastBrace = content.lastIndexOf('}');
                        if (firstBrace !== -1 && lastBrace !== -1) {
                            try {
                                jsonData = JSON.parse(content.substring(firstBrace, lastBrace + 1));
                                break;
                            } catch (e2) { }
                        }
                    }
                }
            }
        }

        if (jsonData) {
            const findShelfMapping = (obj) => {
                if (!obj || typeof obj !== 'object') return null;
                if (obj.shelfMapping) return obj.shelfMapping;
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const result = findShelfMapping(obj[key]);
                        if (result) return result;
                    }
                }
                return null;
            };

            const shelfMapping = findShelfMapping(jsonData);
            if (shelfMapping) {
                const extractFromMedia = (mediaKey, targetArray) => {
                    if (shelfMapping[mediaKey] && shelfMapping[mediaKey].items) {
                        shelfMapping[mediaKey].items.forEach((item) => {
                            if (item.screenshot && item.screenshot.template && item.screenshot.width && item.screenshot.height) {
                                const { template, width, height } = item.screenshot;
                                const url = template
                                    .replace('{w}', width.toString())
                                    .replace('{h}', height.toString())
                                    .replace('{c}', 'bb')
                                    .replace('{f}', 'jpg');
                                targetArray.push(url);
                            }
                        });
                    }
                };

                Object.keys(shelfMapping).forEach(key => {
                    if (key.startsWith('product_media_phone')) {
                        extractFromMedia(key, result.iphone);
                    } else if (key.startsWith('product_media_pad')) {
                        extractFromMedia(key, result.ipad);
                    } else if (key.startsWith('product_media_mac')) {
                        extractFromMedia(key, result.mac);
                    }
                });
            }
        }

        const ratingMatch = html.match(/class="we-customer-ratings__averages__display">([\d.]+)<\/span>/);
        if (ratingMatch && ratingMatch[1]) {
            result.rating = parseFloat(ratingMatch[1]);
        }

        result.iphone = Array.from(new Set(result.iphone));
        result.ipad = Array.from(new Set(result.ipad));
        result.mac = Array.from(new Set(result.mac));

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

        // Process sequentially to be nice to the API
        for (const app of uniqueApps) {
            console.log(`Processing ${app.title}...`);
            const [scrapedScreenshots, reviews] = await Promise.all([
                fetchAppScreenshotsFromWeb(app.id, country),
                fetchAppReviews(app.id)
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
                reviews: reviews // Keep reviews in app object too if needed, but we'll use global list mostly
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
