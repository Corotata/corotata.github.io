
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
}

const ARTIST_ID = '1367894360';

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
    // Use corsproxy.io to avoid CORS issues and get reliable data
    const fetchWithProxy = async (url: string) => {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      // iTunes API returns JSON, so we can parse it directly
      return await response.json();
    };

    const [iosData, macData] = await Promise.all([
      fetchWithProxy(`https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=software&country=${country}`),
      fetchWithProxy(`https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=macSoftware&country=${country}`)
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
            device
          };
        });
    };

    const iosApps = processResults(iosData.results || []);
    const macApps = processResults(macData.results || [], true);

    // Merge and deduplicate by ID
    const allApps = [...iosApps, ...macApps];
    const uniqueApps = Array.from(new Map(allApps.map(app => [app.id, app])).values());

    // Fetch screenshots from web to supplement API data
    const appsWithScreenshots = await Promise.all(uniqueApps.map(async (app) => {
      try {
        const scrapedScreenshots = await fetchAppScreenshotsFromWeb(app.id, country);

        // Merge scraped screenshots if available
        if (scrapedScreenshots.iphone.length > 0 || scrapedScreenshots.ipad.length > 0 || scrapedScreenshots.mac.length > 0) {
          return {
            ...app,
            screenshots: {
              iphone: scrapedScreenshots.iphone.length > 0 ? scrapedScreenshots.iphone : app.screenshots.iphone,
              ipad: scrapedScreenshots.ipad.length > 0 ? scrapedScreenshots.ipad : app.screenshots.ipad,
              mac: scrapedScreenshots.mac.length > 0 ? scrapedScreenshots.mac : app.screenshots.mac
            }
          };
        }
      } catch (e) {
        console.warn(`Failed to scrape screenshots for ${app.title}:`, e);
      }
      return app;
    }));

    return appsWithScreenshots;
  } catch (error) {
    console.error('Error fetching developer apps:', error);
    return [];
  }
}

async function fetchAppScreenshotsFromWeb(appId: number, country: string): Promise<{ iphone: string[], ipad: string[], mac: string[] }> {
  const result = { iphone: [] as string[], ipad: [] as string[], mac: [] as string[] };

  try {
    // Use corsproxy.io to bypass CORS
    const appUrl = `https://apps.apple.com/${country}/app/id${appId}`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(appUrl)}`;

    const response = await fetch(proxyUrl);
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
                console.warn('Failed to parse extracted JSON string');
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
          const media = shelfMapping[mediaKey];
          if (media && media.items) {
            media.items.forEach((item: any) => {
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
