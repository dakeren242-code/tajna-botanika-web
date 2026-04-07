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
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-24">
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

        <h1 className="text-4xl md:text-5xl font-black mb-4 text-white">Obchodní podmínky</h1>
        <p className="text-gray-500 text-sm mb-12">Poslední aktualizace: 7. dubna 2026</p>

        <div className="space-y-6">
          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">1. Základní ustanovení</h2>
            <p className="text-gray-300 leading-relaxed">
              Tyto obchodní podmínky (dále jen „podmínky") upravují práva a povinnosti smluvních stran vzniklé v souvislosti s nákupem zboží prostřednictvím internetového obchodu provozovaného na adrese tajnabotanika.online (dále jen „e-shop").
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Provozovatelem e-shopu je <strong className="text-white">Tajná Botanika</strong> (dále jen „prodávající").
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Kontaktní údaje prodávajícího:<br />
              E-mail: info@tajnabotanika.online<br />
              Telefon: +420 739 385 030<br />
              Web: tajnabotanika.online
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">2. Účel prodeje a charakteristika zboží</h2>
            <p className="text-gray-300 leading-relaxed">
              Veškeré produkty nabízené na e-shopu jsou prodávány <strong className="text-white">výhradně jako sběratelské předměty</strong> pro osoby starší 18 let. Produkty jsou určeny ke sběratelským, botanickým, vědeckým a výzkumným účelům.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Produkty <strong className="text-white">nejsou určeny ke konzumaci, spalování, kouření ani jinému způsobu užívání</strong>. Prodávající nikoho nenabádá ke konzumaci či užívání nabízených produktů.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Nabízené produkty splňují požadavky platné legislativy České republiky. Jedná se o konopný květ s obsahem delta-9-THC nepřesahujícím zákonem stanovený limit (do 1 % THC) v souladu se zákonem č. 167/1998 Sb. o návykových látkách.
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">3. Objednávka a uzavření smlouvy</h2>
            <p className="text-gray-300 leading-relaxed">
              Odesláním objednávky kupující potvrzuje, že:
            </p>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-2">
              <li>je starší 18 let,</li>
              <li>produkty kupuje výhradně ke sběratelským účelům,</li>
              <li>se seznámil s těmito obchodními podmínkami a souhlasí s nimi,</li>
              <li>údaje uvedené v objednávce jsou pravdivé a úplné.</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Objednávka je závazným návrhem na uzavření kupní smlouvy. Kupní smlouva je uzavřena okamžikem potvrzení objednávky prodávajícím. Prodávající si vyhrazuje právo odmítnout objednávku bez udání důvodu.
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">4. Ceny a platební podmínky</h2>
            <p className="text-gray-300 leading-relaxed">
              Všechny ceny jsou uvedeny v českých korunách (CZK) a jsou konečné. Prodávající není plátcem DPH.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Akceptujeme následující platební metody:
            </p>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-2">
              <li><strong className="text-white">Bankovní převod</strong> — po přijetí platby na účet bude objednávka odeslána</li>
              <li><strong className="text-white">Platba kartou online</strong> — prostřednictvím zabezpečené platební brány</li>
              <li><strong className="text-white">Dobírka</strong> — platba při převzetí zásilky (příplatek 30 Kč)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Doprava je zdarma při objednávce nad 1 000 Kč. Standardní cena dopravy prostřednictvím Zásilkovny je 79 Kč. Osobní odběr je zdarma.
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">5. Doručení</h2>
            <p className="text-gray-300 leading-relaxed">
              Zboží zasíláme prostřednictvím služby Zásilkovna (Packeta) na výdejní místa a do Z-BOXů po celé České republice. Obvyklá doba doručení je 1–3 pracovní dny od odeslání zásilky.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Osobní odběr je možný po předchozí domluvě (oblast Praha–Beroun) po uhrazení faktury.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Veškeré zásilky jsou baleny diskrétně bez jakéhokoliv označení obsahu.
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">6. Odstoupení od smlouvy</h2>
            <p className="text-gray-300 leading-relaxed">
              Kupující má právo odstoupit od kupní smlouvy bez udání důvodu ve lhůtě 14 dnů ode dne převzetí zboží v souladu s § 1829 občanského zákoníku.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Podmínky pro vrácení zboží:
            </p>
            <ul className="list-disc list-inside text-gray-300 leading-relaxed mt-2 space-y-1 ml-2">
              <li>Zboží musí být vráceno v původním, neotevřeném a nepoškozeném obalu</li>
              <li>Náklady na vrácení zboží nese kupující</li>
              <li>Peněžní prostředky budou vráceny do 14 dnů od přijetí vráceného zboží</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-3">
              Pro vrácení zboží kontaktujte naši podporu na info@tajnabotanika.online.
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">7. Reklamace a záruka</h2>
            <p className="text-gray-300 leading-relaxed">
              Na veškeré zboží se vztahuje záruční doba 30 dní od data dodání. Reklamaci zboží uplatněte kontaktováním zákaznické podpory na info@tajnabotanika.online. Reklamace bude vyřízena v zákonné lhůtě 30 dnů.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Produkty podléhají přirozenému úbytku hmotnosti (vysychání). Drobné odchylky v hmotnosti nejsou důvodem k reklamaci.
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">8. Ochrana osobních údajů</h2>
            <p className="text-gray-300 leading-relaxed">
              Prodávající zpracovává osobní údaje kupujícího v souladu s Nařízením Evropského parlamentu a Rady (EU) 2016/679 (GDPR). Podrobnosti o zpracování osobních údajů naleznete v{' '}
              <Link to="/soukromi" className="text-emerald-400 hover:text-emerald-300 underline">
                Zásadách ochrany osobních údajů
              </Link>.
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">9. Právní upozornění</h2>
            <p className="text-gray-300 leading-relaxed">
              Produkty jsou v souladu s platnými právními předpisy České republiky, zejména zákonem č. 167/1998 Sb. o návykových látkách. Každý produkt je dodáván s laboratorním certifikátem potvrzujícím složení.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3 font-semibold text-white">
              Prodávající nikoho nenabádá ke konzumaci, spalování ani jinému užívání nabízených produktů. Veškeré produkty jsou prodávány výhradně jako sběratelské předměty.
            </p>
            <p className="text-gray-300 leading-relaxed mt-3">
              Uchovávejte mimo dosah dětí a mladistvých. Nákupem na e-shopu potvrzujete, že jste starší 18 let.
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">10. Kontakt</h2>
            <p className="text-gray-300 leading-relaxed">
              <strong className="text-white">Tajná Botanika</strong><br />
              E-mail: info@tajnabotanika.online<br />
              Telefon: +420 739 385 030 (Po–Pá 8:00–20:00)<br />
              Zákaznická podpora: live chat na webu<br />
              Instagram: @tajnabotanika
            </p>
          </section>

          <section className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <h2 className="text-xl font-bold text-white mb-4">11. Závěrečná ustanovení</h2>
            <p className="text-gray-300 leading-relaxed">
              Tyto obchodní podmínky nabývají účinnosti dnem jejich zveřejnění. Prodávající si vyhrazuje právo tyto podmínky kdykoliv změnit. Rozhodným právem je právo České republiky. Případné spory budou řešeny příslušnými soudy České republiky.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
