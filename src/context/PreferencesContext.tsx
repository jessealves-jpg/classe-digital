import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_PREFERENCES, Preferences } from '@/types';

interface PreferencesContextValue {
  preferences: Preferences | null;
  loading: boolean;
  updatePreferences: (patch: Partial<Preferences>) => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPreferences = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from('preferences')
      .select('*')
      .eq('user_id', uid)
      .maybeSingle();
    if (error) {
      console.error('Failed to load preferences:', error.message);
      setLoading(false);
      return;
    }
    setPreferences(data as Preferences | null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }
    loadPreferences(user.id);
  }, [user, loadPreferences]);

  // Apply theme + visual classes to document
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const p = preferences;
    const theme = p?.theme ?? 'light';

    root.classList.toggle('dark', theme === 'dark');
    body.classList.toggle('futuristic', theme === 'dark' && (p?.futuristic_ui ?? false));
    body.classList.toggle('futuristic-ui', p?.futuristic_ui ?? false);
    body.classList.toggle('neon-effect', p?.neon_effect ?? false);
    body.classList.toggle('no-animations', !(p?.animations ?? true));
    body.classList.toggle('dynamic-bg', p?.dynamic_background ?? false);
  }, [preferences]);

  const updatePreferences = useCallback(
    async (patch: Partial<Preferences>) => {
      if (!user) return;
      const merged = { ...preferences, ...patch };
      setPreferences(merged as Preferences);

      const { error } = await supabase
        .from('preferences')
        .update(patch)
        .eq('user_id', user.id);
      if (error) {
        console.error('Failed to save preferences:', error.message);
      }
    },
    [user, preferences]
  );

  return (
    <PreferencesContext.Provider value={{ preferences, loading, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used within PreferencesProvider');
  return ctx;
}
