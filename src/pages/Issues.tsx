// src/pages/Issues/index.tsx
import * as React from "react";
import {
  Box,
  Card,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TablePagination,
  Typography,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { api } from "../api/http";
import { useI18n } from "../i18n";

/* ---------- THEME TOKENS (CSS vars) ---------- */
const TEXT = "var(--text)";
const TEXT_DIM = "var(--text-dim)";
const CARD_BG = "var(--bg-card)";
const CONTROL_BG = "var(--bg-ctrl)";
const HOVER_BG = "var(--bg-hover)";
const BORDER_STR = "1px solid var(--border)";
const BORDER_WEAK = "var(--border-weak)";
const ACCENT = "var(--accent)";
const SCROLLBAR = "var(--scrollbar)";

/* ---------- Card + local header vars (match Requests) ---------- */
const CARD_SX = {
  bgcolor: CARD_BG,
  color: TEXT,
  border: BORDER_STR,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
  boxShadow: "none",
  backgroundImage: "none",

  // table/list header + zebra stripe
  "--issues-thead-bg": "#000000",
  "--issues-thead-text": "#ffffff",
  "--row-stripe": "rgba(255,255,255,0.06)",

  ".theme-dark &": {
    "--issues-thead-bg": "#000000",
    "--issues-thead-text": "#ffffff",
    "--row-stripe": "rgba(255,255,255,0.06)",
  },
  ".theme-light &": {
    "--issues-thead-bg": "#464B4E",
    "--issues-thead-text": "#ffffff",
    "--row-stripe": "rgba(0,0,0,0.035)",
  },
} as const;

/* ---------- Scroller ---------- */
const SCROLLER_SX = {
  scrollbarWidth: "thin",
  scrollbarColor: `${SCROLLBAR} transparent`,
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: SCROLLBAR, borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: SCROLLBAR },
  "&::-webkit-scrollbar-track": { background: "transparent" },
};

/* ---------- Compact input (keep sizes) ---------- */
const controlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: TEXT,

  "& .MuiOutlinedInput-notchedOutline": { borderColor: BORDER_WEAK },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "var(--border)",
  },

  /* ↓ compact field */
  "& .MuiOutlinedInput-root": {
    alignItems: "center",
    backgroundColor: CONTROL_BG,
    height: 26, // was 30
  },

  /* ↓ inner paddings & text size */
  "& .MuiInputBase-input": {
    color: TEXT,
    fontSize: 12, // was 13
    lineHeight: 2.45,
    padding: "3px 10px",
    height: "auto",
  },

  /* ↓ Select’s slot */
  "& .MuiSelect-select": {
    paddingTop: "3px !important",
    paddingBottom: "3px !important",
    paddingLeft: "10px",
    paddingRight: "32px",
    minHeight: 0,
    lineHeight: 1.25,
  },
} as const;

/* ---------- Field interior fill: dark = #232325, light = white ---------- */
const fillField = {
  /* dark theme / default */
  "& .MuiOutlinedInput-root": { backgroundColor: "#232325" },
  "& .MuiOutlinedInput-root.Mui-focused": { backgroundColor: "#232325" },
  "& .MuiSelect-select": { backgroundColor: "#232325" },
  "& .MuiInputBase-multiline": { backgroundColor: "#232325" },

  /* light theme overrides -> inputs are white */
  ".theme-light & .MuiOutlinedInput-root": { backgroundColor: "#ffffff" },
  ".theme-light & .MuiOutlinedInput-root.Mui-focused": { backgroundColor: "#ffffff" },
  ".theme-light & .MuiSelect-select": { backgroundColor: "#ffffff" },
  ".theme-light & .MuiInputBase-multiline": { backgroundColor: "#ffffff" },
} as const;

/* ---------- Menus (dark vs light) ---------- */
const selectMenu = {
  PaperProps: {
    sx: {
      bgcolor: CONTROL_BG,
      color: TEXT,
      border: BORDER_STR,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: HOVER_BG },
      "& .MuiMenuItem-root:hover": { bgcolor: HOVER_BG },

      /* light theme paper */
      ".theme-light &": {
        bgcolor: "#fff",
        color: "var(--text)",
        "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(0,0,0,0.06)" },
        "& .MuiMenuItem-root:hover": { bgcolor: "rgba(0,0,0,0.04)" },
      },
    },
  },
};

const LABEL_SX = { fontSize: 12, fontWeight: 600, color: TEXT_DIM, mb: 0.5, lineHeight: 1.2 } as const;
// const VALUE_SX = { fontSize: 13, fontWeight: 700, color: TEXT, ml: 0.25, mt: 0.25, lineHeight: 1.4 } as const;

const UI = {
  headerPx: 1.25,
  headerPy: 0.55, // was 0.6
  font: 12.5, // was 13
  icon: 15, // was 16
  searchW: 260,
  paginationH: 34, // was 36
};

/* ---------- Status options ---------- */
const ISSUE_STATUS_OPTIONS = ["In Review", "In Progress", "On Hold", "Done", "Cancelled"] as const;
type IssueStatus = "Submitted" | (typeof ISSUE_STATUS_OPTIONS)[number];

/* ---------- Types ---------- */
type IssueRow = {
  id: number;
  sr: number;
  ticketNo: string;
  user: string;
  reportTo: string;
  categories: string[];
  priority: "P1" | "P2" | "P3";
  status: IssueStatus;
  description: string;
  remarks?: string;
  createdAt: string;
  targetUserId: string;
  canUpdate?: boolean;
  attachmentsCount?: number;
};

type Column = {
  key: keyof IssueRow | "files" | "action";
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
};

type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
type Category = { id: number; name: string };

/* ---------- Helpers ---------- */
function getStoredUser(): {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  full_name?: string;
} {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
const displayName = (u: BasicUser) => u.full_name || u.username || u.email || "(user)";

function getToken() {
  const raw =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    "";
  return (raw || "").replace(/^Bearer\s+/i, "");
}
function authHeader(): HeadersInit {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ---------- Status chip ---------- */
function StatusChip({ value }: { value: IssueStatus }) {
  const map: Record<IssueStatus, { bg: string; fg: string }> = {
    Submitted: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
    "In Review": { bg: "rgba(124,87,242,0.22)", fg: "#c7b8ff" },
    "In Progress": { bg: "rgba(234,179,8,0.18)", fg: "#fde68a" },
    "On Hold": { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
    Done: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
    Cancelled: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
  };
  const { bg, fg } = map[value] || map.Submitted;
  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Box>
  );
}

/* ---------- Table columns ---------- */
const COLUMNS: Column[] = [
  { key: "ticketNo", label: "Ticket No", width: 120, align: "center" },
  { key: "user", label: "User", width: 180, align: "left" },
  { key: "reportTo", label: "Report To", width: 180, align: "left" },
  { key: "categories", label: "Category", width: 220, align: "left" },
  { key: "priority", label: "Priority", width: 80, align: "center" },
  { key: "status", label: "Status", width: 120, align: "center" },
  { key: "description", label: "Description", width: 320, align: "left" },
  { key: "remarks", label: "Remarks", width: 240, align: "left" },
  { key: "createdAt", label: "Created At", width: 180, align: "center" },
  { key: "files", label: "Files", width: 100, align: "center" },
  { key: "action", label: "Action", width: 120, align: "center" },
];

/* ---------- Table (theme-aware) ---------- */
function DarkScrollTable({
  rows,
  columns,
  scope,
  onUpdate,
  onDownloadZip,
  t,
}: {
  rows: IssueRow[];
  columns: Column[];
  scope: "inbox" | "sent";
  onUpdate: (row: IssueRow) => void;
  onDownloadZip: (row: IssueRow) => void;
  t: (k: string) => string;
}) {
  const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;

  return (
    <Box>
      <Box sx={{ width: totalW, minWidth: "100%" }}>
        {/* header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
            bgcolor: "var(--issues-thead-bg)",
            borderBottom: BORDER_STR,
          }}
        >
          {columns.map((c) => (
            <Box
              key={c.key}
              sx={{
                px: 1.25,
                py: 1,
                fontWeight: 700,
                fontSize: 13,
                color: "var(--issues-thead-text)",
                textAlign: c.align ?? "center",
                whiteSpace: "nowrap",
              }}
            >
              {t(c.label)}
            </Box>
          ))}
        </Box>

        {/* rows */}
        {rows.map((r, idx) => (
          <Box
            key={r.id}
            sx={{
              display: "grid",
              gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
              borderBottom: BORDER_STR,
              bgcolor: "transparent",
              "&:nth-of-type(odd)": { bgcolor: "var(--row-stripe)" },
              "&:hover": { bgcolor: HOVER_BG },
            }}
          >
            {columns.map((c) => {
              if (c.key === "action") {
                const canUpdate = scope === "inbox";
                return (
                  <Box
                    key={`action-${idx}`}
                    sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    {canUpdate ? (
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 12,
                          px: 1.25,
                          bgcolor: ACCENT,
                          color: "#fff",
                          "&:hover": { filter: "brightness(0.95)" },
                        }}
                        onClick={() => onUpdate(r)}
                      >
                        {t("Update")}
                      </Button>
                    ) : (
                      <Box sx={{ fontSize: 12, color: TEXT_DIM }}>—</Box>
                    )}
                  </Box>
                );
              }

              if (c.key === "status") {
                return (
                  <Box key={`status-${idx}`} sx={{ px: 1.25, py: 0.9, textAlign: "center" }}>
                    <StatusChip value={r.status} />
                  </Box>
                );
              }

              if (c.key === "files") {
                return (
                  <Box
                    key={`files-${idx}`}
                    sx={{ px: 1.25, py: 0.6, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <Tooltip title={t("Download all attachments")}>
                      <span>
                        <IconButton size="small" onClick={() => onDownloadZip(r)} sx={{ color: TEXT }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                );
              }

              if (c.key === "categories") {
                return (
                  <Box
                    key={`cats-${idx}`}
                    sx={{
                      px: 1.25,
                      py: 1,
                      fontSize: 13,
                      color: TEXT,
                      textAlign: c.align ?? "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.categories.join(", ")}
                  </Box>
                );
              }

              const val = r[c.key as keyof IssueRow] as any;
              return (
                <Box
                  key={String(c.key)}
                  sx={{
                    px: 1.25,
                    py: 1,
                    fontSize: 13,
                    color: TEXT,
                    textAlign: c.align ?? "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {val || "-"}
                </Box>
              );
            })}
          </Box>
        ))}

        {rows.length === 0 && (
          <Box sx={{ px: 1.25, py: 2, color: TEXT_DIM, textAlign: "center" }}>{t("No issues yet.")}</Box>
        )}
      </Box>
    </Box>
  );
}

/* ---------------- CAPTCHA (same style as Requests.tsx) ---------------- */
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
  t,
}: {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
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
      PaperProps={{ sx: { bgcolor: CARD_BG, color: TEXT, border: BORDER_STR } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1 }}>
          <img
            src={svgDataUrl(cap.svg)}
            alt="captcha"
            style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid var(--border)` }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Type the letters")}
              size="small"
              fullWidth
              sx={{
                ...controlSx,
                "& .MuiOutlinedInput-root": { height: 36, background: "var(--bg-ctrl)" },
              }}
            />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: "var(--border)" }}>
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
export default function IssuesPage() {
  const { t } = useI18n();

  const [tab, setTab] = React.useState<"new" | "list">("new");
  const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");

  // list state
  const [rows, setRows] = React.useState<IssueRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingList, setLoadingList] = React.useState(false);

  // me
  const me = getStoredUser();
  const meId = String((me as any)?.id || "");
  const meName = me?.name || (me as any)?.full_name || me?.username || me?.email || "User";

  // form state (create)
  const [ticketNo, setTicketNo] = React.useState<string>("Auto");
  const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
  const [reportToId, setReportToId] = React.useState<string>("");
  const [categories, setCategories] = React.useState<number[]>([]);
  const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
  const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
  const [details, setDetails] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // update dialog state
  const [updOpen, setUpdOpen] = React.useState(false);
  const [updLoading, setUpdLoading] = React.useState(false);
  const [updId, setUpdId] = React.useState<number | null>(null);
  const [updTicketNo, setUpdTicketNo] = React.useState("");
  const [updRequester, setUpdRequester] = React.useState("");
  const [updTarget, setUpdTarget] = React.useState("");
  const [updCategories, setUpdCategories] = React.useState<string[]>([]);
  const [updPriority, setUpdPriority] = React.useState<"P1" | "P2" | "P3">("P2");
  const [updStatus, setUpdStatus] = React.useState<IssueStatus>("Submitted");
  const [updDescription, setUpdDescription] = React.useState("");
  const [updRemarks, setUpdRemarks] = React.useState("");

  // CAPTCHA state
  const [captchaOpen, setCaptchaOpen] = React.useState(false);

  /* -------- fetch recipients + categories -------- */
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const j = await api.get<any>("/api/users");
        const arr: BasicUser[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        const filtered = meId ? arr.filter((u) => String(u.id) !== meId) : arr;
        if (!cancelled) {
          setRecipients(filtered);
          if (!reportToId && filtered.length) setReportToId(String(filtered[0].id));
        }
      } catch {
        if (!cancelled) setRecipients([]);
      }
    })();

    (async () => {
      try {
        const j = await api.get<any>("/api/categories");
        const arr: Category[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        if (!cancelled) setCategoryOpts(arr);
      } catch {
        if (!cancelled) setCategoryOpts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meId, reportToId]);

  /* -------- list fetch -------- */
  const fetchList = React.useCallback(
    async (pageNum: number, pageSize: number) => {
      if (tab !== "list") return;
      setLoadingList(true);
      try {
        const p = pageNum + 1; // API is 1-based
        const j = await api.get<any>("/api/tickets", {
          params: { type: "issue", scope, q: search || undefined, page: p, size: pageSize },
        });

        const arr: any[] = Array.isArray(j?.rows) ? j.rows : Array.isArray(j) ? j : [];
        const mapped: IssueRow[] = arr.map((x: any, idx: number) => {
          const status = String(x.status ?? "Submitted") as IssueStatus;
          const targetId = String(x.target_user_id ?? "");
          const canUpdate = scope === "inbox";

          return {
            id: Number(x.id),
            sr: pageNum * pageSize + idx + 1,
            ticketNo: String(x.ticket_no ?? ""),
            user: String(x.requester_name ?? ""),
            reportTo: String(x.target_name ?? ""),
            categories: String(x.categories ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            priority: String(x.priority ?? "P2") as "P1" | "P2" | "P3",
            status,
            description: String(x.description ?? ""),
            remarks: x.last_note ? String(x.last_note) : "",
            createdAt: new Date(x.created_at ?? Date.now()).toLocaleString(),
            targetUserId: targetId,
            canUpdate,
          };
        });

        setRows(mapped);
      } catch (e) {
        console.error("issues list fetch failed", e);
        setRows([]);
      } finally {
        setLoadingList(false);
      }
    },
    [scope, search, tab]
  );

  React.useEffect(() => {
    fetchList(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, scope]);

  React.useEffect(() => {
    if (tab === "list") fetchList(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search, tab, fetchList]);

  /* -------- file pick/reset -------- */
  const handlePickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };
  const removeFileAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  /* -------- create Issue (gate with CAPTCHA) -------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportToId) return alert(t("Please select Report To."));
    if (!categories.length) return alert(t("Please select at least one category."));
    setCaptchaOpen(true); // open CAPTCHA; actual submit happens after verification
  };

  // Actual submit logic (after CAPTCHA success)
  const reallySubmit = async () => {
    try {
      setSubmitting(true);
      const resp = await api.post<any>("/api/tickets", {
        type: "issue",
        target_user_id: reportToId,
        priority,
        description: details?.trim() || null,
        categories,
        title: null,
      });

      const ticket_id = resp?.ticket_id ?? resp?.data?.ticket_id;
      const newTicketNo = resp?.ticket_no ?? resp?.data?.ticket_no ?? "RIN-?";
      setTicketNo(newTicketNo);

      if (ticket_id && files.length) {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        await fetch(`/api/tickets/${ticket_id}/attachments`, {
          method: "POST",
          body: form,
          headers: { ...authHeader() },
        });
      }

      setTab("list");
      setScope("sent");
      setPage(0);
      fetchList(0, rowsPerPage);

      setCategories([]);
      setDetails("");
      setPriority("P2");
      setFiles([]);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to submit issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setReportToId(recipients[0]?.id ? String(recipients[0].id) : "");
    setCategories([]);
    setPriority("P2");
    setDetails("");
    setFiles([]);
  };

  /* -------- Update dialog -------- */
  const openUpdate = async (row: IssueRow) => {
    try {
      setUpdOpen(true);
      setUpdLoading(true);
      setUpdId(row.id);
      setUpdTicketNo(row.ticketNo);

      const j = await api.get<any>(`/api/tickets/${row.id}`);
      const tkt = j?.ticket || {};
      const cats = Array.isArray(j?.categories) ? j.categories : [];

      setUpdRequester(tkt.requester_name || row.user);
      setUpdTarget(tkt.target_name || row.reportTo);
      setUpdCategories(cats.map((c: any) => c.name));
      setUpdPriority((tkt.priority || row.priority) as any);
      setUpdStatus((tkt.status || row.status) as IssueStatus);
      setUpdDescription(tkt.description || row.description || "");
      setUpdRemarks("");
    } catch (e) {
      console.error(e);
      alert("Failed to open ticket.");
      setUpdOpen(false);
    } finally {
      setUpdLoading(false);
    }
  };

  const submitUpdate = async () => {
    if (!updId) return;
    try {
      setUpdLoading(true);
      await api.patch(`/api/tickets/${updId}`, {
        status: updStatus,
        note: updRemarks?.trim() || null,
      });
      setUpdOpen(false);
      fetchList(page, rowsPerPage);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Update failed");
    } finally {
      setUpdLoading(false);
    }
  };

  /* -------- download all files (ZIP) -------- */
  const handleDownloadZip = async (row: IssueRow) => {
    try {
      const res = await fetch(`/api/tickets/${row.id}/attachments/download`, {
        method: "GET",
        headers: { ...authHeader(), Accept: "application/zip" },
      });
      if (!res.ok) {
        const tx = await res.text();
        throw new Error(tx || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${row.ticketNo}_attachments.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "No attachments found for this ticket.");
    }
  };

  const filtered = rows;
  const paged = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const columnsForScope = React.useMemo(
    () =>
      scope === "sent"
        ? COLUMNS.map((c) => (c.key === "action" ? { ...c, width: 80 } : c)).filter((c) => c.key !== "action")
        : COLUMNS,
    [scope]
  );

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card sx={CARD_SX}>
          {/* Header */}
          <Box
            sx={{
              px: UI.headerPx,
              py: UI.headerPy,
              borderBottom: BORDER_STR,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "transparent",
            }}
          >
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={tab}
              onChange={(_, v) => v && setTab(v)}
              sx={{
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  color: TEXT,
                  borderColor: BORDER_WEAK, // lighter when idle
                  px: 1.25,
                  py: 0.5,
                  backgroundColor: "transparent",
                  "&:hover": { bgcolor: HOVER_BG, borderColor: "var(--border)" },
                  "&.Mui-selected": {
                    bgcolor: "rgba(124,87,242,0.18)",
                    color: "#fff",
                    borderColor: "rgba(124,87,242,0.60)",
                    boxShadow: `0 0 0 1px ${ACCENT} inset`,
                    "&:hover": { bgcolor: "rgba(124,87,242,0.22)" },
                  },
                },
                ".theme-light & .MuiToggleButton-root": { color: "#111 !important" },
                ".theme-light & .MuiToggleButton-root.Mui-selected": { color: "#111 !important" },
              }}
            >
              <ToggleButton value="new">{t("Report Issue")}</ToggleButton>
              <ToggleButton value="list">{t("All Issues")}</ToggleButton>
            </ToggleButtonGroup>

            {/* Scope + search (list tab) */}
            {tab === "list" && (
              <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  value={scope}
                  onChange={(_, v) => v && (setScope(v), setPage(0))}
                  sx={{
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: TEXT,
                      borderColor: BORDER_WEAK,
                      px: 1,
                      py: 0.3,
                      backgroundColor: "transparent",
                      "&:hover": { bgcolor: HOVER_BG, borderColor: "var(--border)" },
                      "&.Mui-selected": {
                        bgcolor: "rgba(124,87,242,0.18)",
                        color: "#fff",
                        borderColor: "rgba(124,87,242,0.60)",
                        boxShadow: `0 0 0 1px ${ACCENT} inset`,
                        "&:hover": { bgcolor: "rgba(124,87,242,0.22)" },
                      },
                    },
                    /* Force black text in LIGHT theme for selected & unselected states */
                    ".theme-light & .MuiToggleButton-root": { color: "#111 !important" },
                    ".theme-light & .MuiToggleButton-root.Mui-selected": { color: "#111 !important" },
                  }}
                >
                  <ToggleButton value="inbox">{t("Inbox")}</ToggleButton>
                  <ToggleButton value="sent">{t("Sent")}</ToggleButton>
                </ToggleButtonGroup>

                <TextField
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder={t("Search…")}
                  size="small"
                  sx={{ width: UI.searchW, ...controlSx, "& .MuiOutlinedInput-root": { pl: 1, height: 30 } }} // no fill for search
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0.25 }}>
                        <SearchIcon sx={{ fontSize: UI.icon, color: TEXT }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
            {tab === "new" && (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
                  columnGap: 2,
                  rowGap: 2,
                  "& .form-item": { display: "flex", flexDirection: "column" },
                }}
              >
                {/* Row 1 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Report Issue Ticket No")}</Typography>
                  <TextField
                    value={ticketNo}
                    variant="standard"
                    size="small"
                    InputProps={{ readOnly: true, disableUnderline: true }}
                    sx={{ px: 0, bgcolor: "transparent", "& .MuiInputBase-input": { px: 0, color: TEXT, fontSize: 13 } }}
                  />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("User")}</Typography>
                  <TextField
                    value={meName}
                    variant="standard"
                    size="small"
                    InputProps={{ readOnly: true, disableUnderline: true }}
                    sx={{ px: 0, bgcolor: "transparent", "& .MuiInputBase-input": { px: 0, color: TEXT, fontSize: 13 } }}
                  />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Report To")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={reportToId}
                      onChange={(e) => setReportToId(String(e.target.value))}
                      sx={{ ...controlSx, ...fillField }}
                      MenuProps={selectMenu}
                      displayEmpty
                      renderValue={(v) => {
                        const u = recipients.find((x) => String(x.id) === String(v));
                        return u ? displayName(u) : t("Select recipient");
                      }}
                    >
                      <MenuItem disabled value="">
                        {t("Select recipient")}
                      </MenuItem>
                      {recipients.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {displayName(u)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 2: categories + priority */}
                <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
                  <Typography sx={LABEL_SX}>{t("Report Category")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select<number[]>
                      multiple
                      value={categories}
                      onChange={(e: SelectChangeEvent<number[]>) => {
                        const v = e.target.value as any;
                        setCategories(typeof v === "string" ? v.split(",").map((n: string) => Number(n)) : (v as number[]));
                      }}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as number[]).length
                          ? (selected as number[])
                              .map((id) => categoryOpts.find((c) => c.id === id)?.name || String(id))
                              .join(", ")
                          : t("Select category")
                      }
                      input={<OutlinedInput />}
                      sx={{ ...controlSx, ...fillField }}
                      MenuProps={selectMenu}
                    >
                      <MenuItem disabled value="">
                        {t("Select category")}
                      </MenuItem>
                      {categoryOpts.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Checkbox checked={categories.indexOf(c.id) > -1} sx={{ p: 0.5, color: TEXT }} />
                          </ListItemIcon>
                          <ListItemText primary={c.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Priority")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "P1" | "P2" | "P3")}
                      sx={{ ...controlSx, ...fillField }}
                      MenuProps={selectMenu}
                    >
                      {["P1", "P2", "P3"].map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 3: details */}
                <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
                  <Typography sx={LABEL_SX}>{t("Issue Additional Info")}</Typography>
                  <TextField
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder={t("Describe the problem, steps to reproduce, expected vs actual...")}
                    size="small"
                    sx={{
                      ...controlSx,
                      ...fillField,
                      "& .MuiOutlinedInput-root": { height: "auto" },
                      "& .MuiInputBase-input": {
                        height: "auto",
                        padding: "10px 12px",
                        lineHeight: 1.25,
                        fontSize: 13,
                        color: TEXT,
                      },
                    }}
                    multiline
                    minRows={3}
                  />
                </Box>

                {/* Row 4: attachments */}
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>{t("Attachments")}</Typography>
                  <input ref={fileInputRef} type="file" multiple hidden onChange={onFilesSelected} />
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handlePickFiles}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      borderColor: "var(--border)",
                      color: TEXT,
                      mb: 1,
                    }}
                  >
                    {t("Select Files")}
                  </Button>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {files.map((f, idx) => (
                      <Chip
                        key={`${f.name}-${idx}`}
                        label={f.name}
                        onDelete={() => removeFileAt(idx)}
                        sx={{ bgcolor: "transparent", color: TEXT, border: "1px solid var(--border)" }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Actions */}
                <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      bgcolor: ACCENT,
                      color: "#fff",
                      "&:hover": { filter: "brightness(0.95)" },
                    }}
                    disabled={!reportToId || !categories.length || submitting}
                  >
                    {submitting ? t("Submitting…") : t("Submit")}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      borderColor: BORDER_STR,
                      color: TEXT,
                      "&:hover": { bgcolor: HOVER_BG, borderColor: TEXT },
                    }}
                    onClick={handleReset}
                  >
                    {t("Reset")}
                  </Button>
                </Box>
              </Box>
            )}

            {tab === "list" && (
              <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
                <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
                  <DarkScrollTable
                    rows={paged}
                    columns={columnsForScope}
                    scope={scope}
                    onUpdate={openUpdate}
                    onDownloadZip={handleDownloadZip}
                    t={t}
                  />
                </Box>
                {loadingList && <Box sx={{ textAlign: "center", color: TEXT_DIM, py: 1 }}>{t("Loading…")}</Box>}
              </Box>
            )}
          </Box>

          {/* pagination (only on list tab) */}
          {tab === "list" && (
            <Box sx={{ borderTop: BORDER_STR }}>
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
                  color: TEXT,
                  minHeight: UI.paginationH,
                  "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    fontSize: UI.font,
                    m: 0,
                    color: TEXT_DIM,
                  },
                  "& .MuiTablePagination-input": { fontSize: UI.font, m: 0, color: TEXT },
                  "& .MuiSelect-select": {
                    py: 0,
                    px: 1,
                    fontSize: UI.font,
                    height: 30 - 6,
                    display: "flex",
                    alignItems: "center",
                    bgcolor: CONTROL_BG,
                    borderRadius: 1,
                  },
                  "& .MuiIconButton-root": { p: 0.25, color: TEXT },
                  ".MuiSvgIcon-root": { color: TEXT, fontSize: UI.icon },
                }}
                labelRowsPerPage={t("Rows per page:")}
              />
            </Box>
          )}
        </Card>
      </Box>

      {/* ----- Update Dialog ----- */}
      <Dialog
        open={updOpen}
        onClose={() => setUpdOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { bgcolor: CARD_BG, color: TEXT, border: BORDER_STR } }}
      >
        <DialogTitle>{t("Update Issue")}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: "var(--border)" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
              mt: 0.5,
            }}
          >
            <TextField
              label={t("Ticket No")}
              value={updTicketNo}
              size="small"
              InputProps={{ readOnly: true }}
              sx={controlSx}
              InputLabelProps={{ sx: { color: TEXT, "&.Mui-focused": { color: TEXT } } }}
            />
            <TextField
              label={t("Priority")}
              value={updPriority}
              size="small"
              InputProps={{ readOnly: true }}
              sx={controlSx}
              InputLabelProps={{ sx: { color: TEXT, "&.Mui-focused": { color: TEXT } } }}
            />
            <TextField
              label={t("Requester")}
              value={updRequester}
              size="small"
              InputProps={{ readOnly: true }}
              sx={controlSx}
              InputLabelProps={{ sx: { color: TEXT, "&.Mui-focused": { color: TEXT } } }}
            />
            <TextField
              label={t("Report To")}
              value={updTarget}
              size="small"
              InputProps={{ readOnly: true }}
              sx={controlSx}
              InputLabelProps={{ sx: { color: TEXT, "&.Mui-focused": { color: TEXT } } }}
            />

            <TextField
              label={t("Status")}
              select
              value={updStatus}
              onChange={(e) => setUpdStatus(e.target.value as IssueStatus)}
              size="small"
              sx={{ ...controlSx, ...fillField }}
              SelectProps={selectMenu as any}
              InputLabelProps={{ sx: { color: TEXT, "&.Mui-focused": { color: TEXT } } }}
            >
              {ISSUE_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {t(s)}
                </MenuItem>
              ))}
            </TextField>
            <Box />

            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ ...LABEL_SX, mb: 0.75, color: TEXT }}>{t("Categories")}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {updCategories.length ? (
                  updCategories.map((n, i) => (
                    <Chip
                      key={i}
                      size="small"
                      label={n}
                      variant="outlined"
                      sx={{ color: TEXT, borderColor: BORDER_WEAK, bgcolor: "transparent" }}
                    />
                  ))
                ) : (
                  <Typography sx={{ color: TEXT_DIM }}>{t("No results")}</Typography>
                )}
              </Stack>
            </Box>

            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                label={t("Description")}
                value={updDescription}
                size="small"
                fullWidth
                multiline
                minRows={3}
                sx={controlSx}
                InputProps={{ readOnly: true }}
                InputLabelProps={{ sx: { color: TEXT, "&.Mui-focused": { color: TEXT } } }}
              />
            </Box>

            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                label={t("Remarks (note for this update)")}
                value={updRemarks}
                onChange={(e) => setUpdRemarks(e.target.value)}
                size="small"
                multiline
                minRows={2}
                fullWidth
                sx={{
                  ...controlSx,
                  ...fillField,
                  "& .MuiOutlinedInput-root": { height: "auto", alignItems: "start" },
                  "& .MuiInputBase-input": { height: "auto", padding: "10px 12px", lineHeight: 1.25, fontSize: 13 },
                }}
                InputLabelProps={{ sx: { color: TEXT, "&.Mui-focused": { color: TEXT } } }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpdOpen(false)} disabled={updLoading}>
            {t("Cancel")}
          </Button>
          <Button
            variant="contained"
            onClick={submitUpdate}
            disabled={updLoading}
            sx={{ bgcolor: ACCENT, color: "#fff", "&:hover": { filter: "brightness(0.95)" } }}
          >
            {updLoading ? t("Saving…") : t("Update")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CAPTCHA dialog gates the "Submit" action */}
      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => setCaptchaOpen(false)}
        onOk={async () => {
          setCaptchaOpen(false);
          await reallySubmit();
        }}
        t={t}
      />
    </MainLayout>
  );
}
