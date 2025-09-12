// // src/pages/Logs/index.tsx
// import React from "react";
// import {
//   Box, Card, Button, TextField, InputAdornment, TablePagination,
//   Tooltip, IconButton,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
// import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// import MainLayout from "../../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../../components/TopNav";

// const API = `${import.meta.env.VITE_API_BASE}/api`;

// const authHeaders = (): HeadersInit => {
//   const token =
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token") ||
//     "";
//   const h: Record<string, string> = {};
//   if (token) h.Authorization = `Bearer ${token}`;
//   return h;
// };

// const BG = "#1C1C1E";
// const BORDER = "1px solid rgba(255,255,255,0.14)";
// const CONTROL_BG = "#1C1C1E";
// const UI = {
//   ctrlH: 30,
//   font: 13,
//   icon: 16,
//   headerPx: 1.25,
//   headerPy: 0.6,
//   gap: 0.75,
//   searchW: 260,
//   paginationH: 36,
// };

// const compactCtrlSx = {
//   bgcolor: CONTROL_BG,
//   borderRadius: 1,
//   color: "#fff",
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: "#544f4fff",
//   },
//   "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff" },
//   "& .MuiInputBase-input": {
//     height: `${UI.ctrlH - 2}px`,
//     padding: "0 10px",
//     fontSize: UI.font,
//     lineHeight: 1,
//     color: "#fff",
//   },
//   "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 1 },
//   "& .MuiSvgIcon-root": { fontSize: UI.icon, color: "rgba(255,255,255,0.9)" },
// };

// /* ------------ data shapes ------------ */
// type AuditLogRaw = {
//   id?: number | string;

//   // server (snake_case, legacy)
//   created_at?: string;
//   user_name?: string;
//   status_code?: number;
//   target_type?: string;
//   target_id?: string | number | null;

//   // server (camelCase, current)
//   createdAt?: string;
//   actorUsername?: string;
//   actorEmail?: string;
//   statusCode?: number;
//   targetType?: string;
//   targetId?: string | number | null;

//   // common
//   timestamp?: string;
//   time?: string;
//   user?: string;
//   actor?: string;
//   action?: string;
//   ip?: string;
//   metadata?: any;
//   message?: string;
//   details?: string;
// };

// type UIRow = {
//   id: string;
//   when: string;
//   user: string;
//   action: string;
//   target: string;
//   status: string;
//   ip: string;
//   metaPreview: string;
//   metaRaw?: any;
// };

// const COLUMNS: { key: keyof UIRow | "copy"; label: string; width?: number; align?: "left" | "center" | "right" }[] = [
//   { key: "when",        label: "When",     width: 160, align: "center" },
//   { key: "user",        label: "User",     width: 140, align: "center" },
//   { key: "action",      label: "Action",   width: 180, align: "center" },
//   { key: "target",      label: "Target",   width: 160, align: "center" },
//   { key: "status",      label: "Status",   width: 90,  align: "center" },
//   { key: "ip",          label: "IP",       width: 130, align: "center" },
//   { key: "metaPreview", label: "Metadata", width: 520, align: "left" },
//   { key: "copy",        label: "",         width: 60,  align: "center" },
// ];

// /* ------------ utils ------------ */
// const pad = (n: number) => String(n).padStart(2, "0");
// const fmtDateTime = (s?: string) => {
//   if (!s) return "";
//   const d = new Date(s);
//   if (isNaN(+d)) return s;
//   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
// };
// const takeArrayish = <T,>(j: any): T[] =>
//   Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : Array.isArray(j?.rows) ? j.rows : [];
// const getTotal = (j: any, fallback: number) => (typeof j?.total === "number" ? j.total : fallback);

// /* read both snake_case and camelCase from API */
// function toUI(r: AuditLogRaw): UIRow {
//   const when = fmtDateTime(r.createdAt || r.created_at || r.timestamp || r.time);

//   const user =
//     r.actorUsername ||
//     r.user_name ||
//     r.actorEmail ||
//     r.user ||
//     r.actor ||
//     "—";

//   const action = r.action || "—";

//   const tType = r.targetType ?? r.target_type ?? "";
//   const tId   = r.targetId   ?? r.target_id   ?? "";
//   const target = [tType, tId].filter(Boolean).join(":") || "—";

//   const code = r.statusCode ?? r.status_code;
//   const status = typeof code === "number" ? String(code) : "—";

//   const ip = r.ip || "—";

//   const meta = r.metadata ?? r.details ?? r.message;
//   let metaPreview = "—";
//   if (meta != null) {
//     metaPreview =
//       typeof meta === "string"
//         ? meta
//         : (() => {
//             try { return JSON.stringify(meta); } catch { return String(meta); }
//           })();
//     if (metaPreview.length > 120) metaPreview = metaPreview.slice(0, 117) + "…";
//   }

//   return {
//     id: String(r.id ?? `${when}-${action}-${target}`),
//     when, user, action, target, status, ip, metaPreview, metaRaw: meta,
//   };
// }

// /* ------------ table (no own scroll; header sticky) ------------ */
// function DarkScrollTable({ rows, onCopy }: { rows: UIRow[]; onCopy: (row: UIRow) => void }) {
//   const totalW = COLUMNS.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;

//   return (
//     <Box sx={{ width: totalW, minWidth: "100%" }}>
//       {/* sticky header */}
//       <Box
//         sx={{
//           position: "sticky",
//           top: 0,
//           zIndex: 1,
//           display: "grid",
//           gridTemplateColumns: COLUMNS.map((c) => `${c.width ?? 120}px`).join(" "),
//           bgcolor: "#000",
//           borderBottom: "1px solid rgba(255,255,255,0.14)",
//         }}
//       >
//         {COLUMNS.map((c) => (
//           <Box
//             key={String(c.key)}
//             sx={{
//               px: 1.25,
//               py: 1,
//               fontWeight: 700,
//               fontSize: 13,
//               color: "#fff",
//               textAlign: c.align ?? "center",
//               whiteSpace: "nowrap",
//             }}
//           >
//             {c.label}
//           </Box>
//         ))}
//       </Box>

//       {/* rows */}
//       {rows.map((r, idx) => (
//         <Box
//           key={r.id || idx}
//           sx={{
//             display: "grid",
//             gridTemplateColumns: COLUMNS.map((c) => `${c.width ?? 120}px`).join(" "),
//             borderBottom: "1px solid rgba(255,255,255,0.08)",
//             bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//           }}
//         >
//           {COLUMNS.map((c) =>
//             c.key === "copy" ? (
//               <Box key={`copy-${idx}`} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
//                 <Tooltip title="Copy raw metadata">
//                   <IconButton size="small" onClick={() => onCopy(r)} sx={{ color: "#E8E8EA" }}>
//                     <ContentCopyIcon fontSize="inherit" />
//                   </IconButton>
//                 </Tooltip>
//               </Box>
//             ) : (
//               <Box
//                 key={String(c.key)}
//                 sx={{
//                   px: 1.25,
//                   py: 1,
//                   fontSize: 13,
//                   color: "#EAEAEA",
//                   textAlign: c.align ?? "center",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                 }}
//                 title={(r as any)[c.key] || ""}
//               >
//                 {(r as any)[c.key] || "—"}
//               </Box>
//             )
//           )}
//         </Box>
//       ))}

//       {rows.length === 0 && (
//         <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>
//           No logs.
//         </Box>
//       )}
//     </Box>
//   );
// }

// /* ------------ page ------------ */
// export default function PortalLogsPage() {
//   const [search, setSearch] = React.useState("");
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(10);
//   const [rows, setRows] = React.useState<UIRow[]>([]);
//   const [total, setTotal] = React.useState(0);
//   const [loading, setLoading] = React.useState(false);

//   const fetchRows = React.useCallback(async () => {
//     const ac = new AbortController();
//     setLoading(true);
//     try {
//       // backend expects page (1-based) & pageSize
//       const params = new URLSearchParams();
//       params.set("page", String(page + 1));
//       params.set("pageSize", String(rowsPerPage));
//       if (search.trim()) params.set("q", search.trim());

//       const res = await fetch(`${API}/audit-logs?${params.toString()}`, {
//         headers: { ...authHeaders() },
//         signal: ac.signal,
//       });
//       if (!res.ok) {
//         const t = await res.text().catch(() => "");
//         throw new Error(t || `HTTP ${res.status}`);
//       }
//       const j = await res.json().catch(() => ({}));
//       const arr = takeArrayish<AuditLogRaw>(j);
//       const ui = arr.map(toUI);
//       setRows(ui);
//       setTotal(getTotal(j, ui.length));
//     } catch (e: any) {
//       if (e?.name !== "AbortError") {
//         console.error("Failed to load audit logs:", e);
//         setRows([]);
//         setTotal(0);
//       }
//     } finally {
//       setLoading(false);
//     }
//     return () => ac.abort();
//   }, [page, rowsPerPage, search]);

//   React.useEffect(() => {
//     const cancel = fetchRows();
//     return () => {
//       try { (cancel as any)?.(); } catch {}
//     };
//   }, [fetchRows]);

//   const doExport = React.useCallback(async () => {
//     try {
//       const qs = new URLSearchParams();
//       qs.set("format", "csv");
//       if (search.trim()) qs.set("q", search.trim());
//       const resp = await fetch(`${API}/audit-logs/export?${qs.toString()}`, {
//         headers: { ...authHeaders() },
//       });
//       if (!resp.ok) {
//         const msg = await resp.text().catch(() => "");
//         alert(`Export failed (${resp.status}): ${msg || resp.statusText}`);
//         return;
//       }
//       const blob = await resp.blob();
//       const dispo = resp.headers.get("Content-Disposition") || "";
//       const m = dispo.match(/filename="?([^"]+)"?/i);
//       const filename = m?.[1] || "audit_logs.csv";

//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = filename;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (e) {
//       console.error("Export error", e);
//       alert("Export failed.");
//     }
//   }, [search]);

//   const onCopy = (r: UIRow) => {
//     try {
//       const text =
//         typeof r.metaRaw === "string"
//           ? r.metaRaw
//           : JSON.stringify(r.metaRaw ?? {}, null, 2);
//       navigator.clipboard.writeText(text);
//       alert("Metadata copied to clipboard.");
//     } catch {
//       alert("Copy failed.");
//     }
//   };

//   return (
//     <MainLayout title="Portal Logs">
//       <Box sx={{ px: 2, py: 1.5 }}>
//         <Card
//           sx={{
//             bgcolor: BG,
//             color: "#fff",
//             border: BORDER,
//             borderRadius: 2,
//             height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           {/* header — Search + Export */}
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: UI.gap,
//               px: UI.headerPx,
//               py: UI.headerPy,
//               borderBottom: "1px solid rgba(255,255,255,0.12)",
//             }}
//           >
//             <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: UI.gap }}>
//               <TextField
//                 value={search}
//                 onChange={(e) => { setSearch(e.target.value); setPage(0); }}
//                 placeholder={loading ? "Loading…" : "Search…"}
//                 size="small"
//                 sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start" sx={{ mr: 0.25 }}>
//                       <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,0.75)" }} />
//                     </InputAdornment>
//                   ),
//                 }}
//               />

//               <Button
//                 onClick={doExport}
//                 variant="contained"
//                 size="small"
//                 startIcon={<FileDownloadOutlinedIcon />}
//                 sx={{
//                   textTransform: "none",
//                   fontWeight: 700,
//                   fontSize: 12.5,
//                   bgcolor: "#16a34a",
//                   "&:hover": { bgcolor: "#14833e" },
//                 }}
//               >
//                 Export
//               </Button>
//             </Box>
//           </Box>

//           {/* body — single scroll container; sticky header inside table */}
//           <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
//             <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
//               <Box
//                 sx={{
//                   height: "100%",
//                   overflow: "auto",
//                   pr: 1,
//                   scrollbarWidth: "thin",
//                   scrollbarColor: "#3f3f3f transparent",
//                   "&::-webkit-scrollbar": { width: 8, height: 8 },
//                   "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
//                   "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
//                   "&::-webkit-scrollbar-track": { background: "transparent" },
//                 }}
//               >
//                 {loading ? (
//                   <Box sx={{ p: 2, color: "#aaa" }}>Loading…</Box>
//                 ) : (
//                   <DarkScrollTable rows={rows} onCopy={onCopy} />
//                 )}
//               </Box>
//             </Box>
//           </Box>

//           {/* pagination */}
//           <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
//             <TablePagination
//               component="div"
//               count={total}
//               page={page}
//               onPageChange={(_, p) => setPage(p)}
//               rowsPerPage={rowsPerPage}
//               onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
//               rowsPerPageOptions={[10, 25, 50, 100]}
//               sx={{
//                 px: 1,
//                 color: "#E8E8EA",
//                 minHeight: UI.paginationH,
//                 "& .MuiTablePagination-toolbar": {
//                   minHeight: UI.paginationH,
//                   p: 0,
//                   pl: 1,
//                   pr: 1,
//                   gap: 0.5,
//                 },
//                 "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
//                   fontSize: UI.font,
//                   m: 0,
//                 },
//                 "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
//                 "& .MuiSelect-select": {
//                   py: 0,
//                   px: 1,
//                   fontSize: UI.font,
//                   height: UI.ctrlH - 6,
//                   display: "flex",
//                   alignItems: "center",
//                   bgcolor: CONTROL_BG,
//                   borderRadius: 1,
//                 },
//                 "& .MuiIconButton-root": { p: 0.25 },
//                 ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
//               }}
//             />
//           </Box>
//         </Card>
//       </Box>
//     </MainLayout>
//   );
// }




//p3//
// src/pages/Logs/index.tsx
import React from "react";
import {
  Box,
  Card,
  Button,
  TextField,
  InputAdornment,
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";

const API = `${import.meta.env.VITE_API_BASE}/api`;

const authHeaders = (): HeadersInit => {
  const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";
  const h: Record<string, string> = {};
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
};

const BG = "#1C1C1E";
const BORDER = "1px solid rgba(255,255,255,0.14)";
const CONTROL_BG = "#1C1C1E";
const UI = {
  ctrlH: 30,
  font: 13,
  icon: 16,
  headerPx: 1.25,
  headerPy: 0.6,
  gap: 0.75,
  searchW: 260,
  paginationH: 36,
};

const compactCtrlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
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
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: "rgba(255,255,255,0.9)" },
};

/* ---------- API shapes (simple endpoint) ---------- */
// type SimpleRow = {
//   dateTimeIST: string; // already in IST from backend
//   user: string;
//   module: string;
//   action: string;
//   ip: string;
// };

type SimpleRow = {
  tsUtc: number;     // seconds since epoch, UTC
  user: string;
  module: string;
  action: string;
};

type SimpleResp = {
  page: number;
  pageSize: number;
  total: number;
  data: SimpleRow[];
};

/* ---------- UI row ---------- */
// type UIRow = {
//   sr: number;
//   dateTime: string;
//   user: string;
//   module: string;
//   action: string;
//   ip: string;
// };

type UIRow = {
  sr: number;
  dateTime: string;
  user: string;
  module: string;
  action: string;
};

const fmtIST = (tsUtcSec: number) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
  .format(new Date(tsUtcSec * 1000))
  .replace(",", ""); // "06/09/2025 11:34:12"


// const COLUMNS: {
//   key: keyof UIRow;
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// }[] = [
//   { key: "sr",        label: "Sr No",          width: 80,  align: "center" },
//   { key: "dateTime",  label: "Date & Time",    width: 190, align: "center" },
//   { key: "user",      label: "User",           width: 140, align: "center" },
//   { key: "module",    label: "Module",         width: 160, align: "center" },
//   { key: "action",    label: "Action",         width: 170, align: "center" },
// ];

const COLUMNS: { key: keyof UIRow; label: string; align?: "left" | "center" | "right" }[] = [
  { key: "sr",       label: "Sr No",       align: "center" },
  { key: "dateTime", label: "Date & Time", align: "center" },
  { key: "user",     label: "User",        align: "center" },
  { key: "module",   label: "Module",      align: "center" },
  { key: "action",   label: "Action",      align: "center" },
];

/* ---------- table ---------- */
function DarkScrollTable({ rows }: { rows: UIRow[] }) {
  // const totalW = COLUMNS.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;
  const totalW = "100%";


  return (
    <Box sx={{ width: totalW, minWidth: "100%" }}>
      {/* sticky header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          display: "grid",
          // gridTemplateColumns: COLUMNS.map((c) => `${c.width ?? 120}px`).join(" "),
          gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`,
          bgcolor: "#000",
          borderBottom: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        {COLUMNS.map((c) => (
          <Box
            key={String(c.key)}
            sx={{
              px: 1.25,
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
          key={`${r.sr}-${idx}`}
          sx={{
            display: "grid",
            // gridTemplateColumns: COLUMNS.map((c) => `${c.width ?? 120}px`).join(" "),
            gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
          }}
        >
          {COLUMNS.map((c) => (
            <Box
              key={String(c.key)}
              sx={{
                px: 1.25,
                py: 1,
                fontSize: 13,
                color: "#EAEAEA",
                textAlign: c.align ?? "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={(r as any)[c.key] ?? ""}
            >
              {(r as any)[c.key] ?? "—"}
            </Box>
          ))}
        </Box>
      ))}

      {rows.length === 0 && (
        <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>
          No logs.
        </Box>
      )}
    </Box>
  );
}

/* ---------- page ---------- */
export default function PortalLogsPage() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0); // 0-based in UI
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<UIRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const fetchRows = React.useCallback(async () => {
    const ac = new AbortController();
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(page + 1));       // backend is 1-based
      qs.set("pageSize", String(rowsPerPage));
      if (search.trim()) qs.set("q", search.trim());

      const res = await fetch(`${API}/audit-logs/simple?${qs.toString()}`, {
        headers: { ...authHeaders() },
        signal: ac.signal,
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(t || `HTTP ${res.status}`);
      }
      const j: SimpleResp = await res.json();

      const start = page * rowsPerPage;
      // const mapped: UIRow[] = (j.data || []).map((r, i) => ({
      //   sr: start + i + 1,
      //   dateTime: r.dateTimeIST || "—",
      //   user: r.user || "—",
      //   module: r.module || "—",
      //   action: r.action || "—",
      //   ip: r.ip || "—",
      // }));

      const mapped: UIRow[] = (j.data || []).map((r, i) => ({
  sr: start + i + 1,
  dateTime: r.tsUtc ? fmtIST(r.tsUtc) : "—",
  user: r.user || "—",
  module: r.module || "—",
  action: r.action || "—",
}));

      setRows(mapped);
      setTotal(j.total || mapped.length);
    } catch (e) {
      console.error("Failed to load logs (simple):", e);
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
    return () => ac.abort();
  }, [page, rowsPerPage, search]);

  React.useEffect(() => {
    const cancel = fetchRows();
    return () => {
      try { (cancel as any)?.(); } catch {}
    };
  }, [fetchRows]);

  const doExport = React.useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set("q", search.trim());

      const resp = await fetch(`${API}/audit-logs/simple/export?${qs.toString()}`, {
        headers: { ...authHeaders() },
      });
      if (!resp.ok) {
        const msg = await resp.text().catch(() => "");
        alert(`Export failed (${resp.status}): ${msg || resp.statusText}`);
        return;
      }
      const blob = await resp.blob();
      const dispo = resp.headers.get("Content-Disposition") || "";
      const m = dispo.match(/filename="?([^"]+)"?/i);
      const filename = m?.[1] || "audit_logs_simple.csv";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error", e);
      alert("Export failed.");
    }
  }, [search]);

  return (
    <MainLayout title="Portal Logs">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{
            bgcolor: BG,
            color: "#fff",
            border: BORDER,
            borderRadius: 2,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* header — Search + Export */}
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
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: UI.gap }}>
              <TextField
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                placeholder={loading ? "Loading…" : "Search"}
                size="small"
                sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0.25 }}>
                      <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,0.75)" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                onClick={doExport}
                variant="contained"
                size="small"
                startIcon={<FileDownloadOutlinedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12.5,
                  bgcolor: "#16a34a",
                  "&:hover": { bgcolor: "#14833e" },
                }}
              >
                Export
              </Button>
            </Box>
          </Box>

          {/* body — single scroll container; sticky header inside table */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
              <Box
                sx={{
                  height: "100%",
                  overflow: "auto",
                  pr: 1,
                  scrollbarWidth: "thin",
                  scrollbarColor: "#3f3f3f transparent",
                  "&::-webkit-scrollbar": { width: 8, height: 8 },
                  "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
                  "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
                  "&::-webkit-scrollbar-track": { background: "transparent" },
                }}
              >
                {loading ? (
                  <Box sx={{ p: 2, color: "#aaa" }}>Loading…</Box>
                ) : (
                  <DarkScrollTable rows={rows} />
                )}
              </Box>
            </Box>
          </Box>

          {/* pagination */}
          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[10, 25, 50, 100]}
              sx={{
                px: 1,
                color: "#E8E8EA",
                minHeight: UI.paginationH,
                "& .MuiTablePagination-toolbar": {
                  minHeight: UI.paginationH,
                  p: 0,
                  pl: 1,
                  pr: 1,
                  gap: 0.5,
                },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: UI.font,
                  m: 0,
                },
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
    </MainLayout>
  );
}
