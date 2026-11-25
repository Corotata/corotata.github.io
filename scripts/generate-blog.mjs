import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import yaml from 'js-yaml';

/** Resolve Markdown and output paths relative to the website repository. */
const root = fileURLToPath(new URL('..', import.meta.url));
const site = 'https://corotata.com';

/** Match each source directory to the same language codes used on app pages. */
const languages = [
    { folder: 'zh', suffix: '', code: 'zh-Hans', label: '简体中文', blog: '全部文章' },
    { folder: 'en', suffix: 'en/', code: 'en', label: 'English', blog: 'All articles' },
    { folder: 'tw', suffix: 'zh-hant/', code: 'zh-Hant', label: '繁體中文', blog: '所有文章' },
];
const styles = [
    ':root{color-scheme:light dark;font-family:system-ui,sans-serif;line-height:1.7}',
    'body{max-width:48rem;margin:auto;padding:1.5rem 1.25rem 3rem;overflow-wrap:anywhere}',
    'nav{display:flex;align-items:center;gap:.9rem;flex-wrap:wrap}',
    'h1,h2,h3{line-height:1.3}h1{font-size:clamp(1.75rem,5vw,2.6rem);margin-bottom:.35rem}',
    'h2{margin-top:2.2rem}time{opacity:.72}a{text-underline-offset:.18em}',
    'table{border-collapse:collapse;width:100%}th,td{border:1px solid #8888;padding:.5rem;text-align:start}',
    'ol{padding-inline-start:1.5rem}li{margin-block:.6rem}footer{margin-top:2.5rem}',
].join('');

/** Group translated Markdown files by their shared slug. */
async function collectPosts() {
    const posts = new Map();
    for (const language of languages) {
        const directory = join(root, 'src/posts', language.folder);
        const names = (await readdir(directory)).filter(name => name.endsWith('.md')).sort();
        for (const name of names) {
            const slug = name.slice(0, -3);
            const source = await readFile(join(directory, name), 'utf8');
            const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(source);
            if (!match) throw new Error('Missing frontmatter in ' + join(directory, name));
            const { title, description, date } = yaml.load(match[1]);
            if (typeof title !== 'string' || typeof description !== 'string' || typeof date !== 'string') {
                throw new Error('Expected title, description, and a quoted date in ' + join(directory, name));
            }
            const path = '/blog/' + slug + '/' + language.suffix;
            const post = { path, url: site + path, title, description, date, body: match[2], language };
            if (!posts.has(slug)) posts.set(slug, []);
            posts.get(slug).push(post);
        }
    }
    return [...posts.values()];
}

/** Render each translation as a standalone page that works without JavaScript. */
function renderPage(post, translations) {
    const h = React.createElement;
    const { title, description, url, body, date, language } = post;
    const alternate = translations.map(other =>
        h('link', { key: other.language.code, rel: 'alternate', hrefLang: other.language.code, href: other.url }));
    return '<!doctype html>\n' + renderToStaticMarkup(
        h('html', { lang: language.code },
            h('head', null,
                h('meta', { charSet: 'utf-8' }),
                h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
                h('title', null, title + ' | Corotata'),
                h('meta', { name: 'description', content: description }),
                h('link', { rel: 'canonical', href: url }),
                ...alternate,
                h('style', null, styles)),
            h('body', null,
                h('nav', null, h('a', { href: '/' }, 'Corotata'), h('a', { href: '/blog' }, language.blog)),
                h('main', null,
                    h('article', null,
                        h('header', null, h('h1', null, title), h('time', { dateTime: date }, date)),
                        h(Markdown, { remarkPlugins: [remarkGfm] }, body))),
                h('footer', null, h('nav', null, ...translations.map(other =>
                    h('a', {
                        key: other.language.code,
                        href: other.path,
                        hrefLang: other.language.code,
                        lang: other.language.code,
                        'aria-current': other === post ? 'page' : undefined,
                    }, other.language.label))))))) + '\n';
}

/** Refresh generated blog entries while preserving the existing app index sections. */
async function writeIndexes(groups, output) {
    const sitemapPath = join(output, 'sitemap.xml');
    const llmsPath = join(output, 'llms.txt');
    const [oldSitemap, oldLlms] = await Promise.all([
        readFile(sitemapPath, 'utf8'),
        readFile(llmsPath, 'utf8'),
    ]);
    const sitemapEntries = groups.flatMap(translations => translations.map(post => [
        '<url><loc>' + post.url + '</loc>',
        '<lastmod>' + post.date + '</lastmod>',
        ...translations.map(other =>
            '<xhtml:link rel="alternate" hreflang="' + other.language.code + '" href="' + other.url + '"/>'),
        '</url>',
    ].join('\n'))).join('\n');
    const llmsEntries = groups.flatMap(group => group.map(post =>
        '- [' + post.title + '（' + post.language.label + '）](' + post.url + '): ' + post.description)).join('\n');
    const sitemap = oldSitemap.replace(/<!-- Blog posts -->[\s\S]*?<!-- \/Blog posts -->\n/, '');
    const llms = oldLlms.split('\n## 实战攻略\n', 1)[0].trimEnd();
    await Promise.all([
        writeFile(sitemapPath, sitemap.replace('</urlset>', () =>
            '<!-- Blog posts -->\n' + sitemapEntries + '\n<!-- /Blog posts -->\n</urlset>')),
        writeFile(llmsPath, llms + '\n\n## 实战攻略\n\n' + llmsEntries + '\n'),
    ]);
}

/** Generate public indexes on demand, or generate deployable HTML and indexes after Vite builds. */
const groups = await collectPosts();
const build = process.argv.includes('--build');
const output = join(root, build ? 'dist' : 'public');
if (build) {
    for (const translations of groups) {
        for (const post of translations) {
            const file = join(output, post.path, 'index.html');
            await mkdir(dirname(file), { recursive: true });
            await writeFile(file, renderPage(post, translations));
        }
    }
}
await writeIndexes(groups, output);
console.log((build ? 'Generated static HTML and indexes for ' : 'Updated public indexes for ') +
    groups.flat().length + ' article translations.');
