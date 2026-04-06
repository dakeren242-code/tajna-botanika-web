import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogIn, Shield } from 'lucide-react';

export default function Header() {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-emerald-500/20"
      style={{ overflow: 'visible' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-5" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between relative" style={{ overflow: 'visible' }}>
          <div className="flex-1" />

          <Link
            to="/"
            className="logo-link absolute flex items-center gap-3"
            style={{ left: '50%', transform: 'translateX(-50%)' }}
            onClick={() => { document.documentElement.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); document.documentElement.style.scrollBehavior = ''; }}
          >
            <img
              src="/logo_botanika.png"
              alt="Tajná Botanika"
              className="h-16 w-16 object-cover rounded-full"
            />
            <span className="hidden sm:inline text-2xl font-serif font-bold bg-gradient-to-br from-white via-yellow-100 to-yellow-600 bg-clip-text text-transparent tracking-wide">
              Tajná Botanika
            </span>
          </Link>

          <nav className="flex items-center gap-4 flex-1 justify-end" style={{ overflow: 'visible' }}>
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
  );
}
