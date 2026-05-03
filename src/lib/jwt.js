import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
const EXPIRY = '7d';

export function signToken(userId) {
  return jwt.sign({ userId }, SECRET, { expiresIn: EXPIRY });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(request) {
  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Bearer ')) {
    return auth.slice(7);
  }
  return null;
}
