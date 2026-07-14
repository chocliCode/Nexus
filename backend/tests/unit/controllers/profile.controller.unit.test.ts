import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { getMyProfile, updateMyProfile, listSkills, buyExtra, addSkill, removeSkill, getUserProfile } from '../../../src/controllers/profile.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  }),
}));

describe('Profile Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'u1', email: 'test@test.com', rol: 'Padawan' },
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

  describe('getMyProfile', () => {
    it('retorna 404 si usuario no existe', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await getMyProfile(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna perfil con habilidades', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ perfil_id: 'p1' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ habilidad_id: 'h1' }] });
      await getMyProfile(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('updateMyProfile', () => {
    it('actualiza perfil exitosamente', async () => {
      mockReq.body = { nombres: 'N', apellidos: 'A', resumen_bio: 'bio' };
      const mockClient = await pool.connect();
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ usuario_id: 'u1' }] });
      await updateMyProfile(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('listSkills', () => {
    it('lista habilidades', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ habilidad_id: 'h1' }] });
      await listSkills(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('buyExtra', () => {
    it('retorna 403 si no es Padawan', async () => {
      mockReq.user!.rol = 'Jedi';
      await buyExtra(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('retorna 400 si payload es invalido', async () => {
      mockReq.body = { type: 'invalid' };
      await buyExtra(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('compra limite extra', async () => {
      mockReq.body = { type: 'curso', amount: 1 };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ limite_cursos_extra: 1 }] });
      await buyExtra(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('addSkill', () => {
    it('agrega habilidad con exito', async () => {
      mockReq.body = { habilidad_id: 'h1', nivel: 'Basico' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ perfil_id: 'p1' }] }); // perfil
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // insert
      await addSkill(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('removeSkill', () => {
    it('remueve habilidad con exito', async () => {
      mockReq.params = { habilidadId: 'h1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ perfil_id: 'p1' }] }); // perfil
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // delete
      await removeSkill(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('getUserProfile', () => {
    it('obtiene perfil publico', async () => {
      mockReq.params = { userId: 'u2' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ rol: 'Padawan' }] }); // perfil
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ habilidad_id: 'h1' }] }); // skills
      await getUserProfile(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
