# Guía de Exposición y Guion Oficial (DevSecOps & SQA)
## Proyecto NEXUS · Versión 3 (Enfoque Funcional + Tiempos Estrictos)
### Estructura de Sustentación Grupal · 4 Expositores
**Alineado a la Rúbrica Final (P3) · 475+ Tests · Cobertura de los 8 criterios de evaluación**

---

## ⏱️ Control del Tiempo y Demo en Vivo (Rúbrica Final)
El cumplimiento estricto del tiempo es evaluado en el Criterio 8 y en las bases del curso. Para asegurar la máxima nota, se deben seguir los siguientes lineamientos temporales:
• **Duración Total Permitida:** Entre 15 y 20 minutos por equipo. Tiempo estimado de este guion: **17 minutos 15 segundos**.
• **Distribución de la Demostración en Vivo:** Reservar obligatoriamente entre 4 y 6 minutos únicamente para la Demo de ejecución de pruebas y flujos (se establece una meta de 5 minutos en el Slide 9c).
• **División Teórica por Expositor:** Cada expositor cuenta con un bloque de 2 a 4 minutos para su parte conceptual, garantizando una exposición fluida y balanceada.
• **Estrategia de Velocidad (Plan de Emergencia):** Si el jurado solicita acortar la presentación a la mitad de tiempo, los expositores deben explicar únicamente las diapositivas de conceptos (tipo 'a') y pasar las diapositivas de evidencia de código (tipo 'b') en 5 segundos, diciendo: *"Y aquí en pantalla se visualiza la evidencia del código/script de pruebas implementado"*.

---

## 🧭 Distribución del Guion y Tiempos por Diapositiva

Para optimizar el tiempo, **la teoría de testing y automatización se explicará usando EXCLUSIVAMENTE 5 casos de uso funcionales** que se mostrarán en la demo:
1. **Login Seguro:** Para explicar Pruebas Unitarias y Seguridad (SQLi).
2. **Crear Curso:** Para explicar Integración (API+DB).
3. **Asignar Tarea:** Para explicar Pruebas de Componente UI.
4. **Subir PDF:** Para explicar Pruebas E2E (Playwright).
5. **Calificar y CSV:** Para explicar Transacciones ACID y Carga/Estrés.

La exposición ha sido rediseñada para cubrir explícitamente los 8 criterios de la Rúbrica de Evaluación (20 puntos).

---

## 👤 Expositor 1: Presentación, Arquitectura, Plan y Diseño de Casos
**Enfoque:** Conceptual y de Negocio. Muy sencillo y directo. **Tiempo Estimado Total: 3 min 40 s.**

### Slide 1: Portada (Duración: 20s)
• Saludo al jurado e introducción de la sustentación del Proyecto Integrador Final de NEXUS.
• Introducción: *"NEXUS es una plataforma SaaS de mentoría 1-a-1 diseñada para acelerar la inserción laboral de jóvenes talentos tecnológicos."*

### Slide 1b: Integrantes (Duración: 20s)
• Presentación nominal rápida de los 4 miembros del equipo.

### Slide 2: Propósito de NEXUS y ODS (Duración: 45s)
• Explicar el problema: Alta informalidad juvenil y brecha de habilidades prácticas frente al mercado laboral.
• Alineamiento ODS: Educación de calidad (ODS 4), Trabajo decente (ODS 8) y Alianzas (ODS 17).

### Slide 3: Arquitectura Funcional (Duración: 45s) — Cubre Criterio 1
• Definir el alcance a través de los módulos core funcionales que verán en la demo: Autenticación, Aula Virtual de Cursos, Gestión de Tareas/Entregas en PDF y Exportación de Calificaciones en CSV.
• Arquitectura de 3 capas: React 19, Node.js/Express, PostgreSQL, montado en Docker Compose.

### Slide 4: Estrategia de Pruebas — ISTQB & ISO 29119 (Duración: 45s) — Cubre Criterio 2
• Estándares: la estrategia se basa en las mejores prácticas de ISTQB y en el estándar de ciclo de vida ISO/IEC 29119.
• Justificación: Hemos implementado 9 niveles de prueba (más de 475 tests automatizados) para garantizar la solidez transaccional, soportar concurrencia y proteger datos de usuarios.

### Slide 5: Técnicas de Diseño enfocadas a Casos (Duración: 45s) — Cubre Criterio 3
• *Caja Negra (Partición de equivalencias):* Usado en el caso de **Login**. Ejemplo: Si el email no tiene '@', el frontend lo rechaza inmediatamente.
• *Caja Blanca (Caminos lógicos):* Usado en el caso de **Calificaciones y CSV**. Se prueban los flujos internos de las transacciones ACID (BEGIN, COMMIT y ROLLBACK).
• *Basadas en Riesgo:* Priorizamos la automatización de flujos críticos de negocio como los 5 que usaremos en esta exposición.

---

## 👤 Expositor 2: Pruebas de Desarrollo y Métricas de Calidad
**Enfoque:** Lógica interna, pruebas de interfaz y métricas cuantitativas. **Tiempo Estimado Total: 2 min 55 s.**

### Slide 6a: Pruebas Unitarias y de Componentes — Conceptos (Duración: 45s) — Cubre parte de Criterio 4
• *Teoría:* Pruebas aisladas con Jest para backend y Vitest + jsdom para componentes de frontend.
• *Enfoque Funcional:* Para el caso del **Login Seguro**, aplicamos unitarias a los esquemas Zod. Para el caso de **Asignar Tareas**, aplicamos pruebas de componente UI para verificar que los modales de React carguen sin fallos sin abrir el navegador.

### Slide 6b: Evidencia de Código Unitario/Componente (Duración: 20s)
• Evidencia de código: fragmento de `auth.schema.unit.test.ts` rechazando correos inválidos, y fragmento de `LoginPage.test.tsx` (React Testing Library).

### Slide 7a: Pruebas de Integración — Conceptos (Duración: 45s)
• *Teoría:* Interacción real entre la API backend (Supertest) y PostgreSQL.
• *Enfoque Funcional:* Para el caso de **Crear Curso**, probamos que el Mentor envíe un HTTP POST y que el curso persista en la base de datos con el estado inicial correcto.

### Slide 7b: Evidencia de Código de Integración (Duración: 20s)
• Evidencia de código: fragmento de `courses.test.ts`, validando el flujo real contra PostgreSQL.

### Slide 7c: Métricas de Calidad de Código — SonarCloud (Duración: 45s) — Cubre parte de Criterio 7
• SonarCloud Quality Gate: auditoría de mantenibilidad en la nube.
• Métricas: 83% de cobertura de código nuevo, 0 bugs de seguridad y menos del 2.5% de duplicaciones.

---

## 👤 Expositor 3: Pruebas E2E y Ejecución de Demo
**Enfoque:** Pruebas de interfaz (Playwright) y la estructura de la demo ante el jurado. **Tiempo Estimado Total: 6 min 25 s (Exp: 1 min 25s | Demo: 5 min 00 s).**

### Slide 8a: Pruebas E2E — Playwright — Conceptos (Duración: 45s) — Cubre parte de Criterio 4
• *Teoría:* Navegación en Chromium controlado por Playwright. Modo headless en CI, modo headed para mostrarlo.
• *Enfoque Funcional:* Usamos Playwright para automatizar el caso de **Subir un PDF de Tarea**. El bot hace login, navega al aula, carga el PDF y lo envía, como un humano real.

### Slide 8b: Pruebas E2E — Código Playwright (Duración: 20s)
• Evidencia de código real: test de `nexus.spec.ts` ("Login exitoso redirige al dashboard").

### Slide 9c: Plan y Ejecución de Demostración en Vivo (Duración: 5m 00s) — Cubre Criterio 6
*Estrategia y Demo: Demostración funcional en vivo.*
• **Minuto 1:** Login como Mentor (Caso 1), Crear Curso de Desarrollo Web (Caso 2).
• **Minuto 2:** Publicar una nueva Tarea en el feed del Aula Virtual (Caso 3).
• **Minuto 3:** Logout -> Login como Padawan. Entrar al aula y Subir un archivo PDF de entrega (Caso 4, flujo que hace Playwright automatizado).
• **Minuto 4:** Logout -> Login como Mentor. Ir a la pestaña Calificaciones, calificar la entrega con nota de 18 y Exportar CSV (Caso 5).
• **Minuto 5:** Ejecución rápida de la suite backend (`npm test` en terminal para mostrar 475+ tests en verde) y F12 para mostrar los logs de la API.

---

## 👤 Expositor 4: Rendimiento, Seguridad DevSecOps, Pipelines y Conclusiones
**Enfoque:** Resiliencia bajo carga, seguridad (SQLi), CI/CD y cierre. **Tiempo Estimado Total: 3 min 30 s.**

### Slide 10a: Seguridad y DevSecOps — Conceptos (Duración: 40s) — Cubre Criterio 5
• *Seguridad (OWASP Top 10):* Retomando el **Caso 1 (Login)**, mitigamos A03: Inyecciones SQL, además de XSS y manipulación de JWT.
• *DevSecOps:* Implementamos CodeQL (SAST) en cada push a main para análisis semántico, y OWASP ZAP (DAST) atacando la API viva.

### Slide 10b: Pruebas de Seguridad — Código SQLi (Duración: 20s)
• Evidencia de código real: `security.test.ts`, caso "Rechaza SQL injection en email de login" con el payload `' OR '1'='1' --`.

### Slide 11a: Pruebas de Carga y Estrés — Conceptos (Duración: 35s)
• *Teoría:* Simulación de tráfico con Artillery.
• *Enfoque Funcional:* Para el **Caso 5 (Calificación y CSV)**, ¿qué pasa si 500 profesores califican a la vez? Simulamos picos masivos y carga sostenida (endurance) para garantizar que el servidor Node.js no colapse bajo estrés.

### Slide 11b: Configuración Artillery (Duración: 15s)
• Evidencia visual de la configuración de fases de carga en YAML (`load-mixed.yml`).

### Slide 12a: Pipelines CI/CD en GitHub Actions (Duración: 40s) — Sube Criterio 4 a "Excelente"
• *Shift-Left (Develop):* pipeline rápido de linting y unitarias en `ci-develop.yml`, sin DB.
• *Release Validation (Main):* pipeline completo con PostgreSQL real, integración, seguridad, Playwright y Artillery en `ci-main.yml`.

### Slide 12b: Consola y Reporte de Defectos (Duración: 20s) — Cubre Criterio 7
• *Consola:* 475+ tests automatizados pasando en verde en GitHub Actions.
• *Reporte de Defectos:* El reporte de defectos lo manejamos en tiempo real usando los Issues de GitHub conectados a las fallas de Playwright/Jest, y refinando los code smells alertados por SonarCloud hasta llegar a cero bugs.

### Slide 13: Conclusiones y Mejoras (Duración: 40s)
• *Conclusión:* La suite de pruebas de NEXUS y el pipeline DevSecOps protegen integralmente los flujos de negocio clave frente a bugs y ataques.
• *Mejoras futuras:* Integrar análisis de mutación con Stryker y unificar Playwright con Cucumber para pruebas BDD visuales.

---

## 📋 Mapa Rúbrica → Slide → Expositor

| Criterio (pts) | Slide(s) | Expositor | Estado |
|---|---|---|---|
| 1. Presentación y alcance (2) | 1, 1b, 2, 3 | 1 | Cubierto |
| 2. Plan y estrategia de pruebas (3) | 4 | 1 | Cubierto |
| 3. Diseño de casos de prueba (3) | 5 | 1 | Cubierto (con ejemplos funcionales) |
| 4. Automatización de pruebas (4) | 6a-8b, 12a, 12b | 2, 3, 4 | Cubierto |
| 5. Riesgos, defectos y seguridad (2) | 10a, 10b | 4 | Cubierto |
| 6. Demo en vivo (3) | 9c | 3 | Cubierto (5 min cronometrados, 5 flujos) |
| 7. Documentación y métricas (2) | 7c, 12b, 13 | 2, 4 | Cubierto (Incluye reporte vía Issues/SonarCloud) |
| 8. Comunicación y tiempo (1) | Todo el guion | Todos | 17 minutos |
