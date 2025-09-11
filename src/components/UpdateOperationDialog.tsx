// import * as React from "react";
// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   TextField,
//   Typography,
// } from "@mui/material";

// export type OperationRow = {
//   id: number;
//   name: string;
//   addedBy: string;
// };

// const PRIMARY = "#7C57F2";
// const BORDER = "1px solid rgba(255,255,255,0.14)";

// const fieldSx = {
//   "& .MuiInputBase-root": {
//     backgroundColor: "#1C1C1E",
//     color: "#fff",
//     borderRadius: 2,
//     height: 44,
//   },
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.14)" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.24)" },
//   "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.85)" },
//   "& .MuiInputBase-input": { color: "#fff" },
// };

// type Props = {
//   open: boolean;
//   row: OperationRow | null;
//   onClose: () => void;
//   onSave: (updated: OperationRow) => void;
//   onDelete: (toDelete: OperationRow) => void;
// };

// export default function UpdateOperationDialog({
//   open,
//   row,
//   onClose,
//   onSave,
//   onDelete,
// }: Props) {
//   const [name, setName] = React.useState(row?.name ?? "");
//   const [addedBy, setAddedBy] = React.useState(row?.addedBy ?? "");

//   React.useEffect(() => {
//     setName(row?.name ?? "");
//     setAddedBy(row?.addedBy ?? "");
//   }, [row]);

//   const handleSave = () => row && onSave({ id: row.id, name, addedBy });
//   const handleDelete = () => row && onDelete({ id: row.id, name, addedBy });

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="sm"
//       PaperProps={{ sx: { bgcolor: "#17171A", color: "#fff", border: BORDER } }}
//     >
//       <DialogTitle sx={{ fontWeight: 500, fontSize: 22, pb: 1.5 }}>
//         Update Operation
//       </DialogTitle>

//       <DialogContent sx={{ pt: 1.5 }}>
//         <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
//           <TextField
//             label="Operation *"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             sx={fieldSx}
//             margin="normal"
//             fullWidth
//             InputLabelProps={{ shrink: true }}
//           />
         

//           <TextField
//   label="Added By"
//   value={addedBy}
//   sx={fieldSx}
//   margin="normal"
//   fullWidth
//   InputLabelProps={{ shrink: true }}
//   InputProps={{ readOnly: true }}
// />

//         </Box>

//         <Typography sx={{ mt: 1, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
//           Make edits and click Update to save.
//         </Typography>
//       </DialogContent>

//       <DialogActions sx={{ px: 3, pb: 2.25, pt: 1 }}>
//         <Button
//           onClick={handleDelete}
//           color="error"
//           variant="contained"
//           sx={{ textTransform: "none", fontWeight: 500, borderRadius: 2, px: 2.5, mr: "auto" }}
//         >
//           Delete
//         </Button>

//         <Button
//           onClick={onClose}
//           variant="outlined"
//           sx={{
//             textTransform: "none",
//             border: "1px solid rgba(255,255,255,0.24)",
//             color: "#fff",
//             borderRadius: 2,
//             px: 2.5,
//           }}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSave}
//           variant="contained"
//           sx={{
//             backgroundColor: PRIMARY,
//             textTransform: "none",
//             fontWeight: 500,
//             borderRadius: 2,
//             px: 3,
//             "&:hover": { backgroundColor: "#6E4DE0" },
//           }}
//           disabled={!name.trim()}
//         >
//           Update
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }

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
} from "@mui/material";

export type OperationRow = {
  id: number;
  name: string;
  addedBy: string;
};

const PRIMARY = "#7C57F2";
const BORDER = "1px solid rgba(255,255,255,0.14)";

const fieldSx = {
  "& .MuiInputBase-root": {
    backgroundColor: "#1C1C1E",
    color: "#fff",
    borderRadius: 2,         // keep modal-wide rounding consistent
    height: 44,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.14)" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.24)" },
  "& .MuiFormLabel-root": { color: "rgba(255,255,255,0.85)" },
  "& .MuiInputBase-input": { color: "#fff" },
} as const;

type Props = {
  open: boolean;
  row: OperationRow | null;
  onClose: () => void;
  onSave: (updated: OperationRow) => void;   // parent will do PUT
  onDelete: (toDelete: OperationRow) => void; // parent will do DELETE
};

export default function UpdateOperationDialog({
  open,
  row,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [name, setName] = React.useState(row?.name ?? "");
  const [addedBy, setAddedBy] = React.useState(row?.addedBy ?? "");

  React.useEffect(() => {
    setName(row?.name ?? "");
    setAddedBy(row?.addedBy ?? "");
  // }, [row]);
   }, [row, open]);

  const handleSave = () => row && onSave({ id: row.id, name, addedBy });
  const handleDelete = () => row && onDelete({ id: row.id, name, addedBy });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { bgcolor: "#17171A", color: "#fff", border: BORDER } }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: 22, pb: 1.25 }}>
        Update Operation
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5 }}>
        <Box sx={{ mt:2,display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5 }}>
          <TextField
            label="Operation *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            sx={fieldSx}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Added By"
            value={addedBy}
            sx={fieldSx}
            fullWidth
            InputLabelProps={{ shrink: true }}
            InputProps={{ readOnly: true }}
          />
        </Box>

        <Typography sx={{ mt: 1, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
          Make edits and click Update to save.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 1 }}>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2, px: 2.5, mr: "auto" }}
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
            fontWeight: 600,
            borderRadius: 2,
            px: 3,
            "&:hover": { backgroundColor: "#6E4DE0" },
          }}
          disabled={!name.trim()}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
