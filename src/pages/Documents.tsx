// src/pages/Documents.tsx
import React from "react";
import {
  Box,
  Card,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Button,
  TablePagination,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MainLayout from "../layouts/MainLayout";
import { api, BASE_URL, getAuthToken } from "../api/http";
import { useAuth } from "../auth"; // ✅ RBAC hook

/* --- Modals --- */
import UpdateDocumentModal from "../components/Models/UpdateDocumentModal";
import UpdatePassModal from "../components/Models/UpdatePass_schedule_Modal";
import type { DocumentRow as DocModalRow } from "../components/Models/UpdateDocumentModal";
import type { PassRow as PassModalRow } from "../components/Models/UpdatePass_schedule_Modal";

/* ---------- API endpoints ---------- */
const DOCUMENTS_API = `/api/documents`;
const PASS_API = `/api/pass-schedule`;

/* ---------- Download helper ---------- */
async function downloadFrom(pathOrUrl: string, filename: string) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
  const token = getAuthToken();

  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const blob = await res.blob();
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

/* ---------- UI tokens ---------- */
const CONTROL_BG = "#1C1C1E";
const UI = {
  ctrlH: 30,
  font: 13,
  icon: 16,
  gap: 0.75,
  headerPx: 1.25,
  headerPy: 0.6,
  searchW: 260,
  paginationH: 36,
};

const CARD_SX = {
  bgcolor: "#1C1C1E",
  color: "#E8E8EA",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 2,
  height: "calc(100vh - 90px)",
  display: "flex",
  flexDirection: "column" as const,
};

const SCROLLER_SX = {
  scrollbarWidth: "thin",
  scrollbarColor: "#3f3f3f transparent",
  "&::-webkit-scrollbar": { width: 8, height: 8 },
  "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
};

const compactCtrlSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#544f4fff",
  },
  "& .MuiOutlinedInput-root": {
    height: `${UI.ctrlH}px`,
    color: "#fff",
    alignItems: "center",
  },
  "& .MuiInputBase-input": {
    height: `${UI.ctrlH - 2}px`,
    padding: "0 10px",
    fontSize: UI.font,
    lineHeight: 1,
    color: "#fff",
  },
  "& .MuiInputBase-input::placeholder": { color: "#fff", opacity: 1 },
  "& input::-webkit-input-placeholder": { color: "#fff", opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: UI.icon, color: "rgba(255,255,255,0.9)" },
};

const PRIMARY_BTN_SX = {
  textTransform: "none",
  fontWeight: 600,
  px: 1.4,
  py: 0.6,
  borderRadius: 1,
  bgcolor: "#7C57F2",
  color: "#fff",
  "& .MuiSvgIcon-root": { color: "#fff" },
  "&:hover": { bgcolor: "#5732d3ff" },
  "&.Mui-disabled": {
    bgcolor: "#2f2f33",
    color: "#b5b7bd",
    border: "1px solid rgba(255,255,255,0.14)",
    boxShadow: "none",
    opacity: 1,
  },
} as const;

const OUTLINED_BTN_SX = {
  textTransform: "none",
  fontWeight: 700,
  px: 1.4,
  py: 0.6,
  borderRadius: 1,
  bgcolor: "transparent",
  color: "#fff",
  border: "1px solid #ffffff99",
  "& .MuiSvgIcon-root": { color: "#fff" },
  "&:hover": { bgcolor: "rgba(255,255,255,0.06)", borderColor: "#fff" },
} as const;

/* ---------- Data ---------- */
const DOC_TYPES = [
  "License report",
  "Satellite report",
  "Passes report",
  "Project plan",
  "Flow chart",
  "Design Document",
  "User manual",
  "Other",
] as const;

type DocumentRow = {
  id: number;
  sr: number;
  name: string;
  type: string;
  remarks: string;
  url: string;
};

// type Column = {
//   key: keyof DocumentRow | "download" | "action";
//   label: string;
//   width?: number;
//   align?: "left" | "center" | "right";
// };

type Column = {
  key: keyof DocumentRow | "download" | "action";
  label: string;
  /** Optional fixed width (px). If present, the column does not flex. */
  width?: number;
  /** Responsive sizing: column may grow, but never below this px. */
  min?: number;
  /** If set, column takes this many “fractions” of leftover width. */
  flex?: number;
  align?: "left" | "center" | "right";
};

// const DOC_COLUMNS: Column[] = [
//   { key: "sr", label: "Sr No", width: 90, align: "center" },
//   { key: "name", label: "Document", width: 300, align: "left" },
//   { key: "type", label: "Doc Type", width: 220, align: "center" },
//   { key: "remarks", label: "Remarks", width: 320, align: "left" },
//   { key: "download", label: "Download", width: 90, align: "center" },
//   { key: "action", label: "Action", width: 140, align: "center" },
// ];

// const PASS_COLUMNS: Column[] = [
//   { key: "sr", label: "Sr No", width: 90, align: "center" },
//   { key: "name", label: "Document", width: 420, align: "left" },
//   { key: "remarks", label: "Remarks", width: 360, align: "left" },
//   { key: "download", label: "Download", width: 90, align: "center" },
//   { key: "action", label: "Action", width: 140, align: "center" },
// ];


const DOC_COLUMNS: Column[] = [
  { key: "sr",      label: "Sr No",     width: 60,  align: "center" },
  { key: "name",    label: "Document",  min: 220,   flex: 1.4, align: "left" },
  { key: "type",    label: "Doc Type",  min: 140,   flex: 1.0, align: "center" },
  { key: "remarks", label: "Remarks",   min: 200,   flex: 1.2, align: "left" },
  { key: "download",label: "Download",  width: 80,  align: "center" },
  { key: "action",  label: "Action",    width: 110, align: "center" },
];

// --- replace PASS_COLUMNS ---
const PASS_COLUMNS: Column[] = [
  { key: "sr",      label: "Sr No",     width: 60,  align: "center" },
  { key: "name",    label: "Document",  min: 260,   flex: 1.5, align: "left" },
  { key: "remarks", label: "Remarks",   min: 220,   flex: 1.2, align: "left" },
  { key: "download",label: "Download",  width: 80,  align: "center" },
  { key: "action",  label: "Action",    width: 110, align: "center" },
];

/* ---------- Reusable table ---------- */
// function DarkDocsTable({
//   rows,
//   columns,
//   onDownload,
//   onUpdate,
// }: {
//   rows: DocumentRow[];
//   columns: Column[];
//   onDownload: (r: DocumentRow) => void;
//   onUpdate: (r: DocumentRow) => void;
// }) {
//   const totalW = columns.reduce((acc, c) => acc + (c.width ?? 160), 0) + 16;

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
//             gridTemplateColumns: columns.map((c) => `${c.width ?? 160}px`).join(" "),
//             bgcolor: "#000",
//             borderBottom: "1px solid rgba(255,255,255,0.14)",
//           }}
//         >
//           {columns.map((c) => (
//             <Box
//               key={String(c.key)}
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
//             key={`${r.id}-${idx}`}
//             sx={{
//               display: "grid",
//               gridTemplateColumns: columns.map((c) => `${c.width ?? 160}px`).join(" "),
//               borderBottom: "1px solid rgba(255,255,255,0.08)",
//               bgcolor: idx % 2 ? "rgba(255,255,255,0.02)" : "transparent",
//             }}
//           >
//             {columns.map((c) => {
//               if (c.key === "download") {
//                 return (
//                   <Box
//                     key={`dl-${idx}`}
//                     sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}
//                   >
//                     <IconButton
//                       size="small"
//                       onClick={() => onDownload(r)}
//                       sx={{ color: "#E8E8EA", "&:hover": { color: "#ffffff" } }}
//                       aria-label="download"
//                     >
//                       <DownloadIcon />
//                     </IconButton>
//                   </Box>
//                 );
//               }
//               if (c.key === "action") {
//                 return (
//                   <Box
//                     key={`act-${idx}`}
//                     sx={{ px: 1.25, py: 0.75, display: "flex", justifyContent: "center", alignItems: "center" }}
//                   >
//                     <Button
//                       size="small"
//                       variant="contained"
//                       sx={{
//                         textTransform: "none",
//                         fontWeight: 700,
//                         fontSize: 12,
//                         px: 1.25,
//                         bgcolor: "#7C57F2",
//                         "&:hover": { bgcolor: "#6b48ea" },
//                       }}
//                       onClick={() => onUpdate(r)}
//                     >
//                       Update
//                     </Button>
//                   </Box>
//                 );
//               }
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
//                   title={String(r[c.key as keyof DocumentRow] ?? "")}
//                 >
//                   {r[c.key as keyof DocumentRow] as any}
//                 </Box>
//               );
//             })}
//           </Box>
//         ))}

//         {rows.length === 0 && (
//           <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>No rows to show yet.</Box>
//         )}
//       </Box>
//     </Box>
//   );
// }

function DarkDocsTable({
  rows,
  columns,
  onDownload,
  onUpdate,
}: {
  rows: DocumentRow[];
  columns: Column[];
  onDownload: (r: DocumentRow) => void;
  onUpdate: (r: DocumentRow) => void;
}) {
  // total minimum width so the grid doesn't collapse when the card is wide
  const totalMinW =
    columns.reduce((acc, c) => acc + (c.width ?? c.min ?? 120), 0) + 16;

  // build a responsive grid template: fixed px when width is set, otherwise minmax(min, flex fr)
  const template = columns
    .map((c) =>
      c.width != null
        ? `${c.width}px`
        : `minmax(${c.min ?? 120}px, ${c.flex ?? 1}fr)`
    )
    .join(" ");

  const headerCellSx = {
    px: 0.75,         // tighter than 1.25
    py: 0.75,
    fontWeight: 700,
    fontSize: 13,
    color: "#fff",
    whiteSpace: "nowrap" as const,
  };

  const bodyCellSx = {
    px: 0.75,
    py: 0.75,
    fontSize: 13,
    color: "#EAEAEA",
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  return (
    <Box>
      <Box sx={{ width: totalMinW, minWidth: "100%" }}>
        {/* header */}
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            display: "grid",
            gridTemplateColumns: template,
            bgcolor: "#000",
            borderBottom: "1px solid rgba(255,255,255,0.14)",
          }}
        >
          {columns.map((c) => (
            <Box
              key={String(c.key)}
              sx={{ ...headerCellSx, textAlign: c.align ?? "center" }}
            >
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
              if (c.key === "download") {
                return (
                  <Box
                    key={`dl-${idx}`}
                    sx={{
                      ...bodyCellSx,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onDownload(r)}
                      sx={{ color: "#E8E8EA", "&:hover": { color: "#ffffff" } }}
                      aria-label="download"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Box>
                );
              }
              if (c.key === "action") {
                return (
                  <Box
                    key={`act-${idx}`}
                    sx={{
                      ...bodyCellSx,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        fontSize: 12,
                        px: 1.1,
                        bgcolor: "#7C57F2",
                        "&:hover": { bgcolor: "#6b48ea" },
                      }}
                      onClick={() => onUpdate(r)}
                    >
                      Update
                    </Button>
                  </Box>
                );
              }
              return (
                <Box
                  key={String(c.key)}
                  sx={{ ...bodyCellSx, textAlign: c.align ?? "center" }}
                  title={String(r[c.key as keyof DocumentRow] ?? "")}
                >
                  {r[c.key as keyof DocumentRow] as any}
                </Box>
              );
            })}
          </Box>
        ))}

        {rows.length === 0 && (
          <Box sx={{ px: 1.25, py: 2, color: "#aaa", textAlign: "center" }}>
            No rows to show yet.
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ---------- Page ---------- */
export default function DocumentsPage() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin"); // ✅ Only admins can upload PASS schedule

  const [tab, setTab] = React.useState<"docs" | "pass">("docs");

  // header state
  const [docTypeFilter, setDocTypeFilter] = React.useState<string>("");
  const [docsSearch, setDocsSearch] = React.useState("");
  const [passSearch, setPassSearch] = React.useState("");

  // uploads (docs)
  const [uploadType, setUploadType] = React.useState<string>("");
  const [uploadRemarks, setUploadRemarks] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  // uploads (pass schedule)
  const [passRemarks, setPassRemarks] = React.useState("");
  const [passFile, setPassFile] = React.useState<File | null>(null);

  // rows
  const [docRows, setDocRows] = React.useState<DocumentRow[]>([]);
  const [passRows, setPassRows] = React.useState<DocumentRow[]>([]);

  // pagination
  const [docsPage, setDocsPage] = React.useState(0);
  const [docsRpp, setDocsRpp] = React.useState(10);
  const [passPage, setPassPage] = React.useState(0);
  const [passRpp, setPassRpp] = React.useState(10);

  // modals
  const [editDoc, setEditDoc] = React.useState<DocModalRow | null>(null);
  const [editPass, setEditPass] = React.useState<PassModalRow | null>(null);

  // file handlers
  const handleFilePickDocs = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null);
  const handleFilePickPass = (e: React.ChangeEvent<HTMLInputElement>) => setPassFile(e.target.files?.[0] ?? null);
  const clearDocsFile = () => {
    setFile(null);
    const el = document.getElementById("doc-file-input") as HTMLInputElement | null;
    if (el) el.value = "";
  };
  const clearPassFile = () => {
    setPassFile(null);
    const el = document.getElementById("pass-file-input") as HTMLInputElement | null;
    if (el) el.value = "";
  };

  // fetchers
  const refreshDocs = React.useCallback(async () => {
    try {
      const data = await api.get<any[]>(DOCUMENTS_API);
      const mapped: DocumentRow[] = (data || []).map((row: any, i: number) => ({
        id: row.id,
        sr: i + 1,
        name: row.document_name,
        type: row.doc_type,
        remarks: row.remarks || "",
        url: `${DOCUMENTS_API}/${row.id}/download`,
      }));
      setDocRows(mapped);
    } catch (e) {
      console.error("Fetch documents failed:", e);
    }
  }, []);

  const refreshPass = React.useCallback(async () => {
    try {
      const data = await api.get<any[]>(PASS_API);
      const mapped: DocumentRow[] = (data || []).map((row: any, i: number) => ({
        id: row.id,
        sr: i + 1,
        name: row.document_name,
        type: "",
        remarks: row.remarks || "",
        url: `${PASS_API}/${row.id}/download`,
      }));
      setPassRows(mapped);
    } catch (e) {
      console.error("Fetch passes failed:", e);
    }
  }, []);

  React.useEffect(() => {
    refreshDocs();
    refreshPass();
  }, [refreshDocs, refreshPass]);

  // uploads
  const canUploadDoc = !!file && !!uploadType;
  const canUploadPass = isAdmin && !!passFile; // ✅ admin only

  const doUploadDoc = async () => {
    if (!canUploadDoc || !file) return;
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("doc_type", uploadType);
      if (uploadRemarks.trim()) form.append("remarks", uploadRemarks.trim());

      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}${DOCUMENTS_API}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);

      await refreshDocs();
      clearDocsFile();
      setUploadType("");
      setUploadRemarks("");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to upload document");
    }
  };

  const doUploadPass = async () => {
    if (!isAdmin) {
      alert("Only admins can upload the passes schedule.");
      return;
    }
    if (!canUploadPass || !passFile) return;
    try {
      const form = new FormData();
      form.append("file", passFile);
      if (passRemarks.trim()) form.append("remarks", passRemarks.trim());

      const token = getAuthToken();
      const res = await fetch(`${BASE_URL}${PASS_API}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);

      await refreshPass();
      clearPassFile();
      setPassRemarks("");
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to upload pass schedule file");
    }
  };

  // filtering + paging
  const docsFiltered = React.useMemo(() => {
    const q = docsSearch.trim().toLowerCase();
    return docRows.filter((r) => {
      const matchesType = !docTypeFilter || r.type === docTypeFilter;
      if (!q) return matchesType;
      const hay = [r.name, r.type, r.remarks].join(" ").toLowerCase();
      return matchesType && hay.includes(q);
    });
  }, [docRows, docsSearch, docTypeFilter]);

  const passFiltered = React.useMemo(() => {
    const q = passSearch.trim().toLowerCase();
    return passRows.filter((r) => {
      if (!q) return true;
      const hay = [r.name, r.remarks].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [passRows, passSearch]);

  const docsPaged = React.useMemo(
    () => docsFiltered.slice(docsPage * docsRpp, docsPage * docsRpp + docsRpp),
    [docsFiltered, docsPage, docsRpp]
  );
  const passPaged = React.useMemo(
    () => passFiltered.slice(passPage * passRpp, passPage * passRpp + passRpp),
    [passFiltered, passPage, passRpp]
  );

  // handlers
  const onDownload = async (r: DocumentRow) => {
    try {
      await downloadFrom(r.url, r.name);
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Download failed");
    }
  };

  // const onUpdate = (r: DocumentRow) => {
  //   if (tab === "docs") {
  //     setEditDoc({ id: r.id, name: r.name, type: r.type, remarks: r.remarks });
  //   } else {
  //     setEditPass({ id: r.id, name: r.name, remarks: r.remarks });
  //   }
  // };

  const handleTab = (_e: React.MouseEvent<HTMLElement>, next: "docs" | "pass" | null) => {
    if (next) setTab(next);
  };

  return (
    <MainLayout title="Documents ">
      <Box sx={{ p: 2 }}>
        <Card sx={CARD_SX}>
          {/* Header */}
          <Box
            sx={{
              px: UI.headerPx,
              py: UI.headerPy,
              borderBottom: "1px solid rgba(255,255,255,0.12)",
              display: "grid",
              alignItems: "center",
              gridTemplateColumns: "auto 1fr auto auto",
              columnGap: UI.gap,
            }}
          >
            <ToggleButtonGroup
              value={tab}
              exclusive
              onChange={handleTab}
              sx={{
                p: 0.5,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.14)",
                bgcolor: "#171718",
                "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
              }}
            >
              <ToggleButton value="docs" disableRipple sx={toggleBtnSx}>
                Documents
              </ToggleButton>
              <ToggleButton value="pass" disableRipple sx={toggleBtnSx}>
                Passes Schedule
              </ToggleButton>
            </ToggleButtonGroup>

            <Box />

            {tab === "docs" ? (
              <>
                <FormControl size="small" sx={{ minWidth: 160, ...compactCtrlSx }}>
                  <Select
                    value={docTypeFilter}
                    onChange={(e) => {
                      setDocTypeFilter(String(e.target.value));
                      setDocsPage(0);
                    }}
                    displayEmpty
                    renderValue={(v) => (v ? String(v) : "Select Type")}
                    sx={{ "& .MuiOutlinedInput-input": { pl: 1 }, "& .MuiSelect-select": { textAlign: "left" } }}
                    MenuProps={darkMenu}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    {DOC_TYPES.map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  value={docsSearch}
                  onChange={(e) => {
                    setDocsSearch(e.target.value);
                    setDocsPage(0);
                  }}
                  placeholder="Search…"
                  size="small"
                  sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0.25 }}>
                        <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,0.75)" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            ) : (
              <>
                <TextField
                  value={passSearch}
                  onChange={(e) => {
                    setPassSearch(e.target.value);
                    setPassPage(0);
                  }}
                  placeholder="Search…"
                  size="small"
                  sx={{ width: UI.searchW, ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ mr: 0.25 }}>
                        <SearchIcon sx={{ fontSize: UI.icon, color: "rgba(255,255,255,0.75)" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
          </Box>

          {/* Upload rows */}
          {tab === "docs" ? (
            <>
              {/* Documents upload (unchanged) */}
              <Box
                sx={{
                  px: 1.25,
                  py: 1,
                  display: "grid",
                  gridTemplateColumns: "auto 160px 240px auto auto auto",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontWeight: 600, fontSize: 18 }}>Upload Documents</Typography>

                <FormControl size="small" sx={{ minWidth: 160, ...compactCtrlSx }}>
                  <Select
                    value={uploadType}
                    onChange={(e) => setUploadType(String(e.target.value))}
                    displayEmpty
                    renderValue={(v) => (v ? String(v) : "Select Type")}
                    sx={{ "& .MuiOutlinedInput-input": { pl: 1 }, "& .MuiSelect-select": { textAlign: "left" } }}
                    MenuProps={darkMenu}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    {[
                      "License report",
                      "Satellite report",
                      "Passes report",
                      "Project plan",
                      "Flow chart",
                      "Design Document",
                      "User manual",
                      "Other",
                    ].map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                  placeholder="Remarks"
                  size="small"
                  sx={{ ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                />

                <Box>
                  <input id="doc-file-input" type="file" style={{ display: "none" }} onChange={handleFilePickDocs} />
                  <label htmlFor="doc-file-input">
                    <Button component="span" sx={OUTLINED_BTN_SX}>
                      Select File
                    </Button>
                  </label>
                </Box>

                <Box sx={{ minHeight: UI.ctrlH, display: "flex", alignItems: "center" }}>
                  {file ? (
                    <Chip
                      variant="outlined"
                      color="default"
                      onDelete={clearDocsFile}
                      deleteIcon={<CloseRoundedIcon sx={{ color: "#bbb" }} />}
                      label={file.name}
                      title={file.name}
                      sx={{
                        borderColor: "rgba(255,255,255,0.22)",
                        color: "#E8E8EA",
                        bgcolor: "transparent",
                        width: 120,
                        "& .MuiChip-label": { width: 120, overflow: "hidden", textOverflow: "ellipsis" },
                      }}
                    />
                  ) : null}
                </Box>

                <Button onClick={doUploadDoc} disabled={!canUploadDoc} startIcon={<CloudUploadIcon />} sx={PRIMARY_BTN_SX}>
                  Upload
                </Button>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
            </>
          ) : (
            <>
              {/* ✅ Passes Schedule upload — ADMIN ONLY */}
              {isAdmin && (
                <>
                  <Box
                    sx={{
                      px: 1.25,
                      py: 1,
                      display: "grid",
                      gridTemplateColumns: "auto auto auto 1fr auto",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600, fontSize: 18 }}>Upload Passes Schedule</Typography>

                    <Box>
                      <input id="pass-file-input" type="file" style={{ display: "none" }} onChange={handleFilePickPass} />
                      <label htmlFor="pass-file-input">
                        <Button component="span" sx={OUTLINED_BTN_SX}>
                          Select File
                        </Button>
                      </label>
                    </Box>

                    <Box sx={{ minHeight: UI.ctrlH, display: "flex", alignItems: "center" }}>
                      {passFile ? (
                        <Chip
                          variant="outlined"
                          color="default"
                          onDelete={clearPassFile}
                          deleteIcon={<CloseRoundedIcon sx={{ color: "#bbb" }} />}
                          label={passFile.name}
                          title={passFile.name}
                          sx={{
                            borderColor: "rgba(255,255,255,0.22)",
                            color: "#E8E8EA",
                            bgcolor: "transparent",
                            width: 120,
                            "& .MuiChip-label": { width: 120, overflow: "hidden", textOverflow: "ellipsis" },
                          }}
                        />
                      ) : null}
                    </Box>

                    <TextField
                      value={passRemarks}
                      onChange={(e) => setPassRemarks(e.target.value)}
                      placeholder="Remarks"
                      size="small"
                      sx={{ ...compactCtrlSx, "& .MuiOutlinedInput-root": { pl: 1 } }}
                    />

                    <Button
                      onClick={doUploadPass}
                      disabled={!canUploadPass}
                      startIcon={<CloudUploadIcon />}
                      sx={PRIMARY_BTN_SX}
                    >
                      Upload
                    </Button>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.12)" }} />
                </>
              )}
            </>
          )}

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1, pt: 1, pb: 0.5 }}>
            <Box sx={{ height: "100%", borderRadius: 1, overflow: "hidden" }}>
              <Box sx={{ height: "100%", overflow: "auto", pr: 1, ...SCROLLER_SX }}>
                {tab === "docs" ? (
                  <DarkDocsTable
                    rows={docsPaged}
                    columns={DOC_COLUMNS}
                    onDownload={onDownload}
                    onUpdate={(r) => setEditDoc({ id: r.id, name: r.name, type: r.type, remarks: r.remarks })}
                  />
                ) : (
                  <DarkDocsTable
                    rows={passPaged}
                    columns={PASS_COLUMNS}
                    onDownload={onDownload}
                    onUpdate={(r) => setEditPass({ id: r.id, name: r.name, remarks: r.remarks })}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Pagination */}
          <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            {tab === "docs" ? (
              <TablePagination
                component="div"
                count={docsFiltered.length}
                page={docsPage}
                onPageChange={(_, p) => setDocsPage(p)}
                rowsPerPage={docsRpp}
                onRowsPerPageChange={(e) => {
                  setDocsRpp(parseInt(e.target.value, 10));
                  setDocsPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={paginationSx}
              />
            ) : (
              <TablePagination
                component="div"
                count={passFiltered.length}
                page={passPage}
                onPageChange={(_, p) => setPassPage(p)}
                rowsPerPage={passRpp}
                onRowsPerPageChange={(e) => {
                  setPassRpp(parseInt(e.target.value, 10));
                  setPassPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={paginationSx}
              />
            )}
          </Box>
        </Card>
      </Box>

      {/* Modals */}
      <UpdateDocumentModal open={!!editDoc} row={editDoc} onClose={() => setEditDoc(null)} onSuccess={refreshDocs} />
      <UpdatePassModal open={!!editPass} row={editPass} onClose={() => setEditPass(null)} onSuccess={refreshPass} />
    </MainLayout>
  );
}

/* ---------- small style helpers ---------- */
const toggleBtnSx = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: 13,
  px: 2,
  height: 32,
  lineHeight: "32px",
  borderRadius: 999,
  color: "rgba(255,255,255,0.72)",
  "&.Mui-selected": {
    color: "#7CFF8D",
    bgcolor: "#0E0E10",
    border: "1px solid rgba(124,255,141,0.18)",
    boxShadow: "inset 0 0 0 1px rgba(124,255,141,0.10)",
  },
};

const darkMenu = {
  PaperProps: {
    sx: {
      bgcolor: "#1C1C1E",
      color: "#E8E8EA",
      border: "1px solid rgba(255,255,255,0.14)",
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: "rgba(255,255,255,0.08)" },
      "& .MuiMenuItem-root:hover": { bgcolor: "rgba(255,255,255,0.06)" },
    },
  },
};

const paginationSx = {
  px: 1,
  color: "#E8E8EA",
  minHeight: UI.paginationH,
  "& .MuiTablePagination-toolbar": { minHeight: UI.paginationH, p: 0, pl: 1, pr: 1, gap: 0.5 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: UI.font, m: 0 },
  "& .MuiTablePagination-input": { fontSize: UI.font, m: 0 },
  "& .MuiSelect-select": {
    py: 0,
    px: 1,
    fontSize: UI.font,
    height: UI.ctrlH - 6,
    display: "flex",
    alignItems: "center",
    bgcolor: CONTROL_BG,
    borderRadius: 1,
  },
  "& .MuiIconButton-root": { p: 0.25 },
  ".MuiSvgIcon-root": { color: "#E8E8EA", fontSize: UI.icon },
};
