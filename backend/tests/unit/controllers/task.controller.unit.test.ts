import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { createCoursePost } from '../../../src/controllers/course-classroom.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

describe('Course Classroom Controller - Create Task (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'jedi123', email: 'jedi@nexus.test', rol: 'Jedi' },
      params: { courseId: 'curso1' },
      body: {
        contenido: 'Resolver la guia de React',
        tipo: 'TAREA',
        fecha_vencimiento: '2027-12-31'
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('UNIT-TSK-01: retorna 201 y publica la tarea correctamente', async () => {
    // 1. Simular verificacion de rol (Jedi dueño del curso)
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'jedi123' }] });
    
    // 2. Simular Insercion del Post
    (pool.query as jest.Mock).mockResolvedValueOnce({ 
      rows: [{
        publicacion_id: 'post1',
        contenido: 'Resolver la guia de React',
        tipo: 'TAREA',
        fecha_vencimiento: '2027-12-31'
      }] 
    });

    // 3. Simular query de notificaciones (estudiantes inscritos)
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    // 4. Simular query para titulo del curso
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ titulo: 'Curso de Prueba' }] });

    await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(201);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.any(Object) })
    );
  });

  it('UNIT-TSK-02: rechaza con 400 si la fecha de vencimiento falta en tipo TAREA', async () => {
    mockReq.body.fecha_vencimiento = undefined; // Falta la fecha

    await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Las tareas deben tener una fecha de vencimiento',
      code: 'VALIDATION_ERROR'
    });
  });

  it('UNIT-TSK-03: rechaza con 403 si el Jedi no es dueño del curso', async () => {
    // El owner del curso es otro Jedi, simulamos que está inscrito para que pase el primer filtro
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'otherJedi', is_student: true }] });

    await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Solo los profesores pueden publicar en el curso',
      code: 'FORBIDDEN'
    });
  });
});
