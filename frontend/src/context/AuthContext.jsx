import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on page refresh ────────────────────────────────────────
  useEffect(() => {
    const savedUser  = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  // ── login — called by Login.jsx after successful API response ───────────────
  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user",  JSON.stringify(userData));
    setUser(userData);
  };

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Correct path — no .php extension, no double /api
        await api.post("/auth/logout");
      } catch {
        // Ignore errors on logout
      }
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}