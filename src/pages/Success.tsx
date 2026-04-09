import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Home, Package, Building2, Truck, Copy, Phone, MapPin, Clock, QrCode } from 'lucide-react';

interface Confetti {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  velocity: { x: number; y: number };
  rotationSpeed: number;
}

export function Success() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const paymentMethod = searchParams.get('payment');
  const amount = searchParams.get('amount');
  const shipping = searchParams.get('shipping');
  const cod = searchParams.get('cod');
  const phone = searchParams.get('phone');
  const shippingMethod = searchParams.get('shippingMethod');

  const [confetti, setConfetti] = useState<Confetti[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    localStorage.removeItem('cart');

    const confettiColors = ['#10b981', '#fbbf24', '#f3f4f6'];
    const newConfetti: Confetti[] = [];

    for (let i = 0; i < 50; i++) {
      const side = Math.random() > 0.5 ? 'left' : 'right';
      const x = side === 'left' ? -10 : window.innerWidth + 10;
      const y = window.innerHeight * (0.3 + Math.random() * 0.4);

      newConfetti.push({
        id: i,
        x,
        y,
        rotation: Math.random() * 360,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        velocity: {
          x: side === 'left' ? (3 + Math.random() * 4) : -(3 + Math.random() * 4),
          y: -8 - Math.random() * 6,
        },
        rotationSpeed: (Math.random() - 0.5) * 10,
      });
    }

    setConfetti(newConfetti);

    const animate = () => {
      setConfetti(prev => {
        const updated = prev.map(c => ({
          ...c,
          x: c.x + c.velocity.x,
          y: c.y + c.velocity.y,
          rotation: c.rotation + c.rotationSpeed,
          velocity: {
            x: c.velocity.x * 0.99,
            y: c.velocity.y + 0.5,
          },
        })).filter(c => c.y < window.innerHeight + 20);

        if (updated.length === 0 && animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          return [];
        }

        return updated;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const shippingCost = shipping ? parseFloat(shipping) : 0;
  const codFee = cod ? parseFloat(cod) : 0;
  const totalAmount = amount ? parseFloat(amount) : 0;
  const _productsCost = totalAmount - shippingCost - codFee;

  // Generate short numeric variable symbol (max 10 digits for Czech banks)
  const rawDigits = (orderNumber || '').replace(/\D/g, '');
  const variableSymbol = rawDigits.length > 10 ? rawDigits.slice(-10) : rawDigits || String(Date.now()).slice(-10);

  const bankDetails = {
    account: '2001645045/2010',
    amount: `${totalAmount.toFixed(0)} Kč`,
    variableSymbol,
  };

  // Generate QR payment string (SPAYD format for Czech banks)
  // Spec: https://qr-platba.cz/pro-vyvojare/specifikace-formatu/
  const iban = 'CZ6520100000002001645045';
  const amountStr = totalAmount.toFixed(2);
  // SPAYD must not contain diacritics in MSG, keep it simple
  const spayd = `SPD*1.0*ACC:${iban}*AM:${amountStr}*CC:CZK*X-VS:${variableSymbol}*MSG:Objednavka ${variableSymbol}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(spayd)}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-50">
        {confetti.map(c => (
          <div
            key={c.id}
            className="absolute w-2.5 h-2.5 rounded-sm"
            style={{
              left: `${c.x}px`,
              top: `${c.y}px`,
              backgroundColor: c.color,
              transform: `rotate(${c.rotation}deg)`,
              opacity: 0.8,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 text-center animate-fadeSlideIn">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 p-6 rounded-full border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-checkPulse">
              <CheckCircle className="w-16 h-16 text-emerald-400" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-3 animate-zoomIn">
            Děkujeme za vaši objednávku!
          </h1>

          <p className="text-gray-300 text-lg mb-2">
            {paymentMethod === 'bank_transfer' && 'Pokud platba proběhla, brzy se vám ozveme.'}
            {paymentMethod === 'cash_on_delivery' && 'O stavu zásilky vás budeme informovat.'}
          </p>

          <p className="text-gray-400 mb-8">
            Potvrzení jsme vám zaslali na e-mail.
          </p>

          <div className="inline-block bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 rounded-xl px-6 py-3 mb-8">
            <p className="text-sm text-gray-400 mb-1">Číslo objednávky</p>
            <p className="text-emerald-400 text-2xl font-bold">{orderNumber || 'N/A'}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-6 text-left">
            <h3 className="text-lg font-bold text-white mb-4">Souhrn objednávky</h3>

            <div className="space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Číslo objednávky</span>
                <span className="text-white font-semibold">{orderNumber}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Způsob platby</span>
                <span className="text-white font-semibold">
                  {paymentMethod === 'bank_transfer' && 'Bankovní převod'}
                  {paymentMethod === 'cash_on_delivery' && 'Dobírka'}
                </span>
              </div>

              <div className="border-t border-emerald-500/20 pt-2.5 mt-2.5">
                <div className="flex justify-between">
                  <span className="text-white font-bold">Celková částka</span>
                  <span className="text-emerald-400 font-bold text-xl">{totalAmount.toFixed(2)} Kč</span>
                </div>
              </div>
            </div>
          </div>

          {paymentMethod === 'bank_transfer' && (
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-6 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Building2 className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Platební instrukce</h2>
              </div>

              <p className="text-gray-400 text-sm mb-4">
                Údaje k platbě naleznete níže. Po připsání platby bude objednávka odeslána.
              </p>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Číslo účtu</p>
                  <div className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-emerald-500/20">
                    <span className="text-white font-semibold">{bankDetails.account}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails.account)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                      title="Zkopírovat"
                    >
                      <Copy className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Částka k úhradě</p>
                  <div className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-emerald-500/20">
                    <span className="text-white font-semibold">{bankDetails.amount}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails.amount)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                      title="Zkopírovat"
                    >
                      <Copy className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-1">Variabilní symbol</p>
                  <div className="flex items-center justify-between bg-black/30 rounded-lg p-3 border border-emerald-500/20">
                    <span className="text-white font-semibold">{bankDetails.variableSymbol}</span>
                    <button
                      onClick={() => copyToClipboard(bankDetails.variableSymbol)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                      title="Zkopírovat"
                    >
                      <Copy className="w-4 h-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <p className="text-white font-semibold">QR platba</p>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Naskenujte QR kód v bankovní aplikaci pro rychlou platbu - údaje se vyplní automaticky.
                </p>
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl p-3">
                    <img src={qrUrl} alt="QR platba" className="w-[200px] h-[200px]" />
                  </div>
                </div>
              </div>

              {/* Priority banner */}
              <div className="mt-6 p-5 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-400/30 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-bl-full" />
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-400/20 to-yellow-500/20 rounded-full flex items-center justify-center border border-amber-400/30">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-amber-200 font-bold text-sm">PRIORITNÍ ZPRACOVÁNÍ</h4>
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-300 text-[10px] font-bold rounded-full border border-amber-400/30">VIP</span>
                    </div>
                    <p className="text-amber-300/80 text-sm leading-relaxed">
                      Platby převodem zpracováváme <span className="text-amber-200 font-semibold">přednostně</span>. Po připsání částky vaši objednávku ihned připravíme k odeslání.
                    </p>
                    <div className="mt-3 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 text-amber-300/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Rychlejší vyřízení
                      </span>
                      <span className="flex items-center gap-1 text-amber-300/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Přednostní odeslání
                      </span>
                      <span className="flex items-center gap-1 text-amber-300/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Žádné poplatky
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-emerald-300 text-sm font-medium">
                  💡 Po uhrazení pošlete screenshot platby na náš kontakt pro ještě rychlejší vyřízení.
                </p>
              </div>
            </div>
          )}

          {paymentMethod === 'cash_on_delivery' && (
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <Truck className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Platba při převzetí</h2>
              </div>
              <p className="text-gray-400">
                Platbu ve výši <span className="text-white font-semibold">{totalAmount.toFixed(0)} Kč</span> provedete při převzetí zásilky na Zásilkovně.
              </p>
              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <p className="text-emerald-300 text-sm">
                  O stavu zásilky vás budeme informovat e-mailem.
                </p>
              </div>
            </div>
          )}

          {(shippingMethod === 'personal_invoice' || shippingMethod === 'personal_pickup' || shippingMethod === 'personal') && paymentMethod !== 'cash_on_delivery' && (
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl p-6 border border-emerald-500/30 mb-8 text-left">
              <div className="flex items-center gap-3 mb-4">
                <MapPin className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">Osobní převzetí</h2>
              </div>
              <div className="space-y-3">
                <p className="text-gray-400">
                  Po zaplacení domluvíme místo a čas předání v oblasti Praha - Beroun.
                </p>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-emerald-400" />
                    <h4 className="text-white font-semibold">Dostupnost 24/7</h4>
                  </div>
                  <p className="text-emerald-300 text-sm">
                    Převzetí je možné kdykoli - flexibilně se domluvíme
                  </p>
                </div>
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold mb-2">Co teď:</h4>
                  <ol className="text-yellow-300 text-sm space-y-1 list-decimal list-inside">
                    <li>Zaplaťte převodem (QR kód výše)</li>
                    <li>Pošlete screenshot platby do chatu níže</li>
                    <li>Domluvíme místo předání (Praha - Beroun)</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* Screenshot CTA - for bank transfer payments */}
          {paymentMethod === 'bank_transfer' && (
            <div className="mt-8 p-6 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 rounded-xl border border-emerald-500/30">
              <div className="text-center mb-4">
                <h3 className="text-white font-bold text-lg mb-1">Zaplatili jste? Pošlete nám potvrzení!</h3>
                <p className="text-gray-400 text-sm">Pošlete screenshot platby a objednávku zpracujeme okamžitě</p>
              </div>
              <button
                onClick={() => {
                  // Open support chat with pre-filled message
                  const chatBtn = document.querySelector('[aria-label="Otevřít chat podpory"]') as HTMLButtonElement;
                  if (chatBtn) chatBtn.click();
                  // Set a flag for SupportChat to detect
                  localStorage.setItem('tb_chat_prefill', `Dobrý den, posílám potvrzení platby pro objednávku #${orderNumber || ''}`);
                }}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span className="text-xl">📸</span>
                Poslat screenshot platby do chatu
              </button>
              <p className="text-center text-xs text-gray-500 mt-3">
                Nebo pošlete na <span className="text-emerald-400">tajnabotanika@seznam.cz</span>
              </p>
            </div>
          )}

          <div className="space-y-3 mt-6">
            <Link
              to="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-[1.02]"
            >
              Zpět do obchodu
            </Link>

            <Link
              to="/orders"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 text-gray-300 hover:text-white text-sm transition-colors duration-300"
            >
              Zobrazit detail objednávky
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes checkPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 40px rgba(16, 185, 129, 0.5);
          }
        }

        @keyframes zoomIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeSlideIn {
          animation: fadeSlideIn 0.6s ease-out;
        }

        .animate-checkPulse {
          animation: checkPulse 2s ease-in-out infinite;
        }

        .animate-zoomIn {
          animation: zoomIn 0.5s ease-out 0.2s both;
        }
      `}</style>
    </div>
  );
}

export default Success;
