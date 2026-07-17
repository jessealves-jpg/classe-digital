import { useState, useEffect, useCallback, FormEvent } from 'react';
import { Award, Plus, Trash2, ExternalLink, Calendar, BookOpen } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { Certificate, Course } from '@/types';

export default function Certificates() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [cRes, courseRes] = await Promise.all([
      supabase.from('certificates').select('*, course:courses(*)').order('created_at', { ascending: false }),
      supabase.from('courses').select('*').order('title'),
    ]);
    if (cRes.data) setCertificates(cRes.data as unknown as Certificate[]);
    if (courseRes.data) setCourses(courseRes.data as Course[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from('certificates').delete().eq('id', deleteId);
    if (error) { toast('Erro ao excluir certificado', 'error'); return; }
    setCertificates((prev) => prev.filter((c) => c.id !== deleteId));
    toast('Certificado excluído', 'success');
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Certificados"
        subtitle="Armazene e organize seus certificados de conclusão"
        action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-5 h-5" /> Novo certificado</button>}
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card-base p-5"><div className="skeleton h-12 w-12 rounded-xl mb-3" /><div className="skeleton h-5 w-3/4 mb-2" /><div className="skeleton h-4 w-1/2" /></div>)}
        </div>
      ) : certificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Nenhum certificado"
          description="Adicione seus certificados de conclusão de cursos para mantê-los organizados."
          action={<button onClick={() => setModalOpen(true)} className="btn-primary"><Plus className="w-5 h-5" /> Adicionar certificado</button>}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => (
            <div key={cert.id} className="card-base p-5 group transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-warning-400 to-warning-600 flex items-center justify-center shadow-md">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {cert.file_url && (
                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </a>
                  )}
                  <button onClick={() => setDeleteId(cert.id)} className="p-1.5 rounded-lg hover:bg-error-50 dark:hover:bg-error-950/40">
                    <Trash2 className="w-4 h-4 text-slate-400 hover:text-error-500" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">{cert.title}</h3>
              {cert.course && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-2">
                  <BookOpen className="w-3 h-3" /> {cert.course.title}
                </p>
              )}
              {cert.issued_at && (
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Emitido em {new Date(cert.issued_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <CertificateModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          courses={courses}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir certificado"
        message="Deseja remover este certificado?"
        confirmLabel="Excluir"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}

function CertificateModal({
  open, onClose, courses, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  courses: Course[];
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '',
    course_id: '',
    file_url: '',
    issued_at: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('certificates').insert({
      title: form.title,
      course_id: form.course_id || null,
      file_url: form.file_url || null,
      issued_at: form.issued_at || null,
    });
    setSaving(false);
    if (error) { toast('Erro ao salvar certificado', 'error'); return; }
    toast('Certificado adicionado', 'success');
    onSaved();
  };

  return (
    <Modal open={open} onClose={onClose} title="Novo certificado">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Título do certificado *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" placeholder="Ex: Certificado de Conclusão" />
        </div>
        <div>
          <label className="label">Curso relacionado</label>
          <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className="input">
            <option value="">Sem curso relacionado</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Link do certificado</label>
          <input type="url" value={form.file_url} onChange={(e) => setForm({ ...form, file_url: e.target.value })} className="input" placeholder="https://..." />
        </div>
        <div>
          <label className="label">Data de emissão</label>
          <input type="date" value={form.issued_at} onChange={(e) => setForm({ ...form, issued_at: e.target.value })} className="input" />
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
