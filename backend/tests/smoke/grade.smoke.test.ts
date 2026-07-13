import request from 'supertest';
import app from '../../src/app';

const API = '/api/v1/courses';

describe('Smoke Tests: Rutas de Calificacion y Exportacion', () => {

  it('SMOKE-GRD-01: Endpoint CSV responde 401 a anonimos', async () => {
    const res = await request(app).get(`${API}/course-id/grades/export`);
    expect(res.status).toBe(401);
  });

  it('SMOKE-GRD-02: Endpoint PUT Grade rechaza anonimos o vacios sin crashear', async () => {
    const res = await request(app).put(`${API}/submissions/sub-id/grade`).send({});
    expect(res.status).toBe(401);
  });

  it('SMOKE-GRD-03: GET Grades general responde', async () => {
    const res = await request(app).get(`${API}/course-id/grades`);
    expect(res.status).toBe(401);
  });

});
