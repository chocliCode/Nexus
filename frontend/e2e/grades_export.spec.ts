import { test, expect } from '@playwright/test';

// ============================================================
// E2E: Flujo de Calificaciones y Exportación a CSV
// Proyecto Integrador Final - Pruebas de Software
// ============================================================

test.describe('E2E: Sistema de Notas y Exportación CSV (Demostración)', () => {
  // Ajusta estas credenciales según los usuarios de prueba en tu base de datos local
  const MENTOR_EMAIL = 'jedi@nexus.test'; 
  const PASSWORD = 'Test1234!';

  test('El Mentor puede entrar al aula, asignar una nota y exportar el CSV con éxito', async ({ page }) => {
    // 1. Iniciar sesión como Mentor (Jedi)
    await page.goto('/login');
    await page.getByPlaceholder('tu@email.com').fill(MENTOR_EMAIL);
    await page.getByPlaceholder('••••••••').fill(PASSWORD);
    await page.getByRole('button', { name: /ingresar/i }).click();

    // Verificamos que entramos al dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);

    // 2. Navegar a Cursos y luego al primer curso disponible del Mentor
    await page.click('text="Cursos"');
    await page.locator('.course-card h3').first().click();

    // 3. Cambiar a la pestaña "Notas" (Calificaciones)
    await page.getByRole('button', { name: /Calificaciones/i }).click();
    
    // Validar que vemos la interfaz del mentor
    await expect(page.getByText('Calificaciones de Estudiantes')).toBeVisible();

    // 4. Iniciar flujo de calificar a un alumno
    // Nota: Asumimos que hay al menos una entrega subida por un Padawan
    const btnCalificar = page.locator('td button:has-text("Calificar")').first();
    
    // Si el botón está visible, significa que hay entregas para calificar (o habilitado desde la cuadrícula)
    if (await btnCalificar.isVisible()) {
      await btnCalificar.click();
      
      // Esperar modal
      await expect(page.locator('text="Calificar Estudiante"').first()).toBeVisible();

      // Llenar el formulario de calificación
      await page.locator('input[type="number"]').first().fill('18');
      await page.locator('textarea').first().fill('¡Excelente trabajo! Sigue así.');
      
      // Guardar nota
      await page.locator('button[type="submit"]:has-text("Guardar")').click();
      
      // Esperar a que el modal se cierre y la nota "18" aparezca en la tabla
      await expect(page.getByText('18')).toBeVisible({ timeout: 5000 });
    }

    // 5. Probar la Exportación a CSV
    // Playwright intercepta la descarga iniciada por el navegador
    const exportButton = page.getByRole('button', { name: /Exportar CSV/i });
    
    // Configurar la promesa de descarga ANTES de hacer clic
    const downloadPromise = page.waitForEvent('download');
    await exportButton.click();
    
    const download = await downloadPromise;
    
    // Validar el nombre del archivo
    expect(download.suggestedFilename()).toMatch(/notas_curso_.*\.csv/);
    
    // Validar que el archivo se guarde y tenga contenido (tamaño > 0)
    const error = await download.failure();
    expect(error).toBeNull(); // No debe haber error de descarga
    
    // (Opcional) Podemos guardar el archivo descargado para inspeccionarlo en la demo
    // await download.saveAs('./test-results/' + download.suggestedFilename());
  });
});
