import express from "express";
import {
  getHackathons,
  getFeaturedHackathons,
  getSavedHackathons,
  getLocationOptions,
  getSyncStatus,
  triggerSync,
  getHackathonById,
  bookmarkHackathon,
  removeBookmark,
  checkBookmarkStatus,
} from "../controllers/hackathonController.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * Public discovery routes
 */
router.get("/", optionalAuth, getHackathons);
router.get("/featured", getFeaturedHackathons);
router.get("/location-options", getLocationOptions);

/**
 * Synchronization telemetry & protected admin triggers
 */
router.get("/sync/status", getSyncStatus);
router.post("/sync", triggerSync);

/**
 * Authenticated user bookmark management
 * Note: Placed BEFORE parameterized /:id route
 */
router.get("/saved", requireAuth, getSavedHackathons);

/**
 * Single hackathon details and bookmark status
 */
router.get("/:id", optionalAuth, getHackathonById);
router.get("/:id/bookmark", requireAuth, checkBookmarkStatus);
router.post("/:id/bookmark", requireAuth, bookmarkHackathon);
router.delete("/:id/bookmark", requireAuth, removeBookmark);

export default router;
