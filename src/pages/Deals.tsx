import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Flame, Clock, Zap, Gift, Star, TrendingUp, Package } from 'lucide-react';
import { supabase, Product } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DealTimer {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Deals() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [timeLeft, setTimeLeft] = useState<DealTimer>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    document.title = 'Akce & Slevy | Tajná Botanika';
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('*').limit(9);
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  // Countdown to end of month
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diff = endOfMonth.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const flashDeals = [
    {
      title: '3+1 ZDARMA',
      description: 'Kup 3 gramy jakékoliv odrůdy a čtvrtý gram dostaneš zdarma',
      icon: Gift,
      color: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-400/25',
      badge: 'AKCE MĚSÍCE',
      badgeColor: 'bg-purple-500',
    },
    {
      title: 'Doprava zdarma',
      description: 'Na všechny objednávky nad 999 Kč. Bez kódu, automaticky.',
      icon: Package,
      color: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-400/25',
      badge: 'STÁLE PLATÍ',
      badgeColor: 'bg-emerald-500',
    },
    {
      title: 'Registrace = 15% sleva',
      description: 'Zaregistruj se a okamžitě získáš 15% slevový kód na celý sortiment',
      icon: Star,
      color: 'from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-400/25',
      badge: 'PRO NOVÉ',
      badgeColor: 'bg-yellow-500',
    },
  ];

  const bundles = [
    { name: 'Discovery Box', items: '3× 1g', price: 449, original: 570, save: 21 },
    { name: 'Sběratelský Set', items: '5× 3g', price: 1799, original: 2450, save: 27 },
    { name: 'Kompletní Kolekce', items: '9× 3g', price: 2999, original: 4410, save: 32 },
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-28 pb-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na hlavní stránku
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-red-500/10 border border-red-400/20 mb-5">
            <Flame className="w-4 h-4 text-red-400" />
            <span className="text-red-300 text-sm font-bold tracking-wider">AKCE & SLEVY</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            Aktuální{' '}
            <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
              nabídky
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Speciální akce, bundle slevy a exkluzivní nabídky. Platí do konce měsíce.
          </p>
        </div>

        {/* Countdown */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <Clock className="w-5 h-5 text-red-400" />
          <span className="text-gray-400 text-sm font-medium">Nabídky končí za:</span>
          <div className="flex gap-2">
            {[
              { v: timeLeft.days, l: 'd' },
              { v: timeLeft.hours, l: 'h' },
              { v: timeLeft.minutes, l: 'm' },
              { v: timeLeft.seconds, l: 's' },
            ].map((u, i) => (
              <div key={i} className="flex items-baseline gap-0.5">
                <span className="text-white font-mono font-bold text-lg">{u.v.toString().padStart(2, '0')}</span>
                <span className="text-gray-500 text-xs">{u.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Flash deals */}
        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {flashDeals.map((deal, i) => (
            <div key={i} className={`rounded-2xl bg-gradient-to-br ${deal.color} border ${deal.border} p-6 hover:scale-[1.02] transition-all duration-300`}>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${deal.badgeColor} text-white text-[10px] font-bold tracking-wide mb-4`}>
                {deal.badge}
              </div>
              <deal.icon className="w-8 h-8 text-white/70 mb-3" />
              <h3 className="text-xl font-black text-white mb-2">{deal.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{deal.description}</p>
            </div>
          ))}
        </div>

        {/* Bundle deals */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-2xl font-black text-white">Bundle balíčky</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {bundles.map((b, i) => (
              <Link
                key={i}
                to="/#products"
                className="group p-5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-all"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{b.name}</h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-xs font-bold">-{b.save}%</span>
                </div>
                <p className="text-gray-500 text-sm mb-3">{b.items}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{b.price.toLocaleString('cs-CZ')} Kč</span>
                  <span className="text-gray-600 line-through text-sm">{b.original.toLocaleString('cs-CZ')} Kč</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Product of the week */}
        {products.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h2 className="text-2xl font-black text-white">Produkt týdne</h2>
            </div>
            <Link
              to={`/product/${products[0].slug}`}
              className="group flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-400/20 hover:border-yellow-400/40 transition-all"
            >
              {products[0].image_url && (
                <img src={products[0].image_url} alt={products[0].name} className="w-32 h-32 object-contain" />
              )}
              <div className="flex-1 text-center md:text-left">
                <span className="inline-block px-2.5 py-1 rounded-lg bg-yellow-500 text-black text-xs font-bold mb-2">⭐ VÝBĚR TÝDNE</span>
                <h3 className="text-2xl font-black text-white mb-2">{products[0].name}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{products[0].description}</p>
                <span className="text-yellow-400 font-bold text-sm group-hover:text-yellow-300 transition-colors">
                  Zobrazit detail →
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* CTA — not registered */}
        {!user && (
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/20">
            <h3 className="text-2xl font-black text-white mb-2">Ještě nemáte účet?</h3>
            <p className="text-gray-400 mb-5">Zaregistrujte se a získejte <span className="text-emerald-400 font-bold">15% slevu</span> na první objednávku</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105 transition-all duration-300"
            >
              <Gift className="w-5 h-5" />
              Registrovat a získat slevu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
