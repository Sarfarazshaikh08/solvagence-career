const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  titleAr:     { type: String, default: '', trim: true },
  dept:        { type: String, required: true },
  category:    { type: String, enum: ['engineering','consulting','research','sales','operations'], default: 'operations' },
  location:    { type: String, required: true },
  type:        { type: String, enum: ['Full-Time','Part-Time','Contract'], default: 'Full-Time' },
  salMin:      { type: Number, default: 0 },
  salMax:      { type: Number, default: 0 },
  badge:       { type: String, enum: ['HOT','NEW','FEATURED','REMOTE',''], default: '' },
  icon:        { type: String, default: '💼' },
  active:      { type: Boolean, default: true },
  desc:        { type: String, default: '' },
  descAr:      { type: String, default: '', trim: true },
  requirements:{ type: [String], default: [] },
  requirementsAr:{ type: [String], default: [] },
}, { timestamps: true });

jobSchema.index({
  title: 'text',
  titleAr: 'text',
  dept: 'text',
  desc: 'text',
  descAr: 'text',
  requirements: 'text',
  requirementsAr: 'text',
});

jobSchema.virtual('applicationCount', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
  count: true,
});

module.exports = mongoose.model('Job', jobSchema);
