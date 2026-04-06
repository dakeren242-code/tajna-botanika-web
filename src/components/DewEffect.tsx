import { useEffect, useState } from 'react';

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

export default function DewEffect() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    const flakes: Snowflake[] = Array.from({ length: 25 }, (_, i) => {
      const size = 8 + Math.random() * 20;

      return {
        id: i,
        x: Math.random() * 100,
        startY: -10 - Math.random() * 20,
        size,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 15,
        drift: -20 + Math.random() * 40,
        rotation: Math.random() * 720,
      };
    });
    setSnowflakes(flakes);
  }, []);

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

  return (
    <>
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {snowflakes.map((flake) => (
          <div
            key={flake.id}
            className="absolute snowflake-fall"
            style={{
              left: `${flake.x}%`,
              top: `${flake.startY}%`,
              '--fall-duration': `${flake.duration}s`,
              '--fall-delay': `${flake.delay}s`,
              '--drift-distance': `${flake.drift}px`,
              '--rotation-amount': `${flake.rotation}deg`,
            } as React.CSSProperties}
          >
            <div className="snowflake-spin">
              {createSnowflakePath(flake.size)}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes snowflake-fall {
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

        @keyframes snowflake-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(var(--rotation-amount, 360deg));
          }
        }

        .snowflake-fall {
          animation: snowflake-fall var(--fall-duration) linear infinite;
          animation-delay: var(--fall-delay);
        }

        .snowflake-spin {
          animation: snowflake-spin var(--fall-duration) linear infinite;
          animation-delay: var(--fall-delay);
        }
      `}</style>
    </>
  );
}
