# Pruebas de Estres -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 15 |
| **Tipo** | Estres (Stress Testing) |
| **Herramienta** | Artillery (npm) |
| **Archivos de test** | 5 |
| **Categorias** | Auth, Pool DB, Spike, Endurance, Limites |
| **Requiere** | Backend corriendo en `localhost:3000` + PostgreSQL |

### Diferencia entre carga y estres

| Aspecto | Carga (Load) | Estres (Stress) |
|---|---|---|
| **Objetivo** | Verificar rendimiento esperado | Encontrar el punto de quiebre |
| **Intensidad** | Dentro de los limites del sistema | Mas alla de los limites |
| **Patron** | Ramp-up gradual, carga sostenida | Spikes, escalada extrema, duracion prolongada |
| **Resultado esperado** | El sistema responde bien | El sistema falla -- y queremos ver **como** falla |
| **Pregunta clave** | "Soporta N usuarios?" | "Donde se rompe? Se recupera?" |
| **Rate maximo** | 20 req/s | Hasta **500 req/s** |

### Como ejecutarlas

```bash
# IMPORTANTE: El backend debe estar corriendo primero
cd backend && npm run dev

# En otra terminal:

# Ejecutar test principal (limites del sistema)
npm run test:stress

# Ejecutar por categoria
npm run test:stress:auth       # STRESS-01, 02, 03
npm run test:stress:db         # STRESS-04, 05, 06
npm run test:stress:spike      # STRESS-07, 08, 09
npm run test:stress:endurance  # STRESS-10, 11, 12 (5 min)

# Ejecutar con reporte
npx artillery run --output stress-report.json tests/stress/stress-limits.yml
npx artillery report stress-report.json
```

### Pre-requisitos

1. Backend corriendo: `npm run dev` (puerto 3000)
2. PostgreSQL corriendo con datos de test
3. Usuario de test: `loadtest@loadtest.com` / `LoadTestPass123!`
4. **Desactivar rate limiter en .env.test** para pruebas que no son STRESS-13

---

## Distribucion por Categoria

| # | Categoria | Archivo | Tests | Intensidad maxima |
|---|---|---|---|---|
| 1-3 | Autenticacion | `stress-auth.yml` | 3 | 200 req/s |
| 4-6 | Pool DB | `stress-db.yml` | 3 | 150 req/s |
| 7-9 | Spike | `stress-spike.yml` | 3 | 200 req/s (picos) |
| 10-12 | Endurance | `stress-endurance.yml` | 3 | 15 req/s x 5 min |
| 13-15 | Limites | `stress-limits.yml` | 3 | 500 req/s |
| | **Total** | | **15** | |

---

## 1. Estres de Autenticacion (3 tests)

**Archivo:** [`stress-auth.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/stress/stress-auth.yml)

**Patron:** Calentamiento 10 rps (10s) → Alta 50 rps (20s) → Extrema 100 rps (20s) → Quiebre 200 rps (15s) → Recuperacion 10 rps (10s)

---

### STRESS-01: Avalancha de registros

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/register` |
| **Objetivo** | Encontrar el punto donde bcrypt hash + transacciones DB colapsan |
| **Que busca romper** | CPU (bcrypt hash es O(2^n)), pool de conexiones (BEGIN/COMMIT por cada registro), constraint UNIQUE bajo concurrencia |
| **Indicadores de fallo** | p99 > 5s, errores 500, ECONNREFUSED, timeouts |
| **Escala** | Cada VU genera un email unico via `$uuid` |

### STRESS-02: Saturacion bcrypt en login

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` |
| **Objetivo** | Saturar el thread pool de Node.js con bcrypt.compare |
| **Weight** | 2 (escenario mas probable bajo ataque) |
| **Que busca romper** | bcrypt.compare es CPU-bound y usa el thread pool de libuv (4 threads por defecto). A 200 req/s, las operaciones se encolan |
| **Indicadores de fallo** | Event loop lag > 100ms, p99 crece exponencialmente |

### STRESS-03: Flood de consultas /me

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/auth/me` (5x por VU) |
| **Objetivo** | Saturar jwt.verify + queries SELECT con JOINs |
| **Que busca romper** | Pool de conexiones DB (cada /me usa una conexion para SELECT con JOINs) |
| **Amplificacion** | 5 requests por usuario virtual = 1000 req/s efectivos en la fase de quiebre |

---

## 2. Estres de Pool de Conexiones DB (3 tests)

**Archivo:** [`stress-db.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/stress/stress-db.yml)

**Patron:** Calentamiento 20 rps (10s) → Presion 80 rps (30s) → Agotamiento 150 rps (20s) → Recuperacion 50 rps (15s)

---

### STRESS-04: Agotamiento pool con queries pesadas

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → `/sessions/my-sessions` → `/notifications` → `/ia/riesgo-abandono` |
| **Weight** | 3 (escenario principal) |
| **Objetivo** | Agotar el pool de conexiones PostgreSQL ejecutando las 3 queries mas pesadas del sistema en secuencia |
| **Que busca romper** | Pool de pg (default: 10 conexiones). Cada VU ocupa 3+ conexiones secuencialmente. A 150 rps, el pool se agota y las queries se encolan indefinidamente |
| **Indicadores de fallo** | `Error: timeout exceeded when trying to connect`, p99 > 10s |

### STRESS-05: Escrituras masivas concurrentes

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → `PATCH /notifications/read-all` → `POST /vacancies/:id/apply` |
| **Objetivo** | Estresar operaciones de escritura (UPDATE masivo + INSERT con constraint) |
| **Que busca romper** | Locks de fila en PostgreSQL, deadlocks entre UPDATEs concurrentes |
| **Indicadores de fallo** | Deadlock detected, lock timeout, 500 errors |

### STRESS-06: Contention lectura/escritura mixta

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → my-sessions (lectura pesada) → read-all (escritura) → unread-count (lectura) → /me (lectura) |
| **Weight** | 2 |
| **Objetivo** | Maximizar la contention entre operaciones de lectura y escritura en el mismo pool |
| **Que busca romper** | El patron lectura-escritura-lectura fuerza a PostgreSQL a serializar operaciones, creando cuellos de botella |

---

## 3. Estres de Picos Repentinos -- Spike (3 tests)

**Archivo:** [`stress-spike.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/stress/stress-spike.yml)

**Patron doble spike:** Base 5 rps (15s) → **Spike 100 rps** (10s) → Base 5 rps (15s) → **Spike 200 rps** (10s) → Base 5 rps (15s)

---

### STRESS-07: Spike trafico en vacantes

| Campo | Detalle |
|---|---|
| **Endpoints** | `GET /vacancies` + `GET /vacancies?modalidad=Remoto` |
| **Weight** | 3 |
| **Objetivo** | Simular un link viral que genera 100-200 visitas/segundo repentinas al listado publico |
| **Que busca romper** | Capacidad de respuesta sin cache, SELECT con JOIN bajo pico repentino |
| **Recuperacion** | Verifica que el sistema vuelve a la normalidad entre spikes |

### STRESS-08: Spike de logins simultaneos

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → /me → /notifications/unread-count |
| **Weight** | 2 |
| **Objetivo** | Simular "lunes a las 9 AM" -- todos los usuarios hacen login al mismo tiempo |
| **Que busca romper** | bcrypt bajo pico + pool de conexiones + jwt.verify |
| **Escenario real** | Inicio de jornada laboral en empresa con 200+ empleados |

### STRESS-09: Spike de operaciones mixtas

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → IA riesgo → my-sessions → read-all |
| **Objetivo** | El peor spike posible: mezcla de CPU-intensive (bcrypt, IA), IO-intensive (6 JOINs), y escritura (bulk UPDATE) |
| **Que busca romper** | Todo. Busca el efecto domino donde un componente saturado arrastra a los demas |
| **Indicadores de fallo** | Timeout cascade, errores 503, ECONNRESET |

---

## 4. Estres de Duracion Prolongada -- Endurance (3 tests)

**Archivo:** [`stress-endurance.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/stress/stress-endurance.yml)

**Patron soak:** Calentamiento 5 rps (20s) → **Sostenida 15 rps (5 minutos)** → Enfriamiento 5 rps (20s)

**Duracion total:** ~5 minutos 40 segundos

---

### STRESS-10: Soak de autenticacion (5 min)

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → /me (con 1s de pausa entre requests) |
| **Weight** | 2 |
| **Objetivo** | Detectar memory leaks en jwt.sign/verify y conexiones DB no liberadas |
| **Que busca** | Crecimiento gradual de RSS memory, latencia que aumenta con el tiempo |
| **Comparacion** | Comparar p99 del minuto 1 vs minuto 5. Si crece > 50%, hay degradacion |

### STRESS-11: Soak de polling notificaciones (5 min)

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → 3x (unread-count + 3s pausa) |
| **Weight** | 2 |
| **Objetivo** | Simular polling continuo del frontend durante una sesion larga |
| **Que busca** | Acumulacion de conexiones, degradacion del pool, SELECT COUNT repetitivo que degrada |
| **Escenario real** | Un usuario con la app abierta durante horas |

### STRESS-12: Soak de queries pesadas (5 min)

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → my-sessions (6 JOINs) → IA riesgo (5 queries) + 2s pausa |
| **Weight** | 1 |
| **Objetivo** | Verificar que las queries pesadas no degradan PostgreSQL tras ejecucion prolongada |
| **Que busca** | Crecimiento del shared_buffers de PostgreSQL, plan cache thrashing, temporary file usage |

---

## 5. Estres de Limites del Sistema (3 tests)

**Archivo:** [`stress-limits.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/backend/tests/stress/stress-limits.yml)

**Patron escalada:** 5 rps (10s) → 50 rps (10s) → 100 rps (10s) → 250 rps (10s) → **500 rps (10s)**

---

### STRESS-13: Validacion rate limiter bajo ataque

| Campo | Detalle |
|---|---|
| **Endpoint** | `POST /api/v1/auth/login` (3x por VU) |
| **Weight** | 2 |
| **Objetivo** | Verificar que el rate limiter (10 req/15min auth, 200 req/15min global) protege el sistema |
| **Resultado esperado** | La mayoria de requests retornan 429 (Too Many Requests). Si retornan 200, el rate limiter fallo |
| **Metricas clave** | Ratio de 429 vs 200, el servidor no debe caer aunque lleguen 500 rps |

### STRESS-14: Throughput maximo (health benchmark)

| Campo | Detalle |
|---|---|
| **Endpoint** | `GET /api/v1/health` (10x por VU, sin auth, sin DB) |
| **Weight** | 2 |
| **Objetivo** | Determinar el **techo absoluto** de requests/segundo del servidor Node.js |
| **Amplificacion** | 10 requests por VU = hasta 5000 req/s efectivos |
| **Uso** | Este numero es el 100% de capacidad. Todos los demas endpoints operan como % de este limite |

### STRESS-15: Cascada de fallos (worst case)

| Campo | Detalle |
|---|---|
| **Endpoints** | Login → my-sessions → IA riesgo → read-all → health → notifications → vacancies |
| **Objetivo** | Provocar un fallo en cascada: si un componente se satura, todos los demas caen |
| **Flujo** | 7 requests secuenciales que tocan TODAS las capas: auth (CPU), sesiones (6 JOINs), IA (5 queries), notificaciones (bulk write), health (baseline), notificaciones (read), vacantes (publico) |
| **Que busca** | El efecto domino: bcrypt satura CPU → pool se agota → queries timeout → health deja de responder → sistema inaccesible |
| **Es el test mas destructivo del sistema** | Si el health check falla en este escenario, el servidor esta completamente saturado |

---

## Patrones de Estres Configurados

### Comparativa de intensidad

| Archivo | Patron | Rate maximo | Duracion | VUs estimados |
|---|---|---|---|---|
| `stress-auth.yml` | Escalada lineal | 200 rps | 75s | ~6,750 |
| `stress-db.yml` | Presion progresiva | 150 rps | 75s | ~5,750 |
| `stress-spike.yml` | Doble spike | 200 rps (pico) | 65s | ~3,050 |
| `stress-endurance.yml` | Soak prolongado | 15 rps | 340s (~5.5 min) | ~4,800 |
| `stress-limits.yml` | Escalada extrema | **500 rps** | 50s | ~9,050 |

### Diagrama de intensidad

```
stress-auth.yml:       ▁▁▃▃▃▃▅▅▅▅▇▇▇▇█████▁▁
stress-db.yml:         ▁▁▃▃▃▃▃▅▅▅▅▅▇▇▇▇▃▃▃
stress-spike.yml:      ▁▁▁▁█████▁▁▁▁████████▁▁▁▁
stress-endurance.yml:  ▁▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▁
stress-limits.yml:     ▁▂▃▅█
```

---

## Interpretacion de Resultados

### Indicadores de fallo critico

| Indicador | Significado | Accion |
|---|---|---|
| `ECONNREFUSED` | El servidor dejo de aceptar conexiones | El proceso crasheo o el SO cerro el puerto |
| `ECONNRESET` | Conexion cerrada abruptamente | El servidor cerro la conexion mid-request |
| `ETIMEDOUT` | Timeout de conexion | El servidor no responde (pool agotado o CPU saturada) |
| `http.codes.503` | Service Unavailable | El servidor sabe que esta saturado |
| `http.codes.429` | Too Many Requests | Rate limiter activado (esperado en STRESS-13) |
| p99 > 10s | Degradacion extrema | El sistema es funcionalmente inutilizable |
| `vusers.failed` > 5% | Tasa de fallo alta | El sistema no puede manejar la carga |

### Metricas de recuperacion

Despues de un spike o carga extrema, las metricas deben **volver a la normalidad** en la fase de recuperacion/enfriamiento. Si no lo hacen:

| Comportamiento | Diagnostico |
|---|---|
| Latencia no baja | Conexiones DB colgadas, memory leak |
| Errores continuan | Pool no se recupera, proceso zombie |
| p99 sube gradualmente (soak) | Memory leak confirmado |
| Health check falla post-spike | El servidor necesita restart manual |

---

## Estructura de Archivos

```
tests/
├── stress/                                  ← Pruebas de estres (15 tests)
│   ├── stress-auth.yml                         (3 tests: STRESS-01 a 03)
│   ├── stress-db.yml                           (3 tests: STRESS-04 a 06)
│   ├── stress-spike.yml                        (3 tests: STRESS-07 a 09)
│   ├── stress-endurance.yml                    (3 tests: STRESS-10 a 12)
│   └── stress-limits.yml                       (3 tests: STRESS-13 a 15)
├── load/                                    ← Pruebas de carga (15 tests)
├── unit/                                    ← Pruebas unitarias (160 tests)
└── *.test.ts                                ← Integracion (36 tests)
```
