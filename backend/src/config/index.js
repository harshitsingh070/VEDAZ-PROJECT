const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const dataDir = process.env.DATA_DIR || 'data';

module.exports = {
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
  storageFile: path.join(process.cwd(), dataDir, 'messages.json'),
  db: {
    // 'file' (default, JSON storage) or 'mysql'
    type: process.env.DB_TYPE || 'file',
    mysql: {
      url: process.env.MYSQL_URL,
      host: process.env.MYSQL_HOST || process.env.MYSQLHOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || process.env.MYSQLPORT) || 3306,
      user: process.env.MYSQL_USER || process.env.MYSQLUSER || 'root',
      password: process.env.MYSQL_PASSWORD || process.env.MYSQLPASSWORD || '',
      database: process.env.MYSQL_DATABASE || process.env.MYSQLDATABASE || 'vedaz_chat',
    },
  },
  limits: {
    usernameMinLength: 3,
    usernameMaxLength: 20,
    messageMaxLength: 1000,
  },
};
