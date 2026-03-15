import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Martin K.',
      rating: 5,
      text: 'Absolutně skvělá kvalita! Každý květný detail je vidět. Botanický profil přesně jak bylo popsáno. Už jsem si objednal znovu.',
      product: 'Cosmic Dream',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      name: 'Jana P.',
      rating: 5,
      text: 'Konečně produkt, který drží slovo. Laboratorní testy jsou vidět na první pohled. Úžasná chuť a aroma!',
      product: 'Golden Haze',
      gradient: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      name: 'Petr S.',
      rating: 5,
      text: 'Nejlepší co jsem kdy měl. Rychlé doručení, diskrétní balení a produkt premium kvality. Doporučuji všem!',
      product: 'Electric Lime',
      gradient: 'from-green-500/20 to-emerald-500/20',
    },
    {
      name: 'Lucie M.',
      rating: 5,
      text: 'Precizní balení, skvělá komunikace a produkt, který překonal všechna očekávání. Budu nakupovat pravidelně.',
      product: 'Sunset Bliss',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
  ];

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />

      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20">
            <span className="text-yellow-400 text-sm font-bold tracking-wider">
              CO ŘÍKAJÍ ZÁKAZNÍCI
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
            Spokojení{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
              Zákazníci
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Přidejte se k tisícům spokojených zákazníků, kteří již objevili
            prémiovou kvalitu našich produktů.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl bg-gradient-to-br ${testimonial.gradient} border border-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-500`}
              data-cursor-hover
              style={{
                animation: 'float-up 0.8s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent rounded-2xl pointer-events-none" />

              <Quote className="w-8 h-8 text-yellow-400 mb-4 opacity-50" />

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              <div className="pt-4 border-t border-white/10">
                <div className="text-white font-bold text-sm">
                  {testimonial.name}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  Ověřený nákup: {testimonial.product}
                </div>
              </div>

              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex -space-x-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-black flex items-center justify-center text-xs font-black text-black"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="text-white font-bold text-sm">
                2,500+ spokojených zákazníků
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 font-bold">4.9/5</span>
                <span>průměrné hodnocení</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
      `}</style>
    </section>
  );
}
