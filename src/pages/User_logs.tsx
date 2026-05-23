// src/pages/PortalLogsPage.tsx
import React from "react";

import {
  Box,
  Card,
  Button,
  TextField,
  InputAdornment,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";



import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { useI18n } from "../i18n";

// âœ… use the same helpers as the rest of the app
import { getAuthToken } from "../api/http";

/* ---------- API base (safe fallback) ---------- */
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "";
const API = API_BASE ? `${API_BASE}/api` : "/api";

/* ---------- Theme tokens ---------- */
const TOK = {
  TEXT: "var(--text)",
  TEXT_DIM: "var(--text-dim)",
  TEXT_WEAK: "var(--text-weak)",
  CARD_BG: "var(--bg-card)",
  CONTROL_BG: "var(--bg-ctrl)",
  HOVER: "var(--bg-hover)",
  BORDER_STR: "1px solid var(--border)",
  BORDER_WEAK: "1px solid var(--border-weak)",
  ICON: "var(--text)",
  ACCENT: "var(--accent)",
  SCROLLBAR: "var(--scrollbar)",
};

/* ---------- UI ---------- */
const UI = {
  ctrlH: 30,
  font: 13,
  icon: 16,
  headerPx: 1.25,
  headerPy: 0.6,
  gap: 0.75,
  searchW: 260,
  paginationH: 36,
} as const;

/* compact inputs */
const compactCtrlSx = {
  bgcolor: TOK.CONTROL_BG,
  borderRadius: 1,
  color: TOK.TEXT,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border-weak)" },
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

/* ---------- Types ---------- */
type SimpleRow = {
  tsUtc: number;
  user: string;
  module?: string;
  page?: string;
  action: string;
  remarks?: any;
};

type SimpleResp = {
  page: number;
  pageSize: number;
  total: number;
  data: SimpleRow[];
};

type UIRow = {
  sr: number;
  tsUtc?: number;
  dateTime: string;
  user: string;
  module: string;
  action: string;
  crudType?: string;
  remarks?: any;
};

/* ---------- Utils ---------- */
const fmtIST = (tsUtcSec: number) =>
  new Date(tsUtcSec * 1000).toLocaleString("en-IN");

const formatActionLabel = (action: string) => {
  const a = String(action || "").toUpperCase();
  if (a.includes("LOGIN")) return "User Login";
  if (a.includes("LOGOUT")) return "User Logout";
  if (a.includes("UPLOAD")) return "Uploaded";
  if (a.includes("CREATE")) return "Created";
  if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("PATCH")) return "Updated";
  if (a.includes("DELETE")) return "Deleted";
  if (a.includes("APPROVE")) return "Approved";
  if (a.includes("REJECT")) return "Rejected";
  if (a.includes("ASSIGN")) return "Assigned";
  if (a.includes("REVOKE")) return "Revoked";
  if (a.includes("IMPORT")) return "Imported";
  if (a.includes("CANCEL")) return "Cancelled";
  if (a.includes("ENABLE")) return "Enabled";
  if (a.includes("DISABLE")) return "Disabled";

  // Visibility Schedule specific
  if (a === "VISIBILITY_SCHEDULE_PASS_REQUESTED") return "Pass Requested";
  if (a === "VISIBILITY_SCHEDULE_PASS_CANCELLED") return "Pass Cancelled";
  if (a === "VISIBILITY_SCHEDULE_SUPPORTED") return "Pass Supported";
  if (a === "VISIBILITY_SCHEDULE_POST_PASS_COMPLETED") return "Post Pass Completed";
  if (a === "VISIBILITY_SCHEDULE_POST_PASS_PENDING") return "Post Pass Reset to Pending";
  if (a === "VISIBILITY_DRAFT_PASS_REQUESTED") return "Draft Pass Requested";
  if (a === "VISIBILITY_DRAFT_PASS_CANCELLED") return "Draft Pass Cancelled";
  if (a === "VISIBILITY_DRAFT_UPLOAD") return "Draft Bulk Upload";
  if (a === "VISIBILITY_DRAFT_PUBLISHED") return "Draft Published";

  return action || "Unknown";
};

const actionChip = (action: string) => {
  const a = String(action || "").toUpperCase();
  if (a.includes("CREATE") || a.includes("UPLOAD") || a.includes("IMPORT") || a.includes("SUPPORTED")) return { label: formatActionLabel(action), bg: "#166534", color: "#dcfce7" };
  if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("PATCH") || a.includes("ENABLE") || a.includes("DISABLE")) return { label: formatActionLabel(action), bg: "#92400e", color: "#fef3c7" };
  if (a.includes("DELETE") || a.includes("REJECT") || a.includes("REVOKE") || a.includes("CANCEL")) return { label: formatActionLabel(action), bg: "#991b1b", color: "#fee2e2" };
  if (a.includes("APPROVE") || a.includes("ASSIGN") || a.includes("REQUESTED")) return { label: formatActionLabel(action), bg: "#1e40af", color: "#dbeafe" };
  return { label: formatActionLabel(action), bg: "#374151", color: "#f9fafb" };
};

// âœ… convert module/page into Camel Case label
const toCamelCaseLabel = (val: string) => {
  if (!val) return "";
  if (val === "operation_supporter") return "TTC Service Provider";
  if (val === "operation_requester") return "Pass Service Provider";


  let s = String(val).trim();

  if (s.startsWith("/")) s = s.slice(1);

  if (!s) return "";

  const parts = s.split(/[\/_\-]+/).filter(Boolean);

  return parts
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
};

/* ---------- Table style tokens (match pass list) ---------- */
const theadCellSx = {
  px: "14px",
  py: "10px",
  fontWeight: 800,
  fontSize: 9.5,
  textAlign: "center" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "var(--thead-text)",
  bgcolor: "var(--bg-thead)",
  borderBottom: TOK.BORDER_STR,
  whiteSpace: "nowrap" as const,
};

const bodyCellSx = {
  padding: "10px 14px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
  textAlign: "center" as const,
  fontSize: 12,
  color: TOK.TEXT_DIM,
  borderBottom: TOK.BORDER_WEAK,
};

/* ---------- Themed table ---------- */
function ThemedScrollTable({
  rows,
  colLabels,
  onView,
}: {
  rows: UIRow[];
  colLabels: { sr: string; dt: string; user: string; module: string; action: string; view: string };
  onView: (row: UIRow) => void;
}) {
  return (
    <TableContainer sx={{
      flex: 1, minHeight: 0,
      overflow: "auto",
      scrollbarWidth: "thin",
      scrollbarColor: `${TOK.SCROLLBAR} transparent`,
      "&::-webkit-scrollbar": { width: 8, height: 8 },
      "&::-webkit-scrollbar-thumb": { background: "var(--scrollbar)", borderRadius: 8 },
      "&::-webkit-scrollbar-thumb:hover": { background: "color-mix(in srgb, var(--scrollbar) 80%, #888)" },
      "&::-webkit-scrollbar-track": { background: "transparent" },
      position: "relative",
    }}>
      {/* Table Surface Scan Line */}
      <Box className="table-surface-scan" />
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {[colLabels.sr, colLabels.dt, colLabels.user, colLabels.module, colLabels.action, colLabels.view].map((label) => (
              <TableCell key={label} sx={theadCellSx}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((r) => (
            <TableRow
              key={r.sr}
              className="glass-shine-row"
              sx={{
                bgcolor: "transparent",
                transition: "all 0.25s",
                cursor: "default",
                "&:hover": {
                  bgcolor: TOK.HOVER,
                  "& .hover-accent": { opacity: 1, height: "70%" },
                },
              }}
            >
              {/* Accent bar on hover */}
              <TableCell sx={{ ...bodyCellSx, position: "relative", width: 80 }}>
                <Box
                  className="hover-accent"
                  sx={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: "3px", height: "0%", opacity: 0,
                    background: "linear-gradient(to bottom, transparent, var(--accent), transparent)",
                    boxShadow: "0 0 10px var(--accent)",
                    transition: "all 0.3s ease",
                    pointerEvents: "none",
                  }}
                />
                {r.sr}
              </TableCell>

              <TableCell sx={bodyCellSx} title={r.dateTime}>{r.dateTime ?? "—"}</TableCell>
              <TableCell sx={{ ...bodyCellSx, fontWeight: 700, color: TOK.TEXT }} title={r.user}>{r.user ?? "—"}</TableCell>
              <TableCell sx={bodyCellSx} title={r.module}>{r.module ?? "—"}</TableCell>

              {/* Action chip */}
              <TableCell sx={{ ...bodyCellSx, overflow: "visible" }}>
                {(() => {
                  const chip = actionChip(r.action);
                  return (
                    <Box sx={{
                      display: "inline-flex",
                      px: 1.25, py: 0.3, borderRadius: 1,
                      fontSize: 11, fontWeight: 700,
                      bgcolor: chip.bg, color: chip.color,
                      whiteSpace: "nowrap", maxWidth: 240,
                      overflow: "hidden", textOverflow: "ellipsis",
                    }} title={chip.label}>
                      {chip.label}
                    </Box>
                  );
                })()}
              </TableCell>

              {/* View button */}
              <TableCell sx={{ ...bodyCellSx, overflow: "visible" }}>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    fontSize: 12,
                    borderColor: "var(--border)",
                    color: TOK.TEXT,
                    height: 26,
                    minHeight: 26,
                    "&:hover": { bgcolor: TOK.HOVER, borderColor: TOK.ACCENT },
                  }}
                  onClick={() => onView(r)}
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {!rows.length && (
            <TableRow>
              <TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: TOK.TEXT_DIM, borderBottom: "none" }}>
                No logs.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* ---------- Page ---------- */
export default function PortalLogsPage() {
  const { t } = useI18n();

  type TabKey = "access" | "event";
  const [tab, setTab] = React.useState<TabKey>("access");

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<UIRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string>(""); // âœ… show 401/403 reasons
  const [openView, setOpenView] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<UIRow | null>(null);

  const handleTabChange = (_e: any, next: TabKey | null) => {
    if (!next) return;

    setTab(next);
    setPage(0);
    setSearch("");

    // âœ… clear current rows so UI doesn't show old tab data
    setRows([]);
    setTotal(0);
  };


  const COL_LABELS = React.useMemo(
    () => ({
      sr: t("Sr No"),
      dt: t("Date & Time"),
      user: t("User"),
      module: t("Module"),
      action: t("Action"),
      view: t("View"),
    }),
    [t]
  );

  React.useEffect(() => {
    const ac = new AbortController();

    (async () => {
      setLoading(true);
      setErrMsg("");
      try {
        const qs = new URLSearchParams();
        qs.set("page", String(page + 1));
        qs.set("pageSize", String(rowsPerPage));
        if (search.trim()) qs.set("q", search.trim());

        const token = getAuthToken();
        qs.set("type", tab); // âœ… send tab filter to backend

        const res = await fetch(`${API}/audit-logs/simple?${qs.toString()}&_=${Date.now()}`, {

          headers: token
            ? {
              Authorization: `Bearer ${token}`,
              "x-module-name": "Audit Logs",
              "x-page-name": "Portal Logs Page",
            }
            : undefined,
          signal: ac.signal,
        });

        if (!res.ok) {
          if (res.status === 401) setErrMsg("Unauthorized. Please sign in again.");
          if (res.status === 403) setErrMsg("Admin access required to view logs.");
          const t = await res.text().catch(() => "");
          throw new Error(t || `HTTP ${res.status}`);
        }

        const j: SimpleResp = await res.json();

        const start = page * rowsPerPage;
        const mapped: UIRow[] = (j.data || []).map((r, i) => ({
          sr: start + i + 1,
          tsUtc: r.tsUtc,
          dateTime: r.tsUtc ? fmtIST(r.tsUtc) : "â€”",
          user:
            r.user ||
            (typeof r.remarks === "object" ? r.remarks?.username : null) ||
            (typeof r.remarks === "string"
              ? (() => {
                try {
                  return JSON.parse(r.remarks)?.username;
                } catch {
                  return null;
                }
              })()
              : null) ||
            "â€”",

          module: (() => {
            let m =
              r.module ||
              (typeof r.remarks === "object" ? r.remarks?.module : null) ||
              (typeof r.remarks === "object" ? r.remarks?.page : null) ||
              (typeof r.remarks === "object" ? r.remarks?.route : null) ||
              (typeof r.remarks === "object" ? r.remarks?.url : null) ||
              null;

            if (!m && typeof r.remarks === "string") {
              try {
                const parsed = JSON.parse(r.remarks);
                m = parsed?.module || parsed?.page || parsed?.route || parsed?.url || null;
              } catch {
                m = null;
              }
            }

            m = m || r.page || (r as any).page || null;

            if (!m) return "Unknown";

            return toCamelCaseLabel(String(m));
          })(),





          action: r.action || "â€”",
          crudType: (() => {
            const a = String(r.action || "").toUpperCase();
            if (a.includes("UPDATE") || a.includes("EDIT") || a.includes("PATCH")) return "update";
            if (a.includes("DELETE") || a.includes("REVOKE")) return "delete";
            if (a.includes("CREATE") || a.includes("UPLOAD") || a.includes("IMPORT")) return "create";
            return "other";
          })(),
          remarks: (() => {
            if (!r.remarks) return null;

            try {
              return typeof r.remarks === "string" ? JSON.parse(r.remarks) : r.remarks;
            } catch {
              return r.remarks;
            }
          })(),
        }));


        setRows(mapped);
        setTotal(j.total || 0);


      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error("Failed to load logs (simple):", e);
          setRows([]);
          setTotal(0);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [page, rowsPerPage, search, tab]);




  const doExport = React.useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set("q", search.trim());

      // âœ… send tab filter to backend
      qs.set("type", tab);
      const token = getAuthToken();
      const resp = await fetch(`${API}/audit-logs/simple/export?${qs.toString()}&_=${Date.now()}`, {
        headers: token
          ? {
            Authorization: `Bearer ${token}`,
            "x-module-name": "Audit Logs",
            "x-page-name": "Portal Logs Page",
          }
          : undefined,
      });
      if (!resp.ok) {
        const msg = await resp.text().catch(() => "");
        alert(`${t("Export failed")} (${resp.status}): ${msg || resp.statusText}`);
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
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export error", e);
      alert(t("Export failed"));
    }
  }, [search, tab, t]);

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{
            position: 'relative',
            overflow: 'hidden',
            bgcolor: TOK.CARD_BG,
            backdropFilter: "blur(20px)",
            border: TOK.BORDER_STR,
            borderRadius: '20px',
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
            boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
            backgroundImage: "none",
            "--logs-thead-bg": "transparent",
            "--logs-thead-text": "var(--thead-text)",
            ".theme-dark &": { "--logs-thead-bg": "transparent", "--logs-thead-text": "var(--thead-text)" },
            ".theme-light &": { "--logs-thead-bg": "transparent", "--logs-thead-text": "var(--thead-text)" },
          }}
        >
          {/* Ambient Volumetric Lighting */}
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
          {/* header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: UI.gap,
              px: UI.headerPx,
              py: UI.headerPy,
              borderBottom: TOK.BORDER_WEAK,
              bgcolor: "transparent",
            }}
          >
            {/* âœ… Tabs (LEFT SIDE like Requests page) */}
            <ToggleButtonGroup
              value={tab}
              exclusive
              onChange={handleTabChange}
              sx={{
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  color: TOK.TEXT,
                  borderColor: TOK.BORDER_WEAK,
                  px: 1.25,
                  py: 0.5,
                  backgroundColor: "transparent",
                  "&:hover": { bgcolor: TOK.HOVER },
                  "&.Mui-selected": {
                    bgcolor: "rgba(124,87,242,0.18)",
                    color: "#fff",
                    borderColor: "rgba(124,87,242,0.60)",
                    boxShadow: `0 0 0 1px ${TOK.ACCENT} inset`,
                    "&:hover": { bgcolor: "rgba(124,87,242,0.22)" },
                  },
                },
                ".theme-light & .MuiToggleButton-root": { color: "#111 !important" },
                ".theme-light & .MuiToggleButton-root.Mui-selected": { color: "#111 !important" },
              }}
            >
              <ToggleButton value="access">{t("Access Logs")}</ToggleButton>
              <ToggleButton value="event">{t("Event Logs")}</ToggleButton>
            </ToggleButtonGroup>

            {/* âœ… Right side controls */}
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: UI.gap }}>
              <TextField
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder={loading ? t("Loadingâ€¦") : t("Searchâ€¦")}
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
                startIcon={<FileDownloadOutlinedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 12.5,
                  bgcolor: "#16a34a",
                  color: "#fff",
                  height: UI.ctrlH,
                  minHeight: UI.ctrlH,
                  lineHeight: `${UI.ctrlH}px`,
                  borderRadius: 1,
                  "& .MuiSvgIcon-root": { color: "#fff" },
                  "&:hover": { bgcolor: "#14833e", color: "#fff" },
                }}
              >
                {t("Export")}
              </Button>
            </Box>

          </Box>

          {/* body */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            {loading ? (
              <Box sx={{ p: 2, color: TOK.TEXT_DIM }}>{t("Loading…")}</Box>
            ) : errMsg ? (
              <Box sx={{ p: 2, color: "#ef4444" }}>{errMsg}</Box>
            ) : (
              <ThemedScrollTable
                rows={rows}
                colLabels={COL_LABELS}
                onView={(row) => {
                  setSelectedRow(row);
                  setOpenView(true);
                }}
              />
            )}
          </Box>

          {/* pagination */}
          <Box sx={{ borderTop: TOK.BORDER_STR, bgcolor: TOK.CARD_BG }}>
            <TablePagination
              component="div"
              count={total}


              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 50000, 100000]} // ✅ more options
              labelRowsPerPage={t("Rows per page:")}
              sx={{
                px: 1, color: TOK.TEXT,
                "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0, pl: 1, pr: 1, gap: 0.5 },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 12, margin: 0, color: TOK.TEXT_DIM, fontWeight: 600 },
                "& .MuiTablePagination-input": { fontSize: 12, margin: 0, color: TOK.TEXT },
                "& .MuiTablePagination-select": { bgcolor: TOK.CONTROL_BG, borderRadius: "6px", fontSize: 12, fontWeight: 700, px: 1, mr: 2, display: 'flex', alignItems: 'center', height: 28 },
                "& .MuiIconButton-root": { color: TOK.TEXT, p: 0.5, "&:hover": { bgcolor: TOK.HOVER }, "&.Mui-disabled": { color: TOK.TEXT_WEAK } },
                ".MuiSvgIcon-root": { fontSize: 20 },
              }}
            />
          </Box>
        </Card>
      </Box>

      {/* ✅ View Dialog — rich structured view */}
      <Dialog
        open={openView}
        onClose={() => { setOpenView(false); setSelectedRow(null); }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
          {selectedRow && (() => {
            const chip = actionChip(selectedRow.action);
            return (
              <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: 1, fontSize: 12, fontWeight: 700, bgcolor: chip.bg, color: chip.color }}>
                {chip.label}
              </Box>
            );
          })()}
          Log Entry Details
        </DialogTitle>

        <DialogContent dividers>
          {selectedRow ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

              {/* ── Meta info grid ── */}
              {([
                ["Date & Time", selectedRow.dateTime],
                ["User", selectedRow.user],
                ["Module / Page", selectedRow.module],
                ["Action", formatActionLabel(selectedRow.action)],
              ] as [string, string][]).map(([label, val]) => (
                <Box key={label} sx={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{label}</Typography>
                  <Typography sx={{ color: TOK.TEXT_DIM, fontSize: 13 }}>{val}</Typography>
                </Box>
              ))}

              {/* ── Record / Document name (if present) ── */}
              {selectedRow.remarks?.targetLabel && (
                <Box sx={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Record / File</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#60a5fa" }}>
                    {selectedRow.remarks.targetLabel}
                  </Typography>
                </Box>
              )}

              {/* ── Structured details (works for both Access and Event tabs) ── */}
              {(() => {
                const details = selectedRow.remarks;

                // ── helpers ──────────────────────────────────────────────────
                const ignoreKeys = new Set([
                  "created_at", "updated_at", "createdAt", "updatedAt",
                  "created_by", "updated_by", "deleted_by",
                  "createdBy", "updatedBy", "deletedBy",
                ]);

                const formatValue = (val: any): string => {
                  if (val == null || val === "") return "—";
                  if (typeof val === "string") {
                    const d = new Date(val);
                    if (!isNaN(d.getTime()) && val.includes("T"))
                      return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
                    return val;
                  }
                  if (typeof val === "boolean") return val ? "Yes" : "No";
                  if (typeof val === "object") return JSON.stringify(val, null, 2);
                  return String(val);
                };

                // ── no remarks at all ─────────────────────────────────────────
                if (!details) {
                  return (
                    <Typography sx={{ color: TOK.TEXT_DIM, mt: 1, fontSize: 13 }}>
                      No additional details available.
                    </Typography>
                  );
                }

                // ── if remarks is a plain string (not JSON) ───────────────────
                if (typeof details === "string") {
                  return (
                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 11, color: TOK.TEXT_DIM, textTransform: "uppercase", mb: 1, letterSpacing: "1.5px" }}>
                        Raw Data / Remarks
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5, borderRadius: 1, fontSize: 12,
                          bgcolor: "rgba(0,0,0,0.35)", color: "#a3e635",
                          border: "1px solid var(--border-weak)",
                          overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
                          maxHeight: 320,
                        }}
                      >
                        {details}
                      </Box>
                    </Box>
                  );
                }

                // ── structured object path ────────────────────────────────────
                const oldVal = details?.oldValue || null;
                const newVal = details?.newValue || null;
                const payload = details?.payload || null;
                const targetLabel = details?.targetLabel || null;

                const changes: { field: string; old: any; new: any }[] = [];
                let snapshot: Record<string, any> = {};
                const changedKeys = new Set<string>();

                if (oldVal && newVal && typeof oldVal === "object" && typeof newVal === "object") {
                  const keys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)]);
                  keys.forEach(k => {
                    if (ignoreKeys.has(k)) return;
                    if (JSON.stringify(oldVal[k]) !== JSON.stringify(newVal[k])) {
                      changes.push({ field: k, old: oldVal[k], new: newVal[k] });
                      changedKeys.add(k);
                    }
                  });
                  snapshot = { ...newVal };
                } else if (!oldVal && newVal && typeof newVal === "object") {
                  Object.keys(newVal).forEach(k => {
                    if (ignoreKeys.has(k)) return;
                    snapshot[k] = newVal[k];
                  });
                } else if (oldVal && !newVal && typeof oldVal === "object") {
                  Object.keys(oldVal).forEach(k => {
                    if (ignoreKeys.has(k)) return;
                    snapshot[k] = oldVal[k];
                  });
                } else if (payload && typeof payload === "object") {
                  snapshot = { ...payload };
                } else if (typeof details === "object") {
                  // fallback: show the whole remarks object as snapshot
                  snapshot = { ...details };
                }

                // strip internal meta keys from snapshot
                delete snapshot.payload;
                delete snapshot.targetLabel;
                delete snapshot.oldValue;
                delete snapshot.newValue;

                const snapKeys = Object.keys(snapshot).filter(
                  k => !ignoreKeys.has(k) && snapshot[k] !== undefined
                );

                // if nothing structured exists, show raw JSON
                if (changes.length === 0 && snapKeys.length === 0 && !targetLabel) {
                  return (
                    <Box sx={{ mt: 1 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: 11, color: TOK.TEXT_DIM, textTransform: "uppercase", mb: 1, letterSpacing: "1.5px" }}>
                        Raw Data / Remarks
                      </Typography>
                      <Box
                        component="pre"
                        sx={{
                          p: 1.5, borderRadius: 1, fontSize: 12,
                          bgcolor: "rgba(0,0,0,0.35)", color: "#a3e635",
                          border: "1px solid var(--border-weak)",
                          overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all",
                          maxHeight: 320,
                        }}
                      >
                        {JSON.stringify(details, null, 2)}
                      </Box>
                    </Box>
                  );
                }

                return (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>

                    {/* TARGET ENTITY */}
                    {targetLabel && (
                      <Box sx={{ p: 1.5, bgcolor: "rgba(124,87,242,0.1)", border: "1px solid rgba(124,87,242,0.3)", borderRadius: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 11, color: TOK.ACCENT, textTransform: "uppercase", mb: 0.5, letterSpacing: "1px" }}>
                          Target Entity
                        </Typography>
                        <Typography sx={{ fontSize: 15, fontWeight: 700, color: TOK.TEXT }}>
                          {targetLabel}
                        </Typography>
                      </Box>
                    )}

                    {/* WHAT CHANGED */}
                    {changes.length > 0 && (
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 11, color: TOK.TEXT_DIM, textTransform: "uppercase", mb: 1, letterSpacing: "1.5px" }}>
                          What Changed
                        </Typography>
                        <Box sx={{ border: "1px solid var(--border-weak)", borderRadius: 1, overflow: "hidden" }}>
                          <Box sx={{ display: "grid", gridTemplateColumns: "minmax(100px,1fr) 1.5fr 1.5fr", bgcolor: "rgba(0,0,0,0.25)", borderBottom: "1px solid var(--border-weak)" }}>
                            {["Field", "Old Value", "New Value"].map((h, i) => (
                              <Box key={h} sx={{ p: 1.25, fontSize: 12, fontWeight: 700, color: TOK.TEXT, borderRight: i !== 2 ? "1px solid var(--border-weak)" : "none" }}>{h}</Box>
                            ))}
                          </Box>
                          {changes.map((c, i) => (
                            <Box key={c.field} sx={{ display: "grid", gridTemplateColumns: "minmax(100px,1fr) 1.5fr 1.5fr", borderBottom: i < changes.length - 1 ? "1px solid var(--border-weak)" : "none" }}>
                              <Box sx={{ p: 1.25, fontSize: 13, fontWeight: 700, color: TOK.TEXT, borderRight: "1px solid var(--border-weak)", wordBreak: "break-all", display: "flex", alignItems: "center" }}>
                                {c.field}
                              </Box>
                              <Box sx={{ p: 1.25, borderRight: "1px solid var(--border-weak)", display: "flex", alignItems: "center" }}>
                                <Box sx={{ px: 1, py: 0.4, borderRadius: 1, fontSize: 12, fontWeight: 600, bgcolor: "rgba(194,65,12,0.2)", color: "#fb923c", border: "1px solid rgba(194,65,12,0.45)", wordBreak: "break-all" }}>
                                  {formatValue(c.old)}
                                </Box>
                              </Box>
                              <Box sx={{ p: 1.25, display: "flex", alignItems: "center" }}>
                                <Box sx={{ px: 1, py: 0.4, borderRadius: 1, fontSize: 12, fontWeight: 600, bgcolor: "rgba(21,128,61,0.2)", color: "#4ade80", border: "1px solid rgba(21,128,61,0.45)", wordBreak: "break-all" }}>
                                  {formatValue(c.new)}
                                </Box>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* FULL SNAPSHOT */}
                    {snapKeys.length > 0 && (
                      <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: 11, color: TOK.TEXT_DIM, textTransform: "uppercase", mb: 1, letterSpacing: "1.5px" }}>
                          Full Snapshot
                        </Typography>
                        <Box sx={{ border: "1px solid var(--border-weak)", borderRadius: 1, overflow: "hidden" }}>
                          {snapKeys.map((k, i) => {
                            const isChanged = changedKeys.has(k);
                            return (
                              <Box key={k} sx={{ display: "grid", gridTemplateColumns: "35% 65%", borderBottom: i < snapKeys.length - 1 ? "1px solid var(--border-weak)" : "none", bgcolor: isChanged ? "rgba(124,45,18,0.12)" : (i % 2 === 0 ? "rgba(0,0,0,0.12)" : "transparent") }}>
                                <Box sx={{ p: 1.25, fontSize: 12, fontWeight: 600, borderRight: "1px solid var(--border-weak)", display: "flex", alignItems: "center", color: isChanged ? "#fb923c" : TOK.TEXT_DIM, wordBreak: "break-all" }}>
                                  {k}
                                </Box>
                                <Box sx={{ p: 1.25, fontSize: 12, fontWeight: isChanged ? 600 : 400, color: isChanged ? "#4ade80" : TOK.TEXT, display: "flex", alignItems: "center", wordBreak: "break-all" }}>
                                  {formatValue(snapshot[k])}
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}

                  </Box>
                );
              })()}

            </Box>
          ) : (
            <Typography sx={{ color: TOK.TEXT_DIM }}>No log selected.</Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => { setOpenView(false); setSelectedRow(null); }} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </MainLayout>
  );
}
