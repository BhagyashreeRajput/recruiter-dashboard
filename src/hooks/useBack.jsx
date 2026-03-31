
import { useNavigate, useLocation } from "react-router-dom";
import { useCallback } from "react";

const ROUTE_LABELS = {
  "/":            "Dashboard",
  "/jds":         "Job Descriptions",
  "/candidates":  "Candidates",
  "/mapping":     "Mapping",
};

export function useBack(defaultRoute = "/candidates") {
  const navigate = useNavigate();
  const location = useLocation();

  // Where did we come from?
  const fromPath  = location.state?.from || defaultRoute;
  const fromLabel = ROUTE_LABELS[fromPath] || "Back";

const goBack = useCallback(() => {
  navigate(fromPath, { state: location.state });
}, [navigate, fromPath, location.state]);
  return { goBack, fromPath, fromLabel };
}

// ─────────────────────────────────────────────────────────────
//  useNavigateWithOrigin
//  Wrap around navigate() — automatically attaches `from` state

export function useNavigateWithOrigin() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (to, options = {}) => {
      navigate(to, {
        ...options,
        state: {
          from: location.pathname,
          ...(options.state || {}),
        },
      });
    },
    [navigate, location.pathname]
  );
}