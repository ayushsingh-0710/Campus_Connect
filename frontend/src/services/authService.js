import { students } from "../data/students";

const CURRENT_USER_KEY = "campus_connect_user";

// Default logged in user (Maya Chen)
export const defaultUser = {
  ...students[0],
  email: "maya.chen@university.edu",
};

export const authService = {
  getCurrentUser() {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    return defaultUser;
  },

  updateCurrentUser(updates) {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return updated;
  },

  login(email, _password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = { ...defaultUser, email };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        resolve(user);
      }, 300);
    });
  },

  register(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newUser = {
          ...defaultUser,
          id: data.name ? data.name.toLowerCase().replace(/\s+/g, "-") : "user-1",
          name: data.name || "New Student",
          email: data.email || "student@university.edu",
          university: data.university || "Riverside University",
          campus: data.campus || "North Campus",
          course: data.course || "Computer Science",
          year: data.year || "1st year",
          skills: data.skills || ["React", "Python"],
          bio: data.bio || "Student passionate about building practical software.",
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
        resolve(newUser);
      }, 300);
    });
  },

  logout() {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch {
      // ignore
    }
  },
};

export default authService;
