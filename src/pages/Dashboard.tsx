import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Package, ShoppingBag, TrendingUp, DollarSign, Edit2, Trash2, Save, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  featured: boolean;
  created_at: string;
}

interface ProductVariant {
  id: string;
  product_id: string;
  variant_name: string;
  price: number;
  stock: number;
  is_available: boolean;
  weight_grams: number;
}

interface Order {
  id: string;
  order_number: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
}

interface Subscription {
  id: string;
  user_id: string;
  pack_id: string;
  status: string;
  mollie_subscription_id: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'subscriptions'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    if (!user || !isSuperAdmin) {
      return;
    }

    loadData();
  }, [user, isSuperAdmin]);

  const loadData = async () => {
    setLoading(true);

    const [productsData, variantsData, ordersData, subscriptionsData] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('product_variants').select('*').order('product_id, sort_order'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
      supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
    ]);

    if (productsData.data) setProducts(productsData.data);
    if (variantsData.data) setVariants(variantsData.data);
    if (ordersData.data) setOrders(ordersData.data);
    if (subscriptionsData.data) setSubscriptions(subscriptionsData.data);

    const totalRevenue = ordersData.data
      ?.filter(o => o.payment_status === 'paid')
      .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

    setStats({
      totalOrders: ordersData.data?.length || 0,
      totalRevenue,
      activeSubscriptions: subscriptionsData.data?.filter(s => s.status === 'active').length || 0,
      totalProducts: productsData.data?.length || 0,
    });

    setLoading(false);
  };

  const updateVariantStock = async (variantId: string, newStock: number) => {
    const { error } = await supabase
      .from('product_variants')
      .update({ stock: newStock })
      .eq('id', variantId);

    if (!error) {
      await loadData();
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Opravdu chcete smazat tento produkt?')) return;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (!error) {
      await loadData();
    }
  };

  const saveProduct = async () => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from('products')
      .update({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        stock: editingProduct.stock,
        featured: editingProduct.featured,
      })
      .eq('id', editingProduct.id);

    if (!error) {
      setEditingProduct(null);
      await loadData();
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-400">Vítejte, {user?.email}</p>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-emerald-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
            }`}
          >
            Přehled
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'products'
                ? 'bg-emerald-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
            }`}
          >
            Produkty
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'orders'
                ? 'bg-emerald-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
            }`}
          >
            Objednávky
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'subscriptions'
                ? 'bg-emerald-600 text-white'
                : 'bg-black/50 text-gray-300 hover:bg-black/70'
            }`}
          >
            Předplatné
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <ShoppingBag className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Celkem objednávek</h3>
              <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Celkový obrat</h3>
              <p className="text-3xl font-bold text-white">{formatPrice(stats.totalRevenue)}</p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Aktivní předplatné</h3>
              <p className="text-3xl font-bold text-white">{stats.activeSubscriptions}</p>
            </div>

            <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-gray-400 text-sm mb-1">Celkem produktů</h3>
              <p className="text-3xl font-bold text-white">{stats.totalProducts}</p>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Správa produktů a skladu</h2>

              <div className="space-y-4">
                {products.map(product => (
                  <div key={product.id} className="border border-emerald-500/20 rounded-lg p-4">
                    {editingProduct?.id === product.id ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          className="w-full px-4 py-2 bg-black/30 border border-emerald-500/20 rounded-lg text-white"
                          placeholder="Název produktu"
                        />
                        <textarea
                          value={editingProduct.description}
                          onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                          className="w-full px-4 py-2 bg-black/30 border border-emerald-500/20 rounded-lg text-white"
                          placeholder="Popis"
                          rows={3}
                        />
                        <div className="flex gap-4">
                          <button
                            onClick={saveProduct}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Uložit
                          </button>
                          <button
                            onClick={() => setEditingProduct(null)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            Zrušit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white">{product.name}</h3>
                            <p className="text-gray-400 text-sm">{product.description}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteProduct(product.id)}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="text-white font-semibold">Varianty:</h4>
                          {variants
                            .filter(v => v.product_id === product.id)
                            .map(variant => (
                              <div key={variant.id} className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                                <div className="flex items-center gap-4">
                                  <span className="text-white font-semibold">{variant.variant_name}</span>
                                  <span className="text-gray-400">{formatPrice(variant.price)}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={`text-sm ${variant.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    Sklad: {variant.stock} ks
                                  </span>
                                  <input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => updateVariantStock(variant.id, parseInt(e.target.value) || 0)}
                                    className="w-20 px-2 py-1 bg-black/50 border border-emerald-500/20 rounded text-white text-center"
                                    min="0"
                                  />
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Všechny objednávky</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    <th className="text-left text-gray-400 py-3 px-4">Číslo</th>
                    <th className="text-left text-gray-400 py-3 px-4">Zákazník</th>
                    <th className="text-left text-gray-400 py-3 px-4">Email</th>
                    <th className="text-left text-gray-400 py-3 px-4">Částka</th>
                    <th className="text-left text-gray-400 py-3 px-4">Stav</th>
                    <th className="text-left text-gray-400 py-3 px-4">Platba</th>
                    <th className="text-left text-gray-400 py-3 px-4">Datum</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                      className="border-b border-emerald-500/10 hover:bg-emerald-500/5 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 text-white font-mono text-sm">{order.order_number}</td>
                      <td className="py-3 px-4 text-white">
                        {order.customer_first_name} {order.customer_last_name}
                      </td>
                      <td className="py-3 px-4 text-gray-400">{order.customer_email}</td>
                      <td className="py-3 px-4 text-white font-semibold">{formatPrice(order.total_amount)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' :
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          order.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                          order.payment_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(order.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'subscriptions' && (
          <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Předplatná</h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    <th className="text-left text-gray-400 py-3 px-4">ID</th>
                    <th className="text-left text-gray-400 py-3 px-4">Mollie ID</th>
                    <th className="text-left text-gray-400 py-3 px-4">Stav</th>
                    <th className="text-left text-gray-400 py-3 px-4">Datum vytvoření</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map(subscription => (
                    <tr key={subscription.id} className="border-b border-emerald-500/10 hover:bg-emerald-500/5">
                      <td className="py-3 px-4 text-white font-mono text-sm">{subscription.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4 text-gray-400">{subscription.mollie_subscription_id || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          subscription.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                          subscription.status === 'canceled' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">{formatDate(subscription.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {subscriptions.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  Žádná předplatná nenalezena
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
