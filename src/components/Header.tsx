import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogIn, Shield, BookOpen, UserPlus, Sparkles, Flame } from 'lucide-react';

export default function Header() {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-emerald-500/20"
      style={{ overflow: 'visible' }}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2.5 md:py-4" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between relative" style={{ overflow: 'visible' }}>

          {/* ───── LEFT SIDE ───── */}
          <nav className="flex items-center gap-1 md:gap-3 flex-1">
            {/* Desktop: Akademie + Akce side by side */}
            <Link
              to="/akademie"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">Akademie</span>
            </Link>

            {/* Akce — visible on all sizes, positioned symmetrically */}
            <Link
              to="/akce"
              className="relative flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm"
            >
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Akce</span>
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
            </Link>

            {/* Mobile: Akademie icon-only */}
            <Link
              to="/akademie"
              className="flex md:hidden items-center px-2.5 py-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
            >
              <BookOpen className="w-4 h-4" />
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all text-sm"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          {/* ───── CENTER: Logo ───── */}
          <Link
            to="/"
            className="logo-link absolute flex items-center gap-2 md:gap-3"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
            onClick={() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); document.documentElement.style.scrollBehavior = ''; }}
          >
            <img
              src="/logo_botanika.png"
              alt="Tajná Botanika"
              className="h-9 w-9 md:h-14 md:w-14 object-cover rounded-full"
            />
            <span className="hidden sm:inline text-xl md:text-2xl font-serif font-bold bg-gradient-to-br from-white via-yellow-100 to-yellow-600 bg-clip-text text-transparent tracking-wide">
              Tajná Botanika
            </span>
          </Link>

          {/* ───── RIGHT SIDE ───── */}
          <nav className="flex items-center gap-1 md:gap-3 flex-1 justify-end" style={{ overflow: 'visible' }}>
            <Link
              to="/cart"
              className="relative flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all text-sm"
            >
              <ShoppingCart className="w-5 h-5 md:w-5 md:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="hidden sm:inline">Košík</span>
            </Link>

            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all text-sm font-semibold"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profil</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Přihlásit</span>
                </Link>

                {/* Mobile: compact login icon */}
                <Link
                  to="/login"
                  className="flex md:hidden items-center px-2.5 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >
                  <LogIn className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  className="relative flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 text-xs md:text-sm font-bold"
                >
                  <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Registrace</span>
                  <span className="sm:hidden">Reg.</span>
                  <span className="absolute -top-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-yellow-500 text-black text-[9px] md:text-[10px] font-black rounded-full shadow-lg animate-bounce-gentle">
                    <Sparkles className="w-2 h-2 md:w-2.5 md:h-2.5" />
                    -15%
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>

      <style>{`
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </header>
  );
}
