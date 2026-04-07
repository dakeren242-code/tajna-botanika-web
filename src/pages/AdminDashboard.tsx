import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, Order } from '../lib/supabase';
import { Shield, Package, DollarSign, Users, TrendingUp, ArrowLeft, ShoppingBag, Facebook, Radio } from 'lucide-react';
import ProductManagement from '../components/admin/ProductManagement';
import FacebookCatalogManager from '../components/admin/FacebookCatalogManager';

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

export default function AdminDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'catalog'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
  });
  const [liveVisitors, setLiveVisitors] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (!isAdmin) {
      navigate('/');
      return;
    }

    loadOrders();
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    // Poll the existing visitors channel presence state
    const interval = setInterval(() => {
      const channels = supabase.getChannels();
      for (const ch of channels) {
        if ((ch as any).topic === 'realtime:visitors') {
          const state = ch.presenceState();
          setLiveVisitors(Object.keys(state).length);
          return;
        }
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setOrders(data);

      const totalRevenue = data
        .filter((o) => o.payment_status === 'paid')
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      setStats({
        totalOrders: data.length,
        totalRevenue,
        pendingOrders: data.filter((o) => o.status === 'pending').length,
        deliveredOrders: data.filter((o) => o.status === 'delivered').length,
      });
    }

    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updates: any = { status };

    if (status === 'shipped' && !orders.find((o) => o.id === orderId)?.shipped_at) {
      updates.shipped_at = new Date().toISOString();
    }

    if (status === 'delivered' && !orders.find((o) => o.id === orderId)?.delivered_at) {
      updates.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (!error) {
      loadOrders();
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: Order['payment_status']) => {
    const updates: any = { payment_status: paymentStatus };

    if (paymentStatus === 'paid' && !orders.find((o) => o.id === orderId)?.paid_at) {
      updates.paid_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (!error) {
      loadOrders();
    }
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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Zpět na hlavní stránku
          </Link>
        </div>

        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>

          <div className="flex gap-4 mb-8 border-b border-emerald-500/20">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'orders'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <Package className="w-5 h-5" />
              Objednávky
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'products'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Produkty
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === 'catalog'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <Facebook className="w-5 h-5" />
              Facebook Catalog
            </button>
          </div>

          {activeTab === 'orders' && (
            <>
              <div className="mb-6 flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                  <Radio className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Live</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{liveVisitors}</span>
                  <span className="text-gray-400 text-sm">lidí právě na webu</span>
                </div>
                <div className="ml-auto text-gray-500 text-xs">Aktualizuje se v reálném čase</div>
              </div>

              <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Package className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Celkem objednávek</p>
              <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <DollarSign className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Celkové tržby</p>
              <p className="text-3xl font-bold text-white">{stats.totalRevenue.toFixed(0)} Kč</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Čekající</p>
              <p className="text-3xl font-bold text-white">{stats.pendingOrders}</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-gray-400 text-sm mb-1">Doručeno</p>
              <p className="text-3xl font-bold text-white">{stats.deliveredOrders}</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Všechny objednávky</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Číslo objednávky</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Datum</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Částka</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Stav objednávky</th>
                    <th className="text-left py-4 px-4 text-gray-400 font-semibold">Stav platby</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-emerald-500/10 hover:bg-white/5">
                      <td className="py-4 px-4">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-gray-300">
                        {new Date(order.created_at).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="py-4 px-4 text-white font-semibold">
                        {order.total_amount.toFixed(2)} {order.currency}
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                          className={`px-3 py-1 rounded-lg text-sm font-medium bg-black/50 border border-emerald-500/20 ${statusLabels[order.status].color}`}
                        >
                          <option value="pending">Čeká na zpracování</option>
                          <option value="processing">Zpracovává se</option>
                          <option value="shipped">Odesláno</option>
                          <option value="delivered">Doručeno</option>
                          <option value="cancelled">Zrušeno</option>
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={order.payment_status}
                          onChange={(e) => updatePaymentStatus(order.id, e.target.value as Order['payment_status'])}
                          className={`px-3 py-1 rounded-lg text-sm font-medium bg-black/50 border border-emerald-500/20 ${paymentStatusLabels[order.payment_status].color}`}
                        >
                          <option value="pending">Čeká na platbu</option>
                          <option value="paid">Zaplaceno</option>
                          <option value="failed">Platba selhala</option>
                          <option value="refunded">Vráceno</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </>
          )}

          {activeTab === 'products' && <ProductManagement />}

          {activeTab === 'catalog' && <FacebookCatalogManager />}
        </div>
      </div>
    </div>
  );
}
