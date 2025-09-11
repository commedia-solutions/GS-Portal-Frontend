// import { useState, useEffect, useRef, useCallback } from "react";
// import {
//   Box, Card, Button, Typography, TextField, FormControl, Select, MenuItem,
//   IconButton, Checkbox, ListItemText
// } from "@mui/material";
// import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
// import AddRoundedIcon from "@mui/icons-material/AddRounded";
// import MainLayout from "../../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../../components/TopNav";
// import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers";
// import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import type { SelectChangeEvent } from "@mui/material/Select";

// /* ---------- config ---------- */
// const API = `${import.meta.env.VITE_API_BASE}/api`; // e.g. http://localhost:4000/api
// const LICENSE_PREFIX = "LRN-";
// const COLORS = { link: "#7CA7FF", purple: "#7C57F2" };

// /* ---------- styles ---------- */
// const CARD_SX = { bgcolor: "#1C1C1E", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 2, display: "flex", flexDirection: "column" } as const;
// const CONTROL_BG = "#1C1C1E";
// const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
// const controlSx = {
//   bgcolor: "#232325", borderRadius: 1, color: "#fff",
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4e4e4e" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#565656" },
//   "& .MuiInputBase-input": { color: "#fff", fontSize: 13 },
// };
// const SCROLLER_SX = {
//   scrollbarWidth: "thin", scrollbarColor: "#3f3f3f transparent",
//   "&::-webkit-scrollbar": { width: 8, height: 8 },
//   "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
//   "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
//   "&::-webkit-scrollbar-track": { background: "transparent" },
// };
// const darkMenu = { PaperProps: { sx: { bgcolor: CONTROL_BG, color: "#E8E8EA", border: CONTROL_BORDER, "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" }, "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" } } } };
// const LABEL_SX = { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.72)", mb: 0.5, lineHeight: 1.2 };
// const LIGHT_PICKER_POPPER_SX = {
//   "& .MuiPaper-root": { bgcolor: "#fff", color: "#111", border: "1px solid #E5E7EB", borderRadius: 1.25, boxShadow: "0 12px 32px rgba(0,0,0,0.35)" },
//   "& .MuiPickersCalendarHeader-label": { fontSize: 13, fontWeight: 700, color: "#111" },
//   "& .MuiDayCalendar-weekDayLabel": { fontSize: 11, color: "#6b7280" },
//   "& .MuiPickersDay-root": { width: 26, height: 26, fontSize: 12, margin: "0 2px", color: "#111", "&.Mui-selected": { bgcolor: "#EEF2FF !important", color: "#111", border: "2px solid #7C57F2" } },
//   "& .MuiIconButton-root": { p: 0.5, color: "#111" },
// };

// /* ---------- types ---------- */
// type BandRow = { id: number; band: string; uplink: string; downlink: string };
// type GroundStationRow = { id: number; ground_station?: string; station_name?: string; name?: string; [k: string]: unknown };

// /* ---------- helpers ---------- */
// const fmtDate = (d: Date | null) =>
//   d ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}` : "";

// export default function AddLicense() {
//   // main form
//   const [licenseReqNo, setLicenseReqNo] = useState("LRN-...");
//   const [satellite, setSatellite] = useState("");
//   const [appliedDate, setAppliedDate] = useState<Date | null>(null);
//   const [receiptDate, setReceiptDate] = useState<Date | null>(null);
//   const [validity, setValidity] = useState<Date | null>(null);
//   const [status, setStatus] = useState("Pending");
//   const [remarks, setRemarks] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//   // stations (multi-select)
//   const [stationsSel, setStationsSel] = useState<string[]>([]);
//   const [stationOptions, setStationOptions] = useState<string[]>([]);

//   // state (near stations state)
 
//   const [satOptions, setSatOptions] = useState<string[]>([]);



//   // bands table
//   const [rows, setRows] = useState<BandRow[]>([{ id: 1, band: "", uplink: "", downlink: "" }]);
//   const nextIdRef = useRef(2);

//   /* ---------- fetch stations ---------- */
//   const fetchStations = useCallback(async () => {
//     try {
//       const r = await fetch(`${API}/ground-stations`);
//       const j = await r.json();
//       const list: string[] = Array.isArray(j?.data)
//         ? (j.data as GroundStationRow[])
//             .map((row) => (row.ground_station || row.station_name || row.name || "").toString().trim())
//             .filter(Boolean)
//         : [];
//       setStationOptions(list);
//     } catch (e) {
//       console.error("Failed to load ground stations", e);
//       setStationOptions([]);
//     }
//   }, []);

//   // types (optional helper)
// type SatelliteRow = { satellite_name?: string; sat_name?: string; satellite_id?: string; [k:string]: unknown };

// // fetchers
// const fetchSatellites = useCallback(async () => {
//   try {
//     const r = await fetch(`${API}/satellites`);
//     const j = await r.json();
//     const list = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
//     const names = list
//       .map((row: any) => String(row.satellite_name || row.name || row.satellite_id || "").trim())
//       .filter(Boolean);
//     setSatOptions(names);
//   } catch (e) {
//     console.error("Failed to load satellites", e);
//     setSatOptions([]);
//   }
// }, []);


//   /* ---------- fetch next LRN-### from licenses count ---------- */
//   const fetchNextLicenseNo = useCallback(async () => {
//     try {
//       const r = await fetch(`${API}/licenses?limit=1`);
//       const j = await r.json();  // { total, data: [...] }
//       const total = Number(j?.total ?? 0);
//       const next = String(total + 1).padStart(3, "0");
//       setLicenseReqNo(`${LICENSE_PREFIX}${next}`);
//     } catch (e) {
//       console.error("Failed to get next license no", e);
//       setLicenseReqNo(`${LICENSE_PREFIX}${Math.floor(Math.random() * 900 + 100)}`);
//     }
//   }, []);

//   // useEffect(() => {
//   //   fetchStations();
//   //   fetchNextLicenseNo();
    
//   // }, [fetchStations, fetchNextLicenseNo]);

//     useEffect(() => {
//   fetchStations();
//   fetchNextLicenseNo();
//   fetchSatellites();           // <-- add this
// }, [fetchStations, fetchNextLicenseNo, fetchSatellites]);


//   /* ---------- options ---------- */
//   const statusOptions = ["Pending", "Approved", "Rejected", "Expired"];
//   const bandOptions = ["S-Band", "X-Band", "Ka-Band", "UHF", "VHF"];

//   const addRow = () =>
//     setRows((r) => [...r, { id: nextIdRef.current++, band: "", uplink: "", downlink: "" }]);
//   const removeRow = (id: number) => setRows((r) => (r.length === 1 ? r : r.filter((x) => x.id !== id)));
//   const updateRow = (id: number, key: keyof BandRow, value: string) =>
//     setRows((r) => r.map((x) => (x.id === id ? { ...x, [key]: value } : x)));

//   const clearAll = () => {
//     setSatellite("");
//     setStationsSel([]);
//     setAppliedDate(null);
//     setReceiptDate(null);
//     setValidity(null);
//     setStatus("Pending");
//     setRemarks("");
//     setRows([{ id: 1, band: "", uplink: "", downlink: "" }]);
//     nextIdRef.current = 2;
//   };

//   /* ---------- SAVE (POST /api/licenses) ---------- */
//   const handleSave = async () => {
//     // quick client validation
//     if (!satellite || !stationsSel.length || !appliedDate) {
//       alert("Please fill Satellite, Station and Applied Date.");
//       return;
//     }

//     const bands = rows
//       .filter((r) => r.band && r.uplink && r.downlink)
//       .map((r) => ({ band_name: r.band, uplink: r.uplink, downlink: r.downlink }));

//     // backend expects these exact keys:
//     const payload = {
//       license_req_no: licenseReqNo,
//       satellite_name: satellite,
//       station_name: stationsSel.join(", "), // store as CSV in VARCHAR
//       applied_date: fmtDate(appliedDate),
//       receipt_date: fmtDate(receiptDate),
//       validity_expiry: fmtDate(validity),
//       status,
//       remarks,
//       added_by: "UI",
//       bands,
//     };

//     try {
//       setIsSaving(true);
//       const resp = await fetch(`${API}/licenses`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!resp.ok) {
//         const err = await resp.json().catch(() => ({}));
//         alert(`Failed to save license: ${err.message || resp.statusText}`);
//         return;
//         }

//       await resp.json(); // created license
//       alert("License saved successfully.");
//       clearAll();
//       await fetchNextLicenseNo(); // bump to next LRN
//     } catch (e) {
//       console.error(e);
//       alert("Failed to save license. Please try again.");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   return (
//     <MainLayout title="">
//       <Box sx={{ px: 2, py: 1.5 }}>
//         <Card sx={{ ...CARD_SX, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)` }}>
//           {/* Header */}
//           <Box sx={{ px: 1.25, py: 0.7, borderBottom: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: 1 }}>
//             <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Add License Details</Typography>
//             <Box sx={{ ml: "auto" }}>
//               <Button size="small" onClick={clearAll} sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}>
//                 Clear
//               </Button>
//             </Box>
//           </Box>

//           {/* Body */}
//           <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
//             {/* === Upper form === */}
//             <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" }, columnGap: 2, rowGap: 2, "& .form-item": { display: "flex", flexDirection: "column" }, "& .form-label": { ...LABEL_SX } }}>
//               {/* Row 1 */}
//               <Box className="form-item">
//                 <Typography className="form-label">License Req No *</Typography>
//                 <TextField value={licenseReqNo} size="small" sx={controlSx} InputProps={{ readOnly: true }} />
//               </Box>

//               <Box className="form-item">
//                 <Typography className="form-label">Satellite Name *</Typography>
//                     <FormControl fullWidth size="small">
//   <Select
//     value={satellite}
//     onChange={(e) => setSatellite(e.target.value)}
//     displayEmpty
//     sx={controlSx}
//     MenuProps={darkMenu}
//   >
//     <MenuItem disabled value="">Select Satellite</MenuItem>
//     {satOptions.map((s) => (
//       <MenuItem key={s} value={s}>{s}</MenuItem>
//     ))}
//   </Select>
// </FormControl>
//               </Box>

//               <Box className="form-item">
//                 <Typography className="form-label">Station *</Typography>
//                 <FormControl fullWidth size="small">
//                   <Select<string[]>
//                     multiple
//                     value={stationsSel}
//                     onChange={(e: SelectChangeEvent<string[]>) => {
//                       const v = e.target.value;
//                       setStationsSel(typeof v === "string" ? v.split(",") : (v as string[]));
//                     }}
//                     displayEmpty
//                     renderValue={(selected) =>
//                       (selected as string[]).length ? (selected as string[]).join(", ") : "Select Station"
//                     }
//                     sx={controlSx}
//                     MenuProps={darkMenu}
//                   >
//                     <MenuItem disabled value="">Select Station</MenuItem>
//                     {stationOptions.map((s) => (
//                       <MenuItem key={s} value={s}>
//                         <Checkbox checked={stationsSel.indexOf(s) > -1} sx={{ p: 0.5, mr: 1, color: "#bbb" }} />
//                         <ListItemText primary={s} />
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>

//               {/* Row 2 */}
//               <Box className="form-item">
//                 <Typography className="form-label">Applied Date *</Typography>
//                 <LocalizationProvider dateAdapter={AdapterDateFns}>
//                   <DesktopDatePicker
//                     value={appliedDate}
//                     onChange={(v) => setAppliedDate(v)}
//                     format="MM/dd/yyyy"
//                     slotProps={{ textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" }, popper: { sx: LIGHT_PICKER_POPPER_SX } }}
//                   />
//                 </LocalizationProvider>
//               </Box>

//               <Box className="form-item">
//                 <Typography className="form-label">Receipt Date</Typography>
//                 <LocalizationProvider dateAdapter={AdapterDateFns}>
//                   <DesktopDatePicker
//                     value={receiptDate}
//                     onChange={(v) => setReceiptDate(v)}
//                     format="MM/dd/yyyy"
//                     slotProps={{ textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" }, popper: { sx: LIGHT_PICKER_POPPER_SX } }}
//                   />
//                 </LocalizationProvider>
//               </Box>

//               <Box className="form-item">
//                 <Typography className="form-label">Validity (Expiry)</Typography>
//                 <LocalizationProvider dateAdapter={AdapterDateFns}>
//                   <DesktopDatePicker
//                     value={validity}
//                     onChange={(v) => setValidity(v)}
//                     format="MM/dd/yyyy"
//                     slotProps={{ textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" }, popper: { sx: LIGHT_PICKER_POPPER_SX } }}
//                   />
//                 </LocalizationProvider>
//               </Box>

//               {/* Row 3 */}
//               <Box className="form-item">
//                 <Typography className="form-label">Status *</Typography>
//                 <FormControl fullWidth size="small">
//                   <Select value={status} onChange={(e) => setStatus(e.target.value)} sx={controlSx} MenuProps={darkMenu}>
//                     {statusOptions.map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
//                   </Select>
//                 </FormControl>
//               </Box>

//               <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
//                 <Typography className="form-label">Remarks</Typography>
//                 <TextField value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter remarks" size="small" sx={controlSx} />
//               </Box>
//             </Box>

//             {/* Bands */}
//             <Box sx={{ mt: 2, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 1.5, overflow: "hidden" }}>
//               <Box sx={{ px: 1.25, py: 0.75, bgcolor: "#242426", borderBottom: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center" }}>
//                 <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Bands</Typography>
//                 <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
//                   <Button onClick={() => setRows([{ id: 1, band: "", uplink: "", downlink: "" }])} size="small" sx={{ textTransform: "none", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.24)", borderRadius: 1, px: 1.25, "&:hover": { background: "rgba(255,255,255,0.06)" } }}>
//                     Clear
//                   </Button>
//                   <Button onClick={addRow} size="small" startIcon={<AddRoundedIcon />} color="error" variant="contained" sx={{ textTransform: "none", fontWeight: 700 }}>
//                     Add
//                   </Button>
//                 </Box>
//               </Box>

//               <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 40px", gap: 1, px: 1, py: 0.75, bgcolor: "#1C1C1E", borderBottom: "1px solid rgba(255,255,255,0.14)", fontWeight: 700, fontSize: 13 }}>
//                 <Box>Band</Box><Box>Uplink</Box><Box>Downlink</Box><Box />
//               </Box>

//               {rows.map((r) => (
//                 <Box key={r.id} sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 40px", gap: 1, px: 1, py: 1, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
//                   <FormControl size="small" fullWidth>
//                     <Select value={r.band} onChange={(e) => updateRow(r.id, "band", e.target.value)} displayEmpty sx={controlSx} MenuProps={darkMenu}>
//                       <MenuItem disabled value="">Select Band</MenuItem>
//                       {bandOptions.map((b) => (<MenuItem key={b} value={b}>{b}</MenuItem>))}
//                     </Select>
//                   </FormControl>
//                   <TextField value={r.uplink} onChange={(e) => updateRow(r.id, "uplink", e.target.value)} placeholder="Enter Uplink" size="small" sx={controlSx} />
//                   <TextField value={r.downlink} onChange={(e) => updateRow(r.id, "downlink", e.target.value)} placeholder="Enter Downlink" size="small" sx={controlSx} />
//                   <IconButton aria-label="remove row" onClick={() => removeRow(r.id)} sx={{ color: "rgba(255,255,255,0.6)" }} disabled={rows.length === 1}>
//                     <CloseRoundedIcon />
//                   </IconButton>
//                 </Box>
//               ))}
//             </Box>

//             {/* Save */}
//             <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
//               <Button variant="contained" onClick={handleSave} disabled={isSaving}
//                 sx={{ textTransform: "none", fontWeight: 700, bgcolor: COLORS.purple, "&:hover": { bgcolor: "#6b46f1" } }}>
//                 {isSaving ? "Saving..." : "Save"}
//               </Button>
//             </Box>
//           </Box>
//         </Card>
//       </Box>
//     </MainLayout>
//   );
// }


//p2//
// src/pages/license/AddLicense.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  Box, Card, Button, Typography, TextField, FormControl, Select, MenuItem,
  IconButton, Checkbox, ListItemText
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import type { SelectChangeEvent } from "@mui/material/Select";

/* ---------- use the shared HTTP helper (adds Bearer token) ---------- */
import api from "../../api/http";

/* ---------- config ---------- */
const LICENSE_PREFIX = "LRN-";
const COLORS = { link: "#7CA7FF", purple: "#7C57F2" };

/* ---------- styles ---------- */
const CARD_SX = {
  bgcolor: "#1C1C1E",
  color: "#E8E8EA",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
} as const;

const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
const controlSx = {
  bgcolor: "#232325",
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4e4e4e" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#565656" },
  "& .MuiInputBase-input": { color: "#fff", fontSize: 13 },
};
const SCROLLER_SX = {
  scrollbarWidth: "thin",
  scrollbarColor: "#3f3f3f transparent",
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
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
const LABEL_SX = { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.72)", mb: 0.5, lineHeight: 1.2 };
const LIGHT_PICKER_POPPER_SX = {
  "& .MuiPaper-root": { bgcolor: "#fff", color: "#111", border: "1px solid #E5E7EB", borderRadius: 1.25, boxShadow: "0 12px 32px rgba(0,0,0,0.35)" },
  "& .MuiPickersCalendarHeader-label": { fontSize: 13, fontWeight: 700, color: "#111" },
  "& .MuiDayCalendar-weekDayLabel": { fontSize: 11, color: "#6b7280" },
  "& .MuiPickersDay-root": { width: 26, height: 26, fontSize: 12, margin: "0 2px", color: "#111", "&.Mui-selected": { bgcolor: "#EEF2FF !important", color: "#111", border: "2px solid #7C57F2" } },
  "& .MuiIconButton-root": { p: 0.5, color: "#111" },
};

/* ---------- types ---------- */
type BandRow = { id: number; band: string; uplink: string; downlink: string };
type GroundStationRow = {
  id?: number;
  ground_station?: string;
  station_name?: string;
  name?: string;
  [k: string]: unknown;
};

type SatelliteRow = {
  satellite_name?: string;
  name?: string;
  satellite_id?: string;
  [k: string]: unknown;
};

/* ---------- helpers ---------- */
const fmtDate = (d: Date | null) =>
  d ? `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}` : "";

export default function AddLicense() {
  // main form
  const [licenseReqNo, setLicenseReqNo] = useState("LRN-...");
  const [satellite, setSatellite] = useState("");
  const [appliedDate, setAppliedDate] = useState<Date | null>(null);
  const [receiptDate, setReceiptDate] = useState<Date | null>(null);
  const [validity, setValidity] = useState<Date | null>(null);
  const [status, setStatus] = useState("Pending");
  const [remarks, setRemarks] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // stations (multi-select)
  const [stationsSel, setStationsSel] = useState<string[]>([]);
  const [stationOptions, setStationOptions] = useState<string[]>([]);

  // satellites
  const [satOptions, setSatOptions] = useState<string[]>([]);

  // bands table
  const [rows, setRows] = useState<BandRow[]>([{ id: 1, band: "", uplink: "", downlink: "" }]);
  const nextIdRef = useRef(2);

  /* ---------- fetch stations ---------- */
const fetchStations = useCallback(async () => {
  try {
    const j = await api.get<any>("/api/ground-stations");

    // payload can be {data: [...] } or just [...]
    const rows: (GroundStationRow | string)[] = Array.isArray((j as any)?.data)
      ? (j as any).data
      : Array.isArray(j)
      ? (j as any)
      : [];

    const names = rows
      .map((row) =>
        typeof row === "string"
          ? row.trim()
          : String(
              (row as GroundStationRow).ground_station ??
                (row as GroundStationRow).station_name ??
                (row as GroundStationRow).name ??
                ""
            ).trim()
      )
      .filter((s) => s.length > 0);

    setStationOptions(names);
  } catch (e) {
    console.error("Failed to load ground stations", e);
    setStationOptions([]);
  }
}, []);

  /* ---------- fetch satellites ---------- */
  const fetchSatellites = useCallback(async () => {
  try {
    const j = await api.get<any>("/api/satellites");

    const rows: (SatelliteRow | string)[] = Array.isArray((j as any)?.data)
      ? (j as any).data
      : Array.isArray(j)
      ? (j as any)
      : [];

    const names = rows
      .map((row) =>
        typeof row === "string"
          ? row.trim()
          : String(
              (row as SatelliteRow).satellite_name ??
                (row as SatelliteRow).name ??
                (row as SatelliteRow).satellite_id ??
                ""
            ).trim()
      )
      .filter((s) => s.length > 0);

    setSatOptions(names);
  } catch (e) {
    console.error("Failed to load satellites", e);
    setSatOptions([]);
  }
}, []);
  /* ---------- fetch next LRN-### from licenses total ---------- */
  const fetchNextLicenseNo = useCallback(async () => {
    try {
      const j: any = await api.get("/api/licenses?limit=1");
      const total = Number(j?.total ?? 0);
      const next = String(total + 1).padStart(3, "0");
      setLicenseReqNo(`${LICENSE_PREFIX}${next}`);
    } catch (e) {
      console.error("Failed to get next license no", e);
      setLicenseReqNo(`${LICENSE_PREFIX}${Math.floor(Math.random() * 900 + 100)}`);
    }
  }, []);

  useEffect(() => {
    fetchStations();
    fetchSatellites();
    fetchNextLicenseNo();
  }, [fetchStations, fetchSatellites, fetchNextLicenseNo]);

  /* ---------- options ---------- */
  // const statusOptions = ["Pending", "Approved", "Rejected", "Expired"];
  // const bandOptions = ["S-Band", "X-Band", "Ka-Band", "UHF", "VHF"];

  const addRow = () => setRows((r) => [...r, { id: nextIdRef.current++, band: "", uplink: "", downlink: "" }]);
  const removeRow = (id: number) => setRows((r) => (r.length === 1 ? r : r.filter((x) => x.id !== id)));
  const updateRow = (id: number, key: keyof BandRow, value: string) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, [key]: value } : x)));

  const clearAll = () => {
    setSatellite("");
    setStationsSel([]);
    setAppliedDate(null);
    setReceiptDate(null);
    setValidity(null);
    setStatus("Pending");
    setRemarks("");
    setRows([{ id: 1, band: "", uplink: "", downlink: "" }]);
    nextIdRef.current = 2;
  };

  /* ---------- SAVE (POST /api/licenses) ---------- */
  const handleSave = async () => {
    if (!satellite || !stationsSel.length || !appliedDate) {
      alert("Please fill Satellite, Station and Applied Date.");
      return;
    }

    const bands = rows
      .filter((r) => r.band && r.uplink && r.downlink)
      .map((r) => ({ band_name: r.band, uplink: r.uplink, downlink: r.downlink }));

    const payload = {
      license_req_no: licenseReqNo,
      satellite_name: satellite,
      station_name: stationsSel.join(", "),
      applied_date: fmtDate(appliedDate),
      receipt_date: fmtDate(receiptDate),
      validity_expiry: fmtDate(validity),
      status,
      remarks,
      added_by: "UI",
      bands,
    };

    try {
      setIsSaving(true);
      await api.post("/api/licenses", payload);
      alert("License saved successfully.");
      clearAll();
      await fetchNextLicenseNo();
    } catch (e: any) {
      console.error(e);
      alert(`Failed to save license. ${e?.message || ""}`.trim());
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card sx={{ ...CARD_SX, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)` }}>
          {/* Header */}
          <Box sx={{ px: 1.25, py: 0.7, borderBottom: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Add License Details</Typography>
            <Box sx={{ ml: "auto" }}>
              <Button size="small" onClick={clearAll} sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}>
                Clear
              </Button>
            </Box>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
            {/* === Upper form === */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
                columnGap: 2,
                rowGap: 2,
                "& .form-item": { display: "flex", flexDirection: "column" },
                "& .form-label": { ...LABEL_SX },
              }}
            >
              {/* Row 1 */}
              <Box className="form-item">
                <Typography className="form-label">License Req No *</Typography>
                <TextField value={licenseReqNo} size="small" sx={controlSx} InputProps={{ readOnly: true }} />
              </Box>

              <Box className="form-item">
                <Typography className="form-label">Satellite Name *</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={satellite}
                    onChange={(e) => setSatellite(e.target.value)}
                    displayEmpty
                    sx={controlSx}
                    MenuProps={darkMenu}
                  >
                    <MenuItem disabled value="">Select Satellite</MenuItem>
                    {satOptions.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box className="form-item">
                <Typography className="form-label">Station *</Typography>
                <FormControl fullWidth size="small">
                  <Select<string[]>
                    multiple
                    value={stationsSel}
                    onChange={(e: SelectChangeEvent<string[]>) => {
                      const v = e.target.value;
                      setStationsSel(typeof v === "string" ? v.split(",") : (v as string[]));
                    }}
                    displayEmpty
                    renderValue={(selected) =>
                      (selected as string[]).length ? (selected as string[]).join(", ") : "Select Station"
                    }
                    sx={controlSx}
                    MenuProps={darkMenu}
                  >
                    <MenuItem disabled value="">Select Station</MenuItem>
                    {stationOptions.map((s) => (
                      <MenuItem key={s} value={s}>
                        <Checkbox checked={stationsSel.indexOf(s) > -1} sx={{ p: 0.5, mr: 1, color: "#bbb" }} />
                        <ListItemText primary={s} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Row 2 */}
              <Box className="form-item">
                <Typography className="form-label">Applied Date *</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    value={appliedDate}
                    onChange={(v) => setAppliedDate(v)}
                    format="MM/dd/yyyy"
                    slotProps={{ textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" }, popper: { sx: LIGHT_PICKER_POPPER_SX } }}
                  />
                </LocalizationProvider>
              </Box>

              <Box className="form-item">
                <Typography className="form-label">Receipt Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    value={receiptDate}
                    onChange={(v) => setReceiptDate(v)}
                    format="MM/dd/yyyy"
                    slotProps={{ textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" }, popper: { sx: LIGHT_PICKER_POPPER_SX } }}
                  />
                </LocalizationProvider>
              </Box>

              <Box className="form-item">
                <Typography className="form-label">Validity (Expiry)</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DesktopDatePicker
                    value={validity}
                    onChange={(v) => setValidity(v)}
                    format="MM/dd/yyyy"
                    slotProps={{ textField: { size: "small", sx: controlSx, placeholder: "MM/DD/YYYY" }, popper: { sx: LIGHT_PICKER_POPPER_SX } }}
                  />
                </LocalizationProvider>
              </Box>

              {/* Row 3 */}
              <Box className="form-item">
                <Typography className="form-label">Status *</Typography>
                <FormControl fullWidth size="small">
                  <Select value={status} onChange={(e) => setStatus(e.target.value)} sx={controlSx} MenuProps={darkMenu}>
                    {["Pending", "Approved", "Rejected", "Expired"].map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                  </Select>
                </FormControl>
              </Box>

              <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
                <Typography className="form-label">Remarks</Typography>
                <TextField value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter remarks" size="small" sx={controlSx} />
              </Box>
            </Box>

            {/* Bands */}
            <Box sx={{ mt: 2, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 1.5, overflow: "hidden" }}>
              <Box sx={{ px: 1.25, py: 0.75, bgcolor: "#242426", borderBottom: "1px solid rgba(255,255,255,0.14)", display: "flex", alignItems: "center" }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Bands</Typography>
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  <Button
                    onClick={() => setRows([{ id: 1, band: "", uplink: "", downlink: "" }])}
                    size="small"
                    sx={{ textTransform: "none", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.24)", borderRadius: 1, px: 1.25, "&:hover": { background: "rgba(255,255,255,0.06)" } }}
                  >
                    Clear
                  </Button>
                  <Button onClick={addRow} size="small" startIcon={<AddRoundedIcon />} color="error" variant="contained" sx={{ textTransform: "none", fontWeight: 700 }}>
                    Add
                  </Button>
                </Box>
              </Box>

              <Box sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 40px", gap: 1, px: 1, py: 0.75, bgcolor: "#1C1C1E", borderBottom: "1px solid rgba(255,255,255,0.14)", fontWeight: 700, fontSize: 13 }}>
                <Box>Band</Box><Box>Uplink</Box><Box>Downlink</Box><Box />
              </Box>

              {rows.map((r) => (
                <Box key={r.id} sx={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 40px", gap: 1, px: 1, py: 1, alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                  <FormControl size="small" fullWidth>
                    <Select value={r.band} onChange={(e) => updateRow(r.id, "band", e.target.value)} displayEmpty sx={controlSx} MenuProps={darkMenu}>
                      <MenuItem disabled value="">Select Band</MenuItem>
                      {["S-Band", "X-Band", "Ka-Band", "UHF", "VHF"].map((b) => (<MenuItem key={b} value={b}>{b}</MenuItem>))}
                    </Select>
                  </FormControl>
                  <TextField value={r.uplink} onChange={(e) => updateRow(r.id, "uplink", e.target.value)} placeholder="Enter Uplink" size="small" sx={controlSx} />
                  <TextField value={r.downlink} onChange={(e) => updateRow(r.id, "downlink", e.target.value)} placeholder="Enter Downlink" size="small" sx={controlSx} />
                  <IconButton aria-label="remove row" onClick={() => removeRow(r.id)} sx={{ color: "rgba(255,255,255,0.6)" }} disabled={rows.length === 1}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>

            {/* Save */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSaving}
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: COLORS.purple, "&:hover": { bgcolor: "#6b46f1" } }}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </MainLayout>
  );
}
