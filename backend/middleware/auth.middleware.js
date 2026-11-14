/**
 * Auth Middleware — STUB
 *
 * This file is a placeholder for the JWT authentication middleware that
 * will be implemented by Developer 1 (Auth + Profile module).
 */
export const protect = (req, res, next) => {
  res.status(401);
  next(
    new Error(
      "Authentication middleware not yet implemented. " +
        "Developer 1 must implement JWT verification in middleware/auth.middleware.js."
    )
  );
};

export default { protect };
