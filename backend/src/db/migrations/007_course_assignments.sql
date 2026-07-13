-- ============================================================
-- ENTREGAS DE TAREAS (Assignments)
-- ============================================================

CREATE TABLE IF NOT EXISTS curso_tarea_entrega (
  entrega_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES curso_post(post_id) ON DELETE CASCADE,
  padawan_id      UUID NOT NULL REFERENCES usuario(usuario_id) ON DELETE CASCADE,
  archivo_url     VARCHAR(255) NOT NULL,
  comentarios     TEXT,
  fecha_entrega   TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, padawan_id) -- Un alumno solo puede entregar una vez por tarea (puede sobreescribir si queremos, o actualizar)
);

CREATE INDEX IF NOT EXISTS idx_curso_tarea_entrega_post ON curso_tarea_entrega(post_id);
CREATE INDEX IF NOT EXISTS idx_curso_tarea_entrega_padawan ON curso_tarea_entrega(padawan_id);
