import { EmptyState } from '../components/ui';

const VacanciesPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--text-primary)' }}>
      Vacantes
    </h1>
    <div className="card p-6">
      <EmptyState
        icon="💼"
        title="Módulo pendiente de implementación"
        description="Las vacantes laborales se habilitarán próximamente."
      />
    </div>
  </div>
);

export default VacanciesPage;
