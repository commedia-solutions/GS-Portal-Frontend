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

/* API */
import {
  listUsers,
  createEntity,
  getEntities,
  getDesignations,
  createDesignation,
  getRoles,
  createRole,
  updateRole,
  listAssignments,
  updateAssignmentForUser,
  setUserStatus,
  type UserRow as ApiUserRow,
  type RoleRow as ApiRoleRow,
  type AccessType,
  type AssignmentListRow,
} from "../../api/iam";

/* Modals */
import AddUserModal from "../../components/Models/AddUserModal";
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
const UI = { ctrlH: 30, font: 13, icon: 16, gap: 0.75, headerPx: 1.25, headerPy: 0.6, searchW: 260, paginationH: 36 } as const;
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
  id: string; sr: number; username: string; full_name: string; email: string;
  user_type: "local" | "ldap"; designation: string; entities: string;
  status: "active" | "disabled";
};
type Column = { key: keyof UserRow | "action"; label: string; width?: number; align?: "left" | "center" | "right"; flex?: number; };
const COLUMNS: Column[] = [
  { key: "sr",        label: "Sr No",     width: 80,  align: "center" },
  { key: "username",  label: "User Id",   width: 140, align: "center" },
  { key: "full_name", label: "Full Name", width: 180, align: "center", flex: 1 },
  { key: "email",     label: "Email",     width: 220, align: "center", flex: 1.2 },
  { key: "user_type", label: "Type",      width: 100, align: "center" },
  { key: "action",    label: "Action",    width: 140, align: "center" },
];

function DarkUsersTable({ rows, columns, onToggle }: {
  rows: UserRow[]; columns: Column[]; onToggle: (r: UserRow) => void;
}) {
  const { t } = useI18n();
  const template = gridTemplate(columns);
  return (
    <Box>
      <Box sx={{ width: "100%", minWidth: 0 }}>
        <Box sx={{ position: "sticky", top: 0, zIndex: 1, display: "grid", gridTemplateColumns: template, bgcolor: theadBg as any, borderBottom: `1px solid ${vars.border}` }}>
          {columns.map((c) => (
            <Box key={String(c.key)} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: theadText as any, textAlign: c.align ?? "center", whiteSpace: "nowrap" }}>
              {t(c.label)}
            </Box>
          ))}
        </Box>

        {rows.map((r, idx) => (
          <Box key={`${r.id}-${idx}`} sx={{ display: "grid", gridTemplateColumns: template, borderBottom: `1px solid ${vars.border}`, bgcolor: "transparent" }}>
            {columns.map((c) => {
              if (c.key === "action") {
                const disabled = r.status === "disabled";
                return (
                  <Box key={`action-${idx}`} sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button size="small" variant="contained"
                      sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25, bgcolor: disabled ? "#555" : "#ef4a4a", color: "#fff", "&:hover": { bgcolor: disabled ? "#666" : "#dd3737" } }}
                      onClick={() => onToggle(r)}>
                      {t(disabled ? "Enable" : "Disable")}
                    </Button>
                  </Box>
                );
              }
              return (
                <Box key={String(c.key)} sx={{ px: 1.25, py: 1, fontSize: 13, textAlign: c.align ?? "center", color: bodyText as any, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
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
type EntityRow = { id: string; sr: number; name: string; designations: { id: string; name: string }[]; };
type RoleRowUI = { id: string; sr: number; role: string; access: AccessType; is_disabled: 0 | 1; is_system: 0 | 1; };
type AssignmentRow = AssignmentListRow;

/* ---------- Page ---------- */
export default function IAM() {
  const { t } = useI18n();
  const toast = useToast();

  type TabKey = "users" | "entity" | "role" | "assign";
  const [tab, setTab] = React.useState<TabKey>("users");
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

  // USERS
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);

  // ENTITIES
  const [entities, setEntities] = React.useState<EntityRow[]>([]);
  const [entityPage, setEntityPage] = React.useState(0);
  const [entityRpp, setEntityRpp] = React.useState(10);
  const [entityName, setEntityName] = React.useState("");
  const [entityDesc, setEntityDesc] = React.useState("");

  // ROLES
  const [roles, setRoles] = React.useState<RoleRowUI[]>([]);
  const [rolePage, setRolePage] = React.useState(0);
  const [roleRpp, setRoleRpp] = React.useState(10);
  const [roleName, setRoleName] = React.useState("");
  const [accessType, setAccessType] = React.useState<"" | AccessType>("");

  // ASSIGNMENTS
  const [assignments, setAssignments] = React.useState<AssignmentRow[]>([]);
  const [assignView, setAssignView] = React.useState<"assigned" | "unassigned">("assigned");
  const [assignedPage, setAssignedPage] = React.useState(0);
  const [assignedRpp, setAssignedRpp] = React.useState(10);
  const [unassignedPage, setUnassignedPage] = React.useState(0);
  const [unassignedRpp, setUnassignedRpp] = React.useState(10);
  const [entityModal, setEntityModal] = React.useState<{ open: boolean; row: EntityUpdateIn | null }>({ open: false, row: null });
  const [assignModal, setAssignModal] = React.useState<{ open: boolean; row: AssignEditRow | null }>({ open: false, row: null });

  /* ---------------- CAPTCHA flow state ---------------- */
  type CaptchaAction =
    | { kind: "openAddUser" }
    | { kind: "addEntity"; name: string; desc: string }
    | { kind: "addRole"; roleName: string; access: AccessType };

  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [captchaAction, setCaptchaAction] = React.useState<CaptchaAction | null>(null);

  const runAfterCaptcha = React.useCallback(async () => {
    if (!captchaAction) return;
    switch (captchaAction.kind) {
      case "openAddUser":
        setAddOpen(true);
        break;

      case "addEntity":
        try {
          const { id } = await createEntity({ name: captchaAction.name });
          await createDesignation(id, { name: captchaAction.desc });
          setEntityName(""); setEntityDesc("");
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
          await createRole({ name: captchaAction.roleName, accessType: captchaAction.access });
          setRoleName(""); setAccessType("");
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
          id: u.id, sr: idx + 1, username: u.username, full_name: u.fullName, email: u.email,
          user_type: u.userType === "LDAP" ? "ldap" : "local",
          designation: a && a.designation?.length ? a.designation.join(", ") : "",
          entities: a ? (a.entity_ids.length === 0 ? t("(global)") : a.entities.join(", ")) : "",
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
      const withDesigs = await Promise.all(
        es.map(async (e: { id: string; name: string }, i: number) => {
          try {
            const des = await getDesignations(e.id);
            return { id: e.id, sr: i + 1, name: e.name, designations: des.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })) } as EntityRow;
          } catch {
            return { id: e.id, sr: i + 1, name: e.name, designations: [] } as EntityRow;
          }
        })
      );
      setEntities(withDesigs);
    } catch (e) {
      console.error("Failed to load entities", e);
      setEntities([]);
      toast.error(t("Failed to load organization"));
    }
  }, [toast, t]);

  const reloadRoles = React.useCallback(async () => {
    try {
      const apiRoles: ApiRoleRow[] = await getRoles();
      const mapped: RoleRowUI[] = apiRoles.map((r, idx) => ({ id: r.id, sr: idx + 1, role: r.name, access: r.accessType, is_disabled: r.isDisabled, is_system: r.isSystem }));
      setRoles(mapped);
    } catch (e) {
      console.error("Failed to load roles", e);
      setRoles([]);
      toast.error(t("Failed to load roles"));
    }
  }, [toast, t]);

  const reloadAssignments = React.useCallback(async () => {
    try {
      const rows = await listAssignments();
      setAssignments(rows);
    } catch (e) {
      console.error("Failed to load assignments", e);
      setAssignments([]);
      toast.error(t("Failed to load assignments"));
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
    if (!q) return rows;
    return rows.filter((r) => [r.username, r.full_name, r.email, r.user_type, r.status].join(" ").toLowerCase().includes(q));
  }, [rows, search]);
  const pagedUsers = React.useMemo(() => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filteredUsers, page, rowsPerPage]);

  const filteredEntities = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entities;
    return entities.filter((e) => filterMatch(e.name, q) || e.designations.some((d) => filterMatch(d.name, q)));
  }, [entities, search]);
  const pagedEntities = React.useMemo(() => filteredEntities.slice(entityPage * entityRpp, entityPage * entityRpp + entityRpp), [filteredEntities, entityPage, entityRpp]);

  const filteredRoles = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => filterMatch(r.role, q) || filterMatch(r.access, q));
  }, [roles, search]);
  const pagedRoles = React.useMemo(() => filteredRoles.slice(rolePage * roleRpp, rolePage * roleRpp + roleRpp), [filteredRoles, rolePage, roleRpp]);

  const byUserId = React.useMemo(() => new Map(assignments.map(a => [a.user_id, a])), [assignments]);
  const rawAssigned = React.useMemo(() => assignments.filter(a => (a.role_id && String(a.role_id).length > 0) || (a.entity_ids && a.entity_ids.length > 0)), [assignments]);
  const rawUnassignedFromAssignments = React.useMemo(() => assignments.filter(a => (!a.role_id || String(a.role_id).length === 0) && (!a.entity_ids || a.entity_ids.length === 0)), [assignments]);
  const usersMissingInAssignments = React.useMemo(
    () => rows.filter((u) => !byUserId.has(u.id)).map<AssignmentRow>((u) => ({
      id: `u-${u.id}`, sr: 0, user_id: u.id, user: u.username, role: "", role_id: "", entities: [], entity_ids: [], designation: [],
    })), [rows, byUserId]);
  const allUnassigned = React.useMemo(() => [...rawUnassignedFromAssignments, ...usersMissingInAssignments], [rawUnassignedFromAssignments, usersMissingInAssignments]);

  const searchQ = search.trim().toLowerCase();
  const assignedFiltered = React.useMemo(() =>
    !searchQ ? rawAssigned :
    rawAssigned.filter((a) => a.user.toLowerCase().includes(searchQ) || a.entities.join(", ").toLowerCase().includes(searchQ) || a.role.toLowerCase().includes(searchQ)
  ), [rawAssigned, searchQ]);
  const unassignedFiltered = React.useMemo(() => !searchQ ? allUnassigned : allUnassigned.filter((a) => a.user.toLowerCase().includes(searchQ)), [allUnassigned, searchQ]);

  const assignedPaged   = React.useMemo(() => assignedFiltered.slice(assignedPage * assignedRpp, assignedPage * assignedRpp + assignedRpp), [assignedFiltered, assignedPage, assignedRpp]);
  const unassignedPaged = React.useMemo(() => unassignedFiltered.slice(unassignedPage * unassignedRpp, unassignedPage * unassignedRpp + unassignedRpp), [unassignedFiltered, unassignedPage, unassignedRpp]);

  /* ----------- Actions ----------- */
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
  const requestOpenAddUser = () => { setCaptchaAction({ kind: "openAddUser" }); setCaptchaOpen(true); };

  const requestAddEntity = () => {
    const name = entityName.trim(), desc = entityDesc.trim();
    if (!name || !desc) return;
    setCaptchaAction({ kind: "addEntity", name, desc });
    setCaptchaOpen(true);
  };

  const requestAddRole = () => {
    const rn = roleName.trim();
    if (!rn || !accessType) return;
    setCaptchaAction({ kind: "addRole", roleName: rn, access: accessType as AccessType });
    setCaptchaOpen(true);
  };

  const openUpdateEntity = (row: EntityRow) => {
    const edit: EntityUpdateIn = { id: row.id, name: row.name, designations: row.designations };
    setEntityModal({ open: true, row: edit });
  };

  const openUpdateAssign = (a: AssignmentRow) => {
    const edit: AssignEditRow = {
      userId: a.user_id,
      username: a.user,
      roleId: a.role_id,
      entityIds: a.entity_ids ?? [],
      designations: [],
    };
    setAssignModal({ open: true, row: edit });
  };

  const handleTabChange = (_e: React.MouseEvent<HTMLElement>, next: TabKey | null) => { if (next) setTab(next); };

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
                { key: "users", label: t("Users") },
                { key: "entity", label: t("Entity") },
                { key: "role",  label: t("Role") },
                { key: "assign", label: t("Assignment") },
              ].map(({ key, label }) => (
                <ToggleButton key={key} value={key} disableRipple sx={pillSx}>{label}</ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Box sx={{ justifySelf: "end", display: "flex", alignItems: "center", gap: UI.gap }}>
              <TextField
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(0); setEntityPage(0); setRolePage(0); setAssignedPage(0); setUnassignedPage(0); }}
                placeholder={t("Search…")}
                size="small"
                sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                InputProps={{ startAdornment: (<InputAdornment position="start" sx={{ mr: 0.25 }}><SearchIcon sx={{ fontSize: UI.icon, color: vars.textDim }} /></InputAdornment>) }}
              />
            </Box>
          </Box>

          {/* toolbars */}
          {tab === "users" && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", px: 1.25, pt: 1, pb: 0.5 }}>
              <Button startIcon={<AddIcon />} variant="contained" onClick={requestOpenAddUser}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#7C57F2", color: "#fff", "&:hover": { bgcolor: "#6b48ea" } }}>
                {t("Add User")}
              </Button>
            </Box>
          )}

          {tab === "entity" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, pt: 1, pb: 0.5, flexWrap: "wrap" }}>
              <Box sx={{ fontWeight: 700, mr: 1 }}>{t("Add New Entity")}</Box>
              <TextField placeholder={t("Entity name")} value={entityName} onChange={(e) => setEntityName(e.target.value)} size="small" sx={{ width: 260, ...compactCtrlSx }} />
              <TextField placeholder={t("Entity Description")} value={entityDesc} onChange={(e) => setEntityDesc(e.target.value)} size="small" sx={{ width: 320, ...compactCtrlSx }} />
              <Box sx={{ ml: "auto" }}>
                <Button startIcon={<AddIcon />} variant="contained" onClick={requestAddEntity}
                  disabled={!entityName.trim() || !entityDesc.trim()}
                  sx={{
                    textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#7C57F2",
                    "&:hover": { bgcolor: "#6b48ea" },
                    "&.Mui-disabled": { bgcolor: vars.bgApp, color: vars.textDim, border: `1px solid ${vars.border}`, boxShadow: "none", opacity: 1 },
                  }}>
                  {t("Add")}
                </Button>
              </Box>
            </Box>
          )}

          {tab === "role" && (
            <Box sx={{ display: "grid", gridTemplateColumns: "auto 260px 260px 1fr", alignItems: "center", gap: 1, px: 1.25, pt: 1, pb: 0.5 }}>
              <Box sx={{ fontWeight: 700, mr: 1 }}>{t("Add Role")}</Box>
              <TextField placeholder={t("Role name")} value={roleName} onChange={(e) => setRoleName(e.target.value)} size="small" sx={{ width: "100%", ...compactCtrlSx }} />
              <FormControl size="small" sx={{ width: "100%" }}>
                <Select
                  value={accessType}
                  onChange={(e) => setAccessType((e.target.value as any) || "")}
                  displayEmpty
                  renderValue={(val) => (val ? (t(val as string)) : t("Role description"))}
                  variant="outlined"
                  sx={{
                    height: `${SEL_H}px`, borderRadius: 1, bgcolor: (tM) => (tM.palette.mode === "dark" ? "#232325" : "#fff"),
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
                    "& .MuiSelect-select": {
                      minHeight: "unset", height: `${SEL_H - 2}px`, lineHeight: `${SEL_H - 2}px`, padding: "0 8px",
                      display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: "26px", fontSize: 12.5,
                    },
                    "& .MuiSvgIcon-root": { fontSize: 14 },
                  }}>
                  <MenuItem disabled value="">{t("Role description")}</MenuItem>
                  <MenuItem value="Admin">{t("Admin")}</MenuItem>
                  <MenuItem value="User">{t("User")}</MenuItem>
                  <MenuItem value="Guest">{t("Guest")}</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ justifySelf: "end" }}>
                <Button startIcon={<AddIcon />} variant="contained" onClick={requestAddRole} disabled={!roleName.trim() || !accessType}
                  sx={{
                    textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" },
                    "&.Mui-disabled": { bgcolor: vars.bgApp, color: vars.textDim, border: `1px solid ${vars.border}`, boxShadow: "none", opacity: 1 },
                  }}>
                  {t("Add")}
                </Button>
              </Box>
            </Box>
          )}

          {/* body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
              <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
                {tab === "users"  && <DarkUsersTable rows={pagedUsers} columns={COLUMNS.map(c => ({ ...c, label: t(c.label) }))} onToggle={handleToggleUser} />}

                {tab === "entity" && (
                  <Box sx={{ width: "100%" }}>
                    <Box sx={{
                      position: "sticky", top: 0, zIndex: 1, display: "grid",
                      gridTemplateColumns: gridTemplate([{ width: 120 }, { width: 220, flex: 1 }, { width: 220, flex: 1 }, { width: 200 }]),
                      bgcolor: theadBg as any, borderBottom: `1px solid ${vars.border}`,
                    }}>
                      {[t("Sr No"), t("Entity Name"), t("Description"), t("Action")].map((h) => (
                        <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: theadText as any, textAlign: "center" }}>{h}</Box>
                      ))}
                    </Box>

                    {pagedEntities.map((e, idx) => (
                      <Box key={e.id} sx={{
                        display: "grid",
                        gridTemplateColumns: gridTemplate([{ width: 120 }, { width: 220, flex: 1 }, { width: 220, flex: 1 }, { width: 200 }]),
                        borderBottom: `1px solid ${vars.border}`, bgcolor: "transparent", alignItems: "center",
                      }}>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{entityPage * entityRpp + idx + 1}</Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{e.name}</Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{e.designations.map((d) => d.name).join(", ")}</Box>
                        <Box sx={{ px: 1.25, py: 0.75, textAlign: "center", display: "flex", gap: 1, justifyContent: "center" }}>
                          <Button size="small" variant="contained"
                            sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", color: "#fff", "&:hover": { bgcolor: "#6b46f1" } }}
                            onClick={() => openUpdateEntity(e)}>
                            {t("Update")}
                          </Button>
                        </Box>
                      </Box>
                    ))}

                    {!entities.length && <Box sx={{ px: 1.25, py: 2, color: vars.textDim, textAlign: "center" }}>{t("No data.")}</Box>}
                  </Box>
                )}

                {tab === "role" && (
                  <Box sx={{ width: "100%" }}>
                    <Box sx={{
                      position: "sticky", top: 0, zIndex: 1, display: "grid",
                      gridTemplateColumns: gridTemplate([{ width: 120 }, { width: 220, flex: 1 }, { width: 220, flex: 1 }, { width: 180 }]),
                      bgcolor: theadBg as any, borderBottom: `1px solid ${vars.border}`,
                    }}>
                      {[t("Sr No"), t("Role name"), t("Role description"), t("Action")].map((h) => (
                        <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: theadText as any, textAlign: "center" }}>{h}</Box>
                      ))}
                    </Box>

                    {pagedRoles.map((r, idx) => (
                      <Box key={r.id} sx={{
                        display: "grid",
                        gridTemplateColumns: gridTemplate([{ width: 120 }, { width: 220, flex: 1 }, { width: 220, flex: 1 }, { width: 180 }]),
                        borderBottom: `1px solid ${vars.border}`, bgcolor: "transparent", alignItems: "center",
                      }}>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{rolePage * roleRpp + idx + 1}</Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                          {r.role} {r.is_disabled && !r.is_system ? t("(disabled)") : ""}
                        </Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{t(r.access)}</Box>
                        <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                          {r.is_system ? (
                            <Box sx={{ fontSize: 13, color: vars.textDim }}>--</Box>
                          ) : (
                            <Button size="small" variant="contained"
                              sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700, bgcolor: r.is_disabled ? "#2e7d32" : "#ef4a4a", "&:hover": { bgcolor: r.is_disabled ? "#1b5e20" : "#dd3737" } }}
                              onClick={() => toggleRole(r)}>
                              {t(r.is_disabled ? "Enable" : "Disable")}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ))}

                    {!roles.length && <Box sx={{ px: 1.25, py: 2, color: vars.textDim, textAlign: "center" }}>{t("No data.")}</Box>}
                  </Box>
                )}

                {tab === "assign" && (
                  <Box sx={{ width: "100%", display: "grid", gap: 1.25 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-start", px: 1, pt: 0.5 }}>
                      <ToggleButtonGroup value={assignView} exclusive onChange={(_, v) => { if (v) setAssignView(v); }}
                        sx={{ p: 0.5, borderRadius: 999, border: `1px solid ${vars.border}`, bgcolor: vars.bgApp, "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 } }}>
                        <ToggleButton value="assigned" disableRipple sx={pillSx}>{t("Already Assigned Users")}</ToggleButton>
                        <ToggleButton value="unassigned" disableRipple sx={pillSx}>{t("Assign New created User")}</ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    <Box sx={{
                      position: "sticky", top: 0, zIndex: 1, display: "grid",
                      gridTemplateColumns: gridTemplate([{ width: 100 }, { width: 260, flex: 1 }, { width: 260, flex: 1 }, { width: 220, flex: 1 }, { width: 140 }]),
                      bgcolor: theadBg as any, borderBottom: `1px solid ${vars.border}`,
                    }}>
                      {[t("No"), t("User"), t("Entity"), t("Role Name"), t("Action")].map((h) => (
                        <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: theadText as any, textAlign: "center" }}>{h}</Box>
                      ))}
                    </Box>

                    {(assignView === "assigned" ? assignedPaged : unassignedPaged).map((a, idx) => {
                      const i = assignView === "assigned" ? assignedPage * assignedRpp + idx + 1 : unassignedPage * unassignedRpp + idx + 1;
                      return (
                        <Box key={a.id} sx={{
                          display: "grid",
                          gridTemplateColumns: gridTemplate([{ width: 100 }, { width: 260, flex: 1 }, { width: 260, flex: 1 }, { width: 220, flex: 1 }, { width: 140 }]),
                          borderBottom: `1px solid ${vars.border}`, bgcolor: "transparent", alignItems: "center",
                        }}>
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{i}</Box>
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{a.user}</Box>
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                            {a.entity_ids.length === 0 ? (assignView === "assigned" ? t("(global)") : "-") : a.entities.join(", ")}
                          </Box>
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{a.role || "-"}</Box>
                          <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                            <Button size="small" variant="contained" onClick={() => openUpdateAssign(a)}
                              sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", color: "#fff", "&:hover": { bgcolor: "#6b46f1" } }}>
                              {t("Update")}
                            </Button>
                          </Box>
                        </Box>
                      );
                    })}

                    {assignView === "assigned"   && !assignedFiltered.length   && <Box sx={{ px: 1.25, py: 2, color: vars.textDim, textAlign: "center" }}>{t("No assigned users.")}</Box>}
                    {assignView === "unassigned" && !unassignedFiltered.length && <Box sx={{ px: 1.25, py: 2, color: vars.textDim, textAlign: "center" }}>{t("No unassigned users.")}</Box>}
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

          {tab === "assign" &&
            (assignView === "assigned" ? (
              <Pagination
                count={assignedFiltered.length}
                page={assignedPage}
                setPage={setAssignedPage}
                rpp={assignedRpp}
                setRpp={setAssignedRpp}
              />
            ) : (
              <Pagination
                count={unassignedFiltered.length}
                page={unassignedPage}
                setPage={setUnassignedPage}
                rpp={unassignedRpp}
                setRpp={setUnassignedRpp}
              />
            ))}
        </Card>
      </Box>

      {/* Modals (Add + Update) */}
      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          reloadUsers();
          toast.success(t("User created successfully"));
        }}
      />

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
            designations: e.designations.map((d) => d.name),
          }))}
          onClose={() => setAssignModal({ open: false, row: null })}
          onUpdate={async (u: AssignUpdated) => {
            const payload = {
              roleId: u.roleId || null,
              entityIds: (u.entityIds || []).filter((id) => id !== "0"),
              designations: u.designations || [],
            };
            try {
              await updateAssignmentForUser(u.userId, payload);
              await Promise.all([reloadAssignments(), reloadUsers()]);
              setAssignView("assigned");
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
