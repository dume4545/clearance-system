import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import { GraduationCap, Building2, ArrowRight } from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin")       navigate("/admin",   { replace: true });
    else if (user.role === "staff")  navigate("/staff",   { replace: true });
    else                             navigate("/student", { replace: true });
  }, [user, navigate]);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 flex flex-col items-center justify-center px-4 py-12"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@700;800;900&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }
        .portal-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .portal-card:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,0.25); }
        .portal-card:active { transform: translateY(-1px); }
      `}</style>

      {/* Logo + Title */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white mb-5">
          <GraduationCap size={32} />
        </div>
        <h1 className="fraunces text-4xl md:text-5xl font-bold text-white mb-3">
          Online Clearance System
        </h1>
        <p className="text-blue-200 text-base">
          Babcock University · 2025/2026 Academic Session
        </p>
      </div>

      {/* Portal Cards */}
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">

        {/* Student Card */}
        <button
          onClick={() => navigate("/login")}
          className="portal-card bg-white rounded-3xl p-8 text-left shadow-xl w-full"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 mb-5">
            <GraduationCap size={28} />
          </div>
          <h2 className="fraunces text-2xl font-bold text-slate-800 mb-2">
            Student Portal
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Final year students, submit and track your departmental clearance requests here.
          </p>
          <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
            Sign in as Student <ArrowRight size={16} />
          </div>
        </button>

        {/* Staff Card */}
        <button
          onClick={() => navigate("/staff/login")}
          className="portal-card bg-blue-900/60 border border-white/10 backdrop-blur-sm rounded-3xl p-8 text-left shadow-xl w-full"
        >
          <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-5">
            <Building2 size={28} />
          </div>
          <h2 className="fraunces text-2xl font-bold text-white mb-2">
            Staff Portal
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-6">
            Department staff and administrators review, approve or reject student clearance requests.
          </p>
          <div className="flex items-center gap-2 text-blue-200 font-bold text-sm">
            Sign in as Staff <ArrowRight size={16} />
          </div>
        </button>
      </div>

      {/* Footer */}
      <p className="text-blue-400 text-xs mt-12">
        © {new Date().getFullYear()} Babcock University · All rights reserved
      </p>
    </div>
  );
}