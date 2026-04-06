import { useEffect, useState } from 'react';
import { supabase, Product } from '../lib/supabase';
import ProductCard from './ProductCard';
import { Loader2, Sparkles, Zap, Leaf } from 'lucide-react';

const FILTERS = [
  {
    id: 'all',
    label: 'Vše',
    icon: Sparkles,
    activeClass: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-black',
    hoverClass: 'hover:bg-white/10 hover:text-white',
    glowColor: '',
  },
  {
    id: 'sativa',
    label: 'Sativa Dominant',
    icon: Zap,
    activeClass: 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black',
    hoverClass: 'hover:bg-amber-400/20 hover:text-amber-300 hover:border-amber-400/40',
    glowColor: 'shadow-amber-400/30',
  },
  {
    id: 'indica',
    label: 'Indica Dominant',
    icon: Leaf,
    activeClass: 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white',
    hoverClass: 'hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/40',
    glowColor: 'shadow-blue-500/30',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    icon: Leaf,
    activeClass: 'bg-gradient-to-r from-emerald-500 to-green-400 text-white',
    hoverClass: 'hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40',
    glowColor: 'shadow-emerald-500/30',
  },
];

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, activeFilter, sortBy]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('featured', { ascending: false })
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = activeFilter === 'all'
      ? [...products]
      : products.filter((p) => p.category === activeFilter);

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'thc-high':
          return parseFloat(b.thcx_content?.toString() || '0') - parseFloat(a.thcx_content?.toString() || '0');
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
    });

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-yellow-400 via-yellow-200 to-white bg-clip-text text-transparent">
              NAŠE KOLEKCE
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Objevte jedinečné květy s precizně vyvážeými profily.
            Každý produkt je certifikován a testován.
          </p>
        </div>

        <div className="mb-12 flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex flex-wrap gap-3 justify-center">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border transition-all duration-300 ${
                  activeFilter === filter.id
                    ? `${filter.activeClass} scale-105 border-transparent shadow-lg ${filter.glowColor}`
                    : `bg-white/5 text-gray-400 border-white/10 ${filter.hoverClass}`
                }`}
                data-cursor-hover
              >
                <filter.icon className="w-4 h-4" />
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-all duration-200 cursor-pointer"
              data-cursor-hover
            >
              <option value="featured">Doporučené</option>
              <option value="price-low">Cena: Nejnižší</option>
              <option value="price-high">Cena: Nejvyšší</option>
              <option value="thc-high">THC-X: Nejvyšší</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-yellow-400">
              ▼
            </div>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Zatím nejsou k dispozici žádné produkty.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <span className="text-gray-400 text-sm">
                Zobrazeno {filteredProducts.length} z {products.length} produktů
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
