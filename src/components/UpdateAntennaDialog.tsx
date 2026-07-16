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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { vars } from "../ui/toast/themeBridge";
import { AmbientLighting } from "../ui/styles";

/* ✅ theme tokens */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;
const RED = "#FF2E63";

export type AntBand = {
  band: string;
  gt: string;
  uplink: boolean;
  downlink: boolean;
};

export type AntennaDialogRow = {
  id: number;
  type: string;
  location: string;
  size_m: string;
  eirp_dbw: string;
  tx_polarization: string[];
  rx_polarization: string[];
  travel_range: string;
  tracking_velocity: string;
  tracking_acceleration: string;
  tracking_modes: string;
  bands: AntBand[];
};

type Props = {
  open: boolean;
  row: AntennaDialogRow | null;
  onClose: () => void;
  onSave: (updated: AntennaDialogRow) => void;
  onDelete?: (row: AntennaDialogRow) => void;
};

const glassCtrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "36px", fontSize: 13, color: TEXT,
    backgroundColor: vars.bgCtrl, borderRadius: "12px",
    backdropFilter: "blur(10px)",
    "& fieldset": { borderColor: vars.borderWeak },
    "&:hover fieldset": { borderColor: vars.accent },
    "&.Mui-focused fieldset": { border: `1px solid ${vars.accent}` },
  },
  "& .MuiInputBase-input": { padding: "0 14px", fontSize: 13, color: TEXT },
  "& .MuiInputBase-input::placeholder": { color: DIM, opacity: 0.7 },
  "& .MuiSelect-select": { padding: "0 14px !important", display: "flex", alignItems: "center", fontSize: 13, color: TEXT, height: "36px !important" },
  "& .MuiSvgIcon-root": { fontSize: 18, color: DIM }
} as const;

const LABEL_SX = {
  fontSize: 10.5,
  fontWeight: 900,
  color: ACCENT,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  mb: 0.8,
} as const;

const premiumBtnSx = {
  textTransform: "none", fontWeight: 800, fontSize: 12.5, px: 3, height: 40,
  borderRadius: "12px", background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`,
  boxShadow: `0 8px 20px rgba(14, 165, 233, 0.25)`,
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  color: "#fff",
  "&:hover": {
    background: `linear-gradient(135deg, #0ea5e9, #075985)`,
    transform: "translateY(-1px)",
    boxShadow: `0 10px 25px rgba(14, 165, 233, 0.35)`,
  },
  "&.Mui-disabled": { opacity: 0.5, color: "rgba(255,255,255,0.3)" }
} as const;

const BAND_OPTIONS = [
  "UHF (300 MHz – 3 GHz)", "VHF (30 MHz – 300 MHz)", "L (1-2 GHz)",
  "S (2.0 – 2.3 GHz)", "C (4 – 8 GHz)", "X (8 – 12 GHz)",
  "Ku (12-18 GHz)", "Ka (26.5 to 40 GHz)"
];

const POL_OPTIONS = ["RHCP", "LHCP", "Linear"];

export default function UpdateAntennaDialog({
  open,
  row,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [busy, setBusy] = React.useState(false);

  const [type, setType] = React.useState("");
  const [size_m, setSize] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [eirp_dbw, setEirp] = React.useState("");
  const [tx_polarization, setTxPol] = React.useState<string[]>([]);
  const [rx_polarization, setRxPol] = React.useState<string[]>([]);
  const [travel_range, setTravel] = React.useState("");
  const [tracking_velocity, setVel] = React.useState("");
  const [tracking_acceleration, setAcc] = React.useState("");
  const [tracking_modes, setModes] = React.useState("");
  const [bands, setBands] = React.useState<AntBand[]>([]);

  const [curBand, setCurBand] = React.useState("");
  const [curGT, setCurGT] = React.useState("");
  const [isUplink, setIsUplink] = React.useState(false);
  const [isDownlink, setIsDownlink] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setBusy(false);
    setType(row?.type ?? "");
    setLocation(row?.location ?? "");
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
      { band: curBand, gt: curGT, uplink: isUplink, downlink: isDownlink },
    ]);
    setCurGT("");
    setIsUplink(false);
    setIsDownlink(false);
  };

  const removeBand = (idx: number) => setBands((b) => b.filter((_, i) => i !== idx));

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
          bgcolor: vars.bgCard,
          border: `1px solid ${vars.border}`,
          borderRadius: "20px",
          color: TEXT,
          backgroundImage: "none",
          boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
          overflow: "hidden"
        },
      }}
    >
      <AmbientLighting />
      <DialogTitle sx={{ fontWeight: 900, fontSize: 18, color: TEXT, textTransform: "uppercase", letterSpacing: "0.05em", px: 3, pt: 3, pb: 1 }}>
        Update Antenna
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box component="form" onSubmit={handleSave} sx={{ display: "grid", gap: 3 }}>
          {/* core fields */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" }, gap: 3 }}>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Antenna Name <span style={{ color: RED }}>*</span></Typography>
              <TextField value={type} onChange={(e) => setType(e.target.value)} size="small" fullWidth sx={glassCtrlSx} />
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Location <span style={{ color: RED }}>*</span></Typography>
              <TextField value={location} onChange={(e) => setLocation(e.target.value)} size="small" fullWidth sx={glassCtrlSx} />
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Antenna Size (m) <span style={{ color: RED }}>*</span></Typography>
              <TextField value={size_m} onChange={(e) => setSize(e.target.value)} size="small" fullWidth sx={glassCtrlSx} />
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>EIRP (dBW) <span style={{ color: RED }}>*</span></Typography>
              <TextField value={eirp_dbw} onChange={(e) => setEirp(e.target.value)} size="small" fullWidth sx={glassCtrlSx} />
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Transmit Polarization <span style={{ color: RED }}>*</span></Typography>
              <FormControl fullWidth size="small">
                <Select
                  multiple
                  value={tx_polarization}
                  onChange={(e) => setTxPol(e.target.value as string[])}
                  displayEmpty
                  renderValue={(s) => (s as string[]).length ? (s as string[]).join(", ") : "Select Transmit Polarization"}
                  sx={glassCtrlSx}
                  MenuProps={{ PaperProps: { sx: { bgcolor: vars.bgCtrl, color: TEXT, border: `1px solid ${vars.borderWeak}` } } }}
                >
                  {POL_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p}>
                      <Checkbox checked={tx_polarization.includes(p)} size="small" />
                      <ListItemText primary={p} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Receive Polarization <span style={{ color: RED }}>*</span></Typography>
              <FormControl fullWidth size="small">
                <Select
                  multiple
                  value={rx_polarization}
                  onChange={(e) => setRxPol(e.target.value as string[])}
                  displayEmpty
                  renderValue={(s) => (s as string[]).length ? (s as string[]).join(", ") : "Select Receive Polarization"}
                  sx={glassCtrlSx}
                  MenuProps={{ PaperProps: { sx: { bgcolor: vars.bgCtrl, color: TEXT, border: `1px solid ${vars.borderWeak}` } } }}
                >
                  {POL_OPTIONS.map((p) => (
                    <MenuItem key={p} value={p}>
                      <Checkbox checked={rx_polarization.includes(p)} size="small" />
                      <ListItemText primary={p} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Antenna Travel Range</Typography>
              <TextField value={travel_range} onChange={(e) => setTravel(e.target.value)} size="small" fullWidth sx={glassCtrlSx} placeholder="e.g. 4° to 434° Az, 3° to 46° El" />
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Tracking Velocity (°/s)</Typography>
              <TextField value={tracking_velocity} onChange={(e) => setVel(e.target.value)} size="small" fullWidth sx={glassCtrlSx} />
            </Stack>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Tracking Acceleration (°/s²)</Typography>
              <TextField value={tracking_acceleration} onChange={(e) => setAcc(e.target.value)} size="small" fullWidth sx={glassCtrlSx} />
            </Stack>
            <Stack spacing={0.5} sx={{ gridColumn: { md: "span 3" } }}>
              <Typography sx={LABEL_SX}>Tracking Modes <span style={{ color: RED }}>*</span></Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={tracking_modes}
                  onChange={(e) => setModes(e.target.value)}
                  displayEmpty
                  renderValue={(v) => v || "Select Tracking Mode"}
                  sx={glassCtrlSx}
                  MenuProps={{ PaperProps: { sx: { bgcolor: vars.bgCtrl, color: TEXT, border: `1px solid ${vars.borderWeak}` } } }}
                >
                  {["TLE", "Auto Track", "Program", "Step Track", "Others"].map((m) => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Box>

          {/* Bands */}
          <Box sx={{ mt: 1, p: 2, borderRadius: "16px", border: `1px solid ${vars.borderWeak}`, background: "rgba(255,255,255,0.01)" }}>
            <Typography sx={{ ...LABEL_SX, mb: 2 }}>Bands/Carriers <span style={{ color: RED }}>*</span></Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.5fr 1fr auto auto auto" }, gap: 2, alignItems: "center", mb: 2 }}>
              <FormControl fullWidth size="small">
                <Select value={curBand} onChange={(e) => setCurBand(e.target.value)} displayEmpty renderValue={(v) => v ? v : "Select Band"} sx={glassCtrlSx}>
                  {BAND_OPTIONS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField value={curGT} onChange={(e) => setCurGT(e.target.value)} placeholder="G/T (dB/K)" size="small" sx={glassCtrlSx} />
              <FormControlLabel control={<Checkbox checked={isUplink} onChange={(e) => setIsUplink(e.target.checked)} size="small" />} label={<Typography sx={{ fontSize: 12, fontWeight: 700 }}>Uplink</Typography>} />
              <FormControlLabel control={<Checkbox checked={isDownlink} onChange={(e) => setIsDownlink(e.target.checked)} size="small" />} label={<Typography sx={{ fontSize: 12, fontWeight: 700 }}>Downlink</Typography>} />
              <Button onClick={addBand} variant="contained" sx={{ ...premiumBtnSx, height: 32, background: RED, "&:hover": { background: "#d62654" }, boxShadow: "none" }}>Add</Button>
            </Box>

            <Stack spacing={1}>
              {bands.map((b, i) => (
                <Box key={i} sx={{ px: 2, py: 1, bgcolor: "rgba(255,255,255,0.02)", border: `1px solid ${vars.borderWeak}`, borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{b.band}</Typography>
                  <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
                    <Typography sx={{ fontSize: 11, color: DIM }}>G/T: <b>{b.gt}</b></Typography>
                    <Typography sx={{ fontSize: 11, color: DIM }}>Link: <b>{[b.uplink && "Uplink", b.downlink && "Downlink"].filter(Boolean).join("/")}</b></Typography>
                    <Button size="small" onClick={() => removeBand(i)} sx={{ color: RED, textTransform: "none", fontSize: 11, fontWeight: 700 }}>Remove</Button>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, display: "flex", justifyContent: "space-between" }}>
        {onDelete && (
          <Button onClick={handleDelete} variant="contained" sx={{ ...premiumBtnSx, background: RED, "&:hover": { background: "#d62654" } }}>
            Delete
          </Button>
        )}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button onClick={onClose} sx={{ color: DIM, textTransform: "none", fontWeight: 700 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={!canSave || busy} sx={premiumBtnSx}>
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
