/**
 * Unit Tests: Zod Schemas -- OKR
 *
 * Pruebas unitarias para los schemas de validacion de OKRs.
 * Valida createOKRSchema, updateOKRSchema, completeOKRSchema,
 * feedbackOKRSchema, y schemas de parametros UUID.
 */
import {
  createOKRSchema,
  updateOKRSchema,
  completeOKRSchema,
  feedbackOKRSchema,
  sesionIdParamSchema,
  okrIdParamSchema,
} from '../../../src/schemas/okr.schema';

// ============================================================
// createOKRSchema
// ============================================================
describe('createOKRSchema', () => {
  it('UNIT-OKR-SCH-01: acepta OKR valido con todos los campos', () => {
    const result = createOKRSchema.safeParse({
      descripcion: 'Completar 3 pull requests',
      indicador: 'Pull requests merged',
      valor_meta: 3,
      fecha_limite: '2026-12-31T00:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-02: acepta OKR sin campos opcionales', () => {
    const result = createOKRSchema.safeParse({
      descripcion: 'Completar curso de React',
      valor_meta: 1,
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-03: rechaza descripcion menor a 5 caracteres', () => {
    const result = createOKRSchema.safeParse({
      descripcion: 'Hi',
      valor_meta: 1,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-04: rechaza descripcion mayor a 1000 caracteres', () => {
    const result = createOKRSchema.safeParse({
      descripcion: 'A'.repeat(1001),
      valor_meta: 1,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-05: rechaza valor_meta negativo', () => {
    const result = createOKRSchema.safeParse({
      descripcion: 'Completar algo',
      valor_meta: -1,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-06: rechaza valor_meta igual a 0', () => {
    const result = createOKRSchema.safeParse({
      descripcion: 'Completar algo',
      valor_meta: 0,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-07: rechaza fecha_limite invalida', () => {
    const result = createOKRSchema.safeParse({
      descripcion: 'Completar algo',
      valor_meta: 1,
      fecha_limite: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-08: rechaza indicador mayor a 500 caracteres', () => {
    const result = createOKRSchema.safeParse({
      descripcion: 'Completar algo',
      valor_meta: 1,
      indicador: 'X'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// updateOKRSchema
// ============================================================
describe('updateOKRSchema', () => {
  it('UNIT-OKR-SCH-09: acepta actualizacion parcial (solo descripcion)', () => {
    const result = updateOKRSchema.safeParse({
      descripcion: 'Descripcion actualizada',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-10: acepta actualizacion de estado valido', () => {
    const result = updateOKRSchema.safeParse({
      estado: 'EnProgreso',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-11: rechaza estado invalido', () => {
    const result = updateOKRSchema.safeParse({
      estado: 'Eliminado',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-12: acepta todos los estados validos', () => {
    const estados = ['Pendiente', 'EnProgreso', 'Completado', 'Cancelado'];
    for (const estado of estados) {
      const result = updateOKRSchema.safeParse({ estado });
      expect(result.success).toBe(true);
    }
  });

  it('UNIT-OKR-SCH-13: acepta valor_actual igual a 0', () => {
    const result = updateOKRSchema.safeParse({ valor_actual: 0 });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-14: rechaza valor_actual negativo', () => {
    const result = updateOKRSchema.safeParse({ valor_actual: -5 });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// completeOKRSchema
// ============================================================
describe('completeOKRSchema', () => {
  it('UNIT-OKR-SCH-15: acepta completacion valida', () => {
    const result = completeOKRSchema.safeParse({
      valor_actual: 5,
      nota_cierre: 'Completado exitosamente',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-16: acepta valor_actual igual a 0', () => {
    const result = completeOKRSchema.safeParse({
      valor_actual: 0,
      nota_cierre: 'No se logro',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-17: rechaza sin nota_cierre', () => {
    const result = completeOKRSchema.safeParse({
      valor_actual: 5,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-18: rechaza nota_cierre vacia', () => {
    const result = completeOKRSchema.safeParse({
      valor_actual: 5,
      nota_cierre: '',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-19: rechaza nota_cierre mayor a 2000 caracteres', () => {
    const result = completeOKRSchema.safeParse({
      valor_actual: 5,
      nota_cierre: 'N'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-20: rechaza valor_actual negativo', () => {
    const result = completeOKRSchema.safeParse({
      valor_actual: -1,
      nota_cierre: 'Nota',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// feedbackOKRSchema
// ============================================================
describe('feedbackOKRSchema', () => {
  it('UNIT-OKR-SCH-21: acepta accion "aprobar"', () => {
    const result = feedbackOKRSchema.safeParse({ accion: 'aprobar' });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-22: acepta accion "revisar" con comentario', () => {
    const result = feedbackOKRSchema.safeParse({
      accion: 'revisar',
      comentario: 'Necesita mas detalle',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-23: rechaza accion invalida', () => {
    const result = feedbackOKRSchema.safeParse({ accion: 'eliminar' });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-24: rechaza comentario mayor a 2000 caracteres', () => {
    const result = feedbackOKRSchema.safeParse({
      accion: 'aprobar',
      comentario: 'C'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// Param Schemas (UUID validation)
// ============================================================
describe('sesionIdParamSchema', () => {
  it('UNIT-OKR-SCH-25: acepta UUID valido', () => {
    const result = sesionIdParamSchema.safeParse({
      sesionId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-26: rechaza string no-UUID', () => {
    const result = sesionIdParamSchema.safeParse({ sesionId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('UNIT-OKR-SCH-27: rechaza numero como sesionId', () => {
    const result = sesionIdParamSchema.safeParse({ sesionId: 12345 });
    expect(result.success).toBe(false);
  });
});

describe('okrIdParamSchema', () => {
  it('UNIT-OKR-SCH-28: acepta UUID valido', () => {
    const result = okrIdParamSchema.safeParse({
      okrId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-OKR-SCH-29: rechaza string vacio', () => {
    const result = okrIdParamSchema.safeParse({ okrId: '' });
    expect(result.success).toBe(false);
  });
});
