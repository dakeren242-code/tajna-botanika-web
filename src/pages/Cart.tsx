import { useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Truck } from 'lucide-react';
import { useMetaTracking } from '../hooks/useMetaTracking';

const FREE_SHIPPING_THRESHOLD = 1000;
const SHIPPING_COST = 79;

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { trackViewCart } = useMetaTracking();

  const isFreeShipping = totalPrice >= FREE_SHIPPING_THRESHOLD;

  useEffect(() => {
    if (items.length === 0) return;
    const priceMap: Record<string, number> = { '1g': 190, '3g': 490, '5g': 690, '10g': 1290 };
    const itemsWithCatalogId = items.filter(i => i.product.meta_catalog_id);
    if (itemsWithCatalogId.length === 0) {
      if (import.meta.env.DEV) console.warn('[Meta] ViewCart skipped: no items have meta_catalog_id');
      return;
    }
    trackViewCart({
      contentIds: itemsWithCatalogId.map(i => i.product.meta_catalog_id as string),
      value: totalPrice,
      numItems: items.reduce((s, i) => s + i.quantity, 0),
      currency: 'CZK',
      contents: itemsWithCatalogId.map(i => ({
        id: i.product.meta_catalog_id as string,
        quantity: i.quantity,
        item_price: priceMap[i.gramAmount] || 190,
      })),
    });
  }, []);
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST;
  const remainingForFreeShipping = FREE_SHIPPING_THRESHOLD - totalPrice;
  const freeShippingProgress = Math.min((totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-12">
            <ShoppingBag className="w-24 h-24 text-emerald-400/30 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Váš košík je prázdný</h2>
            <p className="text-gray-400 mb-8">Přidejte produkty do košíku a vraťte se sem</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Zpět na nákup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Zpět na nákup
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-6 h-6 text-emerald-400" />
                  <h1 className="text-2xl font-bold text-white">Nákupní košík</h1>
                  <span className="text-gray-400">({items.length})</span>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Opravdu chcete vyprázdnit košík?')) {
                      clearCart();
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Vyprázdnit košík
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const priceMap: Record<string, number> = {
                    '1g': 190,
                    '3g': 490,
                    '5g': 690,
                    '10g': 1290,
                  };
                  const unitPrice = priceMap[item.gramAmount] || 190;
                  const totalItemPrice = unitPrice * item.quantity;

                  return (
                    <div
                      key={`${item.product.id}-${item.gramAmount}`}
                      className="flex gap-4 p-4 bg-white/5 border border-emerald-500/10 rounded-xl"
                    >
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                            {item.gramAmount}
                          </span>
                        </div>
                        <p className="text-emerald-400 font-bold mb-3">
                          {unitPrice.toFixed(2)} Kč
                        </p>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.gramAmount, item.quantity - 1)}
                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                          >
                            <Minus className="w-4 h-4 text-emerald-400" />
                          </button>
                          <span className="text-white font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.gramAmount, item.quantity + 1)}
                            className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4 text-emerald-400" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(item.product.id, item.gramAmount)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <p className="text-white font-bold">
                          {totalItemPrice.toFixed(2)} Kč
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 sticky top-6">
              <h2 className="text-xl font-bold text-white mb-6">Souhrn objednávky</h2>

              {!isFreeShipping && (
                <div className="mb-6 p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <p className="text-sm text-amber-200 font-medium">
                      Zbývá {remainingForFreeShipping.toFixed(2)} Kč do dopravy zdarma!
                    </p>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {isFreeShipping && (
                <div className="mb-6 p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-400" />
                    <p className="text-sm text-emerald-300 font-medium">
                      Máte dopravu zdarma!
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div className="border-t border-emerald-500/20 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">Celkem</span>
                    <span className="text-emerald-400">{totalPrice.toFixed(2)} Kč</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
              >
                Pokračovat k pokladně
              </button>

              {user ? (
                <p className="text-sm text-emerald-400 text-center mt-4 flex items-center justify-center gap-1">
                  <span>Přihlášen jako {user.email}</span>
                </p>
              ) : (
                <p className="text-sm text-gray-400 text-center mt-4">
                  Můžete nakoupit i bez registrace
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
