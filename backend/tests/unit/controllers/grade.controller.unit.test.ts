import { Response, NextFunction } from 'express';
import pool from '../../../src/db/pool';
import { gradeSubmission, exportCourseGrades } from '../../../src/controllers/course-classroom.controller';
import { AuthRequest } from '../../../src/types';
import { format } from 'fast-csv';

jest.mock('../../../src/db/pool', () => ({
  query: jest.fn(),
}));

jest.mock('fast-csv', () => ({
  format: jest.fn(() => ({
    pipe: jest.fn(),
    write: jest.fn(),
    end: jest.fn()
  }))
}));

describe('Course Classroom Controller - Calificaciones (Unit Tests)', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      user: { userId: 'jedi123', email: 'jedi@nexus.test', rol: 'Jedi' },
      params: { submissionId: 'sub-1', courseId: 'curso1' },
      body: { nota: 18, feedback_mentor: 'Buen trabajo' }
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('UNIT-GRD-01: Procesa la calificacion y devuelve 200', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ jedi_id: 'jedi123' }] }) // Owner check
      .mockResolvedValueOnce({ rows: [{ entrega_id: 'sub-1', calificacion: 18 }] }); // Update

    await gradeSubmission(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(pool.query).toHaveBeenCalledTimes(2);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('UNIT-GRD-02: exportCourseGrades establece cabeceras CSV correctas', async () => {
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ jedi_id: 'jedi123' }] }) // Owner check
      .mockResolvedValueOnce({ rows: [{ alumno: 'Test', nota: 18 }] }); // Data

    await exportCourseGrades(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Content-Disposition',
      expect.stringContaining('attachment; filename="notas_curso_curso1.csv"')
    );
  });

  it('UNIT-GRD-03: Atrapa error si DB rechaza por calificacion negativa (Constraint)', async () => {
    const errorDB = new Error('check_calificacion_constraint');
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ jedi_id: 'jedi123' }] }) // Owner check
      .mockRejectedValueOnce(errorDB); // Update falla

    await gradeSubmission(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(errorDB);
  });

  it('UNIT-GRD-04: escapa valores para prevenir inyeccion CSV', async () => {
    const sendMock = jest.fn();
    mockRes.send = sendMock;
    
    (pool.query as jest.Mock)
      .mockResolvedValueOnce({ rows: [{ jedi_id: 'jedi123' }] }) // verifyCourseAccess
      .mockResolvedValueOnce({ rows: [
        { Tarea: '=cmd|/c calc.exe!A0', Estudiante: '+Hack', Calificacion: 18, Feedback: '@sum' }
      ] });

    await exportCourseGrades(mockReq as AuthRequest, mockRes as Response, mockNext);

    expect(sendMock).toHaveBeenCalled();
    const csvContent = sendMock.mock.calls[0][0].toString();
    // Debe haber un caracter de escape simple al principio
    expect(csvContent).toContain(`"'=cmd|/c calc.exe!A0"`);
    expect(csvContent).toContain(`"'+Hack"`);
    expect(csvContent).toContain(`"'@sum"`);
  });
});
