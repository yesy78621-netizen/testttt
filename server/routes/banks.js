const express = require('express');
const Bank = require('../models/Bank');
const BankAccount = require('../models/BankAccount');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Tüm bankaları getir
router.get('/', authenticateToken, (req, res) => {
  try {
    const banks = Bank.findAll();
    res.json({ banks });
  } catch (error) {
    console.error('Banks fetch error:', error);
    res.status(500).json({ error: 'Bankalar getirilirken hata oluştu' });
  }
});

// Banka hesaplarını getir
router.get('/accounts', authenticateToken, (req, res) => {
  try {
    const { bank_id, service_id } = req.query;
    
    let accounts;
    if (bank_id && service_id) {
      accounts = BankAccount.findByBankAndService(bank_id, service_id);
    } else {
      accounts = BankAccount.findAll();
    }
    
    res.json({ accounts });
  } catch (error) {
    console.error('Bank accounts fetch error:', error);
    res.status(500).json({ error: 'Banka hesapları getirilirken hata oluştu' });
  }
});

module.exports = router;