import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import { vars } from "../ui/toast/themeBridge";
import { AmbientLighting } from "../ui/styles";

/* ✅ theme tokens */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;
const RED = "#FF2E63";

export type SatPolRow = {
  id: number;
  sat: string;
  pols: string[];
};

type Props = {
  open: boolean;
  row: SatPolRow | null;
  satOptions?: string[];
  polOptions?: string[];
  onClose: () => void;
  onSave: (updated: SatPolRow) => void;
  onDelete: (toDelete: SatPolRow) => void;
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

export default function UpdateSatellitePolarizationDialog({
  open,
  row,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [sat, setSat] = React.useState("");
  const [polInput, setPolInput] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    setSat(row?.sat ?? "");
    setPolInput(row?.pols?.join(", ") ?? "");
  }, [row, open]);

  const parsedPols = React.useMemo(
    () =>
      polInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [polInput]
  );

  const handleSave = () => {
    if (!row) return;
    onSave({ id: row.id, sat: sat.trim(), pols: parsedPols });
  };

  const handleDelete = () => {
    if (!row) return;
    onDelete({ id: row.id, sat: sat.trim(), pols: parsedPols });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
        Update Satellite Polarization
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            mt: 1,
          }}
        >
          <Stack spacing={0.5}>
            <Typography sx={LABEL_SX}>Satellite Name *</Typography>
            <TextField
              placeholder="e.g., GS-02"
              value={sat}
              onChange={(e) => setSat(e.target.value)}
              fullWidth
              size="small"
              sx={glassCtrlSx}
            />
          </Stack>

          <Stack spacing={0.5}>
            <Typography sx={LABEL_SX}>Polarization *</Typography>
            <TextField
              placeholder="e.g., RHCP or RHCP, LHCP"
              value={polInput}
              onChange={(e) => setPolInput(e.target.value)}
              fullWidth
              size="small"
              sx={glassCtrlSx}
            />
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1, display: "flex", justifyContent: "space-between" }}>
        <Button
          onClick={handleDelete}
          variant="contained"
          sx={{ ...premiumBtnSx, background: RED, "&:hover": { background: "#d62654" } }}
        >
          Delete
        </Button>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            onClick={onClose}
            sx={{ color: DIM, textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!sat.trim() || parsedPols.length === 0}
            sx={premiumBtnSx}
          >
            Edit
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
