export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-24 pb-16 text-center"
    >
      {/* Floating gold dust particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold-400/40"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              bottom: '-10px',
              animation: `floatUp ${14 + Math.random() * 16}s linear ${-Math.random() * 20}s infinite`,
              boxShadow: '0 0 6px rgba(227, 199, 120, 0.6)',
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.6); }
          10% { opacity: 0.8; }
          90% { opacity: 0.4; }
          100% { opacity: 0; transform: translateY(-100vh) scale(1); }
        }
      `}</style>

      {/* Ornament */}
      <div className="animate-fade-in mb-6 text-4xl text-gold-500/50 font-serif">
        ❧
      </div>

      {/* Logo */}
      <img
        src="/logo.png"
        alt="PoemCenter"
        className="w-20 h-20 object-contain mb-8 animate-fade-up drop-shadow-[0_0_20px_rgba(212,175,55,0.2)]"
      />

      {/* Title */}
      <h1
        className="font-serif italic font-medium text-5xl md:text-7xl leading-tight text-gradient-gold mb-6 animate-fade-up"
        style={{ animationDelay: '0.15s' }}
      >
        O Santuário dos Versos
      </h1>

      {/* Subtitle */}
      <p
        className="font-serif italic text-lg md:text-xl text-cream-300/60 max-w-xl leading-relaxed mb-10 animate-fade-up"
        style={{ animationDelay: '0.3s' }}
      >
        "Escrevo porque descobri que algumas partes de mim só sabem existir em palavras."
      </p>

      {/* Divider */}
      <div
        className="flex items-center gap-4 mb-10 animate-fade-in"
        style={{ animationDelay: '0.45s' }}
      >
        <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold-500/40" />
        <span className="text-gold-500/40 text-sm tracking-[0.3em] uppercase font-sans">
          Poesia Autoral
        </span>
        <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold-500/40" />
      </div>

      {/* CTA buttons */}
      <div
        className="flex flex-col sm:flex-row gap-4 animate-fade-up"
        style={{ animationDelay: '0.6s' }}
      >
        <a
          href="/home.html"
          className="rounded-full bg-gradient-to-br from-wood-800 to-night-900 border border-gold-500/40 px-8 py-3.5 font-serif text-lg text-gold-400 tracking-wider uppercase hover:text-cream-100 hover:border-gold-500/70 hover:shadow-[0_8px_30px_-8px_rgba(212,175,55,0.3)] transition-all duration-300"
        >
          Entrar no Santuário
        </a>
        <a
          href="#estante"
          className="rounded-full border border-cream-300/15 px-8 py-3.5 font-sans text-sm text-cream-300/70 hover:text-gold-400 hover:border-gold-500/30 transition-all duration-300"
        >
          Explorar a Estante
        </a>
      </div>
    </section>
  );
}
