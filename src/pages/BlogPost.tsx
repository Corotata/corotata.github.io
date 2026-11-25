import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import yaml from 'js-yaml';
import { ArrowLeft, Calendar, Tag, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import TankoPromo from '../components/TankoPromo';
import { getAvailableLangs, getPostLangForSuffix, getPostPath, postLocales, resolvePost, type PostLang } from '../services/posts';

interface PostData {
    title: string;
    date: string;
    tags: string[];
    content: string;
    lang: PostLang;
}

/** Parse the chosen Markdown translation for the client-rendered article. */
const parsePost = (resolved: ReturnType<typeof resolvePost>): PostData | null => {
    const match = resolved && /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(resolved.content);
    if (!resolved || !match) return null;
    try {
        const { title, date, tags = [] } = yaml.load(match[1]) as {
            title: string;
            date: string | Date;
            tags?: string[];
        };
        return {
            title,
            date: date instanceof Date ? date.toISOString().split('T')[0] : String(date || ''),
            tags,
            content: match[2].trim(),
            lang: resolved.lang,
        };
    } catch (error) {
        console.error('Error loading post:', error);
        return null;
    }
};

/** Render the article selected by the URL, including navigation between translations. */
const BlogPost = () => {
    const { slug = '', locale } = useParams();
    const { i18n } = useTranslation();
    const availableLangs = getAvailableLangs(slug);
    const routeLang = locale ? getPostLangForSuffix(locale.toLowerCase()) : undefined;
    const contentLang = routeLang ?? (availableLangs.includes('zh') ? 'zh' : i18n.language);
    const post = parsePost(resolvePost(slug, contentLang));

    if (!post) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold">Post not found</h1>
                <Link to="/blog" className="text-primary hover:underline">Back to Blog</Link>
            </div>
        );
    }

    const isZhContent = contentLang.startsWith('zh');

    return (
        <article lang={postLocales[post.lang].code} className="min-h-screen pt-24 pb-20 px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="flex justify-between items-center mb-8">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> {postLocales[post.lang].blog}
                    </Link>
                </div>

                {/* Content Card */}
                <div className="bg-surface border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <header className="mb-12 border-b border-white/10 pb-12">
                        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {post.date}
                                </div>
                                <div className="flex gap-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full text-xs font-medium text-primary">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                {isZhContent && post.lang === 'en' && (
                                    <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs">
                                        🇺🇸 English Content
                                    </span>
                                )}
                            </div>

                            <nav className="flex flex-wrap gap-2" aria-label="Languages">
                                {availableLangs.filter(lang => lang !== post.lang).map(lang => (
                                    <Link
                                        key={lang}
                                        to={getPostPath(slug, lang)}
                                        hrefLang={postLocales[lang].code}
                                        lang={postLocales[lang].code}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-primary/50 transition-all"
                                    >
                                        <Languages className="w-4 h-4" />
                                        {postLocales[lang].label}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold leading-tight text-white mb-4">
                            {post.title}
                        </h1>
                    </header>

                    <div className="prose prose-invert prose-lg max-w-none
                        prose-headings:text-white prose-headings:font-bold
                        prose-p:text-gray-300 prose-p:leading-8
                        prose-li:text-gray-300
                        prose-strong:text-white prose-strong:font-bold
                        prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
                        prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-black/20 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic prose-blockquote:text-gray-300
                        prose-pre:bg-[#0d0d0d] prose-pre:p-0 prose-pre:rounded-xl prose-pre:border prose-pre:border-white/10 prose-pre:shadow-inner
                        prose-img:rounded-xl prose-img:shadow-2xl prose-img:border prose-img:border-white/5
                        prose-th:text-white prose-td:text-gray-300">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || '')
                                    return !inline && match ? (
                                        <div className="relative group">
                                            <div className="absolute right-4 top-4 text-xs text-gray-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                                                {match[1]}
                                            </div>
                                            <SyntaxHighlighter
                                                {...props}
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{ margin: 0, padding: '1.5rem', borderRadius: '0.75rem', background: '#0d0d0d' }}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code {...props} className={`${className} bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-medium before:content-none after:content-none`}>
                                            {children}
                                        </code>
                                    )
                                }
                            }}
                        >
                            {post.content}
                        </ReactMarkdown>
                    </div>

                    {/* Tanko Promo for Comic Posts */}
                    {post.tags.includes('Comic Creation') && <TankoPromo />}
                </div>
            </motion.div>
        </article>
    );
};

export default BlogPost;
