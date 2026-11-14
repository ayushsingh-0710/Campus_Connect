const mongoose = require("mongoose");
const User = require("../models/User");

// Fields returned on public discovery endpoints — never includes passwordHash or email
const PUBLIC_FIELDS =
  "_id fullName university campus course yearOfStudy bio skills interests profileImage socialLinks";

/**
 * Escape a string so it is safe to embed in a RegExp.
 * Prevents ReDoS from user-supplied search strings.
 */
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * getStudents()
 *
 * Returns paginated, filterable, searchable list of public student profiles.
 * Always excludes the calling user and never returns passwordHash / email.
 *
 * @param {object} options
 * @param {string}  options.currentUserId  - ObjectId string of the logged-in user
 * @param {string}  [options.search]       - Free-text search across fullName, skills, interests
 * @param {string}  [options.campus]       - Exact campus filter
 * @param {string}  [options.course]       - Exact course filter
 * @param {number}  [options.year]         - yearOfStudy filter
 * @param {number}  [options.page=1]       - Page number (1-based)
 * @param {number}  [options.limit=12]     - Results per page (max 50)
 * @returns {Promise<object>}
 */
const getStudents = async ({
  currentUserId,
  search,
  campus,
  course,
  year,
  page = 1,
  limit = 12,
}) => {
  // ── Sanitise & clamp pagination ──────────────────────────────────────────
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (safePage - 1) * safeLimit;

  // ── Build query ───────────────────────────────────────────────────────────
  const query = { isProfilePublic: true };

  // Exclude the requesting user
  if (currentUserId && mongoose.Types.ObjectId.isValid(currentUserId)) {
    query._id = { $ne: new mongoose.Types.ObjectId(currentUserId) };
  }

  // Free-text search across fullName, skills, interests
  if (search && search.trim()) {
    const pattern = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [
      { fullName: pattern },
      { skills: pattern },
      { interests: pattern },
    ];
  }

  // Exact-match filters (case-insensitive)
  if (campus && campus.trim()) {
    query.campus = { $regex: new RegExp(`^${escapeRegex(campus.trim())}$`, "i") };
  }

  if (course && course.trim()) {
    query.course = { $regex: new RegExp(`^${escapeRegex(course.trim())}$`, "i") };
  }

  if (year !== undefined && year !== "") {
    const yearNum = parseInt(year, 10);
    if (!isNaN(yearNum)) {
      query.yearOfStudy = yearNum;
    }
  }

  // ── Execute query + count in parallel ────────────────────────────────────
  const [students, totalStudents] = await Promise.all([
    User.find(query).select(PUBLIC_FIELDS).skip(skip).limit(safeLimit).lean(),
    User.countDocuments(query),
  ]);

  return {
    students,
    pagination: {
      currentPage: safePage,
      totalPages: Math.ceil(totalStudents / safeLimit),
      totalStudents,
      limit: safeLimit,
    },
  };
};

/**
 * getStudentById()
 *
 * Returns one public student profile by MongoDB ID.
 * Throws if the ID is invalid, the user does not exist, or the profile is private.
 *
 * @param {string} id            - MongoDB ObjectId string
 * @param {string} currentUserId - ObjectId string of the logged-in user (not strictly blocked from own profile here — handled at route level if needed)
 * @returns {Promise<object>}
 */
const getStudentById = async (id, currentUserId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error("Invalid student ID");
    err.statusCode = 400;
    throw err;
  }

  const student = await User.findById(id).select(PUBLIC_FIELDS).lean();

  if (!student) {
    const err = new Error("Student not found");
    err.statusCode = 404;
    throw err;
  }

  if (!student.isProfilePublic) {
    const err = new Error("This profile is private");
    err.statusCode = 403;
    throw err;
  }

  return student;
};

module.exports = { getStudents, getStudentById };
