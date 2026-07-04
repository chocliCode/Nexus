const fs = require('fs');
const path = require('path');

function getTechExplanation(desc, tech) {
    desc = desc.toLowerCase();
    if (desc.includes('health') || desc.includes('endpoint')) {
        return `Verifica la respuesta HTTP del endpoint mediante ${tech}. Evalúa los códigos de estado y latencia de red asegurando que la infraestructura base del servicio opere correctamente sin interrupciones.`;
    } else if (desc.includes('login') || desc.includes('sesion') || desc.includes('auth')) {
        return `Analiza flujos de autenticación usando ${tech}. Valida tokens JWT, cifrado bcrypt de contraseñas y manejo de sesiones HTTP para garantizar el control de acceso seguro y evitar intrusiones.`;
    } else if (desc.includes('registro') || desc.includes('usuario')) {
        return `Ejecuta operaciones CRUD de usuarios mediante ${tech}. Verifica validaciones en frontend y backend, inserción en base de datos y manejo correcto de estados HTTP en los endpoints correspondientes.`;
    } else if (desc.includes('okr')) {
        return `Valida la persistencia de datos y lógica de OKRs con ${tech}. Comprueba actualizaciones transaccionales en la base de datos, garantizando integridad referencial y correcta serialización de payloads JSON.`;
    } else if (desc.includes('vacante')) {
        return `Examina el sistema de vacantes usando ${tech}. Verifica consultas SQL complejas, índices de búsqueda y paginación de resultados, asegurando tiempos de respuesta óptimos bajo alta carga de peticiones.`;
    } else if (desc.includes('dashboard') || desc.includes('estadisticas')) {
        return `Prueba la agregación de datos para el dashboard mediante ${tech}. Evalúa el rendimiento de consultas analíticas y la correcta representación de métricas procesadas en el frontend interactivo.`;
    } else if (desc.includes('load') || desc.includes('spike') || desc.includes('concurrente') || desc.includes('frecuencia')) {
        return `Ejecuta pruebas de carga y concurrencia empleando ${tech}. Simula múltiples hilos virtuales para saturar el pool de conexiones y evaluar la latencia y rendimiento del servidor bajo presión.`;
    } else if (desc.includes('stress') || desc.includes('agotamiento') || desc.includes('quiebre') || desc.includes('saturacion') || desc.includes('cascada')) {
        return `Realiza pruebas de estrés al límite utilizando ${tech}. Induce fallos deliberados para observar mecanismos de recuperación, time-outs y manejo de cuellos de botella en la arquitectura distribuida.`;
    } else if (desc.includes('e2e') || desc.includes('pagina') || desc.includes('navega')) {
        return `Simula la interacción del usuario final mediante automatización E2E (${tech}). Interactúa con el DOM, valida rutas del lado del cliente y asegura la carga de recursos estáticos correctamente.`;
    } else if (desc.includes('test') && (desc.includes('html') || desc.includes('viewport') || desc.includes('meta') || desc.includes('title'))) {
        return `Verifica la estructura y semántica del documento usando ${tech}. Analiza etiquetas HTML, propiedades del DOM y configuración inicial del viewport vitales para la renderización y accesibilidad del sitio web.`;
    } else {
        return `Ejecuta la validación del escenario descrito aplicando ${tech}. Aserciona los flujos de ejecución de código, verifica la consistencia del estado interno y asegura el cumplimiento estricto del contrato técnico.`;
    }
}

function getBizJustification(desc, tech) {
    desc = desc.toLowerCase();
    if (desc.includes('health') || desc.includes('endpoint')) {
        return "Garantiza la disponibilidad continua de la plataforma para los clientes. Previene interrupciones prolongadas que pueden generar pérdidas financieras, dañar la reputación y afectar los SLAs.";
    } else if (desc.includes('login') || desc.includes('sesion') || desc.includes('auth')) {
        return "Asegura la protección de datos confidenciales del cliente. Mitiga riesgos legales y financieros asociados con brechas de seguridad y asegura el cumplimiento de normativas de privacidad.";
    } else if (desc.includes('registro') || desc.includes('usuario')) {
        return "Facilita la adquisición de nuevos usuarios sin fricciones. Un proceso de registro robusto maximiza la tasa de conversión, impulsa el crecimiento y mejora la primera impresión.";
    } else if (desc.includes('okr')) {
        return "Permite a los usuarios gestionar sus objetivos estratégicos. Asegura la fiabilidad de las herramientas principales de la plataforma, impactando directamente en la retención y satisfacción.";
    } else if (desc.includes('vacante')) {
        return "Soporta el modelo de negocio central de reclutamiento. Un sistema de búsqueda rápido conecta talento con empresas, generando valor directo e incrementando monetización.";
    } else if (desc.includes('dashboard') || desc.includes('estadisticas')) {
        return "Proporciona visibilidad a tomadores de decisiones. Información precisa en el dashboard incrementa el valor percibido del software y fomenta renovaciones de contratos.";
    } else if (desc.includes('load') || desc.includes('spike') || desc.includes('concurrente') || desc.includes('frecuencia')) {
        return "Asegura que el sistema soporte picos de tráfico comercial. Previene caídas durante campañas de marketing importantes, garantizando una experiencia de usuario fluida y constante.";
    } else if (desc.includes('stress') || desc.includes('agotamiento') || desc.includes('quiebre') || desc.includes('saturacion') || desc.includes('cascada')) {
        return "Previene interrupciones catastróficas bajo condiciones extremas. Garantiza la resiliencia operativa y la recuperación rápida de la plataforma ante incidentes de infraestructura crítica.";
    } else if (desc.includes('e2e') || desc.includes('pagina') || desc.includes('navega')) {
        return "Garantiza un recorrido de usuario fluido y sin errores de inicio a fin. Crucial para mantener altas tasas de retención y asegurar una excelente experiencia de cliente.";
    } else if (desc.includes('test') && (desc.includes('html') || desc.includes('viewport') || desc.includes('meta') || desc.includes('title'))) {
        return "Asegura la accesibilidad y el posicionamiento SEO del producto. Atraer más tráfico orgánico y permitir que usuarios con diversas necesidades utilicen el servicio sin problemas.";
    } else {
        return "Mantiene la calidad general del producto de software. Su correcta ejecución previene defectos en producción que costarían tiempo valioso y afectarían negativamente la confianza del cliente.";
    }
}

async function enrichData() {
    for (let i = 1; i <= 4; i++) {
        const inputFile = path.join(__dirname, 'chunk_' + i + '.json');
        const outputFile = path.join(__dirname, 'chunk_' + i + '_enriched.json');
        
        if (fs.existsSync(inputFile)) {
            const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));
            for (const item of data) {
                const desc = item.desc || '';
                const tech = item.tecnica || 'Testing Framework';
                item.explicacion_tecnica = getTechExplanation(desc, tech);
                item.justificacion_negocio = getBizJustification(desc, tech);
            }
            fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
            console.log('Enriched ' + inputFile + ' -> ' + outputFile);
        }
    }
}

enrichData();
