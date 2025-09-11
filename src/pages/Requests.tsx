//p3//
// // src/pages/Requests/index.tsx
// import * as React from "react";
// import {
//   Box,
//   Card,
//   ToggleButtonGroup,
//   ToggleButton,
//   TextField,
//   InputAdornment,
//   Button,
//   Select,
//   MenuItem,
//   FormControl,
//   OutlinedInput,
//   Checkbox,
//   ListItemText,
//   TablePagination,
//   Typography,
//   ListItemIcon,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Chip,
//   Stack,
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";
// import SearchIcon from "@mui/icons-material/Search";
// import MainLayout from "../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../components/TopNav";
// import { api } from "../api/http";

// /* ---------- UI constants ---------- */
// const CARD_SX = {
//   bgcolor: "#1C1C1E",
//   color: "#E8E8EA",
//   border: "1px solid rgba(255,255,255,0.14)",
//   borderRadius: 2,
//   display: "flex",
//   flexDirection: "column",
// } as const;

// const CONTROL_BG = "#232325";
// const PRIMARY = "#7C57F2";

// const controlSx = {
//   bgcolor: CONTROL_BG,
//   borderRadius: 1,
//   color: "#fff",
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4e4e4e" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: "#565656",
//   },
//   "& .MuiInputBase-input": { color: "#fff", fontSize: 13 },
// };

// const darkMenu = {
//   PaperProps: {
//     sx: {
//       bgcolor: "#1C1C1E",
//       color: "#E8E8EA",
//       border: "1px solid rgba(255,255,255,0.14)",
//       "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
//       "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
//     },
//   },
// };

// const LABEL_SX = {
//   fontSize: 12,
//   fontWeight: 600,
//   color: "rgba(255,255,255,0.72)",
//   mb: 0.5,
//   lineHeight: 1.2,
// };

// const SCROLLER_SX = {
//   scrollbarWidth: "thin",
//   scrollbarColor: "#3f3f3f transparent",
//   "&::-webkit-scrollbar": { width: 8, height: 8 },
//   "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
//   "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
//   "&::-webkit-scrollbar-track": { background: "transparent" },
// };

// const UI = {
//   gap: 0.75,
//   headerPx: 1.25,
//   headerPy: 0.6,
//   font: 13,
//   icon: 16,
//   searchW: 260,
//   paginationH: 36,
// };

// /* ---------- Types ---------- */
// type ReqRow = {
//   id: number;
//   sr: number;
//   ticketNo: string;
//   user: string;
//   reqTo: string;
//   categories: string[];
//   priority: "P1" | "P2" | "P3";
//   status:
//     | "Submitted"
//     | "Draft"
//     | "In Review"
//     | "Done"
//     | "Rejected"
//     | "Cancelled"
//     | "New"
//     | "Triaged"
//     | "In Progress"
//     | "Resolved"
//     | "Closed"
//     | "Reopened"
//     | "On Hold"
//     | "Need Info";
//   description: string;
//   remarks?: string; // latest history note
//   createdAt: string;
// };

// type Column = {
//   key: keyof ReqRow | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

// type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
// type Category = { id: number; name: string };

// /* ---------- Status options (match DB enum superset) ---------- */


// export const STATUS_OPTIONS = [
//   "Submitted",
//   "In Review",
//   "Approved",
//   "Rejected",
//   "Done",
//   "Cancelled",
//   "New",
//   "Triaged",
//   "In Progress",
//   "Resolved",
//   "Closed",
//   "Reopened",
//   "On Hold",
//   "Need Info",
// ] as const;

// type Status = typeof STATUS_OPTIONS[number];

// /* ---------- Status chip ---------- */
// function StatusChip({ value }: { value: ReqRow["status"] }) {
//   const map: Record<ReqRow["status"], { bg: string; fg: string }> = {
//     Draft: { bg: "rgba(255,255,255,0.08)", fg: "#d1d5db" },
//     Submitted: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
//     "In Review": { bg: "rgba(124,87,242,0.22)", fg: "#c7b8ff" },
//     Done: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
//     Rejected: { bg: "rgba(239,68,68,0.22)", fg: "#fca5a5" },
//     Cancelled: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//     New: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
//     Triaged: { bg: "rgba(2,132,199,0.22)", fg: "#93c5fd" },
//     "In Progress": { bg: "rgba(234,179,8,0.18)", fg: "#fde68a" },
//     Resolved: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
//     Closed: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//     Reopened: { bg: "rgba(147,51,234,0.22)", fg: "#d8b4fe" },
//     "Need Info": { bg: "rgba(14,165,233,0.18)", fg: "#93c5fd" },
//   } as any;
//   const { bg, fg } = map[value] || { bg: "rgba(255,255,255,0.08)", fg: "#d1d5db" };
//   return (
//     <Box sx={{ display: "inline-flex", px: 1, py: 0.25, borderRadius: 1, bgcolor: bg, color: fg, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
//       {value}
//     </Box>
//   );
// }

// /* ---------- Table columns ---------- */
// const COLUMNS: Column[] = [
//   { key: "ticketNo", label: "Ticket No", width: 120, align: "center" },
//   { key: "user", label: "User", width: 180, align: "left" },
//   { key: "reqTo", label: "Req To", width: 180, align: "left" },
//   { key: "categories", label: "Category", width: 220, align: "left" },
//   { key: "priority", label: "Priority", width: 80, align: "center" },
//   { key: "status", label: "Status", width: 140, align: "center" },
//   { key: "description", label: "Description", width: 320, align: "left" },
//   { key: "remarks", label: "Remarks", width: 240, align: "left" },
//   { key: "createdAt", label: "Created At", width: 180, align: "center" },
//   { key: "action", label: "Action", width: 120, align: "center" },
// ];

// /* ---------- Table (dark scroll) ---------- */
// function DarkScrollTable({
//   rows,
//   columns,
//   onUpdate,
// }: {
//   rows: ReqRow[];
//   columns: Column[];
//   onUpdate: (row: ReqRow) => void;
// }) {
//   const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;

//   return (
//     <Box>
//       <Box sx={{ width: totalW, minWidth: "100%" }}>
//         {/* header */}
//         <Box
//           sx={{
//             position: "sticky",
//             top: 0,
//             zIndex: 1,
//             display: "grid",
//             gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
//             bgcolor: "#000",
//             borderBottom: "1px solid rgba(255,255,255,0.14)",
//           }}
//         >
//           {columns.map((c) => (
//             <Box
//               key={c.key}
//               sx={{
//                 px: 1.25,
//                 py: 1,
//                 fontWeight: 700,
//                 fontSize: 13,
//                 color: "#fff",
//                 textAlign: c.align ?? "center",
//                 whiteSpace: "nowrap",
//               }}
//             >
//               {c.label}
//             </Box>
//           ))}
//         </Box>

//         {/* rows */}
//         {rows.map((r, idx) => (
//           <Box
//             key={r.id}
//             sx={{
//               display: "grid",
//               gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
//               borderBottom: "1px solid rgba(255,255,255,0.08)",
//               bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//             }}
//           >
//             {columns.map((c) => {
//               if (c.key === "action") {
//                 return (
//                   <Box key={`action-${idx}`} sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}>
//                     <Button
//                       size="small"
//                       variant="contained"
//                       sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
//                       onClick={() => onUpdate(r)}
//                     >
//                       Update
//                     </Button>
//                   </Box>
//                 );
//               }
//               if (c.key === "status") {
//                 return (
//                   <Box key={`status-${idx}`} sx={{ px: 1.25, py: 0.9, textAlign: "center" }}>
//                     <StatusChip value={r.status} />
//                   </Box>
//                 );
//               }
//               if (c.key === "categories") {
//                 return (
//                   <Box key={`cats-${idx}`} sx={{ px: 1.25, py: 1, fontSize: 13, color: "#EAEAEA", textAlign: c.align ?? "left", whiteSpace: "nowrap" }}>
//                     {r.categories.join(", ")}
//                   </Box>
//                 );
//               }
//               const val = r[c.key as keyof ReqRow] as any;
//               return (
//                 <Box key={String(c.key)} sx={{ px: 1.25, py: 1, fontSize: 13, color: "#EAEAEA", textAlign: c.align ?? "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                   {val || "-"}
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}

//         {rows.length === 0 && (
//           <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>
//             No requests yet.
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// }

// /* ---------- Helpers ---------- */
// function getStoredUser(): { id?: string; username?: string; name?: string; email?: string; full_name?: string } {
//   try {
//     const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
//     if (!raw) return {};
//     return JSON.parse(raw);
//   } catch {
//     return {};
//   }
// }
// const displayName = (u: BasicUser) => u.full_name || u.username || u.email || "(user)";

// /* ---------- Page ---------- */
// export default function RequestsPage() {
//   const [tab, setTab] = React.useState<"new" | "list">("new");

//   // list state
//   const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");
//   const [rows, setRows] = React.useState<ReqRow[]>([]);
//   const [search, setSearch] = React.useState("");
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(10);
//   const [loadingList, setLoadingList] = React.useState(false);

//   // me
//   const me = getStoredUser();
//   const meId = String((me as any)?.id || "");

//   // form state (create)
//   const [ticketNo, setTicketNo] = React.useState<string>("Auto");
//   const [userName] = React.useState<string>(me?.name || (me as any)?.full_name || me?.username || me?.email || "User");
//   const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
//   const [reqToId, setReqToId] = React.useState<string>("");
//   const [categories, setCategories] = React.useState<number[]>([]);
//   const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
//   const [additionalInfo, setAdditionalInfo] = React.useState("");
//   const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
//   const [submitting, setSubmitting] = React.useState(false);

//   // update dialog state
//   const [updOpen, setUpdOpen] = React.useState(false);
//   const [updLoading, setUpdLoading] = React.useState(false);
//   const [updId, setUpdId] = React.useState<number | null>(null);
//   const [updTicketNo, setUpdTicketNo] = React.useState("");
//   const [updRequester, setUpdRequester] = React.useState("");
//   const [updTarget, setUpdTarget] = React.useState("");
//   const [updCategories, setUpdCategories] = React.useState<string[]>([]);
//   const [updPriority, setUpdPriority] = React.useState<"P1" | "P2" | "P3">("P2");
//   const [updStatus, setUpdStatus] = React.useState<ReqRow["status"]>("Submitted");
//   const [updDescription, setUpdDescription] = React.useState("");
//   const [updRemarks, setUpdRemarks] = React.useState("");

//   // ---- fetch recipients + categories
//   React.useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         const j = await api.get<any>("/api/users");
//         const arr: BasicUser[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
//         const filtered = meId ? arr.filter((u) => String(u.id) !== meId) : arr;
//         if (!cancelled) {
//           setRecipients(filtered);
//           if (!reqToId && filtered.length) setReqToId(String(filtered[0].id));
//         }
//       } catch (e) {
//         console.error("users fetch failed", e);
//         if (!cancelled) setRecipients([]);
//       }
//     })();

//     (async () => {
//       try {
//         const j = await api.get<any>("/api/categories");
//         const arr: Category[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
//         if (!cancelled) setCategoryOpts(arr);
//       } catch (e) {
//         console.error("categories fetch failed", e);
//         if (!cancelled) setCategoryOpts([]);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [meId, reqToId]);

//   // ---- fetch list
//   const fetchList = React.useCallback(
//     async (pageNum: number, pageSize: number) => {
//       if (tab !== "list") return;
//       setLoadingList(true);
//       try {
//         const p = pageNum + 1; // API 1-based
//         const j = await api.get<any>("/api/tickets", {
//           params: {
//             type: "request",
//             scope,
//             q: search || undefined,
//             page: p,
//             size: pageSize,
//           },
//         });

//         const arr: any[] = Array.isArray(j?.rows) ? j.rows : Array.isArray(j) ? j : [];
//         const mapped: ReqRow[] = arr.map((x: any, idx: number) => ({
//           id: Number(x.id),
//           sr: pageNum * pageSize + idx + 1,
//           ticketNo: String(x.ticket_no ?? x.ticketNo ?? ""),
//           user: String(x.requester_name ?? x.requester ?? ""),
//           reqTo: String(x.target_name ?? x.reqTo ?? ""),
//           categories: String(x.categories ?? "")
//             .split(",")
//             .map((s) => s.trim())
//             .filter(Boolean),
//           priority: (String(x.priority ?? "P2") as "P1" | "P2" | "P3"),
//           status: String(x.status ?? "Submitted") as ReqRow["status"],
//           description: String(x.description ?? ""),
//           remarks: x.last_note ? String(x.last_note) : "",
//           createdAt: new Date(x.created_at ?? Date.now()).toLocaleString(),
//         }));

//         setRows(mapped);
//       } catch (e) {
//         console.error("list fetch failed", e);
//         setRows([]);
//       } finally {
//         setLoadingList(false);
//       }
//     },
//     [scope, search, tab]
//   );

//   React.useEffect(() => {
//     fetchList(page, rowsPerPage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tab, scope]);

//   React.useEffect(() => {
//     if (tab === "list") fetchList(page, rowsPerPage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, rowsPerPage, search]);

//   const handleCategoriesChange = (e: SelectChangeEvent<number[]>) => {
//     const v = e.target.value as any;
//     setCategories(typeof v === "string" ? v.split(",").map((n: string) => Number(n)) : (v as number[]));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reqToId) return alert("Please select recipient (Req To).");
//     if (!categories.length) return alert("Please select at least one category.");

//     try {
//       setSubmitting(true);
//       const payload = {
//         type: "request",
//         target_user_id: reqToId,
//         priority,
//         description: additionalInfo?.trim() || null,
//         categories, // numeric ids
//         title: null,
//       };
//       const resp = await api.post<any>("/api/tickets", payload);
//       const ticket_no = resp?.ticket_no || resp?.data?.ticket_no || "RTN-?";

//       setTicketNo(ticket_no);
//       setTab("list");
//       setScope("sent");
//       setPage(0);
//       fetchList(0, rowsPerPage);

//       setCategories([]);
//       setAdditionalInfo("");
//       setPriority("P2");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to submit request.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const filtered = rows; // server-side filtering

//   const paged = React.useMemo(
//     () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
//     [filtered, page, rowsPerPage]
//   );

//   // ---- Update dialog handlers
//   const openUpdate = async (row: ReqRow) => {
//     try {
//       setUpdOpen(true);
//       setUpdLoading(true);
//       setUpdId(row.id);
//       setUpdTicketNo(row.ticketNo);
//       // fetch full detail for chips & freshness
//       const j = await api.get<any>(`/api/tickets/${row.id}`);
//       const t = j?.ticket || {};
//       const cats = Array.isArray(j?.categories) ? j.categories : [];
//       setUpdRequester(t.requester_name || row.user);
//       setUpdTarget(t.target_name || row.reqTo);
//       setUpdCategories(cats.map((c: any) => c.name));
//       setUpdPriority((t.priority || row.priority) as any);
//       setUpdStatus((t.status || row.status) as any);
//       setUpdDescription(t.description || row.description || "");
//       setUpdRemarks(""); // clear for new note
//     } catch (e) {
//       console.error(e);
//       alert("Failed to open ticket.");
//       setUpdOpen(false);
//     } finally {
//       setUpdLoading(false);
//     }
//   };

//   const submitUpdate = async () => {
//     if (!updId) return;
//     try {
//       setUpdLoading(true);
//       await api.patch(`/api/tickets/${updId}`, {
//         title: null, // unchanged
//         description: updDescription ?? null,
//         priority: updPriority,
//         status: updStatus,
//         note: updRemarks?.trim() || null, // becomes "remarks" in history
//       });
//       setUpdOpen(false);
//       fetchList(page, rowsPerPage);
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Update failed");
//     } finally {
//       setUpdLoading(false);
//     }
//   };

//   return (
//     <MainLayout title="Requests">
//       <Box sx={{ px: 2, py: 1.5 }}>
//         <Card sx={{ ...CARD_SX, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)` }}>
//           {/* Header */}
//           <Box
//             sx={{
//               px: UI.headerPx,
//               py: UI.headerPy,
//               borderBottom: "1px solid rgba(255,255,255,0.12)",
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//             }}
//           >
//             <ToggleButtonGroup
//               color="primary"
//               exclusive
//               value={tab}
//               onChange={(_, v) => v && setTab(v)}
//               sx={{
//                 "& .MuiToggleButton-root": {
//                   textTransform: "none",
//                   fontWeight: 700,
//                   fontSize: 13,
//                   color: "#E8E8EA",
//                   borderColor: "rgba(255,255,255,0.14)",
//                   px: 1.25,
//                   py: 0.5,
//                   "&.Mui-selected": {
//                     bgcolor: "rgba(124,87,242,0.18)",
//                     color: "#fff",
//                     borderColor: "rgba(124,87,242,0.6)",
//                   },
//                 },
//               }}
//             >
//               <ToggleButton value="new">New Request</ToggleButton>
//               <ToggleButton value="list">All Requests</ToggleButton>
//             </ToggleButtonGroup>

//             {/* Scope + search */}
//             {tab === "list" && (
//               <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
//                 <ToggleButtonGroup
//                   color="primary"
//                   exclusive
//                   value={scope}
//                   onChange={(_, v) => v && (setScope(v), setPage(0))}
//                   sx={{
//                     "& .MuiToggleButton-root": {
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: 12.5,
//                       color: "#E8E8EA",
//                       borderColor: "rgba(255,255,255,0.14)",
//                       px: 1,
//                       py: 0.3,
//                       "&.Mui-selected": {
//                         bgcolor: "rgba(124,87,242,0.18)",
//                         color: "#fff",
//                         borderColor: "rgba(124,87,242,0.6)",
//                       },
//                     },
//                   }}
//                 >
//                   <ToggleButton value="inbox">Inbox</ToggleButton>
//                   <ToggleButton value="sent">Sent</ToggleButton>
//                 </ToggleButtonGroup>

//                 <TextField
//                   value={search}
//                   onChange={(e) => {
//                     setSearch(e.target.value);
//                     setPage(0);
//                   }}
//                   placeholder="Search…"
//                   size="small"
//                   sx={{
//                     width: UI.searchW,
//                     ...controlSx,
//                     "& .MuiOutlinedInput-root": { pl: 1, height: 30 },
//                   }}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start" sx={{ mr: 0.25 }}>
//                         <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,0.75)" }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                 />
//               </Box>
//             )}
//           </Box>

//           {/* Body */}
//           <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
//             {tab === "new" && (
//               <Box
//                 component="form"
//                 onSubmit={handleSubmit}
//                 sx={{
//                   display: "grid",
//                   gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
//                   columnGap: 2,
//                   rowGap: 2,
//                   "& .form-item": { display: "flex", flexDirection: "column" },
//                 }}
//               >
//                 {/* Row 1 */}
//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>Request Ticket No</Typography>
//                   <TextField value={ticketNo} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>User</Typography>
//                   <TextField value={userName} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>Req To</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select
//                       value={reqToId}
//                       onChange={(e) => setReqToId(String(e.target.value))}
//                       sx={controlSx}
//                       MenuProps={darkMenu}
//                       displayEmpty
//                       renderValue={(v) => {
//                         const u = recipients.find((x) => String(x.id) === String(v));
//                         return u ? displayName(u) : "Select recipient";
//                       }}
//                     >
//                       <MenuItem disabled value="">
//                         Select recipient
//                       </MenuItem>
//                       {recipients.map((u) => (
//                         <MenuItem key={u.id} value={u.id}>
//                           {displayName(u)}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>

//                 {/* Row 2 */}
//                 <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
//                   <Typography sx={LABEL_SX}>Req Category</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select<number[]>
//                       multiple
//                       value={categories}
//                       onChange={handleCategoriesChange}
//                       displayEmpty
//                       renderValue={(selected) =>
//                         (selected as number[]).length
//                           ? (selected as number[])
//                               .map((id) => categoryOpts.find((c) => c.id === id)?.name || String(id))
//                               .join(", ")
//                           : "Select category"
//                       }
//                       input={<OutlinedInput />}
//                       sx={controlSx}
//                       MenuProps={darkMenu}
//                     >
//                       <MenuItem disabled value="">
//                         Select category
//                       </MenuItem>
//                       {categoryOpts.map((c) => (
//                         <MenuItem key={c.id} value={c.id}>
//                           <ListItemIcon sx={{ minWidth: 32 }}>
//                             <Checkbox checked={categories.indexOf(c.id) > -1} sx={{ p: 0.5, color: "#bbb" }} />
//                           </ListItemIcon>
//                           <ListItemText primary={c.name} />
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>Priority</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select
//                       value={priority}
//                       onChange={(e) => setPriority(e.target.value as "P1" | "P2" | "P3")}
//                       sx={controlSx}
//                       MenuProps={darkMenu}
//                     >
//                       {["P1", "P2", "P3"].map((p) => (
//                         <MenuItem key={p} value={p}>
//                           {p}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>

//                 {/* Row 3 */}
//                 <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
//                   <Typography sx={LABEL_SX}>Req Additional Info</Typography>
//                   <TextField
//                     value={additionalInfo}
//                     onChange={(e) => setAdditionalInfo(e.target.value)}
//                     placeholder="write request in detail for Admin"
//                     size="small"
//                     sx={{
//                       ...controlSx,
//                       "& .MuiOutlinedInput-root": { height: "auto" },
//                       "& .MuiInputBase-input": {
//                         height: "auto",
//                         padding: "10px 12px",
//                         lineHeight: 1.25,
//                         fontSize: 13,
//                         color: "#fff",
//                       },
//                     }}
//                     multiline
//                     minRows={3}
//                   />
//                 </Box>

//                 {/* Actions */}
//                 <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
//                     disabled={!reqToId || !categories.length || submitting}
//                   >
//                     {submitting ? "Submitting…" : "Submit"}
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "rgba(255,255,255,0.28)", color: "#E8E8EA" }}
//                     onClick={() => {
//                       setCategories([]);
//                       setAdditionalInfo("");
//                       setPriority("P2");
//                     }}
//                   >
//                     Reset
//                   </Button>
//                 </Box>
//               </Box>
//             )}

//             {tab === "list" && (
//               <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
//                 <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
//                   <DarkScrollTable rows={paged} columns={COLUMNS} onUpdate={openUpdate} />
//                 </Box>
//                 {loadingList && <Box sx={{ textAlign: "center", color: "#aaa", py: 1 }}>Loading…</Box>}
//               </Box>
//             )}
//           </Box>

//           {/* pagination (only on list tab) */}
//           {tab === "list" && (
//             <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
//               <TablePagination
//                 component="div"
//                 count={filtered.length}
//                 page={page}
//                 onPageChange={(_, p) => setPage(p)}
//                 rowsPerPage={rowsPerPage}
//                 onRowsPerPageChange={(e) => {
//                   setRowsPerPage(parseInt(e.target.value, 10));
//                   setPage(0);
//                 }}
//                 rowsPerPageOptions={[5, 10, 25, 50]}
//                 sx={{
//                   px: 1,
//                   color: "#E8E8EA",
//                   minHeight: UI.paginationH,
//                   "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
//                   "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: UI.font, m: 0 },
//                   "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
//                   "& .MuiSelect-select": { py: 0, px: 1, fontSize: UI.font, height: 30 - 6, display: "flex", alignItems: "center", bgcolor: CONTROL_BG, borderRadius: 1 },
//                   "& .MuiIconButton-root": { p: 0.25 },
//                   ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
//                 }}
//               />
//             </Box>
//           )}
//         </Card>
//       </Box>

//       {/* ----- Update Dialog ----- */}
//       <Dialog open={updOpen} onClose={() => setUpdOpen(false)} fullWidth maxWidth="md">
//         <DialogTitle>Update Request</DialogTitle>
//         <DialogContent dividers>
//           <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2, mt: 0.5 }}>
//             <TextField label="Ticket No" value={updTicketNo} size="small" InputProps={{ readOnly: true }} />
//             <TextField label="Priority" select value={updPriority} onChange={(e) => setUpdPriority(e.target.value as any)} size="small">
//               {["P1", "P2", "P3"].map((p) => (
//                 <MenuItem key={p} value={p}>{p}</MenuItem>
//               ))}
//             </TextField>

//             <TextField label="Requester" value={updRequester} size="small" InputProps={{ readOnly: true }} />
//             <TextField label="Req To" value={updTarget} size="small" InputProps={{ readOnly: true }} />

//             <TextField label="Status" select value={updStatus} onChange={(e) => setUpdStatus(e.target.value as any)} size="small">
//               {STATUS_OPTIONS.map((s) => (
//                 <MenuItem key={s} value={s}>{s}</MenuItem>
//               ))}
//             </TextField>
//             <Box />

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <Typography sx={{ ...LABEL_SX, mb: 0.75 }}>Categories</Typography>
//               <Stack direction="row" spacing={1} flexWrap="wrap">
//                 {updCategories.length ? updCategories.map((n, i) => <Chip key={i} size="small" label={n} />) : <Typography sx={{ color: "#9ca3af" }}>None</Typography>}
//               </Stack>
//             </Box>

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <TextField
//                 label="Description"
//                 value={updDescription}
//                 onChange={(e) => setUpdDescription(e.target.value)}
//                 size="small"
//                 multiline
//                 minRows={3}
//                 fullWidth
//               />
//             </Box>

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <TextField
//                 label="Remarks (note for this update)"
//                 value={updRemarks}
//                 onChange={(e) => setUpdRemarks(e.target.value)}
//                 size="small"
//                 multiline
//                 minRows={2}
//                 fullWidth
//               />
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setUpdOpen(false)} disabled={updLoading}>Cancel</Button>
//           <Button variant="contained" onClick={submitUpdate} disabled={updLoading} sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}>
//             {updLoading ? "Saving…" : "Update"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </MainLayout>
//   );
// }




//p4//
// src/pages/Requests/index.tsx
import * as React from "react";
import {
  Box,
  Card,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Button,
  Select,
  MenuItem,
  FormControl,
  OutlinedInput,
  Checkbox,
  ListItemText,
  TablePagination,
  Typography,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { api } from "../api/http";

/* ---------- UI constants ---------- */
const CARD_SX = {
  bgcolor: "#1C1C1E",
  color: "#E8E8EA",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
} as const;

const CONTROL_BG = "#232325";
const PRIMARY = "#7C57F2";

const controlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4e4e4e" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#565656",
  },
  "& .MuiInputBase-input": { color: "#fff", fontSize: 13 },
};

const darkMenu = {
  PaperProps: {
    sx: {
      bgcolor: "#1C1C1E",
      color: "#E8E8EA",
      border: "1px solid rgba(255,255,255,0.14)",
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.10)" },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
    },
  },
};

const LABEL_SX = {
  fontSize: 12,
  fontWeight: 600,
  color: "rgba(255,255,255,0.72)",
  mb: 0.5,
  lineHeight: 1.2,
};

const SCROLLER_SX = {
  scrollbarWidth: "thin",
  scrollbarColor: "#3f3f3f transparent",
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
};

// near other UI consts
const LABEL_WHITE_PROPS = {
  sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } },
};


const UI = {
  headerPx: 1.25,
  headerPy: 0.6,
  font: 13,
  icon: 16,
  searchW: 260,
  paginationH: 36,
};

/* ---------- Status options (mirror DB superset) ---------- */
export const STATUS_OPTIONS = [
  "Submitted",
  "Draft",
  "In Review",
  "Approved",
  "Rejected",
  "Done",
  "Cancelled",
  "New",
  "Triaged",
  "In Progress",
  "Resolved",
  "Closed",
  "Reopened",
  "On Hold",
  "Need Info",
] as const;

type Status = typeof STATUS_OPTIONS[number];

/* ---------- Types ---------- */
type ReqRow = {
  id: number;
  sr: number;
  ticketNo: string;
  user: string;
  reqTo: string;
  categories: string[];
  priority: "P1" | "P2" | "P3";
  status: Status;
  description: string;
  remarks?: string; // latest history note
  createdAt: string;
};

type Column = {
  key: keyof ReqRow | "action";
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
};

type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
type Category = { id: number; name: string };

/* ---------- Status chip ---------- */
function StatusChip({ value }: { value: Status }) {
  const map: Record<Status, { bg: string; fg: string }> = {
    Draft: { bg: "rgba(255,255,255,0.08)", fg: "#d1d5db" },
    Submitted: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
    "In Review": { bg: "rgba(124,87,242,0.22)", fg: "#c7b8ff" },
    Approved: { bg: "rgba(16,185,129,0.22)", fg: "#a7f3d0" },
    Done: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
    Rejected: { bg: "rgba(239,68,68,0.22)", fg: "#fca5a5" },
    Cancelled: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
    New: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
    Triaged: { bg: "rgba(2,132,199,0.22)", fg: "#93c5fd" },
    "In Progress": { bg: "rgba(234,179,8,0.18)", fg: "#fde68a" },
    Resolved: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
    Closed: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
    Reopened: { bg: "rgba(147,51,234,0.22)", fg: "#d8b4fe" },
    "On Hold": { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
    "Need Info": { bg: "rgba(14,165,233,0.18)", fg: "#93c5fd" },
  };
  const { bg, fg } = map[value];
  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Box>
  );
}


/* ---------- Table columns ---------- */
const COLUMNS: Column[] = [
  { key: "ticketNo", label: "Ticket No", width: 120, align: "center" },
  { key: "user", label: "User", width: 180, align: "left" },
  { key: "reqTo", label: "Req To", width: 180, align: "left" },
  { key: "categories", label: "Category", width: 220, align: "left" },
  { key: "priority", label: "Priority", width: 80, align: "center" },
  { key: "status", label: "Status", width: 140, align: "center" },
  { key: "description", label: "Description", width: 320, align: "left" },
  { key: "remarks", label: "Remarks", width: 240, align: "left" },
  { key: "createdAt", label: "Created At", width: 180, align: "center" },
  { key: "action", label: "Action", width: 120, align: "center" },
];

/* ---------- Table (dark scroll) ---------- */
function DarkScrollTable({
  rows,
  columns,
  onUpdate,
  scope,
}: {
  rows: ReqRow[];
  columns: Column[];
  onUpdate: (row: ReqRow) => void;
  scope: "inbox" | "sent";
}) {
  const totalW = columns.reduce((acc, c) => acc + (c.width ?? 120), 0) + 16;

  return (
    <Box>
      <Box sx={{ width: totalW, minWidth: "100%" }}>
        {/* header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
            bgcolor: "#000",
            borderBottom: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {columns.map((c) => (
            <Box
              key={c.key}
              sx={{
                px: 1.25,
                py: 1,
                fontWeight: 700,
                fontSize: 13,
                color: "#fff",
                textAlign: c.align ?? "center",
                whiteSpace: "nowrap",
              }}
            >
              {c.label}
            </Box>
          ))}
        </Box>

        {/* rows */}
        {rows.map((r, idx) => (
          <Box
            key={r.id}
            sx={{
              display: "grid",
              gridTemplateColumns: columns.map((c) => `${c.width ?? 120}px`).join(" "),
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
            }}
          >
            {columns.map((c) => {
              if (c.key === "action") {
                // const canUpdate = scope === "inbox" && !FINAL.has(r.status);
                const canUpdate = scope === "inbox"; 
                return (
                  <Box
                    key={`action-${idx}`}
                    sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}
                  >
                    {canUpdate ? (
                      <Button
                        size="small"
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          fontSize: 12,
                          px: 1.25,
                          bgcolor: PRIMARY,
                          "&:hover": { bgcolor: "#6b48ea" },
                        }}
                        onClick={() => onUpdate(r)}
                      >
                        Update
                      </Button>
                    ) : (
                      <Box sx={{ fontSize: 12, color: "#999" }}>—</Box>
                    )}
                  </Box>
                );
              }
              if (c.key === "status") {
                return (
                  <Box key={`status-${idx}`} sx={{ px: 1.25, py: 0.9, textAlign: "center" }}>
                    <StatusChip value={r.status} />
                  </Box>
                );
              }
              if (c.key === "categories") {
                return (
                  <Box
                    key={`cats-${idx}`}
                    sx={{
                      px: 1.25,
                      py: 1,
                      fontSize: 13,
                      color: "#EAEAEA",
                      textAlign: c.align ?? "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {r.categories.join(", ")}
                  </Box>
                );
              }
              const val = r[c.key as keyof ReqRow] as any;
              return (
                <Box
                  key={String(c.key)}
                  sx={{
                    px: 1.25,
                    py: 1,
                    fontSize: 13,
                    color: "#EAEAEA",
                    textAlign: c.align ?? "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {val || "-"}
                </Box>
              );
            })}
          </Box>
        ))}

        {rows.length === 0 && (
          <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>
            No requests yet.
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ---------- Helpers ---------- */
function getStoredUser(): { id?: string; username?: string; name?: string; email?: string; full_name?: string } {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
const displayName = (u: BasicUser) => u.full_name || u.username || u.email || "(user)";

/* ---------- Page ---------- */
export default function RequestsPage() {
  const [tab, setTab] = React.useState<"new" | "list">("new");

  // list state
  const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");
  const [rows, setRows] = React.useState<ReqRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingList, setLoadingList] = React.useState(false);

  const UPDATE_STATUS_OPTIONS = [
  "In Review",
  "In Progress",
  "On Hold",
  "Done",
  "Cancelled",
] as const;

  // me
  const me = getStoredUser();
  const meId = String((me as any)?.id || "");

  // form state (create)
  const [ticketNo, setTicketNo] = React.useState<string>("Auto");
  const [userName] = React.useState<string>(
    me?.name || (me as any)?.full_name || me?.username || me?.email || "User"
  );
  const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
  const [reqToId, setReqToId] = React.useState<string>("");
  const [categories, setCategories] = React.useState<number[]>([]);
  const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
  const [additionalInfo, setAdditionalInfo] = React.useState("");
  const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
  const [submitting, setSubmitting] = React.useState(false);

  // update dialog state
  const [updOpen, setUpdOpen] = React.useState(false);
  const [updLoading, setUpdLoading] = React.useState(false);
  const [updId, setUpdId] = React.useState<number | null>(null);
  const [updTicketNo, setUpdTicketNo] = React.useState("");
  const [updRequester, setUpdRequester] = React.useState("");
  const [updTarget, setUpdTarget] = React.useState("");
  const [updCategories, setUpdCategories] = React.useState<string[]>([]);
  const [updPriority, setUpdPriority] = React.useState<"P1" | "P2" | "P3">("P2");
  const [updStatus, setUpdStatus] = React.useState<Status>("Submitted");
  const [updDescription, setUpdDescription] = React.useState("");
  const [updRemarks, setUpdRemarks] = React.useState("");

  // ---- fetch recipients + categories
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const j = await api.get<any>("/api/users");
        const arr: BasicUser[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        const filtered = meId ? arr.filter((u) => String(u.id) !== meId) : arr;
        if (!cancelled) {
          setRecipients(filtered);
          if (!reqToId && filtered.length) setReqToId(String(filtered[0].id));
        }
      } catch (e) {
        console.error("users fetch failed", e);
        if (!cancelled) setRecipients([]);
      }
    })();

    (async () => {
      try {
        const j = await api.get<any>("/api/categories");
        const arr: Category[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        if (!cancelled) setCategoryOpts(arr);
      } catch (e) {
        console.error("categories fetch failed", e);
        if (!cancelled) setCategoryOpts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meId, reqToId]);

  // ---- fetch list
  const fetchList = React.useCallback(
    async (pageNum: number, pageSize: number) => {
      if (tab !== "list") return;
      setLoadingList(true);
      try {
        const p = pageNum + 1; // API 1-based
        const j = await api.get<any>("/api/tickets", {
          params: { type: "request", scope, q: search || undefined, page: p, size: pageSize },
        });

        const arr: any[] = Array.isArray(j?.rows) ? j.rows : Array.isArray(j) ? j : [];
        const mapped: ReqRow[] = arr.map((x: any, idx: number) => {
          const status = String(x.status ?? "Submitted") as Status;
          return {
            id: Number(x.id),
            sr: pageNum * pageSize + idx + 1,
            ticketNo: String(x.ticket_no ?? ""),
            user: String(x.requester_name ?? ""),
            reqTo: String(x.target_name ?? ""),
            categories: String(x.categories ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            priority: (String(x.priority ?? "P2") as "P1" | "P2" | "P3"),
            status,
            description: String(x.description ?? ""),
            remarks: x.last_note ? String(x.last_note) : "",
            createdAt: new Date(x.created_at ?? Date.now()).toLocaleString(),
          };
        });

        setRows(mapped);
      } catch (e) {
        console.error("list fetch failed", e);
        setRows([]);
      } finally {
        setLoadingList(false);
      }
    },
    [scope, search, tab]
  );

  React.useEffect(() => {
    fetchList(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, scope]);

  React.useEffect(() => {
    if (tab === "list") fetchList(page, rowsPerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, search]);

  const handleCategoriesChange = (e: SelectChangeEvent<number[]>) => {
    const v = e.target.value as any;
    setCategories(typeof v === "string" ? v.split(",").map((n: string) => Number(n)) : (v as number[]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqToId) return alert("Please select recipient (Req To).");
    if (!categories.length) return alert("Please select at least one category.");

    try {
      setSubmitting(true);
      const payload = {
        type: "request",
        target_user_id: reqToId,
        priority,
        description: additionalInfo?.trim() || null, // goes to tickets.description
        categories, // numeric ids
        title: null,
      };
      const resp = await api.post<any>("/api/tickets", payload);
      const ticket_no = resp?.ticket_no || resp?.data?.ticket_no || "RTN-?";

      setTicketNo(ticket_no);
      setTab("list");
      setScope("sent");
      setPage(0);
      fetchList(0, rowsPerPage);

      setCategories([]);
      setAdditionalInfo("");
      setPriority("P2");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = rows; // server-side filtering
  const paged = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  // ---- Update dialog
  const openUpdate = async (row: ReqRow) => {
    try {
      setUpdOpen(true);
      setUpdLoading(true);
      setUpdId(row.id);
      setUpdTicketNo(row.ticketNo);
      // fetch detail for chips & freshness
      const j = await api.get<any>(`/api/tickets/${row.id}`);
      const t = j?.ticket || {};
      const cats = Array.isArray(j?.categories) ? j.categories : [];
      setUpdRequester(t.requester_name || row.user);
      setUpdTarget(t.target_name || row.reqTo);
      setUpdCategories(cats.map((c: any) => c.name));
      setUpdPriority((t.priority || row.priority) as any);
      setUpdStatus((t.status || row.status) as Status);
      setUpdDescription(t.description || row.description || "");
      setUpdRemarks("");
    } catch (e) {
      console.error(e);
      alert("Failed to open ticket.");
      setUpdOpen(false);
    } finally {
      setUpdLoading(false);
    }
  };

  const submitUpdate = async () => {
    if (!updId) return;
    try {
      setUpdLoading(true);
      await api.patch(`/api/tickets/${updId}`, {
        title: null,       
        status: updStatus,
        note: updRemarks?.trim() || null, // stored in history as latest note
      });
      setUpdOpen(false);
      fetchList(page, rowsPerPage);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Update failed");
    } finally {
      setUpdLoading(false);
    }
  };

  const columnsForScope = React.useMemo(
    () => (scope === "sent" ? COLUMNS.filter((c) => c.key !== "action") : COLUMNS),
    [scope]
  );

  return (
    <MainLayout title="Requests">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card sx={{ ...CARD_SX, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)` }}>
          {/* Header */}
          <Box
            sx={{
              px: UI.headerPx,
              py: UI.headerPy,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={tab}
              onChange={(_, v) => v && setTab(v)}
              sx={{
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#E8E8EA",
                  borderColor: "rgba(255,255,255,0.14)",
                  px: 1.25,
                  py: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "rgba(124,87,242,0.18)",
                    color: "#fff",
                    borderColor: "rgba(124,87,242,0.6)",
                  },
                },
              }}
            >
              <ToggleButton value="new">New Request</ToggleButton>
              <ToggleButton value="list">All Requests</ToggleButton>
            </ToggleButtonGroup>

            {/* Scope + search */}
            {tab === "list" && (
              <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1 }}>
                <ToggleButtonGroup
                  color="primary"
                  exclusive
                  value={scope}
                  onChange={(_, v) => v && (setScope(v), setPage(0))}
                  sx={{
                    "& .MuiToggleButton-root": {
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 12.5,
                      color: "#E8E8EA",
                      borderColor: "rgba(255,255,255,0.14)",
                      px: 1,
                      py: 0.3,
                      "&.Mui-selected": {
                        bgcolor: "rgba(124,87,242,0.18)",
                        color: "#fff",
                        borderColor: "rgba(124,87,242,0.6)",
                      },
                    },
                  }}
                >
                  <ToggleButton value="inbox">Inbox</ToggleButton>
                  <ToggleButton value="sent">Sent</ToggleButton>
                </ToggleButtonGroup>

                <TextField
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                  placeholder="Search…"
                  size="small"
                  sx={{
                    width: UI.searchW,
                    ...controlSx,
                    "& .MuiOutlinedInput-root": { pl: 1, height: 30 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0.25 }}>
                        <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,0.75)" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
            {tab === "new" && (
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
                  columnGap: 2,
                  rowGap: 2,
                  "& .form-item": { display: "flex", flexDirection: "column" },
                }}
              >
                {/* Row 1 */}
                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Request Ticket No</Typography>
                  <TextField value={ticketNo} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>User</Typography>
                  <TextField value={userName} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Req To</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={reqToId}
                      onChange={(e) => setReqToId(String(e.target.value))}
                      sx={controlSx}
                      MenuProps={darkMenu}
                      displayEmpty
                      renderValue={(v) => {
                        const u = recipients.find((x) => String(x.id) === String(v));
                        return u ? displayName(u) : "Select recipient";
                      }}
                    >
                      <MenuItem disabled value="">
                        Select recipient
                      </MenuItem>
                      {recipients.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {displayName(u)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 2 */}
                <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
                  <Typography sx={LABEL_SX}>Req Category</Typography>
                  <FormControl fullWidth size="small">
                    <Select<number[]>
                      multiple
                      value={categories}
                      onChange={handleCategoriesChange}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as number[]).length
                          ? (selected as number[])
                              .map((id) => categoryOpts.find((c) => c.id === id)?.name || String(id))
                              .join(", ")
                          : "Select category"
                      }
                      input={<OutlinedInput />}
                      sx={controlSx}
                      MenuProps={darkMenu}
                    >
                      <MenuItem disabled value="">
                        Select category
                      </MenuItem>
                      {categoryOpts.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Checkbox checked={categories.indexOf(c.id) > -1} sx={{ p: 0.5, color: "#bbb" }} />
                          </ListItemIcon>
                          <ListItemText primary={c.name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Priority</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as "P1" | "P2" | "P3")}
                      sx={controlSx}
                      MenuProps={darkMenu}
                    >
                      {["P1", "P2", "P3"].map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 3 */}
                <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
                  <Typography sx={LABEL_SX}>Req Additional Info</Typography>
                  <TextField
                    value={additionalInfo}
                    onChange={(e) => setAdditionalInfo(e.target.value)}
                    placeholder="write request in detail for Admin"
                    size="small"
                    sx={{
                      ...controlSx,
                      "& .MuiOutlinedInput-root": { height: "auto" },
                      "& .MuiInputBase-input": {
                        height: "auto",
                        padding: "10px 12px",
                        lineHeight: 1.25,
                        fontSize: 13,
                        color: "#fff",
                      },
                    }}
                    multiline
                    minRows={3}
                  />
                </Box>

                {/* Actions */}
                <Box
                  sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      bgcolor: PRIMARY,
                      "&:hover": { bgcolor: "#6b48ea" },
                    }}
                    disabled={!reqToId || !categories.length || submitting}
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      fontSize: 13,
                      borderColor: "rgba(255,255,255,0.28)",
                      color: "#E8E8EA",
                    }}
                    onClick={() => {
                      setCategories([]);
                      setAdditionalInfo("");
                      setPriority("P2");
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            )}

            {tab === "list" && (
              <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
                <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
                  <DarkScrollTable
                    rows={paged}
                    columns={columnsForScope}
                    onUpdate={openUpdate}
                    scope={scope}
                  />
                </Box>
                {loadingList && <Box sx={{ textAlign: "center", color: "#aaa", py: 1 }}>Loading…</Box>}
              </Box>
            )}
          </Box>

          {/* pagination (only on list tab) */}
          {tab === "list" && (
            <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
              <TablePagination
                component="div"
                count={filtered.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  px: 1,
                  color: "#E8E8EA",
                  minHeight: UI.paginationH,
                  "& .MuiTablePagination-toolbar": {
                    minHeight: UI.paginationH,
                    p: 0,
                    pl: 1,
                    pr: 1,
                    gap: 0.5,
                  },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                    fontSize: UI.font,
                    m: 0,
                  },
                  "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
                  "& .MuiSelect-select": {
                    py: 0,
                    px: 1,
                    fontSize: UI.font,
                    height: 30 - 6,
                    display: "flex",
                    alignItems: "center",
                    bgcolor: CONTROL_BG,
                    borderRadius: 1,
                  },
                  "& .MuiIconButton-root": { p: 0.25 },
                  ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
                }}
              />
            </Box>
          )}
        </Card>
      </Box>

      {/* ----- Update Dialog (dark) ----- */}
      <Dialog
        open={updOpen}
        onClose={() => setUpdOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            bgcolor: "#1C1C1E",
            color: "#E8E8EA",
            border: "1px solid rgba(255,255,255,0.14)",
          },
        }}
      >
        <DialogTitle>Update Request</DialogTitle>
        <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
              mt: 0.5,
            }}
          >
            <TextField
              label="Ticket No"
              value={updTicketNo}
              size="small"
              InputProps={{ readOnly: true }}
              sx={controlSx}
              InputLabelProps={LABEL_WHITE_PROPS}
            />
            {/* <TextField
              label="Priority"
              select
              value={updPriority}
              onChange={(e) => setUpdPriority(e.target.value as any)}
              size="small"
              sx={controlSx}
              SelectProps={darkMenu as any}
              InputLabelProps={LABEL_WHITE_PROPS}
            >
              {["P1", "P2", "P3"].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField> */}

            <TextField
  label="Priority"
  select
  value={updPriority}
  size="small"
  sx={controlSx}
  SelectProps={darkMenu as any}
  InputLabelProps={LABEL_WHITE_PROPS}
  disabled   // <-- make read-only
>
  {["P1", "P2", "P3"].map((p) => (
    <MenuItem key={p} value={p}>{p}</MenuItem>
  ))}
</TextField>


            <TextField
              label="Requester"
              value={updRequester}
              size="small"
              InputProps={{ readOnly: true }}
              sx={controlSx}
              InputLabelProps={LABEL_WHITE_PROPS}
            />
            <TextField
              label="Req To"
              value={updTarget}
              size="small"
              InputProps={{ readOnly: true }}
              sx={controlSx}
              InputLabelProps={LABEL_WHITE_PROPS}
            />

            {/* <TextField
              label="Status"
              select
              value={updStatus}
              onChange={(e) => setUpdStatus(e.target.value as Status)}
              size="small"
              sx={controlSx}
              SelectProps={darkMenu as any}
              InputLabelProps={LABEL_WHITE_PROPS}
            >
              {STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField> */}

            <TextField
  label="Status"
  select
  value={updStatus}
  onChange={(e) => setUpdStatus(e.target.value as Status)}
  size="small"
  sx={controlSx}
  SelectProps={darkMenu as any}
  InputLabelProps={LABEL_WHITE_PROPS}
>
  {UPDATE_STATUS_OPTIONS.map((s) => (
    <MenuItem key={s} value={s}>{s}</MenuItem>
  ))}
</TextField>

            <Box />

            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ ...LABEL_SX, mb: 0.75 }}>Categories</Typography>
              {/* <Stack direction="row" spacing={1} flexWrap="wrap">
                {updCategories.length ? (
                  updCategories.map((n, i) => <Chip key={i} size="small" label={n} />)
                ) : (
                  <Typography sx={{ color: "#9ca3af" }}>None</Typography>
                )}
              </Stack> */}

              <Stack direction="row" spacing={1} flexWrap="wrap">
  {updCategories.length ? (
    updCategories.map((n, i) => (
      <Chip
        key={i}
        size="small"
        label={n}
        variant="outlined"
        sx={{
          color: "#fff",
          borderColor: "rgba(255,255,255,0.65)",
          bgcolor: "transparent",
        }}
      />
    ))
  ) : (
    <Typography sx={{ color: "#9ca3af" }}>None</Typography>
  )}
</Stack>
            </Box>

            <Box sx={{ gridColumn: "1 / -1" }}>
              {/* <TextField
                label="Description"
                value={updDescription}
                onChange={(e) => setUpdDescription(e.target.value)}
                size="small"
                multiline
                minRows={3}
                fullWidth
                sx={controlSx}
                InputLabelProps={LABEL_WHITE_PROPS}
              /> */}

              <TextField
  label="Description"
  value={updDescription}
  size="small"
  multiline
  minRows={3}
  fullWidth
  sx={controlSx}
  InputLabelProps={LABEL_WHITE_PROPS}
  InputProps={{ readOnly: true }}   // <-- make read-only
/>
            </Box>

            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                label="Remarks (note for this update)"
                value={updRemarks}
                onChange={(e) => setUpdRemarks(e.target.value)}
                size="small"
                multiline
                minRows={2}
                fullWidth
                
                sx={controlSx}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpdOpen(false)} disabled={updLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submitUpdate}
            disabled={updLoading}
            sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
          >
            {updLoading ? "Saving…" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
