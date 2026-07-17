import { useState, useEffect, useCallback, FormEvent } from 'react';
import {
  BookOpen, Plus, Search, Star, ExternalLink, Pencil, Trash2,
  GripVertical, Filter, BookMarked,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import ProgressBar from '@/components/ProgressBar';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useDragReorder, DragItemProps } from '@/hooks/useDragReorder';
import { supabase } from '@/lib/supabase';
import {
  Course, Category, Institution, CourseStatus,
  STATUS_LABELS, STATUS_COLORS,
} from '@/types';

const STATUS_OPTIONS: CourseStatus[] = ['not_started', 'in_progress', 'completed', 'archived'];

export default function Courses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [favFilter, setFavFilter] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const [cRes, catRes, instRes] = await Promise.all([
      supabase.from('courses').select('*, category:categories(*), institution:institutions(*)').order('sort_order'),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('institutions').select('*').order('sort_order'),
    ]);
    if (cRes.data) setCourses(cRes.data as unknown as Course[]);
    if (catRes.data) setCategories(catRes.data as Category[]);
    if (instRes.data) setInstitutions(instRes.data as Institution[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filtered = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && c.category_id !== categoryFilter) return false;
    if (favFilter && !c.is_favorite) return false;
    return true;
  });

  const { getItemProps } = useDragReorder({
    items: filtered,
    onReorder: async (newOrder) => {
      const idToCourse = new Map(filtered.map((c) => [c.id, c]));
      const ordered = newOrder.map((id) => idToCourse.get(id)!).filter(Boolean);
      setCourses((prev) => {
        const nonFiltered = prev.filter((c) => !filtered.some((f) => f.id === c.id));
        return [...nonFiltered, ...ordered];
      });
      for (let i = 0; i < newOrder.length; i++) {
        supabase.from('courses').update({ sort_order: i }).eq('id', newOrder[i]);
      }
      toast('Ordem salva automaticamente', 'success');
    },
  });

  const toggleFavorite = async (course: Course) => {
    setCourses((prev) => prev.map((c) => c.id === course.id ? { ...c, is_favorite: !c.is_favorite } : c));
    await supabase.from('courses').update({ is_favorite: !course.is_favorite }).eq('id', course.id);
  };

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (c: Course) => { setEditing(c); setModalOpen(true); };

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('courses').delete().eq('id', deleteId);
    if (error) { toast('Erro ao excluir curso', 'error'); return; }
    setCourses((prev) => prev.filter((c) => c.id !== deleteId));
    toast('Curso excluído', 'success');
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Cursos"
        subtitle="Organize seus cursos EAD em um só lugar"
        action={<button onClick={openNew} className="btn-primary"><Plus className="w-5 h-5" /> Novo curso</button>}
      />

      {/* Filters */}
      <div className="card-base p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11"
            placeholder="Buscar curso..."
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input sm:w-44">
          <option value="all">Todos os status</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input sm:w-44">
          <option value="all">Todas categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button
          onClick={() => setFavFilter((v) => !v)}
          className={favFilter ? 'btn-primary' : 'btn-secondary'}
          title="Favoritos"
        >
          <Star className={`w-5 h-5 ${favFilter ? 'fill-current' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card-base p-5"><div className="skeleton h-6 w-3/4 mb-3" /><div className="skeleton h-4 w-1/2 mb-4" /><div className="skeleton h-2 w-full" /></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={courses.length === 0 ? BookOpen : BookMarked}
          title={courses.length === 0 ? 'Nenhum curso cadastrado' : 'Nenhum curso encontrado'}
          description={courses.length === 0 ? 'Adicione seu primeiro curso para começar a organizar seus estudos.' : 'Tente ajustar os filtros de busca.'}
          action={courses.length === 0 ? <button onClick={openNew} className="btn-primary"><Plus className="w-5 h-5" /> Adicionar curso</button> : undefined}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              dragProps={getItemProps(course.id, index)}
              onToggleFav={() => toggleFavorite(course)}
              onEdit={() => openEdit(course)}
              onDelete={() => setDeleteId(course.id)}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <CourseModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          course={editing}
          categories={categories}
          institutions={institutions}
          onSaved={() => { setModalOpen(false); loadAll(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir curso"
        message="Tem certeza? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function CourseCard({
  course, dragProps, onToggleFav, onEdit, onDelete,
}: {
  course: Course;
  dragProps: DragItemProps;
  onToggleFav: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const progress = course.total_hours > 0
    ? (course.completed_hours / course.total_hours) * 100
    : course.total_modules > 0
    ? (course.completed_modules / course.total_modules) * 100
    : 0;

  return (
    <div
      {...dragProps}
      className={`card-base p-5 group cursor-grab active:cursor-grabbing transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${dragProps.className || ''}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span
            className="badge"
            style={{ backgroundColor: `${STATUS_COLORS[course.status]}20`, color: STATUS_COLORS[course.status] }}
          >
            {STATUS_LABELS[course.status]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onToggleFav} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Favoritar">
            <Star className={`w-4 h-4 ${course.is_favorite ? 'fill-warning-400 text-warning-400' : 'text-slate-400'}`} />
          </button>
          {course.platform_url && (
            <a href={course.platform_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Abrir curso">
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          )}
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" aria-label="Editar">
            <Pencil className="w-4 h-4 text-slate-400" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-950/40 transition-colors" aria-label="Excluir">
            <Trash2 className="w-4 h-4 text-slate-400 hover:text-error-500" />
          </button>
        </div>
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">{course.title}</h3>
      <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-500 dark:text-slate-400">
        {course.category && (
          <span className="inline-flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: course.category.color }} />
            {course.category.name}
          </span>
        )}
        {course.institution && <span>{course.institution.name}</span>}
      </div>

      {course.total_hours > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span>{course.completed_hours}h / {course.total_hours}h</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={course.completed_hours} max={course.total_hours} color={STATUS_COLORS[course.status]} height="sm" />
        </div>
      )}

      {course.notes && <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2">{course.notes}</p>}
    </div>
  );
}

function CourseModal({
  open, onClose, course, categories, institutions, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  course: Course | null;
  categories: Category[];
  institutions: Institution[];
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: course?.title || '',
    category_id: course?.category_id || '',
    institution_id: course?.institution_id || '',
    platform_url: course?.platform_url || '',
    notes: course?.notes || '',
    status: course?.status || 'not_started',
    total_hours: course?.total_hours || 0,
    completed_hours: course?.completed_hours || 0,
    total_modules: course?.total_modules || 0,
    completed_modules: course?.completed_modules || 0,
    total_lessons: course?.total_lessons || 0,
    completed_lessons: course?.completed_lessons || 0,
  });
  const [saving, setSaving] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', color: '#3b82f6' });
  const [showInstForm, setShowInstForm] = useState(false);
  const [newInst, setNewInst] = useState('');
  const [localCats, setLocalCats] = useState(categories);
  const [localInsts, setLocalInsts] = useState(institutions);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      title: form.title,
      category_id: form.category_id || null,
      institution_id: form.institution_id || null,
      platform_url: form.platform_url || null,
      notes: form.notes || null,
      status: form.status,
      total_hours: Number(form.total_hours),
      completed_hours: Number(form.completed_hours),
      total_modules: Number(form.total_modules),
      completed_modules: Number(form.completed_modules),
      total_lessons: Number(form.total_lessons),
      completed_lessons: Number(form.completed_lessons),
    };
    const { error } = course
      ? await supabase.from('courses').update(payload).eq('id', course.id)
      : await supabase.from('courses').insert(payload);
    setSaving(false);
    if (error) { toast('Erro ao salvar curso', 'error'); return; }
    toast(course ? 'Curso atualizado' : 'Curso criado', 'success');
    onSaved();
  };

  const addCategory = async () => {
    if (!newCat.name.trim()) return;
    const { data, error } = await supabase.from('categories').insert({
      name: newCat.name,
      color: newCat.color,
      sort_order: localCats.length,
    }).select().single();
    if (error) { toast('Erro ao criar categoria', 'error'); return; }
    const cat = data as Category;
    setLocalCats([...localCats, cat]);
    setForm({ ...form, category_id: cat.id });
    setNewCat({ name: '', color: '#3b82f6' });
    setShowCatForm(false);
    toast('Categoria criada', 'success');
  };

  const addInstitution = async () => {
    if (!newInst.trim()) return;
    const { data, error } = await supabase.from('institutions').insert({
      name: newInst,
      sort_order: localInsts.length,
    }).select().single();
    if (error) { toast('Erro ao criar instituição', 'error'); return; }
    const inst = data as Institution;
    setLocalInsts([...localInsts, inst]);
    setForm({ ...form, institution_id: inst.id });
    setNewInst('');
    setShowInstForm(false);
    toast('Instituição criada', 'success');
  };

  return (
    <Modal open={open} onClose={onClose} title={course ? 'Editar curso' : 'Novo curso'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Título do curso *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Ex: JavaScript Completo" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Categoria</label>
              <button type="button" onClick={() => setShowCatForm((v) => !v)} className="text-xs text-primary-600 hover:underline">+ Nova</button>
            </div>
            {showCatForm ? (
              <div className="flex gap-2">
                <input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })} className="input" placeholder="Nome" />
                <input type="color" value={newCat.color} onChange={(e) => setNewCat({ ...newCat, color: e.target.value })} className="w-12 h-10 rounded-lg border border-slate-300 dark:border-slate-700 cursor-pointer" />
                <button type="button" onClick={addCategory} className="btn-primary px-3">OK</button>
              </div>
            ) : (
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input">
                <option value="">Sem categoria</option>
                {localCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Instituição</label>
              <button type="button" onClick={() => setShowInstForm((v) => !v)} className="text-xs text-primary-600 hover:underline">+ Nova</button>
            </div>
            {showInstForm ? (
              <div className="flex gap-2">
                <input value={newInst} onChange={(e) => setNewInst(e.target.value)} className="input" placeholder="Nome da instituição" />
                <button type="button" onClick={addInstitution} className="btn-primary px-3">OK</button>
              </div>
            ) : (
              <select value={form.institution_id} onChange={(e) => setForm({ ...form, institution_id: e.target.value })} className="input">
                <option value="">Sem instituição</option>
                {localInsts.map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            )}
          </div>
        </div>

        <div>
          <label className="label">Link da plataforma</label>
          <input type="url" value={form.platform_url} onChange={(e) => setForm({ ...form, platform_url: e.target.value })} className="input" placeholder="https://..." />
        </div>

        <div>
          <label className="label">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CourseStatus })} className="input">
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Carga horária total (h)</label>
            <input type="number" min="0" step="0.5" value={form.total_hours} onChange={(e) => setForm({ ...form, total_hours: +e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Horas concluídas</label>
            <input type="number" min="0" step="0.5" value={form.completed_hours} onChange={(e) => setForm({ ...form, completed_hours: +e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Módulos totais</label>
            <input type="number" min="0" value={form.total_modules} onChange={(e) => setForm({ ...form, total_modules: +e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Módulos concluídos</label>
            <input type="number" min="0" value={form.completed_modules} onChange={(e) => setForm({ ...form, completed_modules: +e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Aulas totais</label>
            <input type="number" min="0" value={form.total_lessons} onChange={(e) => setForm({ ...form, total_lessons: +e.target.value })} className="input" />
          </div>
          <div>
            <label className="label">Aulas concluídas</label>
            <input type="number" min="0" value={form.completed_lessons} onChange={(e) => setForm({ ...form, completed_lessons: +e.target.value })} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Anotações</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input min-h-[80px] resize-y" placeholder="Suas anotações sobre o curso..." />
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
