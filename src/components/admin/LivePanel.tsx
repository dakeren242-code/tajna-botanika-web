import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, Package, AlertTriangle, Mail, Eye, DollarSign, RefreshCw,
  Ticket, ShoppingCart, TrendingUp, UserCheck, BarChart2
} from 'lucide-react';

interface Contact {
  id: string;
  email: string;
  full_name: string | null;
  source: string;
  has_ordered: boolean;
  total_orders: number;
  total_spent: number;
  discount_code: string | null;
  is_subscribed: boolean;
  created_at: string;
}

interface ProductStock {
  id: string;
  name: string;
  stock: number | null;
  category: string | null;
}

interface OrderRow {
  id: string;
  order_number: string;
  total_amount: number;
  payment_status: string;
  status: string;
  created_at: string;
  customer_email: string | null;
  customer_first_name: string | null;
  customer_last_name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  payment_method: string | null;
  shipping_method: string | null;
  discount_amount: number | null;
}

interface DiscountCode {
  id: string;
  code: string;
  discount_percent: number;
  is_used: boolean;
  used_at: string | null;
  expires_at: string | null;
}

interface DayStats {
  date: string;
  label: string;
  orders: number;
  newContacts: number;
  registrations: number;
}

export default function LivePanel({ liveVisitors }: { liveVisitors: number }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<ProductStock[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [userDates, setUserDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [c, p, o, d, u] = await Promise.all([
      supabase.from('email_contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('id, name, stock, category').order('stock', { ascending: true }),
      supabase.from('orders').select('id, order_number, total_amount, payment_status, status, created_at, customer_email, customer_first_name, customer_last_name, first_name, last_name, email, payment_method, shipping_method, discount_amount').order('created_at', { ascending: false }),
      supabase.from('discount_codes').select('*').order('created_at', { ascending: false }),
      supabase.from('user_profiles').select('id, created_at').order('created_at', { ascending: false }),
    ]);
    if (c.data) setContacts(c.data);
    if (p.data) setProducts(p.data);
    if (o.data) setOrders(o.data);
    if (d.data) setDiscounts(d.data);
    if (u.data) {
      setUserCount(u.data.length);
      setUserDates(u.data.map((r: any) => r.created_at));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const paid = orders.filter(o => o.payment_status === 'paid');
  const revenue = paid.reduce((s, o) => s + Number(o.total_amount), 0);
  const avg = paid.length > 0 ? revenue / paid.length : 0;
  const lowStock = products.filter(p => (p.stock ?? 0) <= 5 && (p.stock ?? 0) > 0);
  const outStock = products.filter(p => (p.stock ?? 0) === 0);
  const activeDisc = discounts.filter(d => !d.is_used && (!d.expires_at || new Date(d.expires_at) > new Date()));
  const usedDisc = discounts.filter(d => d.is_used);

  // Daily stats for last 7 days
  const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
  const dailyStats: DayStats[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const label = i === 6 ? 'Dnes' : i === 5 ? 'Včera' : dayNames[d.getDay()];
    return {
      date: dateStr,
      label,
      orders: orders.filter(o => o.created_at.startsWith(dateStr)).length,
      newContacts: contacts.filter(c => c.created_at.startsWith(dateStr)).length,
      registrations: userDates.filter(d2 => d2.startsWith(dateStr)).length,
    };
  });
  const maxDayOrders = Math.max(...dailyStats.map(d => d.orders), 1);
  const maxDayContacts = Math.max(...dailyStats.map(d => d.newContacts + d.registrations), 1);

  const ago = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return 'právě';
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Přehled</h2>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all disabled:opacity-50">
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />Obnovit
        </button>
      </div>

      {/* Live + KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-green-500/15 to-emerald-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <Eye className="w-3.5 h-3.5 text-green-400" />
            <span className="text-green-400 text-[10px] font-bold uppercase">Live</span>
          </div>
          <span className="text-3xl font-black text-white">{liveVisitors}</span>
          <p className="text-gray-500 text-[10px]">na webu teď</p>
        </div>
        {[
          { l: 'Registrace', v: userCount, icon: Users, c: 'emerald' },
          { l: 'Objednávky', v: `${paid.length}/${orders.length}`, icon: Package, c: 'blue' },
          { l: 'Tržby', v: `${revenue.toFixed(0)} Kč`, icon: DollarSign, c: 'green' },
          { l: 'Průměr', v: `${avg.toFixed(0)} Kč`, icon: TrendingUp, c: 'purple' },
        ].map((k, i) => {
          const I = k.icon;
          const colors: Record<string, string> = {
            emerald: 'from-emerald-500/10 border-emerald-500/20 text-emerald-400',
            blue: 'from-blue-500/10 border-blue-500/20 text-blue-400',
            green: 'from-green-500/10 border-green-500/20 text-green-400',
            purple: 'from-purple-500/10 border-purple-500/20 text-purple-400',
          };
          return (
            <div key={i} className={`bg-gradient-to-br ${colors[k.c]} border rounded-xl p-4`}>
              <I className="w-4 h-4 mb-1.5 opacity-60" />
              <span className="text-xl font-bold text-white block">{k.v}</span>
              <p className="text-gray-500 text-[10px]">{k.l}</p>
            </div>
          );
        })}
      </div>

      {/* Daily activity - last 7 days */}
      <div className="bg-black/30 border border-white/5 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">Denní aktivita (posledních 7 dní)</span>
          <span className="text-[10px] text-gray-500 ml-auto">Objednávky · Nové kontakty · Registrace</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {dailyStats.map((day, i) => {
            const orderHeight = day.orders > 0 ? Math.max(8, Math.round((day.orders / maxDayOrders) * 60)) : 0;
            const contactHeight = (day.newContacts + day.registrations) > 0
              ? Math.max(8, Math.round(((day.newContacts + day.registrations) / maxDayContacts) * 60))
              : 0;
            const isToday = i === 6;
            return (
              <div key={day.date} className={`flex flex-col items-center gap-1 ${isToday ? 'opacity-100' : 'opacity-70'}`}>
                {/* Bar chart area */}
                <div className="flex items-end gap-0.5 h-16">
                  {/* Orders bar (emerald) */}
                  <div className="flex flex-col items-center">
                    {day.orders > 0 && (
                      <span className="text-[8px] text-emerald-400 font-bold mb-0.5">{day.orders}</span>
                    )}
                    <div
                      className={`w-3 rounded-sm ${isToday ? 'bg-emerald-400' : 'bg-emerald-500/40'}`}
                      style={{ height: `${orderHeight}px`, minHeight: day.orders > 0 ? '8px' : '2px', opacity: day.orders > 0 ? 1 : 0.2 }}
                    />
                  </div>
                  {/* Contacts+Registrations bar (blue) */}
                  <div className="flex flex-col items-center">
                    {(day.newContacts + day.registrations) > 0 && (
                      <span className="text-[8px] text-blue-400 font-bold mb-0.5">{day.newContacts + day.registrations}</span>
                    )}
                    <div
                      className={`w-3 rounded-sm ${isToday ? 'bg-blue-400' : 'bg-blue-500/40'}`}
                      style={{ height: `${contactHeight}px`, minHeight: (day.newContacts + day.registrations) > 0 ? '8px' : '2px', opacity: (day.newContacts + day.registrations) > 0 ? 1 : 0.2 }}
                    />
                  </div>
                </div>
                {/* Day label */}
                <span className={`text-[10px] font-bold ${isToday ? 'text-white' : 'text-gray-500'}`}>{day.label}</span>
                {/* Totals below */}
                {(day.orders > 0 || day.newContacts + day.registrations > 0) && (
                  <div className="text-[8px] text-center leading-tight">
                    {day.orders > 0 && <div className="text-emerald-400">{day.orders} obj.</div>}
                    {(day.newContacts + day.registrations) > 0 && (
                      <div className="text-blue-400">{day.newContacts + day.registrations} kontaktů</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
            <span className="text-[10px] text-gray-500">Objednávky</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm bg-blue-400" />
            <span className="text-[10px] text-gray-500">Nové kontakty + registrace</span>
          </div>
        </div>
      </div>

      {/* Low stock */}
      {(lowStock.length > 0 || outStock.length > 0) && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-xs font-bold text-red-400 uppercase">Sklad</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {outStock.map(p => (
              <span key={p.id} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 border border-red-500/20 text-red-300">
                {p.name} &mdash; <strong>0 ks</strong>
              </span>
            ))}
            {lowStock.map(p => (
              <span key={p.id} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-300">
                {p.name} &mdash; {p.stock} ks
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── ZÁKAZNÍCI ── */}
      <div className="bg-black/30 border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-white">Zákazníci ({contacts.length})</span>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="text-emerald-400">{contacts.filter(c => c.has_ordered).length} objednalo</span>
            <span className="text-gray-500">{contacts.filter(c => !c.has_ordered).length} bez objednávky</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-xs text-gray-500">
                <th className="text-left px-4 py-2.5">Zákazník</th>
                <th className="text-left px-4 py-2.5">Zdroj</th>
                <th className="text-center px-4 py-2.5">Obj.</th>
                <th className="text-right px-4 py-2.5">Utratil</th>
                <th className="text-center px-4 py-2.5">Sleva</th>
                <th className="text-center px-4 py-2.5">Odběr</th>
                <th className="text-right px-4 py-2.5">Kdy</th>
              </tr>
            </thead>
            <tbody>
              {contacts.slice(0, 15).map(c => (
                <tr key={c.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-2.5">
                    <p className="text-white font-medium truncate max-w-[200px]">{c.full_name || '—'}</p>
                    <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{c.email}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-400">{c.source}</span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {c.has_ordered ? (
                      <span className="text-emerald-400 font-bold">{c.total_orders}</span>
                    ) : (
                      <span className="text-gray-600">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {c.total_spent > 0 ? (
                      <span className="text-white font-medium">{c.total_spent.toFixed(0)} Kč</span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {c.discount_code ? (
                      <code className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{c.discount_code}</code>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {c.is_subscribed ? (
                      <Mail className="w-3.5 h-3.5 text-emerald-400 mx-auto" />
                    ) : (
                      <span className="text-gray-600 text-xs">ne</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-gray-500 text-xs">{ago(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SLEVY ── */}
      <div className="bg-black/30 border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Slevové kódy</span>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="text-emerald-400">{activeDisc.length} aktivních</span>
            <span className="text-gray-500">{usedDisc.length} použitých</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {discounts.map(d => (
            <span key={d.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
              d.is_used
                ? 'bg-gray-500/5 border-gray-500/10 text-gray-500 line-through'
                : d.expires_at && new Date(d.expires_at) < new Date()
                  ? 'bg-red-500/5 border-red-500/10 text-red-400'
                  : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              {d.code} &middot; -{d.discount_percent}%
              {d.is_used && <span className="no-underline text-gray-600 line-through-none"> (použit)</span>}
            </span>
          ))}
        </div>
      </div>

      {/* ── POSLEDNI OBJEDNAVKY ── */}
      <div className="bg-black/30 border border-white/5 rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5">
          <ShoppingCart className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-bold text-white">Poslední objednávky</span>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">Žádné objednávky</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-gray-500">
                  <th className="text-left px-4 py-2.5">Zákazník</th>
                  <th className="text-right px-4 py-2.5">Částka</th>
                  <th className="text-center px-4 py-2.5">Platba</th>
                  <th className="text-center px-4 py-2.5">Stav</th>
                  <th className="text-center px-4 py-2.5">Doprava</th>
                  <th className="text-right px-4 py-2.5">Sleva</th>
                  <th className="text-right px-4 py-2.5">Kdy</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(o => (
                  <tr key={o.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-2.5">
                      <p className="text-white font-medium">{(o.customer_first_name || o.first_name) ? `${o.customer_first_name || o.first_name} ${o.customer_last_name || o.last_name || ''}` : (o.customer_email || o.email || 'Anonym')}</p>
                      {(o.customer_email || o.email) && (o.customer_first_name || o.first_name) && <p className="text-[10px] text-gray-500">{o.customer_email || o.email}</p>}
                    </td>
                    <td className="px-4 py-2.5 text-right font-bold text-white">{Number(o.total_amount).toFixed(0)} Kč</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                        o.payment_status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {o.payment_status === 'paid' ? 'Zaplaceno' : o.payment_status === 'failed' ? 'Selhala' : 'Čeká'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/5 text-gray-400">
                        {o.status === 'pending' ? 'Čeká' : o.status === 'shipped' ? 'Odesláno' : o.status === 'delivered' ? 'Doručeno' : o.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-400">
                      {o.shipping_method === 'zasilkovna' ? 'Zásilkovna' : o.shipping_method === 'personal_pickup' ? 'Osobně' : o.shipping_method || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {(o.discount_amount ?? 0) > 0 ? (
                        <span className="text-amber-400 text-xs font-bold">-{Number(o.discount_amount).toFixed(0)} Kč</span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right text-xs text-gray-500">{ago(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
