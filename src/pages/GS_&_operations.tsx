// src/pages/GS_&_operations.tsx
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
  FormControl,
  MenuItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Select from "@mui/material/Select";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import toast from "react-hot-toast";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { api } from "../api/http";
import { useAuth } from "../auth";

/* i18n */
import { useI18n } from "../i18n";

/* dialogs */
import UpdateGroundStationDialog from "../components/UpdateGroundStationDialog";
import type { GroundStation as GSDialogRow } from "../components/UpdateGroundStationDialog";
import UpdateAntennaDialog from "../components/UpdateAntennaDialog";
import type { AntennaDialogRow } from "../components/UpdateAntennaDialog";

/* Sub-dialogs for Operations */
import UpdateOperationDialog, { type OperationRow as OpRow } from "../components/UpdateOperationDialog";
import UpdateOperationRequesterDialog, { type OperationRequesterRow as ReqRow } from "../components/UpdateOperationRequesterDialog";
import UpdateOperationSupporterDialog, { type OperationSupporterRow as SupRow } from "../components/UpdateOperationSupporterDialog";

/* ✅ theme bridge */
import { vars, sxPresets } from "../ui/toast/themeBridge";
import {
  PREMIUM_CARD_SX, PAGINATION_SX,
  AmbientLighting, TableScanLine, glassRowHoverSx
} from "../ui/styles";

/* ---------- API endpoints ---------- */
const GS_API = "/api/ground-stations";
const OPS_API = "/api/operations";
const SUP_API = "/api/operation-supporters";
const REQ_API = "/api/operation-requesters";
const ANT_API = "/api/antennas";
const ANT_REQ_API = "/api/antenna-requests";

/* ✅ Status Colors */
const RED = "#FF2E63";

/* ✅ theme tokens */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;

/* ---------- Shared card + controls (premium glass style) ---------- */
const glassCtrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "36px", fontSize: 13, color: TEXT,
    backgroundColor: vars.bgCtrl, borderRadius: "12px",
    backdropFilter: "blur(10px)",
    "& fieldset": { borderColor: vars.borderWeak },
    "&:hover fieldset": { borderColor: vars.accent },
    "&.Mui-focused fieldset": { border: `1px solid ${vars.accent}` },
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
  color: "#fff",
  "&:hover": {
    background: `linear-gradient(135deg, #0ea5e9, #075985)`,
    transform: "translateY(-1px)",
    boxShadow: `0 10px 25px rgba(14, 165, 233, 0.35)`,
  },
  "&.Mui-disabled": { opacity: 0.5, color: "rgba(255,255,255,0.3)" }
} as const;

const LABEL_SX = {
  fontSize: 10.5,
  fontWeight: 900,
  color: ACCENT,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  mb: 0.8,
} as const;

/* ---------- Table Styles ---------- */
const theadCellSx = {
  px: 1,
  py: 1.5,
  fontWeight: 800,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: "var(--thead-text)",
  bgcolor: vars.bgThead,
  borderBottom: `1px solid ${vars.border}`,
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} as const;

const rowCellSx = {
  px: 1.25,
  py: 1,
  fontSize: 12.5,
  fontWeight: 600,
  color: TEXT,
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
} as const;

const terminalRowSx = (idx: number) => ({
  display: "grid",
  alignItems: "center",
  minHeight: 52,
  borderBottom: `1px solid ${vars.borderWeak}`,
  bgcolor: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
  position: "relative" as const,
  "&:hover": {
    bgcolor: vars.bgHover,
    "&::before": { opacity: 1 },
  },
  "&::before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "15%",
    bottom: "15%",
    width: "3px",
    background: `linear-gradient(to bottom, transparent, ${ACCENT}, transparent)`,
    boxShadow: `0 0 10px ${ACCENT}`,
    opacity: 0,
    transition: "opacity 0.2s ease",
  },
});

const pillSx = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: 13,
  px: 2,
  height: 32,
  borderRadius: 999,
  color: DIM,
  "&.Mui-selected": {
    color: "#fff",
    bgcolor: "rgba(14, 165, 233, 0.15)",
    boxShadow: `inset 0 0 0 1px ${ACCENT}`,
  },
  "&:hover": {
    bgcolor: "rgba(255,255,255,0.05)",
  },
} as const;

const paginationSx = {
  color: TEXT,
  "& .MuiTablePagination-toolbar": { minHeight: 48 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 13, fontWeight: 600 },
  "& .MuiTablePagination-select": { fontSize: 13, fontWeight: 700 },
  "& .MuiSvgIcon-root": { color: DIM }
};

const BAND_OPTIONS = [
  "UHF (300 MHz – 3 GHz)", "VHF (30 MHz – 300 MHz)", "L (1-2 GHz)",
  "S (2.0 – 2.3 GHz)", "C (4 – 8 GHz)", "X (8 – 12 GHz)",
  "Ku (12-18 GHz)", "Ka (26.5 to 40 GHz)"
];
const POL_OPTIONS = ["RHCP", "LHCP", "Linear"];
const TRACK_MODE_OPTIONS = ["TLE", "Auto Track", "Program", "Step Track", "Others"];

/* ---------- Types ---------- */
type TabKey = "stations" | "operations" | "antennas";

type AntennaRow = {
  id: number;
  __requestId?: number;
  type: string;
  location: string;
  size_m: string;
  eirp_dbw: string;
  tx_polarization: string;
  rx_polarization: string;
  travel_range: string;
  tracking_velocity: string;
  tracking_acceleration: string;
  tracking_modes: string;
  bands: any[];
  status?: "PENDING" | "APPROVED" | "REJECTED";
  added_by?: string;
};

/* ---------------- CAPTCHA ---------------- */
type Captcha = { text: string; svg: string };
function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick(chars: string, n: number) { let s = ""; for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; }
function makeCaptcha(width = 220, height = 80, length = 5): Captcha {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const text = pick(alphabet, length);
  const charW = width / (length + 1);
  const chars = [...text].map((ch, i) => {
    const x = (i + 1) * charW + rand(-8, 8);
    const y = height / 2 + rand(-6, 6);
    const r = rand(-25, 25);
    const fontSize = rand(32, 40);
    return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="900" 
              fill="#fff" text-anchor="middle" dominant-baseline="middle" 
              transform="rotate(${r} ${x} ${y})">${ch}</text>`;
  }).join("");
  const lines = Array.from({ length: 6 }).map(() => {
    const x1 = rand(0, width), y1 = rand(0, height);
    const x2 = rand(0, width), y2 = rand(0, height);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="rgba(255,255,255,0.3)" stroke-width="${rand(1, 2)}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#0a0a0c"/>
    <g filter="blur(0.5px)">${lines}${chars}</g>
  </svg>`.trim();
  return { text, svg };
}
function svgDataUrl(svg: string) { return "data:image/svg+xml;utf8," + encodeURIComponent(svg); }

function CaptchaDialog({ open, onCancel, onOk }: { open: boolean; onCancel: () => void; onOk: () => void; }) {
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
      PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}`, borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1.5 }}>
          <img src={svgDataUrl(cap.svg)} alt="captcha" style={{ width: "100%", height: 80, borderRadius: 12, border: `1px solid ${vars.border}` }} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Type letters")} size="small" fullWidth sx={glassCtrlSx} />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderRadius: "12px", borderColor: vars.border, color: vars.text }}>{t("Refresh")}</Button>
          </Box>
          {error && <Box sx={{ color: RED, fontSize: 12 }}>{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none", color: vars.textDim }}>{t("Cancel")}</Button>
        <Button onClick={submit} variant="contained" sx={{ ...premiumBtnSx, height: 38 }}>{t("Verify")}</Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- Status Badge ---------- */
function StatusBadge({ status }: { status: string }) {
  const s = String(status || "").toUpperCase();
  let color = "#00D9FF", bg = "rgba(0, 217, 255, 0.12)";

  if (s === "APPROVED") { color = "#00FF9D"; bg = "rgba(0, 255, 157, 0.12)"; }
  else if (s === "REJECTED") { color = "#FF2E63"; bg = "rgba(255, 46, 99, 0.12)"; }
  else if (s === "PENDING") { color = "#FFB800"; bg = "rgba(255, 184, 0, 0.12)"; }

  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center", gap: 0.8, px: 2, py: 0.6, borderRadius: "6px",
      bgcolor: bg, color, fontSize: 11, fontWeight: 900, border: `1px solid ${color}33`,
      textTransform: "uppercase", letterSpacing: "0.06em", minWidth: 100, justifyContent: "center",
      boxShadow: `0 0 10px ${color}15`
    }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: color, boxShadow: `0 0 8px ${color}` }} />
      {s}
    </Box>
  );
}
/* ================= Main Component ================= */
export default function Gsoperations() {
  const { user } = useAuth();
  const u = user as any;
  const { t } = useI18n();

  const role = String(u?.role || u?.roleName || sessionStorage.getItem("pmgt_role") || "").toLowerCase();
  const roleType = String(u?.roleType || sessionStorage.getItem("pmgt_role_type") || "").toLowerCase();
  const isAdmin = role === "admin" || role === "superadmin" || roleType === "admin" || String(u?.username).toLowerCase() === "isroadmin";

  const [tab, setTab] = React.useState<TabKey>("stations");
  const handleTab = (_: any, next: TabKey | null) => next && setTab(next);

  /* Tab Inner States */
  const [gsInner, setGsInner] = React.useState<"add" | "view">("view");
  const [antInner, setAntInner] = React.useState<"add" | "view">("view");

  /* Stations State */
  const [partner, setPartner] = React.useState("");
  const [locationSel, setLocationSel] = React.useState("");
  const [antennaSel, setAntennaSel] = React.useState<string[]>([]);
  const [gsRows, setGsRows] = React.useState<any[]>([]);
  const [gsPage, setGsPage] = React.useState(0);
  const [gsRpp, setGsRpp] = React.useState(20);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<GSDialogRow | null>(null);

  /* Antennas State */
  const [antType, setAntType] = React.useState("");
  const [antLoc, setAntLoc] = React.useState("");
  const [antSize, setAntSize] = React.useState("");
  const [antEirp, setAntEirp] = React.useState("");
  const [antTxPol, setAntTxPol] = React.useState<string[]>([]);
  const [antRxPol, setAntRxPol] = React.useState<string[]>([]);
  const [azFrom, setAzFrom] = React.useState("");
  const [azTo, setAzTo] = React.useState("");
  const [elFrom, setElFrom] = React.useState("");
  const [elTo, setElTo] = React.useState("");
  const [antVel, setAntVel] = React.useState("");
  const [antAcc, setAntAcc] = React.useState("");
  const [antModes, setAntModes] = React.useState("");
  const [bandRows, setBandRows] = React.useState<any[]>([]);
  const [curBand, setCurBand] = React.useState("");
  const [curGT, setCurGT] = React.useState("");
  const [isUp, setIsUp] = React.useState(false);
  const [isDown, setIsDown] = React.useState(false);

  const [antRows, setAntRows] = React.useState<AntennaRow[]>([]);
  const [antPage, setAntPage] = React.useState(0);
  const [antRpp, setAntRpp] = React.useState(20);
  const [antEditOpen, setAntEditOpen] = React.useState(false);
  const [antEditRow, setAntEditRow] = React.useState<AntennaDialogRow | null>(null);

  /* Operations State */
  const [opSubTab, setOpSubTab] = React.useState<"requesters" | "operations" | "supporters">("operations");
  const [opName, setOpName] = React.useState("");
  const [reqRows, setReqRows] = React.useState<any[]>([]);
  const [supRows, setSupRows] = React.useState<any[]>([]);
  const [opRowsList, setOpRowsList] = React.useState<any[]>([]);
  const [opPage, setOpPage] = React.useState(0);
  const [opRpp, setOpRpp] = React.useState(20);

  // Operation dialog states
  const [reqEditOpen, setReqEditOpen] = React.useState(false);
  const [reqEditRow, setReqEditRow] = React.useState<ReqRow | null>(null);
  const [supEditOpen, setSupEditOpen] = React.useState(false);
  const [supEditRow, setSupEditRow] = React.useState<SupRow | null>(null);
  const [opEditOpen, setOpEditOpen] = React.useState(false);
  const [opEditRow, setOpEditRow] = React.useState<OpRow | null>(null);

  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [captchaAction, setCaptchaAction] = React.useState<() => Promise<void>>();

  const ANT_GRID = isAdmin
    ? "50px 160px 100px 70px 80px 120px 120px 160px 70px 70px 100px 120px 100px minmax(200px, 1fr) 100px"
    : "50px 160px 100px 70px 80px 120px 120px 160px 70px 70px 100px 100px minmax(200px, 1fr) 100px";

  /* Loaders */
  const loadST = React.useCallback(async () => {
    try {
      const res = await api.get<any>(`${GS_API}?limit=1000`);
      setGsRows((res?.data ?? []).map((g: any) => {
        let added_by = g.added_by || "—";
        if (added_by === "UI") added_by = "System Admin";
        return {
          id: g.id, partner: g.supporting_partner, station: g.ground_station, antenna: g.antenna_name || g.antenna || "-",
          addedBy: added_by
        };
      }));
    } catch (e) { console.error(e); }
  }, []);

  const loadANT = React.useCallback(async () => {
    try {
      const res = await api.get<any>(`${ANT_API}?limit=1000`);
      const approved = (res?.data ?? []).map((a: any) => ({
        ...a, id: a.id, type: a.antenna_type, status: "APPROVED",
        tx_polarization: String(a.tx_polarization || ""),
        rx_polarization: String(a.rx_polarization || ""),
        travel_range: String(a.travel_range || ""),
        tracking_velocity: String(a.tracking_velocity || ""),
        tracking_acceleration: String(a.tracking_acceleration || ""),
        tracking_modes: String(a.tracking_modes || ""),
        bands: a.bands || []
      }));
      let pending: any[] = [];
      if (isAdmin) {
        try {
          const reqs = await api.get<any>(`${ANT_REQ_API}?status=pending`);
          pending = (reqs?.data ?? []).map((r: any) => ({
            ...r.payload, id: r.request_id, __requestId: r.request_id, status: "PENDING", added_by: r.requested_by
          }));
        } catch (e) { console.warn(e); }
      }
      setAntRows([...pending, ...approved]);
    } catch (e) { console.error(e); }
  }, [isAdmin]);

  const loadOPS = React.useCallback(async () => {
    try {
      const [o, s, r] = await Promise.all([
        api.get<any>(`${OPS_API}?limit=1000&sort_by=operation_name&sort_order=asc`),
        api.get<any>(`${SUP_API}?limit=1000&sort_by=supporter_name&sort_order=asc`),
        api.get<any>(`${REQ_API}?limit=1000&sort_by=requester_name&sort_order=asc`)
      ]);
      setOpRowsList((o?.data || []).map((v: any) => {
        let addedBy = v.added_by || "Admin";
        if (addedBy === "UI") addedBy = "System Admin";
        return { id: v.id, name: v.operation_name, added_by: addedBy };
      }));
      setSupRows((s?.data || []).map((v: any) => {
        let addedBy = v.added_by || "Admin";
        if (addedBy === "UI") addedBy = "System Admin";
        return { id: v.id, name: v.supporter_name, added_by: addedBy };
      }));
      setReqRows((r?.data || []).map((v: any) => {
        let addedBy = v.added_by || "Admin";
        if (addedBy === "UI") addedBy = "System Admin";
        return { id: v.id, name: v.requester_name, added_by: addedBy };
      }));
    } catch (e) { console.error(e); }
  }, []);

  React.useEffect(() => { loadST(); loadANT(); loadOPS(); }, [loadST, loadANT, loadOPS]);

  const addBand = () => {
    if (!curBand || !curGT || (!isUp && !isDown)) return;
    setBandRows(p => [...p, { band: curBand, gt: curGT, uplink: isUp, downlink: isDown }]);
    setCurGT(""); setIsUp(false); setIsDown(false);
  };

  const clearAddAnt = () => {
    setAntType(""); setAntLoc(""); setAntSize(""); setAntEirp(""); setAntTxPol([]); setAntRxPol([]);
    setAzFrom(""); setAzTo(""); setElFrom(""); setElTo(""); setAntVel(""); setAntAcc(""); setAntModes(""); setBandRows([]);
  };

  const handleAddAnt = async () => {
    const range = (azFrom && azTo && elFrom && elTo) ? `${azFrom}° - ${azTo}° Az, ${elFrom}° - ${elTo}° El` : "";
    const payload = {
      antenna_type: antType, location: antLoc, size_m: antSize, eirp_dbw: antEirp,
      tx_polarization: antTxPol.join(", "), rx_polarization: antRxPol.join(", "),
      travel_range: range, tracking_velocity: antVel, tracking_acceleration: antAcc, tracking_modes: antModes,
      bands: bandRows, receive_gt: bandRows.map(b => ({ band: b.band, gt: b.gt })), added_by: user?.username || "Admin"
    };
    try {
      if (isAdmin) await api.post(ANT_API, payload);
      else await api.post(ANT_REQ_API, { payload });
      toast.success(isAdmin ? "Antenna Added" : "Request Sent for Approval");
      loadANT(); clearAddAnt(); setAntInner("view");
    } catch (e) { toast.error("Failed to add antenna"); }
  };

  const handleAddST = async () => {
    if (!partner || !locationSel || antennaSel.length === 0) return;
    try {
      const name = antennaSel.join(", ");
      await api.post(GS_API, { supporting_partner: partner, ground_station: locationSel, antenna: name, added_by: user?.username || "Admin" });
      toast.success("Station Added"); loadST(); setPartner(""); setLocationSel(""); setAntennaSel([]); setGsInner("view");
    } catch (e) { toast.error("Failed to add station"); }
  };

  const handleAddOP = async () => {
    if (!opName.trim()) return;
    try {
      let endpoint = OPS_API;
      let payload: any = { added_by: user?.username || "Admin" };
      if (opSubTab === "operations") { endpoint = OPS_API; payload.operation_name = opName.trim(); }
      else if (opSubTab === "supporters") { endpoint = SUP_API; payload.supporter_name = opName.trim(); }
      else { endpoint = REQ_API; payload.requester_name = opName.trim(); }

      await api.post(endpoint, payload);
      toast.success(t("Added successfully"));
      setOpName(""); loadOPS();
    } catch (e) { toast.error(t("Failed to add")); }
  };

  /* Dialog Handlers */
  const onEditST = (r: any) => { setEditRow({ id: r.id, partner: r.partner, station: r.station, antennas: typeof r.antenna === "string" ? r.antenna.split(",").map((s: string) => s.trim()).filter(Boolean) : [] }); setEditOpen(true); };
  const onSaveST = async (u: any) => {
    try {
      await api.put(`${GS_API}/${u.id}`, {
        supporting_partner: u.partner,
        ground_station: u.station,
        antenna: (u.antennas || []).join(", "),
        added_by: user?.username || "Admin"
      });
      setEditOpen(false); loadST(); toast.success("Updated");
    } catch (e) { toast.error("Update failed"); }
  };
  const onDelST = async (u: any) => { try { await api.del(`${GS_API}/${u.id}`); setEditOpen(false); loadST(); toast.success("Deleted"); } catch (e) { toast.error("Delete failed"); } };

  const onEditANT = (a: any) => {
    setAntEditRow({
      ...a,
      tx_polarization: (a.tx_polarization || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      rx_polarization: (a.rx_polarization || "").split(",").map((s: string) => s.trim()).filter(Boolean)
    });
    setAntEditOpen(true);
  };
  const onSaveANT = async (u: any) => {
    try {
      const payload = {
        ...u,
        antenna_type: u.type, // Map 'type' to backend's 'antenna_type'
        added_by: user?.username || "Admin",
        tx_polarization: (u.tx_polarization || []).join(", "),
        rx_polarization: (u.rx_polarization || []).join(", ")
      };
      await api.put(`${ANT_API}/${u.id}`, payload);
      setAntEditOpen(false); loadANT(); toast.success("Antenna Updated");
    } catch (e) { toast.error("Update failed"); }
  };
  const onDelANT = async (u: any) => {
    if (u.status === "PENDING" && !isAdmin) { toast.error("Pending antennas cannot be deleted by non-admins."); return; }
    try {
      await api.del(`${ANT_API}/${u.id}`);
      setAntEditOpen(false); loadANT(); toast.success("Antenna Deleted");
    } catch (e) { toast.error("Delete failed"); }
  };

  const triggerCaptcha = (action: () => Promise<void>) => { setCaptchaAction(() => action); setCaptchaOpen(true); };

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, pt: 1, pb: 2, height: `calc(100vh - ${TOPBAR_HEIGHT}px)`, bgcolor: vars.bgApp, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ToggleButtonGroup value={tab} exclusive onChange={handleTab} sx={{ p: 0.5, borderRadius: "16px", border: `1px solid ${vars.border}`, bgcolor: vars.bgCard, height: 40 }}>
            <ToggleButton value="stations" sx={pillSx}>{t("Ground Stations")}</ToggleButton>
            <ToggleButton value="operations" sx={pillSx}>{t("Operations")}</ToggleButton>
            {(isAdmin || roleType === "editor") && <ToggleButton value="antennas" sx={pillSx}>{t("Antennas")}</ToggleButton>}
          </ToggleButtonGroup>
        </Box>

        <Card sx={{ ...PREMIUM_CARD_SX, flex: 1 }}>
          <AmbientLighting />

          <Box sx={{ px: 3, py: 1.5, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "rgba(255,255,255,0.01)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
              <Typography sx={{ fontWeight: 900, fontSize: 16, color: TEXT, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {tab === "stations" ? t("Ground Stations") : tab === "operations" ? t("Operations Hub") : t("Antenna Management")}
              </Typography>
              {tab !== "operations" && (
                <ToggleButtonGroup
                  value={tab === "stations" ? gsInner : antInner}
                  exclusive
                  onChange={(_, n) => {
                    if (!n) return;
                    if (tab === "stations") setGsInner(n as any);
                    else if (tab === "antennas") setAntInner(n as any);
                  }}
                  sx={{ p: 0.4, borderRadius: "10px", border: `1px solid ${vars.border}`, bgcolor: "rgba(0,0,0,0.2)" }}
                >
                  <ToggleButton value="add" sx={{ ...pillSx, borderRadius: "8px", height: 26, fontSize: 11 }}>{t("ADD NEW")}</ToggleButton>
                  <ToggleButton value="view" sx={{ ...pillSx, borderRadius: "8px", height: 26, fontSize: 11 }}>{t("VIEW LIST")}</ToggleButton>
                </ToggleButtonGroup>
              )}
            </Box>
            {tab === "stations" && gsInner === "view" && <Button size="small" startIcon={<PrintRoundedIcon />} sx={{ color: DIM, textTransform: "none", fontWeight: 700 }}>{t("Export PDF")}</Button>}
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* TABS: STATIONS */}
            {tab === "stations" && (
              <>
                {gsInner === "add" ? (
                    <Box sx={{ p: 4, overflowY: "auto", ...sxPresets.scroller }}>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 4 }}>
                        <Stack spacing={1}><Typography sx={LABEL_SX}>{t("TTC Service Provider")}</Typography><FormControl fullWidth size="small"><Select value={partner} onChange={e => setPartner(e.target.value)} displayEmpty renderValue={v => v ? v : t("Select TTC Provider")} sx={glassCtrlSx}><MenuItem value="" disabled>{t("Select TTC Provider")}</MenuItem>{supRows.map(s => <MenuItem key={s.id} value={s.name}>{s.name}</MenuItem>)}</Select></FormControl></Stack>
                        <Stack spacing={1}><Typography sx={LABEL_SX}>{t("Location")}</Typography><FormControl fullWidth size="small"><Select value={locationSel} onChange={e => { setLocationSel(e.target.value); setAntennaSel([]); }} displayEmpty renderValue={v => v ? v : t("Select Location")} sx={glassCtrlSx}><MenuItem value="" disabled>{t("Select Location")}</MenuItem>{Array.from(new Set(antRows.map(a => a.location).filter(Boolean))).map(loc => <MenuItem key={loc as string} value={loc as string}>{loc as string}</MenuItem>)}</Select></FormControl></Stack>
                        <Stack spacing={1}><Typography sx={LABEL_SX}>{t("Antenna Selection")}</Typography><FormControl fullWidth size="small"><Select multiple value={antennaSel} onChange={e => setAntennaSel(typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value)} displayEmpty renderValue={sel => sel.length ? sel.join(", ") : t("Select Antenna")} sx={glassCtrlSx}><MenuItem value="" disabled sx={{ display: "none" }}>{t("Select Antenna")}</MenuItem>{Array.from(new Set(antRows.filter(a => a.location === locationSel).map(a => a.type))).map(type => <MenuItem key={type} value={type}><Checkbox checked={antennaSel.indexOf(type) > -1} size="small" /><ListItemText primary={type} /></MenuItem>)}</Select></FormControl></Stack>
                      </Box>

                      {/* ✅ Antenna Detail Preview Table */}
                      {locationSel && antennaSel.length > 0 && (() => {
                        const selAnts = antRows.filter(a => a.location === locationSel && antennaSel.includes(a.type));
                        if (!selAnts.length) return null;
                        return (
                          <Box sx={{ mt: 4, p: 2, borderRadius: "16px", border: `1px solid ${vars.borderWeak}`, background: "rgba(255,255,255,0.01)", position: "relative" }}>
                            <Typography sx={{ ...LABEL_SX, mb: 2 }}>{t("Selected Antenna Details")}</Typography>
                            <Box sx={{ overflowX: "auto", ...sxPresets.scroller }}>
                              <Box sx={{ minWidth: 1000 }}>
                                <Box sx={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr 1.5fr 1.5fr 1fr", borderBottom: `1px solid ${vars.borderWeak}` }}>
                                  {[t("Antenna Type"), t("Location"), t("Size (m)"), t("EIRP (dBW)"), t("TX Pol"), t("RX Pol"), t("Travel Range"), t("Tracking")].map(h => (
                                    <Box key={h} sx={{ ...theadCellSx, borderBottom: "none", py: 1 }}>{h}</Box>
                                  ))}
                                </Box>
                                {selAnts.map(sel => (
                                  <Box key={sel.id} sx={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1.5fr 1.5fr 1.5fr 1fr", borderBottom: `1px solid ${vars.borderWeak}`, "&:last-child": { borderBottom: "none" } }}>
                                    <Box sx={rowCellSx}>{sel.type}</Box>
                                    <Box sx={rowCellSx}>{sel.location}</Box>
                                    <Box sx={rowCellSx}>{sel.size_m || "—"}</Box>
                                    <Box sx={rowCellSx}>{sel.eirp_dbw || "—"}</Box>
                                    <Box sx={rowCellSx}>{sel.tx_polarization || "—"}</Box>
                                    <Box sx={rowCellSx}>{sel.rx_polarization || "—"}</Box>
                                    <Box sx={rowCellSx}>{sel.travel_range || "—"}</Box>
                                    <Box sx={rowCellSx}>{sel.tracking_modes || "—"}</Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          </Box>
                        );
                      })()}

                      <Box sx={{ mt: 6, display: "flex", justifyContent: "flex-end" }}><Button variant="contained" onClick={() => triggerCaptcha(handleAddST)} sx={premiumBtnSx}>{t("Save Station Profile")}</Button></Box>
                    </Box>
                ) : (
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2, ...sxPresets.scroller, position: "relative" }}>
                      <TableScanLine />
                      <Box sx={{ width: "100%", minWidth: 1200 }}>
                        <Box sx={{ position: "sticky", top: 0, zIndex: 10, display: "grid", gridTemplateColumns: "80px 1.5fr 1fr 1.5fr 1fr 100px", bgcolor: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${vars.border}` }}>
                          {[t("Sr No"), t("TTC Provider"), t("Location"), t("Antenna"), t("Added By"), t("Action")].map(h => <Box key={h} sx={theadCellSx}>{h}</Box>)}
                        </Box>
                        {gsRows.slice(gsPage * gsRpp, gsPage * gsRpp + gsRpp).map((r, i) => (
                          <Box key={r.id} sx={{ ...terminalRowSx(i), gridTemplateColumns: "80px 1.5fr 1fr 1.5fr 1fr 100px", ...glassRowHoverSx }}>
                            <Box sx={rowCellSx}>{gsPage * gsRpp + i + 1}</Box>
                            <Box sx={rowCellSx}>{r.partner}</Box>
                            <Box sx={rowCellSx}>{r.station}</Box>
                            <Box sx={{ ...rowCellSx, whiteSpace: "normal" }}>{r.antenna}</Box>
                            <Box sx={rowCellSx}>{r.addedBy}</Box>
                            <Box sx={rowCellSx}><Button size="small" onClick={() => onEditST(r)} sx={{ color: TEXT, bgcolor: "rgba(255,255,255,0.01)", border: `1px solid ${vars.borderWeak}`, borderRadius: "8px", textTransform: "none", fontSize: 11, fontWeight: 700 }}>Edit</Button></Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <TablePagination component="div" count={gsRows.length} page={gsPage} onPageChange={(_, p) => setGsPage(p)} rowsPerPage={gsRpp} onRowsPerPageChange={e => { setGsRpp(parseInt(e.target.value, 10)); setGsPage(0); }} rowsPerPageOptions={[10, 20, 50, 100]} sx={PAGINATION_SX} />
                  </Box>
                )}
              </>
            )}

            {/* TABS: OPERATIONS */}
            {tab === "operations" && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Sub-tabs and Add bar container */}
                <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.01)" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <ToggleButtonGroup value={opSubTab} exclusive onChange={(_, n) => n && setOpSubTab(n)} sx={{ p: 0.4, borderRadius: "10px", border: `1px solid ${vars.border}`, bgcolor: vars.bgCtrl }}>
                      <ToggleButton value="requesters" sx={{ ...pillSx, borderRadius: "8px", height: 26, fontSize: 11 }}>{t("Operation Requesters")}</ToggleButton>
                      <ToggleButton value="operations" sx={{ ...pillSx, borderRadius: "8px", height: 26, fontSize: 11 }}>{t("Operations")}</ToggleButton>
                      <ToggleButton value="supporters" sx={{ ...pillSx, borderRadius: "8px", height: 26, fontSize: 11 }}>{t("TTC Service Providers")}</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField size="small" value={opName} onChange={e => setOpName(e.target.value)} placeholder={opSubTab === "operations" ? t("Operation name") : opSubTab === "supporters" ? t("Supporter name") : t("Requester name")} sx={{ ...glassCtrlSx, flex: 1 }} />
                    <Button variant="contained" onClick={() => triggerCaptcha(handleAddOP)} sx={{ ...premiumBtnSx, height: 36 }}>{t("Add")} {opSubTab === "operations" ? t("Mission") : t("Entity")}</Button>
                  </Box>
                </Box>

                {/* Operations Table */}
                <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2, ...sxPresets.scroller }}>
                    <Box sx={{ width: "100%", minWidth: 1000 }}>
                      <Box sx={{ position: "sticky", top: 0, zIndex: 10, display: "grid", gridTemplateColumns: "80px 1.5fr 1fr 120px", bgcolor: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${vars.border}` }}>
                        {[t("Sr No"), t("Name"), t("Added By"), t("Action")].map(h => <Box key={h} sx={theadCellSx}>{h}</Box>)}
                      </Box>
                      {(opSubTab === "requesters" ? reqRows : opSubTab === "supporters" ? supRows : opRowsList).slice(opPage * opRpp, opPage * opRpp + opRpp).map((r, i) => (
                        <Box key={r.id} sx={{ ...terminalRowSx(i), gridTemplateColumns: "80px 1.5fr 1fr 120px" }}>
                          <Box sx={rowCellSx}>{opPage * opRpp + i + 1}</Box>
                          <Box sx={rowCellSx}>{r.name}</Box>
                          <Box sx={rowCellSx}>{r.added_by}</Box>
                          <Box sx={rowCellSx}>
                            <Button size="small" onClick={() => {
                              if (opSubTab === "requesters") { setReqEditRow({ id: r.id, name: r.name, addedBy: r.added_by }); setReqEditOpen(true); }
                              else if (opSubTab === "supporters") { setSupEditRow({ id: r.id, name: r.name, addedBy: r.added_by }); setSupEditOpen(true); }
                              else { setOpEditRow({ id: r.id, name: r.name, addedBy: r.added_by }); setOpEditOpen(true); }
                            }} sx={{ color: TEXT, bgcolor: "rgba(255,255,255,0.01)", border: `1px solid ${vars.borderWeak}`, borderRadius: "8px", textTransform: "none", fontSize: 11, fontWeight: 700 }}>{t("Edit")}</Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <TablePagination component="div" count={(opSubTab === "requesters" ? reqRows : opSubTab === "supporters" ? supRows : opRowsList).length} page={opPage} onPageChange={(_, p) => setOpPage(p)} rowsPerPage={opRpp} onRowsPerPageChange={e => { setOpRpp(parseInt(e.target.value, 10)); setOpPage(0); }} rowsPerPageOptions={[10, 20, 50, 100]} sx={paginationSx} />
                </Box>
              </Box>
            )}

            {/* TABS: ANTENNAS */}
            {tab === "antennas" && (
              <>
                {antInner === "add" ? (
                  <Box sx={{ p: 4, overflowY: "auto", ...sxPresets.scroller }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "2fr 2fr 1fr 1fr" }, gap: 3 }}>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>Antenna Name <span style={{ color: "#FF2E63" }}>*</span></Typography><TextField size="small" value={antType} onChange={e => setAntType(e.target.value)} placeholder="BAL1" sx={glassCtrlSx} /></Stack>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>Location <span style={{ color: "#FF2E63" }}>*</span></Typography><TextField size="small" value={antLoc} onChange={e => setAntLoc(e.target.value)} placeholder="Bangalore" sx={glassCtrlSx} /></Stack>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>Antenna Size (m) <span style={{ color: "#FF2E63" }}>*</span></Typography><TextField size="small" value={antSize} onChange={e => setAntSize(e.target.value)} placeholder="e.g. 3.7" sx={glassCtrlSx} /></Stack>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>EIRP (dBW) <span style={{ color: "#FF2E63" }}>*</span></Typography><TextField size="small" value={antEirp} onChange={e => setAntEirp(e.target.value)} placeholder="e.g. 52.5" sx={glassCtrlSx} /></Stack>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3, mt: 3 }}>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>Transmit Polarization <span style={{ color: "#FF2E63" }}>*</span></Typography><FormControl fullWidth size="small"><Select multiple value={antTxPol} onChange={e => setAntTxPol(e.target.value as string[])} displayEmpty renderValue={s => s.length ? s.join(", ") : "Select Transmit Polarization"} sx={glassCtrlSx}>{POL_OPTIONS.map(p => <MenuItem key={p} value={p}><Checkbox checked={(antTxPol || []).includes(p)} size="small" /><ListItemText primary={p} /></MenuItem>)}</Select></FormControl></Stack>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>Receive Polarization <span style={{ color: "#FF2E63" }}>*</span></Typography><FormControl fullWidth size="small"><Select multiple value={antRxPol} onChange={e => setAntRxPol(e.target.value as string[])} displayEmpty renderValue={s => s.length ? s.join(", ") : "Select Receive Polarization"} sx={glassCtrlSx}>{POL_OPTIONS.map(p => <MenuItem key={p} value={p}><Checkbox checked={(antRxPol || []).includes(p)} size="small" /><ListItemText primary={p} /></MenuItem>)}</Select></FormControl></Stack>
                      <Stack spacing={1}>
                        <Typography sx={LABEL_SX}>Antenna Travel Range (°) <span style={{ color: "#FF2E63" }}>*</span></Typography>
                        <Box sx={{ display: "grid", gridTemplateColumns: "auto 1fr auto 1fr auto 1fr auto 1fr", gap: 1, alignItems: "center" }}>
                          <Typography sx={{ fontSize: 11, color: DIM }}>Az From</Typography>
                          <TextField size="small" value={azFrom} onChange={e => setAzFrom(e.target.value)} placeholder="0" sx={glassCtrlSx} />
                          <Typography sx={{ fontSize: 11, color: DIM }}>To</Typography>
                          <TextField size="small" value={azTo} onChange={e => setAzTo(e.target.value)} placeholder="359" sx={glassCtrlSx} />
                          <Typography sx={{ fontSize: 11, color: DIM }}>El From</Typography>
                          <TextField size="small" value={elFrom} onChange={e => setElFrom(e.target.value)} placeholder="5" sx={glassCtrlSx} />
                          <Typography sx={{ fontSize: 11, color: DIM }}>To</Typography>
                          <TextField size="small" value={elTo} onChange={e => setElTo(e.target.value)} placeholder="90" sx={glassCtrlSx} />
                        </Box>
                      </Stack>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3, mt: 3 }}>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>Tracking Velocity (°/s) <span style={{ color: "#FF2E63" }}>*</span></Typography><TextField size="small" value={antVel} onChange={e => setAntVel(e.target.value)} placeholder="e.g. 20" sx={glassCtrlSx} /></Stack>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>Tracking Acceleration (°/s²) <span style={{ color: "#FF2E63" }}>*</span></Typography><TextField size="small" value={antAcc} onChange={e => setAntAcc(e.target.value)} placeholder="e.g. 100" sx={glassCtrlSx} /></Stack>
                      <Stack spacing={1}><Typography sx={LABEL_SX}>Tracking Modes <span style={{ color: "#FF2E63" }}>*</span></Typography><FormControl fullWidth size="small"><Select value={antModes} onChange={e => setAntModes(e.target.value)} displayEmpty renderValue={v => v || "Select Tracking Mode"} sx={glassCtrlSx}>{TRACK_MODE_OPTIONS.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}</Select></FormControl></Stack>
                    </Box>

                    <Box sx={{ mt: 4, p: 3, borderRadius: "20px", border: `1px solid ${vars.border}`, background: "rgba(255,255,255,0.01)" }}>
                      <Typography sx={{ ...LABEL_SX, mb: 2 }}>Bands/Carriers <span style={{ color: "#FF2E63" }}>*</span></Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 80px 80px auto", gap: 2, alignItems: "center", mb: 2 }}>
                        <Select size="small" value={curBand} onChange={e => setCurBand(e.target.value)} sx={glassCtrlSx} displayEmpty renderValue={v => v ? v : t("Select Band")}>
                          {BAND_OPTIONS.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                        </Select>
                        <TextField size="small" value={curGT} onChange={e => setCurGT(e.target.value)} placeholder="G/T (dB/K)" sx={glassCtrlSx} />
                        <FormControlLabel control={<Checkbox checked={isUp} onChange={e => setIsUp(e.target.checked)} color="info" size="small" />} label={<Typography sx={{ fontSize: 11, fontWeight: 800 }}>UL</Typography>} />
                        <FormControlLabel control={<Checkbox checked={isDown} onChange={e => setIsDown(e.target.checked)} color="info" size="small" />} label={<Typography sx={{ fontSize: 11, fontWeight: 800 }}>DL</Typography>} />
                        <Button variant="outlined" onClick={addBand} sx={{ borderRadius: "10px", borderColor: vars.border, color: TEXT, textTransform: "none", px: 3 }}>Add</Button>
                      </Box>
                      <Stack spacing={1}>
                        {bandRows.map((b, i) => (
                          <Box key={i} sx={{ px: 2, py: 1.2, bgcolor: "rgba(255,255,255,0.02)", border: `1px solid ${vars.borderWeak}`, borderRadius: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{b.band}</Typography>
                            <Box sx={{ display: "flex", gap: 3 }}>
                              <Typography sx={{ fontSize: 12, color: DIM }}>G/T: <b>{b.gt}</b></Typography>
                              <Typography sx={{ fontSize: 12, color: DIM }}>TX: <b style={{ color: b.uplink ? ACCENT : DIM }}>{b.uplink ? "YES" : "NO"}</b></Typography>
                              <Typography sx={{ fontSize: 12, color: DIM }}>RX: <b style={{ color: b.downlink ? ACCENT : DIM }}>{b.downlink ? "YES" : "NO"}</b></Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                    <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end" }}><Button variant="contained" onClick={() => triggerCaptcha(handleAddAnt)} sx={premiumBtnSx}>Save</Button></Box>
                  </Box>
                ) : (
                  <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2, ...sxPresets.scroller }}>
                      <Box sx={{ width: "100%", minWidth: 1600 }}>
                        <Box sx={{ position: "sticky", top: 0, zIndex: 10, display: "grid", gridTemplateColumns: ANT_GRID, bgcolor: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", borderBottom: `1px solid ${vars.border}` }}>
                          {[t("Sr No"), t("Name"), t("Loc"), t("Size"), t("EIRP"), t("Tx Pol"), t("Rx Pol"), t("Range"), t("Vel"), t("Acc"), t("Modes"), ...(isAdmin ? [t("Status")] : []), t("Added By"), t("Bands"), t("Action")].map(h => <Box key={h} sx={theadCellSx}>{h}</Box>)}
                        </Box>
                        {antRows.slice(antPage * antRpp, antPage * antRpp + antRpp).map((a, i) => (
                          <Box key={a.id} sx={{ ...terminalRowSx(i), gridTemplateColumns: ANT_GRID }}>
                            <Box sx={rowCellSx}>{antPage * antRpp + i + 1}</Box>
                            <Box sx={rowCellSx}>{a.type}</Box>
                            <Box sx={rowCellSx}>{a.location}</Box>
                            <Box sx={rowCellSx}>{a.size_m}m</Box>
                            <Box sx={rowCellSx}>{a.eirp_dbw}</Box>
                            <Box sx={rowCellSx}>{a.tx_polarization}</Box>
                            <Box sx={rowCellSx}>{a.rx_polarization}</Box>
                            <Box sx={rowCellSx}>{a.travel_range}</Box>
                            <Box sx={rowCellSx}>{a.tracking_velocity}</Box>
                            <Box sx={rowCellSx}>{a.tracking_acceleration}</Box>
                            <Box sx={rowCellSx}>{a.tracking_modes}</Box>
                            {isAdmin && <Box sx={rowCellSx}><StatusBadge status={a.status || "APPROVED"} /></Box>}
                            <Box sx={rowCellSx}>{a.added_by || "—"}</Box>
                            <Box sx={{ ...rowCellSx, fontSize: 11.5, color: DIM, textAlign: "left", justifyContent: "flex-start", overflow: "hidden", gap: 1, px: 2 }}>
                              {(a.bands || []).map((b: any, idx: number) => (
                                <Box key={idx} sx={{ display: "flex", alignItems: "center", gap: 1.5, bgcolor: "rgba(255,255,255,0.03)", px: 1.5, py: 0.5, borderRadius: "6px", border: `1px solid ${vars.borderWeak}` }}>
                                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: TEXT }}>{b.band}</Typography>
                                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: b.uplink ? ACCENT : DIM, opacity: b.uplink ? 1 : 0.4 }}>UL</Typography>
                                    <Typography sx={{ fontSize: 10, fontWeight: 800, color: b.downlink ? ACCENT : DIM, opacity: b.downlink ? 1 : 0.4 }}>DL</Typography>
                                    {b.gt && <Typography sx={{ fontSize: 10, fontWeight: 600, color: DIM, borderLeft: `1px solid ${vars.borderWeak}`, pl: 1 }}>{b.gt} dB/K</Typography>}
                                  </Box>
                                </Box>
                              ))}
                              {(a.bands || []).length === 0 && "—"}
                            </Box>
                            <Box sx={rowCellSx}><Button size="small" onClick={() => onEditANT(a)} sx={{ color: TEXT, bgcolor: "rgba(255,255,255,0.03)", border: `1px solid ${vars.borderWeak}`, borderRadius: "8px", px: 2.5, py: 0.6, textTransform: "none", fontSize: 11, fontWeight: 700, "&:hover": { borderColor: ACCENT, bgcolor: "rgba(14, 165, 233, 0.1)" } }}>Edit</Button></Box>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                    <TablePagination component="div" count={antRows.length} page={antPage} onPageChange={(_, p) => setAntPage(p)} rowsPerPage={antRpp} onRowsPerPageChange={e => { setAntRpp(parseInt(e.target.value, 10)); setAntPage(0); }} rowsPerPageOptions={[10, 20, 50, 100]} sx={paginationSx} />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Card>
      </Box>

      <CaptchaDialog open={captchaOpen} onCancel={() => setCaptchaOpen(false)} onOk={() => { setCaptchaOpen(false); captchaAction?.(); }} />

      <UpdateGroundStationDialog open={editOpen} row={editRow} antennaOptions={editRow ? Array.from(new Set(antRows.filter(a => a.location === editRow.station).map(a => a.type))) : []} onClose={() => setEditOpen(false)} onSave={onSaveST} onDelete={onDelST} />
      <UpdateAntennaDialog open={antEditOpen} row={antEditRow} onClose={() => setAntEditOpen(false)} onSave={onSaveANT} onDelete={onDelANT} />

      <UpdateOperationRequesterDialog open={reqEditOpen} row={reqEditRow} onClose={() => setReqEditOpen(false)} onSave={async u => {
        try { await api.put(`${REQ_API}/${u.id}`, { requester_name: u.name, added_by: u.addedBy || "Admin" }); setReqEditOpen(false); loadOPS(); toast.success(t("Updated")); } catch (e) { toast.error(t("Update failed")); }
      }} onDelete={async d => {
        try { await api.del(`${REQ_API}/${d.id}`); setReqEditOpen(false); loadOPS(); toast.success(t("Deleted")); } catch (e) { toast.error(t("Delete failed")); }
      }} />

      <UpdateOperationSupporterDialog open={supEditOpen} row={supEditRow} onClose={() => setSupEditOpen(false)} onSave={async u => {
        try { await api.put(`${SUP_API}/${u.id}`, { supporter_name: u.name, added_by: u.addedBy || "Admin" }); setSupEditOpen(false); loadOPS(); toast.success(t("Updated")); } catch (e) { toast.error(t("Update failed")); }
      }} onDelete={async d => {
        try { await api.del(`${SUP_API}/${d.id}`); setSupEditOpen(false); loadOPS(); toast.success(t("Deleted")); } catch (e) { toast.error(t("Delete failed")); }
      }} />

      <UpdateOperationDialog open={opEditOpen} row={opEditRow} onClose={() => setOpEditOpen(false)} onSave={async u => {
        try { await api.put(`${OPS_API}/${u.id}`, { operation_name: u.name, added_by: u.addedBy || "Admin" }); setOpEditOpen(false); loadOPS(); toast.success(t("Updated")); } catch (e) { toast.error(t("Update failed")); }
      }} onDelete={async d => {
        try { await api.del(`${OPS_API}/${d.id}`); setOpEditOpen(false); loadOPS(); toast.success(t("Deleted")); } catch (e) { toast.error(t("Delete failed")); }
      }} />
    </MainLayout>
  );
}
