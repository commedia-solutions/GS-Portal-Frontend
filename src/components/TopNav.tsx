// src/components/TopNav.tsx
import React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Switch,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import TranslateIcon from "@mui/icons-material/Translate";
import CheckIcon from "@mui/icons-material/Check";
import { useAuth } from "../auth";
import { usePageAccess } from "../auth/usePageAccess";
import { useActionAccess } from "../auth/useActionAccess";

import { vars, useThemePref } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";

export const TOPBAR_HEIGHT = 56;

/* ─────────────────────── style constants ─────────────────────── */
const BG      = vars.bgApp;
const BORDER  = vars.border;
const DIM     = vars.textDim;
const ACCENT  = vars.accent;

type TopNavProps = { leftOffset: number; title?: string };

/* ---------- tiny API helpers ---------- */
const RAW_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  window.location.origin;
const BASE = String(RAW_BASE).replace(/\/+$/, "");
const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
const ASSET_BASE = API_BASE.replace(/\/api$/, "");

function getToken() {
  return (
    sessionStorage.getItem("pmgt_token") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("auth_token") ||
    ""
  );
}

async function fetchMe() {
  const token = getToken();
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error((data as any)?.error || "Failed");
    const user = (data && typeof data === "object" && "user" in data
      ? (data as any).user
      : data) as any;
    sessionStorage.setItem("pmgt_full_name", user?.full_name ?? "");
    sessionStorage.setItem("pmgt_username", user?.username ?? "");
    sessionStorage.setItem("pmgt_email", user?.email ?? "");
    if (user?.profile_photo_path)
      sessionStorage.setItem("pmgt_avatar_path", user.profile_photo_path);
    return user;
  } catch {
    return null;
  }
}

function buildAvatarUrl(opts: {
  rel?: string | null;
  abs?: string | null;
  v?: string | null;
}) {
  const { rel, abs, v } = opts;
  let url: string | undefined;
  if (abs) url = abs.startsWith("http") ? abs : `${ASSET_BASE}${abs}`;
  else if (rel)
    url = `${ASSET_BASE}/uploads/${rel.replace(/^\/?uploads\//, "")}`;
  if (!url) return undefined;
  return v ? `${url}${url.includes("?") ? "&" : "?"}v=${v}` : url;
}

function getUid(): string {
  return sessionStorage.getItem("pmgt_uid") || "";
}

function keyFor(base: string, uid = getUid()) {
  return uid ? `${base}:${uid}` : base;
}

function getInitials(full_name?: string, username?: string, email?: string) {
  const src = (full_name || username || email || "User").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : src.slice(0, 2).toUpperCase();
}

/* ---------- UTC/IST dual clock ---------- */
function formatForTZ(d: Date, timeZone: string, withAmPm: boolean) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: withAmPm,
  }).formatToParts(d);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const ampm = withAmPm ? ` ${get("dayPeriod")?.toUpperCase()}` : "";
  return `${get("day")}/${get("month")}/${get("year")} - ${get("hour")}:${get(
    "minute"
  )}:${get("second")}${ampm}`;
}

function DualClockRow() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <Typography variant="caption" sx={{ color: DIM, fontWeight: 700, fontFamily: "monospace", fontSize: 10.5, letterSpacing: "0.05em" }}>
      <span style={{ color: ACCENT }}>UTC</span> : {formatForTZ(now, "UTC", true)} <span style={{ color: DIM, margin: "0 8px", opacity: 0.5 }}>/</span> <span style={{ color: "#38bdf8" }}>IST</span> : {formatForTZ(now, "Asia/Kolkata", true)}
    </Typography>
  );
}

/* ---------- Component ---------- */
export default function TopNav({ leftOffset }: TopNavProps) {
  const navigate = useNavigate();

  const { hasRole } = useAuth();
  const { hasPageAccess, loadingAccess } = usePageAccess();
  const { isEditor } = useActionAccess();

  const [, forceReload] = React.useState(0);

  React.useEffect(() => {
    const fn = () => forceReload((x) => x + 1);
    window.addEventListener("pmgt:page-access-updated", fn);
    return () => window.removeEventListener("pmgt:page-access-updated", fn);
  }, []);

  const { pref, toggle } = useThemePref();
  const { t, lang } = useI18n();

  const initialAvatar = React.useMemo(() => {
    const uid = getUid();
    const abs = sessionStorage.getItem(keyFor("pmgt_avatar_abs", uid));
    const rel = sessionStorage.getItem(keyFor("pmgt_avatar_path", uid));
    const v = sessionStorage.getItem(keyFor("pmgt_avatar_version", uid));
    return buildAvatarUrl({ abs, rel, v });
  }, []);

  const [avatarSrc, setAvatarSrc] = React.useState<string | undefined>(initialAvatar);
  const [imgError, setImgError] = React.useState(false);
  const [fullName, setFullName] = React.useState(sessionStorage.getItem("pmgt_full_name") || "");
  const [username, setUsername] = React.useState(sessionStorage.getItem("pmgt_username") || "");
  const [email, setEmail] = React.useState(sessionStorage.getItem("pmgt_email") || "");

  const loadMe = React.useCallback(async () => {
    const me = await fetchMe();
    if (!me) return;
    setFullName(me.full_name ?? "");
    setUsername(me.username ?? "");
    setEmail(me.email ?? "");

    const uid = String(me.id || me.userId || me.uid || "");
    if (uid) sessionStorage.setItem("pmgt_uid", uid);
    let abs = sessionStorage.getItem(keyFor("pmgt_avatar_abs", uid));
    let rel = sessionStorage.getItem(keyFor("pmgt_avatar_path", uid));
    let v = sessionStorage.getItem(keyFor("pmgt_avatar_version", uid));
    if (!abs && !rel && uid) {
      try {
        const r = await fetch(`${API_BASE}/users/${uid}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        const full = await r.json();
        if (r.ok && full?.avatarUrl) {
          const absUrl = String(full.avatarUrl);
          const relPath = absUrl.replace(/^\/?uploads\//, "");
          v = String(Date.now());
          sessionStorage.setItem(keyFor("pmgt_avatar_abs", uid), absUrl);
          sessionStorage.setItem(keyFor("pmgt_avatar_path", uid), relPath);
          sessionStorage.setItem(keyFor("pmgt_avatar_version", uid), v);
          abs = absUrl;
          rel = relPath;
        }
      } catch { }
    }
    setAvatarSrc(buildAvatarUrl({ abs, rel, v }));
    setImgError(false);
  }, []);

  React.useEffect(() => {
    loadMe();
    const onFocus = () => loadMe();
    const onAvatarUpdated = (ev: Event) => {
      const uid = getUid();
      const d = (ev as CustomEvent).detail || {};
      const src = buildAvatarUrl({ abs: d.abs, rel: d.rel, v: d.v || String(Date.now()) });
      if (src) {
        if (d.abs) sessionStorage.setItem(keyFor("pmgt_avatar_abs", uid), d.abs);
        if (d.rel) sessionStorage.setItem(keyFor("pmgt_avatar_path", uid), d.rel);
        sessionStorage.setItem(keyFor("pmgt_avatar_version", uid), d.v || String(Date.now()));
        setAvatarSrc(src);
        setImgError(false);
      }
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("pmgt:avatar-updated", onAvatarUpdated as EventListener);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pmgt:avatar-updated", onAvatarUpdated as EventListener);
    };
  }, [loadMe]);

  const initials = getInitials(fullName, username, email);

  const [settingsEl, setSettingsEl] = React.useState<null | HTMLElement>(null);
  const isSettingsOpen = Boolean(settingsEl);
  const openSettings = (e: React.MouseEvent<HTMLElement>) => setSettingsEl(e.currentTarget);
  const closeSettings = () => setSettingsEl(null);

  const changeLang = (next: "en" | "hi") => {
    localStorage.setItem("pmgt_lang", next);
    window.dispatchEvent(new CustomEvent("pmgt:lang-changed", { detail: { lang: next } }));
  };

  if (loadingAccess) {
    return (
      <Box sx={{ height: 54, display: "flex", alignItems: "center", justifyContent: "center", color: "white", bgcolor: "transparent" }}>
        Loading...
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: leftOffset,
        right: 0,
        height: TOPBAR_HEIGHT,
        background: vars.bgApp,
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${vars.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 3,
        zIndex: 9,
        transition: "left 200ms ease",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: -1,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(90deg, transparent 0%, rgba(139, 92, 246,0.08) 30%, rgba(139, 92, 246,0.15) 50%, rgba(139, 92, 246,0.08) 70%, transparent 100%)",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box sx={{ fontSize: 11, color: "#5A5D6B", fontFamily: "monospace", letterSpacing: "0.02em" }}>
          <DualClockRow />
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.25} alignItems="center">
        {isEditor && hasPageAccess("visibility_schedule") && (
          <TopNavButton to="/visibility-schedule" label={t("Visibility Schedule +")} />
        )}
        {isEditor && hasPageAccess("add_pass") && (
          <TopNavButton to="/add/pass" label={t("Add Passes +")} />
        )}
        {isEditor && hasPageAccess("add_license") && (
          <TopNavButton to="/add/license" label={t("Add License +")} />
        )}
        {isEditor && hasPageAccess("add_satellite") && (
          <TopNavButton to="/add/satellite" label={t("Add Satellites +")} />
        )}
        {hasPageAccess("gs_operations") && (
          <TopNavButton to="/gsoperations" label={t("GS & Operations +")} />
        )}
        {hasRole("admin") && hasPageAccess("iam") && (
          <TopNavButton to="/iam" label={t("User & Role Management")} />
        )}

        <Avatar
          src={!imgError ? avatarSrc : undefined}
          imgProps={{ loading: "eager", referrerPolicy: "no-referrer" }}
          onClick={() => navigate("/userprofile")}
          onError={() => setImgError(true)}
          onLoad={() => setImgError(false)}
          sx={{
            width: 34,
            height: 34,
            bgcolor: avatarSrc && !imgError ? "transparent" : vars.accent,
            color: "#fff",
            fontSize: 12,
            fontWeight: 800,
            cursor: "pointer",
            userSelect: "none",
            border: `2px solid ${BG}`,
            boxShadow: `0 0 0 1px ${BORDER}`,
            transition: "all 0.2s",
            "&:hover": { transform: "scale(1.05)", boxShadow: `0 0 12px #38bdf844, 0 0 0 1.5px #38bdf8` },
          }}
          title={t("User & Role Management")}
        >
          {!avatarSrc || imgError ? initials : null}
        </Avatar>

        <Tooltip title={t("Settings")}>
          <IconButton size="small" onClick={openSettings} sx={{
            color: vars.textDim,
            "&:hover": { color: vars.text, bgcolor: vars.bgHover },
            borderRadius: "8px",
          }}>
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={settingsEl}
          open={isSettingsOpen}
          onClose={closeSettings}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          PaperProps={{
            sx: {
              mt: 1,
              bgcolor: vars.bgCard,
              color: vars.text,
              border: `1px solid ${vars.border}`,
              borderRadius: "12px",
              minWidth: 220,
              "& .MuiMenuItem-root": { fontSize: 13, borderRadius: "8px", mx: 0.5 },
              "& .MuiMenuItem-root:hover": { bgcolor: vars.bgHover },
              "& .MuiDivider-root": { borderColor: vars.border },
            },
          }}
        >
          <MenuItem onClick={toggle} sx={{ gap: 1 }}>
            <ListItemIcon sx={{ minWidth: 32, color: vars.text }}>
              {pref === "light" ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </ListItemIcon>
            <Box sx={{ flex: 1 }}>
              {pref === "light" ? t("Light Mode") : t("Dark Mode")}
            </Box>
            <Switch
              size="small"
              checked={pref === "light"}
              onClick={(e) => e.stopPropagation()}
              onChange={toggle}
            />
          </MenuItem>
          <Divider sx={{ borderColor: vars.border }} />
          <MenuItem disabled sx={{ opacity: 0.7 }}><ListItemIcon sx={{ minWidth: 32, color: vars.text }}><TranslateIcon fontSize="small" /></ListItemIcon>{t("Language")}</MenuItem>
          <MenuItem onClick={() => changeLang("en")} sx={{ pl: 5 }} selected={lang === "en"}><Box sx={{ flex: 1 }}>{t("English")}</Box>{lang === "en" && <CheckIcon fontSize="small" />}</MenuItem>
          <MenuItem onClick={() => changeLang("hi")} sx={{ pl: 5 }} selected={lang === "hi"}><Box sx={{ flex: 1 }}>{t("Hindi")}</Box>{lang === "hi" && <CheckIcon fontSize="small" />}</MenuItem>
        </Menu>
      </Stack>
    </Box>
  );
}

function TopNavButton({ to, label }: { to: string; label: string }) {
  return (
    <Button
      component={NavLink as any}
      className="top-nav-button"
      to={to}
      end
      disableRipple
      disableElevation
      variant="text"
      sx={{
        textTransform: "none",
        fontWeight: 800,
        fontSize: 12,
        px: 1.8,
        py: 0.6,
        borderRadius: "10px",
        whiteSpace: "nowrap",
        color: vars.text,
        bgcolor: "transparent",
        border: `1px solid transparent`,
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          bgcolor: vars.bgHover,
          color: vars.text,
          borderColor: vars.borderWeak,
        },
        "&.active": {
          bgcolor: vars.bgCard,
          borderColor: vars.accent,
          color: vars.accent,
          boxShadow: `0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)`,
          textShadow: `0 0 8px ${vars.accent}44`,
        },
        "&:link, &:visited, &:hover, &:active, &:focus": {
          textDecoration: "none",
        },
      }}
    >
      {label}
    </Button>
  );
}
