


// src/components/Models/UpdateSatelliteModal.tsx
import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControl,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { Checkbox, ListItemText } from "@mui/material";

/* ---- config ---- */
// const API = `${import.meta.env.VITE_API_BASE}/api`;

import { api } from "../../api/http";



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
    width: UI.icon,
    height: UI.icon,
  },
  "& .MuiSvgIcon-root": { color: "#fff", fontSize: UI.icon },
};

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

const splitCSV = (s: string) =>
  (s || "").split(",").map(x => x.trim()).filter(Boolean);

const joinCSV = (arr: string[]) => arr.filter(Boolean).join(", ");

/* ---- types ---- */
export type SatelliteLike = {
    id: number;   // ✅ add this

  satId: string;
  satName: string;
  norad: string;
  itu: string;
  station: string;
  pol: string;
};

type Props = {
  open: boolean;
  row: SatelliteLike | null;
  onClose: () => void;
  onSave: (updated: SatelliteLike) => void;   // will be called after successful PUT
  onDelete: (satId: string) => void;         // will be called after successful DELETE
};

/* ---- component ---- */
export default function UpdateSatelliteModal({
  open,
  row,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = React.useState<SatelliteLike | null>(row);
  const [saving, setSaving] = React.useState(false);
  const [stations, setStations] = React.useState<string[]>([]);
  const [pols, setPols] = React.useState<string[]>([]);

    const [stationsSel, setStationsSel] = React.useState<string[]>([]);
    const [polsSel, setPolsSel] = React.useState<string[]>([]);

    React.useEffect(() => {
      if (!row) return;
      setStationsSel(splitCSV(row.station));  // row.station is a string from table
      setPolsSel(splitCSV(row.pol));          // row.pol is a string from table
    }, [row]);

  React.useEffect(() => setForm(row), [row]);

  // fetch dropdown options when the modal opens
  React.useEffect(() => {
    if (!open) return;

    // (async () => {
    //   try {
    //     // Stations
    //     const rs = await fetch(`${API}/ground-stations`);
    //     const js = await rs.json().catch(() => ({}));
    //     const listS: string[] = Array.isArray(js?.data)
    //       ? js.data
    //           .map((g: any) => (g.ground_station || g.station_name || g.name || "").toString().trim())
    //           .filter(Boolean)
    //       : [];
    //     setStations(listS);
    //   } catch (e) {
    //     console.error("Failed to load stations", e);
    //     setStations([]);
    //   }

    //   try {
    //     // Polarizations
    //     const rp = await fetch(`${API}/polarizations`);
    //     const jp = await rp.json().catch(() => ({}));
    //     const listP: string[] = Array.isArray(jp?.data)
    //       ? jp.data
    //           .map((p: any) => (p.polarization || p.name || "").toString().trim())
    //           .filter(Boolean)
    //       : [];
    //     setPols(listP);
    //   } catch (e) {
    //     console.error("Failed to load polarizations", e);
    //     setPols([]);
    //   }
    // })();

    (async () => {
  try {
    // Stations
    const js = await api.get<any>("/api/ground-stations");
    const listS: string[] = Array.isArray(js?.data) ? js.data : Array.isArray(js) ? js : [];
    const namesS = listS
      .map((g: any) => String(g.ground_station ?? g.station_name ?? g.name ?? "").trim())
      .filter(Boolean);
    setStations(namesS);
  } catch (e) {
    console.error("Failed to load stations", e);
    setStations([]);
  }

  try {
    // Polarizations
    const jp = await api.get<any>("/api/polarizations");
    const rowsP: any[] = Array.isArray(jp?.data) ? jp.data : Array.isArray(jp) ? jp : [];
    const listP = Array.from(
      new Set(
        rowsP.map((p: any) => String(p.polarization ?? p.name ?? "").trim()).filter(Boolean)
      )
    );
    setPols(listP);
  } catch (e) {
    console.error("Failed to load polarizations", e);
    setPols([]);
  }
})();
  }, [open]);

  if (!form) return null;

  const setText =
    (k: keyof SatelliteLike) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.value });

  // const setSelect =
  //   (k: keyof SatelliteLike) => (e: SelectChangeEvent) =>
  //     setForm({ ...form, [k]: e.target.value as string });

  /* ---------- API actions ---------- */
//   const doUpdate = async () => {
//     if (!form.satId || !form.satName || !form.station || !form.pol) {
//       alert("Satellite ID, Satellite Name, Station and Polarization are required.");
//       return;
//     }
//     try {
//       setSaving(true);
   
//       const payload = {
//   satellite_id: form.satId,
//   satellite_name: form.satName,
//   norad_id: form.norad || null,
//   itu_name: form.itu || null,
//   station_name: joinCSV(stationsSel),  // <— multi-select -> CSV string
//   polarization: joinCSV(polsSel),      // <— multi-select -> CSV string
// };

//       const resp = await fetch(`${API}/satellites/${encodeURIComponent(form.satId)}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const txt = await resp.text().catch(() => "");
//       if (!resp.ok) {
//         alert(`Update failed (${resp.status}): ${txt || resp.statusText}`);
//         return;
//       }

//       alert("Satellite updated successfully.");
//       onSave({
//   ...form,
//   station: joinCSV(stationsSel),
//   pol: joinCSV(polsSel),
// });
//       onClose();
//     } catch (e) {
//       console.error(e);
//       alert("Update failed.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const doDelete = async () => {
//     if (!confirm(`Delete satellite "${form.satId}"? This cannot be undone.`)) return;
//     try {
//       setSaving(true);
//       const resp = await fetch(`${API}/satellites/${encodeURIComponent(form.satId)}`, {
//         method: "DELETE",
//       });
//       const txt = await resp.text().catch(() => "");
//       if (!resp.ok) {
//         alert(`Delete failed (${resp.status}): ${txt || resp.statusText}`);
//         return;
//       }
//       alert("Satellite deleted.");
//       onDelete(form.satId); // remove from table locally
//       onClose();
//     } catch (e) {
//       console.error(e);
//       alert("Delete failed.");
//     } finally {
//       setSaving(false);
//     }
//   };

const doUpdate = async () => {
  if (!form) return;

  // basic validation
  if (
    !form.satId.trim() ||
    !form.satName.trim() ||
    stationsSel.length === 0 ||
    polsSel.length === 0
  ) {
    alert("Satellite ID, Satellite Name, Station and Polarization are required.");
    return;
  }

  try {
    setSaving(true);

    const payload = {
      satellite_id: form.satId,
      satellite_name: form.satName,
      norad_id: form.norad || null,
      itu_name: form.itu || null,
      station_name: joinCSV(stationsSel),
      polarization: joinCSV(polsSel),
    };

    await api.put(`/api/satellites/${encodeURIComponent(form.satId)}`, payload);

    alert("Satellite updated successfully.");
    onSave({
      ...form,
      station: joinCSV(stationsSel),
      pol: joinCSV(polsSel),
    });
    onClose();
  } catch (err: any) {
    console.error("Update satellite failed:", err);
    alert(err?.message || "Update failed.");
  } finally {
    setSaving(false);
  }
};

const doDelete = async () => {
  if (!form) return;
  if (!confirm(`Delete satellite "${form.satId}"? This cannot be undone.`)) return;

  try {
    setSaving(true);
    await api.del(`/api/satellites/${encodeURIComponent(form.satId)}`);
    alert("Satellite deleted.");
    onDelete(form.satId);
    onClose();
  } catch (err: any) {
    console.error("Delete satellite failed:", err);
    alert(err?.message || "Delete failed.");
  } finally {
    setSaving(false);
  }
};

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: "#151517",
          color: "#EDEDED",
          border: CONTROL_BORDER,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Update Satellite</DialogTitle>

      <DialogContent
        dividers
        sx={{
          borderColor: "rgba(255,255,255,0.12)",
          "& .MuiDialogContent-root": { p: 0 },
        }}
      >
        {/* 2-column grid, same sizing as the other modals */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1.25,
            pt: 0.5,
          }}
        >
          <Box>
            <Typography sx={labelSx}>Satellite Name</Typography>
            <TextField
              size="small"
              fullWidth
              value={form.satName}
              onChange={setText("satName")}
              sx={compactCtrlSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>Satellite ID</Typography>
            <TextField
              size="small"
              fullWidth
              value={form.satId}
              onChange={setText("satId")}
              sx={compactCtrlSx}
              InputProps={{ readOnly: true }} 
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>ITU Name</Typography>
            <TextField
              size="small"
              fullWidth
              value={form.itu}
              onChange={setText("itu")}
              sx={compactCtrlSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>Norad ID</Typography>
            <TextField
              size="small"
              fullWidth
              value={form.norad}
              onChange={setText("norad")}
              sx={compactCtrlSx}
            />
          </Box>

          <Box>
            <Typography sx={labelSx}>Station</Typography>
           

            <FormControl size="small" fullWidth>
  <Select<string[]>
    multiple
    value={stationsSel}
    onChange={(e: SelectChangeEvent<string[]>) => {
      const v = e.target.value;
      setStationsSel(typeof v === "string" ? v.split(",") : (v as string[]));
    }}
    displayEmpty
    renderValue={(selected) =>
      (selected as string[]).length ? (selected as string[]).join(", ") : "Select Station"
    }
    sx={compactCtrlSx}
    MenuProps={darkMenu}
  >
    <MenuItem disabled value="">
      Select Station
    </MenuItem>
    {stations.map((s) => (
      <MenuItem key={s} value={s}>
        <Checkbox checked={stationsSel.indexOf(s) > -1} sx={{ p: 0.5, mr: 1, color: "#bbb" }} />
        <ListItemText primary={s} />
      </MenuItem>
    ))}
  </Select>
</FormControl>
          </Box>

          <Box>
            <Typography sx={labelSx}>Polarization</Typography>
          

            <FormControl size="small" fullWidth>
  <Select<string[]>
    multiple
    value={polsSel}
    onChange={(e: SelectChangeEvent<string[]>) => {
      const v = e.target.value;
      setPolsSel(typeof v === "string" ? v.split(",") : (v as string[]));
    }}
    displayEmpty
    renderValue={(selected) =>
      (selected as string[]).length ? (selected as string[]).join(", ") : "Select Polarization"
    }
    sx={compactCtrlSx}
    MenuProps={darkMenu}
  >
    <MenuItem disabled value="">
      Select Polarization
    </MenuItem>
    {pols.map((p) => (
      <MenuItem key={p} value={p}>
        <Checkbox checked={polsSel.indexOf(p) > -1} sx={{ p: 0.5, mr: 1, color: "#bbb" }} />
        <ListItemText primary={p} />
      </MenuItem>
    ))}
  </Select>
</FormControl>

          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.25 }}>
        <Button
          onClick={doDelete}
          disabled={saving}
          variant="contained"
          color="error"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#B4232A",
            "&:hover": { bgcolor: "#9b1d23" },
          }}
        >
          Delete
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={onClose}
          disabled={saving}
          sx={{ textTransform: "none", fontWeight: 700, color: "#EDEDED" }}
        >
          Cancel
        </Button>
        <Button
          onClick={doUpdate}
          disabled={saving}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#7C57F2",
            "&:hover": { bgcolor: "#6b48ea" },
          }}
        >
          {saving ? "Saving…" : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
