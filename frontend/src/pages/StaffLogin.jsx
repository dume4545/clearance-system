import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function extractError(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.request) return "Cannot reach the server. Check that Apache is running in XAMPP.";
  return err?.message || "An unexpected error occurred.";
}

export default function StaffLogin() {
  const navigate = useNavigate();

  const [form,     setForm]     = useState({ email: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Email and password are required."); return; }
    setLoading(true); setError("");
    try {
      // Call the unified login endpoint
      const res = await api.post("/auth/login", {
        matric_number: form.email.trim(),   // login.php accepts email here too
        password:      form.password,
      });

      const { token, user } = res.data;

      if (user.role === "student") {
        setError("This portal is for staff only. Students please use the student login.");
        return;
      }

      // Save to localStorage FIRST (synchronous), then navigate
      localStorage.setItem("token", token);
      localStorage.setItem("user",  JSON.stringify(user));

      // Hard navigate — bypasses React router state timing issues entirely
      if (user.role === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/staff";
      }

    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@700;800&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }`}
      </style>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-2xl mb-4">🏛️</div>
          <h1 className="fraunces text-3xl font-bold text-white">Staff Portal</h1>
          <p className="text-blue-200 text-sm mt-2">Babcock University · Clearance System</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl w-fit">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-blue-800 text-xs font-semibold uppercase tracking-wide">Staff / Admin Access</span>
          </div>

          <h2 className="fraunces text-2xl font-bold text-slate-800 mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm mb-6">Use your staff email and password.</p>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                autoComplete="email" placeholder="you@babcock.edu.ng"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition-all" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Password</label>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"}
                  value={form.password} onChange={handleChange}
                  autoComplete="current-password" placeholder="••••••••"
                  className="w-full px-4 py-3 pr-14 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold">
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Signing in...</>
              ) : "Sign In →"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button onClick={() => navigate("/")}
              className="text-xs text-slate-400 hover:text-blue-800 transition-colors font-medium">
              ← Back to Home
            </button>
          </div>
        </div>
        <p className="text-center text-blue-400 text-xs mt-6">© {new Date().getFullYear()} Babcock University</p>
      </div>
    </div>
  );
}