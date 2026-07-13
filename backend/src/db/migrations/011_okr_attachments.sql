-- NEXUS — Migration 011: OKR Attachments
-- Adds support for uploading files, images and links in OKR (tasks) submissions
ALTER TABLE okr ADD COLUMN url_enlace VARCHAR(255);
ALTER TABLE okr ADD COLUMN archivos JSONB DEFAULT '[]'::jsonb;
