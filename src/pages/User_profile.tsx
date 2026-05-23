// src/pages/User_profile.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  Avatar, Box, Button, Card, IconButton, Slider, Stack, TextField,
  Typography, Dialog, DialogTitle, DialogContent, DialogActions,
  Tooltip, Snackbar, Alert, Backdrop, CircularProgress
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import Cropper from "react-easy-crop";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { useI18n } from "../i18n";
import { vars, sxPresets } from "../ui/toast/themeBridge";

/* ✅ Theme tokens from Bridge */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;

const ctrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "40px", fontSize: 13, color: TEXT, backgroundColor: vars.bgCtrl, borderRadius: "10px",
    "& fieldset": { borderColor: vars.borderWeak },
    "&:hover fieldset": { borderColor: vars.accent },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1 }
  },
  "& .MuiInputBase-input": { padding: "0 12px", fontSize: 13, color: TEXT },
  "& .MuiInputBase-input::placeholder": { color: DIM, opacity: 0.7 },
  "& .MuiFormLabel-root": { color: DIM, fontSize: 12.5, fontWeight: 700 }
} as const;

/* ---------- Base URLs ---------- */
const RAW_BASE = (import.meta as any).env?.VITE_API_BASE || (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:4000";
const BASE = String(RAW_BASE).replace(/\/+$/, "");
const API_BASE = BASE.endsWith("/api") ? BASE : `${BASE}/api`;
const ASSET_BASE = API_BASE.replace(/\/api$/, "");

function getToken(): string {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token") || localStorage.getItem("token") || sessionStorage.getItem("token") || "";
}

async function jsonApi(path: string, init?: RequestInit) {
  const token = getToken();
  const headers = new Headers(init?.headers || {});
  const isForm = init?.body instanceof FormData;
  if (!isForm && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const url = path.startsWith("http") ? path : path.startsWith("/api") ? `${ASSET_BASE}${path}` : `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { throw new Error("Invalid JSON from server"); }
  if (!res.ok) throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
  return data;
}

async function getCroppedCircle(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = imageSrc;
  });
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  const c = document.createElement("canvas"); c.width = size; c.height = size;
  const ctx = c.getContext("2d")!;
  ctx.save(); ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
  ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size);
  ctx.restore();
  return c.toDataURL("image/png");
}

export default function Userprofile() {
  const { t } = useI18n();
  const [userId, setUserId] = useState<string>("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [username, setUsername] = useState("");
  const [ldap, setLdap] = useState("");
  const [designation, setDesignation] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>();
  const [snack, setSnack] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1.2);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedPixels, setCroppedPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = React.useCallback((_: any, areaPixels: any) => setCroppedPixels(areaPixels), []);
  const openPicker = () => fileInputRef.current?.click();
  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { setRawImage(String(reader.result)); setAvatarDialogOpen(true); };
    reader.readAsDataURL(f);
  };

  const confirmCrop = async () => {
    if (rawImage && croppedPixels) { const url = await getCroppedCircle(rawImage, croppedPixels); setAvatarDataUrl(url); }
    setAvatarDialogOpen(false);
  };

  const loadMe = useCallback(async () => {
    const token = getToken(); if (!token) return;
    setLoading(true);
    try {
      const me = await jsonApi("/api/auth/me");
      const u = (me && typeof me === "object" && "user" in me) ? (me as any).user : (me as any);
      const id = u?.id || u?.userId || u?.uid;
      setUserId(id); setUsername(u?.username ?? ""); setEmail(u?.email ?? "");
      const full = await jsonApi(`/api/users/${id}`);
      setName(full?.fullName ?? ""); setContact(full?.phone ?? ""); setLdap(full?.ldapDn ?? ""); setRole(full?.roleName ?? "");
      if (full?.avatarUrl) setAvatarDataUrl(`${ASSET_BASE}${full.avatarUrl}?t=${Date.now()}`);
      try {
        const assign = await jsonApi(`/api/assignments/user/${id}`);
        setDesignation(Array.isArray(assign?.designations) ? assign.designations.join(", ") : "");
      } catch { setDesignation(""); }
    } catch (e: any) { setSnack({ type: "error", msg: e.message || t("Error loading profile") }); }
    finally { setLoading(false); }
  }, [t]);

  useEffect(() => { loadMe(); }, [loadMe]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await jsonApi(`/api/users/${userId}`, { method: "PATCH", body: JSON.stringify({ fullName: name, phone: contact, ldapDn: ldap }) });
      if (avatarDataUrl?.startsWith("data:")) {
        const blob = await (await fetch(avatarDataUrl)).blob();
        const fd = new FormData(); fd.append("avatar", blob, "avatar.png");
        const token = getToken();
        await fetch(`${API_BASE}/users/me/avatar`, { method: "PUT", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: fd });
      }
      setSnack({ type: "success", msg: t("Profile saved successfully") });
    } catch (e: any) { setSnack({ type: "error", msg: e.message || t("Failed to save") }); }
    finally { setSaving(false); }
  };

  return (
    <MainLayout title="">
      <Backdrop open={loading} sx={{ color: "#fff", zIndex: 2000 }}><CircularProgress color="inherit" /></Backdrop>
      <Box sx={{ px: 2, py: 1.5 }}>
        <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={onPick} />
        <Card sx={{
          height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
          position: "relative",
          bgcolor: vars.bgCard,
          border: `1px solid ${vars.border}`,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "none",
        }}>
          {/* Ambient Effects */}
          <Box sx={{ position: "absolute", inset: "-10%", background: `radial-gradient(circle at 20% 30%, rgba(14, 165, 233,0.08) 0%, transparent 40%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0, animation: "sc-fog-breathe 25s ease-in-out infinite" }} />
          <Box sx={{ position: "absolute", top: 0, bottom: 0, width: "30%", background: "linear-gradient(90deg, transparent, rgba(14, 165, 233,0.03), transparent)", pointerEvents: "none", zIndex: 0, animation: "sc-scan-line 12s linear infinite" }} />
          <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "2px", background: `linear-gradient(90deg, transparent, ${vars.accent}, transparent)`, opacity: 0.5, zIndex: 1 }} />

          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", position: "relative", zIndex: 1, bgcolor: "rgba(0,0,0,0.15)" }}>
            <Typography sx={{ fontWeight: 800, color: TEXT, fontSize: 18, letterSpacing: -0.5 }}>{t("User Account Details")}</Typography>
          </Box>

          <Box sx={{ flex: 1, overflow: "auto", p: 3, position: "relative", zIndex: 1, ...sxPresets.scroller }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={5}>
              {/* Profile Avatar Section */}
              <Box sx={{ textAlign: "center", minWidth: 200 }}>
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar src={avatarDataUrl} sx={{ width: 160, height: 160, borderRadius: "24px", bgcolor: "#1e293b", border: `2px solid ${vars.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>
                    {(name || "U")[0].toUpperCase()}
                  </Avatar>
                  <Tooltip title={t("Update Photo")}>
                    <IconButton onClick={openPicker} sx={{ position: "absolute", bottom: -10, right: -10, bgcolor: ACCENT, color: "#fff", "&:hover": { bgcolor: "#0284c7" }, boxShadow: "0 4px 15px rgba(0,0,0,0.5)", border: `2px solid ${vars.bgCard}` }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Typography sx={{ mt: 3, color: TEXT, fontWeight: 700, fontSize: 16 }}>{name || t("Update your name")}</Typography>
                <Typography sx={{ color: DIM, fontSize: 12 }}>{role.toUpperCase()} • {username}</Typography>
              </Box>

              {/* Form Grid */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 3 }}>
                  <TextField label={t("Full Name")} value={name} onChange={e => setName(e.target.value)} size="small" fullWidth sx={ctrlSx} />
                  <TextField label={t("Contact Number")} value={contact} onChange={e => setContact(e.target.value)} size="small" fullWidth sx={ctrlSx} />
                  <TextField label={t("User Login ID")} value={username} InputProps={{ readOnly: true }} size="small" fullWidth sx={ctrlSx} />
                  <TextField label={t("LDAP Identifier")} value={ldap} onChange={e => setLdap(e.target.value)} size="small" fullWidth sx={ctrlSx} placeholder="uid=...,ou=..." />
                  <TextField label={t("System Assigned Role")} value={role} InputProps={{ readOnly: true }} size="small" fullWidth sx={ctrlSx} />
                  <TextField label={t("Designation / Title")} value={designation} InputProps={{ readOnly: true }} size="small" fullWidth sx={ctrlSx} />
                  <Box sx={{ gridColumn: { sm: "span 2" } }}>
                    <TextField label={t("Email Address")} value={email} InputProps={{ readOnly: true }} size="small" fullWidth sx={ctrlSx} />
                  </Box>
                </Box>

                <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${vars.borderWeak}`, pt: 3 }}>
                  <Button onClick={handleSave} disabled={saving} variant="contained" sx={{ px: 5, py: 1.2, fontWeight: 800, fontSize: 13, textTransform: "none", bgcolor: ACCENT, borderRadius: "10px", boxShadow: `0 0 20px ${ACCENT}33`, "&:hover": { bgcolor: "#0284c7", boxShadow: `0 0 30px ${ACCENT}55` } }}>
                    {saving ? t("Saving Changes...") : t("Save Profile")}
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Card>
      </Box>

      {/* Modern Avatar Dialog */}
      <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: vars.bgCard, border: `1px solid ${vars.border}`, borderRadius: "16px" } }}>
        <DialogTitle sx={{ fontWeight: 800, color: TEXT }}>{t("Perfect Your Photo")}</DialogTitle>
        <DialogContent>
          <Box sx={{ position: "relative", height: 320, bgcolor: "#000", borderRadius: "12px", overflow: "hidden", border: `1px solid ${vars.borderWeak}` }}>
            {rawImage && <Cropper image={rawImage} crop={crop} zoom={zoom} aspect={1} cropShape="round" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} />}
          </Box>
          <Box sx={{ mt: 3, px: 1 }}>
            <Typography sx={{ color: TEXT, fontSize: 13, fontWeight: 700, mb: 1 }}>{t("Adjust Zoom")}</Typography>
            <Slider value={zoom} min={1} max={3} step={0.01} onChange={(_, v) => setZoom(v as number)} sx={{ color: ACCENT }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: `1px solid ${vars.borderWeak}` }}>
          <Button onClick={() => setAvatarDialogOpen(false)} sx={{ color: DIM, fontWeight: 700 }}>{t("Cancel")}</Button>
          <Button onClick={confirmCrop} variant="contained" sx={{ bgcolor: ACCENT, fontWeight: 800, borderRadius: "8px", px: 3 }}>{t("Apply Photo")}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
        <Alert severity={snack?.type} sx={{ borderRadius: "10px", fontWeight: 700 }}>{snack?.msg}</Alert>
      </Snackbar>

      <style>{`
          @keyframes sc-scan-line { 0% { left: -35%; } 100% { left: 100%; } }
          @keyframes sc-fog-breathe { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.65; transform: scale(1.1); } }
      `}</style>
    </MainLayout>
  );
}
