import '../styles/dashboard.css'
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getDashboardStats, STATUS } from "../data/mockData";

// ── Mini SVG Icons ────────────────────────────────────────────────────────────
const Ico = ({ d, s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ICONS = {
  people:  "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  work:    "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6",
  check:   "M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3",
  percent: "M19 5L5 19 M6.5 6.5a1 1 0 100 2 1 1 0 000-2z M17.5 17.5a1 1 0 100 2 1 1 0 000-2z",
  star:    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  trend:   "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  arrow:   "M5 12h14 M12 5l7 7-7 7",
};

const PIPE_COLORS = {
  New: "var(--pipe-new)", Screening: "var(--pipe-screening)",
  Interview: "var(--pipe-interview)", Offer: "var(--pipe-offer)",
  Hired: "var(--pipe-hired)", Rejected: "var(--pipe-rejected)",
};

const STAT_META = [
  { icon: ICONS.people,  a: 1, trend: "+12%", up: true  },
  { icon: ICONS.work,    a: 2, trend: "+3",   up: true  },
  { icon: ICONS.check,   a: 3, trend: "+8",   up: true  },
  { icon: ICONS.percent, a: 4, trend: "-0.4%",up: false },
  { icon: ICONS.star,    a: 5, trend: "+2%",  up: true  },
  { icon: ICONS.trend,   a: 6, trend: "+5",   up: true  },
];



export default function Dashboard() {
  const stats = useMemo(() => getDashboardStats(), []);
  const navigate = useNavigate();
  const maxMonthly = Math.max(...stats.monthly.map((m) => m.count), 1);
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const statCards = [
    { label: "Total Candidates", value: stats.totalCandidates.toLocaleString() },
    { label: "Active JDs",        value: stats.activeJDs },
    { label: "Total Hired",       value: stats.totalHired },
    { label: "Conversion Rate",   value: `${stats.conversionRate}%` },
    { label: "Avg Match Score",   value: `${stats.avgMatchScore}%` },
    { label: "Total Openings",    value: stats.totalOpenings },
  ];

  const sortedSources = Object.entries(stats.bySource).sort((a, b) => b[1] - a[1]);

  return (
    <>
      {/* <style>{css}</style> */}
      <div className="db">

        <div className="db-header">
          <div>
            <div className="db-title">Dashboard</div>
            <div className="db-date">{today}</div>
          </div>
          <div className="hbtns">
            <button className="btn btn-primary1" onClick={() => navigate("/candidates")}>Candidates</button>
            <button className="btn btn-ghost1" onClick={() => navigate("/jds")}>Job Descriptions</button>
          </div>
        </div>

        <div className="stat-grid">
          {statCards.map((card, i) => {
            const m = STAT_META[i];
            return (
              <div className="sc" key={card.label}>
                <div className="sc-icon" style={{ background: `var(--a${m.a}-bg)`, color: `var(--a${m.a}-icon)` }}>
                  <Ico d={m.icon} s={14} />
                </div>
                <div className="sc-val">{card.value}</div>
                <div className="sc-row">
                  <span className="sc-label">{card.label}</span>
                  <span className={`sc-trend ${m.up ? "trend-up" : "trend-dn"}`}>
                    {m.up ? "↑" : "↓"} {m.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="charts-grid">
          <div className="paneld">
            <div className="panel-title">Applications · Last 6 months</div>
            <div className="bar-wrap">
              {stats.monthly.map((m) => {
                const pct = Math.round((m.count / maxMonthly) * 100);
                return (
                  <div className="bar-col" key={m.month}>
                    <div className="bar-val">{m.count}</div>
                    <div className="bar-fill" style={{ height: `${Math.max(pct, 5)}%` }} />
                    <div className="bar-month">{m.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="paneld">
            <div className="panel-title">Hiring Pipeline</div>
            {Object.values(STATUS).map((s) => {
              const count = stats.byStatus[s] || 0;
              const pct = Math.round((count / stats.totalCandidates) * 100);
              return (
                <div className="pipe-row" key={s}>
                  <div className="pipe-hdr">
                    <span className="pipe-lbl">{s}</span>
                    <span className="pipe-cnt">{count}</span>
                  </div>
                  <div className="pipe-track">
                    <div className="pipe-fill" style={{ width: `${pct}%`, background: PIPE_COLORS[s] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bottom-grid">
          <div className="paneld">
            <div className="sec-hdr">
              <div className="panel-title" style={{ marginBottom: 0 }}>Top Job Descriptions</div>
              <button className="view-all-btn" onClick={() => navigate("/jds")}>
                View all <Ico d={ICONS.arrow} s={12} />
              </button>
            </div>
            {stats.topJDs.map((jd) => (
              <div className="jd-item" key={jd.id} onClick={() => navigate("/jds")}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="jd-title">{jd.title}</div>
                  <div className="jd-meta">{jd.department} · {jd.location}</div>
                </div>
                <div className="jd-badges">
                  <span className={`badge badge-${jd.priority.toLowerCase()}`}>{jd.priority}</span>
                  <span className="badge badge-count">{jd.applicants}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="paneld">
            <div className="panel-title">Candidates by Source</div>
            {sortedSources.map(([source, count]) => {
              const pct = Math.round((count / stats.totalCandidates) * 100);
              return (
                <div className="src-row" key={source}>
                  <span className="src-name">{source}</span>
                  <div className="src-track">
                    <div className="src-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="src-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </>
  );
}