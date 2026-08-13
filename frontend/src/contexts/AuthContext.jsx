import React, { createContext, useState, useEffect } from "react";
import { authApi } from "../services/auth.api.js";
import { getStoredAccessToken } from "../configs/api.config.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const initAuth = async () => {
    try {
      const storedToken = getStoredAccessToken();
      if (storedToken) {
        const res = await authApi.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          return;
        }
      }

      // Try refresh session via httpOnly cookie if stored token isn't valid
      const refreshRes = await authApi.refresh();
      if (refreshRes.success) {
        const meRes = await authApi.getMe();
        if (meRes.success) {
          setUser(meRes.user);
        }
      }
    } catch (err) {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        login,
        logout,
        refreshAuth: initAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
