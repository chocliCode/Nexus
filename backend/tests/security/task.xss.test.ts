import request from 'supertest';
import app from '../../src/app';
import jwt from 'jsonwebtoken';

const API = '/api/v1/courses';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

describe('Seguridad Avanzada: XSS en Asignación de Tareas', () => {

  // Asumimos que jedi123 es dueño de course123 en el seed o el test fallará por RBAC,
  // pero para pruebas de XSS puro, Zod/Express Validator debería atrapar la inyección antes de RBAC.
  const jediToken = jwt.sign({ userId: 'b2222222-2222-2222-2222-222222222222', email: 'jedi@nexus.test', rol: 'Jedi' }, JWT_SECRET);

  it('SEC-TSK-01: Rechaza inyeccion HTML malicioso (XSS) en el contenido', async () => {
    const res = await request(app)
      .post(`${API}/c0000001-0000-0000-0000-000000000001/posts`)
      .set('Authorization', `Bearer ${jediToken}`)
      .send({
        tipo: 'TAREA',
        contenido: '<script>alert("Hacked")</script> Lee esto',
        fecha_vencimiento: '2027-12-31'
      });
    
    // Debería ser atrapado por middleware de sanitizacion (xss-clean o Zod custom)
    // Si no está sanitizado, al menos esperamos que el API no lo devuelva sin escapar en GET
    // Pero si tenemos un WAF o middleware, debe retornar 400.
    expect([201, 400]).toContain(res.status);
    
    if (res.status === 201) {
      // Si permite guardarlo (sanitización en salida), el contenido debe estar escapado
      expect(res.body.data.contenido).not.toContain('<script>');
    }
  });

  it('SEC-TSK-02: Rechaza payloads malformados en tipo', async () => {
    const res = await request(app)
      .post(`${API}/c0000001-0000-0000-0000-000000000001/posts`)
      .set('Authorization', `Bearer ${jediToken}`)
      .send({
        tipo: 'TAREA_DROP_TABLE_CURSO',
        contenido: 'Payload testing',
        fecha_vencimiento: '2027-12-31'
      });
    
    // Zod enum validation debe bloquear
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('SEC-TSK-03: Rechaza fechas excesivamente largas o invalidas (Buffer Overflow / DoS)', async () => {
    const res = await request(app)
      .post(`${API}/c0000001-0000-0000-0000-000000000001/posts`)
      .set('Authorization', `Bearer ${jediToken}`)
      .send({
        tipo: 'TAREA',
        contenido: 'Doomsday',
        fecha_vencimiento: 'A'.repeat(10000)
      });
    
    expect(res.status).toBe(400);
  });
});
