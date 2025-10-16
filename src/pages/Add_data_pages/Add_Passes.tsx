// src/pages/Add_data_pages/Add_Passes.tsx
import React from "react";
import {
  Box,
  Card,
  Button,
  Chip,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { SelectChangeEvent } from "@mui/material/Select";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import api from "../../api/http";

// ✅ theme tokens/presets (match Dashboard)
import { vars, sxPresets } from "../../ui/toast/themeBridge";
import { useI18n } from "../../i18n";

/* ---------- Shared UI (theme-aware, sizes unchanged) ---------- */
const CARD_SX = {
  bgcolor: vars.bgCard,
  color: vars.text,
  border: `1px solid ${vars.border}`,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  backgroundImage: "none",
  boxShadow: "none",
} as const;

// leave brand colors as-is (exactly like your screenshots)
const COLORS = { link: "#7CA7FF", green: "#16a34a", purple: "#7C57F2" };

// compact control look, but skin from CSS vars (same height/spacing)
const FIELD_H = 36;
const CONTENT_H = 32;
const FONT_PX = 13;
const HORIZ_PAD = 8;

const controlSx = {
  ...sxPresets.ctrl,
  borderRadius: 1,
  "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
    height: `${FIELD_H}px`,
    minHeight: `${FIELD_H}px`,
    alignItems: "center",
  },
  "& .MuiOutlinedInput-input, & .MuiInputBase-input": {
    height: `${CONTENT_H}px`,
    lineHeight: `${CONTENT_H}px`,
    padding: `0 ${HORIZ_PAD}px`,
    fontSize: `${FONT_PX}px`,
  },
  "& .MuiSelect-select, & .MuiSelect-select.MuiInputBase-inputSizeSmall": {
    height: `${CONTENT_H}px !important`,
    lineHeight: `${CONTENT_H}px`,
    padding: `0 ${HORIZ_PAD}px !important`,
    fontSize: `${FONT_PX}px`,
    display: "flex",
    alignItems: "center",
  },
};

/** Theme-aware interior fill (dark: #232325, light: #fff) + text color */
const filledField = (t: any) => {
  const isDark = t.palette.mode === "dark";
  return {
    "& .MuiOutlinedInput-root": {
      backgroundColor: isDark ? "#232325" : "#fff",
    },
    "& .MuiOutlinedInput-root.Mui-focused": {
      backgroundColor: isDark ? "#232325" : "#fff",
    },
    "& .MuiSelect-select": {
      backgroundColor: isDark ? "#232325" : "#fff",
    },
    "& .MuiInputBase-input": {
      color: isDark ? vars.text : "#000",
      "::placeholder": {
        color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
        opacity: 1,
      },
    },
  };
};

const SCROLLER_SX = { ...sxPresets.scroller };

const menuTheme = {
  PaperProps: {
    elevation: 0,
    sx: {
      bgcolor: vars.bgCard,
      color: vars.text,
      border: `1px solid ${vars.border}`,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: vars.bgHover },
      "& .MuiMenuItem-root:hover": { bgcolor: vars.bgHover },
    },
  },
};

const LABEL_SX = {
  fontSize: 12,
  fontWeight: 500,
  color: vars.textDim,
  mb: 0.5,
  lineHeight: 1.2,
} as const;

const fmtDate = (d: Date | null) => {
  if (!d) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

// format 7 -> "PRN-007"
const toPassNo = (n: number) => `PRN-${String(n).padStart(3, "0")}`;

/* ---------------- CAPTCHA (same generator/dialog used elsewhere) ---------------- */
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
    return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="700"
              text-anchor="middle" dominant-baseline="middle"
              transform="rotate(${r} ${x} ${y})">${ch}</text>`;
  }).join("");
  const lines = Array.from({ length: 4 }).map(() => {
    const x1 = rand(0, width), y1 = rand(0, height);
    const x2 = rand(0, width), y2 = rand(0, height);
    const op = rand(0.25, 0.45).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="${op}" stroke-width="${rand(1,2)}"/>`;
  }).join("");
  const dots = Array.from({ length: 35 }).map(() => {
    const x = rand(0, width), y = rand(0, height);
    const op = rand(0.15, 0.35).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${rand(0.8,2.2)}" fill="white" fill-opacity="${op}"/>`;
  }).join("");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="wavy">
      <feTurbulence type="fractalNoise" baseFrequency="${rand(0.9,1.3)/100}" numOctaves="2" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${rand(8,14)}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#1a1a1d"/>
      <stop offset="100%" stop-color="#121214"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g filter="url(#wavy)" fill="#e7e7ff">${chars}</g>
  <g>${lines}${dots}</g>
</svg>`.trim();
  return { text, svg };
}
const svgDataUrl = (svg: string) => "data:image/svg+xml;utf8," + encodeURIComponent(svg);

function CaptchaDialog({
  open, onCancel, onOk,
}: { open: boolean; onCancel: () => void; onOk: () => void; }) {
  const { t } = useI18n();
  const [cap, setCap] = React.useState<Captcha>(() => makeCaptcha());
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState("");
  const refresh = () => { setCap(makeCaptcha()); setInput(""); setError(""); };
  const submit = () => {
    if (input.trim().toLowerCase() === cap.text.toLowerCase()) onOk();
    else { setError(t("Incorrect code. Try again.")); refresh(); }
  };
  React.useEffect(() => { if (open) refresh(); }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1 }}>
          <img
            src={svgDataUrl(cap.svg)}
            alt="captcha"
            style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${vars.border}` }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Type the letters")}
              size="small"
              fullWidth
              sx={(tMui) => ({
                ...sxPresets.ctrl,
                "& .MuiOutlinedInput-root": { height: 36, background: tMui.palette.mode === "dark" ? "#232325" : "#fff" },
              })}
            />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: vars.border }}>
              {t("Refresh")}
            </Button>
          </Box>
          {error && <Box sx={{ color: "#f87171", fontSize: 12, mt: 0.25 }}>{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>{t("Cancel")}</Button>
        <Button onClick={submit} variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" } }}>
          {t("Verify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
/* ---------------- end CAPTCHA ---------------- */

export default function AddPasses() {
  const { t } = useI18n();

  /* -------- Top card (bulk upload) state -------- */
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleSelectFile = () => fileInputRef.current?.click();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const clearTop = () => setFile(null);

  const handleDownloadTemplate = () => {
    const a = document.createElement("a");
    a.href = "/templates/passes_template.csv";
    a.download = "passes_template.csv";
    a.click();
  };

  const handleUpload = async () => {
    if (!file) return alert(t("Please select a CSV file first."));
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return alert(t("Only .csv files are supported."));
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      await api.post("/api/passes/bulk", fd);
      alert(t("Bulk upload complete."));
      clearTop();
      await suggestNextPassNo();
    } catch (e) {
      console.error(e);
      alert(t("Bulk upload failed."));
    } finally {
      setUploading(false);
    }
  };

  /* -------- Bottom card (form) state -------- */
  const [passReqNo, setPassReqNo] = React.useState("REQ-...");

  const [date, setDate] = React.useState<Date | null>(null);
  const [satellite, setSatellite] = React.useState("");
  const [station, setStation] = React.useState("");
  const [orbitNo, setOrbitNo] = React.useState("");
  const [maxEl, setMaxEl] = React.useState("");
  const [aos, setAos] = React.useState("");
  const [los, setLos] = React.useState("");
  const [ops, setOps] = React.useState<string[]>([]);
  const [opsReq, setOpsReq] = React.useState<string[]>([]);
  const [opsSup, setOpsSup] = React.useState<string[]>([]);
  const [remarks, setRemarks] = React.useState("");
  const passStatus = t("Pending"); // readonly (translated display)
  const [saving, setSaving] = React.useState(false);
  const [passType, setPassType] = React.useState<"Normal" | "Emergency">("Normal");
  const [sched] = React.useState(t("Scheduled")); // read-only display

  // compute next PRN
  const suggestNextPassNo = React.useCallback(async () => {
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
    } catch {
      setPassReqNo("PRN-001");
    }
  }, []);

  React.useEffect(() => {
    suggestNextPassNo();
  }, [suggestNextPassNo]);

  /* -------- Options -------- */
  const [satOptions, setSatOptions] = React.useState<string[]>([]);
  const [stationOptions, setStationOptions] = React.useState<string[]>([]);
  const [opOptions, setOpOptions] = React.useState<string[]>([]);
  const [reqOptions, setReqOptions] = React.useState<string[]>([]);
  const [supOptions, setSupOptions] = React.useState<string[]>([]);

  const fetchSatellites = React.useCallback(async () => {
    try {
      const j = await api.get<any>("/api/satellites");
      const arr = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
      setSatOptions(
        arr
          .map((r: any) => (r.satellite_name || r.name || r.satellite || "").toString().trim())
          .filter(Boolean)
      );
    } catch {
      setSatOptions([]);
    }
  }, []);

  const fetchStations = React.useCallback(async () => {
    try {
      const j = await api.get<any>("/api/ground-stations");
      const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      setStationOptions(
        arr
          .map((r: any) => (r.ground_station || r.station_name || r.name || "").toString().trim())
          .filter(Boolean)
      );
    } catch {
      setStationOptions([]);
    }
  }, []);

  const fetchOperations = React.useCallback(async () => {
    try {
      const j = await api.get<any>("/api/operations");
      const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      setOpOptions(arr.map((r: any) => (r.operation_name || "").toString().trim()).filter(Boolean));
    } catch {
      setOpOptions([]);
    }
  }, []);

  const fetchRequesters = React.useCallback(async () => {
    try {
      const j = await api.get<any>("/api/operation-requesters");
      const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      setReqOptions(arr.map((r: any) => (r.requester_name || "").toString().trim()).filter(Boolean));
    } catch {
      setReqOptions([]);
    }
  }, []);

  const fetchSupporters = React.useCallback(async () => {
    try {
      const j = await api.get<any>("/api/operation-supporters");
      const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      setSupOptions(arr.map((r: any) => (r.supporter_name || "").toString().trim()).filter(Boolean));
    } catch {
      setSupOptions([]);
    }
  }, []);

  React.useEffect(() => {
    fetchSatellites();
    fetchStations();
    fetchOperations();
    fetchRequesters();
    fetchSupporters();
  }, [fetchSatellites, fetchStations, fetchOperations, fetchRequesters, fetchSupporters]);

  const clearForm = () => {
    setDate(null);
    setSatellite("");
    setStation("");
    setOrbitNo("");
    setMaxEl("");
    setAos("");
    setLos("");
    setOps([]);
    setOpsReq([]);
    setOpsSup([]);
    setRemarks("");
    setPassType("Normal");
  };

  const handleSave = async () => {
    if (!date || !satellite || !station || !orbitNo || !maxEl || !aos || !los) {
      alert(t("Please fill all required fields."));
      return;
    }
    const payload = {
      pass_req_no: passReqNo,
      date_text: fmtDate(date),
      satellite_name: satellite,
      supporting_station: station,
      orbit_no: orbitNo,
      max_el_deg: maxEl,
      aos_ut: aos,
      los_ut: los,
      operations: ops.join(", "),
      operations_requester: opsReq.join(", "),
      operations_supporter: opsSup.join(", "),
      schedule_status: "Scheduled", // store canonical; UI shows translated
      pass_status: "Pending", // store canonical; UI shows translated
      remarks,
      added_by: "UI",
      pass_type: passType,
    };

    try {
      setSaving(true);
      try {
        await api.post("/api/passes", payload);
      } catch (e: any) {
        if (String(e?.message || "").toLowerCase().includes("409")) {
          alert(t("Pass Req No must be unique."));
          return;
        }
        alert(e?.message || t("Failed to save pass."));
        return;
      }
      alert(t("Pass saved successfully!"));
      clearForm();
      await suggestNextPassNo();
    } catch (e) {
      console.error(e);
      alert(t("Network/API error while saving."));
    } finally {
      setSaving(false);
    }
  };

  const toArray = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    return typeof v === "string" ? v.split(",") : (v as string[]);
  };

  /* ---------- CAPTCHA wiring ---------- */
  type CaptchaAction = "upload" | "save";
  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [captchaAction, setCaptchaAction] = React.useState<CaptchaAction | null>(null);
  const runAfterCaptcha = React.useCallback(async () => {
    if (captchaAction === "upload") await handleUpload();
    if (captchaAction === "save") await handleSave();
    setCaptchaAction(null);
  }, [captchaAction]);

  return (
    <MainLayout title="">
      {/* Page Backdrop while uploading large CSVs */}
      <Backdrop open={uploading} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>{t("Uploading… this may take a while for large files.")}</Typography>
        </Box>
      </Backdrop>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Box
          sx={{
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "grid",
            gridTemplateRows: "auto 1fr",
            gap: 1.5,
            ...SCROLLER_SX,
          }}
        >
          {/* ---------- TOP: Bulk upload ---------- */}
          <Card sx={CARD_SX} elevation={0}>
            <Box
              sx={{
                px: 1.25,
                py: 0.6,
                borderBottom: `1px solid ${vars.border}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: vars.bgCard,
                backgroundImage: "none",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: COLORS.link }}>
                {t("Bulk Passes Upload")}
              </Typography>
              <Box sx={{ ml: "auto" }}>
                <Button
                  onClick={clearTop}
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 700, color: COLORS.link, px: 1, minWidth: 0 }}
                >
                  {t("Clear")}
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                p: 1,
                pl: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                flexWrap: { xs: "wrap", lg: "nowrap" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: 12, color: vars.text }}>
                  {t("Step 1: Download the given template")}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={handleDownloadTemplate}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: COLORS.green,
                    color: "#fff",
                    "&:hover": { bgcolor: "#12853d" },
                  }}
                >
                  {t("Download Template")}
                </Button>

                <Typography sx={{ fontSize: 12, ml: { lg: 2 }, color: vars.text }}>
                  {t("Step 2: Fill it & Upload")}
                </Typography>

                <input ref={fileInputRef} type="file" accept=".csv" hidden onChange={handleFileChange} />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSelectFile}
                  disabled={uploading}
                  sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                >
                  {t("Select File")}
                </Button>

                {file && (
                  <Chip
                    label={file.name}
                    onDelete={uploading ? undefined : clearTop}
                    sx={(tMui) => ({
                      bgcolor: tMui.palette.mode === "dark" ? "#232325" : "#fff",
                      color: tMui.palette.mode === "dark" ? vars.text : "#000",
                      border: `1px solid ${vars.border}`,
                      ".MuiChip-deleteIcon": { color: vars.textDim },
                    })}
                  />
                )}
              </Box>

              <Button
                variant="contained"
                size="medium"
                startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
                disabled={!file || uploading}
                onClick={() => { setCaptchaAction("upload"); setCaptchaOpen(true); }}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: COLORS.purple,
                  "&:hover": { bgcolor: "#6b46f1" },
                  "&.Mui-disabled": {
                    bgcolor: vars.bgCtrl,
                    color: vars.textDim,
                    border: `1px solid ${vars.border}`,
                    boxShadow: "none",
                    opacity: 1,
                  },
                }}
              >
                {uploading ? t("Uploading...") : t("Upload")}
              </Button>
            </Box>
          </Card>

          {/* ---------- BOTTOM: Add Pass form ---------- */}
          <Card sx={CARD_SX} elevation={0}>
            <Box
              sx={{
                px: 1.25,
                py: 0.7,
                borderBottom: `1px solid ${vars.border}`,
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: vars.bgCard,
                backgroundImage: "none",
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: vars.text }}>
                {t("Add Pass Details")}
              </Typography>
                            <Box sx={{ ml: "auto" }}>
                <Button
                  size="small"
                  onClick={clearForm}
                  sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}
                >
                  {t("Clear")}
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
                  columnGap: 2,
                  rowGap: 2,
                  "& .form-item": { display: "flex", flexDirection: "column" },
                }}
              >
                {/* Row 1 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Pass Req No *")}</Typography>
                  <TextField
                    value={passReqNo}
                    InputProps={{ readOnly: true }}
                    size="small"
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                  />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Date(UT) *")}</Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                      value={date}
                      onChange={(newValue: Date | null) => setDate(newValue)}
                      format="MM/dd/yyyy"
                      slotProps={{
                        textField: {
                          size: "small",
                          placeholder: t("MM/DD/YY"),
                          sx: (tMui) => ({ ...controlSx, ...filledField(tMui) }),
                        },
                        popper: {
                          sx: {
                            "& .MuiPaper-root": {
                              bgcolor: vars.bgCard,
                              color: vars.text,
                              border: `1px solid ${vars.border}`,
                            },
                            "& .MuiPickersDay-root": { color: vars.text },
                            "& .MuiPickersDay-root.Mui-selected": {
                              bgcolor: `${vars.accent} !important`,
                              color: "#fff",
                            },
                            "& .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-label": {
                              color: vars.text,
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Satellite Name *")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={satellite}
                      onChange={(e) => setSatellite(e.target.value)}
                      displayEmpty
                      sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                      MenuProps={menuTheme}
                    >
                      <MenuItem disabled value="">
                        {t("Select Satellite")}
                      </MenuItem>
                      {satOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 2 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Supporting Station *")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      displayEmpty
                      sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                      MenuProps={menuTheme}
                    >
                      <MenuItem disabled value="">
                        {t("Select Station")}
                      </MenuItem>
                      {stationOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Orbit No *")}</Typography>
                  <TextField
                    value={orbitNo}
                    onChange={(e) => setOrbitNo(e.target.value)}
                    placeholder={t("Enter Orbit No")}
                    size="small"
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                  />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Max (El) Deg *")}</Typography>
                  <TextField
                    value={maxEl}
                    onChange={(e) => setMaxEl(e.target.value)}
                    placeholder={t("Enter Max El (Deg)")}
                    size="small"
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                  />
                </Box>

                {/* Row 3 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("AOS (UT) *")}</Typography>
                  <TextField
                    value={aos}
                    onChange={(e) => setAos(e.target.value)}
                    placeholder="HH:MM:SS"
                    size="small"
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                    inputProps={{ inputMode: "numeric" }}
                  />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("LOS (UT) *")}</Typography>
                  <TextField
                    value={los}
                    onChange={(e) => setLos(e.target.value)}
                    placeholder="HH:MM:SS"
                    size="small"
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                    inputProps={{ inputMode: "numeric" }}
                  />
                </Box>

                {/* Row 4 — multi-selects */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Operations")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select<string[]>
                      multiple
                      value={ops}
                      onChange={(e) => setOps(toArray(e))}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as string[]).length ? (selected as string[]).join(", ") : t("Select Operations")
                      }
                      sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                      MenuProps={menuTheme}
                    >
                      <MenuItem disabled value="">
                        {t("Select Operations")}
                      </MenuItem>
                      {opOptions.map((o) => (
                        <MenuItem key={o} value={o}>
                          <Checkbox checked={ops.indexOf(o) > -1} sx={{ p: 0.5, mr: 1, color: vars.textDim }} />
                          <ListItemText primary={o} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Operations Requester")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select<string[]>
                      multiple
                      value={opsReq}
                      onChange={(e) => setOpsReq(toArray(e))}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as string[]).length ? (selected as string[]).join(", ") : t("Select Requester")
                      }
                      sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                      MenuProps={menuTheme}
                    >
                      <MenuItem disabled value="">
                        {t("Select Requester")}
                      </MenuItem>
                      {reqOptions.map((r) => (
                        <MenuItem key={r} value={r}>
                          <Checkbox checked={opsReq.indexOf(r) > -1} sx={{ p: 0.5, mr: 1, color: vars.textDim }} />
                          <ListItemText primary={r} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("TTL Service provider")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select<string[]>
                      multiple
                      value={opsSup}
                      onChange={(e) => setOpsSup(toArray(e))}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as string[]).length ? (selected as string[]).join(", ") : t("Select Supporter")
                      }
                      sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                      MenuProps={menuTheme}
                    >
                      <MenuItem disabled value="">
                        {t("Select Supporter")}
                      </MenuItem>
                      {supOptions.map((s) => (
                        <MenuItem key={s} value={s}>
                          <Checkbox checked={opsSup.indexOf(s) > -1} sx={{ p: 0.5, mr: 1, color: vars.textDim }} />
                          <ListItemText primary={s} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Pass Type *")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={passType}
                      onChange={(e) => setPassType(e.target.value as "Normal" | "Emergency")}
                      displayEmpty
                      sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                      MenuProps={menuTheme}
                    >
                      <MenuItem disabled value="">
                        {t("Select Pass Type")}
                      </MenuItem>
                      <MenuItem value="Normal">{t("Normal")}</MenuItem>
                      <MenuItem value="Emergency">{t("Emergency")}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Schedule Status *")}</Typography>
                  <TextField
                    value={sched}
                    InputProps={{ readOnly: true }}
                    size="small"
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                  />
                </Box>

                {/* Row 5 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Pass Status")}</Typography>
                  <TextField
                    value={passStatus}
                    InputProps={{ readOnly: true }}
                    size="small"
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                  />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Remarks")}</Typography>
                  <TextField
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={t("Enter remarks")}
                    size="small"
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                  />
                </Box>
              </Box>

              {/* Footer actions UNDER the grid */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={() => { setCaptchaAction("save"); setCaptchaOpen(true); }}
                  disabled={saving}
                  sx={{
                    "&&": {
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: COLORS.purple,
                      color: "#fff !important",
                    },
                    "&:hover": { bgcolor: "#6b46f1", color: "#fff !important" },
                    "& .MuiSvgIcon-root": { color: "#fff !important" },
                    "&.Mui-disabled": {
                      bgcolor: vars.bgCtrl,
                      color: `${vars.textDim} !important`,
                      border: `1px solid ${vars.border}`,
                      boxShadow: "none",
                      opacity: 1,
                      "& .MuiSvgIcon-root": { color: `${vars.textDim} !important` },
                    },
                  }}
                >
                  <span style={{ color: "#fff" }}>{saving ? t("Saving...") : t("Save")}</span>
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* CAPTCHA Dialog (gates Upload + Save) */}
      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => { setCaptchaOpen(false); setCaptchaAction(null); }}
        onOk={async () => { setCaptchaOpen(false); await runAfterCaptcha(); }}
      />
    </MainLayout>
  );
}

