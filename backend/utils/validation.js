const mongoose = require('mongoose');

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function validateObjectId(value) {
  if (!isValidObjectId(value)) {
    throw new Error('Invalid identifier');
  }
  return true;
}

function positiveInt(value, fallback) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
}

module.exports = {
  isValidObjectId,
  validateObjectId,
  positiveInt,
};
