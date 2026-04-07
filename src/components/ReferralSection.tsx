import { useState, memo } from 'react';
import { Users, Copy, Check, Gift, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function ReferralSection() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Generate a referral link based on user ID
  const referralCode = user ? `TB-${user.id.slice(0, 6).toUpperCase()}` : null;
  const referralLink = referralCode ? `https://tajnabotanika.online/?ref=${referralCode}` : null;

  const copyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="relative py-16 px-6 overflow-hidden">
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="rounded-2xl bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-purple-900/20 border border-purple-400/15 p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 mb-4">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-purple-300 text-xs font-bold tracking-wider">REFERRAL PROGRAM</span>
              </div>

              <h3 className="text-3xl font-black text-white mb-3">
                Pozvěte přítele,{' '}
                <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                  oba ušetříte
                </span>
              </h3>

              <p className="text-gray-400 mb-6 leading-relaxed max-w-lg">
                Sdílejte svůj odkaz s přáteli. Když nakoupí, oba získáte{' '}
                <span className="text-purple-300 font-bold">15% slevu</span> na další objednávku.
                Bez limitu — čím víc přátel, tím víc slev.
              </p>

              {/* Steps */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {[
                  { step: '1', text: 'Sdílejte odkaz' },
                  { step: '2', text: 'Přítel nakoupí' },
                  { step: '3', text: 'Oba ušetříte 15%' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-xs font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <span className="text-gray-300 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — action area */}
            <div className="flex-shrink-0 w-full md:w-auto">
              {user ? (
                <div className="space-y-3">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider text-center">
                    Váš referral odkaz
                  </p>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-black/40 border border-purple-500/20">
                    <code className="text-purple-300 text-sm font-mono flex-1 truncate max-w-[220px]">
                      {referralLink}
                    </code>
                    <button
                      onClick={copyLink}
                      className="flex-shrink-0 p-2 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 hover:text-white transition-all"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-emerald-400 text-xs text-center font-medium">Zkopírováno!</p>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-purple-400" />
                  </div>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300 text-sm"
                  >
                    Zaregistrovat se
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-gray-500 text-xs">a získejte referral odkaz</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(ReferralSection);
