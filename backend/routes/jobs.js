const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Job     = require('../models/Job');
const Application = require('../models/Application');
const { protect } = require('../middleware/auth');
const { positiveInt, validateObjectId } = require('../utils/validation');

const router = express.Router();
const validCategories = ['engineering', 'consulting', 'research', 'sales', 'operations'];
const validTypes = ['Full-Time', 'Part-Time', 'Contract'];
const validBadges = ['HOT', 'NEW', 'FEATURED', 'REMOTE', ''];
const jobValidators = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('dept').trim().notEmpty().withMessage('Department required'),
  body('location').trim().notEmpty().withMessage('Location required'),
  body('category').optional().isIn(validCategories).withMessage('Invalid category'),
  body('type').optional().isIn(validTypes).withMessage('Invalid job type'),
  body('badge').optional().isIn(validBadges).withMessage('Invalid badge'),
  body('salMin').optional().isInt({ min: 0 }).withMessage('Salary min must be 0 or more'),
  body('salMax').optional().isInt({ min: 0 }).withMessage('Salary max must be 0 or more'),
  body('requirements').optional().isArray().withMessage('Requirements must be an array'),
  body('active').optional().isBoolean().withMessage('Active must be true or false'),
  body().custom(({ salMin, salMax }) => {
    if (salMin != null && salMax != null && Number(salMin) > Number(salMax)) {
      throw new Error('Salary min cannot be greater than salary max');
    }
    return true;
  }),
];

// GET /api/jobs — public: active jobs
router.get('/', [
  query('category').optional().isIn(['all', ...validCategories]).withMessage('Invalid category'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { category, q } = req.query;
    const filter = { active: true };
    if (category && category !== 'all') filter.category = category;
    if (q) filter.$text = { $search: q };

    const jobs = await Job.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/:id — public: single job
// GET /api/jobs/admin/all — all jobs incl. inactive
router.get('/admin/all', protect, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    // Attach application counts
    const counts = await Application.aggregate([
      { $group: { _id: '$job', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id.toString()] = c.count; });
    const data = jobs.map(j => ({ ...j.toObject(), appCount: countMap[j._id.toString()] || 0 }));
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/jobs/:id — public: single job
router.get('/:id', [
  param('id').custom(validateObjectId),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/jobs — create
router.post('/', protect, jobValidators, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
  try {
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/jobs/:id — update
router.put('/:id', protect, [
  param('id').custom(validateObjectId),
  ...jobValidators,
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, data: job });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/jobs/:id
router.delete('/:id', protect, [
  param('id').custom(validateObjectId),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
