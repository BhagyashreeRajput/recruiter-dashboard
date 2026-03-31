import '../styles/candidate.css'

import { useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import {
  setSearch, setFilter, clearFilters, setPage, setSort,
  selectPaginatedCandidates, selectTotalPages,
  selectTotalFiltered, selectStatusCounts,
} from "../features/candidate/candidateSlice";
import { useNavigateWithOrigin } from "../hooks/useBack";
import { STATUS, DEPARTMENTS, LOCATIONS, EXPERIENCE_LEVELS } from "../data/mockData";
// ── Icons ─────────────────────────────────────────────────────────────────────
const Ico = ({ d, s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IC = {
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  clear:    "M18 6L6 18M6 6l12 12",
  filter:   "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  sort_asc: "M3 8h8M3 12h6M3 16h4M17 4v16M17 4l-4 4M17 4l4 4",
  sort_dsc: "M3 8h8M3 12h6M3 16h4M17 20V4M17 20l-4-4M17 20l4-4",
  chevron:  "M6 9l6 6 6-6",
  open:     "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  prev:     "M15 18l-6-6 6-6",
  next:     "M9 18l6-6-6-6",
  first:    "M19 12H5M12 5l-7 7 7 7M5 5v14",
  last:     "M5 12h14M12 5l7 7-7 7M19 5v14",
};

// ── Avatar palette ────────────────────────────────────────────────────────────
const AV_PALETTE = [
  ["#1e3a5f","#4a7de8"], ["#2d1f4e","#9a60e8"], ["#1a2e1a","#40b870"],
  ["#3a1a1a","#e07060"], ["#2e2211","#d09038"], ["#0e2424","#30b8a8"],
  ["#2a1030","#c060d0"], ["#1a2a1a","#50c880"],
];
const avColor = (name) => AV_PALETTE[(name || "A").charCodeAt(0) % AV_PALETTE.length];

const Initials = ({ name, s = 32 }) => {
  const [bg, fg] = avColor(name);
  const parts = (name || "??").split(" ");
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return (
    <div style={{
      width: s, height: s, borderRadius: s * 0.3, background: bg, color: fg,
      border: `1px solid ${fg}22`, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: s * 0.34, fontWeight: 600,
      flexShrink: 0, fontFamily: "'Geist Mono',monospace", letterSpacing: "-0.02em",
    }}>
      {letters.toUpperCase()}
    </div>
  );
};

// ── Badge components ──────────────────────────────────────────────────────────
const STATUS_COLORS = {
  New:       { bg:"var(--badge-count-bg)",  txt:"var(--text-muted)",        border:"var(--badge-count-border)"  },
  Screening: { bg:"var(--badge-medium-bg)", txt:"var(--badge-medium-txt)",  border:"var(--badge-medium-border)" },
  Interview: { bg:"var(--a2-bg)",           txt:"var(--a2-icon)",            border:"rgba(154,96,232,0.18)"      },
  Offer:     { bg:"var(--badge-medium-bg)", txt:"var(--badge-medium-txt)",  border:"var(--badge-medium-border)" },
  Hired:     { bg:"var(--badge-low-bg)",    txt:"var(--badge-low-txt)",      border:"var(--badge-low-border)"    },
  Rejected:  { bg:"var(--badge-high-bg)",   txt:"var(--badge-high-txt)",     border:"var(--badge-high-border)"   },
};
const SBadge = ({ label }) => {
  const c = STATUS_COLORS[label] || STATUS_COLORS.New;
  return (
    <span style={{ fontSize:11, fontWeight:500, padding:"3px 9px", borderRadius:5, whiteSpace:"nowrap",
      background:c.bg, color:c.txt, border:`1px solid ${c.border}` }}>{label}</span>
  );
};

const SkillPill = ({ label }) => (
  <span style={{ fontSize:10, padding:"2px 7px", borderRadius:4, whiteSpace:"nowrap",
    background:"var(--bg-active)", color:"var(--text-muted)", border:"1px solid var(--border-subtle)" }}>
    {label}
  </span>
);

// Mini star rating (read-only)
const Stars = ({ value, max = 5 }) => (
  <div style={{ display:"flex", gap:1 }}>
    {Array.from({ length: max }).map((_, i) => (
      <svg key={i} width={10} height={10} viewBox="0 0 24 24"
        fill={i < Math.round(value) ? "var(--badge-medium-txt)" : "var(--border-mid)"}
        stroke="none">
        <path d={IC.star} />
      </svg>
    ))}
  </div>
);

// Match score color
const matchColor = (score) =>
  score >= 80 ? "var(--badge-low-txt)" : score >= 60 ? "var(--badge-medium-txt)" : "var(--badge-high-txt)";

// Sort icon
const SortIco = ({ active, order }) => (
  <span style={{ display:"inline-flex", color: active ? "var(--accent-blue)" : "transparent", marginLeft:3 }}>
    <Ico d={!active || order === "desc" ? IC.sort_dsc : IC.sort_asc} s={11} />
  </span>
);


const PAGE_SIZE = 20;



export default function CandidateList() {
  const dispatch   = useDispatch();
  const navigateTo = useNavigateWithOrigin();

  const [showFilters, setShowFilters] = useState(false);
  const [matchRange,  setMatchRange]  = useState(0);

  const candidates   = useSelector(selectPaginatedCandidates);
  const totalCount   = useSelector(selectTotalFiltered);
  const totalPages   = useSelector(selectTotalPages);
  const statusCounts = useSelector(selectStatusCounts);
  const filters      = useSelector((s) => s.candidates.filters);
  const sortBy       = useSelector((s) => s.candidates.sortBy);
  const sortOrder    = useSelector((s) => s.candidates.sortOrder);
  const page         = useSelector((s) => s.candidates.currentPage);

  const hasFilters = Object.values(filters).some(Boolean);

  const handleSort = (col) =>
    dispatch(setSort({ sortBy: col, sortOrder: sortBy === col && sortOrder === "desc" ? "asc" : "desc" }));

  const handleMatchRange = (e) => {
    const val = Number(e.target.value);
    setMatchRange(val);
    dispatch(setFilter({ key: "matchScoreMin", value: val > 0 ? String(val) : "" }));
  };

  const handleClearAll = () => { dispatch(clearFilters()); setMatchRange(0); };

  const activeChips = Object.entries(filters).filter(([, v]) => v);

  const pageButtons = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) pages.push(i);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return pages;
  };

  const startRow = (page - 1) * PAGE_SIZE + 1;
  const endRow   = Math.min(page * PAGE_SIZE, totalCount);

  const STATUS_TABS = [
    { label: "All", value: "", count: totalCount },
    ...Object.values(STATUS).map((s) => ({ label: s, value: s, count: statusCounts[s] || 0 })),
  ];

  return (
    <>
      {/* <style>{css}</style> */}
      <div className="cl">

        {/* Header */}
        <div className="cl-header">
          <div>
            <div className="cl-title">Candidates</div>
            <div className="cl-sub">{totalCount.toLocaleString()} candidates</div>
          </div>
        </div>

        {/* Status tabs */}
        <div className="status-strip">
          {STATUS_TABS.map(({ label, value, count }) => (
            <button
              key={label}
              className={`status-tab${filters.status === value ? " active" : ""}`}
              onClick={() => dispatch(setFilter({ key: "status", value }))}
            >
              {label}
              <span className="status-tab-count">{count}</span>
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-row">
            {/* Search */}
            <div className="search-wrap">
              <span className="search-icon"><Ico d={IC.search} s={14} /></span>
              <input
                className="search-inp"
                placeholder="Name, email, company, skill, JD title…"
                value={filters.search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
              />
              {filters.search && (
                <button className="search-clear" onClick={() => dispatch(setSearch(""))}>
                  <Ico d={IC.clear} s={12} />
                </button>
              )}
            </div>

            <select className="sel" value={filters.department}
              onChange={(e) => dispatch(setFilter({ key: "department", value: e.target.value }))}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>

            <select className="sel" value={filters.experienceLevel}
              onChange={(e) => dispatch(setFilter({ key: "experienceLevel", value: e.target.value }))}>
              <option value="">All Experience</option>
              {EXPERIENCE_LEVELS.map((e) => <option key={e}>{e}</option>)}
            </select>

            <button
              className={`filter-btn${showFilters ? " active" : ""}`}
              onClick={() => setShowFilters((p) => !p)}
            >
              <Ico d={IC.filter} s={13} />
              More Filters
              <span className={`chevron-ico${showFilters ? " open" : ""}`}>
                <Ico d={IC.chevron} s={12} />
              </span>
            </button>

            {hasFilters && (
              <button className="clear-btn" onClick={handleClearAll}>
                <Ico d={IC.clear} s={12} /> Clear
              </button>
            )}
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="filter-expanded">
              <select className="sel" value={filters.source}
                onChange={(e) => dispatch(setFilter({ key: "source", value: e.target.value }))}>
                <option value="">All Sources</option>
                {["LinkedIn","Naukri","Indeed","Referral","Company Website","Campus","Internshala","Monster"].map((s) => <option key={s}>{s}</option>)}
              </select>

              <select className="sel" value={filters.location}
                onChange={(e) => dispatch(setFilter({ key: "location", value: e.target.value }))}>
                <option value="">All Locations</option>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>

              <select className="sel" value={filters.skill}
                onChange={(e) => dispatch(setFilter({ key: "skill", value: e.target.value }))}>
                <option value="">All Skills</option>
                {["React","Python","Node.js","AWS","Docker","SQL","Java","TypeScript","Figma","Machine Learning"].map((s) => <option key={s}>{s}</option>)}
              </select>

              <div className="range-wrap">
                <div className="range-lbl">Min Match Score: {matchRange}%</div>
                <input
                  type="range" className="range-inp"
                  min={0} max={100} step={5} value={matchRange}
                  onChange={handleMatchRange}
                />
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="chip-row">
            {activeChips.map(([key, val]) => (
              <span className="filter-chip" key={key}>
                <span style={{ fontSize:10, opacity:.7 }}>{key}:</span> {val}
                <button className="chip-x"
                  onClick={() => { dispatch(setFilter({ key, value:"" })); if (key === "matchScoreMin") setMatchRange(0); }}>
                  <Ico d={IC.clear} s={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Table */}
        <div className="tbl-wrap">
          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  {/* Sortable: Candidate */}
                  <th className="sortable" onClick={() => handleSort("fullName")}>
                    <span className="th-inner">Candidate <SortIco active={sortBy==="fullName"} order={sortOrder} /></span>
                  </th>
                  <th>Applied For</th>
                  {/* Sortable: Experience */}
                  <th className="sortable" onClick={() => handleSort("totalExperience")}>
                    <span className="th-inner">Experience <SortIco active={sortBy==="totalExperience"} order={sortOrder} /></span>
                  </th>
                  {/* Sortable: Match */}
                  <th className="sortable" onClick={() => handleSort("matchScore")}>
                    <span className="th-inner">Match <SortIco active={sortBy==="matchScore"} order={sortOrder} /></span>
                  </th>
                  <th>Skills</th>
                  <th>Source</th>
                  <th>Status</th>
                  {/* Sortable: Applied */}
                  <th className="sortable" onClick={() => handleSort("appliedDate")}>
                    <span className="th-inner">Applied <SortIco active={sortBy==="appliedDate"} order={sortOrder} /></span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {candidates.length === 0 ? (
                  <tr><td colSpan={8}><div className="no-results">No candidates found. Try adjusting your filters.</div></td></tr>
                ) : candidates.map((c) => (
                  <tr key={c.id} onClick={() => navigateTo(`/candidates/${c.id}`)}>

                    {/* Candidate */}
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <Initials name={c.fullName} s={32} />
                        <div>
                          <div className="td-name">{c.fullName}</div>
                          <div className="td-email">{c.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Applied For */}
                    <td>
                      <div className="td-jd">{c.appliedForTitle}</div>
                      <div className="td-jd-id">{c.appliedFor}</div>
                    </td>

                    {/* Experience */}
                    <td>
                      <div className="td-exp-lbl">{c.experienceLevel}</div>
                      <div className="td-exp-yr">{c.totalExperience} yrs</div>
                    </td>

                    {/* Match */}
                    <td>
                      <div className="td-match" style={{ color: matchColor(c.matchScore) }}>{c.matchScore}%</div>
                      <Stars value={c.rating} />
                    </td>

                    {/* Skills */}
                    <td>
                      <div className="skills-cell">
                        {c.skills.slice(0, 3).map((s) => <SkillPill key={s} label={s} />)}
                        {c.skills.length > 3 && <span className="more-lbl">+{c.skills.length - 3}</span>}
                      </div>
                    </td>

                    {/* Source */}
                    <td><span className="td-source">{c.source}</span></td>

                    {/* Status */}
                    <td><SBadge label={c.status} /></td>

                    {/* Applied Date */}
                    <td><span className="td-date">{c.appliedDate}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pag-bar">
            <span className="pag-info">
              {startRow}–{endRow} of {totalCount.toLocaleString()} candidates
            </span>
            <div className="pag-btns">
              <button className="pag-btn" disabled={page <= 1} onClick={() => dispatch(setPage(1))}>
                <Ico d={IC.first} s={11} />
              </button>
              <button className="pag-btn" disabled={page <= 1} onClick={() => dispatch(setPage(page - 1))}>
                <Ico d={IC.prev} s={11} />
              </button>
              {pageButtons().map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} style={{ padding:"0 4px", color:"var(--text-faint)", fontSize:12 }}>…</span>
                  : <button key={p} className={`pag-btn${p === page ? " active" : ""}`} onClick={() => dispatch(setPage(p))}>{p}</button>
              )}
              <button className="pag-btn" disabled={page >= totalPages} onClick={() => dispatch(setPage(page + 1))}>
                <Ico d={IC.next} s={11} />
              </button>
              <button className="pag-btn" disabled={page >= totalPages} onClick={() => dispatch(setPage(totalPages))}>
                <Ico d={IC.last} s={11} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}