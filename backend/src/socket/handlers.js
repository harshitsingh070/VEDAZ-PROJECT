const { cleanUsername, cleanText } = require('../utils/validators');

function registerHandlers(io, { messageService, userService }) {
  messageService.on('message:created', (message) => {
    const delivered = messageService.markDelivered(message.id);
    io.emit('message:new', delivered);
  });

  messageService.on('message:read', (message) => {
    io.emit('message:read', message);
  });

  io.on('connection', (socket) => {
    socket.on('user:join', ({ userId, username }) => {
      const name = cleanUsername(username);
      if (!name) {
        socket.emit('auth:error', { error: 'Invalid username' });
        return;
      }

      socket.data.user = { userId, username: name };
      userService.join(socket.id, { userId, username: name });

      io.emit('user:list', userService.online());
    });

    socket.on('message:send', ({ senderId, senderName, text }) => {
      try {
        messageService.create({ senderId, senderName, text });
      } catch (error) {
        socket.emit('message:error', { error: error.message });
      }
    });

    socket.on('typing:start', () => {
      const { user } = socket.data;
      if (!user) return;
      socket.broadcast.emit('typing', { username: user.username, isTyping: true });
    });

    socket.on('typing:stop', () => {
      const { user } = socket.data;
      if (!user) return;
      socket.broadcast.emit('typing', { username: user.username, isTyping: false });
    });

    socket.on('message:read', ({ messageId }) => {
      const { user } = socket.data;
      if (!user) return;
      messageService.markRead(messageId, user.userId);
    });

    socket.on('disconnect', () => {
      userService.leave(socket.id);
      io.emit('user:list', userService.online());
    });
  });
}

module.exports = { registerHandlers };
