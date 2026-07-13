-- NEXUS — Migration 009: Attachments for Mentor Sessions
-- Adds support for uploading files and images in mentoring sessions
ALTER TABLE sesion_mentoria ADD COLUMN archivos JSONB DEFAULT '[]'::jsonb;
