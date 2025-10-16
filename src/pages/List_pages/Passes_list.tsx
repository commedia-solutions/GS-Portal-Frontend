// src/pages/List_pages/Passes_list.tsx
import React from "react";
import {
  Box,
  Card,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  TablePagination,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import UpdatePassModal from "../../components/Models/UpdatePassModal";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useI18n } from "../../i18n";
import { getAuthToken } from "../../api/http"; // ✅ use the same auth source as the rest of the app

/* ==================== API wiring ==================== */
const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any)?.env?.VITE_API_BASE) ||
  (typeof globalThis !== "undefined" && (globalThis as any)?.process?.env?.REACT_APP_API_BASE) ||
  "";

const PASSES_URL = `${String(API_BASE).replace(/\/$/, "")}/api/passes`;

type ApiPass = {
  id: number;
  pass_req_no: string;
  date_text: string;
  satellite_name: string;
  supporting_station: string;
  orbit_no: string;
  max_el_deg: string;
  aos_ut: string;
  los_ut: string;
  operations?: string | null;
  operations_requester?: string | null;
  operations_supporter?: string | null;
  schedule_status: string;
  pass_status: string;
  remarks?: string | null;
  added_by?: string | null;
  pass_type?: "Normal" | "Emergency" | string | null;
};

async function httpText(method: string, url: string, body?: any): Promise<string> {
  // ✅ always read the fresh token (memory + local/session) via our shared helper
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed: ${res.status}`);
  return text;
}
async function httpJSON<T = any>(method: string, url: string, body?: any): Promise<T> {
  const text = await httpText(method, url, body);
  try { return JSON.parse(text) as T; } catch { throw new Error("API returned non-JSON payload."); }
}
function ymd(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
const api = {
  // ✅ add a cache-buster just like the satellites page so the list always refreshes
  list: () => httpJSON<ApiPass[]>("GET", `${PASSES_URL}?_=${Date.now()}`),
  exportCsv: () => httpText("GET", `${PASSES_URL}/export`),
  exportRangeCsv: (fromYMD: string, toYMD: string) =>
    httpText("GET", `${PASSES_URL}/export-range?from=${encodeURIComponent(fromYMD)}&to=${encodeURIComponent(toYMD)}`),
};

/* ==================== THEME TOKENS ==================== */
const TOK = {
  TEXT: "var(--text)",
  TEXT_DIM: "var(--text-dim)",
  CARD_BG: "var(--bg-card)",
  CONTROL_BG: "var(--bg-ctrl)",
  BORDER_STR: "1px solid var(--border)",
  BORDER_WEAK: "var(--border-weak)",
  ICON: "var(--text)",
  ACCENT: "var(--accent)",
  HOVER: "var(--bg-hover)",
  SCROLLBAR: "var(--scrollbar)",
} as const;

const SCROLLER_SX = {
  scrollbarWidth: "thin",
  scrollbarColor: `${TOK.SCROLLBAR} transparent`,
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: TOK.SCROLLBAR, borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: TOK.SCROLLBAR },
  "&::-webkit-scrollbar-track": { background: "transparent" },
} as const;

/* ==================== UI sizes ==================== */
const UI = {
  ctrlH: 30,
  font: 13,
  icon: 16,
  gap: 0.75,
  headerPx: 1.25,
  headerPy: 0.6,
  searchW: 150,
  selectW: 120,
  dateW: 130,
  paginationH: 36,
};

const BTN = {
  enabled: (bg: string, hover: string) => ({
    textTransform: "none",
    fontWeight: 700,
    px: 1.4,
    py: 0.6,
    borderRadius: 1,
    bgcolor: bg,
    color: "#fff",
    "& .MuiSvgIcon-root": { color: "#fff" },
    "&:hover": { bgcolor: hover },
  }),
  disabled: {
    textTransform: "none",
    fontWeight: 700,
    px: 1.4,
    py: 0.6,
    borderRadius: 1,
    bgcolor: "rgba(0,0,0,0.06)",
    color: "rgba(0,0,0,0.38)",
    border: `1px solid ${TOK.BORDER_WEAK}`,
    "& .MuiSvgIcon-root": { color: "rgba(0,0,0,0.38)" },
  },
} as const;

const compactCtrlSx = {
  bgcolor: TOK.CONTROL_BG,
  borderRadius: 1,
  color: TOK.TEXT,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: TOK.BORDER_WEAK },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, backgroundColor: TOK.CONTROL_BG, color: TOK.TEXT, paddingLeft: 8 },
  "& .MuiOutlinedInput-root.MuiInputBase-adornedStart": { paddingLeft: "8px !important" },
  "& .MuiInputAdornment-root": { position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" },
  "& .MuiOutlinedInput-input, & .MuiInputBase-input, & input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px 0 30px !important",
    fontSize: UI.font,
    lineHeight: 1,
    color: TOK.TEXT,
    textAlign: "left !important",
  },
  "& .MuiInputBase-input::placeholder": { color: TOK.TEXT_DIM, opacity: 1 },
  "& input::-webkit-input-placeholder": { color: TOK.TEXT_DIM, opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: TOK.ICON },
} as const;

const compactSelectSx = {
  ...compactCtrlSx,
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, paddingLeft: 0 },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px`,
    lineHeight: `${UI.ctrlH - 2}px`,
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
    paddingLeft: "10px !important",
    paddingRight: "28px !important",
    display: "flex",
    alignItems: "center",
    fontSize: UI.font,
    color: TOK.TEXT,
  },
  "& .MuiOutlinedInput-input": { paddingTop: "0 !important", paddingBottom: "0 !important" },
  "& .MuiSelect-icon": { top: "50%", transform: "translateY(-50%)", right: 8, color: TOK.ICON, width: UI.icon, height: UI.icon },
} as const;

const lightMenu = {
  PaperProps: {
    sx: {
      bgcolor: TOK.CONTROL_BG,
      color: TOK.TEXT,
      border: TOK.BORDER_STR,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(0,0,0,0.06)" },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(0,0,0,0.04)" },
    },
  },
};

/* ==================== table scaffold ==================== */
type UIRow = {
  id?: number;            // ✅ include id so the modal can PUT/DELETE
  sr: number;
  req: string;
  date: string;
  sat: string;
  stn: string;
  type: "Normal" | "Emergency" | string;
  orb: string;
  maxEl: string;
  aos: string;
  los: string;
  ops: string;
  opsReq: string;
  opsSup: string;
  sched: string;
  pass: string;
  remarks: string;
};

type Column = {
  key: keyof UIRow | "action";
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  render?: (row: UIRow) => React.ReactNode;
};

const TABLE_SCROLL_SX = {
  height: "100%",
  overflow: "auto",
  scrollbarColor: `${TOK.SCROLLBAR} transparent`,
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: TOK.SCROLLBAR, borderRadius: 8 },
  "&::-webkit-scrollbar-track": { background: "transparent" },
} as const;

function ScrollTable({
  rows,
  columns,
  totalWidth,
  onEdit,
}: {
  rows: UIRow[];
  columns: Column[];
  totalWidth: number;
  onEdit: (r: UIRow) => void;
}) {
  return (
    <Box sx={TABLE_SCROLL_SX}>
      <Box sx={{ width: totalWidth, minWidth: "100%" }}>
        {/* header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
            bgcolor: "var(--passes-thead-bg)",
            borderBottom: TOK.BORDER_STR,
          }}
        >
          {columns.map((c) => (
            <Box
              key={c.key as string}
              sx={{
                px: 0.75,
                py: 1,
                fontWeight: 700,
                fontSize: 13,
                color: "var(--passes-thead-text)",
                textAlign: c.align ?? "center",
                whiteSpace: "nowrap",
              }}
            >
              {c.label}
            </Box>
          ))}
        </Box>

        {/* rows */}
        {rows.map((r, idx) => (
          <Box
            key={idx}
            sx={{
              display: "grid",
              gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
              borderBottom: TOK.BORDER_STR,
              bgcolor: idx % 2 ? "var(--row-stripe)" : "transparent",
            }}
          >
            {columns.map((c) => {
              if (c.key === "action") {
                return (
                  <Box
                    key={`action-${idx}`}
                    sx={{ px: 0.75, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: 12,
                        px: 1.25,
                        bgcolor: TOK.ACCENT,
                        color: "#fff",
                        "& .MuiSvgIcon-root": { color: "#fff" },
                        "&:hover": { filter: "brightness(0.95)" },
                      }}
                      onClick={() => onEdit(r)}
                    >
                      Update
                    </Button>
                  </Box>
                );
              }

              const renderer = (c as any).render as undefined | ((row: UIRow) => React.ReactNode);
              const content = renderer ? renderer(r) : (r as any)[c.key];

              return (
                <Box
                  key={String(c.key)}
                  sx={{
                    px: 0.75,
                    py: 1,
                    fontSize: 13,
                    color: TOK.TEXT_DIM,
                    textAlign: c.align ?? "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {content}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function Labeled({ label, children, width }: { label: string; children: React.ReactNode; width: number | string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width }}>
      <Typography sx={{ fontSize: 11, color: TOK.TEXT_DIM, mb: 0.3, pl: 0.2 }}>{label}</Typography>
      {children}
    </Box>
  );
}
function reqNum(req: string): number {
  const m = String(req).match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

/* ==================== page ==================== */
export default function PassesList() {
  const { t } = useI18n();

  type Mode = "filter" | "export";
  const [mode, setMode] = React.useState<Mode>("filter");

  // filters
  const [search, setSearch] = React.useState("");
  const [station, setStation] = React.useState("All");
  const [satellite, setSatellite] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [typeFilter, setTypeFilter] = React.useState<"" | "Normal" | "Emergency">("");
  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);

  const [stationOptions, setStationOptions] = React.useState<string[]>(["All"]);
  const [satOptions, setSatOptions] = React.useState<string[]>(["All"]);

  // Export
  const rangeDirty = !!fromDate || !!toDate;
  const canExportRange = !!fromDate && !!toDate;

  // data
  const [rows, setRows] = React.useState<UIRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState("");

  // paging
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // modal state (✅ actually wired now)
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UIRow | null>(null);

  const clearFilters = () => {
    setSearch("");
    setStation("All");
    setSatellite("All");
    setStatus("All");
    setTypeFilter("");
    setFromDate(null);
    setToDate(null);
  };

  const COLUMNS: Column[] = React.useMemo(
    () => [
      { key: "sr", label: t("Sr"), width: 60, align: "center" },
      { key: "date", label: t("Date"), width: 110, align: "center" },
      { key: "sat", label: t("Satellite"), width: 120, align: "center" },
      { key: "stn", label: t("Station"), width: 130, align: "center" },
      { key: "type", label: t("Pass Type"), width: 110, align: "center" },
      { key: "orb", label: t("Orbit"), width: 90, align: "center" },
      { key: "maxEl", label: t("Max (El)°"), width: 110, align: "center" },
      { key: "aos", label: t("AOS / LOS (UT)"), width: 180, align: "center", render: (r) => `${r.aos || "—"} / ${r.los || "—"}` },
      { key: "ops", label: t("Operations"), width: 130, align: "center" },
      { key: "opsReq", label: t("Ops requester / supporter"), width: 240, align: "center", render: (r) => `${r.opsReq || "—"} / ${r.opsSup || "—"}` },
      { key: "sched", label: t("Schedule"), width: 120, align: "center", render: (r) => t(String(r.sched || "")) },
      { key: "pass", label: t("Pass"), width: 100, align: "center", render: (r) => t(String(r.pass || "")) },
      { key: "remarks", label: t("Remarks"), width: 180, align: "center" },
      { key: "action", label: t("Action"), width: 120, align: "center" },
    ],
    [t]
  );

  const totalWidth = COLUMNS.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;

  const dateSlots = {
    textField: { size: "small" as const, sx: { width: UI.dateW, ...compactCtrlSx }, placeholder: t("MM/DD/YY") },
    openPickerButton: { sx: { color: TOK.ICON } },
    popper: {
      sx: {
        "& .MuiPaper-root": { bgcolor: TOK.CONTROL_BG, color: TOK.TEXT, border: TOK.BORDER_STR },
        "& .MuiPickersDay-root": { color: TOK.TEXT },
        "& .MuiPickersDay-root.Mui-selected": { bgcolor: "var(--accent) !important", color: "#fff" },
        "& .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-label, & .MuiPickersYear-yearButton": {
          color: TOK.TEXT,
        },
      },
    },
  };

  const openModal = (r: UIRow) => {
    setEditing(r);
    setModalOpen(true);
  };

  const fetchStations = React.useCallback(async () => {
    try {
      const token = getAuthToken();
      const r = await fetch(`${API_BASE}/api/ground-stations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const j = await r.json();
      const rows: Array<{ ground_station?: string; station_name?: string; name?: string }> =
        Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
      const names = rows
        .map((r) => (r.ground_station ?? r.station_name ?? r.name ?? "").toString().trim())
        .filter((s) => s.length > 0);
      const unique = Array.from(new Set(names));
      setStationOptions(["All", ...unique]);
    } catch {
      setStationOptions(["All"]);
    }
  }, []);

  const fetchSatellites = React.useCallback(async () => {
    try {
      const token = getAuthToken();
      const r = await fetch(`${API_BASE}/api/satellites?_=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const j = await r.json();
      const rows: Array<{ satellite_name?: string; name?: string }> =
        Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
      const names = rows
        .map((r) => (r.satellite_name ?? r.name ?? "").toString().trim())
        .filter((s) => s.length > 0);
      const unique = Array.from(new Set(names));
      setSatOptions(["All", ...unique]);
    } catch {
      setSatOptions(["All"]);
    }
  }, []);

  // initial fetch
  const fetchRows = React.useCallback(async () => {
    setLoading(true);
    setLoadErr("");
    try {
      const data = await api.list();
      if (!Array.isArray(data)) throw new Error("API /api/passes did not return an array.");
      const ui: UIRow[] = data.map((p, idx) => ({
        id: p.id, // ✅ keep id for modal actions
        sr: idx + 1,
        req: p.pass_req_no,
        date: p.date_text,
        sat: p.satellite_name,
        stn: p.supporting_station,
        type: (p.pass_type as any) || "Normal",
        orb: p.orbit_no ?? "",
        maxEl: p.max_el_deg ?? "",
        aos: p.aos_ut,
        los: p.los_ut,
        ops: p.operations ?? "",
        opsReq: p.operations_requester ?? "",
        opsSup: p.operations_supporter ?? "",
        sched: p.schedule_status,
        pass: p.pass_status,
        remarks: p.remarks ?? "—",
      }));
      setRows(ui);
      setPage(0);
    } catch (e: any) {
      setLoadErr(e?.message || "Failed to fetch passes");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRows();
    fetchStations();
    fetchSatellites();
  }, [fetchRows, fetchStations, fetchSatellites]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    const arr = rows.filter((r) => {
      if (station !== "All" && r.stn !== station) return false;
      if (satellite !== "All" && r.sat !== satellite) return false;
      if (status !== "All" && r.pass !== status) return false;
      if (typeFilter && r.type !== typeFilter) return false;

      if (q) {
        const hay = `${r.req} ${r.sat} ${r.stn} ${r.ops} ${r.remarks}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // (kept your lenient date parsing)
      if (fromDate || toDate) {
        const parts = r.date.split(/[/-]/).map((x) => parseInt(x, 10));
        const [a, b, c] = parts;
        const try1 = new Date(c, (b ?? 1) - 1, a ?? 1);
        const try2 = new Date(c, (a ?? 1) - 1, b ?? 1);
        const dt = isNaN(+try1) ? try2 : try1;
        if (fromDate && dt < new Date(new Date(fromDate).setHours(0, 0, 0, 0))) return false;
        if (toDate && dt > new Date(new Date(toDate).setHours(23, 59, 59, 999))) return false;
      }
      return true;
    });

    arr.sort((a, b) => {
      const na = reqNum(a.req);
      const nb = reqNum(b.req);
      if (na !== nb) return na - nb;
      return a.req.localeCompare(b.req);
    });

    return arr;
  }, [rows, station, satellite, status, typeFilter, search, fromDate, toDate]);

  const paged: UIRow[] = React.useMemo(() => {
    const start = page * rowsPerPage;
    const slice = filtered.slice(start, start + rowsPerPage);
    return slice.map((r, i) => ({ ...r, sr: start + i + 1 }));
  }, [filtered, page, rowsPerPage]);

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{
            bgcolor: TOK.CARD_BG,
            color: TOK.TEXT,
            border: TOK.BORDER_STR,
            borderRadius: 2,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
            backgroundImage: "none",
            "--passes-thead-bg": "#000000",
            "--passes-thead-text": "#ffffff",
            "--row-stripe": "rgba(255,255,255,0.06)",
            ".theme-dark &": {
              "--passes-thead-bg": "#000000",
              "--passes-thead-text": "#ffffff",
              "--row-stripe": "rgba(255,255,255,0.06)",
            },
            ".theme-light &": {
              "--passes-thead-bg": "#464B4E",
              "--passes-thead-text": "#ffffff",
              "--row-stripe": "rgba(0,0,0,0.035)",
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: UI.gap,
              px: UI.headerPx,
              py: UI.headerPy,
              borderBottom: TOK.BORDER_STR,
              bgcolor: "transparent",
            }}
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mode}
              onChange={(_, v) => v && setMode(v)}
              sx={{
                bgcolor: TOK.HOVER,
                borderRadius: 1,
                "& .MuiToggleButton-root": {
                  color: TOK.TEXT,
                  border: TOK.BORDER_STR,
                  px: 1.2,
                  py: 0.3,
                  fontSize: 13,
                  "&:hover": { bgcolor: "rgba(0,0,0,0.05)" },
                  "&.Mui-selected": {
                    bgcolor: TOK.ACCENT,
                    color: "#fff",
                    borderColor: TOK.ACCENT,
                    "&:hover": { bgcolor: TOK.ACCENT },
                  },
                },
              }}
            >
              <ToggleButton value="filter">
                <FilterAltOutlinedIcon sx={{ fontSize: 16, mr: 0.6 }} />
                {t("Filter")}
              </ToggleButton>
              <ToggleButton value="export">
                <DownloadIcon sx={{ fontSize: 16, mr: 0.6 }} />
                {t("Export")}
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
              variant="outlined"
              sx={{
                ml: 1,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 12.5,
                px: 1.5,
                color: TOK.TEXT,
                borderColor: TOK.BORDER_WEAK,
                bgcolor: TOK.HOVER,
                "& .MuiSvgIcon-root": { color: TOK.TEXT },
                "&:hover": { bgcolor: TOK.HOVER },
              }}
            >
              {t("Print")}
            </Button>

            <Box sx={{ ml: "auto", display: "flex", alignItems: "end", gap: UI.gap }}>
              {mode === "filter" ? (
                <>
                  <TextField
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("Search…")}
                    size="small"
                    sx={{ width: UI.searchW, ...compactCtrlSx }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.25 }}>
                          <SearchIcon sx={{ fontSize: UI.icon, color: TOK.ICON }} />
                        </InputAdornment>
                      ),
                      sx: { "& input": { textAlign: "left !important", paddingLeft: "30px !important" } },
                    }}
                  />

                  <Labeled label={t("Stations")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={station} onChange={(e) => setStation(e.target.value)} MenuProps={lightMenu} sx={compactSelectSx}>
                        {stationOptions.map((s) => (
                          <MenuItem key={s} value={s}>{s === "All" ? t("All") : s}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Satellites")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={satellite} onChange={(e) => setSatellite(e.target.value)} MenuProps={lightMenu} sx={compactSelectSx}>
                        {satOptions.map((s) => (
                          <MenuItem key={s} value={s}>{s === "All" ? t("All") : s}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Status")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={status} onChange={(e) => setStatus(e.target.value)} MenuProps={lightMenu} sx={compactSelectSx}>
                        {["All", "Pending", "Completed", "Canceled"].map((s) => (
                          <MenuItem key={s} value={s}>{t(s)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Pass Type")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        MenuProps={lightMenu}
                        sx={compactSelectSx}
                      >
                        <MenuItem value="">{t("All")}</MenuItem>
                        <MenuItem value="Normal">{t("Normal")}</MenuItem>
                        <MenuItem value="Emergency">{t("Emergency")}</MenuItem>
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Button onClick={clearFilters} size="small" sx={{ color: "#2563eb", textTransform: "none", fontWeight: 700 }}>
                    {t("Clear")}
                  </Button>
                </>
              ) : (
                <>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Labeled label={t("From date")} width={UI.dateW}>
                      <DatePicker value={fromDate} onChange={(v) => setFromDate(v)} slotProps={dateSlots} />
                    </Labeled>
                    <Labeled label={t("To date")} width={UI.dateW}>
                      <DatePicker value={toDate} onChange={(v) => setToDate(v)} slotProps={dateSlots} />
                    </Labeled>
                  </LocalizationProvider>

                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    disabled={rangeDirty}
                    onClick={async () => {
                      try {
                        const csv = await api.exportCsv();
                        const fname = `passes_export_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = fname;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (e: any) {
                        alert(e?.message || t("Export failed"));
                      }
                    }}
                    sx={rangeDirty ? BTN.disabled : BTN.enabled(TOK.ACCENT, "#5732d3")}
                  >
                    {t("Export All")}
                  </Button>

                  <Button
                    size="small"
                    startIcon={<DownloadIcon />}
                    disabled={!canExportRange}
                    onClick={async () => {
                      if (!fromDate || !toDate) return;
                      try {
                        let from = fromDate, to = toDate;
                        if (from > to) [from, to] = [to, from];
                        const csv = await api.exportRangeCsv(ymd(from), ymd(to));
                        const fname = `passes_export_${ymd(from)}_to_${ymd(to)}.csv`;
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = fname;
                        a.click();
                        URL.revokeObjectURL(url);
                      } catch (e: any) {
                        alert(e?.message || t("Export failed"));
                      }
                    }}
                    sx={!canExportRange ? BTN.disabled : BTN.enabled(TOK.ACCENT, "#5732d3")}
                    title={!canExportRange ? t("Pick both From and To dates") : undefined}
                  >
                    {t("Export")}
                  </Button>

                  <Button onClick={clearFilters} size="small" sx={{ color: "#2563eb", textTransform: "none", fontWeight: 700 }}>
                    {t("Clear")}
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Body: table */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5, bgcolor: "transparent" }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden", bgcolor: "transparent" }}>
              {loading ? (
                <Box sx={{ p: 2, color: TOK.TEXT_DIM }}>{t("Loading…")}</Box>
              ) : loadErr ? (
                <Box sx={{ p: 2, color: "#b91c1c" }}>{loadErr}</Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ p: 2, color: TOK.TEXT_DIM }}>{t("No results")}</Box>
              ) : (
                <ScrollTable rows={paged} columns={COLUMNS} totalWidth={totalWidth} onEdit={openModal} />
              )}
            </Box>
          </Box>

          {/* Footer: pagination */}
          <Box sx={{ borderTop: TOK.BORDER_STR, bgcolor: "transparent" }}>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 50, 150, 200]}
              labelRowsPerPage={t("Rows per page:")}
              sx={{
                px: 1,
                color: TOK.TEXT,
                minHeight: UI.paginationH,
                "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: UI.font,
                  m: 0,
                  color: TOK.TEXT_DIM,
                },
                "& .MuiTablePagination-input": { fontSize: UI.font, m: 0, color: TOK.TEXT },
                "& .MuiSelect-select": {
                  py: 0,
                  px: 1,
                  fontSize: UI.font,
                  height: UI.ctrlH - 6,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: TOK.CONTROL_BG,
                  borderRadius: 1,
                },
                "& .MuiIconButton-root": { p: 0.25, color: TOK.TEXT },
                ".MuiSvgIcon-root": { color: TOK.TEXT, fontSize: UI.icon },
              }}
            />
          </Box>
        </Card>
      </Box>

      {/* ✅ Properly wired modal (uses id, opens/closes, refreshes list) */}
      <UpdatePassModal
        open={modalOpen}
        row={
          editing
            ? {
                id: editing.id,            // <-- critical
                sr: editing.sr,
                req: editing.req,
                date: editing.date,
                sat: editing.sat,
                stn: editing.stn,
                orb: editing.orb,
                maxEl: editing.maxEl,
                aos: editing.aos,
                los: editing.los,
                ops: editing.ops,
                opsReq: editing.opsReq,
                opsSup: editing.opsSup,
                sched: editing.sched,
                pass: editing.pass,
                remarks: editing.remarks,
              }
            : null
        }
        onClose={() => setModalOpen(false)}
        onSave={async () => { await fetchRows(); setModalOpen(false); }}
        onDelete={async () => { await fetchRows(); setModalOpen(false); }}
      />
    </MainLayout>
  );
}
