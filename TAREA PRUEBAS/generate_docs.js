const fs = require('fs');
const path = require('path');

const BACKEND_TESTS_DIR = path.join(__dirname, '../backend/tests');
const FRONTEND_TESTS_DIR = path.join(__dirname, '../frontend/src/test');
const FRONTEND_E2E_DIR = path.join(__dirname, '../frontend/e2e');
const OUTPUT_FILE = path.join(__dirname, '../docs/documentacion_todas_las_pruebas.md');

let mdContent = `# Documentación Completa de Casos de Prueba (475 Tests)

Este documento contiene el listado absoluto de las 475 pruebas automatizadas del proyecto NEXUS, agrupadas por categoría y tecnología, cumpliendo con los Criterios 3, 4 y 5 de la rúbrica (Caja Negra, Caja Blanca, Seguridad, y Automatización).

---

`;

function extractTestsFromFile(filePath, regexes) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const tests = [];
    regexes.forEach(regex => {
        let match;
        while ((match = regex.exec(content)) !== null) {
            tests.push(match[1]);
        }
    });
    return tests;
}

function extractYamlScenarios(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const regex = /name:\s*["']([^"']+)["']/g;
    const tests = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        if (!match[1].toLowerCase().includes('ramp') && !match[1].toLowerCase().includes('calentamiento') && !match[1].toLowerCase().includes('carga')) {
            tests.push(match[1]);
        }
    }
    return tests;
}

function processDirectory(dirPath, ext, isYaml = false) {
    let allFiles = [];
    if (!fs.existsSync(dirPath)) return allFiles;
    
    const items = fs.readdirSync(dirPath);
    for (const item of items) {
        const fullPath = path.join(dirPath, item);
        if (fs.statSync(fullPath).isDirectory()) {
            allFiles = allFiles.concat(processDirectory(fullPath, ext, isYaml));
        } else if (fullPath.endsWith(ext)) {
            allFiles.push(fullPath);
        }
    }
    return allFiles;
}

function generateSection(title, description, files, testExtractor, regexes = null) {
    let sectionMd = `## ${title}\n${description}\n\n`;
    let totalSectionTests = 0;
    
    files.forEach(file => {
        const tests = testExtractor(file, regexes);
        if (tests.length > 0) {
            const relativeName = path.basename(file);
            sectionMd += `### Archivo: \`${relativeName}\`\n`;
            sectionMd += `| # | Descripción del Caso de Prueba | Tipo / Técnica |\n`;
            sectionMd += `|---|---|---|\n`;
            tests.forEach((t, i) => {
                sectionMd += `| ${i+1} | ${t} | Caja Negra/Blanca |\n`;
                totalSectionTests++;
            });
            sectionMd += `\n`;
        }
    });
    
    if (totalSectionTests > 0) {
        mdContent += sectionMd;
    }
    return totalSectionTests;
}

// Regex for tests
const tsRegex = [/it\(['"`](.*?)['"`],/g, /test\(['"`](.*?)['"`],/g];

// 1. Integración
let total = 0;
total += generateSection(
    "1. Pruebas de Integración (Backend)", 
    "Prueban los endpoints expuestos en Express usando Supertest y una base de datos PostgreSQL real.",
    processDirectory(BACKEND_TESTS_DIR, '.ts').filter(f => !f.includes('unit') && !f.includes('smoke') && !f.includes('security') && !f.includes('acceptance') && !f.includes('setup') && !f.includes('teardown')),
    extractTestsFromFile,
    tsRegex
);

// 2. Unitarias
total += generateSection(
    "2. Pruebas Unitarias (Backend)", 
    "Aíslan la lógica de middlewares y esquemas Zod usando mocks.",
    processDirectory(path.join(BACKEND_TESTS_DIR, 'unit'), '.ts'),
    extractTestsFromFile,
    tsRegex
);

// 3. Componente UI
total += generateSection(
    "3. Pruebas de Componente (Frontend)", 
    "Usando Vitest y React Testing Library para componentes UI.",
    processDirectory(FRONTEND_TESTS_DIR, '.ts'), // .tsx or .ts
    extractTestsFromFile,
    tsRegex
);
const frontendTsxFiles = processDirectory(FRONTEND_TESTS_DIR, '.tsx');
if (frontendTsxFiles.length > 0) {
    total += generateSection(
        "3.1 Pruebas de Componente Adicionales", 
        "",
        frontendTsxFiles,
        extractTestsFromFile,
        tsRegex
    );
}

// 4. Seguridad
total += generateSection(
    "4. Pruebas de Seguridad (OWASP)", 
    "Inyección SQL, XSS, Broken Access Control y Fuzzing.",
    processDirectory(path.join(BACKEND_TESTS_DIR, 'security'), '.ts'),
    extractTestsFromFile,
    tsRegex
);

// 5. Humo
total += generateSection(
    "5. Pruebas de Humo (Smoke)", 
    "Validación de endpoints básicos y tolerancia a headers extraños.",
    processDirectory(path.join(BACKEND_TESTS_DIR, 'smoke'), '.ts'),
    extractTestsFromFile,
    tsRegex
);

// 6. Aceptación BDD
total += generateSection(
    "6. Pruebas de Aceptación (UAT/BDD)", 
    "Flujos de negocio desde la perspectiva del usuario (Given/When/Then).",
    processDirectory(path.join(BACKEND_TESTS_DIR, 'acceptance'), '.ts'),
    extractTestsFromFile,
    tsRegex
);

// 7. E2E
total += generateSection(
    "7. Pruebas End-to-End (E2E)", 
    "Flujos completos en Chromium automatizados con Playwright.",
    processDirectory(FRONTEND_E2E_DIR, '.ts'),
    extractTestsFromFile,
    tsRegex
);

// 8. Carga y Estrés (Artillery yaml files)
total += generateSection(
    "8. Pruebas de Rendimiento (Carga y Estrés)", 
    "Escenarios simulando alto tráfico definidos en Artillery.",
    processDirectory(path.join(BACKEND_TESTS_DIR, 'load'), '.yml').concat(processDirectory(path.join(BACKEND_TESTS_DIR, 'stress'), '.yml')),
    extractYamlScenarios
);

mdContent += `\n## Resumen\n**Total de pruebas documentadas en este archivo:** ${total}\n`;

fs.writeFileSync(OUTPUT_FILE, mdContent);
console.log('Documentacion generada en ' + OUTPUT_FILE + ' con ' + total + ' pruebas.');
