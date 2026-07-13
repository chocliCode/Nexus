import { Response, NextFunction } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../types';

export const listMemberships = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT membresia_id, nombre, limite_mentores, limite_cursos, precio, caracteristicas 
       FROM membresia 
       ORDER BY precio ASC`
    );
    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

export const updateMembership = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.userId;
  const { membresia_id } = req.body;

  try {
    const checkRole = await pool.query('SELECT rol FROM usuario WHERE usuario_id = $1', [userId]);
    if (checkRole.rows[0]?.rol !== 'Padawan') {
      res.status(403).json({ error: 'Solo los aprendices pueden tener membresía', code: 'FORBIDDEN' });
      return;
    }

    const checkMembership = await pool.query('SELECT membresia_id FROM membresia WHERE membresia_id = $1', [membresia_id]);
    if (checkMembership.rows.length === 0) {
      res.status(404).json({ error: 'Membresía no encontrada', code: 'NOT_FOUND' });
      return;
    }

    const result = await pool.query(
      `UPDATE perfil_aprendiz 
       SET membresia_id = $1, fecha_actualizacion = NOW() 
       WHERE usuario_id = $2 RETURNING *`,
      [membresia_id, userId]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
