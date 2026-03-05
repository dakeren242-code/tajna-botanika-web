import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Package, User, CreditCard, Calendar, DollarSign } from 'lucide-react';

interface OrderDetail {
  id: string;
  order_number: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_method: string;
  created_at: string;
  updated_at: string;
  user_id: string | null;
  mollie_payment_id: string | null;
  mollie_payment_method: string | null;
  mollie_payment_status: string | null;
  mollie_mandate_id: string | null;
  metadata: any;
  shipping_address_street: string | null;
  shipping_address_city: string | null;
  shipping_address_zip: string | null;
  shipping_address_country: string | null;
  billing_address_street: string | null;
  billing_address_city: string | null;
  billing_address_zip: string | null;
  billing_address_country: string | null;
  notes: string | null;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_name: string;
  variant_name: string;
}

export default function AdminOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user, isSuperAdmin } = useAuth();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isSuperAdmin) {
      navigate('/');
      return;
    }

    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId, user, isSuperAdmin, navigate]);

  const loadOrderDetail = async () => {
    setLoading(true);

    const [orderData, itemsData] = await Promise.all([
      supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle(),
      supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId),
    ]);

    if (orderData.data) {
      setOrder(orderData.data);
    }

    if (itemsData.data) {
      setOrderItems(itemsData.data);
    }

    setLoading(false);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('cs-CZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} Kč`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center">
        <div className="text-emerald-400 text-xl">Načítání...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center">
        <div className="text-red-400 text-xl">Objednávka nenalezena</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/admin-dashboard')}
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Zpět na admin panel
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Detail objednávky</h1>
          <p className="text-gray-400 font-mono">{order.order_number}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Základní informace</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">ID objednávky:</span>
                <p className="text-white font-mono text-sm">{order.id}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Číslo objednávky:</span>
                <p className="text-white font-semibold">{order.order_number}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Datum vytvoření:</span>
                <p className="text-white">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Poslední aktualizace:</span>
                <p className="text-white">{formatDate(order.updated_at)}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Celková částka:</span>
                <p className="text-white font-bold text-2xl">{formatPrice(order.total_amount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Zákazník</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Jméno:</span>
                <p className="text-white">{order.customer_first_name} {order.customer_last_name}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Email:</span>
                <p className="text-white">{order.customer_email}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Telefon:</span>
                <p className="text-white">{order.customer_phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">User ID:</span>
                <p className="text-white font-mono text-sm">{order.user_id || 'Host'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Platební údaje</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Stav platby:</span>
                <p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    order.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                    order.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {order.payment_status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Platební metoda:</span>
                <p className="text-white">{order.payment_method}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Mollie Payment ID:</span>
                <p className="text-white font-mono text-sm break-all">{order.mollie_payment_id || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Mollie Payment Method:</span>
                <p className="text-white">{order.mollie_payment_method || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Mollie Payment Status:</span>
                <p className="text-white">{order.mollie_payment_status || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Mollie Mandate ID:</span>
                <p className="text-white font-mono text-sm break-all">{order.mollie_mandate_id || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-bold text-white">Stav objednávky</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-400 text-sm">Stav:</span>
                <p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    order.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                    order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    order.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                    order.status === 'cancelled' ? 'bg-gray-500/20 text-gray-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {order.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Způsob doručení:</span>
                <p className="text-white">{order.shipping_method || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Položky objednávky</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-emerald-500/20">
                  <th className="text-left text-gray-400 py-3 px-4">Produkt</th>
                  <th className="text-left text-gray-400 py-3 px-4">Varianta</th>
                  <th className="text-right text-gray-400 py-3 px-4">Množství</th>
                  <th className="text-right text-gray-400 py-3 px-4">Cena/ks</th>
                  <th className="text-right text-gray-400 py-3 px-4">Celkem</th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map(item => (
                  <tr key={item.id} className="border-b border-emerald-500/10">
                    <td className="py-3 px-4 text-white">{item.product_name}</td>
                    <td className="py-3 px-4 text-gray-400">{item.variant_name}</td>
                    <td className="py-3 px-4 text-white text-right">{item.quantity}</td>
                    <td className="py-3 px-4 text-white text-right">{formatPrice(item.unit_price)}</td>
                    <td className="py-3 px-4 text-white font-semibold text-right">{formatPrice(item.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {(order.shipping_address_street || order.billing_address_street) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {order.shipping_address_street && (
              <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Doručovací adresa</h3>
                <div className="text-gray-300 space-y-1">
                  <p>{order.shipping_address_street}</p>
                  <p>{order.shipping_address_zip} {order.shipping_address_city}</p>
                  <p>{order.shipping_address_country}</p>
                </div>
              </div>
            )}

            {order.billing_address_street && (
              <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Fakturační adresa</h3>
                <div className="text-gray-300 space-y-1">
                  <p>{order.billing_address_street}</p>
                  <p>{order.billing_address_zip} {order.billing_address_city}</p>
                  <p>{order.billing_address_country}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {order.metadata && (
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-bold text-white mb-4">Metadata</h3>
            <pre className="text-gray-300 text-sm bg-black/30 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(order.metadata, null, 2)}
            </pre>
          </div>
        )}

        {order.notes && (
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Poznámky</h3>
            <p className="text-gray-300">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
