const express = require('express');
const Transaction = require('../models/Transaction');
const BankAccount = require('../models/BankAccount');
const Service = require('../models/Service');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Kullanıcının işlemlerini getir
router.get('/my-transactions', authenticateToken, (req, res) => {
  try {
    const transactions = Transaction.findByUserId(req.user.id);
    res.json({ transactions });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ error: 'İşlemler getirilirken hata oluştu' });
  }
});

// Yeni işlem oluştur
router.post('/create', authenticateToken, (req, res) => {
  try {
    const { bank_account_id, service_id, amount, notes } = req.body;

    // Validasyon
    if (!bank_account_id || !service_id || !amount) {
      return res.status(400).json({ error: 'Gerekli alanlar eksik' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Geçersiz tutar' });
    }

    // Hesap ve servis kontrolü
    const bankAccount = BankAccount.findById(bank_account_id);
    const service = Service.findById(service_id);

    if (!bankAccount || !service) {
      return res.status(404).json({ error: 'Hesap veya servis bulunamadı' });
    }

    // Limit kontrolü
    if (amount < service.min_amount || amount > service.max_amount) {
      return res.status(400).json({ 
        error: `Bu servis için minimum ${service.min_amount}₺, maksimum ${service.max_amount}₺ transfer yapabilirsiniz` 
      });
    }

    // Ücret hesaplama
    const fee = Service.calculateFee(service_id, amount);
    const total_amount = parseFloat(amount) + parseFloat(fee);

    // Kullanıcı bakiye kontrolü
    if (req.user.balance < total_amount) {
      return res.status(400).json({ error: 'Yetersiz bakiye' });
    }

    // Referans numarası oluştur
    const reference_number = Transaction.generateReferenceNumber();

    // İşlem oluştur
    const transaction = Transaction.create({
      user_id: req.user.id,
      bank_account_id,
      service_id,
      amount,
      fee,
      total_amount,
      reference_number,
      notes
    });

    // Kullanıcı bakiyesinden düş
    User.updateBalance(req.user.id, -total_amount);

    res.status(201).json({
      message: 'İşlem başarıyla oluşturuldu',
      transaction
    });
  } catch (error) {
    console.error('Transaction creation error:', error);
    res.status(500).json({ error: 'İşlem oluşturulurken hata oluştu' });
  }
});

// Bekleyen işlemleri getir (Admin)
router.get('/pending', authenticateToken, requireAdmin, (req, res) => {
  try {
    const transactions = Transaction.findPending();
    res.json({ transactions });
  } catch (error) {
    console.error('Pending transactions fetch error:', error);
    res.status(500).json({ error: 'Bekleyen işlemler getirilirken hata oluştu' });
  }
});

// İşlemi onayla/reddet (Admin)
router.patch('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    const transaction = Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Bu işlem zaten işlenmiş' });
    }

    // Durum güncelle
    Transaction.updateStatus(id, status, req.user.id);

    // Eğer reddedildiyse parayı geri ver
    if (status === 'rejected') {
      User.updateBalance(transaction.user_id, transaction.total_amount);
    } else if (status === 'approved') {
      // Onaylandıysa banka hesabına ekle
      BankAccount.updateBalance(transaction.bank_account_id, transaction.amount);
    }

    res.json({ message: `İşlem ${status === 'approved' ? 'onaylandı' : 'reddedildi'}` });
  } catch (error) {
    console.error('Transaction status update error:', error);
    res.status(500).json({ error: 'İşlem durumu güncellenirken hata oluştu' });
  }
});

// İstatistikler (Admin)
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { period = 'daily' } = req.query;
    const stats = Transaction.getStats(period);
    res.json({ stats });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'İstatistikler getirilirken hata oluştu' });
  }
});

module.exports = router;