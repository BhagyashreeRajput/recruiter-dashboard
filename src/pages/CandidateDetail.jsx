import "../styles/candidate.css";
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCandidateById,
  updateCandidateStatus,
  addNote,
} from "../features/candidate/candidateSlice";
import { STATUS } from "../data/mockData";
import { useBack } from "../hooks/useBack";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ico = ({ d, s = 14 }) => (
  <svg
    width={s}
    height={s}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {Array.isArray(d) ? (
      d.map((p, i) => <path key={i} d={p} />)
    ) : (
      <path d={d} />
    )}
  </svg>
);
const IC = {
  back: "M19 12H5M12 5l-7 7 7 7",
  email:
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6",
  phone:
    "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.18 1.22 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.61-.61a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z",
  loc: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z",
  work: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  school: "M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c3 3 9 3 12 0v-5",
  linkedin:
    "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  check: "M20 6L9 17l-5-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  note: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  close: "M18 6L6 18M6 6l12 12",
  alert:
    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  doc: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  chat: "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const AV_PALETTE = [
  ["#1e3a5f", "#4a7de8"],
  ["#2d1f4e", "#9a60e8"],
  ["#1a2e1a", "#40b870"],
  ["#3a1a1a", "#e07060"],
  ["#2e2211", "#d09038"],
  ["#0e2424", "#30b8a8"],
  ["#2a1030", "#c060d0"],
  ["#1a2a1a", "#50c880"],
];
const avColor = (name) =>
  AV_PALETTE[(name || "A").charCodeAt(0) % AV_PALETTE.length];

const Initials = ({ name, s = 56 }) => {
  const [bg, fg] = avColor(name);
  const parts = (name || "??").split(" ");
  const letters =
    parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: s * 0.28,
        background: bg,
        color: fg,
        border: `1.5px solid ${fg}33`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: s * 0.34,
        fontWeight: 600,
        flexShrink: 0,
        fontFamily: "'Geist Mono',monospace",
        letterSpacing: "-0.02em",
      }}
    >
      {letters.toUpperCase()}
    </div>
  );
};

const fmtCTC = (n) => (n === 0 ? "Fresher" : `₹${(n / 100000).toFixed(1)}L`);

const PIPELINE_STEPS = [
  STATUS.NEW,
  STATUS.SCREENING,
  STATUS.INTERVIEW,
  STATUS.OFFER,
  STATUS.HIRED,
];

const STATUS_COLORS = {
  New: {
    bg: "var(--badge-count-bg)",
    txt: "var(--text-muted)",
    border: "var(--badge-count-border)",
  },
  Screening: {
    bg: "var(--badge-medium-bg)",
    txt: "var(--badge-medium-txt)",
    border: "var(--badge-medium-border)",
  },
  Interview: {
    bg: "var(--a2-bg)",
    txt: "var(--a2-icon)",
    border: "rgba(154,96,232,0.18)",
  },
  Offer: {
    bg: "var(--badge-medium-bg)",
    txt: "var(--badge-medium-txt)",
    border: "var(--badge-medium-border)",
  },
  Hired: {
    bg: "var(--badge-low-bg)",
    txt: "var(--badge-low-txt)",
    border: "var(--badge-low-border)",
  },
  Rejected: {
    bg: "var(--badge-high-bg)",
    txt: "var(--badge-high-txt)",
    border: "var(--badge-high-border)",
  },
};

const SBadge = ({ label, large }) => {
  const c = STATUS_COLORS[label] || STATUS_COLORS.New;
  return (
    <span
      style={{
        fontSize: large ? 12 : 11,
        fontWeight: 500,
        padding: large ? "5px 13px" : "3px 9px",
        borderRadius: 6,
        background: c.bg,
        color: c.txt,
        border: `1px solid ${c.border}`,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

const Stars = ({ value, max = 5 }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {Array.from({ length: max }).map((_, i) => (
      <svg
        key={i}
        width={12}
        height={12}
        viewBox="0 0 24 24"
        fill={
          i < Math.round(value)
            ? "var(--badge-medium-txt)"
            : "var(--border-mid)"
        }
        stroke="none"
      >
        <path d={IC.star} />
      </svg>
    ))}
  </div>
);

const matchColor = (s) =>
  s >= 80
    ? "var(--badge-low-txt)"
    : s >= 60
      ? "var(--badge-medium-txt)"
      : "var(--badge-high-txt)";
const matchBg = (s) =>
  s >= 80
    ? "var(--pipe-hired)"
    : s >= 60
      ? "var(--pipe-screening)"
      : "var(--pipe-rejected)";

const IvResultBadge = ({ result }) => {
  if (result === "Passed") return <span className="ivr-pass">Passed</span>;
  if (result === "Failed") return <span className="ivr-fail">Failed</span>;
  return <span className="ivr-pend">{result || "Pending"}</span>;
};

export default function CandidateDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { goBack, fromLabel } = useBack("/candidates");

  const selectById = useMemo(() => selectCandidateById(id), [id]);
  const candidate = useSelector(selectById);

  const [newStatus, setNewStatus] = useState("");
  const [noteText, setNoteText] = useState("");
  const [resumeOpen, setResumeOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  if (!candidate) {
    return (
      <>
        {/* <style>{css}</style> */}
        <div
          className="cd"
          style={{ textAlign: "center", padding: "80px 20px" }}
        >
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
            Candidate not found.
          </div>
          <button
            className="btn-outline btn-sm"
            style={{ marginTop: 16, width: "auto" }}
            onClick={goBack}
          >
            Back to {fromLabel}
          </button>
        </div>
      </>
    );
  }

  const c = candidate;
  const pipelineStep =
    c.status === STATUS.REJECTED ? -1 : PIPELINE_STEPS.indexOf(c.status);

  const handleStatusChange = () => {
    if (!newStatus) return;
    dispatch(updateCandidateStatus({ id: c.id, status: newStatus }));
    showToast(`Status updated to "${newStatus}"`);
    setNewStatus("");
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    dispatch(addNote({ id: c.id, note: noteText }));
    showToast("Note saved successfully");
    setNoteText("");
  };

  const DETAILS = [
    { label: "Applied For", value: c.appliedForTitle },
    { label: "Department", value: c.department },
    { label: "Source", value: c.source },
    { label: "Notice Period", value: c.noticePeriod },
    { label: "Current CTC", value: fmtCTC(c.currentCTC) },
    { label: "Expected CTC", value: fmtCTC(c.expectedCTC) },
    { label: "Applied Date", value: c.appliedDate },
    { label: "Last Activity", value: c.lastActivity },
  ];

  return (
    <>
      {/* <style>{css}</style> */}
      <div className="cd">
        {/* Back */}
        <button className="back-btn" onClick={goBack}>
          <Ico d={IC.back} s={13} /> Back to {fromLabel}
        </button>

        {/* Top bar */}
        <div className="topbar">
          <div>
            <div className="topbar-name">{c.fullName}</div>
            <div className="topbar-sub">
              {c.id} · Applied for {c.appliedForTitle}
            </div>
          </div>
          <SBadge label={c.status} large />
        </div>

        {/* Pipeline stepper */}
        {c.status !== STATUS.REJECTED ? (
          <div className="pipeline-panel">
            <div className="pipeline-label">Recruitment Pipeline</div>
            <div className="pipeline-steps">
              {PIPELINE_STEPS.map((step, i) => {
                const isDone = pipelineStep > i;
                const isActive = pipelineStep === i;
                return (
                  <div className="pipe-step" key={step}>
                    {/* connector line (not on last) */}
                    {i < PIPELINE_STEPS.length - 1 && (
                      <div
                        className={`pipe-connector${isDone ? " done" : ""}`}
                      />
                    )}
                    <div
                      className={`pipe-dot${isDone ? " done" : isActive ? " active" : ""}`}
                    >
                      {isDone ? <Ico d={IC.check} s={11} /> : i + 1}
                    </div>
                    <div
                      className={`pipe-step-lbl${isActive ? " active" : isDone ? " done" : ""}`}
                    >
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rejected-banner">
            <Ico d={IC.alert} s={16} />
            This candidate has been{" "}
            <strong style={{ marginLeft: 4 }}>Rejected</strong>.
          </div>
        )}

        {/* Main 2-col grid */}
        <div className="main-grid">
          {/* ── LEFT COLUMN ──────────────────────── */}
          <div>
            {/* Profile card */}
            <div className="panel">
              <div className="panel-body">
                <div className="profile-center">
                  <Initials name={c.fullName} s={60} />
                  <div>
                    <div className="profile-name">{c.fullName}</div>
                    <div className="profile-role">
                      {c.currentRole} · {c.currentCompany}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        marginTop: 6,
                      }}
                    >
                      <Stars value={c.rating} />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  {[
                    { icon: IC.email, val: c.email },
                    { icon: IC.phone, val: c.phone },
                    { icon: IC.loc, val: c.location },
                    {
                      icon: IC.work,
                      val: `${c.experienceLevel} · ${c.totalExperience} yrs`,
                    },
                    {
                      icon: IC.school,
                      val: `${c.education?.degree} — ${c.education?.college}`,
                    },
                  ].map(({ icon, val }) => (
                    <div className="contact-row" key={val}>
                      <span className="contact-icon">
                        <Ico d={icon} s={14} />
                      </span>
                      <span className="contact-val">{val}</span>
                    </div>
                  ))}
                </div>

                <div className="divider" />

                {/* Resume buttons */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  <button
                    className="btn-primary"
                    onClick={() => setResumeOpen(true)}
                  >
                    <Ico d={IC.eye} s={13} /> Preview Resume
                  </button>
                  {/* <a
                    href={c.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration:"none" }}
                  >
                    <button className="btn-outline">
                      <Ico d={IC.download} s={13} /> Download Resume
                    </button>
                  </a> */}
                </div>
              </div>
            </div>

            {/* Match Score */}
            <div className="panel">
              <div className="panel-hdr">
                <span
                  style={{ color: "var(--text-muted)", display: "inline-flex" }}
                >
                  <Ico d={IC.star} s={13} />
                </span>
                <span className="panel-hdr-title">Match Score</span>
              </div>
              <div className="panel-body">
                <div
                  style={{ display: "flex", alignItems: "baseline", gap: 10 }}
                >
                  <div
                    className="match-big"
                    style={{ color: matchColor(c.matchScore) }}
                  >
                    {c.matchScore}%
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                    compatibility
                  </span>
                </div>
                <div className="match-bar-track">
                  <div
                    className="match-bar-fill"
                    style={{
                      width: `${c.matchScore}%`,
                      background: matchBg(c.matchScore),
                    }}
                  />
                </div>
                <div className="match-hint">
                  {c.matchScore >= 80
                    ? "Strong match for this role"
                    : c.matchScore >= 60
                      ? "Moderate match — review skills"
                      : "Low match — consider other roles"}
                </div>
              </div>
            </div>

            {/* Tags */}
            {c.tags?.length > 0 && (
              <div className="panel">
                <div className="panel-hdr">
                  <span
                    style={{
                      color: "var(--text-muted)",
                      display: "inline-flex",
                    }}
                  >
                    <Ico d={IC.tag} s={13} />
                  </span>
                  <span className="panel-hdr-title">Tags</span>
                </div>
                <div className="panel-body">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {c.tags.map((t) => (
                      <span key={t} className="tag-pill">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ─────────────────────── */}
          <div>
            {/* Summary */}
            <div className="panel">
              <div className="panel-hdr">
                <span
                  style={{ color: "var(--text-muted)", display: "inline-flex" }}
                >
                  <Ico d={IC.doc} s={13} />
                </span>
                <span className="panel-hdr-title">Professional Summary</span>
              </div>
              <div className="panel-body">
                <p className="summary-text">{c.summary}</p>
              </div>
            </div>

            {/* Application Details */}
            <div className="panel">
              <div className="panel-hdr">
                <span
                  style={{ color: "var(--text-muted)", display: "inline-flex" }}
                >
                  <Ico d={IC.work} s={13} />
                </span>
                <span className="panel-hdr-title">Application Details</span>
              </div>
              <div className="panel-body">
                <div className="details-grid">
                  {DETAILS.map(({ label, value }) => (
                    <div key={label}>
                      <div className="detail-lbl">{label}</div>
                      <div className="detail-val">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="panel">
              <div className="panel-hdr">
                <span
                  style={{ color: "var(--text-muted)", display: "inline-flex" }}
                >
                  <Ico d={IC.school} s={13} />
                </span>
                <span className="panel-hdr-title">Education</span>
              </div>
              <div
                className="panel-body"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--text-primary)",
                    }}
                  >
                    {c.education?.degree} in {c.education?.field}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      marginTop: 3,
                    }}
                  >
                    {c.education?.college}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-faint)",
                      marginTop: 2,
                      fontFamily: "'Geist Mono',monospace",
                    }}
                  >
                    Graduated {c.education?.year} · CGPA {c.education?.cgpa}
                  </div>
                </div>
                <div style={{ opacity: 0.15 }}>
                  <Ico d={IC.school} s={36} />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="panel">
              <div className="panel-hdr">
                <span
                  style={{ color: "var(--text-muted)", display: "inline-flex" }}
                >
                  <Ico d={IC.star} s={13} />
                </span>
                <span className="panel-hdr-title">Skills</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: "var(--text-faint)",
                    fontFamily: "'Geist Mono',monospace",
                  }}
                >
                  {c.skills.length}
                </span>
              </div>
              <div className="panel-body">
                <div className="skill-grid">
                  {c.skills.map((s) => (
                    <span key={s} className="skill-pill">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Interview History */}
            <div className="panel">
              <div className="panel-hdr">
                <span
                  style={{ color: "var(--text-muted)", display: "inline-flex" }}
                >
                  <Ico d={IC.chat} s={13} />
                </span>
                <span className="panel-hdr-title">Interview History</span>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    color: "var(--text-faint)",
                    fontFamily: "'Geist Mono',monospace",
                  }}
                >
                  {c.interviews?.length || 0} rounds
                </span>
              </div>
              <div className="panel-body">
                {!c.interviews?.length ? (
                  <div className="empty-state">
                    No interviews scheduled yet.
                  </div>
                ) : (
                  c.interviews.map((iv) => (
                    <div className="iv-card" key={iv.round}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <div>
                          <div className="iv-round">
                            Round {iv.round} — {iv.type}
                          </div>
                          <div className="iv-interviewer">
                            Interviewer: {iv.interviewer}
                          </div>
                          {iv.feedback && (
                            <div className="iv-feedback">"{iv.feedback}"</div>
                          )}
                          <div className="iv-date">{iv.date}</div>
                        </div>
                        <IvResultBadge result={iv.result} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="panel">
              <div className="panel-hdr">
                <span
                  style={{ color: "var(--text-muted)", display: "inline-flex" }}
                >
                  <Ico d={IC.check} s={13} />
                </span>
                <span className="panel-hdr-title">Update Status</span>
              </div>
              <div className="panel-body">
                <div className="status-row">
                  <select
                    className="status-sel"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="">Select new status…</option>
                    {Object.values(STATUS)
                      .filter((s) => s !== c.status)
                      .map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                  </select>
                  <button
                    className="btn-sm btn-sm-primary"
                    disabled={!newStatus}
                    onClick={handleStatusChange}
                  >
                    Update
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--text-faint)",
                    marginTop: 8,
                  }}
                >
                  Current status: <SBadge label={c.status} />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-hdr">
                <span
                  style={{ color: "var(--text-muted)", display: "inline-flex" }}
                >
                  <Ico d={IC.note} s={13} />
                </span>
                <span className="panel-hdr-title">Notes</span>
              </div>
              <div className="panel-body">
                {c.notes && <div className="notes-existing">{c.notes}</div>}
                <textarea
                  className="note-area"
                  placeholder="Add a note about this candidate…"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 8,
                  }}
                >
                  <button
                    className="btn-sm btn-sm-outline"
                    disabled={!noteText.trim()}
                    onClick={handleSaveNote}
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Resume Modal ──────────────────────── */}
        {resumeOpen && (
          <div className="modal-overlay" onClick={() => setResumeOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-hdr">
                <div>
                  <div className="modal-hdr-title">{c.fullName}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      fontFamily: "'Geist Mono',monospace",
                      marginTop: 2,
                    }}
                  >
                    {c.id}
                  </div>
                </div>
                <button
                  className="modal-close"
                  onClick={() => setResumeOpen(false)}
                >
                  <Ico d={IC.close} s={16} />
                </button>
              </div>

              <div className="modal-body">
                <div className="resume-doc">
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <div>
                      <div className="resume-name">{c.fullName}</div>
                      <div className="resume-role">
                        {c.currentRole} at {c.currentCompany}
                      </div>
                      <div className="resume-contact">
                        {[
                          { icon: IC.email, val: c.email },
                          { icon: IC.phone, val: c.phone },
                          { icon: IC.loc, val: c.location },
                        ].map(({ icon, val }) => (
                          <span className="resume-contact-item" key={val}>
                            <Ico d={icon} s={11} /> {val}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Initials name={c.fullName} s={52} />
                  </div>

                  <div className="resume-divider" />

                  {/* Summary */}
                  <div className="resume-section-title">
                    Professional Summary
                  </div>
                  <p className="resume-body-text" style={{ marginBottom: 16 }}>
                    {c.summary}
                  </p>

                  <div className="resume-divider" />

                  {/* Skills */}
                  <div className="resume-section-title">Skills</div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 5,
                      marginBottom: 16,
                    }}
                  >
                    {c.skills.map((s) => (
                      <span
                        key={s}
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: "var(--bg-active)",
                          color: "var(--text-secondary)",
                          border: "1px solid var(--border-subtle)",
                        }}
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="resume-divider" />

                  {/* Experience */}
                  <div className="resume-section-title">Work Experience</div>
                  <div className="resume-bold">{c.currentRole}</div>
                  <div className="resume-sub">
                    {c.currentCompany} · {c.totalExperience} years total
                    experience
                  </div>
                  <p
                    className="resume-body-text"
                    style={{ marginTop: 6, marginBottom: 16 }}
                  >
                    Contributed to multiple high-impact projects. Collaborated
                    with cross-functional teams to deliver scalable solutions.
                    Strong focus on quality and performance.
                  </p>

                  <div className="resume-divider" />

                  {/* Education */}
                  <div className="resume-section-title">Education</div>
                  <div className="resume-bold">
                    {c.education?.degree} in {c.education?.field}
                  </div>
                  <div className="resume-sub">
                    {c.education?.college} · {c.education?.year}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text-faint)",
                      marginTop: 3,
                    }}
                  >
                    CGPA: {c.education?.cgpa}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-sm btn-sm-outline"
                  onClick={() => setResumeOpen(false)}
                >
                  Close
                </button>
                {/* <a href={c.resumeUrl} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                  <button className="btn-sm btn-sm-primary">
                    <Ico d={IC.download} s={12} /> Download PDF
                  </button>
                </a> */}
              </div>
            </div>
          </div>
        )}

        {/* ── Toast ────────────────────────────── */}
        {toast && (
          <div className="toast">
            <Ico d={IC.check} s={14} />
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
