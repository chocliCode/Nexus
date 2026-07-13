import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../../src/db/pool';
import { login } from '../../../src/controllers/auth.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
  connect: jest.fn(),
  on: jest.fn(),
}));

describe('Auth Controller - Login (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      body: {
        email: 'test@nexus.test',
        contrasena: 'password123',
      },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('UNIT-AUTH-CTRL-01: retorna 401 si el usuario no existe', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });

    await login(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(pool.query).toHaveBeenCalledWith(
      expect.any(String),
      ['test@nexus.test']
    );
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Credenciales inválidas',
      code: 'INVALID_CREDENTIALS',
    });
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('UNIT-AUTH-CTRL-02: retorna 401 si la contraseña es incorrecta', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          usuario_id: '123',
          email: 'test@nexus.test',
          contrasena_hash: 'hashed_password',
          rol: 'Padawan',
          activo: true,
        },
      ],
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    await login(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Credenciales inválidas',
      code: 'INVALID_CREDENTIALS',
    });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('UNIT-AUTH-CTRL-03: retorna 200 y JWT si las credenciales son correctas', async () => {
    (pool.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          usuario_id: '123',
          email: 'test@nexus.test',
          contrasena_hash: 'hashed_password',
          rol: 'Padawan',
          activo: true,
          nombres: 'Test',
          apellidos: 'User',
        },
      ],
    });
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    (jwt.sign as jest.Mock).mockReturnValue('mocked_jwt_token');

    await login(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(jwt.sign).toHaveBeenCalledWith(
      { userId: '123', email: 'test@nexus.test', rol: 'Padawan' },
      expect.any(String),
      { expiresIn: '24h' }
    );
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      data: {
        token: 'mocked_jwt_token',
        user: {
          usuario_id: '123',
          nombres: 'Test',
          apellidos: 'User',
          email: 'test@nexus.test',
          rol: 'Padawan',
        },
      },
    });
  });

  it('UNIT-AUTH-CTRL-04: invoca next con el error si la BD falla repentinamente', async () => {
    const errorBD = new Error('Database connection failed');
    (pool.query as jest.Mock).mockRejectedValueOnce(errorBD);

    await login(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(errorBD);
    expect(mockRes.status).not.toHaveBeenCalled();
    expect(mockRes.json).not.toHaveBeenCalled();
  });
});
