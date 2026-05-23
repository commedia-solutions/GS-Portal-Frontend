


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
import { vars } from "../ui/toast/themeBridge";
import { AmbientLighting } from "../ui/styles";

/* ✅ theme tokens */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;
const RED = "#FF2E63";

export type GroundStation = {
  id: number;
  partner: string;
  station: string;
  addedBy?: string;
  antennas?: string[];
};

export type UpdateGroundStationDialogProps = {
  open: boolean;
  row: GroundStation | null;
  antennaOptions: string[];
  onClose: () => void;
  onSave: (updated: GroundStation) => void;
  onDelete: (row: GroundStation) => void;
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

export default function UpdateGroundStationDialog({
  open,
  row,
  antennaOptions,
  onClose,
  onSave,
  onDelete,
}: UpdateGroundStationDialogProps) {
  const [partner, setPartner] = React.useState("");
  const [antennas, setAntennas] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setPartner(row?.partner ?? "");
    setAntennas(row?.antennas ?? []);
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
        antennas: antennas,
        station: row.station, // preserve
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
        Update Ground Station
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box component="form" onSubmit={handleSave} sx={{ display: "grid", gap: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>TTC Service Provider *</Typography>
              <TextField
                autoFocus
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                size="small"
                fullWidth
                sx={glassCtrlSx}
                placeholder="e.g., ISRO"
                disabled={busy}
              />
            </Stack>

            <Stack spacing={0.5}>
              <Typography sx={LABEL_SX}>Antenna(s)</Typography>
              <FormControl fullWidth size="small">
                <Select<string[]>
                  multiple
                  value={antennas}
                  onChange={handleAntChange}
                  displayEmpty
                  renderValue={(selected) =>
                    (selected as string[]).length ? (selected as string[]).join(", ") : "Select Antenna"
                  }
                  sx={glassCtrlSx}
                  MenuProps={{ PaperProps: { sx: { bgcolor: vars.bgCtrl, color: TEXT, border: `1px solid ${vars.borderWeak}` } } }}
                >
                  {antennaOptions.map((a) => (
                    <MenuItem key={a} value={a}>
                      <Checkbox checked={antennas.indexOf(a) > -1} size="small" />
                      <ListItemText primary={a} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={handleDelete}
          variant="contained"
          sx={{ ...premiumBtnSx, background: RED, "&:hover": { background: "#d62654" } }}
          disabled={!row || busy}
        >
          Delete
        </Button>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={onClose}
            sx={{ color: DIM, textTransform: "none", fontWeight: 700 }}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            type="submit"
            variant="contained"
            disabled={!canSave || busy}
            sx={premiumBtnSx}
          >
            Edit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
