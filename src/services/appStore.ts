
export interface AppData {
  id: number;
  title: string;
  description: string;
  icon: string;
  screenshots: {
    iphone: string[];
    ipad: string[];
    mac: string[];
  };
  url: string;
  version: string;
  rating: number;
  genres: string[];
  formattedPrice: string;
  device: 'mac' | 'iphone' | 'ipad' | 'universal';
  reviews: AppReview[];
}

export interface AppReview {
  id: string;
  author: string;
  title: string;
  content: string;
  rating: number;
  version: string;
  date?: string;
  country?: string;
}

const ARTIST_ID = '1367894360';

async function fetchUrlWithProxy(url: string): Promise<Response> {
  const proxies = [
    (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`
  ];

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

export const fetchDeveloperApps = async (language: string): Promise<AppData[]> => {
  // Map language code to iTunes country code
  let country = 'us';
  if (language === 'zh-CN' || language === 'zh') {
    country = 'cn';
  } else if (language === 'zh-TW') {
    country = 'tw';
  }

  try {
    // Fetch both iOS/iPadOS software and Mac software
    const fetchJson = async (url: string) => {
      const response = await fetchUrlWithProxy(url);
      return await response.json();
    };

    const [iosData, macData] = await Promise.all([
      fetchJson(`https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=software&country=${country}`),
      fetchJson(`https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=macSoftware&country=${country}`)
    ]);

    const processResults = (results: any[], isMac: boolean = false) => {
      return results
        .filter((item: any) => item.wrapperType === 'software')
        .map((item: any) => {
          let device: 'mac' | 'iphone' | 'ipad' | 'universal' = 'iphone';

          if (isMac || item.kind === 'mac-software') {
            device = 'mac';
          } else if (item.features?.includes('iosUniversal')) {
            device = 'universal';
          } else if (item.ipadScreenshotUrls?.length > 0 && item.screenshotUrls?.length === 0) {
            device = 'ipad';
          }

          // Initial screenshots from API
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

    // Merge and deduplicate by ID
    const allApps = [...iosApps, ...macApps];
    const uniqueApps = Array.from(new Map(allApps.map(app => [app.id, app])).values());

    // Fetch screenshots and reviews from web to supplement API data
    // Limit concurrency to avoid rate limiting (chunks of 3)
    const appsWithDetails: AppData[] = [];
    const chunkSize = 3;

    for (let i = 0; i < uniqueApps.length; i += chunkSize) {
      const chunk = uniqueApps.slice(i, i + chunkSize);
      const chunkResults = await Promise.all(chunk.map(async (app) => {
        try {
          const [scrapedScreenshots, reviews] = await Promise.all([
            fetchAppScreenshotsFromWeb(app.id, country),
            fetchAppReviews(app.id)
          ]);

          // Merge scraped screenshots if available
          let updatedScreenshots = app.screenshots;
          if (scrapedScreenshots.iphone.length > 0 || scrapedScreenshots.ipad.length > 0 || scrapedScreenshots.mac.length > 0) {
            updatedScreenshots = {
              iphone: scrapedScreenshots.iphone.length > 0 ? scrapedScreenshots.iphone : app.screenshots.iphone,
              ipad: scrapedScreenshots.ipad.length > 0 ? scrapedScreenshots.ipad : app.screenshots.ipad,
              mac: scrapedScreenshots.mac.length > 0 ? scrapedScreenshots.mac : app.screenshots.mac
            };
          }

          return {
            ...app,
            screenshots: updatedScreenshots,
            rating: scrapedScreenshots.rating || app.rating,
            reviews
          };
        } catch (e) {
          console.warn(`Failed to fetch details for ${app.title}:`, e);
          return { ...app, reviews: [] };
        }
      }));
      appsWithDetails.push(...chunkResults);
    }

    return appsWithDetails;
  } catch (error) {
    console.error('Error fetching developer apps:', error);
    return [];
  }
}

async function fetchAppReviews(appId: number): Promise<AppReview[]> {
  const countries = ['us', 'cn', 'tw', 'hk'];
  const allReviews: AppReview[] = [];
  const seenReviewIds = new Set<string>();

  try {
    // Process countries sequentially to avoid rate limiting
    for (const country of countries) {
      try {
        const rssUrl = `https://itunes.apple.com/${country}/rss/customerreviews/id=${appId}/sortby=mostrecent/json`;
        const response = await fetchUrlWithProxy(rssUrl);
        const data = await response.json();
        const entry = data.feed?.entry;

        if (entry && Array.isArray(entry)) {
          const reviews = entry.map((item: any) => {
            // Skip the first entry if it's the app info itself (sometimes happens in RSS)
            if (item.im$name) return null;

            return {
              id: item.id?.label,
              title: item.title?.label,
              content: item.content?.label,
              rating: parseInt(item['im:rating']?.label || '0'),
              author: item.author?.name?.label,
              version: item['im:version']?.label,
              date: item.updated?.label,
              country: country
            } as AppReview;
          }).filter((review: AppReview | null): review is AppReview =>
            review !== null && review.rating >= 4
          );

          reviews.forEach((review: AppReview) => {
            // Deduplicate based on content and author if ID is missing or unreliable
            // Also use ID if available
            const uniqueKey = review.id || `${review.author}-${review.content.substring(0, 20)}`;
            if (!seenReviewIds.has(uniqueKey)) {
              seenReviewIds.add(uniqueKey);
              allReviews.push(review);
            }
          });
        }
      } catch (e) {
        // Ignore individual country failures
        console.warn(`Failed to fetch reviews for ${country}:`, e);
      }
    }

    // Sort by date (newest first) and limit to 20
    return allReviews
      .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime())
      .slice(0, 20);

  } catch (error) {
    console.error(`Error fetching reviews for ${appId}:`, error);
    return [];
  }
}

async function fetchAppScreenshotsFromWeb(appId: number, country: string): Promise<{ iphone: string[], ipad: string[], mac: string[], rating?: number }> {
  const result = { iphone: [] as string[], ipad: [] as string[], mac: [] as string[], rating: undefined as number | undefined };

  try {
    const appUrl = `https://apps.apple.com/${country}/app/id${appId}`;
    const response = await fetchUrlWithProxy(appUrl);
    const html = await response.text();

    if (!html) return result;

    // Strategy: Extract from JSON data (shelfMapping)
    const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
    let jsonData: any = null;

    for (const tag of scriptTags) {
      if (tag.includes('shelfMapping')) {
        const contentMatch = tag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (contentMatch) {
          try {
            jsonData = JSON.parse(contentMatch[1]);
            break;
          } catch (e) {
            // If direct parse fails, try to find JSON object inside
            const content = contentMatch[1];
            const firstBrace = content.indexOf('{');
            const lastBrace = content.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
              try {
                jsonData = JSON.parse(content.substring(firstBrace, lastBrace + 1));
                break;
              } catch (e2) {
                // ignore
              }
            }
          }
        }
      }
    }

    if (jsonData) {
      // Helper to find shelfMapping recursively
      const findShelfMapping = (obj: any): any => {
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
        const extractFromMedia = (mediaKey: string, targetArray: string[]) => {
          if (shelfMapping[mediaKey] && shelfMapping[mediaKey].items) {
            shelfMapping[mediaKey].items.forEach((item: any) => {
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

        // Attempt to find rating in shelfMapping or standard JSON
        // Often ratings are in a separate part of the store state, but sometimes in product data
        // We can also try to regex it from the HTML if JSON fails
      }
    }

    // Fallback: Regex for rating in HTML (e.g., "4.5 out of 5")
    // <span class="we-customer-ratings__averages__display">4.5</span>
    const ratingMatch = html.match(/class="we-customer-ratings__averages__display">([\d.]+)<\/span>/);
    if (ratingMatch && ratingMatch[1]) {
      result.rating = parseFloat(ratingMatch[1]);
    }

    // Deduplicate
    result.iphone = Array.from(new Set(result.iphone));
    result.ipad = Array.from(new Set(result.ipad));
    result.mac = Array.from(new Set(result.mac));

    return result;
  } catch (error) {
    console.error(`Error scraping screenshots for ${appId}:`, error);
    return result;
  }
};
