// src/pages/Requests.tsx
import * as React from "react";
import {
  Box, Card, ToggleButtonGroup, ToggleButton, TextField, InputAdornment, Button, Select, MenuItem,
  TablePagination, Typography, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Table, TableBody, TableCell, TableHead, TableRow, Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { api } from "../api/http";
import { useI18n } from "../i18n";

import { vars, sxPresets } from "../ui/toast/themeBridge";
import {
  PREMIUM_CARD_SX, THEAD_CELL_SX, ROW_CELL_SX, PAGINATION_SX,
  AmbientLighting, TableScanLine, glassRowHoverSx
} from "../ui/styles";

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
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: "6px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: `${ACCENT}40` },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1, boxShadow: `0 0 8px ${ACCENT}30` },
  },
  "& .MuiInputBase-input": { padding: "0 12px", fontSize: 12.5, color: TEXT, height: "32px", boxSizing: "border-box" },
  "& .MuiInputBase-input::placeholder": { color: DIM, opacity: 0.6 },
  "& .MuiSvgIcon-root": { fontSize: 16, color: DIM },
  "& .MuiSelect-select": { display: "flex", alignItems: "center", paddingRight: "32px !important", height: "32px", boxSizing: "border-box" },
} as const;

function Labeled({ label, children, width }: { label: string; children: React.ReactNode; width?: number | string }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: width ?? "auto" }}>
      <Typography sx={{ fontSize: 9, fontWeight: 900, color: DIM, ml: 0.5, textTransform: "uppercase", letterSpacing: "0.12em", lineHeight: 1 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

const STATUS_OPTIONS = [
  "Submitted", "Draft", "In Review", "Approved", "Rejected", "Done", "Cancelled", "New", "Triaged", "In Progress", "Resolved", "Closed", "Reopened", "On Hold", "Need Info"
] as const;
type Status = (typeof STATUS_OPTIONS)[number];

type ReqRow = { id: number; sr: number; ticketNo: string; user: string; reqTo: string; categories: string[]; priority: "P1" | "P2" | "P3"; status: Status; description: string; remarks?: string; createdAt: string; };
type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
type Category = { id: number; name: string };

function StatusChip({ value, t }: { value: Status; t: any }) {
  const map: Record<Status, { bg: string; fg: string }> = {
    Draft: { bg: "rgba(0,0,0,0.08)", fg: "#6b7280" },
    Submitted: { bg: "rgba(59,130,246,0.12)", fg: "#3b82f6" },
    "In Review": { bg: "rgba(124,87,242,0.15)", fg: "#7c57f2" },
    Approved: { bg: "rgba(16,185,129,0.15)", fg: "#10b981" },
    Done: { bg: "rgba(34,197,94,0.15)", fg: "#22c55e" },
    Rejected: { bg: "rgba(239,68,68,0.15)", fg: "#ef4444" },
    Cancelled: { bg: "rgba(148,163,184,0.12)", fg: "#64748b" },
    New: { bg: "rgba(59,130,246,0.12)", fg: "#3b82f6" },
    Triaged: { bg: "rgba(2,132,199,0.15)", fg: "#0284c7" },
    "In Progress": { bg: "rgba(234,179,8,0.12)", fg: "#eab308" },
    Resolved: { bg: "rgba(34,197,94,0.15)", fg: "#22c55e" },
    Closed: { bg: "rgba(148,163,184,0.12)", fg: "#64748b" },
    Reopened: { bg: "rgba(147,51,234,0.15)", fg: "#9333ea" },
    "On Hold": { bg: "rgba(148,163,184,0.12)", fg: "#64748b" },
    "Need Info": { bg: "rgba(14,165,233,0.12)", fg: "#0ea5e9" },
  };
  const { bg, fg } = map[value] || map.Submitted;
  return (
    <Box sx={{ display: "inline-flex", px: 1.2, py: 0.4, borderRadius: 999, bgcolor: bg, color: fg, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", border: `1px solid ${fg}25` }}>
      {t(value)}
    </Box>
  );
}

export default function RequestsPage() {
  const { t } = useI18n();

  const [tab, setTab] = React.useState<"new" | "list">("new");
  const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");
  const [rows, setRows] = React.useState<ReqRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [loadingList, setLoadingList] = React.useState(false);

  const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
  const [reqToId, setReqToId] = React.useState<string>("");
  const [categories, setCategories] = React.useState<number[]>([]);
  const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
  const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
  const [details, setDetails] = React.useState("");
  const [captchaOpen, setCaptchaOpen] = React.useState(false);

  const refreshList = React.useCallback(async () => {
    if (tab !== "list") return;
    setLoadingList(true);
    try {
      const j = await api.get<any>("/api/tickets", { params: { type: "request", scope, q: search || undefined, page: page + 1, size: rowsPerPage } });
      const arr = Array.isArray(j?.rows) ? j.rows : [];
      setRows(arr.map((x: any, i: number) => ({
        id: x.id, sr: page * rowsPerPage + i + 1, ticketNo: x.ticket_no, user: x.requester_name, reqTo: x.target_name,
        categories: String(x.categories || "").split(",").map((s: any) => s.trim()).filter(Boolean),
        priority: x.priority, status: x.status, description: x.description || "", remarks: x.last_note || "", createdAt: String(x.created_at).replace("T", " ").split(".")[0]
      })));
    } catch (e) { console.error(e); } finally { setLoadingList(false); }
  }, [scope, search, tab, page, rowsPerPage]);

  React.useEffect(() => { refreshList(); }, [refreshList]);

  React.useEffect(() => {
    (async () => {
      const u = await api.get<any>("/api/users"); setRecipients(Array.isArray(u?.data) ? u.data : []);
      const c = await api.get<any>("/api/categories"); setCategoryOpts(Array.isArray(c?.data) ? c.data : []);
    })();
  }, []);

  const doSubmit = async () => {
    try {
      await api.post("/api/tickets", { type: "request", target_user_id: reqToId, priority, description: details, categories });
      setTab("list"); setScope("sent"); setDetails(""); setCategories([]); refreshList();
    } catch (e) { console.error(e); }
  };

  const toggleBtnSx = {
    ...sxPresets.btnGhost,
    textTransform: "none", fontWeight: 700, fontSize: 13, px: 3, minWidth: 160, height: 32, borderRadius: "8px !important", color: DIM, border: `1px solid ${BORDER} !important`,
    "&.Mui-selected": { color: ACCENT, bgcolor: `${ACCENT}15`, borderColor: `${ACCENT} !important`, boxShadow: `0 0 10px ${ACCENT}25` },
  };

  const theadCellSx = { ...THEAD_CELL_SX, fontSize: 10, fontWeight: 800, textAlign: "center", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "var(--thead-text)", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" as const };
  const bodyCellSx = { ...ROW_CELL_SX, textAlign: "center" as const, fontSize: 12.5, borderBottom: `1px solid ${vars.borderWeak}`, color: TEXT };

  return (
    <MainLayout title=" ">
      <Box sx={{ px: 2, pt: 1, pb: 2, height: `calc(100vh - ${TOPBAR_HEIGHT}px)`, display: "flex", flexDirection: "column" }}>
        <Card elevation={0} sx={{ ...PREMIUM_CARD_SX, flex: 1, display: "flex", flexDirection: "column" }}>
          <AmbientLighting />
          <TableScanLine />

          {/* Premium Integrated Header */}
          <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${BORDER}`, zIndex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3 }}>

            {/* Navigation and Main Filters */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v && setTab(v)} size="small" sx={{ bgcolor: "rgba(0,0,0,0.3)", borderRadius: "12px", p: 0.4, border: `1px solid ${BORDER}` }}>
                <ToggleButton value="new" sx={toggleBtnSx}>{t("Create Request")}</ToggleButton>
                <ToggleButton value="list" sx={toggleBtnSx}>{t("Request List")}</ToggleButton>
              </ToggleButtonGroup>
              <Box sx={{ width: 1, height: 24, bgcolor: BORDER, mx: 1 }} />
              <Typography variant="caption" sx={{ color: DIM, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: 9 }}>
                {tab === "new" ? "NEW_ENTRY_CONSOLE" : "SYSTEM_TICKET_LOG"}
              </Typography>
            </Box>

            {tab === "list" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <ToggleButtonGroup value={scope} exclusive onChange={(_, v) => v && setScope(v)} size="small" sx={{ bgcolor: "rgba(0,0,0,0.2)", borderRadius: "10px", p: 0.4, border: `1px solid ${BORDER}` }}>
                  <ToggleButton value="inbox" sx={{ ...toggleBtnSx, minWidth: 100, height: 28, fontSize: 11 }}>{t("Inbox")}</ToggleButton>
                  <ToggleButton value="sent" sx={{ ...toggleBtnSx, minWidth: 100, height: 28, fontSize: 11 }}>{t("Sent")}</ToggleButton>
                </ToggleButtonGroup>

                <Labeled label={t("Global Search")} width={260}>
                  <TextField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("Filter by ID, user...")}
                    size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: ACCENT }} /></InputAdornment> }}
                    sx={ctrlSx}
                  />
                </Labeled>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", position: "relative", zIndex: 1, ...sxPresets.scroller }}>
            {tab === "new" ? (
              <Box sx={{ px: 4, py: 4, maxWidth: 1000, mx: "auto" }}>
                <Stack spacing={2.5}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton onClick={() => setTab("list")} sx={{ color: DIM, border: `1px solid ${BORDER}`, borderRadius: "8px", "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}><ArrowBackIosNewIcon sx={{ fontSize: 12 }} /></IconButton>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: TEXT, letterSpacing: "-0.01em" }}>{t("New Request")}</Typography>
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                    <Labeled label={t("Report To")}>
                      <Select value={reqToId} onChange={(e) => setReqToId(e.target.value)} sx={{ ...ctrlSx, "& .MuiSelect-select": { py: 0, height: 32, display: "flex", alignItems: "center" } }}>
                        {recipients.map(u => <MenuItem key={u.id} value={u.id}>{u.full_name || u.username}</MenuItem>)}
                      </Select>
                    </Labeled>
                    <Labeled label={t("Priority")}>
                      <Select value={priority} onChange={(e) => setPriority(e.target.value as any)} sx={{ ...ctrlSx, "& .MuiSelect-select": { py: 0, height: 32, display: "flex", alignItems: "center" } }}>
                        <MenuItem value="P1">P1 (Critical)</MenuItem>
                        <MenuItem value="P2">P2 (Normal)</MenuItem>
                        <MenuItem value="P3">P3 (Low)</MenuItem>
                      </Select>
                    </Labeled>
                  </Box>
                  <Labeled label={t("Categories")}>
                    <Select multiple value={categories} onChange={(e) => setCategories(e.target.value as number[])} renderValue={(sel) => sel.map(id => categoryOpts.find(c => c.id === id)?.name).join(", ")} sx={{ ...ctrlSx, "& .MuiSelect-select": { py: 0.5, minHeight: 32, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 } }}>
                      {categoryOpts.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </Labeled>
                  <Labeled label={t("Details")}>
                    <TextField multiline rows={4} value={details} onChange={(e) => setDetails(e.target.value)} placeholder={t("Describe your request...")} sx={{
                      ...ctrlSx,
                      "& .MuiOutlinedInput-root": {
                        height: "auto", py: 1.2,
                        backgroundColor: "rgba(0,0,0,0.15)",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.08)" }
                      }
                    }} />
                  </Labeled>
                  <Box sx={{ pt: 1 }}>
                    <Button variant="contained" onClick={() => setCaptchaOpen(true)} disabled={!reqToId || !categories.length} sx={{
                      bgcolor: ACCENT, color: "#fff", height: 38, px: 4, fontWeight: 900, fontSize: 13, borderRadius: "8px",
                      boxShadow: `0 4px 12px ${ACCENT}30`,
                      "&:hover": { bgcolor: "#6b48ea", boxShadow: `0 6px 18px ${ACCENT}50` },
                      "&.Mui-disabled": { bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.1)" }
                    }}>{t("Submit Request")}</Button>
                  </Box>
                </Stack>
              </Box>
            ) : (
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={theadCellSx}>{t("Ticket No")}</TableCell>
                    <TableCell sx={{ ...theadCellSx, textAlign: "left" }}>{t("User")}</TableCell>
                    <TableCell sx={{ ...theadCellSx, textAlign: "left" }}>{t("Req To")}</TableCell>
                    <TableCell sx={{ ...theadCellSx, textAlign: "left" }}>{t("Category")}</TableCell>
                    <TableCell sx={theadCellSx}>{t("Priority")}</TableCell>
                    <TableCell sx={theadCellSx}>{t("Status")}</TableCell>
                    <TableCell sx={theadCellSx}>{t("Created At")}</TableCell>
                    <TableCell sx={theadCellSx}>{t("Action")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingList ? (
                    <TableRow><TableCell colSpan={8} sx={{ py: 10, textAlign: "center", color: DIM }}>{t("Loading requests...")}</TableCell></TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow><TableCell colSpan={8} sx={{ py: 10, textAlign: "center", color: DIM }}>{t("No requests found.")}</TableCell></TableRow>
                  ) : rows.map((r) => (
                    <TableRow key={r.id} sx={glassRowHoverSx}>
                      <TableCell sx={{ ...bodyCellSx, fontWeight: 800, color: ACCENT }}>{r.ticketNo}</TableCell>
                      <TableCell sx={{ ...bodyCellSx, textAlign: "left", fontWeight: 600 }}>{r.user}</TableCell>
                      <TableCell sx={{ ...bodyCellSx, textAlign: "left" }}>{r.reqTo}</TableCell>
                      <TableCell sx={{ ...bodyCellSx, textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.8)" }}>{r.categories.join(", ")}</TableCell>
                      <TableCell sx={bodyCellSx}>{r.priority}</TableCell>
                      <TableCell sx={bodyCellSx}><StatusChip value={r.status} t={t} /></TableCell>
                      <TableCell sx={bodyCellSx}>{r.createdAt}</TableCell>
                      <TableCell sx={bodyCellSx}>
                        {scope === "inbox" ? (
                          <Button size="small" variant="contained" sx={{
                            textTransform: "none", bgcolor: ACCENT, fontSize: 10.5, fontWeight: 800, py: 0.3, px: 2, borderRadius: "6px",
                            "&:hover": { bgcolor: "#6b48ea" }
                          }} onClick={() => { }}>{t("Update")}</Button>
                        ) : (
                          <IconButton size="small" color="error" onClick={() => { }} sx={{ "&:hover": { bgcolor: "rgba(239,68,68,0.1)" } }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Box>
          {tab === "list" && (
            <Box sx={{ borderTop: `1px solid ${BORDER}`, bgcolor: "transparent" }}>
              <TablePagination component="div" count={-1} page={page} rowsPerPage={rowsPerPage} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))} sx={PAGINATION_SX} />
            </Box>
          )}
        </Card>
      </Box>
      <CaptchaDialog open={captchaOpen} onCancel={() => setCaptchaOpen(false)} onOk={() => { setCaptchaOpen(false); doSubmit(); }} colors={{ CARD: vars.bgCard, TEXT: vars.text, BORDER: vars.border, CTRL: vars.bgCtrl }} t={t} />
    </MainLayout>
  );
}

function CaptchaDialog({ open, onCancel, onOk, colors, t }: any) {
  const [cap, setCap] = React.useState<{ text: string, svg: string } | null>(null);
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState("");

  const refresh = React.useCallback(() => {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const text = Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    const chars = [...text].map((ch, i) => {
      const x = (i + 1) * 35; const y = 40 + (Math.random() * 10 - 5); const r = (Math.random() * 40 - 20);
      return `<text x="${x}" y="${y}" font-size="32" font-weight="900" text-anchor="middle" dominant-baseline="middle" transform="rotate(${r} ${x} ${y})">${ch}</text>`;
    }).join("");
    setCap({ text, svg: `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80" viewBox="0 0 220 80"><rect width="100%" height="100%" fill="#121214"/><g fill="#7C57F2">${chars}</g></svg>` });
    setInput(""); setError("");
  }, []);

  React.useEffect(() => { if (open) refresh(); }, [open, refresh]);

  const submit = () => {
    if (input.trim().toLowerCase() === cap?.text.toLowerCase()) onOk();
    else { setError(t("Incorrect code. Try again.")); refresh(); }
  };

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: colors.CARD, color: colors.TEXT, border: `1px solid ${colors.BORDER}`, borderRadius: "16px" } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{t("Human Verification")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2 }}>
          {cap && <Box dangerouslySetInnerHTML={{ __html: cap.svg }} style={{ width: "100%", height: 80, borderRadius: 8, overflow: "hidden", border: `1px solid ${colors.BORDER}` }} />}
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Type the code")} size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { height: 40, background: "rgba(0,0,0,0.2)" }, "& .MuiInputBase-input": { color: colors.TEXT } }} />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: colors.BORDER, color: colors.TEXT }}>{t("Refresh")}</Button>
          </Box>
          {error && <Typography color="error" variant="caption">{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} sx={{ color: colors.TEXT }}>{t("Cancel")}</Button>
        <Button onClick={submit} variant="contained" sx={{ bgcolor: "#7C57F2", fontWeight: 800 }}>{t("Verify")}</Button>
      </DialogActions>
    </Dialog>
  );
}
