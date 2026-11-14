import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  sendRequestHandler,
  getReceivedRequestsHandler,
  getSentRequestsHandler,
  acceptRequestHandler,
  rejectRequestHandler,
  getConnectionsHandler,
  removeConnectionHandler,
} from "../controllers/connection.controller.js";

const router = express.Router();

// All connection routes require authentication
router.use(protect);

// ── Static paths first (before /:id to avoid route shadowing) ─────────────────

// GET  /api/connections/received  — Incoming pending requests
router.get("/received", getReceivedRequestsHandler);

// GET  /api/connections/sent      — Outgoing requests
router.get("/sent", getSentRequestsHandler);

// GET  /api/connections           — All accepted connections
router.get("/", getConnectionsHandler);

// ── Parameterised paths ───────────────────────────────────────────────────────

// POST   /api/connections/:userId/request   — Send a request to a student
router.post("/:userId/request", sendRequestHandler);

// PATCH  /api/connections/:id/accept        — Accept a received request
router.patch("/:id/accept", acceptRequestHandler);

// PATCH  /api/connections/:id/reject        — Reject a received request
router.patch("/:id/reject", rejectRequestHandler);

// DELETE /api/connections/:id               — Remove an accepted connection
router.delete("/:id", removeConnectionHandler);

export default router;
