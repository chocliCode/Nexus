# Caso 2: Crear Curso (Implementación 10 Niveles de Prueba)

Este documento centraliza la evidencia de las implementaciones de los 10 niveles de pruebas requeridos para el Caso de Uso: **Crear Curso**. Este caso fue seleccionado específicamente para demostrar nuestras capacidades de **Integración API + Base de Datos**. A continuación, detallamos las 3 pruebas principales por cada nivel.

---

## 1.1 Análisis Estático (Lint & Types)
*Se valida la solidez estructural del código antes de la ejecución.*
1. **Validación Zod Estricta:** `cursoSchema` y `createCourseSchema` garantizan que los campos `titulo` (string, max 100) y `max_estudiantes` (number, min 1) cumplan los requisitos de negocio.
2. **Tipado del Payload JWT (`AuthRequest`):** Forzamos que `req.user.rol` exista. TypeScript impide en tiempo de compilación que extraigamos el ID del Jedi si la interfaz de autenticación no lo proveyó.
3. **Reglas de ESLint:** Asegura que no queden `console.log` sueltos en el controlador de cursos que puedan fugar datos del modelo de negocio a los logs en producción.

## 1.2 Pruebas Unitarias Backend (Caja Blanca)
*Aislamos el controlador de cursos en `course.controller.unit.test.ts` usando `jest.mock()` sobre el `pg.Pool`.*
1. **UNIT-CRS-01:** Simulamos que `pool.query` es exitoso. Verificamos que el controlador construya correctamente el query `INSERT INTO curso` con el `jedi_id` extraído del token, devolviendo `201 Created`.
2. **UNIT-CRS-02:** Simulamos que la base de datos lanza un error 500 (Ej: Constraint Violation). Verificamos que el controlador pase el error al manejador global a través de la función `next(error)` y no crashee el hilo principal.
3. **UNIT-CRS-03:** Verificamos el comportamiento por defecto. Pasamos solo el `titulo` en el body; probamos que el controlador asigne automáticamente `max_estudiantes = 30` en el query parametrizado final.

## 1.3 Pruebas de Componente UI (Vitest + React Testing Library)
*Renderizamos la UI de Cursos en `CoursesPage.test.tsx`.*
1. **UI-CRS-01:** Renderizamos el componente mockeando el token como 'Jedi'. Verificamos que el botón "Crear Curso" aparezca en el DOM y que muestre el *Empty State* "No has creado ningún curso todavía".
2. **UI-CRS-02:** Hacemos clic en "Crear Curso" y disparamos el evento submit con el formulario vacío. Verificamos que el estado reactivo atrape el error de Zod y renderice "El título es obligatorio".
3. **UI-CRS-03:** Ingresamos "Nuevo Curso Testing" en el input. Verificamos que al darle a Guardar, se ejecute la mutación asíncrona de `@tanstack/react-query` (`useMutation`) con los parámetros exactos.

## 1.4 Pruebas de Seguridad OWASP (RBAC y Autorización)
*Escalada de privilegios interceptada en `course.rbac.test.ts`.*
1. **SEC-CRS-01 (Vertical Privilege Escalation):** Un Padawan intenta enviar un `POST /api/v1/courses`. El middleware `requireRole('Jedi')` intercepta el token y responde `403 FORBIDDEN` antes de que el controlador despierte.
2. **SEC-CRS-02 (Token Forgery):** Se inyecta un payload modificado `fakeToken`. El motor JWT de Express rechaza la firma devolviendo `401 Unauthorized`.
3. **SEC-CRS-03 (Missing Auth):** Se lanza el POST sin cabecera de Authorization. El API rechaza inmediatamente demostrando *Secure by Default*.

## 1.5 Pruebas de Humo / Smoke
*Supervisión de salud rápida de las rutas en `course.smoke.test.ts`.*
1. **SMOKE-CRS-01:** Intento de crear curso de forma anónima, recibiendo un 401 rápido (Prueba de Middleware vivo).
2. **SMOKE-CRS-02:** `GET /courses`. Responde rápido con un arreglo (o 401 dependiendo de la configuración CORS global). Comprueba que el enrutador de Cursos fue registrado en `app.ts`.
3. **SMOKE-CRS-03:** `GET /courses/mine` devuelve 401 inmediato si no hay sesión, probando la integridad de los sub-routers.

## 1.6 Pruebas de Integración API + DB
*Validan inserción relacional y queries complejas en `nexus_test` (`courses.test.ts`).*
1. **INT-CRS-01 (Inserción Real):** Ejecuta un POST `/courses` con token de Jedi. Verifica que retorne 201 y que los campos coincidan en la base de datos haciendo un `SELECT * FROM curso WHERE titulo = 'X'`.
2. **INT-CRS-02 (Integridad Referencial - Unirse):** Un padawan se une a un curso (`/courses/:id/join`). El test evalúa que se insertó la fila en `curso_inscripcion` vinculando el UUID del curso y el UUID del padawan, respetando la Foreign Key.
3. **INT-CRS-03 (Cascade Delete / Teardown):** El bloque `afterAll` verifica que se ejecuten correctamente sentencias `DELETE FROM curso CASCADE`, validando que limpiar la base de datos es determinista y no deja registros huérfanos.

## 1.7 Pruebas de Aceptación BDD (Cucumber)
*Lenguaje humano evaluado dinámicamente en `nexus.feature` y `acceptance.test.ts`.*
1. **UAT-CRS-01 (Creación Exitosa):** Given Jedi logueado -> When envía título "Testing BDD" -> Then registra curso y retorna 201.
2. **UAT-CRS-02 (Validación de Negocio):** Given Jedi logueado -> When envía sin título -> Then sistema rechaza por validación y status 400.
3. **UAT-CRS-03 (Visibilidad de Datos):** Given Jedi logueado -> When consulta sus cursos -> Then la respuesta (200) contiene el nuevo curso en la lista.

## 1.8 Pruebas E2E Playwright
*Navegador Chrome invisible interactuando en `course.spec.ts`.*
1. **E2E-CRS-01:** Navega a `/login` como Jedi, va a "Cursos", clic en "Crear Curso", tipea "E2E Nuevo Curso Mágico", envía el formulario y espera que aparezca en el UI (DOM render update).
2. **E2E-CRS-02:** Flujo de fallo visual: Entra al modal, guarda sin rellenar nada, intercepta que Playwright detecte el mensaje "El título es obligatorio" flotando en la pantalla.
3. **E2E-CRS-03:** Navega a `/login` como Padawan, entra a "Cursos". Playwright verifica explícitamente (`expect.toHaveCount(0)`) que el botón "Crear Curso" no exista en todo el documento HTML (Prueba visual de RBAC).

## 1.9 Pruebas de Carga / Load
*Inyectando 15 peticiones concurrentes/seg con Artillery en `load-courses.yml`.*
1. **LOAD-CRS-01:** Alta concurrencia al catálogo de cursos (`GET /courses`). Evalúa si la base de datos devuelve las listas con JOINs a los mentores de manera rápida en paralelo.
2. **LOAD-CRS-02:** Múltiples Jedi creando cursos al mismo tiempo. Estresa las sentencias `INSERT` en PostgreSQL, validando el tiempo de respuesta del Event Loop de Node.
3. **LOAD-CRS-03:** Cientos de estudiantes pidiendo `/courses/mine`. Prueba concurrencia de lectura para filtrar datos (WHERE padawan_id = $1).

## 1.10 Pruebas de Estrés / Stress
*Buscando el punto de colapso de PostgreSQL en `stress-courses.yml`.*
1. **STRESS-CRS-01 (Spike Absoluto):** Genera una rampa abrupta hasta 200 conexiones por segundo contra `/courses`. Verifica si Express es capaz de manejar la cola de promesas sin tumbar la red.
2. **STRESS-CRS-02 (Pool Exhaustion):** Un bucle genera 10 creaciones por cada token. El objetivo es saturar las `max: 20` conexiones del pool de PG y ver cómo responde el API bajo asfixia de I/O.
3. **STRESS-CRS-03 (Mitigación DDoS):** Lanza una ráfaga a `/courses` enviando un token JWT malicioso gigante o erróneo para causar saturación CPU al intentar parsear miles de JWTs por segundo. Evaluamos si el sistema escuda la DB respondiendo 401 rápido y expulsando al atacante.
