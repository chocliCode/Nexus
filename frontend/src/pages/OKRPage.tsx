import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { okrService, API_URL } from '../services/api';
import { LoadingSpinner, Modal, EmptyState, ProgressBar } from '../components/ui';
import { ClipboardList, Upload, CheckCircle2, XCircle, FileEdit, BarChart2, AlertTriangle, Calendar, Target, Paperclip, MessageSquare, Clock, Pencil, Trash2, Link as LinkIcon, Download } from 'lucide-react';
import type { OKR } from '../types';

import type { ReactNode } from 'react';

const ESTADO_MAP: Record<string, { bg: string; color: string; label: string; icon: ReactNode }> = {
  Pendiente:  { bg: 'var(--color-warning-light,#fff3cd)', color: 'var(--color-warning-dark,#856404)', label: 'Sin entregar', icon: <ClipboardList className="w-4 h-4 inline" /> },
  EnProgreso: { bg: 'var(--color-primary-100)', color: 'var(--color-primary-700)', label: 'Entregado', icon: <Upload className="w-4 h-4 inline" /> },
  Completado: { bg: 'var(--color-success-light)', color: 'var(--color-success-dark)', label: 'Calificado', icon: <CheckCircle2 className="w-4 h-4 inline" /> },
  Cancelado:  { bg: 'var(--color-danger-light)', color: 'var(--color-danger-dark)', label: 'Cancelado', icon: <XCircle className="w-4 h-4 inline" /> },
};

const OKRPage = () => {
  const { sesionId } = useParams<{ sesionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);
  const isJedi = user?.rol === 'Jedi';
  const isPadawan = user?.rol === 'Padawan';

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ descripcion: '', indicador: '', valor_meta: 100, fecha_limite: '' });
  const [creating, setCreating] = useState(false);

  // Submit (student)
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitOkr, setSubmitOkr] = useState<OKR | null>(null);
  const [submitText, setSubmitText] = useState('');
  const [submitLink, setSubmitLink] = useState('');
  const [submitFiles, setSubmitFiles] = useState<globalThis.File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Grade (mentor)
  const [showGrade, setShowGrade] = useState(false);
  const [gradeOkr, setGradeOkr] = useState<OKR | null>(null);
  const [gradeScore, setGradeScore] = useState(20);
  const [gradeNote, setGradeNote] = useState('');
  const [grading, setGrading] = useState(false);

  const loadOkrs = () => {
    if (!sesionId) return;
    okrService.listBySession(sesionId).then(r => setOkrs(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadOkrs(); }, [sesionId]);

  const handleCreate = async () => {
    if (!sesionId || !createForm.descripcion) return;
    setCreating(true);
    try {
      await okrService.create(sesionId, {
        descripcion: createForm.descripcion, indicador: createForm.indicador || undefined,
        valor_meta: createForm.valor_meta, fecha_limite: createForm.fecha_limite || undefined,
      });
      setShowCreate(false); setCreateForm({ descripcion: '', indicador: '', valor_meta: 100, fecha_limite: '' }); loadOkrs();
    } catch (e: unknown) { const err = e as { response?: { data?: { error?: string } } }; alert(err.response?.data?.error || 'Error'); } finally { setCreating(false); }
  };

  const handleSubmit = async () => {
    if (!submitOkr) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('estado', 'EnProgreso');
      if (submitText.trim()) formData.append('indicador', submitText.trim());
      if (submitLink.trim()) formData.append('url_enlace', submitLink.trim());
      submitFiles.forEach(f => formData.append('archivos', f));

      await okrService.update(submitOkr.okr_id, formData);
      setShowSubmit(false); setSubmitOkr(null); setSubmitText(''); setSubmitLink(''); setSubmitFiles([]); loadOkrs();
    } catch (e: unknown) { const err = e as { response?: { data?: { error?: string } } }; alert(err.response?.data?.error || 'Error'); } finally { setSubmitting(false); }
  };

  const handleGrade = async () => {
    if (!gradeOkr || !gradeNote.trim()) return;
    setGrading(true);
    try {
      await okrService.complete(gradeOkr.okr_id, { valor_actual: gradeScore, nota_cierre: gradeNote });
      setShowGrade(false); setGradeOkr(null); setGradeNote(''); loadOkrs();
    } catch (e: unknown) { const err = e as { response?: { data?: { error?: string } } }; alert(err.response?.data?.error || 'Error'); } finally { setGrading(false); }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const stats = {
    total: okrs.length,
    sinEntregar: okrs.filter(o => o.estado === 'Pendiente').length,
    entregados: okrs.filter(o => o.estado === 'EnProgreso').length,
    calificados: okrs.filter(o => o.estado === 'Completado').length,
  };

  return (
    <div className="animate-fade-in max-w-3xl">
      <button onClick={() => navigate(-1)} className="text-xs font-medium mb-2 inline-flex items-center gap-1" style={{ color: 'var(--color-primary-500)' }}>
        ← Volver
      </button>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <FileEdit className="w-6 h-6 text-primary-500" /> {isJedi ? 'Tareas de la Sesión' : 'Mis Tareas'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isJedi ? 'Asigna tareas y califica las entregas de tu Padawan.' : 'Entrega tus tareas para que tu mentor las revise.'}
          </p>
        </div>
        {isJedi && <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">+ Nueva tarea</button>}
      </div>

      {/* Stats */}
      {okrs.length > 0 && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: <BarChart2 className="w-4 h-4 inline" />, bg: 'var(--surface-input)' },
            { label: 'Sin entregar', value: stats.sinEntregar, icon: <ClipboardList className="w-4 h-4 inline" />, bg: 'var(--color-warning-light,#fff3cd)' },
            { label: 'Entregados', value: stats.entregados, icon: <Upload className="w-4 h-4 inline" />, bg: 'var(--color-primary-100)' },
            { label: 'Calificados', value: stats.calificados, icon: <CheckCircle2 className="w-4 h-4 inline" />, bg: 'var(--color-success-light)' },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center" style={{ backgroundColor: s.bg }}>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.icon} {s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Task List */}
      {okrs.length === 0 ? (
        <div className="card p-6">
          <EmptyState icon={<FileEdit className="w-12 h-12 text-neutral-400" />} title="Sin tareas"
            description={isJedi ? 'Crea la primera tarea para esta sesión.' : 'Tu mentor aún no ha asignado tareas.'}
            action={isJedi ? <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">+ Nueva tarea</button> : undefined} />
        </div>
      ) : (
        <div className="space-y-3">
          {okrs.map(okr => {
            const st = ESTADO_MAP[okr.estado] || ESTADO_MAP.Pendiente;
            const isLate = okr.fecha_limite && new Date(okr.fecha_limite) < new Date() && okr.estado === 'Pendiente';

            return (
              <div key={okr.okr_id} className="card p-0 overflow-hidden" style={{ border: isLate ? '2px solid var(--color-danger)' : '1px solid var(--border-light)' }}>
                {/* Header */}
                <div className="p-4 pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-3">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{okr.descripcion}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {okr.fecha_limite && (
                          <span className="flex items-center gap-1" style={{ color: isLate ? 'var(--color-danger)' : undefined }}>
                            {isLate ? <AlertTriangle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />} {new Date(okr.fecha_limite).toLocaleDateString('es-PE', { day:'numeric', month:'short' })}
                          </span>
                        )}
                        <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Puntaje máx: {okr.valor_meta}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap flex items-center gap-1" style={{ backgroundColor: st.bg, color: st.color }}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                </div>

                {/* Submission area */}
                {(okr.indicador || okr.url_enlace || (okr.archivos && okr.archivos.length > 0)) && (
                  <div className="px-4 py-3 mx-4 mb-3 rounded-xl text-xs" style={{ backgroundColor: 'var(--surface-input)', border: '1px dashed var(--border-light)' }}>
                    <p className="font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-primary)' }}><Paperclip className="w-3.5 h-3.5" /> Entrega del estudiante:</p>
                    {okr.indicador && <p style={{ color: 'var(--text-secondary)' }} className="mb-2 whitespace-pre-wrap">{okr.indicador}</p>}
                    
                    {okr.url_enlace && (
                      <a href={okr.url_enlace} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline mb-2" style={{ color: 'var(--color-primary-600)' }}>
                        <LinkIcon className="w-3 h-3" /> {okr.url_enlace}
                      </a>
                    )}

                    {okr.archivos && okr.archivos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {okr.archivos.map((archivo, idx) => {
                          const isImage = archivo.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                          return isImage ? (
                            <a key={idx} href={`${API_URL}${archivo.url}`} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity">
                              <img src={`${API_URL}${archivo.url}`} alt="adjunto" className="w-full h-full object-cover" />
                            </a>
                          ) : (
                            <a key={idx} href={`${API_URL}${archivo.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors border border-neutral-200 text-[11px] font-medium text-neutral-700">
                              <Download className="w-3.5 h-3.5" />
                              <span className="max-w-[120px] truncate">{archivo.nombre}</span>
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Grade display */}
                {okr.estado === 'Completado' && (
                  <div className="px-4 pb-3">
                    <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--color-success-light)' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--color-success-dark)' }}><BarChart2 className="w-3.5 h-3.5" /> Calificación</span>
                        <span className="text-lg font-bold" style={{ color: 'var(--color-success-dark)' }}>{okr.valor_actual}/{okr.valor_meta}</span>
                      </div>
                      <ProgressBar value={okr.valor_actual} max={okr.valor_meta} showLabel={false} />
                      {okr.notas && <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-success-dark)' }}><MessageSquare className="w-3.5 h-3.5" /> {okr.notas}</p>}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderTop: '1px solid var(--border-light)', backgroundColor: 'var(--surface-input)' }}>
                  {isPadawan && okr.estado === 'Pendiente' && (
                    <button onClick={() => { setSubmitOkr(okr); setSubmitText(okr.indicador || ''); setShowSubmit(true); }}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1" style={{ backgroundColor: 'var(--color-primary-500)', color: '#fff' }}>
                      <Upload className="w-3.5 h-3.5" /> Entregar tarea
                    </button>
                  )}
                  {isPadawan && okr.estado === 'EnProgreso' && (
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Clock className="w-3.5 h-3.5" /> Esperando calificación del mentor...</span>
                  )}
                  {isJedi && okr.estado === 'EnProgreso' && (
                    <button onClick={() => { setGradeOkr(okr); setGradeScore(Number(okr.valor_meta)); setGradeNote(''); setShowGrade(true); }}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1" style={{ backgroundColor: 'var(--color-success)', color: '#fff' }}>
                      <Pencil className="w-3.5 h-3.5" /> Calificar
                    </button>
                  )}
                  {isJedi && okr.estado === 'Pendiente' && (
                    <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><ClipboardList className="w-3.5 h-3.5" /> Esperando entrega del estudiante...</span>
                  )}
                  {isJedi && ['Pendiente', 'EnProgreso'].includes(okr.estado) && (
                    <button onClick={async () => { await okrService.delete(okr.okr_id); loadOkrs(); }}
                      className="text-xs font-medium ml-auto flex items-center gap-1" style={{ color: 'var(--color-danger)' }}><Trash2 className="w-3.5 h-3.5" /> Eliminar</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title={<span className="flex items-center gap-2"><FileEdit className="w-5 h-5" /> Asignar nueva tarea</span>}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Descripción de la tarea</label>
            <textarea className="input-field" rows={3} placeholder="Ej: Implementar un hook personalizado para manejo de formularios..."
              value={createForm.descripcion} onChange={e => setCreateForm({...createForm, descripcion: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Puntaje máximo</label>
              <input className="input-field" type="number" min={1} value={createForm.valor_meta}
                onChange={e => setCreateForm({...createForm, valor_meta: Number(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha límite</label>
              <input className="input-field" type="date" value={createForm.fecha_limite}
                onChange={e => setCreateForm({...createForm, fecha_limite: e.target.value})} />
            </div>
          </div>
          <button onClick={handleCreate} disabled={creating || !createForm.descripcion} className="btn-primary w-full flex items-center justify-center gap-2">
            {creating ? 'Creando...' : <><FileEdit className="w-4 h-4" /> Asignar tarea</>}
          </button>
        </div>
      </Modal>

      {/* Submit Modal */}
      <Modal isOpen={showSubmit} onClose={() => setShowSubmit(false)} title={<span className="flex items-center gap-2"><Upload className="w-5 h-5" /> Entregar tarea</span>}>
        <div className="space-y-4">
          {submitOkr && (
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-input)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{submitOkr.descripcion}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Puntaje máx: {submitOkr.valor_meta}</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Comentarios sobre tu entrega</label>
            <textarea className="input-field" rows={3} placeholder="Describe lo que hiciste..."
              value={submitText} onChange={e => setSubmitText(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Enlace (opcional)</label>
            <input className="input-field" type="url" placeholder="Ej: https://github.com/..."
              value={submitLink} onChange={e => setSubmitLink(e.target.value)} />
          </div>
          <div className="border border-dashed border-neutral-300 rounded-xl p-3 bg-neutral-50/50">
            <label className="block text-xs font-semibold mb-2 text-neutral-600">Adjuntar archivos/imágenes (Máx. 5)</label>
            <input type="file" multiple className="text-xs text-neutral-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors" onChange={e => setSubmitFiles(Array.from(e.target.files || []))} />
            {submitFiles.length > 0 && (
              <div className="mt-2 text-xs text-primary-600 font-medium">
                {submitFiles.length} archivo(s) seleccionado(s)
              </div>
            )}
          </div>
          <button onClick={handleSubmit} disabled={submitting || (!submitText.trim() && !submitLink.trim() && submitFiles.length === 0)} className="btn-primary w-full flex items-center justify-center gap-2">
            {submitting ? 'Enviando...' : <><Upload className="w-4 h-4" /> Entregar</>}
          </button>
        </div>
      </Modal>

      {/* Grade Modal */}
      <Modal isOpen={showGrade} onClose={() => setShowGrade(false)} title={<span className="flex items-center gap-2"><Pencil className="w-5 h-5" /> Calificar tarea</span>}>
        <div className="space-y-4">
          {gradeOkr && (
            <>
              <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--surface-input)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{gradeOkr.descripcion}</p>
              </div>
              {(gradeOkr.indicador || gradeOkr.url_enlace || (gradeOkr.archivos && gradeOkr.archivos.length > 0)) && (
                <div className="p-3 rounded-xl" style={{ backgroundColor: 'var(--color-primary-50)', border: '1px dashed var(--color-primary-200)' }}>
                  <p className="text-xs font-medium mb-1.5 flex items-center gap-1" style={{ color: 'var(--color-primary-700)' }}><Paperclip className="w-3.5 h-3.5" /> Entrega del estudiante:</p>
                  {gradeOkr.indicador && <p className="text-sm mb-2 whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>{gradeOkr.indicador}</p>}

                  {gradeOkr.url_enlace && (
                    <a href={gradeOkr.url_enlace} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium hover:underline mb-2" style={{ color: 'var(--color-primary-600)' }}>
                      <LinkIcon className="w-3 h-3" /> {gradeOkr.url_enlace}
                    </a>
                  )}

                  {gradeOkr.archivos && gradeOkr.archivos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {gradeOkr.archivos.map((archivo, idx) => {
                        const isImage = archivo.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                        return isImage ? (
                          <a key={idx} href={`${API_URL}${archivo.url}`} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity">
                            <img src={`${API_URL}${archivo.url}`} alt="adjunto" className="w-full h-full object-cover" />
                          </a>
                        ) : (
                          <a key={idx} href={`${API_URL}${archivo.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors border border-neutral-200 text-[11px] font-medium text-neutral-700">
                            <Download className="w-3.5 h-3.5" />
                            <span className="max-w-[120px] truncate">{archivo.nombre}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Puntaje (máx: {gradeOkr?.valor_meta})
            </label>
            <input className="input-field" type="number" min={0} max={gradeOkr?.valor_meta || 100}
              value={gradeScore} onChange={e => setGradeScore(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Retroalimentación</label>
            <textarea className="input-field" rows={3} placeholder="Buen trabajo, pero podrías mejorar..."
              value={gradeNote} onChange={e => setGradeNote(e.target.value)} />
          </div>
          <button onClick={handleGrade} disabled={grading || !gradeNote.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
            {grading ? 'Calificando...' : <><Pencil className="w-4 h-4" /> Calificar</>}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default OKRPage;
