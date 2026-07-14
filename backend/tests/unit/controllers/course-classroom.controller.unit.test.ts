import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { 
  getCourseFeed, createCoursePost, deleteCoursePost, toggleCoursePin,
  addCourseComment, deleteCourseComment, getCourseStudents,
  submitAssignment, getAssignmentSubmissions, gradeSubmission,
  getCourseGrades, exportCourseGrades
} from '../../../src/controllers/course-classroom.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

jest.mock('../../../src/controllers/notification.controller', () => ({
  createNotification: jest.fn(),
}));

describe('Course Classroom Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'u1', email: 'u1@test.com', rol: 'Jedi' },
      body: {},
      params: {},
      file: undefined,
      files: []
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      send: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getCourseFeed', () => {
    it('retorna 403 si no tiene acceso', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // verifyCourseAccess
      await getCourseFeed(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('retorna posts si tiene acceso', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ post_id: 'p1' }] }); // posts
      await getCourseFeed(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ post_id: 'p1' }] });
    });
  });

  describe('createCoursePost', () => {
    it('retorna 400 si tipo invalido', async () => {
      mockReq.params = { courseId: 'c1' };
      mockReq.body = { tipo: 'invalid' };
      await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('crea el post', async () => {
      mockReq.params = { courseId: 'c1' };
      mockReq.body = { titulo: 't1', contenido: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ post_id: 'p1' }] }); // insert
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // students for notif
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ titulo: 'Curso' }] }); // course title

      await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('deleteCoursePost', () => {
    it('elimina el post', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ autor_id: 'u1', jedi_id: 'u1' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // delete
      await deleteCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('toggleCoursePin', () => {
    it('fija el post', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ post_id: 'p1', fijado: true }] }); // update
      await toggleCoursePin(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('addCourseComment', () => {
    it('agrega comentario', async () => {
      mockReq.params = { postId: 'p1' };
      mockReq.body = { contenido: 'test' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1', autor_id: 'u2' }] }); // postCheck
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ comentario_id: 'c1' }] }); // insert
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ nombre: 'A B' }] }); // commenterRes

      await addCourseComment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('deleteCourseComment', () => {
    it('elimina comentario', async () => {
      mockReq.params = { commentId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ autor_id: 'u1', jedi_id: 'u1' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // delete
      await deleteCourseComment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('getCourseStudents', () => {
    it('lista estudiantes', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ usuario_id: 's1' }] }); // query
      await getCourseStudents(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('submitAssignment', () => {
    it('envia tarea', async () => {
      mockReq.params = { postId: 'p1' };
      mockReq.file = { filename: 'test.pdf' } as any;
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1', tipo: 'tarea' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u2', is_student: true }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ entrega_id: 'e1' }] }); // insert
      await submitAssignment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getAssignmentSubmissions', () => {
    it('obtiene entregas', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1', tipo: 'tarea' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ entrega_id: 'e1' }] }); // list
      await getAssignmentSubmissions(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('gradeSubmission', () => {
    it('califica entrega', async () => {
      mockReq.params = { submissionId: 's1' };
      mockReq.body = { nota: 20 };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ entrega_id: 's1', nota: 20 }] }); // update
      await gradeSubmission(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getCourseGrades', () => {
    it('obtiene calificaciones', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ nota: 20 }] }); // query
      await getCourseGrades(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('exportCourseGrades', () => {
    it('exporta CSV', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ Tarea: 'T1', Estudiante: 'E1', Calificacion: 20 }] }); // query
      await exportCourseGrades(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.setHeader).toHaveBeenCalled();
      expect(mockRes.send).toHaveBeenCalled();
    });
  });
});
