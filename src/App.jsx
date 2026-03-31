import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Sidebar from "./components/Sidebar";
import "./styles/global.css";
const Dashboard       = lazy(() => import("./pages/Dashboard"));
const JDList          = lazy(() => import("./pages/JDList"));
const JDDetail        = lazy(() => import("./pages/JDDetail"));
const CandidateList   = lazy(() => import("./pages/CandidateList"));
const CandidateDetail = lazy(() => import("./pages/CandidateDetail"));
const MappingPage     = lazy(() => import("./pages/MappingPage"));

const Loader = () => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    height: "100%", color: "var(--text-muted)",
  }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
      </path>
    </svg>
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div style={{
          display: "flex",
          height: "100vh",
          background: "var(--bg-page)",
          overflow: "hidden",
          transition: "background 0.2s",
        }}>
          <Sidebar />
          <main style={{
            flex: 1,
            overflowY: "auto",
            padding: "28px 32px",
            background: "var(--bg-page)",
          }}>
            <Suspense fallback={<Loader />}>
              <Routes>
                <Route path="/"               element={<Dashboard />} />
                <Route path="/jds"            element={<JDList />} />
                <Route path="/jds/:id"        element={<JDDetail />} />
                <Route path="/candidates"     element={<CandidateList />} />
                <Route path="/candidates/:id" element={<CandidateDetail />} />
                <Route path="/mapping"        element={<MappingPage />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}