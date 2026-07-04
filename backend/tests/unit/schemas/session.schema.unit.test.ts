/**
 * Unit Tests: Zod Schemas -- Session
 *
 * Pruebas unitarias para los schemas de validacion de sesiones de mentoria.
 */
import {
  createSessionSchema,
  updateSessionSchema,
  matchingIdParamSchema,
  sessionIdParamSchema,
} from '../../../src/schemas/session.schema';

// ============================================================
// createSessionSchema
// ============================================================
describe('createSessionSchema', () => {
  it('UNIT-SES-SCH-01: acepta sesion valida con todos los campos', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion de React',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
      duracion_min: 60,
      notas: 'Traer preguntas preparadas',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-SES-SCH-02: asigna duracion_min default de 60 si no se envia', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion de React',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.duracion_min).toBe(60);
    }
  });

  it('UNIT-SES-SCH-03: rechaza titulo menor a 3 caracteres', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'AB',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-SES-SCH-04: rechaza titulo mayor a 200 caracteres', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'T'.repeat(201),
      fecha_sesion: '2026-12-15T10:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-SES-SCH-05: rechaza fecha_sesion invalida', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion valida',
      fecha_sesion: 'manana-a-las-diez',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-SES-SCH-06: rechaza duracion_min menor a 15 minutos', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion corta',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
      duracion_min: 10,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-SES-SCH-07: rechaza duracion_min mayor a 480 minutos', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion eterna',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
      duracion_min: 500,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-SES-SCH-08: rechaza duracion_min decimal (no entero)', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion decimal',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
      duracion_min: 45.5,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-SES-SCH-09: acepta duracion_min de exactamente 15', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion minima',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
      duracion_min: 15,
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-SES-SCH-10: acepta duracion_min de exactamente 480', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion maxima',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
      duracion_min: 480,
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-SES-SCH-11: rechaza notas mayores a 2000 caracteres', () => {
    const result = createSessionSchema.safeParse({
      titulo: 'Sesion con notas largas',
      fecha_sesion: '2026-12-15T10:00:00.000Z',
      notas: 'N'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// updateSessionSchema
// ============================================================
describe('updateSessionSchema', () => {
  it('UNIT-SES-SCH-12: acepta actualizacion parcial (solo estado)', () => {
    const result = updateSessionSchema.safeParse({ estado: 'Realizada' });
    expect(result.success).toBe(true);
  });

  it('UNIT-SES-SCH-13: acepta todos los estados validos', () => {
    const estados = ['Programada', 'Realizada', 'Cancelada'];
    for (const estado of estados) {
      const result = updateSessionSchema.safeParse({ estado });
      expect(result.success).toBe(true);
    }
  });

  it('UNIT-SES-SCH-14: rechaza estado invalido', () => {
    const result = updateSessionSchema.safeParse({ estado: 'Eliminada' });
    expect(result.success).toBe(false);
  });

  it('UNIT-SES-SCH-15: acepta url_grabacion valida', () => {
    const result = updateSessionSchema.safeParse({
      url_grabacion: 'https://meet.google.com/recording-123',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-SES-SCH-16: rechaza url_grabacion invalida', () => {
    const result = updateSessionSchema.safeParse({
      url_grabacion: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-SES-SCH-17: acepta objeto vacio (todo opcional)', () => {
    const result = updateSessionSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ============================================================
// Param Schemas
// ============================================================
describe('matchingIdParamSchema', () => {
  it('UNIT-SES-SCH-18: acepta UUID valido', () => {
    const result = matchingIdParamSchema.safeParse({
      matchingId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-SES-SCH-19: rechaza string no-UUID', () => {
    const result = matchingIdParamSchema.safeParse({ matchingId: '12345' });
    expect(result.success).toBe(false);
  });
});

describe('sessionIdParamSchema', () => {
  it('UNIT-SES-SCH-20: acepta UUID valido', () => {
    const result = sessionIdParamSchema.safeParse({
      sesionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-SES-SCH-21: rechaza string vacio', () => {
    const result = sessionIdParamSchema.safeParse({ sesionId: '' });
    expect(result.success).toBe(false);
  });
});
