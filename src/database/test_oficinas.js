const pool = require('./database');

async function test() {
  try {
    const res = await pool.query('SELECT * FROM oficinas');
    console.log('🟢 Oficinas encontradas:');
    console.log(res.rows);
  } catch (error) {
    console.error('🔴 Error en consulta:', error.message);
  } finally {
    process.exit();
  }
}

test();