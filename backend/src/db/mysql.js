const mysql = require('mysql2/promise');
const { db } = require('../config');

function createPool() {
  const { url, host, port, user, password, database } = db.mysql;

  const options = url
    ? { uri: url }
    : { host, port, user, password, database };

  return mysql.createPool({
    ...options,
    ssl: db.mysql.ssl ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
  });
}

async function initSchema(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id VARCHAR(36) PRIMARY KEY,
      sender_id VARCHAR(64) NOT NULL,
      sender_name VARCHAR(20) NOT NULL,
      text VARCHAR(1000) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'sent',
      read_by JSON,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);
}

async function ping(pool) {
  await pool.query('SELECT 1');
}

module.exports = { createPool, initSchema, ping };
