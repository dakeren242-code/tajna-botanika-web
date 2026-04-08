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

    const rect = element.getBoundingClientRect();
    const isInView = rect.top < window.innerHeight + 100 && rect.bottom > -100;

    // If already in viewport (e.g. navigating back to homepage), show immediately
    if (isInView) {
      element.style.opacity = '1';
      element.style.transform = 'none';
      return;
    }

    // Below viewport - set up scroll animation
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    if (direction === 'up') element.style.transform = 'translateY(30px)';
    else if (direction === 'down') element.style.transform = 'translateY(-30px)';
    else if (direction === 'left') element.style.transform = 'translateX(30px)';
    else if (direction === 'right') element.style.transform = 'translateX(-30px)';
    else if (direction === 'scale') element.style.transform = 'scale(0.95)';

    const reveal = () => {
      element.style.opacity = '1';
      element.style.transform = 'none';
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(reveal, delay);
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0, rootMargin: '200px' }
    );

    observer.observe(element);

    // Safety net: ALWAYS reveal within 1s
    const safety = setTimeout(reveal, 1000 + delay);

    return () => {
      observer.unobserve(element);
      clearTimeout(safety);
    };
  }, [delay, direction]);

  return <div ref={elementRef} className={className}>{children}</div>;
}
