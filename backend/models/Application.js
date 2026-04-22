const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Personal Info
  fname:    { type: String, required: true, trim: true },
  lname:    { type: String, required: true, trim: true },
  email:    { type: String, required: true, lowercase: true, trim: true },
  phone:    { type: String, trim: true, default: '' },
  location: { type: String, required: true },
  exp:      { type: String, required: true },
  linkedin: { type: String, trim: true, default: '' },

  // Role reference
  job:      { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  roleTitle:{ type: String, required: true }, // denormalised for quick display

  // Status pipeline
  status: {
    type: String,
    enum: ['New','Reviewing','Shortlisted','Hired','Rejected'],
    default: 'New',
  },

  // Resume
  resume: {
    originalName: { type: String, default: '' },
    s3Key:        { type: String, default: '' },       // S3 object key
    s3Url:        { type: String, default: '' },       // Public/presigned URL
    mimeType:     { type: String, default: '' },
    sizeBytes:    { type: Number, default: 0 },
    uploadedAt:   { type: Date },
  },

  // Admin assessment
  creditScore: {
    score:     { type: Number, min: 0, max: 100, default: null }, // Profile match 0–100
    notes:     { type: String, default: '' },
    scoredBy:  { type: String, default: '' },
    scoredAt:  { type: Date },
  },

  // Recruiter notes
  recruiterNotes: { type: String, default: '' },

  // PDPL consent
  consentGiven: { type: Boolean, required: true, default: false },

}, { timestamps: true });

// Full-text index for search
applicationSchema.index({ fname: 'text', lname: 'text', email: 'text', roleTitle: 'text' });

module.exports = mongoose.model('Application', applicationSchema);
