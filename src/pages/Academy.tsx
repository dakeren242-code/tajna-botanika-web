import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Sparkles, Leaf, Wind, ArrowRight, ArrowLeft,
  Clock, Tag, ChevronRight, FlaskConical,
  Moon, Heart, Brain, CheckCircle2, XCircle, Trophy,
  Flower2, Droplets, Sun, TreePine, Flame
} from 'lucide-react';
import { blogPosts } from '../components/BlogSection';

/* ═══════════════════════════════════════════
   PARTICLES
   ═══════════════════════════════════════════ */
function AcademyParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 25 }).map((_, i) => ({
      w: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      bg: ['rgba(16,185,129,0.2)', 'rgba(168,85,247,0.2)', 'rgba(245,158,11,0.15)', 'rgba(6,182,212,0.15)'][i % 4],
      dur: 10 + Math.random() * 12,
      del: Math.random() * 5,
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div key={i} className="absolute rounded-full"
          style={{ width: p.w, height: p.w, left: `${p.x}%`, top: `${p.y}%`, background: p.bg,
            animation: `acFloat ${p.dur}s ease-in-out infinite`, animationDelay: `${p.del}s` }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   HERO BOOK
   ═══════════════════════════════════════════ */
function MysticalBook() {
  return (
    <div className="relative w-36 h-36 md:w-44 md:h-44 mx-auto mb-8">
      <div className="absolute inset-0 rounded-full animate-pulse"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />
      <div className="absolute inset-2 rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)', animation: 'acSpin 25s linear infinite' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-emerald-400" strokeWidth={1} />
          <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute -bottom-1 -left-3 w-4 h-4 text-purple-400 animate-pulse" style={{ animationDelay: '1.2s' }} />
        </div>
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} className="absolute w-2 h-2 rounded-full"
          style={{ background: ['#10b981', '#a855f7', '#f59e0b'][i], top: '50%', left: '50%',
            animation: `acOrbit ${6 + i * 2}s linear infinite`, animationDelay: `${i * 1.5}s`,
            boxShadow: `0 0 10px ${['#10b981', '#a855f7', '#f59e0b'][i]}` }} />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   QUIZ DATA
   ═══════════════════════════════════════════ */
const quizQuestions = [
  {
    q: 'Který terpén je zodpovědný za citrusovou vůni konopí?',
    options: ['Myrcen', 'Limonen', 'Karyofylen', 'Linalool'],
    correct: 1,
    explanation: 'Limonen je terpén s výrazně citrusovou vůní. Najdete ho i v citronech a pomerančích.',
  },
  {
    q: 'Co je „entourage effect"?',
    options: [
      'Název odrůdy konopí',
      'Synergické působení kanabinoidů a terpénů dohromady',
      'Metoda pěstování',
      'Typ extrakce',
    ],
    correct: 1,
    explanation: 'Entourage effect znamená, že kanabinoidy a terpény působí silněji společně než každý zvlášť.',
  },
  {
    q: 'Jaká je ideální vlhkost pro skladování květů?',
    options: ['30–40 %', '55–62 %', '70–80 %', '90 %+'],
    correct: 1,
    explanation: 'Ideál je 55–62 %. Příliš sucho láme trichomy, příliš vlhko způsobuje plísně.',
  },
  {
    q: 'Který terpén se přímo váže na CB2 receptory?',
    options: ['Limonen', 'Pinen', 'Karyofylen', 'Myrcen'],
    correct: 2,
    explanation: 'Karyofylen je jediný terpén, který se přímo váže na CB2 receptory. Má silné protizánětlivé účinky.',
  },
  {
    q: 'Co NEJVÍCE poškozuje kanabinoidy při skladování?',
    options: ['Tma', 'UV světlo', 'Nízká teplota', 'Vakuum'],
    correct: 1,
    explanation: 'UV záření rozkládá kanabinoidy nejrychleji. Proto vždy skladujte v temnu.',
  },
];

/* ═══════════════════════════════════════════
   QUIZ COMPONENT
   ═══════════════════════════════════════════ */
function BotanyQuiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = quizQuestions[current];

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (current < quizQuestions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score / quizQuestions.length) * 100);
    return (
      <div className="text-center py-6">
        <Trophy className={`w-12 h-12 mx-auto mb-4 ${pct >= 60 ? 'text-yellow-400' : 'text-gray-400'}`} />
        <h4 className="text-2xl font-black text-white mb-2">{score}/{quizQuestions.length} správně</h4>
        <p className="text-gray-400 mb-1">
          {pct === 100 ? 'Mistr botaniky! Gratulujeme.' : pct >= 60 ? 'Slušné! Máš dobré znalosti.' : 'Nevadí! Prohlédni si naše články a zkus to znovu.'}
        </p>
        <button onClick={restart}
          className="mt-4 px-6 py-2.5 rounded-full text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500">Otázka {current + 1}/{quizQuestions.length}</span>
        <span className="text-xs font-bold text-emerald-400">{score} bodů</span>
      </div>
      <div className="flex gap-1 mb-6">
        {quizQuestions.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
            i < current ? 'bg-emerald-500' : i === current ? 'bg-emerald-400/50' : 'bg-white/5'
          }`} />
        ))}
      </div>
      <h4 className="text-lg font-bold text-white mb-5">{q.q}</h4>
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isSelected = i === selected;
          const showResult = selected !== null;
          return (
            <button key={i} onClick={() => handleAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                showResult
                  ? isCorrect
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : isSelected
                      ? 'bg-red-500/15 border-red-500/40 text-red-300'
                      : 'bg-white/2 border-white/5 text-gray-500'
                  : 'bg-white/3 border-white/8 text-gray-300 hover:bg-white/6 hover:border-white/15'
              } border`}>
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                {showResult && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {showResult && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
              </div>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className="mt-4" style={{ animation: 'acFadeIn 0.3s ease-out' }}>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">{q.explanation}</p>
          <button onClick={next}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-emerald-500/15 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all">
            {current < quizQuestions.length - 1 ? 'Další otázka' : 'Výsledky'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   BREATHING EXERCISE
   ═══════════════════════════════════════════ */
function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in');
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const phases: Array<{ p: 'in' | 'hold' | 'out'; dur: number }> = [
      { p: 'in', dur: 4000 }, { p: 'hold', dur: 4000 }, { p: 'out', dur: 6000 },
    ];
    let idx = 0;
    let rounds = 0;
    const run = () => {
      setPhase(phases[idx].p);
      idx = (idx + 1) % phases.length;
      if (idx === 0) {
        rounds++;
        setCount(rounds);
        if (rounds >= 3) { setActive(false); return; }
      }
      timer = setTimeout(run, phases[(idx + phases.length - 1) % phases.length].dur);
    };
    let timer = setTimeout(run, 0);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) {
    return (
      <div className="text-center">
        <button onClick={() => { setActive(true); setCount(0); }}
          className="px-6 py-3 rounded-full text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
          {count > 0 ? 'Znovu' : 'Začít dýchací cvičení'}
        </button>
        {count >= 3 && <p className="text-xs text-gray-500 mt-3">Hotovo! 3 cykly dokončeny.</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative w-28 h-28 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
        <div className={`absolute inset-0 rounded-full transition-all duration-[4000ms] ${
          phase === 'in' ? 'scale-100 bg-cyan-500/15' : phase === 'hold' ? 'scale-100 bg-cyan-500/20' : 'scale-75 bg-cyan-500/5'
        }`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-cyan-300">
            {phase === 'in' ? 'Nádech' : phase === 'hold' ? 'Drž' : 'Výdech'}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500">Cyklus {count + 1}/3</p>
    </div>
  );
}

/* ═══════════════════════════════════════════
   ROOMS DATA — with real inline content
   ═══════════════════════════════════════════ */
const academyRooms = [
  {
    id: 'knihovna',
    title: 'Knihovna',
    subtitle: 'Znalosti & Průvodci',
    description: 'Odborné články o kanabinoidech, terpénech a botanickém světě.',
    icon: BookOpen,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    borderColor: 'border-emerald-500/30',
    glowColor: 'rgba(16,185,129,0.15)',
    accentColor: '#10b981',
    iconBg: 'bg-emerald-500/10',
    articles: ['Vzdělání', 'Průvodce', 'Srovnání'],
    type: 'articles' as const,
  },
  {
    id: 'laborator',
    title: 'Laboratoř',
    subtitle: 'Věda & Výzkum',
    description: 'Jak fungují kanabinoidy, terpény a proč na složení záleží.',
    icon: FlaskConical,
    gradient: 'from-purple-500/20 to-violet-500/20',
    borderColor: 'border-purple-500/30',
    glowColor: 'rgba(168,85,247,0.15)',
    accentColor: '#a855f7',
    iconBg: 'bg-purple-500/10',
    articles: ['Věda'],
    type: 'science' as const,
  },
  {
    id: 'zahrada',
    title: 'Botanická zahrada',
    subtitle: 'Odrůdy & Péče',
    description: 'Jak správně skladovat, poznat kvalitu a pečovat o sbírku.',
    icon: Leaf,
    gradient: 'from-amber-500/20 to-orange-500/20',
    borderColor: 'border-amber-500/30',
    glowColor: 'rgba(245,158,11,0.15)',
    accentColor: '#f59e0b',
    iconBg: 'bg-amber-500/10',
    articles: ['Tipy'],
    type: 'garden' as const,
  },
  {
    id: 'relaxacni-zona',
    title: 'Relaxační zóna',
    subtitle: 'Klid & Pohoda',
    description: 'Zastav se, nadechni se, vypořádej se se stresem.',
    icon: Moon,
    gradient: 'from-cyan-500/20 to-blue-500/20',
    borderColor: 'border-cyan-500/30',
    glowColor: 'rgba(6,182,212,0.15)',
    accentColor: '#06b6d4',
    iconBg: 'bg-cyan-500/10',
    articles: [],
    type: 'relax' as const,
  },
];

/* Science inline content */
const scienceFacts = [
  { icon: Brain, title: 'Endokanabinoidní systém', text: 'Lidské tělo má vlastní systém kanabinoidních receptorů (CB1 a CB2), objeven v roce 1992. Je předmětem intenzivního vědeckého výzkumu.', color: '#a855f7' },
  { icon: Droplets, title: 'Entourage effect', text: 'Kanabinoidy a terpeny tvoří společně komplexní chemický profil. Každá odrůda má unikátní kombinaci těchto látek.', color: '#10b981' },
  { icon: FlaskConical, title: 'THC-X vs HHC', text: 'THC-X je hexylový ester s unikátními vlastnostmi. HHC je hydrogenovaná forma THC — stabilnější, ale jednodušší. Oba legální v ČR.', color: '#6366f1' },
  { icon: Flower2, title: '5 klíčových terpénů', text: 'Myrcen (zemitý), Limonen (citrusový), Karyofylen (pepřový), Linalool (květinový), Pinen (borovicový). Každý má jinou vůni a charakter.', color: '#f59e0b' },
];

/* Garden tips */
const gardenTips = [
  { icon: Sun, title: 'Nepřítel č. 1: Světlo', text: 'UV záření rozkládá kanabinoidy. Vždy skladujte v temnu, v neprůhledné nádobě.', color: '#f59e0b' },
  { icon: Droplets, title: 'Vlhkost 55–62 %', text: 'Příliš sucho = lámavé trichomy. Příliš vlhko = plísně. Boveda pack pomůže udržet ideál.', color: '#06b6d4' },
  { icon: Flame, title: 'Teplota 15–21 °C', text: 'Ne lednice (kondenzace), ne mrazák (poškozuje strukturu). Pokojová teplota mimo radiátor.', color: '#f43f5e' },
  { icon: TreePine, title: 'Jak poznat kvalitu', text: 'Husté trichomy, sytá barva, výrazné aroma. Pokud nevoní nebo je suchý — není čerstvý.', color: '#10b981' },
];

/* Relax quotes */
const relaxQuotes = [
  'Příroda nespěchá, a přesto všechno stihne. — Lao-cʼ',
  'Nejlepší čas na zasazení stromu byl před 20 lety. Druhý nejlepší je teď.',
  'Kde kvete trpělivost, tam roste i moudrost.',
  'V každém semínku je příslib celého lesa.',
  'Ticho lesa léčí více než tisíc slov.',
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function Academy() {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCurrentQuote(p => (p + 1) % relaxQuotes.length), 6000);
    return () => clearInterval(t);
  }, []);

  const getArticlesForRoom = (room: typeof academyRooms[0]) =>
    room.articles.length === 0 ? [] : blogPosts.filter(p => room.articles.includes(p.category));

  return (
    <div className="min-h-screen text-white relative">
      <AcademyParticles />

      {/* Back button */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 md:pt-32">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />Zpět
        </Link>
      </div>

      {/* ────── HERO ────── */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-8 md:pt-12 pb-16 md:pb-24 px-6">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 30%, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 40% 50% at 30% 60%, rgba(168,85,247,0.05) 0%, transparent 70%)' }} />

        <MysticalBook />

        <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 rounded-full bg-emerald-400/5 border border-emerald-400/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-emerald-400 text-sm font-bold tracking-[0.2em] uppercase">Tajná Akademie</span>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-center mb-6 leading-tight">
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">Poznej</span>
          <br />
          <span className="text-white">tajemství </span>
          <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-purple-500 bg-clip-text text-transparent">botaniky</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl text-center mb-10 leading-relaxed">
          Vítej v akademii, kde se svět rostlin a kanabinoidů otvírá jinak než kdekoliv jinde.
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
            <span className="text-white">Místnosti </span>
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">akademie</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">Každá místnost skrývá něco jiného. Klikni a prozkoumej.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {academyRooms.map(room => {
            const Icon = room.icon;
            const articles = getArticlesForRoom(room);
            const isActive = activeRoom === room.id;

            return (
              <div key={room.id}
                className={`group relative rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer ${isActive ? 'md:col-span-2' : ''}`}
                onClick={() => setActiveRoom(isActive ? null : room.id)}
                style={{
                  background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
                  border: `1px solid ${isActive ? room.accentColor + '40' : 'rgba(255,255,255,0.06)'}`,
                  boxShadow: isActive ? `0 0 60px ${room.glowColor}, inset 0 0 60px ${room.glowColor}` : '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                <div className={`absolute inset-0 bg-gradient-to-br ${room.gradient} transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`} />

                <div className="relative p-8 md:p-10">
                  {/* Header */}
                  <div className="flex items-start gap-5 mb-4">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-2xl ${room.iconBg} border ${room.borderColor} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-7 h-7" style={{ color: room.accentColor }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-black text-white">{room.title}</h3>
                      <p className="text-sm font-medium" style={{ color: room.accentColor }}>{room.subtitle}</p>
                    </div>
                    <ChevronRight className={`w-6 h-6 text-gray-600 transition-transform duration-300 flex-shrink-0 ${isActive ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </div>
                  <p className="text-gray-400 leading-relaxed text-sm">{room.description}</p>

                  {/* ── EXPANDED: KNIHOVNA ── */}
                  {isActive && room.type === 'articles' && articles.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-3" style={{ animation: 'acFadeIn 0.4s ease-out' }}>
                      {articles.map(post => (
                        <Link key={post.slug} to={`/blog/${post.slug}`}
                          className="group/card flex gap-3 p-4 rounded-xl transition-all duration-300 hover:bg-white/5"
                          onClick={e => e.stopPropagation()} style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
                          <div className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: post.accentColor + '15' }}>
                            <Tag className="w-3.5 h-3.5" style={{ color: post.accentColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-white mb-0.5 line-clamp-1 group-hover/card:text-emerald-300 transition-colors">{post.title}</h4>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500">
                              <Clock className="w-3 h-3" />{post.readTime} · {post.category}
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 flex-shrink-0 mt-1 opacity-0 group-hover/card:opacity-100 transition-all" style={{ color: room.accentColor }} />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* ── EXPANDED: LABORATOŘ ── */}
                  {isActive && room.type === 'science' && (
                    <div className="mt-6 pt-6 border-t border-white/5" style={{ animation: 'acFadeIn 0.4s ease-out' }}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {scienceFacts.map((fact, i) => {
                          const FIcon = fact.icon;
                          return (
                            <div key={i} className="rounded-xl p-5" onClick={e => e.stopPropagation()}
                              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${fact.color}15` }}>
                              <div className="flex items-center gap-2.5 mb-2.5">
                                <FIcon className="w-4 h-4" style={{ color: fact.color }} />
                                <span className="text-sm font-bold text-white">{fact.title}</span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">{fact.text}</p>
                            </div>
                          );
                        })}
                      </div>
                      {articles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {articles.map(post => (
                            <Link key={post.slug} to={`/blog/${post.slug}`} onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/15 hover:bg-purple-500/20 transition-all">
                              <ArrowRight className="w-3 h-3" />{post.title.slice(0, 40)}...
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── EXPANDED: BOTANICKÁ ZAHRADA ── */}
                  {isActive && room.type === 'garden' && (
                    <div className="mt-6 pt-6 border-t border-white/5" style={{ animation: 'acFadeIn 0.4s ease-out' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {gardenTips.map((tip, i) => {
                          const TIcon = tip.icon;
                          return (
                            <div key={i} className="rounded-xl p-5" onClick={e => e.stopPropagation()}
                              style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${tip.color}15` }}>
                              <div className="flex items-center gap-2.5 mb-2.5">
                                <TIcon className="w-4 h-4" style={{ color: tip.color }} />
                                <span className="text-sm font-bold text-white">{tip.title}</span>
                              </div>
                              <p className="text-xs text-gray-400 leading-relaxed">{tip.text}</p>
                            </div>
                          );
                        })}
                      </div>
                      {articles.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {articles.map(post => (
                            <Link key={post.slug} to={`/blog/${post.slug}`} onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/15 hover:bg-amber-500/20 transition-all">
                              <ArrowRight className="w-3 h-3" />{post.title.slice(0, 40)}...
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── EXPANDED: RELAXAČNÍ ZÓNA ── */}
                  {isActive && room.type === 'relax' && (
                    <div className="mt-6 pt-6 border-t border-white/5 space-y-6" style={{ animation: 'acFadeIn 0.4s ease-out' }} onClick={e => e.stopPropagation()}>
                      {/* Quote */}
                      <div className="relative rounded-2xl p-8 overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.05), rgba(168,85,247,0.05))', border: '1px solid rgba(6,182,212,0.1)' }}>
                        <div className="absolute inset-0 pointer-events-none"
                          style={{ background: 'radial-gradient(circle at 30% 50%, rgba(6,182,212,0.08) 0%, transparent 50%)', animation: 'acBreath 8s ease-in-out infinite' }} />
                        <div className="relative z-10">
                          <Wind className="w-5 h-5 text-cyan-400 mb-4" />
                          <p className="text-lg md:text-xl text-gray-300 italic leading-relaxed" key={currentQuote}
                            style={{ animation: 'acFadeIn 1s ease-out' }}>
                            &ldquo;{relaxQuotes[currentQuote]}&rdquo;
                          </p>
                          <div className="flex gap-1.5 mt-4">
                            {relaxQuotes.map((_, i) => (
                              <button key={i} onClick={() => setCurrentQuote(i)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentQuote ? 'bg-cyan-400 w-5' : 'bg-white/10 hover:bg-white/20 w-1.5'}`} />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Breathing */}
                      <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(6,182,212,0.1)' }}>
                        <div className="flex items-center gap-2 mb-4">
                          <Heart className="w-4 h-4 text-cyan-400" />
                          <span className="text-sm font-bold text-white">Dýchací cvičení 4-4-6</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">3 cykly: 4s nádech, 4s zadržení, 6s výdech. Pomáhá zklidnit mysl.</p>
                        <BreathingExercise />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────── QUIZ ────── */}
      <section className="relative z-10 max-w-2xl mx-auto px-6 pb-32">
        <div className="rounded-3xl overflow-hidden p-8 md:p-10"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,0,0,0.8))',
            border: '1px solid rgba(168,85,247,0.2)',
            boxShadow: '0 0 60px rgba(168,85,247,0.05)',
          }}>
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-black text-white">Otestuj své znalosti</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">5 otázek ze světa botaniky a kanabinoidů. Kolik dáš správně?</p>
          <BotanyQuiz />
        </div>
      </section>

      {/* ────── STYLES ────── */}
      <style>{`
        @keyframes acFloat {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
          50% { transform: translateY(-10px) translateX(-5px); opacity: 0.4; }
          75% { transform: translateY(-25px) translateX(15px); opacity: 0.7; }
        }
        @keyframes acSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes acOrbit {
          from { transform: rotate(0deg) translateX(65px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(65px) rotate(-360deg); }
        }
        @keyframes acFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes acBreath { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.7; transform: scale(1.05); } }
      `}</style>
    </div>
  );
}
