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
import UpdateLicenseModal, { type LicenseLike } from "../../components/Models/UpdateLicenseModal";
import { useActionAccess } from "../../auth/useActionAccess";


import { useI18n } from "../../i18n";
import api from "../../api/http"; // ⬅️ use the same helper as Add page

/* ---------- Theme tokens via CSS variables ---------- */
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
} as const;

const SCROLLER_SX = {
  scrollbarWidth: "thin",
  scrollbarColor: `${TOK.SCROLLBAR} transparent`,
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: TOK.SCROLLBAR, borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: TOK.SCROLLBAR },
  "&::-webkit-scrollbar-track": { background: "transparent" },
} as const;

/* ---------- UI ---------- */
const UI = {
  ctrlH: 30,
  font: 13,
  icon: 16,
  gap: 0.75,
  headerPx: 1.25,
  headerPy: 0.6,
  searchW: 260,
  paginationH: 36,
} as const;

/* compact input */
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

/* ---------- Table types ---------- */
type Row = LicenseLike;

type Column = {
  key: keyof Row | "action";
  label: string;
  width?: number;
  min?: number;
  flex?: number;
  align?: "left" | "center" | "right";
};

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
  bands: string;
  added_by: string;
  created_at: string;
  updated_at: string;   // ✅ ADD THIS
};
function parseBands(bands: string): { band: string; uplink: string; downlink: string }[] {
  if (!bands) return [];
  return bands
    .split("||")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [band = "", uplink = "", downlink = ""] = chunk.split("|").map((s) => (s ?? "").trim());
      return { band, uplink, downlink };
    })
    .filter((b) => b.band);
}

// 🎯 License Status color grading (matches Add License statuses)
const getLicenseStatusStyle = (status: string) => {
  switch (status) {
    case "Pending":
      return {
        bgcolor: "#FEF3C7",   // light yellow
        color: "#92400E",     // dark amber
        border: "1px solid #FCD34D",
      };
    case "Approved":
      return {
        bgcolor: "#DCFCE7",   // light green
        color: "#166534",     // dark green
        border: "1px solid #86EFAC",
      };
    case "Rejected":
      return {
        bgcolor: "#FFE4E6",   // light red/pink
        color: "#9F1239",     // dark red
        border: "1px solid #FDA4AF",
      };
    case "Expired":
      return {
        bgcolor: "#E5E7EB",   // light gray
        color: "#374151",     // dark gray
        border: "1px solid #D1D5DB",
      };
    default:
      return {
        bgcolor: "transparent",
        color: TOK.TEXT_DIM,
        border: "none",
      };
  }
};

/* ---------- Table ---------- */
const CELL_PX = "clamp(6px, 0.8vw, 12px)";

function ThemedScrollTable({
  rows,
  columns,
  onUpdate,
  emptyText,
  isEditor,
}: {
  rows: Row[];
  columns: Column[];
  onUpdate: (r: Row) => void;
  emptyText: string;
  isEditor: boolean;
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
        {/* header uses CSS vars defined on Card */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: colTemplate,
            bgcolor: "var(--lic-thead-bg)",
            borderBottom: TOK.BORDER_STR,
          }}
        >
          {columns.map((c) => (
            <Box
              key={String(c.key)}
              sx={{
                ...cellSx,
                fontWeight: 700,
                color: "var(--lic-thead-text)",
                textAlign: c.align ?? "center",
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
              borderBottom: TOK.BORDER_STR,
              bgcolor: idx % 2 === 0 ? "var(--row-odd)" : "var(--row-even)",
            }}
          >
            {columns.map((c) => {
           if (c.key === "action") {
  return (
    <Box
      key={`action-${idx}`}
      sx={{
        ...cellSx,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "visible",
      }}
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
          onClick={() => onUpdate(r)}
        >
          Edit
        </Button>
      )}
    </Box>
  );
}
// 🎯 Status pill rendering
if (c.key === "status") {
  return (
    <Box
key={`status-${idx}`}
      sx={{
        ...cellSx,
        textAlign: "center",
        overflow: "visible",
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          px: 1.2,
          py: 0.4,
          borderRadius: 999,
          fontSize: 12.5,
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: "nowrap",
          ...getLicenseStatusStyle(String(r.status)),
        }}
      >
        {r.status}
      </Box>
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
export default function LicensesList() {
  const { t } = useI18n();

const { hasWriteAccess } = useActionAccess();
const canEdit = hasWriteAccess("licenses");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  // modal wiring
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

 const COLUMNS: Column[] = React.useMemo(
  () => {
    const cols: Column[] = [
      { key: "sr",       label: t("Sr No"),          width: 70, align: "center" },
      { key: "satName",  label: t("Satellite Name"), min: 120, flex: 1.1, align: "center" },
      { key: "station",  label: t("Station"),        min: 100, flex: 1,   align: "center" },
      { key: "applied",  label: t("Applied Date"),   min: 120, flex: 0.9, align: "center" },
      { key: "receipt",  label: t("Receipt Date"),   min: 120, flex: 0.9, align: "center" },
      { key: "validity", label: t("Validity"),       min: 120, flex: 0.9, align: "center" },
      { key: "band",     label: t("Band"),           min: 120, flex: 0.9, align: "center" },
      { key: "downlink", label: t("Downlink"),       min: 110, flex: 0.8, align: "center" },
      { key: "uplink",   label: t("Uplink"),         min: 110, flex: 0.8, align: "center" },
      { key: "status",   label: t("Status"),         min: 100, flex: 0.7, align: "center" },
        { key: "addedBy", label: t("Added By"), min: 120, flex: 0.9, align: "center" }, // ✅ new
  { key: "dateTime", label: t("Date/Time"), min: 170, flex: 1, align: "center" }, // ✅ new
      { key: "remarks",  label: t("Remarks"),        min: 120, flex: 1,   align: "center" },
    ];

    if (canEdit) {
  cols.push({ key: "action", label: t("Action"), width: 120, align: "center" });
}

    return cols;
  },
  [t, canEdit]
);


  const fetchRows = React.useCallback(async () => {
    try {
      setLoading(true);

      // use the same helper and origin as the Add page, add cache buster
      const j = await api.get<any>(`/api/licenses/export?format=json&shape=wide&_=${Date.now()}`);
      const data: ExportWideRow[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];

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

    addedBy: x.added_by || "—",   // ✅ ADD THIS

    dateTime: x.updated_at
      ? new Date(x.updated_at).toLocaleString("en-IN")
      : "—",

    remarks: x.remarks || "—",
  } as Row;
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
        r.addedBy,
r.dateTime,
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

  const openModal = (r: Row) => {
  if (!canEdit) return;
  setEditing(r);
  setModalOpen(true);
};

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

            /* header colors to match Documents page */
            "--lic-thead-bg": "#000000",
            "--lic-thead-text": "#ffffff",
            "--row-stripe": "rgba(255,255,255,0.06)",

            ".theme-dark &": {
              "--lic-thead-bg": "#000000",
              "--lic-thead-text": "#ffffff",
              "--row-stripe": "rgba(255,255,255,0.06)",
            },
            ".theme-light &": {
              "--lic-thead-bg": "#464B4E",
              "--lic-thead-text": "#ffffff",
              "--row-stripe": "rgba(0,0,0,0.035)",
            },
          }}
        >
          {/* header strip — transparent like Documents */}
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
                onClick={async () => {
                  // keep auth header, but use same-origin path and add cache buster
                  const token = localStorage.getItem("token");
                  try {
                    const resp = await fetch(`/api/licenses/export?shape=wide&_=${Date.now()}`, {
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
                }}
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
                onClick={() => window.print()}
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
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5, bgcolor: "transparent" }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden", bgcolor: "transparent" }}>
              <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX, bgcolor: "transparent" }}>
                <ThemedScrollTable
  rows={paged}
  columns={COLUMNS}
  onUpdate={openModal}
  emptyText={t("No licenses found.")}
  isEditor={canEdit}
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

          {/* modal */}
          <UpdateLicenseModal
            open={modalOpen}
            row={editing}
            onClose={() => setModalOpen(false)}
            onSaved={() => {
              setModalOpen(false);
              fetchRows();
            }}
            onDeleted={() => {
              setModalOpen(false);
              fetchRows();
            }}
          />
        </Card>
      </Box>
    </MainLayout>
  );
}
