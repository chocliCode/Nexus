import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { 
  createCourse, listCourses, getMyCourses, getCourseDetail, 
  openCourse, closeCourse, joinCourse, leaveCourse 
} from '../../../src/controllers/course.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

jest.mock('../../../src/controllers/notification.controller', () => ({
  createNotification: jest.fn(),
}));

describe('Course Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'jedi123', email: 'jedi@nexus.test', rol: 'Jedi' },
      body: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createCourse', () => {
    it('retorna 400 si titulo no existe', async () => {
      await createCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('crea el curso', async () => {
      mockReq.body = { titulo: 'Curso 1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1' }] });
      await createCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('listCourses', () => {
    it('lista los cursos abiertos', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1' }] });
      await listCourses(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ curso_id: 'c1' }] });
    });
  });

  describe('getMyCourses', () => {
    it('obtiene mis cursos como Jedi', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1' }] });
      await getMyCourses(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ curso_id: 'c1' }] });
    });

    it('obtiene mis cursos como Padawan', async () => {
      mockReq.user!.rol = 'Padawan';
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c2' }] });
      await getMyCourses(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ curso_id: 'c2' }] });
    });
  });

  describe('getCourseDetail', () => {
    it('retorna 404 si curso no existe', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await getCourseDetail(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna el curso y estudiantes', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1' }] }); // course
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ usuario_id: 'p1' }] }); // students
      await getCourseDetail(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { curso_id: 'c1', estudiantes: [{ usuario_id: 'p1' }] } });
    });
  });

  describe('openCourse', () => {
    it('retorna 404 si no existe o no tiene permiso', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await openCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('abre el curso y notifica', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ usuario_id: 'p1' }] }); // padawans to notify
      await openCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('closeCourse', () => {
    it('cierra el curso', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1' }] });
      await closeCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('joinCourse', () => {
    it('retorna 404 si no existe', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await joinCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 400 si curso esta cerrado', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ estado: 'Cerrado' }] });
      await joinCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('retorna 403 si limite de cursos es excedido', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ estado: 'Abierto', max_estudiantes: 10 }] }); // curso
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ limite_cursos: 1, limite_cursos_extra: 0 }] }); // limits
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ total: '2' }] }); // current courses
      await joinCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('retorna 400 si esta lleno', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ estado: 'Abierto', max_estudiantes: 10 }] }); // curso
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ limite_cursos: 2, limite_cursos_extra: 0 }] }); // limits
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ total: '1' }] }); // current courses
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ total: '10' }] }); // current capacity
      await joinCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('inscribe con exito', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ estado: 'Abierto', max_estudiantes: 10 }] }); // curso
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ limite_cursos: 2, limite_cursos_extra: 0 }] }); // limits
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ total: '1' }] }); // current courses
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ total: '5' }] }); // current capacity
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1', padawan_id: 'u1' }] }); // insert
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ nombre_completo: 'Padawan Test' }] }); // user name
      await joinCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('leaveCourse', () => {
    it('abandona el curso con exito', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await leaveCourse(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
