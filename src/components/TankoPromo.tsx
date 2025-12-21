import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Download, ExternalLink } from 'lucide-react';

const TankoPromo = () => {
    const { t, i18n } = useTranslation();

    const appStoreUrl = i18n.language.startsWith('zh')
        ? (i18n.language === 'zh-TW'
            ? "https://apps.apple.com/tw/app/tanko-%E6%BC%AB%E7%95%AB%E8%88%87%E5%9C%96%E7%89%87epub%E8%A3%BD%E4%BD%9C/id6755611046?uo=4"
            : "https://apps.apple.com/cn/app/tanko-%E6%BC%AB%E7%94%BB%E4%B8%8E%E5%9B%BE%E7%89%87epub%E5%88%B6%E4%BD%9C/id6755611046?uo=4")
        : "https://apps.apple.com/us/app/tanko-comic-artbook-maker/id6755611046?uo=4";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 pt-12 border-t border-white/10"
        >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 p-6 md:p-8">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    {/* App Icon */}
                    <div className="flex-shrink-0">
                        <img
                            src="https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/4a/92/83/4a92832a-4587-deaa-5044-d2dce5e86ed8/AppIcon-0-0-1x_U007epad-0-1-0-85-220.jpeg/100x100bb.jpg"
                            alt="Tanko App Icon"
                            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl shadow-xl border border-white/10"
                        />
                    </div>

                    {/* Text Content */}
                    <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {t('tanko_promo.title')}
                        </h3>
                        <p className="text-gray-400 mb-4 md:mb-0 max-w-xl">
                            {t('tanko_promo.description')}
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="flex-shrink-0">
                        <a
                            href={appStoreUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-sm md:text-base hover:bg-gray-200 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
                        >
                            <Download className="w-5 h-5" />
                            {t('tanko_promo.cta')}
                        </a>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TankoPromo;
