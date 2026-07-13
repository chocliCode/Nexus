import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';

const API = '/api/v1/courses';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

describe('Seguridad Avanzada: RBAC en Crear Curso', () => {

  const padawanToken = jwt.sign({ userId: 'padawan123', email: 'padawan@nexus.test', rol: 'Padawan' }, JWT_SECRET);
  const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid_payload.signature';

  it('SEC-CRS-01: Un Padawan no puede crear cursos', async () => {
    const res = await request(app)
      .post(API)
      .set('Authorization', `Bearer ${padawanToken}`)
      .send({
        titulo: 'Hacking con Fuerza',
        descripcion: 'Intento de escalamiento'
      });
    
    // El middleware requireRole('Jedi', 'Admin') debe bloquear
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('SEC-CRS-02: Rechaza peticion con token manipulado', async () => {
    const res = await request(app)
      .post(API)
      .set('Authorization', `Bearer ${fakeToken}`)
      .send({ titulo: 'Curso Fake' });

    expect(res.status).toBe(401);
  });

  it('SEC-CRS-03: Rechaza peticion sin cabecera de autorizacion', async () => {
    const res = await request(app)
      .post(API)
      .send({ titulo: 'Curso Anonimo' });

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_REQUIRED');
  });

});
