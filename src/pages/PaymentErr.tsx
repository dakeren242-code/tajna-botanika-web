import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, Home, AlertTriangle } from 'lucide-react';

export default function PaymentErr() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-red-950 to-black py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/50 backdrop-blur-xl border border-red-500/20 rounded-2xl p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 blur-3xl opacity-30 animate-pulse" />
              <XCircle className="w-24 h-24 text-red-400 relative" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Platba se nezdařila
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Bohužel došlo k problému při zpracování vaší platby.
          </p>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3 text-left">
              <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">Co se mohlo stát?</h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Platba byla zrušena</li>
                  <li>• Nedostatečné prostředky na účtu</li>
                  <li>• Chyba při zpracování platby</li>
                  <li>• Technický problém na straně platební brány</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-8">
            <p className="text-yellow-400 text-sm">
              Vaše objednávka nebyla dokončena a produkty zůstávají v košíku.
              Můžete to zkusit znovu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/checkout"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
              Zkusit znovu
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-red-500/20"
            >
              <Home className="w-5 h-5" />
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
