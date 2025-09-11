// p4//
import React, { useCallback, useEffect, useRef, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  Avatar, Box, Button, Card, IconButton, Slider, Stack, TextField,
  Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Snackbar, Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Cropper from "react-easy-crop";
import { TOPBAR_HEIGHT } from "../components/TopNav";

/* ---------- Base URLs ---------- */
// Raw server base (no trailing slash)
const RAW_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:4000";

const BASE = String(RAW_BASE).replace(/\/+$/, "");
// JSON API base always includes /api
const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
// Static files base (NO /api) — used for /uploads/*
const ASSET_BASE = API_BASE.replace(/\/api$/, "");

/* ---------- Token helper ---------- */
function getToken(): string {
  return (
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    ""
  );
}

/* ---------- JSON fetch helper ---------- */
async function jsonApi(path: string, init?: RequestInit) {
  const token = getToken();
  const headers = new Headers(init?.headers || {});
  const isForm = init?.body instanceof FormData;

  if (!isForm && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Allow both "/api/..." and "/users/..." style paths
  const url = path.startsWith("http")
    ? path
    : path.startsWith("/api")
    ? `${ASSET_BASE}${path}` // "/api/*" -> "http://host/api/*"
    : `${API_BASE}${path}`;  // "/*"    -> "http://host/api/*"

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    const hint = text.startsWith("<")
      ? "Unexpected non-JSON response. Are you hitting the API port?"
      : "Invalid JSON from server";
    throw new Error(hint);
  }

  if (!res.ok) {
    if (res.status === 413) throw new Error("Avatar too large. Please upload a smaller image.");
    throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  }
  return data;
}

const CARD_BG = "#1C1C1E";
const BORDER = "1px solid rgba(255,255,255,0.14)";
const SAVE_PURPLE = "#7C57F2";

/** Crop to a circle and return PNG dataURL */
async function getCroppedCircle(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  );
  ctx.restore();
  return c.toDataURL("image/png");
}

export default function Userprofile() {
  // IDs
  const [userId, setUserId] = useState<string>("");

  // form state
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [username, setUsername] = useState("");
  const [ldap, setLdap] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>();

  // ui
  const [snack, setSnack] =
    useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // avatar editor
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [croppedPixels, setCroppedPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = React.useCallback((_: any, areaPixels: any) => {
    setCroppedPixels(areaPixels);
  }, []);

  const openPicker = () => fileInputRef.current?.click();
  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(String(reader.result));
      setAvatarDialogOpen(true);
    };
    reader.readAsDataURL(f);
  };

  const confirmCrop = async () => {
    if (rawImage && croppedPixels) {
      const url = await getCroppedCircle(rawImage, croppedPixels);
      setAvatarDataUrl(url); // data URL -> uploaded on Save
    }
    setAvatarDialogOpen(false);
  };

  /* ---------- load my profile ---------- */
  const loadMe = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setSnack({ type: "error", msg: "Missing token. Please log in again." });
      return;
    }
    setLoading(true);
    try {
      // /api/auth/me returns the user summary
      const me = await jsonApi("/api/auth/me");
      const u = (me && typeof me === "object" && "user" in me) ? (me as any).user : (me as any);
      const id = u?.id || u?.userId || u?.uid;
      sessionStorage.setItem("pmgt_uid", String(id));
      if (!id) throw new Error("Auth response is missing user id");

      setUserId(id);
      setUsername(u?.username ?? "");
      setEmail(u?.email ?? "");

      // full user record (includes avatarUrl from server)
      const full = await jsonApi(`/api/users/${id}`);
      setName(full?.fullName ?? "");
      setContact(full?.phone ?? "");
      setLdap(full?.ldapDn ?? "");
      setRole(full?.roleName ?? "");

      if (full?.avatarUrl) {
  const abs = `${ASSET_BASE}${full.avatarUrl}`;
  const rel = String(full.avatarUrl).replace(/^\/?uploads\//, "");
  const v = String(Date.now());

  // page display
  setAvatarDataUrl(`${abs}?t=${v}`);

  // seed per-user cache for TopNav
  const k = (base: string) => `${base}:${id}`;
  sessionStorage.setItem(k("pmgt_avatar_abs"), abs);
  sessionStorage.setItem(k("pmgt_avatar_path"), rel);
  sessionStorage.setItem(k("pmgt_avatar_version"), v);
}

      if (full?.avatarUrl) {
        // full.avatarUrl is like "/uploads/avatars/xxx.png" (NO /api)
        setAvatarDataUrl(`${ASSET_BASE}${full.avatarUrl}?t=${Date.now()}`);
      }

      // optional: designations via assignments service
      try {
        const assign = await jsonApi(`/api/assignments/user/${id}`);
        const desigs = Array.isArray(assign?.designations) ? assign.designations : [];
        setDesignation(desigs.join(", "));
      } catch {
        setDesignation("");
      }
    } catch (e: any) {
      setSnack({ type: "error", msg: e.message || "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  /* ---------- save profile + avatar ---------- */
  

  const handleSave = async () => {
  if (!userId) return;
  if (!window.confirm("Save your profile changes?")) return;
  setSaving(true);
  try {
    // 1) save basic fields
    await jsonApi(`/api/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify({
        fullName: name || "",
        phone: contact || "",
        ldapDn: ldap || "",
      }),
    });

    // 2) upload avatar only if it's a fresh data URL from the cropper
    if (avatarDataUrl?.startsWith("data:")) {
      const blob = await (await fetch(avatarDataUrl)).blob(); // PNG
      const fd = new FormData();
      fd.append("avatar", blob, "avatar.png");

      const token = getToken();
      const res = await fetch(`${API_BASE}/users/me/avatar`, {
        method: "PUT",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined, // don't set Content-Type for FormData
        body: fd,
      });
      const uploaded = await res.json();
      if (!res.ok) {
        throw new Error(uploaded?.error || uploaded?.message || `HTTP ${res.status}`);
      }

      // server may return /uploads/avatars/xxx.png or similar
      const returnedUrl =
        uploaded?.url || uploaded?.avatarUrl || uploaded?.path || uploaded?.profile_photo_url;
      if (returnedUrl) {
        const abs = String(returnedUrl).startsWith("http")
          ? String(returnedUrl)
          : `${ASSET_BASE}${String(returnedUrl)}`;

        // derive a clean relative path under /uploads for caching & fallback
        const relCandidate = uploaded?.profile_photo_path || returnedUrl;
        const rel = String(relCandidate)
          .replace(/^https?:\/\/[^/]+/, "")
          .replace(/^\/?uploads\//, ""); // -> "avatars/xxx.png"

        const version = String(Date.now());

        const uid = sessionStorage.getItem("pmgt_uid") || String(userId);
const k = (base: string) => (uid ? `${base}:${uid}` : base);

// show new avatar immediately
setAvatarDataUrl(`${abs}?v=${version}`);

// persist for TopNav (per-user)
sessionStorage.setItem(k("pmgt_avatar_abs"), abs);
sessionStorage.setItem(k("pmgt_avatar_path"), rel);
sessionStorage.setItem(k("pmgt_avatar_version"), version);

// notify TopNav
window.dispatchEvent(
  new CustomEvent("pmgt:avatar-updated", { detail: { abs, rel, v: version } })
);

        // show new avatar immediately in this page
        setAvatarDataUrl(`${abs}?v=${version}`);

        // persist for TopNav (clean abs, separate version)
        sessionStorage.setItem("pmgt_avatar_abs", abs);
        sessionStorage.setItem("pmgt_avatar_path", rel);
        sessionStorage.setItem("pmgt_avatar_version", version);

        // notify TopNav in this tab
        window.dispatchEvent(
          new CustomEvent("pmgt:avatar-updated", {
            detail: { abs, rel, v: version },
          })
        );
      }
    }

    setSnack({ type: "success", msg: "Profile saved" });
  } catch (e: any) {
    setSnack({ type: "error", msg: e.message || "Failed to save profile" });
  } finally {
    setSaving(false);
  }
};


  return (
    <MainLayout title="User Profile">
      <Box sx={{ p: 2 }}>
        <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onPick} />

        <Card
          sx={{
            backgroundColor: CARD_BG,
            border: BORDER,
            borderRadius: 3,
            color: "rgba(255,255,255,0.92)",
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid rgba(255,255,255,0.14)" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", fontSize: 20 }}>
                Add User details
              </Typography>
            </Stack>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, p: 2 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              {/* LEFT: avatar */}
              <Box
                sx={{
                  minWidth: { md: 220 },
                  pr: { md: 2 },
                  borderRight: { md: "1px solid rgba(255,255,255,0.14)" },
                  display: "flex",
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <Box sx={{ position: "relative", width: 140, height: 140 }}>
                  <Avatar
                    src={avatarDataUrl}
                    alt={name || "User avatar"}
                    sx={{
                      width: 140,
                      height: 140,
                      bgcolor: "#2A2A2E",
                      border: BORDER,
                      fontSize: 28,
                    }}
                  >
                    {(name || "U").slice(0, 1).toUpperCase()}
                  </Avatar>

                  <Tooltip title="Change avatar">
                    <IconButton
                      onClick={openPicker}
                      sx={{
                        position: "absolute",
                        right: 6,
                        bottom: 6,
                        background: "rgba(0,0,0,0.6)",
                        border: "1px solid rgba(255,255,255,0.24)",
                        "&:hover": { background: "rgba(0,0,0,0.75)" },
                      }}
                    >
                      <EditIcon sx={{ color: "#fff", fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* RIGHT: fields */}
              <Box sx={{ flex: 1 }}>
                <Stack spacing={2}>
                  <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} size="small" fullWidth sx={darkFieldSx} disabled={loading} />
                  <TextField label="Contact No" value={contact} onChange={(e) => setContact(e.target.value)} size="small" fullWidth sx={darkFieldSx} disabled={loading} />
                  <TextField label="Username" value={username} InputProps={{ readOnly: true }} size="small" fullWidth sx={darkFieldSx} />
                  <TextField label="LDAP ID (optional)" value={ldap} onChange={(e) => setLdap(e.target.value)} size="small" fullWidth sx={darkFieldSx} disabled={loading} />
                  <TextField label="Designation" value={designation || ""} InputProps={{ readOnly: true }} size="small" fullWidth sx={darkFieldSx} />
                  <TextField label="Email" type="email" value={email} InputProps={{ readOnly: true }} size="small" fullWidth sx={darkFieldSx} />
                  <TextField label="Role" value={role || ""} InputProps={{ readOnly: true }} size="small" fullWidth sx={darkFieldSx} />
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      onClick={handleSave}
                      disabled={loading || saving}
                      variant="contained"
                      sx={{
                        backgroundColor: SAVE_PURPLE,
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 2,
                        px: 3,
                        py: 0.8,
                        fontSize: 13,
                        "&:hover": { backgroundColor: "#6E4DE0" },
                      }}
                    >
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Card>

        {/* Avatar adjust dialog */}
        <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} maxWidth="md" fullWidth
          PaperProps={{ sx: { backgroundColor: "#17171A", border: BORDER } }}>
          <DialogTitle sx={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
            Adjust your avatar
          </DialogTitle>
          <DialogContent>
            <Box sx={{ position: "relative", width: "100%", height: 300, background: "#0F0F11", border: BORDER, borderRadius: 2, overflow: "hidden" }}>
              {rawImage && (
                <Cropper
                  image={rawImage}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  restrictPosition
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ color: "#fff", mb: 1, fontSize: 13 }}>Zoom</Typography>
              <Slider value={zoom} min={1} max={3} step={0.01} onChange={(_, v) => setZoom(v as number)} sx={{ color: "#FFC107" }} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setAvatarDialogOpen(false)} variant="outlined"
              sx={{ textTransform: "none", border: "1px solid rgba(255,255,255,0.24)", color: "#fff", borderRadius: 2, px: 2, fontSize: 13 }}>
              Cancel
            </Button>
            <Button onClick={confirmCrop} variant="contained"
              sx={{ backgroundColor: SAVE_PURPLE, textTransform: "none", fontWeight: 700, borderRadius: 2, px: 2.5, fontSize: 13, "&:hover": { backgroundColor: "#6E4DE0" } }}>
              Save
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!snack} autoHideDuration={3500} onClose={() => setSnack(null)} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnack(null)} severity={snack?.type || "info"} sx={{ width: "100%" }}>
            {snack?.msg}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

/* -------- compact dark inputs -------- */
const darkFieldSx = {
  "& .MuiInputBase-root": {
    backgroundColor: "#1C1C1E",
    borderRadius: 2,
    color: "#fff",
    fontSize: "0.9rem",
    height: 36,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.14)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.24)" },
  "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.6)", fontSize: 12 },
} as const;
