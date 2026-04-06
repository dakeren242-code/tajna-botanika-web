import { useEffect, useRef } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  color: string;
}

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { particleCount, enableShadows } = usePerformance();

  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number>(0);
  const particleCountRef = useRef(particleCount);
  const enableShadowsRef = useRef(enableShadows);

  particleCountRef.current = particleCount;
  enableShadowsRef.current = enableShadows;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isMobile = window.innerWidth < 768;
    if (isMobile) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FFD700', '#FF6B9D', '#C084FC', '#06B6D4', '#34D399'];

    const initParticles = (count: number) => {
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };

    if (particlesRef.current.length === 0) {
      initParticles(particleCountRef.current || 30);
    }

    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
    }

    const animate = () => {
      const count = particleCountRef.current;
      const shadows = enableShadowsRef.current;

      if (count === 0) {
        animationFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      if (particlesRef.current.length !== count) {
        if (count > particlesRef.current.length) {
          const extra = count - particlesRef.current.length;
          for (let i = 0; i < extra; i++) {
            particlesRef.current.push({
              x: Math.random() * canvas.width,
              y: Math.random() * canvas.height,
              size: Math.random() * 3 + 1,
              speedY: Math.random() * 0.5 + 0.2,
              opacity: Math.random() * 0.5 + 0.2,
              color: colors[Math.floor(Math.random() * colors.length)],
            });
          }
        } else {
          particlesRef.current = particlesRef.current.slice(0, count);
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle) => {
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        if (shadows) {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 4
          );
          gradient.addColorStop(0, particle.color);
          gradient.addColorStop(0.4, particle.color + '80');
          gradient.addColorStop(1, particle.color + '00');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        particle.y -= particle.speedY;

        if (particle.y < -10) {
          particle.y = canvas.height + 10;
          particle.x = Math.random() * canvas.width;
        }
      });

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
