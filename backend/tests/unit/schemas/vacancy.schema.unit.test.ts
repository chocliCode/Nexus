/**
 * Unit Tests: Zod Schemas -- Vacancy
 *
 * Pruebas unitarias para los schemas de validacion de vacantes.
 */
import {
  createVacancySchema,
  updateVacancySchema,
  vacancyIdParamSchema,
} from '../../../src/schemas/vacancy.schema';

// ============================================================
// createVacancySchema
// ============================================================
describe('createVacancySchema', () => {
  const validUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  it('UNIT-VAC-SCH-01: acepta vacante valida con todos los campos', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'Frontend Developer',
      descripcion: 'Desarrollador React con TypeScript',
      salario_min: 3000,
      salario_max: 5000,
      modalidad: 'Remoto',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-VAC-SCH-02: acepta vacante sin campos opcionales', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'Backend Developer',
      modalidad: 'Presencial',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-VAC-SCH-03: rechaza empresa_id no-UUID', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: 'not-uuid',
      titulo: 'Developer',
      modalidad: 'Remoto',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-VAC-SCH-04: rechaza titulo menor a 3 caracteres', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'AB',
      modalidad: 'Remoto',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-VAC-SCH-05: rechaza titulo mayor a 200 caracteres', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'T'.repeat(201),
      modalidad: 'Remoto',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-VAC-SCH-06: acepta las 3 modalidades validas', () => {
    const modalidades = ['Presencial', 'Remoto', 'Hibrido'];
    for (const modalidad of modalidades) {
      const result = createVacancySchema.safeParse({
        empresa_id: validUUID,
        titulo: 'Developer',
        modalidad,
      });
      expect(result.success).toBe(true);
    }
  });

  it('UNIT-VAC-SCH-07: rechaza modalidad invalida', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'Developer',
      modalidad: 'Virtual',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-VAC-SCH-08: rechaza salario_min negativo', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'Developer',
      modalidad: 'Remoto',
      salario_min: -1000,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-VAC-SCH-09: rechaza salario_min igual a 0', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'Developer',
      modalidad: 'Remoto',
      salario_min: 0,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-VAC-SCH-10: rechaza descripcion mayor a 5000 caracteres', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'Developer',
      modalidad: 'Remoto',
      descripcion: 'D'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-VAC-SCH-11: rechaza sin campo modalidad', () => {
    const result = createVacancySchema.safeParse({
      empresa_id: validUUID,
      titulo: 'Developer',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// updateVacancySchema
// ============================================================
describe('updateVacancySchema', () => {
  it('UNIT-VAC-SCH-12: acepta actualizacion parcial (solo titulo)', () => {
    const result = updateVacancySchema.safeParse({
      titulo: 'Senior Developer',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-VAC-SCH-13: acepta campo activa como booleano', () => {
    const result = updateVacancySchema.safeParse({ activa: false });
    expect(result.success).toBe(true);
  });

  it('UNIT-VAC-SCH-14: rechaza activa como string', () => {
    const result = updateVacancySchema.safeParse({ activa: 'false' });
    expect(result.success).toBe(false);
  });

  it('UNIT-VAC-SCH-15: acepta objeto vacio (todo opcional)', () => {
    const result = updateVacancySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('UNIT-VAC-SCH-16: rechaza modalidad invalida en update', () => {
    const result = updateVacancySchema.safeParse({ modalidad: 'Espacial' });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// vacancyIdParamSchema
// ============================================================
describe('vacancyIdParamSchema', () => {
  it('UNIT-VAC-SCH-17: acepta UUID valido', () => {
    const result = vacancyIdParamSchema.safeParse({
      vacancyId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-VAC-SCH-18: rechaza string no-UUID', () => {
    const result = vacancyIdParamSchema.safeParse({ vacancyId: '12345' });
    expect(result.success).toBe(false);
  });
});
