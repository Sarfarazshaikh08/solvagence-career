const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global' },
  company: {
    name:         { type: String, default: 'Solvagence AI Consulting Limited' },
    careersEmail: { type: String, default: 'careers@solvagence.com' },
    hqLocation:   { type: String, default: 'DIFC, Dubai, UAE' },
    website:      { type: String, default: 'https://solvagence.com' },
  },
  notifications: {
    newApplicationAlert: { type: Boolean, default: true },
    dailyDigest:         { type: Boolean, default: true },
    newSubscriberAlert:  { type: Boolean, default: false },
    weeklyAnalytics:     { type: Boolean, default: true },
  },
  updatedBy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
