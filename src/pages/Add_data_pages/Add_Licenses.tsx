// src/pages/Add_data_pages/Add_Licenses.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Button, Typography, TextField, FormControl, MenuItem, Checkbox, ListItemText,
  Backdrop, CircularProgress, Stack, Card, Grid, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import api from "../../api/http";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import { useI18n } from "../../i18n";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BadgeIcon from "@mui/icons-material/Badge";
import TuneIcon from "@mui/icons-material/Tune";

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

const pickerSx = {
  ...glassCtrlSx,
  "& .MuiInputAdornment-root .MuiIconButton-root": { p: 0.5, color: DIM },
  "& .MuiOutlinedInput-root": { paddingRight: "8px" }
};

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

type BandRow = { id: number; band: string; uplink: boolean; downlink: boolean };
const fmtDate = (d: Date | null) => d ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}` : "";

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

export default function AddLicense() {
  const { t } = useI18n();

  const [licenseReqNo, setLicenseReqNo] = useState("LRN-...");
  const [stationsSel, setStationsSel] = useState<string[]>([]);
  const [satellitesSel, setSatellitesSel] = useState<string[]>([]);
  const [appliedDate, setAppliedDate] = useState<Date | null>(null);
  const [receiptDate, setReceiptDate] = useState<Date | null>(null);
  const [validity, setValidity] = useState<Date | null>(null);
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [noLicenseRequired, setNoLicenseRequired] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [stationOptions, setStationOptions] = useState<string[]>([]);
  const [satByStation, setSatByStation] = useState<Record<string, string[]>>({});
  const [satOptions, setSatOptions] = useState<string[]>([]);
  const [rows, setRows] = useState<BandRow[]>([]);
  const [newBand, setNewBand] = useState<BandRow>({ id: 0, band: "", uplink: false, downlink: false });

  const [captchaOpen, setCaptchaOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [gs, sats, lics] = await Promise.all([api.get<any>("/api/ground-stations"), api.get<any>("/api/satellites"), api.get<any>("/api/licenses?limit=1")]);
        const gsArr = Array.isArray(gs?.data) ? gs.data : Array.isArray(gs) ? gs : [];
        setStationOptions(gsArr.map((r: any) => String(r.ground_station || r.station_name || r.name || "").trim()).filter(Boolean).sort());

        const satEntries = Array.isArray(sats) ? sats : [];
        const map: Record<string, string[]> = {};
        satEntries.forEach((r: any) => {
          const names = (r.station_name || "").split(",").map((s: string) => s.trim()).filter(Boolean);
          const sat = (r.satellite_name || "").trim();
          if (sat) names.forEach((st: string) => { if (!map[st]) map[st] = []; if (!map[st].includes(sat)) map[st].push(sat); });
        });
        setSatByStation(map);

        const total = Number(lics?.total ?? 0);
        setLicenseReqNo(`LRN-${String(total + 1).padStart(3, "0")}`);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const handleStationChange = (e: SelectChangeEvent<string[]>) => {
    const v = typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value;
    setStationsSel(v); setSatellitesSel([]);
    const first = v[0]; setSatOptions(first && satByStation[first] ? satByStation[first] : []);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const bands = rows.map(r => ({ band_name: r.band, uplink: r.uplink ? "Yes" : "No", downlink: r.downlink ? "Yes" : "No" }));
      const payload = {
        license_req_no: noLicenseRequired ? "NO-LICENSE" : licenseReqNo,
        station_name: stationsSel.join(", "), satellite_name: satellitesSel.join(", "),
        applied_date: noLicenseRequired ? "" : fmtDate(appliedDate),
        receipt_date: noLicenseRequired ? "" : fmtDate(receiptDate),
        validity_expiry: noLicenseRequired ? "" : fmtDate(validity),
        status: noLicenseRequired ? "No License Required" : status,
        remarks, bands: noLicenseRequired ? [] : bands
      };
      await api.post("/api/licenses", payload);
      alert(t("License saved successfully."));
      window.location.reload();
    } catch (e: any) { alert(e?.message || t("Failed to save license.")); } finally { setIsSaving(false); }
  };

  return (
    <MainLayout title="">
      <Backdrop open={isSaving} sx={{ color: "#fff", zIndex: 2000 }}><CircularProgress color="inherit" /></Backdrop>
      <CaptchaDialog open={captchaOpen} onCancel={() => setCaptchaOpen(false)} onOk={() => { setCaptchaOpen(false); handleSave(); }} />

      <Box sx={{ 
        px: 2, py: 0.5, 
        bgcolor: vars.bgApp, 
        height: `calc(100vh - ${TOPBAR_HEIGHT}px)`, 
        display: "flex", justifyContent: "center", alignItems: "center", 
        position: "relative", overflow: "hidden" 
      }}>

        {/* Ambient Effects */}
        <Box sx={{ position: "absolute", inset: "-10%", background: `radial-gradient(circle at 20% 30%, rgba(14, 165, 233,0.12) 0%, transparent 40%)`, filter: "blur(70px)", pointerEvents: "none", zIndex: 0, animation: "sc-fog-breathe 25s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", top: 0, bottom: 0, width: "35%", background: "linear-gradient(90deg, transparent, rgba(14, 165, 233,0.04), transparent)", pointerEvents: "none", zIndex: 0, animation: "sc-scan-line 15s linear infinite" }} />

        <Card sx={{ ...PREMIUM_CARD_SX, width: "100%", maxWidth: 840, p: { xs: 1.5, sm: 2, md: 2.5 }, my: 0.5 }}>
          <AmbientLighting />
          <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 1.5, gap: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 18, sm: 22 }, color: TEXT, letterSpacing: "-0.01em" }}>{t("Add License Details")}</Typography>
              <Typography sx={{ fontSize: 11, color: DIM, mt: 0.1 }}>{t("Configure regulatory permits and organizational link assignments.")}</Typography>
            </Box>
            <BadgeIcon sx={{ fontSize: 28, color: ACCENT, opacity: 0.4 }} />
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("License Req No *")}</Typography>
                <TextField fullWidth size="small" value={noLicenseRequired ? "NO-LICENSE" : licenseReqNo} disabled sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Operational Station *")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select multiple value={stationsSel} onChange={handleStationChange} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Stations")}>
                    {stationOptions.map(s => <MenuItem key={s} value={s}><Checkbox checked={stationsSel.indexOf(s) > -1} sx={{ p: 0.5 }} /><ListItemText primary={s} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Target Satellite *")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx} disabled={!stationsSel.length}>
                  <Select multiple value={satellitesSel} onChange={e => setSatellitesSel(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Satellites")}>
                    {satOptions.map(s => <MenuItem key={s} value={s}><Checkbox checked={satellitesSel.indexOf(s) > -1} sx={{ p: 0.5 }} /><ListItemText primary={s} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Licensing Status *")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx} disabled={noLicenseRequired}>
                  <Select value={noLicenseRequired ? "No License Required" : status} onChange={e => setStatus(e.target.value as string)}>
                    {["Pending", "Approved", "Rejected", "Expired"].map(s => <MenuItem key={s} value={s}>{t(s)}</MenuItem>)}
                    {noLicenseRequired && <MenuItem value="No License Required">{t("No License Required")}</MenuItem>}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.8}>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Applied Date *")}</Typography>
                  <DesktopDatePicker value={appliedDate} onChange={setAppliedDate} disabled={noLicenseRequired} slotProps={{ textField: { size: "small", sx: pickerSx, placeholder: "MM/DD/YYYY" } }} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.8}>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Receipt Date")}</Typography>
                  <DesktopDatePicker value={receiptDate} onChange={setReceiptDate} disabled={noLicenseRequired} slotProps={{ textField: { size: "small", sx: pickerSx, placeholder: "MM/DD/YYYY" } }} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={0.8}>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Validity Period")}</Typography>
                  <DesktopDatePicker value={validity} onChange={setValidity} disabled={noLicenseRequired} slotProps={{ textField: { size: "small", sx: pickerSx, placeholder: "MM/DD/YYYY" } }} />
                </Stack>
              </Grid>
            </LocalizationProvider>

            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ height: "100%", pt: 1.5 }}>
                <Checkbox size="small" checked={noLicenseRequired} onChange={e => { setNoLicenseRequired(e.target.checked); if (e.target.checked) setStatus("No License Required"); else setStatus("Pending"); }} sx={{ color: DIM, "&.Mui-checked": { color: ACCENT } }} />
                <Typography sx={{ fontSize: 12, fontWeight: 800, color: TEXT }}>{t("Mark as [No License Required]")}</Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Internal Remarks")}</Typography>
                <TextField fullWidth size="small" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder={t("Add operational notes...")} sx={glassCtrlSx} />
              </Stack>
            </Grid>
          </Grid>

          {/* Bands Sub-Terminal */}
          <Box sx={{ mt: 4.5, p: 2, borderRadius: "12px", bgcolor: "rgba(0,0,0,0.2)", border: `1px solid ${vars.borderWeak}`, position: "relative",
            opacity: noLicenseRequired ? 0.3 : 1, transition: "all 0.4s"
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
              <TuneIcon sx={{ fontSize: 16, color: ACCENT, opacity: 0.8 }} />
              <Typography sx={{ fontWeight: 800, fontSize: 13, color: TEXT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("RF Band Configuration")}</Typography>
            </Box>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} sx={{ mb: 1.5 }}>
              <FormControl size="small" sx={{ flex: 1, minWidth: 200, ...glassCtrlSx }}>
                <Select value={newBand.band} onChange={e => setNewBand({ ...newBand, band: e.target.value })} displayEmpty renderValue={v => v || t("Select Spectrum Band")}>
                  {["UHF (300 MHz – 3 GHz)", "VHF (30 MHz – 300 MHz)", "L (1-2 GHz)", "S (2.0 – 2.3 GHz)", "C (4 – 8 GHz)", "X (8 – 12 GHz)", "Ku (12-18 GHz)", "Ka (26.5 to 40 GHz)"].map(b => <MenuItem key={b} value={b}>{t(b)}</MenuItem>)}
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} sx={{ bgcolor: "rgba(255,255,255,0.03)", px: 1.5, height: 34, borderRadius: "10px", alignItems: "center", border: "1px solid rgba(255,255,255,0.04)" }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Checkbox size="small" checked={newBand.uplink} onChange={e => setNewBand({ ...newBand, uplink: e.target.checked })} sx={{ p: 0.2, color: DIM }} />
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: TEXT }}>UPLINK</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Checkbox size="small" checked={newBand.downlink} onChange={e => setNewBand({ ...newBand, downlink: e.target.checked })} sx={{ p: 0.2, color: DIM }} />
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: TEXT }}>DOWNLINK</Typography>
                </Stack>
              </Stack>

              <Button variant="contained" disabled={!newBand.band} onClick={() => { setRows([...rows, { ...newBand, id: Date.now() }]); setNewBand({ id: 0, band: "", uplink: false, downlink: false }); }} sx={{ ...premiumBtnSx, height: 34, whiteSpace: "nowrap" }}><AddRoundedIcon sx={{ fontSize: 17, mr: 0.5 }} /> {t("Add Band")}</Button>
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
              {rows.map(r => (
                <Box key={r.id} sx={{ display: "flex", alignItems: "center", px: 1.5, py: 0.6, bgcolor: vars.bgCtrl, borderRadius: "10px", border: `1px solid ${vars.border}`, transition: "all 0.2s", "&:hover": { borderColor: ACCENT } }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: TEXT }}>{r.band}</Typography>
                    <Typography sx={{ fontSize: 9, color: DIM, textTransform: "uppercase", fontWeight: 800 }}>{r.uplink ? "Uplink" : ""} {r.uplink && r.downlink ? "•" : ""} {r.downlink ? "Downlink" : ""}</Typography>
                  </Box>
                  <Button size="small" onClick={() => setRows(rows.filter(x => x.id !== r.id))} sx={{ minWidth: 28, p: 0, color: vars.danger, borderRadius: "6px" }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></Button>
                </Box>
              ))}
              {rows.length === 0 && <Grid size={{ xs: 12 }}><Typography sx={{ fontSize: 11, color: DIM, textAlign: "center", py: 0.5, fontStyle: "italic" }}>{t("No RF bands partitioned yet.")}</Typography></Grid>}
            </Box>
          </Box>

          <Button variant="contained" disabled={!stationsSel.length || !satellitesSel.length || (!noLicenseRequired && !appliedDate)} onClick={() => setCaptchaOpen(true)} sx={{ ...premiumBtnSx, mt: 2.5, width: { xs: "100%", sm: "auto" }, alignSelf: { xs: "stretch", sm: "flex-end" } }}>{t("SAVE")}</Button>
        </Card>
      </Box>

      <style>{`
        @keyframes sc-scan-line { 0% { left: -35%; } 100% { left: 100%; } }
        @keyframes sc-fog-breathe { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.65; transform: scale(1.05); } }
      `}</style>
    </MainLayout>
  );
}
