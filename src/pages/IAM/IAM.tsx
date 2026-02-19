// src/pages/iam/IAM.tsx
import React from "react";
import {
  Box, Card, ToggleButtonGroup, ToggleButton,
  TextField, InputAdornment, Button, TablePagination,
  FormControl, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
// import OutlinedInput from "@mui/material/OutlinedInput";

/* i18n */
import { useI18n } from "../../i18n";

/* Toast */
import { useToast } from "../../ui/toast/ToastProvider";

/* THEME */
import { vars, sxPresets } from "../../ui/toast/themeBridge";

import Checkbox from "@mui/material/Checkbox";
import DeleteIcon from "@mui/icons-material/Delete";
import RoleAccessDialog from "./RoleAccessDialog";
import { getRolePages, updateRolePages } from "../../api/iam";


/* API */
import {
  listUsers,
  createEntity,
  getEntities,
 
 
  getRoles,
  createRole,
  updateRole,
  listAssignments,
  updateAssignmentForUser,
  setUserStatus,
    deleteRole,
  deleteEntity,
  deleteUser,

  type UserRow as ApiUserRow,
  type RoleRow as ApiRoleRow,

  type AssignmentListRow,
} from "../../api/iam";

// import AccessPagesDialog from "./AccessPagesDialog";
import { useActionAccess } from "../../auth/useActionAccess";

// import { api } from "../../api/http";
// import { updatePageAccess } from "../../api/iam";   // ➕ ADD THIS LINE

/* Modals */


import AddUserModal from "../../components/Models/AddUserModal";
import UpdateUserModal from "../../components/Models/UpdateUserModal";

import UpdateEntityModal, { type EntityUpdateIn } from "../../components/Models/UpdateEntityModal";
import UpdateAssignmentModal, {
  type AssignmentForEdit as AssignEditRow,
  type AssignmentUpdated as AssignUpdated,
  type SimpleRole as ModalRole,
  type SimpleEntity as ModalEntity,
} from "../../components/Models/UpdateAssignmentModal";

/* ---------------- CAPTCHA (same as Add Satellites) ---------------- */
type Captcha = { text: string; svg: string };
function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick(chars: string, n: number) { let s = ""; for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; }
function makeCaptcha(width = 220, height = 80, length = 5): Captcha {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const text = pick(alphabet, length);
  const charW = width / (length + 1);
  const chars = [...text].map((ch, i) => {
    const x = (i + 1) * charW + rand(-6, 6);
    const y = height / 2 + rand(-5, 5);
    const r = rand(-24, 24);
    const fontSize = rand(30, 38);
    return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="700"
              text-anchor="middle" dominant-baseline="middle"
              transform="rotate(${r} ${x} ${y})">${ch}</text>`;
  }).join("");
  const lines = Array.from({ length: 4 }).map(() => {
    const x1 = rand(0, width), y1 = rand(0, height);
    const x2 = rand(0, width), y2 = rand(0, height);
    const op = rand(0.25, 0.45).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="${op}" stroke-width="${rand(1,2)}"/>`;
  }).join("");
  const dots = Array.from({ length: 35 }).map(() => {
    const x = rand(0, width), y = rand(0, height);
    const op = rand(0.15, 0.35).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${rand(0.8,2.2)}" fill="white" fill-opacity="${op}"/>`;
  }).join("");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="wavy">
      <feTurbulence type="fractalNoise" baseFrequency="${rand(0.9,1.3)/100}" numOctaves="2" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${rand(8,14)}" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <linearGradient id="bg" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#1a1a1d"/>
      <stop offset="100%" stop-color="#121214"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g filter="url(#wavy)" fill="#e7e7ff">${chars}</g>
  <g>${lines}${dots}</g>
</svg>`.trim();
  return { text, svg };
}
function svgDataUrl(svg: string) { return "data:image/svg+xml;utf8," + encodeURIComponent(svg); }

function CaptchaDialog({
  open, onCancel, onOk,
}: { open: boolean; onCancel: () => void; onOk: () => void; }) {
  const { t } = useI18n();
  const [cap, setCap] = React.useState<Captcha>(() => makeCaptcha());
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState("");
  const refresh = () => { setCap(makeCaptcha()); setInput(""); setError(""); };
  const submit = () => {
    if (input.trim().toLowerCase() === cap.text.toLowerCase()) { setError(""); onOk(); }
    else { setError(t("Incorrect code. Try again.")); refresh(); }
  };
  React.useEffect(() => { if (open) refresh(); }, [open]);
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth
      PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}>
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1 }}>
          <img src={svgDataUrl(cap.svg)} alt="captcha"
            style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${vars.border}` }} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Type the letters")} size="small" fullWidth
              sx={(tM) => ({ ...sxPresets.ctrl, "& .MuiOutlinedInput-root": { height: 36, background: tM.palette.mode === "dark" ? "#232325" : "#fff" } })}/>
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: vars.border }}>{t("Refresh")}</Button>
          </Box>
          {error && <Box sx={{ color: "#f87171", fontSize: 12, mt: 0.25 }}>{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>{t("Cancel")}</Button>
        <Button onClick={submit} variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" } }}>
          {t("Verify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
/* ---------------- end CAPTCHA ---------------- */

/* ---------- Accent + pill helpers ---------- */
const GREEN = "#7CFF8D";
const GREEN_BORDER_DARK = "rgba(124,255,141,0.18)";
const SELECTED_BG_DARK = "#0E0E10";
const SELECTED_BG_LIGHT = "#FFFFFF";

const theadBg = (t: Theme) => (t.palette.mode === "dark" ? vars.bgThead : "#464b4e");
const theadText = (t: Theme) => (t.palette.mode === "light" ? "#fff" : vars.text);
const bodyText  = (t: Theme) => (t.palette.mode === "light" ? "#000" : vars.text);

const getSelectedBg   = (t: Theme) => (t.palette.mode === "dark" ? SELECTED_BG_DARK  : SELECTED_BG_LIGHT);
const getSelectedBord = (t: Theme) => (t.palette.mode === "dark" ? GREEN_BORDER_DARK : GREEN);
const getHoverBg      = (t: Theme) => (t.palette.mode === "dark" ? "#0F1113"         : "#FFFFFF");
const SEL_H = 30;
const pillSx = {
  textTransform: "none", fontWeight: 700, fontSize: 13, px: 2, height: 32, lineHeight: "32px",
  borderRadius: 999, color: vars.textDim, bgcolor: "transparent",
  "&.Mui-selected": {
    color: GREEN,  bgcolor: (t: Theme) => getSelectedBg(t),
    border: (t: Theme) => `1px solid ${getSelectedBord(t)}`,
    boxShadow: (t: Theme) => (t.palette.mode === "dark" ? "inset 0 0 0 1px rgba(124,255,141,0.06)" : "inset 0 0 0 1px rgba(124,255,141,0.12)"),
  },
  "&.Mui-selected:hover": { bgcolor: (t: Theme) => getHoverBg(t) },
} as const;

/* ---------- UI constants ---------- */
const UI = { ctrlH: 34, font: 13, icon: 16, gap: 0.75, headerPx: 1.25, headerPy: 0.6, searchW: 260, paginationH: 36 } as const;
const compactCtrlSx = {
  ...sxPresets.ctrl, borderRadius: 1,
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, backgroundColor: (t: any) => (t.palette.mode === "dark" ? "#232325" : "#fff") },
  "& .MuiOutlinedInput-root.Mui-focused": { backgroundColor: (t: any) => (t.palette.mode === "dark" ? "#232325" : "#fff") },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`, padding: "0 10px", fontSize: UI.font, lineHeight: 1, color: theadText as any,
    "::placeholder": { color: vars.textDim, opacity: 1 },
  },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px !important`, lineHeight: `${UI.ctrlH - 2}px`, padding: "0 10px !important",
    display: "flex", alignItems: "center", backgroundColor: (t: any) => (t.palette.mode === "dark" ? "#232325" : "#fff"),
  },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: vars.text },
} as const;
const CARD_SX = {
  ...sxPresets.card, borderRadius: 2, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
  display: "flex", flexDirection: "column" as const, backgroundImage: "none",
} as const;
const SCROLLER_SX = sxPresets.scroller;
const gridTemplate = (cols: { width?: number; flex?: number }[]) =>
  cols.map(c => (c.flex ? `minmax(${c.width ?? 120}px, ${c.flex}fr)` : `${c.width ?? 120}px`)).join(" ");

/* ---------- Users table ---------- */
type UserRow = {
  id: string;
  sr: number;
  username: string;
  full_name: string;
  email: string;
  user_type: "local" | "ldap";
  userType?: "Local" | "LDAP";   // 👈 ADD THIS
  entities: string;      // 👈 Assigned Entity
  role: string;          // 👈 Assigned Role

 
  status: "active" | "disabled";
};

type Column = {
  key: keyof UserRow | "action" | "select";
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
  flex?: number;
};

const COLUMNS: Column[] = [
  { key: "select",    label: "",           width: 44 },
  { key: "sr",        label: "No",          width: 34 },

  { key: "username",  label: "User Id",     width: 110},
  { key: "full_name", label: "Full Name",   width: 110, flex: 1 },
  { key: "email",     label: "Email",       width: 200, flex: 1.5},

  { key: "entities",  label: "Entity",      width: 130,},
  { key: "role",      label: "Role",        width: 110,  },

  { key: "user_type", label: "Type",        width: 70 },
  { key: "action",    label: "Action",      width: 150 },
];






function DarkUsersTable({
  
  rows,
  columns,
  onToggle,
   onUpdateUser, 
  selected,
  onSelect,
  onSelectAll,
  onSort,
  sortIcon,
}: {
  rows: UserRow[];
  columns: Column[];
  onToggle: (r: UserRow) => void;
    onUpdateUser: (r: UserRow) => void;     // 👈 add type

  selected: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  onSort: (key: string) => void;
  sortIcon: (key: string) => string;
})

{
const { hasWriteAccess } = useActionAccess();
  const { t } = useI18n();
  const template = gridTemplate(columns);
  return (
<Box
  sx={{
    width: "100%",
    height: "100%",
    overflowY: "auto",    // ✅ SCROLL MOVED HERE
    overflowX: "auto",
    ...SCROLLER_SX,
  }}
>

  <Box
    sx={{
      width: "max-content",    // grow only as wide as content
      minWidth: "100%",        // but at least full viewport
    }}
  >

     <Box
  sx={{
    position: "sticky",
    top: 0,
    zIndex: 2,            // ✅ HEADER ALWAYS ABOVE ROWS

    display: "grid",
    gridTemplateColumns: template,
    bgcolor: theadBg as any,
    borderBottom: `1px solid ${vars.border}`,
width: "100%",
minWidth: template.includes("fr") ? "100%" : undefined,
boxSizing: "border-box",
  
  }}
>


        {columns.map((c) => {
  if (c.key === "select") {
    return (
      <Box key="select" sx={{ textAlign: "center" }}>
        <Checkbox
          size="small"
          checked={rows.length > 0 && rows.every(r => selected.includes(r.id))}
          indeterminate={
            selected.length > 0 &&
            !rows.every(r => selected.includes(r.id))
          }
          onChange={onSelectAll}
        />
      </Box>
    );
  }

 return (
  <Box
    key={String(c.key)}
    onClick={() =>
  c.key !== "action" && onSort(String(c.key))
}

    sx={{
      px: 1.25,
      py: 1,
      fontWeight: 700,
      fontSize: 13,
      cursor: c.key !== "action" ? "pointer" : "default",
      color: theadText as any,
      textAlign: c.align ?? "center",
      whiteSpace: "nowrap",
      userSelect: "none",

       bgcolor: theadBg as any,
    borderRight: `0px solid ${vars.border}`,
  
    }}
  >
    {t(c.label)}
    {c.key !== "action" && sortIcon(String(c.key))}
  </Box>
);
})}

        </Box>

        {rows.map((r, idx) => (
          <Box
          key={r.id}
  sx={{
  display: "grid",
  gridTemplateColumns: template,
  width: "100%",        // 👈 fill card width
  minWidth: "100%",
  boxSizing: "border-box",

  // ✅ FULL-WIDTH divider (this fixes everything)
 borderBottom: `1px solid ${vars.border}`,

}}

>



            {columns.map((c) =>
             {
              if (c.key === "select") {
  return (
    <Box key="select" sx={{ textAlign: "center" }}>
<Checkbox
  size="small"
  checked={selected.includes(r.id)}
  disabled={r.username === "Isroadmin"}
  onChange={() => onSelect(r.id)}
/>

    </Box>
  );
}


          if (c.key === "action") {
if (!hasWriteAccess("users")) {
  return <Box key={`action-${idx}`} />;
}

  const disabled = r.status === "disabled";
  return (


    <Box key={`action-${idx}`} sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
      <Button
        size="small"
        variant="contained"
        sx={{
          textTransform: "none",
          fontWeight: 700,
          fontSize: 12,
          px: 1.25,
          bgcolor: "#7C57F2",
          "&:hover": { bgcolor: "#6b46f1" }
        }}
onClick={() => onUpdateUser(r)}            // ✅
      >
        Edit
      </Button>

      <Button
        size="small"
        variant="contained"
        sx={{
          textTransform: "none",
          fontWeight: 700,
          fontSize: 12,
          px: 1.25,
          bgcolor: disabled ? "#555" : "#ef4a4a",
          "&:hover": { bgcolor: disabled ? "#666" : "#dd3737" }
        }}
        onClick={() => onToggle(r)}
      >
        {t(disabled ? "Enable" : "Disable")}
      </Button>
    </Box>
  );
}


              return (
                <Box key={String(c.key)} sx={{ px: 1.05, py: 1, fontSize: 13, textAlign: c.align ?? "center", color: bodyText as any, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" , borderRight: `0px solid ${vars.border}`,
 }}
                  title={String(r[c.key as keyof UserRow] ?? "")}>
                  {r[c.key as keyof UserRow] as any}
                </Box>
              );
            })}
          </Box>
        ))}

        {!rows.length && <Box sx={{ px: 1.25, py: 2, color: vars.textDim, textAlign: "center" }}>{t("No users found.")}</Box>}
      </Box>
    </Box>
  );
}

/* ---------- Types ---------- */
type EntityRow = {
  id: string;
  sr: number;
  name: string;
  description: string;
};

type RoleRowUI = {
  id: string;
  sr: number;
  role: string;
  description: string;
  type: "viewer" | "editor" | null;   // ⬅ allow null for admin

  is_disabled: 0 | 1;
  is_system: 0 | 1;
};

type AssignmentRow = AssignmentListRow;

/* ---------- Page ---------- */
export default function IAM() {
const { hasWriteAccess } = useActionAccess();
const { t } = useI18n();

  const toast = useToast();

  type TabKey = "entity" | "role" | "users" | "assign";
const [tab, setTab] = React.useState<TabKey>("entity");
const [viewRoleOpen, setViewRoleOpen] = React.useState(false);

const [viewRolePages, setViewRolePages] = React.useState<{
  roleName: string;
  viewerPages: string[];
  editorPages: string[];
}>({
  roleName: "",
  viewerPages: [],
  editorPages: [],
});

  const [search, setSearch] = React.useState("");

  // Toggle enable/disable for a role row
  const toggleRole = async (r: RoleRowUI) => {
    if (r.is_system) return;
    try {
      await updateRole(r.id, { isDisabled: r.is_disabled ? 0 : 1 });
      await reloadRoles();
      toast.success(t(r.is_disabled ? "Role enabled successfully" : "Role disabled successfully"));
    } catch (e: any) {
      console.error("Failed to toggle role", e);
      const msg = e?.response?.data?.message || t("Failed to update role");
      toast.error(msg);
    }
  };
const openRoleView = async (role: RoleRowUI) => {
  try {
    const res = await getRolePages(role.id);

    setViewRolePages({
      roleName: role.role,
      viewerPages: res.viewerPages || [],
      editorPages: res.editorPages || [],
    });

    setViewRoleOpen(true);
  } catch (err) {
    console.error("Failed to load role pages", err);

    setViewRolePages({
      roleName: role.role,
      viewerPages: [],
      editorPages: [],
    });

    setViewRoleOpen(true);
  }
};

const openRoleAccess = async (role: RoleRowUI) => {
  if (role.is_system) return;

  setActiveRoleForAccess(role);

  try {
    const res = await getRolePages(role.id);

    const payload = {
      viewerPages: res.viewerPages || [],
      editorPages: res.editorPages || [],
    };

    setRolePages(payload);

    setRolePagesMap((prev) => ({
      ...prev,
      [role.id]: payload,
    }));
  } catch {
    setRolePages({ viewerPages: [], editorPages: [] });
  }

  setRoleAccessOpen(true);
};



const [rolePages, setRolePages] = React.useState<{
  viewerPages: string[];
  editorPages: string[];
}>({ viewerPages: [], editorPages: [] });
const [rolePagesMap, setRolePagesMap] = React.useState<
  Record<string, { viewerPages: string[]; editorPages: string[] }>
>({});
const sortIcon = (key: string) =>
  sortBy === key ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  //Sort 
type SortDir = "asc" | "desc";

const [sortBy, setSortBy] = React.useState<string | null>(null);
const [sortDir, setSortDir] = React.useState<SortDir>("asc");

const toggleSort = (key: string) => {
  if (sortBy === key) {
    setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
  } else {
    setSortBy(key);
    setSortDir("asc");
  }
};

const sortFn = <T extends Record<string, any>>(
  rows: T[],
  key: keyof T | null
) => {
  if (!key) return rows;

  return [...rows].sort((a: any, b: any) => {
    const A = a[key] ?? "";
const B = b[key] ?? "";

    if (A == null) return 1;
    if (B == null) return -1;

    if (typeof A === "number" && typeof B === "number") {
      return sortDir === "asc" ? A - B : B - A;
    }

    return sortDir === "asc"
      ? String(A).localeCompare(String(B))
      : String(B).localeCompare(String(A));
  });
};








  // USERS
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);
const [updateUserModal, setUpdateUserModal] = React.useState<{ open: boolean; row: UserRow | null }>({
  open: false,
  row: null,
});
  // ENTITIES
  const [entities, setEntities] = React.useState<EntityRow[]>([]);
  const [entityPage, setEntityPage] = React.useState(0);
  const [entityRpp, setEntityRpp] = React.useState(10);
  const [entityName, setEntityName] = React.useState("");
  const [entityDesc, setEntityDesc] = React.useState("");

  // ROLES
  const [roles, setRoles] = React.useState<RoleRowUI[]>([]);
  // Role → Access Pages modal
const [roleAccessOpen, setRoleAccessOpen] = React.useState(false);
const [activeRoleForAccess, setActiveRoleForAccess] = React.useState<RoleRowUI | null>(null);

  const [rolePage, setRolePage] = React.useState(0);
  const [roleRpp, setRoleRpp] = React.useState(10);
  const [roleName, setRoleName] = React.useState("");
  
const [roleType, setRoleType] = React.useState<"viewer" | "editor" | "">("");

  const [roleDesc, setRoleDesc] = React.useState("");

  // selected rows
  // selected rows (checkbox)
  const [selectedEntities, setSelectedEntities] = React.useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);

  const [confirmOpen, setConfirmOpen] = React.useState<null | "entity" | "role">(null);
// helper: check if at least one non-system role is selected
const hasDeletableRoleSelected = selectedRoles.some(
  (id) => !roles.find((r) => r.id === id)?.is_system
);


  // toggle selection helpers
  const toggleUserSelect = (id: string) => {
  setSelectedUsers((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

const toggleEntitySelect = (id: string) => {
  setSelectedEntities((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};

const toggleAllUsers = () => {
  const ids = filteredUsers.map((u) => u.id);  // REAL UUIDs
  setSelectedUsers(
    ids.every((id) => selectedUsers.includes(id)) ? [] : ids
  );
};


const toggleRoleSelect = (id: string) => {
  setSelectedRoles((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
};





  // ASSIGNMENTS
  const [assignments, setAssignments] = React.useState<AssignmentRow[]>([]);

  // 🔄 Reload Assignments
const reloadAssignments = React.useCallback(async () => {
  try {
    const data = await listAssignments();
    setAssignments(data);
  } catch (e) {
    console.error("Failed to load assignments", e);
    toast.error(t("Failed to load assignments"));
    setAssignments([]);
  }
}, [toast, t]);

  

  const [assignedPage, setAssignedPage] = React.useState(0);
const [assignedRpp, setAssignedRpp] = React.useState(10);
 

 
  const [entityModal, setEntityModal] = React.useState<{ open: boolean; row: EntityUpdateIn | null }>({ open: false, row: null });
  const [assignModal, setAssignModal] = React.useState<{ open: boolean; row: AssignEditRow | null }>({ open: false, row: null });
// const [accessDialog, setAccessDialog] = React.useState<{
//   open: boolean;
//   user_id: string;
//   username: string;
//   selectedPages: string[];
// }>({
//   open: false,
//   user_id: "",
//   username: "",
//   selectedPages: [],
// });




  /* ---------------- CAPTCHA flow state ---------------- */
type CaptchaAction =
  | { kind: "addEntity"; name: string; desc: string }
  | { kind: "addRole"; roleName: string; description: string; roleType: "" | "viewer" | "editor" };



  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [captchaAction, setCaptchaAction] = React.useState<CaptchaAction | null>(null);

  const runAfterCaptcha = React.useCallback(async () => {
    if (!captchaAction) return;
    switch (captchaAction.kind) {
      // case "openAddUser":
      //   setAddOpen(true);
      //   break;

     case "addEntity":
  try {
    await createEntity({
      name: captchaAction.name,
      description: captchaAction.desc,
    });
    setEntityName("");
    setEntityDesc("");
    await reloadEntities();
    toast.success(t("Entity created successfully"));
  } catch (e: any) {
    console.error("Failed adding entity", e);
    const msg = e?.response?.data?.message || t("Failed to create entity");
    toast.error(msg);
  }
  break;


    case "addRole":
  try {
   await createRole({
  name: captchaAction.roleName,
  description: captchaAction.description,
  type: captchaAction.roleType || null,   // <-- FIX
});


          setRoleName("");
          setRoleDesc("");
          await reloadRoles();
          toast.success(t("Role created successfully"));
        } catch (e: any) {
          console.error("Failed to create role", e);
          const msg = e?.response?.data?.message || t("Failed to create role");
          toast.error(msg);
        }
        break;
    }
    setCaptchaAction(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [captchaAction]);

  /* ----------- Loaders ----------- */
  const reloadUsers = React.useCallback(async () => {
    try {
      const [usersRes, assigns] = await Promise.all([listUsers({ page: 1, pageSize: 100 }), listAssignments()]);
      const byUser = new Map(assigns.map(a => [a.user_id, a]));
     const mapped: UserRow[] = usersRes.data.map((u: ApiUserRow, idx) => {
  const a = byUser.get(u.id);
  return {
    id: u.id,
    sr: idx + 1,
    username: u.username,
    full_name: u.fullName,
    email: u.email,
    user_type: u.userType === "LDAP" ? "ldap" : "local",

    entities: a
      ? a.entity_ids.length === 0
        ? t("(global)")
        : a.entities.join(", ")
      : "-",

    role: a?.role || "-",

    
    status: (u.status as "active" | "disabled"),
  };
});

      setRows(mapped);
    } catch (e) {
      console.error("Failed to load users", e);
      setRows([]);
      toast.error(t("Failed to load users"));
    }
  }, [toast, t]);

  const reloadEntities = React.useCallback(async () => {
  try {
    const es = await getEntities();
    const mapped: EntityRow[] = es.map((e: any, i: number) => ({
      id: e.id,
      sr: i + 1,
      name: e.name,
      description: e.description ?? "",
    }));
    setEntities(mapped);
  } catch (e) {
    console.error("Failed to load entities", e);
    setEntities([]);
    toast.error(t("Failed to load organization"));
  }
}, [toast, t]);

const reloadRoles = React.useCallback(async () => {
  try {
    const apiRoles: ApiRoleRow[] = await getRoles();

    const mapped: RoleRowUI[] = apiRoles.map((r, idx) => ({
      id: r.id,
      sr: idx + 1,
      role: r.name,
      description: r.description ?? "",
      type: r.name.toLowerCase() === "admin" ? null : (r.type ?? "viewer"),
      is_disabled: r.isDisabled,
      is_system: r.isSystem,
    }));

    setRoles(mapped);

    // ✅ preload role pages for display
    const entries = await Promise.all(
      mapped
        .filter(r => !r.is_system)
        .map(async r => {
          try {
            const res = await getRolePages(r.id);
return [
  r.id,
  {
    viewerPages: res.viewerPages || [],
    editorPages: res.editorPages || [],
  },
] as const;

          } catch {
return [r.id, { viewerPages: [], editorPages: [] }] as const;
          }
        })
    );

    setRolePagesMap(Object.fromEntries(entries));
  } catch (e) {
    console.error("Failed to load roles", e);
    setRoles([]);
    toast.error(t("Failed to load roles"));
  }
}, [toast, t]);

  React.useEffect(() => {
    reloadUsers();
    reloadEntities();
    reloadRoles();
    reloadAssignments();
  }, [reloadUsers, reloadEntities, reloadRoles, reloadAssignments]);

  /* ----------- Search + paging ----------- */
  const filterMatch = (s: string, q: string) => s.toLowerCase().includes(q);
 const filteredUsers = React.useMemo(() => {
  const q = search.trim().toLowerCase();
  const base = !q
    ? rows
    : rows.filter((r) =>
        [r.username, r.full_name, r.email, r.user_type, r.status]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );

  return sortFn(base, sortBy as keyof UserRow);
}, [rows, search, sortBy, sortDir]);

  const pagedUsers = React.useMemo(() => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredUsers, page, rowsPerPage]);

 const filteredEntities = React.useMemo(() => {
  const q = search.trim().toLowerCase();
  const base = !q
    ? entities
    : entities.filter(
        (e) =>
          filterMatch(e.name, q) ||
          filterMatch(e.description ?? "", q)
      );

  return sortFn(base, sortBy as keyof EntityRow);
}, [entities, search, sortBy, sortDir]);

  const pagedEntities = React.useMemo(() => filteredEntities.slice(entityPage * entityRpp, entityPage * entityRpp + entityRpp), [filteredEntities, entityPage, entityRpp]);

 const filteredRoles = React.useMemo(() => {
  const q = search.trim().toLowerCase();
  const base = !q
    ? roles
    : roles.filter(
        (r) =>
          filterMatch(r.role, q) ||
filterMatch(r.description, q) ||
filterMatch(r.type === "viewer" ? "Read Only Access" : (r.type ?? ""), q)

      );

  return sortFn(base, sortBy as keyof RoleRowUI);
}, [roles, search, sortBy, sortDir]);

  const pagedRoles = React.useMemo(() => filteredRoles.slice(rolePage * roleRpp, rolePage * roleRpp + roleRpp), [filteredRoles, rolePage, roleRpp]);

  const byUserId = React.useMemo(() => new Map(assignments.map(a => [a.user_id, a])), [assignments]);
  const rawAssigned = React.useMemo(() => assignments.filter(a => (a.role_id && String(a.role_id).length > 0) || (a.entity_ids && a.entity_ids.length > 0)), [assignments]);
  
  

  const searchQ = search.trim().toLowerCase();
  const assignedFiltered = React.useMemo(() => {
  const base = !searchQ
    ? rawAssigned
    : rawAssigned.filter((a) =>
        a.user.toLowerCase().includes(searchQ) ||
        a.entities.join(", ").toLowerCase().includes(searchQ) ||
        a.role.toLowerCase().includes(searchQ)
      );

  return sortFn(base, sortBy as keyof AssignmentRow);
}, [rawAssigned, searchQ, sortBy, sortDir]);

 

  const assignedPaged   = React.useMemo(() => assignedFiltered.slice(assignedPage * assignedRpp, assignedPage * assignedRpp + assignedRpp), [assignedFiltered, assignedPage, assignedRpp]);
  
  /* ----------- Actions ----------- */

  // delete selected entities
const handleDeleteEntities = async () => {
  try {
    await Promise.all(selectedEntities.map((id) => deleteEntity(id)));

    toast.success(t("Entities deleted"));
   setSelectedEntities([]);
setEntityPage(0);
reloadEntities();

  } catch {
    toast.error(t("Failed to delete entities"));
  }
};

// delete selected roles
const handleDeleteRoles = async () => {
  try {
    const deletableRoles = roles
      .filter((r) => selectedRoles.includes(r.id) && !r.is_system)
      .map((r) => r.id);

    if (!deletableRoles.length) {
      toast.warning("No deletable roles selected");
      return;
    }

    await Promise.all(deletableRoles.map((id) => deleteRole(id)));

    toast.success("Role(s) deleted successfully");
    setSelectedRoles([]);
    reloadRoles();
  } catch (err: any) {
    toast.error("Failed to delete roles");
  }
};






  const handleToggleUser = async (r: UserRow) => {
    const next: "active" | "disabled" = r.status === "disabled" ? "active" : "disabled";
    try {
      await setUserStatus(r.id, next);
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
      toast.success(`${next === "disabled" ? t("User disabled") : t("User enabled")}: ${r.username}`);
    } catch (e: any) {
      console.error("Failed to set user status", e);
      toast.error(e?.message || t("Failed to update user"));
    }
  };

  // ——— Captcha-gated wrappers ———
const openAddUser = () => {
  setAddOpen(true);
};

  const requestAddEntity = () => {
    const name = entityName.trim(), desc = entityDesc.trim();
    if (!name || !desc) return;
    setCaptchaAction({ kind: "addEntity", name, desc });
    setCaptchaOpen(true);
  };

 const requestAddRole = () => {
  const rn = roleName.trim();
  const rd = roleDesc.trim();
if (!rn || !rd) return;

setCaptchaAction({
  kind: "addRole",
  roleName: rn,
  description: rd,
  roleType: "",   // default
});


  setCaptchaOpen(true);
};

// NEW: open update user modal
const openUpdateUser = (row: UserRow) => {
  setUpdateUserModal({
    open: true,
    row: {
      ...row,
      userType: row.user_type === "ldap" ? "LDAP" : "Local",
    },
  });
};


 const openUpdateEntity = (row: EntityRow) => {
  setEntityModal({
    open: true,
    row: {
      id: row.id,
      name: row.name,
      description: row.description,
    },
  });
};


  const openUpdateAssign = (a: AssignmentRow) => {
    const edit: AssignEditRow = {
      userId: a.user_id,
      username: a.user,
      roleId: a.role_id,
      entityIds: a.entity_ids ?? [],
     
    };
    setAssignModal({ open: true, row: edit });
  }
// const openAccessPages = async (a: AssignmentRow) => {
//   try {
//     const res = await api.get(`/api/page-access/${a.user_id}`);

//     setAccessDialog({
//       open: true,
//       user_id: a.user_id,
//       username: a.user,
//       selectedPages: res.pages || [],
//     });
//   } catch (err) {
//     console.error("Failed to load page access", err);

//     setAccessDialog({
//       open: true,
//       user_id: a.user_id,
//       username: a.user,
//       selectedPages: [],
//     });
//   }
// };





  const handleTabChange = (_e: React.MouseEvent<HTMLElement>, next: TabKey | null) => {
  if (!next) return;

setTab(next);
setSortBy(null);
setSortDir("asc");


  // clear selections when switching tabs
  setSelectedEntities([]);
  setSelectedRoles([]);
  setSelectedUsers([]);

};


  /* ---------- Render ---------- */
  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card sx={{ ...CARD_SX, width: "100%", minWidth: 0, mx: 0, position: "relative" }}>
          {/* header */}
          <Box sx={{ px: UI.headerPx, py: UI.headerPy, borderBottom: `1px solid ${vars.border}`, display: "grid", alignItems: "center", gridTemplateColumns: "1fr auto 1fr", columnGap: UI.gap }}>
            <Box />
            <ToggleButtonGroup value={tab} exclusive onChange={handleTabChange}
              sx={{ justifySelf: "center", p: 0.5, borderRadius: 999, border: `1px solid ${vars.border}`, bgcolor: vars.bgApp, "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 } }}>
             {[
  { key: "entity", label: t("Entity") },
  { key: "role",   label: t("Role") },
  { key: "users",  label: t("Users") },
  { key: "assign", label: t("Assignment") },
].map(({ key, label }) => (
  <ToggleButton key={key} value={key} disableRipple sx={pillSx}>
    {label}
  </ToggleButton>
))}

            </ToggleButtonGroup>
            <Box sx={{ justifySelf: "end", display: "flex", alignItems: "center", gap: UI.gap }}>
              <TextField
                value={search}
                onChange={(e) => { 
  setSearch(e.target.value); 
  setPage(0); 
  setEntityPage(0); 
  setRolePage(0); 
  setAssignedPage(0); 
}}

                placeholder={t("Search…")}
                size="small"
                sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                InputProps={{ startAdornment: (<InputAdornment position="start" sx={{ mr: 0.25 }}><SearchIcon sx={{ fontSize: UI.icon, color: vars.textDim }} /></InputAdornment>) }}
              />
            </Box>
          </Box>

          {/* toolbars */}
         {tab === "users" && (
 <Box
  sx={{
    display: "flex",
    justifyContent: "flex-end",
    gap: 1,
    px: 1.25,   // ✅ left/right spacing
    pt: 1,      // ✅ top spacing
    pb: 0.5,    // ✅ bottom spacing
  }}
>

   {selectedUsers.length > 0 && (
  <Button
    startIcon={<DeleteIcon />}
    variant="outlined"
    color="error"
    sx={{ textTransform: "none", fontWeight: 700 }}
    onClick={async () => {
  try {
    const ids = [...selectedUsers].filter((id) => !!id);   // ensure no undefined
    if (!ids.length) return;

    // prevent admin delete
    const adminBlocked = rows
      .filter((r) => ids.includes(r.id))
      .some((r) => r.username.toLowerCase() === "isroadmin");

    if (adminBlocked) {
      toast.error("Admin user cannot be deleted");
      return;
    }
console.log("Deleting IDs ==> ", ids);

    // call delete once per id
    for (const id of ids) {
      await deleteUser(id);
    }

    toast.success("User(s) deleted successfully");
    setSelectedUsers([]);
    await reloadUsers();
    await reloadAssignments();
  } catch (err) {
    console.error("DELETE ERR ===>", err);
    toast.error("Failed to delete users");
  }
}}

  >
    {t("Delete")}
  </Button>
)}


   <Button
  startIcon={<AddIcon />}
  variant="contained"
  onClick={openAddUser}
>
  {t("Add User")}
</Button>


  </Box>
)}


          {tab === "entity" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, pt: 1, pb: 0.5, flexWrap: "wrap" }}>
              <Box sx={{ fontWeight: 700, mr: 1 }}>{t("Add New Entity")}</Box>
              <TextField placeholder={t("Entity name")} value={entityName} onChange={(e) => setEntityName(e.target.value)} size="small" sx={{ width: 260, ...compactCtrlSx }} />
              <TextField placeholder={t("Entity Description")} value={entityDesc} onChange={(e) => setEntityDesc(e.target.value)} size="small" sx={{ width: 320, ...compactCtrlSx }} />
            <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
  <Button
    startIcon={<DeleteIcon />}
    variant="outlined"
    color="error"
    disabled={!selectedEntities.length}
    onClick={() => setConfirmOpen("entity")}

    sx={{ textTransform: "none", fontWeight: 700 }}
  >
    {t("Delete")}
  </Button>

  <Button
    startIcon={<AddIcon />}
    variant="contained"
    onClick={requestAddEntity}
    disabled={!entityName.trim() || !entityDesc.trim()}
  >
    {t("Add")}
  </Button>
</Box>

            </Box>
          )}

          {tab === "role" && (
        <Box
  sx={{
    display: "grid",
    gridTemplateColumns: "100px 260px 320px 1fr",
    alignItems: "center",
    gap: 1,
    px: 1.25,
    pt: 1,
    pb: 0.5,
  }}
>

              <Box sx={{ fontWeight: 700, mr: 1 }}>{t("Add Role")}</Box>
              <TextField placeholder={t("Role name")} value={roleName} onChange={(e) => setRoleName(e.target.value)} size="small" sx={{ width: "100%", ...compactCtrlSx }} />
            
              <TextField
  placeholder={t("Role description")}
  value={roleDesc}
  onChange={(e) => setRoleDesc(e.target.value)}
  size="small"
  sx={{ width: "100%", ...compactCtrlSx }}
/>

             <Box sx={{ justifySelf: "end", display: "flex", gap: 1 }}>
{/* <FormControl size="small" sx={{ width: 200 }}>
  <Select
    value={roleType}
    onChange={(e) => setRoleType(e.target.value as "viewer" | "editor")}
    disabled={roleName.trim().toLowerCase() === "admin"}
    displayEmpty
renderValue={(v) => {
  if (!v) return "Role type";
  return v === "viewer" ? "Read Only Access" : "Editor";
}}    sx={{
      ...compactCtrlSx,
      "& .MuiOutlinedInput-root": {
        height: "39px",
        display: "flex",
        alignItems: "center",
      },
    }}
  >
   <MenuItem disabled value="">
      <span style={{ color: vars.textDim }}>Role type</span>
    </MenuItem>

    <MenuItem value="viewer">{t("Read Only Access")}</MenuItem>
    <MenuItem value="editor">{t("Editor")}</MenuItem>
  </Select>
</FormControl> */}





  <Button
    startIcon={<DeleteIcon />}
    variant="outlined"
    color="error"
    disabled={!hasDeletableRoleSelected}

    onClick={() => setConfirmOpen("role")}

    sx={{ textTransform: "none", fontWeight: 700 }}
  >
    {t("Delete")}
  </Button>

  <Button
  startIcon={<AddIcon />}
  variant="contained"
disabled={!roleName.trim() || !roleDesc.trim()}
  onClick={requestAddRole}
>
  {t("Add")}
</Button>
</Box>

            </Box>
          )}

          {/* body */}
         <Box
  sx={{
    flex: 1,
    minHeight: 0,
    height: "100%",          // ✅ IMPORTANT
    px: 0,
    pt: 2,
    pb: 1,
  }}
>


<Box
  sx={{
    flex: 1,
    minHeight: 0,
    height: "100%",          // ✅ IMPORTANT
    display: "flex",
    flexDirection: "column",
    borderRadius: 1,
  }}
>

<Box
  sx={{
    flex: 1,
    minHeight: 0,
    height: "100%",
    overflow: "hidden",   // ✅ STOP SCROLL HERE
    width: "100%",
    boxSizing: "border-box",
    px: 0,
  }}
>



{tab === "users" && (
<DarkUsersTable
  rows={pagedUsers}
  columns={COLUMNS.map(c => ({ ...c, label: t(c.label) }))}
  onToggle={handleToggleUser}
  onUpdateUser={openUpdateUser}              // ✅ correct prop
  selected={selectedUsers}
  onSelect={toggleUserSelect}
  onSelectAll={() => {
  const ids = filteredUsers.map((u) => u.id);
  setSelectedUsers(
    ids.every((id) => selectedUsers.includes(id)) ? [] : ids
  );
}}

  onSort={toggleSort}
  sortIcon={sortIcon}
/>

)}

              {tab === "entity" && (
  <Box
    sx={{
      height: "100%",          // ✅ REQUIRED
      overflowY: "auto",       // ✅ SCROLL ENABLED
      overflowX: "auto",
      ...SCROLLER_SX,
    }}
  >

                    <Box sx={{
                      position: "sticky", top: 0, zIndex: 1, display: "grid",
                      gridTemplateColumns: gridTemplate([
  { width: 60 },   // checkbox
  { width: 120 },  // Sr No
  { width: 220, flex: 1 },
  { width: 220, flex: 1 },
  { width: 200 },
]),

                      bgcolor: theadBg as any, borderBottom: `1px solid ${vars.border}`,
                    }}>
                     {
                     [
 <Checkbox
  size="small"
  checked={
    pagedEntities.length > 0 &&
    pagedEntities.every((e) => selectedEntities.includes(e.id))
  }
  indeterminate={
    selectedEntities.length > 0 &&
    !pagedEntities.every((e) => selectedEntities.includes(e.id))
  }
  onChange={() => {
    const ids = pagedEntities.map((e) => e.id);
    setSelectedEntities(
      ids.every((id) => selectedEntities.includes(id)) ? [] : ids
    );
  }}
/>
,
  t("Sr No"),
  t("Entity Name"),
  t("Description"),
  t("Action"),
].map((h, i) => (
  <Box
  onClick={() =>
    h !== t("Action") && toggleSort(
      h === t("Entity Name") ? "name" :
      h === t("Description") ? "description" :
      "sr"
    )
  }
  sx={{
    px: 1.25,
    py: 1,
    fontWeight: 700,
    fontSize: 13,
    cursor: h !== t("Action") ? "pointer" : "default",
    color: theadText as any,
    textAlign: "center",
  }}
>
  {h}
  {sortIcon(
    h === t("Entity Name") ? "name" :
    h === t("Description") ? "description" :
    "sr"
  )}
</Box>

))}

                    </Box>

                    {pagedEntities.map((e, idx) => (
                      
                     <Box key={e.id} sx={{
  display: "grid",
  gridTemplateColumns: gridTemplate([
    { width: 60 },   // checkbox
    { width: 120 },  // Sr No
    { width: 220, flex: 1 },
    { width: 220, flex: 1 },
    { width: 200 },
  ]),
  borderBottom: `1px solid ${vars.border}`, bgcolor: "transparent", alignItems: "center",
}}>
  {/* checkbox */}
  <Box sx={{ textAlign: "center" }}>
    <Checkbox
      checked={selectedEntities.includes(e.id)}
      onChange={() => toggleEntitySelect(e.id)}
      size="small"
    />
  </Box>

                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{entityPage * entityRpp + idx + 1}</Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{e.name}</Box>
                      <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
  {e.description || "-"}
</Box>



                        <Box sx={{ px: 1.25, py: 0.75, textAlign: "center", display: "flex", gap: 1, justifyContent: "center" }}>
                          <Button size="small" variant="contained"
                            sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", color: "#fff", "&:hover": { bgcolor: "#6b46f1" } }}
                            onClick={() => openUpdateEntity(e)}>
                            {t("Edit")}
                          </Button>
                        </Box>
                      </Box>
                    ))}

                    {!entities.length && <Box sx={{ px: 1.25, py: 2, color: vars.textDim, textAlign: "center" }}>{t("No data.")}</Box>}
                  </Box>
                )}

{tab === "role" && (
  <Box
    sx={{
      height: "100%",
      overflowY: "auto",
      overflowX: "hidden",   // ✅ STOP horizontal scroll
      ...SCROLLER_SX,
    }}
  >


                    <Box sx={{
                      position: "sticky", top: 0, zIndex: 1, display: "grid",
gridTemplateColumns: gridTemplate([
  { width: 50 },     // checkbox
  { width: 70 },     // No
  { width: 180 },    // Role Name
  { width: 320, flex: 1 },  // Description
  { width: 160 },    // Privileges (View button)
  { width: 260 },    // Action (Privileges + Enable/Disable)
]),


                      bgcolor: theadBg as any, borderBottom: `1px solid ${vars.border}`,
                    }}>

                     

                      {[
  <Checkbox
  size="small"
  checked={
    pagedRoles.length > 0 &&
    pagedRoles
      .filter((r) => !r.is_system)
      .every((r) => selectedRoles.includes(r.id))
  }
  indeterminate={
    selectedRoles.length > 0 &&
    !pagedRoles
      .filter((r) => !r.is_system)
      .every((r) => selectedRoles.includes(r.id))
  }
  onChange={() => {
    const ids = pagedRoles
      .filter((r) => !r.is_system)
      .map((r) => r.id);

    setSelectedRoles(
      ids.every((id) => selectedRoles.includes(id)) ? [] : ids
    );
  }}
/>
,
  t("No"),
  t("Role name"),
  t("Role description"),
    // t("Role Type"),     
    t("Privileges"), 

  t("Action"),
].map((h, i) => (
  <Box key={i}

    sx={{
      px: 0.5,
      py: 1,
      fontWeight: 700,
      fontSize: 13,
      color: theadText as any,
      textAlign: "center",
    }}
  >
    {h}
  </Box>
))}

                    </Box>

{pagedRoles.map((r, idx) => (
  <Box
    key={r.id}
    sx={{
      display: "grid",
  gridTemplateColumns: gridTemplate([
  { width: 50 },     
  { width: 70 },     
  { width: 180 },    
  { width: 320, flex: 1 },  
  { width: 160 },    
  { width: 260 },    
]),

      width: "100%",        // ✅ FORCE FIT
      minWidth: "100%",     // ✅ KILLS SIDE SCROLL
      boxSizing: "border-box",

      borderBottom: `1px solid ${vars.border}`,
      alignItems: "center",
      bgcolor: "transparent",
    }}
  >

  {/* checkbox */}
  <Box sx={{ textAlign: "center" }}>
    <Checkbox
  disabled={r.is_system === 1}
  checked={selectedRoles.includes(r.id)}
  onChange={() => toggleRoleSelect(r.id)}
/>

  </Box>

                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{rolePage * roleRpp + idx + 1}</Box>
                     <Box
  sx={{
    px: 1.25,
    py: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  }}
>
  {r.role} {r.is_disabled && !r.is_system ? t("(disabled)") : ""}
</Box>


<Box
  sx={{
    px: 1.25,
    py: 1,
    textAlign: "center",
    fontSize: 13,
    color: vars.textDim,
    whiteSpace: "normal",
    wordBreak: "break-word",
    lineHeight: "18px",
  }}
>
  {r.description || "-"}
</Box>

{/* Privileges column (View button) */}
<Box
  sx={{
    px: 0.75,
    py: 0.75,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }}
>
  <Button
    size="small"
    variant="outlined"
    sx={{
      minWidth: 90,
      height: 28,
      fontSize: 12,
      textTransform: "none",
      fontWeight: 700,
      borderColor: vars.border,
      color: vars.text,
    }}
    onClick={() => openRoleView(r)}
  >
    View
  </Button>
</Box>

                        {/* <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
  {r.type === "viewer"
    ? "Read Only Access"
    : r.type === "editor"
    ? "Editor"
    : "-"}
</Box> */}
{/* Access Pages column */}
{/* <Box
  sx={{
    px: 0.75,
    py: 0.75,
    fontSize: 12,
    color: vars.textDim,
    display: "grid",
    gridTemplateColumns: "1fr 1fr",   // ✅ 2 per row
    rowGap: 0.5,
    columnGap: 1,
    justifyItems: "center",
    textAlign: "center",
  }}
>
  {r.is_system ? (
  "--"
) : (
  <>
    <Box sx={{ fontWeight: 700, color: vars.text }}>Write:</Box>
    {(rolePagesMap[r.id]?.editorPages || []).length ? (
      (rolePagesMap[r.id]?.editorPages || []).map((p) => (
        <Box key={"w-" + p} title={p}>{p}</Box>
      ))
    ) : (
      <Box>-</Box>
    )}

    <Box sx={{ fontWeight: 700, color: vars.text, mt: 1 }}>Read:</Box>
    {(rolePagesMap[r.id]?.viewerPages || []).length ? (
      (rolePagesMap[r.id]?.viewerPages || []).map((p) => (
        <Box key={"r-" + p} title={p}>{p}</Box>
      ))
    ) : (
      <Box>-</Box>
    )}
  </>
)}

</Box> */}



{/* Action column */}
<Box
  sx={{
    px: 0.75,
    py: 0.75,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
  }}
>
  {!r.is_system && (
    <>
      <Button
        size="small"
        variant="outlined"
        sx={{
          minWidth: 110,
          height: 28,
          fontSize: 12,
          textTransform: "none",
          fontWeight: 700,
          borderColor: vars.border,
          color: vars.text,
        }}
        onClick={() => openRoleAccess(r)}
      >
        {t("Privileges")}
      </Button>
{/* 
      <Button
        size="small"
        variant="contained"
        sx={{
          minWidth: 80,
          height: 28,
          fontSize: 12,
          textTransform: "none",
          fontWeight: 700,
          bgcolor: r.is_disabled ? "#2e7d32" : "#ef4a4a",
        }}
        onClick={() => toggleRole(r)}
      >
        {t(r.is_disabled ? "Enable" : "Disable")}
      </Button> */}
    </>
  )}
</Box>


                      </Box>
                    ))}

                    {!roles.length && <Box sx={{ px: 1.25, py: 2, color: vars.textDim, textAlign: "center" }}>{t("No data.")}</Box>}
                  </Box>
                )}

               {tab === "assign" && (
  // <Box sx={{ width: "100%" }}>
  
<Box
  sx={{
    height: "100%",
    overflowY: "auto",     // ✅ SCROLL HERE
    overflowX: "auto",
    ...SCROLLER_SX,
  }}
>
  {/* Header */}
  <Box
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 2,
      display: "grid",
      gridTemplateColumns: gridTemplate([
        { width: 75 },
        { width: 180, flex: 1 },
        { width: 180, flex: 1 },
        { width: 180, flex: 1 },
       
        { width: 160 },
      ]),
      bgcolor: theadBg as any,
      borderBottom: `1px solid ${vars.border}`,
    }}
  >
    {[t("No"), t("User"), t("Entity"), t("Role"),  t("Action")].map(h => (
      <Box
        key={h}
        sx={{
          px: 1.25,
          py: 1,
          fontWeight: 700,
          fontSize: 13,
          textAlign: "center",
          color: theadText as any,
        }}
      >
        {h}
      </Box>
    ))}
  </Box>

    {/* Rows */}
    {assignedPaged.map((a, idx) => {
      const i = assignedPage * assignedRpp + idx + 1;
      return (
        <Box
  key={a.id}
  sx={{
    display: "grid",
  gridTemplateColumns: gridTemplate([
  { width: 75 },             // No
  { width: 180, flex: 1 },   // User
  { width: 180, flex: 1 },   // Entity
  { width: 180, flex: 1 },   // Role
  { width: 160 },            // Action
]),
    width: "max-content",
    minWidth: "100%",
           // 👈 ADD
    boxSizing: "border-box",  // 👈 ADD
    borderBottom: `1px solid ${vars.border}`,
       mx: 0,       // 👈 remove left drag
  px: 0,
  
    bgcolor: "transparent",
  }}
>

         {/* No */}
<Box sx={{ textAlign: "center" }}>{i}</Box>

{/* User */}
<Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
  {a.user}
</Box>

{/* Entity */}
<Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
  {a.entities?.length
    ? a.entities.join(", ")
    : t("(global)")}
</Box>

{/* Role */}
<Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
  {a.role || "-"}
</Box>

{/* Access Pages (NEW) */}
{/* {(() => {
  // const aRow = assignments.find((x) => x.user === a.user);
  const aRow = assignments.find((x) => x.user_id === a.user_id);

  const pages = Array.isArray((aRow as any)?.pageAccess)
    ? (aRow as any).pageAccess
    : [];

  return (
    <Box
      sx={{
        px: 1.25,
        py: 1,
        textAlign: "center",
        fontSize: 13,
        color: vars.text,
        whiteSpace: "normal !important",
        wordBreak: "break-word",
        lineHeight: "18px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        overflow: "visible",
      }}
    >
      {pages.length ? (
       pages.map((p: string, i: number) => (
  <span key={i}>{p}{i !== pages.length - 1 ? "," : ""}</span>
))

      ) : (
        "-"
      )}
    </Box>
  );
})()} */}


{/* Action */}
<Box
  sx={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
    py: 0.5,
  }}
>
  <Button
    size="small"
    variant="contained"
    onClick={() => openUpdateAssign(a)}
    sx={{
      minWidth: 70,
      height: 28,
      fontSize: 12,
      textTransform: "none",
      fontWeight: 700,
      bgcolor: "#7C57F2",
      "&:hover": { bgcolor: "#6b46f1" },
    }}
  >
    {t("Edit")}
  </Button>

  {/* <Button
    size="small"
    variant="outlined"
    onClick={() => openAccessPages(a)}
    sx={{
      minWidth: 100,
      height: 28,
      fontSize: 12,
      textTransform: "none",
      fontWeight: 700,
      borderColor: vars.border,
      color: vars.text,
      "&:hover": {
        borderColor: vars.text,
        bgcolor: "transparent",
      },
    }}
  >
    {t("Access Pages")}
  </Button> */}
</Box>

</Box>


     
      );
    })}

    {!assignedFiltered.length && (
      <Box sx={{ px: 1.25, py: 2, color: vars.textDim, textAlign: "center" }}>
        {t("No assigned users.")}
      </Box>
    )}
  </Box>
)}

              </Box>
            </Box>
          </Box>

          {/* paginations */}
          {tab === "users"  && <Pagination count={filteredUsers.length}   page={page}        setPage={setPage}        rpp={rowsPerPage} setRpp={setRowsPerPage} />}

          {tab === "entity" && (
            <Pagination
              count={filteredEntities.length}
              page={entityPage}
              setPage={setEntityPage}
              rpp={entityRpp}
              setRpp={setEntityRpp}
            />
          )}


          {tab === "role" && (
            <Pagination
              count={filteredRoles.length}
              page={rolePage}
              setPage={setRolePage}
              rpp={roleRpp}
              setRpp={setRoleRpp}
            />
          )}

         
        </Card>
      </Box>
      {tab === "assign" && (
  <Pagination
    count={assignedFiltered.length}
    page={assignedPage}
    setPage={setAssignedPage}
    rpp={assignedRpp}
    setRpp={setAssignedRpp}
  />
)}


      {/* Modals (Add + Update) */}
   {/* Add User */}
<AddUserModal
  open={addOpen}
  onClose={() => setAddOpen(false)}
  entities={entities.map((e) => ({ id: e.id, name: e.name }))}
  roles={roles.map((r) => ({ id: r.id, name: r.role }))}
  onCreated={async () => {
    setAddOpen(false);

    // ✅ refresh both users & assignments
    await reloadUsers();
    await reloadAssignments();

    setAssignedPage(0); // optional but nice UX
    toast.success(t("User created successfully"));
  }}
/>


{updateUserModal.row && (
  <UpdateUserModal
    open={updateUserModal.open}
    row={updateUserModal.row}
    entities={entities.map((e) => ({ id: e.id, name: e.name }))}      // 👈 required
    roles={roles.map((r) => ({ id: r.id, name: r.role }))}            // 👈 required
    onClose={() => setUpdateUserModal({ open: false, row: null })}
    onUpdated={async () => {
      await reloadUsers();
      toast.success(t("User updated"));
      setUpdateUserModal({ open: false, row: null });
    }}
  />
)}








      <UpdateEntityModal
        open={entityModal.open}
        row={entityModal.row}
        onClose={() => setEntityModal({ open: false, row: null })}
        onUpdated={async () => {
          await reloadEntities();
          toast.success(t("Entity updated"));
        }}
        onDeleted={async () => {
          await reloadEntities();
          toast.success(t("Entity deleted"));
        }}
      />

      {assignModal.row && (
        <UpdateAssignmentModal
          open={true}
          row={assignModal.row}
          roles={roles.map<ModalRole>((r) => ({
            id: r.id,
            name: r.role,
            disabled: !!r.is_disabled,
          }))}
         entities={entities.map<ModalEntity>((e) => ({
  id: e.id,
  name: e.name,
}))}

          onClose={() => setAssignModal({ open: false, row: null })}
          onUpdate={async (u: AssignUpdated) => {
            const payload = {
              roleId: u.roleId || null,
              entityIds: (u.entityIds || []).filter((id) => id !== "0"),
              
            };
            try {
              await updateAssignmentForUser(u.userId, payload);
              await Promise.all([reloadAssignments(), reloadUsers()]);
            
              setAssignedPage(0);
              toast.success(t("Assignment updated"));
            } catch (err: any) {
              console.error("Failed to update assignment", err);
              const msg = err?.response?.data?.message || t("Failed to update assignment");
              toast.error(msg);
            }
          }}
        />
      )}

      {/* CAPTCHA gate */}
      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => {
          setCaptchaOpen(false);
          setCaptchaAction(null);
        }}
        onOk={async () => {
          setCaptchaOpen(false);
          await runAfterCaptcha();
        }}
      />
<Dialog open={!!confirmOpen} onClose={() => setConfirmOpen(null)}>
  <DialogTitle>{t("Confirm Delete")}</DialogTitle>

  <DialogContent>
    {t("Are you sure you want to delete the selected")}{" "}
{confirmOpen === "entity" ? t("entities") : t("roles")}?

  </DialogContent>
  <DialogActions>
    <Button onClick={() => setConfirmOpen(null)}>Cancel</Button>
    <Button
      color="error"
      variant="contained"
      onClick={async () => {
        if (confirmOpen === "entity") await handleDeleteEntities();
        if (confirmOpen === "role") await handleDeleteRoles();
        setConfirmOpen(null);
      }}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>
{/* <AccessPagesDialog
  open={accessDialog.open}
  username={accessDialog.username}
  selectedPages={accessDialog.selectedPages}
  onClose={() =>
    setAccessDialog({
      open: false,
        user_id: "",

      username: "",
      selectedPages: [],
    })
  }
 onSave={async ({ pages }) => {
  // Determine assigned role type from assignments array
  const a = assignments.find((x) => x.user_id === accessDialog.user_id)
;
  const roleType = a?.role?.toLowerCase() === "editor" ? "editor" : "viewer";

await updatePageAccess(accessDialog.user_id, {
  pages,
});




// update global map
// const map = JSON.parse(sessionStorage.getItem("pmgt_page_access") || "{}");
// map[accessDialog.username] = pages;
// sessionStorage.setItem("pmgt_page_access", JSON.stringify(map));
// sessionStorage.setItem(
//   "pmgt_page_access",
//   JSON.stringify({ pages })
// );

// notify once
window.dispatchEvent(new Event("pmgt:page-access-updated"));


// window.dispatchEvent(new Event("pmgt:page-access-updated"));


  await reloadAssignments();
  toast.success("Page access updated");

  // close modal
  setAccessDialog({
    open: false,
      user_id: "",

    username: "",
    selectedPages: [],
  });
}}

/>
 */}
{activeRoleForAccess && (
  <RoleAccessDialog
    open={roleAccessOpen}
    roleName={activeRoleForAccess.role}
    viewerPages={rolePages.viewerPages}
    editorPages={rolePages.editorPages}
    isDisabled={!!activeRoleForAccess.is_disabled}
    onClose={() => setRoleAccessOpen(false)}
    onDisable={async () => {
      await toggleRole(activeRoleForAccess);
      setRoleAccessOpen(false);
    }}
    onSave={async (payload) => {
      await updateRolePages(activeRoleForAccess.id, payload);

      setRolePagesMap((prev) => ({
        ...prev,
        [activeRoleForAccess.id]: payload,
      }));

      setRoleAccessOpen(false);
      toast.success("Role page access updated");
    }}
  />
)}

<Dialog
  open={viewRoleOpen}
  onClose={() => setViewRoleOpen(false)}
  maxWidth="md"
  fullWidth
>
  <DialogTitle sx={{ fontWeight: 700 }}>
    Pages Access: {viewRolePages.roleName}
  </DialogTitle>

  <DialogContent dividers>
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 3,
      }}
    >
      {/* LEFT SIDE - Read Access */}
      <Box>
        <Box sx={{ fontWeight: 700, mb: 1 }}>Read Access</Box>

        {viewRolePages.viewerPages.length ? (
          viewRolePages.viewerPages.map((p) => (
            <Box key={p} sx={{ fontSize: 13, py: 0.5 }}>
              • {p}
            </Box>
          ))
        ) : (
          <Box sx={{ fontSize: 13, color: vars.textDim }}>
            No Read access pages
          </Box>
        )}
      </Box>

      {/* RIGHT SIDE - Write Access */}
      <Box>
        <Box sx={{ fontWeight: 700, mb: 1 }}>Write Access</Box>

        {viewRolePages.editorPages.length ? (
          viewRolePages.editorPages.map((p) => (
            <Box key={p} sx={{ fontSize: 13, py: 0.5 }}>
              • {p}
            </Box>
          ))
        ) : (
          <Box sx={{ fontSize: 13, color: vars.textDim }}>
            No Write access pages
          </Box>
        )}
      </Box>
    </Box>
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setViewRoleOpen(false)}>Close</Button>
  </DialogActions>
</Dialog>




    </MainLayout>
  );
}

/* small pagination helper (sizes themed like your other pages) */
function Pagination({
  count,
  page,
  setPage,
  rpp,
  setRpp,
}: {
  count: number;
  page: number;
  setPage: (p: number) => void;
  rpp: number;
  setRpp: (n: number) => void;
}) {
  return (
    <Box sx={{ borderTop: `1px solid ${vars.border}` }}>
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rpp}
        onRowsPerPageChange={(e) => {
          setRpp(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          px: 1,
          color: (t) => (t.palette.mode === "light" ? "#fff" : vars.text),
          minHeight: 36,
          "& .MuiTablePagination-toolbar": {
            minHeight: 36,
            p: 0,
            pl: 1,
            pr: 1,
            gap: 0.5,
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
            { fontSize: 13, m: 0, color: vars.text },
          "& .MuiTablePagination-input": { fontSize: 13, m: 0, color: vars.text },
          "& .MuiSelect-select": {
            py: 0,
            px: 1,
            fontSize: 13,
            height: 24,
            display: "flex",
            alignItems: "center",
            bgcolor: vars.bgCtrl,
            borderRadius: 1,
          },
          "& .MuiIconButton-root": { p: 0.25, color: vars.text },
          ".MuiSvgIcon-root": {
            color: (t) => (t.palette.mode === "light" ? "#fff" : vars.text),
            fontSize: 16,
          },
        }}
      />
    </Box>
  );
}
