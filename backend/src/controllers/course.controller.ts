import { Response, NextFunction } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../types';
import { createNotification } from './notification.controller';

/**
 * UC-29 — Listar cursos abiertos (catálogo)
 * GET /api/v1/courses
 */
export const listCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      `SELECT
         c.curso_id, c.titulo, c.descripcion, c.categoria, c.estado,
         c.max_estudiantes, c.imagen_url, c.fecha_creacion, c.fecha_apertura,
         u.nombres || ' ' || u.apellidos AS jedi_nombre,
         u.usuario_id AS jedi_id,
         COUNT(ci.inscripcion_id) FILTER (WHERE ci.estado = 'Activo') AS inscritos,
         BOOL_OR(ci.padawan_id = $1 AND ci.estado = 'Activo') AS ya_inscrito
       FROM curso c
       JOIN usuario u ON c.jedi_id = u.usuario_id
       LEFT JOIN curso_inscripcion ci ON c.curso_id = ci.curso_id
       WHERE c.estado = 'Abierto'
       GROUP BY c.curso_id, u.nombres, u.apellidos, u.usuario_id
       ORDER BY c.fecha_apertura DESC`,
      [userId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Mis cursos — como Jedi (propietario) o Padawan (inscrito)
 * GET /api/v1/courses/mine
 */
export const getMyCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const rol = req.user?.rol;

    let result;

    if (rol === 'Jedi' || rol === 'Admin') {
      result = await pool.query(
        `SELECT
           c.*,
           COUNT(ci.inscripcion_id) FILTER (WHERE ci.estado = 'Activo') AS inscritos
         FROM curso c
         LEFT JOIN curso_inscripcion ci ON c.curso_id = ci.curso_id
         WHERE c.jedi_id = $1
         GROUP BY c.curso_id
         ORDER BY c.fecha_creacion DESC`,
        [userId]
      );
    } else {
      result = await pool.query(
        `SELECT
           c.curso_id, c.titulo, c.descripcion, c.categoria, c.estado,
           c.max_estudiantes, c.imagen_url, c.fecha_creacion,
           u.nombres || ' ' || u.apellidos AS jedi_nombre,
           ci.fecha_inscripcion, ci.estado AS estado_inscripcion
         FROM curso_inscripcion ci
         JOIN curso c ON ci.curso_id = c.curso_id
         JOIN usuario u ON c.jedi_id = u.usuario_id
         WHERE ci.padawan_id = $1 AND ci.estado = 'Activo'
         ORDER BY ci.fecha_inscripcion DESC`,
        [userId]
      );
    }

    res.json({ success: true, data: result.rows });
  } catch (err) {
    next(err);
  }
};

/**
 * Detalle de un curso con lista de inscritos
 * GET /api/v1/courses/:courseId
 */
export const getCourseDetail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const userId = req.user?.userId;
  try {
    const courseRes = await pool.query(
      `SELECT
         c.*,
         u.nombres || ' ' || u.apellidos AS jedi_nombre,
         u.usuario_id AS jedi_id,
         COUNT(ci.inscripcion_id) FILTER (WHERE ci.estado = 'Activo') AS inscritos,
         BOOL_OR(ci.padawan_id = $2 AND ci.estado = 'Activo') AS ya_inscrito
       FROM curso c
       JOIN usuario u ON c.jedi_id = u.usuario_id
       LEFT JOIN curso_inscripcion ci ON c.curso_id = ci.curso_id
       WHERE c.curso_id = $1
       GROUP BY c.curso_id, u.nombres, u.apellidos, u.usuario_id`,
      [courseId, userId]
    );

    if (courseRes.rows.length === 0) {
      res.status(404).json({ error: 'Curso no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const studentsRes = await pool.query(
      `SELECT u.usuario_id, u.nombres, u.apellidos, u.email, ci.fecha_inscripcion
       FROM curso_inscripcion ci
       JOIN usuario u ON ci.padawan_id = u.usuario_id
       WHERE ci.curso_id = $1 AND ci.estado = 'Activo'
       ORDER BY ci.fecha_inscripcion ASC`,
      [courseId]
    );

    res.json({
      success: true,
      data: { ...courseRes.rows[0], estudiantes: studentsRes.rows }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * UC-29 — Crear curso (solo Jedi)
 * POST /api/v1/courses
 */
export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.userId;
  const { titulo, descripcion, categoria, max_estudiantes } = req.body;

  if (!titulo) {
    res.status(400).json({ error: 'El título es requerido', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO curso (jedi_id, titulo, descripcion, categoria, max_estudiantes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, titulo, descripcion || null, categoria || null, max_estudiantes || 30]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Abrir curso (estado Borrador → Abierto)
 * PATCH /api/v1/courses/:courseId/open
 */
export const openCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      `UPDATE curso
       SET estado = 'Abierto', fecha_apertura = NOW()
       WHERE curso_id = $1 AND jedi_id = $2
       RETURNING *`,
      [courseId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Curso no encontrado o sin permiso', code: 'FORBIDDEN' });
      return;
    }

    const curso = result.rows[0];

    // Notificar a todos los Padawans del sistema
    const padawans = await pool.query(
      `SELECT usuario_id FROM usuario WHERE rol = 'Padawan' AND activo = true`
    );
    await Promise.all(
      padawans.rows.map((p: { usuario_id: string }) =>
        createNotification(
          p.usuario_id,
          'curso_nuevo',
          '¡Nuevo curso disponible!',
          `El curso "${curso.titulo}" ya está abierto. ¡Únete ahora!`,
          courseId,
          'curso'
        )
      )
    );

    res.json({ success: true, data: curso });
  } catch (err) {
    next(err);
  }
};

/**
 * Cerrar curso (estado Abierto → Cerrado)
 * PATCH /api/v1/courses/:courseId/close
 */
export const closeCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const userId = req.user?.userId;
  try {
    const result = await pool.query(
      `UPDATE curso
       SET estado = 'Cerrado'
       WHERE curso_id = $1 AND jedi_id = $2
       RETURNING *`,
      [courseId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Curso no encontrado o sin permiso', code: 'FORBIDDEN' });
      return;
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * UC-30 — Unirse a un curso (solo Padawan)
 * POST /api/v1/courses/:courseId/join
 */
export const joinCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const userId = req.user?.userId;

  try {
    // Check course exists and is open
    const cursoRes = await pool.query(
      `SELECT c.*, u.nombres || ' ' || u.apellidos AS jedi_nombre, c.jedi_id
       FROM curso c JOIN usuario u ON c.jedi_id = u.usuario_id
       WHERE c.curso_id = $1`,
      [courseId]
    );

    if (cursoRes.rows.length === 0) {
      res.status(404).json({ error: 'Curso no encontrado', code: 'NOT_FOUND' });
      return;
    }

    const curso = cursoRes.rows[0];

    if (curso.estado !== 'Abierto') {
      res.status(400).json({ error: 'El curso no está abierto para inscripciones', code: 'COURSE_CLOSED' });
      return;
    }

    // Check membership limits
    const limitCheck = await pool.query(
      `SELECT m.limite_cursos, pa.limite_cursos_extra 
       FROM perfil_aprendiz pa 
       JOIN membresia m ON pa.membresia_id = m.membresia_id 
       WHERE pa.usuario_id = $1`,
      [userId]
    );
    
    // If not a padawan or doesn't have a membership, fail
    if (limitCheck.rows.length === 0) {
       res.status(403).json({ error: 'Solo los Padawans pueden unirse a cursos', code: 'FORBIDDEN' });
       return;
    }
    
    const baseLimit = limitCheck.rows[0].limite_cursos || 0;
    const extraLimit = limitCheck.rows[0].limite_cursos_extra || 0;
    const limiteCursos = baseLimit === 999 ? 999 : baseLimit + extraLimit;

    const currentCourses = await pool.query(
      `SELECT COUNT(*) AS total FROM curso_inscripcion WHERE padawan_id = $1 AND estado = 'Activo'`,
      [userId]
    );

    if (parseInt(currentCourses.rows[0].total) >= limiteCursos) {
      res.status(403).json({ error: `Has alcanzado el límite de ${limiteCursos} cursos activos de tu membresía.`, code: 'LIMIT_EXCEEDED' });
      return;
    }

    // Check capacity
    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM curso_inscripcion WHERE curso_id = $1 AND estado = 'Activo'`,
      [courseId]
    );
    if (parseInt(countRes.rows[0].total) >= curso.max_estudiantes) {
      res.status(400).json({ error: 'El curso está lleno', code: 'COURSE_FULL' });
      return;
    }

    // Insert (or reactivate if previously abandoned)
    const result = await pool.query(
      `INSERT INTO curso_inscripcion (curso_id, padawan_id, estado)
       VALUES ($1, $2, 'Activo')
       ON CONFLICT (curso_id, padawan_id)
       DO UPDATE SET estado = 'Activo', fecha_inscripcion = NOW()
       RETURNING *`,
      [courseId, userId]
    );

    // Get user name for notification
    const userRes = await pool.query(
      `SELECT nombres || ' ' || apellidos AS nombre_completo FROM usuario WHERE usuario_id = $1`,
      [userId]
    );
    const nombrePadawan = userRes.rows[0]?.nombre_completo || 'Un estudiante';

    // Notify the Jedi
    await createNotification(
      curso.jedi_id,
      'curso_inscripcion',
      'Nuevo estudiante en tu curso',
      `${nombrePadawan} se unió al curso "${curso.titulo}".`,
      courseId,
      'curso'
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

/**
 * Abandonar un curso (Padawan)
 * DELETE /api/v1/courses/:courseId/leave
 */
export const leaveCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const userId = req.user?.userId;
  try {
    await pool.query(
      `UPDATE curso_inscripcion SET estado = 'Abandonado'
       WHERE curso_id = $1 AND padawan_id = $2`,
      [courseId, userId]
    );
    res.json({ success: true, message: 'Abandonaste el curso.' });
  } catch (err) {
    next(err);
  }
};
