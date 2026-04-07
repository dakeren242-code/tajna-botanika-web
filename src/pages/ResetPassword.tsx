import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Mail, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(email);

      if (resetError) {
        console.error('Reset password error:', resetError);
        // Don't reveal if email exists or not — always show success
        // This prevents email enumeration attacks
      }

      // Save email to contacts for marketing (source: password_reset)
      await supabase.from('email_contacts').upsert(
        { email, source: 'password_reset', updated_at: new Date().toISOString() },
        { onConflict: 'email' }
      ).catch(() => {}); // ignore contact save errors

      // Always show success (even if email doesn't exist — security best practice)
      setSuccess(true);
    } catch (err) {
      console.error('Unexpected reset error:', err);
      setSuccess(true); // still show success for security
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-emerald-500/20 rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset hesla</h1>
            <p className="text-gray-400">Zadejte váš email pro reset hesla</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-emerald-400 text-sm">
                <p className="font-semibold mb-1">Email odeslán!</p>
                <p>Zkontrolujte svou schránku pro odkaz na reset hesla.</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Odesílání...' : 'Odeslat reset email'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link
              to="/login"
              className="block text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Zpět na přihlášení
            </Link>
            <Link
              to="/"
              className="block text-sm text-gray-400 hover:text-gray-300 transition-colors"
            >
              Zpět na hlavní stránku
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
