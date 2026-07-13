import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { sessionService, API_URL } from '../../services/api';
import { Modal } from '../ui';
import { useState } from 'react';
import type { Session } from '../../types';
import { Calendar, CheckCircle2, FileEdit, Check, X, BookOpen, ArrowRight, Download } from 'lucide-react';

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  Programada: { bg: 'var(--color-primary-100)', color: 'var(--color-primary-700)', label: '📅 Programada' },
  Realizada: { bg: 'var(--color-success-light)', color: 'var(--color-success-dark)', label: '✅ Realizada' },
  Cancelada: { bg: 'var(--color-danger-light)', color: 'var(--color-danger-dark)', label: '❌ Cancelada' },
};

export default function WorkTab({ matchingId, sessions, reload }: { matchingId: string; sessions: Session[]; reload: () => void }) {
  const { user } = useAuth();
  const isJedi = user?.rol === 'Jedi';
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ titulo: '', fecha_sesion: '', duracion_min: 60, notas: '' });
  const [creating, setCreating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [completeSession, setCompleteSession] = useState<Session | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [createFiles, setCreateFiles] = useState<globalThis.File[]>([]);
  const [completeFiles, setCompleteFiles] = useState<globalThis.File[]>([]);

  const handleCreate = async () => {
    if (!form.titulo || !form.fecha_sesion) return;
    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('titulo', form.titulo);
      formData.append('fecha_sesion', form.fecha_sesion);
      formData.append('duracion_min', form.duracion_min.toString());
      if (form.notas) formData.append('notas', form.notas);
      createFiles.forEach(file => formData.append('archivos', file));

      await sessionService.create(matchingId, formData);
      setShowCreate(false); setForm({ titulo: '', fecha_sesion: '', duracion_min: 60, notas: '' }); setCreateFiles([]); reload();
    } catch { /* */ } finally { setCreating(false); }
  };

  const handleComplete = async () => {
    if (!completeSession) return;
    try {
      const formData = new FormData();
      formData.append('estado', 'Realizada');
      formData.append('notas', completeNotes || completeSession.notas || '');
      completeFiles.forEach(file => formData.append('archivos', file));

      await sessionService.update(completeSession.sesion_id, formData);
      setShowComplete(false); setCompleteSession(null); setCompleteFiles([]); reload();
    } catch { /* */ }
  };

  const programadas = sessions.filter(s => s.estado === 'Programada');
  const realizadas = sessions.filter(s => s.estado === 'Realizada');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Actions */}
      {isJedi && (
        <div className="flex justify-end">
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">+ Nueva sesión</button>
        </div>
      )}

      {/* Programadas */}
      {programadas.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Calendar className="w-4 h-4 text-primary-500" /> Próximas sesiones <span className="text-xs font-normal px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-primary-100)', color: 'var(--color-primary-700)' }}>{programadas.length}</span>
          </h3>
          <div className="space-y-2">
            {programadas.map(s => {
              const style = ESTADO_STYLES[s.estado];
              return (
                <div key={s.sesion_id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: style.bg, color: style.color }}><FileEdit className="w-5 h-5" /></div>
                      <div>
                        <Link to={`/sessions/${s.sesion_id}/okrs`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--text-primary)' }}>{s.titulo}</Link>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {new Date(s.fecha_sesion).toLocaleDateString('es-PE', { weekday:'short', day:'numeric', month:'short' })} · {s.duracion_min} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isJedi && (
                        <button onClick={() => { setCompleteSession(s); setCompleteNotes(s.notas||''); setShowComplete(true); }}
                          className="text-xs font-medium px-3 py-1 rounded-lg flex items-center justify-center gap-1" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success-dark)' }}><Check className="w-3.5 h-3.5" /> Completar</button>
                      )}
                      <button onClick={async () => { await sessionService.delete(s.sesion_id); reload(); }}
                        className="p-1 rounded-lg transition-colors hover:bg-neutral-100" style={{ color: 'var(--color-danger)' }}><X className="w-4 h-4" /></button>
                    </div>
                  </div>

                  {s.archivos && s.archivos.length > 0 && (
                    <div className="mt-4 pl-13 flex flex-wrap gap-2">
                      {s.archivos.map((archivo, idx) => {
                        const isImage = archivo.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                        return isImage ? (
                          <a key={idx} href={`${API_URL}${archivo.url}`} target="_blank" rel="noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity">
                            <img src={`${API_URL}${archivo.url}`} alt="adjunto" className="w-full h-full object-cover" />
                          </a>
                        ) : (
                          <a key={idx} href={`${API_URL}${archivo.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors border border-neutral-200 text-xs font-medium text-neutral-700">
                            <Download className="w-4 h-4" />
                            <span className="max-w-[120px] truncate">{archivo.nombre}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Realizadas */}
      {realizadas.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><CheckCircle2 className="w-4 h-4 text-success" /> Sesiones completadas</h3>
          <div className="space-y-2">
            {realizadas.map(s => (
              <div key={s.sesion_id} className="card p-4" style={{ opacity: 0.85 }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success-dark)' }}><CheckCircle2 className="w-5 h-5" /></div>
                    <div>
                      <Link to={`/sessions/${s.sesion_id}/okrs`} className="text-sm font-medium hover:underline" style={{ color: 'var(--text-primary)' }}>{s.titulo}</Link>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(s.fecha_sesion).toLocaleDateString('es-PE', { day:'numeric', month:'short' })} · {s.total_okrs||0} tareas
                      </p>
                    </div>
                  </div>
                  <Link to={`/sessions/${s.sesion_id}/okrs`} className="text-xs font-medium flex items-center justify-center gap-1" style={{ color: 'var(--color-primary-500)' }}>Ver tareas <ArrowRight className="w-3.5 h-3.5" /></Link>
                </div>

                {s.archivos && s.archivos.length > 0 && (
                  <div className="mt-4 pl-13 flex flex-wrap gap-2">
                    {s.archivos.map((archivo, idx) => {
                      const isImage = archivo.url.match(/\.(jpeg|jpg|gif|png)$/i) != null;
                      return isImage ? (
                        <a key={idx} href={`${API_URL}${archivo.url}`} target="_blank" rel="noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 hover:opacity-90 transition-opacity">
                          <img src={`${API_URL}${archivo.url}`} alt="adjunto" className="w-full h-full object-cover" />
                        </a>
                      ) : (
                        <a key={idx} href={`${API_URL}${archivo.url}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors border border-neutral-200 text-[11px] font-medium text-neutral-700">
                          <Download className="w-3.5 h-3.5" />
                          <span className="max-w-[100px] truncate">{archivo.nombre}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sin sesiones aún</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{isJedi ? 'Crea la primera sesión para tu Padawan.' : 'Tu mentor aún no ha creado sesiones.'}</p>
        </div>
      )}

      {/* Create modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Programar sesión">
        <div className="space-y-3">
          <input className="input-field" placeholder="Título de la sesión" value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" type="datetime-local" value={form.fecha_sesion} onChange={e => setForm({...form, fecha_sesion: e.target.value})} />
            <input className="input-field" type="number" min={15} value={form.duracion_min} onChange={e => setForm({...form, duracion_min: Number(e.target.value)})} />
          </div>
          <textarea className="input-field" rows={2} placeholder="Notas (opcional)" value={form.notas} onChange={e => setForm({...form, notas: e.target.value})} />
          
          <div className="border border-dashed border-neutral-300 rounded-xl p-3 bg-neutral-50/50">
            <label className="block text-xs font-semibold mb-2 text-neutral-600">Adjuntar archivos/imágenes (Máx. 5)</label>
            <input type="file" multiple className="text-xs text-neutral-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors" onChange={e => setCreateFiles(Array.from(e.target.files || []))} />
            {createFiles.length > 0 && (
              <div className="mt-2 text-xs text-primary-600 font-medium">
                {createFiles.length} archivo(s) seleccionado(s)
              </div>
            )}
          </div>

          <button onClick={handleCreate} disabled={creating || !form.titulo || !form.fecha_sesion} className="btn-primary w-full flex items-center justify-center gap-2">
            {creating ? 'Creando...' : <><Calendar className="w-4 h-4" /> Programar</>}
          </button>
        </div>
      </Modal>

      {/* Complete modal */}
      <Modal isOpen={showComplete} onClose={() => setShowComplete(false)} title="Completar sesión">
        <div className="space-y-3">
          <textarea className="input-field" rows={3} placeholder="Notas y feedback..." value={completeNotes} onChange={e => setCompleteNotes(e.target.value)} />
          
          <div className="border border-dashed border-neutral-300 rounded-xl p-3 bg-neutral-50/50">
            <label className="block text-xs font-semibold mb-2 text-neutral-600">Archivos adjuntos adicionales</label>
            <input type="file" multiple className="text-xs text-neutral-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-colors" onChange={e => setCompleteFiles(Array.from(e.target.files || []))} />
          </div>

          <button onClick={handleComplete} className="btn-primary w-full flex items-center justify-center gap-2"><Check className="w-4 h-4" /> Marcar como Realizada</button>
        </div>
      </Modal>
    </div>
  );
}
