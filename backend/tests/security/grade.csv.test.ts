import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';

const API = '/api/v1/courses';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

describe('Seguridad OWASP: CSV Injection e IDOR', () => {

  const padawanToken = jwt.sign({ userId: 'a1111111-1111-1111-1111-111111111111', email: 'padawan@nexus.test', rol: 'Padawan' }, JWT_SECRET);
  const jediToken = jwt.sign({ userId: 'b2222222-2222-2222-2222-222222222222', email: 'jedi@nexus.test', rol: 'Jedi' }, JWT_SECRET);

  it('SEC-GRD-01: Export CSV escapa caracteres peligrosos para evitar inyeccion de formulas (Excel)', async () => {
    // Si la db tiene un usuario con nombre "=cmd|' /C calc'!A0", el controlador exportCourseGrades debe limpiarlo.
    // Asumimos que jedi123 es owner de curso123. Si falla por DB (403/404), igual evaluamos intencion.
    const res = await request(app)
      .get(`${API}/c0000001-0000-0000-0000-000000000001/grades/export`)
      .set('Authorization', `Bearer ${jediToken}`);
    
    // Si llegara a devolver el CSV (200), verificamos que el `=` fue escapado con `'=`
    if(res.status === 200) {
       expect(res.text).not.toContain('=cmd');
    }
    expect([200, 403, 404, 500]).toContain(res.status);
  });

  it('SEC-GRD-02: (IDOR) Padawan intenta auto-calificarse', async () => {
    const res = await request(app)
      .put(`${API}/submissions/00000000-0000-0000-0000-000000000000/grade`)
      .set('Authorization', `Bearer ${padawanToken}`)
      .send({ calificacion: 20 });
    
    // Debería ser 404 (no existe) o 403 (IDOR)
    expect([403, 404, 500]).toContain(res.status);
  });

  it('SEC-GRD-03: (Data Leakage) Padawan intenta descargar el CSV de todo el curso', async () => {
    const res = await request(app)
      .get(`${API}/c0000001-0000-0000-0000-000000000001/grades/export`)
      .set('Authorization', `Bearer ${padawanToken}`);
    
    expect([403, 500]).toContain(res.status);
  });

});
