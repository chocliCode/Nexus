import { Response, NextFunction } from 'express';
import pool from '../db/pool';
import { AuthRequest } from '../types';
import { createNotification } from './notification.controller';

/**
 * Verify the user is either the Jedi owner or an active Padawan of the course.
 */
const verifyCourseAccess = async (courseId: string, userId: string): Promise<{ allowed: boolean; isJedi: boolean }> => {
  const r = await pool.query(
    `SELECT c.jedi_id,
            EXISTS(SELECT 1 FROM curso_inscripcion ci WHERE ci.curso_id = c.curso_id AND ci.padawan_id = $2 AND ci.estado = 'Activo') AS is_student
     FROM curso c WHERE c.curso_id = $1`,
    [courseId, userId]
  );
  if (r.rows.length === 0) return { allowed: false, isJedi: false };
  const row = r.rows[0];
  const isJedi = row.jedi_id === userId;
  return { allowed: isJedi || row.is_student, isJedi };
};

/**
 * GET /api/v1/courses/:courseId/feed
 * List posts with comments for a course
 */
export const getCourseFeed = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  try {
    const access = await verifyCourseAccess(courseId, req.user!.userId);
    if (!access.allowed) {
      res.status(403).json({ error: 'No tienes acceso a este curso', code: 'FORBIDDEN' });
      return;
    }

    const posts = await pool.query(
      `SELECT p.*, u.nombres AS autor_nombres, u.apellidos AS autor_apellidos, u.rol AS autor_rol,
        (SELECT json_agg(json_build_object(
          'comentario_id', cc.comentario_id, 'contenido', cc.contenido,
          'fecha_creacion', cc.fecha_creacion, 'autor_id', cc.autor_id,
          'autor_nombres', uc.nombres, 'autor_apellidos', uc.apellidos, 'autor_rol', uc.rol
        ) ORDER BY cc.fecha_creacion ASC)
        FROM curso_comentario cc JOIN usuario uc ON cc.autor_id = uc.usuario_id WHERE cc.post_id = p.post_id) AS comentarios
       FROM curso_post p JOIN usuario u ON p.autor_id = u.usuario_id
       WHERE p.curso_id = $1
       ORDER BY p.fijado DESC, p.fecha_creacion DESC`,
      [courseId]
    );

    res.json({ success: true, data: posts.rows });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/courses/:courseId/posts
 * Create a post in a course
 */
export const createCoursePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const { tipo, titulo, contenido, url_enlace } = req.body;
  const userId = req.user!.userId;
  const files = req.files as Express.Multer.File[];

  try {
    const access = await verifyCourseAccess(courseId, userId);
    if (!access.allowed) {
      res.status(403).json({ error: 'No tienes acceso a este curso' }); return;
    }
    
    // Solo Jedi puede publicar
    if (!access.isJedi) {
      res.status(403).json({ error: 'Solo los profesores pueden publicar en el curso' }); return;
    }

    let archivosData: any[] = [];
    if (files && files.length > 0) {
      archivosData = files.map(file => ({
        url: `/uploads/posts/${file.filename}`,
        nombre: file.originalname,
        tipo: file.mimetype
      }));
    }

    const result = await pool.query(
      `INSERT INTO curso_post (curso_id, autor_id, tipo, titulo, contenido, url_enlace, archivos)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [courseId, userId, tipo || 'anuncio', titulo || null, contenido, url_enlace || null, JSON.stringify(archivosData)]
    );

    // Notify course members about new post
    if (access.isJedi) {
      // Jedi posted → notify all enrolled students
      const students = await pool.query(
        `SELECT padawan_id FROM curso_inscripcion WHERE curso_id = $1 AND estado = 'Activo'`,
        [courseId]
      );
      const cursoRes = await pool.query('SELECT titulo FROM curso WHERE curso_id = $1', [courseId]);
      const cursoTitulo = cursoRes.rows[0]?.titulo || 'un curso';

      await Promise.all(
        students.rows.map((s: { padawan_id: string }) =>
          createNotification(
            s.padawan_id,
            'curso_post',
            'Nueva publicacion en tu curso',
            `El profesor publico en "${cursoTitulo}": ${titulo || contenido.substring(0, 80)}`,
            courseId,
            'curso'
          )
        )
      );
    }

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/v1/courses/posts/:postId
 * Delete a post (author or Jedi of the course)
 */
export const deleteCoursePost = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { postId } = req.params;
  try {
    const check = await pool.query(
      `SELECT p.autor_id, c.jedi_id FROM curso_post p JOIN curso c ON p.curso_id = c.curso_id WHERE p.post_id = $1`,
      [postId]
    );
    if (check.rows.length === 0) { res.status(404).json({ error: 'Post no encontrado' }); return; }
    if (check.rows[0].autor_id !== req.user!.userId && check.rows[0].jedi_id !== req.user!.userId) {
      res.status(403).json({ error: 'No autorizado' }); return;
    }
    await pool.query('DELETE FROM curso_post WHERE post_id = $1', [postId]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/courses/posts/:postId/pin
 * Toggle pin on a post (Jedi only)
 */
export const toggleCoursePin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { postId } = req.params;
  try {
    // Verify caller is the Jedi of the course
    const check = await pool.query(
      `SELECT c.jedi_id FROM curso_post p JOIN curso c ON p.curso_id = c.curso_id WHERE p.post_id = $1`,
      [postId]
    );
    if (check.rows.length === 0) { res.status(404).json({ error: 'Post no encontrado' }); return; }
    if (check.rows[0].jedi_id !== req.user!.userId) {
      res.status(403).json({ error: 'Solo el profesor puede fijar posts' }); return;
    }

    const result = await pool.query(
      'UPDATE curso_post SET fijado = NOT fijado WHERE post_id = $1 RETURNING *', [postId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/courses/posts/:postId/comments
 * Add a comment to a course post
 */
export const addCourseComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { postId } = req.params;
  const { contenido } = req.body;

  if (!contenido) {
    res.status(400).json({ error: 'El contenido es requerido', code: 'VALIDATION_ERROR' });
    return;
  }

  try {
    // Verify user has access to the course
    const postCheck = await pool.query(
      'SELECT p.curso_id, p.autor_id FROM curso_post p WHERE p.post_id = $1', [postId]
    );
    if (postCheck.rows.length === 0) { res.status(404).json({ error: 'Post no encontrado' }); return; }

    const access = await verifyCourseAccess(postCheck.rows[0].curso_id, req.user!.userId);
    if (!access.allowed) {
      res.status(403).json({ error: 'No tienes acceso a este curso', code: 'FORBIDDEN' }); return;
    }

    const result = await pool.query(
      `INSERT INTO curso_comentario (post_id, autor_id, contenido) VALUES ($1, $2, $3) RETURNING *`,
      [postId, req.user!.userId, contenido]
    );

    // Notify post author if commenter is different
    if (postCheck.rows[0].autor_id !== req.user!.userId) {
      const commenterRes = await pool.query(
        'SELECT nombres || \' \' || apellidos AS nombre FROM usuario WHERE usuario_id = $1', [req.user!.userId]
      );
      await createNotification(
        postCheck.rows[0].autor_id,
        'curso_comentario',
        'Nuevo comentario en tu publicacion',
        `${commenterRes.rows[0]?.nombre || 'Alguien'} comento: "${contenido.substring(0, 80)}"`,
        postCheck.rows[0].curso_id,
        'curso'
      );
    }

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/v1/courses/comments/:commentId
 */
export const deleteCourseComment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { commentId } = req.params;
  try {
    const check = await pool.query(
      `SELECT cc.autor_id, c.jedi_id
       FROM curso_comentario cc
       JOIN curso_post p ON cc.post_id = p.post_id
       JOIN curso c ON p.curso_id = c.curso_id
       WHERE cc.comentario_id = $1`,
      [commentId]
    );
    if (check.rows.length === 0) { res.status(404).json({ error: 'Comentario no encontrado' }); return; }
    if (check.rows[0].autor_id !== req.user!.userId && check.rows[0].jedi_id !== req.user!.userId) {
      res.status(403).json({ error: 'No autorizado' }); return;
    }
    await pool.query('DELETE FROM curso_comentario WHERE comentario_id = $1', [commentId]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/courses/:courseId/students
 * List enrolled students
 */
export const getCourseStudents = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  try {
    const access = await verifyCourseAccess(courseId, req.user!.userId);
    if (!access.allowed) {
      res.status(403).json({ error: 'No tienes acceso a este curso', code: 'FORBIDDEN' }); return;
    }

    const result = await pool.query(
      `SELECT u.usuario_id, u.nombres, u.apellidos, u.email, u.rol, ci.fecha_inscripcion
       FROM curso_inscripcion ci
       JOIN usuario u ON ci.padawan_id = u.usuario_id
       WHERE ci.curso_id = $1 AND ci.estado = 'Activo'
       ORDER BY ci.fecha_inscripcion ASC`,
      [courseId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/courses/:courseId/grades
 * Jedi sees all grades. Padawan sees only their own.
 */
export const getCourseGrades = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const userId = req.user!.userId;
  const isJediGlobal = req.user!.rol === 'Jedi' || req.user!.rol === 'Admin';
  
  try {
    const access = await verifyCourseAccess(courseId, userId);
    if (!access.allowed) {
      res.status(403).json({ error: 'No tienes acceso a este curso', code: 'FORBIDDEN' }); return;
    }

    let query = `
      SELECT gc.*, 
             u.nombres as padawan_nombres, u.apellidos as padawan_apellidos, u.email as padawan_email,
             p.titulo as post_titulo
      FROM curso_calificacion gc
      JOIN usuario u ON gc.padawan_id = u.usuario_id
      LEFT JOIN curso_post p ON gc.post_id = p.post_id
      WHERE gc.curso_id = $1
    `;
    const params: any[] = [courseId];

    if (!access.isJedi && !isJediGlobal) {
      query += ` AND gc.padawan_id = $2`;
      params.push(userId);
    }

    query += ` ORDER BY u.apellidos ASC, gc.fecha_calificacion DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/courses/:courseId/grades
 * Create a grade (Jedi only)
 */
export const createCourseGrade = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const { padawan_id, post_id, titulo, nota, nota_maxima, comentario } = req.body;
  const userId = req.user!.userId;

  try {
    const access = await verifyCourseAccess(courseId, userId);
    if (!access.allowed || !access.isJedi) {
      res.status(403).json({ error: 'Solo el profesor puede calificar', code: 'FORBIDDEN' }); return;
    }

    const result = await pool.query(
      `INSERT INTO curso_calificacion (curso_id, padawan_id, post_id, titulo, nota, nota_maxima, comentario)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [courseId, padawan_id, post_id || null, titulo, nota, nota_maxima || 20.0, comentario || null]
    );
    
    // Notify padawan
    await createNotification(
      padawan_id,
      'curso_calificacion',
      'Nueva calificacion',
      `Has sido calificado en "${titulo}" con nota ${nota}/${nota_maxima || 20}.`,
      courseId,
      'curso'
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

/**
 * PUT /api/v1/courses/grades/:gradeId
 * Update a grade (Jedi only)
 */
export const updateCourseGrade = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { gradeId } = req.params;
  const { nota, comentario } = req.body;
  const userId = req.user!.userId;

  try {
    const check = await pool.query(
      `SELECT c.jedi_id FROM curso_calificacion gc JOIN curso c ON gc.curso_id = c.curso_id WHERE gc.calificacion_id = $1`,
      [gradeId]
    );
    if (check.rows.length === 0) { res.status(404).json({ error: 'Calificacion no encontrada' }); return; }
    if (check.rows[0].jedi_id !== userId) {
      res.status(403).json({ error: 'Solo el profesor puede editar calificaciones' }); return;
    }

    const result = await pool.query(
      `UPDATE curso_calificacion SET nota = $1, comentario = $2 WHERE calificacion_id = $3 RETURNING *`,
      [nota, comentario || null, gradeId]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

/**
 * DELETE /api/v1/courses/grades/:gradeId
 * Delete a grade (Jedi only)
 */
export const deleteCourseGrade = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { gradeId } = req.params;
  const userId = req.user!.userId;

  try {
    const check = await pool.query(
      `SELECT c.jedi_id FROM curso_calificacion gc JOIN curso c ON gc.curso_id = c.curso_id WHERE gc.calificacion_id = $1`,
      [gradeId]
    );
    if (check.rows.length === 0) { res.status(404).json({ error: 'Calificacion no encontrada' }); return; }
    if (check.rows[0].jedi_id !== userId) {
      res.status(403).json({ error: 'Solo el profesor puede eliminar calificaciones' }); return;
    }

    await pool.query('DELETE FROM curso_calificacion WHERE calificacion_id = $1', [gradeId]);
    res.json({ success: true });
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/courses/:courseId/grades/export
 * Export grades as CSV
 */
export const exportCourseGrades = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { courseId } = req.params;
  const userId = req.user!.userId;
  const isJediGlobal = req.user!.rol === 'Jedi' || req.user!.rol === 'Admin';
  
  try {
    const access = await verifyCourseAccess(courseId, userId);
    if (!access.allowed) {
      res.status(403).json({ error: 'No tienes acceso a este curso', code: 'FORBIDDEN' }); return;
    }

    let query = `
      SELECT gc.titulo as evaluacion, gc.nota, gc.nota_maxima, gc.comentario, gc.fecha_calificacion,
             u.nombres as padawan_nombres, u.apellidos as padawan_apellidos, u.email as padawan_email
      FROM curso_calificacion gc
      JOIN usuario u ON gc.padawan_id = u.usuario_id
      WHERE gc.curso_id = $1
    `;
    const params: any[] = [courseId];

    if (!access.isJedi && !isJediGlobal) {
      query += ` AND gc.padawan_id = $2`;
      params.push(userId);
    }
    
    query += ` ORDER BY u.apellidos ASC, gc.fecha_calificacion ASC`;
    const result = await pool.query(query, params);

    // Build CSV
    const rows = result.rows;
    let csv = '';
    
    if (access.isJedi) {
      csv = 'Alumno,Email,Evaluacion,Nota,Nota Maxima,Comentario,Fecha\n';
      rows.forEach(r => {
        csv += `"${r.padawan_apellidos}, ${r.padawan_nombres}","${r.padawan_email}","${r.evaluacion}",${r.nota},${r.nota_maxima},"${(r.comentario||'').replace(/"/g, '""')}","${new Date(r.fecha_calificacion).toLocaleDateString()}"\n`;
      });
    } else {
      csv = 'Evaluacion,Nota,Nota Maxima,Comentario,Fecha\n';
      rows.forEach(r => {
        csv += `"${r.evaluacion}",${r.nota},${r.nota_maxima},"${(r.comentario||'').replace(/"/g, '""')}","${new Date(r.fecha_calificacion).toLocaleDateString()}"\n`;
      });
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(`notas_curso_${courseId}.csv`);
    res.send(csv);
  } catch (err) { next(err); }
};

/**
 * POST /api/v1/courses/posts/:postId/submissions
 * Padawan submits an assignment
 */
export const submitAssignment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { postId } = req.params;
  const { comentarios } = req.body;
  const file = req.file;
  const userId = req.user!.userId;

  try {
    if (!file) {
      res.status(400).json({ error: 'Debes subir un archivo PDF' }); return;
    }

    const postCheck = await pool.query(`SELECT curso_id, tipo FROM curso_post WHERE post_id = $1`, [postId]);
    if (postCheck.rows.length === 0) { res.status(404).json({ error: 'Post no encontrado' }); return; }
    if (postCheck.rows[0].tipo !== 'tarea') { res.status(400).json({ error: 'El post no es una tarea' }); return; }

    const access = await verifyCourseAccess(postCheck.rows[0].curso_id, userId);
    if (!access.allowed || access.isJedi) {
      res.status(403).json({ error: 'Solo los alumnos inscritos pueden entregar tareas' }); return;
    }

    const archivoUrl = `/uploads/assignments/${file.filename}`;

    const result = await pool.query(
      `INSERT INTO curso_tarea_entrega (post_id, padawan_id, archivo_url, comentarios)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (post_id, padawan_id) 
       DO UPDATE SET archivo_url = EXCLUDED.archivo_url, comentarios = EXCLUDED.comentarios, fecha_entrega = NOW()
       RETURNING *`,
      [postId, userId, archivoUrl, comentarios || null]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

/**
 * GET /api/v1/courses/posts/:postId/submissions
 * List submissions for an assignment
 */
export const getAssignmentSubmissions = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const { postId } = req.params;
  const userId = req.user!.userId;

  try {
    const postCheck = await pool.query(`SELECT curso_id, tipo FROM curso_post WHERE post_id = $1`, [postId]);
    if (postCheck.rows.length === 0) { res.status(404).json({ error: 'Post no encontrado' }); return; }
    if (postCheck.rows[0].tipo !== 'tarea') { res.status(400).json({ error: 'El post no es una tarea' }); return; }

    const access = await verifyCourseAccess(postCheck.rows[0].curso_id, userId);
    if (!access.allowed) {
      res.status(403).json({ error: 'No tienes acceso a este curso' }); return;
    }

    let query = `
      SELECT cte.*, u.nombres, u.apellidos, u.email
      FROM curso_tarea_entrega cte
      JOIN usuario u ON cte.padawan_id = u.usuario_id
      WHERE cte.post_id = $1
    `;
    const params: any[] = [postId];

    if (!access.isJedi) {
      query += ` AND cte.padawan_id = $2`;
      params.push(userId);
    }
    query += ` ORDER BY cte.fecha_entrega DESC`;

    const result = await pool.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

