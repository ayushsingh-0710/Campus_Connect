import * as hackathonService from "../services/hackathonService.js";
import { hackathonSyncService } from "../services/hackathonSyncService.js";

/**
 * GET /api/hackathons
 * Fetch paginated, filtered, and sorted hackathons
 */
export const getHackathons = async (req, res, next) => {
  try {
    const { hackathons, pagination } = await hackathonService.getHackathons(req.query);

    return res.status(200).json({
      success: true,
      count: hackathons.length,
      pagination,
      data: hackathons,
      attribution: "Opportunity listings powered by Brabble.ai",
      attributionUrl: "https://brabble.ai",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/hackathons/featured
 * Fetch top featured hackathons
 */
export const getFeaturedHackathons = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 4;
    const featured = await hackathonService.getFeaturedHackathons(limit);

    return res.status(200).json({
      success: true,
      count: featured.length,
      data: featured,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/hackathons/saved
 * Fetch saved/bookmarked hackathons for authenticated student
 */
export const getSavedHackathons = async (req, res, next) => {
  try {
    const userId = req.userId;
    const saved = await hackathonService.getSavedHackathons(userId);

    return res.status(200).json({
      success: true,
      count: saved.length,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/hackathons/location-options
 * Fetch available geographic filter options (India/International/Unknown counts, states & cities)
 */
export const getLocationOptions = async (req, res, next) => {
  try {
    const locationOptions = await hackathonService.getLocationOptions();

    return res.status(200).json({
      success: true,
      data: locationOptions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/hackathons/sync/status
 * Telemetry endpoint returning last sync timestamps and stats
 */
export const getSyncStatus = (req, res) => {
  const info = hackathonSyncService.getLastSyncInfo();
  return res.status(200).json({
    success: true,
    ...info,
  });
};

/**
 * POST /api/hackathons/sync
 * Protected manual synchronization trigger (development or admin key authorized)
 */
export const triggerSync = async (req, res, next) => {
  try {
    const adminKey = req.headers["x-admin-key"] || req.query.adminKey;
    const isDev = process.env.NODE_ENV === "development";

    if (!isDev && (!adminKey || adminKey !== process.env.ADMIN_KEY)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Admin privileges required to trigger manual synchronization.",
      });
    }

    const providerName = req.body?.provider || process.env.HACKATHON_API_PROVIDER || "brabble";
    const fetchAll = req.body?.fetchAll !== false;

    console.log(`[Admin API] Manual sync triggered for provider: ${providerName}`);
    const stats = await hackathonSyncService.syncFromProvider(providerName, {
      limit: 200,
      fetchAll,
    });

    return res.status(200).json({
      success: true,
      message: `Synchronization completed for provider "${providerName}"`,
      stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/hackathons/:id
 * Fetch complete hackathon details by MongoDB _id, slug, or sourceId
 */
export const getHackathonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hackathon = await hackathonService.getHackathonByIdOrSlug(id);

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: `Hackathon not found with identifier "${id}"`,
      });
    }

    return res.status(200).json({
      success: true,
      data: hackathon,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/hackathons/:id/bookmark
 * Bookmark a hackathon for authenticated student
 */
export const bookmarkHackathon = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await hackathonService.bookmarkHackathon(userId, id);

    return res.status(201).json({
      success: true,
      message: "Hackathon bookmarked successfully",
      data: result.bookmark,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/hackathons/:id/bookmark
 * Remove a bookmark for authenticated student
 */
export const removeBookmark = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const result = await hackathonService.removeBookmark(userId, id);

    return res.status(200).json({
      success: true,
      message: "Bookmark removed successfully",
      removed: result.removed,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/hackathons/:id/bookmark
 * Check if a hackathon is bookmarked by authenticated student
 */
export const checkBookmarkStatus = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const status = await hackathonService.checkBookmarkStatus(userId, id);

    return res.status(200).json({
      success: true,
      bookmarked: status.bookmarked,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getHackathons,
  getFeaturedHackathons,
  getSavedHackathons,
  getSyncStatus,
  triggerSync,
  getHackathonById,
  bookmarkHackathon,
  removeBookmark,
  checkBookmarkStatus,
};
