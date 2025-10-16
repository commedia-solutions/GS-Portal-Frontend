// src/pages/Userprofile.tsx
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
import { useI18n } from "../i18n";

/* ---------- Theme tokens (match Logs/Requests/Satellites) ---------- */
const TOK = {
  TEXT: "var(--text)",
  TEXT_DIM: "var(--text-dim)",
  CARD_BG: "var(--bg-card)",
  CONTROL_BG: "var(--bg-ctrl)",
  HOVER: "var(--bg-hover)",
  BORDER_STR: "1px solid var(--border)",
  BORDER_WEAK: "1px solid var(--border-weak)",
  ICON: "var(--text)",
  ACCENT: "var(--accent)",
  SCROLLBAR: "var(--scrollbar)",
} as const;

/* compact inputs (same family as other page) */
const UI = {
  ctrlH: 36,
  font: 13,
};
const compactFieldSx = {
  bgcolor: TOK.CONTROL_BG,
  borderRadius: 2,
  color: TOK.TEXT,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border-weak)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--border)",
  },
  "& .MuiOutlinedInput-root": {
    height: `${UI.ctrlH}px`,
    color: TOK.TEXT,
    backgroundColor: TOK.CONTROL_BG,
    paddingLeft: 1,
    borderRadius: 2,
  },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
    color: TOK.TEXT,
  },
  "& .MuiFormLabel-root": { color: TOK.TEXT_DIM, fontSize: 12 },
} as const;

/* ---------- Base URLs ---------- */
const RAW_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:4000";

const BASE = String(RAW_BASE).replace(/\/+$/, "");
const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
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

  const url = path.startsWith("http")
    ? path
    : path.startsWith("/api")
    ? `${ASSET_BASE}${path}`
    : `${API_BASE}${path}`;

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
  const { t } = useI18n();

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
      setSnack({ type: "error", msg: t("Missing token. Please log in again.") });
      return;
    }
    setLoading(true);
    try {
      const me = await jsonApi("/api/auth/me");
      const u = (me && typeof me === "object" && "user" in me) ? (me as any).user : (me as any);
      const id = u?.id || u?.userId || u?.uid;
      sessionStorage.setItem("pmgt_uid", String(id));
      if (!id) throw new Error("Auth response is missing user id");

      setUserId(id);
      setUsername(u?.username ?? "");
      setEmail(u?.email ?? "");

      const full = await jsonApi(`/api/users/${id}`);
      setName(full?.fullName ?? "");
      setContact(full?.phone ?? "");
      setLdap(full?.ldapDn ?? "");
      setRole(full?.roleName ?? "");

      if (full?.avatarUrl) {
        const abs = `${ASSET_BASE}${full.avatarUrl}`;
        const rel = String(full.avatarUrl).replace(/^\/?uploads\//, "");
        const v = String(Date.now());
        setAvatarDataUrl(`${abs}?t=${v}`);
        const k = (base: string) => `${base}:${id}`;
        sessionStorage.setItem(k("pmgt_avatar_abs"), abs);
        sessionStorage.setItem(k("pmgt_avatar_path"), rel);
        sessionStorage.setItem(k("pmgt_avatar_version"), v);
      }

      if (full?.avatarUrl) {
        setAvatarDataUrl(`${ASSET_BASE}${full.avatarUrl}?t=${Date.now()}`);
      }

      try {
        const assign = await jsonApi(`/api/assignments/user/${id}`);
        const desigs = Array.isArray(assign?.designations) ? assign.designations : [];
        setDesignation(desigs.join(", "));
      } catch {
        setDesignation("");
      }
    } catch (e: any) {
      setSnack({ type: "error", msg: e.message || t("Failed to load profile") });
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  /* ---------- save profile + avatar ---------- */
  const handleSave = async () => {
    if (!userId) return;
    if (!window.confirm(t("Save your profile changes?"))) return;
    setSaving(true);
    try {
      await jsonApi(`/api/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          fullName: name || "",
          phone: contact || "",
          ldapDn: ldap || "",
        }),
      });

      if (avatarDataUrl?.startsWith("data:")) {
        const blob = await (await fetch(avatarDataUrl)).blob();
        const fd = new FormData();
        fd.append("avatar", blob, "avatar.png");

        const token = getToken();
        const res = await fetch(`${API_BASE}/users/me/avatar`, {
          method: "PUT",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        });
        const uploaded = await res.json();
        if (!res.ok) {
          throw new Error(uploaded?.error || uploaded?.message || `HTTP ${res.status}`);
        }

        const returnedUrl =
          uploaded?.url || uploaded?.avatarUrl || uploaded?.path || uploaded?.profile_photo_url;
        if (returnedUrl) {
          const abs = String(returnedUrl).startsWith("http")
            ? String(returnedUrl)
            : `${ASSET_BASE}${String(returnedUrl)}`;

          const relCandidate = uploaded?.profile_photo_path || returnedUrl;
          const rel = String(relCandidate)
            .replace(/^https?:\/\/[^/]+/, "")
            .replace(/^\/?uploads\//, "");

          const version = String(Date.now());

          const uid = sessionStorage.getItem("pmgt_uid") || String(userId);
          const k = (base: string) => (uid ? `${base}:${uid}` : base);

          setAvatarDataUrl(`${abs}?v=${version}`);
          sessionStorage.setItem(k("pmgt_avatar_abs"), abs);
          sessionStorage.setItem(k("pmgt_avatar_path"), rel);
          sessionStorage.setItem(k("pmgt_avatar_version"), version);

          window.dispatchEvent(
            new CustomEvent("pmgt:avatar-updated", { detail: { abs, rel, v: version } })
          );

          // (legacy keys – safe to keep)
          setAvatarDataUrl(`${abs}?v=${version}`);
          sessionStorage.setItem("pmgt_avatar_abs", abs);
          sessionStorage.setItem("pmgt_avatar_path", rel);
          sessionStorage.setItem("pmgt_avatar_version", version);

          window.dispatchEvent(
            new CustomEvent("pmgt:avatar-updated", {
              detail: { abs, rel, v: version },
            })
          );
        }
      }

      setSnack({ type: "success", msg: t("Profile saved") });
    } catch (e: any) {
      setSnack({ type: "error", msg: e.message || t("Failed to save profile") });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout title={t("User Profile")}>
      <Box sx={{ px: 2, py: 1.5 }}>
        <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onPick} />

        <Card
          elevation={0}
          sx={{
            bgcolor: TOK.CARD_BG,
            color: TOK.TEXT,
            border: TOK.BORDER_WEAK,
            borderRadius: 2,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
            backgroundImage: "none",
          }}
        >
          {/* header strip — transparent, thin bottom border */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              px: 1.25,
              py: 0.6,
              borderBottom: TOK.BORDER_WEAK,
              bgcolor: "transparent",
            }}
          >
            <Typography sx={{ fontWeight: 700, color: TOK.TEXT, fontSize: 20 }}>
              {t("Add User Details")}
            </Typography>
          </Box>

          {/* body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 2 }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "visible", pt: 0.5 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                {/* LEFT: avatar */}
                <Box
                  sx={{
                    minWidth: { md: 220 },
                    pr: { md: 2 },
                    borderRight: { md: TOK.BORDER_WEAK },
                    display: "flex",
                    justifyContent: { xs: "center", md: "flex-start" },
                  }}
                >
                  <Box sx={{ position: "relative", width: 140, height: 140 }}>
                    <Avatar
                      src={avatarDataUrl}
                      alt={name || t("User avatar")}
                      sx={{
                        width: 140,
                        height: 140,
                        bgcolor: "#2A2A2E",
                        color: "#fff",
                        border: TOK.BORDER_WEAK,
                        ".theme-light &": {
                          bgcolor: "#ffffff",
                          color: "#111827",
                          border: "1px solid var(--border)",
                        },
                        ".theme-light & img, .theme-dark & img": {
                          borderRadius: "50%",
                        },
                      }}
                    >
                      {(name || "U").slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Tooltip title={t("Change avatar")}>
                      <IconButton
                        onClick={openPicker}
                        sx={{
                          position: "absolute",
                          right: 6,
                          bottom: 6,
                          width: 36,
                          height: 36,
                          backgroundColor: "rgba(0,0,0,0.6)",
                          border: "1px solid rgba(255,255,255,0.25)",
                          backdropFilter: "saturate(120%) blur(2px)",
                          "&:hover": { backgroundColor: "rgba(0,0,0,0.7)" },
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
                    <TextField
                      label={t("Full Name")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      size="small"
                      fullWidth
                      sx={compactFieldSx}
                      disabled={loading}
                    />
                    <TextField
                      label={t("Contact No")}
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      size="small"
                      fullWidth
                      sx={compactFieldSx}
                      disabled={loading}
                    />
                    <TextField
                      label={t("User Id")}
                      value={username}
                      InputProps={{ readOnly: true }}
                      size="small"
                      fullWidth
                      sx={compactFieldSx}
                    />
                    <TextField
                      label={`${t("LDAP DN")} ${t("(optional)")}`}
                      value={ldap}
                      onChange={(e) => setLdap(e.target.value)}
                      size="small"
                      fullWidth
                      sx={compactFieldSx}
                      disabled={loading}
                    />
                    <TextField
                      label={t("Designation")}
                      value={designation || ""}
                      InputProps={{ readOnly: true }}
                      size="small"
                      fullWidth
                      sx={compactFieldSx}
                    />
                    <TextField
                      label={t("Email")}
                      type="email"
                      value={email}
                      InputProps={{ readOnly: true }}
                      size="small"
                      fullWidth
                      sx={compactFieldSx}
                    />
                    <TextField
                      label={t("Role")}
                      value={role || ""}
                      InputProps={{ readOnly: true }}
                      size="small"
                      fullWidth
                      sx={compactFieldSx}
                    />
                    <Box display="flex" justifyContent="flex-end">
                      <Button
                        onClick={handleSave}
                        disabled={loading || saving}
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          borderRadius: 2,
                          px: 3,
                          py: 0.8,
                          fontSize: 13,
                          bgcolor: SAVE_PURPLE,
                          color: "#fff",
                          "&:hover": { bgcolor: "#6E4DE0" },
                        }}
                      >
                        {saving ? t("Saving…") : t("Save")}
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Card>

        {/* Avatar adjust dialog */}
        <Dialog
          open={avatarDialogOpen}
          onClose={() => setAvatarDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { backgroundColor: TOK.CARD_BG, border: TOK.BORDER_WEAK } }}
        >
          <DialogTitle sx={{ color: TOK.TEXT, fontWeight: 700, fontSize: 15 }}>
            {t("Adjust your avatar")}
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: 300,
                background: TOK.CARD_BG,
                border: TOK.BORDER_WEAK,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
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
              <Typography sx={{ color: TOK.TEXT, mb: 1, fontSize: 13 }}>{t("Zoom")}</Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                onChange={(_, v) => setZoom(v as number)}
                sx={{ color: "#FFC107" }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={() => setAvatarDialogOpen(false)}
              variant="outlined"
              sx={{
                textTransform: "none",
                border: TOK.BORDER_STR,
                color: TOK.TEXT,
                borderRadius: 2,
                px: 2,
                fontSize: 13,
              }}
            >
              {t("Cancel")}
            </Button>
            <Button
              onClick={confirmCrop}
              variant="contained"
              sx={{
                backgroundColor: SAVE_PURPLE,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                px: 2.5,
                fontSize: 13,
                "&:hover": { backgroundColor: "#6E4DE0" },
              }}
            >
              {t("Save")}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={!!snack}
          autoHideDuration={3500}
          onClose={() => setSnack(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnack(null)} severity={snack?.type || "info"} sx={{ width: "100%" }}>
            {snack?.msg}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}
