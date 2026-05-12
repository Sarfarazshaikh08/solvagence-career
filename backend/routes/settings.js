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
  publicContentAr: {
    hero: {
      badgeText: 'نحن نوظف الآن · مركز دبي المالي العالمي والعمل عن بُعد',
      titleLine1: 'ابنِ مستقبل',
      titleLine2: 'الذكاء الاصطناعي',
      titleLine3: 'من قلب الخليج',
      subtitle: 'سولفاجنس لاستشارات الذكاء الاصطناعي من أبرز شركات التحول المؤسسي في المنطقة، ومقرها دبي وتعمل عبر أكثر من 12 دولة.',
      ctaPrimary: 'استعرض الوظائف المفتوحة',
      ctaSecondary: 'احصل على تنبيهات الوظائف',
      stats: [
        { value: '35+', label: 'وظائف مفتوحة' },
        { value: '12+', label: 'دول نعمل فيها' },
        { value: '92%', label: 'رضا الفريق' },
        { value: '4×', label: 'نمو سنوي' },
      ],
    },
    sections: {
      openRolesTitle: 'اعثر على دورك',
      openRolesDesc: 'من هندسة الذكاء الاصطناعي المتقدمة إلى الاستشارات التنفيذية، أعمال مميزة لأشخاص مميزين.',
      whyTitle: 'حيث يلتقي التميز بالهدف',
      benefitsTitle: 'مزايا تكافئ التميز',
      processTitle: 'عملية واضحة وسريعة ومحترمة',
      signupTitle: 'احصل على وصول مبكر للوظائف الجديدة',
    },
    whyJoinUs: [
      ['🌍','أثر عالمي ومكانة مرموقة','اعمل من قلب دبي وساهم في تشكيل تبني الذكاء الاصطناعي عبر المنطقة وخارجها.'],
      ['💸','رواتب قوية مع دخل معفى من الضريبة','حزم تنافسية ومزايا شاملة مقارنة بأفضل الشركات العالمية.'],
      ['🚀','نمو سريع وملكية حقيقية','كل عضو في الفريق يملك نطاقاً مؤثراً منذ اليوم الأول.'],
      ['🤖','عمل على أحدث تقنيات الذكاء الاصطناعي','نماذج لغوية كبيرة وحلول مخصصة لعملاء مؤسسيين كبار.'],
    ].map(([icon,title,desc]) => ({ icon, title, desc })),
    benefits: [
      ['💰','راتب تنافسي ومكافآت','دخل بالدرهم معفى من الضريبة مع مكافآت سنوية وحوافز إضافية.'],
      ['✈️','تأشيرة وانتقال إلى الإمارات','رعاية كاملة للتأشيرة والسكن المؤقت ودعم الانضمام.'],
      ['🏥','تأمين صحي ممتاز','تغطية صحية شاملة لك وللمعالين.'],
      ['📚','ميزانية تعلم وتطوير','تمويل للشهادات والفعاليات والدورات والكتب.'],
    ].map(([icon,title,desc]) => ({ icon, title, desc })),
    hiringJourney: [
      ['01','قدّم الآن','أرسل طلبك وسيرتك الذاتية خلال دقائق قليلة.'],
      ['02','مراجعة الفريق','نراجع طلبك عادة خلال 5 أيام عمل.'],
      ['03','مكالمة أولية','مكالمة قصيرة لفهم خبرتك وأهدافك المهنية.'],
      ['04','مقابلة المدير','نقاش أعمق مع مديرك المحتمل حول الدور والمواءمة.'],
    ].map(([num,title,desc]) => ({ num, title, desc })),
    footer: {
      blurb: 'تحول مؤسسي بالذكاء الاصطناعي من مقرنا في دبي، نبني مستقبل الذكاء الاصطناعي عبر الخليج والشرق الأوسط والهند والولايات المتحدة.',
      locationBadge: 'دبي، الإمارات',
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
        publicContentAr: settings.publicContentAr || DEFAULT_SETTINGS.publicContentAr,
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
  body('publicContent.hero.badgeText').optional().trim().notEmpty(),
  body('publicContent.hero.titleLine1').optional().trim().notEmpty(),
  body('publicContent.hero.titleLine2').optional().trim().notEmpty(),
  body('publicContent.hero.titleLine3').optional().trim().notEmpty(),
  body('publicContent.hero.subtitle').optional().trim().notEmpty(),
  body('publicContent.hero.ctaPrimary').optional().trim().notEmpty(),
  body('publicContent.hero.ctaSecondary').optional().trim().notEmpty(),
  body('publicContent.hero.stats').optional().isArray({ min: 4, max: 4 }),
  body('publicContent.hero.stats.*.value').optional().trim().notEmpty(),
  body('publicContent.hero.stats.*.label').optional().trim().notEmpty(),
  body('publicContent.sections.openRolesTitle').optional().trim().notEmpty(),
  body('publicContent.sections.openRolesDesc').optional().trim().notEmpty(),
  body('publicContent.sections.whyTitle').optional().trim().notEmpty(),
  body('publicContent.sections.benefitsTitle').optional().trim().notEmpty(),
  body('publicContent.sections.processTitle').optional().trim().notEmpty(),
  body('publicContent.sections.signupTitle').optional().trim().notEmpty(),
  body('publicContent.whyJoinUs').optional().isArray({ min: 1 }),
  body('publicContent.whyJoinUs.*.icon').optional().trim().notEmpty(),
  body('publicContent.whyJoinUs.*.title').optional().trim().notEmpty(),
  body('publicContent.whyJoinUs.*.desc').optional().trim().notEmpty(),
  body('publicContent.benefits').optional().isArray({ min: 1 }),
  body('publicContent.benefits.*.icon').optional().trim().notEmpty(),
  body('publicContent.benefits.*.title').optional().trim().notEmpty(),
  body('publicContent.benefits.*.desc').optional().trim().notEmpty(),
  body('publicContent.hiringJourney').optional().isArray({ min: 1 }),
  body('publicContent.hiringJourney.*.num').optional().trim().notEmpty(),
  body('publicContent.hiringJourney.*.title').optional().trim().notEmpty(),
  body('publicContent.hiringJourney.*.desc').optional().trim().notEmpty(),
  body('publicContent.footer.blurb').optional().trim().notEmpty(),
  body('publicContent.footer.locationBadge').optional().trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const settings = await getOrCreateSettings();
    settings.company = req.body.company || settings.company;
    settings.notifications = req.body.notifications || settings.notifications;
    settings.publicContent = req.body.publicContent || settings.publicContent;
    settings.publicContentAr = req.body.publicContentAr || settings.publicContentAr || DEFAULT_SETTINGS.publicContentAr;
    settings.updatedBy = req.admin.username;
    await settings.save();

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
