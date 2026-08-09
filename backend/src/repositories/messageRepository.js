const fs = require('fs');
const path = require('path');

class MessageRepository {
  constructor({ storageFile }) {
    this.storageFile = storageFile;
    this.messages = [];
    this._load();
  }

  _load() {
    try {
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) this.messages = parsed;
      }
    } catch (error) {
      console.error('[storage] Failed to load history, starting empty:', error.message);
      this.messages = [];
    }
  }

  _persist() {
    try {
      fs.mkdirSync(path.dirname(this.storageFile), { recursive: true });
      fs.writeFileSync(this.storageFile, JSON.stringify(this.messages, null, 2));
    } catch (error) {
      console.error('[storage] Failed to persist messages:', error.message);
    }
  }

  async findAll() {
    return this.messages
      .slice()
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  async findById(id) {
    return this.messages.find((message) => message.id === id) || null;
  }

  async insert(message) {
    this.messages.push(message);
    this._persist();
    return message;
  }

  async update(messageId, patch) {
    const message = await this.findById(messageId);
    if (!message) return null;
    Object.assign(message, patch);
    this._persist();
    return message;
  }
}

module.exports = MessageRepository;
