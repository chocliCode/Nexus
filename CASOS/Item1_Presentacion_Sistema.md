# 1. Presentación del Sistema y Alcance del Proyecto

*Este documento corresponde al **Ítem 1 de la rúbrica** y está diseñado para darte toda la información teórica y descriptiva que necesitas para la primera parte de tu exposición. Contiene información extensa para que puedas seleccionar las partes que mejor se adapten a tu estilo de presentación.*

---

## 1.1 Nombre del Sistema
**NEXUS** - Plataforma de Gestión Educativa Gamificada y Entorno Virtual de Aprendizaje (LMS - Learning Management System).

## 1.2 Objetivo del Sistema

### Objetivo General
Desarrollar y desplegar una plataforma educativa integral, escalable y segura que centralice la gestión de aulas virtuales, asignación de tareas, seguimiento de calificaciones y comunicación entre docentes y alumnos. **NEXUS** busca eliminar la fragmentación de herramientas en la educación tradicional, proporcionando un entorno unificado que fomente el compromiso del estudiante mediante mecánicas modernas (roles gamificados) y provea al docente de herramientas robustas de evaluación y reportería.

### Objetivos Específicos (Técnicos y de Negocio)
1. **Unificación de Flujos:** Proveer un solo canal para la publicación de material, recepción de tareas (PDFs, imágenes) y emisión de calificaciones (CSV).
2. **Seguridad y Confianza (Cero Fugas):** Garantizar la privacidad de los datos de los estudiantes y docentes mediante encriptación fuerte, mitigación de ataques OWASP (XSS, SQLi, CSV Injection) y un sólido sistema de control de acceso basado en roles (RBAC).
3. **Alta Disponibilidad:** Soportar la concurrencia masiva (ej. entregas a las 11:59 PM) sin degradación del servicio, apoyado en bases de datos relacionales con propiedades ACID.

---

## 1.3 Perfiles de Usuarios (Actores del Sistema)

Para fomentar el *engagement* y diferenciar nuestra plataforma de LMS tradicionales (como Moodle o Canvas), NEXUS implementa un sistema de nombres gamificados para sus roles, cada uno con una estricta jerarquía de permisos:

1. **El Padawan (Estudiante):**
   *   **Perfil:** Usuario final que consume el contenido educativo.
   *   **Permisos:** Puede visualizar el feed del curso (Muro), comentar en publicaciones, descargar materiales y enviar entregables (archivos PDF).
   *   **Restricciones:** No puede ver entregas de otros alumnos, no puede borrar publicaciones del muro, no puede auto-calificarse.
2. **El Mentor (Profesor / Asistente de Enseñanza):**
   *   **Perfil:** Gestor operativo del aula virtual.
   *   **Permisos:** Puede crear anuncios y tareas, visualizar la lista de estudiantes inscritos, descargar las resoluciones de los Padawans y emitir calificaciones. Puede exportar los registros a CSV.
3. **El Jedi (Administrador / Dueño del Curso):**
   *   **Perfil:** Administrador general o creador del contenido del curso.
   *   **Permisos:** Posee control total sobre el ciclo de vida del curso. Puede crear y eliminar cursos enteros, asignar Mentores, abrir/cerrar matrículas y auditar todo el proceso educativo.

---

## 1.4 Funcionalidades Principales del Sistema

El alcance funcional de NEXUS se divide en 5 módulos core, los cuales representan el ciclo de vida completo de la educación virtual:

1. **Módulo de Identidad y Seguridad (Auth):**
   *   Registro y Autenticación de usuarios mediante JWT (JSON Web Tokens).
   *   Protección contra fuerza bruta y encriptación de contraseñas usando Bcrypt.
2. **Módulo de Gestión Académica (Cursos):**
   *   Creación (CRUD) de Cursos y configuración de metadatos (Título, descripción, portada).
   *   Sistema de matrícula y validación de cupos.
3. **Módulo de Aula Virtual (El Muro / Feed):**
   *   Publicación de Anuncios, Tareas y Material de lectura interactivo.
   *   Motor de comentarios en tiempo real anidado por publicación.
4. **Módulo de Entregables (Subida de Archivos):**
   *   Motor de procesamiento de archivos (Multipart/form-data) que permite a los estudiantes adjuntar resoluciones en PDF.
   *   Filtros de validación de extensiones (Mime Types) y límites de peso para evitar saturación del servidor (Zip Bombs).
5. **Módulo de Evaluación y Reportería (Calificaciones):**
   *   Panel interactivo para que el Mentor asigne calificaciones numéricas y retroalimentación en texto a cada entrega.
   *   Motor de exportación de base de datos a formato de hoja de cálculo (CSV) protegido contra inyección de fórmulas.

---

## 1.5 Evolución respecto a la Semana 7 (El Gran Salto de Calidad)

*Si el profesor pregunta: "¿Qué le han agregado al proyecto desde la entrega de la mitad del ciclo (Semana 7)?" Aquí tienes la respuesta para impresionarlo.*

La propuesta de la **Semana 7** fue un prototipo funcional ("Happy Path"). Teníamos la idea del negocio, pantallas básicas y endpoints que funcionaban cuando el usuario hacía todo perfecto. 

Sin embargo, para llegar al **Proyecto Integrador Final de la Semana 15**, el sistema evolucionó de un "prototipo escolar" a un **Software de Grado Empresarial**. La evolución se dio en 3 grandes pilares exigidos por la ingeniería de pruebas moderna:

### A. Madurez en Seguridad (DevSecOps - Unidad IV)
En la semana 7 no validábamos a profundidad qué enviaba el usuario. Hoy, NEXUS cuenta con un "Escudo Zod" (Análisis Estático) que valida cada byte que ingresa al sistema. Hemos parcheado vulnerabilidades graves de las que no éramos conscientes en la semana 7:
*   Bloqueamos inyecciones SQL en el Login.
*   Implementamos validación de "Magic Bytes" en la subida de PDFs para evitar que nos inyecten Malware oculto.
*   Sanitizamos la entrada del Muro Virtual para evitar ataques XSS que roben las sesiones de los profesores.

### B. Consistencia de Datos (Transacciones ACID)
En el prototipo anterior, si dos profesores calificaban al mismo tiempo, la base de datos podía corromperse (Condición de Carrera). Hoy, la arquitectura de NEXUS maneja **Bloqueos a Nivel de Fila (Row-Level Locks)** en PostgreSQL. Si ocurre un fallo en medio de la creación de un curso, el sistema ejecuta un `ROLLBACK` automático, asegurando que la base de datos jamás quede en un estado inconsistente.

### C. Cultura de Calidad Automatizada (El alcance de las Pruebas)
En la semana 7, hacíamos pruebas manuales lentas haciendo clic en la pantalla. Hoy, la evolución más grande del proyecto es nuestra **Malla de Calidad de 10 Niveles**. 
Hemos construido una suite que abarca:
1.  **Caja Blanca (Jest):** Evaluando el Branch Coverage de los controladores.
2.  **Integración Continua:** Pruebas que tocan la Base de Datos.
3.  **Caja Negra (Playwright):** Bots automatizados simulando ser humanos en el navegador.
4.  **Rendimiento (Artillery):** Estrés de la memoria RAM del servidor.

**Conclusión del Alcance:** 
El alcance del proyecto para esta entrega final no fue agregar cientos de botones nuevos a la pantalla, sino tomar los 5 flujos críticos del negocio y **blindarlos bajo estándares internacionales (ISO/IEC 29119 e ISTQB)**, demostrando que Nexus no solo "funciona", sino que es seguro, escalable y resiliente ante ataques y alta demanda.
