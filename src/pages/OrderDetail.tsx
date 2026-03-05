import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Order, OrderItem, Address } from '../lib/supabase';
import { ArrowLeft, Package, MapPin, CreditCard, FileText, User, Truck } from 'lucide-react';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS, SHIPPING_METHOD_LABELS } from '../lib/constants';
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

export default function OrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
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

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

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
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${statusLabels[order.status].color}`}>
                  {statusLabels[order.status].label}
                </span>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${paymentStatusLabels[order.payment_status].color}`}>
                  {paymentStatusLabels[order.payment_status].label}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <div className="bg-white/5 border border-emerald-500/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Zákazník</h2>
                </div>
                <div className="text-gray-300 space-y-2">
                  {((order as any).customer_first_name || order.first_name) && ((order as any).customer_last_name || order.last_name) && (
                    <p className="font-semibold text-white">
                      {(order as any).customer_first_name || order.first_name} {(order as any).customer_last_name || order.last_name}
                    </p>
                  )}
                  {((order as any).customer_email || order.email) && (
                    <p className="text-sm">
                      <span className="text-gray-400">Email:</span> {(order as any).customer_email || order.email}
                    </p>
                  )}
                  {((order as any).customer_phone || order.phone) && (
                    <p className="text-sm">
                      <span className="text-gray-400">Telefon:</span> {(order as any).customer_phone || order.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-white/5 border border-emerald-500/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Truck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Doprava</h2>
                </div>
                <div className="space-y-2">
                  {order.shipping_method && (
                    <div>
                      <p className="text-gray-400 text-sm">Způsob dopravy</p>
                      <p className="text-white font-medium">
                        {SHIPPING_METHOD_LABELS[order.shipping_method as keyof typeof SHIPPING_METHOD_LABELS] || order.shipping_method}
                      </p>
                    </div>
                  )}

                  {order.shipping_method === 'zasilkovna' && order.packeta_point_name && (
                    <div className="mt-3">
                      <p className="text-gray-400 text-sm">Výdejní místo</p>
                      <p className="text-white">{order.packeta_point_name}</p>
                    </div>
                  )}

                  {order.shipping_method === 'zasilkovna' && (order.shipping_address || address) && (
                    <div className="mt-3">
                      <p className="text-gray-400 text-sm">Doručovací adresa</p>
                      <div className="text-sm text-gray-300 space-y-1">
                        {order.shipping_address ? (
                          <>
                            {order.shipping_address.street && <p>{order.shipping_address.street}</p>}
                            {order.shipping_address.city && order.shipping_address.zip && (
                              <p>{order.shipping_address.city}, {order.shipping_address.zip}</p>
                            )}
                          </>
                        ) : address && (
                          <>
                            <p>{address.street}</p>
                            <p>{address.city}, {address.postal_code}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {(order.shipping_method === 'personal_pickup' || order.shipping_method === 'personal_invoice') && (
                    <div className="mt-2">
                      <p className="text-emerald-400 text-sm">Odběr na prodejně v Praze</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-white/5 border border-emerald-500/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-semibold text-white">Platba</h2>
                </div>
                <div className="space-y-3">
                  {order.payment_method && (
                    <div>
                      <p className="text-gray-400 text-sm">Způsob platby</p>
                      <p className="text-white font-medium">
                        {PAYMENT_METHOD_LABELS[order.payment_method as keyof typeof PAYMENT_METHOD_LABELS] || order.payment_method}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <p className="text-gray-400 text-sm">Stav platby</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-lg text-sm font-medium ${paymentStatusLabels[order.payment_status].color}`}>
                      {paymentStatusLabels[order.payment_status].label}
                    </span>
                  </div>

                  {order.paid_at && (
                    <div className="pt-2">
                      <p className="text-gray-400 text-sm">Zaplaceno</p>
                      <p className="text-white">
                        {new Date(order.paid_at).toLocaleDateString('cs-CZ')}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-emerald-500/20">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Celková částka</span>
                      <span className="text-emerald-400 font-bold text-lg">
                        {order.total_amount.toFixed(2)} {order.currency}
                      </span>
                    </div>
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
                      Množství: {item.quantity} × {item.unit_price.toFixed(2)} {order.currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold">
                      {item.total_price.toFixed(2)} {order.currency}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-emerald-500/20">
              <div className="flex justify-between text-lg">
                <span className="text-white font-semibold">Celkem</span>
                <span className="text-emerald-400 font-bold">
                  {order.total_amount.toFixed(2)} {order.currency}
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
