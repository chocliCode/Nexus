import request from 'supertest';
import app from '../../src/app';

const API = '/api/v1/courses';

describe('Smoke Tests: Rutas de Upload de Archivos', () => {

  it('SMOKE-PDF-01: El endpoint de subida (POST /submissions) detiene acceso anonimo', async () => {
    const res = await request(app)
      .post(`${API}/posts/post-uuid/submissions`)
      .attach('archivo', Buffer.from('%PDF-'), 'test.pdf');
    
    expect(res.status).toBe(401);
  });

  it('SMOKE-PDF-02: El endpoint de lectura (GET /submissions) es inaccesible sin Auth', async () => {
    const res = await request(app).get(`${API}/posts/post-uuid/submissions`);
    expect(res.status).toBe(401);
  });

  it('SMOKE-PDF-03: POST /posts acepta form-data en su estructura (UploadMiddleware)', async () => {
    const res = await request(app)
      .post(`${API}/course-uuid/posts`)
      .field('tipo', 'TAREA')
      .field('contenido', 'Smoke test');
    
    // Debería responder 401 por falta de auth, pero verifica que no crashea en form-data parser
    expect(res.status).toBe(401);
  });

});
