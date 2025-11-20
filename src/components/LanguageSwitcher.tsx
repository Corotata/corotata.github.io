import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'zh', label: '简体中文' },
        { code: 'zh-TW', label: '繁體中文' }
    ];

    const handleLanguageChange = (langCode: string) => {
        i18n.changeLanguage(langCode);
        setIsOpen(false);
    };

    const getDisplayLabel = (lang: string) => {
        if (lang === 'zh' || lang === 'zh-CN') return '简';
        if (lang === 'zh-TW') return '繁';
        return 'EN';
    };

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-full transition-colors flex items-center gap-2 ${isOpen ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
                title="Switch Language"
            >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase">{getDisplayLabel(i18n.language)}</span>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-32 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 backdrop-blur-xl bg-black/90"
                        >
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => handleLanguageChange(lang.code)}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 transition-colors flex items-center justify-between group"
                                >
                                    <span className={i18n.language === lang.code ? 'text-primary font-medium' : 'text-gray-300 group-hover:text-white'}>
                                        {lang.label}
                                    </span>
                                    {i18n.language === lang.code && <Check className="w-3 h-3 text-primary" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
