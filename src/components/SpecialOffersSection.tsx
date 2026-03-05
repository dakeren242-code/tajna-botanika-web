import { Package, Zap, Gift, TrendingUp } from 'lucide-react';

export default function SpecialOffersSection() {
  const offers = [
    {
      icon: Package,
      badge: 'NEJPRODÁVANĚJŠÍ',
      title: 'Startovní Balíček',
      subtitle: '3 různé odrůdy',
      originalPrice: 2400,
      price: 1999,
      savings: 401,
      description: 'Ideální pro začínající sběratele',
      items: ['3x prémiové květy', 'Certifikáty analýz', 'Dárkové balení'],
      gradient: 'from-purple-500/20 to-pink-500/20',
      borderColor: 'border-purple-400/30',
      badgeColor: 'bg-purple-500',
      popular: true,
    },
    {
      icon: Zap,
      badge: 'NEJLEPŠÍ HODNOTA',
      title: 'Premium Pack',
      subtitle: '5 top odrůd',
      originalPrice: 3900,
      price: 2999,
      savings: 901,
      description: 'Pro náročné milovníky',
      items: ['5x exkluzivní květy', 'Certifikáty analýz', 'Premium box'],
      gradient: 'from-yellow-500/20 to-orange-500/20',
      borderColor: 'border-yellow-400/30',
      badgeColor: 'bg-yellow-500',
      popular: false,
    },
    {
      icon: Gift,
      badge: 'LIMITOVANÁ EDICE',
      title: 'VIP Kolekce',
      subtitle: '10 nejlepších',
      originalPrice: 7500,
      price: 5499,
      savings: 2001,
      description: 'Kompletní sběratelská kolekce',
      items: ['10x premium květy', 'Botanická dokumentace', 'Luxusní dárkový set'],
      gradient: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-400/30',
      badgeColor: 'bg-green-500',
      popular: false,
    },
  ];

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black" />

      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-bold tracking-wider">
              SPECIÁLNÍ NABÍDKY
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
            Ušetřete s{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Bundle Balíčky
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Obohaťte svou sbírku více odrůdami za výhodnější cenu. Každý balíček obsahuje
            pečlivě vybrané produkty pro kompletní botanickou kolekci.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, index) => (
            <div
              key={index}
              className={`group relative rounded-3xl bg-gradient-to-br ${offer.gradient} border-2 ${offer.borderColor} backdrop-blur-xl hover:scale-105 transition-all duration-500 overflow-hidden ${
                offer.popular ? 'ring-4 ring-purple-500/30' : ''
              }`}
              data-cursor-hover
              style={{
                animation: 'slide-up-scale 0.8s ease-out forwards',
                animationDelay: `${index * 0.15}s`,
                opacity: 0,
              }}
            >
              {offer.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black rounded-full shadow-lg animate-pulse-gentle">
                    ⭐ NEJOBLÍBENĚJŠÍ
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />

              <div className="relative p-8">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${offer.badgeColor} mb-6`}
                >
                  <offer.icon className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-bold">
                    {offer.badge}
                  </span>
                </div>

                <h3 className="text-3xl font-black text-white mb-2">
                  {offer.title}
                </h3>
                <p className="text-gray-400 text-sm mb-6">{offer.subtitle}</p>

                <div className="mb-6">
                  <div className="flex items-end gap-3 mb-2">
                    <div className="text-5xl font-black text-white">
                      {offer.price}
                      <span className="text-xl text-gray-400 ml-1">Kč</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 line-through text-sm">
                      {offer.originalPrice} Kč
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                      Ušetříte {offer.savings} Kč
                    </span>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-6 italic">
                  {offer.description}
                </p>

                <div className="space-y-3 mb-8">
                  {offer.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                      <span className="text-gray-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-300 ${
                    offer.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-[0_0_40px_rgba(168,85,247,0.6)]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  } hover:scale-105`}
                >
                  PŘIDAT DO KOŠÍKU
                </button>
              </div>

              <div
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{
                  background: offer.popular
                    ? 'linear-gradient(135deg, #a855f7, #ec4899)'
                    : offer.badgeColor === 'bg-yellow-500'
                    ? 'linear-gradient(135deg, #eab308, #f97316)'
                    : 'linear-gradient(135deg, #22c55e, #10b981)',
                }}
              />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-4">
            Všechny balíčky obsahují bezplatné doručení a 30denní záruku vrácení
            peněz
          </p>
          <div className="inline-flex items-center gap-2 text-yellow-400 text-sm font-bold">
            <Zap className="w-4 h-4" />
            Omezená nabídka platná do vyprodání zásob
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-up-scale {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        @keyframes pulse-gentle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
