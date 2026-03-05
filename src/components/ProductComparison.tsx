import { useState } from 'react';
import { Check, X, Zap, Leaf, Sparkles, TrendingUp } from 'lucide-react';

export default function ProductComparison() {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([0, 1, 2]);

  const products = [
    {
      id: 0,
      name: 'Cosmic Dream',
      price: 799,
      thc: '25%',
      cbd: '2%',
      thcx: '35%',
      terpenes: 'Vysoké',
      effect: 'Indica Dominant',
      flavor: 'Sladký, Ovocný',
      grow: 'Indoor',
      popular: true,
    },
    {
      id: 1,
      name: 'Golden Haze',
      price: 699,
      thc: '22%',
      cbd: '1.5%',
      thcx: '30%',
      terpenes: 'Střední',
      effect: 'Sativa Dominant',
      flavor: 'Citrusový, Zemitý',
      grow: 'Indoor',
      popular: false,
    },
    {
      id: 2,
      name: 'Electric Lime',
      price: 899,
      thc: '28%',
      cbd: '3%',
      thcx: '40%',
      terpenes: 'Velmi vysoké',
      effect: 'Sativa Dominant',
      flavor: 'Citrus, Kořenitý',
      grow: 'Indoor',
      popular: true,
    },
    {
      id: 3,
      name: 'Sunset Bliss',
      price: 749,
      thc: '24%',
      cbd: '2.5%',
      thcx: '32%',
      terpenes: 'Vysoké',
      effect: 'Hybrid',
      flavor: 'Tropický, Sladký',
      grow: 'Indoor',
      popular: false,
    },
  ];

  const features = [
    { label: 'Cena', key: 'price', unit: 'Kč' },
    { label: 'THC', key: 'thc', icon: Zap },
    { label: 'CBD', key: 'cbd', icon: Leaf },
    { label: 'THC-X', key: 'thcx', icon: Sparkles },
    { label: 'Terpeny', key: 'terpenes', icon: Leaf },
    { label: 'Typ', key: 'effect', icon: TrendingUp },
    { label: 'Chuť', key: 'flavor', icon: Sparkles },
    { label: 'Pěstování', key: 'grow', icon: Leaf },
  ];

  const toggleProduct = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      if (selectedProducts.length > 2) {
        setSelectedProducts(selectedProducts.filter((id) => id !== productId));
      }
    } else {
      if (selectedProducts.length < 3) {
        setSelectedProducts([...selectedProducts, productId]);
      }
    }
  };

  const selectedData = products.filter((p) =>
    selectedProducts.includes(p.id)
  );

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black" />

      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 text-sm font-bold tracking-wider">
              INTERAKTIVNÍ NÁSTROJ
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
            Porovnejte{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Produkty
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Vyberte až 3 produkty a porovnejte jejich vlastnosti
          </p>
        </div>

        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          {products.map((product) => (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 ${
                selectedProducts.includes(product.id)
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white scale-105'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              } ${
                !selectedProducts.includes(product.id) &&
                selectedProducts.length >= 3
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              disabled={
                !selectedProducts.includes(product.id) &&
                selectedProducts.length >= 3
              }
              data-cursor-hover
            >
              {selectedProducts.includes(product.id) ? (
                <Check className="w-4 h-4 inline mr-1" />
              ) : (
                <X className="w-4 h-4 inline mr-1 opacity-0" />
              )}
              {product.name}
              {product.popular && (
                <span className="ml-2 text-xs">⭐</span>
              )}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `200px repeat(${selectedData.length}, 1fr)`,
              }}
            >
              <div className="sticky left-0 z-10" />
              {selectedData.map((product) => (
                <div
                  key={product.id}
                  className="relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 backdrop-blur-sm"
                  style={{
                    animation: 'fade-in-up 0.5s ease-out',
                  }}
                >
                  {product.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold">
                        ⭐ POPULÁRNÍ
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <h3 className="text-xl font-black text-white mb-2">
                      {product.name}
                    </h3>
                    <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-4">
                      {product.price} Kč
                    </div>
                    <button
                      className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm hover:scale-105 transition-all duration-300"
                      data-cursor-hover
                    >
                      PŘIDAT DO KOŠÍKU
                    </button>
                  </div>
                </div>
              ))}

              {features.map((feature, index) => (
                <>
                  <div
                    key={`label-${index}`}
                    className="sticky left-0 z-10 flex items-center gap-2 p-4 rounded-xl bg-black/80 backdrop-blur-sm border border-white/10"
                  >
                    {feature.icon && (
                      <feature.icon className="w-4 h-4 text-cyan-400" />
                    )}
                    <span className="text-white font-bold text-sm">
                      {feature.label}
                    </span>
                  </div>

                  {selectedData.map((product) => (
                    <div
                      key={`${product.id}-${index}`}
                      className="flex items-center justify-center p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-200"
                    >
                      <span className="text-gray-300 text-sm text-center">
                        {feature.unit
                          ? `${product[feature.key as keyof typeof product]} ${feature.unit}`
                          : product[feature.key as keyof typeof product]}
                      </span>
                    </div>
                  ))}
                </>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Všechny hodnoty jsou laboratorně ověřené a certifikované
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
