import api from "./api";

/**
 * connectionService — wired to /api/connections/*
 *
 * Replaces the previous mock implementation that used localStorage.
 * Uses the shared axios instance; Vite proxy forwards /api → http://localhost:5000.
 *
 * API shape from backend:
 *   GET  /api/connections           → { success, connections: [{ _id, connectedUser, createdAt }] }
 *   GET  /api/connections/received  → { success, requests: [{ _id, requester, recipient, status }] }
 *   GET  /api/connections/sent      → { success, requests: [...] }
 *   POST /api/connections/:id/request
 *   PATCH /api/connections/:id/accept
 *   PATCH /api/connections/:id/reject
 *   DELETE /api/connections/:id
 */
export const connectionService = {
  /**
   * Get all accepted connections for the logged-in user.
   * Returns array of { _id, connectedUser, createdAt }
   */
  async getConnections() {
    const { data } = await api.get("/connections");
    return data.connections || [];
  },

  /**
   * Get pending incoming requests.
   * Returns array of connection documents with populated `requester`.
   */
  async getPendingRequests() {
    const { data } = await api.get("/connections/received");
    return data.requests || [];
  },

  /**
   * Get outgoing requests sent by the logged-in user.
   */
  async getSentRequests() {
    const { data } = await api.get("/connections/sent");
    return data.requests || [];
  },

  /**
   * Send a connection request to a student.
   * @param {string} recipientId - MongoDB _id of the recipient
   */
  async sendConnectionRequest(recipientId) {
    const { data } = await api.post(`/connections/${recipientId}/request`);
    return data.connection;
  },

  /**
   * Accept a pending incoming request.
   * @param {string} connectionId - MongoDB _id of the Connection document
   */
  async acceptRequest(connectionId) {
    const { data } = await api.patch(`/connections/${connectionId}/accept`);
    return data.connection;
  },

  /**
   * Reject a pending incoming request.
   * @param {string} connectionId - MongoDB _id of the Connection document
   */
  async rejectRequest(connectionId) {
    const { data } = await api.patch(`/connections/${connectionId}/reject`);
    return data.connection;
  },

  /**
   * Remove an accepted connection.
   * @param {string} connectionId - MongoDB _id of the Connection document
   */
  async removeConnection(connectionId) {
    const { data } = await api.delete(`/connections/${connectionId}`);
    return data;
  },
};

export default connectionService;
