// p3//
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
  TablePagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MainLayout from "../layouts/MainLayout";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TOPBAR_HEIGHT } from "../components/TopNav";

// ✅ shared API client
import { api } from "../api/http";

/* -------------------- Controls (shared styles) -------------------- */

const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";

const darkMenu = {
  PaperProps: {
    sx: {
      bgcolor: CONTROL_BG,
      color: "#E8E8EA",
      border: CONTROL_BORDER,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
    },
  },
};

const UI = {
  ctrlH: 30,
  font: 13,
  icon: 16,
  gap: 0.75,
  headerPx: 1.25,
  headerPy: 0.6,
  searchW: 180,
  selectW: 108,
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
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px !important`,
    lineHeight: `${UI.ctrlH - 2}px`,
    padding: "0 10px !important",
    display: "flex",
    alignItems: "center",
    fontSize: UI.font,
    color: "#fff",
  },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: "rgba(255,255,255,0.9)" },
} as const;

/* -------------------- API types -------------------- */

type ApiPass = {
  id: number;
  pass_req_no: string;
  date_text: string;
  satellite_name: string;
  supporting_station: string;
  orbit_no?: string;
  max_el_deg?: string;
  aos_ut: string;
  los_ut: string;
  operations?: string | null;
  operations_requester?: string | null;
  operations_supporter?: string | null;
  schedule_status: string;
  pass_status: string;
  remarks?: string | null;
};

/* -------------------- helpers -------------------- */

function Labeled({
  label,
  width,
  children,
}: {
  label: string;
  width: number | string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width }}>
      <Box sx={{ fontSize: 11, color: "rgba(255,255,255,0.75)", mb: 0.3, pl: 0.2 }}>
        {label}
      </Box>
      {children}
    </Box>
  );
}

/** Parse strictly as DD/MM/YYYY or DD-MM-YYYY (dashboard requirement). */
const parseDDMMYYYY = (s: string) => {
  const [d, m, y] = String(s).split(/[/-]/).map((n) => parseInt(n, 10));
  const dt = new Date(y || 1970, (m || 1) - 1, d || 1);
  return isNaN(+dt) ? new Date(1970, 0, 1) : dt;
};

/** Numeric key from "PRN-001" / "PRN001" etc. */
const reqNum = (req: string): number => {
  const m = String(req).match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
};

/* -------------------- table scaffold -------------------- */

// type Column = {
//   key: string;
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };


type Column = {
  key: string;
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  render?: (row: Row) => React.ReactNode; // allow custom display per column
};

type Row = { [key: string]: string | number };

// const COLUMNS: Column[] = [
//   { key: "sr", label: "Sr No", width: 70, align: "center" },
//   { key: "req", label: "Pass Req No", width: 160, align: "center" },
//   { key: "date", label: "Date", width: 130, align: "center" },
//   { key: "sat", label: "Satellite", width: 120, align: "center" },
//   { key: "stn", label: "Station", width: 130, align: "center" },
//   { key: "orb", label: "Orbit No", width: 110, align: "center" },
//   { key: "maxEl", label: "Max (El) Deg", width: 130, align: "center" },
//   { key: "aos", label: "AOS (UT)", width: 120, align: "center" },
//   { key: "los", label: "LOS (UT)", width: 120, align: "center" },
//   { key: "ops", label: "Operations", width: 140, align: "center" },
//   { key: "opsReq", label: "Operations Requester", width: 190, align: "center" },
//   { key: "opsSup", label: "Operations Supporter", width: 190, align: "center" },
//   { key: "sched", label: "Schedule Status", width: 160, align: "center" },
//   { key: "pass", label: "Pass Status", width: 130, align: "center" },
//   { key: "remarks", label: "Remarks", width: 220, align: "center" },
// ];

const COLUMNS: Column[] = [
  { key: "sr",    label: "Sr",                 width: 60,  align: "center" },
  // req is kept in data for sort/search but not shown
  { key: "date",  label: "Date",               width: 110, align: "center" },
  { key: "sat",   label: "Satellite",          width: 120, align: "center" },
  { key: "stn",   label: "Station",            width: 130, align: "center" },
  { key: "orb",   label: "Orbit",              width: 90,  align: "center" },
  { key: "maxEl", label: "Max (El)°",          width: 110, align: "center" },

  {
    key: "aos",   // keep existing key
    label: "AOS / LOS (UT)",
    width: 180,   // a bit wider so both times show
    align: "center",
    render: (r) => `${r.aos || "—"} / ${r.los || "—"}`,
  },

  { key: "ops",   label: "Operations",         width: 130, align: "center" },

  {
    key: "opsReq", // keep existing key
    label: "Ops requester / supporter",
    width: 240,   // a bit wider so both names show
    align: "center",
    render: (r) => `${r.opsReq || "—"} / ${r.opsSup || "—"}`,
  },

  { key: "sched", label: "Schedule",           width: 120, align: "center" },
  { key: "pass",  label: "Pass",               width: 100, align: "center" },
  { key: "remarks", label: "Remarks",          width: 180, align: "center" },
];


// function DarkScrollTable({ rows, columns }: { rows: Row[]; columns: Column[] }) {
//   const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;
//   return (
//     <Box sx={{ width: totalW, minWidth: "100%" }}>
//       {/* header */}
//       <Box
//         sx={{
//           position: "sticky",
//           top: 0,
//           zIndex: 1,
//           display: "grid",
//           gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
//           bgcolor: "#000",
//           borderBottom: "1px solid rgba(255,255,255,0.14)",
//         }}
//       >
//         {columns.map((c) => (
//           <Box
//             key={c.key}
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
//           key={idx}
//           sx={{
//             display: "grid",
//             gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
//             borderBottom: "1px solid rgba(255,255,255,0.08)",
//             bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//           }}
//         >
//           {columns.map((c) => (
//             <Box
//               key={c.key}
//               sx={{
//                 px: 1.25,
//                 py: 1,
//                 fontSize: 13,
//                 color: "#EAEAEA",
//                 textAlign: c.align ?? "center",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {r[c.key] as any}
//             </Box>
//           ))}
//         </Box>
//       ))}

//       {rows.length === 0 && (
//         <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No passes found.</Box>
//       )}
//     </Box>
//   );
// }


function DarkScrollTable({ rows, columns }: { rows: Row[]; columns: Column[] }) {
  const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;
  return (
    <Box sx={{ width: totalW, minWidth: "100%" }}>
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
            key={c.key}
            sx={{
              px: 0.75,   // tighter than 1.25
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
          {columns.map((c) => (
            <Box
              key={`${c.key}-${idx}`}
              sx={{
                px: 0.75,   // tighter than 1.25
                py: 1,
                fontSize: 13,
                color: "#EAEAEA",
                textAlign: c.align ?? "center",
                whiteSpace: "nowrap",
              }}
            >
              {c.render ? c.render(r) : (r[c.key] as any)}
            </Box>
          ))}
        </Box>
      ))}

      {rows.length === 0 && (
        <Box sx={{ px: 0.75, py: 2, color: "#aaa", textAlign: "center" }}>No passes found.</Box>
      )}
    </Box>
  );
}

/* -------------------- Page -------------------- */

export default function DashboardPage() {
  // filters
  const [search, setSearch] = React.useState("");
  const [timeline, setTimeline] = React.useState<
    "All" | "Today" | "Tomorrow" | "Week" | "Month" | "Year"
  >("All");
  const [status, setStatus] = React.useState<"All" | "Completed" | "Pending" | "Failed" | "Canceled">(
    "All"
  );
  const [date, setDate] = React.useState<Date | null>(null);

  // paging
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  // fetch passes
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // ✅ use client wrapper: Authorization header auto-included
        const j = await api.get<any>("/api/passes");
        const data: ApiPass[] = Array.isArray(j) ? j : Array.isArray(j?.rows) ? j.rows : [];
        const mapped: Row[] = data.map((p) => ({
          sr: 0,
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
        setRows(mapped);
        setPage(0);
      } catch (e) {
        console.error("Failed to fetch passes", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const clearFilters = () => {
    setSearch("");
    setTimeline("All");
    setStatus("All");
    setDate(null);
  };

  // filtering + SORT (ascending by PRN number)
  const filteredSorted = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today0 = startOfDay(new Date());

    const inTimeline = (dt: Date) => {
      const d0 = startOfDay(dt);
      if (timeline === "All") return true;
      if (timeline === "Today") return d0.getTime() === today0.getTime();
      if (timeline === "Tomorrow") {
        const t0 = startOfDay(new Date(today0));
        t0.setDate(t0.getDate() + 1);
        return d0.getTime() === t0.getTime();
      }
      if (timeline === "Week") {
        const weekAgo = startOfDay(new Date(today0));
        weekAgo.setDate(weekAgo.getDate() - 6);
        return d0 >= weekAgo && d0 <= today0;
      }
      if (timeline === "Month") {
        const monthAgo = startOfDay(new Date(today0));
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return d0 >= monthAgo && d0 <= today0;
      }
      if (timeline === "Year") {
        const yearAgo = startOfDay(new Date(today0));
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return d0 >= yearAgo && d0 <= today0;
      }
      return true;
    };

    // filter
    const arr = rows.filter((r) => {
      if (status !== "All" && r.pass !== status) return false;

      const dt = parseDDMMYYYY(String(r.date));
      if (!inTimeline(dt)) return false;

      if (date) {
        const pick = startOfDay(new Date(date));
        if (startOfDay(dt).getTime() !== pick.getTime()) return false;
      }

      if (q) {
        // const hay = `${r.req} ${r.sat} ${r.stn} ${r.ops} ${r.remarks}`.toLowerCase();
        const hay = `${r.req} ${r.sat} ${r.stn} ${r.ops} ${r.opsReq ?? ""} ${r.opsSup ?? ""} ${r.remarks}`.toLowerCase();

        if (!hay.includes(q)) return false;
      }
      return true;
    });

    // sort ascending by numeric part of "PRN-xxx"
    arr.sort((a, b) => {
      const na = reqNum(String(a.req));
      const nb = reqNum(String(b.req));
      if (na !== nb) return na - nb;
      return String(a.req).localeCompare(String(b.req));
    });

    return arr;
  }, [rows, search, timeline, status, date]);

  // paged rows with Sr No
  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    const slice = filteredSorted.slice(start, start + rowsPerPage);
    return slice.map((r, i) => ({ ...r, sr: start + i + 1 }));
  }, [filteredSorted, page, rowsPerPage]);

  const totalRows = filteredSorted.length;

  return (
    <MainLayout title="Dashboard">
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
          {/* Header */}
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
            <Box sx={{ ml: "auto", display: "flex", alignItems: "flex-end", gap: UI.gap }}>
              {/* Search lowered to align with labeled controls */}
              <Box sx={{ mt: 2.1 }}>
                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={loading ? "Loading…" : "Search…"}
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
              </Box>

              <Labeled label="Timeline" width={UI.selectW}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value as any)}
                    MenuProps={darkMenu}
                    sx={compactCtrlSx}
                  >
                    {["All", "Today", "Tomorrow", "Week", "Month", "Year"].map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Labeled>

              <Labeled label="Status" width={UI.selectW}>
                <FormControl size="small" fullWidth>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    MenuProps={darkMenu}
                    sx={compactCtrlSx}
                  >
                    {["All", "Completed", "Pending", "Failed", "Canceled"].map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Labeled>

              <Labeled label="Date" width={150}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={date}
                    onChange={(v: Date | null) => setDate(v)}
                    slotProps={{
                      textField: {
                        size: "small",
                        placeholder: "DD/MM",
                        sx: { width: 150, ...compactCtrlSx },
                      },
                      openPickerButton: { sx: { color: "rgba(255,255,255,0.85)" } },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": { bgcolor: CONTROL_BG, color: "#fff", border: CONTROL_BORDER },
                          "& .MuiPickersDay-root": { color: "#EDEDED" },
                          "& .MuiPickersDay-root.Mui-selected": {
                            bgcolor: "#7C57F2 !important",
                            color: "#fff",
                          },
                          "& .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-label": {
                            color: "#fff",
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Labeled>

              <Button
                onClick={clearFilters}
                size="small"
                sx={{ mt: 2.1, color: "#7CA7FF", textTransform: "none", fontWeight: 700 }}
              >
                Clear
              </Button>
            </Box>
          </Box>

          {/* Body — single scroll container */}
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
                <DarkScrollTable rows={paged} columns={COLUMNS} />
              </Box>
            </Box>
          </Box>

          {/* Pagination */}
          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            <TablePagination
              component="div"
              count={totalRows}
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
