import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Target, Plus, Pencil, Trash2, Flame, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import ProgressBar from '@/components/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Goal, GoalType, GoalPeriod, StudyLog } from '@/types';

const TYPE_LABELS: Record<GoalType, string> = {
  weekly_hours: 'Horas semanais',
  daily_minutes: 'Minutos diários',
  courses_count: 'Cursos concluídos',
  modules_count: 'Módulos concluídos',
};

const TYPE_UNITS: Record<GoalType, string> = {
  weekly_hours: 'h',
  daily_minutes: 'min',
  courses_count: '',
  modules_count: '',
};

const PERIOD_LABELS: Record<GoalPeriod, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  yearly: 'Anual',
};

export default function Goals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [gRes, lRes] = await Promise.all([
      supabase.from('goals').select('*').order('created_at', { ascending: false }),
      supabase.from('study_logs').select('*'),
    ]);
    if (gRes.data) setGoals(gRes.data as Goal[]);
    if (lRes.data) setLogs(lRes.data as StudyLog[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const computeProgress = (goal: Goal): number => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    if (goal.type === 'weekly_hours') {
      const weekMin = logs
        .filter((l) => new Date(l.date) >= startOfWeek)
        .reduce((sum, l) => sum + l.minutes, 0);
      return weekMin / 60;
    }
    if (goal.type === 'daily_minutes') {
      const today = now.toISOString().slice(0, 10);
      return logs.filter((l) => l.date === today).reduce((sum, l) => sum + l.minutes, 0);
    }
    if (goal.type === 'modules_count') {
      return logs.reduce((sum, l) => sum + l.modules_done, 0);
    }
    return 0;
  };

  const toggleActive = async (goal: Goal) => {
    setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, is_active: !g.is_active } : g));
    await supabase.from('goals').update({ is_active: !goal.is_active }).eq('id', goal.id);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('goals').delete().eq('id', deleteId);
    if (error) { toast('Erro ao excluir meta', 'error'); return; }
    setGoals((prev) => prev.filter((g) => g.id !== deleteId));
    toast('Meta excluída', 'success');
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Metas de Estudo"
        subtitle="Defina objetivos e acompanhe seu progresso"
        action={<button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary"><Plus className="w-5 h-5" /> Nova meta</button>}
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card-base p-5"><div className="skeleton h-6 w-3/4 mb-3" /><div className="skeleton h-3 w-full mb-2" /><div className="skeleton h-8 w-16" /></div>)}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Nenhuma meta definida"
          description="Crie metas para acompanhar horas de estudo, módulos concluídos e mais."
          action={<button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary"><Plus className="w-5 h-5" /> Criar meta</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const progress = computeProgress(goal);
            const pct = goal.target_value > 0 ? Math.min(100, (progress / goal.target_value) * 100) : 0;
            const achieved = progress >= goal.target_value;
            return (
              <div key={goal.id} className="card-base p-5 group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${achieved ? 'bg-success-100 text-success-600 dark:bg-success-950/60 dark:text-success-400' : 'bg-primary-100 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400'}`}>
                      {achieved ? <Flame className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{goal.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{TYPE_LABELS[goal.type]} · {PERIOD_LABELS[goal.period]}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditing(goal); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Pencil className="w-4 h-4 text-slate-400" /></button>
                    <button onClick={() => setDeleteId(goal.id)} className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-950/40"><Trash2 className="w-4 h-4 text-slate-400 hover:text-error-500" /></button>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-600 dark:text-slate-300">
                      {progress.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}{TYPE_UNITS[goal.type]}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {goal.target_value}{TYPE_UNITS[goal.type]}
                    </span>
                  </div>
                  <ProgressBar value={progress} max={goal.target_value} color={achieved ? '#22c55e' : '#3b82f6'} />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <span className={`badge ${achieved ? 'bg-success-100 text-success-700 dark:bg-success-950/60 dark:text-success-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {achieved ? 'Concluída' : `${Math.round(pct)}%`}
                  </span>
                  <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                    <input type="checkbox" checked={goal.is_active} onChange={() => toggleActive(goal)} className="w-4 h-4 rounded accent-primary-600" />
                    Ativa
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <GoalModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          goal={editing}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir meta"
        message="Deseja remover esta meta? O progresso registrado não será afetado."
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function GoalModal({
  open, onClose, goal, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: goal?.title || '',
    type: goal?.type || 'weekly_hours' as GoalType,
    target_value: goal?.target_value || 10,
    period: goal?.period || 'weekly' as GoalPeriod,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title,
      type: form.type,
      target_value: Number(form.target_value),
      period: form.period,
    };
    const { error } = goal
      ? await supabase.from('goals').update(payload).eq('id', goal.id)
      : await supabase.from('goals').insert(payload);
    setSaving(false);
    if (error) { toast('Erro ao salvar meta', 'error'); return; }
    toast(goal ? 'Meta atualizada' : 'Meta criada', 'success');
    onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title={goal ? 'Editar meta' : 'Nova meta'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Título *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Ex: Estudar 10h por semana" />
        </div>
        <div>
          <label className="label">Tipo</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as GoalType })} className="input">
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Meta (valor)</label>
            <input type="number" min="1" step="0.5" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: +e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Período</label>
            <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value as GoalPeriod })} className="input">
              {Object.entries(PERIOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
