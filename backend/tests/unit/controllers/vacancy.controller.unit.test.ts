import { Request, Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { 
  listVacancies, getVacancy, createVacancy, updateVacancy, applyToVacancy, getMyApplications 
} from '../../../src/controllers/vacancy.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

describe('Vacancy Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'u1', email: 'u1@test.com', rol: 'Padawan' },
      body: {},
      params: {},
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('listVacancies', () => {
    it('lista vacantes sin modalidad', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ vacante_id: 'v1' }] });
      await listVacancies(mockReq as Request, mockRes as Response, mockNext);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY'), []);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('lista vacantes con modalidad', async () => {
      mockReq.query = { modalidad: 'Remoto' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ vacante_id: 'v1' }] });
      await listVacancies(mockReq as Request, mockRes as Response, mockNext);
      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('v.modalidad = $1'), ['Remoto']);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('getVacancy', () => {
    it('retorna 404 si vacante no existe', async () => {
      mockReq.params = { vacancyId: 'v1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await getVacancy(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna vacante', async () => {
      mockReq.params = { vacancyId: 'v1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ vacante_id: 'v1' }] });
      await getVacancy(mockReq as Request, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('createVacancy', () => {
    it('crea vacante', async () => {
      mockReq.body = { titulo: 't1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ vacante_id: 'v1' }] });
      await createVacancy(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateVacancy', () => {
    it('retorna 400 si no hay campos', async () => {
      mockReq.params = { vacancyId: 'v1' };
      mockReq.body = {};
      await updateVacancy(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('retorna 404 si no existe', async () => {
      mockReq.params = { vacancyId: 'v1' };
      mockReq.body = { titulo: 't2' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
      await updateVacancy(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('actualiza vacante', async () => {
      mockReq.params = { vacancyId: 'v1' };
      mockReq.body = { titulo: 't2' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ vacante_id: 'v1' }] });
      await updateVacancy(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('applyToVacancy', () => {
    it('retorna 404 si no existe', async () => {
      mockReq.params = { vacancyId: 'v1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // vacancy check
      await applyToVacancy(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('retorna 409 si ya postulo', async () => {
      mockReq.params = { vacancyId: 'v1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ vacante_id: 'v1' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ postulacion_id: 'p1' }] }); // existing
      await applyToVacancy(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('postula exitosamente', async () => {
      mockReq.params = { vacancyId: 'v1' };
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ vacante_id: 'v1' }] }); // check
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [] }); // existing
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ postulacion_id: 'p1' }] }); // insert
      await applyToVacancy(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('getMyApplications', () => {
    it('retorna mis postulaciones', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ postulacion_id: 'p1' }] });
      await getMyApplications(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
