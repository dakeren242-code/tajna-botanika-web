import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Sparkles, Microscope, Leaf, Wind, ArrowRight,
  Clock, Tag, ChevronRight, Star, Eye, FlaskConical, TreePine,
  Moon, Zap, Heart, Brain, Shield, Flame, Coffee
} from 'lucide-react';
import { blogPosts } from '../components/BlogSection';

/* ─── Floating particles ─── */
function AcademyParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: [
              'rgba(16,185,129,0.3)',
              'rgba(168,85,247,0.3)',
              'rgba(245,158,11,0.2)',
              'rgba(6,182,212,0.2)',
            ][i % 4],
            animation: `academyFloat ${8 + Math.random() * 12}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Mystical book icon (animated) ─── */
function MysticalBook() {
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)',
          animation: 'academySpin 20s linear infinite',
        }}
      />
      {/* Inner icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-emerald-400" strokeWidth={1} />
          <Sparkles
            className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse"
            style={{ animationDelay: '0.5s' }}
          />
          <Sparkles
            className="absolute -bottom-1 -left-3 w-4 h-4 text-purple-400 animate-pulse"
            style={{ animationDelay: '1.2s' }}
          />
        </div>
      </div>
      {/* Orbiting dots */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#10b981', '#a855f7', '#f59e0b'][i],
            top: '50%',
            left: '50%',
            transformOrigin: `0 0`,
            animation: `academyOrbit ${6 + i * 2}s linear infinite`,
            animationDelay: `${i * 1.5}s`,
            boxShadow: `0 0 8px ${['#10b981', '#a855f7', '#f59e0b'][i]}`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Category rooms ─── */
const academyRooms = [
  {
    id: 'knihovna',
    title: 'Knihovna',
    subtitle: 'Znalosti & Pruvodci',
    description: 'Odborne clanky o kanabinoidech, terpenech a botanickem svete. Kazdy clanek peclive zpracovany nasimi odborniki.',
    icon: BookOpen,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    glowColor: 'rgba(16,185,129,0.15)',
    accentColor: '#10b981',
    iconBg: 'bg-emerald-500/10',
    articles: ['Vzdělání', 'Průvodce', 'Srovnání'],
  },
  {
    id: 'laborator',
    title: 'Laborator',
    subtitle: 'Veda & Vyzkum',
    description: 'Potopit se do vedy za kanabinoidy. Chemicke slozeni, terpenove profily a entourage effect — vse vysvetlene srozumitelne.',
    icon: FlaskConical,
    gradient: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/30',
    glowColor: 'rgba(168,85,247,0.15)',
    accentColor: '#a855f7',
    iconBg: 'bg-purple-500/10',
    articles: ['Věda'],
  },
  {
    id: 'zahrada',
    title: 'Botanicka zahrada',
    subtitle: 'Odrudy & Pece',
    description: 'Pruvodce odrudami, skladovani, kvalita kvetu. Vse co potrebujete vedet o botanickem svete THC-X.',
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
    title: 'Relaxacni zona',
    subtitle: 'Klid & Inspirace',
    description: 'Oddychova mistnost akademie. Zajimavosti ze sveta botaniky, tipy na relax a neco navic pro vasi pohodu.',
    icon: Moon,
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
    glowColor: 'rgba(6,182,212,0.15)',
    accentColor: '#06b6d4',
    iconBg: 'bg-cyan-500/10',
    articles: [],
  },
];

/* ─── Fun facts for secret section ─── */
const secretFacts = [
  {
    icon: Brain,
    title: 'Vedeli jste?',
    text: 'Lidske telo ma vlastni endokanabinoidni system — objeveny az v roce 1992. Reguluje naladu, bolest i apetit.',
    color: '#a855f7',
  },
  {
    icon: TreePine,
    title: 'Botanicky fakt',
    text: 'Konopi je jedna z nejstarsich kulturnich rostlin. Prvni zaznamy o pestovani pochazeji z Ciny — asi 8 000 let pred nasim letopoctem.',
    color: '#10b981',
  },
  {
    icon: Zap,
    title: 'Veda & praxe',
    text: 'Terpeny nejsou jen v konopi. Limonen najdete v citronech, myrcen v chmelu a linalool v levanduli.',
    color: '#f59e0b',
  },
  {
    icon: Heart,
    title: 'Wellness tip',
    text: 'CBD kvety v aromaterapii mohou pomoci snizit stres. Zkuste je napr. v sacku pod polstar — jemne aromata pomahaji pri usipani.',
    color: '#06b6d4',
  },
  {
    icon: Shield,
    title: 'Kvalita je zaklad',
    text: 'Premie THC-X kvet ma viditelne trichomy (krystalky), sytou barvu a vyrazne aroma. Bez laboratorniho testu nekupujte.',
    color: '#f43f5e',
  },
  {
    icon: Coffee,
    title: 'Komunita',
    text: 'Sberatelstvi kanabinoidnich kvetu je jako sbírání vzácných caju. Kazda odruda ma svuj unikatni "fingerprint".',
    color: '#8b5cf6',
  },
];

/* ─── Relaxation quotes ─── */
const relaxQuotes = [
  'Priroda nespecha, a presto vsechno stihne. — Lao-c\u2019',
  'Nejlepsi cas na zasazeni stromu byl pred 20 lety. Druhy nejlepsi cas je ted.',
  'Kde kvete trpelivost, tam roste i moudrost.',
  'V kazdem semeni je prislib celeho lesa.',
  'Kdo rozumi rostlinam, rozumi zivotu.',
];

/* ─── Main Academy component ─── */
export default function Academy() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [visibleFacts, setVisibleFacts] = useState(3);
  const [currentQuote, setCurrentQuote] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentQuote((p) => (p + 1) % relaxQuotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Get articles for a room
  const getArticlesForRoom = (room: typeof academyRooms[0]) => {
    if (room.articles.length === 0) return [];
    return blogPosts.filter((p) => room.articles.includes(p.category));
  };

  return (
    <div className="min-h-screen text-white relative">
      <AcademyParticles />

      {/* ────────── HERO ────────── */}
      <section
        ref={heroRef}
        className="relative z-10 flex flex-col items-center justify-center pt-32 md:pt-40 pb-16 md:pb-24 px-6"
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(16,185,129,0.08) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 40% 50% at 30% 60%, rgba(168,85,247,0.05) 0%, transparent 70%)',
          }}
        />

        <MysticalBook />

        <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-emerald-400/5 border border-emerald-400/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-emerald-400 text-sm font-bold tracking-[0.2em] uppercase">
            Tajna Akademie
          </span>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-6 leading-tight">
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
            Poznej
          </span>
          <br />
          <span className="text-white">tajemstvi </span>
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent">
            botaniky
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-center mb-10 leading-relaxed">
          Vitej v akademii, kde se svet rostlin a kanabinoidu otvira jinak nez kdekoliv jinde.
          Prozkoumej, uci se, relaxuj.
        </p>

        {/* Scroll indicator */}
        <div className="flex flex-col items-center gap-2 text-gray-600 animate-bounce" style={{ animationDuration: '3s' }}>
          <span className="text-xs tracking-widest uppercase">Prozkoumej</span>
          <div className="w-px h-8 bg-gradient-to-b from-emerald-500/50 to-transparent" />
        </div>
      </section>

      {/* ────────── ROOMS (Categories) ────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            <span className="text-white">Mistnosti </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              akademie
            </span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Kazda mistnost skryva neco jineho. Vyber si, kam chces vstoupit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {academyRooms.map((room) => {
            const Icon = room.icon;
            const articles = getArticlesForRoom(room);
            const isActive = activeRoom === room.id;

            return (
              <div
                key={room.id}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  isActive ? 'md:col-span-2' : ''
                }`}
                onClick={() => setActiveRoom(isActive ? null : room.id)}
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
                  border: `1px solid ${isActive ? room.accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isActive
                    ? `0 0 60px ${room.glowColor}, inset 0 0 60px ${room.glowColor}`
                    : '0 8px 32px rgba(0,0,0,0.4)',
                }}
              >
                {/* Background gradient on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${room.gradient} transition-opacity duration-500 ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'
                  }`}
                />

                <div className="relative p-8 md:p-10">
                  <div className="flex items-start gap-5 mb-6">
                    <div
                      className={`flex-shrink-0 w-14 h-14 rounded-2xl ${room.iconBg} border ${room.borderColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}
                    >
                      <Icon className="w-7 h-7" style={{ color: room.accentColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-white">{room.title}</h3>
                        {articles.length > 0 && (
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              background: room.accentColor + '15',
                              color: room.accentColor,
                              border: `1px solid ${room.accentColor}30`,
                            }}
                          >
                            {articles.length} {articles.length === 1 ? 'clanek' : articles.length < 5 ? 'clanky' : 'clanku'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium" style={{ color: room.accentColor }}>
                        {room.subtitle}
                      </p>
                    </div>
                    <ChevronRight
                      className={`w-6 h-6 text-gray-600 transition-transform duration-300 flex-shrink-0 ${
                        isActive ? 'rotate-90' : 'group-hover:translate-x-1'
                      }`}
                    />
                  </div>

                  <p className="text-gray-400 leading-relaxed mb-6">{room.description}</p>

                  {/* Expanded: show articles */}
                  {isActive && articles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                      {articles.map((post) => (
                        <Link
                          key={post.slug}
                          to={`/blog/${post.slug}`}
                          className="group/card flex gap-4 p-4 rounded-2xl transition-all duration-300 hover:bg-white/5"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            border: '1px solid rgba(255,255,255,0.04)',
                          }}
                        >
                          <div
                            className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: post.accentColor + '15' }}
                          >
                            <Tag className="w-4 h-4" style={{ color: post.accentColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white mb-1 line-clamp-2 group-hover/card:text-emerald-300 transition-colors">
                              {post.title}
                            </h4>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.readTime}
                              </span>
                              <span>{post.date}</span>
                            </div>
                          </div>
                          <ArrowRight
                            className="w-4 h-4 text-gray-600 flex-shrink-0 mt-1 transition-transform duration-300 group-hover/card:translate-x-1"
                            style={{ color: room.accentColor }}
                          />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Relaxation zone special content */}
                  {isActive && room.id === 'relaxacni-zona' && (
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div
                        className="relative rounded-2xl p-8 md:p-10 overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, rgba(6,182,212,0.05), rgba(168,85,247,0.05))',
                          border: '1px solid rgba(6,182,212,0.1)',
                        }}
                      >
                        {/* Animated ambient glow */}
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle at 30% 50%, rgba(6,182,212,0.08) 0%, transparent 50%)',
                            animation: 'academyBreath 8s ease-in-out infinite',
                          }}
                        />
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle at 70% 40%, rgba(168,85,247,0.06) 0%, transparent 50%)',
                            animation: 'academyBreath 8s ease-in-out infinite 4s',
                          }}
                        />

                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                            <Wind className="w-5 h-5 text-cyan-400" />
                            <span className="text-sm font-bold text-cyan-400 tracking-wider uppercase">
                              Moment klidu
                            </span>
                          </div>

                          <div className="min-h-[80px] flex items-center">
                            <p
                              className="text-xl md:text-2xl text-gray-300 italic leading-relaxed transition-all duration-1000"
                              key={currentQuote}
                              style={{ animation: 'academyFadeIn 1s ease-out' }}
                            >
                              &ldquo;{relaxQuotes[currentQuote]}&rdquo;
                            </p>
                          </div>

                          <div className="flex gap-2 mt-6">
                            {relaxQuotes.map((_, i) => (
                              <button
                                key={i}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentQuote(i);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                  i === currentQuote
                                    ? 'bg-cyan-400 w-6'
                                    : 'bg-white/10 hover:bg-white/20'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-center text-gray-600 text-sm mt-6">
                        Brzy zde: guided relaxace, ambient zvuky a dalsi obsah pro vasi pohodu.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────── SECRET FACTS ────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden p-8 md:p-12"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.8))',
            border: '1px solid rgba(168,85,247,0.15)',
            boxShadow: '0 0 80px rgba(168,85,247,0.05)',
          }}
        >
          {/* Decorative corner sparkles */}
          <div className="absolute top-4 right-4 text-purple-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="absolute bottom-4 left-4 text-emerald-500/20">
            <Sparkles className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Tajemstvi{' '}
              <span className="bg-gradient-to-r from-purple-400 to-violet-300 bg-clip-text text-transparent">
                z hlubin
              </span>
            </h2>
          </div>
          <p className="text-gray-500 mb-10">
            Zajimavosti, fakta a tipy ze sveta botaniky a kanabinoidu.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {secretFacts.slice(0, visibleFacts).map((fact, i) => {
              const Icon = fact.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: `1px solid ${fact.color}15`,
                    animation: 'academyFadeIn 0.5s ease-out',
                    animationDelay: `${i * 0.1}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      boxShadow: `inset 0 0 40px ${fact.color}08`,
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: fact.color + '15' }}
                      >
                        <Icon className="w-4 h-4" style={{ color: fact.color }} />
                      </div>
                      <span className="text-xs font-bold tracking-wider uppercase" style={{ color: fact.color }}>
                        {fact.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 leading-relaxed">{fact.text}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {visibleFacts < secretFacts.length && (
            <div className="text-center mt-8">
              <button
                onClick={() => setVisibleFacts(secretFacts.length)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-purple-400 transition-all duration-300 hover:scale-105 hover:gap-3"
                style={{
                  background: 'rgba(168,85,247,0.1)',
                  border: '1px solid rgba(168,85,247,0.2)',
                }}
              >
                <Eye className="w-4 h-4" />
                Odhalit dalsi tajemstvi
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ────────── ALL ARTICLES CTA ────────── */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-32">
        <div className="text-center">
          <div
            className="inline-block rounded-3xl p-10 md:p-14"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.05), rgba(6,182,212,0.05))',
              border: '1px solid rgba(16,185,129,0.15)',
            }}
          >
            <Star className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
              Vsechny clanky na jednom miste
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              {blogPosts.length} odbornich clanku o THC-X, terpenech, CBD a svete botaniky. Neustale pridavame nove.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full font-bold text-white transition-all duration-300 hover:scale-105 hover:gap-4"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
                border: '1px solid rgba(16,185,129,0.3)',
                boxShadow: '0 0 30px rgba(16,185,129,0.1)',
              }}
            >
              <BookOpen className="w-5 h-5 text-emerald-400" />
              Otevrit knihovnu
              <ArrowRight className="w-5 h-5 text-emerald-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* ────────── COMING SOON TEASER ────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-yellow-400/5 border border-yellow-400/20">
            <Flame className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-bold tracking-wider uppercase">
              Pripravujeme
            </span>
          </div>
          <h3 className="text-2xl font-black text-white mb-2">Co chystame dal?</h3>
          <p className="text-gray-500 text-sm">Akademie se neustale rozviji.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Star,
              title: 'Bodovy system',
              desc: 'Sbirej body za objednavky a odemykej odmeny, slevy a exkluzivni obsah.',
              color: '#f59e0b',
            },
            {
              icon: Microscope,
              title: 'Interaktivni pruvodce',
              desc: 'Vizualni pruvodce svetem terpenu s interaktivnimi kartami a animacemi.',
              color: '#a855f7',
            },
            {
              icon: Heart,
              title: 'Komunita',
              desc: 'Diskuze, zebricek sberatelu a sdileni zkusenosti s ostatnimi botaniky.',
              color: '#f43f5e',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="relative rounded-2xl p-6 text-center opacity-70"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${item.color}10`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: item.color + '10' }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{item.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────── ANIMATIONS ────────── */}
      <style>{`
        @keyframes academyFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(15px); opacity: 0.7; }
        }
        @keyframes academySpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes academyOrbit {
          from { transform: rotate(0deg) translateX(60px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(60px) rotate(-360deg); }
        }
        @keyframes academyFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes academyBreath {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
