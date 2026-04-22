const multer    = require('multer');
const multerS3  = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const path      = require('path');
const { v4: uuidv4 } = require('uuid');

/* ─────────────────────────────────────────────
   S3 Client
───────────────────────────────────────────── */
const s3 = new S3Client({
  region: process.env.AWS_REGION,
 
});

/* ─────────────────────────────────────────────
   File filter — PDF, DOC, DOCX only
───────────────────────────────────────────── */
const fileFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are accepted'), false);
  }
};

/* ─────────────────────────────────────────────
   Storage strategy — S3 in production,
   local disk in development
───────────────────────────────────────────── */
let storage;

if (process.env.NODE_ENV === 'production' &&
    process.env.AWS_S3_BUCKET) {
  // ── S3 Storage ────────────────────────────
  storage = multerS3({
    s3,
    bucket: process.env.AWS_S3_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const ext  = path.extname(file.originalname);
      const key  = `resumes/${uuidv4()}${ext}`;
      cb(null, key);
    },
  });
} else {
  // ── Local disk (dev) ──────────────────────
  const fs   = require('fs');
  const dir  = process.env.UPLOAD_DIR || 'uploads';
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename:    (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
});

module.exports = { upload, s3 };
