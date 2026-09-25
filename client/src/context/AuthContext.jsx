import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("devstory_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("devstory_token") || null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync token and verify user session on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("devstory_token");
      if (storedToken) {
        try {
          const response = await authApi.getMe();
          if (response.success && response.user) {
            setUser(response.user);
            localStorage.setItem("devstory_user", JSON.stringify(response.user));
          }
        } catch (error) {
          console.warn("Session expired or invalid token:", error.message);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * User Signup
   */
  const signup = async (name, email, password) => {
    const response = await authApi.signup({ name, email, password });
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("devstory_token", response.token);
      localStorage.setItem("devstory_user", JSON.stringify(response.user));
    }
    return response;
  };

  /**
   * User Signin
   */
  const login = async (email, password) => {
    const response = await authApi.signin({ email, password });
    if (response.success && response.token) {
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem("devstory_token", response.token);
      localStorage.setItem("devstory_user", JSON.stringify(response.user));
    }
    return response;
  };

  /**
   * User Logout
   */
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("devstory_token");
    localStorage.removeItem("devstory_user");
  };

  /**
   * Update current user in local state and localStorage
   */
  const updateUser = (updatedData) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem("devstory_user", JSON.stringify(merged));
      return merged;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === "admin",
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access auth state throughout the application
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
