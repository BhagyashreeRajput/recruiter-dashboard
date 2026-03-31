
import '../styles/jd.css'
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setSearch, setFilter, clearFilters, setPage, setSort,
  selectFilteredJDs, selectPaginatedJDs, selectJDTotalPages,
  selectJDTotalFiltered, selectJDStats, selectAllJDSkills,
} from "../features/jd/jdSlice";
import { DEPARTMENTS, LOCATIONS } from "../data/mockData";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Ico = ({ d, s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const IC = {
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z",
  clear:    "M18 6L6 18M6 6l12 12",
  filter:   ["M22 3H2l8 9.46V19l4 2v-8.54L22 3z"],
  sort_asc: "M3 8h8M3 12h6M3 16h4M17 4v16M17 4l-4 4M17 4l4 4",
  sort_dsc: "M3 8h8M3 12h6M3 16h4M17 20V4M17 20l-4-4M17 20l4-4",
  loc:      "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z",
  people:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  open:     "M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3",
  chevron:  "M6 9l6 6 6-6",
  work:     "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  first:    "M19 12H5M12 5l-7 7 7 7M5 5v14",
  last:     "M5 12h14M12 5l7 7-7 7M19 5v14",
  prev:     "M15 18l-6-6 6-6",
  next:     "M9 18l6-6-6-6",
};

// ── Priority / Status color maps ──────────────────────────────────────────────
const PRIORITY = {
  High:   { bg: "var(--badge-high-bg)",   txt: "var(--badge-high-txt)",   border: "var(--badge-high-border)"   },
  Medium: { bg: "var(--badge-medium-bg)", txt: "var(--badge-medium-txt)", border: "var(--badge-medium-border)" },
  Low:    { bg: "var(--badge-low-bg)",    txt: "var(--badge-low-txt)",    border: "var(--badge-low-border)"    },
};
const STATUS = {
  Active: { bg: "var(--badge-low-bg)",    txt: "var(--badge-low-txt)",    border: "var(--badge-low-border)"    },
  Paused: { bg: "var(--badge-medium-bg)", txt: "var(--badge-medium-txt)", border: "var(--badge-medium-border)" },
  Closed: { bg: "var(--badge-high-bg)",   txt: "var(--badge-high-txt)",   border: "var(--badge-high-border)"   },
};

const Badge = ({ label, map }) => {
  const c = (map || {})[label] || {};
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 5,
      background: c.bg || "var(--bg-active)", color: c.txt || "var(--text-secondary)",
      border: `1px solid ${c.border || "var(--border-mid)"}`,
      letterSpacing: "0.02em", whiteSpace: "nowrap",
    }}>{label}</span>
  );
};

const SkillPill = ({ label }) => (
  <span style={{
    fontSize: 10, fontWeight: 400, padding: "2px 7px", borderRadius: 4,
    background: "var(--bg-active)", color: "var(--text-muted)",
    border: "1px solid var(--border-subtle)", whiteSpace: "nowrap",
  }}>{label}</span>
);


const SortIcon = ({ active, order }) => {
  if (!active) return <span style={{ opacity: 0.3, display:"inline-flex" }}><Ico d={IC.sort_dsc} s={11} /></span>;
  return <span style={{ color:"var(--accent-blue)", display:"inline-flex" }}><Ico d={order === "asc" ? IC.sort_asc : IC.sort_dsc} s={11} /></span>;
};

export default function JDList() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [expMin, setExpMin] = useState(0);
  const [expMax, setExpMax] = useState(20);

  const jds        = useSelector(selectPaginatedJDs);
  const total      = useSelector(selectJDTotalFiltered);
  const totalPages = useSelector(selectJDTotalPages);
  const stats      = useSelector(selectJDStats);
  const filters    = useSelector((s) => s.jds.filters);
  const sortBy     = useSelector((s) => s.jds.sortBy);
  const sortOrder  = useSelector((s) => s.jds.sortOrder);
  const page       = useSelector((s) => s.jds.currentPage);
  const allSkills  = useSelector(selectAllJDSkills);

  const hasFilters = Object.values(filters).some(Boolean);

  const handleSort = (col) => {
    dispatch(setSort({ sortBy: col, sortOrder: sortBy === col && sortOrder === "desc" ? "asc" : "desc" }));
  };

  const handleClearAll = () => { dispatch(clearFilters()); setExpMin(0); setExpMax(20); };

  const activeChips = Object.entries(filters).filter(([, v]) => v);

  // Page buttons
  const pageButtons = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) pages.push(i);
      else if (pages[pages.length - 1] !== "…") pages.push("…");
    }
    return pages;
  };

  const STAT_STRIP = [
    { label: "Total JDs",      value: stats.total,         accent: "var(--text-primary)" },
    { label: "Active",         value: stats.active,        accent: "var(--badge-low-txt)" },
    { label: "Paused",         value: stats.paused,        accent: "var(--badge-medium-txt)" },
    { label: "Closed",         value: stats.closed,        accent: "var(--badge-high-txt)" },
    { label: "Total Openings", value: stats.totalOpenings, accent: "var(--accent-blue)" },
    { label: "Total Hired",    value: stats.totalHired,    accent: "var(--a2-icon)" },
  ];

  return (
    <>
      {/* <style>{css}</style> */}
      <div className="jl">

        {/* Header */}
        <div className="jl-header">
          <div>
            <div className="jl-title">Job Descriptions</div>
            <div className="jl-sub">Showing {total.toLocaleString()} of {stats.total.toLocaleString()} JDs</div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="stat-strip">
          {STAT_STRIP.map((s) => (
            <div className="ss-card" key={s.label}>
              <div className="ss-val" style={{ color: s.accent }}>{s.value}</div>
              <div className="ss-lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          <div className="filter-row">
            {/* Search */}
            <div className="search-wrap">
              <span className="search-icon"><Ico d={IC.search} s={14} /></span>
              <input
                className="search-input"
                placeholder="Search title, department, skill, location…"
                value={filters.search}
                onChange={(e) => dispatch(setSearch(e.target.value))}
              />
              {filters.search && (
                <button className="search-clear" onClick={() => dispatch(setSearch(""))}>
                  <Ico d={IC.clear} s={12} />
                </button>
              )}
            </div>

            {/* Quick selects */}
            <select className="sel" value={filters.status}
              onChange={(e) => dispatch(setFilter({ key: "status", value: e.target.value }))}>
              <option value="">All Status</option>
              {["Active","Paused","Closed"].map((s) => <option key={s}>{s}</option>)}
            </select>

            <select className="sel" value={filters.department}
              onChange={(e) => dispatch(setFilter({ key: "department", value: e.target.value }))}>
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>

            <button
              className={`filter-btn${showFilters ? " active" : ""}`}
              onClick={() => setShowFilters((p) => !p)}
            >
              <Ico d={IC.filter[0]} s={13} />
              More Filters
              <span style={{ transform: showFilters ? "rotate(180deg)" : "none", display:"inline-flex", transition:"transform .2s" }}>
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
              <select className="sel" value={filters.priority}
                onChange={(e) => dispatch(setFilter({ key: "priority", value: e.target.value }))}>
                <option value="">All Priority</option>
                {["High","Medium","Low"].map((p) => <option key={p}>{p}</option>)}
              </select>

              <select className="sel" value={filters.type}
                onChange={(e) => dispatch(setFilter({ key: "type", value: e.target.value }))}>
                <option value="">All Types</option>
                {["Full-time","Contract","Part-time"].map((t) => <option key={t}>{t}</option>)}
              </select>

              <select className="sel" value={filters.location}
                onChange={(e) => dispatch(setFilter({ key: "location", value: e.target.value }))}>
                <option value="">All Locations</option>
                {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
              </select>

              <select className="sel" value={filters.skill}
                onChange={(e) => dispatch(setFilter({ key: "skill", value: e.target.value }))}>
                <option value="">All Skills</option>
                {allSkills.map((s) => <option key={s}>{s}</option>)}
              </select>

              <div className="range-wrap">
                <div className="range-lbl">
                  Experience: {expMin}–{expMax} yrs
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <input type="range" className="range-input" min={0} max={20} step={1} value={expMin}
                    onChange={(e) => {
                      const v = Math.min(Number(e.target.value), expMax - 1);
                      setExpMin(v);
                      dispatch(setFilter({ key: "experienceMin", value: String(v) }));
                    }} />
                  <input type="range" className="range-input" min={0} max={20} step={1} value={expMax}
                    onChange={(e) => {
                      const v = Math.max(Number(e.target.value), expMin + 1);
                      setExpMax(v);
                      dispatch(setFilter({ key: "experienceMax", value: String(v) }));
                    }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active filter chips */}
        {activeChips.length > 0 && (
          <div className="chip-row">
            {activeChips.map(([key, val]) => (
              <span className="filter-chip" key={key}>
                <span style={{ fontSize:10, opacity:0.7 }}>{key}:</span> {val}
                <button className="chip-x" onClick={() => dispatch(setFilter({ key, value: "" }))}>
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
                  {/* col 1 */ }
                  <th>ID</th>
                  {/* col 2 — sortable */}
                  <th className="sortable" onClick={() => handleSort("title")}>
                    <span className="th-inner">Title & Dept <SortIcon active={sortBy==="title"} order={sortOrder} /></span>
                  </th>
                  {/* col 3 */}
                  <th>Location</th>
                  {/* col 4 */}
                  <th>Experience</th>
                  {/* col 5 */}
                  <th>Skills</th>
                  {/* col 6 — sortable */}
                  <th className="sortable" onClick={() => handleSort("openings")}>
                    <span className="th-inner">Openings <SortIcon active={sortBy==="openings"} order={sortOrder} /></span>
                  </th>
                  {/* col 7 — sortable */}
                  <th className="sortable" onClick={() => handleSort("applicants")}>
                    <span className="th-inner">Applicants <SortIcon active={sortBy==="applicants"} order={sortOrder} /></span>
                  </th>
                  {/* col 8 — sortable */}
                  <th className="sortable" onClick={() => handleSort("priority")}>
                    <span className="th-inner">Priority <SortIcon active={sortBy==="priority"} order={sortOrder} /></span>
                  </th>
                  {/* col 9 */}
                  <th>Status</th>
                  {/* col 10 — sortable */}
                  <th className="sortable" onClick={() => handleSort("postedDate")}>
                    <span className="th-inner">Posted <SortIcon active={sortBy==="postedDate"} order={sortOrder} /></span>
                  </th>
                  {/* col 11 */}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {jds.length === 0 ? (
                  <tr><td colSpan={11}><div className="no-results">No JDs found. Try adjusting your filters.</div></td></tr>
                ) : jds.map((jd) => (
                  <tr key={jd.id} onClick={() => navigate(`/jds/${jd.id}`)}>
                    {/* col 1: ID */}
                    <td><span className="td-id">{jd.id}</span></td>
                    {/* col 2: Title & Dept */}
                    <td>
                      <div className="td-title">{jd.title}</div>
                      <div className="td-sub">{jd.department} · {jd.type}</div>
                    </td>
                    {/* col 3: Location */}
                    <td>
                      <div className="loc-row">
                        <Ico d={IC.loc} s={12} />
                        <span className="td-val" style={{ whiteSpace:"nowrap" }}>{jd.location}</span>
                      </div>
                    </td>
                    {/* col 4: Experience */}
                    <td><span className="td-val">{jd.experience}</span></td>
                    {/* col 5: Skills */}
                    <td>
                      <div className="skills-cell">
                        {jd.skills.slice(0, 3).map((s) => <SkillPill key={s} label={s} />)}
                        {jd.skills.length > 3 && <span className="more-lbl">+{jd.skills.length - 3}</span>}
                      </div>
                    </td>
                    {/* col 6: Openings */}
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <Ico d={IC.work} s={12} />
                        <span className="td-num">{jd.openings}</span>
                      </div>
                    </td>
                    {/* col 7: Applicants */}
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                        <Ico d={IC.people} s={12} />
                        <span className="td-num">{jd.applicants}</span>
                      </div>
                    </td>
                    {/* col 8: Priority */}
                    <td><Badge label={jd.priority} map={PRIORITY} /></td>
                    {/* col 9: Status */}
                    <td><Badge label={jd.status} map={STATUS} /></td>
                    {/* col 10: Posted */}
                    <td><span style={{ fontSize:11, color:"var(--text-muted)", fontFamily:"'Geist Mono',monospace", whiteSpace:"nowrap" }}>{jd.postedDate}</span></td>
                    {/* col 11: Action */}
                    <td>
                      <button
                        className="icon-btn"
                        onClick={(e) => { e.stopPropagation(); navigate(`/jds/${jd.id}`); }}
                        title="View Details"
                      >
                        <Ico d={IC.open} s={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pag-bar">
            <span className="pag-info">Page {page} of {totalPages} · {total.toLocaleString()} JDs</span>
            <div className="pag-btns">
              <button className="pag-btn" disabled={page <= 1} onClick={() => dispatch(setPage(1))}><Ico d={IC.first} s={11} /></button>
              <button className="pag-btn" disabled={page <= 1} onClick={() => dispatch(setPage(page - 1))}><Ico d={IC.prev} s={11} /></button>
              {pageButtons().map((p, i) =>
                p === "…"
                  ? <span key={`e${i}`} style={{ padding:"0 4px", color:"var(--text-faint)", fontSize:12 }}>…</span>
                  : <button key={p} className={`pag-btn${p === page ? " active" : ""}`} onClick={() => dispatch(setPage(p))}>{p}</button>
              )}
              <button className="pag-btn" disabled={page >= totalPages} onClick={() => dispatch(setPage(page + 1))}><Ico d={IC.next} s={11} /></button>
              <button className="pag-btn" disabled={page >= totalPages} onClick={() => dispatch(setPage(totalPages))}><Ico d={IC.last} s={11} /></button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}