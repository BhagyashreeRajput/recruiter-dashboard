# RecruitPro — Frontend Candidate Evaluation Interface

> Production-grade ATS (Applicant Tracking System) frontend handling 1000+ JDs and Candidates with full search, filtering, mapping, dark/light mode, drag-drop reordering, and bookmarking. Zero backend — all state in Redux + mock data.


## Tech Stack
| Framework | React 18 (Vite) |
| State | Redux Toolkit |
| Routing | React Router v6 |
| Styling | Zero MUI — pure CSS variables (`global.css`) |
| Icons | Inline SVG paths (no icon library) |
| Data | Mock JSON (1000+ JDs, 1000+ Candidates) |


## Features 

###  Dashboard
- 6 live stat cards: Total Candidates, Active JDs, Total Hired, Conversion Rate, Avg Match Score, Total Openings — each with trend indicator (↑/↓)
- Bar chart — Applications over last 6 months
- Pipeline progress bars — all 6 statuses with color-coded fill
- Top Job Descriptions list with priority + applicant count badges
- Candidates by Source — horizontal progress bars with percentages
- Quick navigation buttons to Candidates and JDs

###  JD Management (`/jds`)
- **Table** with 11 columns: ID, Title & Dept, Location, Experience, Skills, Openings, Applicants, Priority, Status, Posted, Action
- **Sorting** on Title, Applicants, Openings, Priority, Posted Date — with directional icons
- **Search** across title, department, skill, location
- **Quick filters**: Status, Department (inline dropdowns)
- **Expanded filters** (collapsible): Priority, Job Type, Location, Skill, Experience range (dual slider — min/max)
- **Active filter chips** with individual remove buttons
- **Pagination** with ellipsis, first/prev/next/last buttons
- **Stat strip**: Total, Active, Paused, Closed, Openings, Hired
- **createSelector** memoized selectors for filtered + paginated data

###  JD Detail (`/jds/:id`)
- Full JD info: title, ID, type, department, location, experience, salary, posted date
- **Status changer** — live Redux dispatch (`updateJDStatus`)
- 4-box stat row: Openings / Applicants / Hired / Remaining
- Job description, responsibilities checklist, requirements checklist
- Skills grid with dot indicators
- **Hiring funnel** — 5-stage progress bars (Applied → Screened → Interviewed → Offered → Hired)
- Timeline panel with stage dates
- Sidebar details table with 10 key fields

###  Candidate Management (`/candidates`)
- **Table** with 8 columns: Candidate (initials avatar + email), Applied For, Experience, Match %, Skills, Source, Status, Applied Date
- **Status tab strip** — All / New / Screening / Interview / Offer / Hired / Rejected with live counts
- **Sorting** on Name, Experience, Match Score, Applied Date
- **Search** across name, email, company, skill, JD title
- **Quick filters**: Department, Experience Level
- **Expanded filters**: Source, Location, Skill, Min Match Score (slider)
- **Active filter chips** with individual remove
- **Stars rating** (read-only, 5-star SVG) per candidate
- **Match score** color-coded (green ≥80 / amber ≥60 / red <60)
- Pagination with ellipsis, first/prev/next/last

###  Candidate Detail (`/candidates/:id`)
- **Initials avatar** with name-hashed color pairs
- Full contact info: email, phone, location, experience, education
- **Recruitment pipeline stepper** — 5 steps (New → Screening → Interview → Offer → Hired), done/active/future states with connector lines; rejected shows a banner instead
- **Match score** — large monospace % + color-coded progress bar
- Professional summary, application details grid (8 fields), education panel
- **Skills grid** — all skills as hover pills
- **Interview history** — round cards with type, interviewer, italic feedback quote, result badge (Passed/Failed/Pending)
- **Status update** — native `<select>` + Update button, dispatches `updateCandidateStatus` to Redux 
- **Notes** — existing notes shown in blue info box, add new note textarea dispatches `addNote` to Redux
- **Resume preview modal** — custom overlay (no MUI Dialog), full formatted resume layout, click outside to close
- Resume download link
- **Toast notification** — slide-up animation, auto-dismisses in 3s, replaces MUI Snackbar
- Tags section
- Smart back navigation via `useBack` hook preserving `from` path

###  Mapping (`/mapping`)
- **Two tabs**: JD → Candidates · Candidate → JDs
- **Virtualized lists** — manual windowing (no react-window), renders only visible rows + overscan, handles 1000+ items smoothly
- **Native HTML5 drag-drop** to reorder both JD and Candidate lists; custom order persists in Redux; "Reset order" button
- **Bookmarking** — star button per row, bookmark filter toggle, bulk clear bookmarks; counts shown in header pills
- **Debounced search** (220ms) on both lists via `useDebounce`
- **JD → Candidates panel**: shows all candidates for selected JD with match score bar, status badge, notice period, per-card bookmark
- **Candidate → JDs panel**: shows matching JDs for selected candidate with compatibility score, skill overlap count, matched skills highlighted green (✓), dept match badge
- **Inner filters** on both right panels (status, experience, min match %)
- **Pagination** on both right panels
- **Tab persistence** across navigation — tab index stored in React Router `location.state` (`mappingTab`), restored on back navigation via `useNavigateWithOrigin` + `useBack`
- Navigate to JD detail or Candidate detail from mapping panel, back button returns to correct tab

###  Theme System
- **Dark / Light mode** — single toggle button in Sidebar footer
- Preference persisted in `localStorage` (`rp-theme`)
- System preference auto-detected on first visit via `prefers-color-scheme`
- `data-theme` attribute set on `<html>` — all CSS variables flip atomically, no flash

### Navigation & Routing
- `useNavigateWithOrigin` — wraps `navigate()`, automatically attaches `state.from = currentPath`
- `useBack(defaultRoute)` — reads `location.state.from`, navigates back to origin preserving full state
- Lazy-loaded routes (`React.lazy` + `Suspense`) with animated spinner fallback

###  Performance
- **Redux `createSelector`** — all filtered/sorted/paginated data computed with memoized selectors, recomputes only on relevant slice changes
- **Manual virtualization** in MappingPage — `position: absolute` rows, only renders visible window + overscan
- **`React.memo`** on `DraggableJDRow` and `DraggableCandRow` — prevents re-renders on unrelated state changes
- **`useCallback`** on all drag handlers and list select/bookmark callbacks
- **`useMemo`** on filtered list computations
- **`React.lazy`** — all pages code-split, loaded on demand
- **`useDebounce`** (220ms) on Mapping search inputs to avoid per-keystroke selector recalculations


## Key Design Decisions

**No MUI in page components.** All layout and styling is pure CSS via `var(--...)` tokens defined in `global.css`. This keeps bundle size small, makes dark/light trivial (one `data-theme` attribute flip), and ensures pixel-perfect consistency across all pages.

**Redux for everything persistent.** Filters, sort state, pagination page, candidate status, notes, bookmarks, and custom drag order all live in Redux slices. This means no prop drilling and state survives page navigation.

**Inline SVG icons.** No icon library dependency. Each icon is a `<path d="...">` string — tree-shaken by default, zero runtime cost.

**Tab persistence via Router state.** The Mapping page tab index travels with navigation state rather than Redux or URL params, keeping the solution lightweight while correctly restoring position on back navigation.
