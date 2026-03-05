import { Droplet, Wind, Leaf, Flame } from 'lucide-react';

export default function ElementsSection() {
  return (
    <section className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.08),transparent_60%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
            Čtyři Elementy Pěstování
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Každý element hraje klíčovou roli v našem výrobním procesu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Droplet,
              label: 'VODA',
              title: 'Hydratace & Minerály',
              desc: 'Čistá voda s přesně vyváženými minerály zajišťuje optimální hydrataci a transport živin ke kořenům. Moderní hydroponické systémy umožňují kontrolu každé kapky.',
              gradient: 'from-blue-500/10 to-cyan-500/10',
              border: 'border-blue-400/30',
              iconColor: 'text-blue-400',
              glow: 'rgba(59, 130, 246, 0.4)'
            },
            {
              icon: Wind,
              label: 'VZDUCH',
              title: 'Cirkulace & Kyslík',
              desc: 'Kontrolovaná ventilace a CO2 regulace vytváří ideální atmosféru. Svěží vzduch posiluje strukturu rostlin a předchází nemocem.',
              gradient: 'from-sky-500/10 to-indigo-500/10',
              border: 'border-sky-400/30',
              iconColor: 'text-sky-300',
              glow: 'rgba(125, 211, 252, 0.4)'
            },
            {
              icon: Leaf,
              label: 'ZEMĚ',
              title: 'Substrát & Živiny',
              desc: 'Prémiové substráty obohacené o organické živiny poskytují pevný základ. Přesná kontrola pH a EC hodnot zajišťuje maximální vstřebávání.',
              gradient: 'from-green-500/10 to-emerald-500/10',
              border: 'border-green-400/30',
              iconColor: 'text-green-400',
              glow: 'rgba(34, 197, 94, 0.4)'
            },
            {
              icon: Flame,
              label: 'OHEŇ',
              title: 'Světelné Spektrum',
              desc: 'Pokročilé LED spektrum simulující sluneční energii. Precizní kontrola světelných cyklů maximalizuje fotosyntézu a vývoj trichomů u každé rostliny.',
              gradient: 'from-orange-500/10 to-red-500/10',
              border: 'border-orange-400/30',
              iconColor: 'text-orange-400',
              glow: 'rgba(249, 115, 22, 0.4)'
            },
          ].map((element, index) => (
            <div
              key={index}
              className={`group relative p-8 rounded-3xl bg-gradient-to-br ${element.gradient} border-2 ${element.border} backdrop-blur-xl hover:scale-105 transition-all duration-500 animate-float-gentle overflow-hidden`}
              style={{
                animationDelay: `${index * 0.3}s`,
                animationDuration: `${5 + index}s`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />

              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at center, ${element.glow}, transparent 70%)`,
                }}
              />

              <div className="relative z-10">
                <element.icon
                  className={`w-16 h-16 ${element.iconColor} mb-6 mx-auto animate-pulse-gentle group-hover:scale-110 transition-transform duration-500`}
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    filter: 'drop-shadow(0 0 10px currentColor)'
                  }}
                />

                <div className={`text-lg font-black ${element.iconColor} mb-2 tracking-wider text-center`}>
                  {element.label}
                </div>

                <div className="text-base font-bold text-white mb-4 text-center">
                  {element.title}
                </div>

                <div className="text-sm text-gray-400 leading-relaxed text-center">
                  {element.desc}
                </div>
              </div>

              <div
                className="absolute -bottom-20 -right-20 w-40 h-40 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
              >
                <element.icon className={`w-full h-full ${element.iconColor}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float-gentle {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        .animate-float-gentle {
          animation: float-gentle ease-in-out infinite;
        }
        @keyframes pulse-gentle {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
