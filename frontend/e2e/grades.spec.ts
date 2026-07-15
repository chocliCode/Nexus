import { test, expect } from '@playwright/test';

test.describe('E2E: Calificaciones y Descarga de CSV', () => {

  test('E2E-GRD-01: El Mentor ingresa una nota valida y se guarda', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await page.click('text="Cursos"');
    await page.locator('.course-card h3').first().click();
    await page.click('text="Calificaciones"');

    // Esperar a que cargue la tabla
    await page.waitForSelector('table');
    
    // Buscar la primera fila y poner una nota
    const firstRowInput = page.locator('input[type="number"]').first();
    // Playwright clear and type
    await firstRowInput.fill('');
    await firstRowInput.fill('18');

    // Buscar el boton de calificar de esa fila
    const firstRowBtn = page.locator('button:has-text("Calificar")').first();
    await firstRowBtn.click();

    // Comprobar toast de exito
    await expect(page.locator('text="Calificacion guardada"').first()).toBeVisible();
  });

  test('E2E-GRD-02: Validacion UI rechaza nota fuera de rango (ej. 25)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await page.goto('/courses');
    await page.locator('.course-card h3').first().click();
    await page.click('text="Calificaciones"');

    const firstRowInput = page.locator('input[type="number"]').first();
    await firstRowInput.fill('');
    await firstRowInput.fill('25');

    const firstRowBtn = page.locator('button:has-text("Calificar")').first();
    await firstRowBtn.click();

    // Toast de error de Zod/ReactHookForm
    await expect(page.locator('text="La calificacion debe ser entre 0 y 20"').first()).toBeVisible();
  });

  test('E2E-GRD-03: Clic en Exportar CSV dispara la descarga del archivo', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'jedi@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await page.goto('/courses');
    await page.locator('.course-card h3').first().click();
    await page.click('text="Calificaciones"');

    // Preparar a Playwright para interceptar el evento de descarga
    const downloadPromise = page.waitForEvent('download');
    
    // Clic en el boton
    await page.click('button:has-text("Exportar CSV")');
    
    // Capturar descarga
    const download = await downloadPromise;
    
    // Afirmar que el archivo sugerido contiene "calificaciones" y termina en .csv
    expect(download.suggestedFilename()).toContain('calificaciones');
    expect(download.suggestedFilename()).toMatch(/\.csv$/);
  });

});
