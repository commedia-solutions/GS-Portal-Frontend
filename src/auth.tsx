// src/auth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "./api/http";
import { Box, Typography, Button } from "@mui/material";
import { vars } from "./ui/toast/themeBridge";

/* ========= Roles & Permissions ========= */

export type Role = "admin" | "editor" | "guest";


/** Vite/esbuild-safe constant (instead of TS enum) */
export const PERMISSION = {
  ViewDashboard: "view:dashboard",
  ViewDocuments: "view:documents",
  ViewGSOps: "gs_ops:view",
  ManageUsers: "users:manage",
  AddPass: "pass:add",
  AddLicense: "license:add",
  AddSatellite: "satellite:add",
} as const;

export type Permission = typeof PERMISSION[keyof typeof PERMISSION];

/** Role → permissions (adjust as needed) */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    PERMISSION.ViewDashboard,
    PERMISSION.ViewDocuments,
    PERMISSION.ViewGSOps,
    PERMISSION.ManageUsers,
    PERMISSION.AddPass,
    PERMISSION.AddLicense,
    PERMISSION.AddSatellite,
  ],
  editor: [
    PERMISSION.ViewDashboard,
    PERMISSION.ViewDocuments,
    PERMISSION.ViewGSOps,
    PERMISSION.AddPass,
    PERMISSION.AddLicense,
    PERMISSION.AddSatellite,
  ],

  guest: [PERMISSION.ViewDashboard, PERMISSION.ViewDocuments],
};

/* ========= Helpers ========= */

/** Resolve a Role from the /auth/me payload. Prefer roleName, fallback to guest. */
export function resolveRoleFromMe(me: any): Role {
  const roleName = String(me?.roleName || me?.role || "").toLowerCase();
  const roleType = String(me?.roleType || "").toLowerCase();

  // 🔐 absolute admin
  if (roleName === "admin") return "admin";

  // ✍️ editor users
  if (roleType === "editor" || roleName === "editor") return "editor";

  // 👁️ default
  return "guest";
}








/* ========= Auth Context ========= */

export type AuthUser = {
  id: number;
  username: string;
  roleId: number | null;
  role: Role;
  roleName: string;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  hasRole: (...roles: Role[]) => boolean;
  can: (...perms: Permission[]) => boolean;
  setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({
  children,
}) => {
  // Seed from session to avoid "show everything, then hide" flicker
  const seededUser: AuthUser | null = (() => {
    try {
      const raw =
        sessionStorage.getItem("profile") || sessionStorage.getItem("user");
      if (!raw) return null;
      const me = JSON.parse(raw);
      return {
        id: Number(me?.id ?? me?.userId ?? 0),
        username: String(me?.username || ""),
        roleId: me?.roleId ?? null,
        role: resolveRoleFromMe(me),
        roleName: String(me?.roleName || me?.role || "User"),
      };
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState<AuthUser | null>(seededUser);
  const [loading, setLoading] = useState<boolean>(true);
  const [accessReady, setAccessReady] = useState<boolean>(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token") ||
          localStorage.getItem("token") ||
          sessionStorage.getItem("token");

        if (!token) {
          setUser(null);
          setLoading(false);
          setAccessReady(true);
          return;
        }

        const me = await api.get<any>("/api/auth/me");
        if (!mounted) return;

        const resolvedRole = resolveRoleFromMe(me);

        setUser({
          id: Number(me?.id),
          username: String(me?.username || ""),
          roleId: me?.roleId ?? null,
          role: resolvedRole,
          roleName: String(me?.roleName || me?.role || "User"),
        });

        sessionStorage.setItem("pmgt_uid", String(me?.id));
        sessionStorage.setItem("pmgt_username", String(me?.username || ""));
        sessionStorage.setItem("profile", JSON.stringify(me));

        /* ✅ IMPORTANT: store role + roleType for access hooks */
        sessionStorage.setItem(
          "pmgt_role",
          String(me?.roleName || resolvedRole).toLowerCase()
        );
        // ✅ Decide role_type based on pages access (editorPages means editor)
        const pages = Array.isArray(me?.pages) ? me.pages : [];

        const hasEditorAccess = pages.some(
          (p: any) => p?.access_level === "editor"
        );

        sessionStorage.setItem(
          "pmgt_role_type",
          hasEditorAccess ? "editor" : "viewer"
        );


        /* ✅ Load DB-saved Access Pages for this user */
        try {
          const pages = Array.isArray(me?.pages) ? me.pages : [];

          // if backend sends just ["dashboard","licenses"] (old format)
          if (typeof pages[0] === "string") {
            sessionStorage.setItem(
              "pmgt_page_access",
              JSON.stringify({ viewerPages: pages, editorPages: [] })
            );
          } else {
            const viewerPages = pages
              .filter((p: any) => p?.access_level === "viewer")
              .map((p: any) => p?.page_key);

            const editorPages = pages
              .filter((p: any) => p?.access_level === "editor")
              .map((p: any) => p?.page_key);

            sessionStorage.setItem(
              "pmgt_page_access",
              JSON.stringify({ viewerPages, editorPages })
            );
          }
        } catch {
          sessionStorage.setItem(
            "pmgt_page_access",
            JSON.stringify({ viewerPages: [], editorPages: [] })
          );
        }



        /* ✅ Force refresh UI */
        window.dispatchEvent(new Event("pmgt:page-access-updated"));



      } catch {
        // keep seeded user; avoid nuking session on partial failures
        if (mounted) setUser((u) => u);
      } finally {
        if (mounted) {
          setAccessReady(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Extend session timeout on user activity (mouse movement, clicks, key presses, scroll, touch)
  useEffect(() => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) return;

    let lastUpdated = Date.now();

    const resetTimer = () => {
      const now = Date.now();
      // Throttle updates to localStorage to every 10 seconds to avoid performance degradation
      if (now - lastUpdated > 10000) {
        localStorage.setItem("pmgt_session_expires_at", String(now + 30 * 60 * 1000));
        lastUpdated = now;
      }
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    // Also initialize or extend it immediately
    localStorage.setItem("pmgt_session_expires_at", String(Date.now() + 30 * 60 * 1000));

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  // Periodic absolute session timeout check
  useEffect(() => {
    const checkSessionTimeout = () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) return;

      let expiresAtStr = localStorage.getItem("pmgt_session_expires_at");
      if (!expiresAtStr) {
        // Fallback: If logged in but no expiry is recorded, set it now
        const fallbackExpiry = Date.now() + 30 * 60 * 1000;
        localStorage.setItem("pmgt_session_expires_at", String(fallbackExpiry));
        expiresAtStr = String(fallbackExpiry);
      }

      const expiresAt = Number(expiresAtStr);
      if (Date.now() > expiresAt) {
        console.warn("Session expired. Logging out automatically.");
        
        // Attempt backend logout log
        fetch("/api/auth/logout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {});

        // Clear session info
        sessionStorage.clear();
        localStorage.removeItem("auth_token");
        localStorage.removeItem("token");
        localStorage.removeItem("pmgt_session_expires_at");

        setUser(null);
        window.location.href = "/";
      }
    };

    checkSessionTimeout();
    const interval = setInterval(checkSessionTimeout, 5000);

    return () => clearInterval(interval);
  }, [setUser]);


  const value = useMemo<AuthState>(() => {
    const role: Role = user?.role ?? "guest";
    const granted = new Set(ROLE_PERMISSIONS[role] ?? []);
    return {
      user,
      loading: loading || !accessReady,
      setUser,
      hasRole: (...roles) => roles.includes(role),
      can: (...perms) => perms.every((p) => granted.has(p)),
    };
  }, [user, loading]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
};

/* ========= Guards ========= */

export const NotAuthorized: React.FC = () => (
  <Box sx={{
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    height: "100vh", bgcolor: vars.bgApp, color: vars.text, textAlign: "center"
  }}>
    <Typography variant="h3" sx={{ fontWeight: 800, mb: 2, color: "#ef4a4a" }}>
      Access Denied
    </Typography>
    <Typography variant="h6" sx={{ color: vars.textDim, mb: 4 }}>
      You don't have permission to view this page.
    </Typography>
    <Button
      variant="contained"
      onClick={() => window.history.back()}
      sx={{
        textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" }
      }}
    >
      Go Back
    </Button>
  </Box>
);

export const RequirePermission: React.FC<
  React.PropsWithChildren<{
    allOf?: Permission[];
    anyOf?: Permission[];
    fallback?: React.ReactNode;
  }>
> = ({ allOf, anyOf, fallback = <NotAuthorized />, children }) => {
  const { can, loading } = useAuth();
  if (loading) return null; // or a spinner if you prefer
  const okAll = allOf ? allOf.every((p) => can(p)) : true;
  const okAny = anyOf ? anyOf.some((p) => can(p)) : true;
  return okAll && okAny ? <>{children}</> : <>{fallback}</>;
};

/** Optional inline guard for components (handy for sections/buttons) */
export const IfCan: React.FC<
  React.PropsWithChildren<{ allOf?: Permission[]; anyOf?: Permission[] }>
> = ({ allOf, anyOf, children }) => {
  const { can, loading } = useAuth();
  if (loading) return null;
  const okAll = allOf ? allOf.every((p) => can(p)) : true;
  const okAny = anyOf ? anyOf.some((p) => can(p)) : true;
  return okAll && okAny ? <>{children}</> : null;
};
