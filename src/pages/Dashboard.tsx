import { useState, useMemo } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, Legend,
} from 'recharts';
import {
  BookOpen, CheckCircle2, Clock, TrendingUp, Plus,
  Filter, X, Calendar, Flame,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import ProgressBar from '@/components/ProgressBar';
import Modal from '@/components/Modal';
import EmptyState from '@/components/EmptyState';
import { useStudyData, applyFilters, DEFAULT_FILTERS, DashboardFilters } from '@/hooks/useStudyData';
import { useToast } from '@/context/ToastContext';
import { STATUS_LABELS, STATUS_COLORS, DAY_NAMES_SHORT } from '@/types';
import { Course, CourseStatus } from '@/types';

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { courses, categories, institutions, logs, goals, loading, addLog } = useStudyData();
  const { toast } = useToast();
  const [filters, setFilters] = useState<DashboardFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

  const filtered = useMemo(() => applyFilters(courses, filters), [courses, filters]);

  const stats = useMemo(() => {
    const completed = filtered.filter((c) => c.status === 'completed').length;
    const inProgress = filtered.filter((c) => c.status === 'in_progress').length;
    const totalHours = filtered.reduce((s, c) => s + Number(c.completed_hours), 0);
    const today = new Date().toISOString().slice(0, 10);
    const todayMin = logs.filter((l) => l.date === today).reduce((s, l) => s + l.minutes, 0);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekMin = logs.filter((l) => new Date(l.date) >= weekStart).reduce((s, l) => s + l.minutes, 0);
    return { total: filtered.length, completed, inProgress, totalHours, todayMin, weekMin };
  }, [filtered, logs]);

  const weeklyData = useMemo(() => {
    const days: { day: string; min: number }[] = DAY_NAMES_SHORT.map((d) => ({ day: d, min: 0 }));
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    logs.filter((l) => new Date(l.date) >= weekStart).forEach((l) => {
      const dow = new Date(l.date).getDay();
      days[dow].min += l.minutes;
    });
    return days;
  }, [logs]);

  const filteredCourseIds = new Set(filtered.map((c) => c.id));
  const filteredLogs = logs.filter((l) => filteredCourseIds.has(l.course_id));

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABELS[status as CourseStatus],
      value: count,
      color: STATUS_COLORS[status as CourseStatus],
    }));
  }, [filtered]);

  const activeGoals = goals.filter((g) => g.is_active).slice(0, 3);
  const goalProgress = (goal: typeof goals[0]) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    if (goal.type === 'weekly_hours') return filteredLogs.filter((l) => new Date(l.date) >= weekStart).reduce((s, l) => s + l.minutes, 0) / 60;
    if (goal.type === 'daily_minutes') return logs.filter((l) => l.date === new Date().toISOString().slice(0, 10)).reduce((s, l) => s + l.minutes, 0);
    if (goal.type === 'modules_count') return filteredLogs.reduce((s, l) => s + l.modules_done, 0);
    return 0;
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) =>
    (k === 'favoritesOnly' || k === 'completedOnly') ? v === true :
    (k === 'archived') ? v === true :
    v !== 'all'
  ).length;

  if (loading) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Visão geral dos seus estudos" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(6)].map((_, i) => <div key={i} className="card-base p-5"><div className="skeleton h-10 w-10 rounded-xl mb-3" /><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-7 w-16" /></div>)}
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: 'rgba(255,255,255,0.95)',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '12px',
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos seus estudos"
        action={
          <div className="flex gap-2">
            <button onClick={() => setShowFilters((v) => !v)} className={showFilters || activeFilterCount > 0 ? 'btn-primary' : 'btn-secondary'}>
              <Filter className="w-5 h-5" />
              {activeFilterCount > 0 && <span className="badge bg-white/20">{activeFilterCount}</span>}
            </button>
            <button onClick={() => setLogModalOpen(true)} className="btn-primary" disabled={courses.length === 0}>
              <Plus className="w-5 h-5" /> Registrar estudo
            </button>
          </div>
        }
      />

      {/* Filters panel */}
      {showFilters && (
        <div className="card-base p-4 mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Filtros</h3>
            <div className="flex gap-2">
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Limpar</button>
              <button onClick={() => setShowFilters(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="label">Categoria</label>
              <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="input">
                <option value="all">Todas</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Instituição</label>
              <select value={filters.institution} onChange={(e) => setFilters({ ...filters, institution: e.target.value })} className="input">
                <option value="all">Todas</option>
                {institutions.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="input">
                <option value="all">Todos</option>
                <option value="not_started">Não iniciado</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluído</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            <div>
              <label className="label">Mostrar</label>
              <div className="flex flex-wrap gap-3 pt-2">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={filters.favoritesOnly} onChange={(e) => setFilters({ ...filters, favoritesOnly: e.target.checked })} className="w-4 h-4 rounded accent-primary-600" />
                  Favoritos
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={filters.completedOnly} onChange={(e) => setFilters({ ...filters, completedOnly: e.target.checked })} className="w-4 h-4 rounded accent-primary-600" />
                  Concluídos
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input type="checkbox" checked={filters.archived} onChange={(e) => setFilters({ ...filters, archived: e.target.checked })} className="w-4 h-4 rounded accent-primary-600" />
                  Arquivados
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Bem-vindo ao Classe Digital!"
          description="Comece cadastrando seus cursos EAD para organizar sua rotina de estudos."
        />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
            <StatCard icon={BookOpen} label="Cursos" value={stats.total} color="blue" />
            <StatCard icon={CheckCircle2} label="Concluídos" value={stats.completed} color="green" />
            <StatCard icon={TrendingUp} label="Em andamento" value={stats.inProgress} color="cyan" />
            <StatCard icon={Clock} label="Horas totais" value={`${stats.totalHours.toFixed(1)}h`} color="amber" />
            <StatCard icon={Flame} label="Hoje" value={`${stats.todayMin}min`} color="red" />
            <StatCard icon={Calendar} label="Esta semana" value={`${Math.floor(stats.weekMin / 60)}h${stats.weekMin % 60 > 0 ? `${stats.weekMin % 60}m` : ''}`} color="slate" />
          </div>

          {/* Active goals */}
          {activeGoals.length > 0 && (
            <div className="card-base p-5 mb-6">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">Metas ativas</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {activeGoals.map((goal) => {
                  const progress = goalProgress(goal);
                  const pct = goal.target_value > 0 ? Math.min(100, (progress / goal.target_value) * 100) : 0;
                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-slate-600 dark:text-slate-300 truncate">{goal.title}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{Math.round(pct)}%</span>
                      </div>
                      <ProgressBar value={progress} max={goal.target_value} color={pct >= 100 ? '#22c55e' : '#3b82f6'} height="sm" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4 mb-4">
            <ChartCard title="Estudos desta semana" subtitle="Minutos por dia">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="min" radius={[6, 6, 0, 0]} fill="#3b82f6" name="Minutos" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Distribuição por status" subtitle="Cursos filtrados">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Top courses */}
          <ChartCard title="Cursos em andamento" subtitle="Progresso dos cursos ativos">
            <div className="space-y-3">
              {filtered.filter((c) => c.status === 'in_progress').slice(0, 5).map((c) => {
                const progress = c.total_hours > 0 ? (c.completed_hours / c.total_hours) * 100 : 0;
                return (
                  <div key={c.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-700 dark:text-slate-200 truncate">{c.title}</span>
                        <span className="text-slate-500 dark:text-slate-400 text-xs ml-2 flex-shrink-0">{Math.round(progress)}%</span>
                      </div>
                      <ProgressBar value={c.completed_hours} max={c.total_hours || 1} color={STATUS_COLORS[c.status]} height="sm" />
                    </div>
                  </div>
                );
              })}
              {filtered.filter((c) => c.status === 'in_progress').length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Nenhum curso em andamento</p>
              )}
            </div>
          </ChartCard>
        </>
      )}

      {logModalOpen && (
        <LogStudyModal
          open={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          courses={filtered.length > 0 ? filtered : courses}
          onSave={async (data) => {
            const { error } = await addLog(data);
            if (error) { toast('Erro ao registrar estudo', 'error'); return; }
            toast('Estudo registrado!', 'success');
            setLogModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function LogStudyModal({
  open, onClose, courses, onSave,
}: {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  onSave: (data: { course_id: string; date: string; minutes: number; modules_done: number; lessons_done: number }) => void;
}) {
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [minutes, setMinutes] = useState(60);
  const [modulesDone, setModulesDone] = useState(0);
  const [lessonsDone, setLessonsDone] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;
    onSave({ course_id: courseId, date, minutes, modules_done: modulesDone, lessons_done: lessonsDone });
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar sessão de estudo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Curso *</label>
          <select required value={courseId} onChange={(e) => setCourseId(e.target.value)} className="input">
            <option value="">Selecione...</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Data</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Minutos estudados</label>
            <input type="number" min="5" step="5" value={minutes} onChange={(e) => setMinutes(+e.target.value)} className="input" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Módulos concluídos</label>
            <input type="number" min="0" value={modulesDone} onChange={(e) => setModulesDone(+e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Aulas concluídas</label>
            <input type="number" min="0" value={lessonsDone} onChange={(e) => setLessonsDone(+e.target.value)} className="input" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" className="btn-primary flex-1">Registrar</button>
        </div>
      </form>
    </Modal>
  );
}
