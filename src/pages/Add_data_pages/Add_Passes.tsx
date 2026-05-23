// src/pages/Add_data_pages/Add_Passes.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Card, Button, Typography, TextField, FormControl, MenuItem, Checkbox, ListItemText,
  Backdrop, CircularProgress, Stack, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider
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
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import PostAddIcon from "@mui/icons-material/PostAdd";
import StorageIcon from "@mui/icons-material/Storage";

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

const fmtDate = (d: Date | null) => d ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}` : "";
const toPassNo = (n: number) => `PRN-${String(n).padStart(3, "0")}`;

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

export default function AddPasses() {
  const { t } = useI18n();

  /* --- Bulk Upload --- */
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  /* --- Form State --- */
  const [passReqNo, setPassReqNo] = useState("PRN-...");
  const [date, setDate] = useState<Date | null>(null);
  const [satellite, setSatellite] = useState<string[]>([]);
  const [station, setStation] = useState("");
  const [orbitNo, setOrbitNo] = useState("");
  const [maxEl, setMaxEl] = useState("");
  const [bandCarrier, setBandCarrier] = useState("");
  const [aos, setAos] = useState("");
  const [los, setLos] = useState("");
  const [ops, setOps] = useState<string[]>([]);
  const [opsReq, setOpsReq] = useState<string[]>([]);
  const [opsSup, setOpsSup] = useState<string[]>([]);
  const [remarks, setRemarks] = useState("");
  const [passType, setPassType] = useState<"Normal" | "Emergency">("Normal");
  const [saving, setSaving] = useState(false);

  /* --- Options --- */
  const [satOptions, setSatOptions] = useState<string[]>([]);
  const [stationOptions, setStationOptions] = useState<string[]>([]);
  const [satByStation, setSatByStation] = useState<Record<string, string[]>>({});
  const [bandOptions, setBandOptions] = useState<string[]>([]);
  const [opOptions, setOpOptions] = useState<string[]>([]);
  const [reqOptions, setReqOptions] = useState<string[]>([]);
  const [supOptions, setSupOptions] = useState<string[]>([]);

  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captchaAction, setCaptchaAction] = useState<"upload" | "save" | null>(null);

  const suggestNextPassNo = useCallback(async () => {
    try {
      const json = await api.get<any>("/api/passes");
      const rows: any[] = Array.isArray(json) ? json : Array.isArray(json?.rows) ? json.rows : [];
      let maxNum = 0;
      for (const r of rows) {
        const raw = String(r.pass_req_no ?? "");
        const m = raw.match(/\d+/);
        const n = m ? parseInt(m[0], 10) : 0;
        if (!Number.isNaN(n)) maxNum = Math.max(maxNum, n);
      }
      setPassReqNo(toPassNo(maxNum + 1));
    } catch { setPassReqNo("PRN-001"); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [gs, sats, lic, ops_data, reqs, sups] = await Promise.all([
          api.get<any>("/api/ground-stations"),
          api.get<any>("/api/satellites"),
          api.get<any>("/api/licenses/export?format=json&shape=wide"),
          api.get<any>("/api/operations"),
          api.get<any>("/api/operation-requesters"),
          api.get<any>("/api/operation-supporters")
        ]);

        const gsArr = Array.isArray(gs?.data) ? gs.data : Array.isArray(gs) ? gs : [];
        setStationOptions(gsArr.map((r: any) => String(r.ground_station || r.station_name || r.name || "").trim()).filter(Boolean).sort());

        const satArr = Array.isArray(sats) ? sats : [];
        const map: Record<string, string[]> = {};
        satArr.forEach((r: any) => {
          const st = String(r.station_name ?? "").trim();
          const s = String(r.satellite_name ?? "").trim();
          if (st && s) { if (!map[st]) map[st] = []; if (!map[st].includes(s)) map[st].push(s); }
        });
        setSatByStation(map);

        const licArr = Array.isArray(lic?.data) ? lic.data : Array.isArray(lic) ? lic : [];
        const bands: string[] = [];
        licArr.forEach((x: any) => {
          (x.bands?.split("||") ?? []).forEach((c: string) => {
            const [b, u, d] = c.split("|");
            const fmt = `${b.trim()} | Uplink:${u?.trim()} | Downlink:${d?.trim()}`;
            if (!bands.includes(fmt)) bands.push(fmt);
          });
        });
        setBandOptions(bands);

        setOpOptions((Array.isArray(ops_data?.data) ? ops_data.data : []).map((r: any) => (r.operation_name || "").trim()).filter(Boolean));
        setReqOptions((Array.isArray(reqs?.data) ? reqs.data : []).map((r: any) => (r.requester_name || "").trim()).filter(Boolean));
        setSupOptions((Array.isArray(sups?.data) ? sups.data : []).map((r: any) => (r.supporter_name || "").trim()).filter(Boolean));

        suggestNextPassNo();
      } catch (e) { console.error(e); }
    })();
  }, [suggestNextPassNo]);

  const handleStationChange = (e: SelectChangeEvent) => {
    const st = e.target.value as string; setStation(st); setSatellite([]);
    const sats = st && satByStation[st] ? satByStation[st] : [];
    setSatOptions(sats); if (sats.length === 1) setSatellite([sats[0]]);
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData(); fd.append("file", file);
      await api.post("/api/passes/bulk", fd);
      alert(t("Bulk upload complete."));
      setFile(null); suggestNextPassNo();
    } catch (e) { alert(t("Bulk upload failed.")); } finally { setUploading(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        pass_req_no: passReqNo, date_text: fmtDate(date), satellite_name: satellite.join(", "),
        supporting_station: station, band_carrier: bandCarrier, orbit_no: orbitNo, max_el_deg: maxEl,
        aos_ut: aos, los_ut: los, operations: ops.join(", "), operations_requester: opsReq.join(", "),
        operations_supporter: opsSup.join(", "), schedule_status: "Scheduled", pass_status: "Pending",
        remarks, added_by: localStorage.getItem("username") || "Unknown", pass_type: passType,
      };
      await api.post("/api/passes", payload);
      alert(t("Pass saved successfully!"));
      window.location.reload();
    } catch (e: any) { alert(e?.message || t("Failed to save pass.")); } finally { setSaving(false); }
  };

  return (
    <MainLayout title="">
      <Backdrop open={uploading || saving} sx={{ color: "#fff", zIndex: 2000 }}><CircularProgress color="inherit" /></Backdrop>
      <CaptchaDialog open={captchaOpen} onCancel={() => setCaptchaOpen(false)} onOk={() => { setCaptchaOpen(false); if (captchaAction === "upload") handleUpload(); else handleSave(); }} />

      <Box sx={{ 
        px: 2, pt: 1, pb: 2, 
        bgcolor: vars.bgApp, 
        minHeight: `calc(100vh - ${TOPBAR_HEIGHT + 20}px)`, 
        display: "flex", flexDirection: "column", alignItems: "center", 
        position: "relative", overflowY: "auto", overflowX: "hidden" 
      }}>

        <Box sx={{ position: "absolute", inset: "-10%", background: `radial-gradient(circle at 10% 80%, rgba(14, 165, 233,0.1) 0%, transparent 40%)`, filter: "blur(70px)", pointerEvents: "none", zIndex: 0, animation: "sc-fog-breathe 25s ease-in-out infinite" }} />
        <Box sx={{ position: "absolute", top: 0, bottom: 0, width: "35%", background: "linear-gradient(90deg, transparent, rgba(14, 165, 233,0.04), transparent)", pointerEvents: "none", zIndex: 0, animation: "sc-scan-line 15s linear infinite" }} />

        {/* --- Bulk Upload Card --- */}
        <Card sx={{ ...PREMIUM_CARD_SX, width: "100%", maxWidth: 1000, p: 2.5, mb: 2, position: "relative" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <StorageIcon sx={{ color: ACCENT, opacity: 0.8 }} />
              <Typography sx={{ fontWeight: 800, fontSize: 16, color: TEXT }}>{t("Bulk Passes Upload")}</Typography>
            </Stack>
            <Button size="small" variant="text" onClick={() => {
              const a = document.createElement("a"); a.href = "/templates/passes_template.csv"; a.download = "passes_template.csv"; a.click();
            }} startIcon={<DownloadOutlinedIcon />} sx={{ textTransform: "none", color: ACCENT, fontWeight: 700 }}>{t("Template")}</Button>
          </Box>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center" sx={{ bgcolor: "rgba(255,255,255,0.03)", p: 2, borderRadius: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 11, color: DIM, mb: 1 }}>{t("Select a CSV file to batch upload multiple pass entries at once.")}</Typography>
              <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={e => setFile(e.target.files?.[0] || null)} />
              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" onClick={() => fileInputRef.current?.click()} sx={{ textTransform: "none", borderRadius: "10px", borderColor: vars.border, color: TEXT }}>{t("Choose File")}</Button>
                {file && <Chip label={file.name} onDelete={() => setFile(null)} size="small" sx={{ bgcolor: vars.bgCtrl, border: `1px solid ${vars.border}`, color: TEXT }} />}
              </Stack>
            </Box>
            <Button variant="contained" disabled={!file} onClick={() => { setCaptchaAction("upload"); setCaptchaOpen(true); }} startIcon={<CloudUploadOutlinedIcon />} sx={{ ...premiumBtnSx, height: 40, px: 4 }}>{t("Process Bulk Upload")}</Button>
          </Stack>
        </Card>

        {/* --- Main Form Card --- */}
        <Card sx={{ ...PREMIUM_CARD_SX, width: "100%", maxWidth: 1000, p: { xs: 2, sm: 3, md: 4 }, my: 1 }}>
          <AmbientLighting />
          <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)` }} />

          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, gap: 1 }}>
            <Box>
              <Typography sx={{ fontWeight: 900, fontSize: { xs: 20, sm: 24 }, color: TEXT, letterSpacing: "-0.01em" }}>{t("Add Pass Details")}</Typography>
              <Typography sx={{ fontSize: 12, color: DIM, mt: 0.2 }}>{t("Manually schedule a single pass event for specific mission support.")}</Typography>
            </Box>
            <PostAddIcon sx={{ fontSize: 32, color: ACCENT, opacity: 0.4 }} />
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Pass Req No *")}</Typography>
                <TextField fullWidth size="small" value={passReqNo} disabled sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Date(UT) *")}</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker value={date} onChange={setDate} slotProps={{ textField: { size: "small", sx: pickerSx, placeholder: "MM/DD/YYYY" } }} />
                </LocalizationProvider>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Supporting Station *")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select value={station} onChange={handleStationChange} displayEmpty renderValue={v => v || t("Select Station")}>
                    {stationOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Satellite Name *")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx} disabled={!station}>
                  <Select multiple value={satellite} onChange={e => setSatellite(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Satellites")}>
                    {satOptions.map(s => <MenuItem key={s} value={s}><Checkbox checked={satellite.indexOf(s) > -1} sx={{ p: 0.5 }} /><ListItemText primary={s} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Band / Carrier")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select value={bandCarrier} onChange={e => setBandCarrier(e.target.value)} displayEmpty renderValue={v => v || t("Select Band")}>
                    {bandOptions.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Orbit No *")}</Typography>
                <TextField fullWidth size="small" value={orbitNo} onChange={e => setOrbitNo(e.target.value)} placeholder="0" sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Max El (Deg) *")}</Typography>
                <TextField fullWidth size="small" value={maxEl} onChange={e => setMaxEl(e.target.value)} placeholder="0.0" sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("AOS (UT) *")}</Typography>
                <TextField fullWidth size="small" value={aos} onChange={e => setAos(e.target.value)} placeholder="00:00:00" sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("LOS (UT) *")}</Typography>
                <TextField fullWidth size="small" value={los} onChange={e => setLos(e.target.value)} placeholder="00:00:00" sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Operations")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select multiple value={ops} onChange={e => setOps(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Ops")}>
                    {opOptions.map(o => <MenuItem key={o} value={o}><Checkbox checked={ops.indexOf(o) > -1} sx={{ p: 0.5 }} /><ListItemText primary={o} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Ops Requester")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select multiple value={opsReq} onChange={e => setOpsReq(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Requester")}>
                    {reqOptions.map(r => <MenuItem key={r} value={r}><Checkbox checked={opsReq.indexOf(r) > -1} sx={{ p: 0.5 }} /><ListItemText primary={r} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Ops Supporter")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select multiple value={opsSup} onChange={e => setOpsSup(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Supporter")}>
                    {supOptions.map(s => <MenuItem key={s} value={s}><Checkbox checked={opsSup.indexOf(s) > -1} sx={{ p: 0.5 }} /><ListItemText primary={s} /></MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Remarks")}</Typography>
                <TextField fullWidth size="small" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder={t("Additional pass details...")} sx={glassCtrlSx} />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.8}>
                <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("Pass Type")}</Typography>
                <FormControl fullWidth size="small" sx={glassCtrlSx}>
                  <Select value={passType} onChange={e => setPassType(e.target.value as any)}>
                    <MenuItem value="Normal">{t("Normal")}</MenuItem>
                    <MenuItem value="Emergency">{t("Emergency")}</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" onClick={() => window.history.back()} sx={{ textTransform: "none", fontWeight: 700, color: DIM, borderColor: vars.border, borderRadius: "12px", px: 4 }}>{t("Cancel")}</Button>
            <Button variant="contained" disabled={!date || !satellite.length || !station || !orbitNo || !maxEl || !aos || !los} onClick={() => { setCaptchaAction("save"); setCaptchaOpen(true); }} sx={{ ...premiumBtnSx, px: 6 }}>{t("SAVE")}</Button>
          </Box>
        </Card>

        <Box sx={{ height: 40 }} />
      </Box>

      <style>{`
        @keyframes sc-scan-line { 0% { left: -35%; } 100% { left: 100%; } }
        @keyframes sc-fog-breathe { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.65; transform: scale(1.05); } }
      `}</style>
    </MainLayout>
  );
}
