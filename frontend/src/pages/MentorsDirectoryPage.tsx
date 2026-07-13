import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/ui';
import { mentorsService } from '../services/api';
import { Star, Briefcase, GraduationCap, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Mentor {
  mentor_id: string;
  nombres: string;
  apellidos: string;
  email: string;
  especialidades: string;
  anios_experiencia: number;
  calificacion_promedio: number;
  bio_profesional: string;
}

export default function MentorsDirectoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      const res = await mentorsService.list();
      setMentors(res.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar mentores');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (mentorId: string) => {
    if (user?.rol !== 'Padawan') return;
    setRequesting(mentorId);
    setError(null);
    setSuccess(null);
    try {
      await mentorsService.request(mentorId);
      setSuccess('Solicitud enviada correctamente. El mentor la revisará pronto.');
      setTimeout(() => navigate('/matching'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al enviar la solicitud');
    } finally {
      setRequesting(null);
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Directorio de Mentores</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Explora a nuestros expertos Jedi y elige con quién deseas continuar tu entrenamiento.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" />
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map(mentor => (
          <div key={mentor.mentor_id} className="rounded-3xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl flex flex-col h-full"
               style={{ backgroundColor: 'var(--surface-card)', border: '1px solid var(--border-light)' }}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md"
                     style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))' }}>
                  {mentor.nombres.charAt(0)}{mentor.apellidos.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {mentor.nombres} {mentor.apellidos}
                  </h3>
                  <div className="flex items-center gap-1 mt-1 text-xs font-semibold" style={{ color: '#eab308' }}>
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{mentor.calificacion_promedio} / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4" style={{ color: 'var(--color-primary-500)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{mentor.anios_experiencia} años de experiencia</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <GraduationCap className="w-4 h-4 mt-0.5" style={{ color: 'var(--color-primary-500)' }} />
                <div className="flex flex-wrap gap-1.5">
                  {mentor.especialidades?.split(',').map((esp, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: 'var(--surface-page)', color: 'var(--text-primary)' }}>
                      {esp.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm mt-3 line-clamp-3" style={{ color: 'var(--text-muted)' }}>
                {mentor.bio_profesional || 'Sin biografía disponible.'}
              </p>
            </div>

            {user?.rol === 'Padawan' && (
              <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
                <button onClick={() => handleRequest(mentor.mentor_id)}
                        disabled={requesting === mentor.mentor_id}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))' }}>
                  {requesting === mentor.mentor_id ? 'Enviando solicitud...' : 'Solicitar Mentoría'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
        {mentors.length === 0 && (
          <div className="col-span-full py-12 text-center" style={{ color: 'var(--text-muted)' }}>
            No hay mentores disponibles en este momento.
          </div>
        )}
      </div>
    </div>
  );
}
