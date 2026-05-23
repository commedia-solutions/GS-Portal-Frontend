// Pass List – shows all published passes from visibility_schedule
import React from "react";
import {
    Box, Card, Button, Typography, Backdrop, CircularProgress,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TablePagination, Checkbox, Dialog, DialogTitle, DialogActions
} from "@mui/material";
import { Select, MenuItem, FormControl } from "@mui/material";
import { DownloadOutlined as DownloadOutlinedIcon, DeleteOutlined as DeleteOutlinedIcon } from "@mui/icons-material";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import api, { apiFetch } from "../../api/http";
import { useActionAccess } from "../../auth/useActionAccess";
import { vars, sxPresets } from "../../ui/toast/themeBridge";
import { useI18n } from "../../i18n";
import DateRangeUI from "../../components/DateRangeUI";

/* ---------- Types ---------- */
interface VSRow {
    id: number;
    date_text: string;
    sc: string;
    stn: string;
    orbit: string;
    max_ele: string;
    aos: string;
    los: string;
    operations: string;
    pass_status: string;
    post_pass_status: string;
}

/* ---------- Shared UI tokens ---------- */
const CARD_SX = {
    position: 'relative',
    overflow: 'hidden',
    bgcolor: vars.bgCard,
    backdropFilter: "blur(20px)",
    border: `1px solid ${vars.border}`,
    borderRadius: '20px',
    display: "flex", flexDirection: "column",
    backgroundImage: "none", boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
} as const;

const PAGINATION_SX = {
    px: 1,
    bgcolor: vars.bgCard,
    color: vars.text,
    borderTop: `1px solid ${vars.border}`,
    "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0, pl: 1, pr: 1, gap: 0.5 },
    "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 12, m: 0, color: vars.textDim, fontWeight: 600 },
    "& .MuiTablePagination-input": { fontSize: 12, m: 0, color: vars.text },
    "& .MuiTablePagination-select": { bgcolor: vars.bgCtrl, borderRadius: "6px", fontSize: 12, fontWeight: 700, px: 1, mr: 2, display: 'flex', alignItems: 'center', height: 28 },
    "& .MuiIconButton-root": { color: vars.text, p: 0.5, "&:hover": { bgcolor: vars.bgHover }, "&.Mui-disabled": { color: vars.textWeak } },
    ".MuiSvgIcon-root": { fontSize: 20 },
} as const;

const TABLE_SCROLL_SX = {
    overflow: "auto",
    scrollbarColor: `${vars.border} transparent`,
    "&::-webkit-scrollbar": { width: 8, height: 8 },
    "&::-webkit-scrollbar-thumb": { background: vars.border, borderRadius: 8 },
    "&::-webkit-scrollbar-track": { background: "transparent" },
} as const;

const SCROLLER_SX = { ...sxPresets.scroller };

const TOK = {
    TEXT: "var(--text)", TEXT_DIM: "var(--text-dim)", CARD_BG: "var(--bg-card)",
    CONTROL_BG: "var(--bg-ctrl)", BORDER_STR: "1px solid var(--border)",
    BORDER_WEAK: "var(--border-weak)", ICON: "var(--text)",
} as const;

const UI = { ctrlH: 30, font: 13, icon: 16, gap: 0.75, selectW: 120, dateW: 120 };

const compactSelectSx = {
    bgcolor: TOK.CONTROL_BG, borderRadius: 1, color: TOK.TEXT,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: TOK.BORDER_WEAK },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "var(--border)" },
    "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, paddingLeft: 0 },
    "& .MuiSelect-select": {
        height: `${UI.ctrlH - 2}px`, lineHeight: `${UI.ctrlH - 2}px`, padding: "0 28px 0 10px !important",
        display: "flex", alignItems: "center", fontSize: UI.font, color: TOK.TEXT,
    },
    "& .MuiSvgIcon-root": { fontSize: UI.icon, color: TOK.ICON },
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

/* ---------- Status badge ---------- */
const getBadgeStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    if (s.includes("approved") || s.includes("supported") || s.includes("done") || s.includes("completed"))
        return { bgcolor: "rgba(0, 255, 157, 0.1)", color: "#00FF9D" };
    if (s.includes("pending") || s.includes("requested") || s.includes("triaged"))
        return { bgcolor: "rgba(255, 184, 0, 0.12)", color: "#FFB800" };
    if (s.includes("rejected") || s.includes("failed") || s.includes("cancelled") || s.includes("no_support"))
        return { bgcolor: "rgba(255, 46, 99, 0.1)", color: "#FF2E63" };
    return { bgcolor: "rgba(255, 255, 255, 0.08)", color: "#E0E0E0" };
};

function PassStatusBadge({ status }: { status: string }) {
    const s = getBadgeStyle(status);
    return (
        <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            px: 1.5, py: 0.5, borderRadius: "6px",
            bgcolor: `${s.color}15`, border: `1px solid ${s.color}33`,
            color: s.color, minWidth: 100, justifyContent: "center"
        }}>
            <Box sx={{
                width: 6, height: 6, borderRadius: "50%", bgcolor: s.color,
                boxShadow: `0 0 10px ${s.color}, 0 0 4px ${s.color}`
            }} />
            <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                {(status || "—").toUpperCase()}
            </Typography>
        </Box>
    );
}

function PostPassBadge({ status }: { status: string }) {
    const currentStatus = status || "Pending";
    const s = getBadgeStyle(currentStatus);
    return (
        <Box sx={{
            display: "inline-flex", alignItems: "center", gap: 1,
            px: 1.5, py: 0.5, borderRadius: "6px",
            bgcolor: `${s.color}15`, border: `1px solid ${s.color}33`,
            color: s.color, minWidth: 100, justifyContent: "center"
        }}>
            <Box sx={{
                width: 6, height: 6, borderRadius: "50%", bgcolor: s.color,
                boxShadow: `0 0 10px ${s.color}, 0 0 4px ${s.color}`
            }} />
            <Typography sx={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                {currentStatus.toUpperCase()}
            </Typography>
        </Box>
    );
}


/* ---------- Main Page ---------- */
export default function PassListVisSchedule() {
    const { t } = useI18n();

    const [rows, setRows] = React.useState<VSRow[]>([]);
    const [loading, setLoading] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/visibility-schedule");
            setRows(Array.isArray(res) ? res : (res?.data || []));
        } catch (e) {
            console.error(e);
            setRows([]);
        } finally { setLoading(false); }
    }, []);

    React.useEffect(() => { fetchData(); }, [fetchData]);

    /* Filters */
    const [station, setStation] = React.useState("All");
    const [satellite, setSatellite] = React.useState("All");
    const [fromDate, setFromDate] = React.useState<Date | null>(null);
    const [toDate, setToDate] = React.useState<Date | null>(null);

    const safeRows = Array.isArray(rows) ? rows : [];
    const stationOptions = ["All", ...Array.from(new Set(safeRows.map(r => r.stn).filter(Boolean)))];
    const satOptions = ["All", ...Array.from(new Set(safeRows.map(r => r.sc).filter(Boolean)))];

    const clearFilters = () => { setStation("All"); setSatellite("All"); setFromDate(null); setToDate(null); };

    const filtered = safeRows.filter(r => {
        if (station !== "All" && r.stn !== station) return false;
        if (satellite !== "All" && r.sc !== satellite) return false;
        if (fromDate || toDate) {
            const parts = r.date_text.split(/[/-]/).map(x => parseInt(x, 10));
            const dt = new Date(parts[0], parts[1] - 1, parts[2]);
            if (fromDate && dt < new Date(new Date(fromDate).setHours(0, 0, 0, 0))) return false;
            if (toDate && dt > new Date(new Date(toDate).setHours(23, 59, 59, 999))) return false;
        }
        return true;
    });

    /* Pagination */
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(25);
    const visible = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    /* Delete Logic */
    const { hasWriteAccess } = useActionAccess();
    const canWrite = hasWriteAccess("pass_list");

    const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
    const [deletePrompt, setDeletePrompt] = React.useState(false);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === visible.length && visible.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(visible.map(r => r.id));
        }
    };

    const handleDelete = async () => {
        try {
            await apiFetch("/api/visibility-schedule", {
                method: "DELETE",
                body: JSON.stringify({ ids: selectedIds }),
                headers: { "Content-Type": "application/json" }
            });
            setRows(prev => prev.filter(r => !selectedIds.includes(r.id)));
            setSelectedIds([]);
            setDeletePrompt(false);
        } catch (e) {
            alert("Failed to delete passes.");
        }
    };

    /* CSV export */
    const handleCSV = () => {
        const header = ["DATE", "S/C", "STN", "ORBIT", "Max", "AOS", "LOS", "OPERATIONS", "Status", "Post Pass Status"].join(",");
        const csvRows = filtered.map(r => [
            r.date_text, r.sc, r.stn, r.orbit, r.max_ele, r.aos, r.los,
            `"${r.operations || ''}"`, r.pass_status, r.post_pass_status || "Pending"
        ].join(","));
        const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pass_list_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    const theadCellSx = {
        px: 1, py: 1.5,
        fontWeight: 800, fontSize: 9.5,
        textAlign: "center", textTransform: 'uppercase' as const,
        letterSpacing: '0.12em', color: "var(--thead-text)",
        bgcolor: vars.bgThead, borderBottom: `1px solid ${vars.border}`,
        whiteSpace: "nowrap" as const
    };

    const bodyCellSx = {
        padding: "12px 14px", overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const, minWidth: "80px", textAlign: "center" as const,
        fontSize: 12, borderBottom: `1px solid ${vars.borderWeak}`,
    };

    return (
        <MainLayout title="">
            <Backdrop open={loading} sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}>
                <CircularProgress color="inherit" />
            </Backdrop>

            <Dialog open={deletePrompt} onClose={() => setDeletePrompt(false)} PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
                <DialogTitle sx={{ fontWeight: 700 }}>Delete {selectedIds.length > 0 ? `${selectedIds.length} selected` : "all"} pass{selectedIds.length !== 1 ? "es" : ""}?</DialogTitle>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeletePrompt(false)} sx={{ color: vars.textDim }}>Cancel</Button>
                    <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: "#ef4444", color: "#fff", "&:hover": { bgcolor: "#dc2626" } }}>Delete</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ px: 2, py: 1.5 }}>
                <Card sx={{ ...CARD_SX, width: "100%", height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)` }}>
                    {/* Ambient Volumetric Lighting */}
                    <Box sx={{
                        position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%',
                        background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08), transparent 70%)',
                        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
                    }} />
                    <Box sx={{
                        position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%',
                        background: 'radial-gradient(circle, rgba(124, 110, 245, 0.08), transparent 70%)',
                        filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
                    }} />

                    {/* Page header */}
                    <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}` }}>
                        <Typography sx={{ fontWeight: 700, color: "#7CA7FF", fontSize: 15 }}>Pass List</Typography>
                        <Typography sx={{ fontSize: 12, color: vars.textDim, mt: 0.25 }}>
                            All published passes from Visibility Schedule (current &amp; historical)
                        </Typography>
                    </Box>

                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflowY: "auto", p: 2, ...SCROLLER_SX }}>
                        <Card sx={{
                            ...CARD_SX, border: `1px solid ${vars.border}`, p: 0,
                            "--passes-thead-bg": "var(--bg-thead)", "--passes-thead-text": "var(--thead-text)",
                            "--row-stripe": "var(--row-even)",
                        }}>
                            {/* Filter bar */}
                            <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: UI.gap, flexWrap: "wrap" }}>
                                <Typography sx={{ fontWeight: 700, color: "#7CA7FF", mr: 1, fontSize: 13 }}>
                                    All Passes
                                </Typography>

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

                                <DateRangeUI
                                    label={t("Select Date Range")}
                                    startDate={fromDate}
                                    endDate={toDate}
                                    onChange={(start, end) => { setFromDate(start); setToDate(end); setPage(0); }}
                                />

                                <Button onClick={clearFilters} size="small" sx={{ color: "#2563eb", textTransform: "none", fontWeight: 700, mt: 2 }}>{t("Clear")}</Button>

                                <Box flexGrow={1} />

                                {selectedIds.length > 0 && canWrite && (
                                    <Button
                                        onClick={() => setDeletePrompt(true)}
                                        size="small"
                                        variant="contained"
                                        startIcon={<DeleteOutlinedIcon />}
                                        sx={{ bgcolor: "#ef4444", color: "#fff", height: UI.ctrlH, minHeight: UI.ctrlH, fontSize: 12.5, borderRadius: 1, mr: 1, "&:hover": { bgcolor: "#dc2626" }, textTransform: "none", fontWeight: 700 }}
                                    >
                                        Delete ({selectedIds.length})
                                    </Button>
                                )}

                                <Button onClick={handleCSV} size="small" variant="contained"
                                    startIcon={<DownloadOutlinedIcon />}
                                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#16a34a", color: "#fff", height: UI.ctrlH, minHeight: UI.ctrlH, borderRadius: 1, "& .MuiSvgIcon-root": { color: "#fff" }, "&:hover": { bgcolor: "#14833e" } }}>
                                    CSV
                                </Button>
                            </Box>

                            {/* Table */}
                            <TableContainer sx={{ flex: 1, minHeight: 0, ...TABLE_SCROLL_SX, position: 'relative' }}>
                                {/* Table Surface Scan Line */}
                                <Box className="table-surface-scan" />
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell padding="checkbox" sx={{ ...theadCellSx, width: 40 }}>
                                                <Checkbox size="small"
                                                    checked={visible.length > 0 && selectedIds.length === visible.length}
                                                    indeterminate={selectedIds.length > 0 && selectedIds.length < visible.length}
                                                    onChange={toggleSelectAll}
                                                    disabled={!canWrite || visible.length === 0}
                                                    sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked, &.MuiCheckbox-indeterminate": { color: "#fff" } }} />
                                            </TableCell>
                                            <TableCell sx={theadCellSx}>Sr</TableCell>
                                            {["DATE", "S/C", "STN", "ORBIT", "MAX", "AOS", "LOS", "OPERATIONS"].map(h => (
                                                <TableCell key={h} sx={theadCellSx}>{h}</TableCell>
                                            ))}
                                            <TableCell sx={{ ...theadCellSx, textAlign: "center" }}>Status</TableCell>
                                            <TableCell sx={{ ...theadCellSx, textAlign: "center" }}>Post Pass Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {visible.map((r, index) => (
                                            <TableRow key={r.id} className="glass-shine-row" sx={{
                                                bgcolor: "transparent",
                                                transition: 'all 0.25s',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                                    "& .hover-accent": {
                                                        opacity: 1,
                                                        height: "70%",
                                                    },
                                                }
                                            }}>
                                                <TableCell padding="checkbox" sx={{ borderBottom: `1px solid ${vars.borderWeak}`, position: "relative" }}>
                                                    <Box className="hover-accent" sx={{
                                                        position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                                                        width: "3px", height: "0%", opacity: 0,
                                                        background: `linear-gradient(to bottom, transparent, var(--accent), transparent)`,
                                                        boxShadow: `0 0 10px var(--accent)`,
                                                        transition: "all 0.3s ease",
                                                        pointerEvents: "none"
                                                    }} />
                                                    <Checkbox size="small"
                                                        checked={selectedIds.includes(r.id)}
                                                        onChange={() => toggleSelect(r.id)}
                                                        disabled={!canWrite}
                                                        sx={{ color: vars.textDim, "&.Mui-checked": { color: "#7CA7FF" } }} />
                                                </TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: vars.textDim }}>{(page * rowsPerPage) + index + 1}</TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: vars.textDim }}>{r.date_text}</TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: "var(--accent)", fontWeight: 700, fontSize: 13 }}>{r.sc}</TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: vars.text }}>{r.stn}</TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: vars.text }}>{r.orbit}</TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: vars.text }}>{r.max_ele}</TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: vars.text }}>{r.aos}</TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: vars.text }}>{r.los}</TableCell>
                                                <TableCell sx={{ ...bodyCellSx, color: vars.text }}>{r.operations}</TableCell>
                                                <TableCell align="center" sx={{ ...bodyCellSx, overflow: "visible" }}>
                                                    <PassStatusBadge status={r.pass_status} />
                                                </TableCell>
                                                <TableCell align="center" sx={{ ...bodyCellSx, overflow: "visible" }}>
                                                    <PostPassBadge status={r.post_pass_status || "Pending"} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {visible.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={12} sx={{ textAlign: "center", py: 4, color: vars.textDim }}>
                                                    {loading ? "Loading..." : "No passes found."}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                component="div"
                                count={filtered.length}
                                page={page}
                                onPageChange={(_, p) => setPage(p)}
                                rowsPerPage={rowsPerPage}
                                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                rowsPerPageOptions={[25, 50, 100]}
                                sx={PAGINATION_SX}
                            />
                        </Card>
                    </Box>
                </Card>
            </Box>
        </MainLayout>
    );
}
