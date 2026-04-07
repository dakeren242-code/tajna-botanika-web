import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Gift, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { trackEvent } from '../hooks/useTracking';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password !== confirmPassword) {
      setError('Hesla se neshodují');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    if (!fullName.trim()) {
      setError('Vyplňte prosím celé jméno');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(email, password, fullName);

    if (signUpError) {
      setError(signUpError.message || 'Chyba při registraci');
      setLoading(false);
      return;
    }

    trackEvent('CompleteRegistration', { user_email: email });

    // Auto-sign in after registration (trigger auto-confirmed the email)
    await supabase.auth.signInWithPassword({ email, password });

    // Small delay to let the trigger + session settle
    await new Promise(r => setTimeout(r, 800));

    // Fetch the generated discount code
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: codes } = await supabase
        .from('discount_codes')
        .select('code')
        .eq('user_id', session.user.id)
        .eq('is_used', false)
        .limit(1);
      if (codes && codes.length > 0) {
        setDiscountCode(codes[0].code);
      }
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4">
              <UserPlus className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Registrace</h1>
            <p className="text-gray-400">Vytvořte si nový účet</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-400 font-semibold">Registrace úspěšná!</p>
              </div>
              {discountCode && (
                <div className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-300 font-bold">Váš slevový kód na 15%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-black text-white tracking-wider">{discountCode}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(discountCode)}
                      className="p-2 hover:bg-white/10 rounded transition-colors"
                      title="Kopírovat"
                    >
                      <Copy className="w-4 h-4 text-yellow-400" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Použijte při objednávce. Platí 30 dní, jednorázově.</p>
                </div>
              )}
              <Link to="/" className="inline-block w-full text-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all">
                Začít nakupovat
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Celé jméno
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Jan Novák"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="vas@email.cz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Heslo
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Alespoň 6 znaků"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Potvrzení hesla
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="Zopakujte heslo"
                />
              </div>
            </div>

            <div className="text-center text-sm">
              <Link
                to="/login"
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Již máte účet? Přihlaste se
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrace...' : 'Registrovat se'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
