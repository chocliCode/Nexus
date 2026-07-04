/**
 * Unit Tests: Zod Schemas -- Auth
 *
 * Pruebas unitarias puras para los schemas de validacion de autenticacion.
 * No tocan base de datos, no hacen HTTP, no usan Express.
 * Solo validan la logica de los schemas Zod de forma aislada.
 */
import { registerSchema, loginSchema } from '../../../src/schemas/auth.schema';

// ============================================================
// registerSchema
// ============================================================
describe('registerSchema', () => {
  // --- Happy path ---
  it('UNIT-AUTH-SCH-01: acepta datos validos de Padawan', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@example.com',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-AUTH-SCH-02: acepta datos validos de Jedi', () => {
    const result = registerSchema.safeParse({
      nombres: 'Ana',
      apellidos: 'Lopez',
      email: 'ana@example.com',
      contrasena: 'MentorPass99!',
      rol: 'Jedi',
    });
    expect(result.success).toBe(true);
  });

  // --- Nombres ---
  it('UNIT-AUTH-SCH-03: rechaza nombres con menos de 2 caracteres', () => {
    const result = registerSchema.safeParse({
      nombres: 'A',
      apellidos: 'Garcia',
      email: 'a@test.com',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('nombres');
    }
  });

  it('UNIT-AUTH-SCH-04: rechaza nombres vacios', () => {
    const result = registerSchema.safeParse({
      nombres: '',
      apellidos: 'Garcia',
      email: 'test@test.com',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-AUTH-SCH-05: rechaza nombres mayores a 100 caracteres', () => {
    const result = registerSchema.safeParse({
      nombres: 'A'.repeat(101),
      apellidos: 'Garcia',
      email: 'test@test.com',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
  });

  // --- Apellidos ---
  it('UNIT-AUTH-SCH-06: rechaza apellidos con menos de 2 caracteres', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'G',
      email: 'test@test.com',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('apellidos');
    }
  });

  // --- Email ---
  it('UNIT-AUTH-SCH-07: rechaza email invalido (sin @)', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'not-an-email',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('UNIT-AUTH-SCH-08: rechaza email invalido (sin dominio)', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-AUTH-SCH-09: rechaza email mayor a 150 caracteres', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'a'.repeat(140) + '@example.com',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
  });

  // --- Contrasena ---
  it('UNIT-AUTH-SCH-10: rechaza contrasena menor a 8 caracteres', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@test.com',
      contrasena: 'Short1!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('contrasena');
    }
  });

  it('UNIT-AUTH-SCH-11: acepta contrasena de exactamente 8 caracteres', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@test.com',
      contrasena: '12345678',
      rol: 'Padawan',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-AUTH-SCH-12: rechaza contrasena mayor a 100 caracteres', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@test.com',
      contrasena: 'A'.repeat(101),
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
  });

  // --- Rol ---
  it('UNIT-AUTH-SCH-13: rechaza rol "Admin" (solo Padawan o Jedi permitidos)', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@test.com',
      contrasena: 'SecurePass123!',
      rol: 'Admin',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-AUTH-SCH-14: rechaza rol inventado', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@test.com',
      contrasena: 'SecurePass123!',
      rol: 'SuperUser',
    });
    expect(result.success).toBe(false);
  });

  // --- Campos faltantes ---
  it('UNIT-AUTH-SCH-15: rechaza objeto vacio', () => {
    const result = registerSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('UNIT-AUTH-SCH-16: rechaza si falta el campo email', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-AUTH-SCH-17: rechaza si falta el campo rol', () => {
    const result = registerSchema.safeParse({
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@test.com',
      contrasena: 'SecurePass123!',
    });
    expect(result.success).toBe(false);
  });

  // --- Tipos incorrectos ---
  it('UNIT-AUTH-SCH-18: rechaza nombres como numero', () => {
    const result = registerSchema.safeParse({
      nombres: 12345,
      apellidos: 'Garcia',
      email: 'carlos@test.com',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================
// loginSchema
// ============================================================
describe('loginSchema', () => {
  it('UNIT-AUTH-SCH-19: acepta credenciales validas', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      contrasena: 'password123',
    });
    expect(result.success).toBe(true);
  });

  it('UNIT-AUTH-SCH-20: rechaza email invalido', () => {
    const result = loginSchema.safeParse({
      email: 'not-email',
      contrasena: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-AUTH-SCH-21: rechaza contrasena vacia', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      contrasena: '',
    });
    expect(result.success).toBe(false);
  });

  it('UNIT-AUTH-SCH-22: rechaza objeto sin campos', () => {
    const result = loginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('UNIT-AUTH-SCH-23: rechaza null como input', () => {
    const result = loginSchema.safeParse(null);
    expect(result.success).toBe(false);
  });
});
