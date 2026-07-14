import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { getMyMatchings, generateMatching, respondMatching, listMentors, requestMentor } from '../../../src/controllers/matching.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

describe('Matching Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'u1', rol: 'Padawan', email: 'test@test.com' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getMyMatchings', () => {
    it('retorna 401 si no esta autenticado', async () => {
      mockReq.user = undefined;
      await getMyMatchings(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('ejecuta query para Padawan', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ matching_id: 'm1' }] });
      await getMyMatchings(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ matching_id: 'm1' }] });
    });

    it('ejecuta query para Jedi', async () => {
      mockReq.user!.rol = 'Jedi';
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ matching_id: 'm2' }] });
      await getMyMatchings(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(pool.query).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ matching_id: 'm2' }] });
    });

    it('llama next en caso de error', async () => {
      const error = new Error('DB Error');
      (pool.query as jest.Mock).mockRejectedValueOnce(error);
      await getMyMatchings(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('generateMatching', () => {
    it('retorna 401 si no autenticado', async () => {
      mockReq.user = undefined;
      await generateMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('retorna 403 si no es Padawan', async () => {
      mockReq.user!.rol = 'Jedi';
      await generateMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('retorna 404 si perfil no encontrado', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // Perfil
      await generateMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 409 si supera el limite', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ perfil_id: 'p1' }] }); // Perfil
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ limite_mentores: 1 }] }); // Limites
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ matching_id: 'm1' }] }); // Existentes
      await generateMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('retorna 404 si no hay mentores disponibles', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ perfil_id: 'p1' }] }); // Perfil
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ limite_mentores: 1 }] }); // Limites
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // Existentes
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ habilidad_id: 'h1' }] }); // Skills
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // Mentors
      await generateMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('genera matching con exito', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ perfil_id: 'p1' }] }); // Perfil
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ limite_mentores: 1 }] }); // Limites
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // Existentes
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ habilidad_id: 'h1' }] }); // Skills
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ mentor_id: 'mt1', calificacion_promedio: 5, anios_experiencia: 5, nombres: 'A', apellidos: 'B' }] }); // Mentors
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ matching_id: 'm_new' }] }); // Insert

      await generateMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('respondMatching', () => {
    it('retorna 401 si no autenticado', async () => {
      mockReq.user = undefined;
      await respondMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('retorna 403 si no es Jedi', async () => {
      await respondMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('retorna 400 si accion es invalida', async () => {
      mockReq.user!.rol = 'Jedi';
      mockReq.params = { matchingId: '1' };
      mockReq.body = { accion: 'invalid' };
      await respondMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('actualiza el matching', async () => {
      mockReq.user!.rol = 'Jedi';
      mockReq.params = { matchingId: '1' };
      mockReq.body = { accion: 'aceptar' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ matching_id: '1' }] }); // Check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ matching_id: '1', estado: 'Activo' }] }); // Update

      await respondMatching(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('listMentors', () => {
    it('retorna mentores', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ mentor_id: '1' }] });
      await listMentors(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ mentor_id: '1' }] });
    });
  });

  describe('requestMentor', () => {
    it('solicita mentor con exito', async () => {
      mockReq.params = { mentorId: 'mt1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ perfil_id: 'p1' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ limite_mentores: 1, limite_mentores_extra: 0 }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ mentor_id: 'mt1' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ matching_id: '1' }] });

      await requestMentor(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });
});
