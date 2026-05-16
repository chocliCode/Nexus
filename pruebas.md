# 🧪 NEXUS — Tests Automatizados

## Proceso de Negocio: Completación de OKR

```mermaid
flowchart LR
    A[Padawan selecciona OKR] --> B[Ingresa valor + nota de cierre]
    B --> C[Envia solicitud PATCH /complete]
    C --> D{Validaciones OK?}
    D -->|No| E[Error 401/403/409/422]
    D -->|Si| F[Transaccion ACID]
    F --> G[OKR Completado +12 Score]
    G --> H[Notifica al Mentor]
```

---

## 14 Tests — 2 Suites — 100% Pasados ✅

### Suite 1: Autenticacion - auth.test.ts — 7 tests

```mermaid
flowchart TD
    subgraph REG[Registro]
        R1[Registra Padawan nuevo - 201]
        R2[Email duplicado - 409]
        R3[Datos invalidos - 400]
    end
    subgraph LOG[Login]
        L1[Credenciales validas - JWT 200]
        L2[Contrasena incorrecta - 401]
    end
    subgraph ME[Sesion]
        M1[GET /me con JWT - 200]
        M2[GET /me sin JWT - 401]
    end
```

---

### Suite 2: Completacion de OKR - okr.test.ts — 7 tests

```mermaid
flowchart TD
    subgraph HAPPY[Camino Feliz]
        T1[TEST 1 - Datos validos 200 - Estado Completado]
    end

    subgraph ERRORS[Validaciones de Negocio]
        T2[TEST 2 - Sin JWT 401 - AUTH_REQUIRED]
        T3[TEST 3 RN-01 - Otro usuario 403 - FORBIDDEN]
        T4[TEST 4 RN-02 - Estado Pendiente 409 - INVALID_STATE]
        T5[TEST 5 RN-03 - Valor menor a Meta 422 - META_NOT_REACHED]
    end

    subgraph ACID[Integridad Transaccional]
        T6[TEST 6 RN-06 - ROLLBACK si falla - No hay datos parciales]
        T7[TEST 7 RN-05 - Score +12 tras COMMIT - Empleabilidad sube]
    end
```

---

## Detalle Rapido por Test

| # | Test | Que valida | Input | HTTP | Regla |
|:-:|------|-----------|-------|:----:|:-----:|
| 1 | ✅ Completar OKR valido | Happy path completo | valor >= meta + nota | `200` | — |
| 2 | ✅ Sin autenticacion | Seguridad JWT | Sin token | `401` | Auth |
| 3 | ✅ OKR de otro usuario | Propiedad del recurso | JWT ajeno | `403` | RN-01 |
| 4 | ✅ Estado incorrecto | Maquina de estados | OKR en Pendiente | `409` | RN-02 |
| 5 | ✅ Meta no alcanzada | Logica de negocio | valor menor a meta | `422` | RN-03 |
| 6 | ✅ Rollback ACID | Integridad de datos | Fallo mid-transaccion | — | RN-06 |
| 7 | ✅ Score +12 | Efecto colateral | Post-COMMIT | `200` | RN-05 |

---

## Transaccion ACID — Lo que ocurre en el PATCH /complete

```mermaid
sequenceDiagram
    participant P as Padawan
    participant API as NEXUS API
    participant DB as PostgreSQL

    P->>API: PATCH /okrs/id/complete
    Note over API: Verifica JWT
    API->>DB: Es dueno del OKR? RN-01
    API->>DB: Estado = EnProgreso? RN-02
    API->>DB: valor >= meta? RN-03

    rect rgb(40, 80, 60)
        Note over API,DB: BEGIN TRANSACTION
        API->>DB: UPDATE okr - Completado
        API->>DB: INSERT okr_historial - auditoria
        API->>DB: UPDATE score +12
        Note over API,DB: COMMIT
    end

    API-->>P: 200 okr nuevo_score
    Note over API: Notificar Mentor async
```

---

## Resultado Final

```
Test Suites: 2 passed,  2 total
Tests:      14 passed, 14 total
Time:       14.994 s
```

> **14/14 ✅ — Todas las reglas de negocio estan verificadas y protegidas por tests automatizados.**
