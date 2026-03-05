import { AlertCircle, Leaf, Shield, FileText } from 'lucide-react';
import CustomCursor from '../components/CustomCursor';
import ParticleBackground from '../components/ParticleBackground';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <CustomCursor />
      <ParticleBackground />

      <main className="relative z-10 pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/20">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-bold tracking-wider">
                PRÁVNÍ INFORMACE
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              Obchodní podmínky
            </h1>
            <p className="text-xl text-gray-400">
              Důležité informace o nákupu a používání našich produktů
            </p>
          </div>

          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/30">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Důležité upozornění</h2>
                <div className="space-y-3 text-gray-300 leading-relaxed">
                  <p>
                    <strong className="text-amber-400">Všechny produkty nabízené na tomto e-shopu jsou botanické materiály určené výhradně ke sběratelským, studijním a analytickým účelům.</strong>
                  </p>
                  <p>
                    Produkty <strong className="text-white">NEJSOU určeny ke konzumaci</strong> ani k jakémukoli jinému použití.
                    Prodej probíhá v souladu s platnou legislativou Evropské unie.
                  </p>
                  <p>
                    Přístup k produktům je vyhrazen osobám starším <strong className="text-white">18 let</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Leaf className="w-6 h-6 text-emerald-400" />
                <h2 className="text-2xl font-bold text-white">1. Účel produktů</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <strong>1.1.</strong> Všechny produkty jsou botanické vzorky rostlinného původu určené výhradně pro:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Sběratelské účely</li>
                  <li>Studijní a vzdělávací účely</li>
                  <li>Analytické a dokumentační účely</li>
                  <li>Botanickou dokumentaci</li>
                </ul>
                <p>
                  <strong>1.2.</strong> Produkty nejsou určeny ke konzumaci, inhalaci, vaporizaci ani k jakémukoli jinému použití.
                </p>
                <p>
                  <strong>1.3.</strong> Kupující nese plnou odpovědnost za dodržování platné legislativy ve své zemi.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">2. Certifikace a dokumentace</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <strong>2.1.</strong> Každý produkt je dodáván s certifikátem o analýze (COA) z nezávislé laboratoře.
                </p>
                <p>
                  <strong>2.2.</strong> Certifikát obsahuje:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Přesné hodnoty kanabinoidů (THC-X, CBD, CBG, atd.)</li>
                  <li>Profil terpenů</li>
                  <li>Potvrzení absence nežádoucích látek</li>
                  <li>Číslo šarže a datum analýzy</li>
                </ul>
                <p>
                  <strong>2.3.</strong> Všechny hodnoty jsou uvedeny v souladu s mezinárodními standardy pro laboratorní testování.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">3. Objednávky a platby</h2>
              </div>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <strong>3.1.</strong> Objednávky jsou přijímány online prostřednictvím našeho e-shopu.
                </p>
                <p>
                  <strong>3.2.</strong> Akceptované platební metody:
                </p>
                <ul className="list-disc list-inside ml-4 space-y-2">
                  <li>Platební karty (Visa, Mastercard)</li>
                  <li>Bankovní převod</li>
                </ul>
                <p>
                  <strong>3.3.</strong> Ceny jsou uvedeny v českých korunách (CZK) včetně DPH.
                </p>
                <p>
                  <strong>3.4.</strong> Všechny online platby jsou zabezpečeny šifrováním SSL.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">4. Dodání a doprava</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <strong>4.1.</strong> Objednávky expedujeme do 24 hodin od potvrzení platby.
                </p>
                <p>
                  <strong>4.2.</strong> Standardní doba doručení je 1-3 pracovní dny v rámci ČR.
                </p>
                <p>
                  <strong>4.3.</strong> Všechny zásilky jsou diskrétně zabalené.
                </p>
                <p>
                  <strong>4.4.</strong> Produkty jsou zasílány v původním obalu s kompletní dokumentací.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">5. Reklamace a vrácení zboží</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <strong>5.1.</strong> Nevyužité produkty v původním, neotevřeném stavu lze vrátit do 14 dnů od obdržení.
                </p>
                <p>
                  <strong>5.2.</strong> Po otevření produktu není z hygienických důvodů vracení možné.
                </p>
                <p>
                  <strong>5.3.</strong> V případě vady produktu kontaktujte náš zákaznický servis do 48 hodin od obdržení.
                </p>
                <p>
                  <strong>5.4.</strong> Každá reklamace je řešena individuálně v souladu s platnou legislativou.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">6. Skladování</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <strong>6.1.</strong> Botanické vzorky skladujte na chladném, tmavém a suchém místě.
                </p>
                <p>
                  <strong>6.2.</strong> Uchovávejte mimo dosah dětí a domácích zvířat.
                </p>
                <p>
                  <strong>6.3.</strong> Ideální skladovací teplota je 15-21°C.
                </p>
                <p>
                  <strong>6.4.</strong> Uchovávejte v originálním obalu.
                </p>
                <p>
                  <strong>6.5.</strong> Při správném skladování vydrží materiál stabilní až 12 měsíců.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">7. Omezení odpovědnosti</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <strong>7.1.</strong> Prodávající nenese odpovědnost za nesprávné použití produktů v rozporu s těmito obchodními podmínkami.
                </p>
                <p>
                  <strong>7.2.</strong> Kupující je povinen seznámit se s platnou legislativou ve své zemi a dodržovat ji.
                </p>
                <p>
                  <strong>7.3.</strong> Produkty jsou určeny pouze pro osoby starší 18 let.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">8. Ochrana osobních údajů</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  <strong>8.1.</strong> Zpracování osobních údajů probíhá v souladu s GDPR.
                </p>
                <p>
                  <strong>8.2.</strong> Vaše údaje používáme pouze pro zpracování objednávek a komunikaci.
                </p>
                <p>
                  <strong>8.3.</strong> Údaje nejsou předávány třetím stranám bez vašeho souhlasu.
                </p>
              </div>
            </section>

            <section className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">9. Kontakt</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p>
                  V případě dotazů nás kontaktujte:
                </p>
                <ul className="list-none ml-4 space-y-2">
                  <li><strong className="text-emerald-400">Email:</strong> info@tajnabotanika.com</li>
                  <li><strong className="text-emerald-400">Zákaznický servis:</strong> Po-Pá, 9:00-17:00</li>
                </ul>
              </div>
            </section>
          </div>

          <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/20 text-center">
            <p className="text-gray-400 text-sm">
              Tyto obchodní podmínky nabývají účinnosti dnem 1. 1. 2024
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Poslední aktualizace: 2. 2. 2026
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
