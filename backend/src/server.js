const http = require('http');
const config = require('./config');
const { MessageService } = require('./services/messageService');
const UserService = require('./services/userService');
const MessageRepository = require('./repositories/messageRepository');
const { MysqlMessageRepository } = require('./repositories/mysqlMessageRepository');
const { createPool, initSchema, ping } = require('./db/mysql');
const createApp = require('./app');
const { initSocket } = require('./socket');

async function buildRepository() {
  if (config.db.type === 'mysql') {
    const pool = createPool();
    await ping(pool);
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
  console.error('[server] failed to start:', error.message);
  process.exit(1);
});
