const { verifyToken } = require('../utils/token');

// Verifies the Bearer token and attaches { id, role, name } to req.user.
// Rejects missing/invalid/expired tokens with 401 — matches Task 10's
// "Unauthenticated users should receive an appropriate 401" requirement.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing or invalid authorization token.' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  req.user = { id: payload.sub, role: payload.role, name: payload.name };
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
    if (req.user.role !== role) return res.status(403).json({ error: `Requires ${role} role.` });
    next();
  };
}

// Allows the request through if it's the user themselves OR an admin.
// Used for endpoints like /progress/student/:studentId that admins need
// to read for analytics but students should only read for themselves.
function requireSelfOrAdmin(paramName) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized.' });
    if (req.user.role === 'admin' || req.user.id === req.params[paramName]) return next();
    return res.status(403).json({ error: 'You can only access your own data.' });
  };
}

module.exports = { requireAuth, requireRole, requireSelfOrAdmin };
