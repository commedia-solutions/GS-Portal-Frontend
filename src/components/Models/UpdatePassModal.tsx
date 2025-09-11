// src/components/Modals/UpdatePassModal.tsx
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// 🔐 shared API helper (adds base URL + auth headers)
import api from "../../api/http";

/** Keep fields as strings (table is VARCHAR). Add optional id for API calls. */
export type PassLike = {
  id?: number; // <-- used for PUT/DELETE
  sr: number;
  req: string;
  date: string; // MM/DD/YYYY
  sat: string;
  stn: string;
  orb: string;
  maxEl: string;
  aos: string;
  los: string;
  ops: string;
  opsReq: string;
  opsSup: string;
  sched: string;
  pass: string;
  remarks: string;
};

type Props = {
  open: boolean;
  row: PassLike | null;
  onClose: () => void;
  onSave: (updated: PassLike) => void;
  onDelete: (row: PassLike) => void;
};

/* ------------ endpoints (root-relative, helper adds base) ------------ */
const PASSES_URL = "/api/passes";
const GS_URL = "/api/ground-stations";
const SATS_URL = "/api/satellites";
const OPS_URL = "/api/operations";
const REQ_URL = "/api/operation-requesters";
const SUP_URL = "/api/operation-supporters";

/* ------------ small helpers ------------ */
function parseMMDDYYYY(s: string): Date | null {
  // Accept 08/27/2025 or 8-27-2025
  const m = s?.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!m) return null;
  const mm = Number(m[1]), dd = Number(m[2]), y = Number(m[3]);
  const dt = new Date(y, mm - 1, dd);
  return isNaN(+dt) ? null : dt;
}
function fmtMMDDYYYY(d: Date | null): string {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
}

const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
const UI = { ctrlH: 30, font: 13, icon: 16 };

const compactCtrlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#544f4fff",
  },
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff" },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
    color: "#fff",
  },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 28px 0 10px",
    display: "flex",
    alignItems: "center",
    fontSize: UI.font,
    color: "#fff",
  },
  "& .MuiSelect-icon": {
    top: "50%",
    transform: "translateY(-50%)",
    right: 8,
    color: "rgba(255,255,255,0.9)",
    width: UI.icon,
    height: UI.icon,
  },
  "& .MuiSvgIcon-root": { color: "#fff", fontSize: UI.icon },
} as const;

const labelSx = { color: "rgba(255,255,255,0.7)", mb: 0.5, fontSize: 12 };

/* DatePicker (white-on-dark) — EXACT same height as other fields */
const dateSlots = {
  textField: {
    size: "small" as const,
    fullWidth: true,
    sx: { ...compactCtrlSx },
    placeholder: "MM/DD/YYYY",
  },
  openPickerButton: { sx: { color: "#fff" } },
  popper: {
    sx: {
      "& .MuiPaper-root": { bgcolor: CONTROL_BG, color: "#fff", border: CONTROL_BORDER },
      "& .MuiPickersDay-root": { color: "#fff" },
      "& .MuiPickersDay-root.Mui-selected": { bgcolor: "#7C57F2 !important", color: "#fff" },
      "& .MuiDayCalendar-weekDayLabel, & .MuiPickersCalendarHeader-label, & .MuiPickersYear-yearButton": {
        color: "#fff",
      },
    },
  },
};

function extractNames(rows: any[], tryKeys: string[]): string[] {
  return rows
    .map((r) => {
      const v = tryKeys
        .map((k) => (r?.[k] ?? "").toString().trim())
        .find((s) => s && s.length > 0);
      return v || "";
    })
    .filter(Boolean);
}

async function fetchList(url: string): Promise<any[]> {
  try {
    const j = await api.get<any>(url);
    if (Array.isArray(j)) return j;
    if (Array.isArray(j?.data)) return j.data;
    if (Array.isArray(j?.rows)) return j.rows;
    return [];
  } catch {
    return [];
  }
}

export default function UpdatePassModal({ open, row, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = React.useState<PassLike | null>(row);
  const [dateVal, setDateVal] = React.useState<Date | null>(row ? parseMMDDYYYY(row.date) : null);
  const [busy, setBusy] = React.useState<"put" | "del" | null>(null);
  const [err, setErr] = React.useState<string>("");

  // options (live from API)
  const [stationOpts, setStationOpts] = React.useState<string[]>([]);
  const [satOpts, setSatOpts] = React.useState<string[]>([]);
  const [opsOpts, setOpsOpts] = React.useState<string[]>([]);
  const [reqOpts, setReqOpts] = React.useState<string[]>([]);
  const [supOpts, setSupOpts] = React.useState<string[]>([]);

  // load options when modal opens
  React.useEffect(() => {
    if (!open) return;
    (async () => {
      // Stations
      const gs = await fetchList(GS_URL);
      const gsNames = extractNames(gs, ["ground_station", "station_name", "name"]);
      setStationOpts(Array.from(new Set(gsNames)));

      // Satellites
      const sats = await fetchList(SATS_URL);
      const satNames = extractNames(sats, ["satellite_name", "name"]);
      setSatOpts(Array.from(new Set(satNames)));

      // Operations
      const ops = await fetchList(OPS_URL);
      const opNames = extractNames(ops, ["operation_name", "operation", "operations", "name"]);
      setOpsOpts(Array.from(new Set(opNames)));

      // Requesters
      const reqs = await fetchList(REQ_URL);
      const reqNames = extractNames(reqs, ["requester_name", "requester", "operations_requester", "name"]);
      setReqOpts(Array.from(new Set(reqNames)));

      // Supporters
      const sups = await fetchList(SUP_URL);
      const supNames = extractNames(sups, ["supporter_name", "supporter", "operations_supporter", "name"]);
      setSupOpts(Array.from(new Set(supNames)));
    })();
  }, [open]);

  React.useEffect(() => {
    setForm(row);
    setErr("");
    setBusy(null);
    setDateVal(row ? parseMMDDYYYY(row.date) : null);
  }, [row]);

  if (!form) return null;

  const set = (k: keyof PassLike) => (e: any) => setForm({ ...form, [k]: e.target.value });

  // fixed option sets
  // const schedOpts = ["Scheduled", "Failed", "Canceled", "Pending"];
  // const passOpts = ["Pending", "Completed", "Canceled"];

  // add current values to options (avoids MUI warning if value not in list)
  const addCurrent = (opts: string[], cur: string) =>
    Array.from(new Set([...(cur ? [cur] : []), ...opts]));

  async function doPut() {
    if (!form?.id) {
      const msg = "Missing record id for update.";
      setErr(msg);
      alert(msg);
      return;
    }
    try {
      setErr("");
      setBusy("put");

      const payload = {
        pass_req_no: form.req,
        date_text: fmtMMDDYYYY(dateVal) || form.date,
        satellite_name: form.sat,
        supporting_station: form.stn,
        orbit_no: form.orb,
        max_el_deg: form.maxEl,
        aos_ut: form.aos,
        los_ut: form.los,
        operations: form.ops,
        operations_requester: form.opsReq,
        operations_supporter: form.opsSup,
        schedule_status: form.sched,
        pass_status: form.pass,
        remarks: form.remarks,
      };

      const updated = await api.put<any>(`${PASSES_URL}/${form.id}`, payload);

      const next: PassLike = {
        id: updated.id,
        sr: form.sr,
        req: updated.pass_req_no,
        date: updated.date_text,
        sat: updated.satellite_name,
        stn: updated.supporting_station,
        orb: updated.orbit_no ?? "",
        maxEl: updated.max_el_deg ?? "",
        aos: updated.aos_ut ?? "",
        los: updated.los_ut ?? "",
        ops: updated.operations ?? "",
        opsReq: updated.operations_requester ?? "",
        opsSup: updated.operations_supporter ?? "",
        sched: updated.schedule_status ?? "",
        pass: updated.pass_status ?? "",
        remarks: updated.remarks ?? "—",
      };

      alert("Pass updated successfully.");
      onSave(next);
    } catch (e: any) {
      const msg = e?.message || "Update failed";
      setErr(msg);
      alert(msg);
    } finally {
      setBusy(null);
    }
  }

  async function doDelete() {
  if (!form?.id) {
    const msg = "Missing record id for delete.";
    setErr(msg);
    alert(msg);
    return;
  }
  try {
    setErr("");
    setBusy("del");
    await api.del(`${PASSES_URL}/${form.id}`);   // <-- use .del
    alert("Pass deleted.");
    onDelete(form);
  } catch (e: any) {
    const msg = e?.message || "Delete failed";
    setErr(msg);
    alert(msg);
  } finally {
    setBusy(null);
  }
}

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: { bgcolor: "#151517", color: "#EDEDED", border: CONTROL_BORDER, borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update Pass</DialogTitle>

      <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
        {!!err && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {err}
          </Alert>
        )}

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
          {/* Row 1 */}
          <Box>
            <Typography sx={labelSx}>Mission Req No</Typography>
            <TextField size="small" fullWidth value={form.req} InputProps={{ readOnly: true }} sx={compactCtrlSx} />
          </Box>
          <Box>
            <Typography sx={labelSx}>Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                value={dateVal}
                onChange={(v) => {
                  setDateVal(v);
                  setForm({ ...form, date: fmtMMDDYYYY(v) });
                }}
                slotProps={dateSlots as any}
              />
            </LocalizationProvider>
          </Box>

          {/* Row 2 */}
          <Box>
            <Typography sx={labelSx}>Satellite</Typography>
            <Select size="small" fullWidth value={form.sat} onChange={set("sat")} sx={compactCtrlSx}>
              {addCurrent(satOpts, form.sat).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <Typography sx={labelSx}>Station</Typography>
            <Select size="small" fullWidth value={form.stn} onChange={set("stn")} sx={compactCtrlSx}>
              {addCurrent(stationOpts, form.stn).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Row 3 */}
          <Box>
            <Typography sx={labelSx}>Orbit No</Typography>
            <TextField size="small" fullWidth value={form.orb} onChange={set("orb")} sx={compactCtrlSx} />
          </Box>
          <Box>
            <Typography sx={labelSx}>Max (El) Deg</Typography>
            <TextField size="small" fullWidth value={form.maxEl} onChange={set("maxEl")} sx={compactCtrlSx} />
          </Box>

          {/* Row 4 */}
          <Box>
            <Typography sx={labelSx}>AOS (UT)</Typography>
            <TextField size="small" fullWidth value={form.aos} onChange={set("aos")} sx={compactCtrlSx} />
          </Box>
          <Box>
            <Typography sx={labelSx}>LOS (UT)</Typography>
            <TextField size="small" fullWidth value={form.los} onChange={set("los")} sx={compactCtrlSx} />
          </Box>

          {/* Row 5 */}
          <Box>
            <Typography sx={labelSx}>Operations</Typography>
            <Select size="small" fullWidth value={form.ops} onChange={set("ops")} sx={compactCtrlSx}>
              {addCurrent(opsOpts, form.ops).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <Typography sx={labelSx}>Operations Requester</Typography>
            <Select size="small" fullWidth value={form.opsReq} onChange={set("opsReq")} sx={compactCtrlSx}>
              {addCurrent(reqOpts, form.opsReq).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Row 6 */}
          <Box>
            <Typography sx={labelSx}>Operations Supporter</Typography>
            <Select size="small" fullWidth value={form.opsSup} onChange={set("opsSup")} sx={compactCtrlSx}>
              {addCurrent(supOpts, form.opsSup).map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <Typography sx={labelSx}>Schedule Status</Typography>
            <Select size="small" fullWidth value={form.sched} onChange={set("sched")} sx={compactCtrlSx}>
              {["Scheduled", "Failed", "Canceled", "Pending"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Row 7 */}
          <Box>
            <Typography sx={labelSx}>Pass Status</Typography>
            <Select size="small" fullWidth value={form.pass} onChange={set("pass")} sx={compactCtrlSx}>
              {["Pending", "Completed", "Canceled"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </Box>

          {/* Remarks full width */}
          <Box sx={{ gridColumn: "1 / -1" }}>
            <Typography sx={labelSx}>Remarks</Typography>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={3}
              value={form.remarks}
              onChange={set("remarks")}
              sx={{
                ...compactCtrlSx,
                "& textarea": { padding: "8px 10px", lineHeight: 1.35 },
                "& .MuiOutlinedInput-root": { height: "auto", alignItems: "flex-start" },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.25 }}>
        <Button
          onClick={doDelete}
          disabled={busy !== null}
          variant="contained"
          color="error"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#B4232A", "&:hover": { bgcolor: "#9b1d23" } }}
          startIcon={busy === "del" ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Delete
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={busy !== null} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
          Cancel
        </Button>
        <Button
          onClick={doPut}
          disabled={busy !== null}
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
          startIcon={busy === "put" ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}

