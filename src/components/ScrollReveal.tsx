import { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade';
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const isMobile = window.innerWidth < 768;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              element.classList.add('revealed');
            }, delay);
            observer.unobserve(element);
          }
        });
      },
      {
        threshold: isMobile ? 0 : 0.1,
        rootMargin: isMobile ? '100px 0px 100px 0px' : '0px 0px -100px 0px',
      }
    );

    observer.observe(element);

    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    if (isMobile) {
      fallbackTimer = setTimeout(() => {
        if (!element.classList.contains('revealed')) {
          element.classList.add('revealed');
        }
      }, 500 + delay);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
    };
  }, [delay]);

  const getAnimationClass = () => {
    switch (direction) {
      case 'up':
        return 'scroll-reveal-up';
      case 'down':
        return 'scroll-reveal-down';
      case 'left':
        return 'scroll-reveal-left';
      case 'right':
        return 'scroll-reveal-right';
      case 'scale':
        return 'scroll-reveal-scale';
      case 'fade':
        return 'scroll-reveal-fade';
      default:
        return 'scroll-reveal-up';
    }
  };

  return (
    <>
      <div
        ref={elementRef}
        className={`${getAnimationClass()} ${className}`}
      >
        {children}
      </div>

      <style>{`
        .scroll-reveal-up,
        .scroll-reveal-down,
        .scroll-reveal-left,
        .scroll-reveal-right,
        .scroll-reveal-scale,
        .scroll-reveal-fade {
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        .scroll-reveal-up {
          transform: translateY(50px) translateZ(0);
        }

        .scroll-reveal-down {
          transform: translateY(-50px) translateZ(0);
        }

        .scroll-reveal-left {
          transform: translateX(50px) translateZ(0);
        }

        .scroll-reveal-right {
          transform: translateX(-50px) translateZ(0);
        }

        .scroll-reveal-scale {
          transform: scale(0.8) translateZ(0);
        }

        .scroll-reveal-fade {
          transform: translateZ(0);
        }

        .scroll-reveal-up.revealed,
        .scroll-reveal-down.revealed,
        .scroll-reveal-left.revealed,
        .scroll-reveal-right.revealed {
          opacity: 1;
          transform: translate(0, 0) translateZ(0);
        }

        .scroll-reveal-scale.revealed {
          opacity: 1;
          transform: scale(1) translateZ(0);
        }

        .scroll-reveal-fade.revealed {
          opacity: 1;
          transform: translateZ(0);
        }
      `}</style>
    </>
  );
}
