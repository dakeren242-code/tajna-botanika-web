import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useEffect } from 'react';

export default function Privacy() {
  useEffect(() => {
    document.title = 'Ochrana soukromí | Tajná Botanika';
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na hlavní stránku
        </Link>

        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-sm font-bold tracking-wider uppercase">
            Ochrana dat
          </span>
        </div>

        <h1 className="text-5xl font-black mb-8 text-white">Ochrana soukromí</h1>
        <p className="text-gray-500 text-sm mb-12">Poslední aktualizace: 7. dubna 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">1. Správce osobních údajů</h2>
            <p className="text-gray-300 leading-relaxed">
              Správcem vašich osobních údajů je provozovatel e-shopu tajnabotanika.online. Vaše soukromí bereme vážně a zpracováváme pouze ty údaje, které jsou nezbytné pro poskytnutí našich služeb.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">2. Jaké údaje sbíráme</h2>
            <div className="text-gray-300 leading-relaxed space-y-3">
              <p><strong className="text-white">Při registraci:</strong> E-mail, jméno, příjmení</p>
              <p><strong className="text-white">Při objednávce:</strong> Doručovací adresa, telefonní číslo, platební informace</p>
              <p><strong className="text-white">Automaticky:</strong> IP adresa, typ prohlížeče, cookies (s vaším souhlasem)</p>
            </div>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">3. Účel zpracování</h2>
            <div className="text-gray-300 leading-relaxed space-y-2">
              <p>• Vyřízení a doručení vaší objednávky</p>
              <p>• Komunikace ohledně objednávky a zákaznická podpora</p>
              <p>• Zasílání marketingových sdělení (pouze se souhlasem)</p>
              <p>• Zlepšování našich služeb a uživatelského zážitku</p>
              <p>• Plnění zákonných povinností</p>
            </div>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">4. Cookies a analytika</h2>
            <p className="text-gray-300 leading-relaxed">
              Používáme cookies pro správné fungování webu a analytiku návštěvnosti. Marketingové cookies (Facebook Pixel) aktivujeme pouze s vaším výslovným souhlasem přes cookie lištu. Svůj souhlas můžete kdykoliv odvolat v nastavení cookies.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">5. Sdílení údajů</h2>
            <p className="text-gray-300 leading-relaxed">
              Vaše údaje sdílíme pouze s partnery nezbytnými pro doručení služby:
            </p>
            <div className="text-gray-300 leading-relaxed space-y-2 mt-3">
              <p>• <strong className="text-white">Zásilkovna (Packeta)</strong> — doručení zásilek</p>
              <p>• <strong className="text-white">Pays.cz</strong> — zpracování plateb</p>
              <p>• <strong className="text-white">Supabase</strong> — bezpečné uložení dat</p>
            </div>
            <p className="text-gray-300 leading-relaxed mt-3">
              Vaše údaje nikdy neprodáváme třetím stranám.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">6. Vaše práva</h2>
            <div className="text-gray-300 leading-relaxed space-y-2">
              <p>• <strong className="text-white">Právo na přístup</strong> — můžete si vyžádat kopii vašich dat</p>
              <p>• <strong className="text-white">Právo na opravu</strong> — můžete požádat o opravu nepřesných údajů</p>
              <p>• <strong className="text-white">Právo na výmaz</strong> — můžete požádat o smazání vašich dat</p>
              <p>• <strong className="text-white">Právo na přenositelnost</strong> — můžete získat data ve strojově čitelném formátu</p>
              <p>• <strong className="text-white">Právo podat stížnost</strong> — u Úřadu pro ochranu osobních údajů (ÚOOÚ)</p>
            </div>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">7. Doba uchovávání</h2>
            <p className="text-gray-300 leading-relaxed">
              Osobní údaje uchováváme po dobu nezbytnou pro splnění účelu zpracování, nejdéle však po dobu stanovenou právními předpisy (účetní doklady 10 let, údaje pro marketingové účely do odvolání souhlasu).
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">8. Kontakt</h2>
            <p className="text-gray-300 leading-relaxed">
              Pro jakékoliv dotazy ohledně ochrany osobních údajů nás kontaktujte na info@tajnabotanika.online.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
