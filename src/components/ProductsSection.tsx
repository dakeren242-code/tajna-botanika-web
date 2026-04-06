import { useEffect, useState } from 'react';
import { supabase, Product } from '../lib/supabase';
import ProductCard from './ProductCard';
import { Loader2, Sparkles, Zap, Moon, Shuffle } from 'lucide-react';

type FilterId = 'all' | 'sativa' | 'indica' | 'hybrid';

const CATEGORIES = [
  {
    id: 'sativa' as FilterId,
    label: 'Sativa Dominant',
    description: 'Energizující · Kreativní · Povznášející',
    icon: Zap,
    color: 'amber',
    tagClasses: 'bg-amber-400/10 border-amber-400/30 text-amber-300 hover:bg-amber-400/20 hover:border-amber-400/60 hover:shadow-[0_0_24px_rgba(251,191,36,0.35)] hover:text-amber-200',
    activeClasses: 'bg-gradient-to-r from-amber-500 to-orange-400 text-black border-transparent shadow-[0_0_32px_rgba(251,191,36,0.5)]',
    headerGradient: 'from-amber-400 via-orange-300 to-yellow-200',
    glowClass: 'bg-amber-400/6',
    dividerClass: 'from-transparent via-amber-400/50 to-transparent',
    iconColor: 'text-amber-400',
    dotClass: 'bg-amber-400',
    badgeClasses: 'bg-amber-400/15 text-amber-300 border border-amber-400/30',
  },
  {
    id: 'indica' as FilterId,
    label: 'Indica Dominant',
    description: 'Uvolňující · Zklidňující · Noční klid',
    icon: Moon,
    color: 'sky',
    tagClasses: 'bg-sky-400/10 border-sky-400/30 text-sky-300 hover:bg-sky-400/20 hover:border-sky-400/60 hover:shadow-[0_0_24px_rgba(56,189,248,0.35)] hover:text-sky-200',
    activeClasses: 'bg-gradient-to-r from-sky-500 to-blue-400 text-white border-transparent shadow-[0_0_32px_rgba(56,189,248,0.5)]',
    headerGradient: 'from-sky-400 via-blue-300 to-cyan-200',
    glowClass: 'bg-sky-400/6',
    dividerClass: 'from-transparent via-sky-400/50 to-transparent',
    iconColor: 'text-sky-400',
    dotClass: 'bg-sky-400',
    badgeClasses: 'bg-sky-400/15 text-sky-300 border border-sky-400/30',
  },
  {
    id: 'hybrid' as FilterId,
    label: 'Hybrid',
    description: 'Vyvážený · Harmonický · Univerzální',
    icon: Shuffle,
    color: 'emerald',
    tagClasses: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/20 hover:border-emerald-400/60 hover:shadow-[0_0_24px_rgba(52,211,153,0.35)] hover:text-emerald-200',
    activeClasses: 'bg-gradient-to-r from-emerald-500 to-green-400 text-white border-transparent shadow-[0_0_32px_rgba(52,211,153,0.5)]',
    headerGradient: 'from-emerald-400 via-green-300 to-teal-200',
    glowClass: 'bg-emerald-400/6',
    dividerClass: 'from-transparent via-emerald-400/50 to-transparent',
    iconColor: 'text-emerald-400',
    dotClass: 'bg-emerald-400',
    badgeClasses: 'bg-emerald-400/15 text-emerald-300 border border-emerald-400/30',
  },
];

interface CategorySectionProps {
  category: typeof CATEGORIES[0];
  products: Product[];
}

function CategorySection({ category, products }: CategorySectionProps) {
  const Icon = category.icon;

  if (products.length === 0) return null;

  return (
    <div className="relative mb-20 last:mb-0">
      <div className={`absolute inset-0 ${category.glowClass} rounded-3xl blur-3xl pointer-events-none`} />

      <div className="relative">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className={`flex items-center gap-3 px-6 py-3 rounded-full border bg-black/60 backdrop-blur-sm ${category.tagClasses.split(' hover:')[0]}`}>
            <Icon className={`w-5 h-5 ${category.iconColor}`} />
            <span className={`font-black text-lg tracking-widest uppercase bg-gradient-to-r ${category.headerGradient} bg-clip-text text-transparent`}>
              {category.label}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${category.badgeClasses}`}>
              {products.length}
            </span>
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <p className="text-center text-sm text-gray-500 mb-8 tracking-wider uppercase">
          {category.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  useEffect(() => {
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

    loadProducts();
  }, []);

  const getProductsByCategory = (categoryId: string) =>
    products.filter((p) => p.category === categoryId);

  const visibleCategories = activeFilter === 'all'
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.id === activeFilter);

  if (loading) {
    return (
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="products" className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-80 h-80 bg-amber-400/4 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-sky-400/4 rounded-full blur-3xl" />
        <div className="absolute top-2/3 left-1/2 w-80 h-80 bg-emerald-400/4 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-white bg-clip-text text-transparent">
              NAŠE KOLEKCE
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Objevte jedinečné květy s precizně vyváženými profily.
            Každý produkt je certifikován a testován.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mb-16">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border transition-all duration-300 ${
              activeFilter === 'all'
                ? 'bg-white text-black border-transparent shadow-[0_0_28px_rgba(255,255,255,0.25)] scale-105'
                : 'bg-white/5 border-white/15 text-gray-400 hover:bg-white/10 hover:border-white/30 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Vše
          </button>

          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm border transition-all duration-300 ${
                  isActive
                    ? `${cat.activeClasses} scale-105`
                    : `${cat.tagClasses}`
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">
              Zatím nejsou k dispozici žádné produkty.
            </p>
          </div>
        ) : (
          <div>
            {visibleCategories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                products={getProductsByCategory(category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
