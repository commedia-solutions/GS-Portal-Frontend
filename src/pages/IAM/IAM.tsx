// import React from "react";
// import {
//   Box, Card, ToggleButtonGroup, ToggleButton,
//   TextField, InputAdornment, Button, TablePagination,
//   Chip, FormControl, Select, MenuItem,
// } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import AddIcon from "@mui/icons-material/Add";
// import MainLayout from "../../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../../components/TopNav";

// /* ---------- Toast ---------- */
// import { useToast } from "../../ui/toast/ToastProvider";

// /* ---------- API ---------- */
// import {
//   listUsers,
//   createEntity,
//   getEntities,
//   getDesignations,
//   createDesignation,
//   getRoles,
//   createRole,
//   updateRole,
//   listAssignments,
//   updateAssignmentForUser,  
//   setUserStatus ,
//   type UserRow as ApiUserRow,
//   type RoleRow as ApiRoleRow,
//   type AccessType,
//   type AssignmentListRow,
// } from "../../api/iam";

// /* ---------- Modals ---------- */
// import AddUserModal from "../../components/Models/AddUserModal";
// import UpdateEntityModal, { type EntityUpdateIn } from "../../components/Models/UpdateEntityModal";
// import UpdateAssignmentModal, {
//   type AssignmentForEdit as AssignEditRow,
//   type AssignmentUpdated as AssignUpdated,
//   type SimpleRole as ModalRole,
//   type SimpleEntity as ModalEntity,
// } from "../../components/Models/UpdateAssignmentModal";

// /* ---------- UI constants ---------- */
// const CONTROL_BG = "#1C1C1E";
// const UI = {
//   ctrlH: 30, font: 13, icon: 16, gap: 0.75,
//   headerPx: 1.25, headerPy: 0.6, searchW: 260, paginationH: 36,
// } as const;

// const compactCtrlSx = {
//   bgcolor: CONTROL_BG, borderRadius: 1, color: "#fff",
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#544f4fff" },
//   "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff" },
//   "& .MuiInputBase-input": { height: `${UI.ctrlH - 2}px`, padding: "0 10px", fontSize: UI.font, lineHeight: 1, color: "#fff" },
//   "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 1 },
//   "& input::-webkit-input-placeholder": { color: "#fff", opacity: 1 },
//   "& .MuiSvgIcon-root": { fontSize: UI.icon, color: "rgba(255,255,255,0.9)" },
// };

// const CARD_SX = {
//   bgcolor: "#1C1C1E", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.14)",
//   borderRadius: 2, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
//   display: "flex", flexDirection: "column" as const,
// } as const;

// const SCROLLER_SX = {
//   scrollbarWidth: "thin",
//   scrollbarColor: "#3f3f3f transparent",
//   "&::-webkit-scrollbar": { width: 8, height: 8 },
//   "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
//   "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
//   "&::-webkit-scrollbar-track": { background: "transparent" },
// };

// /* ---------- Users table ---------- */
// type UserRow = {
//   id: string; sr: number; username: string; full_name: string; email: string;
//   user_type: "local" | "ldap"; designation: string; entities: string;
//   status: "active" | "disabled";
// };

// type Column = {
//   key: keyof UserRow | "action";
//   label: string; width?: number; align?: "left" | "center" | "right";
// };

// const COLUMNS: Column[] = [
//   { key: "sr",        label: "Sr No",   width: 80,  align: "center" },
//   { key: "username",  label: "User Id", width: 160, align: "center" },
//   { key: "full_name", label: "Full Name", width: 200, align: "center" },
//   { key: "email",     label: "Email",   width: 260, align: "center" },
//   { key: "user_type", label: "Type",    width: 100, align: "center" },
//   // removed: designation, entities
//   { key: "action",    label: "Action",  width: 140, align: "center" },
// ];

// function DarkUsersTable({ rows, columns, onToggle }: {
//   rows: UserRow[]; columns: Column[]; onToggle: (r: UserRow) => void;
// }) {
//   const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;
//   return (
//     <Box>
//       <Box sx={{ width: totalW, minWidth: "100%" }}>
//         {/* header */}
//         <Box
//           sx={{
//             position: "sticky", top: 0, zIndex: 1, display: "grid",
//             gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
//             bgcolor: "#000", borderBottom: "1px solid rgba(255,255,255,0.14)",
//           }}
//         >
//           {columns.map((c) => (
//             <Box key={String(c.key)} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: c.align ?? "center" }}>
//               {c.label}
//             </Box>
//           ))}
//         </Box>

//         {/* rows */}
//         {rows.map((r, idx) => (
//           <Box
//             key={`${r.id}-${idx}`}
//             sx={{
//               display: "grid",
//               gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
//               borderBottom: "1px solid rgba(255,255,255,0.08)",
//               bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//             }}
//           >
//             {columns.map((c) => {
//               if (c.key === "action") {
//                 const disabled = r.status === "disabled";
//                 return (
//                   <Box key={`action-${idx}`} sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}>
//                     <Button
//                       size="small" variant="contained"
//                       sx={{
//                         textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25,
//                         bgcolor: disabled ? "#555" : "#ef4a4a",
//                         "&:hover": { bgcolor: disabled ? "#666" : "#dd3737" },
//                       }}
//                       onClick={() => onToggle(r)}
//                     >
//                       {disabled ? "Enable" : "Disable"}
//                     </Button>
//                   </Box>
//                 );
//               }
//               return (
//                 <Box
//                   key={String(c.key)}
//                   sx={{ px: 1.25, py: 1, fontSize: 13, color: "#EAEAEA", textAlign: c.align ?? "center", whiteSpace: "nowrap" }}
//                 >
//                   {r[c.key as keyof UserRow] as any}
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}

//         {!rows.length && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No users found.</Box>}
//       </Box>
//     </Box>
//   );
// }

// /* ---------- Types for Entity / Role / Assign ---------- */
// type EntityRow = {
//   id: string; sr: number; name: string;
//   designations: { id: string; name: string }[];
// };

// type RoleRowUI = {
//   id: string; sr: number; role: string; access: AccessType;
//   is_disabled: 0 | 1; is_system: 0 | 1;
// };

// type AssignmentRow = AssignmentListRow;

// /* ---------- Page ---------- */
// export default function IAM() {
//   const toast = useToast();

//   type TabKey = "users" | "entity" | "role" | "assign";
//   const [tab, setTab] = React.useState<TabKey>("users");
//   const [search, setSearch] = React.useState("");

//   // USERS
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(10);
//   const [rows, setRows] = React.useState<UserRow[]>([]);
//   const [addOpen, setAddOpen] = React.useState(false);

//   // ENTITIES
//   const [entities, setEntities] = React.useState<EntityRow[]>([]);
//   const [entityPage, setEntityPage] = React.useState(0);
//   const [entityRpp, setEntityRpp] = React.useState(10);

//   // Add-entity inputs
//   const [entityName, setEntityName] = React.useState("");
//   const [designationInput, setDesignationInput] = React.useState("");
//   const [designationList, setDesignationList] = React.useState<string[]>([]);
//   const addDesigFromInput = () => {
//     const raw = designationInput.trim();
//     if (!raw) return;
//     const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
//     setDesignationList((prev) => Array.from(new Set([...prev, ...parts])));
//     setDesignationInput("");
//   };

//   // ROLES
//   const [roles, setRoles] = React.useState<RoleRowUI[]>([]);
//   const [rolePage, setRolePage] = React.useState(0);
//   const [roleRpp, setRoleRpp] = React.useState(10);
//   const [roleName, setRoleName] = React.useState("");
//   const [accessType, setAccessType] = React.useState<"" | AccessType>("");

//   // ASSIGNMENTS
//   const [assignments, setAssignments] = React.useState<AssignmentRow[]>([]);
//   const [assignPage, setAssignPage] = React.useState(0);
//   const [assignRpp, setAssignRpp] = React.useState(10);

//   // Modals
//   const [entityModal, setEntityModal] = React.useState<{ open: boolean; row: EntityUpdateIn | null }>({ open: false, row: null });
//   const [assignModal, setAssignModal] = React.useState<{ open: boolean; row: AssignEditRow | null }>({ open: false, row: null });

//   /* ----------- Loaders ----------- */
//   // Users + (entities/designations) enrichment from /assignments
//   const reloadUsers = React.useCallback(async () => {
//     try {
//       const [usersRes, assigns] = await Promise.all([
//         listUsers({ page: 1, pageSize: 100 }),
//         listAssignments(),
//       ]);
//       const byUser = new Map(assigns.map(a => [a.user_id, a]));
     
//       const mapped: UserRow[] = usersRes.data.map((u: ApiUserRow, idx) => {
//   const a = byUser.get(u.id);
//   return {
//     id: u.id,
//     sr: idx + 1,
//     username: u.username,
//     full_name: u.fullName,
//     email: u.email,
//     user_type: u.userType === "LDAP" ? "ldap" : "local",
//     designation: a && a.designation?.length ? a.designation.join(", ") : "",
//     entities: a ? (a.entity_ids.length === 0 ? "(global)" : a.entities.join(", ")) : "",
//     // backend returns "active" | "disabled" → keep as-is
//     status: (u.status as "active" | "disabled"),
//   };
// });
//       setRows(mapped);
//     } catch (e) {
//       console.error("Failed to load users", e);
//       setRows([]);
//       toast.error("Failed to load users");
//     }
//   }, [toast]);

//   const reloadEntities = React.useCallback(async () => {
//     try {
//       const es = await getEntities();
//       const withDesigs = await Promise.all(
//         es.map(async (e: { id: string; name: string }, i: number) => {
//           try {
//             const des = await getDesignations(e.id);
//             return {
//               id: e.id, sr: i + 1, name: e.name,
//               designations: des.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })),
//             } as EntityRow;
//           } catch {
//             return { id: e.id, sr: i + 1, name: e.name, designations: [] } as EntityRow;
//           }
//         })
//       );
//       setEntities(withDesigs);
//     } catch (e) {
//       console.error("Failed to load entities", e);
//       setEntities([]);
//       toast.error("Failed to load organization");
//     }
//   }, [toast]);

//   const reloadRoles = React.useCallback(async () => {
//     try {
//       const apiRoles: ApiRoleRow[] = await getRoles();
//       const mapped: RoleRowUI[] = apiRoles.map((r, idx) => ({
//         id: r.id, sr: idx + 1, role: r.name, access: r.accessType,
//         is_disabled: r.isDisabled, is_system: r.isSystem,
//       }));
//       setRoles(mapped);
//     } catch (e) {
//       console.error("Failed to load roles", e);
//       setRoles([]);
//       toast.error("Failed to load roles");
//     }
//   }, [toast]);

//   const reloadAssignments = React.useCallback(async () => {
//     try {
//       const rows = await listAssignments();
//       setAssignments(rows);
//     } catch (e) {
//       console.error("Failed to load assignments", e);
//       setAssignments([]);
//       toast.error("Failed to load assignments");
//     }
//   }, [toast]);

//   React.useEffect(() => {
//     reloadUsers();
//     reloadEntities();
//     reloadRoles();
//     reloadAssignments();
//   }, [reloadUsers, reloadEntities, reloadRoles, reloadAssignments]);

//   /* ----------- Search + paging ----------- */
//   const filterMatch = (s: string, q: string) => s.toLowerCase().includes(q);

//   const filteredUsers = React.useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return rows;
//     return rows.filter((r) =>
//       [r.username, r.full_name, r.email, r.user_type, r.designation, r.entities, r.status]
//         .join(" ").toLowerCase().includes(q)
//     );
//   }, [rows, search]);

//   const pagedUsers = React.useMemo(
//     () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
//     [filteredUsers, page, rowsPerPage]
//   );

//   const filteredEntities = React.useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return entities;
//     return entities.filter((e) => filterMatch(e.name, q) || e.designations.some((d) => filterMatch(d.name, q)));
//   }, [entities, search]);

//   const pagedEntities = React.useMemo(
//     () => filteredEntities.slice(entityPage * entityRpp, entityPage * entityRpp + entityRpp),
//     [filteredEntities, entityPage, entityRpp]
//   );

//   const filteredRoles = React.useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return roles;
//     return roles.filter((r) => filterMatch(r.role, q) || filterMatch(r.access, q));
//   }, [roles, search]);

//   const pagedRoles = React.useMemo(
//     () => filteredRoles.slice(rolePage * roleRpp, rolePage * roleRpp + roleRpp),
//     [filteredRoles, rolePage, roleRpp]
//   );

//   const filteredAssign = React.useMemo<AssignmentRow[]>(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return assignments;
//     return assignments.filter(
//       (a) =>
//         a.user.toLowerCase().includes(q) ||
//         a.role.toLowerCase().includes(q) ||
//         a.entities.join(", ").toLowerCase().includes(q) ||
//         a.designation.join(", ").toLowerCase().includes(q)
//     );
//   }, [assignments, search]);

//   const pagedAssign = React.useMemo<AssignmentRow[]>(
//     () => filteredAssign.slice(assignPage * assignRpp, assignPage * assignRpp + assignRpp),
//     [filteredAssign, assignPage, assignRpp]
//   );

//   /* ----------- Actions ----------- */


// const handleToggleUser = async (r: UserRow) => {
//   const next: "active" | "disabled" = r.status === "disabled" ? "active" : "disabled";
//   try {
//     await setUserStatus(r.id, next); // PATCH /api/users/:id  { status: "active"|"disabled" }
//     setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
//     toast.success(`User ${r.username} ${next === "disabled" ? "disabled" : "enabled"}`);
//   } catch (e: any) {
//     console.error("Failed to set user status", e);
//     toast.error(e?.message || "Failed to update user");
//   }
// };

//   const toggleRole = async (r: RoleRowUI) => {
//     if (r.is_system) return;
//     try {
//       await updateRole(r.id, { isDisabled: r.is_disabled ? 0 : 1 });
//       await reloadRoles();
//       toast.success(`Role ${r.is_disabled ? "enabled" : "disabled"} successfully`);
//     } catch (e: any) {
//       console.error("Failed to toggle role", e);
//       const msg = e?.response?.data?.message || "Failed to update role";
//       toast.error(msg);
//     }
//   };

//   const handleAddEntity = async () => {
//     const name = entityName.trim();
//     if (!name || designationList.length === 0) return;
//     try {
//       const { id } = await createEntity({ name });
//       await Promise.all(designationList.map((d) => createDesignation(id, { name: d })));
//       setEntityName(""); setDesignationInput(""); setDesignationList([]);
//       await reloadEntities();
//       toast.success("Entity created successfully");
//     } catch (e: any) {
//       console.error("Failed adding entity", e);
//       const msg = e?.response?.data?.message || "Failed to create entity";
//       toast.error(msg);
//     }
//   };

//   const handleAddRole = async () => {
//     const name = roleName.trim();
//     if (!name || !accessType) return;
//     try {
//       await createRole({ name, accessType: accessType as AccessType });
//       setRoleName(""); setAccessType("");
//       await reloadRoles();
//       toast.success("Role created successfully");
//     } catch (e: any) {
//       console.error("Failed to create role", e);
//       const msg = e?.response?.data?.message || "Failed to create role";
//       toast.error(msg);
//     }
//   };

//   // Open modals
//   const openUpdateEntity = (row: EntityRow) => {
//     const edit: EntityUpdateIn = { id: row.id, name: row.name, designations: row.designations };
//     setEntityModal({ open: true, row: edit });
//   };


// const openUpdateAssign = (a: AssignmentRow) => {
//   const edit: AssignEditRow = {
//     userId: a.user_id,
//     username: a.user,
//     roleId: a.role_id,
//     entityIds: a.entity_ids ?? [],                     // [] means global
//     designations: (a.designation ?? []).map((d) => d.trim()), // exact string match
//   };
//   setAssignModal({ open: true, row: edit });
// };

//   const handleTab = (_e: React.MouseEvent<HTMLElement>, next: TabKey | null) => {
//     if (next) setTab(next);
//   };

//   /* ---------- Render ---------- */
//   return (
//     <MainLayout title="">
//       <Box sx={{ px: 2, py: 1.5 }}>
//         {/* <Card sx={{ ...CARD_SX, maxWidth: 1120, mx: "auto", position: "relative" }}> */}
//         <Card
//   sx={{
//     ...CARD_SX,
//     width: "100%",
//     minWidth: 0,          // prevents grid/scroll children from forcing width
//     mx: 0,                // don't center with margins; let it fill the area
//     position: "relative",
//   }}
// >
//           {/* header */}
//           <Box
//             sx={{
//               px: UI.headerPx, py: UI.headerPy, borderBottom: "1px solid rgba(255,255,255,0.12)",
//               display: "grid", alignItems: "center", gridTemplateColumns: "1fr auto 1fr", columnGap: UI.gap,
//             }}
//           >
//             <Box />

//             <ToggleButtonGroup
//               value={tab} exclusive onChange={handleTab}
//               sx={{
//                 justifySelf: "center", p: 0.5, borderRadius: 999,
//                 border: "1px solid rgba(255,255,255,.14)", bgcolor: "#171718",
//                 "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
//               }}
//             >
//               {[
//                 { key: "users", label: "Users" },
//                 { key: "entity", label: "Entity" },
//                 { key: "role", label: "Role" },
//                 { key: "assign", label: "Assignment" },
//               ].map(({ key, label }) => (
//                 <ToggleButton
//                   key={key} value={key} disableRipple
//                   sx={{
//                     textTransform: "none", fontWeight: 700, fontSize: 13, px: 2, height: 32, lineHeight: "32px",
//                     borderRadius: 999, color: "rgba(255,255,255,.72)", bgcolor: "transparent",
//                     "&.Mui-selected": {
//                       color: "#7CFF8D", bgcolor: "#0E0E10",
//                       border: "1px solid rgba(124,255,141,.18)", boxShadow: "inset 0 0 0 1px rgba(124,255,141,.10)",
//                     },
//                     "&:hover": { bgcolor: "rgba(255,255,255,.06)" },
//                   }}
//                 >
//                   {label}
//                 </ToggleButton>
//               ))}
//             </ToggleButtonGroup>

//             {/* search */}
//             <Box sx={{ justifySelf: "end", display: "flex", alignItems: "center", gap: UI.gap }}>
//               <TextField
//                 value={search}
//                 onChange={(e) => {
//                   setSearch(e.target.value);
//                   setPage(0); setEntityPage(0); setRolePage(0); setAssignPage(0);
//                 }}
//                 placeholder="Search…"
//                 size="small"
//                 sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start" sx={{ mr: 0.25 }}>
//                       <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,.75)" }} />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//             </Box>
//           </Box>

//           {/* toolbars */}
//           {tab === "users" && (
//             <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", px: 1.25, pt: 1, pb: 0.5 }}>
//               <Button
//                 startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)}
//                 sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
//               >
//                 Add User
//               </Button>
//             </Box>
//           )}

//           {tab === "entity" && (
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, pt: 1, pb: 0.5, flexWrap: "wrap" }}>
//               <Box sx={{ fontWeight: 700, mr: 1 }}>Add New Entity</Box>
//               <TextField placeholder="Entity name" value={entityName} onChange={(e) => setEntityName(e.target.value)} size="small" sx={{ width: 260, ...compactCtrlSx }} />
//               <TextField
//                 placeholder="Entity Description" value={designationInput}
//                 onChange={(e) => setDesignationInput(e.target.value)}
//                 onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addDesigFromInput(); } }}
//                 size="small" sx={{ width: 320, ...compactCtrlSx }}
//               />
//               {/* <Button variant="contained" onClick={addDesigFromInput} sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#2d2d2f", "&:hover": { bgcolor: "#3a3a3c" } }}>
//                 +
//               </Button> */}
//               <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
//                 {designationList.map((d) => (
//                   <Chip key={d} label={d} onDelete={() => setDesignationList((prev) => prev.filter((x) => x !== d))}
//                     sx={{ color: "#E8E8EA", border: "1px solid rgba(255,255,255,.14)", height: 26 }} />
//                 ))}
//               </Box>
//               <Box sx={{ ml: "auto" }}>
//                 {/* <Button
//                   startIcon={<AddIcon />} variant="contained" onClick={handleAddEntity}
//                   disabled={!entityName.trim() || designationList.length === 0}
//                   sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
//                 >
//                   Add
//                 </Button> */}

//                 <Button
//   startIcon={<AddIcon />}
//   variant="contained"
//   onClick={handleAddEntity}
//   disabled={!entityName.trim() || designationList.length === 0}
//   sx={{
//     textTransform: "none",
//     fontWeight: 700,
//     fontSize: 12.5,
//     bgcolor: "#7C57F2",
//     "&:hover": { bgcolor: "#6b48ea" },
//     // visible grey even when disabled
//     "&.Mui-disabled": {
//       bgcolor: "#2d2d2f",
//       color: "#b5b7bd",
//       border: "1px solid rgba(255,255,255,0.14)",
//       boxShadow: "none",
//       opacity: 1,
//     },
//   }}
// >
//   Add
// </Button>
//               </Box>
//             </Box>
//           )}

//           {tab === "role" && (
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, pt: 1, pb: 0.5, flexWrap: "wrap" }}>
//               <Box sx={{ fontWeight: 700, mr: 1 }}>Add Role</Box>

//               {/* <TextField placeholder="Role" value={roleName} onChange={(e) => setRoleName(e.target.value)} size="small" sx={{ width: 260, ...compactCtrlSx }} /> */}
//               <TextField
//   placeholder="Role name"
//   value={roleName}
//   onChange={(e) => setRoleName(e.target.value)}
//   size="small"
//   sx={{ width: 260, ...compactCtrlSx }}
// />
             

//               <FormControl size="small" sx={{ width: 260 }}>
//   <Select
//     value={accessType}
//     onChange={(e) => setAccessType((e.target.value as any) || "")}
//     displayEmpty
//     renderValue={(val) => (val ? (val as string) : "Role description")}
//     sx={{
//       ...compactCtrlSx,
//       "& .MuiSelect-select": { display: "flex", alignItems: "center", paddingRight: "28px !important" },
//     }}
//   >
//     <MenuItem disabled value="">Role description</MenuItem>
//     <MenuItem value="Admin">Admin</MenuItem>
//     <MenuItem value="User">User</MenuItem>
//     <MenuItem value="Guest">Guest</MenuItem>
//   </Select>
// </FormControl>

//               <Box sx={{ ml: "auto" }}>
               
//                 <Button
//   startIcon={<AddIcon />}
//   variant="contained"
//   onClick={handleAddRole}
//   disabled={!roleName.trim() || !accessType}
//   sx={{
//     textTransform: "none",
//     fontWeight: 700,
//     fontSize: 12.5,
//     bgcolor: "#7C57F2",
//     "&:hover": { bgcolor: "#6b48ea" },
//     "&.Mui-disabled": {
//       bgcolor: "#2d2d2f",
//       color: "#b5b7bd",
//       border: "1px solid rgba(255,255,255,0.14)",
//       boxShadow: "none",
//       opacity: 1,
//     },
//   }}
// >
//   Add
// </Button>
//               </Box>
//             </Box>
//           )}

//           {/* body */}
//           <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
//             <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
//               <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
//                 {/* USERS */}
//                 {tab === "users" && <DarkUsersTable rows={pagedUsers} columns={COLUMNS} onToggle={handleToggleUser} />}

//                 {/* ENTITY */}
//                 {tab === "entity" && (
//                   <Box sx={{ width: "100%" }}>
//                     <Box
//                       sx={{
//                         position: "sticky", top: 0, zIndex: 1, display: "grid",
//                         gridTemplateColumns: "120px 1fr 1fr 200px", bgcolor: "#000",
//                         borderBottom: "1px solid rgba(255,255,255,.14)",
//                       }}
//                     >
//                       {["Sr No", "Entity Name", "Description", "Action"].map((h) => (
//                         <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
//                           {h}
//                         </Box>
//                       ))}
//                     </Box>

//                     {pagedEntities.map((e, idx) => (
//                       <Box
//                         key={e.id}
//                         sx={{
//                           display: "grid", gridTemplateColumns: "120px 1fr 1fr 200px",
//                           borderBottom: "1px solid rgba(255,255,255,.08)",
//                           bgcolor: (entityPage * entityRpp + idx) % 2 ? "rgba(255,255,255,.02)" : "transparent",
//                           alignItems: "center",
//                         }}
//                       >
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{entityPage * entityRpp + idx + 1}</Box>
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{e.name}</Box>
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{e.designations.map((d) => d.name).join(", ")}</Box>
//                         <Box sx={{ px: 1.25, py: 0.75, textAlign: "center", display: "flex", gap: 1, justifyContent: "center" }}>
//                           <Button
//                             size="small" variant="contained"
//                             sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" } }}
//                             onClick={() => openUpdateEntity(e)}
//                           >
//                             Update
//                           </Button>
//                         </Box>
//                       </Box>
//                     ))}

//                     {!entities.length && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No data.</Box>}
//                   </Box>
//                 )}

//                 {/* ROLE */}
//                 {tab === "role" && (
//                   <Box sx={{ width: "100%" }}>
//                     <Box
//                       sx={{
//                         position: "sticky", top: 0, zIndex: 1, display: "grid",
//                         gridTemplateColumns: "120px 1fr 1fr 180px", bgcolor: "#000",
//                         borderBottom: "1px solid rgba(255,255,255,.14)",
//                       }}
//                     >
//                       {["Sr No", "Role name", "Role description", "Action"].map((h) => (
//                         <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
//                           {h}
//                         </Box>
//                       ))}
//                     </Box>

//                     {pagedRoles.map((r, idx) => (
//                       <Box
//                         key={r.id}
//                         sx={{
//                           display: "grid", gridTemplateColumns: "120px 1fr 1fr 180px",
//                           borderBottom: "1px solid rgba(255,255,255,.08)",
//                           bgcolor: (rolePage * roleRpp + idx) % 2 ? "rgba(255,255,255,.02)" : "transparent",
//                           alignItems: "center",
//                         }}
//                       >
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{rolePage * roleRpp + idx + 1}</Box>
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
//                           {r.role} {r.is_disabled && !r.is_system ? "(disabled)" : ""}
//                         </Box>
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.access}</Box>
//                         <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
//                           {r.is_system ? (
//                             <Box sx={{ fontSize: 13, color: "#aaa" }}>--</Box>
//                           ) : (
//                             <Button
//                               size="small" variant="contained"
//                               sx={{
//                                 minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700,
//                                 bgcolor: r.is_disabled ? "#2e7d32" : "#ef4a4a",
//                                 "&:hover": { bgcolor: r.is_disabled ? "#1b5e20" : "#dd3737" },
//                               }}
//                               onClick={() => toggleRole(r)}
//                             >
//                               {r.is_disabled ? "Enable" : "Disable"}
//                             </Button>
//                           )}
//                         </Box>
//                       </Box>
//                     ))}

//                     {!roles.length && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No data.</Box>}
//                   </Box>
//                 )}

//                 {/* ASSIGN */}
//                 {tab === "assign" && (
//                   <Box sx={{ width: "100%" }}>
//                     <Box
//                       sx={{
//                         position: "sticky", top: 0, zIndex: 1, display: "grid",
//                         gridTemplateColumns: "100px 1fr 1fr 1fr 1fr 140px",
//                         bgcolor: "#000", borderBottom: "1px solid rgba(255,255,255,.14)",
//                       }}
//                     >
//                       {["No", "User", "Entities", "Role", "Designation", "Action"].map((h) => (
//                         <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
//                           {h}
//                         </Box>
//                       ))}
//                     </Box>

//                     {pagedAssign.map((a, idx) => (
//                       <Box
//                         key={a.id}
//                         sx={{
//                           display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr 1fr 140px",
//                           borderBottom: "1px solid rgba(255,255,255,.08)",
//                           bgcolor: (assignPage * assignRpp + idx) % 2 ? "rgba(255,255,255,.02)" : "transparent",
//                           alignItems: "center",
//                         }}
//                       >
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{assignPage * assignRpp + idx + 1}</Box>
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{a.user}</Box>
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
//                           {a.entity_ids.length === 0 ? "(global)" : a.entities.join(", ")}
//                         </Box>
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{a.role}</Box>
//                         <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
//                           {a.designation.length ? a.designation.join(", ") : "-"}
//                         </Box>
//                         <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
//                           <Button
//                             size="small" variant="contained"
//                             sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" } }}
//                             onClick={() => openUpdateAssign(a)}
//                           >
//                             Update
//                           </Button>
//                         </Box>
//                       </Box>
//                     ))}

//                     {!pagedAssign.length && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No data.</Box>}
//                   </Box>
//                 )}
//               </Box>
//             </Box>
//           </Box>

//           {/* paginations */}
//           {tab === "users" && <Pagination count={filteredUsers.length} page={page} setPage={setPage} rpp={rowsPerPage} setRpp={setRowsPerPage} />}
//           {tab === "entity" && <Pagination count={filteredEntities.length} page={entityPage} setPage={setEntityPage} rpp={entityRpp} setRpp={setEntityRpp} />}
//           {tab === "role" && <Pagination count={filteredRoles.length} page={rolePage} setPage={setRolePage} rpp={roleRpp} setRpp={setRoleRpp} />}
//           {tab === "assign" && <Pagination count={filteredAssign.length} page={assignPage} setPage={setAssignPage} rpp={assignRpp} setRpp={setAssignRpp} />}
//         </Card>
//       </Box>

//       {/* Modals */}
//       <AddUserModal
//         open={addOpen}
//         onClose={() => setAddOpen(false)}
//         onCreated={() => {
//           setAddOpen(false);
//           reloadUsers();
//           toast.success("User created successfully");
//         }}
//       />

//       <UpdateEntityModal
//         open={entityModal.open}
//         row={entityModal.row}
//         onClose={() => setEntityModal({ open: false, row: null })}
//         onUpdated={async () => {
//           await reloadEntities();
//           toast.success("Entity updated");
//         }}
//         onDeleted={async () => {
//           await reloadEntities();
//           toast.success("Entity deleted");
//         }}
//       />

//       {assignModal.row && (
//         <UpdateAssignmentModal
//           open={true}
//           row={assignModal.row}
//           roles={roles.map<ModalRole>((r) => ({ id: r.id, name: r.role, disabled: !!r.is_disabled }))}
//           entities={entities.map<ModalEntity>((e) => ({
//             id: e.id, name: e.name, designations: e.designations.map((d) => d.name),
//           }))}
//           onClose={() => setAssignModal({ open: false, row: null })}
//           onUpdate={async (u: AssignUpdated) => {
//             // normalize: "0" means global (send [] to backend)
//             const payload = {
//               roleId: u.roleId || null,
//               entityIds: (u.entityIds || []).filter((id) => id !== "0"),
//               designations: u.designations || [],
//             };
//             try {
//               await updateAssignmentForUser(u.userId, payload);
//               await Promise.all([reloadAssignments(), reloadUsers()]);
//               toast.success("Assignment updated");
//             } catch (err: any) {
//               console.error("Failed to update assignment", err);
//               const msg = err?.response?.data?.message || "Failed to update assignment";
//               toast.error(msg);
//             }
//           }}
//         />
//       )}
//     </MainLayout>
//   );
// }

// /* small pagination helper */
// function Pagination({
//   count, page, setPage, rpp, setRpp,
// }: {
//   count: number; page: number; setPage: (p: number) => void; rpp: number; setRpp: (n: number) => void;
// }) {
//   const CONTROL_BG = "#1C1C1E";
//   const UI = { ctrlH: 30, font: 13, icon: 16, paginationH: 36 } as const;
//   return (
//     <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
//       <TablePagination
//         component="div"
//         count={count}
//         page={page}
//         onPageChange={(_, p) => setPage(p)}
//         rowsPerPage={rpp}
//         onRowsPerPageChange={(e) => { setRpp(parseInt(e.target.value, 10)); setPage(0); }}
//         rowsPerPageOptions={[5, 10, 25, 50]}
//         sx={{
//           px: 1, color: "#E8E8EA", minHeight: UI.paginationH,
//           "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
//           "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: UI.font, m: 0 },
//           "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
//           "& .MuiSelect-select": {
//             py: 0, px: 1, fontSize: UI.font, height: UI.ctrlH - 6,
//             display: "flex", alignItems: "center", bgcolor: CONTROL_BG, borderRadius: 1,
//           },
//           "& .MuiIconButton-root": { p: 0.25 },
//           ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
//         }}
//       />
//     </Box>
//   );
// }


import React from "react";
import {
  Box, Card, ToggleButtonGroup, ToggleButton,
  TextField, InputAdornment, Button, TablePagination,
  FormControl, Select, MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";

/* ---------- Toast ---------- */
import { useToast } from "../../ui/toast/ToastProvider";

/* ---------- API ---------- */
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

/* ---------- Modals ---------- */
import AddUserModal from "../../components/Models/AddUserModal";
import UpdateEntityModal, { type EntityUpdateIn } from "../../components/Models/UpdateEntityModal";
import UpdateAssignmentModal, {
  type AssignmentForEdit as AssignEditRow,
  type AssignmentUpdated as AssignUpdated,
  type SimpleRole as ModalRole,
  type SimpleEntity as ModalEntity,
} from "../../components/Models/UpdateAssignmentModal";

/* ---------- UI constants ---------- */
const CONTROL_BG = "#1C1C1E";
const UI = {
  ctrlH: 30, font: 13, icon: 16, gap: 0.75,
  headerPx: 1.25, headerPy: 0.6, searchW: 260, paginationH: 36,
} as const;

const compactCtrlSx = {
  bgcolor: CONTROL_BG, borderRadius: 1, color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#544f4fff" },
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff" },
  "& .MuiInputBase-input": { height: `${UI.ctrlH - 2}px`, padding: "0 10px", fontSize: UI.font, lineHeight: 1, color: "#fff" },
  "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 1 },
  "& input::-webkit-input-placeholder": { color: "#fff", opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: "rgba(255,255,255,0.9)" },
};

const CARD_SX = {
  bgcolor: "#1C1C1E", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 2, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
  display: "flex", flexDirection: "column" as const,
} as const;

const SCROLLER_SX = {
  scrollbarWidth: "thin",
  scrollbarColor: "#3f3f3f transparent",
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
};

/* ---------- Small grid helper for dynamic fill ---------- */
const gridTemplate = (cols: { width?: number; flex?: number }[]) =>
  cols.map(c => (c.flex ? `minmax(${c.width ?? 120}px, ${c.flex}fr)` : `${c.width ?? 120}px`)).join(" ");

/* ---------- Users table ---------- */
type UserRow = {
  id: string; sr: number; username: string; full_name: string; email: string;
  user_type: "local" | "ldap"; designation: string; entities: string;
  status: "active" | "disabled";
};

type Column = {
  key: keyof UserRow | "action";
  label: string; width?: number; align?: "left" | "center" | "right"; flex?: number;
};

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
  const template = gridTemplate(columns);
  return (
    <Box>
      <Box sx={{ width: "100%", minWidth: 0 }}>
        {/* header */}
        <Box
          sx={{
            position: "sticky", top: 0, zIndex: 1, display: "grid",
            gridTemplateColumns: template,
            bgcolor: "#000", borderBottom: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {columns.map((c) => (
            <Box key={String(c.key)} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: c.align ?? "center", whiteSpace: "nowrap" }}>
              {c.label}
            </Box>
          ))}
        </Box>

        {/* rows */}
        {rows.map((r, idx) => (
          <Box
            key={`${r.id}-${idx}`}
            sx={{
              display: "grid",
              gridTemplateColumns: template,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            {columns.map((c) => {
              if (c.key === "action") {
                const disabled = r.status === "disabled";
                return (
                  <Box key={`action-${idx}`} sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Button
                      size="small" variant="contained"
                      sx={{
                        textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25,
                        bgcolor: disabled ? "#555" : "#ef4a4a",
                        "&:hover": { bgcolor: disabled ? "#666" : "#dd3737" },
                      }}
                      onClick={() => onToggle(r)}
                    >
                      {disabled ? "Enable" : "Disable"}
                    </Button>
                  </Box>
                );
              }
              return (
                <Box
                  key={String(c.key)}
                  sx={{ px: 1.25, py: 1, fontSize: 13, color: "#EAEAEA", textAlign: c.align ?? "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  title={String(r[c.key as keyof UserRow] ?? "")}
                >
                  {r[c.key as keyof UserRow] as any}
                </Box>
              );
            })}
          </Box>
        ))}

        {!rows.length && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No users found.</Box>}
      </Box>
    </Box>
  );
}

/* ---------- Types for Entity / Role / Assign ---------- */
type EntityRow = {
  id: string; sr: number; name: string;
  designations: { id: string; name: string }[]; // using as "description" (single entry now)
};

type RoleRowUI = {
  id: string; sr: number; role: string; access: AccessType;
  is_disabled: 0 | 1; is_system: 0 | 1;
};

type AssignmentRow = AssignmentListRow;

/* ---------- Page ---------- */
export default function IAM() {
  const toast = useToast();

  type TabKey = "users" | "entity" | "role" | "assign";
  const [tab, setTab] = React.useState<TabKey>("users");
  const [search, setSearch] = React.useState("");

  // USERS
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState<UserRow[]>([]);
  const [addOpen, setAddOpen] = React.useState(false);

  // ENTITIES
  const [entities, setEntities] = React.useState<EntityRow[]>([]);
  const [entityPage, setEntityPage] = React.useState(0);
  const [entityRpp, setEntityRpp] = React.useState(10);

  // Add-entity inputs (single description)
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

  // Assignment sub-toggle
  const [assignView, setAssignView] = React.useState<"assigned" | "unassigned">("assigned");
  const [assignedPage, setAssignedPage] = React.useState(0);
  const [assignedRpp, setAssignedRpp] = React.useState(10);
  const [unassignedPage, setUnassignedPage] = React.useState(0);
  const [unassignedRpp, setUnassignedRpp] = React.useState(10);

  // Modals
  const [entityModal, setEntityModal] = React.useState<{ open: boolean; row: EntityUpdateIn | null }>({ open: false, row: null });
  const [assignModal, setAssignModal] = React.useState<{ open: boolean; row: AssignEditRow | null }>({ open: false, row: null });

  /* ----------- Loaders ----------- */
  const reloadUsers = React.useCallback(async () => {
    try {
      const [usersRes, assigns] = await Promise.all([
        listUsers({ page: 1, pageSize: 100 }),
        listAssignments(),
      ]);
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
          designation: a && a.designation?.length ? a.designation.join(", ") : "",
          entities: a ? (a.entity_ids.length === 0 ? "(global)" : a.entities.join(", ")) : "",
          status: (u.status as "active" | "disabled"),
        };
      });
      setRows(mapped);
    } catch (e) {
      console.error("Failed to load users", e);
      setRows([]);
      toast.error("Failed to load users");
    }
  }, [toast]);

  const reloadEntities = React.useCallback(async () => {
    try {
      const es = await getEntities();
      const withDesigs = await Promise.all(
        es.map(async (e: { id: string; name: string }, i: number) => {
          try {
            const des = await getDesignations(e.id);
            return {
              id: e.id, sr: i + 1, name: e.name,
              designations: des.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })),
            } as EntityRow;
          } catch {
            return { id: e.id, sr: i + 1, name: e.name, designations: [] } as EntityRow;
          }
        })
      );
      setEntities(withDesigs);
    } catch (e) {
      console.error("Failed to load entities", e);
      setEntities([]);
      toast.error("Failed to load organization");
    }
  }, [toast]);

  const reloadRoles = React.useCallback(async () => {
    try {
      const apiRoles: ApiRoleRow[] = await getRoles();
      const mapped: RoleRowUI[] = apiRoles.map((r, idx) => ({
        id: r.id, sr: idx + 1, role: r.name, access: r.accessType,
        is_disabled: r.isDisabled, is_system: r.isSystem,
      }));
      setRoles(mapped);
    } catch (e) {
      console.error("Failed to load roles", e);
      setRoles([]);
      toast.error("Failed to load roles");
    }
  }, [toast]);

  const reloadAssignments = React.useCallback(async () => {
    try {
      const rows = await listAssignments();
      setAssignments(rows);
    } catch (e) {
      console.error("Failed to load assignments", e);
      setAssignments([]);
      toast.error("Failed to load assignments");
    }
  }, [toast]);

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
    return rows.filter((r) =>
      [r.username, r.full_name, r.email, r.user_type, r.status]
        .join(" ").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const pagedUsers = React.useMemo(
    () => filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredUsers, page, rowsPerPage]
  );

  const filteredEntities = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return entities;
    return entities.filter((e) =>
      filterMatch(e.name, q) ||
      e.designations.some((d) => filterMatch(d.name, q))
    );
  }, [entities, search]);

  const pagedEntities = React.useMemo(
    () => filteredEntities.slice(entityPage * entityRpp, entityPage * entityRpp + entityRpp),
    [filteredEntities, entityPage, entityRpp]
  );

  const filteredRoles = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter((r) => filterMatch(r.role, q) || filterMatch(r.access, q));
  }, [roles, search]);

  const pagedRoles = React.useMemo(
    () => filteredRoles.slice(rolePage * roleRpp, rolePage * roleRpp + roleRpp),
    [filteredRoles, rolePage, roleRpp]
  );

  // Build assigned / unassigned partitions for Assignment tab
  const byUserId = React.useMemo(() => new Map(assignments.map(a => [a.user_id, a])), [assignments]);

  const rawAssigned = React.useMemo(
    () => assignments.filter(a => (a.role_id && String(a.role_id).length > 0) || (a.entity_ids && a.entity_ids.length > 0)),
    [assignments]
  );

  const rawUnassignedFromAssignments = React.useMemo(
    () => assignments.filter(a => (!a.role_id || String(a.role_id).length === 0) && (!a.entity_ids || a.entity_ids.length === 0)),
    [assignments]
  );

  // const usersMissingInAssignments = React.useMemo(
  //   () => rows.filter(u => !byUserId.has(u.id)).map<AssignmentRow>((u) => ({
  //     id: `u-${u.id}`,
  //     user_id: u.id,
  //     user: u.username,
  //     role: "",
  //     role_id: "",
  //     entities: [],
  //     entity_ids: [],
  //     designation: [],
  //   })),
  //   [rows, byUserId]
  // );

  const usersMissingInAssignments = React.useMemo(
  () =>
    rows
      .filter((u) => !byUserId.has(u.id))
      .map<AssignmentRow>((u) => ({
        id: `u-${u.id}`,
        sr: 0,                            // <- required by AssignmentListRow
        user_id: u.id,
        user: u.username,
        role: "",
        role_id: "",
        entities: [] as string[],         // <- type the arrays
        entity_ids: [] as string[],
        designation: [] as string[],
      })),
  [rows, byUserId]
);


  const allUnassigned = React.useMemo(
    () => [...rawUnassignedFromAssignments, ...usersMissingInAssignments],
    [rawUnassignedFromAssignments, usersMissingInAssignments]
  );

  const searchQ = search.trim().toLowerCase();

  const assignedFiltered = React.useMemo(
    () =>
      !searchQ
        ? rawAssigned
        : rawAssigned.filter(
            (a) =>
              a.user.toLowerCase().includes(searchQ) ||
              a.entities.join(", ").toLowerCase().includes(searchQ) ||
              a.role.toLowerCase().includes(searchQ)
          ),
    [rawAssigned, searchQ]
  );

  const unassignedFiltered = React.useMemo(
    () =>
      !searchQ
        ? allUnassigned
        : allUnassigned.filter((a) => a.user.toLowerCase().includes(searchQ)),
    [allUnassigned, searchQ]
  );

  const assignedPaged = React.useMemo(
    () => assignedFiltered.slice(assignedPage * assignedRpp, assignedPage * assignedRpp + assignedRpp),
    [assignedFiltered, assignedPage, assignedRpp]
  );
  const unassignedPaged = React.useMemo(
    () => unassignedFiltered.slice(unassignedPage * unassignedRpp, unassignedPage * unassignedRpp + unassignedRpp),
    [unassignedFiltered, unassignedPage, unassignedRpp]
  );

  /* ----------- Actions ----------- */
  const handleToggleUser = async (r: UserRow) => {
    const next: "active" | "disabled" = r.status === "disabled" ? "active" : "disabled";
    try {
      await setUserStatus(r.id, next);
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
      toast.success(`User ${r.username} ${next === "disabled" ? "disabled" : "enabled"}`);
    } catch (e: any) {
      console.error("Failed to set user status", e);
      toast.error(e?.message || "Failed to update user");
    }
  };

  const toggleRole = async (r: RoleRowUI) => {
    if (r.is_system) return;
    try {
      await updateRole(r.id, { isDisabled: r.is_disabled ? 0 : 1 });
      await reloadRoles();
      toast.success(`Role ${r.is_disabled ? "enabled" : "disabled"} successfully`);
    } catch (e: any) {
      console.error("Failed to toggle role", e);
      const msg = e?.response?.data?.message || "Failed to update role";
      toast.error(msg);
    }
  };

  const handleAddEntity = async () => {
    const name = entityName.trim();
    const desc = entityDesc.trim();
    if (!name || !desc) return;
    try {
      const { id } = await createEntity({ name });
      // store single description as a "designation" row
      await createDesignation(id, { name: desc });
      setEntityName(""); setEntityDesc("");
      await reloadEntities();
      toast.success("Entity created successfully");
    } catch (e: any) {
      console.error("Failed adding entity", e);
      const msg = e?.response?.data?.message || "Failed to create entity";
      toast.error(msg);
    }
  };

  const handleAddRole = async () => {
    const name = roleName.trim();
    if (!name || !accessType) return;
    try {
      await createRole({ name, accessType: accessType as AccessType });
      setRoleName(""); setAccessType("");
      await reloadRoles();
      toast.success("Role created successfully");
    } catch (e: any) {
      console.error("Failed to create role", e);
      const msg = e?.response?.data?.message || "Failed to create role";
      toast.error(msg);
    }
  };

  // Open modals
  const openUpdateEntity = (row: EntityRow) => {
    const edit: EntityUpdateIn = { id: row.id, name: row.name, designations: row.designations };
    setEntityModal({ open: true, row: edit });
  };

  const openUpdateAssign = (a: AssignmentRow) => {
    const edit: AssignEditRow = {
      userId: a.user_id,
      username: a.user,
      roleId: a.role_id,
      entityIds: a.entity_ids ?? [],        // [] means global
      designations: [],                     // not used anymore in table
    };
    setAssignModal({ open: true, row: edit });
  };

  const handleTab = (_e: React.MouseEvent<HTMLElement>, next: TabKey | null) => {
    if (next) setTab(next);
  };

  /* ---------- Render ---------- */
  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{
            ...CARD_SX,
            width: "100%",
            minWidth: 0,
            mx: 0,
            position: "relative",
          }}
        >
          {/* header */}
          <Box
            sx={{
              px: UI.headerPx, py: UI.headerPy, borderBottom: "1px solid rgba(255,255,255,0.12)",
              display: "grid", alignItems: "center", gridTemplateColumns: "1fr auto 1fr", columnGap: UI.gap,
            }}
          >
            <Box />

            <ToggleButtonGroup
              value={tab} exclusive onChange={handleTab}
              sx={{
                justifySelf: "center", p: 0.5, borderRadius: 999,
                border: "1px solid rgba(255,255,255,.14)", bgcolor: "#171718",
                "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
              }}
            >
              {[
                { key: "users", label: "Users" },
                { key: "entity", label: "Entity" },
                { key: "role", label: "Role" },
                { key: "assign", label: "Assignment" },
              ].map(({ key, label }) => (
                <ToggleButton
                  key={key} value={key} disableRipple
                  sx={{
                    textTransform: "none", fontWeight: 700, fontSize: 13, px: 2, height: 32, lineHeight: "32px",
                    borderRadius: 999, color: "rgba(255,255,255,.72)", bgcolor: "transparent",
                    "&.Mui-selected": {
                      color: "#7CFF8D", bgcolor: "#0E0E10",
                      border: "1px solid rgba(124,255,141,.18)", boxShadow: "inset 0 0 0 1px rgba(124,255,141,.10)",
                    },
                    "&:hover": { bgcolor: "rgba(255,255,255,.06)" },
                  }}
                >
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {/* search */}
            <Box sx={{ justifySelf: "end", display: "flex", alignItems: "center", gap: UI.gap }}>
              <TextField
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0); setEntityPage(0); setRolePage(0); setAssignedPage(0); setUnassignedPage(0);
                }}
                placeholder="Search…"
                size="small"
                sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ mr: 0.25 }}>
                      <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,.75)" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/* toolbars */}
          {tab === "users" && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", px: 1.25, pt: 1, pb: 0.5 }}>
              <Button
                startIcon={<AddIcon />} variant="contained" onClick={() => setAddOpen(true)}
                sx={{ textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
              >
                Add User
              </Button>
            </Box>
          )}

          {tab === "entity" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, pt: 1, pb: 0.5, flexWrap: "wrap" }}>
              <Box sx={{ fontWeight: 700, mr: 1 }}>Add New Entity</Box>
              <TextField placeholder="Entity name" value={entityName} onChange={(e) => setEntityName(e.target.value)} size="small" sx={{ width: 260, ...compactCtrlSx }} />
              <TextField
                placeholder="Entity Description"
                value={entityDesc}
                onChange={(e) => setEntityDesc(e.target.value)}
                size="small"
                sx={{ width: 320, ...compactCtrlSx }}
              />
              <Box sx={{ ml: "auto" }}>
                <Button
                  startIcon={<AddIcon />} variant="contained" onClick={handleAddEntity}
                  disabled={!entityName.trim() || !entityDesc.trim()}
                  sx={{
                    textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#7C57F2",
                    "&:hover": { bgcolor: "#6b48ea" },
                    "&.Mui-disabled": {
                      bgcolor: "#2d2d2f", color: "#b5b7bd", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "none", opacity: 1,
                    },
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          )}

          {tab === "role" && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.25, pt: 1, pb: 0.5, flexWrap: "wrap" }}>
              <Box sx={{ fontWeight: 700, mr: 1 }}>Add Role</Box>
              <TextField
                placeholder="Role name"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                size="small"
                sx={{ width: 260, ...compactCtrlSx }}
              />
              <FormControl size="small" sx={{ width: 260 }}>
                <Select
                  value={accessType}
                  onChange={(e) => setAccessType((e.target.value as any) || "")}
                  displayEmpty
                  renderValue={(val) => (val ? (val as string) : "Role description")}
                  sx={{ ...compactCtrlSx, "& .MuiSelect-select": { display: "flex", alignItems: "center", paddingRight: "28px !important" } }}
                >
                  <MenuItem disabled value="">Role description</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Guest">Guest</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ ml: "auto" }}>
                <Button
                  startIcon={<AddIcon />} variant="contained" onClick={handleAddRole}
                  disabled={!roleName.trim() || !accessType}
                  sx={{
                    textTransform: "none", fontWeight: 700, fontSize: 12.5, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" },
                    "&.Mui-disabled": { bgcolor: "#2d2d2f", color: "#b5b7bd", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "none", opacity: 1 },
                  }}
                >
                  Add
                </Button>
              </Box>
            </Box>
          )}

          {/* body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
              <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
                {/* USERS */}
                {tab === "users" && <DarkUsersTable rows={pagedUsers} columns={COLUMNS} onToggle={handleToggleUser} />}

                {/* ENTITY */}
                {tab === "entity" && (
                  <Box sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        position: "sticky", top: 0, zIndex: 1, display: "grid",
                        gridTemplateColumns: gridTemplate([
                          { width: 120 },                 // Sr No
                          { width: 220, flex: 1 },        // Entity Name
                          { width: 220, flex: 1 },        // Description
                          { width: 200 },                  // Action
                        ]),
                        bgcolor: "#000", borderBottom: "1px solid rgba(255,255,255,.14)",
                      }}
                    >
                      {["Sr No", "Entity Name", "Description", "Action"].map((h) => (
                        <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
                          {h}
                        </Box>
                      ))}
                    </Box>

                    {pagedEntities.map((e, idx) => (
                      <Box
                        key={e.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: gridTemplate([
                            { width: 120 },
                            { width: 220, flex: 1 },
                            { width: 220, flex: 1 },
                            { width: 200 },
                          ]),
                          borderBottom: "1px solid rgba(255,255,255,.08)",
                          bgcolor: (entityPage * entityRpp + idx) % 2 ? "rgba(255,255,255,.02)" : "transparent",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{entityPage * entityRpp + idx + 1}</Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{e.name}</Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                          {e.designations.map((d) => d.name).join(", ")}
                        </Box>
                        <Box sx={{ px: 1.25, py: 0.75, textAlign: "center", display: "flex", gap: 1, justifyContent: "center" }}>
                          <Button
                            size="small" variant="contained"
                            sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" } }}
                            onClick={() => openUpdateEntity(e)}
                          >
                            Update
                          </Button>
                        </Box>
                      </Box>
                    ))}
                    {!entities.length && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No data.</Box>}
                  </Box>
                )}

                {/* ROLE */}
                {tab === "role" && (
                  <Box sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        position: "sticky", top: 0, zIndex: 1, display: "grid",
                        gridTemplateColumns: gridTemplate([
                          { width: 120 },
                          { width: 220, flex: 1 },
                          { width: 220, flex: 1 },
                          { width: 180 },
                        ]),
                        bgcolor: "#000",
                        borderBottom: "1px solid rgba(255,255,255,.14)",
                      }}
                    >
                      {["Sr No", "Role name", "Role description", "Action"].map((h) => (
                        <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
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
                            { width: 120 },
                            { width: 220, flex: 1 },
                            { width: 220, flex: 1 },
                            { width: 180 },
                          ]),
                          borderBottom: "1px solid rgba(255,255,255,.08)",
                          bgcolor: (rolePage * roleRpp + idx) % 2 ? "rgba(255,255,255,.02)" : "transparent",
                          alignItems: "center",
                        }}
                      >
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{rolePage * roleRpp + idx + 1}</Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                          {r.role} {r.is_disabled && !r.is_system ? "(disabled)" : ""}
                        </Box>
                        <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.access}</Box>
                        <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                          {r.is_system ? (
                            <Box sx={{ fontSize: 13, color: "#aaa" }}>--</Box>
                          ) : (
                            <Button
                              size="small" variant="contained"
                              sx={{
                                minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700,
                                bgcolor: r.is_disabled ? "#2e7d32" : "#ef4a4a",
                                "&:hover": { bgcolor: r.is_disabled ? "#1b5e20" : "#dd3737" },
                              }}
                              onClick={() => toggleRole(r)}
                            >
                              {r.is_disabled ? "Enable" : "Disable"}
                            </Button>
                          )}
                        </Box>
                      </Box>
                    ))}
                    {!roles.length && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No data.</Box>}
                  </Box>
                )}

                {/* ASSIGN (with toggle) */}
                {tab === "assign" && (
                  <Box sx={{ width: "100%", display: "grid", gap: 1.25 }}>
                    <Box sx={{ display: "flex", justifyContent: "flex-start", px: 1, pt: 0.5 }}>
                      <ToggleButtonGroup
                        value={assignView}
                        exclusive
                        onChange={(_, v) => { if (v) setAssignView(v); }}
                        sx={{
                          p: 0.5, borderRadius: 999,
                          border: "1px solid rgba(255,255,255,.14)", bgcolor: "#171718",
                          "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
                        }}
                      >
                        <ToggleButton
                          value="assigned" disableRipple
                          sx={{
                            textTransform: "none", fontWeight: 700, fontSize: 13, px: 2, height: 30,
                            borderRadius: 999, color: "rgba(255,255,255,.78)",
                            "&.Mui-selected": {
                              color: "#7CFF8D", bgcolor: "#0E0E10",
                              border: "1px solid rgba(124,255,141,.18)", boxShadow: "inset 0 0 0 1px rgba(124,255,141,.10)",
                            },
                          }}
                        >
                          Already Assigned Users
                        </ToggleButton>
                        <ToggleButton
                          value="unassigned" disableRipple
                          sx={{
                            textTransform: "none", fontWeight: 700, fontSize: 13, px: 2, height: 30,
                            borderRadius: 999, color: "rgba(255,255,255,.78)",
                            "&.Mui-selected": {
                              color: "#7CFF8D", bgcolor: "#0E0E10",
                              border: "1px solid rgba(124,255,141,.18)", boxShadow: "inset 0 0 0 1px rgba(124,255,141,.10)",
                            },
                          }}
                        >
                          Assign New created User
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* table header */}
                    <Box
                      sx={{
                        position: "sticky", top: 0, zIndex: 1, display: "grid",
                        gridTemplateColumns: gridTemplate([
                          { width: 100 },                 // No
                          { width: 260, flex: 1 },        // User
                          { width: 260, flex: 1 },        // Entity
                          { width: 220, flex: 1 },        // Role Name
                          { width: 140 },                  // Action
                        ]),
                        bgcolor: "#000", borderBottom: "1px solid rgba(255,255,255,.14)",
                      }}
                    >
                      {["No", "User", "Entity", "Role Name", "Action"].map((h) => (
                        <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
                          {h}
                        </Box>
                      ))}
                    </Box>

                    {/* rows */}
                    {(assignView === "assigned" ? assignedPaged : unassignedPaged).map((a, idx) => {
                      const i = assignView === "assigned"
                        ? assignedPage * assignedRpp + idx + 1
                        : unassignedPage * unassignedRpp + idx + 1;
                      return (
                        <Box
                          key={a.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: gridTemplate([
                              { width: 100 },
                              { width: 260, flex: 1 },
                              { width: 260, flex: 1 },
                              { width: 220, flex: 1 },
                              { width: 140 },
                            ]),
                            borderBottom: "1px solid rgba(255,255,255,.08)",
                            bgcolor: i % 2 ? "rgba(255,255,255,.02)" : "transparent",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{i}</Box>
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{a.user}</Box>
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                            {a.entity_ids.length === 0 ? (assignView === "assigned" ? "(global)" : "-") : a.entities.join(", ")}
                          </Box>
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{a.role || "-"}</Box>
                          <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                            <Button
                              size="small" variant="contained"
                              sx={{ minWidth: 70, height: 28, fontSize: 12, textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" } }}
                              onClick={() => openUpdateAssign(a)}
                            >
                              Update
                            </Button>
                          </Box>
                        </Box>
                      );
                    })}

                    {/* empty state */}
                    {assignView === "assigned" && !assignedFiltered.length && (
                      <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No assigned users.</Box>
                    )}
                    {assignView === "unassigned" && !unassignedFiltered.length && (
                      <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No unassigned users.</Box>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          {/* paginations (per tab) */}
          {tab === "users"  && <Pagination count={filteredUsers.length}   page={page}        setPage={setPage}        rpp={rowsPerPage} setRpp={setRowsPerPage} />}
          {tab === "entity" && <Pagination count={filteredEntities.length} page={entityPage} setPage={setEntityPage} rpp={entityRpp}  setRpp={setEntityRpp}  />}
          {tab === "role"   && <Pagination count={filteredRoles.length}   page={rolePage}   setPage={setRolePage}   rpp={roleRpp}   setRpp={setRoleRpp}   />}
          {tab === "assign" && (
            assignView === "assigned" ? (
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
            )
          )}
        </Card>
      </Box>

      {/* Modals */}
      <AddUserModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={() => {
          setAddOpen(false);
          reloadUsers();
          toast.success("User created successfully");
        }}
      />

      <UpdateEntityModal
        open={entityModal.open}
        row={entityModal.row}
        onClose={() => setEntityModal({ open: false, row: null })}
        onUpdated={async () => {
          await reloadEntities();
          toast.success("Entity updated");
        }}
        onDeleted={async () => {
          await reloadEntities();
          toast.success("Entity deleted");
        }}
      />

      {assignModal.row && (
        <UpdateAssignmentModal
          open={true}
          row={assignModal.row}
          roles={roles.map<ModalRole>((r) => ({ id: r.id, name: r.role, disabled: !!r.is_disabled }))}
          entities={entities.map<ModalEntity>((e) => ({
            id: e.id, name: e.name, designations: e.designations.map((d) => d.name),
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
              setAssignView("assigned");           // ⬅ show result in Assigned
              setAssignedPage(0);
              toast.success("Assignment updated");
            } catch (err: any) {
              console.error("Failed to update assignment", err);
              const msg = err?.response?.data?.message || "Failed to update assignment";
              toast.error(msg);
            }
          }}
        />
      )}
    </MainLayout>
  );
}

/* small pagination helper */
function Pagination({
  count, page, setPage, rpp, setRpp,
}: {
  count: number; page: number; setPage: (p: number) => void; rpp: number; setRpp: (n: number) => void;
}) {
  const CONTROL_BG = "#1C1C1E";
  const UI = { ctrlH: 30, font: 13, icon: 16, paginationH: 36 } as const;
  return (
    <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rpp}
        onRowsPerPageChange={(e) => { setRpp(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          px: 1, color: "#E8E8EA", minHeight: UI.paginationH,
          "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: UI.font, m: 0 },
          "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
          "& .MuiSelect-select": {
            py: 0, px: 1, fontSize: UI.font, height: UI.ctrlH - 6,
            display: "flex", alignItems: "center", bgcolor: CONTROL_BG, borderRadius: 1,
          },
          "& .MuiIconButton-root": { p: 0.25 },
          ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
        }}
      />
    </Box>
  );
}
