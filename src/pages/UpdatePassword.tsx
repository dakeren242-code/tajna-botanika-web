import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { KeyRound, AlertCircle, CheckCircle, Eye, EyeOff, Lock } from 'lucide-react';

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // Supabase auto-detects the recovery token from the URL hash
    // and establishes a session. We just need to wait for it.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionReady(true);
      } else {
        // Listen for auth state change (recovery token exchange)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
            setSessionReady(true);
          }
        });
        // Cleanup after 10 seconds if no session
        const timeout = setTimeout(() => {
          if (!sessionReady) {
            setError('Odkaz pro reset hesla vypršel nebo je neplatný. Zkuste to znovu.');
          }
        }, 10000);
        return () => {
          subscription.unsubscribe();
          clearTimeout(timeout);
        };
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hesla se neshodují.');
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message === 'New password should be different from the old password.'
          ? 'Nové heslo musí být odlišné od starého.'
          : 'Nepodařilo se změnit heslo. Zkuste to znovu.');
        return;
      }

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError('Neočekávaná chyba. Zkuste to znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Nové heslo</h1>
            <p className="text-gray-400">Zadejte nové heslo pro váš účet</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-red-400 text-sm">
                <p>{error}</p>
                {error.includes('vypršel') && (
                  <Link to="/reset-password" className="underline mt-1 block">
                    Požádat o nový odkaz
                  </Link>
                )}
              </div>
            </div>
          )}

          {success ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-400 font-semibold text-lg mb-1">Heslo změněno!</p>
              <p className="text-gray-400 text-sm">Přesměrovávám na přihlášení...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nové heslo
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Alespoň 6 znaků"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Potvrdit heslo
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    placeholder="Zopakujte heslo"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !sessionReady}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Ukládám...' : !sessionReady ? 'Ověřuji odkaz...' : 'Změnit heslo'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Zpět na přihlášení
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
