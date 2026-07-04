# Indice de Pruebas -- NEXUS

---

## Resumen Ejecutivo

| Tipo de prueba | Cantidad | Estado | Documentacion |
|---|---|---|---|
| **Integracion** | 36 | Existentes, documentadas | [`pruebas_integracion.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_integracion.md) |
| **Unitarias** | 160 | Implementadas, documentadas | [`pruebas_unitarias.md`](file:///c:/Users/USUARIO/Desktop/Nexus/TAREA%20PRUEBAS/pruebas_unitarias.md) |
| Componente (UI) | 3 | Existentes, sin doc nueva | -- |
| E2E | 0 | Pendiente | -- |
| Carga | 0 | Pendiente | -- |
| Estres | 0 | Pendiente | -- |
| Seguridad | Parcial | Pendiente | -- |
| Humo | 0 | Pendiente | -- |
| Aceptacion | 0 | Pendiente | -- |
| **Total** | **199** | | |

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

## Comandos de Ejecucion

```bash
# Ejecutar pruebas de integracion (requiere PostgreSQL corriendo)
npm test

# Ejecutar pruebas unitarias (no requiere DB)
npm run test:unit

# Ejecutar unitarias con cobertura
npm run test:unit -- --coverage

# Ejecutar un archivo de prueba especifico
npm run test:unit -- --testPathPattern=auth.schema
npm test -- --testPathPattern=auth.test
```

---

## Piramide de Testing Actual

```
          /\
         /  \
        / 0  \          E2E (pendiente)
       /------\
      /   36   \         Integracion (documentadas)
     /----------\
    /    160     \       Unitarias (nuevas)
   /______________\
```

La piramide esta ahora mejor balanceada con 160 pruebas unitarias como base, 36 de integracion como capa intermedia, y E2E pendiente.

---

## Tipos de Prueba Pendientes

| Tipo | Prioridad | Herramienta sugerida | Notas |
|---|---|---|---|
| E2E | Alta | Playwright o Cypress | Flujos completos en navegador |
| Carga | Media | k6 | Rendimiento bajo carga esperada |
| Estres | Media | k6 | Punto de quiebre del sistema |
| Seguridad | Alta | OWASP ZAP | Inyeccion SQL, XSS, CSRF |
| Humo | Baja | Jest | Subset critico de integracion |
| Aceptacion | Baja | Manual / Cucumber | Validacion con usuario final |

---

## Referencia Adicional

- **Analisis completo de tipos de prueba:** [`tipos_de_pruebas_nexus.md`](file:///c:/Users/USUARIO/Desktop/Nexus/tipos_de_pruebas_nexus.md)
- **CI/CD pipeline:** [`.github/workflows/ci.yml`](file:///c:/Users/USUARIO/Desktop/Nexus/.github/workflows/ci.yml)
