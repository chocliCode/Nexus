# Pruebas de Aceptacion (UAT) -- NEXUS

---

## Resumen General

| Metrica | Valor |
|---|---|
| **Total de pruebas** | 15 escenarios |
| **Tipo** | Aceptacion de Usuario (User Acceptance Testing) |
| **Framework** | Jest-Cucumber (Gherkin syntax) |
| **Base de datos** | Requerida (simulando flujos reales) |
| **Archivos** | `nexus.feature` (casos) + `acceptance.test.ts` (implementacion) |
| **Categorias** | Auth, Perfil, OKRs, Vacantes, Sesiones, Notificaciones, IA Dashboard |

### Que son las pruebas de aceptacion

Las pruebas de aceptacion verifican que el sistema cumple con los **requisitos de negocio** desde la perspectiva del usuario final. En NEXUS, se implementan usando **Behavior-Driven Development (BDD)** con la sintaxis Gherkin (Given-When-Then), lo que permite que tanto programadores como stakeholders de negocio puedan leer y entender que hace el sistema.

### Como ejecutarlas

```bash
# Desde el directorio backend (requiere PostgreSQL corriendo)
npm run test:acceptance
```

---

## Modulos y Escenarios (15 Pruebas)

Todas las pruebas se basan en el archivo fuente `backend/tests/acceptance/features/nexus.feature`.

### 1. Autenticacion

| ID | Escenario (Gherkin) |
|---|---|
| **UAT-01** | **Registro exitoso:** Given sistema activo -> When envia registro -> Then retorna 201 y JWT |
| **UAT-02** | **Login Administrador:** Given existe admin -> When inicia sesion -> Then retorna 200 y JWT |
| **UAT-03** | **Login Padawan:** Given existe padawan -> When inicia sesion -> Then retorna JWT de acceso |

### 2. Gestion de Perfil

| ID | Escenario (Gherkin) |
|---|---|
| **UAT-04** | **Ver perfil propio:** Given usuario logueado -> When solicita perfil -> Then devuelve nombres |

### 3. Gestion de OKRs (Flujo Core)

| ID | Escenario (Gherkin) |
|---|---|
| **UAT-05** | **Crear OKR:** Given logueado -> When crea OKR con meta 10 -> Then retorna 201 |
| **UAT-06** | **Listar OKRs:** Given tiene OKRs -> When solicita lista -> Then devuelve arreglo no vacio |
| **UAT-07** | **Actualizar OKR:** Given tiene OKR -> When actualiza valor a 5 -> Then sistema confirma (200) |
| **UAT-08** | **Eliminar OKR:** Given creo OKR -> When solicita eliminar -> Then OKR es eliminado |

### 4. Bolsa de Trabajo (Vacantes)

| ID | Escenario (Gherkin) |
|---|---|
| **UAT-09** | **Publicar Vacante:** Given admin logueado -> When publica vacante -> Then retorna 201 |
| **UAT-10** | **Buscar Vacantes:** Given existen vacantes -> When busca por modalidad -> Then devuelve lista filtrada |

### 5. Sesiones de Mentoria

| ID | Escenario (Gherkin) |
|---|---|
| **UAT-11** | **Ver Sesiones:** Given padawan logueado -> When solicita lista -> Then retorna sesiones asignadas |
| **UAT-12** | **Agendar Sesion:** Given admin logueado -> When agenda sesion a padawan -> Then sistema confirma |

### 6. Sistema de Notificaciones

| ID | Escenario (Gherkin) |
|---|---|
| **UAT-13** | **Leer Notificaciones:** Given usuario logueado -> When consulta no leidas -> Then retorna listado total |

### 7. Dashboard e Inteligencia Artificial

| ID | Escenario (Gherkin) |
|---|---|
| **UAT-14** | **Evaluacion IA Riesgo:** Given admin logueado -> When solicita evaluacion -> Then devuelve clasificacion de riesgo |
| **UAT-15** | **Estadisticas Generales:** Given admin logueado -> When consulta stats -> Then devuelve totales de completitud |

---

## Arquitectura de Ejecucion

Las pruebas UAT de NEXUS usan una combinacion hibrida para balancear legibilidad y rendimiento:
1. **Definicion:** Se definen en archivos `.feature` en lenguaje natural.
2. **Traduccion:** `jest-cucumber` mapea las sentencias en ingles/espanol a funciones de TypeScript.
3. **Ejecucion:** `supertest` dispara las peticiones a la API real.
4. **Estado:** Requieren que el entorno de CI o local tenga datos iniciales (`seed`) para funcionar.

---

## Estructura de Archivos

```
tests/
└── acceptance/
    ├── features/
    │   └── nexus.feature        ← 15 escenarios de negocio en BDD/Gherkin
    └── acceptance.test.ts       ← Implementacion de los pasos (Given/When/Then)
```
