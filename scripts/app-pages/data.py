"""手写部分：短名、截图 alt、常见问题、相关 App、隐私链接。
语言键：hans=简体、hant=繁体（台湾用词）、en=英文。
常见问题的答案只取自商店文案；alt 只描述截图里实际看得到的内容。"""

SHORT = {
    "epub-omg": {"hans": "EPUB OMG", "hant": "EPUB OMG", "en": "EPUB OMG"},
    "epub-converter": {"hans": "EPUB转文档", "hant": "EPUB轉文件", "en": "EPUB Converter"},
    "txt-to-epub": {"hans": "TXT转EPUB", "hant": "TXT轉EPUB", "en": "TXT to EPUB"},
    "epub-translator": {"hans": "EPUB翻译官", "hant": "EPUB翻譯官", "en": "EPUB Translator"},
    "epub-cover-maker": {"hans": "EPUB封面制作", "hant": "EPUB封面製作", "en": "EPUB Cover Maker"},
    "fan-jian-tong": {"hans": "Epub繁简通Pro", "hant": "Epub繁簡通Pro", "en": "Epub繁简通Pro"},
    "booksend": {"hans": "BookSend", "hant": "BookSend", "en": "BookSend"},
    "tanko": {"hans": "Tanko", "hant": "Tanko", "en": "Tanko"},
}

# 平台行：商店文案明确写了 Mac 的才加 Mac
PLATFORM = {
    "epub-translator": "iPhone / iPad / Mac",
    "epub-cover-maker": "iPhone / iPad / Mac",
}
DEFAULT_PLATFORM = "iPhone / iPad"

PRIVACY_PATH = {"epub-translator": "/privacy/translation", "tanko": "/privacy/web-import"}

RELATED = {
    "epub-omg": ["txt-to-epub", "epub-cover-maker", "epub-translator"],
    "epub-converter": ["epub-omg", "epub-translator", "fan-jian-tong"],
    "txt-to-epub": ["epub-omg", "booksend", "epub-cover-maker"],
    "epub-translator": ["epub-omg", "txt-to-epub", "booksend"],
    "epub-cover-maker": ["epub-omg", "booksend", "epub-converter"],
    "fan-jian-tong": ["epub-omg", "txt-to-epub", "epub-translator"],
    "booksend": ["txt-to-epub", "epub-cover-maker", "epub-omg"],
    "tanko": ["epub-omg", "epub-cover-maker", "booksend"],
}

# 每个 App 每张截图的 alt：(简体, 繁体, 英文)，顺序与 manifest 里的截图一致
ALT = {
    "epub-omg": [
        ("EPUB OMG 阅读预览：海边灯塔封面插图，章节标题“退潮后的第一封信”",
         "EPUB OMG 閱讀預覽：海邊燈塔封面插圖與章節標題",
         "EPUB OMG reading preview with a lighthouse cover illustration and a chapter title"),
        ("章节与目录管理：书籍目录带勾选框，可选择导出范围",
         "章節與目錄管理：書籍目錄附勾選框，可選擇匯出範圍",
         "Chapter and table-of-contents manager with checkboxes to choose what to export"),
        ("在预览中选中一段文字，弹出精排、插入精排、插图、格式等菜单",
         "在預覽中選取一段文字，彈出精排、插入精排、插圖、格式等選單",
         "Selecting a passage in the preview opens a menu for styling, illustrations and formatting"),
        ("聊天气泡排版：人物对话以左右气泡呈现，并附引用与注释卡片",
         "聊天氣泡排版：人物對話以左右氣泡呈現，並附引用與註解卡片",
         "Chat-bubble layout showing character dialogue, with quote and note cards"),
        ("章节首图设置：为章节选择首图，底部有主题、版式、边缘、图片选项",
         "章節首圖設定：為章節選擇首圖，底部有主題、版式、邊緣、圖片選項",
         "Chapter-opening image settings with theme, layout, edge and image options"),
    ],
    "epub-converter": [
        ("选择输出格式：Word、PDF、TXT、Markdown 四种可选",
         "選擇輸出格式：Word、PDF、TXT、Markdown 四種可選",
         "Choosing an output format: Word, PDF, TXT or Markdown"),
        ("Markdown 转换完成，并列出 9 张可批量保存的书内图片",
         "Markdown 轉換完成，並列出 9 張可批次儲存的書內圖片",
         "Markdown conversion finished, listing 9 book images that can be saved in bulk"),
        ("Markdown 预览：保留章节标题、正文与插图",
         "Markdown 預覽：保留章節標題、內文與插圖",
         "Markdown preview keeping the chapter heading, text and illustration"),
        ("图片资源页：浏览 EPUB 内的 9 张封面与插图，可批量保存",
         "圖片資源頁：瀏覽 EPUB 內的 9 張封面與插圖，可批次儲存",
         "Image page showing 9 covers and illustrations from an EPUB, with bulk save"),
        ("Word 转换完成，生成可继续编辑的 DOCX 文档",
         "Word 轉換完成，產生可繼續編輯的 DOCX 文件",
         "Word conversion finished, producing an editable DOCX file"),
    ],
    "txt-to-epub": [
        ("把 TXT 文件做成 EPUB：书籍排版预览，含章节标题与插图",
         "把 TXT 檔案做成 EPUB：書籍排版預覽，含章節標題與插圖",
         "Preview of a TXT novel turned into an EPUB, with a chapter title and illustration"),
        ("自动识别章节后生成的书籍目录，可勾选导出范围",
         "自動辨識章節後產生的書籍目錄，可勾選匯出範圍",
         "Table of contents generated from detected chapters, with checkboxes for export"),
        ("聊天气泡排版：把人物对话排成左右气泡",
         "聊天氣泡排版：把人物對話排成左右氣泡",
         "Chat-bubble layout turning character dialogue into left and right bubbles"),
        ("选中一段文字，弹出精排菜单，可换上喜欢的样式",
         "選取一段文字，彈出精排選單，可換上喜歡的樣式",
         "Selecting a passage opens a styling menu to change its look"),
        ("章首插图设置：自选图片，搭配版式与边缘效果",
         "章首插圖設定：自選圖片，搭配版式與邊緣效果",
         "Chapter-opening image settings with layout and edge effects"),
    ],
    "epub-translator": [
        ("导出预览：《傲慢与偏见》第一章的原文与译文逐段对照",
         "匯出預覽：《傲慢與偏見》第一章的原文與譯文逐段對照",
         "Export preview of Pride and Prejudice chapter one with original and translation paragraph by paragraph"),
        ("竖排导出预览：可切换仅译文、原文在前、译文在前，并选择横排或竖排",
         "直排匯出預覽：可切換僅譯文、原文在前、譯文在前，並選擇橫排或直排",
         "Vertical-text export preview with options for translation only, original first or translation first"),
        ("译文检查：逐段对照原文与译文，点一下即可修改",
         "譯文檢查：逐段對照原文與譯文，點一下即可修改",
         "Translation review showing original and translated paragraphs, tap to edit"),
        ("试译效果：用所选 AI 服务先翻译一小段，满意再翻整本",
         "試譯效果：用所選 AI 服務先翻譯一小段，滿意再翻整本",
         "Trial translation of a short passage with the chosen AI service before translating the whole book"),
        ("整本翻译进度：已完成 63/95 段，可暂停或查看译文",
         "整本翻譯進度：已完成 63/95 段，可暫停或查看譯文",
         "Whole-book translation progress at 66 percent, 63 of 95 segments done, with pause and view buttons"),
    ],
    "epub-cover-maker": [
        ("编辑 EPUB 页面：从相册、书内插图或模板生成封面，可调整比例",
         "編輯 EPUB 頁面：從相簿、書內插圖或範本產生封面，可調整比例",
         "EPUB editing screen with cover options from photos, in-book images or templates, and an aspect ratio setting"),
        ("封面模板选择页：多款无图排版模板",
         "封面範本選擇頁：多款無圖排版範本",
         "Cover template picker with several typographic designs"),
        ("书籍信息编辑：书名、作者、出版社、丛书、卷号与简介，含竖排横排设置",
         "書籍資訊編輯：書名、作者、出版社、叢書、卷號與簡介，含直排橫排設定",
         "Metadata editor for title, author, publisher, series, volume and description, with text direction settings"),
        ("发送到 Kindle 页面：Kindle 邮箱与本地 Wi-Fi 传输两种方式",
         "傳送到 Kindle 頁面：Kindle 電子信箱與本機 Wi-Fi 傳輸兩種方式",
         "Send-to-Kindle screen with Kindle email and local Wi-Fi transfer tabs"),
        ("导出 EPUB 页面：保存到文件，或通过 Wi-Fi 本地传输",
         "匯出 EPUB 頁面：儲存到檔案，或透過 Wi-Fi 本機傳輸",
         "Export screen offering save to Files or local Wi-Fi transfer"),
    ],
    "fan-jian-tong": [
        ("导入页面：点击选择文件或从其他应用导入，支持 epub、txt、md、srt、docx、pptx、xlsx",
         "匯入頁面：點擊選擇檔案或從其他 App 匯入，支援 epub、txt、md、srt、docx、pptx、xlsx",
         "Import screen for epub, txt, md, srt, docx, pptx and xlsx files"),
        ("文本转换：输入一首诗，下方即时显示简体转繁体的结果",
         "文字轉換：輸入一首詩，下方即時顯示簡體轉繁體的結果",
         "Text conversion screen showing Simplified to Traditional Chinese results instantly"),
    ],
    "booksend": [
        ("BookSend 书架：书籍封面网格，底部显示无线书库地址",
         "BookSend 書庫：書籍封面網格，底部顯示無線書庫網址",
         "BookSend shelf showing a grid of book covers and the wireless library address"),
        ("无线书库：显示要在 Kindle 浏览器打开的地址，可开启导入后自动转换",
         "無線書庫：顯示要在 Kindle 瀏覽器開啟的網址，可開啟匯入後自動轉檔",
         "Wireless Library screen with the address to open in the Kindle browser and an auto-convert switch"),
        ("封面编辑：用模板生成、相册选择或导入图片",
         "封面編輯：使用範本產生、相簿選擇或匯入圖片",
         "Cover editor with template, photo library and import options"),
        ("排版切换：竖排预览中文书，可选原书、横排或竖排",
         "排版切換：直排預覽中文書，可選原書、橫排或直排",
         "Layout switcher previewing a Chinese book in vertical text, with original, horizontal and vertical options"),
        ("书籍信息编辑：书名、作者、语言、出版社与简介",
         "書籍資訊編輯：書名、作者、語言、出版社與簡介",
         "Book details editor for title, author, language, publisher and description"),
    ],
    "tanko": [
        ("我的图书馆：书架里的作品封面，右下角可新建或打开内置浏览器",
         "我的圖書館：書架裡的作品封面，右下角可新增或開啟內建瀏覽器",
         "My Library with project covers and buttons to add a project or open the built-in browser"),
        ("编排页面：以网格排列漫画页面，可拖拽排序",
         "編排頁面：以網格排列漫畫頁面，可拖曳排序",
         "Page grid of a comic volume, ready for drag-and-drop ordering"),
        ("阅读器：全屏显示漫画页面，支持日漫模式",
         "閱讀器：全螢幕顯示漫畫頁面，支援日漫模式",
         "Full-screen comic reader with manga mode"),
        ("导出电子书：选择 EPUB 或 PDF，并设置标题、作者、语言与阅读版面",
         "匯出電子書：選擇 EPUB 或 PDF，並設定標題、作者、語言與閱讀版面",
         "Export screen to choose EPUB or PDF and set title, author, language and reading layout"),
        ("内置浏览器：输入网址后加载网页，收集网络图片",
         "內建瀏覽器：輸入網址後載入網頁，收集網路圖片",
         "Built-in browser for collecting images from web pages"),
    ],
}

# 手写常见问题（答案只取自商店文案）。BookSend、EPUB封面制作 用商店文案里自带的问答，不在这里。
FAQ = {
    "epub-omg": {
        "hans": [
            ("EPUB OMG 能做什么？", "导入已有 EPUB，修改正文与目录，重新设计封面和章节样式，预览后导出新的 EPUB。"),
            ("手里的小说是 TXT，怎么办？", "可以在 App Store 搜索同一开发者的「TXT转EPUB」，先把 TXT 小说整理为 EPUB。EPUB OMG 主要用于导入和继续编辑已有 EPUB。"),
            ("编辑好的书可以传到 Kindle 吗？", "完成编辑后可预览、生成并保存新的 EPUB，也可以通过分享或 Kindle 邮箱传输。Kindle 邮箱传输需要配置接收邮箱及系统邮件账户；送达取决于相关服务，不同阅读器对排版样式的支持可能有所不同。"),
            ("需要付费吗？", "应用包含 App 内购买，具体方案与权益以应用内购买页为准；订阅可在 Apple 账户设置中管理。"),
        ],
        "hant": [
            ("EPUB OMG 能做什麼？", "匯入現有的 EPUB，修改內文與目錄，重新設計封面和章節樣式，預覽後匯出新的 EPUB。"),
            ("手上的小說是 TXT，怎麼辦？", "可在 App Store 搜尋同一開發者的「TXT轉EPUB」，先將 TXT 小說整理成 EPUB。EPUB OMG 主要用來匯入並繼續編輯現有 EPUB。"),
            ("編輯好的書可以傳到 Kindle 嗎？", "完成編輯後可預覽、產生並儲存新的 EPUB，也可以透過分享或 Kindle 電子郵件傳送。Kindle 傳書需要設定接收信箱與系統郵件帳號；送達情況取決於相關服務，不同閱讀器對排版樣式的支援可能有所差異。"),
            ("需要付費嗎？", "App 包含 App 內購買項目，方案與權益以 App 內購買頁面為準；訂閱可在 Apple 帳號設定中管理。"),
        ],
        "en": [
            ("What can EPUB OMG do?", "Import an existing EPUB, update its text and table of contents, redesign covers and chapter styles, preview your changes and export a new EPUB."),
            ("What if my novel is a TXT file?", "Our companion app, TXT to EPUB, helps turn TXT novels into EPUB files. EPUB OMG focuses on importing and editing existing EPUBs."),
            ("Can I send the edited book to my Kindle?", "You can generate and save the new EPUB, share it, or send it to a Kindle email address. Email transfer requires a receiving address and an account configured in the system Mail app. Delivery depends on the services involved, and layout support varies between reading apps."),
            ("Is EPUB OMG free?", "It includes in-app purchases. See the purchase screen for available plans and features. Manage subscriptions in your Apple Account settings."),
        ],
    },
    "epub-converter": {
        "hans": [
            ("可以转换成哪些格式？", "可将无 DRM 的 EPUB 转换为 Word、PDF、TXT 和 Markdown。Markdown 还可额外导出包含 Markdown 与图片资源的 ZIP 资源包。"),
            ("电子书会上传到服务器吗？", "不会。EPUB 解析与文档生成均在设备本机完成，不需要上传电子书内容。"),
            ("能转换受 DRM 保护的电子书吗？", "不能。本应用不支持受 DRM 保护的电子书，也不保证完整保留原 EPUB 的字体、CSS 或复杂版面；转换结果取决于来源 EPUB 的结构与内容。"),
            ("可以免费使用吗？", "每位新用户可免费完成 3 次成功转换。升级 EPUB Converter Pro 后，可解锁无限导出。"),
        ],
        "hant": [
            ("可以轉換成哪些格式？", "可將無 DRM 的 EPUB 檔案轉換為 Word、PDF、TXT 和 Markdown。Markdown 還可額外匯出包含 Markdown 與圖片資源的 ZIP 資源包。"),
            ("電子書會上傳到伺服器嗎？", "不會。EPUB 解析與文件產生均在裝置本機完成，不需要上傳電子書內容。"),
            ("能轉換受 DRM 保護的電子書嗎？", "不能。本應用程式不支援受 DRM 保護的電子書，也不保證完整保留原 EPUB 的字型、CSS 或複雜版面；轉換結果取決於來源 EPUB 的結構與內容。"),
            ("可以免費使用嗎？", "每位新使用者可免費完成 3 次成功轉換。升級 EPUB Converter Pro 後，可解鎖無限匯出。"),
        ],
        "en": [
            ("Which formats can it convert to?", "EPUB Converter turns DRM-free EPUB files into Word, PDF, TXT and Markdown. Markdown can also be exported as a ZIP package with images."),
            ("Are my ebooks uploaded to a server?", "No. EPUB parsing and file generation happen on your device, so book content is not uploaded."),
            ("Can it convert DRM-protected books?", "No. DRM-protected ebooks are not supported, and the original fonts, CSS or complex layouts are not guaranteed to be preserved. Results depend on the structure of the source EPUB."),
            ("Is it free to use?", "Every new user can complete 3 successful conversions for free. Upgrading to EPUB Converter Pro unlocks unlimited exports."),
        ],
    },
    "txt-to-epub": {
        "hans": [
            ("Apple Books 能直接读 TXT 吗？", "不能直接读。TXT 小说通常缺少阅读器可识别的结构化目录，导入后难以跳转。TXT转EPUB 会自动识别章节标题并分章，生成可跳转的目录，输出标准 EPUB，方便导入 Apple Books、Kindle 和其他阅读器。"),
            ("TXT 乱码能修复吗？", "支持乱码修复与常见编码文本的处理，减少编码差异带来的阅读问题。"),
            ("能做封面和排版吗？", "内置 39 套封面模板，也可自定义 AI 生成封面图；提供多种横排、竖排版式和 8 套阅读主题，并支持章节头图、简繁互转与 Kindle 传书。"),
            ("文件会上传吗？", "TXT转EPUB 以本地转换为主，兼顾稳定性与隐私。"),
        ],
        "hant": [
            ("Apple Books 能直接讀 TXT 嗎？", "不能直接讀。TXT 小說通常缺少閱讀器可識別的結構化目錄，導入後難以跳轉。TXT转EPUB 會自動識別章節標題並分章，生成可跳轉的目錄，輸出標準 EPUB，方便導入 Apple Books、Kindle 和其他閱讀器。"),
            ("TXT 亂碼能修復嗎？", "支援亂碼修復與常見編碼文本的處理，減少編碼差異帶來的閱讀問題。"),
            ("能製作封面和排版嗎？", "內建 39 套封面模板，也可自訂 AI 生成封面圖；提供多種橫排、豎排版式和 8 套閱讀主題，並支援章節頭圖、簡繁互轉與 Kindle 傳書。"),
            ("檔案會上傳嗎？", "TXT转EPUB 以本地轉換為主，兼顧穩定性與隱私。"),
        ],
        "en": [
            ("Can Apple Books read TXT files directly?", "No. TXT novels usually lack a structured table of contents that reading apps can recognize. TXT to EPUB detects chapter titles, splits chapters, builds a navigable table of contents and exports a standard EPUB for Apple Books, Kindle and other readers."),
            ("Can it fix garbled TXT text?", "Yes. It repairs garbled text and handles common encoding differences."),
            ("Can I add a cover and adjust the layout?", "Yes. Choose from 39 cover templates or create a custom AI-generated cover, pick horizontal or vertical layouts and one of 8 reading themes, add chapter-opening images, convert between Simplified and Traditional Chinese and send the book to Kindle."),
            ("Are my files uploaded?", "Conversion is mainly done locally, for stability and privacy."),
        ],
    },
    "epub-translator": {
        "hans": [
            ("能翻译 PDF 吗？", "不能。支持无 DRM 的 EPUB 文件，不支持 PDF。"),
            ("用什么翻译服务？", "可使用 Google、Microsoft Edge，或填入自己 API Key 的 AI 翻译服务。翻译需要联网；AI 服务需要你自己的 API Key，译文质量取决于所选的翻译服务。"),
            ("翻译后得到什么？", "导出一本新的 EPUB：原文和译文逐段对照的双语版（原文+译文或译文+原文），或只有译文的版本。可保留原书排版，也可改为横排或竖排。"),
            ("支持哪些设备？", "iPhone、iPad 和 Mac 都能用。"),
        ],
        "hant": [
            ("能翻譯 PDF 嗎？", "不能。支援無 DRM 的 EPUB 檔案，不支援 PDF。"),
            ("使用哪些翻譯服務？", "可使用 Google、Microsoft Edge，或填入自己 API Key 的 AI 翻譯服務。翻譯需要連網；AI 服務需要你自己的 API Key，譯文品質取決於所選的翻譯服務。"),
            ("翻譯後會得到什麼？", "匯出新的 EPUB：原文和譯文逐段對照的雙語版（原文+譯文或譯文+原文），或只有譯文的版本。可保留原書排版，也可改為橫排或直排。"),
            ("支援哪些裝置？", "iPhone、iPad、Mac 都能用。"),
        ],
        "en": [
            ("Can it translate PDF files?", "No. It supports DRM-free EPUB files, not PDF."),
            ("Which translation services can I use?", "Google, Microsoft Edge, or an AI translation service with your own API key. Translation requires an internet connection, and translation quality depends on the service you choose."),
            ("What do I get after translating?", "A new EPUB: a bilingual edition with original and translation side by side paragraph by paragraph, or a translation-only edition. You can keep the original layout or switch to horizontal or vertical text."),
            ("Which devices does it run on?", "iPhone, iPad and Mac."),
        ],
    },
    "fan-jian-tong": {
        "hans": [
            ("支持哪些文件格式？", "支持 EPUB、TXT、MD、SRT，以及 Word、Excel、PPT（DOCX、XLSX、PPTX）文件的简体转繁体与繁体转简体。"),
            ("能按台湾、香港的用语转换吗？", "可以。支持通用、台湾、香港等不同转换方案，地区词汇与用语处理更贴近真实阅读习惯。"),
            ("文件会上传吗？", "不会。所有转换都在本机完成，文件不会上传。"),
            ("能把横排 EPUB 转成竖排吗？", "支持 EPUB 横排转竖排与竖排转横排（测试版），在支持 EPUB 竖排规范的阅读器中阅读体验更好。"),
        ],
        "hant": [
            ("支援哪些檔案格式？", "支援 EPUB、TXT、MD、SRT，以及 Word、Excel、PPT（DOCX、XLSX、PPTX）檔案的簡體轉繁體與繁體轉簡體。"),
            ("能依台灣、香港的用語轉換嗎？", "可以。支援通用、台灣、香港等不同轉換方案，地區詞彙與用語處理更貼近真實閱讀習慣。"),
            ("檔案會上傳嗎？", "不會。所有轉換都在本機完成，檔案不會上傳。"),
            ("能把橫排 EPUB 轉成直排嗎？", "支援 EPUB 橫排轉直排與直排轉橫排（測試版），在支援 EPUB 直排規範的閱讀器中獲得更好的閱讀體驗。"),
        ],
    },
    "tanko": {
        "hans": [
            ("可以导出什么格式？", "一键生成国际标准的 EPUB，或通用的 PDF 文件。"),
            ("免费版有哪些限制？", "免费版提供项目创建、图片导入、编辑和带水印导出。升级到 Pro 可解锁无限项目、无限导出次数和无水印导出。"),
            ("图片从哪里导入？", "可从相册批量导入，也可使用内置浏览器收集网页上的图片素材。"),
            ("支持日漫阅读吗？", "支持。阅读器提供从右到左的日漫模式、横向双页显示，以及深浅色主题。"),
        ],
        "hant": [
            ("可以匯出什麼格式？", "一鍵生成國際標準的 EPUB 或通用的 PDF 檔案。"),
            ("免費版有哪些限制？", "免費版提供專案創建、圖片匯入、編輯和帶浮水印匯出。升級到 Pro 可解鎖無限專案、無限匯出次數，以及無浮水印匯出。"),
            ("圖片從哪裡匯入？", "可從相簿批量匯入，也可使用內建瀏覽器收集網頁上的靈感素材。"),
            ("支援日漫閱讀嗎？", "支援。閱讀器提供右→左的日漫模式、橫向雙頁顯示，以及深淺色主題。"),
        ],
        "en": [
            ("Which formats can I export?", "Generate a standard EPUB or a universal PDF with a single tap."),
            ("What are the limits of the free version?", "The free version includes project creation, image import, editing and watermarked exports. Pro unlocks unlimited projects, unlimited exports and watermark-free exports."),
            ("Where can I import images from?", "Batch import from your photo library, or use the built-in browser to collect images from the web."),
            ("Does it support manga reading?", "Yes. The reader offers Manga Mode (right-to-left), landscape dual-page view and light or dark themes."),
        ],
    },
}


# ---- 商店文案 App（没有 fastlane，文案取自 apps.json）----
RELATED_STORE = {
    "daodejing": ["kiddoworld", "dsearch", "schulte-table"],
    "images-extractor": ["gridsplit", "shotfit", "pichd-plus"],
    "dsearch": ["schulte-table", "tinydrawer", "kiddoworld"],
    "voicesmith": ["subtitle-translator", "localization-master", "tinydrawer"],
    "subtitle-translator": ["localization-master", "voicesmith", "tinydrawer"],
    "schulte-table": ["dsearch", "wasabi-50", "kiddoworld"],
    "localization-master": ["subtitle-translator", "voicesmith", "epub-translator"],
    "tinydrawer": ["kiddoworld", "dsearch", "subtitle-translator"],
    "kiddoworld": ["tinydrawer", "schulte-table", "daodejing"],
    "shotfit": ["gridsplit", "pichd-plus", "images-extractor"],
    "gridsplit": ["shotfit", "pichd-plus", "images-extractor"],
    "scanwifi": ["dsearch", "pichd-plus", "wasabi-50"],
    "pichd-plus": ["shotfit", "gridsplit", "images-extractor"],
    "wasabi-50": ["schulte-table", "dsearch", "scanwifi"],
}
RELATED.update(RELATED_STORE)
# 隐私页按 LEGAL-PAGES.md 的数据去向；None = 官网没有对应隐私页（已无法更新的 App），页面不放隐私链接
PRIVACY_PATH.update({
    "subtitle-translator": "/privacy/translation", "localization-master": "/privacy/translation",
    "tinydrawer": "/privacy/web-import", "voicesmith": "/privacy/voice",
    "daodejing": None, "images-extractor": None,
})
