// src/pages/Documents.tsx
import React from "react";
import {
  Box,
  Card,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Button,
  TablePagination,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Divider,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MainLayout from "../layouts/MainLayout";
import { api, BASE_URL, getAuthToken } from "../api/http";
import { useAuth } from "../auth";
import { useI18n } from "../i18n"; // <-- i18n
import { useActionAccess } from "../auth/useActionAccess";

/* --- Modals --- */
import UpdateDocumentModal from "../components/Models/UpdateDocumentModal";
import UpdatePassModal from "../components/Models/UpdatePass_schedule_Modal";
import type { DocumentRow as DocModalRow } from "../components/Models/UpdateDocumentModal";
import type { PassRow as PassModalRow } from "../components/Models/UpdatePass_schedule_Modal";

/* =========================================================
   Robust mode detection
========================================================= */
function readCssColorVar(name: string, fallback = "#000") {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.body).getPropertyValue(name).trim();
  return raw || fallback;
}
function isLightFromCss() {
  const c = readCssColorVar("--bg-card", "#1C1C1E").toLowerCase();
  let r = 28, g = 28, b = 30;
  if (c.startsWith("#")) {
    const n = c.length === 4 ? c.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : c;
    r = parseInt(n.slice(1, 3), 16);
    g = parseInt(n.slice(3, 5), 16);
    b = parseInt(n.slice(5, 7), 16);
  } else if (c.startsWith("rgb")) {
    const m = c.match(/rgb[a]?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
    if (m) { r = +m[1]; g = +m[2]; b = +m[3]; }
  }
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L > 0.5;
}
function getMode(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  if (document.body.classList.contains("theme-light")) return "light";
  if (document.body.classList.contains("theme-dark")) return "dark";
  return isLightFromCss() ? "light" : "dark";
}
function useMode() {
  const [mode, setMode] = React.useState<"dark" | "light">(getMode());
  React.useEffect(() => {
    const onEvt = () => setMode(getMode());
    window.addEventListener("pmgt:theme-changed", onEvt as EventListener);
    const mo = new MutationObserver(() => setMode(getMode()));
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    const id = requestAnimationFrame(() => setMode(getMode()));
    return () => {
      window.removeEventListener("pmgt:theme-changed", onEvt as EventListener);
      mo.disconnect();
      cancelAnimationFrame(id);
    };
  }, []);
  return mode;
}

/* =========================================================
   Sizing tokens (unchanged)
========================================================= */
const UI = {
  ctrlH: 36,
  font: 13,
  icon: 16,
  gap: 0.75,
  headerPx: 1.25,
  headerPy: 0.6,
  searchW: 260,
  paginationH: 36,
};

/* =========================================================
   Style generator — keeps dark EXACT, adds light safely
========================================================= */
function makeSx(mode: "dark" | "light") {
  const C =
    mode === "light"
      ? {
          CARD: "#FFFFFF",
          CTRL: "#FFFFFF",
          TEXT: "#0B1115",
          TEXT_DIM: "rgba(11,17,21,0.75)",
          ICON: "rgba(11,17,21,0.80)",
          BORDER: "rgba(0,0,0,0.12)",
          BORDER_WEAK: "rgba(0,0,0,0.10)",
          HEADER_BG: "#464B4E",
          HEADER_TEXT: "#FFFFFF",
          HOVER: "rgba(0,0,0,0.035)",
          SCROLL: "#c7c7c7",
        }
      : {
          CARD: "#1C1C1E",
          CTRL: "#1C1C1E",
          TEXT: "#E8E8EA",
          TEXT_DIM: "rgba(232,232,234,0.72)",
          ICON: "rgba(255,255,255,0.90)",
          BORDER: "rgba(255,255,255,0.14)",
          BORDER_WEAK: "rgba(255,255,255,0.10)",
          HEADER_BG: "#000000",
          HEADER_TEXT: "#FFFFFF",
          HOVER: "rgba(255,255,255,0.06)",
          SCROLL: "#3f3f3f",
        };

  const CARD_SX = {
    bgcolor: C.CARD,
    color: C.TEXT,
    border: `1px solid ${C.BORDER}`,
    borderRadius: 2,
    height: "calc(100vh - 90px)",
    display: "flex",
    flexDirection: "column" as const,
    boxShadow: "none",
    backgroundImage: "none",
  } as const;

  const SCROLLER_SX = {
    scrollbarWidth: "thin",
    scrollbarColor: `${C.SCROLL} transparent`,
    "&::-webkit-scrollbar": { width: 8, height: 8 },
    "&::-webkit-scrollbar-thumb": { background: C.SCROLL, borderRadius: 8 },
    "&::-webkit-scrollbar-thumb:hover": { background: C.SCROLL },
    "&::-webkit-scrollbar-track": { background: "transparent" },
  };

  const compactCtrlSx = {
    bgcolor: C.CTRL,
    borderRadius: 1,
    color: C.TEXT,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: C.BORDER },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: C.BORDER },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: C.BORDER },
    "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: C.TEXT, alignItems: "center" },
    "& .MuiInputBase-input": { height: `${UI.ctrlH - 2}px`, padding: "0 12px", fontSize: UI.font, lineHeight: 1, color: C.TEXT },
    "& .MuiSelect-select": { display: "flex", alignItems: "center", height: `${UI.ctrlH - 2}px`, padding: "0 12px" },
    "& .MuiInputBase-input::placeholder": { color: C.TEXT_DIM, opacity: 1 },
    "& .MuiSvgIcon-root": { fontSize: UI.icon, color: C.ICON },
  };

  const PRIMARY_BTN_SX = {
    textTransform: "none",
    fontWeight: 600,
    px: 1.4,
    py: 0.6,
    borderRadius: 1,
    bgcolor: "#7C57F2",
    color: "#fff",
    "& .MuiSvgIcon-root": { color: "#fff" },
    "&:hover": { bgcolor: "#5732d3ff" },
    "&.Mui-disabled": {
      bgcolor: mode === "light" ? "#E0E0E0" : "#2f2f33",
      color: mode === "light" ? "#000000" : "#b5b7bd",
      border: `1px solid ${C.BORDER}`,
      boxShadow: "none",
      opacity: 1,
      "& .MuiSvgIcon-root": { color: mode === "light" ? "#000000" : "#b5b7bd" },
    },
  } as const;

  const OUTLINED_BTN_SX = {
    textTransform: "none",
    fontWeight: 700,
    px: 1.4,
    py: 0.6,
    borderRadius: 1,
    bgcolor: "transparent",
    color: C.TEXT,
    border: `1px solid ${C.BORDER}`,
    "& .MuiSvgIcon-root": { color: C.ICON },
    "&:hover": { bgcolor: C.HOVER, borderColor: C.BORDER },
  } as const;

  const toggleBtnSx = {
    textTransform: "none",
    fontWeight: 700,
    fontSize: 13,
    px: 2,
    height: 32,
    lineHeight: "32px",
    borderRadius: 999,
    color: C.TEXT_DIM,
    "&.Mui-selected": {
      color: mode === "light" ? "#6941F5" : "#7CFF8D",
      bgcolor: C.CARD,
      border: `1px solid ${C.BORDER}`,
      boxShadow: `inset 0 0 0 1px ${C.BORDER_WEAK}`,
    },
  };

  const darkMenu = {
    PaperProps: {
      sx: {
        bgcolor: C.CARD,
        color: C.TEXT,
        border: `1px solid ${C.BORDER}`,
        "& .MuiMenuItem-root.Mui-selected": { bgcolor: C.HOVER },
        "& .MuiMenuItem-root:hover": { bgcolor: C.HOVER },
      },
    },
  };

  const paginationSx = {
    px: 1,
    color: C.TEXT,
    minHeight: UI.paginationH,
    "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: UI.font, m: 0, color: C.TEXT_DIM },
    "& .MuiTablePagination-input": { fontSize: UI.font, m: 0, color: C.TEXT },
    "& .MuiSelect-select": {
      py: 0,
      px: 1,
      fontSize: UI.font,
      height: UI.ctrlH - 6,
      display: "flex",
      alignItems: "center",
      bgcolor: C.CTRL,
      borderRadius: 1,
    },
    "& .MuiIconButton-root": { p: 0.25 },
    ".MuiSvgIcon-root": { color: C.ICON, fontSize: UI.icon },
  };

  return { C, CARD_SX, SCROLLER_SX, compactCtrlSx, PRIMARY_BTN_SX, OUTLINED_BTN_SX, toggleBtnSx, darkMenu, paginationSx };
}

/* ---------- Data ---------- */
const DOC_TYPES = [
  "License report",
  "Satellite report",
  "Passes report",
  "Project plan",
  "Flow chart",
  "Design Document",
  "User manual",
  "Other",
] as const;

type DocumentRow = { id: number; sr: number; name: string; type: string; remarks: string; url: string };

type Column = {
  key: keyof DocumentRow | "download" | "action";
  label: string;
  width?: number;
  min?: number;
  flex?: number;
  align?: "left" | "center" | "right";
};

/* ---------- Table ---------- */
function DarkDocsTable({
  rows,
  columns,
  onDownload,
  onUpdate,
  mode,
  C,
}: {
  rows: DocumentRow[];
  columns: Column[];
  onDownload: (r: DocumentRow) => void;
  onUpdate: (r: DocumentRow) => void;
  mode: "dark" | "light";
  C: ReturnType<typeof makeSx>["C"];
}) {
  const totalMinW = columns.reduce((acc, c) => acc + (c.width ?? c.min ?? 120), 0) + 16;
  const template = columns
    .map((c) => (c.width != null ? `${c.width}px` : `minmax(${c.min ?? 120}px, ${c.flex ?? 1}fr)`))
    .join(" ");

  const headerCellSx = { px: 0.75, py: 0.75, fontWeight: 700, fontSize: 13, color: C.HEADER_TEXT, whiteSpace: "nowrap" as const };
  const bodyCellSx   = { px: 0.75, py: 0.75, fontSize: 13, color: mode === "light" ? C.TEXT : "#EAEAEA", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" };

  return (
    <Box>
      <Box sx={{ width: totalMinW, minWidth: "100%" }}>
        {/* sticky header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: template,
            bgcolor: C.HEADER_BG,
            borderBottom: `1px solid ${C.BORDER}`,
          }}
        >
          {columns.map((c) => (
            <Box key={String(c.key)} sx={{ ...headerCellSx, textAlign: c.align ?? "center" }}>
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
              gridTemplateColumns: template,
              borderBottom: `1px solid ${C.BORDER_WEAK}`,
              bgcolor: "transparent",
            }}
          >
            {columns.map((c) => {
              if (c.key === "download") {
                return (
                  <Box key={`dl-${idx}`} sx={{ ...bodyCellSx, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <IconButton size="small" onClick={() => onDownload(r)} sx={{ color: C.ICON, "&:hover": { color: C.TEXT } }} aria-label="download">
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                );
              }
            if (c.key === "action") {
  return (
    <Box
      key={`act-${idx}`}
      sx={{ ...bodyCellSx, display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      {onUpdate && (
        <Button
          size="small"
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            fontSize: 12,
            px: 1.1,
            bgcolor: "#7C57F2",
            "&:hover": { bgcolor: "#6b48ea" },
          }}
          onClick={() => onUpdate(r)}
        >
          Edit
        </Button>
      )}
    </Box>
  );
}


              return (
                <Box key={String(c.key)} sx={{ ...bodyCellSx, textAlign: c.align ?? "center" }} title={String(r[c.key as keyof DocumentRow] ?? "")}>
                  {r[c.key as keyof DocumentRow] as any}
                </Box>
              );
            })}
          </Box>
        ))}

        {rows.length === 0 && (
          <Box sx={{ px: 1.25, py: 2, color: mode === "light" ? C.TEXT_DIM : "#aaa", textAlign: "center" }}>
            {/* i18n handled by caller: pass translated message in columns/labels or use placeholder here */}
            No rows to show yet.
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ---------------- CAPTCHA (same behavior as Requests/Issues) ---------------- */
type Captcha = { text: string; svg: string };
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = (chars: string, n: number) => {
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};
function makeCaptcha(width = 220, height = 80, length = 5): Captcha {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const text = pick(alphabet, length);
  const charW = width / (length + 1);
  const chars = [...text]
    .map((ch, i) => {
      const x = (i + 1) * charW + rand(-6, 6);
      const y = height / 2 + rand(-5, 5);
      const r = rand(-24, 24);
      const fontSize = rand(30, 38);
      return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="700" text-anchor="middle"
               dominant-baseline="middle" transform="rotate(${r} ${x} ${y})">${ch}</text>`;
    })
    .join("");
  const lines = Array.from({ length: 4 })
    .map(() => {
      const x1 = rand(0, width),
        y1 = rand(0, height),
        x2 = rand(0, width),
        y2 = rand(0, height);
      const op = rand(0.25, 0.45).toFixed(2);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="${op}" stroke-width="${rand(
        1,
        2
      )}"/>`;
    })
    .join("");
  const dots = Array.from({ length: 35 })
    .map(() => {
      const x = rand(0, width),
        y = rand(0, height);
      const op = rand(0.15, 0.35).toFixed(2);
      return `<circle cx="${x}" cy="${y}" r="${rand(0.8, 2.2)}" fill="white" fill-opacity="${op}"/>`;
    })
    .join("");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="wavy">
      <feTurbulence type="fractalNoise" baseFrequency="${rand(0.9, 1.3) / 100}" numOctaves="2" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${rand(8, 14)}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#1a1a1d"/>
      <stop offset="100%" stop-color="#121214"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g filter="url(#wavy)" fill="#e7e7ff">${chars}</g>
  <g>${lines}${dots}</g>
</svg>`.trim();
  return { text, svg };
}
const svgDataUrl = (svg: string) => "data:image/svg+xml;utf8," + encodeURIComponent(svg);

function CaptchaDialog({
  open,
  onCancel,
  onOk,
  colors,
  t, // <-- pass translator in
}: {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
  colors: { card: string; text: string; border: string; ctrl: string };
  t: (k: string) => string;
}) {
  const [cap, setCap] = React.useState<Captcha>(() => makeCaptcha());
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState("");

  const refresh = () => {
    setCap(makeCaptcha());
    setInput("");
    setError("");
  };
  const submit = () => {
    if (input.trim().toLowerCase() === cap.text.toLowerCase()) onOk();
    else {
      setError(t("Incorrect code. Try again."));
      refresh();
    }
  };
  React.useEffect(() => {
    if (open) refresh();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { bgcolor: colors.card, color: colors.text, border: `1px solid ${colors.border}` } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1 }}>
          <img
            src={svgDataUrl(cap.svg)}
            alt="captcha"
            style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${colors.border}` }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Type the letters")}
              size="small"
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": { height: 36, background: colors.ctrl },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: colors.border },
                "& .MuiInputBase-input": { color: colors.text },
              }}
            />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: colors.border }}>
              {t("Refresh")}
            </Button>
          </Box>
          {error && <Box sx={{ color: "#f87171", fontSize: 12, mt: 0.25 }}>{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { filter: "brightness(0.95)" } }}
        >
          {t("Verify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
/* ---------------- end CAPTCHA ---------------- */

/* ---------- Page ---------- */
export default function DocumentsPage() {
  const { t } = useI18n(); // <-- i18n
  const mode = useMode();
  const { C, CARD_SX, SCROLLER_SX, compactCtrlSx, PRIMARY_BTN_SX, OUTLINED_BTN_SX, toggleBtnSx, darkMenu, paginationSx } =
    React.useMemo(() => makeSx(mode), [mode]);

  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");
  const { isEditor } = useActionAccess();


  const [tab, setTab] = React.useState<"docs" | "pass">("docs");
  const [docTypeFilter, setDocTypeFilter] = React.useState<string>("");
  const [docsSearch, setDocsSearch] = React.useState("");
  const [passSearch, setPassSearch] = React.useState("");

  const [uploadType, setUploadType] = React.useState<string>("");
  const [uploadRemarks, setUploadRemarks] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  const [passRemarks, setPassRemarks] = React.useState("");
  const [passFile, setPassFile] = React.useState<File | null>(null);

  const [docRows, setDocRows] = React.useState<DocumentRow[]>([]);
  const [passRows, setPassRows] = React.useState<DocumentRow[]>([]);

  const [docsPage, setDocsPage] = React.useState(0);
  const [docsRpp, setDocsRpp] = React.useState(10);
  const [passPage, setPassPage] = React.useState(0);
  const [passRpp, setPassRpp] = React.useState(10);

  const [editDoc, setEditDoc] = React.useState<DocModalRow | null>(null);
  const [editPass, setEditPass] = React.useState<PassModalRow | null>(null);

  // CAPTCHA state
  const [captchaDocOpen, setCaptchaDocOpen] = React.useState(false);
  const [captchaPassOpen, setCaptchaPassOpen] = React.useState(false);

  const handleFilePickDocs = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null);
  const handleFilePickPass = (e: React.ChangeEvent<HTMLInputElement>) => setPassFile(e.target.files?.[0] ?? null);
  const clearDocsFile = () => { setFile(null); const el = document.getElementById("doc-file-input") as HTMLInputElement | null; if (el) el.value = ""; };
  const clearPassFile = () => { setPassFile(null); const el = document.getElementById("pass-file-input") as HTMLInputElement | null; if (el) el.value = ""; };

  const refreshDocs = React.useCallback(async () => {
    try {
      const data = await api.get<any[]>(DOCUMENTS_API);
      const mapped: DocumentRow[] = (data || []).map((row: any, i: number) => ({
        id: row.id, sr: i + 1, name: row.document_name, type: row.doc_type, remarks: row.remarks || "", url: `${DOCUMENTS_API}/${row.id}/download`,
      }));
      setDocRows(mapped);
    } catch (e) { console.error("Fetch documents failed:", e); }
  }, []);

  const refreshPass = React.useCallback(async () => {
    try {
      const data = await api.get<any[]>(PASS_API);
      const mapped: DocumentRow[] = (data || []).map((row: any, i: number) => ({
        id: row.id, sr: i + 1, name: row.document_name, type: "", remarks: row.remarks || "", url: `${PASS_API}/${row.id}/download`,
      }));
      setPassRows(mapped);
    } catch (e) { console.error("Fetch passes failed:", e); }
  }, []);

  React.useEffect(() => { refreshDocs(); refreshPass(); }, [refreshDocs, refreshPass]);

  const canUploadDoc = !!file && !!uploadType;
  const canUploadPass = isAdmin && !!passFile;

  // --- Upload actions (gated) ---
  const doUploadDoc = async () => {
    if (!canUploadDoc || !file) return;
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("doc_type", uploadType);
      if (uploadRemarks.trim()) form.append("remarks", uploadRemarks.trim());
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}${DOCUMENTS_API}`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      await refreshDocs();
      clearDocsFile();
      setUploadType("");
      setUploadRemarks("");
    } catch (e: any) { console.error(e); alert(e.message || "Failed to upload document"); }
  };
  const doUploadPass = async () => {
    if (!isAdmin) { alert("Only admins can upload the passes schedule."); return; }
    if (!canUploadPass || !passFile) return;
    try {
      const form = new FormData();
      form.append("file", passFile);
      if (passRemarks.trim()) form.append("remarks", passRemarks.trim());
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}${PASS_API}`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      await refreshPass();
      clearPassFile();
      setPassRemarks("");
    } catch (e: any) { console.error(e); alert(e.message || "Failed to upload pass schedule file"); }
  };

  // Gate openers
  const openDocCaptcha = () => {
    if (!canUploadDoc) return;
    setCaptchaDocOpen(true);
  };
  const openPassCaptcha = () => {
    if (!canUploadPass) return;
    setCaptchaPassOpen(true);
  };

  const docsFiltered = React.useMemo(() => {
    const q = docsSearch.trim().toLowerCase();
    return docRows.filter((r) => {
      const matchesType = !docTypeFilter || r.type === docTypeFilter;
      if (!q) return matchesType;
      const hay = [r.name, r.type, r.remarks].join(" ").toLowerCase();
      return matchesType && hay.includes(q);
    });
  }, [docRows, docsSearch, docTypeFilter]);

  const passFiltered = React.useMemo(() => {
    const q = passSearch.trim().toLowerCase();
    return passRows.filter((r) => {
      if (!q) return true;
      const hay = [r.name, r.remarks].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [passRows, passSearch]);

  const docsPaged = React.useMemo(() => docsFiltered.slice(docsPage * docsRpp, docsPage * docsRpp + docsRpp), [docsFiltered, docsPage, docsRpp]);
  const passPaged = React.useMemo(() => passFiltered.slice(passPage * passRpp, passPage * passRpp + passRpp), [passFiltered, passPage, passRpp]);

  const onDownload = async (r: DocumentRow) => { try { await downloadFrom(r.url, r.name); } catch (e: any) { console.error(e); alert(e.message || "Download failed"); } };
  const handleTab = (_e: React.MouseEvent<HTMLElement>, next: "docs" | "pass" | null) => { if (next) setTab(next); };

  // Build i18n’d column labels here (so they react to language changes)
  const DOC_COLUMNS: Column[] = React.useMemo(() => {
  const cols: Column[] = [
    { key: "sr", label: t("Sr No"), width: 60, align: "center" },
    { key: "name", label: t("Document"), min: 220, flex: 1.4, align: "left" },
    { key: "type", label: t("Doc Type"), min: 140, flex: 1.0, align: "center" },
    { key: "remarks", label: t("Remarks"), min: 200, flex: 1.2, align: "left" },
    { key: "download", label: t("Download"), width: 80, align: "center" },
  ];

  if (isEditor) {
    cols.push({ key: "action", label: t("Action"), width: 110, align: "center" });
  }

  return cols;
}, [t, isEditor]);


 const PASS_COLUMNS: Column[] = React.useMemo(() => {
  const cols: Column[] = [
    { key: "sr", label: t("Sr No"), width: 60, align: "center" },
    { key: "name", label: t("Document"), min: 260, flex: 1.5, align: "left" },
    { key: "remarks", label: t("Remarks"), min: 220, flex: 1.2, align: "left" },
    { key: "download", label: t("Download"), width: 80, align: "center" },
  ];

  if (isEditor) {
    cols.push({ key: "action", label: t("Action"), width: 110, align: "center" });
  }

  return cols;
}, [t, isEditor]);


  return (
    <MainLayout title=" ">
      <Box sx={{ p: 2 }}>
        <Card elevation={0} sx={CARD_SX}>
          {/* Header */}
          <Box
            sx={{
              px: UI.headerPx,
              py: UI.headerPy,
              borderBottom: `1px solid ${C.BORDER}`,
              display: "grid",
              alignItems: "center",
              gridTemplateColumns: "auto 1fr auto auto",
              columnGap: UI.gap,
              bgcolor: "transparent",
            }}
          >
            <ToggleButtonGroup
              value={tab}
              exclusive
              onChange={handleTab}
              sx={{
                p: 0.5,
                borderRadius: 999,
                border: `1px solid ${C.BORDER}`,
                bgcolor: "transparent",
                "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
              }}
            >
              <ToggleButton value="docs" disableRipple sx={toggleBtnSx}>{t("Documents")}</ToggleButton>
              <ToggleButton value="pass" disableRipple sx={toggleBtnSx}>{t("Passes Schedule")}</ToggleButton>
            </ToggleButtonGroup>

            <Box />

            {tab === "docs" ? (
              <>
                <FormControl size="small" sx={{ minWidth: 160, ...compactCtrlSx }}>
                  <Select
                    value={docTypeFilter}
                    onChange={(e) => { setDocTypeFilter(String(e.target.value)); setDocsPage(0); }}
                    displayEmpty
                    renderValue={(v) => (v ? String(v) : t("Select Type"))}
                    sx={{ "& .MuiOutlinedInput-input": { pl: 1 }, "& .MuiSelect-select": { textAlign: "left" } }}
                    MenuProps={darkMenu}
                  >
                    <MenuItem value="">{t("Select Type")}</MenuItem>
                    {DOC_TYPES.map((d) => (<MenuItem key={d} value={d}>{t(d)}</MenuItem>))}
                  </Select>
                </FormControl>

                <TextField
                  value={docsSearch}
                  onChange={(e) => { setDocsSearch(e.target.value); setDocsPage(0); }}
                  placeholder={t("Search…")}
                  size="small"
                  sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                  InputProps={{ startAdornment: (<InputAdornment position="start" sx={{ mr: 0.25 }}><SearchIcon sx={{ fontSize: UI.icon, color: C.ICON }} /></InputAdornment>) }}
                />
              </>
            ) : (
              <>
                <TextField
                  value={passSearch}
                  onChange={(e) => { setPassSearch(e.target.value); setPassPage(0); }}
                  placeholder={t("Search…")}
                  size="small"
                  sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                  InputProps={{ startAdornment: (<InputAdornment position="start" sx={{ mr: 0.25 }}><SearchIcon sx={{ fontSize: UI.icon, color: C.ICON }} /></InputAdornment>) }}
                />
              </>
            )}
          </Box>

          {/* Upload rows */}
          {tab === "docs" && isEditor ? (
  <>
    <Box
      sx={{
        px: 1.25,
        py: 1,
        display: "grid",
        gridTemplateColumns: "auto 160px 240px auto auto auto",
        alignItems: "center",
        gap: 1,
      }}
    >

                <Typography sx={{ fontWeight: 600, fontSize: 18, color: C.TEXT }}>{t("Upload Documents")}</Typography>

                <FormControl size="small" sx={{ minWidth: 160, ...compactCtrlSx }}>
                  <Select
                    value={uploadType}
                    onChange={(e) => setUploadType(String(e.target.value))}
                    displayEmpty
                    renderValue={(v) => (v ? String(v) : t("Select Type"))}
                    sx={{ "& .MuiOutlinedInput-input": { pl: 1 }, "& .MuiSelect-select": { textAlign: "left" } }}
                    MenuProps={darkMenu}
                  >
                    <MenuItem value="">{t("Select Type")}</MenuItem>
                    {[
                      "License report","Satellite report","Passes report","Project plan","Flow chart","Design Document","User manual","Other",
                    ].map((d) => (<MenuItem key={d} value={d}>{t(d)}</MenuItem>))}
                  </Select>
                </FormControl>

                <TextField
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                  placeholder={t("Remarks")}
                  size="small"
                  sx={{ ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                />

                <Box>
                  <input id="doc-file-input" type="file" style={{ display: "none" }} onChange={handleFilePickDocs} />
                  <label htmlFor="doc-file-input">
                    <Button component="span" sx={OUTLINED_BTN_SX}>{t("Select File")}</Button>
                  </label>
                </Box>

                <Box sx={{ minHeight: UI.ctrlH, display: "flex", alignItems: "center" }}>
                  {file ? (
                    <Chip
                      variant="outlined"
                      color="default"
                      onDelete={clearDocsFile}
                      deleteIcon={<CloseRoundedIcon sx={{ color: mode === "light" ? "#888" : "#bbb" }} />}
                      label={file.name}
                      title={file.name}
                      sx={{
                        borderColor: C.BORDER,
                        color: C.TEXT,
                        bgcolor: "transparent",
                        width: 120,
                        "& .MuiChip-label": { width: 120, overflow: "hidden", textOverflow: "ellipsis" },
                      }}
                    />
                  ) : null}
                </Box>

                {/* Gate with CAPTCHA */}
                <Button onClick={openDocCaptcha} disabled={!canUploadDoc} startIcon={<CloudUploadIcon />} sx={PRIMARY_BTN_SX}>
                  {t("Upload")}
                </Button>
              </Box>
              <Divider sx={{ borderColor: C.BORDER }} />
            </>
          ) : (
            <>
              {isAdmin && (
                <>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 1,
                      display: "grid",
                      gridTemplateColumns: "auto auto auto 1fr auto",
                      alignItems: "center",
                      gap: 1,
                      bgcolor: "transparent",
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 18, color: C.TEXT }}>{t("Passes Schedule")}</Typography>

                    <Box>
                      <input id="pass-file-input" type="file" style={{ display: "none" }} onChange={handleFilePickPass} />
                      <label htmlFor="pass-file-input">
                        <Button component="span" sx={OUTLINED_BTN_SX}>{t("Select File")}</Button>
                      </label>
                    </Box>

                    <Box sx={{ minHeight: UI.ctrlH, display: "flex", alignItems: "center" }}>
                      {passFile ? (
                        <Chip
                          variant="outlined"
                          color="default"
                          onDelete={clearPassFile}
                          deleteIcon={<CloseRoundedIcon sx={{ color: mode === "light" ? "#888" : "#bbb" }} />}
                          label={passFile.name}
                          title={passFile.name}
                          sx={{
                            borderColor: C.BORDER,
                            color: C.TEXT,
                            bgcolor: "transparent",
                            width: 120,
                            "& .MuiChip-label": { width: 120, overflow: "hidden", textOverflow: "ellipsis" },
                          }}
                        />
                      ) : null}
                    </Box>

                    <TextField
                      value={passRemarks}
                      onChange={(e) => setPassRemarks(e.target.value)}
                      placeholder={t("Remarks")}
                      size="small"
                      sx={{ ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                    />

                    {/* Gate with CAPTCHA */}
                    <Button onClick={openPassCaptcha} disabled={!canUploadPass} startIcon={<CloudUploadIcon />} sx={PRIMARY_BTN_SX}>
                      {t("Upload")}
                    </Button>
                  </Box>
                  <Divider sx={{ borderColor: C.BORDER }} />
                </>
              )}
            </>
          )}

          {/* Body scroller */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5, bgcolor: "transparent" }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden", bgcolor: "transparent" }}>
              <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX, bgcolor: "transparent" }}>
                {tab === "docs" ? (
                  <DarkDocsTable
  rows={docsPaged}
  columns={DOC_COLUMNS}
  onDownload={onDownload}
  onUpdate={
    isEditor
      ? (r) => setEditDoc({ id: r.id, name: r.name, type: r.type, remarks: r.remarks })
      : () => {}
  }
  mode={mode}
  C={C}
/>

                ) : (
                  <DarkDocsTable
  rows={passPaged}
  columns={PASS_COLUMNS}
  onDownload={onDownload}
  onUpdate={
    isEditor
      ? (r) => setEditPass({ id: r.id, name: r.name, remarks: r.remarks })
      : () => {}
  }
  mode={mode}
  C={C}
/>

                )}
              </Box>
            </Box>
          </Box>

          {/* Pagination */}
          <Box sx={{ borderTop: `1px solid ${C.BORDER}`, bgcolor: "transparent" }}>
            {tab === "docs" ? (
              <TablePagination
                component="div"
                count={docsFiltered.length}
                page={docsPage}
                onPageChange={(_, p) => setDocsPage(p)}
                rowsPerPage={docsRpp}
                onRowsPerPageChange={(e) => { setDocsRpp(parseInt(e.target.value, 10)); setDocsPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={paginationSx}
              />
            ) : (
              <TablePagination
                component="div"
                count={passFiltered.length}
                page={passPage}
                onPageChange={(_, p) => setPassPage(p)}
                rowsPerPage={passRpp}
                onRowsPerPageChange={(e) => { setPassRpp(parseInt(e.target.value, 10)); setPassPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={paginationSx}
              />
            )}
          </Box>
        </Card>
      </Box>

      {/* Modals */}
      <UpdateDocumentModal open={!!editDoc} row={editDoc} onClose={() => setEditDoc(null)} onSuccess={refreshDocs} />
      <UpdatePassModal open={!!editPass} row={editPass} onClose={() => setEditPass(null)} onSuccess={refreshPass} />

      {/* CAPTCHA dialogs gating both uploads */}
      <CaptchaDialog
        open={captchaDocOpen}
        onCancel={() => setCaptchaDocOpen(false)}
        onOk={async () => {
          setCaptchaDocOpen(false);
          await doUploadDoc();
        }}
        colors={{ card: C.CARD, text: C.TEXT, border: C.BORDER, ctrl: C.CTRL }}
        t={t}
      />
      <CaptchaDialog
        open={captchaPassOpen}
        onCancel={() => setCaptchaPassOpen(false)}
        onOk={async () => {
          setCaptchaPassOpen(false);
          await doUploadPass();
        }}
        colors={{ card: C.CARD, text: C.TEXT, border: C.BORDER, ctrl: C.CTRL }}
        t={t}
      />
    </MainLayout>
  );
}

/* ---------- API endpoints ---------- */
const DOCUMENTS_API = `/api/documents`;
const PASS_API = `/api/pass-schedule`;

/* ---------- Download helper ---------- */
async function downloadFrom(pathOrUrl: string, filename: string) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
  const token = getAuthToken();
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);
  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}
