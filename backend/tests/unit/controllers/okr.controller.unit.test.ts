import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { createOKR, listOKRs, updateOKR, deleteOKR, completeOKR, feedbackOKR } from '../../../src/controllers/okr.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
  connect: jest.fn().mockResolvedValue({
    query: jest.fn(),
    release: jest.fn(),
  }),
}));

jest.mock('../../../src/controllers/notification.controller', () => ({
  createNotification: jest.fn(),
}));

describe('OKR Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'u1', email: 'test@test.com', rol: 'Jedi' },
      body: {},
      params: {},
      files: []
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createOKR', () => {
    it('retorna 404 si sesion no existe', async () => {
      mockReq.params = { sesionId: 's1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await createOKR(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('crea OKR y notifica', async () => {
      mockReq.params = { sesionId: 's1' };
      mockReq.body = { descripcion: 'Aprender Jest', valor_meta: 100 };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sesion_id: 's1' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ okr_id: 'o1' }] }); // insert
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ usuario_id: 'p1' }] }); // notify padawan
      await createOKR(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('listOKRs', () => {
    it('lista OKRs', async () => {
      mockReq.params = { sesionId: 's1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ okr_id: 'o1' }] });
      await listOKRs(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('updateOKR', () => {
    it('retorna 400 si no hay campos', async () => {
      mockReq.params = { okrId: 'o1' };
      mockReq.body = {};
      await updateOKR(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('actualiza OKR', async () => {
      mockReq.params = { okrId: 'o1' };
      mockReq.body = { estado: 'EnProgreso' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ okr_id: 'o1' }] }); // update
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ usuario_id: 'j1' }] }); // notify
      await updateOKR(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('deleteOKR', () => {
    it('cancela OKR', async () => {
      mockReq.params = { okrId: 'o1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ okr_id: 'o1' }] });
      await deleteOKR(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('completeOKR', () => {
    it('retorna 404 si OKR no encontrado', async () => {
      mockReq.params = { okrId: 'o1' };
      const mockClient = await pool.connect();
      (mockClient.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // check
      await completeOKR(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('feedbackOKR', () => {
    it('retorna 403 si no es Jedi', async () => {
      mockReq.user!.rol = 'Padawan';
      await feedbackOKR(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('retorna 400 si accion es invalida', async () => {
      mockReq.body = { accion: 'invalid' };
      await feedbackOKR(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });
});
