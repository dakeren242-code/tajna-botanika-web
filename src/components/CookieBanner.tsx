import { useState } from 'react';
import { useConsent, ConsentState } from '../contexts/ConsentContext';
import { Settings, Shield } from 'lucide-react';

export default function CookieBanner() {
  const { hasConsented, consent, updateConsent, acceptAll, rejectNonEssential } = useConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [localConsent, setLocalConsent] = useState<ConsentState>(consent);

  if (hasConsented) return null;

  const handleSaveSettings = () => {
    updateConsent(localConsent);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-slide-up">
      <div className="max-w-3xl mx-auto bg-zinc-900/95 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3 mb-4">
          <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Nastavení cookies</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Používáme cookies pro správné fungování webu a s vaším souhlasem i pro analýzu
              návštěvnosti a marketingové účely. Svůj souhlas můžete kdykoli změnit.
            </p>
          </div>
        </div>

        {showSettings && (
          <div className="mb-5 space-y-3 pl-9">
            <label className="flex items-center gap-3 cursor-not-allowed opacity-70">
              <input
                type="checkbox"
                checked
                disabled
                className="w-4 h-4 accent-emerald-500"
              />
              <div>
                <span className="text-white text-sm font-medium">Nezbytné</span>
                <p className="text-gray-500 text-xs">Zajišťují základní funkce webu (košík, přihlášení)</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localConsent.analytics}
                onChange={(e) => setLocalConsent(prev => ({ ...prev, analytics: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <div>
                <span className="text-white text-sm font-medium">Analytické</span>
                <p className="text-gray-500 text-xs">Pomáhají nám pochopit, jak web používáte (Google Analytics)</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localConsent.marketing}
                onChange={(e) => setLocalConsent(prev => ({ ...prev, marketing: e.target.checked }))}
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
              />
              <div>
                <span className="text-white text-sm font-medium">Marketingové</span>
                <p className="text-gray-500 text-xs">Umožňují zobrazovat relevantní reklamy (Facebook Pixel, TikTok)</p>
              </div>
            </label>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pl-9">
          <button
            onClick={acceptAll}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg transition-colors duration-200 text-sm"
          >
            Přijmout vše
          </button>
          <button
            onClick={rejectNonEssential}
            className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors duration-200 text-sm border border-white/10"
          >
            Pouze nezbytné
          </button>
          {!showSettings ? (
            <button
              onClick={() => setShowSettings(true)}
              className="px-6 py-2.5 text-gray-400 hover:text-white font-medium rounded-lg transition-colors duration-200 text-sm flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Nastavení
            </button>
          ) : (
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors duration-200 text-sm border border-white/10"
            >
              Uložit nastavení
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
