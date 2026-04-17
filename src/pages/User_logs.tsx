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
} from "@mui/material";



import SearchIcon from "@mui/icons-material/Search";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { useI18n } from "../i18n";

// ✅ use the same helpers as the rest of the app
import { getAuthToken } from "../api/http";

/* ---------- API base (safe fallback) ---------- */
const API_BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "";
const API = API_BASE ? `${API_BASE}/api` : "/api";

/* ---------- Theme tokens ---------- */
const TOK = {
  TEXT: "var(--text)",
  TEXT_DIM: "var(--text-dim)",
  CARD_BG: "var(--bg-card)",
  CONTROL_BG: "var(--bg-ctrl)",
  HOVER: "var(--bg-hover)",
  BORDER_STR: "1px solid var(--border)",
  BORDER_WEAK: "1px solid var(--border-weak)",
  ICON: "var(--text)",
  ACCENT: "var(--accent)",
  SCROLLBAR: "var(--scrollbar)",
};

/* ---------- Shared scroller ---------- */
const SCROLLER_SX = {
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
} as const;

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
  remarks?: any;
};

/* ---------- Utils ---------- */
const fmtIST = (tsUtcSec: number) =>
  new Date(tsUtcSec * 1000).toLocaleString("en-IN");

const formatActionLabel = (action: string) => {
  const a = String(action || "").toUpperCase();

  if (a.includes("LOGIN")) return "User Login";
  if (a.includes("LOGOUT")) return "User Logout";
  if (a.includes("CREATE")) return "Created";
  if (a.includes("UPDATE")) return "Updated";
  if (a.includes("DELETE")) return "Deleted";

  return action || "Unknown";
};

// ✅ convert module/page into Camel Case label
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
    <Box sx={{ width: "100%", minWidth: "100%" }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "80px 200px 160px 160px 290px 100px",
          bgcolor: "var(--logs-thead-bg)",
          borderBottom: TOK.BORDER_STR,
        }}
      >
        {[colLabels.sr, colLabels.dt, colLabels.user, colLabels.module, colLabels.action, colLabels.view].map(
          (label) => (
            <Box
              key={label}
              sx={{
                px: "14px",
                py: "10px",
                fontWeight: 700,
                fontSize: 13,
                color: "var(--logs-thead-text)",
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: "80px",
              }}
            >
              {label}
            </Box>
          )
        )}
      </Box>

      {rows.map((r, idx) => (
        <Box
          key={`${r.sr}-${idx}`}
          sx={{
            display: "grid",
            gridTemplateColumns: "80px 200px 160px 160px 290px 100px",
            borderBottom: TOK.BORDER_STR,
            bgcolor: idx % 2 === 0 ? "var(--row-odd)" : "var(--row-even)",
            "&:hover": { bgcolor: TOK.HOVER },
          }}
        >
          {(["sr", "dateTime", "user", "module", "action"] as const).map((k) => (
            <Box
              key={k}
              sx={{
                px: "14px",
                py: "10px",
                fontSize: 13,
                color: TOK.TEXT_DIM,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: "80px",
              }}
              title={(r as any)[k] ?? ""}
            >
              {(r as any)[k] ?? "—"}
            </Box>
          ))}

          {/* ✅ View Button */}
          <Box sx={{ px: "14px", py: "10px", textAlign: "center" }}>
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
          </Box>

        </Box>
      ))}

      {!rows.length && (
        <Box sx={{ px: 1.25, py: 2, color: TOK.TEXT_DIM, textAlign: "center" }}>
          No logs.
        </Box>
      )}
    </Box>
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
  const [errMsg, setErrMsg] = React.useState<string>(""); // ✅ show 401/403 reasons
  const [openView, setOpenView] = React.useState(false);
  const [selectedRow, setSelectedRow] = React.useState<UIRow | null>(null);

  const handleTabChange = (_e: any, next: TabKey | null) => {
    if (!next) return;

    setTab(next);
    setPage(0);
    setSearch("");

    // ✅ clear current rows so UI doesn't show old tab data
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
        qs.set("type", tab); // ✅ send tab filter to backend

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
          dateTime: r.tsUtc ? fmtIST(r.tsUtc) : "—",
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
            "—",

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





          action: r.action || "—",
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

      // ✅ send tab filter to backend
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
          elevation={0}
          sx={{
            bgcolor: TOK.CARD_BG,
            color: TOK.TEXT,
            border: TOK.BORDER_WEAK,
            borderRadius: 2,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
            backgroundImage: "none",
            "--logs-thead-bg": "#000000",
            "--logs-thead-text": "#ffffff",
            ".theme-dark &": { "--logs-thead-bg": "#000000", "--logs-thead-text": "#ffffff" },
            ".theme-light &": { "--logs-thead-bg": "#464B4E", "--logs-thead-text": "#ffffff" },
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
              borderBottom: TOK.BORDER_WEAK,
              bgcolor: "transparent",
            }}
          >
            {/* ✅ Tabs (LEFT SIDE like Requests page) */}
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

            {/* ✅ Right side controls */}
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: UI.gap }}>
              <TextField
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
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
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
              <Box sx={SCROLLER_SX}>
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
            </Box>
          </Box>

          {/* pagination */}
          <Box sx={{ borderTop: TOK.BORDER_WEAK }}>
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
                px: 1,
                color: TOK.TEXT,
                minHeight: UI.paginationH,
                "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                  fontSize: UI.font, margin: 0, color: TOK.TEXT_DIM,
                },
                "& .MuiTablePagination-input": { fontSize: UI.font, margin: 0, color: TOK.TEXT },
                "& .MuiSelect-select": {
                  py: 0, px: 1, fontSize: UI.font, height: UI.ctrlH - 6,
                  display: "flex", alignItems: "center", bgcolor: TOK.CONTROL_BG, borderRadius: 1,
                },
                "& .MuiIconButton-root": { p: 0.25, color: TOK.TEXT },
                ".MuiSvgIcon-root": { color: TOK.TEXT, fontSize: UI.icon },
              }}
            />
          </Box>
        </Card>
      </Box>

      {/* ✅ View Dialog */}
      <Dialog open={openView} onClose={() => {
        setOpenView(false);
        setSelectedRow(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Log Details
        </DialogTitle>

        <DialogContent dividers>
          {selectedRow ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

              <Box sx={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Date & Time</Typography>
                <Typography sx={{ color: TOK.TEXT_DIM }}>
                  {selectedRow.dateTime}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>User</Typography>
                <Typography sx={{ color: TOK.TEXT_DIM }}>
                  {selectedRow.user}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Module / Page</Typography>
                <Typography sx={{ color: TOK.TEXT_DIM }}>
                  {selectedRow.module}
                </Typography>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>Action</Typography>
                <Typography sx={{ color: TOK.TEXT_DIM }}>
                  {formatActionLabel(selectedRow.action)}
                </Typography>
              </Box>


              <Box sx={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 1 }}>
                <Typography sx={{ fontWeight: 700 }}>ID</Typography>

                <Typography sx={{ color: TOK.TEXT_DIM }}>
                  {(() => {
                    const details = selectedRow.remarks;
                    if (!details) return "—";

                    const oldVal = details?.oldValue || null;
                    const newVal = details?.newValue || null;
                    const payload = details?.payload || null;

                    return (
                      details?.targetLabel ||
                      newVal?.pass_req_no ||
                      oldVal?.pass_req_no ||
                      newVal?.satellite_id ||
                      oldVal?.satellite_id ||
                      newVal?.satellite_name ||
                      oldVal?.satellite_name ||
                      payload?.pass_req_no ||
                      payload?.satellite_id ||
                      payload?.satellite_name ||
                      "—"
                    );
                  })()}
                </Typography>
              </Box>

              {tab === "event" && (
                <Box sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      maxHeight: "60vh",
                      overflowY: "auto",
                      p: 0.5,
                      "&::-webkit-scrollbar": { width: 8 },
                      "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.2)", borderRadius: 8 },
                    }}
                  >
                    {(() => {
                      const details = selectedRow.remarks;
                      if (!details) return <Typography sx={{ color: TOK.TEXT_DIM }}>No details available.</Typography>;

                      const oldVal = details?.oldValue || null;
                      const newVal = details?.newValue || null;
                      const payload = details?.payload || null;

                      const ignoreKeys = new Set([
                        "created_at", "updated_at", "createdAt", "updatedAt", 
                        "created_by", "updated_by", "deleted_by", "createdBy", 
                        "updatedBy", "deletedBy"
                      ]);

                      const formatValue = (val: any) => {
                        if (val == null || val === "") return "—";
                        if (typeof val === "string") {
                          const d = new Date(val);
                          if (!isNaN(d.getTime()) && val.includes("T")) {
                            return d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
                          }
                          return val;
                        }
                        if (typeof val === "number") return String(val);
                        if (typeof val === "boolean") return val ? "Yes" : "No";
                        if (typeof val === "object") return JSON.stringify(val, null, 2);
                        return String(val);
                      };

                      const changes: any[] = [];
                      let snapshot: any = {};
                      const changedKeys = new Set<string>();

                      if (oldVal && newVal && typeof oldVal === "object" && typeof newVal === "object") {
                        const keys = new Set([...Object.keys(oldVal), ...Object.keys(newVal)]);
                        keys.forEach((k) => {
                          if (ignoreKeys.has(k)) return;
                          const ov = oldVal[k];
                          const nv = newVal[k];
                          if (JSON.stringify(ov) !== JSON.stringify(nv)) {
                            changes.push({ field: k, old: ov, new: nv });
                            changedKeys.add(k);
                          }
                        });
                        snapshot = newVal;
                      } else if (!oldVal && newVal && typeof newVal === "object") {
                        snapshot = newVal;
                      } else if (oldVal && !newVal && typeof oldVal === "object") {
                        snapshot = oldVal;
                      } else if (payload && typeof payload === "object") {
                        snapshot = payload;
                      } else if (typeof details === "object") {
                        snapshot = { ...details };
                        delete snapshot.oldValue;
                        delete snapshot.newValue;
                        delete snapshot.payload;
                      }

                      const snapKeys = Object.keys(snapshot).filter(k => !ignoreKeys.has(k) && snapshot[k] !== undefined);

                      return (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          {changes.length > 0 && (
                            <Box>
                              <Typography sx={{ fontWeight: 800, fontSize: 13, color: TOK.TEXT_DIM, textTransform: "uppercase", mb: 1, letterSpacing: "0.5px" }}>
                                WHAT CHANGED
                              </Typography>
                              <Box sx={{ border: "1px solid var(--border-weak)", borderRadius: 1, overflow: "hidden" }}>
                                <Box sx={{ display: "grid", gridTemplateColumns: "minmax(120px, 1fr) 1.5fr 1.5fr", bgcolor: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border-weak)" }}>
                                  {["Field", "Old value", "New value"].map((h, i) => (
                                    <Box key={h} sx={{ p: 1.25, fontSize: 13, fontWeight: 700, color: TOK.TEXT, borderRight: i !== 2 ? "1px solid var(--border-weak)" : "none" }}>{h}</Box>
                                  ))}
                                </Box>
                                {changes.map((c, i) => (
                                  <Box key={c.field} sx={{ display: "grid", gridTemplateColumns: "minmax(120px, 1fr) 1.5fr 1.5fr", borderBottom: i < changes.length - 1 ? "1px solid var(--border-weak)" : "none" }}>
                                    <Box sx={{ p: 1.25, fontSize: 13, color: TOK.TEXT, fontWeight: 700, display: "flex", alignItems: "center", borderRight: "1px solid var(--border-weak)", wordBreak: "break-all" }}>
                                      {c.field}
                                    </Box>
                                    <Box sx={{ p: 1.25, display: "flex", alignItems: "center", borderRight: "1px solid var(--border-weak)" }}>
                                      <Box sx={{ px: 1, py: 0.25, borderRadius: 1, fontSize: 13, fontWeight: 700, 
                                                 bgcolor: (c.old == null || c.old === "") ? "#fee2e2" : "rgba(120,120,120,0.2)", 
                                                 color: (c.old == null || c.old === "") ? "#b91c1c" : TOK.TEXT, wordBreak: "break-all" }}>
                                        {formatValue(c.old)}
                                      </Box>
                                    </Box>
                                    <Box sx={{ p: 1.25, display: "flex", alignItems: "center" }}>
                                      <Box sx={{ px: 1, py: 0.25, borderRadius: 1, fontSize: 13, fontWeight: 700, 
                                                 bgcolor: (c.new == null || c.new === "") ? "#fee2e2" : "#dcfce7", 
                                                 color: (c.new == null || c.new === "") ? "#b91c1c" : "#166534", wordBreak: "break-all" }}>
                                        {formatValue(c.new)}
                                      </Box>
                                    </Box>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          )}

                          {snapKeys.length > 0 && (
                            <Box>
                              <Typography sx={{ fontWeight: 800, fontSize: 13, color: TOK.TEXT_DIM, textTransform: "uppercase", mb: 1, letterSpacing: "0.5px" }}>
                                FULL SNAPSHOT
                              </Typography>
                              <Box sx={{ border: "1px solid var(--border-weak)", borderRadius: 1, overflow: "hidden" }}>
                                {snapKeys.map((k, i) => {
                                  const isChanged = changedKeys.has(k);
                                  return (
                                    <Box key={k} sx={{ 
                                      display: "grid", 
                                      gridTemplateColumns: "30% 70%", 
                                      borderBottom: i < snapKeys.length - 1 ? "1px solid var(--border-weak)" : "none",
                                      bgcolor: isChanged ? "#fdf8e6" : (i % 2 === 0 ? "rgba(0,0,0,0.15)" : "transparent"),
                                    }}>
                                      <Box sx={{ 
                                          p: 1.25, fontSize: 13, fontWeight: isChanged ? 700 : 600, 
                                          borderRight: "1px solid var(--border-weak)", display: "flex", alignItems: "center",
                                          color: isChanged ? "#8c5b16" : TOK.TEXT_DIM, wordBreak: "break-all"
                                      }}>
                                        {k}
                                      </Box>
                                      <Box sx={{ 
                                          p: 1.25, fontSize: 13, fontWeight: isChanged ? 500 : 700, 
                                          color: isChanged ? "#8c5b16" : TOK.TEXT, display: "flex", alignItems: "center", wordBreak: "break-all" 
                                      }}>
                                        {formatValue(snapshot[k])}
                                      </Box>
                                    </Box>
                                  );
                                })}
                              </Box>
                            </Box>
                          )}

                          {changes.length === 0 && snapKeys.length === 0 && (
                             <Typography sx={{ color: TOK.TEXT_DIM }}>No meaningful details found for this operation.</Typography>
                          )}
                        </Box>
                      );
                    })()}
                  </Box>
                </Box>
              )}


            </Box>
          ) : (
            <Typography sx={{ color: TOK.TEXT_DIM }}>
              No log selected.
            </Typography>
          )}
        </DialogContent>



        <DialogActions>
          <Button
            onClick={() => {
              setOpenView(false);
              setSelectedRow(null);
            }}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

    </MainLayout>
  );
}
