import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import '../styles/sidebar.css'
// ── Icons (inline SVG, no dependency) ──────────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  dashboard:  "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  jds:        "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  candidates: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100 8 4 4 0 000-8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  mapping:    "M6 3v7a6 6 0 006 6 6 6 0 006-6V3 M4 21h16",
  sun:        "M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42 M12 17a5 5 0 100-10 5 5 0 000 10z",
  moon:       "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  logout:     "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
};

const NAV = [
  { to: "/",           label: "Dashboard",       icon: Icons.dashboard  },
  { to: "/jds",        label: "Job Descriptions", icon: Icons.jds       },
  { to: "/candidates", label: "Candidates",       icon: Icons.candidates },
  { to: "/mapping",    label: "Mapping",          icon: Icons.mapping    },
];


export default function Sidebar() {
  const { dark, toggle } = useTheme();

  return (
    <>
      {/* <style>{css}</style> */}
      <aside className="sidebar">

        {/* Brand */}
        <div className="sb-brand">
          <div className="sb-avatar">R</div>
          <div>
            <div className="sb-brand-name">RecruitPro</div>
            <div className="sb-brand-sub">ATS Platform</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <div className="sb-section-label">Main</div>
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) => `sb-link${isActive ? " active" : ""}`}
            >
              <span className="sb-link-icon">
                <Icon d={icon} size={15} />
              </span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <button className="sb-theme-btn" onClick={toggle}>
            <span className="sb-link-icon" style={{ opacity: 0.7 }}>
              <Icon d={dark ? Icons.sun : Icons.moon} size={15} />
            </span>
            {dark ? "Light mode" : "Dark mode"}
            <span className="theme-pill">{dark ? "Dark" : "Light"}</span>
          </button>
          <div className="sb-divider" style={{ margin: "4px 0" }} />
          <div className="sb-user">
            <div className="sb-user-avatar">A</div>
            <div>
              <div className="sb-user-name">Admin</div>
              <div className="sb-user-role">Recruiter</div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}