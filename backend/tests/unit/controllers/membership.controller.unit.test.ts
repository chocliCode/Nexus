import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { listMemberships, updateMembership } from '../../../src/controllers/membership.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

describe('Membership Controller (Unit Tests)', () => {
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

  describe('listMemberships', () => {
    it('lista las membresias', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ membresia_id: 'm1' }] });
      await listMemberships(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: [{ membresia_id: 'm1' }] });
    });
  });

  describe('updateMembership', () => {
    it('retorna 403 si no es Padawan', async () => {
      mockReq.body = { membresia_id: 'm2' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ rol: 'Jedi' }] });
      await updateMembership(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    it('retorna 404 si membresia no existe', async () => {
      mockReq.body = { membresia_id: 'm2' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ rol: 'Padawan' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await updateMembership(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('actualiza la membresia con exito', async () => {
      mockReq.body = { membresia_id: 'm2' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ rol: 'Padawan' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ membresia_id: 'm2' }] });
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ membresia_id: 'm2', usuario_id: 'u1' }] });
      await updateMembership(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
