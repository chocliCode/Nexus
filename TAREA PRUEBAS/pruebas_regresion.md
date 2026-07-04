# Pruebas de Regresion -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Tipo** | Regresion (automatizada via CI) |
| **Mecanismo** | GitHub Actions workflow |
| **Trigger** | Cada Pull Request a `main` |
| **Jobs paralelos** | 8 |
| **Total de pruebas ejecutadas** | 271 |
| **Archivo workflow** | `.github/workflows/ci.yml` |

### Que son las pruebas de regresion

Las pruebas de regresion verifican que **cambios nuevos no rompen funcionalidad existente**. En NEXUS, se implementan como un pipeline de CI que ejecuta **todos los tipos de prueba** en paralelo cada vez que se abre o actualiza un PR hacia `main`.

### Como funciona

```
PR abierto/actualizado a main
        │
        ▼
┌───────────────────────────────────────────────────┐
│           8 JOBS EN PARALELO                      │
│                                                   │
│  🎯 Unitarias (160)     │ 🔄 Integracion (36)    │
│  🎨 Componente (15)     │ 🔒 Seguridad (15)      │
│  🌐 E2E (15)            │ 📊 Carga (15)          │
│  💥 Estres (15)         │ 📋 Lint & Types        │
│                                                   │
└───────────────┬───────────────────────────────────┘
                │
                ▼
        📦 Resumen Final
        (espera a los 8 jobs)
                │
                ▼
    ✅ Sin Regresion    ❌ Regresion Detectada
    (PR listo para       (PR bloqueado)
     merge)
```

### Trigger

```yaml
on:
  pull_request:
    branches: [main]
```

Solo se ejecuta en PRs a `main`. No en pushes directos. Usa `concurrency` para cancelar ejecuciones anteriores si el PR se actualiza.

---

## Jobs del Pipeline

### Resumen de jobs

| # | Job | Tests | DB | Servicio | Tiempo estimado |
|---|---|---|---|---|---|
| 1 | `unit-tests` | 160 | No | -- | ~5s |
| 2 | `integration-tests` | 36 | Si | PostgreSQL 16 | ~30s |
| 3 | `component-tests` | 15 | No | -- | ~5s |
| 4 | `security-tests` | 15 | No | -- | ~2s |
| 5 | `e2e-tests` | 15 | Si | PostgreSQL 16 + Backend + Frontend | ~60s |
| 6 | `load-tests` | 15 | Si | PostgreSQL 16 + Backend | ~45s |
| 7 | `stress-tests` | 15 | Si | PostgreSQL 16 + Backend | ~50s |
| 8 | `lint` | -- | No | -- | ~15s |
| -- | `regression-summary` | -- | No | -- | ~5s |

---

### Job 1: Unitarias (160 tests)

| Campo | Detalle |
|---|---|
| **Nombre** | `unit-tests` |
| **Icono** | 🎯 |
| **Comando** | `npm run test:unit -- --verbose --coverage` |
| **Servicio** | Ninguno |
| **Que verifica** | Schemas Zod, middleware auth/error/validate, types TypeScript |

### Job 2: Integracion (36 tests)

| Campo | Detalle |
|---|---|
| **Nombre** | `integration-tests` |
| **Icono** | 🔄 |
| **Comando** | `npm run test -- --runInBand --verbose --forceExit` |
| **Servicio** | PostgreSQL 16 (migrations + seeds) |
| **Que verifica** | API endpoints completos con DB real |

### Job 3: Componente UI (15 tests)

| Campo | Detalle |
|---|---|
| **Nombre** | `component-tests` |
| **Icono** | 🎨 |
| **Comando** | `npx vitest run --reporter=verbose` |
| **Servicio** | Ninguno |
| **Que verifica** | LoginPage renderizado, interacciones, validaciones |

### Job 4: Seguridad (15 tests)

| Campo | Detalle |
|---|---|
| **Nombre** | `security-tests` |
| **Icono** | 🔒 |
| **Comando** | `npm run test:security -- --verbose` |
| **Servicio** | Ninguno |
| **Que verifica** | SQL injection, XSS, JWT, headers, mass assignment |

### Job 5: E2E (15 tests)

| Campo | Detalle |
|---|---|
| **Nombre** | `e2e-tests` |
| **Icono** | 🌐 |
| **Comando** | `npx playwright test --reporter=list` |
| **Servicio** | PostgreSQL 16 + Backend (npm run dev) + Frontend (Vite) |
| **Que verifica** | Flujos completos en Chromium: login, registro, navegacion, logout |

### Job 6: Carga (15 tests)

| Campo | Detalle |
|---|---|
| **Nombre** | `load-tests` |
| **Icono** | 📊 |
| **Comando** | `npx artillery run tests/load/load-mixed.yml` |
| **Servicio** | PostgreSQL 16 + Backend |
| **Que verifica** | Rendimiento bajo carga esperada, p95/p99 latencia |

### Job 7: Estres (15 tests)

| Campo | Detalle |
|---|---|
| **Nombre** | `stress-tests` |
| **Icono** | 💥 |
| **Comando** | `npx artillery run tests/stress/stress-limits.yml` |
| **Servicio** | PostgreSQL 16 + Backend |
| **Que verifica** | Punto de quiebre, rate limiting, throughput maximo |

### Job 8: Lint & Typecheck

| Campo | Detalle |
|---|---|
| **Nombre** | `lint` |
| **Icono** | 📋 |
| **Comando** | `npx tsc --noEmit` + `npm run lint` |
| **Servicio** | Ninguno |
| **Que verifica** | Errores de tipo TypeScript, reglas ESLint |

---

## Job Final: Resumen de Regresion

El job `regression-summary` espera a que **los 8 jobs terminen** y genera un reporte consolidado en el GitHub Step Summary.

### Tabla de resultados

El summary muestra una tabla con:

| # | Tipo | Tests | Job | Estado |
|---|---|---|---|---|
| 1 | Unitarias | 160 | unit-tests | ✅ success |
| 2 | Integracion | 36 | integration-tests | ✅ success |
| 3 | Componente UI | 15 | component-tests | ✅ success |
| 4 | Seguridad | 15 | security-tests | ✅ success |
| 5 | E2E | 15 | e2e-tests | ✅ success |
| 6 | Carga | 15 | load-tests | ✅ success |
| 7 | Estres | 15 | stress-tests | ✅ success |
| 8 | Lint & Types | -- | lint | ✅ success |

### Veredicto

- **✅ SIN REGRESION**: Si los 8 jobs pasan → PR listo para merge.
- **❌ REGRESION DETECTADA**: Si alguno de los 4 jobs criticos falla (unitarias, integracion, componente, seguridad), el job final falla y bloquea el merge.

Los jobs de carga y estres no bloquean el merge porque dependen del entorno de CI (los limites de hardware varian).

---

## Servicios de Infraestructura

### PostgreSQL

```yaml
services:
  postgres:
    image: postgres:16-alpine
    env:
      POSTGRES_USER: nexus_user
      POSTGRES_PASSWORD: nexus_pass
      POSTGRES_DB: nexus_test
    ports:
      - 5432:5432
```

Se usa en: integracion, E2E, carga, estres.

### Migraciones

Se ejecutan automaticamente en los jobs que necesitan DB:

```bash
psql "$DATABASE_URL" -f backend/src/db/migrations/001_init.sql
psql "$DATABASE_URL" -f backend/src/db/migrations/002_onboarding.sql
psql "$DATABASE_URL" -f backend/src/db/migrations/003_notifications.sql
psql "$DATABASE_URL" -f backend/src/db/migrations/004_classroom.sql
psql "$DATABASE_URL" -f backend/src/db/seeds/test_data.sql
```

---

## Ejemplo de Summary en GitHub

Cada job individual genera su propio summary con metricas especificas. El job final `regression-summary` consolida todo en una tabla con el veredicto.

El resultado se ve en la pestana **Summary** del workflow run en GitHub Actions.

---

## Estructura de Archivos

```
.github/
└── workflows/
    └── ci.yml                ← Pipeline de regresion (8 jobs + summary)
```
