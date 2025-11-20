import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, AlertCircle, Monitor, Smartphone, Tablet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchDeveloperApps, type AppData } from '../services/appStore';
import ImageWithPlaceholder from './ImageWithPlaceholder';

const AppShowcase = ({ onAppsCountUpdate }: { onAppsCountUpdate?: (count: number) => void }) => {
    const { t, i18n } = useTranslation();
    const [apps, setApps] = useState<AppData[]>([]);
    const [filteredApps, setFilteredApps] = useState<AppData[]>([]);
    const [activeApp, setActiveApp] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'mac' | 'iphone' | 'ipad'>('all');
    const [currentScreenshotIndex, setCurrentScreenshotIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadApps = async () => {
            setLoading(true);
            setError('');
            try {
                const fetchedApps = await fetchDeveloperApps(i18n.language);
                setApps(fetchedApps);
                setFilteredApps(fetchedApps);
                if (onAppsCountUpdate) {
                    onAppsCountUpdate(fetchedApps.length);
                }
                if (fetchedApps.length > 0) {
                    setActiveApp(fetchedApps[0]);
                }
            } catch (err) {
                setError(t('showcase.error'));
            } finally {
                setLoading(false);
            }
        };

        loadApps();
    }, [i18n.language, t]);

    useEffect(() => {
        if (filter === 'all') {
            setFilteredApps(apps);
        } else {
            setFilteredApps(apps.filter(app => {
                if (filter === 'mac') return app.device === 'mac';
                if (filter === 'iphone') return app.device === 'iphone' || app.device === 'universal';
                if (filter === 'ipad') return app.device === 'ipad' || app.device === 'universal';
                return true;
            }));
        }
    }, [filter, apps]);

    useEffect(() => {
        if (filteredApps.length > 0 && (!activeApp || !filteredApps.find(a => a.id === activeApp.id))) {
            setActiveApp(filteredApps[0]);
        }
        setCurrentScreenshotIndex(0);
    }, [filteredApps, activeApp]);

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case 'mac': return <Monitor className="w-4 h-4" />;
            case 'ipad': return <Tablet className="w-4 h-4" />;
            case 'universal': return <Smartphone className="w-4 h-4" />;
            default: return <Smartphone className="w-4 h-4" />;
        }
    };

    const getCurrentScreenshots = (app: AppData) => {
        if (!app) return [];
        // If specific filter is active, try to show those screenshots
        if (filter === 'mac' && app.screenshots.mac.length > 0) return app.screenshots.mac;
        if (filter === 'ipad' && app.screenshots.ipad.length > 0) return app.screenshots.ipad;
        if (filter === 'iphone' && app.screenshots.iphone.length > 0) return app.screenshots.iphone;

        // Otherwise fallback to device default
        if (app.device === 'mac') return app.screenshots.mac;
        if (app.device === 'ipad') return app.screenshots.ipad.length > 0 ? app.screenshots.ipad : app.screenshots.iphone;
        // For universal/iphone, prefer iphone but fallback if empty
        return app.screenshots.iphone.length > 0 ? app.screenshots.iphone : (app.screenshots.ipad.length > 0 ? app.screenshots.ipad : app.screenshots.mac);
    };

    const nextScreenshot = () => {
        if (!activeApp) return;
        const screenshots = getCurrentScreenshots(activeApp);
        setCurrentScreenshotIndex((prev) => (prev + 1) % screenshots.length);
    };

    const prevScreenshot = () => {
        if (!activeApp) return;
        const screenshots = getCurrentScreenshots(activeApp);
        setCurrentScreenshotIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
    };

    const handleAppClick = (app: AppData) => {
        setActiveApp(app);
        // On mobile/tablet (small screens), open modal immediately
        if (window.innerWidth < 1024) {
            setIsModalOpen(true);
        }
    };

    const currentScreenshots = activeApp ? getCurrentScreenshots(activeApp) : [];
    const isLandscape = activeApp?.device === 'mac';

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

    return (
        <section id="showcase" className="py-20 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('showcase.title')}</h2>
                        <div className="h-1 w-20 bg-primary rounded-full" />
                    </motion.div>

                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                        {(['all', 'mac', 'iphone', 'ipad'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f
                                    ? 'bg-primary text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {t(`showcase.filters.${f}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* App List / Navigation */}
                    <div className="lg:col-span-4 space-y-4 h-[600px] overflow-y-auto pr-2 custom-scrollbar will-change-transform">
                        {filteredApps.map((app) => (
                            <motion.button
                                key={app.id}
                                layoutId={`app-card-${app.id}`}
                                onClick={() => handleAppClick(app)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border flex items-start gap-4 ${activeApp?.id === app.id
                                    ? 'bg-white/10 border-primary/50 shadow-lg shadow-primary/10'
                                    : 'bg-surface border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <ImageWithPlaceholder
                                    src={app.icon}
                                    alt={app.title}
                                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`font-bold text-base truncate ${activeApp?.id === app.id ? 'text-primary' : 'text-white'}`}>
                                            {app.title}
                                        </h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${activeApp?.id === app.id ? 'border-primary/30 text-primary' : 'border-white/10 text-gray-400'}`}>
                                            {getDeviceIcon(app.device)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2">{app.description}</p>
                                </div>
                            </motion.button>
                        ))}
                        {filteredApps.length === 0 && !loading && (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-4">
                                <p>No apps found for this filter.</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-2 bg-primary/20 text-primary rounded-full hover:bg-primary/30 transition-colors font-medium"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Active App Detail View */}
                    <div className="lg:col-span-8 h-[600px] flex flex-col hidden lg:flex">
                        <AnimatePresence mode="wait">
                            {activeApp && (
                                <motion.div
                                    key={activeApp.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-surface border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full will-change-transform"
                                >
                                    {/* Screenshot Display Area */}
                                    <div className="w-full relative overflow-hidden group bg-black/50 p-6 flex items-center justify-center min-h-[450px] flex-1">
                                        {/* Blurred Background */}
                                        <div
                                            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-30 transition-all duration-500"
                                            style={{ backgroundImage: `url(${currentScreenshots[0]})` }}
                                        />

                                        {/* Screenshots */}
                                        <div className="relative z-10 flex gap-4 justify-center w-full overflow-x-auto custom-scrollbar pb-4 items-center">
                                            {isLandscape ? (
                                                // Mac: Single Large Landscape with Controls
                                                <div className="relative w-full flex items-center justify-center">
                                                    <motion.div
                                                        key={currentScreenshots[currentScreenshotIndex]}
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="relative max-w-full max-h-[400px]"
                                                    >
                                                        <ImageWithPlaceholder
                                                            src={currentScreenshots[currentScreenshotIndex]}
                                                            alt="App Screenshot"
                                                            className="max-w-full max-h-[400px] object-contain rounded-lg shadow-2xl"
                                                        />
                                                    </motion.div>
                                                    {currentScreenshots.length > 1 && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); prevScreenshot(); }}
                                                                className="absolute left-0 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <ChevronLeft className="w-6 h-6" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); nextScreenshot(); }}
                                                                className="absolute right-0 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <ChevronRight className="w-6 h-6" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                // iPhone/iPad: 3-Column Grid (showing first 3)
                                                currentScreenshots.slice(0, 3).map((src, idx) => (
                                                    <motion.div
                                                        key={src}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="w-1/3 max-w-[200px]"
                                                    >
                                                        <ImageWithPlaceholder
                                                            src={src}
                                                            alt={`Screenshot ${idx}`}
                                                            className="w-full object-contain rounded-xl shadow-xl border border-white/10"
                                                        />
                                                    </motion.div>
                                                ))
                                            )}
                                        </div>

                                        {/* View Details Overlay */}
                                        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-8 pointer-events-none">
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="pointer-events-auto px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                                            >
                                                View Details <ExternalLink className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview Info Bar */}
                                    <div className="p-6 bg-surface border-t border-white/5">
                                        <div className="flex items-start gap-4">
                                            <ImageWithPlaceholder src={activeApp.icon} alt={activeApp.title} className="w-16 h-16 rounded-xl shadow-lg flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-xl font-bold mb-2 truncate">{activeApp.title}</h3>
                                                <div className="flex items-center justify-between flex-wrap gap-4">
                                                    <div className="flex items-center gap-3 text-sm text-gray-400">
                                                        <span className="px-2 py-0.5 bg-white/10 rounded text-xs">{activeApp.version}</span>
                                                        <span>{activeApp.genres[0]}</span>
                                                        <div className="flex items-center gap-1 text-yellow-400">
                                                            <span>★</span>
                                                            <span>{activeApp.rating.toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={activeApp.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary text-white rounded-full font-bold text-xs hover:bg-primary/90 transition-transform hover:scale-105"
                                                    >
                                                        {t('showcase.live_demo')} <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </div>
                                                <p className="mt-3 text-sm text-gray-400 line-clamp-2">
                                                    {activeApp.description.split('\n')[0]}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {isModalOpen && activeApp && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-surface w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative z-10 custom-scrollbar will-change-transform"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-50"
                            >
                                <ChevronLeft className="w-6 h-6 rotate-180" /> {/* Close Icon */}
                            </button>

                            <div className="p-8 md:p-12">
                                {/* Header */}
                                <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
                                    <ImageWithPlaceholder src={activeApp.icon} alt={activeApp.title} className="w-32 h-32 rounded-3xl shadow-2xl" />
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                                            <h2 className="text-4xl font-bold">{activeApp.title}</h2>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
                                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm">{activeApp.version}</span>
                                            <span>{activeApp.genres.join(', ')}</span>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <span>★</span>
                                                <span>{activeApp.rating.toFixed(1)}</span>
                                            </div>
                                            <a
                                                href={activeApp.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full font-bold text-sm hover:bg-primary/90 transition-transform hover:scale-105 ml-auto md:ml-4"
                                            >
                                                {t('showcase.live_demo')} <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap mb-6">
                                            {activeApp.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Screenshots Grid */}
                                <h3 className="text-2xl font-bold mb-6">{t('showcase.screenshots')}</h3>
                                <div className={`grid gap-6 ${isLandscape ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                                    {currentScreenshots.map((src, idx) => (
                                        <div key={idx} className="relative w-full aspect-[2/3] md:aspect-auto">
                                            <ImageWithPlaceholder
                                                src={src}
                                                alt={`Screenshot ${idx + 1}`}
                                                className="w-full rounded-xl shadow-lg border border-white/5 hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Reviews Section */}
                                {activeApp.reviews && activeApp.reviews.length > 0 && (
                                    <div className="mt-12">
                                        <h3 className="text-2xl font-bold mb-6">{t('showcase.reviews')}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {activeApp.reviews.map((review, idx) => (
                                                <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-white">{review.title}</span>
                                                            <div className="flex text-yellow-400 text-xs">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-gray-500">{review.version}</span>
                                                    </div>
                                                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{review.content}</p>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>{review.country?.toUpperCase()}</span>
                                                        <span>- {review.author}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default AppShowcase;
