const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const db = new Database(path.join(__dirname, 'payflow.db'));

// Enable foreign keys and WAL mode for better performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

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

  // Insert sample data only if tables are empty
  insertSampleData();
  
  console.log('✅ Database initialized successfully');
};

const insertSampleData = () => {
  // Insert banks
  const bankCount = db.prepare('SELECT COUNT(*) as count FROM banks').get().count;
  if (bankCount === 0) {
    const banks = [
      { name: 'Türkiye İş Bankası', code: 'ISBTR' },
      { name: 'Garanti BBVA', code: 'TGBATRIS' },
      { name: 'Akbank', code: 'AKBKTRIS' },
      { name: 'Yapı Kredi Bankası', code: 'YAPITRIS' },
      { name: 'Ziraat Bankası', code: 'TCZBTR2A' },
      { name: 'VakıfBank', code: 'TVBATR2A' },
      { name: 'Halkbank', code: 'TRHBTR2A' },
      { name: 'QNB Finansbank', code: 'FNNBTR2A' }
    ];

    const insertBank = db.prepare('INSERT INTO banks (name, code) VALUES (?, ?)');
    banks.forEach(bank => insertBank.run(bank.name, bank.code));
  }

  // Insert services
  const serviceCount = db.prepare('SELECT COUNT(*) as count FROM services').get().count;
  if (serviceCount === 0) {
    const services = [
      {
        name: 'Lightning Transfer',
        description: 'Anında para transferi - 7/24 aktif, maksimum güvenlik',
        min_amount: 10.00,
        max_amount: 10000.00,
        fee_percentage: 0.8,
        fixed_fee: 5.00,
        processing_time: 'Anında'
      },
      {
        name: 'Standard Transfer',
        description: 'Güvenli para transferi - İş günlerinde aktif',
        min_amount: 50.00,
        max_amount: 50000.00,
        fee_percentage: 0.5,
        fixed_fee: 8.00,
        processing_time: '1-2 İş Günü'
      },
      {
        name: 'Premium Transfer',
        description: 'Yüksek limitli transfer - VIP müşteri hizmeti',
        min_amount: 1000.00,
        max_amount: 250000.00,
        fee_percentage: 0.3,
        fixed_fee: 25.00,
        processing_time: '2-4 Saat'
      },
      {
        name: 'Corporate Transfer',
        description: 'Kurumsal transfer çözümü - Özel limit ve ücretlendirme',
        min_amount: 5000.00,
        max_amount: 1000000.00,
        fee_percentage: 0.2,
        fixed_fee: 50.00,
        processing_time: '4-6 Saat'
      }
    ];

    const insertService = db.prepare(`
      INSERT INTO services (name, description, min_amount, max_amount, fee_percentage, fixed_fee, processing_time)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    services.forEach(service => {
      insertService.run(
        service.name, service.description, service.min_amount, service.max_amount,
        service.fee_percentage, service.fixed_fee, service.processing_time
      );
    });
  }

  // Insert bank accounts
  const accountCount = db.prepare('SELECT COUNT(*) as count FROM bank_accounts').get().count;
  if (accountCount === 0) {
    const accounts = [
      { bank_id: 1, service_id: 1, account_name: 'Lightning İş Bankası', account_number: '1001234567890123', iban: 'TR330006400000011234567890', balance: 150000.00 },
      { bank_id: 1, service_id: 2, account_name: 'Standard İş Bankası', account_number: '1002345678901234', iban: 'TR330006400000012345678901', balance: 250000.00 },
      { bank_id: 2, service_id: 1, account_name: 'Lightning Garanti', account_number: '2003456789012345', iban: 'TR630062000000013456789012', balance: 180000.00 },
      { bank_id: 2, service_id: 3, account_name: 'Premium Garanti', account_number: '2004567890123456', iban: 'TR630062000000014567890123', balance: 500000.00 },
      { bank_id: 3, service_id: 2, account_name: 'Standard Akbank', account_number: '3005678901234567', iban: 'TR460004600000015678901234', balance: 300000.00 },
      { bank_id: 4, service_id: 4, account_name: 'Corporate Yapı Kredi', account_number: '4006789012345678', iban: 'TR670006700000016789012345', balance: 1000000.00 }
    ];

    const insertAccount = db.prepare(`
      INSERT INTO bank_accounts (bank_id, service_id, account_name, account_number, iban, balance)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    accounts.forEach(account => {
      insertAccount.run(
        account.bank_id, account.service_id, account.account_name,
        account.account_number, account.iban, account.balance
      );
    });
  }
};

module.exports = { db, initDB };