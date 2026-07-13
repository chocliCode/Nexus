const fs = require('fs');

const filePath = 'c:\\Users\\USUARIO\\Desktop\\Nexus\\backend\\src\\db\\seeds\\test_data.sql';
const content = fs.readFileSync(filePath);

// Find the position of "ON CONFLICT DO NOTHING;" right after "TechStartup Lima"
const marker = Buffer.from("WHERE v.titulo = 'Junior React Developer' AND e.nombre = 'TechStartup Lima'\r\nON CONFLICT DO NOTHING;\r\n");
const marker2 = Buffer.from("WHERE v.titulo = 'Junior React Developer' AND e.nombre = 'TechStartup Lima'\nON CONFLICT DO NOTHING;\n");

let idx = content.indexOf(marker);
let offset = marker.length;
if (idx === -1) {
    idx = content.indexOf(marker2);
    offset = marker2.length;
}

if (idx !== -1) {
    const goodPart = content.slice(0, idx + offset);
    
    const newAddition = `
-- ============================================================
-- CURSO / Aula Virtual PARA E2E
-- ============================================================

INSERT INTO curso (curso_id, titulo, descripcion, categoria, estado, max_estudiantes, jedi_id)
VALUES (
    'ff000000-0000-4000-a000-000000000001',
    'Aula Virtual',
    'Curso de prueba para E2E',
    'Frontend',
    'Abierto',
    30,
    'aa000000-0000-4000-a000-000000000002'
) ON CONFLICT DO NOTHING;

INSERT INTO curso_inscripcion (curso_id, padawan_id, estado)
VALUES (
    'ff000000-0000-4000-a000-000000000001',
    'aa000000-0000-4000-a000-000000000001',
    'Aprobado'
) ON CONFLICT DO NOTHING;

INSERT INTO curso_post (post_id, curso_id, autor_id, tipo, titulo, contenido)
VALUES (
    'ff000000-0000-4000-a000-000000000002',
    'ff000000-0000-4000-a000-000000000001',
    'aa000000-0000-4000-a000-000000000002',
    'tarea',
    'Tarea 1',
    'Entregar la tarea'
) ON CONFLICT DO NOTHING;

INSERT INTO curso_tarea_entrega (entrega_id, post_id, padawan_id, archivo_url)
VALUES (
    'ff000000-0000-4000-a000-000000000003',
    'ff000000-0000-4000-a000-000000000002',
    'aa000000-0000-4000-a000-000000000001',
    '/uploads/assignments/dummy.pdf'
) ON CONFLICT DO NOTHING;
`;
    fs.writeFileSync(filePath, Buffer.concat([goodPart, Buffer.from(newAddition)]));
    console.log("File fixed successfully.");
} else {
    console.log("Marker not found!");
}
