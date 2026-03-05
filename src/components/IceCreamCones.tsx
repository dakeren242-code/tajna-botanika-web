import { useEffect, useState } from 'react';

interface IceCream {
  id: number;
  x: number;
  y: number;
  size: number;
  color1: string;
  color2: string;
  delay: number;
}

export default function IceCreamCones() {
  const [icecreams, setIcecreams] = useState<IceCream[]>([]);

  useEffect(() => {
    const colors = [
      { c1: 'from-pink-300', c2: 'to-pink-500' },
      { c1: 'from-purple-300', c2: 'to-purple-500' },
      { c1: 'from-yellow-300', c2: 'to-yellow-500' },
      { c1: 'from-green-300', c2: 'to-green-500' },
      { c1: 'from-blue-300', c2: 'to-blue-500' },
    ];

    const newIcecreams: IceCream[] = Array.from({ length: 6 }, (_, i) => {
      const colorPair = colors[i % colors.length];
      return {
        id: i,
        x: 10 + (i * 15) + Math.random() * 10,
        y: 20 + Math.random() * 60,
        size: 50 + Math.random() * 30,
        color1: colorPair.c1,
        color2: colorPair.c2,
        delay: Math.random() * 3,
      };
    });
    setIcecreams(newIcecreams);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icecreams.map((ice) => (
        <div
          key={ice.id}
          className="absolute animate-float-gentle opacity-70"
          style={{
            left: `${ice.x}%`,
            top: `${ice.y}%`,
            width: `${ice.size}px`,
            height: `${ice.size * 1.6}px`,
            animationDelay: `${ice.delay}s`,
            animationDuration: '6s',
          }}
        >
          <div className="relative w-full h-full">
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-3/5 bg-gradient-to-b ${ice.color1} ${ice.color2} rounded-full blur-sm`}
                 style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)' }} />

            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-3/5 bg-gradient-to-br ${ice.color1} ${ice.color2} rounded-full animate-ice-wobble`}>
              <div className="absolute top-[15%] left-[25%] w-[30%] h-[30%] bg-white/70 rounded-full blur-sm" />
              <div className="absolute bottom-[20%] right-[25%] w-[25%] h-[25%] bg-white/50 rounded-full blur-[2px]" />
            </div>

            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2/5 h-2/5 bg-gradient-to-b from-amber-600 to-amber-800"
                 style={{
                   clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
                   filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                 }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/50 to-transparent" />
              <svg className="absolute inset-0" viewBox="0 0 100 100" preserveAspectRatio="none">
                <line x1="30" y1="0" x2="10" y2="100" stroke="rgba(139, 69, 19, 0.4)" strokeWidth="2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="rgba(139, 69, 19, 0.4)" strokeWidth="2" />
                <line x1="70" y1="0" x2="90" y2="100" stroke="rgba(139, 69, 19, 0.4)" strokeWidth="2" />
              </svg>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px) rotate(-3deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        .animate-float-gentle {
          animation: float-gentle ease-in-out infinite;
        }
        @keyframes ice-wobble {
          0%, 100% {
            transform: translateX(-50%) scaleY(1);
          }
          50% {
            transform: translateX(-50%) scaleY(1.05);
          }
        }
        .animate-ice-wobble {
          animation: ice-wobble 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
