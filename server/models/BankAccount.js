const { db } = require('../database');

class BankAccount {
  static findAll() {
    const stmt = db.prepare(`
      SELECT ba.*, b.name as bank_name, b.code as bank_code, s.name as service_name
      FROM bank_accounts ba
      JOIN banks b ON ba.bank_id = b.id
      JOIN services s ON ba.service_id = s.id
      WHERE ba.is_active = 1
      ORDER BY b.name, s.name
    `);
    return stmt.all();
  }

  static findByBankAndService(bankId, serviceId) {
    const stmt = db.prepare(`
      SELECT ba.*, b.name as bank_name, b.code as bank_code, s.name as service_name
      FROM bank_accounts ba
      JOIN banks b ON ba.bank_id = b.id
      JOIN services s ON ba.service_id = s.id
      WHERE ba.bank_id = ? AND ba.service_id = ? AND ba.is_active = 1
    `);
    return stmt.all(bankId, serviceId);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT ba.*, b.name as bank_name, b.code as bank_code, s.name as service_name
      FROM bank_accounts ba
      JOIN banks b ON ba.bank_id = b.id
      JOIN services s ON ba.service_id = s.id
      WHERE ba.id = ?
    `);
    return stmt.get(id);
  }

  static create(accountData) {
    const { bank_id, service_id, account_name, account_number, iban, balance = 0 } = accountData;
    
    const stmt = db.prepare(`
      INSERT INTO bank_accounts (bank_id, service_id, account_name, account_number, iban, balance, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(bank_id, service_id, account_name, account_number, iban, balance);
    return this.findById(result.lastInsertRowid);
  }

  static updateBalance(id, amount) {
    const stmt = db.prepare('UPDATE bank_accounts SET balance = balance + ? WHERE id = ?');
    return stmt.run(amount, id);
  }
}

module.exports = BankAccount;