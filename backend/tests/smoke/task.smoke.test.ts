import request from 'supertest';
import app from '../../src/app';

const API = '/api/v1/courses';

describe('Smoke Tests: Rutas de Tareas / Posts', () => {

  it('SMOKE-TSK-01: Endpoint GET /courses/:id/feed responde sin crashear', async () => {
    const res = await request(app).get(`${API}/uuid-valido-1234/feed`);
    // Dependiendo de si es público o privado (requiere Auth)
    expect([200, 401]).toContain(res.status);
    const isAlive = res.status !== 500 && res.status !== 404;
    expect(isAlive).toBe(true);
  });

  it('SMOKE-TSK-02: POST a /courses/:id/posts intercepta anónimo rápido', async () => {
    const res = await request(app).post(`${API}/uuid-1234/posts`).send({});
    expect(res.status).toBe(401);
  });

  it('SMOKE-TSK-03: DELETE a /courses/posts/:postId intercepta anónimo rápido', async () => {
    const res = await request(app).delete(`${API}/posts/post-uuid-1234`);
    expect(res.status).toBe(401);
  });

});
