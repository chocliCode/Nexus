import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { submitAssignment } from '../../../src/controllers/course-classroom.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

describe('Course Classroom Controller - Submit Assignment PDF (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'padawan123', email: 'padawan@nexus.test', rol: 'Padawan' },
      params: { postId: 'post-123' },
      file: { 
        filename: 'solucion.pdf',
        path: '/tmp/uploads/solucion.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024 * 2
      } as Express.Multer.File,
      body: { notas: 'Mi solucion final' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('UNIT-PDF-01: Procesa el archivo y guarda en DB con status 201', async () => {
    // Simular que Padawan está en el curso (query 1)
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ activo: true }] });
    // Simular que el Post existe y es tipo TAREA (query 2)
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ tipo: 'TAREA' }] });
    // Simular Insercion (query 3)
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ entrega_id: 'entrega-1' }] });

    await submitAssignment(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(pool.query).toHaveBeenCalledTimes(3);
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });

  it('UNIT-PDF-02: Rechaza con 400 si req.file viene nulo', async () => {
    mockReq.file = undefined;

    await submitAssignment(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'El archivo es requerido' })
    );
  });

  it('UNIT-PDF-03: No colapsa si falla la base de datos (pasa al Next)', async () => {
    // Simular error de DB en el primer query
    const dbError = new Error('Constraint Violation');
    (pool.query as jest.Mock).mockRejectedValueOnce(dbError);

    await submitAssignment(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(dbError);
  });
});
