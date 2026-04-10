import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';
import { getVisitorCount, onVisitorCountChange } from '../App';

export default function LiveCounter() {
  const [visitors, setVisitors] = useState(getVisitorCount);
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    return onVisitorCountChange(setVisitors);
  }, []);

  // Don't show if dismissed, no visitors, or admin device
  if (dismissed || visitors < 2 || localStorage.getItem('tb_admin') === '1') return null;

  // Auto-show after 3s delay
  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="hidden md:block fixed bottom-6 left-6 z-[9000] animate-slide-in-left">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative bg-black/90 backdrop-blur-xl border border-green-400/30 rounded-2xl px-4 py-3 shadow-2xl">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white text-xs transition-all duration-200"
          >
            &times;
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Eye className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">
                  Právě prohlíží
                </span>
              </div>
              <div className="text-lg font-black text-white">
                {visitors}
                <span className="text-xs text-gray-400 ml-1">lidí</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left { animation: slide-in-left 0.5s ease-out 2s both; }
      `}</style>
    </div>
  );
}
