import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, Order } from '../lib/supabase';
import { Package, ChevronRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../lib/constants';
import { getOrderStatusClasses, getPaymentStatusClasses } from '../lib/orderHelpers';

const statusLabels = {
  pending: { label: ORDER_STATUS_LABELS.pending, color: getOrderStatusClasses('pending') },
  confirmed: { label: ORDER_STATUS_LABELS.confirmed, color: getOrderStatusClasses('confirmed') },
  processing: { label: ORDER_STATUS_LABELS.processing, color: getOrderStatusClasses('processing') },
  shipped: { label: ORDER_STATUS_LABELS.shipped, color: getOrderStatusClasses('shipped') },
  delivered: { label: ORDER_STATUS_LABELS.delivered, color: getOrderStatusClasses('delivered') },
  cancelled: { label: ORDER_STATUS_LABELS.cancelled, color: getOrderStatusClasses('cancelled') },
  failed: { label: ORDER_STATUS_LABELS.failed, color: getOrderStatusClasses('failed') },
};

const paymentStatusLabels = {
  pending: { label: PAYMENT_STATUS_LABELS.pending, color: getPaymentStatusClasses('pending') },
  awaiting_confirmation: { label: PAYMENT_STATUS_LABELS.awaiting_confirmation, color: getPaymentStatusClasses('awaiting_confirmation') },
  paid: { label: PAYMENT_STATUS_LABELS.paid, color: getPaymentStatusClasses('paid') },
  failed: { label: PAYMENT_STATUS_LABELS.failed, color: getPaymentStatusClasses('failed') },
  refunded: { label: PAYMENT_STATUS_LABELS.refunded, color: getPaymentStatusClasses('refunded') },
  partially_refunded: { label: PAYMENT_STATUS_LABELS.partially_refunded, color: getPaymentStatusClasses('partially_refunded') },
};

export default function OrderHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadOrders();
  }, [user, navigate]);

  const loadOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Zpět na profil
          </Link>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Package className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Moje objednávky</h1>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-20 h-20 text-emerald-400/30 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">Zatím žádné objednávky</h2>
              <p className="text-gray-400 mb-6">Vytvořte svou první objednávku</p>
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
              >
                Začít nakupovat
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="block p-6 bg-white/5 hover:bg-white/10 border border-emerald-500/20 rounded-xl transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="text-xl font-bold text-white">
                          {order.order_number}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[order.status].color}`}>
                          {statusLabels[order.status].label}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusLabels[order.payment_status].color}`}>
                          {paymentStatusLabels[order.payment_status].label}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Datum objednávky</p>
                          <p className="text-white font-medium">
                            {new Date(order.created_at).toLocaleDateString('cs-CZ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Celková cena</p>
                          <p className="text-emerald-400 font-bold">
                            {order.total_amount.toFixed(2)} {order.currency}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
