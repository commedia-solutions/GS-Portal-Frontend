// src/pages/Requests.tsx
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
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { api } from "../api/http";
import { useI18n } from "../i18n";

/* ---------- THEME TOKENS (CSS vars) ---------- */
const TEXT = "var(--text)";
const TEXT_DIM = "var(--text-dim)";
const CARD_BG = "var(--bg-card)";
const CONTROL_BG = "var(--bg-ctrl)";
const HOVER = "var(--bg-hover)";
const BORDER_STR = "1px solid var(--border)";
const BORDER_WEAK = "var(--border-weak)";
const ACCENT = "var(--accent)";
const SCROLLBAR = "var(--scrollbar)";

/* ---------- Card + local header vars (match other pages) ---------- */
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

  "--reqs-thead-bg": "#000000",
  "--reqs-thead-text": "#ffffff",
  "--row-stripe": "rgba(255,255,255,0.06)",

  ".theme-dark &": {
    "--reqs-thead-bg": "#000000",
    "--reqs-thead-text": "#ffffff",
    "--row-stripe": "rgba(255,255,255,0.06)",
  },
  ".theme-light &": {
    "--reqs-thead-bg": "#464B4E",
    "--reqs-thead-text": "#ffffff",
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

  "& .MuiOutlinedInput-root": {
    alignItems: "center",
    backgroundColor: CONTROL_BG,
    height: 26,
  },

  "& .MuiInputBase-input": {
    color: TEXT,
    fontSize: 12,
    lineHeight: 2.45,
    padding: "3px 10px",
    height: "auto",
  },

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
  "& .MuiOutlinedInput-root": { backgroundColor: "#232325" },
  "& .MuiOutlinedInput-root.Mui-focused": { backgroundColor: "#232325" },
  "& .MuiSelect-select": { backgroundColor: "#232325" },
  "& .MuiInputBase-multiline": { backgroundColor: "#232325" },

  ".theme-light & .MuiOutlinedInput-root": { backgroundColor: "#ffffff" },
  ".theme-light & .MuiOutlinedInput-root.Mui-focused": { backgroundColor: "#ffffff" },
  ".theme-light & .MuiSelect-select": { backgroundColor: "#ffffff" },
  ".theme-light & .MuiInputBase-multiline": { backgroundColor: "#ffffff" },
} as const;

const selectMenu = {
  PaperProps: {
    sx: {
      bgcolor: CONTROL_BG,
      color: TEXT,
      border: BORDER_STR,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: HOVER },
      "& .MuiMenuItem-root:hover": { bgcolor: HOVER },
    },
  },
};

const LABEL_SX = { fontSize: 12, fontWeight: 600, color: TEXT_DIM, mb: 0.5, lineHeight: 1.2 };
const VALUE_SX = { fontSize: 13, fontWeight: 700, color: TEXT, ml: 0.25, mt: 0.25, lineHeight: 1.4 };

const UI = {
  headerPx: 1.25,
  headerPy: 0.6,
  font: 13,
  icon: 16,
  searchW: 260,
  paginationH: 36,
};

/* ---------- Status options (mirror DB superset) ---------- */
export const STATUS_OPTIONS = [
  "Submitted",
  "Draft",
  "In Review",
  "Approved",
  "Rejected",
  "Done",
  "Cancelled",
  "New",
  "Triaged",
  "In Progress",
  "Resolved",
  "Closed",
  "Reopened",
  "On Hold",
  "Need Info",
] as const;

type Status = (typeof STATUS_OPTIONS)[number];

/* ---------- Types ---------- */
type ReqRow = {
  id: number;
  sr: number;
  ticketNo: string;
  user: string;
  reqTo: string;
  categories: string[];
  priority: "P1" | "P2" | "P3";
  status: Status;
  description: string;
  remarks?: string;
  createdAt: string;
};

type Column = {
  key: keyof ReqRow | "action";
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
};

type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
type Category = { id: number; name: string };

/* ---------- Status chip ---------- */
function StatusChip({ value, t }: { value: Status; t: (k: string) => string }) {
  const map: Record<Status, { bg: string; fg: string }> = {
    Draft: { bg: "rgba(0,0,0,0.08)", fg: "#6b7280" },
    Submitted: { bg: "rgba(59,130,246,0.18)", fg: "#2563eb" },
    "In Review": { bg: "rgba(124,87,242,0.22)", fg: "#7c57f2" },
    Approved: { bg: "rgba(16,185,129,0.22)", fg: "#10b981" },
    Done: { bg: "rgba(34,197,94,0.22)", fg: "#22c55e" },
    Rejected: { bg: "rgba(239,68,68,0.22)", fg: "#ef4444" },
    Cancelled: { bg: "rgba(148,163,184,0.18)", fg: "#64748b" },
    New: { bg: "rgba(59,130,246,0.18)", fg: "#2563eb" },
    Triaged: { bg: "rgba(2,132,199,0.22)", fg: "#0284c7" },
    "In Progress": { bg: "rgba(234,179,8,0.18)", fg: "#ca8a04" },
    Resolved: { bg: "rgba(34,197,94,0.22)", fg: "#22c55e" },
    Closed: { bg: "rgba(148,163,184,0.18)", fg: "#64748b" },
    Reopened: { bg: "rgba(147,51,234,0.22)", fg: "#9333ea" },
    "On Hold": { bg: "rgba(148,163,184,0.18)", fg: "#64748b" },
    "Need Info": { bg: "rgba(14,165,233,0.18)", fg: "#0ea5e9" },
  };
  const { bg, fg } = map[value];
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
      {t(value)}
    </Box>
  );
}

/* ---------- Table columns ---------- */
const COLUMNS: Column[] = [
  { key: "ticketNo", label: "Ticket No", width: 9, align: "center" },
  { key: "user", label: "User", width: 10, align: "left" },
  { key: "reqTo", label: "Req To", width: 10, align: "left" },
  { key: "categories", label: "Category", width: 12, align: "left" },
  { key: "priority", label: "Priority", width: 7, align: "center" },
  { key: "status", label: "Status", width: 10, align: "center" },
  { key: "description", label: "Description", width: 16, align: "left" },
  { key: "remarks", label: "Remarks", width: 11, align: "left" },
  { key: "createdAt", label: "Created At", width: 8, align: "center" },
  { key: "action", label: "Action", width: 7, align: "center" },
];

/* ---------- Table (theme-aware) ---------- */
function DarkScrollTable({
  rows,
  columns,
  onUpdate,
  onDelete,
  scope,
  t,
}: {
  rows: ReqRow[];
  columns: Column[];
  onUpdate: (row: ReqRow) => void;
  onDelete: (row: ReqRow) => void;
  scope: "inbox" | "sent";
  t: (k: string) => string;
}) {

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          tableLayout: "fixed",
          borderCollapse: "collapse",
          minWidth: `${columns.length * 80}px`,
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "var(--reqs-thead-bg)", borderBottom: BORDER_STR }}>
            {columns.map((c) => (
              <th
                key={c.key}
                style={{
                  width: `${c.width}%`,
                  minWidth: "80px",
                  padding: "10px 14px",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--reqs-thead-text)",
                  textAlign: c.align ?? "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  position: "sticky",
                  top: 0,
                  zIndex: 2,
                  backgroundColor: "var(--reqs-thead-bg)",
                }}
                title={t(c.label)}
              >
                {t(c.label)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr
              key={r.id}
              style={{
                backgroundColor: idx % 2 === 0 ? "var(--row-even)" : "var(--row-odd)",
                borderBottom: BORDER_STR,
              }}
            >
              {columns.map((c) => {
                if (c.key === "action") {
                  return (
                    <td
                      key={`action-${idx}`}
                      style={{
                        padding: "10px 14px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 0.75, justifyContent: "center" }}>
                        {scope === "inbox" && (
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
                            }}
                            onClick={() => onUpdate(r)}
                          >
                            {t("Update")}
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          sx={{ minWidth: 32, px: 0.75 }}
                          onClick={() => onDelete(r)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </Button>
                      </Box>
                    </td>
                  );
                }

                if (c.key === "status") {
                  return (
                    <td
                      key={`status-${idx}`}
                      style={{
                        padding: "10px 14px",
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={t(r.status)}
                    >
                      <StatusChip value={r.status} t={t} />
                    </td>
                  );
                }

                if (c.key === "categories") {
                  const catStr = r.categories.join(", ") || "—";
                  return (
                    <td
                      key={`cats-${idx}`}
                      style={{
                        padding: "10px 14px",
                        fontSize: 13,
                        color: TEXT,
                        textAlign: c.align ?? "left",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={catStr}
                    >
                      {catStr}
                    </td>
                  );
                }

                const val = r[c.key as keyof ReqRow] as string;
                return (
                  <td
                    key={String(c.key)}
                    style={{
                      padding: "10px 14px",
                      fontSize: 13,
                      color: TEXT,
                      textAlign: c.align ?? "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={val || "—"}
                  >
                    {val || "—"}
                  </td>
                );
              })}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ padding: "16px", textAlign: "center", color: TEXT_DIM }}>
                {t("No requests yet.")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  );
}

/* ---------- Helpers ---------- */
function getStoredUser(): { id?: string; username?: string; name?: string; email?: string; full_name?: string } {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
const displayName = (u: BasicUser) => u.full_name || u.username || u.email || "(user)";

/* ---------------- CAPTCHA (same as other pages) ---------------- */
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

export default function RequestsPage() {
  const { t } = useI18n();
  const [tab, setTab] = React.useState<"new" | "list">("new");

  // list state
  const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");
  const [rows, setRows] = React.useState<ReqRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingList, setLoadingList] = React.useState(false);

  // const UPDATE_STATUS_OPTIONS = ["In Review", "In Progress", "On Hold", "Done", "Cancelled"] as const;

  // me
  const me = getStoredUser();
  const meId = String((me as any)?.id || "");

  // form state (create)
  const [ticketNo, setTicketNo] = React.useState<string>("Auto");
  const [userName] = React.useState<string>(me?.name || (me as any)?.full_name || me?.username || me?.email || "User");
  const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
  const [reqToId, setReqToId] = React.useState<string>("");
  const [categories, setCategories] = React.useState<number[]>([]);
  const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
  const [additionalInfo, setAdditionalInfo] = React.useState("");
  const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
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
  const [updStatus, setUpdStatus] = React.useState<Status>("Submitted");
  const [updDescription, setUpdDescription] = React.useState("");
  const [updRemarks, setUpdRemarks] = React.useState("");

  // CAPTCHA state
  const [captchaOpen, setCaptchaOpen] = React.useState(false);

  // ---- fetch recipients + categories
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const j = await api.get<any>("/api/users");
        const arr: BasicUser[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        const filtered = meId ? arr.filter((u) => String(u.id) !== meId) : arr;
        if (!cancelled) {
          setRecipients(filtered);
          if (!reqToId && filtered.length) setReqToId(String(filtered[0].id));
        }
      } catch (e) {
        console.error("users fetch failed", e);
        if (!cancelled) setRecipients([]);
      }
    })();

    (async () => {
      try {
        const j = await api.get<any>("/api/categories");
        const arr: Category[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        if (!cancelled) setCategoryOpts(arr);
      } catch (e) {
        console.error("categories fetch failed", e);
        if (!cancelled) setCategoryOpts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meId, reqToId]);

  // ---- fetch list
  const fetchList = React.useCallback(
    async (pageNum: number, pageSize: number) => {
      if (tab !== "list") return;
      setLoadingList(true);
      try {
        const p = pageNum + 1;
        const j = await api.get<any>("/api/tickets", {
          params: { type: "request", scope, q: search || undefined, page: p, size: pageSize },
        });

        const arr: any[] = Array.isArray(j?.rows) ? j.rows : Array.isArray(j) ? j : [];
        const mapped: ReqRow[] = arr.map((x: any, idx: number) => {
          const status = String(x.status ?? "Submitted") as Status;
          return {
            id: Number(x.id),
            sr: pageNum * pageSize + idx + 1,
            ticketNo: String(x.ticket_no ?? ""),
            user: String(x.requester_name ?? ""),
            reqTo: String(x.target_name ?? ""),
            categories: String(x.categories ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            priority: String(x.priority ?? "P2") as "P1" | "P2" | "P3",
            status,
            description: String(x.description ?? ""),
            remarks: x.last_note ? String(x.last_note) : "",
            createdAt: new Date(x.created_at ?? Date.now()).toLocaleString(),
          };
        });

        setRows(mapped);
      } catch (e) {
        console.error("list fetch failed", e);
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
  }, [page, rowsPerPage, search]);

  const handleCategoriesChange = (e: SelectChangeEvent<number[]>) => {
    const v = e.target.value as any;
    setCategories(typeof v === "string" ? v.split(",").map((n: string) => Number(n)) : (v as number[]));
  };

  // Validate then open CAPTCHA; actual submit happens after verification
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqToId) return alert(t("Please select recipient (Req To)."));
    if (!categories.length) return alert(t("Please select at least one category."));
    setCaptchaOpen(true);
  };

  // The real submit logic (called after CAPTCHA success)
  const reallySubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        type: "request",
        target_user_id: reqToId,
        priority,
        description: additionalInfo?.trim() || null,
        categories,
        title: null,
      };
      const resp = await api.post<any>("/api/tickets", payload);
      const ticket_no = resp?.ticket_no || resp?.data?.ticket_no || "RTN-?";

      setTicketNo(ticket_no);
      setTab("list");
      setScope("sent");
      setPage(0);
      fetchList(0, rowsPerPage);

      setCategories([]);
      setAdditionalInfo("");
      setPriority("P2");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to submit request."));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = rows; // server-side filtering
  const paged = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  // ---- Update dialog
  const openUpdate = async (row: ReqRow) => {
    try {
      setUpdOpen(true);
      setUpdLoading(true);
      setUpdId(row.id);
      setUpdTicketNo(row.ticketNo);
      // fetch detail
      const j = await api.get<any>(`/api/tickets/${row.id}`);
      const tkt = j?.ticket || {};
      const cats = Array.isArray(j?.categories) ? j.categories : [];
      setUpdRequester(tkt.requester_name || row.user);
      setUpdTarget(tkt.target_name || row.reqTo);
      setUpdCategories(cats.map((c: any) => c.name));
      setUpdPriority((tkt.priority || row.priority) as any);
      setUpdStatus((tkt.status || row.status) as Status);
      setUpdDescription(tkt.description || row.description || "");
      setUpdRemarks("");
    } catch (e) {
      console.error(e);
      alert(t("Failed to open ticket."));
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
        title: null,
        status: updStatus,
        note: updRemarks?.trim() || null,
      });
      setUpdOpen(false);
      fetchList(page, rowsPerPage);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Update failed"));
    } finally {
      setUpdLoading(false);
    }
  };
  const handleDelete = async (row: ReqRow) => {
    const ok = window.confirm(`Delete request ${row.ticketNo}?`);
    if (!ok) return;

    try {
      await api.del(`/api/tickets/${row.id}`);
      fetchList(page, rowsPerPage);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to delete request"));
    }
  };

  // const columnsForScope = React.useMemo(
  //   () => (scope === "sent" ? COLUMNS.filter((c) => c.key !== "action") : COLUMNS),
  //   [scope]
  // );

  const columnsForScope = React.useMemo(() => COLUMNS, []);

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
                  borderColor: BORDER_WEAK,
                  px: 1.25,
                  py: 0.5,
                  backgroundColor: "transparent",
                  "&:hover": { bgcolor: HOVER },
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
              <ToggleButton value="new">{t("New Request")}</ToggleButton>
              <ToggleButton value="list">{t("All Requests")}</ToggleButton>
            </ToggleButtonGroup>

            {/* Scope + search */}
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
                      "&:hover": { bgcolor: HOVER, borderColor: "var(--border)" },
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
                  sx={{
                    width: UI.searchW,
                    ...controlSx,
                    "& .MuiOutlinedInput-root": { pl: 1, height: 30 },
                  }}
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
                  <Typography sx={LABEL_SX}>{t("Request Ticket No")}</Typography>
                  <Box sx={VALUE_SX}>{ticketNo}</Box>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("User")}</Typography>
                  <Box sx={VALUE_SX}>{userName}</Box>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>{t("Req To")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={reqToId}
                      onChange={(e) => setReqToId(String(e.target.value))}
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

                {/* Row 2 */}
                <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
                  <Typography sx={LABEL_SX}>{t("Req Category")}</Typography>
                  <FormControl fullWidth size="small">
                    <Select<number[]>
                      multiple
                      value={categories}
                      onChange={handleCategoriesChange}
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

                {/* Row 3 */}
                <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
                  <Typography sx={LABEL_SX}>{t("Req Additional Info")}</Typography>
                  <TextField
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder={t("write request in detail for Admin")}
                    size="small"
                    multiline
                    minRows={3}
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
                  />
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
                    disabled={!reqToId || !categories.length || submitting}
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
                      "&:hover": { bgcolor: HOVER, borderColor: TEXT },
                    }}
                    onClick={() => {
                      setCategories([]);
                      setAdditionalInfo("");
                      setPriority("P2");
                    }}
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
                    onUpdate={openUpdate}
                    onDelete={handleDelete}
                    scope={scope}
                    t={t}
                  />
                </Box>
                {loadingList && <Box sx={{ textAlign: "center", color: TEXT_DIM, py: 1 }}>{t("Loading…")}</Box>}
              </Box>
            )}
          </Box>

          {/* pagination (only on list tab) */}
          {tab === "list" && (
            <Box sx={{ borderTop: BORDER_STR, bgcolor: "transparent" }}>
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
        <DialogTitle>{t("Update Request")}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: "var(--border)" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
              mt: 0.5,
            }}
          >
            <Box className="form-item" sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={LABEL_SX}>{t("Ticket No")}</Typography>
              <TextField
                value={updTicketNo}
                size="small"
                InputProps={{ readOnly: true }}
                sx={controlSx}
              />
            </Box>

            <Box className="form-item" sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={LABEL_SX}>{t("Priority")}</Typography>
              <TextField
                select
                value={updPriority}
                size="small"
                sx={{ ...controlSx, ...fillField }}
                SelectProps={selectMenu as any}
                disabled
              >
                {["P1", "P2", "P3"].map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box className="form-item" sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={LABEL_SX}>{t("Requester")}</Typography>
              <TextField
                value={updRequester}
                size="small"
                InputProps={{ readOnly: true }}
                sx={controlSx}
              />
            </Box>

            <Box className="form-item" sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={LABEL_SX}>{t("Req To")}</Typography>
              <TextField
                value={updTarget}
                size="small"
                InputProps={{ readOnly: true }}
                sx={controlSx}
              />
            </Box>

            <Box className="form-item" sx={{ display: "flex", flexDirection: "column" }}>
              <Typography sx={LABEL_SX}>{t("Status")}</Typography>
              <TextField
                select
                value={updStatus}
                onChange={(e) => setUpdStatus(e.target.value as Status)}
                size="small"
                sx={{ ...controlSx, ...fillField }}
                SelectProps={selectMenu as any}
              >
                {["In Review", "In Progress", "On Hold", "Done", "Cancelled"].map((s) => (
                  <MenuItem key={s} value={s}>
                    {t(s)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

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
                  <Typography sx={{ color: TEXT_DIM }}>{t("None")}</Typography>
                )}
              </Stack>
            </Box>

            <Box sx={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
              <Typography sx={LABEL_SX}>{t("Description")}</Typography>
              <TextField
                value={updDescription}
                size="small"
                multiline
                minRows={3}
                fullWidth
                sx={{
                  ...controlSx,
                  ...fillField,
                  "& .MuiOutlinedInput-root": { height: "auto", alignItems: "flex-start", padding: "10px 12px" },
                  "& .MuiInputBase-input": { height: "auto", padding: 0, lineHeight: 1.4, fontSize: 13 },
                }}
                InputProps={{ readOnly: true }}
              />
            </Box>

            <Box sx={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column" }}>
              <Typography sx={LABEL_SX}>{t("Remarks (note for this update)")}</Typography>
              <TextField
                value={updRemarks}
                onChange={(e) => setUpdRemarks(e.target.value)}
                size="small"
                multiline
                minRows={3}
                fullWidth
                sx={{
                  ...controlSx,
                  ...fillField,
                  "& .MuiOutlinedInput-root": { height: "auto", alignItems: "flex-start", padding: "10px 12px" },
                  "& .MuiInputBase-input": { height: "auto", padding: 0, lineHeight: 1.4, fontSize: 13 },
                }}
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
