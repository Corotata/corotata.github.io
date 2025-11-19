import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code2, Github, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass py-4' : 'py-6 bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <Code2 className="w-8 h-8 text-primary" />
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        DevPortfolio
                    </span>
                </div>

                <div className="hidden md:flex items-center space-x-8">
                    <a href="#showcase" className="text-gray-300 hover:text-white transition-colors">{t('nav.apps')}</a>
                    <a href="#about" className="text-gray-300 hover:text-white transition-colors">{t('nav.about')}</a>
                    <a href="#contact" className="text-gray-300 hover:text-white transition-colors">{t('nav.contact')}</a>
                </div>

                <div className="flex items-center space-x-4">
                    <LanguageSwitcher />
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Github className="w-5 h-5" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Twitter className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
