# Indice de Pruebas -- NEXUS

---

## Resumen Ejecutivo

| Tipo de prueba | Cantidad | Estado | Documentacion |
|---|---|---|---|
| **Integracion** | 36 | Existentes, documentadas | [`pruebas_integracion.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_integracion.md) |
| **Unitarias** | 160 | Implementadas, documentadas | [`pruebas_unitarias.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_unitarias.md) |
| **Componente (UI)** | 15 | Implementadas, documentadas | [`pruebas_componente.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_componente.md) |
| **Carga** | 15 | Implementadas, documentadas | [`pruebas_carga.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_carga.md) |
| **Estres** | 15 | Implementadas, documentadas | [`pruebas_estres.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_estres.md) |
| **E2E** | 15 | Implementadas, documentadas | [`pruebas_e2e.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_e2e.md) |
| **Seguridad** | 15 | Implementadas, documentadas | [`pruebas_seguridad.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_seguridad.md) |
| **Humo** | 15 | Implementadas, documentadas | [`pruebas_humo.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_humo.md) |
| **Aceptacion** | 15 | Implementadas, documentadas | [`pruebas_aceptacion.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_aceptacion.md) |
| **Total** | **301** | | |

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

### 5. Pruebas de Estres

- **Archivo:** [`pruebas_estres.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_estres.md)
- **Total:** 15 pruebas
- **Tecnologia:** Artillery (npm) -- patrones agresivos (hasta 500 req/s)
- **Estado:** Implementadas y documentadas.

| Categoria | Archivo YAML | Tests | IDs | Rate maximo |
|---|---|---|---|---|
| Autenticacion | `stress-auth.yml` | 3 | STRESS-01 a 03 | 200 rps |
| Pool DB | `stress-db.yml` | 3 | STRESS-04 a 06 | 150 rps |
| Spike | `stress-spike.yml` | 3 | STRESS-07 a 09 | 200 rps |
| Endurance | `stress-endurance.yml` | 3 | STRESS-10 a 12 | 15 rps x 5 min |
| Limites | `stress-limits.yml` | 3 | STRESS-13 a 15 | 500 rps |

---

### 6. Pruebas E2E

- **Archivo:** [`pruebas_e2e.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_e2e.md)
- **Total:** 15 pruebas
- **Tecnologia:** Playwright + Chromium (navegador real)
- **Estado:** Implementadas. Requieren frontend + backend + PostgreSQL corriendo.

| Flujo | Tests | IDs |
|---|---|---|
| Login | 4 | E2E-01 a 04 |
| Registro | 2 | E2E-05, 06 |
| Dashboard | 4 | E2E-07 a 10 |
| Proteccion de rutas | 3 | E2E-11 a 13 |
| Vacantes | 1 | E2E-14 |
| Logout | 1 | E2E-15 |

---

### 7. Pruebas de Seguridad

- **Archivo:** [`pruebas_seguridad.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_seguridad.md)
- **Total:** 15 pruebas
- **Tecnologia:** Jest + Supertest (no requiere DB)
- **Estado:** Implementadas, 15/15 pasando.

| Categoria OWASP | Tests | IDs |
|---|---|---|
| A03: Inyeccion SQL | 3 | SEC-01 a 03 |
| A07: XSS | 2 | SEC-04, 05 |
| A01: Control de acceso | 5 | SEC-06 a 10 |
| A05: Configuracion HTTP | 2 | SEC-11, 12 |
| A04: Payloads malformados | 3 | SEC-13 a 15 |

---

### 8. Pruebas de Humo (Smoke)

- **Archivo:** [`pruebas_humo.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_humo.md)
- **Total:** 15 pruebas
- **Tecnologia:** Jest + Supertest (sin DB requerida)
- **Estado:** Implementadas.

### 9. Pruebas de Aceptacion (UAT)

- **Archivo:** [`pruebas_aceptacion.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_aceptacion.md)
- **Total:** 15 pruebas (Escenarios BDD)
- **Tecnologia:** Jest-Cucumber + Supertest
- **Estado:** Implementadas.

---

## Comandos de Ejecucion

```bash
# Ejecutar pruebas de integracion (requiere PostgreSQL corriendo)
cd backend && npm test

# Ejecutar pruebas unitarias (no requiere DB)
cd backend && npm run test:unit

# Ejecutar pruebas de componente (frontend, no requiere DB)
cd frontend && npm test

# Ejecutar pruebas de humo (no requiere DB)
cd backend && npm run test:smoke

# Ejecutar pruebas de seguridad (no requiere DB)
cd backend && npm run test:security

# Ejecutar pruebas de aceptacion (requiere DB)
cd backend && npm run test:acceptance

# Ejecutar pruebas E2E (requiere frontend + backend + DB corriendo)
cd frontend && npm run test:e2e
cd frontend && npx playwright test --headed  # Con navegador visible

# Ejecutar pruebas de carga (requiere backend corriendo en localhost:3000)
cd backend && npm run test:load              # Flujos mixtos
cd backend && npm run test:load:auth         # Solo auth
cd backend && npm run test:load:sessions     # Solo sesiones
cd backend && npm run test:load:vacancies    # Solo vacantes
cd backend && npm run test:load:notifications # Notificaciones + IA

# Ejecutar pruebas de estres (requiere backend corriendo)
cd backend && npm run test:stress            # Limites del sistema
cd backend && npm run test:stress:auth       # Saturacion auth
cd backend && npm run test:stress:db         # Agotamiento pool DB
cd backend && npm run test:stress:spike      # Picos repentinos
cd backend && npm run test:stress:endurance  # Soak 5 min

# Ejecutar unitarias con cobertura
cd backend && npm run test:unit -- --coverage
```

---

## Piramide de Testing Actual

```
                   /\
                  /  \
                 / 15 \                   Aceptacion (UAT/BDD)
                /------\
               /  15    \                 E2E (Playwright)
              /----------\
             /    15      \               Seguridad (OWASP)
            /--------------\
           /      15        \             Humo (Smoke)
          /------------------\
         /        15          \           Estres (hasta 500 rps)
        /----------------------\
       /          15            \         Carga (hasta 20 rps)
      /--------------------------\
     /            15              \       Componente UI
    /------------------------------\
   /              36                \     Integracion (API + DB)
  /----------------------------------\
 /               160                  \   Unitarias
/______________________________________\
```

Total: **301 pruebas**

---

## Modulos Cubiertos

Todas las fases de pruebas cubren de manera exhaustiva:
- Autenticacion y Roles (JWT, Padawan, Jedi, Admin)
- Validacion Zod de esquemas de datos
- Gestion de OKRs (Flujo core)
- Sistema de Vacantes (Publicacion y postulacion)
- Sesiones de Mentoria
- Notificaciones
- Inteligencia Artificial (Analisis de riesgo)

---

## Referencia Adicional

- **Analisis completo de tipos de prueba:** [`tipos_de_pruebas_nexus.md`](file:///c:/Users/USUARIO/Desktop/Nexus/tipos_de_pruebas_nexus.md)
- **CI/CD pipeline:** [`.github/workflows/ci.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/.github/workflows/ci.yml)
