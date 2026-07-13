# Caso 4: Subir PDF (Implementación 10 Niveles de Prueba)

Este documento centraliza la evidencia de las implementaciones de los 10 niveles de pruebas requeridos para el Caso de Uso: **Subir Solución PDF**. Este caso fue seleccionado específicamente para demostrar nuestras capacidades avanzadas en **Pruebas E2E (Playwright)** interactuando con el sistema de archivos (File System) simulado del navegador.

A continuación, detallamos las 3 pruebas principales por cada nivel.

---

## 1.1 Análisis Estático (Lint & Types)
*Validación estructural estricta antes de la ejecución.*
1. **Tipado Multer:** El controlador `upload.controller` utiliza la interfaz `Express.Multer.File` para garantizar que TypeScript evalúe propiedades nativas como `mimetype`, `size` y `path` antes de compilación.
2. **Hard-coded Limits:** Se utilizan constantes estáticas en el middleware (`limits: { fileSize: 5 * 1024 * 1024 }`) evaluadas estáticamente por ESLint (`no-magic-numbers`) para garantizar el tamaño máximo de 5MB.
3. **Zod Body Parser:** Las `notas` adicionales enviadas por form-data son validadas por esquemas de Zod asegurando `max(500)` caracteres de límite.

## 1.2 Pruebas Unitarias Backend (Caja Blanca)
*Aislamos el comportamiento lógico del controlador con `upload.controller.unit.test.ts`.*
1. **UNIT-PDF-01 (Procesamiento Correcto):** Mockeamos el objeto `req.file` simulando una carga exitosa. Verificamos que el controlador construya el query SQL insertando la URL y retorne 201.
2. **UNIT-PDF-02 (Catching req.file vacío):** Simulamos una petición donde Multer no adjuntó ningún archivo (`req.file = undefined`). Verificamos que el controlador lo atrape explícitamente y responda 400 *Bad Request*.
3. **UNIT-PDF-03 (Resiliencia DB):** Provocamos un error forzado 500 (`Constraint Violation`) desde el mock de base de datos. Comprobamos que Express capture el error mediante `next(error)` previniendo el colapso (Downtime) del proceso Node.

## 1.3 Pruebas de Componente UI (Vitest)
*Validamos el comportamiento asilado del Formulario de Carga (`UploadPDF.test.tsx`).*
1. **UI-PDF-01 (MIME Estático):** Renderizamos el *Dropzone* interactivo y comprobamos que el atributo DOM `accept` esté estrictamente seteado en `".pdf"`.
2. **UI-PDF-02 (Limitador Reactivo):** Simulamos un archivo binario virtual (File object) de 6MB (Superando el límite de 5MB frontend) y lo inyectamos al input. Verificamos la aparición del *Toast* "El archivo supera los 5MB" sin invocar la red.
3. **UI-PDF-03 (Client-side validation):** Simulamos subir un objeto `application/x-msdownload` `.exe` modificado. El UI bloquea instantáneamente el botón submit ("Solo se permiten archivos PDF").

## 1.4 Pruebas de Seguridad OWASP (Malware Injection)
*Evaluamos defensas en `upload.malware.test.test.ts`.*
1. **SEC-PDF-01 (MIME Spoofing):** Enviamos un buffer binario `virus.sh` renombrado. Verificamos que el `fileFilter` de Multer analice el content-type real (magic bytes o cabeceras form-data) y rechace con 400.
2. **SEC-PDF-02 (Zip Bombing):** Enviamos un stream de 10MB para evaluar si Express bloquea el `body-parser` antes de que el archivo toque el disco físico, protegiendo contra ataques de saturación.
3. **SEC-PDF-03 (Path Traversal):** Inyectamos nombres de archivo como `../../etc/passwd.pdf` esperando que Multer no escriba en directorios root, sino que trunque el filename con generadores aleatorios como `uuid()`.

## 1.5 Pruebas de Humo / Smoke
*Endpoints críticos de `submissions` evaluados en `upload.smoke.test.ts`.*
1. **SMOKE-PDF-01:** Hacemos `POST` de un archivo dummy sin Auth. Recibe 401. Verifica que el middleware Auth se ejecuta antes que el middleware de Multer (para no gastar RAM de disco en atacantes).
2. **SMOKE-PDF-02:** Hacemos `GET` a las resoluciones. Recibimos 401, probando privacidad de lectura.
3. **SMOKE-PDF-03:** Verificamos envío Multipart/form-data validando que no crashea en el backend incluso ante peticiones anómalas.

## 1.6 Pruebas de Integración API + DB
*Validan la persistencia en `nexus_test`.*
1. **INT-PDF-01:** Insert de Envío. Post de archivo + nota, y verificación del `SELECT * FROM entrega` cruzando la ForeignKey con la tarea.
2. **INT-PDF-02:** Verificación de Duplicados. Si el alumno vuelve a subir, realiza un `UPDATE` (Upsert) en lugar de duplicar.
3. **INT-PDF-03:** Recuperación del Mentor: Al hacer GET, obtiene la entrega con JOINs completos para visualizar el link de cloudinary y datos del alumno.

## 1.7 Pruebas de Aceptación BDD (Cucumber)
*Legibilidad en `nexus.feature`.*
1. **UAT-PDF-01 (Carga Perfecta):** Given Padawan -> When sube PDF -> Then sistema registra la entrega (201).
2. **UAT-PDF-02 (Fallo de MIME):** Given Padawan -> When envía .sh -> Then bloqueado (400).
3. **UAT-PDF-03 (Revisión):** Given Mentor -> When consulta entregas -> Then incluye el PDF del padawan.

## 1.8 Pruebas E2E Playwright (Foco de este caso)
*Simulación interactiva de carga de sistema de archivos (`upload.spec.ts`).*
1. **E2E-PDF-01 (El Camino Real):** Playwright levanta Chrome, se loguea como Padawan, navega al muro y ejecuta el método `page.locator('input[type="file"]').setInputFiles(mockFilePath)`. Simula una interacción real con el Kernel del SO y verifica el mensaje "Entregada".
2. **E2E-PDF-02 (Rechazo Front Visual):** Playwright inyecta un archivo no PDF mediante `setInputFiles`. Captura visualmente (`toBeVisible`) el Toast rojo de Zod "Solo se permiten archivos PDF".
3. **E2E-PDF-03 (Transformación de Estado):** Playwright evalúa si el badge visual pasa dinámicamente de "Pendiente" a "Entregada" capturando los cambios de Virtual DOM post-respuesta de Red.

## 1.9 Pruebas de Carga / Load
*Estrés del ancho de banda y form-data en `load-uploads.yml`.*
1. **LOAD-PDF-01 (Hora Punta):** Simula el cierre de tarea a las 11:59PM inyectando un Ramp-Up abrupto de 20 alumnos/segundo enviando datos binarios (Buffers multipart).
2. **LOAD-PDF-02 (Mentor Leyendo masivamente):** Peticiones GET continuas sobre entregas ya subidas.
3. **LOAD-PDF-03 (Re-subidas):** Carga sostenida del PUT/Patch de actualizar entregas.

## 1.10 Pruebas de Estrés / Stress
*Superando los límites del Event Loop (`stress-uploads.yml`).*
1. **STRESS-PDF-01 (Asfixia de RAM):** Inyecta arrays masivos de Multipart ahogando los Workers de Node.js, para revisar si el clúster balancea (Load Balancing) o cae.
2. **STRESS-PDF-02 (DDoS Incompleto):** 150 requests/segundo de Peticiones sin Archivo para asfixiar las validaciones Zod forzando respuestas de Error en bucle.
3. **STRESS-PDF-03 (Workers Timeout):** Bucle continuo de recarga evaluando el tiempo P95 de degradación del API al no soltar conexiones de lectura grandes (Streams de descarga).
