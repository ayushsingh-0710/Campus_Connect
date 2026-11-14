import api from "./api";

/**
 * Hackathon API Service Layer
 * 
 * Centralized HTTP service for hackathon discovery, details,
 * and student bookmarking interactions.
 */

export const hackathonAPI = {
  /**
   * Fetch paginated hackathons matching filters, search term, and sorting
   * @param {Object} params - { search, mode, category, status, teamSize, prizePool, participation, sort, page, limit }
   */
  async getHackathons(params = {}) {
    const response = await api.get("/hackathons", { params });
    return response.data;
  },

  /**
   * Fetch featured hackathons for hero banners and spotlights
   * @param {number} limit
   */
  async getFeaturedHackathons(limit = 4) {
    const response = await api.get("/hackathons/featured", { params: { limit } });
    return response.data;
  },

  /**
   * Fetch dynamic location filter options (counts, available Indian states & cities)
   */
  async getLocationOptions() {
    const response = await api.get("/hackathons/location-options");
    return response.data;
  },

  /**
   * Fetch complete details of a single hackathon by ID, slug, or sourceId
   * @param {string} id
   */
  async getHackathonDetails(id) {
    const response = await api.get(`/hackathons/${id}`);
    return response.data;
  },

  /**
   * Fetch saved / bookmarked hackathons for currently logged-in student
   */
  async getSavedHackathons() {
    const response = await api.get("/hackathons/saved");
    return response.data;
  },

  /**
   * Bookmark / save a hackathon
   * @param {string} id - Hackathon ID or slug
   */
  async bookmarkHackathon(id) {
    const response = await api.post(`/hackathons/${id}/bookmark`);
    return response.data;
  },

  /**
   * Remove a hackathon from bookmarks
   * @param {string} id - Hackathon ID or slug
   */
  async removeBookmark(id) {
    const response = await api.delete(`/hackathons/${id}/bookmark`);
    return response.data;
  },

  /**
   * Check if a specific hackathon is bookmarked
   * @param {string} id - Hackathon ID or slug
   */
  async checkBookmarkStatus(id) {
    const response = await api.get(`/hackathons/${id}/bookmark`);
    return response.data;
  },
};

export default hackathonAPI;
