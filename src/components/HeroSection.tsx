import { Leaf, ArrowDown } from 'lucide-react';
import DewEffect from './DewEffect';
import FlyingUFOs from './FlyingUFOs';

export default function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-slate-900 to-green-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.12),transparent_50%)]" />
        <div className="absolute inset-0 animate-color-shift" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] pointer-events-none" style={{ backdropFilter: 'blur(0.5px)' }} />

      <FlyingUFOs />
      <DewEffect />

      <div className="absolute inset-0 opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${12 + Math.random() * 8}s`,
            }}
          >
            <Leaf
              className="text-green-400/40"
              size={20 + Math.random() * 40}
              style={{
                transform: `rotate(${Math.random() * 360}deg) translateZ(0)`,
                filter: 'blur(1px)'
              }}
            />
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <div className="relative inline-flex items-center gap-3 px-8 py-4 mb-10 mt-20 md:mt-0 rounded-2xl animate-levitate">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl backdrop-blur-xl border border-emerald-500/30" />

          <div className="relative flex items-center gap-3 z-10">
            <Leaf className="w-6 h-6 text-emerald-300" />
            <span className="text-base font-semibold tracking-wide text-emerald-100">
              Botanické materiály pro sběratele
            </span>
          </div>
        </div>

        <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-4 md:mb-8 tracking-tight">
          <span className="block bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
            Rostlinné vzorky
          </span>
          <span className="block bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent animate-gradient drop-shadow-2xl">
            pro dokumentaci
          </span>
          <span className="block text-lg md:text-4xl mt-2 md:mt-4 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-300 bg-clip-text text-transparent font-light tracking-wide animate-gradient-slow">
            Technické specifikace a laboratorní analýzy
          </span>
        </h1>

        <p className="text-base md:text-xl text-gray-200 mb-3 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-4">
          Nabízíme botanické materiály určené výhradně ke <span className="text-emerald-400 font-semibold">studijním, sběratelským a analytickým účelům</span>.
          Každá položka je <span className="text-cyan-400 font-semibold">laboratorně testována</span> a dodávána s certifikátem.
        </p>

        <div className="relative inline-flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 mb-16 md:mb-12 rounded-xl animate-fade-in backdrop-blur-xl overflow-hidden max-w-[95%] md:max-w-none bg-white/5 border border-white/10">
          <div className="text-gray-300 text-sm md:text-base">
            Produkty nejsou určeny ke konzumaci
          </div>
        </div>
      </div>

      <button
        onClick={scrollToProducts}
        className="absolute bottom-2 md:bottom-2 left-1/2 -translate-x-1/2 animate-bounce-slow cursor-pointer group z-20"
        data-cursor-hover
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-white text-xs md:text-sm font-bold group-hover:text-white/90 transition-all">
            Zobrazit katalog
          </span>
          <div className="relative">
            <div className="relative w-5 h-5 rounded-full border-2 border-white backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-all bg-emerald-500/20">
              <ArrowDown className="w-5 h-5 text-white animate-bounce-arrow" />
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
        @keyframes color-shift {
          0%, 100% {
            background: radial-gradient(ellipse at top left, rgba(168,85,247,0.1), transparent 50%);
          }
          25% {
            background: radial-gradient(ellipse at bottom, rgba(34,197,94,0.12), transparent 50%);
          }
          50% {
            background: radial-gradient(ellipse at top right, rgba(251,146,60,0.12), transparent 50%);
          }
          75% {
            background: radial-gradient(ellipse at bottom left, rgba(59,130,246,0.1), transparent 50%);
          }
        }
        .animate-color-shift {
          animation: color-shift 20s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 1.2s ease-out;
        }
        @keyframes float {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(15px, -30px, 0) rotate(8deg);
          }
          50% {
            transform: translate3d(-15px, -60px, 0) rotate(-8deg);
          }
          75% {
            transform: translate3d(15px, -30px, 0) rotate(5deg);
          }
        }
        .animate-float {
          animation: float ease-in-out infinite;
          transform: translateZ(0);
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
      `}</style>
    </section>
  );
}
