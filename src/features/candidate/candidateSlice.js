import { createSlice, createSelector } from "@reduxjs/toolkit";
import { CANDIDATES, STATUS } from "../../data/mockData";

const PAGE_SIZE = 20;

const initialState = {
  all: CANDIDATES,
  currentPage: 1,
  pageSize: PAGE_SIZE,
  filters: {
    search: "", status: "", department: "",
    source: "", experienceLevel: "", location: "",
    skill: "", matchScoreMin: "",
  },
  sortBy: "appliedDate",
  sortOrder: "desc",
  selectedId: null,
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setSearch:    (state, { payload }) => { state.filters.search = payload; state.currentPage = 1; },
    setFilter:    (state, { payload: { key, value } }) => { state.filters[key] = value; state.currentPage = 1; },
    clearFilters: (state) => { state.filters = initialState.filters; state.currentPage = 1; },
    setPage:      (state, { payload }) => { state.currentPage = payload; },
    setSort:      (state, { payload: { sortBy, sortOrder } }) => { state.sortBy = sortBy; state.sortOrder = sortOrder; state.currentPage = 1; },
    setSelectedId: (state, { payload }) => { state.selectedId = payload; },
    updateCandidateStatus: (state, { payload: { id, status } }) => {
      const c = state.all.find((c) => c.id === id);
      if (c) c.status = status;
    },
    addNote: (state, { payload: { id, note } }) => {
      const c = state.all.find((c) => c.id === id);
      if (c) c.notes = note;
    },
    // batch update for performance
    batchUpdateStatus: (state, { payload: { ids, status } }) => {
      ids.forEach((id) => {
        const c = state.all.find((c) => c.id === id);
        if (c) c.status = status;
      });
    },
  },
});

export const {
  setSearch, setFilter, clearFilters, setPage, setSort,
  setSelectedId, updateCandidateStatus, addNote, batchUpdateStatus,
} = candidateSlice.actions;

// ── SELECTORS ────────────────────────────────────────────────
const sel = {
  all:       (s) => s.candidates.all,
  filters:   (s) => s.candidates.filters,
  sortBy:    (s) => s.candidates.sortBy,
  sortOrder: (s) => s.candidates.sortOrder,
  page:      (s) => s.candidates.currentPage,
  pageSize:  (s) => s.candidates.pageSize,
};

export const selectSelectedId = (s) => s.candidates.selectedId;

export const selectFilteredCandidates = createSelector(
  [sel.all, sel.filters, sel.sortBy, sel.sortOrder],
  (all, filters, sortBy, sortOrder) => {
    let result = all;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((c) =>
        c.fullName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.currentCompany.toLowerCase().includes(q) ||
        c.appliedForTitle.toLowerCase().includes(q) ||
        c.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filters.status)          result = result.filter((c) => c.status          === filters.status);
    if (filters.department)      result = result.filter((c) => c.department      === filters.department);
    if (filters.source)          result = result.filter((c) => c.source          === filters.source);
    if (filters.experienceLevel) result = result.filter((c) => c.experienceLevel === filters.experienceLevel);
    if (filters.location)        result = result.filter((c) => c.location        === filters.location);
    if (filters.skill)           result = result.filter((c) => c.skills.some((s) => s.toLowerCase().includes(filters.skill.toLowerCase())));
    if (filters.matchScoreMin)   result = result.filter((c) => c.matchScore >= Number(filters.matchScoreMin));

    return [...result].sort((a, b) => {
      let av = a[sortBy] ?? "", bv = b[sortBy] ?? "";
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortOrder === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }
);

export const selectPaginatedCandidates = createSelector(
  [selectFilteredCandidates, sel.page, sel.pageSize],
  (f, page, size) => f.slice((page - 1) * size, page * size)
);

export const selectTotalPages = createSelector(
  [selectFilteredCandidates, sel.pageSize],
  (f, size) => Math.max(1, Math.ceil(f.length / size))
);

export const selectTotalFiltered = createSelector(
  [selectFilteredCandidates], (f) => f.length
);

export const selectCandidateById = (id) =>
  createSelector([sel.all], (all) => all.find((c) => c.id === id));

export const selectStatusCounts = createSelector([sel.all], (all) =>
  Object.values(STATUS).reduce((acc, s) => {
    acc[s] = all.filter((c) => c.status === s).length;
    return acc;
  }, {})
);

// For virtualized list — returns ALL filtered (no pagination)
export const selectAllFilteredForVirtual = createSelector(
  [selectFilteredCandidates], (f) => f
);

export default candidateSlice.reducer;