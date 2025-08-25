const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Kullanıcı adı gerekli'],
    unique: true,
    trim: true,
    minlength: [3, 'Kullanıcı adı en az 3 karakter olmalı']
  },
  email: {
    type: String,
    required: [true, 'E-posta gerekli'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir e-posta adresi girin']
  },
  password: {
    type: String,
    required: [true, 'Şifre gerekli'],
    minlength: [6, 'Şifre en az 6 karakter olmalı']
  },
  firstName: {
    type: String,
    required: [true, 'Ad gerekli'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Soyad gerekli'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Telefon numarası gerekli'],
    match: [/^[0-9]{10,11}$/, 'Geçerli bir telefon numarası girin']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Bakiye negatif olamaz']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Şifre hashleme
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre doğrulama
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Tam ad
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// JSON çıktısında şifreyi gizle
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);