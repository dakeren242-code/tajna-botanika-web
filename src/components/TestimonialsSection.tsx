import { Star, Quote } from 'lucide-react';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Martin K.',
      rating: 5,
      text: 'Skvělá kvalita, botanický profil přesně jak bylo popsáno. Objednal jsem znovu.',
      product: 'Cosmic Dream',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
      name: 'Jana P.',
      rating: 4,
      text: 'Dobrý produkt, rychlé doručení. Příště zkusím jinou odrůdu.',
      product: 'Golden Haze',
      gradient: 'from-yellow-500/20 to-orange-500/20',
    },
    {
      name: 'Petr S.',
      rating: 5,
      text: 'Rychlé doručení, diskrétní balení a premium kvalita. Doporučuji.',
      product: 'Electric Lime',
      gradient: 'from-green-500/20 to-emerald-500/20',
    },
    {
      name: 'Lucie M.',
      rating: 4,
      text: 'Hezké balení, produkt OK. Komunikace bezproblémová.',
      product: 'Sunset Bliss',
      gradient: 'from-orange-500/20 to-red-500/20',
    },
  ];

  const avgRating = (testimonials.reduce((s, t) => s + t.rating, 0) / testimonials.length).toFixed(1);

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black" />

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl bg-gradient-to-br ${testimonial.gradient} border border-white/10 backdrop-blur-sm hover:scale-105 transition-all duration-500`}
              style={{ animation: 'float-up 0.8s ease-out forwards', animationDelay: `${index * 0.1}s`, opacity: 0 }}
            >
              <Quote className="w-8 h-8 text-yellow-400 mb-4 opacity-50" />

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                "{testimonial.text}"
              </p>

              <div className="pt-4 border-t border-white/10">
                <div className="text-white font-bold text-sm">{testimonial.name}</div>
                <div className="text-gray-500 text-xs mt-1">Ověřený nákup: {testimonial.product}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-yellow-400 font-bold">{avgRating}/5</span>
              <span>průměrné hodnocení</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
