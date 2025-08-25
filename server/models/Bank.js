const { db } = require('../database');

class Bank {
  static findAll() {
    const stmt = db.prepare('SELECT * FROM banks WHERE is_active = 1 ORDER BY name');
    return stmt.all();
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM banks WHERE id = ?');
    return stmt.get(id);
  }

  static create(bankData) {
    const { name, code, logo_url } = bankData;
    
    const stmt = db.prepare(`
      INSERT INTO banks (name, code, logo_url, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(name, code, logo_url);
    return this.findById(result.lastInsertRowid);
  }
}

module.exports = Bank;