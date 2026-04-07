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
THC-X je hexylový ester THC-O-acetátu — tedy synteticky odvozený kanabinoid, který je přibližně 3× silnější než klasický THC-O. Vznikl jako odpověď na rostoucí zájem o zesílené zážitky při zachování legálního statusu.

## Proč je legální?

V České republice je THC-X legální, protože vychází z CBD konopí (obsah delta-9-THC < 1 %) a podléhá nařízení EU o nových potravinách a kosmetice. Klíčové je, že se nejedná o psychoaktivní THC jako takové, ale o derivát, který nespadá pod současné zákonné definice omamných látek.

## Jak funguje?

THC-X se váže na CB1 receptory v endokanabinoidním systému s vyšší afinitou než standardní THC. Nástup účinků je pomalejší (30–90 min při orální konzumaci), ale efekt je hlubší a delší.

## Bezpečnost

Vždy začínajte malou dávkou. THC-X je určeno výhradně pro dospělé a nesmí být konzumováno při řízení nebo obsluze strojů.
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

Tradičně spojována s uklidňujícím, tělním efektem. Typické terpény: myrcen, linalool, karyofylen. Ideální pro večerní relaxaci a lepší spánek.

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
];

export default function BlogSection() {
  const featured = blogPosts.slice(0, 3);

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${post.categoryColor}`}
                  >
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
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
