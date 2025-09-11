import * as React from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// use shared API client
import { api, BASE_URL, getAuthToken } from "../../api/http"; // ⬅️ path from /components/Models/*



// ⬇️ type-only import because verbatimModuleSyntax is on
import type { SelectChangeEvent } from "@mui/material/Select";

const CONTROL_BG = "#1C1C1E";

const PRIMARY_BTN_SX = {
  textTransform: "none",
  fontWeight: 700,
  px: 1.6,
  py: 0.8,
  borderRadius: 1,
  bgcolor: "#7C57F2",
  color: "#fff",
  "&:hover": { bgcolor: "#6b48ea" },
} as const;

const DANGER_BTN_SX = {
  textTransform: "none",
  fontWeight: 700,
  px: 1.6,
  py: 0.8,
  borderRadius: 1,
  bgcolor: "#E4585B",
  color: "#fff",
  "&:hover": { bgcolor: "#cf4548" },
} as const;

const OUTLINED_BTN_SX = {
  textTransform: "none",
  fontWeight: 700,
  px: 1.4,
  py: 0.6,
  borderRadius: 1,
  bgcolor: "transparent",
  color: "#fff",
  border: "1px solid #ffffff99",
  "&:hover": { bgcolor: "rgba(255,255,255,0.06)", borderColor: "#fff" },
} as const;

const compactCtrlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#544f4fff",
  },
  "& .MuiOutlinedInput-root": { color: "#fff", alignItems: "center" },
  "& .MuiInputBase-input": { padding: "10px 12px", fontSize: 13, color: "#fff" },
  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.9)" },
};

const DOC_TYPES = [
  "License report",
  "Satellite report",
  "Passes report",
  "Project plan",
  "Flow chart",
  "Design Document",
  "User manual",
  "Other",
] as const;

export type DocumentRow = {
  id: number;
  name: string;
  type: string;
  remarks: string;
};

type Props = {
  open: boolean;
  row: DocumentRow | null;
  onClose: () => void;
  onSuccess: () => Promise<void> | void; // refresh list
};


export default function UpdateDocumentModal({ open, row, onClose, onSuccess }: Props) {
  const DOCUMENTS_API = `/api/documents`;

  const [file, setFile] = React.useState<File | null>(null);
  const [docType, setDocType] = React.useState<string>(row?.type ?? "");
  const [remarks, setRemarks] = React.useState<string>(row?.remarks ?? "");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    setFile(null);
    setDocType(row?.type ?? "");
    setRemarks(row?.remarks ?? "");
  }, [row, open]);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null);
  const clearFile = () => {
    setFile(null);
    const el = document.getElementById("upd-doc-file") as HTMLInputElement | null;
    if (el) el.value = "";
  };

  const doUpdate = async () => {
  if (!row) return;
  setBusy(true);
  try {
    const form = new FormData();
    if (file) form.append("file", file);
    form.append("doc_type", docType || row.type || "");
    form.append("remarks", remarks ?? "");

    const token = getAuthToken();
    const res = await fetch(`${BASE_URL}${DOCUMENTS_API}/${row.id}`, {
      method: "PUT",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form, // let browser set Content-Type (boundary)
    });
    if (!res.ok) throw new Error(`Update failed (${res.status})`);

    await onSuccess();
    onClose();
  } catch (e: any) {
    alert(e.message || "Failed to update document");
  } finally {
    setBusy(false);
  }
};

const doDelete = async () => {
  if (!row) return;
  if (!confirm("Delete this document? This cannot be undone.")) return;
  setBusy(true);
  try {
    await api.del(`${DOCUMENTS_API}/${row.id}`);
    await onSuccess();
    onClose();
  } catch (e: any) {
    alert(e.message || "Failed to delete document");
  } finally {
    setBusy(false);
  }
};

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#121214",
          color: "#E8E8EA",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, fontSize: 22, pb: 0.5 }}>Update Document</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          {/* Document (file selector) */}
          <Box>
            <Typography sx={{ mb: 0.75, fontSize: 13, color: "#ccc" }}>Document</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <input id="upd-doc-file" type="file" style={{ display: "none" }} onChange={handleFilePick} />
              <label htmlFor="upd-doc-file">
                <Button component="span" startIcon={<CloudUploadIcon />} sx={OUTLINED_BTN_SX}>
                  Select File
                </Button>
              </label>
              {(file || row) && (
                <Chip
                  variant="outlined"
                  onDelete={file ? clearFile : undefined}
                  deleteIcon={<CloseRoundedIcon sx={{ color: "#bbb" }} />}
                  label={file?.name || row?.name || ""}
                  sx={{
                    borderColor: "rgba(255,255,255,0.22)",
                    color: "#E8E8EA",
                    bgcolor: "transparent",
                    maxWidth: 220,
                    "& .MuiChip-label": { maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" },
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Doc Type */}
          <Box>
            <Typography sx={{ mb: 0.75, fontSize: 13, color: "#ccc" }}>Doc Type</Typography>
            <FormControl size="small" fullWidth sx={compactCtrlSx}>
              <Select
                value={docType}
                onChange={(e: SelectChangeEvent) => setDocType(String(e.target.value))}
                displayEmpty
                renderValue={(v) => (v ? String(v) : "Select Type")}
              >
                <MenuItem value="">Select Type</MenuItem>
                {DOC_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Remarks */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ mb: 0.75, fontSize: 13, color: "#ccc" }}>Remarks</Typography>
          <TextField
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            fullWidth
            placeholder="Remarks"
            size="small"
            sx={compactCtrlSx}
          />
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.12)", my: 2 }} />

        {/* Footer actions: left Delete, right Cancel + Update */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 1 }}>
          <Box>
            <Button onClick={doDelete} disabled={busy} sx={DANGER_BTN_SX}>
              Delete
            </Button>
          </Box>
          <Button onClick={onClose} disabled={busy} sx={OUTLINED_BTN_SX}>
            Cancel
          </Button>
          <Button onClick={doUpdate} disabled={busy || !docType} sx={PRIMARY_BTN_SX}>
            Update
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
