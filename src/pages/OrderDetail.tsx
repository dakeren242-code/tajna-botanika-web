import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Order, OrderItem, Address } from '../lib/supabase';
import { ArrowLeft, Package, MapPin, CreditCard, FileText } from 'lucide-react';

const statusLabels = {
  pending: { label: 'Čeká na zpracování', color: 'text-yellow-400 bg-yellow-500/10' },
  processing: { label: 'Zpracovává se', color: 'text-blue-400 bg-blue-500/10' },
  shipped: { label: 'Odesláno', color: 'text-purple-400 bg-purple-500/10' },
  delivered: { label: 'Doručeno', color: 'text-emerald-400 bg-emerald-500/10' },
  cancelled: { label: 'Zrušeno', color: 'text-red-400 bg-red-500/10' },
};

const paymentStatusLabels = {
  pending: { label: 'Čeká na platbu', color: 'text-yellow-400 bg-yellow-500/10' },
  paid: { label: 'Zaplaceno', color: 'text-emerald-400 bg-emerald-500/10' },
  failed: { label: 'Platba selhala', color: 'text-red-400 bg-red-500/10' },
  refunded: { label: 'Vráceno', color: 'text-gray-400 bg-gray-500/10' },
};

export default function OrderDetail() {
  const { orderId } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!orderId) {
      navigate('/orders');
      return;
    }

    loadOrderDetails();
  }, [user, orderId, navigate]);

  const loadOrderDetails = async () => {
    if (!user || !orderId) return;

    // Admin can view any order, regular users only their own
    let query = supabase.from('orders').select('*').eq('id', orderId);
    if (!isAdmin) {
      query = query.eq('user_id', user.id);
    }
    const { data: orderData, error: orderError } = await query.maybeSingle();

    if (orderError || !orderData) {
      navigate('/orders');
      return;
    }

    setOrder(orderData);

    const { data: itemsData } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (itemsData) {
      setItems(itemsData);
    }

    if (orderData.delivery_address_id) {
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('id', orderData.delivery_address_id)
        .maybeSingle();

      if (addressData) {
        setAddress(addressData);
      }
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

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">Objednávka nenalezena</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Zpět na objednávky
          </Link>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Objednávka {order.order_number}
                </h1>
                <p className="text-gray-400">
                  Vytvořeno {new Date(order.created_at).toLocaleDateString('cs-CZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${(statusLabels[order.status] || statusLabels.pending).color}`}>
                  {(statusLabels[order.status] || statusLabels.pending).label}
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${(paymentStatusLabels[order.payment_status] || paymentStatusLabels.pending).color}`}>
                  {(paymentStatusLabels[order.payment_status] || paymentStatusLabels.pending).label}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-emerald-500/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Doručovací adresa</h2>
                </div>
                {address ? (
                  <div className="text-gray-300 space-y-1">
                    <p className="font-semibold text-white">{address.full_name}</p>
                    <p>{address.street}</p>
                    <p>{address.city}, {address.postal_code}</p>
                    <p>{address.country}</p>
                    <p className="pt-2 text-sm text-gray-400">Tel: {address.phone}</p>
                  </div>
                ) : (order as any).shipping_address ? (
                  <div className="text-gray-300 space-y-1">
                    <p className="font-semibold text-white">{(order as any).first_name} {(order as any).last_name}</p>
                    <p>{(order as any).shipping_address.street}</p>
                    <p>{(order as any).shipping_address.city}, {(order as any).shipping_address.zip}</p>
                    {(order as any).email && <p className="pt-2 text-sm text-gray-400">Email: {(order as any).email}</p>}
                    {(order as any).phone && <p className="text-sm text-gray-400">Tel: {(order as any).phone}</p>}
                  </div>
                ) : (order as any).first_name ? (
                  <div className="text-gray-300 space-y-1">
                    <p className="font-semibold text-white">{(order as any).first_name} {(order as any).last_name}</p>
                    {(order as any).email && <p className="text-sm text-gray-400">Email: {(order as any).email}</p>}
                    {(order as any).phone && <p className="text-sm text-gray-400">Tel: {(order as any).phone}</p>}
                  </div>
                ) : (
                  <p className="text-gray-400">Adresa není k dispozici</p>
                )}
              </div>

              <div className="bg-white/5 border border-emerald-500/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Platební informace</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stav platby</span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${(paymentStatusLabels[order.payment_status] || paymentStatusLabels.pending).color}`}>
                      {(paymentStatusLabels[order.payment_status] || paymentStatusLabels.pending).label}
                    </span>
                  </div>
                  {order.paid_at && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zaplaceno</span>
                      <span className="text-white">
                        {new Date(order.paid_at).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-emerald-500/20">
                    <span className="text-white font-semibold">Celková částka</span>
                    <span className="text-emerald-400 font-bold text-lg">
                      {(order.total_amount ?? 0).toFixed(0)} Kč
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 border border-emerald-500/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-5 h-5 text-emerald-400" />
              <h2 className="text-xl font-semibold text-white">Položky objednávky</h2>
            </div>

            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-4 bg-white/5 border border-emerald-500/10 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">{item.product_name}</h3>
                    <p className="text-sm text-gray-400">
                      Množství: {item.quantity} × {(item.unit_price ?? 0).toFixed(0)} Kč
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">
                      {(item.total_price ?? 0).toFixed(0)} Kč
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <div className="flex justify-between text-lg">
                <span className="text-white font-semibold">Celkem</span>
                <span className="text-emerald-400 font-bold">
                  {(order.total_amount ?? 0).toFixed(0)} Kč
                </span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mt-6 bg-white/5 border border-emerald-500/10 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">Poznámka</h2>
              </div>
              <p className="text-gray-300">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
