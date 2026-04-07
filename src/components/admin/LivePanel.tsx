import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, ShoppingCart, Package, TrendingUp, AlertTriangle,
  Mail, Tag, Clock, Eye, UserPlus, DollarSign, BarChart3,
  ArrowUpRight, ArrowDownRight, Ticket, RefreshCw, Sparkles,
  MessageSquare
} from 'lucide-react';

interface EmailContact {
  id: string;
  email: string;
  full_name: string | null;
  source: string;
  has_ordered: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
  is_subscribed: boolean;
}

interface ProductStock {
  id: string;
  name: string;
  stock: number | null;
  price: number;
  category: string | null;
}

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  is_used: boolean;
  used_at: string | null;
  created_at: string;
  expires_at: string | null;
}

interface OrderRow {
  id: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  customer_email: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  shipping_method: string | null;
  payment_method: string | null;
}

export default function LivePanel({ liveVisitors }: { liveVisitors: number }) {
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [supportCount, setSupportCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadAll = async () => {
    setLoading(true);
    const [contactsRes, productsRes, discountsRes, ordersRes, profilesRes, supportRes] = await Promise.all([
      supabase.from('email_contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, stock, price, category').order('stock', { ascending: true }),
      supabase.from('discount_codes').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('id, total_amount, payment_status, status, created_at, customer_email, customer_first_name, customer_last_name, shipping_method, payment_method').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('id', { count: 'exact' }),
      supabase.from('support_messages').select('id', { count: 'exact' }),
    ]);

    if (contactsRes.data) setContacts(contactsRes.data);
    if (productsRes.data) setProducts(productsRes.data);
    if (discountsRes.data) setDiscounts(discountsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (profilesRes.count !== null) setUserCount(profilesRes.count);
    if (supportRes.count !== null) setSupportCount(supportRes.count);

    setLastRefresh(new Date());
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    const t = setInterval(loadAll, 30000);
    return () => clearInterval(t);
  }, []);

  // Computed stats
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total_amount), 0);
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const conversionRate = contacts.length > 0 ? ((paidOrders.length / contacts.length) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.created_at.startsWith(today));
  const todayContacts = contacts.filter(c => c.created_at.startsWith(today));
  const todayRevenue = todayOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);

  const last7d = new Date(Date.now() - 7 * 86400000).toISOString();
  const weekOrders = orders.filter(o => o.created_at >= last7d);
  const weekRevenue = weekOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);

  const lowStockProducts = products.filter(p => (p.stock ?? 0) <= 5);
  const outOfStockProducts = products.filter(p => (p.stock ?? 0) === 0);

  const activeDiscounts = discounts.filter(d => !d.is_used && (!d.expires_at || new Date(d.expires_at) > new Date()));
  const usedDiscounts = discounts.filter(d => d.is_used);

  const subscribedContacts = contacts.filter(c => c.is_subscribed);
  const contactsWithOrders = contacts.filter(c => c.has_ordered);

  const recentContacts = contacts.slice(0, 5);

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'pr\u00e1v\u011b te\u010f';
    if (min < 60) return `${min}m`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h`;
    const d = Math.floor(hr / 24);
    return `${d}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">\u017div\u00fd p\u0159ehled</h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500">
            Aktualizov\u00e1no: {lastRefresh.toLocaleTimeString('cs-CZ')}
          </span>
          <button onClick={loadAll} disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Obnovit
          </button>
        </div>
      </div>

      {/* ── LIVE BANNER ── */}
      <div className="flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/30 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <Eye className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Live</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">{liveVisitors}</span>
          <span className="text-gray-400 text-sm">lid\u00ed pr\u00e1v\u011b na webu</span>
        </div>
        <div className="ml-auto flex items-center gap-6 text-sm">
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{todayContacts.length}</span>
            <p className="text-gray-500 text-xs">nov\u00e9 kontakty dnes</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-white">{todayOrders.length}</span>
            <p className="text-gray-500 text-xs">objedn\u00e1vky dnes</p>
          </div>
          <div className="text-center">
            <span className="text-2xl font-bold text-emerald-400">{todayRevenue.toFixed(0)} K\u010d</span>
            <p className="text-gray-500 text-xs">tr\u017eby dnes</p>
          </div>
        </div>
      </div>

      {/* ── MAIN KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Registrace', value: userCount, icon: Users, color: 'emerald', sub: `${contacts.length} kontakt\u016f` },
          { label: 'Objedn\u00e1vky', value: orders.length, icon: Package, color: 'blue', sub: `${paidOrders.length} zaplacen\u00fdch` },
          { label: 'Tr\u017eby celkem', value: `${totalRevenue.toFixed(0)} K\u010d`, icon: DollarSign, color: 'green', sub: `t\u00fdden: ${weekRevenue.toFixed(0)} K\u010d` },
          { label: 'Pr\u016fm. objedn\u00e1vka', value: `${avgOrderValue.toFixed(0)} K\u010d`, icon: TrendingUp, color: 'purple', sub: `konverze: ${conversionRate.toFixed(1)}%` },
          { label: 'Odb\u011bratel\u00e9', value: subscribedContacts.length, icon: Mail, color: 'cyan', sub: `z ${contacts.length} kontakt\u016f` },
          { label: 'Podpora', value: supportCount, icon: MessageSquare, color: 'amber', sub: 'zpr\u00e1v celkem' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          const colors: Record<string, string> = {
            emerald: 'from-emerald-500/15 to-teal-500/10 border-emerald-500/25 text-emerald-400',
            blue: 'from-blue-500/15 to-cyan-500/10 border-blue-500/25 text-blue-400',
            green: 'from-green-500/15 to-emerald-500/10 border-green-500/25 text-green-400',
            purple: 'from-purple-500/15 to-violet-500/10 border-purple-500/25 text-purple-400',
            cyan: 'from-cyan-500/15 to-blue-500/10 border-cyan-500/25 text-cyan-400',
            amber: 'from-amber-500/15 to-yellow-500/10 border-amber-500/25 text-amber-400',
          };
          const c = colors[kpi.color] || colors.emerald;
          const [gradPart, , borderPart, textPart] = c.split(' ');
          return (
            <div key={i} className={`bg-gradient-to-br ${c} border rounded-xl p-4`}>
              <Icon className={`w-5 h-5 mb-2 ${textPart}`} />
              <p className="text-gray-400 text-xs mb-1">{kpi.label}</p>
              <p className="text-xl font-bold text-white">{kpi.value}</p>
              <p className="text-gray-500 text-[10px] mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ── LOW STOCK ALERTS ── */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider">
              N\u00edzk\u00fd sklad ({lowStockProducts.length} produkt\u016f)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between px-4 py-3 rounded-lg bg-black/30 border border-red-500/10">
                <div>
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.category || 'Bez kategorie'}</p>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black ${(p.stock ?? 0) === 0 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {p.stock ?? 0}
                  </span>
                  <p className="text-[10px] text-gray-500">ks</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── RECENT CONTACTS ── */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Posledn\u00ed kontakty</h3>
            </div>
            <span className="text-xs text-gray-500">{contacts.length} celkem</span>
          </div>
          <div className="space-y-2">
            {recentContacts.map(c => (
              <div key={c.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    c.has_ordered ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-gray-400'
                  }`}>
                    {(c.full_name || c.email)[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white truncate">{c.full_name || c.email}</p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>{c.source}</span>
                      {c.has_ordered && <span className="text-emerald-400">&#x2022; objednal</span>}
                      {c.total_spent > 0 && <span className="text-emerald-400">{c.total_spent.toFixed(0)} K\u010d</span>}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{timeAgo(c.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── DISCOUNT CODES ── */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Slevov\u00e9 k\u00f3dy</h3>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-emerald-400">{activeDiscounts.length} aktivn\u00edch</span>
              <span className="text-gray-500">{usedDiscounts.length} pou\u017eit\u00fdch</span>
            </div>
          </div>
          <div className="space-y-2">
            {discounts.slice(0, 6).map(d => (
              <div key={d.id} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-3">
                  <code className={`px-2 py-0.5 rounded text-xs font-bold ${
                    d.is_used ? 'bg-gray-500/10 text-gray-500 line-through' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {d.code}
                  </code>
                  <span className="text-sm text-white">-{d.discount_percent}%</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {d.is_used ? (
                    <span className="text-gray-500">Pou\u017eit {d.used_at ? timeAgo(d.used_at) : ''}</span>
                  ) : d.expires_at && new Date(d.expires_at) < new Date() ? (
                    <span className="text-red-400">Vypr\u0161el</span>
                  ) : (
                    <span className="text-emerald-400">Aktivn\u00ed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RECENT ORDERS ── */}
      <div className="bg-black/30 border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Posledn\u00ed objedn\u00e1vky</h3>
          </div>
          <span className="text-xs text-gray-500">T\u00fdden: {weekOrders.length} obj. / {weekRevenue.toFixed(0)} K\u010d</span>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">\u017d\u00e1dn\u00e9 objedn\u00e1vky zat\u00edm</p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/3 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    o.payment_status === 'paid' ? 'bg-emerald-400' : o.payment_status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                  }`} />
                  <div>
                    <p className="text-sm text-white font-semibold">
                      {o.customer_first_name ? `${o.customer_first_name} ${o.customer_last_name || ''}` : o.customer_email || 'Anonym'}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <span>{o.payment_method === 'card' ? 'Kartou' : o.payment_method === 'bank_transfer' ? 'P\u0159evodem' : o.payment_method === 'cash_on_delivery' ? 'Dob\u00edrka' : o.payment_method || '-'}</span>
                      <span>&#x2022;</span>
                      <span>{o.shipping_method === 'zasilkovna' ? 'Z\u00e1silkovna' : o.shipping_method === 'personal_pickup' ? 'Osobn\u011b' : o.shipping_method || '-'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{Number(o.total_amount).toFixed(0)} K\u010d</p>
                  <p className="text-[10px] text-gray-500">{timeAgo(o.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── CONVERSION FUNNEL ── */}
      <div className="bg-black/30 border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-bold text-white">Konverzn\u00ed trycht\u00fd\u0159</h3>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: 'Kontakty', value: contacts.length, color: 'bg-cyan-500' },
            { label: 'Registrace', value: userCount, color: 'bg-blue-500' },
            { label: 'S objedn\u00e1vkou', value: contactsWithOrders.length, color: 'bg-purple-500' },
            { label: 'Zaplaceno', value: paidOrders.length, color: 'bg-emerald-500' },
          ].map((step, i, arr) => {
            const maxW = arr[0].value || 1;
            const pct = Math.max(5, (step.value / maxW) * 100);
            return (
              <div key={i} className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">{step.label}</span>
                  <span className="text-xs font-bold text-white">{step.value}</span>
                </div>
                <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                  <div className={`h-full rounded-full ${step.color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
                {i < arr.length - 1 && (
                  <p className="text-[10px] text-gray-600 mt-0.5 text-right">
                    {arr[i + 1].value > 0 && step.value > 0 ? `${((arr[i + 1].value / step.value) * 100).toFixed(0)}%` : '-'}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
