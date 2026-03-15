import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  type: 'star' | 'sparkle' | 'leaf';
}

export default function CartParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const spawnParticle = () => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 3 + Math.random() * 3;

      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x: 0,
        y: 0,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity - 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        size: 12 + Math.random() * 8,
        type: Math.random() > 0.6 ? 'star' : (Math.random() > 0.5 ? 'sparkle' : 'leaf'),
      };

      setParticles(prev => [...prev.slice(-15), newParticle]);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => p.id !== newParticle.id));
      }, 2000);
    };

    const interval = setInterval(spawnParticle, 80);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="fixed pointer-events-none z-[9999]"
          style={{
            left: '50%',
            top: '50%',
            width: particle.size,
            height: particle.size,
            animation: `floatAway 2s ease-out forwards`,
            animationDelay: '0s',
            '--start-x': '0px',
            '--start-y': '0px',
            '--end-x': `${particle.velocityX * 50}px`,
            '--end-y': `${particle.velocityY * 50}px`,
            '--rotation': `${particle.rotation}deg`,
            '--rotation-speed': `${particle.rotationSpeed * 360}deg`,
          } as React.CSSProperties}
        >
          {particle.type === 'star' && (
            <div className="w-full h-full text-yellow-400 animate-pulse">
              ⭐
            </div>
          )}
          {particle.type === 'sparkle' && (
            <div className="w-full h-full text-emerald-400 animate-spin">
              ✨
            </div>
          )}
          {particle.type === 'leaf' && (
            <div className="w-full h-full text-green-500">
              🍃
            </div>
          )}
        </div>
      ))}

      <style>{`
        @keyframes floatAway {
          0% {
            transform: translate(-50%, -50%) translate(var(--start-x), var(--start-y)) rotate(var(--rotation)) scale(0);
            opacity: 1;
          }
          20% {
            transform: translate(-50%, -50%) translate(calc(var(--end-x) * 0.2), calc(var(--end-y) * 0.2)) rotate(calc(var(--rotation) + var(--rotation-speed) * 0.2)) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(var(--end-x), var(--end-y)) rotate(calc(var(--rotation) + var(--rotation-speed))) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
