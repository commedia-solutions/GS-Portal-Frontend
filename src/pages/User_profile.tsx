// src/pages/PassSchedule.tsx
import React from "react";
import {
  Box,
  Card,
  Button,
  Chip,
  Typography,
  TextField,
  Backdrop,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  Stack,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import api from "../api/http";
import { vars, sxPresets } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";

/* -------------------- Feature flag -------------------- */
const SHOW_REGION_BUCKETS = false;

/* -------------------- Shared constants & styles -------------------- */
const REGION_OPTIONS = [
  { id: "us-west-2", label: "Oregon (us-west-2)" },
  { id: "af-south-1", label: "Cape Town (af-south-1)" },
  { id: "me-south-1", label: "Bahrain (me-south-1)" },
  { id: "eu-west-1", label: "Ireland (eu-west-1)" },
  { id: "sa-east-1", label: "São Paulo (sa-east-1)" },
];
const KNOWN_REGION_LABELS: Record<string, string> = Object.fromEntries(
  REGION_OPTIONS.map((o) => [o.id, o.label])
);

function noradOf(c: any): string | null {
  if (!c) return null;
  return (
    c.catalogNumber ?? c.norad ?? c.noradSatelliteId ?? c.noradSatelliteID ?? c.norad_satellite_id ?? null
  );
}

function preferredNoradForGs(gs: string) {
  if (String(gs) === "gs1") return "62459";
  if (String(gs) === "gs2") return "62460";
  return null;
}

const CARD_SX = {
  bgcolor: vars.bgCard,
  color: vars.text,
  border: `1px solid ${vars.border}`,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  boxShadow: "none",
} as const;
const COLORS = { link: vars.accent, green: "#16a34a", purple: "#7C57F2" };
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
  },
};
const filledField = (t: any) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: t.palette.mode === "dark" ? "#232325" : "#fff",
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    backgroundColor: t.palette.mode === "dark" ? "#232325" : "#fff",
  },
  "& .MuiInputBase-input": {
    color: t.palette.mode === "dark" ? vars.text : "#000",
    "::placeholder": {
      color:
        t.palette.mode === "dark"
          ? "rgba(255,255,255,0.6)"
          : "rgba(0,0,0,0.6)",
      opacity: 1,
    },
  },
});

/* -------------------- CAPTCHA (kept same) -------------------- */
type Captcha = { text: string; svg: string };
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}
function pick(chars: string, n: number) {
  let s = "";
  for (let i = 0; i < n; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}
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
      return `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="700" text-anchor="middle" dominant-baseline="middle" transform="rotate(${r} ${x} ${y})">${ch}</text>`;
    })
    .join("");
  const lines = Array.from({ length: 4 })
    .map(() => {
      const x1 = rand(0, width), y1 = rand(0, height);
      const x2 = rand(0, width), y2 = rand(0, height);
      const op = rand(0.25, 0.45).toFixed(2);
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="${op}" stroke-width="${rand(1,2)}"/>`;
    })
    .join("");
  const dots = Array.from({ length: 35 })
    .map(() => {
      const x = rand(0, width), y = rand(0, height);
      const op = rand(0.15, 0.35).toFixed(2);
      return `<circle cx="${x}" cy="${y}" r="${rand(0.8,2.2)}" fill="white" fill-opacity="${op}"/>`;
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
      <stop offset="0%" stop-color="#1a1a1d"/><stop offset="100%" stop-color="#121214"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <g filter="url(#wavy)" fill="#e7e7ff">${chars}</g>
  <g>${lines}${dots}</g>
</svg>`.trim();
  return { text, svg };
}
const svgDataUrl = (svg: string) =>
  "data:image/svg+xml;utf8," + encodeURIComponent(svg);

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
      PaperProps={{
        sx: {
          bgcolor: vars.bgCard,
          color: vars.text,
          border: `1px solid ${vars.border}`,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{t("Verify you’re human")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1 }}>
          <img
            src={svgDataUrl(cap.svg)}
            alt="captcha"
            style={{
              width: "100%",
              height: 80,
              borderRadius: 8,
              border: `1px solid ${vars.border}`,
            }}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("Type the letters")}
              size="small"
              fullWidth
              sx={(tMui) => ({
                ...sxPresets.ctrl,
                "& .MuiOutlinedInput-root": {
                  height: 36,
                  background: (tMui as any).palette.mode === "dark" ? "#232325" : "#fff",
                },
              })}
            />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: vars.border }}>
              {t("Refresh")}
            </Button>
          </Box>
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
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#7C57F2", "&:hover": { bgcolor: "#6b46f1" } }}
        >
          {t("Verify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- AWS Contacts PANEL ---------------- */
function AwsContactsPanel() {
  const { t } = useI18n();

  const [gs, setGs] = React.useState<"gs1" | "gs2">("gs1");

  // Filters
  const [region, setRegion] = React.useState<string>("sa-east-1");
  const [satelliteArn, setSatelliteArn] = React.useState<string>("");
  const [groundStation, setGroundStation] = React.useState<string>("any");
  const [missionProfileArn, setMissionProfileArn] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("AVAILABLE");

  const [startTime, setStartTime] = React.useState<string>(() => {
    const d = new Date(Date.now() - 24 * 3600 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = React.useState<string>(() => {
    const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  type Opt = { id: string; label?: string; name?: string; arn?: string };
  const [satOptions, setSatOptions] = React.useState<Opt[]>([]);
  const [gsOptions, setGsOptions] = React.useState<Opt[]>([]);
  const [mpOptions, setMpOptions] = React.useState<Opt[]>([]);
  const [optionsReady, setOptionsReady] = React.useState(false);

  type ContactRow = {
    contactId: string | null; // real contactId or null
    status: string;
    catalogLabel: string;
    groundStation: string;
    startTime: string | null;
    endTime: string | null;
    maxElevationDeg?: number;
    id: string; // UI-only fallback id (always string now)
  };
  const [rows, setRows] = React.useState<ContactRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const saveUpcomingFilters = React.useCallback(
    (
      payload?: Partial<{
        region: string;
        satelliteArn: string | null;
        missionProfileArn: string | null;
        groundStation: string | null;
      }>
    ) => {
      const data = {
        region,
        satelliteArn: satelliteArn || null,
        missionProfileArn: missionProfileArn || null,
        groundStation: groundStation === "any" ? null : groundStation,
        ...(payload || {}),
      };
      try {
        localStorage.setItem("awsUpcomingFilters", JSON.stringify(data));
        window.dispatchEvent(new Event("awsUpcomingFiltersChanged"));
      } catch {}
    },
    [region, satelliteArn, missionProfileArn, groundStation]
  );

  const loadOptions = React.useCallback(async () => {
    setOptionsReady(false);
    try {
      const data = await api.get<any>(`/api/aws-contacts/options`, {
        params: { region, gs },
      });

      const sats: Opt[] = (data?.satellites || []).map((s: any) => ({
        id: s.arn || s.id,
        label: s.label || s.name || s.id,
        arn: s.arn || s.id,
      }));

      const preferredNorad = preferredNoradForGs(gs);
      let satsFiltered = sats;
      if (preferredNorad) {
        const match = sats.find(
          (s) =>
            String(s.label || "").includes(preferredNorad) ||
            String(s.label || "").toUpperCase().includes("SD" + (preferredNorad === "62459" ? "1" : "2"))
        );
        if (match) {
          satsFiltered = sats;
        }
      }

      setSatOptions(satsFiltered);

      const gss: Opt[] = (data?.groundStations || []).map((g: any) => ({
        id: g.id,
        label: g.label,
      }));
      setGsOptions([{ id: "any", label: t("Any") }, ...gss]);

      const mps: Opt[] = (data?.missionProfiles || []).map((m: any) => ({
        id: m.arn || m.id,
        label: m.name || m.id,
        arn: m.arn || m.id,
      }));
      setMpOptions([{ id: "", label: t("Any") }, ...mps]);

      if (status === "AVAILABLE") {
        let nextSat = satelliteArn;
        let nextMp = missionProfileArn;
        if (!nextSat && sats.length) {
          const prefNorad = preferredNoradForGs(gs);
          if (prefNorad) {
            const pref = sats.find((s: any) => String(s.label || "").includes(prefNorad) || String(s.label || "").toUpperCase().includes(`SD${prefNorad === "62459" ? "1" : "2"}`));
            if (pref) nextSat = pref.arn as string;
          }
          if (!nextSat) nextSat = sats[0].arn as string;
        }
        if (!nextMp && mps.length) nextMp = (mps[0].arn || mps[0].id) as string;

        if (nextSat !== satelliteArn) setSatelliteArn(nextSat || "");
        if (nextMp !== missionProfileArn) setMissionProfileArn(nextMp || "");

        saveUpcomingFilters({
          satelliteArn: nextSat || null,
          missionProfileArn: nextMp || null,
          groundStation: groundStation === "any" ? null : groundStation,
        });
      } else {
        saveUpcomingFilters();
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to load AWS options"));
    } finally {
      setOptionsReady(true);
    }
  }, [region, gs, status, satelliteArn, missionProfileArn, groundStation, t, saveUpcomingFilters]);

  const labelForCatalog = React.useCallback(
    (c: any): string => {
      const fromSelected = satOptions.find((s) => s.arn === satelliteArn)?.label || "";
      if (fromSelected) return fromSelected;

      const num =
        c.catalogNumber ?? c.norad ?? c.noradSatelliteId ?? c.noradSatelliteID ?? null;

      if (String(num) === "62459") return "62459 (SPADEX-SD1)";
      if (String(num) === "62460") return "62460 (SPADEX-SD2)";
      return String(num || "—");
    },
    [satOptions, satelliteArn]
  );

  const toUtc = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const opts: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
    return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(d);
  };

  const loadContacts = React.useCallback(async () => {
    try {
      setLoading(true);

      const satEffective = satelliteArn || (status === "AVAILABLE" && satOptions[0]?.arn) || "";
      const mpEffective = missionProfileArn || (status === "AVAILABLE" && mpOptions[0]?.arn) || "";
      const gsEffective =
        groundStation === "any"
          ? (gsOptions[1]?.id || "")
          : groundStation || "";

      if (status === "AVAILABLE" && (!satEffective || !mpEffective)) {
        if (!satelliteArn && satOptions.length) setSatelliteArn(satOptions[0].arn || "");
        if (!missionProfileArn && mpOptions.length) setMissionProfileArn(mpOptions[0].arn || "");
        alert(
          t(
            "Selecting AVAILABLE requires a satellite and mission profile. Defaults were applied if available — press Refresh."
          )
        );
        setRows([]);
        return;
      }

      const body = {
        region,
        gs,
        filters: {
          satellite: satEffective || null,
          groundStation: gsEffective || null,
          missionProfileArn: mpEffective || null,
          statusList: status ? [status] : [],
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
        },
        pageToken: null,
      };

      const res = await api.post<any>(`/api/aws-contacts/list`, body);

      const items: ContactRow[] = (res?.items || []).map((c: any, i: number) => {
        const fallback = `${i}-${(c.startTime || "").replace(/[:.]/g, "")}-${Math.random().toString(36).slice(2,5)}`;
        const stableId = String(c.contactId ?? fallback);
        return {
          contactId: c.contactId ?? null,
          status: c.status ?? c.contactStatus ?? "UNKNOWN",
          catalogLabel: labelForCatalog(c),
          groundStation: c.groundStation || c.groundStationName || "",
          startTime: c.startTime || null,
          endTime: c.endTime || null,
          maxElevationDeg:
            typeof c.maximumElevationDeg === "number"
              ? c.maximumElevationDeg
              : undefined,
          id: stableId,
        };
      });
      setRows(items);
    } catch (e: any) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [
    region,
    satelliteArn,
    groundStation,
    missionProfileArn,
    status,
    startTime,
    endTime,
    labelForCatalog,
    gs,
    satOptions,
    mpOptions,
    gsOptions,
    t,
  ]);

  React.useEffect(() => {
    loadOptions();
  }, [loadOptions, gs]);

  React.useEffect(() => {
    if (!optionsReady) return;
    loadContacts();
  }, [
    optionsReady,
    region,
    satelliteArn,
    groundStation,
    missionProfileArn,
    status,
    startTime,
    endTime,
    loadContacts,
    gs,
  ]);

  const statusColor = (s: string) => {
    switch (s) {
      case "AVAILABLE":
        return "#10b981";
      case "SCHEDULED":
        return "#38bdf8";
      case "COMPLETED":
        return "#a78bfa";
      case "CANCELLED":
        return "#f97316";
      case "AWS_CANCELLED":
        return "#f59e0b";
      default:
        return vars.textDim;
    }
  };

  return (
    <Card sx={{ ...CARD_SX, height: "100%" }}>
      <Box sx={{ px: 1.25, py: 0.7, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("AWS Contacts")}</Typography>
        <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui), minWidth: 180 })}>
            <InputLabel>{t("GS")}</InputLabel>
            <Select value={gs} label={t("GS")} onChange={(e) => setGs(e.target.value as "gs1" | "gs2")}>
              <MenuItem value="gs1">{t("Groundstation 1")}</MenuItem>
              <MenuItem value="gs2">{t("Groundstation 2")}</MenuItem>
            </Select>
          </FormControl>

          <Button size="small" onClick={() => loadContacts()} disabled={loading} sx={{ textTransform: "none", fontWeight: 700, color: vars.accent }}>
            {t("Refresh")}
          </Button>
        </Box>
      </Box>

      {/* Filters */}
       <Box
        sx={{
          px: 1.25,
          py: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(6, minmax(0,1fr))" },
          gap: 1,
        }}
      >
        {/* Region */}
        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Region")}</InputLabel>
          <Select
            value={region}
            label={t("Region")}
            onChange={(e) => {
              const newRegion = String(e.target.value);
              setRegion(newRegion);
              setSatelliteArn("");
              setMissionProfileArn("");
              setGroundStation("any");
              setTimeout(() => {
                saveUpcomingFilters({
                  region: newRegion,
                  satelliteArn: null,
                  missionProfileArn: null,
                  groundStation: null,
                });
              }, 0);
            }}
          >
            {REGION_OPTIONS.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {KNOWN_REGION_LABELS[o.id] ?? o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Satellite number */}
        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Satellite number")}</InputLabel>
          <Select
            value={satelliteArn}
            label={t("Satellite number")}
            onChange={(e) => setSatelliteArn(String(e.target.value))}
            displayEmpty
            renderValue={(v) =>
              v ? (satOptions.find((s) => s.arn === v)?.label || v) : t("Select satellite")
            }
          >
            {satOptions.map((s) => (
              <MenuItem key={s.id} value={s.arn as string}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Ground station */}
        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Ground station")}</InputLabel>
          <Select
            value={groundStation}
            label={t("Ground station")}
            onChange={(e) => setGroundStation(String(e.target.value))}
            displayEmpty
            renderValue={(v) =>
              v === "any"
                ? t("Any")
                : (gsOptions.find((g) => g.id === v)?.label || v)
            }
          >
            {gsOptions.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status */}
        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Status")}</InputLabel>
          <Select
            value={status}
            label={t("Status")}
            onChange={(e) => setStatus(String(e.target.value))}
          >
            {["AVAILABLE", "SCHEDULED", "COMPLETED", "AWS_CANCELLED", "CANCELLED"].map(
              (s) => (
                <MenuItem key={s} value={s}>
                  {t(s)}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        {/* Mission profile */}
        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Mission profile")}</InputLabel>
          <Select
            value={missionProfileArn}
            label={t("Mission profile")}
            onChange={(e) => setMissionProfileArn(String(e.target.value))}
            displayEmpty
            renderValue={(v) =>
              v
                ? (mpOptions.find((m) => (m.arn || m.id) === v)?.label || v)
                : t("Any")
            }
          >
            {mpOptions.map((m) => (
              <MenuItem key={m.id} value={(m.arn || m.id) as string}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
          <TextField
            type="datetime-local"
            size="small"
            label={t("Start time")}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
          />
          <TextField
            type="datetime-local"
            size="small"
            label={t("End time")}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
          />
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
        <TableContainer
          sx={{
            maxHeight: "100%",
            borderTop: `1px solid ${vars.border}`,
            borderBottom: `1px solid ${vars.border}`,
          }}
        >
          <Table stickyHeader size="small" sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>{t("Contact Id")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Status")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Catalog number")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Ground station")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Start time (UTC)")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("End time (UTC)")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Max elevation (deg)")}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r, idx) => (
                <TableRow
                  key={r.id || idx}
                  hover
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: (t) =>
                        t.palette.mode === "dark" ? "#17171A" : "#FAFAFA",
                    },
                    "& td, & th": { borderColor: vars.border, fontSize: 13, py: 1.0 },
                  }}
                >
                  <TableCell
                    title={
                      r.contactId
                        ? String(r.contactId)
                        : `${t("Contact Available")}, ${t("Catalog number")}: ${r.catalogLabel}, ${t("Start time (UTC)")}: ${toUtc(r.startTime)}, ${t("End time (UTC)")}: ${toUtc(r.endTime)}`
                    }
                  >
                    {r.contactId ? r.contactId : t("Contact Available")}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={r.status}
                      sx={{
                        height: 22,
                        fontSize: 12,
                        bgcolor: statusColor(r.status),
                        color: "#000",
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>

                  <TableCell align="center">{r.catalogLabel}</TableCell>
                  <TableCell align="center">{r.groundStation || "-"}</TableCell>

                  <TableCell align="center">{toUtc(r.startTime)}</TableCell>
                  <TableCell align="center">{toUtc(r.endTime)}</TableCell>

                  <TableCell align="center">
                    {typeof r.maxElevationDeg === "number"
                      ? r.maxElevationDeg.toFixed(2)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}

              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ color: vars.textDim, py: 3 }}>
                    {t("No Contacts Found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}

/* ---------------- Bulk-upload panel (unchanged except text) ---------------- */
function PassSchedulePanel() {
  const { t } = useI18n();
  const [gs, setGs] = React.useState<string>("");
  const [region, setRegion] = React.useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const [rows, setRows] = React.useState<{ gs: "gs1" | "gs2"; region: string; bucket: string }[]>([]);
  const [gsNew, setGsNew] = React.useState<string>("");
  const [regionNew, setRegionNew] = React.useState<string>("");
  const [bucketNew, setBucketNew] = React.useState<string>("");

  const handleSelectFile = () => fileInputRef.current?.click();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const clearTop = () => setFile(null);

  const findBucket = React.useCallback(() => rows.find((r) => r.gs === gs && r.region === region)?.bucket || "", [rows, gs, region]);

  const handleUpload = async () => {
    if (!gs) return alert(t("Please select a Ground Station."));
    if (!region) return alert(t("Please select a Region."));
    if (!file) return alert(t("Please select a file first."));
    const name = file.name.toLowerCase();
    const mime = (file as any).type || "";
    const isCsv = name.endsWith(".csv") || mime === "text/csv";
    const isTxt = name.endsWith(".txt") || mime === "text/plain";
    if (!isCsv && !isTxt) return alert(t("Only .csv or .txt files are supported."));
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const bucket = findBucket();
      const bucketParam = bucket ? `&bucket=${encodeURIComponent(bucket)}` : "";
      await api.post(`/api/pass-schedule/bulk?gs=${encodeURIComponent(gs)}&region=${encodeURIComponent(region)}${bucketParam}`, fd);
      alert(t("Bulk schedule upload complete."));
      clearTop();
    } catch (e) {
      console.error(e);
      alert(t("Bulk upload failed."));
    } finally {
      setUploading(false);
    }
  };

  type CaptchaAction = "upload";
  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [captchaAction, setCaptchaAction] = React.useState<CaptchaAction | null>(null);
  const runAfterCaptcha = React.useCallback(async () => {
    if (captchaAction === "upload") await handleUpload();
    setCaptchaAction(null);
  }, [captchaAction, gs, region, file, rows]);

  const addRow = async () => {
    if (!gsNew || !regionNew || !bucketNew) return;
    const row = { gs: gsNew as "gs1" | "gs2", region: regionNew.trim(), bucket: bucketNew.trim() };
    setRows((prev) => {
      const filtered = prev.filter((r) => !(r.gs === row.gs && r.region === row.region));
      return [row, ...filtered];
    });
    try {
      await api.post("/api/pass-schedule/regions", row);
    } catch {}
    setBucketNew("");
  };
  const removeRow = async (idx: number) => {
    const r = rows[idx];
    setRows((prev) => prev.filter((_, i) => i !== idx));
    try {
      await api.post("/api/pass-schedule/regions/delete", r);
    } catch {}
  };

  const prettyFileName = React.useMemo(() => (file ? file.name.replace(/(\.txt){2}$/i, ".txt").replace(/(\.csv){2}$/i, ".csv") : ""), [file]);

  return (
    <>
      <Backdrop open={uploading} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>{t("Uploading… this may take a while for large files.")}</Typography>
        </Box>
      </Backdrop>

      <Card sx={{ ...CARD_SX, height: "100%" }}>
        <Box sx={{ px: 1.25, py: 0.7, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("Bulk Passes Upload")}</Typography>
          <Box sx={{ ml: "auto" }}>
            <Button onClick={() => { setGs(""); setRegion(""); }} size="small" sx={{ textTransform: "none", fontWeight: 700, color: COLORS.link, px: 1, minWidth: 0 }}>
              {t("Clear")}
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 1.25, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.25 }}>
          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Select Ground Station *")}</InputLabel>
            <Select label={t("Select Ground Station *")} value={gs} onChange={(e) => setGs(String(e.target.value))}>
              <MenuItem value="gs1">{t("Groundstation 1")}</MenuItem>
              <MenuItem value="gs2">{t("Groundstation 2")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Select Region *")}</InputLabel>
            <Select label={t("Select Region *")} value={region} onChange={(e) => setRegion(String(e.target.value))} MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}>
              {REGION_OPTIONS.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {KNOWN_REGION_LABELS[o.id] ?? o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ borderTop: `1px solid ${vars.border}` }} />

        <Box sx={{ p: 1, pl: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: { xs: "wrap", lg: "nowrap" } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 12, ml: { lg: 2 }, color: vars.text }}>{t("Step 2: Fill it & Upload")}</Typography>

            <input ref={fileInputRef} type="file" accept=".csv,.txt,text/csv,text/plain" hidden onChange={handleFileChange} />
            <Button variant="contained" size="small" onClick={handleSelectFile} disabled={uploading} sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
              {t("Select File")}
            </Button>

            {file && (
              <Chip label={prettyFileName} onDelete={uploading ? undefined : clearTop} sx={(tMui) => ({
                bgcolor: (tMui as any).palette.mode === "dark" ? "#232325" : "#fff",
                color: (tMui as any).palette.mode === "dark" ? vars.text : "#000",
                border: `1px solid ${vars.border}`,
                ".MuiChip-deleteIcon": { color: vars.textDim },
              })} />
            )}
          </Box>

          <Button variant="contained" size="medium" startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />} disabled={!file || uploading} onClick={() => { setCaptchaAction("upload"); setCaptchaOpen(true); }} sx={{ textTransform: "none", fontWeight: 700, bgcolor: COLORS.purple, "&:hover": { bgcolor: "#6b46f1" }, "&.Mui-disabled": { bgcolor: vars.bgCtrl, color: vars.textDim, border: `1px solid ${vars.border}`, boxShadow: "none", opacity: 1 } }}>
            {uploading ? t("Uploading...") : t("Upload")}
          </Button>
        </Box>

        {SHOW_REGION_BUCKETS && (
          <>
            <Box sx={{ borderTop: `1px solid ${vars.border}` }} />
            <Box sx={{ px: 1.25, py: 0.7, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("Regions & Buckets")}</Typography>
            </Box>

            <Box sx={{ p: 1.25, display: "grid", gap: 1.25 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "140px 240px 1fr 100px" }, gap: 1 }}>
                <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
                  <InputLabel>{t("GS")}</InputLabel>
                  <Select label={t("GS")} value={gsNew} onChange={(e) => setGsNew(String(e.target.value))}>
                    <MenuItem value="gs1">{t("Groundstation 1")}</MenuItem>
                    <MenuItem value="gs2">{t("Groundstation 2")}</MenuItem>
                  </Select>
                </FormControl>

                <TextField size="small" placeholder={t("Region (e.g., sa-east-1)")} value={regionNew} onChange={(e) => setRegionNew(e.target.value)} onBlur={() => setRegionNew((v) => v.trim())} sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />

                <TextField size="small" placeholder={t("Bucket name")} value={bucketNew} onChange={(e) => setBucketNew(e.target.value)} sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />

                <Button onClick={addRow} variant="contained" disabled={!gsNew || !regionNew || !bucketNew} sx={{ textTransform: "none", fontWeight: 700 }}>{t("Add")}</Button>
              </Box>

              <Table size="small" sx={{ borderColor: vars.border, borderWidth: 1, borderStyle: "solid", borderRadius: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: vars.textDim }}>{t("GS")}</TableCell>
                    <TableCell sx={{ color: vars.textDim }}>{t("Region")}</TableCell>
                    <TableCell sx={{ color: vars.textDim }}>{t("Bucket")}</TableCell>
                    <TableCell sx={{ color: vars.textDim }} align="right">{t("Action")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ color: vars.textDim }}>{t("No custom mappings yet. Add one above (optional).")}</TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, i) => (
                      <TableRow key={`${r.gs}-${r.region}`}>
                        <TableCell>{r.gs}</TableCell>
                        <TableCell>{KNOWN_REGION_LABELS[r.region] || r.region}</TableCell>
                        <TableCell>{r.bucket}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={() => removeRow(i)} size="small">
                            <DeleteOutlineIcon sx={{ fontSize: 18, color: vars.textDim }} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Box>
          </>
        )}
      </Card>

      <CaptchaDialog open={captchaOpen} onCancel={() => { setCaptchaOpen(false); setCaptchaAction(null); }} onOk={async () => { setCaptchaOpen(false); await runAfterCaptcha(); }} />
    </>
  );
}

/* ---------------- TLE Update panel (unchanged text replaced) ---------------- */
function TleUpdatePanel() {
  const { t } = useI18n();
  const [gs, setGs] = React.useState<string>("");
  const [region, setRegion] = React.useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const [rows, setRows] = React.useState<{ gs: "gs1" | "gs2"; region: string; bucket: string }[]>([]);
  const [gsNew, setGsNew] = React.useState<string>("");
  const [regionNew, setRegionNew] = React.useState<string>("");
  const [bucketNew, setBucketNew] = React.useState<string>("");

  const handleSelectFile = () => fileInputRef.current?.click();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const clearTop = () => setFile(null);

  const findBucket = React.useCallback(() => rows.find((r) => r.gs === gs && r.region === region)?.bucket || "", [rows, gs, region]);

  const handleUpload = async () => {
    if (!gs) return alert(t("Please select a Ground Station."));
    if (!region) return alert(t("Please select a Region."));
    if (!file) return alert(t("Please select a file first."));

    const name = file.name.toLowerCase();
    const mime = (file as any).type || "";
    const isTxt = name.endsWith(".txt") || name.endsWith(".tle") || mime === "text/plain";
    const isJson = name.endsWith(".json") || mime === "application/json";
    if (!isTxt && !isJson) {
      return alert(t("Only .txt, .tle or .json files are supported."));
    }

    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const bucket = findBucket();
      const bucketParam = bucket ? `&bucket=${encodeURIComponent(bucket)}` : "";
      await api.post(`/api/tle-update/upload?gs=${encodeURIComponent(gs)}&region=${encodeURIComponent(region)}${bucketParam}`, fd);
      alert(t("TLE uploaded."));
      clearTop();
    } catch (e) {
      console.error(e);
      alert(t("TLE upload failed."));
    } finally {
      setUploading(false);
    }
  };

  type CaptchaAction = "upload";
  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [captchaAction, setCaptchaAction] = React.useState<CaptchaAction | null>(null);
  const runAfterCaptcha = React.useCallback(async () => {
    if (captchaAction === "upload") await handleUpload();
    setCaptchaAction(null);
  }, [captchaAction, gs, region, file, rows]);

  const addRow = async () => {
    if (!gsNew || !regionNew || !bucketNew) return;
    const row = { gs: gsNew as "gs1" | "gs2", region: regionNew.trim(), bucket: bucketNew.trim() };
    setRows((prev) => {
      const filtered = prev.filter((r) => !(r.gs === row.gs && r.region === row.region));
      return [row, ...filtered];
    });
    try {
      await api.post("/api/tle-update/regions", row);
    } catch {}
    setBucketNew("");
  };
  const removeRow = async (idx: number) => {
    const r = rows[idx];
    setRows((prev) => prev.filter((_, i) => i !== idx));
    try {
      await api.post("/api/tle-update/regions/delete", r);
    } catch {}
  };

  const prettyFileName = React.useMemo(() => (file ? file.name.replace(/(\.txt){2}$/i, ".txt").replace(/(\.tle){2}$/i, ".tle").replace(/(\.json){2}$/i, ".json") : ""), [file]);

  return (
    <>
      <Backdrop open={uploading} sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>{t("Uploading…")}</Typography>
        </Box>
      </Backdrop>

      <Card sx={{ ...CARD_SX, height: "100%" }}>
        <Box sx={{ px: 1.25, py: 0.7, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("Update TLE")}</Typography>
          <Box sx={{ ml: "auto" }}>
            <Button onClick={() => { setGs(""); setRegion(""); }} size="small" sx={{ textTransform: "none", fontWeight: 700, color: COLORS.link, px: 1, minWidth: 0 }}>
              {t("Clear")}
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 1.25, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.25 }}>
          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Select Ground Station *")}</InputLabel>
            <Select label={t("Select Ground Station *")} value={gs} onChange={(e) => setGs(String(e.target.value))}>
              <MenuItem value="gs1">{t("Groundstation 1")}</MenuItem>
              <MenuItem value="gs2">{t("Groundstation 2")}</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Select Region *")}</InputLabel>
            <Select label={t("Select Region *")} value={region} onChange={(e) => setRegion(String(e.target.value))} MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}>
              {REGION_OPTIONS.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {KNOWN_REGION_LABELS[o.id] ?? o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ borderTop: `1px solid ${vars.border}` }} />
        <Box sx={{ p: 1, pl: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: { xs: "wrap", lg: "nowrap" } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 12, color: vars.text }}>{t("Select & Upload TLE (.txt / .tle / .json)")}</Typography>

            <input ref={fileInputRef} type="file" accept=".txt,.tle,.json,text/plain,application/json" hidden onChange={handleFileChange} />
            <Button variant="contained" size="small" onClick={handleSelectFile} disabled={uploading} sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
              {t("Select File")}
            </Button>

            {file && (
              <Chip label={prettyFileName} onDelete={uploading ? undefined : clearTop} sx={(tMui) => ({ bgcolor: (tMui as any).palette.mode === "dark" ? "#232325" : "#fff", color: (tMui as any).palette.mode === "dark" ? vars.text : "#000", border: `1px solid ${vars.border}`, ".MuiChip-deleteIcon": { color: vars.textDim } })} />
            )}
          </Box>

          <Button variant="contained" size="medium" startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />} disabled={!file || uploading} onClick={() => { setCaptchaAction("upload"); setCaptchaOpen(true); }} sx={{ textTransform: "none", fontWeight: 700, bgcolor: COLORS.purple, "&:hover": { bgcolor: "#6b46f1" }, "&.Mui-disabled": { bgcolor: vars.bgCtrl, color: vars.textDim, border: `1px solid ${vars.border}`, boxShadow: "none", opacity: 1 } }}>
            {uploading ? t("Uploading...") : t("Upload")}
          </Button>
        </Box>
      </Card>

      <CaptchaDialog open={captchaOpen} onCancel={() => { setCaptchaOpen(false); setCaptchaAction(null); }} onOk={async () => { setCaptchaOpen(false); await runAfterCaptcha(); }} />
    </>
  );
}

/* ---------------- NEW: AWS Manual Panel ---------------- */
function AwsManualPanel() {
  const { t } = useI18n();

  const [gs, setGs] = React.useState<"gs1" | "gs2">("gs1");
  const [region, setRegion] = React.useState<string>("sa-east-1");
  const [satelliteArn, setSatelliteArn] = React.useState<string>("");
  const [groundStation, setGroundStation] = React.useState<string>("any");
  const [missionProfileArn, setMissionProfileArn] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("AVAILABLE");

  const [startTime, setStartTime] = React.useState<string>(() => {
    const d = new Date(Date.now() - 24 * 3600 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [endTime, setEndTime] = React.useState<string>(() => {
    const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });

  type Opt = { id: string; label?: string; arn?: string };
  const [satOptions, setSatOptions] = React.useState<Opt[]>([]);
  const [gsOptions, setGsOptions] = React.useState<Opt[]>([]);
  const [mpOptions, setMpOptions] = React.useState<Opt[]>([]);
  const [optionsReady, setOptionsReady] = React.useState(false);

  type ContactRow = {
    contactId: string | null;
    status: string;
    catalogLabel: string;
    groundStation: string;
    startTime: string | null;
    endTime: string | null;
    maxElevationDeg?: number;
    id: string;
  };
  const [rows, setRows] = React.useState<ContactRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);

  const loadOptions = React.useCallback(async () => {
    setOptionsReady(false);
    try {
      const data = await api.get<any>(`/api/aws-contacts/options`, { params: { region, gs } });
      const sats: Opt[] = (data?.satellites || []).map((s: any) => ({ id: s.arn || s.id, label: s.label || s.name || s.id, arn: s.arn || s.id }));
      const preferredNorad = preferredNoradForGs(gs);
      if (preferredNorad) {
        const pref = sats.find((s) => String(s.label || "").includes(preferredNorad) || String(s.label || "").toUpperCase().includes(`SD${preferredNorad === "62459" ? "1" : "2"}`));
        if (pref) {
          setSatOptions(sats);
          if (!satelliteArn) setSatelliteArn(pref.arn || "");
        } else {
          setSatOptions(sats);
        }
      } else {
        setSatOptions(sats);
      }

      const gss: Opt[] = (data?.groundStations || []).map((g: any) => ({ id: g.id, label: g.label }));
      setGsOptions([{ id: "any", label: t("Any") }, ...gss]);

      const mps: Opt[] = (data?.missionProfiles || []).map((m: any) => ({ id: m.arn || m.id, label: m.name || m.id, arn: m.arn || m.id }));
      setMpOptions([{ id: "", label: t("Any") }, ...mps]);

      if (status === "AVAILABLE") {
        let nextSat = satelliteArn;
        let nextMp = missionProfileArn;
        if (!nextSat && sats.length) {
          const prefNorad = preferredNoradForGs(gs);
          if (prefNorad) {
            const pref = sats.find((s: any) => String(s.label || "").includes(prefNorad) || String(s.label || "").toUpperCase().includes(`SD${prefNorad === "62459" ? "1" : "2"}`));
            if (pref) nextSat = pref.arn as string;
          }
          if (!nextSat) nextSat = sats[0].arn as string;
        }
        if (!nextMp && mps.length) nextMp = (mps[0].arn || mps[0].id) as string;

        if (nextSat !== satelliteArn) setSatelliteArn(nextSat || "");
        if (nextMp !== missionProfileArn) setMissionProfileArn(nextMp || "");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptionsReady(true);
    }
  }, [region, gs, status, satelliteArn, missionProfileArn, t]);

  const loadContacts = React.useCallback(async () => {
    try {
      setLoading(true);

      const satEffective = satelliteArn || (status === "AVAILABLE" && satOptions[0]?.arn) || "";
      const mpEffective = missionProfileArn || (status === "AVAILABLE" && mpOptions[0]?.arn) || "";
      const gsEffective = groundStation === "any" ? (gsOptions[1]?.id || "") : groundStation || "";

      if (status === "AVAILABLE" && (!satEffective || !mpEffective)) {
        if (!satelliteArn && satOptions.length) setSatelliteArn(satOptions[0].arn || "");
        if (!missionProfileArn && mpOptions.length) setMissionProfileArn(mpOptions[0].arn || "");
        alert(t("AVAILABLE requires satellite + mission profile. Defaults applied if available. Press Refresh."));
        setRows([]);
        return;
      }

      const body = {
        region,
        gs,
        filters: {
          satellite: satEffective || null,
          groundStation: gsEffective || null,
          missionProfileArn: mpEffective || null,
          statusList: status ? [status] : [],
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
        },
        pageToken: null,
      };
      const res = await api.post<any>(`/api/aws-contacts/list`, body);
      const items: ContactRow[] = (res?.items || []).map((c: any, i: number) => {
        const fallback = `${i}-${(c.startTime || "").replace(/[:.]/g, "")}-${Math.random().toString(36).slice(2,5)}`;
        const stableId = String(c.contactId ?? fallback);
        return {
          contactId: c.contactId ?? null,
          status: c.contactStatus ?? c.status ?? "UNKNOWN",
          catalogLabel: c.catalogNumber ?? (c.satellite || "—"),
          groundStation: c.groundStation || c.groundStationName || "",
          startTime: c.startTime || null,
          endTime: c.endTime || null,
          maxElevationDeg: typeof c.maximumElevationDeg === "number" ? c.maximumElevationDeg : undefined,
          id: stableId,
        };
      });
      setRows(items);
      setSelected({});
      setSelectAll(false);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [region, gs, satelliteArn, groundStation, missionProfileArn, status, startTime, endTime, satOptions, mpOptions, gsOptions, t]);

  React.useEffect(() => {
    loadOptions();
  }, [loadOptions, gs]);

  React.useEffect(() => {
    if (!optionsReady) return;
    loadContacts();
  }, [optionsReady, loadContacts]);

  const statusColor = (s: string) => {
    switch (s) {
      case "AVAILABLE":
        return "#10b981";
      case "SCHEDULED":
        return "#38bdf8";
      case "COMPLETED":
        return "#a78bfa";
      case "CANCELLED":
        return "#f97316";
      case "AWS_CANCELLED":
        return "#f59e0b";
      default:
        return vars.textDim;
    }
  };

  const toggleRow = (id?: string | null) => {
    if (!id) return;
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setSelected((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      const allSelected = rows.length > 0 && rows.every((r) => next[r.id] === true);
      setSelectAll(allSelected);
      return next;
    });
  };

  const toggleAll = () => {
    if (!selectAll) {
      const sel: Record<string, boolean> = {};
      rows.forEach((r) => {
        if (r.id) sel[r.id] = true;
      });
      setSelected(sel);
      setSelectAll(true);
    } else {
      setSelected({});
      setSelectAll(false);
    }
  };

  const selectedIds = React.useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);

  const performAction = async (action: "reserve" | "cancel") => {
    if (!selectedIds.length) return alert(t("Select at least one contact."));

    const selectedRows = selectedIds
      .map((id) => rows.find((r) => r.id === id) || null)
      .filter(Boolean) as typeof rows;

    if (!selectedRows.length) {
      alert(t("No valid rows selected."));
      return;
    }

    if (action === "reserve") {
      const payloadItems = selectedRows.map((r) => {
        if (r.contactId) return r.contactId;
        return {
          startTime: r.startTime,
          endTime: r.endTime,
          satelliteArn: satelliteArn || undefined,
          groundStation: r.groundStation || undefined,
          missionProfileArn: missionProfileArn || undefined,
        };
      });

      if (!window.confirm(t(`Schedule ${payloadItems.length} selected contact(s)?`))) return;

      try {
        setActionLoading(true);
        const res = await api.post(`/api/aws-contacts/action`, { action: "reserve", contactIds: payloadItems, gs, region, groundStation });
        const results = res?.data?.results || res?.results || null;
        console.log("[awsManualPanel] reserve results:", results || res);
        if (results && Array.isArray(results)) {
          const success = results.filter((r: any) => r.success).length;
          const failed = results.length - success;
          alert(t(`Schedule done: ${success} succeeded, ${failed} failed. Check console/AWS for details.`));
        } else {
          alert(t("Schedule request sent; check console/AWS for results."));
        }
        await new Promise((r) => setTimeout(r, 900));
        await loadContacts();
      } catch (e) {
        console.error(e);
        alert(t("Failed to schedule contacts. See console for details."));
      } finally {
        setActionLoading(false);
      }
      return;
    }

    // CANCEL path
    try {
      setActionLoading(true);
      const realIds = selectedRows.map((r) => r.contactId).filter(Boolean) as string[];
      const skipped = selectedRows.filter((r) => !r.contactId);

      if (!realIds.length) {
        alert(t("No selected rows have valid Contact IDs to cancel. Rows without a Contact ID were skipped."));
        setActionLoading(false);
        return;
      }

      if (!window.confirm(t(`Cancel ${realIds.length} contact(s)? ${skipped.length ? `\n${skipped.length} selected row(s) will be skipped because they lack Contact Id.` : ""}`))) {
        setActionLoading(false);
        return;
      }

      const res = await api.post(`/api/aws-contacts/action`, { action: "cancel", contactIds: realIds, gs, region, groundStation });
      const results = res?.data?.results || res?.results || null;
      console.log("[awsManualPanel] cancel results:", results || res);

      if (results && Array.isArray(results)) {
        const removedIds: string[] = [];
        const failed: any[] = [];
        for (const r of results) {
          if (r.success === true) {
            removedIds.push(String(r.contactId || r.contactId === 0 ? r.contactId : ""));
          } else if (r.treatAsCancelled === true) {
            removedIds.push(String(r.contactId || ""));
          } else {
            failed.push(r);
          }
        }

        if (removedIds.length) {
          setRows((prev) => prev.filter((row) => !removedIds.includes(String(row.contactId || row.id))));
          setSelected((prev) => {
            const next = { ...prev };
            removedIds.forEach((id) => delete next[id]);
            return next;
          });
          setSelectAll(false);
        }

        if (failed.length) {
          alert(t(`Cancel completed with ${removedIds.length} removed, ${failed.length} failed. See console for details.`));
        } else {
          alert(t(`Cancel completed: ${removedIds.length} removed.`));
        }
      } else {
        alert(t("Cancel request sent. Check AWS console for results."));
      }

      await new Promise((r) => setTimeout(r, 1100));
      await loadContacts();
    } catch (e) {
      console.error(e);
      alert(t(`Failed to cancel contacts.`));
    } finally {
      setActionLoading(false);
    }
  };

  const toUtcLocal = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    const opts: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    };
    return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(d);
  };

  return (
    <Card sx={{ ...CARD_SX, height: "100%" }}>
      <Box sx={{ px: 1.25, py: 0.7, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>{t("AWS Contact (Manual)")}</Typography>

        <Box sx={{ ml: "auto", display: "flex", gap: 1, alignItems: "center" }}>
          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui), minWidth: 180 })}>
            <InputLabel>{t("GS")}</InputLabel>
            <Select value={gs} label={t("GS")} onChange={(e) => setGs(e.target.value as "gs1" | "gs2")}>
              <MenuItem value="gs1">{t("Groundstation 1")}</MenuItem>
              <MenuItem value="gs2">{t("Groundstation 2")}</MenuItem>
            </Select>
          </FormControl>

          <Button size="small" onClick={() => loadContacts()} disabled={loading} sx={{ textTransform: "none", fontWeight: 700, color: vars.accent }}>
            {t("Refresh")}
          </Button>
        </Box>
      </Box>

      <Box sx={{ px: 1.25, py: 1, display: "flex", gap: 1, alignItems: "center" }}>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" disabled={actionLoading || selectedIds.length === 0} onClick={() => performAction("reserve")} sx={{ textTransform: "none", fontWeight: 700, bgcolor: "#ff9800" }}>
            {t("Schedule contact")}
          </Button>
          <Button variant="outlined" disabled={actionLoading || selectedIds.length === 0} onClick={() => performAction("cancel")} sx={{ textTransform: "none", fontWeight: 700 }}>
            {t("Cancel contact")}
          </Button>
        </Stack>

        <Box sx={{ ml: "auto", color: vars.textDim }}>{selectedIds.length ? `${selectedIds.length} ${t("selected")}` : t("No selection")}</Box>
      </Box>

      <Box sx={{ px: 1.25, py: 0.5, display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(6, minmax(0,1fr))" }, gap: 1 }}>
        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Region")}</InputLabel>
          <Select value={region} label={t("Region")} onChange={(e) => { const newRegion = String(e.target.value); setRegion(newRegion); }}>
            {REGION_OPTIONS.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {KNOWN_REGION_LABELS[o.id] ?? o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Satellite number")}</InputLabel>
          <Select value={satelliteArn} label={t("Satellite number")} onChange={(e) => setSatelliteArn(String(e.target.value))} displayEmpty renderValue={(v) => (v ? (satOptions.find((s) => s.arn === v)?.label || v) : t("Select satellite"))}>
            {satOptions.map((s) => (
              <MenuItem key={s.id} value={s.arn as string}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Ground station")}</InputLabel>
          <Select value={groundStation} label={t("Ground station")} onChange={(e) => setGroundStation(String(e.target.value))} displayEmpty renderValue={(v) => (v === "any" ? t("Any") : (gsOptions.find((g) => g.id === v)?.label || v))}>
            {gsOptions.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Status")}</InputLabel>
          <Select value={status} label={t("Status")} onChange={(e) => setStatus(String(e.target.value))}>
            {["AVAILABLE", "SCHEDULED", "COMPLETED", "AWS_CANCELLED", "CANCELLED"].map((s) => (
              <MenuItem key={s} value={s}>
                {t(s)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
          <InputLabel>{t("Mission profile")}</InputLabel>
          <Select value={missionProfileArn} label={t("Mission profile")} onChange={(e) => setMissionProfileArn(String(e.target.value))} displayEmpty renderValue={(v) => (v ? (mpOptions.find((m) => m.arn === v)?.label || v) : t("Any"))}>
            {mpOptions.map((m) => (
              <MenuItem key={m.id} value={(m.arn || m.id) as string}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1 }}>
          <TextField type="datetime-local" size="small" label={t("Start time")} value={startTime} onChange={(e) => setStartTime(e.target.value)} sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />
          <TextField type="datetime-local" size="small" label={t("End time")} value={endTime} onChange={(e) => setEndTime(e.target.value)} sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })} />
        </Box>
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, display: "flex" }}>
        <TableContainer sx={{ maxHeight: "100%", borderTop: `1px solid ${vars.border}`, borderBottom: `1px solid ${vars.border}` }}>
          <Table stickyHeader size="small" sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 40 }}>
                  <Checkbox checked={selectAll} onChange={toggleAll} inputProps={{ "aria-label": "select all contacts" }} />
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{t("Contact Id")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Status")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Catalog number")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Ground station")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Start time (UTC)")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("End time (UTC)")}</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">{t("Max elevation (deg)")}</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.map((r, idx) => (
                <TableRow key={r.id || idx} hover sx={{ "&:nth-of-type(odd)": { backgroundColor: (tMui) => (tMui.palette.mode === "dark" ? "#17171A" : "#FAFAFA") }, "& td, & th": { borderColor: vars.border, fontSize: 13, py: 1.0 } }}>
                  <TableCell>
                    <Checkbox
                      checked={!!(r.id && selected[r.id])}
                      onChange={() => toggleRow(r.id)}
                      inputProps={{ "aria-label": `select ${r.contactId ?? r.id}` }}
                    />
                  </TableCell>

                  <TableCell
                    title={
                      r.contactId
                        ? String(r.contactId)
                        : `${t("Contact Available")}, ${t("Catalog number")}: ${r.catalogLabel}, ${t("Start time (UTC)")}: ${toUtcLocal(r.startTime)}, ${t("End time (UTC)")}: ${toUtcLocal(r.endTime)}`
                    }
                  >
                    {r.contactId ? r.contactId : t("Contact Available")}
                  </TableCell>

                  <TableCell align="center">
                    <Chip size="small" label={r.status} sx={{ height: 22, fontSize: 12, bgcolor: statusColor(r.status), color: "#000", fontWeight: 700 }} />
                  </TableCell>

                  <TableCell align="center">{r.catalogLabel}</TableCell>
                  <TableCell align="center">{r.groundStation || "-"}</TableCell>

                  <TableCell align="center">{toUtcLocal(r.startTime)}</TableCell>
                  <TableCell align="center">{toUtcLocal(r.endTime)}</TableCell>

                  <TableCell align="center">{typeof r.maxElevationDeg === "number" ? r.maxElevationDeg.toFixed(2) : "-"}</TableCell>
                </TableRow>
              ))}

              {!rows.length && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: vars.textDim, py: 3 }}>
                    {t("No Contacts Found")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Card>
  );
}

/* ---------------- Page wrapper (default export) ---------------- */
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
    color: "#7CFF8D",
    bgcolor: (t: any) => (t.palette.mode === "dark" ? "#1D1D20" : "#FFFFFF"),
    border: (t: any) =>
      `1px solid ${t.palette.mode === "dark" ? "rgba(124,255,141,0.18)" : "#7CFF8D"}`,
    boxShadow: (t: any) =>
      t.palette.mode === "dark"
        ? "inset 0 0 0 1px rgba(124,255,141,0.06)"
        : "inset 0 0 0 1px rgba(124,255,141,0.12)",
  },
  "&.Mui-selected:hover": {
    bgcolor: (t: any) => (t.palette.mode === "dark" ? vars.bgHover : "#FFFFFF"),
  },
} as const;

export default function PassSchedulePage() {
  const { t } = useI18n();
  const [tab, setTab] = React.useState<"contacts" | "pass" | "tle" | "awscontact">("contacts");

  return (
    <MainLayout title="">
      <Box sx={{ px: 2, py: 1.5, height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`, display: "grid", gridTemplateRows: "auto 1fr", gap: 1.5 }}>
        <ToggleButtonGroup value={tab} exclusive onChange={(_, v) => v && setTab(v)} sx={{ p: 0.5, borderRadius: 999, border: `1px solid ${vars.border}`, bgcolor: vars.bgCard, width: "fit-content", "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 } }}>
          <ToggleButton value="contacts" disableRipple sx={pillSx}>{t("View Contacts")}</ToggleButton>
          <ToggleButton value="pass" disableRipple sx={pillSx}>{t("Schedule Contacts")}</ToggleButton>
          <ToggleButton value="tle" disableRipple sx={pillSx}>{t("Update TLE")}</ToggleButton>
          <ToggleButton value="awscontact" disableRipple sx={pillSx}>{t("AWS Contact")}</ToggleButton>
        </ToggleButtonGroup>

        {tab === "contacts" ? (
          <AwsContactsPanel />
        ) : tab === "pass" ? (
          <PassSchedulePanel />
        ) : tab === "tle" ? (
          <TleUpdatePanel />
        ) : (
          <AwsManualPanel />
        )}
      </Box>
    </MainLayout>
  );
}
