import { FormEvent, useState } from 'react';
import {
  Settings as SettingsIcon, Moon, Sun, Sparkles, User, Save,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { usePreferences } from '@/context/PreferencesContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Preferences } from '@/types';

interface ToggleConfig {
  key: keyof Preferences;
  label: string;
  description: string;
}

const INTERFACE_TOGGLES: ToggleConfig[] = [
  { key: 'futuristic_ui', label: 'Tema Futurista', description: 'Interface inspirada em SAP Fiori, Power BI e Apple VisionOS' },
  { key: 'glass_effect', label: 'Glass Effect', description: 'Efeito de vidro fosco com transparências (glassmorphism)' },
  { key: 'animations', label: 'Animações', description: 'Micro animações e transições suaves' },
  { key: 'neon_effect', label: 'Efeito Neon', description: 'Brilho neon em botões e elementos interativos' },
  { key: 'modern_icons', label: 'Ícones modernos', description: 'Ícones da biblioteca Lucide' },
  { key: 'shadows', label: 'Sombras', description: 'Sombras suaves para profundidade' },
  { key: 'hover_effects', label: 'Hover', description: 'Efeitos visuais ao passar o mouse' },
  { key: 'elevated_cards', label: 'Cards elevados', description: 'Cards com elevação e bordas modernas' },
  { key: 'dynamic_background', label: 'Fundo dinâmico', description: 'Background com gradientes animados' },
];

export default function Settings() {
  const { preferences, updatePreferences, loading } = usePreferences();
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [savingProfile, setSavingProfile] = useState(false);

  if (loading || !preferences) {
    return (
      <div>
        <PageHeader title="Configurações" subtitle="Personalize sua experiência" />
        <div className="card-base p-6"><div className="skeleton h-8 w-full mb-4" /><div className="skeleton h-6 w-3/4" /></div>
      </div>
    );
  }

  const handleToggle = async (key: keyof Preferences, value: boolean) => {
    await updatePreferences({ [key]: value });
    toast('Preferência salva automaticamente', 'success');
  };

  const handleTheme = async (theme: 'light' | 'dark') => {
    await updatePreferences({ theme });
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', user!.id);
    setSavingProfile(false);
    if (error) { toast('Erro ao salvar perfil', 'error'); return; }
    await refreshProfile();
    toast('Perfil atualizado', 'success');
  };

  return (
    <div>
      <PageHeader title="Configurações" subtitle="Personalize sua experiência" />

      <div className="space-y-6 max-w-3xl">
        {/* Profile */}
        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Perfil</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Suas informações pessoais</p>
            </div>
          </div>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="label">Nome completo</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" placeholder="Seu nome" />
            </div>
            <div>
              <label className="label">E-mail</label>
              <input value={user?.email || ''} disabled className="input opacity-60 cursor-not-allowed" />
            </div>
            <button type="submit" disabled={savingProfile} className="btn-primary">
              {savingProfile ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> Salvar perfil</>}
            </button>
          </form>
        </div>

        {/* Theme */}
        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-600 dark:bg-accent-950/60 dark:text-accent-400 flex items-center justify-center">
              {preferences.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Tema</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Modo claro ou escuro</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTheme('light')}
              className={`p-4 rounded-xl border-2 transition-all ${preferences.theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
            >
              <Sun className="w-6 h-6 mx-auto mb-2 text-warning-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Claro</p>
            </button>
            <button
              onClick={() => handleTheme('dark')}
              className={`p-4 rounded-xl border-2 transition-all ${preferences.theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}`}
            >
              <Moon className="w-6 h-6 mx-auto mb-2 text-primary-500" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Escuro</p>
            </button>
          </div>
        </div>

        {/* Interface — Futuristic options */}
        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Interface</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Personalização visual e efeitos futuristas</p>
            </div>
          </div>

          <div className="space-y-1">
            {INTERFACE_TOGGLES.map((toggle) => (
              <label
                key={toggle.key}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex-1 mr-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{toggle.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{toggle.description}</p>
                </div>
                <ToggleSwitch
                  checked={preferences[toggle.key] as boolean}
                  onChange={(v) => handleToggle(toggle.key, v)}
                />
              </label>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <SettingsIcon className="w-3.5 h-3.5" />
              Todas as preferências são salvas automaticamente no banco de dados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => { e.preventDefault(); onChange(!checked); }}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-600'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
}


