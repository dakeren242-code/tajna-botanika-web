import { memo } from 'react';

// Generate random shooting stars
const shootingStars = Array.from({ length: 6 }, (_, i) => ({
  id: i,
  top: 5 + Math.random() * 50, // upper half of screen
  left: Math.random() * 80,
  delay: Math.random() * 20,
  duration: 0.6 + Math.random() * 0.8, // very fast: 0.6-1.4s
  angle: 15 + Math.random() * 30, // 15-45 degree angle
  length: 80 + Math.random() * 120, // trail length
  interval: 8 + Math.random() * 15, // seconds between appearances
}));

function GlobalBackground() {
  return (
    <>
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-purple-950 via-slate-900 to-green-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(34,197,94,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,146,60,0.12),transparent_50%)]" />
      </div>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.02] pointer-events-none" />

      {/* Shooting stars ✨ */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        {shootingStars.map((star) => (
          <div
            key={star.id}
            className="absolute shooting-star"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              '--star-delay': `${star.delay}s`,
              '--star-duration': `${star.duration}s`,
              '--star-angle': `${star.angle}deg`,
              '--star-length': `${star.length}px`,
              '--star-interval': `${star.interval}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <style>{`
        .shooting-star {
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: shooting-star-fly calc(var(--star-duration) + var(--star-interval)) linear infinite;
          animation-delay: var(--star-delay);
          opacity: 0;
        }

        .shooting-star::after {
          content: '';
          position: absolute;
          top: 50%;
          right: 100%;
          width: var(--star-length);
          height: 1px;
          background: linear-gradient(
            to left,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0.4) 20%,
            rgba(167, 139, 250, 0.2) 50%,
            transparent
          );
          transform: translateY(-50%);
        }

        @keyframes shooting-star-fly {
          0% {
            transform: translate(0, 0) rotate(var(--star-angle));
            opacity: 0;
          }
          /* Star appears and flies quickly in the first portion */
          1% {
            opacity: 1;
          }
          3% {
            opacity: 1;
            transform: translate(
              calc(var(--star-length) * 0.5),
              calc(var(--star-length) * 0.3)
            ) rotate(var(--star-angle));
          }
          5% {
            transform: translate(
              calc(var(--star-length) * 2),
              calc(var(--star-length) * 1.2)
            ) rotate(var(--star-angle));
            opacity: 0;
          }
          /* Rest of the cycle: invisible (waiting for next appearance) */
          100% {
            transform: translate(
              calc(var(--star-length) * 2),
              calc(var(--star-length) * 1.2)
            ) rotate(var(--star-angle));
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}

export default memo(GlobalBackground);
