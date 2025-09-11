import React from "react";
import {
  Box,
  Card,
  Button,
  Typography,
  TextField,
  FormControl,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";

/* ---------- API base ---------- */

import { api } from "../../api/http";


/* ---------- Shared UI ---------- */
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

export default function AddSatellites() {
  // form
  const [satId, setSatId] = React.useState("");
  const [satName, setSatName] = React.useState("");
  const [noradId, setNoradId] = React.useState(""); // optional
  const [ituName, setItuName] = React.useState(""); // optional

  // options fetched from API
  const [stationsOpts, setStationsOpts] = React.useState<string[]>([]);
  const [polOpts, setPolOpts] = React.useState<string[]>([]);

  // multi-select selections
  const [stationsSel, setStationsSel] = React.useState<string[]>([]);
  const [polsSel, setPolsSel] = React.useState<string[]>([]);

  const [saving, setSaving] = React.useState(false);


React.useEffect(() => {
  let active = true;

  (async () => {
    try {
      const [gs, pol] = await Promise.all([
        api.get<any>("/api/ground-stations"),
        api.get<any>("/api/polarizations"),
      ]);

      // ---- ground stations -> names (dedup + sort)
      const gsRows: any[] = Array.isArray(gs?.data) ? gs.data : Array.isArray(gs) ? gs : [];
      const stationNames = Array.from(
        new Set(
          gsRows
            .map((g) => String(g.ground_station ?? g.station_name ?? g.name ?? "").trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      // ---- polarizations -> values (dedup + sort)
      const polRows: any[] = Array.isArray(pol?.data) ? pol.data : Array.isArray(pol) ? pol : [];
      const polValues = Array.from(
        new Set(
          polRows
            .map((p) => String(p.polarization ?? "").trim())
            .filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b));

      if (active) {
        setStationsOpts(stationNames);
        setPolOpts(polValues);
      }
    } catch (e) {
      console.error("Failed to load form options", e);
      if (active) {
        setStationsOpts([]);
        setPolOpts([]);
      }
    }
  })();

  return () => {
    active = false;
  };
}, []);


  const clearForm = () => {
    setSatId("");
    setSatName("");
    setNoradId("");
    setItuName("");
    setStationsSel([]);
    setPolsSel([]);
  };

  // TS-safe onChange for multi-selects
  const handleStationsChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    setStationsSel(typeof v === "string" ? v.split(",") : v);
  };
  const handlePolsChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    setPolsSel(typeof v === "string" ? v.split(",") : v);
  };



const handleSave = async () => {
  if (!satId.trim() || !satName.trim() || stationsSel.length === 0 || polsSel.length === 0) {
    alert("Please fill Satellite ID, Satellite Name, Station and Polarization.");
    return;
  }

  const payload = {
    satellite_id: satId.trim(),
    satellite_name: satName.trim(),
    station_name: stationsSel.join(", ").trim(),     // backend expects CSV
    polarization: polsSel.join(", ").trim(),         // backend expects CSV
    norad_id: noradId.trim() || null,
    itu_name: ituName.trim() || null,
    added_by: "UI",
  };

  try {
    setSaving(true);
    await api.post("/api/satellites", payload);
    alert("Satellite saved successfully.");
    clearForm();
  } catch (e: any) {
    console.error(e);
    alert(e?.message || "Failed to save satellite.");
  } finally {
    setSaving(false);
  }
};


// Auto-fill Satellite ID from Satellite Name
React.useEffect(() => {
  let cancel = false;

  const go = async () => {
    const name = satName.trim();
    if (!name) {
      if (!cancel) setSatId("");
      return;
    }
    try {
      const r = await api.get<{ prefix: string; next: string }>(
        "/api/satellites/next-id",
        { params: { name } }
      );
      if (!cancel && r?.next) setSatId(r.next);
    } catch (e) {
      console.error("Failed to get next satellite id", e);
    }
  };

  // small debounce to avoid spamming while typing
  const t = setTimeout(go, 250);
  return () => {
    cancel = true;
    clearTimeout(t);
  };
}, [satName]);


  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{
            ...CARD_SX,
            height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
          }}
        >
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
              Add Satellite Details
            </Typography>
            <Box sx={{ ml: "auto" }}>
              <Button
                size="small"
                onClick={clearForm}
                sx={{ textTransform: "none", fontWeight: 600, color: COLORS.link, px: 1 }}
              >
                Clear
              </Button>
            </Box>
          </Box>

          {/* Body */}
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
              {/* Row 1 */}
              <Box className="form-item">
                <Typography sx={LABEL_SX}>Satellite ID *</Typography>
               <TextField
  value={satId}
  onChange={(e) => setSatId(e.target.value)}
  placeholder="Enter Satellite ID"
  size="small"
  sx={controlSx}
/>
              </Box>
              <Box className="form-item">
                <Typography sx={LABEL_SX}>Satellite Name *</Typography>
                <TextField
                  value={satName}
                  onChange={(e) => setSatName(e.target.value)}
                  placeholder="Enter Satellite Name"
                  size="small"
                  sx={controlSx}
                />
              </Box>
              <Box className="form-item">
                <Typography sx={LABEL_SX}>Norad ID</Typography>
                <TextField
                  value={noradId}
                  onChange={(e) => setNoradId(e.target.value)}
                  placeholder="Enter Norad ID"
                  size="small"
                  sx={controlSx}
                />
              </Box>
              {/* Row 2 */}
              <Box className="form-item">
                <Typography sx={LABEL_SX}>ITU Name</Typography>
                <TextField
                  value={ituName}
                  onChange={(e) => setItuName(e.target.value)}
                  placeholder="Enter ITU Name"
                  size="small"
                  sx={controlSx}
                />
              </Box>
              {/* Station (multi-select with checkboxes) */}
              <Box className="form-item">
                <Typography sx={LABEL_SX}>Station *</Typography>
                <FormControl fullWidth size="small">
                  <Select<string[]>
                    multiple
                    value={stationsSel}
                    onChange={handleStationsChange}
                    displayEmpty
                    renderValue={(selected) =>
                      (selected as string[]).length
                        ? (selected as string[]).join(", ")
                        : "Select Station"
                    }
                    sx={controlSx}
                    MenuProps={darkMenu}
                  >
                    <MenuItem disabled value="">
                      Select Station
                    </MenuItem>
                    {stationsOpts.map((s) => (
                      <MenuItem key={s} value={s}>
                        <Checkbox
                          checked={stationsSel.indexOf(s) > -1}
                          sx={{ p: 0.5, mr: 1, color: "#bbb" }}
                        />
                        <ListItemText primary={s} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Polarization (multi-select with checkboxes) */}
              <Box className="form-item">
                <Typography sx={LABEL_SX}>Polarization *</Typography>
                <FormControl fullWidth size="small">
                  <Select<string[]>
                    multiple
                    value={polsSel}
                    onChange={handlePolsChange}
                    displayEmpty
                    renderValue={(selected) =>
                      (selected as string[]).length
                        ? (selected as string[]).join(", ")
                        : "Select Polarization"
                    }
                    sx={controlSx}
                    MenuProps={darkMenu}
                  >
                    <MenuItem disabled value="">
                      Select Polarization
                    </MenuItem>
                    {polOpts.map((p) => (
                      <MenuItem key={p} value={p}>
                        <Checkbox
                          checked={polsSel.indexOf(p) > -1}
                          sx={{ p: 0.5, mr: 1, color: "#bbb" }}
                        />
                        <ListItemText primary={p} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {/* Save */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: COLORS.purple,
                  "&:hover": { bgcolor: "#6b46f1" },
                  "&.Mui-disabled": {
                    bgcolor: "#2f2f33",
                    color: "#b5b7bd",
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow: "none",
                    opacity: 1,
                  },
                }}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>
    </MainLayout>
  );
}
