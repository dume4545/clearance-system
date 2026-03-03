import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  GraduationCap, Banknote, BookOpen, HeartPulse, Home, ClipboardList,
  Shield, Building2, CheckCircle2, Clock, XCircle, FileText, Image,
  Loader2, Check, X, AlertTriangle, Info, Paperclip, LogOut,
  LayoutDashboard, Bell, FolderOpen, Star, RefreshCw,
  ChevronDown, ChevronUp, Inbox, ArrowUpRight
} from "lucide-react";

// ── Constants ──────────────────────────────────────────────────────────────
const DEPT_ICON_MAP = { HOD:GraduationCap, BURSARY:Banknote, LIBRARY:BookOpen, HEALTH:HeartPulse, HOSTEL:Home, REGISTRY:ClipboardList, SEC:Shield };

const DEPT_NAMES = { HOD:"HOD/Faculty", HEALTH:"Health Centre", SEC:"Security",
                     LIBRARY:"Library", BURSARY:"Bursary/Finance",
                     HOSTEL:"Hostel Administration", REGISTRY:"Academic Registry" };

const PREREQS = {
  LIBRARY:  ["HOD"],
  HEALTH:   ["HOD"],
  SEC:      ["HOD"],
  BURSARY:  ["HOD","HEALTH","SEC"],
  HOSTEL:   ["HOD","SEC","HEALTH","LIBRARY","BURSARY"],
  REGISTRY: ["HOD","SEC","HEALTH","LIBRARY","BURSARY","HOSTEL"],
};

const MALE_HALLS   = ["Nelson Mandela","Samuel Akande","Gideon Troopers","Welch","Topaz","Emerald","Neal Wilson","Winslow"];
const FEMALE_HALLS = ["Veronica Adeleke","Ameyo Adadevoh","White","Crystal","Sapphire","Diamond","Queen Esther"];

const STATUS = {
  approved:      { label:"Approved",    accent:"bg-emerald-400", bg:"bg-emerald-50",  text:"text-emerald-700", border:"border-emerald-200", dot:"bg-emerald-500", badge:"bg-emerald-100 text-emerald-700", step:"border-emerald-400 bg-emerald-50 text-emerald-600" },
  pending:       { label:"Pending",     accent:"bg-amber-400",   bg:"bg-amber-50",    text:"text-amber-700",   border:"border-amber-200",   dot:"bg-amber-400",   badge:"bg-amber-100 text-amber-700",    step:"border-amber-400 bg-amber-50 text-amber-600"   },
  rejected:      { label:"Rejected",    accent:"bg-red-400",     bg:"bg-red-50",      text:"text-red-700",     border:"border-red-200",     dot:"bg-red-500",     badge:"bg-red-100 text-red-700",        step:"border-red-400 bg-red-50 text-red-600"         },
  not_requested: { label:"Not Started", accent:"bg-slate-200",   bg:"bg-slate-50",    text:"text-slate-500",   border:"border-slate-200",   dot:"bg-slate-300",   badge:"bg-slate-100 text-slate-500",    step:"border-slate-200 bg-slate-50 text-slate-400"  },
};

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", { day:"numeric", month:"short", year:"numeric" });
}

function StatusBadge({ status }) {
  const c = STATUS[status] || STATUS.not_requested;
  const icons = {
    approved: <Check size={10} strokeWidth={3}/>,
    pending:  <Clock size={10}/>,
    rejected: <X size={10} strokeWidth={3}/>,
    not_requested: <span className="w-1.5 h-1.5 rounded-full bg-slate-400 inline-block"/>,
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.badge}`}>
      {icons[status] || icons.not_requested}{c.label}
    </span>
  );
}

function ProgressRing({ pct }) {
  const r = 54, circ = 2 * Math.PI * r, dash = (pct / 100) * circ;
  return (
    <svg width="140" height="140" style={{ transform:"rotate(-90deg)" }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="10"/>
      <circle cx="70" cy="70" r={r} fill="none" stroke="url(#rg)" strokeWidth="10"
        strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
        style={{ transition:"stroke-dasharray 1.2s ease" }}/>
      <defs><linearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#93c5fd"/><stop offset="100%" stopColor="#ffffff"/>
      </linearGradient></defs>
    </svg>
  );
}

// ── File Upload Helper ─────────────────────────────────────────────────────
function FileField({ label, fieldName, onUploaded, accept = ".pdf,.jpg,.jpeg,.png", required }) {
  const [status,   setStatus]   = useState("idle");
  const [filename, setFilename] = useState("");
  const [errMsg,   setErrMsg]   = useState("");
  const ref = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus("uploading");
    setErrMsg("");

    const fd = new FormData();
    fd.append("file",      file);
    fd.append("file_type", fieldName);   // FIX: was "field"

    try {
      const res = await api.post("/student/upload", fd);
      const upload_id = res.data?.upload_id ?? res.data?.data?.upload_id;
      if (!upload_id) throw new Error("No upload_id in response");
      setFilename(file.name);
      setStatus("done");
      onUploaded(upload_id);             // FIX: was res.data.path
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Upload failed.";
      setErrMsg(msg);
      setStatus("error");
    }
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`w-full px-4 py-3 rounded-xl border-2 border-dashed text-sm cursor-pointer transition-all
          ${status === "done"  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
          : status === "error" ? "border-red-300 bg-red-50 text-red-600"
          : "border-slate-200 hover:border-blue-300 text-slate-500"}`}
      >
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={handleFile}/>
        {status === "uploading" && <span className="flex items-center gap-1.5"><Loader2 size={14} className="animate-spin"/>Uploading...</span>}
        {status === "done"      && <span className="flex items-center gap-1.5"><Check size={14}/>  {filename}</span>}
        {status === "error"     && <span className="flex items-center gap-1.5"><X size={14}/>{errMsg}</span>}
        {status === "idle"      && <span className="flex items-center gap-1.5"><Paperclip size={14}/>Click to upload ({accept.replace(/\./g,"").toUpperCase()})</span>}
      </div>
    </div>
  );
}

// ── Department-specific Modal Content ─────────────────────────────────────
// FIX: all metadata keys end in "_upload_id" so staff_uploads.php can find them
function DeptModalContent({ dept, user, metadata, setMetadata, note, setNote }) {
  const code = dept.code;
  const matricAccount = "S" + (user?.matric_number?.replace("/", "") ?? "");
  const update = (key, val) => setMetadata(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    if (code === "BURSARY") update("student_account_number", matricAccount);
  }, [code]);

  if (code === "HOD") return (
    <div>
      <p className="text-sm text-slate-500 mb-3">
        HOD/Faculty is the <strong>first and required</strong> step. All other departments require HOD approval before you can apply.
      </p>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Note to HOD (optional)</label>
      <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        rows={3} placeholder="Any information you'd like to add..." value={note} onChange={e => setNote(e.target.value)}/>
    </div>
  );

  if (code === "LIBRARY") return (
    <div className="space-y-4">
      <div className="bg-blue-900 text-white rounded-xl px-4 py-3 text-sm font-bold text-center flex items-center justify-center gap-2">
        <AlertTriangle size={15}/> YOUR HARD COVER PROJECT MUST BE SUBMITTED FIRST BEFORE DOING THIS
      </div>
      <FileField label="Final Year Project (Soft Copy)" fieldName="project_softcopy"
        onUploaded={v => update("project_softcopy_upload_id", v)} accept=".pdf" required/>
      <FileField label="Abstract Page" fieldName="abstract_page"
        onUploaded={v => update("abstract_page_upload_id", v)} accept=".pdf" required/>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Note (optional)</label>
      <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        rows={2} value={note} onChange={e => setNote(e.target.value)}/>
    </div>
  );

  if (code === "HEALTH") return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
          Hospital Card Number <span className="text-red-500">*</span>
        </label>
        <input type="text" placeholder="e.g. 12/3456"
          value={metadata.hospital_card_number || ""}
          onChange={e => update("hospital_card_number", e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-300 font-mono"/>
      </div>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Note (optional)</label>
      <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        rows={2} value={note} onChange={e => setNote(e.target.value)}/>
    </div>
  );

  if (code === "SEC") return (
    <div className="space-y-4">
      <FileField label="Student ID Card (Photo/Scan)" fieldName="student_id_card"
        onUploaded={v => update("student_id_card_upload_id", v)} accept=".jpg,.jpeg,.png,.pdf" required/>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Note (optional)</label>
      <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        rows={2} value={note} onChange={e => setNote(e.target.value)}/>
    </div>
  );

  if (code === "BURSARY") return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
          Student Account Number <span className="text-red-500">*</span>
        </label>
        <input type="text" readOnly value={matricAccount}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none bg-slate-50 font-mono cursor-not-allowed"/>
        <p className="text-xs text-slate-400 mt-1">Auto-generated from your matric number.</p>
      </div>
      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        If you have any outstanding fees, your request will be rejected.
      </p>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Note (optional)</label>
      <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        rows={2} value={note} onChange={e => setNote(e.target.value)}/>
    </div>
  );

  if (code === "HOSTEL") {
    const halls = user?.gender === "Female" ? FEMALE_HALLS : MALE_HALLS;
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Last Hall (Final Semester) <span className="text-red-500">*</span>
          </label>
          <select value={metadata.hall || ""} onChange={e => update("hall", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-300 bg-white">
            <option value="">— Select Hall —</option>
            {halls.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
            Semester <span className="text-red-500">*</span>
          </label>
          <input type="text" placeholder="e.g. 2024/2025.2"
            value={metadata.semester || ""}
            onChange={e => update("semester", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-300 font-mono"/>
        </div>
        <FileField label="Course Form (for that semester)" fieldName="course_form"
          onUploaded={v => update("course_form_upload_id", v)} accept=".pdf,.jpg,.jpeg,.png" required/>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Note (optional)</label>
        <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
          rows={2} value={note} onChange={e => setNote(e.target.value)}/>
      </div>
    );
  }

  if (code === "REGISTRY") return (
    <div className="space-y-4">
      <FileField label="Unofficial Transcript" fieldName="transcript"
        onUploaded={v => update("transcript_upload_id", v)} accept=".pdf" required/>
      <FileField label="Student ID Card" fieldName="student_id_card"
        onUploaded={v => update("student_id_card_upload_id", v)} accept=".jpg,.jpeg,.png,.pdf" required/>
      <FileField label="JAMB Admission Letter" fieldName="jamb_letter"
        onUploaded={v => update("jamb_letter_upload_id", v)} accept=".pdf,.jpg,.jpeg,.png" required/>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Note (optional)</label>
      <textarea className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        rows={2} value={note} onChange={e => setNote(e.target.value)}/>
    </div>
  );

  return null;
}

// ── Request Modal ──────────────────────────────────────────────────────────
function RequestModal({ dept, user, clearances, onClose, onSubmit }) {
  const [note, setNote]         = useState("");
  const [metadata, setMetadata] = useState({});
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const statusMap = Object.fromEntries(clearances.map(c => [c.code, c.status]));
  const prereqs   = PREREQS[dept.code] || [];
  const missing   = prereqs.filter(c => statusMap[c] !== "approved");

  const handleSubmit = async () => {
    if (missing.length > 0) return;
    setLoading(true);
    setError("");
    try {
      await onSubmit(dept, note, metadata);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4 py-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 pt-6 pb-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
              {(() => { const I = DEPT_ICON_MAP[dept.code] || Building2; return <I size={22}/>; })()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Request Clearance</h3>
              <p className="text-sm text-slate-500">{dept.name}</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {missing.length > 0 ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2"><AlertTriangle size={14} className="text-red-600 shrink-0"/><p className="font-semibold text-red-700 text-sm">Prerequisites not met</p></div>
              <p className="text-red-600 text-xs mb-3">You must get approval from the following first:</p>
              <ul className="space-y-1">
                {missing.map(c => (
                  <li key={c} className="flex items-center gap-2 text-xs text-red-700">
                    <X size={12} className="text-red-500 shrink-0"/>
                    {DEPT_NAMES[c] || c}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <DeptModalContent dept={dept} user={user} metadata={metadata}
              setMetadata={setMetadata} note={note} setNote={setNote}/>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
<AlertTriangle size={14} className="shrink-0"/> {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 rounded-b-2xl flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          {missing.length === 0 && (
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-semibold hover:bg-blue-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? (<><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>Submitting...</>) : "Submit Request"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Dept Card ──────────────────────────────────────────────────────────────
function DeptCard({ item, allClearances, onRequest }) {
  const c = STATUS[item.status] || STATUS.not_requested;
  const [expanded, setExpanded] = useState(false);
  const prereqs  = PREREQS[item.code] || [];
  const statuses = Object.fromEntries(allClearances.map(c => [c.code, c.status]));
  const missing  = prereqs.filter(p => statuses[p] !== "approved");
  const blocked  = missing.length > 0 && item.status === "not_requested";

  let rejectionNote = item.remarks;
  try { const m = JSON.parse(item.remarks); if (m?.reason) rejectionNote = m.reason; } catch {}

  return (
    <div className={`relative rounded-2xl border ${c.border} bg-white overflow-hidden transition-all hover:shadow-md`}>
      <div className={`h-1 w-full ${c.accent}`}/>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg} border ${c.border}`}>
              {(() => { const I = DEPT_ICON_MAP[item.code] || Building2; return <I size={20} className={c.text}/>; })()}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm leading-tight">{item.name}</p>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{item.code}</p>
            </div>
          </div>
          <StatusBadge status={item.status}/>
        </div>

        {item.status === "rejected" && rejectionNote && (
          <div className="mt-3 rounded-lg px-3 py-2.5 text-xs bg-red-50 text-red-700 border border-red-200 flex items-start gap-2"><AlertTriangle size={12} className="shrink-0 mt-0.5"/><span><span className="font-semibold">Reason: </span>{rejectionNote}</span></div>
        )}

        {item.status === "rejected" && item.financial_record && (
          <a href={item.financial_record.url} target="_blank" rel="noreferrer"
            className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 transition-colors group">
<FileText size={15} className="shrink-0"/>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">Financial Record attached by Bursary</p>
              <p className="text-amber-600 truncate">{item.financial_record.display_name}</p>
            </div>
<ArrowUpRight size={14} className="shrink-0"/>
          </a>
        )}

        {blocked && (
          <div className="mt-3 rounded-lg px-3 py-2 text-xs bg-amber-50 text-amber-700 border border-amber-200 flex items-start gap-2"><Info size={12} className="shrink-0 mt-0.5"/><span>Requires: {missing.map(c => DEPT_NAMES[c]).join(", ")} approval first</span></div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {item.reviewed_at ? `Updated ${fmtDate(item.reviewed_at)}` : "Not yet submitted"}
          </span>
          {item.status === "not_requested" && !blocked && (
            <button onClick={() => onRequest(item)}
              className="px-3 py-1.5 rounded-lg bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold transition-colors">
              Request →
            </button>
          )}
          {item.status === "rejected" && (
            <button onClick={() => onRequest(item)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors">
              <RefreshCw size={11}/> Re-apply
            </button>
          )}
          {(item.status === "pending" || item.status === "approved") && (
            <button onClick={() => setExpanded(!expanded)}
              className="text-xs text-slate-400 hover:text-blue-700 transition-colors">
{expanded ? <><ChevronUp size={13}/> Less</> : <><ChevronDown size={13}/> Details</>}
            </button>
          )}
        </div>

        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="flex justify-between"><span>Request ID</span><span className="font-mono text-slate-700">CLR-{String(item.request_id ?? 0).padStart(4,"0")}</span></div>
            <div className="flex justify-between"><span>Submitted</span><span className="text-slate-700">{fmtDate(item.created_at)}</span></div>
            <div className="flex justify-between"><span>Last Updated</span><span className="text-slate-700">{fmtDate(item.reviewed_at)}</span></div>
          </div>
        )}
      </div>
    </div>
  );
}


// ── My Requests Page ──────────────────────────────────────────────────────
function MyRequestsPage({ departments, loading, error }) {
  const submitted = departments.filter(d => d.status !== "not_requested");

  const STATUS_CFG = {
    approved: { bg:"bg-emerald-50", text:"text-emerald-700", border:"border-emerald-200", Icon: CheckCircle2 },
    pending:  { bg:"bg-amber-50",   text:"text-amber-700",   border:"border-amber-200",   Icon: Clock        },
    rejected: { bg:"bg-red-50",     text:"text-red-700",     border:"border-red-200",     Icon: XCircle      },
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin w-8 h-8 text-blue-800"/>
    </div>
  );

  if (submitted.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center text-slate-400">
      <Inbox size={44} className="mb-3 opacity-30"/>
      <p className="font-semibold text-slate-600 mb-1">No requests yet</p>
      <p className="text-sm">Head to the Dashboard tab to start your clearance.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{submitted.length} request{submitted.length !== 1 ? "s" : ""} submitted</p>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Department</th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Submitted</th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Last Updated</th>
              <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submitted.map(d => {
              const DeptIcon = DEPT_ICON_MAP[d.code] || Building2;
              const s = STATUS_CFG[d.status];
              return (
                <tr key={d.department_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${s?.border || "border-slate-200"} ${s?.bg || "bg-slate-50"}`}>
                        <DeptIcon size={16} className={s?.text || "text-slate-500"}/>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{d.name}</p>
                        <p className="text-xs text-slate-400 font-mono">CLR-{String(d.request_id ?? 0).padStart(4,"0")}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 hidden sm:table-cell">
                    {d.created_at ? new Date(d.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                  </td>
                  <td className="px-5 py-4 text-slate-500 hidden md:table-cell">
                    {d.reviewed_at ? new Date(d.reviewed_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "—"}
                  </td>
                  <td className="px-5 py-4">
                    {s ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}>
                        <s.Icon size={11} strokeWidth={2.5}/>{d.status}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Rejection details */}
      {submitted.some(d => d.status === "rejected" && d.remarks) && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rejection Details</p>
          {submitted.filter(d => d.status === "rejected" && d.remarks).map(d => (
            <div key={d.department_id} className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
              <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5"/>
              <div>
                <p className="font-semibold text-red-800 text-sm">{d.name}</p>
                <p className="text-red-600 text-xs mt-0.5">{d.remarks}</p>
                {d.financial_record && (
                  <a href={d.financial_record.url} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
                    <FileText size={12}/> View Financial Record
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Notifications Page ─────────────────────────────────────────────────────
function NotificationsPage({ departments, loading }) {
  const events = departments
    .filter(d => d.status !== "not_requested")
    .sort((a, b) => new Date(b.reviewed_at || b.created_at) - new Date(a.reviewed_at || a.created_at));

  const cfg = {
    approved: { Icon: CheckCircle2, color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", msg: (n) => `Your ${n} clearance request was approved.` },
    rejected: { Icon: XCircle,      color:"text-red-500",     bg:"bg-red-50",     border:"border-red-200",     msg: (n) => `Your ${n} clearance request was rejected.`  },
    pending:  { Icon: Clock,        color:"text-amber-500",   bg:"bg-amber-50",   border:"border-amber-200",   msg: (n) => `Your ${n} clearance request is under review.` },
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin w-8 h-8 text-blue-800"/>
    </div>
  );

  if (events.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center text-slate-400">
      <Bell size={44} className="mb-3 opacity-30"/>
      <p className="font-semibold text-slate-600 mb-1">No notifications yet</p>
      <p className="text-sm">Activity from your clearance requests will appear here.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {events.map(d => {
        const s = cfg[d.status] || cfg.pending;
        const date = d.reviewed_at || d.created_at;
        return (
          <div key={d.department_id} className={`flex items-start gap-4 bg-white rounded-2xl border ${s.border} p-5 shadow-sm`}>
            <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
              <s.Icon size={18} className={s.color}/>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">{s.msg(d.name)}</p>
              {d.status === "rejected" && d.remarks && (
                <p className="text-xs text-red-600 mt-1">Reason: {d.remarks}</p>
              )}
              <p className="text-xs text-slate-400 mt-1.5">
                {date ? new Date(date).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}) : "—"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Documents Page ─────────────────────────────────────────────────────────
function DocumentsPage({ studentId, loading: parentLoading }) {
  const [docs,     setDocs]     = useState([]);
  const [fetching, setFetching] = useState(true);
  const [error,    setError]    = useState("");

  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const res = await api.get("/student/my_uploads");
        setDocs(res.data?.uploads || []);
      } catch (e) {
        setError("Could not load documents.");
      } finally { setFetching(false); }
    };
    load();
  }, []);

  const LABELS = {
    project_softcopy: "Final Year Project (Soft Copy)",
    abstract_page:    "Abstract Page",
    student_id_card:  "Student ID Card",
    course_form:      "Course Form",
    transcript:       "Unofficial Transcript",
    jamb_letter:      "JAMB Admission Letter",
  };

  if (fetching || parentLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin w-8 h-8 text-blue-800"/>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center gap-3 text-red-700 text-sm">
      <AlertTriangle size={16} className="shrink-0"/>{error}
    </div>
  );

  if (docs.length === 0) return (
    <div className="bg-white rounded-2xl border border-slate-200 p-12 flex flex-col items-center text-slate-400">
      <FolderOpen size={44} className="mb-3 opacity-30"/>
      <p className="font-semibold text-slate-600 mb-1">No documents yet</p>
      <p className="text-sm">Files you upload during clearance will appear here.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{docs.length} document{docs.length !== 1 ? "s" : ""} uploaded</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {docs.map(doc => {
          const isImage = (doc.original_name || doc.file_name)?.match(/\.(jpg|jpeg|png)$/i);
          return (
            <a key={doc.id} href={doc.url} target="_blank" rel="noreferrer"
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 hover:border-blue-300 hover:bg-blue-50 transition-colors group shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                {isImage ? <Image size={18} className="text-blue-600"/> : <FileText size={18} className="text-blue-600"/>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-800 leading-tight">
                  {LABELS[doc.file_type] || doc.file_type}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{doc.original_name || doc.file_name}</p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {doc.created_at ? new Date(doc.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : ""}
                </p>
              </div>
              <ArrowUpRight size={15} className="text-blue-400 shrink-0 group-hover:translate-x-0.5 transition-transform"/>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [departments,  setDepartments]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [requestModal, setRequestModal] = useState(null);
  const [toast,        setToast]        = useState(null);
  const [filter,       setFilter]       = useState("all");
  const [activePage,   setActivePage]   = useState("Dashboard");

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    setLoading(true); setError("");
    try {
      const res = await api.get("/student/dashboard");
      setDepartments(res.data.clearances || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard.");
    } finally { setLoading(false); }
  };

  const total    = departments.length;
  const approved = departments.filter(d => d.status === "approved").length;
  const pending  = departments.filter(d => d.status === "pending").length;
  const rejected = departments.filter(d => d.status === "rejected").length;
  const pct      = total > 0 ? Math.round((approved / total) * 100) : 0;
  const allCleared = total > 0 && approved === total;

  const filtered = filter === "all" ? departments : departments.filter(d => d.status === filter);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleRequest = async (dept, note, metadata) => {
    await api.post("/student/request_clearance", {
      department_id: dept.department_id,
      note: note || null,
      metadata,
    });
    setDepartments(prev => prev.map(d =>
      d.department_id === dept.department_id
        ? { ...d, status:"pending", created_at: new Date().toISOString() } : d
    ));
    showToast(`Request sent to ${dept.name}.`);
  };

  const initials = user?.name ? user.name.split(" ").slice(0,2).map(n => n[0]).join("") : "ST";

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:wght@700;800&display=swap');
        .fraunces { font-family: 'Fraunces', serif; }`}</style>

      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white
          ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <Check size={14}/> : <X size={14}/>}{toast.msg}
        </div>
      )}

      {requestModal && (
        <RequestModal dept={requestModal} user={user} clearances={departments}
          onClose={() => setRequestModal(null)} onSubmit={handleRequest}/>
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-blue-950 text-white fixed top-0 left-0 h-full z-20">
          <div className="px-6 py-6 border-b border-blue-900">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10"><Building2 size={18}/></div>
              <div><p className="font-bold text-sm leading-tight">Babcock University</p><p className="text-blue-400 text-xs">Clearance Portal</p></div>
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-1">
            {[
              { Icon: LayoutDashboard, label: "Dashboard"     },
              { Icon: FileText,        label: "My Requests"   },
              { Icon: Bell,            label: "Notifications" },
              { Icon: FolderOpen,      label: "Documents"     },
            ].map(({ Icon, label }) => (
              <button key={label} onClick={() => setActivePage(label)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${activePage === label ? "bg-white/10 text-white" : "text-blue-300 hover:bg-white/5 hover:text-white"}`}>
                <Icon size={16}/>{label}
              </button>
            ))}
          </nav>
          <div className="px-4 pb-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-sm shrink-0">{initials}</div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate">{user?.name?.split(" ").slice(0,2).join(" ")}</p>
                  <p className="text-blue-400 text-xs font-mono">{user?.matric_number}</p>
                </div>
              </div>
              <button onClick={() => { logout(); navigate("/login"); }}
                className="mt-3 w-full text-xs text-blue-400 hover:text-red-400 transition-colors text-left">Sign out →</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="fraunces text-xl font-bold text-slate-800">{activePage}</h1>
              <p className="text-xs text-slate-400 mt-0.5">2024/2025 Academic Session</p>
            </div>
            <div className="flex items-center gap-3">
{allCleared && <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"><Star size={12} className="fill-emerald-500 text-emerald-500"/> Fully Cleared</span>}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm">{initials}</div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* ── My Requests Page ── */}
            {activePage === "My Requests" && (
              <MyRequestsPage departments={departments} loading={loading} error={error}/>
            )}

            {/* ── Notifications Page ── */}
            {activePage === "Notifications" && (
              <NotificationsPage departments={departments} loading={loading}/>
            )}

            {/* ── Documents Page ── */}
            {activePage === "Documents" && (
              <DocumentsPage studentId={user?.id} loading={loading}/>
            )}

            {/* ── Dashboard Page ── */}
            {activePage === "Dashboard" && loading && (
              <div className="flex items-center justify-center py-20">
  <Loader2 className="animate-spin w-8 h-8 text-blue-800"/>
              </div>
            )}

            {error && !loading && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
<AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0"/>
                <div>
                  <p className="font-semibold text-red-700 text-sm">Error</p>
                  <p className="text-red-600 text-xs mt-0.5">{error}</p>
                  <button onClick={fetchDashboard} className="mt-2 text-xs text-red-700 underline">Retry</button>
                </div>
              </div>
            )}

            {activePage === "Dashboard" && !loading && !error && (<>
              {/* Banner */}
              <div className="bg-gradient-to-r from-blue-950 to-blue-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-xl shrink-0">{initials}</div>
                  <div>
                    <p className="text-blue-200 text-xs font-medium mb-1 uppercase tracking-wider">Graduating Student</p>
                    <h2 className="fraunces text-xl font-bold">{user?.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-blue-200 text-xs">Matric: <span className="text-white font-mono">{user?.matric_number}</span></span>
                      {user?.programme && <><span className="text-blue-600">•</span><span className="text-blue-200 text-xs">{user.programme}</span></>}
                      {user?.level && <><span className="text-blue-600">•</span><span className="text-blue-200 text-xs">{user.level} Level</span></>}
                    </div>
                    {user?.faculty && <p className="text-blue-300 text-xs mt-0.5">{user.faculty}</p>}
                  </div>
                </div>
                <div className="relative flex items-center justify-center">
                  <ProgressRing pct={pct}/>
                  <div className="absolute text-center">
                    <p className="text-2xl font-bold text-white">{pct}%</p>
                    <p className="text-blue-300 text-[10px] font-medium">Cleared</p>
                  </div>
                </div>
              </div>

              {/* HOD first notice */}
              {departments.find(d => d.code === "HOD")?.status !== "approved" && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-start gap-3">
  <Info size={17} className="text-blue-600 mt-0.5 shrink-0"/>
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">Start with HOD/Faculty</p>
                    <p className="text-blue-600 text-xs mt-0.5">HOD approval is required before all other departments. Submit your HOD request first.</p>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {label:"Total Depts", value:total,    Icon:ClipboardList, cls:"text-slate-700 bg-slate-50 border-slate-200"},
                  {label:"Approved",    value:approved,  Icon:CheckCircle2,  cls:"text-emerald-700 bg-emerald-50 border-emerald-200"},
                  {label:"Pending",     value:pending,   Icon:Clock,         cls:"text-amber-700 bg-amber-50 border-amber-200"},
                  {label:"Rejected",    value:rejected,  Icon:XCircle,       cls:"text-red-700 bg-red-50 border-red-200"},
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl border p-4 ${s.cls}`}>
                    <s.Icon size={22} className="mb-1 opacity-80"/>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs font-medium opacity-70">{s.label}</p>
                  </div>
                ))}
              </div>

              {rejected > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-start gap-3">
  <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0"/>
                  <div>
                    <p className="font-semibold text-red-700 text-sm">Action Required</p>
                    <p className="text-red-600 text-xs mt-0.5">{rejected} department{rejected>1?"s have":" has"} rejected your clearance. Check the reason and re-apply.</p>
                  </div>
                </div>
              )}

              {/* Cards */}
              <div>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="fraunces text-lg font-bold text-slate-800">Clearance Status</h2>
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
                    {["all","approved","pending","rejected","not_requested"].map(t => (
                      <button key={t} onClick={() => setFilter(t)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors
                          ${filter===t ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        {t === "not_requested" ? "Not Started" : t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.length > 0
                    ? filtered.map(item => <DeptCard key={item.department_id} item={item} allClearances={departments} onRequest={setRequestModal}/>)
: <div className="col-span-3 flex flex-col items-center py-12 text-slate-400"><Inbox size={40} className="mb-3 opacity-30"/><p className="text-sm font-medium">No departments match this filter</p></div>}
                </div>
              </div>

              {/* Progress checklist */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <h2 className="fraunces text-lg font-bold text-slate-800 mb-1">Clearance Progress</h2>
                <p className="text-xs text-slate-400 mb-5">Complete all {total} departments to receive your clearance certificate.</p>
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>{approved} of {total} departments cleared</span>
                    <span className="font-semibold text-blue-900">{pct}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-800 to-blue-500 transition-all duration-1000" style={{ width:`${pct}%` }}/>
                  </div>
                </div>
                <div className="space-y-3">
                  {departments.map((item, i) => (
                    <div key={item.department_id} className="flex items-center gap-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border-2 font-bold shrink-0
                        ${(STATUS[item.status] || STATUS.not_requested).step}`}>
{item.status==="approved" ? <Check size={12} strokeWidth={3}/> : item.status==="rejected" ? <X size={12} strokeWidth={3}/> : <span className="text-xs">{i+1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{item.name}</p>
                      </div>
                      <StatusBadge status={item.status}/>
                    </div>
                  ))}
                </div>
              </div>
            </>)}
          </div>
        </main>
      </div>
    </div>
  );
}