import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { createSession, listSessions, updateSession, deleteSession, getMySessions } from '../../../src/controllers/session.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

jest.mock('../../../src/controllers/notification.controller', () => ({
  createNotification: jest.fn(),
}));

describe('Session Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'u1', rol: 'Jedi', email: 'test@test.com' },
      params: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('retorna 404 si matching no existe', async () => {
      mockReq.params = { matchingId: 'm1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await createSession(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('crea sesion con exito', async () => {
      mockReq.params = { matchingId: 'm1' };
      mockReq.body = { titulo: 'Sesion 1', fecha_sesion: '2025-01-01', duracion_min: 60 };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ matching_id: 'm1', padawan_usuario_id: 'p1' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sesion_id: 's1', titulo: 'Sesion 1' }] });

      await createSession(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('listSessions', () => {
    it('retorna sesiones', async () => {
      mockReq.params = { matchingId: 'm1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sesion_id: 's1' }] });
      await listSessions(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ sesion_id: 's1' }] });
    });
  });

  describe('updateSession', () => {
    it('retorna 400 si no hay campos', async () => {
      mockReq.params = { sesionId: 's1' };
      mockReq.body = {};
      await updateSession(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('actualiza sesion y lanza notificacion si es cancelada', async () => {
      mockReq.params = { sesionId: 's1' };
      mockReq.body = { estado: 'Cancelada', titulo: 'Sesion' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sesion_id: 's1', titulo: 'Sesion' }] }); // update
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ padawan_uid: 'p1', jedi_uid: 'u1' }] }); // partRes

      await updateSession(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('deleteSession', () => {
    it('cancela sesion (soft delete)', async () => {
      mockReq.params = { sesionId: 's1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sesion_id: 's1', titulo: 'Sesion 1' }] }); // update
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ padawan_uid: 'p1', jedi_uid: 'u1' }] }); // partRes

      await deleteSession(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('getMySessions', () => {
    it('retorna mis sesiones', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sesion_id: 's1' }] });
      await getMySessions(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ sesion_id: 's1' }] });
    });
  });
});
