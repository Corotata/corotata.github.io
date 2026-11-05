import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import LegalPage from './pages/LegalPage';

function App() {
  return (
    <Router>
      <div className="bg-background min-h-screen text-text-primary selection:bg-primary selection:text-white flex flex-col">
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy" element={<LegalPage mode="privacy" />} />
            <Route path="/privacy/*" element={<LegalPage mode="privacy" />} />
            <Route path="/support" element={<LegalPage mode="support" />} />
            <Route path="/support/*" element={<Navigate to="/support" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
