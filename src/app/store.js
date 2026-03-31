// app/store.js
import { configureStore } from "@reduxjs/toolkit";
import candidateReducer from "../features/candidate/candidateSlice";
import jdReducer from "../features/jd/jdSlice";
import mappingReducer   from "../features/mapping/mappingSlice";

export const store = configureStore({
  reducer: {
    candidates: candidateReducer,
    jds: jdReducer,
        mapping:    mappingReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for large mock data arrays
      immutableCheck: false,
    }),
});

export default store;