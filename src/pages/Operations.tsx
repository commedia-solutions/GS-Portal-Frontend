// src/pages/Operations.tsx
import * as React from "react";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TablePagination,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";

import UpdateOperationRequesterDialog, {
  type OperationRequesterRow,
} from "../components/UpdateOperationRequesterDialog";
import UpdateOperationDialog, {
  type OperationRow,
} from "../components/UpdateOperationDialog";
import UpdateOperationSupporterDialog, {
  type OperationSupporterRow,
} from "../components/UpdateOperationSupporterDialog";

/* i18n */
import { useI18n } from "../i18n";

/* theme bridge (dark/light aware) */
import { vars, sxPresets } from "../ui/toast/themeBridge";
import type { Theme } from "@mui/material/styles";

/* -------------------------------- Styles -------------------------------- */

const CARD_SX = {
  ...sxPresets.card,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column" as const,
  backgroundImage: "none",
} as const;

/* IAM-like: table head strip + text colors */
const theadBg = (t: Theme) => (t.palette.mode === "dark" ? vars.bgApp : "#464b4e");
const theadText = (t: Theme) => (t.palette.mode === "light" ? "#fff" : vars.text);
const bodyText = (t: Theme) => (t.palette.mode === "light" ? "#000" : vars.text);

/* IAM pill behavior for tabs (light: white chip + green border; dark: dark chip) */
const GREEN = "#7CFF8D";
const GREEN_BORDER_DARK = "rgba(124,255,141,0.18)";
const SELECTED_BG_DARK = "#0E0E10";
const SELECTED_BG_LIGHT = "#FFFFFF";
const getSelectedBg = (t: Theme) => (t.palette.mode === "dark" ? SELECTED_BG_DARK : SELECTED_BG_LIGHT);
const getSelectedBord = (t: Theme) => (t.palette.mode === "dark" ? GREEN_BORDER_DARK : GREEN);
const getHoverBg = (t: Theme) => (t.palette.mode === "dark" ? vars.bgHover : "#FFFFFF");

const pillSx = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: 13,
  px: 2,
  height: 32,
  lineHeight: "32px",
  borderRadius: 999,
  color: vars.textDim,
  bgcolor: "transparent",
  "&.Mui-selected": {
    color: GREEN,
    bgcolor: (t: Theme) => getSelectedBg(t),
    border: (t: Theme) => `1px solid ${getSelectedBord(t)}`,
    boxShadow: (t: Theme) =>
      t.palette.mode === "dark"
        ? "inset 0 0 0 1px rgba(124,255,141,0.06)"
        : "inset 0 0 0 1px rgba(124,255,141,0.12)",
  },
  "&.Mui-selected:hover": { bgcolor: (t: Theme) => getHoverBg(t) },
} as const;

const CONTROL_BG = vars.bgCtrl;
const PRIMARY = "#7C57F2";

const addBarInputSx = {
  ...sxPresets.ctrl,
  borderRadius: 1,
  "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiOutlinedInput-root": { height: 30, color: vars.text, bgcolor: CONTROL_BG },
  "& .MuiInputBase-input": {
    height: 28,
    padding: "0 10px",
    fontSize: 13,
    lineHeight: 1,
    color: vars.text,
  },
  "& .MuiInputBase-input::placeholder": { color: vars.textDim, opacity: 1 },
} as const;

/** Keep action column fixed so text never pushes out of the card */
const TABLE_COLS = "80px minmax(0,1.6fr) minmax(0,1fr) 120px";

const headerCellSx = {
  px: 1.25,
  py: 1,
  fontWeight: 700,
  fontSize: 13,
  textAlign: "center" as const,
  color: (t: any) => theadText(t as Theme),
};

const cellSx = {
  px: 1.25,
  py: 1,
  textAlign: "center" as const,
  fontSize: 13,
  color: (t: any) => bodyText(t as Theme),
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
};

const tabsWrapSx = {
  p: 0.5,
  borderRadius: 999,
  border: `1px solid ${vars.border}`,
  bgcolor: vars.bgCard,
  width: "fit-content",
  "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
} as const;

/* Pagination adopts IAM: black text in light, regular vars in dark */
const paginationSx = {
  color: (t: any) => bodyText(t as Theme),
  "& .MuiTablePagination-toolbar": { minHeight: 36, p: 0 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
    m: 0,
    fontSize: 13,
    color: (t: any) => bodyText(t as Theme),
  },
  "& .MuiTablePagination-input": { m: 0, fontSize: 13, color: (t: any) => bodyText(t as Theme) },
  "& .MuiSelect-select": {
    py: 0,
    px: 1,
    height: 28,
    display: "flex",
    alignItems: "center",
    bgcolor: CONTROL_BG,
    borderRadius: 1,
  },
  "& .MuiIconButton-root": { p: 0.25, color: (t: any) => bodyText(t as Theme) },
  ".MuiSvgIcon-root": { fontSize: 16, color: (t: any) => bodyText(t as Theme) },
} as const;

const SCROLLER_SX = sxPresets.scroller;

/* ---------------- API base + types ---------------- */

import { api } from "../api/http";

type TabKey = "requesters" | "operations" | "supporters";
type Row = { id: number; name: string; addedBy: string };

type ApiOperation = { id: number; operation_name: string; added_by: string };
type ApiRequester = { id: number; requester_name: string; added_by: string };
type ApiSupporter = { id: number; supporter_name: string; added_by: string };

const opApiToRow = (a: ApiOperation): Row => ({ id: a.id, name: a.operation_name, addedBy: a.added_by });
const reqApiToRow = (a: ApiRequester): Row => ({ id: a.id, name: a.requester_name, addedBy: a.added_by });
const supApiToRow = (a: ApiSupporter): Row => ({ id: a.id, name: a.supporter_name, addedBy: a.added_by });

/* ---------------- CAPTCHA (same generator/logic as Requests) ---------------- */

type Captcha = { text: string; svg: string };

const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const pick = (chars: string, n: number) => {
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
};
function makeCaptcha(width = 220, height = 80, length = 5): Captcha {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const text = pick(alphabet, length);
  const charW = width / (length + 1);
  const chars = [...text]
    .map((ch, i) => {
      const x = (i + 1) * charW + rand(-6, 6);
      const y = height / 2 + rand(-5, 5);
      const r = rand(-24, 24);
      const fontSize = rand(30, 38);
      return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="700" text-anchor="middle"
               dominant-baseline="middle" transform="rotate(${r} ${x} ${y})">${ch}</text>`;
    })
    .join("");
  const lines = Array.from({ length: 4 })
    .map(() => {
      const x1 = rand(0, width),
        y1 = rand(0, height),
        x2 = rand(0, width),
        y2 = rand(0, height);
      const op = rand(0.25, 0.45).toFixed(2);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="${op}" stroke-width="${rand(
        1,
        2
      )}"/>`;
    })
    .join("");
  const dots = Array.from({ length: 35 })
    .map(() => {
      const x = rand(0, width),
        y = rand(0, height);
      const op = rand(0.15, 0.35).toFixed(2);
      return `<circle cx="${x}" cy="${y}" r="${rand(0.8, 2.2)}" fill="white" fill-opacity="${op}"/>`;
    })
    .join("");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="wavy">
      <feTurbulence type="fractalNoise" baseFrequency="${rand(0.9, 1.3) / 100}" numOctaves="2" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${rand(8, 14)}" xChannelSelector="R" yChannelSelector="G"/>
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
const svgDataUrl = (svg: string) => "data:image/svg+xml;utf8," + encodeURIComponent(svg);

function CaptchaDialog({
  open,
  onCancel,
  onOk,
}: {
  open: boolean;
  onCancel: () => void;
  onOk: () => void;
}) {
  const { t } = useI18n();
  const [cap, setCap] = React.useState<Captcha>(() => makeCaptcha());
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState("");

  const refresh = () => {
    setCap(makeCaptcha());
    setInput("");
    setError("");
  };
  const submit = () => {
    if (input.trim().toLowerCase() === cap.text.toLowerCase()) onOk();
    else {
      setError(t("Incorrect code. Try again."));
      refresh();
    }
  };
  React.useEffect(() => {
    if (open) refresh();
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { bgcolor: vars.bgCard, color: vars.text, border: `1px solid ${vars.border}` } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1 }}>
          <img
            src={svgDataUrl(cap.svg)}
            alt="captcha"
            style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid var(--border)` }}
          />
          <TextField
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("Type the letters")}
            size="small"
            fullWidth
            sx={{ ...addBarInputSx, "& .MuiOutlinedInput-root": { height: 36, bgcolor: vars.bgCtrl } }}
          />
          {error && <Box sx={{ color: "#f87171", fontSize: 12, mt: 0.25 }}>{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { filter: "brightness(0.95)" } }}
        >
          {t("Verify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Component ---------------- */

export default function Operations() {
  const { t } = useI18n();
  const initialTab = (new URLSearchParams(window.location.search).get("tab") ?? "requesters") as TabKey;
  const [tab, setTab] = React.useState<TabKey>(initialTab);

  // data lists
  const [requesters, setRequesters] = React.useState<Row[]>([]);
  const [ops, setOps] = React.useState<Row[]>([]);
  const [supporters, setSupporters] = React.useState<Row[]>([]);

  // add-bar state
  const [newName, setNewName] = React.useState("");

  // CAPTCHA gate
  const [captchaOpen, setCaptchaOpen] = React.useState(false);

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
      alert(e?.message || "Failed to load TTC service providers");
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
    tab === "requesters" ? t("Operation Requesters") : tab === "operations" ? t("Operations") : t("TTC Service Providers");

  const addLabel = (() => {
    if (tab === "requesters") return `${t("Add")} ${t("Operation Requester")}`;
    if (tab === "operations") return `${t("Add")} ${t("Operation")}`;
    return `${t("Add")} ${t("TTC Service Provider")}`;
  })();

  const addPlaceholder =
    tab === "requesters" ? t("Operation Requester name") : tab === "operations" ? t("Operation name") : t("Supporter name");

  const nameColumnHeader =
    tab === "requesters" ? t("Operation Requester") : tab === "operations" ? t("Operation") : t("TTC Service Provider");

  /* --------- Add (gated by CAPTCHA) --------- */
  const openCaptchaThenAdd = () => {
    const name = newName.trim();
    if (!name) return;
    setCaptchaOpen(true);
  };

  // Original add logic moved here
  const reallyAdd = async () => {
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
      // If you prefer localized, swap the above with specific keys:
      // alert(tab === "operations" ? t("Operation added ✅")
      //   : tab === "requesters" ? t("Operation requester added ✅")
      //   : t("Operation supporter added ✅"));
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Failed to add ❌");
      // Or localized:
      // alert(tab === "operations" ? t("Failed to add operation ❌")
      //   : tab === "requesters" ? t("Failed to add requester ❌")
      //   : t("Failed to add supporter ❌"));
    }
  };

  /* --------- Modals + API wiring --------- */

  // modal states
  const [reqOpen, setReqOpen] = React.useState(false);
  const [reqRow, setReqRow] = React.useState<OperationRequesterRow | null>(null);

  const [opOpen, setOpOpen] = React.useState(false);
  const [opRow, setOpRow] = React.useState<OperationRow | null>(null);

  const [supOpen, setSupOpen] = React.useState(false);
  const [supRow, setSupRow] = React.useState<OperationSupporterRow | null>(null);

  // open correct dialog for row
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

  // list helpers
  const replaceIn = (list: Row[], updated: Row) => list.map((r) => (r.id === updated.id ? updated : r));
  const removeFrom = (list: Row[], id: number) => list.filter((r) => r.id !== id);

  // requester actions
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

  // operation actions
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

  // supporter actions
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

  /* -------------------------------- Render -------------------------------- */

  return (
    <MainLayout title={t("Operations")}>
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
        <ToggleButtonGroup value={tab} exclusive onChange={handleTab} sx={tabsWrapSx}>
          {[
            { key: "requesters", label: t("Operation Requesters") },
            { key: "operations", label: t("Operations") },
            { key: "supporters", label: t("TTC Service Provider") },
          ].map(({ key, label }) => (
            <ToggleButton key={key} value={key} disableRipple sx={pillSx}>
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
              borderBottom: `1px solid ${vars.border}`,
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: vars.bgCard,
              color: vars.text,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{headerTitle}</Typography>
          </Box>

          {/* Add bar */}
          <Box
            sx={{
              px: 1.25,
              py: 0.9,
              borderBottom: `1px solid ${vars.border}`,
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexWrap: "nowrap",
              overflowX: "auto",
              ...SCROLLER_SX,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: vars.textDim, mr: 0.75 }}>
              {addLabel}
            </Typography>
            <TextField
              placeholder={addPlaceholder}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newName.trim()) openCaptchaThenAdd();
              }}
              size="small"
              sx={{ ...addBarInputSx, width: 280 }}
            />
            <Button
              variant="contained"
              onClick={openCaptchaThenAdd}
              disabled={!newName.trim()}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                height: 32,
                bgcolor: PRIMARY,
                "&:hover": { bgcolor: "#6b46f1" },
                "&.Mui-disabled": {
                  bgcolor: vars.bgApp,
                  color: vars.textDim,
                  border: `1px solid ${vars.border}`,
                  boxShadow: "none",
                  opacity: 1,
                },
              }}
            >
              {t("Add")}
            </Button>
          </Box>

          {/* Table */}
          <Box sx={{ flex: 1, minHeight: 0, px: 1, pb: 1, ...SCROLLER_SX }}>
            {/* Header row */}
            <Box
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: TABLE_COLS,
                bgcolor: (t) => theadBg(t as Theme),
                borderBottom: `1px solid ${vars.border}`,
              }}
            >
              {[t("Sr No"), nameColumnHeader, t("Added By"), t("Action")].map((label) => (
                <Box key={label} sx={headerCellSx}>
                  {label}
                </Box>
              ))}
            </Box>

            {/* Data rows */}
            {paged.map((r, idx) => (
              <Box
                key={`${r.id}-${r.name}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: TABLE_COLS,
                  alignItems: "center",
                  borderBottom: `1px solid ${vars.border}`,
                  bgcolor: (t) =>
                    (t as Theme).palette.mode === "dark"
                      ? "transparent"
                      : (page * rpp + idx) % 2
                      ? vars.bgHover
                      : "transparent",
                }}
              >
                {/* Running count */}
                <Box sx={cellSx}>{page * rpp + idx + 1}</Box>

                <Box sx={cellSx}>{r.name}</Box>
                <Box sx={cellSx}>{r.addedBy}</Box>

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
                    {t("Edit")}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Pagination */}
          <Box sx={{ borderTop: `1px solid ${vars.border}`, px: 1, py: 0.75 }}>
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
              sx={paginationSx}
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

      {/* CAPTCHA dialog gates the "Add" action */}
      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => setCaptchaOpen(false)}
        onOk={async () => {
          setCaptchaOpen(false);
          await reallyAdd();
        }}
      />
    </MainLayout>
  );
}
