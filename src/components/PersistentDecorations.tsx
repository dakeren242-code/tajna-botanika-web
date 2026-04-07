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
  hue: number;
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

const createInitialPetals = (): Petal[] =>
  Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: 5 + Math.random() * 90,
    startY: -8 - Math.random() * 12,
    size: 18 + Math.random() * 16,
    duration: 12 + Math.random() * 12,
    delay: Math.random() * 14,
    drift: -40 + Math.random() * 80,
    rotation: Math.random() * 540,
    hue: 330 + Math.random() * 30, // pinks from 330-360
  }));

const initialLeaves = createInitialLeaves();
const initialSpheres = createInitialSpheres();
const initialPetals = createInitialPetals();

// Cherry blossom petal — simple CSS div, no SVG needed
const PetalDiv = ({ size, hue }: { size: number; hue: number }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size * 1.3}px`,
      background: `radial-gradient(ellipse at 40% 30%, hsla(${hue}, 90%, 88%, 0.9), hsla(${hue}, 80%, 72%, 0.7) 60%, hsla(${hue}, 70%, 65%, 0.3))`,
      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
      transform: 'rotate(-15deg)',
    }}
  />
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

      {/* Falling cherry blossom petals 🌸 */}
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
              filter: 'blur(0.5px) drop-shadow(0 2px 4px rgba(255, 150, 180, 0.3))',
              contain: 'layout style paint',
            } as React.CSSProperties}
          >
            <div className="petal-spin" style={{ '--fall-duration': `${petal.duration}s`, '--fall-delay': `${petal.delay}s` } as React.CSSProperties}>
              <PetalDiv size={petal.size} hue={petal.hue} />
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
          3% { opacity: 0.9; }
          40% {
            transform: translateY(45vh) translateX(calc(var(--drift-distance, 0) * 0.5));
            opacity: 0.85;
          }
          70% {
            transform: translateY(75vh) translateX(calc(var(--drift-distance, 0) * 0.8));
            opacity: 0.6;
          }
          95% { opacity: 0.3; }
          100% {
            transform: translateY(110vh) translateX(var(--drift-distance, 0));
            opacity: 0;
          }
        }
        @keyframes petal-sway {
          0% { transform: rotate(0deg) scaleX(1); }
          20% { transform: rotate(calc(var(--rotation-amount, 360deg) * 0.2)) scaleX(0.7); }
          40% { transform: rotate(calc(var(--rotation-amount, 360deg) * 0.4)) scaleX(1); }
          60% { transform: rotate(calc(var(--rotation-amount, 360deg) * 0.6)) scaleX(0.8); }
          80% { transform: rotate(calc(var(--rotation-amount, 360deg) * 0.8)) scaleX(1); }
          100% { transform: rotate(var(--rotation-amount, 360deg)) scaleX(0.75); }
        }
        .petal-fall {
          animation: petal-fall-anim var(--fall-duration) ease-in-out infinite;
          animation-delay: var(--fall-delay);
        }
        .petal-spin {
          animation: petal-sway var(--fall-duration) ease-in-out infinite;
          animation-delay: var(--fall-delay);
        }
      `}</style>
    </>
  );
}

export default memo(PersistentDecorations);
