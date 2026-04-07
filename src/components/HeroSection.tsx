import { Sparkles, ArrowDown, Instagram, Leaf, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const scrollToProducts = () => {
    const productsSection = document.getElementById('products');
    productsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-28 md:pt-32 pb-16">
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Limitovaná edice badge — visual glow + particles, GPU-optimized */}
        <div className="relative inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 mb-8 md:mb-10 rounded-2xl animate-levitate">
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

        <p className="text-sm md:text-xl text-gray-200 mb-8 md:mb-10 max-w-3xl mx-auto leading-relaxed font-light px-2 md:px-0">
          Exkluzivní kolekce pěstovaná v <span className="text-green-400 font-semibold">kontrolovaném prostředí</span> s péčí o každý detail.
          Každá odrůda s <span className="text-cyan-400 font-semibold">jedinečným charakterem</span> a příběhem.
        </p>

        {/* Trust badges — glassmorphism, each with unique gradient accent */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mb-8 md:mb-10">
          {[
            { icon: ShieldCheck, text: 'Laboratorně testováno', gradient: 'from-emerald-400/20 via-teal-400/10 to-transparent', borderColor: 'rgba(52,211,153,0.25)', iconColor: '#34D399', textColor: '#a7f3d0' },
            { icon: Leaf, text: '100% přírodní složení', gradient: 'from-green-400/20 via-emerald-500/10 to-transparent', borderColor: 'rgba(16,185,129,0.25)', iconColor: '#10b981', textColor: '#a7f3d0' },
            { icon: Truck, text: 'Diskrétní doručení 24h', gradient: 'from-cyan-400/20 via-blue-400/10 to-transparent', borderColor: 'rgba(34,211,238,0.25)', iconColor: '#22d3ee', textColor: '#cffafe' },
          ].map((b, i) => (
            <div key={i}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl backdrop-blur-md bg-gradient-to-r ${b.gradient} transition-all duration-500 hover:scale-105`}
              style={{
                border: `1px solid ${b.borderColor}`,
                boxShadow: `0 0 20px ${b.borderColor}40, inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.06] group-hover:bg-white/[0.1] transition-colors">
                <b.icon className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" style={{ color: b.iconColor }} />
              </div>
              <span className="text-xs font-semibold tracking-wide" style={{ color: b.textColor }}>{b.text}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <button
            onClick={scrollToProducts}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold hover:from-emerald-500 hover:to-teal-500 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <span>Prohlédnout kolekci</span>
            <ArrowDown className="w-4 h-4 animate-bounce group-hover:text-yellow-300 transition-colors" style={{ animationDuration: '2s' }} />
          </button>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-400/10 border border-yellow-400/25 backdrop-blur-sm hover:bg-yellow-400/15 hover:border-yellow-400/40 hover:scale-105 transition-all duration-300 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-yellow-200 text-sm font-semibold">
              <span className="text-yellow-100 font-black">-15%</span> za registraci
            </span>
          </Link>
        </div>

        {/* Instagram */}
        <div className="flex items-center justify-center mt-2">
          <a
            href="https://www.instagram.com/tajnabotanika"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/20 text-pink-300 hover:text-pink-200 hover:border-pink-400/40 hover:scale-105 transition-all duration-300 text-sm font-medium group"
          >
            <Instagram className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            <span>@tajnabotanika</span>
          </a>
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
