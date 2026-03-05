import { useEffect, useState } from 'react';
import { TrendingUp, Eye, ShoppingCart, Users } from 'lucide-react';

export default function LiveCounter() {
  const [visitors, setVisitors] = useState(247);
  const [sales, setSales] = useState(1823);
  const [viewing, setViewing] = useState(34);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const visitorInterval = setInterval(() => {
      setVisitors((prev) => prev + Math.floor(Math.random() * 3));
    }, 8000);

    const salesInterval = setInterval(() => {
      setSales((prev) => prev + 1);
    }, 15000);

    const viewingInterval = setInterval(() => {
      setViewing((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(20, Math.min(50, prev + change));
      });
    }, 5000);

    return () => {
      clearInterval(visitorInterval);
      clearInterval(salesInterval);
      clearInterval(viewingInterval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="hidden md:block fixed bottom-6 left-6 z-[9000] animate-slide-in-left">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative bg-black/90 backdrop-blur-xl border border-green-400/30 rounded-2xl p-4 shadow-2xl">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500/80 hover:bg-red-500 flex items-center justify-center text-white text-xs transition-all duration-200"
            data-cursor-hover
          >
            ×
          </button>

          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-bold uppercase tracking-wider">
              Živá Statistika
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 group/item hover:bg-white/5 p-2 rounded-lg transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                <Eye className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Právě prohlíží
                </div>
                <div className="text-lg font-black text-white">
                  {viewing}
                  <span className="text-xs text-gray-400 ml-1">lidí</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 group/item hover:bg-white/5 p-2 rounded-lg transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Návštěvníků dnes
                </div>
                <div className="text-lg font-black text-white animate-count-up">
                  {visitors.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 group/item hover:bg-white/5 p-2 rounded-lg transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 uppercase tracking-wide">
                  Prodáno tento měsíc
                </div>
                <div className="text-lg font-black text-white animate-count-up">
                  {sales.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-[10px] text-green-400 font-bold">
              +24% než minulý měsíc
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out 2s both;
        }
        @keyframes count-up {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-count-up {
          animation: count-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
