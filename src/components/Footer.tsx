import { Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-surface border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            DevPortfolio
                        </h3>
                        <p className="text-gray-400 max-w-sm">
                            {t('hero.description')}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">{t('footer.quick_links')}</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">{t('nav.apps')}</a></li>
                            <li><a href="#showcase" className="text-gray-400 hover:text-primary transition-colors">{t('showcase.title')}</a></li>
                            <li><a href="#about" className="text-gray-400 hover:text-primary transition-colors">{t('nav.about')}</a></li>
                            <li><a href="#contact" className="text-gray-400 hover:text-primary transition-colors">{t('nav.contact')}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">{t('footer.connect')}</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} DevPortfolio. {t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
