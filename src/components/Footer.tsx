import { Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();

    return (
        <footer className="bg-surface border-t border-white/5 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                            {t('nav.brand')}
                        </h3>
                        <p className="text-gray-400 max-w-sm">
                            {t('hero.description')}
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">{t('footer.quick_links')}</h4>
                        <ul className="space-y-4">
                            <li><a href="#" className="text-gray-400 hover:text-primary transition-colors">{t('nav.apps')}</a></li>
                            <li><a href="/#showcase" className="text-gray-400 hover:text-primary transition-colors">{t('showcase.title')}</a></li>
                            <li><a href="/blog" className="text-gray-400 hover:text-primary transition-colors">{t('nav.blog')}</a></li>
                            <li><a href="/#about" className="text-gray-400 hover:text-primary transition-colors">{t('nav.about')}</a></li>
                            <li><a href="/contact" className="text-gray-400 hover:text-primary transition-colors">{t('nav.contact')}</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">{t('footer.connect')}</h4>
                        <div className="flex space-x-4">
                            {/* 小红书使用文字图标，与邮箱保持相同的圆形触达区域。 */}
                            <a href="https://www.xiaohongshu.com/user/profile/5eb65cb60000000001000ce9"
                                target="_blank" rel="noopener noreferrer" aria-label="小红书 / Xiaohongshu" title="小红书 / Xiaohongshu"
                                className="w-11 h-11 inline-flex items-center justify-center bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all">
                                <span aria-hidden="true" className="text-[10px] font-bold tracking-tighter whitespace-nowrap">小红书</span>
                            </a>
                            <a href="mailto:myhdify@gmail.com" className="p-3 bg-white/5 rounded-full hover:bg-primary hover:text-white transition-all">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Corotata. {t('footer.rights')}</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
