import { Sparkles, ArrowDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 md:pt-32">
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Limitovaná edice badge — clean, simple, elegant */}
        <div className="relative inline-flex items-center gap-3 px-8 py-4 mb-10 rounded-2xl animate-levitate">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl backdrop-blur-xl border-2 border-yellow-400/30" style={{ boxShadow: '0 0 40px rgba(251, 146, 60, 0.3), 0 0 80px rgba(236, 72, 153, 0.15)' }} />

          <div className="relative flex items-center gap-3 z-10">
            <Sparkles className="w-5 h-5 text-yellow-300" style={{ filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))' }} />
            <span className="text-base font-black tracking-wider bg-gradient-to-r from-yellow-200 via-orange-300 to-pink-300 bg-clip-text text-transparent" style={{ backgroundSize: '200% 100%' }}>
              LIMITOVANÁ EDICE 2026
            </span>
            <Sparkles className="w-5 h-5 text-pink-300" style={{ filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.8))' }} />
          </div>
        </div>

        <h1 className="text-[2.35rem] md:text-7xl lg:text-8xl font-black mb-8 tracking-tight">
          <span className="block bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-2xl whitespace-nowrap" style={{ textShadow: '0 0 80px rgba(34, 197, 94, 0.5)' }}>
            ČISTOTA V
          </span>
          <span className="block bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-2xl whitespace-nowrap" style={{ textShadow: '0 0 80px rgba(34, 197, 94, 0.5)' }}>
            KAŽDÉM DETAILU
          </span>
          <span className="block text-2xl md:text-4xl mt-4 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-300 bg-clip-text text-transparent font-light tracking-wide">
            Laboratorní preciznost, přírodní dokonalost
          </span>
        </h1>

        <p className="text-[0.95rem] md:text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2 md:px-0">
          Exkluzivní kolekce pěstovaná v <span className="text-green-400 font-semibold">kontrolovaném prostředí</span> s péčí o každý detail.
          Každá odrůda s <span className="text-cyan-400 font-semibold">jedinečným charakterem</span> a příběhem.
        </p>

        {/* 15% sleva banner */}
        <div className="relative inline-flex items-center justify-center gap-2 md:gap-3 px-3 md:px-8 py-2.5 md:py-4 mb-8 md:mb-10 rounded-xl md:rounded-2xl backdrop-blur-xl overflow-hidden group hover:scale-105 transition-all duration-500 max-w-[280px] md:max-w-none mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-xl md:rounded-2xl border-2 border-yellow-400/40" />

          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 animate-pulse relative z-10" />
          <div className="relative z-10 text-center">
            <span className="block text-yellow-300 font-bold text-sm md:text-lg">
              Zaregistrujte se a získejte{' '}
              <span className="text-yellow-100 text-lg md:text-2xl font-black">15% slevu</span>
            </span>
            <span className="block text-yellow-200/80 text-xs md:text-sm mt-0.5 md:mt-1">
              Slevový kód můžete uplatnit při jakékoliv objednávce
            </span>
          </div>
          <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 animate-pulse relative z-10" style={{ animationDelay: '0.5s' }} />
        </div>

        {/* Scroll down button — inside the centered container */}
        <button
          onClick={scrollToProducts}
          className="flex flex-col items-center gap-2 mx-auto cursor-pointer group mt-4 md:mt-6"
          data-cursor-hover
        >
          <span className="text-white/80 text-sm font-semibold group-hover:text-white transition-colors tracking-wide">
            Objevte naši kolekci
          </span>
          <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center group-hover:border-white/70 transition-all bg-white/5 backdrop-blur-sm animate-bounce" style={{ animationDuration: '2.5s' }}>
            <ArrowDown className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          </div>
        </button>
      </div>

      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }
        .animate-levitate {
          animation: levitate 4s ease-in-out infinite;
          transform: translateZ(0);
        }
      `}</style>
    </section>
  );
}
