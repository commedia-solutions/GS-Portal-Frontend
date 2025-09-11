// // src/pages/Issues/index.tsx
// import * as React from "react";
// import { Box, Card } from "@mui/material";
// import MainLayout from "../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../components/TopNav";

// /* ---------- UI constants (match your style) ---------- */
// const CONTROL_BG = "#1C1C1E";
// const UI = {
//   ctrlH: 30,
//   font: 13,
//   icon: 16,
//   gap: 0.75,
//   headerPx: 1.25,
//   headerPy: 0.6,
// };

// export default function IssuesPage() {
//   return (
//     <MainLayout title="Issues">
//       <Box sx={{ px: 2, py: 1.5 }}>
//         <Card
//           sx={{
//             bgcolor: CONTROL_BG,
//             color: "#E8E8EA",
//             border: "1px solid rgba(255,255,255,0.14)",
//             borderRadius: 2,
//             height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
//             display: "flex",
//             flexDirection: "column",
//           }}
//         >
//           {/* header */}
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: UI.gap,
//               px: UI.headerPx,
//               py: UI.headerPy,
//               borderBottom: "1px solid rgba(255,255,255,0.12)",
//               fontWeight: 700,
//               fontSize: 15,
//             }}
//           >
//             Issues
//             <Box sx={{ ml: "auto" }} />
//           </Box>

//           {/* body (empty for now) */}
//           <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
//             <Box
//               sx={{
//                 height: "100%",
//                 borderRadius: 1,
//                 overflow: "hidden",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 color: "#9ca3af",
//                 fontSize: 14,
//               }}
//             >
//               {/* Placeholder – we’ll add tabs/table/form next */}
//               Empty — Issues UI coming next
//             </Box>
//           </Box>
//         </Card>
//       </Box>
//     </MainLayout>
//   );
// }

//p1//
// src/pages/Issues/index.tsx
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
//   TablePagination,
//   Typography,
//   Chip,
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";
// import SearchIcon from "@mui/icons-material/Search";
// import MainLayout from "../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../components/TopNav";

// /* ---------- Shared UI ---------- */
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
// type IssueRow = {
//   id: number;
//   sr: number;
//   ticketNo: string;
//   user: string;
//   reportTo: string;
//   category: string;
//   priority: "P1" | "P2" | "P3";
//   status: "New" | "Triaged" | "In Progress" | "Resolved" | "Closed";
//   createdAt: string;
//   attachments: string[]; // file names only for list view
// };

// type Column = {
//   key: keyof IssueRow | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

// /* ---------- Options ---------- */
// const REPORT_TO_OPTIONS = ["Admin (Primary)", "Admin 2", "Admin 3", "Admin Duty"];
// const CATEGORY_OPTIONS = [
//   "Passes",
//   "Licenses",
//   "Satellites",
//   "Ground Stations",
//   "User & Role",
//   "Pass Schedule",
//   "Documents",
// ];
// const PRIORITY_OPTIONS: Array<IssueRow["priority"]> = ["P1", "P2", "P3"];

// /* ---------- Helpers ---------- */
// function getUserDisplay(): string {
//   try {
//     const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
//     if (!raw) return "User";
//     const obj = JSON.parse(raw);
//     return obj?.name || obj?.username || obj?.email || String(raw) || "User";
//   } catch {
//     const fallback = sessionStorage.getItem("user") || localStorage.getItem("user");
//     return fallback || "User";
//   }
// }
// function nextIssueNo(n: number) {
//   return `RIN-${String(n).padStart(3, "0")}`;
// }

// /* ---------- Status chip ---------- */
// function StatusChip({ value }: { value: IssueRow["status"] }) {
//   const map: Record<IssueRow["status"], { bg: string; fg: string }> = {
//     New: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
//     Triaged: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//     "In Progress": { bg: "rgba(124,87,242,0.22)", fg: "#c7b8ff" },
//     Resolved: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
//     Closed: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//   };
//   const { bg, fg } = map[value];
//   return (
//     <Box
//       sx={{
//         display: "inline-flex",
//         px: 1,
//         py: 0.25,
//         borderRadius: 1,
//         bgcolor: bg,
//         color: fg,
//         fontSize: 12,
//         fontWeight: 700,
//         whiteSpace: "nowrap",
//       }}
//     >
//       {value}
//     </Box>
//   );
// }

// /* ---------- Table columns ---------- */
// const COLUMNS: Column[] = [
//   { key: "sr", label: "Sr No", width: 80, align: "center" },
//   { key: "ticketNo", label: "Ticket No", width: 120, align: "center" },
//   { key: "user", label: "User", width: 180, align: "left" },
//   { key: "reportTo", label: "Report To", width: 140, align: "center" },
//   { key: "category", label: "Category", width: 200, align: "left" },
//   { key: "priority", label: "Priority", width: 100, align: "center" },
//   { key: "status", label: "Status", width: 140, align: "center" },
//   { key: "createdAt", label: "Created At", width: 200, align: "center" },
//   { key: "attachments", label: "Files", width: 100, align: "center" },
//   { key: "action", label: "Action", width: 120, align: "center" },
// ];

// /* ---------- Table (dark scroll) ---------- */
// function DarkScrollTable({ rows, columns }: { rows: IssueRow[]; columns: Column[] }) {
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
//                   <Box
//                     key={`action-${idx}`}
//                     sx={{
//                       px: 1.25,
//                       py: 0.75,
//                       display: "flex",
//                       justifyContent: "center",
//                       alignItems: "center",
//                     }}
//                   >
//                     <Button
//                       size="small"
//                       variant="contained"
//                       sx={{
//                         textTransform: "none",
//                         fontWeight: 700,
//                         fontSize: 12,
//                         px: 1.25,
//                         bgcolor: PRIMARY,
//                         "&:hover": { bgcolor: "#6b48ea" },
//                       }}
//                       disabled
//                     >
//                       Open
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
//               if (c.key === "attachments") {
//                 return (
//                   <Box
//                     key={`files-${idx}`}
//                     sx={{
//                       px: 1.25,
//                       py: 1,
//                       fontSize: 13,
//                       color: "#EAEAEA",
//                       textAlign: "center",
//                       whiteSpace: "nowrap",
//                     }}
//                   >
//                     {r.attachments.length}
//                   </Box>
//                 );
//               }
//               const val = r[c.key as keyof IssueRow] as any;
//               return (
//                 <Box
//                   key={String(c.key)}
//                   sx={{
//                     px: 1.25,
//                     py: 1,
//                     fontSize: 13,
//                     color: "#EAEAEA",
//                     textAlign: c.align ?? "center",
//                     whiteSpace: "nowrap",
//                   }}
//                 >
//                   {val}
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}

//         {rows.length === 0 && (
//           <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>
//             No issues yet.
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// }

// /* ---------- Page ---------- */
// export default function IssuesPage() {
//   const [tab, setTab] = React.useState<"new" | "list">("new");

//   // list state (mock)
//   const [rows, setRows] = React.useState<IssueRow[]>([]);
//   const [search, setSearch] = React.useState("");
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(10);

//   // form state
//   const [ticketNo, setTicketNo] = React.useState(nextIssueNo(1));
//   const [userName] = React.useState(getUserDisplay());
//   const [reportTo, setReportTo] = React.useState(REPORT_TO_OPTIONS[0]);
//   const [category, setCategory] = React.useState("");
//   const [priority, setPriority] = React.useState<IssueRow["priority"]>("P2");
//   const [details, setDetails] = React.useState("");
//   const [files, setFiles] = React.useState<File[]>([]);
//   const fileInputRef = React.useRef<HTMLInputElement | null>(null);

//   // next ticket number on list length change
//   React.useEffect(() => {
//     setTicketNo(nextIssueNo(rows.length + 1));
//   }, [rows.length]);

//   const handlePickFiles = () => fileInputRef.current?.click();
//   const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const list = e.target.files ? Array.from(e.target.files) : [];
//     if (!list.length) return;
//     setFiles((prev) => [...prev, ...list]);
//     e.target.value = ""; // allow re-selecting same files
//   };
//   const removeFileAt = (idx: number) =>
//     setFiles((prev) => prev.filter((_, i) => i !== idx));

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!category) {
//       alert("Please select Report Category.");
//       return;
//     }
//     const newRow: IssueRow = {
//       id: rows.length + 1,
//       sr: rows.length + 1,
//       ticketNo,
//       user: userName,
//       reportTo,
//       category,
//       priority,
//       status: "New",
//       createdAt: new Date().toLocaleString(),
//       attachments: files.map((f) => f.name),
//     };
//     setRows((prev) => [newRow, ...prev]);
//     // reset minimal fields
//     setCategory("");
//     setPriority("P2");
//     setDetails("");
//     setFiles([]);
//     setTab("list");
//   };

//   const handleReset = () => {
//     setReportTo(REPORT_TO_OPTIONS[0]);
//     setCategory("");
//     setPriority("P2");
//     setDetails("");
//     setFiles([]);
//   };

//   const filtered = React.useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return rows;
//     return rows.filter((r) =>
//       [r.ticketNo, r.user, r.reportTo, r.category, r.priority, r.status, r.createdAt]
//         .join(" ")
//         .toLowerCase()
//         .includes(q)
//     );
//   }, [rows, search]);

//   const paged = React.useMemo(
//     () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
//     [filtered, page, rowsPerPage]
//   );

//   return (
//     <MainLayout title="Issues">
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
//               <ToggleButton value="new">Report Issue</ToggleButton>
//               <ToggleButton value="list">All Issues</ToggleButton>
//             </ToggleButtonGroup>

//             {/* search on list tab */}
//             <Box sx={{ ml: "auto", display: tab === "list" ? "flex" : "none" }}>
//               <TextField
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search…"
//                 size="small"
//                 sx={{
//                   width: UI.searchW,
//                   ...controlSx,
//                   "& .MuiOutlinedInput-root": { pl: 1, height: 30 },
//                 }}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start" sx={{ mr: 0.25 }}>
//                       <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,0.75)" }} />
//                     </InputAdornment>
//                   ),
//                 }}
//               />
//             </Box>
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
//                   <Typography sx={LABEL_SX}>Report Issue Ticket No</Typography>
//                   <TextField value={ticketNo} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>User</Typography>
//                   <TextField value={userName} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>Report To</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select
//                       value={reportTo}
//                       onChange={(e) => setReportTo(String(e.target.value))}
//                       sx={controlSx}
//                       MenuProps={darkMenu}
//                     >
//                       {REPORT_TO_OPTIONS.map((o) => (
//                         <MenuItem key={o} value={o}>
//                           {o}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>

//                 {/* Row 2 */}
//                 <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
//                   <Typography sx={LABEL_SX}>Report Category</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select
//                       displayEmpty
//                       value={category}
//                       onChange={(e: SelectChangeEvent<string>) => setCategory(e.target.value)}
//                       input={<OutlinedInput />}
//                       sx={controlSx}
//                       MenuProps={darkMenu}
//                     >
//                       <MenuItem disabled value="">
//                         Select category
//                       </MenuItem>
//                       {CATEGORY_OPTIONS.map((c) => (
//                         <MenuItem key={c} value={c}>
//                           {c}
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
//                       onChange={(e) => setPriority(e.target.value as IssueRow["priority"])}
//                       sx={controlSx}
//                       MenuProps={darkMenu}
//                     >
//                       {PRIORITY_OPTIONS.map((p) => (
//                         <MenuItem key={p} value={p}>
//                           {p}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>

//                 {/* Row 3: Details */}
//                 <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
//                   <Typography sx={LABEL_SX}>Issue Additional Info</Typography>
//                   <TextField
//                     value={details}
//                     onChange={(e) => setDetails(e.target.value)}
//                     placeholder="Describe the problem, steps to reproduce, expected vs actual..."
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

//                 {/* Row 4: Attachments */}
//                 <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
//                   <Typography sx={{ ...LABEL_SX, mb: 0 }}>Attachments</Typography>
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     multiple
//                     accept="image/*,application/pdf"
//                     hidden
//                     onChange={onFilesSelected}
//                   />
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     onClick={handlePickFiles}
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: 13,
//                       borderColor: "rgba(255,255,255,0.28)",
//                       color: "#E8E8EA",
//                       ml: 1,
//                     }}
//                   >
//                     Select Files
//                   </Button>

//                   {/* Selected files as chips */}
//                   {files.map((f, idx) => (
//                     <Chip
//                       key={`${f.name}-${idx}`}
//                       label={f.name}
//                       onDelete={() => removeFileAt(idx)}
//                       sx={{
//                         bgcolor: "rgba(255,255,255,0.08)",
//                         color: "#e5e7eb",
//                         border: "1px solid rgba(255,255,255,0.14)",
//                       }}
//                     />
//                   ))}
//                 </Box>

//                 {/* Actions */}
//                 <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: 13,
//                       bgcolor: PRIMARY,
//                       "&:hover": { bgcolor: "#6b48ea" },
//                     }}
//                     disabled={!category}
//                   >
//                     Submit
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: 13,
//                       borderColor: "rgba(255,255,255,0.28)",
//                       color: "#E8E8EA",
//                     }}
//                     onClick={handleReset}
//                   >
//                     Reset
//                   </Button>
//                 </Box>
//               </Box>
//             )}

//             {tab === "list" && (
//               <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
//                 <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
//                   <DarkScrollTable rows={paged} columns={COLUMNS} />
//                 </Box>
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
//                   "& .MuiTablePagination-toolbar": {
//                     minHeight: UI.paginationH,
//                     p: 0,
//                     pl: 1,
//                     pr: 1,
//                     gap: 0.5,
//                   },
//                   "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
//                     fontSize: UI.font,
//                     m: 0,
//                   },
//                   "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
//                   "& .MuiSelect-select": {
//                     py: 0,
//                     px: 1,
//                     fontSize: UI.font,
//                     height: 30 - 6,
//                     display: "flex",
//                     alignItems: "center",
//                     bgcolor: CONTROL_BG,
//                     borderRadius: 1,
//                   },
//                   "& .MuiIconButton-root": { p: 0.25 },
//                   ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
//                 }}
//               />
//             </Box>
//           )}
//         </Card>
//       </Box>
//     </MainLayout>
//   );
// }



// p2//

// // src/pages/Issues/index.tsx
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
//   IconButton,
//   Tooltip,
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";
// import SearchIcon from "@mui/icons-material/Search";
// import DownloadIcon from "@mui/icons-material/Download";
// import MainLayout from "../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../components/TopNav";
// import { api } from "../api/http";

// /* ---------- Shared UI ---------- */
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
//   color: "rgba(255,255,255,0.95)",
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
//   headerPx: 1.25,
//   headerPy: 0.6,
//   font: 13,
//   icon: 16,
//   searchW: 260,
//   paginationH: 36,
// };

// /* ---------- Status options used in the Update dialog ---------- */
// const ISSUE_STATUS_OPTIONS = [
//   "Triaged",
//   "In Progress",
//   "On Hold",
//   "Resolved",
//   "Closed",
//   "Cancelled",
// ] as const;

// type IssueStatus =
//   | "New"
//   | (typeof ISSUE_STATUS_OPTIONS)[number]; // list plus "New" as initial

// const FINAL: Set<IssueStatus> = new Set(["Resolved", "Closed", "Cancelled"]);

// /* ---------- Types ---------- */
// type IssueRow = {
//   id: number;
//   sr: number;
//   ticketNo: string;
//   user: string;
//   reportTo: string;
//   categories: string[];
//   priority: "P1" | "P2" | "P3";
//   status: IssueStatus;
//   description: string;
//   createdAt: string;

//   // for permissions & downloads
//   targetUserId: string;
//   canUpdate?: boolean;
//   attachmentsCount?: number; // optional; button works even if unknown
// };

// type Column = {
//   key: keyof IssueRow | "files" | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

// type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
// type Category = { id: number; name: string };

// /* ---------- Helpers ---------- */
// function getStoredUser(): {
//   id?: string;
//   username?: string;
//   name?: string;
//   email?: string;
//   full_name?: string;
// } {
//   try {
//     const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
//     if (!raw) return {};
//     return JSON.parse(raw);
//   } catch {
//     return {};
//   }
// }
// const displayName = (u: BasicUser) => u.full_name || u.username || u.email || "(user)";

// /* ---------- Status chip (dark) ---------- */
// function StatusChip({ value }: { value: IssueStatus }) {
//   const map: Record<IssueStatus, { bg: string; fg: string }> = {
//     New: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
//     Triaged: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//     "In Progress": { bg: "rgba(124,87,242,0.22)", fg: "#c7b8ff" },
//     "On Hold": { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//     Resolved: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
//     Closed: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//     Cancelled: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//   };
//   const { bg, fg } = map[value] || map.New;
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
//   { key: "reportTo", label: "Report To", width: 180, align: "left" },
//   { key: "categories", label: "Category", width: 220, align: "left" },
//   { key: "priority", label: "Priority", width: 80, align: "center" },
//   { key: "status", label: "Status", width: 140, align: "center" },
//   { key: "createdAt", label: "Created At", width: 180, align: "center" },
//   { key: "files", label: "Files", width: 100, align: "center" },
//   { key: "action", label: "Action", width: 120, align: "center" },
// ];

// /* ---------- Table (dark scroll) ---------- */
// function DarkScrollTable({
//   rows,
//   columns,
//   scope,
//   onUpdate,
//   onDownloadZip,
// }: {
//   rows: IssueRow[];
//   columns: Column[];
//   scope: "inbox" | "sent";
//   onUpdate: (row: IssueRow) => void;
//   onDownloadZip: (row: IssueRow) => void;
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
//                 const canUpdate = scope === "inbox" && !FINAL.has(r.status);
//                 return (
//                   <Box key={`action-${idx}`} sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}>
//                     {canUpdate ? (
//                       <Button
//                         size="small"
//                         variant="contained"
//                         sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
//                         onClick={() => onUpdate(r)}
//                       >
//                         Update
//                       </Button>
//                     ) : (
//                       <Box sx={{ fontSize: 12, color: "#999" }}>—</Box>
//                     )}
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

//               if (c.key === "files") {
//                 return (
//                   <Box key={`files-${idx}`} sx={{ px: 1.25, py: 0.6, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                     <Tooltip title="Download all attachments">
//                       <span>
//                         <IconButton
//                           size="small"
//                           onClick={() => onDownloadZip(r)}
//                           sx={{ color: "#ddd" }}
//                         >
//                           <DownloadIcon fontSize="small" />
//                         </IconButton>
//                       </span>
//                     </Tooltip>
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

//               const val = r[c.key as keyof IssueRow] as any;
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
//             No issues yet.
//           </Box>
//         )}
//       </Box>
//     </Box>
//   );
// }

// /* ---------- Page ---------- */
// export default function IssuesPage() {
//   const [tab, setTab] = React.useState<"new" | "list">("new");
//   const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");

//   // list state
//   const [rows, setRows] = React.useState<IssueRow[]>([]);
//   const [search, setSearch] = React.useState("");
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(10);
//   const [loadingList, setLoadingList] = React.useState(false);

//   // me
//   const me = getStoredUser();
//   const meId = String((me as any)?.id || "");
//   const meName = me?.name || (me as any)?.full_name || me?.username || me?.email || "User";

//   // form state (create)
//   const [ticketNo, setTicketNo] = React.useState<string>("Auto");
//   const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
//   const [reportToId, setReportToId] = React.useState<string>("");
//   const [categories, setCategories] = React.useState<number[]>([]);
//   const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
//   const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
//   const [details, setDetails] = React.useState("");
//   const [files, setFiles] = React.useState<File[]>([]);
//   const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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
//   const [updStatus, setUpdStatus] = React.useState<IssueStatus>("New");
//   const [updDescription, setUpdDescription] = React.useState("");
//   const [updRemarks, setUpdRemarks] = React.useState("");

//   /* -------- fetch recipients + categories -------- */
//   React.useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         const j = await api.get<any>("/api/users");
//         const arr: BasicUser[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
//         const filtered = meId ? arr.filter((u) => String(u.id) !== meId) : arr;
//         if (!cancelled) {
//           setRecipients(filtered);
//           if (!reportToId && filtered.length) setReportToId(String(filtered[0].id));
//         }
//       } catch {
//         if (!cancelled) setRecipients([]);
//       }
//     })();

//     (async () => {
//       try {
//         const j = await api.get<any>("/api/categories");
//         const arr: Category[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
//         if (!cancelled) setCategoryOpts(arr);
//       } catch {
//         if (!cancelled) setCategoryOpts([]);
//       }
//     })();

//     return () => { cancelled = true; };
//   }, [meId, reportToId]);

//   /* -------- list fetch -------- */
//   const fetchList = React.useCallback(
//     async (pageNum: number, pageSize: number) => {
//       if (tab !== "list") return;
//       setLoadingList(true);
//       try {
//         const p = pageNum + 1; // API is 1-based
//         const j = await api.get<any>("/api/tickets", {
//           params: { type: "issue", scope, q: search || undefined, page: p, size: pageSize },
//         });

//    const arr: any[] = Array.isArray(j?.rows) ? j.rows : Array.isArray(j) ? j : [];
//   const mapped: IssueRow[] = arr.map((x: any, idx: number) => {
//   const status = String(x.status ?? "New") as IssueStatus;
//   const targetId = String(x.target_user_id ?? "");

//   const canUpdate =
//     scope === "inbox" &&
//     !!meId &&                 // <- force boolean
//     meId === targetId &&
//     !FINAL.has(status);

//   return {
//     id: Number(x.id),
//     sr: pageNum * pageSize + idx + 1,
//     ticketNo: String(x.ticket_no ?? ""),
//     user: String(x.requester_name ?? ""),
//     reportTo: String(x.target_name ?? ""),
//     categories: String(x.categories ?? "")
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean),
//     priority: (String(x.priority ?? "P2") as "P1" | "P2" | "P3"),
//     status,
//     description: String(x.description ?? ""),
//     createdAt: new Date(x.created_at ?? Date.now()).toLocaleString(),
//     targetUserId: targetId,
//     canUpdate,               // <- now strictly boolean
//   };
// });

//         setRows(mapped);
//       } catch (e) {
//         console.error("issues list fetch failed", e);
//         setRows([]);
//       } finally {
//         setLoadingList(false);
//       }
//     },
//     [scope, search, tab, meId]
//   );

//   React.useEffect(() => {
//     fetchList(page, rowsPerPage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tab, scope]);

//   React.useEffect(() => {
//     if (tab === "list") fetchList(page, rowsPerPage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, rowsPerPage, search]);

//   /* -------- file pick/reset -------- */
//   const handlePickFiles = () => fileInputRef.current?.click();
//   const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const list = e.target.files ? Array.from(e.target.files) : [];
//     if (!list.length) return;
//     setFiles((prev) => [...prev, ...list]);
//     e.target.value = "";
//   };
//   const removeFileAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

//   /* -------- create Issue (ticket type: issue) -------- */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reportToId) return alert("Please select Report To.");
//     if (!categories.length) return alert("Please select at least one category.");

//     try {
//       setSubmitting(true);
//       // 1) create the ticket
//       const resp = await api.post<any>("/api/tickets", {
//         type: "issue",
//         target_user_id: reportToId,
//         priority,
//         description: details?.trim() || null,
//         categories,               // numeric ids
//         title: null,
//       });

//       const ticket_id = resp?.ticket_id ?? resp?.data?.ticket_id;
//       const newTicketNo = resp?.ticket_no ?? resp?.data?.ticket_no ?? "RIN-?";
//       setTicketNo(newTicketNo);

//       // 2) upload attachments (if any)
//       if (ticket_id && files.length) {
//         const form = new FormData();
//         files.forEach((f) => form.append("files", f));
//         // use fetch to avoid axios responseType quirks
//         await fetch(`/api/tickets/${ticket_id}/attachments`, {
//           method: "POST",
//           body: form,
//           credentials: "include",
//         });
//       }

      
//       // switch to list -> "sent" so reporter sees it in Sent
//       setTab("list");
//       setScope("sent");
//       setPage(0);
//       fetchList(0, rowsPerPage);

//       // reset the form
//       setCategories([]);
//       setDetails("");
//       setPriority("P2");
//       setFiles([]);
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to submit issue.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleReset = () => {
//     setReportToId(recipients[0]?.id ? String(recipients[0].id) : "");
//     setCategories([]);
//     setPriority("P2");
//     setDetails("");
//     setFiles([]);
//   };

//   /* -------- Update dialog -------- */
//   const openUpdate = async (row: IssueRow) => {
//     try {
//       setUpdOpen(true);
//       setUpdLoading(true);
//       setUpdId(row.id);
//       setUpdTicketNo(row.ticketNo);

//       const j = await api.get<any>(`/api/tickets/${row.id}`);
//       const t = j?.ticket || {};
//       const cats = Array.isArray(j?.categories) ? j.categories : [];

//       setUpdRequester(t.requester_name || row.user);
//       setUpdTarget(t.target_name || row.reportTo);
//       setUpdCategories(cats.map((c: any) => c.name));
//       setUpdPriority((t.priority || row.priority) as any);
//       setUpdStatus((t.status || row.status) as IssueStatus);
//       setUpdDescription(t.description || row.description || "");
//       setUpdRemarks("");
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
//         // keep priority & description read-only here; we only send status+note
//         status: updStatus,
//         note: updRemarks?.trim() || null,
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

//   /* -------- download all files (ZIP) -------- */
//   const handleDownloadZip = async (row: IssueRow) => {
//     try {
//       const res = await fetch(`/api/tickets/${row.id}/attachments.zip`, {
//         method: "GET",
//         credentials: "include",
//       });
//       if (!res.ok) {
//         const tx = await res.text();
//         throw new Error(tx || `Download failed (${res.status})`);
//       }
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${row.ticketNo}_attachments.zip`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "No attachments found for this ticket.");
//     }
//   };

//   const filtered = rows; // server does filtering via q
//   const paged = React.useMemo(
//     () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
//     [filtered, page, rowsPerPage]
//   );

//   const columnsForScope = React.useMemo(
//     () => (scope === "sent" ? COLUMNS.map((c) => (c.key === "action" ? { ...c, width: 80 } : c)).filter((c) => c.key !== "action") : COLUMNS),
//     [scope]
//   );

//   return (
//     <MainLayout title="Issues">
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
//               <ToggleButton value="new">Report Issue</ToggleButton>
//               <ToggleButton value="list">All Issues</ToggleButton>
//             </ToggleButtonGroup>

//             {/* Scope + search on list tab */}
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
//                   <Typography sx={LABEL_SX}>Report Issue Ticket No</Typography>
//                   <TextField value={ticketNo} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>User</Typography>
//                   <TextField value={meName} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>Report To</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select
//                       value={reportToId}
//                       onChange={(e) => setReportToId(String(e.target.value))}
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

//                 {/* Row 2: categories + priority */}
//                 <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
//                   <Typography sx={LABEL_SX}>Report Category</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select<number[]>
//                       multiple
//                       value={categories}
//                       onChange={(e: SelectChangeEvent<number[]>) => {
//                         const v = e.target.value as any;
//                         setCategories(typeof v === "string" ? v.split(",").map((n: string) => Number(n)) : (v as number[]));
//                       }}
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

//                 {/* Row 3: details */}
//                 <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
//                   <Typography sx={LABEL_SX}>Issue Additional Info</Typography>
//                   <TextField
//                     value={details}
//                     onChange={(e) => setDetails(e.target.value)}
//                     placeholder="Describe the problem, steps to reproduce, expected vs actual..."
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

//                 {/* Row 4: attachments */}
//                 <Box sx={{ gridColumn: "1 / -1" }}>
//                   <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>Attachments</Typography>
//                   <input ref={fileInputRef} type="file" multiple hidden onChange={onFilesSelected} />
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     onClick={handlePickFiles}
//                     sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "rgba(255,255,255,0.28)", color: "#E8E8EA", mb: 1 }}
//                   >
//                     Select Files
//                   </Button>
//                   <Stack direction="row" spacing={1} flexWrap="wrap">
//                     {files.map((f, idx) => (
//                       <Chip
//                         key={`${f.name}-${idx}`}
//                         label={f.name}
//                         onDelete={() => removeFileAt(idx)}
//                         sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}
//                       />
//                     ))}
//                   </Stack>
//                 </Box>

//                 {/* Actions */}
//                 <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
//                     disabled={!reportToId || !categories.length || submitting}
//                   >
//                     {submitting ? "Submitting…" : "Submit"}
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "rgba(255,255,255,0.28)", color: "#E8E8EA" }}
//                     onClick={handleReset}
//                   >
//                     Reset
//                   </Button>
//                 </Box>
//               </Box>
//             )}

//             {tab === "list" && (
//               <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
//                 <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
//                   <DarkScrollTable
//                     rows={paged}
//                     columns={columnsForScope}
//                     scope={scope}
//                     onUpdate={openUpdate}
//                     onDownloadZip={handleDownloadZip}
//                   />
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

//       {/* ----- Update Dialog (dark) ----- */}
//       <Dialog
//         open={updOpen}
//         onClose={() => setUpdOpen(false)}
//         fullWidth
//         maxWidth="md"
//         PaperProps={{ sx: { bgcolor: "#1C1C1E", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.14)" } }}
//       >
//         <DialogTitle>Update Issue</DialogTitle>
//         <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
//           <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2, mt: 0.5 }}>
//             <TextField label="Ticket No" value={updTicketNo} size="small" InputProps={{ readOnly: true }} sx={controlSx} />
//             <TextField label="Priority" value={updPriority} size="small" InputProps={{ readOnly: true }} sx={controlSx} />
//             <TextField label="Requester" value={updRequester} size="small" InputProps={{ readOnly: true }} sx={controlSx} />
//             <TextField label="Report To" value={updTarget} size="small" InputProps={{ readOnly: true }} sx={controlSx} />

//             <TextField
//               label="Status"
//               select
//               value={updStatus}
//               onChange={(e) => setUpdStatus(e.target.value as IssueStatus)}
//               size="small"
//               sx={controlSx}
//               SelectProps={darkMenu as any}
//             >
//               {ISSUE_STATUS_OPTIONS.map((s) => (
//                 <MenuItem key={s} value={s}>
//                   {s}
//                 </MenuItem>
//               ))}
//             </TextField>
//             <Box />

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <Typography sx={{ ...LABEL_SX, mb: 0.75 }}>Categories</Typography>
//               <Stack direction="row" spacing={1} flexWrap="wrap">
//                 {updCategories.length ? (
//                   updCategories.map((n, i) => (
//                     <Chip
//                       key={i}
//                       size="small"
//                       label={n}
//                       sx={{ border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}
//                     />
//                   ))
//                 ) : (
//                   <Typography sx={{ color: "#9ca3af" }}>None</Typography>
//                 )}
//               </Stack>
//             </Box>

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <TextField
//                 label="Description"
//                 value={updDescription}
//                 size="small"
//                 fullWidth
//                 multiline
//                 minRows={3}
//                 sx={controlSx}
//                 InputProps={{ readOnly: true }}
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
//                 sx={controlSx}
//               />
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button onClick={() => setUpdOpen(false)} disabled={updLoading}>
//             Cancel
//           </Button>
//           <Button variant="contained" onClick={submitUpdate} disabled={updLoading} sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}>
//             {updLoading ? "Saving…" : "Update"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </MainLayout>
//   );
// }



//p3//

// // src/pages/Issues/index.tsx
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
//   IconButton,
//   Tooltip,
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";
// import SearchIcon from "@mui/icons-material/Search";
// import DownloadIcon from "@mui/icons-material/Download";
// import MainLayout from "../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../components/TopNav";
// import { api } from "../api/http";

// /* ---------- Shared UI ---------- */
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
//   color: "rgba(255,255,255,0.95)",
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
//   headerPx: 1.25,
//   headerPy: 0.6,
//   font: 13,
//   icon: 16,
//   searchW: 260,
//   paginationH: 36,
// };

// /* ---------- Status options (same approach as Requests) ---------- */
// const ISSUE_STATUS_OPTIONS = [
//   "In Review",
//   "In Progress",
//   "On Hold",
//   "Done",
//   "Cancelled",
// ] as const;

// type IssueStatus = "Submitted" | (typeof ISSUE_STATUS_OPTIONS)[number];

// const FINAL: Set<IssueStatus> = new Set(["Done", "Cancelled"]);

// /* ---------- Types ---------- */
// type IssueRow = {
//   id: number;
//   sr: number;
//   ticketNo: string;
//   user: string;
//   reportTo: string;
//   categories: string[];
//   priority: "P1" | "P2" | "P3";
//   status: IssueStatus;
//   description: string;
//   createdAt: string;

//   // for permissions & downloads
//   targetUserId: string;
//   canUpdate?: boolean;
//   attachmentsCount?: number;
// };

// type Column = {
//   key: keyof IssueRow | "files" | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

// type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
// type Category = { id: number; name: string };

// /* ---------- Helpers ---------- */
// function getStoredUser(): {
//   id?: string;
//   username?: string;
//   name?: string;
//   email?: string;
//   full_name?: string;
// } {
//   try {
//     const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
//     if (!raw) return {};
//     return JSON.parse(raw);
//   } catch {
//     return {};
//   }
// }
// const displayName = (u: BasicUser) => u.full_name || u.username || u.email || "(user)";

// /* ---------- Status chip (dark) ---------- */
// function StatusChip({ value }: { value: IssueStatus }) {
//   const map: Record<IssueStatus, { bg: string; fg: string }> = {
//     Submitted: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
//     "In Review": { bg: "rgba(124,87,242,0.22)", fg: "#c7b8ff" },
//     "In Progress": { bg: "rgba(234,179,8,0.18)", fg: "#fde68a" },
//     "On Hold": { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//     Done: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
//     Cancelled: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//   };
//   const { bg, fg } = map[value] || map.Submitted;
//   return (
//     <Box
//       sx={{
//         display: "inline-flex",
//         px: 1,
//         py: 0.25,
//         borderRadius: 1,
//         bgcolor: bg,
//         color: fg,
//         fontSize: 12,
//         fontWeight: 700,
//         whiteSpace: "nowrap",
//       }}
//     >
//       {value}
//     </Box>
//   );
// }

// /* ---------- Table columns ---------- */
// const COLUMNS: Column[] = [
//   { key: "ticketNo", label: "Ticket No", width: 120, align: "center" },
//   { key: "user", label: "User", width: 180, align: "left" },
//   { key: "reportTo", label: "Report To", width: 180, align: "left" },
//   { key: "categories", label: "Category", width: 220, align: "left" },
//   { key: "priority", label: "Priority", width: 80, align: "center" },
//   { key: "status", label: "Status", width: 140, align: "center" },
//   { key: "createdAt", label: "Created At", width: 180, align: "center" },
//   { key: "files", label: "Files", width: 100, align: "center" },
//   { key: "action", label: "Action", width: 120, align: "center" },
// ];

// /* ---------- Table (dark scroll) ---------- */
// function DarkScrollTable({
//   rows,
//   columns,
//   scope,
//   onUpdate,
//   onDownloadZip,
// }: {
//   rows: IssueRow[];
//   columns: Column[];
//   scope: "inbox" | "sent";
//   onUpdate: (row: IssueRow) => void;
//   onDownloadZip: (row: IssueRow) => void;
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
//                 const canUpdate = scope === "inbox" && !FINAL.has(r.status);
//                 return (
//                   <Box
//                     key={`action-${idx}`}
//                     sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}
//                   >
//                     {canUpdate ? (
//                       <Button
//                         size="small"
//                         variant="contained"
//                         sx={{
//                           textTransform: "none",
//                           fontWeight: 700,
//                           fontSize: 12,
//                           px: 1.25,
//                           bgcolor: PRIMARY,
//                           "&:hover": { bgcolor: "#6b48ea" },
//                         }}
//                         onClick={() => onUpdate(r)}
//                       >
//                         Update
//                       </Button>
//                     ) : (
//                       <Box sx={{ fontSize: 12, color: "#999" }}>—</Box>
//                     )}
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

//               if (c.key === "files") {
//                 return (
//                   <Box
//                     key={`files-${idx}`}
//                     sx={{ px: 1.25, py: 0.6, display: "flex", alignItems: "center", justifyContent: "center" }}
//                   >
//                     <Tooltip title="Download all attachments">
//                       <span>
//                         <IconButton size="small" onClick={() => onDownloadZip(r)} sx={{ color: "#ddd" }}>
//                           <DownloadIcon fontSize="small" />
//                         </IconButton>
//                       </span>
//                     </Tooltip>
//                   </Box>
//                 );
//               }

//               if (c.key === "categories") {
//                 return (
//                   <Box
//                     key={`cats-${idx}`}
//                     sx={{
//                       px: 1.25,
//                       py: 1,
//                       fontSize: 13,
//                       color: "#EAEAEA",
//                       textAlign: c.align ?? "left",
//                       whiteSpace: "nowrap",
//                     }}
//                   >
//                     {r.categories.join(", ")}
//                   </Box>
//                 );
//               }

//               const val = r[c.key as keyof IssueRow] as any;
//               return (
//                 <Box
//                   key={String(c.key)}
//                   sx={{
//                     px: 1.25,
//                     py: 1,
//                     fontSize: 13,
//                     color: "#EAEAEA",
//                     textAlign: c.align ?? "center",
//                     whiteSpace: "nowrap",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                   }}
//                 >
//                   {val || "-"}
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}

//         {rows.length === 0 && (
//           <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No issues yet.</Box>
//         )}
//       </Box>
//     </Box>
//   );
// }

// /* ---------- Page ---------- */
// export default function IssuesPage() {
//   const [tab, setTab] = React.useState<"new" | "list">("new");
//   const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");

//   // list state
//   const [rows, setRows] = React.useState<IssueRow[]>([]);
//   const [search, setSearch] = React.useState("");
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(10);
//   const [loadingList, setLoadingList] = React.useState(false);

//   // me
//   const me = getStoredUser();
//   const meId = String((me as any)?.id || "");
//   const meName = me?.name || (me as any)?.full_name || me?.username || me?.email || "User";

//   // form state (create)
//   const [ticketNo, setTicketNo] = React.useState<string>("Auto");
//   const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
//   const [reportToId, setReportToId] = React.useState<string>("");
//   const [categories, setCategories] = React.useState<number[]>([]);
//   const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
//   const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
//   const [details, setDetails] = React.useState("");
//   const [files, setFiles] = React.useState<File[]>([]);
//   const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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
//   const [updStatus, setUpdStatus] = React.useState<IssueStatus>("Submitted");
//   const [updDescription, setUpdDescription] = React.useState("");
//   const [updRemarks, setUpdRemarks] = React.useState("");

//   /* -------- fetch recipients + categories -------- */
//   React.useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         const j = await api.get<any>("/api/users");
//         const arr: BasicUser[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
//         const filtered = meId ? arr.filter((u) => String(u.id) !== meId) : arr;
//         if (!cancelled) {
//           setRecipients(filtered);
//           if (!reportToId && filtered.length) setReportToId(String(filtered[0].id));
//         }
//       } catch {
//         if (!cancelled) setRecipients([]);
//       }
//     })();

//     (async () => {
//       try {
//         const j = await api.get<any>("/api/categories");
//         const arr: Category[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
//         if (!cancelled) setCategoryOpts(arr);
//       } catch {
//         if (!cancelled) setCategoryOpts([]);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [meId, reportToId]);

//   /* -------- list fetch -------- */
//   const fetchList = React.useCallback(
//     async (pageNum: number, pageSize: number) => {
//       if (tab !== "list") return;
//       setLoadingList(true);
//       try {
//         const p = pageNum + 1; // API is 1-based
//         const j = await api.get<any>("/api/tickets", {
//           params: { type: "issue", scope, q: search || undefined, page: p, size: pageSize },
//         });

//         const arr: any[] = Array.isArray(j?.rows) ? j.rows : Array.isArray(j) ? j : [];
//         const mapped: IssueRow[] = arr.map((x: any, idx: number) => {
//           const status = String(x.status ?? "Submitted") as IssueStatus;
//           const targetId = String(x.target_user_id ?? "");

//           const canUpdate =
//             scope === "inbox" && !!meId && meId === targetId && !FINAL.has(status);

//           return {
//             id: Number(x.id),
//             sr: pageNum * pageSize + idx + 1,
//             ticketNo: String(x.ticket_no ?? ""),
//             user: String(x.requester_name ?? ""),
//             reportTo: String(x.target_name ?? ""),
//             categories: String(x.categories ?? "")
//               .split(",")
//               .map((s) => s.trim())
//               .filter(Boolean),
//             priority: (String(x.priority ?? "P2") as "P1" | "P2" | "P3"),
//             status,
//             description: String(x.description ?? ""),
//             createdAt: new Date(x.created_at ?? Date.now()).toLocaleString(),
//             targetUserId: targetId,
//             canUpdate,
//           };
//         });

//         setRows(mapped);
//       } catch (e) {
//         console.error("issues list fetch failed", e);
//         setRows([]);
//       } finally {
//         setLoadingList(false);
//       }
//     },
//     [scope, search, tab, meId]
//   );

//   React.useEffect(() => {
//     fetchList(page, rowsPerPage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tab, scope]);

//   React.useEffect(() => {
//     if (tab === "list") fetchList(page, rowsPerPage);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page, rowsPerPage, search]);

//   /* -------- file pick/reset -------- */
//   const handlePickFiles = () => fileInputRef.current?.click();
//   const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const list = e.target.files ? Array.from(e.target.files) : [];
//     if (!list.length) return;
//     setFiles((prev) => [...prev, ...list]);
//     e.target.value = "";
//   };
//   const removeFileAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

//   /* -------- create Issue (ticket type: issue) -------- */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reportToId) return alert("Please select Report To.");
//     if (!categories.length) return alert("Please select at least one category.");

//     try {
//       setSubmitting(true);
//       // 1) create the ticket
//       const resp = await api.post<any>("/api/tickets", {
//         type: "issue",
//         target_user_id: reportToId,
//         priority,
//         description: details?.trim() || null,
//         categories, // numeric ids
//         title: null,
//       });

//       const ticket_id = resp?.ticket_id ?? resp?.data?.ticket_id;
//       const newTicketNo = resp?.ticket_no ?? resp?.data?.ticket_no ?? "RIN-?";
//       setTicketNo(newTicketNo);

//       // 2) upload attachments (if any)
//       if (ticket_id && files.length) {
//         const form = new FormData();
//         files.forEach((f) => form.append("files", f));
//         // IMPORTANT: absolute path; do NOT set Content-Type manually
//         await fetch(`/api/tickets/${ticket_id}/attachments`, {
//           method: "POST",
//           body: form,
//           credentials: "include",
//         });
//       }

//       // switch to list -> "sent"
//       setTab("list");
//       setScope("sent");
//       setPage(0);
//       fetchList(0, rowsPerPage);

//       // reset the form
//       setCategories([]);
//       setDetails("");
//       setPriority("P2");
//       setFiles([]);
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to submit issue.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleReset = () => {
//     setReportToId(recipients[0]?.id ? String(recipients[0].id) : "");
//     setCategories([]);
//     setPriority("P2");
//     setDetails("");
//     setFiles([]);
//   };

//   /* -------- Update dialog -------- */
//   const openUpdate = async (row: IssueRow) => {
//     try {
//       setUpdOpen(true);
//       setUpdLoading(true);
//       setUpdId(row.id);
//       setUpdTicketNo(row.ticketNo);

//       const j = await api.get<any>(`/api/tickets/${row.id}`);
//       const t = j?.ticket || {};
//       const cats = Array.isArray(j?.categories) ? j.categories : [];

//       setUpdRequester(t.requester_name || row.user);
//       setUpdTarget(t.target_name || row.reportTo);
//       setUpdCategories(cats.map((c: any) => c.name));
//       setUpdPriority((t.priority || row.priority) as any);
//       setUpdStatus((t.status || row.status) as IssueStatus);
//       setUpdDescription(t.description || row.description || "");
//       setUpdRemarks("");
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
//         // priority & description are read-only here
//         status: updStatus,
//         note: updRemarks?.trim() || null,
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

//   /* -------- download all files (ZIP) -------- */
//   const handleDownloadZip = async (row: IssueRow) => {
//     try {
//       const res = await fetch(`/api/tickets/${row.id}/attachments.zip`, {
//         method: "GET",
//         credentials: "include",
//       });
//       if (!res.ok) {
//         const tx = await res.text();
//         throw new Error(tx || `Download failed (${res.status})`);
//       }
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${row.ticketNo}_attachments.zip`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "No attachments found for this ticket.");
//     }
//   };

//   const filtered = rows; // server does filtering via q
//   const paged = React.useMemo(
//     () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
//     [filtered, page, rowsPerPage]
//   );

//   const columnsForScope = React.useMemo(
//     () =>
//       scope === "sent"
//         ? COLUMNS.map((c) => (c.key === "action" ? { ...c, width: 80 } : c)).filter(
//             (c) => c.key !== "action"
//           )
//         : COLUMNS,
//     [scope]
//   );

//   return (
//     <MainLayout title="Issues">
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
//               <ToggleButton value="new">Report Issue</ToggleButton>
//               <ToggleButton value="list">All Issues</ToggleButton>
//             </ToggleButtonGroup>

//             {/* Scope + search on list tab */}
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
//                   <Typography sx={LABEL_SX}>Report Issue Ticket No</Typography>
//                   <TextField value={ticketNo} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>User</Typography>
//                   <TextField value={meName} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>Report To</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select
//                       value={reportToId}
//                       onChange={(e) => setReportToId(String(e.target.value))}
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

//                 {/* Row 2: categories + priority */}
//                 <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
//                   <Typography sx={LABEL_SX}>Report Category</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select<number[]>
//                       multiple
//                       value={categories}
//                       onChange={(e: SelectChangeEvent<number[]>) => {
//                         const v = e.target.value as any;
//                         setCategories(
//                           typeof v === "string" ? v.split(",").map((n: string) => Number(n)) : (v as number[])
//                         );
//                       }}
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

//                 {/* Row 3: details */}
//                 <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
//                   <Typography sx={LABEL_SX}>Issue Additional Info</Typography>
//                   <TextField
//                     value={details}
//                     onChange={(e) => setDetails(e.target.value)}
//                     placeholder="Describe the problem, steps to reproduce, expected vs actual..."
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

//                 {/* Row 4: attachments */}
//                 <Box sx={{ gridColumn: "1 / -1" }}>
//                   <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>Attachments</Typography>
//                   <input ref={fileInputRef} type="file" multiple hidden onChange={onFilesSelected} />
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     onClick={handlePickFiles}
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: 13,
//                       borderColor: "rgba(255,255,255,0.28)",
//                       color: "#E8E8EA",
//                       mb: 1,
//                     }}
//                   >
//                     Select Files
//                   </Button>
//                   <Stack direction="row" spacing={1} flexWrap="wrap">
//                     {files.map((f, idx) => (
//                       <Chip
//                         key={`${f.name}-${idx}`}
//                         label={f.name}
//                         onDelete={() => removeFileAt(idx)}
//                         sx={{
//                           bgcolor: "rgba(255,255,255,0.06)",
//                           color: "#fff",
//                           border: "1px solid rgba(255,255,255,0.18)",
//                         }}
//                       />
//                     ))}
//                   </Stack>
//                 </Box>

//                 {/* Actions */}
//                 <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: 13,
//                       bgcolor: PRIMARY,
//                       "&:hover": { bgcolor: "#6b48ea" },
//                     }}
//                     disabled={!reportToId || !categories.length || submitting}
//                   >
//                     {submitting ? "Submitting…" : "Submit"}
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       fontSize: 13,
//                       borderColor: "rgba(255,255,255,0.28)",
//                       color: "#E8E8EA",
//                     }}
//                     onClick={handleReset}
//                   >
//                     Reset
//                   </Button>
//                 </Box>
//               </Box>
//             )}

//             {tab === "list" && (
//               <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
//                 <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
//                   <DarkScrollTable
//                     rows={paged}
//                     columns={columnsForScope}
//                     scope={scope}
//                     onUpdate={openUpdate}
//                     onDownloadZip={handleDownloadZip}
//                   />
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
//                   "& .MuiTablePagination-toolbar": {
//                     minHeight: UI.paginationH,
//                     p: 0,
//                     pl: 1,
//                     pr: 1,
//                     gap: 0.5,
//                   },
//                   "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
//                     fontSize: UI.font,
//                     m: 0,
//                   },
//                   "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
//                   "& .MuiSelect-select": {
//                     py: 0,
//                     px: 1,
//                     fontSize: UI.font,
//                     height: 30 - 6,
//                     display: "flex",
//                     alignItems: "center",
//                     bgcolor: CONTROL_BG,
//                     borderRadius: 1,
//                   },
//                   "& .MuiIconButton-root": { p: 0.25 },
//                   ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
//                 }}
//               />
//             </Box>
//           )}
//         </Card>
//       </Box>

//       {/* ----- Update Dialog (dark) ----- */}
//       <Dialog
//         open={updOpen}
//         onClose={() => setUpdOpen(false)}
//         fullWidth
//         maxWidth="md"
//         PaperProps={{
//           sx: { bgcolor: "#1C1C1E", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.14)" },
//         }}
//       >
//         <DialogTitle>Update Issue</DialogTitle>
//         <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
//           <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2, mt: 0.5 }}>
//             <TextField label="Ticket No" value={updTicketNo} size="small" InputProps={{ readOnly: true }} sx={controlSx} />
//             <TextField label="Priority" value={updPriority} size="small" InputProps={{ readOnly: true }} sx={controlSx} />
//             <TextField label="Requester" value={updRequester} size="small" InputProps={{ readOnly: true }} sx={controlSx} />
//             <TextField label="Report To" value={updTarget} size="small" InputProps={{ readOnly: true }} sx={controlSx} />

//             <TextField
//               label="Status"
//               select
//               value={updStatus}
//               onChange={(e) => setUpdStatus(e.target.value as IssueStatus)}
//               size="small"
//               sx={controlSx}
//               SelectProps={darkMenu as any}
//             >
//               {ISSUE_STATUS_OPTIONS.map((s) => (
//                 <MenuItem key={s} value={s}>
//                   {s}
//                 </MenuItem>
//               ))}
//             </TextField>
//             <Box />

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <Typography sx={{ ...LABEL_SX, mb: 0.75 }}>Categories</Typography>
//               <Stack direction="row" spacing={1} flexWrap="wrap">
//                 {updCategories.length ? (
//                   updCategories.map((n, i) => (
//                     <Chip
//                       key={i}
//                       size="small"
//                       label={n}
//                       sx={{ border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}
//                     />
//                   ))
//                 ) : (
//                   <Typography sx={{ color: "#9ca3af" }}>None</Typography>
//                 )}
//               </Stack>
//             </Box>

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <TextField
//                 label="Description"
//                 value={updDescription}
//                 size="small"
//                 fullWidth
//                 multiline
//                 minRows={3}
//                 sx={controlSx}
//                 InputProps={{ readOnly: true }}
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
//                 sx={controlSx}
//               />
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button onClick={() => setUpdOpen(false)} disabled={updLoading}>
//             Cancel
//           </Button>
//           <Button
//             variant="contained"
//             onClick={submitUpdate}
//             disabled={updLoading}
//             sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
//           >
//             {updLoading ? "Saving…" : "Update"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </MainLayout>
//   );
// }


//p4

// src/pages/Issues/index.tsx
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
//   IconButton,
//   Tooltip,
// } from "@mui/material";
// import type { SelectChangeEvent } from "@mui/material/Select";
// import SearchIcon from "@mui/icons-material/Search";
// import DownloadIcon from "@mui/icons-material/Download";
// import MainLayout from "../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../components/TopNav";
// import { api } from "../api/http";

// /* ---------- Shared UI ---------- */
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
//   color: "rgba(255,255,255,0.95)",
//   mb: 0.5,
//   lineHeight: 1.2,
// };

// const WHITE_LABEL_PROPS = {
//   sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } },
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
//   headerPx: 1.25,
//   headerPy: 0.6,
//   font: 13,
//   icon: 16,
//   searchW: 260,
//   paginationH: 36,
// };

// /* ---------- Status options (mirror Requests) ---------- */
// const ISSUE_STATUS_OPTIONS = [
//   "In Review",
//   "In Progress",
//   "On Hold",
//   "Done",
//   "Cancelled",
// ] as const;

// type IssueStatus = "Submitted" | (typeof ISSUE_STATUS_OPTIONS)[number];
// const FINAL: Set<IssueStatus> = new Set(["Done", "Cancelled"]);

// /* ---------- Types ---------- */
// type IssueRow = {
//   id: number;
//   sr: number;
//   ticketNo: string;
//   user: string;
//   reportTo: string;
//   categories: string[];
//   priority: "P1" | "P2" | "P3";
//   status: IssueStatus;
//   description: string;
//   remarks?: string;
//   createdAt: string;

//   targetUserId: string;
//   canUpdate?: boolean;
//   attachmentsCount?: number;
// };

// type Column = {
//   key: keyof IssueRow | "files" | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

// type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
// type Category = { id: number; name: string };

// /* ---------- Helpers ---------- */
// function getStoredUser(): {
//   id?: string;
//   username?: string;
//   name?: string;
//   email?: string;
//   full_name?: string;
// } {
//   try {
//     const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
//     if (!raw) return {};
//     return JSON.parse(raw);
//   } catch {
//     return {};
//   }
// }
// const displayName = (u: BasicUser) => u.full_name || u.username || u.email || "(user)";

// function getToken() {
//   const raw =
//     sessionStorage.getItem("token") ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("access_token") ||
//     localStorage.getItem("access_token") ||
//     "";
//   return (raw || "").replace(/^Bearer\s+/i, "");
// }
// function authHeader(): HeadersInit {
//   const t = getToken();
//   return t ? { Authorization: `Bearer ${t}` } : {};
// }

// /* ---------- Status chip ---------- */
// function StatusChip({ value }: { value: IssueStatus }) {
//   const map: Record<IssueStatus, { bg: string; fg: string }> = {
//     Submitted: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
//     "In Review": { bg: "rgba(124,87,242,0.22)", fg: "#c7b8ff" },
//     "In Progress": { bg: "rgba(234,179,8,0.18)", fg: "#fde68a" },
//     "On Hold": { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//     Done: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
//     Cancelled: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
//   };
//   const { bg, fg } = map[value] || map.Submitted;
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
//   { key: "reportTo", label: "Report To", width: 180, align: "left" },
//   { key: "categories", label: "Category", width: 220, align: "left" },
//   { key: "priority", label: "Priority", width: 80, align: "center" },
//   { key: "status", label: "Status", width: 120, align: "center" },
//   { key: "description", label: "Description", width: 320, align: "left" },
//   { key: "remarks", label: "Remarks", width: 240, align: "left" },
//   { key: "createdAt", label: "Created At", width: 180, align: "center" },
//   { key: "files", label: "Files", width: 100, align: "center" },
//   { key: "action", label: "Action", width: 120, align: "center" },
// ];

// /* ---------- Table (dark scroll) ---------- */
// function DarkScrollTable({
//   rows,
//   columns,
//   scope,
//   onUpdate,
//   onDownloadZip,
// }: {
//   rows: IssueRow[];
//   columns: Column[];
//   scope: "inbox" | "sent";
//   onUpdate: (row: IssueRow) => void;
//   onDownloadZip: (row: IssueRow) => void;
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
//                 // keep update visible for non-final statuses
//                 const canUpdate = scope === "inbox" && !FINAL.has(r.status);
//                 return (
//                   <Box key={`action-${idx}`} sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}>
//                     {canUpdate ? (
//                       <Button
//                         size="small"
//                         variant="contained"
//                         sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
//                         onClick={() => onUpdate(r)}
//                       >
//                         Update
//                       </Button>
//                     ) : (
//                       <Box sx={{ fontSize: 12, color: "#999" }}>—</Box>
//                     )}
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

//               if (c.key === "files") {
//                 return (
//                   <Box key={`files-${idx}`} sx={{ px: 1.25, py: 0.6, display: "flex", alignItems: "center", justifyContent: "center" }}>
//                     <Tooltip title="Download all attachments">
//                       <span>
//                         <IconButton size="small" onClick={() => onDownloadZip(r)} sx={{ color: "#ddd" }}>
//                           <DownloadIcon fontSize="small" />
//                         </IconButton>
//                       </span>
//                     </Tooltip>
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

//               const val = r[c.key as keyof IssueRow] as any;
//               return (
//                 <Box key={String(c.key)} sx={{ px: 1.25, py: 1, fontSize: 13, color: "#EAEAEA", textAlign: c.align ?? "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//                   {val || "-"}
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}

//         {rows.length === 0 && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No issues yet.</Box>}
//       </Box>
//     </Box>
//   );
// }

// /* ---------- Page ---------- */
// export default function IssuesPage() {
//   const [tab, setTab] = React.useState<"new" | "list">("new");
//   const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");

//   // list state
//   const [rows, setRows] = React.useState<IssueRow[]>([]);
//   const [search, setSearch] = React.useState("");
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(10);
//   const [loadingList, setLoadingList] = React.useState(false);

//   // me
//   const me = getStoredUser();
//   const meId = String((me as any)?.id || "");
//   const meName = me?.name || (me as any)?.full_name || me?.username || me?.email || "User";

//   // form state (create)
//   const [ticketNo, setTicketNo] = React.useState<string>("Auto");
//   const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
//   const [reportToId, setReportToId] = React.useState<string>("");
//   const [categories, setCategories] = React.useState<number[]>([]);
//   const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
//   const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
//   const [details, setDetails] = React.useState("");
//   const [files, setFiles] = React.useState<File[]>([]);
//   const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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
//   const [updStatus, setUpdStatus] = React.useState<IssueStatus>("Submitted");
//   const [updDescription, setUpdDescription] = React.useState("");
//   const [updRemarks, setUpdRemarks] = React.useState("");

//   /* -------- fetch recipients + categories -------- */
//   React.useEffect(() => {
//     let cancelled = false;

//     (async () => {
//       try {
//         const j = await api.get<any>("/api/users");
//         const arr: BasicUser[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
//         const filtered = meId ? arr.filter((u) => String(u.id) !== meId) : arr;
//         if (!cancelled) {
//           setRecipients(filtered);
//           if (!reportToId && filtered.length) setReportToId(String(filtered[0].id));
//         }
//       } catch {
//         if (!cancelled) setRecipients([]);
//       }
//     })();

//     (async () => {
//       try {
//         const j = await api.get<any>("/api/categories");
//         const arr: Category[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
//         if (!cancelled) setCategoryOpts(arr);
//       } catch {
//         if (!cancelled) setCategoryOpts([]);
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [meId, reportToId]);

//   /* -------- list fetch -------- */
//   const fetchList = React.useCallback(
//     async (pageNum: number, pageSize: number) => {
//       if (tab !== "list") return;
//       setLoadingList(true);
//       try {
//         const p = pageNum + 1; // API is 1-based
//         const j = await api.get<any>("/api/tickets", {
//           params: { type: "issue", scope, q: search || undefined, page: p, size: pageSize },
//         });

//         const arr: any[] = Array.isArray(j?.rows) ? j.rows : Array.isArray(j) ? j : [];
//         const mapped: IssueRow[] = arr.map((x: any, idx: number) => {
//           const status = String(x.status ?? "Submitted") as IssueStatus;
//           const targetId = String(x.target_user_id ?? "");
//           const canUpdate = scope === "inbox" && !FINAL.has(status);

//           return {
//             id: Number(x.id),
//             sr: pageNum * pageSize + idx + 1,
//             ticketNo: String(x.ticket_no ?? ""),
//             user: String(x.requester_name ?? ""),
//             reportTo: String(x.target_name ?? ""),
//             categories: String(x.categories ?? "")
//               .split(",")
//               .map((s) => s.trim())
//               .filter(Boolean),
//             priority: (String(x.priority ?? "P2") as "P1" | "P2" | "P3"),
//             status,
//             description: String(x.description ?? ""),
//             remarks: x.last_note ? String(x.last_note) : "",
//             createdAt: new Date(x.created_at ?? Date.now()).toLocaleString(),
//             targetUserId: targetId,
//             canUpdate,
//           };
//         });

//         setRows(mapped);
//       } catch (e) {
//         console.error("issues list fetch failed", e);
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

//   /* -------- file pick/reset -------- */
//   const handlePickFiles = () => fileInputRef.current?.click();
//   const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const list = e.target.files ? Array.from(e.target.files) : [];
//     if (!list.length) return;
//     setFiles((prev) => [...prev, ...list]);
//     e.target.value = "";
//   };
//   const removeFileAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

//   /* -------- create Issue (ticket type: issue) -------- */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!reportToId) return alert("Please select Report To.");
//     if (!categories.length) return alert("Please select at least one category.");

//     try {
//       setSubmitting(true);
//       // 1) create the ticket
//       const resp = await api.post<any>("/api/tickets", {
//         type: "issue",
//         target_user_id: reportToId,
//         priority,
//         description: details?.trim() || null,
//         categories, // numeric ids
//         title: null,
//       });

//       const ticket_id = resp?.ticket_id ?? resp?.data?.ticket_id;
//       const newTicketNo = resp?.ticket_no ?? resp?.data?.ticket_no ?? "RIN-?";
//       setTicketNo(newTicketNo);

//       // 2) upload attachments (if any)
//       if (ticket_id && files.length) {
//         const form = new FormData();
//         files.forEach((f) => form.append("files", f));
//         await fetch(`/api/tickets/${ticket_id}/attachments`, {
//           method: "POST",
//           body: form,
//           headers: { ...authHeader() }, // <-- include token
//         });
//       }

//       // switch to list -> "sent"
//       setTab("list");
//       setScope("sent");
//       setPage(0);
//       fetchList(0, rowsPerPage);

//       // reset the form
//       setCategories([]);
//       setDetails("");
//       setPriority("P2");
//       setFiles([]);
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to submit issue.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleReset = () => {
//     setReportToId(recipients[0]?.id ? String(recipients[0].id) : "");
//     setCategories([]);
//     setPriority("P2");
//     setDetails("");
//     setFiles([]);
//   };

//   /* -------- Update dialog -------- */
//   const openUpdate = async (row: IssueRow) => {
//     try {
//       setUpdOpen(true);
//       setUpdLoading(true);
//       setUpdId(row.id);
//       setUpdTicketNo(row.ticketNo);

//       const j = await api.get<any>(`/api/tickets/${row.id}`);
//       const t = j?.ticket || {};
//       const cats = Array.isArray(j?.categories) ? j.categories : [];

//       setUpdRequester(t.requester_name || row.user);
//       setUpdTarget(t.target_name || row.reportTo);
//       setUpdCategories(cats.map((c: any) => c.name));
//       setUpdPriority((t.priority || row.priority) as any);
//       setUpdStatus((t.status || row.status) as IssueStatus);
//       setUpdDescription(t.description || row.description || "");
//       setUpdRemarks("");
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
//         status: updStatus,
//         note: updRemarks?.trim() || null,
//       });
//       setUpdOpen(false);
//       // keep button visible afterwards (non-final statuses)
//       fetchList(page, rowsPerPage);
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Update failed");
//     } finally {
//       setUpdLoading(false);
//     }
//   };

//   /* -------- download all files (ZIP) -------- */
//   const handleDownloadZip = async (row: IssueRow) => {
//     try {
//       const res = await fetch(`/api/tickets/${row.id}/attachments.zip`, {
//         method: "GET",
//         headers: { ...authHeader(), Accept: "application/zip" }, // <-- include token
//       });
//       if (!res.ok) {
//         const tx = await res.text();
//         throw new Error(tx || `Download failed (${res.status})`);
//       }
//       const blob = await res.blob();
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `${row.ticketNo}_attachments.zip`;
//       document.body.appendChild(a);
//       a.click();
//       a.remove();
//       URL.revokeObjectURL(url);
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "No attachments found for this ticket.");
//     }
//   };

//   const filtered = rows; // server does filtering via q
//   const paged = React.useMemo(
//     () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
//     [filtered, page, rowsPerPage]
//   );

//   const columnsForScope = React.useMemo(
//     () =>
//       scope === "sent"
//         ? COLUMNS.map((c) => (c.key === "action" ? { ...c, width: 80 } : c)).filter((c) => c.key !== "action")
//         : COLUMNS,
//     [scope]
//   );

//   return (
//     <MainLayout title="Issues">
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
//               <ToggleButton value="new">Report Issue</ToggleButton>
//               <ToggleButton value="list">All Issues</ToggleButton>
//             </ToggleButtonGroup>

//             {/* Scope + search on list tab */}
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
//                   sx={{ width: UI.searchW, ...controlSx, "& .MuiOutlinedInput-root": { pl: 1, height: 30 } }}
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
//                   <Typography sx={LABEL_SX}>Report Issue Ticket No</Typography>
//                   <TextField value={ticketNo} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>User</Typography>
//                   <TextField value={meName} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
//                 </Box>

//                 <Box className="form-item">
//                   <Typography sx={LABEL_SX}>Report To</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select
//                       value={reportToId}
//                       onChange={(e) => setReportToId(String(e.target.value))}
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

//                 {/* Row 2: categories + priority */}
//                 <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
//                   <Typography sx={LABEL_SX}>Report Category</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select<number[]>
//                       multiple
//                       value={categories}
//                       onChange={(e: SelectChangeEvent<number[]>) => {
//                         const v = e.target.value as any;
//                         setCategories(typeof v === "string" ? v.split(",").map((n: string) => Number(n)) : (v as number[]));
//                       }}
//                       displayEmpty
//                       renderValue={(selected) =>
//                         (selected as number[]).length
//                           ? (selected as number[]).map((id) => categoryOpts.find((c) => c.id === id)?.name || String(id)).join(", ")
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
//                     <Select value={priority} onChange={(e) => setPriority(e.target.value as "P1" | "P2" | "P3")} sx={controlSx} MenuProps={darkMenu}>
//                       {["P1", "P2", "P3"].map((p) => (
//                         <MenuItem key={p} value={p}>
//                           {p}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>

//                 {/* Row 3: details */}
//                 <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
//                   <Typography sx={LABEL_SX}>Issue Additional Info</Typography>
//                   <TextField
//                     value={details}
//                     onChange={(e) => setDetails(e.target.value)}
//                     placeholder="Describe the problem, steps to reproduce, expected vs actual..."
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

//                 {/* Row 4: attachments */}
//                 <Box sx={{ gridColumn: "1 / -1" }}>
//                   <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>Attachments</Typography>
//                   <input ref={fileInputRef} type="file" multiple hidden onChange={onFilesSelected} />
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     onClick={handlePickFiles}
//                     sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "rgba(255,255,255,0.28)", color: "#E8E8EA", mb: 1 }}
//                   >
//                     Select Files
//                   </Button>
//                   <Stack direction="row" spacing={1} flexWrap="wrap">
//                     {files.map((f, idx) => (
//                       <Chip
//                         key={`${f.name}-${idx}`}
//                         label={f.name}
//                         onDelete={() => removeFileAt(idx)}
//                         sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}
//                       />
//                     ))}
//                   </Stack>
//                 </Box>

//                 {/* Actions */}
//                 <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
//                   <Button
//                     type="submit"
//                     variant="contained"
//                     sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
//                     disabled={!reportToId || !categories.length || submitting}
//                   >
//                     {submitting ? "Submitting…" : "Submit"}
//                   </Button>
//                   <Button
//                     type="button"
//                     variant="outlined"
//                     sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "rgba(255,255,255,0.28)", color: "#E8E8EA" }}
//                     onClick={handleReset}
//                   >
//                     Reset
//                   </Button>
//                 </Box>
//               </Box>
//             )}

//             {tab === "list" && (
//               <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
//                 <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
//                   <DarkScrollTable rows={paged} columns={columnsForScope} scope={scope} onUpdate={openUpdate} onDownloadZip={handleDownloadZip} />
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

//       {/* ----- Update Dialog (dark) ----- */}
//       <Dialog
//         open={updOpen}
//         onClose={() => setUpdOpen(false)}
//         fullWidth
//         maxWidth="md"
//         PaperProps={{ sx: { bgcolor: "#1C1C1E", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.14)" } }}
//       >
//         <DialogTitle>Update Issue</DialogTitle>
//         <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
//           <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2, mt: 0.5 }}>
//             <TextField label="Ticket No" value={updTicketNo} size="small" InputProps={{ readOnly: true }} InputLabelProps={WHITE_LABEL_PROPS} sx={controlSx} />
//             <TextField label="Priority" value={updPriority} size="small" InputProps={{ readOnly: true }} InputLabelProps={WHITE_LABEL_PROPS} sx={controlSx} />
//             <TextField label="Requester" value={updRequester} size="small" InputProps={{ readOnly: true }} InputLabelProps={WHITE_LABEL_PROPS} sx={controlSx} />
//             <TextField label="Report To" value={updTarget} size="small" InputProps={{ readOnly: true }} InputLabelProps={WHITE_LABEL_PROPS} sx={controlSx} />

//             <TextField
//               label="Status"
//               select
//               value={updStatus}
//               onChange={(e) => setUpdStatus(e.target.value as IssueStatus)}
//               size="small"
//               sx={controlSx}
//               SelectProps={darkMenu as any}
//               InputLabelProps={WHITE_LABEL_PROPS}
//             >
//               {ISSUE_STATUS_OPTIONS.map((s) => (
//                 <MenuItem key={s} value={s}>
//                   {s}
//                 </MenuItem>
//               ))}
//             </TextField>
//             <Box />

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <Typography sx={{ ...LABEL_SX, mb: 0.75 }}>Categories</Typography>
//               <Stack direction="row" spacing={1} flexWrap="wrap">
//                 {updCategories.length ? (
//                   updCategories.map((n, i) => <Chip key={i} size="small" label={n} sx={{ border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }} />)
//                 ) : (
//                   <Typography sx={{ color: "#9ca3af" }}>None</Typography>
//                 )}
//               </Stack>
//             </Box>

//             <Box sx={{ gridColumn: "1 / -1" }}>
//               <TextField
//                 label="Description"
//                 value={updDescription}
//                 size="small"
//                 fullWidth
//                 multiline
//                 minRows={3}
//                 sx={controlSx}
//                 InputProps={{ readOnly: true }}
//                 InputLabelProps={WHITE_LABEL_PROPS}
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
//                 sx={controlSx}
//                 InputLabelProps={WHITE_LABEL_PROPS}
//               />
//             </Box>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ p: 2 }}>
//           <Button onClick={() => setUpdOpen(false)} disabled={updLoading}>
//             Cancel
//           </Button>
//           <Button variant="contained" onClick={submitUpdate} disabled={updLoading} sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}>
//             {updLoading ? "Saving…" : "Update"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </MainLayout>
//   );
// }



//p5/

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
  IconButton,
  Tooltip,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { api } from "../api/http";

/* ---------- Shared UI ---------- */
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
  color: "rgba(255,255,255,0.95)",
  mb: 0.5,
  lineHeight: 1.2,
};

const WHITE_LABEL_PROPS = {
  sx: { color: "#fff", "&.Mui-focused": { color: "#fff" } },
};

const SCROLLER_SX = {
  scrollbarWidth: "thin",
  scrollbarColor: "#3f3f3f transparent",
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
};

const UI = {
  headerPx: 1.25,
  headerPy: 0.6,
  font: 13,
  icon: 16,
  searchW: 260,
  paginationH: 36,
};

/* ---------- Status options (mirror Requests) ---------- */
const ISSUE_STATUS_OPTIONS = [
  "In Review",
  "In Progress",
  "On Hold",
  "Done",
  "Cancelled",
] as const;

type IssueStatus = "Submitted" | (typeof ISSUE_STATUS_OPTIONS)[number];


/* ---------- Types ---------- */
type IssueRow = {
  id: number;
  sr: number;
  ticketNo: string;
  user: string;
  reportTo: string;
  categories: string[];
  priority: "P1" | "P2" | "P3";
  status: IssueStatus;
  description: string;
  remarks?: string;
  createdAt: string;

  targetUserId: string;
  canUpdate?: boolean;
  attachmentsCount?: number;
};

type Column = {
  key: keyof IssueRow | "files" | "action";
  label: string;
  width?: number;
  align?: "left" | "center" | "right";
};

type BasicUser = { id: string; username?: string; full_name?: string; email?: string };
type Category = { id: number; name: string };

/* ---------- Helpers ---------- */
function getStoredUser(): {
  id?: string;
  username?: string;
  name?: string;
  email?: string;
  full_name?: string;
} {
  try {
    const raw = sessionStorage.getItem("user") || localStorage.getItem("user") || "";
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
const displayName = (u: BasicUser) => u.full_name || u.username || u.email || "(user)";

function getToken() {
  const raw =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    "";
  return (raw || "").replace(/^Bearer\s+/i, "");
}
function authHeader(): HeadersInit {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ---------- Status chip ---------- */
function StatusChip({ value }: { value: IssueStatus }) {
  const map: Record<IssueStatus, { bg: string; fg: string }> = {
    Submitted: { bg: "rgba(59,130,246,0.18)", fg: "#93c5fd" },
    "In Review": { bg: "rgba(124,87,242,0.22)", fg: "#c7b8ff" },
    "In Progress": { bg: "rgba(234,179,8,0.18)", fg: "#fde68a" },
    "On Hold": { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
    Done: { bg: "rgba(34,197,94,0.22)", fg: "#86efac" },
    Cancelled: { bg: "rgba(148,163,184,0.18)", fg: "#cbd5e1" },
  };
  const { bg, fg } = map[value] || map.Submitted;
  return (
    <Box sx={{ display: "inline-flex", px: 1, py: 0.25, borderRadius: 1, bgcolor: bg, color: fg, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {value}
    </Box>
  );
}

/* ---------- Table columns ---------- */
const COLUMNS: Column[] = [
  { key: "ticketNo", label: "Ticket No", width: 120, align: "center" },
  { key: "user", label: "User", width: 180, align: "left" },
  { key: "reportTo", label: "Report To", width: 180, align: "left" },
  { key: "categories", label: "Category", width: 220, align: "left" },
  { key: "priority", label: "Priority", width: 80, align: "center" },
  { key: "status", label: "Status", width: 120, align: "center" },
  { key: "description", label: "Description", width: 320, align: "left" },
  { key: "remarks", label: "Remarks", width: 240, align: "left" },
  { key: "createdAt", label: "Created At", width: 180, align: "center" },
  { key: "files", label: "Files", width: 100, align: "center" },
  { key: "action", label: "Action", width: 120, align: "center" },
];

/* ---------- Table (dark scroll) ---------- */
function DarkScrollTable({
  rows,
  columns,
  scope,
  onUpdate,
  onDownloadZip,
}: {
  rows: IssueRow[];
  columns: Column[];
  scope: "inbox" | "sent";
  onUpdate: (row: IssueRow) => void;
  onDownloadZip: (row: IssueRow) => void;
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
                // FIX: keep Update visible for inbox rows regardless of status
                const canUpdate = scope === "inbox"; // <- previously && !FINAL.has(r.status)
                return (
                  <Box key={`action-${idx}`} sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {canUpdate ? (
                      <Button
                        size="small"
                        variant="contained"
                        sx={{ textTransform: "none", fontWeight: 700, fontSize: 12, px: 1.25, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
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

              if (c.key === "files") {
                return (
                  <Box key={`files-${idx}`} sx={{ px: 1.25, py: 0.6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Tooltip title="Download all attachments">
                      <span>
                        <IconButton size="small" onClick={() => onDownloadZip(r)} sx={{ color: "#ddd" }}>
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Box>
                );
              }

              if (c.key === "categories") {
                return (
                  <Box key={`cats-${idx}`} sx={{ px: 1.25, py: 1, fontSize: 13, color: "#EAEAEA", textAlign: c.align ?? "left", whiteSpace: "nowrap" }}>
                    {r.categories.join(", ")}
                  </Box>
                );
              }

              const val = r[c.key as keyof IssueRow] as any;
              return (
                <Box key={String(c.key)} sx={{ px: 1.25, py: 1, fontSize: 13, color: "#EAEAEA", textAlign: c.align ?? "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {val || "-"}
                </Box>
              );
            })}
          </Box>
        ))}

        {rows.length === 0 && <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No issues yet.</Box>}
      </Box>
    </Box>
  );
}

/* ---------- Page ---------- */
export default function IssuesPage() {
  const [tab, setTab] = React.useState<"new" | "list">("new");
  const [scope, setScope] = React.useState<"inbox" | "sent">("inbox");

  // list state
  const [rows, setRows] = React.useState<IssueRow[]>([]);
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [loadingList, setLoadingList] = React.useState(false);

  // me
  const me = getStoredUser();
  const meId = String((me as any)?.id || "");
  const meName = me?.name || (me as any)?.full_name || me?.username || me?.email || "User";

  // form state (create)
  const [ticketNo, setTicketNo] = React.useState<string>("Auto");
  const [recipients, setRecipients] = React.useState<BasicUser[]>([]);
  const [reportToId, setReportToId] = React.useState<string>("");
  const [categories, setCategories] = React.useState<number[]>([]);
  const [categoryOpts, setCategoryOpts] = React.useState<Category[]>([]);
  const [priority, setPriority] = React.useState<"P1" | "P2" | "P3">("P2");
  const [details, setDetails] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
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
  const [updStatus, setUpdStatus] = React.useState<IssueStatus>("Submitted");
  const [updDescription, setUpdDescription] = React.useState("");
  const [updRemarks, setUpdRemarks] = React.useState("");

  /* -------- fetch recipients + categories -------- */
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const j = await api.get<any>("/api/users");
        const arr: BasicUser[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        const filtered = meId ? arr.filter((u) => String(u.id) !== meId) : arr;
        if (!cancelled) {
          setRecipients(filtered);
          if (!reportToId && filtered.length) setReportToId(String(filtered[0].id));
        }
      } catch {
        if (!cancelled) setRecipients([]);
      }
    })();

    (async () => {
      try {
        const j = await api.get<any>("/api/categories");
        const arr: Category[] = Array.isArray(j?.data) ? j.data : Array.isArray(j) ? j : [];
        if (!cancelled) setCategoryOpts(arr);
      } catch {
        if (!cancelled) setCategoryOpts([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [meId, reportToId]);

  /* -------- list fetch -------- */
  const fetchList = React.useCallback(
    async (pageNum: number, pageSize: number) => {
      if (tab !== "list") return;
      setLoadingList(true);
      try {
        const p = pageNum + 1; // API is 1-based
        const j = await api.get<any>("/api/tickets", {
          params: { type: "issue", scope, q: search || undefined, page: p, size: pageSize },
        });

        const arr: any[] = Array.isArray(j?.rows) ? j.rows : Array.isArray(j) ? j : [];
        const mapped: IssueRow[] = arr.map((x: any, idx: number) => {
          const status = String(x.status ?? "Submitted") as IssueStatus;
          const targetId = String(x.target_user_id ?? "");
          // canUpdate now decided at render-time; keep for compatibility
          const canUpdate = scope === "inbox"; // FIX: no final-status restriction

          return {
            id: Number(x.id),
            sr: pageNum * pageSize + idx + 1,
            ticketNo: String(x.ticket_no ?? ""),
            user: String(x.requester_name ?? ""),
            reportTo: String(x.target_name ?? ""),
            categories: String(x.categories ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            priority: (String(x.priority ?? "P2") as "P1" | "P2" | "P3"),
            status,
            description: String(x.description ?? ""),
            remarks: x.last_note ? String(x.last_note) : "",
            createdAt: new Date(x.created_at ?? Date.now()).toLocaleString(),
            targetUserId: targetId,
            canUpdate,
          };
        });

        setRows(mapped);
      } catch (e) {
        console.error("issues list fetch failed", e);
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

  /* -------- file pick/reset -------- */
  const handlePickFiles = () => fileInputRef.current?.click();
  const onFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : [];
    if (!list.length) return;
    setFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  };
  const removeFileAt = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  /* -------- create Issue (ticket type: issue) -------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportToId) return alert("Please select Report To.");
    if (!categories.length) return alert("Please select at least one category.");

    try {
      setSubmitting(true);
      // 1) create the ticket
      const resp = await api.post<any>("/api/tickets", {
        type: "issue",
        target_user_id: reportToId,
        priority,
        description: details?.trim() || null,
        categories, // numeric ids
        title: null,
      });

      const ticket_id = resp?.ticket_id ?? resp?.data?.ticket_id;
      const newTicketNo = resp?.ticket_no ?? resp?.data?.ticket_no ?? "RIN-?";
      setTicketNo(newTicketNo);

      // 2) upload attachments (if any)
      if (ticket_id && files.length) {
        const form = new FormData();
        files.forEach((f) => form.append("files", f));
        await fetch(`/api/tickets/${ticket_id}/attachments`, {
          method: "POST",
          body: form,
          headers: { ...authHeader() }, // <-- include token
        });
      }

      // switch to list -> "sent"
      setTab("list");
      setScope("sent");
      setPage(0);
      fetchList(0, rowsPerPage);

      // reset the form
      setCategories([]);
      setDetails("");
      setPriority("P2");
      setFiles([]);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to submit issue.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setReportToId(recipients[0]?.id ? String(recipients[0].id) : "");
    setCategories([]);
    setPriority("P2");
    setDetails("");
    setFiles([]);
  };

  /* -------- Update dialog -------- */
  const openUpdate = async (row: IssueRow) => {
    try {
      setUpdOpen(true);
      setUpdLoading(true);
      setUpdId(row.id);
      setUpdTicketNo(row.ticketNo);

      const j = await api.get<any>(`/api/tickets/${row.id}`);
      const t = j?.ticket || {};
      const cats = Array.isArray(j?.categories) ? j.categories : [];

      setUpdRequester(t.requester_name || row.user);
      setUpdTarget(t.target_name || row.reportTo);
      setUpdCategories(cats.map((c: any) => c.name));
      setUpdPriority((t.priority || row.priority) as any);
      setUpdStatus((t.status || row.status) as IssueStatus);
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
        status: updStatus,
        note: updRemarks?.trim() || null,
      });
      setUpdOpen(false);
      // keep button visible afterwards
      fetchList(page, rowsPerPage);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Update failed");
    } finally {
      setUpdLoading(false);
    }
  };

  /* -------- download all files (ZIP) -------- */
  const handleDownloadZip = async (row: IssueRow) => {
    try {
      // FIX: call the correct backend route `/attachments/download`
      const res = await fetch(`/api/tickets/${row.id}/attachments/download`, {
        method: "GET",
        headers: { ...authHeader(), Accept: "application/zip" },
      });
      if (!res.ok) {
        const tx = await res.text();
        throw new Error(tx || `Download failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${row.ticketNo}_attachments.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "No attachments found for this ticket.");
    }
  };

  const filtered = rows; // server does filtering via q
  const paged = React.useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const columnsForScope = React.useMemo(
    () =>
      scope === "sent"
        ? COLUMNS.map((c) => (c.key === "action" ? { ...c, width: 80 } : c)).filter((c) => c.key !== "action")
        : COLUMNS,
    [scope]
  );

  return (
    <MainLayout title="Issues">
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
              <ToggleButton value="new">Report Issue</ToggleButton>
              <ToggleButton value="list">All Issues</ToggleButton>
            </ToggleButtonGroup>

            {/* Scope + search on list tab */}
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
                  sx={{ width: UI.searchW, ...controlSx, "& .MuiOutlinedInput-root": { pl: 1, height: 30 } }}
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
                  <Typography sx={LABEL_SX}>Report Issue Ticket No</Typography>
                  <TextField value={ticketNo} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>User</Typography>
                  <TextField value={meName} size="small" sx={controlSx} inputProps={{ readOnly: true }} />
                </Box>

                <Box className="form-item">
                  <Typography sx={LABEL_SX}>Report To</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      value={reportToId}
                      onChange={(e) => setReportToId(String(e.target.value))}
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

                {/* Row 2: categories + priority */}
                <Box className="form-item" sx={{ gridColumn: { xs: "auto", md: "span 2" } }}>
                  <Typography sx={LABEL_SX}>Report Category</Typography>
                  <FormControl fullWidth size="small">
                    <Select<number[]>
                      multiple
                      value={categories}
                      onChange={(e: SelectChangeEvent<number[]>) => {
                        const v = e.target.value as any;
                        setCategories(typeof v === "string" ? v.split(",").map((n: string) => Number(n)) : (v as number[]));
                      }}
                      displayEmpty
                      renderValue={(selected) =>
                        (selected as number[]).length
                          ? (selected as number[]).map((id) => categoryOpts.find((c) => c.id === id)?.name || String(id)).join(", ")
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
                    <Select value={priority} onChange={(e) => setPriority(e.target.value as "P1" | "P2" | "P3")} sx={controlSx} MenuProps={darkMenu}>
                      {["P1", "P2", "P3"].map((p) => (
                        <MenuItem key={p} value={p}>
                          {p}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Row 3: details */}
                <Box className="form-item" sx={{ gridColumn: "1 / -1" }}>
                  <Typography sx={LABEL_SX}>Issue Additional Info</Typography>
                  <TextField
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describe the problem, steps to reproduce, expected vs actual..."
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

                {/* Row 4: attachments */}
                <Box sx={{ gridColumn: "1 / -1" }}>
                  <Typography sx={{ ...LABEL_SX, mb: 0.5 }}>Attachments</Typography>
                  <input ref={fileInputRef} type="file" multiple hidden onChange={onFilesSelected} />
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={handlePickFiles}
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "rgba(255,255,255,0.28)", color: "#E8E8EA", mb: 1 }}
                  >
                    Select Files
                  </Button>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {files.map((f, idx) => (
                      <Chip
                        key={`${f.name}-${idx}`}
                        label={f.name}
                        onDelete={() => removeFileAt(idx)}
                        sx={{ bgcolor: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Actions */}
                <Box sx={{ gridColumn: "1 / -1", display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}
                    disabled={!reportToId || !categories.length || submitting}
                  >
                    {submitting ? "Submitting…" : "Submit"}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    sx={{ textTransform: "none", fontWeight: 700, fontSize: 13, borderColor: "rgba(255,255,255,0.28)", color: "#E8E8EA" }}
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </Box>
              </Box>
            )}

            {tab === "list" && (
              <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
                <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
                  <DarkScrollTable rows={paged} columns={columnsForScope} scope={scope} onUpdate={openUpdate} onDownloadZip={handleDownloadZip} />
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
                  "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: UI.font, m: 0 },
                  "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
                  "& .MuiSelect-select": { py: 0, px: 1, fontSize: UI.font, height: 30 - 6, display: "flex", alignItems: "center", bgcolor: CONTROL_BG, borderRadius: 1 },
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
        PaperProps={{ sx: { bgcolor: "#1C1C1E", color: "#E8E8EA", border: "1px solid rgba(255,255,255,0.14)" } }}
      >
        <DialogTitle>Update Issue</DialogTitle>
        <DialogContent dividers sx={{ borderColor: "rgba(255,255,255,0.12)" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2, mt: 0.5 }}>
            <TextField label="Ticket No" value={updTicketNo} size="small" InputProps={{ readOnly: true }} InputLabelProps={WHITE_LABEL_PROPS} sx={controlSx} />
            <TextField label="Priority" value={updPriority} size="small" InputProps={{ readOnly: true }} InputLabelProps={WHITE_LABEL_PROPS} sx={controlSx} />
            <TextField label="Requester" value={updRequester} size="small" InputProps={{ readOnly: true }} InputLabelProps={WHITE_LABEL_PROPS} sx={controlSx} />
            <TextField label="Report To" value={updTarget} size="small" InputProps={{ readOnly: true }} InputLabelProps={WHITE_LABEL_PROPS} sx={controlSx} />

            <TextField
              label="Status"
              select
              value={updStatus}
              onChange={(e) => setUpdStatus(e.target.value as IssueStatus)}
              size="small"
              sx={controlSx}
              SelectProps={darkMenu as any}
              InputLabelProps={WHITE_LABEL_PROPS}
            >
              {ISSUE_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
            <Box />

            <Box sx={{ gridColumn: "1 / -1" }}>
              <Typography sx={{ ...LABEL_SX, mb: 0.75 }}>Categories</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {updCategories.length ? (
                  updCategories.map((n, i) => <Chip key={i} size="small" label={n} sx={{ border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }} />)
                ) : (
                  <Typography sx={{ color: "#9ca3af" }}>None</Typography>
                )}
              </Stack>
            </Box>

            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                label="Description"
                value={updDescription}
                size="small"
                fullWidth
                multiline
                minRows={3}
                sx={controlSx}
                InputProps={{ readOnly: true }}
                InputLabelProps={WHITE_LABEL_PROPS}
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
                InputLabelProps={WHITE_LABEL_PROPS}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setUpdOpen(false)} disabled={updLoading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={submitUpdate} disabled={updLoading} sx={{ bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b48ea" } }}>
            {updLoading ? "Saving…" : "Update"}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
