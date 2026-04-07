import { useEffect, useRef, memo } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

interface UFO {
  id: number;
  x: number;
  y: number;
  baseY: number;
  velocityX: number;
  velocityY: number;
  size: number;
  fleeing: boolean;
  fleeTime: number;
  scared: boolean;
}

const initialUfos: UFO[] = Array.from({ length: 3 }, (_, i) => ({
  id: i,
  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
  y: Math.random() * 150 + 50,
  baseY: Math.random() * 150 + 50,
  velocityX: 1.5 + Math.random() * 1.5,
  velocityY: 0,
  size: 50 + Math.random() * 35,
  fleeing: false,
  fleeTime: 0,
  scared: false,
}));

function FlyingUFOs() {
  const { enableAnimations } = usePerformance();
  const ufosRef = useRef<UFO[]>(initialUfos);
  const mousePos = useRef({ x: -999, y: -999 });
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrame = useRef<number>();
  const lastFrameTime = useRef(0);
  const TARGET_FPS = 30; // Throttle to 30fps — halves CPU cost
  const FRAME_INTERVAL = 1000 / TARGET_FPS;

  useEffect(() => {
    if (!enableAnimations) return;

    // Throttled mousemove via passive listener
    let mouseMoveRaf = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (mouseMoveRaf) return; // Skip if a pending update exists
      mouseMoveRaf = requestAnimationFrame(() => {
        mouseMoveRaf = 0;
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (e.clientY < rect.bottom && e.clientY > rect.top) {
          mousePos.current = { x: e.clientX, y: e.clientY };
        } else {
          mousePos.current = { x: -999, y: -999 };
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const animate = (timestamp: number) => {
      // Throttle to TARGET_FPS
      const elapsed = timestamp - lastFrameTime.current;
      if (elapsed < FRAME_INTERVAL) {
        animationFrame.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime.current = timestamp - (elapsed % FRAME_INTERVAL);

      const ufos = ufosRef.current;
      const now = Date.now();
      const winW = window.innerWidth;

      for (let i = 0; i < ufos.length; i++) {
        const ufo = ufos[i];
        const dx = mousePos.current.x - ufo.x;
        const dy = mousePos.current.y - ufo.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100 && mousePos.current.x > -500) {
          ufo.scared = true;
          ufo.fleeing = true;
          ufo.fleeTime = now;
          const pushForce = (100 - distance) / 100;
          ufo.velocityX += (-dx / distance) * pushForce * 8;
          ufo.velocityY += (-dy / distance) * pushForce * 8;
        } else if (distance < 150 && mousePos.current.x > -500) {
          ufo.fleeing = true;
          ufo.fleeTime = now;
          const fleeForce = (150 - distance) / 150;
          ufo.velocityX += (-dx / distance) * fleeForce * 3;
          ufo.velocityY += (-dy / distance) * fleeForce * 3;
        } else {
          if (now - ufo.fleeTime > 1000) ufo.fleeing = false;
          if (now - ufo.fleeTime > 500) ufo.scared = false;
        }

        if (!ufo.fleeing) {
          ufo.velocityY += (ufo.baseY - ufo.y) * 0.01;
          if (Math.abs(ufo.velocityX) < 1) ufo.velocityX += 0.05;
        }

        ufo.velocityX *= 0.95;
        ufo.velocityY *= 0.95;
        ufo.x += ufo.velocityX;
        ufo.y += ufo.velocityY;

        if (ufo.x > winW + 150) {
          ufo.x = -150;
          ufo.y = Math.random() * 150 + 50;
          ufo.baseY = ufo.y;
          ufo.velocityX = 1.5 + Math.random() * 1.5;
          ufo.velocityY = 0;
          ufo.fleeing = false;
          ufo.scared = false;
        }

        // Direct DOM update (no React re-render)
        const el = document.getElementById(`ufo-${i}`);
        if (el) {
          el.style.transform = `translate3d(${ufo.x}px, ${ufo.y}px, 0) scale(${ufo.scared ? 0.8 : 1})`;
          el.style.opacity = ufo.scared ? '0.5' : '0.7';
        }
      }

      animationFrame.current = requestAnimationFrame(animate);
    };

    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
      if (mouseMoveRaf) cancelAnimationFrame(mouseMoveRaf);
    };
  }, [enableAnimations]);

  if (!enableAnimations) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 5 }}>
      {ufosRef.current.map((ufo, i) => (
        <div
          key={ufo.id}
          id={`ufo-${i}`}
          className="absolute will-change-transform"
          style={{
            left: 0,
            top: 0,
            width: `${ufo.size}px`,
            height: `${ufo.size}px`,
            transform: `translate3d(${ufo.x}px, ${ufo.y}px, 0)`,
            contain: 'layout style paint',
          }}
        >
          <div className="relative w-full h-full animate-ufo-wobble">
            {/* Dome glow */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[45%] h-[35%] bg-gradient-to-b from-cyan-300/80 via-cyan-400/60 to-transparent rounded-full blur-sm" />

            {/* Dome */}
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[45%] h-[35%] bg-gradient-to-b from-cyan-200 via-blue-300 to-cyan-400 rounded-full border-2 border-cyan-500/50"
                 style={{ boxShadow: 'inset 0 -4px 10px rgba(0,255,255,0.4), 0 0 20px rgba(0,255,255,0.6)' }}>
              <div className="absolute top-[30%] left-[30%] w-[40%] h-[50%] bg-white/40 rounded-full blur-sm" />
              {/* Alien */}
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

            {/* Saucer top */}
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-full h-[25%] bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400"
                 style={{ clipPath: 'ellipse(50% 50% at 50% 50%)', boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 2px 8px rgba(255,255,255,0.3)' }}>
              <div className="absolute top-0 left-0 right-0 h-[30%] bg-gradient-to-b from-white/30 to-transparent" />
            </div>

            {/* Saucer bottom with lights */}
            <div className="absolute top-[68%] left-1/2 -translate-x-1/2 w-[85%] h-[35%] bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 rounded-full"
                 style={{ boxShadow: '0 8px 20px rgba(0,0,0,0.7), inset 0 -3px 10px rgba(0,0,0,0.5)' }}>
              <div className="absolute top-[10%] left-0 right-0 h-[20%] bg-gradient-to-b from-gray-400/40 to-transparent rounded-full" />
              {[15, 37.5, 62.5, 85].map((left, idx) => (
                <div
                  key={idx}
                  className="absolute bottom-[20%] w-[15%] h-[40%] bg-yellow-300 animate-pulse-light"
                  style={{
                    left: `${left}%`,
                    transform: 'translateX(-50%)',
                    clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                    filter: 'blur(2px)',
                    animationDelay: `${idx * 0.2}s`,
                  }}
                />
              ))}
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
        .animate-ufo-wobble {
          animation: ufo-wobble 3s ease-in-out infinite;
        }
        @keyframes alien-peek {
          0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(0.95); }
        }
        .animate-alien-peek {
          animation: alien-peek 4s ease-in-out infinite;
        }
        @keyframes pulse-light {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-light {
          animation: pulse-light 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default memo(FlyingUFOs);
