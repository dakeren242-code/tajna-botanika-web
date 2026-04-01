import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';

export interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface ConsentContextType {
  consent: ConsentState;
  hasConsented: boolean;
  updateConsent: (consent: ConsentState) => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  resetConsent: () => void;
}

const STORAGE_KEY = 'cookie_consent';

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
};

function loadConsent(): { consent: ConsentState; hasConsented: boolean } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { consent: { ...parsed, necessary: true }, hasConsented: true };
    }
  } catch {}
  return { consent: defaultConsent, hasConsented: false };
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return context;
}

export function getConsentState(): ConsentState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { analytics: !!parsed.analytics, marketing: !!parsed.marketing, necessary: true };
    }
  } catch {}
  return defaultConsent;
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadConsent);

  const saveConsent = useCallback((consent: ConsentState) => {
    const toStore = { analytics: consent.analytics, marketing: consent.marketing };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    setState({ consent: { analytics: consent.analytics, marketing: consent.marketing, necessary: true }, hasConsented: true });
  }, []);

  const updateConsent = useCallback((consent: ConsentState) => {
    saveConsent(consent);
  }, [saveConsent]);

  const acceptAll = useCallback(() => {
    saveConsent({ necessary: true, analytics: true, marketing: true });
  }, [saveConsent]);

  const rejectNonEssential = useCallback(() => {
    saveConsent({ necessary: true, analytics: false, marketing: false });
  }, [saveConsent]);

  const resetConsent = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ consent: defaultConsent, hasConsented: false });
  }, []);

  const value = useMemo(() => ({
    consent: state.consent,
    hasConsented: state.hasConsented,
    updateConsent,
    acceptAll,
    rejectNonEssential,
    resetConsent,
  }), [state, updateConsent, acceptAll, rejectNonEssential, resetConsent]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
    </ConsentContext.Provider>
  );
}
