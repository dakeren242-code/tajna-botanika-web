import { ArrowRight, BookOpen, Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const blogPosts = [
  {
    slug: 'co-je-thc-x',
    title: 'Co je THC-X a proč je legální v České republice?',
    excerpt: 'THC-X je nová generace synteticky odvozených kanabinoidů, která vznikla jako odpověď na rostoucí poptávku po silnějších zážitcích. Zjistěte vše o jeho složení, účincích a právním statusu v ČR.',
    category: 'Vzdělání',
    categoryColor: 'from-purple-500 to-violet-600',
    readTime: '5 min',
    date: '2. dubna 2026',
    gradient: 'from-purple-900/40 to-violet-900/20',
    accentColor: '#a855f7',
    image: null,
    content: `
THC-X je hexylový ester THC-O-acetátu — synteticky odvozený kanabinoid nové generace. Vznikl jako výsledek pokročilého výzkumu kanabinoidní chemie a rychle se stal jedním z nejzajímavějších sběratelských artiklů na trhu.

## Proč je legální?

V České republice je THC-X legální, protože vychází z CBD konopí (obsah delta-9-THC < 1 %) a podléhá nařízení EU o nových potravinách a kosmetice. Klíčové je, že se nejedná o psychoaktivní THC jako takové, ale o derivát, který nespadá pod současné zákonné definice omamných látek.

## Chemická struktura

THC-X se vyznačuje unikátní hexylovou esterovou vazbou, která mu propůjčuje specifické vlastnosti odlišné od ostatních kanabinoidů. Z hlediska chemie je to fascinující molekula, která přitahuje pozornost vědců i sběratelů.

## Důležité upozornění

THC-X produkty jsou prodávány výhradně jako sběratelské předměty pro dospělé. Nejsou určeny ke konzumaci, spalování ani kouření. Slouží k průmyslovým, technickým a zahradnickým účelům.
    `,
  },
  {
    slug: 'indica-sativa-hybrid',
    title: 'Indica, Sativa, Hybrid: Jaký je skutečný rozdíl?',
    excerpt: 'Rozdíl mezi indicou, sativou a hybridem není jen v tvaru listu. Jde o celý profil terpénů a kanabinoidů, který určuje váš zážitek. Poradíme vám, jak si vybrat správně.',
    category: 'Průvodce',
    categoryColor: 'from-emerald-500 to-teal-600',
    readTime: '7 min',
    date: '28. března 2026',
    gradient: 'from-emerald-900/40 to-teal-900/20',
    accentColor: '#10b981',
    image: null,
    content: `
Klasické dělení na indica, sativu a hybrid pochází z botaniky 18. století. Dnes víme, že skutečný zážitek neurčuje "typ" rostliny, ale chemický profil — tedy poměr kanabinoidů a terpénů.

## Indica

Tradičně spojována s bohatým terpénovým profilem. Typické terpény: myrcen, linalool, karyofylen. Cenné odrůdy v každé sběratelské kolekci.

## Sativa

Spjata s energizujícím a kreativním zážitkem. Dominantní terpény: limonen, terpinolen, α-pinen. Vhodná do dne, pro tvůrčí práci a sociální situace.

## Hybrid

Kombinuje vlastnosti obou. Záleží na konkrétním profilu — může být "indica-dominant" nebo "sativa-dominant". Většina moderních odrůd jsou hybridy.

## Jak vybrat?

Místo typu se zaměřte na terpénový profil v produktovém popisu. Na Tajné Botanice uvádíme přesné složení každého produktu.
    `,
  },
  {
    slug: 'terpeny-tajemstvi-aroma',
    title: 'Terpény: Tajemství za vůní a účinky prémiových odrůd',
    excerpt: 'Terpény jsou organické sloučeniny zodpovědné za aroma každé odrůdy. Ale jejich role jde daleko za pouhou vůni — spolupracují s kanabinoidy a zásadně ovlivňují váš zážitek.',
    category: 'Věda',
    categoryColor: 'from-amber-500 to-orange-600',
    readTime: '6 min',
    date: '20. března 2026',
    gradient: 'from-amber-900/30 to-orange-900/20',
    accentColor: '#f59e0b',
    image: null,
    content: `
Terpény jsou aromatické uhlovodíky přítomné v pryskyřici konopí. Existuje jich přes 200 druhů a každá odrůda má unikátní terpénový "fingerprint".

## Nejdůležitější terpény

**Myrcen** — zemitá, muškátová vůně. Relaxační efekt, zvyšuje propustnost hematoencefalické bariéry.

**Limonen** — citrusová vůně. Povzbuzující, snižuje stres a úzkost.

**Karyofylen** — kořeněná, pepřová vůně. Jediný terpén, který se přímo váže na CB2 receptory. Protizánětlivý.

**Linalool** — květinová, levandulová vůně. Sedativní, anxiolytický efekt.

**α-Pinen** — borovicová vůně. Zlepšuje paměť a soustředění, bronchodilatátor.

## Entourage effect

Terpény a kanabinoidy nepůsobí izolovaně — vzájemně se potencují v tzv. "entourage effect". Proto jsou full-spectrum extrakty efektivnější než izolované sloučeniny.
    `,
  },
  {
    slug: 'jak-spravne-skladovat',
    title: 'Jak správně skladovat prémiové konopné produkty',
    excerpt: 'Špatné skladování může znehodnotit i nejluxusnější produkt za pár dní. Světlo, teplo a vlhkost jsou největší nepřátelé. Naučte se jak uchovat kvalitu na maximum.',
    category: 'Tipy',
    categoryColor: 'from-cyan-500 to-blue-600',
    readTime: '4 min',
    date: '14. března 2026',
    gradient: 'from-cyan-900/30 to-blue-900/20',
    accentColor: '#06b6d4',
    image: null,
    content: `
Kvalitní produkt si zaslouží kvalitní péči. Správné skladování prodlouží životnost a zachová plný terpénový profil.

## Nepřátelé č. 1: Světlo, teplo, vlhkost

UV záření rozkládá kanabinoidy — uskladněte produkt mimo přímé sluneční světlo. Ideální teplota je 15–21 °C. Vlhkost nad 65 % podporuje plísně, pod 45 % vysušuje terpény.

## Ideální podmínky

- Tmavé, chladné místo (ne lednice — kondenzace)
- Hermeticky uzavřená skleněná nádoba
- Relativní vlhkost 55–62 % (boveda pack pomáhá)
- Odděleně od ostatních aromatických látek

## Co nedělat

Nepoužívejte plastové sáčky — statická elektřina odlamuje trichomy. Neuchovávejte v mrazáku — poškozuje strukturu. Nesmíchávejte různé odrůdy — kontaminace aroma.

## Trvanlivost

Při správném skladování vydrží produkt plně aromatický 6–12 měsíců. Po roce začíná oxidace a degradace THC-X na méně aktivní metabolity.
    `,
  },
  {
    slug: 'thc-x-vs-hhc-rozdily',
    title: 'THC-X vs HHC: Klíčové rozdíly, které musíte znát',
    excerpt: 'THC-X a HHC jsou dva populární kanabinoidy, ale liší se v síle, účincích i legálním statusu. Porovnáváme je bod po bodu, abyste věděli, co si vybrat.',
    category: 'Srovnání',
    categoryColor: 'from-rose-500 to-pink-600',
    readTime: '6 min',
    date: '7. dubna 2026',
    gradient: 'from-rose-900/40 to-pink-900/20',
    accentColor: '#f43f5e',
    image: null,
    content: `
THC-X a HHC patří mezi nejdiskutovanější kanabinoidy současnosti. Oba jsou legálně dostupné v ČR, ale jejich profily se výrazně liší.

## Co je HHC?

HHC (hexahydrokanabinol) je hydrogenovaná forma THC. Vzniká přidáním vodíku k molekule THC, čímž získá vyšší stabilitu a odolnost vůči teplu a UV záření. Síla je přibližně 70–80 % klasického THC.

## Co je THC-X?

THC-X je hexylový ester THC-O-acetátu — výrazně silnější derivát. Síla dosahuje 2–3× klasického THC, s hlubším a delším účinkem.

## Hlavní rozdíly

**Chemická struktura:** THC-X má hexylovou esterovou vazbu, která mu dává unikátní vlastnosti. HHC je hydrogenovaná forma — stabilnější, ale chemicky jednodušší.

**Stabilita:** HHC je chemicky stabilnější a má delší trvanlivost — výhoda pro dlouhodobé sběratele. THC-X vyžaduje pečlivější skladování, ale nabízí vzácnější profil.

**Aromatický profil:** Oba mají odlišné terpénové profily. THC-X květy na Tajné Botanice nabízejí prémiové aroma díky pečlivě vybraným odrůdám.

**Sběratelská hodnota:** THC-X je vzácnější a na trhu kratší dobu, což z něj dělá zajímavější sběratelský artikl. HHC je dostupnější, ale méně exkluzivní.

## Který sbírat?

Záleží na vaší strategii. HHC je vhodné pro budování základní kolekce. THC-X je pro pokročilé sběratele hledající vzácnější a exkluzivnější odrůdy.
    `,
  },
  {
    slug: 'nejlepsi-thc-x-pro-relaxaci',
    title: 'Nejcennější THC-X odrůdy pro sběratele v roce 2026',
    excerpt: 'Které THC-X odrůdy mají největší sběratelskou hodnotu? Představujeme top výběr prémiových květů s unikátním aromatickým profilem.',
    category: 'Průvodce',
    categoryColor: 'from-indigo-500 to-blue-600',
    readTime: '5 min',
    date: '5. dubna 2026',
    gradient: 'from-indigo-900/40 to-blue-900/20',
    accentColor: '#6366f1',
    image: null,
    content: `
Sběratelství THC-X květů se stává stále populárnějším koníčkem. Jednotlivé odrůdy se liší nejen aromatickým profilem, ale i vizuální kvalitou a raritou. Které mají v roce 2026 největší hodnotu?

## Co dělá odrůdu cennou?

Hodnotu sběratelského květu určuje kombinace faktorů: unikátní terpénový fingerprint, hustota trichomů, intenzita aroma a vizuální atraktivita. Čím vzácnější kombinace, tím vyšší sběratelská hodnota.

## Top odrůdy 2026

**Purple Haze** — Sladká, ovocná vůně s nádherným fialovým zbarvením. Vizuálně jedna z nejatraktivnějších odrůd na trhu.

**OG Kush** — Klasika mezi klasikami. Zemitá, borová vůně s bohatým terpénovým profilem a vysokou hustotou trichomů.

**Amnesia** — Intenzivní citrusové aroma a výjimečně kompaktní struktura květu. Oblíbená u zkušených sběratelů.

## Jak poznat prémiovou kvalitu

Kvalitní sběratelský květ by měl mít viditelné trichomy (krystalky), sytou barvu a výraznou vůni. Na Tajné Botanice uvádíme u každého produktu detailní botanický profil.

## Důležité upozornění

Všechny THC-X produkty jsou prodávány výhradně jako sběratelské předměty. Nejsou určeny ke konzumaci ani spalování.
    `,
  },
  {
    slug: 'jak-poznat-kvalitni-thc-x',
    title: 'Jak poznat kvalitní THC-X květ? 5 znaků prémiového produktu',
    excerpt: 'Ne každý THC-X květ je stejný. Naučte se rozlišit prémiovou kvalitu od průměru podle 5 jednoduchých kritérií, které zvládne i začátečník.',
    category: 'Vzdělání',
    categoryColor: 'from-yellow-500 to-amber-600',
    readTime: '4 min',
    date: '3. dubna 2026',
    gradient: 'from-yellow-900/30 to-amber-900/20',
    accentColor: '#eab308',
    image: null,
    content: `
Kvalita THC-X květů se dramaticky liší. Zde je 5 spolehlivých ukazatelů, podle kterých poznáte prémiový produkt.

## 1. Vzhled a struktura

Kvalitní květ má hustou, kompaktní strukturu s viditelnými trichomy (krystalky). Barva by měla být sytá — od zelené přes fialovou po oranžovou. Vyvarujte se hnědých nebo suchých květů.

## 2. Vůně

Silné, výrazné aroma je známka kvalitního terpénového profilu. Každá odrůda by měla mít odlišnou a rozpoznatelnou vůni. Pokud květ nevoní nebo voní senem — není čerstvý.

## 3. Laboratorní rozbor

Seriózní prodejce vždy uvádí výsledky laboratorních testů: obsah THC-X, CBD, terpénů a případné kontaminanty. Na Tajné Botanice jsou všechny produkty testovány.

## 4. Vlhkost

Správně zpracovaný květ by měl být mírně pružný — ne suchý a křehký, ne mokrý a lepkavý. Ideální obsah vlhkosti je 55–62 %.

## 5. Trimming a balení

Profesionální trim (ořez listů) je známka péče o detail. Kvalitní balení chrání produkt před světlem a vlhkostí. Naše produkty balíme do vzduchotěsných sáčků s UV ochranou.
    `,
  },
  {
    slug: 'thc-x-zkusenosti-co-ocekavat',
    title: 'THC-X sběratelství: Průvodce pro začátečníky',
    excerpt: 'Začínáte sbírat THC-X květy? Přečtěte si vše o tom, jak budovat svou sbírku, na co se zaměřit a jak správně uchovávat vzácné odrůdy.',
    category: 'Průvodce',
    categoryColor: 'from-teal-500 to-emerald-600',
    readTime: '5 min',
    date: '1. dubna 2026',
    gradient: 'from-teal-900/30 to-emerald-900/20',
    accentColor: '#14b8a6',
    image: null,
    content: `
Sběratelství THC-X květů je fascinující koníček, který kombinuje znalost botaniky, chemie a estetiky. Zde je vše, co potřebujete vědět pro start.

## Proč sbírat THC-X?

THC-X květy patří mezi nejzajímavější sběratelské artikly na českém trhu. Každá odrůda má unikátní aromatický profil, vizuální charakter a chemické složení. Pro znalce je to podobné sbírání vzácných čajů nebo vín.

## Jak začít sbírku

Začněte s 2–3 základními odrůdami z různých kategorií — indica, sativa a hybrid. Tím získáte přehled o spektru dostupných terpénových profilů a můžete porovnávat.

## Na co se zaměřit

**Terpénový profil** — Každá odrůda má unikátní "otisk prstu" složený z terpénů. Myrcen, limonen, karyofylen — to jsou klíčové složky, které hledejte v popisu produktu.

**Vizuální kvalita** — Hustota trichomů, barva květu, kompaktnost struktury. Prémiové odrůdy mají výrazně viditelné krystalky.

**Certifikace** — Vždy kupujte od ověřených prodejců s laboratorními rozbory. Tajná Botanika uvádí přesné složení u každého produktu.

## Uchovávání sbírky

Skladujte v hermeticky uzavřených nádobách, v temnu, při teplotě 15–21 °C. Vlhkost ideálně 55–62 %. Více v našem článku o správném skladování.

## Důležité upozornění

Produkty jsou prodávány výhradně jako sběratelské předměty pro osoby starší 18 let. Nejsou určeny ke konzumaci, spalování ani kouření.
    `,
  },
  {
    slug: 'cbd-kvety-legalni-alternativa',
    title: 'CBD květy: Legální alternativa s prokazatelnými benefity',
    excerpt: 'CBD květy jsou plně legální v ČR a nabízejí řadu prokazatelných zdravotních benefitů. Co je CBD, jak funguje a proč si ho zamilovali miliony lidí po celém světě.',
    category: 'Vzdělání',
    categoryColor: 'from-green-500 to-emerald-600',
    readTime: '6 min',
    date: '6. dubna 2026',
    gradient: 'from-green-900/30 to-emerald-900/20',
    accentColor: '#22c55e',
    image: null,
    content: `
CBD (kanabidiol) je jeden z nejvíce zkoumaných kanabinoidů na světě. Na rozdíl od THC nemá psychoaktivní účinky a je plně legální v České republice i celé EU.

## Co je CBD?

CBD je přírodní sloučenina obsažená v konopí (Cannabis sativa). Interaguje s endokanabinoidním systémem těla, který reguluje bolest, náladu, spánek a imunitní odpověď. CBD NEMÁ psychoaktivní účinky — nenavozuje „high" pocit.

## Legální status v ČR

CBD květy s obsahem delta-9-THC pod 1 % jsou v České republice plně legální. Můžete je volně nakupovat, přechovávat a využívat. Spadají pod nařízení o konopí pro průmyslové účely.

## Prokázané benefity CBD

**Úleva od stresu a úzkosti** — Studie publikované v Journal of Clinical Psychology potvrzují anxiolytické vlastnosti CBD.

**Podpora kvalitního spánku** — CBD pomáhá regulovat cirkadiánní rytmus a zlepšuje kvalitu spánku bez návyku.

**Protizánětlivé vlastnosti** — CBD prokázalo protizánětlivé účinky srovnatelné s některými nesteroidními léky.

**Úleva od bolesti** — Interakcí s CB2 receptory může CBD zmírnit chronickou bolest a zánět.

## Jak používat CBD květy

CBD květy lze využít několika způsoby — od vaporizace, přes přípravu čajů, až po aromaterapii. Každá metoda nabízí jiný profil vstřebávání a délku účinku.

## Kvalita je klíčová

Vždy vybírejte CBD květy od ověřených prodejců s laboratorními certifikáty. Klíčové parametry jsou obsah CBD (ideálně nad 10 %), obsah THC (pod zákonným limitem) a čistý terpénový profil bez pesticidů.
    `,
  },
];

export default function BlogSection() {
  const featured = blogPosts.slice(0, 4);

  return (
    <section id="blog" className="relative py-24 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-emerald-950/10 to-black" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/5 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-bold tracking-wider uppercase">
              Tajná Akademie
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
            Vzdělání &{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Průvodci
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Vše co potřebujete vědět o THC-X, terpénech a botanickém světě.
            Průvodci napsané odborníky.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {featured.map((post, i) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))`,
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  boxShadow: `inset 0 0 40px ${post.accentColor}15`,
                  border: `1px solid ${post.accentColor}25`,
                  borderRadius: 'inherit',
                }}
              />

              <div className="relative p-6 flex flex-col h-full min-h-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase"
                    style={{
                      color: post.accentColor,
                      background: `${post.accentColor}10`,
                      border: `1px solid ${post.accentColor}20`,
                    }}
                  >
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </div>
                </div>

                <h3 className="text-lg font-black text-white mb-3 leading-snug group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text transition-all duration-300"
                    style={{
                      backgroundImage: `linear-gradient(to right, white, ${post.accentColor})`,
                    }}>
                  {post.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-white/5">
                  <span className="text-gray-600 text-xs">{post.date}</span>
                  <span
                    className="flex items-center gap-1.5 text-sm font-bold transition-all duration-300 group-hover:gap-2.5"
                    style={{ color: post.accentColor }}
                  >
                    Číst
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.15))',
              border: '1px solid rgba(16,185,129,0.3)',
              boxShadow: '0 0 30px rgba(16,185,129,0.1)',
            }}
          >
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Všechny články</span>
            <ArrowRight className="w-5 h-5 text-emerald-400 transition-transform duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
}
