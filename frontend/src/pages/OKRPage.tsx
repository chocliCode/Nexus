import { EmptyState } from '../components/ui';

const OKRPage = () => (
  <div className="animate-fade-in">
    <h1 className="text-2xl font-bold font-display mb-6" style={{ color: 'var(--text-primary)' }}>
      OKRs
    </h1>
    <div className="card p-6">
      <EmptyState
        icon="📈"
        title="Módulo pendiente de implementación"
        description="Los OKRs se habilitarán próximamente."
      />
    </div>
  </div>
);

export default OKRPage;
