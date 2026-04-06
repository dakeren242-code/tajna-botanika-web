import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Zap, Leaf, Info, AlertTriangle, Check, Users, TrendingUp, Star } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { trackEvent } from '../hooks/useTracking';
import Footer from './Footer';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGramage, setSelectedGramage] = useState<number>(1);
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProduct = async () => {
      // Try slug first, fall back to id (for UUID-based links)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .maybeSingle()
        .then(async (res) => {
          if (res.data) return res;
          return supabase.from('products').select('*').eq('id', slug).maybeSingle();
        });

      if (error || !data) {
        navigate('/');
      } else {
        setProduct(data);

        const defaultPrice = (() => {
          const prices: { [key: number]: number } = { 1: 190, 3: 490, 5: 690, 10: 1290 };
          return prices[1];
        })();
        trackEvent('ViewContent', {
          content_name: data.name,
          content_ids: [data.id],
          content_type: 'product',
          value: defaultPrice,
          currency: 'CZK',
        });

        const { data: related } = await supabase
          .from('products')
          .select('*')
          .neq('id', slug)
          .limit(3);

        if (related) {
          setRelatedProducts(related);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [slug, navigate]);

  const incrementQuantity = () => {
    if (product && quantity < (product.stock || 0)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const getGramagePrice = (gramage: number) => {
    const prices: { [key: number]: number } = {
      1: 190,
      3: 490,
      5: 690,
      10: 1290,
    };
    return prices[gramage] || 0;
  };

  const calculatePrice = () => {
    return getGramagePrice(selectedGramage) * quantity;
  };

  const handleAddToCart = () => {
    if (product && (product.stock || 0) > 0 && quantity <= (product.stock || 0)) {
      const gramAmount = `${selectedGramage}g`;
      addToCart(product, gramAmount, quantity);

      trackEvent('AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: calculatePrice(),
        currency: 'CZK',
        contents: [{ id: product.id, quantity }],
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-gray-400">Načítání...</div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <main className="relative z-10 pt-24">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => {
              navigate('/', { state: { scrollToProducts: true } });
            }}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-950/40 to-emerald-950/40 border-2 border-green-500/30 rounded-full hover:border-green-400/50 hover:bg-gradient-to-r hover:from-green-900/50 hover:to-emerald-900/50 transition-all duration-500 hover:scale-110 hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] backdrop-blur-xl"
            data-cursor-hover
          >
            <div className="relative">
              <ArrowLeft className="w-5 h-5 text-green-300 group-hover:text-green-200 transition-colors duration-300 group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-green-400 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
            </div>
            <span className="text-green-200 font-semibold group-hover:text-green-100 transition-colors duration-300">
              Zpět na produkty
            </span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="flex items-center justify-center relative min-h-[600px]">
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-60"
                style={{
                  backgroundColor: product.glow_color || product.color_accent,
                  filter: 'blur(100px)',
                }}
              />
              <div className="relative z-10 flex items-center justify-center w-full h-full">
                {product.image_url && (
                  <div
                    className="w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden"
                    style={{
                      boxShadow: `0 0 80px ${product.glow_color || product.color_accent}60`,
                      border: `3px solid ${product.glow_color || product.color_accent}40`,
                    }}
                  >
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col justify-center space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {product.featured && (
                    <span className="px-4 py-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full text-xs font-bold text-yellow-300">
                      FEATURED PRODUCT
                    </span>
                  )}
                </div>
                <h1 className="text-5xl lg:text-6xl font-black mb-4 bg-gradient-to-r from-white to-yellow-400 bg-clip-text text-transparent">
                  {product.name}
                </h1>
                <div className="text-lg text-gray-300 leading-relaxed space-y-3 whitespace-pre-line">
                  {product.description?.split('\n').map((paragraph: string, idx: number) => (
                    <p key={idx} dangerouslySetInnerHTML={{ __html: paragraph }} />
                  ))}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl">
                <h3 className="text-sm font-bold text-gray-400 mb-4 tracking-wider">CANNABINOID PROFIL</h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.thc_x_percent !== null && product.thc_x_percent !== undefined && (
                    <div className="group p-5 bg-gradient-to-br from-yellow-500/25 to-yellow-600/15 border border-yellow-400/40 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 cursor-pointer">
                      <div className="text-yellow-400 text-xs font-bold mb-2 tracking-wider">THC-X</div>
                      <div className="text-white font-black text-3xl group-hover:text-yellow-100 transition-colors">{product.thc_x_percent}%</div>
                    </div>
                  )}
                  {product.thc_percent !== null && product.thc_percent !== undefined && (
                    <div className="group p-5 bg-gradient-to-br from-green-500/25 to-green-600/15 border border-green-400/40 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 cursor-pointer">
                      <div className="text-green-400 text-xs font-bold mb-2 tracking-wider">THC</div>
                      <div className="text-white font-black text-3xl group-hover:text-green-100 transition-colors">{product.thc_percent}%</div>
                    </div>
                  )}
                  {product.cbd_percent !== null && product.cbd_percent !== undefined && (
                    <div className="group p-5 bg-gradient-to-br from-cyan-500/25 to-cyan-600/15 border border-cyan-400/40 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 cursor-pointer">
                      <div className="text-cyan-400 text-xs font-bold mb-2 tracking-wider">CBD</div>
                      <div className="text-white font-black text-3xl group-hover:text-cyan-100 transition-colors">{product.cbd_percent}%</div>
                    </div>
                  )}
                  {product.cbg_percent !== null && product.cbg_percent !== undefined && (
                    <div className="group p-5 bg-gradient-to-br from-orange-500/25 to-amber-600/15 border border-orange-400/40 rounded-xl hover:scale-105 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 cursor-pointer">
                      <div className="text-orange-400 text-xs font-bold mb-2 tracking-wider">CBG</div>
                      <div className="text-white font-black text-3xl group-hover:text-orange-100 transition-colors">{product.cbg_percent}%</div>
                    </div>
                  )}
                </div>
              </div>

              {product.flavor_profile && (
                <div className="p-6 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl">
                  <div className="text-gray-400 text-sm mb-2">Aromatický profil</div>
                  <div className="text-white font-bold text-lg">{product.flavor_profile}</div>
                </div>
              )}

              {product.effects && product.effects.length > 0 && (
                <div className="p-6 bg-gradient-to-r from-white/5 to-transparent border border-white/10 rounded-2xl">
                  <div className="flex items-start gap-3">
                    <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                    <div>
                      <div className="text-gray-400 text-sm mb-2">Botanický Profil</div>
                      <div className="text-white font-bold text-lg">
                        {Array.isArray(product.effects) ? product.effects.join(', ') : product.effects}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6 pt-8 border-t border-white/10">
                <div>
                  <div className="text-gray-400 text-sm mb-3 font-semibold">VYBERTE GRAMÁŽ</div>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 3, 5, 10].map((gram) => (
                      <button
                        key={gram}
                        onClick={() => setSelectedGramage(gram)}
                        className={`px-3 py-4 rounded-xl font-bold transition-all duration-300 ${
                          selectedGramage === gram
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black scale-105 shadow-lg shadow-yellow-500/30'
                            : 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:scale-105'
                        }`}
                      >
                        <div className="text-lg">{gram}g</div>
                        <div className={`text-xs mt-1 ${selectedGramage === gram ? 'text-black/70' : 'text-gray-400'}`}>
                          {getGramagePrice(gram)} Kč
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-sm mb-3 font-semibold">POČET</div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      -
                    </button>
                    <div className="flex-1 text-center">
                      <div className="text-3xl font-black text-white">{quantity}</div>
                    </div>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= 100}
                      className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xl hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-stretch pt-4 space-y-6">
                  <div className="text-center">
                    <div className="text-gray-400 text-sm mb-2">Celková cena</div>
                    <div className="text-5xl font-black text-white">
                      {calculatePrice().toFixed(2)}
                      <span className="text-2xl text-gray-400 ml-2">Kč</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      {(product.stock || 0) > 0 ? (
                        <div className="flex items-center justify-center gap-2 text-green-400">
                          <Leaf className="w-4 h-4" />
                          <span>Skladem: 100+ ks</span>
                        </div>
                      ) : (
                        <span className="text-red-400">Vyprodáno</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleAddToCart}
                      disabled={(product.stock || 0) === 0}
                      className="relative px-12 py-5 rounded-full font-bold text-lg transition-all duration-300 overflow-hidden hover:scale-105 group/btn disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      style={{
                        backgroundColor: added ? '#10b981' : (product.glow_color || product.color_accent || '#ec4899'),
                        boxShadow: (product.stock || 0) > 0 ? `0 0 40px ${product.glow_color || product.color_accent || '#ec4899'}60` : 'none',
                      }}
                    >
                      <div
                        className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-all duration-500 shimmer-effect"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${product.glow_color || product.color_accent || '#ec4899'}40, transparent)`,
                        }}
                      />
                      <div
                        className="absolute -inset-1 rounded-full opacity-0 group-hover/btn:opacity-100 transition-all duration-300 blur-xl"
                        style={{
                          backgroundColor: product.glow_color || product.color_accent || '#ec4899',
                        }}
                      />
                      <span className="relative z-10 flex items-center justify-center gap-3 text-white font-black uppercase tracking-wider">
                        {added ? (
                          <>
                            <Check className="w-5 h-5" />
                            PŘIDÁNO DO KOŠÍKU
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            PŘIDAT DO KOŠÍKU
                          </>
                        )}
                      </span>
                    </button>
                  </div>

                  <style>{`
                    @keyframes shimmer {
                      0% {
                        transform: translateX(-100%);
                      }
                      100% {
                        transform: translateX(100%);
                      }
                    }

                    .shimmer-effect {
                      animation: shimmer 1.5s ease-in-out infinite;
                    }
                  `}</style>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-black mb-4" style={{ color: product.color_accent }}>
                ✓
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Prémiová Kvalita</h3>
              <p className="text-gray-400 text-sm">Pečlivě vybrán a testován v nezávislých laboratořích pro absolutní jistotu.</p>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-black mb-4" style={{ color: product.color_accent }}>
                🔬
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Certifikováno</h3>
              <p className="text-gray-400 text-sm">Plná transparentnost složení a původu. Všechny hodnoty ověřeny laboratorně.</p>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-black mb-4" style={{ color: product.color_accent }}>
                ⚡
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Unikátní Složení</h3>
              <p className="text-gray-400 text-sm">Jedinečný profil kanabinoidů a terpénů. Vzácná kombinace pro sběratele.</p>
            </div>

            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
              <div className="text-4xl font-black mb-4" style={{ color: product.color_accent }}>
                ⚙️
              </div>
              <h3 className="text-lg font-bold mb-2 text-white">Vynikající Profil</h3>
              <p className="text-gray-400 text-sm">Precizně vyvážené aróma, chuť a konzistence. Sběratelský kousek vysoké kvality.</p>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <div className="mt-20 border-t border-white/10 pt-20">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 backdrop-blur-xl">
                  <Users className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span className="text-emerald-300 text-sm font-bold tracking-wider">
                    ŽIVÁ STATISTIKA
                  </span>
                  <TrendingUp className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <h3 className="text-4xl md:text-5xl font-black text-white mb-4">
                  Zákazníci také kupují
                </h3>
                <p className="text-lg text-gray-400">
                  Oblíbené kombinace od našich zákazníků
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedProducts.map((relatedProduct, idx) => (
                  <div
                    key={relatedProduct.id}
                    onClick={() => navigate(`/product/${relatedProduct.id}`)}
                    className="group relative p-6 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl hover:border-emerald-400/50 hover:bg-white/10 transition-all duration-500 cursor-pointer hover:scale-105"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/40 rounded-full backdrop-blur-xl">
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-300 text-xs font-bold">
                        AKTIVNÍ
                      </span>
                    </div>

                    <div className="mb-4 relative">
                      <div
                        className="absolute inset-0 rounded-xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"
                        style={{ backgroundColor: relatedProduct.glow_color }}
                      />
                      {relatedProduct.image_url && (
                        <img
                          src={relatedProduct.image_url}
                          alt={relatedProduct.name}
                          className="relative w-full object-cover rounded-xl"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-gray-400 text-xs ml-2">
                        ({Math.floor(Math.random() * 50 + 120)} recenzí)
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                      {relatedProduct.name}
                    </h4>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/40 rounded-lg">
                        <Leaf className="w-4 h-4 text-green-400" />
                        <span className="text-green-300 text-xs font-bold">
                          Skladem
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 border border-orange-400/40 rounded-lg animate-pulse">
                        <div className="w-2 h-2 bg-orange-400 rounded-full" />
                        <span className="text-orange-300 text-xs font-bold">
                          {Math.floor(Math.random() * 15 + 5)} lidí právě nakupuje
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div>
                        <div className="text-gray-400 text-xs mb-1">Od</div>
                        <div className="text-2xl font-black text-white">
                          190 <span className="text-sm text-gray-400">Kč</span>
                        </div>
                      </div>
                      <div
                        className="px-6 py-3 rounded-full font-bold text-sm text-white group-hover:scale-110 transition-transform shadow-lg"
                        style={{
                          backgroundColor: relatedProduct.color_accent,
                          boxShadow: `0 0 20px ${relatedProduct.glow_color}40`
                        }}
                      >
                        Zobrazit
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-20 max-w-4xl mx-auto space-y-8">
            <div className="p-8 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-400/20 rounded-3xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-yellow-400/20 rounded-xl">
                  <Info className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white mb-3">Co je to THC-X?</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Vzácný syntetický kanabinoid s unikátními vlastnostmi. Horká novinka v konopné sféře a cenný přírůstek do každé sběratelské kolekce.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-400/20 rounded-3xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-red-400/20 rounded-xl flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white">UPOZORNĚNÍ</h3>
                  <div className="space-y-3 text-gray-300 leading-relaxed">
                    <p>
                      Produkt v souladu se zákonem č. 167/1998 Sb. Balení obsahuje konopný květ s obsahem THC méně než 1 %.
                      Tento výrobek není určen ke konzumaci samostatně ani ve směsi s jinými látkami. Také neslouží ke spalování
                      či kouření. Jedná se o sběratelský předmět, který slouží k účelům průmyslovým, technickým a zahradnickým.
                      Produkt podléhá přirozenému úbytku hmotnosti. Uchovávejte mimo dosah dětí a mladistvých.
                    </p>
                    <p>
                      Výrobek splňuje všechny legislativní podmínky prodeje. Jeho hodnoty se drží v požadovaném rozmezí norem
                      a je pravidelně testován v certifikovaných laboratořích.
                    </p>
                    <p className="font-semibold text-white">
                      Nikoho nenabádáme ke konzumaci či užívání produktu! Produkt je prodáván pouze ke sběratelským,
                      technickým či zahradnickým účelům. Koupí produktu toto zákazník stvrzuje.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <span className="px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full text-sm font-bold text-red-300">
                        Na Slovensko neposíláme
                      </span>
                      <span className="px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full text-sm font-bold text-red-300">
                        Legální pouze v ČR
                      </span>
                      <span className="px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-full text-sm font-bold text-red-300">
                        Zákaz prodeje mladším 18 let
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-32 border-t border-white/10 pt-32">
            <div className="text-center mb-20">
              <div className="inline-block mb-6 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20">
                <span className="text-yellow-400 text-sm font-bold tracking-wider">
                  DALŠÍ PRODUKTY
                </span>
              </div>
              <h3 className="text-5xl md:text-6xl font-black mb-6 text-white">
                Objevte Více{' '}
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                  Prémiových Květů
                </span>
              </h3>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Vrátit se na hlavní stránku a vybrat si další produkty z naší exkluzivní kolekce.
              </p>

              <button
                onClick={() => navigate('/')}
                className="mt-8 px-12 py-4 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold text-lg rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,215,0,0.6)] transition-all duration-300"
              >
                Zpět na Kolekci
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
