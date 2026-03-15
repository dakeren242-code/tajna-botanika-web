import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function PaymentOk() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-3xl opacity-30 animate-pulse" />
              <CheckCircle className="w-24 h-24 text-emerald-400 relative" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Platba proběhla úspěšně!
          </h1>

          <p className="text-xl text-gray-300 mb-8">
            Děkujeme za vaši objednávku. Platba byla úspěšně zpracována.
          </p>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3 text-left">
              <Package className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">Co bude dál?</h3>
                <ul className="text-gray-400 text-sm space-y-2">
                  <li>• Obdržíte e-mail s potvrzením objednávky</li>
                  <li>• Vaše objednávka bude zpracována do 24 hodin</li>
                  <li>• O odeslání zásilky vás budeme informovat e-mailem</li>
                  <li>• Zásilka by měla dorazit do 2-3 pracovních dnů</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/order-history"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              <Package className="w-5 h-5" />
              Moje objednávky
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-emerald-500/20"
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
