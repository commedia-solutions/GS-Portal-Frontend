// src/pages/PortalLogsPage.tsx
import React from "react";
import {
  Box, Card, Button, TextField, InputAdornment, TablePagination,
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
  module: string;
  action: string;
};

type SimpleResp = {
  page: number;
  pageSize: number;
  total: number;
  data: SimpleRow[];
};

type UIRow = {
  sr: number;
  dateTime: string;
  user: string;
  module: string;
  action: string;
};

/* ---------- Utils ---------- */
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
    .replace(",", "");

/* ---------- Themed table ---------- */
function ThemedScrollTable({
  rows,
  colLabels,
}: {
  rows: UIRow[];
  colLabels: { sr: string; dt: string; user: string; module: string; action: string };
}) {
  return (
    <Box sx={{ width: "100%", minWidth: "100%" }}>
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(5, 1fr)`,
          bgcolor: "var(--logs-thead-bg)",
          borderBottom: TOK.BORDER_STR,
        }}
      >
        {[colLabels.sr, colLabels.dt, colLabels.user, colLabels.module, colLabels.action].map(
          (label) => (
            <Box
              key={label}
              sx={{
                px: 1.25,
                py: 1,
                fontWeight: 700,
                fontSize: 13,
                color: "var(--logs-thead-text)",
                textAlign: "center",
                whiteSpace: "nowrap",
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
            gridTemplateColumns: `repeat(5, 1fr)`,
            borderBottom: TOK.BORDER_STR,
            bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
            "&:hover": { bgcolor: TOK.HOVER },
          }}
        >
          {(["sr", "dateTime", "user", "module", "action"] as const).map((k) => (
            <Box
              key={k}
              sx={{
                px: 1.25,
                py: 1,
                fontSize: 13,
                color: TOK.TEXT_DIM,
                textAlign: "center",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={(r as any)[k] ?? ""}
            >
              {(r as any)[k] ?? "—"}
            </Box>
          ))}
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

  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<UIRow[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [errMsg, setErrMsg] = React.useState<string>(""); // ✅ show 401/403 reasons

  const COL_LABELS = React.useMemo(
    () => ({ sr: t("Sr No"), dt: t("Date & Time"), user: t("User"), module: t("Module"), action: t("Action") }),
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
        const res = await fetch(`${API}/audit-logs/simple?${qs.toString()}&_=${Date.now()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
          dateTime: r.tsUtc ? fmtIST(r.tsUtc) : "—",
          user: r.user || "—",
          module: r.module || "—",
          action: r.action || "—",
        }));

        setRows(mapped);
        setTotal(j.total || mapped.length);
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
  }, [page, rowsPerPage, search]);

  const doExport = React.useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set("q", search.trim());
      const token = getAuthToken();
      const resp = await fetch(`${API}/audit-logs/simple/export?${qs.toString()}&_=${Date.now()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
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
  }, [search, t]);

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
            <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: UI.gap }}>
              <TextField
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); }}
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
                  <ThemedScrollTable rows={rows} colLabels={COL_LABELS} />
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
              rowsPerPageOptions={[10, 25, 50, 100]}
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
    </MainLayout>
  );
}
