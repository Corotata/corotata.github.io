import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchDeveloperApps, type AppData } from '../services/appStore';

const AppShowcase = () => {
    const { t, i18n } = useTranslation();
    const [apps, setApps] = useState<AppData[]>([]);
    const [activeApp, setActiveApp] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadApps = async () => {
            setLoading(true);
            setError('');
            try {
                const fetchedApps = await fetchDeveloperApps(i18n.language);
                setApps(fetchedApps);
                if (fetchedApps.length > 0) {
                    // Keep the currently active app if it exists in the new list, otherwise set to first
                    setActiveApp(prev => {
                        if (prev) {
                            const found = fetchedApps.find(a => a.id === prev.id);
                            return found || fetchedApps[0];
                        }
                        return fetchedApps[0];
                    });
                }
            } catch (err) {
                setError(t('showcase.error'));
            } finally {
                setLoading(false);
            }
        };

        loadApps();
    }, [i18n.language, t]);

    if (loading) {
        return (
            <section id="showcase" className="py-20 relative min-h-[600px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-primary">
                    <Loader2 className="w-10 h-10 animate-spin" />
                    <p>{t('showcase.loading')}</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="showcase" className="py-20 relative min-h-[600px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-red-500">
                    <AlertCircle className="w-10 h-10" />
                    <p>{error}</p>
                </div>
            </section>
        );
    }

    if (!activeApp) return null;

    return (
        <section id="showcase" className="py-20 relative">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('showcase.title')}</h2>
                    <div className="h-1 w-20 bg-primary rounded-full" />
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* App List / Navigation */}
                    <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {apps.map((app) => (
                            <motion.button
                                key={app.id}
                                onClick={() => setActiveApp(app)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border flex items-start gap-4 ${activeApp.id === app.id
                                    ? 'bg-white/10 border-primary/50 shadow-lg shadow-primary/10'
                                    : 'bg-surface border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <img src={app.icon} alt={app.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold text-base truncate ${activeApp.id === app.id ? 'text-primary' : 'text-white'}`}>
                                            {app.title}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2">{app.description}</p>
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {/* Active App Detail View */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeApp.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-surface border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full"
                            >
                                <div className="aspect-video w-full relative overflow-hidden group bg-black/50">
                                    {/* Blurred Background */}
                                    <div
                                        className="absolute inset-0 bg-cover bg-center blur-xl opacity-50"
                                        style={{ backgroundImage: `url(${activeApp.screenshot})` }}
                                    />

                                    {/* Main Image */}
                                    <img
                                        src={activeApp.screenshot}
                                        alt={activeApp.title}
                                        className="relative z-10 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                                    />

                                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-8">
                                        <div className="flex gap-4">
                                            <a
                                                href={activeApp.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-primary text-white rounded-full font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" /> {t('showcase.live_demo')}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 flex-1 flex flex-col">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <img src={activeApp.icon} alt={activeApp.title} className="w-20 h-20 rounded-2xl shadow-lg" />
                                            <div>
                                                <h2 className="text-2xl font-bold mb-1">{activeApp.title}</h2>
                                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                                    <span className="px-2 py-0.5 bg-white/10 rounded text-xs">{activeApp.version}</span>
                                                    <span>•</span>
                                                    <span className="text-accent font-medium">{activeApp.genres[0]}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-2xl font-bold text-primary">{activeApp.formattedPrice}</span>
                                            <div className="flex items-center justify-end gap-1 text-yellow-400 text-sm mt-1">
                                                <span>★</span>
                                                <span>{activeApp.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-300 text-base mb-8 leading-relaxed whitespace-pre-wrap line-clamp-6 flex-1">
                                        {activeApp.description}
                                    </p>

                                    <div className="flex flex-wrap gap-3 mt-auto">
                                        {activeApp.genres.map((tag) => (
                                            <span key={tag} className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AppShowcase;
