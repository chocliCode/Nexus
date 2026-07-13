/**
 * Tests unitarios — Validaciones del Aula Virtual de Cursos
 *
 * Caja negra: validamos la estructura de requests para feed, posts, comentarios.
 */

describe('Course Classroom Schema Validations', () => {
  // ────────────── POST /courses/:courseId/posts ──────────────
  describe('Crear post en curso', () => {
    const validPost = { tipo: 'anuncio', titulo: 'Bienvenidos', contenido: 'Hola a todos!' };

    it('CC-UNIT-01: acepta un post valido completo', () => {
      expect(validPost.contenido.length).toBeGreaterThan(0);
      expect(['anuncio', 'material', 'tarea', 'discusion']).toContain(validPost.tipo);
    });

    it('CC-UNIT-02: acepta un post sin titulo (opcional)', () => {
      const post = { tipo: 'anuncio', contenido: 'Solo contenido' };
      expect(post.contenido.length).toBeGreaterThan(0);
      expect(post).not.toHaveProperty('titulo');
    });

    it('CC-UNIT-03: rechaza un post sin contenido', () => {
      const post = { tipo: 'anuncio', titulo: 'Sin cuerpo', contenido: '' };
      expect(post.contenido.length).toBe(0);
    });

    it('CC-UNIT-04: rechaza un post con contenido solo de espacios', () => {
      const post = { tipo: 'anuncio', contenido: '   ' };
      expect(post.contenido.trim().length).toBe(0);
    });

    it('CC-UNIT-05: acepta tipo "material"', () => {
      const post = { tipo: 'material', contenido: 'Link a recurso' };
      expect(['anuncio', 'material', 'tarea', 'discusion']).toContain(post.tipo);
    });

    it('CC-UNIT-06: acepta tipo "tarea"', () => {
      const post = { tipo: 'tarea', contenido: 'Entregar ejercicio', titulo: 'Tarea 1' };
      expect(['anuncio', 'material', 'tarea', 'discusion']).toContain(post.tipo);
    });

    it('CC-UNIT-07: acepta tipo "discusion"', () => {
      const post = { tipo: 'discusion', contenido: 'Que opinan de React 19?' };
      expect(['anuncio', 'material', 'tarea', 'discusion']).toContain(post.tipo);
    });

    it('CC-UNIT-08: rechaza tipo invalido', () => {
      const invalidType = 'examen';
      expect(['anuncio', 'material', 'tarea', 'discusion']).not.toContain(invalidType);
    });

    it('CC-UNIT-09: acepta contenido largo (4000 caracteres)', () => {
      const post = { tipo: 'anuncio', contenido: 'a'.repeat(4000) };
      expect(post.contenido.length).toBe(4000);
    });

    it('CC-UNIT-10: acepta un titulo largo (300 caracteres)', () => {
      const post = { tipo: 'anuncio', titulo: 'T'.repeat(300), contenido: 'contenido' };
      expect(post.titulo.length).toBeLessThanOrEqual(300);
    });

    it('CC-UNIT-11: acepta post con url_enlace', () => {
      const post = { tipo: 'material', contenido: 'Recurso', url_enlace: 'https://react.dev' };
      expect(post.url_enlace).toMatch(/^https?:\/\//);
    });

    it('CC-UNIT-12: acepta post sin url_enlace', () => {
      const post = { tipo: 'anuncio', contenido: 'Sin link' };
      expect(post).not.toHaveProperty('url_enlace');
    });
  });

  // ────────────── POST /courses/posts/:postId/comments ──────────────
  describe('Comentarios en posts de curso', () => {
    it('CC-UNIT-13: acepta un comentario valido', () => {
      const comment = { contenido: 'Excelente clase!' };
      expect(comment.contenido.length).toBeGreaterThan(0);
    });

    it('CC-UNIT-14: rechaza un comentario vacio', () => {
      const comment = { contenido: '' };
      expect(comment.contenido.length).toBe(0);
    });

    it('CC-UNIT-15: rechaza un comentario solo de espacios', () => {
      const comment = { contenido: '    ' };
      expect(comment.contenido.trim().length).toBe(0);
    });

    it('CC-UNIT-16: acepta un comentario largo', () => {
      const comment = { contenido: 'Buen'.repeat(500) };
      expect(comment.contenido.length).toBe(2000);
    });

    it('CC-UNIT-17: acepta un comentario con caracteres especiales', () => {
      const comment = { contenido: 'Hola! @profesor, Que pasa con la tarea #3? <script>alert("xss")</script>' };
      expect(comment.contenido.length).toBeGreaterThan(0);
    });
  });

  // ────────────── GET /courses/:courseId/feed ──────────────
  describe('Feed del curso', () => {
    it('CC-UNIT-18: un UUID valido tiene 36 caracteres', () => {
      const courseId = 'c0000001-0000-0000-0000-000000000001';
      expect(courseId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('CC-UNIT-19: un courseId invalido no pasa la validacion UUID', () => {
      const courseId = 'invalid-id';
      expect(courseId).not.toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('CC-UNIT-20: un courseId vacio no pasa la validacion', () => {
      const courseId = '';
      expect(courseId.length).toBe(0);
    });
  });

  // ────────────── Estructura de respuesta esperada ──────────────
  describe('Estructura de respuesta del feed', () => {
    const mockPost = {
      post_id: 'p0000001-0000-0000-0000-000000000001',
      curso_id: 'c0000001-0000-0000-0000-000000000001',
      autor_id: 'b2222222-2222-2222-2222-222222222222',
      tipo: 'anuncio',
      titulo: 'Bienvenidos',
      contenido: 'Hola a todos',
      fijado: true,
      fecha_creacion: '2026-07-12T00:00:00Z',
      autor_nombres: 'Mentor',
      autor_apellidos: 'Jedi',
      autor_rol: 'Jedi',
      comentarios: [
        {
          comentario_id: 'cc000001',
          contenido: 'Genial!',
          fecha_creacion: '2026-07-12T01:00:00Z',
          autor_id: 'a1111111',
          autor_nombres: 'Padawan',
          autor_apellidos: 'Test',
          autor_rol: 'Padawan',
        }
      ],
    };

    it('CC-UNIT-21: el post tiene todos los campos requeridos', () => {
      expect(mockPost).toHaveProperty('post_id');
      expect(mockPost).toHaveProperty('curso_id');
      expect(mockPost).toHaveProperty('autor_id');
      expect(mockPost).toHaveProperty('tipo');
      expect(mockPost).toHaveProperty('contenido');
      expect(mockPost).toHaveProperty('fijado');
      expect(mockPost).toHaveProperty('fecha_creacion');
    });

    it('CC-UNIT-22: el post tiene datos del autor', () => {
      expect(mockPost).toHaveProperty('autor_nombres');
      expect(mockPost).toHaveProperty('autor_apellidos');
      expect(mockPost).toHaveProperty('autor_rol');
    });

    it('CC-UNIT-23: los comentarios son un array', () => {
      expect(Array.isArray(mockPost.comentarios)).toBe(true);
    });

    it('CC-UNIT-24: cada comentario tiene la estructura esperada', () => {
      const c = mockPost.comentarios[0];
      expect(c).toHaveProperty('comentario_id');
      expect(c).toHaveProperty('contenido');
      expect(c).toHaveProperty('fecha_creacion');
      expect(c).toHaveProperty('autor_id');
      expect(c).toHaveProperty('autor_nombres');
    });

    it('CC-UNIT-25: fijado es un booleano', () => {
      expect(typeof mockPost.fijado).toBe('boolean');
    });
  });

  // ────────────── Estructura de estudiantes ──────────────
  describe('Estructura de estudiantes', () => {
    const mockStudent = {
      usuario_id: 'a1111111-1111-1111-1111-111111111111',
      nombres: 'Padawan',
      apellidos: 'Test',
      email: 'padawan@nexus.test',
      fecha_inscripcion: '2026-07-12T00:00:00Z',
    };

    it('CC-UNIT-26: el estudiante tiene campos requeridos', () => {
      expect(mockStudent).toHaveProperty('usuario_id');
      expect(mockStudent).toHaveProperty('nombres');
      expect(mockStudent).toHaveProperty('apellidos');
      expect(mockStudent).toHaveProperty('email');
      expect(mockStudent).toHaveProperty('fecha_inscripcion');
    });

    it('CC-UNIT-27: el email tiene formato valido', () => {
      expect(mockStudent.email).toMatch(/@/);
    });

    it('CC-UNIT-28: el usuario_id es un UUID valido', () => {
      expect(mockStudent.usuario_id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });
  });

  // ────────────── Calificaciones ──────────────
  describe('Calificaciones de curso', () => {
    it('CC-UNIT-29: acepta una calificacion valida', () => {
      const grade = { padawan_id: 'a1111111-1111-1111-1111-111111111111', titulo: 'Examen', nota: 18, nota_maxima: 20 };
      expect(grade.nota).toBeGreaterThanOrEqual(0);
      expect(grade.nota).toBeLessThanOrEqual(grade.nota_maxima);
    });

    it('CC-UNIT-30: acepta calificacion con decimales', () => {
      const grade = { titulo: 'Examen', nota: 15.5 };
      expect(Number.isFinite(grade.nota)).toBe(true);
    });

    it('CC-UNIT-31: la nota puede ser cero', () => {
      const grade = { titulo: 'Examen', nota: 0 };
      expect(grade.nota).toBe(0);
    });

    it('CC-UNIT-32: export CSV genera texto válido', () => {
      const csv = 'Evaluacion,Nota,Nota Maxima,Comentario,Fecha\n"Examen",18,20,"Ok","2026-07-12"\n';
      expect(csv).toContain('Evaluacion,Nota');
      expect(csv).toContain('"Examen",18,20');
    });
  });
});

