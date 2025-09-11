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
import DownloadIcon from "@mui/icons-material/Download";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import UpdateLicenseModal, {
  type LicenseLike,
} from "../../components/Models/UpdateLicenseModal";

/* ---------- API base ---------- */
const API = `${import.meta.env.VITE_API_BASE}/api`;

/* ---------- UI constants ---------- */
const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
const UI = {
  ctrlH: 30,
  font: 13,
  icon: 16,
  gap: 0.75,
  headerPx: 1.25,
  headerPy: 0.6,
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
  "& .MuiOutlinedInput-root": {
    height: `${UI.ctrlH}px`,
    color: "#fff",
  },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
    color: "#fff",
  },
  "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 1 },
  "& input::-webkit-input-placeholder": { color: "#fff", opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: "rgba(255,255,255,0.9)" },
};

/* ---------- Table types ---------- */
/** Make our table row exactly what the modal expects */
type Row = LicenseLike;

// type Column = {
//   key: keyof Row | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

type Column = {
  key: keyof Row | "action";
  label: string;
  width?: number;            // fixed px (keeps column fixed)
  min?: number;              // min width when flexible
  flex?: number;             // grow factor (fr units)
  align?: "left" | "center" | "right";
};


/* columns */
// const COLUMNS: Column[] = [
//   { key: "sr", label: "Sr No", width: 70, align: "center" },
//   { key: "reqNo", label: "License Req No", width: 150, align: "center" },
//   { key: "satName", label: "Satellite Name", width: 160, align: "center" },
//   { key: "station", label: "Station", width: 160, align: "center" },
//   { key: "applied", label: "Applied Date", width: 130, align: "center" },
//   { key: "receipt", label: "Receipt Date", width: 130, align: "center" },
//   { key: "validity", label: "Validity", width: 130, align: "center" },
//   { key: "band", label: "Band", width: 180, align: "center" },
//   { key: "downlink", label: "Downlink", width: 180, align: "center" },
//   { key: "uplink", label: "Uplink", width: 180, align: "center" },
//   { key: "status", label: "Status", width: 120, align: "center" },
//   { key: "remarks", label: "Remarks", width: 200, align: "center" },
//   { key: "action", label: "Action", width: 120, align: "center" },
// ];

const COLUMNS: Column[] = [
  { key: "sr",      label: "Sr No",          width: 70,  align: "center" },
  { key: "satName", label: "Satellite Name", min: 160,   flex: 1.1, align: "center" },
  { key: "station", label: "Station",        min: 150,   flex: 1,   align: "center" },
  { key: "applied", label: "Applied Date",   min: 120,   flex: 0.9, align: "center" },
  { key: "receipt", label: "Receipt Date",   min: 120,   flex: 0.9, align: "center" },
  { key: "validity",label: "Validity",       min: 120,   flex: 0.9, align: "center" },
  { key: "band",    label: "Band",           min: 120,   flex: 0.9, align: "center" },
  { key: "downlink",label: "Downlink",       min: 110,   flex: 0.8, align: "center" },
  { key: "uplink",  label: "Uplink",         min: 110,   flex: 0.8, align: "center" },
  { key: "status",  label: "Status",         min: 100,   flex: 0.7, align: "center" },
  { key: "remarks", label: "Remarks",        min: 160,   flex: 1,   align: "center" },
  { key: "action",  label: "Action",         width: 120, align: "center" },
];

/* ---------- Wide export type & band parser ---------- */
type ExportWideRow = {
  id: number;
  license_req_no: string;
  satellite_name: string;
  station_name: string;
  applied_date: string;
  receipt_date: string;
  validity_expiry: string;
  status: string;
  remarks: string | null;
  // e.g. "S-Band|2025|2200 || X-Band|7210|8450"
  bands: string;
};

function parseBands(bands: string): { band: string; uplink: string; downlink: string }[] {
  if (!bands) return [];
  return bands
    .split("||")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [band = "", uplink = "", downlink = ""] = chunk
        .split("|")
        .map((s) => (s ?? "").trim());
      return { band, uplink, downlink };
    })
    .filter((b) => b.band);
}

/* ---------- Table ---------- */
// function DarkScrollTable({
//   rows,
//   columns,
//   onUpdate,
// }: {
//   rows: Row[];
//   columns: Column[];
//   onUpdate: (r: Row) => void;
// }) {
//   const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;

//   return (
//     <Box>
//       <Box sx={{ width: totalW, minWidth: "100%" }}>
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
//               key={c.key}
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
//             key={r.id ?? idx}
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
//                     sx={{
//                       px: 1.25,
//                       py: 0.75,
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                     }}
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
//                       onClick={() => onUpdate(r)}
//                     >
//                       Update
//                     </Button>
//                   </Box>
//                 );
//               }
//               return (
//                 <Box
//                   key={String(c.key)}
//                   sx={{
//                     px: 1.25,
//                     py: 1,
//                     fontSize: 13,
//                     color: "#EAEAEA",
//                     textAlign: c.align ?? "center",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {r[c.key as keyof Row] as any}
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}

//         {rows.length === 0 && (
//           <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>
//             No licenses found.
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// }

// tighter, responsive horizontal padding
const CELL_PX = "clamp(6px, 0.8vw, 12px)";

function DarkScrollTable({
  rows,
  columns,
  onUpdate,
}: {
  rows: Row[];
  columns: Column[];
  onUpdate: (r: Row) => void;
}) {
  // minimal width so horizontal scroll appears on narrow screens
  const minTotal = columns.reduce(
    (acc, c) => acc + (c.width ?? c.min ?? 120),
    0
  ) + 16;

  // fixed columns use px; flexible columns use minmax(min, fr)
  const colTemplate = columns
    .map((c) =>
      c.width != null
        ? `${c.width}px`
        : `minmax(${c.min ?? 120}px, ${c.flex ?? 1}fr)`
    )
    .join(" ");

  return (
    <Box>
      <Box sx={{ width: "100%", minWidth: minTotal }}>
        {/* header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: colTemplate,
            bgcolor: "#000",
            borderBottom: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {columns.map((c) => (
            <Box
              key={String(c.key)}
              sx={{
                px: CELL_PX,          // was 1.25 — now compact & responsive
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
            key={r.id ?? idx}
            sx={{
              display: "grid",
              gridTemplateColumns: colTemplate,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            {columns.map((c) => {
              if (c.key === "action") {
                return (
                  <Box
                    key={`action-${idx}`}
                    sx={{
                      px: CELL_PX,
                      py: 0.75,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
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
                      onClick={() => onUpdate(r)}
                    >
                      Update
                    </Button>
                  </Box>
                );
              }

              return (
                <Box
                  key={String(c.key)}
                  sx={{
                    px: CELL_PX,
                    py: 1,
                    fontSize: 13,
                    color: "#EAEAEA",
                    textAlign: c.align ?? "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r[c.key as keyof Row] as any}
                </Box>
              );
            })}
          </Box>
        ))}

        {!rows.length && (
          <Box sx={{ px: CELL_PX, py: 2, color: "#aaa", textAlign: "center" }}>
            No licenses found.
          </Box>
        )}
      </Box>
    </Box>
  );
}


/* ---------- Page ---------- */
export default function LicensesList() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  /* fetch from backend — WIDE SHAPE (one row per license) */
  // const fetchRows = React.useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const r = await fetch(`${API}/licenses/export?format=json&shape=wide`);
  //     const j = await r.json();
  //     const data: ExportWideRow[] = Array.isArray(j?.data) ? j.data : [];

  //     const mapped: Row[] = data.map((x, i) => {
  //       const bands = parseBands(x.bands);
  //       return {
  //         id: Number(x.id), // ✅ needed for PUT/DELETE
  //         sr: i + 1,
  //         reqNo: x.license_req_no,
  //         satName: x.satellite_name,
  //         station: x.station_name,
  //         applied: x.applied_date || "",
  //         receipt: x.receipt_date || "",
  //         validity: x.validity_expiry || "",
  //         band: bands.map((b) => b.band).join(", "),
  //         downlink: bands.map((b) => b.downlink).join(", "),
  //         uplink: bands.map((b) => b.uplink).join(", "),
  //         status: x.status || "",
  //         remarks: x.remarks || "—",
  //       };
  //     });

  //     setRows(mapped);
  //     setPage(0);
  //   } catch (e) {
  //     console.error("Failed to load licenses", e);
  //     setRows([]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  const fetchRows = React.useCallback(async () => {
  const token = localStorage.getItem("token");
  try {
    setLoading(true);

    const r = await fetch(`${API}/licenses/export?format=json&shape=wide`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!r.ok) {
      const msg = await r.text().catch(() => "");
      console.error("Licenses fetch failed:", r.status, msg);
      setRows([]);
      return;
    }

    const j = await r.json().catch(() => ({}));
    const data: ExportWideRow[] = Array.isArray(j?.data) ? j.data : [];

    const mapped: Row[] = data.map((x, i) => {
      const bands = parseBands(x.bands);
      return {
        id: Number(x.id),
        sr: i + 1,
        reqNo: x.license_req_no,
        satName: x.satellite_name,
        station: x.station_name,
        applied: x.applied_date || "",
        receipt: x.receipt_date || "",
        validity: x.validity_expiry || "",
        band: bands.map((b) => b.band).join(", "),
        downlink: bands.map((b) => b.downlink).join(", "),
        uplink: bands.map((b) => b.uplink).join(", "),
        status: x.status || "",
        remarks: x.remarks || "—",
      };
    });

    setRows(mapped);
    setPage(0);
  } catch (e) {
    console.error("Failed to load licenses", e);
    setRows([]);
  } finally {
    setLoading(false);
  }
}, []);

  React.useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  /* search + paging */
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.reqNo,
        r.satName,
        r.station,
        r.applied,
        r.receipt,
        r.validity,
        r.band,
        r.downlink,
        r.uplink,
        r.status,
        r.remarks,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const paged = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  /* CSV export — WIDE SHAPE to match the table */
  // const doExport = React.useCallback(async () => {
  //   try {
  //     const resp = await fetch(`${API}/licenses/export?shape=wide`);
  //     if (!resp.ok) {
  //       const msg = await resp.text().catch(() => "");
  //       alert(`Export failed (${resp.status}): ${msg || resp.statusText}`);
  //       return;
  //     }
  //     const blob = await resp.blob();
  //     const dispo = resp.headers.get("Content-Disposition") || "";
  //     const m = dispo.match(/filename="?([^"]+)"?/i);
  //     const filename = m?.[1] || "licenses.csv";

  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement("a");
  //     a.href = url;
  //     a.download = filename;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     URL.revokeObjectURL(url);
  //   } catch (e) {
  //     console.error("Export error", e);
  //     alert("Export failed.");
  //   }
  // }, []);

  // Export CSV (WIDE shape) with Bearer token
const doExport = React.useCallback(async () => {
  const token = localStorage.getItem("token");
  try {
    const resp = await fetch(`${API}/licenses/export?shape=wide`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!resp.ok) {
      const msg = await resp.text().catch(() => "");
      alert(`Export failed (${resp.status}): ${msg || resp.statusText}`);
      return;
    }

    const blob = await resp.blob();
    const dispo = resp.headers.get("Content-Disposition") || "";
    const m = dispo.match(/filename="?([^"]+)"?/i);
    const filename = m?.[1] || "licenses.csv";

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
}, []);


  // modal state/handlers
  const [editOpen, setEditOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);

  const openEdit = (r: Row) => {
    setEditing(r);
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);

  return (
    <MainLayout title="License List">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{
            bgcolor: "#1C1C1E",
            color: "#E8E8EA",
            border: CONTROL_BORDER,
            borderRadius: 2,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* header */}
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

              <Button
                onClick={doExport}
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
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

          {/* body */}
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
                <DarkScrollTable rows={paged} columns={COLUMNS} onUpdate={openEdit} />
              </Box>
            </Box>
          </Box>

          {/* pagination */}
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
              rowsPerPageOptions={[5, 10, 25, 50]}
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

          {/* modal */}
          <UpdateLicenseModal
            open={editOpen}
            row={editing}
            onClose={closeEdit}
            onSaved={fetchRows}
            onDeleted={fetchRows}
          />
        </Card>
      </Box>
    </MainLayout>
  );
}
