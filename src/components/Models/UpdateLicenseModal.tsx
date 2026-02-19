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
  Checkbox,
  ListItemText,
  FormControl,

} from "@mui/material";
import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

// NEW: use the shared HTTP helper so requests include the JWT
import { api } from "../../api/http";


/** Row shape used across list + modal */
export type LicenseLike = {
  id: number;      // needed for PUT/DELETE
  sr: number;
  reqNo: string;
  satName: string;
  station: string; // comma-joined in table; modal uses multi-select internally
  applied: string;
  receipt: string;
  validity: string;
  band: string;      // comma-joined in table; modal uses multi-select internally
  downlink: string;  // comma-joined
  uplink: string;    // comma-joined
  status: string;
   addedBy?: string;   // ✅ NEW
  dateTime?: string;  // ✅ NEW
  remarks: string;
};

type Props = {
  open: boolean;
  row: LicenseLike | null;
  onClose: () => void;
  onSaved: () => void;   // refresh list after PUT
  onDeleted: () => void; // refresh list after DELETE
};

/* ---------- config & shared styles (matched to Add Pass) ---------- */
// const API = `${import.meta.env.VITE_API_BASE}/api`;

const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";

/** EXACT same feel as Add Pass `controlSx` */
const controlSx = {
  bgcolor: "#232325",
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4e4e4e" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#565656",
  },
  "& .MuiInputBase-input": { color: "#fff", fontSize: 13 },
  "& .MuiInputLabel-root": { color: "#aaa", fontSize: 13 },
};

const darkMenu = {
  PaperProps: {
    sx: {
      bgcolor: CONTROL_BG,
      color: "#E8E8EA",
      border: CONTROL_BORDER,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
    },
  },
};

const labelSx = {
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.51)",
  mb: 0.5,
  lineHeight: 1.2,
};

const bandOptions = ["UHF (300 MHz – 3 GHz)", "VHF (30 MHz – 300 MHz)", "L (1-2 GHz)", "S (2.0 – 2.3 GHz)", "C (4 – 8 GHz)", "X (8 – 12 GHz)", "Ku (12-18 GHz)", "Ka (26.5 to 40 GHz)"];
const statusOptions = ["Pending", "Approved", "Rejected", "Expired"];

/* ---------- helpers ---------- */
const splitCSV = (s: string) =>
  (s || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const joinCSV = (arr: string[]) => arr.filter(Boolean).join(", ");

const parseDate = (s: string): Date | null => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

// backend expects YYYY-MM-DD (or null)
// const fmtDate = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : null);

const fmtDate = (d: Date | null) =>
  d
    ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(
        2,
      "0")}/${d.getFullYear()}`
    : "";

export default function UpdateLicenseModal({
  open,
  row,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  /* stations for multi-select */
  const [stationsList, setStationsList] = React.useState<string[]>([]);
  const [satOptions, setSatOptions] = React.useState<string[]>([]);

//   React.useEffect(() => {
//   if (!open) return;
//   (async () => {
//     try {
//       // ground stations (already there)
//       const r1 = await fetch(`${API}/ground-stations`);
//       const j1 = await r1.json();
//       const listGS: string[] = Array.isArray(j1?.data)
//         ? j1.data
//             .map((g: any) => (g.ground_station || g.station_name || g.name || "").toString().trim())
//             .filter(Boolean)
//         : [];
//       setStationsList(listGS);
//     } catch (e) {
//       console.error("Failed to load ground stations", e);
//       setStationsList([]);
//     }

//     try {
//       // 🚀 satellites (new)
//       const r2 = await fetch(`${API}/satellites`);
//       const j2 = await r2.json();
//       const rows: any[] = Array.isArray(j2) ? j2 : Array.isArray(j2?.data) ? j2.data : [];
//       const names = rows
//         .map((s) => (s.satellite_name || s.name || "").toString().trim())
//         .filter(Boolean);
//       const unique = Array.from(new Set(names));
//       // ensure current value is available in the list
//       if (row?.satName && !unique.includes(row.satName)) unique.unshift(row.satName);
//       setSatOptions(unique);
//     } catch (e) {
//       console.error("Failed to load satellites", e);
//       setSatOptions(row?.satName ? [row.satName] : []);
//     }
//   })();
// }, [open, row]);

React.useEffect(() => {
  if (!open) return;
  (async () => {
    try {
      // Ground stations
      const j1 = await api.get<any>("/api/ground-stations");
      const rows1: any[] = Array.isArray(j1?.data) ? j1.data : Array.isArray(j1) ? j1 : [];
      const listGS = rows1
        .map((g: any) =>
          String(g.ground_station ?? g.station_name ?? g.name ?? "").trim(),
        )
        .filter(Boolean);
      setStationsList(listGS);
    } catch (e) {
      console.error("Failed to load ground stations", e);
      setStationsList([]);
    }

    try {
      // Satellites
      const j2 = await api.get<any>("/api/satellites");
      const rows2: any[] = Array.isArray(j2?.data) ? j2.data : Array.isArray(j2) ? j2 : [];
      const names = rows2
        .map((s: any) => String(s.satellite_name ?? s.name ?? s.satellite_id ?? "").trim())
        .filter(Boolean);
      const unique = Array.from(new Set(names));
      if (row?.satName && !unique.includes(row.satName)) unique.unshift(row.satName);
      setSatOptions(unique);
    } catch (e) {
      console.error("Failed to load satellites", e);
      setSatOptions(row?.satName ? [row.satName] : []);
    }
  })();
}, [open, row]);


  /* form state */
  const [reqNo, setReqNo] = React.useState("");
const [satName, setSatName] = React.useState<string[]>([]);
  const [stationsSel, setStationsSel] = React.useState<string[]>([]);
  const [applied, setApplied] = React.useState<Date | null>(null);
  const [receipt, setReceipt] = React.useState<Date | null>(null);
  const [validity, setValidity] = React.useState<Date | null>(null);
  const [bandsSel, setBandsSel] = React.useState<string[]>([]);
  const [downlinkCSV, setDownlinkCSV] = React.useState("");
  const [uplinkCSV, setUplinkCSV] = React.useState("");
  const [status, setStatus] = React.useState(statusOptions[0]);
  const [remarks, setRemarks] = React.useState("");

  /* hydrate when row changes */
  React.useEffect(() => {
    if (!row) return;
    setReqNo(row.reqNo);
setSatName(splitCSV(row.satName));
    setStationsSel(splitCSV(row.station));
    setApplied(parseDate(row.applied));
    setReceipt(parseDate(row.receipt));
    setValidity(parseDate(row.validity));
    setBandsSel(splitCSV(row.band));
    setDownlinkCSV(row.downlink || "");
    setUplinkCSV(row.uplink || "");
    setStatus(row.status || "Pending");
    setRemarks(row.remarks || "");
  }, [row]);

  if (!row) return null;

  /* ---------- API actions ---------- */
  // const doUpdate = async () => {
  //   try {
  //     // Pair bands with uplink/downlink by index
  //     const up = splitCSV(uplinkCSV);
  //     const dn = splitCSV(downlinkCSV);
  //     const bands = bandsSel
  //       .map((name, i) => ({
  //         band_name: name,
  //         uplink: up[i] ?? "",
  //         downlink: dn[i] ?? "",
  //       }))
  //       .filter((b) => b.band_name);

  //     const payload = {
  //       license_req_no: reqNo,
  //       satellite_name: satName,
  //       station_name: joinCSV(stationsSel),
  //       applied_date: fmtDate(applied),
  //       receipt_date: fmtDate(receipt),
  //       validity_expiry: fmtDate(validity),
  //       status,
  //       remarks,
  //       bands,
  //     };

  //     const resp = await fetch(`${API}/licenses/${row.id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     if (!resp.ok) {
  //       const msg = await resp.text().catch(() => "");
  //       alert(`Update failed (${resp.status}): ${msg || resp.statusText}`);
  //       return;
  //     }

  //     alert("License updated successfully.");
  //     onClose();
  //     onSaved();
  //   } catch (e) {
  //     console.error(e);
  //     alert("Update failed.");
  //   }
  // };

  const doUpdate = async () => {
  try {
    const up = splitCSV(uplinkCSV);
    const dn = splitCSV(downlinkCSV);
    const bands = bandsSel
      .map((name, i) => ({ band_name: name, uplink: up[i] ?? "", downlink: dn[i] ?? "" }))
      .filter((b) => b.band_name);

    const payload = {
      license_req_no: reqNo,
satellite_name: joinCSV(satName),
      station_name: joinCSV(stationsSel),
      applied_date: fmtDate(applied),
      receipt_date: fmtDate(receipt),
      validity_expiry: fmtDate(validity),
      status,
      remarks,
      bands,
    };

    await api.put(`/api/licenses/${row!.id}`, payload);
    alert("License updated successfully.");
    onClose();
    onSaved();
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Update failed.");
  }
};


  // const doDelete = async () => {
  //   if (!confirm(`Delete license ${reqNo}? This cannot be undone.`)) return;
  //   try {
  //     const resp = await fetch(`${API}/licenses/${row.id}`, { method: "DELETE" });
  //     if (!resp.ok) {
  //       const msg = await resp.text().catch(() => "");
  //       alert(`Delete failed (${resp.status}): ${msg || resp.statusText}`);
  //       return;
  //     }
  //     alert("License deleted.");
  //     onClose();
  //     onDeleted();
  //   } catch (e) {
  //     console.error(e);
  //     alert("Delete failed.");
  //   }
  // };

  const doDelete = async () => {
  if (!confirm(`Delete license ${reqNo}? This cannot be undone.`)) return;
  try {
    await api.del(`/api/licenses/${row!.id}`);
    alert("License deleted.");
    onClose();
    onDeleted();
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Delete failed.");
  }
};


  /* ---------- UI ---------- */
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "#151517",
          color: "#EDEDED",
          border: CONTROL_BORDER,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update License</DialogTitle>

      <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
        {/* Same grid rhythm as Add Pass card */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0,1fr))" },
            columnGap: 2,
            rowGap: 2,
            "& .form-item": { display: "flex", flexDirection: "column" },
          }}
        >
          {/* Row 1 */}
          <Box className="form-item">
            <Typography sx={labelSx}>License Req No</Typography>
            <TextField
              value={reqNo}
              size="small"
              sx={controlSx}
              InputProps={{ readOnly: true }}
            />
          </Box>

          {/* <Box className="form-item">
            <Typography sx={labelSx}>Satellite Name</Typography>
            <TextField
              value={satName}
              onChange={(e) => setSatName(e.target.value)}
              size="small"
              sx={controlSx}
            />
          </Box> */}

          <Box className="form-item">
  <Typography sx={labelSx}>Satellite Name</Typography>
  <FormControl fullWidth size="small">
    <Select<string[]>
      multiple
      value={satName}
      onChange={(e) =>
        setSatName(
          typeof e.target.value === "string"
            ? e.target.value.split(",")
            : (e.target.value as string[])
        )
      }
      renderValue={(sel) =>
        sel.length ? sel.join(", ") : "Select satellite"
      }
      sx={controlSx}
      MenuProps={darkMenu}
      displayEmpty
    >
      {satOptions.map((name) => (
        <MenuItem key={name} value={name}>
          <Checkbox
            checked={satName.indexOf(name) > -1}
            sx={{ p: 0.5, mr: 1, color: "#bbb" }}
          />
          <ListItemText primary={name} />
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>


          {/* Row 2 */}
          <Box className="form-item">
            <Typography sx={labelSx}>Station</Typography>
            <FormControl fullWidth size="small">
              <Select<string[]>
                multiple
                value={stationsSel}
                onChange={(e) =>
                  setStationsSel(
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : (e.target.value as string[])
                  )
                }
                renderValue={(sel) => (sel as string[]).join(", ")}
                sx={controlSx}
                MenuProps={darkMenu}
              >
                {stationsList.map((s) => (
                  <MenuItem key={s} value={s}>
                    <Checkbox
                      checked={stationsSel.indexOf(s) > -1}
                      sx={{ p: 0.5, mr: 1, color: "#bbb" }}
                    />
                    <ListItemText primary={s} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box className="form-item">
            <Typography sx={labelSx}>Validity (Expiry)</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                value={validity}
                onChange={(v) => setValidity(v)}
                format="MM/dd/yyyy"
                slotProps={{
                  textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Row 3 */}
          <Box className="form-item">
            <Typography sx={labelSx}>Band</Typography>
            <FormControl fullWidth size="small">
              <Select<string[]>
                multiple
                value={bandsSel}
                onChange={(e) =>
                  setBandsSel(
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : (e.target.value as string[])
                  )
                }
                renderValue={(sel) => (sel as string[]).join(", ")}
                sx={controlSx}
                MenuProps={darkMenu}
              >
                {bandOptions.map((b) => (
                  <MenuItem key={b} value={b}>
                    <Checkbox
                      checked={bandsSel.indexOf(b) > -1}
                      sx={{ p: 0.5, mr: 1, color: "#bbb" }}
                    />
                    <ListItemText primary={b} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box className="form-item">
            <Typography sx={labelSx}>Status</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={controlSx}
                MenuProps={darkMenu}
              >
                {statusOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Row 4 */}
          <Box className="form-item">
            <Typography sx={labelSx}>Applied Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                value={applied}
                onChange={(v) => setApplied(v)}
                format="MM/dd/yyyy"
                slotProps={{
                  textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" },
                }}
              />
            </LocalizationProvider>
          </Box>

          <Box className="form-item">
            <Typography sx={labelSx}>Receipt Date</Typography>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                value={receipt}
                onChange={(v) => setReceipt(v)}
                format="MM/dd/yyyy"
                slotProps={{
                  textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Row 5 */}
          <Box className="form-item">
            <Typography sx={labelSx}>Downlink (comma separated)</Typography>
            <TextField
              value={downlinkCSV}
              onChange={(e) => setDownlinkCSV(e.target.value)}
              placeholder="e.g. 2772, 233"
              size="small"
              sx={controlSx}
            />
          </Box>

          <Box className="form-item">
            <Typography sx={labelSx}>Uplink (comma separated)</Typography>
            <TextField
              value={uplinkCSV}
              onChange={(e) => setUplinkCSV(e.target.value)}
              placeholder="e.g. 6373, 773"
              size="small"
              sx={controlSx}
            />
          </Box>

          {/* Remarks full width */}
          <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
            <Typography sx={labelSx}>Remarks</Typography>
            <TextField
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks "
              size="small"
              multiline
              minRows={2}
              sx={{
                ...controlSx,
                "& .MuiInputBase-input": {
                   color: "#fff",  
                  height: "auto",
                  padding: "8px 10px",
                  lineHeight: 1.35,
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.25 }}>
        <Button
          onClick={doDelete}
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#B4232A",
            "&:hover": { bgcolor: "#9b1d23" },
          }}
        >
          Delete
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
          Cancel
        </Button>
        <Button
          onClick={doUpdate}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#7C57F2",
            "&:hover": { bgcolor: "#6b48ea" },
          }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
