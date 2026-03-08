import React from "react";
import {
    Box, Card, Button, Chip, Typography, TextField, Backdrop,
    CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
    ToggleButtonGroup, ToggleButton, IconButton, Table,
    TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination
} from "@mui/material";
import { InputAdornment, Select, MenuItem, FormControl } from "@mui/material";
import {
    EditOutlined as EditOutlinedIcon,
    Search as SearchIcon,
    PrintOutlined as PrintOutlinedIcon,
    DownloadOutlined as DownloadOutlinedIcon
} from "@mui/icons-material";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import DownloadIcon from "@mui/icons-material/Download";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import api from "../api/http";
import { vars, sxPresets } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";

/* ---------- Shared UI ---------- */
const CARD_SX = {
    bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}`,
    borderRadius: 2, display: "flex", flexDirection: "column",
    backgroundImage: "none", boxShadow: "none",
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

const UI = { ctrlH: 30, font: 13, icon: 16, gap: 0.75, headerPx: 1.25, headerPy: 0.6, searchW: 150, selectW: 120, dateW: 150, paginationH: 36 };

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
    const [tab, setTab] = React.useState<"availability" | "scheduled">("availability");

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
    
    // UI Filters identical to Passes List
    const [mode, setMode] = React.useState<"filter" | "export">("filter");
    const [searchText, setSearchText] = React.useState("");
    const [station, setStation] = React.useState("All");
    const [satellite, setSatellite] = React.useState("All");
    const [statusFilter, setStatusFilter] = React.useState("All");
    const [passType, setPassType] = React.useState("All");
    const [fromDate, setFromDate] = React.useState<Date | null>(null);
    const [toDate, setToDate] = React.useState<Date | null>(null);

    const safeRows = Array.isArray(vsRows) ? vsRows : [];
    
    const stationOptions = ["All", ...Array.from(new Set(safeRows.map(r => r.stn).filter(Boolean)))];
    const satOptions = ["All", ...Array.from(new Set(safeRows.map(r => r.sc).filter(Boolean)))];

    const clearFilters = () => {
        setSearchText(""); setStation("All"); setSatellite("All"); setStatusFilter("All"); setPassType("All");
        setFromDate(null); setToDate(null);
    };

    const filteredRows = safeRows.filter(r => {
        if (tab === "scheduled" && !["requested", "supported", "no_support"].includes(r.pass_status)) return false;
        
        if (station !== "All" && r.stn !== station) return false;
        if (satellite !== "All" && r.sc !== satellite) return false;
        
        // Map operations to passType roughly if possible or just ignore (operations string match)
        if (passType !== "All" && !(r.operations || "").toLowerCase().includes(passType.toLowerCase())) return false;
        
        if (statusFilter !== "All") {
            // Map pass_status roughly
            if (statusFilter === "Pending" && !["idle", "requested"].includes(r.pass_status)) return false;
            if (statusFilter === "Completed" && r.pass_status !== "supported") return false;
            if (statusFilter === "Canceled" && r.pass_status !== "no_support") return false;
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
    const handlePrint = () => window.print();
    const handleCSV = () => {
        const header = ["DATE", "S/C", "STN", "ORBIT", "Max", "AOS", "LOS", "OPERATIONS", "Status"].join(",");
        const csvRows = filteredRows.map(r => [
            r.date_text, r.sc, r.stn, r.orbit, r.max_ele, r.aos, r.los, `"${r.operations || ''}"`, r.pass_status
        ].join(","));
        const blob = new Blob([[header, ...csvRows].join("\n")], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `visibility_schedule_${new Date().toISOString().slice(0,10)}.csv`;
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
                    <Button onClick={() => { if (statusPromptId) updateVsStatus(statusPromptId.id, statusPromptId.newStatus); setStatusPromptId(null); }} variant="contained" sx={purpleBtn}>Yes</Button>
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
                            <ToggleButton value="availability" sx={pillSx}>{t("Pass Availability")}</ToggleButton>
                            <ToggleButton value="scheduled" sx={pillSx}>{t("Pass Scheduled")}</ToggleButton>
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
                                    <Button variant="contained" size="small" onClick={() => fileInputRef.current?.click()} sx={purpleBtn}>Select File</Button>
                                    <Typography sx={{ color: vars.textDim, fontSize: 13, flexGrow: 1 }}>{file ? file.name : "No file selected"}</Typography>
                                    <Button variant="outlined" size="small" onClick={() => setFile(null)} disabled={!file} sx={{ color: vars.textDim, borderColor: vars.border }}>Clear</Button>
                                    <Button variant="contained" size="small" onClick={handleUpload} disabled={!file || uploading} sx={purpleBtn}>Upload</Button>
                                </Box>
                            </Card>
                        )}

                        {/* Main Table Card */}
                        <Card sx={{ ...CARD_SX, border: `1px solid ${vars.border}`, flex: 1, p: 0 }}>
                            {/* Filter Bar */}
                            <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontWeight: 700, color: "#7CA7FF", mr: 2 }}>{tab === "availability" ? "Data List" : "Scheduled Passes"}</Typography>
                                <TextField size="small" placeholder="Filter..." value={searchText} onChange={(e) => { setSearchText(e.target.value); setPage(0); }}
                                    InputProps={{ startAdornment: <SearchIcon sx={{ color: vars.textDim, mr: 1, fontSize: 18 }} /> }}
                                    sx={{ width: 220, "& .MuiOutlinedInput-root": { height: 32 } }} />
                                <Box flexGrow={1} />
                                {tab === "scheduled" && (
                                    <Button onClick={handleCSV} size="small" variant="outlined" startIcon={<DownloadOutlinedIcon />} sx={{ color: vars.text, borderColor: vars.border }}>CSV</Button>
                                )}
                                <Button onClick={handlePrint} size="small" variant="outlined" startIcon={<PrintOutlinedIcon />} sx={{ color: vars.text, borderColor: vars.border }}>Print</Button>
                            </Box>

                            <TableContainer sx={{ maxHeight: "calc(100vh - 350px)" }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            {["DATE", "S/C", "STN", "ORBIT", "Max", "AOS", "LOS", "OPERATIONS"].map(h => (
                                                <TableCell key={h} sx={{ color: vars.textDim, fontWeight: 700, bgcolor: vars.bgApp }}>{h}</TableCell>
                                            ))}
                                            <TableCell sx={{ color: vars.textDim, fontWeight: 700, bgcolor: vars.bgApp, textAlign: "center" }}>Action</TableCell>
                                            <TableCell sx={{ color: vars.textDim, fontWeight: 700, bgcolor: vars.bgApp, textAlign: "center" }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {visibleRows.map(r => (
                                            <TableRow key={r.id}>
                                                <TableCell sx={{ color: vars.text }}>{r.date_text}</TableCell>
                                                <TableCell sx={{ color: vars.text }}>{r.sc}</TableCell>
                                                <TableCell sx={{ color: vars.text }}>{r.stn}</TableCell>
                                                <TableCell sx={{ color: vars.text }}>{r.orbit}</TableCell>
                                                <TableCell sx={{ color: vars.text }}>{r.max_ele}</TableCell>
                                                <TableCell sx={{ color: vars.text }}>{r.aos}</TableCell>
                                                <TableCell sx={{ color: vars.text }}>{r.los}</TableCell>
                                                <TableCell sx={{ color: vars.text }}>{r.operations}</TableCell>

                                                {/* Edit Action */}
                                                <TableCell align="center">
                                                    <IconButton size="small" onClick={() => setEditRow(r)} sx={{ color: vars.textDim }}><EditOutlinedIcon fontSize="small" /></IconButton>
                                                </TableCell>

                                                {/* Status Column */}
                                                <TableCell align="center">
                                                    {tab === "availability" ? (
                                                        <Button
                                                            onClick={() => r.pass_status === "idle" ? updateVsStatus(r.id, "requested") : setCancelPromptId(r.id)}
                                                            size="small"
                                                            sx={r.pass_status === "idle" ? { ...purpleBtn, py: 0.2, px: 1, minWidth: 120 } : { ...grayBtn, py: 0.2, px: 1, minWidth: 120 }}>
                                                            {r.pass_status === "idle" ? "Request Pass" : "Pass requested"}
                                                        </Button>
                                                    ) : (
                                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: "center" }}>
                                                            <Button size="small"
                                                                variant={r.pass_status === "supported" ? "contained" : "outlined"}
                                                                onClick={() => r.pass_status === "supported" ? null : (r.pass_status === "requested" ? updateVsStatus(r.id, "supported") : setStatusPromptId({ id: r.id, newStatus: "supported" }))}
                                                                sx={r.pass_status === "supported" ? { ...purpleBtn, py: 0.2 } : { borderColor: vars.border, color: vars.textDim, py: 0.2 }}>
                                                                Support
                                                            </Button>
                                                            <Button size="small"
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
                            <TablePagination component="div" count={filteredRows.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={() => setPage(0)} />
                        </Card>
                    </Box>
                </Card>
            </Box>
        </MainLayout>
    );
}
