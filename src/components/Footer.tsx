import { Leaf, Instagram, Twitter, Mail, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-16 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.1),transparent_50%)]" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-12 p-6 rounded-xl bg-amber-500/10 border border-amber-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-bold mb-2">Důležité upozornění</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                Všechny prezentované produkty jsou botanické materiály určené výhradně
                ke sběratelským, studijním a analytickým účelům. Produkty nejsou určeny
                ke konzumaci ani k jakémukoli jinému použití. Prodej probíhá v souladu
                s platnou legislativou EU. Přístup k produktům je vyhrazen osobám starším 18 let.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Leaf className="w-8 h-8 text-emerald-400" />
              <h3 className="text-3xl font-black text-white">Botanická Kolekce</h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Specializujeme se na dodávku botanických vzorků s kompletní
              technickou dokumentací a certifikáty analýz.
            </p>
            <div className="flex gap-4">
              {[
                { icon: Instagram, href: '#' },
                { icon: Twitter, href: '#' },
                { icon: Mail, href: '#' },
              ].map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  data-cursor-hover
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-400/20 hover:border-emerald-400 hover:scale-110 transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Katalog</h4>
            <ul className="space-y-3">
              {['Všechny vzorky', 'Technické specifikace', 'Certifikáty', 'Dokumentace'].map(
                (item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      data-cursor-hover
                      className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 inline-block hover:translate-x-2 transform transition-transform"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Informace</h4>
            <ul className="space-y-3">
              {['O společnosti', 'Kontakt', 'Certifikace', 'FAQ'].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    data-cursor-hover
                    className="text-gray-400 hover:text-emerald-400 transition-colors duration-300 inline-block hover:translate-x-2 transform transition-transform"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} Botanická Kolekce. Všechna práva vyhrazena.
            </p>
            <div className="flex gap-6">
              <Link
                to="/terms"
                data-cursor-hover
                className="text-gray-500 hover:text-emerald-400 text-sm transition-colors duration-300"
              >
                Ochrana soukromí
              </Link>
              <Link
                to="/terms"
                data-cursor-hover
                className="text-gray-500 hover:text-emerald-400 text-sm transition-colors duration-300"
              >
                Obchodní podmínky
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
