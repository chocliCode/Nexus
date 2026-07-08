# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nexus.spec.ts >> E2E: Flujo de Registro >> E2E-05: Navega de login a registro
- Location: e2e\nexus.spec.ts:66:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Crear Cuenta')
Expected: visible
Error: strict mode violation: getByText('Crear Cuenta') resolved to 2 elements:
    1) <h2 class="text-xl font-semibold mb-6">Crear Cuenta</h2> aka getByRole('heading', { name: 'Crear Cuenta' })
    2) <button type="submit" id="register-submit" class="btn-primary w-full flex items-center justify-center gap-2">Crear Cuenta</button> aka getByRole('button', { name: 'Crear Cuenta' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Crear Cuenta')

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - generic [ref=e7]: "N"
    - heading "Únete a NEXUS" [level=1] [ref=e8]
    - paragraph [ref=e9]: Comienza tu transformación profesional
  - generic [ref=e10]:
    - heading "Crear Cuenta" [level=2] [ref=e11]
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]: ¿Cuál es tu rol?
        - generic [ref=e15]:
          - generic [ref=e16] [cursor=pointer]:
            - radio "🎓 Padawan Aprendiz" [checked] [ref=e17]
            - generic [ref=e18]: 🎓
            - generic [ref=e19]: Padawan
            - generic [ref=e20]: Aprendiz
          - generic [ref=e21] [cursor=pointer]:
            - radio "🧙‍♂️ Mentor Jedi Guía profesional" [ref=e22]
            - generic [ref=e23]: 🧙‍♂️
            - generic [ref=e24]: Mentor Jedi
            - generic [ref=e25]: Guía profesional
      - generic [ref=e26]:
        - generic [ref=e27]:
          - generic [ref=e28]: Nombres
          - textbox "María" [ref=e29]
        - generic [ref=e30]:
          - generic [ref=e31]: Apellidos
          - textbox "García" [ref=e32]
      - generic [ref=e33]:
        - generic [ref=e34]: Email
        - textbox "tu@email.com" [ref=e35]
      - generic [ref=e36]:
        - generic [ref=e37]: Contraseña
        - textbox "Mínimo 8 caracteres" [ref=e38]
      - button "Crear Cuenta" [ref=e39] [cursor=pointer]
    - paragraph [ref=e40]:
      - text: ¿Ya tienes cuenta?
      - link "Inicia sesión" [ref=e41] [cursor=pointer]:
        - /url: /login
```

# Test source

```ts
  1   | /**
  2   |  * E2E Tests -- NEXUS
  3   |  * 15 pruebas end-to-end con Playwright
  4   |  *
  5   |  * Requiere:
  6   |  * - Frontend corriendo en localhost:5174 (npm run dev)
  7   |  * - Backend corriendo en localhost:3001 (npm run dev)
  8   |  * - PostgreSQL con datos de test
  9   |  * - Usuario de test registrado
  10  |  */
  11  | import { test, expect } from '@playwright/test';
  12  | 
  13  | const TEST_EMAIL = 'e2etest@e2etest.com';
  14  | const TEST_PASSWORD = 'E2eTestPass123!';
  15  | 
  16  | 
  17  | // ============================================================
  18  | // Flujo de Login
  19  | // ============================================================
  20  | 
  21  | test.describe('E2E: Flujo de Login', () => {
  22  | 
  23  |   test('E2E-01: La pagina de login carga correctamente', async ({ page }) => {
  24  |     await page.goto('/');
  25  |     await expect(page.getByText('NEXUS')).toBeVisible();
  26  |     await expect(page.getByText('Iniciar Sesión')).toBeVisible();
  27  |     await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
  28  |     await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  29  |     await expect(page.getByRole('button', { name: /ingresar/i })).toBeVisible();
  30  |   });
  31  | 
  32  |   test('E2E-02: Muestra error con credenciales invalidas', async ({ page }) => {
  33  |     await page.goto('/');
  34  |     await page.getByPlaceholder('tu@email.com').fill('wrong@email.com');
  35  |     await page.getByPlaceholder('••••••••').fill('WrongPassword');
  36  |     await page.getByRole('button', { name: /ingresar/i }).click();
  37  |     // Wait for error message to appear
  38  |     await expect(page.getByText(/error|inválid|incorrect/i)).toBeVisible({ timeout: 5000 });
  39  |   });
  40  | 
  41  |   test('E2E-03: Login exitoso redirige al dashboard', async ({ page }) => {
  42  |     await page.goto('/');
  43  |     await page.getByPlaceholder('tu@email.com').fill(TEST_EMAIL);
  44  |     await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  45  |     await page.getByRole('button', { name: /ingresar/i }).click();
  46  |     // Should redirect to dashboard
  47  |     await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  48  |   });
  49  | 
  50  |   test('E2E-04: Validacion client-side rechaza email invalido', async ({ page }) => {
  51  |     await page.goto('/');
  52  |     await page.getByPlaceholder('tu@email.com').fill('not-an-email');
  53  |     await page.getByPlaceholder('••••••••').fill('somepassword');
  54  |     await page.getByRole('button', { name: /ingresar/i }).click();
  55  |     await expect(page.getByText(/email inválido/i)).toBeVisible({ timeout: 3000 });
  56  |   });
  57  | 
  58  | });
  59  | 
  60  | // ============================================================
  61  | // Flujo de Registro
  62  | // ============================================================
  63  | 
  64  | test.describe('E2E: Flujo de Registro', () => {
  65  | 
  66  |   test('E2E-05: Navega de login a registro', async ({ page }) => {
  67  |     await page.goto('/');
  68  |     await page.getByText('Regístrate aquí').click();
  69  |     await expect(page).toHaveURL(/register/);
> 70  |     await expect(page.getByText('Crear Cuenta')).toBeVisible();
      |                                                  ^ Error: expect(locator).toBeVisible() failed
  71  |   });
  72  | 
  73  |   test('E2E-06: La pagina de registro muestra todos los campos', async ({ page }) => {
  74  |     await page.goto('/register');
  75  |     await expect(page.getByPlaceholder('Carlos')).toBeVisible();
  76  |     await expect(page.getByPlaceholder('García')).toBeVisible();
  77  |     await expect(page.getByPlaceholder('tu@email.com')).toBeVisible();
  78  |     await expect(page.getByPlaceholder('••••••••')).toBeVisible();
  79  |   });
  80  | 
  81  | });
  82  | 
  83  | // ============================================================
  84  | // Dashboard (requiere autenticacion)
  85  | // ============================================================
  86  | 
  87  | test.describe('E2E: Dashboard', () => {
  88  | 
  89  |   test.beforeEach(async ({ page }) => {
  90  |     // Login before each test
  91  |     await page.goto('/');
  92  |     await page.getByPlaceholder('tu@email.com').fill(TEST_EMAIL);
  93  |     await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  94  |     await page.getByRole('button', { name: /ingresar/i }).click();
  95  |     await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  96  |   });
  97  | 
  98  |   test('E2E-07: Dashboard muestra el nombre del usuario', async ({ page }) => {
  99  |     // Dashboard should show some user-specific content
  100 |     await expect(page.locator('body')).not.toBeEmpty();
  101 |     // Verify the page loaded with actual content (not a blank page)
  102 |     const bodyText = await page.locator('body').textContent();
  103 |     expect(bodyText?.length).toBeGreaterThan(50);
  104 |   });
  105 | 
  106 |   test('E2E-08: Dashboard tiene navegacion lateral funcional', async ({ page }) => {
  107 |     // Check that navigation/sidebar exists
  108 |     const nav = page.locator('nav, [class*="sidebar"], [class*="nav"]');
  109 |     await expect(nav.first()).toBeVisible({ timeout: 5000 });
  110 |   });
  111 | 
  112 |   test('E2E-09: Navega del dashboard a sesiones', async ({ page }) => {
  113 |     await page.getByText(/sesiones/i).first().click();
  114 |     await expect(page).toHaveURL(/sessions/, { timeout: 5000 });
  115 |   });
  116 | 
  117 |   test('E2E-10: Navega del dashboard a vacantes', async ({ page }) => {
  118 |     await page.getByText(/vacantes/i).first().click();
  119 |     await expect(page).toHaveURL(/vacancies|vacantes/, { timeout: 5000 });
  120 |   });
  121 | 
  122 | });
  123 | 
  124 | // ============================================================
  125 | // Proteccion de rutas
  126 | // ============================================================
  127 | 
  128 | test.describe('E2E: Proteccion de rutas', () => {
  129 | 
  130 |   test('E2E-11: Redirige a login si accede a /dashboard sin auth', async ({ page }) => {
  131 |     await page.goto('/dashboard');
  132 |     // Should redirect to login page
  133 |     await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 5000 });
  134 |   });
  135 | 
  136 |   test('E2E-12: Redirige a login si accede a /sessions sin auth', async ({ page }) => {
  137 |     await page.goto('/sessions');
  138 |     await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 5000 });
  139 |   });
  140 | 
  141 |   test('E2E-13: Redirige a login si accede a /profile sin auth', async ({ page }) => {
  142 |     await page.goto('/profile');
  143 |     await expect(page.getByText('Iniciar Sesión')).toBeVisible({ timeout: 5000 });
  144 |   });
  145 | 
  146 | });
  147 | 
  148 | // ============================================================
  149 | // Vacantes (publico + autenticado)
  150 | // ============================================================
  151 | 
  152 | test.describe('E2E: Vacantes', () => {
  153 | 
  154 |   test('E2E-14: La pagina de vacantes carga y muestra contenido', async ({ page }) => {
  155 |     // Login first
  156 |     await page.goto('/');
  157 |     await page.getByPlaceholder('tu@email.com').fill(TEST_EMAIL);
  158 |     await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  159 |     await page.getByRole('button', { name: /ingresar/i }).click();
  160 |     await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });
  161 | 
  162 |     // Navigate to vacancies
  163 |     await page.getByText(/vacantes/i).first().click();
  164 |     await expect(page).toHaveURL(/vacancies|vacantes/, { timeout: 5000 });
  165 | 
  166 |     // Page should have loaded content
  167 |     const bodyText = await page.locator('body').textContent();
  168 |     expect(bodyText?.length).toBeGreaterThan(100);
  169 |   });
  170 | 
```