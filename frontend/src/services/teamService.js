import { teams } from "../data/teams";
import { photos } from "../data/students";

const TEAMS_STORAGE_KEY = "campus_connect_teams";

function getStoredTeams() {
  try {
    const raw = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [...teams];
}

function saveStoredTeams(items) {
  try {
    localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const teamService = {
  getAllTeams() {
    return Promise.resolve(getStoredTeams());
  },

  getTeamById(id) {
    const items = getStoredTeams();
    const found = items.find((t) => t.id === id);
    return Promise.resolve(found || items[0]);
  },

  createTeam(data) {
    const items = getStoredTeams();
    const newTeam = {
      id: data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `team-${Date.now()}`,
      name: data.name,
      desc: data.desc,
      fullDesc: `${data.desc} We are forming a team to build this project together and are looking for enthusiastic student contributors.`,
      hackathonName: data.hackathonName || "Build for Good 2025",
      membersCount: 1,
      members: [
        {
          name: "Maya Chen",
          role: "Team Lead",
          photo: photos[0],
          studentId: "maya-chen",
        },
      ],
      skills: data.skills && data.skills.length > 0 ? data.skills : ["React", "Design", "General"],
      openRoles: ["Frontend Developer", "Designer"],
      colorVariant: items.length % 2,
    };
    const next = [newTeam, ...items];
    saveStoredTeams(next);
    return Promise.resolve(newTeam);
  },
};

export default teamService;
