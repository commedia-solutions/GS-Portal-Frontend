// // src/components/Models/UpdateEntityModal.tsx
// import * as React from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Chip,
// } from "@mui/material";

// import {
//   getDesignations,
//   updateEntity,
//   deleteEntity,
//   createDesignation,
//   deleteDesignation,
// } from "../../api/iam"; // <- change to "../../api/iam" if you don't use "@/"

// const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
// const CONTROL_BG = "#1C1C1E";
// const UI = { ctrlH: 30, font: 13 } as const;

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
//   "& .MuiInputBase-input": {
//     padding: "0 10px",
//     height: `${UI.ctrlH - 2}px`,
//     lineHeight: `${UI.ctrlH - 2}px`,
//     fontSize: UI.font,
//     color: "#fff",
//     display: "flex",
//     alignItems: "center",
//   },
// } as const;

// const labelSx = { color: "rgba(255,255,255,0.7)", mb: 0.5, fontSize: 12 };
// const helperReset = { m: 0, lineHeight: 1, minHeight: 0, p: 0 } as const;

// export type EntityUpdateIn = {
//   id: string | number;
//   name: string;
//   // optional — we always refetch actual list on open
//   designations?: Array<string | { id?: string | number; name: string }>;
// };

// export default function UpdateEntityModal({
//   open,
//   row,
//   onClose,
//   onUpdated,
//   onDeleted,
// }: {
//   open: boolean;
//   row: EntityUpdateIn | null;
//   onClose: () => void;
//   onUpdated?: () => void; // ask parent to reload entities
//   onDeleted?: () => void; // ask parent to reload entities
// }) {
//   const [name, setName] = React.useState(row?.name ?? "");
//   const [input, setInput] = React.useState("");
//   const [chips, setChips] = React.useState<string[]>([]);
//   const [busy, setBusy] = React.useState(false);
//   const [err, setErr] = React.useState("");

//   // keep a map of base designations (name -> id) so we can diff
//   const baseMapRef = React.useRef<Map<string, string>>(new Map());

//   React.useEffect(() => {
//     if (!open || !row) return;

//     setName(row.name);
//     setInput("");
//     setErr("");
//     setBusy(false);

//     // (re)load designations from backend
//     (async () => {
//       try {
//         const entityId = String(row.id);
//         const list = await getDesignations(entityId);
//         baseMapRef.current = new Map(
//           list.map((d) => [d.name.trim(), String(d.id)])
//         );
//         setChips(list.map((d) => d.name));
//       } catch (e) {
//         // fall back to whatever we had on the row, if present
//         const fromRow =
//           (row.designations || []).map((d) =>
//             typeof d === "string" ? d : d.name
//           ) ?? [];
//         baseMapRef.current = new Map(
//           fromRow.map((n, i) => [n.trim(), String(i + 1)])
//         );
//         setChips(fromRow);
//       }
//     })();
//   }, [open, row]);

//   const addFromInput = () => {
//     const raw = input.trim();
//     if (!raw) return;
//     const parts = raw
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean);
//     setChips((prev) =>
//       Array.from(new Set([...prev, ...parts].map((x) => x.trim()).filter(Boolean)))
//     );
//     setInput("");
//   };

//   const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();
//       addFromInput();
//     }
//   };

//   const removeChip = (val: string) =>
//     setChips((prev) => prev.filter((x) => x !== val));

//   const canUpdate = !!name.trim() && chips.length > 0;

//   async function handleUpdate() {
//     // narrow row for TS
//     if (!row) return;
//     if (!canUpdate || busy) return;

//     setBusy(true);
//     setErr("");

//     try {
//       const entityId = String(row.id);

//       // 1) rename entity (if changed)
//       if (name.trim() !== row.name) {
//         await updateEntity(entityId, { name: name.trim() });
//       }

//       // 2) diff designations
//       const baseNames = new Set(
//         baseMapRef.current ? Array.from(baseMapRef.current.keys()) : []
//       );
//       const newNames = new Set(chips.map((c) => c.trim()).filter(Boolean));

//       const toAdd = [...newNames].filter((n) => !baseNames.has(n));
//       const toDelete = [...baseNames].filter((n) => !newNames.has(n));

//       // create new
//       await Promise.all(
//         toAdd.map((n) => createDesignation(entityId, { name: n }))
//       );

//       // delete removed
//       await Promise.all(
//         toDelete.map((n) => {
//           const id = baseMapRef.current.get(n);
//         return id ? deleteDesignation(id) : Promise.resolve();

//         })
//       );

//       onUpdated?.();
//       onClose();
//     } catch (e: any) {
//       setErr(e?.message || "Failed to update entity");
//     } finally {
//       setBusy(false);
//     }
//   }

//   async function handleDelete() {
//     if (!row) return; // narrow for TS
//     if (!confirm(`Delete entity "${name}"?`)) return;

//     setBusy(true);
//     setErr("");
//     try {
//       await deleteEntity(String(row.id));
//       onDeleted?.();
//       onClose();
//     } catch (e: any) {
//       setErr(e?.message || "Failed to delete entity");
//     } finally {
//       setBusy(false);
//     }
//   }

//   if (!row) return null;

//   return (
//     <Dialog
//       open={open}
//       onClose={busy ? undefined : onClose}
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
//       <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update Entity</DialogTitle>

//       <DialogContent
//         dividers
//         sx={{ borderColor: "rgba(255,255,255,0.12)", "& .MuiDialogContent-root": { p: 0 } }}
//       >
//         {/* two columns */}
//         <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
//           <Box>
//             <Typography sx={labelSx}>Entity</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               sx={compactCtrlSx}
//               helperText={undefined}
//               FormHelperTextProps={{ sx: helperReset }}
//               disabled={busy}
//             />
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>Designation</Typography>
//             <Box sx={{ display: "flex", gap: 0.75 }}>
//               <TextField
//                 size="small"
//                 fullWidth
//                 placeholder="Add designation (comma/Enter)"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={onKey}
//                 sx={compactCtrlSx}
//                 helperText={undefined}
//                 FormHelperTextProps={{ sx: helperReset }}
//                 disabled={busy}
//               />
//               <Button
//                 variant="contained"
//                 onClick={addFromInput}
//                 disabled={busy}
//                 sx={{
//                   minWidth: 40,
//                   px: 2,
//                   fontWeight: 800,
//                   bgcolor: "#2d2d2f",
//                   "&:hover": { bgcolor: "#3a3a3c" },
//                 }}
//               >
//                 +
//               </Button>
//             </Box>
//           </Box>

//           {/* Chips row spans both columns */}
//           <Box sx={{ gridColumn: "1 / span 2" }}>
//             <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.25 }}>
//               {chips.length ? (
//                 chips.map((d) => (
//                   <Chip
//                     key={d}
//                     label={d}
//                     onDelete={busy ? undefined : () => removeChip(d)}
//                     sx={{
//                       color: "#E8E8EA",
//                       border: "1px solid rgba(255,255,255,.14)",
//                       height: 26,
//                     }}
//                   />
//                 ))
//               ) : (
//                 <Typography sx={{ color: "#9a9a9a", fontSize: 12 }}>
//                   No designations yet. Add some using the field above.
//                 </Typography>
//               )}
//             </Box>

//             {!!err && (
//               <Typography sx={{ color: "#ff8383", mt: 1, fontSize: 12 }}>
//                 {err}
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1.25 }}>
//         <Button
//           onClick={handleDelete}
//           variant="contained"
//           color="error"
//           disabled={busy}
//           sx={{
//             textTransform: "none",
//             fontWeight: 700,
//             bgcolor: "#B4232A",
//             "&:hover": { bgcolor: "#9b1d23" },
//           }}
//         >
//           Delete
//         </Button>
//         <Box sx={{ flex: 1 }} />
//         <Button
//           onClick={onClose}
//           disabled={busy}
//           sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleUpdate}
//           disabled={!canUpdate || busy}
//           variant="contained"
//           sx={{
//             textTransform: "none",
//             fontWeight: 700,
//             bgcolor: "#7C57F2",
//             "&:hover": { bgcolor: "#6b48ea" },
//           }}
//         >
//           {busy ? "Saving…" : "Update"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }


//p2 //
// src/components/Models/UpdateEntityModal.tsx
// import * as React from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Chip,
// } from "@mui/material";

// import {
//   getDesignations,
//   updateEntity,
//   deleteEntity,
//   createDesignation,
//   deleteDesignation,
// } from "../../api/iam"; // <- change to "../../api/iam" if you don't use "@/"
// import { useToast } from "../../ui/toast/ToastProvider"; // <-- NEW

// const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
// const CONTROL_BG = "#1C1C1E";
// const UI = { ctrlH: 30, font: 13 } as const;

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
//   "& .MuiInputBase-input": {
//     padding: "0 10px",
//     height: `${UI.ctrlH - 2}px`,
//     lineHeight: `${UI.ctrlH - 2}px`,
//     fontSize: UI.font,
//     color: "#fff",
//     display: "flex",
//     alignItems: "center",
//   },
// } as const;

// const labelSx = { color: "rgba(255,255,255,0.7)", mb: 0.5, fontSize: 12 };
// const helperReset = { m: 0, lineHeight: 1, minHeight: 0, p: 0 } as const;

// export type EntityUpdateIn = {
//   id: string | number;
//   name: string;
//   // optional — we always refetch actual list on open
//   designations?: Array<string | { id?: string | number; name: string }>;
// };

// export default function UpdateEntityModal({
//   open,
//   row,
//   onClose,
//   onUpdated,
//   onDeleted,
// }: {
//   open: boolean;
//   row: EntityUpdateIn | null;
//   onClose: () => void;
//   onUpdated?: () => void; // ask parent to reload entities
//   onDeleted?: () => void; // ask parent to reload entities
// }) {
//   const toast = useToast(); // <-- NEW

//   const [name, setName] = React.useState(row?.name ?? "");
//   const [input, setInput] = React.useState("");
//   const [chips, setChips] = React.useState<string[]>([]);
//   const [busy, setBusy] = React.useState(false);
//   const [err, setErr] = React.useState("");

//   // keep a map of base designations (name -> id) so we can diff
//   const baseMapRef = React.useRef<Map<string, string>>(new Map());

//   React.useEffect(() => {
//     if (!open || !row) return;

//     setName(row.name);
//     setInput("");
//     setErr("");
//     setBusy(false);

//     // (re)load designations from backend
//     (async () => {
//       try {
//         const entityId = String(row.id);
//         const list = await getDesignations(entityId);
//         baseMapRef.current = new Map(
//           list.map((d) => [d.name.trim(), String(d.id)])
//         );
//         setChips(list.map((d) => d.name));
//       } catch (e) {
//         // fall back to whatever we had on the row, if present
//         const fromRow =
//           (row.designations || []).map((d) =>
//             typeof d === "string" ? d : d.name
//           ) ?? [];
//         baseMapRef.current = new Map(
//           fromRow.map((n, i) => [n.trim(), String(i + 1)])
//         );
//         setChips(fromRow);
//         // optional toast on load failure would be noisy; skipping on purpose
//       }
//     })();
//   }, [open, row]);

//   const addFromInput = () => {
//     const raw = input.trim();
//     if (!raw) return;
//     const parts = raw
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean);
//     setChips((prev) =>
//       Array.from(new Set([...prev, ...parts].map((x) => x.trim()).filter(Boolean)))
//     );
//     setInput("");
//   };

//   const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" || e.key === ",") {
//       e.preventDefault();
//       addFromInput();
//     }
//   };

//   const removeChip = (val: string) =>
//     setChips((prev) => prev.filter((x) => x !== val));

//   const canUpdate = !!name.trim() && chips.length > 0;

//   async function handleUpdate() {
//     // narrow row for TS
//     if (!row) return;
//     if (!canUpdate || busy) return;

//     setBusy(true);
//     setErr("");

//     try {
//       const entityId = String(row.id);

//       // 1) rename entity (if changed)
//       if (name.trim() !== row.name) {
//         await updateEntity(entityId, { name: name.trim() });
//       }

//       // 2) diff designations
//       const baseNames = new Set(
//         baseMapRef.current ? Array.from(baseMapRef.current.keys()) : []
//       );
//       const newNames = new Set(chips.map((c) => c.trim()).filter(Boolean));

//       const toAdd = [...newNames].filter((n) => !baseNames.has(n));
//       const toDelete = [...baseNames].filter((n) => !newNames.has(n));

//       // create new
//       await Promise.all(
//         toAdd.map((n) => createDesignation(entityId, { name: n }))
//       );

//       // delete removed
//       await Promise.all(
//         toDelete.map((n) => {
//           const id = baseMapRef.current.get(n);
//           return id ? deleteDesignation(id) : Promise.resolve();
//         })
//       );

//       onUpdated?.();
//       toast.success("Entity updated"); // <-- NEW
//       onClose();
//     } catch (e: any) {
//       const msg = e?.response?.data?.message || e?.message || "Failed to update entity";
//       setErr(msg);
//       toast.error(msg); // <-- NEW
//     } finally {
//       setBusy(false);
//     }
//   }



//   async function handleDelete() {
//   if (!row || busy) return;

//   const ok = window.confirm(`Delete entity "${row.name}"? This cannot be undone.`);
//   if (!ok) return;

//   setBusy(true);
//   setErr("");

//   try {
//     await deleteEntity(String(row.id));
//     onDeleted?.();
//     toast.success("Entity deleted");
//     onClose();
//   } catch (err: any) {
//     const status = err?.response?.status;
//     const msg =
//       err?.response?.data?.message ||
//       (status === 409
//         ? "This entity is already associated with one or more users. Remove those assignments before deleting."
//         : err?.message) ||
//       "Failed to delete entity";
//     setErr(msg);
//     toast.error(msg);
//   } finally {
//     setBusy(false);
//   }
// }


//   if (!row) return null;

//   return (
//     <Dialog
//       open={open}
//       onClose={busy ? undefined : onClose}
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
//       <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update Entity</DialogTitle>

//       <DialogContent
//         dividers
//         sx={{ borderColor: "rgba(255,255,255,0.12)", "& .MuiDialogContent-root": { p: 0 } }}
//       >
//         {/* two columns */}
//         <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
//           <Box>
//             <Typography sx={labelSx}>Entity</Typography>
//             <TextField
//               size="small"
//               fullWidth
//               value={name}
//               onChange={(e) => setName(e.target.value)}
//               sx={compactCtrlSx}
//               helperText={undefined}
//               FormHelperTextProps={{ sx: helperReset }}
//               disabled={busy}
//             />
//           </Box>

//           <Box>
//             <Typography sx={labelSx}>Designation</Typography>
//             <Box sx={{ display: "flex", gap: 0.75 }}>
//               <TextField
//                 size="small"
//                 fullWidth
//                 placeholder="Add designation (comma/Enter)"
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={onKey}
//                 sx={compactCtrlSx}
//                 helperText={undefined}
//                 FormHelperTextProps={{ sx: helperReset }}
//                 disabled={busy}
//               />
//               <Button
//                 variant="contained"
//                 onClick={addFromInput}
//                 disabled={busy}
//                 sx={{
//                   minWidth: 40,
//                   px: 2,
//                   fontWeight: 800,
//                   bgcolor: "#2d2d2f",
//                   "&:hover": { bgcolor: "#3a3a3c" },
//                 }}
//               >
//                 +
//               </Button>
//             </Box>
//           </Box>

//           {/* Chips row spans both columns */}
//           <Box sx={{ gridColumn: "1 / span 2" }}>
//             <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.25 }}>
//               {chips.length ? (
//                 chips.map((d) => (
//                   <Chip
//                     key={d}
//                     label={d}
//                     onDelete={busy ? undefined : () => removeChip(d)}
//                     sx={{
//                       color: "#E8E8EA",
//                       border: "1px solid rgba(255,255,255,.14)",
//                       height: 26,
//                     }}
//                   />
//                 ))
//               ) : (
//                 <Typography sx={{ color: "#9a9a9a", fontSize: 12 }}>
//                   No designations yet. Add some using the field above.
//                 </Typography>
//               )}
//             </Box>

//             {!!err && (
//               <Typography sx={{ color: "#ff8383", mt: 1, fontSize: 12 }}>
//                 {err}
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1.25 }}>
//         <Button
//           onClick={handleDelete}
//           variant="contained"
//           color="error"
//           disabled={busy}
//           sx={{
//             textTransform: "none",
//             fontWeight: 700,
//             bgcolor: "#B4232A",
//             "&:hover": { bgcolor: "#9b1d23" },
//           }}
//         >
//           Delete
//         </Button>
//         <Box sx={{ flex: 1 }} />
//         <Button
//           onClick={onClose}
//           disabled={busy}
//           sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}
//         >
//           Cancel
//         </Button>
//         <Button
//           onClick={handleUpdate}
//           disabled={!canUpdate || busy}
//           variant="contained"
//           sx={{
//             textTransform: "none",
//             fontWeight: 700,
//             bgcolor: "#7C57F2",
//             "&:hover": { bgcolor: "#6b48ea" },
//           }}
//         >
//           {busy ? "Saving…" : "Update"}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }


//p3//
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, TextField, Button, Chip
} from "@mui/material";

import {
  getDesignations,
  updateEntity,
  deleteEntity,
  createDesignation,
  deleteDesignation,
} from "../../api/iam";
import { useToast } from "../../ui/toast/ToastProvider";

const CONTROL_BORDER = "1px solid rgba(255,255,255,0.14)";
const CONTROL_BG = "#1C1C1E";
const UI = { ctrlH: 30, font: 13 } as const;

const compactCtrlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-root": { height: `${UI.ctrlH}px`, color: "#fff", alignItems: "center" },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#544f4fff" },
  "& .MuiInputBase-input": {
    padding: "0 10px", height: `${UI.ctrlH - 2}px`, lineHeight: `${UI.ctrlH - 2}px`,
    fontSize: UI.font, color: "#fff", display: "flex", alignItems: "center",
  },
} as const;

const labelSx = { color: "rgba(255,255,255,0.7)", mb: 0.5, fontSize: 12 };
const helperReset = { m: 0, lineHeight: 1, minHeight: 0, p: 0 } as const;

export type EntityUpdateIn = {
  id: string | number;
  name: string;
  designations?: Array<string | { id?: string | number; name: string }>;
};

export default function UpdateEntityModal({
  open,
  row,
  onClose,
  onUpdated,
  onDeleted,
}: {
  open: boolean;
  row: EntityUpdateIn | null;
  onClose: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}) {
  const toast = useToast();

  const [name, setName] = React.useState(row?.name ?? "");
  const [input, setInput] = React.useState("");
  const [chips, setChips] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [err, setErr] = React.useState("");

  // keep a map of base designations (normalizedName -> id)
  const baseMapRef = React.useRef<Map<string, string>>(new Map());

  const normalize = (s: string) => s.trim().toLowerCase();

  React.useEffect(() => {
    if (!open || !row) return;

    setName(row.name);
    setInput("");
    setErr("");
    setBusy(false);

    (async () => {
      try {
        const entityId = String(row.id);
        const list = await getDesignations(entityId);

        baseMapRef.current = new Map(
          list.map((d) => [normalize(d.name), String(d.id)])
        );

        setChips(list.map((d) => d.name));
      } catch {
        // Fallback to values on the row if API unavailable
        const fromRow =
          (row.designations || []).map((d) => (typeof d === "string" ? d : d.name)) ?? [];
        baseMapRef.current = new Map(
          fromRow.map((n, i) => [normalize(n), String(i + 1)])
        );
        setChips(fromRow);
      }
    })();
  }, [open, row]);

  const addFromInput = () => {
    const raw = input.trim();
    if (!raw) return;

    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setChips((prev) => {
      const existing = new Set(prev.map((p) => normalize(p)));
      const next = [...prev];
      parts.forEach((p) => {
        if (!existing.has(normalize(p))) next.push(p);
      });
      return next;
    });
    setInput("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addFromInput();
    }
  };

  const removeChip = (val: string) =>
    setChips((prev) => prev.filter((x) => normalize(x) !== normalize(val)));

  const canUpdate = !!name.trim() && chips.length > 0;

  async function handleUpdate() {
    if (!row || !canUpdate || busy) return;

    setBusy(true);
    setErr("");

    try {
      const entityId = String(row.id);

      // (1) Rename entity if changed
      if (name.trim() !== row.name) {
        await updateEntity(entityId, { name: name.trim() });
      }

      // (2) Diff designations (case-insensitive)
      const baseNames = new Set<string>(Array.from(baseMapRef.current.keys()));
      const newNamesNorm = new Set<string>(chips.map(normalize));

      const toAdd = [...newNamesNorm].filter((n) => !baseNames.has(n));
      const toDelete = [...baseNames].filter((n) => !newNamesNorm.has(n));

      // Create new
      if (toAdd.length) {
        await Promise.all(
          toAdd.map((nNorm) => {
            const original = chips.find((c) => normalize(c) === nNorm) || nNorm;
            return createDesignation(entityId, { name: original });
          })
        );
      }

      // Delete removed
      if (toDelete.length) {
        await Promise.all(
          toDelete.map((nNorm) => {
            const id = baseMapRef.current.get(nNorm);
            return id ? deleteDesignation(id) : Promise.resolve();
          })
        );
      }

      onUpdated?.();
      toast.success("Entity updated");
      onClose();
    } catch (e: any) {
      const msg = e?.message || "Failed to update entity";
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!row || busy) return;

    const ok = window.confirm(`Delete entity "${row.name}"? This cannot be undone.`);
    if (!ok) return;

    setBusy(true);
    setErr("");

    try {
      await deleteEntity(String(row.id));
      onDeleted?.();
      toast.success("Entity deleted");
      onClose();
    } catch (err: any) {
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ||
        (status === 409
          ? "This entity is associated with one or more users. Remove those assignments first."
          : err?.message) ||
        "Failed to delete entity";
      setErr(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  if (!row) return null;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { bgcolor: "#151517", color: "#EDEDED", border: CONTROL_BORDER, borderRadius: 2 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update Entity</DialogTitle>

      <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25, pt: 0.5 }}>
          <Box>
            <Typography sx={labelSx}>Entity</Typography>
            <TextField
              size="small"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={compactCtrlSx}
              FormHelperTextProps={{ sx: helperReset }}
              disabled={busy}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>Designation</Typography>
            <Box sx={{ display: "flex", gap: 0.75 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Add designation (comma/Enter)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKey}
                sx={compactCtrlSx}
                FormHelperTextProps={{ sx: helperReset }}
                disabled={busy}
              />
              <Button
                variant="contained"
                onClick={addFromInput}
                disabled={busy}
                sx={{ minWidth: 40, px: 2, fontWeight: 800, bgcolor: "#2d2d2f", "&:hover": { bgcolor: "#3a3a3c" } }}
              >
                +
              </Button>
            </Box>
          </Box>

          {/* Chips row spans both columns */}
          <Box sx={{ gridColumn: "1 / span 2" }}>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.25 }}>
              {chips.length ? (
                chips.map((d) => (
                  <Chip
                    key={d}
                    label={d}
                    onDelete={busy ? undefined : () => removeChip(d)}
                    sx={{ color: "#E8E8EA", border: "1px solid rgba(255,255,255,.14)", height: 26 }}
                  />
                ))
              ) : (
                <Typography sx={{ color: "#9a9a9a", fontSize: 12 }}>
                  No designations yet. Add some using the field above.
                </Typography>
              )}
            </Box>

            {!!err && (
              <Typography sx={{ color: "#ff8383", mt: 1, fontSize: 12 }}>
                {err}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.25 }}>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={busy}
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#B4232A", "&:hover": { bgcolor: "#9b1d23" } }}
        >
          Delete
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={onClose} disabled={busy} sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}>
          Cancel
        </Button>
        <Button
          onClick={handleUpdate}
          disabled={!canUpdate || busy}
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b48ea" } }}
        >
          {busy ? "Saving…" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
