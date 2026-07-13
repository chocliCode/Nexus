-- Migración 013: Añadir límites extra de cursos y mentores a perfil_aprendiz

ALTER TABLE perfil_aprendiz ADD COLUMN IF NOT EXISTS limite_cursos_extra INTEGER DEFAULT 0;
ALTER TABLE perfil_aprendiz ADD COLUMN IF NOT EXISTS limite_mentores_extra INTEGER DEFAULT 0;
