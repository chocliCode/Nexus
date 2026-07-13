import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import WorkTab from '../components/classroom/WorkTab';
import * as useAuthHook from '../hooks/useAuth';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

const mockSessions = [
  {
    sesion_id: 's1',
    titulo: 'Sesion de prueba Programada',
    estado: 'Programada',
    fecha_sesion: '2026-08-01T10:00:00Z',
    duracion_min: 60,
    notas: 'Notas de prueba',
  },
  {
    sesion_id: 's2',
    titulo: 'Sesion Completada con XSS <script>alert("xss")</script>',
    estado: 'Realizada',
    fecha_sesion: '2026-07-01T10:00:00Z',
    duracion_min: 45,
    notas: 'Notas completadas',
    total_okrs: 5
  }
];

describe('UI Component: WorkTab (Asignar Tarea / Sesiones)', () => {
  
  beforeEach(() => {
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

  it('UI-TSK-01: Muestra el formulario con selector de fecha para el rol Jedi', async () => {
    renderWithRouter(<WorkTab matchingId="m1" sessions={mockSessions as never} reload={vi.fn()} />);
    
    // El Jedi debe ver el botón para crear nueva sesión
    const newSessionBtn = screen.getByRole('button', { name: /\+ Nueva sesión/i });
    expect(newSessionBtn).toBeInTheDocument();
    
    // Al hacer clic, se abre el modal que debe exigir Titulo y Fecha
    fireEvent.click(newSessionBtn);
    expect(screen.getByPlaceholderText(/Título de la sesión/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Programar/i })).toBeInTheDocument();
  });

  it('UI-TSK-02: Previene inyeccion XSS visual en la descripcion', async () => {
    renderWithRouter(<WorkTab matchingId="m1" sessions={mockSessions as never} reload={vi.fn()} />);
    
    // React escapa automaticamente. Esperamos ver el texto literal con los tags de script
    const sessionTitle = await screen.findByText(/<script>alert\("xss"\)<\/script>/i);
    expect(sessionTitle).toBeInTheDocument();
    
    // Verificamos que NO exista la etiqueta script en el DOM ejecutable
    const scripts = document.getElementsByTagName('script');
    expect(scripts.length).toBe(0); 
  });

  it('UI-TSK-03: Bloquea envio si no se asigna fecha de vencimiento o titulo', async () => {
    renderWithRouter(<WorkTab matchingId="m1" sessions={mockSessions as never} reload={vi.fn()} />);
    
    fireEvent.click(screen.getByRole('button', { name: /\+ Nueva sesión/i }));
    
    const input = screen.getByPlaceholderText(/Título de la sesión/i);
    fireEvent.change(input, { target: { value: 'Tarea sin fecha' } });

    // El botón programar debería estar deshabilitado porque falta la fecha
    const submitBtn = screen.getByRole('button', { name: /Programar/i });
    expect(submitBtn).toBeDisabled();
  });
});
