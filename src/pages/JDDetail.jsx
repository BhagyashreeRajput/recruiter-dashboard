import '../styles/jd.css'
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectJDById, updateJDStatus } from "../features/jd/jdSlice";
import { useBack } from "../hooks/useBack";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ico = ({ d, s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IC = {
  back:     "M19 12H5M12 5l-7 7 7 7",
  loc:      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z",
  brief:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  people:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  clock:    "M12 2a10 10 0 100 20A10 10 0 0012 2zM12 6v6l4 2",
  check:    "M20 6L9 17l-5-5",
  skill:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  work:     "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  salary:   "M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  open:     "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  hired:    "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  dept:     "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  tag:      "M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
};

const PRIORITY = {
  High:   { bg: "var(--badge-high-bg)",   txt: "var(--badge-high-txt)",   border: "var(--badge-high-border)"   },
  Medium: { bg: "var(--badge-medium-bg)", txt: "var(--badge-medium-txt)", border: "var(--badge-medium-border)" },
  Low:    { bg: "var(--badge-low-bg)",    txt: "var(--badge-low-txt)",    border: "var(--badge-low-border)"    },
};
const STATUS_MAP = {
  Active: { bg: "var(--badge-low-bg)",    txt: "var(--badge-low-txt)",    border: "var(--badge-low-border)"    },
  Paused: { bg: "var(--badge-medium-bg)", txt: "var(--badge-medium-txt)", border: "var(--badge-medium-border)" },
  Closed: { bg: "var(--badge-high-bg)",   txt: "var(--badge-high-txt)",   border: "var(--badge-high-border)"   },
};

const Badge = ({ label, map, large }) => {
  const c = (map || {})[label] || {};
  return (
    <span style={{
      fontSize: large ? 12 : 11, fontWeight: 500,
      padding: large ? "5px 12px" : "3px 9px",
      borderRadius: 6,
      background: c.bg || "var(--bg-active)",
      color: c.txt || "var(--text-secondary)",
      border: `1px solid ${c.border || "var(--border-mid)"}`,
      letterSpacing: "0.02em", whiteSpace: "nowrap",
    }}>{label}</span>
  );
};



// ── Dummy description generator (replace with real data if available) ─────────
const SAMPLE_DESCRIPTION = (jd) => `We are looking for a talented ${jd.title} to join our ${jd.department} team. In this role, you will work on cutting-edge products and collaborate with a world-class team.

You will be responsible for driving key initiatives, owning the full lifecycle of your work, and delivering measurable impact across the organization.`;

const RESPONSIBILITIES = [
  "Design, build, and maintain scalable, high-quality systems",
  "Collaborate with cross-functional teams to define and ship features",
  "Write clean, well-documented, and testable code",
  "Participate in code reviews and technical design discussions",
  "Drive continuous improvement of tooling and processes",
];

const REQUIREMENTS = [
  "Strong communication and collaboration skills",
  "Proven track record of delivering results",
  "Ability to work in a fast-paced, ambiguous environment",
  "Experience with agile methodologies",
];

export default function JDDetail() {
  const { id }    = useParams();
//   const navigate  = useNavigate();
  const { goBack, fromLabel } = useBack("/jds");

  const dispatch  = useDispatch();
  const selectJD  = useMemo(() => selectJDById(id), [id]);
  const jd        = useSelector(selectJD);

  if (!jd) {
    return (
      <>
        {/* <style>{css}</style> */}
        <div className="jd">
          <button className="back-btn" onClick={goBack}>
            <Ico d={IC.back} s={13} /> Back to {fromLabel}
          </button>
          <div className="not-found">Job description not found.</div>
        </div>
      </>
    );
  }

  const INFO_ROWS = [
    { key: "Department",   val: jd.department },
    { key: "Job Type",     val: jd.type },
    { key: "Location",     val: jd.location },
    { key: "Experience",   val: jd.experience },
    { key: "Salary Range", val: jd.salaryRange || "Competitive" },
    { key: "Openings",     val: jd.openings },
    { key: "Applicants",   val: jd.applicants },
    { key: "Hired",        val: jd.hired },
    { key: "Posted",       val: jd.postedDate },
    { key: "Deadline",     val: jd.deadline || "Rolling" },
  ];

  return (
    <>
      {/* <style>{css}</style> */}
      <div className="jd">

        {/* Back */}
        <button className="back-btn" onClick={goBack}>
          <Ico d={IC.back} s={13} /> Back to {fromLabel}
        </button>
        

        {/* Top bar */}
        <div className="jd-topbar">
          <div className="jd-top-left">
            <div className="jd-id">{jd.id}</div>
            <div className="jd-role">{jd.title}</div>
            <div className="jd-badges">
              <Badge label={jd.priority} map={PRIORITY} large />
              <Badge label={jd.status} map={STATUS_MAP} large />
              <Badge label={jd.type} large />
            </div>
            <div className="jd-meta-row">
              <span className="jd-meta-item">
                <Ico d={IC.dept} s={13} />
                <strong>{jd.department}</strong>
              </span>
              <span className="jd-meta-item">
                <Ico d={IC.loc} s={13} />
                <strong>{jd.location}</strong>
              </span>
              <span className="jd-meta-item">
                <Ico d={IC.clock} s={13} />
                <strong>{jd.experience}</strong>
              </span>
              <span className="jd-meta-item">
                <Ico d={IC.calendar} s={13} />
                Posted <strong>{jd.postedDate}</strong>
              </span>
              {jd.salaryRange && (
                <span className="jd-meta-item">
                  <Ico d={IC.salary} s={13} />
                  <strong>{jd.salaryRange}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Status changer */}
          <div style={{ display:"flex", flexDirection:"column", gap:8, alignItems:"flex-end", flexShrink:0 }}>
            <span style={{ fontSize:11, color:"var(--text-muted)" }}>Change Status</span>
            <select
              className="status-select"
              value={jd.status}
              onChange={(e) => dispatch(updateJDStatus({ id: jd.id, status: e.target.value }))}
            >
              {["Active","Paused","Closed"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* Stat boxes */}
        <div className="panel" style={{ marginBottom:14 }}>
          <div className="panel-body">
            <div className="stat-row">
              {[
                { val: jd.openings,   lbl: "Openings",   color: "var(--accent-blue)" },
                { val: jd.applicants, lbl: "Applicants",  color: "var(--text-primary)" },
                { val: jd.hired,      lbl: "Hired",       color: "var(--badge-low-txt)" },
                { val: jd.openings - jd.hired, lbl: "Remaining", color: "var(--badge-medium-txt)" },
              ].map((s) => (
                <div className="stat-box" key={s.lbl}>
                  <div className="stat-box-val" style={{ color: s.color }}>{s.val}</div>
                  <div className="stat-box-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="jd-grid">

          {/* Left column */}
          <div>
            {/* Description */}
            <div className="panel">
              <div className="panel-hdr">
                <span style={{ color:"var(--text-muted)", display:"inline-flex" }}><Ico d={IC.brief} s={13} /></span>
                <span className="panel-hdr-title">Job Description</span>
              </div>
              <div className="panel-body">
                <p className="jd-desc">{jd.description || SAMPLE_DESCRIPTION(jd)}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="panel">
              <div className="panel-hdr">
                <span style={{ color:"var(--text-muted)", display:"inline-flex" }}><Ico d={IC.skill} s={13} /></span>
                <span className="panel-hdr-title">Required Skills</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:"var(--text-faint)", fontFamily:"'Geist Mono',monospace" }}>{jd.skills.length} skills</span>
              </div>
              <div className="panel-body">
                <div className="skill-grid">
                  {jd.skills.map((s) => (
                    <span className="skill-pill" key={s}>
                      <span className="skill-dot" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Responsibilities */}
            <div className="panel">
              <div className="panel-hdr">
                <span style={{ color:"var(--text-muted)", display:"inline-flex" }}><Ico d={IC.edit} s={13} /></span>
                <span className="panel-hdr-title">Responsibilities</span>
              </div>
              <div className="panel-body">
                <ul className="req-list">
                  {(jd.responsibilities || RESPONSIBILITIES).map((r, i) => (
                    <li className="req-item" key={i}>
                      <span className="req-check"><Ico d={IC.check} s={10} /></span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Requirements */}
            <div className="panel">
              <div className="panel-hdr">
                <span style={{ color:"var(--text-muted)", display:"inline-flex" }}><Ico d={IC.hired} s={13} /></span>
                <span className="panel-hdr-title">Requirements</span>
              </div>
              <div className="panel-body">
                <ul className="req-list">
                  {(jd.requirements || REQUIREMENTS).map((r, i) => (
                    <li className="req-item" key={i}>
                      <span className="req-check"><Ico d={IC.check} s={10} /></span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            {/* Details */}
            <div className="panel">
              <div className="panel-hdr">
                <span style={{ color:"var(--text-muted)", display:"inline-flex" }}><Ico d={IC.tag} s={13} /></span>
                <span className="panel-hdr-title">Details</span>
              </div>
              <div className="panel-body" style={{ padding:"12px 18px" }}>
                {INFO_ROWS.map(({ key, val }) => (
                  <div className="info-row" key={key}>
                    <span className="info-key">{key}</span>
                    <span className="info-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hiring funnel */}
            <div className="panel">
              <div className="panel-hdr">
                <span style={{ color:"var(--text-muted)", display:"inline-flex" }}><Ico d={IC.people} s={13} /></span>
                <span className="panel-hdr-title">Hiring Funnel</span>
              </div>
              <div className="panel-body">
                {[
                  { label: "Applied",    count: jd.applicants, max: jd.applicants, color: "var(--pipe-new)" },
                  { label: "Screened",   count: Math.round(jd.applicants * 0.6), max: jd.applicants, color: "var(--pipe-screening)" },
                  { label: "Interviewed",count: Math.round(jd.applicants * 0.3), max: jd.applicants, color: "var(--pipe-interview)" },
                  { label: "Offered",    count: Math.round(jd.applicants * 0.08), max: jd.applicants, color: "var(--pipe-offer)" },
                  { label: "Hired",      count: jd.hired,                         max: jd.applicants, color: "var(--pipe-hired)" },
                ].map((f) => {
                  const pct = Math.round((f.count / f.max) * 100);
                  return (
                    <div key={f.label} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{f.label}</span>
                        <span style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"'Geist Mono',monospace" }}>{f.count}</span>
                      </div>
                      <div style={{ height:3, background:"var(--pipe-track)", borderRadius:99, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${pct}%`, background:f.color, borderRadius:99 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}