# Pruebas de Seguridad -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 15 |
| **Tipo** | Seguridad (Security Testing) |
| **Framework** | Jest + Supertest |
| **Base de datos** | No requerida (tests aislados de la capa de validacion/auth) |
| **Archivo de test** | 1 |
| **Categorias** | SQL Injection, XSS, Auth/Authz, Headers HTTP, Payloads malformados |

### Que son las pruebas de seguridad

Las pruebas de seguridad verifican que el sistema es **resistente a ataques comunes**. No reemplazan un pentest profesional, pero cubren las vulnerabilidades mas frecuentes del OWASP Top 10.

### Como ejecutarlas

```bash
# Desde el directorio backend (no requiere PostgreSQL)
npm run test:security

# Con verbose
npx jest --testPathPattern=security --verbose --forceExit
```

### Configuracion

Usa la misma config de Jest que las pruebas de integracion, pero **no requiere base de datos**. Todos los tests estan disenados para funcionar solo con la capa de middleware/validacion de Express.

---

## Distribucion por Categoria

| # | Categoria OWASP | Tests | IDs |
|---|---|---|---|
| 1 | A03: Inyeccion (SQL) | 3 | SEC-01 a SEC-03 |
| 2 | A07: XSS | 2 | SEC-04, SEC-05 |
| 3 | A01: Control de acceso | 5 | SEC-06 a SEC-10 |
| 4 | A05: Configuracion de seguridad | 2 | SEC-11, SEC-12 |
| 5 | A04: Diseno inseguro | 3 | SEC-13 a SEC-15 |
| | **Total** | **15** | |

---

## 1. Inyeccion SQL (3 tests)

**Referencia OWASP:** A03:2021 - Injection

---

### SEC-01: Rechaza SQL injection en email de login

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Payload** | `email: "' OR '1'='1' --"` |
| **Objetivo** | Verificar que la inyeccion clasica `' OR '1'='1'` no bypasea la autenticacion |
| **Validacion** | Status != 200, campo `data` no presente en response |
| **Proteccion verificada** | Zod valida formato de email antes de llegar a la query SQL |

### SEC-02: Rechaza SQL injection en contrasena de login

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Payload** | `contrasena: "'; DROP TABLE usuario; --"` |
| **Objetivo** | Verificar que un DROP TABLE en la contrasena no se ejecuta |
| **Validacion** | Status != 200, health check sigue respondiendo 200 |
| **Proteccion verificada** | Parametrizacion de queries (pg usa `$1, $2`), bcrypt.compare recibe string |

### SEC-03: Rechaza SQL injection en multiples vectores de login

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Payloads** | `UNION SELECT`, `DROP TABLE`, `admin'--`, `OR 1=1` |
| **Objetivo** | Verificar que 4 patrones de inyeccion distintos son rechazados |
| **Validacion** | Ninguno retorna 200, ninguno leakea datos, servidor sigue vivo |
| **Proteccion verificada** | Validacion Zod + queries parametrizadas |

---

## 2. Cross-Site Scripting -- XSS (2 tests)

**Referencia OWASP:** A07:2021 - Cross-Site Scripting

---

### SEC-04: Neutraliza XSS en busqueda de vacantes

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/vacancies?search=<img src=x onerror=alert(1)>` |
| **Objetivo** | Verificar que tags HTML maliciosos no se reflejan en la respuesta JSON |
| **Validacion** | Response body no contiene `<img src=x` ni `onerror=` |
| **Proteccion verificada** | Express JSON serialization + no se refleja input crudo |

### SEC-05: Neutraliza XSS en query parameters

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/vacancies?modalidad=<script>alert(1)</script>` |
| **Objetivo** | Verificar que `<script>` tags en query params no se reflejan |
| **Validacion** | Response body no contiene `<script>` |
| **Proteccion verificada** | Enum validation (modalidad solo acepta Presencial/Remoto/Hibrido) |

---

## 3. Autenticacion y Autorizacion (5 tests)

**Referencia OWASP:** A01:2021 - Broken Access Control, A07:2021 - Identification and Authentication Failures

---

### SEC-06: Rechaza JWT con firma invalida

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/auth/me` |
| **Token** | JWT estructuralmente valido pero con firma falsa |
| **Objetivo** | Verificar que jwt.verify rechaza tokens con firma incorrecta |
| **Validacion** | Status 401 |
| **Ataque simulado** | Un atacante crea un JWT con payload `rol: "Admin"` pero sin el secret |

### SEC-07: Rechaza JWT expirado

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/auth/me` |
| **Token** | JWT con `exp: 1000000001` (expirado en 2001) |
| **Objetivo** | Verificar que tokens expirados no son aceptados |
| **Validacion** | Status 401 |
| **Proteccion verificada** | jwt.verify con verificacion de exp automatica |

### SEC-08: Rechaza request sin token de autorizacion

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/auth/me` |
| **Token** | Ninguno (sin header Authorization) |
| **Objetivo** | Verificar que la ausencia de token es detectada |
| **Validacion** | Status 401, `code: "AUTH_REQUIRED"` |
| **Proteccion verificada** | authMiddleware verifica presencia del header |

### SEC-09: Rechaza token con payload alterado

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/auth/me` |
| **Token** | JWT con payload alterado (userId, email, rol modificados) pero firma invalida |
| **Objetivo** | Verificar que un atacante no puede escalar privilegios alterando el payload |
| **Validacion** | Status 401 |
| **Ataque simulado** | Modificar `rol: "Padawan"` a `rol: "Admin"` en el payload |

### SEC-10: Rutas protegidas rechazan acceso sin token

| Campo | Detalle |
|---|---|
| **Endpoints** | `/auth/me`, `/sessions/my-sessions`, `/notifications`, `/ia/riesgo-abandono` |
| **Objetivo** | Verificar que 4 rutas protegidas distintas rechazan requests sin autenticacion |
| **Validacion** | Todas retornan 401 |
| **Proteccion verificada** | authMiddleware aplicado como middleware de ruta |

---

## 4. Headers y Configuracion HTTP (2 tests)

**Referencia OWASP:** A05:2021 - Security Misconfiguration

---

### SEC-11: No expone informacion interna en errores

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` (credenciales incorrectas) |
| **Objetivo** | Verificar que los errores no exponen stack traces, rutas de archivos, ni info de node_modules |
| **Validacion** | Response body no contiene `node_modules`, `at Object`, `\\src\\`, `/src/` |
| **Proteccion verificada** | errorMiddleware sanitiza mensajes en produccion |

### SEC-12: API responde con Content-Type JSON

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/health` |
| **Objetivo** | Verificar que la API responde con el Content-Type correcto |
| **Validacion** | Header `content-type` contiene `application/json` |
| **Importancia** | Sin Content-Type correcto, el navegador puede interpretar la respuesta como HTML (vector XSS) |

---

## 5. Payloads Malformados (3 tests)

**Referencia OWASP:** A04:2021 - Insecure Design

---

### SEC-13: Body vacio en login no causa crash

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Payload** | `{}` (objeto vacio) |
| **Objetivo** | Verificar que el servidor no crashea con input inesperado |
| **Validacion** | Status 400 (validacion Zod), health check retorna 200 despues |
| **Proteccion verificada** | Zod validation middleware intercepta antes del controller |

### SEC-14: Rechaza payload oversized

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Payload** | `contrasena: "x" × 1,000,000` (1MB string) |
| **Objetivo** | Verificar que payloads extremadamente grandes no causan DoS o crash |
| **Validacion** | Status != 200 y != 500 (rechazo graceful) |
| **Proteccion verificada** | Express body-parser limits, Zod max length validation |

### SEC-15: Zod schema ignora campos no permitidos (mass assignment)

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Payload extra** | `is_admin: true, role_override: "Admin", id: "000..."` |
| **Objetivo** | Verificar que campos no definidos en el schema Zod son descartados |
| **Validacion** | Campos extra no aparecen en `res.body.data.user`, server sigue vivo |
| **Ataque simulado** | Mass assignment -- el atacante intenta agregar campos para escalar privilegios |

---

## Matriz de Cobertura OWASP

| OWASP Top 10 2021 | Cubierto | Tests |
|---|---|---|
| A01: Broken Access Control | Si | SEC-06 a 10 |
| A02: Cryptographic Failures | Parcial | SEC-06, 07 (JWT) |
| A03: Injection | Si | SEC-01 a 03 |
| A04: Insecure Design | Si | SEC-13 a 15 |
| A05: Security Misconfiguration | Si | SEC-11, 12 |
| A06: Vulnerable Components | No | Requiere `npm audit` |
| A07: XSS | Si | SEC-04, 05 |
| A08: Software Integrity | No | Requiere verificacion de dependencias |
| A09: Logging Failures | Parcial | SEC-11 verifica que no se exponen logs |
| A10: SSRF | No | No aplica al diseño actual |

---

## Resultado de Ejecucion

```
PASS tests/security/security.test.ts
  Seguridad: Inyeccion SQL
    √ SEC-01: Rechaza SQL injection en email de login (39 ms)
    √ SEC-02: Rechaza SQL injection en contrasena de login (22 ms)
    √ SEC-03: Rechaza SQL injection en multiples vectores (20 ms)
  Seguridad: Cross-Site Scripting (XSS)
    √ SEC-04: Neutraliza XSS en busqueda de vacantes (10 ms)
    √ SEC-05: Neutraliza XSS en query parameters (7 ms)
  Seguridad: Autenticacion y Autorizacion
    √ SEC-06: Rechaza JWT con firma invalida (4 ms)
    √ SEC-07: Rechaza JWT expirado (3 ms)
    √ SEC-08: Rechaza request sin token de autorizacion (3 ms)
    √ SEC-09: Rechaza token con payload alterado (5 ms)
    √ SEC-10: Rutas protegidas rechazan acceso sin token (9 ms)
  Seguridad: Headers y configuracion HTTP
    √ SEC-11: No expone informacion interna en errores (6 ms)
    √ SEC-12: API responde con Content-Type JSON (2 ms)
  Seguridad: Payloads malformados
    √ SEC-13: Body vacio en login no causa crash (7 ms)
    √ SEC-14: Rechaza payload oversized (11 ms)
    √ SEC-15: Zod schema ignora campos no permitidos (9 ms)

Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
Time:        1.819 s
```

Todas las 15 pruebas de seguridad pasan correctamente.

---

## Estructura de Archivos

```
tests/
├── security/                             ← Pruebas de seguridad (15 tests)
│   └── security.test.ts                     (15 tests: SEC-01 a 15)
├── stress/                               ← Pruebas de estres (15 tests)
├── load/                                 ← Pruebas de carga (15 tests)
├── unit/                                 ← Pruebas unitarias (160 tests)
└── *.test.ts                             ← Integracion (36 tests)
```
