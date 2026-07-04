# Indice de Pruebas -- NEXUS

---

## Resumen Ejecutivo

| Tipo de prueba | Cantidad | Estado | Documentacion |
|---|---|---|---|
| **Integracion** | 36 | Existentes, documentadas | [`pruebas_integracion.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_integracion.md) |
| **Unitarias** | 160 | Implementadas, documentadas | [`pruebas_unitarias.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_unitarias.md) |
| **Componente (UI)** | 15 | Implementadas, documentadas | [`pruebas_componente.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_componente.md) |
| **Carga** | 15 | Implementadas, documentadas | [`pruebas_carga.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_carga.md) |
| E2E | 0 | Pendiente | -- |
| Estres | 0 | Pendiente | -- |
| Seguridad | Parcial | Pendiente | -- |
| Humo | 0 | Pendiente | -- |
| Aceptacion | 0 | Pendiente | -- |
| **Total** | **226** | | |

---

## Documentos de Prueba

### 1. Pruebas de Integracion

- **Archivo:** [`pruebas_integracion.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_integracion.md)
- **Total:** 36 pruebas
- **Tecnologia:** Jest + Supertest + PostgreSQL real
- **Estado:** Ya existian en el proyecto. Documentadas con IDs, descripciones, capas involucradas y reglas de negocio.

| Modulo | Archivo de test | Tests | IDs |
|---|---|---|---|
| Autenticacion | `auth.test.ts` | 7 | INT-AUTH-01 a INT-AUTH-07 |
| OKRs | `okr.test.ts` | 6 | INT-OKR-01 a INT-OKR-06 |
| Sesiones | `sessions.test.ts` | 5 | INT-SES-01 a INT-SES-05 |
| IA | `ia.test.ts` | 4 | INT-IA-01 a INT-IA-04 |
| Notificaciones | `notifications.test.ts` | 5 | INT-NOTIF-01 a INT-NOTIF-05 |
| Vacantes | `vacancies.test.ts` | 9 | INT-VAC-01 a INT-VAC-09 |

---

### 2. Pruebas Unitarias

- **Archivo:** [`pruebas_unitarias.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_unitarias.md)
- **Total:** 160 pruebas
- **Tecnologia:** Jest + ts-jest + mocks (sin DB, sin HTTP)
- **Estado:** Implementadas y listas para usar.

| Categoria | Archivo de test | Tests | IDs |
|---|---|---|---|
| Schema Auth | `auth.schema.unit.test.ts` | 23 | UNIT-AUTH-SCH-01 a 23 |
| Schema OKR | `okr.schema.unit.test.ts` | 29 | UNIT-OKR-SCH-01 a 29 |
| Schema Session | `session.schema.unit.test.ts` | 21 | UNIT-SES-SCH-01 a 21 |
| Schema Vacancy | `vacancy.schema.unit.test.ts` | 18 | UNIT-VAC-SCH-01 a 18 |
| Schema Profile | `profile.schema.unit.test.ts` | 20 | UNIT-PROF-SCH-01 a 20 |
| MW Auth | `auth.middleware.unit.test.ts` | 14 | UNIT-MW-AUTH-01 a 08, UNIT-MW-ROLE-01 a 06 |
| MW Error | `error.middleware.unit.test.ts` | 12 | UNIT-ERR-01 a 12 |
| MW Validate | `validate.middleware.unit.test.ts` | 8 | UNIT-MW-VAL-01 a 08 |
| Types | `types.unit.test.ts` | 15 | UNIT-TYPE-01 a 15 |

---

### 3. Pruebas de Componente (UI)

- **Archivo:** [`pruebas_componente.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_componente.md)
- **Total:** 15 pruebas
- **Tecnologia:** Vitest + React Testing Library + jsdom (sin navegador real)
- **Estado:** Implementadas (expandidas de 3 a 15) y documentadas.

| Categoria | Tests | IDs |
|---|---|---|
| Renderizado de estructura | 5 | COMP-LOGIN-01 a 05 |
| Atributos y tipos de input | 3 | COMP-LOGIN-06 a 08 |
| Boton submit | 2 | COMP-LOGIN-09 a 10 |
| Validacion del formulario | 2 | COMP-LOGIN-11 a 12 |
| Interaccion con login | 3 | COMP-LOGIN-13 a 15 |

---

### 4. Pruebas de Carga

- **Archivo:** [`pruebas_carga.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_carga.md)
- **Total:** 15 pruebas
- **Tecnologia:** Artillery (npm) -- requiere backend corriendo
- **Estado:** Implementadas y documentadas. Requieren usuario de test y backend activo.

| Modulo | Archivo YAML | Tests | IDs |
|---|---|---|---|
| Auth | `load-auth.yml` | 3 | LOAD-01 a 03 |
| Sesiones | `load-sessions.yml` | 3 | LOAD-04 a 06 |
| Vacantes | `load-vacancies.yml` | 3 | LOAD-07 a 09 |
| Notificaciones + IA | `load-notifications-ia.yml` | 4 | LOAD-10 a 13 |
| Mixto | `load-mixed.yml` | 2 | LOAD-14 a 15 |

---

## Comandos de Ejecucion

```bash
# Ejecutar pruebas de integracion (requiere PostgreSQL corriendo)
cd backend && npm test

# Ejecutar pruebas unitarias (no requiere DB)
cd backend && npm run test:unit

# Ejecutar pruebas de componente (frontend, no requiere DB)
cd frontend && npm test

# Ejecutar pruebas de carga (requiere backend corriendo en localhost:3000)
cd backend && npm run test:load              # Flujos mixtos
cd backend && npm run test:load:auth         # Solo auth
cd backend && npm run test:load:sessions     # Solo sesiones
cd backend && npm run test:load:vacancies    # Solo vacantes
cd backend && npm run test:load:notifications # Notificaciones + IA

# Ejecutar unitarias con cobertura
cd backend && npm run test:unit -- --coverage

# Ejecutar un archivo de prueba especifico
cd backend && npm run test:unit -- --testPathPattern=auth.schema
cd backend && npm test -- --testPathPattern=auth.test
```

---

## Piramide de Testing Actual

```
              /\
             /  \
            / 0  \              E2E (pendiente)
           /------\
          /  15    \             Carga (Artillery)
         /----------\
        /    15      \           Componente UI (LoginPage)
       /--------------\
      /      36        \         Integracion (API + DB)
     /------------------\
    /        160         \       Unitarias (schemas, middleware, types)
   /______________________\
```

Total: **226 pruebas** -- 160 unitarias + 36 integracion + 15 componente + 15 carga.

---

## Tipos de Prueba Pendientes

| Tipo | Prioridad | Herramienta sugerida | Notas |
|---|---|---|---|
| E2E | Alta | Playwright o Cypress | Flujos completos en navegador |

| Estres | Media | k6 | Punto de quiebre del sistema |
| Seguridad | Alta | OWASP ZAP | Inyeccion SQL, XSS, CSRF |
| Humo | Baja | Jest | Subset critico de integracion |
| Aceptacion | Baja | Manual / Cucumber | Validacion con usuario final |

---

## Referencia Adicional

- **Analisis completo de tipos de prueba:** [`tipos_de_pruebas_nexus.md`](file:///c:/Users/USUARIO/Desktop/Nexus/tipos_de_pruebas_nexus.md)
- **CI/CD pipeline:** [`.github/workflows/ci.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/.github/workflows/ci.yml)
