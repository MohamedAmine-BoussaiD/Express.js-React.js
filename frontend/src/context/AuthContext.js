import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AuthService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(AuthService.getLocalUser());
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // On mount, validate token by fetching /me
  useEffect(() => {
    const init = async () => {
      if (AuthService.isAuthenticated()) {
        try {
          const freshUser = await AuthService.getMe();
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        } catch {
          // Token invalid or expired
          AuthService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    const data = await AuthService.login(email, password);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    setError(null);
    const data = await AuthService.register(formData);
    if (data.data?.token) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));
      setUser(data.data.user);
    }
    return data;
  }, []);

  const logout = useCallback(() => {
    AuthService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
