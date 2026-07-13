# 7C. Reporte de Defectos (Bug Tracking)

*Este documento corresponde a la tercera parte del **Ítem 7 de la rúbrica**. Un proyecto sin defectos reportados no es realista. Aquí documentamos 3 defectos críticos que nuestra suite de pruebas encontró (y que posteriormente solucionamos), demostrando el valor real de la estrategia de QA.*

---

## 🐞 Defecto 1: Fuga de Memoria al Exportar CSV
**ID:** BUG-001
**Estado:** Resuelto (Cerrado)
**Módulo:** Evaluación y Reportes (Caso 5)
**Nivel de Severidad:** Alta (Blocker de Rendimiento)
**Detectado por:** Pruebas de Estrés (Artillery)

*   **Descripción del Problema:** Durante la ejecución del caso `STRESS-GRD-02`, simulamos la exportación de un CSV de un curso con 10,000 registros. El servidor de Node.js se quedó sin memoria (Error `JavaScript heap out of memory`) y el proceso hizo "crash", botando a todos los demás usuarios del sistema.
*   **Causa Raíz:** El controlador estaba cargando todos los 10,000 registros en la memoria RAM en un solo gran *Array* de JSONs antes de convertirlos a CSV.
*   **Solución (Fix):** Se refactorizó el código para utilizar **Node.js Streams** y la librería `fast-csv`. Ahora el sistema lee de la base de datos y empuja al cliente fila por fila (Piping), manteniendo el consumo de RAM plano en ~30MB independientemente del tamaño del archivo.
*   **Prueba de Regresión:** Se volvió a ejecutar la suite `npm run test:stress` validando que el servidor se mantiene estable sin importar el tamaño del CSV.

---

## 🐞 Defecto 2: Inyección XSS Stored en Tareas
**ID:** BUG-002
**Estado:** Resuelto (Cerrado)
**Módulo:** Aula Virtual / Muro (Caso 3)
**Nivel de Severidad:** Crítica (Vulnerabilidad OWASP)
**Detectado por:** Pruebas de Seguridad / Componente UI (Vitest)

*   **Descripción del Problema:** Al ejecutar el caso `UI-TSK-02`, el test de seguridad envió un *payload* que contenía `<img src=x onerror=alert('Robo_De_Token')>`. El Frontend (React) renderizó el contenido de forma insegura utilizando la directiva `dangerouslySetInnerHTML`, lo que provocó que el *script* malicioso se ejecutara en el entorno de pruebas.
*   **Causa Raíz:** El desarrollador intentó permitir que los profesores usen "Negritas" y "Cursivas" en las tareas inyectando HTML crudo directamente al DOM.
*   **Solución (Fix):** Se eliminó `dangerouslySetInnerHTML`. En su lugar, se implementó una librería de sanitización estricta (`DOMPurify`) que "limpia" cualquier etiqueta HTML peligrosa antes de que React la pinte en pantalla, permitiendo solo texto seguro.
*   **Prueba de Regresión:** Vitest verificó que el nodo `<script>` fue purgado exitosamente del Virtual DOM antes del renderizado.

---

## 🐞 Defecto 3: Condición de Carrera al Calificar
**ID:** BUG-003
**Estado:** Resuelto (Cerrado)
**Módulo:** Evaluación y Reportes (Caso 5)
**Nivel de Severidad:** Alta (Corrupción de Datos / ACID)
**Detectado por:** Pruebas de Integración con Base de Datos (Jest)

*   **Descripción del Problema:** El test `INT-GRD-01` disparó dos peticiones simultáneas (con `Promise.all()`) intentando actualizar la nota del mismo alumno al mismo tiempo (Profesor A ponía 15, Profesor B ponía 20). La base de datos aceptó ambas, resultando en un historial de auditoría corrupto y un cálculo de promedio roto.
*   **Causa Raíz:** El controlador hacía un `SELECT` de la nota, calculaba el nuevo promedio en la memoria de Node.js, y luego hacía un `UPDATE`. En concurrencia, esto genera el clásico error de "Lost Update".
*   **Solución (Fix):** Se aplicó el principio de Aislamiento (Isolation) de las propiedades ACID. Refactorizamos el controlador para que delegue la operación a la base de datos usando **Bloqueos a Nivel de Fila (`SELECT ... FOR UPDATE`)**. Ahora PostgreSQL obliga a que la segunda petición espere en cola hasta que la primera termine.
*   **Prueba de Regresión:** La prueba concurrente de Jest ahora retorna un código 200 para el primer request y fuerza una cola segura para el segundo, garantizando que el dato final sea consistente.
