import { useEffect, useRef, useState } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

interface UFO {
  id: number;
  x: number;
  y: number;
  baseY: number;
  velocityX: number;
  size: number;
}

export default function FlyingUFOs() {
  const { enableAnimations } = usePerformance();
  const [ufos, setUfos] = useState<UFO[]>([]);
  const animationFrame = useRef<number>();
  const initialized = useRef(false);

  useEffect(() => {
    if (!enableAnimations) return;
    if (initialized.current) return;
    initialized.current = true;

    const newUfos: UFO[] = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      x: (window.innerWidth / 3) * i + Math.random() * 200,
      y: Math.random() * 150 + 50,
      baseY: Math.random() * 150 + 50,
      velocityX: 1.2 + Math.random() * 1.2,
      size: 50 + Math.random() * 35,
    }));
    setUfos(newUfos);
  }, [enableAnimations]);

  useEffect(() => {
    if (!enableAnimations || ufos.length === 0) return;

    const animate = () => {
      setUfos(prevUfos => prevUfos.map(ufo => {
        let { x, y, baseY, velocityX } = ufo;

        x += velocityX;

        if (x > window.innerWidth + 150) {
          x = -150;
          y = Math.random() * 150 + 50;
          baseY = y;
          velocityX = 1.2 + Math.random() * 1.2;
        }

        return { ...ufo, x, y, baseY, velocityX };
      }));

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [enableAnimations, ufos.length]);

  if (!enableAnimations) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
      {ufos.map((ufo) => (
        <div
          key={ufo.id}
          className="absolute"
          style={{
            left: `${ufo.x}px`,
            top: `${ufo.y}px`,
            width: `${ufo.size}px`,
            height: `${ufo.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="relative w-full h-full animate-ufo-wobble">
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[45%] h-[35%] bg-gradient-to-b from-cyan-300/80 via-cyan-400/60 to-transparent rounded-full blur-sm"
                 style={{ clipPath: 'ellipse(50% 50% at 50% 50%)' }} />

            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[45%] h-[35%] bg-gradient-to-b from-cyan-200 via-blue-300 to-cyan-400 rounded-full border-2 border-cyan-500/50"
                 style={{
                   clipPath: 'ellipse(50% 50% at 50% 50%)',
                   boxShadow: 'inset 0 -4px 10px rgba(0, 255, 255, 0.4), 0 0 20px rgba(0, 255, 255, 0.6)'
                 }}>
              <div className="absolute top-[30%] left-[30%] w-[40%] h-[50%] bg-white/40 rounded-full blur-sm" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] animate-alien-peek">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-green-400 rounded-full" />
                <div className="absolute top-[20%] left-[25%] w-[20%] h-[25%] bg-gray-900 rounded-full">
                  <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-white rounded-full" />
                </div>
                <div className="absolute top-[20%] right-[25%] w-[20%] h-[25%] bg-gray-900 rounded-full">
                  <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-full h-[25%] bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"
                 style={{
                   clipPath: 'ellipse(50% 50% at 50% 50%)',
                   boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.3)'
                 }}>
              <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-white/30 to-transparent" />
            </div>

            <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[85%] h-[35%] bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 rounded-full"
                 style={{ boxShadow: '0 8px 20px rgba(0, 0, 0, 0.7), inset 0 -3px 10px rgba(0, 0, 0, 0.5)' }}>
              <div className="absolute top-[10%] left-0 right-0 h-[20%] bg-gradient-to-b from-gray-400/40 to-transparent rounded-full" />
              <div className="absolute bottom-[20%] left-[15%] w-[15%] h-[40%] bg-yellow-300 animate-pulse-light"
                   style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)', filter: 'blur(2px)', animationDelay: '0s' }} />
              <div className="absolute bottom-[20%] left-[37.5%] w-[15%] h-[40%] bg-cyan-300 animate-pulse-light"
                   style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)', filter: 'blur(2px)', animationDelay: '0.2s' }} />
              <div className="absolute bottom-[20%] right-[37.5%] w-[15%] h-[40%] bg-pink-300 animate-pulse-light"
                   style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)', filter: 'blur(2px)', animationDelay: '0.4s' }} />
              <div className="absolute bottom-[20%] right-[15%] w-[15%] h-[40%] bg-yellow-300 animate-pulse-light"
                   style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)', filter: 'blur(2px)', animationDelay: '0.6s' }} />
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes ufo-wobble {
          0%, 100% { transform: rotate(-5deg) translateY(0px); }
          25% { transform: rotate(3deg) translateY(-6px); }
          50% { transform: rotate(-3deg) translateY(0px); }
          75% { transform: rotate(5deg) translateY(-6px); }
        }
        .animate-ufo-wobble { animation: ufo-wobble 2s ease-in-out infinite; }
        @keyframes alien-peek {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.95); }
        }
        .animate-alien-peek { animation: alien-peek 3s ease-in-out infinite; }
        @keyframes pulse-light {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-light { animation: pulse-light 1s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
