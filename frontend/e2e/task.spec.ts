import { test, expect } from '@playwright/test';

test.describe('E2E: Asignacion de Tareas (Aula Virtual)', () => {

  test('E2E-TSK-01: El Jedi entra al curso y publica una tarea', async ({ page }) => {
    // Login as Jedi
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    // Go to first course
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.click('text="Cursos"');
    await page.locator('.course-card h3').first().click();

    // Click button to show form
    await page.click('button:has-text("Publica algo en el curso")');

    // Select type as 'tarea'
    await page.selectOption('select', 'tarea');

    // Fill task
    await page.fill('textarea[placeholder="Escribe tu publicacion..."]', 'Resolver ejercicios de Playwright');
    
    // Fill date to pass validation
    await page.fill('input[type="datetime-local"]', '2026-12-31T23:59');
    
    await page.click('button[type="submit"]:has-text("Publicar")');
    
    // Verify it appeared on feed
    await expect(page.locator('text="Resolver ejercicios de Playwright"').first()).toBeVisible();
    await expect(page.locator('text="Entregable de la Tarea"').first()).toBeVisible();
  });

  test('E2E-TSK-02: Boton deshabilitado cuando no se pone contenido a una publicacion', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.click('text="Cursos"');
    await page.locator('.course-card h3').first().click();

    await page.click('button:has-text("Publica algo en el curso")');

    // El boton debe estar deshabilitado cuando no hay contenido
    const btn = page.locator('button[type="submit"]:has-text("Publicar")');
    await expect(btn).toBeDisabled();
  });

  test('E2E-TSK-03: El Padawan visualiza las tareas pero no puede publicar', async ({ page }) => {
    // Login as Padawan
    await page.goto('/login');
    await page.fill('input[type="email"]', 'padawan@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.click('text="Cursos"');
    await page.locator('.course-card h3').first().click();

    // Input field should not exist for padawan
    await expect(page.locator('button:has-text("Publica algo en el curso")')).toHaveCount(0);

    // Any task item could be present (if previous tests created it)
  });

});
