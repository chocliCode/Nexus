# Pruebas de Integracion -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 36 |
| **Tipo** | Integracion (API Testing) |
| **Framework** | Jest + Supertest |
| **Base de datos** | PostgreSQL (instancia de test) |
| **Archivos de test** | 6 |
| **Modulos cubiertos** | Autenticacion, OKRs, Sesiones, IA, Notificaciones, Vacantes |

### Por que son pruebas de integracion

Todas las pruebas siguen el mismo patron: hacen **requests HTTP reales** a traves de Supertest contra la aplicacion Express completa, que a su vez ejecuta **queries reales** contra PostgreSQL. Esto significa que cada test involucra multiples capas:

```
Supertest → Express Router → Middleware (auth, validation) → Controller → PostgreSQL
```

No se usan mocks ni stubs. La base de datos es real (`.env.test`), los middlewares son reales, y las respuestas HTTP son reales.

---

## Distribucion por Modulo

| # | Modulo | Archivo | Tests | Cobertura |
|---|---|---|---|---|
| 1 | Autenticacion | `auth.test.ts` | 7 | Registro, login, sesion JWT, validaciones |
| 2 | OKRs | `okr.test.ts` | 6 | Completar OKR, permisos, estados, ACID |
| 3 | Sesiones | `sessions.test.ts` | 5 | CRUD sesiones de mentoria |
| 4 | IA | `ia.test.ts` | 4 | Riesgo de abandono, permisos por rol |
| 5 | Notificaciones | `notifications.test.ts` | 5 | Listar, leer, conteo, marcar todas |
| 6 | Vacantes | `vacancies.test.ts` | 9 | Publicar, buscar, postular, gestionar |
| | **Total** | | **36** | |

---

## 1. Modulo de Autenticacion (7 tests)

**Archivo:** [`auth.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/auth.test.ts)

**Setup/Teardown:**
- `afterAll`: Limpia usuarios de test eliminando registros con email `%@authtest.com`

**Dependencias integradas:** Express app, middleware de validacion Zod (`registerSchema`, `loginSchema`), bcrypt (hashing), JWT (generacion), PostgreSQL (tabla `usuario`, `perfil_aprendiz`)

---

### 1.1 POST /api/v1/auth/register

#### INT-AUTH-01: Registra un nuevo Padawan correctamente

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que un usuario con rol Padawan se registra exitosamente, creando el usuario en la tabla `usuario` y su perfil en `perfil_aprendiz` dentro de una transaccion |
| **Endpoint** | `POST /api/v1/auth/register` |
| **Input** | `{ nombres: "Carlos", apellidos: "Garcia", email: "carlos@authtest.com", contrasena: "SecurePass123!", rol: "Padawan" }` |
| **Status esperado** | `201 Created` |
| **Validaciones** | `res.body.success === true`, token JWT definido, `res.body.data.user.rol === "Padawan"` |
| **Capas involucradas** | Router → Rate Limiter → Zod validation → Controller → bcrypt hash → BEGIN/COMMIT PostgreSQL |

#### INT-AUTH-02: Retorna 409 cuando el email ya existe

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica la constraint de unicidad del email. Al intentar registrar un email duplicado, el sistema responde con conflicto |
| **Endpoint** | `POST /api/v1/auth/register` |
| **Input** | Mismo email que INT-AUTH-01 (`carlos@authtest.com`) |
| **Status esperado** | `409 Conflict` |
| **Validaciones** | `res.body.code === "EMAIL_DUPLICATE"` |
| **Capas involucradas** | Router → Controller → SELECT de verificacion en PostgreSQL |

#### INT-AUTH-03: Retorna 400 con datos invalidos

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el middleware de validacion Zod rechaza datos que no cumplen el schema (email invalido, password corta, campos faltantes) |
| **Endpoint** | `POST /api/v1/auth/register` |
| **Input** | `{ email: "notvalid", contrasena: "123" }` (faltan nombres, apellidos, rol) |
| **Status esperado** | `400 Bad Request` |
| **Validaciones** | `res.body.code === "VALIDATION_ERROR"` |
| **Capas involucradas** | Router → Zod middleware (corta antes de llegar al controller) |

---

### 1.2 POST /api/v1/auth/login

#### INT-AUTH-04: Retorna JWT con credenciales validas

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que un usuario registrado puede autenticarse y recibe un token JWT valido |
| **Endpoint** | `POST /api/v1/auth/login` |
| **Input** | `{ email: "carlos@authtest.com", contrasena: "SecurePass123!" }` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `res.body.data.token` definido |
| **Capas involucradas** | Router → Zod validation → Controller → SELECT PostgreSQL → bcrypt.compare → jwt.sign |

#### INT-AUTH-05: Retorna 401 con contrasena incorrecta

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que credenciales invalidas son rechazadas con el codigo de error apropiado |
| **Endpoint** | `POST /api/v1/auth/login` |
| **Input** | `{ email: "carlos@authtest.com", contrasena: "WrongPass" }` |
| **Status esperado** | `401 Unauthorized` |
| **Validaciones** | `res.body.code === "INVALID_CREDENTIALS"` |
| **Capas involucradas** | Router → Controller → SELECT PostgreSQL → bcrypt.compare (falla) |

---

### 1.3 GET /api/v1/auth/me

#### INT-AUTH-06: Retorna datos del usuario autenticado

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica el flujo completo de autenticacion: primero hace login para obtener el token, luego usa ese token para consultar `/me`. Valida que el middleware `authMiddleware` decodifica el JWT correctamente |
| **Endpoint** | `GET /api/v1/auth/me` |
| **Pre-condicion** | Login previo para obtener token |
| **Header** | `Authorization: Bearer <token>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `res.body.data.email === "carlos@authtest.com"` |
| **Capas involucradas** | Router → authMiddleware (jwt.verify) → Controller → SELECT con JOIN (usuario + perfil_aprendiz + mentor) |

#### INT-AUTH-07: Retorna 401 sin token

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el middleware de autenticacion bloquea requests sin header `Authorization` |
| **Endpoint** | `GET /api/v1/auth/me` |
| **Header** | Ninguno |
| **Status esperado** | `401 Unauthorized` |
| **Capas involucradas** | Router → authMiddleware (corta la ejecucion) |

---

## 2. Modulo de OKRs (6 tests)

**Archivo:** [`okr.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/okr.test.ts)

**Setup/Teardown:**
- `beforeAll`: Crea 3 usuarios (Padawan, otro Padawan, Mentor), perfil_aprendiz, mentor, matching, sesion, y un OKR en estado `EnProgreso`. Genera tokens JWT para cada usuario
- `afterAll`: Limpia `okr_historial`, `matching`, y `usuario` donde email termina en `@test.com`

**Dependencias integradas:** Express app, authMiddleware, bcrypt, JWT, PostgreSQL (tablas: `usuario`, `perfil_aprendiz`, `mentor`, `matching`, `sesion_mentoria`, `okr`, `okr_historial`)

---

### 2.1 POST /api/v1/okrs/:id/complete

#### INT-OKR-01: Retorna 200 y actualiza el OKR cuando todos los datos son validos

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica el flujo completo de completar un OKR: transaccion ACID que actualiza el OKR, inserta en historial, y actualiza el score de empleabilidad |
| **Endpoint** | `POST /api/v1/okrs/:id/complete` |
| **Pre-condicion** | OKR en estado `EnProgreso`, usuario es mentor del matching |
| **Header** | `Authorization: Bearer <mentorToken>` |
| **Input** | `{ valor_actual: 3, nota_cierre: "Completed all tasks" }` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `success === true`, `okr.estado === "Completado"`, `valor_actual === 3` |
| **Capas involucradas** | Router → authMiddleware → Controller → BEGIN → UPDATE okr → INSERT okr_historial → UPDATE perfil_aprendiz → COMMIT |
| **Reglas de negocio** | RN-03 (transicion de estado), RN-04 (audit trail), RN-05 (score +12) |

#### INT-OKR-02: Retorna 401 cuando no se envia JWT

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que la completacion de OKR requiere autenticacion |
| **Endpoint** | `POST /api/v1/okrs/:id/complete` |
| **Header** | Ninguno |
| **Status esperado** | `401 Unauthorized` |
| **Validaciones** | `res.body.code === "AUTH_REQUIRED"` |
| **Capas involucradas** | Router → authMiddleware (bloquea) |

#### INT-OKR-03: Retorna 403 cuando el OKR pertenece a otro usuario (RN-01)

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica la regla de negocio RN-01: solo el mentor o padawan del matching pueden completar el OKR. Un usuario ajeno recibe 403 |
| **Endpoint** | `POST /api/v1/okrs/:id/complete` |
| **Header** | `Authorization: Bearer <otherUserToken>` (usuario que no es parte del matching) |
| **Status esperado** | `403 Forbidden` |
| **Validaciones** | `res.body.code === "FORBIDDEN"` |
| **Capas involucradas** | Router → authMiddleware → Controller → SELECT ownership check en PostgreSQL |

#### INT-OKR-04: Retorna 409 cuando el OKR esta en estado Pendiente (RN-02)

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica la regla de negocio RN-02: solo se pueden completar OKRs en estado `EnProgreso`. Un OKR en `Pendiente` retorna conflicto con detalles del estado actual |
| **Endpoint** | `POST /api/v1/okrs/:id/complete` |
| **Pre-condicion** | OKR insertado directamente con estado `Pendiente` |
| **Header** | `Authorization: Bearer <mentorToken>` |
| **Status esperado** | `409 Conflict` |
| **Validaciones** | `code === "INVALID_STATE_TRANSITION"`, `details.estadoActual === "Pendiente"` |
| **Capas involucradas** | Router → authMiddleware → Controller → SELECT estado → validacion de negocio |

#### INT-OKR-05: Hace ROLLBACK si falla el INSERT en okr_historial (RN-06)

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica indirectamente la integridad transaccional ACID: si algo falla durante la transaccion, el OKR debe permanecer en su estado original sin actualizaciones parciales |
| **Endpoint** | N/A (verificacion directa contra la base de datos) |
| **Pre-condicion** | OKR en estado `EnProgreso` |
| **Validaciones** | `before.rows[0].estado === "EnProgreso"` -- el estado no cambia si la transaccion falla |
| **Capas involucradas** | Controller → BEGIN → fallo → ROLLBACK |
| **Reglas de negocio** | RN-06 (atomicidad transaccional) |

#### INT-OKR-06: Actualiza el score_empleabilidad del perfil_aprendiz tras el COMMIT (RN-05)

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica la regla de negocio RN-05: al completar un OKR, el score de empleabilidad del Padawan aumenta en +12 puntos (cap 100). Compara el score antes y despues de la completacion |
| **Endpoint** | `POST /api/v1/okrs/:id/complete` |
| **Pre-condicion** | Leer score antes, crear y completar OKR, leer score despues |
| **Header** | `Authorization: Bearer <mentorToken>` |
| **Validaciones** | `scoreAfter === Math.min(100, scoreBefore + 12)` |
| **Capas involucradas** | SELECT score → Controller completeOKR (transaccion completa) → SELECT score |
| **Reglas de negocio** | RN-05 (incremento de empleabilidad) |

---

## 3. Modulo de Sesiones (5 tests)

**Archivo:** [`sessions.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/sessions.test.ts)

**Setup/Teardown:**
- `beforeAll`: Crea Padawan + Jedi, perfil_aprendiz, mentor, matching activo. Genera tokens JWT
- `afterAll`: Limpia matching y usuarios con email `%@sessiontest.com`

**Dependencias integradas:** Express app, authMiddleware, bcrypt, JWT, PostgreSQL (tablas: `usuario`, `perfil_aprendiz`, `mentor`, `matching`, `sesion_mentoria`)

---

### 3.1 UC-12: POST /api/v1/matchings/:matchingId/sessions

#### INT-SES-01: Crea una sesion correctamente

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que un Jedi (mentor) puede crear una sesion de mentoria para un matching activo |
| **Endpoint** | `POST /api/v1/matchings/:matchingId/sessions` |
| **Header** | `Authorization: Bearer <jediToken>` |
| **Input** | `{ titulo: "Sesion de prueba", fecha_sesion: <futuro>, duracion_min: 60 }` |
| **Status esperado** | `201 Created` |
| **Validaciones** | `success === true`, `data.titulo === "Sesion de prueba"` |
| **Capas involucradas** | Router → authMiddleware → Controller → SELECT matching verification → INSERT sesion_mentoria |

#### INT-SES-02: Retorna 401 sin autenticacion

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que crear sesiones requiere autenticacion |
| **Endpoint** | `POST /api/v1/matchings/:matchingId/sessions` |
| **Header** | Ninguno |
| **Status esperado** | `401 Unauthorized` |
| **Capas involucradas** | Router → authMiddleware (bloquea) |

---

### 3.2 UC-13: PUT /api/v1/sessions/:sesionId

#### INT-SES-03: Marca sesion como Realizada con notas

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que se puede actualizar el estado de una sesion a `Realizada` y agregar notas |
| **Endpoint** | `PUT /api/v1/sessions/:sesionId` |
| **Header** | `Authorization: Bearer <jediToken>` |
| **Input** | `{ estado: "Realizada", notas: "Excelente sesion, se cubrieron todos los temas." }` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `data.estado === "Realizada"`, notas contiene "Excelente sesion" |
| **Capas involucradas** | Router → authMiddleware → Controller → UPDATE dinamico → PostgreSQL |

---

### 3.3 UC-14: DELETE /api/v1/sessions/:sesionId

#### INT-SES-04: Cancela una sesion programada

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica el soft-delete: cambiar estado a `Cancelada`. Crea una sesion nueva y la cancela inmediatamente |
| **Endpoint** | `DELETE /api/v1/sessions/:sesionId` |
| **Pre-condicion** | Crear una sesion via POST primero |
| **Header** | `Authorization: Bearer <jediToken>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `data.estado === "Cancelada"` |
| **Capas involucradas** | Router → authMiddleware → Controller → UPDATE estado WHERE estado != 'Cancelada' |

---

### 3.4 UC-15: GET /api/v1/sessions/my-sessions

#### INT-SES-05: Retorna historial de sesiones del usuario

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que un Padawan puede ver todas sus sesiones a traves de sus matchings. La query hace JOINs complejos entre multiples tablas |
| **Endpoint** | `GET /api/v1/sessions/my-sessions` |
| **Header** | `Authorization: Bearer <padawanToken>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `success === true`, `data` es array, longitud >= 1 |
| **Capas involucradas** | Router → authMiddleware → Controller → SELECT con 6 JOINs (sesion_mentoria, matching, perfil_aprendiz, usuario x2, mentor, okr) |

---

## 4. Modulo de IA (4 tests)

**Archivo:** [`ia.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/ia.test.ts)

**Setup/Teardown:**
- `beforeAll`: Crea Padawan + Jedi con perfil_aprendiz. Genera tokens JWT
- `afterAll`: Limpia usuarios con email `%@iatest.com`

**Dependencias integradas:** Express app, authMiddleware, bcrypt, JWT, PostgreSQL (tablas: `usuario`, `perfil_aprendiz`, `sesion_mentoria`, `matching`, `okr`)

---

### 4.1 UC-25: GET /api/v1/ia/riesgo-abandono

#### INT-IA-01: Retorna score de riesgo para Padawan autenticado

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica el algoritmo de riesgo de abandono: calcula un score basado en 4 factores (dias sin sesion, OKRs estancados, ratio de cancelaciones, score de empleabilidad) usando queries reales a multiples tablas |
| **Endpoint** | `GET /api/v1/ia/riesgo-abandono` |
| **Header** | `Authorization: Bearer <padawanToken>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `success === true`, `score_riesgo` definido, `nivel` es uno de `['bajo', 'medio', 'alto', 'critico']`, `alertas` es array, `factores` definido |
| **Capas involucradas** | Router → authMiddleware → Controller → 5 queries SELECT a PostgreSQL → calculo de score → response |

#### INT-IA-02: Retorna 401 sin autenticacion

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el endpoint de riesgo requiere autenticacion |
| **Endpoint** | `GET /api/v1/ia/riesgo-abandono` |
| **Header** | Ninguno |
| **Status esperado** | `401 Unauthorized` |
| **Capas involucradas** | Router → authMiddleware (bloquea) |

---

### 4.2 UC-25: GET /api/v1/ia/riesgo-abandono/all

#### INT-IA-03: Permite al Jedi ver todos los riesgos

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que un mentor (Jedi) puede acceder al listado completo de todos los Padawans con sus datos de riesgo |
| **Endpoint** | `GET /api/v1/ia/riesgo-abandono/all` |
| **Header** | `Authorization: Bearer <jediToken>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `data` es array |
| **Capas involucradas** | Router → authMiddleware → requireRole('Jedi','Admin') → Controller → SELECT con subqueries |

#### INT-IA-04: Retorna 403 si Padawan intenta ver todos

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica la autorizacion por roles: un Padawan no tiene permiso para ver los riesgos de todos los usuarios |
| **Endpoint** | `GET /api/v1/ia/riesgo-abandono/all` |
| **Header** | `Authorization: Bearer <padawanToken>` |
| **Status esperado** | `403 Forbidden` |
| **Capas involucradas** | Router → authMiddleware → requireRole (bloquea) |

---

## 5. Modulo de Notificaciones (5 tests)

**Archivo:** [`notifications.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/notifications.test.ts)

**Setup/Teardown:**
- `beforeAll`: Crea tabla `notificacion` si no existe, crea usuario, inserta 3 notificaciones seed (2 no leidas, 1 leida)
- `afterAll`: Limpia notificaciones y usuarios con email `%@notiftest.com`

**Dependencias integradas:** Express app, authMiddleware, bcrypt, JWT, PostgreSQL (tablas: `usuario`, `notificacion`)

---

### 5.1 UC-26: GET /api/v1/notifications

#### INT-NOTIF-01: Lista notificaciones del usuario

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que se retornan todas las notificaciones del usuario autenticado, ordenadas por fecha de creacion descendente |
| **Endpoint** | `GET /api/v1/notifications` |
| **Header** | `Authorization: Bearer <userToken>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `success === true`, `data` es array, longitud === 3 |
| **Capas involucradas** | Router → authMiddleware → Controller → SELECT con ORDER BY y LIMIT |

#### INT-NOTIF-02: Retorna 401 sin token

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que listar notificaciones requiere autenticacion |
| **Endpoint** | `GET /api/v1/notifications` |
| **Header** | Ninguno |
| **Status esperado** | `401 Unauthorized` |
| **Capas involucradas** | Router → authMiddleware (bloquea) |

---

### 5.2 UC-26: GET /api/v1/notifications/unread-count

#### INT-NOTIF-03: Retorna conteo de no leidas

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el conteo de notificaciones no leidas es correcto (2 de 3 segun el seed) |
| **Endpoint** | `GET /api/v1/notifications/unread-count` |
| **Header** | `Authorization: Bearer <userToken>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `data.unread === 2` |
| **Capas involucradas** | Router → authMiddleware → Controller → SELECT COUNT con filtro `leida = false` |

---

### 5.3 UC-26: PATCH /api/v1/notifications/:id/read

#### INT-NOTIF-04: Marca una notificacion como leida

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica el flujo de marcar una notificacion individual como leida. Primero lista las notificaciones, encuentra una no leida, y la marca |
| **Endpoint** | `PATCH /api/v1/notifications/:id/read` |
| **Pre-condicion** | GET previo para obtener ID de notificacion no leida |
| **Header** | `Authorization: Bearer <userToken>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `data.leida === true` |
| **Capas involucradas** | Router → authMiddleware → Controller → UPDATE con WHERE notificacion_id AND usuario_id |

---

### 5.4 UC-26: PATCH /api/v1/notifications/read-all

#### INT-NOTIF-05: Marca todas como leidas

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica la operacion masiva de marcar todas las notificaciones como leidas y valida el resultado consultando el conteo de no leidas |
| **Endpoint** | `PATCH /api/v1/notifications/read-all` |
| **Header** | `Authorization: Bearer <userToken>` |
| **Status esperado** | `200 OK` |
| **Validaciones** | Despues de marcar todas, `unread-count` retorna `unread === 0` |
| **Capas involucradas** | Router → authMiddleware → Controller → UPDATE masivo → verificacion via GET unread-count |

---

## 6. Modulo de Vacantes (9 tests)

**Archivo:** [`vacancies.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/vacancies.test.ts)

**Setup/Teardown:**
- `beforeAll`: Crea Padawan + Admin, perfil_aprendiz, empresa de test. Genera tokens JWT
- `afterAll`: Limpia postulaciones, vacante, y usuarios con email `%@vactest.com`

**Dependencias integradas:** Express app, authMiddleware, requireRole, bcrypt, JWT, PostgreSQL (tablas: `usuario`, `perfil_aprendiz`, `empresa`, `vacante`, `postulacion`)

---

### 6.1 UC-21: POST /api/v1/vacancies

#### INT-VAC-01: Crea una vacante como Admin

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que un Admin puede publicar una vacante con todos los campos requeridos |
| **Endpoint** | `POST /api/v1/vacancies` |
| **Header** | `Authorization: Bearer <adminToken>` |
| **Input** | `{ empresa_id, titulo: "Frontend Developer Test", descripcion, salario_min: 3000, salario_max: 5000, modalidad: "Remoto" }` |
| **Status esperado** | `201 Created` |
| **Validaciones** | `success === true`, `data.titulo === "Frontend Developer Test"` |
| **Capas involucradas** | Router → authMiddleware → requireRole('Admin') → Zod validation → Controller → INSERT vacante |

#### INT-VAC-02: Retorna 403 si Padawan intenta crear

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica la autorizacion por rol: un Padawan no puede crear vacantes (solo Admin) |
| **Endpoint** | `POST /api/v1/vacancies` |
| **Header** | `Authorization: Bearer <padawanToken>` |
| **Status esperado** | `403 Forbidden` |
| **Capas involucradas** | Router → authMiddleware → requireRole('Admin') (bloquea) |

---

### 6.2 UC-22: GET /api/v1/vacancies

#### INT-VAC-03: Lista vacantes activas

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que el endpoint publico retorna las vacantes activas con datos de empresa |
| **Endpoint** | `GET /api/v1/vacancies` |
| **Header** | Ninguno (endpoint publico) |
| **Status esperado** | `200 OK` |
| **Validaciones** | `success === true`, `data` es array |
| **Capas involucradas** | Router → Controller → SELECT con JOIN empresa WHERE activa = true |

#### INT-VAC-04: Filtra por modalidad

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica el filtro de query string: todas las vacantes retornadas tienen la modalidad especificada |
| **Endpoint** | `GET /api/v1/vacancies?modalidad=Remoto` |
| **Header** | Ninguno |
| **Status esperado** | `200 OK` |
| **Validaciones** | Cada vacante en `data` tiene `modalidad === "Remoto"` |
| **Capas involucradas** | Router → Controller → SELECT con WHERE dinamico |

---

### 6.3 UC-23: POST /api/v1/vacancies/:id/apply

#### INT-VAC-05: Permite al Padawan postularse

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que un Padawan puede postularse a una vacante activa |
| **Endpoint** | `POST /api/v1/vacancies/:id/apply` |
| **Header** | `Authorization: Bearer <padawanToken>` |
| **Input** | `{ mensaje: "Me interesa mucho esta posicion." }` |
| **Status esperado** | `201 Created` |
| **Validaciones** | `success === true` |
| **Capas involucradas** | Router → authMiddleware → Controller → SELECT vacante → SELECT postulacion (duplicado) → INSERT postulacion |

#### INT-VAC-06: Retorna 409 si ya esta postulado

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica la constraint de unicidad: no se puede postular dos veces a la misma vacante |
| **Endpoint** | `POST /api/v1/vacancies/:id/apply` |
| **Header** | `Authorization: Bearer <padawanToken>` |
| **Status esperado** | `409 Conflict` |
| **Validaciones** | `res.body.code === "ALREADY_APPLIED"` |
| **Capas involucradas** | Router → authMiddleware → Controller → SELECT postulacion (encuentra duplicado) |

---

### 6.4 UC-24: PUT /api/v1/vacancies/:id

#### INT-VAC-07: Actualiza vacante como Admin

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que un Admin puede actualizar campos de una vacante existente |
| **Endpoint** | `PUT /api/v1/vacancies/:id` |
| **Header** | `Authorization: Bearer <adminToken>` |
| **Input** | `{ titulo: "Senior Frontend Developer", salario_max: 7000 }` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `data.titulo === "Senior Frontend Developer"` |
| **Capas involucradas** | Router → authMiddleware → requireRole → Controller → UPDATE dinamico |

#### INT-VAC-08: Desactiva vacante

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica el soft-delete de vacantes: cambiar `activa` a `false` |
| **Endpoint** | `PUT /api/v1/vacancies/:id` |
| **Header** | `Authorization: Bearer <adminToken>` |
| **Input** | `{ activa: false }` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `data.activa === false` |
| **Capas involucradas** | Router → authMiddleware → requireRole → Controller → UPDATE |

#### INT-VAC-09: Reactiva vacante

| Campo | Detalle |
|---|---|
| **Descripcion** | Verifica que una vacante desactivada puede reactivarse |
| **Endpoint** | `PUT /api/v1/vacancies/:id` |
| **Header** | `Authorization: Bearer <adminToken>` |
| **Input** | `{ activa: true }` |
| **Status esperado** | `200 OK` |
| **Validaciones** | `data.activa === true` |
| **Capas involucradas** | Router → authMiddleware → requireRole → Controller → UPDATE |

---

## Matriz de Cobertura

### Por tipo de verificacion

| Tipo de verificacion | Tests | IDs |
|---|---|---|
| Camino feliz (happy path) | 13 | INT-AUTH-01, 04, 06; INT-OKR-01, 06; INT-SES-01, 03, 04, 05; INT-IA-01, 03; INT-NOTIF-01, 03 |
| Autenticacion (401) | 7 | INT-AUTH-07; INT-OKR-02; INT-SES-02; INT-IA-02; INT-NOTIF-02; INT-VAC-05*, INT-VAC-06* |
| Autorizacion por rol (403) | 3 | INT-OKR-03; INT-IA-04; INT-VAC-02 |
| Validacion de datos (400) | 1 | INT-AUTH-03 |
| Conflicto de negocio (409) | 3 | INT-AUTH-02; INT-OKR-04; INT-VAC-06 |
| Integridad transaccional (ACID) | 2 | INT-OKR-05, 06 |
| Operaciones CRUD completas | 4 | INT-VAC-01, 03, 07, 08 |
| Filtros y queries | 2 | INT-VAC-04; INT-NOTIF-04 |

### Por modulo y endpoint

| Modulo | Endpoints cubiertos | Endpoints sin cobertura |
|---|---|---|
| Auth | register, login, me | -- |
| OKRs | complete | create, list, update, delete, feedback |
| Sesiones | create, update, delete, my-sessions | list (por matching) |
| IA | riesgo-abandono, riesgo-abandono/all | -- |
| Notificaciones | list, unread-count, read, read-all | -- |
| Vacantes | create, list, filter, apply, update, deactivate, reactivate | get-by-id, my-applications |

---

## Configuracion Tecnica

### Jest Config ([jest.config.js](file:///c:/Users/USUARIO/Desktop/Nexus/backend/jest.config.js))

```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  maxWorkers: 1,          // Serial execution -- evita contention de pool
  testTimeout: 15000,     // 15s por test (DB puede ser lenta)
  setupFiles: ['<rootDir>/tests/setup.ts'],        // Carga .env.test
  globalTeardown: '<rootDir>/tests/globalTeardown.ts', // Cierra pool
}
```

### Comando de ejecucion

```bash
npm test
# equivale a: jest --forceExit
```

### Variables de entorno ([.env.test](file:///c:/Users/USUARIO/Desktop/Nexus/backend/.env.test))

Se carga automaticamente via `setup.ts` antes de cada suite. Contiene `DATABASE_URL` apuntando a la instancia de PostgreSQL de test y `NODE_ENV=test` para desactivar rate limiting y logs de Morgan.

---

## Diagrama de Dependencias

```
tests/
├── setup.ts                  ← Carga .env.test (dotenv)
├── globalTeardown.ts         ← Cierra pool de PostgreSQL
├── auth.test.ts              ← Usa: app, pool
├── okr.test.ts               ← Usa: app, pool, bcrypt, jwt
├── sessions.test.ts          ← Usa: app, pool, bcrypt, jwt
├── ia.test.ts                ← Usa: app, pool, bcrypt, jwt
├── notifications.test.ts     ← Usa: app, pool, bcrypt, jwt
└── vacancies.test.ts         ← Usa: app, pool, bcrypt, jwt

src/
├── app.ts                    ← Express app (importado por todos los tests)
├── middleware/
│   ├── auth.middleware.ts    ← authMiddleware, requireRole
│   ├── validate.middleware.ts ← Zod validation
│   ├── error.middleware.ts   ← Error handler global
│   └── rateLimiter.middleware.ts ← Desactivado en test (skip)
├── controllers/              ← Logica de negocio
├── schemas/                  ← Zod schemas de validacion
└── db/pool.ts                ← Pool de PostgreSQL
```
