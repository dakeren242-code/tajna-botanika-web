import { ShieldCheck, Truck, Lock, Award, RefreshCw, HeadphonesIcon } from 'lucide-react';

export default function TrustBadgesSection() {
  const badges = [
    {
      icon: ShieldCheck,
      title: 'Laboratorně Testováno',
      description: 'Všechny produkty jsou certifikované a testované',
      color: '#34D399',
    },
    {
      icon: Truck,
      title: 'Rychlé Doručení',
      description: 'Expedice do 24h, diskrétní balení',
      color: '#3B82F6',
    },
    {
      icon: Lock,
      title: 'Bezpečná Platba',
      description: '100% šifrované a zabezpečené transakce',
      color: '#8B5CF6',
    },
    {
      icon: Award,
      title: 'Prémiová Kvalita',
      description: 'Nejvyšší standardy kontroly kvality',
      color: '#F59E0B',
    },
    {
      icon: RefreshCw,
      title: '30 Dní Záruka',
      description: 'Vrácení peněz bez otázek',
      color: '#06B6D4',
    },
    {
      icon: HeadphonesIcon,
      title: 'Zákaznická Podpora',
      description: 'Jsme tu pro vás 24/7',
      color: '#EC4899',
    },
  ];

  return (
    <section className="relative py-16 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-zinc-950 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="group relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/10 transition-all duration-500"
              data-cursor-hover
              style={{
                animation: 'slide-up 0.6s ease-out forwards',
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                style={{
                  background: `radial-gradient(circle at center, ${badge.color}10, transparent 70%)`,
                }}
              />

              <div
                className="relative w-20 h-20 mb-4 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${badge.color}20, ${badge.color}05)`,
                }}
              >
                <badge.icon
                  className="w-10 h-10 transition-transform duration-500 group-hover:rotate-12"
                  style={{ color: badge.color }}
                />
              </div>

              <h3 className="text-white text-sm font-bold mb-2 leading-tight">
                {badge.title}
              </h3>

              <p className="text-gray-500 text-xs leading-snug">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
