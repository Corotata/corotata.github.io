import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            "nav": {
                "brand": "Corotata",
                "apps": "Apps",
                "about": "About",
                "contact": "Contact"
            },
            "hero": {
                "subtitle": "Building the Future",
                "title_prefix": "Crafting Digital",
                "title_suffix": "Experiences",
                "description": "I'm a developer passionate about creating award-winning iOS applications that combine stunning aesthetics with powerful functionality.",
                "view_work": "View Work",
                "contact_me": "Contact Me"
            },
            "showcase": {
                "title": "Featured Apps",
                "live_demo": "View on App Store",
                "view_details": "View Details",
                "source_code": "Source Code",
                "loading": "Loading apps from App Store...",
                "error": "Failed to load apps. Please try again later.",
                "screenshots": "Screenshots",
                "reviews": "User Reviews",
                "filters": {
                    "all": "All",
                    "mac": "Mac",
                    "iphone": "iPhone",
                    "ipad": "iPad",
                    "universal": "Universal"
                },
                "available_on": "Available on"
            },
            "about": {
                "title": "About The Developer",
                "description": "With over 12 years of iOS development experience, I specialize in building scalable, high-performance mobile applications. My passion lies in creating intuitive user experiences that solve real-world problems.",
                "stats": {
                    "apps": "Apps Launched",
                    "users": "Active Users",
                    "satisfaction": "Client Satisfaction",
                    "experience": "Years Experience"
                }
            },
            "contact": {
                "title": "Ready to Start a Project?",
                "description": "I'm always open to discussing product design work or partnership opportunities.",
                "cta": "Get in Touch"
            },
            "footer": {
                "rights": "All rights reserved.",
                "quick_links": "Quick Links",
                "connect": "Connect"
            }
        }
    },
    zh: {
        translation: {
            "nav": {
                "brand": "Corotata",
                "apps": "应用",
                "about": "关于",
                "contact": "联系"
            },
            "hero": {
                "subtitle": "构建未来",
                "title_prefix": "打造极致",
                "title_suffix": "数字体验",
                "description": "我热衷于创造，更执着于简单。致力于把复杂的世界变简单，想用这些小小的改变，给你的日常带来一些意想不到的惊喜。",
                "view_work": "查看作品",
                "contact_me": "联系我"
            },
            "showcase": {
                "title": "精选应用",
                "live_demo": "前往 App Store",
                "view_details": "查看详情",
                "source_code": "源代码",
                "loading": "正在从 App Store 加载应用...",
                "error": "加载应用失败，请稍后再试。",
                "screenshots": "应用截图",
                "reviews": "用户评价",
                "filters": {
                    "all": "全部",
                    "mac": "Mac",
                    "iphone": "iPhone",
                    "ipad": "iPad",
                    "universal": "通用"
                },
                "available_on": "支持平台"
            },
            "about": {
                "title": "关于开发者",
                "description": "拥有超过 12 年的 iOS 开发经验，我专注于构建可扩展、高性能的移动应用程序。我的热情在于创造直观的用户体验，解决现实世界的问题。",
                "stats": {
                    "apps": "已发布应用",
                    "users": "活跃用户",
                    "satisfaction": "客户满意度",
                    "experience": "开发经验"
                }
            },
            "contact": {
                "title": "准备好开始项目了吗？",
                "description": "我随时欢迎讨论产品设计工作或合作伙伴关系机会。",
                "cta": "取得联系"
            },
            "footer": {
                "rights": "版权所有。",
                "quick_links": "快速链接",
                "connect": "社交媒体"
            }
        }
    },
    "zh-TW": {
        translation: {
            "nav": {
                "brand": "Corotata",
                "apps": "應用",
                "about": "關於",
                "contact": "聯繫"
            },
            "hero": {
                "subtitle": "構建未來",
                "title_prefix": "打造極致",
                "title_suffix": "數位體驗",
                "description": "我熱衷於創造，更執著於簡單。致力於把複雜的世界變簡單，想用這些小小的改變，給你的日常帶來一些意想不到的驚喜。",
                "view_work": "查看作品",
                "contact_me": "聯繫我"
            },
            "showcase": {
                "title": "精選應用",
                "live_demo": "前往 App Store",
                "view_details": "查看詳情",
                "source_code": "源代碼",
                "loading": "正在從 App Store 加載應用...",
                "error": "加載應用失敗，請稍後再試。",
                "screenshots": "應用截圖",
                "reviews": "用戶評價",
                "filters": {
                    "all": "全部",
                    "mac": "Mac",
                    "iphone": "iPhone",
                    "ipad": "iPad",
                    "universal": "通用"
                },
                "available_on": "支持平台"
            },
            "about": {
                "title": "關於開發者",
                "description": "擁有超過 12 年的 iOS 開發經驗，我專注於構建可擴展、高性能的移動應用程序。我的熱情在於創造直觀的用戶體驗，解決現實世界的問題。",
                "stats": {
                    "apps": "已發布應用",
                    "users": "活躍用戶",
                    "satisfaction": "客戶滿意度",
                    "experience": "開發經驗"
                }
            },
            "contact": {
                "title": "準備好開始項目了嗎？",
                "description": "我隨時歡迎討論產品設計工作或合作夥伴關係機會。",
                "cta": "取得聯繫"
            },
            "footer": {
                "rights": "版權所有。",
                "quick_links": "快速鏈接",
                "connect": "社交媒體"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        supportedLngs: ['en', 'zh', 'zh-TW'],
        detection: {
            order: ['querystring', 'cookie', 'localStorage', 'navigator'],
            lookupQuerystring: 'lang',
            lookupCookie: 'i18next',
            lookupLocalStorage: 'i18nextLng',
            caches: ['localStorage', 'cookie'],
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
