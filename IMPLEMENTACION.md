# 📌 Casos de Uso Implementados — NEXUS

> Registro vivo de los casos de uso implementados en el software. Cada entrada documenta qué se implementó, dónde vive en el código, y cómo verificarlo.

---

## Estado General

| Estado | Símbolo |
|--------|---------|
| Implementado | ✅ |
| En progreso | 🔧 |
| Pendiente | ⏳ |

---

## 🔐 Autenticación

### ✅ UC-01 — Registrarse en la plataforma

| Campo | Detalle |
|-------|---------|
| **Descripción** | El usuario crea una cuenta con email, contraseña y rol (Padawan o Jedi). |
| **Actores** | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi |
| **Estado** | ✅ Implementado |
| **Fecha** | 2026-05-17 |

**Archivos clave:**

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Frontend | `frontend/src/pages/RegisterPage.tsx` | Formulario de registro con validación Zod |
| Frontend | `frontend/src/hooks/useAuth.tsx` | Función `register()` — guarda token en localStorage |
| Backend | `backend/src/controllers/auth.controller.ts` | `register()` — hash bcrypt, insert en BD, genera JWT |
| Backend | `backend/src/routes/auth.routes.ts` | `POST /api/v1/auth/register` |
| Backend | `backend/src/schemas/auth.schema.ts` | Validación de campos con Zod |

**Flujo:**
1. Usuario llena formulario (nombres, apellidos, email, contraseña, rol)
2. Frontend valida con Zod → envía `POST /api/v1/auth/register`
3. Backend verifica email no duplicado → hash contraseña → INSERT en `usuario`
4. Si Padawan → crea `perfil_aprendiz`; si Jedi → crea `mentor`
5. Genera JWT (24h) → responde con `{ token, user }`
6. Frontend guarda token y redirige a `/dashboard`

---

### ✅ UC-02 — Iniciar sesión

| Campo | Detalle |
|-------|---------|
| **Descripción** | Autenticación con email/contraseña. |
| **Actores** | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi · 🏢 Empresa |
| **Estado** | ✅ Implementado |
| **Fecha** | 2026-05-17 |

**Archivos clave:**

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Frontend | `frontend/src/pages/LoginPage.tsx` | Formulario de login con validación |
| Frontend | `frontend/src/hooks/useAuth.tsx` | Función `login()` — persiste sesión |
| Frontend | `frontend/src/services/api.ts` | Interceptor que adjunta JWT a cada request |
| Backend | `backend/src/controllers/auth.controller.ts` | `login()` — compara hash, genera JWT |
| Backend | `backend/src/routes/auth.routes.ts` | `POST /api/v1/auth/login` |
| Backend | `backend/src/middleware/auth.middleware.ts` | Verificación de JWT en rutas protegidas |

**Flujo:**
1. Usuario ingresa email y contraseña
2. Frontend valida → envía `POST /api/v1/auth/login`
3. Backend busca usuario → verifica `activo = true` → compara bcrypt
4. Genera JWT → responde con `{ token, user }`
5. Frontend guarda en localStorage → redirige a `/dashboard`
6. Interceptor de Axios adjunta `Bearer {token}` a requests futuros

**Nota:** La recuperación de contraseña está pendiente como sub-feature.

---

### ✅ UC-03 — Cerrar sesión

| Campo | Detalle |
|-------|---------|
| **Descripción** | Terminar la sesión activa de forma segura. |
| **Actores** | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi · 🏢 Empresa |
| **Estado** | ✅ Implementado |
| **Fecha** | 2026-05-17 |

**Archivos clave:**

| Capa | Archivo | Responsabilidad |
|------|---------|-----------------|
| Frontend | `frontend/src/components/layout/Layout.tsx` | Botón "Cerrar sesión" en sidebar |
| Frontend | `frontend/src/hooks/useAuth.tsx` | Función `logout()` — limpia localStorage |
| Frontend | `frontend/src/App.tsx` | `ProtectedRoute` redirige a `/login` si no autenticado |

**Flujo:**
1. Usuario hace clic en "Cerrar sesión" (sidebar desktop o mobile)
2. Se ejecuta `logout()` → elimina `nexus_token` y `nexus_user` de localStorage
3. Estado de React se limpia (`user = null`, `token = null`)
4. Navegación automática a `/login`
5. Cualquier intento de acceder a rutas protegidas redirige a login

---

## 👤 Perfil

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-04 | Completar perfil y habilidades | ⏳ Pendiente |
| UC-05 | Actualizar perfil profesional | ⏳ Pendiente |
| UC-06 | Ver perfil de otro usuario | ⏳ Pendiente |

## 🚀 Onboarding

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-07 | Completar evaluación diagnóstica | ⏳ Pendiente |
| UC-08 | Generar ruta de aprendizaje (IA) | ⏳ Pendiente |

## 📊 Dashboard

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-09 | Ver dashboard de progreso | ⏳ Pendiente |

## 🔗 Matching

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-10 | Recibir matching con Mentor Jedi | ⏳ Pendiente |
| UC-11 | Aceptar o rechazar un matching | ⏳ Pendiente |

## 🎓 Mentoría

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-12 | Programar sesión de mentoría | ⏳ Pendiente |
| UC-13 | Realizar sesión de mentoría | ⏳ Pendiente |
| UC-14 | Cancelar sesión programada | ⏳ Pendiente |
| UC-15 | Ver historial de sesiones | ⏳ Pendiente |

## 🎯 OKRs

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-16 | Crear OKR en una sesión | ⏳ Pendiente |
| UC-17 | Actualizar progreso de un OKR | ⏳ Pendiente |
| UC-18 | Completar un OKR | ⏳ Pendiente |
| UC-19 | Dar feedback sobre un OKR | ⏳ Pendiente |

## 📈 Placement

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-20 | Ver score de empleabilidad | ⏳ Pendiente |

## 💼 Vacantes

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-21 | Publicar vacante laboral | ⏳ Pendiente |
| UC-22 | Buscar y filtrar vacantes | ⏳ Pendiente |
| UC-23 | Postularse a una vacante | ⏳ Pendiente |
| UC-24 | Gestionar vacantes publicadas | ⏳ Pendiente |

## 🤖 Inteligencia Artificial

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-25 | Detectar riesgo de abandono (IA) | ⏳ Pendiente |

## 🔔 Notificaciones

| ID | Caso de Uso | Estado |
|----|-------------|--------|
| UC-26 | Recibir notificaciones | ⏳ Pendiente |

---

## 📊 Resumen de Progreso

| Métrica | Valor |
|---------|-------|
| **Total Casos de Uso** | 26 |
| **Implementados** | 3 (UC-01, UC-02, UC-03) |
| **En progreso** | 0 |
| **Pendientes** | 23 |
| **Avance** | 11.5% |

---

> Última actualización: 2026-05-17
