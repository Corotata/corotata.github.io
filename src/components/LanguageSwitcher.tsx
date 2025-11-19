import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const currentLang = i18n.language;
        let newLang = 'en';

        if (currentLang === 'en') {
            newLang = 'zh'; // Simplified Chinese
        } else if (currentLang === 'zh' || currentLang === 'zh-CN') {
            newLang = 'zh-TW'; // Traditional Chinese
        } else {
            newLang = 'en';
        }

        i18n.changeLanguage(newLang);
    };

    const getLabel = (lang: string) => {
        if (lang === 'zh' || lang === 'zh-CN') return '简';
        if (lang === 'zh-TW') return '繁';
        return 'EN';
    };

    return (
        <motion.button
            onClick={toggleLanguage}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white flex items-center gap-2"
            title="Switch Language"
        >
            <Globe className="w-5 h-5" />
            <span className="text-sm font-medium uppercase">{getLabel(i18n.language)}</span>
        </motion.button>
    );
};

export default LanguageSwitcher;
