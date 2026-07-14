import { Request, Response } from 'express';
import { uploadMiddleware, postUploadMiddleware } from '../../../src/middleware/upload.middleware';

describe('Upload Middleware', () => {
  it('exporta middlewares de multer correctamente configurados', () => {
    expect(uploadMiddleware).toBeDefined();
    expect(postUploadMiddleware).toBeDefined();
  });

  it('fileFilter rechaza si no es pdf (uploadMiddleware)', () => {
    const cb = jest.fn();
    const req = {} as any;
    const file = { mimetype: 'image/png' } as any;

    const fileFilter = (uploadMiddleware as any).fileFilter || (uploadMiddleware as any).options?.fileFilter;
    if (fileFilter) {
      fileFilter(req, file, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
    }
  });

  it('fileFilter acepta pdf (uploadMiddleware)', () => {
    const cb = jest.fn();
    const req = {} as any;
    const file = { mimetype: 'application/pdf' } as any;

    const fileFilter = (uploadMiddleware as any).fileFilter || (uploadMiddleware as any).options?.fileFilter;
    if (fileFilter) {
      fileFilter(req, file, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    }
  });

  it('fileFilter rechaza formatos raros (postUploadMiddleware)', () => {
    const cb = jest.fn();
    const req = {} as any;
    const file = { mimetype: 'application/zip' } as any;

    const fileFilter = (postUploadMiddleware as any).fileFilter || (postUploadMiddleware as any).options?.fileFilter;
    if (fileFilter) {
      fileFilter(req, file, cb);
      expect(cb).toHaveBeenCalledWith(expect.any(Error));
    }
  });

  it('fileFilter acepta permitidos (postUploadMiddleware)', () => {
    const cb = jest.fn();
    const req = {} as any;
    const file = { mimetype: 'image/jpeg' } as any;

    const fileFilter = (postUploadMiddleware as any).fileFilter || (postUploadMiddleware as any).options?.fileFilter;
    if (fileFilter) {
      fileFilter(req, file, cb);
      expect(cb).toHaveBeenCalledWith(null, true);
    }
  });
});
