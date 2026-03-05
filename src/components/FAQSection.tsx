import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'K čemu jsou produkty určeny?',
      answer: 'Všechny produkty jsou botanické vzorky určené výhradně ke sběratelským, studijním a analytickým účelům. Nejsou určeny ke konzumaci ani k jakémukoli jinému použití. Prodej probíhá v souladu s platnou legislativou EU.',
    },
    {
      question: 'Jsou produkty testovány?',
      answer: 'Ano, každá šarže je testována v nezávislé botanické laboratoři. Ke každému produktu je přiložen certifikát o analýze (COA), který obsahuje přesné hodnoty přírodních silic, aromatických látek a potvrzení absence nežádoucích příměsí.',
    },
    {
      question: 'Jak rychlé je doručení?',
      answer: 'Objednávky expedujeme do 24 hodin od potvrzení platby. Standardní doručení trvá 1-3 pracovní dny v rámci ČR. Nabízíme také expresní doručení. Všechny zásilky jsou diskrétně zabalené.',
    },
    {
      question: 'Jaké jsou platební možnosti?',
      answer: 'Akceptujeme platební karty (Visa, Mastercard) a bankovní převody. Všechny online platby jsou zabezpečené pomocí šifrování SSL.',
    },
    {
      question: 'Mohu produkt vrátit?',
      answer: 'Ano, nevyužité produkty v původním, neotevřeném stavu lze vrátit do 14 dnů od obdržení v souladu se spotřebitelskými právy. Po otevření produktu z hygienických důvodů vracení není možné.',
    },
    {
      question: 'Jak skladovat vzorky?',
      answer: 'Vzorky skladujte na chladném, tmavém a suchém místě mimo dosah dětí a domácích zvířat. Ideální teplota je 15-21°C. Uchovávejte v originálním obalu. Při správném skladování vydrží materiál stabilní až 12 měsíců.',
    },
  ];

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-950 to-black" />

      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/20">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-bold tracking-wider">
              ČASTO KLADENÉ OTÁZKY
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
            Potřebujete{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Informace?
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Odpovědi na nejčastější dotazy o našich botanických vzorcích
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="group relative rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm hover:bg-white/[0.05] transition-all duration-300"
              style={{
                animation: 'fade-in-up 0.6s ease-out forwards',
                animationDelay: `${index * 0.08}s`,
                opacity: 0,
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left"
                data-cursor-hover
              >
                <span className="text-white font-bold text-lg pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-cyan-400 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-6 text-gray-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.answer}
                </div>
              </div>

              {openIndex === index && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pointer-events-none" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-400/20">
          <h3 className="text-2xl font-black text-white mb-3">
            Další otázky?
          </h3>
          <p className="text-gray-400 mb-6">
            Kontaktujte náš zákaznický tým pro další informace
          </p>
          <button
            data-cursor-hover
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-full hover:scale-105 hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300"
          >
            KONTAKTOVAT
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
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
