import React, { createContext, useEffect, useMemo, useState } from "react";

export const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

const STORAGE_TOKEN_KEY = "broker_access_token";
const STORAGE_USER_KEY = "broker_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_TOKEN_KEY));

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(STORAGE_TOKEN_KEY);
      localStorage.removeItem(STORAGE_USER_KEY);
      setToken(null);
      setUser(null);
    };

    window.addEventListener("broker:unauthorized", handleUnauthorized);

    return () => window.removeEventListener("broker:unauthorized", handleUnauthorized);
  }, []);

  const login = ({ token: newToken, user: newUser }) => {
    localStorage.setItem(STORAGE_TOKEN_KEY, newToken);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setToken(null);
    setUser(null);
    window.location.href = "/auth/login";
  };

  const contextValue = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
