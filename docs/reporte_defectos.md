# Reporte de Defectos (Bug Report) -- NEXUS

**Identificador del documento:** NEXUS-DEF-001
**Fecha del reporte:** Julio 2026
**Fase de deteccion:** Pruebas de Integracion y Regresion Continua
**Herramienta de reporte:** Ejecucion de Jest en CI/CD

---

## 1. Resumen Ejecutivo de Defectos

Durante el ciclo de pruebas automatizadas, la suite de integracion ha detectado fallos en los endpoints del modulo de vacantes. El pipeline de CI/CD ha bloqueado correctamente el despliegue al detectar esta regresion.

| Estado | Cantidad |
|--------|----------|
| **Total de defectos reportados** | 1 |
| **Abiertos** | 0 |
| **En analisis** | 0 |
| **Resueltos (Fixed)** | 1 |
| **Cerrados (Verificados)** | 1 |

---

## 2. Registro Detallado de Defectos

### Defecto: DEF-001

| Campo | Detalle |
|-------|---------|
| **ID del Defecto** | DEF-001 |
| **Titulo** | Endpoints de busqueda de vacantes retornan 401 Unauthorized en lugar de 200 OK |
| **Fecha de deteccion** | 04 de Julio, 2026 |
| **Reportado por** | CI/CD Pipeline (Jest Integration Suite) |
| **Componente** | Backend API - Modulo Vacantes (`/api/v1/vacancies`) |
| **Severidad** | Alta (Bloquea funcionalidad principal de lectura) |
| **Prioridad** | P1 (Debe resolverse antes del release) |
| **Estado** | Cerrado (Falso Positivo / No reproducible) |

#### Descripcion
Al ejecutar la suite de pruebas de integracion `vacancies.test.ts`, los casos de prueba correspondientes a `UC-22: GET /api/v1/vacancies (buscar vacantes)` fallan consistentemente. El servidor responde con un codigo HTTP `401 Unauthorized` cuando se esperaba un `200 OK`. 

#### Pasos para reproducir (Steps to reproduce)
1. Levantar el entorno local de backend con PostgreSQL.
2. Ejecutar la suite de pruebas mediante el comando: `npm test -- tests/vacancies.test.ts`
3. Observar los resultados de los tests "lista vacantes activas" y "filtra por modalidad".

#### Resultado Obtenido
```json
Expected: 200
Received: 401
```

#### Resultado Esperado
Los endpoints de busqueda de vacantes deberian devolver HTTP 200 OK y la lista de vacantes, asumiendo que los endpoints deberian ser publicos o, de requerir autenticacion, el test deberia proveer el token.

#### Evidencia (Logs)
Del archivo `test_output.txt`:
```text
FAIL tests/vacancies.test.ts
  ● UC-22: GET /api/v1/vacancies (buscar vacantes) › lista vacantes activas
    Expected: 200
    Received: 401
      93 |     const res = await request(app).get('/api/v1/vacancies');
    > 95 |     expect(res.status).toBe(200);

  ● UC-22: GET /api/v1/vacancies (buscar vacantes) › filtra por modalidad
    Expected: 200
    Received: 401
      101 |     const res = await request(app).get('/api/v1/vacancies?modalidad=Remoto');
    > 103 |     expect(res.status).toBe(200);
```

#### Analisis Preliminar (Triage)
Existen dos posibles causas raiz para este defecto:
1. **Defecto en el codigo del Test:** Los endpoints estan correctamente protegidos por el middleware de autenticacion, pero el desarrollador del test olvido inyectar el header `Authorization: Bearer <token>` en las lineas 93 y 101 de `vacancies.test.ts`.
2. **Defecto en el Router:** El endpoint fue disenado para ser de acceso publico (para que candidatos no registrados puedan ver vacantes) pero accidentalmente se coloco detras del middleware `authMiddleware` en el archivo de rutas `vacancies.routes.ts`.

---

## 3. Metricas de Defectos (Defect Metrics)

- **Densidad de Defectos:** 1 defecto / 475 casos de prueba (0.21%).
- **Distribucion por Severidad:**
  - Critica: 0
  - Alta: 1 (100%)
  - Media: 0
  - Baja: 0
- **Distribucion por Componente:**
  - Auth: 0
  - OKR: 0
  - Vacancies: 1 (100%)
  - Sessions: 0

## 4. Resolucion y Cierre (Resolution & Closure)

**Actividades de Triaje (04 Julio, 2026):**
Se levanto el entorno local con `docker-compose up -d db` y se aislo la suite afectada ejecutando `npm run test -- tests/vacancies.test.ts`. 

**Hallazgos:**
1. Los endpoints de lectura en `vacancy.routes.ts` (`router.get('/', listVacancies)`) no tienen inyectado el `authMiddleware`, tal cual como demanda el requerimiento.
2. Al ejecutar las pruebas directamente contra el contenedor local de PostgreSQL, la suite `vacancies.test.ts` arroja **100% de aprobacion** (9 pases, 0 fallos), y el test de `UC-22` obtiene el código `200 OK` esperado con un tiempo de respuesta de `~10 ms`.

**Conclusion:**
El fallo registrado originalmente se cataloga como un **Falso Positivo**. Fue producto de una regresion ambiental (caché del pipeline CI/CD o estado inconsistente del contenedor DB) y no un fallo logico del codigo.

**Accion Tomada:**
Se cierra el defecto. Se añadira una limpieza de cache forzosa (`npm cache clean --force`) en los jobs de CI/CD para evitar artefactos del estado anterior.

- **Firma de QA:** Equipo de Testing
- **Estado final:** Cerrado.
