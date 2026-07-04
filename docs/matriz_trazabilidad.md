# Matriz de Trazabilidad de Requisitos (RTM) -- NEXUS

**Identificador del documento:** NEXUS-RTM-001
**Fecha de elaboracion:** Julio 2026
**Estandar:** IEEE 829 / ISO 29119-3

## 1. Proposito
La Matriz de Trazabilidad de Requisitos (RTM) asegura que todos los requisitos de negocio (RN) y casos de uso (UC) definidos para la plataforma NEXUS esten cubiertos por al menos un caso de prueba, garantizando asi la completitud del testing y previniendo la liberacion de software con funcionalidad descubierta.

---

## 2. Mapeo de Requerimientos de Negocio (Business Rules)

Estas son las reglas criticas del core del sistema (principalmente OKRs y Seguridad), las cuales tienen impacto directo en las transacciones ACID y scores de empleabilidad.

| ID Requisito | Descripcion del Requisito | Tipo de Prueba | ID Caso de Prueba Asociado | Estado de Cobertura |
|--------------|---------------------------|----------------|-----------------------------|---------------------|
| **RN-01** | Solo el propietario del OKR puede modificarlo o completarlo. | Integracion | INT-OKR-03 | ✅ Cubierto (100%) |
| **RN-02** | Un OKR solo puede completarse si su estado previo es "EnProgreso". | Integracion | INT-OKR-04 | ✅ Cubierto (100%) |
| **RN-03** | Al completar, el `valor_actual` debe ser mayor o igual al `valor_meta`. | Integracion | INT-OKR-05 | ✅ Cubierto (100%) |
| **RN-04** | La transaccion de completar un OKR debe registrar un historial de auditoria. | Integracion | INT-OKR-01 | ✅ Cubierto (100%) |
| **RN-05** | Completar un OKR debe incrementar transaccionalmente el score de empleabilidad del Padawan. | Integracion | INT-OKR-07 | ✅ Cubierto (100%) |
| **RN-06** | Si falla el guardado del historial (SQL), la transaccion ACID debe hacer ROLLBACK completo. | Integracion | INT-OKR-06 | ✅ Cubierto (100%) |
| **RN-07** | Solo los administradores pueden crear o modificar vacantes de empleo. | Integracion | INT-VAC-02, INT-VAC-05 | ✅ Cubierto (100%) |
| **RN-08** | El sistema debe rechazar payloads malformados en rutas publicas. | Seguridad | SEC-13, SEC-15 | ✅ Cubierto (100%) |

---

## 3. Mapeo de Casos de Uso (Funcionalidad)

| ID CU | Modulo | Descripcion del Caso de Uso | Tipos de Prueba | IDs de Casos de Prueba | Cobertura |
|-------|--------|-----------------------------|-----------------|------------------------|-----------|
| **UC-01** | Autenticacion | Registro de nuevo usuario | Unitaria, E2E | UNIT-AUTH-01, E2E-01 | ✅ Cubierto |
| **UC-02** | Autenticacion | Iniciar sesion y obtener JWT | Integracion, E2E | INT-AUTH-04, E2E-02 | ✅ Cubierto |
| **UC-04** | Perfiles | Gestionar habilidades (Skills) | Unitaria | UNIT-PROF-02 | ✅ Cubierto |
| **UC-05** | Perfiles | Actualizar informacion publica | Unitaria | UNIT-PROF-01 | ✅ Cubierto |
| **UC-12** | Sesiones | Programar nueva sesion de mentoria | Integracion | INT-SES-01, INT-SES-02 | ✅ Cubierto |
| **UC-13** | Sesiones | Marcar sesion como realizada con notas | Integracion | INT-SES-03 | ✅ Cubierto |
| **UC-14** | Sesiones | Cancelar una sesion programada | Integracion | INT-SES-04 | ✅ Cubierto |
| **UC-15** | Sesiones | Ver mi historial de sesiones | Integracion | INT-SES-05 | ✅ Cubierto |
| **UC-21** | Vacantes | Publicar nueva vacante | Integracion, UI | INT-VAC-01, COMP-VAC-01| ✅ Cubierto |
| **UC-22** | Vacantes | Buscar y filtrar vacantes activas | Integracion, E2E | INT-VAC-03, E2E-12 | ✅ Cubierto |
| **UC-23** | Vacantes | Postularse a una vacante (Padawan) | Integracion | INT-VAC-06, INT-VAC-07 | ✅ Cubierto |
| **UC-24** | Vacantes | Actualizar / Desactivar vacante | Integracion | INT-VAC-08, INT-VAC-09 | ✅ Cubierto |
| **UC-25** | IA | Obtener score de riesgo de abandono | Integracion | INT-IA-01, INT-IA-03 | ✅ Cubierto |
| **UC-26** | Notificaciones | Listar y marcar notificaciones como leidas | Integracion | INT-NOT-01, INT-NOT-03 | ✅ Cubierto |

---

## 4. Requisitos No Funcionales (NFR)

| ID NFR | Atributo de Calidad | Descripcion | Tipo de Prueba | IDs Asociados | Estado |
|--------|---------------------|-------------|----------------|---------------|--------|
| **NFR-SEC-01** | Seguridad | Prevencion contra inyeccion SQL en inputs. | Seguridad | SEC-01 a SEC-03 | ✅ Cubierto |
| **NFR-SEC-02** | Seguridad | Proteccion contra Cross-Site Scripting (XSS). | Seguridad | SEC-04, SEC-05 | ✅ Cubierto |
| **NFR-SEC-03** | Seguridad | Los tokens JWT no deben permitir escalamiento de rol. | Seguridad | SEC-09 | ✅ Cubierto |
| **NFR-PERF-01**| Rendimiento | El p95 de latencia en carga normal (20 rps) debe ser < 500ms. | Carga | LOAD-01 a LOAD-15 | ✅ Cubierto |
| **NFR-PERF-02**| Rendimiento | El sistema no debe crashear bajo estres extremo (500 rps). | Estres | STRESS-01 a STRESS-15| ✅ Cubierto |
| **NFR-UI-01**  | Usabilidad  | La pantalla de Login debe validar inputs en tiempo real. | Componente | COMP-AUTH-03 | ✅ Cubierto |

---

## 5. Resumen de Cobertura

- **Total Requerimientos de Negocio (RN):** 8
- **Total Casos de Uso Principales (UC):** 14
- **Total Requerimientos No Funcionales (NFR):** 6
- **Porcentaje de Cobertura de Requerimientos Prioritarios:** **100%**

> **Nota:** La cobertura se calculo cruzando los requerimientos funcionales documentados contra los 475 casos de prueba reales implementados en el pipeline de GitHub Actions y los repositorios locales.
