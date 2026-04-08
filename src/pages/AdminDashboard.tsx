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
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
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

      // Pre-load all order items for gram totals in preview
      const orderIds = data.map(o => o.id);
      if (orderIds.length > 0) {
        const { data: allItems } = await supabase
          .from('order_items')
          .select('*')
          .in('order_id', orderIds);
        if (allItems) {
          const grouped: Record<string, any[]> = {};
          for (const item of allItems) {
            if (!grouped[item.order_id]) grouped[item.order_id] = [];
            grouped[item.order_id].push(item);
          }
          setOrderItems(grouped);
        }
      }
    }

    setLoading(false);
  };

  const loadOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return; // already loaded
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (data) {
      setOrderItems(prev => ({ ...prev, [orderId]: data }));
    }
  };

  const printDeliveryNote = async (order: any) => {
    const items = orderItems[order.id] || [];
    // Fetch product details for cannabinoid profiles
    const productIds = items.map((i: any) => i.product_id).filter(Boolean);
    let products: Record<string, any> = {};
    if (productIds.length > 0) {
      const { data } = await supabase.from('products').select('id, name, thc_x_percent, thc_percent, cbd_percent, cbg_percent').in('id', productIds);
      if (data) {
        for (const p of data) products[p.id] = p;
      }
    }

    const itemsHtml = items.map((item: any) => {
      const p = products[item.product_id] || {};
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;">${item.product_name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.gram_amount || '—'}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity || 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:11px;">
            <span style="color:#059669;font-weight:700;">THC-X: ${p.thc_x_percent || '—'}%</span> &nbsp;
            <span style="color:#6b7280;">THC: ${p.thc_percent || '—'}%</span> &nbsp;
            <span style="color:#2563eb;">CBD: ${p.cbd_percent || '—'}%</span> &nbsp;
            <span style="color:#7c3aed;">CBG: ${p.cbg_percent || '—'}%</span>
          </td>
        </tr>`;
    }).join('');

    const totalGrams = items.reduce((sum: number, item: any) => {
      const g = parseInt((item.gram_amount || '0').replace('g', '')) || 0;
      return sum + g * (item.quantity || 1);
    }, 0);

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Dodaci list #${order.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 32px; color: #1f2937; max-width: 800px; margin: 0 auto; }
        @media print { body { padding: 16px; } .no-print { display: none !important; } }
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:3px solid #059669;">
        <div>
          <h1 style="font-size:28px;color:#059669;margin-bottom:4px;">Tajna Botanika</h1>
          <p style="color:#6b7280;font-size:13px;">tajnabotanika.online</p>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:18px;color:#374151;">DODACI LIST</h2>
          <p style="color:#6b7280;font-size:13px;">#${order.order_number}</p>
          <p style="color:#6b7280;font-size:13px;">${new Date(order.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      <div style="background:#f9fafb;padding:16px;border-radius:8px;margin-bottom:20px;">
        <p style="font-size:12px;color:#6b7280;margin-bottom:4px;">Zakaznik</p>
        <p style="font-weight:600;font-size:16px;">${order.first_name || order.customer_first_name || ''} ${order.last_name || order.customer_last_name || ''}</p>
        ${order.email || order.customer_email ? `<p style="color:#6b7280;font-size:13px;">${order.email || order.customer_email}</p>` : ''}
        ${order.phone || order.customer_phone ? `<p style="color:#6b7280;font-size:13px;">${order.phone || order.customer_phone}</p>` : ''}
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead>
          <tr style="background:#f3f4f6;">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Produkt</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Gramaz</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Ks</th>
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Cannabinoidni profil</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr style="background:#ecfdf5;">
            <td style="padding:10px 12px;font-weight:700;">Celkem</td>
            <td style="padding:10px 12px;text-align:center;font-weight:700;color:#059669;">${totalGrams}g</td>
            <td style="padding:10px 12px;text-align:center;font-weight:700;">${items.reduce((s: number, i: any) => s + (i.quantity || 1), 0)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
        <p style="font-weight:700;font-size:13px;color:#92400e;margin-bottom:4px;">DULEZITE UPOZORNENI</p>
        <p style="font-size:12px;color:#78350f;">Sberatelsky predmet - NENI urceno ke konzumaci, koureni ani jinemu pouziti. Skladujte na suchem a tmavem miste mimo dosah deti.</p>
      </div>

      <div style="display:flex;justify-content:space-between;font-size:12px;color:#9ca3af;padding-top:16px;border-top:1px solid #e5e7eb;">
        <span>tajnabotanika.online</span>
        <span>Dekujeme za Vasi objednavku!</span>
      </div>

      <div class="no-print" style="margin-top:24px;text-align:center;">
        <button onclick="window.print()" style="padding:12px 32px;background:#059669;color:white;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;">Tisknout</button>
        <button onclick="window.close();history.back();" style="padding:12px 32px;background:#374151;color:white;border:none;border-radius:8px;font-size:16px;font-weight:700;cursor:pointer;margin-left:12px;">Zpět</button>
      </div>
    </body></html>`;

    // Try window.open first, fallback to data URI for mobile
    const printWindow = window.open('', '_blank');
    if (printWindow && !printWindow.closed) {
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      // Mobile fallback - open as blob URL in same tab
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank') || (window.location.href = url);
    }
  };

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const selectAllZasilkovna = () => {
    const zasilkovnaIds = orders
      .filter(o => (o as any).shipping_method === 'zasilkovna' && ['pending', 'processing'].includes(o.status))
      .map(o => o.id);
    setSelectedOrders(prev => {
      if (zasilkovnaIds.every(id => prev.has(id))) return new Set(); // deselect all
      return new Set(zasilkovnaIds);
    });
  };

  const exportZasilkovnaCSV = () => {
    // Use selected orders, or all Zásilkovna pending/processing if none selected
    let zasilkovnaOrders: Order[];
    if (selectedOrders.size > 0) {
      zasilkovnaOrders = orders.filter(o => selectedOrders.has(o.id) && (o as any).shipping_method === 'zasilkovna');
    } else {
      zasilkovnaOrders = orders.filter(o => {
        const om = o as any;
        return om.shipping_method === 'zasilkovna' && ['pending', 'processing'].includes(o.status);
      });
    }

    if (zasilkovnaOrders.length === 0) {
      alert('Vyber objednávky k odeslání (checkbox vlevo) nebo žádné nejsou pro Zásilkovnu');
      return;
    }

    // Zásilkovna CSV v8 format
    const header1 = '"version 8"';
    const header2 = ',"Order number","Name","Surname","Company","Email","Phone","COD","Currency","Value","Weight","Pick-up point or carrier","Sender indication","Adult content"';

    const rows = zasilkovnaOrders.map(order => {
      const o = order as any;
      const isCOD = o.payment_method === 'cash_on_delivery';
      const codAmount = isCOD ? Number(order.total_amount || 0) : 0;
      const totalGrams = orderItems[order.id]
        ? orderItems[order.id].reduce((sum: number, item: any) => {
            const g = parseInt((item.gram_amount || '0').replace('g', '')) || 0;
            return sum + g * (item.quantity || 1);
          }, 0)
        : 50; // default 50g if items not loaded
      const weightKg = Math.max(0.1, totalGrams / 1000); // min 0.1 kg

      return [
        '', // reserved column
        `"${order.order_number}"`,
        `"${(o.first_name || o.customer_first_name || '').trim()}"`,
        `"${(o.last_name || o.customer_last_name || '').trim()}"`,
        '""', // company
        `"${o.email || o.customer_email || ''}"`,
        `"${(o.phone || o.customer_phone || '').replace(/\s/g, '')}"`,
        `"${codAmount}"`,
        '"CZK"',
        `"${Number(order.total_amount || 0)}"`,
        `"${weightKg}"`,
        '"95"', // default pickup point - user changes in Zásilkovna UI
        '"tajnabotanika.online"',
        '"0"', // not adult content
      ].join(',');
    });

    const csv = [header1, header2, ...rows].join('\n');

    // Download CSV
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zasilkovna_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExpandOrder = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      loadOrderItems(orderId);
    }
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
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Všechny objednávky</h2>
                  <div className="flex items-center gap-2">
                    {selectedOrders.size > 0 && (
                      <span className="text-xs text-emerald-400 font-semibold">{selectedOrders.size} vybráno</span>
                    )}
                    <button
                      onClick={selectAllZasilkovna}
                      className="px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-lg transition-all text-xs border border-white/10"
                    >
                      {orders.filter(o => (o as any).shipping_method === 'zasilkovna' && ['pending', 'processing'].includes(o.status)).every(o => selectedOrders.has(o.id)) && selectedOrders.size > 0 ? 'Odznačit vše' : 'Vybrat vše'}
                    </button>
                    <button
                      onClick={exportZasilkovnaCSV}
                      className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl transition-all flex items-center gap-2 text-sm shadow-lg"
                    >
                      <Truck className="w-4 h-4" />
                      Export pro Zásilkovnu {selectedOrders.size > 0 ? `(${selectedOrders.size})` : ''}
                    </button>
                  </div>
                </div>

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
                          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-white/[0.03] transition-colors">
                            {/* Checkbox for Zásilkovna export */}
                            <input
                              type="checkbox"
                              checked={selectedOrders.has(order.id)}
                              onClick={(e) => e.stopPropagation()}
                              onChange={() => toggleOrderSelection(order.id)}
                              className="w-4 h-4 rounded border-2 border-emerald-500/30 bg-black/30 text-emerald-500 focus:ring-emerald-500/50 cursor-pointer flex-shrink-0"
                            />
                          <div
                            className="flex items-center gap-4 flex-1"
                            onClick={() => handleExpandOrder(order.id)}
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
                                {orderItems[order.id] && (
                                  <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-bold rounded-full">
                                    {orderItems[order.id].reduce((sum: number, item: any) => {
                                      const g = parseInt((item.gram_amount || '0').replace('g', '')) || 0;
                                      return sum + g * (item.quantity || 1);
                                    }, 0)}g
                                  </span>
                                )}
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

                              {/* Order items */}
                              <div className="bg-white/[0.04] rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-2 flex items-center gap-1"><Package className="w-3 h-3" /> Položky objednávky</p>
                                {orderItems[order.id] ? (
                                  <div className="space-y-2">
                                    {orderItems[order.id].map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center justify-between py-1.5 px-2 bg-white/[0.03] rounded-lg">
                                        <div className="flex items-center gap-3">
                                          <span className="text-white font-semibold text-sm">{item.product_name}</span>
                                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full">{item.gram_amount || item.variant_name}</span>
                                          {item.quantity > 1 && <span className="text-gray-400 text-xs">x{item.quantity}</span>}
                                        </div>
                                        <span className="text-white font-semibold text-sm">{formatAmount(item.total_price)} Kč</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between pt-2 border-t border-white/10 mt-1">
                                      <span className="text-gray-400 text-xs">Celkem gramů: {orderItems[order.id].reduce((sum: number, item: any) => {
                                        const g = parseInt((item.gram_amount || '0').replace('g', '')) || 0;
                                        return sum + g * (item.quantity || 1);
                                      }, 0)}g</span>
                                      <span className="text-emerald-400 font-bold text-sm">{formatAmount(order.total_amount)} Kč</span>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-500 text-xs">Načítání...</p>
                                )}
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
                                <button
                                  onClick={(e) => { e.stopPropagation(); printDeliveryNote(order); }}
                                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                                  Dodací list
                                </button>
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
