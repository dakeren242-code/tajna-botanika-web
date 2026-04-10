import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogIn, Shield, BookOpen, UserPlus, Sparkles, Flame, Award, Menu, Leaf, Package, X, ChevronRight } from 'lucide-react';
import { useLoyalty } from '../contexts/LoyaltyContext';

export default function Header() {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { points } = useLoyalty();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const goTo = (path: string, hash?: string) => {
    setMenuOpen(false);
    if (hash) {
      navigate(path, { state: { scrollToProducts: true } });
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    } else {
      navigate(path);
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-emerald-500/20"
      style={{ overflow: 'visible' }}
    >
      <div className="max-w-7xl mx-auto px-3 md:px-4 py-2.5 md:py-4" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between relative" style={{ overflow: 'visible' }}>

          {/* ───── LEFT SIDE ───── */}
          <nav className="flex items-center gap-1 md:gap-3 flex-1">
            {/* Hamburger Menu */}
            <div ref={menuRef} className="relative" style={{ overflow: 'visible' }}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-lg transition-all text-sm ${
                  menuOpen
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                <span className="hidden md:inline font-medium">Menu</span>
              </button>

              {menuOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-72 bg-black/95 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden z-[100]"
                  style={{ animation: 'menuSlide 0.2s ease-out' }}
                >
                  <div className="p-2">
                    {/* THC-X Květy */}
                    <button
                      onClick={() => goTo('/', 'products')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-emerald-500/10 transition-all group text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-500/40 transition-all">
                        <Leaf className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <span className="text-white font-bold text-sm block">THC-X Květy</span>
                        <span className="text-gray-500 text-xs">9 prémiových odrůd</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
                    </button>

                    {/* Bundle Balíčky */}
                    <button
                      onClick={() => goTo('/balicek')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-amber-500/10 transition-all group text-left"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-amber-500/40 transition-all">
                        <Package className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <span className="text-white font-bold text-sm block">Bundle Balíčky</span>
                        <span className="text-gray-500 text-xs">Sestavte si set se slevou až 32%</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors" />
                    </button>
                  </div>

                  {/* Bottom CTA */}
                  <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-t border-emerald-500/10">
                    <button
                      onClick={() => goTo('/', 'kontakt')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                    >
                      Potřebujete poradit? Zavolejte 739 385 030
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Akademie — zpět jako samostatný link */}
            <Link
              to="/akademie"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all text-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">Akademie</span>
            </Link>

            {/* Akce — zpět jako samostatný link */}
            <Link
              to="/akce"
              className="relative flex items-center gap-1 md:gap-1.5 px-2.5 md:px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-sm"
            >
              <Flame className="w-4 h-4" />
              <span className="hidden lg:inline font-medium">Akce</span>
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
              <>
                <Link
                  to="/admin"
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all text-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </Link>
                <Link
                  to="/admin"
                  className="flex md:hidden items-center px-2.5 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all"
                >
                  <Shield className="w-4 h-4" />
                </Link>
              </>
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
            <span className="hidden lg:inline text-xl xl:text-2xl font-serif font-bold bg-gradient-to-br from-white via-yellow-100 to-yellow-600 bg-clip-text text-transparent tracking-wide">
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
              <span className="hidden lg:inline">Košík</span>
            </Link>

            {user ? (
              <div className="flex items-center gap-1.5">
                <Link to="/profile#loyalty"
                  className="flex items-center gap-1.5 px-2 md:px-2.5 py-1.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15 hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all duration-300 group"
                  title="Věrnostní body"
                >
                  <Award className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                  <span className="text-xs font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                    {points?.current_points ?? 0}
                  </span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-1.5 px-3 md:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all text-sm font-semibold"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profil</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-2.5 lg:px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden lg:inline">Přihlásit</span>
                </Link>

                <Link
                  to="/register"
                  className="relative flex items-center gap-1 md:gap-1.5 px-3 md:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-400 hover:to-teal-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300 text-xs md:text-sm font-bold"
                >
                  <UserPlus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  <span className="hidden lg:inline">Registrace</span>
                  <span className="lg:hidden">Reg.</span>
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
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
}
