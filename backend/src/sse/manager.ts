/**
 * SSE Manager — Server-Sent Events para notificaciones en tiempo real.
 *
 * Mantiene un Map de userId → Response[] (un usuario puede tener
 * varias pestañas abiertas). Cuando se crea una notificación,
 * se envía inmediatamente a todas las conexiones activas de ese usuario.
 */
import { Response } from 'express';

interface SSEClient {
  res: Response;
  userId: string;
}

const clients: Map<string, SSEClient[]> = new Map();

/**
 * Registra una conexión SSE para un usuario.
 */
export function addClient(userId: string, res: Response): void {
  const existing = clients.get(userId) || [];
  existing.push({ res, userId });
  clients.set(userId, existing);

  console.log(`[SSE] Client connected: ${userId} (${existing.length} active)`);
}

/**
 * Elimina una conexión SSE cuando el cliente se desconecta.
 */
export function removeClient(userId: string, res: Response): void {
  const existing = clients.get(userId) || [];
  const filtered = existing.filter(c => c.res !== res);
  if (filtered.length === 0) {
    clients.delete(userId);
  } else {
    clients.set(userId, filtered);
  }
  console.log(`[SSE] Client disconnected: ${userId} (${filtered.length} remaining)`);
}

/**
 * Envía un evento SSE a todas las conexiones activas de un usuario.
 */
export function sendEvent(userId: string, event: string, data: unknown): void {
  const userClients = clients.get(userId);
  if (!userClients || userClients.length === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const client of userClients) {
    try {
      client.res.write(payload);
    } catch {
      // Connection might be dead — will be cleaned up on 'close'
    }
  }
}

/**
 * Envía un evento a TODOS los usuarios conectados que tengan un rol específico.
 * Útil para "notificar a todos los Padawans" sin iterar la DB.
 */
export function broadcastToRole(_role: string, event: string, data: unknown): void {
  // No tenemos el rol almacenado en el client map, así que hacemos broadcast a todos.
  // El frontend filtra según el tipo de evento.
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const [, userClients] of clients) {
    for (const client of userClients) {
      try {
        client.res.write(payload);
      } catch { /* dead connection */ }
    }
  }
}

export function getConnectedCount(): number {
  let count = 0;
  for (const [, userClients] of clients) {
    count += userClients.length;
  }
  return count;
}
