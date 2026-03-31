import "../styles/mapping.css";
import { useState, useCallback, useMemo, memo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  selectJD,
  setJDCandFilter,
  clearJDCandFilter,
  setJDCandPage,
  selectCandidate,
  setCandJDFilter,
  setCandJDPage,
  toggleJDBookmark,
  clearJDBookmarks,
  setShowBookmarkedJDsOnly,
  toggleCandBookmark,
  clearCandBookmarks,
  setShowBookmarkedCandsOnly,
  reorderJDs,
  reorderCandidates,
  resetJDOrder,
  resetCandOrder,
  selectSelectedJD,
  selectSelectedCandidate,
  selectSelectedJDId,
  selectSelectedCandId,
  selectBookmarkedJDs,
  selectBookmarkedCandidates,
  selectShowBookmarkedJDsOnly,
  selectShowBookmarkedCandsOnly,
  selectJDCustomOrder,
  selectCandCustomOrder,
  selectJDCandidatesPaginated,
  selectJDCandidatesTotalPages,
  selectJDCandidates,
  selectCandMatchingJDsPaginated,
  selectCandMatchingJDsTotalPages,
  selectCandidateMatchingJDs,
  selectMappingStats,
  selectOrderedJDs,
  selectOrderedCandidates,
} from "../features/mapping/mappingSlice";
import { STATUS, EXPERIENCE_LEVELS } from "../data/mockData";
import { useDebounce } from "../hooks/useVirtualList";
import { useNavigateWithOrigin } from "../hooks/useBack"; // ← key import

// ── SVG Icons ─────────────────────────────────────────────────────────────────
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
  search: "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  clear: "M18 6L6 18M6 6l12 12",
  work: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  people:
    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
  drag: "M9 5h2M9 12h2M9 19h2M13 5h2M13 12h2M13 19h2",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z",
  bm_clear: ["M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z", "M18 6L6 18"],
  reset:
    "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  arrow: "M5 12h14M12 5l7 7-7 7",
  link: "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71",
  unlink:
    "M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71M3 3l18 18",
  swap: "M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4",
  chevron: "M6 9l6 6 6-6",
  loc: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  dept: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z",
  check: "M20 6L9 17l-5-5",
  first: "M19 12H5M12 5l-7 7 7 7M5 5v14",
  last: "M5 12h14M12 5l7 7-7 7M19 5v14",
  prev: "M15 18l-6-6 6-6",
  next: "M9 18l6-6-6-6",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ["#1e3a5f", "#4a7de8"],
  ["#2d1f4e", "#9a60e8"],
  ["#1a2e1a", "#40b870"],
  ["#3a1a1a", "#e07060"],
  ["#2e2211", "#d09038"],
  ["#0e2424", "#30b8a8"],
];
const avatarColor = (name) =>
  AVATAR_COLORS[(name || "A").charCodeAt(0) % AVATAR_COLORS.length];

const Initials = ({ name, size = 32 }) => {
  const [bg, fg] = avatarColor(name);
  const parts = (name || "??").split(" ");
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[1][0]
      : (parts[0] || "?").slice(0, 2);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: bg,
        color: fg,
        border: `1px solid ${fg}22`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 600,
        flexShrink: 0,
        fontFamily: "'Geist Mono', monospace",
        letterSpacing: "-0.02em",
      }}
    >
      {letters.toUpperCase()}
    </div>
  );
};

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
  Active: {
    bg: "var(--badge-low-bg)",
    txt: "var(--badge-low-txt)",
    border: "var(--badge-low-border)",
  },
  Paused: {
    bg: "var(--badge-medium-bg)",
    txt: "var(--badge-medium-txt)",
    border: "var(--badge-medium-border)",
  },
  Closed: {
    bg: "var(--badge-high-bg)",
    txt: "var(--badge-high-txt)",
    border: "var(--badge-high-border)",
  },
};

const SBadge = ({ label, small }) => {
  const c = STATUS_COLORS[label] || STATUS_COLORS.New;
  return (
    <span
      style={{
        fontSize: small ? 10 : 11,
        fontWeight: 500,
        padding: small ? "1px 6px" : "2px 8px",
        borderRadius: 4,
        whiteSpace: "nowrap",
        background: c.bg,
        color: c.txt,
        border: `1px solid ${c.border}`,
      }}
    >
      {label}
    </span>
  );
};

const SkillChip = ({ label, matched }) => (
  <span
    style={{
      fontSize: 10,
      fontWeight: matched ? 500 : 400,
      padding: "2px 7px",
      borderRadius: 4,
      whiteSpace: "nowrap",
      background: matched ? "var(--badge-low-bg)" : "var(--bg-active)",
      color: matched ? "var(--badge-low-txt)" : "var(--text-muted)",
      border: `1px solid ${matched ? "var(--badge-low-border)" : "var(--border-subtle)"}`,
    }}
  >
    {matched ? "✓ " : ""}
    {label}
  </span>
);

const MatchBar = ({ score }) => {
  const color =
    score >= 80
      ? "var(--pipe-hired)"
      : score >= 60
        ? "var(--pipe-screening)"
        : "var(--pipe-rejected)";
  const txtColor =
    score >= 80
      ? "var(--badge-low-txt)"
      : score >= 60
        ? "var(--badge-medium-txt)"
        : "var(--badge-high-txt)";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div
        style={{
          flex: 1,
          height: 3,
          background: "var(--pipe-track)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: color,
            borderRadius: 99,
          }}
        />
      </div>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: txtColor,
          fontFamily: "'Geist Mono',monospace",
          flexShrink: 0,
          width: 30,
          textAlign: "right",
        }}
      >
        {score}%
      </span>
    </div>
  );
};

const ROW_H = 64;

// ── Toggle switch component ───────────────────────────────────────────────────
const Toggle = ({ on, onChange, label }) => (
  <label className="toggle-row" onClick={() => onChange(!on)}>
    <div className={`toggle-track${on ? " on" : ""}`}>
      <div className="toggle-thumb" />
    </div>
    <span className="toggle-lbl">{label}</span>
  </label>
);

// ── Pagination component ──────────────────────────────────────────────────────
const Pager = ({ page, total, onChange }) => {
  if (total <= 1) return null;
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= page - 1 && i <= page + 1))
      pages.push(i);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }
  return (
    <div className="pag-btns">
      <button
        className="pag-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        <Ico d={IC.prev} s={10} />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`e${i}`}
            style={{
              fontSize: 11,
              color: "var(--text-faint)",
              padding: "0 2px",
            }}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            className={`pag-btn${p === page ? " active" : ""}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ),
      )}
      <button
        className="pag-btn"
        disabled={page >= total}
        onClick={() => onChange(page + 1)}
      >
        <Ico d={IC.next} s={10} />
      </button>
    </div>
  );
};

// ── Draggable JD Row ──────────────────────────────────────────────────────────
const DraggableJDRow = memo(
  ({
    jd,
    isSelected,
    isBookmarked,
    isDragOver,
    onSelect,
    onBookmark,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    style,
  }) => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, jd.id)}
      onDragOver={(e) => onDragOver(e, jd.id)}
      onDrop={(e) => onDrop(e, jd.id)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(jd.id)}
      className={`drag-row${isSelected ? " selected" : ""}${isDragOver ? " drag-over" : ""}`}
      style={style}
    >
      <div className="drag-handle">
        <Ico d={IC.drag} s={13} />
      </div>
      <div
        className="drag-icon-box"
        style={{
          background: isSelected ? "var(--accent-blue)" : "var(--a1-bg)",
          color: isSelected ? "#fff" : "var(--a1-icon)",
        }}
      >
        <Ico d={IC.work} s={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="drag-title">{jd.title}</div>
        <div className="drag-sub">
          {jd.department} · {jd.applicants} applicants
        </div>
      </div>
      <SBadge label={jd.status} small />
      <button
        className={`drag-bm${isBookmarked ? " active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onBookmark(jd.id);
        }}
      >
        <Ico d={IC.bookmark} s={14} />
      </button>
    </div>
  ),
);

// ── Draggable Candidate Row ───────────────────────────────────────────────────
const DraggableCandRow = memo(
  ({
    cand,
    isSelected,
    isBookmarked,
    isDragOver,
    onSelect,
    onBookmark,
    onDragStart,
    onDragOver,
    onDrop,
    onDragEnd,
    style,
  }) => (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, cand.id)}
      onDragOver={(e) => onDragOver(e, cand.id)}
      onDrop={(e) => onDrop(e, cand.id)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(cand.id)}
      className={`drag-row${isSelected ? " selected" : ""}${isDragOver ? " drag-over" : ""}`}
      style={style}
    >
      <div className="drag-handle">
        <Ico d={IC.drag} s={13} />
      </div>
      <Initials name={cand.fullName} size={30} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="drag-title">{cand.fullName}</div>
        <div className="drag-sub">
          {cand.experienceLevel} · {cand.currentCompany}
        </div>
      </div>
      <SBadge label={cand.status} small />
      <button
        className={`drag-bm${isBookmarked ? " active" : ""}`}
        onClick={(e) => {
          e.stopPropagation();
          onBookmark(cand.id);
        }}
      >
        <Ico d={IC.bookmark} s={14} />
      </button>
    </div>
  ),
);

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function MappingPage() {
  const dispatch = useDispatch();
  //   const navigate = useNavigate();
  const navigateTo = useNavigateWithOrigin();

  const location = useLocation();
  const [tab, setTab] = useState(location.state?.mappingTab ?? 0);
  const [jdSearchRaw, setJDSearchRaw] = useState("");
  const [candSearchRaw, setCandSearchRaw] = useState("");
  const jdSearch = useDebounce(jdSearchRaw, 220);
  const candSearch = useDebounce(candSearchRaw, 220);

  const dragJDId = useRef(null);
  const dragCandId = useRef(null);
  const [dragOverJDId, setDragOverJDId] = useState(null);
  const [dragOverCandId, setDragOverCandId] = useState(null);

  // Selectors
  const stats = useSelector(selectMappingStats);
  const selectedJD = useSelector(selectSelectedJD);
  const selectedCand = useSelector(selectSelectedCandidate);
  const selectedJDId = useSelector(selectSelectedJDId);
  const selectedCandId = useSelector(selectSelectedCandId);
  const bookmarkedJDs = useSelector(selectBookmarkedJDs);
  const bookmarkedCands = useSelector(selectBookmarkedCandidates);
  const showBmJDsOnly = useSelector(selectShowBookmarkedJDsOnly);
  const showBmCandsOnly = useSelector(selectShowBookmarkedCandsOnly);
  const jdCustomOrder = useSelector(selectJDCustomOrder);
  const candCustomOrder = useSelector(selectCandCustomOrder);
  const jdCandFilter = useSelector((s) => s.mapping.jdCandFilter);
  const jdCandPage = useSelector((s) => s.mapping.jdCandPage);
  const candJDFilter = useSelector((s) => s.mapping.candJDFilter);
  const candJDPage = useSelector((s) => s.mapping.candJDPage);
  const allOrderedJDs = useSelector(selectOrderedJDs);
  const allOrderedCands = useSelector(selectOrderedCandidates);
  const jdCandidates = useSelector(selectJDCandidatesPaginated);
  const jdCandTotal = useSelector(selectJDCandidates);
  const jdCandTotalPages = useSelector(selectJDCandidatesTotalPages);
  const candJDs = useSelector(selectCandMatchingJDsPaginated);
  const candJDTotal = useSelector(selectCandidateMatchingJDs);
  const candJDTotalPages = useSelector(selectCandMatchingJDsTotalPages);

  // Filtered lists
  const displayedJDs = useMemo(() => {
    const base = jdSearch
      ? allOrderedJDs.filter(
          (j) =>
            j.title.toLowerCase().includes(jdSearch.toLowerCase()) ||
            j.department.toLowerCase().includes(jdSearch.toLowerCase()),
        )
      : allOrderedJDs;
    return showBmJDsOnly
      ? base.filter((j) => bookmarkedJDs.includes(j.id))
      : base;
  }, [allOrderedJDs, jdSearch, showBmJDsOnly, bookmarkedJDs]);

  const displayedCands = useMemo(() => {
    const base = candSearch
      ? allOrderedCands.filter(
          (c) =>
            c.fullName.toLowerCase().includes(candSearch.toLowerCase()) ||
            c.email?.toLowerCase().includes(candSearch.toLowerCase()),
        )
      : allOrderedCands;
    return showBmCandsOnly
      ? base.filter((c) => bookmarkedCands.includes(c.id))
      : base;
  }, [allOrderedCands, candSearch, showBmCandsOnly, bookmarkedCands]);

  // Virtualization
  const [jdScroll, setJDScroll] = useState(0);
  const [candScroll, setCandScroll] = useState(0);
  const LIST_VIEWPORT = 400;
  const overscan = 5;
  const getVisible = useCallback((items, scrollTop) => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_H) - overscan);
    const end = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + LIST_VIEWPORT) / ROW_H) + overscan,
    );
    return items
      .slice(start, end + 1)
      .map((item, i) => ({ item, offsetTop: (start + i) * ROW_H }));
  }, []);

  const visibleJDs = useMemo(
    () => getVisible(displayedJDs, jdScroll),
    [displayedJDs, jdScroll],
  );
  const visibleCands = useMemo(
    () => getVisible(displayedCands, candScroll),
    [displayedCands, candScroll],
  );

  // JD drag handlers
  const handleJDDragStart = useCallback((e, id) => {
    dragJDId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }, []);
  const handleJDDragOver = useCallback((e, id) => {
    e.preventDefault();
    setDragOverJDId(id);
  }, []);
  const handleJDDrop = useCallback(
    (e, targetId) => {
      e.preventDefault();
      const src = dragJDId.current;
      if (!src || src === targetId) {
        setDragOverJDId(null);
        return;
      }
      const ids = displayedJDs.map((j) => j.id);
      const si = ids.indexOf(src),
        ti = ids.indexOf(targetId);
      if (si < 0 || ti < 0) {
        setDragOverJDId(null);
        return;
      }
      const next = [...ids];
      next.splice(si, 1);
      next.splice(ti, 0, src);
      dispatch(reorderJDs({ orderedIds: next }));
      dragJDId.current = null;
      setDragOverJDId(null);
    },
    [displayedJDs, dispatch],
  );
  const handleJDDragEnd = useCallback(() => {
    dragJDId.current = null;
    setDragOverJDId(null);
  }, []);

  // Cand drag handlers
  const handleCandDragStart = useCallback((e, id) => {
    dragCandId.current = id;
    e.dataTransfer.effectAllowed = "move";
  }, []);
  const handleCandDragOver = useCallback((e, id) => {
    e.preventDefault();
    setDragOverCandId(id);
  }, []);
  const handleCandDrop = useCallback(
    (e, targetId) => {
      e.preventDefault();
      const src = dragCandId.current;
      if (!src || src === targetId) {
        setDragOverCandId(null);
        return;
      }
      const ids = displayedCands.map((c) => c.id);
      const si = ids.indexOf(src),
        ti = ids.indexOf(targetId);
      if (si < 0 || ti < 0) {
        setDragOverCandId(null);
        return;
      }
      const next = [...ids];
      next.splice(si, 1);
      next.splice(ti, 0, src);
      dispatch(reorderCandidates({ orderedIds: next }));
      dragCandId.current = null;
      setDragOverCandId(null);
    },
    [displayedCands, dispatch],
  );
  const handleCandDragEnd = useCallback(() => {
    dragCandId.current = null;
    setDragOverCandId(null);
  }, []);

  // Stable callbacks
  const selectJDCb = useCallback((id) => dispatch(selectJD(id)), [dispatch]);
  const selectCandCb = useCallback(
    (id) => dispatch(selectCandidate(id)),
    [dispatch],
  );
  const bmJD = useCallback((id) => dispatch(toggleJDBookmark(id)), [dispatch]);
  const bmCand = useCallback(
    (id) => dispatch(toggleCandBookmark(id)),
    [dispatch],
  );

  // Stat strip data
  const STATS = [
    { lbl: "Total JDs", val: stats.totalJDs, color: "var(--text-primary)" },
    {
      lbl: "With Applicants",
      val: stats.withCands,
      color: "var(--badge-low-txt)",
    },
    {
      lbl: "Total Candidates",
      val: stats.totalCandidates,
      color: "var(--text-primary)",
    },
    { lbl: "Avg per JD", val: stats.avgPerJD, color: "var(--accent-blue)" },
    {
      lbl: "Bookmarked JDs",
      val: stats.bookmarkedJDs,
      color: "var(--badge-medium-txt)",
    },
    {
      lbl: "Bookmarked Cands",
      val: stats.bookmarkedCands,
      color: "var(--badge-medium-txt)",
    },
  ];

  return (
    <>
      {/* <style>{css}</style> */}
      <div className="mp">
        {/* Header */}
        <div className="mp-header">
          <div>
            <div className="mp-title">Mapping</div>
            <div className="mp-sub">
              JD ↔ Candidate · Drag to reorder · Bookmark to save
            </div>
          </div>
        </div>

        {/* Stat strip */}
        <div className="stat-strip">
          {STATS.map((s) => (
            <div className="ss" key={s.lbl}>
              <div className="ss-val" style={{ color: s.color }}>
                {s.val}
              </div>
              <div className="ss-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="tab-bar">
          <button
            className={`tab-btn${tab === 0 ? " active" : ""}`}
            onClick={() => setTab(0)}
          >
            <Ico d={IC.work} s={13} /> JD → Candidates
          </button>
          <button
            className={`tab-btn${tab === 1 ? " active" : ""}`}
            onClick={() => setTab(1)}
          >
            <Ico d={IC.people} s={13} /> Candidate → JDs
          </button>
        </div>

        {/* ══════════════════ TAB 0: JD → Candidates ══════════════════ */}
        {tab === 0 && (
          <div className="map-grid">
            {/* LEFT: JD list */}
            <div className="panel">
              <div className="panel-hdr1">
                <div className="panel-hdr-row">
                  <div>
                    <span className="panel-hdr-title">Job Descriptions</span>
                    <span className="count-pill">{displayedJDs.length}</span>
                    {bookmarkedJDs.length > 0 && (
                      <span className="bm-pill">★ {bookmarkedJDs.length}</span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {jdCustomOrder && (
                      <button
                        className="icon-btn"
                        title="Reset order"
                        onClick={() => dispatch(resetJDOrder())}
                      >
                        <Ico d={IC.reset} s={13} />
                      </button>
                    )}
                    {bookmarkedJDs.length > 0 && (
                      <button
                        className="icon-btn bm-active"
                        title="Clear bookmarks"
                        onClick={() => dispatch(clearJDBookmarks())}
                      >
                        <Ico d={IC.bm_clear} s={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="search-wrap">
                  <span className="search-icon">
                    <Ico d={IC.search} s={13} />
                  </span>
                  <input
                    className="search-inp"
                    placeholder="Search JDs…"
                    value={jdSearchRaw}
                    onChange={(e) => setJDSearchRaw(e.target.value)}
                  />
                  {jdSearchRaw && (
                    <button
                      className="search-clear"
                      onClick={() => setJDSearchRaw("")}
                    >
                      <Ico d={IC.clear} s={11} />
                    </button>
                  )}
                </div>

                <Toggle
                  on={showBmJDsOnly}
                  onChange={(v) => dispatch(setShowBookmarkedJDsOnly(v))}
                  label="Bookmarked only"
                />
              </div>

              {/* Banner */}
              <div
                className={`banner ${jdCustomOrder ? "banner-custom" : "banner-default"}`}
              >
                {jdCustomOrder ? (
                  <>
                    Custom order active ·{" "}
                    <span
                      className="banner-link"
                      onClick={() => dispatch(resetJDOrder())}
                    >
                      Reset
                    </span>
                  </>
                ) : (
                  "↕ Drag to reorder · ★ Bookmark"
                )}
              </div>

              {/* Virtualized list */}
              <div
                className="custom-scrolls"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  position: "relative",
                  padding: "0px",
                }}
                onScroll={(e) => setJDScroll(e.currentTarget.scrollTop)}
              >
                <div
                  className="virt-container"
                  style={{ height: displayedJDs.length * ROW_H }}
                >
                  {visibleJDs.map(({ item: jd, offsetTop }) => (
                    <DraggableJDRow
                      key={jd.id}
                      jd={jd}
                      isSelected={jd.id === selectedJDId}
                      isBookmarked={bookmarkedJDs.includes(jd.id)}
                      isDragOver={dragOverJDId === jd.id}
                      onSelect={selectJDCb}
                      onBookmark={bmJD}
                      onDragStart={handleJDDragStart}
                      onDragOver={handleJDDragOver}
                      onDrop={handleJDDrop}
                      onDragEnd={handleJDDragEnd}
                      style={{
                        position: "absolute",
                        top: offsetTop,
                        left: 0,
                        right: 0,
                        height: ROW_H,
                      }}
                    />
                  ))}
                  {displayedJDs.length === 0 && (
                    <div
                      className="empty"
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <span className="empty-icon">
                        <Ico d={IC.work} s={32} />
                      </span>
                      <span className="empty-lbl">No JDs found</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Candidates for selected JD */}
            <div className="panel">
              {!selectedJD ? (
                <div className="empty">
                  <span className="empty-icon">
                    <Ico d={IC.link} s={40} />
                  </span>
                  <span className="empty-lbl">
                    Select a Job Description
                    <br />
                    to view its candidates
                  </span>
                </div>
              ) : (
                <>
                  {/* JD header */}
                  <div className="sel-header">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 4,
                          }}
                        >
                          <div className="sel-role">{selectedJD.title}</div>
                          <button
                            className={`drag-bm${bookmarkedJDs.includes(selectedJD.id) ? " active" : ""}`}
                            onClick={() =>
                              dispatch(toggleJDBookmark(selectedJD.id))
                            }
                          >
                            <Ico d={IC.bookmark} s={14} />
                          </button>
                        </div>
                        <div className="sel-meta">
                          <span className="sel-meta-item">
                            <Ico d={IC.dept} s={11} />
                            {selectedJD.department}
                          </span>
                          <span className="sel-meta-item">
                            <Ico d={IC.loc} s={11} />
                            {selectedJD.location}
                          </span>
                          <SBadge label={selectedJD.status} />
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--accent-blue)",
                              fontFamily: "'Geist Mono',monospace",
                              fontWeight: 600,
                            }}
                          >
                            {jdCandTotal.length} candidates
                          </span>
                        </div>
                      </div>
                      <button
                        className="nav-btn"
                        onClick={() =>
                          navigateTo(`/jds/${selectedJD.id}`, {
                            state: { mappingTab: tab },
                          })
                        }
                      >
                        View JD <Ico d={IC.arrow} s={12} />
                      </button>
                    </div>
                  </div>

                  {/* Candidate filters */}
                  <div className="inner-filters">
                    <div
                      className="search-wrap"
                      style={{ flex: 1, minWidth: 130 }}
                    >
                      <span className="search-icon">
                        <Ico d={IC.search} s={12} />
                      </span>
                      <input
                        className="search-inp"
                        placeholder="Search candidates…"
                        value={jdCandFilter.search}
                        onChange={(e) =>
                          dispatch(
                            setJDCandFilter({
                              key: "search",
                              value: e.target.value,
                            }),
                          )
                        }
                      />
                    </div>
                    <select
                      className="inner-sel"
                      value={jdCandFilter.status}
                      onChange={(e) =>
                        dispatch(
                          setJDCandFilter({
                            key: "status",
                            value: e.target.value,
                          }),
                        )
                      }
                    >
                      <option value="">All Status</option>
                      {Object.values(STATUS).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <select
                      className="inner-sel"
                      value={jdCandFilter.experienceLevel}
                      onChange={(e) =>
                        dispatch(
                          setJDCandFilter({
                            key: "experienceLevel",
                            value: e.target.value,
                          }),
                        )
                      }
                    >
                      <option value="">All Experience</option>
                      {EXPERIENCE_LEVELS.map((e) => (
                        <option key={e}>{e}</option>
                      ))}
                    </select>
                    <select
                      className="inner-sel"
                      value={jdCandFilter.matchScoreMin}
                      onChange={(e) =>
                        dispatch(
                          setJDCandFilter({
                            key: "matchScoreMin",
                            value: e.target.value,
                          }),
                        )
                      }
                    >
                      <option value="">Any Match</option>
                      {["50", "60", "70", "80", "90"].map((v) => (
                        <option key={v} value={v}>
                          {v}%+
                        </option>
                      ))}
                    </select>
                    {Object.values(jdCandFilter).some(Boolean) && (
                      <button
                        className="clear-sm"
                        onClick={() => dispatch(clearJDCandFilter())}
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Candidate cards */}
                  <div
                    className="custom-scrolls"
                    style={{ flex: 1, overflowY: "auto", position: "relative" }}
                  >
                    {jdCandidates.length === 0 ? (
                      <div className="empty" style={{ minHeight: 200 }}>
                        <span className="empty-icon">
                          <Ico d={IC.unlink} s={32} />
                        </span>
                        <span className="empty-lbl">
                          No candidates match your filters
                        </span>
                      </div>
                    ) : (
                      <div className="cand-grid">
                        {jdCandidates.map((c) => {
                          const scoreColor =
                            c.matchScore >= 80
                              ? "var(--badge-low-txt)"
                              : c.matchScore >= 60
                                ? "var(--badge-medium-txt)"
                                : "var(--badge-high-txt)";
                          return (
                            <div
                              className="cand-card"
                              key={c.id}
                              onClick={() =>
                                navigateTo(`/candidates/${c.id}`, {
                                  state: { mappingTab: tab },
                                })
                              }
                            >
                              <div className="cand-top">
                                <Initials name={c.fullName} size={34} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "flex-start",
                                    }}
                                  >
                                    <div className="cand-name">
                                      {c.fullName}
                                    </div>
                                    <span
                                      className="cand-score"
                                      style={{ color: scoreColor }}
                                    >
                                      {c.matchScore}%
                                    </span>
                                  </div>
                                  <div className="cand-sub">
                                    {c.experienceLevel} · {c.currentCompany}
                                  </div>
                                </div>
                              </div>
                              <MatchBar score={c.matchScore} />
                              <div className="cand-footer">
                                <SBadge label={c.status} small />
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <span className="notice-lbl">
                                    {c.noticePeriod}
                                  </span>
                                  <button
                                    className={`drag-bm${bookmarkedCands.includes(c.id) ? " active" : ""}`}
                                    style={{ padding: 2 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dispatch(toggleCandBookmark(c.id));
                                    }}
                                  >
                                    <Ico d={IC.bookmark} s={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {jdCandTotalPages > 1 && (
                    <div className="pag-bar">
                      <span className="pag-info">
                        {jdCandTotal.length} candidates
                      </span>
                      <Pager
                        page={jdCandPage}
                        total={jdCandTotalPages}
                        onChange={(p) => dispatch(setJDCandPage(p))}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════ TAB 1: Candidate → JDs ══════════════════ */}
        {tab === 1 && (
          <div className="map-grid">
            {/* LEFT: Candidate list */}
            <div className="panel">
              <div className="panel-hdr1">
                <div className="panel-hdr-row">
                  <div>
                    <span className="panel-hdr-title">Candidates</span>
                    <span className="count-pill">{displayedCands.length}</span>
                    {bookmarkedCands.length > 0 && (
                      <span className="bm-pill">
                        ★ {bookmarkedCands.length}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {candCustomOrder && (
                      <button
                        className="icon-btn"
                        title="Reset order"
                        onClick={() => dispatch(resetCandOrder())}
                      >
                        <Ico d={IC.reset} s={13} />
                      </button>
                    )}
                    {bookmarkedCands.length > 0 && (
                      <button
                        className="icon-btn bm-active"
                        title="Clear bookmarks"
                        onClick={() => dispatch(clearCandBookmarks())}
                      >
                        <Ico d={IC.bm_clear} s={13} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="search-wrap">
                  <span className="search-icon">
                    <Ico d={IC.search} s={13} />
                  </span>
                  <input
                    className="search-inp"
                    placeholder="Search candidates…"
                    value={candSearchRaw}
                    onChange={(e) => setCandSearchRaw(e.target.value)}
                  />
                  {candSearchRaw && (
                    <button
                      className="search-clear"
                      onClick={() => setCandSearchRaw("")}
                    >
                      <Ico d={IC.clear} s={11} />
                    </button>
                  )}
                </div>

                <Toggle
                  on={showBmCandsOnly}
                  onChange={(v) => dispatch(setShowBookmarkedCandsOnly(v))}
                  label="Bookmarked only"
                />
              </div>

              <div
                className={`banner ${candCustomOrder ? "banner-custom" : "banner-default"}`}
              >
                {candCustomOrder ? (
                  <>
                    Custom order active ·{" "}
                    <span
                      className="banner-link"
                      onClick={() => dispatch(resetCandOrder())}
                    >
                      Reset
                    </span>
                  </>
                ) : (
                  "↕ Drag to reorder · ★ Bookmark"
                )}
              </div>

              <div
                className="custom-scrolls"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  position: "relative",
                  padding: "0px",
                }}
                onScroll={(e) => setCandScroll(e.currentTarget.scrollTop)}
              >
                <div
                  className="virt-container"
                  style={{ height: displayedCands.length * ROW_H }}
                >
                  {visibleCands.map(({ item: cand, offsetTop }) => (
                    <DraggableCandRow
                      key={cand.id}
                      cand={cand}
                      isSelected={cand.id === selectedCandId}
                      isBookmarked={bookmarkedCands.includes(cand.id)}
                      isDragOver={dragOverCandId === cand.id}
                      onSelect={selectCandCb}
                      onBookmark={bmCand}
                      onDragStart={handleCandDragStart}
                      onDragOver={handleCandDragOver}
                      onDrop={handleCandDrop}
                      onDragEnd={handleCandDragEnd}
                      style={{
                        position: "absolute",
                        top: offsetTop,
                        left: 0,
                        right: 0,
                        height: ROW_H,
                      }}
                    />
                  ))}
                  {displayedCands.length === 0 && (
                    <div
                      className="empty"
                      style={{ position: "absolute", inset: 0 }}
                    >
                      <span className="empty-icon">
                        <Ico d={IC.people} s={32} />
                      </span>
                      <span className="empty-lbl">No candidates found</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: Matching JDs for selected candidate */}
            <div className="panel">
              {!selectedCand ? (
                <div className="empty">
                  <span className="empty-icon">
                    <Ico d={IC.swap} s={40} />
                  </span>
                  <span className="empty-lbl">
                    Select a Candidate to view
                    <br />
                    matching Job Descriptions
                  </span>
                </div>
              ) : (
                <>
                  {/* Candidate header */}
                  <div className="cand-header">
                    <div className="cand-header-top">
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <Initials name={selectedCand.fullName} size={40} />
                        <div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <div className="sel-role">
                              {selectedCand.fullName}
                            </div>
                            <button
                              className={`drag-bm${bookmarkedCands.includes(selectedCand.id) ? " active" : ""}`}
                              onClick={() =>
                                dispatch(toggleCandBookmark(selectedCand.id))
                              }
                            >
                              <Ico d={IC.bookmark} s={14} />
                            </button>
                          </div>
                          <div className="sel-meta">
                            <span className="sel-meta-item">
                              {selectedCand.experienceLevel}
                            </span>
                            <span className="sel-meta-item">·</span>
                            <span
                              style={{
                                fontSize: 11,
                                color: "var(--accent-blue)",
                                fontFamily: "'Geist Mono',monospace",
                                fontWeight: 600,
                              }}
                            >
                              {candJDTotal.length} matching JDs
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        className="nav-btn"
                        onClick={() =>
                          navigateTo(`/candidates/${selectedCand.id}`, {
                            state: { mappingTab: tab },
                          })
                        }
                      >
                        View Profile <Ico d={IC.arrow} s={12} />
                      </button>
                    </div>
                    {/* Skill tags */}
                    <div
                      className="meta-chips"
                      style={{
                        marginTop: 10,
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 5,
                      }}
                    >
                      {selectedCand.skills.map((sk) => (
                        <span
                          key={sk}
                          style={{
                            fontSize: 10,
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: "var(--bg-active)",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border-subtle)",
                          }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* JD filter */}
                  <div className="inner-filters">
                    <div
                      className="search-wrap"
                      style={{ flex: 1, minWidth: 130 }}
                    >
                      <span className="search-icon">
                        <Ico d={IC.search} s={12} />
                      </span>
                      <input
                        className="search-inp"
                        placeholder="Search JDs…"
                        value={candJDFilter.search}
                        onChange={(e) =>
                          dispatch(
                            setCandJDFilter({
                              key: "search",
                              value: e.target.value,
                            }),
                          )
                        }
                      />
                    </div>
                    <select
                      className="inner-sel"
                      value={candJDFilter.status}
                      onChange={(e) =>
                        dispatch(
                          setCandJDFilter({
                            key: "status",
                            value: e.target.value,
                          }),
                        )
                      }
                    >
                      <option value="">All Status</option>
                      {["Active", "Paused", "Closed"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  {/* JD match cards */}
                  <div
                    className="custom-scrolls"
                    style={{ flex: 1, overflowY: "auto", position: "relative" }}
                  >
                    {candJDs.length === 0 ? (
                      <div className="empty" style={{ minHeight: 200 }}>
                        <span className="empty-icon">
                          <Ico d={IC.unlink} s={32} />
                        </span>
                        <span className="empty-lbl">No matching JDs found</span>
                      </div>
                    ) : (
                      candJDs.map((jd) => {
                        const matched =
                          jd.skills?.filter((sk) =>
                            selectedCand.skills.some(
                              (cs) => cs.toLowerCase() === sk.toLowerCase(),
                            ),
                          ) || [];
                        const scoreColor =
                          jd.compatibilityScore >= 60
                            ? "var(--badge-low-txt)"
                            : "var(--badge-medium-txt)";
                        return (
                          <div
                            className="jd-card"
                            key={jd.id}
                            onClick={() =>
                              navigateTo(`/jds/${jd.id}`, {
                                state: { mappingTab: tab },
                              })
                            }
                          >
                            <div className="jd-card-top">
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 7,
                                    marginBottom: 4,
                                  }}
                                >
                                  <div className="jd-card-title">
                                    {jd.title}
                                  </div>
                                  <button
                                    className={`drag-bm${bookmarkedJDs.includes(jd.id) ? " active" : ""}`}
                                    style={{ padding: 2, flexShrink: 0 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dispatch(toggleJDBookmark(jd.id));
                                    }}
                                  >
                                    <Ico d={IC.bookmark} s={13} />
                                  </button>
                                </div>
                                <div className="jd-card-id">{jd.id}</div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    flexWrap: "wrap",
                                    marginTop: 6,
                                  }}
                                >
                                  <SBadge label={jd.status} small />
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    {jd.department}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    ·
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: "var(--text-muted)",
                                    }}
                                  >
                                    {jd.location}
                                  </span>
                                  {jd.deptMatch && (
                                    <span className="dept-match">
                                      Dept match
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="jd-score-box">
                                <div
                                  className="jd-score-val"
                                  style={{ color: scoreColor }}
                                >
                                  {jd.compatibilityScore}%
                                </div>
                                <div className="jd-score-lbl">match</div>
                                <div
                                  style={{
                                    fontSize: 10,
                                    color: "var(--accent-blue)",
                                    fontWeight: 600,
                                    marginTop: 2,
                                  }}
                                >
                                  {jd.skillOverlap} skills
                                </div>
                              </div>
                            </div>
                            <MatchBar score={jd.compatibilityScore} />
                            {jd.skills && (
                              <div className="skills-row">
                                {jd.skills.slice(0, 6).map((sk) => (
                                  <SkillChip
                                    key={sk}
                                    label={sk}
                                    matched={selectedCand.skills.some(
                                      (cs) =>
                                        cs.toLowerCase() === sk.toLowerCase(),
                                    )}
                                  />
                                ))}
                                {jd.skills.length > 6 && (
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color: "var(--text-faint)",
                                      alignSelf: "center",
                                    }}
                                  >
                                    +{jd.skills.length - 6}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {candJDTotalPages > 1 && (
                    <div className="pag-bar">
                      <span className="pag-info">
                        {candJDTotal.length} matching JDs
                      </span>
                      <Pager
                        page={candJDPage}
                        total={candJDTotalPages}
                        onChange={(p) => dispatch(setCandJDPage(p))}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
