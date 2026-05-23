// src/pages/List_pages/Licenses_list.tsx
import React from "react";
import {
  Box, Button, TextField, InputAdornment, TablePagination,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import UpdateLicenseModal, { type LicenseLike } from "../../components/Models/UpdateLicenseModal";
import { useActionAccess } from "../../auth/useActionAccess";
import { useI18n } from "../../i18n";
import api from "../../api/http";
import { vars, sxPresets } from "../../ui/toast/themeBridge";
import { TableScanLine } from "../../ui/styles";

/* ─────────────────────── style constants ─────────────────────── */
const theadCellSx = {
  px: 1, py: 1.5,
  fontWeight: 800, fontSize: 9.5,
  textAlign: "center" as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.12em', color: "var(--thead-text)",
  bgcolor: vars.bgThead, borderBottom: `1px solid ${vars.border}`,
  whiteSpace: "nowrap" as const
};

const bodyCellSx = {
  padding: "12px 14px", overflow: "hidden", textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const, minWidth: "80px", textAlign: "center" as const,
  fontSize: 12, borderBottom: `1px solid ${vars.borderWeak}`, color: vars.text
};

const PAGINATION_SX = {
  px: 1,
  bgcolor: vars.bgCard,
  color: vars.text,
  borderTop: `1px solid ${vars.border}`,
  "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0, pl: 1, pr: 1, gap: 0.5 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 12, m: 0, color: vars.textDim, fontWeight: 600 },
  "& .MuiTablePagination-input": { fontSize: 12, m: 0, color: vars.text },
  "& .MuiTablePagination-select": { bgcolor: vars.bgCtrl, borderRadius: "6px", fontSize: 12, fontWeight: 700, px: 1, mr: 2, display: 'flex', alignItems: 'center', height: 28 },
  "& .MuiIconButton-root": { color: vars.text, p: 0.5, "&:hover": { bgcolor: vars.bgHover }, "&.Mui-disabled": { color: vars.textWeak } },
  ".MuiSvgIcon-root": { fontSize: 20 },
} as const;

const ctrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "32px",
    fontSize: 12,
    color: vars.text,
    backgroundColor: vars.bgCtrl,
    borderRadius: "8px",
    "& fieldset": { border: 'none' },
    "&:hover fieldset": { border: 'none' },
    "&.Mui-focused fieldset": { border: 'none' },
  },
  "& .MuiInputBase-input": { padding: "0 10px 0 10px", fontSize: 12, color: vars.text },
  "& .MuiInputBase-input::placeholder": { color: vars.textWeak, opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: 18, color: vars.textDim },
} as const;

/* ---------- Types ---------- */
type Row = LicenseLike;

const getLicenseStatusStyle = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("approved") || s.includes("done")) return { bgcolor: "rgba(0, 255, 157, 0.1)", color: "#00FF9D" };
  if (s.includes("pending") || s.includes("triaged")) return { bgcolor: "rgba(0, 217, 255, 0.1)", color: "#00D9FF" };
  if (s.includes("rejected") || s.includes("failed")) return { bgcolor: "rgba(255, 46, 99, 0.1)", color: "#FF2E63" };
  return { bgcolor: "rgba(255, 255, 255, 0.08)", color: "#E0E0E0" };
};

/* ---------- Page ---------- */
export default function LicensesList() {
  const { t } = useI18n();
  const { hasWriteAccess } = useActionAccess();
  const canEdit = hasWriteAccess("licenses");

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [editing, setEditing] = React.useState<Row | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const fetchRows = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<any>(`/api/licenses/export?format=json&shape=wide&_=${Date.now()}`);
      const arr = Array.isArray(res) ? res : res?.data || [];
      const mapped: Row[] = arr.map((x: any, i: number) => {
        const rawBands = x.bands || "";
        const parts = rawBands.split("||").map((c: string) => c.split("|").map((s: string) => s.trim()));
        return {
          id: Number(x.id),
          sr: i + 1,
          reqNo: x.license_req_no,
          satName: x.satellite_name,
          station: x.station_name,
          applied: x.applied_date || "",
          receipt: x.receipt_date || "",
          validity: x.validity_expiry || "",
          band: parts.map((p: any) => p[0]).filter(Boolean).join(", "),
          downlink: parts.map((p: any) => p[2]).filter(Boolean).join(", "),
          uplink: parts.map((p: any) => p[1]).filter(Boolean).join(", "),
          status: x.status || "",
          addedBy: x.added_by || "—",
          dateTime: x.updated_at ? new Date(x.updated_at).toLocaleString("en-IN") : "—",
          remarks: x.remarks || "—",
        } as Row;
      });
      setRows(mapped);
    } catch (e) { console.error(e); setRows([]); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchRows(); }, [fetchRows]);

  const filtered = rows.filter((r) => [r.satName, r.station, r.status, r.addedBy, r.remarks].join(" ").toLowerCase().includes(search.toLowerCase()));
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const doExport = () => {
    const cols = COLUMNS.filter(c => c.key !== "action");
    const header = cols.map(c => c.label).join(",");
    const csvRows = filtered.map((r, idx) => {
      return [
        page * rowsPerPage + idx + 1,
        `"${r.satName}"`,
        `"${r.station}"`,
        `"${r.applied}"`,
        `"${r.receipt}"`,
        `"${r.validity}"`,
        `"${r.band}"`,
        `"${r.downlink}"`,
        `"${r.uplink}"`,
        `"${r.status}"`,
        `"${r.addedBy}"`,
        `"${r.dateTime}"`,
        `"${r.remarks}"`
      ].join(",");
    });
    const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "licenses.csv";
    a.click();
  };

  const COLUMNS = [
    { key: "sr", label: t("No"), width: 60 },
    { key: "satName", label: t("Name"), width: 180 },
    { key: "station", label: t("Station"), width: 160 },
    { key: "applied", label: t("Applied"), width: 120 },
    { key: "receipt", label: t("Receipt Date"), width: 120 },
    { key: "validity", label: t("Expiry"), width: 120 },
    { key: "band", label: t("Band"), width: 220 },
    { key: "downlink", label: t("Downlink"), width: 100 },
    { key: "uplink", label: t("Uplink"), width: 100 },
    { key: "status", label: t("Status"), width: 160 },
    { key: "addedBy", label: t("Added By"), width: 140 },
    { key: "dateTime", label: t("Date/Time"), width: 200 },
    { key: "remarks", label: t("Remarks"), width: 200 },
    { key: "action", label: t("Action"), width: 120, isFlex: true },
  ];

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Box sx={{
          height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
          position: "relative",
          bgcolor: vars.bgCard,
          border: `1px solid ${vars.border}`,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "none",
        }}>
          {/* Effects */}
          <Box sx={{
            position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%',
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08), transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
          }} />
          <Box sx={{
            position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%',
            background: 'radial-gradient(circle, rgba(124, 110, 245, 0.08), transparent 70%)',
            filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
          }} />
          <Box className="table-surface-scan" />

          {/* Toolbar */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: `1px solid ${vars.border}`, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#0EA5E9", boxShadow: `0 0 10px #0EA5E9` }} />
              <Box sx={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: '0.02em' }}>{t("License List")}</Box>
              <Box sx={{ ml: 1, px: 1, py: 0.2, borderRadius: "6px", bgcolor: `rgba(14, 165, 233, 0.1)`, color: "#0EA5E9", border: `1px solid rgba(14, 165, 233, 0.2)`, fontSize: 11, fontWeight: 700 }}>
                {filtered.length}
              </Box>
            </Box>

            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <TextField
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t("Search…")} size="small" sx={{ width: 220, ...ctrlSx }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15 }} /></InputAdornment> }}
              />
              <Button onClick={doExport} variant="contained" size="small" sx={{ height: 32, textTransform: "none", fontWeight: 700, bgcolor: "#16a34a", "&:hover": { bgcolor: "#14833e" } }}>
                {t("Export")}
              </Button>
              <Button onClick={() => window.print()} variant="outlined" size="small" startIcon={<PrintIcon />} sx={{ height: 32, textTransform: "none", fontWeight: 700, borderColor: vars.border, color: vars.text }}>
                {t("Print")}
              </Button>
            </Box>
          </Box>

          <TableContainer sx={{ flex: 1, minHeight: 0, overflow: "auto", ...sxPresets.scroller, position: "relative", zIndex: 1 }}>
            <TableScanLine />
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {COLUMNS.map(c => (
                    <TableCell key={c.key} sx={{ ...theadCellSx, minWidth: c.width }}>{c.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} sx={{ py: 8, textAlign: "center", color: vars.textDim }}>
                      {loading ? t("Loading…") : t("No licenses found")}
                    </TableCell>
                  </TableRow>
                ) : paged.map((r, idx) => (
                  <TableRow key={r.id} className="glass-shine-row" sx={{
                    bgcolor: "transparent",
                    transition: "all 0.25s",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: vars.bgHover,
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
                    <TableCell sx={{ ...bodyCellSx, fontWeight: 700, fontSize: 13, color: vars.accent }}>{r.satName}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.station}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.applied}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.receipt}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.validity}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.band}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.downlink}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.uplink}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, overflow: "visible" }}>
                      {(() => {
                        const s = getLicenseStatusStyle(String(r.status));
                        return (
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.8, px: 1.5, py: 0.4, borderRadius: "6px", bgcolor: s.bgcolor, color: s.color, fontSize: 11, fontWeight: 700, border: `1px solid ${s.color}20` }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                            {r.status.toUpperCase()}
                          </Box>
                        );
                      })()}
                    </TableCell>
                    <TableCell sx={{ ...bodyCellSx, fontWeight: 700 }}>{r.addedBy}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, color: vars.textDim }}>{r.dateTime}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, color: vars.textDim }} title={r.remarks}>{r.remarks}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, display: "flex", justifyContent: "center" }}>
                      {canEdit && (
                        <Button size="small" variant="contained" sx={{ textTransform: "none", fontWeight: 700, fontSize: 11, height: 26, px: 2, borderRadius: '6px', bgcolor: 'rgba(14, 165, 233, 0.1)', color: '#0EA5E9', border: '1px solid rgba(14, 165, 233, 0.3)', "&:hover": { bgcolor: 'rgba(14, 165, 233, 0.2)', borderColor: '#0EA5E9' } }} onClick={() => { setEditing(r); setModalOpen(true); }}>{t("Edit")}</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={PAGINATION_SX}>
            <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} sx={PAGINATION_SX} />
          </Box>
        </Box>
      </Box>

      <UpdateLicenseModal open={modalOpen} row={editing} onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); fetchRows(); }} onDeleted={() => { setModalOpen(false); fetchRows(); }} />

      <style>{`
        @keyframes sc-scan-line { 0% { left: -30%; } 100% { left: 100%; } }
        @keyframes sc-fog-breathe { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
      `}</style>
    </MainLayout>
  );
}
