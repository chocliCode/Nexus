const fs = require('fs');
const path = require('path');

function getTechExplanation(desc, tech, fileName) {
    desc = desc.toLowerCase();
    fileName = fileName ? fileName.toLowerCase() : '';

    if (desc.includes('health') || desc.includes('endpoint') || fileName.includes('smoke') || desc.includes('header')) {
        return "Hace una revisión rápida de las conexiones principales del sistema para asegurar que la comunicación entre el usuario y nuestros servidores funciona sin problemas.";
    } else if (desc.includes('login') || desc.includes('sesion') || desc.includes('auth') || fileName.includes('auth')) {
        return "Revisa los candados de seguridad simulando intentos de ingreso (correctos e incorrectos) para confirmar que el sistema reconoce quién puede entrar y quién no.";
    } else if (desc.includes('registro') || desc.includes('usuario')) {
        return "Verifica todo el proceso por el cual un cliente nuevo se inscribe, comprobando que sus datos se guarden correctamente sin errores en el sistema.";
    } else if (desc.includes('okr') || desc.includes('vacante') || desc.includes('dashboard')) {
        return "Comprueba que las funciones principales del producto (como ver gráficas o buscar información) operen correctamente y muestren datos precisos al usuario.";
    } else if (desc.includes('load') || desc.includes('spike') || desc.includes('scenario') || fileName.includes('load')) {
        return "Simula la entrada masiva de miles de usuarios al mismo tiempo para medir si los servidores soportan la presión sin ponerse lentos o apagarse.";
    } else if (desc.includes('stress') || desc.includes('agotamiento') || desc.includes('quiebre')) {
        return "Lleva el sistema a su límite extremo intencionalmente para ver cómo reacciona ante emergencias y comprobar si es capaz de recuperarse por sí solo.";
    } else if (desc.includes('e2e') || desc.includes('pagina') || desc.includes('navega')) {
        return "Imita el comportamiento de un ser humano real navegando por la aplicación (haciendo clics, llenando formularios) para confirmar que todo fluya correctamente.";
    } else if (fileName.includes('extra.test.tsx') || desc.includes('render') || desc.includes('visible') || desc.includes('text') || desc.includes('id') || desc.includes('tag')) {
        return "Verifica de forma automática que los botones, textos y ventanas visuales aparezcan correctamente en la pantalla del dispositivo sin errores gráficos.";
    } else if (desc.includes('sql') || desc.includes('xss') || desc.includes('jwt') || fileName.includes('security')) {
        return "Simula ataques cibernéticos enviados por hackers (con virus o trampas en el texto) para confirmar que nuestras barreras defensivas los bloquean.";
    } else {
        return "Ejecuta una verificación automática para confirmar que esta pequeña pieza de la aplicación cumpla su tarea de forma exacta, tal como fue diseñada.";
    }
}

function getBizJustification(desc, tech, fileName) {
    desc = desc.toLowerCase();
    fileName = fileName ? fileName.toLowerCase() : '';

    if (desc.includes('health') || desc.includes('endpoint') || fileName.includes('smoke') || desc.includes('header')) {
        return "Funciona como una alarma temprana. Nos asegura que el sistema está 'vivo' y disponible para que ningún cliente se quede sin servicio de imprevisto.";
    } else if (desc.includes('login') || desc.includes('sesion') || desc.includes('auth') || fileName.includes('auth')) {
        return "Protege la privacidad de los usuarios, asegurando que nadie pueda robar información confidencial ni entrar a cuentas que no le pertenecen.";
    } else if (desc.includes('registro') || desc.includes('usuario')) {
        return "Garantiza que no perdamos clientes nuevos por culpa de errores técnicos durante su primer contacto, ayudando directamente al crecimiento del negocio.";
    } else if (desc.includes('okr') || desc.includes('vacante') || desc.includes('dashboard')) {
        return "Asegura que el producto entregue el valor prometido al cliente. Si esta función falla, los clientes dejarán de pagar por la plataforma.";
    } else if (desc.includes('load') || desc.includes('spike') || desc.includes('scenario') || fileName.includes('load')) {
        return "Asegura que en días de alta demanda comercial (como campañas publicitarias) la plataforma no colapse, protegiendo las ventas y la reputación de la empresa.";
    } else if (desc.includes('stress') || desc.includes('agotamiento') || desc.includes('quiebre')) {
        return "Protege al negocio de apagones totales prolongados, evitando pérdidas económicas gigantescas y cuidando la confianza a largo plazo de nuestros inversores.";
    } else if (desc.includes('e2e') || desc.includes('pagina') || desc.includes('navega')) {
        return "Evita que los usuarios se sientan frustrados. Una experiencia de navegación perfecta es clave para que los clientes recomienden nuestra aplicación.";
    } else if (fileName.includes('extra.test.tsx') || desc.includes('render') || desc.includes('visible') || desc.includes('text') || desc.includes('id') || desc.includes('tag')) {
        return "Garantiza que la aplicación se vea muy profesional, evitando que un diseño roto genere desconfianza visual y provoque que los usuarios abandonen el sitio.";
    } else if (desc.includes('sql') || desc.includes('xss') || desc.includes('jwt') || fileName.includes('security')) {
        return "Evita demandas legales multimillonarias, extorsiones por robo de bases de datos y la destrucción absoluta de la reputación pública de la empresa.";
    } else {
        return "Previene que pequeños defectos internos lleguen al cliente final, ahorrando a la empresa los enormes costos de reparar software una vez que ya está público.";
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
                const tech = item.tecnica || '';
                // Since our chunks don't have the filename directly linked, we will deduce from the description as best as possible.
                // Or if there's a file context we could pass it. The chunk array doesn't have filename.
                item.explicacion_tecnica = getTechExplanation(desc, tech, desc); // Pass desc as filename heuristic for extra/smoke scenarios
                item.justificacion_negocio = getBizJustification(desc, tech, desc);
            }
            fs.writeFileSync(outputFile, JSON.stringify(data, null, 2), 'utf-8');
            console.log('Enriched (Business Friendly) ' + inputFile + ' -> ' + outputFile);
        }
    }
}

enrichData();
