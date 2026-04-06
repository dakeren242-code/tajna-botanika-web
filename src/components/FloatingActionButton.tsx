import { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, Mail, Gift, Clock } from 'lucide-react';

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [showSpinPromo, setShowSpinPromo] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSpinPromo(true);
      setTimeout(() => setShowSpinPromo(false), 5000);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const quickMessages = [
    'Máte otázku na produkt?',
    'Potřebuji poradit s výběrem',
    'Kdy dorazí objednávka?',
    'Slevy a akce',
  ];

  return (
    <>
      {showSpinPromo && !isOpen && (
        <div className="fixed top-20 right-6 z-[9998] animate-slide-in-right">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-3 rounded-2xl shadow-2xl max-w-[200px]">
              <button
                onClick={() => setShowSpinPromo(false)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Gift className="w-4 h-4" />
                <span className="font-black text-sm">SPECIÁLNÍ NABÍDKA!</span>
              </div>
              <p className="text-xs opacity-90">
                Zatočte kolem štěstí a získejte slevu!
              </p>
              <div
                className="absolute bottom-0 right-8 w-4 h-4 bg-gradient-to-br from-yellow-500 to-orange-500 transform rotate-45 translate-y-2"
              />
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-36 right-6 z-[10000]">
        {isOpen && (
          <div className="absolute bottom-20 right-0 w-80 animate-scale-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-xl" />

              <div className="relative bg-black/95 backdrop-blur-xl border border-purple-400/30 rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-sm">
                          Zákaznická Podpora
                        </div>
                        <div className="flex items-center gap-1 text-xs text-white/80">
                          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          <span>Jsme tu pro vás</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  {/* UVÍTÁNÍ A TELEFONY */}
                  <div className="mb-6">
                    <p className="text-sm text-gray-200 leading-relaxed mb-4 text-center italic">
                      "Krásný den! Rádi vám poradíme s čímkoliv, co máte na srdci."
                    </p>
                    
                    <div className="space-y-3">
                      <a href="tel:+420739385030" className="flex flex-col p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3 mb-1">
                          <Phone className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-white font-bold">+420 739 385 030</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Dostupné: 07:00 – 20:00</span>
                        </div>
                      </a>

                      <a href="tel:+420775490365" className="flex flex-col p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3 mb-1">
                          <Phone className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                          <span className="text-sm text-white font-bold">+420 775 490 365</span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>Dostupné: 14:30 – 00:00</span>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* RYCHLÉ DOTAZY */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-400 mb-2 font-medium">Rychlé dotazy:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {quickMessages.map((msg, i) => (
                        <button
                          key={i}
                          onClick={() => setMessage(msg)}
                          className="text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] text-gray-300 transition-all duration-200"
                        >
                          {msg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Napište nám zprávu..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-purple-400/50"
                      rows={2}
                    />
                    <button
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center hover:scale-110 transition-transform disabled:opacity-50"
                      disabled={!message.trim()}
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 shadow-2xl hover:scale-110 transition-all duration-300 group"
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {isOpen ? <X className="w-7 h-7 text-white" /> : <MessageCircle className="w-7 h-7 text-white" />}
          </div>
          {!isOpen && (
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
          )}
        </button>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-scale-in { animation: scale-in 0.3s ease-out; }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.5s ease-out; }
      `}</style>
    </>
  );
}