function canResetPortal() {
  return process.env.NODE_ENV !== 'production' || process.env.ALLOW_ADMIN_RESET === 'true';
}

module.exports = { canResetPortal };
