import { test, expect } from '@playwright/test';

test.describe('E2E: Creacion de Cursos (Jedi)', () => {

  test('E2E-CRS-01: El Jedi puede crear un curso exitosamente', async ({ page }) => {
    // Login as Jedi
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    // Wait for Dashboard and navigate to Courses
    await expect(page).toHaveURL('/dashboard');
    await page.click('text="Cursos"');

    // Click "Crear Curso" button
    await page.click('button:has-text("Crear Curso")');
    
    // Form fill
    await page.fill('input#titulo', 'E2E Nuevo Curso Mágico');
    await page.fill('textarea#descripcion', 'Prueba E2E');
    await page.click('button[type="submit"]');
    
    // Verify success toast or appearance in the list
    await expect(page.locator('text="E2E Nuevo Curso Mágico"').first()).toBeVisible();
  });

  test('E2E-CRS-02: Validacion Zod de Formulario vacio visualmente', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await page.click('text="Cursos"');

    await page.click('button:has-text("Crear Curso")');
    
    // Submit without filling
    await page.click('button[type="submit"]');

    // Verify UI error message
    await expect(page.locator('text="El título es obligatorio"').first()).toBeVisible();
  });

  test('E2E-CRS-03: Un Padawan no puede ver el boton Crear Curso', async ({ page }) => {
    // Login as Padawan
    await page.goto('/login');
    await page.fill('input[type="email"]', 'padawan@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await page.click('text="Cursos"');

    // Button should not exist
    const createBtn = page.locator('button:has-text("Crear Curso")');
    await expect(createBtn).toHaveCount(0);
  });

});
