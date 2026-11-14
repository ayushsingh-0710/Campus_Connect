/**
 * Authentication Middleware for Campus Connect
 * 
 * Supports user identification via:
 * 1. x-user-id header
 * 2. Authorization header (Bearer <token_or_userId>)
 * 3. Query/Body userId (for development / testing fallbacks)
 */

export const extractUserId = (req) => {
  if (req.headers["x-user-id"]) {
    return String(req.headers["x-user-id"]).trim();
  }

  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token) return token;
  }

  if (req.query && req.query.userId) {
    return String(req.query.userId).trim();
  }

  if (req.body && req.body.userId) {
    return String(req.body.userId).trim();
  }

  return null;
};

export const requireAuth = (req, res, next) => {
  const userId = extractUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in to save or manage hackathons.",
    });
  }

  req.userId = userId;
  req.user = { id: userId };
  next();
};

export const optionalAuth = (req, res, next) => {
  const userId = extractUserId(req);
  if (userId) {
    req.userId = userId;
    req.user = { id: userId };
  }
  next();
};

export default {
  requireAuth,
  optionalAuth,
  extractUserId,
};
