import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stack,
  Typography,
  FormControl,
  MenuItem,
  ListItemText,
} from "@mui/material";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

export type AntBand = {
  band: string;
  gt: string;
  uplink: boolean;
  downlink: boolean;
};

// export type AntGT = { band: string; gt: string };

export type AntennaDialogRow = {
  id: number;
  type: string;
  location: string;
  size_m: string;
  eirp_dbw: string;
   tx_polarization: string[];   // ✅ FIX
  rx_polarization: string[];  
  travel_range: string;
  tracking_velocity: string;
  tracking_acceleration: string;
  tracking_modes: string;
  bands: AntBand[];
  // gts: AntGT[];
};

type Props = {
  open: boolean;
  row: AntennaDialogRow | null;
  onClose: () => void;
  onSave: (updated: AntennaDialogRow) => void;
onDelete?: (row: AntennaDialogRow) => void;
};

const PRIMARY = "#7C57F2";
const BORDER = "1px solid rgba(255,255,255,0.14)";
const LABEL_SX = { fontSize: 13, color: "rgba(255,255,255,0.85)" };
const controlSx = {
  "& .MuiInputBase-root": {
    backgroundColor: "#1C1C1E",
    borderRadius: 1,
    color: "#fff",
    height: 36,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.14)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.24)" },
  "& .MuiInputBase-input": { fontSize: 14, px: 1.25 },
} as const;
const darkSelectSx = {
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.14)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.24)" },
  "& .MuiInputBase-input": { fontSize: 14 },
  backgroundColor: "#1C1C1E",
  borderRadius: 1,
  color: "#fff",
} as const;

const darkMenu = {
  PaperProps: {
    sx: {
      bgcolor: "#1C1C1E",
      color: "#E8E8EA",
      border: "1px solid rgba(255,255,255,0.14)",
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
    },
  },
};

const BAND_OPTIONS = ["UHF (300 MHz – 3 GHz)", "VHF (30 MHz – 300 MHz)", "L (1-2 GHz)", "S (2.0 – 2.3 GHz)", "C (4 – 8 GHz)", "X (8 – 12 GHz)", "Ku (12-18 GHz)", "Ka (26.5 to 40 GHz)"];

export default function UpdateAntennaDialog({
  open,
  row,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [busy, setBusy] = React.useState(false);

  // core fields
  const [type, setType] = React.useState("");
  const [size_m, setSize] = React.useState("");
  const [location, setLocation] = React.useState(""); // ✅ ADD

  const [eirp_dbw, setEirp] = React.useState("");
const [tx_polarization, setTxPol] = React.useState<string[]>([]);
const [rx_polarization, setRxPol] = React.useState<string[]>([]);

  const [travel_range, setTravel] = React.useState("");
  const [tracking_velocity, setVel] = React.useState("");
  const [tracking_acceleration, setAcc] = React.useState("");
  const [tracking_modes, setModes] = React.useState("");

  // bands
  const [bands, setBands] = React.useState<AntBand[]>([]);
 const [curBand, setCurBand] = React.useState("");
const [curGT, setCurGT] = React.useState("");
const [isUplink, setIsUplink] = React.useState(false);
const [isDownlink, setIsDownlink] = React.useState(false);


  // gts
  // const [gts, setGts] = React.useState<AntGT[]>([]);
  // const [gtBand, setGtBand] = React.useState("");
  // const [gtVal, setGtVal] = React.useState("");

  React.useEffect(() => {
    setBusy(false);
    setType(row?.type ?? "");
    setLocation(row?.location ?? ""); // ✅ ADD

    setSize(row?.size_m ?? "");
    setEirp(row?.eirp_dbw ?? "");

    setTxPol(row?.tx_polarization ?? []);
    setRxPol(row?.rx_polarization ?? []);

    setTravel(row?.travel_range ?? "");
    setVel(row?.tracking_velocity ?? "");
    setAcc(row?.tracking_acceleration ?? "");
    setModes(row?.tracking_modes ?? "");
    setBands(
  (row?.bands ?? []).map((b: any) => ({
    band: b.band,
    gt: String(b.gt ?? b.g_t ?? b.gt_value ?? ""),
    uplink: Boolean(b.uplink),
    downlink: Boolean(b.downlink),
  }))
);

   setCurBand("");
setCurGT("");
setIsUplink(false);
setIsDownlink(false);

   
  }, [row, open]);

  const canSave = type.trim().length > 0;

const addBand = () => {
  if (!curBand || !curGT || (!isUplink && !isDownlink)) return;

  setBands((b) => [
    ...b,
    {
      band: curBand,
      gt: curGT,
      uplink: isUplink,
      downlink: isDownlink,
    },
  ]);

  setCurGT("");
  setIsUplink(false);
  setIsDownlink(false);
};

  const removeBand = (idx: number) => setBands((b) => b.filter((_, i) => i !== idx));

  // const addGT = () => {
  //   if (!gtBand || !gtVal) return;
  //   setGts((g) => [...g, { band: gtBand, gt: gtVal }]);
  //   setGtVal("");
  // };
  // const removeGT = (idx: number) => setGts((g) => g.filter((_, i) => i !== idx));

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!row || !canSave) return;
    try {
      setBusy(true);
      onSave({
        id: row.id,
        type: type.trim(),
         location: location.trim(),
        size_m: size_m.trim(),
        eirp_dbw: eirp_dbw.trim(),
        tx_polarization,
rx_polarization,
        travel_range: travel_range.trim(),
        tracking_velocity: tracking_velocity.trim(),
        tracking_acceleration: tracking_acceleration.trim(),
        tracking_modes: tracking_modes.trim(),
        bands,
        // gts,
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!row) return;
    if (!confirm("Delete this Antenna?")) return;
    try {
      setBusy(true);
      onDelete?.(row);

    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#17171A",
          border: BORDER,
          color: "#fff",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 22 }}>
        Update Antenna
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSave}>
          {/* core fields */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
              gap: 2,
              mt: 0.5,
            }}
          >
            <Stack spacing={0.75}>
              <Typography sx={LABEL_SX}>Antenna Name *</Typography>
              <TextField value={type} onChange={(e) => setType(e.target.value)} size="small" fullWidth sx={controlSx} />
            </Stack>
            <Stack spacing={0.75}>
  <Typography sx={LABEL_SX}>Location</Typography>
  <TextField
    value={location}
    onChange={(e) => setLocation(e.target.value)}
    size="small"
    fullWidth
    sx={controlSx}
  />
</Stack>

            <Stack spacing={0.75}>
              <Typography sx={LABEL_SX}>Antenna Size (m)</Typography>
              <TextField value={size_m} onChange={(e) => setSize(e.target.value)} size="small" fullWidth sx={controlSx} />
            </Stack>
            <Stack spacing={0.75}>
              <Typography sx={LABEL_SX}>EIRP (dBW)</Typography>
              <TextField value={eirp_dbw} onChange={(e) => setEirp(e.target.value)} size="small" fullWidth sx={controlSx} />
            </Stack>

            <Stack spacing={0.75}>
              <Typography sx={LABEL_SX}>Transmit Polarization</Typography>
<FormControl fullWidth size="small">
  <Select
    multiple
    value={tx_polarization}
    onChange={(e) => setTxPol(e.target.value as string[])}
    renderValue={(selected) => (selected as string[]).join(", ")}
    sx={darkSelectSx}
    MenuProps={darkMenu}
  >
    {["RHCP", "LHCP", "Linear"].map((pol) => (
      <MenuItem key={pol} value={pol}>
        <Checkbox checked={tx_polarization.includes(pol)} />
        <ListItemText primary={pol} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
            </Stack>
            <Stack spacing={0.75}>
              <Typography sx={LABEL_SX}>Receive Polarization</Typography>
<FormControl fullWidth size="small">
  <Select
    multiple
    value={rx_polarization}
    onChange={(e) => setRxPol(e.target.value as string[])}
    renderValue={(selected) => (selected as string[]).join(", ")}
    sx={darkSelectSx}
    MenuProps={darkMenu}
  >
    {["RHCP", "LHCP", "Linear"].map((pol) => (
      <MenuItem key={pol} value={pol}>
        <Checkbox checked={rx_polarization.includes(pol)} />
        <ListItemText primary={pol} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
            </Stack>

            <Stack spacing={0.75}>
              <Typography sx={LABEL_SX}>Antenna Travel Range</Typography>
              <TextField value={travel_range} onChange={(e) => setTravel(e.target.value)} size="small" fullWidth sx={controlSx} />
            </Stack>
            <Stack spacing={0.75}>
              <Typography sx={LABEL_SX}>Tracking Velocity</Typography>
              <TextField value={tracking_velocity} onChange={(e) => setVel(e.target.value)} size="small" fullWidth sx={controlSx} />
            </Stack>

            <Stack spacing={0.75}>
              <Typography sx={LABEL_SX}>Tracking Acceleration</Typography>
              <TextField value={tracking_acceleration} onChange={(e) => setAcc(e.target.value)} size="small" fullWidth sx={controlSx} />
            </Stack>
            <Stack spacing={0.75} sx={{ gridColumn: { md: "span 2" } }}>
              <Typography sx={LABEL_SX}>Tracking Modes</Typography>
  <FormControl fullWidth size="small">
  <Select
    value={tracking_modes}
    onChange={(e) => setModes(e.target.value)}
    displayEmpty
    renderValue={(v) => v || "Select Tracking Mode"}
    sx={darkSelectSx}
    MenuProps={darkMenu}
  >
    <MenuItem disabled value="">
      Select Tracking Mode
    </MenuItem>

    {[
      "TLE",
      "Auto Track",
      "Program",
      "Step Track",
      "Others",
    ].map((mode) => (
      <MenuItem key={mode} value={mode}>
        {mode}
      </MenuItem>
    ))}
  </Select>
</FormControl>


            </Stack>
          </Box>

          {/* Bands */}
          <Box sx={{ mt: 2, p: 1.25, border: BORDER, borderRadius: 1 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Bands</Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "200px 1fr auto auto auto" },

                gap: 1,
                alignItems: "center",
              }}
            >
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select<string>
                  value={curBand}
                  onChange={(e: SelectChangeEvent<string>) => setCurBand(e.target.value as string)}
                  displayEmpty
                  renderValue={(v) => (v ? (v as string) : "Select Band")}
                  sx={darkSelectSx}
                  MenuProps={darkMenu}
                >
                  <MenuItem disabled value="">Select Band</MenuItem>
                  {BAND_OPTIONS.map((b) => (
                    <MenuItem key={b} value={b}>
                      <ListItemText primary={b} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
             <TextField
  value={curGT}
  onChange={(e) => setCurGT(e.target.value)}
  placeholder="Enter G/T"
  size="small"
  sx={controlSx}
/>

<FormControlLabel
  control={
    <Checkbox
      checked={isUplink}
      onChange={(e) => setIsUplink(e.target.checked)}
    />
  }
  label="Uplink"
/>

<FormControlLabel
  control={
    <Checkbox
      checked={isDownlink}
      onChange={(e) => setIsDownlink(e.target.checked)}
    />
  }
  label="Downlink"
/>

              <Button variant="contained" onClick={addBand} sx={{ textTransform: "none", height: 32, bgcolor: "#e03f3f", "&:hover": { bgcolor: "#cc3535" } }}>
                Add
              </Button>
            </Box>

            <Box sx={{ mt: 1 }}>
              {bands.map((b, i) => (
                <Box
                  key={`${b.band}-${i}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(4,1fr)" , md: "200px 1fr 1fr auto" },
                    gap: 1,
                    bgcolor: "#1d1d20",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 1,
                    p: 1,
                    mb: 1,
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ fontSize: 13 }}><b>Band:</b> {b.band}</Box>
                <Box sx={{ fontSize: 13 }}>
  <b>G/T:</b> {b.gt}
</Box>
<Box sx={{ fontSize: 13 }}>
  <b>Link:</b>{" "}
  {[b.uplink && "Uplink", b.downlink && "Downlink"]
    .filter(Boolean)
    .join("/")}
</Box>

                  <Button size="small" onClick={() => removeBand(i)} sx={{ color: "#ff9a9a", textTransform: "none" }}>
                    Remove
                  </Button>
                </Box>
              ))}
              {!bands.length && <Typography sx={{ color: "#9aa", fontSize: 13, mt: 0.5 }}>No bands added.</Typography>}
            </Box>
          </Box>

          {/* Receive G/T */}
          {/* <Box sx={{ mt: 2, p: 1.25, border: BORDER, borderRadius: 1 }}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>Receive G/T</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "200px 1fr auto" }, gap: 1, alignItems: "center" }}>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select<string>
                  value={gtBand}
                  onChange={(e: SelectChangeEvent<string>) => setGtBand(e.target.value as string)}
                  displayEmpty
                  renderValue={(v) => (v ? (v as string) : "Select Band")}
                  sx={darkSelectSx}
                  MenuProps={darkMenu}
                >
                  <MenuItem disabled value="">Select Band</MenuItem>
                  {BAND_OPTIONS.map((b) => (
                    <MenuItem key={b} value={b}>
                      <ListItemText primary={b} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField value={gtVal} onChange={(e) => setGtVal(e.target.value)} placeholder="G/T" size="small" sx={controlSx} />
              <Button variant="contained" onClick={addGT} sx={{ textTransform: "none", height: 32, bgcolor: "#e03f3f", "&:hover": { bgcolor: "#cc3535" } }}>
                Add
              </Button>
            </Box>

            <Box sx={{ mt: 1 }}>
              {gts.map((g, i) => (
                <Box
                  key={`${g.band}-${i}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(3,1fr)", md: "200px 1fr auto" },
                    gap: 1,
                    bgcolor: "#1d1d20",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 1,
                    p: 1,
                    mb: 1,
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ fontSize: 13 }}><b>Band:</b> {g.band}</Box>
                  <Box sx={{ fontSize: 13 }}><b>G/T:</b> {g.gt}</Box>
                  <Button size="small" onClick={() => removeGT(i)} sx={{ color: "#ff9a9a", textTransform: "none" }}>
                    Remove
                  </Button>
                </Box>
              ))}
              {!gts.length && <Typography sx={{ color: "#9aa", fontSize: 13, mt: 0.5 }}>No G/T rows added.</Typography>}
            </Box>
          </Box> */}
        </Box>
      </DialogContent>

<DialogActions
  sx={{
    px: 3,
    pb: 2.25,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  {onDelete && (
    <Button
      onClick={handleDelete}
      variant="contained"
      sx={{
        bgcolor: "#E24B4B",
        textTransform: "none",
        fontWeight: 500,
        px: 2.5,
        borderRadius: 1.5,
        "&:hover": { bgcolor: "#c63c3c" },
      }}
      disabled={!row || busy}
    >
      Delete
    </Button>
  )}


<Box sx={{ display: "flex", gap: 1 }}>
  <Button
    onClick={onClose}
    variant="text"
    sx={{ color: "rgba(255,255,255,0.9)", textTransform: "none", fontWeight: 700 }}
    disabled={busy}
  >
    Cancel
  </Button>

  <Button
    onClick={handleSave}
    type="submit"
    variant="contained"
    disabled={!canSave || busy}
    sx={{
      bgcolor: PRIMARY,
      textTransform: "none",
      fontWeight: 500,
      px: 3,
      borderRadius: 1.5,
      "&:hover": { bgcolor: "#6b46f1" },
      "&.Mui-disabled": { bgcolor: "#2f2f33", color: "#b5b7bd" },
    }}
  >
    Edit
  </Button>
</Box>

      </DialogActions>
    </Dialog>
  );
}
