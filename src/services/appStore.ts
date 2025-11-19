
export interface AppData {
  id: number;
  title: string;
  description: string;
  icon: string;
  screenshot: string;
  url: string;
  version: string;
  rating: number;
  genres: string[];
  formattedPrice: string;
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
    const response = await fetch(
      `https://itunes.apple.com/lookup?id=${ARTIST_ID}&entity=software&country=${country}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch apps');
    }

    const data = await response.json();

    // The first result is usually the artist info, subsequent results are apps
    // We filter by wrapperType 'software' to be sure.
    const apps = data.results
      .filter((item: any) => item.wrapperType === 'software')
      .map((item: any) => ({
        id: item.trackId,
        title: item.trackName,
        description: item.description,
        icon: item.artworkUrl100, // 100x100 icon
        screenshot: item.screenshotUrls?.[0] || item.ipadScreenshotUrls?.[0] || item.artworkUrl512, // Fallback to large icon if no screenshot
        url: item.trackViewUrl,
        version: item.version,
        rating: item.averageUserRating,
        genres: item.genres,
        formattedPrice: item.formattedPrice
      }));

    return apps;
  } catch (error) {
    console.error('Error fetching apps:', error);
    return [];
  }
};
