import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, Plus, Clock, Trash2, Sparkles, GripVertical,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDragReorder } from '@/hooks/useDragReorder';
import { supabase } from '@/lib/supabase';
import { Course, WeeklyScheduleItem, DAY_NAMES, DAY_NAMES_SHORT } from '@/types';

export default function Agenda() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<WeeklyScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [autoModalOpen, setAutoModalOpen] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [sRes, cRes] = await Promise.all([
      supabase.from('weekly_schedule').select('*, course:courses(*)').order('day_of_week').order('sort_order'),
      supabase.from('courses').select('*').order('sort_order'),
    ]);
    if (sRes.data) setSchedule(sRes.data as unknown as WeeklyScheduleItem[]);
    if (cRes.data) setCourses(cRes.data as Course[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const activeCourses = courses.filter((c) => c.status === 'in_progress' || c.status === 'not_started');

  const removeItem = async (id: string) => {
    setSchedule((prev) => prev.filter((s) => s.id !== id));
    await supabase.from('weekly_schedule').delete().eq('id', id);
    toast('Item removido da agenda', 'info');
  };

  const itemsByDay = (day: number) => schedule.filter((s) => s.day_of_week === day).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div>
      <PageHeader
        title="Agenda de Estudos"
        subtitle="Planeje sua semana e distribua o tempo entre cursos"
        action={
          <div className="flex gap-2">
            <button onClick={() => setAutoModalOpen(true)} className="btn-secondary" disabled={activeCourses.length === 0}>
              <Sparkles className="w-5 h-5" /> Distribuir automaticamente
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary" disabled={courses.length === 0}>
              <Plus className="w-5 h-5" /> Adicionar
            </button>
          </div>
        }
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {[...Array(7)].map((_, i) => <div key={i} className="card-base p-4 min-h-[200px]"><div className="skeleton h-5 w-20 mb-3" /><div className="skeleton h-16 w-full mb-2" /></div>)}
        </div>
      ) : schedule.length === 0 && courses.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum curso para agendar"
          description="Cadastre cursos primeiro para montar sua agenda semanal."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {DAY_NAMES.map((dayName, dayIdx) => {
            const dayItems = itemsByDay(dayIdx);
            return (
              <DayColumn
                key={dayIdx}
                dayIdx={dayIdx}
                dayName={dayName}
                dayShort={DAY_NAMES_SHORT[dayIdx]}
                items={dayItems}
                onRemove={removeItem}
                onReorder={async (newOrder) => {
                  for (let i = 0; i < newOrder.length; i++) {
                    await supabase.from('weekly_schedule').update({ sort_order: i }).eq('id', newOrder[i]);
                  }
                  setSchedule((prev) => {
                    const updated = [...prev];
                    newOrder.forEach((id, i) => {
                      const idx = updated.findIndex((u) => u.id === id);
                      if (idx >= 0) updated[idx] = { ...updated[idx], sort_order: i };
                    });
                    return updated;
                  });
                }}
              />
            );
          })}
        </div>
      )}

      {modalOpen && (
        <AddScheduleModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          courses={courses}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}

      {autoModalOpen && (
        <AutoDistributeModal
          open={autoModalOpen}
          onClose={() => setAutoModalOpen(false)}
          courses={activeCourses}
          onSaved={() => { setAutoModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}

function DayColumn({
  dayIdx, dayName, dayShort, items, onRemove, onReorder,
}: {
  dayIdx: number;
  dayName: string;
  dayShort: string;
  items: WeeklyScheduleItem[];
  onRemove: (id: string) => void;
  onReorder: (newOrder: string[]) => void;
}) {
  const { getItemProps } = useDragReorder({ items, onReorder });
  const today = new Date().getDay();
  const isToday = dayIdx === today;
  const totalMin = items.reduce((sum, i) => sum + i.duration_minutes, 0);

  return (
    <div className={`card-base p-3 min-h-[200px] ${isToday ? 'ring-2 ring-primary-500' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-semibold text-sm text-slate-900 dark:text-white">
            <span className="lg:hidden">{dayName}</span>
            <span className="hidden lg:block">{dayShort}</span>
          </p>
          {isToday && <span className="text-xs text-primary-600 dark:text-primary-400">Hoje</span>}
        </div>
        {totalMin > 0 && (
          <span className="text-xs text-slate-500 dark:text-slate-400">{Math.floor(totalMin / 60)}h{totalMin % 60 > 0 ? `${totalMin % 60}m` : ''}</span>
        )}
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400 dark:text-slate-600 text-center py-6">Livre</p>
        ) : (
          items.map((item, index) => {
            const dragProps = getItemProps(item.id, index);
            return (
              <div
                key={item.id}
                {...dragProps}
                className={`card-base p-2.5 group cursor-grab active:cursor-grabbing ${dragProps.className || ''}`}
              >
              <div className="flex items-start justify-between gap-1">
                <div className="flex items-center gap-1 min-w-0">
                  <GripVertical className="w-3 h-3 text-slate-300 dark:text-slate-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-900 dark:text-white truncate">{item.course?.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {item.start_time} · {item.duration_minutes}min
                    </p>
                  </div>
                </div>
                <button onClick={() => onRemove(item.id)} className="p-1 rounded text-slate-400 hover:text-error-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function AddScheduleModal({
  open, onClose, courses, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [courseId, setCourseId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('08:00');
  const [duration, setDuration] = useState(60);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) { toast('Selecione um curso', 'error'); return; }
    setSaving(true);
    const { count } = await supabase.from('weekly_schedule').select('*', { count: 'exact', head: true }).eq('day_of_week', dayOfWeek);
    const { error } = await supabase.from('weekly_schedule').insert({
      course_id: courseId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      duration_minutes: duration,
      sort_order: count ?? 0,
    });
    setSaving(false);
    if (error) { toast('Erro ao adicionar', 'error'); return; }
    toast('Item adicionado à agenda', 'success');
    onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title="Adicionar à agenda">
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
            <label className="label">Dia da semana</label>
            <select value={dayOfWeek} onChange={(e) => setDayOfWeek(+e.target.value)} className="input">
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Início</label>
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Duração (minutos)</label>
          <input type="number" min="15" step="15" value={duration} onChange={(e) => setDuration(+e.target.value)} className="input" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Adicionar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AutoDistributeModal({
  open, onClose, courses, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [dailyMinutes, setDailyMinutes] = useState(120);
  const [startHour, setStartHour] = useState('08:00');
  const [coursesPerDay, setCoursesPerDay] = useState(2);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set(courses.map((c) => c.id)));
  const [saving, setSaving] = useState(false);

  const toggleCourse = (id: string) => {
    setSelectedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDistribute = async () => {
    if (selectedCourses.size === 0) { toast('Selecione ao menos um curso', 'error'); return; }
    setSaving(true);
    await supabase.from('weekly_schedule').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const chosen = courses.filter((c) => selectedCourses.has(c.id));
    const minutesPerCourse = Math.floor(dailyMinutes / Math.min(coursesPerDay, chosen.length));
    const days = [1, 2, 3, 4, 5, 6, 0];
    const items: Omit<WeeklyScheduleItem, 'id' | 'user_id' | 'created_at'>[] = [];

    days.forEach((day, dayIdx) => {
      const dayCourses = chosen.slice((dayIdx * coursesPerDay) % chosen.length, ((dayIdx * coursesPerDay) % chosen.length) + coursesPerDay);
      const wrapped = dayCourses.length < coursesPerDay
        ? [...dayCourses, ...chosen.slice(0, coursesPerDay - dayCourses.length)]
        : dayCourses;
      let [h, m] = startHour.split(':').map(Number);
      wrapped.forEach((course, i) => {
        const endH = h + Math.floor((m + minutesPerCourse) / 60);
        const endM = (m + minutesPerCourse) % 60;
        items.push({
          course_id: course.id,
          day_of_week: day,
          start_time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
          duration_minutes: minutesPerCourse,
          sort_order: i,
        });
        h = endH; m = endM;
      });
    });

    const { error } = await supabase.from('weekly_schedule').insert(items);
    setSaving(false);
    if (error) { toast('Erro ao distribuir agenda', 'error'); return; }
    toast('Agenda distribuída automaticamente!', 'success');
    onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title="Distribuir automaticamente" size="lg">
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-sm text-primary-700 dark:text-primary-300 flex gap-2">
          <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>O sistema distribuirá os cursos selecionados entre os dias da semana com base no seu tempo diário disponível.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Tempo diário (min)</label>
            <input type="number" min="30" step="15" value={dailyMinutes} onChange={(e) => setDailyMinutes(+e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Início</label>
            <input type="time" value={startHour} onChange={(e) => setStartHour(e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Cursos por dia</label>
            <input type="number" min="1" max="5" value={coursesPerDay} onChange={(e) => setCoursesPerDay(+e.target.value)} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Cursos a distribuir</label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-1">
            {courses.map((c) => (
              <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCourses.has(c.id)}
                  onChange={() => toggleCourse(c.id)}
                  className="w-4 h-4 rounded accent-primary-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">{c.title}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleDistribute} disabled={saving} className="btn-primary flex-1">
            {saving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Distribuir'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
