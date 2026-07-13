# Tipos de Pruebas de Software -- Aplicado a NEXUS (Versión Final)

---

## TL;DR -- Respuesta directa

> **"¿Qué tipo de pruebas tiene NEXUS?"**

Actualmente, NEXUS cubre la pirámide de testing completa con **más de 475 pruebas automatizadas**.

| Tipo | Tiene NEXUS? | Detalle |
|---|---|---|
| Unitarias | **Sí** | Validaciones (Zod), middlewares, y types (11 archivos) |
| Integración | **Sí** | Es el core del backend, probando API contra DB real |
| Humo (Smoke) | **Sí** | Verificaciones rápidas de health y endpoints vitales |
| Aceptación | **Sí** | Flujos completos a nivel de API (onboarding, flujos complejos) |
| Componente (UI) | **Sí** | Pruebas de renderizado de React (LoginPage, ExtraPage) |
| Carga | **Sí** | 6 escenarios usando Artillery |
| Estrés | **Sí** | 6 escenarios usando Artillery (picos, endurance, limites) |
| E2E | **Sí** | 3 scripts completos con Playwright en navegador real |
| Seguridad | **Sí** | Pruebas de JWT, SQLi, y XSS. ZAP DAST en pipeline |

**En resumen: NEXUS tiene pruebas unitarias, de integración, de interfaz de usuario, de carga, de estrés, E2E y de seguridad.**

---

## 1. La Pirámide de Testing (Actualizada)

La pirámide de testing clásica organiza los tipos de pruebas por cantidad, velocidad y costo. En nuestro proyecto final, NEXUS respeta este modelo:

```text
          /\
         /  \
        / E2E\            (Playwright) - Pocas, lentas, prueban flujos críticos
       /------\
      /  Inte- \          (Jest Supertest) - Cantidad media, prueban endpoints
     / gracion  \         
    /------------\
   /  Unitarias   \       (Jest) - Muchas, rápidas, prueban esquemas y middlewares
  /________________\
```

---

## 2. Todos los Tipos de Pruebas Explicados con Ejemplos de NEXUS

### 2.1 Pruebas Unitarias

**Qué son:** Prueban una sola función, esquema o middleware de forma aislada.

**En NEXUS:**
Se implementan en `backend/tests/unit/`. Prueban los esquemas de validación (Zod), middlewares de autenticación y de manejo de errores, sin tocar la base de datos.

```typescript
// Ejemplo de prueba unitaria en NEXUS (auth.schema.unit.test.ts)
import { registerSchema } from '../../../src/schemas/auth.schema';

describe('Register Schema Unit Tests', () => {
  it('Debe rechazar una contraseña débil', () => {
    const result = registerSchema.safeParse({
      email: 'test@test.com',
      contrasena: '123' // Contraseña inválida
    });
    expect(result.success).toBe(false);
  });
});
```

### 2.2 Pruebas de Integración

**Qué son:** Prueban que varios módulos trabajan correctamente juntos (API + DB).

**En NEXUS:**
Representan la mayoría de los tests en `backend/tests/`. Prueban los endpoints enviando requests HTTP reales y verificando los cambios en la base de datos PostgreSQL.

```typescript
// Ejemplo de prueba de integración en NEXUS (courses.test.ts)
it('Permite a un Mentor crear un curso nuevo', async () => {
  const res = await request(app)
    .post('/api/v1/courses')
    .set('Authorization', `Bearer ${tokenJedi}`)
    .send({ titulo: 'React Avanzado', descripcion: '...' });

  expect(res.status).toBe(201);
  expect(res.body.data).toHaveProperty('curso_id');
});
```

### 2.3 Pruebas de Componente (UI)

**Qué son:** Prueban componentes frontend aislados usando DOM virtual (jsdom).

**En NEXUS:**
Implementadas en `frontend/src/test/`. Verifican que la interfaz renderice correctamente y reaccione a eventos.

```tsx
// Ejemplo de prueba de componente (LoginPage.test.tsx)
it('Muestra error si se envía formulario vacío', async () => {
  render(<LoginPage />);
  fireEvent.click(screen.getByRole('button', { name: /ingresar/i }));
  expect(await screen.findByText(/el correo es requerido/i)).toBeInTheDocument();
});
```

### 2.4 Pruebas End-to-End (E2E)

**Qué son:** Prueban todo el sistema desde la perspectiva del usuario final en un navegador real.

**En NEXUS:**
Usamos **Playwright** (`frontend/e2e/`). Levanta un navegador Chromium, hace clic, navega, verifica flujos completos (ej. Flujo del Mentor asignando notas).

```typescript
// Ejemplo de E2E (grades_export.spec.ts)
test('Mentor asigna nota y exporta CSV', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'jedi@gmail.com');
  await page.fill('input[type="password"]', 'Test1234!');
  await page.click('button:has-text("Ingresar")');
  await expect(page).toHaveURL(/.*\/dashboard/);
  // ... simula toda la navegación real hasta descargar un CSV
});
```

### 2.5 Pruebas de Carga y Estrés

**Qué son:** Evalúan el rendimiento del sistema bajo demanda. La carga prueba picos esperados; el estrés prueba hasta romper el sistema.

**En NEXUS:**
Implementadas con **Artillery** en `backend/tests/load/` y `backend/tests/stress/`. 

```yaml
# Ejemplo de escenario de carga (load-auth.yml)
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 50 # 50 usuarios por segundo intentando hacer login
scenarios:
  - flow:
      - post:
          url: "/api/v1/auth/login"
          json:
            email: "jedi@gmail.com"
            contrasena: "Test1234!"
```

### 2.6 Pruebas de Seguridad (DevSecOps)

**Qué son:** Verifican que el sistema no sea vulnerable a ataques (OWASP).

**En NEXUS:**
Tenemos pruebas de inyección SQL, bypass de JWT, y validación estricta de payloads en `backend/tests/security/`. Además, el pipeline CI incluye **CodeQL (SAST)** para escanear el código y **OWASP ZAP (DAST)** para atacar la API dinámica.

### 2.7 Pruebas de Humo (Smoke) y Aceptación

**Humo:** Verifican que lo básico funcione (ej. base de datos conectada, endpoints respondiendo `200 OK`). Implementadas en `backend/tests/smoke/`.
**Aceptación:** Verifican que los flujos de negocio cumplen con lo prometido al cliente final. Implementadas en `backend/tests/acceptance/`.
