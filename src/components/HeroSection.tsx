import { Sparkles, ArrowDown, Instagram } from 'lucide-react';

export default function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-24 pb-16">
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Limitovaná edice badge — visual glow + particles, GPU-optimized */}
        <div className="relative inline-flex items-center gap-3 px-8 py-4 mb-10 rounded-2xl animate-levitate">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-orange-500/40 via-pink-500/30 to-purple-500/30 rounded-2xl backdrop-blur-xl border-2 animate-rainbow-glow" style={{ backgroundSize: '300% 100%' }} />

          {/* Orbiting particles — reduced from 20 to 8, GPU only */}
          <div className="absolute -inset-3">
            {[0,1,2,3,4,5,6,7].map((i) => {
              const colors = ['#fbbf24', '#f97316', '#ec4899', '#a855f7'];
              const color = colors[i % colors.length];
              return (
                <div
                  key={i}
                  className="absolute rounded-full animate-orbit-particle"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: '5px',
                    height: '5px',
                    backgroundColor: color,
                    animationDelay: `${i * 0.45}s`,
                    animationDuration: '3.6s',
                    boxShadow: `0 0 10px ${color}`,
                    contain: 'layout style paint',
                  }}
                />
              );
            })}
          </div>

          <div className="relative flex items-center gap-3 z-10">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-spin-slow" style={{ filter: 'drop-shadow(0 0 12px rgba(250, 204, 21, 1))' }} />
            <span className="text-base font-black tracking-wider bg-gradient-to-r from-yellow-200 via-orange-300 via-pink-300 to-yellow-200 bg-clip-text text-transparent animate-gradient-text" style={{ backgroundSize: '300% 100%' }}>
              LIMITOVANÁ EDICE 2026
            </span>
            <Sparkles className="w-6 h-6 text-pink-300 animate-spin-slow" style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 1))' }} />
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
        <div className="relative inline-flex items-center justify-center gap-2 md:gap-3 px-3 md:px-8 py-2.5 md:py-4 mb-4 md:mb-6 rounded-xl md:rounded-2xl backdrop-blur-xl overflow-hidden group hover:scale-105 transition-all duration-500 max-w-[280px] md:max-w-none mx-auto">
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

        {/* Scroll down + Instagram — centered, compact */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <a
            href="https://www.instagram.com/tajnabotanika"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/20 text-pink-300 hover:text-pink-200 hover:border-pink-400/40 hover:scale-105 transition-all duration-300 text-sm font-medium group"
          >
            <Instagram className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>@tajnabotanika</span>
          </a>

          <button
            onClick={scrollToProducts}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 hover:scale-105 transition-all duration-300 text-sm font-medium cursor-pointer group"
            data-cursor-hover
          >
            <span>Objevte naši kolekci</span>
            <ArrowDown className="w-4 h-4 animate-bounce group-hover:text-emerald-400 transition-colors" style={{ animationDuration: '2s' }} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes levitate {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }
        .animate-levitate {
          animation: levitate 3s ease-in-out infinite;
          transform: translateZ(0);
        }
        @keyframes rainbow-glow {
          0%, 100% {
            box-shadow: 0 0 30px rgba(251,146,60,0.6), 0 0 60px rgba(250,204,21,0.4), inset 0 0 20px rgba(251,146,60,0.3);
            border-color: rgba(251,146,60,0.7);
          }
          33% {
            box-shadow: 0 0 30px rgba(236,72,153,0.6), 0 0 60px rgba(168,85,247,0.4), inset 0 0 20px rgba(236,72,153,0.3);
            border-color: rgba(236,72,153,0.7);
          }
          66% {
            box-shadow: 0 0 30px rgba(168,85,247,0.6), 0 0 60px rgba(251,146,60,0.4), inset 0 0 20px rgba(168,85,247,0.3);
            border-color: rgba(168,85,247,0.7);
          }
        }
        .animate-rainbow-glow {
          animation: rainbow-glow 4s ease-in-out infinite;
          will-change: box-shadow;
        }
        @keyframes orbit-particle {
          0% {
            transform: translate(-50%,-50%) rotate(0deg) translateX(50px) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            transform: translate(-50%,-50%) rotate(360deg) translateX(50px) rotate(-360deg);
            opacity: 0;
          }
        }
        .animate-orbit-particle {
          animation: orbit-particle linear infinite;
          will-change: transform;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 5s linear infinite;
        }
        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-text {
          animation: gradient-text 6s ease infinite;
        }
      `}</style>
    </section>
  );
}
