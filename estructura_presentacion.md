# Estructura de Presentación -- Proyecto Integrador Final
## Nexus: Plataforma de Mentoría Tech

> Estructura propuesta para Canva (slides) e Informe escrito.
> Mapeada 1:1 contra la rúbrica del profesor Alfaro (20 pts).
> Tiempo estimado: 15-20 min (exposición + demo + preguntas).

---

## SLIDE 1 -- Portada
- Nombre del sistema: **Nexus**
- Curso: Pruebas de Software -- VII Ciclo -- 2026-I
- Universidad: UNMSM -- FISI
- Integrantes del equipo
- Logo / branding

---

## SLIDE 2 -- Agenda / Índice
- Listado visual de las 8 secciones (para que el jurado sepa qué esperar)

---

## SECCIÓN 1: Presentación del Sistema y Alcance (Rúbrica: 2 pts)

### SLIDE 3 -- ¿Qué es Nexus?
- Definición: Plataforma de mentoría tech (conecta Mentores "Jedis" con Aprendices "Padawans")
- Problema que resuelve
- Usuarios objetivo

### SLIDE 4 -- Funcionalidades Principales
- Mapa visual de los **15 módulos funcionales** del sistema:
  - Autenticación (registro, login, JWT)
  - Onboarding personalizado
  - Dashboard diferenciado por rol
  - Gestión de Perfil y Skills
  - Matching Mentor-Aprendiz (algoritmo IA)
  - Sesiones de Mentoría 1-a-1
  - OKRs (Objetivos y Resultados Clave)
  - Sistema de Cursos (CRUD, inscripción)
  - Aula Virtual por curso (posts, tareas, entregas)
  - Sistema de Notas y Exportación CSV
  - Chat en tiempo real
  - Vacantes laborales
  - Notificaciones (SSE en tiempo real)
  - Membresías (Gratis, I, II, III)
  - Panel de IA (recomendaciones)

### SLIDE 5 -- Arquitectura del Sistema
- Diagrama de arquitectura de 3 capas:
  - **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
  - **Backend:** Node.js + Express + TypeScript (API REST)
  - **Base de Datos:** PostgreSQL 16
  - **Infraestructura:** Docker Compose (3 contenedores: db, backend, frontend/nginx)
- Esquema de despliegue (docker-compose.yml)

### SLIDE 6 -- Modelo de Datos
- Diagrama ER simplificado (13 migraciones SQL)
- Tablas principales: usuario, mentor, perfil_aprendiz, curso, aula_curso, sesion, okr, matching, notificacion, membresia, etc.

### SLIDE 7 -- Evolución desde Semana 7
- Qué tenían en la propuesta inicial vs. qué tienen ahora
- Módulos nuevos agregados (cursos, aula virtual, notas, membresías, IA)

---

## SECCIÓN 2: Plan y Estrategia de Pruebas (Rúbrica: 3 pts)

### SLIDE 8 -- Estrategia General de Testing
- Enfoque: Pirámide de Testing completa (unitarias -> integración -> E2E)
- Alineación con **ISTQB** (niveles de prueba) e **ISO/IEC 29119** (proceso de pruebas)
- Referencia al documento: `docs/plan_de_pruebas_nexus.md`

### SLIDE 9 -- Niveles de Prueba Implementados
- Tabla/diagrama de pirámide mostrando los niveles:
  1. **Unitarias** (caja blanca): Middlewares, schemas Zod, tipos TypeScript
  2. **Integración** (API): Auth, Courses, Sessions, OKRs, Vacancies, Notifications, IA
  3. **Smoke** (humo): Verificación rápida de endpoints críticos
  4. **Aceptación**: Flujos completos de usuario por rol (Padawan, Jedi, Admin)
  5. **Seguridad**: Inyección SQL, XSS, CSRF, JWT manipulation, Rate Limiting
  6. **Carga** (Artillery): 6 escenarios de carga
  7. **Estrés** (Artillery): 6 escenarios de estrés (spike, endurance, limits)
  8. **E2E** (Playwright): Flujo completo en navegador real
  9. **Componente UI** (Vitest + React Testing Library): LoginPage

### SLIDE 10 -- Justificación según Contexto de Negocio
- Por qué se priorizó seguridad (plataforma con datos personales)
- Por qué se priorizó integración (API-first architecture)
- Por qué se necesitan pruebas de carga (plataforma educativa con picos de uso)

---

## SECCIÓN 3: Diseño de Casos de Prueba (Rúbrica: 3 pts)

### SLIDE 11 -- Técnicas Aplicadas
- **Caja Negra:** Partición de equivalencias, valores límite, tablas de decisión
  - Ejemplo: Login con credenciales válidas, inválidas, campos vacíos, email mal formateado
- **Caja Blanca:** Cobertura de sentencias, cobertura de ramas
  - Ejemplo: Middleware auth (token válido, expirado, ausente, malformado)
- **Basadas en Riesgo:** Priorización de flujos críticos de negocio
  - Ejemplo: Seguridad -- inyección SQL en todos los endpoints

### SLIDE 12 -- Matriz de Casos de Prueba (resumen)
- Referencia a `docs/matriz_trazabilidad.md`
- Tabla resumen: Módulo | Nro. Casos | Técnica | Prioridad
- Ejemplo de 2-3 casos de prueba detallados con entrada/salida esperada

### SLIDE 13 -- Documentación de Casos
- Referencia a `docs/documentacion_todas_las_pruebas.md` (42KB de documentación)
- Capturas de la estructura del documento

---

## SECCIÓN 4: Automatización de Pruebas (Rúbrica: 4 pts)

### SLIDE 14 -- Herramientas de Automatización
- Tabla de herramientas usadas:
  | Herramienta | Tipo de Prueba | Versión |
  |---|---|---|
  | Jest + Supertest | Unit + Integración + Smoke + Security + Acceptance | Backend |
  | Vitest + React Testing Library | Componente UI | Frontend |
  | Playwright | E2E (navegador real) | Frontend |
  | Artillery | Carga y Estrés | Backend |
  | GitHub Actions | CI/CD Pipeline | Infraestructura |
  | CodeQL | SAST (análisis estático de seguridad) | Infraestructura |
  | OWASP ZAP | DAST (análisis dinámico de seguridad) | Infraestructura |
  | SonarCloud | Calidad de código, code smells, cobertura | Infraestructura |

### SLIDE 15 -- Suite de Pruebas Backend (números)
- Estructura de archivos de test:
  - `tests/unit/` -- 11 archivos (middleware, schemas, types)
  - `tests/*.test.ts` -- 7 archivos (auth, courses, sessions, okr, vacancies, notifications, ia)
  - `tests/integration.extra.test.ts` -- pruebas adicionales
  - `tests/smoke/` -- 2 archivos
  - `tests/acceptance/` -- 2 archivos
  - `tests/security/` -- 2 archivos
  - `tests/load/` -- 6 escenarios Artillery
  - `tests/stress/` -- 6 escenarios Artillery
- **Total: 475+ test cases automatizados**

### SLIDE 16 -- Suite de Pruebas Frontend
- `src/test/LoginPage.test.tsx` -- Pruebas de componente UI
- `src/test/extra.test.tsx` -- Pruebas adicionales
- `e2e/nexus.spec.ts` -- E2E con Playwright
- `e2e/extra.spec.ts` -- E2E adicional
- `e2e/grades_export.spec.ts` -- E2E flujo de notas

### SLIDE 17 -- Pipeline CI/CD (GitHub Actions)
- Diagrama del pipeline con los 6 workflows:
  1. `ci.yml` -- Pipeline principal (lint, test, build, coverage)
  2. `ci-develop.yml` -- Pipeline de desarrollo
  3. `ci-main.yml` -- Pipeline de producción
  4. `codeql.yml` -- SAST (análisis estático de seguridad)
  5. `dast-owasp.yml` -- DAST (OWASP ZAP contra API real)
  6. `sonarcloud.yml` -- Análisis de calidad de código
- Captura del pipeline en verde en GitHub

### SLIDE 18 -- Evidencia de Ejecución
- Captura de terminal con tests pasando (npm test)
- Capturas de GitHub Actions en verde
- Capturas de reporte de cobertura (lcov)

---

## SECCIÓN 5: Análisis de Riesgos, Defectos y Seguridad (Rúbrica: 2 pts)

### SLIDE 19 -- Riesgos Identificados
- Tabla de riesgos priorizados:
  - Inyección SQL (Crítico) -- Mitigado con queries parametrizadas
  - XSS (Alto) -- Mitigado con sanitización + React escaping
  - Fuerza bruta en login (Alto) -- Mitigado con Rate Limiting (200 req/15min)
  - Escalación de privilegios (Crítico) -- Mitigado con RBAC (Padawan/Jedi/Admin)
  - DoS (Medio) -- Mitigado con Rate Limiter global (200 req/15min)

### SLIDE 20 -- DevSecOps Implementado
- Diagrama del enfoque DevSecOps:
  - **SAST:** CodeQL (análisis estático en cada PR)
  - **DAST:** OWASP ZAP (escaneo dinámico contra la API corriendo)
  - **SCA:** SonarCloud (code smells, vulnerabilidades en dependencias)
  - **Seguridad en código:** bcryptjs (12 rounds), JWT con expiración, validación Zod
- Rulesets de GitHub (protección de ramas develop y main)

### SLIDE 21 -- OWASP Top 10 Cubierto
- Tabla mapeando qué vulnerabilidades OWASP Top 10 están cubiertas:
  - A01: Broken Access Control -- RBAC middleware
  - A02: Cryptographic Failures -- bcryptjs, JWT
  - A03: Injection -- Queries parametrizadas, validación Zod
  - A07: Authentication Failures -- Rate Limiting, JWT expiration

---

## SECCIÓN 6: Demo en Vivo (Rúbrica: 3 pts)

### SLIDE 22 -- Plan de la Demo
- Indicar al jurado: "Ahora vamos a demostrar el sistema funcionando en tiempo real"
- Flujo planeado (manual):
  1. Abrir el sistema (localhost:5174)
  2. Mostrar la Landing Page
  3. Login como Mentor (jedi@gmail.com)
  4. Navegar al Dashboard
  5. Entrar a un Curso -> Aula Virtual
  6. Asignar una nota a un estudiante
  7. Exportar CSV de calificaciones
  8. (Opcional) Login como Padawan para mostrar la vista del estudiante
- Ejecución de tests automatizados en terminal:
  - `npm test` (475+ tests en verde)

### (NO ES SLIDE -- es la demo real en el navegador y terminal)

---

## SECCIÓN 7: Documentación y Métricas de Calidad (Rúbrica: 2 pts)

### SLIDE 23 -- Documentación Entregada
- Lista de documentos con enlaces/capturas:
  - `docs/plan_de_pruebas_nexus.md` (35KB) -- Plan completo alineado a ISTQB
  - `docs/documentacion_todas_las_pruebas.md` (42KB) -- Todos los casos documentados
  - `docs/matriz_trazabilidad.md` (5KB) -- Trazabilidad requisito-prueba
  - `docs/NEXUS_REPORTE_FINAL_INTEGRADOR.md` (7KB) -- Reporte final
  - `docs/IMPLEMENTACION.md` (40KB) -- Detalle de implementación

### SLIDE 24 -- Métricas de Calidad
- Métricas clave:
  - **Total de test cases:** 475+
  - **Cobertura de código:** (dato de lcov -- captura)
  - **Tasa de defectos encontrados vs. corregidos:** mostrar
  - **Tiempo promedio de ejecución de la suite:** ~X segundos
  - **Tipos de prueba cubiertos:** 9 tipos (unitarias, integración, smoke, aceptación, seguridad, carga, estrés, E2E, componente)
- Interpretación: qué significan estas métricas para la toma de decisiones

---

## SECCIÓN 8: Conclusiones y Mejoras (Rúbrica: 1 pt)

### SLIDE 25 -- Conclusiones
- La estrategia de pruebas implementada:
  - Garantiza la calidad funcional del sistema (475+ tests automatizados)
  - Reduce riesgos de seguridad (DevSecOps: SAST + DAST + SCA)
  - Permite detectar regresiones automáticamente (CI/CD en cada push)
  - Cubre la pirámide completa de testing (desde unitarias hasta E2E)

### SLIDE 26 -- Mejoras Futuras
- Aumentar cobertura de pruebas E2E (más flujos críticos)
- Implementar pruebas de accesibilidad (a11y)
- Agregar pruebas de rendimiento del frontend (Lighthouse CI)
- Integrar pruebas de contrato (consumer-driven contracts)
- Monitoreo en producción (observabilidad)

### SLIDE 27 -- Cierre
- "Gracias" + datos de contacto del equipo
- Repositorio GitHub: chocliCode/Nexus
- QR al repo (opcional)

---

## Resumen de Mapeo Rúbrica vs. Slides

| Criterio Rúbrica | Pts | Slides | Evidencia Principal |
|---|---|---|---|
| 1. Presentación y Alcance | 2 | 3-7 | 15 módulos, arquitectura 3 capas, Docker |
| 2. Plan y Estrategia | 3 | 8-10 | plan_de_pruebas_nexus.md, ISTQB, ISO 29119 |
| 3. Diseño de Casos | 3 | 11-13 | matriz_trazabilidad.md, documentacion_todas_las_pruebas.md |
| 4. Automatización | 4 | 14-18 | 475+ tests, 8 herramientas, 6 workflows CI/CD |
| 5. Seguridad y Riesgos | 2 | 19-21 | CodeQL, OWASP ZAP, SonarCloud, Rate Limiting |
| 6. Demo en Vivo | 3 | 22 | Demo manual + ejecución de suite en terminal |
| 7. Documentación y Métricas | 2 | 23-24 | 5 documentos, métricas de cobertura |
| 8. Comunicación y Equipo | 1 | 25-27 | Exposición fluida, conclusiones sólidas |
| **TOTAL** | **20** | **~27 slides** | |

---

> [!TIP]
> **Tiempo sugerido por sección:**
> - Secciones 1-3 (contexto + plan + casos): ~5-6 min
> - Sección 4 (automatización + CI/CD): ~3-4 min
> - Sección 5 (seguridad): ~2 min
> - Sección 6 (DEMO EN VIVO): ~4-5 min
> - Secciones 7-8 (docs + conclusiones): ~2-3 min
> - **Total: ~16-20 min**
