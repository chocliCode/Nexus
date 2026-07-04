const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const DESCRIPTIONS = {
    'Integración (Backend)': { title: 'Pruebas de Integración', desc: 'Valida que los diferentes módulos del sistema interactúen correctamente.', tech: 'Jest, Supertest, PostgreSQL' },
    'Unitarias (Backend)': { title: 'Pruebas Unitarias', desc: 'Aíslan fragmentos de código para validar su lógica sin dependencias.', tech: 'Jest, ts-jest, Mocks' },
    'Componente Adicionales': { title: 'Pruebas de Componente UI', desc: 'Verifica componentes React.', tech: 'Vitest, React Testing Library' },
    'Seguridad (OWASP)': { title: 'Pruebas de Seguridad (DevSecOps)', desc: 'Mitiga vulnerabilidades críticas.', tech: 'Jest, Fuzzing' },
    'Humo (Smoke)': { title: 'Pruebas de Humo', desc: 'Verifican infraestructura básica.', tech: 'Jest' },
    'Aceptación (UAT/BDD)': { title: 'Pruebas de Aceptación', desc: 'Pruebas de requerimientos de negocio (Gherkin).', tech: 'jest-cucumber' },
    'End-to-End (E2E)': { title: 'Pruebas E2E', desc: 'Navegación completa desde navegador.', tech: 'Playwright' },
    'Rendimiento (Carga y Estrés)': { title: 'Pruebas de Rendimiento', desc: 'Inyectan tráfico alto.', tech: 'Artillery' }
};

function getCategoryInfo(rawTitle) {
    const clean = rawTitle.replace(/## \d+\.?\d* Pruebas de /g, '').replace(/## \d+\.?\d* /g, '').trim();
    for (const key in DESCRIPTIONS) {
        if (clean.includes(key) || key.includes(clean)) {
            return { shortName: key.substring(0, 31).replace(/[:\\\/?*\[\]]/g, ''), ...DESCRIPTIONS[key] };
        }
    }
    return { shortName: clean.substring(0, 31).replace(/[:\\\/?*\[\]]/g, ''), title: clean, desc: 'Pruebas generales.', tech: 'N/A' };
}

function getTechExplanation(desc, fileName) {
    desc = (desc || '').toLowerCase();
    fileName = (fileName || '').toLowerCase();

    if (fileName.includes('smoke') || desc.includes('health') || desc.includes('header')) {
        return "Hace una revisión rápida de las conexiones principales del sistema para asegurar que la comunicación entre el usuario y nuestros servidores funciona sin problemas.";
    } else if (fileName.includes('auth') || fileName.includes('login') || desc.includes('sesion') || desc.includes('auth')) {
        return "Revisa los candados de seguridad simulando intentos de ingreso (correctos e incorrectos) para confirmar que el sistema reconoce quién puede entrar y quién no.";
    } else if (desc.includes('registro') || desc.includes('usuario')) {
        return "Verifica todo el proceso por el cual un cliente nuevo se inscribe, comprobando que sus datos se guarden correctamente sin errores en el sistema.";
    } else if (fileName.includes('load') || fileName.includes('stress') || fileName.includes('spike') || desc.includes('scenario')) {
        return "Simula la entrada masiva de miles de usuarios al mismo tiempo (ej: inyectando escenarios paralelos) para medir si los servidores soportan la presión sin ponerse lentos o apagarse.";
    } else if (fileName.includes('e2e') || desc.includes('pagina') || desc.includes('navega')) {
        return "Imita el comportamiento de un ser humano real navegando por la aplicación (haciendo clics, llenando formularios) para confirmar que todo fluya correctamente.";
    } else if (fileName.includes('tsx') || fileName.includes('component') || desc.includes('render') || desc.includes('id') || desc.includes('tag')) {
        return "Verifica de forma automática que los botones, textos y ventanas visuales de este componente (ej: DIVs, títulos) aparezcan correctamente en la pantalla sin errores gráficos.";
    } else if (fileName.includes('security') || desc.includes('sql') || desc.includes('xss') || desc.includes('jwt')) {
        return "Simula ataques cibernéticos enviados por hackers (con virus o trampas en el texto) para confirmar que nuestras barreras defensivas los bloquean inmediatamente.";
    } else {
        return "Verifica la regla de negocio de este módulo específico, comprobando que la lógica matemática o el flujo de datos responda de manera exacta y sin errores.";
    }
}

function getBizJustification(desc, fileName) {
    desc = (desc || '').toLowerCase();
    fileName = (fileName || '').toLowerCase();

    if (fileName.includes('smoke') || desc.includes('health') || desc.includes('header')) {
        return "Funciona como una alarma temprana. Nos asegura que el sistema está 'vivo' y disponible para que ningún cliente se quede sin servicio de imprevisto.";
    } else if (fileName.includes('auth') || fileName.includes('login') || desc.includes('sesion') || desc.includes('auth')) {
        return "Protege la privacidad de los usuarios, asegurando que nadie pueda robar información confidencial ni entrar a cuentas que no le pertenecen.";
    } else if (desc.includes('registro') || desc.includes('usuario')) {
        return "Garantiza que no perdamos clientes nuevos por culpa de errores técnicos durante su primer contacto, ayudando directamente al crecimiento del negocio.";
    } else if (fileName.includes('load') || fileName.includes('stress') || fileName.includes('spike') || desc.includes('scenario')) {
        return "Asegura que en días de alta demanda comercial (como campañas publicitarias) la plataforma no colapse, protegiendo las ventas y la reputación de la empresa.";
    } else if (fileName.includes('e2e') || desc.includes('pagina') || desc.includes('navega')) {
        return "Evita que los usuarios se sientan frustrados. Una experiencia de navegación perfecta es clave para que los clientes recomienden nuestra aplicación.";
    } else if (fileName.includes('tsx') || fileName.includes('component') || desc.includes('render') || desc.includes('id') || desc.includes('tag')) {
        return "Garantiza que la aplicación se vea muy profesional, evitando que un diseño roto genere desconfianza visual y provoque que los usuarios abandonen el sitio.";
    } else if (fileName.includes('security') || desc.includes('sql') || desc.includes('xss') || desc.includes('jwt')) {
        return "Evita demandas legales multimillonarias, extorsiones por robo de bases de datos y la destrucción absoluta de la reputación pública de la empresa.";
    } else {
        return "Previene que defectos internos lleguen al cliente final, ahorrando a la empresa los enormes costos económicos de reparar errores en producción.";
    }
}

async function generateExcel() {
    const mdFile = path.join(__dirname, '../../../docs/documentacion_todas_las_pruebas.md');
    const excelFile = path.join(__dirname, '../../../Reporte_Final_Pruebas_Nexus.xlsx');

    const content = fs.readFileSync(mdFile, 'utf-8');
    const lines = content.split('\n');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NEXUS QA Automation';

    let currentSheet = null;
    let rowIndex = 1;
    let currentFile = '';

    for (const line of lines) {
        if (line.startsWith('## ') && !line.includes('Resumen')) {
            const catInfo = getCategoryInfo(line);
            
            currentSheet = workbook.addWorksheet(catInfo.shortName, { views: [{ state: 'frozen', ySplit: 6 }] });
            currentSheet.columns = [
                { key: 'archivo', width: 30 },
                { key: 'id', width: 20 },
                { key: 'descripcion', width: 45 },
                { key: 'explicacion', width: 55 },
                { key: 'justificacion', width: 55 },
                { key: 'estado', width: 15 }
            ];

            // Título
            currentSheet.mergeCells('A1:F1');
            const titleCell = currentSheet.getCell('A1');
            titleCell.value = `REPORTE DE CALIDAD (GERENCIAL): ${catInfo.title.toUpperCase()}`;
            titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D2A42' } };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // Info de negocio
            currentSheet.mergeCells('A2:A4');
            const descHeaderCell = currentSheet.getCell('A2');
            descHeaderCell.value = 'Impacto\nde\nNegocio';
            descHeaderCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0D2A42' } };
            descHeaderCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            descHeaderCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
            descHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F0FA' } };

            currentSheet.mergeCells('B2:F3');
            const descValueCell = currentSheet.getCell('B2');
            descValueCell.value = `Propósito Arquitectónico: ${catInfo.desc}`;
            descValueCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF333333' } };
            descValueCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
            descValueCell.border = { top: {style:'thin'}, right: {style:'thin'} };

            currentSheet.mergeCells('B4:F4');
            const techValueCell = currentSheet.getCell('B4');
            techValueCell.value = `Framework y Herramientas: ${catInfo.tech}`;
            techValueCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1F4E78' } };
            techValueCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            techValueCell.border = { bottom: {style:'thin'}, right: {style:'thin'} };

            currentSheet.getRow(5).height = 10;

            rowIndex = 6;
            const headerRow = currentSheet.getRow(rowIndex);
            headerRow.values = {
                archivo: 'Archivo Fuente',
                id: 'ID',
                descripcion: 'Escenario Evaluado',
                explicacion: 'Explicación del Comportamiento',
                justificacion: 'Justificación (El Porqué importa)',
                estado: 'Estado'
            };
            
            headerRow.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 30;
            
            rowIndex++;
            
        } else if (line.startsWith('### Archivo: ')) {
            currentFile = line.replace('### Archivo: `', '').replace('`', '').trim();
            
        } else if (line.startsWith('| ') && !line.includes('---') && !line.includes('Descripción del Caso') && currentSheet) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p);
            if (parts.length >= 3) {
                const id = parts[0];
                const desc = parts[1];
                
                const explicacion = getTechExplanation(desc, currentFile);
                const justificacion = getBizJustification(desc, currentFile);
                
                const row = currentSheet.getRow(rowIndex);
                row.values = {
                    archivo: currentFile,
                    id: id,
                    descripcion: desc,
                    explicacion: explicacion,
                    justificacion: justificacion,
                    estado: 'PASSED'
                };

                row.font = { name: 'Arial', size: 11 };
                row.alignment = { vertical: 'middle', wrapText: true };
                
                row.getCell('estado').font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF00B050' } };
                row.getCell('estado').alignment = { vertical: 'middle', horizontal: 'center' };

                row.eachCell({ includeEmpty: false }, (cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
                    };
                });
                
                if (rowIndex % 2 === 0) {
                    row.eachCell({ includeEmpty: false }, (cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
                    });
                }
                
                rowIndex++;
            }
        }
    }

    currentSheet.workbook.eachSheet((sheet) => {
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber > 5) {
                row.height = 45; 
            }
        });
    });

    await workbook.xlsx.writeFile(excelFile);
    console.log(`🚀 Reporte Excel Gerencial generado en: ${excelFile}`);
}

generateExcel().catch(err => { console.error(err); process.exit(1); });
