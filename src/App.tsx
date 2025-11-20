import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AppShowcase from './components/AppShowcase';
import Footer from './components/Footer';
import { useTranslation } from 'react-i18next';

function App() {
  const { t } = useTranslation();
  const [appCount, setAppCount] = useState(15);

  return (
    <div className="bg-background min-h-screen text-text-primary selection:bg-primary selection:text-white">
      <Navbar />

      <main>
        <Hero />
        <AppShowcase onAppsCountUpdate={setAppCount} />

        {/* About Section - Simplified for now, can be expanded */}
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

        {/* Contact Section */}
        <section id="contact" className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl font-bold mb-6">{t('contact.title')}</h2>
            <p className="text-gray-400 mb-8">
              {t('contact.description')}
            </p>
            <a href="mailto:myhdify@gmail.com" className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
              {t('contact.cta')}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
