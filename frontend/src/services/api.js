import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 15000,
});

// ── Attach Bearer token to every request ─────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── On 401, only redirect if it's NOT a login request ────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isLoginEndpoint = url.includes("/auth/login") || url.includes("/auth/staff_login");

    if (err.response?.status === 401 && !isLoginEndpoint) {
      // Session expired on a protected route — redirect to appropriate login
      let role = null;
      try {
        const stored = localStorage.getItem("user");
        if (stored) role = JSON.parse(stored)?.role;
      } catch { /* ignore */ }

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const dest = (role === "staff" || role === "admin") ? "/staff/login" : "/";
      if (window.location.pathname !== dest) {
        window.location.href = dest;
      }
    }

    return Promise.reject(err);
  }
);

export default api;