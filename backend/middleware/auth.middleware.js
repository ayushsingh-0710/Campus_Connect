/**
 * Auth Middleware — STUB
 *
 * This file is a placeholder for the JWT authentication middleware that
 * will be implemented by Developer 1 (Auth + Profile module).
 *
 * CONTRACT for Dev 1:
 * - Verify the JWT from the Authorization header (Bearer <token>) or cookie.
 * - Attach the authenticated user object to `req.user` with at minimum:
 *     { _id: <ObjectId string>, email: <string> }
 * - Call next() on success.
 * - Call next(error) with a 401 error on failure.
 *
 * CURRENT BEHAVIOUR:
 * Returns 401 for every request so routes are properly protected even before
 * real auth is wired up. Replace the entire body of this function when
 * implementing JWT verification.
 */
const protect = (req, res, next) => {
  res.status(401);
  next(
    new Error(
      "Authentication middleware not yet implemented. " +
        "Developer 1 must implement JWT verification in middleware/auth.middleware.js."
    )
  );
};

module.exports = { protect };
