import { useState, useEffect } from 'react';
import { Sparkles, ArrowDown, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const [badgeVisible, setBadgeVisible] = useState(true);

  useEffect(() => {
    // Badge visible immediately. Hide after 12s, reappear after 3min.
    const hideTimer = setTimeout(() => setBadgeVisible(false), 12000);
    const reshowTimer = setTimeout(() => setBadgeVisible(true), 180000);
    return () => { clearTimeout(hideTimer); clearTimeout(reshowTimer); };
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 md:pt-32 pb-16">
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Limitovaná edice badge — premium glassmorphism with inner light */}
        <div className={`relative inline-flex items-center mb-8 md:mb-10 animate-levitate transition-all duration-1000 ${badgeVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-6 scale-95 pointer-events-none'}`}>
          {/* Outer glow layers */}
          <div className="absolute -inset-4 rounded-3xl opacity-60 blur-xl animate-badge-glow"
            style={{ background: 'conic-gradient(from 0deg, rgba(251,191,36,0.3), rgba(236,72,153,0.3), rgba(168,85,247,0.3), rgba(16,185,129,0.2), rgba(251,191,36,0.3))' }} />
          <div className="absolute -inset-1 rounded-2xl opacity-40 blur-sm"
            style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.4), rgba(236,72,153,0.3), rgba(168,85,247,0.4))' }} />

          {/* Main badge body */}
          <div className="relative px-7 md:px-10 py-3.5 md:py-4 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(251,191,36,0.2)',
            }}>

            {/* Shimmer sweep */}
            <div className="absolute inset-0 animate-badge-shimmer"
              style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 45%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.06) 55%, transparent 60%)', backgroundSize: '250% 100%' }} />

            {/* Top edge light */}
            <div className="absolute top-0 left-[15%] right-[15%] h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(251,191,36,0.5), rgba(236,72,153,0.5), rgba(168,85,247,0.5), transparent)' }} />

            {/* Content */}
            <div className="relative flex items-center gap-3 z-10">
              {/* Left diamond */}
              <div className="w-5 h-5 rotate-45 rounded-sm flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.3), rgba(236,72,153,0.2))', border: '1px solid rgba(251,191,36,0.3)' }}>
                <Sparkles className="w-3 h-3 -rotate-45 text-yellow-300" style={{ filter: 'drop-shadow(0 0 6px rgba(250,204,21,0.8))' }} />
              </div>

              {/* Text with breathing glow */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] md:text-xs font-medium tracking-[0.3em] uppercase text-yellow-400/60 mb-0.5">
                  kolekce
                </span>
                <span className="text-sm md:text-base font-black tracking-[0.15em] uppercase animate-badge-text"
                  style={{
                    background: 'linear-gradient(135deg, #fde68a, #fbbf24, #f59e0b, #ec4899, #a855f7, #fbbf24)',
                    backgroundSize: '300% 100%',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.4))',
                  }}>
                  Limitovaná edice
                </span>
              </div>

              {/* Right diamond */}
              <div className="w-5 h-5 rotate-45 rounded-sm flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(236,72,153,0.3))', border: '1px solid rgba(168,85,247,0.3)' }}>
                <Sparkles className="w-3 h-3 -rotate-45 text-pink-300" style={{ filter: 'drop-shadow(0 0 6px rgba(236,72,153,0.8))' }} />
              </div>
            </div>
          </div>

          {/* Floating micro-particles */}
          {[0,1,2,3,4].map(i => (
            <div key={i} className="absolute w-1 h-1 rounded-full animate-badge-particle"
              style={{
                background: ['#fbbf24','#ec4899','#a855f7','#10b981','#fbbf24'][i],
                boxShadow: `0 0 4px ${['#fbbf24','#ec4899','#a855f7','#10b981','#fbbf24'][i]}`,
                left: `${15 + i * 18}%`,
                top: '-8px',
                animationDelay: `${i * 0.8}s`,
                animationDuration: `${2.5 + i * 0.5}s`,
              }} />
          ))}
        </div>

        <h1 className="text-3xl md:text-7xl lg:text-8xl font-black mb-5 md:mb-8 tracking-tight">
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

        <p className="text-sm md:text-xl text-gray-200 mb-6 md:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2 md:px-0">
          Exkluzivní kolekce pěstovaná v <span className="text-green-400 font-semibold">kontrolovaném prostředí</span> s péčí o každý detail.
          Každá odrůda s <span className="text-cyan-400 font-semibold">jedinečným charakterem</span> a příběhem.
        </p>

        {/* 15% sleva — compact pill, elegant */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 mb-6 rounded-full bg-yellow-400/10 border border-yellow-400/25 backdrop-blur-sm hover:bg-yellow-400/15 hover:border-yellow-400/40 hover:scale-105 transition-all duration-300 group"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-yellow-200 text-sm font-semibold">
            <span className="text-yellow-100 font-black">15% sleva</span> za registraci
          </span>
          <span className="text-yellow-400/60 text-xs group-hover:text-yellow-400 transition-colors">→</span>
        </Link>

        {/* Scroll down + Instagram — centered, symmetric, compact on mobile */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <a
            href="https://www.instagram.com/tajnabotanika"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/20 text-pink-300 hover:text-pink-200 hover:border-pink-400/40 hover:scale-105 transition-all duration-300 text-xs md:text-sm font-medium group"
          >
            <Instagram className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>@tajnabotanika</span>
          </a>

          <button
            onClick={scrollToProducts}
            className="inline-flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-white/30 hover:scale-105 transition-all duration-300 text-xs md:text-sm font-medium cursor-pointer group"
            data-cursor-hover
          >
            <span>Objevte kolekci</span>
            <ArrowDown className="w-3.5 h-3.5 md:w-4 md:h-4 animate-bounce group-hover:text-emerald-400 transition-colors" style={{ animationDuration: '2s' }} />
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
        @keyframes badge-glow {
          0%, 100% { transform: rotate(0deg); opacity: 0.5; }
          50% { transform: rotate(180deg); opacity: 0.7; }
        }
        .animate-badge-glow {
          animation: badge-glow 8s linear infinite;
        }
        @keyframes badge-shimmer {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-badge-shimmer {
          animation: badge-shimmer 4s ease-in-out infinite;
        }
        @keyframes badge-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-badge-text {
          animation: badge-text 5s ease infinite;
        }
        @keyframes badge-particle {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-30px) scale(0); opacity: 0; }
        }
        .animate-badge-particle {
          animation: badge-particle ease-out infinite;
        }
      `}</style>
    </section>
  );
}
