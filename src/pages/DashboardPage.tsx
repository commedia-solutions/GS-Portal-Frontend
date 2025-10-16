import React from "react";
import {
  Box,
  Card,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Button,
  TablePagination,
} from "@mui/material";
  import SearchIcon from "@mui/icons-material/Search";
import MainLayout from "../layouts/MainLayout";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { api } from "../api/http";
import { vars, sxPresets } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";

/* -------------------- Controls (shared styles) -------------------- */
const UI = {
  ctrlH: 30,
  font: 13,
  icon: 16,
  gap: 0.75,
  headerPx: 1.25,
  headerPy: 0.6,
  searchW: 180,
  selectW: 108,
  paginationH: 36,
};

const compactCtrlSx = {
  ...sxPresets.ctrl,
  borderRadius: 1,
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px` },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
  },
  "& .MuiInputBase-input::placeholder": { opacity: 1 },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px !important`,
    lineHeight: `${UI.ctrlH - 2}px`,
    padding: "0 10px !important",
    display: "flex",
    alignItems: "center",
    fontSize: UI.font,
  },
  "& .MuiSvgIcon-root": { fontSize: UI.icon },
} as const;

const darkMenu = {
  PaperProps: {
    sx: {
      bgcolor: vars.bgCard,
      color: vars.text,
      border: `1px solid ${vars.border}`,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: vars.bgHover },
      "& .MuiMenuItem-root:hover": { bgcolor: vars.bgHover },
    },
  },
};

/* -------------------- API types -------------------- */
type ApiPass = {
  id: number;
  pass_req_no: string;
  date_text: string;
  satellite_name: string;
  supporting_station: string;
  orbit_no?: string;
  max_el_deg?: string;
  aos_ut: string;
  los_ut: string;
  operations?: string | null;
  operations_requester?: string | null;
  operations_supporter?: string | null;
  schedule_status: string;
  pass_status: string;
  remarks?: string | null;
  /** NEW */
  pass_type?: "Normal" | "Emergency" | string | null;
};

/* -------------------- helpers -------------------- */
function Labeled({
  label,
  width,
  children,
}: {
  label: string;
  width: number | string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", width }}>
      <Box sx={{ fontSize: 11, color: vars.textDim, mb: 0.3, pl: 0.2 }}>{label}</Box>
      {children}
    </Box>
  );
}

const parseMMDDYYYY = (s: string) => {
  const [mRaw, dRaw, yRaw] = String(s).trim().split(/[/-]/);
  const m = parseInt(mRaw, 10) || 1;
  const d = parseInt(dRaw, 10) || 1;
  let y = parseInt(yRaw, 10) || 1970;
  if (y < 100) y += 2000;
  const dt = new Date(y, m - 1, d);
  return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
};

const reqNum = (req: string): number => {
  const m = String(req).match(/(\d+)\s*$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
};

/* -------------------- table scaffold -------------------- */
type Column = {
  key: string;
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  render?: (row: Row) => React.ReactNode;
};

type Row = { [key: string]: string | number };

function ThemedScrollTable({
  rows,
  columns,
  emptyText,
}: {
  rows: Row[];
  columns: Column[];
  emptyText: string;
}) {
  const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;
  return (
    <Box sx={{ width: totalW, minWidth: "100%" }}>
      {/* header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
          bgcolor: "var(--dash-thead-bg)",
          borderBottom: `1px solid ${vars.border}`,
        }}
      >
        {columns.map((c) => (
          <Box
            key={c.key}
            sx={{
              px: 0.75,
              py: 1,
              fontWeight: 700,
              fontSize: 13,
              color: "var(--dash-thead-text)",
              textAlign: c.align ?? "center",
              whiteSpace: "nowrap",
            }}
          >
            {c.label}
          </Box>
        ))}
      </Box>

      {/* rows */}
      {rows.map((r, idx) => (
        <Box
          key={idx}
          sx={{
            display: "grid",
            gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
            borderBottom: `1px solid ${vars.borderWeak}`,
            bgcolor: idx % 2 ? vars.bgHover : "transparent",
          }}
        >
          {columns.map((c) => (
            <Box
              key={`${c.key}-${idx}`}
              sx={{
                px: 0.75,
                py: 1,
                fontSize: 13,
                color: vars.text,
                textAlign: c.align ?? "center",
                whiteSpace: "nowrap",
              }}
            >
              {c.render ? c.render(r) : (r[c.key] as any)}
            </Box>
          ))}
        </Box>
      ))}

      {rows.length === 0 && (
        <Box sx={{ px: 0.75, py: 2, color: vars.textDim, textAlign: "center" }}>
          {emptyText}
        </Box>
      )}
    </Box>
  );
}

/* -------------------- Page -------------------- */
export default function DashboardPage() {
  const { t } = useI18n();

  // filters
  const [search, setSearch] = React.useState("");
  const [timeline, setTimeline] = React.useState<"All" | "Today" | "Tomorrow" | "Week" | "Month" | "Year">("All");
  const [status, setStatus] = React.useState<"All" | "Completed" | "Pending" | "Failed" | "Canceled">("All");
  /** NEW filter */
  const [typeFilter, setTypeFilter] = React.useState<"" | "Normal" | "Emergency">("");
  const [date, setDate] = React.useState<Date | null>(null);

  // paging
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  // translated columns
  const COLUMNS: Column[] = React.useMemo(
    () => [
      { key: "sr", label: t("Sr"), width: 60, align: "center" },
      { key: "date", label: t("Date"), width: 110, align: "center" },
      { key: "sat", label: t("Satellite"), width: 120, align: "center" },
      { key: "stn", label: t("Station"), width: 130, align: "center" },
      /** NEW column */
      { key: "type", label: t("Pass Type"), width: 110, align: "center" },
      { key: "orb", label: t("Orbit"), width: 90, align: "center" },
      { key: "maxEl", label: t("Max (El)°"), width: 110, align: "center" },
      { key: "aos", label: t("AOS / LOS (UT)"), width: 180, align: "center", render: (r) => `${r.aos || "—"} / ${r.los || "—"}` },
      { key: "ops", label: t("Operations"), width: 130, align: "center" },
      { key: "opsReq", label: t("Ops requester / supporter"), width: 240, align: "center", render: (r) => `${r.opsReq || "—"} / ${r.opsSup || "—"}` },
      { key: "sched", label: t("Schedule"), width: 120, align: "center" },
      { key: "pass", label: t("Pass"), width: 100, align: "center" },
      { key: "remarks", label: t("Remarks"), width: 180, align: "center" },
    ],
    [t]
  );

  // fetch passes
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const j = await api.get<any>("/api/passes");
        const data: ApiPass[] = Array.isArray(j) ? j : Array.isArray(j?.rows) ? j.rows : [];
        const mapped: Row[] = data.map((p) => ({
          sr: 0,
          req: p.pass_req_no,
          date: p.date_text,
          sat: p.satellite_name,
          stn: p.supporting_station,
          type: (p.pass_type as any) || "Normal", // NEW
          orb: p.orbit_no ?? "",
          maxEl: p.max_el_deg ?? "",
          aos: p.aos_ut,
          los: p.los_ut,
          ops: p.operations ?? "",
          opsReq: p.operations_requester ?? "",
          opsSup: p.operations_supporter ?? "",
          sched: p.schedule_status,
          pass: p.pass_status,
          remarks: p.remarks ?? "—",
        }));
        setRows(mapped);
        setPage(0);
      } catch (e) {
        console.error("Failed to fetch passes", e);
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const clearFilters = () => {
    setSearch("");
    setTimeline("All");
    setStatus("All");
    setTypeFilter("");
    setDate(null);
  };

  const filteredSorted = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const today0 = startOfDay(new Date());
    const addDays = (d: Date, n: number) => {
      const x = new Date(d);
      x.setDate(x.getDate() + n);
      return startOfDay(x);
    };
    const currentWeekRange = (ref: Date) => {
      const start = addDays(ref, -ref.getDay());
      const end = addDays(start, 6);
      return [start, end] as const;
    };

    const inTimeline = (dt: Date) => {
      const d0 = startOfDay(dt);
      switch (timeline) {
        case "All": return true;
        case "Today": return d0.getTime() === today0.getTime();
        case "Tomorrow": return d0.getTime() === addDays(today0, 1).getTime();
        case "Week": {
          const [wStart, wEnd] = currentWeekRange(today0);
          return d0 >= wStart && d0 <= wEnd;
        }
        case "Month": return d0.getFullYear() === today0.getFullYear() && d0.getMonth() === today0.getMonth();
        case "Year": return d0.getFullYear() === today0.getFullYear();
        default: return true;
      }
    };

    const arr = rows.filter((r) => {
      if (status !== "All" && r.pass !== status) return false;
      if (typeFilter && r.type !== typeFilter) return false; // NEW

      const dt = parseMMDDYYYY(String(r.date));
      if (!inTimeline(dt)) return false;

      if (date) {
        if (startOfDay(dt).getTime() !== startOfDay(date).getTime()) return false;
      }

      if (q) {
        const hay = `${r.req} ${r.sat} ${r.stn} ${r.ops} ${r.opsReq ?? ""} ${r.opsSup ?? ""} ${r.remarks}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    arr.sort((a, b) => {
      const na = reqNum(String(a.req)),
        nb = reqNum(String(b.req));
      if (na !== nb) return na - nb;
      return String(a.req).localeCompare(String(b.req));
    });

    return arr;
  }, [rows, search, timeline, status, typeFilter, date]);

  const paged = React.useMemo(() => {
    const start = page * rowsPerPage;
    const slice = filteredSorted.slice(start, start + rowsPerPage);
    return slice.map((r, i) => ({ ...r, sr: start + i + 1 }));
  }, [filteredSorted, page, rowsPerPage]);

  const totalRows = filteredSorted.length;

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          elevation={0}
          sx={{
            ...sxPresets.card,
            bgcolor: vars.bgCard,
            border: `1px solid ${vars.border}`,
            boxShadow: "none",
            backgroundImage: "none",
            borderRadius: 2,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "flex",
            flexDirection: "column",
            "--dash-thead-bg": "#000000",
            "--dash-thead-text": "#ffffff",
            ".theme-dark &": { "--dash-thead-bg": "#000000", "--dash-thead-text": "#ffffff" },
            ".theme-light &": { "--dash-thead-bg": "#464B4E", "--dash-thead-text": "#ffffff" },
          }}
        >
          {/* Header strip */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: UI.gap,
              px: UI.headerPx,
              py: UI.headerPy,
              borderBottom: `1px solid ${vars.border}`,
              bgcolor: "transparent",
            }}
          >
            <Box sx={{ fontWeight: 700, fontSize: 20, color: vars.text, px: 0.5 }}>
              {t("Dashboard")}
            </Box>

            <Box sx={{ ml: "auto", display: "flex", alignItems: "flex-end", gap: UI.gap }}>
              <Box sx={{ mt: 2.1 }}>
                <TextField
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={loading ? t("Loading…") : t("Search…")}
                  size="small"
                  sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0.25 }}>
                        <SearchIcon sx={{ fontSize: UI.icon, color: vars.textDim }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Labeled label={t("Timeline")} width={UI.selectW}>
                <FormControl size="small" fullWidth>
                  <Select value={timeline} onChange={(e) => setTimeline(e.target.value as any)} MenuProps={darkMenu} sx={compactCtrlSx}>
                    {["All", "Today", "Tomorrow", "Week", "Month", "Year"].map((opt) => (
                      <MenuItem key={opt} value={opt}>{t(opt)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Labeled>

              <Labeled label={t("Status")} width={UI.selectW}>
                <FormControl size="small" fullWidth>
                  <Select value={status} onChange={(e) => setStatus(e.target.value as any)} MenuProps={darkMenu} sx={compactCtrlSx}>
                    {["All", "Completed", "Pending", "Failed", "Canceled"].map((opt) => (
                      <MenuItem key={opt} value={opt}>{t(opt)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Labeled>

              {/* NEW: Pass Type filter */}
              <Labeled label={t("Pass Type")} width={UI.selectW}>
                <FormControl size="small" fullWidth>
                  <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} MenuProps={darkMenu} sx={compactCtrlSx}>
                    <MenuItem value="">{t("All")}</MenuItem>
                    <MenuItem value="Normal">{t("Normal")}</MenuItem>
                    <MenuItem value="Emergency">{t("Emergency")}</MenuItem>
                  </Select>
                </FormControl>
              </Labeled>

              <Labeled label={t("Date")} width={150}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={date}
                    onChange={(v: Date | null) => setDate(v)}
                    slotProps={{
                      textField: { size: "small", placeholder: "MM/DD/YYYY", sx: { width: 150, ...compactCtrlSx } },
                      openPickerButton: { sx: { color: vars.text } },
                      popper: {
                        sx: {
                          "& .MuiPaper-root": { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` },
                          "& .MuiPickersDay-root": { color: vars.text },
                          "& .MuiPickersDay-root.Mui-selected": { bgcolor: `${vars.accent} !important`, color: "#fff" },
                          "& .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-label": { color: vars.text },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </Labeled>

              <Button onClick={clearFilters} size="small" sx={{ mt: 2.1, color: vars.accent, textTransform: "none", fontWeight: 700 }}>
                {t("Clear")}
              </Button>
            </Box>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
              <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...sxPresets.scroller }}>
                <ThemedScrollTable rows={paged} columns={COLUMNS} emptyText={t("No passes found.")} />
              </Box>
            </Box>
          </Box>

          {/* Pagination */}
          <Box sx={{ borderTop: `1px solid ${vars.border}` }}>
            <TablePagination
              component="div"
              count={filteredSorted.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              labelRowsPerPage={t("Rows per page:")}
              rowsPerPageOptions={[10, 50, 150, 200]}
              sx={{
                px: 1,
                color: vars.text,
                minHeight: UI.paginationH,
                "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
                "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: UI.font, m: 0, color: vars.textDim },
                "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
                "& .MuiSelect-select": {
                  py: 0, px: 1, fontSize: UI.font, height: UI.ctrlH - 6, display: "flex", alignItems: "center",
                  bgcolor: vars.bgCtrl, borderRadius: 1,
                },
                "& .MuiIconButton-root": { p: 0.25 },
                ".MuiSvgIcon-root": { fontSize: UI.icon, color: vars.text },
              }}
            />
          </Box>
        </Card>
      </Box>
    </MainLayout>
  );
}
