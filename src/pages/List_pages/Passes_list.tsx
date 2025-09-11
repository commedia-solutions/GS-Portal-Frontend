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
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
// import UpdatePassModal, { type PassLike } from "../../components/Models/UpdatePassModal";
import UpdatePassModal from "../../components/Models/UpdatePassModal";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

/* ==================== API wiring (inline) ==================== */
// Works in Vite and CRA without needing @types/node
const API_BASE =
  (typeof import.meta !== "undefined" && (import.meta as any)?.env?.VITE_API_BASE) ||
  (typeof globalThis !== "undefined" && (globalThis as any)?.process?.env?.REACT_APP_API_BASE) ||
  "";

const PASSES_URL = `${String(API_BASE).replace(/\/$/, "")}/api/passes`;
// const API_ROOT = String(API_BASE).replace(/\/$/, "");

/** Exact fields from your backend table (all VARCHARs except id). */
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
};


async function httpText(method: string, url: string, body?: any): Promise<string> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  if (!res.ok) {
    try {
      const j = JSON.parse(text);
      if (j?.error) throw new Error(j.error);
    } catch {}
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return text;
}

async function httpJSON<T = any>(method: string, url: string, body?: any): Promise<T> {
  const text = await httpText(method, url, body);
  try {
    return JSON.parse(text) as T;
  } catch {
    if (text.startsWith("<!DOCTYPE") || text.startsWith("<html")) {
      throw new Error(
        "Expected JSON but received HTML. Check VITE_API_BASE / REACT_APP_API_BASE (.env) — request likely hit the frontend dev server instead of Node API."
      );
    }
    throw new Error("API returned non-JSON payload for a JSON endpoint.");
  }
}


function ymd(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}


const api = {
  list: () => httpJSON<ApiPass[]>("GET", PASSES_URL),
  exportCsv: () => httpText("GET", `${PASSES_URL}/export`),

  // NEW: export subset by date range
  exportRangeCsv: (fromYMD: string, toYMD: string) =>
    httpText(
      "GET",
      `${PASSES_URL}/export-range?from=${encodeURIComponent(fromYMD)}&to=${encodeURIComponent(toYMD)}`
    ),
};



/* ==================== shared UI tokens ==================== */
const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";

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


// Distinct, accessible button styles for enabled vs disabled
const BTN = {
  enabled: (bg: string, hover: string) => ({
    textTransform: "none",
    fontWeight: 700,
    px: 1.4,
    py: 0.6,
    borderRadius: 1,
    bgcolor: bg,
    color: "#0B1115",
    "& .MuiSvgIcon-root": { color: "#0B1115" },
    "&:hover": { bgcolor: hover },
  }),
  disabled: {
    textTransform: "none",
    fontWeight: 700,
    px: 1.4,
    py: 0.6,
    borderRadius: 1,
    bgcolor: "#2A2A2A",
    color: "#9EA3AA",
    border: "1px solid #3A3A3A",
    "& .MuiSvgIcon-root": { color: "#9EA3AA" },
  },
};

const compactCtrlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffff66" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#ffffff88" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#544f4fff",
  },
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff" },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
    color: "#fff",
  },
  "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 1 },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    display: "flex",
    alignItems: "center",
    fontSize: UI.font,
    color: "#fff",
  },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: "#fff" },
};

const compactSelectSx = {
  ...compactCtrlSx,
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px` },
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
    color: "#fff",
  },
  "& .MuiOutlinedInput-input": {
    paddingTop: "0 !important",
    paddingBottom: "0 !important",
  },
  "& .MuiSelect-icon": {
    top: "50%",
    transform: "translateY(-50%)",
    right: 8,
    color: "#fff",
    width: UI.icon,
    height: UI.icon,
  },
};

const darkMenu = {
  PaperProps: {
    sx: {
      bgcolor: CONTROL_BG,
      color: "#fff",
      border: CONTROL_BORDER,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
    },
  },
};



/* ==================== table scaffold ==================== */
// UI row model: keep *everything* as strings (DB is VARCHAR) except sr
type UIRow = {
  sr: number;
  req: string;
  date: string;
  sat: string;
  stn: string;
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

// type Column = {
//   key: keyof UIRow | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

type Column = {
  key: keyof UIRow | "action";
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  render?: (row: UIRow) => React.ReactNode; // <- NEW
};


// const COLUMNS: Column[] = [
//   { key: "sr", label: "Sr No", width: 70, align: "center" },
//   { key: "req", label: "Mission Req No", width: 150, align: "center" },
//   { key: "date", label: "Date", width: 120, align: "center" },
//   { key: "sat", label: "Satellite", width: 120, align: "center" },
//   { key: "stn", label: "Station", width: 130, align: "center" },
//   { key: "orb", label: "Orbit No", width: 110, align: "center" },
//   { key: "maxEl", label: "Max (El) Deg", width: 130, align: "center" },
//   { key: "aos", label: "AOS (UT)", width: 120, align: "center" },
//   { key: "los", label: "LOS (UT)", width: 120, align: "center" },
//   { key: "ops", label: "Operations", width: 140, align: "center" },
//   { key: "opsReq", label: "Operations Requester", width: 190, align: "center" },
//   { key: "opsSup", label: "TTL Service Provider", width: 190, align: "center" },
//   { key: "sched", label: "Schedule Status", width: 160, align: "center" },
//   { key: "pass", label: "Pass Status", width: 130, align: "center" },
//   { key: "remarks", label: "Remarks", width: 220, align: "center" },
//   { key: "action", label: "Action", width: 120, align: "center" },
// ];


const COLUMNS: Column[] = [
  { key: "sr",    label: "Sr",                 width: 60,  align: "center" },
  // req stays in data for search/sort/modal, but is not shown
  { key: "date",  label: "Date",               width: 110, align: "center" },
  { key: "sat",   label: "Satellite",          width: 120, align: "center" },
  { key: "stn",   label: "Station",            width: 130, align: "center" },
  { key: "orb",   label: "Orbit",              width: 90,  align: "center" },
  { key: "maxEl", label: "Max (El)°",          width: 110, align: "center" },

  {
    key: "aos",  // keep keys from fetch
    label: "AOS / LOS (UT)",
    width: 180,
    align: "center",
    render: (r) => `${r.aos || "—"} / ${r.los || "—"}`,
  },

  { key: "ops",   label: "Operations",         width: 130, align: "center" },

  {
    key: "opsReq", // keep keys from fetch
    label: "Ops requester / supporter",
    width: 240,
    align: "center",
    render: (r) => `${r.opsReq || "—"} / ${r.opsSup || "—"}`,
  },

  { key: "sched", label: "Schedule",           width: 120, align: "center" },
  { key: "pass",  label: "Pass",               width: 100, align: "center" },
  { key: "remarks", label: "Remarks",          width: 180, align: "center" },
  { key: "action", label: "Action",            width: 120, align: "center" },
];


const TABLE_SCROLL_SX = {
  height: "100%",
  overflow: "auto",
  scrollbarColor: "#3f3f3f transparent",
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
} as const;

// function DarkScrollTable({
//   rows,
//   columns,
//   totalWidth,
//   onEdit,
// }: {
//   rows: UIRow[];
//   columns: Column[];
//   totalWidth: number;
//   onEdit: (r: UIRow) => void;
// }) {
//   return (
//     <Box sx={TABLE_SCROLL_SX}>
//       <Box sx={{ width: totalWidth, minWidth: "100%" }}>
//         {/* header */}
//         <Box
//           sx={{
//             position: "sticky",
//             top: 0,
//             zIndex: 1,
//             display: "grid",
//             gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
//             bgcolor: "#000",
//             borderBottom: "1px solid rgba(255,255,255,0.14)",
//           }}
//         >
//           {columns.map((c) => (
//             <Box
//               key={c.key as string}
//               sx={{
//                 px: 1.25,
//                 py: 1,
//                 fontWeight: 700,
//                 fontSize: 13,
//                 color: "#fff",
//                 textAlign: c.align ?? "center",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {c.label}
//             </Box>
//           ))}
//         </Box>

//         {/* rows */}
//         {rows.map((r, idx) => (
//           <Box
//             key={idx}
//             sx={{
//               display: "grid",
//               gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
//               borderBottom: "1px solid rgba(255,255,255,0.08)",
//               bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//             }}
//           >
//             {columns.map((c) => {
//               if (c.key === "action") {
//                 return (
//                   <Box
//                     key={`action-${idx}`}
//                     sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}
//                   >
//                     <Button
//                       size="small"
//                       variant="contained"
//                       sx={{
//                         textTransform: "none",
//                         fontWeight: 700,
//                         fontSize: 12,
//                         px: 1.25,
//                         bgcolor: "#7C57F2",
//                         "&:hover": { bgcolor: "#6b48ea" },
//                       }}
//                       onClick={() => onEdit(r)}
//                     >
//                       Update
//                     </Button>
//                   </Box>
//                 );
//               }
//               return (
//                 <Box
//                   key={String(c.key)}
//                   sx={{ px: 1.25, py: 1, fontSize: 13, color: "#EAEAEA", textAlign: c.align ?? "center", whiteSpace: "nowrap" }}
//                 >
//                   {(r as any)[c.key]}
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   );
// }

function DarkScrollTable({
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
            bgcolor: "#000",
            borderBottom: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {columns.map((c) => (
            <Box
              key={c.key as string}
              sx={{
                px: 0.75, // tighter than 1.25
                py: 1,
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
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
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
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
                        bgcolor: "#7C57F2",
                        "&:hover": { bgcolor: "#6b48ea" },
                      }}
                      onClick={() => onEdit(r)}
                    >
                      Update
                    </Button>
                  </Box>
                );
              }

              // prefer an explicit column renderer if provided
              const renderer = (c as any).render as undefined | ((row: UIRow) => React.ReactNode);
              let content: React.ReactNode;

              if (renderer) {
                content = renderer(r);
              } else if (c.key === "aos") {
                // auto-club AOS / LOS
                content = `${r.aos || "—"} / ${r.los || "—"}`;
              } else if (c.key === "opsReq") {
                // auto-club requester / supporter
                content = `${r.opsReq || "—"} / ${r.opsSup || "—"}`;
              } else {
                content = (r as any)[c.key];
              }

              return (
                <Box
                  key={String(c.key)}
                  sx={{
                    px: 0.75, // tighter than 1.25
                    py: 1,
                    fontSize: 13,
                    color: "#EAEAEA",
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


/* small helper for top labels above selects */
function Labeled({
  label,
  children,
  width,
}: {
  label: string;
  children: React.ReactNode;
  width: number | string;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width }}>
      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.75)", mb: 0.3, pl: 0.2 }}>{label}</Typography>
      {children}
    </Box>
  );
}

// numeric key from "REQ-001" / "req-12" / "REQ001"
function reqNum(req: string): number {
  const m = String(req).match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER; // unknowns go last
}


/* ==================== page ==================== */
export default function PassesList() {
  type Mode = "filter" | "export";
  const [mode, setMode] = React.useState<Mode>("filter");

  // filters (client-side)
  const [search, setSearch] = React.useState("");
  const [station, setStation] = React.useState("All");
  const [satellite, setSatellite] = React.useState("All");
  const [status, setStatus] = React.useState("All");
  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);

  const [stationOptions, setStationOptions] = React.useState<string[]>(["All"]);
  const [satOptions, setSatOptions] = React.useState<string[]>(["All"]);
  const statuses = ["All", "Pending", "Completed", "Canceled"];

  type GSRow = { ground_station?: string; station_name?: string; name?: string };
type SatRow = { satellite_name?: string; name?: string };


    // Export button enable/disable rules
    const rangeDirty = !!fromDate || !!toDate;     // any date picked? -> disable "Export All"
    const canExportRange = !!fromDate && !!toDate; // both picked? -> enable "Export"


  // rows + server ids
  const [rows, setRows] = React.useState<UIRow[]>([]);
  const [idByReq, setIdByReq] = React.useState<Record<string, number>>({});
  const [loading, setLoading] = React.useState(true);
  const [loadErr, setLoadErr] = React.useState("");

  // paging
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const clearFilters = () => {
    setSearch("");
    setStation("All");
    setSatellite("All");
    setStatus("All");
    setFromDate(null);
    setToDate(null);
  };

  const totalWidth = COLUMNS.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;

  // white-on-dark datepicker slots (Export mode)
  const dateSlots = {
    textField: { size: "small" as const, sx: { width: UI.dateW, ...compactCtrlSx }, placeholder: "mm/dd/yy" },
    openPickerButton: { sx: { color: "#fff" } },
    popper: {
      sx: {
        "& .MuiPaper-root": { bgcolor: CONTROL_BG, color: "#fff", border: CONTROL_BORDER },
        "& .MuiPickersDay-root": { color: "#fff" },
        "& .MuiPickersDay-root.Mui-selected": { bgcolor: "#7C57F2 !important", color: "#fff" },
        "& .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-label, & .MuiPickersYear-yearButton": { color: "#fff" },
      },
    },
  };

  // modal (we’ll wire API PUT/DELETE on the next step)
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<UIRow | null>(null);
  const openModal = (r: UIRow) => {
    setEditing(r);
    setModalOpen(true);
  };

const fetchStations = React.useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API_BASE}/api/ground-stations`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const j = await r.json();
    const rows: GSRow[] = Array.isArray(j?.data) ? j.data : [];

    const names: string[] = rows
      .map((r) => (r.ground_station ?? r.station_name ?? r.name ?? "").toString().trim())
      .filter((s): s is string => s.length > 0);

    const unique = Array.from(new Set<string>(names));
    setStationOptions(["All", ...unique]);
  } catch {
    setStationOptions(["All"]);
  }
}, []);


const fetchSatellites = React.useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    const r = await fetch(`${API_BASE}/api/satellites`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const j = await r.json();
    const rows: SatRow[] = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];

    const names: string[] = rows
      .map((r) => (r.satellite_name ?? r.name ?? "").toString().trim())
      .filter((s): s is string => s.length > 0);

    const unique = Array.from(new Set<string>(names));
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
      if (!Array.isArray(data)) {
        throw new Error("API /api/passes did not return an array.");
      }
      setIdByReq(Object.fromEntries(data.map((p) => [p.pass_req_no, p.id])));
      const ui: UIRow[] = data.map((p) => ({
        sr: 0, // will be set per page
        req: p.pass_req_no,
        date: p.date_text,
        sat: p.satellite_name,
        stn: p.supporting_station,
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

  // local-only update/delete for now (keep strings)
  // const handleSave = (next: PassLike) => {
  //   setRows((prev) =>
  //     prev.map((x) =>
  //       x.req === next.req
  //         ? {
  //             ...x,
  //             ...next,
  //             orb: String((next as any).orb ?? x.orb),
  //             maxEl: String((next as any).maxEl ?? x.maxEl),
  //           }
  //         : x
  //     )
  //   );
  //   setModalOpen(false);
  // };

  // const handleDelete = (row: PassLike) => {
  //   setRows((prev) => prev.filter((x) => x.req !== row.req));
  //   setModalOpen(false);
  // };

  

  const filtered = React.useMemo(() => {
  const q = search.trim().toLowerCase();

  const arr = rows.filter((r) => {
    if (station !== "All" && r.stn !== station) return false;
    if (satellite !== "All" && r.sat !== satellite) return false;
    if (status !== "All" && r.pass !== status) return false;

    if (q) {
      const hay = `${r.req} ${r.sat} ${r.stn} ${r.ops} ${r.remarks}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

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

  // 🔽 NEW: sort by numeric part of request no. (ascending)
  arr.sort((a, b) => {
    const na = reqNum(a.req);
    const nb = reqNum(b.req);
    if (na !== nb) return na - nb;
    // tie-break: plain string compare keeps a stable order
    return a.req.localeCompare(b.req);
  });

  return arr;
}, [rows, station, satellite, status, search, fromDate, toDate]);


// slice the sorted/filtered rows into the current page and set Sr No
const paged: UIRow[] = React.useMemo(() => {
  const start = page * rowsPerPage;
  const slice = filtered.slice(start, start + rowsPerPage);
  return slice.map((r, i) => ({ ...r, sr: start + i + 1 }));
}, [filtered, page, rowsPerPage]);


  return (
    <MainLayout title="Passes List">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{
            bgcolor: "#1C1C1E",
            color: "#E8E8EA",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 2,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* ------- Header with toggle ------- */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: UI.gap,
              px: UI.headerPx,
              py: UI.headerPy,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mode}
              onChange={(_, v) => v && setMode(v)}
              sx={{
                bgcolor: "rgba(255,255,255,0.06)",
                borderRadius: 1,
                "& .MuiToggleButton-root": {
                  color: "#E8E8EA",
                  border: "1px solid rgba(255,255,255,0.10)",
                  px: 1.2,
                  py: 0.3,
                  fontSize: 13,
                  "&.Mui-selected": {
                    bgcolor: "#7C57F2",
                    color: "#fff",
                    borderColor: "#7C57F2",
                  },
                },
              }}
            >
              <ToggleButton value="filter">
                <FilterAltOutlinedIcon sx={{ fontSize: 16, mr: 0.6 }} />
                Filter
              </ToggleButton>
              <ToggleButton value="export">
                <DownloadIcon sx={{ fontSize: 16, mr: 0.6 }} />
                Export
              </ToggleButton>
            </ToggleButtonGroup>

            {/* right side controls */}
            <Box sx={{ ml: "auto", display: "flex", alignItems: "end", gap: UI.gap }}>
              {mode === "filter" ? (
                <>
                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    size="small"
                    sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ mr: 0.25 }}>
                          <SearchIcon sx={{ fontSize: UI.icon, color: "#fff" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Labeled label="Stations" width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={station} onChange={(e) => setStation(e.target.value)} MenuProps={darkMenu} sx={compactSelectSx}>
  {stationOptions.map((s) => (
    <MenuItem key={s} value={s}>{s}</MenuItem>
  ))}
</Select>
                    </FormControl>
                  </Labeled>
                  <Labeled label="Satellites" width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={satellite} onChange={(e) => setSatellite(e.target.value)} MenuProps={darkMenu} sx={compactSelectSx}>
  {satOptions.map((s) => (
    <MenuItem key={s} value={s}>{s}</MenuItem>
  ))}
</Select>
                    </FormControl>
                  </Labeled>
                  <Labeled label="Status" width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={status} onChange={(e) => setStatus(e.target.value)} MenuProps={darkMenu} sx={compactSelectSx}>
                        {statuses.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Labeled>
                  <Button onClick={clearFilters} size="small" sx={{ color: "#7CA7FF", textTransform: "none", fontWeight: 700 }}>
                    Clear
                  </Button>
                </>
              ) : (
                <>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Labeled label="From date" width={UI.dateW}>
                      <DatePicker value={fromDate} onChange={(v) => setFromDate(v)} slotProps={dateSlots} />
                    </Labeled>
                    <Labeled label="To date" width={UI.dateW}>
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
      alert(e?.message || "Export failed");
    }
  }}
  sx={rangeDirty ? BTN.disabled : BTN.enabled("#7C57F2", "#5732d3ff")}
>
  Export All
</Button>

{/* Export (range) — blue when enabled, gray when disabled */}
<Button
  size="small"
  startIcon={<DownloadIcon />}
  disabled={!canExportRange}
  onClick={async () => {
    if (!fromDate || !toDate) return;
    try {
      let from = fromDate, to = toDate;
      if (from > to) [from, to] = [to, from]; // optional swap safety
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
      alert(e?.message || "Export (range) failed");
    }
  }}
  sx={!canExportRange ? BTN.disabled : BTN.enabled("#7C57F2", "#5732d3ff")}
  title={!canExportRange ? "Pick both From and To dates" : undefined}
>
  Export
</Button>
                  <Button onClick={clearFilters} size="small" sx={{ color: "#7CA7FF", textTransform: "none", fontWeight: 700 }}>
                    Clear
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* ------- Body: table ------- */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
              {loading ? (
                <Box sx={{ p: 2, color: "#aaa" }}>Loading…</Box>
              ) : loadErr ? (
                <Box sx={{ p: 2, color: "#f88" }}>{loadErr}</Box>
              ) : filtered.length === 0 ? (
                <Box sx={{ p: 2, color: "#aaa" }}>No results</Box>
              ) : (
                <DarkScrollTable rows={paged} columns={COLUMNS} totalWidth={totalWidth} onEdit={openModal} />
              )}
            </Box>
          </Box>

          {/* ------- Footer: pagination ------- */}
          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
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
              sx={{
                px: 1,
                color: "#E8E8EA",
                minHeight: UI.paginationH,
                "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: UI.font, m: 0 },
                "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
                "& .MuiSelect-select": {
                  py: 0,
                  px: 1,
                  fontSize: UI.font,
                  height: UI.ctrlH - 6,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: CONTROL_BG,
                  borderRadius: 1,
                },
                "& .MuiIconButton-root": { p: 0.25 },
                ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
              }}
            />
          </Box>
        </Card>
      </Box>

      <UpdatePassModal
  open={modalOpen}
  row={
    editing
      ? ({
          ...editing,
          id: idByReq[editing.req],   // <-- give the modal the DB id
        } as any)
      : null
  }
  onClose={() => setModalOpen(false)}
  onSave={(next) => {
    // update the list row (UI stays in sync after PUT)
    setRows((prev) => prev.map((x) => (x.req === next.req ? { ...x, ...next } : x)));
    setModalOpen(false);
  }}
  onDelete={(row) => {
    // remove the row after DELETE
    setRows((prev) => prev.filter((x) => x.req !== row.req));
    setModalOpen(false);
  }}
/>

    </MainLayout>
  );
}
