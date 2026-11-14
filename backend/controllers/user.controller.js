import { getStudents, getStudentById } from "../services/user.service.js";

/**
 * GET /api/users
 * Discover public student profiles.
 *
 * Query params: search, campus, course, year, page, limit
 */
const getStudentsHandler = async (req, res, next) => {
  try {
    const { search, campus, course, year, page, limit } = req.query;

    // req.user is populated by the auth middleware (Dev 1)
    const currentUserId = req.user?._id;

    const result = await getStudents({
      currentUserId,
      search,
      campus,
      course,
      year,
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 * View one public student profile.
 */
const getStudentByIdHandler = async (req, res, next) => {
  try {
    const student = await getStudentById(req.params.id, req.user?._id);

    res.status(200).json({
      success: true,
      student,
    });
  } catch (err) {
    // Propagate the statusCode set in the service
    if (err.statusCode) res.status(err.statusCode);
    next(err);
  }
};

export { getStudentsHandler, getStudentByIdHandler };
export default { getStudentsHandler, getStudentByIdHandler };
