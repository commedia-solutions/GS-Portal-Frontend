// p4 // AddUserModal (theme-aware + i18n)
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Select, MenuItem, Button,
  FormControl, InputAdornment, IconButton
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { Theme } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { createUser, updateAssignmentForUser } from "../../api/iam";

import { useToast } from "../../ui/toast/ToastProvider";

/* theme bridge (for colors consistent with the app) */
import { vars } from "../../ui/toast/themeBridge";
import { useI18n } from "../../i18n";
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

/* ---------- shared control styling (dark/light) ---------- */
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

// --- at the top with your other constants ---
const BG_DARK = "#151517";
const BG_LIGHT = "#ffffff";
const TEXT_DARK = "#EDEDED";
const TEXT_LIGHT = "#000000";
const BORDER_DARK = "1px solid rgba(255,255,255,0.14)";
const BORDER_LIGHT = "1px solid rgba(0,0,0,0.12)";
 
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
  "& .MuiInputBase-input, & .MuiOutlinedInput-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: `${UI.ctrlH - 2}px`,
    display: "flex",
    alignItems: "center",
    color: (t: Theme) => (t.palette.mode === "dark" ? vars.text : "#000"),
    "::placeholder": {
      color: (t: Theme) =>
        t.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
      opacity: 1,
    },
  },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px !important`,
    lineHeight: `${UI.ctrlH - 2}px`,
    padding: "0 10px !important",
    display: "flex",
    alignItems: "center",
    backgroundColor: (t: Theme) => (t.palette.mode === "dark" ? "#232325" : "#fff"),
  },
  "& .MuiSvgIcon-root": { color: vars.text, fontSize: UI.icon },
} as const;

const labelSx = {
  ...PREMIUM_FORM_LABEL_SX,
} as const;

const darkLightMenu = {
  ...PREMIUM_MENU_PROPS,
};

/* ---------- component ---------- */
type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (newUserId: string) => void;
  entities: { id: string; name: string }[];
  roles: { id: string; name: string }[];
};


export default function AddUserModal({
  open,
  onClose,
  onCreated,
  entities,
  roles,
}: Props) {

  const { t } = useI18n();
  const toast = useToast();

  const [username, setUsername] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [userType, setUserType] = React.useState<"" | "ldap" | "local">("");
  const [assignEntityId, setAssignEntityId] = React.useState<string>("");
const [assignRoleId, setAssignRoleId] = React.useState<string>("");

  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState(""); // optional
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [ldapDn, setLdapDn] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState<string>("");

  React.useEffect(() => {
    if (!open) {
      setUsername(""); setFullName(""); setUserType(""); setAssignEntityId("");
setAssignRoleId("");
setEmail(""); setPhone("");
      setPassword(""); setConfirm(""); setLdapDn(""); setShowPw(false); setShowConfirm(false);
      setBusy(false); setErr("");
    }
  }, [open]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const match = password === confirm;
  const isLDAP = userType === "ldap";
  const isLocal = userType === "local";

  const passwordStatus = React.useMemo(() => checkPasswordComplexity(password), [password]);

  const canCreate =
    !!username.trim() &&
    !!fullName.trim() &&
    !!userType &&
    !!email.trim() &&
    emailOk &&
    (isLocal ? !!password && passwordStatus.isValid && !!confirm && match : !!ldapDn.trim());

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canCreate || busy) return;
    setBusy(true);
    setErr("");

    try {
      const mappedType = isLDAP ? "LDAP" : ("Local" as const);
      const payload: any = {
        username: username.trim(),
        email: email.trim(),
        fullName: fullName.trim(),
        userType: mappedType,
      };
      if (phone.trim()) payload.phone = phone.trim();
      if (isLocal) payload.password = password;
      if (isLDAP) payload.ldapDn = ldapDn.trim();

      const { id } = await createUser(payload);

      await updateAssignmentForUser(id, {
  roleId: assignRoleId || null,
  entityIds: assignEntityId ? [assignEntityId] : [],
});

// auto-assign role & entity


onCreated?.(id);

      if (!onCreated) toast.success(t("User created successfully"));
      onClose();
    } catch (e: any) {
      const apiMsg = e?.message || t("Failed to create user");
      setErr(apiMsg);
      toast.error(apiMsg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: (t) => ({
          ...PREMIUM_DIALOG_PAPER_SX,
          bgcolor: t.palette.mode === "dark" ? BG_DARK : BG_LIGHT,   // ← main container bg
          color:   t.palette.mode === "dark" ? TEXT_DARK : TEXT_LIGHT,
          border:  t.palette.mode === "dark" ? BORDER_DARK : BORDER_LIGHT,
          borderRadius: 2,
          backgroundImage: "none",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
        }),
      }}
    >
      <AmbientLighting />
      <DialogTitle
        sx={{
          ...PREMIUM_DIALOG_TITLE_SX,
        }}
      >
        {t("Add User")}
      </DialogTitle>

      <form onSubmit={handleCreate}>
        <DialogContent
          dividers
          sx={{
            ...PREMIUM_DIALOG_CONTENT_SX,
            borderColor: vars.border,
            "& .MuiFormHelperText-root": {
              m: 0,
              lineHeight: 1,
              minHeight: 0,
            },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 1.25,
              pt: 0.5,
            }}
          >
            <Box>
              <Typography sx={labelSx}>{t("User Id")}</Typography>
              <TextField
                size="small"
                fullWidth
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErr(""); }}
                sx={controlSx}
                disabled={busy}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>{t("Full Name")}</Typography>
              <TextField
                size="small"
                fullWidth
                value={fullName}
                onChange={(e) => { setFullName(e.target.value); setErr(""); }}
                sx={controlSx}
                disabled={busy}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>{t("User Type")}</Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={userType}
                  onChange={(e: SelectChangeEvent) =>
                    setUserType((e.target.value as "ldap" | "local") || "")
                  }
                  sx={controlSx}
                  MenuProps={darkLightMenu}
                  displayEmpty
                  disabled={busy}
                  renderValue={(val) =>
                    val ? (val === "ldap" ? t("LDAP") : t("Local")) : t("Select Type")
                  }
                >
                  <MenuItem disabled value="">{t("Select Type")}</MenuItem>
                  <MenuItem value="local">{t("Local")}</MenuItem>
                  <MenuItem value="ldap">{t("LDAP")}</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Assign Entity */}
<Box>
  <Typography sx={labelSx}>{t("Assign Entity")}</Typography>
  <FormControl size="small" fullWidth>
    <Select
      value={assignEntityId}
      onChange={(e: SelectChangeEvent) => setAssignEntityId(e.target.value)}
      sx={controlSx}
      MenuProps={darkLightMenu}
      displayEmpty
      disabled={busy}
      renderValue={(val) =>
        val ? entities.find((x) => x.id === val)?.name : t("Global")
      }
    >
      <MenuItem value="">
        <em>{t("Global")}</em>
      </MenuItem>
      {entities.map((e) => (
        <MenuItem key={e.id} value={e.id}>
          {e.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>

{/* Assign Role */}
<Box>
  <Typography sx={labelSx}>{t("Assign Role")}</Typography>
  <FormControl size="small" fullWidth>
    <Select
      value={assignRoleId}
      onChange={(e: SelectChangeEvent) => setAssignRoleId(e.target.value)}
      sx={controlSx}
      MenuProps={darkLightMenu}
      displayEmpty
      disabled={busy}
      renderValue={(val) =>
        val ? roles.find((r) => r.id === val)?.name : t("Select Role")
      }
    >
      <MenuItem disabled value="">
        {t("Select Role")}
      </MenuItem>
      {roles.map((r) => (
        <MenuItem key={r.id} value={r.id}>
          {r.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>


            <Box>
              <Typography sx={labelSx}>{t("Email")}</Typography>
              <TextField
                size="small"
                fullWidth
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                sx={controlSx}
                error={!!email && !emailOk}
                helperText={!!email && !emailOk ? t("Enter a valid email") : undefined}
                disabled={busy}
              />
            </Box>

            {/* optional phone (stored by backend) */}
            <Box sx={{ gridColumn: "1 / span 2" }}>
              <Typography sx={labelSx}>{t("Contact No (optional)")}</Typography>
              <TextField
                size="small"
                fullWidth
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                sx={controlSx}
                disabled={busy}
              />
            </Box>

            {isLDAP && (
              <Box sx={{ gridColumn: "1 / span 2" }}>
                <Typography sx={labelSx}>{t("LDAP DN")}</Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={ldapDn}
                  onChange={(e) => { setLdapDn(e.target.value); setErr(""); }}
                  sx={controlSx}
                  placeholder="cn=jdoe,ou=people,dc=corp,dc=local"
                  disabled={busy}
                />
              </Box>
            )}

            <Box>
              <Typography sx={labelSx}>
                {t("Password")} {isLDAP && <span style={{ opacity: 0.6 }}>({t("not required for LDAP")})</span>}
              </Typography>
              <TextField
                size="small"
                fullWidth
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErr(""); }}
                sx={controlSx}
                disabled={busy || isLDAP}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPw((v) => !v)}
                        edge="end"
                        size="small"
                        sx={{ color: vars.text }}
                      >
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>{t("Confirm Password")}</Typography>
              <TextField
                size="small"
                fullWidth
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErr(""); }}
                sx={controlSx}
                disabled={busy || isLDAP}
                error={isLocal && !!confirm && !match}
                helperText={isLocal && !!confirm && !match ? t("Passwords do not match") : undefined}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((v) => !v)}
                        edge="end"
                        size="small"
                        sx={{ color: vars.text }}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {isLocal && password && (
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

          {err && (
            <Box sx={{ color: "#ef5350", mt: 1, fontSize: 13 }}>
              {err}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ ...PREMIUM_DIALOG_ACTIONS_SX }}>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={onClose}
            disabled={busy}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: vars.text,
              "&:hover": { bgcolor: (t: Theme) => (t.palette.mode === "dark" ? vars.bgHover : "#f5f5f5") },
            }}
          >
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            disabled={!canCreate || busy}
            variant="contained"
            sx={{
              ...PREMIUM_ACTION_BUTTON_SX,
              "&.Mui-disabled": {
                bgcolor: (t: Theme) => (t.palette.mode === "dark" ? vars.bgCtrl : "#ececec"),
                color: vars.textDim,
                boxShadow: "none",
              },
            }}
          >
            {busy ? t("Creating…") : t("Create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
