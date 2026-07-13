/**
 * Unit Tests: Zod Schemas -- Course
 *
 * Pruebas unitarias puras para los schemas de validacion de cursos.
 * No tocan base de datos, no hacen HTTP, no usan Express.
 * Solo validan la logica de los schemas Zod de forma aislada.
 */
import { z } from 'zod';

// ============================================================
// Schema de creación de curso (replica la validación del controller)
// ============================================================
const createCourseSchema = z.object({
  titulo: z.string().min(3, 'Título demasiado corto').max(300, 'Título demasiado largo'),
  descripcion: z.string().max(5000).optional(),
  categoria: z.string().max(100).optional(),
  max_estudiantes: z.number().int().min(1).max(200).default(30),
});

const courseStateSchema = z.enum(['Borrador', 'Abierto', 'Cerrado']);

const enrollmentStateSchema = z.enum(['Activo', 'Abandonado']);

// ============================================================
// createCourseSchema
// ============================================================
describe('createCourseSchema', () => {
  // --- Happy path ---
  it('UNIT-COURSE-SCH-01: acepta datos válidos completos', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'React Moderno con TypeScript',
      descripcion: 'Curso completo de React 19 y TypeScript',
      categoria: 'Frontend',
      max_estudiantes: 25,
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-COURSE-SCH-02: acepta datos con solo el campo obligatorio (titulo)', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso Básico',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-COURSE-SCH-03: aplica default de 30 estudiantes si no se especifica', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso con default',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.max_estudiantes).toBe(30);
    }
  });

  // --- Titulo ---
  it('UNIT-COURSE-SCH-04: rechaza titulo vacío', () => {
    const result = createCourseSchema.safeParse({
      titulo: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('titulo');
    }
  });

  it('UNIT-COURSE-SCH-05: rechaza titulo menor a 3 caracteres', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'AB',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-06: rechaza titulo mayor a 300 caracteres', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'A'.repeat(301),
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-07: acepta titulo de exactamente 3 caracteres', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'ABC',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-COURSE-SCH-08: acepta titulo de exactamente 300 caracteres', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'A'.repeat(300),
    });
    expect(result.success).toBe(true);
  });

  // --- Descripcion ---
  it('UNIT-COURSE-SCH-09: acepta descripcion vacía (undefined)', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.descripcion).toBeUndefined();
    }
  });

  it('UNIT-COURSE-SCH-10: rechaza descripcion mayor a 5000 caracteres', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      descripcion: 'X'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });

  // --- max_estudiantes ---
  it('UNIT-COURSE-SCH-11: rechaza max_estudiantes = 0', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      max_estudiantes: 0,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-12: rechaza max_estudiantes negativo', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      max_estudiantes: -5,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-13: rechaza max_estudiantes mayor a 200', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      max_estudiantes: 201,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-14: acepta max_estudiantes = 1 (mínimo)', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      max_estudiantes: 1,
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-COURSE-SCH-15: acepta max_estudiantes = 200 (máximo)', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      max_estudiantes: 200,
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-COURSE-SCH-16: rechaza max_estudiantes decimal (no entero)', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      max_estudiantes: 25.5,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-17: rechaza max_estudiantes como string', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      max_estudiantes: 'treinta',
    });
    expect(result.success).toBe(false);
  });

  // --- Campos faltantes ---
  it('UNIT-COURSE-SCH-18: rechaza objeto vacío (sin titulo)', () => {
    const result = createCourseSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-19: rechaza null como input', () => {
    const result = createCourseSchema.safeParse(null);
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-20: rechaza undefined como input', () => {
    const result = createCourseSchema.safeParse(undefined);
    expect(result.success).toBe(false);
  });

  // --- Tipos incorrectos ---
  it('UNIT-COURSE-SCH-21: rechaza titulo como número', () => {
    const result = createCourseSchema.safeParse({
      titulo: 12345,
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-COURSE-SCH-22: rechaza titulo como array', () => {
    const result = createCourseSchema.safeParse({
      titulo: ['React', 'TypeScript'],
    });
    expect(result.success).toBe(false);
  });

  // --- Categoria ---
  it('UNIT-COURSE-SCH-23: acepta categoria como string válido', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      categoria: 'Backend',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.categoria).toBe('Backend');
    }
  });

  it('UNIT-COURSE-SCH-24: rechaza categoria mayor a 100 caracteres', () => {
    const result = createCourseSchema.safeParse({
      titulo: 'Curso válido',
      categoria: 'C'.repeat(101),
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// courseStateSchema — Estados válidos del curso
// ============================================================
describe('courseStateSchema', () => {
  it('UNIT-COURSE-SCH-25: acepta estado "Borrador"', () => {
    expect(courseStateSchema.safeParse('Borrador').success).toBe(true);
  });

  it('UNIT-COURSE-SCH-26: acepta estado "Abierto"', () => {
    expect(courseStateSchema.safeParse('Abierto').success).toBe(true);
  });

  it('UNIT-COURSE-SCH-27: acepta estado "Cerrado"', () => {
    expect(courseStateSchema.safeParse('Cerrado').success).toBe(true);
  });

  it('UNIT-COURSE-SCH-28: rechaza estado inventado', () => {
    expect(courseStateSchema.safeParse('Eliminado').success).toBe(false);
  });

  it('UNIT-COURSE-SCH-29: rechaza estado vacío', () => {
    expect(courseStateSchema.safeParse('').success).toBe(false);
  });

  it('UNIT-COURSE-SCH-30: rechaza estado en minúsculas', () => {
    expect(courseStateSchema.safeParse('abierto').success).toBe(false);
  });
});

// ============================================================
// enrollmentStateSchema — Estados válidos de inscripción
// ============================================================
describe('enrollmentStateSchema', () => {
  it('UNIT-COURSE-SCH-31: acepta estado "Activo"', () => {
    expect(enrollmentStateSchema.safeParse('Activo').success).toBe(true);
  });

  it('UNIT-COURSE-SCH-32: acepta estado "Abandonado"', () => {
    expect(enrollmentStateSchema.safeParse('Abandonado').success).toBe(true);
  });

  it('UNIT-COURSE-SCH-33: rechaza estado "Completado" (no existe en inscripciones)', () => {
    expect(enrollmentStateSchema.safeParse('Completado').success).toBe(false);
  });

  it('UNIT-COURSE-SCH-34: rechaza null', () => {
    expect(enrollmentStateSchema.safeParse(null).success).toBe(false);
  });
});
