# 📋 Casos de Uso — Plataforma Nexus

> Documento de referencia con todos los casos de uso del sistema, organizados por módulo funcional.

---

## 🎨 Paleta de Colores

| Rol | Color | Hex |
|-----|-------|-----|
| **Primario** | 🟣 | `#7F77DD` |
| **Claro** | ⚪ | `#EEEDFE` |
| **Oscuro** | 🔵 | `#26215C` |
| **Éxito** | 🟢 | `#1D9E75` |
| **Acento 2** | 🌿 | `#E1F5EE` |
| **Alerta** | 🟠 | `#D85A30` |
| **Suave** | 🍑 | `#FAECE7` |
| **OKR** | 🟡 | `#BA7517` |
| **Neutro** | 🔘 | `#F1EFE8` |

---

## 👥 Roles del Sistema

| Icono | Rol | Descripción |
|-------|-----|-------------|
| 🧑‍🎓 | **Padawan (Aprendiz)** | Usuario en formación que busca desarrollar habilidades y empleabilidad. |
| 🧙‍♂️ | **Mentor Jedi** | Profesional experimentado que guía y acompaña al Padawan. |
| 🏢 | **Empresa** | Organización que publica vacantes y busca talento en la plataforma. |
| 🤖 | **Sistema / IA** | Motor de inteligencia artificial que automatiza procesos y genera recomendaciones. |

---

## 🔐 Autenticación

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-01` | **Registrarse en la plataforma** | El usuario crea una cuenta con email, contraseña y rol (Padawan o Jedi). | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi |
| `UC-02` | **Iniciar sesión** | Autenticación con email/contraseña. Soporte para recuperación de contraseña. | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi · 🏢 Empresa |
| `UC-03` | **Cerrar sesión** | Terminar la sesión activa de forma segura. | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi · 🏢 Empresa |

---

## 👤 Perfil

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-04` | **Completar perfil y habilidades** | El Padawan registra sus habilidades, nivel de dominio, estudios y objetivos de carrera. | 🧑‍🎓 Padawan |
| `UC-05` | **Actualizar perfil profesional** | Editar datos personales, bio, preferencias y portafolio. | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi |
| `UC-06` | **Ver perfil de otro usuario** | Consultar el perfil público de un aprendiz o mentor. | 🧙‍♂️ Mentor Jedi · 🏢 Empresa |

---

## 🚀 Onboarding

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-07` | **Completar evaluación diagnóstica** | El Padawan responde un test inicial que alimenta al motor de IA para generar su Learning Path. | 🧑‍🎓 Padawan · 🤖 Sistema / IA |
| `UC-08` | **Generar ruta de aprendizaje (IA)** | El sistema analiza el perfil y crea un Learning Path personalizado con metas y sprints. | 🤖 Sistema / IA |

---

## 📊 Dashboard

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-09` | **Ver dashboard de progreso** | El Padawan visualiza su score de empleabilidad, OKRs activos y próximas sesiones. | 🧑‍🎓 Padawan |

---

## 🔗 Matching

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-10` | **Recibir matching con Mentor Jedi** | El algoritmo de IA empareja al Padawan con el Mentor más afín por habilidades y objetivos. | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi · 🤖 Sistema / IA |
| `UC-11` | **Aceptar o rechazar un matching** | El Mentor puede revisar el perfil del Padawan propuesto y decidir si acepta la mentoría. | 🧙‍♂️ Mentor Jedi |

---

## 🎓 Mentoría

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-12` | **Programar sesión de mentoría** | Agendar una nueva sesión con fecha, hora y modalidad (online/presencial). | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi |
| `UC-13` | **Realizar sesión de mentoría** | Ejecutar la sesión y marcarla como *Realizada*, agregando notas y feedback. | 🧙‍♂️ Mentor Jedi |
| `UC-14` | **Cancelar sesión programada** | Cancelar una sesión antes de que ocurra, con notificación a ambas partes. | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi |
| `UC-15` | **Ver historial de sesiones** | Consultar sesiones pasadas con sus notas, OKRs y feedback asociados. | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi |

---

## 🎯 OKRs

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-16` | **Crear OKR en una sesión** | El Mentor define un objetivo medible para el Padawan con valor meta y fecha límite. | 🧙‍♂️ Mentor Jedi |
| `UC-17` | **Actualizar progreso de un OKR** | El Padawan registra el valor alcanzado y cambia el estado a *EnProgreso*. | 🧑‍🎓 Padawan |
| `UC-18` | **Completar un OKR** | El Padawan marca un OKR como *Completado* cuando supera la meta. El sistema actualiza el score. | 🧑‍🎓 Padawan · 🤖 Sistema / IA |
| `UC-19` | **Dar feedback sobre un OKR** | El Mentor revisa el OKR completado y registra su conformidad o solicita una nueva sesión. | 🧙‍♂️ Mentor Jedi |

---

## 📈 Placement

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-20` | **Ver score de empleabilidad** | El Padawan consulta su score actualizado tras completar OKRs y sesiones. | 🧑‍🎓 Padawan · 🤖 Sistema / IA |

---

## 💼 Vacantes

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-21` | **Publicar vacante laboral** | La Empresa crea una oferta con descripción, skills requeridas, salario y modalidad. | 🏢 Empresa |
| `UC-22` | **Buscar y filtrar vacantes** | El Padawan explora vacantes filtradas por sector, modalidad y habilidades de su perfil. | 🧑‍🎓 Padawan |
| `UC-23` | **Postularse a una vacante** | El Padawan aplica a una oferta, enviando su perfil dinámico a la empresa. | 🧑‍🎓 Padawan |
| `UC-24` | **Gestionar vacantes publicadas** | La Empresa puede editar, activar o desactivar sus ofertas laborales. | 🏢 Empresa |

---

## 🤖 Inteligencia Artificial

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-25` | **Detectar riesgo de abandono (IA)** | El motor de IA monitorea la actividad y alerta cuando un Padawan muestra señales de abandono. | 🤖 Sistema / IA |

---

## 🔔 Notificaciones

| ID | Caso de Uso | Descripción | Actores |
|----|-------------|-------------|---------|
| `UC-26` | **Recibir notificaciones** | Alertas de nuevas sesiones, OKRs completados, matchings y mensajes del mentor. | 🧑‍🎓 Padawan · 🧙‍♂️ Mentor Jedi · 🏢 Empresa |

---

## 📊 Resumen por Actor

| Actor | Casos de Uso |
|-------|--------------|
| 🧑‍🎓 **Padawan** | UC-01, UC-02, UC-03, UC-04, UC-05, UC-07, UC-09, UC-10, UC-12, UC-14, UC-15, UC-17, UC-18, UC-20, UC-22, UC-23, UC-26 |
| 🧙‍♂️ **Mentor Jedi** | UC-01, UC-02, UC-03, UC-05, UC-06, UC-10, UC-11, UC-12, UC-13, UC-14, UC-15, UC-16, UC-19, UC-26 |
| 🏢 **Empresa** | UC-02, UC-03, UC-06, UC-21, UC-24, UC-26 |
| 🤖 **Sistema / IA** | UC-07, UC-08, UC-10, UC-18, UC-20, UC-25 |

---

> **Total: 26 casos de uso** distribuidos en **11 módulos funcionales**.
