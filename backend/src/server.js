const http = require('http');
const { port } = require('./config');
const { MessageService } = require('./services/messageService');
const UserService = require('./services/userService');
const MessageRepository = require('./repositories/messageRepository');
const createApp = require('./app');
const { initSocket } = require('./socket');

const messageRepository = new MessageRepository({
  storageFile: require('./config').storageFile,
});

const messageService = new MessageService(messageRepository);
const userService = new UserService();

const app = createApp({ messageService });
const server = http.createServer(app);

initSocket(server, { messageService, userService });

server.listen(port, () => {
  console.log(`[server] REST + Socket.io listening on http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`\n[server] ${signal} received, shutting down gracefully...`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
