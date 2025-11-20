import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import yaml from 'js-yaml';
import { motion } from 'framer-motion';
import { Calendar, Tag, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Post {
    slug: string;
    title: string;
    date: string;
    description: string;
    tags: string[];
    content: string;
    lang?: string;
}

// Load markdown files eagerly at the top level
// Load markdown files eagerly at the top level
const enModules = import.meta.glob('../posts/en/*.md', { as: 'raw', eager: true }) || {};
const zhModules = import.meta.glob('../posts/zh/*.md', { as: 'raw', eager: true }) || {};
const twModules = import.meta.glob('../posts/tw/*.md', { as: 'raw', eager: true }) || {};

const BlogList = () => {
    const { t, i18n } = useTranslation();
    const [posts, setPosts] = useState<Post[]>([]);
    const [selectedTag, setSelectedTag] = useState<string>('All');
    const [tags, setTags] = useState<string[]>(['All']);

    useEffect(() => {
        try {
            console.log('BlogList loading...');
            console.log('Modules loaded:', {
                en: Object.keys(enModules).length,
                zh: Object.keys(zhModules).length,
                tw: Object.keys(twModules).length
            });

            const loadedPosts: Post[] = [];
            const allTags = new Set<string>(['All']);
            const processedSlugs = new Set<string>();

            // Helper to get slug from path
            const getSlug = (path: string) => path.split('/').pop()?.replace('.md', '') || '';

            // 1. Collect all available slugs
            const allPaths = [
                ...Object.keys(enModules),
                ...Object.keys(zhModules),
                ...Object.keys(twModules)
            ];
            allPaths.forEach(path => processedSlugs.add(getSlug(path)));

            // 2. Process each slug
            processedSlugs.forEach(slug => {
                const currentLang = i18n.language;

                // Determine which file content to use
                let content = '';
                let lang = 'en';

                const enPath = `../posts/en/${slug}.md`;
                const zhPath = `../posts/zh/${slug}.md`;
                const twPath = `../posts/tw/${slug}.md`;

                if (currentLang === 'zh-TW') {
                    if (twModules[twPath]) {
                        content = twModules[twPath] as string;
                        lang = 'zh-TW';
                    } else if (enModules[enPath]) {
                        content = enModules[enPath] as string;
                        lang = 'en';
                    }
                } else if (currentLang.startsWith('zh')) {
                    if (zhModules[zhPath]) {
                        content = zhModules[zhPath] as string;
                        lang = 'zh';
                    } else if (enModules[enPath]) {
                        content = enModules[enPath] as string;
                        lang = 'en';
                    }
                } else {
                    if (enModules[enPath]) {
                        content = enModules[enPath] as string;
                        lang = 'en';
                    }
                }

                if (content) {
                    const match = /---\n([\s\S]*?)\n---/.exec(content);
                    if (match) {
                        const frontmatter = yaml.load(match[1]) as any;

                        if (frontmatter.tags) {
                            frontmatter.tags.forEach((tag: string) => allTags.add(tag));
                        }

                        loadedPosts.push({
                            slug,
                            title: frontmatter.title || 'Untitled',
                            date: frontmatter.date instanceof Date ? frontmatter.date.toISOString().split('T')[0] : String(frontmatter.date || ''),
                            description: frontmatter.description || '',
                            tags: frontmatter.tags || [],
                            content: content,
                            lang
                        });
                    }
                }
            });

            // Sort by date descending
            loadedPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setPosts(loadedPosts);
            setTags(Array.from(allTags));
        } catch (error) {
            console.error('Error loading blog posts:', error);
        }
    }, [i18n.language]);

    const filteredPosts = selectedTag === 'All'
        ? posts
        : posts.filter(post => post.tags.includes(selectedTag));

    return (
        <div className="min-h-screen pt-24 pb-20 px-6 max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16"
            >
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    {t('blog_page.title')}
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    {t('blog_page.description')}
                </p>
            </motion.div>

            {/* Tag Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
                {tags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedTag === tag
                            ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105'
                            : 'bg-surface border border-white/10 text-gray-400 hover:border-primary/50 hover:text-white'
                            }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Posts Grid */}
            <div className="grid gap-8">
                {filteredPosts.map((post, index) => (
                    <motion.article
                        key={post.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-surface/50 border border-white/5 rounded-2xl p-8 hover:border-primary/30 transition-colors overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {post.date}
                                </div>
                                <div className="flex gap-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded text-xs">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                    {i18n.language.startsWith('zh') && post.lang === 'en' && (
                                        <span className="flex items-center gap-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded text-xs">
                                            🇺🇸 English Content
                                        </span>
                                    )}
                                </div>
                            </div>

                            <Link to={`/blog/${post.slug}`}>
                                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                                    {post.title}
                                </h2>
                            </Link>

                            <p className="text-gray-400 mb-6 line-clamp-2">
                                {post.description}
                            </p>

                            <Link
                                to={`/blog/${post.slug}`}
                                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                            >
                                Read Article <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </motion.article>
                ))}

                {filteredPosts.length === 0 && (
                    <div className="text-center text-gray-500 py-20">
                        No posts found for this tag.
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogList;
