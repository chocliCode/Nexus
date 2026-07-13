import { Response, NextFunction } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../types';

import { sendEvent, addClient, removeClient, broadcastToRole } from '../sse/manager';

/**
 * Internal helper — creates a notification row for a given user.
 * Import and call this from any controller that triggers an event.
 */
export const createNotification = async (
  userId: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  referenciaId?: string,
  referenciaTipo?: string
): Promise<void> => {
  try {
    const result = await pool.query(
      `INSERT INTO notificacion (usuario_id, tipo, titulo, mensaje, referencia_id, referencia_tipo)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, tipo, titulo, mensaje, referenciaId || null, referenciaTipo || null]
    );
    
    // Notify connected clients immediately
    sendEvent(userId, 'NEW_NOTIFICATION', result.rows[0]);
  } catch {
    // Notifications are non-critical — never let them break the main flow
  }
};

/**
 * Creates a notification for all users of a specific role.
 */
export const createNotificationForRole = async (
  rol: string,
  tipo: string,
  titulo: string,
  mensaje: string,
  referenciaId?: string,
  referenciaTipo?: string
): Promise<void> => {
  try {
    // Insert for all users matching the role
    await pool.query(
      `INSERT INTO notificacion (usuario_id, tipo, titulo, mensaje, referencia_id, referencia_tipo)
       SELECT usuario_id, $2, $3, $4, $5, $6
       FROM usuario WHERE rol = $1
       RETURNING *`,
      [rol, tipo, titulo, mensaje, referenciaId || null, referenciaTipo || null]
    );
    
    // We broadcast a general event to the role, the frontend might refetch or handle it
    broadcastToRole(rol, 'NEW_NOTIFICATION_ROLE', { tipo, titulo, mensaje, referenciaId, referenciaTipo });
  } catch {
    // Non-critical
  }
};

/**
 * GET /api/v1/notifications/stream
 * SSE endpoint for live notifications
 */
export const streamNotifications = (req: AuthRequest, res: Response): void => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  addClient(userId, res);

  // Send an initial heartbeat
  res.write(': heartbeat\n\n');

  // Keep connection alive with a periodic comment
  const interval = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 15000);

  req.on('close', () => {
    clearInterval(interval);
    removeClient(userId, res);
  });
};

/**
 * UC-26: Recibir notificaciones
 * GET /api/v1/notifications
 */
export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT * FROM notificacion
       WHERE usuario_id = $1
       ORDER BY fecha_creacion DESC
       LIMIT 50`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/notifications/unread-count
 */
export const getUnreadCount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) as total FROM notificacion WHERE usuario_id = $1 AND leida = false`,
      [req.user?.userId]
    );
    res.json({ success: true, data: { unread: parseInt(result.rows[0].total) } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/notifications/:notificationId/read
 */
export const markAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { notificationId } = req.params;
  try {
    const result = await pool.query(
      `UPDATE notificacion SET leida = true WHERE notificacion_id = $1 AND usuario_id = $2 RETURNING *`,
      [notificationId, req.user?.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Notificación no encontrada', code: 'NOT_FOUND' });
      return;
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/notifications/read-all
 */
export const markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await pool.query(
      `UPDATE notificacion SET leida = true WHERE usuario_id = $1 AND leida = false`,
      [req.user?.userId]
    );
    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    next(err);
  }
};
