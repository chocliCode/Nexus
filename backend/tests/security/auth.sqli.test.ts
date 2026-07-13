import request from 'supertest';
import app from '../../src/app';

const API = '/api/v1';

describe('Seguridad Avanzada: SQL Injection & Bypass (Login)', () => {

  it('SEC-SQLI-01: Rechaza Time-based Blind SQLi y retorna rapido', async () => {
    const startTime = Date.now();
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({
        email: "test@nexus.test'; SELECT pg_sleep(5)--",
        contrasena: 'password123',
      });
    const duration = Date.now() - startTime;

    // Debe ser atrapado instantáneamente por Zod o fallar en BD.
    expect([400, 401]).toContain(res.status);
    
    // Verificamos que el tiempo de ejecución fue mucho menor a los 5 segundos inyectados
    expect(duration).toBeLessThan(4000);
  });

  it('SEC-SQLI-02: Rechaza Error-based SQLi y no devuelve stack trace', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({
        email: "admin@nexus.test' /*",
        contrasena: 'password',
      });
    
    expect([400, 401]).toContain(res.status);
    const bodyStr = JSON.stringify(res.body);
    expect(bodyStr).not.toContain('syntax error');
    expect(bodyStr).not.toContain('unterminated /* comment');
  });

  it('SEC-SQLI-03: Mitiga JSON Parameter Pollution (Bypass de objetos)', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({
        email: { "$gt": "" }, // Inyección tipo NoSQL / Bypass de validación Zod
        contrasena: 'password123',
      });
    
    // Zod debería interceptar que 'email' no es un string
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

});
