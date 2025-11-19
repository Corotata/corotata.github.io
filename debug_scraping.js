// Use built-in fetch
async function fetchAppScreenshotsFromWeb(appId, country) {
    try {
        console.log(`Fetching for ${appId} in ${country}...`);
        // Use corsproxy.io proxy to bypass CORS
        const appUrl = `https://apps.apple.com/${country}/app/id${appId}`;
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(appUrl)}`;

        const response = await fetch(proxyUrl);
        // corsproxy returns the raw HTML directly, not JSON
        const html = await response.text();

        if (!html) {
            console.log('No contents in proxy response');
            return [];
        }
        console.log(`Got HTML length: ${html.length}`);

        // Extract the full JSON object containing shelfMapping
        // It seems to be embedded in a script tag, likely: <script type="fastboot/shoebox" id="shoebox-ember-data-store">
        // or similar. The snippet showed "shelfMapping":{...}, so it's a key in a larger object.

        // Iterate over all script tags to find the one containing "shelfMapping"
        const scriptTags = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) || [];
        console.log(`Found ${scriptTags.length} script tags`);

        let targetScriptContent = null;

        for (const tag of scriptTags) {
            if (tag.includes('shelfMapping')) {
                console.log('Found script tag containing shelfMapping');
                // Extract content inside <script>...</script>
                const contentMatch = tag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
                if (contentMatch) {
                    targetScriptContent = contentMatch[1];
                    // Try to print the opening tag to see ID/Type
                    const openTag = tag.match(/<script[^>]*>/i)[0];
                    console.log(`Script Tag: ${openTag}`);
                    break;
                }
            }
        }

        if (!targetScriptContent) {
            console.log('Could not find any script tag containing shelfMapping');
            return [];
        }

        let jsonData = null;
        try {
            jsonData = JSON.parse(targetScriptContent);
            console.log('Successfully parsed JSON from script tag');
        } catch (e) {
            console.log('Script content is not direct JSON. Attempting to extract JSON object...');
            // It might be `const data = {...}` or similar.
            // Let's try to find the first `{` and last `}`
            const firstBrace = targetScriptContent.indexOf('{');
            const lastBrace = targetScriptContent.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonString = targetScriptContent.substring(firstBrace, lastBrace + 1);
                try {
                    jsonData = JSON.parse(jsonString);
                    console.log('Successfully extracted and parsed JSON object');
                } catch (e2) {
                    console.log('Failed to parse extracted JSON string');
                }
            }
        }

        if (!jsonData) {
            console.log('Failed to extract valid JSON data');
            return [];
        }

        // Now traverse the JSON to find shelfMapping
        // The structure is usually: { "data": { "attributes": { "shelfMapping": ... } } } or similar
        // Or it might be a flat map of ID -> Object.
        // Let's search for the object that HAS `shelfMapping`.

        function findShelfMapping(obj) {
            if (!obj || typeof obj !== 'object') return null;
            if (obj.shelfMapping) return obj.shelfMapping;

            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    const result = findShelfMapping(obj[key]);
                    if (result) return result;
                }
            }
            return null;
        }

        const shelfMapping = findShelfMapping(jsonData);

        if (!shelfMapping) {
            console.log('Could not find shelfMapping in parsed JSON');
            return [];
        }

        console.log('Found shelfMapping object');
        console.log('shelfMapping keys:', Object.keys(shelfMapping));

        // Extract screenshots using user's logic
        const screenshots = [];

        const extractFromMedia = (mediaKey) => {
            const media = shelfMapping[mediaKey];
            if (media && media.items) {
                media.items.forEach(item => {
                    if (item.screenshot && item.screenshot.template && item.screenshot.width && item.screenshot.height) {
                        const { template, width, height } = item.screenshot;
                        const url = template
                            .replace('{w}', width)
                            .replace('{h}', height)
                            .replace('{c}', 'bb')
                            .replace('{f}', 'jpg'); // User used jpg, we can use webp if we want, but let's stick to user logic or high quality
                        screenshots.push(url);
                    }
                });
            }
        };

        // product_media_phone_ and product_media_pad_ keys might have suffixes or be exact.
        // The user code used "product_media_phone_" and "product_media_pad_".
        // Let's look for keys starting with these.

        Object.keys(shelfMapping).forEach(key => {
            if (key.startsWith('product_media_phone')) {
                console.log(`Found phone media key: ${key}`);
                extractFromMedia(key);
            }
            if (key.startsWith('product_media_pad')) {
                console.log(`Found pad media key: ${key}`);
                extractFromMedia(key);
            }
            if (key.startsWith('product_media_mac')) {
                console.log(`Found mac media key: ${key}`);
                extractFromMedia(key);
            }
        });

        console.log(`Extracted ${screenshots.length} screenshots from JSON`);
        screenshots.forEach((url, i) => console.log(`${i}: ${url}`));

        return screenshots;
    } catch (error) {
        console.error(`Error scraping screenshots for ${appId}:`, error);
        return [];
    }
}

// Test with one of the user's apps
// ShotFit: 6749874426
// Epub繁简通Pro: 6746181003
await fetchAppScreenshotsFromWeb(6749874426, 'cn');
