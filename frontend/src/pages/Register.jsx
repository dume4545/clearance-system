import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import api from "../services/api";

// ── Faculty → Programmes map (mirrors DB enum/set exactly) ────────────────
const FACULTY_PROGRAMMES = {
  "Benjamin Carson School of Medicine and Surgery": [
    "Medicine and Surgery",
    "Anatomy",
    "Physiology",
    "Medical Laboratory Science",
  ],
  "School of Computing": [
    "Computer Science",
    "Computer Technology",
    "Information Technology",
    "Robotics",
    "Software Engineering",
  ],
  "School of Engineering Sciences": [
    "Civil Engineering",
    "Mechanical Engineering",
    "Electrical Engineering",
    "Mechatronics Engineering",
  ],
  "Felicia Adebisi School of Social Sciences": [
    "Economics",
    "Political Science",
    "International Relations",
    "Sociology",
    "International Law & Diplomacy"
  ],
  "Justice Deborah School of Law": ["Law"],
  "School of Education and Humanities": [
    "Education",
    "English and Literary Studies",
    "History and International Studies",
  ],
    "School of Public and Allied Health": [
    "Public Health",
  ],
  "School of Management Sciences": [
    "Accounting",
    "Business Administration",
    "Finance",
    "Marketing",
  ],
};
const GENDER = ["Male" , "Female"];

// ── Level rules ────────────────────────────────────────────────────────────
const SIX_YEAR  = ["Medicine and Surgery"];
const FIVE_YEAR = ["Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Mechatronics Engineering"];

function getMinLevel(programme) {
  if (SIX_YEAR.includes(programme))  return 600;
  if (FIVE_YEAR.includes(programme)) return 500;
  return 400;
}

function getAllowedLevels(programme) {
  const min = getMinLevel(programme);
  return [100, 200, 300, 400, 500, 600].filter((l) => l >= min);
}

function getLevelHint(programme) {
  if (!programme) return null;
  if (SIX_YEAR.includes(programme))
    return "Medicine & Surgery is a 6-year programme — only 600 Level students may register.";
  if (FIVE_YEAR.includes(programme))
    return `${programme} is a 5-year programme — only 500 Level students may register.`;
  return "Only final-year students (400 Level and above) may register.";
}

// ── Extract a readable error message from ANY error shape ─────────────────
// Handles: axios error, fetch error, network timeout, raw PHP string response
function extractError(err) {
  // Axios: has err.response
  if (err?.response) {
    const data = err.response.data;
    // JSON body with message field
    if (data?.message) return data.message;
    // JSON body but no message key — show the whole thing (helps debug PHP errors)
    if (typeof data === "object") return JSON.stringify(data);
    // PHP returned plain text / HTML error — show first 200 chars
    if (typeof data === "string" && data.trim()) {
      const clean = data.replace(/<[^>]+>/g, "").trim(); // strip HTML tags
      return clean.substring(0, 200) || `Server error (HTTP ${err.response.status})`;
    }
    return `Server error (HTTP ${err.response.status})`;
  }

  // Network error (no response at all — CORS block, server down, wrong URL)
  if (err?.request) {
    return "Cannot reach the server. Check that your backend is running and the API URL in .env.local is correct.";
  }

  // Custom fetch-based api.js that throws plain objects
  if (err?.message) return err.message;

  return "An unexpected error occurred. Please try again.";
}

// ── Component ──────────────────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:         "",
    email:        "",
    password:     "",
    confirmPass:  "",
    matric_number:"",
    gender:       "",
    faculty:      "",
    programme:    "",
    level:        "",
  });

  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // ── Derived ──────────────────────────────────────────────────────────────
  const programmes    = form.faculty ? FACULTY_PROGRAMMES[form.faculty] ?? [] : [];
  const allowedLevels = form.programme ? getAllowedLevels(form.programme) : [];
  const levelHint     = getLevelHint(form.programme);

  // ── Change handler ────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "faculty")    { next.programme = ""; next.level = ""; }
      if (name === "programme")  { next.level = ""; }
      return next;
    });
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  // ── Client-side validation ────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())           errs.name = "Full name is required.";
    if (!form.email.trim())          errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email.";
    if (!form.matric_number.trim())  errs.matric_number = "Matric number is required.";
    if (!form.gender)               errs.gender = "Select your gender.";
    if (!form.faculty)               errs.faculty = "Select a faculty.";
    if (!form.programme)             errs.programme = "Select a programme.";
    if (!form.level)                 errs.level = "Select your level.";
    if (!form.password)              errs.password = "Password is required.";
    else if (form.password.length < 6) errs.password = "Minimum 6 characters.";
    if (form.password !== form.confirmPass) errs.confirmPass = "Passwords do not match.";

    if (form.programme && form.level) {
      const min = getMinLevel(form.programme);
      if (parseInt(form.level) < min) {
        errs.level = `${form.programme} requires ${min} Level minimum. You selected ${form.level} Level.`;
      }
    }
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      await api.post("/auth/register", {
        name:          form.name.trim(),
        email:         form.email.trim().toLowerCase(),
        password:      form.password,
        matric_number: form.matric_number.trim().toUpperCase(),
        gender:        form.gender,
        level:         parseInt(form.level, 10),
        faculty:       form.faculty,
        programme:     form.programme,
      });
      navigate("/login?registered=1");
    } catch (err) {
      setApiError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex items-center justify-center px-4 py-10"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@700;800&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }`}
      </style>

      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white mb-5">
          <GraduationCap size={32} />
        </div>
          <h1 className="fraunces text-3xl font-bold text-white">Create Account</h1>
          <p className="text-blue-200 text-sm mt-2">Babcock University Online Clearance System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* API error — now shows the REAL server message */}
          {apiError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2.5">
              <span className="text-red-500 text-base mt-0.5 shrink-0">⚠</span>
              <p className="text-red-700 text-sm font-medium break-words">{apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <Field label="Full Name" error={errors.name}>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="SURNAME FIRST"
                className={inputCls(errors.name)} />
            </Field>

            {/* Email */}
            <Field label="Email Address" error={errors.email}>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@student.school.edu.ng"
                className={inputCls(errors.email)} />
            </Field>

            {/* Matric */}
            <Field label="Matric Number" error={errors.matric_number}>
              <input name="matric_number" value={form.matric_number} onChange={handleChange}
                placeholder="e.g. 12/3456"
                className={inputCls(errors.matric_number)} />
            </Field>
            <Field label="Gender" error={errors.gender}>
              <select name="gender" value={form.gender} onChange={handleChange}
                className={inputCls(errors.gender)}>
                <option value="">— Select Gender —</option>
               {GENDER.map((g) => (
  <option key={g} value={g}>{g}</option>
))}
              </select>
            </Field>

            {/* Faculty */}
            <Field label="Faculty" error={errors.faculty}>
              <select name="faculty" value={form.faculty} onChange={handleChange}
                className={inputCls(errors.faculty)}>
                <option value="">— Select Faculty —</option>
                {Object.keys(FACULTY_PROGRAMMES).map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>

            {/* Programme */}
            <Field label="Programme" error={errors.programme}>
              <select name="programme" value={form.programme} onChange={handleChange}
                disabled={!form.faculty}
                className={inputCls(errors.programme) + (!form.faculty ? " opacity-50 cursor-not-allowed" : "")}>
                <option value="">— Select Programme —</option>
                {programmes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {!form.faculty && (
                <p className="mt-1 text-xs text-slate-400">Select a faculty first.</p>
              )}
            </Field>

            {/* Level */}
            <Field label="Current Level" error={errors.level}>
              <select name="level" value={form.level} onChange={handleChange}
                disabled={!form.programme}
                className={inputCls(errors.level) + (!form.programme ? " opacity-50 cursor-not-allowed" : "")}>
                <option value="">— Select Level —</option>
                {allowedLevels.map((l) => (
                  <option key={l} value={l}>{l} Level</option>
                ))}
              </select>
              {levelHint && !errors.level && (
                <p className="mt-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                  ℹ {levelHint}
                </p>
              )}
            </Field>

            {/* Password */}
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input name="password" type={showPass ? "text" : "password"}
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={inputCls(errors.password) + " pr-14"} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold">
                  {showPass ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password" error={errors.confirmPass}>
              <input name="confirmPass" type={showPass ? "text" : "password"}
                value={form.confirmPass} onChange={handleChange}
                placeholder="Re-enter your password"
                className={inputCls(errors.confirmPass)} />
            </Field>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating Account...
                </>
              ) : "Create Account →"}
            </button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-800 font-semibold hover:underline">Sign in</Link>
            </p>

          </form>
        </div>

        <p className="text-center text-blue-300 text-xs mt-6">
          © {new Date().getFullYear()} Babcock University · Clearance System
        </p>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function inputCls(error) {
  return [
    "w-full px-4 py-3 rounded-xl border text-sm text-slate-800 outline-none transition-all",
    "focus:ring-2 focus:ring-blue-300 bg-white",
    error
      ? "border-red-300 focus:ring-red-200"
      : "border-slate-200 focus:border-blue-400",
  ].join(" ");
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600 font-medium">⚠ {error}</p>}
    </div>
  );
}
