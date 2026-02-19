// src/pages/iam/AccessPagesDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  // FormControl,
  // Select,
  // MenuItem,
  // InputLabel,
} from "@mui/material";


import { vars } from "../../ui/toast/themeBridge";

import { APP_PAGES } from "../../config/pageRegistry";


type AccessPagesDialogProps = {
  open: boolean;
  username: string;
  selectedPages: string[];
  onClose: () => void;
  onSave: (data: { pages: string[] }) => void;
};



export default function AccessPagesDialog({
  open,
  username,
  selectedPages,
  onClose,
  onSave,
}: AccessPagesDialogProps) {
// const [accessLevel, setAccessLevel] = React.useState<"viewer" | "editor">(
//   "viewer"
// );

const [checked, setChecked] = React.useState<string[]>([]);


React.useEffect(() => {
  setChecked(selectedPages);
}, [selectedPages, open, username]);



  const toggle = (page: string) => {
   setChecked((prev: string[]) =>
  prev.includes(page)
    ? prev.filter((p) => p !== page)
    : [...prev, page]
);

  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: vars.bgCard,
          color: vars.text,
          border: `1px solid ${vars.border}`,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        Access Pages
      </DialogTitle>

<DialogContent sx={{ pt: 2 }}>
        
       {/* <Box sx={{ mb: 2 }}>
<FormControl fullWidth size="small" sx={{ mt: 1.5 }}>
    <InputLabel>Role Type</InputLabel>
    <Select
      value={accessLevel}
      label="Role Type"
      onChange={(e) =>
        setAccessLevel(e.target.value as "viewer" | "editor")
      }
    >
      <MenuItem value="viewer">Viewer</MenuItem>
      <MenuItem value="editor">Editor</MenuItem>
    </Select>
  </FormControl>
</Box> */}


        <Box sx={{ display: "grid", gap: 0.5 }}>
         {APP_PAGES.map((page) => (
  <FormControlLabel
    key={page.key}
    control={
      <Checkbox
        checked={checked.includes(page.key)}
        onChange={() => toggle(page.key)}
        size="small"
      />
    }
    label={
      <Typography sx={{ fontSize: 13 }}>
        {page.label}
      </Typography>
    }
  />
))}

        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#7C57F2",
            "&:hover": { bgcolor: "#6b46f1" },
          }}
         onClick={() => {
  onSave({
    pages: checked,
    // accessLevel,
  });

  // 🔔 notify app that page access changed
  // window.dispatchEvent(new Event("pmgt:page-access-updated"));
}}


        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
