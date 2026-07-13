/**
 * Integration Tests: Courses API (UC-29, UC-30)
 *
 * Pruebas de integración que tocan la base de datos real y el servidor HTTP.
 * Validan el flujo completo: crear curso, abrir, listar catálogo, unirse, abandonar, cerrar.
 */
import request from 'supertest';
import app from '../src/app';
import pool from '../src/db/pool';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const API = '/api/v1/courses';

let jediToken: string;
let jediUserId: string;
let padawanToken: string;
let padawanUserId: string;
let createdCourseId: string;

beforeAll(async () => {
  // Cleanup
  await pool.query(`DELETE FROM curso_inscripcion WHERE curso_id IN (SELECT curso_id FROM curso WHERE titulo LIKE '%@coursetest%')`);
  await pool.query(`DELETE FROM curso WHERE titulo LIKE '%@coursetest%'`);
  await pool.query(`DELETE FROM usuario WHERE email LIKE '%@coursetest.com'`);

  const hash = await bcrypt.hash('Test1234!', 10);

  // Create Jedi user
  const jedi = await pool.query(
    `INSERT INTO usuario (nombres, apellidos, email, contrasena_hash, rol)
     VALUES ('Prof', 'Test', 'jedi@coursetest.com', $1, 'Jedi') RETURNING usuario_id`, [hash]
  );
  jediUserId = jedi.rows[0].usuario_id;
  jediToken = jwt.sign({ userId: jediUserId, email: 'jedi@coursetest.com', rol: 'Jedi' }, JWT_SECRET, { expiresIn: '1h' });

  // Create Padawan user
  const padawan = await pool.query(
    `INSERT INTO usuario (nombres, apellidos, email, contrasena_hash, rol)
     VALUES ('Alumno', 'Test', 'padawan@coursetest.com', $1, 'Padawan') RETURNING usuario_id`, [hash]
  );
  padawanUserId = padawan.rows[0].usuario_id;
  padawanToken = jwt.sign({ userId: padawanUserId, email: 'padawan@coursetest.com', rol: 'Padawan' }, JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await pool.query(`DELETE FROM curso_inscripcion WHERE curso_id IN (SELECT curso_id FROM curso WHERE titulo LIKE '%@coursetest%')`);
  await pool.query(`DELETE FROM curso WHERE titulo LIKE '%@coursetest%'`);
  await pool.query(`DELETE FROM usuario WHERE email LIKE '%@coursetest.com'`);
});

// ============================================================
// UC-29: Crear y gestionar cursos (Jedi)
// ============================================================
describe('UC-29: POST /api/v1/courses — Crear curso', () => {
  it('INT-COURSE-01: Jedi crea un curso correctamente', async () => {
    const res = await request(app)
      .post(API)
      .set('Authorization', `Bearer ${jediToken}`)
      .send({
        titulo: 'React Avanzado @coursetest',
        descripcion: 'Hooks, patterns, performance',
        categoria: 'Frontend',
        max_estudiantes: 20,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.titulo).toBe('React Avanzado @coursetest');
    expect(res.body.data.estado).toBe('Borrador');
    createdCourseId = res.body.data.curso_id;
  });

  it('INT-COURSE-02: rechaza creación sin titulo', async () => {
    const res = await request(app)
      .post(API)
      .set('Authorization', `Bearer ${jediToken}`)
      .send({ descripcion: 'Sin titulo' });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('INT-COURSE-03: rechaza creación sin autenticación', async () => {
    const res = await request(app)
      .post(API)
      .send({ titulo: 'Sin auth @coursetest' });

    expect(res.status).toBe(401);
  });
});

describe('UC-29: PATCH /api/v1/courses/:id/open — Abrir curso', () => {
  it('INT-COURSE-04: Jedi abre un curso en Borrador', async () => {
    const res = await request(app)
      .patch(`${API}/${createdCourseId}/open`)
      .set('Authorization', `Bearer ${jediToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('Abierto');
    expect(res.body.data.fecha_apertura).toBeDefined();
  });

  it('INT-COURSE-05: Padawan no puede abrir un curso', async () => {
    const res = await request(app)
      .patch(`${API}/${createdCourseId}/open`)
      .set('Authorization', `Bearer ${padawanToken}`);

    // El controller retorna 404 si el jedi_id no coincide
    expect(res.status).toBe(404);
  });
});

describe('UC-29: GET /api/v1/courses — Catálogo de cursos abiertos', () => {
  it('INT-COURSE-06: lista cursos abiertos con datos esperados', async () => {
    const res = await request(app)
      .get(API)
      .set('Authorization', `Bearer ${padawanToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);

    const course = res.body.data.find((c: { curso_id: string }) => c.curso_id === createdCourseId);
    expect(course).toBeDefined();
    expect(course.estado).toBe('Abierto');
    expect(course.jedi_nombre).toBeDefined();
  });

  it('INT-COURSE-07: retorna 401 sin token', async () => {
    const res = await request(app).get(API);
    expect(res.status).toBe(401);
  });
});

// ============================================================
// UC-30: Inscribirse y abandonar cursos (Padawan)
// ============================================================
describe('UC-30: POST /api/v1/courses/:id/join — Unirse a curso', () => {
  it('INT-COURSE-08: Padawan se une a un curso abierto', async () => {
    const res = await request(app)
      .post(`${API}/${createdCourseId}/join`)
      .set('Authorization', `Bearer ${padawanToken}`);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.estado).toBe('Activo');
  });

  it('INT-COURSE-09: doble inscripción no genera error (upsert)', async () => {
    const res = await request(app)
      .post(`${API}/${createdCourseId}/join`)
      .set('Authorization', `Bearer ${padawanToken}`);

    // ON CONFLICT DO UPDATE -> 201
    expect(res.status).toBe(201);
  });

  it('INT-COURSE-10: retorna 404 para curso inexistente', async () => {
    const res = await request(app)
      .post(`${API}/00000000-0000-0000-0000-000000000099/join`)
      .set('Authorization', `Bearer ${padawanToken}`);

    expect(res.status).toBe(404);
  });
});

describe('UC-29: GET /api/v1/courses/:id — Detalle del curso', () => {
  it('INT-COURSE-11: retorna detalle con lista de estudiantes', async () => {
    const res = await request(app)
      .get(`${API}/${createdCourseId}`)
      .set('Authorization', `Bearer ${jediToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.titulo).toBe('React Avanzado @coursetest');
    expect(res.body.data.estudiantes).toBeDefined();
    expect(Array.isArray(res.body.data.estudiantes)).toBe(true);
    expect(res.body.data.estudiantes.length).toBeGreaterThanOrEqual(1);
  });

  it('INT-COURSE-12: retorna ya_inscrito = true para Padawan inscrito', async () => {
    const res = await request(app)
      .get(`${API}/${createdCourseId}`)
      .set('Authorization', `Bearer ${padawanToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.ya_inscrito).toBe(true);
  });

  it('INT-COURSE-13: retorna 404 para curso inexistente', async () => {
    const res = await request(app)
      .get(`${API}/00000000-0000-0000-0000-000000000099`)
      .set('Authorization', `Bearer ${jediToken}`);

    expect(res.status).toBe(404);
  });
});

describe('UC-29: GET /api/v1/courses/mine — Mis cursos', () => {
  it('INT-COURSE-14: Jedi ve sus cursos creados', async () => {
    const res = await request(app)
      .get(`${API}/mine`)
      .set('Authorization', `Bearer ${jediToken}`);

    expect(res.status).toBe(200);
    const mine = res.body.data.find((c: { curso_id: string }) => c.curso_id === createdCourseId);
    expect(mine).toBeDefined();
  });

  it('INT-COURSE-15: Padawan ve sus inscripciones', async () => {
    const res = await request(app)
      .get(`${API}/mine`)
      .set('Authorization', `Bearer ${padawanToken}`);

    expect(res.status).toBe(200);
    const enrolled = res.body.data.find((c: { curso_id: string }) => c.curso_id === createdCourseId);
    expect(enrolled).toBeDefined();
    expect(enrolled.jedi_nombre).toBeDefined();
  });
});

describe('UC-30: DELETE /api/v1/courses/:id/leave — Abandonar curso', () => {
  it('INT-COURSE-16: Padawan abandona un curso', async () => {
    const res = await request(app)
      .delete(`${API}/${createdCourseId}/leave`)
      .set('Authorization', `Bearer ${padawanToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('INT-COURSE-17: tras abandonar, el Padawan ya no aparece en mis inscripciones', async () => {
    const res = await request(app)
      .get(`${API}/mine`)
      .set('Authorization', `Bearer ${padawanToken}`);

    const enrolled = res.body.data.find((c: { curso_id: string }) => c.curso_id === createdCourseId);
    expect(enrolled).toBeUndefined();
  });
});

describe('UC-29: PATCH /api/v1/courses/:id/close — Cerrar curso', () => {
  it('INT-COURSE-18: Jedi cierra un curso abierto', async () => {
    const res = await request(app)
      .patch(`${API}/${createdCourseId}/close`)
      .set('Authorization', `Bearer ${jediToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.estado).toBe('Cerrado');
  });

  it('INT-COURSE-19: Padawan no puede unirse a un curso cerrado', async () => {
    const res = await request(app)
      .post(`${API}/${createdCourseId}/join`)
      .set('Authorization', `Bearer ${padawanToken}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('COURSE_CLOSED');
  });
});

// ============================================================
// Prueba de capacidad
// ============================================================
describe('UC-30: Capacidad máxima del curso', () => {
  let smallCourseId: string;

  it('INT-COURSE-20: crea un curso con cupo de 1 estudiante', async () => {
    const res = await request(app)
      .post(API)
      .set('Authorization', `Bearer ${jediToken}`)
      .send({ titulo: 'Curso Mini @coursetest', max_estudiantes: 1 });

    expect(res.status).toBe(201);
    smallCourseId = res.body.data.curso_id;

    // Abrir el curso
    await request(app)
      .patch(`${API}/${smallCourseId}/open`)
      .set('Authorization', `Bearer ${jediToken}`);
  });

  it('INT-COURSE-21: primer alumno puede unirse', async () => {
    const res = await request(app)
      .post(`${API}/${smallCourseId}/join`)
      .set('Authorization', `Bearer ${padawanToken}`);

    expect(res.status).toBe(201);
  });

  it('INT-COURSE-22: segundo alumno es rechazado (curso lleno)', async () => {
    // Create a second padawan
    const hash = await bcrypt.hash('Test1234!', 10);
    const p2 = await pool.query(
      `INSERT INTO usuario (nombres, apellidos, email, contrasena_hash, rol)
       VALUES ('Otro', 'Alumno', 'padawan2@coursetest.com', $1, 'Padawan') RETURNING usuario_id`, [hash]
    );
    const p2Token = jwt.sign({ userId: p2.rows[0].usuario_id, email: 'padawan2@coursetest.com', rol: 'Padawan' }, JWT_SECRET, { expiresIn: '1h' });

    const res = await request(app)
      .post(`${API}/${smallCourseId}/join`)
      .set('Authorization', `Bearer ${p2Token}`);

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('COURSE_FULL');
  });
});
