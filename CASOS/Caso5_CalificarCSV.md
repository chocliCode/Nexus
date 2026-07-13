# Caso 5: Calificar y Exportar CSV (Implementación 10 Niveles de Prueba)

Este documento centraliza la evidencia de las implementaciones de los 10 niveles de pruebas requeridos para el Caso de Uso: **Calificar Entregas y Exportar Notas en CSV**. Este caso fue diseñado para demostrar el control sobre **Transacciones ACID**, las inyecciones complejas (OWASP) y escenarios pesados de **Carga/Estrés** en memoria.

A continuación, detallamos las 3 pruebas principales por cada nivel.

---

## 1.1 Análisis Estático (Lint & Types)
*Prevención de errores de formato antes del build.*
1. **Tipado de Streams:** Validamos estáticamente el uso de las dependencias nativas y externas (`fast-csv` y el objeto `res` de Express). Evitamos el desbordamiento forzando un tipado sobre los Event Emitters.
2. **Límites Numéricos:** Zod asegura estáticamente que la `calificacion` tenga `.min(0)` y `.max(20)` como reglas rígidas antes de que toque los controladores.
3. **No Magic Strings en Headers:** Las reglas de Lint nos aseguran de que el MIME type para descargas de Excel/CSV (`text/csv`) y las cabeceras `Content-Disposition: attachment` estén correctamente escritas sin errores de tipeo.

## 1.2 Pruebas Unitarias Backend (Caja Blanca)
*Aislamos el comportamiento del controlador de CSV con `grade.controller.unit.test.ts`.*
1. **UNIT-GRD-01 (Éxito al calificar):** Mockeamos el pool de base de datos. Simulamos un Mentor inyectando "18". Comprobamos que retorna 200 con `{ success: true }`.
2. **UNIT-GRD-02 (Exportación Headers):** Simulamos la llamada a exportar notas. Capturamos mediante *Spies* de Jest que Express dispare exactamente la cabecera `Content-Disposition` con el filename `calificaciones-curso1.csv`.
3. **UNIT-GRD-03 (Rebote Transaccional):** Inducimos un error de Constraint a nivel de base de datos mockeada (Ej: Nota fuera de rango de tabla). Validamos que invoque `next(error)` sin caerse.

## 1.3 Pruebas de Componente UI (Vitest)
*Prueba de interacciones con el DOM en `GradesTable.test.tsx`.*
1. **UI-GRD-01 (Renderizado de Tabla):** El componente lee un mock de notas y renderiza correctamente cada botón "Calificar" para los registros de alumnos.
2. **UI-GRD-02 (Mutación Simulada):** Hacemos *click* virtual en el botón de calificación de una fila y capturamos que se envía el ID correcto con la nota tipeada.
3. **UI-GRD-03 (Trigger de Descarga):** El testing intercepta el botón de "Exportar CSV" asegurando que su evento interno intente generar la URL de tipo `Blob` en el frontend.

## 1.4 Pruebas de Seguridad OWASP (CSV Injection e IDOR)
*Blindaje contra ataques a nivel de lógica de negocio en `grade.csv.test.ts`.*
1. **SEC-GRD-01 (CSV Formula Injection):** El test fuerza la existencia de un alumno malicioso que se llama `=cmd|' /C calc'!A0` (Ataque clásico de Excel). Verificamos que el reporte CSV exportado lo haya escapado anteponiendo una comilla simple (`'`) para evitar ejecución de macros locales en la computadora del profesor.
2. **SEC-GRD-02 (IDOR en Calificación):** Un Padawan intenta usar un PUT Request directo a `/submissions/:id/grade` para calificarse a sí mismo con "20". El API bloquea con 403.
3. **SEC-GRD-03 (Data Leakage):** Un Padawan trata de golpear la ruta de `/grades/export` de un curso para ver las notas de sus compañeros. El sistema detecta que no es Jedi ni Mentor y responde 403.

## 1.5 Pruebas de Humo / Smoke
*Supervisión de salud del ecosistema en `grade.smoke.test.ts`.*
1. **SMOKE-GRD-01:** La ruta de exportar CSV (`GET`) debe cortar accesos no autenticados inmediatamente devolviendo `401`.
2. **SMOKE-GRD-02:** La ruta de calificar (`PUT`) rechaza cuerpos vacíos sin provocar un *Crash*.
3. **SMOKE-GRD-03:** Validamos que la lectura general de notas no procese si falta el token (Ahorrando recursos).

## 1.6 Pruebas de Integración API + DB (Foco: Transacciones ACID)
*Demostrando robustez bajo carga en `grade.acid.test.ts`.*
1. **INT-GRD-01 (Atomicity):** Intentamos calificar una entrega *inexistente*. La operación de `UPDATE` se revierte y la BD se mantiene inalterable sin corromper índices ni sumatorios.
2. **INT-GRD-02 (Consistency):** Intentamos escribir una nota de "25". El API y/o la restricción `CHECK` de PostgreSQL mantienen la coherencia bloqueando la transacción e imposibilitando datos sucios.
3. **INT-GRD-03 (Isolation / Bloqueos):** Lanzamos `Promise.all` para ejecutar dos peticiones de calificación en milisegundos idénticos hacia el mismo alumno. Comprobamos que el motor resuelve los bloqueos (Locks) y serializa la transacción sin corromper el dato final.

## 1.7 Pruebas de Aceptación BDD (Cucumber)
*Pruebas legibles para el cliente en `nexus.feature`.*
1. **UAT-GRD-01:** Given Mentor -> When califica con "18" -> Then actualiza y da 200.
2. **UAT-GRD-02:** Given curso lleno -> When pide exportar -> Then el sistema devuelve el archivo CSV.
3. **UAT-GRD-03:** Given Mentor -> When pone "25" -> Then sistema rechaza.

## 1.8 Pruebas E2E Playwright
*Testing interactivo del File Download en `grades.spec.ts`.*
1. **E2E-GRD-01 (Flujo Ideal):** Chrome autómata entra como Jedi, va a Calificaciones, tipea "18" en el cuadro, da a guardar y valida la aparición visual del toast "Calificación guardada".
2. **E2E-GRD-02 (Límite Visual):** El autómata tipea "25" e intenta guardar. Verifica que el botón dispara el aviso visual sin recargar la página.
3. **E2E-GRD-03 (Intercepción de Archivo):** Con `page.waitForEvent('download')`, el test simula el clic en "Exportar CSV" y el sistema corrobora que el navegador intentó descargar un archivo real cuyo nombre sugerido termina en `.csv`.

## 1.9 Pruebas de Carga / Load
*Verificando concurrencia de profesores en `load-grades.yml`.*
1. **LOAD-GRD-01 (Carga de Streams):** Múltiples profesores descargando reportes de CSV de 1000 estudiantes simultáneamente, evaluando si `fast-csv` bloquea o encola correctamente el Event Loop de Node.js.
2. **LOAD-GRD-02 (Puts Masivos):** Profesores usando la tabla como Excel, disparando miles de request `PUT` consecutivos para calificar filas completas en segundos.
3. **LOAD-GRD-03 (Consultas Públicas):** Alta demanda de alumnos consultando su libreta de notas al final de trimestre.

## 1.10 Pruebas de Estrés / Stress
*Buscando el Crash intencional en `stress-grades.yml`.*
1. **STRESS-GRD-01 (Deadlock Attack):** Tráfico extremo contra una misma fila exacta de PostgreSQL (mismo ID de envío) para generar conflictos entre operaciones READ y WRITE.
2. **STRESS-GRD-02 (Ahogo de RAM / OOM):** Exigir al endpoint de exportación que genere un CSV de 100,000 registros para ver si la memoria RAM explota (Out of Memory) y forzar que solo trabajemos con Streams.
3. **STRESS-GRD-03 (DDoS Calificaciones):** Avalancha de peticiones vacías al endpoint de calificar para poner a prueba si los esquemas Zod protegen o hunden el backend frente al parser.
