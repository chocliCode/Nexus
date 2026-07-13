import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import CoursesPage from '../pages/CoursesPage';
import * as useAuthHook from '../hooks/useAuth';
import { courseService } from '../services/api';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../services/api', () => ({
  courseService: {
    list: vi.fn(),
    mine: vi.fn(),
    create: vi.fn(),
  }
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('UI Component: CoursesPage (Crear Curso)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: { usuario_id: '1', rol: 'Jedi', email: 'jedi@test.com' },
      token: 'mockToken',
      login: vi.fn(),
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      loading: false,
    });
  });

  it('UI-CRS-01: Muestra el boton "Crear Curso" si el usuario es Jedi y lista vacia', async () => {
    vi.mocked(courseService.list).mockResolvedValue({ data: { data: [] } } as never);
    vi.mocked(courseService.mine).mockResolvedValue({ data: { data: [] } } as never);

    renderWithRouter(<CoursesPage />);

    await waitFor(() => {
        expect(screen.getByText('No has creado ningún curso')).toBeInTheDocument();
    });

    const createBtns = screen.getAllByText(/Crear Curso/i);
    expect(createBtns.length).toBeGreaterThan(0);
  });

  it('UI-CRS-02: Abre el modal y valida el formulario', async () => {
    vi.mocked(courseService.list).mockResolvedValue({ data: { data: [] } } as never);
    vi.mocked(courseService.mine).mockResolvedValue({ data: { data: [] } } as never);
    renderWithRouter(<CoursesPage />);

    await waitFor(() => {
        expect(screen.getByText('No has creado ningún curso')).toBeInTheDocument();
    });

    // Clic en crear curso
    const openModalBtn = document.getElementById('btn-create-course');
    expect(openModalBtn).toBeInTheDocument();
    fireEvent.click(openModalBtn!);

    // Buscamos el boton de submit del modal
    const submitBtn = await screen.findByText('Crear curso', { selector: 'button' });
    
    // El boton debe estar deshabilitado inicialmente
    expect(submitBtn).toBeDisabled();
  });

  it('UI-CRS-03: Permite enviar el formulario y llama a courseService.create', async () => {
    vi.mocked(courseService.list).mockResolvedValue({ data: { data: [] } } as never);
    vi.mocked(courseService.mine).mockResolvedValue({ data: { data: [] } } as never);
    vi.mocked(courseService.create).mockResolvedValue({ data: { success: true } } as never);

    renderWithRouter(<CoursesPage />);

    await waitFor(() => {
        expect(screen.getByText('No has creado ningún curso')).toBeInTheDocument();
    });

    const openModalBtn = document.getElementById('btn-create-course');
    fireEvent.click(openModalBtn!);

    const titleInput = await screen.findByLabelText(/Título del curso \*/i);
    fireEvent.change(titleInput, { target: { value: 'Nuevo Curso Testing' } });

    const submitBtn = await screen.findByText('Crear curso', { selector: 'button' });
    expect(submitBtn).not.toBeDisabled();
    
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(courseService.create).toHaveBeenCalledWith(
        expect.objectContaining({ titulo: 'Nuevo Curso Testing' })
      );
    });
  });
});
