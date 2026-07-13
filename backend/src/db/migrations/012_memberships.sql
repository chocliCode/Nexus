-- NEXUS — Migration 012: Memberships
-- Adds the membership system and assigns it to padawans

CREATE TABLE membresia (
  membresia_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) NOT NULL,
  limite_mentores INT NOT NULL,
  limite_cursos INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  caracteristicas JSONB
);

-- Insert default memberships
INSERT INTO membresia (nombre, limite_mentores, limite_cursos, precio, caracteristicas) VALUES
('Padawan Iniciado', 0, 1, 0.00, '["1 Curso activo", "Acceso a la comunidad"]'::jsonb),
('Padawan Explorer', 0, 5, 5.00, '["5 Cursos simultáneos", "Soporte comunitario"]'::jsonb),
('Caballero Jedi', 1, 10, 10.00, '["10 Cursos simultáneos", "1 Mentor activo", "Soporte prioritario"]'::jsonb),
('Maestro del Consejo', 2, 20, 20.00, '["20 Cursos simultáneos", "2 Mentores activos", "Soporte 24/7", "Insignia VIP"]'::jsonb);

-- Add membership to padawan
ALTER TABLE perfil_aprendiz ADD COLUMN membresia_id UUID REFERENCES membresia(membresia_id);

-- Set default membership to Padawan Iniciado for existing and future rows
DO $$
DECLARE
    basico_id UUID;
BEGIN
    SELECT membresia_id INTO basico_id FROM membresia WHERE nombre = 'Padawan Iniciado';
    UPDATE perfil_aprendiz SET membresia_id = basico_id WHERE membresia_id IS NULL;
    
    -- Alter table to set default for new rows
    EXECUTE 'ALTER TABLE perfil_aprendiz ALTER COLUMN membresia_id SET DEFAULT ''' || basico_id || '''';
END $$;
