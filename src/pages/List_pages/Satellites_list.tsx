// src/pages/Add_data_pages/SatellitesList.tsx
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
import PrintIcon from "@mui/icons-material/Print";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import UpdateSatelliteModal from "../../components/Models/UpdateSatelliteModal";
import api, { getAuthToken } from "../../api/http"; // ✅ use same client + fresh token
import { useI18n } from "../../i18n";

import { useActionAccess } from "../../auth/useActionAccess";


/* ---------- API base (safe fallback for fetch-based export) ---------- */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const API = API_BASE ? `${API_BASE}/api` : `/api`;

/* ---------- Use CSS variables ---------- */
const TOK = {
  TEXT: "var(--text)",
  TEXT_DIM: "var(--text-dim)",
  CARD_BG: "var(--bg-card)",
  CONTROL_BG: "var(--bg-ctrl)",
  HOVER: "var(--bg-hover)",
  BORDER_STR: "1px solid var(--border)",
  BORDER_WEAK: "var(--border-weak)",
  ICON: "var(--text)",
  ACCENT: "var(--accent)",
  SCROLLBAR: "var(--scrollbar)",
};

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
  bgcolor: TOK.CONTROL_BG,
  borderRadius: 1,
  color: TOK.TEXT,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: TOK.BORDER_WEAK },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--border)",
  },
  "& .MuiOutlinedInput-root": {
    height: `${UI.ctrlH}px`,
    color: TOK.TEXT,
    backgroundColor: TOK.CONTROL_BG,
    paddingLeft: 8,
  },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
    color: TOK.TEXT,
  },
  "& .MuiInputBase-input::placeholder": { color: TOK.TEXT_DIM, opacity: 1 },
  "& input::-webkit-input-placeholder": { color: TOK.TEXT_DIM, opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: TOK.ICON },
} as const;

/* ---------- table ---------- */
type Row = {
  id: number;
  sr: number;
  satId: string;
  satName: string;
  norad: string;
  itu: string;
  station: string;
  pol: string;
   addedBy: string;
  dateTime: string;
};

type Column = {
  key: keyof Row | "action";
  label: string;
  width?: number;
  min?: number;
  flex?: number;
  align?: "left" | "center" | "right";
};


function ThemedScrollTable({
  rows,
  columns,
  onEdit,
  emptyText,
  isEditor,
  onResize,
}: {
  rows: Row[];
  columns: Column[];
  onEdit: (r: Row) => void;
  emptyText: string;
  isEditor: boolean;
  onResize?: (key: string, width: number) => void;
}) {

  const minTotal = columns.reduce((acc, c) => acc + (c.width ?? c.min ?? 80), 0) + 16;
  const colTemplate = columns
    .map((c) => {
      if (c.key === "action") return "120px";
      return c.width != null ? `${c.width}px` : `minmax(${Math.max(c.min ?? 80, 80)}px, ${c.flex ?? 1}fr)`;
    })
    .join(" ");

  const cellSx = {
    px: "14px",
    py: "10px",
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    minWidth: "80px",
  } as const;

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box sx={{ width: "100%", minWidth: minTotal, tableLayout: "fixed" }}>
        {/* header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: colTemplate,
            bgcolor: "var(--sat-thead-bg)",
            borderBottom: TOK.BORDER_STR,
          }}
        >
          {columns.map((c) => (
            <Box
              key={String(c.key)}
              sx={{
                ...cellSx,
                fontWeight: 700,
                color: "var(--sat-thead-text)",
                textAlign: c.align ?? "center",
                position: "relative",
                "& .resizer": {
                  position: "absolute",
                  right: 0,
                  top: "20%",
                  height: "60%",
                  width: "2px",
                  bgcolor: "rgba(255,255,255,0.15)",
                  cursor: "col-resize",
                  "&:hover": { bgcolor: TOK.ACCENT, width: "4px" },
                  ".theme-light &": {
                    bgcolor: "rgba(0,0,0,0.12)",
                  },
                },
              }}
            >
              {c.label}
              {onResize && ["station", "pol"].includes(String(c.key)) && (
                <Box
                  className="resizer"
                  onMouseDown={(e) => {
                    const startX = e.pageX;
                    const startWidth = c.width ?? c.min ?? 80;
                    const onMove = (me: MouseEvent) => {
                      onResize(String(c.key), Math.max(50, startWidth + (me.pageX - startX)));
                    };
                    const onUp = () => {
                      document.removeEventListener("mousemove", onMove);
                      document.removeEventListener("mouseup", onUp);
                    };
                    document.addEventListener("mousemove", onMove);
                    document.addEventListener("mouseup", onUp);
                  }}
                />
              )}
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
              borderBottom: TOK.BORDER_STR,
              bgcolor: idx % 2 === 0 ? "var(--row-odd)" : "var(--row-even)",
            }}
          >
            {columns.map((c) => {
              if (c.key === "action") {
                return (
                  <Box
                    key={`action-${idx}`}
                    sx={{ ...cellSx, display: "flex", justifyContent: "center", alignItems: "center", overflow: "visible" }}
                  >
                    {isEditor && (
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
                      Edit
                    </Button>
                    )}
                  </Box>
                );
              }
              const cellValue = String(r[c.key as keyof Row] ?? "");
              return (
                <Box
                  key={String(c.key)}
                  title={cellValue}
                  sx={{
                    ...cellSx,
                    color: TOK.TEXT_DIM,
                    textAlign: c.align ?? "center",
                    width: c.width ? `${c.width}px` : "auto",
                  }}
                >
                  {cellValue}
                </Box>
              );
            })}
          </Box>
        ))}

        {!rows.length && (
          <Box sx={{ px: "14px", py: 2, color: TOK.TEXT_DIM, textAlign: "center" }}>
            {emptyText}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ---------- Page ---------- */
export default function SatellitesList() {
  const { t } = useI18n();

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [editing, setEditing] = React.useState<Row | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

const { hasWriteAccess } = useActionAccess();
const canEdit = hasWriteAccess("satellites");


  const fetchRows = React.useCallback(async () => {
    try {
      setLoading(true);
      // cache-buster so we never get stale data
      const r = await api.get(`/api/satellites?_=${Date.now()}`);
      const j: any = r as any;

      const arr: any[] = Array.isArray(j)
        ? j
        : Array.isArray(j?.data)
        ? j.data
        : Array.isArray(j?.rows)
        ? j.rows
        : [];

      const mapped: Row[] = arr.map((x: any, i: number) => ({
  id: Number(x.id),

  sr: i + 1,
  satId: String(x.satellite_id ?? ""),
  satName: String(x.satellite_name ?? ""),
  norad: String(x.norad_id ?? ""),
  itu: String(x.itu_name ?? ""),
  station: String(x.station_name ?? ""),
  pol: String(x.polarization ?? ""),
  addedBy: String(x.added_by ?? ""),
dateTime: (() => {
  const dt = x.date_time || x.created_at || x.updated_at;
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
})(),
}));


      setRows(mapped);
      setPage(0);
    } catch (e: any) {
      console.error("Failed to load satellites", e);
      const msg = e?.response?.data?.message || e?.message || "Failed to load satellites";
      alert(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRows();
  }, [fetchRows]);

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
    try {
      // ✅ use the same fresh auth token the api client uses
      const token = getAuthToken();
      const resp = await fetch(`${API}/satellites/export?format=csv&_=${Date.now()}`, {
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

  const doPrint = React.useCallback(() => window.print(), []);

const handleEdit = (r: Row) => {
  if (!canEdit) return;
  setEditing(r);
  setModalOpen(true);
};

  const handleSave = async () => {
    await fetchRows();
    setModalOpen(false);
  };
  const handleDelete = async () => {
    await fetchRows();
    setModalOpen(false);
  };

  const [dynamicCols, setDynamicCols] = React.useState<Column[]>([
    { key: "sr", label: t("Sr No"), width: 72, align: "center" },
    { key: "satId", label: t("Satellite ID"), min: 120, flex: 1, align: "center" },
    { key: "satName", label: t("Satellite Name"), min: 160, flex: 1.1, align: "center" },
    { key: "norad", label: t("Norad ID"), min: 120, flex: 0.9, align: "center" },
    { key: "itu", label: t("ITU Name"), min: 120, flex: 0.9, align: "center" },
    { key: "station", label: t("Station"), min: 160, flex: 1.1, align: "center" },
    { key: "pol", label: t("Polarization"), min: 140, flex: 1, align: "center" },
    { key: "addedBy", label: t("Added By"), min: 140, flex: 1, align: "center" },
    { key: "dateTime", label: t("Date/Time"), min: 170, flex: 1.2, align: "center" },
  ]);

  const handleResize = (key: string, width: number) => {
    setDynamicCols(prev => prev.map(c => c.key === key ? { ...c, width, flex: undefined } : c));
  };

  const FINAL_COLUMNS = React.useMemo(() => {
    const cols = [...dynamicCols];
    if (canEdit) cols.push({ key: "action", label: t("Action"), width: 120, align: "center" });
    return cols;
  }, [dynamicCols, t, canEdit]);

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          elevation={0}
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
            "--sat-thead-bg": "#000000",
            "--sat-thead-text": "#ffffff",
            ".theme-dark &": {
              "--sat-thead-bg": "#000000",
              "--sat-thead-text": "#ffffff",
            },
            ".theme-light &": {
              "--sat-thead-bg": "#464B4E",
              "--sat-thead-text": "#ffffff",
            },
          }}
        >
          {/* header strip */}
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
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: UI.gap }}>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={loading ? t("Loading…") : t("Search…")}
                size="small"
                sx={{ width: UI.searchW, ...compactCtrlSx }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0.25 }}>
                      <SearchIcon sx={{ fontSize: UI.icon, color: TOK.ICON }} />
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
                  color: "#fff",
                  "& .MuiSvgIcon-root": { color: "#fff" },
                  "&:hover": { bgcolor: "#14833e", color: "#fff" },
                }}
              >
                {t("Export")}
              </Button>

              <Button
                onClick={doPrint}
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12.5,
                  borderColor: TOK.BORDER_WEAK,
                  color: TOK.TEXT,
                  bgcolor: TOK.HOVER,
                  "&:hover": { bgcolor: TOK.HOVER },
                }}
              >
                {t("Print")}
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
                  scrollbarColor: `${TOK.SCROLLBAR} transparent`,
                  "&::-webkit-scrollbar": { width: 8, height: 8 },
                  "&::-webkit-scrollbar-thumb": { background: `var(--scrollbar)`, borderRadius: 8 },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: "color-mix(in srgb, var(--scrollbar) 80%, #888)",
                  },
                  "&::-webkit-scrollbar-track": { background: "transparent" },
                }}
              >
                <ThemedScrollTable
                  rows={paged}
                  columns={FINAL_COLUMNS}
                  onEdit={handleEdit}
                  emptyText={t("No satellites found.")}
                  isEditor={canEdit}
                  onResize={handleResize}
                />

              </Box>
            </Box>
          </Box>

          {/* pagination */}
          <Box sx={{ borderTop: TOK.BORDER_STR }}>
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
              labelRowsPerPage={t("Rows per page:")}
              sx={{
                px: 1,
                color: TOK.TEXT,
                minHeight: UI.paginationH,
                "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: UI.font, m: 0, color: TOK.TEXT_DIM,
                },
                "& .MuiTablePagination-input": { fontSize: UI.font, m: 0, color: TOK.TEXT },
                "& .MuiSelect-select": {
                  py: 0, px: 1, fontSize: UI.font, height: UI.ctrlH - 6,
                  display: "flex", alignItems: "center", bgcolor: TOK.CONTROL_BG, borderRadius: 1,
                },
                "& .MuiIconButton-root": { p: 0.25, color: TOK.TEXT },
                ".MuiSvgIcon-root": { color: TOK.TEXT, fontSize: UI.icon },
              }}
            />
          </Box>

          {/* modal */}
          <UpdateSatelliteModal
            open={modalOpen}
            row={
              editing
                ? {
                            id: editing.id, // ✅ ADD THIS

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
        </Card>
      </Box>
    </MainLayout>
  );
}
