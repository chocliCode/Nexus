# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: grades_export.spec.ts >> E2E: Sistema de Notas y Exportación CSV (Demostración) >> El Mentor puede entrar al aula, asignar una nota y exportar el CSV con éxito
- Location: e2e\grades_export.spec.ts:13:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*\/dashboard/
Received string:  "http://localhost:5174/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:5174/login"

```

```yaml
- text: "N"
- heading "NEXUS" [level=1]
- paragraph: Transformación del Talento
- heading "Iniciar Sesión" [level=2]
- text: Error de conexión con el servidor Email
- textbox "Email":
  - /placeholder: tu@email.com
  - text: jedi@nexus.test
- text: Contraseña
- textbox "Contraseña":
  - /placeholder: ••••••••
  - text: Test1234!
- button "Ingresar"
- paragraph:
  - text: ¿No tienes cuenta?
  - link "Regístrate aquí":
    - /url: /register
- paragraph: NEXUS · ODS 4, ODS 8, ODS 17 · UNMSM
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // ============================================================
  4  | // E2E: Flujo de Calificaciones y Exportación a CSV
  5  | // Proyecto Integrador Final - Pruebas de Software
  6  | // ============================================================
  7  | 
  8  | test.describe('E2E: Sistema de Notas y Exportación CSV (Demostración)', () => {
  9  |   // Ajusta estas credenciales según los usuarios de prueba en tu base de datos local
  10 |   const MENTOR_EMAIL = 'jedi@nexus.test'; 
  11 |   const PASSWORD = 'Test1234!';
  12 | 
  13 |   test('El Mentor puede entrar al aula, asignar una nota y exportar el CSV con éxito', async ({ page }) => {
  14 |     // 1. Iniciar sesión como Mentor (Jedi)
  15 |     await page.goto('/login');
  16 |     await page.getByPlaceholder('tu@email.com').fill(MENTOR_EMAIL);
  17 |     await page.getByPlaceholder('••••••••').fill(PASSWORD);
  18 |     await page.getByRole('button', { name: /ingresar/i }).click();
  19 | 
  20 |     // Verificamos que entramos al dashboard
> 21 |     await expect(page).toHaveURL(/.*\/dashboard/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  22 | 
  23 |     // 2. Navegar al primer curso disponible del Mentor
  24 |     // Simulamos hacer clic en el botón de "Ir al Aula" o en la tarjeta del curso
  25 |     // Nota: Dependiendo de tu UI de dashboard, ajusta el selector.
  26 |     const courseCard = page.locator('text="Aula Virtual"').first();
  27 |     
  28 |     try {
  29 |       await courseCard.waitFor({ state: 'visible', timeout: 5000 });
  30 |       await courseCard.click();
  31 |     } catch (e) {
  32 |       console.log('Por favor asegúrate de que el usuario tenga un curso abierto');
  33 |     }
  34 | 
  35 |     // 3. Cambiar a la pestaña "Notas" (Calificaciones)
  36 |     await page.getByRole('button', { name: /Calificaciones/i }).click();
  37 |     
  38 |     // Validar que vemos la interfaz del mentor
  39 |     await expect(page.getByText('Calificaciones de Estudiantes')).toBeVisible();
  40 | 
  41 |     // 4. Iniciar flujo de calificar a un alumno
  42 |     // Nota: Asumimos que hay al menos una entrega subida por un Padawan
  43 |     const btnCalificar = page.getByRole('button', { name: /Calificar/i }).first();
  44 |     
  45 |     // Si el botón está visible, significa que hay entregas para calificar (o habilitado desde la cuadrícula)
  46 |     if (await btnCalificar.isVisible()) {
  47 |       await btnCalificar.click();
  48 |       
  49 |       // Llenar el formulario de calificación
  50 |       await page.getByPlaceholder('20').fill('18');
  51 |       await page.getByPlaceholder('Opcional').fill('¡Excelente trabajo! Sigue así.');
  52 |       
  53 |       // Guardar nota
  54 |       await page.getByRole('button', { name: /Guardar Calificación/i }).click();
  55 |       
  56 |       // Esperar a que el modal se cierre y la nota "18" aparezca en la tabla
  57 |       await expect(page.getByText('18')).toBeVisible({ timeout: 5000 });
  58 |     }
  59 | 
  60 |     // 5. Probar la Exportación a CSV
  61 |     // Playwright intercepta la descarga iniciada por el navegador
  62 |     const exportButton = page.getByRole('button', { name: /Exportar CSV/i });
  63 |     
  64 |     // Configurar la promesa de descarga ANTES de hacer clic
  65 |     const downloadPromise = page.waitForEvent('download');
  66 |     await exportButton.click();
  67 |     
  68 |     const download = await downloadPromise;
  69 |     
  70 |     // Validar el nombre del archivo
  71 |     expect(download.suggestedFilename()).toMatch(/notas_curso_.*\.csv/);
  72 |     
  73 |     // Validar que el archivo se guarde y tenga contenido (tamaño > 0)
  74 |     const error = await download.failure();
  75 |     expect(error).toBeNull(); // No debe haber error de descarga
  76 |     
  77 |     // (Opcional) Podemos guardar el archivo descargado para inspeccionarlo en la demo
  78 |     // await download.saveAs('./test-results/' + download.suggestedFilename());
  79 |   });
  80 | });
  81 | 
```