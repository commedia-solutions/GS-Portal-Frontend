// src/pages/IAM/IAM.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box, Card, Button, Typography, TextField, InputAdornment,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  ToggleButtonGroup, ToggleButton, Checkbox
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from "@mui/icons-material/Security";
import PeopleIcon from "@mui/icons-material/People";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";

import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { useI18n } from "../../i18n";
import { useToast } from "../../ui/toast/ToastProvider";
import { vars, sxPresets } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, THEAD_CELL_SX, ROW_CELL_SX, PAGINATION_SX, AmbientLighting, TableScanLine, glassRowHoverSx, terminalRowSx } from "../../ui/styles";
import RoleAccessDialog from "./RoleAccessDialog";

/* API Imports */
import {
  listUsers, createEntity, getEntities, getRoles, createRole, updateRole,
  listAssignments, updateAssignmentForUser, setUserStatus, deleteRole,
  deleteEntity, deleteUser, getRolePages, updateRolePages,
} from "../../api/iam";

/* Modals */
import AddUserModal from "../../components/Models/AddUserModal";
import UpdateUserModal from "../../components/Models/UpdateUserModal";
import UpdateEntityModal from "../../components/Models/UpdateEntityModal";
import UpdateAssignmentModal from "../../components/Models/UpdateAssignmentModal";

/* ─────────────────────── style constants ─────────────────────── */
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;
const BORDER = vars.border;

const pillSx = {
  textTransform: "none", fontWeight: 800, fontSize: 13, px: 2.5, height: 34,
  borderRadius: "12px", color: DIM, bgcolor: "transparent", border: "none !important",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&.Mui-selected": {
    color: ACCENT, bgcolor: "rgba(14, 165, 233, 0.12)",
    boxShadow: `inset 0 0 0 1px rgba(14, 165, 233, 0.2)`,
  },
  "&.Mui-selected:hover": { bgcolor: "rgba(14, 165, 233, 0.18)" },
} as const;

const compactCtrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "36px", fontSize: 13, color: vars.text, backgroundColor: vars.bgCtrl, borderRadius: "10px",
    "& fieldset": { borderColor: vars.border },
    "&:hover fieldset": { borderColor: vars.accent },
    "&.Mui-focused fieldset": { borderColor: vars.accent, borderWidth: 1 }
  },
  "& .MuiInputBase-input": { padding: "0 12px", fontSize: 13, color: vars.text },
  "& .MuiInputBase-input::placeholder": { color: vars.textDim, opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: 18, color: vars.textDim }
} as const;

const theadCellSx = { ...THEAD_CELL_SX, display: "flex", alignItems: "center", justifyContent: "center" };
const rowCellSx = { ...ROW_CELL_SX, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", textOverflow: "ellipsis" };

/* ---------------- CAPTCHA ---------------- */
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
    return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="700" fill="white"
              text-anchor="middle" dominant-baseline="middle"
              transform="rotate(${r} ${x} ${y})">${ch}</text>`;
  }).join("");
  const lines = Array.from({ length: 4 }).map(() => {
    const x1 = rand(0, width), y1 = rand(0, height);
    const x2 = rand(0, width), y2 = rand(0, height);
    const op = rand(0.25, 0.45).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="${op}" stroke-width="${rand(1, 2)}"/>`;
  }).join("");
  const dots = Array.from({ length: 35 }).map(() => {
    const x = rand(0, width), y = rand(0, height);
    const op = rand(0.15, 0.35).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${rand(0.8, 2.2)}" fill="white" fill-opacity="${op}"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#1a1a1d" rx="8"/>
    <g fill="#e7e7ff">${chars}</g>
    <g>${lines}${dots}</g>
  </svg>`.trim();
  return { text, svg };
}
function svgDataUrl(svg: string) { return "data:image/svg+xml;base64," + btoa(svg); }

function CaptchaDialog({ open, onCancel, onOk }: { open: boolean; onCancel: () => void; onOk: () => void; }) {
  const { t } = useI18n();
  const [cap, setCap] = useState<Captcha>(() => makeCaptcha());
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const refresh = () => { setCap(makeCaptcha()); setInput(""); setError(""); };
  const submit = () => {
    if (input.trim().toLowerCase() === cap.text.toLowerCase()) { setError(""); onOk(); }
    else { setError(t("Incorrect code. Try again.")); refresh(); }
  };
  useEffect(() => { if (open) refresh(); }, [open]);
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: vars.bgCard, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: "20px" } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>{t("Human Verification")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
          <img src={svgDataUrl(cap.svg)} alt="captcha" style={{ width: "100%", height: 80, borderRadius: 12, border: `1px solid ${BORDER}` }} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("Type characters")} size="small" fullWidth sx={compactCtrlSx} />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderRadius: "10px", borderColor: BORDER }}>{t("Refresh")}</Button>
          </Box>
          {error && <Typography sx={{ color: vars.danger, fontSize: 12 }}>{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none", color: DIM }}>{t("Cancel")}</Button>
        <Button onClick={submit} variant="contained" sx={{ textTransform: "none", fontWeight: 700, bgcolor: ACCENT, borderRadius: "10px" }}>{t("Verify")}</Button>
      </DialogActions>
    </Dialog>
  );
}

const gridTemplate = (cols: { width?: number; minWidth?: number; flex?: number }[]) =>
  cols.map(c => {
    if (c.flex) return `minmax(${c.minWidth || c.width || 120}px, ${c.flex}fr)`;
    return `${c.width}px`;
  }).join(" ");

/* ---------- Column Definitions (Consistent Widths) ---------- */
const USER_COLS = [
  { key: "select", label: "", width: 40 },
  { key: "sr", label: "No", width: 50 },
  { key: "username", label: "User ID", minWidth: 100, flex: 0.8 },
  { key: "full_name", label: "Full Name", minWidth: 120, flex: 1 },
  { key: "email", label: "Email", minWidth: 180, flex: 1.5 },
  { key: "entities", label: "Entity", minWidth: 120, flex: 0.8 },
  { key: "role", label: "Role", minWidth: 100, flex: 0.6 },
  { key: "action", label: "Action", width: 220 },
];

const ENTITY_COLS = [
  { key: "select", label: "", width: 40 },
  { key: "sr", label: "No", width: 60 },
  { key: "name", label: "Entity Name", minWidth: 180, flex: 1.2 },
  { key: "description", label: "Description", minWidth: 300, flex: 3 },
  { key: "action", label: "Action", width: 140 },
];

const ROLE_COLS = [
  { key: "select", label: "", width: 40 },
  { key: "sr", label: "No", width: 60 },
  { key: "role", label: "Role Name", minWidth: 160, flex: 1 },
  { key: "description", label: "Description", minWidth: 300, flex: 3 },
  { key: "privileges", label: "Privileges", width: 100 },
  { key: "action", label: "Action", width: 160 },
];

const ASSIGN_COLS = [
  { key: "select", label: "", width: 40 },
  { key: "sr", label: "No", width: 60 },
  { key: "user", label: "User", minWidth: 180, flex: 1.5 },
  { key: "entities", label: "Entity", minWidth: 200, flex: 2 },
  { key: "role", label: "Role", minWidth: 150, flex: 1 },
  { key: "action", label: "Action", width: 120 },
];

export default function IAM() {
  const { t } = useI18n();
  const toast = useToast();

  type TabKey = "entity" | "role" | "users" | "assign";
  const [tab, setTab] = useState<TabKey>("entity");
  const [search, setSearch] = useState("");

  /* Data States */
  const [users, setUsers] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  /* Pagination States */
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* Modal States */
  const [addOpen, setAddOpen] = useState(false);
  const [updateUserModal, setUpdateUserModal] = useState<{ open: boolean; row: any | null }>({ open: false, row: null });
  const [entityModal, setEntityModal] = useState<{ open: boolean; row: any | null }>({ open: false, row: null });
  const [assignModal, setAssignModal] = useState<{ open: boolean; row: any | null }>({ open: false, row: null });
  const [roleAccessOpen, setRoleAccessOpen] = useState(false);
  const [viewRoleOpen, setViewRoleOpen] = useState(false);

  /* Creation State */
  const [entityName, setEntityName] = useState("");
  const [entityDesc, setEntityDesc] = useState("");
  const [roleName, setRoleName] = useState("");
  const [roleDesc, setRoleDesc] = useState("");

  /* Selection States */
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedEntities, setSelectedEntities] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  /* Access Dialog Data */
  const [activeRole, setActiveRole] = useState<any | null>(null);
  const [rolePages, setRolePages] = useState<{ viewerPages: string[]; editorPages: string[] }>({ viewerPages: [], editorPages: [] });
  const [viewRolePages, setViewRolePages] = useState({ roleName: "", viewerPages: [] as string[], editorPages: [] as string[] });

  /* CAPTCHA state */
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captchaAction, setCaptchaAction] = useState<any | null>(null);

  /* ---------- Loaders ---------- */
  const reloadUsers = useCallback(async () => {
    try {
      const [res, assigns] = await Promise.all([listUsers({ page: 1, pageSize: 500 }), listAssignments()]);
      const byUser = new Map(assigns.map(a => [a.user_id, a]));
      setUsers(res.data.map((u: any, idx: number) => {
        const a = byUser.get(u.id);
        return {
          ...u, sr: idx + 1,
          full_name: u.fullName,
          user_type: u.userType === "LDAP" ? "ldap" : "local",
          entities: a ? (a.entity_ids.length === 0 ? t("(global)") : a.entities.join(", ")) : "-",
          role: a?.role || "-",
        };
      }));
    } catch (e) { console.error(e); setUsers([]); }
  }, [t]);

  const reloadEntities = useCallback(async () => {
    try {
      const es = await getEntities();
      setEntities(es.map((e: any, i: number) => ({ ...e, sr: i + 1 })));
    } catch (e) { console.error(e); setEntities([]); }
  }, []);

  const reloadRoles = useCallback(async () => {
    try {
      const rs = await getRoles();
      setRoles(rs.map((r: any, i: number) => ({ ...r, sr: i + 1, role: r.name, is_disabled: r.isDisabled, is_system: r.isSystem })));
    } catch (e) { console.error(e); setRoles([]); }
  }, []);

  const reloadAssignments = useCallback(async () => {
    try {
      const data = await listAssignments();
      setAssignments(data);
    } catch (e) { console.error(e); setAssignments([]); }
  }, []);

  useEffect(() => { reloadUsers(); reloadEntities(); reloadRoles(); reloadAssignments(); }, [reloadUsers, reloadEntities, reloadRoles, reloadAssignments]);

  /* ---------- Actions ---------- */
  const handleToggleUser = async (r: any) => {
    const next = r.status === "disabled" ? "active" : "disabled";
    try {
      await setUserStatus(r.id, next);
      toast.success(`${t(next === "disabled" ? "User disabled" : "User enabled")}: ${r.username}`);
      await reloadUsers();
    } catch (e: any) { toast.error(e?.message || t("Failed to update user")); }
  };

  const handleToggleRole = async (r: any) => {
    if (r.is_system) return;
    try {
      await updateRole(r.id, { isDisabled: r.is_disabled ? 0 : 1 });
      toast.success(t(r.is_disabled ? "Role enabled" : "Role disabled"));
      await reloadRoles();
    } catch { toast.error(t("Failed to update role")); }
  };

  const runAfterCaptcha = useCallback(async () => {
    if (!captchaAction) return;
    try {
      if (captchaAction.kind === "addEntity") {
        await createEntity({ name: captchaAction.name, description: captchaAction.desc });
        setEntityName(""); setEntityDesc("");
        await reloadEntities();
        toast.success(t("Entity created"));
      } else if (captchaAction.kind === "addRole") {
        await createRole({ name: captchaAction.roleName, description: captchaAction.description, type: null });
        setRoleName(""); setRoleDesc("");
        await reloadRoles();
        toast.success(t("Role created"));
      }
    } catch (e: any) { toast.error(e?.response?.data?.message || t("Creation failed")); }
    setCaptchaAction(null);
  }, [captchaAction, reloadEntities, reloadRoles, t, toast]);

  const requestAddEntity = () => {
    if (!entityName.trim() || !entityDesc.trim()) return;
    setCaptchaAction({ kind: "addEntity", name: entityName, desc: entityDesc });
    setCaptchaOpen(true);
  };

  const requestAddRole = () => {
    if (!roleName.trim() || !roleDesc.trim()) return;
    setCaptchaAction({ kind: "addRole", roleName, description: roleDesc });
    setCaptchaOpen(true);
  };

  const openRoleAccess = async (role: any) => {
    if (role.is_system) return;
    setActiveRole(role);
    try {
      const res = await getRolePages(role.id);
      setRolePages({ viewerPages: res.viewerPages || [], editorPages: res.editorPages || [] });
    } catch { setRolePages({ viewerPages: [], editorPages: [] }); }
    setRoleAccessOpen(true);
  };

  const openRoleView = async (role: any) => {
    try {
      const res = await getRolePages(role.id);
      setViewRolePages({ roleName: role.role, viewerPages: res.viewerPages || [], editorPages: res.editorPages || [] });
      setViewRoleOpen(true);
    } catch { toast.error(t("Failed to load role pages")); }
  };

  const handleDeleteUsers = async () => {
    if (!selectedUsers.length) return;
    if (!window.confirm(t("Delete selected users?"))) return;
    try {
      for (const id of selectedUsers) { const u = users.find(x => String(x.id) === String(id)); if (u?.username.toLowerCase() !== "isroadmin") await deleteUser(id); }
      toast.success(t("Users deleted"));
      setSelectedUsers([]); await reloadUsers(); await reloadAssignments();
    } catch (e: any) { toast.error(e?.message || t("Failed to delete users")); await reloadUsers(); }
  };

  const handleDeleteEntities = async () => {
    if (!selectedEntities.length) return;
    if (!window.confirm(t("Delete selected entities? This action cannot be undone."))) return;
    try {
      for (const id of selectedEntities) {
        await deleteEntity(String(id));
      }
      toast.success(t("Entities deleted"));
      setSelectedEntities([]); await reloadEntities();
    } catch (e: any) {
      toast.error(e?.message || t("Failed to delete entities"));
      await reloadEntities();
    }
  };

  const handleDeleteRoles = async () => {
    const deletable = selectedRoles.filter(id => !roles.find(r => String(r.id) === String(id))?.is_system);
    if (!deletable.length) return;
    if (!window.confirm(t("Delete selected roles?"))) return;
    try {
      for (const id of deletable) {
        await deleteRole(String(id));
      }
      toast.success(t("Roles deleted"));
      setSelectedRoles([]); await reloadRoles();
    } catch (e: any) {
      toast.error(e?.message || t("Failed to delete roles"));
      await reloadRoles();
    }
  };

  const filterMatch = (s: string, q: string) => s.toLowerCase().includes(q);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const current = tab === "users" ? users : tab === "entity" ? entities : tab === "role" ? roles : assignments;
    if (!q) return current;
    return current.filter(r => Object.values(r).some(v => filterMatch(String(v), q)));
  }, [tab, users, entities, roles, assignments, search]);

  const paged = useMemo(() => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage), [filtered, page, rowsPerPage]);

  const renderTable = () => {
    const columns = tab === "users" ? USER_COLS : tab === "entity" ? ENTITY_COLS : tab === "role" ? ROLE_COLS : ASSIGN_COLS;
    const template = gridTemplate(columns);
    const activeSelection = tab === "users" ? selectedUsers : tab === "entity" ? selectedEntities : tab === "role" ? selectedRoles : [];

    return (
      <Box sx={{ flex: 1, minHeight: 0, overflow: "auto", px: 2, ...sxPresets.scroller, position: "relative" }}>
        <TableScanLine />
        <Box sx={{ minWidth: 1000, width: "100%" }}>
          <Box sx={{ position: "sticky", top: 0, zIndex: 10, display: "grid", gridTemplateColumns: template, bgcolor: vars.bgThead, borderBottom: `1px solid ${vars.border}`, backdropFilter: "blur(12px)" }}>
            {columns.map(c => (
              <Box key={c.key} sx={theadCellSx}>
                {c.key === "select" ? (
                  <Checkbox size="small" checked={paged.length > 0 && paged.every(r => activeSelection.some(sid => String(sid) === String(r.id)))}
                    onChange={() => {
                      const ids = paged.filter(r => r.username?.toLowerCase() !== "isroadmin" && !r.is_system).map(r => r.id);
                      const setter = tab === "users" ? setSelectedUsers : tab === "entity" ? setSelectedEntities : tab === "role" ? setSelectedRoles : null;
                      if (!setter) return;
                      setter(prev => prev.length === ids.length ? [] : ids);
                    }} />
                ) : t(c.label)}
              </Box>
            ))}
          </Box>
          {paged.map((r, i) => (
            <Box key={r.id} sx={{ ...terminalRowSx(i), gridTemplateColumns: template, ...glassRowHoverSx, borderBottom: `1px solid ${vars.borderWeak}`, transition: "all 0.25s", position: "relative" }}>
              {columns.map(c => (
                <Box key={c.key} sx={{ ...rowCellSx, fontWeight: c.key === "username" || c.key === "name" || c.key === "user" ? 700 : 500 }}>
                  {c.key === "select" ? (
                    <Checkbox size="small" disabled={r.username?.toLowerCase() === "isroadmin" || r.is_system} checked={activeSelection.some(sid => String(sid) === String(r.id))}
                      onChange={() => {
                        const setter = tab === "users" ? setSelectedUsers : tab === "entity" ? setSelectedEntities : tab === "role" ? setSelectedRoles : null;
                        if (!setter) return;
                        setter(prev => prev.some(sid => String(sid) === String(r.id)) ? prev.filter(id => String(id) !== String(r.id)) : [...prev, r.id]);
                      }} />
                  ) : c.key === "action" ? (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {tab === "users" && (
                        <>
                          <Button size="small" variant="contained" sx={{ bgcolor: ACCENT, minWidth: 60, height: 24, textTransform: "none", borderRadius: "6px", fontWeight: 700, fontSize: 11 }} onClick={() => setUpdateUserModal({ open: true, row: { ...r, userType: r.user_type === "ldap" ? "LDAP" : "Local" } })}>{t("Edit")}</Button>
                          <Button size="small" variant="contained" sx={{ bgcolor: r.status === "disabled" ? vars.textDim : vars.danger, minWidth: 70, height: 24, textTransform: "none", borderRadius: "6px", fontWeight: 700, fontSize: 11 }} onClick={() => handleToggleUser(r)}>{t(r.status === "disabled" ? "Enable" : "Disable")}</Button>
                        </>
                      )}
                      {tab === "entity" && <Button size="small" variant="contained" sx={{ bgcolor: ACCENT, minWidth: 60, height: 24, textTransform: "none", borderRadius: "6px", fontWeight: 700, fontSize: 11 }} onClick={() => setEntityModal({ open: true, row: r })}>{t("Edit")}</Button>}
                      {tab === "role" && !r.is_system && <Button size="small" variant="contained" sx={{ bgcolor: ACCENT, minWidth: 80, height: 24, textTransform: "none", borderRadius: "6px", fontWeight: 700, fontSize: 11 }} onClick={() => openRoleAccess(r)}>{t("Privileges")}</Button>}
                      {tab === "assign" && <Button size="small" variant="contained" sx={{ bgcolor: ACCENT, minWidth: 60, height: 24, textTransform: "none", borderRadius: "6px", fontWeight: 700, fontSize: 11 }} onClick={() => setAssignModal({ open: true, row: { userId: r.user_id, username: r.user, roleId: r.role_id, entityIds: r.entity_ids || [] } })}>{t("Edit")}</Button>}
                    </Box>
                  ) : c.key === "privileges" ? (
                    <Button size="small" variant="outlined" sx={{ height: 24, textTransform: "none", borderRadius: "6px", borderColor: BORDER, color: TEXT, fontWeight: 700, fontSize: 11 }} onClick={() => openRoleView(r)}>{t("View")}</Button>
                  ) : r[c.key as keyof typeof r]}
                </Box>
              ))}
            </Box>
          ))}
          {paged.length === 0 && <Typography sx={{ py: 8, textAlign: "center", color: DIM }}>{t("No records found")}</Typography>}
        </Box>
      </Box>
    );
  };

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, pt: 1, pb: 2, display: "flex", flexDirection: "column", gap: 2, height: `calc(100vh - ${TOPBAR_HEIGHT}px)`, position: "relative", overflow: "hidden" }}>

        {/* Top Navigation Pane */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1, position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
            <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v && setTab(v)} sx={{ p: 0.5, borderRadius: "16px", bgcolor: vars.bgCtrl, border: `1px solid ${vars.border}` }}>
              {[
                { k: "entity" as TabKey, l: "Organizations", i: <CorporateFareIcon /> },
                { k: "role" as TabKey, l: "Roles", i: <SecurityIcon /> },
                { k: "users" as TabKey, l: "Users", i: <PeopleIcon /> },
                { k: "assign" as TabKey, l: "Assignments", i: <AssignmentIndIcon /> },
              ].map(item => (
                <ToggleButton key={item.k} value={item.k} sx={pillSx}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {item.i}
                    {t(item.l)}
                  </Box>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <TextField value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} placeholder={t("Search Management…")} size="small" sx={{ width: 300, ...compactCtrlSx }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        </Box>

        {/* Main Content Card */}
        <Card sx={{ ...PREMIUM_CARD_SX, flex: 1 }}>
          <AmbientLighting />

          {/* Action Toolbar */}
          <Box sx={{ px: 2, py: 1.5, display: "flex", alignItems: "center", gap: 2, borderBottom: `1px solid ${vars.borderWeak}`, background: "rgba(100,116,139,0.01)", position: "relative", zIndex: 1 }}>
            {tab === "users" && (
              <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
                {selectedUsers.length > 0 && <Button startIcon={<DeleteIcon />} color="error" size="small" sx={{ textTransform: "none" }} onClick={handleDeleteUsers}>{t("Delete Selected")}</Button>}
                <Button variant="contained" size="small" startIcon={<AddIcon />} sx={{ bgcolor: ACCENT, px: 2, py: 0.8, borderRadius: "10px", fontWeight: 700, textTransform: "none", fontSize: 12.5 }} onClick={() => setAddOpen(true)}>{t("Add User")}</Button>
              </Stack>
            )}

            {tab === "entity" && (
              <>
                <TextField placeholder={t("Entity Name")} value={entityName} onChange={e => setEntityName(e.target.value)} size="small" sx={{ width: 220, ...compactCtrlSx }} />
                <TextField placeholder={t("Description")} value={entityDesc} onChange={e => setEntityDesc(e.target.value)} size="small" sx={{ width: 320, ...compactCtrlSx }} />
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  {selectedEntities.length > 0 && <Button startIcon={<DeleteIcon />} color="error" size="small" sx={{ textTransform: "none" }} onClick={handleDeleteEntities}>{t("Delete Selected")}</Button>}
                  <Button variant="contained" size="small" onClick={requestAddEntity} disabled={!entityName.trim()} sx={{ bgcolor: ACCENT, h: 36, px: 2, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>{t("Add Entity")}</Button>
                </Box>
              </>
            )}

            {tab === "role" && (
              <>
                <TextField placeholder={t("Role Name")} value={roleName} onChange={e => setRoleName(e.target.value)} size="small" sx={{ width: 220, ...compactCtrlSx }} />
                <TextField placeholder={t("Description")} value={roleDesc} onChange={e => setRoleDesc(e.target.value)} size="small" sx={{ width: 320, ...compactCtrlSx }} />
                <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
                  {selectedRoles.length > 0 && <Button startIcon={<DeleteIcon />} color="error" size="small" sx={{ textTransform: "none" }} onClick={handleDeleteRoles}>{t("Delete Selected")}</Button>}
                  <Button variant="contained" size="small" onClick={requestAddRole} disabled={!roleName.trim()} sx={{ bgcolor: ACCENT, h: 36, px: 2, borderRadius: "10px", textTransform: "none", fontWeight: 700 }}>{t("Add Role")}</Button>
                </Box>
              </>
            )}

            {tab === "assign" && (
              <Typography sx={{ fontSize: 13, color: DIM, fontStyle: "italic", ml: 1 }}>Modify user associations and structural hierarchy across the organization.</Typography>
            )}
          </Box>

          {/* Table Area */}
          {renderTable()}

          {/* Footer Area */}
          <Box sx={{ borderTop: `1px solid ${vars.border}`, bgcolor: "rgba(10,10,10,0.2)", position: "relative", zIndex: 1, mt: "auto" }}>
            <TablePagination component="div" count={filtered.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} sx={PAGINATION_SX} />
          </Box>

        </Card>
      </Box>

      <style>{`
        @keyframes sc-scan-line { 0% { left: -30%; } 100% { left: 100%; } }
        @keyframes sc-fog-breathe { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
      `}</style>

      {/* Specialty Modals */}
      <CaptchaDialog open={captchaOpen} onCancel={() => setCaptchaOpen(false)} onOk={() => { setCaptchaOpen(false); runAfterCaptcha(); }} />
      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} entities={entities} roles={roles} onCreated={async () => { setAddOpen(false); await reloadUsers(); await reloadAssignments(); toast.success(t("User created Successfully")); }} />
      {updateUserModal.row && <UpdateUserModal open={updateUserModal.open} row={updateUserModal.row} entities={entities} roles={roles} onClose={() => setUpdateUserModal({ open: false, row: null })} onUpdated={async () => { setUpdateUserModal({ open: false, row: null }); await reloadUsers(); toast.success(t("User updated Successfully")); }} />}
      <UpdateEntityModal open={entityModal.open} row={entityModal.row} onClose={() => setEntityModal({ open: false, row: null })} onUpdated={async () => { setEntityModal({ open: false, row: null }); await reloadEntities(); toast.success(t("Entity updated Successfully")); }} />
      {assignModal.row && <UpdateAssignmentModal open={assignModal.open} row={assignModal.row} roles={roles.map((r: any) => ({ id: r.id, name: r.role, disabled: !!r.is_disabled }))} entities={entities.map((e: any) => ({ id: e.id, name: e.name }))} onClose={() => setAssignModal({ open: false, row: null })} onUpdate={async (u) => { try { await updateAssignmentForUser(u.userId, { roleId: u.roleId || null, entityIds: (u.entityIds || []).filter((id: string) => id !== "0") }); await reloadAssignments(); await reloadUsers(); toast.success(t("Assignment updated Successfully")); setAssignModal({ open: false, row: null }); } catch (err: any) { toast.error(err?.response?.data?.message || t("Update failed")); } }} />}
      {activeRole && <RoleAccessDialog open={roleAccessOpen} roleName={activeRole.role} viewerPages={rolePages.viewerPages} editorPages={rolePages.editorPages} isDisabled={!!activeRole.is_disabled} onClose={() => setRoleAccessOpen(false)} onDisable={async () => { await handleToggleRole(activeRole); setRoleAccessOpen(false); }} onSave={async (p) => { await updateRolePages(activeRole.id, p); setRoleAccessOpen(false); toast.success(t("Privileges updated Successfully")); }} />}

      <Dialog open={viewRoleOpen} onClose={() => setViewRoleOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: vars.bgCard, color: TEXT, border: `1px solid ${BORDER}`, borderRadius: "20px" } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>{t("Privileges for")} {viewRolePages.roleName}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: vars.borderWeak }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <Box><Typography sx={{ fontWeight: 800, mb: 1, color: ACCENT }}>{t("Read Access")}</Typography>{viewRolePages.viewerPages.map(p => <Typography key={p} sx={{ fontSize: 13, py: 0.5 }}>• {p}</Typography>)}</Box>
            <Box><Typography sx={{ fontWeight: 800, mb: 1, color: ACCENT }}>{t("Write Access")}</Typography>{viewRolePages.editorPages.map(p => <Typography key={p} sx={{ fontSize: 13, py: 0.5 }}>• {p}</Typography>)}</Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button onClick={() => setViewRoleOpen(false)} sx={{ color: TEXT }}>{t("Close")}</Button></DialogActions>
      </Dialog>
    </MainLayout>
  );
}