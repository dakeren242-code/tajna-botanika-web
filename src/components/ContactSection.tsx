import { Mail, MessageCircle, Clock, MapPin } from 'lucide-react';

export default function ContactSection() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nejste si jistí výběrem?
          </h2>
          <p className="text-xl text-gray-300">
            Napište nám. Doporučíme variantu, která dává smysl.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 rounded-xl border border-emerald-500/30">
                <MessageCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Objednávku vyřešíme hned</h3>
                <p className="text-gray-300 mb-4">
                  Rychlá odpověď. Žádné čekání. Žádné zdržování.
                </p>
                <p className="text-gray-400 text-sm">
                  Čím dřív napíšete, tím dřív máte vybráno, odesláno nebo připraveno k vyzvednutí.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-2xl p-8 border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-4 rounded-xl border border-emerald-500/30">
                <MapPin className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Chcete osobní vyzvednutí?</h3>
                <p className="text-gray-300 mb-4">
                  Napište nám a sdělíme vám aktuální místo a čas vyzvednutí.
                </p>
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <Clock className="w-4 h-4" />
                  <span>Oblast Praha - Beroun, dostupnost 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
