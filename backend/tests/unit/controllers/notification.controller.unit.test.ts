import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, streamNotifications } from '../../../src/controllers/notification.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

jest.mock('../../../src/sse/manager', () => ({
  sendEvent: jest.fn(),
  addClient: jest.fn(),
  removeClient: jest.fn(),
  broadcastToRole: jest.fn(),
}));

describe('Notification Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'u1', email: 'test@test.com', rol: 'Padawan' },
      body: {},
      params: {},
      on: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn()
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('lista notificaciones', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ notificacion_id: 'n1' }] });
      await getNotifications(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('getUnreadCount', () => {
    it('obtiene conteo', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ total: '5' }] });
      await getUnreadCount(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith({ success: true, data: { unread: 5 } });
    });
  });

  describe('markAsRead', () => {
    it('retorna 404 si no existe', async () => {
      mockReq.params = { notificationId: 'n1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await markAsRead(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('marca como leida', async () => {
      mockReq.params = { notificationId: 'n1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ notificacion_id: 'n1', leida: true }] });
      await markAsRead(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('marca todas como leidas', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await markAllAsRead(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('streamNotifications', () => {
    it('inicia sse stream', () => {
      streamNotifications(mockReq as AuthRequest, mockRes as Response);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
      expect(mockRes.write).toHaveBeenCalledWith(': heartbeat\n\n');
    });

    it('retorna 401 si no autenticado', () => {
      mockReq.user = undefined;
      streamNotifications(mockReq as AuthRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
