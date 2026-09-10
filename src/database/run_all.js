const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function runFile(file) {
  console.log(`Ejecutando: ${file}`);

  const sql = fs.readFileSync(path.join(__dirname, file)).toString();

  try {
    await pool.query(sql);
    console.log(`OK: ${file}`);
  } catch (err) {
    console.error(`ERROR en ${file}:`, err.message);
  }
}

async function main() {
  console.log(' Iniciando ejecución de scripts...\n');

  const files = [
    '01_extensions.sql',
    '02_schema_base.sql',
    '03_catalogos.sql',
    '04_operacion.sql',
    '05_archivos.sql',
    '06_comunicacion.sql',
    '07_auditoria.sql',
    '08_seed.sql',
    '09_test_data.sql'
  ];

  for (const file of files) {
    await runFile(file);
  }

  console.log('\n🎉 Proceso terminado');
  process.exit();
}

main();