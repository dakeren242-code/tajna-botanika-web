import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader2 } from 'lucide-react';

/**
 * Handles Supabase auth redirects (email confirmation, password reset, magic links).
 * Since we auto-confirm emails via DB trigger, this page gracefully handles
 * the case where the token is already used — it just redirects home.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase puts tokens in the URL hash: #access_token=...&type=signup
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const type = params.get('type');

      // Try to exchange the token
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session) {
        // User is already logged in — success
        setStatus('success');
        setTimeout(() => navigate('/'), 1500);
        return;
      }

      if (error) {
        // Token might be expired/already used — that's fine, we auto-confirm
        // Just redirect to login
        setStatus('success');
        setTimeout(() => navigate('/login'), 1500);
        return;
      }

      // If type is recovery (password reset), redirect to update password page
      if (type === 'recovery') {
        navigate('/update-password' + window.location.hash);
        return;
      }

      // Default: redirect home
      setStatus('success');
      setTimeout(() => navigate('/'), 1500);
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg">Ověřuji...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-white text-lg font-bold">Účet ověřen!</p>
            <p className="text-gray-400 mt-2">Přesměrovávám...</p>
          </>
        )}
      </div>
    </div>
  );
}
