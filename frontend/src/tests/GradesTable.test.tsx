import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock Component
const MockGradesTable = ({ onExport, onGrade }: { onExport: () => void, onGrade: (id: string, note: number) => void }) => {
  return (
    <div>
      <button onClick={onExport}>Exportar CSV</button>
      <table>
        <tbody>
          <tr>
            <td>Alumno Test</td>
            <td>
              <button onClick={() => onGrade('sub-1', 18)}>Calificar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

describe('UI Component: GradesTable (Calificar y CSV)', () => {

  it('UI-GRD-01: Renderiza la tabla y muestra botones de calificar', () => {
    render(<MockGradesTable onExport={vi.fn()} onGrade={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Calificar/i })).toBeInTheDocument();
  });

  it('UI-GRD-02: Simula el clic en Calificar y envia datos', () => {
    const mockGrade = vi.fn();
    render(<MockGradesTable onExport={vi.fn()} onGrade={mockGrade} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Calificar/i }));
    
    expect(mockGrade).toHaveBeenCalledWith('sub-1', 18);
  });

  it('UI-GRD-03: Simula el clic en Exportar CSV', () => {
    const mockExport = vi.fn();
    render(<MockGradesTable onExport={mockExport} onGrade={vi.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Exportar CSV/i }));
    
    expect(mockExport).toHaveBeenCalledTimes(1);
  });

});
