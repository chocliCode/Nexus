# Tipos de Pruebas de Software -- Aplicado a NEXUS

---

## TL;DR -- Respuesta directa

> **"Que tipo de pruebas tiene NEXUS?"**

| Tipo | Tiene NEXUS? | Detalle |
|---|---|---|
| Unitarias | No | No hay ninguna prueba unitaria pura |
| Integracion | **Si** | Es el tipo principal -- 34 tests de API contra DB real |
| Componente (UI) | **Si** (minimo) | Solo 1 archivo: LoginPage (3 tests) |
| Carga | No | No hay herramientas de carga (k6, Artillery, JMeter) |
| Estres | No | No hay pruebas de estres |
| E2E | No | No hay Cypress, Playwright ni Selenium |
| Seguridad | Parcial | Solo verifica JWT basico, no hay pentesting |
| Regresion | Implicito | El CI corre los tests en cada push, eso funciona como regresion |

**En resumen: NEXUS tiene pruebas de integracion y pruebas de componente. No tiene pruebas unitarias puras, de carga, de estres ni E2E.**

---

## 1. La Piramide de Testing

La piramide de testing es el modelo clasico que organiza los tipos de pruebas por cantidad, velocidad y costo:

```
          /\
         /  \
        / E2E\            Pocas, lentas, caras
       /------\
      /  Inte- \
     / gracion  \         Cantidad media
    /------------\
   /  Unitarias   \       Muchas, rapidas, baratas
  /________________\
```

| Nivel | Cantidad ideal | Velocidad | Costo | Que prueban |
|---|---|---|---|---|
| Unitarias | Muchas (base) | Muy rapidas (ms) | Bajo | Una funcion/clase aislada |
| Integracion | Media | Medias (seg) | Medio | Varios modulos juntos |
| E2E | Pocas (punta) | Lentas (min) | Alto | Flujo completo como un usuario real |

**NEXUS tiene la piramide invertida:** muchas pruebas de integracion, casi nada de unitarias, y cero E2E.

---

## 2. Todos los Tipos de Pruebas Explicados

### 2.1 Pruebas Unitarias

**Que son:** Prueban una sola funcion, metodo o clase de forma **aislada**. Se reemplazan las dependencias externas (base de datos, APIs, etc.) con **mocks** o **stubs**.

**Caracteristicas:**
- No tocan la base de datos
- No hacen requests HTTP
- No dependen de servicios externos
- Se ejecutan en milisegundos
- Son las mas faciles de escribir y mantener

**Ejemplo conceptual** (lo que NEXUS podria tener pero NO tiene):
```typescript
// Ejemplo de prueba unitaria para la validacion de password
import { validatePassword } from '../utils/validators';

describe('validatePassword', () => {
  it('rechaza passwords menores a 8 caracteres', () => {
    expect(validatePassword('abc')).toBe(false);
  });

  it('acepta passwords con mayuscula, minuscula y numero', () => {
    expect(validatePassword('SecurePass123!')).toBe(true);
  });
});
```

```typescript
// Ejemplo de prueba unitaria con mock de base de datos
import { calcularScoreRiesgo } from '../services/iaService';

describe('calcularScoreRiesgo', () => {
  it('retorna nivel "critico" si no hay sesiones en 30 dias', () => {
    const datos = { sesionesUltimos30Dias: 0, okrsCompletados: 0 };
    const resultado = calcularScoreRiesgo(datos);
    expect(resultado.nivel).toBe('critico');
  });
});
```

> [!IMPORTANT]
> **NEXUS no tiene pruebas unitarias.** Ninguno de los 6 archivos de test prueba una funcion de forma aislada. Todos hacen HTTP requests y/o queries a PostgreSQL.

---

### 2.2 Pruebas de Integracion

**Que son:** Prueban que **varios modulos trabajan correctamente juntos**. Verifican la comunicacion entre capas: controlador + servicio + base de datos, o API + middleware + modelo.

**Caracteristicas:**
- Involucran multiples componentes reales (no mocks)
- Usan una base de datos real (de test)
- Hacen requests HTTP reales
- Son mas lentas que las unitarias
- Detectan problemas de "ensamblaje" entre modulos

**Ejemplo real de NEXUS** (de [auth.test.ts](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/auth.test.ts)):
```typescript
// Esto ES una prueba de integracion:
// Request HTTP real -> Express -> Middleware -> Controller -> Pool PostgreSQL
it('registra un nuevo Padawan correctamente', async () => {
  const res = await request(app)           // HTTP real con Supertest
    .post('/api/v1/auth/register')         // Endpoint real
    .send({                                // Body real
      nombres: 'Carlos',
      apellidos: 'Garcia',
      email: 'carlos@authtest.com',
      contrasena: 'SecurePass123!',
      rol: 'Padawan',
    });

  expect(res.status).toBe(201);            // Verifica HTTP status
  expect(res.body.data.token).toBeDefined(); // Verifica que genero JWT
});
```

**Por que son de integracion y NO unitarias:**
1. Levantan la app Express completa (`import app from '../src/app'`)
2. Hacen requests HTTP reales via Supertest
3. Pasan por el middleware de autenticacion real
4. Ejecutan queries reales contra PostgreSQL
5. Verifican la respuesta HTTP completa

> [!NOTE]
> **Las 34 pruebas del backend de NEXUS son todas de integracion.** Esta es la categoria correcta para responder a la pregunta.

---

### 2.3 Pruebas de Componente (UI)

**Que son:** Prueban componentes de la interfaz de usuario de forma aislada, sin un navegador real. Verifican que el componente se renderiza correctamente y responde a interacciones.

**Caracteristicas:**
- Usan un DOM simulado (jsdom)
- No abren un navegador real
- Verifican presencia de elementos, textos, eventos
- Son rapidas (similar a unitarias)

**Ejemplo real de NEXUS** (de [LoginPage.test.tsx](file:///c:/Users/USUARIO/Desktop/Nexus/frontend/src/test/LoginPage.test.tsx)):
```tsx
describe('LoginPage', () => {
  it('renders login form with email and password fields', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });
});
```

> [!NOTE]
> **NEXUS tiene 3 pruebas de componente**, todas en un solo archivo y solo para la pagina de Login. No hay tests para Dashboard, OKRs, Sesiones, Vacantes, ni ninguna otra pagina.

---

### 2.4 Pruebas End-to-End (E2E)

**Que son:** Simulan a un **usuario real** interactuando con la aplicacion completa. Abren un navegador real, navegan, hacen clic, llenan formularios, y verifican resultados visuales.

**Caracteristicas:**
- Usan un navegador real (Chrome, Firefox)
- Prueban el flujo completo: frontend + backend + base de datos
- Son las mas lentas y fragiles
- Son las que mas confianza dan de que "todo funciona"

**Herramientas comunes:** Cypress, Playwright, Selenium

**Ejemplo conceptual** (lo que NEXUS NO tiene):
```typescript
// Ejemplo con Playwright
test('Padawan puede completar un OKR', async ({ page }) => {
  // 1. Login
  await page.goto('http://localhost:5174/login');
  await page.fill('[name="email"]', 'padawan@nexus.com');
  await page.fill('[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // 2. Navegar a OKRs
  await page.click('text=Mis OKRs');
  await expect(page.locator('h1')).toHaveText('Mis OKRs');

  // 3. Completar OKR
  await page.click('text=Completar');
  await page.fill('[name="valor_actual"]', '5');
  await page.fill('[name="nota_cierre"]', 'Terminado');
  await page.click('text=Confirmar');

  // 4. Verificar
  await expect(page.locator('.badge-completado')).toBeVisible();
});
```

> [!IMPORTANT]
> **NEXUS no tiene pruebas E2E.** No hay Cypress, Playwright ni Selenium configurado en el proyecto.

---

### 2.5 Pruebas de Carga (Load Testing)

**Que son:** Miden como se comporta el sistema bajo una **carga normal o esperada** de usuarios concurrentes. Buscan responder: "aguanta el sistema 100 usuarios al mismo tiempo?"

**Caracteristicas:**
- Simulan multiples usuarios concurrentes
- Miden tiempos de respuesta (latencia)
- Miden throughput (requests por segundo)
- Identifican cuellos de botella
- Se ejecutan contra un entorno similar a produccion

**Herramientas comunes:** k6, Artillery, JMeter, Locust, Gatling

**Ejemplo conceptual** (lo que NEXUS NO tiene):
```javascript
// Ejemplo con k6
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Subir a 50 usuarios en 1 min
    { duration: '3m', target: 50 },   // Mantener 50 usuarios por 3 min
    { duration: '1m', target: 0 },    // Bajar a 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% de requests < 500ms
  },
};

export default function () {
  const res = http.get('http://localhost:3000/api/v1/vacancies');
  check(res, {
    'status 200': (r) => r.status === 200,
    'respuesta < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

**Metricas tipicas:**
| Metrica | Que mide | Valor aceptable tipico |
|---|---|---|
| Latencia p50 | Tiempo de respuesta mediano | < 200ms |
| Latencia p95 | El 95% de requests responde en menos de... | < 500ms |
| Latencia p99 | El 99% de requests responde en menos de... | < 1s |
| Throughput | Requests exitosos por segundo | Depende del sistema |
| Error rate | % de requests fallidos | < 1% |

> [!IMPORTANT]
> **NEXUS no tiene pruebas de carga.** No hay k6, Artillery, JMeter, Locust ni ninguna herramienta de carga configurada.

---

### 2.6 Pruebas de Estres (Stress Testing)

**Que son:** Llevan el sistema **mas alla de su capacidad normal** para descubrir su punto de quiebre. Buscan responder: "en que momento el sistema se cae? que pasa cuando se cae? se recupera solo?"

**Diferencia con pruebas de carga:**
| Aspecto | Carga | Estres |
|---|---|---|
| Objetivo | Verificar rendimiento esperado | Encontrar el punto de quiebre |
| Cantidad de usuarios | Carga normal/esperada | Mucho mas de lo esperado |
| Pregunta clave | "Funciona bien con 100 users?" | "Que pasa con 10,000 users?" |
| Que busca | Metricas de rendimiento | Fallos, degradacion, recuperacion |

**Ejemplo conceptual** (lo que NEXUS NO tiene):
```javascript
// Ejemplo con k6 - Stress test
export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Calentar
    { duration: '5m', target: 100 },   // Carga normal
    { duration: '2m', target: 500 },   // Subir a 5x
    { duration: '5m', target: 500 },   // Mantener estres
    { duration: '2m', target: 1000 },  // Subir a 10x
    { duration: '5m', target: 1000 },  // Mantener estres extremo
    { duration: '5m', target: 0 },     // Recuperacion
  ],
};
```

**Que se observa:**
- A que carga empiezan los errores 500
- Si la base de datos agota conexiones del pool
- Si el servidor se queda sin memoria
- Si se recupera solo cuando baja la carga
- Si hay fugas de memoria (memory leaks)

> [!IMPORTANT]
> **NEXUS no tiene pruebas de estres.**

---

### 2.7 Pruebas de Regresion

**Que son:** Verifican que los **cambios nuevos no rompieron funcionalidad existente**. No es un tipo de prueba en si, sino una **estrategia**: re-ejecutar todas las pruebas existentes despues de cada cambio.

**En NEXUS:** El pipeline CI/CD ([ci.yml](file:///c:/Users/USUARIO/Desktop/Nexus/.github/workflows/ci.yml)) ejecuta todos los tests en cada `push` y `pull request`. Esto funciona **implicitamente** como pruebas de regresion.

```yaml
on:
  push:
    branches: [main, develop, 'nexux/**']
  pull_request:
    branches: [main]
```

> [!NOTE]
> **NEXUS tiene regresion automatizada de forma implicita** gracias al CI. Cada vez que alguien hace push, se re-ejecutan las 37 pruebas.

---

### 2.8 Pruebas de Seguridad

**Que son:** Verifican que el sistema es resistente a ataques. Incluyen verificacion de autenticacion, autorizacion, inyeccion SQL, XSS, CSRF, etc.

**En NEXUS (parcial):**
- Verifica que endpoints protegidos retornan 401 sin JWT
- Verifica que un usuario no puede acceder a recursos de otro (403)
- Verifica autorizacion por roles (Padawan vs Jedi vs Admin)

**Lo que NO verifica:**
- Inyeccion SQL
- Cross-Site Scripting (XSS)
- Rate limiting efectivo
- Tokens expirados/manipulados
- CORS mal configurado
- Headers de seguridad (HSTS, CSP, etc.)

---

### 2.9 Pruebas de Humo (Smoke Testing)

**Que son:** Pruebas muy rapidas y superficiales que verifican que las funciones **mas criticas** funcionan. Es el "funciona el login? carga la pagina principal?" antes de hacer pruebas mas profundas.

**En NEXUS:** No tiene smoke tests dedicados, pero el CI ejecuta todo junto sin distinguir prioridades.

---

### 2.10 Pruebas de Aceptacion (UAT)

**Que son:** Verifican que el sistema cumple los **requisitos del negocio** desde la perspectiva del usuario final. Generalmente las ejecuta el cliente o el equipo de QA.

**En NEXUS:** No hay pruebas de aceptacion formales, aunque las pruebas de OKR validan reglas de negocio especificas (RN-01 a RN-06).

---

## 3. Tabla Comparativa Completa

| Tipo | Velocidad | Costo | Confianza | Fragilidad | Herramientas | NEXUS |
|---|---|---|---|---|---|---|
| Unitarias | Muy rapida | Bajo | Baja (aislada) | Baja | Jest, Vitest | No |
| Integracion | Media | Medio | Media-Alta | Media | Supertest, Jest | **Si (34 tests)** |
| Componente UI | Rapida | Bajo | Media | Baja | Testing Library | **Si (3 tests)** |
| E2E | Lenta | Alto | Muy alta | Alta | Cypress, Playwright | No |
| Carga | Media | Alto | Alta (perf) | Media | k6, JMeter | No |
| Estres | Lenta | Alto | Alta (perf) | Media | k6, Gatling | No |
| Seguridad | Variable | Alto | Alta (sec) | Baja | OWASP ZAP, Burp | Parcial |
| Regresion | Variable | Bajo (auto) | Alta | Baja | CI/CD | **Si (implicito)** |
| Humo | Muy rapida | Bajo | Baja | Baja | Cualquiera | No |
| Aceptacion | Lenta | Alto | Muy alta | Alta | Manual / Cucumber | No |

---

## 4. Que Tiene NEXUS Exactamente

### Lo que SI tiene

**34 pruebas de integracion de API (backend)** distribuidas en 5 archivos:

| Suite | Archivo | Tests | Modulo |
|---|---|---|---|
| Autenticacion | [auth.test.ts](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/auth.test.ts) | 7 | Registro, login, sesion JWT |
| OKRs | [okr.test.ts](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/okr.test.ts) | 6 | Completacion, ACID, permisos |
| Sesiones | [sessions.test.ts](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/sessions.test.ts) | 5 | CRUD sesiones de mentoria |
| IA | [ia.test.ts](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/ia.test.ts) | 4 | Riesgo de abandono |
| Notificaciones | [notifications.test.ts](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/notifications.test.ts) | 5 | Listar, leer, conteo |
| Vacantes | [vacancies.test.ts](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/vacancies.test.ts) | 9 | Publicar, postular, gestionar |

**3 pruebas de componente (frontend):**

| Suite | Archivo | Tests |
|---|---|---|
| LoginPage | [LoginPage.test.tsx](file:///c:/Users/USUARIO/Desktop/Nexus/frontend/src/test/LoginPage.test.tsx) | 3 |

**CI/CD con regresion automatica** via [ci.yml](file:///c:/Users/USUARIO/Desktop/Nexus/.github/workflows/ci.yml).

### Lo que NO tiene

- Pruebas unitarias puras (0)
- Pruebas E2E con navegador (0)
- Pruebas de carga (0)
- Pruebas de estres (0)
- Pruebas de humo dedicadas (0)
- Pruebas de aceptacion formales (0)

---

## 5. Respuesta para Andre

Si la pregunta es "que tipo de pruebas tiene el sistema?", la respuesta correcta es:

> **NEXUS tiene principalmente pruebas de integracion (API testing)** -- 34 tests que verifican los endpoints REST contra una base de datos PostgreSQL real. Tambien tiene 3 pruebas de componente para el frontend (LoginPage). El CI/CD ejecuta todas las pruebas automaticamente en cada push, lo que funciona como regresion automatizada.
>
> **No tiene:** pruebas unitarias puras, pruebas de carga, pruebas de estres, ni pruebas E2E.

Si quieres dar una respuesta mas "presentable":

> El sistema cuenta con **pruebas de integracion automatizadas** que validan los endpoints de la API REST (autenticacion, OKRs, sesiones, IA, notificaciones y vacantes) contra una base de datos real, **pruebas de componente** para la interfaz de usuario, y un **pipeline de CI/CD** que ejecuta todas las pruebas de forma automatica en cada cambio para garantizar la regresion. Las pruebas cubren caminos felices, validaciones de negocio (reglas RN-01 a RN-06), seguridad JWT, autorizacion por roles, e integridad transaccional ACID.
