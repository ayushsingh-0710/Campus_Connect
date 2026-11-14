const mongoose = require("mongoose");
const Connection = require("../models/Connection");
const User = require("../models/User");

// Public fields to populate when returning connection participants
const PUBLIC_FIELDS =
  "_id fullName university campus course yearOfStudy bio skills interests profileImage socialLinks";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Throw a structured error with an HTTP status code attached.
 */
const createError = (message, statusCode) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};

/**
 * Assert that a string is a valid MongoDB ObjectId.
 */
const assertValidId = (id, label = "ID") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createError(`Invalid ${label}`, 400);
  }
};

// ── Service functions ─────────────────────────────────────────────────────────

/**
 * sendRequest(requesterId, recipientId)
 *
 * Creates a pending connection request from requesterId → recipientId.
 *
 * Rules enforced:
 *  - No self-requests.
 *  - Recipient must exist and have a public profile.
 *  - No duplicate pending or accepted requests in either direction.
 *  - If a previous request was rejected, reset it to pending (re-request).
 */
const sendRequest = async (requesterId, recipientId) => {
  assertValidId(recipientId, "recipient ID");

  const reqId = new mongoose.Types.ObjectId(requesterId);
  const recId = new mongoose.Types.ObjectId(recipientId);

  // Prevent self-request
  if (reqId.equals(recId)) {
    throw createError("You cannot send a connection request to yourself", 400);
  }

  // Recipient must exist and be publicly visible
  const recipient = await User.findById(recId).select("_id isProfilePublic").lean();
  if (!recipient) {
    throw createError("Recipient not found", 404);
  }
  if (!recipient.isProfilePublic) {
    throw createError("Cannot send a request to a private profile", 403);
  }

  // Check for any existing record in either direction
  const existing = await Connection.findOne({
    $or: [
      { requester: reqId, recipient: recId },
      { requester: recId, recipient: reqId },
    ],
  });

  if (existing) {
    if (existing.status === "pending") {
      // Which direction?
      if (existing.requester.equals(reqId)) {
        throw createError("You already have a pending request to this user", 409);
      } else {
        throw createError(
          "This user has already sent you a request. Accept it instead.",
          409
        );
      }
    }

    if (existing.status === "accepted") {
      throw createError("You are already connected with this user", 409);
    }

    // Status is "rejected" — allow re-request by resetting the original record
    // Always reset to the new requester → recipient direction
    existing.requester = reqId;
    existing.recipient = recId;
    existing.status = "pending";
    await existing.save();
    return existing;
  }

  // No prior record — create fresh
  const connection = await Connection.create({
    requester: reqId,
    recipient: recId,
    status: "pending",
  });

  return connection;
};

/**
 * getReceivedRequests(userId)
 *
 * Returns pending requests where the logged-in user is the recipient.
 */
const getReceivedRequests = async (userId) => {
  const requests = await Connection.find({
    recipient: userId,
    status: "pending",
  })
    .populate("requester", PUBLIC_FIELDS)
    .lean();

  return requests;
};

/**
 * getSentRequests(userId)
 *
 * Returns all requests the logged-in user has sent (any status).
 */
const getSentRequests = async (userId) => {
  const requests = await Connection.find({ requester: userId })
    .populate("recipient", PUBLIC_FIELDS)
    .lean();

  return requests;
};

/**
 * respondToRequest(userId, connectionId, action)
 *
 * Accept or reject a pending incoming request.
 * Only the recipient of the request may call this.
 *
 * @param {string} userId       - logged-in user (must be the recipient)
 * @param {string} connectionId - Connection document _id
 * @param {string} action       - "accept" | "reject"
 */
const respondToRequest = async (userId, connectionId, action) => {
  assertValidId(connectionId, "connection ID");

  const connection = await Connection.findById(connectionId);

  if (!connection) {
    throw createError("Connection request not found", 404);
  }

  // Only the recipient may respond
  if (!connection.recipient.equals(userId)) {
    throw createError("You are not authorised to respond to this request", 403);
  }

  // Only pending requests can be acted on
  if (connection.status !== "pending") {
    throw createError(
      `This request has already been ${connection.status}`,
      409
    );
  }

  connection.status = action === "accept" ? "accepted" : "rejected";
  await connection.save();

  return connection;
};

/**
 * getConnections(userId)
 *
 * Returns all accepted connections for the logged-in user, with the
 * other participant's public profile populated.
 */
const getConnections = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);

  const connections = await Connection.find({
    $or: [{ requester: uid }, { recipient: uid }],
    status: "accepted",
  })
    .populate("requester", PUBLIC_FIELDS)
    .populate("recipient", PUBLIC_FIELDS)
    .lean();

  // Reshape so each result exposes the *other* user clearly
  return connections.map((conn) => {
    const isRequester = conn.requester._id.toString() === userId.toString();
    return {
      _id: conn._id,
      connectedUser: isRequester ? conn.recipient : conn.requester,
      createdAt: conn.createdAt,
      updatedAt: conn.updatedAt,
    };
  });
};

/**
 * removeConnection(userId, connectionId)
 *
 * Permanently deletes an accepted connection.
 * Only a participant (requester or recipient) may remove it.
 */
const removeConnection = async (userId, connectionId) => {
  assertValidId(connectionId, "connection ID");

  const uid = new mongoose.Types.ObjectId(userId);
  const connection = await Connection.findById(connectionId);

  if (!connection) {
    throw createError("Connection not found", 404);
  }

  // Only participants may remove
  const isParticipant =
    connection.requester.equals(uid) || connection.recipient.equals(uid);
  if (!isParticipant) {
    throw createError("You are not authorised to remove this connection", 403);
  }

  // Only accepted connections can be removed (pending ones should be rejected)
  if (connection.status !== "accepted") {
    throw createError(
      "Only accepted connections can be removed. Use reject for pending requests.",
      400
    );
  }

  await connection.deleteOne();

  return { message: "Connection removed successfully" };
};

module.exports = {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
  getConnections,
  removeConnection,
};
