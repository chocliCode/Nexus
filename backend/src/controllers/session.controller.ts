import { Response, NextFunction } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../types';
import { createNotification } from './notification.controller';

/**
 * POST /api/v1/matchings/:matchingId/sessions
 * Create a new mentoring session for a matching.
 */
export const createSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { matchingId } = req.params;
  const { titulo, fecha_sesion, duracion_min, notas } = req.body;
  const files = req.files as Express.Multer.File[];

  try {
    // Verify matching exists and user is the Mentor in it (Padawans cannot create sessions)
    const matchCheck = await pool.query(
      `SELECT m.matching_id, pa.usuario_id AS padawan_usuario_id
       FROM matching m
       JOIN mentor mt ON m.mentor_id = mt.mentor_id
       JOIN perfil_aprendiz pa ON m.padawan_id = pa.perfil_id
       WHERE m.matching_id = $1
         AND m.estado = 'Activo'
         AND mt.usuario_id = $2`,
      [matchingId, req.user?.userId]
    );

    if (matchCheck.rows.length === 0) {
      res.status(404).json({ error: 'Matching no encontrado o no autorizado', code: 'MATCHING_NOT_FOUND' });
      return;
    }
    const padawanUserId = matchCheck.rows[0].padawan_usuario_id;

    let archivosData: any[] = [];
    if (files && files.length > 0) {
      archivosData = files.map(file => ({
        url: `/uploads/posts/${file.filename}`,
        nombre: file.originalname,
        tipo: file.mimetype
      }));
    }

    const result = await pool.query(
      `INSERT INTO sesion_mentoria (matching_id, titulo, fecha_sesion, duracion_min, notas, archivos)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [matchingId, titulo, fecha_sesion, duracion_min || 60, notas || null, JSON.stringify(archivosData)]
    );

    // Notify Padawan about new session
    await createNotification(
      padawanUserId,
      'nueva_sesion',
      'Nueva sesión programada',
      `Tu mentor programó la sesión "${titulo}".`,
      result.rows[0].sesion_id,
      'sesion'
    );

    console.log('[SESSION] Created session');
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/matchings/:matchingId/sessions
 * List all sessions of a matching.
 */
export const listSessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { matchingId } = req.params;

  try {
    const result = await pool.query(
      `SELECT sm.*, 
              (SELECT COUNT(*) FROM okr WHERE sesion_id = sm.sesion_id) as total_okrs,
              (SELECT COUNT(*) FROM okr WHERE sesion_id = sm.sesion_id AND estado = 'Completado') as okrs_completados
       FROM sesion_mentoria sm
       WHERE sm.matching_id = $1
       ORDER BY sm.fecha_sesion DESC`,
      [matchingId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/sessions/:sesionId
 * Update a session.
 */
export const updateSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { sesionId } = req.params;
  const { titulo, fecha_sesion, duracion_min, estado, url_grabacion, notas } = req.body;

  try {
    const files = req.files as Express.Multer.File[];
    // Build dynamic update query
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (titulo !== undefined) { updates.push(`titulo = $${paramIndex++}`); values.push(titulo); }
    if (fecha_sesion !== undefined) { updates.push(`fecha_sesion = $${paramIndex++}`); values.push(fecha_sesion); }
    if (duracion_min !== undefined) { updates.push(`duracion_min = $${paramIndex++}`); values.push(duracion_min); }
    if (estado !== undefined) { updates.push(`estado = $${paramIndex++}`); values.push(estado); }
    if (url_grabacion !== undefined) { updates.push(`url_grabacion = $${paramIndex++}`); values.push(url_grabacion); }
    if (notas !== undefined) { updates.push(`notas = $${paramIndex++}`); values.push(notas); }

    if (files && files.length > 0) {
      const archivosData = files.map(file => ({
        url: `/uploads/posts/${file.filename}`,
        nombre: file.originalname,
        tipo: file.mimetype
      }));
      updates.push(`archivos = $${paramIndex++}`);
      values.push(JSON.stringify(archivosData));
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No se proporcionaron campos para actualizar', code: 'NO_FIELDS' });
      return;
    }

    values.push(sesionId);

    const result = await pool.query(
      `UPDATE sesion_mentoria SET ${updates.join(', ')} WHERE sesion_id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Sesión no encontrada', code: 'SESSION_NOT_FOUND' });
      return;
    }

    const updated = result.rows[0];

    // Fire notifications based on new state
    if (estado === 'Realizada' || estado === 'Cancelada') {
      const partRes = await pool.query(
        `SELECT pa.usuario_id AS padawan_uid, u_m.usuario_id AS jedi_uid
         FROM sesion_mentoria sm
         JOIN matching m ON sm.matching_id = m.matching_id
         JOIN perfil_aprendiz pa ON m.padawan_id = pa.perfil_id
         JOIN mentor mt ON m.mentor_id = mt.mentor_id
         JOIN usuario u_m ON mt.usuario_id = u_m.usuario_id
         WHERE sm.sesion_id = $1`,
        [sesionId]
      );
      if (partRes.rows.length > 0) {
        const { padawan_uid, jedi_uid } = partRes.rows[0];
        const actorId = req.user?.userId;
        if (estado === 'Realizada') {
          await createNotification(padawan_uid, 'sesion_realizada', 'Sesión completada', `La sesión "${updated.titulo}" fue marcada como realizada.`, sesionId, 'sesion');
        } else {
          const otroId = actorId === padawan_uid ? jedi_uid : padawan_uid;
          await createNotification(otroId, 'sesion_cancelada', 'Sesión cancelada', `La sesión "${updated.titulo}" fue cancelada.`, sesionId, 'sesion');
        }
      }
    }

    console.log('[SESSION] Updated session');
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/sessions/:sesionId
 * Cancel a session (soft delete via status change).
 */
export const deleteSession = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { sesionId } = req.params;

  try {
    const result = await pool.query(
      `UPDATE sesion_mentoria SET estado = 'Cancelada' WHERE sesion_id = $1 AND estado != 'Cancelada' RETURNING *`,
      [sesionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Sesión no encontrada o ya cancelada', code: 'SESSION_NOT_FOUND' });
      return;
    }

    // Notify the other participant
    const partRes = await pool.query(
      `SELECT pa.usuario_id AS padawan_uid, u_m.usuario_id AS jedi_uid
       FROM sesion_mentoria sm
       JOIN matching m ON sm.matching_id = m.matching_id
       JOIN perfil_aprendiz pa ON m.padawan_id = pa.perfil_id
       JOIN mentor mt ON m.mentor_id = mt.mentor_id
       JOIN usuario u_m ON mt.usuario_id = u_m.usuario_id
       WHERE sm.sesion_id = $1`,
      [sesionId]
    );
    if (partRes.rows.length > 0) {
      const { padawan_uid, jedi_uid } = partRes.rows[0];
      const actorId = req.user?.userId;
      const otroId = actorId === padawan_uid ? jedi_uid : padawan_uid;
      await createNotification(otroId, 'sesion_cancelada', 'Sesión cancelada', `La sesión "${result.rows[0].titulo}" fue cancelada.`, sesionId, 'sesion');
    }

    console.log('[SESSION] Cancelled session');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/sessions/my-sessions
 * Get all sessions for the authenticated user (across all matchings).
 */
export const getMySessions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT sm.*, m.matching_id, m.estado as matching_estado,
              u_mentor.nombres as mentor_nombres, u_mentor.apellidos as mentor_apellidos,
              u_padawan.nombres as padawan_nombres, u_padawan.apellidos as padawan_apellidos,
              (SELECT COUNT(*) FROM okr WHERE sesion_id = sm.sesion_id) as total_okrs,
              (SELECT COUNT(*) FROM okr WHERE sesion_id = sm.sesion_id AND estado = 'Completado') as okrs_completados
       FROM sesion_mentoria sm
       JOIN matching m ON sm.matching_id = m.matching_id
       JOIN perfil_aprendiz pa ON m.padawan_id = pa.perfil_id
       JOIN usuario u_padawan ON pa.usuario_id = u_padawan.usuario_id
       JOIN mentor mt ON m.mentor_id = mt.mentor_id
       JOIN usuario u_mentor ON mt.usuario_id = u_mentor.usuario_id
       WHERE pa.usuario_id = $1 OR mt.usuario_id = $1
       ORDER BY sm.fecha_sesion DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};
