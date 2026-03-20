// src/pages/Gsoperations.tsx
import * as React from "react";
import {
  Box,
  Card,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  TablePagination,
  Divider,
  FormControl,
  MenuItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { useAuth } from "../auth";
import toast from "react-hot-toast";


/* dialogs */
import UpdateGroundStationDialog from "../components/UpdateGroundStationDialog";
import type { GroundStation as GSDialogRow } from "../components/UpdateGroundStationDialog";
import UpdateSatellitePolarizationDialog from "../components/UpdateSatellitePolarizationDialog";
import type { SatPolRow as SatPolDialogRow } from "../components/UpdateSatellitePolarizationDialog";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import UpdateAntennaDialog from "../components/UpdateAntennaDialog";
import type { AntennaDialogRow } from "../components/UpdateAntennaDialog";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

/* i18n */
import { useI18n } from "../i18n";

/* ✅ theme bridge */
import { vars, sxPresets } from "../ui/toast/themeBridge";
import type { Theme } from "@mui/material/styles";

/* ---------- API endpoints ---------- */
const GS_API = "/api/ground-stations";
const OPS_API = "/api/operations";
const REQ_API = "/api/operation-requesters";
const SUP_API = "/api/operation-supporters";
const POL_API = "/api/polarizations";
const ANT_API = "/api/antennas";

const ANT_REQ_API = "/api/antenna-requests";

// const isAdmin = () =>
//   sessionStorage.getItem("pmgt_role") === "admin";
/* ---------- Shared card + controls (theme-aware) ---------- */
const CARD_SX = {
  ...sxPresets.card,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  backgroundImage: "none",
} as const;

// IAM-like helpers (light-only tweaks)
const theadBg = (t: Theme) => (t.palette.mode === "dark" ? "#1D1D20" : "#464b4e");

const theadText = (t: Theme) => (t.palette.mode === "light" ? "#fff" : vars.text);
const bodyText = (t: Theme) => (t.palette.mode === "light" ? "#000" : vars.text);

// Accent + pill helpers (match IAM light/dark behavior)
const GREEN = "#7CFF8D";
const GREEN_BORDER_DARK = "rgba(124,255,141,0.18)";
const SELECTED_BG_DARK = "#1D1D20";
const SELECTED_BG_LIGHT = "#FFFFFF";

const getSelectedBg   = (t: Theme) => (t.palette.mode === "dark" ? SELECTED_BG_DARK  : SELECTED_BG_LIGHT);
const getSelectedBord = (t: Theme) => (t.palette.mode === "dark" ? GREEN_BORDER_DARK : GREEN);
const getHoverBg      = (t: Theme) => (t.palette.mode === "dark" ? vars.bgHover : "#FFFFFF");

// Reusable pill style (same as IAM)
const pillSx = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: 13,
  px: 2,
  height: 32,
  lineHeight: "32px",
  borderRadius: 999,
  color: vars.textDim,
  bgcolor: "transparent",
  "&.Mui-selected": {
    color: GREEN,
    bgcolor: (t: Theme) => getSelectedBg(t),
    border:  (t: Theme) => `1px solid ${getSelectedBord(t)}`,
    boxShadow: (t: Theme) =>
      t.palette.mode === "dark"
        ? "inset 0 0 0 1px rgba(124,255,141,0.06)"
        : "inset 0 0 0 1px rgba(124,255,141,0.12)"
  },
  "&.Mui-selected:hover": {
    bgcolor: (t: Theme) => getHoverBg(t),
  },
} as const;

const COLORS = { link: vars.accent, purple: "#7C57F2" };

const CTRL_H = 36;
const CTRL_FONT = 13;
const controlSx = {
  ...sxPresets.ctrl,
  borderRadius: 1,
  "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
    height: `${CTRL_H}px`,
    minHeight: `${CTRL_H}px`,
    alignItems: "center",
  },
  "& .MuiInputBase-input, & .MuiOutlinedInput-input": {
    height: `${CTRL_H - 2}px`,
    padding: "0 10px",
    fontSize: CTRL_FONT,
    lineHeight: `${CTRL_H - 2}px`,
    display: "flex",
    alignItems: "center",
    color: (t: any) => bodyText(t),
  },
  "& .MuiSelect-select": {
    height: `${CTRL_H - 2}px !important`,
    lineHeight: `${CTRL_H - 2}px`,
    padding: "0 10px !important",
    display: "flex",
    alignItems: "center",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: vars.border,
  },
  "& .MuiSvgIcon-root": { color: vars.text },
} as const;

/** interior fill + placeholder/text (same as Add Passes / Licenses / Satellites) */
const filledField = (t: any) => {
  const isDark = t.palette.mode === "dark";
  return {
    "& .MuiOutlinedInput-root": { backgroundColor: isDark ? "#232325" : "#fff" },
    "& .MuiOutlinedInput-root.Mui-focused": {
      backgroundColor: isDark ? "#232325" : "#fff",
    },
    "& .MuiSelect-select": { backgroundColor: isDark ? "#232325" : "#fff" },
    "& .MuiInputBase-input": {
      color: isDark ? vars.text : "#000",
      "::placeholder": {
        color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
        opacity: 1,
      },
    },
  };
};

const PRINT_BTN_SX = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: 13,
  height: 36,
  px: 1.75,
  borderRadius: 1.5,
  color: vars.text,
  bgcolor: vars.bgCtrl,
  border: `1px solid ${vars.border}`,
  boxShadow: "none",
  "&:hover": { bgcolor: vars.bgHover, borderColor: vars.border },
  "& .MuiButton-startIcon": { mr: 1, "& > *:first-of-type": { fontSize: 18 } },
};

const darkMenu = {
  PaperProps: {
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

const SCROLLER_SX = sxPresets.scroller;

/* ---------- Helpers ---------- */
const PRIMARY = "#7C57F2";
const BAND_OPTIONS = ["UHF (300 MHz – 3 GHz)", "VHF (30 MHz – 300 MHz)", "L (1-2 GHz)", "S (2.0 – 2.3 GHz)", "C (4 – 8 GHz)", "X (8 – 12 GHz)", "Ku (12-18 GHz)", "Ka (26.5 to 40 GHz)"];
const POL_OPTIONS = ["RHCP", "LHCP", "Linear"];
const TRACK_MODE_OPTIONS = [
  "TLE",
  "Auto Track",
  "Program",
  "Step Track",
  "Others",
];


/* ---------- Types ---------- */
type TabKey =
  | "stations"
  | "operations"
  | "polarization"
  | "antennas";
type ApiGS = {
  id: number;
  supporting_partner: string;
  ground_station: string;
  added_by?: string;
  antenna?: string;
  antenna_type?: string;
  antenna_name?: string;
  // latitude?: string | number;
  // longitude?: string | number;
  // station_latitude?: string | number;
  // station_longitude?: string | number;
};
type GSRow = {
  id: number;
  partner: string;
  station: string;
  addedBy: string;
  antenna?: string;
  // lat?: string;
  // lng?: string;
};
type PolRow = { id: number; sat: string; pol: string };
type AntBand = {
  band: string;
  gt: string;
  uplink: boolean;
  downlink: boolean;
};

// type AntGT = { band: string; gt: string };
type AntennaRow = {
  id: number;
  __requestId?: number;

  type: string;
  location: string;   // ✅ ADD
  size_m: string;
  eirp_dbw: string;
  tx_polarization: string;
  rx_polarization: string; // ✅ ADD
  travel_range: string;
tracking_velocity: string;
tracking_acceleration: string;
tracking_modes: string;
  bands: AntBand[];
    status?: "PENDING" | "APPROVED" | "REJECTED";

  // gts: AntGT[];
};

/* ---------- API mappers ---------- */
const apiGsToUi = (g: ApiGS): GSRow => ({
  id: g.id,
  partner: g.supporting_partner,
  station: g.ground_station,
  addedBy: g.added_by ?? "Admin",
  antenna: `${(g.antenna_name as any) ?? (g.antenna_type as any) ?? (g.antenna as any) ?? ""} / ${g.ground_station ?? "-"}`,
});

const apiPolToUi = (p: { id: number; satellite_name: string; polarization: string }): PolRow => ({
  id: p.id,
  sat: p.satellite_name,
  pol: p.polarization,
});

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
  const [cap, setCap] = React.useState<Captcha>(() => makeCaptcha());
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState("");
  const refresh = () => { setCap(makeCaptcha()); setInput(""); setError(""); };
  const submit = () => {
    if (input.trim().toLowerCase() === cap.text.toLowerCase()) { setError(""); onOk(); }
    else { setError(t("Incorrect code. Try again.")); refresh(); }
  };
  React.useEffect(() => { if (open) refresh(); }, [open]);

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1 }}>
          <img src={svgDataUrl(cap.svg)} alt="captcha"
               style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${vars.border}` }} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Type the letters")} size="small" fullWidth
              sx={(tMUI) => ({ ...sxPresets.ctrl, "& .MuiOutlinedInput-root": { height: 36, background: (tMUI as any).palette.mode === "dark" ? "#232325" : "#fff" } })}/>
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

/* ---------- Simple list panel ---------- */
function ListPanel({
  title,
  items,
  targetTab,
}: {
  title: string;
  items: string[];
  targetTab: "requesters" | "operations" | "supporters";
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        border: `1px solid ${vars.border}`,
        borderRadius: 1.25,
        overflow: "hidden",
        bgcolor: vars.bgCard,
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          px: 1.25,
          py: 0.75,
          borderBottom: `1px solid ${vars.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 16, color: vars.text }}>
          {title}
        </Typography>
        <Box sx={{ ml: "auto" }}>
          <Button
            size="small"
            onClick={() => navigate(`/Operations?tab=${targetTab}`)}
            sx={{
              color: vars.accent,
              textTransform: "none",
              fontWeight: 700,
              px: 0.5,
              minWidth: 0,
            }}
          >
            {t("View all >")}
          </Button>
        </Box>
      </Box>
      <Box sx={{ p: 1 }}>
        {items.map((name, i) => (
          <Box
            key={name + i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: (t: Theme) => (t.palette.mode === "dark" ? "#1D1D20" : vars.bgApp),
              border: `1px solid ${vars.borderWeak}`,
              borderRadius: 1,
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Typography
              sx={{ fontWeight: 600, fontSize: 14, flex: 1, color: vars.text }}
            >
              {name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ======================================================= */
export default function Gsoperations() {
  const { user } = useAuth();
const u = user as any;

const role = String(
  u?.role ||
  u?.roleName ||
  sessionStorage.getItem("pmgt_role") ||
  ""
).toLowerCase();

const roleType = String(
  u?.roleType ||
  sessionStorage.getItem("pmgt_role_type") ||
  ""
).toLowerCase();


const username = String(u?.username || "").toLowerCase();

const isAdmin =
  role === "admin" ||
  role === "superadmin" ||
  roleType === "admin" ||
  username === "isroadmin";

const isEditor =
  roleType === "editor" ||
  roleType === "write" ||
  role === "editor" ||
  role === "write";

const canEditAntenna = isAdmin || isEditor;

// const ANT_GRID = isAdmin ? ANT_COLS_ADMIN : ANT_COLS_USER;
  const { t } = useI18n();

  const [tab, setTab] = React.useState<TabKey>("stations");
  const handleTab = (_: React.SyntheticEvent, next: TabKey | null) =>
    next && setTab(next);

  /* ---------------- Ground Stations ---------------- */
  const [gsInner, setGsInner] = React.useState<"add" | "view">("add");
  const [partner, setPartner] = React.useState("");
  // const [gsName, setGsName] = React.useState("");
  const [antennaSel, setAntennaSel] = React.useState<string>("");
  const [selectedAntenna, setSelectedAntenna] =
  React.useState<AntennaRow | null>(null);

  // const [lat, setLat] = React.useState("");
  // const [lng, setLng] = React.useState("");
  const [rows, setRows] = React.useState<GSRow[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [antennaOpts, setAntennaOpts] = React.useState<string[]>([]);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<GSDialogRow | null>(null);

  /* ---------------- Operations ---------------- */
  const [opName, setOpName] = React.useState("");
  const [reqName, setReqName] = React.useState("");
  const [supName, setSupName] = React.useState("");
  const [opsList, setOpsList] = React.useState<string[]>([]);
  const [requesters, setRequesters] = React.useState<string[]>([]);
  const [supporters, setSupporters] = React.useState<string[]>([]);

  /* ---------------- Satellite Polarization ---------------- */
  const [satName, setSatName] = React.useState("");
  const [pol, setPol] = React.useState("");
  const [polRows, setPolRows] = React.useState<PolRow[]>([]);
  const [polPage, setPolPage] = React.useState(0);
  const [polRowsPerPage, setPolRowsPerPage] = React.useState(20);
  const [polEditOpen, setPolEditOpen] = React.useState(false);
  const [polEditRow, setPolEditRow] = React.useState<SatPolDialogRow | null>(null);
  const satOptions = React.useMemo(
    () => Array.from(new Set(polRows.map((r) => r.sat))).sort(),
    [polRows]
  );

  /* ---------------- Antennas ---------------- */
  const [antInner, setAntInner] = React.useState<"add" | "view">("add");
  const [antType, setAntType] = React.useState("");
  const [antLocation, setAntLocation] = React.useState(""); // ✅ ADD HERE

  const [antSize, setAntSize] = React.useState("");
  const [antEIRP, setAntEIRP] = React.useState("");
  const [antTxPol, setAntTxPol] = React.useState<string[]>([]);
const [antRxPol, setAntRxPol] = React.useState<string[]>([]);


const [azFrom, setAzFrom] = React.useState("");
const [azTo, setAzTo] = React.useState("");
const [elFrom, setElFrom] = React.useState("");
const [elTo, setElTo] = React.useState("");
  const [antTrackVel, setAntTrackVel] = React.useState("");
  const [antTrackAcc, setAntTrackAcc] = React.useState("");
  const [antTrackModes, setAntTrackModes] = React.useState("");
  const [curBand, setCurBand] = React.useState("");
  // const [curUplink, setCurUplink] = React.useState("");
  // const [curDownlink, setCurDownlink] = React.useState("");
  const [curGT, setCurGT] = React.useState("");
const [isUplink, setIsUplink] = React.useState(false);
const [isDownlink, setIsDownlink] = React.useState(false);

  const [bandRows, setBandRows] = React.useState<AntBand[]>([]);
  // const [gtBand, setGtBand] = React.useState("");
  // const [gtVal, setGtVal] = React.useState("");
  // const [gts, setGts] = React.useState<AntGT[]>([]);
  const [antRows, setAntRows] = React.useState<AntennaRow[]>([]);
  const [selectedAntennas, setSelectedAntennas] = React.useState<number[]>([]);

  const [antPage, setAntPage] = React.useState(0);
  const [antRpp, setAntRpp] = React.useState(20);
  const [antEditOpen, setAntEditOpen] = React.useState(false);
  const [antEditRow, setAntEditRow] = React.useState<AntennaDialogRow | null>(
    null
  );


const ANT_COLS_ADMIN =
"44px 52px 120px 100px 80px 100px 120px 120px 150px 100px 100px 120px 120px 250px 300px";

const ANT_COLS_USER =
"44px 52px 120px 100px 80px 100px 120px 120px 150px 100px 100px 120px 250px 160px";


const ANT_GRID = isAdmin ? ANT_COLS_ADMIN : ANT_COLS_USER;





  /* ---------------- Shared header actions ---------------- */
  const clearAll = () => {
    setPartner("");
    // setGsName("");
    setAntennaSel("");
    // setLat("");
    // setLng("");
setSelectedAntenna(null);

    setOpName("");
    setReqName("");
    setSupName("");

    setSatName("");
    setPol("");

    setAntType("");
    setAntLocation("");
    setAntSize("");
    setAntEIRP("");
    setAntTxPol([]);
    setAntRxPol([]);
    
setAzFrom("");
setAzTo("");
setElFrom("");
setElTo("");    setAntTrackVel("");
    setAntTrackAcc("");
    setAntTrackModes("");
  setCurBand("");
setCurGT("");
setIsUplink(false);
setIsDownlink(false);
setBandRows([]);

  };

  /* ---------- PRINT ---------- */
  const handlePrintStations = React.useCallback(() => {
    const headers = [
      t("Sr No"),
      t("Supporting Partner"),
      t("Ground Station"),
      t("Antenna"),
      t("Latitude"),
      t("Longitude"),
    ];
    const rowsHtml = rows
      .map((r, i) => {
        const cells = [
          String(i + 1),
          r.partner || "-",
          r.station || "-",
          r.antenna || "-",
          // r.lat || "-",
          // r.lng || "-",
        ]
          .map(
            (c) =>
              `<td style="border:1px solid #aaa;padding:6px 8px;font:12px/1.3 system-ui,Segoe UI,Roboto">${c}</td>`
          )
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");

    const html = `<!doctype html><html><head><meta charset="utf-8" />
<style>
@media print { @page { size: A4 portrait; margin: 16mm; } }
body { background:#fff; color:#000; font:14px/1.4 system-ui,Segoe UI,Roboto; }
h1 { margin:0 0 12px; font-size:18px; }
table { border-collapse: collapse; width:100%; }
thead th { border:1px solid #aaa; background:#f2f2f2; padding:6px 8px; text-align:left; font-size:12px; }
tbody tr:nth-child(even) td { background:#fafafa; }
</style>
</head><body>
<h1>${t("Ground Station Details")}</h1>
<table>
<thead><tr>${headers
      .map(
        (h) =>
          `<th style="border:1px solid #aaa;padding:6px 8px;font:12px/1.3 system-ui,Segoe UI,Roboto">${h}</th>`
      )
      .join("")}</tr></thead>
<tbody>${
      rowsHtml ||
      `<tr><td colspan="${headers.length}" style="border:1px solid #aaa;padding:10px">${t("No data")}</td></tr>`
    }</tbody>
</table>
<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300);}</script>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  }, [rows, t]);

  /* ================= Loaders ================= */
  const loadStations = React.useCallback(async () => {
    try {
      const json = await api.get<any>(
        `${GS_API}?limit=1000&sort_by=id&sort_order=asc`
      );
      const data: ApiGS[] = json?.data ?? [];
      setRows(data.map(apiGsToUi));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to load ground stations"));
    }
  }, [t]);
  const loadPols = React.useCallback(async () => {
    try {
      const json = await api.get<any>(
        `${POL_API}?limit=1000&sort_by=id&sort_order=asc`
      );
      setPolRows((json?.data ?? []).map(apiPolToUi));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to load satellite polarizations"));
    }
  }, [t]);
  const loadOperations = React.useCallback(async () => {
    try {
      const json = await api.get<any>(
        `${OPS_API}?limit=1000&sort_by=operation_name&sort_order=asc`
      );
      setOpsList((json?.data ?? []).map((d: any) => d.operation_name));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to load operations"));
    }
  }, [t]);
  const loadRequesters = React.useCallback(async () => {
    try {
      const json = await api.get<any>(
        `${REQ_API}?limit=1000&sort_by=requester_name&sort_order=asc`
      );
      setRequesters((json?.data ?? []).map((d: any) => d.requester_name));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to load requesters"));
    }
  }, [t]);

const loadSupporters = React.useCallback(async () => {
  try {
    const json = await api.get<any>(
      `${SUP_API}?limit=1000&sort_by=supporter_name&sort_order=asc`
    );
    setSupporters((json?.data ?? []).map((d: any) => d.supporter_name));
  } catch (e: any) {
    console.error(e);
    alert(e?.message || t("Failed to load TTC Service Providers"));
  }
}, [t]);


const loadAntennas = React.useCallback(async () => {
  try {
    /* 1️⃣ Load APPROVED antennas */
   const antRes = await api.get<any>(
  `${ANT_API}?limit=1000&sort_by=id&sort_order=asc&_=${Date.now()}`
);

   const approved: AntennaRow[] = (antRes?.data ?? []).map((a: any) => {

  // ✅ define BEFORE return
  const gtMap = new Map(
    (a.receive_gt || []).map((g: any) => [
      g.band,
      String(g.gt ?? "")
    ])
  );

  // ✅ now return object
  return {
    id: a.id,
    type: String(a.antenna_type ?? ""),
    location: String(a.location ?? "-"),
    size_m: String(a.size_m ?? ""),
    eirp_dbw: String(a.eirp_dbw ?? ""),
    tx_polarization: String(a.tx_polarization ?? ""),
    rx_polarization: String(a.rx_polarization ?? ""),
    travel_range: String(a.travel_range ?? ""),
    tracking_velocity: String(a.tracking_velocity ?? ""),
    tracking_acceleration: String(a.tracking_acceleration ?? ""),
    tracking_modes: String(a.tracking_modes ?? ""),

    bands: Array.isArray(a.bands)
      ? a.bands.map((b: any) => ({
          band: b.band,
          gt: gtMap.get(b.band) || "",
          uplink: Boolean(b.uplink),
          downlink: Boolean(b.downlink),
        }))
      : [],

    status: "APPROVED",
  };
});


    /* 2️⃣ Load PENDING antennas → ADMIN ONLY */
    let pendingRows: AntennaRow[] = []; // ✅ DEFINE OUTSIDE

if (isAdmin) {
  try {
   const reqRes = await api.get<any>(
  `${ANT_REQ_API}?status=pending&_=${Date.now()}`
);
  const reqRows = Array.isArray(reqRes?.data)
  ? reqRes.data
  : Array.isArray(reqRes)
  ? reqRes
  : [];

console.log("🧪 FULL PENDING RESPONSE:", reqRes);
console.log("🧪 PENDING ARRAY:", reqRows);
console.log("🧪 FIRST ROW:", reqRows?.[0]);
console.log("🧪 payload:", reqRows?.[0]?.payload);
console.log("🧪 payload_data:", reqRows?.[0]?.payload_data);

    pendingRows = reqRows.map((r: any) => {
const p =
  r.payload_data && Object.keys(r.payload_data).length
    ? r.payload_data
    : r.payload && Object.keys(r.payload).length
    ? r.payload
    : {
        antenna_type: r.antenna_type,
        location: r.location,
        size_m: r.size_m,
        eirp_dbw: r.eirp_dbw,
        tx_polarization: r.tx_polarization,
        rx_polarization: r.rx_polarization,
        travel_range: r.travel_range,
        tracking_velocity: r.tracking_velocity,
        tracking_acceleration: r.tracking_acceleration,
        tracking_modes: r.tracking_modes,
        bands: r.bands,
      };

  
return {
  id: Number(r.request_id),
__requestId: Number(r.request_id),

  type: String(p.antenna_type ?? "-"),
  location: String(p.location ?? "-"),
  size_m: String(p.size_m ?? "-"),
  eirp_dbw: String(p.eirp_dbw ?? "-"),
  tx_polarization: String(p.tx_polarization ?? "-"),
  rx_polarization: String(p.rx_polarization ?? "-"),
  travel_range: String(p.travel_range ?? "-"),

  tracking_velocity: String(p.tracking_velocity ?? "-"),
  tracking_acceleration: String(p.tracking_acceleration ?? "-"),
  tracking_modes: String(p.tracking_modes ?? "-"),

  bands: Array.isArray(p.bands)
    ? p.bands.map((b: any) => ({
        band: b.band ?? "-",
        gt: b.gt ?? "",
        uplink: Boolean(b.uplink),
        downlink: Boolean(b.downlink),
      }))
    : [],

  status: String(r.status || "PENDING"), // ✅ FIXED
};

    });

  } catch (e) {
    console.warn("Pending antenna load failed", e);
  }
}


    /* 3️⃣ Merge + set */
const merged = isAdmin
  ? [...pendingRows, ...approved].sort((a, b) => {
      if (a.status === "PENDING") return -1;
      if (b.status === "PENDING") return 1;
      return 0;
    })
  : approved;

    setAntRows(() => merged);
setTimeout(() => setAntPage(0), 0);
console.log("✅ FINAL ANT ROWS:", merged);

    /* 4️⃣ Dropdown only APPROVED */
setAntennaOpts(
  Array.from(
    new Set(
      approved
        .filter(a => a.type && a.location)
        .map(a => `${a.type.trim()} / ${a.location.trim()}`)
    )
  )
);
  } catch (e: any) {
    console.error("Load antennas failed:", e);
  }
}, [isAdmin]);



  //  const [pendingAnts, setPendingAnts] = React.useState<any[]>([]);

// const loadPendingAntennas = React.useCallback(async () => {
//   if (!isAdmin()) return;
//   try {
//     const res = await api.get(`${ANT_REQ_API}?status=PENDING`);
//     setPendingAnts(res?.data ?? []);
//   } catch (e) {
//     console.error(e);
//   }
// }, []);
  React.useEffect(() => {
  if (!user) return;

  loadStations();
  loadPols();
  loadOperations();
  loadRequesters();
  loadSupporters();
  loadAntennas();
}, [
  user,
    loadStations,
    loadPols,
    loadOperations,
    loadRequesters,
    loadSupporters,
    loadAntennas,
    // loadPendingAntennas,
  ]);

  /* ================= Actions ================= */
 const handleAddStation = async () => {
  if (!partner || !antennaSel) {
    alert("Please select TTC Service Provider and Antenna / Location");
    return;
  }

  const [antennaName, location] = antennaSel
    .split("/")
    .map(v => v.trim());

  const payload = {
    supporting_partner: partner.trim(),
    ground_station: location,
    antenna: antennaName,
    added_by: user?.username || "system",
  };

  try {
const created: ApiGS = await api.post(GS_API, payload, {
  headers: {
    "x-module-name": "gs_operations",
    "x-page-name": "/operations",
  },
});

    setRows(prev => [...prev, apiGsToUi(created)]);
    setPartner("");
    setAntennaSel("");
    setSelectedAntenna(null);

    alert("Ground Station added successfully ✅");
    setGsInner("view");
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to add Ground Station ❌");
  }
};




    // const latNum = Number(String(lat).replace(",", ".").trim());
    // const lngNum = Number(String(lng).replace(",", ".").trim());
    // if (Number.isFinite(latNum)) payload.station_latitude = latNum;
    // if (Number.isFinite(lngNum)) payload.station_longitude = lngNum;
//    if (!partner) {
//   alert("Please enter Supporting Partner.");
//   return;
// }

  //   try {
  //     const created: ApiGS = await api.post(GS_API, payload);
  //     setRows((prev) => [...prev, apiGsToUi(created)]);
  //     // setGsName("");
  //     setAntennaSel("");
  //     setSelectedAntenna(null);

  //     // setLat("");
  //     // setLng("");
  //     alert(t("Ground Station added successfully ✅"));
  //     setGsInner("view");
  //   } catch (e: any) {
  //     console.error(e);
  //     alert(e?.message || t("Failed to add Ground Station ❌"));
  //   }
  // };

  const handleUpdateStation = (r: GSRow) => {
    const antennas = r.antenna
      ? r.antenna.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    setEditRow({
      id: r.id,
      partner: r.partner,
      station: r.station,
      antennas,
      // latitude: r.lat ?? "",
      // longitude: r.lng ?? "",
    });
    setEditOpen(true);
  };
  const handleSaveDialog = async (updated: GSDialogRow) => {
    try {
      const current = rows.find((r) => r.id === updated.id);
      const payload: any = {
        supporting_partner: updated.partner,
        ground_station: updated.station,
        added_by: current?.addedBy ?? "Admin",
      };
      if (updated.antennas?.length) payload.antenna = updated.antennas.join(", ");
      if (typeof updated.latitude !== "undefined")
        payload.station_latitude = updated.latitude || null;
      if (typeof updated.longitude !== "undefined")
        payload.station_longitude = updated.longitude || null;

const data: ApiGS = await api.put(`${GS_API}/${updated.id}`, payload, {
  headers: {
    "x-module-name": "gs_operations",
    "x-page-name": "/operations",
  },
});

      setRows((prev) => prev.map((r) => (r.id === updated.id ? apiGsToUi(data) : r)));
      setEditOpen(false);
      alert(t("Ground Station updated ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to update ground station"));
    }
  };
  const handleDeleteDialog = async (toDelete: GSDialogRow) => {
    try {
      await api.del(`${GS_API}/${toDelete.id}`, {
  headers: {
    "x-module-name": "gs_operations",
    "x-page-name": "/operations",
  },
});

      setRows((prev) => prev.filter((r) => r.id !== toDelete.id));
      setEditOpen(false);
      alert(t("Ground Station deleted ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to delete ground station"));
    }
  };

  const handleAddOperation = async () => {
    const name = opName.trim();
    if (!name) return;
    try {
const created = await api.post(
  OPS_API,
  { operation_name: name, added_by: "Admin" },
  {
    headers: {
      "x-module-name": "gs_operations",
      "x-page-name": "/operations",
    },
  }
);
      setOpsList((cur) => [...cur, created.operation_name]);
      setOpName("");
      alert(t("Operation added ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to add operation ❌"));
    }
  };
 const handleAddRequester = async () => {
  const name = reqName.trim();
  if (!name) return;

  try {
    const created = await api.post(
      REQ_API,
      { requester_name: name, added_by: "Admin" },
      {
        headers: {
          "x-module-name": "gs_operations",
          "x-page-name": "/operations",
        },
      }
    );

    setRequesters((cur) => [...cur, created.requester_name]);
    setReqName("");
    alert(t("Operation requester added ✅"));
  } catch (e: any) {
    console.error(e);
    alert(e?.message || t("Failed to add requester ❌"));
  }
};

  const handleAddSupporter = async () => {
    const name = supName.trim();
    if (!name) return;
    try {
const created = await api.post(
  SUP_API,
  { supporter_name: name, added_by: "Admin" },
  {
    headers: {
      "x-module-name": "gs_operations",
      "x-page-name": "/operations",
    },
  }
);
      setSupporters((cur) => [...cur, created.supporter_name]);
      setSupName("");
      alert(t("TTC Service Provider added ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to add supporter ❌"));
    }
  };


const handleApprove = async (requestId: number) => {
  await api.post(`${ANT_REQ_API}/${requestId}/approve`, null, {
    headers: {
      "x-module-name": "gs_operations",
      "x-page-name": "/operations",
    },
  });

  await loadAntennas();
  setAntPage(0);
  toast.success("Antenna approved ✅");
};

const handleReject = async (requestId: number) => {
  await api.post(`${ANT_REQ_API}/${requestId}/reject`, null, {
    headers: {
      "x-module-name": "gs_operations",
      "x-page-name": "/operations",
    },
  });

  await loadAntennas();
  setAntPage(0);
  toast.error("Antenna rejected ❌");
};


const toggleAntennaSelect = (id: number) => {
  setSelectedAntennas(prev =>
    prev.includes(id)
      ? prev.filter(x => x !== id)
      : [...prev, id]
  );
};

const handleDeleteSelectedAntennas = async () => {
  const rows = antRows.filter(a => selectedAntennas.includes(Number(a.id)));

  // ❌ block pending
  if (rows.some(r => r.status === "PENDING")) {
    toast.error("Pending antennas cannot be deleted");
    return;
  }

  try {
await Promise.all(
  selectedAntennas.map((id) =>
    api.del(`${ANT_API}/${id}`, {
      headers: {
        "x-module-name": "gs_operations",
        "x-page-name": "/operations",
      },
    })
  )
);


    toast.success("Selected antennas deleted ✅");

    setAntRows(prev =>
      prev.filter(r => !selectedAntennas.includes(Number(r.id)))
    );

    setSelectedAntennas([]);
  } catch (e) {
    toast.error("Failed to delete antennas ❌");
  }
};

  const handleAddPol = async () => {
    const s = satName.trim();
    const pz = pol.trim();
    if (!s || !pz) return;
    try {
      const created = await api.post(
  POL_API,
  { satellite_name: s, polarization: pz },
  {
    headers: {
      "x-module-name": "gs_operations",
      "x-page-name": "/operations",
    },
  }
);

      setPolRows((cur) => [...cur, apiPolToUi(created)]);
      setSatName("");
      setPol("");
      alert(t("Satellite polarization added ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to add polarization ❌"));
    }
  };
  const handleUpdatePol = (row: PolRow) => {
    const pols = row.pol.split(",").map((s) => s.trim()).filter(Boolean);
    setPolEditRow({ id: row.id, sat: row.sat, pols });
    setPolEditOpen(true);
  };
  const handleSavePolDialog = async (updated: SatPolDialogRow) => {
    try {
      const payload = { satellite_name: updated.sat, polarization: updated.pols.join(", ") };
      const data =await api.put(`${POL_API}/${updated.id}`, payload, {
  headers: {
    "x-module-name": "gs_operations",
    "x-page-name": "/operations",
  },
});

      setPolRows((prev) => prev.map((r) => (r.id === updated.id ? apiPolToUi(data) : r)));
      setPolEditOpen(false);
      alert(t("Polarization updated ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to update polarization ❌"));
    }
  };
  const handleDeletePolDialog = async (toDelete: SatPolDialogRow) => {
    try {
await api.del(`${POL_API}/${toDelete.id}`, {
  headers: {
    "x-module-name": "gs_operations",
    "x-page-name": "/operations",
  },
});      setPolRows((prev) => prev.filter((r) => r.id !== toDelete.id));
      setPolEditOpen(false);
      alert(t("Polarization deleted ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to delete polarization ❌"));
    }
  };
const addBandRow = () => {
  if (!curBand || !curGT || (!isUplink && !isDownlink)) return;

  setBandRows((b) => [
    ...b,
    {
      band: curBand,
      gt: curGT,
      uplink: isUplink,
      downlink: isDownlink,
    },
  ]);

  setCurGT("");
  setIsUplink(false);
  setIsDownlink(false);
};
const clearBands = () => {
  setCurBand("");
  setCurGT("");
  setIsUplink(false);
  setIsDownlink(false);
  setBandRows([]);
};

  // const addGT = () => {
  //   if (!gtBand || !gtVal) return;
  //   setGts((g) => [...g, { band: gtBand, gt: gtVal }]);
  //   setGtVal("");
  // };
  // const clearGTs = () => setGts([]);
  const clearAntennaForm = () => {
    setAntType("");
    setAntLocation(""); // ✅ ADD
    setAntSize("");
    setAntEIRP("");
    setAntTxPol([]);
    setAntRxPol([]);
setAzFrom("");
setAzTo("");
setElFrom("");
setElTo("");
    setAntTrackVel("");
    setAntTrackAcc("");
    setAntTrackModes("");
  setCurBand("");
setCurGT("");
setIsUplink(false);
setIsDownlink(false);
setBandRows([]);

  };
  const travelRange =
  azFrom && azTo && elFrom && elTo
    ? `${azFrom}° to ${azTo}° Az, ${elFrom}° to ${elTo}° El`
    : "";
const antennaFormValid =
  antType.trim() &&
  antLocation.trim() &&
  antSize.trim() &&
  antEIRP.trim() &&
  antTxPol.length > 0 &&
  antRxPol.length > 0 &&
  azFrom && azTo && elFrom && elTo &&
  antTrackVel.trim() &&
  antTrackAcc.trim() &&
  antTrackModes.trim() &&
  bandRows.length > 0;

  const handleAddAntenna = async () => {
    // Validate individual fields and give descriptive errors
    const missing: string[] = [];
    if (!antType.trim()) missing.push("Antenna Name");
    if (!antLocation.trim()) missing.push("Location");
    if (!antSize.trim()) missing.push("Antenna Size");
    if (!antEIRP.trim()) missing.push("EIRP (dBW)");
    if (!antTxPol.length) missing.push("Transmit Polarization");
    if (!antRxPol.length) missing.push("Receive Polarization");
    if (!azFrom || !azTo || !elFrom || !elTo) missing.push("Antenna Travel Range");
    if (!antTrackVel.trim()) missing.push("Tracking Velocity");
    if (!antTrackAcc.trim()) missing.push("Tracking Acceleration");
    if (!antTrackModes.trim()) missing.push("Tracking Modes");
    if (!bandRows.length) missing.push("At least one Band/Carrier (use the Add button inside the Bands section)");

    if (missing.length > 0) {
      alert(`⚠️ Please fill in the following required fields:\n\n• ${missing.join("\n• ")}`);
      return;
    }

const antennaName = antType.trim();

if (!antennaName) {
  alert("⚠️ Antenna Name is required.");
  return;
}

   const payload = {
  antenna_type: antennaName,
  location: antLocation.trim(),
  size_m: antSize.trim(),
  eirp_dbw: antEIRP.trim(),
  tx_polarization: antTxPol.join(", "),
  rx_polarization: antRxPol.join(", "),
  travel_range: travelRange,
  tracking_velocity: antTrackVel.trim(),
  tracking_acceleration: antTrackAcc.trim(),
  tracking_modes: antTrackModes.trim(),
 bands: bandRows,

  // ✅ THIS IS THE FIX
  receive_gt: bandRows.map(b => ({
    band: b.band,
    gt: b.gt,
  })),
};
    try {
const created = isAdmin
  ? await api.post(ANT_API, payload, {
      headers: {
        "x-module-name": "gs_operations",
        "x-page-name": "/operations",
      },
    })
  : await api.post(
      ANT_REQ_API,
      { payload: payload },
      {
        headers: {
          "x-module-name": "gs_operations",
          "x-page-name": "/operations",
        },
      }
    );







      const row: AntennaRow = {
        id: created?.id ?? created?.request_id ?? Date.now(),
        type: payload.antenna_type,
        location: payload.location,
        size_m: payload.size_m,
        eirp_dbw: payload.eirp_dbw,
        tx_polarization: payload.tx_polarization,
        rx_polarization: payload.rx_polarization,
        travel_range: payload.travel_range,
        tracking_velocity: payload.tracking_velocity,
        tracking_acceleration: payload.tracking_acceleration,
        tracking_modes: payload.tracking_modes,
        bands: payload.bands,
        status: isAdmin ? "APPROVED" : "PENDING",
      };

      // Always update the local list so the row is visible immediately
      setAntRows((prev) => [...prev, row]);
      setAntennaOpts((prev) =>
        Array.from(
          new Set([...prev, `${row.type} / ${row.location || "-"}`])
        ).sort()
      );

      clearAntennaForm();
      alert(
        isAdmin
          ? t("Antenna added ✅")
          : t("Antenna sent for approval ⏳")
      );
      setAntInner("view");



    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to add antenna ❌"));
    }
  };
  const handleUpdateAntenna = (row: AntennaRow) => {
    setAntEditRow({
      id: row.id,
      type: row.type,
      location: row.location, // ✅ ADD
      size_m: row.size_m,
      eirp_dbw: row.eirp_dbw,
      tx_polarization: row.tx_polarization
    ? row.tx_polarization.split(",").map(s => s.trim()).filter(Boolean)
    : [],

  rx_polarization: row.rx_polarization
    ? row.rx_polarization.split(",").map(s => s.trim()).filter(Boolean)
    : [],
      travel_range: row.travel_range,
      tracking_velocity: row.tracking_velocity,
      tracking_acceleration: row.tracking_acceleration,
      tracking_modes: row.tracking_modes,
      bands: row.bands,
      // gts: row.gts,
    });
    setAntEditOpen(true);
  };
  const handleSaveAntennaDialog = async (updated: AntennaDialogRow) => {
    try {
      const payload = {
  antenna_type: updated.type,
  location: updated.location,
  size_m: updated.size_m,
  eirp_dbw: updated.eirp_dbw,
 tx_polarization: Array.isArray(updated.tx_polarization)
  ? updated.tx_polarization.join(", ")
  : updated.tx_polarization,

rx_polarization: Array.isArray(updated.rx_polarization)
  ? updated.rx_polarization.join(", ")
  : updated.rx_polarization,
  travel_range: updated.travel_range,
  tracking_velocity: updated.tracking_velocity,
  tracking_acceleration: updated.tracking_acceleration,
  tracking_modes: updated.tracking_modes,
  bands: updated.bands ?? [],
  receive_gt: (updated.bands ?? []).map(b => ({
    band: b.band,
    gt: b.gt,

  })),
};

      const res = await api.put(`${ANT_API}/${updated.id}`, payload, {
  headers: {
    "x-module-name": "gs_operations",
    "x-page-name": "/operations",
  },
});

      const newRow: AntennaRow = {
        id: res.id ?? updated.id,
        type: String(res.antenna_type ?? payload.antenna_type ?? ""),
        location: String(res.location ?? payload.location ?? ""), // ✅ ADD

        size_m: String(res.size_m ?? payload.size_m ?? ""),
        eirp_dbw: String(res.eirp_dbw ?? payload.eirp_dbw ?? ""),
        tx_polarization: String(res.tx_polarization ?? payload.tx_polarization ?? ""),
        rx_polarization: String(res.rx_polarization ?? payload.rx_polarization ?? ""),
        travel_range: String(res.travel_range ?? payload.travel_range ?? ""),
       tracking_velocity: String(res.tracking_velocity ?? payload.tracking_velocity ?? ""),
tracking_acceleration: String(res.tracking_acceleration ?? payload.tracking_acceleration ?? ""),
tracking_modes: String(res.tracking_modes ?? payload.tracking_modes ?? ""),

bands: (() => {
  const gtMap = new Map(
    (res.receive_gt || []).map((g: any) => [g.band, String(g.gt ?? "")])
  );

  return Array.isArray(res.bands)
    ? res.bands.map((b: any) => ({
        band: b.band,
        gt: gtMap.get(b.band) || "",
        uplink: Boolean(b.uplink),
        downlink: Boolean(b.downlink),
      }))
    : updated.bands;
})(),


  //      gts: Array.isArray(res.receive_gt)
  // ? res.receive_gt
  // : payload.receive_gt,

      };
      setAntRows((prev) => prev.map((r) => (r.id === updated.id ? newRow : r)));
      setAntEditOpen(false);
      setAntennaOpts((prev) =>
  Array.from(
    new Set([...prev, `${newRow.type} / ${newRow.location || "-"}`])
  ).sort()
);

      alert(t("Antenna updated ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to update antenna ❌"));
    }
  };
const handleDeleteAntennaDialog = async (toDelete: AntennaDialogRow) => {
  const row = antRows.find(r => r.id === toDelete.id);

  if (row?.status === "PENDING") {
    toast.error("Pending antenna cannot be deleted. Approve or reject first.");
    return;
  }
  if (!canEditAntenna) {
    toast.error("Permission denied");
    return;
  }

  try {
await api.del(`${ANT_API}/${toDelete.id}`, {
  headers: {
    "x-module-name": "gs_operations",
    "x-page-name": "/operations",
  },
});
    setAntRows((prev) => prev.filter((r) => r.id !== toDelete.id));
    setAntEditOpen(false);
    toast.success("Antenna deleted ✅");
  } catch (e: any) {
    console.error(e);
    toast.error(e?.message || "Failed to delete antenna ❌");
  }
};


  /* -------- CAPTCHA wiring for Add buttons -------- */
  type CaptchaAction =
    | { kind: "addStation" }
    | { kind: "addRequester" }
    | { kind: "addSupporter" }
    | { kind: "addOperation" }
    | { kind: "addPol" }
    // | { kind: "addBand" }
    // | { kind: "addGT" }
    | { kind: "addAntenna" };

  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [captchaAction, setCaptchaAction] = React.useState<CaptchaAction | null>(null);

  const runAfterCaptcha = React.useCallback(async () => {
    if (!captchaAction) return;
    switch (captchaAction.kind) {
      case "addStation":   await handleAddStation();   break;
      case "addRequester": await handleAddRequester(); break;
      case "addSupporter": await handleAddSupporter(); break;
      case "addOperation": await handleAddOperation(); break;
      case "addPol":       await handleAddPol();       break;
      // case "addBand":      addBandRow();               break;
      // case "addGT":        addGT();                    break;
      case "addAntenna":   await handleAddAntenna();   break;
    }
    setCaptchaAction(null);
  }, [captchaAction]);

  /* Derived */
  const pagedStations = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pagedPol = polRows.slice(polPage * polRowsPerPage, polPage * polRowsPerPage + polRowsPerPage);
  const pagedAnts = antRows.slice(antPage * antRpp, antPage * antRpp + antRpp);

  return (
    <MainLayout title="">
      <Box
        sx={{
          px: 2,
          py: 1.5,
          height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: 1.5,
        }}
      >
        {/* Top toggle */}
        <ToggleButtonGroup
          value={tab}
          exclusive
          onChange={handleTab}
          sx={{
            p: 0.5,
            borderRadius: 999,
            border: `1px solid ${vars.border}`,
            bgcolor: vars.bgCard,
            width: "fit-content",
            "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
          }}
        >
          {[
  { key: "stations", label: t("Ground Stations") },
  { key: "operations", label: t("Operations") },
...(canEditAntenna
  ? [{ key: "antennas", label: t("Antennas") }]
  : []),
]
.map(({ key, label }) => (
            <ToggleButton key={key} value={key} disableRipple sx={pillSx}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Main card */}
        <Card sx={{ ...CARD_SX, height: "100%" }}>
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
            {tab === "stations" ? (
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <ToggleButtonGroup
                  value={gsInner}
                  exclusive
                  onChange={(_, v) => v && setGsInner(v)}
                  sx={{
                    p: 0.5,
                    borderRadius: 999,
                    border: `1px solid ${vars.border}`,
                    bgcolor: vars.bgCard,
                    "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
                  }}
                >
                  <ToggleButton value="add" disableRipple sx={innerToggleSx}>
                    {t("Add Ground Station")}
                  </ToggleButton>
                  <ToggleButton value="view" disableRipple sx={innerToggleSx}>
                    {t("View Ground Stations")}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            ) : tab === "antennas" ? (
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <ToggleButtonGroup
                  value={antInner}
                  exclusive
                  onChange={(_, v) => v && setAntInner(v)}
                  sx={{
                    p: 0.5,
                    borderRadius: 999,
                    border: `1px solid ${vars.border}`,
                    bgcolor: vars.bgCard,
                    "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
                  }}
                >
{canEditAntenna && (
  <ToggleButton value="add" disableRipple sx={innerToggleSx}>
    {t("Add Antenna")}
  </ToggleButton>
)}

{canEditAntenna && (
  <ToggleButton value="view" disableRipple sx={innerToggleSx}>
    {t("View Antennas")}
  </ToggleButton>
)}



                </ToggleButtonGroup>
              </Box>
            ) : (
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                {tab === "operations"
                  ? t("Operation Details")
                  : t("Satellite Polarization Details")}
              </Typography>
            )}

            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>

              {(isAdmin || isEditor) && antInner === "view" && (
  <Button
    variant="outlined"
    color="error"
    disabled={!selectedAntennas.length}
    onClick={handleDeleteSelectedAntennas}
    sx={{
      textTransform: "none",
      fontWeight: 700,
      height: 32,
    }}
  >
    Delete
  </Button>
)}

              {/* <Button
                size="small"
                onClick={clearAll}
                sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}
              >
                {t("Clear")}
              </Button> */}
              {tab === "stations" && gsInner === "view" && (
                <Button
                  size="small"
                  onClick={handlePrintStations}
                  startIcon={<PrintRoundedIcon />}
                  sx={PRINT_BTN_SX}
                >
                  {t("Print")}
                </Button>
              )}
            </Box>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {/* ---------------- Ground Stations ---------------- */}
            {tab === "stations" && (
              <>
                {gsInner === "add" ? (
                  <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        columnGap: 2,
                        rowGap: 2,
                        "& .form-item": { display: "flex", flexDirection: "column" },
                      }}
                    >



                      
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>{t("TTC Service Provider")}</Typography>
                        <FormControl fullWidth size="small">
  <Select<string>
    value={partner}
    onChange={(e) => setPartner(e.target.value)}
    displayEmpty
    renderValue={(v) => v || t("Select TTC Service Provider")}
    sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
    MenuProps={darkMenu}
  >
    <MenuItem disabled value="">
      {t("Select TTC Service Provider")}
    </MenuItem>
    {supporters.map((s) => (
      <MenuItem key={s} value={s}>
        <ListItemText primary={s} />
      </MenuItem>
    ))}
  </Select>
</FormControl>

                      </Box>
                      {/* <Box className="form-item">
                        <Typography sx={LABEL_SX}>{t("Ground Station Name")}</Typography>
                        <TextField
                          value={gsName}
                          onChange={(e) => setGsName(e.target.value)}
                          placeholder={t("Enter Ground Station Name")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        />
                      </Box> */}
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>{t("Antenna / Location")}</Typography>
                        <FormControl fullWidth size="small">
                          <Select<string>
  value={antennaSel}
  onChange={(e: SelectChangeEvent<string>) => {
    const value = e.target.value as string;
    setAntennaSel(value);

    // value example: "X-Band / Mumbai"
    const [type, location] = value.split("/").map(v => v.trim());

const found = antRows.find(
  a =>
    a.type?.trim().toLowerCase() === type?.trim().toLowerCase() &&
    a.location?.trim().toLowerCase() === location?.trim().toLowerCase()
);


    setSelectedAntenna(found || null);
  }}

                            displayEmpty
                            renderValue={(v) => (v ? (v as string) : t("Select Antenna / Location"))}
                            sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                            MenuProps={darkMenu}
                          >
                            <MenuItem disabled value="">
                              {t("Select Antenna / Location")}
                            </MenuItem>
                            {antennaOpts.map((a) => (
  <MenuItem key={a} value={a}>

                                <ListItemText primary={a} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      {/* {selectedAntenna && (
  <Box
    sx={{
      mt: 2,
      border: `1px solid ${vars.border}`,
      borderRadius: 1,
      overflow: "hidden",
    }} */}
  {/* > */}
    {/* Header */}
    {/* <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.8fr 0.8fr 1fr 1fr",
        bgcolor: "#000",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {[
        t("Name"),
        t("Location"),
        t("Size (m)"),
        t("EIRP"),
        t("Tx Pol"),
        t("Track Modes"),
      ].map(h => (
        <Box key={h} sx={{ px: 1, py: 1, textAlign: "center" }}>
          {h}
        </Box>
      ))}
    </Box> */}

    {/* Row */}
    {/* <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.8fr 0.8fr 1fr 1fr",
        fontSize: 13,
        bgcolor: vars.bgApp,
      }}
    >
      <Box sx={cellSx}>{selectedAntenna.type}</Box>
      <Box sx={cellSx}>{selectedAntenna.location || "-"}</Box>
      <Box sx={cellSx}>{selectedAntenna.size_m || "-"}</Box>
      <Box sx={cellSx}>{selectedAntenna.eirp_dbw || "-"}</Box>
      <Box sx={cellSx}>{selectedAntenna.tx_polarization || "-"}</Box>
      <Box sx={cellSx}>{selectedAntenna.track_modes || "-"}</Box>
    </Box> */}
  </Box>






{/* ) */}

                      {/* <Box className="form-item">
                        <Typography sx={LABEL_SX}>{t("Station Latitude")}</Typography>
                        <TextField
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          placeholder={t("e.g. 12.9716")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        />
                      </Box>
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>{t("Station Longitude")}</Typography>
                        <TextField
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          placeholder={t("e.g. 77.5946")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        />
                      </Box> */}
                    {/* </Box> */}

{selectedAntenna && (
  <Box
    sx={{
      mt: 2,
      border: `1px solid ${vars.border}`,
      borderRadius: 1,
      overflowX: "auto",
      width: "100%",
    }}
  >
    {/* HEADER */}
    <Box
      sx={{
        display: "grid",
      gridTemplateColumns:
"60px 1.2fr 1fr 0.9fr 0.9fr 1fr 1fr 1.3fr 0.9fr 0.9fr 1fr 0.9fr 1.4fr 100px",


        bgcolor: "#000",
        color: "#fff",
        fontWeight: 700,
        fontSize: 13,
        minWidth: 1100,
      }}
    >
      {[
  t("No"),
  t("Name"),
  t("Location"),
  t("Size (m)"),
  t("EIRP (dBW)"),
  t("Tx Pol"),
  t("Rx Pol"),
  t("Travel Range"),
  t("Track Vel"),
  t("Track Acc"),
  t("Track Modes"),
  ...(isAdmin ? [t("Status")] : []),
  t("Bands"),
  t("Action"),
].map((h) => (

        <Box key={h} sx={{ px: 1, py: 1, textAlign: "center" }}>
          {h}
        </Box>
      ))}
    </Box>

    {/* Row */}
    <Box
  sx={{
    display: "grid",
   gridTemplateColumns:
"60px 1.2fr 1fr 0.9fr 0.9fr 1fr 1fr 1.3fr 0.9fr 0.9fr 1fr 0.9fr 1.4fr 100px",

    fontSize: 13,
    bgcolor: vars.bgApp,
    opacity: selectedAntenna?.status === "PENDING" ? 0.85 : 1,
    minWidth: 1100,
  }}
>

<Box sx={cellSx}>1</Box>
<Box sx={cellSx}>{selectedAntenna.type}</Box>
<Box sx={cellSx}>{selectedAntenna.location || "-"}</Box>
<Box sx={cellSx}>{selectedAntenna.size_m || "-"}</Box>
<Box sx={cellSx}>{selectedAntenna.eirp_dbw || "-"}</Box>
<Box sx={cellSx}>{selectedAntenna.tx_polarization || "-"}</Box>
<Box sx={cellSx}>{selectedAntenna.rx_polarization || "-"}</Box>
<Box sx={cellSx}>{selectedAntenna.travel_range || "-"}</Box>
<Box sx={cellSx}>{selectedAntenna.tracking_velocity || "-"}</Box>
<Box sx={cellSx}>{selectedAntenna.tracking_acceleration || "-"}</Box>
<Box sx={cellSx}>{selectedAntenna.tracking_modes || "-"}</Box>

{isAdmin && (
  <Box sx={cellSx}>
    <StatusBadge status={selectedAntenna.status ?? "APPROVED"} />
  </Box>
)}

<Box sx={cellSx}>
  {selectedAntenna.bands.length
    ? selectedAntenna.bands.map(b => b.band).join(", ")
    : "-"}
</Box>

{/* <Box sx={cellSx}>—</Box>

<Box sx={{ px: 1, py: 1, fontSize: 12, textAlign: "center" }}>
  <div>
    <b>Bands:</b>{" "}
    {selectedAntenna.bands.length
      ? selectedAntenna.bands.map(b => b.band).join(", ")
      : "-"}
  </div> */}
  {/* <div>
    <b>G/T:</b>{" "}
    {selectedAntenna.gts.length
      ? selectedAntenna.gts.map(g => `${g.band}:${g.gt}`).join(", ")
      : "-"}
  </div> */}
{/* </Box> */}
    </Box>
  </Box>
)}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>


                      <Button
                        onClick={() => { setCaptchaAction({ kind: "addStation" }); setCaptchaOpen(true); }}
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          bgcolor: PRIMARY,
                          color: "#fff",
                          "&:hover": { bgcolor: "#6b46f1" },
                        }}
                      >
                        {t("Add")}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ flex: 1, minHeight: 0, px: 1, pb: 1, ...SCROLLER_SX }}>
                      <Box
                        sx={{
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          display: "grid",
                gridTemplateColumns: "80px 1.6fr 2fr 120px",

                          bgcolor: (tMUI) => theadBg(tMUI as Theme),
                          borderBottom: `1px solid ${vars.border}`,
                        }}
                      >
                        {[
                          t("Sr No"),
                          t("TTC Service Provider"),
                          // t("Ground Station"),
                          t("Antenna / Location"),
                          // t("Latitude"),
                          // t("Longitude"),
                          t("Action"),
                        ].map((h) => (
                          <Box
                            key={h}
                            sx={{
                              px: 1.25,
                              py: 1,
                              fontWeight: 700,
                              fontSize: 13,
                              color: (tMUI) => theadText(tMUI as Theme),
                              textAlign: "center",
                            }}
                          >
                            {h}
                          </Box>
                        ))}
                      </Box>

                      {pagedStations.map((r, idx) => (
                        <Box
                          key={r.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
  "80px 1.6fr 2fr 120px",

                            alignItems: "center",
                            borderBottom: `1px solid ${vars.borderWeak}`,
                            bgcolor:
                              (page * rowsPerPage + idx) % 2
                                ? vars.bgHover
                                : "transparent",
                          }}
                        >
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13, color: (tMUI) => bodyText(tMUI as Theme) }}>
                            {page * rowsPerPage + idx + 1}
                          </Box>
                          <Box sx={cellSx}>{r.partner}</Box>
                          {/* <Box sx={cellSx}>{r.station}</Box> */}
                          <Box sx={cellSx}>{r.antenna || "-"}</Box>
                          {/* <Box sx={cellSx}>{r.lat || "-"}</Box>
                          <Box sx={cellSx}>{r.lng || "-"}</Box> */}
                          <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleUpdateStation(r)}
                              sx={{
                                minWidth: 70,
                                height: 28,
                                fontSize: 12,
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: PRIMARY,
                                "&:hover": { bgcolor: "#6b46f1" },
                              }}
                            >
                              {t("Edit")}
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ borderTop: `1px solid ${vars.border}`, px: 1, py: 0.75 }}>
                      <TablePagination
                        component="div"
                        count={rows.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                        rowsPerPageOptions={[5, 20, 50]}
                        sx={paginationSx}
                      />
                    </Box>
                  </>
                )}
              </>
            )}

            {/* ---------------- Operations ---------------- */}
            {tab === "operations" && (
              <>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.9,
                    borderBottom: `1px solid ${vars.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
                    "&::-webkit-scrollbar-track": { background: "transparent" },
                  }}
                >
                  <Typography sx={toolLabelSx}>{t("Add Operation Requester")}</Typography>
                  <TextField
                    placeholder={t("Operation Request")}
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    size="small"
                    sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI), width: 220 })}
                  />
                  <Button
                    variant="contained"
                    onClick={() => { if (reqName.trim()) { setCaptchaAction({ kind: "addRequester" }); setCaptchaOpen(true); } }}
                    disabled={!reqName.trim()}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      height: 32,
                      bgcolor: PRIMARY,
                      "&:hover": { bgcolor: "#6b46f1" },
                    }}
                  >
                    {t("Add")}
                  </Button>

                  <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: vars.border }} />

                  <Typography sx={toolLabelSx}>{t("Add TTC Service Provider")}</Typography>
                  <TextField
                    placeholder={t("TTC Service Provider")}
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    size="small"
                    sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI), width: 220 })}
                  />
                  <Button
                    variant="contained"
                    onClick={() => { if (supName.trim()) { setCaptchaAction({ kind: "addSupporter" }); setCaptchaOpen(true); } }}
                    disabled={!supName.trim()}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      height: 32,
                      bgcolor: PRIMARY,
                      "&:hover": { bgcolor: "#6b46f1" },
                    }}
                  >
                    {t("Add")}
                  </Button>

                  <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: vars.border }} />

                  <Typography sx={toolLabelSx}>{t("Add Operation")}</Typography>
                  <TextField
                    placeholder={t("Operation name")}
                    value={opName}
                    onChange={(e) => setOpName(e.target.value)}
                    size="small"
                    sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI), width: 220 })}
                  />
                  <Button
                    variant="contained"
                    onClick={() => { if (opName.trim()) { setCaptchaAction({ kind: "addOperation" }); setCaptchaOpen(true); } }}
                    disabled={!opName.trim()}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      height: 32,
                      bgcolor: PRIMARY,
                      "&:hover": { bgcolor: "#6b46f1" },
                    }}
                  >
                    {t("Add")}
                  </Button>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    p: 1.25,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" },
                    gap: 1.25,
                  }}
                >
                  <ListPanel title={t("Operation Requesters")} items={requesters} targetTab="requesters" />
                  <ListPanel title={t("TTC Service Providers")} items={supporters} targetTab="supporters" />
                  <ListPanel title={t("Operations")} items={opsList} targetTab="operations" />
                </Box>
              </>
            )}

            {/* ---------------- Satellite Polarization ---------------- */}
            {tab === "polarization" && (
              <>
                <Box sx={{ p: 1.25, pt: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mr: 1 }}>
                    {t("Add Satellite Polarization")}
                  </Typography>
                  <TextField
                    value={satName}
                    onChange={(e) => setSatName(e.target.value)}
                    placeholder={t("Satellite Name")}
                    size="small"
                    sx={(tMUI) => ({ width: 280, ...controlSx, ...filledField(tMUI) })}
                  />
                  <TextField
                    value={pol}
                    onChange={(e) => setPol(e.target.value)}
                    placeholder={t("Polarization")}
                    size="small"
                    sx={(tMUI) => ({ width: 220, ...controlSx, ...filledField(tMUI) })}
                  />
                  <Button
                    onClick={() => { if (satName.trim() && pol.trim()) { setCaptchaAction({ kind: "addPol" }); setCaptchaOpen(true); } }}
                    disabled={!satName.trim() || !pol.trim()}
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: PRIMARY,
                      "&:hover": { bgcolor: "#6b46f1" },
                      "&.Mui-disabled": {
                        bgcolor: vars.bgCtrl,
                        color: vars.textDim,
                        boxShadow: "none",
                      },
                    }}
                  >
                    {t("Add")}
                  </Button>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0, px: 1, ...SCROLLER_SX, pb: 1 }}>
                  <Box
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      display: "grid",
                      gridTemplateColumns: "80px 1.4fr 1.2fr 120px",
                      bgcolor: (tMUI) => ((tMUI as Theme).palette.mode === "dark" ? "#000000" : "#464b4e"),
                      borderBottom: `1px solid ${vars.border}`,
                    }}
                  >
                    {[t("Sr No"), t("Satellite Name"), t("Polarization"), t("Action")].map((label) => (
                      <Box
                        key={label}
                        sx={{
                          px: 1.25,
                          py: 1,
                          fontWeight: 700,
                          fontSize: 13,
                          color: (tMUI) => theadText(tMUI as Theme),
                          textAlign: "center",
                        }}
                      >
                        {label}
                      </Box>
                    ))}
                  </Box>

                  {pagedPol.map((r, idx) => (
                    <Box
                      key={r.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "80px 1.4fr 1.2fr 120px",
                        alignItems: "center",
                        borderBottom: `1px solid ${vars.borderWeak}`,
                        bgcolor:
                          (polPage * polRowsPerPage + idx) % 2 ? vars.bgHover : "transparent",
                      }}
                    >
                      {/* <Box sx={{ textAlign: "center" }}>
  <Checkbox
    size="small"
    disabled={a.status === "PENDING"}
    checked={selectedAntennas.includes(Number(a.id))}
    onChange={() => toggleAntennaSelect(Number(a.id))}
  />
</Box> */}

                      <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13, color: (tMUI) => bodyText(tMUI as Theme) }}>
                        {polPage * polRowsPerPage + idx + 1}
                      </Box>
                      <Box sx={cellSx}>{r.sat}</Box>
                      <Box sx={cellSx}>{r.pol}</Box>
                      <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleUpdatePol(r)}
                          sx={{
                            minWidth: 70,
                            height: 28,
                            fontSize: 12,
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: PRIMARY,
                            "&:hover": { bgcolor: "#6b46f1" },
                          }}
                        >
                          {t("Edit")}
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ borderTop: `1px solid ${vars.border}`, px: 1, py: 0.75 }}>
                  <TablePagination
                    component="div"
                    count={polRows.length}
                    page={polPage}
                    onPageChange={(_, p) => setPolPage(p)}
                    rowsPerPage={polRowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setPolRowsPerPage(parseInt(e.target.value, 10));
                      setPolPage(0);
                    }}
                    rowsPerPageOptions={[5, 20, 50]}
                    sx={paginationSx}
                  />
                </Box>
              </>
            )}
{/* {tab === "antenna-approval" && (
  <Box
    sx={{
      flex: 1,
      p: 1.5,
      overflowY: "auto",
      overflowX: "auto",
      ...SCROLLER_SX,
    }}
  >

    <Box
      sx={{
        display: "grid",
gridTemplateColumns:
"70px 1.2fr 1fr 0.9fr 0.9fr 1fr 1fr 1.2fr 0.9fr 0.9fr 1.1fr 0.9fr 1.6fr 220px",
        fontWeight: 700,
        color: "#fff",
bgcolor: "#000",
        
      }}
    >
{[
  "No",
  "Name",
  "Location",
  "Size (m)",
  "EIRP (dBW)",
  "Tx Pol",
  "Rx Pol",
  "Travel Range",
  "Track Vel",
  "Track Acc",
  "Track Modes",
  "Status",
  "Bands",
  "Action",
].map((h) => (
        <Box key={h} sx={{ px: 1, py: 1, textAlign: "center" }}>
          {h}
        </Box>
      ))}
    </Box>

    {pendingAnts.map((a, i) => (
      
      <Box
        key={a.id}
        sx={{
          display: "grid",
          gridTemplateColumns:
"70px 1.2fr 1fr 0.9fr 0.9fr 1fr 1fr 1.2fr 0.9fr 0.9fr 1.1fr 0.9fr 1.6fr 220px",

          alignItems: "center",
          borderBottom: `1px solid ${vars.border}`,
          bgcolor: i % 2 ? vars.bgHover : "transparent",
        }}
      >
        <Box sx={cellSx}>{i + 1}</Box>
        <Box sx={cellSx}>{a.antenna_type}</Box>
<Box sx={cellSx}>{a.location || "-"}</Box>
<Box sx={cellSx}>{a.size_m || "-"}</Box>
<Box sx={cellSx}>{a.eirp_dbw || "-"}</Box>
<Box sx={cellSx}>{a.tx_polarization || "-"}</Box>
<Box sx={cellSx}>{a.rx_polarization || "-"}</Box>
<Box sx={cellSx}>{a.travel_range || "-"}</Box>
<Box sx={cellSx}>{a.tracking_velocity || "-"}</Box>
<Box sx={cellSx}>{a.tracking_acceleration || "-"}</Box>
<Box sx={cellSx}>{a.tracking_modes || "-"}</Box>


        {/* STATUS */}
        {/* <Box sx={{ textAlign: "center" }}>
          <StatusBadge status="PENDING" />
        </Box> */}

{/* BANDS */}


            {/* ---------------- Antennas ---------------- */}
            {tab === "antennas" && (
              <>
                {antInner === "add" ? (
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
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>{t("Antenna Name *")}</Typography>
                        <TextField
                          value={antType}
                          onChange={(e) => setAntType(e.target.value)}
                          placeholder={t("Enter Name")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        />
                      </Box>
                      
                      <Box className="form-item">
<Typography sx={LABEL_SX}>{t("Location *")}</Typography>
  <TextField
    value={antLocation}
    onChange={(e) => setAntLocation(e.target.value)}
    placeholder={t("e.g. Sriharikota")}
    size="small"
    sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
  />
</Box>

                      <Box className="form-item">
<Typography sx={LABEL_SX}>{t("Antenna Size (m) *")}</Typography>
                        <TextField
                          value={antSize}
                          onChange={(e) => setAntSize(e.target.value)}
                          placeholder={t("e.g. 3.7")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        />
                      </Box>
                      <Box className="form-item">
<Typography sx={LABEL_SX}>{t("EIRP (dBW) *")}</Typography>
                        <TextField
                          value={antEIRP}
                          onChange={(e) => setAntEIRP(e.target.value)}
                          placeholder={t("e.g. 52.5")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        />
                      </Box>

                      <Box className="form-item">
<Typography sx={LABEL_SX}>{t("Transmit Polarization *")}</Typography>
  <FormControl fullWidth size="small">
   <Select
  multiple
  value={antTxPol}
  onChange={(e) => setAntTxPol(e.target.value as string[])}
  displayEmpty
  renderValue={(selected) => {
    const v = selected as string[];
    return v.length ? v.join(", ") : "Select Transmit Polarization";
  }}
  sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
  MenuProps={darkMenu}
>
      {POL_OPTIONS.map((pol) => (
        <MenuItem key={pol} value={pol}>
          <Checkbox checked={antTxPol.includes(pol)} />
          <ListItemText primary={pol} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

                      
                     <Box className="form-item">
<Typography sx={LABEL_SX}>{t("Receive Polarization *")}</Typography>
  <FormControl fullWidth size="small">
    <Select
  multiple
  value={antRxPol}
  onChange={(e) => setAntRxPol(e.target.value as string[])}
  displayEmpty
  renderValue={(selected) => {
    const v = selected as string[];
    return v.length ? v.join(", ") : "Select Receive Polarization";
  }}
  sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
  MenuProps={darkMenu}
>
      {POL_OPTIONS.map((pol) => (
        <MenuItem key={pol} value={pol}>
          <Checkbox checked={antRxPol.includes(pol)} />
          <ListItemText primary={pol} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

                      <Box className="form-item">
  <Typography sx={LABEL_SX}>
  {t("Antenna Travel Range (°) *")}
</Typography>


  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: "auto 60px auto 60px auto 50px auto 55px",
      gap: 0.5,
      alignItems: "center",
    }}
  >
    {/* AZ FROM */}
    <Typography sx={{ fontSize: 12, color: vars.textDim }}>Az From</Typography>
    <TextField
      type="number"
      value={azFrom}
      onChange={(e) => setAzFrom(e.target.value)}
      placeholder="0"
      size="small"
sx={(tMUI) => ({
  ...controlSx,
  ...filledField(tMUI),
  width: 60,
})}
    />

    {/* AZ TO */}
    <Typography sx={{ fontSize: 12, color: vars.textDim }}>To</Typography>
    <TextField
      type="number"
      value={azTo}
      onChange={(e) => setAzTo(e.target.value)}
      placeholder="359"
      size="small"
      sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
    />

    {/* EL FROM */}
    <Typography sx={{ fontSize: 12, color: vars.textDim }}>El From</Typography>
    <TextField
      type="number"
      value={elFrom}
      onChange={(e) => setElFrom(e.target.value)}
      placeholder="5"
      size="small"
      sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
    />

    {/* EL TO */}
    <Typography sx={{ fontSize: 12, color: vars.textDim }}>To</Typography>
    <TextField
      type="number"
      value={elTo}
      onChange={(e) => setElTo(e.target.value)}
      placeholder="90"
      size="small"
      sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
    />
  </Box>
</Box>

                      <Box className="form-item">
<Typography sx={LABEL_SX}>
  {t("Tracking Velocity (°/s) *")}
</Typography>
         
  <TextField
  type="number"
  value={antTrackVel}
  onChange={(e) => setAntTrackVel(e.target.value)}
  placeholder="e.g. 20"
  size="small"
  sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
/>

                      </Box>

                      <Box className="form-item">
<Typography sx={LABEL_SX}>
  {t("Tracking Acceleration (°/s²) *")}
</Typography>
                       <TextField
  type="number"
  value={antTrackAcc}
  onChange={(e) => setAntTrackAcc(e.target.value)}
  placeholder="e.g. 100"
  size="small"
  sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
/>

                      </Box>
                      <Box className="form-item">
<Typography sx={LABEL_SX}>{t("Tracking Modes *")}</Typography>
               <FormControl fullWidth size="small">
  <Select
    value={antTrackModes}
    onChange={(e) => setAntTrackModes(e.target.value)}
    displayEmpty
    renderValue={(v) => v || "Select Tracking Mode"}
    sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
    MenuProps={darkMenu}
  >
    <MenuItem disabled value="">
      Select Tracking Mode
    </MenuItem>

    {TRACK_MODE_OPTIONS.map((mode) => (
      <MenuItem key={mode} value={mode}>
        <ListItemText primary={mode} />
      </MenuItem>
    ))}
  </Select>
</FormControl>


                      </Box>
                    </Box>

                    {/* Bands */}
                    <Box sx={{ mt: 2, p: 1.25, border: `1px solid ${vars.border}`, borderRadius: 1 }}>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: vars.text }}>
  {t("Bands/Carriers *")}
</Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "200px 1fr auto auto auto auto" },

                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <Select<string>
                            value={curBand}
                            onChange={(e: SelectChangeEvent<string>) =>
                              setCurBand(e.target.value as string)
                            }
                            displayEmpty
                            renderValue={(v) => (v ? (v as string) : t("Select Band"))}
                            sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                            MenuProps={darkMenu}
                          >
                            <MenuItem disabled value="">
                              {t("Select Band/Carrier")}
                            </MenuItem>
                            {BAND_OPTIONS.map((b) => (
                              <MenuItem key={b} value={b}>
                                <ListItemText primary={b} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
  value={curGT}
  onChange={(e) => setCurGT(e.target.value)}
  placeholder={t("Enter G/T")}
  size="small"
  sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
/>

<FormControlLabel
  control={
    <Checkbox
      checked={isUplink}
      onChange={(e) => setIsUplink(e.target.checked)}
    />
  }
  label={t("Uplink")}
/>

<FormControlLabel
  control={
    <Checkbox
      checked={isDownlink}
      onChange={(e) => setIsDownlink(e.target.checked)}
    />
  }
  label={t("Downlink")}
/>

                        {/* <TextField
                          value={curUplink}
                          onChange={(e) => setCurUplink(e.target.value)}
                          placeholder={t("Enter Uplink")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        />
                        <TextField
                          value={curDownlink}
                          onChange={(e) => setCurDownlink(e.target.value)}
                          placeholder={t("Enter Downlink")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        /> */}
                        <Button
                          variant="outlined"
                          onClick={clearBands}
                          sx={{
                            textTransform: "none",
                            height: 32,
                            borderColor: vars.border,
                            color: vars.textDim,
                          }}
                        >
                          {t("Clear")}
                        </Button>
                       <Button
  variant="contained"
  onClick={addBandRow}
  sx={{
    textTransform: "none",
    height: 32,
    bgcolor: "#e03f3f",
    color: "#fff",
    "&:hover": { bgcolor: "#cc3535" },
  }}
>
  {t("Add")}
</Button>

                      </Box>

                      <Box sx={{ mt: 1 }}>
                        {bandRows.map((b, i) => (
                          <Box
                            key={`${b.band}-${i}`}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "repeat(3,1fr)", md: "200px 1fr 1fr" },
                              gap: 1,
bgcolor:
  i % 2
    ? vars.bgHover
    : "transparent",                             border: `1px solid ${vars.borderWeak}`,
                              borderRadius: 1,
                              p: 1,
                              mb: 1,
                              color: vars.text,
                            }}
                          >
                            <Box sx={{ fontSize: 13 }}>
  <b>{t("Band")}:</b> {b.band}
</Box>

<Box sx={{ fontSize: 13 }}>
  <b>{t("G/T")}:</b> {b.gt}
</Box>

<Box sx={{ fontSize: 13 }}>
  <b>{t("Link")}:</b>{" "}
  {[
    b.uplink && "Uplink",
    b.downlink && "Downlink",
  ].filter(Boolean).join(", ")}
</Box>

                          </Box>
                        ))}
                        {!bandRows.length && (
                          <Typography sx={{ color: vars.textDim, fontSize: 13, mt: 0.5 }}>
                            {t("No bands added.")}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Receive G/T */}
                    {/* <Box sx={{ mt: 2, p: 1.25, border: `1px solid ${vars.border}`, borderRadius: 1 }}>
                      <Typography sx={{ fontWeight: 700, mb: 1, color: vars.text }}>
                        {t("Receive G/T")}
                      </Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "200px 1fr auto auto" },
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <Select<string>
                            value={gtBand}
                            onChange={(e: SelectChangeEvent<string>) =>
                              setGtBand(e.target.value as string)
                            }
                            displayEmpty
                            renderValue={(v) => (v ? (v as string) : t("Select Band"))}
                            sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                            MenuProps={darkMenu}
                          >
                            <MenuItem disabled value="">
                              {t("Select Band")}
                            </MenuItem>
                            {BAND_OPTIONS.map((b) => (
                              <MenuItem key={b} value={b}>
                                <ListItemText primary={b} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField
                          value={gtVal}
                          onChange={(e) => setGtVal(e.target.value)}
                          placeholder={t("Enter G/T")}
                          size="small"
                          sx={(tMUI) => ({ ...controlSx, ...filledField(tMUI) })}
                        />
                        <Button
                          variant="outlined"
                          onClick={clearGTs}
                          sx={{
                            textTransform: "none",
                            height: 32,
                            borderColor: vars.border,
                            color: vars.textDim,
                          }}
                        >
                          {t("Clear")}
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => { if (gtBand && gtVal) { setCaptchaAction({ kind: "addGT" }); setCaptchaOpen(true); } }}
                          sx={{
                            textTransform: "none",
                            height: 32,
                            bgcolor: "#e03f3f",
                            color: "#fff",
                            "&:hover": { bgcolor: "#cc3535" },
                          }}
                        >
                          {t("Add")}
                        </Button>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        {gts.map((g, i) => (
                          <Box
                            key={`${g.band}-${i}`}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "repeat(2,1fr)", md: "200px 1fr" },
                              gap: 1,
                              bgcolor: vars.bgApp,
                              border: `1px solid ${vars.borderWeak}`,
                              borderRadius: 1,
                              p: 1,
                              mb: 1,
                              color: vars.text,
                            }}
                          >
                            <Box sx={{ fontSize: 13 }}><b>{t("Band")}:</b> {g.band}</Box>
                            <Box sx={{ fontSize: 13 }}><b>{t("G/T")}:</b> {g.gt}</Box>
                          </Box>
                        ))}
                        {!gts.length && (
                          <Typography sx={{ color: vars.textDim, fontSize: 13, mt: 0.5 }}>
                            {t("No G/T rows added.")}
                          </Typography>
                        )}
                      </Box>
                    </Box> */}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={clearAntennaForm}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderColor: vars.border,
                          color: vars.textDim,
                          "&:hover": { borderColor: vars.border, bgcolor: vars.bgHover },
                        }}
                      >
                        {t("Clear")}
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setCaptchaAction({ kind: "addAntenna" });
                          setCaptchaOpen(true);
                        }}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          bgcolor: COLORS.purple,
                          color: "#fff",
                          "&:hover": { bgcolor: "#6b46f1" },
                        }}
                      >
                        {t("Add Antenna")}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
<Box
  sx={{
    flex: 1,
    minHeight: 0,

    // ✅ EXACT SAME AS USERS PAGE
    overflow: "hidden",

    bgcolor: vars.bgApp,
    display: "flex",
    flexDirection: "column",

    
  }}
>





   <Box
  sx={{
    flex: 1,
    overflow: "auto",
    ...SCROLLER_SX,
   
  }}
>


 {/* 🔥 WIDTH CONTROLLER */}
  <Box
    sx={{
      minWidth: "max-content",
      bgcolor: vars.bgCard,
    }}
  >
    {/* HEADER */}






 <Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 2,
    display: "grid",
    gridTemplateColumns: ANT_GRID,
    minWidth: "max-content",
    bgcolor: "#000",
    borderBottom: `1px solid ${vars.border}`,
  }}
>
  {[
    "", // checkbox
    t("No"),
    t("Name"),
    t("Location"),
    t("Size (m)"),
    t("EIRP (dBW)"),
    t("Tx Pol"),
    t("Rx Pol"),
    t("Travel Range"),
    t("Track Vel"),
    t("Track Acc"),
    t("Track Modes"),
    ...(isAdmin ? [t("Status")] : []),
    t("Bands"),
    t("Action"),
  ].map((h, i) => (
    <Box
      key={i}
      sx={{
        px: 1.25,
        py: 1,
        fontWeight: 700,
        fontSize: 13,
        color: "#fff",
        textAlign: "center",
        whiteSpace: "nowrap",
      }}
    >
      {i === 0 ? (
        <Checkbox
          size="small"
          checked={
            pagedAnts.length > 0 &&
            pagedAnts.every(a => selectedAntennas.includes(Number(a.id)))
          }
          indeterminate={
            selectedAntennas.length > 0 &&
            !pagedAnts.every(a => selectedAntennas.includes(Number(a.id)))
          }
          onChange={() => {
            const ids = pagedAnts
              .filter(a => a.status !== "PENDING")
              .map(a => Number(a.id));

            setSelectedAntennas(
              ids.every(id => selectedAntennas.includes(id)) ? [] : ids
            );
          }}
        />
      ) : (
        h
      )}
    </Box>
  ))}
</Box>


                   
  


                      {pagedAnts.map((a, idx) => (

                        
<Box
  key={String(a.id)}
  sx={{
    display: "grid",
    gridTemplateColumns: ANT_GRID,
    alignItems: "center",
    borderBottom: `1px solid ${vars.borderWeak}`,
    bgcolor: vars.bgCard,
    "&:hover": {
      backgroundColor: (t: Theme) =>
        t.palette.mode === "dark" ? "#232325" : "#f7f7f7",
    },
  }}
>
  {/* checkbox */}
  <Box sx={{ textAlign: "center" }}>
    <Checkbox
      size="small"
      disabled={a.status === "PENDING"}
      checked={selectedAntennas.includes(Number(a.id))}
      onChange={() => toggleAntennaSelect(Number(a.id))}
    />
  </Box>

  {/* Sr No */}
  <Box sx={cellSx}>
    {antPage * antRpp + idx + 1}
  </Box>

  <Box sx={cellSx}>{a.type}</Box>
  <Box sx={cellSx}>{a.location || "-"}</Box>
  <Box sx={cellSx}>{a.size_m || "-"}</Box>
  <Box sx={cellSx}>{a.eirp_dbw || "-"}</Box>
  <Box sx={cellSx}>{a.tx_polarization || "-"}</Box>
  <Box sx={cellSx}>{a.rx_polarization || "-"}</Box>
  <Box sx={cellSx}>{a.travel_range || "-"}</Box>
  <Box sx={cellSx}>
  {a.tracking_velocity
    ? `${a.tracking_velocity} °/s`
    : "-"}
</Box>

<Box sx={cellSx}>
  {a.tracking_acceleration
    ? `${a.tracking_acceleration} °/s²`
    : "-"}
</Box>

  <Box sx={cellSx}>{a.tracking_modes || "-"}</Box>

  {isAdmin && (
    <Box sx={cellSx}>
      <StatusBadge status={a.status || "APPROVED"} />
    </Box>
  )}

 <Box
  sx={{
    px: 0.75,
    py: 0.5,
    textAlign: "left",
    fontSize: 12,
    lineHeight: 1.25,
  }}
>
  {a.bands?.length ? (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
      {a.bands.map((b, i) => (
        <Box key={i} sx={{ whiteSpace: "nowrap" }}>
          <b>{b.band}</b>
          {"  |  "}
          G/T: {b.gt || "-"}
          {"  |  "}
          {[b.uplink && "Uplink", b.downlink && "Downlink"]
            .filter(Boolean)
            .join(", ") || "-"}
        </Box>
      ))}
    </Box>
  ) : (
    "-"
  )}
</Box>



  <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
    {(isAdmin || (isEditor && a.status === "APPROVED")) && (
      <Button
        size="small"
        variant="contained"
        onClick={() => handleUpdateAntenna(a)}
        sx={{
          minWidth: 70,
          height: 28,
          fontSize: 12,
          textTransform: "none",
          fontWeight: 700,
        }}
      >
        Edit
      </Button>
    )}

    {isAdmin && a.status === "PENDING" && (
      <>
        <Button
          size="small"
          color="success"
          variant="contained"
          onClick={() => handleApprove(a.__requestId!)}
        >
          Approve
        </Button>
        <Button
          size="small"
          color="error"
          variant="contained"
          onClick={() => handleReject(a.__requestId!)}
        >
          Reject
        </Button>
      </>
    )}
  </Box>
</Box>

                      ))}
</Box>
                      </Box>
                    </Box>

                    <Box sx={{ borderTop: `1px solid ${vars.border}`, px: 1, py: 0.75 }}>
                      <TablePagination
                        component="div"
                        count={antRows.length}
                        page={antPage}
                        onPageChange={(_, p) => setAntPage(p)}
                        rowsPerPage={antRpp}
                        onRowsPerPageChange={(e) => {
                          setAntRpp(parseInt(e.target.value, 10));
                          setAntPage(0);
                        }}
                        rowsPerPageOptions={[5, 20, 50]}
                        sx={paginationSx}
                      />
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Card>
      </Box>

      {/* CAPTCHA Dialog */}
      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => { setCaptchaOpen(false); setCaptchaAction(null); }}
        onOk={async () => { setCaptchaOpen(false); await runAfterCaptcha(); }}
      />

      {/* Dialogs */}
      <UpdateGroundStationDialog
        open={editOpen}
        row={editRow}
        antennaOptions={antennaOpts}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveDialog}
        onDelete={handleDeleteDialog}
      />
      <UpdateSatellitePolarizationDialog
        open={polEditOpen}
        row={polEditRow}
        satOptions={satOptions}
        onClose={() => setPolEditOpen(false)}
        onSave={handleSavePolDialog}
        onDelete={handleDeletePolDialog}
      />
      <UpdateAntennaDialog
  open={antEditOpen}
  row={antEditRow}
  onClose={() => setAntEditOpen(false)}
  onSave={handleSaveAntennaDialog}
  onDelete={handleDeleteAntennaDialog}
/>
    </MainLayout>
  );
}

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    APPROVED: "#16a34a",
    PENDING: "#f59e0b",
    REJECTED: "#dc2626",
  };

  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        bgcolor: map[status] || "#9ca3af",
        color: status === "PENDING" ? "#000" : "#fff",
        display: "inline-block",
      }}
    >
      {status}
    </Box>
  );
};

// const isEditor = () =>
//   sessionStorage.getItem("pmgt_role") === "editor";

// const canEditAntenna = () => isAdmin() || isEditor();


/* ---------- tiny style helpers ---------- */
const toolLabelSx = {
  fontSize: 12,
  fontWeight: 700,
  color: vars.textDim,
  mr: 0.75,
};
const innerToggleSx = { ...pillSx };

// body cells: black in light, existing color in dark
const cellSx = {
  px: 1.25,
  py: 1,
  textAlign: "center" as const,
  fontSize: 13,
  color: (t: any) => bodyText(t),
};
// pagination text/icons: black in light, existing in dark
const paginationSx = {
  color: (t: any) => bodyText(t),
  "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    m: 0,
    fontSize: 13,
    color: (t: any) => bodyText(t),
  },
  "& .MuiTablePagination-input": { m: 0, fontSize: 13, color: (t: any) => bodyText(t) },
  "& .MuiSelect-select": {
    py: 0,
    px: 1,
    height: 28,
    display: "flex",
    alignItems: "center",
    bgcolor: vars.bgCtrl,
    borderRadius: 1,
  },
  "& .MuiIconButton-root": { p: 0.25, color: (t: any) => bodyText(t) },
  ".MuiSvgIcon-root": { fontSize: 16, color: (t: any) => bodyText(t) },
};
