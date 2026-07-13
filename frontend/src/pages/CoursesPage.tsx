import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Users, Plus, X, Unlock, Lock, CheckCircle, LogOut, ChevronRight, GraduationCap } from 'lucide-react';

interface Course {
  curso_id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: 'Borrador' | 'Abierto' | 'Cerrado';
  max_estudiantes: number;
  jedi_nombre?: string;
  jedi_id?: string;
  inscritos: number;
  ya_inscrito?: boolean;
  fecha_apertura?: string;
  fecha_creacion: string;
  // for mine (jedi view)
  estado_inscripcion?: string;
  fecha_inscripcion?: string;
}

const CATEGORIA_COLORS: Record<string, string> = {
  Frontend:  '#6366f1',
  Backend:   '#10b981',
  DevOps:    '#f59e0b',
  'IA / ML': '#ec4899',
  Seguridad: '#ef4444',
  Diseño:    '#8b5cf6',
};

const CATEGORIAS = ['Frontend', 'Backend', 'DevOps', 'IA / ML', 'Seguridad', 'Diseño', 'Otro'];

const categoryColor = (cat: string) => CATEGORIA_COLORS[cat] || '#64748b';

const StatusBadge = ({ estado }: { estado: string }) => {
  const map: Record<string, { label: string; color: string }> = {
    Abierto:  { label: 'Abierto',  color: '#10b981' },
    Borrador: { label: 'Borrador', color: '#f59e0b' },
    Cerrado:  { label: 'Cerrado',  color: '#ef4444' },
  };
  const s = map[estado] || { label: estado, color: '#64748b' };
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
          style={{ backgroundColor: `${s.color}22`, color: s.color }}>
      {s.label}
    </span>
  );
};

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isJedi = user?.rol === 'Jedi' || user?.rol === 'Admin';

  const [tab, setTab] = useState<'catalog' | 'mine'>(isJedi ? 'mine' : 'catalog');
  const [courses, setCourses] = useState<Course[]>([]);
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // Create course modal
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', categoria: 'Frontend', max_estudiantes: 30 });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [catalogRes, mineRes] = await Promise.all([
        courseService.list(),
        courseService.mine(),
      ]);
      setCourses(catalogRes.data.data);
      setMyCourses(mineRes.data.data);
    } catch {
      showToast('Error cargando cursos', 'err');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
  useEffect(() => { void loadData(); }, []);

  const handleJoin = async (courseId: string) => {
    setActionLoading(courseId);
    try {
      await courseService.join(courseId);
      showToast('¡Te uniste al curso exitosamente!');
      await loadData();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      showToast(err?.response?.data?.error || 'No se pudo unir al curso', 'err');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (courseId: string) => {
    setActionLoading(courseId);
    try {
      await courseService.leave(courseId);
      showToast('Abandonaste el curso.');
      await loadData();
    } catch {
      showToast('Error al abandonar el curso', 'err');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpen = async (courseId: string) => {
    setActionLoading(courseId);
    try {
      await courseService.open(courseId);
      showToast('¡Curso publicado y abierto al público!');
      await loadData();
    } catch {
      showToast('Error al abrir el curso', 'err');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClose = async (courseId: string) => {
    setActionLoading(courseId);
    try {
      await courseService.close(courseId);
      showToast('Curso cerrado.');
      await loadData();
    } catch {
      showToast('Error al cerrar el curso', 'err');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titulo.trim()) return;
    setSubmitting(true);
    try {
      await courseService.create(form);
      showToast('Curso creado correctamente.');
      setShowCreate(false);
      setForm({ titulo: '', descripcion: '', categoria: 'Frontend', max_estudiantes: 30 });
      await loadData();
      setTab('mine');
    } catch {
      showToast('Error al crear el curso', 'err');
    } finally {
      setSubmitting(false);
    }
  };

  const displayCourses = isJedi ? myCourses : (tab === 'catalog' ? courses : myCourses);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[999] px-4 py-3 rounded-xl text-sm font-medium shadow-xl animate-fade-in"
             style={{ backgroundColor: toast.type === 'ok' ? '#10b981' : '#ef4444', color: '#fff', minWidth: 260 }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            {isJedi ? 'Gestión de Cursos' : 'Catálogo de Cursos'}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {isJedi ? 'Crea y gestiona tus cursos grupales' : 'Explora y únete a cursos disponibles'}
          </p>
        </div>
        {isJedi && (
          <button onClick={() => setShowCreate(true)} id="btn-create-course"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ backgroundColor: 'var(--color-primary-500)' }}>
            <Plus className="w-4 h-4" /> Crear Curso
          </button>
        )}
      </div>

      {/* Tabs */}
      {!isJedi && (
        <div className="flex gap-1 p-1 rounded-xl w-fit mb-6" style={{ backgroundColor: 'var(--surface-card)' }}>
          {[
            { key: 'catalog', label: 'Disponibles' },
            { key: 'mine',    label: 'Mis Inscripciones' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key as 'catalog' | 'mine')}
                    className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: tab === t.key ? 'var(--color-primary-500)' : 'transparent',
                      color: tab === t.key ? '#fff' : 'var(--text-muted)',
                    }}>
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 rounded-full animate-spin"
               style={{ borderColor: 'var(--color-primary-500)', borderTopColor: 'transparent' }} />
        </div>
      ) : displayCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4"
             style={{ color: 'var(--text-muted)' }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
               style={{ backgroundColor: 'var(--surface-card)' }}>
            <BookOpen className="w-8 h-8" style={{ color: 'var(--color-primary-400)' }} />
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {tab === 'catalog' ? 'No hay cursos disponibles aún' : isJedi ? 'No has creado ningún curso' : 'No estás inscrito en ningún curso'}
            </p>
            <p className="text-sm mt-1">
              {tab === 'catalog' ? 'Vuelve pronto o revisa tus inscripciones.' : isJedi ? 'Crea tu primer curso con el botón de arriba.' : 'Explora el catálogo y únete a un curso.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {displayCourses.map((c) => {
            const loading = actionLoading === c.curso_id;
            const inscritos = Number(c.inscritos ?? 0);
            const pct = Math.round((inscritos / c.max_estudiantes) * 100);
            const catColor = categoryColor(c.categoria);

            return (
              <div key={c.curso_id}
                   className="rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-0.5"
                   style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
                {/* Color banner */}
                <div className="h-2 w-full" style={{ backgroundColor: catColor }} />

                <div className="flex flex-col flex-1 p-5 gap-3">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white"
                            style={{ backgroundColor: catColor }}>
                        {c.categoria || 'General'}
                      </span>
                      <StatusBadge estado={c.estado} />
                    </div>
                    {c.ya_inscrito && (
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#10b981' }} />
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-base leading-snug cursor-pointer hover:underline"
                      onClick={() => navigate(`/courses/${c.curso_id}`)}
                      style={{ color: 'var(--text-primary)' }}>
                    {c.titulo}
                  </h3>

                  {/* Description */}
                  {c.descripcion && (
                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                      {c.descripcion}
                    </p>
                  )}

                  {/* Instructor */}
                  {c.jedi_nombre && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{c.jedi_nombre}</span>
                    </div>
                  )}

                  {/* Capacity bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {inscritos} / {c.max_estudiantes} alumnos
                      </span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: 'var(--color-neutral-700)' }}>
                      <div className="h-1.5 rounded-full transition-all"
                           style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pct >= 100 ? '#ef4444' : catColor }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto pt-2 flex gap-2">
                    {/* Jedi actions */}
                    {isJedi && c.jedi_id === user?.usuario_id && (
                      <>
                        {c.estado === 'Borrador' && (
                          <button onClick={() => handleOpen(c.curso_id)} disabled={loading}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                  style={{ backgroundColor: '#10b981' }}>
                            <Unlock className="w-3.5 h-3.5" />
                            {loading ? 'Abriendo…' : 'Abrir curso'}
                          </button>
                        )}
                        {c.estado === 'Abierto' && (
                          <button onClick={() => handleClose(c.curso_id)} disabled={loading}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                  style={{ backgroundColor: '#ef4444' }}>
                            <Lock className="w-3.5 h-3.5" />
                            {loading ? 'Cerrando…' : 'Cerrar curso'}
                          </button>
                        )}
                        {c.estado === 'Cerrado' && (
                          <span className="flex-1 text-center text-xs py-2 rounded-xl font-semibold"
                                style={{ backgroundColor: 'var(--color-neutral-800)', color: 'var(--text-muted)' }}>
                            Curso cerrado
                          </span>
                        )}
                        <button onClick={() => navigate(`/courses/${c.curso_id}`)}
                                className="flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                                style={{ backgroundColor: 'var(--surface-page)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                          <Users className="w-3.5 h-3.5" />
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </>
                    )}

                    {/* Padawan actions */}
                    {!isJedi && (
                      c.ya_inscrito ? (
                        <button onClick={() => handleLeave(c.curso_id)} disabled={loading}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ backgroundColor: 'var(--color-neutral-800)', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                          <LogOut className="w-3.5 h-3.5" />
                          {loading ? 'Saliendo…' : 'Abandonar'}
                        </button>
                      ) : (
                        <button onClick={() => handleJoin(c.curso_id)} disabled={loading || inscritos >= c.max_estudiantes}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
                                style={{ backgroundColor: 'var(--color-primary-500)' }}
                                id={`btn-join-${c.curso_id}`}>
                          <BookOpen className="w-3.5 h-3.5" />
                          {loading ? 'Uniéndose…' : inscritos >= c.max_estudiantes ? 'Lleno' : 'Unirme al curso'}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Course Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="w-full max-w-md rounded-2xl overflow-hidden animate-fade-in"
               style={{ backgroundColor: 'var(--surface-card)', boxShadow: 'var(--shadow-lg)' }}>
            {/* Modal header */}
            <div className="flex items-center justify-between p-5"
                 style={{ borderBottom: '1px solid var(--border-light)' }}>
              <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
                Crear nuevo curso
              </h2>
              <button onClick={() => setShowCreate(false)}
                      className="p-1 rounded-lg transition-colors hover:opacity-70">
                <X className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label htmlFor="titulo" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Título del curso *
                </label>
                <input
                  id="titulo"
                  value={form.titulo}
                  onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: React Moderno con TypeScript"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                  style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label htmlFor="descripcion" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  value={form.descripcion}
                  onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe el contenido, objetivos y a quién va dirigido…"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all resize-none"
                  style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="categoria" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Categoría
                  </label>
                  <select
                    id="categoria"
                    value={form.categoria}
                    onChange={(e) => setForm(f => ({ ...f, categoria: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="max_estudiantes" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Cupo máximo
                  </label>
                  <input
                    id="max_estudiantes"
                    type="number" min={1} max={200}
                    value={form.max_estudiantes}
                    onChange={(e) => setForm(f => ({ ...f, max_estudiantes: parseInt(e.target.value) || 30 }))}
                    className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                    style={{ backgroundColor: 'var(--surface-page)', border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                El curso se creará en estado <strong>Borrador</strong>. Ábrelo manualmente cuando esté listo.
              </p>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                        style={{ border: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={submitting || !form.titulo.trim()}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--color-primary-500)' }}>
                  {submitting ? 'Creando…' : 'Crear curso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
