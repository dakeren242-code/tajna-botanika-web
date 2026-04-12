import { useState, useEffect, Fragment } from 'react';
import { supabase } from '../../lib/supabase';
import {
  Users, Download, Facebook, RefreshCw, Search,
  ChevronDown, ChevronUp, ShoppingCart, UserCheck, UserX, Crown
} from 'lucide-react';

interface CrmContact {
  id: string;
  email: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
  source: string | null;
  has_ordered: boolean;
  total_orders: number;
  total_spent: number;
  last_order_at: string | null;
  discount_code: string | null;
  is_subscribed: boolean;
  customer_status: string | null;
  created_at: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: string | null;
  created_at: string;
}

type FilterType = 'all' | 'buyers' | 'leads' | 'high_value' | 'cart_abandoners';

const statusBadge: Record<string, { label: string; color: string }> = {
  buyer: { label: 'Kupující', color: 'text-emerald-400 bg-emerald-500/10' },
  lead: { label: 'Lead', color: 'text-blue-400 bg-blue-500/10' },
  cart_abandoner: { label: 'Opustil košík', color: 'text-yellow-400 bg-yellow-500/10' },
};

const sourceLabels: Record<string, string> = {
  registration: 'Registrace',
  order: 'Objednávka',
  password_reset: 'Reset hesla',
  exit_popup: 'Exit popup',
};

export default function CrmPanel() {
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [contactOrders, setContactOrders] = useState<Record<string, OrderDetail[]>>({});
  const [exporting, setExporting] = useState<string | null>(null);
  const [showAllExports, setShowAllExports] = useState(false);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContacts(data as CrmContact[]);
    }
    setLoading(false);
  };

  const loadContactOrders = async (email: string) => {
    if (contactOrders[email]) return;
    const { data } = await supabase
      .from('orders')
      .select('id, order_number, status, total_amount, payment_method, created_at')
      .or(`customer_email.eq.${email},email.eq.${email}`)
      .order('created_at', { ascending: false });

    if (data) {
      setContactOrders(prev => ({ ...prev, [email]: data }));
    }
  };

  const filteredContacts = contacts.filter(c => {
    // Filter
    if (filter === 'buyers' && !c.has_ordered) return false;
    if (filter === 'leads' && c.has_ordered) return false;
    if (filter === 'high_value' && (c.total_spent || 0) <= 1000) return false;
    if (filter === 'cart_abandoners' && c.customer_status !== 'cart_abandoner') return false;

    // Search
    if (search) {
      const s = search.toLowerCase();
      return (
        c.email?.toLowerCase().includes(s) ||
        c.full_name?.toLowerCase().includes(s) ||
        c.first_name?.toLowerCase().includes(s) ||
        c.last_name?.toLowerCase().includes(s) ||
        c.phone?.includes(s)
      );
    }
    return true;
  });

  const handleExport = async (format: string) => {
    setExporting(format);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const filterParam = filter !== 'all' ? `&filter=${filter === 'cart_abandoners' ? 'leads' : filter}` : '';
      const url = `${supabaseUrl}/functions/v1/crm-export?format=${format}${filterParam}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      const ext = format === 'json' ? 'json' : 'csv';
      a.download = `${format}_export_${new Date().toISOString().slice(0, 10)}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(null);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short' });
  };

  const formatAmount = (a: number | null) => {
    if (!a) return '0';
    return Math.round(a).toLocaleString('cs-CZ');
  };

  const stats = {
    total: contacts.length,
    buyers: contacts.filter(c => c.has_ordered).length,
    leads: contacts.filter(c => !c.has_ordered).length,
    highValue: contacts.filter(c => (c.total_spent || 0) > 1000).length,
    totalRevenue: contacts.reduce((sum, c) => sum + (c.total_spent || 0), 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-gray-400 text-sm ml-3">Načítání CRM...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs">Celkem kontaktů</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs">Kupující</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.buyers}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs">Leady</p>
          <p className="text-2xl font-bold text-blue-400">{stats.leads}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs">VIP (1000+ Kč)</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.highValue}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-gray-400 text-xs">Celkové tržby</p>
          <p className="text-2xl font-bold text-white">{formatAmount(stats.totalRevenue)} Kč</p>
        </div>
      </div>

      {/* Export buttons + Search */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleExport('meta')}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {exporting === 'meta' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Facebook className="w-4 h-4" />}
              Meta (hashed)
            </button>
            <button
              onClick={() => handleExport('google')}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {exporting === 'google' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Google Ads
            </button>
            <button
              onClick={() => handleExport('plain')}
              disabled={exporting !== null}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50"
            >
              {exporting === 'plain' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Plná záloha CSV
            </button>
            <button
              onClick={() => setShowAllExports(!showAllExports)}
              className="flex items-center gap-1 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg text-sm transition-colors"
            >
              {showAllExports ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              Další
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat zákazníka..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm w-full md:w-64 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
        {showAllExports && (
          <div className="flex gap-2 flex-wrap p-3 bg-white/[0.02] rounded-lg border border-white/5">
            <span className="text-gray-500 text-xs self-center mr-1">Další formáty:</span>
            <button onClick={() => handleExport('meta_plain')} disabled={exporting !== null}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded text-xs font-medium transition-colors disabled:opacity-50">
              Meta (nehashovaný)
            </button>
            <button onClick={() => handleExport('tiktok')} disabled={exporting !== null}
              className="px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 rounded text-xs font-medium transition-colors disabled:opacity-50">
              TikTok Audience
            </button>
            <button onClick={() => handleExport('mailchimp')} disabled={exporting !== null}
              className="px-3 py-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded text-xs font-medium transition-colors disabled:opacity-50">
              Mailchimp / Email
            </button>
            <button onClick={() => handleExport('json')} disabled={exporting !== null}
              className="px-3 py-1.5 bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 rounded text-xs font-medium transition-colors disabled:opacity-50">
              JSON (univerzální)
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: 'all', label: 'Všichni', icon: Users, count: stats.total },
          { key: 'buyers', label: 'Kupující', icon: UserCheck, count: stats.buyers },
          { key: 'leads', label: 'Bez objednávky', icon: UserX, count: stats.leads },
          { key: 'high_value', label: 'VIP', icon: Crown, count: stats.highValue },
          { key: 'cart_abandoners', label: 'Opuštěný košík', icon: ShoppingCart, count: contacts.filter(c => c.customer_status === 'cart_abandoner').length },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-emerald-600 text-white'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
            <span className={`ml-1 text-xs ${filter === f.key ? 'text-emerald-200' : 'text-gray-500'}`}>
              ({f.count})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Zákazník</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Telefon</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Stav</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Obj.</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Utraceno</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">Poslední</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">Zdroj</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Sleva</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map(c => (
                <Fragment key={c.id}>
                  <tr
                    onClick={() => {
                      if (expandedContact === c.id) {
                        setExpandedContact(null);
                      } else {
                        setExpandedContact(c.id);
                        if (c.has_ordered) loadContactOrders(c.email);
                      }
                    }}
                    className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">
                        {c.full_name || c.first_name || '—'}
                      </div>
                      <div className="text-gray-500 text-xs">{c.email}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-300 hidden md:table-cell">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        statusBadge[c.customer_status || 'lead']?.color || statusBadge.lead.color
                      }`}>
                        {statusBadge[c.customer_status || 'lead']?.label || 'Lead'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white font-medium">
                      {c.total_orders || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-white font-medium">
                      {formatAmount(c.total_spent)} Kč
                    </td>
                    <td className="py-3 px-4 text-gray-400 hidden lg:table-cell">
                      {formatDate(c.last_order_at)}
                    </td>
                    <td className="py-3 px-4 text-gray-400 hidden lg:table-cell">
                      {sourceLabels[c.source || ''] || c.source || '—'}
                    </td>
                    <td className="py-3 px-4 text-center hidden md:table-cell">
                      {c.discount_code ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/10 text-purple-400">
                          {c.discount_code}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                  {expandedContact === c.id && (
                    <tr>
                      <td colSpan={8} className="px-4 py-4 bg-white/[0.02]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Kontaktní údaje</h4>
                            <div className="space-y-1 text-sm">
                              <p className="text-white">{c.first_name} {c.last_name}</p>
                              <p className="text-gray-300">{c.email}</p>
                              <p className="text-gray-300">{c.phone || 'Bez telefonu'}</p>
                              {c.city && <p className="text-gray-300">{c.city}{c.zip ? `, ${c.zip}` : ''}</p>}
                              <p className="text-gray-500 text-xs">Registrace: {formatDate(c.created_at)}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs text-gray-400 uppercase tracking-wider mb-2">Objednávky</h4>
                            {c.has_ordered ? (
                              <div className="space-y-2">
                                {(contactOrders[c.email] || []).map(o => (
                                  <div key={o.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                                    <div>
                                      <span className="text-white font-medium">#{o.order_number}</span>
                                      <span className="text-gray-500 text-xs ml-2">{formatDate(o.created_at)}</span>
                                    </div>
                                    <span className="text-emerald-400 font-medium">{formatAmount(o.total_amount)} Kč</span>
                                  </div>
                                ))}
                                {!contactOrders[c.email] && (
                                  <p className="text-gray-500 text-sm">Načítání...</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm">Žádné objednávky</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {filteredContacts.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            Žádní zákazníci nenalezeni
          </div>
        )}
      </div>
    </div>
  );
}
