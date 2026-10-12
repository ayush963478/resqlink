import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setToken, getStoredToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On first load, we only have the token (not the user), so we treat a
    // stored token as "logged in" and let API calls fail through to /login
    // if the token has expired.
    const stored = localStorage.getItem("resqlink_user");
    if (getStoredToken() && stored) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password }, { auth: false });
    setToken(data.access_token);
    localStorage.setItem("resqlink_user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    return api.post("/auth/register", payload, { auth: false });
  }

  function logout() {
    setToken(null);
    localStorage.removeItem("resqlink_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
