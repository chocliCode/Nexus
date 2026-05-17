import { useAuth } from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>
          ¡Bienvenido, {user?.nombres}!
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Rol: {user?.rol === 'Jedi' ? 'Mentor Jedi' : 'Padawan (Aprendiz)'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Sesiones', value: '—', icon: '🎯', desc: 'Próximamente' },
          { label: 'OKRs Activos', value: '—', icon: '📈', desc: 'Próximamente' },
          { label: 'Score', value: user?.score_empleabilidad?.toFixed(0) || '—', icon: '⭐', desc: 'Empleabilidad' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5 transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
            </div>
            <p className="text-3xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          🚧 Dashboard en construcción
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Los módulos de sesiones, OKRs, vacantes y matching se irán habilitando a medida que se implementen.
          Por ahora puedes navegar por las secciones disponibles en la barra lateral.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
