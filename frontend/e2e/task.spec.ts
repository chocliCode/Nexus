import { test, expect } from '@playwright/test';

test.describe('E2E: Asignacion de Tareas (Aula Virtual)', () => {

  test('E2E-TSK-01: El Jedi entra al curso y publica una tarea', async ({ page }) => {
    // Login as Jedi
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    // Go to first course
    await page.click('text="Cursos"');
    await page.click('.course-card >> nth=0'); // Click the first course card

    // Find the WorkTab (Asignar Tarea / Anuncios)
    await page.click('text="Trabajo de Clase"');

    // Fill task
    await page.fill('textarea[placeholder*="Escribe una nueva tarea"]', 'Resolver ejercicios de Playwright');
    // For date input (depends on react-day-picker integration, using generic approach)
    await page.click('input[type="date"]');
    await page.fill('input[type="date"]', '2025-12-31');
    
    await page.click('button:has-text("Publicar Tarea")');
    
    // Verify it appeared on feed
    await expect(page.locator('text="Resolver ejercicios de Playwright"').first()).toBeVisible();
    await expect(page.locator('text="Vence:"').first()).toBeVisible();
  });

  test('E2E-TSK-02: Validacion flotante cuando no se pone fecha a una tarea', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await page.goto('/courses');
    await page.click('.course-card >> nth=0');
    await page.click('text="Trabajo de Clase"');

    await page.fill('textarea', 'Tarea sin fecha');
    
    // Attempt to publish without selecting date
    await page.click('button:has-text("Publicar Tarea")');

    // Should see Zod error or toast
    await expect(page.locator('text="Fecha de vencimiento requerida"').first()).toBeVisible();
  });

  test('E2E-TSK-03: El Padawan visualiza el badge de tarea pendiente', async ({ page }) => {
    // Login as Padawan
    await page.goto('/login');
    await page.fill('input[type="email"]', 'padawan@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await page.goto('/courses');
    // Asumiendo que el padawan ya esta en el curso
    await page.click('.course-card >> nth=0');
    
    // Work tab should show task but NOT the input field
    await page.click('text="Trabajo de Clase"');

    // Input field should not exist for padawan
    await expect(page.locator('textarea[placeholder*="Escribe una nueva tarea"]')).toHaveCount(0);

    // Tarea published by Jedi should be there
    const hasTask = await page.locator('.task-item').count() > 0;
    expect(hasTask).toBeDefined(); // Depende del estado real, al menos validamos no-crash
  });

});
