import { createSlice, createSelector } from "@reduxjs/toolkit";
import { JOB_DESCRIPTIONS } from "../../data/mockData";

const PAGE_SIZE = 15;

const initialState = {
  all: JOB_DESCRIPTIONS,
  currentPage: 1,
  pageSize: PAGE_SIZE,
  filters: {
    search: "", status: "", department: "",
    priority: "", type: "", location: "",
    skill: "", experienceMin: "", experienceMax: "",
  },
  sortBy: "postedDate",
  sortOrder: "desc",
};

const jdSlice = createSlice({
  name: "jds",
  initialState,
  reducers: {
    setSearch:    (state, { payload }) => { state.filters.search = payload; state.currentPage = 1; },
    setFilter:    (state, { payload: { key, value } }) => { state.filters[key] = value; state.currentPage = 1; },
    clearFilters: (state) => { state.filters = initialState.filters; state.currentPage = 1; },
    setPage:      (state, { payload }) => { state.currentPage = payload; },
    setSort:      (state, { payload: { sortBy, sortOrder } }) => { state.sortBy = sortBy; state.sortOrder = sortOrder; state.currentPage = 1; },
    updateJDStatus: (state, { payload: { id, status } }) => {
      const jd = state.all.find((j) => j.id === id);
      if (jd) jd.status = status;
    },
  },
});

export const { setSearch, setFilter, clearFilters, setPage, setSort, updateJDStatus } = jdSlice.actions;

const sel = {
  all:       (s) => s.jds.all,
  filters:   (s) => s.jds.filters,
  sortBy:    (s) => s.jds.sortBy,
  sortOrder: (s) => s.jds.sortOrder,
  page:      (s) => s.jds.currentPage,
  pageSize:  (s) => s.jds.pageSize,
};

export const selectFilteredJDs = createSelector(
  [sel.all, sel.filters, sel.sortBy, sel.sortOrder],
  (all, filters, sortBy, sortOrder) => {
    let result = all;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter((j) =>
        j.title.toLowerCase().includes(q) ||
        j.department.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (filters.status)     result = result.filter((j) => j.status     === filters.status);
    if (filters.department) result = result.filter((j) => j.department === filters.department);
    if (filters.priority)   result = result.filter((j) => j.priority   === filters.priority);
    if (filters.type)       result = result.filter((j) => j.type       === filters.type);
    if (filters.location)   result = result.filter((j) => j.location   === filters.location);
    if (filters.skill)      result = result.filter((j) => j.skills.some((s) => s.toLowerCase().includes(filters.skill.toLowerCase())));
    if (filters.experienceMin !== "") result = result.filter((j) => j.experienceMax >= Number(filters.experienceMin));
    if (filters.experienceMax !== "") result = result.filter((j) => j.experienceMin <= Number(filters.experienceMax));

    return [...result].sort((a, b) => {
      let av = a[sortBy] ?? "", bv = b[sortBy] ?? "";
      if (typeof av === "string") { av = av.toLowerCase(); bv = bv.toLowerCase(); }
      return sortOrder === "asc" ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
  }
);

export const selectPaginatedJDs = createSelector(
  [selectFilteredJDs, sel.page, sel.pageSize],
  (f, page, size) => f.slice((page - 1) * size, page * size)
);

export const selectJDTotalPages    = createSelector([selectFilteredJDs, sel.pageSize], (f, s) => Math.max(1, Math.ceil(f.length / s)));
export const selectJDTotalFiltered = createSelector([selectFilteredJDs], (f) => f.length);
export const selectJDById          = (id) => createSelector([sel.all], (all) => all.find((j) => j.id === id));
export const selectJDStats         = createSelector([sel.all], (all) => ({
  total: all.length,
  active: all.filter((j) => j.status === "Active").length,
  paused: all.filter((j) => j.status === "Paused").length,
  closed: all.filter((j) => j.status === "Closed").length,
  totalOpenings: all.reduce((s, j) => s + j.openings, 0),
  totalHired:    all.reduce((s, j) => s + j.hired, 0),
}));
export const selectAllJDSkills = createSelector([sel.all], (all) =>
  [...new Set(all.flatMap((j) => j.skills))].sort()
);

export default jdSlice.reducer;