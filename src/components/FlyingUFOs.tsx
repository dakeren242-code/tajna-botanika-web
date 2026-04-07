import { memo } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

// Pure CSS animated UFOs — zero JavaScript, zero rAF, zero mousemove
// They quietly glide across the top, orbit around, and leave. Smooth and simple.

const ufos = [
  { id: 0, size: 50, top: 60, duration: 22, delay: 0 },
  { id: 1, size: 40, top: 120, duration: 28, delay: 8 },
  { id: 2, size: 55, top: 40, duration: 25, delay: 15 },
];

function FlyingUFOs() {
  const { enableAnimations } = usePerformance();

  if (!enableAnimations) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {ufos.map((ufo) => (
        <div
          key={ufo.id}
          className="absolute ufo-glide"
          style={{
            top: `${ufo.top}px`,
            width: `${ufo.size}px`,
            height: `${ufo.size}px`,
            '--ufo-duration': `${ufo.duration}s`,
            '--ufo-delay': `${ufo.delay}s`,
            '--ufo-wobble': `${3 + ufo.id * 2}px`,
            contain: 'layout style paint',
          } as React.CSSProperties}
        >
          <div className="relative w-full h-full ufo-wobble">
            {/* Dome glow */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[45%] h-[35%] bg-gradient-to-b from-cyan-300/60 to-transparent rounded-full blur-sm" />

            {/* Dome */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[45%] h-[35%] bg-gradient-to-b from-cyan-200 via-blue-300 to-cyan-400 rounded-full border border-cyan-500/40"
                 style={{ boxShadow: 'inset 0 -3px 8px rgba(0,255,255,0.3), 0 0 15px rgba(0,255,255,0.4)' }}>
              <div className="absolute top-[30%] left-[30%] w-[40%] h-[50%] bg-white/30 rounded-full blur-sm" />
              {/* Alien */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[55%]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-green-400 rounded-full" />
                <div className="absolute top-[22%] left-[26%] w-[18%] h-[22%] bg-gray-900 rounded-full">
                  <div className="absolute top-[20%] left-[25%] w-[35%] h-[35%] bg-white rounded-full" />
                </div>
                <div className="absolute top-[22%] right-[26%] w-[18%] h-[22%] bg-gray-900 rounded-full">
                  <div className="absolute top-[20%] left-[25%] w-[35%] h-[35%] bg-white rounded-full" />
                </div>
              </div>
            </div>

            {/* Saucer */}
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-full h-[25%] bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"
                 style={{ clipPath: 'ellipse(50% 50% at 50% 50%)' }} />

            {/* Bottom with lights */}
            <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[85%] h-[30%] bg-gradient-to-b from-gray-600 to-gray-800 rounded-full"
                 style={{ boxShadow: '0 6px 15px rgba(0,0,0,0.5)' }}>
              <div className="absolute bottom-[25%] left-[20%] w-[12%] h-[30%] bg-yellow-300/70 rounded-full blur-[1px]" />
              <div className="absolute bottom-[25%] left-[42%] w-[12%] h-[30%] bg-cyan-300/70 rounded-full blur-[1px]" />
              <div className="absolute bottom-[25%] right-[20%] w-[12%] h-[30%] bg-yellow-300/70 rounded-full blur-[1px]" />
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes ufo-glide {
          0% {
            transform: translate3d(-80px, 0, 0);
            opacity: 0;
          }
          3% {
            opacity: 0.65;
          }
          50% {
            transform: translate3d(calc(50vw - 25px), var(--ufo-wobble), 0);
            opacity: 0.7;
          }
          97% {
            opacity: 0.65;
          }
          100% {
            transform: translate3d(calc(100vw + 80px), 0, 0);
            opacity: 0;
          }
        }
        .ufo-glide {
          animation: ufo-glide var(--ufo-duration) ease-in-out infinite;
          animation-delay: var(--ufo-delay);
          left: -80px;
        }
        @keyframes ufo-wobble-anim {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          25% { transform: rotate(2deg) translateY(-4px); }
          50% { transform: rotate(-2deg) translateY(0); }
          75% { transform: rotate(3deg) translateY(-4px); }
        }
        .ufo-wobble {
          animation: ufo-wobble-anim 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default memo(FlyingUFOs);
