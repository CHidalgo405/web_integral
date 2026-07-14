const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key_please_change';

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(403).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1]; // Format: Bearer <token>
  if (!token) {
    return res.status(403).json({ error: 'Token format is invalid' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Unauthorized: No user role found' });
    }

    // Manager conserva su rol para auditoría, pero comparte el alcance de admin.
    const effectiveRoles = req.user.role === 'manager'
      ? new Set([req.user.role, 'admin'])
      : new Set([req.user.role]);

    if (!roles.some((role) => effectiveRoles.has(role))) {
      return res.status(403).json({ error: `Forbidden: Requires one of these roles: ${roles.join(', ')}` });
    }

    next();
  };
};

const requireExactRole = (...roles) => (req, res, next) => {
  if (!req.user?.role) return res.status(401).json({ error: 'Unauthorized: No user role found' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: `Forbidden: Requires one of these exact roles: ${roles.join(', ')}` });
  next();
};

// Auth opcional: si viene un token válido pobla req.user, si no, continúa sin él.
// Útil en endpoints públicos que se enriquecen cuando hay sesión (ej. POST /purchases).
const attachUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return next();

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Token inválido o expirado: se ignora, el request sigue como anónimo
  }
  next();
};

module.exports = {
  verifyToken,
  requireRole,
  requireExactRole,
  attachUser
};
