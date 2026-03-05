import { Microscope, Shield, Award, FileText } from 'lucide-react';

export default function ExperienceSection() {
  const features = [
    {
      icon: Microscope,
      title: 'Laboratorní Analýza',
      description: 'Každá šarže je testována v nezávislé laboratoři. Výsledky analýz jsou přiloženy k produktu.',
      color: '#FFD700',
    },
    {
      icon: Shield,
      title: 'Certifikováno',
      description: 'Plná transparentnost složení a původu. Všechny hodnoty přírodních silic a aromatických látek jsou ověřeny a zdokumentovány.',
      color: '#06B6D4',
    },
    {
      icon: Award,
      title: 'Standardizované Složení',
      description: 'Přesně definovaný profil přírodních silic a bylinných látek. Vhodné pro srovnávací botanické studium a dokumentaci.',
      color: '#34D399',
    },
    {
      icon: FileText,
      title: 'Technická Dokumentace',
      description: 'Ke každému vzorku je přiložen certifikát s detailními údaji o složení a metodách analýzy.',
      color: '#C084FC',
    },
  ];

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-emerald-950/10 to-black" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <span className="text-emerald-400 text-sm font-bold tracking-wider">
              TECHNICKÉ PARAMETRY
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
            Charakteristika{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Materiálů
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Botanické vzorky jsou dodávány s kompletní technickou dokumentací
            a certifikátem o analýze složení.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-500"
              data-cursor-hover
              style={{
                animation: 'float-up 0.8s ease-out forwards',
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${feature.color}15, transparent 70%)`,
                }}
              />

              <div className="relative">
                <div
                  className="w-16 h-16 mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}30, ${feature.color}10)`,
                    boxShadow: `0 0 30px ${feature.color}20`,
                  }}
                >
                  <feature.icon
                    className="w-8 h-8 transition-colors duration-300"
                    style={{ color: feature.color }}
                  />
                </div>

                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ color: feature.color }}
              />
            </div>
          ))}
        </div>

        <div className="mt-20 p-12 rounded-3xl bg-gradient-to-br from-emerald-400/10 via-transparent to-teal-400/10 border border-emerald-400/20 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h3 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Určeno pro{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                studijní účely
              </span>
            </h3>
            <p className="text-xl text-gray-300 mb-8">
              Všechny vzorky jsou určeny výhradně ke sběratelským, studijním a analytickým účelům.
              Dodávány v souladu s platnými právními předpisy EU.
            </p>
            <button
              data-cursor-hover
              className="px-10 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transition-all duration-300"
            >
              ZOBRAZIT KATALOG
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          from {
            opacity: 0;
            transform: translateY(30px);
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
