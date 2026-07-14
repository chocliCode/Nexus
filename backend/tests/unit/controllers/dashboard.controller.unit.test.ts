import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { getDashboard, getAdminDashboardStats } from '../../../src/controllers/dashboard.controller';
import { AuthRequest } from '../../../src/types';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

describe('Dashboard Controller (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'u1', email: 'test@test.com', rol: 'Padawan' },
      body: {},
      params: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('retorna 401 si no autenticado', async () => {
      mockReq.user = undefined;
      await getDashboard(mockReq as AuthRequest, mockRes as Response, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('retorna dashboard exitosamente', async () => {
      // scoreResult
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ score_empleabilidad: 80 }] });
      // okrsResult
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ okr_id: 'o1' }] });
      // sessionsResult
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ sesion_id: 's1' }] });
      // statsResult
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ okrs_completados: 1, sesiones_realizadas: 1, total_habilidades: 5 }] });
      // evalResult
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ nivel_general: 'Avanzado' }] });
      // pathResult
      (pool.query as jest.Mock).mockResolvedValueOnce({ rows: [{ titulo: 'Frontend Path' }] });

      await getDashboard(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          score_empleabilidad: 80,
          okrs_activos: [{ okr_id: 'o1' }],
          proximas_sesiones: [{ sesion_id: 's1' }],
          stats: { okrs_completados: 1, sesiones_realizadas: 1, total_habilidades: 5 },
          onboarding: {
            evaluacion_completada: true,
            nivel_general: 'Avanzado',
            learning_path_generado: true,
            learning_path_titulo: 'Frontend Path'
          }
        })
      }));
    });
  });

  describe('getAdminDashboardStats', () => {
    it('retorna estadisticas de admin exitosamente', async () => {
      (pool.query as jest.Mock).mockResolvedValueOnce({ 
        rows: [{ 
          total_padawans: '10', 
          total_jedis: '5', 
          total_vacantes: '20', 
          total_sesiones: '50' 
        }] 
      });

      await getAdminDashboardStats(mockReq as AuthRequest, mockRes as Response, mockNext);
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total_padawans: 10,
          total_jedis: 5,
          total_vacantes: 20,
          total_sesiones: 50
        }
      });
    });
  });
});
