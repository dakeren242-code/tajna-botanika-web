import { useEffect, useState } from 'react';

interface Effect {
  id: number;
  type: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export default function SpecialEffects() {
  const [effects, setEffects] = useState<Effect[]>([]);

  useEffect(() => {
    const types = ['ufo', 'bubble', 'icecream', 'gold', 'pineapple', 'skittle', 'wave'];
    const newEffects: Effect[] = [];

    types.forEach((type, index) => {
      for (let i = 0; i < 3; i++) {
        newEffects.push({
          id: index * 3 + i,
          type,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: 30 + Math.random() * 30,
          duration: 15 + Math.random() * 10,
          delay: Math.random() * 10,
        });
      }
    });

    setEffects(newEffects);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {effects.map((effect) => (
        <div
          key={effect.id}
          className="absolute animate-float-special opacity-60"
          style={{
            left: `${effect.x}%`,
            top: `${effect.y}%`,
            width: `${effect.size}px`,
            height: `${effect.size}px`,
            animationDuration: `${effect.duration}s`,
            animationDelay: `${effect.delay}s`,
          }}
        >
          {effect.type === 'ufo' && (
            <div className="relative w-full h-full animate-ufo-hover">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-purple-600 rounded-full blur-sm opacity-60" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-400 rounded-full" style={{ boxShadow: '0 0 20px rgba(168, 85, 247, 0.8)' }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-gradient-to-b from-purple-300/60 to-transparent blur-md" />
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-1/3 h-1/3 bg-cyan-300 rounded-full blur-sm animate-pulse-bright" />
            </div>
          )}

          {effect.type === 'bubble' && (
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-300/50 to-pink-500/30 rounded-full blur-[2px]" />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 to-transparent rounded-full animate-bubble-float"
                   style={{
                     boxShadow: 'inset -3px -3px 6px rgba(255,255,255,0.5), 0 4px 15px rgba(236, 72, 153, 0.4)'
                   }}
              />
              <div className="absolute top-[20%] left-[25%] w-[30%] h-[30%] bg-white/80 rounded-full blur-sm" />
              <div className="absolute bottom-[15%] right-[20%] w-[20%] h-[20%] bg-pink-300/60 rounded-full blur-sm" />
            </div>
          )}

          {effect.type === 'icecream' && (
            <div className="relative w-full h-full animate-spin-slow">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-gradient-to-b from-pink-300 via-purple-300 to-yellow-300 rounded-full blur-sm" style={{ boxShadow: '0 4px 15px rgba(167, 139, 250, 0.5)' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-gradient-to-br from-pink-200/60 to-purple-200/60 rounded-full" />
              <div className="absolute top-[10%] left-[30%] w-[25%] h-[25%] bg-white/70 rounded-full blur-[2px]" />
            </div>
          )}

          {effect.type === 'gold' && (
            <div className="relative w-full h-full animate-gold-spin">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 rounded-lg blur-sm" style={{ boxShadow: '0 0 20px rgba(234, 179, 8, 0.8)' }} />
              <div className="absolute inset-[15%] bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-sm" />
              <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-yellow-100/80 rounded-full blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-tl from-amber-700/40 to-transparent rounded-lg" />
            </div>
          )}

          {effect.type === 'pineapple' && (
            <div className="relative w-full h-full animate-spin-slow">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-3/4 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-[40%] blur-sm" style={{ boxShadow: '0 4px 15px rgba(250, 204, 21, 0.6)' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/3 bg-gradient-to-b from-green-500 to-green-600 blur-sm" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
              <div className="absolute bottom-[20%] left-[30%] w-[20%] h-[20%] bg-yellow-200/70 rounded-full blur-[2px]" />
            </div>
          )}

          {effect.type === 'skittle' && (
            <div className="relative w-full h-full animate-rainbow-pulse">
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 rounded-full blur-sm" style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.6)' }} />
              <div className="absolute inset-[10%] bg-gradient-to-br from-white/60 to-transparent rounded-full" />
              <div className="absolute top-[20%] left-[25%] w-[30%] h-[30%] bg-white/80 rounded-full blur-[2px]" />
            </div>
          )}

          {effect.type === 'wave' && (
            <div className="relative w-full h-full">
              <svg viewBox="0 0 100 100" className="w-full h-full animate-wave">
                <path
                  d="M0,50 Q25,30 50,50 T100,50"
                  fill="none"
                  stroke="url(#gradient-wave)"
                  strokeWidth="4"
                  className="animate-wave-path"
                />
                <defs>
                  <linearGradient id="gradient-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.6)" />
                    <stop offset="50%" stopColor="rgba(96, 165, 250, 0.8)" />
                    <stop offset="100%" stopColor="rgba(147, 197, 253, 0.6)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes float-special {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-40px) translateX(20px) rotate(120deg);
          }
          66% {
            transform: translateY(-20px) translateX(-20px) rotate(240deg);
          }
        }
        .animate-float-special {
          animation: float-special ease-in-out infinite;
        }
        @keyframes ufo-hover {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        .animate-ufo-hover {
          animation: ufo-hover 3s ease-in-out infinite;
        }
        @keyframes bubble-float {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .animate-bubble-float {
          animation: bubble-float 2s ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes gold-spin {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
        }
        .animate-gold-spin {
          animation: gold-spin 8s ease-in-out infinite;
        }
        @keyframes rainbow-pulse {
          0%, 100% { filter: hue-rotate(0deg) brightness(1); }
          50% { filter: hue-rotate(360deg) brightness(1.2); }
        }
        .animate-rainbow-pulse {
          animation: rainbow-pulse 4s linear infinite;
        }
        @keyframes wave {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-20px); }
        }
        .animate-wave {
          animation: wave 3s ease-in-out infinite;
        }
        @keyframes wave-path {
          0%, 100% { stroke-dashoffset: 0; }
          50% { stroke-dashoffset: 100; }
        }
        .animate-wave-path {
          stroke-dasharray: 100;
          animation: wave-path 2s ease-in-out infinite;
        }
        @keyframes pulse-bright {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-pulse-bright {
          animation: pulse-bright 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
