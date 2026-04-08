import { Sparkles, ArrowDown, Instagram, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    if (productsSection) {
      const top = productsSection.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 md:pt-32 pb-16">
      {/* Ambient orange particles — limited edition vibe, GPU-only */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[
          { size: 80, x: '8%', y: '12%', delay: '0s', dur: '20s', opacity: 0.3 },
          { size: 60, x: '25%', y: '30%', delay: '2s', dur: '26s', opacity: 0.25 },
          { size: 100, x: '78%', y: '8%', delay: '4s', dur: '24s', opacity: 0.28 },
          { size: 70, x: '65%', y: '35%', delay: '6s', dur: '30s', opacity: 0.2 },
          { size: 90, x: '90%', y: '55%', delay: '1s', dur: '22s', opacity: 0.25 },
          { size: 55, x: '40%', y: '60%', delay: '8s', dur: '28s', opacity: 0.22 },
          { size: 75, x: '15%', y: '72%', delay: '10s', dur: '25s', opacity: 0.3 },
          { size: 65, x: '55%', y: '80%', delay: '3s', dur: '32s', opacity: 0.2 },
          { size: 85, x: '70%', y: '65%', delay: '12s', dur: '27s', opacity: 0.25 },
          { size: 50, x: '35%', y: '15%', delay: '5s', dur: '23s', opacity: 0.18 },
          { size: 95, x: '50%', y: '45%', delay: '7s', dur: '29s', opacity: 0.22 },
          { size: 60, x: '85%', y: '25%', delay: '9s', dur: '21s', opacity: 0.28 },
        ].map((p, i) => (
          <div
            key={`ambient-${i}`}
            className="absolute rounded-full animate-ambient-float"
            style={{
              width: p.size,
              height: p.size,
              left: p.x,
              top: p.y,
              background: `radial-gradient(circle, rgba(251,146,60,${p.opacity}) 0%, rgba(249,115,22,${p.opacity * 0.5}) 40%, transparent 70%)`,
              filter: 'blur(30px)',
              animationDelay: p.delay,
              animationDuration: p.dur,
              willChange: 'transform',
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Limitovaná edice badge — visual glow + particles, GPU-optimized */}
        <div className="relative inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 mb-8 md:mb-10 rounded-2xl animate-levitate hero-fade-in" style={{ animationDelay: '0.1s' }}>
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

        <h1 className="text-3xl md:text-7xl lg:text-8xl font-black mb-5 md:mb-8 tracking-tight hero-fade-in" style={{ animationDelay: '0.3s' }}>
          <span className="block bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-2xl whitespace-nowrap" style={{ textShadow: '0 0 80px rgba(34, 197, 94, 0.5)' }}>
            ČISTOTA V
          </span>
          <span className="block bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-2xl whitespace-nowrap" style={{ textShadow: '0 0 80px rgba(34, 197, 94, 0.5)' }}>
            KAŽDÉM DETAILU
          </span>
          <span className="block text-lg md:text-4xl mt-3 md:mt-4 bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-300 bg-clip-text text-transparent font-light tracking-wide">
            Laboratorní preciznost, přírodní dokonalost
          </span>
        </h1>

        <p className="text-sm md:text-xl text-gray-200 mb-6 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2 md:px-0 hero-fade-in" style={{ animationDelay: '0.5s' }}>
          Exkluzivní kolekce pěstovaná v <span className="text-green-400 font-semibold">kontrolovaném prostředí</span> s péčí o každý detail.
          Každá odrůda s <span className="text-cyan-400 font-semibold">jedinečným charakterem</span> a příběhem.
        </p>

        {/* 15% sleva — identical copy from tajnabotanika.com */}
        <Link
          to="/register"
          className="relative inline-flex items-center gap-2 md:gap-3 px-5 md:px-8 py-3 md:py-4 mb-14 rounded-2xl backdrop-blur-xl overflow-hidden group hover:scale-105 transition-all duration-500 cursor-pointer max-w-md md:max-w-none mx-auto hero-fade-in"
          style={{ animationDelay: '0.7s' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl animate-cta-gradient border-2 border-yellow-400/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-cta-shimmer" />
          <Sparkles className="relative z-10 w-4 h-4 md:w-5 md:h-5 text-yellow-400 shrink-0" />
          <div className="relative z-10 text-center">
            <span className="block text-yellow-300 font-bold text-xs md:text-lg leading-tight">
              Registrujte se a získejte{' '}
              <span className="text-yellow-100 text-sm md:text-2xl font-black">15% slevu</span>
            </span>
            <span className="block text-yellow-200/80 text-[10px] md:text-sm mt-0.5 md:mt-1 leading-tight">Slevový kód na jakoukoliv objednávku</span>
          </div>
          <Sparkles className="relative z-10 w-4 h-4 md:w-5 md:h-5 text-yellow-400 shrink-0" />
        </Link>

        {/* Tags — IG + 9 odrůd */}
        <div className="flex items-center justify-center gap-2 md:gap-3 flex-nowrap hero-fade-in" style={{ animationDelay: '0.9s' }}>
          <a
            href="https://www.instagram.com/tajnabotanika"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/20 text-pink-300 hover:text-pink-200 hover:border-pink-400/40 hover:scale-105 transition-all duration-300 text-xs md:text-sm font-medium group whitespace-nowrap"
          >
            <Instagram className="w-3 h-3 md:w-3.5 md:h-3.5 group-hover:rotate-12 transition-transform duration-300" />
            <span>@tajnabotanika</span>
          </a>

          <button
            onClick={scrollToProducts}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-full border hover:scale-105 transition-all duration-300 text-xs md:text-sm font-semibold cursor-pointer group whitespace-nowrap"
            style={{ background: 'rgba(153,27,27,0.2)', borderColor: 'rgba(185,28,28,0.4)' }}
          >
            <Leaf className="w-3 h-3 md:w-3.5 md:h-3.5 text-red-500 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-red-400">9 odrůd skladem</span>
          </button>
        </div>
      </div>

      {/* Scroll arrow — absolute bottom center of hero */}
      <div
        onClick={scrollToProducts}
        className="absolute bottom-3 left-1/2 z-10 flex flex-col items-center gap-0.5 text-white/20 hover:text-emerald-400 cursor-pointer group"
        style={{ transform: 'translateX(-50%)', transition: 'color 0.3s' }}
      >
        <span className="text-[10px] tracking-[0.2em] uppercase font-medium">Objevte naši kolekci</span>
        <ArrowDown className="w-5 h-5 animate-bounce" style={{ animationDuration: '2s' }} />
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
        @keyframes cta-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-cta-gradient {
          background-size: 200% 200%;
          animation: cta-gradient 8s ease infinite;
        }
        @keyframes cta-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-cta-shimmer {
          animation: cta-shimmer 3s ease-in-out infinite;
        }
        @keyframes hero-fade-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .hero-fade-in {
          opacity: 0;
          animation: hero-fade-in 0.8s ease-out forwards;
        }
        @keyframes ambient-float {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          25% {
            transform: translate3d(30px, -20px, 0) scale(1.1);
          }
          50% {
            transform: translate3d(-20px, -40px, 0) scale(0.95);
          }
          75% {
            transform: translate3d(15px, -15px, 0) scale(1.05);
          }
        }
        .animate-ambient-float {
          animation: ambient-float ease-in-out infinite;
          transform: translateZ(0);
        }
      `}</style>
    </section>
  );
}
