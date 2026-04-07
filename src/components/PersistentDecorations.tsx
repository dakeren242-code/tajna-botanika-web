import { useRef } from 'react';
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

interface Snowflake {
  id: number;
  x: number;
  startY: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotation: number;
}

const createInitialLeaves = (): FloatingLeaf[] =>
  Array.from({ length: 5 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 12 + Math.random() * 8,
    size: 20 + Math.random() * 40,
    rotation: Math.random() * 360,
  }));

const createInitialSpheres = (): FloatingSphere[] =>
  Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 6,
    width: 15 + Math.random() * 35,
    height: 15 + Math.random() * 35,
  }));

const createInitialSnowflakes = (): Snowflake[] =>
  Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    startY: -10 - Math.random() * 20,
    size: 8 + Math.random() * 20,
    duration: 8 + Math.random() * 12,
    delay: Math.random() * 15,
    drift: -20 + Math.random() * 40,
    rotation: Math.random() * 720,
  }));

const initialLeaves = createInitialLeaves();
const initialSpheres = createInitialSpheres();
const initialSnowflakes = createInitialSnowflakes();

const createSnowflakePath = (size: number) => {
  const scale = size / 24;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.8))',
      }}
    >
      <g transform={`scale(${scale})`}>
        <line x1="12" y1="2" x2="12" y2="22" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="2" y1="12" x2="22" y2="12" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="5" y1="5" x2="19" y2="19" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="19" y1="5" x2="5" y2="19" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="2" x2="10" y2="5" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="12" y1="2" x2="14" y2="5" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="12" y1="22" x2="10" y2="19" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="12" y1="22" x2="14" y2="19" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="2" y1="12" x2="5" y2="10" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="2" y1="12" x2="5" y2="14" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="12" x2="19" y2="10" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="22" y1="12" x2="19" y2="14" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="5" x2="7" y2="6" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="5" x2="6" y2="7" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="19" y1="19" x2="17" y2="18" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="19" y1="19" x2="18" y2="17" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="19" y1="5" x2="17" y2="6" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="19" y1="5" x2="18" y2="7" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="19" x2="7" y2="18" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="5" y1="19" x2="6" y2="17" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <circle cx="12" cy="12" r="2" fill="white" opacity="0.6" />
      </g>
    </svg>
  );
};

export default function PersistentDecorations() {
  const leavesRef = useRef<FloatingLeaf[]>(initialLeaves);
  const spheresRef = useRef<FloatingSphere[]>(initialSpheres);
  const snowflakesRef = useRef<Snowflake[]>(initialSnowflakes);

  return (
    <>
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 2 }}>
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
              }}
            >
              <Leaf
                className="text-green-400/40"
                size={leaf.size}
                style={{
                  transform: `rotate(${leaf.rotation}deg) translateZ(0)`,
                  filter: 'blur(1px)'
                }}
              />
            </div>
          ))}
        </div>

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

      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
        {snowflakesRef.current.map((flake) => (
          <div
            key={flake.id}
            className="absolute snowflake-fall-persistent"
            style={{
              left: `${flake.x}%`,
              top: `${flake.startY}%`,
              '--fall-duration': `${flake.duration}s`,
              '--fall-delay': `${flake.delay}s`,
              '--drift-distance': `${flake.drift}px`,
              '--rotation-amount': `${flake.rotation}deg`,
            } as React.CSSProperties}
          >
            <div className="snowflake-spin-persistent">
              {createSnowflakePath(flake.size)}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float-persistent {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(15px, -30px, 0) rotate(8deg);
          }
          50% {
            transform: translate3d(-15px, -60px, 0) rotate(-8deg);
          }
          75% {
            transform: translate3d(15px, -30px, 0) rotate(5deg);
          }
        }
        .animate-float-persistent {
          animation: float-persistent ease-in-out infinite;
          transform: translateZ(0);
        }
        @keyframes float-gentle-persistent {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -15px, 0);
          }
        }
        .animate-float-gentle-persistent {
          animation: float-gentle-persistent ease-in-out infinite;
          transform: translateZ(0);
        }
        @keyframes pulse-gentle-persistent {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        .animate-pulse-gentle-persistent {
          animation: pulse-gentle-persistent 3s ease-in-out infinite;
        }
        @keyframes snowflake-fall-persistent {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) translateX(var(--drift-distance, 0));
            opacity: 0;
          }
        }
        @keyframes snowflake-spin-persistent {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(var(--rotation-amount, 360deg));
          }
        }
        .snowflake-fall-persistent {
          animation: snowflake-fall-persistent var(--fall-duration) linear infinite;
          animation-delay: var(--fall-delay);
        }
        .snowflake-spin-persistent {
          animation: snowflake-spin-persistent var(--fall-duration) linear infinite;
          animation-delay: var(--fall-delay);
        }
      `}</style>
    </>
  );
}
