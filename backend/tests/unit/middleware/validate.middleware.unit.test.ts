/**
 * Unit Tests: Validate Middleware
 *
 * Pruebas unitarias para el middleware generico de validacion Zod.
 * Se usan schemas Zod reales pero mocks de Express req/res/next.
 */
import { validate } from '../../../src/middleware/validate.middleware';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Suppress console.error during tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterAll(() => {
  jest.restoreAllMocks();
});

// Helpers
function mockRequest(body: unknown = {}, params: unknown = {}, query: unknown = {}): Request {
  return {
    body,
    params,
    query,
    method: 'POST',
    originalUrl: '/test',
  } as Request;
}

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

// Test schema
const testSchema = z.object({
  name: z.string().min(2),
  age: z.number().int().min(0),
});

// ============================================================
// validate middleware
// ============================================================
describe('validate middleware', () => {
  it('UNIT-MW-VAL-01: llama next() con datos validos en body', () => {
    const middleware = validate(testSchema);
    const req = mockRequest({ name: 'Carlos', age: 25 });
    const res = mockResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('UNIT-MW-VAL-02: retorna 400 con datos invalidos en body', () => {
    const middleware = validate(testSchema);
    const req = mockRequest({ name: 'A', age: -1 });
    const res = mockResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        details: expect.any(Array),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('UNIT-MW-VAL-03: reemplaza body con datos parseados (limpios)', () => {
    const schemaWithTransform = z.object({
      email: z.string().email().toLowerCase(),
    });
    const middleware = validate(schemaWithTransform);
    const req = mockRequest({ email: 'TEST@EXAMPLE.COM' });
    const res = mockResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(req.body.email).toBe('test@example.com');
  });

  it('UNIT-MW-VAL-04: valida params cuando target es "params"', () => {
    const paramSchema = z.object({ id: z.string().uuid() });
    const middleware = validate(paramSchema, 'params');
    const req = mockRequest({}, { id: 'not-uuid' });
    const res = mockResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('UNIT-MW-VAL-05: valida query cuando target es "query"', () => {
    const querySchema = z.object({ page: z.string() });
    const middleware = validate(querySchema, 'query');
    const req = mockRequest({}, {}, { page: '1' });
    const res = mockResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('UNIT-MW-VAL-06: incluye detalles de campo en el error', () => {
    const middleware = validate(testSchema);
    const req = mockRequest({ name: 'A' }); // Missing age, name too short
    const res = mockResponse();
    const next = jest.fn();

    middleware(req, res, next);

    const jsonCall = (res.json as jest.Mock).mock.calls[0][0];
    expect(jsonCall.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ campo: 'name' }),
      ])
    );
  });

  it('UNIT-MW-VAL-07: llama next(err) para errores que no son ZodError', () => {
    // Create a schema that throws a non-Zod error
    const badSchema = {
      parse: () => { throw new Error('Unexpected error'); },
    } as unknown as z.ZodSchema;

    const middleware = validate(badSchema);
    const req = mockRequest({ name: 'Test' });
    const res = mockResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
  });

  it('UNIT-MW-VAL-08: maneja body vacio contra schema obligatorio', () => {
    const middleware = validate(testSchema);
    const req = mockRequest({});
    const res = mockResponse();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});
