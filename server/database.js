const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Create database connection
const db = new Database(path.join(__dirname, 'payflow.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
const initDB = () => {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      balance DECIMAL(15,2) DEFAULT 0.00,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Banks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS banks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Services table
  db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      min_amount DECIMAL(15,2) NOT NULL,
      max_amount DECIMAL(15,2) NOT NULL,
      fee_percentage DECIMAL(5,2) DEFAULT 0.00,
      fixed_fee DECIMAL(10,2) DEFAULT 0.00,
      processing_time TEXT,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Bank accounts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bank_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      account_name TEXT NOT NULL,
      account_number TEXT NOT NULL,
      iban TEXT,
      balance DECIMAL(15,2) DEFAULT 0.00,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (bank_id) REFERENCES banks(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    )
  `);

  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      bank_account_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      fee DECIMAL(10,2) NOT NULL,
      total_amount DECIMAL(15,2) NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'completed')),
      reference_number TEXT UNIQUE,
      notes TEXT,
      processed_by INTEGER,
      processed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id),
      FOREIGN KEY (service_id) REFERENCES services(id),
      FOREIGN KEY (processed_by) REFERENCES users(id)
    )
  `);

  // Insert default admin user
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (username, email, password, role, balance)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', 'admin@payflow.com', hashedPassword, 'admin', 100000.00);
  }

  // Insert sample banks
  const bankExists = db.prepare('SELECT id FROM banks LIMIT 1').get();
  if (!bankExists) {
    const banks = [
      { name: 'Türkiye İş Bankası', code: 'ISBTR', logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
      { name: 'Garanti BBVA', code: 'TGBATRIS', logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
      { name: 'Akbank', code: 'AKBKTRIS', logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
      { name: 'Yapı Kredi Bankası', code: 'YAPITRIS', logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
      { name: 'Ziraat Bankası', code: 'TCZBTR2A', logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' },
      { name: 'VakıfBank', code: 'TVBATR2A', logo_url: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=1' }
    ];

    const insertBank = db.prepare('INSERT INTO banks (name, code, logo_url) VALUES (?, ?, ?)');
    banks.forEach(bank => {
      insertBank.run(bank.name, bank.code, bank.logo_url);
    });
  }

  // Insert sample services
  const serviceExists = db.prepare('SELECT id FROM services LIMIT 1').get();
  if (!serviceExists) {
    const services = [
      {
        name: 'Express Transfer',
        description: 'Anında para transferi - 7/24 aktif',
        min_amount: 10.00,
        max_amount: 5000.00,
        fee_percentage: 0.5,
        fixed_fee: 2.50,
        processing_time: 'Anında'
      },
      {
        name: 'Standard Transfer',
        description: 'Standart para transferi - İş günlerinde aktif',
        min_amount: 50.00,
        max_amount: 25000.00,
        fee_percentage: 0.3,
        fixed_fee: 5.00,
        processing_time: '1-2 İş Günü'
      },
      {
        name: 'Premium Transfer',
        description: 'Yüksek limitli transfer - Özel müşteri hizmeti',
        min_amount: 1000.00,
        max_amount: 100000.00,
        fee_percentage: 0.2,
        fixed_fee: 15.00,
        processing_time: '2-4 Saat'
      }
    ];

    const insertService = db.prepare(`
      INSERT INTO services (name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    services.forEach(service => {
      insertService.run(
        service.name,
        service.description,
        service.min_amount,
        service.max_amount,
        service.fee_percentage,
        service.fixed_fee,
        service.processing_time
      );
    });
  }

  // Insert sample bank accounts
  const accountExists = db.prepare('SELECT id FROM bank_accounts LIMIT 1').get();
  if (!accountExists) {
    const accounts = [
      { bank_id: 1, service_id: 1, account_name: 'Express İş Bankası', account_number: '1234567890123456', iban: 'TR330006400000011234567890', balance: 50000.00 },
      { bank_id: 1, service_id: 2, account_name: 'Standard İş Bankası', account_number: '2345678901234567', iban: 'TR330006400000012345678901', balance: 75000.00 },
      { bank_id: 2, service_id: 1, account_name: 'Express Garanti', account_number: '3456789012345678', iban: 'TR630062000000013456789012', balance: 60000.00 },
      { bank_id: 2, service_id: 3, account_name: 'Premium Garanti', account_number: '4567890123456789', iban: 'TR630062000000014567890123', balance: 100000.00 },
      { bank_id: 3, service_id: 2, account_name: 'Standard Akbank', account_number: '5678901234567890', iban: 'TR460004600000015678901234', balance: 80000.00 },
      { bank_id: 4, service_id: 1, account_name: 'Express Yapı Kredi', account_number: '6789012345678901', iban: 'TR670006700000016789012345', balance: 45000.00 }
    ];

    const insertAccount = db.prepare(`
      INSERT INTO bank_accounts (bank_id, service_id, account_name, account_number, iban, balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    accounts.forEach(account => {
      insertAccount.run(
        account.bank_id,
        account.service_id,
        account.account_name,
        account.account_number,
        account.iban,
        account.balance
      );
    });
  }

  console.log('Database initialized successfully');
};

module.exports = { db, initDB };