const express = require('express');
const { body, validationResult } = require('express-validator');
const Setting = require('../models/Setting');
const { protect } = require('../middleware/auth');
const { seedDatabase } = require('../scripts/seedData');
const { canResetPortal } = require('../utils/environment');

const router = express.Router();

const DEFAULT_SETTINGS = {
  key: 'global',
  company: {
    name: 'Solvagence AI Consulting Limited',
    careersEmail: 'careers@solvagence.com',
    hqLocation: 'DIFC, Dubai, UAE',
    website: 'https://solvagence.com',
  },
  notifications: {
    newApplicationAlert: true,
    dailyDigest: true,
    newSubscriberAlert: false,
    weeklyAnalytics: true,
  },
};

async function getOrCreateSettings() {
  let settings = await Setting.findOne({ key: 'global' });
  if (!settings) {
    settings = await Setting.create(DEFAULT_SETTINGS);
  }
  return settings;
}

router.get('/', protect, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/', protect, [
  body('company.name').trim().notEmpty().withMessage('Company name required'),
  body('company.careersEmail').isEmail().withMessage('Valid careers email required'),
  body('company.hqLocation').trim().notEmpty().withMessage('HQ location required'),
  body('company.website').trim().notEmpty().withMessage('Website required'),
  body('notifications.newApplicationAlert').isBoolean(),
  body('notifications.dailyDigest').isBoolean(),
  body('notifications.newSubscriberAlert').isBoolean(),
  body('notifications.weeklyAnalytics').isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const settings = await Setting.findOneAndUpdate(
      { key: 'global' },
      {
        company: req.body.company,
        notifications: req.body.notifications,
        updatedBy: req.admin.username,
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: settings, message: 'Settings updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/reset', protect, async (req, res) => {
  if (!canResetPortal()) {
    return res.status(403).json({ success: false, message: 'Portal reset is disabled in production' });
  }

  if (req.body?.confirm !== 'RESET') {
    return res.status(400).json({ success: false, message: 'Reset confirmation is required' });
  }

  try {
    const summary = await seedDatabase({
      logger: () => {},
      updatedBy: req.admin.username,
    });

    res.json({
      success: true,
      message: 'Portal data reset to seed defaults',
      data: summary,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
