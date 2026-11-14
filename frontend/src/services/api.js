import axios from "axios";
import { authService } from "./authService";

/**
 * Campus Connect Core Axios Instance
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Attach authenticated user credentials to outgoing requests
api.interceptors.request.use(
  (config) => {
    try {
      const user = authService.getCurrentUser();
      if (user?.id) {
        config.headers["x-user-id"] = user.id;
      }
    } catch (e) {
      // Ignore if localStorage unavailable
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred while communicating with the server.";
    console.error("[API Error]", message);
    return Promise.reject(error);
  }
);

export default api;
