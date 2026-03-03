import { useState, useEffect, useRef } from "react";
import api from "../services/api";
import {
  GraduationCap, Banknote, BookOpen, HeartPulse, Home, ClipboardList,
  Shield, Building2, CheckCircle2, Clock, XCircle, FileText, Image,
  Loader2, Check, X, AlertTriangle, Paperclip, LogOut, ArrowRight,
  Inbox, User, ChevronRight
} from "lucide-react";

function useStaffUser() {
  try {
    const s = localStorage.getItem("user");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

const REJECTION_REASONS = {
  1: [
    "Outstanding course(s) - please specify below",
    "Academic misconduct pending",
    "Incomplete departmental records",
    "Carry-over courses not cleared",
  ],
  2: [
    "Outstanding school fees debt",
    "Invalid student account number",
    "Financial records mismatch",
    "Unpaid fines or levies",
  ],
  3: [
    "Hard copy project not yet submitted",
    "Soft copy project missing",
    "Abstract page missing",
    "Library fines outstanding",
    "Borrowed books not returned",
  ],
  4: [
    "Invalid hospital card number",
    "No health records found",
    "Outstanding medical bills",
    "Incomplete health records",
  ],
  5: [
    "Hostel records do not match",
    "Unresolved disciplinary case",
    "Invalid document submitted",
    "Hostel fees outstanding",
  ],
  6: [
    "Invalid documents submitted",
    "Outstanding grades / results",
    "Incomplete academic records",
    "JAMB letter mismatch",
    "Transcript not verified",
  ],
  7: [
    "Pending disciplinary panel",
    "Invalid ID card document",
    "Unresolved security case",
  ],
};

const DEPT_NAMES = {
  1:"HOD", 2:"Bursary", 3:"Library",
  4:"Health Centre", 5:"Hostel", 6:"Registry", 7:"Security"
};

const DEPT_ICON = {
  1: GraduationCap, 2: Banknote,  3: BookOpen,
  4: HeartPulse,   5: Home,       6: ClipboardList, 7: Shield,
};

const SUBMISSION_LABELS = {
  hospital_card_number:   "Hospital Card No.",
  student_account_number: "Student Account No.",
  hall:                   "Hall of Residence",
  semester:               "Semester",
  note:                   "Student's Note",
};

const STATUS_STYLES = {
  approved: { pill:"bg-emerald-100 text-emerald-700 border border-emerald-200", Icon: CheckCircle2 },
  pending:  { pill:"bg-amber-100 text-amber-700 border border-amber-200",       Icon: Clock        },
  rejected: { pill:"bg-red-100 text-red-700 border border-red-200",             Icon: XCircle      },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.pill}`}>
      <s.Icon size={11} strokeWidth={2.5}/>{status}
    </span>
  );
}

export default function StaffDashboard() {
  const staffUser = useStaffUser();
  const deptId    = staffUser?.department_id;
  const deptName  = DEPT_NAMES[deptId] || "Department";
  const isBursary = deptId === 2;
  const DeptIcon  = DEPT_ICON[deptId] || Building2;

  const [requests,       setRequests]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState("");
  const [filter,         setFilter]         = useState("pending");

  const [selected,       setSelected]       = useState(null);
  const [uploads,        setUploads]        = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [checkedReasons, setCheckedReasons] = useState([]);
  const [extraNote,      setExtraNote]      = useState("");
  const [acting,         setActing]         = useState(false);

  const [bursaryFile,      setBursaryFile]      = useState(null);
  const [bursaryUploading, setBursaryUploading] = useState(false);
  const bursaryRef = useRef();

  const reasons = REJECTION_REASONS[deptId] || [];

  const loadRequests = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/staff/dashboard");
      setRequests(res.data?.requests || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load requests.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadRequests(); }, []);

  const openReview = async (req) => {
    setSelected(req);
    setCheckedReasons([]);
    setExtraNote("");
    setUploads([]);
    setBursaryFile(null);
    setUploadsLoading(true);
    try {
      const res = await api.get(`/staff/uploads?request_id=${req.id}`);
      setUploads(res.data?.uploads || []);
    } catch { setUploads([]); }
    finally { setUploadsLoading(false); }
  };

  const handleBursaryFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setBursaryUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post("/staff/upload", fd);
      const upload_id = res.data?.upload_id ?? res.data?.data?.upload_id;
      setBursaryFile({ name: file.name, upload_id });
    } catch (err) {
      alert(err?.response?.data?.message || "Upload failed.");
    } finally { setBursaryUploading(false); }
  };

  const toggleReason = (r) =>
    setCheckedReasons(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const buildRejectionText = () => {
    const parts = [...checkedReasons];
    if (extraNote.trim()) parts.push(extraNote.trim());
    return parts.join("; ");
  };

  const handleAction = async (action) => {
    if (action === "rejected" && !buildRejectionText()) {
      alert("Please select at least one rejection reason."); return;
    }
    setActing(true);
    try {
      await api.post("/staff/action", {
        request_id:        selected.id,
        action,
        remarks:           action === "rejected" ? buildRejectionText() : extraNote.trim(),
        bursary_upload_id: isBursary && bursaryFile ? bursaryFile.upload_id : null,
      });
      setSelected(null);
      await loadRequests();
    } catch (err) {
      alert(err?.response?.data?.message || "Action failed.");
    } finally { setActing(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const filtered = requests.filter(r => filter === "all" || r.status === filter);
  const counts = {
    all:      requests.length,
    pending:  requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  const statCards = [
    { label:"Total",    count: counts.all,      Icon: ClipboardList,  bg:"bg-blue-900",   text:"text-white"        },
    { label:"Pending",  count: counts.pending,  Icon: Clock,          bg:"bg-amber-50",   text:"text-amber-700"    },
    { label:"Approved", count: counts.approved, Icon: CheckCircle2,   bg:"bg-emerald-50", text:"text-emerald-700"  },
    { label:"Rejected", count: counts.rejected, Icon: XCircle,        bg:"bg-red-50",     text:"text-red-700"      },
  ];

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@700;800&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }`}
      </style>

      {/* Navbar */}
      <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <DeptIcon size={18}/>
          </div>
          <div>
            <h1 className="fraunces text-xl font-bold leading-tight">{deptName} Dashboard</h1>
            <p className="text-blue-300 text-xs">Babcock University · Clearance System</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-blue-200 text-sm">
            <User size={14}/>
            <span>{staffUser?.name || staffUser?.email}</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold transition-colors">
            <LogOut size={14}/> Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {statCards.map(({ label, count, Icon, bg, text }) => (
            <div key={label} className={`${bg} rounded-2xl p-5 shadow-sm`}>
              <Icon size={20} className={`${text} opacity-70 mb-2`}/>
              <p className={`${text} text-2xl font-bold`}>{count}</p>
              <p className={`${text} text-xs font-medium mt-1 opacity-80`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["pending","approved","rejected","all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filter === f ? "bg-blue-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}>
              {f} {counts[f] > 0 && <span className="ml-1 opacity-60">({counts[f]})</span>}
            </button>
          ))}
        </div>

        {/* Request list */}
        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-slate-400">
            <Loader2 size={22} className="animate-spin"/> Loading requests...
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 text-sm">
            <AlertTriangle size={18} className="shrink-0 mt-0.5"/>{error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center text-slate-400">
            <Inbox size={44} className="mb-3 opacity-30"/>
            <p className="font-medium">No {filter} requests</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(req => (
              <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                    <User size={18} className="text-blue-700"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-bold text-slate-800 text-sm">{req.student_name}</p>
                      <StatusPill status={req.status}/>
                    </div>
                    <p className="text-slate-500 text-xs">
                      {req.matric_number} · {req.faculty} · {req.programme}
                    </p>
                    {req.remarks && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} className="shrink-0"/>
                        {req.remarks}
                      </p>
                    )}
                    <p className="text-slate-400 text-xs mt-1">
                      Submitted: {new Date(req.created_at).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })}
                    </p>
                  </div>
                </div>
                {req.status === "pending" && (
                  <button onClick={() => openReview(req)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-sm font-bold transition-colors shrink-0">
                    Review <ChevronRight size={15}/>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Review Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4 py-6 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl my-auto">

            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                <DeptIcon size={20}/>
              </div>
              <div>
                <h2 className="fraunces text-xl font-bold text-slate-800">Review Request</h2>
                <p className="text-slate-500 text-sm">
                  {selected.student_name} · {selected.matric_number} · Level {selected.level}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-5">

              {/* Submission details */}
              {selected.submission_data && (() => {
                try {
                  const data = typeof selected.submission_data === "string"
                    ? JSON.parse(selected.submission_data) : selected.submission_data;
                  const entries = Object.entries(data).filter(([k, v]) => v && !k.endsWith("_upload_id"));
                  if (!entries.length) return null;
                  return (
                    <div className="bg-slate-50 rounded-2xl p-4">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Submitted Details</p>
                      <div className="space-y-1.5">
                        {entries.map(([k, v]) => (
                          <div key={k} className="flex gap-2 text-sm">
                            <span className="text-slate-500 min-w-[160px] shrink-0">
                              {SUBMISSION_LABELS[k] || k.replace(/_/g,' ').replace(/\b\w/g, l => l.toUpperCase())}:
                            </span>
                            <span className="text-slate-800 font-medium">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } catch { return null; }
              })()}

              {/* Uploaded documents */}
              <div className="bg-slate-50 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Uploaded Documents</p>
                {uploadsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 size={14} className="animate-spin"/> Loading files...
                  </div>
                ) : uploads.length === 0 ? (
                  <p className="text-sm text-slate-400">No files uploaded for this request.</p>
                ) : (
                  <div className="space-y-2">
                    {uploads.map(u => {
                      const isImage = (u.display_name || u.file_name)?.match(/\.(jpg|jpeg|png)$/i);
                      return (
                        <a key={u.id} href={u.url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2.5 hover:border-blue-300 hover:bg-blue-50 transition-colors group">
                          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                            {isImage ? <Image size={16} className="text-blue-600"/> : <FileText size={16} className="text-blue-600"/>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-800">
                              {u.label || u.file_type}
                            </p>
                            <p className="text-xs text-slate-400 truncate">{u.display_name || u.file_name}</p>
                          </div>
                          <ArrowRight size={14} className="text-blue-500 shrink-0 group-hover:translate-x-0.5 transition-transform"/>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bursary: financial record upload */}
              {isBursary && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Paperclip size={14} className="text-amber-700"/>
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Financial Record Upload</p>
                  </div>
                  <p className="text-xs text-amber-600 mb-3">
                    Attach the student's financial record before rejecting so they can see what's owed.
                  </p>
                  {bursaryFile ? (
                    <div className="flex items-center gap-3 bg-white border border-amber-200 rounded-xl px-4 py-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <FileText size={14} className="text-amber-600"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{bursaryFile.name}</p>
                        <p className="text-xs text-emerald-600 flex items-center gap-1"><Check size={11}/> Uploaded</p>
                      </div>
                      <button onClick={() => { setBursaryFile(null); if (bursaryRef.current) bursaryRef.current.value = ""; }}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold">
                        <X size={12}/> Remove
                      </button>
                    </div>
                  ) : (
                    <div onClick={() => bursaryRef.current?.click()}
                      className={`w-full px-4 py-3 rounded-xl border-2 border-dashed text-sm cursor-pointer transition-all flex items-center gap-2
                        ${bursaryUploading
                          ? "border-amber-300 bg-amber-100 text-amber-600"
                          : "border-amber-300 hover:border-amber-500 text-amber-700 hover:bg-amber-100"}`}>
                      <input ref={bursaryRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleBursaryFile}/>
                      {bursaryUploading
                        ? <><Loader2 size={14} className="animate-spin shrink-0"/> Uploading...</>
                        : <><Paperclip size={14} className="shrink-0"/> Click to upload financial record (PDF / JPG / PNG)</>}
                    </div>
                  )}
                </div>
              )}

              {/* Rejection reasons */}
              {reasons.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">
                    Rejection Reasons <span className="text-slate-400 normal-case font-normal">(tick all that apply)</span>
                  </p>
                  <div className="space-y-2">
                    {reasons.map(r => (
                      <label key={r} className="flex items-start gap-3 cursor-pointer group">
                        <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                          ${checkedReasons.includes(r) ? "bg-blue-900 border-blue-900" : "border-slate-300 group-hover:border-blue-400"}`}
                          onClick={() => toggleReason(r)}>
                          {checkedReasons.includes(r) && <Check size={10} className="text-white" strokeWidth={3}/>}
                        </div>
                        <span className={`text-sm leading-snug ${checkedReasons.includes(r) ? "text-slate-800 font-medium" : "text-slate-600"}`}>
                          {r}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra note */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  Additional Note <span className="text-slate-400 normal-case font-normal">(optional)</span>
                </label>
                <textarea value={extraNote} onChange={e => setExtraNote(e.target.value)} rows={2}
                  placeholder="Any extra details..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-300 resize-none"/>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button onClick={() => handleAction("approved")} disabled={acting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors disabled:opacity-50">
                {acting ? <Loader2 size={15} className="animate-spin"/> : <Check size={15} strokeWidth={3}/>} Approve
              </button>
              <button onClick={() => handleAction("rejected")} disabled={acting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors disabled:opacity-50">
                {acting ? <Loader2 size={15} className="animate-spin"/> : <X size={15} strokeWidth={3}/>} Reject
              </button>
              <button onClick={() => setSelected(null)} disabled={acting}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}