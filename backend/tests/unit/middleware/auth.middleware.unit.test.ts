/**
 * Unit Tests: Auth Middleware
 *
 * Pruebas unitarias para authMiddleware y requireRole.
 * Se mockea jsonwebtoken para aislar la logica del middleware.
 * No se usa Express real ni base de datos.
 */
import jwt from 'jsonwebtoken';
import { authMiddleware, requireRole } from '../../../src/middleware/auth.middleware';
import { AuthRequest, JwtPayload } from '../../../src/types';
import { Response, NextFunction } from 'express';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');
const mockedJwt = jest.mocked(jwt);

// Helpers to create mock req/res/next
function mockRequest(overrides: Partial<AuthRequest> = {}): AuthRequest {
  return {
    headers: {},
    ...overrides,
  } as AuthRequest;
}

function mockResponse(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function mockNext(): NextFunction {
  return jest.fn();
}

// ============================================================
// authMiddleware
// ============================================================
describe('authMiddleware', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('UNIT-MW-AUTH-01: llama next() con token valido', () => {
    const payload: JwtPayload = { userId: 'u1', email: 'test@test.com', rol: 'Padawan' };
    mockedJwt.verify.mockReturnValue(payload as any);

    const req = mockRequest({ headers: { authorization: 'Bearer valid-token' } });
    const res = mockResponse();
    const next = mockNext();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('valid-token', expect.any(String));
    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('UNIT-MW-AUTH-02: retorna 401 sin header Authorization', () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = mockNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_REQUIRED' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('UNIT-MW-AUTH-03: retorna 401 con header que no empieza con "Bearer "', () => {
    const req = mockRequest({ headers: { authorization: 'Basic abc123' } });
    const res = mockResponse();
    const next = mockNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_REQUIRED' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('UNIT-MW-AUTH-04: retorna 401 con token invalido (jwt.verify lanza error)', () => {
    mockedJwt.verify.mockImplementation(() => {
      throw new Error('jwt malformed');
    });

    const req = mockRequest({ headers: { authorization: 'Bearer invalid-token' } });
    const res = mockResponse();
    const next = mockNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INVALID_TOKEN' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('UNIT-MW-AUTH-05: retorna 401 con token expirado', () => {
    mockedJwt.verify.mockImplementation(() => {
      throw new Error('jwt expired');
    });

    const req = mockRequest({ headers: { authorization: 'Bearer expired-token' } });
    const res = mockResponse();
    const next = mockNext();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INVALID_TOKEN' })
    );
  });

  it('UNIT-MW-AUTH-06: extrae el token correctamente del header', () => {
    const payload: JwtPayload = { userId: 'u1', email: 'test@test.com', rol: 'Jedi' };
    mockedJwt.verify.mockReturnValue(payload as any);

    const req = mockRequest({ headers: { authorization: 'Bearer my-special-token-123' } });
    const res = mockResponse();
    const next = mockNext();

    authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith('my-special-token-123', expect.any(String));
  });

  it('UNIT-MW-AUTH-07: setea req.user con el payload decodificado', () => {
    const payload: JwtPayload = { userId: 'user-id-99', email: 'admin@nexus.com', rol: 'Admin' };
    mockedJwt.verify.mockReturnValue(payload as any);

    const req = mockRequest({ headers: { authorization: 'Bearer token' } });
    const res = mockResponse();
    const next = mockNext();

    authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user?.userId).toBe('user-id-99');
    expect(req.user?.email).toBe('admin@nexus.com');
    expect(req.user?.rol).toBe('Admin');
  });

  it('UNIT-MW-AUTH-08: retorna 401 con header "Bearer " sin token', () => {
    const req = mockRequest({ headers: { authorization: 'Bearer ' } });
    const res = mockResponse();
    const next = mockNext();

    // jwt.verify with empty string should throw
    mockedJwt.verify.mockImplementation(() => {
      throw new Error('jwt must be provided');
    });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ============================================================
// requireRole
// ============================================================
describe('requireRole', () => {
  it('UNIT-MW-ROLE-01: permite acceso cuando el rol esta en la lista', () => {
    const middleware = requireRole('Padawan', 'Jedi');
    const req = mockRequest();
    req.user = { userId: 'u1', email: 'test@test.com', rol: 'Padawan' };
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('UNIT-MW-ROLE-02: retorna 403 cuando el rol NO esta en la lista', () => {
    const middleware = requireRole('Admin');
    const req = mockRequest();
    req.user = { userId: 'u1', email: 'test@test.com', rol: 'Padawan' };
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'FORBIDDEN',
        details: expect.objectContaining({
          rolActual: 'Padawan',
          rolesPermitidos: ['Admin'],
        }),
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('UNIT-MW-ROLE-03: retorna 401 si req.user no existe', () => {
    const middleware = requireRole('Padawan');
    const req = mockRequest();
    // req.user is undefined
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_REQUIRED' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('UNIT-MW-ROLE-04: permite acceso con rol Admin cuando se requiere Admin', () => {
    const middleware = requireRole('Admin');
    const req = mockRequest();
    req.user = { userId: 'u1', email: 'admin@test.com', rol: 'Admin' };
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('UNIT-MW-ROLE-05: permite cuando se aceptan multiples roles (Jedi o Admin)', () => {
    const middleware = requireRole('Jedi', 'Admin');
    const req = mockRequest();
    req.user = { userId: 'u1', email: 'jedi@test.com', rol: 'Jedi' };
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('UNIT-MW-ROLE-06: incluye roles permitidos en el detalle del error 403', () => {
    const middleware = requireRole('Jedi', 'Admin');
    const req = mockRequest();
    req.user = { userId: 'u1', email: 'pad@test.com', rol: 'Padawan' };
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        details: expect.objectContaining({
          rolesPermitidos: ['Jedi', 'Admin'],
        }),
      })
    );
  });
});
