# 3. Diseño de Casos de Prueba (Aplicación de Técnicas)

*Este documento responde al **Ítem 3 de la rúbrica**. Detalla cómo se diseñaron matemáticamente y lógicamente los casos de prueba para los 5 flujos críticos del negocio, explicitando las técnicas formales de Caja Negra, Caja Blanca y Pruebas Basadas en Riesgos.*

---

## 3.1. Caso de Uso 1: Login Seguro
**Técnica Principal Aplicada:** Caja Blanca (Statement & Branch Coverage) y Caja Negra (Pruebas de Seguridad / Error Guessing).
**Justificación:** Se necesitaba validar la lógica condicional interna de autenticación (Bcrypt/JWT) sin depender de la red, evaluando todas las ramas del bloque `try/catch`.

| ID Prueba | Objetivo | Técnica | Entradas (Inputs) | Resultados Esperados |
| :--- | :--- | :--- | :--- | :--- |
| **UNIT-LOG-01** | Validar rama lógica de éxito (Branch True). | Caja Blanca (Statement Coverage) | `email`: "jedi@nexus.test", `password`: "Test1234" (Mock DB retorna usuario). | El controlador ejecuta la rama `jwt.sign` y retorna HTTP 200 con `{ success: true, token }`. |
| **UNIT-LOG-02** | Validar rama lógica de fallo por contraseña (Branch False). | Caja Blanca (Branch Coverage) | `email`: "jedi@nexus.test", `password`: "ClaveMala" (Mock DB retorna usuario, Bcrypt falla). | El controlador ejecuta la rama de error de Bcrypt y retorna HTTP 401 con `error: Credenciales inválidas`. |
| **SEC-LOG-01** | Mitigar inyección SQL en la capa de acceso. | Error Guessing (OWASP) | `email`: `' OR 1=1 --`, `password`: "cualquiera" | Zod (Análisis estático) o el ORM parametrizado bloquean el string malicioso. Retorna HTTP 400. |

---

## 3.2. Caso de Uso 2: Crear Curso
**Técnica Principal Aplicada:** Pruebas Basadas en Riesgos (Risk-Based Testing).
**Justificación:** Si falla la creación de cursos, la plataforma se detiene por completo (Impacto Alto). Por ende, se diseñaron pruebas de Integración comprobando las restricciones (Constraints) directas de la base de datos PostgreSQL.

| ID Prueba | Objetivo | Técnica | Entradas (Inputs) | Resultados Esperados |
| :--- | :--- | :--- | :--- | :--- |
| **INT-CRS-01** | Validar la creación completa del curso (Happy Path). | Risk-Based Testing (Integración) | Payload JSON válido con `titulo`: "React 101" y Token JWT de Rol "Jedi". | La base de datos inserta el registro, asigna la FK al Jedi y la API devuelve HTTP 201 con el UUID generado. |
| **INT-CRS-02** | Validar la integridad referencial (Foreign Key). | Risk-Based Testing | Token JWT con un `jedi_id` ficticio: `uuid-no-existe`. | PostgreSQL rechaza la inserción por violación de FK (`jedi_id` no existe en tabla `usuarios`). Retorna HTTP 403 o 500 manejado. |
| **INT-CRS-03** | Validar unicidad (Unique Constraint). | Equivalence Partitioning | Se envía dos veces el mismo request POST con el título "Curso Único". | El primer request da 201. El segundo es bloqueado por la BD (Violación UNIQUE) y la API retorna HTTP 409. |

---

## 3.3. Caso de Uso 3: Asignar Tarea
**Técnica Principal Aplicada:** Caja Negra (Equivalence Partitioning) para validación de Interfaz de Usuario (UI).
**Justificación:** En el Frontend (React), necesitamos asegurar que las reglas de negocio visuales limiten los errores humanos antes de contactar al servidor.

| ID Prueba | Objetivo | Técnica | Entradas (Inputs) | Resultados Esperados |
| :--- | :--- | :--- | :--- | :--- |
| **UI-TSK-01** | Validar campos condicionales por tipo de publicación. | Equivalence Partitioning (Clase Válida) | `Tipo`: "TAREA", `Fecha Vencimiento`: "2025-12-31". Click en "Publicar". | Vitest afirma que la función `mutate()` es llamada con el payload correcto. |
| **UI-TSK-03** | Evitar el envío de tareas sin fechas de vencimiento. | Equivalence Partitioning (Clase Inválida) | `Tipo`: "TAREA", `Fecha Vencimiento`: `undefined`. Click en "Publicar". | React Hook Form intercepta el evento. `mutate()` **no es llamada**. Se muestra el texto rojo *"Fecha requerida"*. |
| **UI-TSK-02** | Mitigar inyección de scripts en la vista (Stored XSS). | Caja Negra (Boundary Testing Visual) | El servidor (mock) envía un Muro con la tarea: `<script>alert('hack')</script>`. | React escapa los caracteres especiales. El Virtual DOM renderiza el texto como string plano; no hay nodos ejecutables. |

---

## 3.4. Caso de Uso 4: Subir PDF
**Técnica Principal Aplicada:** Caja Negra (Use Case Testing) y Boundary Value Analysis.
**Justificación:** Se interactúa con componentes del sistema operativo (Archivos físicos). Se aplican valores límite para el tamaño de la carga y pruebas de tipo de uso E2E.

| ID Prueba | Objetivo | Técnica | Entradas (Inputs) | Resultados Esperados |
| :--- | :--- | :--- | :--- | :--- |
| **E2E-PDF-01** | Completar la entrega de forma automatizada real. | Use Case Testing (Playwright E2E) | Acciones de Playwright: Login, navegar a curso, `setInputFiles('tarea.pdf')`, click en Submit. | Playwright intercepta la respuesta 201 y evalúa que en pantalla el badge cambie a texto "Entregada". |
| **UI-PDF-02** | Bloquear archivos pesados antes de saturar red. | Boundary Value Analysis (Límite Superior) | Archivo virtual (Blob) de tamaño `5.000.001 Bytes` (Límite es 5MB). | El input de carga rechaza el archivo instantáneamente y lanza un Toast "El archivo supera los 5MB". |
| **SEC-PDF-01** | Evitar Malware mediante MIME Spoofing. | Error Guessing (Caja Negra) | Archivo malicioso nombrado `malware.pdf` pero cuyo contenido real (Magic Bytes) es un `.exe`. | El `fileFilter` de Multer lee las cabeceras binarias, descarta la extensión textual y bloquea la subida (HTTP 400). |

---

## 3.5. Caso de Uso 5: Calificar y Exportar CSV
**Técnica Principal Aplicada:** Boundary Value Analysis (Análisis de Valores Límite) y Pruebas No Funcionales (Carga/Estrés).
**Justificación:** Las notas tienen rangos estrictos matemáticos `[0 - 20]`. Además, este flujo genera riesgos de transacciones concurrentes (ACID).

| ID Prueba | Objetivo | Técnica | Entradas (Inputs) | Resultados Esperados |
| :--- | :--- | :--- | :--- | :--- |
| **INT-GRD-02** | Probar límites de la nota asignada. | Boundary Value Analysis | Valores inválidos: `calificacion`: `-1` (Límite inferior roto), `calificacion`: `21` (Límite superior roto). | La API rechaza ambas peticiones mediante el validador Zod y la restricción `CHECK` de PostgreSQL, devolviendo 400. |
| **E2E-GRD-01** | Valores válidos en frontera. | Boundary Value Analysis | Valores válidos: `calificacion`: `0`, `calificacion`: `20`. | El sistema procesa correctamente las notas en los bordes y retorna 200 OK. |
| **STRESS-GRD-01** | Probar bloqueos de base de datos (Deadlocks). | Pruebas No Funcionales (Estrés) | Artillery envía 50 requests `PUT` simultáneos al mismo endpoint para actualizar la misma nota de un alumno. | PostgreSQL encola los requests (`FOR UPDATE` lock). Ninguna petición colapsa la app de Node, algunas logran 200, otras caen por timeout, pero la BD jamás se corrompe. |
