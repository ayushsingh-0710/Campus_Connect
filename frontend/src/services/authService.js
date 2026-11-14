const API_URL = "http://localhost:5000/api/auth";
const CURRENT_USER_KEY = "campus_connect_user";

// Convert backend user into the format used by Campus Connect UI
const formatUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user.id || user._id,
    name: user.fullName || user.name || "Student",
    year: user.yearOfStudy
      ? `${user.yearOfStudy}${user.yearOfStudy === 1 ? "st" : user.yearOfStudy === 2 ? "nd" : user.yearOfStudy === 3 ? "rd" : "th"} year`
      : "",
  };
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user) => {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch {
    // Ignore storage quota or access errors
  }
};

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const authService = {
  getStoredUser,

  async register(data) {
    const result = await request("/register", {
      method: "POST",
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        university: data.university,
        campus: data.campus,
        course: data.course,
        yearOfStudy: data.yearOfStudy,
        skills: data.skills,
      }),
    });

    const user = formatUser(result.user);
    setStoredUser(user);
    return user;
  },

  async login(email, password) {
    const result = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const user = formatUser(result.user);
    setStoredUser(user);
    return user;
  },

  async getCurrentUser() {
    try {
      const result = await request("/me", {
        method: "GET",
      });

      const user = formatUser(result.user);
      setStoredUser(user);
      return user;
    } catch (err) {
      setStoredUser(null);
      throw err;
    }
  },

  async logout() {
    try {
      return await request("/logout", {
        method: "POST",
      });
    } finally {
      setStoredUser(null);
    }
  },
};

export { authService };
export default authService;
