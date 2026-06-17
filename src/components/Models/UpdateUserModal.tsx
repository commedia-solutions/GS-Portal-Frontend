// src/components/models/UpdateUserModal.tsx
import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, TextField, Button, Box, FormControl, Select, MenuItem,
  InputAdornment, IconButton
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import { vars } from "../../ui/toast/themeBridge";
import { useI18n } from "../../i18n";
import { updateUser, setUserPassword, getAssignmentForUser, updateAssignmentForUser } from "../../api/iam";
import type { Theme } from "@mui/material/styles";
import {
  AmbientLighting,
  PREMIUM_ACTION_BUTTON_SX,
  PREMIUM_DIALOG_ACTIONS_SX,
  PREMIUM_DIALOG_CONTENT_SX,
  PREMIUM_DIALOG_PAPER_SX,
  PREMIUM_DIALOG_TITLE_SX,
  PREMIUM_FORM_CONTROL_SX,
  PREMIUM_FORM_LABEL_SX,
  PREMIUM_MENU_PROPS,
} from "../../ui/styles";

/* theme + CTRL styling copied from AddUserModal */
const BG_DARK = "#151517";
const BG_LIGHT = "#ffffff";
const TEXT_DARK = "#EDEDED";
const TEXT_LIGHT = "#000000";
const BORDER_DARK = "1px solid rgba(255,255,255,0.14)";
const BORDER_LIGHT = "1px solid rgba(0,0,0,0.12)";
const UI = { ctrlH: 36, font: 13, icon: 16 };

export function checkPasswordComplexity(pw: string) {
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const hasMinLength = pw.length >= 8;
  return {
    hasUpper,
    hasLower,
    hasSpecial,
    hasMinLength,
    isValid: hasUpper && hasLower && hasSpecial && hasMinLength
  };
}

const controlSx = {
  ...PREMIUM_FORM_CONTROL_SX,
  borderRadius: 1,
  "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
    height: `${UI.ctrlH}px`,
    minHeight: `${UI.ctrlH}px`,
    alignItems: "center",
    backgroundColor: (t: Theme) => (t.palette.mode === "dark" ? "#232325" : "#fff"),
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: vars.border,
  },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: `${UI.ctrlH - 2}px`,
    color: (t: Theme) => (t.palette.mode === "dark" ? vars.text : "#000"),
  }
} as const;

const labelSx = { ...PREMIUM_FORM_LABEL_SX } as const;

export type UpdateUserModalProps = {
  open: boolean;
  row: {
    id: string;
    full_name: string;
    email: string;
    username: string;
    userType?: "Local" | "LDAP";   //  👈 add "?"
  } | null;
  onClose: () => void;
  onUpdated: () => Promise<void>;
  entities: { id: string; name: string }[];
  roles: { id: string; name: string }[];
};

export default function UpdateUserModal({ open, row, onClose, onUpdated, entities, roles }: UpdateUserModalProps) {
  const { t } = useI18n();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [userType, setUserType] = React.useState<"Local" | "LDAP" | "">("");
  const [assignRole, setAssignRole] = React.useState<string>("");
  const [assignEntity, setAssignEntity] = React.useState<string>("");

  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);

  React.useEffect(() => {
    if (!row) return;
    setFullName(row.full_name);
    setEmail(row.email);
    setPhone("");
    setUserType(row.userType || "");
    setNewPassword(""); setConfirmPw("");

    // Load current assignment (role/entity)
    getAssignmentForUser(row.id).then((d) => {
      setAssignRole(d.roleId || "");
      setAssignEntity(d.entityIds?.[0] || "");
    });
  }, [row]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const pwMatch = newPassword === confirmPw;
  const passwordStatus = React.useMemo(() => checkPasswordComplexity(newPassword), [newPassword]);
  const canSave = emailOk && (newPassword.trim() ? passwordStatus.isValid && pwMatch : true);

  const handleSave = async () => {
    if (!row) return;

    try {
      await updateUser(row.id, {
        fullName,
        email,
        phone: phone || undefined,
      });

      if (newPassword.trim()) {
        await setUserPassword(row.id, { password: newPassword });
      }

      await updateAssignmentForUser(row.id, {
        roleId: assignRole || null,
        entityIds: assignEntity ? [assignEntity] : [],
      });

      await onUpdated();
      onClose();
    } catch (e: any) {
      alert(e?.message || "Failed to update user");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: (t) => ({
          bgcolor: t.palette.mode === "dark" ? BG_DARK : BG_LIGHT,
          color: t.palette.mode === "dark" ? TEXT_DARK : TEXT_LIGHT,
          border: t.palette.mode === "dark" ? BORDER_DARK : BORDER_LIGHT,
          borderRadius: 2,
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          ...PREMIUM_DIALOG_PAPER_SX,
        }),
      }}
    >
      <AmbientLighting />
      <DialogTitle sx={{ ...PREMIUM_DIALOG_TITLE_SX }}>
        {t("Update User")}
      </DialogTitle>

      <DialogContent dividers sx={{ ...PREMIUM_DIALOG_CONTENT_SX }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
          <Box>
            <Typography sx={labelSx}>{t("Full Name")}</Typography>
            <TextField size="small" fullWidth value={fullName} onChange={(e) => setFullName(e.target.value)} sx={controlSx} />
          </Box>

          <Box>
            <Typography sx={labelSx}>{t("Email")}</Typography>
            <TextField size="small" fullWidth value={email} error={!emailOk} onChange={(e) => setEmail(e.target.value)} sx={controlSx} />
          </Box>

          <Box>
            <Typography sx={labelSx}>{t("User Type")}</Typography>
            <FormControl size="small" fullWidth>
              <Select value={userType} onChange={(e) => setUserType(e.target.value as any)} sx={controlSx} MenuProps={PREMIUM_MENU_PROPS}>
                <MenuItem disabled value="">{t("Select Type")}</MenuItem>
                <MenuItem value="Local">{t("Local")}</MenuItem>
                <MenuItem value="LDAP">{t("LDAP")}</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography sx={labelSx}>{t("Assign Entity")}</Typography>
            <FormControl size="small" fullWidth>
              <Select value={assignEntity} onChange={(e) => setAssignEntity(e.target.value)} sx={controlSx} MenuProps={PREMIUM_MENU_PROPS}>
                <MenuItem value=""><em>{t("Global")}</em></MenuItem>
                {entities.map((e) => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ gridColumn: "1 / span 2" }}>
            <Typography sx={labelSx}>{t("Assign Role")}</Typography>
            <FormControl size="small" fullWidth>
              <Select value={assignRole} onChange={(e) => setAssignRole(e.target.value)} sx={controlSx} MenuProps={PREMIUM_MENU_PROPS}>
                <MenuItem disabled value="">{t("Select Role")}</MenuItem>
                {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ gridColumn: "1 / span 2" }}>
            <Typography sx={labelSx}>{t("Contact No (optional)")}</Typography>
            <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} sx={controlSx} />
          </Box>

          <Box sx={{ gridColumn: "1 / span 2" }}>
            <Typography sx={labelSx}>{t("Reset Password (optional)")}</Typography>
            <TextField
              size="small"
              type={showPw ? "text" : "password"}
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={controlSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw((v) => !v)} sx={{ color: vars.text }}>
                      {showPw ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ gridColumn: "1 / span 2" }}>
            <Typography sx={labelSx}>{t("Confirm Password")}</Typography>
            <TextField
              size="small"
              type={showConfirm ? "text" : "password"}
              fullWidth
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              error={!!confirmPw && !pwMatch}
              sx={controlSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm((v) => !v)} sx={{ color: vars.text }}>
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {newPassword && (
            <Box sx={{
              gridColumn: "1 / span 2",
              bgcolor: (t) => t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${vars.border}`,
              borderRadius: "8px",
              p: 1.5,
              mt: 1
            }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 1, color: vars.text }}>
                {t("Password Requirements:")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1 }}>
                {[
                  { label: t("At least 8 characters"), met: passwordStatus.hasMinLength },
                  { label: t("One uppercase letter (A-Z)"), met: passwordStatus.hasUpper },
                  { label: t("One lowercase letter (a-z)"), met: passwordStatus.hasLower },
                  { label: t("One special character"), met: passwordStatus.hasSpecial },
                ].map((req, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{
                      width: 6, height: 6, borderRadius: "50%",
                      bgcolor: req.met ? "#4caf50" : "#f44336",
                      boxShadow: req.met ? "0 0 8px #4caf50" : "0 0 8px #f44336"
                    }} />
                    <Typography sx={{
                      fontSize: 11.5,
                      color: req.met ? vars.text : vars.textDim,
                      textDecoration: req.met ? "line-through" : "none",
                      opacity: req.met ? 0.6 : 1
                    }}>
                      {req.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ ...PREMIUM_DIALOG_ACTIONS_SX }}>
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700 }}>{t("Cancel")}</Button>
        <Button
          variant="contained"
          disabled={!canSave}
          onClick={handleSave}
          sx={PREMIUM_ACTION_BUTTON_SX}
        >
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
