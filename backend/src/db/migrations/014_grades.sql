-- ============================================================
-- AGREGAR COLUMNAS DE CALIFICACIONES (GRADES) A ENTREGAS
-- ============================================================

ALTER TABLE curso_tarea_entrega ADD COLUMN IF NOT EXISTS nota NUMERIC(5,2);
ALTER TABLE curso_tarea_entrega ADD COLUMN IF NOT EXISTS feedback_mentor TEXT;
ALTER TABLE curso_tarea_entrega ADD COLUMN IF NOT EXISTS fecha_calificacion TIMESTAMP;
