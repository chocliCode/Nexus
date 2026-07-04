# Pruebas Unitarias -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 160 |
| **Tipo** | Unitarias (puras, sin dependencias externas) |
| **Framework** | Jest + ts-jest |
| **Base de datos** | No (todo mockeado) |
| **HTTP requests** | No (mocks de req/res) |
| **Archivos de test** | 9 |
| **Modulos cubiertos** | Schemas (5), Middleware (3), Types (1) |

### Por que son pruebas unitarias

Cada prueba valida **una sola unidad de codigo de forma aislada**:
- Los schemas Zod se validan directamente con `safeParse()` sin Express ni HTTP
- Los middlewares se testean con **mocks** de `Request`, `Response` y `NextFunction`
- `jsonwebtoken` se mockea completamente con `jest.mock('jsonwebtoken')`
- No se conecta a PostgreSQL en ningun momento
- Cada test se ejecuta en **milisegundos**

### Como ejecutarlas

```bash
# Ejecutar todas las pruebas unitarias
npm run test:unit

# Ejecutar con cobertura
npm run test:unit -- --coverage

# Ejecutar un archivo especifico
npm run test:unit -- --testPathPattern=auth.schema
```

### Configuracion

**Config:** [`jest.unit.config.js`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/jest.unit.config.js)
**Script npm:** `test:unit` en [`package.json`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/package.json)

```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.unit.test.ts'],
  testTimeout: 5000,       // 5s (vs 15s de integracion)
}
```

---

## Distribucion por Modulo

| # | Categoria | Archivo | Tests | Que prueba |
|---|---|---|---|---|
| 1 | Schema Auth | `auth.schema.unit.test.ts` | 23 | registerSchema, loginSchema |
| 2 | Schema OKR | `okr.schema.unit.test.ts` | 29 | createOKR, updateOKR, completeOKR, feedbackOKR, params |
| 3 | Schema Session | `session.schema.unit.test.ts` | 21 | createSession, updateSession, params |
| 4 | Schema Vacancy | `vacancy.schema.unit.test.ts` | 18 | createVacancy, updateVacancy, params |
| 5 | Schema Profile | `profile.schema.unit.test.ts` | 20 | addSkill, updateProfile |
| 6 | MW Auth | `auth.middleware.unit.test.ts` | 14 | authMiddleware, requireRole |
| 7 | MW Error | `error.middleware.unit.test.ts` | 12 | errorMiddleware, HttpError |
| 8 | MW Validate | `validate.middleware.unit.test.ts` | 8 | validate (Zod generic) |
| 9 | Types | `types.unit.test.ts` | 15 | Interfaces, enums, type safety |
| | **Total** | | **160** | |

---

## 1. Schema Auth (23 tests)

**Archivo:** [`auth.schema.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/schemas/auth.schema.unit.test.ts)

### 1.1 registerSchema (18 tests)

| ID | Descripcion | Input | Resultado |
|---|---|---|---|
| UNIT-AUTH-SCH-01 | Acepta datos validos de Padawan | Todos los campos correctos, rol=Padawan | `success: true` |
| UNIT-AUTH-SCH-02 | Acepta datos validos de Jedi | Todos los campos correctos, rol=Jedi | `success: true` |
| UNIT-AUTH-SCH-03 | Rechaza nombres < 2 caracteres | nombres="A" | `success: false`, error en `nombres` |
| UNIT-AUTH-SCH-04 | Rechaza nombres vacios | nombres="" | `success: false` |
| UNIT-AUTH-SCH-05 | Rechaza nombres > 100 caracteres | nombres="A"x101 | `success: false` |
| UNIT-AUTH-SCH-06 | Rechaza apellidos < 2 caracteres | apellidos="G" | `success: false`, error en `apellidos` |
| UNIT-AUTH-SCH-07 | Rechaza email sin @ | email="not-an-email" | `success: false`, error en `email` |
| UNIT-AUTH-SCH-08 | Rechaza email sin dominio | email="carlos@" | `success: false` |
| UNIT-AUTH-SCH-09 | Rechaza email > 150 caracteres | email="a"x140+"@example.com" | `success: false` |
| UNIT-AUTH-SCH-10 | Rechaza contrasena < 8 caracteres | contrasena="Short1!" (7 chars) | `success: false`, error en `contrasena` |
| UNIT-AUTH-SCH-11 | Acepta contrasena de exactamente 8 | contrasena="12345678" | `success: true` |
| UNIT-AUTH-SCH-12 | Rechaza contrasena > 100 caracteres | contrasena="A"x101 | `success: false` |
| UNIT-AUTH-SCH-13 | Rechaza rol "Admin" | rol="Admin" | `success: false` (solo Padawan/Jedi) |
| UNIT-AUTH-SCH-14 | Rechaza rol inventado | rol="SuperUser" | `success: false` |
| UNIT-AUTH-SCH-15 | Rechaza objeto vacio | `{}` | `success: false`, >= 5 errores |
| UNIT-AUTH-SCH-16 | Rechaza si falta email | Sin campo email | `success: false` |
| UNIT-AUTH-SCH-17 | Rechaza si falta rol | Sin campo rol | `success: false` |
| UNIT-AUTH-SCH-18 | Rechaza nombres como numero | nombres=12345 | `success: false` |

### 1.2 loginSchema (5 tests)

| ID | Descripcion | Input | Resultado |
|---|---|---|---|
| UNIT-AUTH-SCH-19 | Acepta credenciales validas | email+contrasena correctos | `success: true` |
| UNIT-AUTH-SCH-20 | Rechaza email invalido | email="not-email" | `success: false` |
| UNIT-AUTH-SCH-21 | Rechaza contrasena vacia | contrasena="" | `success: false` |
| UNIT-AUTH-SCH-22 | Rechaza objeto sin campos | `{}` | `success: false` |
| UNIT-AUTH-SCH-23 | Rechaza null como input | `null` | `success: false` |

---

## 2. Schema OKR (29 tests)

**Archivo:** [`okr.schema.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/schemas/okr.schema.unit.test.ts)

### 2.1 createOKRSchema (8 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-OKR-SCH-01 | Acepta OKR con todos los campos | Todos completos | `success: true` |
| UNIT-OKR-SCH-02 | Acepta sin campos opcionales | Solo descripcion + valor_meta | `success: true` |
| UNIT-OKR-SCH-03 | Rechaza descripcion < 5 chars | descripcion="Hi" | `success: false` |
| UNIT-OKR-SCH-04 | Rechaza descripcion > 1000 chars | "A"x1001 | `success: false` |
| UNIT-OKR-SCH-05 | Rechaza valor_meta negativo | valor_meta=-1 | `success: false` |
| UNIT-OKR-SCH-06 | Rechaza valor_meta = 0 | valor_meta=0 | `success: false` |
| UNIT-OKR-SCH-07 | Rechaza fecha_limite invalida | "not-a-date" | `success: false` |
| UNIT-OKR-SCH-08 | Rechaza indicador > 500 chars | "X"x501 | `success: false` |

### 2.2 updateOKRSchema (6 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-OKR-SCH-09 | Acepta actualizacion parcial | Solo descripcion | `success: true` |
| UNIT-OKR-SCH-10 | Acepta estado valido | estado="EnProgreso" | `success: true` |
| UNIT-OKR-SCH-11 | Rechaza estado invalido | estado="Eliminado" | `success: false` |
| UNIT-OKR-SCH-12 | Acepta los 4 estados | Pendiente, EnProgreso, Completado, Cancelado | `success: true` cada uno |
| UNIT-OKR-SCH-13 | Acepta valor_actual = 0 | valor_actual=0 | `success: true` |
| UNIT-OKR-SCH-14 | Rechaza valor_actual negativo | valor_actual=-5 | `success: false` |

### 2.3 completeOKRSchema (6 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-OKR-SCH-15 | Acepta completacion valida | valor_actual+nota_cierre | `success: true` |
| UNIT-OKR-SCH-16 | Acepta valor_actual = 0 | valor_actual=0 | `success: true` |
| UNIT-OKR-SCH-17 | Rechaza sin nota_cierre | Solo valor_actual | `success: false` |
| UNIT-OKR-SCH-18 | Rechaza nota_cierre vacia | nota_cierre="" | `success: false` |
| UNIT-OKR-SCH-19 | Rechaza nota_cierre > 2000 | "N"x2001 | `success: false` |
| UNIT-OKR-SCH-20 | Rechaza valor_actual negativo | valor_actual=-1 | `success: false` |

### 2.4 feedbackOKRSchema (4 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-OKR-SCH-21 | Acepta "aprobar" | accion="aprobar" | `success: true` |
| UNIT-OKR-SCH-22 | Acepta "revisar" con comentario | accion="revisar" + comentario | `success: true` |
| UNIT-OKR-SCH-23 | Rechaza accion invalida | accion="eliminar" | `success: false` |
| UNIT-OKR-SCH-24 | Rechaza comentario > 2000 | "C"x2001 | `success: false` |

### 2.5 Param Schemas (5 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-OKR-SCH-25 | sesionId acepta UUID valido | UUID format | `success: true` |
| UNIT-OKR-SCH-26 | sesionId rechaza no-UUID | "not-a-uuid" | `success: false` |
| UNIT-OKR-SCH-27 | sesionId rechaza numero | 12345 | `success: false` |
| UNIT-OKR-SCH-28 | okrId acepta UUID valido | UUID format | `success: true` |
| UNIT-OKR-SCH-29 | okrId rechaza string vacio | "" | `success: false` |

---

## 3. Schema Session (21 tests)

**Archivo:** [`session.schema.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/schemas/session.schema.unit.test.ts)

### 3.1 createSessionSchema (11 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-SES-SCH-01 | Acepta sesion con todos los campos | Completo | `success: true` |
| UNIT-SES-SCH-02 | Default duracion_min = 60 | Sin duracion_min | `data.duracion_min === 60` |
| UNIT-SES-SCH-03 | Rechaza titulo < 3 chars | "AB" | `success: false` |
| UNIT-SES-SCH-04 | Rechaza titulo > 200 chars | "T"x201 | `success: false` |
| UNIT-SES-SCH-05 | Rechaza fecha invalida | "manana-a-las-diez" | `success: false` |
| UNIT-SES-SCH-06 | Rechaza duracion < 15 min | 10 | `success: false` |
| UNIT-SES-SCH-07 | Rechaza duracion > 480 min | 500 | `success: false` |
| UNIT-SES-SCH-08 | Rechaza duracion decimal | 45.5 | `success: false` |
| UNIT-SES-SCH-09 | Acepta duracion exacta 15 | 15 (boundary) | `success: true` |
| UNIT-SES-SCH-10 | Acepta duracion exacta 480 | 480 (boundary) | `success: true` |
| UNIT-SES-SCH-11 | Rechaza notas > 2000 chars | "N"x2001 | `success: false` |

### 3.2 updateSessionSchema (6 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-SES-SCH-12 | Acepta solo estado | estado="Realizada" | `success: true` |
| UNIT-SES-SCH-13 | Acepta los 3 estados | Programada, Realizada, Cancelada | `success: true` |
| UNIT-SES-SCH-14 | Rechaza estado invalido | "Eliminada" | `success: false` |
| UNIT-SES-SCH-15 | Acepta url_grabacion valida | URL https | `success: true` |
| UNIT-SES-SCH-16 | Rechaza url_grabacion invalida | "not-a-url" | `success: false` |
| UNIT-SES-SCH-17 | Acepta objeto vacio | `{}` | `success: true` |

### 3.3 Param Schemas (4 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-SES-SCH-18 | matchingId acepta UUID | UUID format | `success: true` |
| UNIT-SES-SCH-19 | matchingId rechaza no-UUID | "12345" | `success: false` |
| UNIT-SES-SCH-20 | sesionId acepta UUID | UUID format | `success: true` |
| UNIT-SES-SCH-21 | sesionId rechaza vacio | "" | `success: false` |

---

## 4. Schema Vacancy (18 tests)

**Archivo:** [`vacancy.schema.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/schemas/vacancy.schema.unit.test.ts)

### 4.1 createVacancySchema (11 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-VAC-SCH-01 | Acepta vacante completa | Todos los campos | `success: true` |
| UNIT-VAC-SCH-02 | Acepta sin opcionales | Solo requeridos | `success: true` |
| UNIT-VAC-SCH-03 | Rechaza empresa_id no-UUID | "not-uuid" | `success: false` |
| UNIT-VAC-SCH-04 | Rechaza titulo < 3 chars | "AB" | `success: false` |
| UNIT-VAC-SCH-05 | Rechaza titulo > 200 chars | "T"x201 | `success: false` |
| UNIT-VAC-SCH-06 | Acepta las 3 modalidades | Presencial, Remoto, Hibrido | `success: true` |
| UNIT-VAC-SCH-07 | Rechaza modalidad invalida | "Virtual" | `success: false` |
| UNIT-VAC-SCH-08 | Rechaza salario_min negativo | -1000 | `success: false` |
| UNIT-VAC-SCH-09 | Rechaza salario_min = 0 | 0 | `success: false` |
| UNIT-VAC-SCH-10 | Rechaza descripcion > 5000 | "D"x5001 | `success: false` |
| UNIT-VAC-SCH-11 | Rechaza sin modalidad | Falta campo | `success: false` |

### 4.2 updateVacancySchema (5 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-VAC-SCH-12 | Acepta solo titulo | titulo="Senior" | `success: true` |
| UNIT-VAC-SCH-13 | Acepta activa booleano | activa=false | `success: true` |
| UNIT-VAC-SCH-14 | Rechaza activa como string | activa="false" | `success: false` |
| UNIT-VAC-SCH-15 | Acepta objeto vacio | `{}` | `success: true` |
| UNIT-VAC-SCH-16 | Rechaza modalidad invalida | "Espacial" | `success: false` |

### 4.3 Param Schema (2 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-VAC-SCH-17 | vacancyId acepta UUID | UUID format | `success: true` |
| UNIT-VAC-SCH-18 | vacancyId rechaza no-UUID | "12345" | `success: false` |

---

## 5. Schema Profile (20 tests)

**Archivo:** [`profile.schema.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/schemas/profile.schema.unit.test.ts)

### 5.1 addSkillSchema (7 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-PROF-SCH-01 | Acepta nivel Basico | nivel="Basico" | `success: true` |
| UNIT-PROF-SCH-02 | Acepta nivel Intermedio | nivel="Intermedio" | `success: true` |
| UNIT-PROF-SCH-03 | Acepta nivel Avanzado | nivel="Avanzado" | `success: true` |
| UNIT-PROF-SCH-04 | Rechaza nivel invalido | "Experto" | `success: false` |
| UNIT-PROF-SCH-05 | Rechaza habilidad_id no-UUID | "not-a-uuid" | `success: false` |
| UNIT-PROF-SCH-06 | Rechaza sin campo nivel | Falta nivel | `success: false` |
| UNIT-PROF-SCH-07 | Rechaza objeto vacio | `{}` | `success: false` |

### 5.2 updateProfileSchema (13 tests)

| ID | Descripcion | Input clave | Resultado |
|---|---|---|---|
| UNIT-PROF-SCH-08 | Acepta todos los campos | Perfil completo | `success: true` |
| UNIT-PROF-SCH-09 | Acepta actualizacion parcial | Solo nombres | `success: true` |
| UNIT-PROF-SCH-10 | Acepta objeto vacio | `{}` | `success: true` |
| UNIT-PROF-SCH-11 | Rechaza nombres < 2 chars | "A" | `success: false` |
| UNIT-PROF-SCH-12 | Acepta resumen_bio null | null | `success: true` |
| UNIT-PROF-SCH-13 | Acepta resumen_bio vacio | "" | `success: true` |
| UNIT-PROF-SCH-14 | Rechaza resumen_bio > 1000 | "B"x1001 | `success: false` |
| UNIT-PROF-SCH-15 | Acepta url_portafolio vacio | "" | `success: true` |
| UNIT-PROF-SCH-16 | Rechaza url_portafolio invalida | "not-a-url" | `success: false` |
| UNIT-PROF-SCH-17 | Acepta campos de mentor | especialidades+experiencia+bio | `success: true` |
| UNIT-PROF-SCH-18 | Rechaza experiencia negativa | -1 | `success: false` |
| UNIT-PROF-SCH-19 | Rechaza experiencia > 50 | 51 | `success: false` |
| UNIT-PROF-SCH-20 | Rechaza experiencia decimal | 3.5 | `success: false` |

---

## 6. Middleware Auth (14 tests)

**Archivo:** [`auth.middleware.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/middleware/auth.middleware.unit.test.ts)

**Tecnica de aislamiento:** Se mockea `jsonwebtoken` con `jest.mock()`. Se crean mocks manuales de `Request`, `Response` y `NextFunction`.

### 6.1 authMiddleware (8 tests)

| ID | Descripcion | Input | Resultado |
|---|---|---|---|
| UNIT-MW-AUTH-01 | Token valido → next() | Authorization: Bearer valid | `next()` llamado, `req.user` seteado |
| UNIT-MW-AUTH-02 | Sin header → 401 | Sin Authorization | 401, code=AUTH_REQUIRED |
| UNIT-MW-AUTH-03 | Header "Basic" → 401 | Authorization: Basic abc | 401, code=AUTH_REQUIRED |
| UNIT-MW-AUTH-04 | Token invalido → 401 | jwt.verify lanza error | 401, code=INVALID_TOKEN |
| UNIT-MW-AUTH-05 | Token expirado → 401 | jwt expired error | 401, code=INVALID_TOKEN |
| UNIT-MW-AUTH-06 | Extrae token del header | Bearer my-token-123 | jwt.verify con "my-token-123" |
| UNIT-MW-AUTH-07 | Setea req.user | Payload decodificado | userId, email, rol correctos |
| UNIT-MW-AUTH-08 | "Bearer " sin token → 401 | Authorization: "Bearer " | 401 |

### 6.2 requireRole (6 tests)

| ID | Descripcion | Input | Resultado |
|---|---|---|---|
| UNIT-MW-ROLE-01 | Rol en lista → next() | Padawan en [Padawan, Jedi] | `next()` llamado |
| UNIT-MW-ROLE-02 | Rol no en lista → 403 | Padawan en [Admin] | 403, code=FORBIDDEN |
| UNIT-MW-ROLE-03 | Sin req.user → 401 | user=undefined | 401, code=AUTH_REQUIRED |
| UNIT-MW-ROLE-04 | Admin accede a Admin | Admin en [Admin] | `next()` |
| UNIT-MW-ROLE-05 | Multiples roles | Jedi en [Jedi, Admin] | `next()` |
| UNIT-MW-ROLE-06 | Detalle incluye roles permitidos | Padawan en [Jedi, Admin] | details.rolesPermitidos=[Jedi,Admin] |

---

## 7. Middleware Error (12 tests)

**Archivo:** [`error.middleware.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/middleware/error.middleware.unit.test.ts)

### 7.1 HttpError class (5 tests)

| ID | Descripcion | Validacion |
|---|---|---|
| UNIT-ERR-01 | Crea error con statusCode, message, code | Propiedades correctas |
| UNIT-ERR-02 | Acepta details opcionales | details disponible |
| UNIT-ERR-03 | Es instancia de Error | `instanceof Error === true` |
| UNIT-ERR-04 | Tiene stack trace | stack definido |
| UNIT-ERR-05 | Details undefined sin pasar | details === undefined |

### 7.2 errorMiddleware (7 tests)

| ID | Descripcion | Validacion |
|---|---|---|
| UNIT-ERR-06 | Error sin statusCode → 500 | "Error interno del servidor" |
| UNIT-ERR-07 | Usa statusCode del error | 422 → status(422) |
| UNIT-ERR-08 | Incluye correlationId | correlationId es string |
| UNIT-ERR-09 | Usa code del error | HttpError code se usa |
| UNIT-ERR-10 | No expone message en 500 | Mensaje generico, no el real |
| UNIT-ERR-11 | Expone message en no-500 | Mensaje real para cliente |
| UNIT-ERR-12 | correlationId unico por error | 3 errores → 3 IDs distintos |

---

## 8. Middleware Validate (8 tests)

**Archivo:** [`validate.middleware.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/middleware/validate.middleware.unit.test.ts)

| ID | Descripcion | Validacion |
|---|---|---|
| UNIT-MW-VAL-01 | Datos validos → next() | `next()` llamado |
| UNIT-MW-VAL-02 | Datos invalidos → 400 | code=VALIDATION_ERROR, details array |
| UNIT-MW-VAL-03 | Reemplaza body con datos parseados | Transformaciones Zod aplicadas |
| UNIT-MW-VAL-04 | Valida params (target=params) | Params invalidos → 400 |
| UNIT-MW-VAL-05 | Valida query (target=query) | Query valida → next() |
| UNIT-MW-VAL-06 | Incluye campo en detalles de error | details[].campo definido |
| UNIT-MW-VAL-07 | Error no-Zod → next(err) | Forwarded al error handler |
| UNIT-MW-VAL-08 | Body vacio contra schema obligatorio | 400 |

---

## 9. Types (15 tests)

**Archivo:** [`types.unit.test.ts`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/unit/types/types.unit.test.ts)

| ID | Descripcion | Tipo verificado |
|---|---|---|
| UNIT-TYPE-01 | Padawan es rol valido | Rol |
| UNIT-TYPE-02 | Jedi es rol valido | Rol |
| UNIT-TYPE-03 | Admin es rol valido | Rol |
| UNIT-TYPE-04 | EstadoOKR tiene 4 estados | EstadoOKR |
| UNIT-TYPE-05 | EstadoSesion tiene 3 estados | EstadoSesion |
| UNIT-TYPE-06 | EstadoMatching tiene 3 estados | EstadoMatching |
| UNIT-TYPE-07 | Modalidad tiene 3 opciones | Modalidad |
| UNIT-TYPE-08 | CategoriaHabilidad tiene 3 categorias | CategoriaHabilidad |
| UNIT-TYPE-09 | NivelHabilidad tiene 3 niveles | NivelHabilidad |
| UNIT-TYPE-10 | JwtPayload tiene userId, email, rol | JwtPayload |
| UNIT-TYPE-11 | OKR estructura completa | OKR |
| UNIT-TYPE-12 | OKR acepta indicador null | OKR (nullable) |
| UNIT-TYPE-13 | Vacante estructura completa | Vacante |
| UNIT-TYPE-14 | PerfilAprendiz con score | PerfilAprendiz |
| UNIT-TYPE-15 | Mentor estructura completa | Mentor |

---

## Estructura de Archivos

```
tests/
├── unit/                              ← Pruebas unitarias (160 tests)
│   ├── schemas/
│   │   ├── auth.schema.unit.test.ts       (23 tests)
│   │   ├── okr.schema.unit.test.ts        (29 tests)
│   │   ├── session.schema.unit.test.ts    (21 tests)
│   │   ├── vacancy.schema.unit.test.ts    (18 tests)
│   │   └── profile.schema.unit.test.ts    (20 tests)
│   ├── middleware/
│   │   ├── auth.middleware.unit.test.ts    (14 tests)
│   │   ├── error.middleware.unit.test.ts   (12 tests)
│   │   └── validate.middleware.unit.test.ts (8 tests)
│   └── types/
│       └── types.unit.test.ts             (15 tests)
├── auth.test.ts                       ← Integracion (existentes)
├── okr.test.ts
├── sessions.test.ts
├── ia.test.ts
├── notifications.test.ts
└── vacancies.test.ts
```

---

## Matriz de Cobertura por Tipo de Validacion

| Tipo de validacion | Tests | Categorias |
|---|---|---|
| Happy path (datos validos) | 35 | Schemas, middleware |
| Valores limite (boundary) | 28 | min/max chars, min/max numeros, exactamente en el limite |
| Campos faltantes | 12 | Objetos incompletos, campos required |
| Tipos incorrectos | 8 | Numero donde va string, string donde va booleano |
| Valores null/vacio | 10 | null, "", undefined |
| Enum validation | 18 | Estados, roles, modalidades, niveles |
| UUID validation | 12 | Params validos, no-UUID, vacios |
| Mock-based (middleware) | 34 | JWT mock, req/res mock |
| Error handling | 12 | HttpError, correlationId, message sanitization |
| Type safety | 15 | Interfaces, enums runtime |

---

## Resultado de Ejecucion

```
Test Suites: 9 passed, 9 total
Tests:       160 passed, 160 total
Snapshots:   0 total
Time:        ~6.5 s
```

Todas las 160 pruebas unitarias pasan correctamente.
