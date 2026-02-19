import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Card,
  Button,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  IconButton,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { SelectChangeEvent } from "@mui/material/Select";

/* HTTP helper */
import api from "../../api/http";

/* theme bridge */
import { vars, sxPresets } from "../../ui/toast/themeBridge";

/* i18n */
import { useI18n } from "../../i18n";

/* ===================== THEME + SIZING ===================== */
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

const COLORS = { link: vars.accent, purple: "#7C57F2" };

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
    color: vars.text,
  },
  "& .MuiSelect-select, & .MuiSelect-select.MuiInputBase-inputSizeSmall": {
    height: `${CONTENT_H}px !important`,
    lineHeight: `${CONTENT_H}px`,
    padding: `0 ${HORIZ_PAD}px !important`,
    fontSize: `${FONT_PX}px`,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiSvgIcon-root": { color: vars.text, fontSize: 18 },
} as const;

/* interior fill */
const filledField = (t: any) => {
  const isDark = t.palette.mode === "dark";
  return {
    "& .MuiOutlinedInput-root": { backgroundColor: isDark ? "#232325" : "#fff" },
    "& .MuiOutlinedInput-root.Mui-focused": { backgroundColor: isDark ? "#232325" : "#fff" },
    "& .MuiSelect-select": { backgroundColor: isDark ? "#232325" : "#fff" },
    "& .MuiInputBase-input": {
      color: isDark ? vars.text : "#000",
      "::placeholder": { color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)", opacity: 1 },
    },
  };
};

const SCROLLER_SX = sxPresets.scroller;

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
  fontWeight: 600,
  color: vars.textDim,
  mb: 0.5,
  lineHeight: 1.2,
} as const;


const PICKER_POPPER_SX = {
  "& .MuiPaper-root": {
    bgcolor: vars.bgCard,
    color: vars.text,
    border: `1px solid ${vars.border}`,
    borderRadius: 1.25,
    boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
  },
  "& .MuiPickersCalendarHeader-label": { fontSize: 13, fontWeight: 700, color: vars.text },
  "& .MuiDayCalendar-weekDayLabel": { fontSize: 11, color: vars.textDim },
  "& .MuiPickersDay-root": {
    width: 28,
    height: 28,
    fontSize: 12,
    margin: "0 2px",
    color: vars.text,
    "&.Mui-selected": {
      bgcolor: `${vars.accent} !important`,
      color: "#fff",
    },
  },
  "& .MuiIconButton-root": { p: 0.5, color: vars.text },
} as const;

/* ============================== App logic ============================== */
const LICENSE_PREFIX = "LRN-";

type BandRow = {
  id: number;
  band: string;
  uplink: boolean;
  downlink: boolean;
};


type GroundStationRow = { id?: number; ground_station?: string; station_name?: string; name?: string; [k: string]: unknown };
type SatelliteRow = { satellite_name?: string; name?: string; satellite_id?: string; [k: string]: unknown };

const fmtDate = (d: Date | null) =>
  d ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}` : "";

/* ---------------- CAPTCHA ---------------- */
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
function svgDataUrl(svg: string) { return "data:image/svg+xml;utf8," + encodeURIComponent(svg); }

function CaptchaDialog({
  open, onCancel, onOk,
}: { open: boolean; onCancel: () => void; onOk: () => void; }) {
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
  useEffect(() => {
    if (open) {
      refresh();
      // focus inside the dialog to avoid aria-hidden focus warning
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      // KEY PARTS: keep mounted and don't restore focus to old trigger
      keepMounted
      disableRestoreFocus
      PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1 }}>
          <img src={svgDataUrl(cap.svg)} alt="captcha"
               style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${vars.border}` }} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Type the letters")}
              size="small"
              fullWidth
              autoFocus
              inputRef={inputRef}
              sx={(tMui) => ({ ...sxPresets.ctrl, "& .MuiOutlinedInput-root": { height: 36, background: tMui.palette.mode === "dark" ? "#232325" : "#fff" } })}
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

export default function AddLicense() {
  const { t } = useI18n();

  const [licenseReqNo, setLicenseReqNo] = useState("LRN-...");
const [satellitesSel, setSatellitesSel] = useState<string[]>([]);
  const [appliedDate, setAppliedDate] = useState<Date | null>(null);
  const [receiptDate, setReceiptDate] = useState<Date | null>(null);
  const [validity, setValidity] = useState<Date | null>(null);
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [stationsSel, setStationsSel] = useState<string[]>([]);
  const [stationOptions, setStationOptions] = useState<string[]>([]);
const [satOptions, setSatOptions] = useState<string[]>([]);
const [satByStation, setSatByStation] = useState<Record<string, string[]>>({});
const [rows, setRows] = useState<BandRow[]>([{ id: 1, band: "", uplink: false, downlink: false }]);


  const nextIdRef = useRef(2);

  const fetchStations = useCallback(async () => {
    try {
      const j = await api.get<any>("/api/ground-stations");
      const arr: (GroundStationRow | string)[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      setStationOptions(
        arr
          .map((r) =>
            typeof r === "string"
              ? r.trim()
              : String((r as any).ground_station ?? (r as any).station_name ?? (r as any).name ?? "").trim()
          )
          .filter(Boolean)
      );
    } catch {
      setStationOptions([]);
    }
  }, []);

const fetchSatellites = useCallback(async () => {
  try {
    const j = await api.get<any>("/api/satellites");
    const arr: any[] = Array.isArray(j) ? j : [];

    const map: Record<string, string[]> = {};

    arr.forEach((r) => {
      const station = String(r.station_name ?? "").trim();
      const sat = String(r.satellite_name ?? "").trim();
      if (!station || !sat) return;

      if (!map[station]) map[station] = [];
      if (!map[station].includes(sat)) map[station].push(sat);
    });

    console.log("SATELLITE MAP:", map);
    setSatByStation(map);
    setSatOptions([]);
  } catch {
    setSatByStation({});
    setSatOptions([]);
  }
}, []);


  const fetchNextLicenseNo = useCallback(async () => {
    try {
      const j: any = await api.get("/api/licenses?limit=1");
      const total = Number(j?.total ?? 0);
      setLicenseReqNo(`${LICENSE_PREFIX}${String(total + 1).padStart(3, "0")}`);
    } catch {
      setLicenseReqNo(`${LICENSE_PREFIX}${Math.floor(Math.random() * 900 + 100)}`);
    }
  }, []);

  useEffect(() => {
    fetchStations();
    fetchSatellites();
    fetchNextLicenseNo();
  }, [fetchStations, fetchSatellites, fetchNextLicenseNo]);

  const addRow = () =>
  setRows((r) => [...r, { id: nextIdRef.current++, band: "", uplink: false, downlink: false }]);

  const removeRow = (id: number) => setRows((r) => (r.length === 1 ? r : r.filter((x) => x.id !== id)));
const updateRow = (id: number, key: keyof BandRow, value: string | boolean) =>

  setRows((r) => r.map((x) => (x.id === id ? { ...x, [key]: value } : x)));


  const clearAll = () => {
  setSatellitesSel([]);
    setStationsSel([]);
    setAppliedDate(null);
    setReceiptDate(null);
    setValidity(null);
    setStatus("Pending");
    setRemarks("");
    setRows([{ id: 1, band: "", uplink: false, downlink: false }]);

    nextIdRef.current = 2;
  };

  const handleSave = async () => {
if (!satellitesSel.length || !stationsSel.length || !appliedDate) {
alert(t("Please fill Station, Satellite and Applied Date."));
      return;
    }
   const bands = rows
  .filter(r => r.band)
  .map(r => ({
    band_name: r.band,
   uplink: r.uplink ? "Yes" : "No",
downlink: r.downlink ? "Yes" : "No",
  }));



    const payload = {
      license_req_no: licenseReqNo,
  station_name: stationsSel.join(", "),
  satellite_name: satellitesSel.join(", "),
      applied_date: fmtDate(appliedDate),
      receipt_date: fmtDate(receiptDate),
      validity_expiry: fmtDate(validity),
      status,
      remarks,
      // added_by: "UI",
      bands,
    };

    try {
      setIsSaving(true);
      await api.post("/api/licenses", payload);
      alert(t("License saved successfully."));
      clearAll();
      await fetchNextLicenseNo();
    } catch (e: any) {
      alert(`${t("Failed to save license.")} ${e?.message || ""}`.trim());
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------- CAPTCHA wiring ---------- */
  type CaptchaAction = "addRow" | "save";
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captchaAction, setCaptchaAction] = useState<CaptchaAction | null>(null);
  const runAfterCaptcha = useCallback(async () => {
    if (captchaAction === "addRow") addRow();
    if (captchaAction === "save") await handleSave();
    setCaptchaAction(null);
  }, [captchaAction]);

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{
            ...CARD_SX,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
          }}
          elevation={0}
        >
          {/* Header */}
          <Box
            sx={{
              px: 1.25,
              py: 0.7,
              borderBottom: `1px solid ${vars.border}`,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: vars.bgCard,
              color: vars.text,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("Add License Details")}</Typography>
            <Box sx={{ ml: "auto" }}>
              <Button
                size="small"
                onClick={clearAll}
                sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}
              >
                {t("Clear")}
              </Button>
            </Box>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
            {/* Upper form */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
                columnGap: 2,
                rowGap: 2,
                "& .form-item": { display: "flex", flexDirection: "column" },
                "& .form-label": { ...LABEL_SX },
              }}
            >
              {/* Row 1 */}
              <Box className="form-item">
                <Typography className="form-label">{t("License Req No *")}</Typography>
                <TextField value={licenseReqNo} size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} InputProps={{ readOnly: true }} />
              </Box>
<Box className="form-item">
  <Typography className="form-label">{t("Station *")}</Typography>
  <FormControl fullWidth size="small">
    <Select<string[]>
      multiple
      value={stationsSel}
     onChange={(e: SelectChangeEvent<string[]>) => {
  const v = typeof e.target.value === "string"
    ? e.target.value.split(",")
    : e.target.value;

  setStationsSel(v);
  setSatellitesSel([]); // clear previous satellites

  // ONLY first station is used (as per your UI logic)
  const st = v[0];
  const sats = st && satByStation[st] ? satByStation[st] : [];
setSatOptions(sats);

if (sats.length === 1) {
  setSatellitesSel([sats[0]]);
}


}}
      displayEmpty
      renderValue={(selected) =>
        selected.length ? selected.join(", ") : t("Select Station")
      }
      sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
      MenuProps={menuTheme}
    >
      <MenuItem disabled value="">{t("Select Station")}</MenuItem>
      {stationOptions.map((s) => (
        <MenuItem key={s} value={s}>
          <Checkbox checked={stationsSel.indexOf(s) > -1} />
          <ListItemText primary={s} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

<Box className="form-item">
  <Typography className="form-label">{t("Satellite Name *")}</Typography>
  <FormControl fullWidth size="small">
    <Select<string[]>
  multiple
  value={satellitesSel}
  disabled={!stationsSel.length}
      onChange={(e: SelectChangeEvent<string[]>) => {
        const v = e.target.value;
        setSatellitesSel(typeof v === "string" ? v.split(",") : v);
      }}
      displayEmpty
      renderValue={(selected) =>
        selected.length ? selected.join(", ") : t("Select Satellite")
      }
      sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
      MenuProps={menuTheme}
    >
      <MenuItem disabled value="">
        {t("Select Satellite")}
      </MenuItem>

      {satOptions.map((s) => (
        <MenuItem key={s} value={s}>
          <Checkbox checked={satellitesSel.indexOf(s) > -1} />
          <ListItemText primary={s} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>


              {/* Row 2 */}
              <Box className="form-item">
                <Typography className="form-label">{t("Applied Date *")}</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    value={appliedDate}
                    onChange={(v) => setAppliedDate(v)}
                    format="MM/dd/yyyy"
                    slotProps={{
                      textField: { size: "small", sx: (tMui) => ({ ...controlSx, ...filledField(tMui) }), placeholder: t("MM/DD/YYYY") },
                      popper: { sx: PICKER_POPPER_SX },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              <Box className="form-item">
                <Typography className="form-label">{t("Receipt Date")}</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    value={receiptDate}
                    onChange={(v) => setReceiptDate(v)}
                    format="MM/dd/yyyy"
                    slotProps={{
                      textField: { size: "small", sx: (tMui) => ({ ...controlSx, ...filledField(tMui) }), placeholder: t("MM/DD/YYYY") },
                      popper: { sx: PICKER_POPPER_SX },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              <Box className="form-item">
                <Typography className="form-label">{t("Validity (Expiry)")}</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    value={validity}
                    onChange={(v) => setValidity(v)}
                    format="MM/dd/yyyy"
                    slotProps={{
                      textField: { size: "small", sx: (tMui) => ({ ...controlSx, ...filledField(tMui) }), placeholder: t("MM/DD/YYYY") },
                      popper: { sx: PICKER_POPPER_SX },
                    }}
                  />
                </LocalizationProvider>
              </Box>

              {/* Row 3 */}
              <Box className="form-item">
                <Typography className="form-label">{t("Status *")}</Typography>
                <FormControl fullWidth size="small">
                  <Select value={status} onChange={(e) => setStatus(e.target.value)} sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} MenuProps={menuTheme}>
                    {["Pending", "Approved", "Rejected", "Expired"].map((s) => (<MenuItem key={s} value={s}>{t(s)}</MenuItem>))}
                  </Select>
                </FormControl>
              </Box>

              <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
                <Typography className="form-label">{t("Remarks")}</Typography>
                <TextField value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={t("Enter remarks")} size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />
              </Box>
            </Box>

            {/* Bands */}
            {/* Bands (Antenna-style container) */}
<Box sx={{ mt: 2, border: `1px solid ${vars.border}`, borderRadius: 1.5, p: 1.25 }}>
  <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1, color: vars.text }}>
    {t("Bands/Carriers")}
  </Typography>

  {/* Input row (same as Antenna) */}
 <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-start" }}>

    {/* Select Band */}
    <FormControl size="small" sx={{ width: 180 }}>
      <Select
        value={rows[0].band}
        onChange={(e) => updateRow(rows[0].id, "band", e.target.value)}
        displayEmpty
        sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
        MenuProps={menuTheme}
      >
        <MenuItem disabled value="">{t("Select Bands/Carriers")}</MenuItem>
        {["UHF (300 MHz – 3 GHz)", "VHF (30 MHz – 300 MHz)", "L (1-2 GHz)", "S (2.0 – 2.3 GHz)", "C (4 – 8 GHz)", "X (8 – 12 GHz)", "Ku (12-18 GHz)", "Ka (26.5 to 40 GHz)"].map((b) => (
          <MenuItem key={b} value={b}>{t(b)}</MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Enter G/T */}
    {/* <TextField
      size="small"
      sx={(tMui) => ({ ...controlSx, ...filledField(tMui), width: 170 })}
      placeholder={t("Enter G/T")}
      value={rows[0].uplink}
      onChange={(e) => updateRow(rows[0].id, "uplink", e.target.value)}
    /> */}

    {/* Checkboxes */}
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Checkbox
  checked={rows[0].uplink}
  onChange={(e) => updateRow(rows[0].id, "uplink", e.target.checked)}
  sx={{ p: 0.5 }}
/>
<Typography sx={{ fontSize: 13 }}>{t("Uplink")}</Typography>

<Checkbox
  checked={rows[0].downlink}
  onChange={(e) => updateRow(rows[0].id, "downlink", e.target.checked)}
  sx={{ p: 0.5 }}
/>
<Typography sx={{ fontSize: 13 }}>{t("Downlink")}</Typography>

    </Box>

    {/* Clear and Add */}
   {/* Clear and Add – move to right */}
<Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
  <Button
    onClick={() => setRows([{ id: 1, band: "", uplink: false, downlink: false }])}

    size="small"
    sx={{
      textTransform: "none",
      color: vars.text,
      border: `1px solid ${vars.border}`,
      borderRadius: 1,
      px: 1.25,
      "&:hover": { background: vars.bgHover }
    }}
  >
    {t("Clear")}
  </Button>

<Button
onClick={() => {
  if (!rows[0].band) return;

  const filled = { ...rows[0], id: nextIdRef.current++ };
setRows((r) => [
  { id: 1, band: "", uplink: false, downlink: false },  // reset input
  ...r.slice(1),
  filled
]);

}}

  size="small"
  variant="contained"
  sx={{
    textTransform: "none",
    fontWeight: 700,
    bgcolor: "#DC2626",
    color: "#fff",
    "&:hover": { bgcolor: "#B91C1C" }
  }}
>
  {t("Add")}
</Button>

</Box>
</Box> 
  {/* No bands line */}
  <Box sx={{ mt: 1.25, pl: 0.5, color: vars.textDim, fontSize: 13 }}>
    {rows.length <= 1 && !rows[0].band ? t("No bands added.") : ""}
  </Box>

  {/* Existing added bands */}
  {rows.slice(1).map((r) => (

    <Box
      key={r.id}
      sx={{
        mt: 1,
        px: 1,
        py: 0.8,
        border: `1px solid ${vars.borderWeak}`,
        borderRadius: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography sx={{ fontSize: 13 }}>
  {r.band} {" | "}
  {r.uplink && "Uplink"} {r.uplink && r.downlink ? " | " : ""}
  {r.downlink && "Downlink"}
  {!(r.uplink || r.downlink) && "-"}
</Typography>

      <IconButton sx={{ color: vars.textDim }} onClick={() => removeRow(r.id)}>
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  ))}
</Box>

          

            {/* Save */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={(e) => { (e.currentTarget as HTMLButtonElement).blur(); setCaptchaAction("save"); setCaptchaOpen(true); }}
                disabled={isSaving}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: COLORS.purple, color: "#fff", "&:hover": { bgcolor: "#6b46f1" } }}
              >
                {isSaving ? t("Saving...") : t("Save")}
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* CAPTCHA Dialog */}
      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => { setCaptchaOpen(false); setCaptchaAction(null); }}
        onOk={async () => { setCaptchaOpen(false); await runAfterCaptcha(); }}
      />
    </MainLayout>
  );
}
