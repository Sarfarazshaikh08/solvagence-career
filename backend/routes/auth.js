const express = require('express');
const jwt     = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin   = require('../models/Admin');
const { protect } = require('../middleware/auth');

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

// POST /api/auth/login
router.post('/login', [
  body('username').trim().notEmpty().withMessage('Username required'),
  body('password').notEmpty().withMessage('Password required'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    admin.lastLogin = new Date();
    await admin.save();

    res.json({
      success: true,
      token: signToken(admin._id),
      admin: { id: admin._id, username: admin.username, displayName: admin.displayName },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
});

// GET /api/auth/me — verify token
router.get('/me', protect, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// PUT /api/auth/password — change password
router.put('/password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }).withMessage('Min 8 characters'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const admin = await Admin.findById(req.admin._id);
    if (!(await admin.comparePassword(req.body.currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }
    admin.password = req.body.newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Unable to update password' });
  }
});

module.exports = router;
