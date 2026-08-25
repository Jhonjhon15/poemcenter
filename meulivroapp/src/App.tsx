import Navbar from './components/Navbar';
import Hero from './components/Hero';
import PoemCardGrid from './components/PoemCardGrid';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-night-950 bg-radial-night overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <PoemCardGrid />
      </main>
      <Footer />
    </div>
  );
}
