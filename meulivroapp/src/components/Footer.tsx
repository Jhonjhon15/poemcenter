export default function Footer() {
  return (
    <footer className="relative border-t border-gold-500/10 px-6 py-12 text-center">
      <div className="mx-auto max-w-4xl">
        <span className="text-gold-500/30 text-2xl font-serif block mb-4">❧</span>
        <p className="font-serif italic text-cream-300/40 text-base mb-2">
          "Toda página em branco é um convite."
        </p>
        <p className="font-sans text-xs text-cream-300/25 tracking-wider uppercase">
          PoemCenter · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
