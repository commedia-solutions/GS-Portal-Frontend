import * as React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";

export type SatPolRow = {
  id: number;
  sat: string;
  pols: string[]; // comma-separated in UI, array in state/props
};

type Props = {
  open: boolean;
  row: SatPolRow | null;
  // Keep these props for compatibility with parent, but they’re unused now
  satOptions?: string[];
  polOptions?: string[];
  onClose: () => void;
  onSave: (updated: SatPolRow) => void;
  onDelete: (toDelete: SatPolRow) => void;
};

const PRIMARY = "#7C57F2";
const BORDER = "1px solid rgba(255,255,255,0.14)";

/** Consistent dark text field styling */


const fieldSx = {
  "& .MuiInputBase-root": {
    backgroundColor: "#1C1C1E",
    color: "#fff",
    borderRadius: 1,                      // <— smaller corners (consistent)
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.14)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.24)" },
  "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.95)" },
  "& .MuiInputBase-input": { color: "#fff" },
};


export default function UpdateSatellitePolarizationDialog({
  open,
  row,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [sat, setSat] = React.useState(row?.sat ?? "");
  const [polInput, setPolInput] = React.useState(row?.pols?.join(", ") ?? "");

  // keep local state in sync when a different row is opened
  React.useEffect(() => {
    setSat(row?.sat ?? "");
    setPolInput(row?.pols?.join(", ") ?? "");
  }, [row]);

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
      PaperProps={{ sx: { bgcolor: "#17171A", color: "#fff", border: BORDER } }}
    >
      <DialogTitle sx={{ fontWeight: 500, fontSize: 20, pb: 1.25 }}>
        Update Satellite Polarization
      </DialogTitle>

      <DialogContent sx={{ pt: 2.25, pb: 1.25 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1.5,
          }}
        >
         

          <TextField
  label="Satellite Name *"
  placeholder="e.g., GS-02"
  value={sat}
  onChange={(e) => setSat(e.target.value)}
  fullWidth
  variant="outlined"
  size="small"
  margin="normal"
  InputLabelProps={{ shrink: true }}      // keeps label clear of the outline
  sx={fieldSx}
/>

<TextField
  label="Polarization *"
  placeholder="e.g., RHCP or RHCP, LHCP"
  value={polInput}
  onChange={(e) => setPolInput(e.target.value)}
  fullWidth
  variant="outlined"
  size="small"
  margin="normal"
  InputLabelProps={{ shrink: true }}
  sx={fieldSx}
/>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 500, borderRadius: 2, px: 2.5, mr: "auto" }}
        >
          Delete
        </Button>

        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            border: "1px solid rgba(255,255,255,0.24)",
            color: "#fff",
            borderRadius: 2,
            px: 2.5,
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: PRIMARY,
            textTransform: "none",
            fontWeight: 500,
            borderRadius: 2,
            px: 3,
            "&:hover": { backgroundColor: "#6E4DE0" },
          }}
          disabled={!sat.trim() || parsedPols.length === 0}
        >
          Edit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
