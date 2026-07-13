import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
// Simulamos un componente simplificado "UploadForm" que suele usarse en estas vistas
import React, { useState } from 'react';

// === Mock Component for Testing ===
const MockUploadForm = ({ onSubmit }: { onSubmit: (file: File) => void }) => {
  const [error, setError] = useState('');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo supera los 5MB');
      return;
    }
    setError('');
    onSubmit(file);
  };

  return (
    <div>
      <input 
        type="file" 
        data-testid="file-upload" 
        accept=".pdf" 
        onChange={handleFileChange} 
      />
      {error && <div role="alert">{error}</div>}
    </div>
  );
};

describe('UI Component: UploadPDF (Subida de Tareas)', () => {

  it('UI-PDF-01: El input de archivo esta restringido a accept=".pdf"', () => {
    render(<MockUploadForm onSubmit={vi.fn()} />);
    const fileInput = screen.getByTestId('file-upload');
    
    expect(fileInput).toHaveAttribute('accept', '.pdf');
  });

  it('UI-PDF-02: Muestra error si el archivo supera 5MB', async () => {
    render(<MockUploadForm onSubmit={vi.fn()} />);
    const fileInput = screen.getByTestId('file-upload');

    // Crear un mock file gigante
    const fakeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'giant.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [fakeFile] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('El archivo supera los 5MB');
    });
  });

  it('UI-PDF-03: Rechaza si el archivo no es PDF (Mime validation frontend)', async () => {
    const mockSubmit = vi.fn();
    render(<MockUploadForm onSubmit={mockSubmit} />);
    const fileInput = screen.getByTestId('file-upload');

    const fakeImage = new File(['image_content'], 'virus.exe', { type: 'application/x-msdownload' });

    fireEvent.change(fileInput, { target: { files: [fakeImage] } });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Solo se permiten archivos PDF');
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

});
