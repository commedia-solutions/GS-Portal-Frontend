// // src/components/TopNav.tsx
// import React from "react";
// import { Box, Typography, Stack, Button, Avatar } from "@mui/material";
// import { NavLink, useNavigate } from "react-router-dom";

// export const TOPBAR_HEIGHT = 54;

// type TopNavProps = {
//   leftOffset: number;
//   title?: string;
// };

// /* ---------- tiny API helpers ---------- */
//   const RAW_BASE =
//   (import.meta as any).env?.VITE_API_BASE ||
//   (import.meta as any).env?.VITE_API_BASE_URL ||
//   window.location.origin;

// const BASE = String(RAW_BASE).replace(/\/+$/, "");          // no trailing slash
// const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
// const ASSET_BASE = API_BASE.replace(/\/api$/, "");         

// function getToken() {
//   return (
//     sessionStorage.getItem("pmgt_token") ||
//     sessionStorage.getItem("token") ||
//     sessionStorage.getItem("access_token") ||
//     localStorage.getItem("token") ||
//     localStorage.getItem("access_token") ||
//     localStorage.getItem("auth_token") ||
//     ""
//   );
// }

// async function fetchMe() {
//   const token = getToken();
//   if (!token) return null;

//   const res = await fetch(`${API_BASE}/auth/me`, {
//   headers: { Authorization: `Bearer ${token}` },
// });

//   const text = await res.text();
//   try {
//     const data = text ? JSON.parse(text) : null;
//     if (!res.ok) throw new Error((data as any)?.error || "Failed");
//     const user = (data && typeof data === "object" && "user" in data
//       ? (data as any).user
//       : data) as any;

//     // cache to avoid flicker on next mount
//     sessionStorage.setItem("pmgt_full_name", user?.full_name ?? "");
//     sessionStorage.setItem("pmgt_username", user?.username ?? "");
//     sessionStorage.setItem("pmgt_email", user?.email ?? "");
//     if (user?.profile_photo_path) {
//       sessionStorage.setItem("pmgt_avatar_path", user.profile_photo_path);
//     }

//     return user;
//   } catch {
//     return null;
//   }
// }



// function buildAvatarUrl(opts: { rel?: string | null; abs?: string | null; v?: string | null }) {
//   const { rel, abs, v } = opts;
//   let url: string | undefined;

//   if (abs) {
//     url = abs.startsWith("http") ? abs : `${ASSET_BASE}${abs}`;
//   } else if (rel) {
//     // rel like "avatars/xyz.png" or "uploads/avatars/xyz.png"
//     const clean = rel.replace(/^\/?uploads\//, "");
//     url = `${ASSET_BASE}/uploads/${clean}`;
//   }

//   if (!url) return undefined;
//   return v ? `${url}${url.includes("?") ? "&" : "?"}v=${v}` : url;
// }

// function getInitials(full_name?: string, username?: string, email?: string) {
//   const src = (full_name || username || email || "User").trim();
//   const parts = src.split(/\s+/).filter(Boolean);
//   if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
//   return src.slice(0, 2).toUpperCase();
// }

// export default function TopNav({ leftOffset, title }: TopNavProps) {
//   const navigate = useNavigate();

//   // ----- PRE-SEED FROM SESSION to avoid flicker -----
//   const initialAvatar = React.useMemo(() => {
//     const abs = sessionStorage.getItem("pmgt_avatar_abs");
//     const rel = sessionStorage.getItem("pmgt_avatar_path");
//     const v = sessionStorage.getItem("pmgt_avatar_version");
//     return buildAvatarUrl({ abs, rel, v });
//   }, []);
//   const [avatarSrc, setAvatarSrc] = React.useState<string | undefined>(initialAvatar);
//   const [imgError, setImgError] = React.useState(false);

//   const [fullName, setFullName] = React.useState<string>(
//     sessionStorage.getItem("pmgt_full_name") || ""
//   );
//   const [username, setUsername] = React.useState<string>(
//     sessionStorage.getItem("pmgt_username") || ""
//   );
//   const [email, setEmail] = React.useState<string>(
//     sessionStorage.getItem("pmgt_email") || ""
//   );

  

//   const loadMe = React.useCallback(async () => {
//   const me = await fetchMe();
//   if (!me) return;

//   setFullName(me.full_name ?? "");
//   setUsername(me.username ?? "");
//   setEmail(me.email ?? "");

//   // 1) try whatever we already have in session
//   let abs = sessionStorage.getItem("pmgt_avatar_abs");      // e.g. "/uploads/avatars/xxx.png"
//   let rel = sessionStorage.getItem("pmgt_avatar_path");     // e.g. "avatars/xxx.png"
//   let v   = sessionStorage.getItem("pmgt_avatar_version");  // cache buster

//   // 2) if nothing yet, fetch full user to get avatarUrl once on load
//   const uid = me.id || me.userId || me.uid;
//   if ((!abs && !rel) && uid) {
//     try {
//       const r = await fetch(`${API_BASE}/users/${uid}`, {
//   headers: { Authorization: `Bearer ${getToken()}` },
// });
//       const full = await r.json();
//       if (r.ok && full?.avatarUrl) {
//         // backend returns: full.avatarUrl = "/uploads/avatars/<file>"
//         const absUrl = full.avatarUrl;
//         const relPath = absUrl.replace(/^\/?uploads\//, ""); // -> "avatars/<file>"

//         sessionStorage.setItem("pmgt_avatar_abs", absUrl);
//         sessionStorage.setItem("pmgt_avatar_path", relPath);
//         v = String(Date.now());
//         sessionStorage.setItem("pmgt_avatar_version", v);

//         abs = absUrl;
//         rel = relPath;
//       }
//     } catch {
//       // ignore; fall back to initials
//     }
//   }

//   setAvatarSrc(buildAvatarUrl({ abs, rel, v }));
//   setImgError(false);
// }, []);

//   // live date/time + listeners
//   const [now, setNow] = React.useState<Date>(new Date());
//   React.useEffect(() => {
//     loadMe();

//     const onFocus = () => {
//       loadMe();
//       setNow(new Date());
//     };
//     window.addEventListener("focus", onFocus);

//     // same-tab event from User_profile after upload
//     const onAvatarUpdated = (ev: Event) => {
//       const d = (ev as CustomEvent).detail || {};
//       const src = buildAvatarUrl({ abs: d.abs, rel: d.rel, v: d.v || String(Date.now()) });
//       if (src) {
//         setAvatarSrc(src);
//         setImgError(false);
//       }
//     };
//     window.addEventListener("pmgt:avatar-updated", onAvatarUpdated as EventListener);

//     // cross-tab updates
//     const onStorage = (_e: StorageEvent) => {
//       const abs = sessionStorage.getItem("pmgt_avatar_abs");
//       const rel = sessionStorage.getItem("pmgt_avatar_path");
//       const v = sessionStorage.getItem("pmgt_avatar_version");
//       setAvatarSrc(buildAvatarUrl({ abs, rel, v }));
//       setImgError(false);
//     };
//     window.addEventListener("storage", onStorage);

//     // update clock every second
//     const t = setInterval(() => setNow(new Date()), 1000);

//     return () => {
//       window.removeEventListener("focus", onFocus);
//       window.removeEventListener("storage", onStorage);
//       window.removeEventListener("pmgt:avatar-updated", onAvatarUpdated as EventListener);
//       clearInterval(t);
//     };
//   }, [loadMe]);

//   const initials = getInitials(fullName, username, email);

//   const formattedNow = React.useMemo(() => {
//     try {
//       return new Intl.DateTimeFormat(undefined, {
//         weekday: "short",
//         month: "short",
//         day: "2-digit",
//         year: "numeric",
//         hour: "2-digit",
//         minute: "2-digit",
//         second: "2-digit",
//       }).format(now);
//     } catch {
//       return now.toLocaleString();
//     }
//   }, [now]);

//   return (
//     <Box
//       sx={{
//         position: "fixed",
//         top: 0,
//         left: leftOffset,
//         right: 0,
//         height: TOPBAR_HEIGHT,
//         bgcolor: "#0F0F0F",
//         borderBottom: "2px solid rgba(255,255,255,0.12)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "space-between",
//         px: 1.4,
//         zIndex: 9,
//         transition: "left 200ms ease",
//       }}
//     >
//       {/* Title + date/time */}
//       <Stack direction="row" alignItems="baseline" spacing={1.25}>
//         <Typography variant="h6" sx={{ color: "#fff", fontWeight: 500 }}>
//           {title ?? "Passes Dashboard"}
//         </Typography>
//         <Typography
//           variant="caption"
//           sx={{ color: "rgba(232,232,234,0.75)", fontWeight: 500 }}
//         >
//           {formattedNow}
//         </Typography>
//       </Stack>

//       <Stack direction="row" spacing={1.25} alignItems="center">
//         <TopNavButton to="/add/pass" label="Add Passes +" />
//         <TopNavButton to="/add/license" label="Add License +" />
//         <TopNavButton to="/add/satellite" label="Add Satellites +" />
//         <TopNavButton to="/Gsoperations" label="GS & Operations +" />
//         <TopNavButton to="/iam" label="User & Role Management" />

//         {/* User avatar (direct navigation to profile) */}
//         <Avatar
//           src={!imgError ? avatarSrc : undefined}
//           imgProps={{ loading: "eager", referrerPolicy: "no-referrer" }}
//           onClick={() => navigate("/userprofile")}
//           onError={() => setImgError(true)}
//           onLoad={() => setImgError(false)}
//           sx={{
//             width: 34,
//             height: 34,
//             bgcolor: avatarSrc && !imgError ? "transparent" : "#7C57F2",
//             fontSize: 14,
//             fontWeight: 700,
//             cursor: "pointer",
//             userSelect: "none",
//           }}
//           title="Go to profile"
//         >
//           {(!avatarSrc || imgError) ? initials : null}
//         </Avatar>
//       </Stack>
//     </Box>
//   );
// }

// function TopNavButton({ to, label }: { to: string; label: string }) {
//   return (
//     <Button
//       component={NavLink as any}
//       to={to}
//       end
//       disableRipple
//       sx={{
//         textTransform: "none",
//         fontWeight: 600,
//         color: "#E8E8EA",
//         px: 1,
//         py: 0.55,
//         borderRadius: 2,
//         bgcolor: "rgba(255,255,255,0.06)",
//         border: "1px solid rgba(255,255,255,0.10)",
//         whiteSpace: "nowrap",
//         "&:hover": { bgcolor: "rgba(255,255,255,0.10)" },
//         "&.active": {
//           bgcolor: "#7C57F2",
//           borderColor: "#7C57F2",
//           color: "#fff",
//         },
//         "&:link, &:visited, &:hover, &:active, &:focus": {
//           color: "inherit",
//           textDecoration: "none",
//         },
//       }}
//     >
//       {label}
//     </Button>
//   );
// }



// After access  management //
import React from "react";
import { Box, Typography, Stack, Button, Avatar } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth, PERMISSION } from "../auth";

export const TOPBAR_HEIGHT = 54;

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
    if (user?.profile_photo_path) {
      sessionStorage.setItem("pmgt_avatar_path", user.profile_photo_path);
    }

    return user;
  } catch {
    return null;
  }
}

function buildAvatarUrl(opts: { rel?: string | null; abs?: string | null; v?: string | null }) {
  const { rel, abs, v } = opts;
  let url: string | undefined;
  if (abs) url = abs.startsWith("http") ? abs : `${ASSET_BASE}${abs}`;
  else if (rel) url = `${ASSET_BASE}/uploads/${rel.replace(/^\/?uploads\//, "")}`;
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
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function TopNav({ leftOffset, title }: TopNavProps) {
  const navigate = useNavigate();
  const { can, hasRole } = useAuth(); // RBAC helpers

  // avatar state
  // const initialAvatar = React.useMemo(() => {
  //   const abs = sessionStorage.getItem("pmgt_avatar_abs");
  //   const rel = sessionStorage.getItem("pmgt_avatar_path");
  //   const v = sessionStorage.getItem("pmgt_avatar_version");
  //   return buildAvatarUrl({ abs, rel, v });
  // }, []);

  const initialAvatar = React.useMemo(() => {
  const uid = getUid();
  const abs = sessionStorage.getItem(keyFor("pmgt_avatar_abs", uid));
  const rel = sessionStorage.getItem(keyFor("pmgt_avatar_path", uid));
  const v   = sessionStorage.getItem(keyFor("pmgt_avatar_version", uid));
  return buildAvatarUrl({ abs, rel, v });
}, []);

  const [avatarSrc, setAvatarSrc] = React.useState<string | undefined>(initialAvatar);
  const [imgError, setImgError] = React.useState(false);

  const [fullName, setFullName] = React.useState<string>(
    sessionStorage.getItem("pmgt_full_name") || ""
  );
  const [username, setUsername] = React.useState<string>(
    sessionStorage.getItem("pmgt_username") || ""
  );
  const [email, setEmail] = React.useState<string>(sessionStorage.getItem("pmgt_email") || "");

  // const loadMe = React.useCallback(async () => {
  //   const me = await fetchMe();
  //   if (!me) return;
  //   setFullName(me.full_name ?? "");
  //   setUsername(me.username ?? "");
  //   setEmail(me.email ?? "");

  //   let abs = sessionStorage.getItem("pmgt_avatar_abs");
  //   let rel = sessionStorage.getItem("pmgt_avatar_path");
  //   let v = sessionStorage.getItem("pmgt_avatar_version");

  //   const uid = me.id || me.userId || me.uid;
  //   if ((!abs && !rel) && uid) {
  //     try {
  //       const r = await fetch(`${API_BASE}/users/${uid}`, {
  //         headers: { Authorization: `Bearer ${getToken()}` },
  //       });
  //       const full = await r.json();
  //       if (r.ok && full?.avatarUrl) {
  //         const absUrl = full.avatarUrl;
  //         const relPath = absUrl.replace(/^\/?uploads\//, "");
  //         sessionStorage.setItem("pmgt_avatar_abs", absUrl);
  //         sessionStorage.setItem("pmgt_avatar_path", relPath);
  //         v = String(Date.now());
  //         sessionStorage.setItem("pmgt_avatar_version", v);
  //         abs = absUrl;
  //         rel = relPath;
  //       }
  //     } catch {}
  //   }

  //   setAvatarSrc(buildAvatarUrl({ abs, rel, v }));
  //   setImgError(false);
  // }, []);

  const loadMe = React.useCallback(async () => {
  const me = await fetchMe();
  if (!me) return;

  // text bits for initials
  setFullName(me.full_name ?? "");
  setUsername(me.username ?? "");
  setEmail(me.email ?? "");

  // 🔑 persist current uid for namespacing
  const uid = String(me.id || me.userId || me.uid || "");
  if (uid) sessionStorage.setItem("pmgt_uid", uid);

  // try user-scoped cached avatar first
  let abs = sessionStorage.getItem(keyFor("pmgt_avatar_abs", uid));
  let rel = sessionStorage.getItem(keyFor("pmgt_avatar_path", uid));
  let v   = sessionStorage.getItem(keyFor("pmgt_avatar_version", uid));

  // if nothing cached for this uid, fetch full profile once
  if ((!abs && !rel) && uid) {
    try {
      const r = await fetch(`${API_BASE}/users/${uid}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const full = await r.json();

      if (r.ok && full?.avatarUrl) {
        // backend returns something like "/uploads/avatars/xxx.png"
        const absUrl = String(full.avatarUrl);                    // keep as-is; buildAvatarUrl will prefix
        const relPath = absUrl.replace(/^\/?uploads\//, "");      // "avatars/xxx.png"
        v = String(Date.now());

        // save per-user cache
        sessionStorage.setItem(keyFor("pmgt_avatar_abs", uid), absUrl);
        sessionStorage.setItem(keyFor("pmgt_avatar_path", uid), relPath);
        sessionStorage.setItem(keyFor("pmgt_avatar_version", uid), v);

        abs = absUrl;
        rel = relPath;
      }
    } catch {
      /* ignore — we'll fall back to initials */
    }
  }

  // (optional) clean up any old global keys left from previous builds
  ["pmgt_avatar_abs", "pmgt_avatar_path", "pmgt_avatar_version"].forEach((k) =>
    sessionStorage.removeItem(k)
  );

  setAvatarSrc(buildAvatarUrl({ abs, rel, v }));
  setImgError(false);
}, []);

  // live date/time + listeners
  const [now, setNow] = React.useState<Date>(new Date());
  React.useEffect(() => {
    loadMe();
    const onFocus = () => { loadMe(); setNow(new Date()); };
    window.addEventListener("focus", onFocus);
    

    // const onAvatarUpdated = (ev: Event) => {
    //   const d = (ev as CustomEvent).detail || {};
    //   const src = buildAvatarUrl({ abs: d.abs, rel: d.rel, v: d.v || String(Date.now()) });
    //   if (src) { setAvatarSrc(src); setImgError(false); }
    // };
    const onAvatarUpdated = (ev: Event) => {
  const uid = getUid();
  const d = (ev as CustomEvent).detail || {};
  const src = buildAvatarUrl({ abs: d.abs, rel: d.rel, v: d.v || String(Date.now()) });
  if (src) {
    // persist (safeguard) under user-scoped keys
    if (d.abs) sessionStorage.setItem(keyFor("pmgt_avatar_abs", uid), d.abs);
    if (d.rel) sessionStorage.setItem(keyFor("pmgt_avatar_path", uid), d.rel);
    sessionStorage.setItem(keyFor("pmgt_avatar_version", uid), d.v || String(Date.now()));
    setAvatarSrc(src);
    setImgError(false);
  }
};
    window.addEventListener("pmgt:avatar-updated", onAvatarUpdated as EventListener);

    // const onStorage = () => {
    //   const abs = sessionStorage.getItem("pmgt_avatar_abs");
    //   const rel = sessionStorage.getItem("pmgt_avatar_path");
    //   const v = sessionStorage.getItem("pmgt_avatar_version");
    //   setAvatarSrc(buildAvatarUrl({ abs, rel, v })); setImgError(false);
    // };
    const onStorage = () => {
  const uid = getUid();
  const abs = sessionStorage.getItem(keyFor("pmgt_avatar_abs", uid));
  const rel = sessionStorage.getItem(keyFor("pmgt_avatar_path", uid));
  const v   = sessionStorage.getItem(keyFor("pmgt_avatar_version", uid));
  setAvatarSrc(buildAvatarUrl({ abs, rel, v }));
  setImgError(false);
};
    window.addEventListener("storage", onStorage);

    const t = setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("pmgt:avatar-updated", onAvatarUpdated as EventListener);
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, [loadMe]);

  const initials = getInitials(fullName, username, email);
  const formattedNow = React.useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        weekday: "short", month: "short", day: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
      }).format(now);
    } catch { return now.toLocaleString(); }
  }, [now]);

  return (
    <Box
      sx={{
        // position: "fixed",
        // top: 0,
        // left: leftOffset,
        // right: 0,
        // height: TOPBAR_HEIGHT,
        // bgcolor: "#0F0F0F",
        // borderBottom: "2px solid rgba(255,255,255,0.12)",
        // display: "flex",
        // alignItems: "center",
        // justifyContent: "space-between",
        // px: 1.4,
        // zIndex: 9,
        // transition: "left 200ms ease",
         position: "fixed",
    top: 0,
    left: leftOffset,
    right: 0,
    height: TOPBAR_HEIGHT,
    bgcolor: "#0F0F0F",
    borderBottom: "2px solid rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    px: 1.4,
    zIndex: 9,
    transition: "left 200ms ease",
    colorScheme: "dark",   
      }}
    >
      {/* Title + date/time (everyone) */}
      <Stack direction="row" alignItems="baseline" spacing={1.25}>
        <Typography variant="h6" sx={{ color: "#fff", fontWeight: 500 }}>
          {title ?? "Dashboard"}
        </Typography>
        <Typography variant="caption" sx={{ color: "rgba(232,232,234,0.75)", fontWeight: 500 }}>
          {formattedNow}
        </Typography>
      </Stack>

      {/* Right actions — filtered by permissions/role */}
      <Stack direction="row" spacing={1.25} alignItems="center">
        {can(PERMISSION.AddPass) && <TopNavButton to="/add/pass" label="Add Passes +" />}
        {can(PERMISSION.AddLicense) && <TopNavButton to="/add/license" label="Add License +" />}
        {can(PERMISSION.AddSatellite) && (
  <TopNavButton to="/add/satellite" label="Add Satellites +" />
)}
        {can(PERMISSION.ViewGSOps) && (
          <TopNavButton to="/Gsoperations" label="GS & Operations +" />
        )}
        {/* IAM only for admins, even if permissions were misconfigured elsewhere */}
        {hasRole("admin") && <TopNavButton to="/iam" label="User & Role Management" />}

        {/* Avatar (always) */}
        <Avatar
          src={!imgError ? avatarSrc : undefined}
          imgProps={{ loading: "eager", referrerPolicy: "no-referrer" }}
          onClick={() => navigate("/userprofile")}
          onError={() => setImgError(true)}
          onLoad={() => setImgError(false)}
          sx={{
            width: 34, height: 34,
            bgcolor: avatarSrc && !imgError ? "transparent" : "#7C57F2",
            fontSize: 14, fontWeight: 700, cursor: "pointer", userSelect: "none",
          }}
          title="Go to profile"
        >
          {(!avatarSrc || imgError) ? initials : null}
        </Avatar>
      </Stack>
    </Box>
  );
}

function TopNavButton({ to, label }: { to: string; label: string }) {
  return (
    // <Button
    //   component={NavLink as any}
    //   to={to}
    //   end
    //   disableRipple
    //   sx={{
    //     textTransform: "none",
    //     fontWeight: 600,
    //     color: "#E8E8EA",
    //     px: 1,
    //     py: 0.55,
    //     borderRadius: 2,
    //     bgcolor: "rgba(255,255,255,0.06)",
    //     border: "1px solid rgba(255,255,255,0.10)",
    //     whiteSpace: "nowrap",
    //     "&:hover": { bgcolor: "rgba(255,255,255,0.10)" },
    //     "&.active": { bgcolor: "#7C57F2", borderColor: "#7C57F2", color: "#fff" },
    //     "&:link, &:visited, &:hover, &:active, &:focus": {
    //       color: "inherit", textDecoration: "none",
    //     },
    //   }}
    // >
    //   {label}
    // </Button>

     <Button
      component={NavLink as any}
      to={to}
      end
      disableRipple
      disableElevation
      variant="text"
      sx={{
        textTransform: "none",
        fontWeight: 600,
        px: 1,
        py: 0.55,
        borderRadius: 2,
        whiteSpace: "nowrap",

        // ✅ hard lock colors so light/dark OS theme won’t alter them
        color: "#E8E8EA",
        bgcolor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.10)",

        "&:hover": { bgcolor: "rgba(255,255,255,0.10)" },
        "&.active": {
          bgcolor: "#7C57F2",
          borderColor: "#7C57F2",
          color: "#fff",
        },

        // keep links consistent
        "&:link, &:visited, &:hover, &:active, &:focus": {
          color: "inherit",
          textDecoration: "none",
        },
      }}
    >
      {label}
    </Button>
  );
}
