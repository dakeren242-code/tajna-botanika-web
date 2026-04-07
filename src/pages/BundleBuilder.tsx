import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Minus, ShoppingCart, Sparkles, Gift, ArrowRight, Star, Leaf } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

type BundleTier = 'discovery' | 'collector' | 'complete';

const bundleConfig: Record<BundleTier, {
  name: string;
  subtitle: string;
  requiredCount: number;
  gramAmount: string;
  originalPricePer: number;
  bundlePrice: number;
  savingsPercent: number;
  color: string;
  borderColor: string;
  features: string[];
}> = {
  discovery: {
    name: 'Discovery Box',
    subtitle: '3 odrůdy po 1g',
    requiredCount: 3,
    gramAmount: '1g',
    originalPricePer: 190,
    bundlePrice: 449,
    savingsPercent: 21,
    color: 'from-violet-500/15 to-fuchsia-500/15',
    borderColor: 'border-violet-400/25',
    features: ['Dárkové balení', 'Certifikáty analýz', 'Průvodce odrůdami'],
  },
  collector: {
    name: 'Sběratelský Set',
    subtitle: '5 odrůd po 3g',
    requiredCount: 5,
    gramAmount: '3g',
    originalPricePer: 490,
    bundlePrice: 1799,
    savingsPercent: 27,
    color: 'from-amber-500/15 to-orange-500/15',
    borderColor: 'border-amber-400/25',
    features: ['Premium magnetická krabice', 'Kompletní dokumentace', 'Sběratelská karta'],
  },
  complete: {
    name: 'Kompletní Kolekce',
    subtitle: 'Všech 9 odrůd po 3g',
    requiredCount: 9,
    gramAmount: '3g',
    originalPricePer: 490,
    bundlePrice: 2999,
    savingsPercent: 32,
    color: 'from-emerald-500/15 to-teal-500/15',
    borderColor: 'border-emerald-400/25',
    features: ['Luxusní dárková kazeta', 'Botanická mapa terpenů', 'Certifikát autenticity', 'Doprava zdarma'],
  },
};

// Curated flavor tags for each product
const flavorTags: Record<string, { flavor: string; type: string; intensity: number }> = {
  'amnesia': { flavor: 'Citrusová, zemitá', type: 'Sativa', intensity: 4 },
  'bubble-gum': { flavor: 'Sladká, ovocná', type: 'Indica', intensity: 3 },
  'forbidden-fruit': { flavor: 'Tropická, exotická', type: 'Indica', intensity: 5 },
  'gelato': { flavor: 'Sladká, krémová', type: 'Hybrid', intensity: 4 },
  'golden-nugget': { flavor: 'Kořenitá, bylinková', type: 'Sativa', intensity: 4 },
  'lemon-cherry-gelato': { flavor: 'Citronová, višňová', type: 'Hybrid', intensity: 5 },
  'pineapple-zkittlez': { flavor: 'Ananasová, sladká', type: 'Indica', intensity: 3 },
  'blue-dream': { flavor: 'Tropická, svěží', type: 'Sativa', intensity: 4 },
  'wedding-cake': { flavor: 'Vanilková, sladká', type: 'Hybrid', intensity: 5 },
};

const typeColors: Record<string, string> = {
  'Sativa': 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'Indica': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Hybrid': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
};

export default function BundleBuilder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedTier, setSelectedTier] = useState<BundleTier>(
    (searchParams.get('tier') as BundleTier) || 'collector'
  );
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [added, setAdded] = useState(false);

  const config = bundleConfig[selectedTier];

  useEffect(() => {
    document.title = `${config.name} — Sestavte si balíček | Tajná Botanika`;
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('name');
      if (data) setProducts(data);
    };
    fetchProducts();
  }, [config.name]);

  // Auto-select all for complete tier
  useEffect(() => {
    if (selectedTier === 'complete' && products.length > 0) {
      setSelectedProducts(new Set(products.map(p => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  }, [selectedTier, products]);

  const toggleProduct = (productId: string) => {
    if (selectedTier === 'complete') return; // all required
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else if (next.size < config.requiredCount) {
        next.add(productId);
      }
      return next;
    });
  };

  const isComplete = selectedProducts.size === config.requiredCount;

  const savings = useMemo(() => {
    const original = config.requiredCount * config.originalPricePer;
    return original - config.bundlePrice;
  }, [config]);

  const handleAddToCart = () => {
    const selected = products.filter(p => selectedProducts.has(p.id));
    selected.forEach(product => {
      addToCart(product, config.gramAmount, 1);
    });
    setAdded(true);
    setTimeout(() => {
      navigate('/cart');
    }, 1200);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-400/20 mb-4">
            <Gift className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300 text-sm font-bold tracking-wider">SESTAVTE SI BALÍČEK</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            Vyberte si{' '}
            <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
              své odrůdy
            </span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Sestavte si vlastní balíček z našich prémiových odrůd a ušetřete až {config.savingsPercent}%
          </p>
        </div>

        {/* Tier selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(Object.keys(bundleConfig) as BundleTier[]).map(tier => {
            const c = bundleConfig[tier];
            const active = tier === selectedTier;
            return (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-5 py-3 rounded-xl border text-sm font-bold transition-all duration-300 ${
                  active
                    ? 'bg-white/10 border-white/20 text-white scale-105 shadow-lg'
                    : 'bg-white/[0.02] border-white/[0.06] text-gray-400 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <span className="block text-base">{c.name}</span>
                <span className="block text-xs mt-0.5 opacity-70">{c.subtitle} · -{c.savingsPercent}%</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product grid — 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">
                {selectedTier === 'complete' ? 'Všechny odrůdy v balíčku' : `Vyberte ${config.requiredCount} odrůd`}
              </h2>
              <span className="text-sm text-gray-500">
                {selectedProducts.size}/{config.requiredCount} vybráno
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map(product => {
                const isSelected = selectedProducts.has(product.id);
                const tags = flavorTags[product.slug] || { flavor: '', type: 'Hybrid', intensity: 3 };
                const isFull = selectedProducts.size >= config.requiredCount && !isSelected;

                return (
                  <button
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    disabled={selectedTier === 'complete' || isFull}
                    className={`relative flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-400/30 ring-1 ring-emerald-400/20'
                        : isFull
                        ? 'bg-white/[0.01] border-white/[0.04] opacity-40 cursor-not-allowed'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.12]'
                    } ${selectedTier === 'complete' ? 'cursor-default' : ''}`}
                  >
                    {/* Product image */}
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-contain flex-shrink-0 rounded-lg"
                        loading="lazy"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-bold text-sm truncate">{product.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${typeColors[tags.type]}`}>
                          {tags.type}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs truncate">{tags.flavor}</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= tags.intensity ? 'bg-emerald-400' : 'bg-white/10'}`} />
                        ))}
                      </div>
                    </div>

                    {/* Selection indicator */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/[0.05] border border-white/[0.1]'
                    }`}>
                      {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 text-gray-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar — order summary */}
          <div className="lg:col-span-1">
            <div className={`sticky top-24 rounded-2xl bg-gradient-to-br ${config.color} border ${config.borderColor} p-6`}>
              <h3 className="text-xl font-black text-white mb-1">{config.name}</h3>
              <p className="text-gray-400 text-sm mb-5">{config.subtitle}</p>

              {/* Selected products list */}
              <div className="space-y-2 mb-5 max-h-48 overflow-y-auto">
                {products.filter(p => selectedProducts.has(p.id)).map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-sm">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300 truncate">{p.name}</span>
                    <span className="text-gray-600 text-xs ml-auto">{config.gramAmount}</span>
                  </div>
                ))}
                {Array.from({ length: Math.max(0, config.requiredCount - selectedProducts.size) }).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-2 text-sm">
                    <div className="w-3.5 h-3.5 rounded-full border border-dashed border-gray-600 flex-shrink-0" />
                    <span className="text-gray-600 italic">Vyberte odrůdu...</span>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="space-y-1.5 mb-5 pt-4 border-t border-white/[0.06]">
                {config.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                    <Star className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>

              {/* Price */}
              <div className="mb-5 pt-4 border-t border-white/[0.06]">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black text-white">{config.bundlePrice.toLocaleString('cs-CZ')}</span>
                  <span className="text-gray-400">Kč</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 line-through text-sm">
                    {(config.requiredCount * config.originalPricePer).toLocaleString('cs-CZ')} Kč
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                    Ušetříte {savings} Kč
                  </span>
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={handleAddToCart}
                disabled={!isComplete || added}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                  added
                    ? 'bg-emerald-500 text-white'
                    : isComplete
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02]'
                    : 'bg-white/[0.06] text-gray-500 cursor-not-allowed'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    Přidáno! Přesměrovávám...
                  </>
                ) : isComplete ? (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Přidat do košíku
                  </>
                ) : (
                  <>
                    Vyberte ještě {config.requiredCount - selectedProducts.size} {config.requiredCount - selectedProducts.size === 1 ? 'odrůdu' : 'odrůdy'}
                  </>
                )}
              </button>

              {!isComplete && (
                <p className="text-gray-600 text-xs text-center mt-3">
                  Tip: Doporučujeme mix Indica + Sativa pro vyvážený zážitek
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
