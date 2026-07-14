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

  describe('verifyCourseAccess logic (implicit in all methods)', () => {
    it('retorna allowed=false si el query esta vacio', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // verifyCourseAccess
      await getCourseFeed(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
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

    it('retorna 400 si es tarea y no tiene fecha de vencimiento', async () => {
      mockReq.params = { courseId: 'c1' };
      mockReq.body = { tipo: 'tarea' };
      await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('retorna 400 si contenido tiene script', async () => {
      mockReq.params = { courseId: 'c1' };
      mockReq.body = { contenido: '<script>alert(1)</script>' };
      await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('retorna 403 si no tiene acceso o no es Jedi', async () => {
      mockReq.params = { courseId: 'c1' };
      mockReq.body = { titulo: 't1', contenido: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u2', is_student: true }] }); // verify
      await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('crea el post y envia notificaciones si es Jedi', async () => {
      mockReq.params = { courseId: 'c1' };
      mockReq.body = { titulo: 't1', contenido: 'c1' };
      mockReq.files = [{ filename: 'f1', originalname: 'o1', mimetype: 'm1' } as any];
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ post_id: 'p1' }] }); // insert
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ padawan_id: 'p1' }] }); // students
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ titulo: 'Curso' }] }); // title
      
      await createCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('deleteCoursePost', () => {
    it('retorna 404 si post no existe', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // check
      await deleteCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 403 si no es autor ni Jedi', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ autor_id: 'u2', jedi_id: 'u3' }] });
      await deleteCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('elimina el post', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ autor_id: 'u1', jedi_id: 'u1' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // delete
      await deleteCoursePost(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true });
    });
  });

  describe('toggleCoursePin', () => {
    it('retorna 404 si no existe', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // check
      await toggleCoursePin(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 403 si no es Jedi', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u2' }] });
      await toggleCoursePin(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('fija el post', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ post_id: 'p1', fijado: true }] }); // update
      await toggleCoursePin(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('addCourseComment', () => {
    it('retorna 400 si no hay contenido', async () => {
      mockReq.params = { postId: 'p1' };
      await addCourseComment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 si post no encontrado', async () => {
      mockReq.params = { postId: 'p1' };
      mockReq.body = { contenido: 'test' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await addCourseComment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 403 si no tiene acceso al curso', async () => {
      mockReq.params = { postId: 'p1' };
      mockReq.body = { contenido: 'test' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // verify => false
      await addCourseComment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('agrega comentario y notifica al autor', async () => {
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
    it('retorna 404 si no encontrado', async () => {
      mockReq.params = { commentId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await deleteCourseComment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 403 si no es autor o jedi', async () => {
      mockReq.params = { commentId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ autor_id: 'u2', jedi_id: 'u3' }] });
      await deleteCourseComment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('submitAssignment', () => {
    it('retorna 400 si no hay archivo', async () => {
      mockReq.params = { postId: 'p1' };
      await submitAssignment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 si post no existe', async () => {
      mockReq.params = { postId: 'p1' };
      mockReq.file = { filename: 'test.pdf' } as any;
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await submitAssignment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 400 si no es tarea', async () => {
      mockReq.params = { postId: 'p1' };
      mockReq.file = { filename: 'test.pdf' } as any;
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ tipo: 'anuncio' }] });
      await submitAssignment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('retorna 403 si el que envia no es un Padawan inscrito', async () => {
      mockReq.params = { postId: 'p1' };
      mockReq.file = { filename: 'test.pdf' } as any;
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1', tipo: 'tarea' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // es el jedi
      await submitAssignment(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('envia tarea con exito', async () => {
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
    it('retorna 404 si post no existe', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await getAssignmentSubmissions(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 400 si no es tarea', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ tipo: 'anuncio' }] });
      await getAssignmentSubmissions(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('retorna 403 si no tiene acceso', async () => {
      mockReq.params = { postId: 'p1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ curso_id: 'c1', tipo: 'tarea' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await getAssignmentSubmissions(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('gradeSubmission', () => {
    it('retorna 404 si no existe', async () => {
      mockReq.params = { submissionId: 's1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await gradeSubmission(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 403 si no es Jedi', async () => {
      mockReq.params = { submissionId: 's1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u2' }] });
      await gradeSubmission(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });

  describe('exportCourseGrades', () => {
    it('retorna 403 si no tiene acceso', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await exportCourseGrades(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('retorna 403 si no es Jedi', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u2', is_student: true }] });
      await exportCourseGrades(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('exporta notas lidiando con CSV escape', async () => {
      mockReq.params = { courseId: 'c1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ jedi_id: 'u1', is_student: false }] }); // verify
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ Tarea: '=cmd|', Estudiante: 'E1', Calificacion: null, Feedback: null }] }); // query
      await exportCourseGrades(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.setHeader).toHaveBeenCalled();
      expect(mockRes.send).toHaveBeenCalled();
    });
  });
});
