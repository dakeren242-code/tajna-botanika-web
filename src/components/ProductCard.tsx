import { ShoppingCart, Zap, Check, Star, Calendar } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useMetaTracking } from '../hooks/useMetaTracking';

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const [selectedGrams, setSelectedGrams] = useState('1g');
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { trackAddToCart } = useMetaTracking();

  const isBundle = product.category === 'bundle';
  const gramOptions = ['1g', '3g', '5g', '10g'];

  // Use product.price from DB as base (1g price),
  // scale for other gram options proportionally using the standard price map.
  // If you ever make prices fully dynamic per variant in the DB, replace this.
  const calculatePrice = (grams: string): number => {
    const priceMap: Record<string, number> = {
      '1g': 190,
      '3g': 490,
      '5g': 690,
      '10g': 1290,
    };
    return priceMap[grams] ?? product.price ?? 190;
  };

  const handleProductClick = () => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    console.log('product.id:', product.id);
    console.log('full product:', product);
    e.stopPropagation();

    if ((product.stock || 0) === 0) return;

    const grams = isBundle ? 'bundle' : selectedGrams;
    const price = isBundle ? product.price : calculatePrice(selectedGrams);

    await addToCart(product, grams);

    if (product.meta_catalog_id) {
      await trackAddToCart({
        contentId: product.meta_catalog_id,
        contentName: product.name,
        value: price,
        quantity: 1,
        currency: 'CZK',
      });
    } else if (import.meta.env.DEV) {
      console.warn('[Meta] AddToCart skipped: meta_catalog_id missing for', product.slug);
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="group relative cursor-pointer"
      data-cursor-hover
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleProductClick}
    >
      <div className="relative rounded-3xl overflow-hidden">
        <div
          className="relative bg-gradient-to-br from-zinc-900 to-black rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02]"
          style={{
            boxShadow: isHovered
              ? `0 25px 50px -12px ${product.glow_color}40, 0 0 60px ${product.glow_color}30`
              : '0 10px 30px -10px rgba(0,0,0,0.5)',
            WebkitTransform: 'translateZ(0)',
            transform: 'translateZ(0)',
            willChange: 'transform',
          }}
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at 50% 50%, ${product.glow_color}15, transparent 70%)`,
            }}
          />

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `linear-gradient(135deg, ${product.color_accent}10, transparent)`,
            }}
          />

          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {product.is_popular && !isBundle && (
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-lg animate-pulse">
                <Star className="w-4 h-4 text-black fill-black" />
                <span className="text-xs font-black text-black uppercase tracking-wide">Nejoblíbenější</span>
              </div>
            </div>
          )}

          {product.discount_percentage && product.discount_percentage > 0 && (
            <div className="absolute top-4 left-4 z-10">
              <div className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 rounded-full shadow-lg">
                <span className="text-xs font-black text-white uppercase tracking-wide">
                  -{product.discount_percentage}%
                </span>
              </div>
            </div>
          )}

          <div className="relative p-8">
            <div className="mb-6 h-64 flex items-center justify-center relative overflow-hidden rounded-2xl">
              <div
                className="absolute inset-0 rounded-2xl blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-500"
                style={{ backgroundColor: product.glow_color }}
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                background: `linear-gradient(135deg, ${product.color_accent}20, transparent)`
              }} />

              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="relative w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="relative">
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center text-6xl font-black transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12"
                    style={{
                      background: `linear-gradient(135deg, ${product.color_accent}, ${product.glow_color})`,
                      boxShadow: `0 0 40px ${product.glow_color}60`,
                    }}
                  >
                    <span className="text-black drop-shadow-lg">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-black text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-yellow-400 group-hover:bg-clip-text transition-all duration-300">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm line-clamp-2">
                  {product.description}
                </p>
              </div>


              {isBundle && product.is_subscription && (
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-400">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">Týdenní předplatné</span>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-4">
                {!isBundle && (
                  <div className="w-full">
                    <div className="grid grid-cols-4 gap-2 mb-4" onClick={(e) => e.stopPropagation()}>
                      {gramOptions.map((option) => (
                        <button
                          key={option}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGrams(option);
                          }}
                          className={`px-2 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                            selectedGrams === option
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-center">
                  {product.original_price && product.original_price > product.price && (
                    <div className="text-lg text-gray-500 line-through mb-1">
                      {product.original_price.toFixed(2)} Kč
                    </div>
                  )}
                  <div className="text-3xl font-black text-white">
                    {isBundle ? product.price.toFixed(2) : calculatePrice(selectedGrams).toFixed(2)}
                    <span className="text-lg text-gray-400 ml-2">Kč</span>
                  </div>
                  {!isBundle && (
                    <div className="text-xs text-gray-500 mt-1">
                      190.00 Kč / 1g
                    </div>
                  )}
                  {product.original_price && product.original_price > product.price && (
                    <div className="text-sm text-emerald-400 font-bold mt-1">
                      Ušetříte {(product.original_price - product.price).toFixed(2)} Kč
                    </div>
                  )}
                  <div className={`text-xs font-semibold mt-1 ${
                    (product.stock || 0) === 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {(product.stock || 0) === 0 ? 'Vyprodáno' : 'Skladem 100+ ks'}
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={(product.stock || 0) === 0}
                  className="relative px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 group/btn hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{
                    backgroundColor: added ? '#10b981' : product.color_accent,
                    boxShadow: isHovered && (product.stock || 0) > 0 ? `0 0 30px ${product.glow_color}60` : 'none',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-all duration-500 shimmer-btn"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${product.glow_color}50, transparent)`,
                    }}
                  />
                  <div
                    className="absolute -inset-1 rounded-full opacity-0 group-hover/btn:opacity-100 transition-all duration-300 blur-lg"
                    style={{ backgroundColor: product.glow_color }}
                  />
                  <span className="relative z-10 flex items-center gap-2 text-black">
                    {added ? (
                      <>
                        <Check className="w-4 h-4" />
                        PŘIDÁNO
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        ZOBRAZIT VZOREK
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              boxShadow: `inset 0 0 60px ${product.glow_color}20`,
              border: `1px solid ${product.glow_color}30`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shimmer-btn {
          0% { -webkit-transform: translateX(-100%); transform: translateX(-100%); }
          100% { -webkit-transform: translateX(100%); transform: translateX(100%); }
        }
        .shimmer-btn {
          -webkit-animation: shimmer-btn 1.5s ease-in-out infinite;
          animation: shimmer-btn 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}