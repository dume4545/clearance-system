import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function extractError(err) {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.request) return "Cannot reach the server. Check that Apache is running in XAMPP.";
  return err?.message || "An unexpected error occurred.";
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [form,     setForm]     = useState({ matric_number: "", password: "" });
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.matric_number || !form.password) {
      setError("Matric number and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", {
        matric_number: form.matric_number.trim().toUpperCase(),
        password:      form.password,
      });
      const { token, user } = res.data;
      login(user, token);
      navigate("/student", { replace: true });
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@700;800&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }`}
      </style>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-2xl mb-4">👨‍🎓</div>
          <h1 className="fraunces text-3xl font-bold text-white">Student Portal</h1>
          <p className="text-blue-200 text-sm mt-2">Babcock University · Clearance System</p>
        </div>

        {justRegistered && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-emerald-600">✓</span>
            <p className="text-emerald-700 text-sm font-medium">Account created! You can now sign in.</p>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="fraunces text-2xl font-bold text-slate-800 mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm mb-6">Use your matric number and password.</p>

          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="text-red-500 shrink-0 mt-0.5">⚠</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Matric Number</label>
              <input name="matric_number" value={form.matric_number} onChange={handleChange}
                autoComplete="username" placeholder="e.g. 21/0743"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 bg-white transition-all font-mono" />
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

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-800 font-semibold hover:underline">Create one</Link>
            </p>
          </form>
        </div>

        <div className="text-center mt-5">
          <button onClick={() => navigate("/")} className="text-blue-300 text-xs hover:text-white transition-colors">← Back to Home</button>
        </div>
        <p className="text-center text-blue-400 text-xs mt-3">© {new Date().getFullYear()} Babcock University</p>
      </div>
    </div>
  );
}