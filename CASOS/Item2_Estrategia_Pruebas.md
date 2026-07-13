# 2. Plan y Estrategia de Pruebas

*Este documento corresponde al **Ítem 2 de la rúbrica**. Aquí se detalla la justificación teórica y metodológica de la estrategia de pruebas de NEXUS, alineada a estándares internacionales. Úsalo para demostrar al jurado tu dominio de los conceptos de Ingeniería de Software.*

---

## 2.1 Enfoque Estratégico General
La estrategia de pruebas para la plataforma **NEXUS** no se basó en una automatización desordenada o de fuerza bruta. Por el contrario, se diseñó siguiendo estrictamente la **Pirámide de Automatización de Pruebas de Mike Cohn (promovida por el ISTQB)** y el proceso de gestión de pruebas del estándar **ISO/IEC 29119**. 

En el contexto de una plataforma educativa (donde la pérdida de un examen o la filtración de notas son eventos críticos), decidimos rechazar el "Anti-patrón del Cono de Helado" (Ice-Cream Cone Anti-pattern), el cual depende excesivamente de pruebas manuales o pruebas E2E frágiles y lentas. 

En su lugar, implementamos un enfoque **Shift-Left Testing (DevSecOps)**: desplazamos la detección de defectos y vulnerabilidades lo más a la izquierda posible en el ciclo de vida del desarrollo (SDLC), encontrando los errores en el código fuente antes de que lleguen a producción.

---

## 2.2 Alineación con el Estándar ISO/IEC 29119
El estándar internacional ISO/IEC 29119 define directrices universales para el testing. Nuestra estrategia cumple con sus procesos clave:

1.  **ISO/IEC 29119-1 (Conceptos y Definiciones):** Definimos claramente el alcance de nuestras pruebas, diferenciando entre pruebas estáticas (análisis de código sin ejecución) y dinámicas (ejecución del software).
2.  **ISO/IEC 29119-2 (Procesos de Prueba):** Implementamos un "Plan de Pruebas a Nivel de Proyecto". Para cada uno de los 5 casos de uso críticos, definimos el contexto, los riesgos asociados y las técnicas a aplicar antes de escribir una sola línea de código.
3.  **ISO/IEC 29119-3 (Documentación de Prueba):** Nuestra matriz de casos de prueba y los documentos de sustentación (como este) actúan como la Especificación del Diseño de Prueba exigida por la norma, asegurando trazabilidad entre el requerimiento del negocio y el script automatizado.
4.  **ISO/IEC 29119-4 (Técnicas de Prueba):** Aplicamos rigor en la selección de técnicas: *Equivalence Partitioning* y *Boundary Value Analysis* para las notas de alumnos (Caja Negra), y *Statement/Branch Coverage* para los controladores de Login (Caja Blanca).

---

## 2.3 Niveles de Prueba Priorizados (La Pirámide ISTQB en Nexus)
Implementamos 10 niveles/tipos de pruebas, estructurados desde la base de la pirámide hasta la cúspide.

### A. La Base Sólida (Pruebas de Bajo Nivel)
Representan el 70% de nuestra suite. Son extremadamente rápidas, económicas de ejecutar y aisladas.
1.  **Análisis Estático (Linting & Types):** Inspección de código en tiempo real (TypeScript, ESLint, Zod). *Justificación:* En un LMS, los errores de tipo (`undefined is not a function`) en tiempo de ejecución arruinan la experiencia del usuario. Zod previene que datos malformados toquen la lógica.
2.  **Pruebas Unitarias Backend (Jest):** Pruebas de Caja Blanca mockeando la base de datos. *Justificación:* Permite validar las reglas de negocio puras (Ej. Validar que la contraseña coincida con el hash Bcrypt) en milisegundos, evaluando cada `if/else` del controlador.
3.  **Pruebas de Componente UI (Vitest + React Testing Library):** Pruebas de interfaz sin necesidad de navegador. *Justificación:* Permite probar que los botones se bloqueen y aparezcan los mensajes de error al instante, aislando fallos visuales de los fallos de red.

### B. El Medio de la Pirámide (Pruebas de Integración)
Representan el 20% de la suite. Verifican que los módulos funcionen juntos.
4.  **Pruebas de Integración API + DB:** Pruebas contra una base de datos PostgreSQL real (`nexus_test`). *Justificación:* Fundamental para probar transacciones **ACID** (Atomicidad, Consistencia, Aislamiento, Durabilidad). Garantizamos que no existan cursos "huérfanos" (sin profesor) y que la base de datos rechace violaciones de integridad referencial (Foreign Keys).
5.  **Pruebas de Seguridad OWASP (DevSecOps):** Pruebas de inyección. *Justificación:* Al manejar datos de menores de edad y propiedad intelectual, Nexus debe mitigar el OWASP Top 10. Probamos inyecciones SQL en el login y ataques de Path Traversal al subir PDFs.

### C. La Cúspide de la Pirámide (Pruebas de Alto Nivel)
Representan el 10% de la suite. Prueban el sistema desde la perspectiva del usuario.
6.  **Pruebas E2E (End-to-End con Playwright):** Bots en navegadores Chromium reales. *Justificación:* Costosas en tiempo, por eso solo las usamos para los *Happy Paths* más críticos, como simular a un alumno haciendo clic en el sistema operativo para adjuntar y entregar su tarea PDF.
7.  **Pruebas de Humo (Smoke Tests):** Pings rápidos a los endpoints. *Justificación:* Verificación de sanidad post-despliegue. Aseguran que la API "está viva" antes de correr suites más pesadas.
8.  **Pruebas de Aceptación BDD (Cucumber):** Pruebas escritas en lenguaje Gherkin (Given/When/Then). *Justificación:* Cierra la brecha entre los programadores y el cliente. Demuestra que el software hace lo que el negocio pidió en lenguaje humano.

### D. Pruebas No Funcionales (Rendimiento)
9.  **Pruebas de Carga (Load con Artillery):** Simulamos el tráfico esperado. *Justificación:* A las 11:59 PM (hora de cierre de tareas), Nexus recibirá cientos de peticiones por minuto. Evaluamos si el servidor maneja la concurrencia.
10. **Pruebas de Estrés (Stress con Artillery):** Llevamos el sistema al colapso. *Justificación:* Averiguar en qué punto se rompe la aplicación (OOM - Out of Memory) para poder dimensionar los servidores en AWS/Azure y probar los límites del *Event Loop* de Node.js al generar archivos CSV gigantes.

---

## 2.4 Justificación Final según el Contexto de Negocio
*Argumento de cierre para la exposición:*

"Profesor, si Nexus fuera un simple blog, no necesitaríamos este nivel de rigor. Pero Nexus es una plataforma educativa transaccional. 
Nuestra estrategia **Priorizó el Riesgo (Risk-Based Testing)**. Gastamos nuestros recursos de automatización (E2E y Rendimiento) en los flujos críticos (Subir Tareas y Exportar Calificaciones), porque un fallo ahí detiene el negocio. En contraste, para flujos secundarios, confiamos en la base de nuestra pirámide (Pruebas Unitarias y Análisis Estático) garantizando así un equilibrio perfecto entre Velocidad de Desarrollo (Agile) y Calidad de Grado Empresarial (Quality Assurance)."
