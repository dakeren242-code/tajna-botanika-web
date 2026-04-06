import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { usePerformance } from '../contexts/PerformanceContext';
import { ShoppingCart, User, LogIn, Shield, Gauge, ChevronDown } from 'lucide-react';

export default function Header() {
  const { user, isAdmin } = useAuth();
  const { totalItems } = useCart();
  const { mode, manualLevel, currentLevel, fps, setMode, setManualLevel } = usePerformance();
  const [showPerformanceMenu, setShowPerformanceMenu] = useState(false);

  const performanceLevelLabel = {
    high: 'Vysoký',
    medium: 'Střední',
    low: 'Nízký',
    potato: 'Ultra nízký',
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-emerald-500/20"
      style={{ overflow: 'visible' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3" style={{ overflow: 'visible' }}>
        <div className="flex items-center justify-between relative" style={{ overflow: 'visible' }}>
          <div className="flex-1" />

          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-3">
            <img
              src="/logo_botanika.png"
              alt="Tajná Botanika"
              className="h-12 w-12 object-cover rounded-full"
            />
            <span className="hidden sm:inline text-xl font-serif font-bold bg-gradient-to-br from-white via-yellow-100 to-yellow-600 bg-clip-text text-transparent tracking-wide">
              Tajná Botanika
            </span>
          </Link>

          <nav className="flex items-center gap-4 flex-1 justify-end" style={{ overflow: 'visible' }}>
            <div className="relative">
              <button
                onClick={() => setShowPerformanceMenu(!showPerformanceMenu)}
                className="flex items-center gap-2 px-3 py-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                title={mode === 'auto' ? `FPS: ${fps}` : 'Výkon'}
              >
                <Gauge className="w-5 h-5" />
                {mode === 'auto' && (
                  <span className="hidden sm:inline text-xs">{fps} FPS</span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>

              {showPerformanceMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPerformanceMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-lg shadow-xl z-50">
                    <div className="p-3 border-b border-cyan-500/20">
                      <div className="text-cyan-400 font-semibold text-sm mb-2">
                        Režim výkonu
                      </div>
                      <div className="space-y-2">
                        <button
                          onClick={() => setMode('auto')}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                            mode === 'auto'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'text-gray-300 hover:bg-cyan-500/10'
                          }`}
                        >
                          <div className="font-medium">Automaticky</div>
                          {mode === 'auto' && (
                            <div className="text-xs mt-1">
                              {fps} FPS - {performanceLevelLabel[currentLevel]}
                            </div>
                          )}
                        </button>
                        <button
                          onClick={() => setMode('manual')}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                            mode === 'manual'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'text-gray-300 hover:bg-cyan-500/10'
                          }`}
                        >
                          <div className="font-medium">Ručně</div>
                        </button>
                      </div>
                    </div>

                    {mode === 'manual' && (
                      <div className="p-3">
                        <div className="text-cyan-400 font-semibold text-sm mb-2">
                          Úroveň výkonu
                        </div>
                        <div className="space-y-1">
                          {(['high', 'medium', 'low', 'potato'] as const).map((level) => (
                            <button
                              key={level}
                              onClick={() => setManualLevel(level)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                manualLevel === level
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'text-gray-300 hover:bg-cyan-500/10'
                              }`}
                            >
                              {performanceLevelLabel[level]}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

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
