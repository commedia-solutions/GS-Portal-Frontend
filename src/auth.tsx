// src/auth.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "./api/http";

/* ========= Roles & Permissions ========= */

export type Role = "admin" | "user" | "guest";

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
  user: [
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
  const raw = String(me?.roleName ?? me?.rolename ?? me?.role ?? "")
    .trim()
    .toLowerCase();
  if (raw.startsWith("admin")) return "admin";
  if (raw.startsWith("user")) return "user";
  if (raw.startsWith("guest")) return "guest";
  return "guest";
}

/* ========= Auth Context ========= */

export type AuthUser = {
  id: number;
  username: string;
  roleId: number | null;
  role: Role;
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
      };
    } catch {
      return null;
    }
  })();

  const [user, setUser] = useState<AuthUser | null>(seededUser);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await api.get<any>("/api/auth/me");
        if (!mounted) return;
        setUser({
          id: Number(me?.id),
          username: String(me?.username || ""),
          roleId: me?.roleId ?? null,
          role: resolveRoleFromMe(me),
        });
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthState>(() => {
    const role: Role = user?.role ?? "guest";
    const granted = new Set(ROLE_PERMISSIONS[role] ?? []);
    return {
      user,
      loading,
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
  <div style={{ padding: 16 }}>
    <h3 style={{ margin: "8px 0" }}>Not authorized</h3>
    <p style={{ margin: 0, opacity: 0.8 }}>
      You don’t have permission to view this page.
    </p>
    <a href="/dashboard" style={{ display: "inline-block", marginTop: 12 }}>
      Go to dashboard
    </a>
  </div>
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
