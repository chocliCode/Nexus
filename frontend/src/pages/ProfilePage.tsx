import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { profileService, membershipService } from '../services/api';
import { LoadingSpinner, Modal, PaymentModal } from '../components/ui';
import type { Skill, ProfileData, NivelHabilidad } from '../types';
import { Star, X, Crown, Activity, Zap } from 'lucide-react';

const NIVELES: { value: NivelHabilidad; label: string }[] = [
  { value: 'Basico', label: 'Básico' },
  { value: 'Intermedio', label: 'Intermedio' },
  { value: 'Avanzado', label: 'Avanzado' },
];

const NIVEL_COLORS: Record<string, string> = {
  Basico: 'var(--color-warning)',
  Intermedio: 'var(--color-primary-500)',
  Avanzado: 'var(--color-success-dark)',
};

const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedNivel, setSelectedNivel] = useState<NivelHabilidad>('Basico');
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [memberships, setMemberships] = useState<any[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingUpgradeId, setPendingUpgradeId] = useState<string | null>(null);
  const [selectedMembershipPrice, setSelectedMembershipPrice] = useState(0);

  // Buy Extra States
  const [showBuyExtraModal, setShowBuyExtraModal] = useState(false);
  const [buyExtraType, setBuyExtraType] = useState<'curso' | 'mentor'>('curso');
  const [buyExtraAmount, setBuyExtraAmount] = useState(1);
  const [buyExtraTotal, setBuyExtraTotal] = useState(0);
  const [isBuyingExtra, setIsBuyingExtra] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nombres: '', apellidos: '', resumen_bio: '', url_portafolio: '',
    especialidades: '', anios_experiencia: 0, bio_profesional: '',
  });

  const loadProfile = useCallback(async () => {
    try {
      const res = await profileService.getMyProfile();
      const p = res.data.data as ProfileData;
      setProfile(p);
      setFormData({
        nombres: p.nombres || '',
        apellidos: p.apellidos || '',
        resumen_bio: p.resumen_bio || '',
        url_portafolio: p.url_portafolio || '',
        especialidades: p.especialidades || '',
        anios_experiencia: p.anios_experiencia || 0,
        bio_profesional: p.bio_profesional || '',
      });
    } catch { /* handled */ }
  }, []);

  const loadSkills = useCallback(async () => {
    try {
      const res = await profileService.listSkills();
      setAllSkills(res.data.data);
    } catch { /* handled */ }
  }, []);

  const loadMemberships = useCallback(async () => {
    try {
      const res = await membershipService.list();
      setMemberships(res.data);
    } catch { /* handled */ }
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadAll = async () => {
      await Promise.all([loadProfile(), loadSkills(), loadMemberships()]);
      if (mounted) setLoading(false);
    };
    loadAll();
    return () => { mounted = false; };
  }, [loadProfile, loadSkills, loadMemberships]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await profileService.updateMyProfile(formData);
      await refreshUser();
      await loadProfile();
      setMessage('Perfil actualizado correctamente');
      setTimeout(() => setMessage(''), 3000);
    } catch { setMessage('Error al guardar'); }
    finally { setSaving(false); }
  };

  const initiateUpgrade = (membresia_id: string, price: number) => {
    if (price > 0) {
      setSelectedMembershipPrice(price);
      setPendingUpgradeId(membresia_id);
      setShowMembershipModal(false);
      setShowPaymentModal(true);
    } else {
      processUpgrade(membresia_id);
    }
  };

  const processUpgrade = async (membresia_id: string) => {
    try {
      await membershipService.update(membresia_id);
      await loadProfile();
      setMessage('Membresía actualizada con éxito');
      setShowMembershipModal(false);
      setShowPaymentModal(false);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setMessage(error.response?.data?.error || 'Error al actualizar membresía');
    }
  };

  const initiateBuyExtra = (type: 'curso' | 'mentor') => {
    setBuyExtraType(type);
    setBuyExtraAmount(1);
    setBuyExtraTotal(type === 'curso' ? 2 : 5); // 2 soles per course, 5 per mentor
    setShowBuyExtraModal(true);
  };

  const confirmBuyExtraSetup = () => {
    setShowBuyExtraModal(false);
    setIsBuyingExtra(true);
    setSelectedMembershipPrice(buyExtraTotal);
    setShowPaymentModal(true);
  };

  const processBuyExtra = async () => {
    try {
      await profileService.buyExtra({ type: buyExtraType, amount: buyExtraAmount });
      await loadProfile();
      setMessage(`¡Límite de ${buyExtraType}s expandido con éxito!`);
      setShowPaymentModal(false);
      setIsBuyingExtra(false);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setMessage(error.response?.data?.error || 'Error al comprar extras');
    }
  };

  const handlePaymentConfirm = () => {
    if (isBuyingExtra) {
      processBuyExtra();
    } else if (pendingUpgradeId) {
      processUpgrade(pendingUpgradeId);
    }
  };

  const addSkill = async () => {
    if (!selectedSkill) return;
    try {
      await profileService.addSkill({ habilidad_id: selectedSkill, nivel: selectedNivel });
      await loadProfile();
      setShowSkillModal(false);
      setSelectedSkill('');
    } catch { /* handled */ }
  };

  const handleRemoveSkill = async (habilidadId: string) => {
    try {
      await profileService.removeSkill(habilidadId);
      await loadProfile();
    } catch { /* handled */ }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  const isPadawan = user?.rol === 'Padawan';
  const isJedi = user?.rol === 'Jedi';

  // Skills que aún no tiene el usuario
  const availableSkills = allSkills.filter(
    (s) => !profile?.habilidades?.some((h) => h.habilidad_id === s.habilidad_id)
  );

  return (
    <div className="animate-fade-in max-w-3xl">
      <h1 className="text-2xl font-bold font-display mb-1" style={{ color: 'var(--text-primary)' }}>
        Mi Perfil
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
        {isPadawan ? 'Completa tu perfil y habilidades para mejorar tu score de empleabilidad.'
                    : 'Actualiza tu información profesional para conectar con aprendices.'}
      </p>

      {/* Mensaje de éxito */}
      {message && (
        <div className="mb-4 p-3 rounded-lg text-sm animate-fade-in"
             style={{
               backgroundColor: message.includes('Error') ? 'var(--color-danger-light)' : 'var(--color-success-light)',
               color: message.includes('Error') ? 'var(--color-danger-dark)' : 'var(--color-success-dark)',
             }}>
          {message}
        </div>
      )}

      {/* Datos personales */}
      <div className="card p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Datos personales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombres</label>
            <input className="input-field" value={formData.nombres}
                   onChange={(e) => setFormData({ ...formData, nombres: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Apellidos</label>
            <input className="input-field" value={formData.apellidos}
                   onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Bio y portafolio (Padawan) */}
      {isPadawan && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Perfil de Aprendiz
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Bio / Resumen
              </label>
              <textarea className="input-field" rows={3} value={formData.resumen_bio}
                        placeholder="Cuéntanos sobre ti, tus estudios y objetivos..."
                        onChange={(e) => setFormData({ ...formData, resumen_bio: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                URL del Portafolio
              </label>
              <input className="input-field" value={formData.url_portafolio}
                     placeholder="https://github.com/tu-usuario"
                     onChange={(e) => setFormData({ ...formData, url_portafolio: e.target.value })} />
            </div>
            {profile?.score_empleabilidad !== undefined && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-primary-50)' }}>
                <p className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--color-primary-700)' }}>
                  <Star className="w-4 h-4 text-warning" /> Score de empleabilidad: <strong>{profile.score_empleabilidad}</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Membresía (Padawan) */}
      {isPadawan && profile?.membresia_nombre && (
        <div className="card p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Crown className="w-5 h-5 text-primary-500" /> Mi Membresía
            </h2>
            <button onClick={() => setShowMembershipModal(true)} className="btn-secondary text-xs py-1.5 px-3 rounded-lg">
              Actualizar Plan
            </button>
          </div>
          
          <div className="p-4 rounded-xl mb-4 border border-primary-500/20 bg-primary-50">
            <h3 className="text-xl font-bold text-primary-700 mb-1">{profile.membresia_nombre}</h3>
            <p className="text-sm text-neutral-600 mb-4">Maneja tu capacidad de aprendizaje en Nexus.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs text-neutral-500 font-medium">Mentores Activos</p>
                  <button onClick={() => initiateBuyExtra('mentor')} className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full hover:bg-primary-200 transition-colors font-semibold">
                    + Comprar
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-neutral-800">
                    {profile.mentores_activos} <span className="text-sm text-neutral-400 font-normal">/ {profile.limite_mentores === 999 ? '∞' : (profile.limite_mentores || 0) + (profile.limite_mentores_extra || 0)}</span>
                  </span>
                  <Activity className="w-4 h-4 text-primary-500 mb-1" />
                </div>
                {(profile.limite_mentores_extra || 0) > 0 && (
                  <p className="text-[10px] text-primary-600 mt-1">Incluye +{profile.limite_mentores_extra} extra</p>
                )}
              </div>
              <div className="bg-white p-3 rounded-lg border border-neutral-200">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs text-neutral-500 font-medium">Cursos Activos</p>
                  <button onClick={() => initiateBuyExtra('curso')} className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full hover:bg-primary-200 transition-colors font-semibold">
                    + Comprar
                  </button>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-neutral-800">
                    {profile.cursos_activos} <span className="text-sm text-neutral-400 font-normal">/ {profile.limite_cursos === 999 ? '∞' : (profile.limite_cursos || 0) + (profile.limite_cursos_extra || 0)}</span>
                  </span>
                  <Zap className="w-4 h-4 text-primary-500 mb-1" />
                </div>
                {(profile.limite_cursos_extra || 0) > 0 && (
                  <p className="text-[10px] text-primary-600 mt-1">Incluye +{profile.limite_cursos_extra} extra</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Buy Extra Modal */}
      <Modal isOpen={showBuyExtraModal} onClose={() => setShowBuyExtraModal(false)} title={`Comprar ${buyExtraType === 'curso' ? 'Cursos' : 'Mentores'} Extra`}>
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            ¿Necesitas más capacidad? Compra espacios extra de forma vitalicia sin cambiar de plan de membresía.
          </p>
          <div className="flex justify-between items-center bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <div>
              <p className="font-semibold text-neutral-800">+1 {buyExtraType === 'curso' ? 'Curso' : 'Mentor'} Extra</p>
              <p className="text-xs text-neutral-500">Pago único, de por vida.</p>
            </div>
            <span className="font-bold text-primary-600">S/ {buyExtraType === 'curso' ? 2 : 5}.00</span>
          </div>
          
          <button onClick={confirmBuyExtraSetup} className="btn-primary w-full py-3 mt-4 flex justify-center items-center gap-2">
            Continuar con el Pago (S/ {buyExtraTotal}.00)
          </button>
        </div>
      </Modal>

      {/* Datos de Mentor (Jedi) */}
      {isJedi && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Perfil de Mentor
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Especialidades
              </label>
              <input className="input-field" value={formData.especialidades}
                     placeholder="React, Node.js, System Design..."
                     onChange={(e) => setFormData({ ...formData, especialidades: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Años de experiencia
              </label>
              <input className="input-field" type="number" min={0} max={50} value={formData.anios_experiencia}
                     onChange={(e) => setFormData({ ...formData, anios_experiencia: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
                Bio profesional
              </label>
              <textarea className="input-field" rows={3} value={formData.bio_profesional}
                        placeholder="Tu experiencia profesional y cómo puedes ayudar..."
                        onChange={(e) => setFormData({ ...formData, bio_profesional: e.target.value })} />
            </div>
          </div>
        </div>
      )}

      {/* Botón guardar */}
      <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 mb-8">
        {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
        {saving ? 'Guardando...' : 'Guardar cambios'}
      </button>

      {/* Habilidades (solo Padawan) — UC-04 */}
      {isPadawan && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Mis habilidades
            </h2>
            <button onClick={() => setShowSkillModal(true)} className="btn-secondary text-sm">
              + Agregar
            </button>
          </div>

          {profile?.habilidades && profile.habilidades.length > 0 ? (
            <div className="space-y-2">
              {profile.habilidades.map((skill) => (
                <div key={skill.ph_id || skill.habilidad_id}
                     className="flex items-center justify-between p-3 rounded-lg"
                     style={{ backgroundColor: 'var(--surface-input)' }}>
                  <div>
                    <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {skill.nombre}
                    </span>
                    <span className="text-xs ml-2 px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--color-neutral-200)',
                            color: 'var(--text-secondary)',
                          }}>
                      {skill.categoria}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'var(--color-neutral-100)',
                            color: NIVEL_COLORS[skill.nivel || 'Basico'],
                          }}>
                      {skill.nivel}
                    </span>
                    <button onClick={() => handleRemoveSkill(skill.habilidad_id)}
                            className="text-xs p-1 rounded transition-colors"
                            style={{ color: 'var(--color-danger)' }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm py-4 text-center" style={{ color: 'var(--text-muted)' }}>
              No tienes habilidades registradas. Agrega las tuyas para mejorar tu matching.
            </p>
          )}
        </div>
      )}

      {/* Modal agregar habilidad */}
      <Modal isOpen={showSkillModal} onClose={() => setShowSkillModal(false)} title="Agregar habilidad">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Habilidad
            </label>
            <select className="input-field" value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}>
              <option value="">Selecciona una habilidad</option>
              {availableSkills.map((s) => (
                <option key={s.habilidad_id} value={s.habilidad_id}>
                  {s.nombre} ({s.categoria})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
              Nivel de dominio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {NIVELES.map((n) => (
                <button key={n.value}
                        onClick={() => setSelectedNivel(n.value)}
                        className="py-2 rounded-lg text-sm font-medium transition-all"
                        style={{
                          backgroundColor: selectedNivel === n.value ? 'var(--color-primary-50)' : 'var(--surface-input)',
                          border: `2px solid ${selectedNivel === n.value ? 'var(--color-primary-400)' : 'var(--border-light)'}`,
                          color: selectedNivel === n.value ? 'var(--color-primary-700)' : 'var(--text-secondary)',
                        }}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>
          <button onClick={addSkill} className="btn-primary w-full mt-4">Agregar Habilidad</button>
        </div>
      </Modal>

      {/* Upgrade Membership Modal */}
      <Modal isOpen={showMembershipModal} onClose={() => setShowMembershipModal(false)} title="Actualizar Membresía">
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">Mejora tu plan para acceder a más cursos y mentores simultáneos.</p>
          <div className="grid grid-cols-1 gap-3 mt-4">
            {memberships.map((m) => {
              const isCurrent = m.nombre === profile?.membresia_nombre;
              return (
                <div key={m.membresia_id} className={`p-4 rounded-xl border ${isCurrent ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 hover:border-primary-300 bg-white'} transition-colors cursor-pointer flex justify-between items-center`} onClick={() => !isCurrent && initiateUpgrade(m.membresia_id, Number(m.precio))}>
                  <div>
                    <h4 className="font-bold text-neutral-800 flex items-center gap-2">
                      {m.nombre} {isCurrent && <span className="text-[10px] bg-primary-500 text-white px-2 py-0.5 rounded-full">Actual</span>}
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1">Cursos: {m.limite_cursos === 999 ? '∞' : m.limite_cursos} | Mentores: {m.limite_mentores === 999 ? '∞' : m.limite_mentores}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary-600">{Number(m.precio) === 0 ? 'Gratis' : `S/ ${Number(m.precio).toFixed(2)}`}</span>
                    {Number(m.precio) > 0 && <span className="text-xs text-neutral-400">/mes</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={selectedMembershipPrice}
        onConfirm={handlePaymentConfirm}
        title="Pago de Membresía"
      />
    </div>
  );
};

export default ProfilePage;
