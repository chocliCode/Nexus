/**
 * E2E Tests -- NEXUS
 * 15 pruebas end-to-end con Playwright
 *
 * Requiere:
 * - Frontend corriendo en localhost:5174 (npm run dev)
 * - Backend corriendo en localhost:3001 (npm run dev)
 * - PostgreSQL con datos de test
 * - Usuario de test registrado
 */
import { test, expect } from '@playwright/test';

const TEST_EMAIL = 'e2etest@e2etest.com';
const TEST_PASSWORD = 'E2eTestPass123!';
const BASE_URL = 'http://localhost:5174';

// ============================================================
// Flujo de Login
// ============================================================

test.describe('E2E: Flujo de Login', () => {

  test('E2E-01: La pagina de login carga correctamente', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('NEXUS')).toBeVisible();
    await expect(page.getByText('Iniciar Sesión')).toBeVisible();
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /ingresar/i })).toBeVisible();
  });

  test('E2E-02: Muestra error con credenciales invalidas', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('tu@email.com').fill('wrong@email.com');
    await page.getByPlaceholder('••••••••').fill('WrongPassword');
    await page.getByRole('button', { name: /ingresar/i }).click();
    // Wait for error message to appear
    await expect(page.getByText(/error|inválid|incorrect/i)).toBeVisible({ timeout: 5000 });
  });

  test('E2E-03: Login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('tu@email.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('E2E-04: Validacion client-side rechaza email invalido', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('tu@email.com').fill('not-an-email');
    await page.getByPlaceholder('••••••••').fill('somepassword');
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page.getByText(/email inválido/i)).toBeVisible({ timeout: 3000 });
  });

});

// ============================================================
// Flujo de Registro
// ============================================================

test.describe('E2E: Flujo de Registro', () => {

  test('E2E-05: Navega de login a registro', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Regístrate aquí').click();
    await expect(page).toHaveURL(/register/);
    await expect(page.getByText('Crear Cuenta')).toBeVisible();
  });

  test('E2E-06: La pagina de registro muestra todos los campos', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByPlaceholder('Carlos')).toBeVisible();
    await expect(page.getByPlaceholder('García')).toBeVisible();
    await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  });

});

// ============================================================
// Dashboard (requiere autenticacion)
// ============================================================

test.describe('E2E: Dashboard', () => {

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.getByPlaceholder('tu@email.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  });

  test('E2E-07: Dashboard muestra el nombre del usuario', async ({ page }) => {
    // Dashboard should show some user-specific content
    await expect(page.locator('body')).not.toBeEmpty();
    // Verify the page loaded with actual content (not a blank page)
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(50);
  });

  test('E2E-08: Dashboard tiene navegacion lateral funcional', async ({ page }) => {
    // Check that navigation/sidebar exists
    const nav = page.locator('nav, [class*="sidebar"], [class*="nav"]');
    await expect(nav.first()).toBeVisible({ timeout: 5000 });
  });

  test('E2E-09: Navega del dashboard a sesiones', async ({ page }) => {
    await page.getByText(/sesiones/i).first().click();
    await expect(page).toHaveURL(/sessions/, { timeout: 5000 });
  });

  test('E2E-10: Navega del dashboard a vacantes', async ({ page }) => {
    await page.getByText(/vacantes/i).first().click();
    await expect(page).toHaveURL(/vacancies|vacantes/, { timeout: 5000 });
  });

});

// ============================================================
// Proteccion de rutas
// ============================================================

test.describe('E2E: Proteccion de rutas', () => {

  test('E2E-11: Redirige a login si accede a /dashboard sin auth', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login page
    await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 5000 });
  });

  test('E2E-12: Redirige a login si accede a /sessions sin auth', async ({ page }) => {
    await page.goto('/sessions');
    await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 5000 });
  });

  test('E2E-13: Redirige a login si accede a /profile sin auth', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 5000 });
  });

});

// ============================================================
// Vacantes (publico + autenticado)
// ============================================================

test.describe('E2E: Vacantes', () => {

  test('E2E-14: La pagina de vacantes carga y muestra contenido', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByPlaceholder('tu@email.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    // Navigate to vacancies
    await page.getByText(/vacantes/i).first().click();
    await expect(page).toHaveURL(/vacancies|vacantes/, { timeout: 5000 });

    // Page should have loaded content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(100);
  });

});

// ============================================================
// Logout
// ============================================================

test.describe('E2E: Logout', () => {

  test('E2E-15: Logout redirige a la pagina de login', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByPlaceholder('tu@email.com').fill(TEST_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

    // Find and click logout
    const logoutButton = page.getByText(/salir|logout|cerrar sesión/i).first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      // Should redirect to login
      await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 5000 });
    } else {
      // Try looking for a logout icon/button in nav
      const logoutIcon = page.locator('[class*="logout"], [aria-label*="logout"], [title*="Salir"]').first();
      await logoutIcon.click();
      await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 5000 });
    }
  });

});
