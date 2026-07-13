# Mapa del Código Implementado (Directorio de Pruebas)

Este documento es tu **Guía de Navegación** para la exposición. Aquí encontrarás la ubicación exacta de todos los archivos de código fuente que se han creado/modificado durante la implementación de los **5 Casos de Uso en 10 Niveles**.

Usa los enlaces a continuación para abrir los archivos directamente en tu editor durante tu presentación.

---

## 📁 FRONTEND (`/frontend`)

### 🧪 Pruebas de Componente UI (Vitest + React Testing Library)
Ubicación: `frontend/src/tests/`
- [CoursesPage.test.tsx](../../frontend/src/tests/CoursesPage.test.tsx) *(Caso 2: Crear Curso)*
- [WorkTab.test.tsx](../../frontend/src/tests/WorkTab.test.tsx) *(Caso 3: Asignar Tarea - Foco UI)*
- [UploadPDF.test.tsx](../../frontend/src/tests/UploadPDF.test.tsx) *(Caso 4: Subir PDF)*
- [GradesTable.test.tsx](../../frontend/src/tests/GradesTable.test.tsx) *(Caso 5: Calificar y CSV)*

### 🤖 Pruebas E2E (Playwright)
Ubicación: `frontend/e2e/`
- [task.spec.ts](../../frontend/e2e/task.spec.ts) *(Caso 3: Asignar Tarea)*
- [upload.spec.ts](../../frontend/e2e/upload.spec.ts) *(Caso 4: Subir PDF - Foco E2E)*
- [grades.spec.ts](../../frontend/e2e/grades.spec.ts) *(Caso 5: Calificar y CSV)*

---

## 📁 BACKEND (`/backend`)

### 📦 Pruebas Unitarias (Jest)
Ubicación: `backend/tests/unit/controllers/`
- [task.controller.unit.test.ts](../../backend/tests/unit/controllers/task.controller.unit.test.ts) *(Caso 3)*
- [upload.controller.unit.test.ts](../../backend/tests/unit/controllers/upload.controller.unit.test.ts) *(Caso 4)*
- [grade.controller.unit.test.ts](../../backend/tests/unit/controllers/grade.controller.unit.test.ts) *(Caso 5)*

### 🛡️ Pruebas de Seguridad OWASP
Ubicación: `backend/tests/security/`
- [task.xss.test.ts](../../backend/tests/security/task.xss.test.ts) *(Caso 3: XSS)*
- [upload.malware.test.ts](../../backend/tests/security/upload.malware.test.ts) *(Caso 4: Malware & Path Traversal)*
- [grade.csv.test.ts](../../backend/tests/security/grade.csv.test.ts) *(Caso 5: Inyección CSV)*

### 💨 Pruebas de Humo (Smoke Tests)
Ubicación: `backend/tests/smoke/`
- [course.smoke.test.ts](../../backend/tests/smoke/course.smoke.test.ts) *(Caso 2)*
- [task.smoke.test.ts](../../backend/tests/smoke/task.smoke.test.ts) *(Caso 3)*
- [upload.smoke.test.ts](../../backend/tests/smoke/upload.smoke.test.ts) *(Caso 4)*
- [grade.smoke.test.ts](../../backend/tests/smoke/grade.smoke.test.ts) *(Caso 5)*

### 🔗 Pruebas de Integración API + BD (PostgreSQL)
Ubicación: `backend/tests/integration/`
- [courses.test.ts](../../backend/tests/integration/courses.test.ts) *(Caso 2: Crear Curso - Foco Integración)*
- [grade.acid.test.ts](../../backend/tests/integration/grade.acid.test.ts) *(Caso 5: Transacciones ACID)*

### 🗣️ Pruebas de Aceptación BDD (Cucumber)
Ubicación: `backend/tests/acceptance/`
- [nexus.feature](../../backend/tests/acceptance/features/nexus.feature) *(Archivo Gherkin con todas las Historias de Usuario)*
- [acceptance.test.ts](../../backend/tests/acceptance/acceptance.test.ts) *(Implementación de los Steps de Cucumber)*

### 🏋️ Pruebas de Carga y Estrés (Artillery)
Ubicación: `backend/tests/load/` y `backend/tests/stress/`
- **Caso 3:** [load-tasks.yml](../../backend/tests/load/load-tasks.yml) | [stress-tasks.yml](../../backend/tests/stress/stress-tasks.yml)
- **Caso 4:** [load-uploads.yml](../../backend/tests/load/load-uploads.yml) | [stress-uploads.yml](../../backend/tests/stress/stress-uploads.yml)
- **Caso 5:** [load-grades.yml](../../backend/tests/load/load-grades.yml) | [stress-grades.yml](../../backend/tests/stress/stress-grades.yml) *(Foco Carga/Estrés)*

---

## 💡 Tip para la Exposición:
Si durante tu presentación los jurados te piden **"Muéstrame el código donde hiciste X"**, simplemente abre este mapa y haz clic derecho (o Ctrl+Click) en el enlace correspondiente para saltar directamente al archivo fuente.
