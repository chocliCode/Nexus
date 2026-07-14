import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { 
  getNotifications, getUnreadCount, markAsRead, markAllAsRead, streamNotifications,
  createNotification, createNotificationForRole 
} from '../../../src/controllers/notification.controller';
import { AuthRequest } from '../../../src/types';
import * as sseManager from '../../../src/sse/manager';

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

  describe('createNotification', () => {
    it('crea notificacion y envia evento sse', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ notificacion_id: 'n1' }] });
      await createNotification('u1', 'tipo', 'titulo', 'mensaje');
      expect(pool.query).toHaveBeenCalled();
      expect(sseManager.sendEvent).toHaveBeenCalledWith('u1', 'NEW_NOTIFICATION', { notificacion_id: 'n1' });
    });

    it('maneja errores silenciosamente', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      await expect(createNotification('u1', 'tipo', 'titulo', 'mensaje')).resolves.not.toThrow();
    });
  });

  describe('createNotificationForRole', () => {
    it('crea notificacion para rol y envia broadcast', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ notificacion_id: 'n1' }] });
      await createNotificationForRole('Jedi', 'tipo', 'titulo', 'mensaje');
      expect(pool.query).toHaveBeenCalled();
      expect(sseManager.broadcastToRole).toHaveBeenCalled();
    });

    it('maneja errores silenciosamente', async () => {
      (pool.query as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
      await expect(createNotificationForRole('Jedi', 'tipo', 'titulo', 'mensaje')).resolves.not.toThrow();
    });
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
      
      // Simulate close
      const onCall = (mockReq.on as jest.Mock).mock.calls[0];
      expect(onCall[0]).toBe('close');
      onCall[1]();
      expect(sseManager.removeClient).toHaveBeenCalledWith('u1', mockRes);
    });

    it('retorna 401 si no autenticado', () => {
      mockReq.user = undefined;
      streamNotifications(mockReq as AuthRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });
  });
});
