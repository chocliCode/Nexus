# Justificación Estratégica y Defensa del Proyecto (Guion Extendido)

Este documento es tu **Manual de Supervivencia y Guion Detallado** para la sustentación del Proyecto Integrador. El objetivo de este texto extendido es darte argumentos técnicos profundos, vocabulario de ingeniería de software (alineado al sílabo del curso) y las justificaciones exactas de por qué estructuramos la calidad de la plataforma **Nexus** utilizando estos 5 casos de uso específicos. 

Estudia este documento a fondo; te dará la seguridad para dominar cualquier pregunta del jurado (Mg. Víctor Hugo Alfaro Yangali).

---

## 1. Caso de Uso: Login Seguro
### Concepto Teórico Central: Pruebas de Caja Blanca y Shift-Left Testing (DevSecOps)

**¿Por qué elegimos este caso para el proyecto?**
El Login es la barrera perimetral de cualquier sistema. En el contexto del negocio de Nexus (una plataforma educativa), una brecha aquí compromete la integridad de notas, datos de menores y la propiedad intelectual de los cursos. Decidimos usar este caso para demostrar cómo integramos la **Seguridad desde el Diseño** (Shift-Left Testing).

**Justificación Técnica (Lo que debes explicar en la expo):**
*"Para este caso, decidimos no depender exclusivamente de pruebas funcionales tardías. En su lugar, aplicamos **Técnicas de Caja Blanca (Pruebas Unitarias con Jest)**. Al mockear la conexión de la base de datos, pudimos inyectar múltiples flujos y forzar la cobertura de todas las ramas lógicas (Statement y Branch Coverage) del controlador de autenticación, simulando qué pasa si el token expira, si el usuario no existe, o si la contraseña es incorrecta, asegurando respuestas en menos de 1 milisegundo.*

*Adicionalmente, cumplimos fuertemente con la Unidad IV del curso al incorporar **criterios del OWASP Top 10**. Escribimos pruebas de seguridad dinámicas que inyectan deliberadamente sentencias SQL y NoSQL (`' OR 1=1 --`) en el body del Login. Nuestro objetivo fue probar la resiliencia del ORM/Query Builder y asegurar que ninguna inyección pase al motor de base de datos."*

**Alineación con la Rúbrica:**
- **Ítem 3:** Demuestra diseño de Casos de Prueba usando técnica de **Caja Blanca**.
- **Ítem 5:** Identifica riesgos críticos e incorpora seguridad **OWASP**.

**Respuestas a Posibles Preguntas del Jurado:**
- *Pregunta:* "¿Por qué usar mocks en las pruebas unitarias del Login en lugar de una base de datos real?"
- *Respuesta:* "Por el principio de aislamiento en pruebas de Caja Blanca, profesor. Necesitábamos validar estrictamente la lógica de enrutamiento y cifrado (Bcrypt/JWT) del controlador. Si usamos una DB real, la prueba se vuelve de Integración, se vuelve lenta y propensa a fallos de red (Flaky tests), rompiendo la base de la Pirámide de Pruebas de ISTQB."

---

## 2. Caso de Uso: Crear Curso
### Concepto Teórico Central: Pruebas Basadas en Riesgo y Pruebas de Integración (API + DB)

**¿Por qué elegimos este caso para el proyecto?**
Sin cursos, Nexus no existe. Este es el flujo más crítico del negocio. Usamos este caso para aplicar la técnica de **Pruebas Basadas en Riesgos (Risk-Based Testing)**, priorizando el esfuerzo de testing en los componentes que, de fallar, tendrían un impacto catastrófico en la operación.

**Justificación Técnica (Lo que debes explicar en la expo):**
*"Dado el alto riesgo de negocio asociado a la creación de cursos, aquí implementamos **Pruebas de Integración puras**. A diferencia del Login, aquí NO usamos mocks. Levantamos una base de datos PostgreSQL real configurada exclusivamente para el entorno de test (`nexus_test`).* 

*Evaluamos cómo la capa de red (API Rest) se integra con el motor de persistencia. Evaluamos restricciones severas de integridad relacional: intentamos crear un curso asignando un `Jedi ID` (Profesor) que no existe en la base de datos, probando que el sistema maneje el error de llave foránea (Foreign Key Constraint) correctamente y mantenga la consistencia de los datos."*

**Alineación con la Rúbrica:**
- **Ítem 2:** Justifica los niveles de prueba según el contexto de negocio.
- **Ítem 3:** Aplica técnica de **Pruebas Basadas en Riesgos**.

**Respuestas a Posibles Preguntas del Jurado:**
- *Pregunta:* "¿Cómo aseguran que las pruebas de integración no llenen la base de datos de basura?"
- *Respuesta:* "Aplicamos hooks de ciclo de vida (`beforeAll` y `afterAll`) en nuestra suite. Antes de ejecutar, el pipeline inyecta datos semilla (Seeds), y al finalizar, ejecuta sentencias `DELETE` o `TRUNCATE` para restaurar el estado, garantizando que cada prueba sea idempotente e independiente."

---

## 3. Caso de Uso: Asignar Tarea
### Concepto Teórico Central: Pruebas de Componente UI y Mitigación XSS

**¿Por qué elegimos este caso para el proyecto?**
El flujo de comunicación entre el Mentor y el Padawan ocurre en el muro virtual interactivo. Queríamos demostrar cómo automatizar la validación de la Interfaz de Usuario (UI) de manera rápida sin la sobrecarga de levantar un navegador completo, combinándolo con validaciones de Cross-Site Scripting.

**Justificación Técnica (Lo que debes explicar en la expo):**
*"Para este caso nos apoyamos en **React Testing Library y Vitest**. Evaluamos el componente de React de manera aislada (Virtual DOM). Simulamos a un profesor intentando publicar una tarea sin colocar la fecha límite. Nuestro test virtual hace clic en el botón 'Publicar' y valida que el sistema intercepte la acción y muestre un mensaje flotante preventivo, bloqueando la petición HTTP antes de que salga del cliente.*

*Además, integramos defensas de DevSecOps probando inyecciones de código Javascript malicioso (`<script>alert('hack')</script>`) en el texto de la tarea. Validamos que React sanitice el Virtual DOM, mitigando ataques de Stored XSS, que es una de las vulnerabilidades más comunes en foros y muros interactivos educativos."*

**Alineación con la Rúbrica:**
- **Ítem 4:** Automatización de interfaces simuladas.
- **Ítem 5:** Incorpora criterios de seguridad (Mitigación OWASP XSS).

**Respuestas a Posibles Preguntas del Jurado:**
- *Pregunta:* "¿Cuál es la diferencia entre estas pruebas de Componente UI y las pruebas E2E con Playwright?"
- *Respuesta:* "Las pruebas de Componente UI con Vitest ocurren en un entorno de Node simulando el DOM (jsdom), son extremadamente rápidas y evalúan el contrato interno del componente (cómo reacciona al estado). Las pruebas E2E con Playwright levantan motores de navegadores reales (Chromium), consumen la base de datos real y prueban el sistema completo de extremo a extremo simulando la experiencia humana exacta."

---

## 4. Caso de Uso: Subir PDF
### Concepto Teórico Central: Automatización End-to-End (E2E) interactuando con el Sistema Operativo

**¿Por qué elegimos este caso para el proyecto?**
Es el escenario perfecto para tu **Demo en Vivo**. Subir un archivo es una acción compleja que involucra el navegador interactuando con los archivos locales de la computadora. Este caso demuestra el poder real de una suite E2E moderna.

**Justificación Técnica (Lo que debes explicar en la expo):**
*"Para la automatización de la interfaz (E2E) elegimos la herramienta de vanguardia **Playwright**. Este caso demuestra el recorrido completo del usuario (Caja Negra): el bot abre Chromium, inicia sesión como alumno, busca el curso, encuentra la tarea y utiliza el API de Playwright para interactuar con el sistema de archivos del Sistema Operativo (`setInputFiles`), adjuntando un documento PDF real.* 

*Verificamos visualmente que, al finalizar la carga, el estado en el frontend cambie reactivamente a 'Entregada'. En paralelo, a nivel de backend, demostramos seguridad probando qué ocurre si un alumno intenta subir Malware (por ejemplo, renombrando un archivo `.exe` a `.pdf`). Nuestro sistema lo bloquea evaluando los 'magic bytes' y el Mime Type real, protegiendo los servidores."*

**Alineación con la Rúbrica:**
- **Ítem 4:** Suite automatizada E2E con Playwright (evidencia de ejecución).
- **Ítem 6:** Demo en vivo (Este debe ser el caso que ejecutes frente a ellos).

**Respuestas a Posibles Preguntas del Jurado:**
- *Pregunta:* "¿Por qué usaron Playwright en lugar de Selenium?"
- *Respuesta:* "Elegimos Playwright porque su arquitectura moderna se comunica directamente con el navegador vía protocolo WebSocket (Chrome DevTools Protocol) evitando la latencia del WebDriver HTTP de Selenium. Nos permite interceptar red, esperar automáticamente (auto-wait) a que los elementos del DOM estén listos, e interactuar fluidamente con inputs de archivos."

---

## 5. Caso de Uso: Calificar y Exportar CSV
### Concepto Teórico Central: Pruebas No Funcionales (Carga/Estrés) y Transacciones ACID

**¿Por qué elegimos este caso para el proyecto?**
Exportar reportes (CSV) y procesar múltiples notas son operaciones pesadas. Este caso nos permite cubrir el territorio de las **Pruebas No Funcionales (Rendimiento)** e integrarlo con los principios de bases de datos.

**Justificación Técnica (Lo que debes explicar en la expo):**
*"Este caso cierra el círculo de calidad evaluando el rendimiento bajo presión. Utilizamos **Artillery** para inyectar Pruebas de Carga y Estrés. Simulamos a decenas de profesores descargando reportes CSV masivos simultáneamente para evaluar si la memoria RAM de Node.js soporta el esfuerzo, o si los workers del Event Loop se bloquean.*

*A nivel de base de datos, realizamos pruebas de Integración enfocadas en propiedades **ACID**. Lanzamos peticiones de calificación concurrentes en el mismo milisegundo al mismo estudiante. Demostramos cómo los bloqueos a nivel de fila (`Row-Level Locks` o `FOR UPDATE`) de PostgreSQL serializan las transacciones, evitando condiciones de carrera (Race Conditions) y asegurando que dos profesores no puedan pisar ni alterar la consistencia de la nota final al mismo tiempo."*

**Alineación con la Rúbrica:**
- **Ítem 4:** Automatización de Rendimiento (Load/Stress).
- **Ítem 5:** Análisis de riesgos de arquitectura (Memory Leaks, Deadlocks).

**Respuestas a Posibles Preguntas del Jurado:**
- *Pregunta:* "¿Qué métricas buscaron en sus pruebas de estrés?"
- *Respuesta:* "Principalmente evaluamos el p95 (percentil 95) del tiempo de respuesta bajo carga pesada y la tasa de errores HTTP 500 para identificar en qué punto el servidor agota sus conexiones disponibles a la base de datos o sufre un OOM (Out of Memory) al crear los CSVs."

---

### 🎙️ Elevator Pitch Final (Palabras de Cierre)
Si te piden una conclusión general o el "por qué" de su estrategia global:

*"Profesor, nuestra estrategia integral de pruebas fue diseñada tomando como marco los estándares **ISO/IEC 29119** y la pirámide de automatización de **ISTQB**. 
Entendimos que intentar automatizar todo en E2E nos daría el anti-patrón del 'Cono de Helado' (pruebas frágiles y lentas). Por ello, construimos una pirámide sólida: gran volumen de pruebas estáticas y unitarias en la base, enfocadas en la seguridad temprana (Shift-Left Testing DevSecOps), para ir subiendo la pirámide con pruebas de integración y componente, dejando en la cúspide únicamente los flujos críticos del negocio (como subir tareas) para la automatización E2E en Playwright."*
