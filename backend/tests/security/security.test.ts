/**
 * Security Tests -- NEXUS
 * 15 pruebas de seguridad
 *
 * Framework: Jest + Supertest (misma infra que integracion)
 * Objetivo: Verificar que el sistema es resistente a ataques comunes
 */
import request from 'supertest';
import app from '../../src/app';

const API = '/api/v1';

describe('Seguridad: Inyeccion SQL', () => {

  // SEC-01: SQL injection en login (campo email)
  test('SEC-01: Rechaza SQL injection en email de login', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({
        email: "' OR '1'='1' --",
        contrasena: 'anything',
      });
    // Should NOT return 200 or leak data
    expect(res.status).not.toBe(200);
    expect(res.body.data).toBeUndefined();
  });

  // SEC-02: SQL injection en login (campo contrasena)
  test('SEC-02: Rechaza SQL injection en contrasena de login', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({
        email: 'test@test.com',
        contrasena: "'; DROP TABLE usuario; --",
      });
    // Should NOT return 200 -- the SQL injection should not bypass auth
    expect(res.status).not.toBe(200);
    // Server should still be alive (health check doesn't need DB)
    const health = await request(app).get(`${API}/health`);
    expect(health.status).toBe(200);
  });

  // SEC-03: SQL injection en multiples campos de login
  test('SEC-03: Rechaza SQL injection en multiples vectores de login', async () => {
    const injections = [
      "' UNION SELECT * FROM usuario --",
      "1; DROP TABLE usuario",
      "admin'--",
      "' OR 1=1 --",
    ];
    for (const injection of injections) {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .send({ email: injection, contrasena: injection });
      // None should return 200 or leak data
      expect(res.status).not.toBe(200);
      expect(res.body.data).toBeUndefined();
    }
    // Server must still be alive after all injection attempts
    const health = await request(app).get(`${API}/health`);
    expect(health.status).toBe(200);
  });

});

describe('Seguridad: Cross-Site Scripting (XSS)', () => {

  // SEC-04: XSS en query params de vacantes
  test('SEC-04: Neutraliza XSS en busqueda de vacantes', async () => {
    const xssPayload = '<img src=x onerror=alert(1)>';
    const res = await request(app)
      .get(`${API}/vacancies?search=${encodeURIComponent(xssPayload)}`);
    const body = JSON.stringify(res.body);
    // Response should NOT contain unescaped HTML
    expect(body).not.toContain('<img src=x');
    expect(body).not.toContain('onerror=');
  });

  // SEC-05: XSS en query params
  test('SEC-05: Neutraliza XSS en query parameters', async () => {
    const res = await request(app)
      .get(`${API}/vacancies?modalidad=<script>alert(1)</script>`);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('<script>');
  });

});

describe('Seguridad: Autenticacion y Autorizacion', () => {

  // SEC-06: Token JWT invalido es rechazado
  test('SEC-06: Rechaza JWT con firma invalida', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiIxMjM0NSIsImVtYWlsIjoiaGFja2VyQHRlc3QuY29tIiwicm9sIjoiQWRtaW4ifQ.fake_signature';
    const res = await request(app)
      .get(`${API}/auth/me`)
      .set('Authorization', `Bearer ${fakeToken}`);
    expect(res.status).toBe(401);
  });

  // SEC-07: Token expirado es rechazado
  test('SEC-07: Rechaza JWT expirado', async () => {
    // This is a structurally valid JWT but expired
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sIjoiUGFkYXdhbiIsImlhdCI6MTAwMDAwMDAwMCwiZXhwIjoxMDAwMDAwMDAxfQ.invalid';
    const res = await request(app)
      .get(`${API}/auth/me`)
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  // SEC-08: Sin header Authorization
  test('SEC-08: Rechaza request sin token de autorizacion', async () => {
    const res = await request(app).get(`${API}/auth/me`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_REQUIRED');
  });

  // SEC-09: Token manipulado (payload alterado)
  test('SEC-09: Rechaza token con payload alterado', async () => {
    // Take a valid structure but modify the payload to claim Admin role
    const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwiZW1haWwiOiJoYWNrZXJAdGVzdC5jb20iLCJyb2wiOiJBZG1pbiIsImlhdCI6OTk5OTk5OTk5OX0.tampered_signature';
    const res = await request(app)
      .get(`${API}/auth/me`)
      .set('Authorization', `Bearer ${tamperedToken}`);
    expect(res.status).toBe(401);
  });

  // SEC-10: Acceso a rutas protegidas sin token
  test('SEC-10: Rutas protegidas rechazan acceso sin token', async () => {
    const protectedRoutes = [
      { method: 'get', url: `${API}/auth/me` },
      { method: 'get', url: `${API}/sessions/my-sessions` },
      { method: 'get', url: `${API}/notifications` },
      { method: 'get', url: `${API}/ia/riesgo-abandono` },
    ];

    for (const route of protectedRoutes) {
      const res = await (request(app) as any)[route.method](route.url);
      expect(res.status).toBe(401);
    }
  });

});

describe('Seguridad: Headers y configuracion HTTP', () => {

  // SEC-11: No expone stack traces en produccion (errores 500)
  test('SEC-11: No expone informacion interna en errores', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({ email: 'x@x.com', contrasena: 'wrong' });
    // Response should NOT contain stack traces, file paths, or internal details
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('node_modules');
    expect(body).not.toContain('at Object');
    expect(body).not.toContain('\\src\\');
    expect(body).not.toContain('/src/');
  });

  // SEC-12: Content-Type application/json en respuestas
  test('SEC-12: API responde con Content-Type JSON', async () => {
    const res = await request(app).get(`${API}/health`);
    expect(res.headers['content-type']).toContain('application/json');
  });

});

describe('Seguridad: Payloads malformados', () => {

  // SEC-13: Body vacio no crashea el servidor
  test('SEC-13: Body vacio en login no causa crash', async () => {
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({});
    expect(res.status).toBe(400);
    // Server should still be alive
    const health = await request(app).get(`${API}/health`);
    expect(health.status).toBe(200);
  });

  // SEC-14: Payload extremadamente grande es rechazado
  test('SEC-14: Rechaza payload oversized', async () => {
    const hugePayload = {
      email: 'test@test.com',
      contrasena: 'x'.repeat(1_000_000), // 1MB string
    };
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send(hugePayload);
    // Should either reject (413/400) or handle gracefully
    expect(res.status).not.toBe(200);
    expect(res.status).not.toBe(500);
  });

  // SEC-15: Campos inesperados son ignorados por Zod validation
  test('SEC-15: Zod schema ignora campos no permitidos (mass assignment)', async () => {
    // Test via login endpoint (doesn't need DB for validation)
    const res = await request(app)
      .post(`${API}/auth/login`)
      .send({
        email: 'test@test.com',
        contrasena: 'ValidPass123!',
        // Extra fields that should be stripped by Zod
        is_admin: true,
        role_override: 'Admin',
        id: '00000000-0000-0000-0000-000000000001',
      });
    // The request should proceed normally (extra fields stripped by Zod)
    // It should NOT return 200 with admin privileges
    if (res.status === 200) {
      expect(res.body.data?.user?.is_admin).toBeUndefined();
      expect(res.body.data?.user?.role_override).toBeUndefined();
    }
    // Regardless of auth result, server should still be alive
    const health = await request(app).get(`${API}/health`);
    expect(health.status).toBe(200);
  });

});
