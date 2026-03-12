import React from "react";
import {
    Box, Card, Button, Typography, Backdrop, TextField,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    ToggleButtonGroup, ToggleButton, IconButton, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination
} from "@mui/material";
import { Select, MenuItem, FormControl } from "@mui/material";
import {
    EditOutlined as EditOutlinedIcon,
    DownloadOutlined as DownloadOutlinedIcon
} from "@mui/icons-material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import api from "../api/http";
import { vars, sxPresets } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";
import { useActionAccess } from "../auth/useActionAccess";

/* ---------- Shared UI ---------- */
const CARD_SX = {
    bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}`,
    borderRadius: 2, display: "flex", flexDirection: "column",
    backgroundImage: "none", boxShadow: "none",
} as const;

const TABLE_SCROLL_SX = {
    overflow: "auto",
    scrollbarColor: `${vars.border} transparent`,
    "&::-webkit-scrollbar": { width: 8, height: 8 },
    "&::-webkit-scrollbar-thumb": { background: vars.border, borderRadius: 8 },
    "&::-webkit-scrollbar-track": { background: "transparent" },
} as const;

const SCROLLER_SX = { ...sxPresets.scroller };

/* IAM Tab Styling */
const GREEN = "#7CFF8D";
const GREEN_BORDER_DARK = "rgba(124,255,141,0.18)";
const SELECTED_BG_DARK = "#0E0E10";
const SELECTED_BG_LIGHT = "#FFFFFF";

const getSelectedBg = (t: any) => (t.palette.mode === "dark" ? SELECTED_BG_DARK : SELECTED_BG_LIGHT);
const getSelectedBord = (t: any) => (t.palette.mode === "dark" ? GREEN_BORDER_DARK : GREEN);
const getHoverBg = (t: any) => (t.palette.mode === "dark" ? "#0F1113" : "#FFFFFF");

const pillSx = {
    textTransform: "none", fontWeight: 700, fontSize: 13, px: 2, height: 32, lineHeight: "32px",
    borderRadius: 999, color: vars.textDim, bgcolor: "transparent",
    "&.Mui-selected": {
        color: GREEN, bgcolor: (t: any) => getSelectedBg(t),
        border: (t: any) => `1px solid ${getSelectedBord(t)}`,
        boxShadow: (t: any) => (t.palette.mode === "dark" ? "inset 0 0 0 1px rgba(124,255,141,0.06)" : "inset 0 0 0 1px rgba(124,255,141,0.12)"),
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

/* ============= Data types ============= */
interface VSRow {
    id: number; date_text: string; sc: string; stn: string; orbit: string;
    max_ele: string; aos: string; los: string; operations: string;
    pass_status: "idle" | "requested" | "supported" | "no_support";
}

/* ============= MAIN PAGE ============= */

/* ==================== THEME TOKENS & UI ==================== */
const TOK = {
    TEXT: "var(--text)", TEXT_DIM: "var(--text-dim)", CARD_BG: "var(--bg-card)",
    CONTROL_BG: "var(--bg-ctrl)", BORDER_STR: "1px solid var(--border)",
    BORDER_WEAK: "var(--border-weak)", ICON: "var(--text)", ACCENT: "var(--accent)",
    HOVER: "var(--bg-hover)", SCROLLBAR: "var(--scrollbar)",
} as const;

const UI = { ctrlH: 30, font: 13, icon: 16, gap: 0.75, headerPx: 1.25, headerPy: 0.6, searchW: 150, selectW: 120, dateW: 120, paginationH: 36 };

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

export default function VisibilitySchedule() {
    const { t } = useI18n();
    const { hasReadAccess, hasWriteAccess } = useActionAccess();

    // Fallback: If they have availability read access, select it, otherwise scheduled.
    const [tab, setTab] = React.useState<"availability" | "scheduled">(hasReadAccess("pass_availability") ? "availability" : "scheduled");

    // Strictly strictly tied to the active tab's write permission.
    const canWrite = tab === "availability" ? hasWriteAccess("pass_availability") : hasWriteAccess("pass_scheduled");

    /* ---- Data ---- */
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
            await fetchData();
            setFile(null);
            alert(t("Upload successful"));
        } catch (e: any) { alert("Upload failed: " + (e?.response?.data?.error || e?.message)); }
        finally { setUploading(false); }
    };

    /* ---- Filters & Pagination ---- */
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);

    // Filter controls
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
        if (tab === "scheduled" && !["requested", "supported", "no_support"].includes(r.pass_status)) return false;

        if (station !== "All" && r.stn !== station) return false;
        if (satellite !== "All" && r.sc !== satellite) return false;

        if (statusFilter !== "All") {
            if (statusFilter === "Pending" && !["idle", "requested"].includes(r.pass_status)) return false;
            if (statusFilter === "Support" && r.pass_status !== "supported") return false;
            if (statusFilter === "No Support" && r.pass_status !== "no_support") return false;
        }

        if (searchText) {
            const hay = `${r.date_text} ${r.sc} ${r.stn} ${r.operations} ${r.orbit}`.toLowerCase();
            if (!hay.includes(searchText.toLowerCase())) return false;
        }

        if (fromDate || toDate) {
            const parts = r.date_text.split(/[/-]/).map((x) => parseInt(x, 10));
            const dt = new Date(parts[0], parts[1] - 1, parts[2]); // YYYY-MM-DD
            if (fromDate && dt < new Date(new Date(fromDate).setHours(0, 0, 0, 0))) return false;
            if (toDate && dt > new Date(new Date(toDate).setHours(23, 59, 59, 999))) return false;
        }

        return true;
    });

    const visibleRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    /* ---- Actions ---- */
    const updateVsStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/api/visibility-schedule/${id}`, { pass_status: status });
            setVsRows(prev => prev.map(r => r.id === id ? { ...r, pass_status: status as any } : r));
        } catch (e) { alert("Failed to update status"); }
    };

    const supportPass = async (id: number) => {
        try {
            await api.post(`/api/visibility-schedule/${id}/support`);
            setVsRows(prev => prev.map(r => r.id === id ? { ...r, pass_status: "supported" as any } : r));
        } catch (e) { alert("Failed to support pass"); }
    };

    /* Popups */
    const [cancelPromptId, setCancelPromptId] = React.useState<number | null>(null);
    const [statusPromptId, setStatusPromptId] = React.useState<{ id: number, newStatus: string } | null>(null);
    const [editRow, setEditRow] = React.useState<VSRow | null>(null);

    const saveEdit = async () => {
        if (!editRow) return;
        try {
            await api.put(`/api/visibility-schedule/${editRow.id}`, editRow);
            setVsRows(prev => prev.map(r => r.id === editRow.id ? editRow : r));
            setEditRow(null);
        } catch (e) { alert("Failed to update row"); }
    };

    /* Exports */
    const handleCSV = () => {
        const header = ["DATE", "S/C", "STN", "ORBIT", "Max", "AOS", "LOS", "OPERATIONS", "Status"].join(",");
        const csvRows = filteredRows.map(r => [
            r.date_text, r.sc, r.stn, r.orbit, r.max_ele, r.aos, r.los, `"${r.operations || ''}"`, r.pass_status
        ].join(","));
        const blob = new Blob([[header, ...csvRows].join("\n")], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visibility_schedule_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <MainLayout title="">
            <Backdrop open={uploading || loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            {/* Cancel Request Dialog */}
            <Dialog open={cancelPromptId !== null} onClose={() => setCancelPromptId(null)} PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Do you want to cancel the Pass Request?</DialogTitle>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCancelPromptId(null)} sx={{ color: vars.textDim }}>No</Button>
                    <Button onClick={() => { if (cancelPromptId) updateVsStatus(cancelPromptId, "idle"); setCancelPromptId(null); }} variant="contained" sx={purpleBtn}>Yes</Button>
                </DialogActions>
            </Dialog>

            {/* Change Status Dialog */}
            <Dialog open={statusPromptId !== null} onClose={() => setStatusPromptId(null)} PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Do you want to change the Pass Status?</DialogTitle>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setStatusPromptId(null)} sx={{ color: vars.textDim }}>No</Button>
                    <Button onClick={() => {
                        if (statusPromptId) {
                            if (statusPromptId.newStatus === "supported") {
                                supportPass(statusPromptId.id);
                            } else {
                                updateVsStatus(statusPromptId.id, statusPromptId.newStatus);
                            }
                        }
                        setStatusPromptId(null);
                    }} variant="contained" sx={purpleBtn}>Yes</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Row Dialog */}
            <Dialog open={!!editRow} onClose={() => setEditRow(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Edit Pass Data</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                    {editRow && ["date_text", "sc", "stn", "orbit", "max_ele", "aos", "los", "operations"].map((field) => (
                        <TextField key={field} label={field.toUpperCase().replace("_TEXT", "")} size="small"
                            value={(editRow as any)[field] || ""} onChange={(e) => setEditRow({ ...editRow, [field]: e.target.value })}
                            sx={(tm) => ({ "& .MuiOutlinedInput-root": { bgcolor: tm.palette.mode === "dark" ? "#232325" : "#fff", color: vars.text } })} />
                    ))}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setEditRow(null)} sx={{ color: vars.textDim }}>Cancel</Button>
                    <Button onClick={saveEdit} variant="contained" sx={purpleBtn}>Save</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ px: 2, py: 1.5 }}>
                <Card sx={{ ...CARD_SX, width: "100%", height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)` }}>
                    {/* IAM Style Tabs */}
                    <Box sx={{ px: 1.25, py: 0.6, borderBottom: `1px solid ${vars.border}`, display: "flex", justifyContent: "flex-start" }}>
                        <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => { if (v) { setTab(v); setPage(0); } }} sx={{ borderRadius: 999, border: `1px solid ${vars.border}`, p: 0.5 }}>
                            {hasReadAccess("pass_availability") && (
                                <ToggleButton value="availability" sx={pillSx}>{t("Pass Availability")}</ToggleButton>
                            )}
                            {hasReadAccess("pass_scheduled") && (
                                <ToggleButton value="scheduled" sx={pillSx}>{t("Pass Scheduled")}</ToggleButton>
                            )}
                        </ToggleButtonGroup>
                    </Box>

                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2, ...SCROLLER_SX }}>
                        {/* Upload Section (Only in Availability) */}
                        {tab === "availability" && (
                            <Card sx={{ ...CARD_SX, border: `1px solid ${vars.border}`, mb: 2, p: 0 }}>
                                <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}` }}>
                                    <Typography sx={{ fontWeight: 700, color: "#7CA7FF" }}>Pass Visibility Upload</Typography>
                                </Box>
                                <Box sx={{ px: 2, py: 1.5, display: "flex", gap: 2, alignItems: "center" }}>
                                    <input ref={fileInputRef} type="file" hidden accept=".ant" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                    <Button variant="contained" size="small" disabled={!canWrite} onClick={() => fileInputRef.current?.click()} sx={purpleBtn}>Select File</Button>
                                    <Typography sx={{ color: vars.textDim, fontSize: 13, flexGrow: 1 }}>{file ? file.name : "No file selected"}</Typography>
                                    <Button variant="outlined" size="small" onClick={() => setFile(null)} disabled={!file || !canWrite} sx={{ color: vars.textDim, borderColor: vars.border }}>Clear</Button>
                                    <Button variant="contained" size="small" onClick={handleUpload} disabled={!file || uploading || !canWrite} sx={purpleBtn}>Upload</Button>
                                </Box>
                            </Card>
                        )}

                        {/* Main Table Card */}
                        <Card sx={{
                            ...CARD_SX,
                            border: `1px solid ${vars.border}`,
                            flex: 1,
                            p: 0,
                            "--passes-thead-bg": "#000000",
                            "--passes-thead-text": "#ffffff",
                            "--row-stripe": "rgba(255,255,255,0.06)",
                            ".theme-dark &": {
                                "--passes-thead-bg": "#000000",
                                "--passes-thead-text": "#ffffff",
                                "--row-stripe": "rgba(255,255,255,0.06)",
                            }
                        }}>
                            {/* Filter Bar */}
                            <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: UI.gap }}>
                                <Typography sx={{ fontWeight: 700, color: "#7CA7FF", mr: 2 }}>{tab === "availability" ? "Data List" : "Scheduled Passes"}</Typography>

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

                                <Labeled label={t("Status")} width={UI.selectW}>
                                    <FormControl size="small" fullWidth>
                                        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} MenuProps={lightMenu} sx={compactSelectSx}>
                                            {["All", "Pending", "Support", "No Support"].map(s => <MenuItem key={s} value={s}>{t(s)}</MenuItem>)}
                                        </Select>
                                    </FormControl>
                                </Labeled>

                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Labeled label={t("From Date")} width={UI.dateW}>
                                        <DatePicker value={fromDate} onChange={(v) => { setFromDate(v); setPage(0); }} slotProps={{ textField: { size: "small", sx: { width: UI.dateW, bgcolor: TOK.CONTROL_BG, borderRadius: 1, "& .MuiOutlinedInput-root": { height: 30, paddingLeft: 0 }, "& input": { height: 28, fontSize: 13, padding: "0 10px !important" } } } }} />
                                    </Labeled>
                                    <Labeled label={t("To Date")} width={UI.dateW}>
                                        <DatePicker value={toDate} onChange={(v) => { setToDate(v); setPage(0); }} slotProps={{ textField: { size: "small", sx: { width: UI.dateW, bgcolor: TOK.CONTROL_BG, borderRadius: 1, "& .MuiOutlinedInput-root": { height: 30, paddingLeft: 0 }, "& input": { height: 28, fontSize: 13, padding: "0 10px !important" } } } }} />
                                    </Labeled>
                                </LocalizationProvider>

                                <Button onClick={clearFilters} size="small" sx={{ color: "#2563eb", textTransform: "none", fontWeight: 700, mt: 2 }}>{t("Clear")}</Button>

                                <Box flexGrow={1} />

                                <Button onClick={handleCSV} size="small" variant="contained" startIcon={<DownloadOutlinedIcon />} sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#16a34a", color: "#fff", height: UI.ctrlH, minHeight: UI.ctrlH, lineHeight: `${UI.ctrlH}px`, borderRadius: 1, "& .MuiSvgIcon-root": { color: "#fff" }, "&:hover": { bgcolor: "#14833e", color: "#fff" } }}>CSV</Button>
                            </Box>

                            <TableContainer sx={{ maxHeight: "calc(100vh - 350px)", ...TABLE_SCROLL_SX }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ color: "var(--passes-thead-text)", fontWeight: 700, bgcolor: "var(--passes-thead-bg)", whiteSpace: "nowrap" }}>Sr No.</TableCell>
                                            {["DATE", "S/C", "STN", "ORBIT", "Max", "AOS", "LOS", "OPERATIONS"].map(h => (
                                                <TableCell key={h} sx={{ color: "var(--passes-thead-text)", fontWeight: 700, bgcolor: "var(--passes-thead-bg)", whiteSpace: "nowrap" }}>{h}</TableCell>
                                            ))}
                                            <TableCell sx={{ color: "var(--passes-thead-text)", fontWeight: 700, bgcolor: "var(--passes-thead-bg)", textAlign: "center", whiteSpace: "nowrap" }}>Action</TableCell>
                                            <TableCell sx={{ color: "var(--passes-thead-text)", fontWeight: 700, bgcolor: "var(--passes-thead-bg)", textAlign: "center", whiteSpace: "nowrap" }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {visibleRows.map((r, index) => (
                                            <TableRow key={r.id} sx={{ bgcolor: index % 2 ? "var(--row-stripe)" : "transparent" }}>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{(page * rowsPerPage) + index + 1}</TableCell>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{r.date_text}</TableCell>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{r.sc}</TableCell>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{r.stn}</TableCell>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{r.orbit}</TableCell>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{r.max_ele}</TableCell>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{r.aos}</TableCell>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{r.los}</TableCell>
                                                <TableCell sx={{ color: vars.text, whiteSpace: "nowrap" }}>{r.operations}</TableCell>

                                                {/* Edit Action */}
                                                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                                                    <IconButton size="small" disabled={!canWrite} onClick={() => setEditRow(r)} sx={{ color: vars.textDim }}><EditOutlinedIcon fontSize="small" /></IconButton>
                                                </TableCell>

                                                {/* Status Column */}
                                                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                                                    {tab === "availability" ? (
                                                        <Button
                                                            onClick={() => r.pass_status === "idle" ? updateVsStatus(r.id, "requested") : setCancelPromptId(r.id)}
                                                            size="small"
                                                            disabled={!canWrite}
                                                            sx={r.pass_status === "idle" ? { ...purpleBtn, py: 0.2, px: 1, minWidth: 120 } : { ...grayBtn, py: 0.2, px: 1, minWidth: 120 }}>
                                                            {r.pass_status === "idle" ? "Request Pass" : "Pass requested"}
                                                        </Button>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: "center" }}>
                                                            <Button size="small"
                                                                disabled={!canWrite}
                                                                variant={r.pass_status === "supported" ? "contained" : "outlined"}
                                                                onClick={() => r.pass_status === "supported" ? null : (r.pass_status === "requested" ? supportPass(r.id) : setStatusPromptId({ id: r.id, newStatus: "supported" }))}
                                                                sx={r.pass_status === "supported" ? { ...purpleBtn, py: 0.2 } : { borderColor: vars.border, color: vars.textDim, py: 0.2 }}>
                                                                Support
                                                            </Button>
                                                            <Button size="small"
                                                                disabled={!canWrite}
                                                                variant={r.pass_status === "no_support" ? "contained" : "outlined"}
                                                                onClick={() => r.pass_status === "no_support" ? null : (r.pass_status === "requested" ? updateVsStatus(r.id, "no_support") : setStatusPromptId({ id: r.id, newStatus: "no_support" }))}
                                                                sx={r.pass_status === "no_support" ? { ...redBtn, py: 0.2 } : { borderColor: vars.border, color: vars.textDim, py: 0.2 }}>
                                                                No Support
                                                            </Button>
                                                        </Box>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {visibleRows.length === 0 && (
                                            <TableRow><TableCell colSpan={10} sx={{ textAlign: "center", py: 4, color: vars.textDim }}>No passes found.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination component="div" count={filteredRows.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[25, 50, 100]} />
                        </Card>
                    </Box>
                </Card>
            </Box>
        </MainLayout>
    );
}
