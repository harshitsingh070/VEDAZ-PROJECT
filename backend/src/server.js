const http = require('http');
const config = require('./config');
const { MessageService } = require('./services/messageService');
const UserService = require('./services/userService');
const MessageRepository = require('./repositories/messageRepository');
const { MysqlMessageRepository } = require('./repositories/mysqlMessageRepository');
const { createPool, initSchema, ping } = require('./db/mysql');
const createApp = require('./app');
const { initSocket } = require('./socket');

const DB_RETRY_ATTEMPTS = 8;
const DB_RETRY_DELAY_MS = 5000;

function maskPassword(url) {
  if (!url) return '(using fallback vars)';
  return url.replace(/:\/\/[^@]+@/, '://***@');
}

async function connectWithRetry(pool) {
  const target = maskPassword(config.db.mysql.url);
  for (let attempt = 1; attempt <= DB_RETRY_ATTEMPTS; attempt += 1) {
    try {
      await ping(pool);
      return;
    } catch (error) {
      const last = attempt === DB_RETRY_ATTEMPTS;
      console.error(
        `[db] connection attempt ${attempt}/${DB_RETRY_ATTEMPTS} failed (${target}): ${error.message || error}`
      );
      if (last) throw error;
      await new Promise((resolve) => setTimeout(resolve, DB_RETRY_DELAY_MS));
    }
  }
}

async function buildRepository() {
  if (config.db.type === 'mysql') {
    const pool = createPool();
    await connectWithRetry(pool);
    await initSchema(pool);
    console.log('[db] connected to MySQL, schema ready');
    return new MysqlMessageRepository(pool);
  }
  console.log(`[db] using JSON file storage: ${config.storageFile}`);
  return new MessageRepository({ storageFile: config.storageFile });
}

async function main() {
  const messageRepository = await buildRepository();
  const messageService = new MessageService(messageRepository);
  const userService = new UserService();

  const app = createApp({ messageService });
  const server = http.createServer(app);

  initSocket(server, { messageService, userService });

  server.listen(config.port, () => {
    console.log(`[server] REST + Socket.io listening on http://localhost:${config.port}`);
  });

  function shutdown(signal) {
    console.log(`\n[server] ${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  }

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  console.error('[server] failed to start:', error.message || String(error));
  if (error.code) console.error('[server] error code:', error.code);
  if (error.sqlMessage) console.error('[server] sql message:', error.sqlMessage);
  if (error.errno) console.error('[server] errno:', error.errno);
  if (error.stack) console.error('[server] stack:', error.stack);
  process.exit(1);
});
