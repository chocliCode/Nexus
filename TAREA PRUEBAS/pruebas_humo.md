# Pruebas de Humo (Smoke Tests) -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 15 |
| **Tipo** | Humo (Smoke Testing) |
| **Framework** | Jest + Supertest |
| **Base de datos** | No requerida (tests evaluan la capa de ruteo y middleware) |
| **Archivo de test** | 1 |
| **Categorias** | Salud, Endpoints publicos, Middlewares, Proteccion de rutas, Rate limiting |

### Que son las pruebas de humo

Las pruebas de humo son **verificaciones rapidas y superficiales** disenadas para asegurar que las funciones mas criticas del sistema operan despues de un despliegue o build. Si una prueba de humo falla, el build se rechaza inmediatamente sin ejecutar pruebas mas costosas (como integracion o E2E).

En NEXUS, estas pruebas se enfocan en comprobar que:
1. El servidor Express se levanta y responde HTTP.
2. Los middlewares globales (CORS, body-parser, rate-limiter) no bloquean el trafico valido.
3. Las rutas principales existen y estan protegidas (retornan 401 en lugar de 404 o 500).

### Como ejecutarlas

```bash
# Desde el directorio backend
npm run test:smoke

# Con verbose
npx jest --testPathPattern=smoke --verbose --forceExit
```

---

## Distribucion por Categoria

| # | Categoria | Tests | IDs |
|---|---|---|---|
| 1 | Salud del Sistema | 2 | SMOKE-01, 02 |
| 2 | Endpoints Publicos | 4 | SMOKE-03 a 06 |
| 3 | Middlewares | 2 | SMOKE-07, 08 |
| 4 | Proteccion de Rutas Principales | 5 | SMOKE-09 a 13 |
| 5 | Integracion DB (Simulada) / APIs | 2 | SMOKE-14, 15 |
| | **Total** | **15** | |

---

## Detalle de Pruebas

### 1. Salud del Sistema

| ID | Que verifica | Endpoint | Resultado Esperado |
|---|---|---|---|
| **SMOKE-01** | El servidor Express se inicia sin crashear y el endpoint de health funciona. | `GET /api/v1/health` | HTTP 200 y body con `{ status: 'ok' }` |
| **SMOKE-02** | El ruteo base funciona y el handler 404 global captura las rutas inexistentes. | `GET /ruta-inexistente` | HTTP 404 (no un timeout ni crash) |

### 2. Endpoints Publicos

| ID | Que verifica | Endpoint | Resultado Esperado |
|---|---|---|---|
| **SMOKE-03** | La API rechaza verbos HTTP no permitidos correctamente. | `PUT /api/v1/auth/login` | HTTP 404 (method not allowed / not found) |
| **SMOKE-04** | El manejador de errores responde con la estructura JSON estándar de la API (`code: NOT_FOUND`). | `GET /api/v1/not-found` | El JSON tiene la llave `code` |
| **SMOKE-05** | El endpoint de login esta accesible, montado correctamente y la validacion de Zod esta activa (rechaza body vacio). | `POST /api/v1/auth/login` | HTTP 400 (Bad Request) |
| **SMOKE-06** | El endpoint de registro (Padawan) esta accesible y la validacion funciona. | `POST /api/v1/auth/register` | HTTP 400 (Bad Request) |

### 3. Middlewares

| ID | Que verifica | Endpoint | Resultado Esperado |
|---|---|---|---|
| **SMOKE-07** | El middleware de CORS esta activo y responde a peticiones preflight. | `OPTIONS /api/v1/health` | Existen headers CORS (`access-control-allow-origin`) |
| **SMOKE-08** | El body-parser captura JSON invalido sin crashear la aplicacion entera. | `POST /api/v1/auth/login` (malformed JSON) | HTTP 400 (Bad Request) |

### 4. Proteccion de Rutas Principales

| ID | Que verifica | Endpoint | Resultado Esperado |
|---|---|---|---|
| **SMOKE-09** | La ruta base de perfiles esta protegida. | `GET /api/v1/auth/me` | HTTP 401 |
| **SMOKE-10** | El modulo de sesiones (Mentorias) requiere JWT. | `GET /api/v1/sessions/my-sessions` | HTTP 401 |
| **SMOKE-11** | El modulo de perfil (`/profile/me`) requiere JWT. | `GET /api/v1/profile/me` | HTTP 401 |
| **SMOKE-12** | El sistema de notificaciones requiere JWT. | `GET /api/v1/notifications` | HTTP 401 |
| **SMOKE-13** | Los endpoints de IA (Riesgo de abandono) requieren JWT. | `GET /api/v1/ia/riesgo-abandono` | HTTP 401 |

> **Nota:** Que retornen `401` en lugar de `404` confirma que las rutas **estan montadas correctamente** en el router de Express y que el Auth Middleware esta interceptando la peticion.

### 5. Integracion DB y API

| ID | Que verifica | Endpoint | Resultado Esperado |
|---|---|---|---|
| **SMOKE-14** | La API rechaza versiones de API que no soporta. | `GET /api/v2/health` | HTTP 404 |
| **SMOKE-15** | El Rate Limiter esta configurado pero permite rafagas cortas legitimas (no bloquea al primer o segundo request). | `GET /api/v1/health` (x3) | El 3er request sigue retornando HTTP 200 |

---

## Resultado de Ejecucion

```
PASS tests/smoke/smoke.test.ts
  Pruebas de Humo (Smoke Tests)
    Salud del Sistema
      √ SMOKE-01: El endpoint de health check responde 200 (16 ms)
      √ SMOKE-02: La aplicacion Express esta escuchando peticiones (5 ms)
    Endpoints Publicos
      √ SMOKE-03: La API maneja correctamente verbos HTTP no permitidos (5 ms)
      √ SMOKE-04: La API responde con el formato JSON correcto en errores (3 ms)
      √ SMOKE-05: El endpoint de login esta expuesto y valida requests (30 ms)
      √ SMOKE-06: El endpoint de registro esta expuesto y valida requests (7 ms)
    Middlewares
      √ SMOKE-07: El middleware de CORS esta activo (3 ms)
      √ SMOKE-08: El middleware de parseo JSON funciona (13 ms)
    Proteccion de Rutas Principales
      √ SMOKE-09: La ruta GET /auth/me esta protegida (4 ms)
      √ SMOKE-10: La ruta GET /sessions/my-sessions esta protegida (3 ms)
      √ SMOKE-11: La ruta GET /profile/me esta protegida (3 ms)
      √ SMOKE-12: La ruta GET /notifications esta protegida (3 ms)
      √ SMOKE-13: La ruta GET /ia/riesgo-abandono esta protegida (2 ms)
    Integracion DB
      √ SMOKE-14: La API rechaza versiones no soportadas (3 ms)
      √ SMOKE-15: El rate limiter permite multiples requests rapidos sin bloquear inmediatamente (7 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        1.847 s
```

Todas las 15 pruebas de humo pasan correctamente de manera aislada (sin depender de PostgreSQL).
