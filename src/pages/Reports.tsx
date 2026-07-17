import { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Legend, Area, AreaChart,
} from 'recharts';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import ChartCard from '@/components/ChartCard';
import EmptyState from '@/components/EmptyState';
import {
  BookOpen, CheckCircle2, Clock, Hourglass, TrendingUp,
  Target, BarChart3, Layers, Trophy,
} from 'lucide-react';
import { useStudyData } from '@/hooks/useStudyData';
import { STATUS_COLORS, Course } from '@/types';

const CHART_COLORS = ['#3b82f6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function Reports() {
  const { courses, categories, logs, loading } = useStudyData();

  const stats = useMemo(() => {
    const total = courses.length;
    const completed = courses.filter((c) => c.status === 'completed').length;
    const inProgress = courses.filter((c) => c.status === 'in_progress').length;
    const totalHours = courses.reduce((s, c) => s + Number(c.completed_hours), 0);
    const remainingHours = courses.reduce((s, c) => s + Math.max(0, Number(c.total_hours) - Number(c.completed_hours)), 0);
    const overallProgress = courses.length > 0
      ? courses.reduce((s, c) => {
          const p = c.total_hours > 0 ? (c.completed_hours / c.total_hours) * 100 : 0;
          return s + p;
        }, 0) / courses.length
      : 0;
    const avgDaily = logs.length > 0 ? logs.reduce((s, l) => s + l.minutes, 0) / new Set(logs.map((l) => l.date)).size : 0;
    return { total, completed, inProgress, totalHours, remainingHours, overallProgress, avgDaily };
  }, [courses, logs]);

  const evolutionData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    logs.forEach((l) => {
      const month = l.date.slice(0, 7);
      byMonth[month] = (byMonth[month] || 0) + l.minutes / 60;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, hours]) => ({ month, hours: Math.round(hours * 10) / 10 }));
  }, [logs]);

  const categoryData = useMemo(() => {
    return categories.map((cat) => {
      const catCourses = courses.filter((c) => c.category_id === cat.id);
      const hours = catCourses.reduce((s, c) => s + Number(c.completed_hours), 0);
      return { name: cat.name, horas: Math.round(hours * 10) / 10, color: cat.color };
    }).filter((d) => d.horas > 0).sort((a, b) => b.horas - a.horas);
  }, [courses, categories]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    courses.forEach((c) => { counts[c.status] = (counts[c.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: status === 'not_started' ? 'Não iniciado' : status === 'in_progress' ? 'Em andamento' : status === 'completed' ? 'Concluído' : 'Arquivado',
      value: count,
      color: STATUS_COLORS[status as Course['status']],
    }));
  }, [courses]);

  const rankingData = useMemo(() => {
    return categories
      .map((cat) => {
        const catCourses = courses.filter((c) => c.category_id === cat.id);
        return { name: cat.name, cursos: catCourses.length };
      })
      .filter((d) => d.cursos > 0)
      .sort((a, b) => b.cursos - a.cursos)
      .slice(0, 8);
  }, [courses, categories]);

  const timelineData = useMemo(() => {
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-20);
    return sorted.map((l) => {
      const course = courses.find((c) => c.id === l.course_id);
      return {
        date: new Date(l.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        curso: course?.title.slice(0, 20) || 'Curso',
        minutos: l.minutes,
      };
    });
  }, [logs, courses]);

  const radarData = useMemo(() => {
    return categories.slice(0, 6).map((cat) => {
      const catCourses = courses.filter((c) => c.category_id === cat.id);
      const progress = catCourses.length > 0
        ? catCourses.reduce((s, c) => {
            const p = c.total_hours > 0 ? (c.completed_hours / c.total_hours) * 100 : 0;
            return s + p;
          }, 0) / catCourses.length
        : 0;
      return { category: cat.name, progress: Math.round(progress) };
    });
  }, [courses, categories]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Relatórios" subtitle="Análise analítica dos seus estudos" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(8)].map((_, i) => <div key={i} className="card-base p-5"><div className="skeleton h-10 w-10 rounded-xl mb-3" /><div className="skeleton h-4 w-24 mb-2" /><div className="skeleton h-7 w-16" /></div>)}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card-base p-5 h-80"><div className="skeleton h-full w-full" /></div>)}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div>
        <PageHeader title="Relatórios" subtitle="Análise analítica dos seus estudos" />
        <EmptyState
          icon={BarChart3}
          title="Sem dados para relatórios"
          description="Cadastre cursos e registre sessões de estudo para visualizar gráficos e indicadores."
        />
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: 'rgba(255,255,255,0.95)',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#1e293b',
  };

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Análise analítica dos seus estudos estilo Power BI" />

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BookOpen} label="Total de cursos" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle2} label="Concluídos" value={stats.completed} sublabel={`${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% do total`} color="green" />
        <StatCard icon={TrendingUp} label="Em andamento" value={stats.inProgress} color="cyan" />
        <StatCard icon={Clock} label="Horas estudadas" value={`${stats.totalHours.toFixed(1)}h`} color="amber" />
        <StatCard icon={Hourglass} label="Horas restantes" value={`${stats.remainingHours.toFixed(1)}h`} color="slate" />
        <StatCard icon={Target} label="Progresso geral" value={`${Math.round(stats.overallProgress)}%`} color="blue" />
        <StatCard icon={BarChart3} label="Média diária" value={`${Math.round(stats.avgDaily)}min`} color="cyan" />
        <StatCard icon={Trophy} label="Categorias" value={categories.length} color="amber" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Evolução dos estudos" subtitle="Horas estudadas por mês (últimos 12 meses)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="gradHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2} fill="url(#gradHours)" name="Horas" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Distribuição por status" subtitle="Proporção de cursos por status">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Horas por categoria" subtitle="Tempo dedicado a cada área">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="horas" radius={[0, 6, 6, 0]} name="Horas">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color || CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Ranking de categorias" subtitle="Cursos por categoria (top 8)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rankingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="cursos" radius={[6, 6, 0, 0]} name="Cursos">
                {rankingData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Progresso por categoria" subtitle="Radar de progresso (%)">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" strokeOpacity={0.3} />
              <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748b' }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: '#94a3b8' }} angle={90} domain={[0, 100]} />
              <Radar dataKey="progress" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} name="Progresso %" />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Timeline de aprendizado" subtitle="Sessões de estudo recentes">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.3} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="minutos" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} name="Minutos" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
