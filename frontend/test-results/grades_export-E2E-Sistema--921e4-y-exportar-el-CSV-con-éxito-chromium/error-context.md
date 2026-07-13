# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: grades_export.spec.ts >> E2E: Sistema de Notas y Exportación CSV (Demostración) >> El Mentor puede entrar al aula, asignar una nota y exportar el CSV con éxito
- Location: e2e\grades_export.spec.ts:13:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /Calificaciones/i })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "N NEXUS Talento Digital" [ref=e6] [cursor=pointer]:
      - /url: /dashboard
      - generic [ref=e8]: "N"
      - generic [ref=e9]:
        - heading "NEXUS" [level=1] [ref=e10]
        - paragraph [ref=e11]: Talento Digital
    - navigation [ref=e12]:
      - link "Dashboard" [ref=e13] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e14]
        - generic [ref=e15]: Dashboard
      - link "Mi Perfil" [ref=e16] [cursor=pointer]:
        - /url: /profile
        - img [ref=e17]
        - generic [ref=e20]: Mi Perfil
      - link "Cursos" [ref=e21] [cursor=pointer]:
        - /url: /courses
        - img [ref=e22]
        - generic [ref=e24]: Cursos
      - link "Onboarding" [ref=e25] [cursor=pointer]:
        - /url: /onboarding
        - img [ref=e26]
        - generic [ref=e31]: Onboarding
      - link "Mentores" [ref=e32] [cursor=pointer]:
        - /url: /mentors
        - img [ref=e33]
        - generic [ref=e38]: Mentores
      - link "Matching" [ref=e39] [cursor=pointer]:
        - /url: /matching
        - img [ref=e40]
        - generic [ref=e43]: Matching
      - link "Sesiones" [ref=e44] [cursor=pointer]:
        - /url: /sessions
        - img [ref=e45]
        - generic [ref=e49]: Sesiones
      - link "Vacantes" [ref=e50] [cursor=pointer]:
        - /url: /vacancies
        - img [ref=e51]
        - generic [ref=e54]: Vacantes
    - generic [ref=e56]:
      - generic [ref=e57]:
        - generic [ref=e58]: CR
        - generic [ref=e59]:
          - paragraph [ref=e60]: Carlos Ramírez Torres
          - paragraph [ref=e61]: Mentor Jedi
      - button "Cerrar sesión" [ref=e62] [cursor=pointer]
  - main [ref=e63]:
    - button [ref=e65] [cursor=pointer]:
      - img [ref=e66]
    - generic [ref=e70]:
      - generic [ref=e71]:
        - heading "¡Bienvenido, Carlos!" [level=1] [ref=e72]
        - paragraph [ref=e73]: Mentor Jedi
      - link "Completa tu evaluación diagnóstica Responde un test rápido para generar tu ruta de aprendizaje personalizada." [ref=e74] [cursor=pointer]:
        - /url: /onboarding
        - generic [ref=e75]:
          - img [ref=e76]
          - generic [ref=e81]:
            - paragraph [ref=e82]: Completa tu evaluación diagnóstica
            - paragraph [ref=e83]: Responde un test rápido para generar tu ruta de aprendizaje personalizada.
      - generic [ref=e84]:
        - generic [ref=e85]:
          - generic [ref=e86]:
            - img [ref=e87]
            - paragraph [ref=e89]: Score
          - paragraph [ref=e90]: "0"
          - paragraph [ref=e91]: Empleabilidad
        - generic [ref=e92]:
          - generic [ref=e93]:
            - img [ref=e94]
            - paragraph [ref=e97]: OKRs
          - paragraph [ref=e98]: "0"
          - paragraph [ref=e99]: Completados
        - generic [ref=e100]:
          - generic [ref=e101]:
            - img [ref=e102]
            - paragraph [ref=e106]: Sesiones
          - paragraph [ref=e107]: "0"
          - paragraph [ref=e108]: Realizadas
        - generic [ref=e109]:
          - generic [ref=e110]:
            - img [ref=e111]
            - paragraph [ref=e113]: Habilidades
          - paragraph [ref=e114]: "0"
          - paragraph [ref=e115]: Registradas
      - generic [ref=e116]:
        - generic [ref=e117]:
          - heading "OKRs Activos" [level=2] [ref=e118]:
            - img [ref=e119]
            - text: OKRs Activos
          - paragraph [ref=e122]: Sin OKRs activos
        - generic [ref=e123]:
          - heading "Próximas Sesiones" [level=2] [ref=e124]:
            - img [ref=e125]
            - text: Próximas Sesiones
          - paragraph [ref=e127]: Sin sesiones programadas
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
  10 |   const MENTOR_EMAIL = 'jedi@gmail.com'; 
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
  21 |     await expect(page).toHaveURL(/.*\/dashboard/);
  22 | 
  23 |     // 2. Navegar al primer curso disponible del Mentor
  24 |     // Simulamos hacer clic en el botón de "Ir al Aula" o en la tarjeta del curso
  25 |     // Nota: Dependiendo de tu UI de dashboard, ajusta el selector.
  26 |     const courseCard = page.locator('text="Aula Virtual"').first();
  27 |     if (await courseCard.isVisible()) {
  28 |       await courseCard.click();
  29 |     } else {
  30 |       // Navegación alternativa directa si sabemos el ID del curso de prueba
  31 |       // await page.goto('/course/12345/classroom');
  32 |       console.log('Por favor asegúrate de que el usuario tenga un curso abierto');
  33 |     }
  34 | 
  35 |     // 3. Cambiar a la pestaña "Notas" (Calificaciones)
> 36 |     await page.getByRole('button', { name: /Calificaciones/i }).click();
     |                                                                 ^ Error: locator.click: Test timeout of 30000ms exceeded.
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