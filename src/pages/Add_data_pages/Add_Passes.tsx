import React from "react";
import {
  Box,
  Card,
  Button,
  Chip,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { LocalizationProvider, DesktopDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "@mui/x-date-pickers/themeAugmentation";
import type { SelectChangeEvent } from "@mui/material/Select";
// import { apiUrl } from "../../config";
import api from "../../api/http";

/* ---------- Shared UI ---------- */
const CARD_SX = {
  bgcolor: "#1C1C1E",
  color: "#E8E8EA",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
} as const;

const COLORS = { link: "#7CA7FF", green: "#16a34a", purple: "#7C57F2" };
const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";

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

const LABEL_SX = {
  fontSize: 12,
  fontWeight: 500,
  color: "rgba(255, 255, 255, 0.51)",
  mb: 0.5,
  lineHeight: 1.2,
};

const fmtDate = (d: Date | null) => {
  if (!d) return "";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

// format 7 -> "REQ-007"
const toPassNo = (n: number) => `PRN-${String(n).padStart(3, "0")}`;

export default function AddPasses() {
  /* -------- Top card (bulk upload) state -------- */
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleSelectFile = () => fileInputRef.current?.click();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const clearTop = () => setFile(null);

  const handleDownloadTemplate = () => {
    const a = document.createElement("a");
    a.href = "/templates/passes_template.csv";
    a.download = "passes_template.csv";
    a.click();
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first.");
    if (!file.name.toLowerCase().endsWith(".csv")) {
      return alert("Only .csv files are supported.");
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);

      // const res = await fetch(apiUrl("/api/passes/bulk"), {
      //   method: "POST",
      //   body: fd,
      // });

      // // Just success/failure — no counts
      // if (!res.ok) throw new Error("upload failed");
      // await res.json().catch(() => ({}));
      await api.post("/api/passes/bulk", fd);
      alert("Bulk upload complete.");
      clearTop();
      await suggestNextPassNo(); // refresh next pass number after bulk insert
    } catch (e) {
      console.error(e);
      alert("Bulk upload failed.");
    } finally {
      setUploading(false);
    }
  };

  /* -------- Bottom card (form) state -------- */
  const [passReqNo, setPassReqNo] = React.useState("REQ-...");

  const [date, setDate] = React.useState<Date | null>(null);
  const [satellite, setSatellite] = React.useState("");
  const [station, setStation] = React.useState("");
  const [orbitNo, setOrbitNo] = React.useState("");
  const [maxEl, setMaxEl] = React.useState("");
  const [aos, setAos] = React.useState("");
  const [los, setLos] = React.useState("");
  const [ops, setOps] = React.useState<string[]>([]);
  const [opsReq, setOpsReq] = React.useState<string[]>([]);
  const [opsSup, setOpsSup] = React.useState<string[]>([]);
  // const [sched, setSched] = React.useState("Scheduled");
  const [sched] = React.useState("Scheduled"); // read-only
  const [remarks, setRemarks] = React.useState("");
  const passStatus = "Pending"; // readonly
  const [saving, setSaving] = React.useState(false);

  // Pull current passes and compute next REQ number (based on highest numeric part)
  const suggestNextPassNo = React.useCallback(async () => {
    try {
      // const res = await fetch(apiUrl("/api/passes"));
      // const json = await res.json().catch(() => []);
      const json = await api.get<any>("/api/passes");
      const rows: any[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.rows)
        ? json.rows
        : [];

      let maxNum = 0;
      for (const r of rows) {
        const raw = String(r.pass_req_no ?? "");
        const m = raw.match(/\d+/);
        const n = m ? parseInt(m[0], 10) : 0;
        if (!Number.isNaN(n)) maxNum = Math.max(maxNum, n);
      }
      setPassReqNo(toPassNo(maxNum + 1));
    } catch {
      setPassReqNo("PRN-001"); 
    }
  }, []);

  React.useEffect(() => {
    suggestNextPassNo();
  }, [suggestNextPassNo]);

  

  const fetchSatellites = React.useCallback(async () => {
  try {
    // const res = await fetch(apiUrl("/api/satellites"));
    // const j = await res.json();
    const j = await api.get<any>("/api/satellites");
    const arr = Array.isArray(j) ? j : Array.isArray(j?.data) ? j.data : [];
    const names = arr
      .map((r: any) => (r.satellite_name || r.name || r.satellite || "").toString().trim())
      .filter(Boolean);
    setSatOptions(names);
  } catch {
    setSatOptions([]);
  }
}, []);

const fetchStations = React.useCallback(async () => {
  try {
    // const res = await fetch(apiUrl("/api/ground-stations"));
    // const j = await res.json();
    const j = await api.get<any>("/api/ground-stations");
    const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
    const names = arr
      .map((r: any) => (r.ground_station || r.station_name || r.name || "").toString().trim())
      .filter(Boolean);
    setStationOptions(names);
  } catch {
    setStationOptions([]);
  }
}, []);

const fetchOperations = React.useCallback(async () => {
  try {
    // const res = await fetch(apiUrl("/api/operations"));
    // const j = await res.json();
    const j = await api.get<any>("/api/operations");
    const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
    setOpOptions(
      arr.map((r: any) => (r.operation_name || "").toString().trim()).filter(Boolean)
    );
  } catch {
    setOpOptions([]);
  }
}, []);

const fetchRequesters = React.useCallback(async () => {
  try {
    // const res = await fetch(apiUrl("/api/operation-requesters"));
    // const j = await res.json();
    const j = await api.get<any>("/api/operation-requesters");
    const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
    setReqOptions(
      arr.map((r: any) => (r.requester_name || "").toString().trim()).filter(Boolean)
    );
  } catch {
    setReqOptions([]);
  }
}, []);

const fetchSupporters = React.useCallback(async () => {
  try {
    // const res = await fetch(apiUrl("/api/operation-supporters"));
    // const j = await res.json();
    const j = await api.get<any>("/api/operation-supporters");
    const arr = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
    setSupOptions(
      arr.map((r: any) => (r.supporter_name || "").toString().trim()).filter(Boolean)
    );
  } catch {
    setSupOptions([]);
  }
}, []);

React.useEffect(() => {
  fetchSatellites();
  fetchStations();
  fetchOperations();
  fetchRequesters();
  fetchSupporters();
}, [fetchSatellites, fetchStations, fetchOperations, fetchRequesters, fetchSupporters]);

  const clearForm = () => {
    setDate(null);
    setSatellite("");
    setStation("");
    setOrbitNo("");
    setMaxEl("");
    setAos("");
    setLos("");
    setOps([]);
    setOpsReq([]);
    setOpsSup([]);
    // setSched("Scheduled");
    setRemarks("");
  };

  const handleSave = async () => {
    if (!date || !satellite || !station || !orbitNo || !maxEl || !aos || !los) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      pass_req_no: passReqNo,
      date_text: fmtDate(date),
      satellite_name: satellite,
      supporting_station: station,
      orbit_no: orbitNo,
      max_el_deg: maxEl,
      aos_ut: aos,
      los_ut: los,
      operations: ops.join(", "),
      operations_requester: opsReq.join(", "),
      operations_supporter: opsSup.join(", "),
      schedule_status: sched,
      pass_status: passStatus,
      remarks,
      added_by: "UI",
    };

    try {
      setSaving(true);
      // const res = await fetch(apiUrl("/api/passes"), {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      // const data = await res.json().catch(() => ({}));
      // if (!res.ok) {
      //   if (res.status === 409) return alert("Pass Req No must be unique.");
      //   return alert(data?.error || "Failed to save pass.");
      // }

       try {
   await api.post("/api/passes", payload);
 } catch (e: any) {
   if (String(e?.message || "").toLowerCase().includes("409")) {
     alert("Pass Req No must be unique.");
     return;
   }
   alert(e?.message || "Failed to save pass.");
   return;
 }
      alert("Pass saved successfully!");
      clearForm();
      await suggestNextPassNo();
    } catch (e) {
      console.error(e);
      alert("Network/API error while saving.");
    } finally {
      setSaving(false);
    }
  };

  /* -------- Options -------- */
 const [satOptions, setSatOptions] = React.useState<string[]>([]);
const [stationOptions, setStationOptions] = React.useState<string[]>([]);
const [opOptions, setOpOptions] = React.useState<string[]>([]);
const [reqOptions, setReqOptions] = React.useState<string[]>([]);
const [supOptions, setSupOptions] = React.useState<string[]>([]);
  // const schedStatuses = ["Scheduled", "Queued", "Hold"];

  const toArray = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    return typeof v === "string" ? v.split(",") : (v as string[]);
  };

  return (
    <MainLayout title="">
      {/* Page Backdrop while uploading large CSVs */}
      <Backdrop open={uploading} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>Uploading… this may take a while for large files.</Typography>
        </Box>
      </Backdrop>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Box
          sx={{
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
            display: "grid",
            gridTemplateRows: "auto 1fr",
            gap: 1.5,
            ...SCROLLER_SX,
          }}
        >
          {/* ---------- TOP: Bulk upload ---------- */}
          <Card sx={CARD_SX}>
            <Box
              sx={{
                px: 1.25,
                py: 0.6,
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 15, color: COLORS.link }}>
                Bulk Passes Upload
              </Typography>
              <Box sx={{ ml: "auto" }}>
                <Button
                  onClick={clearTop}
                  size="small"
                  sx={{ textTransform: "none", fontWeight: 700, color: COLORS.link, px: 1, minWidth: 0 }}
                >
                  Clear
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                p: 1,
                pl: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                flexWrap: { xs: "wrap", lg: "nowrap" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: 12 }}>Step 1: Download the given template</Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />}
                  onClick={handleDownloadTemplate}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: COLORS.green,
                    "&:hover": { bgcolor: "#12853d" },
                  }}
                >
                  Download Template
                </Button>

                <Typography sx={{ fontSize: 12, ml: { lg: 2 } }}>Step 2: Fill it & Upload</Typography>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleFileChange}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSelectFile}
                  disabled={uploading}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "#2b2b2b",
                    border: "1px solid rgba(255,255,255,0.14)",
                    "&:hover": { bgcolor: "#333" },
                  }}
                >
                  Select File
                </Button>

                {file && (
                  <Chip
                    label={file.name}
                    onDelete={uploading ? undefined : clearTop}
                    sx={{
                      bgcolor: "#0f0f10",
                      color: "#E8E8EA",
                      border: "1px solid rgba(255,255,255,0.14)",
                      ".MuiChip-deleteIcon": { color: "#999" },
                    }}
                  />
                )}
              </Box>

              <Button
                variant="contained"
                size="medium"
                startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
                disabled={!file || uploading}
                onClick={handleUpload}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: COLORS.purple,
                  "&:hover": { bgcolor: "#6b46f1" },
                  "&.Mui-disabled": {
                    bgcolor: "#2f2f33",
                    color: "#b5b7bd",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "none",
                    opacity: 1,
                  },
                }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Card>

          {/* ---------- BOTTOM: Add Pass form ---------- */}
          <Card sx={CARD_SX}>
            <Box
              sx={{
                px: 1.25,
                py: 0.7,
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>Add Pass Details</Typography>
              <Box sx={{ ml: "auto" }}>
                <Button
                  size="small"
                  onClick={clearForm}
                  sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}
                >
                  Clear
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
              <Box
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
                  <Typography sx={LABEL_SX}>Pass Req No *</Typography>
                  <TextField value={passReqNo} InputProps={{ readOnly: true }} size="small" sx={controlSx} />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Date(UT) *</Typography>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DesktopDatePicker
                      value={date}
                      onChange={(newValue: Date | null) => setDate(newValue)}
                      format="MM/dd/yyyy"
                      slotProps={{ textField: { size: "small", placeholder: "MM/DD/YYYY", sx: controlSx } }}
                    />
                  </LocalizationProvider>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Satellite Name *</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={satellite}
                      onChange={(e) => setSatellite(e.target.value)}
                      displayEmpty
                      sx={controlSx}
                      MenuProps={darkMenu}
                    >
                      <MenuItem disabled value="">
                        Select Satellite
                      </MenuItem>
                      {satOptions.map((s) => (
  <MenuItem key={s} value={s}>{s}</MenuItem>
))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 2 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Supporting Station *</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={station}
                      onChange={(e) => setStation(e.target.value)}
                      displayEmpty
                      sx={controlSx}
                      MenuProps={darkMenu}
                    >
                      <MenuItem disabled value="">
                        Select Station
                      </MenuItem>
                      {stationOptions.map((s) => (
  <MenuItem key={s} value={s}>{s}</MenuItem>
))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Orbit No *</Typography>
                  <TextField value={orbitNo} onChange={(e) => setOrbitNo(e.target.value)} placeholder="Enter Orbit No" size="small" sx={controlSx} />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Max (El) Deg *</Typography>
                  <TextField value={maxEl} onChange={(e) => setMaxEl(e.target.value)} placeholder="Enter Max El (Deg)" size="small" sx={controlSx} />
                </Box>

                {/* Row 3 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>AOS (UT) *</Typography>
                  <TextField value={aos} onChange={(e) => setAos(e.target.value)} placeholder="HH:MM:SS" size="small" sx={controlSx} inputProps={{ inputMode: "numeric" }} />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>LOS (UT) *</Typography>
                  <TextField value={los} onChange={(e) => setLos(e.target.value)} placeholder="HH:MM:SS" size="small" sx={controlSx} inputProps={{ inputMode: "numeric" }} />
                </Box>

                {/* Row 4 — multi-selects */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Operations</Typography>
                  <FormControl fullWidth size="small">
                    <Select<string[]>
                      multiple
                      value={ops}
                      onChange={(e) => setOps(toArray(e))}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as string[]).length ? (selected as string[]).join(", ") : "Select Operations"
                      }
                      sx={controlSx}
                      MenuProps={darkMenu}
                    >
                      <MenuItem disabled value="">
                        Select Operations
                      </MenuItem>
                      {opOptions.map((o) => (
  <MenuItem key={o} value={o}>
    <Checkbox checked={ops.indexOf(o) > -1} sx={{ p: 0.5, mr: 1, color: "#bbb" }} />
    <ListItemText primary={o} />
  </MenuItem>
))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Operations Requester</Typography>
                  <FormControl fullWidth size="small">
                    <Select<string[]>
                      multiple
                      value={opsReq}
                      onChange={(e) => setOpsReq(toArray(e))}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as string[]).length ? (selected as string[]).join(", ") : "Select Requester"
                      }
                      sx={controlSx}
                      MenuProps={darkMenu}
                    >
                      <MenuItem disabled value="">
                        Select Requester
                      </MenuItem>
                      {reqOptions.map((r) => (
  <MenuItem key={r} value={r}>
    <Checkbox checked={opsReq.indexOf(r) > -1} sx={{ p: 0.5, mr: 1, color: "#bbb" }} />
    <ListItemText primary={r} />
  </MenuItem>
))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>TTL Service provider</Typography>
                  <FormControl fullWidth size="small">
                    <Select<string[]>
                      multiple
                      value={opsSup}
                      onChange={(e) => setOpsSup(toArray(e))}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as string[]).length ? (selected as string[]).join(", ") : "Select Supporter"
                      }
                      sx={controlSx}
                      MenuProps={darkMenu}
                    >
                      <MenuItem disabled value="">
                        Select Supporter
                      </MenuItem>
                     {supOptions.map((s) => (
  <MenuItem key={s} value={s}>
    <Checkbox checked={opsSup.indexOf(s) > -1} sx={{ p: 0.5, mr: 1, color: "#bbb" }} />
    <ListItemText primary={s} />
  </MenuItem>
))}
                    </Select>
                  </FormControl>
                </Box>

          

                <Box className="form-item">
  <Typography sx={LABEL_SX}>Schedule Status *</Typography>
  <TextField
    value={sched}
    InputProps={{ readOnly: true }}
    size="small"
    sx={controlSx}
  />
</Box>


                {/* Row 5 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Pass Status</Typography>
                  <TextField value={passStatus} InputProps={{ readOnly: true }} size="small" sx={controlSx} />
                </Box>

                <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
                  <Typography sx={LABEL_SX}>Remarks</Typography>
                  <TextField value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Enter remarks" size="small" sx={controlSx} />
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving}
                  sx={{ textTransform: "none", fontWeight: 700, bgcolor: COLORS.purple, "&:hover": { bgcolor: "#6b46f1" } }}
                >
                  {saving ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
}
