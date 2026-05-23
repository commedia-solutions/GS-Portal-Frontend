import React from "react";
import {
  Box, Card, Button, Typography, Backdrop, TextField,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  ToggleButtonGroup, ToggleButton, IconButton, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Checkbox, FormControlLabel, FormGroup,
} from "@mui/material";
import { Select, MenuItem, FormControl } from "@mui/material";
import {
  EditOutlined as EditOutlinedIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  DeleteOutlined as DeleteOutlinedIcon,
  PublishOutlined as PublishOutlinedIcon,
} from "@mui/icons-material";
import DateRangeUI from "../components/DateRangeUI";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import api, { apiFetch } from "../api/http";
import { vars, sxPresets } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";
import { useActionAccess } from "../auth/useActionAccess";

/* ---------- Shared UI ---------- */
const CARD_SX = {
  position: "relative",
  overflow: "hidden",
  bgcolor: vars.bgCard,
  backdropFilter: "blur(20px)",
  border: `1px solid ${vars.border}`,
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  backgroundImage: "none",
  boxShadow: "0 20px 50px rgba(0,0,0,0.12)",
} as const;

const PREMIUM_PAGE_CARD_SX = {
  ...CARD_SX,
  border: `1px solid color-mix(in srgb, ${vars.accent} 26%, ${vars.border})`,
  boxShadow: "0 24px 60px rgba(0,0,0,0.32)",
} as const;

const VS_SECTION_CARD_SX = {
  position: "relative",
  overflow: "hidden",
  bgcolor: "color-mix(in srgb, var(--bg-card) 94%, var(--accent) 6%)",
  border: `1px solid ${vars.border}`,
  borderRadius: "16px",
  backgroundImage: "none",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
  display: "flex",
  flexDirection: "column",
} as const;

const pageGlowSx = {
  position: "absolute",
  inset: "-10%",
  background: "radial-gradient(circle at 80% 20%, rgba(14, 165, 233,0.12) 0%, transparent 40%)",
  filter: "blur(70px)",
  pointerEvents: "none",
  zIndex: 0,
  animation: "sc-fog-breathe 25s ease-in-out infinite",
} as const;

const pageScanSx = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "35%",
  background: "linear-gradient(90deg, transparent, rgba(14, 165, 233,0.04), transparent)",
  pointerEvents: "none",
  zIndex: 0,
  animation: "sc-scan-line 15s linear infinite",
} as const;

const TABLE_SCROLL_SX = {
  overflow: "auto",
  scrollbarWidth: "thin" as const,
  scrollbarColor: `${vars.border} transparent`,
  "&::-webkit-scrollbar": { width: 6, height: 6 },
  "&::-webkit-scrollbar-thumb": { background: vars.border, borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: vars.textDim },
  "&::-webkit-scrollbar-track": { background: "transparent" },
  "&::-webkit-scrollbar-corner": { background: "transparent" },
} as const;

const SCROLLER_SX = { ...sxPresets.scroller };

/* IAM Tab Styling */
/* IAM Tab Styling */
const BLUE_ACCENT = "#7CA7FF";
const BLUE_BORDER_DARK = "rgba(124,167,255,0.18)";
const SELECTED_BG_DARK = "#0E0E10";
const SELECTED_BG_LIGHT = "#FFFFFF";

const getSelectedBg = (t: any) => (t.palette.mode === "dark" ? SELECTED_BG_DARK : SELECTED_BG_LIGHT);
const getSelectedBord = (t: any) => (t.palette.mode === "dark" ? BLUE_BORDER_DARK : BLUE_ACCENT);
const getHoverBg = (t: any) => (t.palette.mode === "dark" ? "#0F1113" : "#FFFFFF");

const pillSx = {
  textTransform: "none", fontWeight: 700, fontSize: 13, px: 2, height: 32, lineHeight: "32px",
  borderRadius: 999, color: vars.textDim, bgcolor: "transparent",
  "&.Mui-selected": {
    color: BLUE_ACCENT, bgcolor: (t: any) => getSelectedBg(t),
    border: (t: any) => `1px solid ${getSelectedBord(t)}`,
    boxShadow: (t: any) => (t.palette.mode === "dark" ? "inset 0 0 0 1px rgba(124,167,255,0.06)" : "inset 0 0 0 1px rgba(124,167,255,0.12)"),
  },
  "&.Mui-selected:hover": { bgcolor: (t: any) => getHoverBg(t) },
} as const;

/* Buttons */
const purpleBtn = {
  textTransform: "none" as const, fontWeight: 700, bgcolor: "#7C57F2", color: "#fff",
  "&:hover": { bgcolor: "#6b46f1" },
};
const grayBtn = {
  textTransform: "none" as const, fontWeight: 700, bgcolor: "#555", color: "#ccc",
  "&:hover": { bgcolor: "#666" },
};
const redBtn = {
  textTransform: "none" as const, fontWeight: 700, bgcolor: "#e53e3e", color: "#fff",
  "&:hover": { bgcolor: "#c53030" },
};
const orangeBtn = {
  textTransform: "none" as const, fontWeight: 700, bgcolor: "#c2410c", color: "#fff",
  "&:hover": { bgcolor: "#9a3412" },
};
const greenBtn = {
  textTransform: "none" as const, fontWeight: 700, bgcolor: "#16a34a", color: "#fff",
  "&:hover": { bgcolor: "#14833e" },
};

/* ============= Data types ============= */
type PassStatus = "idle" | "pass_requested" | "pass_cancelled" | "requested" | "supported" | "no_support";

interface VSRow {
  id: number; date_text: string; sc: string; stn: string; orbit: string;
  max_ele: string; aos: string; los: string; operations: string;
  pass_status: PassStatus;
  post_pass_status: "Pending" | "Completed";
  // For resizing
  colWidths?: Record<string, number>;
}

interface DraftRow {
  id: number; date_text: string; sc: string; stn: string; orbit: string;
  max_ele: string; aos: string; los: string; operations: string;
  pass_status: PassStatus;
}

/* Detect if ops column contains TM/TC/TR/PB tokens */
const PASS_OPS = ["TM", "TC", "TR", "PB"];
function opsHaveSupport(ops: string) {
  if (!ops) return false;
  const upper = ops.toUpperCase();
  return PASS_OPS.some(op => upper.split(/[\s,/]+/).includes(op));
}

/* ============= MAIN PAGE ============= */
const TOK = {
  TEXT: "var(--text)", TEXT_DIM: "var(--text-dim)", CARD_BG: "var(--bg-card)",
  CONTROL_BG: "var(--bg-ctrl)", BORDER_STR: "1px solid var(--border)",
  BORDER_WEAK: "var(--border-weak)", ICON: "var(--text)", ACCENT: "var(--accent)",
  HOVER: "var(--bg-hover)", SCROLLBAR: "var(--scrollbar)",
} as const;

const UI = { ctrlH: 30, font: 13, icon: 16, gap: 0.75, headerPx: 1.25, headerPy: 0.6, searchW: 150, selectW: 120, dateW: 120, paginationH: 36 };
const filterActionSx = { mt: 2.1 } as const;

const compactCtrlSx = {
  bgcolor: TOK.CONTROL_BG, borderRadius: 1, color: TOK.TEXT,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: TOK.BORDER_WEAK },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, backgroundColor: TOK.CONTROL_BG, color: TOK.TEXT, paddingLeft: 8 },
  "& .MuiOutlinedInput-input, & .MuiInputBase-input, & input": {
    height: `${UI.ctrlH - 2}px`, padding: "0 10px 0 30px !important", fontSize: UI.font, color: TOK.TEXT, textAlign: "left !important",
  },
  "& .MuiInputBase-input::placeholder": { color: TOK.TEXT_DIM, opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: TOK.ICON },
} as const;

const compactSelectSx = {
  ...compactCtrlSx,
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, paddingLeft: 0 },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px`, lineHeight: `${UI.ctrlH - 2}px`, padding: "0 28px 0 10px !important", display: "flex", alignItems: "center", fontSize: UI.font, color: TOK.TEXT,
  },
} as const;

const lightMenu = { PaperProps: { sx: { bgcolor: TOK.CONTROL_BG, color: TOK.TEXT, border: TOK.BORDER_STR, "& .MuiMenuItem-root:hover": { bgcolor: "rgba(0,0,0,0.04)" } } } };

function Labeled({ label, children, width }: { label: string; children: React.ReactNode; width: number | string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width }}>
      <Typography sx={{ fontSize: 11, color: TOK.TEXT_DIM, mb: 0.3, pl: 0.2 }}>{label}</Typography>
      {children}
    </Box>
  );
}

/* ====== Request Pass Dialog for No Support rows ====== */
const ALL_OPS = ["TM", "TC", "TR", "PB", "PL"];

function RequestPassDialog({
  open, onClose, onConfirm,
}: { open: boolean; onClose: () => void; onConfirm: (ops: string[]) => void; }) {
  const [selected, setSelected] = React.useState<string[]>([]);
  const toggle = (op: string) =>
    setSelected(prev => prev.includes(op) ? prev.filter(x => x !== op) : [...prev, op]);
  const handleConfirm = () => { if (selected.length) { onConfirm(selected); setSelected([]); } };
  const handleClose = () => { setSelected([]); onClose(); };
  return (
    <Dialog open={open} onClose={handleClose}
      PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>Select Required Operation Support</DialogTitle>
      <DialogContent>
        <Typography sx={{ fontSize: 13, color: vars.textDim, mb: 1 }}>
          Choose one or more operation types to request support for:
        </Typography>
        <FormGroup row>
          {ALL_OPS.map(op => (
            <FormControlLabel
              key={op}
              control={
                <Checkbox
                  checked={selected.includes(op)}
                  onChange={() => toggle(op)}
                  sx={{ color: vars.textDim, "&.Mui-checked": { color: "#7C57F2" } }}
                />
              }
              label={op}
              sx={{ color: vars.text }}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} sx={{ color: vars.textDim }}>Cancel</Button>
        <Button onClick={handleConfirm} variant="contained" disabled={!selected.length} sx={purpleBtn}>
          Request Pass
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ============= TABLE HEAD / CELL SX ============= */
const theadCellSx = {
  color: "var(--thead-text)",
  fontWeight: 800,
  fontSize: 9.5,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  bgcolor: vars.bgThead,
  border: "none",
  borderBottom: `1px solid ${vars.border}`,
  whiteSpace: "nowrap" as const,
  textAlign: "center" as const,
  position: "relative",
  py: "10px",
  px: "14px",
  "& .resizer": {
    position: "absolute",
    right: 0,
    top: "10%",
    height: "80%",
    width: "4px",
    bgcolor: "transparent",
    cursor: "col-resize",
    userSelect: "none",
    touchAction: "none",
    borderRadius: "2px",
    transition: "background 0.2s",
    "&:hover": { bgcolor: "#7C57F2" },
  },
} as const;

const bodyCellSx = {
  fontSize: 12,
  color: "var(--text-dim)",
  border: "none",
  whiteSpace: "nowrap" as const,
  textAlign: "center" as const,
  padding: "9px 14px",
} as const;

/* shared row sx — apply to every TableRow in the body */
const bodyRowSx = {
  bgcolor: "transparent",
  transition: "background 0.2s",
  "& td": { borderBottom: `1px solid ${vars.borderWeak}` },
  "&:last-child td": { borderBottom: "none" },
  "&:hover": {
    bgcolor: vars.bgHover,
    "& .hover-accent": { opacity: 1, height: "70%" },
  },
} as const;

const getBadgeStyle = (status: string) => {
  const s = (status || "").toLowerCase();
  if (s.includes("approved") || s.includes("supported") || s.includes("done") || s.includes("completed")) {
    return { color: "#00FF9D" };
  }
  if (s.includes("pending") || s.includes("requested") || s.includes("triaged")) {
    return { color: "#FFB800" };
  }
  if (s.includes("rejected") || s.includes("failed") || s.includes("cancelled") || s.includes("no_support") || s.includes("no support")) {
    return { color: "#FF2E63" };
  }
  return { color: "#E0E0E0" };
};

const prettyBadgeText = (status: string) => {
  const raw = status || "Pending";
  return raw.trim().replace(/\s+/g, "_").toUpperCase();
};

function StatusBadge({
  status,
  onClick,
  disabled,
}: {
  status: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  const s = getBadgeStyle(status);
  const clickable = Boolean(onClick) && !disabled;

  return (
    <Box
      component={clickable ? "button" : "span"}
      onClick={clickable ? onClick : undefined}
      disabled={clickable ? undefined : true}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        minWidth: 118,
        minHeight: 28,
        px: 1.5,
        py: 0.45,
        borderRadius: "6px",
        border: `1px solid ${s.color}33`,
        bgcolor: `${s.color}15`,
        color: s.color,
        font: "inherit",
        cursor: clickable ? "pointer" : "default",
        opacity: disabled ? 0.55 : 1,
        outline: "none",
        transition: "all 0.18s ease",
        "&:hover": clickable
          ? { bgcolor: `${s.color}22`, borderColor: `${s.color}66` }
          : undefined,
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: s.color,
          boxShadow: `0 0 10px ${s.color}, 0 0 4px ${s.color}`,
        }}
      />
      <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
        {prettyBadgeText(status)}
      </Typography>
    </Box>
  );
}

const premiumPaginationSx = {
  px: 1,
  bgcolor: vars.bgCard,
  color: vars.text,
  borderTop: `1px solid ${vars.border}`,
  "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0, pl: 1, pr: 1, gap: 0.5 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 12, margin: 0, color: vars.textDim, fontWeight: 600 },
  "& .MuiTablePagination-input": { fontSize: 12, margin: 0, color: vars.text },
  "& .MuiTablePagination-select": { bgcolor: vars.bgCtrl, borderRadius: "6px", fontSize: 12, fontWeight: 700, px: 1, mr: 2, display: "flex", alignItems: "center", height: 28 },
  "& .MuiIconButton-root": { color: vars.text, p: 0.5, "&:hover": { bgcolor: vars.bgHover }, "&.Mui-disabled": { color: vars.textWeak } },
  ".MuiSvgIcon-root": { fontSize: 20 },
} as const;

export default function VisibilitySchedule() {
  const { t } = useI18n();
  const { hasReadAccess, hasWriteAccess } = useActionAccess();

  const [tab, setTab] = React.useState<"availability" | "scheduled" | "requested">(hasReadAccess("pass_availability") ? "availability" : hasReadAccess("pass_scheduled") ? "scheduled" : "requested");
  const canWrite = tab === "availability" ? hasWriteAccess("pass_availability") : tab === "scheduled" ? hasWriteAccess("pass_scheduled") : hasWriteAccess("pass_requested");

  // Resizing state
  const [colWidths, setColWidths] = React.useState<Record<string, number>>({
    sc: 100,
    stn: 100,
    operations: 150,
    date_text: 120,
  });

  const handleResize = (key: string, e: React.MouseEvent) => {
    const startX = e.pageX;
    const startWidth = colWidths[key] || 100;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(50, startWidth + (moveEvent.pageX - startX));
      setColWidths(prev => ({ ...prev, [key]: newWidth }));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  /* ---- Main VS Data ---- */
  const [vsRows, setVsRows] = React.useState<VSRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const vsRes = await api.get("/api/visibility-schedule");
      setVsRows(Array.isArray(vsRes) ? vsRes : (vsRes?.data || []));
    } catch (e) {
      console.error(e);
      setVsRows([]);
    }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  /* ---- Draft Data ---- */
  const [draftRows, setDraftRows] = React.useState<DraftRow[]>([]);
  const [draftLoading, setDraftLoading] = React.useState(false);
  const [selectedDraftIds, setSelectedDraftIds] = React.useState<number[]>([]);

  const fetchDraft = React.useCallback(async () => {
    setDraftLoading(true);
    try {
      const res = await api.get("/api/visibility-schedule/draft");
      setDraftRows(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) {
      console.error(e);
      setDraftRows([]);
    } finally { setDraftLoading(false); }
  }, []);

  React.useEffect(() => { fetchDraft(); }, [fetchDraft]);

  /* ---- Satellites and Antennas List for Draft Edit Dropdowns ---- */
  const [satelliteList, setSatelliteList] = React.useState<string[]>([]);
  const [antennaList, setAntennaList] = React.useState<string[]>([]);

  React.useEffect(() => {
    api.get("/api/satellites").then((res: any) => {
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const names = Array.from(new Set(arr.map((s: any) => s.satellite_name).filter(Boolean)));
      setSatelliteList(names as string[]);
    }).catch(console.error);

    api.get("/api/antennas/names/unique").then((res: any) => {
      const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAntennaList(arr);
    }).catch(console.error);
  }, []);

  /* ---- File Upload ---- */
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      await api.post("/api/visibility-schedule/bulk", fd);
      await fetchDraft();
      setFile(null);
      setSelectedDraftIds([]);
      alert(t("Upload successful – passes added to draft table"));
    } catch (e: any) {
      const errData = e?.response?.data;
      if (errData?.validation && Array.isArray(errData.validation)) {
        alert("Upload failed – Validation errors:\n\n" + errData.validation.join("\n"));
      } else {
        alert("Upload failed: " + (errData?.error || e?.message));
      }
    }
    finally { setUploading(false); }
  };

  /* ---- Draft checkbox logic ---- */
  const allDraftSelected = draftRows.length > 0 && draftRows.every(r => selectedDraftIds.includes(r.id));
  const someDraftSelected = selectedDraftIds.length > 0 && !allDraftSelected;

  const toggleDraftSelect = (id: number) => {
    setSelectedDraftIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const toggleAllDraft = () => {
    if (allDraftSelected) setSelectedDraftIds([]);
    else setSelectedDraftIds(draftRows.map(r => r.id));
  };

  /* ---- Delete Draft Rows ---- */
  const [deleteDraftPrompt, setDeleteDraftPrompt] = React.useState(false);
  const handleDeleteDraft = async () => {
    try {
      await apiFetch("/api/visibility-schedule/draft", {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedDraftIds }),
      });
      await fetchDraft();
      setSelectedDraftIds([]);
    } catch { alert("Failed to delete draft rows"); }
    setDeleteDraftPrompt(false);
  };

  /* ---- Publish Draft ---- */
  const [publishing, setPublishing] = React.useState(false);
  const [publishPrompt, setPublishPrompt] = React.useState(false);
  const handlePublish = async () => {
    setPublishing(true);
    try {
      await api.post("/api/visibility-schedule/draft/publish", {});
      await fetchData();
      await fetchDraft();
      setSelectedDraftIds([]);
      alert("Passes published successfully to Visibility Schedule.");
    } catch (e: any) {
      alert("Publish failed: " + (e?.response?.data?.error || e?.message));
    } finally { setPublishing(false); }
    setPublishPrompt(false);
  };

  /* ---- Filters & Pagination (main table) ---- */
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [searchText, setSearchText] = React.useState("");
  const [station, setStation] = React.useState("All");
  const [satellite, setSatellite] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("All");
  const [fromDate, setFromDate] = React.useState<Date | null>(null);
  const [toDate, setToDate] = React.useState<Date | null>(null);

  const safeRows = Array.isArray(vsRows) ? vsRows : [];
  const stationOptions = ["All", ...Array.from(new Set(safeRows.map(r => r.stn).filter(Boolean)))];
  const satOptions = ["All", ...Array.from(new Set(safeRows.map(r => r.sc).filter(Boolean)))];

  const clearFilters = () => {
    setSearchText(""); setStation("All"); setSatellite("All"); setStatusFilter("All");
    setFromDate(null); setToDate(null);
  };

  const filteredRows = safeRows.filter(r => {
    if (tab === "scheduled" && !["pass_requested", "supported", "no_support"].includes(r.pass_status)) return false;

    if (station !== "All" && r.stn !== station) return false;
    if (satellite !== "All" && r.sc !== satellite) return false;

    if (statusFilter !== "All") {
      if (statusFilter === "Pending" && !["idle", "pass_requested"].includes(r.pass_status)) return false;
      if (statusFilter === "Support" && r.pass_status !== "supported") return false;
      if (statusFilter === "No Support" && r.pass_status !== "no_support") return false;
      if (statusFilter === "Pass Requested" && r.pass_status !== "pass_requested") return false;
      if (statusFilter === "Pass Cancelled" && r.pass_status !== "pass_cancelled") return false;
    }

    if (searchText) {
      const hay = `${r.date_text} ${r.sc} ${r.stn} ${r.operations} ${r.orbit}`.toLowerCase();
      if (!hay.includes(searchText.toLowerCase())) return false;
    }

    if (fromDate || toDate) {
      const parts = r.date_text.split(/[/-]/).map((x) => parseInt(x, 10));
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      if (fromDate && dt < new Date(new Date(fromDate).setHours(0, 0, 0, 0))) return false;
      if (toDate && dt > new Date(new Date(toDate).setHours(23, 59, 59, 999))) return false;
    }

    return true;
  });

  const visibleRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  /* ---- Actions ---- */
  const updateVsStatus = async (id: number, status: string, extraFields?: Record<string, string>) => {
    try {
      await api.patch(`/api/visibility-schedule/${id}`, { pass_status: status, ...extraFields });
      setVsRows(prev => prev.map(r => r.id === id ? { ...r, pass_status: status as any, ...extraFields } : r));
    } catch (e) { alert("Failed to update status"); }
  };

  const updatePostPassStatus = async (id: number, post_pass_status: string) => {
    try {
      await api.patch(`/api/visibility-schedule/${id}`, { post_pass_status });
      setVsRows(prev => prev.map(r => r.id === id ? { ...r, post_pass_status: post_pass_status as any } : r));
    } catch (e) { alert("Failed to update post pass status"); }
  };

  const supportPass = async (id: number) => {
    try {
      await api.post(`/api/visibility-schedule/${id}/support`);
      setVsRows(prev => prev.map(r => r.id === id ? { ...r, pass_status: "supported" as any } : r));
    } catch (e) { alert("Failed to support pass"); }
  };

  /* Popups */
  const [cancelPrompt, setCancelPrompt] = React.useState<{ id: number; isDraft: boolean } | null>(null);
  const [requestPassPrompt, setRequestPassPrompt] = React.useState<{ id: number; isDraft: boolean } | null>(null);
  const [editRow, setEditRow] = React.useState<VSRow | null>(null);
  const [editDraftRow, setEditDraftRow] = React.useState<DraftRow | null>(null);
  const [scheduledPrompt, setScheduledPrompt] = React.useState<{ row: VSRow; newStatus: string } | null>(null);
  const [postPassPrompt, setPostPassPrompt] = React.useState<{ id: number; newStatus: string } | null>(null);

  const saveEdit = async () => {
    if (!editRow) return;
    try {
      await api.put(`/api/visibility-schedule/${editRow.id}`, editRow);
      setVsRows(prev => prev.map(r => r.id === editRow.id ? editRow : r));
      setEditRow(null);
    } catch (e) { alert("Failed to update row"); }
  };

  const saveDraftEdit = async () => {
    if (!editDraftRow) return;
    try {
      await apiFetch(`/api/visibility-schedule/draft/${editDraftRow.id}`, {
        method: "PUT",
        body: JSON.stringify(editDraftRow),
      });
      setDraftRows(prev => prev.map(r => r.id === editDraftRow.id ? editDraftRow : r));
      setEditDraftRow(null);
    } catch (e) { alert("Failed to update draft row"); }
  };

  /* Exports */
  const handleCSV = () => {
    const header = ["DATE", "S/C", "STN", "ORBIT", "Max", "AOS", "LOS", "OPERATIONS", "Status", "Post Pass Status"].join(",");
    const csvRows = filteredRows.map(r => [
      r.date_text, r.sc, r.stn, r.orbit, r.max_ele, r.aos, r.los, `"${r.operations || ''}"`, r.pass_status, r.post_pass_status || "Pending"
    ].join(","));
    const blob = new Blob([[header, ...csvRows].join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visibility_schedule_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  /* ---- Toggle Support button (Scheduled tab) ---- */
  const handleScheduledToggle = (r: VSRow) => {
    if (!canWrite) return;

    // 1. If currently "pass_requested" or "idle" -> silent update to "supported"
    if (r.pass_status !== "supported" && r.pass_status !== "no_support") {
      supportPass(r.id);
      return;
    }

    // 2. If already "supported" or "no_support" -> show prompt
    const newStatus = r.pass_status === "supported" ? "no_support" : "supported";
    setScheduledPrompt({ row: r, newStatus });
  };

  const confirmScheduledToggle = async () => {
    if (!scheduledPrompt) return;
    const { row, newStatus } = scheduledPrompt;
    if (newStatus === "supported") {
      await supportPass(row.id);
    } else {
      await updateVsStatus(row.id, newStatus);
    }
    setScheduledPrompt(null);
  };

  const updateDraftStatus = async (id: number, status: string, extraFields?: Record<string, string>) => {
    try {
      await apiFetch(`/api/visibility-schedule/draft/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ pass_status: status, ...extraFields }),
      });
      setDraftRows(prev => prev.map(r => r.id === id ? { ...r, pass_status: status as any, ...extraFields } : r));
    } catch (e) { alert("Failed to update draft status"); }
  };

  const confirmPostPassStatus = async () => {
    if (!postPassPrompt) return;
    await updatePostPassStatus(postPassPrompt.id, postPassPrompt.newStatus);
    setPostPassPrompt(null);
  };

  /* ---- Availability status button renderer (used for both main table and draft table) ---- */
  const renderAvailabilityStatus = (r: VSRow | DraftRow, isDraft = false) => {
    const { pass_status, operations } = r;

    if (pass_status === "pass_cancelled") {
      return (
        <Button size="small" disabled={!canWrite}
          onClick={() => setRequestPassPrompt({ id: r.id, isDraft })}
          sx={{ ...orangeBtn, py: 0.2, px: 1, minWidth: 130 }}>
          Pass Cancelled
        </Button>
      );
    }

    if (operations && operations.toUpperCase() === "NO SUPPORT") {
      return (
        <Button size="small" disabled={!canWrite}
          onClick={() => setRequestPassPrompt({ id: r.id, isDraft })}
          sx={{ ...purpleBtn, py: 0.2, px: 1, minWidth: 130 }}>
          Request Pass
        </Button>
      );
    }

    if (pass_status === "pass_requested" || pass_status === "requested" || opsHaveSupport(operations)) {
      return (
        <Button size="small" disabled={!canWrite}
          onClick={() => setCancelPrompt({ id: r.id, isDraft })}
          sx={{ ...grayBtn, py: 0.2, px: 1, minWidth: 130 }}>
          Pass Requested
        </Button>
      );
    }

    return (
      <Button size="small" disabled={!canWrite}
        onClick={() => setRequestPassPrompt({ id: r.id, isDraft })}
        sx={{ ...purpleBtn, py: 0.2, px: 1, minWidth: 130 }}>
        Request Pass
      </Button>
    );
  };

  /* ---- Draft Filters & Pagination ---- */
  const [draftPage, setDraftPage] = React.useState(0);
  const [draftRowsPerPage, setDraftRowsPerPage] = React.useState(25);
  const [draftStation, setDraftStation] = React.useState("All");
  const [draftSatellite, setDraftSatellite] = React.useState("All");
  const [draftStatusFilter, setDraftStatusFilter] = React.useState("All");
  const [draftFromDate, setDraftFromDate] = React.useState<Date | null>(null);
  const [draftToDate, setDraftToDate] = React.useState<Date | null>(null);

  const safeDraftRows = Array.isArray(draftRows) ? draftRows : [];
  const draftStationOptions = ["All", ...Array.from(new Set(safeDraftRows.map(r => r.stn).filter(Boolean)))];
  const draftSatOptions = ["All", ...Array.from(new Set(safeDraftRows.map(r => r.sc).filter(Boolean)))];

  const clearDraftFilters = () => {
    setDraftStation("All"); setDraftSatellite("All"); setDraftStatusFilter("All");
    setDraftFromDate(null); setDraftToDate(null);
  };

  const filteredDraftRows = safeDraftRows.filter(r => {
    if (draftStation !== "All" && r.stn !== draftStation) return false;
    if (draftSatellite !== "All" && r.sc !== draftSatellite) return false;
    if (draftStatusFilter !== "All") {
      if (draftStatusFilter === "Pending" && !["idle", "pass_requested"].includes(r.pass_status)) return false;
      if (draftStatusFilter === "Pass Requested" && r.pass_status !== "pass_requested") return false;
      if (draftStatusFilter === "Pass Cancelled" && r.pass_status !== "pass_cancelled") return false;
    }
    if (draftFromDate || draftToDate) {
      const parts = r.date_text.split(/[/-]/).map((x) => parseInt(x, 10));
      const dt = new Date(parts[0], parts[1] - 1, parts[2]);
      if (draftFromDate && dt < new Date(new Date(draftFromDate).setHours(0, 0, 0, 0))) return false;
      if (draftToDate && dt > new Date(new Date(draftToDate).setHours(23, 59, 59, 999))) return false;
    }
    return true;
  });

  const visibleDraftRows = filteredDraftRows.slice(draftPage * draftRowsPerPage, draftPage * draftRowsPerPage + draftRowsPerPage);

  return (
    <MainLayout title="">
      <Backdrop open={uploading || loading || publishing || draftLoading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Cancel Request Dialog */}
      <Dialog open={cancelPrompt !== null} onClose={() => setCancelPrompt(null)} PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Do you want to cancel the Pass Request?</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelPrompt(null)} sx={{ color: vars.textDim }}>No</Button>
          <Button onClick={() => {
            if (cancelPrompt !== null) {
              if (cancelPrompt.isDraft) updateDraftStatus(cancelPrompt.id, "pass_cancelled", { operations: "NO SUPPORT" });
              else updateVsStatus(cancelPrompt.id, "pass_cancelled", { operations: "NO SUPPORT" });
            }
            setCancelPrompt(null);
          }} variant="contained" sx={purpleBtn}>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Pass Scheduled – Support/No Support change confirmation */}
      <Dialog open={scheduledPrompt !== null} onClose={() => setScheduledPrompt(null)} PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Do you want to change the status of the pass?</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setScheduledPrompt(null)} sx={{ color: vars.textDim }}>No</Button>
          <Button onClick={confirmScheduledToggle} variant="contained" sx={purpleBtn}>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Post Pass Status change confirmation */}
      <Dialog open={postPassPrompt !== null} onClose={() => setPostPassPrompt(null)} PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Do you want to change the Post Pass Status?</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPostPassPrompt(null)} sx={{ color: vars.textDim }}>No</Button>
          <Button onClick={confirmPostPassStatus} variant="contained" sx={purpleBtn}>Yes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Draft Confirmation */}
      <Dialog open={deleteDraftPrompt} onClose={() => setDeleteDraftPrompt(false)} PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Delete {selectedDraftIds.length > 0 ? `${selectedDraftIds.length} selected` : "all"} draft pass{selectedDraftIds.length !== 1 ? "es" : ""}?</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDraftPrompt(false)} sx={{ color: vars.textDim }}>Cancel</Button>
          <Button onClick={handleDeleteDraft} variant="contained" sx={redBtn}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Publish Confirmation */}
      <Dialog open={publishPrompt} onClose={() => setPublishPrompt(false)} PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Publish {draftRows.length} draft pass{draftRows.length !== 1 ? "es" : ""} to Visibility Schedule?</DialogTitle>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPublishPrompt(false)} sx={{ color: vars.textDim }}>Cancel</Button>
          <Button onClick={handlePublish} variant="contained" sx={greenBtn}>Publish</Button>
        </DialogActions>
      </Dialog>

      {/* Request Pass Dialog (for No Support rows) */}
      <RequestPassDialog
        open={requestPassPrompt !== null}
        onClose={() => setRequestPassPrompt(null)}
        onConfirm={(ops) => {
          if (requestPassPrompt !== null) {
            const opsStr = ops.join(" ");
            if (requestPassPrompt.isDraft) {
              updateDraftStatus(requestPassPrompt.id, "pass_requested", { operations: opsStr });
            } else {
              api.patch(`/api/visibility-schedule/${requestPassPrompt.id}`, {
                pass_status: "pass_requested",
                operations: opsStr,
              }).then(() => {
                setVsRows(prev => prev.map(r =>
                  r.id === requestPassPrompt.id
                    ? { ...r, pass_status: "pass_requested" as any, operations: opsStr }
                    : r
                ));
              }).catch(() => alert("Failed to request pass"));
            }
          }
          setRequestPassPrompt(null);
        }}
      />

      {/* Edit Draft Row Dialog */}
      <Dialog open={!!editDraftRow} onClose={() => setEditDraftRow(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Draft Pass Data</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2, pb: 2 }}>
          {editDraftRow && ["date_text", "sc", "stn", "orbit", "max_ele", "aos", "los", "operations"].map((field) => {
            const isSc = field === "sc";
            const isStn = field === "stn";

            if (isSc || isStn) {
              return (
                <FormControl key={field} size="small" fullWidth>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: vars.textDim, mb: 0.3, textTransform: "uppercase" }}>
                    {field === "sc" ? "S/C" : "STN"}
                  </Typography>
                  <Select
                    value={(editDraftRow as any)[field] || ""}
                    onChange={(e) => setEditDraftRow({ ...editDraftRow, [field]: e.target.value })}
                    displayEmpty
                    sx={(tm) => ({
                      "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
                      bgcolor: tm.palette.mode === "dark" ? "#232325" : "#fff",
                      color: vars.text,
                      height: 36
                    })}
                    MenuProps={lightMenu}
                  >
                    <MenuItem disabled value="">Select {field === "sc" ? "S/C" : "STN"}</MenuItem>
                    {(isSc ? satelliteList : antennaList).map(opt => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            return (
              <Box key={field}>
                <Typography sx={{ fontSize: 11, fontWeight: 700, color: vars.textDim, mb: 0.3 }}>
                  {field.toUpperCase().replace("_TEXT", "")}
                </Typography>
                <TextField fullWidth size="small"
                  value={(editDraftRow as any)[field] || ""} onChange={(e) => setEditDraftRow({ ...editDraftRow, [field]: e.target.value })}
                  sx={(tm) => ({ "& .MuiOutlinedInput-root": { height: 36, bgcolor: tm.palette.mode === "dark" ? "#232325" : "#fff", color: vars.text } })} />
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDraftRow(null)} sx={{ color: vars.textDim }}>Cancel</Button>
          <Button onClick={saveDraftEdit} variant="contained" sx={purpleBtn}>Save</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Row Dialog */}
      <Dialog open={!!editRow} onClose={() => setEditRow(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Pass Data</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 2, pb: 2 }}>
          {editRow && ["date_text", "sc", "stn", "orbit", "max_ele", "aos", "los", "operations"].map((field) => (
            <Box key={field}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: vars.textDim, mb: 0.3 }}>
                {field.toUpperCase().replace("_TEXT", "")}
              </Typography>
              <TextField fullWidth size="small"
                value={(editRow as any)[field] || ""} onChange={(e) => setEditRow({ ...editRow, [field]: e.target.value })}
                sx={(tm) => ({ "& .MuiOutlinedInput-root": { height: 36, bgcolor: tm.palette.mode === "dark" ? "#232325" : "#fff", color: vars.text } })} />
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditRow(null)} sx={{ color: vars.textDim }}>Cancel</Button>
          <Button onClick={saveEdit} variant="contained" sx={purpleBtn}>Save</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Card sx={{ ...CARD_SX, width: "100%", height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)` }}>
          {/* Ambient Volumetric Lighting */}
          <Box sx={{ position: "absolute", top: "-10%", left: "-10%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(14,165,233,0.08), transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
          <Box sx={{ position: "absolute", bottom: "-10%", right: "-10%", width: "40%", height: "40%", background: "radial-gradient(circle, rgba(124,110,245,0.08), transparent 70%)", filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
          {/* Tabs */}
          <Box sx={{ px: 1.25, py: 0.6, borderBottom: `1px solid ${vars.border}`, display: "flex", justifyContent: "flex-start" }}>
            <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => { if (v) { setTab(v); setPage(0); } }} sx={{ borderRadius: 999, border: `1px solid ${vars.border}`, p: 0.5 }}>
              {hasReadAccess("pass_availability") && (
                <ToggleButton value="availability" sx={pillSx}>{t("Pass Availability")}</ToggleButton>
              )}
              {hasReadAccess("pass_requested") && (
                <ToggleButton value="requested" sx={pillSx}>{t("Pass Requested")}</ToggleButton>
              )}
              {hasReadAccess("pass_scheduled") && (
                <ToggleButton value="scheduled" sx={pillSx}>{t("Pass Scheduled")}</ToggleButton>
              )}
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto", p: 2, ...SCROLLER_SX }}>
            {/* Upload Section (Only in Availability) */}
            {tab === "availability" && (
              <Card sx={{ ...CARD_SX, border: `1px solid ${vars.border}`, mb: 2, p: 0 }}>
                <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}` }}>
                  <Typography sx={{ fontWeight: 700, color: "#7CA7FF" }}>Pass Visibility Upload</Typography>
                </Box>
                <Box sx={{ px: 2, py: 1.5, display: "flex", gap: 2, alignItems: "center" }}>
                  <input ref={fileInputRef} type="file" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  <Button variant="contained" size="small" disabled={!canWrite} onClick={() => fileInputRef.current?.click()} sx={purpleBtn}>Select File</Button>
                  <Typography sx={{ color: vars.textDim, fontSize: 13, flexGrow: 1 }}>{file ? file.name : "No file selected"}</Typography>
                  <Button variant="outlined" size="small" onClick={() => setFile(null)} disabled={!file || !canWrite} sx={{ color: vars.textDim, borderColor: vars.border }}>Clear</Button>
                  <Button variant="contained" size="small" onClick={handleUpload} disabled={!file || uploading || !canWrite} sx={purpleBtn}>Upload</Button>
                </Box>
              </Card>
            )}

            {/* Draft Table (only in Availability tab) */}
            {tab === "availability" && (
              <Card sx={{
                position: "relative", overflow: "hidden",
                bgcolor: vars.bgCard, border: `1px solid ${vars.border}`,
                borderRadius: "16px", backgroundImage: "none",
                mb: 2, p: 0, flex: 1, minHeight: 0, display: "flex", flexDirection: "column"
              }}>
                {/* Draft table header bar */}
                <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: UI.gap, flexWrap: "wrap" }}>
                  <Typography sx={{ fontWeight: 700, color: "#7CA7FF", mr: 1 }}>
                    Draft Passes {draftRows.length > 0 ? `(${draftRows.length})` : ""}
                  </Typography>

                  <Labeled label={t("Stations")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={draftStation} onChange={(e) => { setDraftStation(e.target.value); setDraftPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {draftStationOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Satellites")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={draftSatellite} onChange={(e) => { setDraftSatellite(e.target.value); setDraftPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {draftSatOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Status")} width={130}>
                    <FormControl size="small" fullWidth>
                      <Select value={draftStatusFilter} onChange={(e) => { setDraftStatusFilter(e.target.value); setDraftPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {["All", "Pending", "Pass Requested", "Pass Cancelled"].map(s => <MenuItem key={s} value={s}>{t(s)}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <DateRangeUI
                    label={t("Select Date Range")}
                    startDate={draftFromDate}
                    endDate={draftToDate}
                    onChange={(start, end) => { setDraftFromDate(start); setDraftToDate(end); setDraftPage(0); }}
                  />

                  <Button onClick={clearDraftFilters} size="small" sx={{ color: "#2563eb", textTransform: "none", fontWeight: 700, ...filterActionSx }}>{t("Clear")}</Button>

                  <Box flexGrow={1} />

                  {/* Delete Selected button */}
                  {selectedDraftIds.length > 0 && canWrite && (
                    <Button
                      onClick={() => setDeleteDraftPrompt(true)}
                      size="small"
                      variant="contained"
                      startIcon={<DeleteOutlinedIcon />}
                      sx={{ ...redBtn, height: UI.ctrlH, minHeight: UI.ctrlH, fontSize: 12.5, borderRadius: 1, ...filterActionSx }}
                    >
                      Delete ({selectedDraftIds.length})
                    </Button>
                  )}

                  {/* Publish button */}
                  {canWrite && (
                    <Button
                      onClick={() => {
                        if (draftRows.length === 0) return alert("No draft passes to publish.");
                        setPublishPrompt(true);
                      }}
                      size="small"
                      variant="contained"
                      disabled={draftRows.length === 0 || publishing}
                      startIcon={<PublishOutlinedIcon />}
                      sx={{ bgcolor: "#7C57F2", color: "#fff", height: UI.ctrlH, minHeight: UI.ctrlH, fontSize: 12.5, fontWeight: 700, textTransform: "none", borderRadius: 1, ...filterActionSx, "&:hover": { bgcolor: "#6b46f1" } }}
                    >
                      Publish
                    </Button>
                  )}
                </Box>

                <TableContainer sx={{ flex: 1, minHeight: 0, ...TABLE_SCROLL_SX }}>
                  <Table size="small" stickyHeader sx={{ borderCollapse: "collapse", tableLayout: "auto" }}>
                    <TableHead>
                      <TableRow>
                        {/* Select All checkbox */}
                        <TableCell padding="checkbox" sx={{ ...theadCellSx, width: 44 }}>
                          <Checkbox
                            size="small"
                            checked={allDraftSelected}
                            indeterminate={someDraftSelected}
                            onChange={toggleAllDraft}
                            sx={{ color: "#7CA7FF", "&.Mui-checked": { color: "#7CA7FF" }, "&.MuiCheckbox-indeterminate": { color: "#7CA7FF" } }}
                            disabled={draftRows.length === 0}
                          />
                        </TableCell>
                        <TableCell sx={theadCellSx}>Sr No.</TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.date_text }}>
                          DATE (yyyy mm dd)
                          <Box className="resizer" onMouseDown={(e) => handleResize("date_text", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.sc }}>
                          S/C
                          <Box className="resizer" onMouseDown={(e) => handleResize("sc", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.stn }}>
                          STN
                          <Box className="resizer" onMouseDown={(e) => handleResize("stn", e)} />
                        </TableCell>
                        <TableCell sx={theadCellSx}>ORBIT</TableCell>
                        <TableCell sx={theadCellSx}>Max</TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.aos }}>
                          AOS (hh:mm:ss)
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.los }}>
                          LOS (hh:mm:ss)
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.operations }}>
                          OPERATIONS
                          <Box className="resizer" onMouseDown={(e) => handleResize("operations", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, textAlign: "center" }}>Action</TableCell>
                        <TableCell sx={{ ...theadCellSx, textAlign: "center" }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleDraftRows.map((r, index) => (
                        <TableRow key={r.id} sx={bodyRowSx}>
                          <TableCell padding="checkbox" sx={{ ...bodyCellSx, position: "relative", textAlign: "left" }}>
                            <Box className="hover-accent" sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "0%", opacity: 0, background: `linear-gradient(to bottom, transparent, ${vars.accent}, transparent)`, boxShadow: `0 0 10px ${vars.accent}`, transition: "all 0.3s ease", pointerEvents: "none" }} />
                            <Checkbox size="small" checked={selectedDraftIds.includes(r.id)} onChange={() => toggleDraftSelect(r.id)} sx={{ color: vars.textDim, "&.Mui-checked": { color: "#7C57F2" } }} />
                          </TableCell>
                          <TableCell sx={bodyCellSx}>{(draftPage * draftRowsPerPage) + index + 1}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.date_text }}>{r.date_text.replace(/-/g, ' ')}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, color: vars.accent, fontWeight: 700, width: colWidths.sc }}>{r.sc}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.stn }}>{r.stn}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.orbit}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.max_ele}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.aos}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.los}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.operations }}>{r.operations}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                            <IconButton size="small" disabled={!canWrite} onClick={() => setEditDraftRow(r)} sx={{ color: vars.textDim }}><EditOutlinedIcon fontSize="small" /></IconButton>
                          </TableCell>
                          <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                            {renderAvailabilityStatus(r, true)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {visibleDraftRows.length === 0 && (
                        <TableRow><TableCell colSpan={12} sx={{ textAlign: "center", py: 3, color: vars.textDim }}>{draftLoading ? "Loading..." : "No draft passes. Upload a .ant file to begin."}</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination component="div" count={filteredDraftRows.length} page={draftPage} onPageChange={(_, p) => setDraftPage(p)} rowsPerPage={draftRowsPerPage} onRowsPerPageChange={(e) => { setDraftRowsPerPage(parseInt(e.target.value, 10)); setDraftPage(0); }} rowsPerPageOptions={[25, 50, 100]} sx={premiumPaginationSx} />
              </Card>
            )}

            {/* Main Table Card */}
            {tab === "scheduled" && (
              <Card sx={{ position: "relative", overflow: "hidden", bgcolor: vars.bgCard, border: `1px solid ${vars.border}`, borderRadius: "16px", backgroundImage: "none", flex: 1, p: 0, display: "flex", flexDirection: "column" }}>
                {/* Filter Bar */}
                <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: UI.gap }}>
                  <Typography sx={{ fontWeight: 700, color: "#7CA7FF", mr: 2 }}>Scheduled Passes</Typography>

                  <Labeled label={t("Stations")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={station} onChange={(e) => { setStation(e.target.value); setPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {stationOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Satellites")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={satellite} onChange={(e) => { setSatellite(e.target.value); setPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {satOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Status")} width={140}>
                    <FormControl size="small" fullWidth>
                      <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {["All", "Pending", "Pass Requested", "Pass Cancelled", "Support", "No Support"].map(s => <MenuItem key={s} value={s}>{t(s)}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <DateRangeUI
                    label={t("Select Date Range")}
                    startDate={fromDate}
                    endDate={toDate}
                    onChange={(start, end) => { setFromDate(start); setToDate(end); setPage(0); }}
                  />

                  <Button onClick={clearFilters} size="small" sx={{ color: "#2563eb", textTransform: "none", fontWeight: 700, ...filterActionSx }}>{t("Clear")}</Button>

                  <Box flexGrow={1} />

                  <Button onClick={handleCSV} size="small" variant="contained" startIcon={<DownloadOutlinedIcon />} sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#16a34a", color: "#fff", height: UI.ctrlH, minHeight: UI.ctrlH, lineHeight: `${UI.ctrlH}px`, borderRadius: 1, ...filterActionSx, "& .MuiSvgIcon-root": { color: "#fff" }, "&:hover": { bgcolor: "#14833e", color: "#fff" } }}>CSV</Button>
                </Box>

                <TableContainer sx={{ flex: 1, minHeight: 0, ...TABLE_SCROLL_SX }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...theadCellSx, width: 60 }}>Sr No.</TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.date_text }}>
                          DATE (yyyy mm dd)
                          <Box className="resizer" onMouseDown={(e) => handleResize("date_text", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.sc }}>
                          S/C
                          <Box className="resizer" onMouseDown={(e) => handleResize("sc", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.stn }}>
                          STN
                          <Box className="resizer" onMouseDown={(e) => handleResize("stn", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx }}>ORBIT</TableCell>
                        <TableCell sx={{ ...theadCellSx }}>Max</TableCell>
                        <TableCell sx={{ ...theadCellSx }}>
                          AOS (hh:mm:ss)
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx }}>
                          LOS (hh:mm:ss)
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.operations }}>
                          OPERATIONS
                          <Box className="resizer" onMouseDown={(e) => handleResize("operations", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, textAlign: "center" }}>Status</TableCell>
                        <TableCell sx={{ ...theadCellSx, textAlign: "center" }}>Post Pass Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleRows.map((r, index) => (
                        <TableRow key={r.id} sx={bodyRowSx}>
                          <TableCell sx={{ ...bodyCellSx, position: "relative" }}>
                            <Box className="hover-accent" sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "0%", opacity: 0, background: `linear-gradient(to bottom, transparent, ${vars.accent}, transparent)`, boxShadow: `0 0 10px ${vars.accent}`, transition: "all 0.3s ease", pointerEvents: "none" }} />
                            {(page * rowsPerPage) + index + 1}
                          </TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.date_text }}>{r.date_text.replace(/-/g, ' ')}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, color: vars.accent, fontWeight: 700, width: colWidths.sc }}>{r.sc}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.stn }}>{r.stn}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.orbit}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.max_ele}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.aos}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.los}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.operations }}>{r.operations}</TableCell>

                          {/* Status Column */}
                          <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                            <StatusBadge
                              status={r.pass_status === "no_support" ? "NO_SUPPORT" : r.pass_status || "Pending"}
                              disabled={!canWrite}
                              onClick={() => handleScheduledToggle(r)}
                            />
                          </TableCell>

                          {/* Post Pass Status Column */}
                          <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                            {(() => {
                              const currentStatus = r.post_pass_status || "Pending";
                              const isCompleted = currentStatus === "Completed";
                              const nextStatus = isCompleted ? "Pending" : "Completed";
                              return (
                                <StatusBadge
                                  status={currentStatus}
                                  disabled={!canWrite}
                                  onClick={() => setPostPassPrompt({ id: r.id, newStatus: nextStatus })}
                                />
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {visibleRows.length === 0 && (
                        <TableRow><TableCell colSpan={12} sx={{ textAlign: "center", py: 4, color: vars.textDim }}>No passes found.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination component="div" count={filteredRows.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[25, 50, 100]} sx={premiumPaginationSx} />
              </Card>
            )}

            {/* Pass Requested Tab */}
            {tab === "requested" && (
              <Card sx={{ position: "relative", overflow: "hidden", bgcolor: vars.bgCard, border: `1px solid ${vars.border}`, borderRadius: "16px", backgroundImage: "none", flex: 1, p: 0, display: "flex", flexDirection: "column" }}>
                {/* Filter Bar */}
                <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: UI.gap }}>
                  <Typography sx={{ fontWeight: 700, color: "#7CA7FF", mr: 2 }}>Pass Requested</Typography>

                  <Labeled label={t("Stations")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={station} onChange={(e) => { setStation(e.target.value); setPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {stationOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Satellites")} width={UI.selectW}>
                    <FormControl size="small" fullWidth>
                      <Select value={satellite} onChange={(e) => { setSatellite(e.target.value); setPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {satOptions.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <Labeled label={t("Status")} width={140}>
                    <FormControl size="small" fullWidth>
                      <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                        {["All", "Pending", "Pass Requested", "Pass Cancelled", "Support", "No Support"].map(s => <MenuItem key={s} value={s}>{t(s)}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Labeled>

                  <DateRangeUI
                    label={t("Select Date Range")}
                    startDate={fromDate}
                    endDate={toDate}
                    onChange={(start, end) => { setFromDate(start); setToDate(end); setPage(0); }}
                  />

                  <Button onClick={clearFilters} size="small" sx={{ color: "#2563eb", textTransform: "none", fontWeight: 700, ...filterActionSx }}>{t("Clear")}</Button>

                  <Box flexGrow={1} />

                  <Button onClick={handleCSV} size="small" variant="contained" startIcon={<DownloadOutlinedIcon />} sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#16a34a", color: "#fff", height: UI.ctrlH, minHeight: UI.ctrlH, lineHeight: `${UI.ctrlH}px`, borderRadius: 1, ...filterActionSx, "& .MuiSvgIcon-root": { color: "#fff" }, "&:hover": { bgcolor: "#14833e", color: "#fff" } }}>CSV</Button>
                </Box>

                <TableContainer sx={{ flex: 1, minHeight: 0, ...TABLE_SCROLL_SX }}>
                  <Table size="small" stickyHeader sx={{ borderCollapse: "collapse", tableLayout: "auto" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...theadCellSx, width: 60 }}>Sr No.</TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.date_text }}>
                          DATE (yyyy mm dd)
                          <Box className="resizer" onMouseDown={(e) => handleResize("date_text", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.sc }}>
                          S/C
                          <Box className="resizer" onMouseDown={(e) => handleResize("sc", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.stn }}>
                          STN
                          <Box className="resizer" onMouseDown={(e) => handleResize("stn", e)} />
                        </TableCell>
                        <TableCell sx={theadCellSx}>ORBIT</TableCell>
                        <TableCell sx={theadCellSx}>Max</TableCell>
                        <TableCell sx={theadCellSx}>
                          AOS (hh:mm:ss)
                        </TableCell>
                        <TableCell sx={theadCellSx}>
                          LOS (hh:mm:ss)
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, width: colWidths.operations }}>
                          OPERATIONS
                          <Box className="resizer" onMouseDown={(e) => handleResize("operations", e)} />
                        </TableCell>
                        <TableCell sx={{ ...theadCellSx, textAlign: "center" }}>Status</TableCell>
                        <TableCell sx={{ ...theadCellSx, textAlign: "center" }}>Post Pass Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleRows.map((r, index) => (
                        <TableRow key={r.id} sx={bodyRowSx}>
                          <TableCell sx={{ ...bodyCellSx, position: "relative" }}>
                            <Box className="hover-accent" sx={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "3px", height: "0%", opacity: 0, background: `linear-gradient(to bottom, transparent, ${vars.accent}, transparent)`, boxShadow: `0 0 10px ${vars.accent}`, transition: "all 0.3s ease", pointerEvents: "none" }} />
                            {(page * rowsPerPage) + index + 1}
                          </TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.date_text }}>{r.date_text.replace(/-/g, ' ')}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, color: vars.accent, fontWeight: 700, width: colWidths.sc }}>{r.sc}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.stn }}>{r.stn}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.orbit}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.max_ele}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.aos}</TableCell>
                          <TableCell sx={bodyCellSx}>{r.los}</TableCell>
                          <TableCell sx={{ ...bodyCellSx, width: colWidths.operations }}>{r.operations}</TableCell>

                          {/* Status Column */}
                          <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                            <StatusBadge
                              status={r.pass_status || "Pending"}
                              disabled={!canWrite}
                              onClick={() => {
                                if (r.pass_status === "pass_requested" || r.pass_status === "requested" || opsHaveSupport(r.operations)) {
                                  setCancelPrompt({ id: r.id, isDraft: false });
                                } else {
                                  setRequestPassPrompt({ id: r.id, isDraft: false });
                                }
                              }}
                            />
                          </TableCell>

                          {/* Post Pass Status Column */}
                          <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                            {(() => {
                              const currentStatus = r.post_pass_status || "Pending";
                              const isCompleted = currentStatus === "Completed";
                              const nextStatus = isCompleted ? "Pending" : "Completed";
                              return (
                                <StatusBadge
                                  status={currentStatus}
                                  disabled={!canWrite}
                                  onClick={() => setPostPassPrompt({ id: r.id, newStatus: nextStatus })}
                                />
                              );
                            })()}
                          </TableCell>
                        </TableRow>
                      ))}
                      {visibleRows.length === 0 && (
                        <TableRow><TableCell colSpan={12} sx={{ textAlign: "center", py: 4, color: vars.textDim }}>No passes found.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination component="div" count={filteredRows.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[25, 50, 100]} sx={premiumPaginationSx} />
              </Card>
            )}
          </Box>
        </Card>
      </Box>
    </MainLayout>
  );
} 
