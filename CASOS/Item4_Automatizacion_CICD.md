# 4. Automatización de Pruebas y Pipeline CI/CD

*Este documento corresponde al **Ítem 4 de la rúbrica**. Aquí explicaremos la arquitectura de automatización multiplataforma y cómo logramos integrar todas estas herramientas en un flujo de Integración Continua (CI/CD) utilizando GitHub Actions.*

---

## 4.1 Arquitectura de la Suite Automatizada

Para asegurar la calidad sin depender de pruebas manuales, hemos construido un ecosistema de automatización compuesto por 4 pilares tecnológicos, cada uno especializado en un nivel de la aplicación:

### Pilar 1: API y Lógica de Negocio Backend (Jest + Supertest)
*   **Enfoque:** Pruebas Unitarias, Integración y Seguridad.
*   **Justificación:** Utilizamos `Jest` como Test Runner debido a su excelente ecosistema de mocks y velocidad de ejecución. Lo combinamos con `Supertest` para levantar instancias temporales de Express y lanzar peticiones HTTP automatizadas contra nuestros endpoints, evaluando códigos de estado (200, 400, 401) y payloads JSON en milisegundos.

### Pilar 2: Interfaz de Usuario Simulada (Vitest + React Testing Library)
*   **Enfoque:** Pruebas de Componente UI (Caja Negra).
*   **Justificación:** Validar botones, validaciones de formularios y renderizado es lento si siempre se abre un navegador. Con `Vitest` simulamos el DOM interactivo en Node.js (jsdom). Esto nos permite hacer *click* virtual en botones y comprobar, por ejemplo, que aparezca un mensaje de error si se deja la nota de una tarea vacía, en una fracción del tiempo de una prueba E2E.

### Pilar 3: Automatización E2E en Navegador (Playwright)
*   **Enfoque:** Pruebas de Sistema y Aceptación End-to-End.
*   **Justificación:** Para los flujos críticos del usuario real, elegimos `Playwright`. A diferencia de Selenium, Playwright nos permite interactuar profundamente con el navegador interceptando red y subiendo archivos al sistema operativo de forma nativa (`setInputFiles`). Los bots simulan a un profesor iniciando sesión, navegando y calificando tareas visualmente.

### Pilar 4: Rendimiento y Estrés (Artillery)
*   **Enfoque:** Pruebas No Funcionales.
*   **Justificación:** Las pruebas funcionales no garantizan que el servidor soporte tráfico masivo. Escribimos *scenarios* en YAML para `Artillery`, lanzando baterías de pruebas de carga (Ej. 200 alumnos entregando una tarea simultáneamente a las 11:59 PM) para estresar el *Event Loop* de Node.js y la Base de Datos.

---

## 4.2 Evidencia de Ejecución

Todos los scripts están empaquetados en el `package.json`. La ejecución está estandarizada mediante comandos de NPM que agrupan las baterías de pruebas:

*   `npm run test:unit` -> Ejecuta la batería de Caja Blanca de Jest.
*   `npm run test:ui` -> Lanza el Virtual DOM de Vitest.
*   `npm run test:e2e` -> Levanta los *Workers* de Chromium vía Playwright.
*   `npm run test:load` -> Lanza el CLI de Artillery contra el servidor local.

*Tip para la exposición: Cuando hables de "Evidencia de ejecución", muestra la terminal o el dashboard de GitHub Actions donde se vean los *checks* en color verde.*

---

## 4.3 Integración a un Pipeline CI/CD (GitHub Actions)
**(Punto clave valorado en la rúbrica)**

El verdadero poder de nuestra suite es que **nadie tiene que ejecutar las pruebas manualmente**. Hemos implementado un flujo de Integración Continua (CI) en el archivo `.github/workflows/ci-main.yml`. 

Cada vez que un desarrollador hace un `git push` o un `Pull Request` hacia la rama `main`, los servidores de GitHub levantan un entorno aislado (Ubuntu) y ejecutan el siguiente pipeline automáticamente:

1.  **Job 1: Análisis Estático (Linting):** Ejecuta ESLint y el chequeo de tipos de TypeScript. Si el código tiene malas prácticas, el build se rompe inmediatamente y no se gasta tiempo en correr pruebas funcionales.
2.  **Job 2: Backend Tests:** Levanta un contenedor Docker con PostgreSQL (`nexus_test`), inyecta los datos semilla (Seeds) y ejecuta la suite pesada de `Jest` (Unitarias, Integración, Seguridad OWASP). Si hay un fallo lógico, el código es rechazado.
3.  **Job 3: Frontend Tests:** En paralelo, otro servidor ejecuta las validaciones del Virtual DOM de React con `Vitest`.
4.  **Job 4: Pruebas E2E (Playwright):** Si el backend y frontend pasan, se despliega la aplicación completa dentro del servidor de GitHub, y los bots de Playwright navegan por ella verificando flujos de la vida real.

**Conclusión del CI/CD:**
Esta automatización previene que el equipo fusione código defectuoso (*Broken Builds*) a la rama principal. Si un Pull Request pasa los 4 Jobs exitosamente, recibe un "Check Verde" y está listo para Continuous Deployment (CD). Esto asegura calidad empresarial desde la primera línea de código.
