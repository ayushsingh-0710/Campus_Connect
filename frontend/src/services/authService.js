
const API_URL = "http://localhost:5000/api/auth";

// Convert backend user into the format used by Campus Connect UI
const formatUser = (user) => ({
  ...user,
  id: user.id || user._id,
  name: user.fullName,
  year: user.yearOfStudy
    ? `${user.yearOfStudy}${user.yearOfStudy === 1 ? "st" : user.yearOfStudy === 2 ? "nd" : user.yearOfStudy === 3 ? "rd" : "th"} year`
    : "",
});

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

    return formatUser(result.user);
  },

  async login(email, password) {
    const result = await request("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    return formatUser(result.user);
  },

  async getCurrentUser() {
    const result = await request("/me", {
      method: "GET",
    });

    return formatUser(result.user);
  },

  async logout() {
    return request("/logout", {
      method: "POST",
    });
  },
};

export default authService;
