require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const path        = require('path');

const connectDB   = require('./config/db');

// Routes
const authRoutes  = require('./routes/auth');
const jobRoutes   = require('./routes/jobs');
const appRoutes   = require('./routes/applications');
const subRoutes   = require('./routes/subscribers');
const settingRoutes = require('./routes/settings');

// ── Connect DB (non-blocking) ─────────────────────────────────────
connectDB().catch(err => {
  console.error('⚠️  MongoDB will not be available, but server will start');
});

const app = express();

// ── Security & Middleware ─────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate Limiting ─────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  message: { success: false, message: 'Too many requests — try again shortly' },
});
app.use('/api/', apiLimiter);

// Public applications: stricter limit
const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, message: 'Too many application submissions' },
});
app.use('/api/applications', (req, res, next) => {
  if (req.method === 'POST' && req.path === '/') {
    return applyLimiter(req, res, next);
  }
  next();
});

// ── Static (dev resume preview) ───────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// ── API Routes ────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/jobs',         jobRoutes);
app.use('/api/applications', appRoutes);
app.use('/api/subscribers',  subRoutes);
app.use('/api/settings',     settingRoutes);

// ── Health check ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', env: process.env.NODE_ENV, ts: new Date() });
});

// ── Serve React build in production ───────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// ── Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.message?.includes('Only PDF')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: `File too large — max ${process.env.MAX_FILE_SIZE_MB || 10}MB` });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

// ── Start ─────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Solvagence Careers API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
}

module.exports = app;
