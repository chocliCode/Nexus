import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkTab from '../components/classroom/WorkTab';
import * as reactQuery from '@tanstack/react-query';

// Mocks
vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useQuery: vi.fn(),
    useQueryClient: vi.fn(() => ({ invalidateQueries: vi.fn() })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      isPending: false
    })),
  };
});

describe('UI Component: WorkTab (Asignar Tarea)', () => {
  
  beforeEach(() => {
    // Mock vacio para posts
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({
      data: [],
      isLoading: false
    } as any);
  });

  it('UI-TSK-01: Muestra el formulario con selector de fecha para el rol Jedi', async () => {
    render(<WorkTab courseId="c1" isJedi={true} />);
    
    // El Jedi debe ver el formulario
    expect(screen.getByPlaceholderText(/Escribe una nueva tarea/i)).toBeInTheDocument();
    
    // Al ser tab de Tareas, debe exigir Fecha de Vencimiento
    expect(screen.getByText('Fecha de vencimiento')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publicar Tarea/i })).toBeInTheDocument();
  });

  it('UI-TSK-02: Previene inyeccion XSS visual en la descripcion', async () => {
    // Simulamos que el useQuery carga un post malicioso
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({
      data: [{
        publicacion_id: 'p1',
        tipo: 'TAREA',
        contenido: '<script>alert("xss")</script> <b>Texto Seguro</b>',
        fecha_creacion: new Date().toISOString(),
        fecha_vencimiento: new Date(Date.now() + 86400000).toISOString(),
        archivos: []
      }],
      isLoading: false
    } as any);

    render(<WorkTab courseId="c1" isJedi={false} />);
    
    // React escapa automaticamente. Esperamos ver el texto literal o el render seguro
    const postContainer = await screen.findByText(/Texto Seguro/i);
    expect(postContainer).toBeInTheDocument();
    
    // Verificamos que NO exista la etiqueta script en el DOM ejecutable (jsdom maneja esto o react lo escapa a literal)
    const scripts = document.getElementsByTagName('script');
    expect(scripts.length).toBe(0); 
  });

  it('UI-TSK-03: Bloquea envio si no se asigna fecha de vencimiento', async () => {
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, 'useMutation').mockReturnValue({ mutate: mockMutate, isPending: false } as any);

    render(<WorkTab courseId="c1" isJedi={true} />);
    
    const input = screen.getByPlaceholderText(/Escribe una nueva tarea/i);
    fireEvent.change(input, { target: { value: 'Tarea sin fecha' } });

    // Clic sin elegir fecha
    const submitBtn = screen.getByRole('button', { name: /Publicar Tarea/i });
    fireEvent.click(submitBtn);

    // Debe mostrar una alerta/toast en el UI pidiendo la fecha o no invocar la mutación
    // Dado que dependemos de react-hook-form o validacion local:
    await waitFor(() => {
      expect(mockMutate).not.toHaveBeenCalled();
    });
  });
});
