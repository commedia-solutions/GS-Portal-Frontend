import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAuthToken } from "../api/http";

function hasPageAccess(pathname: string): boolean {
  const role = sessionStorage.getItem("pmgt_role");
  const roleType = sessionStorage.getItem("pmgt_role_type");

  if (String(role).toLowerCase() === "admin") return true;
  try {
    const raw = sessionStorage.getItem("pmgt_page_access");
    if (!raw) return false;

    const parsed = JSON.parse(raw);

    let pages: string[] = [];

    if (Array.isArray(parsed?.pages)) {
      pages = parsed.pages.map((p: any) => p.page_key || p).filter(Boolean);
    } else {
      pages = [...(parsed?.viewerPages || []), ...(parsed?.editorPages || [])];
    }
    if (pathname.startsWith("/dashboard")) return pages.includes("dashboard");

    if (pathname.startsWith("/satellites")) return pages.includes("satellites");
    if (pathname.startsWith("/add/satellite")) return pages.includes("add_satellite");

    if (pathname.startsWith("/licenses")) return pages.includes("licenses");
    if (pathname.startsWith("/add/license")) return pages.includes("add_license");

    if (pathname.startsWith("/passes")) return pages.includes("passes");
    if (pathname.startsWith("/add/pass")) return pages.includes("add_pass");

    if (pathname.startsWith("/documents")) return pages.includes("documents");

    if (pathname.startsWith("/gsoperations")) return pages.includes("gs_operations");

    if (pathname.startsWith("/iam")) return pages.includes("iam");



    if (pathname.startsWith("/logs")) return pages.includes("logs");
    if (pathname.startsWith("/requests")) return pages.includes("requests");
    if (pathname.startsWith("/issues")) return pages.includes("issues");
    if (pathname.startsWith("/visibility-schedule")) return pages.includes("visibility_schedule");

    if (pathname.startsWith("/userprofile")) return true;


    return false;
  } catch {
    return false;
  }
}

export default function ProtectedRoute() {
  const hasToken =
    !!getAuthToken() ||
    !!sessionStorage.getItem("token") ||
    !!sessionStorage.getItem("pmgt_token") ||
    !!localStorage.getItem("token");

  const location = useLocation();
  const [accessReady, setAccessReady] = React.useState(false);

  React.useEffect(() => {
    const checkAccess = () => {
      try {
        const role = sessionStorage.getItem("pmgt_role");
        if (String(role).toLowerCase() === "admin") {
          setAccessReady(true);
          return;
        }

        const raw = sessionStorage.getItem("pmgt_page_access");
        if (!raw) return;

        setAccessReady(true);
      } catch { }
    };

    checkAccess();
    window.addEventListener("pmgt:page-access-updated", checkAccess);

    return () => {
      window.removeEventListener("pmgt:page-access-updated", checkAccess);
    };
  }, []);

  if (!hasToken) return <Navigate to="/login" replace />;

  if (!accessReady) {
    return (
      <div style={{ color: "white", padding: 30, fontSize: 18 }}>
        Loading Access...
      </div>
    );
  }

  if (!hasPageAccess(location.pathname)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
