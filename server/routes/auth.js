const express = require('express');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = User.findByUsername(username) || User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Create user
    const user = User.create({ username, email, password, role });
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const user = User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Validate password
    const isValidPassword = User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        balance: user.balance
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      balance: req.user.balance
    }
  });
});

// Update user balance (admin only)
router.patch('/balance/:userId', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const { amount } = req.body;

    if (typeof amount !== 'number') {
      return res.status(400).json({ error: 'Amount must be a number' });
    }

    User.updateBalance(userId, amount);
    const updatedUser = User.findById(userId);

    res.json({
      message: 'Balance updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        balance: updatedUser.balance
      }
    });
  } catch (error) {
    console.error('Balance update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;