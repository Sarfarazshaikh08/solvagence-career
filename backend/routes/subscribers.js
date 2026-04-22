const express    = require('express');
const { body, param, validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const { protect } = require('../middleware/auth');
const { validateObjectId } = require('../utils/validation');
const { normalizeSearchQuery } = require('../utils/security');

const router = express.Router();

// POST /api/subscribers — public
router.post('/', [
  body('fname').trim().notEmpty(),
  body('lname').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('location').trim().notEmpty(),
  body('interest').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    if (!req.body.consentGiven || req.body.consentGiven === 'false') {
      return res.status(400).json({ success: false, message: 'Recruitment consent is required' });
    }

    const sub = await Subscriber.create(req.body);
    res.status(201).json({ success: true, data: { id: sub._id } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/subscribers — admin
router.get('/', protect, async (req, res) => {
  try {
    const { q } = req.query;
    const filter = {};
    if (q) {
      const safeQ = normalizeSearchQuery(q);
      filter.$or = [
        { fname: { $regex: safeQ, $options: 'i' } },
        { email: { $regex: safeQ, $options: 'i' } },
        { interest: { $regex: safeQ, $options: 'i' } },
      ];
    }
    const subs = await Subscriber.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: subs, total: subs.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/subscribers/:id — admin
router.delete('/:id', protect, [
  param('id').custom(validateObjectId),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const sub = await Subscriber.findByIdAndDelete(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Subscriber not found' });
    res.json({ success: true, message: 'Subscriber removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
