
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AppShowcase from './components/AppShowcase';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-background min-h-screen text-text-primary selection:bg-primary selection:text-white">
      <Navbar />

      <main>
        <Hero />
        <AppShowcase />

        {/* About Section - Simplified for now, can be expanded */}
        <section id="about" className="py-20 bg-surface/50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-8">About The Developer</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              With over 5 years of experience in full-stack development, I specialize in building
              scalable, high-performance web applications. My passion lies in creating intuitive
              user experiences that solve real-world problems.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <h3 className="text-4xl font-bold text-primary mb-2">10+</h3>
                <p className="text-sm text-gray-500">Apps Launched</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-secondary mb-2">50k+</h3>
                <p className="text-sm text-gray-500">Active Users</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-accent mb-2">99%</h3>
                <p className="text-sm text-gray-500">Client Satisfaction</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold text-white mb-2">5+</h3>
                <p className="text-sm text-gray-500">Years Experience</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
          <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-3xl font-bold mb-6">Ready to Start a Project?</h2>
            <p className="text-gray-400 mb-8">
              I'm always open to discussing product design work or partnership opportunities.
            </p>
            <a href="mailto:hello@example.com" className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">
              Get in Touch
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
