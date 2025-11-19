import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Loader2, AlertCircle, Monitor, Smartphone, Tablet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchDeveloperApps, type AppData } from '../services/appStore';

const AppShowcase = () => {
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
            case 'universal': return <div className="flex"><Smartphone className="w-4 h-4" /><Tablet className="w-4 h-4 -ml-1" /></div>;
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
                    <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredApps.map((app) => (
                            <motion.button
                                key={app.id}
                                onClick={() => setActiveApp(app)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border flex items-start gap-4 ${activeApp?.id === app.id
                                    ? 'bg-white/10 border-primary/50 shadow-lg shadow-primary/10'
                                    : 'bg-surface border-white/5 hover:bg-white/5'
                                    }`}
                            >
                                <img src={app.icon} alt={app.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
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
                        {filteredApps.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                No apps found for this filter.
                            </div>
                        )}
                    </div>

                    {/* Active App Detail View */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {activeApp && (
                                <motion.div
                                    key={activeApp.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-surface border border-white/10 rounded-3xl overflow-hidden flex flex-col h-full"
                                >
                                    {/* Screenshot Display Area */}
                                    <div className="w-full relative overflow-hidden group bg-black/50 p-6 flex items-center justify-center min-h-[400px]">
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
                                                    <motion.img
                                                        key={currentScreenshots[currentScreenshotIndex]}
                                                        src={currentScreenshots[currentScreenshotIndex]}
                                                        alt="App Screenshot"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        className="max-w-full max-h-[400px] object-contain rounded-lg shadow-2xl"
                                                    />
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
                                                    <motion.img
                                                        key={src}
                                                        src={src}
                                                        alt={`Screenshot ${idx}`}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="w-1/3 max-w-[240px] object-contain rounded-xl shadow-xl border border-white/10"
                                                    />
                                                ))
                                            )}
                                        </div>

                                        {/* View Details Button (Overlay) */}
                                        <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-8 pointer-events-none">
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="pointer-events-auto px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform shadow-lg flex items-center gap-2"
                                            >
                                                View Details <ExternalLink className="w-4 h-4" />
                                            </button>
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

                                        <p className="text-gray-300 text-base mb-8 leading-relaxed whitespace-pre-wrap line-clamp-4 flex-1">
                                            {activeApp.description}
                                        </p>

                                        <div className="flex justify-between items-center mt-auto">
                                            <div className="flex flex-wrap gap-3">
                                                {activeApp.genres.slice(0, 3).map((tag) => (
                                                    <span key={tag} className="px-4 py-2 bg-white/5 rounded-full text-sm text-gray-300 border border-white/5">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="text-primary hover:underline text-sm font-medium"
                                            >
                                                Read More
                                            </button>
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
                            className="bg-surface w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 shadow-2xl relative z-10 custom-scrollbar"
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
                                    <img src={activeApp.icon} alt={activeApp.title} className="w-32 h-32 rounded-3xl shadow-2xl" />
                                    <div className="flex-1">
                                        <h2 className="text-4xl font-bold mb-2">{activeApp.title}</h2>
                                        <div className="flex flex-wrap items-center gap-4 text-gray-400 mb-6">
                                            <span className="px-3 py-1 bg-white/10 rounded-full text-sm">{activeApp.version}</span>
                                            <span>{activeApp.genres.join(', ')}</span>
                                            <div className="flex items-center gap-1 text-yellow-400">
                                                <span>★</span>
                                                <span>{activeApp.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                                            {activeApp.description}
                                        </p>
                                        <div className="mt-8">
                                            <a
                                                href={activeApp.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-full font-bold text-lg hover:bg-primary/90 transition-transform hover:scale-105"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                                {t('showcase.live_demo')}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Screenshots Grid */}
                                <h3 className="text-2xl font-bold mb-6">Screenshots</h3>
                                <div className={`grid gap-6 ${isLandscape ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
                                    {currentScreenshots.map((src, idx) => (
                                        <img
                                            key={idx}
                                            src={src}
                                            alt={`Screenshot ${idx + 1}`}
                                            className="w-full rounded-xl shadow-lg border border-white/5 hover:scale-[1.02] transition-transform duration-300"
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default AppShowcase;
