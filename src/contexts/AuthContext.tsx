import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserProfile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const loadUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile(data);
    }
  }, []);

  const checkAdminStatus = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    setIsAdmin(!!data);
  }, []);

  useEffect(() => {
    let subscription: any;

    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadUserProfile(currentSession.user.id);
        await checkAdminStatus(currentSession.user.id);
      }

      setLoading(false);

      const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          (async () => {
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
              await loadUserProfile(newSession.user.id);
              await checkAdminStatus(newSession.user.id);
            } else {
              setProfile(null);
              setIsAdmin(false);
            }
          })();
        }
      );

      subscription = authSubscription;
    };

    initAuth();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [loadUserProfile, checkAdminStatus]);

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return { error };
    }

    // The database trigger (handle_new_user) auto-confirms email,
    // creates user_profile, and generates a 15% discount code.
    // We just need to update the profile with the full name if the trigger
    // used a fallback.
    if (data.user) {
      // Small delay to let the trigger complete
      await new Promise(r => setTimeout(r, 500));

      // Update profile with proper full name
      await supabase
        .from('user_profiles')
        .update({ full_name: fullName })
        .eq('id', data.user.id);
    }

    return { error: null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    return { error };
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(data)
      .eq('id', user.id);

    if (!error) {
      await loadUserProfile(user.id);
    }

    return { error };
  }, [user, loadUserProfile]);

  const value = useMemo(() => ({
    user,
    profile,
    session,
    loading,
    isAdmin,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  }), [user, profile, session, loading, isAdmin, signUp, signIn, signOut, resetPassword, updateProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
