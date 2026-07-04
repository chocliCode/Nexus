/**
 * Unit Tests: Zod Schemas -- Profile
 *
 * Pruebas unitarias para los schemas de validacion de perfiles.
 */
import { addSkillSchema, updateProfileSchema } from '../../../src/schemas/profile.schema';

// ============================================================
// addSkillSchema
// ============================================================
describe('addSkillSchema', () => {
  const validUUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

  it('UNIT-PROF-SCH-01: acepta habilidad valida nivel Basico', () => {
    const result = addSkillSchema.safeParse({
      habilidad_id: validUUID,
      nivel: 'Basico',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-02: acepta habilidad valida nivel Intermedio', () => {
    const result = addSkillSchema.safeParse({
      habilidad_id: validUUID,
      nivel: 'Intermedio',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-03: acepta habilidad valida nivel Avanzado', () => {
    const result = addSkillSchema.safeParse({
      habilidad_id: validUUID,
      nivel: 'Avanzado',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-04: rechaza nivel invalido', () => {
    const result = addSkillSchema.safeParse({
      habilidad_id: validUUID,
      nivel: 'Experto',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-PROF-SCH-05: rechaza habilidad_id no-UUID', () => {
    const result = addSkillSchema.safeParse({
      habilidad_id: 'not-a-uuid',
      nivel: 'Basico',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-PROF-SCH-06: rechaza sin campo nivel', () => {
    const result = addSkillSchema.safeParse({
      habilidad_id: validUUID,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-PROF-SCH-07: rechaza objeto vacio', () => {
    const result = addSkillSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ============================================================
// updateProfileSchema
// ============================================================
describe('updateProfileSchema', () => {
  it('UNIT-PROF-SCH-08: acepta actualizacion valida con todos los campos', () => {
    const result = updateProfileSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      resumen_bio: 'Desarrollador fullstack',
      url_portafolio: 'https://carlos.dev',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-09: acepta actualizacion parcial', () => {
    const result = updateProfileSchema.safeParse({
      nombres: 'Carlos',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-10: acepta objeto vacio (todo opcional)', () => {
    const result = updateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-11: rechaza nombres menor a 2 caracteres', () => {
    const result = updateProfileSchema.safeParse({ nombres: 'A' });
    expect(result.success).toBe(false);
  });

  it('UNIT-PROF-SCH-12: acepta resumen_bio como null', () => {
    const result = updateProfileSchema.safeParse({ resumen_bio: null });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-13: acepta resumen_bio como string vacio', () => {
    const result = updateProfileSchema.safeParse({ resumen_bio: '' });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-14: rechaza resumen_bio mayor a 1000 caracteres', () => {
    const result = updateProfileSchema.safeParse({
      resumen_bio: 'B'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-PROF-SCH-15: acepta url_portafolio como string vacio', () => {
    const result = updateProfileSchema.safeParse({ url_portafolio: '' });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-16: rechaza url_portafolio invalida', () => {
    const result = updateProfileSchema.safeParse({
      url_portafolio: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-PROF-SCH-17: acepta campos de mentor', () => {
    const result = updateProfileSchema.safeParse({
      especialidades: 'React, Node.js, PostgreSQL',
      anios_experiencia: 5,
      bio_profesional: 'Mentor senior con 5 anios de experiencia',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-PROF-SCH-18: rechaza anios_experiencia negativo', () => {
    const result = updateProfileSchema.safeParse({
      anios_experiencia: -1,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-PROF-SCH-19: rechaza anios_experiencia mayor a 50', () => {
    const result = updateProfileSchema.safeParse({
      anios_experiencia: 51,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-PROF-SCH-20: rechaza anios_experiencia decimal', () => {
    const result = updateProfileSchema.safeParse({
      anios_experiencia: 3.5,
    });
    expect(result.success).toBe(false);
  });
});
