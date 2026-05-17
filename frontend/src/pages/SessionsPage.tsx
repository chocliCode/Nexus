import { EmptyState } from '../components/ui';

const SessionsPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--text-primary)' }}>
      Sesiones de Mentoría
    </h1>
    <div className="card p-6">
      <EmptyState
        icon="🎯"
        title="Módulo pendiente de implementación"
        description="Las sesiones de mentoría se habilitarán próximamente."
      />
    </div>
  </div>
);

export default SessionsPage;
