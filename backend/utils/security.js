function escapeRegex(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeSearchQuery(value, maxLength = 64) {
  return escapeRegex(String(value || '').trim().slice(0, maxLength));
}

module.exports = { escapeRegex, normalizeSearchQuery };
