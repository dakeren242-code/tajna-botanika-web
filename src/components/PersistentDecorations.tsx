import { useRef, memo } from 'react';
import { Leaf } from 'lucide-react';

interface FloatingLeaf {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  size: number;
  rotation: number;
}

interface Petal {
  id: number;
  x: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
  hue: number;
  variant: number; // 0-3 for different petal shapes
}

const createInitialLeaves = (): FloatingLeaf[] =>
  Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 14 + Math.random() * 8,
    size: 20 + Math.random() * 35,
    rotation: Math.random() * 360,
  }));

const createInitialPetals = (): Petal[] =>
  Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: 2 + Math.random() * 96,
    startY: -10 - Math.random() * 15,
    size: 12 + Math.random() * 14,
    duration: 14 + Math.random() * 16,
    delay: Math.random() * 18,
    drift: -60 + Math.random() * 120,
    rotation: Math.random() * 720,
    hue: 340 + Math.random() * 20, // tighter pink range for cherry blossom
    variant: Math.floor(Math.random() * 4),
  }));

const initialLeaves = createInitialLeaves();
const initialPetals = createInitialPetals();

// Realistic cherry blossom petal with 5-petal SVG shape
const SakuraPetal = ({ size, hue, variant }: { size: number; hue: number; variant: number }) => {
  // Different petal shapes for variety — like real sakura petals falling individually
  const shapes = [
    // Classic single sakura petal with notch
    <svg key="a" width={size} height={size * 1.2} viewBox="0 0 30 36" fill="none">
      <path
        d="M15 0C15 0 6 8 3 18C0 28 8 36 15 33C22 36 30 28 27 18C24 8 15 0 15 0Z"
        fill={`hsla(${hue}, 85%, 85%, 0.85)`}
      />
      <path
        d="M15 0C15 0 6 8 3 18C0 28 8 36 15 33C22 36 30 28 27 18C24 8 15 0 15 0Z"
        fill={`url(#petalGrad${variant})`}
      />
      <path
        d="M15 4C15 4 14.5 14 15 28"
        stroke={`hsla(${hue}, 70%, 72%, 0.5)`}
        strokeWidth="0.5"
      />
      <defs>
        <radialGradient id={`petalGrad${variant}`} cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor={`hsla(${hue}, 95%, 95%, 0.7)`} />
          <stop offset="50%" stopColor={`hsla(${hue}, 85%, 82%, 0.4)`} />
          <stop offset="100%" stopColor={`hsla(${hue}, 75%, 70%, 0.2)`} />
        </radialGradient>
      </defs>
    </svg>,
    // Wider round petal
    <svg key="b" width={size * 1.1} height={size} viewBox="0 0 34 30" fill="none">
      <ellipse cx="17" cy="15" rx="15" ry="13"
        fill={`hsla(${hue}, 88%, 87%, 0.8)`}
      />
      <ellipse cx="17" cy="15" rx="15" ry="13"
        fill={`url(#petalGradB${variant})`}
      />
      <path d="M17 3C17 3 16.5 12 17 25" stroke={`hsla(${hue}, 65%, 70%, 0.4)`} strokeWidth="0.4" />
      <defs>
        <radialGradient id={`petalGradB${variant}`} cx="0.35" cy="0.25" r="0.65">
          <stop offset="0%" stopColor={`hsla(${hue + 5}, 100%, 96%, 0.6)`} />
          <stop offset="100%" stopColor={`hsla(${hue}, 80%, 75%, 0.15)`} />
        </radialGradient>
      </defs>
    </svg>,
    // Elongated petal (like falling from side)
    <svg key="c" width={size * 0.8} height={size * 1.4} viewBox="0 0 24 42" fill="none">
      <path
        d="M12 0C12 0 4 10 2 22C0 34 7 42 12 40C17 42 24 34 22 22C20 10 12 0 12 0Z"
        fill={`hsla(${hue - 5}, 82%, 83%, 0.8)`}
      />
      <path
        d="M12 0C12 0 4 10 2 22C0 34 7 42 12 40C17 42 24 34 22 22C20 10 12 0 12 0Z"
        fill={`url(#petalGradC${variant})`}
      />
      <defs>
        <radialGradient id={`petalGradC${variant}`} cx="0.45" cy="0.3" r="0.6">
          <stop offset="0%" stopColor={`hsla(${hue}, 100%, 95%, 0.65)`} />
          <stop offset="100%" stopColor={`hsla(${hue - 3}, 75%, 68%, 0.2)`} />
        </radialGradient>
      </defs>
    </svg>,
    // Tiny curled petal
    <svg key="d" width={size * 0.9} height={size * 1.1} viewBox="0 0 28 34" fill="none">
      <path
        d="M14 0C14 0 3 7 1 17C-1 27 6 34 14 32C22 34 29 27 27 17C25 7 14 0 14 0Z"
        fill={`hsla(${hue + 3}, 90%, 88%, 0.75)`}
      />
      <path
        d="M14 2C13 10 12 20 14 30"
        stroke={`hsla(${hue}, 60%, 68%, 0.35)`}
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </svg>,
  ];
  return shapes[variant % shapes.length];
};

function PersistentDecorations() {
  const leavesRef = useRef<FloatingLeaf[]>(initialLeaves);
  const petalsRef = useRef<Petal[]>(initialPetals);

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
        {/* Floating leaves */}
        <div className="absolute inset-0 opacity-30">
          {leavesRef.current.map((leaf) => (
            <div
              key={leaf.id}
              className="absolute animate-float-persistent"
              style={{
                left: `${leaf.x}%`,
                top: `${leaf.y}%`,
                animationDelay: `${leaf.delay}s`,
                animationDuration: `${leaf.duration}s`,
                contain: 'layout style paint',
              }}
            >
              <Leaf
                className="text-green-400/40"
                size={leaf.size}
                style={{
                  transform: `rotate(${leaf.rotation}deg) translateZ(0)`,
                  filter: 'blur(1px)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Falling cherry blossom petals 🌸 — realistic sakura style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
        {petalsRef.current.map((petal) => (
          <div
            key={petal.id}
            className="absolute sakura-fall"
            style={{
              left: `${petal.x}%`,
              top: `${petal.startY}%`,
              '--fall-duration': `${petal.duration}s`,
              '--fall-delay': `${petal.delay}s`,
              '--drift-distance': `${petal.drift}px`,
              '--rotation-amount': `${petal.rotation}deg`,
              '--sway-amount': `${15 + Math.random() * 25}px`,
              filter: 'drop-shadow(0 1px 3px rgba(255, 180, 200, 0.25))',
              contain: 'layout style paint',
            } as React.CSSProperties}
          >
            <div className="sakura-tumble" style={{
              '--fall-duration': `${petal.duration}s`,
              '--fall-delay': `${petal.delay}s`,
              '--rotation-amount': `${petal.rotation}deg`,
            } as React.CSSProperties}>
              <div className="sakura-flutter" style={{
                '--flutter-speed': `${2 + Math.random() * 2}s`,
              } as React.CSSProperties}>
                <SakuraPetal size={petal.size} hue={petal.hue} variant={petal.variant} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float-persistent {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          25% { transform: translate3d(15px, -30px, 0) rotate(8deg); }
          50% { transform: translate3d(-15px, -60px, 0) rotate(-8deg); }
          75% { transform: translate3d(15px, -30px, 0) rotate(5deg); }
        }
        .animate-float-persistent {
          animation: float-persistent ease-in-out infinite;
          transform: translateZ(0);
        }

        /* Sakura falling — natural gravity with wind sway */
        @keyframes sakura-fall-anim {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          2% { opacity: 0.85; }
          15% {
            transform: translateY(15vh) translateX(calc(var(--sway-amount) * -1));
          }
          30% {
            transform: translateY(30vh) translateX(calc(var(--drift-distance, 0) * 0.3));
            opacity: 0.8;
          }
          45% {
            transform: translateY(45vh) translateX(calc(var(--sway-amount) * 0.7));
          }
          60% {
            transform: translateY(62vh) translateX(calc(var(--drift-distance, 0) * 0.65));
            opacity: 0.65;
          }
          75% {
            transform: translateY(78vh) translateX(calc(var(--sway-amount) * -0.5));
          }
          90% {
            opacity: 0.35;
          }
          100% {
            transform: translateY(112vh) translateX(var(--drift-distance, 0));
            opacity: 0;
          }
        }

        /* Tumbling rotation — 3D perspective spin */
        @keyframes sakura-tumble-anim {
          0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
          25% { transform: rotateX(90deg) rotateY(45deg) rotateZ(calc(var(--rotation-amount) * 0.25)); }
          50% { transform: rotateX(180deg) rotateY(90deg) rotateZ(calc(var(--rotation-amount) * 0.5)); }
          75% { transform: rotateX(270deg) rotateY(45deg) rotateZ(calc(var(--rotation-amount) * 0.75)); }
          100% { transform: rotateX(360deg) rotateY(0deg) rotateZ(var(--rotation-amount)); }
        }

        /* Gentle flutter — simulates wind catching the petal */
        @keyframes sakura-flutter-anim {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          25% { transform: scaleX(0.6) scaleY(1.05); }
          50% { transform: scaleX(1.05) scaleY(0.9); }
          75% { transform: scaleX(0.7) scaleY(1.02); }
        }

        .sakura-fall {
          animation: sakura-fall-anim var(--fall-duration) cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
          animation-delay: var(--fall-delay);
        }
        .sakura-tumble {
          animation: sakura-tumble-anim var(--fall-duration) linear infinite;
          animation-delay: var(--fall-delay);
          transform-style: preserve-3d;
        }
        .sakura-flutter {
          animation: sakura-flutter-anim var(--flutter-speed, 3s) ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default memo(PersistentDecorations);
