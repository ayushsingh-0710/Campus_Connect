import { hackathons } from "../data/hackathons";

const HACKATHONS_STORAGE_KEY = "campus_connect_hackathons";

function getStoredHackathons() {
  try {
    const raw = localStorage.getItem(HACKATHONS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [...hackathons];
}

function saveStoredHackathons(items) {
  try {
    localStorage.setItem(HACKATHONS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const hackathonService = {
  getAllHackathons() {
    return Promise.resolve(getStoredHackathons());
  },

  getHackathonById(id) {
    const items = getStoredHackathons();
    const found = items.find((h) => h.id === id);
    return Promise.resolve(found || items[0]);
  },

  toggleRegistration(id) {
    const items = getStoredHackathons();
    let updated;
    const next = items.map((h) => {
      if (h.id === id) {
        updated = { ...h, registered: !h.registered };
        return updated;
      }
      return h;
    });
    saveStoredHackathons(next);
    return Promise.resolve(updated || items[0]);
  },
};

export default hackathonService;
