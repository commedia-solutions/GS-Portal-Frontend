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
import UpdateSatelliteModal from "../../components/Models/UpdateSatelliteModal";

/* ---------- API base ---------- */
const API = `${import.meta.env.VITE_API_BASE}/api`;
// put near API const
// const authHeaders = () => {
//   const t = localStorage.getItem("token"); // or wherever you store it
//   return t ? { Authorization: `Bearer ${t}` } : {};
// };


/* ---------- UI constants ---------- */
const CONTROL_BG = "#1C1C1E";
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

/* compact control style (search field) */
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

/* ---------- Table types & columns ---------- */
type Row = {
  id: number;
  sr: number;
  satId: string;
  satName: string;
  norad: string;
  itu: string;
  station: string;
  pol: string;
};

// type Column = {
//   key: keyof Row | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

type Column = {
  key: keyof Row | "action";
  label: string;
  width?: number;                 // fixed px (kept for Sr/Action)
  min?: number;                   // NEW: min width for flexible columns
  flex?: number;                  // NEW: grow factor in fr units
  align?: "left" | "center" | "right";
};

// const COLUMNS: Column[] = [
//   { key: "sr", label: "Sr No", width: 80, align: "center" },
//   { key: "satId", label: "Satellite ID", width: 140, align: "center" },
//   { key: "satName", label: "Satellite Name", width: 180, align: "center" },
//   { key: "norad", label: "Norad ID", width: 130, align: "center" },
//   { key: "itu", label: "ITU Name", width: 130, align: "center" },
//   { key: "station", label: "Station", width: 180, align: "center" },
//   { key: "pol", label: "Polarization", width: 180, align: "center" },
//   { key: "action", label: "Action", width: 130, align: "center" },
// ];

const COLUMNS: Column[] = [
  { key: "sr",      label: "Sr No",          width: 72,  align: "center" },
  { key: "satId",   label: "Satellite ID",   min: 120,   flex: 1,   align: "center" },
  { key: "satName", label: "Satellite Name", min: 160,   flex: 1.1, align: "center" },
  { key: "norad",   label: "Norad ID",       min: 120,   flex: 0.9, align: "center" },
  { key: "itu",     label: "ITU Name",       min: 120,   flex: 0.9, align: "center" },
  { key: "station", label: "Station",        min: 160,   flex: 1.1, align: "center" },
  { key: "pol",     label: "Polarization",   min: 140,   flex: 1,   align: "center" },
  { key: "action",  label: "Action",         width: 120, align: "center" },
];


/* ---------- Table (simple) ---------- */
// function DarkScrollTable({
//   rows,
//   columns,
//   onEdit,
// }: {
//   rows: Row[];
//   columns: Column[];
//   onEdit: (r: Row) => void;
// }) {
//   const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;

//   return (
//     <Box>
//       <Box sx={{ width: totalW, minWidth: "100%" }}>
//         {/* sticky black header */}
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
//             key={`${r.id}-${idx}`}
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
//             No satellites found.
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// }

const CELL_PX = "clamp(6px, 0.8vw, 12px)";

function DarkScrollTable({
  rows,
  columns,
  onEdit,
}: {
  rows: Row[];
  columns: Column[];
  onEdit: (r: Row) => void;
}) {
  // minimal total width so we still get horizontal scroll on very small screens
  const minTotal = columns.reduce(
    (acc, c) => acc + (c.width ?? c.min ?? 120),
    0
  ) + 16;

  // responsive grid: fixed px when width is given; otherwise minmax(..., Xfr)
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
                px: CELL_PX,         // was 1.25 — now responsive + tighter
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
            key={`${r.id}-${idx}`}
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
                      onClick={() => onEdit(r)}
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
                    px: CELL_PX,       // was 1.25 — tighter & responsive
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
            No satellites found.
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ---------- Page ---------- */
export default function SatellitesList() {
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [editing, setEditing] = React.useState<Row | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);


  const fetchRows = React.useCallback(async () => {
  const token = localStorage.getItem("token");
  try {
    setLoading(true);

    const r = await fetch(`${API}/satellites`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    const j = await r.json().catch(() => ({}));
    const arr: any[] = Array.isArray(j)
      ? j
      : Array.isArray(j?.data)
      ? j.data
      : Array.isArray(j?.rows)
      ? j.rows
      : [];

    const mapped: Row[] = arr.map((x: any, i: number) => ({
      id: Number(x.id ?? i + 1),
      sr: i + 1,
      satId: String(x.satellite_id ?? ""),
      satName: String(x.satellite_name ?? ""),
      norad: String(x.norad_id ?? ""),
      itu: String(x.itu_name ?? ""),
      station: String(x.station_name ?? ""),
      pol: String(x.polarization ?? ""),
    }));

    setRows(mapped);
    setPage(0);
  } catch (e) {
    console.error("Failed to load satellites", e);
    setRows([]);
  } finally {
    setLoading(false);
  }
}, []);

  React.useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  /* client search + paging */
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.satId, r.satName, r.norad, r.itu, r.station, r.pol].join(" ").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const paged = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  

  const doExport = React.useCallback(async () => {
  const token = localStorage.getItem("token");
  try {
    const resp = await fetch(`${API}/satellites/export?format=csv`, {
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
    const filename = m?.[1] || "satellites.csv";

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

  const handleEdit = (r: Row) => {
    setEditing(r);
    setModalOpen(true);
  };

  
  const handleSave = async () => {
  await fetchRows();      // re-pull after successful PUT inside modal
  setModalOpen(false);
};


  const handleDelete = async () => {
  await fetchRows();      // re-pull after successful DELETE inside modal
  setModalOpen(false);
};

  return (
    <MainLayout title="Satellite List">
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
                <DarkScrollTable rows={paged} columns={COLUMNS} onEdit={handleEdit} />
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
        </Card>
      </Box>

      {/* modal (PUT/DELETE will be implemented in the modal next) */}
      <UpdateSatelliteModal
        open={modalOpen}
        row={
          editing
            ? {
                satId: editing.satId,
                satName: editing.satName,
                norad: editing.norad,
                itu: editing.itu,
                station: editing.station,
                pol: editing.pol,
              }
            : null
        }
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </MainLayout>
  );
}
