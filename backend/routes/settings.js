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
  publicContent: {
    hero: {
      badgeText: "We're Hiring · DIFC Dubai & Remote",
      titleLine1: 'Build the AI Future',
      titleLine2: 'from the Heart',
      titleLine3: 'of the Gulf',
      subtitle: "Solvagence AI Consulting is the GCC's premier enterprise AI transformation firm — headquartered in DIFC Dubai, operating across 12+ countries.",
      ctaPrimary: 'View Open Roles',
      ctaSecondary: 'Get Career Alerts',
      stats: [
        { value: '35+', label: 'Open Positions' },
        { value: '12+', label: 'Countries Active' },
        { value: '92%', label: 'Team Satisfaction' },
        { value: '4×', label: 'YoY Growth' },
      ],
    },
    sections: {
      openRolesTitle: 'Find Your Role',
      openRolesDesc: 'From frontier AI engineering to C-suite consulting — exceptional people, exceptional work.',
      whyTitle: 'Where Excellence Meets Purpose',
      benefitsTitle: 'Rewarding Excellence at Every Level',
      processTitle: 'Transparent, Respectful & Fast',
      signupTitle: 'Get Early Access to New Roles',
    },
    whyJoinUs: [
      ['🌍','Global Impact, DIFC Prestige','Work from the heart of Dubai\'s premier financial district while shaping AI adoption across 12+ countries. Your work matters globally.'],
      ['💸','Tax-Free, Top-Tier Pay','Benchmarked against McKinsey, Accenture, and FAANG. UAE offers 0% income tax. Packages include bonuses, equity, and comprehensive benefits.'],
      ['🚀','Hypergrowth & Ownership','4× YoY growth. Every team member owns meaningful scope from day one. Direct access to leadership.'],
      ['🤖','Frontier AI Work','Engage with cutting-edge LLMs, custom model development, and enterprise AI deployments for the GCC\'s largest institutions.'],
    ].map(([icon,title,desc]) => ({ icon, title, desc })),
    benefits: [
      ['💰','Competitive Salary + Bonus','Tax-free AED income benchmarked globally. 10–30% annual bonus + spot awards.'],
      ['✈️','UAE Visa & Relocation','Full sponsorship, Emirates ID, one-way airfare, and temporary housing for international joiners.'],
      ['🏥','Premium Health Insurance','DHA-compliant medical cover for you and dependents. Dental, optical, mental health — fully funded.'],
      ['📚','AED 15,000 Learning Budget','Certifications, conferences, courses, books. 100% employer-sponsored. Partial rollover.'],
    ].map(([icon,title,desc]) => ({ icon, title, desc })),
    hiringJourney: [
      ['01','Apply Online','Submit your application with your CV in under 10 minutes.'],
      ['02','Talent Review','Our team reviews within 5 business days.'],
      ['03','Intro Call','30-minute video call to understand your profile.'],
      ['04','HM Interview','Deep dive interview with your future manager.'],
    ].map(([num,title,desc]) => ({ num, title, desc })),
    footer: {
      blurb: 'Enterprise AI transformation, headquartered in DIFC Dubai. Building the AI future across GCC, Middle East, India, and USA.',
      locationBadge: 'DIFC, Dubai, UAE',
    },
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

router.get('/public', async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({
      success: true,
      data: {
        company: settings.company,
        publicContent: settings.publicContent || DEFAULT_SETTINGS.publicContent,
      },
    });
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
  body('publicContent.hero.badgeText').trim().notEmpty(),
  body('publicContent.hero.titleLine1').trim().notEmpty(),
  body('publicContent.hero.titleLine2').trim().notEmpty(),
  body('publicContent.hero.titleLine3').trim().notEmpty(),
  body('publicContent.hero.subtitle').trim().notEmpty(),
  body('publicContent.hero.ctaPrimary').trim().notEmpty(),
  body('publicContent.hero.ctaSecondary').trim().notEmpty(),
  body('publicContent.hero.stats').isArray({ min: 4, max: 4 }),
  body('publicContent.hero.stats.*.value').trim().notEmpty(),
  body('publicContent.hero.stats.*.label').trim().notEmpty(),
  body('publicContent.sections.openRolesTitle').trim().notEmpty(),
  body('publicContent.sections.openRolesDesc').trim().notEmpty(),
  body('publicContent.sections.whyTitle').trim().notEmpty(),
  body('publicContent.sections.benefitsTitle').trim().notEmpty(),
  body('publicContent.sections.processTitle').trim().notEmpty(),
  body('publicContent.sections.signupTitle').trim().notEmpty(),
  body('publicContent.whyJoinUs').isArray({ min: 1 }),
  body('publicContent.whyJoinUs.*.icon').trim().notEmpty(),
  body('publicContent.whyJoinUs.*.title').trim().notEmpty(),
  body('publicContent.whyJoinUs.*.desc').trim().notEmpty(),
  body('publicContent.benefits').isArray({ min: 1 }),
  body('publicContent.benefits.*.icon').trim().notEmpty(),
  body('publicContent.benefits.*.title').trim().notEmpty(),
  body('publicContent.benefits.*.desc').trim().notEmpty(),
  body('publicContent.hiringJourney').isArray({ min: 1 }),
  body('publicContent.hiringJourney.*.num').trim().notEmpty(),
  body('publicContent.hiringJourney.*.title').trim().notEmpty(),
  body('publicContent.hiringJourney.*.desc').trim().notEmpty(),
  body('publicContent.footer.blurb').trim().notEmpty(),
  body('publicContent.footer.locationBadge').trim().notEmpty(),
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
        publicContent: req.body.publicContent,
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
