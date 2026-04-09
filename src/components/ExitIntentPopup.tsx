import { useState, useEffect, memo } from 'react';
import { X, Gift, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes in seconds

  // Countdown timer
  useEffect(() => {
    if (!show) return;
    const timer = setInterval(() => {
      setCountdown(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, [show]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Don't show if already shown this session or user already registered
    if (sessionStorage.getItem('exitPopupShown') || localStorage.getItem('supabase.auth.token')) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 5 && !hasShown) {
        setShow(true);
        setHasShown(true);
        sessionStorage.setItem('exitPopupShown', 'true');
      }
    };

    // Also trigger after inactivity
    let inactivityTimer: ReturnType<typeof setTimeout>;
    const resetInactivity = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (!hasShown && !sessionStorage.getItem('exitPopupShown')) {
          setShow(true);
          setHasShown(true);
          sessionStorage.setItem('exitPopupShown', 'true');
        }
      }, 75000);
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', resetInactivity);
    document.addEventListener('scroll', resetInactivity);
    resetInactivity();

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousemove', resetInactivity);
      document.removeEventListener('scroll', resetInactivity);
      clearTimeout(inactivityTimer);
    };
  }, [hasShown]);

  const handleDismiss = () => {
    setShow(false);
    setMinimized(true); // show the comeback button
  };

  const handleReopen = () => {
    setMinimized(false);
    setShow(true);
  };

  // Minimized comeback button — bottom left
  if (minimized && !show) {
    return (
      <button
        onClick={handleReopen}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-2xl hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 group animate-slide-in-left"
      >
        <div className="relative">
          <Gift className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full" />
        </div>
        <div className="text-left">
          <span className="block text-xs font-black leading-none">SLEVA 15%</span>
          <span className="block text-[10px] text-emerald-200/70 leading-none mt-0.5">Klikněte pro nabídku</span>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 group-hover:rotate-12 transition-transform" />

        <style>{`
          @keyframes slide-in-left {
            from { transform: translateX(-120%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .animate-slide-in-left {
            animation: slide-in-left 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}</style>
      </button>
    );
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-lg animate-popup-scale">
        <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 rounded-3xl border border-emerald-500/20 overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)]">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-10 p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top accent line */}
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-emerald-400 to-teal-400" />

          {/* Floating sparkles decorations */}
          <div className="absolute top-8 left-8 opacity-20">
            <Sparkles className="w-12 h-12 text-emerald-400 animate-pulse" />
          </div>
          <div className="absolute bottom-12 right-8 opacity-15">
            <Sparkles className="w-16 h-16 text-yellow-400 animate-pulse" style={{ animationDelay: '1s' }} />
          </div>

          <div className="relative p-10 text-center">
            {/* Discount badge — big and bold */}
            <div className="inline-flex items-center justify-center w-28 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-500/30 mb-6 relative">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white leading-none">15</span>
                <span className="text-xl font-black text-emerald-400 leading-none">%</span>
              </div>
              {/* Pulse ring */}
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/30 animate-ping-slow" />
            </div>

            <h3 className="text-3xl font-black text-white mb-2">
              Nechte se odměnit!
            </h3>
            <p className="text-lg text-gray-300 mb-2">
              Zaregistrujte se a získejte{' '}
              <span className="text-emerald-400 font-black">slevu 15%</span>
            </p>
            <p className="text-gray-500 text-sm mb-4 max-w-sm mx-auto">
              Slevový kód vám pošleme ihned na email. Platí na celý sortiment bez omezení.
            </p>

            {/* Countdown timer */}
            {countdown > 0 && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 text-sm font-bold">
                  Nabídka vyprší za {formatTime(countdown)}
                </span>
              </div>
            )}

            {/* CTA — big and glowy */}
            <Link
              to="/register"
              onClick={() => setShow(false)}
              className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-lg rounded-2xl hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300"
            >
              <Gift className="w-5 h-5" />
              Registrovat a získat slevu
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Secondary — continue shopping */}
            <button
              onClick={handleDismiss}
              className="block mx-auto mt-4 text-gray-500 hover:text-gray-300 text-sm transition-colors"
            >
              Teď ne, chci jen prohlížet
            </button>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 mt-8 pt-6 border-t border-white/[0.06]">
              {['Bez závazků', 'Zrušíte kdykoliv', 'Email nebude sdílen'].map((text) => (
                <span key={text} className="text-gray-600 text-xs font-medium">
                  ✓ {text}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes popup-scale {
          from {
            opacity: 0;
            transform: scale(0.85) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-popup-scale {
          animation: popup-scale 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.3); opacity: 0; }
        }
        .animate-ping-slow {
          animation: ping-slow 2s ease-out infinite;
        }
      `}</style>
    </div>
  );
}

export default memo(ExitIntentPopup);
