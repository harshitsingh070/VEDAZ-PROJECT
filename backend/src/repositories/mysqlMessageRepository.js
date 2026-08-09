class MysqlMessageRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll() {
    const [rows] = await this.pool.query(
      'SELECT * FROM messages ORDER BY created_at ASC'
    );
    return rows.map((row) => this._toDomain(row));
  }

  async findById(id) {
    const [rows] = await this.pool.query(
      'SELECT * FROM messages WHERE id = ? LIMIT 1',
      [id]
    );
    return rows.length ? this._toDomain(rows[0]) : null;
  }

  async insert(message) {
    await this.pool.query(
      `INSERT INTO messages (id, sender_id, sender_name, text, status, read_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id,
        message.senderId,
        message.senderName,
        message.text,
        message.status,
        JSON.stringify(message.readBy),
        this._toDate(message.createdAt),
      ]
    );
    return message;
  }

  async update(messageId, patch) {
    const existing = await this.findById(messageId);
    if (!existing) return null;

    const updated = { ...existing, ...patch };
    await this.pool.query(
      `UPDATE messages
       SET sender_name = ?, text = ?, status = ?, read_by = ?, created_at = ?
       WHERE id = ?`,
      [
        updated.senderName,
        updated.text,
        updated.status,
        JSON.stringify(updated.readBy),
        this._toDate(updated.createdAt),
        messageId,
      ]
    );
    return updated;
  }

  _toDomain(row) {
    return {
      id: row.id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      text: row.text,
      status: row.status,
      readBy: this._parseReadBy(row.read_by),
      createdAt: this._toIso(row.created_at),
    };
  }

  _parseReadBy(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  _toIso(value) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  _toDate(isoString) {
    const date = new Date(isoString);
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }
}

module.exports = { MysqlMessageRepository };
