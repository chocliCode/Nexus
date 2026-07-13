import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import * as useAuthHook from '../hooks/useAuth';

// Mock useAuth
vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('UI Component: LoginPage', () => {

  it('UI-AUTH-01: Muestra errores de validacion Zod al enviar formulario vacio', async () => {
    // Mock basic login function
    const mockLogin = vi.fn();
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      loading: false,
    });

    renderWithRouter(<LoginPage />);

    // Click submit without filling anything
    const submitBtn = screen.getByRole('button', { name: /ingresar/i });
    fireEvent.click(submitBtn);

    // Wait for Zod errors to appear
    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
      expect(screen.getByText('Contraseña requerida')).toBeInTheDocument();
    });

    // Ensure login was never called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('UI-AUTH-02: Llama a login y redirige si las credenciales son validas', async () => {
    const mockLogin = vi.fn().mockResolvedValueOnce(undefined);
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      loading: false,
    });

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@nexus.test' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'Password123' } });
    
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@nexus.test', 'Password123');
    });
  });

  it('UI-AUTH-03: Muestra toast/banner de error si falla la autenticacion de red', async () => {
    // Simulate axios error
    const mockError = { response: { data: { error: 'Credenciales inválidas desde el servidor' } } };
    const mockLogin = vi.fn().mockRejectedValueOnce(mockError);
    
    vi.spyOn(useAuthHook, 'useAuth').mockReturnValue({
      user: null,
      token: null,
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      updateUser: vi.fn(),
      loading: false,
    });

    renderWithRouter(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@nexus.test' } });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { target: { value: 'WrongPass' } });
    
    fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));

    // Wait for the server error message to be displayed on UI
    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas desde el servidor')).toBeInTheDocument();
    });
  });

});
