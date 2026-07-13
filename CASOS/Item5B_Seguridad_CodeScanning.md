# 5B. Análisis de Seguridad Avanzada: Resolución de Alertas de CodeQL (Code Scanning)

*Este documento es la pieza central del **Ítem 5 de la rúbrica (DevSecOps y Seguridad)**. Detalla cómo utilizamos análisis estático de seguridad (SAST) mediante GitHub Advanced Security (CodeQL) para detectar y neutralizar vulnerabilidades críticas directamente en nuestro código fuente, antes de que llegaran a producción.*

---

## 1. El Rol de CodeQL en nuestro Pipeline DevSecOps
A diferencia de Dependabot (que busca errores en librerías de otros), **CodeQL** analiza *nuestro propio código escrito a mano*. Actúa como un hacker automatizado: rastrea cómo fluyen los datos no confiables (ingresados por el usuario) a través de la aplicación (Taint Analysis) para ver si alcanzan funciones peligrosas sin ser validados o sanitizados.

A continuación, documentamos los hallazgos reportados por GitHub Code Scanning y su mitigación, clasificados por severidad.

---

## 2. Hallazgos de Severidad ALTA (HIGH)
*Estos defectos podían comprometer la integridad y el control de acceso del sistema. Requirieron refactorización inmediata.*

### 🚨 2.1 User-controlled bypass of security check (Evasión de controles de seguridad)
*   **Archivo Detectado:** `backend/.../controllers/course-classroom.controller.ts:272`
*   **Nivel de Severidad:** Alta (High)
*   **Contexto OWASP:** OWASP A01:2021 - Broken Access Control (Control de Acceso Roto / IDOR).
*   **Explicación del Ataque:** El motor de CodeQL detectó que estábamos utilizando un parámetro ingresado directamente por el usuario (ej. un `courseId` enviado por la URL) para tomar una decisión de seguridad (autorización) sin verificar criptográficamente si ese usuario realmente tenía permisos sobre ese curso específico. Un atacante podría modificar el ID en la petición HTTP (Ataque IDOR - *Insecure Direct Object Reference*) para saltarse la validación y administrar un aula virtual que no le pertenece.
*   **Solución Aplicada (El Fix):** 
    1. Se refactorizó la lógica en la línea 272.
    2. En lugar de confiar ciegamente en el ID de la URL, el controlador ahora extrae el `userId` seguro directamente del token JWT firmado (que el atacante no puede alterar). 
    3. Se hace un cruce (Query) en la base de datos: `SELECT * FROM cursos WHERE id = url_id AND mentor_id = jwt_user_id`. Si no coinciden, se bloquea el acceso con un `HTTP 403 Forbidden`.

### 🚨 2.2 Use of externally-controlled format string (Uso de cadenas de formato controladas externamente)
*   **Archivo Detectado:** `backend/.../middleware/validate.middleware.ts:23`
*   **Nivel de Severidad:** Alta (High)
*   **Contexto OWASP:** OWASP A03:2021 - Injection (Inyección).
*   **Explicación del Ataque:** El middleware de validación estaba tomando el mensaje de error directamente del *body* de la petición y pasándolo a una función de formateo de texto sin escaparlo. En lenguajes de bajo nivel esto causa colapsos de memoria (Format String Vulnerability); en Node.js, permite que un atacante inyecte literales de plantilla u objetos maliciosos que el motor evalúa accidentalmente, permitiendo filtración de variables de entorno o ejecución de código.
*   **Solución Aplicada (El Fix):** 
    1. Se prohibió el paso directo de variables no confiables a funciones de formateo (como literales `${}`). 
    2. Se reemplazó por la validación estricta de esquemas utilizando la librería `Zod`, asegurando que el mensaje de respuesta siempre sea un string estático del lado del servidor (ej. "Entrada inválida") y no lo que dictamine el cliente.

---

## 3. Hallazgos de Severidad MEDIA (MEDIUM)
*Estos defectos podían facilitar la ingeniería social o exponer la aplicación a ataques de otros dominios.*

### ⚠️ 3.1 Permissive CORS configuration (Configuración CORS permisiva)
*   **Archivo Detectado:** `backend/src/app.ts:32`
*   **Nivel de Severidad:** Media (Medium)
*   **Contexto OWASP:** OWASP A05:2021 - Security Misconfiguration.
*   **Explicación del Riesgo:** CodeQL detectó que nuestro archivo de configuración global `app.ts` tenía la directiva CORS (Cross-Origin Resource Sharing) configurada con el comodín `Origin: *`. Esto permitía que cualquier página web maliciosa en internet alojara un script que hiciera peticiones silenciosas a nuestro servidor (AJAX/Fetch) en nombre de un usuario logueado en su navegador, robando sus datos.
*   **Solución Aplicada (El Fix):**
    1. Se eliminó el wildcard `*`.
    2. Se configuró el middleware de `cors()` para que solo acepte peticiones provenientes del dominio oficial de producción del frontend (`https://nexus-app.edu`) y del entorno local estricto (`http://localhost:5173`).

### ⚠️ 3.2 Log injection (Inyección de Logs / Registros)
*   **Archivos Detectados:** Múltiples controladores (`session.controller.ts:166`, `matching.controller.ts:250`, `okr.controller.ts`, etc.)
*   **Nivel de Severidad:** Media (Medium)
*   **Contexto OWASP:** OWASP A09:2021 - Security Logging and Monitoring Failures.
*   **Explicación del Riesgo:** El sistema estaba registrando (usando `console.log` o herramientas similares) datos ingresados por el usuario directamente en los archivos de texto del servidor. Un atacante astuto podría enviar un nombre de usuario que contuviera saltos de línea (`\n` o `\r`) seguido de un texto falso como: `\n[CRITICAL] Admin login success`. Esto corrompería los registros de auditoría del servidor, confundiendo a los SysAdmins u ocultando las huellas de un ataque real.
*   **Solución Aplicada (El Fix):**
    1. Se implementó una función utilitaria de "Sanitización de Logs".
    2. Esta función reemplaza cualquier carácter de retorno de carro o salto de línea (`\n`, `\r`) por espacios vacíos antes de escribir en el sistema de archivos o consola, garantizando que cada evento se mantenga en una sola línea inviolable.

---

## 4. Hallazgos Informativos (NOTE)

### ℹ️ Unused variable, import, function or class
*   **Archivo Detectado:** `backend/.../controllers/okr.controller.ts:180`
*   **Nivel de Severidad:** Nota (Bajo Riesgo)
*   **Solución Aplicada:** Código muerto. Aunque no es un riesgo de seguridad activo, el código no utilizado aumenta la superficie de ataque y el peso del *bundle*. Se eliminó mediante una pasada del linter automático (`eslint --fix`).

---

### 🎙️ Resumen para la Exposición (Elevator Pitch)
*Si el jurado pregunta: "¿Qué herramientas de seguridad utilizaron y por qué?"*

"Profesor, en NEXUS nos tomamos la seguridad tan en serio como la funcionalidad. No esperamos a hacer un *PenTest* al final del proyecto. Integramos **GitHub Advanced Security (CodeQL)** directamente en nuestro pipeline de CI/CD. Como evidencia, logramos capturar fallas críticas de **OWASP Top 10**, incluyendo un *Broken Access Control* (Bypass de seguridad) y configuraciones misceláneas (CORS permisivo). Gracias a este análisis Taint (flujo de manchas), pudimos refactorizar el código antes del despliegue, asegurando que los datos académicos estén protegidos contra inyecciones y falsificaciones de identidad."
