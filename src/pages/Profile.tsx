import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Phone, Save, LogOut, Package, AlertCircle, CheckCircle, Gift, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState<{ code: string; is_used: boolean; expires_at: string } | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }

    // Load user's discount code
    supabase
      .from('discount_codes')
      .select('code, is_used, expires_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => { if (data) setDiscountCode(data); });
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const { error: updateError } = await updateProfile({
      full_name: fullName,
      phone,
    });

    if (updateError) {
      setError('Chyba při aktualizaci profilu');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-emerald-950 to-black py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-full">
                <User className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Můj profil</h1>
                <p className="text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Odhlásit se
            </button>
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
              <p className="text-emerald-400 text-sm">Profil úspěšně aktualizován</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
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
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-emerald-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="+420 123 456 789"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Ukládání...' : 'Uložit změny'}
            </button>
          </form>

          {discountCode && (
            <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-400/30 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Váš slevový kód 15%</h2>
              </div>
              {discountCode.is_used ? (
                <p className="text-gray-400 text-sm">Kód <span className="text-white font-mono font-bold">{discountCode.code}</span> byl již použit.</p>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-black text-yellow-300 tracking-wider font-mono">{discountCode.code}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(discountCode.code); setCodeCopied(true); setTimeout(() => setCodeCopied(false), 2000); }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {codeCopied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-yellow-400" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">
                    Platí do {new Date(discountCode.expires_at).toLocaleDateString('cs-CZ')}. Zadejte při objednávce v poli "Slevový kód".
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-emerald-500/20 pt-8">
            <h2 className="text-xl font-bold text-white mb-4">Rychlé odkazy</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                to="/orders"
                className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-emerald-500/20 rounded-lg transition-colors"
              >
                <Package className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="text-white font-semibold">Moje objednávky</h3>
                  <p className="text-sm text-gray-400">Historie a stav objednávek</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
