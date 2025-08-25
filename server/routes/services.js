const express = require('express');
const Service = require('../models/Service');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Tüm servisleri getir
router.get('/', authenticateToken, (req, res) => {
  try {
    const services = Service.findAll();
    res.json({ services });
  } catch (error) {
    console.error('Services fetch error:', error);
    res.status(500).json({ error: 'Servisler getirilirken hata oluştu' });
  }
});

// Ücret hesapla
router.post('/calculate-fee', authenticateToken, (req, res) => {
  try {
    const { service_id, amount } = req.body;
    
    if (!service_id || !amount) {
      return res.status(400).json({ error: 'Servis ID ve tutar gerekli' });
    }

    const fee = Service.calculateFee(service_id, amount);
    const total = parseFloat(amount) + parseFloat(fee);

    res.json({ 
      fee: parseFloat(fee.toFixed(2)), 
      total: parseFloat(total.toFixed(2)) 
    });
  } catch (error) {
    console.error('Fee calculation error:', error);
    res.status(500).json({ error: 'Ücret hesaplanırken hata oluştu' });
  }
});

module.exports = router;