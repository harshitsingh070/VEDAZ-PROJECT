const { limits } = require('../config');

function cleanUsername(value) {
  if (typeof value !== 'string') return null;
  const name = value.trim();
  if (
    name.length < limits.usernameMinLength ||
    name.length > limits.usernameMaxLength
  ) {
    return null;
  }
  return name;
}

function cleanText(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (text.length === 0 || text.length > limits.messageMaxLength) {
    return null;
  }
  return text;
}

module.exports = { cleanUsername, cleanText };
