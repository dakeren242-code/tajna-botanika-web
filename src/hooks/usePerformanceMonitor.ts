import { useEffect, useRef, useState, useMemo } from 'react';

export type PerformanceLevel = 'high' | 'medium' | 'low' | 'potato';

interface PerformanceMetrics {
  fps: number;
  level: PerformanceLevel;
  particleCount: number;
  enableShadows: boolean;
  enableAnimations: boolean;
  enableCursor: boolean;
}

export function usePerformanceMonitor(enabled: boolean = true): PerformanceMetrics {
  const [fps, setFps] = useState(60);
  const [level, setLevel] = useState<PerformanceLevel>(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    return isMobile ? 'low' : 'high';
  });
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!enabled) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
      setLevel(isMobile ? 'low' : 'high');
      return;
    }

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
      setLevel('low');
      return;
    }

    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const elapsed = currentTime - lastTimeRef.current;

      if (elapsed >= 1000) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);

        if (currentFps >= 50) {
          setLevel('high');
        } else if (currentFps >= 35) {
          setLevel('medium');
        } else if (currentFps >= 20) {
          setLevel('low');
        } else {
          setLevel('potato');
        }

        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      animationFrameRef.current = requestAnimationFrame(measureFPS);
    };

    animationFrameRef.current = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [enabled]);

  const settings = useMemo(() => {
    switch (level) {
      case 'high':
        return {
          particleCount: 30,
          enableShadows: true,
          enableAnimations: true,
          enableCursor: false,
        };
      case 'medium':
        return {
          particleCount: 20,
          enableShadows: false,
          enableAnimations: true,
          enableCursor: false,
        };
      case 'low':
        return {
          particleCount: 10,
          enableShadows: false,
          enableAnimations: true,
          enableCursor: false,
        };
      case 'potato':
        return {
          particleCount: 0,
          enableShadows: false,
          enableAnimations: false,
          enableCursor: false,
        };
    }
  }, [level]);

  return useMemo(() => ({
    fps,
    level,
    ...settings,
  }), [fps, level, settings]);
}
