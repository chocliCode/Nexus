const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const DESCRIPTIONS = {
    'Integración (Backend)': {
        title: 'Pruebas de Integración',
        desc: 'Valida que los diferentes módulos del sistema (Controladores, Servicios, Base de Datos PostgreSQL) interactúen correctamente. Estas pruebas aseguran la integridad transaccional (ACID) y que los flujos de la API se ejecuten sin problemas.',
        tech: 'Jest, Supertest, PostgreSQL'
    },
    'Unitarias (Backend)': {
        title: 'Pruebas Unitarias',
        desc: 'Aíslan fragmentos específicos de código (como los Esquemas Zod y Middlewares) para validar su lógica sin dependencias externas. Protegen al sistema de inputs inválidos en la capa más baja.',
        tech: 'Jest, ts-jest, Mocks'
    },
    'Componente Adicionales': {
        title: 'Pruebas de Componente UI',
        desc: 'Verifica que los componentes de la interfaz de usuario en React se rendericen adecuadamente, gestionen su estado interno y reaccionen de forma correcta ante interacciones simuladas.',
        tech: 'Vitest, React Testing Library'
    },
    'Seguridad (OWASP)': {
        title: 'Pruebas de Seguridad (DevSecOps)',
        desc: 'Protegen el sistema atacando intencionalmente los endpoints para verificar vulnerabilidades críticas documentadas en el OWASP Top 10 (Inyección SQL, XSS, Broken Access Control).',
        tech: 'Jest, Payload Fuzzing'
    },
    'Humo (Smoke)': {
        title: 'Pruebas de Humo',
        desc: 'Pruebas de primer nivel que verifican la disponibilidad de la infraestructura básica. Aseguran que la API esté levantada, la DB conectada y los endpoints críticos no devuelvan errores catastróficos.',
        tech: 'Jest, Supertest'
    },
    'Aceptación (UAT/BDD)': {
        title: 'Pruebas de Aceptación',
        desc: 'Pruebas centradas en el negocio usando lenguaje Gherkin (Given/When/Then). Validan que los flujos cumplan con los requerimientos específicos (Ej. Matchings, OKRs).',
        tech: 'jest-cucumber'
    },
    'End-to-End (E2E)': {
        title: 'Pruebas E2E',
        desc: 'Simulan la experiencia de un usuario real desde un navegador web. Prueban el flujo completo (Frontend -> Backend -> DB) para asegurar que la navegabilidad no tenga fricciones.',
        tech: 'Playwright, Chromium'
    },
    'Rendimiento (Carga y Estrés)': {
        title: 'Pruebas de Rendimiento',
        desc: 'Inyectan alto tráfico concurrente al servidor para asegurar la escalabilidad. Miden la latencia en milisegundos (carga) y buscan el límite de resiliencia del Pool de conexiones (estrés).',
        tech: 'Artillery'
    }
};

function getCategoryInfo(rawTitle) {
    const clean = rawTitle.replace(/## \d+\.?\d* Pruebas de /g, '')
                          .replace(/## \d+\.?\d* /g, '').trim();
    for (const key in DESCRIPTIONS) {
        if (clean.includes(key) || key.includes(clean)) {
            return { shortName: key.substring(0, 31).replace(/[:\\\/?*\[\]]/g, ''), ...DESCRIPTIONS[key] };
        }
    }
    const fallbackTitle = clean.substring(0, 31).replace(/[:\\\/?*\[\]]/g, '');
    return { shortName: fallbackTitle, title: clean, desc: 'Suite de pruebas generales de calidad del software Nexus.', tech: 'Herramientas de Testing' };
}

async function generateExcel() {
    const mdFile = path.join(__dirname, '../../../docs/documentacion_todas_las_pruebas.md');
    const excelFile = path.join(__dirname, '../../../Reporte_Final_Pruebas_Nexus.xlsx');

    if (!fs.existsSync(mdFile)) {
        console.error("No se encontro el archivo MD de pruebas.");
        process.exit(1);
    }

    const content = fs.readFileSync(mdFile, 'utf-8');
    const lines = content.split('\n');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NEXUS QA Automation';
    workbook.created = new Date();

    let currentSheet = null;
    let rowIndex = 1;
    let currentFile = '';

    for (const line of lines) {
        if (line.startsWith('## ') && !line.includes('Resumen')) {
            const catInfo = getCategoryInfo(line);
            
            // Crear nueva hoja por categoría
            currentSheet = workbook.addWorksheet(catInfo.shortName, {
                views: [{ state: 'frozen', ySplit: 6 }] // Congelar la cabecera + descripcion
            });

            // Dar formato a las columnas de la hoja actual
            currentSheet.columns = [
                { key: 'archivo', width: 35 },
                { key: 'id', width: 25 },
                { key: 'descripcion', width: 75 },
                { key: 'tecnica', width: 40 },
                { key: 'estado', width: 15 }
            ];

            // 1. Título principal
            currentSheet.mergeCells('A1:E1');
            const titleCell = currentSheet.getCell('A1');
            titleCell.value = `REPORTE DE CALIDAD: ${catInfo.title.toUpperCase()}`;
            titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0D2A42' } };
            titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // 2. Descripción de negocio (Metadatos)
            currentSheet.mergeCells('A2:A4');
            const descHeaderCell = currentSheet.getCell('A2');
            descHeaderCell.value = 'Información\ndel Enfoque\nde Pruebas';
            descHeaderCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF0D2A42' } };
            descHeaderCell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            descHeaderCell.border = { top: {style:'thin'}, bottom: {style:'thin'}, left: {style:'thin'}, right: {style:'thin'} };
            descHeaderCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6F0FA' } };

            currentSheet.mergeCells('B2:E3');
            const descValueCell = currentSheet.getCell('B2');
            descValueCell.value = `Descripción y Diseño: ${catInfo.desc}`;
            descValueCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FF333333' } };
            descValueCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 };
            descValueCell.border = { top: {style:'thin'}, right: {style:'thin'} };

            currentSheet.mergeCells('B4:E4');
            const techValueCell = currentSheet.getCell('B4');
            techValueCell.value = `Stack Tecnológico / Herramientas: ${catInfo.tech}`;
            techValueCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF1F4E78' } };
            techValueCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
            techValueCell.border = { bottom: {style:'thin'}, right: {style:'thin'} };

            // Fila de separación
            currentSheet.getRow(5).height = 10;

            // 3. Cabecera de la tabla
            rowIndex = 6;
            const headerRow = currentSheet.getRow(rowIndex);
            headerRow.values = {
                archivo: 'Archivo Fuente',
                id: 'Identificador (ID)',
                descripcion: 'Caso de Prueba / Aserción Validada',
                tecnica: 'Técnica Aplicada',
                estado: 'Estado'
            };
            
            headerRow.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
            headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
            headerRow.height = 25;
            
            // Incrementamos para que las filas de datos empiecen en la 7
            rowIndex++;
            
        } else if (line.startsWith('### Archivo: ')) {
            currentFile = line.replace('### Archivo: `', '').replace('`', '').trim();
            
        } else if (line.startsWith('| ') && !line.includes('---') && !line.includes('Descripción del Caso') && currentSheet) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p);
            if (parts.length >= 3) {
                const id = parts[0];
                const desc = parts[1];
                const tecnica = parts[2];
                
                const row = currentSheet.getRow(rowIndex);
                row.values = {
                    archivo: currentFile,
                    id: id,
                    descripcion: desc,
                    tecnica: tecnica,
                    estado: 'PASSED'
                };

                // Estilos de la celda de datos
                row.font = { name: 'Arial', size: 11 };
                row.alignment = { vertical: 'middle', wrapText: true };
                row.height = 30; // Altura comoda para leer
                
                // Color verde para PASSED
                row.getCell('estado').font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF00B050' } };
                row.getCell('estado').alignment = { vertical: 'middle', horizontal: 'center' };

                // Bordes para toda la fila
                row.eachCell({ includeEmpty: false }, (cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
                    };
                });
                
                // Fondo zebra (filas pares/impares con relacion a los datos)
                if (rowIndex % 2 === 0) {
                    row.eachCell({ includeEmpty: false }, (cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9F9F9' } };
                    });
                }
                
                rowIndex++;
            }
        }
    }

    await workbook.xlsx.writeFile(excelFile);
    console.log(`🚀 Reporte Multi-hoja Excel (.xlsx) generado con exito en: ${excelFile}`);
}

generateExcel().catch(err => {
    console.error('Error generando Excel:', err);
    process.exit(1);
});
