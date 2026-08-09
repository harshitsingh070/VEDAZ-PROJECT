const crypto = require('crypto');
const { cleanUsername } = require('../utils/validators');
const { limits } = require('../config');

function login({ username }) {
  const name = cleanUsername(username);
  if (!name) {
    const error = new Error(
      `Username must be ${limits.usernameMinLength}-${limits.usernameMaxLength} characters.`
    );
    error.statusCode = 400;
    throw error;
  }

  const userId = crypto
    .createHash('sha1')
    .update(name.toLowerCase())
    .digest('hex')
    .slice(0, 12);

  return { userId, username: name };
}

module.exports = { login };
