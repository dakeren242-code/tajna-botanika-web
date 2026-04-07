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

interface FloatingSphere {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
  width: number;
  height: number;
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
  color: string;
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

const createInitialSpheres = (): FloatingSphere[] =>
  Array.from({ length: 3 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 6,
    width: 15 + Math.random() * 30,
    height: 15 + Math.random() * 30,
  }));

// Spring cherry blossom / apricot petals instead of winter snowflakes
const petalColors = [
  'rgba(255, 182, 193, 0.7)',   // light pink
  'rgba(255, 192, 203, 0.6)',   // pink
  'rgba(255, 160, 180, 0.5)',   // rose
  'rgba(255, 218, 224, 0.6)',   // pale pink
  'rgba(255, 200, 210, 0.55)',  // soft pink
];

const createInitialPetals = (): Petal[] =>
  Array.from({ length: 6 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    startY: -5 - Math.random() * 15,
    size: 8 + Math.random() * 14,
    duration: 10 + Math.random() * 14,
    delay: Math.random() * 18,
    drift: -30 + Math.random() * 60,
    rotation: Math.random() * 720,
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
  }));

const initialLeaves = createInitialLeaves();
const initialSpheres = createInitialSpheres();
const initialPetals = createInitialPetals();

// Cherry blossom petal SVG
const createPetalSvg = (size: number, color: string) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ filter: 'drop-shadow(0 0 3px rgba(255, 182, 193, 0.4))' }}
  >
    <path
      d="M12 2C12 2 8 6 8 10C8 12 9.5 14 12 14C14.5 14 16 12 16 10C16 6 12 2 12 2Z"
      fill={color}
      opacity="0.8"
    />
    <path
      d="M12 14C12 14 8 16 7 19C6.5 20.5 7.5 22 9 22C10.5 22 12 20 12 20C12 20 13.5 22 15 22C16.5 22 17.5 20.5 17 19C16 16 12 14 12 14Z"
      fill={color}
      opacity="0.6"
    />
    <circle cx="12" cy="10" r="1.5" fill="rgba(255,215,0,0.5)" />
  </svg>
);

function PersistentDecorations() {
  const leavesRef = useRef<FloatingLeaf[]>(initialLeaves);
  const spheresRef = useRef<FloatingSphere[]>(initialSpheres);
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

        {/* Floating spheres */}
        <div className="absolute inset-0 opacity-50">
          {spheresRef.current.map((sphere) => (
            <div
              key={sphere.id}
              className="absolute animate-float-gentle-persistent"
              style={{
                left: `${sphere.x}%`,
                top: `${sphere.y}%`,
                animationDelay: `${sphere.delay}s`,
                animationDuration: `${sphere.duration}s`,
                contain: 'layout style paint',
              }}
            >
              <div
                className="rounded-full bg-gradient-to-br from-orange-400/40 to-amber-500/40 animate-pulse-gentle-persistent"
                style={{
                  width: `${sphere.width}px`,
                  height: `${sphere.height}px`,
                  filter: 'blur(2px)',
                  boxShadow: '0 0 30px rgba(251, 146, 60, 0.6), 0 0 60px rgba(251, 146, 60, 0.3)',
                  transform: 'translateZ(0)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Falling cherry blossom petals */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
        {petalsRef.current.map((petal) => (
          <div
            key={petal.id}
            className="absolute petal-fall"
            style={{
              left: `${petal.x}%`,
              top: `${petal.startY}%`,
              '--fall-duration': `${petal.duration}s`,
              '--fall-delay': `${petal.delay}s`,
              '--drift-distance': `${petal.drift}px`,
              '--rotation-amount': `${petal.rotation}deg`,
            } as React.CSSProperties}
          >
            <div className="petal-spin" style={{ '--fall-duration': `${petal.duration}s`, '--fall-delay': `${petal.delay}s` } as React.CSSProperties}>
              {createPetalSvg(petal.size, petal.color)}
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
        @keyframes float-gentle-persistent {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -15px, 0); }
        }
        .animate-float-gentle-persistent {
          animation: float-gentle-persistent ease-in-out infinite;
          transform: translateZ(0);
        }
        @keyframes pulse-gentle-persistent {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .animate-pulse-gentle-persistent {
          animation: pulse-gentle-persistent 4s ease-in-out infinite;
        }
        @keyframes petal-fall-anim {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          5% { opacity: 0.8; }
          50% {
            transform: translateY(55vh) translateX(calc(var(--drift-distance, 0) * 0.6));
            opacity: 0.7;
          }
          95% { opacity: 0.5; }
          100% {
            transform: translateY(110vh) translateX(var(--drift-distance, 0));
            opacity: 0;
          }
        }
        @keyframes petal-spin-anim {
          0% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(calc(var(--rotation-amount, 360deg) * 0.25)) scale(0.85); }
          50% { transform: rotate(calc(var(--rotation-amount, 360deg) * 0.5)) scale(1); }
          75% { transform: rotate(calc(var(--rotation-amount, 360deg) * 0.75)) scale(0.9); }
          100% { transform: rotate(var(--rotation-amount, 360deg)) scale(1); }
        }
        .petal-fall {
          animation: petal-fall-anim var(--fall-duration) ease-in-out infinite;
          animation-delay: var(--fall-delay);
        }
        .petal-spin {
          animation: petal-spin-anim var(--fall-duration) ease-in-out infinite;
          animation-delay: var(--fall-delay);
        }
      `}</style>
    </>
  );
}

export default memo(PersistentDecorations);
