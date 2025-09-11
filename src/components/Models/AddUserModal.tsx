// import * as React from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   FormControl,
//   InputAdornment,
//   IconButton,
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import { createUser } from "../../api/iam"; // <-- adjust to your path if needed

// /* ---------- shared styles (match project modal) ---------- */
// const CONTROL_BG = "#1C1C1E";
// const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
// const UI = { ctrlH: 30, font: 13, icon: 16 };

// const compactCtrlSx = {
//   bgcolor: CONTROL_BG,
//   borderRadius: 1,
//   color: "#fff",

//   "& .MuiOutlinedInput-root": {
//     height: `${UI.ctrlH}px`,
//     color: "#fff",
//     alignItems: "center",
//   },
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: "#544f4fff",
//   },

//   "& .MuiInputBase-input, & .MuiOutlinedInput-input, & .MuiSelect-select": {
//     padding: "0 10px",
//     height: `${UI.ctrlH - 2}px`,
//     lineHeight: `${UI.ctrlH - 2}px`,
//     fontSize: UI.font,
//     color: "#fff",
//     display: "flex",
//     alignItems: "center",
//   },

//   "& .MuiSelect-select": { paddingRight: "28px !important" },
//   "& .MuiSelect-icon": {
//     right: 8,
//     color: "rgba(255,255,255,0.9)",
//     width: UI.icon,
//     height: UI.icon,
//     top: "50%",
//     transform: "translateY(-50%)",
//   },

//   "& .MuiSvgIcon-root": { color: "#fff", fontSize: UI.icon },
// } as const;

// const labelSx = { color: "rgba(255,255,255,0.7)", mb: 0.5, fontSize: 12 };
// const darkMenu = {
//   PaperProps: {
//     sx: {
//       bgcolor: CONTROL_BG,
//       color: "#fff",
//       border: CONTROL_BORDER,
//       "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
//       "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
//     },
//   },
// };

// /* ---------- props ---------- */
// type Props = {
//   open: boolean;
//   onClose: () => void;
//   /** Called after a successful create so parent can refresh the list */
//   onCreated?: (newUserId: string) => void;
// };

// /* ---------- component ---------- */
// export default function AddUserModal({ open, onClose, onCreated }: Props) {
//   const [username, setUsername] = React.useState("");
//   const [fullName, setFullName] = React.useState("");
//   const [userType, setUserType] = React.useState<"" | "ldap" | "local">("");
//   const [email, setEmail] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [confirm, setConfirm] = React.useState("");
//   const [ldapDn, setLdapDn] = React.useState(""); // required for LDAP

//   const [showPw, setShowPw] = React.useState(false);
//   const [showConfirm, setShowConfirm] = React.useState(false);
//   const [busy, setBusy] = React.useState(false);
//   const [err, setErr] = React.useState<string>("");

//   React.useEffect(() => {
//     if (!open) {
//       setUsername("");
//       setFullName("");
//       setUserType("");
//       setEmail("");
//       setPassword("");
//       setConfirm("");
//       setLdapDn("");
//       setShowPw(false);
//       setShowConfirm(false);
//       setBusy(false);
//       setErr("");
//     }
//   }, [open]);

//   const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
//   const match = password === confirm;

//   const isLDAP = userType === "ldap";
//   const isLocal = userType === "local";

//   const canCreate =
//     !!username.trim() &&
//     !!fullName.trim() &&
//     !!userType &&
//     !!email.trim() &&
//     emailOk &&
//     (isLocal ? !!password && !!confirm && match : !!ldapDn.trim());

//   async function handleCreate() {
//     if (!canCreate || busy) return;
//     setBusy(true);
//     setErr("");

//     try {
//       const mappedType = isLDAP ? "LDAP" : "Local"; // API expects "LDAP" | "Local"
//       const payload: any = {
//         username: username.trim(),
//         email: email.trim(),
//         fullName: fullName.trim(),
//         userType: mappedType,
//       };
//       if (isLocal) payload.password = password;
//       if (isLDAP) payload.ldapDn = ldapDn.trim();

//       const { id } = await createUser(payload);
//       onCreated?.(id);
//       onClose();
//     } catch (e: any) {
//       setErr(e?.message || "Failed to create user");
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="md"
//       PaperProps={{
//         sx: {
//           bgcolor: "#151517",
//           color: "#EDEDED",
//           border: CONTROL_BORDER,
//           borderRadius: 2,
//         },
//       }}
//     >
//       <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Add User</DialogTitle>

//       <DialogContent
//         dividers
//         sx={{ borderColor: "rgba(255,255,255,0.12)", "& .MuiDialogContent-root": { p: 0 } }}
//       >
//         <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
//           <Box>
//             <Typography sx={labelSx}>Username</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               sx={compactCtrlSx}
//               disabled={busy}
//             />
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>Full Name</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//               sx={compactCtrlSx}
//               disabled={busy}
//             />
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>User Type</Typography>
//             <FormControl size="small" fullWidth>
//               <Select
//                 value={userType}
//                 onChange={(e: SelectChangeEvent) =>
//                   setUserType((e.target.value as "ldap" | "local") || "")
//                 }
//                 sx={compactCtrlSx}
//                 MenuProps={darkMenu}
//                 displayEmpty
//                 disabled={busy}
//                 renderValue={(val) => (val ? (val === "ldap" ? "LDAP" : "Local") : "Select Type")}
//               >
//                 <MenuItem disabled value="">
//                   Select Type
//                 </MenuItem>
//                 <MenuItem value="local">Local</MenuItem>
//                 <MenuItem value="ldap">LDAP</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>Email</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               sx={compactCtrlSx}
//               error={!!email && !emailOk}
//               helperText={!!email && !emailOk ? "Enter a valid email" : undefined}
//               FormHelperTextProps={{ sx: { m: 0, lineHeight: 1, minHeight: 0 } }}
//               disabled={busy}
//             />
//           </Box>

//           {/* LDAP DN (required for LDAP) */}
//           {isLDAP && (
//             <Box sx={{ gridColumn: "1 / span 2" }}>
//               <Typography sx={labelSx}>LDAP DN</Typography>
//               <TextField
//                 size="small"
//                 fullWidth
//                 value={ldapDn}
//                 onChange={(e) => setLdapDn(e.target.value)}
//                 sx={compactCtrlSx}
//                 placeholder="cn=jdoe,ou=people,dc=corp,dc=local"
//                 disabled={busy}
//               />
//             </Box>
//           )}

//           {/* Passwords (required for Local, disabled for LDAP) */}
//           <Box>
//             <Typography sx={labelSx}>
//               Password {isLDAP && <span style={{ opacity: 0.6 }}>(not required for LDAP)</span>}
//             </Typography>
//             <TextField
//               size="small"
//               fullWidth
//               type={showPw ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               sx={compactCtrlSx}
//               disabled={busy || isLDAP}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={() => setShowPw((v) => !v)} edge="end" size="small">
//                       {showPw ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>Confirm Password</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               type={showConfirm ? "text" : "password"}
//               value={confirm}
//               onChange={(e) => setConfirm(e.target.value)}
//               sx={compactCtrlSx}
//               disabled={busy || isLDAP}
//               error={isLocal && !!confirm && !match}
//               helperText={isLocal && !!confirm && !match ? "Passwords do not match" : undefined}
//               FormHelperTextProps={{ sx: { m: 0, lineHeight: 1, minHeight: 0 } }}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small">
//                       {showConfirm ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Box>
//         </Box>

//         {err && (
//           <Box sx={{ color: "#ff6b6b", mt: 1, fontSize: 13 }}>
//             {err}
//           </Box>
//         )}
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1.25 }}>
//         <Box sx={{ flex: 1 }} />
//         <Button onClick={onClose} disabled={busy} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleCreate}
//           disabled={!canCreate || busy}
//           variant="contained"
//           sx={{
//             textTransform: "none",
//             fontWeight: 700,
//             bgcolor: "#7C57F2",
//             "&:hover": { bgcolor: "#6b48ea" },
//           }}
//         >
//           {busy ? "Creating…" : "Create"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }


// import * as React from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Typography,
//   TextField,
//   Select,
//   MenuItem,
//   Button,
//   FormControl,
//   InputAdornment,
//   IconButton,
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import { createUser } from "../../api/iam"; // <-- adjust if needed
// import { useToast } from "../../ui/toast/ToastProvider"; // <-- NEW

// /* ---------- shared styles (match project modal) ---------- */
// const CONTROL_BG = "#1C1C1E";
// const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
// const UI = { ctrlH: 30, font: 13, icon: 16 };

// const compactCtrlSx = {
//   bgcolor: CONTROL_BG,
//   borderRadius: 1,
//   color: "#fff",

//   "& .MuiOutlinedInput-root": {
//     height: `${UI.ctrlH}px`,
//     color: "#fff",
//     alignItems: "center",
//   },
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: "#544f4fff",
//   },

//   "& .MuiInputBase-input, & .MuiOutlinedInput-input, & .MuiSelect-select": {
//     padding: "0 10px",
//     height: `${UI.ctrlH - 2}px`,
//     lineHeight: `${UI.ctrlH - 2}px`,
//     fontSize: UI.font,
//     color: "#fff",
//     display: "flex",
//     alignItems: "center",
//   },

//   "& .MuiSelect-select": { paddingRight: "28px !important" },
//   "& .MuiSelect-icon": {
//     right: 8,
//     color: "rgba(255,255,255,0.9)",
//     width: UI.icon,
//     height: UI.icon,
//     top: "50%",
//     transform: "translateY(-50%)",
//   },

//   "& .MuiSvgIcon-root": { color: "#fff", fontSize: UI.icon },
// } as const;

// const labelSx = { color: "rgba(255,255,255,0.7)", mb: 0.5, fontSize: 12 };
// const darkMenu = {
//   PaperProps: {
//     sx: {
//       bgcolor: CONTROL_BG,
//       color: "#fff",
//       border: CONTROL_BORDER,
//       "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
//       "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
//     },
//   },
// };

// /* ---------- props ---------- */
// type Props = {
//   open: boolean;
//   onClose: () => void;
//   /** Called after a successful create so parent can refresh the list */
//   onCreated?: (newUserId: string) => void;
// };

// /* ---------- component ---------- */
// export default function AddUserModal({ open, onClose, onCreated }: Props) {
//   const toast = useToast(); // <-- NEW

//   const [username, setUsername] = React.useState("");
//   const [fullName, setFullName] = React.useState("");
//   const [userType, setUserType] = React.useState<"" | "ldap" | "local">("");
//   const [email, setEmail] = React.useState("");
//   const [password, setPassword] = React.useState("");
//   const [confirm, setConfirm] = React.useState("");
//   const [ldapDn, setLdapDn] = React.useState(""); // required for LDAP

//   const [showPw, setShowPw] = React.useState(false);
//   const [showConfirm, setShowConfirm] = React.useState(false);
//   const [busy, setBusy] = React.useState(false);
//   const [err, setErr] = React.useState<string>("");

//   React.useEffect(() => {
//     if (!open) {
//       setUsername("");
//       setFullName("");
//       setUserType("");
//       setEmail("");
//       setPassword("");
//       setConfirm("");
//       setLdapDn("");
//       setShowPw(false);
//       setShowConfirm(false);
//       setBusy(false);
//       setErr("");
//     }
//   }, [open]);

//   const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
//   const match = password === confirm;

//   const isLDAP = userType === "ldap";
//   const isLocal = userType === "local";

//   const canCreate =
//     !!username.trim() &&
//     !!fullName.trim() &&
//     !!userType &&
//     !!email.trim() &&
//     emailOk &&
//     (isLocal ? !!password && !!confirm && match : !!ldapDn.trim());

//   async function handleCreate() {
//     if (!canCreate || busy) return;
//     setBusy(true);
//     setErr("");

//     try {
//       const mappedType = isLDAP ? "LDAP" : "Local"; // API expects "LDAP" | "Local"
//       const payload: any = {
//         username: username.trim(),
//         email: email.trim(),
//         fullName: fullName.trim(),
//         userType: mappedType,
//       };
//       if (isLocal) payload.password = password;
//       if (isLDAP) payload.ldapDn = ldapDn.trim();

//       const { id } = await createUser(payload);

//       // Parent may already show a success toast; avoid double toast if onCreated is provided.
//       onCreated?.(id);
//       if (!onCreated) {
//         toast.success("User created successfully");
//       }
//       onClose();
//     } catch (e: any) {
//       const apiMsg =
//         e?.response?.data?.message ||
//         e?.message ||
//         "Failed to create user";
//       setErr(apiMsg);
//       toast.error(apiMsg); // <-- NEW
//     } finally {
//       setBusy(false);
//     }
//   }

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="md"
//       PaperProps={{
//         sx: {
//           bgcolor: "#151517",
//           color: "#EDEDED",
//           border: CONTROL_BORDER,
//           borderRadius: 2,
//         },
//       }}
//     >
//       <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Add User</DialogTitle>

//       <DialogContent
//         dividers
//         sx={{ borderColor: "rgba(255,255,255,0.12)", "& .MuiDialogContent-root": { p: 0 } }}
//       >
//         <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
//           <Box>
//             <Typography sx={labelSx}>Username</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               sx={compactCtrlSx}
//               disabled={busy}
//             />
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>Full Name</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//               sx={compactCtrlSx}
//               disabled={busy}
//             />
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>User Type</Typography>
//             <FormControl size="small" fullWidth>
//               <Select
//                 value={userType}
//                 onChange={(e: SelectChangeEvent) =>
//                   setUserType((e.target.value as "ldap" | "local") || "")
//                 }
//                 sx={compactCtrlSx}
//                 MenuProps={darkMenu}
//                 displayEmpty
//                 disabled={busy}
//                 renderValue={(val) => (val ? (val === "ldap" ? "LDAP" : "Local") : "Select Type")}
//               >
//                 <MenuItem disabled value="">
//                   Select Type
//                 </MenuItem>
//                 <MenuItem value="local">Local</MenuItem>
//                 <MenuItem value="ldap">LDAP</MenuItem>
//               </Select>
//             </FormControl>
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>Email</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               sx={compactCtrlSx}
//               error={!!email && !emailOk}
//               helperText={!!email && !emailOk ? "Enter a valid email" : undefined}
//               FormHelperTextProps={{ sx: { m: 0, lineHeight: 1, minHeight: 0 } }}
//               disabled={busy}
//             />
//           </Box>

//           {/* LDAP DN (required for LDAP) */}
//           {isLDAP && (
//             <Box sx={{ gridColumn: "1 / span 2" }}>
//               <Typography sx={labelSx}>LDAP DN</Typography>
//               <TextField
//                 size="small"
//                 fullWidth
//                 value={ldapDn}
//                 onChange={(e) => setLdapDn(e.target.value)}
//                 sx={compactCtrlSx}
//                 placeholder="cn=jdoe,ou=people,dc=corp,dc=local"
//                 disabled={busy}
//               />
//             </Box>
//           )}

//           {/* Passwords (required for Local, disabled for LDAP) */}
//           <Box>
//             <Typography sx={labelSx}>
//               Password {isLDAP && <span style={{ opacity: 0.6 }}>(not required for LDAP)</span>}
//             </Typography>
//             <TextField
//               size="small"
//               fullWidth
//               type={showPw ? "text" : "password"}
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               sx={compactCtrlSx}
//               disabled={busy || isLDAP}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={() => setShowPw((v) => !v)} edge="end" size="small">
//                       {showPw ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>Confirm Password</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               type={showConfirm ? "text" : "password"}
//               value={confirm}
//               onChange={(e) => setConfirm(e.target.value)}
//               sx={compactCtrlSx}
//               disabled={busy || isLDAP}
//               error={isLocal && !!confirm && !match}
//               helperText={isLocal && !!confirm && !match ? "Passwords do not match" : undefined}
//               FormHelperTextProps={{ sx: { m: 0, lineHeight: 1, minHeight: 0 } }}
//               InputProps={{
//                 endAdornment: (
//                   <InputAdornment position="end">
//                     <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small">
//                       {showConfirm ? <VisibilityOff /> : <Visibility />}
//                     </IconButton>
//                   </InputAdornment>
//                 ),
//               }}
//             />
//           </Box>
//         </Box>

//         {err && (
//           <Box sx={{ color: "#ff6b6b", mt: 1, fontSize: 13 }}>
//             {err}
//           </Box>
//         )}
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1.25 }}>
//         <Box sx={{ flex: 1 }} />
//         <Button onClick={onClose} disabled={busy} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleCreate}
//           disabled={!canCreate || busy}
//           variant="contained"
//           sx={{
//             textTransform: "none",
//             fontWeight: 700,
//             bgcolor: "#7C57F2",
//             "&:hover": { bgcolor: "#6b48ea" },
//           }}
//         >
//           {busy ? "Creating…" : "Create"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }


// p4//
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Select, MenuItem, Button,
  FormControl, InputAdornment, IconButton
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { createUser } from "../../api/iam";
import { useToast } from "../../ui/toast/ToastProvider";

/* ---------- styles ---------- */
const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
const UI = { ctrlH: 30, font: 13, icon: 16 };

const compactCtrlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff", alignItems: "center" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#544f4fff" },
  "& .MuiInputBase-input, & .MuiOutlinedInput-input, & .MuiSelect-select": {
    padding: "0 10px", height: `${UI.ctrlH - 2}px`, lineHeight: `${UI.ctrlH - 2}px`,
    fontSize: UI.font, color: "#fff", display: "flex", alignItems: "center",
  },
  "& .MuiSelect-select": { paddingRight: "28px !important" },
  "& .MuiSelect-icon": { right: 8, color: "rgba(255,255,255,0.9)", width: UI.icon, height: UI.icon, top: "50%", transform: "translateY(-50%)" },
  "& .MuiSvgIcon-root": { color: "#fff", fontSize: UI.icon },
} as const;

const labelSx = { color: "rgba(255,255,255,0.7)", mb: 0.5, fontSize: 12 };
const darkMenu = {
  PaperProps: {
    sx: {
      bgcolor: CONTROL_BG,
      color: "#fff",
      border: CONTROL_BORDER,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
    },
  },
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (newUserId: string) => void;
};

export default function AddUserModal({ open, onClose, onCreated }: Props) {
  const toast = useToast();

  const [username, setUsername] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [userType, setUserType] = React.useState<"" | "ldap" | "local">("");
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
      setUsername(""); setFullName(""); setUserType(""); setEmail(""); setPhone("");
      setPassword(""); setConfirm(""); setLdapDn(""); setShowPw(false); setShowConfirm(false);
      setBusy(false); setErr("");
    }
  }, [open]);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const match = password === confirm;
  const isLDAP = userType === "ldap";
  const isLocal = userType === "local";

  const canCreate =
    !!username.trim() &&
    !!fullName.trim() &&
    !!userType &&
    !!email.trim() &&
    emailOk &&
    (isLocal ? !!password && !!confirm && match : !!ldapDn.trim());

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canCreate || busy) return;
    setBusy(true);
    setErr("");

    try {
      const mappedType = isLDAP ? "LDAP" : "Local" as const;
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
      onCreated?.(id);
      if (!onCreated) toast.success("User created successfully");
      onClose();
    } catch (e: any) {
      const apiMsg = e?.message || "Failed to create user";
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
      PaperProps={{ sx: { bgcolor: "#151517", color: "#EDEDED", border: CONTROL_BORDER, borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Add User</DialogTitle>

      <form onSubmit={handleCreate}>
        <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
            <Box>
              <Typography sx={labelSx}>User id </Typography>
              <TextField size="small" fullWidth value={username} onChange={(e) => { setUsername(e.target.value); setErr(""); }} sx={compactCtrlSx} disabled={busy} />
            </Box>

            <Box>
              <Typography sx={labelSx}>Full Name</Typography>
              <TextField size="small" fullWidth value={fullName} onChange={(e) => { setFullName(e.target.value); setErr(""); }} sx={compactCtrlSx} disabled={busy} />
            </Box>

            <Box>
              <Typography sx={labelSx}>User Type</Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={userType}
                  onChange={(e: SelectChangeEvent) => setUserType((e.target.value as "ldap" | "local") || "")}
                  sx={compactCtrlSx}
                  MenuProps={darkMenu}
                  displayEmpty
                  disabled={busy}
                  renderValue={(val) => (val ? (val === "ldap" ? "LDAP" : "Local") : "Select Type")}
                >
                  <MenuItem disabled value="">Select Type</MenuItem>
                  <MenuItem value="local">Local</MenuItem>
                  <MenuItem value="ldap">LDAP</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography sx={labelSx}>Email</Typography>
              <TextField
                size="small" fullWidth value={email}
                onChange={(e) => { setEmail(e.target.value); setErr(""); }}
                sx={compactCtrlSx} error={!!email && !emailOk}
                helperText={!!email && !emailOk ? "Enter a valid email" : undefined}
                FormHelperTextProps={{ sx: { m: 0, lineHeight: 1, minHeight: 0 } }}
                disabled={busy}
              />
            </Box>

            {/* optional phone (stored by backend) */}
            <Box sx={{ gridColumn: "1 / span 2" }}>
              <Typography sx={labelSx}>Contact No (optional)</Typography>
              <TextField size="small" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} sx={compactCtrlSx} disabled={busy} />
            </Box>

            {isLDAP && (
              <Box sx={{ gridColumn: "1 / span 2" }}>
                <Typography sx={labelSx}>LDAP DN</Typography>
                <TextField
                  size="small" fullWidth value={ldapDn}
                  onChange={(e) => { setLdapDn(e.target.value); setErr(""); }}
                  sx={compactCtrlSx} placeholder="cn=jdoe,ou=people,dc=corp,dc=local" disabled={busy}
                />
              </Box>
            )}

            <Box>
              <Typography sx={labelSx}>Password {isLDAP && <span style={{ opacity: 0.6 }}>(not required for LDAP)</span>}</Typography>
              <TextField
                size="small" fullWidth type={showPw ? "text" : "password"} value={password}
                onChange={(e) => { setPassword(e.target.value); setErr(""); }}
                sx={compactCtrlSx} disabled={busy || isLDAP}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw((v) => !v)} edge="end" size="small">
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Box>
              <Typography sx={labelSx}>Confirm Password</Typography>
              <TextField
                size="small" fullWidth type={showConfirm ? "text" : "password"} value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErr(""); }}
                sx={compactCtrlSx} disabled={busy || isLDAP}
                error={isLocal && !!confirm && !match}
                helperText={isLocal && !!confirm && !match ? "Passwords do not match" : undefined}
                FormHelperTextProps={{ sx: { m: 0, lineHeight: 1, minHeight: 0 } }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" size="small">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {err && <Box sx={{ color: "#ff6b6b", mt: 1, fontSize: 13 }}>{err}</Box>}
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1.25 }}>
          <Box sx={{ flex: 1 }} />
          <Button onClick={onClose} disabled={busy} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canCreate || busy}
            variant="contained"
            sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
          >
            {busy ? "Creating…" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
