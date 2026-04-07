import { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { Gift, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Floating bottom CTA for mobile — shows for non-logged users after 5s scroll.
 * Dismissible. Only appears on mobile where the header register button is smaller.
 */
function FloatingRegisterCTA() {
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (user || dismissed) return;

    const handleScroll = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [user, dismissed]);

  if (user || dismissed || !visible) return null;

  return (
    <div className="md:hidden fixed bottom-20 left-4 right-4 z-40 animate-slide-up-cta">
      <div className="relative flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/95 to-teal-900/95 backdrop-blur-xl border border-emerald-500/25 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
        <button
          onClick={() => setDismissed(true)}
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
        >
          <X className="w-3 h-3" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
          <Gift className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-bold leading-tight">
            Registrujte se → <span className="text-yellow-400">15% sleva</span>
          </p>
          <p className="text-gray-400 text-[11px] leading-tight mt-0.5">
            Ihned na email, platí na vše
          </p>
        </div>

        <Link
          to="/register"
          className="flex-shrink-0 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all"
        >
          Získat
        </Link>
      </div>

      <style>{`
        @keyframes slide-up-cta {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up-cta {
          animation: slide-up-cta 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>
    </div>
  );
}

export default memo(FloatingRegisterCTA);
