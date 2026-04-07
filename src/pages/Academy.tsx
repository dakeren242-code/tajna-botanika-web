import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Sparkles, Microscope, Leaf, Wind, ArrowRight,
  Clock, Tag, ChevronRight, Star, Eye, FlaskConical, TreePine,
  Moon, Zap, Heart, Brain, Shield, Flame, Coffee, Droplets,
  Sun, CloudRain, Flower2, Gem, ArrowLeft
} from 'lucide-react';
import { blogPosts } from '../components/BlogSection';

/* ═══════════════════════════════════════════
   FLOATING PARTICLES
   ═══════════════════════════════════════════ */
function AcademyParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 35 }).map((_, i) => ({
      w: Math.random() * 4 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      bg: [
        'rgba(16,185,129,0.25)',
        'rgba(168,85,247,0.25)',
        'rgba(245,158,11,0.15)',
        'rgba(6,182,212,0.2)',
      ][i % 4],
      dur: 8 + Math.random() * 14,
      del: Math.random() * 6,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.w, height: p.w,
            left: `${p.x}%`, top: `${p.y}%`,
            background: p.bg,
            animation: `acFloat ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.del}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MYSTICAL BOOK (hero icon)
   ═══════════════════════════════════════════ */
function MysticalBook() {
  return (
    <div className="relative w-36 h-36 md:w-44 md:h-44 mx-auto mb-8">
      {/* outer glow */}
      <div className="absolute inset-0 rounded-full animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
      <div className="absolute inset-2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', animation: 'acSpin 25s linear infinite' }} />
      {/* center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-emerald-400" strokeWidth={1} />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute -bottom-1 -left-3 w-4 h-4 text-purple-400 animate-pulse" style={{ animationDelay: '1.2s' }} />
        </div>
      </div>
      {/* orbiting */}
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#10b981', '#a855f7', '#f59e0b'][i],
            top: '50%', left: '50%',
            animation: `acOrbit ${6 + i * 2}s linear infinite`,
            animationDelay: `${i * 1.5}s`,
            boxShadow: `0 0 10px ${['#10b981', '#a855f7', '#f59e0b'][i]}`,
          }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TERPENE EXPLORER DATA
   ═══════════════════════════════════════════ */
const terpenes = [
  {
    name: 'Myrcen',
    icon: Leaf,
    aroma: 'Zemit\u00e1, mu\u0161k\u00e1tov\u00e1',
    effect: 'Relaxace, uvoln\u011bn\u00ed',
    found: 'Mango, chmel, tymi\u00e1n',
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-green-500/20',
    detail: 'Nejroz\u0161\u00ed\u0159en\u011bj\u0161\u00ed terp\u00e9n v konop\u00ed. Zvy\u0161uje propustnost hematoencefalick\u00e9 bari\u00e9ry, co\u017e potencuje \u00fa\u010dinky kanabinoid\u016f.',
  },
  {
    name: 'Limonen',
    icon: Sun,
    aroma: 'Citrusov\u00e1, sv\u011b\u017e\u00ed',
    effect: 'Energie, dobr\u00e1 n\u00e1lada',
    found: 'Citrony, pomeran\u010de, jalovec',
    color: '#f59e0b',
    gradient: 'from-amber-500/20 to-yellow-500/20',
    detail: 'Druh\u00fd nej\u010dast\u011bj\u0161\u00ed terp\u00e9n. M\u00e1 prokazateln\u00e9 anxiolytick\u00e9 a antidepresivn\u00ed vlastnosti. V aromaterapii pou\u017e\u00edv\u00e1n stalet\u00ed.',
  },
  {
    name: 'Karyofylen',
    icon: Flame,
    aroma: 'Ko\u0159en\u011bn\u00e1, pep\u0159ov\u00e1',
    effect: 'Protiz\u00e1n\u011btliv\u00fd',
    found: 'H\u0159eb\u00ed\u010dek, \u010dern\u00fd pep\u0159, sko\u0159ice',
    color: '#f43f5e',
    gradient: 'from-rose-500/20 to-red-500/20',
    detail: 'Jedin\u00fd terp\u00e9n, kter\u00fd se p\u0159\u00edmo v\u00e1\u017ee na CB2 receptory endokanabinoidn\u00edho syst\u00e9mu. Siln\u011b protiz\u00e1n\u011btliv\u00fd.',
  },
  {
    name: 'Linalool',
    icon: Flower2,
    aroma: 'Kv\u011btinov\u00e1, levandulov\u00e1',
    effect: 'Uklidn\u011bn\u00ed, sp\u00e1nek',
    found: 'Levandule, bazalka, b\u0159\u00edza',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-violet-500/20',
    detail: 'Sedativn\u00ed terp\u00e9n s prokazateln\u00fdmi anxiolytick\u00fdmi \u00fa\u010dinky. Pou\u017e\u00edv\u00e1 se v aromaterapii ke zlep\u0161en\u00ed kvality sp\u00e1nku.',
  },
  {
    name: '\u03b1-Pinen',
    icon: TreePine,
    aroma: 'Borovicov\u00e1, pryskyřičn\u00e1',
    effect: 'Soust\u0159ed\u011bn\u00ed, jasnost',
    found: 'Borovice, rozmar\u00fdn, \u0161alv\u011bj',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-teal-500/20',
    detail: 'Bronchodilat\u00e1tor \u2014 otev\u00edr\u00e1 d\u00fdchac\u00ed cesty. Zlep\u0161uje pam\u011b\u0165 a soust\u0159ed\u011bn\u00ed. Nejroz\u0161\u00ed\u0159en\u011bj\u0161\u00ed terp\u00e9n v p\u0159\u00edrod\u011b v\u016fbec.',
  },
];

/* ═══════════════════════════════════════════
   ROOMS DATA
   ═══════════════════════════════════════════ */
const academyRooms = [
  {
    id: 'knihovna',
    title: 'Knihovna',
    subtitle: 'Znalosti & Pr\u016fvodci',
    description: 'Odborn\u00e9 \u010dl\u00e1nky o kanabinoidech, terp\u00e9nech a botanick\u00e9m sv\u011bt\u011b. Ka\u017ed\u00fd \u010dl\u00e1nek pe\u010dliv\u011b zpracovan\u00fd na\u0161imi odborn\u00edky.',
    icon: BookOpen,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    glowColor: 'rgba(16,185,129,0.15)',
    accentColor: '#10b981',
    iconBg: 'bg-emerald-500/10',
    articles: ['Vzd\u011bl\u00e1n\u00ed', 'Pr\u016fvodce', 'Srovn\u00e1n\u00ed'],
  },
  {
    id: 'laborator',
    title: 'Laborato\u0159',
    subtitle: 'V\u011bda & V\u00fdzkum',
    description: 'Pono\u0159te se do v\u011bdy za kanabinoidy. Chemick\u00e9 slo\u017een\u00ed, terp\u00e9nov\u00e9 profily a entourage effect \u2014 v\u0161e vysv\u011btlen\u00e9 srozumiteln\u011b.',
    icon: FlaskConical,
    gradient: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/30',
    glowColor: 'rgba(168,85,247,0.15)',
    accentColor: '#a855f7',
    iconBg: 'bg-purple-500/10',
    articles: ['V\u011bda'],
  },
  {
    id: 'zahrada',
    title: 'Botanick\u00e1 zahrada',
    subtitle: 'Odr\u016fdy & P\u00e9\u010de',
    description: 'Pr\u016fvodce odr\u016fdami, skladov\u00e1n\u00ed, kvalita kv\u011bt\u016f. V\u0161e co pot\u0159ebujete v\u011bd\u011bt o botanick\u00e9m sv\u011bt\u011b THC-X.',
    icon: Leaf,
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    glowColor: 'rgba(245,158,11,0.15)',
    accentColor: '#f59e0b',
    iconBg: 'bg-amber-500/10',
    articles: ['Tipy'],
  },
  {
    id: 'relaxacni-zona',
    title: 'Relaxa\u010dn\u00ed z\u00f3na',
    subtitle: 'Klid & Inspirace',
    description: 'Oddychov\u00e1 m\u00edstnost akademie. Zaj\u00edmavosti ze sv\u011bta botaniky, tipy na relax a n\u011bco nav\u00edc pro va\u0161i pohodu.',
    icon: Moon,
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
    glowColor: 'rgba(6,182,212,0.15)',
    accentColor: '#06b6d4',
    iconBg: 'bg-cyan-500/10',
    articles: [],
  },
];

/* ═══════════════════════════════════════════
   SECRET FACTS
   ═══════════════════════════════════════════ */
const secretFacts = [
  {
    icon: Brain,
    title: 'V\u011bd\u011bli jste?',
    text: 'Lidsk\u00e9 t\u011blo m\u00e1 vlastn\u00ed endokanabinoidn\u00ed syst\u00e9m \u2014 objeven\u00fd a\u017e v roce 1992. Reguluje n\u00e1ladu, bolest i apetit.',
    color: '#a855f7',
  },
  {
    icon: TreePine,
    title: 'Botanick\u00fd fakt',
    text: 'Konop\u00ed je jedna z nejstar\u0161\u00edch kulturn\u00edch rostlin. Prvn\u00ed z\u00e1znamy o p\u011bstov\u00e1n\u00ed poch\u00e1zej\u00ed z \u010c\u00edny \u2014 asi 8 000 let p\u0159ed na\u0161\u00edm letopo\u010dtem.',
    color: '#10b981',
  },
  {
    icon: Zap,
    title: 'V\u011bda & praxe',
    text: 'Terp\u00e9ny nejsou jen v konop\u00ed. Limonen najdete v citronech, myrcen v chmelu a linalool v levanduli.',
    color: '#f59e0b',
  },
  {
    icon: Heart,
    title: 'Wellness tip',
    text: 'CBD kv\u011bty v aromaterapii mohou pomoci sn\u00ed\u017eit stres. Zkuste je nap\u0159. v s\u00e1\u010dku pod polst\u00e1\u0159 \u2014 jemn\u00e1 aromata pom\u00e1haj\u00ed p\u0159i us\u00edp\u00e1n\u00ed.',
    color: '#06b6d4',
  },
  {
    icon: Shield,
    title: 'Kvalita je z\u00e1klad',
    text: 'Pr\u00e9miov\u00fd THC-X kv\u011bt m\u00e1 viditeln\u00e9 trichomy (krystalky), sytou barvu a v\u00fdrazn\u00e9 aroma. Bez laboratorn\u00edho testu nekupujte.',
    color: '#f43f5e',
  },
  {
    icon: Coffee,
    title: 'Komunita',
    text: 'Sb\u011bratelstv\u00ed kanabinoidn\u00edch kv\u011bt\u016f je jako sb\u00edr\u00e1n\u00ed vz\u00e1cn\u00fdch \u010daj\u016f. Ka\u017ed\u00e1 odr\u016fda m\u00e1 sv\u016fj unik\u00e1tn\u00ed \u201efingerprint\u201c.',
    color: '#8b5cf6',
  },
  {
    icon: Droplets,
    title: 'Entourage effect',
    text: 'Kanabinoidy a terp\u00e9ny spolu\u00fa\u010dinkuj\u00ed synergicky. Full-spectrum extrakty jsou proto \u00fa\u010dinn\u011bj\u0161\u00ed ne\u017e izolovan\u00e9 slou\u010deniny.',
    color: '#10b981',
  },
  {
    icon: Gem,
    title: 'Sb\u011bratelstv\u00ed',
    text: 'Nejcenn\u011bj\u0161\u00ed odr\u016fdy THC-X se pozn\u00e1 podle hustoty trichom\u016f, v\u00fdraznosti aroma a vizuální atraktivity kvetu.',
    color: '#f59e0b',
  },
  {
    icon: CloudRain,
    title: 'Skladov\u00e1n\u00ed',
    text: 'Ide\u00e1ln\u00ed vlhkost pro uchov\u00e1n\u00ed kv\u011bt\u016f je 55\u201362 %. P\u0159\u00edli\u0161 sucho l\u00e1me trichomy, p\u0159\u00edli\u0161 vlhko pl\u00edsn\u011b.',
    color: '#a855f7',
  },
];

/* ═══════════════════════════════════════════
   RELAXATION QUOTES
   ═══════════════════════════════════════════ */
const relaxQuotes = [
  'P\u0159\u00edroda nep\u011bch\u00e1, a p\u0159esto v\u0161echno stihne. \u2014 Lao-c\u2019',
  'Nejlep\u0161\u00ed \u010das na zasazen\u00ed stromu byl p\u0159ed 20 lety. Druh\u00fd nejlep\u0161\u00ed \u010das je te\u010f.',
  'Kde kvete trp\u011blivost, tam roste i moudrost.',
  'V ka\u017ed\u00e9m sem\u00ednku je p\u0159\u00edslib cel\u00e9ho lesa.',
  'Kdo rozum\u00ed rostlin\u00e1m, rozum\u00ed \u017eivotu.',
  'Ticho lesa l\u00e9\u010d\u00ed v\u00edce ne\u017e tis\u00edc slov.',
  '\u010clov\u011bk, kter\u00fd h\u00fdb\u00ed kv\u011btinu, nem\u016f\u017ee b\u00fdt \u0161patn\u00fd. \u2014 B. Nemo',
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function Academy() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [visibleFacts, setVisibleFacts] = useState(3);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [activeTerpene, setActiveTerpene] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentQuote(p => (p + 1) % relaxQuotes.length), 6000);
    return () => clearInterval(t);
  }, []);

  const getArticlesForRoom = (room: typeof academyRooms[0]) =>
    room.articles.length === 0 ? [] : blogPosts.filter(p => room.articles.includes(p.category));

  const tp = terpenes[activeTerpene];
  const TpIcon = tp.icon;

  return (
    <div className="min-h-screen text-white relative">
      <AcademyParticles />

      {/* ────── HERO ────── */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 md:pt-40 pb-16 md:pb-24 px-6">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 40% 50% at 30% 60%, rgba(168,85,247,0.05) 0%, transparent 70%)' }} />

        <MysticalBook />

        <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-emerald-400/5 border border-emerald-400/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-emerald-400 text-sm font-bold tracking-[0.2em] uppercase">Tajn\u00e1 Akademie</span>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-6 leading-tight">
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">Poznej</span>
          <br />
          <span className="text-white">tajemstv\u00ed </span>
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent">botaniky</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-center mb-10 leading-relaxed">
          V\u00edtej v akademii, kde se sv\u011bt rostlin a kanabinoid\u016f otv\u00edr\u00e1 jinak ne\u017e kdekoliv jinde.
          Prozkoumej, u\u010d se, relaxuj.
        </p>

        <div className="flex flex-col items-center gap-2 text-gray-600 animate-bounce" style={{ animationDuration: '3s' }}>
          <span className="text-xs tracking-widest uppercase">Prozkoumej</span>
          <div className="w-px h-8 bg-gradient-to-b from-emerald-500/50 to-transparent" />
        </div>
      </section>

      {/* ────── ROOMS ────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            <span className="text-white">M\u00edstnosti </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">akademie</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">Ka\u017ed\u00e1 m\u00edstnost skr\u00fdv\u00e1 n\u011bco jin\u00e9ho. Vyber si, kam chce\u0161 vstoupit.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {academyRooms.map(room => {
            const Icon = room.icon;
            const articles = getArticlesForRoom(room);
            const isActive = activeRoom === room.id;

            return (
              <div
                key={room.id}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer ${isActive ? 'md:col-span-2' : ''}`}
                onClick={() => setActiveRoom(isActive ? null : room.id)}
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
                  border: `1px solid ${isActive ? room.accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isActive ? `0 0 60px ${room.glowColor}, inset 0 0 60px ${room.glowColor}` : '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${room.gradient} transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />

                <div className="relative p-8 md:p-10">
                  <div className="flex items-start gap-5 mb-6">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${room.iconBg} border ${room.borderColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-7 h-7" style={{ color: room.accentColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-2xl font-black text-white">{room.title}</h3>
                        {articles.length > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: room.accentColor + '15', color: room.accentColor, border: `1px solid ${room.accentColor}30` }}>
                            {articles.length} {articles.length === 1 ? '\u010dl\u00e1nek' : articles.length < 5 ? '\u010dl\u00e1nky' : '\u010dl\u00e1nk\u016f'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium" style={{ color: room.accentColor }}>{room.subtitle}</p>
                    </div>
                    <ChevronRight className={`w-6 h-6 text-gray-600 transition-transform duration-300 flex-shrink-0 ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-4">{room.description}</p>

                  {/* Expanded articles */}
                  {isActive && articles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/5" style={{ animation: 'acFadeIn 0.4s ease-out' }}>
                      {articles.map(post => (
                        <Link key={post.slug} to={`/blog/${post.slug}`}
                          className="group/card flex gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/5"
                          onClick={e => e.stopPropagation()}
                          style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: post.accentColor + '15' }}>
                            <Tag className="w-4 h-4" style={{ color: post.accentColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover/card:text-emerald-300 transition-colors">{post.title}</h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                              <span>{post.date}</span>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1 transition-transform duration-300 group-hover/card:translate-x-1"
                            style={{ color: room.accentColor }} />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Relaxation zone */}
                  {isActive && room.id === 'relaxacni-zona' && (
                    <div className="mt-6 pt-6 border-t border-white/5" style={{ animation: 'acFadeIn 0.4s ease-out' }}>
                      <div className="relative rounded-2xl p-8 md:p-10 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.05), rgba(168,85,247,0.05))', border: '1px solid rgba(6,182,212,0.1)' }}>
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: 'radial-gradient(circle at 30% 50%, rgba(6,182,212,0.08) 0%, transparent 50%)', animation: 'acBreath 8s ease-in-out infinite' }} />
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: 'radial-gradient(circle at 70% 40%, rgba(168,85,247,0.06) 0%, transparent 50%)', animation: 'acBreath 8s ease-in-out infinite 4s' }} />

                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                            <Wind className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm font-bold text-cyan-400 tracking-wider uppercase">Moment klidu</span>
                          </div>

                          <div className="min-h-[80px] flex items-center">
                            <p className="text-xl md:text-2xl text-gray-300 italic leading-relaxed"
                              key={currentQuote}
                              style={{ animation: 'acFadeIn 1s ease-out' }}>
                              &ldquo;{relaxQuotes[currentQuote]}&rdquo;
                            </p>
                          </div>

                          <div className="flex gap-2 mt-6">
                            {relaxQuotes.map((_, i) => (
                              <button key={i}
                                onClick={e => { e.stopPropagation(); setCurrentQuote(i); }}
                                className={`h-2 rounded-full transition-all duration-300 ${i === currentQuote ? 'bg-cyan-400 w-6' : 'bg-white/10 hover:bg-white/20 w-2'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Mini wellness tips */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                        {[
                          { icon: Moon, text: 'Aromata levandule a linaloolu zklid\u0148uj\u00ed mysl p\u0159ed sp\u00e1nkem.', c: '#a855f7' },
                          { icon: Sun, text: 'Citrusov\u00e9 terp\u00e9ny (limonen) p\u0159irozen\u011b vyja\u0161\u0148uj\u00ed n\u00e1ladu.', c: '#f59e0b' },
                          { icon: Wind, text: 'Hluboko nadechnout, zadr\u017eet, pomalu vydechnout. Opakuj 3\u00d7.', c: '#06b6d4' },
                        ].map((tip, i) => {
                          const TIcon = tip.icon;
                          return (
                            <div key={i} className="rounded-xl p-4" onClick={e => e.stopPropagation()}
                              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tip.c}10` }}>
                              <TIcon className="w-4 h-4 mb-2" style={{ color: tip.c }} />
                              <p className="text-xs text-gray-500 leading-relaxed">{tip.text}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────── TERPENE EXPLORER ────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-amber-400/5 border border-amber-400/20">
            <Microscope className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-xs font-bold tracking-wider uppercase">Interaktivn\u00ed pr\u016fvodce</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            <span className="text-white">Sv\u011bt </span>
            <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">terp\u00e9n\u016f</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">Klikni na terp\u00e9n a zjisti, jak p\u016fsob\u00ed, kde se vyskytuje a pro\u010d je d\u016fle\u017eit\u00fd.</p>
        </div>

        <div className="relative rounded-3xl overflow-hidden p-6 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.8))',
            border: `1px solid ${tp.color}20`,
            boxShadow: `0 0 80px ${tp.color}08`,
            transition: 'border-color 0.5s, box-shadow 0.5s',
          }}>

          {/* Background glow that changes with terpene */}
          <div className="absolute inset-0 pointer-events-none transition-all duration-700"
            style={{ background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${tp.color}06 0%, transparent 70%)` }} />

          {/* Terpene selector pills */}
          <div className="relative z-10 flex flex-wrap gap-2 mb-8 justify-center">
            {terpenes.map((t, i) => {
              const TIcon = t.icon;
              return (
                <button key={i} onClick={() => setActiveTerpene(i)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                    i === activeTerpene ? 'scale-105' : 'opacity-60 hover:opacity-90'
                  }`}
                  style={{
                    background: i === activeTerpene ? t.color + '20' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${i === activeTerpene ? t.color + '40' : 'rgba(255,255,255,0.06)'}`,
                    color: i === activeTerpene ? t.color : '#9ca3af',
                    boxShadow: i === activeTerpene ? `0 0 20px ${t.color}15` : 'none',
                  }}>
                  <TIcon className="w-4 h-4" />
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Active terpene detail */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6" key={activeTerpene}
            style={{ animation: 'acFadeIn 0.4s ease-out' }}>

            {/* Main info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: tp.color + '15', border: `1px solid ${tp.color}30` }}>
                  <TpIcon className="w-8 h-8" style={{ color: tp.color }} />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white">{tp.name}</h3>
                  <p className="text-sm" style={{ color: tp.color }}>{tp.aroma}</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg mb-6">{tp.detail}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Leaf className="w-4 h-4" style={{ color: tp.color }} />
                <span>Najdete tak\u00e9 v: <strong className="text-gray-300">{tp.found}</strong></span>
              </div>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tp.color}15` }}>
              <h4 className="text-xs font-bold tracking-wider uppercase mb-4" style={{ color: tp.color }}>Profil</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-400">Aroma</span>
                    <span className="text-white font-medium">{tp.aroma}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ background: tp.color, width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-400">\u00da\u010dinek</span>
                    <span className="text-white font-medium">{tp.effect}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ background: tp.color, width: '75%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-400">V\u00fdskyt v konop\u00ed</span>
                    <span className="text-white font-medium">\u010cast\u00fd</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ background: tp.color, width: ['90%', '70%', '60%', '50%', '80%'][activeTerpene] }} />
                  </div>
                </div>
              </div>

              <Link to="/blog/terpeny-tajemstvi-aroma"
                className="flex items-center gap-2 mt-6 text-sm font-bold transition-all duration-300 hover:gap-3"
                style={{ color: tp.color }}>
                V\u00edce o terp\u00e9nech
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ────── SECRET FACTS ────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.8))',
            border: '1px solid rgba(168,85,247,0.15)',
            boxShadow: '0 0 80px rgba(168,85,247,0.05)',
          }}>
          <div className="absolute top-4 right-4 text-purple-500/20"><Sparkles className="w-8 h-8" /></div>
          <div className="absolute bottom-4 left-4 text-emerald-500/20"><Sparkles className="w-6 h-6" /></div>

          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Tajemstv\u00ed{' '}
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">z hlubin</span>
            </h2>
          </div>
          <p className="text-gray-500 mb-10">Zaj\u00edmavosti, fakta a tipy ze sv\u011bta botaniky a kanabinoid\u016f.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {secretFacts.slice(0, visibleFacts).map((fact, i) => {
              const FIcon = fact.icon;
              return (
                <div key={i} className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${fact.color}15`,
                    animation: 'acFadeIn 0.5s ease-out',
                    animationDelay: `${i * 0.08}s`,
                    animationFillMode: 'backwards',
                  }}>
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ boxShadow: `inset 0 0 40px ${fact.color}08` }} />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: fact.color + '15' }}>
                        <FIcon className="w-4 h-4" style={{ color: fact.color }} />
                      </div>
                      <span className="text-xs font-bold tracking-wider uppercase" style={{ color: fact.color }}>{fact.title}</span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{fact.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleFacts < secretFacts.length && (
            <div className="text-center mt-8">
              <button onClick={() => setVisibleFacts(secretFacts.length)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-purple-400 transition-all duration-300 hover:scale-105 hover:gap-3"
                style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <Eye className="w-4 h-4" />
                Odhalit dal\u0161\u00ed tajemstv\u00ed
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ────── ALL ARTICLES CTA ────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24">
        <div className="text-center">
          <div className="inline-block rounded-3xl p-10 md:p-14"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(6,182,212,0.05))', border: '1px solid rgba(16,185,129,0.15)' }}>
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">V\u0161echny \u010dl\u00e1nky na jednom m\u00edst\u011b</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {blogPosts.length} odborn\u00edch \u010dl\u00e1nk\u016f o THC-X, terp\u00e9nech, CBD a sv\u011bt\u011b botaniky. Neust\u00e1le p\u0159id\u00e1v\u00e1me nov\u00e9.
            </p>
            <Link to="/blog"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))', border: '1px solid rgba(16,185,129,0.3)', boxShadow: '0 0 30px rgba(16,185,129,0.1)' }}>
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Otev\u0159\u00edt knihovnu
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ────── COMING SOON ────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-32">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-yellow-400/5 border border-yellow-400/20">
            <Flame className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold tracking-wider uppercase">P\u0159ipravujeme</span>
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Co chyst\u00e1me d\u00e1l?</h3>
          <p className="text-gray-500 text-sm">Akademie se neust\u00e1le rozv\u00edj\u00ed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Star, title: 'Bodov\u00fd syst\u00e9m', desc: 'Sb\u00edrej body za objedn\u00e1vky a odemykej odm\u011bny, slevy a exkluzivn\u00ed obsah.', color: '#f59e0b' },
            { icon: Microscope, title: 'Interaktivn\u00ed pr\u016fvodce', desc: 'Vizu\u00e1ln\u00ed pr\u016fvodce sv\u011btem terp\u00e9n\u016f s interaktivn\u00edmi kartami a animacemi.', color: '#a855f7' },
            { icon: Heart, title: 'Komunita', desc: 'Diskuze, \u017eeb\u0159\u00ed\u010dek sb\u011bratel\u016f a sd\u00edlen\u00ed zku\u0161enost\u00ed s ostatn\u00edmi botaniky.', color: '#f43f5e' },
          ].map((item, i) => {
            const CIcon = item.icon;
            return (
              <div key={i} className="relative rounded-2xl p-6 text-center opacity-60"
                style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${item.color}10` }}>
                <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: item.color + '10' }}>
                  <CIcon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 text-gray-600">Brzy</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────── ANIMATIONS ────── */}
      <style>{`
        @keyframes acFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(15px); opacity: 0.7; }
        }
        @keyframes acSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes acOrbit {
          from { transform: rotate(0deg) translateX(65px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(65px) rotate(-360deg); }
        }
        @keyframes acFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes acBreath {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
