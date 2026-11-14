import mongoose from "mongoose";
import Hackathon from "../models/Hackathon.js";
import HackathonBookmark from "../models/HackathonBookmark.js";
import { buildHackathonQuery, buildHackathonSort } from "../utils/hackathonFilters.js";

export const getHackathons = async (params = {}) => {
  const page = Math.max(1, parseInt(params.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(params.limit, 10) || 12));
  const skip = (page - 1) * limit;

  const query = buildHackathonQuery(params);
  const sort = buildHackathonSort(params.sort);

  const [total, hackathons] = await Promise.all([
    Hackathon.countDocuments(query),
    Hackathon.find(query).sort(sort).skip(skip).limit(limit).lean(),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    hackathons,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

export const getFeaturedHackathons = async (limit = 4) => {
  const featured = await Hackathon.find({
    isFeatured: true,
  })
    .sort({ registrationDeadline: 1 })
    .limit(limit)
    .lean();

  if (featured.length === 0) {
    // Graceful fallback to upcoming active events
    return await Hackathon.find({ status: { $ne: "Closed" } })
      .sort({ registrationDeadline: 1 })
      .limit(limit)
      .lean();
  }

  return featured;
};

export const getHackathonByIdOrSlug = async (identifier) => {
  let hackathon = null;

  if (mongoose.Types.ObjectId.isValid(identifier)) {
    hackathon = await Hackathon.findById(identifier).lean();
  }

  if (!hackathon) {
    hackathon = await Hackathon.findOne({ slug: identifier.toLowerCase() }).lean();
  }

  if (!hackathon && identifier.startsWith("demo-")) {
    hackathon = await Hackathon.findOne({ sourceId: identifier }).lean();
  }

  return hackathon;
};

export const getSavedHackathons = async (userId) => {
  if (!userId) return [];

  const bookmarks = await HackathonBookmark.find({ userId })
    .populate("hackathonId")
    .sort({ createdAt: -1 })
    .lean();

  // Extract populated hackathon objects and filter out any orphaned nulls
  return bookmarks
    .filter((b) => b.hackathonId != null)
    .map((b) => ({
      ...b.hackathonId,
      bookmarkedAt: b.createdAt,
      isBookmarked: true,
    }));
};

export const bookmarkHackathon = async (userId, hackathonIdentifier) => {
  const hackathon = await getHackathonByIdOrSlug(hackathonIdentifier);
  if (!hackathon) {
    const error = new Error("Hackathon not found");
    error.statusCode = 404;
    throw error;
  }

  const bookmark = await HackathonBookmark.findOneAndUpdate(
    { userId, hackathonId: hackathon._id },
    { $setOnInsert: { userId, hackathonId: hackathon._id, createdAt: new Date() } },
    { upsert: true, new: true }
  );

  return { bookmark, hackathon };
};

export const removeBookmark = async (userId, hackathonIdentifier) => {
  const hackathon = await getHackathonByIdOrSlug(hackathonIdentifier);
  if (!hackathon) {
    const error = new Error("Hackathon not found");
    error.statusCode = 404;
    throw error;
  }

  const result = await HackathonBookmark.deleteOne({
    userId,
    hackathonId: hackathon._id,
  });

  return { removed: result.deletedCount > 0 };
};

export const checkBookmarkStatus = async (userId, hackathonIdentifier) => {
  if (!userId) return { bookmarked: false };

  const hackathon = await getHackathonByIdOrSlug(hackathonIdentifier);
  if (!hackathon) return { bookmarked: false };

  const exists = await HackathonBookmark.exists({
    userId,
    hackathonId: hackathon._id,
  });

  return { bookmarked: Boolean(exists) };
};

export const getLocationOptions = async () => {
  const [total, indiaCount, internationalCount, unknownCount] = await Promise.all([
    Hackathon.countDocuments(),
    Hackathon.countDocuments({ countryCode: "IN" }),
    Hackathon.countDocuments({ locationType: "international" }),
    Hackathon.countDocuments({
      $or: [{ locationType: "unknown" }, { countryCode: null }],
    }),
  ]);

  const stateAgg = await Hackathon.aggregate([
    { $match: { countryCode: "IN", state: { $ne: null } } },
    {
      $group: {
        _id: { state: "$state", stateCode: "$stateCode", city: "$city" },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: { state: "$_id.state", stateCode: "$_id.stateCode" },
        stateCount: { $sum: "$count" },
        cities: {
          $push: {
            $cond: [
              {
                $and: [
                  { $ne: ["$_id.city", null] },
                  { $ne: ["$_id.city", ""] },
                ],
              },
              { name: "$_id.city", count: "$count" },
              "$$REMOVE",
            ],
          },
        },
      },
    },
    { $sort: { "_id.state": 1 } },
  ]);

  const states = stateAgg.map((item) => ({
    name: item._id.state,
    stateCode: item._id.stateCode,
    count: item.stateCount,
    cities: (item.cities || [])
      .filter((c) => c && c.name)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

  return {
    counts: {
      total,
      india: indiaCount,
      international: internationalCount,
      unknown: unknownCount,
    },
    states,
  };
};

export default {
  getHackathons,
  getFeaturedHackathons,
  getHackathonByIdOrSlug,
  getSavedHackathons,
  bookmarkHackathon,
  removeBookmark,
  checkBookmarkStatus,
  getLocationOptions,
};
