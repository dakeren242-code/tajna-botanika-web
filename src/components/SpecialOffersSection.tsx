import { Package, Zap, Crown, TrendingUp, Check, Star, Gift, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SpecialOffersSection() {
  const navigate = useNavigate();

  const offers = [
    {
      icon: Package,
      badge: 'OBLÍBENÝ START',
      title: 'Discovery Box',
      subtitle: 'Poznejte 3 odrůdy',
      weight: '3× 1g',
      tier: 'discovery',
      originalPrice: 570, // 3 × 190
      price: 449,
      savings: 121,
      savingsPercent: 21,
      description: 'Ideální pro prvního zákazníka — ochutnejte tři různé odrůdy a najděte svůj favorit.',
      items: [
        '3× různé prémiové květy (1g)',
        'Laboratorní certifikáty ke každé odrůdě',
        'Elegantní dárkové balení',
        'Průvodce odrůdami s popisem profilů',
      ],
      gradient: 'from-violet-500/10 to-fuchsia-500/10',
      borderColor: 'border-violet-400/20',
      accentColor: '#a78bfa',
      badgeBg: 'bg-violet-500/90',
      popular: false,
    },
    {
      icon: Crown,
      badge: 'NEJLEPŠÍ HODNOTA',
      title: 'Sběratelský Set',
      subtitle: '5 top odrůd po 3g',
      weight: '5× 3g',
      tier: 'collector',
      originalPrice: 2450, // 5 × 490
      price: 1799,
      savings: 651,
      savingsPercent: 27,
      description: 'Naše nejprodávanější nabídka. Pět ručně vybraných odrůd ve větší gramáži — pro skutečné znalce.',
      items: [
        '5× exkluzivní květy (3g)',
        'Kompletní laboratorní dokumentace',
        'Premium magnetická krabice',
        'Sběratelská karta s číslem edice',
        'Osobní doporučení dalších odrůd',
      ],
      gradient: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-amber-400/25',
      accentColor: '#fbbf24',
      badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      popular: true,
    },
    {
      icon: Star,
      badge: 'VIP EDICE',
      title: 'Kompletní Kolekce',
      subtitle: 'Všech 9 odrůd',
      weight: '9× 3g',
      tier: 'complete',
      originalPrice: 4410, // 9 × 490
      price: 2999,
      savings: 1411,
      savingsPercent: 32,
      description: 'Kompletní kolekce všech našich odrůd. Limitovaný set pro pravé sběratele — každý balíček je číslovaný.',
      items: [
        '9× kompletní řada květů (3g)',
        'Veškerá laboratorní dokumentace',
        'Luxusní dárková kazeta s magnetem',
        'Botanická mapa profilů a terpenů',
        'Certifikát autenticity s číslem',
        'Prioritní doprava zdarma',
      ],
      gradient: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-emerald-400/20',
      accentColor: '#34d399',
      badgeBg: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      popular: false,
    },
  ];

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <Gift className="w-4 h-4 text-amber-400" />
            <span className="text-amber-300/90 text-sm font-semibold tracking-wider">
              VÝHODNÉ SETY
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 text-white">
            Ušetřete s{' '}
            <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-amber-400 bg-clip-text text-transparent">
              Bundle Balíčky
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Čím více odrůd, tím větší sleva. Každý balíček obsahuje
            pečlivě vybrané produkty s kompletní dokumentací.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-5 items-stretch">
          {offers.map((offer, index) => (
            <div
              key={index}
              className={`group relative rounded-2xl bg-white/[0.02] border ${offer.borderColor} backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-700 overflow-hidden flex flex-col ${
                offer.popular ? 'lg:scale-105 ring-1 ring-amber-400/20' : ''
              }`}
              data-cursor-hover
              style={{
                animation: 'offer-reveal 0.7s ease-out forwards',
                animationDelay: `${index * 0.12}s`,
                opacity: 0,
              }}
            >
              {/* Popular badge */}
              {offer.popular && (
                <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/80 to-transparent" />
              )}

              <div className="relative p-7 flex flex-col flex-1">
                {/* Badge */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${offer.badgeBg} text-white text-xs font-bold tracking-wide`}>
                    <offer.icon className="w-3.5 h-3.5" />
                    {offer.badge}
                  </div>
                  {offer.popular && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      DOPORUČUJEME
                    </div>
                  )}
                </div>

                {/* Title + subtitle */}
                <h3 className="text-2xl font-black text-white mb-1">
                  {offer.title}
                </h3>
                <p className="text-gray-500 text-sm mb-5">{offer.subtitle} · {offer.weight}</p>

                {/* Price block */}
                <div className="mb-5 pb-5 border-b border-white/[0.06]">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-4xl font-black text-white">{offer.price.toLocaleString('cs-CZ')}</span>
                    <span className="text-lg text-gray-500">Kč</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 line-through text-sm">
                      {offer.originalPrice.toLocaleString('cs-CZ')} Kč
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold">
                      -{offer.savingsPercent}% · Ušetříte {offer.savings} Kč
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-5 leading-relaxed">
                  {offer.description}
                </p>

                {/* Items checklist */}
                <div className="space-y-2.5 mb-7 flex-1">
                  {offer.items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-4.5 h-4.5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${offer.accentColor}18` }}>
                        <Check className="w-3 h-3" style={{ color: offer.accentColor }} />
                      </div>
                      <span className="text-gray-300 text-sm leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate(`/balicek?tier=${offer.tier}`)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-500 ${
                    offer.popular
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] hover:scale-[1.02]'
                      : 'bg-white/[0.06] text-white/80 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  {offer.popular ? 'VYBRAT ODRŮDY →' : 'SESTAVIT BALÍČEK →'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-14 text-center space-y-3">
          <p className="text-gray-500 text-sm">
            Všechny balíčky obsahují bezplatné doručení a 30denní záruku spokojenosti
          </p>
          <div className="inline-flex items-center gap-2 text-amber-400/80 text-sm font-semibold">
            <TrendingUp className="w-4 h-4" />
            Slevové kódy lze kombinovat s bundle cenami
          </div>
        </div>
      </div>

      <style>{`
        @keyframes offer-reveal {
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
