-- NEXUS — Migration 008: Add JSONB array for multiple files
ALTER TABLE curso_post ADD COLUMN archivos JSONB DEFAULT '[]'::jsonb;
