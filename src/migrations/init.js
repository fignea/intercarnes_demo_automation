const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.mysql_host,
    user: process.env.mysql_user,
    password: process.env.mysql_password,
    database: process.env.mysql_database,
    port: process.env.mysql_port ? Number(process.env.mysql_port) : 3306
  });

  const createIntentions = `
    CREATE TABLE IF NOT EXISTS intentions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      intention_key VARCHAR(100) NOT NULL UNIQUE,
      producto VARCHAR(255) NULL,
      cantidad INT NULL,
      foto_url TEXT NULL,
      audio_url TEXT NULL,
      telefono VARCHAR(50) NULL,
      nombre VARCHAR(255) NULL,
      converted_to_order_at DATETIME NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    )
  `;

  const createOrders = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      intention_key VARCHAR(100) NULL,
      producto VARCHAR(255) NULL,
      cantidad INT NULL,
      foto_url TEXT NULL,
      audio_url TEXT NULL,
      telefono VARCHAR(50) NULL,
      nombre VARCHAR(255) NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    )
  `;

  try {
    console.log('Creando tabla intentions (si no existe)...');
    await connection.execute(createIntentions);
    console.log('Creando tabla orders (si no existe)...');
    await connection.execute(createOrders);
    try {
      await connection.execute('ALTER TABLE intentions ADD COLUMN converted_to_order_at DATETIME NULL');
      console.log('Columna converted_to_order_at agregada.');
    } catch (alterErr) {
      if (alterErr.code !== 'ER_DUP_FIELDNAME') throw alterErr;
    }
    console.log('Migración completada.');
  } catch (err) {
    console.error('Error ejecutando migración:', err);
    process.exitCode = 1;
  } finally {
    await connection.end();
  }
}

run();

