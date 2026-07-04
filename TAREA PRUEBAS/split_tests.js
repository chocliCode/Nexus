const fs = require('fs');
const path = require('path');

const mdFile = path.join(__dirname, '../docs/documentacion_todas_las_pruebas.md');
const content = fs.readFileSync(mdFile, 'utf-8');
const lines = content.split('\n');

const allTests = [];
for (const line of lines) {
    if (line.startsWith('| ') && !line.includes('---') && !line.includes('Descripción del Caso')) {
        const parts = line.split('|').map(p => p.trim()).filter(p => p);
        if (parts.length >= 3) {
            allTests.push({
                id: parts[0],
                desc: parts[1],
                tecnica: parts[2]
            });
        }
    }
}

// Split into 4 chunks
const chunkSize = Math.ceil(allTests.length / 4);
for (let i = 0; i < 4; i++) {
    const chunk = allTests.slice(i * chunkSize, (i + 1) * chunkSize);
    fs.writeFileSync(path.join(__dirname, `chunk_${i+1}.json`), JSON.stringify(chunk, null, 2));
}

console.log(`Extracted ${allTests.length} tests into 4 chunks.`);
