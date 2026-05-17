import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { sessionService } from '../services/api';
import { LoadingSpinner, Modal, EmptyState } from '../components/ui';
import type { Session } from '../types';
import api from '../services/api';

type TabFilter = 'todas' | 'Programada' | 'Realizada' | 'Cancelada';

const ESTADO_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  Programada: { bg: 'var(--color-primary-100)', color: 'var(--color-primary-700)', label: 'Programada' },
  Realizada: { bg: 'var(--color-success-light)', color: 'var(--color-success-dark)', label: 'Realizada' },
  Cancelada: { bg: 'var(--color-danger-light)', color: 'var(--color-danger-dark)', label: 'Cancelada' },
};

const SessionsPage = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TabFilter>('todas');

  // UC-12: Modal para crear sesión
  const [showCreate, setShowCreate] = useState(false);
  const [matchingId, setMatchingId] = useState('');
  const [matchings, setMatchings] = useState<{ matching_id: string; nombre: string }[]>([]);
  const [createForm, setCreateForm] = useState({ titulo: '', fecha_sesion: '', duracion_min: 60, notas: '' });
  const [creating, setCreating] = useState(false);

  // UC-13: Modal para completar sesión
  const [showComplete, setShowComplete] = useState(false);
  const [completeSession, setCompleteSession] = useState<Session | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');
  const [completing, setCompleting] = useState(false);

  const loadSessions = () => {
    sessionService.getMySessions()
      .then((res) => setSessions(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadMatchings = () => {
    api.get('/matchings/me')
      .then((res) => {
        const active = res.data.data
          .filter((m: Record<string, string>) => m.estado === 'Activo')
          .map((m: Record<string, string>) => ({
            matching_id: m.matching_id,
            nombre: m.mentor_nombres
              ? `${m.mentor_nombres} ${m.mentor_apellidos}`
              : `${m.padawan_nombres} ${m.padawan_apellidos}`,
          }));
        setMatchings(active);
        if (active.length > 0) setMatchingId(active[0].matching_id);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadSessions();
    loadMatchings();
  }, []);

  /** UC-12: Programar sesión */
  const handleCreate = async () => {
    if (!matchingId || !createForm.titulo || !createForm.fecha_sesion) return;
    setCreating(true);
    try {
      await sessionService.create(matchingId, createForm);
      setShowCreate(false);
      setCreateForm({ titulo: '', fecha_sesion: '', duracion_min: 60, notas: '' });
      loadSessions();
    } catch { /* handled */ }
    finally { setCreating(false); }
  };

  /** UC-13: Marcar como Realizada */
  const handleComplete = async () => {
    if (!completeSession) return;
    setCompleting(true);
    try {
      await sessionService.update(completeSession.sesion_id, { estado: 'Realizada', notas: completeNotes || completeSession.notas });
      setShowComplete(false);
      setCompleteSession(null);
      setCompleteNotes('');
      loadSessions();
    } catch { /* handled */ }
    finally { setCompleting(false); }
  };

  /** UC-14: Cancelar sesión */
  const handleCancel = async (sesionId: string) => {
    try {
      await sessionService.delete(sesionId);
      loadSessions();
    } catch { /* handled */ }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const filtered = filter === 'todas' ? sessions : sessions.filter((s) => s.estado === filter);
  const tabs: { key: TabFilter; label: string; count: number }[] = [
    { key: 'todas', label: 'Todas', count: sessions.length },
    { key: 'Programada', label: 'Programadas', count: sessions.filter((s) => s.estado === 'Programada').length },
    { key: 'Realizada', label: 'Realizadas', count: sessions.filter((s) => s.estado === 'Realizada').length },
    { key: 'Cancelada', label: 'Canceladas', count: sessions.filter((s) => s.estado === 'Cancelada').length },
  ];

  const isPadawan = user?.rol === 'Padawan';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
            Sesiones de Mentoría
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {isPadawan ? 'Tus sesiones con tu mentor.' : 'Sesiones con tus aprendices.'}
          </p>
        </div>
        {matchings.length > 0 && (
          <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
            + Nueva sesión
          </button>
        )}
      </div>

      {/* Tabs — UC-15: filtros de historial */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg" style={{ backgroundColor: 'var(--color-neutral-100)' }}>
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
                  className="flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all"
                  style={{
                    backgroundColor: filter === tab.key ? 'var(--surface-card)' : 'transparent',
                    color: filter === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: filter === tab.key ? 'var(--shadow-sm)' : 'none',
                  }}>
            {tab.label} <span className="ml-1 opacity-60">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Session List */}
      {filtered.length === 0 ? (
        <div className="card p-6">
          <EmptyState icon="🎯" title="Sin sesiones"
                      description={filter === 'todas' ? 'Crea tu primera sesión de mentoría.' : `No hay sesiones con estado "${filter}".`} />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const style = ESTADO_STYLES[s.estado] || ESTADO_STYLES.Programada;
            const fecha = new Date(s.fecha_sesion);
            const partner = isPadawan
              ? `${s.mentor_nombres} ${s.mentor_apellidos}`
              : `${s.padawan_nombres} ${s.padawan_apellidos}`;

            return (
              <div key={s.sesion_id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>{s.titulo}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: style.bg, color: style.color }}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      con {partner} · {s.duracion_min} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-primary-600)' }}>
                      {fecha.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* OKR summary */}
                {(s.total_okrs ?? 0) > 0 && (
                  <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-input)' }}>
                    <span className="text-sm">📈</span>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {s.okrs_completados}/{s.total_okrs} OKRs completados
                    </p>
                  </div>
                )}

                {/* Notes preview — UC-15 */}
                {s.notas && (
                  <p className="text-xs mb-3 p-2 rounded-lg" style={{ backgroundColor: 'var(--surface-input)', color: 'var(--text-secondary)' }}>
                    📝 {s.notas.substring(0, 150)}{s.notas.length > 150 ? '...' : ''}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <Link to={`/sessions/${s.sesion_id}/okrs`} className="text-xs font-medium" style={{ color: 'var(--color-primary-500)' }}>
                    Ver OKRs →
                  </Link>

                  {s.estado === 'Programada' && !isPadawan && (
                    <button onClick={() => { setCompleteSession(s); setCompleteNotes(s.notas || ''); setShowComplete(true); }}
                            className="text-xs font-medium ml-auto" style={{ color: 'var(--color-success)' }}>
                      ✓ Completar
                    </button>
                  )}

                  {s.estado === 'Programada' && (
                    <button onClick={() => handleCancel(s.sesion_id)}
                            className="text-xs font-medium ml-auto" style={{ color: 'var(--color-danger)' }}>
                      ✕ Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UC-12: Modal crear sesión */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Programar nueva sesión">
        <div className="space-y-4">
          {matchings.length > 1 && (
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Matching</label>
              <select className="input-field" value={matchingId} onChange={(e) => setMatchingId(e.target.value)}>
                {matchings.map((m) => (
                  <option key={m.matching_id} value={m.matching_id}>con {m.nombre}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Título</label>
            <input className="input-field" placeholder="Revisión de código, Design review..."
                   value={createForm.titulo} onChange={(e) => setCreateForm({ ...createForm, titulo: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Fecha y hora</label>
              <input className="input-field" type="datetime-local"
                     value={createForm.fecha_sesion} onChange={(e) => setCreateForm({ ...createForm, fecha_sesion: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Duración (min)</label>
              <input className="input-field" type="number" min={15} max={480}
                     value={createForm.duracion_min} onChange={(e) => setCreateForm({ ...createForm, duracion_min: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Notas (opcional)</label>
            <textarea className="input-field" rows={2} placeholder="Agenda de la sesión..."
                      value={createForm.notas} onChange={(e) => setCreateForm({ ...createForm, notas: e.target.value })} />
          </div>
          <button onClick={handleCreate} disabled={creating || !createForm.titulo || !createForm.fecha_sesion}
                  className="btn-primary w-full flex items-center justify-center gap-2">
            {creating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {creating ? 'Creando...' : 'Programar sesión'}
          </button>
        </div>
      </Modal>

      {/* UC-13: Modal completar sesión */}
      <Modal isOpen={showComplete} onClose={() => setShowComplete(false)} title="Completar sesión">
        <div className="space-y-4">
          {completeSession && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-input)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{completeSession.titulo}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {new Date(completeSession.fecha_sesion).toLocaleDateString('es-PE')}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Notas y feedback de la sesión
            </label>
            <textarea className="input-field" rows={4} placeholder="Resumen, acuerdos, próximos pasos..."
                      value={completeNotes} onChange={(e) => setCompleteNotes(e.target.value)} />
          </div>
          <button onClick={handleComplete} disabled={completing}
                  className="btn-primary w-full flex items-center justify-center gap-2">
            {completing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
            {completing ? 'Guardando...' : '✓ Marcar como Realizada'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default SessionsPage;
