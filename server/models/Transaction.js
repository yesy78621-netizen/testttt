const { db } = require('../database');

class Transaction {
  static create(transactionData) {
    const {
      user_id,
      bank_account_id,
      service_id,
      amount,
      fee,
      total_amount,
      reference_number,
      notes
    } = transactionData;

    const stmt = db.prepare(`
      INSERT INTO transactions (
        user_id, bank_account_id, service_id, amount, fee, total_amount,
        reference_number, notes, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
    `);

    const result = stmt.run(
      user_id, bank_account_id, service_id, amount, fee, total_amount,
      reference_number, notes
    );

    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT t.*, u.username, ba.account_name, ba.account_number, 
             b.name as bank_name, s.name as service_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN bank_accounts ba ON t.bank_account_id = ba.id
      JOIN banks b ON ba.bank_id = b.id
      JOIN services s ON t.service_id = s.id
      WHERE t.id = ?
    `);
    return stmt.get(id);
  }

  static findByUserId(userId, limit = 10) {
    const stmt = db.prepare(`
      SELECT t.*, ba.account_name, ba.account_number, 
             b.name as bank_name, s.name as service_name
      FROM transactions t
      JOIN bank_accounts ba ON t.bank_account_id = ba.id
      JOIN banks b ON ba.bank_id = b.id
      JOIN services s ON t.service_id = s.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `);
    return stmt.all(userId, limit);
  }

  static findPending() {
    const stmt = db.prepare(`
      SELECT t.*, u.username, ba.account_name, ba.account_number, 
             b.name as bank_name, s.name as service_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN bank_accounts ba ON t.bank_account_id = ba.id
      JOIN banks b ON ba.bank_id = b.id
      JOIN services s ON t.service_id = s.id
      WHERE t.status = 'pending'
      ORDER BY t.created_at ASC
    `);
    return stmt.all();
  }

  static updateStatus(id, status, processedBy = null) {
    const stmt = db.prepare(`
      UPDATE transactions 
      SET status = ?, processed_by = ?, processed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `);
    return stmt.run(status, processedBy, id);
  }

  static getStats(period = 'daily') {
    let dateFilter = '';
    switch (period) {
      case 'daily':
        dateFilter = "date(created_at) = date('now')";
        break;
      case 'weekly':
        dateFilter = "date(created_at) >= date('now', '-7 days')";
        break;
      case 'monthly':
        dateFilter = "date(created_at) >= date('now', '-30 days')";
        break;
    }

    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as total_count,
        SUM(CASE WHEN status = 'approved' THEN total_amount ELSE 0 END) as total_amount,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_count
      FROM transactions
      WHERE ${dateFilter}
    `);

    return stmt.get();
  }

  static generateReferenceNumber() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PF${timestamp.slice(-6)}${random}`;
  }
}

module.exports = Transaction;