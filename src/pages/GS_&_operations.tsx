// import * as React from "react";
// import {
//   Box,
//   Card,
//   Button,
//   Typography,
//   ToggleButtonGroup,
//   ToggleButton,
//   TextField,
//   TablePagination,
//   Divider,
// } from "@mui/material";
// import MainLayout from "../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../components/TopNav";
// import { useNavigate } from "react-router-dom";   // ⬅️ add this
// import { api } from "../api/http";
// import UpdateGroundStationDialog from "../components/UpdateGroundStationDialog";
// import type { GroundStation as GSDialogRow } from "../components/UpdateGroundStationDialog";
// import UpdateSatellitePolarizationDialog from "../components/UpdateSatellitePolarizationDialog";
// import type { SatPolRow as SatPolDialogRow } from "../components/UpdateSatellitePolarizationDialog";
// const GS_API  = "/api/ground-stations";
// const OPS_API = "/api/operations";
// const REQ_API = "/api/operation-requesters";
// const SUP_API = "/api/operation-supporters";
// const POL_API = "/api/polarizations";

// // Shapes from API
// type ApiGS = {
//   id: number;
//   supporting_partner: string;
//   ground_station: string;
//   added_by: string;
// };

// // map API ⇄ UI row
// const apiToUi = (g: ApiGS): GSRow => ({
//   id: g.id,
//   partner: g.supporting_partner,
//   station: g.ground_station,
//   addedBy: g.added_by,
// });

// const uiToApi = (r: { partner: string; station: string; addedBy?: string }) => ({
//   supporting_partner: r.partner,
//   ground_station: r.station,
//   added_by: r.addedBy ?? "Admin",
// });


// // Polarization mapper //

// // --- Polarization API shapes & mappers ---
// type ApiPol = {
//   id: number;
//   satellite_name: string;
//   polarization: string;
// };

// const apiPolToUi = (p: ApiPol): PolRow => ({
//   id: p.id,
//   sat: p.satellite_name,
//   pol: p.polarization,
// });

// const uiToApiPol = (r: { sat: string; pol: string }) => ({
//   satellite_name: r.sat,
//   polarization: r.pol,
// });


// // Operations APis //

// // --- Operations API shapes ---
// type ApiOperation  = { id: number; operation_name: string; added_by: string };
// type ApiRequester  = { id: number; requester_name: string; added_by: string };
// type ApiSupporter  = { id: number; supporter_name: string; added_by: string };




// /* ---------- Shared styling ---------- */
// const CARD_SX = {
//   bgcolor: "#1C1C1E",
//   color: "#E8E8EA",
//   border: "1px solid rgba(255,255,255,0.14)",
//   borderRadius: 2,
//   display: "flex",
//   flexDirection: "column",
// } as const;

// const CONTROL_BG = "#1C1C1E";

// const compactCtrlSx = {
//   bgcolor: CONTROL_BG,
//   borderRadius: 1,
//   color: "#fff",
//   "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
//   "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//     borderColor: "#544f4fff",
//   },
//   "& .MuiOutlinedInput-root": {
//     height: 30,
//     color: "#fff",
//   },
//   "& .MuiInputBase-input": {
//     height: 28,
//     padding: "0 10px",
//     fontSize: 13,
//     lineHeight: 1,
//     color: "#fff",
//   },
// };

// const addBarInputSx = {
//   ...compactCtrlSx,
//   "& .MuiInputBase-input::placeholder": {
//     color: "#b5b7bd",
//     opacity: 1,
//   },
// };

// const toolLabelSx = {
//   fontSize: 12,
//   fontWeight: 700,
//   color: "rgba(255,255,255,0.72)",
//   mr: 0.75,
// };

// const SCROLLER_Y = {
//   overflowY: "auto",
//   overflowX: "hidden",
//   scrollbarWidth: "thin",
//   scrollbarColor: "#3f3f3f transparent",
//   "&::-webkit-scrollbar": { width: 8 },
//   "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
//   "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
//   "&::-webkit-scrollbar-track": { background: "transparent" },
// };

// const COLS = "80px 1.2fr 1.2fr 1fr 120px";      // Stations table
// const POL_COLS = "80px 1.4fr 1.2fr 120px";      // Polarization table
// const PRIMARY = "#7C57F2";

// /* ---------- Types & demo data ---------- */
// type TabKey = "stations" | "operations" | "polarization";

// type GSRow = { id: number; partner: string; station: string; addedBy: string };
// type PolRow = { id: number; sat: string; pol: string };


// /* ---------- Simple list panel (no Update button) ---------- */
// function ListPanel({
//   title,
//   items,
//   targetTab, // 'requesters' | 'operations' | 'supporters'
// }: {
//   title: string;
//   items: string[];
//   targetTab: "requesters" | "operations" | "supporters";
// }) {
//   const navigate = useNavigate();
//   const handleViewAll = () => navigate(`/Operations?tab=${targetTab}`);

//   return (
//     <Box
//       sx={{
//         border: "1px solid rgba(255,255,255,0.14)",
//         borderRadius: 1.25,
//         overflow: "hidden",
//         bgcolor: "#161618",
//         minWidth: 0,
//       }}
//     >
//       <Box
//         sx={{
//           px: 1.25,
//           py: 0.75,
//           borderBottom: "1px solid rgba(255,255,255,0.12)",
//           display: "flex",
//           alignItems: "center",
//           gap: 1,
//         }}
//       >
//         <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{title}</Typography>
//         <Box sx={{ ml: "auto" }}>
//           <Button
//             size="small"
//             onClick={handleViewAll}
//             sx={{
//               color: "#9FB7FF",
//               textTransform: "none",
//               fontWeight: 700,
//               px: 0.5,
//               minWidth: 0,
//             }}
//           >
//             View all &rsaquo;
//           </Button>
//         </Box>
//       </Box>

//       <Box sx={{ p: 1 }}>
//         {items.map((name, i) => (
//           <Box
//             key={name + i}
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               bgcolor: "#1D1D20",
//               border: "1px solid rgba(255,255,255,0.08)",
//               borderRadius: 1,
//               px: 1,
//               py: 1,
//               mb: 1,
//             }}
//           >
//             <Typography sx={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{name}</Typography>
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   );
// }
// /* ---------- Page ---------- */
// export default function Gsoperations() {
//   const [tab, setTab] = React.useState<TabKey>("stations");

//   /* Ground Stations */
//   const [partner, setPartner] = React.useState("");
//   const [gsName, setGsName] = React.useState("");
//   const [rows, setRows] = React.useState<GSRow[]>([]);
//   // const [loading, setLoading] = React.useState(false);
//   const [, setLoading] = React.useState(false);

//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(20);

//   /* Update dialog state - Ground Station */
//   const [editOpen, setEditOpen] = React.useState(false);
//   const [editRow, setEditRow] = React.useState<GSDialogRow | null>(null);

//   /* Operations toolbar + lists */
//   const [opName, setOpName] = React.useState("");
//   const [reqName, setReqName] = React.useState("");
//   const [supName, setSupName] = React.useState("");
//   const [opsList, setOpsList] = React.useState<string[]>([]);
//   const [requesters, setRequesters] = React.useState<string[]>([]);
//   const [supporters, setSupporters] = React.useState<string[]>([]);
//   /* Satellite Polarization */
//   const [satName, setSatName] = React.useState("");
//   const [pol, setPol] = React.useState("");
//   const [polRows, setPolRows] = React.useState<PolRow[]>([]);
//   // const [polLoading, setPolLoading] = React.useState(false);
//   const [, setPolLoading] = React.useState(false);
//   const [polPage, setPolPage] = React.useState(0);
//   const [polRowsPerPage, setPolRowsPerPage] = React.useState(20);

//   /* Update dialog state - Satellite Polarization */
//   const [polEditOpen, setPolEditOpen] = React.useState(false);
//   const [polEditRow, setPolEditRow] = React.useState<SatPolDialogRow | null>(null);

//   // Satellite options for the dialog (unique, sorted)
//   const satOptions = React.useMemo(
//     () => Array.from(new Set(polRows.map((r) => r.sat))).sort(),
//     [polRows]
//   );

//   const handleTab = (_: React.SyntheticEvent, next: TabKey | null) => {
//     if (next) setTab(next);
//   };

//   const clearCurrent = () => {
//     setPartner("");
//     setGsName("");
//     setOpName("");
//     setReqName("");
//     setSupName("");
//     setSatName("");
//     setPol("");
//   };

//   const headerTitle =
//     tab === "stations"
//       ? "Ground Station Details"
//       : tab === "operations"
//       ? "Operation Details"
//       : "Satellite Polarization Details";

//   /* Ground Stations handlers */

// const handleAddStation = async () => {
//   const p = partner.trim();
//   const s = gsName.trim();
//   if (!p || !s) return;

//   try {
//     const payload = uiToApi({ partner: p, station: s, addedBy: "Admin" });
//     const created: ApiGS = await api.post(GS_API, payload);
//     setRows((prev) => [...prev, apiToUi(created)]);
//     setGsName("");
//     // setPartner(""); // uncomment if you want to clear partner too
//     alert("Ground Station added successfully ✅");
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to add Ground Station ❌");
//   }
// };

//   const handleUpdateStation = (r: GSRow) => {
//   setEditRow(r);
//   setEditOpen(true);
// };

// const handleSaveDialog = async (updated: GSDialogRow) => {
//   try {
//     const current = rows.find((r) => r.id === updated.id);
//     const payload = uiToApi({
//       partner: updated.partner,
//       station: updated.station,
//       addedBy: current?.addedBy ?? "Admin",
//     });

//     const data: ApiGS = await api.put(`${GS_API}/${updated.id}`, payload);
//     setRows((prev) => prev.map((r) => (r.id === updated.id ? apiToUi(data) : r)));
//     setEditOpen(false);
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to update ground station");
//   }
// };

// const handleDeleteDialog = async (toDelete: GSDialogRow) => {
//   try {
//     await api.del(`${GS_API}/${toDelete.id}`);
//     setRows((prev) => prev.filter((r) => r.id !== toDelete.id));
//     setEditOpen(false);
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to delete ground station");
//   }
// };

// const handleAddOperation = async () => {
//   const name = opName.trim();
//   if (!name) return;
//   try {
//     const created: ApiOperation = await api.post(OPS_API, {
//       operation_name: name,
//       added_by: "Admin",
//     });
//     setOpsList((cur) => [...cur, created.operation_name]);
//     setOpName("");
//     alert("Operation added ✅");
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to add operation ❌");
//   }
// };


// const handleAddRequester = async () => {
//   const name = reqName.trim();
//   if (!name) return;
//   try {
//     const created: ApiRequester = await api.post(REQ_API, {
//       requester_name: name,
//       added_by: "Admin",
//     });
//     setRequesters((cur) => [...cur, created.requester_name]);
//     setReqName("");
//     alert("Operation requester added ✅");
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to add requester ❌");
//   }
// };



// const handleAddSupporter = async () => {
//   const name = supName.trim();
//   if (!name) return;
//   try {
//     const created: ApiSupporter = await api.post(SUP_API, {
//       supporter_name: name,
//       added_by: "Admin",
//     });
//     setSupporters((cur) => [...cur, created.supporter_name]);
//     setSupName("");
//     alert("Operation supporter added ✅");
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to add supporter ❌");
//   }
// };

//   /* Polarization handlers (table add) */
// const handleAddPol = async () => {
//   const s = satName.trim();
//   const pz = pol.trim();
//   if (!s || !pz) return;

//   try {
//     const payload = uiToApiPol({ sat: s, pol: pz });
//     const created: ApiPol = await api.post(POL_API, payload);
//     setPolRows((cur) => [...cur, apiPolToUi(created)]);
//     setSatName("");
//     setPol("");
//     alert("Satellite polarization added ✅");
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to add polarization ❌");
//   }
// };

//   // ---- Modal wiring for polarization ----
//   const handleUpdatePol = (row: PolRow) => {
//     const pols = row.pol
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean);
//     setPolEditRow({ id: row.id, sat: row.sat, pols });
//     setPolEditOpen(true);
//   };

//   const handleSavePolDialog = async (updated: SatPolDialogRow) => {
//   try {
//     const payload = uiToApiPol({
//       sat: updated.sat,
//       pol: updated.pols.join(", "),
//     });
//     const data: ApiPol = await api.put(`${POL_API}/${updated.id}`, payload);
//     setPolRows((prev) => prev.map((r) => (r.id === updated.id ? apiPolToUi(data) : r)));
//     setPolEditOpen(false);
//     alert("Polarization updated ✅");
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to update polarization ❌");
//   }
// };


// const handleDeletePolDialog = async (toDelete: SatPolDialogRow) => {
//   try {
//     await api.del(`${POL_API}/${toDelete.id}`);
//     setPolRows((prev) => prev.filter((r) => r.id !== toDelete.id));
//     setPolEditOpen(false);
//     alert("Polarization deleted ✅");
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to delete polarization ❌");
//   }
// };

//   const paged = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
//   const pagedPol = polRows.slice(polPage * polRowsPerPage, polPage * polRowsPerPage + polRowsPerPage);

//   const loadStations = React.useCallback(async () => {
//   try {
//     setLoading(true);
//     const json = await api.get<any>(`${GS_API}?limit=1000&sort_by=id&sort_order=asc`);
//     const data: ApiGS[] = json?.data ?? [];
//     setRows(data.map(apiToUi));
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to load ground stations");
//   } finally {
//     setLoading(false);
//   }
// }, []);

// const loadPols = React.useCallback(async () => {
//   try {
//     setPolLoading(true);
//     const json = await api.get<any>(`${POL_API}?limit=1000&sort_by=id&sort_order=asc`);
//     const data: ApiPol[] = json?.data ?? [];
//     setPolRows(data.map(apiPolToUi));
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to load satellite polarizations");
//   } finally {
//     setPolLoading(false);
//   }
// }, []);


// const loadOperations = React.useCallback(async () => {
//   try {
//     const json = await api.get<any>(`${OPS_API}?limit=1000&sort_by=operation_name&sort_order=asc`);
//     const data: ApiOperation[] = json?.data ?? [];
//     setOpsList(data.map((d) => d.operation_name));
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to load operations");
//   }
// }, []);

// // Load Requesters
// const loadRequesters = React.useCallback(async () => {
//   try {
//     const json = await api.get<any>(`${REQ_API}?limit=1000&sort_by=requester_name&sort_order=asc`);
//     const data: ApiRequester[] = json?.data ?? [];
//     setRequesters(data.map((d) => d.requester_name));
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to load requesters");
//   }
// }, []);

// // Load Supporters
// const loadSupporters = React.useCallback(async () => {
//   try {
//     const json = await api.get<any>(`${SUP_API}?limit=1000&sort_by=supporter_name&sort_order=asc`);
//     const data: ApiSupporter[] = json?.data ?? [];
//     setSupporters(data.map((d) => d.supporter_name));
//   } catch (e: any) {
//     console.error(e);
//     alert(e?.message || "Failed to load supporters");
//   }
// }, []);

// React.useEffect(() => {
//   loadStations();
//   loadPols();
//   loadOperations();
//   loadRequesters();
//   loadSupporters();
// }, [loadStations, loadPols, loadOperations, loadRequesters, loadSupporters]);

//   return (
//     <MainLayout title="">
//       <Box
//         sx={{
//           px: 2,
//           py: 1.5,
//           height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
//           display: "grid",
//           gridTemplateRows: "auto 1fr",
//           gap: 1.5,
//         }}
//       >
//         {/* Toggle strip */}
//         <ToggleButtonGroup
//           value={tab}
//           exclusive
//           onChange={handleTab}
//           sx={{
//             p: 0.5,
//             borderRadius: 999,
//             border: "1px solid rgba(255,255,255,0.14)",
//             bgcolor: "#171718",
//             width: "fit-content",
//             "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
//           }}
//         >
//           {[
//             { key: "stations", label: "Ground Stations" },
//             { key: "operations", label: "Operations" },
//             { key: "polarization", label: "Satellite Polarization" },
//           ].map(({ key, label }) => (
//             <ToggleButton
//               key={key}
//               value={key}
//               disableRipple
//               sx={{
//                 textTransform: "none",
//                 fontWeight: 700,
//                 fontSize: 13,
//                 px: 2,
//                 height: 32,
//                 lineHeight: "32px",
//                 borderRadius: 999,
//                 color: "rgba(255,255,255,0.72)",
//                 bgcolor: "transparent",
//                 "&.Mui-selected": {
//                   color: "#7CFF8D",
//                   bgcolor: "#0E0E10",
//                   border: "1px solid rgba(124,255,141,0.18)",
//                 },
//                 "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
//               }}
//             >
//               {label}
//             </ToggleButton>
//           ))}
//         </ToggleButtonGroup>

//         {/* Main card */}
//         <Card sx={{ ...CARD_SX, height: "100%" }}>
//           {/* Header */}
//           <Box
//             sx={{
//               px: 1.25,
//               py: 0.7,
//               borderBottom: "1px solid rgba(255,255,255,0.12)",
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//             }}
//           >
//             <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{headerTitle}</Typography>
//             <Box sx={{ ml: "auto" }}>
//               <Button
//                 size="small"
//                 onClick={clearCurrent}
//                 sx={{ textTransform: "none", fontWeight: 600, color: "#7CA7FF", px: 1 }}
//               >
//                 Clear
//               </Button>
//             </Box>
//           </Box>

//           {/* Body */}
//           <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
//             {/* Ground Stations tab */}
//             {tab === "stations" && (
//               <>
//                 <Box sx={{ p: 1.25, pt: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
//                   <Typography sx={{ fontWeight: 700, fontSize: 14, mr: 1 }}>Add Ground Station</Typography>
//                   <TextField
//                     value={partner}
//                     onChange={(e) => setPartner(e.target.value)}
//                     placeholder="Supporting Partner"
//                     size="small"
//                     sx={{ width: 260, ...addBarInputSx }}
//                   />
//                   <TextField
//                     value={gsName}
//                     onChange={(e) => setGsName(e.target.value)}
//                     placeholder="Ground Station Name"
//                     size="small"
//                     sx={{ width: 320, ...addBarInputSx }}
//                   />
//                   <Button
//                     onClick={handleAddStation}
//                     disabled={!gsName.trim()}
//                     variant="contained"
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       bgcolor: PRIMARY,
//                       "&:hover": { bgcolor: "#6b46f1" },
//                       "&.Mui-disabled": { bgcolor: "#2f2f33", color: "#b5b7bd", boxShadow: "none" },
//                     }}
//                   >
//                     Add
//                   </Button>
//                 </Box>

//                 <Box sx={{ flex: 1, minHeight: 0, px: 1, ...SCROLLER_Y, pb: 1 }}>
//                   <Box
//                     sx={{
//                       position: "sticky",
//                       top: 0,
//                       zIndex: 1,
//                       display: "grid",
//                       gridTemplateColumns: COLS,
//                       bgcolor: "#000",
//                       borderBottom: "1px solid rgba(255,255,255,0.14)",
//                     }}
//                   >
//                     {["Sr No", "Supporting Partner", "Ground Station", "Added By", "Action"].map((label) => (
//                       <Box
//                         key={label}
//                         sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}
//                       >
//                         {label}
//                       </Box>
//                     ))}
//                   </Box>

//                   {paged.map((r, idx) => (
//                     <Box
//                       key={r.id}
//                       sx={{
//                         display: "grid",
//                         gridTemplateColumns: COLS,
//                         alignItems: "center",
//                         borderBottom: "1px solid rgba(255,255,255,0.08)",
//                         bgcolor: (page * rowsPerPage + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//                       }}
//                     >
                                          
//                       <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
//                         {page * rowsPerPage + idx + 1}
//                       </Box>

//                       <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.partner}</Box>
//                       <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.station}</Box>
//                       <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.addedBy}</Box>
//                       <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
//                         <Button
//                           size="small"
//                           variant="contained"
//                           onClick={() => handleUpdateStation(r)}
//                           sx={{
//                             minWidth: 70,
//                             height: 28,
//                             fontSize: 12,
//                             textTransform: "none",
//                             fontWeight: 700,
//                             bgcolor: PRIMARY,
//                             "&:hover": { bgcolor: "#6b46f1" },
//                           }}
//                         >
//                           Update
//                         </Button>
//                       </Box>
//                     </Box>
//                   ))}
//                 </Box>

//                 <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", px: 1, py: 0.75 }}>
//                   <TablePagination
//                     component="div"
//                     count={rows.length}
//                     page={page}
//                     onPageChange={(_, p) => setPage(p)}
//                     rowsPerPage={rowsPerPage}
//                     onRowsPerPageChange={(e) => {
//                       setRowsPerPage(parseInt(e.target.value, 10));
//                       setPage(0);
//                     }}
//                     rowsPerPageOptions={[5, 20, 50]}
//                     sx={{
//                       color: "#E8E8EA",
//                       "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0 },
//                       "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { m: 0, fontSize: 13 },
//                       "& .MuiTablePagination-input": { m: 0, fontSize: 13 },
//                       "& .MuiSelect-select": {
//                         py: 0,
//                         px: 1,
//                         height: 28,
//                         display: "flex",
//                         alignItems: "center",
//                         bgcolor: CONTROL_BG,
//                         borderRadius: 1,
//                       },
//                       "& .MuiIconButton-root": { p: 0.25 },
//                       ".MuiSvgIcon-root": { fontSize: 16, color: "#E8E8EA" },
//                     }}
//                   />
//                 </Box>
//               </>
//             )}

//             {/* Operations tab */}
//             {tab === "operations" && (
//               <>
// <Box
//   sx={{
//     px: 1.25,
//     py: 0.9,
//     borderBottom: "1px solid rgba(255,255,255,0.12)",
//     display: "flex",
//     alignItems: "center",
//     gap: 1.25,
//     flexWrap: "nowrap",
//     overflowX: "auto",
//     "&::-webkit-scrollbar": { height: 6 },
//     "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
//     "&::-webkit-scrollbar-track": { background: "transparent" },
//   }}
// >
                  

//                  {/* 1) Add Operation Requester */}
//   <Typography sx={toolLabelSx}>Add Operation Requester</Typography>
//   <TextField
//     placeholder="Requester name"
//     value={reqName}
//     onChange={(e) => setReqName(e.target.value)}
//     size="small"
//     sx={{ ...addBarInputSx, width: 220 }}
//   />
//   <Button
//     variant="contained"
//     onClick={handleAddRequester}
//     disabled={!reqName.trim()}
//     sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
//   >
//     Add
//   </Button>

//   <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255,255,255,0.12)" }} />

//   {/* 2) Add TTL Service Provider */}
//   <Typography sx={toolLabelSx}>Add TTL Service Provider</Typography>
//   <TextField
//     placeholder="Supporter name"
//     value={supName}
//     onChange={(e) => setSupName(e.target.value)}
//     size="small"
//     sx={{ ...addBarInputSx, width: 220 }}
//   />
//   <Button
//     variant="contained"
//     onClick={handleAddSupporter}
//     disabled={!supName.trim()}
//     sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
//   >
//     Add
//   </Button>

//   <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255,255,255,0.12)" }} />

//   {/* 3) Add Operation */}
//   <Typography sx={toolLabelSx}>Add Operation</Typography>
//   <TextField
//     placeholder="Operation name"
//     value={opName}
//     onChange={(e) => setOpName(e.target.value)}
//     size="small"
//     sx={{ ...addBarInputSx, width: 220 }}
//   />
//   <Button
//     variant="contained"
//     onClick={handleAddOperation}
//     disabled={!opName.trim()}
//     sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
//   >
//     Add
//   </Button>
// </Box>

//                 {/* Three horizontal list sections */}
//                 <Box
//                   sx={{
//                     flex: 1,
//                     minHeight: 0,
//                     p: 1.25,
//                     display: "grid",
//                     gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" },
//                     gap: 1.25,
//                   }}
//                 >
//                   <ListPanel
//   title="Operations Requesters"
//   items={requesters}
//   targetTab="requesters"
// />

// <ListPanel
//   title="TTL Service Provider"
//   items={supporters}
//   targetTab="supporters"
// />

// <ListPanel
//   title="Operations"
//   items={opsList}
//   targetTab="operations"
// />

//                 </Box>
//               </>
//             )}

//             {/* Satellite Polarization tab */}
//             {tab === "polarization" && (
//               <>
//                 {/* Add bar */}
//                 <Box sx={{ p: 1.25, pt: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
//                   <Typography sx={{ fontWeight: 700, fontSize: 14, mr: 1 }}>Add Satellite Polarization</Typography>
//                   <TextField
//                     value={satName}
//                     onChange={(e) => setSatName(e.target.value)}
//                     placeholder="Satellite Name"
//                     size="small"
//                     sx={{ width: 280, ...addBarInputSx }}
//                   />
//                   <TextField
//                     value={pol}
//                     onChange={(e) => setPol(e.target.value)}
//                     placeholder="Polarization"
//                     size="small"
//                     sx={{ width: 220, ...addBarInputSx }}
//                   />
//                   <Button
//                     onClick={handleAddPol}
//                     disabled={!satName.trim() || !pol.trim()}
//                     variant="contained"
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       bgcolor: PRIMARY,
//                       "&:hover": { bgcolor: "#6b46f1" },
//                       "&.Mui-disabled": { bgcolor: "#2f2f33", color: "#b5b7bd", boxShadow: "none" },
//                     }}
//                   >
//                     Add
//                   </Button>
//                 </Box>

//                 {/* Table */}
//                 <Box sx={{ flex: 1, minHeight: 0, px: 1, ...SCROLLER_Y, pb: 1 }}>
//                   <Box
//                     sx={{
//                       position: "sticky",
//                       top: 0,
//                       zIndex: 1,
//                       display: "grid",
//                       gridTemplateColumns: POL_COLS,
//                       bgcolor: "#000",
//                       borderBottom: "1px solid rgba(255,255,255,0.14)",
//                     }}
//                   >
//                     {["Sr No", "Satellite Name", "Polarization", "Action"].map((label) => (
//                       <Box
//                         key={label}
//                         sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}
//                       >
//                         {label}
//                       </Box>
//                     ))}
//                   </Box>

//                   {pagedPol.map((r, idx) => (
//                     <Box
//                       key={r.id}
//                       sx={{
//                         display: "grid",
//                         gridTemplateColumns: POL_COLS,
//                         alignItems: "center",
//                         borderBottom: "1px solid rgba(255,255,255,0.08)",
//                         bgcolor: (polPage * polRowsPerPage + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//                       }}
//                     >
//                       {/* <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.id}</Box> */}
//                       <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
//   {polPage * polRowsPerPage + idx + 1}
// </Box>
//                       <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.sat}</Box>
//                       <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.pol}</Box>
//                       <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
//                         <Button
//                           size="small"
//                           variant="contained"
//                           onClick={() => handleUpdatePol(r)}
//                           sx={{
//                             minWidth: 70,
//                             height: 28,
//                             fontSize: 12,
//                             textTransform: "none",
//                             fontWeight: 700,
//                             bgcolor: PRIMARY,
//                             "&:hover": { bgcolor: "#6b46f1" },
//                           }}
//                         >
//                           Update
//                         </Button>
//                       </Box>
//                     </Box>
//                   ))}
//                 </Box>

//                 {/* Pagination */}
//                 <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", px: 1, py: 0.75 }}>
//                   <TablePagination
//                     component="div"
//                     count={polRows.length}
//                     page={polPage}
//                     onPageChange={(_, p) => setPolPage(p)}
//                     rowsPerPage={polRowsPerPage}
//                     onRowsPerPageChange={(e) => {
//                       setPolRowsPerPage(parseInt(e.target.value, 10));
//                       setPolPage(0);
//                     }}
//                     rowsPerPageOptions={[5, 20, 50]}
//                     sx={{
//                       color: "#E8E8EA",
//                       "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0 },
//                       "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { m: 0, fontSize: 13 },
//                       "& .MuiTablePagination-input": { m: 0, fontSize: 13 },
//                       "& .MuiSelect-select": {
//                         py: 0,
//                         px: 1,
//                         height: 28,
//                         display: "flex",
//                         alignItems: "center",
//                         bgcolor: CONTROL_BG,
//                         borderRadius: 1,
//                       },
//                       "& .MuiIconButton-root": { p: 0.25 },
//                       ".MuiSvgIcon-root": { fontSize: 16, color: "#E8E8EA" },
//                     }}
//                   />
//                 </Box>
//               </>
//             )}
//           </Box>
//         </Card>
//       </Box>

//       {/* Update dialogs */}
//       <UpdateGroundStationDialog
//         open={editOpen}
//         row={editRow}
//         onClose={() => setEditOpen(false)}
//         onSave={handleSaveDialog}
//         onDelete={handleDeleteDialog}
//       />

//       <UpdateSatellitePolarizationDialog
//         open={polEditOpen}
//         row={polEditRow}
//         satOptions={satOptions}
//         onClose={() => setPolEditOpen(false)}
//         onSave={handleSavePolDialog}
//         onDelete={handleDeletePolDialog}
//       />
//     </MainLayout>
//   );
// }



// p2//
// import * as React from "react";
// import {
//   Box,
//   Card,
//   Button,
//   Typography,
//   ToggleButtonGroup,
//   ToggleButton,
//   TextField,
//   TablePagination,
//   Divider,
//   FormControl,
//   MenuItem,
//   Checkbox,
//   ListItemText,
// } from "@mui/material";
// import Select from "@mui/material/Select";
// import type { SelectChangeEvent } from "@mui/material/Select";

// import MainLayout from "../layouts/MainLayout";
// import { TOPBAR_HEIGHT } from "../components/TopNav";
// import { useNavigate } from "react-router-dom";
// import { api } from "../api/http";

// /* Existing dialogs */
// import UpdateGroundStationDialog from "../components/UpdateGroundStationDialog";
// import type { GroundStation as GSDialogRow } from "../components/UpdateGroundStationDialog";
// import UpdateSatellitePolarizationDialog from "../components/UpdateSatellitePolarizationDialog";
// import type { SatPolRow as SatPolDialogRow } from "../components/UpdateSatellitePolarizationDialog";

// /* ---------- API endpoints ---------- */
// const GS_API   = "/api/ground-stations";
// const OPS_API  = "/api/operations";
// const REQ_API  = "/api/operation-requesters";
// const SUP_API  = "/api/operation-supporters";
// const POL_API  = "/api/polarizations";
// const ANT_API  = "/api/antennas";

// /* ---------- Shared card + controls (match Add Satellite) ---------- */
// const CARD_SX = {
//   bgcolor: "#1C1C1E",
//   color: "#E8E8EA",
//   border: "1px solid rgba(255,255,255,0.14)",
//   borderRadius: 2,
//   display: "flex",
//   flexDirection: "column",
// } as const;

// const COLORS = { link: "#7CA7FF", purple: "#7C57F2" };

// const controlSx = {
//   bgcolor: "#232325",
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

// /* ---------- Helpers ---------- */
// const PRIMARY = "#7C57F2";
// const BAND_OPTIONS = ["UHF", "VHF", "L", "S", "C", "X", "Ku", "Ka"];

// /* ---------- Types ---------- */
// type TabKey = "stations" | "operations" | "polarization" | "antennas";

// /* Ground station API shape (accept extra fields if backend already supports them) */
// type ApiGS = {
//   id: number;
//   supporting_partner: string;
//   ground_station: string;
//   added_by?: string;

//   antenna?: string;
//   antenna_type?: string;
//   antenna_name?: string;

//   latitude?: string | number;
//   longitude?: string | number;
//   station_latitude?: string | number;
//   station_longitude?: string | number;
// };

// /* UI rows */
// type GSRow = {
//   id: number;
//   partner: string;
//   station: string;
//   addedBy: string;
//   antenna?: string;
//   lat?: string;
//   lng?: string;
// };

// type PolRow = { id: number; sat: string; pol: string };

// /* Antenna rows */
// type AntBand = { band: string; uplink: string; downlink: string };
// type AntGT = { band: string; gt: string };

// type AntennaRow = {
//   id: number;
//   type: string;
//   size_m: string;
//   eirp_dbw: string;
//   tx_polarization: string;
//   travel_range: string;
//   track_velocity: string;
//   track_acceleration: string;
//   track_modes: string;
//   bands: AntBand[];
//   gts: AntGT[];
// };

// /* ---------- API mappers ---------- */
// const apiGsToUi = (g: ApiGS): GSRow => ({
//   id: g.id,
//   partner: g.supporting_partner,
//   station: g.ground_station,
//   addedBy: g.added_by ?? "Admin",
//   antenna:
//     (g.antenna_name as any) ??
//     (g.antenna_type as any) ??
//     (g.antenna as any) ??
//     "",
//   lat: String(g.station_latitude ?? g.latitude ?? ""),
//   lng: String(g.station_longitude ?? g.longitude ?? ""),
// });

// const apiPolToUi = (p: { id: number; satellite_name: string; polarization: string }): PolRow => ({
//   id: p.id,
//   sat: p.satellite_name,
//   pol: p.polarization,
// });

// /* ---------- Simple “view all” list box used in Operations tab ---------- */
// function ListPanel({
//   title,
//   items,
//   targetTab,
// }: {
//   title: string;
//   items: string[];
//   targetTab: "requesters" | "operations" | "supporters";
// }) {
//   const navigate = useNavigate();
//   const handleViewAll = () => navigate(`/Operations?tab=${targetTab}`);

//   return (
//     <Box
//       sx={{
//         border: "1px solid rgba(255,255,255,0.14)",
//         borderRadius: 1.25,
//         overflow: "hidden",
//         bgcolor: "#161618",
//         minWidth: 0,
//       }}
//     >
//       <Box
//         sx={{
//           px: 1.25,
//           py: 0.75,
//           borderBottom: "1px solid rgba(255,255,255,0.12)",
//           display: "flex",
//           alignItems: "center",
//           gap: 1,
//         }}
//       >
//         <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{title}</Typography>
//         <Box sx={{ ml: "auto" }}>
//           <Button
//             size="small"
//             onClick={handleViewAll}
//             sx={{
//               color: "#9FB7FF",
//               textTransform: "none",
//               fontWeight: 700,
//               px: 0.5,
//               minWidth: 0,
//             }}
//           >
//             View all &rsaquo;
//           </Button>
//         </Box>
//       </Box>

//       <Box sx={{ p: 1 }}>
//         {items.map((name, i) => (
//           <Box
//             key={name + i}
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               bgcolor: "#1D1D20",
//               border: "1px solid rgba(255,255,255,0.08)",
//               borderRadius: 1,
//               px: 1,
//               py: 1,
//               mb: 1,
//             }}
//           >
//             <Typography sx={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{name}</Typography>
//           </Box>
//         ))}
//       </Box>
//     </Box>
//   );
// }

// /* =======================================================
//    Page
// ======================================================= */
// export default function Gsoperations() {
//   const [tab, setTab] = React.useState<TabKey>("stations");
//   const handleTab = (_: React.SyntheticEvent, next: TabKey | null) => {
//     if (next) setTab(next);
//   };

//   /* ---------------- Ground Stations ---------------- */
//   const [gsInner, setGsInner] = React.useState<"add" | "view">("add");

//   // add form
//   const [partner, setPartner] = React.useState("");
//   const [gsName, setGsName] = React.useState("");
//   const [antennaSel, setAntennaSel] = React.useState<string>("");
//   const [lat, setLat] = React.useState("");
//   const [lng, setLng] = React.useState("");

//   const [rows, setRows] = React.useState<GSRow[]>([]);
//   const [page, setPage] = React.useState(0);
//   const [rowsPerPage, setRowsPerPage] = React.useState(20);

//   // dropdown options
//   const [antennaOpts, setAntennaOpts] = React.useState<string[]>([]);

//   // edit dialog (existing)
//   const [editOpen, setEditOpen] = React.useState(false);
//   const [editRow, setEditRow] = React.useState<GSDialogRow | null>(null);

//   /* ---------------- Operations ---------------- */
//   const [opName, setOpName] = React.useState("");
//   const [reqName, setReqName] = React.useState("");
//   const [supName, setSupName] = React.useState("");
//   const [opsList, setOpsList] = React.useState<string[]>([]);
//   const [requesters, setRequesters] = React.useState<string[]>([]);
//   const [supporters, setSupporters] = React.useState<string[]>([]);

//   /* ---------------- Satellite Polarization ---------------- */
//   const [satName, setSatName] = React.useState("");
//   const [pol, setPol] = React.useState("");
//   const [polRows, setPolRows] = React.useState<PolRow[]>([]);
//   const [polPage, setPolPage] = React.useState(0);
//   const [polRowsPerPage, setPolRowsPerPage] = React.useState(20);
//   const [polEditOpen, setPolEditOpen] = React.useState(false);
//   const [polEditRow, setPolEditRow] = React.useState<SatPolDialogRow | null>(null);
//   const satOptions = React.useMemo(
//     () => Array.from(new Set(polRows.map((r) => r.sat))).sort(),
//     [polRows]
//   );

//   /* ---------------- Antennas ---------------- */
//   const [antInner, setAntInner] = React.useState<"add" | "view">("add");

//   // add antenna form
//   const [antType, setAntType] = React.useState("");
//   const [antSize, setAntSize] = React.useState(""); // meters
//   const [antEIRP, setAntEIRP] = React.useState(""); // dBW
//   const [antTxPol, setAntTxPol] = React.useState("");
//   const [antTravelRange, setAntTravelRange] = React.useState("");
//   const [antTrackVel, setAntTrackVel] = React.useState("");
//   const [antTrackAcc, setAntTrackAcc] = React.useState("");
//   const [antTrackModes, setAntTrackModes] = React.useState("");

//   // bands section (like Add License)
//   const [curBand, setCurBand] = React.useState("");
//   const [curUplink, setCurUplink] = React.useState("");
//   const [curDownlink, setCurDownlink] = React.useState("");
//   const [bandRows, setBandRows] = React.useState<AntBand[]>([]);

//   // Receive G/T mini-section
//   const [gtBand, setGtBand] = React.useState("");
//   const [gtVal, setGtVal] = React.useState("");
//   const [gts, setGts] = React.useState<AntGT[]>([]);

//   // antennas table
//   const [antRows, setAntRows] = React.useState<AntennaRow[]>([]);
//   const [antPage, setAntPage] = React.useState(0);
//   const [antRpp, setAntRpp] = React.useState(20);

//   /* ---------------- Shared header actions ---------------- */
//   const clearAll = () => {
//     // ground station
//     setPartner("");
//     setGsName("");
//     setAntennaSel("");
//     setLat("");
//     setLng("");
//     // operations
//     setOpName("");
//     setReqName("");
//     setSupName("");
//     // pol
//     setSatName("");
//     setPol("");
//     // antennas form
//     setAntType("");
//     setAntSize("");
//     setAntEIRP("");
//     setAntTxPol("");
//     setAntTravelRange("");
//     setAntTrackVel("");
//     setAntTrackAcc("");
//     setAntTrackModes("");
//     setCurBand("");
//     setCurUplink("");
//     setCurDownlink("");
//     setBandRows([]);
//     setGtBand("");
//     setGtVal("");
//     setGts([]);
//   };

//   /* =======================================================
//      Loaders
//   ======================================================= */
//   const loadStations = React.useCallback(async () => {
//     try {
//       const json = await api.get<any>(`${GS_API}?limit=1000&sort_by=id&sort_order=asc`);
//       const data: ApiGS[] = json?.data ?? [];
//       setRows(data.map(apiGsToUi));
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to load ground stations");
//     }
//   }, []);

//   const loadPols = React.useCallback(async () => {
//     try {
//       const json = await api.get<any>(`${POL_API}?limit=1000&sort_by=id&sort_order=asc`);
//       const data: any[] = json?.data ?? [];
//       setPolRows(data.map(apiPolToUi));
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to load satellite polarizations");
//     }
//   }, []);

//   const loadOperations = React.useCallback(async () => {
//     try {
//       const json = await api.get<any>(`${OPS_API}?limit=1000&sort_by=operation_name&sort_order=asc`);
//       const data: any[] = json?.data ?? [];
//       setOpsList(data.map((d) => d.operation_name));
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to load operations");
//     }
//   }, []);

//   const loadRequesters = React.useCallback(async () => {
//     try {
//       const json = await api.get<any>(`${REQ_API}?limit=1000&sort_by=requester_name&sort_order=asc`);
//       const data: any[] = json?.data ?? [];
//       setRequesters(data.map((d) => d.requester_name));
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to load requesters");
//     }
//   }, []);

//   const loadSupporters = React.useCallback(async () => {
//     try {
//       const json = await api.get<any>(`${SUP_API}?limit=1000&sort_by=supporter_name&sort_order=asc`);
//       const data: any[] = json?.data ?? [];
//       setSupporters(data.map((d) => d.supporter_name));
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to load supporters");
//     }
//   }, []);

//   const loadAntennas = React.useCallback(async () => {
//     try {
//       const json = await api.get<any>(`${ANT_API}?limit=1000&sort_by=id&sort_order=asc`);
//       const data: any[] = json?.data ?? [];

//       const mapped: AntennaRow[] = data.map((a: any) => ({
//         id: a.id,
//         type: String(a.antenna_type ?? a.type ?? ""),
//         size_m: String(a.size_m ?? a.antenna_size ?? ""),
//         eirp_dbw: String(a.eirp_dbw ?? a.eirp ?? ""),
//         tx_polarization: String(a.tx_polarization ?? a.transmit_polarization ?? ""),
//         travel_range: String(a.travel_range ?? ""),
//         track_velocity: String(a.tracking_velocity ?? a.track_velocity ?? ""),
//         track_acceleration: String(a.tracking_acceleration ?? a.track_acceleration ?? ""),
//         track_modes: String(a.tracking_modes ?? a.track_modes ?? ""),
//         bands: Array.isArray(a.bands) ? a.bands : [],
//         gts: Array.isArray(a.gts) ? a.gts : [],
//       }));

//       setAntRows(mapped);

//       // options for GS ➜ antenna dropdown (take unique types)
//       const names = Array.from(new Set(mapped.map((m) => m.type).filter(Boolean))).sort();
//       setAntennaOpts(names);
//     } catch (e: any) {
//       // No backend yet? Keep UI usable.
//       console.warn("Antennas endpoint not ready:", e?.message || e);
//       setAntRows([]);
//       setAntennaOpts([]);
//     }
//   }, []);

//   React.useEffect(() => {
//     loadStations();
//     loadPols();
//     loadOperations();
//     loadRequesters();
//     loadSupporters();
//     loadAntennas();
//   }, [loadStations, loadPols, loadOperations, loadRequesters, loadSupporters, loadAntennas]);

//   /* =======================================================
//      Ground Stations: actions
//   ======================================================= */
//   const handleAddStation = async () => {
//     const payload: any = {
//       supporting_partner: partner.trim(),
//       ground_station: gsName.trim(),
//       added_by: "Admin",
//     };
//     if (antennaSel) payload.antenna = antennaSel;
//     if (lat) payload.station_latitude = lat;
//     if (lng) payload.station_longitude = lng;

//     if (!payload.supporting_partner || !payload.ground_station) {
//       alert("Please enter Supporting Partner and Ground Station Name.");
//       return;
//     }

//     try {
//       const created: ApiGS = await api.post(GS_API, payload);
//       setRows((prev) => [...prev, apiGsToUi(created)]);
//       setGsName("");
//       // keep partner selected; but clear others
//       setAntennaSel("");
//       setLat("");
//       setLng("");
//       alert("Ground Station added successfully ✅");
//       setGsInner("view");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to add Ground Station ❌");
//     }
//   };

//   const handleUpdateStation = (r: GSRow) => {
//     // existing dialog expects {id, partner, station}
//     setEditRow({ id: r.id, partner: r.partner, station: r.station });
//     setEditOpen(true);
//   };

//   const handleSaveDialog = async (updated: GSDialogRow) => {
//     try {
//       const current = rows.find((r) => r.id === updated.id);
//       const payload = {
//         supporting_partner: updated.partner,
//         ground_station: updated.station,
//         added_by: current?.addedBy ?? "Admin",
//       };
//       const data: ApiGS = await api.put(`${GS_API}/${updated.id}`, payload);
//       setRows((prev) => prev.map((r) => (r.id === updated.id ? apiGsToUi(data) : r)));
//       setEditOpen(false);
//       alert("Ground Station updated ✅");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to update ground station");
//     }
//   };

//   const handleDeleteDialog = async (toDelete: GSDialogRow) => {
//     try {
//       await api.del(`${GS_API}/${toDelete.id}`);
//       setRows((prev) => prev.filter((r) => r.id !== toDelete.id));
//       setEditOpen(false);
//       alert("Ground Station deleted ✅");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to delete ground station");
//     }
//   };

//   /* =======================================================
//      Operations: actions
//   ======================================================= */
//   const handleAddOperation = async () => {
//     const name = opName.trim();
//     if (!name) return;
//     try {
//       const created = await api.post(OPS_API, { operation_name: name, added_by: "Admin" });
//       setOpsList((cur) => [...cur, created.operation_name]);
//       setOpName("");
//       alert("Operation added ✅");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to add operation ❌");
//     }
//   };

//   const handleAddRequester = async () => {
//     const name = reqName.trim();
//     if (!name) return;
//     try {
//       const created = await api.post(REQ_API, { requester_name: name, added_by: "Admin" });
//       setRequesters((cur) => [...cur, created.requester_name]);
//       setReqName("");
//       alert("Operation requester added ✅");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to add requester ❌");
//     }
//   };

//   const handleAddSupporter = async () => {
//     const name = supName.trim();
//     if (!name) return;
//     try {
//       const created = await api.post(SUP_API, { supporter_name: name, added_by: "Admin" });
//       setSupporters((cur) => [...cur, created.supporter_name]);
//       setSupName("");
//       alert("Operation supporter added ✅");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to add supporter ❌");
//     }
//   };

//   /* =======================================================
//      Polarization: actions
//   ======================================================= */
//   const handleAddPol = async () => {
//     const s = satName.trim();
//     const pz = pol.trim();
//     if (!s || !pz) return;

//     try {
//       const created = await api.post(POL_API, { satellite_name: s, polarization: pz });
//       setPolRows((cur) => [...cur, apiPolToUi(created)]);
//       setSatName("");
//       setPol("");
//       alert("Satellite polarization added ✅");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to add polarization ❌");
//     }
//   };

//   const handleUpdatePol = (row: PolRow) => {
//     const pols = row.pol.split(",").map((s) => s.trim()).filter(Boolean);
//     setPolEditRow({ id: row.id, sat: row.sat, pols });
//     setPolEditOpen(true);
//   };

//   const handleSavePolDialog = async (updated: SatPolDialogRow) => {
//     try {
//       const payload = { satellite_name: updated.sat, polarization: updated.pols.join(", ") };
//       const data = await api.put(`${POL_API}/${updated.id}`, payload);
//       setPolRows((prev) => prev.map((r) => (r.id === updated.id ? apiPolToUi(data) : r)));
//       setPolEditOpen(false);
//       alert("Polarization updated ✅");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to update polarization ❌");
//     }
//   };

//   const handleDeletePolDialog = async (toDelete: SatPolDialogRow) => {
//     try {
//       await api.del(`${POL_API}/${toDelete.id}`);
//       setPolRows((prev) => prev.filter((r) => r.id !== toDelete.id));
//       setPolEditOpen(false);
//       alert("Polarization deleted ✅");
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to delete polarization ❌");
//     }
//   };

//   /* =======================================================
//      Antennas: actions
//   ======================================================= */
//   const addBandRow = () => {
//     if (!curBand || !curUplink || !curDownlink) return;
//     setBandRows((b) => [...b, { band: curBand, uplink: curUplink, downlink: curDownlink }]);
//     setCurUplink("");
//     setCurDownlink("");
//   };
//   const clearBands = () => setBandRows([]);

//   const addGT = () => {
//     if (!gtBand || !gtVal) return;
//     setGts((g) => [...g, { band: gtBand, gt: gtVal }]);
//     setGtVal("");
//   };
//   const clearGTs = () => setGts([]);

//   const clearAntennaForm = () => {
//     setAntType("");
//     setAntSize("");
//     setAntEIRP("");
//     setAntTxPol("");
//     setAntTravelRange("");
//     setAntTrackVel("");
//     setAntTrackAcc("");
//     setAntTrackModes("");
//     setCurBand("");
//     setCurUplink("");
//     setCurDownlink("");
//     setBandRows([]);
//     setGtBand("");
//     setGtVal("");
//     setGts([]);
//   };

//   const handleAddAntenna = async () => {
//     if (!antType.trim()) {
//       alert("Please enter Antenna Type.");
//       return;
//     }
//     const payload = {
//       antenna_type: antType.trim(),
//       size_m: antSize.trim(),
//       eirp_dbw: antEIRP.trim(),
//       tx_polarization: antTxPol.trim(),
//       travel_range: antTravelRange.trim(),
//       tracking_velocity: antTrackVel.trim(),
//       tracking_acceleration: antTrackAcc.trim(),
//       tracking_modes: antTrackModes.trim(),
//       bands: bandRows,
//       gts,
//       added_by: "Admin",
//     };

//     try {
//       const created = await api.post(ANT_API, payload);
//       const row: AntennaRow = {
//         id: created.id,
//         type: payload.antenna_type,
//         size_m: payload.size_m,
//         eirp_dbw: payload.eirp_dbw,
//         tx_polarization: payload.tx_polarization,
//         travel_range: payload.travel_range,
//         track_velocity: payload.tracking_velocity,
//         track_acceleration: payload.tracking_acceleration,
//         track_modes: payload.tracking_modes,
//         bands: payload.bands,
//         gts: payload.gts,
//       };
//       setAntRows((prev) => [...prev, row]);
//       clearAntennaForm();
//       alert("Antenna added ✅");
//       setAntInner("view");
//       // Refresh antenna options for GS dropdown
//       setAntennaOpts((prev) =>
//         Array.from(new Set([...prev, row.type].filter(Boolean))).sort()
//       );
//     } catch (e: any) {
//       console.error(e);
//       alert(e?.message || "Failed to add antenna ❌");
//     }
//   };

//   /* =======================================================
//      Derived
//   ======================================================= */
//   const pagedStations = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
//   const pagedPol = polRows.slice(polPage * polRowsPerPage, polPage * polRowsPerPage + polRowsPerPage);
//   const pagedAnts = antRows.slice(antPage * antRpp, antPage * antRpp + antRpp);

//   /* =======================================================
//      Render
//   ======================================================= */
//   return (
//     <MainLayout title="">
//       <Box
//         sx={{
//           px: 2,
//           py: 1.5,
//           height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
//           display: "grid",
//           gridTemplateRows: "auto 1fr",
//           gap: 1.5,
//         }}
//       >
//         {/* Top toggle */}
//         <ToggleButtonGroup
//           value={tab}
//           exclusive
//           onChange={handleTab}
//           sx={{
//             p: 0.5,
//             borderRadius: 999,
//             border: "1px solid rgba(255,255,255,0.14)",
//             bgcolor: "#171718",
//             width: "fit-content",
//             "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
//           }}
//         >
//           {[
//             { key: "stations", label: "Ground Stations" },
//             { key: "operations", label: "Operations" },
//             { key: "polarization", label: "Satellite Polarization" },
//             { key: "antennas", label: "Antennas" },
//           ].map(({ key, label }) => (
//             <ToggleButton
//               key={key}
//               value={key}
//               disableRipple
//               sx={{
//                 textTransform: "none",
//                 fontWeight: 700,
//                 fontSize: 13,
//                 px: 2,
//                 height: 32,
//                 lineHeight: "32px",
//                 borderRadius: 999,
//                 color: "rgba(255,255,255,0.72)",
//                 bgcolor: "transparent",
//                 "&.Mui-selected": {
//                   color: "#7CFF8D",
//                   bgcolor: "#0E0E10",
//                   border: "1px solid rgba(124,255,141,0.18)",
//                 },
//                 "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
//               }}
//             >
//               {label}
//             </ToggleButton>
//           ))}
//         </ToggleButtonGroup>

//         {/* Main card */}
//         <Card sx={{ ...CARD_SX, height: "100%" }}>
//           {/* Header (title varies) */}
//           <Box
//             sx={{
//               px: 1.25,
//               py: 0.7,
//               borderBottom: "1px solid rgba(255,255,255,0.12)",
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//             }}
//           >
//             {/* For stations & antennas we show inner toggle centered; others show title */}
//             {tab === "stations" ? (
//               <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
//                 <ToggleButtonGroup
//                   value={gsInner}
//                   exclusive
//                   onChange={(_, v) => v && setGsInner(v)}
//                   sx={{
//                     p: 0.5,
//                     borderRadius: 999,
//                     border: "1px solid rgba(255,255,255,0.14)",
//                     bgcolor: "#171718",
//                     "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
//                   }}
//                 >
//                   <ToggleButton value="add" disableRipple sx={innerToggleSx}>
//                     Add Ground Station
//                   </ToggleButton>
//                   <ToggleButton value="view" disableRipple sx={innerToggleSx}>
//                     View Ground Stations
//                   </ToggleButton>
//                 </ToggleButtonGroup>
//               </Box>
//             ) : tab === "antennas" ? (
//               <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
//                 <ToggleButtonGroup
//                   value={antInner}
//                   exclusive
//                   onChange={(_, v) => v && setAntInner(v)}
//                   sx={{
//                     p: 0.5,
//                     borderRadius: 999,
//                     border: "1px solid rgba(255,255,255,0.14)",
//                     bgcolor: "#171718",
//                     "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
//                   }}
//                 >
//                   <ToggleButton value="add" disableRipple sx={innerToggleSx}>
//                     Add Antenna
//                   </ToggleButton>
//                   <ToggleButton value="view" disableRipple sx={innerToggleSx}>
//                     View Antennas
//                   </ToggleButton>
//                 </ToggleButtonGroup>
//               </Box>
//             ) : (
//               <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
//                 {tab === "operations" ? "Operation Details" : "Satellite Polarization Details"}
//               </Typography>
//             )}

//             <Box sx={{ ml: "auto" }}>
//               <Button
//                 size="small"
//                 onClick={clearAll}
//                 sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}
//               >
//                 Clear
//               </Button>
//             </Box>
//           </Box>

//           {/* Body */}
//           <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
//             {/* ================= Ground Stations ================= */}
//             {tab === "stations" && (
//               <>
//                 {gsInner === "add" ? (
//                   <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
//                     <Box
//                       sx={{
//                         display: "grid",
//                         gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
//                         columnGap: 2,
//                         rowGap: 2,
//                         "& .form-item": { display: "flex", flexDirection: "column" },
//                       }}
//                     >
//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Supporting Partner</Typography>
//                         <TextField
//                           value={partner}
//                           onChange={(e) => setPartner(e.target.value)}
//                           placeholder="Enter Supporting Partner"
//                           size="small"
//                           sx={controlSx}
//                         />
//                       </Box>

//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Ground Station Name</Typography>
//                         <TextField
//                           value={gsName}
//                           onChange={(e) => setGsName(e.target.value)}
//                           placeholder="Enter Ground Station Name"
//                           size="small"
//                           sx={controlSx}
//                         />
//                       </Box>

//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Antenna</Typography>
//                         <FormControl fullWidth size="small">
//                           <Select
//                             value={antennaSel}
//                             onChange={(e) => setAntennaSel(e.target.value as string)}
//                             displayEmpty
//                             renderValue={(val) => (val ? (val as string) : "Select Antenna")}
//                             sx={controlSx}
//                             MenuProps={darkMenu}
//                           >
//                             <MenuItem disabled value="">
//                               Select Antenna
//                             </MenuItem>
//                             {antennaOpts.map((a) => (
//                               <MenuItem key={a} value={a}>
//                                 <ListItemText primary={a} />
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       </Box>

//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Station Latitude</Typography>
//                         <TextField
//                           value={lat}
//                           onChange={(e) => setLat(e.target.value)}
//                           placeholder="e.g. 12.9716"
//                           size="small"
//                           sx={controlSx}
//                         />
//                       </Box>

//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Station Longitude</Typography>
//                         <TextField
//                           value={lng}
//                           onChange={(e) => setLng(e.target.value)}
//                           placeholder="e.g. 77.5946"
//                           size="small"
//                           sx={controlSx}
//                         />
//                       </Box>
//                     </Box>

//                     <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
//                       <Button
//                         onClick={handleAddStation}
//                         variant="contained"
//                         sx={{
//                           textTransform: "none",
//                           fontWeight: 700,
//                           bgcolor: PRIMARY,
//                           "&:hover": { bgcolor: "#6b46f1" },
//                         }}
//                       >
//                         Add
//                       </Button>
//                     </Box>
//                   </Box>
//                 ) : (
//                   <>
//                     {/* Table */}
//                     <Box sx={{ flex: 1, minHeight: 0, px: 1, pb: 1, ...SCROLLER_SX }}>
//                       <Box
//                         sx={{
//                           position: "sticky",
//                           top: 0,
//                           zIndex: 1,
//                           display: "grid",
//                           gridTemplateColumns:
//                             "80px 1.2fr 1.2fr 1fr 0.9fr 0.9fr 120px",
//                           bgcolor: "#000",
//                           borderBottom: "1px solid rgba(255,255,255,0.14)",
//                         }}
//                       >
//                         {["Sr No", "Supporting Partner", "Ground Station", "Antenna", "Latitude", "Longitude", "Action"].map(
//                           (h) => (
//                             <Box
//                               key={h}
//                               sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}
//                             >
//                               {h}
//                             </Box>
//                           )
//                         )}
//                       </Box>

//                       {pagedStations.map((r, idx) => (
//                         <Box
//                           key={r.id}
//                           sx={{
//                             display: "grid",
//                             gridTemplateColumns:
//                               "80px 1.2fr 1.2fr 1fr 0.9fr 0.9fr 120px",
//                             alignItems: "center",
//                             borderBottom: "1px solid rgba(255,255,255,0.08)",
//                             bgcolor: (page * rowsPerPage + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//                           }}
//                         >
//                           <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
//                             {page * rowsPerPage + idx + 1}
//                           </Box>
//                           <Box sx={cellSx}>{r.partner}</Box>
//                           <Box sx={cellSx}>{r.station}</Box>
//                           <Box sx={cellSx}>{r.antenna || "-"}</Box>
//                           <Box sx={cellSx}>{r.lat || "-"}</Box>
//                           <Box sx={cellSx}>{r.lng || "-"}</Box>
//                           <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
//                             <Button
//                               size="small"
//                               variant="contained"
//                               onClick={() => handleUpdateStation(r)}
//                               sx={{
//                                 minWidth: 70,
//                                 height: 28,
//                                 fontSize: 12,
//                                 textTransform: "none",
//                                 fontWeight: 700,
//                                 bgcolor: PRIMARY,
//                                 "&:hover": { bgcolor: "#6b46f1" },
//                               }}
//                             >
//                               Update
//                             </Button>
//                           </Box>
//                         </Box>
//                       ))}
//                     </Box>

//                     {/* Pagination */}
//                     <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", px: 1, py: 0.75 }}>
//                       <TablePagination
//                         component="div"
//                         count={rows.length}
//                         page={page}
//                         onPageChange={(_, p) => setPage(p)}
//                         rowsPerPage={rowsPerPage}
//                         onRowsPerPageChange={(e) => {
//                           setRowsPerPage(parseInt(e.target.value, 10));
//                           setPage(0);
//                         }}
//                         rowsPerPageOptions={[5, 20, 50]}
//                         sx={paginationSx}
//                       />
//                     </Box>
//                   </>
//                 )}
//               </>
//             )}

//             {/* ================= Operations ================= */}
//             {tab === "operations" && (
//               <>
//                 <Box
//                   sx={{
//                     px: 1.25,
//                     py: 0.9,
//                     borderBottom: "1px solid rgba(255,255,255,0.12)",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 1.25,
//                     flexWrap: "nowrap",
//                     overflowX: "auto",
//                     "&::-webkit-scrollbar": { height: 6 },
//                     "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
//                     "&::-webkit-scrollbar-track": { background: "transparent" },
//                   }}
//                 >
//                   {/* 1) Requester */}
//                   <Typography sx={toolLabelSx}>Add Operation Requester</Typography>
//                   <TextField
//                     placeholder="Requester name"
//                     value={reqName}
//                     onChange={(e) => setReqName(e.target.value)}
//                     size="small"
//                     sx={{ ...controlSx, width: 220 }}
//                   />
//                   <Button
//                     variant="contained"
//                     onClick={handleAddRequester}
//                     disabled={!reqName.trim()}
//                     sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
//                   >
//                     Add
//                   </Button>

//                   <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255,255,255,0.12)" }} />

//                   {/* 2) TTL Service Provider */}
//                   <Typography sx={toolLabelSx}>Add TTL Service Provider</Typography>
//                   <TextField
//                     placeholder="Supporter name"
//                     value={supName}
//                     onChange={(e) => setSupName(e.target.value)}
//                     size="small"
//                     sx={{ ...controlSx, width: 220 }}
//                   />
//                   <Button
//                     variant="contained"
//                     onClick={handleAddSupporter}
//                     disabled={!supName.trim()}
//                     sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
//                   >
//                     Add
//                   </Button>

//                   <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255,255,255,0.12)" }} />

//                   {/* 3) Operation */}
//                   <Typography sx={toolLabelSx}>Add Operation</Typography>
//                   <TextField
//                     placeholder="Operation name"
//                     value={opName}
//                     onChange={(e) => setOpName(e.target.value)}
//                     size="small"
//                     sx={{ ...controlSx, width: 220 }}
//                   />
//                   <Button
//                     variant="contained"
//                     onClick={handleAddOperation}
//                     disabled={!opName.trim()}
//                     sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
//                   >
//                     Add
//                   </Button>
//                 </Box>

//                 <Box
//                   sx={{
//                     flex: 1,
//                     minHeight: 0,
//                     p: 1.25,
//                     display: "grid",
//                     gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" },
//                     gap: 1.25,
//                   }}
//                 >
//                   <ListPanel title="Operations Requesters" items={requesters} targetTab="requesters" />
//                   <ListPanel title="TTL Service Provider" items={supporters} targetTab="supporters" />
//                   <ListPanel title="Operations" items={opsList} targetTab="operations" />
//                 </Box>
//               </>
//             )}

//             {/* ================= Satellite Polarization ================= */}
//             {tab === "polarization" && (
//               <>
//                 <Box sx={{ p: 1.25, pt: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
//                   <Typography sx={{ fontWeight: 700, fontSize: 14, mr: 1 }}>
//                     Add Satellite Polarization
//                   </Typography>
//                   <TextField
//                     value={satName}
//                     onChange={(e) => setSatName(e.target.value)}
//                     placeholder="Satellite Name"
//                     size="small"
//                     sx={{ width: 280, ...controlSx }}
//                   />
//                   <TextField
//                     value={pol}
//                     onChange={(e) => setPol(e.target.value)}
//                     placeholder="Polarization"
//                     size="small"
//                     sx={{ width: 220, ...controlSx }}
//                   />
//                   <Button
//                     onClick={handleAddPol}
//                     disabled={!satName.trim() || !pol.trim()}
//                     variant="contained"
//                     sx={{
//                       textTransform: "none",
//                       fontWeight: 700,
//                       bgcolor: PRIMARY,
//                       "&:hover": { bgcolor: "#6b46f1" },
//                       "&.Mui-disabled": { bgcolor: "#2f2f33", color: "#b5b7bd", boxShadow: "none" },
//                     }}
//                   >
//                     Add
//                   </Button>
//                 </Box>

//                 <Box sx={{ flex: 1, minHeight: 0, px: 1, ...SCROLLER_SX, pb: 1 }}>
//                   <Box
//                     sx={{
//                       position: "sticky",
//                       top: 0,
//                       zIndex: 1,
//                       display: "grid",
//                       gridTemplateColumns: "80px 1.4fr 1.2fr 120px",
//                       bgcolor: "#000",
//                       borderBottom: "1px solid rgba(255,255,255,0.14)",
//                     }}
//                   >
//                     {["Sr No", "Satellite Name", "Polarization", "Action"].map((label) => (
//                       <Box key={label} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
//                         {label}
//                       </Box>
//                     ))}
//                   </Box>

//                   {pagedPol.map((r, idx) => (
//                     <Box
//                       key={r.id}
//                       sx={{
//                         display: "grid",
//                         gridTemplateColumns: "80px 1.4fr 1.2fr 120px",
//                         alignItems: "center",
//                         borderBottom: "1px solid rgba(255,255,255,0.08)",
//                         bgcolor: (polPage * polRowsPerPage + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//                       }}
//                     >
//                       <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
//                         {polPage * polRowsPerPage + idx + 1}
//                       </Box>
//                       <Box sx={cellSx}>{r.sat}</Box>
//                       <Box sx={cellSx}>{r.pol}</Box>
//                       <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
//                         <Button
//                           size="small"
//                           variant="contained"
//                           onClick={() => handleUpdatePol(r)}
//                           sx={{
//                             minWidth: 70,
//                             height: 28,
//                             fontSize: 12,
//                             textTransform: "none",
//                             fontWeight: 700,
//                             bgcolor: PRIMARY,
//                             "&:hover": { bgcolor: "#6b46f1" },
//                           }}
//                         >
//                           Update
//                         </Button>
//                       </Box>
//                     </Box>
//                   ))}
//                 </Box>

//                 <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", px: 1, py: 0.75 }}>
//                   <TablePagination
//                     component="div"
//                     count={polRows.length}
//                     page={polPage}
//                     onPageChange={(_, p) => setPolPage(p)}
//                     rowsPerPage={polRowsPerPage}
//                     onRowsPerPageChange={(e) => {
//                       setPolRowsPerPage(parseInt(e.target.value, 10));
//                       setPolPage(0);
//                     }}
//                     rowsPerPageOptions={[5, 20, 50]}
//                     sx={paginationSx}
//                   />
//                 </Box>
//               </>
//             )}

//             {/* ================= Antennas ================= */}
//             {tab === "antennas" && (
//               <>
//                 {antInner === "add" ? (
//                   <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
//                     <Box
//                       sx={{
//                         display: "grid",
//                         gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
//                         columnGap: 2,
//                         rowGap: 2,
//                         "& .form-item": { display: "flex", flexDirection: "column" },
//                       }}
//                     >
//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Antenna Type *</Typography>
//                         <TextField value={antType} onChange={(e) => setAntType(e.target.value)} placeholder="Enter type" size="small" sx={controlSx} />
//                       </Box>
//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Antenna Size (m)</Typography>
//                         <TextField value={antSize} onChange={(e) => setAntSize(e.target.value)} placeholder="e.g. 3.7" size="small" sx={controlSx} />
//                       </Box>
//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>EIRP (dBW)</Typography>
//                         <TextField value={antEIRP} onChange={(e) => setAntEIRP(e.target.value)} placeholder="e.g. 52.5" size="small" sx={controlSx} />
//                       </Box>

//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Transmit Polarization</Typography>
//                         <TextField value={antTxPol} onChange={(e) => setAntTxPol(e.target.value)} placeholder="e.g. RHCP / LHCP / Linear" size="small" sx={controlSx} />
//                       </Box>
//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Antenna Travel Range</Typography>
//                         <TextField value={antTravelRange} onChange={(e) => setAntTravelRange(e.target.value)} placeholder="e.g. Az: ±180°, El: 0–90°" size="small" sx={controlSx} />
//                       </Box>
//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Tracking Velocity</Typography>
//                         <TextField value={antTrackVel} onChange={(e) => setAntTrackVel(e.target.value)} placeholder="e.g. 20°/s" size="small" sx={controlSx} />
//                       </Box>

//                       <Box className="form-item">
//                         <Typography sx={LABEL_SX}>Tracking Acceleration</Typography>
//                         <TextField value={antTrackAcc} onChange={(e) => setAntTrackAcc(e.target.value)} placeholder="e.g. 100°/s²" size="small" sx={controlSx} />
//                       </Box>
//                       <Box className="form-item" sx={{ gridColumn: { md: "span 2" } }}>
//                         <Typography sx={LABEL_SX}>Tracking Modes</Typography>
//                         <TextField value={antTrackModes} onChange={(e) => setAntTrackModes(e.target.value)} placeholder="e.g. Program, TLE, Step-track" size="small" sx={controlSx} />
//                       </Box>
//                     </Box>

//                     {/* Bands (like Add License) */}
//                     <Box sx={{ mt: 2, p: 1.25, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 1 }}>
//                       <Typography sx={{ fontWeight: 700, mb: 1 }}>Bands</Typography>
//                       <Box
//                         sx={{
//                           display: "grid",
//                           gridTemplateColumns: { xs: "1fr", md: "200px 1fr 1fr auto auto" },
//                           gap: 1,
//                           alignItems: "center",
//                         }}
//                       >
//                         <FormControl size="small" sx={{ minWidth: 180 }}>
//                           <Select
//                             value={curBand}
//                             onChange={(e) => setCurBand(e.target.value as string)}
//                             displayEmpty
//                             renderValue={(v) => (v ? (v as string) : "Select Band")}
//                             sx={controlSx}
//                             MenuProps={darkMenu}
//                           >
//                             <MenuItem disabled value="">Select Band</MenuItem>
//                             {BAND_OPTIONS.map((b) => (
//                               <MenuItem key={b} value={b}>
//                                 <ListItemText primary={b} />
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                         <TextField value={curUplink} onChange={(e) => setCurUplink(e.target.value)} placeholder="Enter Uplink" size="small" sx={controlSx} />
//                         <TextField value={curDownlink} onChange={(e) => setCurDownlink(e.target.value)} placeholder="Enter Downlink" size="small" sx={controlSx} />
//                         <Button variant="outlined" onClick={clearBands} sx={{ textTransform: "none", height: 32, borderColor: "#666", color: "#bbb" }}>
//                           Clear
//                         </Button>
//                         <Button variant="contained" onClick={addBandRow} sx={{ textTransform: "none", height: 32, bgcolor: "#e03f3f", "&:hover": { bgcolor: "#cc3535" } }}>
//                           Add
//                         </Button>
//                       </Box>

//                       {/* list */}
//                       <Box sx={{ mt: 1 }}>
//                         {bandRows.map((b, i) => (
//                           <Box
//                             key={`${b.band}-${i}`}
//                             sx={{
//                               display: "grid",
//                               gridTemplateColumns: { xs: "repeat(3,1fr)", md: "200px 1fr 1fr" },
//                               gap: 1,
//                               bgcolor: "#1d1d20",
//                               border: "1px solid rgba(255,255,255,0.08)",
//                               borderRadius: 1,
//                               p: 1,
//                               mb: 1,
//                             }}
//                           >
//                             <Box sx={{ fontSize: 13 }}><b>Band:</b> {b.band}</Box>
//                             <Box sx={{ fontSize: 13 }}><b>Uplink:</b> {b.uplink}</Box>
//                             <Box sx={{ fontSize: 13 }}><b>Downlink:</b> {b.downlink}</Box>
//                           </Box>
//                         ))}
//                         {!bandRows.length && <Typography sx={{ color: "#9aa", fontSize: 13, mt: 0.5 }}>No bands added.</Typography>}
//                       </Box>
//                     </Box>

//                     {/* Receive G/T */}
//                     <Box sx={{ mt: 2, p: 1.25, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 1 }}>
//                       <Typography sx={{ fontWeight: 700, mb: 1 }}>Receive G/T</Typography>
//                       <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "200px 1fr auto auto" }, gap: 1, alignItems: "center" }}>
//                         <FormControl size="small" sx={{ minWidth: 180 }}>
//                           <Select
//                             value={gtBand}
//                             onChange={(e) => setGtBand(e.target.value as string)}
//                             displayEmpty
//                             renderValue={(v) => (v ? (v as string) : "Select Band")}
//                             sx={controlSx}
//                             MenuProps={darkMenu}
//                           >
//                             <MenuItem disabled value="">Select Band</MenuItem>
//                             {BAND_OPTIONS.map((b) => (
//                               <MenuItem key={b} value={b}>
//                                 <ListItemText primary={b} />
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                         <TextField value={gtVal} onChange={(e) => setGtVal(e.target.value)} placeholder="Enter G/T" size="small" sx={controlSx} />
//                         <Button variant="outlined" onClick={clearGTs} sx={{ textTransform: "none", height: 32, borderColor: "#666", color: "#bbb" }}>
//                           Clear
//                         </Button>
//                         <Button variant="contained" onClick={addGT} sx={{ textTransform: "none", height: 32, bgcolor: "#e03f3f", "&:hover": { bgcolor: "#cc3535" } }}>
//                           Add
//                         </Button>
//                       </Box>

//                       <Box sx={{ mt: 1 }}>
//                         {gts.map((g, i) => (
//                           <Box
//                             key={`${g.band}-${i}`}
//                             sx={{
//                               display: "grid",
//                               gridTemplateColumns: { xs: "repeat(2,1fr)", md: "200px 1fr" },
//                               gap: 1,
//                               bgcolor: "#1d1d20",
//                               border: "1px solid rgba(255,255,255,0.08)",
//                               borderRadius: 1,
//                               p: 1,
//                               mb: 1,
//                             }}
//                           >
//                             <Box sx={{ fontSize: 13 }}><b>Band:</b> {g.band}</Box>
//                             <Box sx={{ fontSize: 13 }}><b>G/T:</b> {g.gt}</Box>
//                           </Box>
//                         ))}
//                         {!gts.length && <Typography sx={{ color: "#9aa", fontSize: 13, mt: 0.5 }}>No G/T rows added.</Typography>}
//                       </Box>
//                     </Box>

//                     {/* Save */}
//                     <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
//                       <Button
//                         variant="contained"
//                         onClick={handleAddAntenna}
//                         sx={{
//                           textTransform: "none",
//                           fontWeight: 700,
//                           bgcolor: COLORS.purple,
//                           "&:hover": { bgcolor: "#6b46f1" },
//                         }}
//                       >
//                         Add
//                       </Button>
//                     </Box>
//                   </Box>
//                 ) : (
//                   <>
//                     {/* Antennas table */}
//                     <Box sx={{ flex: 1, minHeight: 0, px: 1, pb: 1, ...SCROLLER_SX }}>
//                       <Box
//                         sx={{
//                           position: "sticky",
//                           top: 0,
//                           zIndex: 1,
//                           display: "grid",
//                           gridTemplateColumns:
//                             "70px 1.1fr 0.9fr 0.9fr 1fr 1fr 0.9fr 0.9fr 1.1fr 1.6fr 120px",
//                           bgcolor: "#000",
//                           borderBottom: "1px solid rgba(255,255,255,0.14)",
//                         }}
//                       >
//                         {[
//                           "No",
//                           "Type",
//                           "Size (m)",
//                           "EIRP (dBW)",
//                           "Tx Pol",
//                           "Travel Range",
//                           "Track Vel",
//                           "Track Acc",
//                           "Track Modes",
//                           "Bands / G/T",
//                           "Action",
//                         ].map((h) => (
//                           <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
//                             {h}
//                           </Box>
//                         ))}
//                       </Box>

//                       {pagedAnts.map((a, idx) => (
//                         <Box
//                           key={a.id}
//                           sx={{
//                             display: "grid",
//                             gridTemplateColumns:
//                               "70px 1.1fr 0.9fr 0.9fr 1fr 1fr 0.9fr 0.9fr 1.1fr 1.6fr 120px",
//                             alignItems: "center",
//                             borderBottom: "1px solid rgba(255,255,255,0.08)",
//                             bgcolor: (antPage * antRpp + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//                           }}
//                         >
//                           <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
//                             {antPage * antRpp + idx + 1}
//                           </Box>
//                           <Box sx={cellSx}>{a.type}</Box>
//                           <Box sx={cellSx}>{a.size_m || "-"}</Box>
//                           <Box sx={cellSx}>{a.eirp_dbw || "-"}</Box>
//                           <Box sx={cellSx}>{a.tx_polarization || "-"}</Box>
//                           <Box sx={cellSx}>{a.travel_range || "-"}</Box>
//                           <Box sx={cellSx}>{a.track_velocity || "-"}</Box>
//                           <Box sx={cellSx}>{a.track_acceleration || "-"}</Box>
//                           <Box sx={cellSx}>{a.track_modes || "-"}</Box>
//                           <Box sx={{ px: 1, py: 0.75, fontSize: 12, color: "#ddd" }}>
//                             <div><b>Bands:</b> {a.bands.length ? a.bands.map(b => `${b.band} (U:${b.uplink}/D:${b.downlink})`).join("; ") : "-"}</div>
//                             <div><b>G/T:</b> {a.gts.length ? a.gts.map(g => `${g.band}:${g.gt}`).join("; ") : "-"}</div>
//                           </Box>
//                           <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
//                             <Button
//                               size="small"
//                               variant="contained"
//                               onClick={() => alert("Antenna update modal to be wired next.")}
//                               sx={{
//                                 minWidth: 70,
//                                 height: 28,
//                                 fontSize: 12,
//                                 textTransform: "none",
//                                 fontWeight: 700,
//                                 bgcolor: PRIMARY,
//                                 "&:hover": { bgcolor: "#6b46f1" },
//                               }}
//                             >
//                               Update
//                             </Button>
//                           </Box>
//                         </Box>
//                       ))}
//                     </Box>

//                     <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", px: 1, py: 0.75 }}>
//                       <TablePagination
//                         component="div"
//                         count={antRows.length}
//                         page={antPage}
//                         onPageChange={(_, p) => setAntPage(p)}
//                         rowsPerPage={antRpp}
//                         onRowsPerPageChange={(e) => {
//                           setAntRpp(parseInt(e.target.value, 10));
//                           setAntPage(0);
//                         }}
//                         rowsPerPageOptions={[5, 20, 50]}
//                         sx={paginationSx}
//                       />
//                     </Box>
//                   </>
//                 )}
//               </>
//             )}
//           </Box>
//         </Card>
//       </Box>

//       {/* Dialogs */}
//       <UpdateGroundStationDialog
//         open={editOpen}
//         row={editRow}
//         onClose={() => setEditOpen(false)}
//         onSave={handleSaveDialog}
//         onDelete={handleDeleteDialog}
//       />
//       <UpdateSatellitePolarizationDialog
//         open={polEditOpen}
//         row={polEditRow}
//         satOptions={satOptions}
//         onClose={() => setPolEditOpen(false)}
//         onSave={handleSavePolDialog}
//         onDelete={handleDeletePolDialog}
//       />
//     </MainLayout>
//   );
// }

// /* ---------- tiny style helpers ---------- */
// const toolLabelSx = {
//   fontSize: 12,
//   fontWeight: 700,
//   color: "rgba(255,255,255,0.72)",
//   mr: 0.75,
// };

// const innerToggleSx = {
//   textTransform: "none",
//   fontWeight: 700,
//   fontSize: 13,
//   px: 2,
//   height: 32,
//   borderRadius: 999,
//   color: "rgba(255,255,255,.72)",
//   bgcolor: "transparent",
//   "&.Mui-selected": {
//     color: "#7CFF8D",
//     bgcolor: "#0E0E10",
//     border: "1px solid rgba(124,255,141,0.18)",
//   },
//   "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
// };

// const cellSx = { px: 1.25, py: 1, textAlign: "center" as const, fontSize: 13 };

// const paginationSx = {
//   color: "#E8E8EA",
//   "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0 },
//   "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { m: 0, fontSize: 13 },
//   "& .MuiTablePagination-input": { m: 0, fontSize: 13 },
//   "& .MuiSelect-select": {
//     py: 0,
//     px: 1,
//     height: 28,
//     display: "flex",
//     alignItems: "center",
//     bgcolor: "#1C1C1E",
//     borderRadius: 1,
//   },
//   "& .MuiIconButton-root": { p: 0.25 },
//   ".MuiSvgIcon-root": { fontSize: 16, color: "#E8E8EA" },
// };

//p3//
import * as React from "react";
import {
  Box,
  Card,
  Button,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  TablePagination,
  Divider,
  FormControl,
  MenuItem,
  ListItemText,
} from "@mui/material";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";

/* Existing dialogs */
import UpdateGroundStationDialog from "../components/UpdateGroundStationDialog";
import type { GroundStation as GSDialogRow } from "../components/UpdateGroundStationDialog";
import UpdateSatellitePolarizationDialog from "../components/UpdateSatellitePolarizationDialog";
import type { SatPolRow as SatPolDialogRow } from "../components/UpdateSatellitePolarizationDialog";

/* New dialog for antennas */
import UpdateAntennaDialog from "../components/UpdateAntennaDialog";
import type { AntennaDialogRow } from "../components/UpdateAntennaDialog";

/* ---------- API endpoints ---------- */
const GS_API   = "/api/ground-stations";
const OPS_API  = "/api/operations";
const REQ_API  = "/api/operation-requesters";
const SUP_API  = "/api/operation-supporters";
const POL_API  = "/api/polarizations";
const ANT_API  = "/api/antennas";

/* ---------- Shared card + controls ---------- */
const CARD_SX = {
  bgcolor: "#1C1C1E",
  color: "#E8E8EA",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
} as const;

const COLORS = { link: "#7CA7FF", purple: "#7C57F2" };

const controlSx = {
  bgcolor: "#232325",
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

/* ---------- Helpers ---------- */
const PRIMARY = "#7C57F2";
const BAND_OPTIONS = ["UHF", "VHF", "L", "S", "C", "X", "Ku", "Ka"];

/* ---------- Types ---------- */
type TabKey = "stations" | "operations" | "polarization" | "antennas";

/* Ground station API shape */
type ApiGS = {
  id: number;
  supporting_partner: string;
  ground_station: string;
  added_by?: string;

  antenna?: string;
  antenna_type?: string;
  antenna_name?: string;

  latitude?: string | number;
  longitude?: string | number;
  station_latitude?: string | number;
  station_longitude?: string | number;
};

/* UI rows */
type GSRow = {
  id: number;
  partner: string;
  station: string;
  addedBy: string;
  antenna?: string; // CSV or single name
  lat?: string;
  lng?: string;
};

type PolRow = { id: number; sat: string; pol: string };

/* Antenna rows */
type AntBand = { band: string; uplink: string; downlink: string };
type AntGT = { band: string; gt: string };

type AntennaRow = {
  id: number;
  type: string;
  size_m: string;
  eirp_dbw: string;
  tx_polarization: string;
  travel_range: string;
  track_velocity: string;
  track_acceleration: string;
  track_modes: string;
  bands: AntBand[];
  gts: AntGT[];
};

/* ---------- API mappers ---------- */
const apiGsToUi = (g: ApiGS): GSRow => ({
  id: g.id,
  partner: g.supporting_partner,
  station: g.ground_station,
  addedBy: g.added_by ?? "Admin",
  antenna:
    (g.antenna_name as any) ??
    (g.antenna_type as any) ??
    (g.antenna as any) ??
    "",
lat: String(g.station_latitude ?? g.latitude ?? ""),
lng: String(g.station_longitude ?? g.longitude ?? ""),

});

const apiPolToUi = (p: { id: number; satellite_name: string; polarization: string }): PolRow => ({
  id: p.id,
  sat: p.satellite_name,
  pol: p.polarization,
});

/* ---------- Simple “view all” list box used in Operations tab ---------- */
function ListPanel({
  title,
  items,
  targetTab,
}: {
  title: string;
  items: string[];
  targetTab: "requesters" | "operations" | "supporters";
}) {
  const navigate = useNavigate();
  const handleViewAll = () => navigate(`/Operations?tab=${targetTab}`);

  return (
    <Box
      sx={{
        border: "1px solid rgba(255,255,255,0.14)",
        borderRadius: 1.25,
        overflow: "hidden",
        bgcolor: "#161618",
        minWidth: 0,
      }}
    >
      <Box
        sx={{
          px: 1.25,
          py: 0.75,
          borderBottom: "1px solid rgba(255,255,255,0.12)",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>{title}</Typography>
        <Box sx={{ ml: "auto" }}>
          <Button
            size="small"
            onClick={handleViewAll}
            sx={{
              color: "#9FB7FF",
              textTransform: "none",
              fontWeight: 700,
              px: 0.5,
              minWidth: 0,
            }}
          >
            View all &rsaquo;
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: 1 }}>
        {items.map((name, i) => (
          <Box
            key={name + i}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "#1D1D20",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 1,
              px: 1,
              py: 1,
              mb: 1,
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{name}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* =======================================================
   Page
======================================================= */
export default function Gsoperations() {
  const [tab, setTab] = React.useState<TabKey>("stations");
  const handleTab = (_: React.SyntheticEvent, next: TabKey | null) => {
    if (next) setTab(next);
  };

  /* ---------------- Ground Stations ---------------- */
  const [gsInner, setGsInner] = React.useState<"add" | "view">("add");

  // add form
  const [partner, setPartner] = React.useState("");
  const [gsName, setGsName] = React.useState("");
  const [antennaSel, setAntennaSel] = React.useState<string>("");
  const [lat, setLat] = React.useState("");
  const [lng, setLng] = React.useState("");

  const [rows, setRows] = React.useState<GSRow[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(20);

  // dropdown options
  const [antennaOpts, setAntennaOpts] = React.useState<string[]>([]);

  // edit dialog (GS)
  const [editOpen, setEditOpen] = React.useState(false);
  const [editRow, setEditRow] = React.useState<GSDialogRow | null>(null);

  /* ---------------- Operations ---------------- */
  const [opName, setOpName] = React.useState("");
  const [reqName, setReqName] = React.useState("");
  const [supName, setSupName] = React.useState("");
  const [opsList, setOpsList] = React.useState<string[]>([]);
  const [requesters, setRequesters] = React.useState<string[]>([]);
  const [supporters, setSupporters] = React.useState<string[]>([]);

  /* ---------------- Satellite Polarization ---------------- */
  const [satName, setSatName] = React.useState("");
  const [pol, setPol] = React.useState("");
  const [polRows, setPolRows] = React.useState<PolRow[]>([]);
  const [polPage, setPolPage] = React.useState(0);
  const [polRowsPerPage, setPolRowsPerPage] = React.useState(20);
  const [polEditOpen, setPolEditOpen] = React.useState(false);
  const [polEditRow, setPolEditRow] = React.useState<SatPolDialogRow | null>(null);
  const satOptions = React.useMemo(
    () => Array.from(new Set(polRows.map((r) => r.sat))).sort(),
    [polRows]
  );

  /* ---------------- Antennas ---------------- */
  const [antInner, setAntInner] = React.useState<"add" | "view">("add");

  // add antenna form
  const [antType, setAntType] = React.useState("");
  const [antSize, setAntSize] = React.useState(""); // meters
  const [antEIRP, setAntEIRP] = React.useState(""); // dBW
  const [antTxPol, setAntTxPol] = React.useState("");
  const [antTravelRange, setAntTravelRange] = React.useState("");
  const [antTrackVel, setAntTrackVel] = React.useState("");
  const [antTrackAcc, setAntTrackAcc] = React.useState("");
  const [antTrackModes, setAntTrackModes] = React.useState("");

  // bands section
  const [curBand, setCurBand] = React.useState("");
  const [curUplink, setCurUplink] = React.useState("");
  const [curDownlink, setCurDownlink] = React.useState("");
  const [bandRows, setBandRows] = React.useState<AntBand[]>([]);

  // Receive G/T section
  const [gtBand, setGtBand] = React.useState("");
  const [gtVal, setGtVal] = React.useState("");
  const [gts, setGts] = React.useState<AntGT[]>([]);

  // antennas table + dialog
  const [antRows, setAntRows] = React.useState<AntennaRow[]>([]);
  const [antPage, setAntPage] = React.useState(0);
  const [antRpp, setAntRpp] = React.useState(20);

  const [antEditOpen, setAntEditOpen] = React.useState(false);
  const [antEditRow, setAntEditRow] = React.useState<AntennaDialogRow | null>(null);

  /* ---------------- Shared header actions ---------------- */
  const clearAll = () => {
    // ground station
    setPartner("");
    setGsName("");
    setAntennaSel("");
    setLat("");
    setLng("");
    // operations
    setOpName("");
    setReqName("");
    setSupName("");
    // pol
    setSatName("");
    setPol("");
    // antennas form
    setAntType("");
    setAntSize("");
    setAntEIRP("");
    setAntTxPol("");
    setAntTravelRange("");
    setAntTrackVel("");
    setAntTrackAcc("");
    setAntTrackModes("");
    setCurBand("");
    setCurUplink("");
    setCurDownlink("");
    setBandRows([]);
    setGtBand("");
    setGtVal("");
    setGts([]);
  };

  /* =======================================================
     Loaders
  ======================================================= */
  const loadStations = React.useCallback(async () => {
    try {
      const json = await api.get<any>(`${GS_API}?limit=1000&sort_by=id&sort_order=asc`);
      const data: ApiGS[] = json?.data ?? [];
      setRows(data.map(apiGsToUi));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load ground stations");
    }
  }, []);

  const loadPols = React.useCallback(async () => {
    try {
      const json = await api.get<any>(`${POL_API}?limit=1000&sort_by=id&sort_order=asc`);
      const data: any[] = json?.data ?? [];
      setPolRows(data.map(apiPolToUi));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load satellite polarizations");
    }
  }, []);

  const loadOperations = React.useCallback(async () => {
    try {
      const json = await api.get<any>(`${OPS_API}?limit=1000&sort_by=operation_name&sort_order=asc`);
    const data: any[] = json?.data ?? [];
      setOpsList(data.map((d) => d.operation_name));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load operations");
    }
  }, []);

  const loadRequesters = React.useCallback(async () => {
    try {
      const json = await api.get<any>(`${REQ_API}?limit=1000&sort_by=requester_name&sort_order=asc`);
      const data: any[] = json?.data ?? [];
      setRequesters(data.map((d) => d.requester_name));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load requesters");
    }
  }, []);

  const loadSupporters = React.useCallback(async () => {
    try {
      const json = await api.get<any>(`${SUP_API}?limit=1000&sort_by=supporter_name&sort_order=asc`);
      const data: any[] = json?.data ?? [];
      setSupporters(data.map((d) => d.supporter_name));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to load supporters");
    }
  }, []);

  const loadAntennas = React.useCallback(async () => {
    try {
      const json = await api.get<any>(`${ANT_API}?limit=1000&sort_by=id&sort_order=asc`);
      const data: any[] = json?.data ?? [];

      const mapped: AntennaRow[] = data.map((a: any) => ({
        id: a.id,
        type: String(a.antenna_type ?? a.type ?? ""),
        size_m: String(a.size_m ?? a.antenna_size ?? ""),
        eirp_dbw: String(a.eirp_dbw ?? a.eirp ?? ""),
        tx_polarization: String(a.tx_polarization ?? a.transmit_polarization ?? ""),
        travel_range: String(a.travel_range ?? ""),
        track_velocity: String(a.tracking_velocity ?? a.track_velocity ?? ""),
        track_acceleration: String(a.tracking_acceleration ?? a.track_acceleration ?? ""),
        track_modes: String(a.tracking_modes ?? a.track_modes ?? ""),
        bands: Array.isArray(a.bands) ? a.bands : [],
        gts: Array.isArray(a.gts) ? a.gts : [],
      }));

      setAntRows(mapped);

      // options for GS ➜ antenna dropdown (unique types)
      const names = Array.from(new Set(mapped.map((m) => m.type).filter(Boolean))).sort();
      setAntennaOpts(names);
    } catch (e: any) {
      console.warn("Antennas endpoint not ready:", e?.message || e);
      setAntRows([]);
      setAntennaOpts([]);
    }
  }, []);

  React.useEffect(() => {
    loadStations();
    loadPols();
    loadOperations();
    loadRequesters();
    loadSupporters();
    loadAntennas();
  }, [loadStations, loadPols, loadOperations, loadRequesters, loadSupporters, loadAntennas]);

  /* =======================================================
     Ground Stations: actions
  ======================================================= */
  const handleAddStation = async () => {
    const payload: any = {
      supporting_partner: partner.trim(),
      ground_station: gsName.trim(),
      added_by: "Admin",
    };
    if (antennaSel) payload.antenna = antennaSel;

    const latNum = Number(String(lat).replace(",", ".").trim());
    const lngNum = Number(String(lng).replace(",", ".").trim());

    if (Number.isFinite(latNum)) payload.station_latitude = latNum;
if (Number.isFinite(lngNum)) payload.station_longitude = lngNum;

    // if (lat) payload.station_latitude = lat;
    // if (lng) payload.station_longitude = lng;



    if (!payload.supporting_partner || !payload.ground_station) {
      alert("Please enter Supporting Partner and Ground Station Name.");
      return;
    }

    try {
      const created: ApiGS = await api.post(GS_API, payload);
      setRows((prev) => [...prev, apiGsToUi(created)]);
      setGsName("");
      setAntennaSel("");
      setLat("");
      setLng("");
      alert("Ground Station added successfully ✅");
      setGsInner("view");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to add Ground Station ❌");
    }
  };

  const handleUpdateStation = (r: GSRow) => {
    // populate modal with current values (supports antennas + lat/lng if your dialog does)
    const antennas = r.antenna
      ? r.antenna.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    setEditRow({
      id: r.id,
      partner: r.partner,
      station: r.station,
      antennas,
      latitude: r.lat ?? "",
      longitude: r.lng ?? "",
    });
    setEditOpen(true);
  };

  const handleSaveDialog = async (updated: GSDialogRow) => {
    try {
      const current = rows.find((r) => r.id === updated.id);
      const payload: any = {
        supporting_partner: updated.partner,
        ground_station: updated.station,
        added_by: current?.addedBy ?? "Admin",
      };
      if (updated.antennas?.length) payload.antenna = updated.antennas.join(", ");
      if (typeof updated.latitude !== "undefined") payload.station_latitude = updated.latitude || null;
      if (typeof updated.longitude !== "undefined") payload.station_longitude = updated.longitude || null;

      const data: ApiGS = await api.put(`${GS_API}/${updated.id}`, payload);
      setRows((prev) => prev.map((r) => (r.id === updated.id ? apiGsToUi(data) : r)));
      setEditOpen(false);
      alert("Ground Station updated ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to update ground station");
    }
  };

  const handleDeleteDialog = async (toDelete: GSDialogRow) => {
    try {
      await api.del(`${GS_API}/${toDelete.id}`);
      setRows((prev) => prev.filter((r) => r.id !== toDelete.id));
      setEditOpen(false);
      alert("Ground Station deleted ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to delete ground station");
    }
  };

  /* =======================================================
     Operations: actions
  ======================================================= */
  const handleAddOperation = async () => {
    const name = opName.trim();
    if (!name) return;
    try {
      const created = await api.post(OPS_API, { operation_name: name, added_by: "Admin" });
      setOpsList((cur) => [...cur, created.operation_name]);
      setOpName("");
      alert("Operation added ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to add operation ❌");
    }
  };

  const handleAddRequester = async () => {
    const name = reqName.trim();
    if (!name) return;
    try {
      const created = await api.post(REQ_API, { requester_name: name, added_by: "Admin" });
      setRequesters((cur) => [...cur, created.requester_name]);
      setReqName("");
      alert("Operation requester added ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to add requester ❌");
    }
  };

  const handleAddSupporter = async () => {
    const name = supName.trim();
    if (!name) return;
    try {
      const created = await api.post(SUP_API, { supporter_name: name, added_by: "Admin" });
      setSupporters((cur) => [...cur, created.supporter_name]);
      setSupName("");
      alert("Operation supporter added ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to add supporter ❌");
    }
  };

  /* =======================================================
     Polarization: actions
  ======================================================= */
  const handleAddPol = async () => {
    const s = satName.trim();
    const pz = pol.trim();
    if (!s || !pz) return;

    try {
      const created = await api.post(POL_API, { satellite_name: s, polarization: pz });
      setPolRows((cur) => [...cur, apiPolToUi(created)]);
      setSatName("");
      setPol("");
      alert("Satellite polarization added ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to add polarization ❌");
    }
  };

  const handleUpdatePol = (row: PolRow) => {
    const pols = row.pol.split(",").map((s) => s.trim()).filter(Boolean);
    setPolEditRow({ id: row.id, sat: row.sat, pols });
    setPolEditOpen(true);
  };

  const handleSavePolDialog = async (updated: SatPolDialogRow) => {
    try {
      const payload = { satellite_name: updated.sat, polarization: updated.pols.join(", ") };
      const data = await api.put(`${POL_API}/${updated.id}`, payload);
      setPolRows((prev) => prev.map((r) => (r.id === updated.id ? apiPolToUi(data) : r)));
      setPolEditOpen(false);
      alert("Polarization updated ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to update polarization ❌");
    }
  };

  const handleDeletePolDialog = async (toDelete: SatPolDialogRow) => {
    try {
      await api.del(`${POL_API}/${toDelete.id}`);
      setPolRows((prev) => prev.filter((r) => r.id !== toDelete.id));
      setPolEditOpen(false);
      alert("Polarization deleted ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to delete polarization ❌");
    }
  };

  /* =======================================================
     Antennas: actions
  ======================================================= */
  const addBandRow = () => {
    if (!curBand || !curUplink || !curDownlink) return;
    setBandRows((b) => [...b, { band: curBand, uplink: curUplink, downlink: curDownlink }]);
    setCurUplink("");
    setCurDownlink("");
  };
  const clearBands = () => setBandRows([]);

  const addGT = () => {
    if (!gtBand || !gtVal) return;
    setGts((g) => [...g, { band: gtBand, gt: gtVal }]);
    setGtVal("");
  };
  const clearGTs = () => setGts([]);

  const clearAntennaForm = () => {
    setAntType("");
    setAntSize("");
    setAntEIRP("");
    setAntTxPol("");
    setAntTravelRange("");
    setAntTrackVel("");
    setAntTrackAcc("");
    setAntTrackModes("");
    setCurBand("");
    setCurUplink("");
    setCurDownlink("");
    setBandRows([]);
    setGtBand("");
    setGtVal("");
    setGts([]);
  };

  const handleAddAntenna = async () => {
    if (!antType.trim()) {
      alert("Please enter Antenna Type.");
      return;
    }
    const payload = {
      antenna_type: antType.trim(),
      size_m: antSize.trim(),
      eirp_dbw: antEIRP.trim(),
      tx_polarization: antTxPol.trim(),
      travel_range: antTravelRange.trim(),
      tracking_velocity: antTrackVel.trim(),
      tracking_acceleration: antTrackAcc.trim(),
      tracking_modes: antTrackModes.trim(),
      bands: bandRows,
      gts,
      added_by: "Admin",
    };

    try {
      const created = await api.post(ANT_API, payload);
      const row: AntennaRow = {
        id: created.id,
        type: payload.antenna_type,
        size_m: payload.size_m,
        eirp_dbw: payload.eirp_dbw,
        tx_polarization: payload.tx_polarization,
        travel_range: payload.travel_range,
        track_velocity: payload.tracking_velocity,
        track_acceleration: payload.tracking_acceleration,
        track_modes: payload.tracking_modes,
        bands: payload.bands,
        gts: payload.gts,
      };
      setAntRows((prev) => [...prev, row]);
      clearAntennaForm();
      alert("Antenna added ✅");
      setAntInner("view");
      // refresh antenna options for GS dropdown
      setAntennaOpts((prev) =>
        Array.from(new Set([...prev, row.type].filter(Boolean))).sort()
      );
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to add antenna ❌");
    }
  };

  const handleUpdateAntenna = (row: AntennaRow) => {
    // Open modal with current values
    setAntEditRow({
      id: row.id,
      type: row.type,
      size_m: row.size_m,
      eirp_dbw: row.eirp_dbw,
      tx_polarization: row.tx_polarization,
      travel_range: row.travel_range,
      tracking_velocity: row.track_velocity,
      tracking_acceleration: row.track_acceleration,
      tracking_modes: row.track_modes,
      bands: row.bands,
      gts: row.gts,
    });
    setAntEditOpen(true);
  };

  const handleSaveAntennaDialog = async (updated: AntennaDialogRow) => {
    try {
      const payload = {
        antenna_type: updated.type,
        size_m: updated.size_m,
        eirp_dbw: updated.eirp_dbw,
        tx_polarization: updated.tx_polarization,
        travel_range: updated.travel_range,
        tracking_velocity: updated.tracking_velocity,
        tracking_acceleration: updated.tracking_acceleration,
        tracking_modes: updated.tracking_modes,
        bands: updated.bands ?? [],
        gts: updated.gts ?? [],
      };
      const res = await api.put(`${ANT_API}/${updated.id}`, payload);

      // Normalize response back to UI shape
      const newRow: AntennaRow = {
        id: res.id ?? updated.id,
        type: String(res.antenna_type ?? payload.antenna_type ?? ""),
        size_m: String(res.size_m ?? payload.size_m ?? ""),
        eirp_dbw: String(res.eirp_dbw ?? payload.eirp_dbw ?? ""),
        tx_polarization: String(res.tx_polarization ?? payload.tx_polarization ?? ""),
        travel_range: String(res.travel_range ?? payload.travel_range ?? ""),
        track_velocity: String(res.tracking_velocity ?? res.track_velocity ?? payload.tracking_velocity ?? ""),
        track_acceleration: String(res.tracking_acceleration ?? res.track_acceleration ?? payload.tracking_acceleration ?? ""),
        track_modes: String(res.tracking_modes ?? res.track_modes ?? payload.tracking_modes ?? ""),
        bands: Array.isArray(res.bands) ? res.bands : payload.bands,
        gts: Array.isArray(res.gts) ? res.gts : payload.gts,
      };

      setAntRows((prev) => prev.map((r) => (r.id === updated.id ? newRow : r)));
      setAntEditOpen(false);
      // keep antenna options up to date
      setAntennaOpts((prev) =>
        Array.from(new Set([...prev, newRow.type].filter(Boolean))).sort()
      );
      alert("Antenna updated ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to update antenna ❌");
    }
  };

  const handleDeleteAntennaDialog = async (toDelete: AntennaDialogRow) => {
    try {
      await api.del(`${ANT_API}/${toDelete.id}`);
      setAntRows((prev) => prev.filter((r) => r.id !== toDelete.id));
      setAntEditOpen(false);
      alert("Antenna deleted ✅");
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to delete antenna ❌");
    }
  };

  /* =======================================================
     Derived
  ======================================================= */
  const pagedStations = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const pagedPol = polRows.slice(polPage * polRowsPerPage, polPage * polRowsPerPage + polRowsPerPage);
  const pagedAnts = antRows.slice(antPage * antRpp, antPage * antRpp + antRpp);

  /* =======================================================
     Render
  ======================================================= */
  return (
    <MainLayout title="">
      <Box
        sx={{
          px: 2,
          py: 1.5,
          height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: 1.5,
        }}
      >
        {/* Top toggle */}
        <ToggleButtonGroup
          value={tab}
          exclusive
          onChange={handleTab}
          sx={{
            p: 0.5,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.14)",
            bgcolor: "#171718",
            width: "fit-content",
            "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
          }}
        >
          {[
            { key: "stations", label: "Ground Stations" },
            { key: "operations", label: "Operations" },
            { key: "polarization", label: "Satellite Polarization" },
            { key: "antennas", label: "Antennas" },
          ].map(({ key, label }) => (
            <ToggleButton
              key={key}
              value={key}
              disableRipple
              sx={{
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                px: 2,
                height: 32,
                lineHeight: "32px",
                borderRadius: 999,
                color: "rgba(255,255,255,0.72)",
                bgcolor: "transparent",
                "&.Mui-selected": {
                  color: "#7CFF8D",
                  bgcolor: "#0E0E10",
                  border: "1px solid rgba(124,255,141,0.18)",
                },
                "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
              }}
            >
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        {/* Main card */}
        <Card sx={{ ...CARD_SX, height: "100%" }}>
          {/* Header (title varies) */}
          <Box
            sx={{
              px: 1.25,
              py: 0.7,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* stations & antennas show inner toggle centered; others show title */}
            {tab === "stations" ? (
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <ToggleButtonGroup
                  value={gsInner}
                  exclusive
                  onChange={(_, v) => v && setGsInner(v)}
                  sx={{
                    p: 0.5,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                    bgcolor: "#171718",
                    "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
                  }}
                >
                  <ToggleButton value="add" disableRipple sx={innerToggleSx}>
                    Add Ground Station
                  </ToggleButton>
                  <ToggleButton value="view" disableRipple sx={innerToggleSx}>
                    View Ground Stations
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            ) : tab === "antennas" ? (
              <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                <ToggleButtonGroup
                  value={antInner}
                  exclusive
                  onChange={(_, v) => v && setAntInner(v)}
                  sx={{
                    p: 0.5,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.14)",
                    bgcolor: "#171718",
                    "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
                  }}
                >
                  <ToggleButton value="add" disableRipple sx={innerToggleSx}>
                    Add Antenna
                  </ToggleButton>
                  <ToggleButton value="view" disableRipple sx={innerToggleSx}>
                    View Antennas
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            ) : (
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
                {tab === "operations" ? "Operation Details" : "Satellite Polarization Details"}
              </Typography>
            )}

            <Box sx={{ ml: "auto" }}>
              <Button
                size="small"
                onClick={clearAll}
                sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}
              >
                Clear
              </Button>
            </Box>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            {/* ================= Ground Stations ================= */}
            {tab === "stations" && (
              <>
                {gsInner === "add" ? (
                  <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        columnGap: 2,
                        rowGap: 2,
                        "& .form-item": { display: "flex", flexDirection: "column" },
                      }}
                    >
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Supporting Partner</Typography>
                        <TextField
                          value={partner}
                          onChange={(e) => setPartner(e.target.value)}
                          placeholder="Enter Supporting Partner"
                          size="small"
                          sx={controlSx}
                        />
                      </Box>

                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Ground Station Name</Typography>
                        <TextField
                          value={gsName}
                          onChange={(e) => setGsName(e.target.value)}
                          placeholder="Enter Ground Station Name"
                          size="small"
                          sx={controlSx}
                        />
                      </Box>

                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Antenna</Typography>
                        <FormControl fullWidth size="small">
                          <Select<string>
                            value={antennaSel}
                            onChange={(e: SelectChangeEvent<string>) =>
                              setAntennaSel(e.target.value as string)
                            }
                            displayEmpty
                            renderValue={(val) => (val ? (val as string) : "Select Antenna")}
                            sx={controlSx}
                            MenuProps={darkMenu}
                          >
                            <MenuItem disabled value="">
                              Select Antenna
                            </MenuItem>
                            {antennaOpts.map((a) => (
                              <MenuItem key={a} value={a}>
                                <ListItemText primary={a} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Station Latitude</Typography>
                        <TextField
                          value={lat}
                          onChange={(e) => setLat(e.target.value)}
                          placeholder="e.g. 12.9716"
                          size="small"
                          sx={controlSx}
                        />
                      </Box>

                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Station Longitude</Typography>
                        <TextField
                          value={lng}
                          onChange={(e) => setLng(e.target.value)}
                          placeholder="e.g. 77.5946"
                          size="small"
                          sx={controlSx}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <Button
                        onClick={handleAddStation}
                        variant="contained"
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          bgcolor: PRIMARY,
                          "&:hover": { bgcolor: "#6b46f1" },
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    {/* Table */}
                    <Box sx={{ flex: 1, minHeight: 0, px: 1, pb: 1, ...SCROLLER_SX }}>
                      <Box
                        sx={{
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          display: "grid",
                          gridTemplateColumns:
                            "80px 1.2fr 1.2fr 1fr 0.9fr 0.9fr 120px",
                          bgcolor: "#000",
                          borderBottom: "1px solid rgba(255,255,255,0.14)",
                        }}
                      >
                        {["Sr No", "Supporting Partner", "Ground Station", "Antenna", "Latitude", "Longitude", "Action"].map(
                          (h) => (
                            <Box
                              key={h}
                              sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}
                            >
                              {h}
                            </Box>
                          )
                        )}
                      </Box>

                      {pagedStations.map((r, idx) => (
                        <Box
                          key={r.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "80px 1.2fr 1.2fr 1fr 0.9fr 0.9fr 120px",
                            alignItems: "center",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            bgcolor: (page * rowsPerPage + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
                          }}
                        >
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                            {page * rowsPerPage + idx + 1}
                          </Box>
                          <Box sx={cellSx}>{r.partner}</Box>
                          <Box sx={cellSx}>{r.station}</Box>
                          <Box sx={cellSx}>{r.antenna || "-"}</Box>
                          <Box sx={cellSx}>{r.lat || "-"}</Box>
                          <Box sx={cellSx}>{r.lng || "-"}</Box>
                          <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleUpdateStation(r)}
                              sx={{
                                minWidth: 70,
                                height: 28,
                                fontSize: 12,
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: PRIMARY,
                                "&:hover": { bgcolor: "#6b46f1" },
                              }}
                            >
                              Update
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Pagination */}
                    <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", px: 1, py: 0.75 }}>
                      <TablePagination
                        component="div"
                        count={rows.length}
                        page={page}
                        onPageChange={(_, p) => setPage(p)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                        rowsPerPageOptions={[5, 20, 50]}
                        sx={paginationSx}
                      />
                    </Box>
                  </>
                )}
              </>
            )}

            {/* ================= Operations ================= */}
            {tab === "operations" && (
              <>
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.9,
                    borderBottom: "1px solid rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
                    "&::-webkit-scrollbar-track": { background: "transparent" },
                  }}
                >
                  {/* 1) Requester */}
                  <Typography sx={toolLabelSx}>Add Operation Requester</Typography>
                  <TextField
                    placeholder="Requester name"
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    size="small"
                    sx={{ ...controlSx, width: 220 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddRequester}
                    disabled={!reqName.trim()}
                    sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
                  >
                    Add
                  </Button>

                  <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255,255,255,0.12)" }} />

                  {/* 2) TTL Service Provider */}
                  <Typography sx={toolLabelSx}>Add TTL Service Provider</Typography>
                  <TextField
                    placeholder="Supporter name"
                    value={supName}
                    onChange={(e) => setSupName(e.target.value)}
                    size="small"
                    sx={{ ...controlSx, width: 220 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddSupporter}
                    disabled={!supName.trim()}
                    sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
                  >
                    Add
                  </Button>

                  <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "rgba(255,255,255,0.12)" }} />

                  {/* 3) Operation */}
                  <Typography sx={toolLabelSx}>Add Operation</Typography>
                  <TextField
                    placeholder="Operation name"
                    value={opName}
                    onChange={(e) => setOpName(e.target.value)}
                    size="small"
                    sx={{ ...controlSx, width: 220 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddOperation}
                    disabled={!opName.trim()}
                    sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
                  >
                    Add
                  </Button>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    p: 1.25,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr 1fr" },
                    gap: 1.25,
                  }}
                >
                  <ListPanel title="Operations Requesters" items={requesters} targetTab="requesters" />
                  <ListPanel title="TTL Service Provider" items={supporters} targetTab="supporters" />
                  <ListPanel title="Operations" items={opsList} targetTab="operations" />
                </Box>
              </>
            )}

            {/* ================= Satellite Polarization ================= */}
            {tab === "polarization" && (
              <>
                <Box sx={{ p: 1.25, pt: 1.25, display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, mr: 1 }}>
                    Add Satellite Polarization
                  </Typography>
                  <TextField
                    value={satName}
                    onChange={(e) => setSatName(e.target.value)}
                    placeholder="Satellite Name"
                    size="small"
                    sx={{ width: 280, ...controlSx }}
                  />
                  <TextField
                    value={pol}
                    onChange={(e) => setPol(e.target.value)}
                    placeholder="Polarization"
                    size="small"
                    sx={{ width: 220, ...controlSx }}
                  />
                  <Button
                    onClick={handleAddPol}
                    disabled={!satName.trim() || !pol.trim()}
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                      bgcolor: PRIMARY,
                      "&:hover": { bgcolor: "#6b46f1" },
                      "&.Mui-disabled": { bgcolor: "#2f2f33", color: "#b5b7bd", boxShadow: "none" },
                    }}
                  >
                    Add
                  </Button>
                </Box>

                <Box sx={{ flex: 1, minHeight: 0, px: 1, ...SCROLLER_SX, pb: 1 }}>
                  <Box
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      display: "grid",
                      gridTemplateColumns: "80px 1.4fr 1.2fr 120px",
                      bgcolor: "#000",
                      borderBottom: "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    {["Sr No", "Satellite Name", "Polarization", "Action"].map((label) => (
                      <Box key={label} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
                        {label}
                      </Box>
                    ))}
                  </Box>

                  {pagedPol.map((r, idx) => (
                    <Box
                      key={r.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "80px 1.4fr 1.2fr 120px",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(255,255,255,0.08)",
                        bgcolor: (polPage * polRowsPerPage + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
                      }}
                    >
                      <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                        {polPage * polRowsPerPage + idx + 1}
                      </Box>
                      <Box sx={cellSx}>{r.sat}</Box>
                      <Box sx={cellSx}>{r.pol}</Box>
                      <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleUpdatePol(r)}
                          sx={{
                            minWidth: 70,
                            height: 28,
                            fontSize: 12,
                            textTransform: "none",
                            fontWeight: 700,
                            bgcolor: PRIMARY,
                            "&:hover": { bgcolor: "#6b46f1" },
                          }}
                        >
                          Update
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", px: 1, py: 0.75 }}>
                  <TablePagination
                    component="div"
                    count={polRows.length}
                    page={polPage}
                    onPageChange={(_, p) => setPolPage(p)}
                    rowsPerPage={polRowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setPolRowsPerPage(parseInt(e.target.value, 10));
                      setPolPage(0);
                    }}
                    rowsPerPageOptions={[5, 20, 50]}
                    sx={paginationSx}
                  />
                </Box>
              </>
            )}

            {/* ================= Antennas ================= */}
            {tab === "antennas" && (
              <>
                {antInner === "add" ? (
                  <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
                        columnGap: 2,
                        rowGap: 2,
                        "& .form-item": { display: "flex", flexDirection: "column" },
                      }}
                    >
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Antenna Type *</Typography>
                        <TextField value={antType} onChange={(e) => setAntType(e.target.value)} placeholder="Enter type" size="small" sx={controlSx} />
                      </Box>
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Antenna Size (m)</Typography>
                        <TextField value={antSize} onChange={(e) => setAntSize(e.target.value)} placeholder="e.g. 3.7" size="small" sx={controlSx} />
                      </Box>
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>EIRP (dBW)</Typography>
                        <TextField value={antEIRP} onChange={(e) => setAntEIRP(e.target.value)} placeholder="e.g. 52.5" size="small" sx={controlSx} />
                      </Box>

                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Transmit Polarization</Typography>
                        <TextField value={antTxPol} onChange={(e) => setAntTxPol(e.target.value)} placeholder="e.g. RHCP / LHCP / Linear" size="small" sx={controlSx} />
                      </Box>
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Antenna Travel Range</Typography>
                        <TextField value={antTravelRange} onChange={(e) => setAntTravelRange(e.target.value)} placeholder="e.g. Az: ±180°, El: 0–90°" size="small" sx={controlSx} />
                      </Box>
                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Tracking Velocity</Typography>
                        <TextField value={antTrackVel} onChange={(e) => setAntTrackVel(e.target.value)} placeholder="e.g. 20°/s" size="small" sx={controlSx} />
                      </Box>

                      <Box className="form-item">
                        <Typography sx={LABEL_SX}>Tracking Acceleration</Typography>
                        <TextField value={antTrackAcc} onChange={(e) => setAntTrackAcc(e.target.value)} placeholder="e.g. 100°/s²" size="small" sx={controlSx} />
                      </Box>
                      <Box className="form-item" sx={{ gridColumn: { md: "span 2" } }}>
                        <Typography sx={LABEL_SX}>Tracking Modes</Typography>
                        <TextField value={antTrackModes} onChange={(e) => setAntTrackModes(e.target.value)} placeholder="e.g. Program, TLE, Step-track" size="small" sx={controlSx} />
                      </Box>
                    </Box>

                    {/* Bands */}
                    <Box sx={{ mt: 2, p: 1.25, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 1 }}>
                      <Typography sx={{ fontWeight: 700, mb: 1 }}>Bands</Typography>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "1fr", md: "200px 1fr 1fr auto auto" },
                          gap: 1,
                          alignItems: "center",
                        }}
                      >
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <Select<string>
                            value={curBand}
                            onChange={(e: SelectChangeEvent<string>) => setCurBand(e.target.value as string)}
                            displayEmpty
                            renderValue={(v) => (v ? (v as string) : "Select Band")}
                            sx={controlSx}
                            MenuProps={darkMenu}
                          >
                            <MenuItem disabled value="">Select Band</MenuItem>
                            {BAND_OPTIONS.map((b) => (
                              <MenuItem key={b} value={b}>
                                <ListItemText primary={b} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField value={curUplink} onChange={(e) => setCurUplink(e.target.value)} placeholder="Enter Uplink" size="small" sx={controlSx} />
                        <TextField value={curDownlink} onChange={(e) => setCurDownlink(e.target.value)} placeholder="Enter Downlink" size="small" sx={controlSx} />
                        <Button variant="outlined" onClick={clearBands} sx={{ textTransform: "none", height: 32, borderColor: "#666", color: "#bbb" }}>
                          Clear
                        </Button>
                        <Button variant="contained" onClick={addBandRow} sx={{ textTransform: "none", height: 32, bgcolor: "#e03f3f", "&:hover": { bgcolor: "#cc3535" } }}>
                          Add
                        </Button>
                      </Box>

                      {/* list */}
                      <Box sx={{ mt: 1 }}>
                        {bandRows.map((b, i) => (
                          <Box
                            key={`${b.band}-${i}`}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "repeat(3,1fr)", md: "200px 1fr 1fr" },
                              gap: 1,
                              bgcolor: "#1d1d20",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 1,
                              p: 1,
                              mb: 1,
                            }}
                          >
                            <Box sx={{ fontSize: 13 }}><b>Band:</b> {b.band}</Box>
                            <Box sx={{ fontSize: 13 }}><b>Uplink:</b> {b.uplink}</Box>
                            <Box sx={{ fontSize: 13 }}><b>Downlink:</b> {b.downlink}</Box>
                          </Box>
                        ))}
                        {!bandRows.length && <Typography sx={{ color: "#9aa", fontSize: 13, mt: 0.5 }}>No bands added.</Typography>}
                      </Box>
                    </Box>

                    {/* Receive G/T */}
                    <Box sx={{ mt: 2, p: 1.25, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 1 }}>
                      <Typography sx={{ fontWeight: 700, mb: 1 }}>Receive G/T</Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "200px 1fr auto auto" }, gap: 1, alignItems: "center" }}>
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                          <Select<string>
                            value={gtBand}
                            onChange={(e: SelectChangeEvent<string>) => setGtBand(e.target.value as string)}
                            displayEmpty
                            renderValue={(v) => (v ? (v as string) : "Select Band")}
                            sx={controlSx}
                            MenuProps={darkMenu}
                          >
                            <MenuItem disabled value="">Select Band</MenuItem>
                            {BAND_OPTIONS.map((b) => (
                              <MenuItem key={b} value={b}>
                                <ListItemText primary={b} />
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <TextField value={gtVal} onChange={(e) => setGtVal(e.target.value)} placeholder="Enter G/T" size="small" sx={controlSx} />
                        <Button variant="outlined" onClick={clearGTs} sx={{ textTransform: "none", height: 32, borderColor: "#666", color: "#bbb" }}>
                          Clear
                        </Button>
                        <Button variant="contained" onClick={addGT} sx={{ textTransform: "none", height: 32, bgcolor: "#e03f3f", "&:hover": { bgcolor: "#cc3535" } }}>
                          Add
                        </Button>
                      </Box>

                      <Box sx={{ mt: 1 }}>
                        {gts.map((g, i) => (
                          <Box
                            key={`${g.band}-${i}`}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "repeat(2,1fr)", md: "200px 1fr" },
                              gap: 1,
                              bgcolor: "#1d1d20",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: 1,
                              p: 1,
                              mb: 1,
                            }}
                          >
                            <Box sx={{ fontSize: 13 }}><b>Band:</b> {g.band}</Box>
                            <Box sx={{ fontSize: 13 }}><b>G/T:</b> {g.gt}</Box>
                          </Box>
                        ))}
                        {!gts.length && <Typography sx={{ color: "#9aa", fontSize: 13, mt: 0.5 }}>No G/T rows added.</Typography>}
                      </Box>
                    </Box>

                    {/* Save */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <Button
                        variant="contained"
                        onClick={handleAddAntenna}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                          bgcolor: COLORS.purple,
                          "&:hover": { bgcolor: "#6b46f1" },
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    {/* Antennas table */}
                    <Box sx={{ flex: 1, minHeight: 0, px: 1, pb: 1, ...SCROLLER_SX }}>
                      <Box
                        sx={{
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          display: "grid",
                          gridTemplateColumns:
                            "70px 1.1fr 0.9fr 0.9fr 1fr 1fr 0.9fr 0.9fr 1.1fr 1.6fr 120px",
                          bgcolor: "#000",
                          borderBottom: "1px solid rgba(255,255,255,0.14)",
                        }}
                      >
                        {[
                          "No",
                          "Type",
                          "Size (m)",
                          "EIRP (dBW)",
                          "Tx Pol",
                          "Travel Range",
                          "Track Vel",
                          "Track Acc",
                          "Track Modes",
                          "Bands / G/T",
                          "Action",
                        ].map((h) => (
                          <Box key={h} sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}>
                            {h}
                          </Box>
                        ))}
                      </Box>

                      {pagedAnts.map((a, idx) => (
                        <Box
                          key={a.id}
                          sx={{
                            display: "grid",
                            gridTemplateColumns:
                              "70px 1.1fr 0.9fr 0.9fr 1fr 1fr 0.9fr 0.9fr 1.1fr 1.6fr 120px",
                            alignItems: "center",
                            borderBottom: "1px solid rgba(255,255,255,0.08)",
                            bgcolor: (antPage * antRpp + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
                          }}
                        >
                          <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                            {antPage * antRpp + idx + 1}
                          </Box>
                          <Box sx={cellSx}>{a.type}</Box>
                          <Box sx={cellSx}>{a.size_m || "-"}</Box>
                          <Box sx={cellSx}>{a.eirp_dbw || "-"}</Box>
                          <Box sx={cellSx}>{a.tx_polarization || "-"}</Box>
                          <Box sx={cellSx}>{a.travel_range || "-"}</Box>
                          <Box sx={cellSx}>{a.track_velocity || "-"}</Box>
                          <Box sx={cellSx}>{a.track_acceleration || "-"}</Box>
                          <Box sx={cellSx}>{a.track_modes || "-"}</Box>
                          <Box sx={{ px: 1, py: 0.75, fontSize: 12, color: "#ddd" }}>
                            <div><b>Bands:</b> {a.bands.length ? a.bands.map(b => `${b.band} (U:${b.uplink}/D:${b.downlink})`).join("; ") : "-"}</div>
                            <div><b>G/T:</b> {a.gts.length ? a.gts.map(g => `${g.band}:${g.gt}`).join("; ") : "-"}</div>
                          </Box>
                          <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleUpdateAntenna(a)}
                              sx={{
                                minWidth: 70,
                                height: 28,
                                fontSize: 12,
                                textTransform: "none",
                                fontWeight: 700,
                                bgcolor: PRIMARY,
                                "&:hover": { bgcolor: "#6b46f1" },
                              }}
                            >
                              Update
                            </Button>
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)", px: 1, py: 0.75 }}>
                      <TablePagination
                        component="div"
                        count={antRows.length}
                        page={antPage}
                        onPageChange={(_, p) => setAntPage(p)}
                        rowsPerPage={antRpp}
                        onRowsPerPageChange={(e) => {
                          setAntRpp(parseInt(e.target.value, 10));
                          setAntPage(0);
                        }}
                        rowsPerPageOptions={[5, 20, 50]}
                        sx={paginationSx}
                      />
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Card>
      </Box>

      {/* Dialogs */}
      <UpdateGroundStationDialog
        open={editOpen}
        row={editRow}
        antennaOptions={antennaOpts}
        onClose={() => setEditOpen(false)}
        onSave={handleSaveDialog}
        onDelete={handleDeleteDialog}
      />
      <UpdateSatellitePolarizationDialog
        open={polEditOpen}
        row={polEditRow}
        satOptions={satOptions}
        onClose={() => setPolEditOpen(false)}
        onSave={handleSavePolDialog}
        onDelete={handleDeletePolDialog}
      />
      <UpdateAntennaDialog
        open={antEditOpen}
        row={antEditRow}
        onClose={() => setAntEditOpen(false)}
        onSave={handleSaveAntennaDialog}
        onDelete={handleDeleteAntennaDialog}
      />
    </MainLayout>
  );
}

/* ---------- tiny style helpers ---------- */
const toolLabelSx = {
  fontSize: 12,
  fontWeight: 700,
  color: "rgba(255,255,255,0.72)",
  mr: 0.75,
};

const innerToggleSx = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: 13,
  px: 2,
  height: 32,
  borderRadius: 999,
  color: "rgba(255,255,255,.72)",
  bgcolor: "transparent",
  "&.Mui-selected": {
    color: "#7CFF8D",
    bgcolor: "#0E0E10",
    border: "1px solid rgba(124,255,141,0.18)",
  },
  "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
};

const cellSx = { px: 1.25, py: 1, textAlign: "center" as const, fontSize: 13 };

const paginationSx = {
  color: "#E8E8EA",
  "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { m: 0, fontSize: 13 },
  "& .MuiTablePagination-input": { m: 0, fontSize: 13 },
  "& .MuiSelect-select": {
    py: 0,
    px: 1,
    height: 28,
    display: "flex",
    alignItems: "center",
    bgcolor: "#1C1C1E",
    borderRadius: 1,
  },
  "& .MuiIconButton-root": { p: 0.25 },
  ".MuiSvgIcon-root": { fontSize: 16, color: "#E8E8EA" },
};


