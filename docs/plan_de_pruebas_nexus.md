# Plan de Pruebas -- NEXUS

## Plataforma SaaS de Mentoria 1-a-1

**Identificador del documento:** NEXUS-TP-001
**Version:** 1.0
**Fecha de elaboracion:** Julio 2026
**Elaborado por:** Grupo 10 -- UNMSM, FISI, Ingenieria de Software
**Curso:** Pruebas de Software -- VII Ciclo -- 2026-I
**Docente:** Mg. Victor Hugo Alfaro Yangali

**Marco de referencia:**
- ISTQB Certified Tester Foundation Level (CTFL) v4.0 -- Proceso Fundamental de Pruebas
- ISO/IEC 29119-3:2021 -- Documentacion de pruebas (estructura del plan)
- IEEE 829 -- Estandar de documentacion de pruebas de software
- OWASP Top 10:2021 -- Riesgos de seguridad en aplicaciones web

---

## Tabla de Contenidos

1. [Identificacion del Plan](#1-identificacion-del-plan)
2. [Introduccion y Contexto](#2-introduccion-y-contexto)
3. [Objeto de Prueba](#3-objeto-de-prueba)
4. [Alcance del Testing](#4-alcance-del-testing)
5. [Enfoque de Pruebas (Estrategia)](#5-enfoque-de-pruebas-estrategia)
6. [Niveles y Tipos de Prueba](#6-niveles-y-tipos-de-prueba)
7. [Tecnicas de Diseno de Pruebas](#7-tecnicas-de-diseno-de-pruebas)
8. [Criterios de Entrada y Salida](#8-criterios-de-entrada-y-salida)
9. [Entorno de Pruebas](#9-entorno-de-pruebas)
10. [Entregables de Prueba](#10-entregables-de-prueba)
11. [Automatizacion y Pipeline CI/CD](#11-automatizacion-y-pipeline-cicd)
12. [Analisis de Riesgos del Proyecto de Pruebas](#12-analisis-de-riesgos-del-proyecto-de-pruebas)
13. [Analisis de Riesgos del Producto](#13-analisis-de-riesgos-del-producto)
14. [Metricas de Calidad](#14-metricas-de-calidad)
15. [Cronograma de Actividades](#15-cronograma-de-actividades)
16. [Responsabilidades](#16-responsabilidades)
17. [Referencias Normativas](#17-referencias-normativas)

---

## 1. Identificacion del Plan

| Campo | Valor |
|-------|-------|
| **Proyecto** | NEXUS -- Transformacion del Talento |
| **Tipo de aplicacion** | Plataforma SaaS web (Single Page Application + API REST) |
| **Dominio** | Educacion y empleabilidad (ODS 4, 8, 17) |
| **Version bajo prueba** | 1.0.0 |
| **Periodo de pruebas** | Mayo -- Julio 2026 |
| **Total de casos de prueba** | 475 |
| **Nivel de riesgo del proyecto** | Medio-Alto (datos personales, transacciones ACID, roles con privilegios) |

---

## 2. Introduccion y Contexto

### 2.1 Descripcion del Sistema

NEXUS es una plataforma SaaS de mentoria 1-a-1 que conecta jovenes universitarios de tecnologia (**Padawans**) con profesionales en activo (**Mentores Jedis**). El sistema gestiona:

- **Autenticacion y autorizacion** basada en roles (Padawan, Jedi, Admin)
- **OKRs** (Objectives and Key Results) con transacciones ACID y trazabilidad
- **Sesiones de mentoria** con ciclo de vida completo (programar, completar, cancelar)
- **Vacantes laborales** con postulacion y gestion
- **Diagnostico de IA** para deteccion de riesgo de abandono
- **Score de empleabilidad** calculado transaccionalmente
- **Notificaciones** en tiempo real
- **Onboarding** con diagnostico y rutas de aprendizaje
- **Aula virtual** con feed, recursos y chat

### 2.2 Contexto de Negocio

La calidad del software es critica para NEXUS por las siguientes razones:

| Factor de negocio | Implicacion para el testing |
|--------------------|-----------------------------|
| **Datos personales** de universitarios y mentores | Requiere pruebas de seguridad (OWASP), validacion de autorizacion por roles, y prevencion de acceso no autorizado a datos ajenos |
| **Transacciones ACID** que modifican scores y estados | Requiere pruebas de integridad transaccional, verificacion de ROLLBACK, y validacion de reglas de negocio (RN-01 a RN-06) |
| **Tres roles con privilegios distintos** (Padawan, Jedi, Admin) | Requiere pruebas de autorizacion exhaustivas para cada combinacion de rol y endpoint |
| **API REST publica** expuesta en Internet | Requiere pruebas de carga/estres para garantizar disponibilidad, y pruebas de seguridad contra ataques comunes |
| **Operaciones criticas** (postulaciones, OKRs) | Requiere pruebas de aceptacion que validen los flujos de negocio completos desde la perspectiva del usuario |
| **Entorno universitario** con picos de uso predecibles | Requiere pruebas de estres para simular inicio de semestre y periodos de evaluacion |

### 2.3 Evolucion desde la Semana 7

La actividad integradora de la semana 7 establecia la base del proyecto con pruebas de integracion para los modulos de autenticacion y OKRs. Para el proyecto integrador final, se amplio la estrategia de la siguiente manera:

| Aspecto | Semana 7 | Proyecto Final |
|---------|----------|----------------|
| Tipos de prueba | 1 (integracion) | 9 tipos completos |
| Total de tests | 14 | 475 |
| Modulos cubiertos | Auth, OKRs | Auth, OKRs, Sesiones, Vacantes, IA, Notificaciones, Perfiles |
| Automatizacion | Scripts locales | Pipeline CI/CD con 8 jobs paralelos |
| Seguridad | JWT basico | 15 tests OWASP (A01, A03, A04, A05, A07) |
| Rendimiento | Ninguno | 30 tests de carga + estres (Artillery) |
| E2E | Ninguno | 15 tests Playwright con navegador real |
| Documentacion | README basico | Plan de pruebas formal, 10 documentos de prueba, diagramas C4 |

---

## 3. Objeto de Prueba

### 3.1 Componentes bajo prueba

| Componente | Tecnologia | Alcance de pruebas |
|------------|------------|---------------------|
| **Backend API** | Node.js + Express.js + TypeScript | 12 controladores, 12 archivos de rutas, 4 middleware, 5 schemas Zod |
| **Frontend SPA** | React 18 + TypeScript + Vite + Tailwind CSS | LoginPage (renderizado, validacion, interaccion) |
| **Base de datos** | PostgreSQL 16 | 4 migraciones, 20+ tablas, transacciones ACID |
| **Infraestructura** | Docker + Docker Compose | 3 servicios (frontend, backend, PostgreSQL) |
| **Pipeline CI/CD** | GitHub Actions | 8 jobs paralelos + resumen de regresion |

### 3.2 Funcionalidades principales

| ID | Modulo | Funcionalidad | Prioridad |
|----|--------|---------------|-----------|
| F-01 | Autenticacion | Registro, login, sesion JWT | Critica |
| F-02 | OKRs | Crear, actualizar, completar (transaccion ACID) | Critica |
| F-03 | Sesiones | CRUD sesiones de mentoria | Alta |
| F-04 | Vacantes | Publicar, buscar, filtrar, postular | Alta |
| F-05 | IA | Score de riesgo de abandono | Media |
| F-06 | Notificaciones | Listar, marcar leida, conteo | Media |
| F-07 | Perfiles | Gestion de habilidades, score empleabilidad | Alta |
| F-08 | Matching | Generacion y respuesta de matchings | Media |
| F-09 | Onboarding | Diagnostico, learning path | Baja |
| F-10 | Aula Virtual | Feed, recursos, chat | Baja |

---

## 4. Alcance del Testing

### 4.1 Dentro del alcance

- Validacion funcional de los 12 modulos de la API REST
- Validacion de esquemas de datos (Zod) para los 5 schemas implementados
- Verificacion de autenticacion JWT y autorizacion por roles
- Integridad transaccional ACID (completar OKR, registrar habilidad)
- Renderizado y comportamiento del componente LoginPage
- Flujos E2E completos en navegador (login, registro, dashboard, vacantes, logout)
- Seguridad contra OWASP Top 10 (A01, A03, A04, A05, A07)
- Rendimiento bajo carga normal (hasta 20 rps) y estres (hasta 500 rps)
- Disponibilidad y health checks (pruebas de humo)
- Validacion de requisitos de negocio (pruebas de aceptacion BDD)
- Regresion automatizada via pipeline CI/CD

### 4.2 Fuera del alcance

- Pruebas de usabilidad con usuarios reales
- Pruebas de accesibilidad (WCAG)
- Pruebas de compatibilidad cross-browser (solo Chromium)
- Penetration testing profesional (se realizan pruebas automatizadas de seguridad)
- Pruebas de rendimiento en entorno de produccion (se usa entorno local/CI)
- Validacion de despliegue en Azure (App Service + Static Web Apps)

---

## 5. Enfoque de Pruebas (Estrategia)

### 5.1 Proceso Fundamental de Pruebas (ISTQB CTFL)

La estrategia de pruebas sigue el **proceso fundamental de pruebas** definido por ISTQB:

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ Planificacion│──▶│   Analisis   │──▶│    Diseno    │──▶│Implementacion│──▶│  Ejecucion   │──▶│ Completitud  │
│  y Control   │   │              │   │              │   │              │   │              │   │  y Reporte   │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
       │                   │                  │                  │                  │                   │
       ▼                   ▼                  ▼                  ▼                  ▼                   ▼
  Este documento     Analisis de         Tecnicas de       Implementacion     Pipeline CI/CD     Metricas de
  Plan de pruebas    riesgos y           caja negra,       de 475 tests       con 8 jobs         calidad,
  Estrategia         requisitos          caja blanca,      9 suites           automatizados      reportes de
  Objetivos          Casos de prueba     basada en riesgo  Frameworks         Ejecucion          defectos
                     Condiciones                           configurados       automatica
```

### 5.2 Alineacion con ISO/IEC 29119

Este plan sigue la estructura de **ISO/IEC 29119-3:2021** para documentacion de pruebas:

| Clausula ISO 29119-3 | Seccion en este documento |
|----------------------|---------------------------|
| Test Plan Identification | Seccion 1 |
| Introduction | Seccion 2 |
| Test Items | Seccion 3 |
| Features to be Tested | Seccion 4.1 |
| Features not to be Tested | Seccion 4.2 |
| Approach | Seccion 5 |
| Item Pass/Fail Criteria | Seccion 8 |
| Test Environment | Seccion 9 |
| Test Deliverables | Seccion 10 |
| Schedule | Seccion 15 |
| Staffing and Training | Seccion 16 |
| Risks and Contingencies | Secciones 12 y 13 |

### 5.3 Principios de Testing Aplicados (ISTQB)

| Principio ISTQB | Aplicacion en NEXUS |
|-----------------|---------------------|
| **1. Las pruebas muestran la presencia de defectos** | Las 475 pruebas no garantizan la ausencia de defectos, pero incrementan la confianza en la calidad del sistema |
| **2. Las pruebas exhaustivas son imposibles** | Se priorizaron las funcionalidades criticas (auth, OKRs, seguridad) usando analisis de riesgo |
| **3. Las pruebas tempranas ahorran tiempo** | Las pruebas unitarias (160) detectan defectos en la capa de validacion antes de llegar a integracion |
| **4. Agrupacion de defectos** | Los modulos de auth y OKRs concentran la mayor cantidad de reglas de negocio y, por tanto, mas pruebas |
| **5. La paradoja del pesticida** | Se implementaron 9 tipos de prueba distintos para detectar defectos en diferentes capas |
| **6. Las pruebas dependen del contexto** | La seleccion de tipos de prueba se justifica por el contexto de negocio (seccion 6) |
| **7. La ausencia de errores es una falacia** | Las pruebas de aceptacion validan que el sistema cumple los requisitos del negocio, no solo la ausencia de bugs |

---

## 6. Niveles y Tipos de Prueba

### 6.1 Piramide de Testing

```
                   /\
                  /  \
                 / 45 \                   Aceptacion (UAT/BDD)
                /------\
               /  30    \                 E2E (Playwright)
              /----------\
             /    45      \               Seguridad (OWASP)
            /--------------\
           /      45        \             Humo (Smoke)
          /------------------\
         /        30          \           Estres (hasta 500 rps)
        /----------------------\
       /          30            \         Carga (hasta 20 rps)
      /--------------------------\
     /            45              \       Componente UI
    /------------------------------\
   /              45                \     Integracion (API + DB)
  /----------------------------------\
 /               160                  \   Unitarias
/______________________________________\

Total: 475 pruebas
```

### 6.2 Tipos de Prueba Seleccionados y Justificacion

Cada tipo de prueba fue seleccionado en funcion del **contexto de negocio** y los **riesgos identificados** del sistema NEXUS:

| # | Tipo | Tests | Nivel ISTQB | Justificacion de negocio |
|---|------|-------|-------------|--------------------------|
| 1 | **Unitarias** | 160 | Componente | NEXUS tiene 5 schemas Zod y 3 middleware que son la primera linea de defensa contra datos invalidos. Validar cada campo y cada ruta del middleware de forma aislada asegura que los errores se detectan en la capa mas barata y rapida. Con 160 tests, la base de la piramide es solida. |
| 2 | **Integracion** | 45 | Integracion | Los 6 modulos principales (auth, OKRs, sesiones, IA, notificaciones, vacantes) se comunican a traves de Express + PostgreSQL. Las pruebas de integracion verifican que el ensamblaje entre capas (router, middleware, controller, DB) funciona correctamente con datos reales. |
| 3 | **Componente UI** | 45 | Componente | El LoginPage es el punto de entrada del sistema y la primera impresion del usuario. Verificar que renderiza correctamente, que los inputs tienen los atributos correctos, y que la interaccion con el hook useAuth funciona, protege contra regresiones visuales. |
| 4 | **E2E** | 30 | Sistema | NEXUS es una SPA donde el frontend React se comunica con la API Express. Los tests E2E con Playwright verifican flujos completos (login, navegacion, proteccion de rutas, logout) en un navegador Chromium real, detectando problemas de integracion frontend-backend que otros niveles no pueden capturar. |
| 5 | **Seguridad** | 45 | Sistema | NEXUS maneja datos personales de universitarios, credenciales de autenticacion, y roles con privilegios. Las pruebas de seguridad cubren 5 categorias del OWASP Top 10 (A01, A03, A04, A05, A07) para verificar que el sistema resiste SQL injection, XSS, broken access control, y mass assignment. |
| 6 | **Carga** | 30 | Sistema | NEXUS esta disenado para un entorno universitario con picos predecibles (inicio de semestre, evaluaciones). Las pruebas de carga con Artillery simulan hasta 20 rps sostenidos para verificar que los tiempos de respuesta permanecen aceptables (p95 < 500ms) bajo carga normal. |
| 7 | **Estres** | 30 | Sistema | Complementa las pruebas de carga llevando el sistema al limite (hasta 500 rps, spikes de 200 rps, tests de endurance de 5 min) para identificar el punto de quiebre, verificar la recuperacion, y detectar fugas de memoria o agotamiento del pool de conexiones. |
| 8 | **Humo** | 45 | Aceptacion | Antes de ejecutar pruebas mas profundas, las pruebas de humo verifican que el sistema esta "vivo": health check, formato de errores JSON, endpoints expuestos, CORS, rate limiting, y proteccion de rutas. Son el guardabarrera minimo. |
| 9 | **Aceptacion** | 45 | Aceptacion | Escritas en formato BDD/Gherkin con jest-cucumber, validan los flujos de negocio desde la perspectiva del usuario: registro, login, OKRs, vacantes, sesiones, notificaciones, IA, dashboard. Responden la pregunta: "el sistema cumple lo que el negocio necesita?" |

### 6.3 Tipo complementario: Regresion

Las pruebas de regresion no son un tipo independiente, sino una **estrategia de ejecucion** implementada a traves del pipeline CI/CD. Cada Pull Request a `main` dispara la ejecucion de 475 tests (7 tipos automatizados + lint/typecheck) en paralelo, garantizando que ningun cambio nuevo rompa funcionalidad existente.

---

## 7. Tecnicas de Diseno de Pruebas

### 7.1 Tecnicas de Caja Negra

| Tecnica | Donde se aplica | Ejemplo |
|---------|-----------------|---------|
| **Particion de equivalencia** | Schemas unitarios (auth, OKR, session, vacancy, profile) | `registerSchema`: email valido vs invalido vs vacio vs tipo incorrecto |
| **Valores limite** | Schemas unitarios | Password: 7 chars (invalido), 8 chars (minimo valido), 100 chars (valido), 101 chars (invalido) |
| **Tabla de decision** | Autorizacion por roles | Combinaciones de {Padawan, Jedi, Admin} x {crear vacante, completar OKR, ver riesgo} |
| **Transicion de estados** | OKRs, Sesiones | OKR: Pendiente → EnProgreso → Completado; Sesion: Programada → Realizada / Cancelada |

### 7.2 Tecnicas de Caja Blanca

| Tecnica | Donde se aplica | Ejemplo |
|---------|-----------------|---------|
| **Cobertura de sentencias** | Middleware auth, error, validate (unit tests con mocks) | authMiddleware: token valido, token invalido, token expirado, sin header, header malformado |
| **Cobertura de ramas** | errorMiddleware (12 tests) | Bifurcaciones por tipo de error: HttpError, ZodError, Error generico; modo produccion vs desarrollo |
| **Cobertura de caminos** | Transacciones ACID (integracion) | completeOKR: camino exitoso (COMMIT), camino con fallo (ROLLBACK), verificacion de estado post-transaccion |

### 7.3 Tecnicas Basadas en Riesgo

| Riesgo identificado | Impacto | Probabilidad | Tests asociados |
|---------------------|---------|--------------|-----------------|
| SQL injection en login | Critico | Media | SEC-01, SEC-02, SEC-03 |
| Escalamiento de privilegios via JWT | Critico | Baja | SEC-06, SEC-07, SEC-08, SEC-09 |
| Corrupcion de datos en transacciones | Alto | Media | INT-OKR-05 (ROLLBACK), INT-OKR-06 (score) |
| Mass assignment en endpoints | Alto | Media | SEC-15 |
| Denegacion de servicio | Alto | Media | SEC-14, STRESS-01 a 15 |
| Acceso a datos de otros usuarios | Critico | Media | INT-OKR-03, INT-IA-04, INT-VAC-02 |

### 7.4 Tecnicas Basadas en Experiencia

| Tecnica | Donde se aplica |
|---------|-----------------|
| **Error guessing** | Payloads malformados (SEC-13 a 15), strings de 1MB, objetos vacios, campos extra |
| **Exploratory testing** | Los tests de humo (SMOKE-01 a 15) se disenaron explorando las rutas mas criticas del sistema |

---

## 8. Criterios de Entrada y Salida

### 8.1 Criterios de Entrada (precondiciones para iniciar testing)

| Criterio | Verificacion |
|----------|--------------|
| Codigo fuente compilado sin errores TypeScript | `npx tsc --noEmit` pasa (job `lint` en CI) |
| Base de datos de test accesible | PostgreSQL levantado con migraciones aplicadas |
| Variables de entorno configuradas | `.env.test` con DATABASE_URL, JWT_SECRET, NODE_ENV=test |
| Dependencias instaladas | `npm ci` exitoso para backend y frontend |
| Datos de prueba cargados | `test_data.sql` ejecutado (seeds) |

### 8.2 Criterios de Salida (condiciones para considerar el testing completo)

| Criterio | Umbral | Estado |
|----------|--------|--------|
| Todos los tests unitarios pasan | 160/160 (100%) | Obligatorio para merge |
| Todos los tests de integracion pasan | 36/36 (100%) | Obligatorio para merge |
| Todos los tests de componente pasan | 15/15 (100%) | Obligatorio para merge |
| Todos los tests de seguridad pasan | 15/15 (100%) | Obligatorio para merge |
| Tests E2E pasan | >= 13/15 (87%) | Deseable, no bloquea merge |
| Tests de carga: latencia p95 | < 500ms | Deseable |
| Tests de estres: sin crash del servidor | 0 crashes | Deseable |
| Defectos criticos abiertos | 0 | Obligatorio |
| Defectos mayores abiertos | <= 2 | Deseable |
| Cobertura de codigo (unitarias) | >= 70% | Deseable |

### 8.3 Criterios de Suspension

El testing se suspende si:
- La base de datos no esta accesible (mas de 3 reintentos fallidos)
- El backend no compila (`tsc --noEmit` falla)
- Mas del 50% de los tests de humo fallan (indica problema de infraestructura, no de logica)

---

## 9. Entorno de Pruebas

### 9.1 Entorno Local (desarrollo)

| Componente | Especificacion |
|------------|---------------|
| **Sistema operativo** | Windows 10/11, Ubuntu 22.04 (CI) |
| **Runtime** | Node.js 20 LTS |
| **Base de datos** | PostgreSQL 16 Alpine (Docker) |
| **Contenedores** | Docker Desktop + Docker Compose |
| **Navegador (E2E)** | Chromium (via Playwright) |

### 9.2 Entorno CI (GitHub Actions)

| Componente | Especificacion |
|------------|---------------|
| **Runner** | ubuntu-latest |
| **Node.js** | v20 (setup-node con cache npm) |
| **PostgreSQL** | postgres:16-alpine (servicio Docker) |
| **Playwright** | Chromium headless (instalado via npx) |
| **Concurrencia** | 8 jobs en paralelo, cancelacion de ejecuciones previas |

### 9.3 Datos de Prueba

| Dataset | Ubicacion | Contenido |
|---------|-----------|-----------|
| Migraciones | `backend/src/db/migrations/001-004` | Esquema completo (20+ tablas) |
| Seeds | `backend/src/db/seeds/test_data.sql` | Usuarios demo, empresas, vacantes, sesiones, OKRs, classroom, chat |
| Datos dinamicos | `beforeAll` en cada test | Cada suite crea sus propios datos y los limpia en `afterAll` |

---

## 10. Entregables de Prueba

### 10.1 Documentos de Planificacion

| Documento | Descripcion | Ubicacion |
|-----------|-------------|-----------|
| Plan de Pruebas | Este documento | `docs/plan_de_pruebas_nexus.md` |
| Indice de Pruebas | Inventario de las 475 pruebas con IDs | `TAREA PRUEBAS/indice_pruebas.md` |

### 10.2 Documentos de Diseno

| Documento | Descripcion | Ubicacion |
|-----------|-------------|-----------|
| Pruebas Unitarias | 160 tests con IDs UNIT-* | `TAREA PRUEBAS/pruebas_unitarias.md` |
| Pruebas de Integracion | 45 tests con IDs INT-* | `TAREA PRUEBAS/pruebas_integracion.md` |
| Pruebas de Componente | 45 tests con IDs COMP-* | `TAREA PRUEBAS/pruebas_componente.md` |
| Pruebas E2E | 30 tests con IDs E2E-* | `TAREA PRUEBAS/pruebas_e2e.md` |
| Pruebas de Seguridad | 45 tests con IDs SEC-* | `TAREA PRUEBAS/pruebas_seguridad.md` |
| Pruebas de Carga | 30 tests con IDs LOAD-* | `TAREA PRUEBAS/pruebas_carga.md` |
| Pruebas de Estres | 30 tests con IDs STRESS-* | `TAREA PRUEBAS/pruebas_estres.md` |
| Pruebas de Humo | 45 tests SMOKE-* | `TAREA PRUEBAS/pruebas_humo.md` |
| Pruebas de Aceptacion | 45 escenarios BDD UAT-* | `TAREA PRUEBAS/pruebas_aceptacion.md` |
| Pruebas de Regresion | Documentacion del pipeline CI/CD | `TAREA PRUEBAS/pruebas_regresion.md` |

### 10.3 Documentos de Arquitectura

| Documento | Ubicacion |
|-----------|-----------|
| Arquitectura MVC | `TAREA PRUEBAS/MVC_ARQUITECTURA.md` |
| Diagrama C4 | `TAREA PRUEBAS/Arquitectura_Nexus_C4.png` |
| Componentes Backend | `TAREA PRUEBAS/Nexus_Componentes_Backend.png` |
| Componentes Frontend | `TAREA PRUEBAS/Nexus_Componentes_Frontend.png` |
| Contenedores | `TAREA PRUEBAS/Nexus_Contenedores.png` |
| Despliegue | `TAREA PRUEBAS/Nexus_Despliegue.png` |
| Secuencia OKR | `TAREA PRUEBAS/Nexus_Secuencia_CompletarOKR.png` |

### 10.4 Artefactos de Ejecucion

| Artefacto | Descripcion |
|-----------|-------------|
| `backend/test_output.txt` | Salida de ejecucion de Jest (integracion) |
| `backend/load-report.json` | Reporte JSON de Artillery (carga) |
| `pruebas.html` | Reporte visual con diagramas Mermaid |
| GitHub Actions Summary | Tabla consolidada de 8 jobs con veredicto |

---

## 11. Automatizacion y Pipeline CI/CD

### 11.1 Herramientas de Automatizacion

| Herramienta | Proposito | Tipo de prueba |
|-------------|-----------|----------------|
| **Jest** | Runner de tests backend | Unitarias, integracion, seguridad, humo, aceptacion |
| **ts-jest** | Transformador TypeScript para Jest | Unitarias |
| **Supertest** | HTTP assertions contra Express | Integracion, seguridad, humo, aceptacion |
| **Vitest** | Runner de tests frontend | Componente UI |
| **React Testing Library** | Renderizado de componentes React | Componente UI |
| **Playwright** | Automatizacion de navegador | E2E |
| **Artillery** | Load/stress testing con YAML | Carga, estres |
| **jest-cucumber** | Formato BDD/Gherkin en Jest | Aceptacion |
| **GitHub Actions** | CI/CD y regresion automatizada | Todos (pipeline) |

### 11.2 Arquitectura del Pipeline

```
Pull Request a main
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                8 JOBS EN PARALELO                       │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Unitarias (160) │  │ Integracion (36)│              │
│  │ Jest + mocks    │  │ Jest + Supertest│              │
│  │ Sin DB          │  │ + PostgreSQL 16 │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Componente (15) │  │ Seguridad (15)  │              │
│  │ Vitest + RTL    │  │ Jest + OWASP    │              │
│  │ Sin DB          │  │ Sin DB          │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ E2E (15)        │  │ Carga (15)      │              │
│  │ Playwright      │  │ Artillery       │              │
│  │ Full stack      │  │ + PostgreSQL    │              │
│  └─────────────────┘  └─────────────────┘              │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐              │
│  │ Estres (15)     │  │ Lint & Types    │              │
│  │ Artillery       │  │ tsc + ESLint    │              │
│  │ + PostgreSQL    │  │ Sin DB          │              │
│  └─────────────────┘  └─────────────────┘              │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │  Resumen de Regresion │
                 │  475 tests evaluados  │
                 │  Veredicto: SI/NO     │
                 └──────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              ▼                            ▼
     ✅ Sin Regresion              ❌ Regresion Detectada
     PR listo para merge           PR bloqueado
```

### 11.3 Politica de Bloqueo

| Job | Bloquea merge si falla |
|-----|------------------------|
| unit-tests | **Si** |
| integration-tests | **Si** |
| component-tests | **Si** |
| security-tests | **Si** |
| e2e-tests | No (depende de infraestructura CI) |
| load-tests | No (metricas varian en CI vs local) |
| stress-tests | No (hardware de CI es limitado) |
| lint | No (permite `|| true` en ESLint) |

### 11.4 Comandos de Ejecucion

```bash
# Pruebas unitarias (sin DB)
cd backend && npm run test:unit

# Pruebas de integracion (requiere PostgreSQL)
cd backend && npm test

# Pruebas de componente (sin DB)
cd frontend && npm test

# Pruebas de seguridad (sin DB)
cd backend && npm run test:security

# Pruebas de humo (sin DB)
cd backend && npm run test:smoke

# Pruebas de aceptacion (requiere DB)
cd backend && npm run test:acceptance

# Pruebas E2E (requiere frontend + backend + DB)
cd frontend && npm run test:e2e
cd frontend && npx playwright test --headed  # Con navegador visible

# Pruebas de carga (requiere backend corriendo)
cd backend && npm run test:load

# Pruebas de estres (requiere backend corriendo)
cd backend && npm run test:stress

# Unitarias con cobertura
cd backend && npm run test:unit -- --coverage
```

---

## 12. Analisis de Riesgos del Proyecto de Pruebas

Riesgos asociados al **proceso de testing**, no al producto:

| ID | Riesgo | Probabilidad | Impacto | Mitigacion |
|----|--------|--------------|---------|------------|
| RP-01 | PostgreSQL no disponible en CI | Baja | Alto | Docker service con healthcheck y reintentos. Tests unitarios y de seguridad no requieren DB. |
| RP-02 | Tests E2E fragiles (flaky tests) | Media | Medio | Playwright con reintentos, screenshots en fallo, trace on-first-retry |
| RP-03 | Pruebas de carga/estres con resultados inconsistentes en CI | Alta | Bajo | No bloquean merge. Se interpretan en comparacion con baseline local. |
| RP-04 | Contention del pool de PostgreSQL entre tests | Media | Medio | `maxWorkers: 1` en Jest para ejecucion serial. Cada suite limpia sus datos en `afterAll`. |
| RP-05 | Tiempo de ejecucion del pipeline excesivo | Baja | Bajo | 8 jobs paralelos. Concurrencia con cancelacion de ejecuciones previas. |
| RP-06 | Falta de tiempo para completar todos los tipos de prueba | Media | Alto | Priorizacion por riesgo: primero unitarias + integracion + seguridad, luego carga/E2E/aceptacion. |

---

## 13. Analisis de Riesgos del Producto

Riesgos asociados al **sistema NEXUS** que las pruebas buscan mitigar:

| ID | Riesgo | Severidad | Tests que lo mitigan | Cobertura |
|----|--------|-----------|----------------------|-----------|
| RR-01 | Bypass de autenticacion | Critica | SEC-06 a SEC-10, INT-AUTH-07, SMOKE-* | Alta |
| RR-02 | Inyeccion SQL | Critica | SEC-01 a SEC-03 | Alta |
| RR-03 | Escalamiento de privilegios (rol) | Critica | INT-OKR-03, INT-IA-04, INT-VAC-02, SEC-09, SEC-15 | Alta |
| RR-04 | Corrupcion de datos por transaccion incompleta | Alta | INT-OKR-05 (ROLLBACK), INT-OKR-06 (score) | Alta |
| RR-05 | XSS en respuestas de la API | Alta | SEC-04, SEC-05 | Media |
| RR-06 | Denegacion de servicio (DoS) | Alta | SEC-14, STRESS-01 a STRESS-15 | Alta |
| RR-07 | Fuga de informacion en errores | Media | SEC-11 | Alta |
| RR-08 | Acceso a datos de otros usuarios | Critica | INT-OKR-03, E2E-11 a E2E-13 | Alta |
| RR-09 | Degradacion de rendimiento bajo carga | Media | LOAD-01 a LOAD-15 | Alta |
| RR-10 | Agotamiento del pool de conexiones DB | Alta | STRESS-04 a STRESS-06 | Media |

---

## 14. Metricas de Calidad

### 14.1 Metricas Definidas

| Metrica | Formula | Objetivo |
|---------|---------|----------|
| **Tasa de aprobacion** | (Tests pasados / Total tests) x 100 | >= 95% |
| **Cobertura de codigo** | Lineas cubiertas / Total lineas | >= 70% (unitarias) |
| **Densidad de defectos** | Defectos encontrados / KLOC | Referencia |
| **Efectividad de deteccion** | Defectos encontrados en test / Total defectos | >= 80% |
| **Latencia p95** | Percentil 95 de tiempos de respuesta | < 500ms (carga) |
| **Latencia p99** | Percentil 99 de tiempos de respuesta | < 1000ms (carga) |
| **Throughput** | Requests exitosos por segundo | Referencia |
| **Error rate** | Requests fallidos / Total requests | < 1% (carga) |
| **Cobertura OWASP** | Categorias OWASP cubiertas / 10 | >= 5/10 |
| **Tiempo de regresion** | Tiempo del pipeline CI/CD completo | < 5 min |

### 14.2 Metricas de Cobertura Funcional

| Modulo | Endpoints totales | Endpoints con tests | Cobertura |
|--------|-------------------|---------------------|-----------|
| Auth | 3 | 3 | 100% |
| OKRs | 5 | 1 (complete) | 20% |
| Sesiones | 4 | 4 | 100% |
| IA | 2 | 2 | 100% |
| Notificaciones | 4 | 4 | 100% |
| Vacantes | 6 | 6 | 100% |
| Perfiles | 4 | 0 (cubierto en unitarias) | Parcial |
| Matching | 3 | 0 | 0% |
| Onboarding | 4 | 0 | 0% |
| Aula Virtual | 7 | 0 | 0% |

---

## 15. Cronograma de Actividades

| Fase | Actividad | Periodo | Entregable |
|------|-----------|---------|------------|
| **Planificacion** | Definicion de estrategia, seleccion de herramientas, analisis de riesgos | Semana 1-2 (Mayo) | Plan de pruebas (este documento) |
| **Analisis** | Identificacion de condiciones de prueba, priorizacion por riesgo | Semana 3-4 (Mayo) | Indice de pruebas, condiciones de prueba |
| **Diseno** | Diseno de casos de prueba (caja negra, caja blanca, basada en riesgo) | Semana 5-6 (Junio) | Documentos de prueba por tipo (10 archivos) |
| **Implementacion** | Codificacion de los 475 tests, configuracion de CI/CD | Semana 5-8 (Junio) | Archivos de test, ci.yml, Artillery YAMLs |
| **Ejecucion** | Ejecucion de tests, registro de defectos, re-tests | Semana 7-10 (Junio-Julio) | Reportes de ejecucion, reporte de defectos |
| **Completitud** | Evaluacion de criterios de salida, metricas, reporte final | Semana 11-12 (Julio) | Metricas de calidad, conclusiones |
| **Presentacion** | Preparacion y ensayo de demo, exposicion | Semana 15 | Demo en vivo, presentacion |

---

## 16. Responsabilidades

| Rol | Responsabilidad |
|-----|-----------------|
| **Test Lead** | Definicion de estrategia, plan de pruebas, coordinacion del equipo, reporte de metricas |
| **Tester Backend** | Diseno e implementacion de tests unitarios, integracion, seguridad, humo, aceptacion |
| **Tester Frontend** | Diseno e implementacion de tests de componente y E2E |
| **Tester de Rendimiento** | Diseno e implementacion de tests de carga y estres con Artillery |
| **DevOps** | Configuracion del pipeline CI/CD, Docker, GitHub Actions |

Todos los integrantes del equipo participan en la exposicion y estan en capacidad de responder preguntas sobre cualquier seccion del proyecto.

---

## 17. Referencias Normativas

| Estandar | Descripcion | Aplicacion en NEXUS |
|----------|-------------|---------------------|
| **ISTQB CTFL v4.0** | Certified Tester Foundation Level -- Proceso fundamental de pruebas | Estructura del proceso de testing (seccion 5.1), principios (seccion 5.3), niveles y tipos (seccion 6) |
| **ISO/IEC 29119-1:2022** | Conceptos y definiciones de testing | Terminologia y definiciones usadas en este documento |
| **ISO/IEC 29119-2:2021** | Procesos de prueba | Proceso fundamental aplicado (planificacion, analisis, diseno, implementacion, ejecucion, completitud) |
| **ISO/IEC 29119-3:2021** | Documentacion de pruebas | Estructura de este plan de pruebas (seccion 5.2) |
| **ISO/IEC 29119-4:2021** | Tecnicas de prueba | Tecnicas de caja negra y caja blanca aplicadas (seccion 7) |
| **IEEE 829** | Estandar de documentacion de pruebas | Formato de casos de prueba (IDs, entradas, resultados esperados) |
| **OWASP Top 10:2021** | Riesgos de seguridad en aplicaciones web | Cobertura de A01, A03, A04, A05, A07 en tests de seguridad |
| **OWASP Testing Guide v4** | Guia de pruebas de seguridad | Vectores de ataque usados en SEC-01 a SEC-15 |

---

## Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Test Lead | | | |
| Desarrollador principal | | | |
| Docente responsable | | | |

---

*Documento elaborado siguiendo el proceso fundamental de pruebas de ISTQB y la estructura de ISO/IEC 29119-3:2021.*
