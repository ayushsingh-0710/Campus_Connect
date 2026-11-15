import api from "./api";

/**
 * studentService — wired to GET /api/users and GET /api/users/:id
 *
 * Replaces the previous mock implementation that read from local data files.
 * Uses the shared axios instance from api.js which handles cookies and
 * the Vite proxy forwards /api → http://localhost:5000.
 */
export const studentService = {
  /**
   * Fetch all public students (paginated).
   * Returns { students, pagination }
   */
  async getAllStudents({ page = 1, limit = 50 } = {}) {
    const { data } = await api.get("/users", { params: { page, limit } });
    return data.students || [];
  },

  /**
   * Fetch a single public student profile by MongoDB _id.
   */
  async getStudentById(id) {
    const { data } = await api.get(`/users/${id}`);
    return data.student;
  },

  /**
   * Search and filter students.
   * Maps the UI filter shape to the backend query params.
   */
  async searchStudents(filters = {}) {
    const params = {};

    if (filters.query?.trim())    params.search = filters.query.trim();
    if (filters.campus?.trim())   params.campus = filters.campus.trim();
    if (filters.course?.trim())   params.course = filters.course.trim();
    if (filters.skill?.trim())    params.search = params.search || filters.skill.trim(); // skill goes via search
    if (filters.interest?.trim()) params.search = params.search || filters.interest.trim();
    if (filters.year)             params.year   = filters.year;
    if (filters.page)             params.page   = filters.page;
    if (filters.limit)            params.limit  = filters.limit;

    const { data } = await api.get("/users", { params });
    return data.students || [];
  },
};

export default studentService;
