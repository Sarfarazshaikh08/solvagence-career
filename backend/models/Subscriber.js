const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  fname:     { type: String, required: true, trim: true },
  lname:     { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:     { type: String, default: '' },
  location:  { type: String, required: true },
  interest:  { type: String, required: true },
  linkedin:  { type: String, default: '' },
  marketing: { type: Boolean, default: false },
  consentGiven: { type: Boolean, required: true, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Subscriber', subscriberSchema);
