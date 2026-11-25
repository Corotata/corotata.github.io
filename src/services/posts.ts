import locales from '../data/blog-locales.json';

/** Supported article languages and their canonical URL metadata. */
export type PostLang = keyof typeof locales;
export const postLocales = locales;

/** Load Markdown from the same locale directories used during prerendering. */
const modules = import.meta.glob<string>('../posts/*/*.md', { query: '?raw', import: 'default', eager: true });
const languages = Object.keys(postLocales) as PostLang[];

/** Read a single translation without applying fallbacks. */
const readPost = (slug: string, lang: PostLang) => modules[`../posts/${postLocales[lang].folder}/${slug}.md`];

/** Return each published slug once across all languages. */
export const getAllSlugs = (): string[] => [
    ...new Set(Object.keys(modules).map(path => path.split('/').pop()!.slice(0, -3))),
];

/** List only languages with a published translation for this slug. */
export const getAvailableLangs = (slug: string) => languages.filter(lang => readPost(slug, lang));

/** Resolve the optional route suffix to its article language. */
export const getPostLangForSuffix = (suffix: string) => languages.find(lang => postLocales[lang].suffix === suffix);

/** Build the canonical article path for both the list and the language links. */
export const getPostPath = (slug: string, lang: PostLang) => {
    const { suffix } = postLocales[lang];
    return suffix ? `/blog/${slug}/${suffix}/` : `/blog/${slug}/`;
};

/** Prefer a matching language, preserving the existing Chinese and English fallbacks. */
export const resolvePost = (slug: string, uiLang: string): { content: string; lang: PostLang } | null => {
    const locale = uiLang.toLowerCase();
    const base = locale.split('-')[0];
    const candidates: PostLang[] = locale === 'zh-tw' || locale.startsWith('zh-hant')
        ? ['zh-TW', 'en', 'zh']
        : base === 'zh' ? ['zh', 'en']
        : ['en', 'zh'];
    const preferred = getPostLangForSuffix(base);
    if (preferred && preferred !== 'en') candidates.unshift(preferred);

    for (const lang of candidates) {
        const content = readPost(slug, lang);
        if (content) return { content, lang };
    }
    return null;
};
