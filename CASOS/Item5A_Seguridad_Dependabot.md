# 5A. Análisis de Seguridad: Resolución de Alertas de Dependabot

*Este documento corresponde a la primera parte del **Ítem 5 de la rúbrica (DevSecOps y Seguridad)**. Aquí documentamos específicamente la detección y mitigación de vulnerabilidades en las librerías de terceros, reportadas por **GitHub Dependabot**.*

---

## 1. Contexto de la Herramienta (DevSecOps)
Dentro de nuestra estrategia de **Shift-Left Testing**, habilitamos **GitHub Dependabot** en el repositorio de NEXUS. Su objetivo es escanear automáticamente nuestro archivo `package.json` y `package-lock.json` buscando dependencias (librerías de código abierto) que tengan vulnerabilidades conocidas publicadas en la base de datos CVE (*Common Vulnerabilities and Exposures*).

## 2. Hallazgos Reportados por Dependabot
Durante el ciclo de desarrollo continuo, Dependabot generó alertas de seguridad que amenazaban la integridad del Backend de NEXUS. A continuación, detallamos las vulnerabilidades encontradas y cómo las abordamos:

### 🚨 Alerta 1: Vulnerabilidad Crítica en `jsonwebtoken`
*   **Herramienta:** GitHub Dependabot Alerts
*   **Severidad:** CRÍTICA (Critical)
*   **Descripción del Hallazgo:** Se detectó una versión antigua de la librería `jsonwebtoken` que era vulnerable a falsificación de firmas (Bypass de autenticación). Un atacante podría forjar un token JWT falso y obtener privilegios de Rol "Jedi" (Administrador) sin conocer la clave secreta.
*   **Impacto en NEXUS:** Compromiso total del sistema y acceso a datos sensibles de los estudiantes.
*   **Solución Aplicada:** 
    1. Se revisó el *Pull Request* automático generado por Dependabot.
    2. Se ejecutó el comando de mitigación manual: `npm install jsonwebtoken@latest` para forzar la actualización a un parche seguro.
    3. Se verificó que nuestras pruebas unitarias de Login (`UNIT-LOG-01`) no se rompieran con la nueva versión.

### 🚨 Alerta 2: Vulnerabilidad Media en `multer` (o sus dependencias)
*   **Herramienta:** GitHub Dependabot Alerts
*   **Severidad:** ALTA (High)
*   **Descripción del Hallazgo:** Riesgo de *Denegación de Servicio (DoS)*. Un atacante podría enviar un *payload* de archivo malformado que colapsara la memoria del servidor de Node.js antes de que la subida del PDF se completara.
*   **Impacto en NEXUS:** Si un alumno malicioso explotaba esto, el Aula Virtual se caería y nadie podría entregar tareas (Caso 4 afectado).
*   **Solución Aplicada:**
    1. Ejecutamos un análisis profundo de dependencias: `npm audit`.
    2. Aplicamos la resolución recomendada con `npm audit fix` para parchar los sub-módulos vulnerables de la cadena de dependencias de manejo de archivos.

---

## 3. Estrategia de Prevención (Mantenimiento Continuo)
Para asegurar que estas alertas no se acumulen y generen deuda técnica en producción, implementamos las siguientes reglas en nuestro pipeline:
1.  **Bloqueo de PRs:** Configuramos GitHub para que **bloquee cualquier Pull Request** si Dependabot detecta que se está introduciendo una librería con severidad "Alta" o "Crítica".
2.  **Actualizaciones Automáticas:** Activamos *Dependabot Security Updates*, permitiendo que el bot nos genere PRs automáticos subiendo la versión del `package.json`. Si nuestros tests automatizados de GitHub Actions (Vitest, Jest) pasan en color verde, fusionamos la actualización con confianza.

---

*Nota para la exposición: Con este documento demuestras que el equipo no solo escribe código seguro, sino que gestiona el riesgo de la **Cadena de Suministro de Software (Supply Chain Security)**, un principio fundamental del OWASP Top 10 moderno.*
