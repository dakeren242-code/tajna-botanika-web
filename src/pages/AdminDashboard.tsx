import { useState, useEffect, Component, ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase, Order } from '../lib/supabase';
import { Shield, Package, DollarSign, Users, TrendingUp, ArrowLeft, ShoppingBag, Facebook, Radio, Trash2, BarChart3, AlertTriangle, Eye, Mail, Phone as PhoneIcon, MapPin, Truck, CreditCard, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import ProductManagement from '../components/admin/ProductManagement';
import FacebookCatalogManager from '../components/admin/FacebookCatalogManager';
import SupportAdmin from '../components/admin/SupportAdmin';
import LivePanel from '../components/admin/LivePanel';
import { getVisitorCount, onVisitorCountChange } from '../App';

// Error boundary to prevent black screen crashes
class AdminErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-2">Chyba při zobrazení</h3>
          <p className="text-gray-400 text-sm mb-4">{this.state.error}</p>
          <button
            onClick={() => { this.setState({ hasError: false, error: '' }); window.location.reload(); }}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Obnovit stránku
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Safe helper to format amounts
const formatAmount = (amount: any): string => {
  const num = Number(amount);
  return isNaN(num) ? '0' : num.toFixed(0);
};

const paymentMethodLabels: Record<string, string> = {
  bank_transfer: 'Bankovní převod',
  card: 'Platba kartou',
  cash_on_delivery: 'Dobírka',
};

const shippingMethodLabels: Record<string, string> = {
  zasilkovna: 'Zásilkovna',
  personal_pickup: 'Osobní převzetí',
  personal_invoice: 'Osobní po faktuře',
};

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
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'catalog' | 'support'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
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
    setLiveVisitors(getVisitorCount());
    return onVisitorCountChange(setLiveVisitors);
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

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`Opravdu smazat objednávku ${orderNumber}? Tato akce je nevratná.`)) return;
    await supabase.from('order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
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

        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 md:p-8">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <Shield className="w-6 h-6 md:w-8 md:h-8 text-emerald-400" />
            <h1 className="text-xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
          </div>

          <div className="flex gap-2 md:gap-4 mb-6 md:mb-8 border-b border-emerald-500/20 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Přehled
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
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
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'catalog'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <Facebook className="w-5 h-5" />
              Facebook Catalog
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'support'
                  ? 'text-emerald-400 border-emerald-400'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              <Radio className="w-5 h-5" />
              Podpora
            </button>
          </div>

          {activeTab === 'overview' && <LivePanel liveVisitors={liveVisitors} />}

          {activeTab === 'orders' && (
            <AdminErrorBoundary>
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
                <button onClick={loadOrders} className="ml-auto p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors" title="Obnovit objednávky">
                  <RefreshCw className="w-4 h-4" />
                </button>
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
                  <p className="text-3xl font-bold text-white">{formatAmount(stats.totalRevenue)} Kč</p>
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

                {orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-emerald-400/30 mx-auto mb-4" />
                    <p className="text-gray-400">Zatím žádné objednávky</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const sl = statusLabels[order.status] || { label: order.status, color: 'text-gray-400 bg-gray-500/10' };
                      const psl = paymentStatusLabels[order.payment_status] || { label: order.payment_status, color: 'text-gray-400 bg-gray-500/10' };
                      const o = order as any;
                      const isExpanded = expandedOrder === order.id;

                      return (
                        <div key={order.id} className="bg-white/[0.03] border border-emerald-500/10 rounded-xl overflow-hidden hover:border-emerald-500/20 transition-all">
                          {/* Order row */}
                          <div
                            className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.03] transition-colors"
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-emerald-400 font-bold text-lg">{order.order_number || '—'}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${sl.color}`}>{sl.label}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${psl.color}`}>{psl.label}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>{new Date(order.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-white font-bold">{formatAmount(order.total_amount)} Kč</span>
                                {o.first_name && <span>{o.first_name} {o.last_name}</span>}
                                {o.payment_method && <span className="text-xs px-2 py-0.5 bg-white/5 rounded">{paymentMethodLabels[o.payment_method] || o.payment_method}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); deleteOrder(order.id, order.order_number); }}
                                className="p-2 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                title="Smazat objednávku"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                            </div>
                          </div>

                          {/* Expanded detail */}
                          {isExpanded && (
                            <div className="px-4 pb-4 border-t border-emerald-500/10 pt-4 space-y-4 animate-fadeSlideIn">
                              {/* Customer info */}
                              <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-white/[0.04] rounded-lg p-3">
                                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Zákazník</p>
                                  <p className="text-white font-semibold">{o.first_name || o.customer_first_name || '—'} {o.last_name || o.customer_last_name || ''}</p>
                                  {(o.email || o.customer_email) && (
                                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1"><Mail className="w-3 h-3" /> {o.email || o.customer_email}</p>
                                  )}
                                  {(o.phone || o.customer_phone) && (
                                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-0.5"><PhoneIcon className="w-3 h-3" /> {o.phone || o.customer_phone}</p>
                                  )}
                                </div>

                                <div className="bg-white/[0.04] rounded-lg p-3">
                                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Truck className="w-3 h-3" /> Doprava</p>
                                  <p className="text-white font-semibold">{shippingMethodLabels[o.shipping_method] || o.shipping_method || '—'}</p>
                                  {o.shipping_address && (
                                    <p className="text-gray-400 text-sm flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {o.shipping_address.street}, {o.shipping_address.city} {o.shipping_address.zip}</p>
                                  )}
                                </div>

                                <div className="bg-white/[0.04] rounded-lg p-3">
                                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Platba</p>
                                  <p className="text-white font-semibold">{paymentMethodLabels[o.payment_method] || o.payment_method || '—'}</p>
                                  <div className="text-sm mt-1 space-y-0.5">
                                    <p className="text-gray-400">Zboží: {formatAmount(o.subtotal || order.total_amount)} Kč</p>
                                    {o.shipping_cost > 0 && <p className="text-gray-400">Doprava: {formatAmount(o.shipping_cost)} Kč</p>}
                                    {o.cod_fee > 0 && <p className="text-gray-400">Dobírka: {formatAmount(o.cod_fee)} Kč</p>}
                                    {o.discount_amount > 0 && <p className="text-emerald-400">Sleva: -{formatAmount(o.discount_amount)} Kč</p>}
                                  </div>
                                </div>
                              </div>

                              {o.notes && (
                                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3">
                                  <p className="text-xs text-yellow-400 font-bold mb-1">Poznámka zákazníka:</p>
                                  <p className="text-gray-300 text-sm">{o.notes}</p>
                                </div>
                              )}

                              {/* Status controls */}
                              <div className="flex flex-wrap items-center gap-4 pt-2">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Stav objednávky</label>
                                  <select
                                    value={order.status}
                                    onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium bg-black/50 border border-emerald-500/20 ${sl.color}`}
                                  >
                                    <option value="pending">Čeká na zpracování</option>
                                    <option value="processing">Zpracovává se</option>
                                    <option value="shipped">Odesláno</option>
                                    <option value="delivered">Doručeno</option>
                                    <option value="cancelled">Zrušeno</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">Stav platby</label>
                                  <select
                                    value={order.payment_status}
                                    onChange={(e) => updatePaymentStatus(order.id, e.target.value as Order['payment_status'])}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium bg-black/50 border border-emerald-500/20 ${psl.color}`}
                                  >
                                    <option value="pending">Čeká na platbu</option>
                                    <option value="paid">Zaplaceno</option>
                                    <option value="failed">Platba selhala</option>
                                    <option value="refunded">Vráceno</option>
                                  </select>
                                </div>
                                <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
                                  {o.paid_at && <span>Zaplaceno: {new Date(o.paid_at).toLocaleDateString('cs-CZ')}</span>}
                                  {o.shipped_at && <span>Odesláno: {new Date(o.shipped_at).toLocaleDateString('cs-CZ')}</span>}
                                  {o.delivered_at && <span>Doručeno: {new Date(o.delivered_at).toLocaleDateString('cs-CZ')}</span>}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </AdminErrorBoundary>
          )}

          {activeTab === 'products' && <AdminErrorBoundary><ProductManagement /></AdminErrorBoundary>}

          {activeTab === 'catalog' && <AdminErrorBoundary><FacebookCatalogManager /></AdminErrorBoundary>}

          {activeTab === 'support' && <AdminErrorBoundary><SupportAdmin /></AdminErrorBoundary>}
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeSlideIn { animation: fadeSlideIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
