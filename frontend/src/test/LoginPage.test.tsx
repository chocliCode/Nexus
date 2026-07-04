import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../hooks/useAuth';

// Mock useAuth hook
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../hooks/useAuth', async () => {
  const actual = await vi.importActual('../hooks/useAuth');
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn(),
    }),
  };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderLoginPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================
  // Renderizado de estructura
  // =========================================================

  it('COMP-LOGIN-01: renderiza los campos de email y contraseña', () => {
    renderLoginPage();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('COMP-LOGIN-02: renderiza el branding NEXUS y el titulo', () => {
    renderLoginPage();
    expect(screen.getByText('NEXUS')).toBeInTheDocument();
    expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
  });

  it('COMP-LOGIN-03: muestra el link de registro', () => {
    renderLoginPage();
    const link = screen.getByText('Regístrate aquí');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/register');
  });

  it('COMP-LOGIN-04: renderiza el subtitulo y el footer institucional', () => {
    renderLoginPage();
    expect(screen.getByText('Transformación del Talento')).toBeInTheDocument();
    expect(screen.getByText(/ODS 4, ODS 8, ODS 17/)).toBeInTheDocument();
  });

  it('COMP-LOGIN-05: los inputs tienen los IDs correctos para testing', () => {
    renderLoginPage();
    expect(document.getElementById('login-email')).toBeInTheDocument();
    expect(document.getElementById('login-password')).toBeInTheDocument();
    expect(document.getElementById('login-submit')).toBeInTheDocument();
  });

  // =========================================================
  // Atributos y tipos de input
  // =========================================================

  it('COMP-LOGIN-06: el campo email tiene type="email" y autocomplete', () => {
    renderLoginPage();
    const emailInput = screen.getByPlaceholderText('tu@email.com');
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('autocomplete', 'email');
  });

  it('COMP-LOGIN-07: el campo contraseña tiene type="password" y autocomplete', () => {
    renderLoginPage();
    const passInput = screen.getByPlaceholderText('••••••••');
    expect(passInput).toHaveAttribute('type', 'password');
    expect(passInput).toHaveAttribute('autocomplete', 'current-password');
  });

  it('COMP-LOGIN-08: renderiza las labels Email y Contraseña', () => {
    renderLoginPage();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Contraseña')).toBeInTheDocument();
  });

  // =========================================================
  // Boton submit
  // =========================================================

  it('COMP-LOGIN-09: el boton de submit muestra "Ingresar" por defecto', () => {
    renderLoginPage();
    const button = document.getElementById('login-submit');
    expect(button).toHaveTextContent('Ingresar');
  });

  it('COMP-LOGIN-10: el boton es de type="submit"', () => {
    renderLoginPage();
    const button = document.getElementById('login-submit');
    expect(button).toHaveAttribute('type', 'submit');
  });

  // =========================================================
  // Validacion del formulario
  // =========================================================

  it('COMP-LOGIN-11: muestra error de validacion con email invalido', async () => {
    renderLoginPage();
    const emailInput = screen.getByPlaceholderText('tu@email.com');
    const passInput = screen.getByPlaceholderText('••••••••');

    await userEvent.type(emailInput, 'not-an-email');
    await userEvent.type(passInput, 'password123');
    fireEvent.submit(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('COMP-LOGIN-12: muestra error cuando la contraseña esta vacia', async () => {
    renderLoginPage();
    const emailInput = screen.getByPlaceholderText('tu@email.com');

    await userEvent.type(emailInput, 'user@test.com');
    fireEvent.submit(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText('Contraseña requerida')).toBeInTheDocument();
    });
  });

  // =========================================================
  // Interaccion con login
  // =========================================================

  it('COMP-LOGIN-13: llama login() con las credenciales al enviar el formulario', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'test@nexus.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'SecurePass123!');
    fireEvent.submit(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@nexus.com', 'SecurePass123!');
    });
  });

  it('COMP-LOGIN-14: navega a /dashboard tras login exitoso', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'test@nexus.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'SecurePass123!');
    fireEvent.submit(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('COMP-LOGIN-15: muestra mensaje de error cuando login falla', async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { error: 'Credenciales inválidas' } },
    });
    renderLoginPage();

    await userEvent.type(screen.getByPlaceholderText('tu@email.com'), 'test@nexus.com');
    await userEvent.type(screen.getByPlaceholderText('••••••••'), 'WrongPass');
    fireEvent.submit(screen.getByRole('button', { name: /ingresar/i }));

    await waitFor(() => {
      expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
    });
  });
});
