# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course.spec.ts >> E2E: Creacion de Cursos (Jedi) >> E2E-CRS-01: El Jedi puede crear un curso exitosamente
- Location: e2e\course.spec.ts:5:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "http://localhost:5174/dashboard"
Received: "http://localhost:5174/login"
Timeout:  5000ms

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
  3  | test.describe('E2E: Creacion de Cursos (Jedi)', () => {
  4  | 
  5  |   test('E2E-CRS-01: El Jedi puede crear un curso exitosamente', async ({ page }) => {
  6  |     // Login as Jedi
  7  |     await page.goto('/login');
  8  |     await page.fill('input[type="email"]', 'jedi@nexus.test');
  9  |     await page.fill('input[type="password"]', 'Test1234!');
  10 |     await page.click('button[type="submit"]');
  11 |     
  12 |     // Wait for Dashboard and navigate to Courses
> 13 |     await expect(page).toHaveURL('/dashboard');
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  14 |     await page.click('text="Cursos"');
  15 | 
  16 |     // Click "Crear Curso" button
  17 |     await page.click('button:has-text("Crear Curso")');
  18 |     
  19 |     // Form fill
  20 |     await page.fill('input#titulo', 'E2E Nuevo Curso Mágico');
  21 |     await page.fill('textarea#descripcion', 'Prueba E2E');
  22 |     await page.click('button:has-text("Crear curso")');
  23 |     
  24 |     // Verify success toast or appearance in the list
  25 |     await expect(page.locator('text="E2E Nuevo Curso Mágico"').first()).toBeVisible();
  26 |   });
  27 | 
  28 |   test('E2E-CRS-02: Validacion Zod de Formulario vacio visualmente', async ({ page }) => {
  29 |     await page.goto('/login');
  30 |     await page.fill('input[type="email"]', 'jedi@nexus.test');
  31 |     await page.fill('input[type="password"]', 'Test1234!');
  32 |     await page.click('button[type="submit"]');
  33 |     
  34 |     await expect(page).toHaveURL('/dashboard');
  35 |     await page.click('text="Cursos"');
  36 | 
  37 |     await page.click('button:has-text("Crear Curso")');
  38 |     
  39 |     // Submit without filling
  40 |     await page.click('button:has-text("Crear curso")');
  41 | 
  42 |     // Verify UI error message
  43 |     await expect(page.locator('text="El título es obligatorio"').first()).toBeVisible();
  44 |   });
  45 | 
  46 |   test('E2E-CRS-03: Un Padawan no puede ver el boton Crear Curso', async ({ page }) => {
  47 |     // Login as Padawan
  48 |     await page.goto('/login');
  49 |     await page.fill('input[type="email"]', 'padawan@nexus.test');
  50 |     await page.fill('input[type="password"]', 'Test1234!');
  51 |     await page.click('button[type="submit"]');
  52 |     
  53 |     await expect(page).toHaveURL('/dashboard');
  54 |     await page.click('text="Cursos"');
  55 | 
  56 |     // Button should not exist
  57 |     const createBtn = page.locator('button:has-text("Crear Curso")');
  58 |     await expect(createBtn).toHaveCount(0);
  59 |   });
  60 | 
  61 | });
  62 | 
```