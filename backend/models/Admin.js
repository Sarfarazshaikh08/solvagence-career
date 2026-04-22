const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username:    { type: String, required: true, unique: true, trim: true },
  password:    { type: String, required: true },
  displayName: { type: String, default: 'Admin' },
  email:       { type: String, default: '' },
  lastLogin:   { type: Date },
}, { timestamps: true });

// Hash password before save
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
