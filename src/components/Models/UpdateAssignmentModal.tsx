// import * as React from "react";
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Box, Typography, TextField, Button,
//   FormControl, Select, MenuItem, Checkbox, ListItemText
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";

// /* ---- shared styles ---- */
// const CONTROL_BG = "#1C1C1E";
// const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
// const UI = { ctrlH: 30, font: 13, icon: 16 };

// const compactCtrlSx = {
//   bgcolor: CONTROL_BG,
//   borderRadius: 1,
//   color: "#fff",
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: "#544f4fff",
//   },
//   "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff" },
//   "& .MuiInputBase-input": {
//     height: `${UI.ctrlH - 2}px`,
//     padding: "0 10px",
//     fontSize: UI.font,
//     lineHeight: 1,
//     color: "#fff",
//   },
//   "& .MuiSelect-select": {
//     height: `${UI.ctrlH - 2}px`,
//     padding: "0 28px 0 10px",
//     display: "flex",
//     alignItems: "center",
//     fontSize: UI.font,
//     color: "#fff",
//   },
//   "& .MuiSelect-icon": {
//     top: "50%",
//     transform: "translateY(-50%)",
//     right: 8,
//     color: "rgba(255,255,255,0.9)",
//   },
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

// /* ---- types (string IDs to match backend UUIDs) ---- */
// export type SimpleRole = { id: string; name: string; disabled?: boolean };
// export type SimpleEntity = { id: string; name: string; designations?: string[] };

// export type AssignmentForEdit = {
//   userId: string;
//   username: string;
//   roleId: string | null;
//   entityIds: string[];      // [] => global
//   designations: string[];
// };

// export type AssignmentUpdated = {
//   userId: string;
//   roleId: string;           // selected role UUID
//   entityIds: string[];      // [] => global (parent will normalize)
//   designations: string[];
// };

// const GLOBAL_ID = "0";

// export default function UpdateAssignmentModal({
//   open,
//   row,
//   roles,
//   entities,
//   onClose,
//   onUpdate,
// }: {
//   open: boolean;
//   row: AssignmentForEdit | null;
//   roles: SimpleRole[];
//   entities: SimpleEntity[];
//   onClose: () => void;
//   onUpdate: (updated: AssignmentUpdated) => void | Promise<void>;
// }) {
//   const [roleId, setRoleId] = React.useState<string | "">("");
//   const [entityIds, setEntityIds] = React.useState<string[]>([]);
//   const [designations, setDesignations] = React.useState<string[]>([]);

//   React.useEffect(() => {
//     if (!open || !row) return;
//     setRoleId(row.roleId ?? "");
//     setEntityIds(row.entityIds?.length ? [...row.entityIds] : [GLOBAL_ID]);
//     setDesignations(row.designations ?? []);
//   }, [open, row]);

//   if (!row) return null;

//   // union of designations across selected entities (not for global)
//   const designationOptions: string[] = React.useMemo(() => {
//     if (!entityIds.length || entityIds.includes(GLOBAL_ID)) return [];
//     const set = new Set<string>();
//     entityIds.forEach((id) => {
//       const ent = entities.find((e) => e.id === id);
//       (ent?.designations || []).forEach((d) => set.add(d));
//     });
//     return Array.from(set);
//   }, [entityIds, entities]);

//   // keep selected designations valid for chosen entities
//   React.useEffect(() => {
//     if (entityIds.includes(GLOBAL_ID)) {
//       setDesignations([]);
//     } else {
//       setDesignations((prev) => prev.filter((d) => designationOptions.includes(d)));
//     }
//   }, [entityIds, designationOptions]);

//   const canUpdate = typeof roleId === "string" && roleId !== "";

//   const handleEntityChange = (e: SelectChangeEvent<any>) => {
//     const value = e.target.value as string[]; // MUI multiple always array
//     const next = Array.isArray(value) ? value : [value];
//     setEntityIds(next.includes(GLOBAL_ID) ? [GLOBAL_ID] : next.filter((v) => v !== GLOBAL_ID));
//   };

//   const handleDesignationChange = (e: SelectChangeEvent<any>) => {
//     const next = e.target.value as string[];
//     setDesignations(next || []);
//   };

//   const handleUpdate = async () => {
//     if (!canUpdate || !row) return;
//     await onUpdate({
//       userId: row.userId,
//       roleId: roleId as string,
//       entityIds: entityIds.length ? entityIds : [GLOBAL_ID],
//       designations,
//     });
//     onClose();
//   };

//   const renderEntityValue = (vals: any) => {
//     const v = vals as string[];
//     if (!v.length || v.includes(GLOBAL_ID)) return "(global)";
//     return v.map((id) => entities.find((e) => e.id === id)?.name || String(id)).join(", ");
//   };

//   const renderDesignationValue = (vals: any) => {
//     const v = vals as string[];
//     return v.length ? v.join(", ") : "Select Designation";
//   };

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
//       <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update Assignment</DialogTitle>

//       <DialogContent
//         dividers
//         sx={{ borderColor: "rgba(255,255,255,0.12)", "& .MuiDialogContent-root": { p: 0 } }}
//       >
//         <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
//           {/* User (readonly) */}
//           <Box>
//             <Typography sx={labelSx}>User</Typography>
//             <TextField size="small" fullWidth value={row.username} sx={compactCtrlSx} inputProps={{ readOnly: true }} />
//           </Box>

//           {/* Role */}
//           <Box>
//             <Typography sx={labelSx}>Role</Typography>
//             <FormControl size="small" fullWidth>
//               <Select
//                 value={roleId === "" ? "" : String(roleId)}
//                 onChange={(e: SelectChangeEvent) => setRoleId(e.target.value as string)}
//                 sx={compactCtrlSx}
//                 MenuProps={darkMenu}
//                 displayEmpty
//                 renderValue={(val) => {
//                   if (!val) return "Select Role";
//                   const r = roles.find((x) => String(x.id) === String(val));
//                   return r ? r.name : "Select Role";
//                 }}
//               >
//                 <MenuItem disabled value="">
//                   Select Role
//                 </MenuItem>
//                 {roles.map((r) => (
//                   <MenuItem key={r.id} value={r.id} disabled={!!r.disabled}>
//                     {r.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>

//           {/* Entity (multi) */}
//           <Box>
//             <Typography sx={labelSx}>Entity</Typography>
//             <FormControl size="small" fullWidth>
//               <Select
//                 multiple
//                 value={entityIds}
//                 onChange={handleEntityChange}
//                 sx={compactCtrlSx}
//                 MenuProps={darkMenu}
//                 displayEmpty
//                 renderValue={renderEntityValue}
//               >
//                 <MenuItem value={GLOBAL_ID}>
//                   <Checkbox size="small" checked={entityIds.includes(GLOBAL_ID)} />
//                   <ListItemText primary="(global)" />
//                 </MenuItem>
//                 {entities.map((e) => {
//                   const checked = entityIds.includes(e.id);
//                   return (
//                     <MenuItem key={e.id} value={e.id}>
//                       <Checkbox size="small" checked={checked} />
//                       <ListItemText primary={e.name} />
//                     </MenuItem>
//                   );
//                 })}
//               </Select>
//             </FormControl>
//           </Box>

//           {/* Designation (multi, tied to entities) */}
//           <Box>
//             <Typography sx={labelSx}>Designation</Typography>
//             <FormControl size="small" fullWidth>
//               <Select
//                 multiple
//                 value={designations}
//                 onChange={handleDesignationChange}
//                 sx={compactCtrlSx}
//                 MenuProps={darkMenu}
//                 displayEmpty
//                 disabled={entityIds.includes(GLOBAL_ID) || entityIds.length === 0}
//                 renderValue={renderDesignationValue}
//               >
//                 <MenuItem disabled value="">
//                   Select Designation
//                 </MenuItem>
//                 {designationOptions.map((d) => (
//                   <MenuItem key={d} value={d}>
//                     <Checkbox size="small" checked={designations.indexOf(d) > -1} />
//                     <ListItemText primary={d} />
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1.25 }}>
//         <Box sx={{ flex: 1 }} />
//         <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleUpdate}
//           disabled={!canUpdate}
//           variant="contained"
//           sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
//         >
//           Update
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }




// import * as React from "react";
// import {
//   Dialog, DialogTitle, DialogContent, DialogActions,
//   Box, Typography, TextField, Button,
//   FormControl, Select, MenuItem, Checkbox, ListItemText
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";

// /* ---- shared styles ---- */
// const CONTROL_BG = "#1C1C1E";
// const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
// const UI = { ctrlH: 30, font: 13, icon: 16 };

// const compactCtrlSx = {
//   bgcolor: CONTROL_BG,
//   borderRadius: 1,
//   color: "#fff",
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: "#544f4fff",
//   },
//   "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff" },
//   "& .MuiInputBase-input": {
//     height: `${UI.ctrlH - 2}px`,
//     padding: "0 10px",
//     fontSize: UI.font,
//     lineHeight: 1,
//     color: "#fff",
//   },
//   "& .MuiSelect-select": {
//     height: `${UI.ctrlH - 2}px`,
//     padding: "0 28px 0 10px",
//     display: "flex",
//     alignItems: "center",
//     fontSize: UI.font,
//     color: "#fff",
//   },
//   "& .MuiSelect-icon": {
//     top: "50%",
//     transform: "translateY(-50%)",
//     right: 8,
//     color: "rgba(255,255,255,0.9)",
//   },
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

// /* ---- types (string IDs to match backend UUIDs) ---- */
// export type SimpleRole = { id: string; name: string; disabled?: boolean };
// export type SimpleEntity = { id: string; name: string; designations?: string[] };

// export type AssignmentForEdit = {
//   userId: string;
//   username: string;
//   roleId: string | null;
//   entityIds: string[];      // [] => global
//   designations: string[];   // names
// };

// export type AssignmentUpdated = {
//   userId: string;
//   roleId: string;           // selected role UUID
//   entityIds: string[];      // [] => global (parent will normalize)
//   designations: string[];   // names
// };

// const GLOBAL_ID = "0";

// export default function UpdateAssignmentModal({
//   open,
//   row,
//   roles,
//   entities,
//   onClose,
//   onUpdate,
// }: {
//   open: boolean;
//   row: AssignmentForEdit | null;
//   roles: SimpleRole[];
//   entities: SimpleEntity[];
//   onClose: () => void;
//   onUpdate: (updated: AssignmentUpdated) => void | Promise<void>;
// }) {
//   const [roleId, setRoleId] = React.useState<string | "">("");
//   const [entityIds, setEntityIds] = React.useState<string[]>([]);
//   const [designations, setDesignations] = React.useState<string[]>([]);

//   // seed state from row
//   React.useEffect(() => {
//     if (!open || !row) return;
//     setRoleId(row.roleId ?? "");
//     setEntityIds(row.entityIds?.length ? [...row.entityIds] : [GLOBAL_ID]);
//     setDesignations(row.designations ?? []);
//   }, [open, row]);

//   if (!row) return null;

//   // union of designations across selected entities (not for global)
//   const designationOptions: string[] = React.useMemo(() => {
//     if (!entityIds.length || entityIds.includes(GLOBAL_ID)) return [];
//     const set = new Set<string>();
//     entityIds.forEach((id) => {
//       const ent = entities.find((e) => e.id === id);
//       (ent?.designations || []).forEach((d) => set.add(d));
//     });
//     return Array.from(set);
//   }, [entityIds, entities]);

//   // keep selected designations valid, but only AFTER options are known
//   React.useEffect(() => {
//     if (entityIds.includes(GLOBAL_ID)) {
//       setDesignations([]);
//       return;
//     }
//     if (designationOptions.length === 0) return; // <- critical guard (prevents wiping initial selections)
//     setDesignations((prev) => prev.filter((d) => designationOptions.includes(d)));
//   }, [entityIds, designationOptions]);

//   const canUpdate = typeof roleId === "string" && roleId !== "";

//   const handleEntityChange = (e: SelectChangeEvent<any>) => {
//     const value = e.target.value as string[]; // MUI multiple always array
//     const next = Array.isArray(value) ? value : [value];
//     setEntityIds(next.includes(GLOBAL_ID) ? [GLOBAL_ID] : next.filter((v) => v !== GLOBAL_ID));
//   };

//   const handleDesignationChange = (e: SelectChangeEvent<any>) => {
//     const next = e.target.value as string[];
//     setDesignations(next || []);
//   };

//   const handleUpdate = async () => {
//     if (!canUpdate || !row) return;
//     await onUpdate({
//       userId: row.userId,
//       roleId: roleId as string,
//       entityIds: entityIds.length ? entityIds : [GLOBAL_ID],
//       designations,
//     });
//     onClose();
//   };

//   const renderEntityValue = (vals: any) => {
//     const v = vals as string[];
//     if (!v.length || v.includes(GLOBAL_ID)) return "(global)";
//     return v.map((id) => entities.find((e) => e.id === id)?.name || String(id)).join(", ");
//   };

//   const renderDesignationValue = (vals: any) => {
//     const v = vals as string[];
//     return v.length ? v.join(", ") : "Select Designation";
//   };

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
//       <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update Assignment</DialogTitle>

//       <DialogContent
//         dividers
//         sx={{ borderColor: "rgba(255,255,255,0.12)", "& .MuiDialogContent-root": { p: 0 } }}
//       >
//         <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
//           {/* User (readonly) */}
//           <Box>
//             <Typography sx={labelSx}>User</Typography>
//             <TextField size="small" fullWidth value={row.username} sx={compactCtrlSx} inputProps={{ readOnly: true }} />
//           </Box>

//           {/* Role */}
//           <Box>
//             <Typography sx={labelSx}>Role</Typography>
//             <FormControl size="small" fullWidth>
//               <Select
//                 value={roleId === "" ? "" : String(roleId)}
//                 onChange={(e: SelectChangeEvent) => setRoleId(e.target.value as string)}
//                 sx={compactCtrlSx}
//                 MenuProps={darkMenu}
//                 displayEmpty
//                 renderValue={(val) => {
//                   if (!val) return "Select Role";
//                   const r = roles.find((x) => String(x.id) === String(val));
//                   return r ? r.name : "Select Role";
//                 }}
//               >
//                 <MenuItem disabled value="">
//                   Select Role
//                 </MenuItem>
//                 {roles.map((r) => (
//                   <MenuItem key={r.id} value={r.id} disabled={!!r.disabled}>
//                     {r.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>

//           {/* Entity (multi) */}
//           <Box>
//             <Typography sx={labelSx}>Entity</Typography>
//             <FormControl size="small" fullWidth>
//               <Select
//                 multiple
//                 value={entityIds}
//                 onChange={handleEntityChange}
//                 sx={compactCtrlSx}
//                 MenuProps={darkMenu}
//                 displayEmpty
//                 renderValue={renderEntityValue}
//               >
//                 <MenuItem value={GLOBAL_ID}>
//                   <Checkbox size="small" checked={entityIds.includes(GLOBAL_ID)} />
//                   <ListItemText primary="(global)" />
//                 </MenuItem>
//                 {entities.map((e) => {
//                   const checked = entityIds.includes(e.id);
//                   return (
//                     <MenuItem key={e.id} value={e.id}>
//                       <Checkbox size="small" checked={checked} />
//                       <ListItemText primary={e.name} />
//                     </MenuItem>
//                   );
//                 })}
//               </Select>
//             </FormControl>
//           </Box>

//           {/* Designation (multi, tied to entities) */}
//           <Box>
//             <Typography sx={labelSx}>Designation</Typography>
//             <FormControl size="small" fullWidth>
//               <Select
//                 multiple
//                 value={designations}
//                 onChange={handleDesignationChange}
//                 sx={compactCtrlSx}
//                 MenuProps={darkMenu}
//                 displayEmpty
//                 disabled={entityIds.includes(GLOBAL_ID) || entityIds.length === 0}
//                 renderValue={renderDesignationValue}
//               >
//                 <MenuItem disabled value="">
//                   Select Designation
//                 </MenuItem>
//                 {designationOptions.map((d) => (
//                   <MenuItem key={d} value={d}>
//                     <Checkbox size="small" checked={designations.includes(d)} />
//                     <ListItemText primary={d} />
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1.25 }}>
//         <Box sx={{ flex: 1 }} />
//         <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleUpdate}
//           disabled={!canUpdate}
//           variant="contained"
//           sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
//         >
//           Update
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }


import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button,
  FormControl, Select, MenuItem, Checkbox, ListItemText
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

/* ---- shared styles ---- */
const CONTROL_BG = "#1C1C1E";
const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
const UI = { ctrlH: 30, font: 13, icon: 16 };

const compactCtrlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#544f4fff",
  },
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff" },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
    color: "#fff",
  },
  "& .MuiSelect-select": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 28px 0 10px",
    display: "flex",
    alignItems: "center",
    fontSize: UI.font,
    color: "#fff",
  },
  "& .MuiSelect-icon": {
    top: "50%",
    transform: "translateY(-50%)",
    right: 8,
    color: "rgba(255,255,255,0.9)",
  },
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

/* ---- types (string IDs to match backend UUIDs) ---- */
export type SimpleRole   = { id: string; name: string; disabled?: boolean };
export type SimpleEntity = { id: string; name: string; designations?: string[] };

export type AssignmentForEdit = {
  userId: string;
  username: string;
  roleId: string | null;
  entityIds: string[];      // [] => global
  designations: string[];   // not edited; displayed as description
};

export type AssignmentUpdated = {
  userId: string;
  roleId: string | "";      // "" means clear role
  entityIds: string[];      // [] means global (parent normalizes "0" → [])
  designations: string[];   // derived description strings
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
  const [roleId, setRoleId] = React.useState<string | "">("");
  const [entityIds, setEntityIds] = React.useState<string[]>([]);

  // keep initial snapshot to detect changes
  const initRef = React.useRef<{ roleId: string | ""; entityIds: string[] } | null>(null);

  // seed state from row
  React.useEffect(() => {
    if (!open || !row) return;
    const initRole = row.roleId ?? "";
    const initEntities = row.entityIds?.length ? [...row.entityIds] : [GLOBAL_ID];

    setRoleId(initRole);
    setEntityIds(initEntities);

    initRef.current = {
      roleId: initRole,
      entityIds: initEntities.slice().sort(),
    };
  }, [open, row]);

  if (!row) return null;

  /* compute Entity Description (union of designations for selected entities) */
  const entityDescriptions: string[] = React.useMemo(() => {
    if (!entityIds.length || entityIds.includes(GLOBAL_ID)) return [];
    const set = new Set<string>();
    entityIds.forEach((id) => {
      const ent = entities.find((e) => e.id === id);
      (ent?.designations || []).forEach((d) => set.add(d));
    });
    return Array.from(set);
  }, [entityIds, entities]);

  /* isDirty: only roles/entities drive the update button */
  const isDirty = React.useMemo(() => {
    if (!initRef.current) return true;
    const a = initRef.current;
    const eq = (xs: string[], ys: string[]) =>
      xs.slice().sort().join("|") === ys.slice().sort().join("|");
    if ((a.roleId || "") !== (roleId || "")) return true;
    if (!eq(a.entityIds, entityIds)) return true;
    return false;
  }, [roleId, entityIds]);

  /* handlers */
  const handleEntityChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    const next = typeof v === "string" ? v.split(",") : (v as string[]);
    setEntityIds(next.includes(GLOBAL_ID) ? [GLOBAL_ID] : next.filter((x) => x !== GLOBAL_ID));
  };

  const handleUpdate = async () => {
    await onUpdate({
      userId: row.userId,
      roleId,                                           // parent maps "" → null
      entityIds: entityIds.length ? entityIds : [GLOBAL_ID],
      designations: entityDescriptions,                 // ← derived, read-only
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
      PaperProps={{ sx: { bgcolor: "#151517", color: "#EDEDED", border: CONTROL_BORDER, borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update Assignment</DialogTitle>

      <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
          {/* User (readonly) */}
          <Box>
            <Typography sx={labelSx}>User</Typography>
            <TextField size="small" fullWidth value={row.username} sx={compactCtrlSx} inputProps={{ readOnly: true }} />
          </Box>

          {/* Role (single) */}
          <Box>
            <Typography sx={labelSx}>Role</Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={roleId}
                onChange={(e: SelectChangeEvent) => setRoleId(e.target.value as string)}
                sx={compactCtrlSx}
                MenuProps={darkMenu}
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

          {/* Entity (multi) */}
          <Box>
            <Typography sx={labelSx}>Entity</Typography>
            <FormControl size="small" fullWidth>
              <Select<string[]>
                multiple
                value={entityIds}
                onChange={handleEntityChange}
                sx={compactCtrlSx}
                MenuProps={darkMenu}
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

          {/* Entity Description (read-only) */}
          <Box>
            <Typography sx={labelSx}>Entity Description</Typography>
            <TextField
              size="small"
              fullWidth
              value={
                !entityIds.length || entityIds.includes(GLOBAL_ID)
                  ? ""
                  : entityDescriptions.join(", ")
              }
              placeholder="—"
              sx={compactCtrlSx}
              inputProps={{ readOnly: true }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.25 }}>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
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
