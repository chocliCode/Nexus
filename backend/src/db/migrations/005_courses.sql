-- ============================================================
-- NEXUS — Migration 005: Sistema de Cursos Grupales
-- UC-29: Profesor abre curso / UC-30: Alumno se une al curso
-- ============================================================

-- CURSOS
CREATE TABLE IF NOT EXISTS curso (
  curso_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jedi_id         UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
  titulo          VARCHAR(300) NOT NULL,
  descripcion     TEXT,
  categoria       VARCHAR(100),
  estado          VARCHAR(20) DEFAULT 'Borrador' CHECK (estado IN ('Borrador','Abierto','Cerrado')),
  max_estudiantes INT DEFAULT 30,
  imagen_url      VARCHAR(500),
  fecha_creacion  TIMESTAMP DEFAULT NOW(),
  fecha_apertura  TIMESTAMP
);

-- INSCRIPCIONES DE PADAWANS A CURSOS
CREATE TABLE IF NOT EXISTS curso_inscripcion (
  inscripcion_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id          UUID NOT NULL REFERENCES curso(curso_id) ON DELETE CASCADE,
  padawan_id        UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
  fecha_inscripcion TIMESTAMP DEFAULT NOW(),
  estado            VARCHAR(20) DEFAULT 'Activo' CHECK (estado IN ('Activo','Abandonado')),
  UNIQUE(curso_id, padawan_id)
);

CREATE INDEX IF NOT EXISTS idx_curso_jedi    ON curso(jedi_id, estado);
CREATE INDEX IF NOT EXISTS idx_inscripcion_curso ON curso_inscripcion(curso_id);
CREATE INDEX IF NOT EXISTS idx_inscripcion_padawan ON curso_inscripcion(padawan_id);

-- ============================================================
-- SEED DATA — Cursos de demo
-- ============================================================

INSERT INTO curso (curso_id, jedi_id, titulo, descripcion, categoria, estado, max_estudiantes, fecha_apertura)
VALUES
  (
    'c0000001-0000-0000-0000-000000000001',
    'b2222222-2222-2222-2222-222222222222',
    'React Moderno con TypeScript',
    'Domina React 19 y TypeScript desde cero. Construiremos proyectos reales aplicando hooks avanzados, patrones de composición, React Query y optimización de rendimiento.',
    'Frontend',
    'Abierto',
    25,
    NOW()
  ),
  (
    'c0000002-0000-0000-0000-000000000002',
    'b2222222-2222-2222-2222-222222222222',
    'Node.js y APIs REST con PostgreSQL',
    'Aprende a construir APIs robustas con Express, validación con Zod, autenticación JWT, manejo de errores y conexión a PostgreSQL con transacciones ACID.',
    'Backend',
    'Abierto',
    20,
    NOW()
  ),
  (
    'c0000003-0000-0000-0000-000000000003',
    'b2222222-2222-2222-2222-222222222222',
    'DevOps y CI/CD con GitHub Actions',
    'Configura pipelines de integración continua, automatiza pruebas, containeriza aplicaciones con Docker y despliega con GitHub Actions.',
    'DevOps',
    'Borrador',
    15,
    NULL
  );

-- Inscripción demo: el Padawan ya está en el primer curso
INSERT INTO curso_inscripcion (curso_id, padawan_id, estado)
VALUES (
  'c0000001-0000-0000-0000-000000000001',
  'a1111111-1111-1111-1111-111111111111',
  'Activo'
);
