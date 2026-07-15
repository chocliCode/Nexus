import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { membershipService } from '../services/api';
import { LoadingSpinner } from '../components/ui';
import { CheckCircle2, Star, Zap, Users, BookOpen, ChevronRight } from 'lucide-react';

interface Membership {
  membresia_id: string;
  nombre: string;
  precio: string;
  limite_mentores: number;
  limite_cursos: number;
  caracteristicas: string[];
}

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loadingMemberships, setLoadingMemberships] = useState(true);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await membershipService.list();
        setMemberships(res.data.data || []);
      } catch (error) {
        console.error('Error fetching memberships', error);
      } finally {
        setLoadingMemberships(false);
      }
    };
    fetchMemberships();
  }, []);

  if (isLoading) return <LoadingSpinner size="lg" />;
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-primary-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-500/30">N</div>
            <span className="text-xl font-bold tracking-tight">Nexus</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary-400 transition-colors">Iniciar sesión</Link>
            <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary-500/25">
              Únete gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span></span>
            <span className="text-sm font-medium text-neutral-300">Transformando el talento tecnológico</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Acelera tu carrera con nosotros<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Mentoría Élite</span>
          </h1>
          <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Nexus conecta a estudiantes ambiciosos (Padawans) con expertos de la industria (Jedis). Aprende en cursos interactivos y domina tus habilidades con acompañamiento personalizado 1-a-1.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-medium px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl shadow-primary-500/30 flex items-center justify-center gap-2 text-lg">
              Comenzar mi camino <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-24 px-6 bg-black/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Padawan */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap className="w-32 h-32 text-primary-500" />
              </div>
              <div className="w-14 h-14 bg-primary-500/20 rounded-2xl flex items-center justify-center mb-6 border border-primary-500/30">
                <BookOpen className="w-7 h-7 text-primary-400" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Conviértete en Padawan</h3>
              <p className="text-neutral-400 mb-8 leading-relaxed">Únete como estudiante y accede a un ecosistema de aprendizaje diseñado para potenciar tu empleabilidad. Encuentra a tu mentor ideal, inscríbete en cursos especializados y completa desafíos reales (OKRs) para destacar en la industria.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-neutral-300"><CheckCircle2 className="w-5 h-5 text-primary-500" /> Matching inteligente con mentores</li>
                <li className="flex items-center gap-3 text-neutral-300"><CheckCircle2 className="w-5 h-5 text-primary-500" /> Aulas virtuales y foros interactivos</li>
                <li className="flex items-center gap-3 text-neutral-300"><CheckCircle2 className="w-5 h-5 text-primary-500" /> Portafolio de habilidades validado</li>
              </ul>
            </div>
            
            {/* Jedi */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <Star className="w-32 h-32 text-accent-500" />
              </div>
              <div className="w-14 h-14 bg-accent-500/20 rounded-2xl flex items-center justify-center mb-6 border border-accent-500/30">
                <Users className="w-7 h-7 text-accent-400" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Lidera como Mentor Jedi</h3>
              <p className="text-neutral-400 mb-8 leading-relaxed">Comparte tu experiencia y guía a la próxima generación de talentos. Como Jedi, puedes crear cursos, asignar tareas (OKRs), calificar entregas y monetizar tu conocimiento mientras construyes una reputación estelar.</p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-neutral-300"><CheckCircle2 className="w-5 h-5 text-accent-500" /> Crea y gestiona múltiples cursos</li>
                <li className="flex items-center gap-3 text-neutral-300"><CheckCircle2 className="w-5 h-5 text-accent-500" /> Evalúa entregas con feedback enriquecido</li>
                <li className="flex items-center gap-3 text-neutral-300"><CheckCircle2 className="w-5 h-5 text-accent-500" /> Impacta directamente en el éxito de tus alumnos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Memberships */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Elige tu Nivel de Poder</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Selecciona la membresía que mejor se adapte a tu ritmo de aprendizaje. Actualiza cuando lo necesites.</p>
          </div>
          
          {loadingMemberships ? (
            <div className="flex justify-center"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {memberships.map((plan) => {
                const isPro = plan.nombre.toLowerCase().includes('caballero');
                return (
                  <div key={plan.membresia_id} className={`relative p-8 rounded-3xl border transition-all hover:-translate-y-2 ${isPro ? 'bg-primary-900/20 border-primary-500/50 shadow-2xl shadow-primary-500/20' : 'bg-white/5 border-white/10'}`}>
                    {isPro && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">Más Popular</div>}
                    <h3 className="text-xl font-bold mb-2">{plan.nombre}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold">{Number(plan.precio) === 0 ? 'Gratis' : `S/ ${Number(plan.precio)}`}</span>
                      <span className="text-neutral-400">/mes</span>
                    </div>
                    <ul className="space-y-4 mb-8">
                      {plan.caracteristicas.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPro ? 'text-primary-400' : 'text-neutral-500'}`} />
                          <span className="text-neutral-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/register" className={`w-full py-3.5 rounded-xl font-medium flex items-center justify-center transition-colors ${isPro ? 'bg-primary-500 hover:bg-primary-600 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                      Comenzar ahora
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-bold">N</div>
            <span className="font-bold">Nexus</span>
          </div>
          <p className="text-neutral-500 text-sm">© 2026 Nexus Platform. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
