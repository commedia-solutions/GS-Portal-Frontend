// src/pages/Documents.tsx
import React from "react";
import {
  Box, Card, ToggleButtonGroup, ToggleButton, TextField, InputAdornment, Button, TablePagination,
  Select, MenuItem, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Checkbox
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DescriptionIcon from "@mui/icons-material/Description";
import StorageIcon from "@mui/icons-material/Storage";
import ArticleIcon from "@mui/icons-material/Article";
import TerminalIcon from "@mui/icons-material/Terminal";
import FeedIcon from "@mui/icons-material/Feed";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FolderZipIcon from "@mui/icons-material/FolderZip";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { api, BASE_URL, getAuthToken } from "../api/http";
import { useI18n } from "../i18n";
import { useActionAccess } from "../auth/useActionAccess";

import { vars, sxPresets } from "../ui/toast/themeBridge";
import {
  PREMIUM_CARD_SX, THEAD_CELL_SX, ROW_CELL_SX, PAGINATION_SX,
  AmbientLighting, TableScanLine
} from "../ui/styles";

/* --- Modals --- */
import UpdateDocumentModal from "../components/Models/UpdateDocumentModal";
import UpdatePassModal from "../components/Models/UpdatePass_schedule_Modal";
import type { DocumentRow as DocModalRow } from "../components/Models/UpdateDocumentModal";
import type { PassRow as PassModalRow } from "../components/Models/UpdatePass_schedule_Modal";

/* ─────────────────────── style constants ─────────────────────── */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;
const BORDER = vars.border;

const ctrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "36px",
    fontSize: 12.5,
    color: TEXT,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: "6px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
    "&:hover fieldset": { borderColor: `${ACCENT}40` },
    "&.Mui-focused fieldset": { borderColor: ACCENT, borderWidth: 1, boxShadow: `0 0 8px ${ACCENT}30` },
  },
  "& .MuiInputBase-input": { padding: "0 14px", fontSize: 12.5, color: TEXT, height: "36px", boxSizing: "border-box" },
  "& .MuiInputBase-input::placeholder": { color: DIM, opacity: 0.6 },
  "& .MuiSvgIcon-root": { fontSize: 18, color: DIM },
  "& .MuiSelect-select": { display: "flex", alignItems: "center", paddingRight: "32px !important", height: "36px", boxSizing: "border-box" },
} as const;

function TypeIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t.includes("pdf")) return <PictureAsPdfIcon sx={{ fontSize: 16, color: "#ff4d4d" }} />;
  if (t.includes("sql")) return <StorageIcon sx={{ fontSize: 16, color: "#4da6ff" }} />;
  if (t.includes("report")) return <ArticleIcon sx={{ fontSize: 16, color: "#ffd24d" }} />;
  if (t.includes("manual")) return <FeedIcon sx={{ fontSize: 16, color: "#4dff88" }} />;
  if (t.includes("plan")) return <DescriptionIcon sx={{ fontSize: 16, color: "#c299ff" }} />;
  if (t.includes("zip") || t.includes("tar")) return <FolderZipIcon sx={{ fontSize: 16, color: "#ff944d" }} />;
  return <TerminalIcon sx={{ fontSize: 16, color: DIM }} />;
}

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

const DOC_TYPES = [
  "License report", "Satellite report", "Passes report", "Project plan", "Flow chart", "Design Document", "User manual", "Other",
] as const;

type DocumentRow = { id: number; sr: number; name: string; type: string; remarks: string; url: string; addedBy: string; dateTime: string };

/* ---------- Page ---------- */
export default function DocumentsPage() {
  const { t } = useI18n();
  const { hasWriteAccess } = useActionAccess();

  const [tab, setTab] = React.useState<"docs" | "pass">("docs");
  const [docTypeFilter, setDocTypeFilter] = React.useState<string>("");
  const [docsSearch, setDocsSearch] = React.useState("");
  const [passSearch, setPassSearch] = React.useState("");

  const [uploadType, setUploadType] = React.useState<string>("");
  const [uploadRemarks, setUploadRemarks] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [passRemarks, setPassRemarks] = React.useState("");
  const [passFile, setPassFile] = React.useState<File | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);

  const [docRows, setDocRows] = React.useState<DocumentRow[]>([]);
  const [passRows, setPassRows] = React.useState<DocumentRow[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);

  const [editDoc, setEditDoc] = React.useState<DocModalRow | null>(null);
  const [editPass, setEditPass] = React.useState<PassModalRow | null>(null);
  const [captchaDocOpen, setCaptchaDocOpen] = React.useState(false);
  const [captchaPassOpen, setCaptchaPassOpen] = React.useState(false);

  const refreshDocs = React.useCallback(async () => {
    try {
      const data = await api.get<any[]>(`/api/documents?_=${Date.now()}`);
      const mapped = (data || []).map((row, i) => ({
        id: row.id, sr: i + 1, name: row.document_name, type: row.doc_type, remarks: row.remarks || "", url: `/api/documents/${row.id}/download`,
        addedBy: row.added_by || "—", dateTime: String(row.updated_at || row.created_at).replace("T", " ").split(".")[0]
      }));
      setDocRows(mapped);
    } catch (e) { console.error(e); }
  }, []);

  const refreshPass = React.useCallback(async () => {
    try {
      const data = await api.get<any[]>(`/api/pass-schedule?_=${Date.now()}`);
      const mapped = (data || []).map((row, i) => ({
        id: row.id, sr: i + 1, name: row.document_name, type: "", remarks: row.remarks || "", url: `/api/pass-schedule/${row.id}/download`,
        addedBy: row.added_by || "—", dateTime: String(row.updated_at || row.created_at).replace("T", " ").split(".")[0]
      }));
      setPassRows(mapped);
    } catch (e) { console.error(e); }
  }, []);

  React.useEffect(() => { refreshDocs(); refreshPass(); }, [refreshDocs, refreshPass]);

  const docsFiltered = React.useMemo(() => {
    const q = docsSearch.trim().toLowerCase();
    return docRows.filter(r => (!docTypeFilter || r.type === docTypeFilter) && (!q || [r.name, r.type, r.remarks].join(" ").toLowerCase().includes(q)));
  }, [docRows, docsSearch, docTypeFilter]);

  const passFiltered = React.useMemo(() => {
    const q = passSearch.trim().toLowerCase();
    return passRows.filter(r => !q || [r.name, r.remarks].join(" ").toLowerCase().includes(q));
  }, [passRows, passSearch]);

  const rows = tab === "docs" ? docsFiltered : passFiltered;
  const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const doDownload = async (url: string, filename: string) => {
    try {
      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}${url}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const bUrl = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = bUrl; a.download = filename; a.click();
      URL.revokeObjectURL(bUrl);
    } catch (e) { console.error(e); }
  };

  const doUploadDoc = async () => {
    if (!file || !uploadType) return;
    try {
      const form = new FormData(); form.append("file", file); form.append("doc_type", uploadType); if (uploadRemarks.trim()) form.append("remarks", uploadRemarks.trim());
      const token = getAuthToken();
      await fetch(`${BASE_URL}/api/documents`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form });
      refreshDocs(); setFile(null); setUploadType(""); setUploadRemarks("");
    } catch (e) { console.error(e); }
  };

  const doUploadPass = async () => {
    if (!passFile) return;
    try {
      const form = new FormData(); form.append("file", passFile); if (passRemarks.trim()) form.append("remarks", passRemarks.trim());
      const token = getAuthToken();
      await fetch(`${BASE_URL}/api/pass-schedule`, { method: "POST", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form });
      refreshPass(); setPassFile(null); setPassRemarks("");
    } catch (e) { console.error(e); }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const toggleAll = () => {
    if (selectedIds.length === paged.length) setSelectedIds([]);
    else setSelectedIds(paged.map(r => r.id));
  };

  const toggleBtnSx = {
    ...sxPresets.btnGhost,
    textTransform: "none", fontWeight: 700, fontSize: 13, px: 3, minWidth: 160, height: 32, borderRadius: "8px !important", color: DIM, border: `1px solid ${BORDER} !important`,
    "&.Mui-selected": { color: ACCENT, bgcolor: `${ACCENT}15`, borderColor: `${ACCENT} !important`, boxShadow: `0 0 10px ${ACCENT}25` },
    "& .MuiTypography-root": { fontSize: 13, fontWeight: 700 }
  };

  const theadCellSx = { ...THEAD_CELL_SX, fontSize: 10, fontWeight: 800, textAlign: "center", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "var(--thead-text)", borderBottom: `1px solid ${BORDER}`, whiteSpace: "nowrap" as const };
  const bodyCellSx = { ...ROW_CELL_SX, textAlign: "center" as const, fontSize: 12.5, borderBottom: `1px solid ${vars.borderWeak}`, color: TEXT };

  return (
    <MainLayout title=" ">
      <Box sx={{ px: 2, pt: 1, pb: 2, height: `calc(100vh - ${TOPBAR_HEIGHT}px)`, display: "flex", flexDirection: "column" }}>
        <Card elevation={0} sx={{ ...PREMIUM_CARD_SX, flex: 1, display: "flex", flexDirection: "column" }}>
          <AmbientLighting />
          <TableScanLine />

          {/* Premium Integrated Header (Instrumentation Panel) */}
          <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${BORDER}`, zIndex: 1, position: "relative", display: "flex", flexDirection: "column", gap: 2.5 }}>

            {/* Top Row: Navigation and Main Filters */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v && setTab(v)} size="small" sx={{ bgcolor: "rgba(0,0,0,0.3)", borderRadius: "12px", p: 0.4, border: `1px solid ${BORDER}` }}>
                  <ToggleButton value="docs" sx={toggleBtnSx}>{t("Documents")}</ToggleButton>
                  <ToggleButton value="pass" sx={toggleBtnSx}>{t("Pass Schedule")}</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Labeled label={t("Global Search")} width={260}>
                  <TextField
                    value={tab === "docs" ? docsSearch : passSearch}
                    onChange={(e) => tab === "docs" ? setDocsSearch(e.target.value) : setPassSearch(e.target.value)}
                    placeholder={t("Filter by name, type...")}
                    size="small"
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: ACCENT }} /></InputAdornment> }}
                    sx={ctrlSx}
                  />
                </Labeled>
                {tab === "docs" && (
                  <Labeled label={t("Category Filter")} width={180}>
                    <Select value={docTypeFilter} onChange={(e) => setDocTypeFilter(e.target.value)} sx={ctrlSx}>
                      <MenuItem value="">{t("All Categories")}</MenuItem>
                      {DOC_TYPES.map(T => <MenuItem key={T} value={T}>{T}</MenuItem>)}
                    </Select>
                  </Labeled>
                )}
              </Box>
            </Box>

            {/* Bottom Row: Control Bar (Gated Actions) */}
            <Box sx={{
              display: "flex", alignItems: "flex-end", gap: 2.5, px: 2.5, py: 1.5,
              bgcolor: "rgba(255,255,255,0.02)", borderRadius: "12px", border: `1px solid rgba(255,255,255,0.05)`,
              boxShadow: "inset 0 0 20px rgba(0,0,0,0.2)"
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mr: 1, mb: 1 }}>
                <CloudUploadIcon sx={{ color: ACCENT, fontSize: 18 }} />
                <Typography sx={{ color: TEXT, fontWeight: 900, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("Data Ingestion")}
                </Typography>
              </Box>

              {tab === "docs" && hasWriteAccess("documents") && (
                <>
                  <Labeled label={t("Target Type")} width={180}>
                    <Select value={uploadType} onChange={(e) => setUploadType(e.target.value)} displayEmpty sx={ctrlSx}>
                      <MenuItem value="" disabled>{t("Select classification")}</MenuItem>
                      {DOC_TYPES.map(T => <MenuItem key={T} value={T}>{T}</MenuItem>)}
                    </Select>
                  </Labeled>
                  <Labeled label={t("Meta Remarks")} width={200}>
                    <TextField value={uploadRemarks} onChange={(e) => setUploadRemarks(e.target.value)} placeholder={t("Audit note...")} size="small" sx={ctrlSx} />
                  </Labeled>
                  <Button component="label" variant="outlined" sx={{
                    ...ctrlSx, textTransform: "none", height: 32, px: 2, minWidth: 160,
                    borderColor: BORDER, whiteSpace: "nowrap", bgcolor: "rgba(255,255,255,0.03)",
                    "&:hover": { borderColor: ACCENT, bgcolor: `${ACCENT}10` }
                  }}>
                    <Box sx={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", fontWeight: 700 }}>{file ? file.name : t("Select File")}</Box>
                    <input type="file" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </Button>
                  <Button variant="outlined" disabled={!file || !uploadType} onClick={() => setCaptchaDocOpen(true)} sx={{
                    ...ctrlSx, textTransform: "none", height: 32, px: 2, minWidth: 160,
                    borderColor: BORDER, whiteSpace: "nowrap", bgcolor: "rgba(255,255,255,0.03)", color: TEXT,
                    "&:hover": { borderColor: ACCENT, bgcolor: `${ACCENT}10` },
                    "&.Mui-disabled": { borderColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", opacity: 0.5 }
                  }}>
                    <Box sx={{ fontWeight: 700 }}>{t("Upload")}</Box>
                  </Button>
                </>
              )}

              {tab === "pass" && hasWriteAccess("pass_upload") && (
                <>
                  <Labeled label={t("Operation Remarks")} width={300}>
                    <TextField value={passRemarks} onChange={(e) => setPassRemarks(e.target.value)} placeholder={t("Schedule version details...")} size="small" sx={ctrlSx} />
                  </Labeled>
                  <Button component="label" variant="outlined" sx={{
                    ...ctrlSx, textTransform: "none", height: 32, px: 2, minWidth: 220, borderColor: BORDER,
                    bgcolor: "rgba(255,255,255,0.03)", "&:hover": { borderColor: ACCENT, bgcolor: `${ACCENT}10` }
                  }}>
                    <Box sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", fontWeight: 700, fontSize: 11 }}>{passFile ? passFile.name : t("Select Schedule")}</Box>
                    <input type="file" hidden onChange={(e) => setPassFile(e.target.files?.[0] ?? null)} />
                  </Button>
                  <Button variant="outlined" disabled={!passFile} onClick={() => setCaptchaPassOpen(true)} sx={{
                    ...ctrlSx, textTransform: "none", height: 32, px: 2, minWidth: 220,
                    borderColor: BORDER, whiteSpace: "nowrap", bgcolor: "rgba(255,255,255,0.03)", color: TEXT,
                    "&:hover": { borderColor: ACCENT, bgcolor: `${ACCENT}10` },
                    "&.Mui-disabled": { borderColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.2)", opacity: 0.5 }
                  }}>
                    <Box sx={{ fontWeight: 700, fontSize: 11 }}>{t("Upload Schedule")}</Box>
                  </Button>
                </>
              )}
            </Box>
          </Box>

          {/* Table Area */}
          <TableContainer sx={{ flex: 1, overflowY: "auto", position: "relative", zIndex: 1, ...sxPresets.scroller }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={{ borderBottom: `1px solid ${BORDER}` }}>
                    <Checkbox size="small" checked={paged.length > 0 && selectedIds.length === paged.length} onChange={toggleAll} indeterminate={selectedIds.length > 0 && selectedIds.length < paged.length} sx={{ color: DIM, "&.Mui-checked": { color: ACCENT } }} />
                  </TableCell>
                  <TableCell sx={theadCellSx}>{t("Sr No")}</TableCell>
                  <TableCell sx={{ ...theadCellSx, textAlign: "left" }}>{t("Document")}</TableCell>
                  {tab === "docs" && <TableCell sx={theadCellSx}>{t("Doc Type")}</TableCell>}
                  <TableCell sx={theadCellSx}>{t("Added By")}</TableCell>
                  <TableCell sx={theadCellSx}>{t("Date/Time")}</TableCell>
                  <TableCell sx={{ ...theadCellSx, textAlign: "left" }}>{t("Remarks")}</TableCell>
                  <TableCell sx={theadCellSx}>{t("Download")}</TableCell>
                  {(tab === "docs" ? hasWriteAccess("documents") : hasWriteAccess("pass_upload")) && <TableCell sx={theadCellSx}>{t("Action")}</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {paged.map((r) => (
                  <TableRow key={r.id} sx={{
                    bgcolor: "transparent",
                    transition: 'all 0.25s',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      "& .hover-accent": { opacity: 1, height: "70%" }
                    }
                  }}>
                    <TableCell padding="checkbox" sx={{ borderBottom: `1px solid ${vars.borderWeak}`, position: "relative" }}>
                      <Box className="hover-accent" sx={{
                        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                        width: "3px", height: "0%", opacity: 0,
                        background: `linear-gradient(to bottom, transparent, ${ACCENT}, transparent)`,
                        boxShadow: `0 0 10px ${ACCENT}`,
                        transition: "all 0.3s ease",
                        pointerEvents: "none"
                      }} />
                      <Checkbox size="small" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} sx={{ color: DIM, "&.Mui-checked": { color: ACCENT } }} />
                    </TableCell>
                    <TableCell sx={bodyCellSx}>{r.sr}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, textAlign: "left", fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <TypeIcon type={r.type || r.name.split('.').pop() || ""} />
                        {r.name}
                      </Box>
                    </TableCell>
                    {tab === "docs" && <TableCell sx={bodyCellSx}>{r.type}</TableCell>}
                    <TableCell sx={bodyCellSx}>{r.addedBy}</TableCell>
                    <TableCell sx={bodyCellSx}>{r.dateTime}</TableCell>
                    <TableCell sx={{ ...bodyCellSx, textAlign: "left", opacity: 0.8 }}>{r.remarks || "—"}</TableCell>
                    <TableCell sx={bodyCellSx}>
                      <IconButton size="small" onClick={() => doDownload(r.url, r.name)} sx={{ color: ACCENT, "&:hover": { bgcolor: `${ACCENT}15` } }}>
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    {(tab === "docs" ? hasWriteAccess("documents") : hasWriteAccess("pass_upload")) && (
                      <TableCell sx={bodyCellSx}>
                        <Button
                          size="small"
                          variant="contained"
                          sx={{ textTransform: "none", fontWeight: 700, fontSize: 11, px: 1.5, py: 0.3, bgcolor: ACCENT, "&:hover": { bgcolor: "#6b48ea" } }}
                          onClick={() => tab === "docs" ? setEditDoc(r) : setEditPass(r)}
                        >
                          {t("Edit")}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {paged.length === 0 && (
                  <TableRow><TableCell colSpan={9} sx={{ py: 10, textAlign: "center", color: DIM }}>{t("No documents found.")}</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ borderTop: `1px solid ${BORDER}`, bgcolor: "transparent" }}>
            <TablePagination
              component="div"
              count={rows.length}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              sx={PAGINATION_SX}
            />
          </Box>
        </Card>
      </Box>

      {/* Captchas */}
      <CaptchaDialog open={captchaDocOpen} onCancel={() => setCaptchaDocOpen(false)} onOk={() => { setCaptchaDocOpen(false); doUploadDoc(); }} colors={{ CARD: vars.bgCard, TEXT: vars.text, BORDER: vars.border, CTRL: vars.bgCtrl }} t={t} refreshDocs={refreshDocs} />
      <CaptchaDialog open={captchaPassOpen} onCancel={() => setCaptchaPassOpen(false)} onOk={() => { setCaptchaPassOpen(false); doUploadPass(); }} colors={{ CARD: vars.bgCard, TEXT: vars.text, BORDER: vars.border, CTRL: vars.bgCtrl }} t={t} refreshPass={refreshPass} />

      {/* Modals */}
      {editDoc && <UpdateDocumentModal open={!!editDoc} onClose={() => setEditDoc(null)} onSuccess={() => { setEditDoc(null); refreshDocs(); }} row={editDoc} />}
      {editPass && <UpdatePassModal open={!!editPass} onClose={() => setEditPass(null)} onSuccess={() => { setEditPass(null); refreshPass(); }} row={editPass} />}
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
            <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Type the code")} size="small" fullWidth sx={{ "& .MuiOutlinedInput-root": { height: 40, background: colors.CTRL }, "& .MuiInputBase-input": { color: colors.TEXT } }} />
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
