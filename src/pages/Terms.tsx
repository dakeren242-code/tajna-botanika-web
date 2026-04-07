import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { useEffect } from 'react';

export default function Terms() {
  useEffect(() => {
    document.title = 'Obchodní podmínky | Tajná Botanika';
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

        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20">
          <FileText className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 text-sm font-bold tracking-wider uppercase">
            Právní informace
          </span>
        </div>

        <h1 className="text-5xl font-black mb-8 text-white">Obchodní podmínky</h1>
        <p className="text-gray-500 text-sm mb-12">Poslední aktualizace: 7. dubna 2026</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">1. Základní ustanovení</h2>
            <p className="text-gray-300 leading-relaxed">
              Tyto obchodní podmínky upravují práva a povinnosti smluvních stran vzniklé v souvislosti s nákupem zboží prostřednictvím e-shopu tajnabotanika.online. Prodávající: Tajná Botanika, IČO: [bude doplněno], se sídlem [bude doplněno].
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Veškeré produkty nabízené na našem e-shopu jsou prodávány výhradně jako sběratelské předměty pro osoby starší 18 let. Produkty nejsou určeny ke konzumaci, spalování ani kouření. Slouží k průmyslovým, technickým a zahradnickým účelům.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">2. Objednávka a uzavření smlouvy</h2>
            <p className="text-gray-300 leading-relaxed">
              Objednávka je závazným návrhem na uzavření kupní smlouvy. Smlouva je uzavřena okamžikem potvrzení objednávky prodávajícím. Prodávající si vyhrazuje právo odmítnout objednávku bez udání důvodu.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Odesláním objednávky kupující potvrzuje, že je starší 18 let a že produkty kupuje výhradně ke sběratelským, technickým nebo zahradnickým účelům.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">3. Ceny a platební podmínky</h2>
            <p className="text-gray-300 leading-relaxed">
              Všechny ceny jsou uvedeny v CZK včetně DPH. Akceptujeme platbu bankovním převodem, kartou online a dobírkou. Platba kartou je zpracována bezpečně přes certifikovanou platební bránu.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Doprava je zdarma při objednávce nad 1 000 Kč. Standardní cena dopravy je 79 Kč.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">4. Doručení</h2>
            <p className="text-gray-300 leading-relaxed">
              Zboží zasíláme prostřednictvím služby Zásilkovna (Packeta) do výdejních míst po celé ČR. Obvyklá doba doručení je 1–2 pracovní dny od odeslání. Na Slovensko nezasíláme.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">5. Odstoupení od smlouvy</h2>
            <p className="text-gray-300 leading-relaxed">
              Kupující má právo odstoupit od smlouvy bez udání důvodu ve lhůtě 14 dnů ode dne převzetí zboží. Zboží musí být vráceno v původním, neotevřeném balení. Náklady na vrácení nese kupující.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Pro vrácení zboží nás kontaktujte na info@tajnabotanika.online. Peníze budou vráceny do 14 dnů od přijetí vráceného zboží.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">6. Reklamace</h2>
            <p className="text-gray-300 leading-relaxed">
              Na veškeré zboží se vztahuje záruční doba 30 dní. V případě reklamace kontaktujte naši zákaznickou podporu. Reklamace bude vyřízena do 30 dnů.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">7. Právní upozornění</h2>
            <p className="text-gray-300 leading-relaxed">
              Produkty jsou v souladu se zákonem č. 167/1998 Sb. o návykových látkách. Balení obsahuje konopný květ s obsahem delta-9-THC méně než 1 %. Produkty podléhají přirozenému úbytku hmotnosti. Uchovávejte mimo dosah dětí a mladistvých.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3 font-semibold">
              Nikoho nenabádáme ke konzumaci či užívání produktu. Produkty jsou prodávány pouze ke sběratelským, technickým či zahradnickým účelům.
            </p>
          </section>

          <section className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">8. Kontakt</h2>
            <p className="text-gray-300 leading-relaxed">
              E-mail: info@tajnabotanika.online<br />
              Telefon: +420 739 385 030 (7:00–20:00)<br />
              Zákaznická podpora: chat na webu (dostupný 24/7)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
