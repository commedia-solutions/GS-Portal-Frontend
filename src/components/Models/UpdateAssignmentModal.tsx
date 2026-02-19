// UpdateAssignmentModal.tsx
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button,
  FormControl, Select, MenuItem, Checkbox, ListItemText
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import type { SelectChangeEvent } from "@mui/material/Select";

/* theme constants */
const BG_DARK = "#151517";
const BG_LIGHT = "#ffffff";
const TXT_DARK = "#EDEDED";
const TXT_LIGHT = "#000000";
const CTRL_BG_DARK = "#1C1C1E";
const CTRL_BG_LIGHT = "#ffffff";
const BORDER_DARK = "1px solid rgba(255,255,255,0.14)";
const BORDER_LIGHT = "1px solid rgba(0,0,0,0.12)";
const UI = { ctrlH: 34, font: 13, icon: 16 } as const;

const compactCtrlSx = (t: Theme) => ({
  bgcolor: t.palette.mode === "dark" ? CTRL_BG_DARK : CTRL_BG_LIGHT,
  borderRadius: 1,
  color: t.palette.mode === "dark" ? "#fff" : "#000",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: t.palette.mode === "dark" ? "#454444ff" : "rgba(0,0,0,0.23)",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: t.palette.mode === "dark" ? "#454444ff" : "rgba(0,0,0,0.4)",
  },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: t.palette.mode === "dark" ? "#544f4fff" : "#1976d2",
  },
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "inherit" },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
    color: "inherit",
  },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 28px 0 10px",
    display: "flex",
    alignItems: "center",
    fontSize: UI.font,
    color: "inherit",
  },
  "& .MuiSelect-icon": {
    top: "50%",
    transform: "translateY(-50%)",
    right: 8,
    color: t.palette.mode === "dark" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.6)",
  },
}) as const;

const labelSx = (t: Theme) => ({
  color: t.palette.mode === "dark" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)",
  mb: 0.5,
  fontSize: 12,
});

/* themed menu */
const menuPropsFor = (t: Theme) => ({
  PaperProps: {
    sx: {
      bgcolor: t.palette.mode === "dark" ? CTRL_BG_DARK : "#fff",
      color: t.palette.mode === "dark" ? "#fff" : "#000",
      border: t.palette.mode === "dark" ? BORDER_DARK : BORDER_LIGHT,
      "& .MuiMenuItem-root.Mui-selected": {
        bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
      },
      "& .MuiMenuItem-root:hover": {
        bgcolor: t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
      },
    },
  },
});

/* ---- types ---- */
export type SimpleRole   = { id: string; name: string; disabled?: boolean };
export type SimpleEntity = { id: string; name: string };

export type AssignmentForEdit = {
  userId: string;
  username: string;
  roleId: string | null;
  entityIds: string[];
};


export type AssignmentUpdated = {
  userId: string;
  roleId: string | "";
  entityIds: string[];

};

const GLOBAL_ID = "0";

export default function UpdateAssignmentModal({
  open,
  row,
  roles,
  entities,
  onClose,
  onUpdate,
}: {
  open: boolean;
  row: AssignmentForEdit | null;
  roles: SimpleRole[];
  entities: SimpleEntity[];
  onClose: () => void;
  onUpdate: (updated: AssignmentUpdated) => void | Promise<void>;
}) {
  const theme = useTheme(); // ← use Theme once

  const [roleId, setRoleId] = React.useState<string | "">("");
  const [entityIds, setEntityIds] = React.useState<string[]>([]);
  const initRef = React.useRef<{ roleId: string | ""; entityIds: string[] } | null>(null);

  React.useEffect(() => {
    if (!open || !row) return;
    const initRole = row.roleId ?? "";
    const initEntities = row.entityIds?.length ? [...row.entityIds] : [GLOBAL_ID];
    setRoleId(initRole);
    setEntityIds(initEntities);
    initRef.current = { roleId: initRole, entityIds: initEntities.slice().sort() };
  }, [open, row]);

  if (!row) return null;

 

  const isDirty = React.useMemo(() => {
    if (!initRef.current) return true;
    const a = initRef.current;
    const eq = (xs: string[], ys: string[]) =>
      xs.slice().sort().join("|") === ys.slice().sort().join("|");
    if ((a.roleId || "") !== (roleId || "")) return true;
    if (!eq(a.entityIds, entityIds)) return true;
    return false;
  }, [roleId, entityIds]);

  const handleEntityChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    const next = typeof v === "string" ? v.split(",") : (v as string[]);
    setEntityIds(next.includes(GLOBAL_ID) ? [GLOBAL_ID] : next.filter((x) => x !== GLOBAL_ID));
  };

  const handleUpdate = async () => {
    await onUpdate({
      userId: row.userId,
      roleId,
      entityIds: entityIds.length ? entityIds : [GLOBAL_ID],
      
    });
    onClose();
  };

  const renderEntityValue = (vals: any) => {
    const v = vals as string[];
    if (!v.length || v.includes(GLOBAL_ID)) return "(global)";
    return v.map((id) => entities.find((e) => e.id === id)?.name || String(id)).join(", ");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: theme.palette.mode === "dark" ? BG_DARK : BG_LIGHT,
          color:   theme.palette.mode === "dark" ? TXT_DARK : TXT_LIGHT,
          border:  theme.palette.mode === "dark" ? BORDER_DARK : BORDER_LIGHT,
          borderRadius: 2,
          backgroundImage: "none",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: theme.palette.mode === "dark" ? BG_DARK : BG_LIGHT,
          color:   theme.palette.mode === "dark" ? TXT_DARK : TXT_LIGHT,
          fontWeight: 800,
          pb: 1,
          borderBottom: theme.palette.mode === "dark" ? BORDER_DARK : BORDER_LIGHT,
        }}
      >
        Update Assignment
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          bgcolor: theme.palette.mode === "dark" ? BG_DARK : BG_LIGHT,
          color:   theme.palette.mode === "dark" ? TXT_DARK : TXT_LIGHT,
          borderColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)",
        }}
      >
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
          <Box>
            <Typography sx={labelSx(theme)}>User</Typography>
            <TextField size="small" fullWidth value={row.username} sx={compactCtrlSx(theme)} inputProps={{ readOnly: true }} />
          </Box>

          <Box>
            <Typography sx={labelSx(theme)}>Role</Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={roleId}
                onChange={(e: SelectChangeEvent) => setRoleId(e.target.value as string)}
                sx={compactCtrlSx(theme)}
                MenuProps={menuPropsFor(theme)}
                displayEmpty
                renderValue={(val) => {
                  if (val === "") return "(no role)";
                  const r = roles.find((x) => String(x.id) === String(val));
                  return r ? r.name : "(no role)";
                }}
              >
                <MenuItem value="">(no role)</MenuItem>
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id} disabled={!!r.disabled}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography sx={labelSx(theme)}>Entity</Typography>
            <FormControl size="small" fullWidth>
              <Select<string[]>
                multiple
                value={entityIds}
                onChange={handleEntityChange}
                sx={compactCtrlSx(theme)}
                MenuProps={menuPropsFor(theme)}
                displayEmpty
                renderValue={renderEntityValue}
              >
                <MenuItem value={GLOBAL_ID}>
                  <Checkbox size="small" checked={entityIds.includes(GLOBAL_ID)} />
                  <ListItemText primary="(global)" />
                </MenuItem>
                {entities.map((e) => {
                  const checked = entityIds.includes(e.id);
                  return (
                    <MenuItem key={e.id} value={e.id}>
                      <Checkbox size="small" checked={checked} />
                      <ListItemText primary={e.name} />
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Box>

          
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: theme.palette.mode === "dark" ? BG_DARK : BG_LIGHT,
          color:   theme.palette.mode === "dark" ? TXT_DARK : TXT_LIGHT,
          p: 2,
          gap: 1.25,
          borderTop: theme.palette.mode === "dark" ? BORDER_DARK : BORDER_LIGHT,
        }}
      >
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          disabled={!isDirty}
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
        >
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
