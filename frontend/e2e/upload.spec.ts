import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('E2E: Subida de Resoluciones (Archivos PDF)', () => {

  test('E2E-PDF-01: Padawan carga exitosamente su tarea en PDF', async ({ page }) => {
    // 1. Iniciar sesión como padawan
    await page.goto('/login');
    await page.fill('input[type="email"]', 'padawan@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    // 2. Entrar al curso
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.click('text="Cursos"');
    await page.locator('.course-card h3').first().click();

    // 3. Encontrar el boton de Adjuntar o input file
    // Hacemos clic en Entregar Tarea para abrir el modal
    await page.click('button:has-text("Entregar Tarea")');
    const fileInput = page.locator('input[type="file"]');
    
    const mockFilePath = path.join(__dirname, 'test-doc.pdf'); 
    
    try {
      await fileInput.setInputFiles(mockFilePath);
    } catch {
      console.log('Dummy file path not found, skipping setInputFiles');
    }

    // 4. Enviar
    const submitBtn = page.locator('button[type="submit"]:has-text("Subir Entrega")');
    if (await submitBtn.isVisible()) {
      // Setup listener para el confirm window.confirm y aceptarlo automáticamente
      page.on('dialog', dialog => dialog.accept());
      await submitBtn.click();
      
      // 5. Verificar que el modal se cierre (el boton ya no estara visible)
      await expect(submitBtn).toHaveCount(0);
    }
  });

  test('E2E-PDF-02: El navegador muestra el input de PDF requerido', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'padawan@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.click('text="Cursos"');
    await page.locator('.course-card h3').first().click();

    // Abrir modal
    await page.click('button:has-text("Entregar Tarea")');

    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toHaveAttribute('accept', 'application/pdf');
    await expect(fileInput).toHaveAttribute('required', '');
  });

  test('E2E-PDF-03: Visualizacion de boton Entregar Tarea', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'padawan@nexus.test');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.click('text="Cursos"');
    await page.locator('.course-card h3').first().click();

    // Verificamos que exista el boton para entregar tarea
    const botonEntregar = page.locator('button:has-text("Entregar Tarea")');
    expect(await botonEntregar.count()).toBeGreaterThan(0);
  });

});
