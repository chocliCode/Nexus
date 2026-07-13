# 7B. Matriz de Casos de Prueba (Test Execution Matrix)

*Este documento corresponde a la segunda parte del **Ítem 7 de la rúbrica**. Es una consolidación formal de la matriz de ejecución, diseñada para mostrar de un vistazo la trazabilidad entre los módulos, las herramientas utilizadas y el estado final de las pruebas.*

---

## Matriz de Cobertura y Ejecución Global

La siguiente matriz consolida el estado de ejecución de nuestra suite automatizada sobre los 5 flujos críticos del sistema NEXUS. 

| ID Caso | Módulo de Negocio | Nivel / Tipo de Prueba | Herramienta | Prioridad | Estado Ejecución | Observaciones / Cobertura |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **UNIT-LOG-01** | Autenticación (Login) | Caja Blanca (Unitaria) | Jest | Alta | ✅ PASS | Statement Coverage alcanzado 100%. Mocks aislados. |
| **SEC-LOG-01** | Autenticación (Login) | Seguridad (OWASP SQLi) | Jest + Supertest | Crítica | ✅ PASS | Peticiones maliciosas interceptadas por Zod (HTTP 400). |
| **INT-CRS-01** | Gestión de Cursos | Integración (API+DB) | Jest + PostgreSQL | Alta | ✅ PASS | Transacción completada y Foreign Keys validadas. |
| **INT-CRS-02** | Gestión de Cursos | Integración (Risk-Based) | Jest + PostgreSQL | Alta | ✅ PASS | Manejo de Constraint Exceptions exitoso (rollback). |
| **UI-TSK-01** | Aula Virtual (Tareas) | Componente UI | Vitest + RTL | Media | ✅ PASS | Validación de renderizado condicional sin navegador. |
| **UI-TSK-02** | Aula Virtual (Tareas) | Seguridad (OWASP XSS) | Vitest | Crítica | ✅ PASS | React escapa el DOM previniendo ejecución de scripts. |
| **E2E-PDF-01** | Entregables (Archivos) | End-to-End (Sistema) | Playwright | Alta | ✅ PASS | Flujo completo en Chromium. Carga de archivo nativo FS exitosa. |
| **SEC-PDF-01** | Entregables (Archivos) | Seguridad (Malware) | Supertest + Multer | Crítica | ✅ PASS | Filtro de *Magic Bytes* bloqueó archivo falso `.exe`. |
| **INT-GRD-01** | Calificaciones (Notas) | Integración (ACID) | Jest + PostgreSQL | Crítica | ✅ PASS | *Row-Level Locks* previnieron Condición de Carrera en la BD. |
| **LOAD-GRD-01** | Reportes (CSV) | Rendimiento (Load) | Artillery | Media | ✅ PASS | Soporta ráfagas de 200 req/sec sin bloquear *Event Loop*. |
| **BDD-UAT-01** | General (Todas) | Aceptación (BDD) | Cucumber + Jest | Alta | ✅ PASS | Todos los escenarios *Given/When/Then* validados con el negocio. |

---

## Análisis de la Matriz (Para la Exposición)

*Si el jurado pide interpretar esta matriz, debes resaltar lo siguiente:*

1.  **Trazabilidad:** Cada caso de prueba está trazado de regreso a un módulo de negocio específico. No probamos funciones al azar, probamos el núcleo del sistema.
2.  **Distribución del Riesgo:** Las pruebas marcadas como de prioridad "Crítica" no son pruebas funcionales comunes; son pruebas de **Seguridad (OWASP) o Integridad de Datos (ACID)**. Esto demuestra que nuestra preocupación principal es proteger la plataforma de ataques y corrupción de datos.
3.  **Variedad Tecnológica:** La columna "Herramienta" demuestra que no dependemos de un solo framework (El anti-patrón de "usar Selenium para todo"). Utilizamos la herramienta adecuada para el nivel adecuado (Vitest para velocidad UI, Playwright para simulación humana, Artillery para ahogar la RAM).
