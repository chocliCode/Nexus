import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { createCourse } from '../../../src/controllers/course.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

describe('Course Controller - Create Course (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'jedi123', email: 'jedi@nexus.test', rol: 'Jedi' },
      body: {
        titulo: 'Curso de Testing',
        descripcion: 'Aprende a testear',
        categoria: 'Desarrollo',
        max_estudiantes: 20
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('UNIT-CRS-01: retorna 201 y el curso creado al insertar correctamente', async () => {
    const mockDbResponse = {
      rows: [{
        curso_id: 'curso1',
        jedi_id: 'jedi123',
        titulo: 'Curso de Testing',
        descripcion: 'Aprende a testear',
        categoria: 'Desarrollo',
        max_estudiantes: 20
      }]
    };
    (pool.query as jest.Mock).mockResolvedValueOnce(mockDbResponse);

    await createCourse(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO curso'),
      ['jedi123', 'Curso de Testing', 'Aprende a testear', 'Desarrollo', 20]
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: mockDbResponse.rows[0] });
  });

  it('UNIT-CRS-02: invoca next con error si la BD falla', async () => {
    const errorBD = new Error('DB Connection Failed');
    (pool.query as jest.Mock).mockRejectedValueOnce(errorBD);

    await createCourse(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(errorBD);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('UNIT-CRS-03: aplica valores por defecto para campos opcionales si vienen vacios', async () => {
    mockReq.body = { titulo: 'Curso Minimalista' }; // Sin descripcion, categoria o max_estudiantes

    const mockDbResponse = {
      rows: [{ titulo: 'Curso Minimalista', max_estudiantes: 30 }]
    };
    (pool.query as jest.Mock).mockResolvedValueOnce(mockDbResponse);

    await createCourse(mockReq as AuthRequest, mockRes as Response, mockNext);

    // Debe asignar null a descripcion y categoria, y 30 a max_estudiantes
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO curso'),
      ['jedi123', 'Curso Minimalista', null, null, 30]
    );
    expect(mockRes.status).toHaveBeenCalledWith(201);
  });
});
