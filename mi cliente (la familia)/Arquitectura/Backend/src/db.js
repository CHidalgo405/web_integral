const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
pool.on('error', (err, client) => {
  console.error('[DATABASE] Error inesperado en cliente inactivo:', err);
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('[DATABASE] Error al conectar con PostgreSQL:', err.message);
  } else {
    console.log('[DATABASE] Conectado exitosamente a PostgreSQL');
  }
});

module.exports = pool;
