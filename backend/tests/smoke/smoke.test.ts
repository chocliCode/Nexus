/**
 * Smoke Tests -- NEXUS
 * 15 pruebas de humo para validar que el sistema esta vivo
 *
 * Objetivo: Validacion super rapida (subset critico) para confirmar
 * que la aplicacion se levanta y las rutas principales responden
 * sin errores 500.
 */
import request from 'supertest';
import app from '../../src/app';

const API = '/api/v1';

describe('Pruebas de Humo (Smoke Tests)', () => {

  // =========================================================
  // 1. Salud del Sistema
  // =========================================================
  describe('Salud del Sistema', () => {
    test('SMOKE-01: El endpoint de health check responde 200', async () => {
      const res = await request(app).get(`${API}/health`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    test('SMOKE-02: La aplicacion Express esta escuchando peticiones', async () => {
      // Simplemente probar una ruta 404 para confirmar que Express maneja el request
      const res = await request(app).get('/ruta-que-no-existe');
      expect(res.status).toBe(404);
    });
  });

  // =========================================================
  // 2. Endpoints Publicos (Sin Auth)
  // =========================================================
  describe('Endpoints Publicos', () => {
    test('SMOKE-03: La API maneja correctamente verbos HTTP no permitidos', async () => {
      const res = await request(app).put(`${API}/auth/login`);
      expect(res.status).toBe(404);
    });

    test('SMOKE-04: La API responde con el formato JSON correcto en errores', async () => {
      const res = await request(app).get('/ruta-que-no-existe');
      expect(res.body.code).toBe('NOT_FOUND');
    });

    test('SMOKE-05: El endpoint de login esta expuesto y valida requests', async () => {
      // Mandar request vacio debe retornar 400 (Zod), no 500 (crash) ni 404
      const res = await request(app).post(`${API}/auth/login`).send({});
      expect(res.status).toBe(400);
    });

    test('SMOKE-06: El endpoint de registro esta expuesto y valida requests', async () => {
      const res = await request(app).post(`${API}/auth/register`).send({});
      expect(res.status).toBe(400);
    });
  });

  // =========================================================
  // 3. Middlewares y Seguridad Basica
  // =========================================================
  describe('Middlewares', () => {
    test('SMOKE-07: El middleware de CORS esta activo', async () => {
      const res = await request(app)
        .options(`${API}/health`)
        .set('Origin', 'http://localhost:5174');
      // Should return CORS headers
      expect(res.headers['access-control-allow-origin']).toBeDefined();
    });

    test('SMOKE-08: El middleware de parseo JSON funciona', async () => {
      const res = await request(app)
        .post(`${API}/auth/login`)
        .set('Content-Type', 'application/json')
        .send('{"invalid_json":'); // Malformed JSON
      expect(res.status).toBe(400); // Bad request, not crash
    });
  });

  // =========================================================
  // 4. Proteccion de Rutas (Auth Middleware)
  // =========================================================
  describe('Proteccion de Rutas Principales', () => {
    test('SMOKE-09: La ruta GET /auth/me esta protegida', async () => {
      const res = await request(app).get(`${API}/auth/me`);
      expect(res.status).toBe(401); // Requires auth
    });

    test('SMOKE-10: La ruta GET /sessions/my-sessions esta protegida', async () => {
      const res = await request(app).get(`${API}/sessions/my-sessions`);
      expect(res.status).toBe(401);
    });

    test('SMOKE-11: La ruta GET /profile/me esta protegida', async () => {
      const res = await request(app).get(`${API}/profile/me`);
      expect(res.status).toBe(401);
    });

    test('SMOKE-12: La ruta GET /notifications esta protegida', async () => {
      const res = await request(app).get(`${API}/notifications`);
      expect(res.status).toBe(401);
    });

    test('SMOKE-13: La ruta GET /ia/riesgo-abandono esta protegida', async () => {
      const res = await request(app).get(`${API}/ia/riesgo-abandono`);
      expect(res.status).toBe(401);
    });
  });

  // =========================================================
  // 5. Conexion a Base de Datos
  // =========================================================
  describe('Integracion DB', () => {
    test('SMOKE-14: La API rechaza versiones no soportadas', async () => {
      const res = await request(app).get('/api/v2/health');
      expect(res.status).toBe(404);
    });

    test('SMOKE-15: El rate limiter permite multiples requests rapidos sin bloquear inmediatamente', async () => {
      // Send 3 requests to health
      await request(app).get(`${API}/health`);
      await request(app).get(`${API}/health`);
      const res = await request(app).get(`${API}/health`);
      expect(res.status).toBe(200);
    });
  });

});
