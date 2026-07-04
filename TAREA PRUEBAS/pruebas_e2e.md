# Pruebas End-to-End (E2E) -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 15 |
| **Tipo** | End-to-End (navegador real) |
| **Framework** | Playwright |
| **Navegador** | Chromium |
| **Archivo de test** | 1 |
| **Flujos cubiertos** | Login, Registro, Dashboard, Rutas protegidas, Vacantes, Logout |

### Que son las pruebas E2E

Las pruebas E2E verifican flujos completos desde la perspectiva del usuario final, usando un **navegador real** (Chromium). A diferencia de las pruebas de componente (que usan jsdom), las E2E:

- Abren un navegador real y navegan la aplicacion
- Interactuan con el frontend Y el backend simultaneamente
- Verifican la integracion completa: UI → API → DB → respuesta visual
- Detectan problemas de routing, redirecciones, y estado global

| Aspecto | Componente (UI) | E2E |
|---|---|---|
| Entorno | jsdom (simulado) | Chromium (real) |
| Backend | Mockeado | Real (corriendo) |
| Base de datos | No | Si |
| Velocidad | ~ms | ~segundos |
| Que verifica | Un componente | Un flujo completo |

### Como ejecutarlas

```bash
# Pre-requisito: backend y frontend corriendo
cd backend && npm run dev   # Terminal 1
cd frontend && npm run dev  # Terminal 2

# En otra terminal:
cd frontend && npm run test:e2e

# Con UI visual (ver el navegador)
cd frontend && npx playwright test --headed

# Solo un test especifico
cd frontend && npx playwright test -g "E2E-01"

# Generar reporte HTML
cd frontend && npx playwright show-report
```

### Configuracion

**Config:** [`playwright.config.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/frontend/playwright.config.ts)

```typescript
{
  testDir: './e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    port: 5174,
    reuseExistingServer: true,
  },
}
```

### Pre-requisitos

1. Backend corriendo en `localhost:3000`
2. Frontend corriendo en `localhost:5174`
3. PostgreSQL con datos de test
4. Usuario E2E registrado: `e2etest@e2etest.com` / `E2eTestPass123!`
5. Chromium instalado: `npx playwright install chromium`

---

## Distribucion por Flujo

| # | Flujo | Tests | IDs |
|---|---|---|---|
| 1 | Login | 4 | E2E-01 a E2E-04 |
| 2 | Registro | 2 | E2E-05, E2E-06 |
| 3 | Dashboard | 4 | E2E-07 a E2E-10 |
| 4 | Proteccion de rutas | 3 | E2E-11 a E2E-13 |
| 5 | Vacantes | 1 | E2E-14 |
| 6 | Logout | 1 | E2E-15 |
| | **Total** | **15** | |

---

## 1. Flujo de Login (4 tests)

**Archivo:** [`nexus.spec.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/frontend/e2e/nexus.spec.ts)

---

### E2E-01: La pagina de login carga correctamente

| Campo | Detalle |
|---|---|
| **Flujo** | Navegar a `/` → verificar elementos del formulario |
| **Verificaciones** | "NEXUS" visible, "Iniciar Sesion" visible, input email visible, input password visible, boton "Ingresar" visible |
| **Capas involucradas** | Frontend routing, renderizado React, CSS |

### E2E-02: Muestra error con credenciales invalidas

| Campo | Detalle |
|---|---|
| **Flujo** | Llenar email incorrecto → llenar password → click Ingresar → esperar error |
| **Verificaciones** | Mensaje de error visible en la UI |
| **Capas involucradas** | Frontend → API POST /auth/login → bcrypt.compare falla → error 401 → React state → renderizado condicional |

### E2E-03: Login exitoso redirige al dashboard

| Campo | Detalle |
|---|---|
| **Flujo** | Llenar credenciales validas → click Ingresar → esperar redireccion |
| **Verificaciones** | URL cambia a `/dashboard` |
| **Capas involucradas** | Frontend → API login → JWT generado → localStorage → React Router navigate → Dashboard carga |

### E2E-04: Validacion client-side rechaza email invalido

| Campo | Detalle |
|---|---|
| **Flujo** | Escribir "not-an-email" en email → submit → esperar error Zod |
| **Verificaciones** | Texto "Email invalido" aparece sin hacer request al backend |
| **Capas involucradas** | react-hook-form → zodResolver → renderizado de error inline |

---

## 2. Flujo de Registro (2 tests)

### E2E-05: Navega de login a registro

| Campo | Detalle |
|---|---|
| **Flujo** | Desde `/` → click "Registrate aqui" → verificar redireccion |
| **Verificaciones** | URL cambia a `/register`, "Crear Cuenta" visible |
| **Capas involucradas** | React Router `<Link>`, renderizado de RegisterPage |

### E2E-06: La pagina de registro muestra todos los campos

| Campo | Detalle |
|---|---|
| **Flujo** | Navegar a `/register` → verificar inputs |
| **Verificaciones** | Placeholders "Carlos", "Garcia", "tu@email.com", "........" visibles |
| **Capas involucradas** | Frontend routing, RegisterPage renderizado |

---

## 3. Dashboard (4 tests)

**Precondicion:** Cada test hace login automatico en `beforeEach`.

### E2E-07: Dashboard muestra contenido del usuario

| Campo | Detalle |
|---|---|
| **Flujo** | Login → dashboard carga → verificar contenido |
| **Verificaciones** | Body tiene mas de 50 caracteres (no esta vacia ni rota) |
| **Capas involucradas** | Auth → API /me → dashboard data fetching → renderizado |

### E2E-08: Dashboard tiene navegacion lateral funcional

| Campo | Detalle |
|---|---|
| **Flujo** | Login → dashboard → verificar presencia de nav/sidebar |
| **Verificaciones** | Elemento `nav` o `[class*="sidebar"]` visible |
| **Capas involucradas** | Layout principal, componente de navegacion |

### E2E-09: Navega del dashboard a sesiones

| Campo | Detalle |
|---|---|
| **Flujo** | Login → dashboard → click "Sesiones" → verificar URL |
| **Verificaciones** | URL contiene `/sessions` |
| **Capas involucradas** | Navegacion React Router, SessionsPage renderizado |

### E2E-10: Navega del dashboard a vacantes

| Campo | Detalle |
|---|---|
| **Flujo** | Login → dashboard → click "Vacantes" → verificar URL |
| **Verificaciones** | URL contiene `/vacancies` o `/vacantes` |
| **Capas involucradas** | Navegacion React Router, VacanciesPage renderizado |

---

## 4. Proteccion de Rutas (3 tests)

### E2E-11: Redirige a login si accede a /dashboard sin auth

| Campo | Detalle |
|---|---|
| **Flujo** | Navegar directamente a `/dashboard` sin token |
| **Verificaciones** | Se muestra "Iniciar Sesion" (redireccion a login) |
| **Importancia** | Verifica que el guard de autenticacion funciona en el frontend |

### E2E-12: Redirige a login si accede a /sessions sin auth

| Campo | Detalle |
|---|---|
| **Flujo** | Navegar directamente a `/sessions` sin token |
| **Verificaciones** | Se muestra "Iniciar Sesion" |
| **Importancia** | Rutas de datos sensibles estan protegidas |

### E2E-13: Redirige a login si accede a /profile sin auth

| Campo | Detalle |
|---|---|
| **Flujo** | Navegar directamente a `/profile` sin token |
| **Verificaciones** | Se muestra "Iniciar Sesion" |
| **Importancia** | Perfil personal no es accesible sin autenticacion |

---

## 5. Vacantes (1 test)

### E2E-14: La pagina de vacantes carga y muestra contenido

| Campo | Detalle |
|---|---|
| **Flujo** | Login → dashboard → click vacantes → verificar contenido |
| **Verificaciones** | Pagina carga con > 100 caracteres de contenido |
| **Capas involucradas** | Auth → navegacion → API GET /vacancies → renderizado de lista |

---

## 6. Logout (1 test)

### E2E-15: Logout redirige a la pagina de login

| Campo | Detalle |
|---|---|
| **Flujo** | Login → dashboard → click logout → verificar redireccion |
| **Verificaciones** | "Iniciar Sesion" visible tras logout |
| **Capas involucradas** | Auth context → localStorage.removeItem → React Router → LoginPage |

---

## Matriz de Cobertura

### Por capa del sistema

| Capa | Tests que la tocan |
|---|---|
| React Router (navegacion) | E2E-03, 05, 09, 10, 11, 12, 13, 15 |
| Auth context (login/logout) | E2E-02, 03, 07, 08, 09, 10, 14, 15 |
| Zod validation (client-side) | E2E-04 |
| API Backend | E2E-02, 03, 07, 09, 10, 14 |
| PostgreSQL | E2E-03, 07, 14 |
| Renderizado visual | Todos |

### Flujos de usuario cubiertos

| Journey | Tests |
|---|---|
| Usuario llega → ve login → entra | E2E-01, 03 |
| Usuario llega → se registra | E2E-05, 06 |
| Usuario navega la app | E2E-07, 08, 09, 10 |
| Atacante intenta acceder sin auth | E2E-11, 12, 13 |
| Usuario hace login invalido | E2E-02, 04 |
| Usuario cierra sesion | E2E-15 |

---

## Estructura de Archivos

```
frontend/
├── e2e/                              ← Pruebas E2E (15 tests)
│   └── nexus.spec.ts                    (15 tests: E2E-01 a 15)
├── playwright.config.ts              ← Configuracion Playwright
├── src/test/                         ← Pruebas de componente (15 tests)
│   ├── LoginPage.test.tsx
│   └── setup.ts
└── ...
```
