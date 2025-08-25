const { db } = require('../database');

class Service {
  static findAll() {
    const stmt = db.prepare('SELECT * FROM services WHERE is_active = 1 ORDER BY name');
    return stmt.all();
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM services WHERE id = ?');
    return stmt.get(id);
  }

  static calculateFee(serviceId, amount) {
    const service = this.findById(serviceId);
    if (!service) return 0;
    
    const percentageFee = (amount * service.fee_percentage) / 100;
    return percentageFee + service.fixed_fee;
  }

  static create(serviceData) {
    const { name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time } = serviceData;
    
    const stmt = db.prepare(`
      INSERT INTO services (name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);
    
    const result = stmt.run(name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time);
    return this.findById(result.lastInsertRowid);
  }
}

module.exports = Service;