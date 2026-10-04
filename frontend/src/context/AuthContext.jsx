import React, { createContext, useContext, useState, useEffect } from "react";
import authService, { defaultUser } from "../services/authService";

const AuthContext = createContext({
  user: defaultUser,
  isAuthenticated: true,
  login: async () => defaultUser,
  register: async () => defaultUser,
  logout: () => {},
  updateProfile: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
  }, []);

  const login = async (email, password) => {
    const loggedIn = await authService.login(email, password);
    setUser(loggedIn);
    setIsAuthenticated(true);
    return loggedIn;
  };

  const register = async (data) => {
    const newUser = await authService.register(data);
    setUser(newUser);
    setIsAuthenticated(true);
    return newUser;
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
  };

  const updateProfile = (data) => {
    const updated = authService.updateCurrentUser(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
