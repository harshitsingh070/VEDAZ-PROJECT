const { Server } = require('socket.io');
const { corsOrigin } = require('../config');
const { registerHandlers } = require('./handlers');

function initSocket(server, { messageService, userService }) {
  const io = new Server(server, {
    cors: {
      origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    },
  });

  registerHandlers(io, { messageService, userService });

  return io;
}

module.exports = { initSocket };
