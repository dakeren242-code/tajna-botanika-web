import { useEffect, useRef } from 'react';
import { usePerformance } from '../contexts/PerformanceContext';

interface TrailPoint {
  x: number;
  y: number;
  age: number;
}

export default function CustomCursor() {
  const { enableCursor } = usePerformance();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!enableCursor) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Load cursor image and remove white background
    const cursorImg = new Image();
    cursorImg.crossOrigin = 'anonymous';
    cursorImg.onload = () => {
      // Create temporary canvas to process image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCanvas.width = cursorImg.width;
      tempCanvas.height = cursorImg.height;

      // Draw original image
      tempCtx.drawImage(cursorImg, 0, 0);

      // Get image data
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;

      // Remove white background (and near-white pixels)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // If pixel is close to white, make it transparent
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0; // Set alpha to 0
        }
      }

      // Put processed image back
      tempCtx.putImageData(imageData, 0, 0);

      // Create new image from processed canvas
      const processedImg = new Image();
      processedImg.src = tempCanvas.toDataURL();
      imgRef.current = processedImg;
    };
    cursorImg.src = '/chatgpt_image_30._1._2026_17_24_10.png';

    // Setup canvas size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // State (no React state!)
    let mouseX = -100;
    let mouseY = -100;
    let isHovering = false;
    let clickScale = 1;
    const trail: TrailPoint[] = [];
    let spinAngle = 0;
    let pingOpacity = 0.4;
    let pingScale = 1;
    let lastTrailUpdate = 0;

    // Mouse handlers
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Add trail point (throttled)
      const now = Date.now();
      if (now - lastTrailUpdate > 10) {
        trail.unshift({ x: mouseX, y: mouseY, age: 0 });
        if (trail.length > 9) trail.length = 9;
        lastTrailUpdate = now;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      isHovering = !!(
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[data-cursor-hover]')
      );
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    // Animation loop
    let rafId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update animations
      spinAngle += 0.02;
      if (spinAngle > Math.PI * 2) spinAngle -= Math.PI * 2;

      // Ping animation
      pingScale += 0.03;
      pingOpacity -= 0.008;
      if (pingScale > 2) {
        pingScale = 1;
        pingOpacity = 0.4;
      }

      // Smooth scale transition
      const targetScale = isHovering ? 1.5 : 1;
      clickScale += (targetScale - clickScale) * 0.2;

      // Age trail points
      trail.forEach(point => point.age++);

      // Draw trail (smoke/vapor effect)
      trail.forEach((point, index) => {
        const progress = 1 - (index / trail.length);
        const size = 8 * progress;
        const alpha = progress * 0.25;

        ctx.globalAlpha = alpha;

        // Gradient fill - green smoke
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, size * 1.5);
        if (isHovering) {
          gradient.addColorStop(0, '#86efac');
          gradient.addColorStop(0.5, '#34d399');
          gradient.addColorStop(1, 'transparent');
        } else {
          gradient.addColorStop(0, '#6ee7b7');
          gradient.addColorStop(0.5, '#34d399');
          gradient.addColorStop(1, 'transparent');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Tiny sparkles in trail
        if (index % 2 === 0 && progress > 0.5) {
          ctx.globalAlpha = progress * 0.6;
          ctx.fillStyle = '#fef3c7';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#fef3c7';
          ctx.beginPath();
          ctx.arc(point.x + (Math.random() - 0.5) * 3, point.y + (Math.random() - 0.5) * 3, 1, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });
      ctx.globalAlpha = 1;

      // Draw main cursor (ice cream image)
      if (imgRef.current && imgRef.current.complete) {
        ctx.save();
        ctx.translate(mouseX, mouseY);
        ctx.scale(clickScale, clickScale);
        ctx.rotate(spinAngle * 0.05);

        // Glow aura when hovering
        if (isHovering || pingOpacity > 0) {
          const glowOpacity = isHovering ? 0.4 : pingOpacity * 0.3;
          ctx.globalAlpha = glowOpacity;
          const glowGrad = ctx.createRadialGradient(0, -20, 0, 0, -20, 50 * (isHovering ? 1.2 : pingScale));
          glowGrad.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
          glowGrad.addColorStop(0.3, 'rgba(147, 197, 253, 0.3)');
          glowGrad.addColorStop(0.6, 'rgba(251, 146, 60, 0.2)');
          glowGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(0, -20, 50 * (isHovering ? 1.2 : pingScale), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Draw the ice cream image
        const imgSize = isHovering ? 70 : 60;

// hotspot v procentech
const hotspotX = 0.3; // 30 % zleva
const hotspotY = 0.3; // 30 % shora

ctx.drawImage(
  imgRef.current,
  -imgSize * hotspotX,
  -imgSize * hotspotY,
  imgSize,
  imgSize
);


        // Extra sparkles around the image
        const trichomeTime = Date.now() * 0.003;
        const sparklePositions = [
          { x: -25, y: -45, phase: 0 },
          { x: 25, y: -45, phase: 1 },
          { x: -20, y: -25, phase: 2 },
          { x: 20, y: -25, phase: 3 },
          { x: 0, y: -55, phase: 4 },
          { x: -15, y: -10, phase: 5 },
          { x: 15, y: -10, phase: 6 }
        ];

        sparklePositions.forEach(pos => {
          const sparkle = 0.4 + Math.sin(trichomeTime + pos.phase) * 0.6;
          ctx.globalAlpha = sparkle * (isHovering ? 1 : 0.6);

          // Sparkle glow
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#fef9c3';
          ctx.fillStyle = '#fef3c7';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Bright center
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 0.8, 0, Math.PI * 2);
          ctx.fill();

          ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1;

        ctx.restore();
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('resize', resize);
    };
  }, [enableCursor]);

  if (!enableCursor) {
    return null;
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9999]"
        style={{ mixBlendMode: 'screen' }}
      />
      <style>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </>
  );
}
