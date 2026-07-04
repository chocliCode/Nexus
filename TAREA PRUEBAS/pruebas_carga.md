# Pruebas de Carga -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 15 |
| **Tipo** | Carga (Load Testing) |
| **Herramienta** | Artillery (npm) |
| **Archivos de test** | 5 |
| **Modulos cubiertos** | Auth, Sesiones, Vacantes, Notificaciones, IA, Mixto |
| **Requiere** | Backend corriendo en `localhost:3000` + PostgreSQL |

### Que son las pruebas de carga

Las pruebas de carga verifican el **comportamiento del sistema bajo demanda concurrente**. A diferencia de las pruebas funcionales (que verifican "funciona correctamente"), las de carga responden:

- Cuantos usuarios simultaneos soporta el sistema?
- Cual es el tiempo de respuesta bajo carga?
- El sistema degrada gracefully o colapsa?
- Hay cuellos de botella en la base de datos?
- El pool de conexiones PostgreSQL aguanta?

### Herramienta: Artillery

[Artillery](https://www.artillery.io/) es un framework de load testing basado en Node.js. Se configura con archivos YAML que definen:

- **`config.phases`** -- Patron de carga (ramp-up, sostenida, pico)
- **`scenarios`** -- Secuencias de requests HTTP que simulan usuarios
- **`weight`** -- Probabilidad de que un usuario virtual ejecute ese escenario
- **`think`** -- Pausas entre requests (simula tiempo de lectura real)

### Como ejecutarlas

```bash
# IMPORTANTE: El backend debe estar corriendo primero
cd backend && npm run dev

# En otra terminal, ejecutar las pruebas de carga:

# Ejecutar pruebas mixtas (LOAD-14, LOAD-15)
npm run test:load

# Ejecutar por modulo
npm run test:load:auth           # LOAD-01, 02, 03
npm run test:load:sessions       # LOAD-04, 05, 06
npm run test:load:vacancies      # LOAD-07, 08, 09
npm run test:load:notifications  # LOAD-10, 11, 12, 13

# Ejecutar con reporte detallado (JSON)
npx artillery run --output report.json tests/load/load-auth.yml
npx artillery report report.json   # Genera HTML
```

### Pre-requisitos

1. Backend corriendo: `npm run dev` (puerto 3000)
2. PostgreSQL corriendo con datos de test
3. Usuario de test registrado: `loadtest@loadtest.com` / `LoadTestPass123!`
4. Para tests de sesiones: un `matchingId` valido (editar en el YAML)

---

## Distribucion por Modulo

| # | Modulo | Archivo | Tests | Patron de carga |
|---|---|---|---|---|
| 1-3 | Auth | `load-auth.yml` | 3 | 5→10 req/s, 90s |
| 4-6 | Sesiones | `load-sessions.yml` | 3 | 5→10 req/s, 90s |
| 7-9 | Vacantes | `load-vacancies.yml` | 3 | 10→20 req/s, 90s |
| 10-13 | Notificaciones + IA | `load-notifications-ia.yml` | 4 | 5→15 req/s, 90s |
| 14-15 | Mixto | `load-mixed.yml` | 2 | 3→10→3 req/s, 100s |
| | **Total** | | **15** | |

---

## 1. Modulo de Autenticacion (3 tests)

**Archivo:** [`load-auth.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/load/load-auth.yml)

**Patron de carga:** Ramp-up 5 req/s (30s) → Sostenida 10 req/s (60s)

---

### LOAD-01: Registro concurrente de usuarios

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/register` |
| **Que estresa** | Transacciones BEGIN/COMMIT concurrentes, constraint UNIQUE de email, bcrypt hash |
| **Flujo** | Cada usuario virtual registra un email unico usando `$uuid` |
| **Metricas clave** | p99 latencia, tasa de errores 409 (duplicados vs generados), throughput |
| **Riesgo identificado** | bcrypt es CPU-bound; muchos registros simultaneos pueden bloquear el event loop |

### LOAD-02: Login de alta frecuencia

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Que estresa** | bcrypt.compare (CPU-intensive), generacion de JWT, pool de conexiones DB |
| **Flujo** | Todos los usuarios virtuales hacen login con las mismas credenciales |
| **Metricas clave** | p95 latencia, requests/segundo sostenidos |
| **Riesgo identificado** | Rate limiter (10 req/15min) puede bloquear bajo carga -- validar config |

### LOAD-03: Consultas /me concurrentes

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/auth/me` (precedido por login) |
| **Que estresa** | jwt.verify + SELECT con JOINs (usuario + perfil_aprendiz + mentor) |
| **Flujo** | Login → captura token → GET /me con Bearer token |
| **Metricas clave** | Latencia del SELECT con JOIN, conexiones de pool activas |
| **Riesgo identificado** | Si el pool se agota, las queries se encolan y el p99 se dispara |

---

## 2. Modulo de Sesiones (3 tests)

**Archivo:** [`load-sessions.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/load/load-sessions.yml)

**Patron de carga:** Ramp-up 5 req/s (30s) → Sostenida 10 req/s (60s)

---

### LOAD-04: Creacion concurrente de sesiones

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/matchings/:matchingId/sessions` |
| **Que estresa** | SELECT de verificacion de matching + INSERT en sesion_mentoria |
| **Flujo** | Login como Jedi → crear sesion con titulo unico |
| **Metricas clave** | Throughput de INSERTs, errores de constraint |
| **Pre-requisito** | matchingId valido configurado en el YAML |

### LOAD-05: Lectura masiva historial de sesiones

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/sessions/my-sessions` |
| **Que estresa** | **La query mas pesada del sistema**: SELECT con 6 JOINs (sesion_mentoria, matching, perfil_aprendiz, usuario x2, mentor, okr) |
| **Flujo** | Login → consultar historial completo |
| **Metricas clave** | p99 latencia (critico), uso de CPU de PostgreSQL |
| **Riesgo identificado** | Sin indices adecuados, esta query puede ser O(n^2) bajo carga |

### LOAD-06: Actualizaciones concurrentes de sesiones

| Campo | Detalle |
|---|---|
| **Endpoint** | `PUT /api/v1/sessions/:sesionId` |
| **Que estresa** | UPDATE con posible contention de filas, locks de PostgreSQL |
| **Flujo** | Login → crear sesion → actualizar estado a "Realizada" |
| **Metricas clave** | Deadlocks, timeouts de lock, throughput de UPDATEs |
| **Riesgo identificado** | UPDATEs concurrentes sobre la misma fila pueden causar deadlocks |

---

## 3. Modulo de Vacantes (3 tests)

**Archivo:** [`load-vacancies.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/load/load-vacancies.yml)

**Patron de carga:** Ramp-up 10 req/s (30s) → Sostenida 20 req/s (60s) -- mas alta porque incluye endpoints publicos

---

### LOAD-07: Listado publico de vacantes (alto trafico)

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/vacancies` |
| **Que estresa** | SELECT con JOIN empresa WHERE activa = true (sin autenticacion) |
| **Weight** | 3 (escenario mas probable) |
| **Metricas clave** | p50/p95/p99 latencia, throughput maximo |
| **Riesgo identificado** | Endpoint publico sin rate limiting por IP -- vulnerable a DDoS |

### LOAD-08: Busqueda filtrada de vacantes

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/vacancies?modalidad=Remoto/Presencial/Hibrido` |
| **Que estresa** | WHERE dinamico con 3 valores distintos de filtro |
| **Weight** | 2 |
| **Flujo** | Cada usuario virtual ejecuta 3 queries filtradas secuencialmente |
| **Metricas clave** | Comparar latencia filtrada vs no-filtrada |

### LOAD-09: Postulaciones concurrentes

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/vacancies/:id/apply` |
| **Que estresa** | SELECT duplicado + INSERT postulacion (con constraint UNIQUE) |
| **Weight** | 1 |
| **Flujo** | Login → listar vacantes → postularse a la primera |
| **Metricas clave** | Tasa de 409 (ALREADY_APPLIED), throughput de escritura |

---

## 4. Notificaciones + IA (4 tests)

**Archivo:** [`load-notifications-ia.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/load/load-notifications-ia.yml)

**Patron de carga:** Ramp-up 5 req/s (30s) → Sostenida 15 req/s (60s)

---

### LOAD-10: Polling de notificaciones (alta frecuencia)

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/notifications/unread-count` |
| **Que estresa** | SELECT COUNT con filtro -- ejecutado en loop (5 veces por usuario virtual) |
| **Weight** | 3 (escenario mas frecuente en produccion) |
| **Flujo** | Login → 5x (GET unread-count + pausa 2s) |
| **Metricas clave** | Latencia bajo polling sostenido, estabilidad del pool |
| **Riesgo identificado** | Sin cache, cada poll genera un query a DB -- escala linealmente |

### LOAD-11: Listado de notificaciones bajo carga

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/notifications` |
| **Que estresa** | SELECT con ORDER BY + LIMIT (bandeja completa) |
| **Weight** | 2 |
| **Metricas clave** | Latencia vs cantidad de notificaciones por usuario |

### LOAD-12: Marcar todas como leidas (operacion masiva)

| Campo | Detalle |
|---|---|
| **Endpoint** | `PATCH /api/v1/notifications/read-all` |
| **Que estresa** | UPDATE masivo (SET leida=true WHERE usuario_id=X) |
| **Weight** | 1 |
| **Metricas clave** | Tiempo del UPDATE masivo, locks sobre la tabla notificacion |
| **Riesgo identificado** | UPDATE sin LIMIT puede bloquear la tabla si hay muchas notificaciones |

### LOAD-13: Calculo IA riesgo de abandono (CPU-intensivo)

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/ia/riesgo-abandono` |
| **Que estresa** | **5 queries SELECT** + calculo algoritmico de score (la operacion mas pesada del sistema) |
| **Weight** | 1 |
| **Flujo** | Login → GET riesgo-abandono |
| **Metricas clave** | p99 latencia, CPU usage del servidor, queries/segundo de PostgreSQL |
| **Riesgo identificado** | Bajo carga, el calculo puede saturar el event loop de Node.js |

---

## 5. Flujos Mixtos (2 tests)

**Archivo:** [`load-mixed.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/load/load-mixed.yml)

**Patron de carga:** Calentamiento 3 req/s (20s) → Pico 10 req/s (60s) → Enfriamiento 3 req/s (20s)

---

### LOAD-14: Health check bajo saturacion

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/health` |
| **Que estresa** | Linea base del servidor -- el endpoint mas ligero posible |
| **Flujo** | 10 requests GET /health en loop rapido por cada usuario virtual |
| **Weight** | 1 |
| **Metricas clave** | Throughput maximo del servidor, latencia minima posible |
| **Proposito** | Si este test falla, el servidor esta completamente saturado |

### LOAD-15: Flujo completo de usuario (journey real)

| Campo | Detalle |
|---|---|
| **Endpoint** | Login → /me → /sessions/my-sessions → /notifications → /vacancies |
| **Que estresa** | **Todas las capas simultaneamente**: auth, sesiones, notificaciones, vacantes |
| **Weight** | 2 (escenario principal) |
| **Flujo** | Login → perfil (2s pausa) → sesiones (1s) → notif unread + list (2s) → vacantes |
| **Metricas clave** | Latencia end-to-end del journey completo, errores acumulados |
| **Proposito** | Simula un usuario real navegando la aplicacion bajo carga concurrente |

---

## Patrones de Carga Configurados

### Fases por archivo

| Archivo | Fase 1 | Fase 2 | Fase 3 | Duracion total |
|---|---|---|---|---|
| `load-auth.yml` | Ramp-up 5 rps (30s) | Sostenida 10 rps (60s) | -- | 90s |
| `load-sessions.yml` | Ramp-up 5 rps (30s) | Sostenida 10 rps (60s) | -- | 90s |
| `load-vacancies.yml` | Ramp-up 10 rps (30s) | Sostenida 20 rps (60s) | -- | 90s |
| `load-notif-ia.yml` | Ramp-up 5 rps (30s) | Sostenida 15 rps (60s) | -- | 90s |
| `load-mixed.yml` | Calentamiento 3 rps (20s) | Pico 10 rps (60s) | Enfriamiento 3 rps (20s) | 100s |

*rps = requests por segundo*

### Usuarios virtuales estimados por ejecucion

| Archivo | Total VUs (~) | Requests totales (~) |
|---|---|---|
| `load-auth.yml` | ~750 | ~750-1500 |
| `load-sessions.yml` | ~750 | ~1500-2250 |
| `load-vacancies.yml` | ~1500 | ~1500-4500 |
| `load-notif-ia.yml` | ~1050 | ~1050-5250 |
| `load-mixed.yml` | ~460 | ~2300-4600 |

---

## Metricas de Salida de Artillery

Cada ejecucion genera metricas automaticas:

| Metrica | Descripcion | Umbral sugerido |
|---|---|---|
| `http.response_time.p50` | Mediana de tiempo de respuesta | < 200ms |
| `http.response_time.p95` | Percentil 95 | < 500ms |
| `http.response_time.p99` | Percentil 99 | < 1000ms |
| `http.request_rate` | Requests por segundo sostenidos | Segun capacidad |
| `http.codes.200` | Respuestas exitosas | > 95% |
| `http.codes.5xx` | Errores del servidor | 0 |
| `vusers.completed` | Usuarios virtuales completados | 100% |
| `vusers.failed` | Usuarios virtuales fallidos | 0 |

### Generar reporte HTML

```bash
# Ejecutar con output JSON
npx artillery run --output results.json tests/load/load-auth.yml

# Generar reporte HTML interactivo
npx artillery report results.json
# Abre results.json.html en el navegador
```

---

## Estructura de Archivos

```
tests/
├── load/                                   ← Pruebas de carga (15 tests)
│   ├── load-auth.yml                          (3 tests: LOAD-01 a 03)
│   ├── load-sessions.yml                      (3 tests: LOAD-04 a 06)
│   ├── load-vacancies.yml                     (3 tests: LOAD-07 a 09)
│   ├── load-notifications-ia.yml              (4 tests: LOAD-10 a 13)
│   └── load-mixed.yml                         (2 tests: LOAD-14 a 15)
├── unit/                                   ← Pruebas unitarias (160 tests)
├── auth.test.ts                            ← Integracion (existentes)
└── ...
```

---

## Resultado Esperado

Las pruebas de carga **no tienen un resultado "pass/fail" binario** como las unitarias. En su lugar, generan metricas que se comparan contra umbrales definidos por el equipo. Un ejemplo de resultado de Artillery:

```
Summary report @ 13:25:00(+0000)
  Scenarios launched:  750
  Scenarios completed: 748
  Requests completed:  1496
  Mean response/sec:   16.62
  Response time (msec):
    min: 12
    max: 890
    median: 45
    p95: 234
    p99: 567
  Codes:
    200: 1420
    201: 76
  Errors:
    ECONNREFUSED: 2
```
