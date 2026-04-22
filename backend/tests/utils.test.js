const test = require('node:test');
const assert = require('node:assert/strict');

const { isValidObjectId, positiveInt } = require('../utils/validation');
const { canResetPortal } = require('../utils/environment');

test('isValidObjectId accepts valid mongoose ids', () => {
  assert.equal(isValidObjectId('507f1f77bcf86cd799439011'), true);
  assert.equal(isValidObjectId('not-an-id'), false);
});

test('positiveInt falls back for invalid values', () => {
  assert.equal(positiveInt('10', 1), 10);
  assert.equal(positiveInt('-5', 1), 1);
  assert.equal(positiveInt('abc', 3), 3);
});

test('canResetPortal is blocked in production by default', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalAllowReset = process.env.ALLOW_ADMIN_RESET;

  process.env.NODE_ENV = 'production';
  delete process.env.ALLOW_ADMIN_RESET;
  assert.equal(canResetPortal(), false);

  process.env.ALLOW_ADMIN_RESET = 'true';
  assert.equal(canResetPortal(), true);

  process.env.NODE_ENV = originalNodeEnv;
  process.env.ALLOW_ADMIN_RESET = originalAllowReset;
});
