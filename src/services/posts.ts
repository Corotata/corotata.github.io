// Shared markdown post loading + language fallback for BlogList and BlogPost.
// Fallback order per UI language:
//   zh-TW -> tw, then en, then zh
//   zh    -> zh, then en
//   en    -> en, then zh

export type PostLang = 'en' | 'zh' | 'zh-TW';

const enModules = import.meta.glob('../posts/en/*.md', { as: 'raw', eager: true }) || {};
const zhModules = import.meta.glob('../posts/zh/*.md', { as: 'raw', eager: true }) || {};
const twModules = import.meta.glob('../posts/tw/*.md', { as: 'raw', eager: true }) || {};

const getSlug = (path: string) => path.split('/').pop()?.replace('.md', '') || '';

export const getAllSlugs = (): string[] => {
    const slugs = new Set<string>();
    [enModules, zhModules, twModules].forEach(modules => {
        Object.keys(modules).forEach(path => slugs.add(getSlug(path)));
    });
    return Array.from(slugs);
};

export const getAvailableLangs = (slug: string) => ({
    en: !!enModules[`../posts/en/${slug}.md`],
    zh: !!zhModules[`../posts/zh/${slug}.md`],
    zhTW: !!twModules[`../posts/tw/${slug}.md`],
});

export const resolvePost = (slug: string, uiLang: string): { content: string; lang: PostLang } | null => {
    const en = enModules[`../posts/en/${slug}.md`] as string | undefined;
    const zh = zhModules[`../posts/zh/${slug}.md`] as string | undefined;
    const tw = twModules[`../posts/tw/${slug}.md`] as string | undefined;

    const candidates: [string | undefined, PostLang][] =
        uiLang === 'zh-TW' ? [[tw, 'zh-TW'], [en, 'en'], [zh, 'zh']]
        : uiLang.startsWith('zh') ? [[zh, 'zh'], [en, 'en']]
        : [[en, 'en'], [zh, 'zh']];

    for (const [content, lang] of candidates) {
        if (content) return { content, lang };
    }
    return null;
};
