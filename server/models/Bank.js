const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Banka adı gerekli'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Banka kodu gerekli'],
    unique: true,
    uppercase: true,
    trim: true
  },
  swiftCode: {
    type: String,
    required: [true, 'SWIFT kodu gerekli'],
    uppercase: true,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  supportedCurrencies: [{
    type: String,
    enum: ['TRY', 'USD', 'EUR', 'GBP'],
    default: ['TRY']
  }],
  processingTime: {
    type: String,
    default: '1-2 İş Günü'
  },
  dailyLimit: {
    type: Number,
    default: 50000
  },
  monthlyLimit: {
    type: Number,
    default: 500000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bank', bankSchema);