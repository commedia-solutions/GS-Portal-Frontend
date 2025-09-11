import * as React from "react";
import {
  Box,
  Button,
  Card,
  TablePagination,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import UpdateOperationRequesterDialog, { type OperationRequesterRow } from "../components/UpdateOperationRequesterDialog";
import UpdateOperationDialog, { type OperationRow } from "../components/UpdateOperationDialog";
// import UpdateOperationSupporterDialog, { type OperationSupporterRow } from "../components/UpdateOperationSupporterDialog";
import UpdateOperationSupporterDialog from "../components/UpdateOperationSupporterDialog";
import type { OperationSupporterRow } from "../components/UpdateOperationSupporterDialog";

import { api } from "../api/http";


/* ---------------- Styles ---------------- */
const CARD_SX = {
  bgcolor: "#1C1C1E",
  color: "#E8E8EA",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
} as const;

const CONTROL_BG = "#1C1C1E";
const PRIMARY = "#7C57F2";

const SCROLLER_Y = {
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarWidth: "thin",
  scrollbarColor: "#3f3f3f transparent",
  "&::-webkit-scrollbar": { width: 8 },
  "&::-webkit-scrollbar-thumb": { background: "#3f3f3f", borderRadius: 8 },
  "&::-webkit-scrollbar-thumb:hover": { background: "#5a5a5a" },
  "&::-webkit-scrollbar-track": { background: "transparent" },
};

const addBarInputSx = {
  bgcolor: CONTROL_BG,
  borderRadius: 1,
  color: "#fff",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#454444ff" },
  "& .MuiOutlinedInput-root": { height: 30, color: "#fff" },
  "& .MuiInputBase-input": { height: 28, padding: "0 10px", fontSize: 13, lineHeight: 1, color: "#fff" },
  "& .MuiInputBase-input::placeholder": { color: "#b5b7bd", opacity: 1 },
};

const TABLE_COLS = "80px 1.5fr 1fr 120px";

/* ---------------- API base + types ---------------- */


type TabKey = "requesters" | "operations" | "supporters";
type Row = { id: number; name: string; addedBy: string };

type ApiOperation  = { id: number; operation_name: string; added_by: string };
type ApiRequester  = { id: number; requester_name: string; added_by: string };
type ApiSupporter  = { id: number; supporter_name: string; added_by: string };

const opApiToRow  = (a: ApiOperation): Row => ({ id: a.id, name: a.operation_name,  addedBy: a.added_by });
const reqApiToRow = (a: ApiRequester): Row => ({ id: a.id, name: a.requester_name,  addedBy: a.added_by });
const supApiToRow = (a: ApiSupporter): Row => ({ id: a.id, name: a.supporter_name,  addedBy: a.added_by });

/* ---------------- Component ---------------- */
export default function Operations() {
  // initial tab from ?tab=
  const initialTab = (new URLSearchParams(window.location.search).get("tab") ?? "requesters") as TabKey;
  const [tab, setTab] = React.useState<TabKey>(initialTab);

  // data lists
  const [requesters, setRequesters] = React.useState<Row[]>([]);
  const [ops, setOps] = React.useState<Row[]>([]);
  const [supporters, setSupporters] = React.useState<Row[]>([]);

  // add-bar state
  const [newName, setNewName] = React.useState("");

  // paging
  const [page, setPage] = React.useState(0);
  const [rpp, setRpp] = React.useState(20);

  /* --------- Loaders --------- */
  const loadOps = React.useCallback(async () => {
  try {
    const json = await api.get<{ total?: number; data: ApiOperation[] }>(
      "/api/operations?limit=1000&sort_by=operation_name&sort_order=asc"
    );
    setOps((json?.data ?? []).map(opApiToRow));
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to load operations");
  }
}, []);

const loadRequesters = React.useCallback(async () => {
  try {
    const json = await api.get<{ total?: number; data: ApiRequester[] }>(
      "/api/operation-requesters?limit=1000&sort_by=requester_name&sort_order=asc"
    );
    setRequesters((json?.data ?? []).map(reqApiToRow));
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to load operation requesters");
  }
}, []);

const loadSupporters = React.useCallback(async () => {
  try {
    const json = await api.get<{ total?: number; data: ApiSupporter[] }>(
      "/api/operation-supporters?limit=1000&sort_by=supporter_name&sort_order=asc"
    );
    setSupporters((json?.data ?? []).map(supApiToRow));
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to load operation supporters");
  }
}, []);

  React.useEffect(() => {
    loadOps();
    loadRequesters();
    loadSupporters();
  }, [loadOps, loadRequesters, loadSupporters]);

  /* --------- UI helpers --------- */
  const handleTab = (_: React.SyntheticEvent, next: TabKey | null) => {
    if (!next) return;
    setTab(next);
    setPage(0);
    setNewName("");
  };

  const sortByName = (rows: Row[]) =>
  [...rows].sort((a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }));

  const current = tab === "requesters" ? requesters : tab === "operations" ? ops : supporters;
  const paged = current.slice(page * rpp, page * rpp + rpp);

  const headerTitle =
    tab === "requesters" ? "Operation Requesters" : tab === "operations" ? "Operations" : "Operation Supporters";

  const addPlaceholder =
    tab === "requesters" ? "Operation Requester name" : tab === "operations" ? "Operation name" : "Supporter name";

  const nameColumnHeader =
    tab === "requesters" ? "Operation Requester" : tab === "operations" ? "Operation" : "Operation Supporter";

  /* --------- Add (POST) --------- */
  const handleAdd = async () => {
  const name = newName.trim();
  if (!name) return;

  try {
    if (tab === "operations") {
      const created = await api.post<ApiOperation>("/api/operations", {
        operation_name: name,
        added_by: "Admin",
      });
      setOps((cur) => sortByName([...cur, opApiToRow(created)]));
    } else if (tab === "requesters") {
      const created = await api.post<ApiRequester>("/api/operation-requesters", {
        requester_name: name,
        added_by: "Admin",
      });
      setRequesters((cur) => sortByName([...cur, reqApiToRow(created)]));
    } else {
      const created = await api.post<ApiSupporter>("/api/operation-supporters", {
        supporter_name: name,
        added_by: "Admin",
      });
      setSupporters((cur) => sortByName([...cur, supApiToRow(created)]));
    }

    setNewName("");
    alert("Added successfully ✅");
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to add ❌");
  }
};

  /* --------- Modals + API wiring --------- */
  const [reqOpen, setReqOpen] = React.useState(false);
  const [reqRow, setReqRow] = React.useState<OperationRequesterRow | null>(null);

  const [opOpen, setOpOpen] = React.useState(false);
  const [opRow, setOpRow] = React.useState<OperationRow | null>(null);

  const [supOpen, setSupOpen] = React.useState(false);
  const [supRow, setSupRow] = React.useState<OperationSupporterRow | null>(null);

  const openDialogFor = (row: Row) => {
    if (tab === "requesters") {
      setReqRow({ id: row.id, name: row.name, addedBy: row.addedBy });
      setReqOpen(true);
    } else if (tab === "operations") {
      setOpRow({ id: row.id, name: row.name, addedBy: row.addedBy });
      setOpOpen(true);
    } else {
      setSupRow({ id: row.id, name: row.name, addedBy: row.addedBy });
      setSupOpen(true);
    }
  };

  // Helpers to update/remove list locally
  const replaceIn = (list: Row[], updated: Row) => list.map((r) => (r.id === updated.id ? updated : r));
  const removeFrom = (list: Row[], id: number) => list.filter((r) => r.id !== id);

  // --- Requester modal actions (PUT/DELETE)
 const saveRequester = async (u: OperationRequesterRow) => {
  try {
    const data = await api.put<ApiRequester>(`/api/operation-requesters/${u.id}`, {
      requester_name: u.name,
      added_by: u.addedBy || "Admin",
    });
    setRequesters((cur) => replaceIn(cur, reqApiToRow(data)));
    alert("Requester updated ✅");
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to update requester ❌");
  }
};
const deleteRequester = async (d: OperationRequesterRow) => {
  try {
    await api.del(`/api/operation-requesters/${d.id}`);
    setRequesters((cur) => removeFrom(cur, d.id));
    alert("Requester deleted ✅");
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to delete requester ❌");
  }
};
  // --- Operation modal actions (PUT/DELETE)
  const saveOperation = async (u: OperationRow) => {
  try {
    const data = await api.put<ApiOperation>(`/api/operations/${u.id}`, {
      operation_name: u.name,
      added_by: u.addedBy || "Admin",
    });
    setOps((cur) => replaceIn(cur, opApiToRow(data)));
    alert("Operation updated ✅");
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to update operation ❌");
  }
};
const deleteOperation = async (d: OperationRow) => {
  try {
    await api.del(`/api/operations/${d.id}`);
    setOps((cur) => removeFrom(cur, d.id));
    alert("Operation deleted ✅");
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to delete operation ❌");
  }
};
  // --- Supporter modal actions (PUT/DELETE)
  const saveSupporter = async (u: OperationSupporterRow) => {
  try {
    const data = await api.put<ApiSupporter>(`/api/operation-supporters/${u.id}`, {
      supporter_name: u.name,
      added_by: u.addedBy || "Admin",
    });
    setSupporters((cur) => replaceIn(cur, supApiToRow(data)));
    alert("Supporter updated ✅");
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to update supporter ❌");
  }
};
const deleteSupporter = async (d: OperationSupporterRow) => {
  try {
    await api.del(`/api/operation-supporters/${d.id}`);
    setSupporters((cur) => removeFrom(cur, d.id));
    alert("Supporter deleted ✅");
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to delete supporter ❌");
  }
};

  return (
    <MainLayout title="Operations">
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
        {/* Tabs */}
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
            { key: "requesters", label: "Operation Requesters" },
            { key: "operations", label: "Operations" },
            { key: "supporters", label: "Operation Supporters" },
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

        {/* Card */}
        <Card sx={{ ...CARD_SX, height: "100%" }}>
          {/* Header */}
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
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
              {headerTitle}
            </Typography>
          </Box>

          {/* Add bar */}
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
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.72)", mr: 0.75 }}>
              {`Add ${tab === "requesters" ? "Requester" : tab === "operations" ? "Operation" : "Supporter"}`}
            </Typography>
            <TextField
              placeholder={addPlaceholder}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              size="small"
              sx={{ ...addBarInputSx, width: 280 }}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={!newName.trim()}
              sx={{ textTransform: "none", fontWeight: 700, height: 32, bgcolor: PRIMARY, "&:hover": { bgcolor: "#6b46f1" } }}
            >
              Add
            </Button>
          </Box>

          {/* Table */}
          <Box sx={{ flex: 1, minHeight: 0, px: 1, ...SCROLLER_Y, pb: 1 }}>
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: TABLE_COLS,
                bgcolor: "#000",
                borderBottom: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              {["Sr No", nameColumnHeader, "Added By", "Action"].map((label) => (
                <Box
                  key={label}
                  sx={{ px: 1.25, py: 1, fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center" }}
                >
                  {label}
                </Box>
              ))}
            </Box>

            {paged.map((r, idx) => (
              <Box
                key={`${r.id}-${r.name}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: TABLE_COLS,
                  alignItems: "center",
                  borderBottom: "1px solid rgba(255,255,255,0.08)",
                  bgcolor: (page * rpp + idx) % 2 ? "rgba(255,255,255,0.02)" : "transparent",
                }}
              >
                {/* Running count, not DB id */}
                <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>
                  {page * rpp + idx + 1}
                </Box>

                <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.name}</Box>
                <Box sx={{ px: 1.25, py: 1, textAlign: "center", fontSize: 13 }}>{r.addedBy}</Box>
                <Box sx={{ px: 1.25, py: 0.75, textAlign: "center" }}>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => openDialogFor(r)}
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
              count={current.length}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={rpp}
              onRowsPerPageChange={(e) => {
                setRpp(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 20, 50]}
              sx={{
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
                  bgcolor: CONTROL_BG,
                  borderRadius: 1,
                },
                "& .MuiIconButton-root": { p: 0.25 },
                ".MuiSvgIcon-root": { fontSize: 16, color: "#E8E8EA" },
              }}
            />
          </Box>
        </Card>
      </Box>

      {/* Modals */}
      <UpdateOperationRequesterDialog
        open={reqOpen}
        row={reqRow}
        onClose={() => setReqOpen(false)}
        onSave={async (u) => {
          await saveRequester(u);
          setReqOpen(false);
        }}
        onDelete={async (d) => {
          await deleteRequester(d);
          setReqOpen(false);
        }}
      />

      <UpdateOperationDialog
        open={opOpen}
        row={opRow}
        onClose={() => setOpOpen(false)}
        onSave={async (u) => {
          await saveOperation(u);
          setOpOpen(false);
        }}
        onDelete={async (d) => {
          await deleteOperation(d);
          setOpOpen(false);
        }}
      />

      <UpdateOperationSupporterDialog
        open={supOpen}
        row={supRow}
        onClose={() => setSupOpen(false)}
        onSave={async (u) => {
          await saveSupporter(u);
          setSupOpen(false);
        }}
        onDelete={async (d) => {
          await deleteSupporter(d);
          setSupOpen(false);
        }}
      />
    </MainLayout>
  );
}
