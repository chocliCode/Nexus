# Caso 3: Asignar Tarea (Implementación 10 Niveles de Prueba)

Este documento centraliza la evidencia de las implementaciones de los 10 niveles de pruebas requeridos para el Caso de Uso: **Asignar Tarea en el Aula Virtual**. Este caso fue seleccionado específicamente para demostrar nuestras capacidades avanzadas en **Pruebas de Componente UI (React Testing Library + Vitest)**.

A continuación, detallamos las 3 pruebas principales por cada nivel.

---

## 1.1 Análisis Estático (Lint & Types)
*Validación estructural de `course-classroom.controller.ts`.*
1. **Validación Zod Condicional:** `postSchema` obliga a que, si `tipo === 'TAREA'`, la variable `fecha_vencimiento` sea requerida obligatoriamente. Zod lanza excepción si esto no se cumple antes de tocar lógica.
2. **Tipado Estricto de TypeScript:** El enum de `PostType` restringe los inputs a `['ANUNCIO', 'TAREA', 'MATERIAL']`. Imposible inyectar otro valor desde el código sin romper el build.
3. **ESLint JSX A11y:** Asegura que los modales y el `<input type="date" />` en la interfaz tengan accesibilidad y *labels* correctamente asignados para Screen Readers.

## 1.2 Pruebas Unitarias Backend (Caja Blanca)
*Mock del Pool de PostgreSQL en `task.controller.unit.test.ts`.*
1. **UNIT-TSK-01 (Éxito):** Simula que el usuario es un Jedi dueño del curso. Valida que el query parametrizado inserta `tipo: 'TAREA'` y retorna el HTTP 201 correctamente.
2. **UNIT-TSK-02 (Regla de Negocio):** Se inyecta un payload sin `fecha_vencimiento` para el tipo TAREA. Verifica que el controlador intercepte la violación de integridad devolviendo 400.
3. **UNIT-TSK-03 (Dueño de Curso):** Inyecta un mock donde `pool.query` retorna un ID de Jedi distinto al del token logueado. Evalúa que el sistema rebote la petición con 403 Forbidden.

## 1.3 Pruebas de Componente UI (Foco Principal: Vitest)
*Renderizado asilado y eventos de React Testing Library en `WorkTab.test.tsx`.*
1. **UI-TSK-01 (Renderizado Condicional):** Renderiza el componente enviando props `isJedi={true}`. Vitest interactúa con el Virtual DOM y verifica que el input de calendario (`fecha_vencimiento`) exista y sea visible.
2. **UI-TSK-02 (Sanitización XSS Frontend):** Intercepta la carga del estado inyectando en la respuesta de `useQuery` un payload malicioso (`<script>alert("xss")</script>`). Verifica que React lo escapa y no exista ningún nodo `<script>` ejecutable en el DOM de jsdom.
3. **UI-TSK-03 (Bloqueo Interactivo):** Renderiza el formulario, ingresa el título de la tarea, pero presiona el botón "Publicar" dejando la fecha vacía. El test inyecta un Mock en `useMutation` y asegura (`expect.not.toHaveBeenCalled()`) que React bloquee el llamado de red, mostrando validación visual al usuario en tiempo real.

## 1.4 Pruebas de Seguridad OWASP (XSS Injections)
*Vectores de ataque al contenido evaluados en `task.xss.test.ts`.*
1. **SEC-TSK-01 (Stored XSS):** Intenta hacer POST enviando etiquetas HTML en la descripción de la Tarea. Asegura que el backend limpia y desactiva las etiquetas o rechaza la petición.
2. **SEC-TSK-02 (API Enum Tampering):** Envía el campo tipo alterado con inyección SQL/NoSQL (`TAREA_DROP_TABLE_CURSO`). Zod lo revienta inmediatamente con `400 VALIDATION_ERROR`.
3. **SEC-TSK-03 (Buffer Overflow):** Envía un string de 10,000 caracteres en la fecha de vencimiento intentando colapsar el parseo de fechas de Node.js.

## 1.5 Pruebas de Humo / Smoke
*Supervisión de salud del ecosistema de posteos en `task.smoke.test.ts`.*
1. **SMOKE-TSK-01:** Intenta acceder a `GET /courses/X/feed`. Espera recibir 200 (o 401 si privado), verificando que la ruta no da 500 y está de pie.
2. **SMOKE-TSK-02:** Intenta hacer POST de Tarea sin Auth Header. El middleware despacha 401 instantáneo sin latencia, validando protección de la muralla de seguridad.
3. **SMOKE-TSK-03:** Intenta hacer DELETE sin Auth. Verifica resiliencia general del router de borrado.

## 1.6 Pruebas de Integración API + DB
*Reutilizamos el marco de Integración (`courses.test.ts` / `classroom.controller`).*
1. **INT-TSK-01:** Inserción de Tarea: Realiza un POST con token de Mentor. Comprueba en la DB que el post insertado generó el UUID relacional al curso.
2. **INT-TSK-02:** Recuperación en el Muro: Hace un GET al feed del curso para asegurar que la consulta SQL con JOIN retorna correctamente la tarea con el nombre del Jedi y la fecha de vencimiento formateada.
3. **INT-TSK-03:** Restricciones Forenses: Un padawan intenta borrar la tarea enviando un DELETE, y la DB deniega la modificación cruzada de IDs.

## 1.7 Pruebas de Aceptación BDD (Cucumber)
*Legibilidad humana en la validación en `nexus.feature` y `acceptance.test.ts`.*
1. **UAT-TSK-01 (Creación Perfecta):** Given Mentor -> When publica tarea con "Entregable 1" y fecha -> Then sistema registra en feed (201).
2. **UAT-TSK-02 (Fallo Funcional):** Given Mentor -> When publica tarea sin fecha -> Then sistema rechaza (400).
3. **UAT-TSK-03 (Experiencia del Alumno):** Given Padawan -> When accede al aula virtual -> Then arreglo retornado incluye la tarea publicada.

## 1.8 Pruebas E2E Playwright
*Testing interactivo del Navegador en `task.spec.ts`.*
1. **E2E-TSK-01 (Camino Feliz):** Automate de Chrome abre la app -> Clic en un Curso -> Clic en "Trabajo de Clase" -> Llena el campo -> Selecciona 31-12-2025 -> Publica -> Espera confirmación visual de que la publicación apareció en la lista.
2. **E2E-TSK-02 (Mensaje Visual):** Rellena solo el texto y hace clic en Publicar. Captura (`.toBeVisible()`) el mensaje flotante de error "Fecha de vencimiento requerida" que muestra React de forma reactiva.
3. **E2E-TSK-03 (Visualización basada en Roles):** Inicia sesión como Estudiante. Ingresa al muro y valida que el elemento `<textarea>` de "Escribe una nueva tarea" literalmente `toHaveCount(0)`, demostrando que el UI bloqueó visualmente el RBAC.

## 1.9 Pruebas de Carga / Load
*Simulación de alto tráfico en `load-tasks.yml`.*
1. **LOAD-TSK-01 (Avalancha al muro):** Ramp-up de Padawans ejecutando múltiples veces el GET al muro de publicaciones de forma sostenida para medir el tiempo de respuesta del Event Loop en lecturas simples.
2. **LOAD-TSK-02 (Estrés de Inserción):** Simulación de múltiples profesores a nivel nacional inyectando tareas en simultáneo el domingo a las 11:59PM.
3. **LOAD-TSK-03 (Comentarios Concurrentes):** Alumnos comentando a la vez en la caja de comentarios de la misma tarea, forzando concurrencia de inserción en la DB.

## 1.10 Pruebas de Estrés / Stress
*Superando los límites del servidor en `stress-tasks.yml`.*
1. **STRESS-TSK-01 (DDoS de Envíos Malformados):** Pico de 100 usuarios por segundo inyectando Tareas sin fechas para ver si la validación (Zod) colapsa la RAM antes de que PostgreSQL siquiera intervenga.
2. **STRESS-TSK-02 (DDoS DELETE):** Inundación de solicitudes de borrado sobre un UUID para generar conflictos de Lock de fila en la BD.
3. **STRESS-TSK-03 (Carga de JOINS):** Consultas masivas sobre el muro de un curso gigante, buscando retrasos en los tiempos de respuesta del query P95.
