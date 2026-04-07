import { useState, useEffect, memo } from 'react';
import { Truck, Clock, X } from 'lucide-react';

function UrgencyBanner() {
  const [timeLeft, setTimeLeft] = useState('');
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show after 2 seconds
    const showTimer = setTimeout(() => setIsVisible(true), 2000);

    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(23, 59, 59, 999);
      const diff = midnight.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(showTimer);
    };
  }, []);

  if (dismissed || !isVisible) return null;

  return (
    <div className="hidden md:block fixed z-40 top-[73px] left-0 right-0">
      <div className="relative bg-gradient-to-r from-emerald-900/95 via-emerald-800/95 to-teal-900/95 backdrop-blur-md border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-3 text-sm">
          <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="text-emerald-100/90 font-medium">
            <span className="hidden sm:inline">Objednejte dnes a </span>
            <span className="text-white font-bold">doprava zdarma</span>
            <span className="hidden sm:inline"> nad 999 Kč</span>
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/30 border border-emerald-500/20">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 font-mono font-bold text-xs tracking-wider">
              {timeLeft}
            </span>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(UrgencyBanner);
