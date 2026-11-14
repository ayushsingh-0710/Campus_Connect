/**
 * 404 Not Found middleware.
 * Catches any request that did not match a registered route.
 */
export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export default notFound;
