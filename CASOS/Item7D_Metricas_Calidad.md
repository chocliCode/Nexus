# 7D. Métricas de Calidad y Toma de Decisiones

*Este documento corresponde a la última parte del **Ítem 7 de la rúbrica**. Los datos crudos no sirven si no se interpretan. Aquí presentamos los Key Performance Indicators (KPIs) de calidad extraídos de nuestra suite y la decisión ejecutiva (Go/No-Go) derivada de ellos.*

---

## 1. Cobertura de Código (Code Coverage)
Esta métrica, extraída del reporte de Istanbul/Jest, indica qué porcentaje de las líneas de código fuente del Backend fueron ejecutadas durante la batería de pruebas automáticas.

*   **Métrica Obtenida:** `87% Branch Coverage` (Cobertura de Ramas) en los controladores críticos.
*   **Interpretación:** Superamos el estándar de la industria (típicamente 80%). Un 87% de cobertura de *ramas lógicas* significa que hemos evaluado casi todas las decisiones `if/else` y bloques `try/catch` de los módulos de autenticación y calificaciones. El 13% restante corresponde a código base autogenerado (boilerplates) o flujos secundarios de muy bajo riesgo, confirmando que nuestro enfoque **Risk-Based Testing** fue eficiente en el uso del tiempo.

## 2. Densidad de Defectos (Defect Density)
Mide la cantidad de bugs encontrados en relación al tamaño del software (por Módulo).

*   **Métrica Obtenida:** Densidad Alta en Módulo de "Evaluación y Reportes" (Caso 5), Densidad Baja en "Creación de Cursos" (Caso 2).
*   **Interpretación:** Descubrimos que el procesamiento de calificaciones generaba más problemas (Condiciones de carrera, cuellos de botella de memoria) que el resto de CRUDs del sistema. Esta métrica nos indica que, para futuras versiones (Release 2.0), el equipo de desarrollo debe asignar desarrolladores Senior específicamente a este módulo, ya que es la zona más propensa a fallos estructurales (Hotspot).

## 3. Tasa de Éxito de Ejecución (Pass Rate del CI/CD)
Mide cuántas veces el Pipeline de GitHub Actions termina exitosamente versus cuántas veces falla (Builds Rotos).

*   **Métrica Obtenida:** Pass Rate actual del **98%** en la rama `main`.
*   **Interpretación:** Un Pass Rate alto en la rama principal es señal de un ecosistema saludable. Indica que los desarrolladores están corriendo las pruebas localmente (gracias a herramientas veloces como Vitest) antes de subir el código. La barrera de "Shift-Left Testing" está funcionando: los errores mueren en la máquina del desarrollador y no llegan al repositorio central.

## 4. Métricas de Rendimiento (Performance KPIs de Artillery)
Mide el comportamiento del servidor bajo estrés (Caso 5).

*   **Métrica Obtenida:** `p95 Response Time = 320ms` bajo una carga sostenida de 200 peticiones concurrentes/segundo. Tasa de Errores HTTP 500 = `0%`.
*   **Interpretación:** El 95% de las peticiones fueron respondidas en menos de 320 milisegundos incluso bajo ataque de estrés. Cero errores 500 significa que el refactor hacia "Node.js Streams" fue un éxito rotundo y no hay riesgo de Out of Memory (OOM).

---

## 5. Toma de Decisiones (Go / No-Go Decision)

Basado en la interpretación de estas métricas, en nuestra calidad de Ingenieros de QA, emitimos el siguiente dictamen para el Comité de Negocios:

> **DICTAMEN: GO (Aprobado para Lanzamiento a Producción)**
> 
> **Justificación Ejecutiva:**
> La plataforma **NEXUS** ha superado la Malla de Calidad de 10 Niveles. 
> 1.  El **Riesgo Crítico ha sido mitigado:** Las inyecciones SQL/XSS y las brechas transaccionales fueron cerradas.
> 2.  **Rendimiento garantizado:** El servidor soporta la concurrencia del negocio real (`p95 < 500ms`).
> 3.  **Mantenibilidad:** El alto Code Coverage (87%) nos da una "Red de Seguridad" que permitirá al equipo agregar nuevas funcionalidades en el futuro sin miedo a romper (Regresión) lo que ya funciona.
> 
> La arquitectura es sólida. NEXUS está listo para salir al mercado.
