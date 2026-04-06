import { useEffect, useState } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

interface Cart {
  id: number;
  lane: number;
  duration: number;
  delay: number;
  size: number;
}

export default function MovingCarts() {
  const { enableAnimations } = usePerformance();
  const [carts, setCarts] = useState<Cart[]>([]);

  useEffect(() => {
    if (!enableAnimations) return;

    const newCarts: Cart[] = Array.from({ length: 3 }, (_, i) => ({
      id: i,
      lane: 40 + (i * 15),
      duration: 12 + Math.random() * 4,
      delay: Math.random() * 10,
      size: 80 + Math.random() * 30,
    }));
    setCarts(newCarts);
  }, [enableAnimations]);

  if (!enableAnimations) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {carts.map((cart) => (
        <div
          key={cart.id}
          className="absolute animate-cart-move"
          style={{
            left: '-200px',
            top: `${cart.lane}%`,
            width: `${cart.size}px`,
            height: `${cart.size * 0.8}px`,
            animationDuration: `${cart.duration}s`,
            animationDelay: `${cart.delay}s`,
          }}
        >
          <div className="relative w-full h-full animate-cart-bounce">
            <div className="absolute bottom-[25%] left-[5%] right-[5%] h-[60%] bg-gradient-to-b from-gray-500 via-gray-600 to-gray-700"
                 style={{
                   clipPath: 'polygon(15% 0%, 85% 0%, 100% 100%, 0% 100%)',
                   boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6), inset 0 2px 5px rgba(255, 255, 255, 0.2)'
                 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400/30 to-transparent" />

              <div className="absolute left-[8%] top-[5%] w-[12%] h-[12%] bg-gradient-to-br from-gray-700 to-gray-800 rounded-full"
                   style={{ boxShadow: 'inset 0 2px 3px rgba(0, 0, 0, 0.5)' }} />
              <div className="absolute right-[8%] top-[5%] w-[12%] h-[12%] bg-gradient-to-br from-gray-700 to-gray-800 rounded-full"
                   style={{ boxShadow: 'inset 0 2px 3px rgba(0, 0, 0, 0.5)' }} />
            </div>

            <div className="absolute bottom-[30%] left-[15%] right-[15%] h-[50%] overflow-hidden"
                 style={{ clipPath: 'polygon(10% 20%, 90% 20%, 100% 100%, 0% 100%)' }}>
              <div className="absolute bottom-[5%] left-[8%] w-[22%] h-[55%] bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 rounded-sm animate-package-wobble"
                   style={{
                     boxShadow: '0 3px 10px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                     border: '1px solid rgba(120, 53, 15, 0.5)',
                     '--initial-rotation': '3deg'
                   } as React.CSSProperties}>
                <div className="absolute top-[45%] left-0 right-0 h-[8%] bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-60" />
                <div className="absolute top-[52%] left-0 right-0 h-[4%] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-40" />
                <div className="absolute top-[15%] right-[15%] w-[35%] h-[25%] bg-white/80 rounded-sm border border-gray-300 flex items-center justify-center text-[8px]">
                  <div className="w-full h-full bg-gradient-to-br from-white to-gray-100" />
                </div>
              </div>

              <div className="absolute bottom-[5%] left-[33%] w-[20%] h-[65%] bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 rounded-sm animate-package-wobble"
                   style={{
                     animationDelay: '0.3s',
                     boxShadow: '0 3px 10px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                     border: '1px solid rgba(120, 53, 15, 0.5)',
                     '--initial-rotation': '-5deg'
                   } as React.CSSProperties}>
                <div className="absolute top-[40%] left-0 right-0 h-[8%] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60" />
                <div className="absolute top-[48%] left-0 right-0 h-[4%] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-40" />
                <div className="absolute top-[10%] right-[10%] w-[40%] h-[20%] bg-white/80 rounded-sm border border-gray-300" />
              </div>

              <div className="absolute bottom-[5%] right-[33%] w-[18%] h-[50%] bg-gradient-to-br from-red-600 via-red-700 to-red-800 rounded-sm animate-package-wobble"
                   style={{
                     animationDelay: '0.6s',
                     boxShadow: '0 3px 10px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                     border: '1px solid rgba(127, 29, 29, 0.5)',
                     '--initial-rotation': '8deg'
                   } as React.CSSProperties}>
                <div className="absolute top-[45%] left-0 right-0 h-[8%] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />
                <div className="absolute top-[53%] left-0 right-0 h-[4%] bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-40" />
                <div className="absolute top-[18%] left-[15%] w-[50%] h-[25%] bg-white/90 rounded-sm border border-gray-300 flex items-center justify-center">
                  <div className="text-red-600 font-bold text-[6px]">FRAGILE</div>
                </div>
              </div>

              <div className="absolute bottom-[5%] right-[10%] w-[21%] h-[60%] bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-sm animate-package-wobble"
                   style={{
                     animationDelay: '0.9s',
                     boxShadow: '0 3px 10px rgba(0, 0, 0, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.2)',
                     border: '1px solid rgba(29, 78, 216, 0.5)',
                     '--initial-rotation': '-4deg'
                   } as React.CSSProperties}>
                <div className="absolute top-[42%] left-0 right-0 h-[8%] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />
                <div className="absolute top-[50%] left-0 right-0 h-[4%] bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-40" />
                <div className="absolute top-[12%] right-[12%] w-[45%] h-[22%] bg-white/80 rounded-sm border border-gray-300" />
              </div>
            </div>

            <div className="absolute bottom-0 left-[18%] w-[22%] h-[22%] bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-full border-3 border-gray-600 animate-wheel-spin"
                 style={{ boxShadow: '0 3px 8px rgba(0, 0, 0, 0.7), inset 0 2px 5px rgba(0, 0, 0, 0.5)' }}>
              <div className="absolute inset-[25%] bg-gradient-to-br from-gray-600 to-gray-800 rounded-full border-2 border-gray-500" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10%] h-[90%] bg-gray-500" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[10%] bg-gray-500" />
            </div>

            <div className="absolute bottom-0 right-[18%] w-[22%] h-[22%] bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 rounded-full border-3 border-gray-600 animate-wheel-spin"
                 style={{ boxShadow: '0 3px 8px rgba(0, 0, 0, 0.7), inset 0 2px 5px rgba(0, 0, 0, 0.5)' }}>
              <div className="absolute inset-[25%] bg-gradient-to-br from-gray-600 to-gray-800 rounded-full border-2 border-gray-500" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[10%] h-[90%] bg-gray-500" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[10%] bg-gray-500" />
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes cart-move {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          5% {
            opacity: 0.9;
          }
          95% {
            opacity: 0.9;
          }
          100% {
            transform: translate3d(calc(100vw + 250px), 0, 0);
            opacity: 0;
          }
        }
        .animate-cart-move {
          animation: cart-move linear infinite;
          transform: translateZ(0);
        }
        @keyframes cart-bounce {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(0, -2px, 0) rotate(-1deg);
          }
          50% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          75% {
            transform: translate3d(0, -2px, 0) rotate(1deg);
          }
        }
        .animate-cart-bounce {
          animation: cart-bounce 0.6s ease-in-out infinite;
          transform: translateZ(0);
        }
        @keyframes package-wobble {
          0%, 100% {
            transform: translateY(0) rotate(var(--initial-rotation, 0deg));
          }
          25% {
            transform: translateY(-2px) rotate(calc(var(--initial-rotation, 0deg) + 2deg));
          }
          50% {
            transform: translateY(-1px) rotate(var(--initial-rotation, 0deg));
          }
          75% {
            transform: translateY(-2px) rotate(calc(var(--initial-rotation, 0deg) - 2deg));
          }
        }
        .animate-package-wobble {
          animation: package-wobble 2.5s ease-in-out infinite;
          transform: translateZ(0);
        }
        @keyframes wheel-spin {
          from {
            transform: rotate(0deg) translateZ(0);
          }
          to {
            transform: rotate(360deg) translateZ(0);
          }
        }
        .animate-wheel-spin {
          animation: wheel-spin 1s linear infinite;
          transform: translateZ(0);
        }
        .animate-cart-move,
        .animate-cart-bounce,
        .animate-package-wobble,
        .animate-wheel-spin {
          will-change: transform;
          contain: layout style paint;
        }
      `}</style>
    </div>
  );
}
