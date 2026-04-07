import { useState, useEffect, memo } from 'react';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';

function SeasonalBanner() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Spring Collection ends May 31, 2026
    const endDate = new Date('2026-05-31T23:59:59');

    const update = () => {
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-16 px-6 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background with animated gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-900/30 to-cyan-900/40" />
          <div className="absolute inset-0 seasonal-shimmer" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent" />

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Left — text */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 text-xs font-bold tracking-wider">LIMITOVANÁ EDICE</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-black text-white mb-3">
                  Spring Collection{' '}
                  <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">2026</span>
                </h3>

                <p className="text-gray-300 mb-6 max-w-lg leading-relaxed">
                  Jarní kolekce přináší 3 exkluzivní odrůdy pěstované s využitím nové technologie
                  extrakce terpenů. Dostupné pouze do vyprodání zásob.
                </p>

                <a
                  href="/#products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300 text-sm"
                >
                  Prozkoumat kolekci
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Right — countdown */}
              <div className="flex-shrink-0">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider text-center mb-3 flex items-center gap-1.5 justify-center">
                  <Clock className="w-3.5 h-3.5" />
                  Nabídka končí za
                </p>
                <div className="flex gap-3">
                  {[
                    { value: timeLeft.days, label: 'Dní' },
                    { value: timeLeft.hours, label: 'Hod' },
                    { value: timeLeft.minutes, label: 'Min' },
                    { value: timeLeft.seconds, label: 'Sek' },
                  ].map((unit, i) => (
                    <div key={i} className="text-center">
                      <div className="w-16 h-16 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-center mb-1.5">
                        <span className="text-2xl font-black text-white font-mono">
                          {unit.value.toString().padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider">
                        {unit.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes seasonal-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .seasonal-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(16, 185, 129, 0.05) 25%,
            rgba(20, 184, 166, 0.08) 50%,
            rgba(16, 185, 129, 0.05) 75%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: seasonal-shimmer 8s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

export default memo(SeasonalBanner);
