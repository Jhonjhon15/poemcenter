interface PoemPreview {
  title: string;
  excerpt: string;
  author: string;
  part: string;
}

const POEM_PREVIEWS: PoemPreview[] = [
  {
    title: 'Entre Versos e Silêncios',
    excerpt: 'Há palavras que não ousam sair — dormem entre as linhas como quem espera a manhã...',
    author: 'Jhonatan Mendes',
    part: 'Parte I',
  },
  {
    title: 'O Último Romântico',
    excerpt: 'E se eu te dissesse que a noite também tem medo do escuro, mas canta mesmo assim?',
    author: 'Jhonatan Mendes',
    part: 'Parte II',
  },
  {
    title: 'Carta ao Vento',
    excerpt: 'Escrevi teu nome em todas as línguas que o silêncio conhece — e o vento as levou todas.',
    author: 'Jhonatan Mendes',
    part: 'Parte III',
  },
  {
    title: 'A Vela e a Sombra',
    excerpt: 'A chama não pergunta se vale a pena queimar — apenas arde, e ilumina o que pode.',
    author: 'Jhonatan Mendes',
    part: 'Parte IV',
  },
  {
    title: 'Noite de Veludo',
    excerpt: 'Deito-me sobre o escuro como quem se cobre com um manto — e o manto me aquece de estrelas.',
    author: 'Jhonatan Mendes',
    part: 'Parte V',
  },
  {
    title: 'O Vinil e a Saudade',
    excerpt: 'A música gira no toca-discos da memória — e eu danço sozinho com quem já partiu.',
    author: 'Jhonatan Mendes',
    part: 'Parte VI',
  },
];

export default function PoemCardGrid() {
  return (
    <section id="estante" className="relative px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="text-gold-500/40 text-3xl font-serif block mb-4">❧</span>
          <h2 className="font-serif italic text-3xl md:text-4xl text-gold-400 mb-4">
            Prévias da Estante
          </h2>
          <p className="font-sans text-sm text-cream-300/50 max-w-md mx-auto leading-relaxed">
            Fragmentos de versos que repousam no santuário — uma amostra do que aguarda entre as páginas.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {POEM_PREVIEWS.map((poem, index) => (
            <article
              key={index}
              className="group relative flex flex-col rounded-xl border border-gold-500/10 bg-night-800/40 backdrop-blur-sm p-7 transition-all duration-500 hover:border-gold-500/30 hover:bg-night-800/60 hover:shadow-[0_12px_40px_-12px_rgba(212,175,55,0.15)] animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Ornament */}
              <div className="flex items-center justify-between mb-5">
                <span className="font-serif text-2xl text-gold-500/40">❧</span>
                <span className="font-sans text-[10px] uppercase tracking-[0.15em] text-cream-300/30">
                  {poem.part}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif italic text-xl text-cream-100 mb-4 leading-snug">
                {poem.title}
              </h3>

              {/* Excerpt */}
              <p className="font-serif text-base text-cream-300/50 leading-relaxed italic mb-6 flex-1">
                "{poem.excerpt}"
              </p>

              {/* Footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-gold-500/10">
                <span className="w-1.5 h-1.5 rounded-full bg-gold-500/40 group-hover:bg-gold-500/70 transition-colors" />
                <span className="font-sans text-xs uppercase tracking-wider text-cream-300/40">
                  {poem.author}
                </span>
              </div>

              {/* Hover glow line */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-0 bg-gradient-to-r from-transparent via-gold-500/50 to-transparent transition-all duration-500 group-hover:w-3/4" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
