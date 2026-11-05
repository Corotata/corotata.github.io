import { useState } from 'react';
import Hero from '../components/Hero';
import AppShowcase from '../components/AppShowcase';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();
    const [appCount, setAppCount] = useState(15);

    return (
        <>
            <Hero />
            <AppShowcase onAppsCountUpdate={setAppCount} />

            {/* About Section */}
            <section id="about" className="py-20 bg-surface/50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-8">{t('about.title')}</h2>
                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                        {t('about.description')}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <h3 className="text-4xl font-bold text-primary mb-2">{appCount}+</h3>
                            <p className="text-sm text-gray-500">{t('about.stats.apps')}</p>
                        </div>
                        <div>
                            <h3 className="text-4xl font-bold text-secondary mb-2">50k+</h3>
                            <p className="text-sm text-gray-500">{t('about.stats.users')}</p>
                        </div>
                        <div>
                            <h3 className="text-4xl font-bold text-accent mb-2">98%</h3>
                            <p className="text-sm text-gray-500">{t('about.stats.satisfaction')}</p>
                        </div>
                        <div>
                            <h3 className="text-4xl font-bold text-white mb-2">{new Date().getFullYear() - 2012 - 1}+</h3>
                            <p className="text-sm text-gray-500">{t('about.stats.experience')}</p>
                        </div>
                    </div>
                </div>
            </section>

        </>
    );
};

export default Home;
