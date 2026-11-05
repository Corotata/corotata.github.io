// 隐私政策 / 技术支持页的内容。
// 隐私页按“数据去向”分五类，每类一个网址；技术支持全部 App 共用一页。
// 页面底部的图标取自 apps.json（每周自动同步），按下面每类的 appIds 过滤。
// 新 App：本地型不联网的，把 App Store ID 加进 local 的 appIds 即可；其他类同理。

export type LegalLang = 'en' | 'zh' | 'zh-TW';
export type LegalKind = 'local' | 'mt' | 'webparse' | 'tts' | 'weread';

export const CONTACT_EMAIL = 'myhdify@gmail.com';
export const LEGAL_UPDATED = '2026-11-05';
// 苹果标准 EULA（有订阅的 App 使用）
export const APPLE_EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export interface PrivacyPage {
    path: string; // 网址，如 /privacy/web-import
    kind: LegalKind;
    appIds: number[]; // 适用的 App Store ID
    titleKeywords?: string[]; // 还没有 ID 的新 App：上架后按商店标题关键字自动出现在图标里
}

export const PRIVACY_PAGES: PrivacyPage[] = [
    {
        path: '/privacy',
        kind: 'local',
        // TXT转EPUB、EPUB转文档、繁简通Pro、繁简通旧版、封面制作、心流方格、ShotFit、GridSplit、PicHD Plus、兜兜世界、Wasabi 50、DSearch、ScanWifi
        titleKeywords: ['ParcelSpot', 'OMG Camera', 'BookSend', 'EPUB OMG'], // 找快递、OMG 相机、BookSend、EPUB OMG（即将上架）
        appIds: [6751633451, 6799873889, 6746181003, 6514305385, 6759366987, 6755658248, 6749874426, 6741735460, 1370721516, 6760543478, 6742366538, 6746525636, 6746719522],
    },
    { path: '/privacy/translation', kind: 'mt', appIds: [6748774714, 6504551887, 6504154553] }, // EPUB翻译官、字幕翻译助手、本地化大师
    { path: '/privacy/web-import', kind: 'webparse', appIds: [6755611046, 6758496623] }, // Tanko、TinyDrawer
    { path: '/privacy/voice', kind: 'tts', appIds: [6754076767] }, // VoiceSmith
    { path: '/privacy/weread', kind: 'weread', appIds: [], titleKeywords: ['BookLines'] }, // BookLines（页念，即将上架；上架后确认商店标题关键字）
];

export const findPrivacyPage = (path: string) => PRIVACY_PAGES.find((p) => p.path === path);

export interface Section { title: string; body: string[] }

interface Copy {
    pageTitle: () => string;
    intro: () => string;
    updated: string;
    appsTitle: string;
    num: (i: number) => string;
    collectLocal: (app: string) => string[];
    collectNet: (app: string) => string[];
    netTitle: Record<Exclude<LegalKind, 'local'>, string>;
    net: Record<Exclude<LegalKind, 'local'>, string[]>;
    purchasesTitle: string;
    purchases: string[];
    feedbackTitle: string;
    feedback: string[];
    sharingTitle: string;
    sharing: string[];
    childrenTitle: string;
    children: string[];
    changesTitle: string;
    changes: string[];
}

const CN_NUM = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

export const PRIVACY: Record<LegalLang, Copy> = {
    en: {
        pageTitle: () => 'Privacy Policy',
        intro: () => 'This policy explains how the apps listed at the bottom of this page (by Corotata) handle your information.',
        updated: 'Last updated',
        appsTitle: 'Apps covered by this policy',
        num: (i) => `${i + 1}. `,
        collectLocal: (a) => [
            `We do not collect or store any personal information or usage data. ${a} works entirely on your device, and your files and content are never uploaded to us.`,
            'The App contains no advertising or analytics SDKs.',
            'If the App offers optional iCloud sync, enabling it stores the selected data in your own iCloud account. Apple handles that service; we cannot access your private iCloud database.',
        ],
        collectNet: (a) => [
            `We do not collect, store or have access to your personal information, content or usage data. ${a} has no account system and contains no advertising or analytics SDKs.`,
            'Content requests for online features go from your device to the services described below. App Store purchases, app information and support links may also require network access.',
        ],
        netTitle: {
            mt: 'Translation services (third parties)',
            webparse: 'Web page import',
            tts: 'Speech service (third party)',
            weread: 'Where your data is stored',
        },
        net: {
            mt: [
                'Translation requires sending the text being translated to the translation service you choose. This is the only case in which book text leaves your device:',
                '• Google Translate and Microsoft Edge Translator: the text of the chapters being translated, with the source and target language, is sent to Google or Microsoft servers. Their handling is governed by their own privacy policies.',
                '• AI translation services (for example OpenAI, Anthropic, DeepSeek, Google Gemini, or a compatible endpoint you enter yourself): the text is sent directly from your device to the provider you configured, using your own API key.',
                'Your API keys are stored only on your device and are sent only to the provider you configured. We never receive them. Please review the privacy policy and terms of the provider you choose.',
                'If you do not want any text to leave your device, do not use the translation features.',
            ],
            webparse: [
                'When you enter or paste a web page address to import images or content, your device requests that page directly from the website itself (for example ArtStation or Bilibili), as a browser would. That website can see your IP address and the request, under its own privacy policy.',
                'The addresses you enter and the content fetched are processed on your device and are not sent to us.',
                'TinyDrawer also offers online translation. When you use it, the selected text is sent to Microsoft Edge Translator. If you run an AI task through a configured shortcut, the task content is passed to that shortcut and any service it uses; review the shortcut before running it.',
                'In apps that offer optional iCloud sync, enabling it stores selected data in your own iCloud account. We cannot access your private iCloud database.',
                'If you do not want to contact any website, import only local files.',
            ],
            tts: [
                'To generate speech with online voices, the text you want to read aloud is sent to Microsoft\'s online speech service, and the resulting audio is returned to your device. Handling is governed by Microsoft\'s privacy policy.',
                'If you do not want any text to leave your device, do not use online voices.',
            ],
            weread: [
                'All of your data is stored only on your own device. If you turn on iCloud sync, it is stored only in your own iCloud account, which we cannot access.',
                'We do not collect any of your data.',
            ],
        },
        purchasesTitle: 'Purchases and subscriptions',
        purchases: ['Paid features and subscriptions are processed by Apple through the App Store. We do not receive or store your payment details. Subscriptions are governed by Apple\'s standard license agreement (Apple Standard EULA).'],
        feedbackTitle: 'Feedback emails',
        feedback: ['If you choose to send feedback from the App, it opens a draft in your mail app that you can review before sending. We receive it only if you send it, and use it only to reply and fix problems.'],
        sharingTitle: 'Sharing and legal requirements',
        sharing: ['We do not sell or share your data, and since we do not hold your data there is nothing for us to disclose. We may respond to valid legal requests where required by law.'],
        childrenTitle: 'Children',
        children: ['The App does not knowingly collect any information from children.'],
        changesTitle: 'Changes and contact',
        changes: ['We may update this policy and will publish the new version on this page with a new date. Questions are welcome.', `Contact: ${CONTACT_EMAIL}`],
    },
    zh: {
        pageTitle: () => '隐私政策',
        intro: () => '本政策说明本页底部列出的应用（由 Corotata 开发）如何处理你的信息。',
        updated: '最后更新',
        appsTitle: '适用本政策的应用',
        num: (i) => `${CN_NUM[i]}、`,
        collectLocal: (a) => [
            `我们不收集、不存储任何个人信息或使用数据。${a}完全在你的设备上运行，你的文件和内容不会上传给我们。`,
            '本应用不含任何广告或统计 SDK。',
            '如应用提供可选的 iCloud 同步，开启后所选数据会保存在你自己的 iCloud 账户中，由 Apple 提供服务，我们无法访问你的私人 iCloud 数据库。',
        ],
        collectNet: (a) => [
            `我们不收集、不存储、也无法访问你的个人信息、内容或使用数据。${a}没有账号体系，也不含任何广告或统计 SDK。`,
            '在线功能的内容请求由你的设备发往下文说明的服务。App Store 购买、应用信息和支持链接也可能需要网络连接。',
        ],
        netTitle: {
            mt: '翻译服务（第三方）',
            webparse: '网页导入',
            tts: '语音服务（第三方）',
            weread: '数据保存在哪里',
        },
        net: {
            mt: [
                '翻译需要把待翻译的文字发送到你选择的翻译服务，这是书籍文字离开设备的唯一情形：',
                '• Google 翻译、Microsoft Edge 翻译：正在翻译的章节文字及源语言、目标语言会发送到 Google 或 Microsoft 的服务器，由其各自的隐私政策约束。',
                '• AI 翻译服务（例如 OpenAI、Anthropic、DeepSeek、Google Gemini，或你自行填写的兼容接口）：文字由你的设备直接发往你配置的服务商，使用你自己的 API Key。',
                '你的 API Key 只保存在本机，只会发送给你配置的服务商，我们不会收到。请自行了解所选服务商的隐私政策与条款。',
                '如果不希望任何文字离开设备，请不要使用翻译功能。',
            ],
            webparse: [
                '当你输入或粘贴网页地址来导入图片或内容时，你的设备会像浏览器一样直接向该网站（例如 ArtStation、哔哩哔哩）请求页面。该网站会看到你的 IP 地址和这次请求，并由其自己的隐私政策约束。',
                '你输入的地址和抓取到的内容都在你的设备上处理，不会发送给我们。',
                'TinyDrawer 还提供在线翻译：使用时，所选文字会发送到 Microsoft Edge 翻译服务。如你通过已配置的快捷指令执行 AI 任务，任务内容会交给该快捷指令及其使用的服务；运行前请检查快捷指令的处理方式。',
                '如应用提供可选的 iCloud 同步，开启后所选数据会保存在你自己的 iCloud 账户中，我们无法访问你的私人 iCloud 数据库。',
                '如果不希望访问任何网站，请只导入本地文件。',
            ],
            tts: [
                '使用在线语音生成声音时，你要朗读的文字会发送到 Microsoft 的在线语音服务，生成的音频再返回到你的设备，由 Microsoft 的隐私政策约束。',
                '如果不希望任何文字离开设备，请不要使用在线语音。',
            ],
            weread: [
                '你的所有数据都只保存在你自己的设备上。如果你开启了 iCloud 同步，也只会保存在你自己的 iCloud 账户里，我们无法访问。',
                '我们不会收集你的任何数据。',
            ],
        },
        purchasesTitle: '购买与订阅',
        purchases: ['付费功能和订阅由 Apple 通过 App Store 处理，我们不会收到或保存你的支付信息。订阅适用苹果标准许可协议（Apple Standard EULA）。'],
        feedbackTitle: '反馈邮件',
        feedback: ['你在应用内选择“反馈”时，会打开邮件应用生成一封草稿，发送前你可以检查内容。只有你点击发送，我们才会收到，并且只用于回复你和修复问题。'],
        sharingTitle: '信息共享与法律要求',
        sharing: ['我们不出售、也不共享你的数据。由于我们并不持有你的数据，也就没有可披露的内容。法律有明确要求时，我们可能依法响应有效的请求。'],
        childrenTitle: '儿童',
        children: ['本应用不会有意收集儿童的任何信息。'],
        changesTitle: '政策更新与联系',
        changes: ['我们可能更新本政策，新版本会发布在本页并标注新的日期。有任何问题，欢迎联系我们。', `联系邮箱：${CONTACT_EMAIL}`],
    },
    'zh-TW': {
        pageTitle: () => '隱私權政策',
        intro: () => '本政策說明本頁底部列出的應用程式（由 Corotata 開發）如何處理你的資訊。',
        updated: '最後更新',
        appsTitle: '適用本政策的應用程式',
        num: (i) => `${CN_NUM[i]}、`,
        collectLocal: (a) => [
            `我們不蒐集、不儲存任何個人資訊或使用資料。${a}完全在你的裝置上執行，你的檔案和內容不會上傳給我們。`,
            '本應用程式不含任何廣告或統計 SDK。',
            '如應用程式提供選用的 iCloud 同步，開啟後所選資料會保存在你自己的 iCloud 帳戶中，由 Apple 提供服務，我們無法存取你的私人 iCloud 資料庫。',
        ],
        collectNet: (a) => [
            `我們不蒐集、不儲存，也無法存取你的個人資訊、內容或使用資料。${a}沒有帳號系統，也不含任何廣告或統計 SDK。`,
            '線上功能的內容請求由你的裝置傳送到下文說明的服務。App Store 購買、應用程式資訊和支援連結也可能需要網路連線。',
        ],
        netTitle: {
            mt: '翻譯服務（第三方）',
            webparse: '網頁匯入',
            tts: '語音服務（第三方）',
            weread: '資料保存在哪裡',
        },
        net: {
            mt: [
                '翻譯需要將待翻譯的文字傳送到你選擇的翻譯服務，這是書籍文字離開裝置的唯一情形：',
                '• Google 翻譯、Microsoft Edge 翻譯：正在翻譯的章節文字及來源語言、目標語言會傳送到 Google 或 Microsoft 的伺服器，由其各自的隱私權政策規範。',
                '• AI 翻譯服務（例如 OpenAI、Anthropic、DeepSeek、Google Gemini，或你自行填寫的相容介面）：文字由你的裝置直接傳送給你設定的服務商，使用你自己的 API Key。',
                '你的 API Key 只保存在本機，只會傳送給你設定的服務商，我們不會收到。請自行了解所選服務商的隱私權政策與條款。',
                '如果不希望任何文字離開裝置，請不要使用翻譯功能。',
            ],
            webparse: [
                '當你輸入或貼上網頁網址來匯入圖片或內容時，你的裝置會像瀏覽器一樣直接向該網站（例如 ArtStation、嗶哩嗶哩）請求頁面。該網站會看到你的 IP 位址和這次請求，並由其自己的隱私權政策規範。',
                '你輸入的網址和擷取到的內容都在你的裝置上處理，不會傳送給我們。',
                'TinyDrawer 也提供線上翻譯：使用時，所選文字會傳送到 Microsoft Edge 翻譯服務。如你透過已設定的捷徑執行 AI 任務，任務內容會交給該捷徑及其使用的服務；執行前請檢查捷徑的處理方式。',
                '如應用程式提供選用的 iCloud 同步，開啟後所選資料會保存在你自己的 iCloud 帳戶中，我們無法存取你的私人 iCloud 資料庫。',
                '如果不希望連線任何網站，請只匯入本機檔案。',
            ],
            tts: [
                '使用線上語音產生聲音時，你要朗讀的文字會傳送到 Microsoft 的線上語音服務，產生的音訊再回傳到你的裝置，由 Microsoft 的隱私權政策規範。',
                '如果不希望任何文字離開裝置，請不要使用線上語音。',
            ],
            weread: [
                '你的所有資料都只保存在你自己的裝置上。如果你開啟了 iCloud 同步，也只會保存在你自己的 iCloud 帳戶裡，我們無法存取。',
                '我們不會蒐集你的任何資料。',
            ],
        },
        purchasesTitle: '購買與訂閱',
        purchases: ['付費功能和訂閱由 Apple 透過 App Store 處理，我們不會收到或保存你的付款資訊。訂閱適用蘋果標準授權協議（Apple Standard EULA）。'],
        feedbackTitle: '意見回饋郵件',
        feedback: ['你在應用程式內選擇「回饋」時，會開啟郵件程式產生一封草稿，寄出前你可以檢查內容。只有你按下寄出，我們才會收到，並且只用於回覆你和修正問題。'],
        sharingTitle: '資訊共享與法律要求',
        sharing: ['我們不出售、也不共享你的資料。由於我們並不持有你的資料，也就沒有可揭露的內容。法律有明確要求時，我們可能依法回應有效的請求。'],
        childrenTitle: '兒童',
        children: ['本應用程式不會刻意蒐集兒童的任何資訊。'],
        changesTitle: '政策更新與聯絡',
        changes: ['我們可能更新本政策，新版本會發布在本頁並標註新的日期。有任何問題，歡迎聯絡我們。', `聯絡信箱：${CONTACT_EMAIL}`],
    },
};

/** 按 App 类型组装并自动编号的隐私政策段落 */
export const buildPrivacySections = (lang: LegalLang, kind: LegalKind): Section[] => {
    const c = PRIVACY[lang];
    const name = lang === 'en' ? 'the App' : lang === 'zh' ? '本应用' : '本應用程式';
    const raw: Section[] = [];
    raw.push({
        title: lang === 'en' ? 'Information we collect' : lang === 'zh' ? '我们收集的信息' : '我們蒐集的資訊',
        body: kind === 'local' || kind === 'weread' ? c.collectLocal(name) : c.collectNet(name),
    });
    if (kind !== 'local') raw.push({ title: c.netTitle[kind], body: c.net[kind] });
    raw.push({ title: c.purchasesTitle, body: c.purchases });
    raw.push({ title: c.feedbackTitle, body: c.feedback });
    raw.push({ title: c.sharingTitle, body: c.sharing });
    raw.push({ title: c.childrenTitle, body: c.children });
    raw.push({ title: c.changesTitle, body: c.changes });
    return raw.map((s, i) => ({ ...s, title: `${c.num(i)}${s.title}` }));
};

interface SupportCopy {
    pageTitle: (app: string) => string;
    intro: string;
    contactTitle: string;
    contactBody: string;
    /** 社交平台联系入口的本地化名称。 */
    socialLabels: [string];
    tipsTitle: string;
    tips: string[];
    linksTitle: string;
    privacy: string;
    eula: string;
    appStore: string;
    all: string;
}

export const SUPPORT: Record<LegalLang, SupportCopy> = {
    en: {
        pageTitle: (a) => `${a} Support`,
        intro: 'Having trouble or have a suggestion? Contact us by email or Xiaohongshu.',
        contactTitle: 'Contact us',
        contactBody: 'Recommended: use Feedback in the app to send an email with app and device details, reducing what you need to type. You can also contact us on Xiaohongshu. Please contact us before sharing files.',
        socialLabels: ['Xiaohongshu'],
        tipsTitle: 'To help us solve it faster, please include',
        tips: ['The App name and version (Settings or the App Store page)', 'Your device model and system version', 'What you did, what you expected and what happened (a screenshot helps)'],
        linksTitle: 'Related',
        privacy: 'Privacy Policy',
        eula: 'Terms of Use (Apple Standard EULA)',
        appStore: 'View on the App Store',
        all: 'Support',
    },
    zh: {
        pageTitle: (a) => `${a} 技术支持`,
        intro: '遇到问题或有建议？可以通过邮件或小红书联系我们。',
        contactTitle: '联系我们',
        contactBody: '推荐通过 App 内的“用户反馈”发送邮件，可附带应用和设备信息，减少手动填写。也可以通过小红书联系我们。如需提供文件排查，请先联系确认发送方式，较大文件可通过网盘链接提供。',
        socialLabels: ['小红书主页'],
        tipsTitle: '为了更快解决问题，请提供',
        tips: ['应用名称和版本号（设置页或 App Store 页面可查看）', '设备型号和系统版本', '你的操作步骤、预期结果和实际情况（附截图更好）'],
        linksTitle: '相关链接',
        privacy: '隐私政策',
        eula: '使用条款（苹果标准 EULA）',
        appStore: '在 App Store 查看',
        all: '技术支持',
    },
    'zh-TW': {
        pageTitle: (a) => `${a} 技術支援`,
        intro: '遇到問題或有建議？可以透過電子郵件或小紅書聯絡我們。',
        contactTitle: '聯絡我們',
        contactBody: '建議透過 App 內的「使用者回饋」傳送電子郵件，可附帶應用程式與裝置資訊，減少手動填寫。也可以透過小紅書聯絡我們。如需提供檔案，請先聯絡確認傳送方式，較大檔案可透過網盤連結提供。',
        socialLabels: ['小紅書主頁'],
        tipsTitle: '為了更快解決問題，請提供',
        tips: ['應用程式名稱和版本號（設定頁或 App Store 頁面可查看）', '裝置型號和系統版本', '你的操作步驟、預期結果和實際情況（附截圖更好）'],
        linksTitle: '相關連結',
        privacy: '隱私權政策',
        eula: '使用條款（蘋果標準 EULA）',
        appStore: '在 App Store 查看',
        all: '技術支援',
    },
};
