import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const BG = "#1C1C1E";
const BORDER = "1px solid rgba(255,255,255,0.14)";
const ACCENT = "#7C57F2";

export type ReportIssuePayload = {
  name: string;
  email: string;
  title: string;
  priority: "Low" | "Moderate" | "High";
  module:
    | "Dashboard"
    | "License List"
    | "Documents"
    | "Messages"
    | "Add Passes"
    | "Add Satellites"
    | "Add License"
    | "Satellite List"
    | "User Profile"
    | "User Management";
  description: string;
  files: File[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: ReportIssuePayload) => void;
};

const MODULES: ReportIssuePayload["module"][] = [
  "Dashboard",
  "Add Passes",
  "Add Satellites",
  "Add License",
  "Satellite List",
  "License List",
  "Documents",
  "Messages",
  "User Profile",
  "User Management",
];

/** Dark dropdown menu: white items, proper hover/selected */
const darkMenuProps = {
  PaperProps: {
    sx: {
      bgcolor: BG,
      color: "#fff",
      border: BORDER,
      "& .MuiMenuItem-root": { fontSize: 14 },
      "& .MuiMenuItem-root.Mui-selected": {
        bgcolor: "rgba(255,255,255,0.10)",
      },
      "& .MuiMenuItem-root:hover": {
        bgcolor: "rgba(255,255,255,0.06)",
      },
    },
  },
};

export default function ReportIssueDialog({ open, onClose, onSubmit }: Props) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [priority, setPriority] =
    React.useState<ReportIssuePayload["priority"]>("Moderate");
  const [module, setModule] =
    React.useState<ReportIssuePayload["module"]>("Dashboard");
  const [description, setDescription] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);

  const selectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    setFiles(list);
  };

  const handleSend = () => {
    const payload: ReportIssuePayload = {
      name,
      email,
      title,
      priority,
      module,
      description,
      files,
    };
    onSubmit?.(payload);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#17171A",
          border: BORDER,
          color: "#fff",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 22 }}>
        Report an Issue / Bug
      </DialogTitle>

      <DialogContent>
        <Stack spacing={1.25}>
          {/* Row: Name / Email */}
          <Stack direction="row" spacing={1.25}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
            />
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx1} // normal white text; no prefill
            />
          </Stack>

          {/* Issue title / Priority (with visible labels) */}
          <Stack direction="row" spacing={1.25}>
            <TextField
              label="Issue Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
              sx={fieldSx}
            />
            <TextField
              label="Priority"
              select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as ReportIssuePayload["priority"])
              }
              fullWidth
              size="small"
              sx={fieldSx}
              SelectProps={{ MenuProps: darkMenuProps }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Moderate">Moderate</MenuItem>
              <MenuItem value="High">High</MenuItem>
            </TextField>
          </Stack>

          {/* Affected module (with label) */}
          <TextField
            label="Affected Module"
            select
            value={module}
            onChange={(e) =>
              setModule(e.target.value as ReportIssuePayload["module"])
            }
            fullWidth
            size="small"
            sx={fieldSx}
            SelectProps={{ MenuProps: darkMenuProps }}
          >
            {MODULES.map((m) => (
              <MenuItem key={m} value={m}>
                {m}
              </MenuItem>
            ))}
          </TextField>

          {/* Description */}
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={6}
            fullWidth
            sx={fieldSx}
          />

          {/* File picker */}
          <Box>
            <Button
              variant="outlined"
              component="label"
              sx={{
                textTransform: "none",
                borderColor: "rgba(255,255,255,0.24)",
                color: "#7CA7FF",
                fontWeight: 500,
                borderRadius: 1,
              }}
            >
              SELECT FILES
              <input type="file" hidden multiple onChange={selectFiles} />
            </Button>

            {files.length > 0 && (
              <Typography
                sx={{ mt: 0.75, fontSize: 12.5, color: "rgba(255,255,255,0.8)" }}
              >
                {files.map((f) => f.name).join(", ")}
              </Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="text"
          sx={{
            color: "rgba(255,255,255,0.85)",
            fontWeight: 500,
            textTransform: "none",
            mr: 1,
          }}
        >
          CANCEL
        </Button>
        <Button
          onClick={handleSend}
          variant="contained"
          sx={{
            backgroundColor: ACCENT,
            textTransform: "none",
            fontWeight: 500,
            px: 3,
            "&:hover": { backgroundColor: "#6E4DE0" },
          }}
        >
          SEND
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------- shared input styles ---------- */
const fieldSx = {
  "& .MuiInputBase-root": {
    backgroundColor: BG,
    borderRadius: 1,
    color: "#fff",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.14)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.24)",
  },
  "& .MuiFormLabel-root": {
    color: "rgba(255,255,255,0.6)",
  },
  "& .MuiInputBase-input": { fontSize: 14 },
};


const fieldSx1 = {
  "& .MuiInputBase-root": {
    backgroundColor: BG,
    borderRadius: 1,
    color: "#fff",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.14)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "rgba(255,255,255,0.24)",
  },

  // ✅ FIX for cut-off label
  "& .MuiFormLabel-root": {
    color: "rgba(255,255,255,0.6)",
    transform: "translate(14px, 12px) scale(1)", // push label slightly lower
  },
  "& .MuiInputLabel-shrink": {
    transform: "translate(14px, -3px) scale(0.75)", // correct position when floating
  },

  "& .MuiInputBase-input": { fontSize: 14, pt: 1 }, // small top padding inside
};
