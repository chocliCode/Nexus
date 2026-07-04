/**
 * Unit Tests: Error Middleware & HttpError
 *
 * Pruebas unitarias para el error handler global y la clase HttpError.
 * No depende de Express real ni base de datos.
 */
import { errorMiddleware, HttpError } from '../../../src/middleware/error.middleware';
import { Request, Response, NextFunction } from 'express';

// Helper to mock Response
function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// Suppress console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  jest.restoreAllMocks();
});

// ============================================================
// HttpError class
// ============================================================
describe('HttpError', () => {
  it('UNIT-ERR-01: crea un error con statusCode, message y code', () => {
    const err = new HttpError(404, 'No encontrado', 'NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe('No encontrado');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.name).toBe('HttpError');
  });

  it('UNIT-ERR-02: crea un error con details opcionales', () => {
    const details = { campo: 'email', razon: 'duplicado' };
    const err = new HttpError(409, 'Conflicto', 'DUPLICATE', details);
    expect(err.details).toEqual(details);
  });

  it('UNIT-ERR-03: es instancia de Error', () => {
    const err = new HttpError(500, 'Internal', 'INTERNAL');
    expect(err).toBeInstanceOf(Error);
  });

  it('UNIT-ERR-04: tiene stack trace', () => {
    const err = new HttpError(400, 'Bad request', 'BAD_REQUEST');
    expect(err.stack).toBeDefined();
  });

  it('UNIT-ERR-05: details es undefined cuando no se pasa', () => {
    const err = new HttpError(401, 'No auth', 'AUTH_REQUIRED');
    expect(err.details).toBeUndefined();
  });
});

// ============================================================
// errorMiddleware
// ============================================================
describe('errorMiddleware', () => {
  it('UNIT-ERR-06: retorna 500 para errores sin statusCode', () => {
    const err = new Error('Algo salio mal');
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    errorMiddleware(err as any, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR',
      })
    );
  });

  it('UNIT-ERR-07: usa el statusCode del error si existe', () => {
    const err = new HttpError(422, 'Entidad no procesable', 'UNPROCESSABLE');
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    errorMiddleware(err as any, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
  });

  it('UNIT-ERR-08: incluye correlationId en la respuesta', () => {
    const err = new Error('Test error');
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    errorMiddleware(err as any, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: expect.any(String),
      })
    );
  });

  it('UNIT-ERR-09: usa el code del error si existe', () => {
    const err = new HttpError(403, 'Prohibido', 'FORBIDDEN');
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    errorMiddleware(err as any, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'FORBIDDEN' })
    );
  });

  it('UNIT-ERR-10: no expone message real en errores 500', () => {
    const err = new Error('Database connection failed: password=abc123');
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    errorMiddleware(err as any, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Error interno del servidor', // Mensaje generico, no el real
      })
    );
  });

  it('UNIT-ERR-11: expone message en errores que no son 500', () => {
    const err = new HttpError(400, 'Datos invalidos', 'VALIDATION');
    const req = {} as Request;
    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    errorMiddleware(err as any, req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Datos invalidos', // Mensaje real para errores del cliente
      })
    );
  });

  it('UNIT-ERR-12: genera correlationId unico por cada error', () => {
    const correlationIds: string[] = [];
    const req = {} as Request;
    const next = jest.fn() as NextFunction;

    for (let i = 0; i < 3; i++) {
      const res = mockResponse();
      errorMiddleware(new Error(`Error ${i}`) as any, req, res, next);
      const call = (res.json as jest.Mock).mock.calls[0][0];
      correlationIds.push(call.correlationId);
    }

    // All IDs should be unique
    const unique = new Set(correlationIds);
    expect(unique.size).toBe(3);
  });
});
