import { useState, useEffect, useRef } from 'react';
import { supabase, Product } from '../../lib/supabase';
import { Plus, CreditCard as Edit2, Trash2, Save, X, Package, Upload, Image as ImageIcon } from 'lucide-react';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  thc_percent: number;
  cbd_percent: number;
  cbg_percent: number;
  thc_x_percent: number;
  flavor_profile: string;
  effects: string;
  image_url: string;
  featured: boolean;
  gram_options: number[];
}

const defaultFormData: ProductFormData = {
  name: '',
  description: '',
  price: 190,
  stock: 0,
  category: 'flower',
  thc_percent: 0.06,
  cbd_percent: 9.05,
  cbg_percent: 0.1,
  thc_x_percent: 40,
  flavor_profile: '',
  effects: '',
  image_url: '',
  featured: false,
  gram_options: [1, 3, 5, 10],
};

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const fileName = `${Date.now()}-${formData.name.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err: any) {
      setError(err.message || 'Chyba při nahrávání obrázku');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: Number(product.price),
      stock: product.stock || 0,
      category: product.category || 'flower',
      thc_percent: Number(product.thc_percent) || 0,
      cbd_percent: Number(product.cbd_percent) || 0,
      cbg_percent: Number(product.cbg_percent) || 0,
      thc_x_percent: Number(product.thc_x_percent) || 0,
      flavor_profile: product.flavor_profile || '',
      effects: Array.isArray(product.effects) ? product.effects.join(', ') : (product.effects || ''),
      image_url: product.image_url || '',
      featured: product.featured || false,
      gram_options: (product.gram_options as number[]) || [1, 3, 5, 10],
    });
    setShowAddForm(false);
  };

  const handleAdd = () => {
    setFormData(defaultFormData);
    setEditingId(null);
    setShowAddForm(true);
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    setFormData(defaultFormData);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const effectsArray = formData.effects
        ? formData.effects.split(',').map(e => e.trim()).filter(e => e.length > 0)
        : [];

      const productData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        category: formData.category,
        thc_percent: formData.thc_percent,
        cbd_percent: formData.cbd_percent,
        cbg_percent: formData.cbg_percent,
        thc_x_percent: formData.thc_x_percent,
        flavor_profile: formData.flavor_profile || null,
        effects: effectsArray,
        image_url: formData.image_url || null,
        featured: formData.featured,
        gram_options: formData.gram_options,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([{ ...productData, created_at: new Date().toISOString() }]);

        if (error) throw error;
      }

      handleCancel();
      loadProducts();
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání produktu');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento produkt?')) return;

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (!error) {
      loadProducts();
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    const { error } = await supabase
      .from('products')
      .update({ stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (!error) {
      loadProducts();
    }
  };

  if (loading) {
    return <div className="text-white text-center py-8">Načítání...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Správa produktů</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Přidat produkt
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {(showAddForm || editingId) && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white/5 rounded-xl p-6 border border-emerald-500/20">
          <h3 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Upravit produkt' : 'Nový produkt'}
          </h3>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Název</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Cena (Kč)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Skladem (ks)</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Kategorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="flower">Květy</option>
                <option value="concentrate">Koncentráty</option>
                <option value="collectible">Sběratelské</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Obrázek produktu</label>
              <div className="space-y-3">
                {formData.image_url && (
                  <div className="relative w-24 h-24">
                    <img
                      src={formData.image_url}
                      alt="Náhled"
                      className="w-24 h-24 rounded-lg object-cover border border-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-3 px-4 py-3 bg-black/50 border border-dashed border-emerald-500/30 rounded-lg cursor-pointer hover:border-emerald-500/60 transition-colors"
                >
                  {uploading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="w-5 h-5 text-emerald-400" />
                  )}
                  <span className="text-gray-400 text-sm">
                    {uploading ? 'Nahrávání...' : 'Klikněte pro nahrání obrázku'}
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <input
                  type="text"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="nebo vložte URL obrázku"
                  className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white text-sm focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">THC (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.thc_percent}
                onChange={(e) => setFormData({ ...formData, thc_percent: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CBD (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cbd_percent}
                onChange={(e) => setFormData({ ...formData, cbd_percent: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">CBG (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.cbg_percent}
                onChange={(e) => setFormData({ ...formData, cbg_percent: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">THC-X (%)</label>
              <input
                type="number"
                step="0.01"
                value={formData.thc_x_percent}
                onChange={(e) => setFormData({ ...formData, thc_x_percent: Number(e.target.value) })}
                className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Popis</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              rows={3}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Chutě</label>
            <input
              type="text"
              value={formData.flavor_profile}
              onChange={(e) => setFormData({ ...formData, flavor_profile: e.target.value })}
              className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Účinky (oddělené čárkou)</label>
            <input
              type="text"
              value={formData.effects}
              onChange={(e) => setFormData({ ...formData, effects: e.target.value })}
              className="w-full px-4 py-2 bg-black/50 border border-emerald-500/20 rounded-lg text-white focus:border-emerald-500 focus:outline-none"
              placeholder="citrusový, zemitý, sladký, kořenitý"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-4 h-4 rounded border-emerald-500/20"
              />
              Doporučený produkt
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              Uložit
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
              Zrušit
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-emerald-500/20">
              <th className="text-left py-4 px-4 text-gray-400 font-semibold">Produkt</th>
              <th className="text-left py-4 px-4 text-gray-400 font-semibold">Kategorie</th>
              <th className="text-left py-4 px-4 text-gray-400 font-semibold">Cena</th>
              <th className="text-left py-4 px-4 text-gray-400 font-semibold">Skladem</th>
              <th className="text-left py-4 px-4 text-gray-400 font-semibold">Akce</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-emerald-500/10 hover:bg-white/5">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="text-white font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-400">{product.category || 'N/A'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-300">{product.category || '-'}</td>
                <td className="py-4 px-4 text-white font-semibold">{product.price} Kč</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStock(product.id, Math.max(0, (product.stock || 0) - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                    >
                      -
                    </button>
                    <span className={`font-semibold px-3 ${(product.stock || 0) === 0 ? 'text-red-400' : 'text-white'}`}>
                      {product.stock || 0}
                    </span>
                    <button
                      onClick={() => updateStock(product.id, (product.stock || 0) + 1)}
                      className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded transition-colors"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Zatím nejsou žádné produkty</p>
        </div>
      )}
    </div>
  );
}
