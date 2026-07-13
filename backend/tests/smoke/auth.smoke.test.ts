import request from 'supertest';
import app from '../../src/app';

const API = '/api/v1';

describe('Smoke Tests: Auth Endpoints', () => {
  // Las pruebas de humo no prueban logica de negocio profunda, 
  // solo que los endpoints estan "vivos" y responden correctamente 
  // a nivel de red sin crashear.

  it('SMOKE-AUTH-01: El endpoint /login responde y valida formato', async () => {
    // Enviamos un request vacio. Deberia responder 400 Bad Request por Zod,
    // garantizando que el router, middleware y Zod estan conectados y vivos.
    const res = await request(app).post(`${API}/auth/login`).send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('SMOKE-AUTH-02: El endpoint /register responde sin colapsar', async () => {
    const res = await request(app).post(`${API}/auth/register`).send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('SMOKE-AUTH-03: El endpoint /me bloquea acceso no autenticado (CORS y Auth vivos)', async () => {
    const res = await request(app).get(`${API}/auth/me`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_REQUIRED');
  });
});
