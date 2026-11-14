import hackathonAPI from "./hackathonAPI";
import { hackathons } from "../data/hackathons";

/**
 * Backward-compatible service wrapper bridging existing legacy calls
 * to the new backend Hackathon API service.
 */
export const hackathonService = {
  async getAllHackathons() {
    try {
      const res = await hackathonAPI.getHackathons({ limit: 50 });
      if (res.data && res.data.length > 0) return res.data;
    } catch (e) {
      console.warn("Falling back to local mock hackathons:", e.message);
    }
    return hackathons;
  },

  async getHackathonById(id) {
    try {
      const res = await hackathonAPI.getHackathonDetails(id);
      if (res.data) return res.data;
    } catch (e) {
      console.warn("Falling back to local mock hackathon detail:", e.message);
    }
    return hackathons.find((h) => h.id === id) || hackathons[0];
  },

  async toggleRegistration(id) {
    try {
      const res = await hackathonAPI.bookmarkHackathon(id);
      return res.data;
    } catch (e) {
      console.warn("Toggle registration error:", e.message);
      return null;
    }
  },
};

export default hackathonService;
