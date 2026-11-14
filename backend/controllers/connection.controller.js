const {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
  getConnections,
  removeConnection,
} = require("../services/connection.service");

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Attach a statusCode to an error so the error middleware sets the right
 * HTTP status. Falls back to the code already on the error from the service.
 */
const passError = (err, res, next) => {
  if (err.statusCode) res.status(err.statusCode);
  next(err);
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/connections/:userId/request
 * Send a connection request to another student.
 */
const sendRequestHandler = async (req, res, next) => {
  try {
    const requesterId = req.user._id;
    const recipientId = req.params.userId;

    const connection = await sendRequest(requesterId, recipientId);

    res.status(201).json({
      success: true,
      message: "Connection request sent",
      connection,
    });
  } catch (err) {
    passError(err, res, next);
  }
};

/**
 * GET /api/connections/received
 * Get all pending requests received by the logged-in user.
 */
const getReceivedRequestsHandler = async (req, res, next) => {
  try {
    const requests = await getReceivedRequests(req.user._id);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    passError(err, res, next);
  }
};

/**
 * GET /api/connections/sent
 * Get all requests the logged-in user has sent.
 */
const getSentRequestsHandler = async (req, res, next) => {
  try {
    const requests = await getSentRequests(req.user._id);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (err) {
    passError(err, res, next);
  }
};

/**
 * PATCH /api/connections/:id/accept
 * Accept a pending incoming request.
 */
const acceptRequestHandler = async (req, res, next) => {
  try {
    const connection = await respondToRequest(
      req.user._id,
      req.params.id,
      "accept"
    );

    res.status(200).json({
      success: true,
      message: "Connection request accepted",
      connection,
    });
  } catch (err) {
    passError(err, res, next);
  }
};

/**
 * PATCH /api/connections/:id/reject
 * Reject a pending incoming request.
 */
const rejectRequestHandler = async (req, res, next) => {
  try {
    const connection = await respondToRequest(
      req.user._id,
      req.params.id,
      "reject"
    );

    res.status(200).json({
      success: true,
      message: "Connection request rejected",
      connection,
    });
  } catch (err) {
    passError(err, res, next);
  }
};

/**
 * GET /api/connections
 * Get all accepted connections for the logged-in user.
 */
const getConnectionsHandler = async (req, res, next) => {
  try {
    const connections = await getConnections(req.user._id);

    res.status(200).json({
      success: true,
      count: connections.length,
      connections,
    });
  } catch (err) {
    passError(err, res, next);
  }
};

/**
 * DELETE /api/connections/:id
 * Remove an accepted connection.
 */
const removeConnectionHandler = async (req, res, next) => {
  try {
    const result = await removeConnection(req.user._id, req.params.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    passError(err, res, next);
  }
};

module.exports = {
  sendRequestHandler,
  getReceivedRequestsHandler,
  getSentRequestsHandler,
  acceptRequestHandler,
  rejectRequestHandler,
  getConnectionsHandler,
  removeConnectionHandler,
};
