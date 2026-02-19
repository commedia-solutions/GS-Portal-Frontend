


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
  Checkbox,
  ListItemText,
} from "@mui/material";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

export type GroundStation = {
  id: number;
  partner: string;
  station: string;
  addedBy?: string;

  // New fields:
  antennas?: string[];   // multi-select
  latitude?: string;
  longitude?: string;
};

export type UpdateGroundStationDialogProps = {
  open: boolean;
  row: GroundStation | null;
  antennaOptions: string[];             // options for multi-select
  onClose: () => void;
  onSave: (updated: GroundStation) => void;   // parent does the API call
  onDelete: (row: GroundStation) => void;     // parent does the API call
};

const BORDER = "1px solid rgba(255,255,255,0.14)";
const PRIMARY = "#7C57F2";

export default function UpdateGroundStationDialog({
  open,
  row,
  antennaOptions,
  onClose,
  onSave,
  onDelete,
}: UpdateGroundStationDialogProps) {
  const [partner, setPartner] = React.useState("");
  // const [station, setStation] = React.useState("");
  const [antennas, setAntennas] = React.useState<string[]>([]);
  // const [latitude, setLatitude] = React.useState("");
  // const [longitude, setLongitude] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setPartner(row?.partner ?? "");
    // setStation(row?.station ?? "");
    setAntennas(row?.antennas ?? []);
    // setLatitude(row?.latitude ?? "");
    // setLongitude(row?.longitude ?? "");
    setBusy(false);
  }, [row, open]);

const canSave = partner.trim().length > 0;


  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!row || !canSave) return;
    try {
      setBusy(true);
      onSave({
        ...row,
        partner: partner.trim(),
        // station: station.trim(),
        antennas: antennas,
        // latitude: latitude.trim(),
        // longitude: longitude.trim(),
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!row) return;
    if (!confirm("Delete this Ground Station?")) return;
    try {
      setBusy(true);
      onDelete(row);
    } finally {
      setBusy(false);
    }
  };

  const handleAntChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    setAntennas(typeof v === "string" ? v.split(",") : v);
  };

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="md"
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
        Update Ground Station
      </DialogTitle>

      <DialogContent>
        <Box component="form" onSubmit={handleSave}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
              mt: 0.5,
            }}
          >
            <Stack spacing={0.75}>
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                TTC Service Provider
              </Typography>
              <TextField
                autoFocus
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                size="small"
                fullWidth
                sx={darkFieldSx}
                placeholder="e.g., ISRO"
                disabled={busy}
              />
            </Stack>

            {/* <Stack spacing={0.75}>
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                Ground Station Name
              </Typography>
              <TextField
                value={station}
                onChange={(e) => setStation(e.target.value)}
                size="small"
                fullWidth
                sx={darkFieldSx}
                placeholder="e.g., BLR"
                disabled={busy}
              />
            </Stack> */}

            <Stack spacing={0.75}>
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                Antenna(s)
              </Typography>
              <FormControl fullWidth size="small">
                <Select<string[]>
                  multiple
                  value={antennas}
                  onChange={handleAntChange}
                  displayEmpty
                  renderValue={(selected) =>
                    (selected as string[]).length ? (selected as string[]).join(", ") : "Select Antenna"
                  }
                  sx={darkSelectSx}
                >
                  <MenuItem disabled value="">
                    Select Antenna
                  </MenuItem>
                  {antennaOptions.map((a) => (
                    <MenuItem key={a} value={a}>
                      <Checkbox checked={antennas.indexOf(a) > -1} sx={{ p: 0.5, mr: 1, color: "#bbb" }} />
                      <ListItemText primary={a} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* <Stack spacing={0.75}>
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                Latitude
              </Typography>
              <TextField
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                size="small"
                fullWidth
                sx={darkFieldSx}
                placeholder="e.g., 12.9716"
                disabled={busy}
              />
            </Stack>

            <Stack spacing={0.75}>
              <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>
                Longitude
              </Typography>
              <TextField
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                size="small"
                fullWidth
                sx={darkFieldSx}
                placeholder="e.g., 77.5946"
                disabled={busy}
              />
            </Stack> */}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.25 }}>
        <Box sx={{ mr: "auto" }}>
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
        </Box>

        <Button
          onClick={onClose}
          variant="text"
          sx={{ color: "rgba(255,255,255,0.9)", textTransform: "none", fontWeight: 700, mr: 0.5 }}
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
      </DialogActions>
    </Dialog>
  );
}

const darkFieldSx = {
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
