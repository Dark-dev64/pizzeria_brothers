// config/database.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pizzeria_brothers',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Probar conexión
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a MySQL establecida correctamente');
    
    // Verificar que la base de datos existe
    const [rows] = await connection.execute('SELECT DATABASE() as db');
    console.log(`📊 Conectado a base de datos: ${rows[0].db}`);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    return false;
  }
};

// Ejecutar Stored Procedure
const executeSP = async (spName, params = []) => {
  try {
    const placeholders = params.map(() => '?').join(',');
    const sql = `CALL ${spName}(${placeholders})`;
    
    const [results] = await pool.execute(sql, params);
    return results[0]; // Retorna el primer resultado del SP
  } catch (error) {
    console.error(`❌ Error ejecutando SP ${spName}:`, error.message);
    throw error;
  }
};

// Ejecutar query simple
const executeQuery = async (sql, params = []) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('❌ Error en query:', error.message);
    throw error;
  }
};

// Exportar funciones individualmente
module.exports = {
  pool,
  testConnection,
  executeSP, 
  executeQuery
};