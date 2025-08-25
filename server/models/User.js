const { db } = require('../database');
const bcrypt = require('bcryptjs');

class User {
  static create(userData) {
    const { username, email, password, role = 'user' } = userData;
    const hashedPassword = bcrypt.hashSync(password, 12);
    
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password, role, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(username, email, hashedPassword, role);
    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static findByUsername(username) {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  static validatePassword(plainPassword, hashedPassword) {
    return bcrypt.compareSync(plainPassword, hashedPassword);
  }

  static updateBalance(userId, amount) {
    const stmt = db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
    return stmt.run(amount, userId);
  }

  static getBalance(userId) {
    const stmt = db.prepare('SELECT balance FROM users WHERE id = ?');
    const result = stmt.get(userId);
    return result ? result.balance : 0;
  }
}

module.exports = User;