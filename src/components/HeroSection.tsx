import { Sparkles, ArrowDown } from 'lucide-react';

export default function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-36 md:pt-0">
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="relative inline-flex items-center gap-3 px-8 py-4 mb-10 rounded-2xl animate-levitate">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 via-orange-500/40 via-pink-500/30 via-purple-500/30 to-yellow-500/30 rounded-2xl backdrop-blur-xl border-3 animate-rainbow-glow" style={{ backgroundSize: '300% 100%' }} />

          <div className="absolute -inset-3">
            {[...Array(12)].map((_, i) => {
              const colors = ['#fbbf24', '#f97316', '#ec4899', '#a855f7', '#eab308'];
              return (
                <div
                  key={i}
                  className="absolute rounded-full animate-orbit-particle"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: '6px',
                    height: '6px',
                    backgroundColor: colors[i % colors.length],
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '3.6s',
                    boxShadow: `0 0 15px ${colors[i % colors.length]}, 0 0 30px ${colors[i % colors.length]}`
                  }}
                />
              );
            })}
          </div>

          <div className="absolute -inset-5">
            {[...Array(8)].map((_, i) => {
              const colors = ['#fb923c', '#ec4899', '#d946ef', '#fbbf24'];
              return (
                <div
                  key={i}
                  className="absolute rounded-full animate-orbit-particle-orange"
                  style={{
                    left: '50%',
                    top: '50%',
                    width: '8px',
                    height: '8px',
                    backgroundColor: colors[i % colors.length],
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: '4.8s',
                    boxShadow: `0 0 20px ${colors[i % colors.length]}, 0 0 40px ${colors[i % colors.length]}`
                  }}
                />
              );
            })}
          </div>

          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-fast" />
          </div>

          <div className="relative flex items-center gap-3 z-10">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-spin-slow" style={{ filter: 'drop-shadow(0 0 12px rgba(250, 204, 21, 1)) drop-shadow(0 0 24px rgba(251, 146, 60, 0.8))' }} />
            <span className="text-base font-black tracking-wider bg-gradient-to-r from-yellow-200 via-orange-300 via-pink-300 via-purple-300 to-yellow-200 bg-clip-text text-transparent animate-gradient-rainbow" style={{ textShadow: '0 0 40px rgba(251, 146, 60, 1), 0 0 80px rgba(236, 72, 153, 0.8), 0 0 120px rgba(168, 85, 247, 0.6)', backgroundSize: '300% 100%' }}>
              LIMITOVANÁ EDICE 2026
            </span>
            <Sparkles className="w-6 h-6 text-pink-300 animate-spin-slow" style={{ animationDelay: '1s', filter: 'drop-shadow(0 0 12px rgba(236, 72, 153, 1)) drop-shadow(0 0 24px rgba(168, 85, 247, 0.8))' }} />
          </div>
        </div>

        <h1 className="text-[2.35rem] md:text-7xl lg:text-8xl font-black mb-8 tracking-tight">
          <span className="block bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-gradient drop-shadow-2xl whitespace-nowrap" style={{ textShadow: '0 0 80px rgba(34, 197, 94, 0.5)' }}>
            ČISTOTA V
          </span>
          <span className="block bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-gradient drop-shadow-2xl whitespace-nowrap" style={{ textShadow: '0 0 80px rgba(34, 197, 94, 0.5)' }}>
            KAŽDÉM DETAILU
          </span>
          <span className="block text-2xl md:text-4xl mt-4 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-300 bg-clip-text text-transparent font-light tracking-wide animate-gradient-slow">
            Laboratorní preciznost, přírodní dokonalost
          </span>
        </h1>

        <p className="text-[0.95rem] md:text-xl text-gray-200 mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2 md:px-0">
          Exkluzivní kolekce pěstovaná v <span className="text-green-400 font-semibold">kontrolovaném prostředí</span> s péčí o každý detail.
          Každá odrůda s <span className="text-cyan-400 font-semibold">jedinečným charakterem</span> a příběhem.
        </p>

        <div className="relative inline-flex items-center gap-2 md:gap-3 px-3 md:px-8 py-2.5 md:py-4 mb-14 mt-[-6px] md:mt-0 rounded-xl md:rounded-2xl animate-fade-in backdrop-blur-xl overflow-hidden group hover:scale-105 transition-all duration-500 max-w-[280px] md:max-w-none" style={{ animationDelay: '0.3s' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-xl md:rounded-2xl animate-gradient border-2 border-yellow-400/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-shimmer-slow" />

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
      </div>

      <button
        onClick={scrollToProducts}
        className="absolute bottom-[4px] md:bottom-2 left-1/2 -translate-x-1/2 animate-bounce-slow cursor-pointer group z-20"
        data-cursor-hover
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-white text-sm font-bold group-hover:text-white/90 transition-all animate-pulse-bright tracking-wide" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(251, 146, 60, 0.3)' }}>
            Objevte naši kolekci
          </span>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 blur-lg animate-pulse-glow" />
            <div className="relative w-5 h-5 rounded-full border-2 border-white backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-all animate-glow-white bg-gradient-to-br from-orange-500/20 to-amber-500/20" style={{ boxShadow: '0 0 25px rgba(251, 146, 60, 0.5), 0 0 50px rgba(251, 146, 60, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.1)' }}>
              <ArrowDown className="w-5 h-5 text-white animate-bounce-arrow" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.8))' }} />
            </div>
          </div>
        </div>
      </button>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }
        .animate-gradient-slow {
          background-size: 300% 300%;
          animation: gradient 12s ease infinite;
        }
        @keyframes rainbow-glow {
          0%, 100% {
            box-shadow: 0 0 40px rgba(251, 146, 60, 0.8), 0 0 80px rgba(250, 204, 21, 0.6), 0 0 120px rgba(236, 72, 153, 0.4), inset 0 0 30px rgba(251, 146, 60, 0.5);
            border-color: rgba(251, 146, 60, 0.8);
          }
          33% {
            box-shadow: 0 0 40px rgba(236, 72, 153, 0.8), 0 0 80px rgba(168, 85, 247, 0.6), 0 0 120px rgba(251, 146, 60, 0.4), inset 0 0 30px rgba(236, 72, 153, 0.5);
            border-color: rgba(236, 72, 153, 0.8);
          }
          66% {
            box-shadow: 0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(251, 146, 60, 0.6), 0 0 120px rgba(250, 204, 21, 0.4), inset 0 0 30px rgba(168, 85, 247, 0.5);
            border-color: rgba(168, 85, 247, 0.8);
          }
        }
        .animate-rainbow-glow {
          animation: rainbow-glow 3s ease-in-out infinite;
        }
        @keyframes gradient-rainbow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-rainbow {
          animation: gradient-rainbow 6s ease infinite;
        }
        @keyframes shimmer-diagonal {
          0% {
            transform: translate(-100%, -100%) rotate(45deg);
          }
          100% {
            transform: translate(200%, 200%) rotate(45deg);
          }
        }
        .animate-shimmer-diagonal {
          animation: shimmer-diagonal 4s ease-in-out infinite;
        }
        @keyframes orbit-particle {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(50px) rotate(0deg) translateZ(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) translateX(50px) rotate(-360deg) translateZ(0);
            opacity: 0;
          }
        }
        .animate-orbit-particle {
          animation: orbit-particle linear infinite;
          transform: translateZ(0);
        }
        @keyframes orbit-particle-orange {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(65px) rotate(0deg) translateZ(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) rotate(-360deg) translateX(65px) rotate(360deg) translateZ(0);
            opacity: 0;
          }
        }
        .animate-orbit-particle-orange {
          animation: orbit-particle-orange linear infinite;
          transform: translateZ(0);
        }
        @keyframes levitate {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }
        .animate-levitate {
          animation: levitate 3s ease-in-out infinite;
          transform: translateZ(0);
        }
        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out;
        }
        @keyframes shimmer-slow {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer-slow {
          animation: shimmer-slow 3s ease-in-out infinite;
        }
        @keyframes shimmer-fast {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer-fast {
          animation: shimmer-fast 2s ease-in-out infinite;
        }
        @keyframes pulse-red {
          0%, 100% {
            box-shadow: 0 0 20px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.1);
          }
          50% {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.6), inset 0 0 30px rgba(239, 68, 68, 0.2);
          }
        }
        .animate-pulse-red {
          animation: pulse-red 1.5s ease-in-out infinite;
        }
        @keyframes pulse-fast {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .animate-pulse-fast {
          animation: pulse-fast 1s ease-in-out infinite;
        }
        @keyframes pulse-bright {
          0%, 100% {
            opacity: 1;
            filter: brightness(1);
          }
          50% {
            opacity: 0.7;
            filter: brightness(1.3);
          }
        }
        .animate-pulse-bright {
          animation: pulse-bright 2s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translate3d(-50%, 0, 0);
          }
          50% {
            transform: translate3d(-50%, -10px, 0);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
          transform: translateZ(0);
        }
        @keyframes bounce-arrow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(4px);
          }
        }
        .animate-bounce-arrow {
          animation: bounce-arrow 1.5s ease-in-out infinite;
        }
        @keyframes glow-white {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(251, 146, 60, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px rgba(251, 146, 60, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.3);
          }
        }
        .animate-glow-white {
          animation: glow-white 2s ease-in-out infinite;
        }
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @media (max-width: 767px) {
          .animate-orbit-particle,
          .animate-orbit-particle-orange,
          .animate-levitate,
          .animate-spin-slow,
          .animate-shimmer-fast,
          .animate-shimmer-slow,
          .animate-gradient,
          .animate-gradient-slow,
          .animate-pulse-glow,
          .animate-glow-white,
          .animate-bounce-arrow,
          .animate-rainbow-glow,
          .animate-bounce-slow {
            will-change: transform, opacity;
            contain: layout style paint;
          }
        }
      `}</style>
    </section>
  );
}
