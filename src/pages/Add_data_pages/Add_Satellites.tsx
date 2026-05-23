// src/pages/Add_data_pages/Add_Satellites.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Card, Button, Typography, TextField, FormControl, MenuItem, Checkbox, ListItemText,
  Backdrop, CircularProgress, Stack, Grid, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MainLayout from "../../layouts/MainLayout";
import api from "../../api/http";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import { useI18n } from "../../i18n";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";

/* ─────────────────────── style constants ─────────────────────── */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;

const glassCtrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "36px", fontSize: 13, color: TEXT,
    backgroundColor: vars.bgCtrl, borderRadius: "12px",
    backdropFilter: "blur(10px)",
    "& fieldset": { borderColor: vars.border, transition: "all 0.2s" },
    "&:hover fieldset": { borderColor: `${ACCENT}66` },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1 }
  },
  "& .MuiInputBase-input": { padding: "0 14px", fontSize: 13, color: TEXT },
  "& .MuiInputBase-input::placeholder": { color: DIM, opacity: 0.7 },
  "& .MuiSelect-select": { padding: "0 14px !important", display: "flex", alignItems: "center", fontSize: 13, color: TEXT, height: "36px !important" },
  "& .MuiSvgIcon-root": { fontSize: 18, color: DIM }
} as const;

const premiumBtnSx = {
  textTransform: "none", fontWeight: 800, fontSize: 12.5, px: 3, height: 44,
  borderRadius: "12px", background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`,
  boxShadow: `0 8px 20px rgba(14, 165, 233, 0.25)`,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: `linear-gradient(135deg, #0ea5e9, #075985)`,
    transform: "translateY(-1px)",
    boxShadow: `0 10px 25px rgba(14, 165, 233, 0.35)`,
  },
  "&.Mui-disabled": { opacity: 0.5, color: "rgba(255,255,255,0.3)" }
} as const;

/* ---------------- CAPTCHA UI ---------------- */
type Captcha = { text: string; svg: string };
function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick(chars: string, n: number) { let s = ""; for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; }
function makeCaptcha(width = 220, height = 80, length = 5): Captcha {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const text = pick(alphabet, length);
  const charW = width / (length + 1);
  const chars = [...text].map((ch, i) => {
    const x = (i + 1) * charW + rand(-6, 6);
    const y = height / 2 + rand(-5, 5);
    const r = rand(-24, 24);
    const fontSize = rand(30, 38);
    return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle" transform="rotate(${r} ${x} ${y})" fill="white">${ch}</text>`;
  }).join("");
  const lines = Array.from({ length: 4 }).map(() => {
    const x1 = rand(0, width), y1 = rand(0, height);
    const x2 = rand(0, width), y2 = rand(0, height);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="0.3" stroke-width="1"/>`;
  }).join("");
  return {
    text,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#1a1a1d"/>${chars}${lines}</svg>`.trim()
  };
}
function svgDataUrl(svg: string) { return "data:image/svg+xml;utf8," + encodeURIComponent(svg); }

function CaptchaDialog({ open, onCancel, onOk }: { open: boolean; onCancel: () => void; onOk: () => void; }) {
  const { t } = useI18n();
  const [cap, setCap] = useState<Captcha>(() => makeCaptcha());
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const refresh = () => { setCap(makeCaptcha()); setInput(""); setError(""); };
  const submit = () => {
    if (input.trim().toLowerCase() === cap.text.toLowerCase()) { setError(""); onOk(); }
    else { setError(t("Incorrect code. Try again.")); refresh(); }
  };
  useEffect(() => { if (open) { refresh(); setTimeout(() => inputRef.current?.focus(), 0); } }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth keepMounted disableRestoreFocus PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}`, borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <img src={svgDataUrl(cap.svg)} alt="captcha" style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${vars.border}` }} />
          <Stack direction="row" spacing={1}>
            <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Type the letters")} size="small" fullWidth autoFocus inputRef={inputRef} sx={glassCtrlSx} />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: vars.border, color: TEXT, borderRadius: "12px" }}>{t("Refresh")}</Button>
          </Stack>
          {error && <Typography sx={{ color: "#f87171", fontSize: 12 }}>{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none", color: DIM }}>{t("Cancel")}</Button>
        <Button onClick={submit} variant="contained" sx={{ ...premiumBtnSx, height: 36 }}>{t("Verify")}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AddSatellites() {
  const { t } = useI18n();

  const [satId, setSatId] = useState("");
  const [satName, setSatName] = useState("");
  const [noradId, setNoradId] = useState("");
  const [ituName, setItuName] = useState("");
  const [stationsSel, setStationsSel] = useState<string[]>([]);
  const [polsSel, setPolsSel] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [stationsOpts, setStationsOpts] = useState<string[]>([]);
  const [polOpts] = useState<string[]>(["LHCP", "RHCP", "OMNI"]);

  const [captchaOpen, setCaptchaOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const gs = await api.get<any>("/api/ground-stations");
        const gsRows: any[] = Array.isArray(gs?.data) ? gs.data : Array.isArray(gs) ? gs : [];
        const stationNames = Array.from(new Set(gsRows.map((g) => String(g.ground_station ?? g.station_name ?? g.name ?? "").trim()).filter(Boolean))).sort();
        setStationsOpts(stationNames);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        satellite_id: satId.trim(),
        satellite_name: satName.trim(),
        station_name: stationsSel.join(", ").trim(),
        polarization: polsSel.join(", ").trim(),
        norad_id: noradId.trim() || null,
        itu_name: ituName.trim() || null,
      };
      await api.post("/api/satellites", payload);
      alert(t("Satellite saved successfully."));
      window.location.reload();
    } catch (e: any) { alert(e?.message || t("Failed to save satellite.")); } finally { setIsSaving(false); }
  };

  return (
    <MainLayout title="">
      <Backdrop open={isSaving} sx={{ color: "#fff", zIndex: 2000 }}><CircularProgress color="inherit" /></Backdrop>
      <CaptchaDialog open={captchaOpen} onCancel={() => setCaptchaOpen(false)} onOk={() => { setCaptchaOpen(false); handleSave(); }} />

      <Box sx={{ 
        px: 2, pt: 1, pb: 2, 
        bgcolor: vars.bgApp, 
        height: "100%",
        minHeight: 0,
        display: "flex", justifyContent: "center", alignItems: "center", 
        position: "relative", overflow: "hidden" 
      }}>

        <Box sx={{ position: "absolute", inset: "-10%", background: `radial-gradient(circle at 80% 20%, rgba(14, 165, 233,0.12) 0%, transparent 40%)`, filter: "blur(70px)", pointerEvents: "none", zIndex: 0, animation: "sc-fog-breathe 25s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", top: 0, bottom: 0, width: "35%", background: "linear-gradient(90deg, transparent, rgba(14, 165, 233,0.04), transparent)", pointerEvents: "none", zIndex: 0, animation: "sc-scan-line 15s linear infinite" }} />

        <Card sx={{ ...PREMIUM_CARD_SX, width: "100%", maxWidth: 840, p: { xs: 2, sm: 2.5, md: 4 } }}>
          <AmbientLighting />
          <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, gap: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 20, sm: 24 }, color: TEXT, letterSpacing: "-0.01em" }}>{t("Add Satellite Details")}</Typography>
              <Typography sx={{ fontSize: 12, color: DIM, mt: 0.2 }}>{t("Register new space assets and define their ground station connectivity.")}</Typography>
            </Box>
            <SatelliteAltIcon sx={{ fontSize: 32, color: ACCENT, opacity: 0.4 }} />
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Satellite ID *")}</Typography>
                <TextField fullWidth size="small" value={satId} onChange={e => setSatId(e.target.value)} placeholder={t("e.g. SAT-001")} sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Satellite Name *")}</Typography>
                <TextField fullWidth size="small" value={satName} onChange={e => setSatName(e.target.value)} placeholder={t("Enter full name")} sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Norad ID")}</Typography>
                <TextField fullWidth size="small" value={noradId} onChange={e => setNoradId(e.target.value)} placeholder={t("5-digit catalog ID")} sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("ITU Name")}</Typography>
                <TextField fullWidth size="small" value={ituName} onChange={e => setItuName(e.target.value)} placeholder={t("International ID")} sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Station *")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select multiple value={stationsSel} onChange={e => setStationsSel(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Stations")}>
                    {stationsOpts.map(s => <MenuItem key={s} value={s}><Checkbox checked={stationsSel.indexOf(s) > -1} sx={{ p: 0.5 }} /><ListItemText primary={s} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Polarization *")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select multiple value={polsSel} onChange={e => setPolsSel(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Pol")}>
                    {polOpts.map(p => <MenuItem key={p} value={p}><Checkbox checked={polsSel.indexOf(p) > -1} sx={{ p: 0.5 }} /><ListItemText primary={p} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => window.history.back()} sx={{ textTransform: "none", fontWeight: 700, color: DIM, borderColor: vars.border, borderRadius: "12px", px: 4 }}>{t("Cancel")}</Button>
            <Button variant="contained" disabled={!satId || !satName || !stationsSel.length || !polsSel.length} onClick={() => setCaptchaOpen(true)} sx={{ ...premiumBtnSx, px: 6 }}>{t("SAVE")}</Button>
          </Box>
        </Card>
      </Box>

      <style>{`
        @keyframes sc-scan-line { 0% { left: -35%; } 100% { left: 100%; } }
        @keyframes sc-fog-breathe { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.65; transform: scale(1.05); } }
      `}</style>
    </MainLayout>
  );
}
