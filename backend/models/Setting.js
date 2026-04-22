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
  publicContent: {
    hero: {
      badgeText:    { type: String, default: "We're Hiring · DIFC Dubai & Remote" },
      titleLine1:   { type: String, default: 'Build the AI Future' },
      titleLine2:   { type: String, default: 'from the Heart' },
      titleLine3:   { type: String, default: 'of the Gulf' },
      subtitle:     { type: String, default: "Solvagence AI Consulting is the GCC's premier enterprise AI transformation firm — headquartered in DIFC Dubai, operating across 12+ countries." },
      ctaPrimary:   { type: String, default: 'View Open Roles' },
      ctaSecondary: { type: String, default: 'Get Career Alerts' },
      stats: {
        type: [{
          value: { type: String, required: true, trim: true },
          label: { type: String, required: true, trim: true },
        }],
        default: [
          { value: '35+', label: 'Open Positions' },
          { value: '12+', label: 'Countries Active' },
          { value: '92%', label: 'Team Satisfaction' },
          { value: '4×', label: 'YoY Growth' },
        ],
      },
    },
    sections: {
      openRolesTitle: { type: String, default: 'Find Your Role' },
      openRolesDesc:  { type: String, default: 'From frontier AI engineering to C-suite consulting — exceptional people, exceptional work.' },
      whyTitle:       { type: String, default: 'Where Excellence Meets Purpose' },
      benefitsTitle:  { type: String, default: 'Rewarding Excellence at Every Level' },
      processTitle:   { type: String, default: 'Transparent, Respectful & Fast' },
      signupTitle:    { type: String, default: 'Get Early Access to New Roles' },
    },
    whyJoinUs: {
      type: [{
        icon: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
        desc: { type: String, required: true, trim: true },
      }],
      default: [],
    },
    benefits: {
      type: [{
        icon: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
        desc: { type: String, required: true, trim: true },
      }],
      default: [],
    },
    hiringJourney: {
      type: [{
        num: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
        desc: { type: String, required: true, trim: true },
      }],
      default: [],
    },
    footer: {
      blurb:         { type: String, default: 'Enterprise AI transformation, headquartered in DIFC Dubai. Building the AI future across GCC, Middle East, India, and USA.' },
      locationBadge: { type: String, default: 'DIFC, Dubai, UAE' },
    },
  },
  updatedBy: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
