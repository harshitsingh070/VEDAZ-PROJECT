const crypto = require('crypto');
const { EventEmitter } = require('events');
const { cleanText } = require('../utils/validators');

const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
};

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class MessageService extends EventEmitter {
  constructor(repository) {
    super();
    this.repository = repository;
  }

  async getAll() {
    return this.repository.findAll();
  }

  async create({ senderId, senderName, text }) {
    const clean = cleanText(text);
    if (!senderId || !senderName || !clean) {
      throw httpError('Invalid message payload', 400);
    }

    const message = {
      id: crypto.randomUUID(),
      senderId,
      senderName,
      text: clean,
      status: MESSAGE_STATUS.SENT,
      readBy: [],
      createdAt: new Date().toISOString(),
    };

    const saved = await this.repository.insert(message);
    this.emit('message:created', saved);
    return saved;
  }

  async markDelivered(messageId) {
    const message = await this.repository.findById(messageId);
    if (!message || message.status !== MESSAGE_STATUS.SENT) return message;
    return this.repository.update(messageId, { status: MESSAGE_STATUS.DELIVERED });
  }

  async markRead(messageId, readerId) {
    const message = await this.repository.findById(messageId);
    if (!message) return null;

    if (!readerId || message.readBy.includes(readerId)) return message;

    const readBy = [...message.readBy, readerId];
    const status =
      message.senderId === readerId ? message.status : MESSAGE_STATUS.READ;

    const updated = await this.repository.update(messageId, { readBy, status });
    this.emit('message:read', updated);
    return updated;
  }
}

module.exports = { MessageService, MESSAGE_STATUS };
