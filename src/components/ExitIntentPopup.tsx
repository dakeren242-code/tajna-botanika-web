import { useState, useEffect, memo } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

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

    // Also trigger after 60s of inactivity
    let inactivityTimer: ReturnType<typeof setTimeout>;
    const resetInactivity = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (!hasShown && !sessionStorage.getItem('exitPopupShown')) {
          setShow(true);
          setHasShown(true);
          sessionStorage.setItem('exitPopupShown', 'true');
        }
      }, 90000); // 90 seconds
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

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) setShow(false); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" />

      {/* Modal */}
      <div className="relative w-full max-w-md animate-popup-scale">
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950 rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl">
          {/* Close button */}
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 z-10 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <Gift className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-black text-white mb-2">
              Počkejte!
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Zaregistrujte se a získejte<br />
              <span className="text-3xl font-black text-emerald-400">10% slevu</span><br />
              <span className="text-sm">na vaši první objednávku</span>
            </p>

            <Link
              to="/register"
              onClick={() => setShow(false)}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300"
            >
              Získat slevu
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-gray-600 text-xs mt-4">
              Kód pošleme na váš email po registraci
            </p>
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
            transform: scale(0.9) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-popup-scale {
          animation: popup-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

export default memo(ExitIntentPopup);
