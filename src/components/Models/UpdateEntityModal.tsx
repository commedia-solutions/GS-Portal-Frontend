// src/components/Models/UpdateEntityModal.tsx
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

import { updateEntity, deleteEntity } from "../../api/iam";
import { useToast } from "../../ui/toast/ToastProvider";
import {
  AmbientLighting,
  PREMIUM_ACTION_BUTTON_SX,
  PREMIUM_DANGER_BUTTON_SX,
  PREMIUM_DIALOG_ACTIONS_SX,
  PREMIUM_DIALOG_CONTENT_SX,
  PREMIUM_DIALOG_PAPER_SX,
  PREMIUM_DIALOG_TITLE_SX,
  PREMIUM_FORM_CONTROL_SX,
  PREMIUM_FORM_LABEL_SX,
} from "../../ui/styles";

/* ---------- theme constants ---------- */
const BG_DARK = "#151517";
const BG_LIGHT = "#ffffff";
const TXT_DARK = "#EDEDED";
const TXT_LIGHT = "#000000";
const CTRL_BG_DARK = "#1C1C1E";
const CTRL_BG_LIGHT = "#ffffff";
const BORDER_DARK = "1px solid rgba(255,255,255,0.14)";
const BORDER_LIGHT = "1px solid rgba(0,0,0,0.12)";
const UI = { ctrlH: 30, font: 13 } as const;

/* inputs theme-aware */
const compactCtrlSx = (t: Theme) => ({
  ...PREMIUM_FORM_CONTROL_SX,
  bgcolor: t.palette.mode === "dark" ? CTRL_BG_DARK : CTRL_BG_LIGHT,
  borderRadius: 1,
  color: t.palette.mode === "dark" ? "#fff" : "#000",
  "& .MuiOutlinedInput-root": {
    height: `${UI.ctrlH}px`,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: t.palette.mode === "dark"
      ? "#454444ff"
      : "rgba(0,0,0,0.23)",
  },
  "& .MuiInputBase-input": {
    padding: "0 10px",
    fontSize: UI.font,
  },
});

/* ---------- types ---------- */
export type EntityUpdateIn = {
  id: string | number;
  name: string;
  description?: string;
};

export default function UpdateEntityModal({
  open,
  row,
  onClose,
  onUpdated,
  onDeleted,
}: {
  open: boolean;
  row: EntityUpdateIn | null;
  onClose: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}) {
  const toast = useToast();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    if (!open || !row) return;
    setName(row.name ?? "");
    setDescription(row.description ?? "");
    setErr("");
    setBusy(false);
  }, [open, row]);

  const canUpdate = !!name.trim() && !!description.trim();

  async function handleUpdate() {
    if (!row || busy || !canUpdate) return;
    setBusy(true);
    setErr("");
    try {
      await updateEntity(String(row.id), {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success("Entity updated");
      onUpdated?.();
      onClose();
    } catch (e: any) {
      const msg = e?.message || "Failed to update entity";
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!row || busy) return;
    const ok = window.confirm(
      `Delete entity "${row.name}"? This cannot be undone.`
    );
    if (!ok) return;

    setBusy(true);
    setErr("");
    try {
      await deleteEntity(String(row.id));
      toast.success("Entity deleted");
      onDeleted?.();
      onClose();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        "Failed to delete entity";
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!row) return null;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: (t: Theme) => ({
          ...PREMIUM_DIALOG_PAPER_SX,
          bgcolor: t.palette.mode === "dark" ? BG_DARK : BG_LIGHT,
          color: t.palette.mode === "dark" ? TXT_DARK : TXT_LIGHT,
          border: t.palette.mode === "dark" ? BORDER_DARK : BORDER_LIGHT,
          borderRadius: 2,
        }),
      }}
    >
      <AmbientLighting />
      <DialogTitle sx={{ ...PREMIUM_DIALOG_TITLE_SX }}>
        Update Entity
      </DialogTitle>

      <DialogContent dividers sx={{ ...PREMIUM_DIALOG_CONTENT_SX }}>
        <Box sx={{ display: "grid", gap: 1.25 }}>
          <Box>
            <Typography sx={PREMIUM_FORM_LABEL_SX}>
              Entity Name
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={(t) => compactCtrlSx(t)}
              disabled={busy}
            />
          </Box>

          <Box>
            <Typography sx={PREMIUM_FORM_LABEL_SX}>
              Description
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={(t) => compactCtrlSx(t)}
              disabled={busy}
            />
          </Box>

          {err && (
            <Typography sx={{ color: "#ff8383", fontSize: 12 }}>
              {err}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ ...PREMIUM_DIALOG_ACTIONS_SX }}>
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          disabled={busy}
          sx={PREMIUM_DANGER_BUTTON_SX}
        >
          Delete
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          disabled={!canUpdate || busy}
          sx={PREMIUM_ACTION_BUTTON_SX}
        >
          {busy ? "Saving…" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
