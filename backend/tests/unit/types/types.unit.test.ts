/**
 * Unit Tests: TypeScript Types & Interfaces
 *
 * Pruebas unitarias que verifican la correcta definicion de los tipos
 * e interfaces del sistema. Validan que los objetos conforman
 * con las interfaces definidas en types/index.ts.
 *
 * Estas pruebas son de "type safety" -- verifican que la estructura
 * de los datos es correcta en runtime usando validaciones manuales.
 */
import type {
  Rol,
  Usuario,
  JwtPayload,
  PerfilAprendiz,
  Mentor,
  CategoriaHabilidad,
  NivelHabilidad,
  EstadoMatching,
  EstadoSesion,
  EstadoOKR,
  Modalidad,
  OKR,
  Vacante,
} from '../../../src/types';

// ============================================================
// Roles & Enums
// ============================================================
describe('Rol type', () => {
  it('UNIT-TYPE-01: Padawan es un rol valido', () => {
    const rol: Rol = 'Padawan';
    expect(rol).toBe('Padawan');
  });

  it('UNIT-TYPE-02: Jedi es un rol valido', () => {
    const rol: Rol = 'Jedi';
    expect(rol).toBe('Jedi');
  });

  it('UNIT-TYPE-03: Admin es un rol valido', () => {
    const rol: Rol = 'Admin';
    expect(rol).toBe('Admin');
  });
});

describe('EstadoOKR type', () => {
  it('UNIT-TYPE-04: contiene los 4 estados validos', () => {
    const estados: EstadoOKR[] = ['Pendiente', 'EnProgreso', 'Completado', 'Cancelado'];
    expect(estados).toHaveLength(4);
    expect(estados).toContain('Pendiente');
    expect(estados).toContain('EnProgreso');
    expect(estados).toContain('Completado');
    expect(estados).toContain('Cancelado');
  });
});

describe('EstadoSesion type', () => {
  it('UNIT-TYPE-05: contiene los 3 estados validos', () => {
    const estados: EstadoSesion[] = ['Programada', 'Realizada', 'Cancelada'];
    expect(estados).toHaveLength(3);
  });
});

describe('EstadoMatching type', () => {
  it('UNIT-TYPE-06: contiene los 3 estados validos', () => {
    const estados: EstadoMatching[] = ['Activo', 'Completado', 'Cancelado'];
    expect(estados).toHaveLength(3);
  });
});

describe('Modalidad type', () => {
  it('UNIT-TYPE-07: contiene las 3 modalidades validas', () => {
    const modalidades: Modalidad[] = ['Presencial', 'Remoto', 'Hibrido'];
    expect(modalidades).toHaveLength(3);
  });
});

describe('CategoriaHabilidad type', () => {
  it('UNIT-TYPE-08: contiene las 3 categorias', () => {
    const categorias: CategoriaHabilidad[] = ['Tecnica', 'Blanda', 'Certificacion'];
    expect(categorias).toHaveLength(3);
  });
});

describe('NivelHabilidad type', () => {
  it('UNIT-TYPE-09: contiene los 3 niveles', () => {
    const niveles: NivelHabilidad[] = ['Basico', 'Intermedio', 'Avanzado'];
    expect(niveles).toHaveLength(3);
  });
});

// ============================================================
// Interface structure validation
// ============================================================
describe('JwtPayload interface', () => {
  it('UNIT-TYPE-10: tiene userId, email y rol', () => {
    const payload: JwtPayload = {
      userId: 'abc-123',
      email: 'test@nexus.com',
      rol: 'Padawan',
    };
    expect(payload.userId).toBeDefined();
    expect(payload.email).toBeDefined();
    expect(payload.rol).toBeDefined();
  });
});

describe('OKR interface', () => {
  it('UNIT-TYPE-11: estructura completa de un OKR', () => {
    const okr: OKR = {
      okr_id: 'okr-1',
      sesion_id: 'ses-1',
      descripcion: 'Completar 3 PRs',
      indicador: 'Pull requests merged',
      valor_meta: 3,
      valor_actual: 1,
      estado: 'EnProgreso',
      fecha_limite: new Date('2026-12-31'),
      fecha_actualizacion: new Date(),
    };
    expect(okr.okr_id).toBe('okr-1');
    expect(okr.estado).toBe('EnProgreso');
    expect(okr.indicador).toBe('Pull requests merged');
  });

  it('UNIT-TYPE-12: OKR acepta indicador null', () => {
    const okr: OKR = {
      okr_id: 'okr-2',
      sesion_id: 'ses-1',
      descripcion: 'Sin indicador',
      indicador: null,
      valor_meta: 1,
      valor_actual: 0,
      estado: 'Pendiente',
      fecha_limite: null,
      fecha_actualizacion: new Date(),
    };
    expect(okr.indicador).toBeNull();
    expect(okr.fecha_limite).toBeNull();
  });
});

describe('Vacante interface', () => {
  it('UNIT-TYPE-13: estructura completa de una vacante', () => {
    const vacante: Vacante = {
      vacante_id: 'vac-1',
      empresa_id: 'emp-1',
      titulo: 'Frontend Developer',
      descripcion: 'React + TypeScript',
      salario_min: 3000,
      salario_max: 5000,
      modalidad: 'Remoto',
      fecha_publicacion: new Date(),
      activa: true,
    };
    expect(vacante.modalidad).toBe('Remoto');
    expect(vacante.activa).toBe(true);
  });
});

describe('PerfilAprendiz interface', () => {
  it('UNIT-TYPE-14: score_empleabilidad acepta valores numericos', () => {
    const perfil: PerfilAprendiz = {
      perfil_id: 'p-1',
      usuario_id: 'u-1',
      resumen_bio: null,
      score_empleabilidad: 45.5,
      url_portafolio: null,
      fecha_actualizacion: new Date(),
    };
    expect(perfil.score_empleabilidad).toBe(45.5);
    expect(perfil.resumen_bio).toBeNull();
  });
});

describe('Mentor interface', () => {
  it('UNIT-TYPE-15: estructura completa de un mentor', () => {
    const mentor: Mentor = {
      mentor_id: 'm-1',
      usuario_id: 'u-1',
      especialidades: 'React, Node.js',
      anios_experiencia: 5,
      calificacion_promedio: 4.8,
      disponibilidad: { lunes: '09:00-17:00' },
      bio_profesional: 'Senior developer',
    };
    expect(mentor.anios_experiencia).toBe(5);
    expect(mentor.disponibilidad).toEqual({ lunes: '09:00-17:00' });
  });
});
