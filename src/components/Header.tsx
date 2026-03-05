import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogIn, Shield } from 'lucide-react';

export default function Header() {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    if (!isHomePage) {
      setIsHeaderVisible(true);
      return;
    }

    let mouseY = 0;

    const updateHeaderVisibility = () => {
      const scrolled = window.scrollY > 100;
      const mouseAtTop = mouseY < 100;
      setIsHeaderVisible(scrolled || mouseAtTop);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseY = e.clientY;
      updateHeaderVisibility();
    };

    const handleScroll = () => {
      updateHeaderVisibility();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-emerald-500/20 transition-transform duration-300 ease-in-out"
        style={{
          overflow: 'visible',
          transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1" />

            <button
              onClick={() => {
                if (location.pathname === '/') {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                  window.location.href = '/';
                }
              }}
              className="flex items-center gap-3 group cursor-pointer"
              style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', willChange: 'transform' }}
            >
              <img
                src="/logo_botanika.png"
                alt="Tajná Botanika"
                className="h-12 w-12 object-cover rounded-full group-hover:scale-105 transition-transform drop-shadow-lg"
              />
            </button>

            <nav className="flex items-center gap-4 flex-1 justify-end">
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-2 px-4 py-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-all"
              >
                <Shield className="w-5 h-5" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-4 py-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-all"
            >
              <ShoppingCart className="w-5 h-5" />

              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="hidden sm:inline">Košík</span>
            </Link>

            {user ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Profil</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                <LogIn className="w-5 h-5" />
                <span className="hidden sm:inline">Přihlásit se</span>
              </Link>
            )}
          </nav>
        </div>
      </div>
      </header>
    </>
  );
}
