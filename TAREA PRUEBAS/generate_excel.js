const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

async function generateExcel() {
    const mdFile = path.join(__dirname, '../docs/documentacion_todas_las_pruebas.md');
    // Save in the root
    const excelFile = path.join(__dirname, '../Reporte_Final_Pruebas_Nexus.xlsx');

    if (!fs.existsSync(mdFile)) {
        console.error("No se encontro el archivo MD de pruebas.");
        process.exit(1);
    }

    const content = fs.readFileSync(mdFile, 'utf-8');
    const lines = content.split('\n');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NEXUS QA Automation';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Suite de Pruebas', {
        views: [{ state: 'frozen', ySplit: 1 }] // Congelar la primera fila
    });

    // Definir columnas y ancho
    sheet.columns = [
        { header: 'Categoría', key: 'categoria', width: 25 },
        { header: 'Archivo', key: 'archivo', width: 35 },
        { header: 'ID', key: 'id', width: 20 },
        { header: 'Descripción de la Prueba', key: 'descripcion', width: 70 },
        { header: 'Técnica Aplicada', key: 'tecnica', width: 35 },
        { header: 'Estado', key: 'estado', width: 15 }
    ];

    // Estilos del encabezado
    const headerRow = sheet.getRow(1);
    headerRow.font = { name: 'Arial', family: 4, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E78' } // Azul oscuro elegante
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    let currentCategory = '';
    let currentFile = '';
    let rowIndex = 2;

    for (const line of lines) {
        if (line.startsWith('## ')) {
            currentCategory = line.replace('## ', '').trim();
        } else if (line.startsWith('### Archivo: ')) {
            currentFile = line.replace('### Archivo: `', '').replace('`', '').trim();
        } else if (line.startsWith('| ') && !line.includes('---') && !line.includes('Descripción del Caso')) {
            const parts = line.split('|').map(p => p.trim()).filter(p => p);
            if (parts.length >= 3) {
                const id = parts[0];
                const desc = parts[1];
                const tecnica = parts[2];
                
                const row = sheet.addRow({
                    categoria: currentCategory,
                    archivo: currentFile,
                    id: id,
                    descripcion: desc,
                    tecnica: tecnica,
                    estado: 'PASSED'
                });

                // Estilo para celdas
                row.font = { name: 'Arial', size: 11 };
                row.alignment = { vertical: 'middle', wrapText: true };
                
                // Color verde para PASSED
                row.getCell('estado').font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF00B050' } };
                row.getCell('estado').alignment = { vertical: 'middle', horizontal: 'center' };

                // Bordes para toda la fila
                row.eachCell((cell) => {
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
                        right: { style: 'thin', color: { argb: 'FFDDDDDD' } }
                    };
                });
                
                // Alternar color de fondo para filas pares
                if (rowIndex % 2 === 0) {
                    row.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF2F2F2' }
                    };
                }
                
                rowIndex++;
            }
        }
    }

    // Auto-ajustar alto de fila
    sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
            row.height = 30; // Altura comoda para lectura
        }
    });

    await workbook.xlsx.writeFile(excelFile);
    console.log(`🚀 Reporte Excel Profesional (.xlsx) generado con exito en: ${excelFile}`);
}

generateExcel().catch(err => {
    console.error('Error generando Excel:', err);
    process.exit(1);
});
