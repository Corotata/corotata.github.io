import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import yaml from 'js-yaml';
import { ArrowLeft, Calendar, Tag, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface PostData {
    title: string;
    date: string;
    tags: string[];
    content: string;
    lang: string;
}

// Load markdown files eagerly at the top level
const enModules = import.meta.glob('../posts/en/*.md', { as: 'raw', eager: true }) || {};
const zhModules = import.meta.glob('../posts/zh/*.md', { as: 'raw', eager: true }) || {};
const twModules = import.meta.glob('../posts/tw/*.md', { as: 'raw', eager: true }) || {};

const BlogPost = () => {
    const { slug } = useParams();
    const { i18n } = useTranslation();
    const [post, setPost] = useState<PostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [availableLangs, setAvailableLangs] = useState<{ en: boolean, zh: boolean, zhTW: boolean }>({ en: false, zh: false, zhTW: false });
    // Local state for content language, initialized with global language but independent
    const [contentLang, setContentLang] = useState(i18n.language);

    useEffect(() => {
        const loadPost = async () => {
            console.log('Loading post:', slug, 'Language:', contentLang);
            try {
                const zhPath = `../posts/zh/${slug}.md`;
                const enPath = `../posts/en/${slug}.md`;
                const twPath = `../posts/tw/${slug}.md`;

                console.log('Checking paths:', { enPath, zhPath, twPath });

                const hasZh = !!zhModules[zhPath];
                const hasEn = !!enModules[enPath];
                const hasZhTw = !!twModules[twPath];

                console.log('Available versions:', { hasEn, hasZh, hasZhTw });

                setAvailableLangs({ en: hasEn, zh: hasZh, zhTW: hasZhTw });

                // Try to find the best match based on contentLang
                let content = '';
                let lang = 'en';

                if (contentLang === 'zh-TW' && hasZhTw) {
                    content = twModules[twPath] as string;
                    lang = 'zh-TW';
                } else if (contentLang === 'zh' && hasZh) {
                    content = zhModules[zhPath] as string;
                    lang = 'zh';
                } else if (contentLang === 'en' && hasEn) {
                    content = enModules[enPath] as string;
                    lang = 'en';
                } else {
                    // Fallback logic if current contentLang is not available
                    if (hasZhTw && contentLang === 'zh-TW') {
                        // Should have matched above, but just in case
                        content = twModules[twPath] as string;
                        lang = 'zh-TW';
                    } else if (hasZh && contentLang.startsWith('zh')) {
                        content = zhModules[zhPath] as string;
                        lang = 'zh';
                    } else if (hasEn) {
                        content = enModules[enPath] as string;
                        lang = 'en';
                    }
                }

                if (content) {
                    console.log('Content found for lang:', lang);
                    const match = /---\n([\s\S]*?)\n---/.exec(content);
                    if (match) {
                        const frontmatter = yaml.load(match[1]) as any;
                        const markdownBody = content.replace(/---\n[\s\S]*?\n---/, '').trim();

                        setPost({
                            title: frontmatter.title,
                            date: frontmatter.date instanceof Date
                                ? frontmatter.date.toISOString().split('T')[0]
                                : String(frontmatter.date || ''),
                            tags: frontmatter.tags || [],
                            content: markdownBody,
                            lang
                        });
                    }
                } else {
                    console.log('No content found');
                    setPost(null);
                }
            } catch (error) {
                console.error('Error loading post:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPost();
    }, [slug, contentLang]);

    const switchLanguage = (lang: string) => {
        setContentLang(lang);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

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
        <article className="min-h-screen pt-24 pb-20 px-6">
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
                        <ArrowLeft className="w-4 h-4" /> Back to Blog
                    </Link>
                </div>

                {/* Content Card */}
                <div className="bg-surface border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl">
                    <header className="mb-12 border-b border-white/10 pb-12">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4 text-sm text-gray-400">
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

                            <div className="flex gap-2">
                                {availableLangs.en && contentLang !== 'en' && (
                                    <button
                                        onClick={() => switchLanguage('en')}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-primary/50 transition-all"
                                    >
                                        <Languages className="w-4 h-4" />
                                        English
                                    </button>
                                )}
                                {availableLangs.zh && contentLang !== 'zh' && (
                                    <button
                                        onClick={() => switchLanguage('zh')}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-primary/50 transition-all"
                                    >
                                        <Languages className="w-4 h-4" />
                                        简体中文
                                    </button>
                                )}
                                {availableLangs.zhTW && contentLang !== 'zh-TW' && (
                                    <button
                                        onClick={() => switchLanguage('zh-TW')}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 hover:text-white hover:bg-white/10 hover:border-primary/50 transition-all"
                                    >
                                        <Languages className="w-4 h-4" />
                                        繁體中文
                                    </button>
                                )}
                            </div>
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
                </div>
            </motion.div>
        </article>
    );
};

export default BlogPost;
