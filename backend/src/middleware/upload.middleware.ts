import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const assignmentsDir = path.join(__dirname, '../../uploads/assignments');
if (!fs.existsSync(assignmentsDir)) fs.mkdirSync(assignmentsDir, { recursive: true });

const postsDir = path.join(__dirname, '../../uploads/posts');
if (!fs.existsSync(postsDir)) fs.mkdirSync(postsDir, { recursive: true });

const assignmentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, assignmentsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).readUInt32LE(0);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const postStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, postsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(4).readUInt32LE(0);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadMiddleware = multer({
  storage: assignmentStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF'));
  },
});

export const postUploadMiddleware = multer({
  storage: postStorage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    // Permitir PDFs, documentos (doc, docx) e imágenes (jpg, png, gif)
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido. Sube imágenes, PDF o Word.'));
  },
});
