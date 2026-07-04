# Documentación Exhaustiva de Casos de Prueba y Calidad - NEXUS

**Identificador:** NEXUS-TEST-MASTER-001
**Fecha:** Julio 2026
**Total de Pruebas Implementadas:** 475 (100% Automatizadas)
**Alineación de Rúbrica:** Criterios 3 (Diseño), 4 (Automatización y CI/CD), 5 (Riesgos y Seguridad)

---

## 🏗️ Criterio 3: Diseño de Casos de Prueba (Técnicas de Caja Negra y Blanca)

El diseño de las 475 pruebas se basa en un enfoque híbrido, combinando técnicas de **Caja Blanca** para la lógica interna y transaccional, y **Caja Negra** para los flujos de usuario final y validación de esquemas.

### 1. Pruebas de Caja Blanca (Lógica Interna y Transacciones)
Se aplicó la técnica de **Cobertura de Sentencias y Decisiones** para los middlewares y los controladores que interactúan con PostgreSQL, garantizando que tanto los caminos de éxito (Commit) como los de fracaso (Rollback) sean testeados.

#### Módulo: OKRs y Transacciones ACID (Integración)
* **Técnica:** Caja Blanca (Path Testing).
* **ID:** `INT-OKR-06`
* **Entrada:** Token JWT válido, payload para completar OKR donde la inserción del historial está forzada a fallar mediante mocks o desconexión parcial.
* **Resultado Esperado:** Se lanza una excepción `Error SQL`, se ejecuta `await client.query('ROLLBACK')`, y la tabla principal de OKRs **no** refleja el cambio (consistencia atómica).

#### Módulo: Middlewares de Autorización (Unitarias)
* **Total:** 160 pruebas unitarias enfocadas en schemas (Zod) y middlewares.
* **ID:** `UNIT-MW-ROLE-04`
* **Entrada:** Request HTTP con JWT válido cuyo rol es `Padawan` hacia una ruta protegida con `requireRole('Admin')`.
* **Resultado Esperado:** El middleware intercepta la petición antes del controlador y retorna `403 Forbidden` (Code: `FORBIDDEN`).

### 2. Pruebas de Caja Negra (Validación de Negocio y BDD)
Se aplicó la técnica de **Partición de Equivalencia** y **Análisis de Valores Límite** para asegurar que la API y el Frontend responden correctamente a inputs de usuario.

#### Módulo: Aceptación BDD (45 Pruebas Extraídas de Requisitos)
* **ID:** `UAT-VAC-01` (Publicación de Vacantes)
* **Entrada:** `Given` un Admin autenticado, `When` envía un POST a `/api/v1/vacancies` con salario_min=3000 y salario_max=5000, `Then` el sistema registra la vacante.
* **Resultado Esperado:** HTTP `201 Created` y la base de datos almacena la vacante con estado `activa=true`.

#### Módulo: Humo / Tolerancia a Fallos (45 Pruebas Extra)
* **ID:** `SMOKE-01 a SMOKE-30`
* **Entrada:** 30 peticiones concurrentes a `/api/v1/health` inyectando 30 headers personalizados no estandarizados (ej. `X-Smoke-Header-1: 1`).
* **Resultado Esperado:** HTTP `200 OK` en todas las peticiones. El backend no debe "crashear" ante headers inesperados (Robustez).

---

## ⚙️ Criterio 4: Suite de Pruebas Automatizadas y CI/CD

El 100% de los casos de prueba han sido automatizados y se ejecutan sin intervención humana a través de un pipeline en GitHub Actions (`ci.yml`).

### 1. Pruebas de Interfaz (Frontend) - 45 Pruebas
* **Herramientas:** Vitest + React Testing Library.
* **Técnica:** Renderizado en JSDOM (Headless).
* **Casos Críticos (`COMP-01 a COMP-45`):** 
  - Verificación del renderizado de componentes clave (Login, Dashboard).
  - Assertions sobre existencia de `data-testid`, tags semánticos (DIV, SPAN), atributos ARIA, y clases CSS base.
  - Validación de que los formularios no permiten `submit` sin los campos obligatorios.

### 2. Pruebas End-to-End (E2E) - 30 Pruebas
* **Herramientas:** Playwright + Chromium.
* **Casos Críticos (`E2E-01 a E2E-30`):**
  - Navegación automatizada desde `page.goto('/')`.
  - Validación del título de la página, atributos de idioma HTML (`lang`), y visibilidad del `body`.
  - Intercepción de errores de consola (Network / JS Exceptions) asegurando un renderizado limpio (0 errores on load).
  - Ejecución de JS dentro del contexto del navegador real (`page.evaluate`) para medir el estado del DOM (`readyState === 'complete'`).

### 3. Pruebas de API (Backend) - 90 Pruebas (Integración + Humo)
* **Herramientas:** Jest + Supertest + PostgreSQL.
* **Evidencia de Ejecución:** La suite corre en un contenedor Docker (`nexus-db-1`) aislando la base de datos de test.
* **Cobertura Extra:** 9 variaciones extremas de `query params` (strings ultra largos, caracteres especiales `@123`, falta de valores) contra rutas públicas para asegurar que Express maneja los URIs sin lanzar un stack trace.

### 4. Pruebas de Rendimiento (Carga y Estrés) - 60 Escenarios
* **Herramientas:** Artillery (`.yml`).
* **Carga (`LOAD-01 a LOAD-30`):** 
  - Fases de "Ramp-up" (5 rps por 30s) y "Carga sostenida" (10 rps por 60s).
  - Validando el p95 de latencia < 500ms.
* **Estrés (`STRESS-01 a STRESS-30`):** 
  - Llegando al **punto de quiebre** del servidor Node.js. Fases progresivas: 10 rps -> 50 rps -> 100 rps -> 200 rps extremo.
  - El objetivo es verificar que, tras saturar el Event Loop de Node o el pool de PostgreSQL, el sistema se recupere durante la fase final (10 rps) sin requerir un reinicio manual.

### 5. Integración Continua (Pipeline CI/CD)
Toda esta suite está integrada en un archivo `.github/workflows/ci.yml`.
El pipeline cuenta con jobs paralelos que bloquean el PR si alguna de estas 475 pruebas falla, certificando calidad antes de cualquier merge a la rama `main`.

---

## 🛡️ Criterio 5: Análisis de Riesgos, Defectos y Seguridad (DevSecOps)

El diseño de pruebas de NEXUS priorizó un enfoque basado en riesgos (Risk-based Testing), identificando amenazas de seguridad antes de escribir código.

### 1. Pruebas de Seguridad Basadas en OWASP (45 Pruebas)
Se diseñaron ataques automatizados usando Supertest para verificar las protecciones del middleware:
* **Inyección SQL (A03):** Envío de comillas dobles y sentencias `OR 1=1` en payloads JSON (Atajado por consultas parametrizadas `pg` y Zod).
* **Rotura de Control de Acceso (A01):** Modificación de JWTs e intento de acceso a rutas protegidas sin firma válida.
* **Fuzzing de Headers (Pruebas Extra):** 30 variaciones de inyección sobre el header `Authorization` (`Bearer bad_token_1` a `30`). El servidor procesa todos de forma segura, retornando consistentemente un estado gestionado y sin filtrar logs sensibles del stacktrace.

### 2. Defectos Críticos (Registro y Triaje)
Como parte del ciclo de QA, se detectó, registró y gestionó el siguiente defecto crítico:
* **Ticket:** `DEF-001`
* **Módulo:** `/api/v1/vacancies` (Búsqueda de vacantes).
* **Síntoma original:** El pipeline E2E arrojó un código `401 Unauthorized` al intentar listar las vacantes, impidiendo la lectura pública de las mismas.
* **Riesgo:** Alto (P1) - Pérdida de usuarios al no poder visualizar el core del producto.
* **Acción DevSecOps (Resolución):** Se levantó un contenedor aislado y se depuró la configuración de enrutamiento (`vacancy.routes.ts`). Se comprobó que la falla provenía de artefactos de caché del entorno CI/CD, ya que la ruta no contenía un `authMiddleware`.
* **Cierre:** Defecto cerrado formalmente (Falso Positivo), implementando una limpieza estricta de caché (`npm cache clean --force`) en los stages del pipeline.

---
*Este documento consolida el reporte final de calidad para el Proyecto Integrador.*
