import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
} from "@mui/material";
import React from "react";
import { APP_PAGES } from "../../config/pageRegistry";

export default function RoleAccessDialog({
  open,
  roleName,
  viewerPages,
  editorPages,
  isDisabled,
  onClose,
  onSave,
  onDisable,
}: {
  open: boolean;
  roleName: string;
  viewerPages: string[];
  editorPages: string[];
  isDisabled: boolean;
  onClose: () => void;
  onSave: (payload: { viewerPages: string[]; editorPages: string[] }) => void;
  onDisable: () => void;
}) {
  const [viewer, setViewer] = React.useState<string[]>([]);
  const [editor, setEditor] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setViewer(viewerPages || []);
      setEditor(editorPages || []);
    }
  }, [open, viewerPages, editorPages]);

  // ✅ READ toggle (if read removed -> also remove write)
  const toggleViewer = (key: string) => {
    setViewer((prev) => {
      // If already selected, remove it
      if (prev.includes(key)) {
        // Also remove from write/editor if read is removed
        setEditor((edPrev) => edPrev.filter((p) => p !== key));
        return prev.filter((p) => p !== key);
      }

      // Otherwise add only read
      return [...prev, key];
    });
  };

  // ✅ WRITE toggle (if write selected -> auto select read)
  const toggleEditor = (key: string) => {
    setEditor((prev) => {
      // If already selected, remove only write
      if (prev.includes(key)) {
        return prev.filter((p) => p !== key);
      }

      // Otherwise add write and ensure read is selected
      setViewer((viewPrev) =>
        viewPrev.includes(key) ? viewPrev : [...viewPrev, key]
      );

      return [...prev, key];
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        Privileges — {roleName}
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 3,
            mt: 1,
          }}
        >
          {/* LEFT SIDE = WRITE */}
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>Write Access</Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 0.5 }}>
              {APP_PAGES.map((p) => (
                <FormControlLabel
                  key={p.key}
                  control={
                    <Checkbox
                      checked={editor.includes(p.key)}
                      onChange={() => toggleEditor(p.key)}
                    />
                  }
                  label={p.label}
                />
              ))}
            </Box>
          </Box>

          {/* RIGHT SIDE = READ */}
          <Box>
            <Typography sx={{ fontWeight: 800, mb: 1 }}>Read Access</Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 0.5 }}>
              {APP_PAGES.map((p) => (
                <FormControlLabel
                  key={p.key}
                  control={
                    <Checkbox
                      checked={viewer.includes(p.key)}
                      onChange={() => toggleViewer(p.key)}
                    />
                  }
                  label={p.label}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 2,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* LEFT SIDE Disable */}
        <Button
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            fontWeight: 700,
          }}
          onClick={onDisable}
        >
          {isDisabled ? "Enable" : "Disable"}
        </Button>

        {/* RIGHT SIDE Cancel + Save */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>

          <Button
            variant="contained"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave({
                  viewerPages: viewer,
                  editorPages: editor,
                });
              } finally {
                setSaving(false);
              }
            }}
          >
            Save
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
