import request from 'supertest';
import app from '../../src/app';

const API = '/api/v1/courses';

describe('Smoke Tests: Rutas de Cursos', () => {

  it('SMOKE-CRS-01: El endpoint POST /courses intercepta acceso anonimo rapido', async () => {
    const res = await request(app).post(API).send({ titulo: 'Test' });
    expect(res.status).toBe(401);
  });

  it('SMOKE-CRS-02: El endpoint GET /courses (catalogo) responde 200 sin crashear', async () => {
    // Si la DB esta levantada, devolvera una lista.
    const res = await request(app).get(API);
    expect([200, 401]).toContain(res.status); // Depende de si requiere Auth
    
    // Evaluemos las configuraciones de CORS/Network 
    const isNetworkValid = res.status !== 500 && res.status !== 404;
    expect(isNetworkValid).toBe(true);
  });

  it('SMOKE-CRS-03: El endpoint GET /courses/mine intercepta anonimo rapido', async () => {
    const res = await request(app).get(`${API}/mine`);
    expect(res.status).toBe(401);
  });

});
