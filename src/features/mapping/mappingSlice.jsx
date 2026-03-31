// features/mapping/mappingSlice.js
import { createSlice, createSelector } from "@reduxjs/toolkit";
import { CANDIDATES, JOB_DESCRIPTIONS } from "../../data/mockData";

// ── Pre-build lookup maps (O(1) access) ───────────────────────
const buildJdToCandidates = () => {
  const map = {};
  CANDIDATES.forEach((c) => {
    if (!map[c.appliedFor]) map[c.appliedFor] = [];
    map[c.appliedFor].push(c.id);
  });
  return map;
};

const buildCandidateToJD = () => {
  const map = {};
  CANDIDATES.forEach((c) => { map[c.id] = c.appliedFor; });
  return map;
};

// ── Load bookmarks from localStorage (persist across sessions) ─
const loadBookmarks = (key) => {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
};

const saveBookmarks = (key, ids) => {
  try { localStorage.setItem(key, JSON.stringify(ids)); } catch {}
};

const initialState = {
  jdToCandidates: buildJdToCandidates(),
  candidateToJD:  buildCandidateToJD(),

  // ── JD → Candidates ──────────────────────────
  selectedJDId:   null,
  jdCandFilter:   { search: "", status: "", experienceLevel: "", matchScoreMin: "" },
  jdCandSort:     { sortBy: "matchScore", sortOrder: "desc" },
  jdCandPage:     1,
  jdCandPageSize: 15,

  // ── Candidate → JDs ──────────────────────────
  selectedCandId:  null,
  candJDFilter:    { search: "", status: "" },
  candJDPage:      1,
  candJDPageSize:  10,

  // ── Bookmarks ────────────────────────────────
  bookmarkedJDs:        loadBookmarks("bm_jds"),        // [jdId, ...]
  bookmarkedCandidates: loadBookmarks("bm_candidates"),  // [candId, ...]

  // ── Drag-drop custom order ────────────────────
  // stores user-reordered IDs — null means use default order
  jdCustomOrder:   null,   // [jdId, ...] after drag
  candCustomOrder: null,   // [candId, ...] after drag

  // ── UI state ─────────────────────────────────
  showBookmarkedJDsOnly:    false,
  showBookmarkedCandsOnly:  false,
  dragActive: false,
};

const mappingSlice = createSlice({
  name: "mapping",
  initialState,
  reducers: {
    // ── Selection ─────────────────────────────
    selectJD: (state, { payload }) => {
      state.selectedJDId  = payload;
      state.jdCandPage    = 1;
      state.jdCandFilter  = initialState.jdCandFilter;
    },
    selectCandidate: (state, { payload }) => {
      state.selectedCandId = payload;
      state.candJDPage     = 1;
      state.candJDFilter   = initialState.candJDFilter;
    },

    // ── Filters ───────────────────────────────
    setJDCandFilter:  (state, { payload: { key, value } }) => { state.jdCandFilter[key] = value; state.jdCandPage = 1; },
    clearJDCandFilter:(state) => { state.jdCandFilter = initialState.jdCandFilter; state.jdCandPage = 1; },
    setJDCandSort:    (state, { payload }) => { state.jdCandSort = payload; state.jdCandPage = 1; },
    setJDCandPage:    (state, { payload }) => { state.jdCandPage = payload; },
    setCandJDFilter:  (state, { payload: { key, value } }) => { state.candJDFilter[key] = value; state.candJDPage = 1; },
    setCandJDPage:    (state, { payload }) => { state.candJDPage = payload; },

    // ── Bookmarks: JD ─────────────────────────
    toggleJDBookmark: (state, { payload: jdId }) => {
      const idx = state.bookmarkedJDs.indexOf(jdId);
      if (idx === -1) state.bookmarkedJDs.push(jdId);
      else            state.bookmarkedJDs.splice(idx, 1);
      saveBookmarks("bm_jds", state.bookmarkedJDs);
    },
    clearJDBookmarks: (state) => {
      state.bookmarkedJDs = [];
      saveBookmarks("bm_jds", []);
    },
    setShowBookmarkedJDsOnly: (state, { payload }) => {
      state.showBookmarkedJDsOnly = payload;
    },

    // ── Bookmarks: Candidate ──────────────────
    toggleCandBookmark: (state, { payload: candId }) => {
      const idx = state.bookmarkedCandidates.indexOf(candId);
      if (idx === -1) state.bookmarkedCandidates.push(candId);
      else            state.bookmarkedCandidates.splice(idx, 1);
      saveBookmarks("bm_candidates", state.bookmarkedCandidates);
    },
    clearCandBookmarks: (state) => {
      state.bookmarkedCandidates = [];
      saveBookmarks("bm_candidates", []);
    },
    setShowBookmarkedCandsOnly: (state, { payload }) => {
      state.showBookmarkedCandsOnly = payload;
    },

    // ── Drag-drop: reorder JD list ────────────
    // payload: { dragIndex, hoverIndex }
    reorderJDs: (state, { payload: { dragIndex, hoverIndex, orderedIds } }) => {
      state.jdCustomOrder = orderedIds;
    },

    // payload: { orderedIds }
    reorderCandidates: (state, { payload: { orderedIds } }) => {
      state.candCustomOrder = orderedIds;
    },

    resetJDOrder:   (state) => { state.jdCustomOrder   = null; },
    resetCandOrder: (state) => { state.candCustomOrder = null; },

    setDragActive: (state, { payload }) => { state.dragActive = payload; },
  },
});

export const {
  selectJD, selectCandidate,
  setJDCandFilter, clearJDCandFilter, setJDCandSort, setJDCandPage,
  setCandJDFilter, setCandJDPage,
  toggleJDBookmark, clearJDBookmarks, setShowBookmarkedJDsOnly,
  toggleCandBookmark, clearCandBookmarks, setShowBookmarkedCandsOnly,
  reorderJDs, reorderCandidates, resetJDOrder, resetCandOrder,
  setDragActive,
} = mappingSlice.actions;

// ── LOOKUP MAPS ───────────────────────────────────────────────
export const candById = Object.fromEntries(CANDIDATES.map((c) => [c.id, c]));
export const jdById   = Object.fromEntries(JOB_DESCRIPTIONS.map((j) => [j.id, j]));

// ── BASE SELECTORS ────────────────────────────────────────────
const s = {
  selectedJDId:           (st) => st.mapping.selectedJDId,
  selectedCandId:         (st) => st.mapping.selectedCandId,
  jdToCandidates:         (st) => st.mapping.jdToCandidates,
  jdCandFilter:           (st) => st.mapping.jdCandFilter,
  jdCandSort:             (st) => st.mapping.jdCandSort,
  jdCandPage:             (st) => st.mapping.jdCandPage,
  jdCandPageSize:         (st) => st.mapping.jdCandPageSize,
  candJDFilter:           (st) => st.mapping.candJDFilter,
  candJDPage:             (st) => st.mapping.candJDPage,
  candJDPageSize:         (st) => st.mapping.candJDPageSize,
  bookmarkedJDs:          (st) => st.mapping.bookmarkedJDs,
  bookmarkedCandidates:   (st) => st.mapping.bookmarkedCandidates,
  showBookmarkedJDsOnly:  (st) => st.mapping.showBookmarkedJDsOnly,
  showBookmarkedCandsOnly:(st) => st.mapping.showBookmarkedCandsOnly,
  jdCustomOrder:          (st) => st.mapping.jdCustomOrder,
  candCustomOrder:        (st) => st.mapping.candCustomOrder,
};

export const selectSelectedJDId          = s.selectedJDId;
export const selectSelectedCandId        = s.selectedCandId;
export const selectBookmarkedJDs         = s.bookmarkedJDs;
export const selectBookmarkedCandidates  = s.bookmarkedCandidates;
export const selectShowBookmarkedJDsOnly = s.showBookmarkedJDsOnly;
export const selectShowBookmarkedCandsOnly = s.showBookmarkedCandsOnly;
export const selectJDCustomOrder         = s.jdCustomOrder;
export const selectCandCustomOrder       = s.candCustomOrder;

export const selectSelectedJD = createSelector(
  [s.selectedJDId], (id) => (id ? jdById[id] : null)
);
export const selectSelectedCandidate = createSelector(
  [s.selectedCandId], (id) => (id ? candById[id] : null)
);

// ── JD LIST with custom order + bookmark filter ───────────────
export const selectOrderedJDs = createSelector(
  [(st) => st.jds.all, s.jdCustomOrder, s.bookmarkedJDs, s.showBookmarkedJDsOnly],
  (allJDs, customOrder, bookmarked, onlyBookmarked) => {
    let list = allJDs;
    if (onlyBookmarked) list = list.filter((j) => bookmarked.includes(j.id));

    if (customOrder) {
      const orderMap = Object.fromEntries(customOrder.map((id, i) => [id, i]));
      list = [...list].sort((a, b) => {
        const ai = orderMap[a.id] ?? 9999;
        const bi = orderMap[b.id] ?? 9999;
        return ai - bi;
      });
    }
    return list;
  }
);

// ── CANDIDATE LIST with custom order + bookmark filter ────────
export const selectOrderedCandidates = createSelector(
  [(st) => st.candidates.all, s.candCustomOrder, s.bookmarkedCandidates, s.showBookmarkedCandsOnly],
  (allCands, customOrder, bookmarked, onlyBookmarked) => {
    let list = allCands;
    if (onlyBookmarked) list = list.filter((c) => bookmarked.includes(c.id));

    if (customOrder) {
      const orderMap = Object.fromEntries(customOrder.map((id, i) => [id, i]));
      list = [...list].sort((a, b) => {
        const ai = orderMap[a.id] ?? 9999;
        const bi = orderMap[b.id] ?? 9999;
        return ai - bi;
      });
    }
    return list;
  }
);

// ── JD → filtered candidates ─────────────────────────────────
export const selectJDCandidates = createSelector(
  [s.selectedJDId, s.jdToCandidates, s.jdCandFilter, s.jdCandSort],
  (jdId, map, filter, sort) => {
    if (!jdId) return [];
    let result = (map[jdId] || []).map((id) => candById[id]).filter(Boolean);

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.skills.some((sk) => sk.toLowerCase().includes(q))
      );
    }
    if (filter.status)          result = result.filter((c) => c.status          === filter.status);
    if (filter.experienceLevel) result = result.filter((c) => c.experienceLevel === filter.experienceLevel);
    if (filter.matchScoreMin)   result = result.filter((c) => c.matchScore      >= Number(filter.matchScoreMin));

    const { sortBy, sortOrder } = sort;
    return [...result].sort((a, b) => {
      let av = a[sortBy] ?? "", bv = b[sortBy] ?? "";
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortOrder === "desc" ? (av < bv ? 1 : -1) : (av > bv ? 1 : -1);
    });
  }
);

export const selectJDCandidatesPaginated = createSelector(
  [selectJDCandidates, s.jdCandPage, s.jdCandPageSize],
  (all, page, size) => all.slice((page - 1) * size, page * size)
);
export const selectJDCandidatesTotalPages = createSelector(
  [selectJDCandidates, s.jdCandPageSize],
  (all, size) => Math.max(1, Math.ceil(all.length / size))
);

// ── Candidate → matching JDs ──────────────────────────────────
export const selectCandidateMatchingJDs = createSelector(
  [s.selectedCandId, s.candJDFilter],
  (candId, filter) => {
    if (!candId) return [];
    const cand = candById[candId];
    if (!cand) return [];
    const candSkillSet = new Set(cand.skills.map((sk) => sk.toLowerCase()));

    let result = JOB_DESCRIPTIONS.map((jd) => {
      const skillOverlap = jd.skills.filter((sk) => candSkillSet.has(sk.toLowerCase())).length;
      const deptMatch    = jd.department === cand.department;
      const score        = Math.min(skillOverlap * 15 + (deptMatch ? 20 : 0), 99);
      return { ...jd, skillOverlap, deptMatch, compatibilityScore: score };
    })
    .filter((jd) => jd.skillOverlap >= 1 || jd.deptMatch)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    if (filter.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((j) => j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q));
    }
    if (filter.status) result = result.filter((j) => j.status === filter.status);
    return result;
  }
);

export const selectCandMatchingJDsPaginated = createSelector(
  [selectCandidateMatchingJDs, s.candJDPage, s.candJDPageSize],
  (all, page, size) => all.slice((page - 1) * size, page * size)
);
export const selectCandMatchingJDsTotalPages = createSelector(
  [selectCandidateMatchingJDs, s.candJDPageSize],
  (all, size) => Math.max(1, Math.ceil(all.length / size))
);

export const selectMappingStats = createSelector(
  [s.jdToCandidates, s.bookmarkedJDs, s.bookmarkedCandidates],
  (map, bmJDs, bmCands) => ({
    totalJDs:         JOB_DESCRIPTIONS.length,
    withCands:        Object.values(map).filter((ids) => ids.length > 0).length,
    avgPerJD:         (CANDIDATES.length / JOB_DESCRIPTIONS.length).toFixed(1),
    totalCandidates:  CANDIDATES.length,
    bookmarkedJDs:    bmJDs.length,
    bookmarkedCands:  bmCands.length,
  })
);

export default mappingSlice.reducer;
