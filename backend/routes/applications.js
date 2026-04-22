const express  = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl }     = require('@aws-sdk/s3-request-presigner');
const Application = require('../models/Application');
const Job         = require('../models/Job');
const { protect } = require('../middleware/auth');
const { upload, s3 } = require('../middleware/upload');
const { positiveInt, validateObjectId } = require('../utils/validation');
const { normalizeSearchQuery } = require('../utils/security');

const router = express.Router();
const validStatuses = ['New','Reviewing','Shortlisted','Hired','Rejected'];

/* ─────────────────────────────────────────────
   PUBLIC: Submit application
─────────────────────────────────────────────── */
router.post('/', upload.single('resume'), [
  body('email').trim().isEmail().withMessage('Valid email required'),
  body('linkedin').optional({ values: 'falsy' }).isURL().withMessage('LinkedIn must be a valid URL'),
  body('jobId').custom(validateObjectId),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { fname, lname, email, phone, location, exp, linkedin, jobId, consent } = req.body;

    if (!fname || !lname || !email || !location || !exp || !jobId) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }
    if (!consent || consent === 'false') {
      return res.status(400).json({ success: false, message: 'PDPL consent is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    // Build resume object depending on storage backend
    let resumeData = {};
    if (req.file) {
      if (req.file.location) {
        // S3 upload
        resumeData = {
          originalName: req.file.originalname,
          s3Key:        req.file.key,
          s3Url:        req.file.location,
          mimeType:     req.file.mimetype,
          sizeBytes:    req.file.size,
          uploadedAt:   new Date(),
        };
      } else {
        // Local disk (dev)
        resumeData = {
          originalName: req.file.originalname,
          s3Key:        req.file.filename,
          s3Url:        `/uploads/${req.file.filename}`,
          mimeType:     req.file.mimetype,
          sizeBytes:    req.file.size,
          uploadedAt:   new Date(),
        };
      }
    }

    const app = await Application.create({
      fname, lname, email, phone, location, exp, linkedin,
      job: job._id,
      roleTitle: job.title,
      consentGiven: true,
      resume: resumeData,
    });

    res.status(201).json({ success: true, data: { id: app._id, message: 'Application submitted successfully' } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Get all applications (with filters)
─────────────────────────────────────────────── */
router.get('/', protect, [
  query('jobId').optional().custom(validateObjectId),
  query('status').optional().isIn(['all', ...validStatuses]).withMessage('Invalid status'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { status, q, jobId, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (jobId) filter.job = jobId;
    if (q) {
      const safeQ = normalizeSearchQuery(q);
      filter.$or = [
        { fname: { $regex: safeQ, $options: 'i' } },
        { lname: { $regex: safeQ, $options: 'i' } },
        { email: { $regex: safeQ, $options: 'i' } },
        { roleTitle: { $regex: safeQ, $options: 'i' } },
      ];
    }

    const total = await Application.countDocuments(filter);
    const apps  = await Application.find(filter)
      .populate('job', 'title dept')
      .sort({ createdAt: -1 })
      .skip((positiveInt(page, 1) - 1) * positiveInt(limit, 10))
      .limit(positiveInt(limit, 10));

    res.json({ success: true, data: apps, total, page: positiveInt(page, 1), pages: Math.ceil(total / positiveInt(limit, 10)) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Dashboard stats
─────────────────────────────────────────────── */
router.get('/admin/stats', protect, async (req, res) => {
  try {
    const [total, byStatus, avgScore] = await Promise.all([
      Application.countDocuments(),
      Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Application.aggregate([
        { $match: { 'creditScore.score': { $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$creditScore.score' } } }
      ]),
    ]);

    const statusMap = {};
    byStatus.forEach(s => { statusMap[s._id] = s.count; });

    res.json({
      success: true,
      data: {
        total,
        new:         statusMap['New']         || 0,
        reviewing:   statusMap['Reviewing']   || 0,
        shortlisted: statusMap['Shortlisted'] || 0,
        hired:       statusMap['Hired']       || 0,
        rejected:    statusMap['Rejected']    || 0,
        avgCreditScore: avgScore[0]?.avg ? Math.round(avgScore[0].avg) : null,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Update status
─────────────────────────────────────────────── */
router.patch('/:id/status', protect, [
  param('id').custom(validateObjectId),
  body('status').isIn(validStatuses).withMessage('Invalid status'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { status } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Update credit score + notes
─────────────────────────────────────────────── */
router.patch('/:id/credit-score', protect, [
  param('id').custom(validateObjectId),
  body('score').isInt({ min: 0, max: 100 }).withMessage('Score must be 0-100'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { score, notes } = req.body;
    const app = await Application.findByIdAndUpdate(req.params.id, {
      creditScore: {
        score:    parseInt(score),
        notes:    notes || '',
        scoredBy: req.admin.username,
        scoredAt: new Date(),
      }
    }, { new: true });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Update recruiter notes
─────────────────────────────────────────────── */
router.patch('/:id/notes', protect, [
  param('id').custom(validateObjectId),
  body('notes').optional().isString().withMessage('Notes must be text'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const app = await Application.findByIdAndUpdate(
      req.params.id,
      { recruiterNotes: req.body.notes },
      { new: true }
    );
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Generate presigned URL for resume
─────────────────────────────────────────────── */
router.get('/:id/resume-url', protect, [
  param('id').custom(validateObjectId),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const app = await Application.findById(req.params.id);
    if (!app || !app.resume?.s3Key) {
      return res.status(404).json({ success: false, message: 'No resume on file' });
    }

    // In production: generate S3 presigned URL
    if (process.env.NODE_ENV === 'production' && process.env.AWS_S3_BUCKET) {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key:    app.resume.s3Key,
        ResponseContentDisposition: `inline; filename="${app.resume.originalName}"`,
      });
      const url = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min
      return res.json({ success: true, url, originalName: app.resume.originalName });
    }

    // In dev: return local path
    res.json({ success: true, url: app.resume.s3Url, originalName: app.resume.originalName });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Get single application
─────────────────────────────────────────────── */
router.get('/:id', protect, [
  param('id').custom(validateObjectId),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const app = await Application.findById(req.params.id).populate('job');
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ─────────────────────────────────────────────
   ADMIN: Delete application
─────────────────────────────────────────────── */
router.delete('/:id', protect, [
  param('id').custom(validateObjectId),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const app = await Application.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, message: 'Application deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
