import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Estante', href: '#estante' },
  { label: 'Atmosfera', href: '#atmosfera' },
  { label: 'Manifesto', href: '#manifesto' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-night-950/85 backdrop-blur-md border-b border-gold-500/10 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <a href="#inicio" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="PoemCenter"
            className="w-9 h-9 object-contain transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
          />
          <span className="font-serif text-xl tracking-wide text-gold-400 italic">
            PoemCenter
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-10">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-sans text-sm text-cream-300/70 hover:text-gold-400 transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:h-px after:w-0 after:bg-gold-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="/home.html"
          className="hidden md:inline-flex items-center gap-2 rounded-full border border-gold-500/30 px-5 py-2 text-sm text-gold-400 hover:bg-gold-500/10 hover:border-gold-500/60 transition-all duration-300"
        >
          Entrar
        </a>

        <button
          className="md:hidden text-gold-400 text-2xl"
          aria-label="Abrir menu"
          onClick={() => {
            const menu = document.getElementById('mobile-menu');
            menu?.classList.toggle('hidden');
          }}
        >
          ☰
        </button>
      </nav>

      <div
        id="mobile-menu"
        className="hidden md:hidden absolute top-full left-0 right-0 bg-night-900/95 backdrop-blur-md border-b border-gold-500/10 px-6 py-4"
      >
        <ul className="flex flex-col gap-4">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="font-sans text-sm text-cream-300/70 hover:text-gold-400 transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/home.html"
              className="inline-flex items-center rounded-full border border-gold-500/30 px-5 py-2 text-sm text-gold-400"
            >
              Entrar
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
