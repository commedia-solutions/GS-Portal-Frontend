// src/pages/List_pages/Satellites_list.tsx
import React from "react";
import {
  Box, Button, TextField, InputAdornment, TablePagination,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import PrintIcon from "@mui/icons-material/Print";
import DateRangeUI from "../../components/DateRangeUI";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import UpdateSatelliteModal from "../../components/Models/UpdateSatelliteModal";
import api from "../../api/http";
import { useI18n } from "../../i18n";
import { useActionAccess } from "../../auth/useActionAccess";
import { vars, sxPresets } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, THEAD_CELL_SX, ROW_CELL_SX, PAGINATION_SX, AmbientLighting, TableScanLine, glassRowHoverSx } from "../../ui/styles";
import { Card } from "@mui/material";

/* ─────────────────────── style constants ─────────────────────── */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;
const BORDER = vars.border;

const ctrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "32px",
    fontSize: 12.5,
    color: TEXT,
    backgroundColor: vars.bgCtrl,
    borderRadius: "9px",
    "& fieldset": { borderColor: BORDER },
    "&:hover fieldset": { borderColor: vars.accent },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1 },
  },
  "& .MuiInputBase-input": { padding: "0 10px", fontSize: 12.5, color: TEXT },
  "& .MuiInputBase-input::placeholder": { color: DIM, opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: 16, color: DIM },
} as const;

/* ---------- Types ---------- */
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

/* ---------- Page ---------- */
export default function SatellitesList() {
  const { t } = useI18n();
  const { hasWriteAccess } = useActionAccess();
  const canEdit = hasWriteAccess("satellites");

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);

  const fetchRows = React.useCallback(async () => {
    try {
      setLoading(true);
      const r = await api.get(`/api/satellites?_=${Date.now()}`);
      const arr = Array.isArray(r) ? r : (r as any)?.data || [];
      const mapped: Row[] = arr.map((x: any, i: number) => {
        let addedBy = x.added_by || "—";
        if (addedBy === "UI") addedBy = "System Admin";
        return {
          id: Number(x.id),
          sr: i + 1,
          satId: String(x.satellite_id ?? ""),
          satName: String(x.satellite_name ?? ""),
          norad: String(x.norad_id ?? ""),
          itu: String(x.itu_name ?? ""),
          station: x.station_name || "—",
          pol: x.polarization || "—",
          addedBy: addedBy,
          dateTime: x.updated_at ? new Date(x.updated_at).toLocaleString("en-IN") : "—"
        };
      });
      setRows(mapped);
    } catch (e: any) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchRows(); }, [fetchRows]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => [r.satId, r.satName, r.norad, r.itu, r.station, r.pol, r.addedBy].join(" ").toLowerCase().includes(q));
  }, [rows, search]);

  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const doExport = () => {
    const cols = COLUMNS.filter(c => c.key !== "action");
    const header = cols.map(c => c.label).join(",");
    const csvRows = filtered.map((r, idx) => {
      return [
        page * rowsPerPage + idx + 1,
        `"${r.satId}"`,
        `"${r.satName}"`,
        `"${r.norad}"`,
        `"${r.itu}"`,
        `"${r.station}"`,
        `"${r.pol}"`,
        `"${r.addedBy}"`,
        `"${r.dateTime}"`
      ].join(",");
    });
    const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "satellites.csv";
    a.click();
  };

  const theadCellSx = {
    ...THEAD_CELL_SX,
    fontSize: 9.5, fontWeight: 800, textAlign: "center",
    textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "var(--thead-text)",
    borderBottom: `1px solid ${vars.border}`, whiteSpace: "nowrap" as const
  };

  const bodyCellSx = {
    padding: "12px 14px", overflow: "hidden", textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const, minWidth: "80px", textAlign: "center" as const,
    fontSize: 12, borderBottom: `1px solid ${vars.borderWeak}`, color: vars.text
  };

  const GRID_CELL_STYLES = "70px 100px 1.5fr 100px 100px 1.5fr 100px 1.5fr 120px";

  const COLUMNS = [
    { key: "sr", label: t("Sr") },
    { key: "satId", label: t("ID") },
    { key: "satName", label: t("Name") },
    { key: "norad", label: t("NORAD") },
    { key: "itu", label: t("ITU") },
    { key: "station", label: t("Station") },
    { key: "pol", label: t("Pol") },
    { key: "dateTime", label: t("Last Update") },
    { key: "action", label: t("Action") },
  ];



  return (
    <MainLayout title="">
      <Box sx={{ px: 2, pt: 1, pb: 2, height: `calc(100vh - ${TOPBAR_HEIGHT}px)`, display: "flex", flexDirection: "column" }}>
        <Card sx={{ ...PREMIUM_CARD_SX, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <AmbientLighting />

          {/* Toolbar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: `1px solid ${vars.border}`, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: ACCENT, boxShadow: `0 0 8px ${ACCENT}88` }} />
              <Box sx={{ fontSize: 13.5, fontWeight: 700, color: TEXT }}>{t("Satellite List")}</Box>
              <Box sx={{ ml: 0.5, px: 1, py: 0.2, borderRadius: "999px", bgcolor: `rgba(14, 165, 233,0.12)`, color: ACCENT, border: `1px solid rgba(14, 165, 233,0.2)`, fontSize: 11, fontWeight: 700 }}>
                {filtered.length}
              </Box>
            </Box>

            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <DateRangeUI
                label={t("Select Date Range")}
                startDate={fromDate}
                endDate={toDate}
                onChange={(s, e) => { setFromDate(s); setToDate(e); setPage(0); }}
              />
              <TextField
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t("Search…")} size="small" sx={{ width: 170, ...ctrlSx }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15 }} /></InputAdornment> }}
              />
              <Button onClick={doExport} variant="contained" size="small" startIcon={<DownloadIcon />} sx={{ height: 32, textTransform: "none", fontWeight: 700, bgcolor: "#16a34a", "&:hover": { bgcolor: "#14833e" } }}>
                {t("Export")}
              </Button>
              <Button onClick={() => window.print()} variant="outlined" size="small" startIcon={<PrintIcon />} sx={{ height: 32, textTransform: "none", fontWeight: 700, borderColor: vars.border, color: vars.text }}>
                {t("Print")}
              </Button>
            </Box>
          </Box>

          <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative", ...sxPresets.scroller }}>
            <TableScanLine />
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {COLUMNS.map(c => (
                    <TableCell key={c.key} sx={theadCellSx}>{c.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} sx={{ py: 8, textAlign: "center", color: DIM }}>
                      {loading ? t("Loading…") : t("No satellites found")}
                    </TableCell>
                  </TableRow>
                ) : paged.map((r, idx) => (
                  <TableRow key={r.id} className="glass-shine-row" sx={{
                    bgcolor: "transparent",
                    transition: "all 0.25s",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      "& .hover-accent": { opacity: 1, height: "70%" }
                    }
                  }}>
                    <TableCell sx={{ ...bodyCellSx, color: vars.textDim, position: "relative" }}>
                      <Box className="hover-accent" sx={{
                        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                        width: "3px", height: "0%", opacity: 0,
                        background: `linear-gradient(to bottom, transparent, var(--accent), transparent)`,
                        boxShadow: `0 0 10px var(--accent)`,
                        transition: "all 0.3s ease",
                        pointerEvents: "none"
                      }} />
                      {page * rowsPerPage + idx + 1}
                    </TableCell>
                    <TableCell sx={bodyCellSx}>{r.satId}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, color: ACCENT, fontWeight: 700, fontSize: 13 }}>{r.satName}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.norad}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.itu}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.station}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.pol}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.dateTime}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, display: "flex", justifyContent: "center" }}>
                      {canEdit && (
                        <Button size="small" variant="contained" sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25, bgcolor: ACCENT }} onClick={() => { setEditing(r); setModalOpen(true); }}>
                          {t("Edit")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ borderTop: `1px solid ${vars.border}`, position: "relative", zIndex: 1 }}>
            <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} sx={PAGINATION_SX} />
          </Box>
        </Card>
      </Box>

      <UpdateSatelliteModal
        open={modalOpen}
        row={editing ? { id: editing.id, satId: editing.satId, satName: editing.satName, norad: editing.norad, itu: editing.itu, station: editing.station, pol: editing.pol } : null}
        onClose={() => setModalOpen(false)}
        onSave={() => { fetchRows(); setModalOpen(false); }}
        onDelete={() => { fetchRows(); setModalOpen(false); }}
      />

      <style>{`
        @keyframes sc-scan-line { 0% { left: -30%; } 100% { left: 100%; } }
        @keyframes sc-fog-breathe { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
      `}</style>
    </MainLayout>
  );
}
