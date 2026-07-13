import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CoursesPage from '../pages/CoursesPage';
import * as useAuthHook from '../hooks/useAuth';
import * as reactQuery from '@tanstack/react-query';

// Mock dependencias
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('UI Component: CoursesPage (Crear Curso)', () => {

  beforeEach(() => {
    // Configuración base de mock: El usuario es un Jedi
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: { userId: '1', rol: 'Jedi', email: 'jedi@test.com' },
      token: 'mockToken',
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      loading: false,
    });
  });

  it('UI-CRS-01: Muestra el boton "Crear Curso" si el usuario es Jedi y lista vacia', () => {
    // Mock useQuery para que retorne lista vacía
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    renderWithRouter(<CoursesPage />);

    // El botón debe existir
    expect(screen.getByRole('button', { name: /Crear Curso/i })).toBeInTheDocument();
    // Mensaje de estado vacío
    expect(screen.getByText('No has creado ningún curso todavía')).toBeInTheDocument();
  });

  it('UI-CRS-02: Abre el modal y valida formulario vacio', async () => {
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({ data: [], isLoading: false } as any);
    renderWithRouter(<CoursesPage />);

    // Clic en crear curso
    fireEvent.click(screen.getByRole('button', { name: /Crear Curso/i }));

    // Clic en el submit del modal sin llenar datos
    const submitBtn = await screen.findByRole('button', { name: /Guardar Curso/i });
    fireEvent.click(submitBtn);

    // Debe mostrar error de titulo requerido (asumimos validación Zod en UI)
    await waitFor(() => {
      expect(screen.getByText(/El título es obligatorio/i)).toBeInTheDocument();
    });
  });

  it('UI-CRS-03: Permite enviar el formulario y llama a useMutation', async () => {
    vi.spyOn(reactQuery, 'useQuery').mockReturnValue({ data: [], isLoading: false } as any);
    
    const mockMutate = vi.fn();
    vi.spyOn(reactQuery, 'useMutation').mockReturnValue({
      mutate: mockMutate,
      isPending: false
    } as any);

    renderWithRouter(<CoursesPage />);

    fireEvent.click(screen.getByRole('button', { name: /Crear Curso/i }));

    const titleInput = await screen.findByLabelText(/Título/i);
    fireEvent.change(titleInput, { target: { value: 'Nuevo Curso Testing' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Curso/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Nuevo Curso Testing' }),
        expect.any(Object)
      );
    });
  });
});
