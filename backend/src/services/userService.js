class UserService {
  constructor() {
    this.sockets = new Map();
  }

  join(socketId, { userId, username }) {
    this.sockets.set(socketId, { socketId, userId, username });
  }

  leave(socketId) {
    return this.sockets.delete(socketId);
  }

  get(socketId) {
    return this.sockets.get(socketId) || null;
  }

  online() {
    return Array.from(this.sockets.values());
  }
}

module.exports = UserService;
