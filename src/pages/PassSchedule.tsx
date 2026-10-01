// src/pages/PassSchedule.tsx
import React from "react";
import {
  Box,
  Card,
  Button,
  Chip,
  Typography,
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
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Alert,
  TextField,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import api from "../api/http";
import { vars } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";
import {
  type Opt,
  type RegionMetadata,
  controlSx,
  filledField,
  fromUtcInput,
  RegionMetadataCard,
  AwsGroundStationFilterBar,
  AwsGroundStationContactsTable,
} from "../components/AwsGroundStationShared";
import type { ContactItem } from "../components/AwsContactDetailsDialog";

export type { RegionMetadata as RegionItem };

// Fallback initial regions if API is loading or empty
const FALLBACK_REGIONS: RegionMetadata[] = [
  {
    id: 1,
    name: "Cape Town",
    code: "CPT",
    awsRegion: "af-south-1",
    latitude: -33.9249,
    longitude: 18.4241,
    isActive: true,
    stations: [
      { stationType: "SD1", stationName: "Cape Town SD1", stationId: "CP1", groundStation: "GS-001", receiver: "IFR-1", ec2SdrInstanceId: "i-04dca7b61a57c74db", ec2ReceiverInstanceId: "i-09e18b7e39b38ba47" },
      { stationType: "SD2", stationName: "Cape Town SD2", stationId: "CP2", groundStation: "GS-001", receiver: "IFR-1", ec2SdrInstanceId: "i-0f76b7aed11916f7b", ec2ReceiverInstanceId: "i-01355c3be5b62d5d6" }
    ]
  },
  {
    id: 2,
    name: "Dublin",
    code: "DUB",
    awsRegion: "eu-west-1",
    latitude: 53.3498,
    longitude: -6.2603,
    isActive: true,
    stations: [
      { stationType: "SD1", stationName: "Dublin SD1", stationId: "DU1", groundStation: "GS-002", receiver: "IFR-1", ec2SdrInstanceId: "i-0acbbc36feaa58978", ec2ReceiverInstanceId: "i-0a4878491efbc72f9" },
      { stationType: "SD2", stationName: "Dublin SD2", stationId: "DU2", groundStation: "GS-002", receiver: "IFR-1", ec2SdrInstanceId: "i-065b7f39185b032f8", ec2ReceiverInstanceId: "i-01c4a7f62f86aee19" }
    ]
  },
  {
    id: 3,
    name: "Punta Arenas",
    code: "PUQ",
    awsRegion: "sa-east-1",
    latitude: -53.15,
    longitude: -70.9167,
    isActive: true,
    stations: [
      { stationType: "SD1", stationName: "Punta Arenas SD1", stationId: "PA1", groundStation: "GS-003", receiver: "IFR-1", ec2SdrInstanceId: "i-0695e04fdef95e365", ec2ReceiverInstanceId: "i-08ea5a3259f8acb0b" },
      { stationType: "SD2", stationName: "Punta Arenas SD2", stationId: "PA2", groundStation: "GS-003", receiver: "IFR-1", ec2SdrInstanceId: "i-0a9bd425f190bc9cb", ec2ReceiverInstanceId: "i-0c8411b4ba1134a66" }
    ]
  },
  {
    id: 4,
    name: "Dubbo",
    code: "DBO",
    awsRegion: "ap-southeast-2",
    latitude: -32.2569,
    longitude: 148.6011,
    isActive: true,
    stations: [
      { stationType: "SD1", stationName: "Dubbo SD1", stationId: "DB1", groundStation: "GS-004", receiver: "IFR-1", ec2SdrInstanceId: "i-030ae25cf717eb486", ec2ReceiverInstanceId: "i-0cb296f8b1b519069" },
      { stationType: "SD2", stationName: "Dubbo SD2", stationId: "DB2", groundStation: "GS-004", receiver: "IFR-1", ec2SdrInstanceId: "i-0d674cb96472d2427", ec2ReceiverInstanceId: "i-00109a25b306b3f7f" }
    ]
  },
  {
    id: 5,
    name: "Mumbai",
    code: "BOM",
    awsRegion: "ap-south-1",
    latitude: 19.076,
    longitude: 72.8777,
    isActive: true,
    stations: [
      { stationType: "SD1", stationName: "Mumbai SD1", stationId: "MUM1", groundStation: "GS-005", receiver: "IFR-1" },
      { stationType: "SD2", stationName: "Mumbai SD2", stationId: "MUM2", groundStation: "GS-005", receiver: "IFR-1" }
    ]
  }
];

const CARD_SX = {
  bgcolor: vars.bgCard,
  color: vars.text,
  border: `1px solid ${vars.border}`,
  borderRadius: 2,
  display: "flex",
  flexDirection: "column",
  boxShadow: "none",
} as const;

const COLORS = { link: vars.accent, green: "#10B981", purple: "#7C57F2", amber: "#F59E0B", blue: "#0EA5E9" };

/* -------------------- Dynamic Regions Hook -------------------- */
function useDynamicRegions() {
  const [regions, setRegions] = React.useState<RegionMetadata[]>(FALLBACK_REGIONS);
  const [loading, setLoading] = React.useState(true);

  const fetchRegions = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get<any>("/api/regions");
      const list = res?.data || res;
      if (Array.isArray(list) && list.length > 0) {
        setRegions(list.filter((r: any) => r.isActive !== false));
      }
    } catch (err) {
      console.warn("[PassSchedule] Failed to fetch dynamic regions from API, using fallback regions.", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return { regions, loading, refetch: fetchRegions };
}

/* -------------------- Captcha Dialog Component -------------------- */
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
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-opacity="${op}" stroke-width="${rand(1, 2)}"/>`;
    })
    .join("");
  const dots = Array.from({ length: 35 })
    .map(() => {
      const x = rand(0, width), y = rand(0, height);
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
      <stop offset="0%" stop-color="#1a1a1d"/><stop offset="100%" stop-color="#121214"/>
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
      PaperProps={{
        sx: {
          bgcolor: vars.bgCard,
          color: vars.text,
          border: `1px solid ${vars.border}`,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, fontSize: 16 }}>{t("Verification Required")}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "grid", gap: 1.5, mt: 1 }}>
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
              placeholder={t("Type the letters above")}
              size="small"
              fullWidth
              sx={(tMui) => ({
                ...controlSx,
                ...filledField(tMui),
              })}
            />
            <Button onClick={refresh} variant="outlined" sx={{ textTransform: "none", borderColor: vars.border, color: vars.text }}>
              {t("Refresh")}
            </Button>
          </Box>
          {error && <Box sx={{ color: "#f87171", fontSize: 12 }}>{error}</Box>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none", color: vars.textDim }}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          sx={{ textTransform: "none", fontWeight: 700, bgcolor: COLORS.purple, "&:hover": { bgcolor: "#6b46f1" } }}
        >
          {t("Verify & Proceed")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ========================================================================= */
/* PANEL 1: AWS Contacts (View Contacts - Console Style)                     */
/* ========================================================================= */
function AwsContactsPanel({ regions }: { regions: RegionMetadata[] }) {
  const { t } = useI18n();

  const [gs, setGs] = React.useState<"gs1" | "gs2">("gs1");
  const [region, setRegion] = React.useState<string>(() => regions[0]?.awsRegion || "af-south-1");

  // Keep region valid
  React.useEffect(() => {
    if (regions.length > 0 && !regions.some((r) => r.awsRegion === region)) {
      setRegion(regions[0].awsRegion);
    }
  }, [regions, region]);

  // Filters State
  const [satelliteArn, setSatelliteArn] = React.useState<string>("");
  const [groundStation, setGroundStation] = React.useState<string>("any");
  const [missionProfileArn, setMissionProfileArn] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("AVAILABLE");

  // Exact UTC Start & End Time (Default to the 7-day boundary test: 2026-09-30T00:00 -> 2026-10-07T00:00)
  const [startTime, setStartTime] = React.useState<string>("2026-09-30T00:00");
  const [endTime, setEndTime] = React.useState<string>("2026-10-07T00:00");

  // Options State
  const [satOptions, setSatOptions] = React.useState<Opt[]>([]);
  const [gsOptions, setGsOptions] = React.useState<Opt[]>([]);
  const [mpOptions, setMpOptions] = React.useState<Opt[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(false);

  // Table Data State
  const [rows, setRows] = React.useState<ContactItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [errorBanner, setErrorBanner] = React.useState<string | null>(null);

  // Request & Invalidation Tracking Refs
  const requestSeqRef = React.useRef<number>(0);
  const lastQueriedSignatureRef = React.useRef<string>("");

  // Load AWS Ground Station options (strictly for the active account & region)
  const loadOptions = React.useCallback(async (targetRegion: string, targetGs: "gs1" | "gs2") => {
    if (!targetRegion) return;
    setOptionsLoading(true);
    setErrorBanner(null);
    try {
      const data = await api.get<any>(`/api/aws-contacts/options`, {
        params: { region: targetRegion, gs: targetGs },
      });

      const sats: Opt[] = (data?.satellites || []).map((s: any) => ({
        id: s.arn || s.id,
        label: s.label || s.name || s.id,
        arn: s.arn || s.id,
      }));
      setSatOptions(sats);

      const gss: Opt[] = (data?.groundStations || []).map((g: any) => ({
        id: g.id,
        label: g.label,
        region: g.region,
      }));
      setGsOptions([{ id: "any", label: "Any Ground Station" }, ...gss]);

      const mps: Opt[] = (data?.missionProfiles || []).map((m: any) => ({
        id: m.arn || m.id,
        name: m.name || m.id,
        arn: m.arn || m.id,
      }));
      setMpOptions(mps);

      // Auto-select valid primary options if not set or invalid
      setSatelliteArn((prev) => (sats.some((s) => s.arn === prev) ? prev : sats[0]?.arn || ""));
      setMissionProfileArn((prev) => (mps.some((m) => m.arn === prev) ? prev : mps[0]?.arn || ""));
      const regionMatchingGs = gss.find((g) => g.region === targetRegion)?.id || gss[0]?.id || "any";
      setGroundStation((prev) => (prev && prev !== "any" && gss.some((g) => g.id === prev) ? prev : regionMatchingGs));
    } catch (e: any) {
      console.error("[PassSchedule] Options load failed:", e);
      setErrorBanner(e?.response?.data?.details || e?.message || "Failed to load AWS Ground Station options");
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  // On mount or region change
  React.useEffect(() => {
    loadOptions(region, gs);
  }, [region, gs, loadOptions]);

  // Account Switch Handler: clear data and reload options
  const handleAccountSwitch = (newGs: "gs1" | "gs2") => {
    if (newGs === gs) return;
    lastQueriedSignatureRef.current = "";
    setGs(newGs);
    setRows([]);
    setErrorBanner(null);
    loadOptions(region, newGs);
  };

  // Region Switch Handler: clear data and reload options
  const handleRegionSwitch = (newRegion: string) => {
    if (newRegion === region) return;
    lastQueriedSignatureRef.current = "";
    setRegion(newRegion);
    setRows([]);
    setErrorBanner(null);
    loadOptions(newRegion, gs);
  };

  // Unified Query Function: Handles both automatic filter-triggered query and manual Query Contacts button
  const executeContactsQuery = React.useCallback(
    async (isManual: boolean = false) => {
      // If dropdown options are still loading, do not fire query
      if (optionsLoading) return;

      // Validation Guard: For AVAILABLE status, require Satellite, Mission Profile, and a specific Ground Station
      if (status === "AVAILABLE" && (!satelliteArn || !missionProfileArn || !groundStation || groundStation === "any")) {
        if (isManual) {
          setErrorBanner("Querying AVAILABLE contacts requires Satellite, Mission Profile, and a specific Ground Station.");
        }
        setRows([]);
        setLoading(false);
        return;
      }

      if (!region || !startTime || !endTime) {
        if (isManual) {
          setErrorBanner("Region, Start Time, and End Time are required.");
        }
        setRows([]);
        setLoading(false);
        return;
      }

      const currentSeq = ++requestSeqRef.current;
      const currentSig = `${gs}|${region}|${satelliteArn}|${missionProfileArn}|${groundStation}|${status}|${startTime}|${endTime}`;
      lastQueriedSignatureRef.current = currentSig;

      try {
        setLoading(true);
        setErrorBanner(null);

        const satEffective = satelliteArn || "";
        const mpEffective = missionProfileArn || "";
        const gsEffective = groundStation === "any" ? "" : groundStation;

        const startUtcIso = fromUtcInput(startTime);
        const endUtcIso = fromUtcInput(endTime);

        // Safe frontend diagnostic logging
        console.log("[PassSchedule Query]", {
          mode: isManual ? "manual" : "auto",
          seq: currentSeq,
          account: gs,
          region,
          satellite: satEffective,
          missionProfile: mpEffective,
          groundStation: gsEffective,
          status,
          startTime: startUtcIso,
          endTime: endUtcIso,
        });

        const body = {
          region,
          gs,
          filters: {
            satellite: satEffective || null,
            groundStation: gsEffective || null,
            missionProfileArn: mpEffective || null,
            statusList: status === "ALL" ? [] : [status],
            startTime: startUtcIso,
            endTime: endUtcIso,
          },
          pageToken: null,
        };

        const res = await api.post<any>(`/api/aws-contacts/list`, body);

        // Stale response protection: Ignore if a newer query was initiated
        if (currentSeq !== requestSeqRef.current) {
          console.log(`[PassSchedule] Discarded stale query response for seq ${currentSeq} (current is ${requestSeqRef.current})`);
          return;
        }

        const itemsList = res?.items || [];
        const items: ContactItem[] = itemsList.map((c: any, i: number) => {
          const fallback = `${i}-${(c.startTime || "").replace(/[:.]/g, "")}`;
          return {
            contactId: c.contactId || null,
            status: String(c.status || "UNKNOWN").toUpperCase(),
            satellite: c.satellite,
            satelliteArn: c.satelliteArn,
            catalogNumber: c.catalogNumber,
            catalogLabel: c.catalogLabel || c.satellite || "-",
            groundStation: c.groundStation || "-",
            missionProfileArn: c.missionProfileArn,
            missionProfileName: c.missionProfileName,
            startTime: c.startTime || null,
            endTime: c.endTime || null,
            maximumElevationDeg: typeof c.maximumElevationDeg === "number" ? c.maximumElevationDeg : undefined,
            orbit: c.orbit,
            id: String(c.contactId || fallback),
            _raw: c._raw || c,
          };
        });

        setRows(items);
        setErrorBanner(null);
      } catch (err: any) {
        if (currentSeq !== requestSeqRef.current) return;
        console.error("[PassSchedule] Contacts query error:", err);
        const msg = err?.response?.data?.details || err?.response?.data?.error || err?.message || "Failed to list contacts";
        setErrorBanner(`Failed to list contacts: ${msg}`);
        setRows([]);
      } finally {
        if (currentSeq === requestSeqRef.current) {
          setLoading(false);
        }
      }
    },
    [region, gs, satelliteArn, missionProfileArn, groundStation, status, startTime, endTime, optionsLoading]
  );

  // Automatic Query Trigger: Whenever any filter changes and state is valid, automatically execute query
  React.useEffect(() => {
    // Check if current filter state is complete and valid
    if (optionsLoading) return;
    if (!region || !startTime || !endTime || !status) return;
    if (status === "AVAILABLE" && (!satelliteArn || !missionProfileArn || !groundStation || groundStation === "any")) {
      return;
    }

    const currentSig = `${gs}|${region}|${satelliteArn}|${missionProfileArn}|${groundStation}|${status}|${startTime}|${endTime}`;
    if (currentSig === lastQueriedSignatureRef.current) {
      return;
    }

    // Debounce to coalesce rapid consecutive state updates (e.g. preset buttons, dropdown selections)
    const timer = setTimeout(() => {
      executeContactsQuery(false);
    }, 250);

    return () => clearTimeout(timer);
  }, [
    gs,
    region,
    satelliteArn,
    missionProfileArn,
    groundStation,
    status,
    startTime,
    endTime,
    optionsLoading,
    executeContactsQuery,
  ]);

  const handleClearFilters = () => {
    lastQueriedSignatureRef.current = "";
    setSatelliteArn("");
    setMissionProfileArn("");
    setGroundStation("any");
    setStatus("AVAILABLE");
    setStartTime("2026-09-30T00:00");
    setEndTime("2026-10-07T00:00");
    setRows([]);
    setErrorBanner(null);
  };

  return (
    <Card sx={{ ...CARD_SX, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header Bar */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${vars.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: vars.text }}>
          {t("AWS Ground Station Contacts & Passes")}
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <ToggleButtonGroup
            value={gs}
            exclusive
            size="small"
            onChange={(_, val) => {
              if (val) handleAccountSwitch(val);
            }}
            sx={{
              height: 32,
              bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#1B1B1E" : "#E2E8F0"),
              border: `1px solid ${vars.border}`,
              borderRadius: 1.5,
              "& .MuiToggleButton-root": {
                px: 1.5,
                py: 0.25,
                fontSize: 12,
                fontWeight: 700,
                color: vars.textDim,
                border: "none",
                "&.Mui-selected": {
                  bgcolor: gs === "gs2" ? "#F59E0B" : "#0EA5E9",
                  color: "#000",
                },
              },
            }}
          >
            <ToggleButton value="gs1">GS1 / SD1</ToggleButton>
            <ToggleButton value="gs2">GS2 / SD2</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Region Metadata Info Bar */}
      <Box sx={{ px: 2, pt: 1.5 }}>
        <RegionMetadataCard regions={regions} selectedRegion={region} gs={gs} />
      </Box>

      {errorBanner && (
        <Box sx={{ px: 2, pt: 1 }}>
          <Alert severity="warning" onClose={() => setErrorBanner(null)} sx={{ py: 0.5, fontSize: 13 }}>
            {errorBanner}
          </Alert>
        </Box>
      )}

      {/* AWS Console Filter Bar */}
      <AwsGroundStationFilterBar
        gs={gs}
        onGsChange={handleAccountSwitch}
        region={region}
        onRegionChange={handleRegionSwitch}
        regions={regions}
        satelliteArn={satelliteArn}
        onSatelliteChange={setSatelliteArn}
        satOptions={satOptions}
        missionProfileArn={missionProfileArn}
        onMissionProfileChange={setMissionProfileArn}
        mpOptions={mpOptions}
        groundStation={groundStation}
        onGroundStationChange={setGroundStation}
        gsOptions={gsOptions}
        status={status}
        onStatusChange={setStatus}
        startTime={startTime}
        onStartTimeChange={setStartTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        onQuery={() => executeContactsQuery(true)}
        onClear={handleClearFilters}
        loading={loading}
        optionsLoading={optionsLoading}
      />

      {/* Contacts Table View */}
      <AwsGroundStationContactsTable
        rows={rows}
        loading={loading}
        onRefresh={() => executeContactsQuery(true)}
        filterSummary={`${gs.toUpperCase()} • ${region} • ${status}`}
      />
    </Card>
  );
}

/* ========================================================================= */
/* PANEL 2: Bulk Pass Schedule Upload (Preserved)                           */
/* ========================================================================= */
function resolveGsContactAutomationBucket(accountType: "gs1" | "gs2" | "GS1" | "GS2" | string, awsRegion: string): string {
  const normAccount = (accountType || "GS1").toLowerCase().includes("2") ? "gs2" : "gs1";
  const normRegion = (awsRegion || "").trim().toLowerCase();
  return `isro-${normAccount}-${normRegion}-gs-contact-automation`;
}

function PassSchedulePanel({ regions }: { regions: RegionMetadata[] }) {
  const { t } = useI18n();
  const [gs, setGs] = React.useState<"gs1" | "gs2">("gs1");
  const [region, setRegion] = React.useState<string>(() => regions[0]?.awsRegion || "af-south-1");

  React.useEffect(() => {
    if (regions.length > 0 && !regions.some((r) => r.awsRegion === region)) {
      setRegion(regions[0].awsRegion);
    }
  }, [regions, region]);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const accountLabel = gs === "gs2" ? "GS2 / SD2 (586794476605)" : "GS1 / SD1 (908027376569)";
  const targetBucket = resolveGsContactAutomationBucket(gs, region);
  const selectedRegionObj = regions.find((r) => r.awsRegion === region);

  const handleSelectFile = () => fileInputRef.current?.click();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFeedback(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setFeedback(null);
  };

  const handleUpload = async () => {
    if (!gs || !region || !file) {
      alert(t("Please select Ground Station, Region, and a CSV/TXT file."));
      return;
    }
    try {
      setUploading(true);
      setFeedback(null);
      const fd = new FormData();
      fd.append("file", file);

      const res = await api.post<any>(
        `/api/pass-schedule/bulk?gs=${encodeURIComponent(gs)}&region=${encodeURIComponent(region)}`,
        fd
      );

      const uploadedBucket = res?.bucket || targetBucket;
      const uploadedAccount = res?.accountType || (gs === "gs2" ? "GS2" : "GS1");
      const uploadedRegion = res?.region || region;
      const fileSizeKb = (Number(res?.size || file.size) / 1024).toFixed(1);

      setFeedback({
        type: "success",
        message: `Successfully uploaded ${res?.name || file.name} (${fileSizeKb} KB) to target bucket '${uploadedBucket}' in ${uploadedRegion} [${uploadedAccount}]. Key: ${res?.key || "contacts/" + file.name}`,
      });
      clearFile();
    } catch (err: any) {
      console.error("[PassSchedule] Bulk upload error:", err);
      const errMsg = err?.response?.data?.error || err?.message || "Failed to upload bulk schedule file to S3.";
      setFeedback({
        type: "error",
        message: errMsg,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Backdrop open={uploading} sx={{ color: "#fff", zIndex: (tMui) => tMui.zIndex.modal + 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>{t("Uploading schedule file to S3...")}</Typography>
        </Box>
      </Backdrop>

      <Card sx={{ ...CARD_SX, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: vars.text }}>
            {t("Bulk Pass Schedule Upload")}
          </Typography>

          <Button
            size="small"
            onClick={clearFile}
            sx={{ textTransform: "none", fontWeight: 700, color: vars.accent }}
          >
            {t("Reset")}
          </Button>
        </Box>

        <Box sx={{ px: 2, pt: 1.5 }}>
          <RegionMetadataCard regions={regions} selectedRegion={region} gs={gs} />
        </Box>

        {/* Dynamic S3 Automation Target Banner */}
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "rgba(14, 165, 233, 0.08)" : "rgba(14, 165, 233, 0.04)"),
              border: `1px solid ${vars.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <CloudUploadOutlinedIcon sx={{ color: vars.accent, fontSize: 20 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.text }}>
                {t("Target Contact Automation S3 Bucket")}:
              </Typography>
              <Typography
                component="code"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: 13,
                  color: vars.accent,
                  bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#111827" : "#E0F2FE"),
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  border: `1px solid ${vars.border}`,
                }}
              >
                s3://{targetBucket}/contacts/
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                size="small"
                label={accountLabel}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: gs === "gs2" ? "rgba(245, 158, 11, 0.15)" : "rgba(14, 165, 233, 0.15)",
                  color: gs === "gs2" ? "#F59E0B" : "#0EA5E9",
                  border: `1px solid ${vars.border}`,
                }}
              />
              <Chip
                size="small"
                label={`${selectedRegionObj?.name || region} (${region})`}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#1E293B" : "#F1F5F9"),
                  color: vars.text,
                  border: `1px solid ${vars.border}`,
                }}
              />
            </Box>
          </Box>
        </Box>

        {feedback && (
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ py: 0.5 }}>
              {feedback.message}
            </Alert>
          </Box>
        )}

        <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Ground Station Account")}</InputLabel>
            <Select value={gs} label={t("Ground Station Account")} onChange={(e) => setGs(e.target.value as any)}>
              <MenuItem value="gs1">GS1 / SD1 (Primary Account: 908027376569)</MenuItem>
              <MenuItem value="gs2">GS2 / SD2 (Isolated Account: 586794476605)</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Target Ground Station Region")}</InputLabel>
            <Select value={region} label={t("Target Ground Station Region")} onChange={(e) => setRegion(String(e.target.value))}>
              {regions.map((r) => (
                <MenuItem key={r.id} value={r.awsRegion}>
                  {r.name} ({r.awsRegion})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ borderTop: `1px solid ${vars.border}`, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              hidden
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectFile}
              disabled={uploading}
              sx={{ textTransform: "none", borderColor: vars.border, color: vars.text, fontWeight: 700 }}
            >
              {t("Select File (.csv, .txt)")}
            </Button>

            {file && (
              <Chip
                label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                onDelete={uploading ? undefined : clearFile}
                sx={{
                  bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#222" : "#F1F5F9"),
                  color: vars.text,
                  border: `1px solid ${vars.border}`,
                }}
              />
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={<CloudUploadOutlinedIcon />}
            disabled={!file || uploading}
            onClick={() => setCaptchaOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: COLORS.purple,
              "&:hover": { bgcolor: "#6b46f1" },
            }}
          >
            {t("Verify & Upload Pass Schedule")}
          </Button>
        </Box>
      </Card>

      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => setCaptchaOpen(false)}
        onOk={async () => {
          setCaptchaOpen(false);
          await handleUpload();
        }}
      />
    </>
  );
}

/* ========================================================================= */
/* PANEL 3: TLE Update Panel (Preserved)                                    */
/* ========================================================================= */
function resolveTleConfigBucket(accountType: "gs1" | "gs2" | "GS1" | "GS2" | string, awsRegion: string): string {
  const isGs2 = String(accountType || "GS1").toLowerCase().includes("2");
  const accountId = isGs2 ? "586794476605" : "908027376569";
  const sat = isGs2 ? "sd2" : "sd1";
  const reg = (awsRegion || "").trim().toLowerCase();
  return `${accountId}-config-bucket-spadex-${sat}-${reg}`;
}

function TleUpdatePanel({ regions }: { regions: RegionMetadata[] }) {
  const { t } = useI18n();
  const [gs, setGs] = React.useState<"gs1" | "gs2">("gs1");
  const [region, setRegion] = React.useState<string>(() => regions[0]?.awsRegion || "af-south-1");

  React.useEffect(() => {
    if (regions.length > 0 && !regions.some((r) => r.awsRegion === region)) {
      setRegion(regions[0].awsRegion);
    }
  }, [regions, region]);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [captchaOpen, setCaptchaOpen] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const accountLabel = gs === "gs2" ? "GS2 / SD2 (586794476605)" : "GS1 / SD1 (908027376569)";
  const targetBucket = resolveTleConfigBucket(gs, region);
  const selectedRegionObj = regions.find((r) => r.awsRegion === region);

  const handleSelectFile = () => fileInputRef.current?.click();
  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFeedback(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearFile = () => {
    setFile(null);
    setFeedback(null);
  };

  const handleAccountChange = (newGs: "gs1" | "gs2") => {
    setGs(newGs);
    setFeedback(null);
  };

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    setFeedback(null);
  };

  const handleUpload = async () => {
    if (!gs || !region || !file) {
      alert(t("Please select Ground Station, Region, and a TLE file."));
      return;
    }
    try {
      setUploading(true);
      setFeedback(null);
      const fd = new FormData();
      fd.append("file", file);

      const res = await api.post<any>(
        `/api/tle-update/upload?gs=${encodeURIComponent(gs)}&region=${encodeURIComponent(region)}`,
        fd
      );

      const uploadedBucket = res?.bucket || targetBucket;
      const uploadedAccount = res?.accountType || (gs === "gs2" ? "GS2" : "GS1");
      const uploadedRegion = res?.region || region;
      const fileSizeKb = (Number(res?.size || file.size) / 1024).toFixed(1);

      setFeedback({
        type: "success",
        message: `Successfully uploaded TLE "${res?.name || file.name}" (${fileSizeKb} KB) to target bucket '${uploadedBucket}' in ${uploadedRegion} [${uploadedAccount}]. Key: ${res?.key || "configs/" + file.name}`,
      });
      clearFile();
    } catch (err: any) {
      console.error("[PassSchedule] TLE upload error:", err);
      const errMsg = err?.response?.data?.error || err?.message || "Failed to upload TLE configuration to S3.";
      setFeedback({
        type: "error",
        message: errMsg,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Backdrop open={uploading} sx={{ color: "#fff", zIndex: (tMui) => tMui.zIndex.modal + 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>{t("Uploading TLE to S3 bucket...")}</Typography>
        </Box>
      </Backdrop>

      <Card sx={{ ...CARD_SX, height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${vars.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontWeight: 700, fontSize: 16, color: vars.text }}>
            {t("Update Satellite TLE Configuration")}
          </Typography>

          <Button
            size="small"
            onClick={clearFile}
            sx={{ textTransform: "none", fontWeight: 700, color: vars.accent }}
          >
            {t("Reset")}
          </Button>
        </Box>

        <Box sx={{ px: 2, pt: 1.5 }}>
          <RegionMetadataCard regions={regions} selectedRegion={region} gs={gs} />
        </Box>

        {/* Dynamic S3 TLE Target Configuration Banner */}
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "rgba(14, 165, 233, 0.08)" : "rgba(14, 165, 233, 0.04)"),
              border: `1px solid ${vars.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <CloudUploadOutlinedIcon sx={{ color: vars.accent, fontSize: 20 }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.text }}>
                {t("Target TLE Configuration S3 Bucket")}:
              </Typography>
              <Typography
                component="code"
                sx={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: 13,
                  color: vars.accent,
                  bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#111827" : "#E0F2FE"),
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  border: `1px solid ${vars.border}`,
                }}
              >
                s3://{targetBucket}/configs/
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Chip
                size="small"
                label={accountLabel}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: gs === "gs2" ? "rgba(245, 158, 11, 0.15)" : "rgba(14, 165, 233, 0.15)",
                  color: gs === "gs2" ? "#F59E0B" : "#0EA5E9",
                  border: `1px solid ${vars.border}`,
                }}
              />
              <Chip
                size="small"
                label={`${selectedRegionObj?.name || region} (${region})`}
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#1E293B" : "#F1F5F9"),
                  color: vars.text,
                  border: `1px solid ${vars.border}`,
                }}
              />
            </Box>
          </Box>
        </Box>

        {feedback && (
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ py: 0.5 }}>
              {feedback.message}
            </Alert>
          </Box>
        )}

        <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Ground Station Account")}</InputLabel>
            <Select value={gs} label={t("Ground Station Account")} onChange={(e) => handleAccountChange(e.target.value as any)}>
              <MenuItem value="gs1">GS1 / SD1 (Primary Account: 908027376569)</MenuItem>
              <MenuItem value="gs2">GS2 / SD2 (Isolated Account: 586794476605)</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Target Ground Station Region")}</InputLabel>
            <Select value={region} label={t("Target Ground Station Region")} onChange={(e) => handleRegionChange(String(e.target.value))}>
              {regions.map((r) => (
                <MenuItem key={r.id} value={r.awsRegion}>
                  {r.name} ({r.awsRegion})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ borderTop: `1px solid ${vars.border}`, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.tle,.json,text/plain,application/json"
              hidden
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleSelectFile}
              disabled={uploading}
              sx={{ textTransform: "none", borderColor: vars.border, color: vars.text, fontWeight: 700 }}
            >
              {t("Select TLE File (.txt, .tle, .json)")}
            </Button>

            {file && (
              <Chip
                label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                onDelete={uploading ? undefined : clearFile}
                sx={{
                  bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#222" : "#F1F5F9"),
                  color: vars.text,
                  border: `1px solid ${vars.border}`,
                }}
              />
            )}
          </Box>

          <Button
            variant="contained"
            startIcon={<CloudUploadOutlinedIcon />}
            disabled={!file || uploading}
            onClick={() => setCaptchaOpen(true)}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: COLORS.purple,
              "&:hover": { bgcolor: "#6b46f1" },
            }}
          >
            {t("Verify & Upload TLE")}
          </Button>
        </Box>
      </Card>

      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => setCaptchaOpen(false)}
        onOk={async () => {
          setCaptchaOpen(false);
          await handleUpload();
        }}
      />
    </>
  );
}

/* ========================================================================= */
/* PANEL 4: AWS Contact Manual Operations (Console Style with Reserve/Cancel)*/
/* ========================================================================= */
function AwsManualPanel({ regions }: { regions: RegionMetadata[] }) {
  const { t } = useI18n();

  const [gs, setGs] = React.useState<"gs1" | "gs2">("gs1");
  const [region, setRegion] = React.useState<string>(() => regions[0]?.awsRegion || "af-south-1");

  React.useEffect(() => {
    if (regions.length > 0 && !regions.some((r) => r.awsRegion === region)) {
      setRegion(regions[0].awsRegion);
    }
  }, [regions, region]);

  // Filters State
  const [satelliteArn, setSatelliteArn] = React.useState<string>("");
  const [groundStation, setGroundStation] = React.useState<string>("any");
  const [missionProfileArn, setMissionProfileArn] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("AVAILABLE");

  // Exact UTC Start & End Time (Default to the 7-day boundary test: 2026-09-30T00:00 -> 2026-10-07T00:00)
  const [startTime, setStartTime] = React.useState<string>("2026-09-30T00:00");
  const [endTime, setEndTime] = React.useState<string>("2026-10-07T00:00");

  // Options State
  const [satOptions, setSatOptions] = React.useState<Opt[]>([]);
  const [gsOptions, setGsOptions] = React.useState<Opt[]>([]);
  const [mpOptions, setMpOptions] = React.useState<Opt[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(false);

  // Table Data & Selection State
  const [rows, setRows] = React.useState<ContactItem[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [actionLoading, setActionLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadOptions = React.useCallback(async (targetRegion: string, targetGs: "gs1" | "gs2") => {
    if (!targetRegion) return;
    setOptionsLoading(true);
    try {
      const data = await api.get<any>(`/api/aws-contacts/options`, {
        params: { region: targetRegion, gs: targetGs },
      });

      const sats: Opt[] = (data?.satellites || []).map((s: any) => ({
        id: s.arn || s.id,
        label: s.label || s.name || s.id,
        arn: s.arn || s.id,
      }));
      setSatOptions(sats);

      const gss: Opt[] = (data?.groundStations || []).map((g: any) => ({
        id: g.id,
        label: g.label,
        region: g.region,
      }));
      setGsOptions([{ id: "any", label: "Any Ground Station" }, ...gss]);

      const mps: Opt[] = (data?.missionProfiles || []).map((m: any) => ({
        id: m.arn || m.id,
        name: m.name || m.id,
        arn: m.arn || m.id,
      }));
      setMpOptions(mps);

      // Auto-select valid primary options if not set or invalid
      setSatelliteArn((prev) => (sats.some((s) => s.arn === prev) ? prev : sats[0]?.arn || ""));
      setMissionProfileArn((prev) => (mps.some((m) => m.arn === prev) ? prev : mps[0]?.arn || ""));
      const regionMatchingGs = gss.find((g) => g.region === targetRegion)?.id || gss[0]?.id || "any";
      setGroundStation((prev) => (prev && prev !== "any" && gss.some((g) => g.id === prev) ? prev : regionMatchingGs));
    } catch (e: any) {
      console.error("[PassSchedule] Options load failed:", e);
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadOptions(region, gs);
  }, [region, gs, loadOptions]);

  // Account Switch Handler: clear data and reload options
  const handleAccountSwitch = (newGs: "gs1" | "gs2") => {
    if (newGs === gs) return;
    setGs(newGs);
    setRows([]);
    setSelectedIds([]);
    setFeedback(null);
    loadOptions(region, newGs);
  };

  // Region Switch Handler: clear data and reload options
  const handleRegionSwitch = (newRegion: string) => {
    if (newRegion === region) return;
    setRegion(newRegion);
    setRows([]);
    setSelectedIds([]);
    setFeedback(null);
    loadOptions(newRegion, gs);
  };

  const loadContacts = React.useCallback(async () => {
    // Guard: For AVAILABLE status, require Satellite, Mission Profile, and Ground Station
    if (status === "AVAILABLE" && (!satelliteArn || !missionProfileArn || !groundStation || groundStation === "any")) {
      setFeedback({
        type: "error",
        message: "Querying AVAILABLE contacts requires Satellite, Mission Profile, and a specific Ground Station.",
      });
      setRows([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);
      setSelectedIds([]);

      const satEffective = satelliteArn || "";
      const mpEffective = missionProfileArn || "";
      const gsEffective = groundStation === "any" ? "" : groundStation;

      const startUtcIso = fromUtcInput(startTime);
      const endUtcIso = fromUtcInput(endTime);

      // Safe frontend diagnostic logging
      console.log("[PassSchedule Manual Query]", {
        account: gs,
        region,
        satellite: satEffective,
        missionProfile: mpEffective,
        groundStation: gsEffective,
        status,
        startTime: startUtcIso,
        endTime: endUtcIso,
      });

      const body = {
        region,
        gs,
        filters: {
          satellite: satEffective || null,
          groundStation: gsEffective || null,
          missionProfileArn: mpEffective || null,
          statusList: status === "ALL" ? [] : [status],
          startTime: startUtcIso,
          endTime: endUtcIso,
        },
        pageToken: null,
      };

      const res = await api.post<any>(`/api/aws-contacts/list`, body);
      const itemsList = res?.items || [];
      const items: ContactItem[] = itemsList.map((c: any, i: number) => {
        const fallback = `${i}-${(c.startTime || "").replace(/[:.]/g, "")}`;
        return {
          contactId: c.contactId || null,
          status: String(c.status || "UNKNOWN").toUpperCase(),
          satellite: c.satellite,
          satelliteArn: c.satelliteArn,
          catalogNumber: c.catalogNumber,
          catalogLabel: c.catalogLabel || c.satellite || "-",
          groundStation: c.groundStation || "-",
          missionProfileArn: c.missionProfileArn,
          missionProfileName: c.missionProfileName,
          startTime: c.startTime || null,
          endTime: c.endTime || null,
          maximumElevationDeg: typeof c.maximumElevationDeg === "number" ? c.maximumElevationDeg : undefined,
          orbit: c.orbit,
          id: String(c.contactId || fallback),
          _raw: c._raw || c,
        };
      });

      setRows(items);
      setFeedback(null);
    } catch (err: any) {
      console.error("[PassSchedule] Contacts query error:", err);
      const msg = err?.response?.data?.details || err?.response?.data?.error || err?.message || "Failed to list contacts";
      setFeedback({
        type: "error",
        message: `Failed to list contacts: ${msg}`,
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [region, gs, satelliteArn, missionProfileArn, groundStation, status, startTime, endTime]);

  const toggleSelectAll = () => {
    if (selectedIds.length === rows.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(rows.map((r) => r.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const performAction = async (action: "reserve" | "cancel", specificContacts?: ContactItem[]) => {
    const targetItems = specificContacts || rows.filter((r) => selectedIds.includes(r.id));
    if (!targetItems.length) return;

    try {
      setActionLoading(true);
      setFeedback(null);

      // Build payload items: prefer real contactId if present, or descriptor object
      const contactPayloads = targetItems.map((row) => {
        if (row?.contactId) return row.contactId;
        return {
          startTime: row?.startTime,
          endTime: row?.endTime,
          satelliteArn: row?.satelliteArn || satelliteArn || undefined,
          missionProfileArn: row?.missionProfileArn || missionProfileArn || undefined,
          groundStation: row?.groundStation || (groundStation === "any" ? undefined : groundStation),
        };
      });

      const res = await api.post<any>("/api/aws-contacts/action", {
        action,
        contactIds: contactPayloads,
        gs,
        region,
        groundStation: groundStation === "any" ? undefined : groundStation,
      });

      const results = res?.results || [];
      const successes = results.filter((r: any) => r.success).length;
      const fails = results.filter((r: any) => !r.success).length;

      if (fails === 0) {
        setFeedback({
          type: "success",
          message: `Successfully executed ${action.toUpperCase()} for ${successes} contact(s).`,
        });
      } else {
        const firstErr = results.find((r: any) => !r.success)?.error || "Some items could not be processed.";
        setFeedback({
          type: "error",
          message: `${action.toUpperCase()} completed with ${successes} success(es) and ${fails} error(s). Detail: ${firstErr}`,
        });
      }

      await loadContacts();
    } catch (err: any) {
      console.error("[PassSchedule] Action error:", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.error || err?.message || `Failed to ${action} contacts.`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSatelliteArn("");
    setMissionProfileArn("");
    setGroundStation("any");
    setStatus("AVAILABLE");
    setStartTime("2026-09-30T00:00");
    setEndTime("2026-10-07T00:00");
    setRows([]);
    setSelectedIds([]);
    setFeedback(null);
  };

  return (
    <Card sx={{ ...CARD_SX, height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${vars.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16, color: vars.text }}>
          {t("AWS Contact Operations (Reserve / Cancel)")}
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <ToggleButtonGroup
            value={gs}
            exclusive
            size="small"
            onChange={(_, val) => {
              if (val) handleAccountSwitch(val);
            }}
            sx={{
              height: 32,
              bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#1B1B1E" : "#E2E8F0"),
              border: `1px solid ${vars.border}`,
              borderRadius: 1.5,
              "& .MuiToggleButton-root": {
                px: 1.5,
                py: 0.25,
                fontSize: 12,
                fontWeight: 700,
                color: vars.textDim,
                border: "none",
                "&.Mui-selected": {
                  bgcolor: gs === "gs2" ? "#F59E0B" : "#0EA5E9",
                  color: "#000",
                },
              },
            }}
          >
            <ToggleButton value="gs1">GS1 / SD1</ToggleButton>
            <ToggleButton value="gs2">GS2 / SD2</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* Region Metadata Info Bar */}
      <Box sx={{ px: 2, pt: 1.5 }}>
        <RegionMetadataCard regions={regions} selectedRegion={region} gs={gs} />
      </Box>

      {feedback && (
        <Box sx={{ px: 2, pt: 1.5 }}>
          <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ py: 0.5 }}>
            {feedback.message}
          </Alert>
        </Box>
      )}

      {/* Operations Toolbar */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          borderBottom: `1px solid ${vars.border}`,
          bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#18181B" : "#F8FAFC"),
        }}
      >
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            disabled={actionLoading || selectedIds.length === 0}
            onClick={() => performAction("reserve")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: "#10B981",
              "&:hover": { bgcolor: "#059669" },
            }}
          >
            {t("Reserve Selected Contacts")} ({selectedIds.length})
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={actionLoading || selectedIds.length === 0}
            onClick={() => performAction("cancel")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            {t("Cancel Selected Contacts")} ({selectedIds.length})
          </Button>
        </Stack>

        <Box sx={{ ml: "auto", fontSize: 13, color: vars.textDim }}>
          {selectedIds.length ? `${selectedIds.length} contact(s) selected` : "No contacts selected"}
        </Box>
      </Box>

      {/* Filter Bar */}
      <AwsGroundStationFilterBar
        gs={gs}
        onGsChange={handleAccountSwitch}
        region={region}
        onRegionChange={handleRegionSwitch}
        regions={regions}
        satelliteArn={satelliteArn}
        onSatelliteChange={setSatelliteArn}
        satOptions={satOptions}
        missionProfileArn={missionProfileArn}
        onMissionProfileChange={setMissionProfileArn}
        mpOptions={mpOptions}
        groundStation={groundStation}
        onGroundStationChange={setGroundStation}
        gsOptions={gsOptions}
        status={status}
        onStatusChange={setStatus}
        startTime={startTime}
        onStartTimeChange={setStartTime}
        endTime={endTime}
        onEndTimeChange={setEndTime}
        onQuery={loadContacts}
        onClear={handleClearFilters}
        loading={loading}
        optionsLoading={optionsLoading}
      />

      {/* Contacts Table with Checkbox Operations */}
      <AwsGroundStationContactsTable
        rows={rows}
        loading={loading}
        isManualMode={true}
        selectedIds={selectedIds}
        onToggleSelectAll={toggleSelectAll}
        onToggleRow={toggleRow}
        onReserveSingle={(c) => performAction("reserve", [c])}
        onCancelSingle={(c) => performAction("cancel", [c])}
        actionLoading={actionLoading}
        onRefresh={loadContacts}
        filterSummary={`${gs.toUpperCase()} • ${region} • ${status}`}
      />
    </Card>
  );
}

/* ========================================================================= */
/* Main Pass Schedule Page Layout                                           */
/* ========================================================================= */
const pillSx = {
  textTransform: "none",
  fontWeight: 700,
  fontSize: 13,
  px: 2.25,
  height: 34,
  lineHeight: "34px",
  borderRadius: 999,
  color: vars.textDim,
  bgcolor: "transparent",
  "&.Mui-selected": {
    color: "#0EA5E9",
    bgcolor: (t: any) => (t.palette.mode === "dark" ? "#1D1D22" : "#FFFFFF"),
    border: (t: any) =>
      `1px solid ${t.palette.mode === "dark" ? "rgba(14,165,233,0.3)" : "#0EA5E9"}`,
    boxShadow: "0 2px 8px rgba(14,165,233,0.15)",
  },
  "&.Mui-selected:hover": {
    bgcolor: (t: any) => (t.palette.mode === "dark" ? vars.bgHover : "#FFFFFF"),
  },
} as const;

export default function PassSchedule() {
  const { t } = useI18n();
  const { regions, loading: regionsLoading } = useDynamicRegions();
  const [tab, setTab] = React.useState<"contacts" | "pass" | "tle" | "awscontact">("contacts");

  return (
    <MainLayout title={t("Pass Schedule & Operations")}>
      <Box
        sx={{
          px: 2.5,
          py: 2,
          height: `calc(100vh - ${TOPBAR_HEIGHT + 25}px)`,
          display: "grid",
          gridTemplateRows: "auto 1fr",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <ToggleButtonGroup
            value={tab}
            exclusive
            onChange={(_, v) => v && setTab(v)}
            sx={{
              p: 0.5,
              borderRadius: 999,
              border: `1px solid ${vars.border}`,
              bgcolor: vars.bgCard,
              width: "fit-content",
              "& .MuiToggleButtonGroup-grouped": { border: "none", mx: 0.25 },
            }}
          >
            <ToggleButton value="contacts" disableRipple sx={pillSx}>
              {t("View Contacts")}
            </ToggleButton>
            <ToggleButton value="pass" disableRipple sx={pillSx}>
              {t("Bulk Pass Schedule")}
            </ToggleButton>
            <ToggleButton value="tle" disableRipple sx={pillSx}>
              {t("Update TLE")}
            </ToggleButton>
            <ToggleButton value="awscontact" disableRipple sx={pillSx}>
              {t("AWS Contact (Manual)")}
            </ToggleButton>
          </ToggleButtonGroup>

          {regionsLoading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: vars.textDim, fontSize: 12 }}>
              <CircularProgress size={14} color="inherit" />
              <span>{t("Discovering active ground stations...")}</span>
            </Box>
          )}
        </Box>

        <Box sx={{ minHeight: 0, height: "100%" }}>
          {tab === "contacts" ? (
            <AwsContactsPanel regions={regions} />
          ) : tab === "pass" ? (
            <PassSchedulePanel regions={regions} />
          ) : tab === "tle" ? (
            <TleUpdatePanel regions={regions} />
          ) : (
            <AwsManualPanel regions={regions} />
          )}
        </Box>
      </Box>
    </MainLayout>
  );
}
