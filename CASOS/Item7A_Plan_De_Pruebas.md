# 7A. Plan de Pruebas Maestro (Master Test Plan - MTP)

*Este documento corresponde a la primera parte del **Ítem 7 de la rúbrica**. Es un Plan de Pruebas estructurado basado en los lineamientos del estándar **IEEE 829 / ISO/IEC 29119** aplicado al sistema NEXUS.*

---

## 1. Identificador del Plan de Pruebas
**MTP-NEXUS-v1.0**
*   **Proyecto:** Plataforma Educativa Gamificada "NEXUS"
*   **Versión:** 1.0 (Release Candidate)
*   **Fecha de Aprobación:** Julio 2026

## 2. Introducción
El presente Plan de Pruebas Maestro define el alcance, el enfoque, los recursos y el cronograma de las actividades de prueba para la plataforma NEXUS. El objetivo es certificar que los flujos críticos académicos (Login, Cursos, Tareas, Entregables y Calificaciones) funcionen de forma segura, consistente y soporten la carga de usuarios concurrentes esperada en un entorno educativo.

## 3. Elementos a Probar (Alcance)
Se someterán a prueba los siguientes módulos Core (Ver *Casos 1 al 5*):
1.  Módulo de Autenticación y Autorización (Login JWT y RBAC).
2.  Módulo de Gestión de Cursos (Creación e Integridad Relacional).
3.  Módulo del Aula Virtual / Muro (Asignación de Tareas).
4.  Motor de Carga de Archivos (Subida de PDFs).
5.  Módulo de Evaluación y Reportes (Calificación y Exportación a CSV).

## 4. Elementos que NO se probarán (Fuera de Alcance)
*   **Pasarelas de Pago:** No se probará la facturación de los cursos, ya que NEXUS operará en una versión beta gratuita inicial.
*   **Streaming de Video en Vivo:** Funcionalidad planificada para la Versión 2.0.

## 5. Enfoque (Estrategia)
Se utilizará un enfoque de **Pruebas Basadas en Riesgos (Risk-Based Testing)** y **Shift-Left Testing**.
*   **Pruebas Estáticas (White-box):** Linting, TypeScript checks y validación Zod en tiempo de compilación.
*   **Pruebas Dinámicas (Black-box & White-box):** Pruebas Unitarias (Jest), Integración (Supertest + DB Test), Interfaz UI simulada (Vitest) y Pruebas E2E (Playwright).
*   **Pruebas No Funcionales:** Rendimiento y Estrés (Artillery), y Seguridad OWASP en controladores críticos.

## 6. Criterios de Aceptación y Rechazo (Pass/Fail Criteria)
*   **Criterios de Paso (Pass):** 
    *   100% de las pruebas automatizadas de Integración y E2E deben ser exitosas en el Pipeline CI/CD.
    *   No deben existir vulnerabilidades críticas (Inyección SQL, XSS, Path Traversal).
    *   El tiempo de respuesta del servidor (p95) debe ser menor a 500ms bajo carga normal.
*   **Criterios de Fallo (Fail):** 
    *   Caída del servidor (Crash/OOM) o corrupción de datos (Violación ACID) durante transacciones concurrentes.
    *   Fallos en los *checks* de TypeScript o validaciones de esquemas en GitHub Actions.

## 7. Criterios de Suspensión y Reanudación
*   **Suspensión:** Si el servidor de base de datos (`nexus_test`) falla al levantar en el pipeline, o si existen más de 3 errores de nivel Crítico (Blockers) que impidan el inicio de sesión. Las pruebas se detendrán para evitar "falsos negativos" en cadena.
*   **Reanudación:** Las pruebas se reanudarán una vez que el equipo de desarrollo suba un *Hotfix* que resuelva los Blockers y el pipeline CI vuelva a inicializarse.

## 8. Entregables de Prueba
1.  Matriz de Diseño de Casos de Prueba.
2.  Scripts automatizados (Jest, Vitest, Playwright, Artillery).
3.  Reporte de Defectos (Bug Tracking).
4.  Reporte de Métricas de Calidad y Cobertura.

## 9. Entornos de Prueba
*   **Entorno Local:** Node.js v20+, PostgreSQL 16 (Local/Docker). Ejecución mediante comandos `npm run test:*`.
*   **Entorno CI/CD (GitHub Actions):** Entorno efímero (Ubuntu-latest) que levanta contenedores, inyecta base de datos temporal, corre la suite completa y destruye el entorno para garantizar la limpieza (Idempotencia).
