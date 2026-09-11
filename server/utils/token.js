const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'coursepath_super_secret_change_me';
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

function issueToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, name: user.name }, SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { issueToken, verifyToken, SECRET };
