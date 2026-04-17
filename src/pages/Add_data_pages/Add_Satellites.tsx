// src/pages/Add_data_pages/Add_Satellites.tsx
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";

import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import api from "../../api/http"; // ✅ use DEFAULT export so baseURL/auth match everywhere

/* ✅ theme bridge */
import { vars, sxPresets } from "../../ui/toast/themeBridge";
import { useI18n } from "../../i18n";

/* -------------------- Shared UI (theme-aware) -------------------- */
const CARD_SX = {
  ...sxPresets.card,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
} as const;

const COLORS = { link: vars.accent, purple: "#7C57F2" };

/** sizing same as Add Passes */
const FIELD_H = 36;
const CONTENT_H = 32;
const FONT_PX = 13;
const HORIZ_PAD = 8;

const controlSx = {
  ...sxPresets.ctrl,
  borderRadius: 1,
  "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
    height: `${FIELD_H}px`,
    minHeight: `${FIELD_H}px`,
    alignItems: "center",
  },
  "& .MuiOutlinedInput-input, & .MuiInputBase-input": {
    height: `${CONTENT_H}px`,
    lineHeight: `${CONTENT_H}px`,
    padding: `0 ${HORIZ_PAD}px`,
    fontSize: `${FONT_PX}px`,
    color: vars.text,
  },
  "& .MuiSelect-select, & .MuiSelect-select.MuiInputBase-inputSizeSmall": {
    height: `${CONTENT_H}px !important`,
    lineHeight: `${CONTENT_H}px`,
    padding: `0 ${HORIZ_PAD}px !important`,
    fontSize: `${FONT_PX}px`,
    display: "flex",
    alignItems: "center",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "& .MuiSvgIcon-root": { color: vars.text },
} as const;

const filledField = (t: any) => {
  const isDark = t.palette.mode === "dark";
  return {
    "& .MuiOutlinedInput-root": { backgroundColor: isDark ? "#232325" : "#fff" },
    "& .MuiOutlinedInput-root.Mui-focused": { backgroundColor: isDark ? "#232325" : "#fff" },
    "& .MuiSelect-select": { backgroundColor: isDark ? "#232325" : "#fff" },
    "& .MuiInputBase-input": {
      color: isDark ? vars.text : "#000",
      "::placeholder": {
        color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
        opacity: 1,
      },
    },
  };
};

const menuTheme = {
  PaperProps: {
    sx: {
      bgcolor: vars.bgCard,
      color: vars.text,
      border: `1px solid ${vars.border}`,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: vars.bgHover },
      "& .MuiMenuItem-root:hover": { bgcolor: vars.bgHover },
    },
  },
};

const LABEL_SX = {
  fontSize: 12,
  fontWeight: 600,
  color: vars.textDim,
  mb: 0.5,
  lineHeight: 1.2,
} as const;

const SCROLLER_SX = sxPresets.scroller;

/* ===================== OFFLINE CAPTCHA (SVG) ===================== */
type Captcha = { text: string; svg: string };

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick(chars: string, n: number) { let s = ""; for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)]; return s; }
function makeCaptcha(width = 220, height = 80, length = 5): Captcha {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const text = pick(alphabet, length);
  const charW = width / (length + 1);
  const chars = [...text].map((ch, i) => {
    const x = (i + 1) * charW + rand(-6, 6);
    const y = height / 2 + rand(-5, 5);
    const r = rand(-24, 24);
    const fontSize = rand(30, 38);
    return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle" transform="rotate(${r} ${x} ${y})">${ch}</text>`;
  }).join("");
  const lines = Array.from({ length: 4 }).map(() => {
    const x1 = rand(0, width), y1 = rand(0, height);
    const x2 = rand(0, width), y2 = rand(0, height);
    const op = rand(0.25, 0.45).toFixed(2);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="${op}" stroke-width="${rand(1,2)}"/>`;
  }).join("");
  const dots = Array.from({ length: 35 }).map(() => {
    const x = rand(0, width), y = rand(0, height);
    const op = rand(0.15, 0.35).toFixed(2);
    return `<circle cx="${x}" cy="${y}" r="${rand(0.8,2.2)}" fill="white" fill-opacity="${op}"/>`;
  }).join("");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="wavy">
      <feTurbulence type="fractalNoise" baseFrequency="${rand(0.9,1.3)/100}" numOctaves="2" result="noise"/>
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="${rand(8,14)}" xChannelSelector="R" yChannelSelector="G"/>
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
function svgDataUrl(svg: string) { return "data:image/svg+xml;utf8," + encodeURIComponent(svg); }

function CaptchaDialog({
  open, onCancel, onOk,
}: { open: boolean; onCancel: () => void; onOk: () => void; }) {
  const { t } = useI18n();
  const [cap, setCap] = React.useState<Captcha>(() => makeCaptcha());
  const [input, setInput] = React.useState("");
  const [error, setError] = React.useState("");

  const refresh = () => { setCap(makeCaptcha()); setInput(""); setError(""); };
  const submit = () => {
    if (input.trim().toLowerCase() === cap.text.toLowerCase()) { setError(""); onOk(); }
    else { setError(t("Incorrect code. Try again.")); refresh(); }
  };
  React.useEffect(() => { if (open) refresh(); }, [open]);

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
          <img src={svgDataUrl(cap.svg)} alt="captcha"
               style={{ width: "100%", height: 80, borderRadius: 8, border: `1px solid ${vars.border}` }} />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Type the letters")}
              size="small"
              fullWidth
              sx={(tMui) => ({ ...sxPresets.ctrl, "& .MuiOutlinedInput-root": { height: 36, background: tMui.palette.mode === "dark" ? "#232325" : "#fff" } })}
            />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: vars.border }}>
              {t("Refresh")}
            </Button>
          </Box>
          {error && <Typography sx={{ color: "#f87171", fontSize: 12, mt: 0.25 }}>{error}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>{t("Cancel")}</Button>
        <Button onClick={submit} variant="contained"
                sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" } }}>
          {t("Verify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* -------------------- Page -------------------- */
export default function AddSatellites() {
  const { t } = useI18n();

  // form
  const [satId, setSatId] = React.useState("");
  const [satName, setSatName] = React.useState("");
  const [noradId, setNoradId] = React.useState("");
  const [ituName, setItuName] = React.useState("");

  // options
  const [stationsOpts, setStationsOpts] = React.useState<string[]>([]);
 // fixed polarization values
const [polOpts] = React.useState<string[]>(["LHCP", "RHCP", "OMNI"]);


  // selections
  const [stationsSel, setStationsSel] = React.useState<string[]>([]);
  const [polsSel, setPolsSel] = React.useState<string[]>([]);

  const [saving, setSaving] = React.useState(false);

  // captcha flow
  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [pendingPayload, setPendingPayload] = React.useState<any | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const gs = await api.get<any>("/api/ground-stations");


        const gsRows: any[] = Array.isArray(gs?.data) ? gs.data : Array.isArray(gs) ? gs : [];
        const stationNames = Array.from(
          new Set(
            gsRows
              .map((g) => String(g.ground_station ?? g.station_name ?? g.name ?? "").trim())
              .filter(Boolean)
          )
        ).sort((a, b) => a.localeCompare(b));

        // const polRows: any[] = Array.isArray(pol?.data) ? pol.data : Array.isArray(pol) ? pol : [];
        // const polValues = Array.from(
        //   new Set(polRows.map((p) => String(p.polarization ?? "").trim()).filter(Boolean))
        // ).sort((a, b) => a.localeCompare(b));

        if (active) {
          setStationsOpts(stationNames);
          // setPolOpts(polValues);
        }
      } catch (e) {
        console.error("Failed to load form options", e);
        if (active) {
          setStationsOpts([]);
          // setPolOpts([]);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  const clearForm = () => {
    setSatId(""); setSatName(""); setNoradId(""); setItuName("");
    setStationsSel([]); setPolsSel([]);
  };

  const handleStationsChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    setStationsSel(typeof v === "string" ? v.split(",") : v);
  };
  const handlePolsChange = (e: SelectChangeEvent<string[]>) => {
    const v = e.target.value;
    setPolsSel(typeof v === "string" ? v.split(",") : v);
  };

  // Step 1: open captcha with prepared payload
  const handleSave = async () => {
    if (!satId.trim() || !satName.trim() || stationsSel.length === 0 || polsSel.length === 0) {
      alert(t("Please fill Satellite ID, Satellite Name, Station and Polarization."));
      return;
    }

    const payload = {
      satellite_id: satId.trim(),
      satellite_name: satName.trim(),
      station_name: stationsSel.join(", ").trim(),
      polarization: polsSel.join(", ").trim(),
      norad_id: noradId.trim() || null,
      itu_name: ituName.trim() || null,
    };

    setPendingPayload(payload);
    setCaptchaOpen(true);
  };

  // Step 2: called only after successful captcha
  const actuallySave = async () => {
    if (!pendingPayload) return;
    try {
      setSaving(true);
      await api.post("/api/satellites", pendingPayload);
      alert(t("Satellite saved successfully."));
      clearForm();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to save satellite."));
    } finally {
      setSaving(false);
      setPendingPayload(null);
      setCaptchaOpen(false);
    }
  };

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5 }}>
        <Card
          sx={{ ...CARD_SX, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)` }}
          elevation={0}
        >
          {/* Header */}
          <Box
            sx={{
              px: 1.25, py: 0.7, borderBottom: `1px solid ${vars.border}`,
              display: "flex", alignItems: "center", gap: 1, bgcolor: vars.bgCard, color: vars.text,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("Add Satellite Details")}</Typography>
            <Box sx={{ ml: "auto" }}>
              <Button size="small" onClick={clearForm}
                      sx={{ textTransform: "none", fontWeight: 600, color: vars.accent, px: 1 }}>
                {t("Clear")}
              </Button>
            </Box>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, minHeight: 0, p: 1.25, overflowY: "auto", ...SCROLLER_SX }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
                columnGap: 2, rowGap: 2,
                "& .form-item": { display: "flex", flexDirection: "column" },
              }}
            >
              <Box className="form-item">
                <Typography sx={LABEL_SX}>{t("Satellite ID *")}</Typography>
                <TextField value={satId} onChange={(e) => setSatId(e.target.value)}
                           placeholder={t("Enter Satellite ID")} size="small"
                           sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />
              </Box>

              <Box className="form-item">
                <Typography sx={LABEL_SX}>{t("Satellite Name *")}</Typography>
                <TextField value={satName} onChange={(e) => setSatName(e.target.value)}
                           placeholder={t("Enter Satellite Name")} size="small"
                           sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />
              </Box>

              <Box className="form-item">
                <Typography sx={LABEL_SX}>{t("Norad ID")}</Typography>
                <TextField value={noradId} onChange={(e) => setNoradId(e.target.value)}
                           placeholder={t("Enter Norad ID")} size="small"
                           sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />
              </Box>

              <Box className="form-item">
                <Typography sx={LABEL_SX}>{t("ITU Name")}</Typography>
                <TextField value={ituName} onChange={(e) => setItuName(e.target.value)}
                           placeholder={t("Enter ITU Name")} size="small"
                           sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />
              </Box>

              {/* Station (multi-select) */}
              <Box className="form-item">
                <Typography sx={LABEL_SX}>{t("Station *")}</Typography>
                <FormControl fullWidth size="small">
                  <Select<string[]>
                    multiple
                    value={stationsSel}
                    onChange={handleStationsChange}
                    displayEmpty
                    renderValue={(selected) =>
                      (selected as string[]).length ? (selected as string[]).join(", ") : t("Select Station")
                    }
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                    MenuProps={menuTheme}
                  >
                    <MenuItem disabled value="">{t("Select Station")}</MenuItem>
                    {stationsOpts.map((s) => (
                      <MenuItem key={s} value={s}>
                        <Checkbox checked={stationsSel.indexOf(s) > -1} sx={{ p: 0.5, mr: 1, color: vars.textDim }} />
                        <ListItemText primary={s} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Polarization (multi-select) */}
              <Box className="form-item">
                <Typography sx={LABEL_SX}>{t("Polarization *")}</Typography>
                <FormControl fullWidth size="small">
                  <Select<string[]>
                    multiple
                    value={polsSel}
                    onChange={handlePolsChange}
                    displayEmpty
                    renderValue={(selected) =>
                      (selected as string[]).length ? (selected as string[]).join(", ") : t("Select Polarization")
                    }
                    sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
                    MenuProps={menuTheme}
                  >
                    <MenuItem disabled value="">{t("Select Polarization")}</MenuItem>
                    {polOpts.map((p) => (
                      <MenuItem key={p} value={p}>
                        <Checkbox checked={polsSel.indexOf(p) > -1} sx={{ p: 0.5, mr: 1, color: vars.textDim }} />
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
                  "&&": { textTransform: "none", fontWeight: 700, bgcolor: COLORS.purple, color: "#fff !important" },
                  "&:hover": { bgcolor: "#6b46f1", color: "#fff !important" },
                  "& .MuiSvgIcon-root": { color: "#fff !important" },
                  "&.Mui-disabled": {
                    bgcolor: vars.bgCtrl, color: `${vars.textDim} !important`,
                    border: `1px solid ${vars.border}`, boxShadow: "none", opacity: 1,
                    "& .MuiSvgIcon-root": { color: `${vars.textDim} !important` },
                  },
                }}
              >
                <span style={{ color: "#fff" }}>{saving ? t("Saving...") : t("Save")}</span>
              </Button>
            </Box>
          </Box>
        </Card>
      </Box>

      {/* Offline CAPTCHA modal */}
      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => { setCaptchaOpen(false); setPendingPayload(null); }}
        onOk={actuallySave}
      />
    </MainLayout>
  );
}
