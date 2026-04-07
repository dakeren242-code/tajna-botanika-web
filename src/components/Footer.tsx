import { Sparkles, Instagram, Twitter, Mail, ShieldCheck, Truck, CreditCard, Lock, FlaskConical } from 'lucide-react';
import { useConsent } from '../contexts/ConsentContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { resetConsent } = useConsent();

  return (
    <footer className="relative py-16 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black to-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,215,0,0.1),transparent_50%)]" />
      </div>

      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <h3 className="text-3xl font-black text-white">THC-X KVĚTY</h3>
            </div>
            <p className="text-gray-400 leading-relaxed mb-6 max-w-md">
              Prémiová kolekce květů vytvořená s láskou k detailu a oddaností
              kvalitě. Pro náročné sběratele.
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
                  className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-yellow-400/20 hover:border-yellow-400 hover:scale-110 transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-300" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Produkty</h4>
            <ul className="space-y-3">
              {[
                { label: 'Všechny květy', href: '/#products' },
                { label: 'Nové příchody', href: '/#products' },
                { label: 'Bestsellery', href: '/#products' },
                { label: 'Limitované edice', href: '/#products' },
              ].map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      data-cursor-hover
                      className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 inline-block hover:translate-x-2 transform transition-transform"
                    >
                      {item.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Informace</h4>
            <ul className="space-y-3">
              {[
                { label: 'O nás', href: '/#o-nas' },
                { label: 'Kontakt', href: '/#kontakt' },
                { label: 'Certifikace', href: '/#o-nas' },
                { label: 'FAQ', href: '/#faq' },
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    data-cursor-hover
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-300 inline-block hover:translate-x-2 transform transition-transform"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust & Payment Badges */}
        <div className="pt-8 border-t border-white/10 mb-8">
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {[
              { icon: ShieldCheck, label: 'SSL Šifrování', color: 'text-emerald-400' },
              { icon: FlaskConical, label: 'Laboratorně testováno', color: 'text-blue-400' },
              { icon: Truck, label: 'Doručení 1-2 dny', color: 'text-yellow-400' },
              { icon: Lock, label: 'Bezpečná platba', color: 'text-purple-400' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-400">
                <badge.icon className={`w-4 h-4 ${badge.color}`} />
                <span className="text-xs font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mb-4">
            {/* Payment method badges */}
            {['Visa', 'Mastercard', 'Převod', 'Dobírka'].map((method) => (
              <div
                key={method}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-400"
              >
                {method === 'Visa' && <CreditCard className="w-3 h-3 inline mr-1 text-blue-400" />}
                {method === 'Mastercard' && <CreditCard className="w-3 h-3 inline mr-1 text-orange-400" />}
                {method}
              </div>
            ))}
          </div>
          <p className="text-center text-gray-600 text-xs">
            Přijímáme všechny hlavní platební metody • 30 dní záruka spokojenosti • 2 500+ spokojených zákazníků
          </p>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; {currentYear} THC-X Květy. Všechna práva vyhrazena.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                data-cursor-hover
                className="text-gray-500 hover:text-yellow-400 text-sm transition-colors duration-300"
              >
                Ochrana soukromí
              </a>
              <a
                href="#"
                data-cursor-hover
                className="text-gray-500 hover:text-yellow-400 text-sm transition-colors duration-300"
              >
                Obchodní podmínky
              </a>
              <button
                onClick={resetConsent}
                data-cursor-hover
                className="text-gray-500 hover:text-yellow-400 text-sm transition-colors duration-300"
              >
                Nastavení cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
