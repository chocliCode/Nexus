-- ============================================================
-- NEXUS — Migration 006: Aula Virtual de Cursos (Posts y Comentarios)
-- UC-32: Publicar contenido y discusiones dentro de un curso
-- ============================================================

-- POSTS DEL CURSO (anuncios, materiales, tareas)
CREATE TABLE IF NOT EXISTS curso_post (
  post_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id        UUID NOT NULL REFERENCES curso(curso_id) ON DELETE CASCADE,
  autor_id        UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
  tipo            VARCHAR(30) DEFAULT 'anuncio' CHECK (tipo IN ('anuncio','material','tarea','discusion','examen')),
  titulo          VARCHAR(300),
  contenido       TEXT NOT NULL,
  url_enlace      VARCHAR(500),
  archivo_url     VARCHAR(255),
  archivo_nombre  VARCHAR(255),
  fijado          BOOLEAN DEFAULT false,
  fecha_creacion  TIMESTAMP DEFAULT NOW()
);

-- COMENTARIOS EN POSTS DEL CURSO
CREATE TABLE IF NOT EXISTS curso_comentario (
  comentario_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES curso_post(post_id) ON DELETE CASCADE,
  autor_id        UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
  contenido       TEXT NOT NULL,
  fecha_creacion  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curso_post_curso ON curso_post(curso_id, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_curso_comentario_post ON curso_comentario(post_id, fecha_creacion ASC);

-- ============================================================
-- SEED DATA — Posts de demo en el primer curso
-- ============================================================

INSERT INTO curso_post (curso_id, autor_id, tipo, titulo, contenido, fijado)
VALUES
  (
    'c0000001-0000-0000-0000-000000000001',
    'b2222222-2222-2222-2222-222222222222',
    'anuncio',
    'Bienvenidos al curso de React con TypeScript',
    'Hola a todos! En este curso vamos a dominar React 19 con TypeScript. Empezaremos con los fundamentos y avanzaremos hasta patrones avanzados. Les recomiendo tener Node.js 20+ instalado.',
    true
  ),
  (
    'c0000001-0000-0000-0000-000000000001',
    'b2222222-2222-2222-2222-222222222222',
    'material',
    'Recursos: Documentacion oficial',
    'Aqui les dejo los links principales:
- React docs: https://react.dev
- TypeScript handbook: https://www.typescriptlang.org/docs/
- Vite: https://vitejs.dev',
    false
  ),
  (
    'c0000001-0000-0000-0000-000000000001',
    'b2222222-2222-2222-2222-222222222222',
    'tarea',
    'Tarea 1: Componente contador con useState',
    'Creen un componente contador que tenga: boton de incrementar, decrementar, y reset. Bonus: que el color cambie segun el valor (positivo=verde, negativo=rojo, cero=gris). Entrega: proximo lunes.',
    false
  );

-- Demo comments
INSERT INTO curso_comentario (post_id, autor_id, contenido)
SELECT p.post_id, 'a1111111-1111-1111-1111-111111111111', 'Genial profe, ya tengo todo instalado y listo para arrancar!'
FROM curso_post p WHERE p.titulo = 'Bienvenidos al curso de React con TypeScript';

-- ============================================================
-- CALIFICACIONES (Notas)
-- ============================================================

CREATE TABLE IF NOT EXISTS curso_calificacion (
  calificacion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id        UUID NOT NULL REFERENCES curso(curso_id) ON DELETE CASCADE,
  padawan_id      UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
  post_id         UUID REFERENCES curso_post(post_id) ON DELETE SET NULL, -- Opcional, si es de una tarea
  titulo          VARCHAR(200) NOT NULL,
  nota            DECIMAL(5,2) NOT NULL,
  nota_maxima     DECIMAL(5,2) DEFAULT 20.00,
  comentario      TEXT,
  fecha_calificacion TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_curso_calificacion_curso ON curso_calificacion(curso_id);
CREATE INDEX IF NOT EXISTS idx_curso_calificacion_padawan ON curso_calificacion(padawan_id);

-- Demo grades
INSERT INTO curso_calificacion (curso_id, padawan_id, titulo, nota, nota_maxima, comentario)
VALUES (
  'c0000001-0000-0000-0000-000000000001',
  'a1111111-1111-1111-1111-111111111111',
  'Examen Inicial',
  18,
  20,
  'Muy buen desempeño'
);
