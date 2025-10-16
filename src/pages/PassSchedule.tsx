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
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import MainLayout from "../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../components/TopNav";
import api from "../api/http";
import { vars, sxPresets } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";

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

// Region -> default GS label (only affects the filter UI convenience)
const DEFAULT_GS_FOR_REGION: Record<string, string> = {
  "us-west-2": "Hawaii 1",
  "af-south-1": "Cape Town 1",
  "me-south-1": "Bahrain 1",
  "eu-west-1": "Ireland 1",
  "sa-east-1": "Punta Arenas 1",
};

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
const SCROLLER_SX = { ...sxPresets.scroller };

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

/* -------------------- CAPTCHA -------------------- */
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
      <DialogTitle sx={{ fontWeight: 700 }}>
        {t("Verify you’re human")}
      </DialogTitle>
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
                  background:
                    (tMui as any).palette.mode === "dark" ? "#232325" : "#fff",
                },
              })}
            />
            <Button
              onClick={refresh}
              variant="outlined"
              sx={{ textTransform: "none", borderColor: vars.border }}
            >
              {t("Refresh")}
            </Button>
          </Box>
          {error && (
            <Box sx={{ color: "#f87171", fontSize: 12, mt: 0.25 }}>{error}</Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button onClick={onCancel} sx={{ textTransform: "none" }}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          sx={{
            textTransform: "none",
            fontWeight: 700,
            bgcolor: "#7C57F2",
            "&:hover": { bgcolor: "#6b46f1" },
          }}
        >
          {t("Verify")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ---------------- Page wrapper ---------------- */
export default function PassSchedulePage() {
  const { t } = useI18n();
  const [tab, setTab] = React.useState<"pass" | "contacts">("contacts");
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
          <ToggleButton value="pass" disableRipple sx={pillSx}>
            {t("Pass Schedule")}
          </ToggleButton>
          <ToggleButton value="contacts" disableRipple sx={pillSx}>
            {t("AWS Contacts")}
          </ToggleButton>
        </ToggleButtonGroup>

        {tab === "pass" ? <PassSchedulePanel /> : <AwsContactsPanel />}
      </Box>
    </MainLayout>
  );
}

/* ---------------- Bulk-upload panel ---------------- */
function PassSchedulePanel() {
  const { t } = useI18n();
  const [gs, setGs] = React.useState<string>("");
  const [region, setRegion] = React.useState<string>("");

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const [rows, setRows] = React.useState<
    { gs: "gs1" | "gs2"; region: string; bucket: string }[]
  >([]);
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

  const handleDownloadTemplate = () => {
    const headers = [
      "DATE",
      "S/C",
      "STN",
      "ORBIT", // left in template for your CSVs
      "Max",
      "AOS",
      "LOS",
      "OPERATIONS",
    ];
    const example = ["", "", "", "", "", "", "", ""];
    const csv = [headers.join(","), example.join(",")].join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "pass_schedule_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const findBucket = React.useCallback(
    () => rows.find((r) => r.gs === gs && r.region === region)?.bucket || "",
    [rows, gs, region]
  );

  const handleUpload = async () => {
    if (!gs) return alert(t("Please select a Ground Station."));
    if (!region) return alert(t("Please select a Region."));
    if (!file) return alert(t("Please select a file first."));
    const name = file.name.toLowerCase();
    const mime = (file as any).type || "";
    const isCsv = name.endsWith(".csv") || mime === "text/csv";
    const isTxt = name.endsWith(".txt") || mime === "text/plain";
    if (!isCsv && !isTxt)
      return alert(t("Only .csv or .txt files are supported."));
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const bucket = findBucket();
      const bucketParam = bucket ? `&bucket=${encodeURIComponent(bucket)}` : "";
      await api.post(
        `/api/pass-schedule/bulk?gs=${encodeURIComponent(
          gs
        )}&region=${encodeURIComponent(region)}${bucketParam}`,
        fd
      );
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
  const [captchaAction, setCaptchaAction] =
    React.useState<CaptchaAction | null>(null);
  const runAfterCaptcha = React.useCallback(async () => {
    if (captchaAction === "upload") await handleUpload();
    setCaptchaAction(null);
  }, [captchaAction, gs, region, file, rows]);

  const addRow = async () => {
    if (!gsNew || !regionNew || !bucketNew) return;
    const row = {
      gs: gsNew as "gs1" | "gs2",
      region: regionNew.trim(),
      bucket: bucketNew.trim(),
    };
    setRows((prev) => {
      const filtered = prev.filter(
        (r) => !(r.gs === row.gs && r.region === row.region)
      );
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

  const prettyFileName = React.useMemo(
    () =>
      file
        ? file.name
            .replace(/(\.txt){2}$/i, ".txt")
            .replace(/(\.csv){2}$/i, ".csv")
        : "",
    [file]
  );

  return (
    <>
      <Backdrop
        open={uploading}
        sx={{ color: "#fff", zIndex: (t) => t.zIndex.modal + 1 }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>
            Uploading… this may take a while for large files.
          </Typography>
        </Box>
      </Backdrop>

      <Card sx={{ ...CARD_SX, height: "100%" }}>
        {/* Add Schedule Details */}
        <Box
          sx={{
            px: 1.25,
            py: 0.7,
            borderBottom: `1px solid ${vars.border}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
            Add Schedule Details
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <Button
              onClick={() => {
                setGs("");
                setRegion("");
              }}
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: COLORS.link,
                px: 1,
                minWidth: 0,
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.25,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1.25,
          }}
        >
          <FormControl
            size="small"
            sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
          >
            <InputLabel>Select Ground Station *</InputLabel>
            <Select
              label="Select Ground Station *"
              value={gs}
              onChange={(e) => setGs(String(e.target.value))}
            >
              <MenuItem value="gs1">Groundstation 1</MenuItem>
              <MenuItem value="gs2">Groundstation 2</MenuItem>
            </Select>
          </FormControl>
          <FormControl
            size="small"
            sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
          >
            <InputLabel>Select Region *</InputLabel>
            <Select
              label="Select Region *"
              value={region}
              onChange={(e) => setRegion(String(e.target.value))}
              MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
            >
              {REGION_OPTIONS.map((o) => (
                <MenuItem key={o.id} value={o.id}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Upload */}
        <Box sx={{ borderTop: `1px solid ${vars.border}` }} />
        <Box
          sx={{
            px: 1.25,
            py: 0.6,
            borderBottom: `1px solid ${vars.border}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 15, color: COLORS.link }}>
            Bulk Pass Schedule Upload
          </Typography>
          <Box sx={{ ml: "auto" }}>
            <Button
              onClick={clearTop}
              size="small"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                color: COLORS.link,
                px: 1,
                minWidth: 0,
              }}
            >
              Clear
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            p: 1,
            pl: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            flexWrap: { xs: "wrap", lg: "nowrap" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography sx={{ fontSize: 12, color: vars.text }}>
              Step 1: Download the given template
            </Typography>
            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadOutlinedIcon sx={{ fontSize: 14 }} />}
              onClick={handleDownloadTemplate}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: COLORS.green,
                color: "#fff",
                "&:hover": { bgcolor: "#12853d" },
              }}
            >
              Download Template
            </Button>
            <Typography sx={{ fontSize: 12, ml: { lg: 2 }, color: vars.text }}>
              Step 2: Fill it & Upload
            </Typography>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt,text/csv,text/plain"
              hidden
              onChange={handleFileChange}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSelectFile}
              disabled={uploading}
              sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
            >
              Select File
            </Button>
            {file && (
              <Chip
                label={prettyFileName}
                onDelete={uploading ? undefined : clearTop}
                sx={(tMui) => ({
                  bgcolor:
                    (tMui as any).palette.mode === "dark" ? "#232325" : "#fff",
                  color:
                    (tMui as any).palette.mode === "dark" ? vars.text : "#000",
                  border: `1px solid ${vars.border}`,
                  ".MuiChip-deleteIcon": { color: vars.textDim },
                })}
              />
            )}
          </Box>
          <Button
            variant="contained"
            size="medium"
            startIcon={<CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />}
            disabled={!file || uploading}
            onClick={() => {
              setCaptchaAction("upload");
              setCaptchaOpen(true);
            }}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              bgcolor: COLORS.purple,
              "&:hover": { bgcolor: "#6b46f1" },
              "&.Mui-disabled": {
                bgcolor: vars.bgCtrl,
                color: vars.textDim,
                border: `1px solid ${vars.border}`,
                boxShadow: "none",
                opacity: 1,
              },
            }}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </Box>

        {/* Regions & Buckets */}
        <Box sx={{ borderTop: `1px solid ${vars.border}` }} />
        <Box
          sx={{
            px: 1.25,
            py: 0.7,
            borderBottom: `1px solid ${vars.border}`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
            Regions & Buckets
          </Typography>
        </Box>
        <Box sx={{ p: 1.25, display: "grid", gap: 1.25 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "140px 240px 1fr 100px" },
              gap: 1,
            }}
          >
            <FormControl
              size="small"
              sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
            >
              <InputLabel>GS</InputLabel>
              <Select
                label="GS"
                value={gsNew}
                onChange={(e) => setGsNew(String(e.target.value))}
              >
                <MenuItem value="gs1">Groundstation 1</MenuItem>
                <MenuItem value="gs2">Groundstation 2</MenuItem>
              </Select>
            </FormControl>
            <TextField
              size="small"
              placeholder="Region (e.g., sa-east-1)"
              value={regionNew}
              onChange={(e) => setRegionNew(e.target.value)}
              onBlur={() => setRegionNew((v) => v.trim())}
              sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
            />
            <TextField
              size="small"
              placeholder="Bucket name"
              value={bucketNew}
              onChange={(e) => setBucketNew(e.target.value)}
              sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
            />
            <Button
              onClick={addRow}
              variant="contained"
              disabled={!gsNew || !regionNew || !bucketNew}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Add
            </Button>
          </Box>

          <Table
            size="small"
            sx={{
              borderColor: vars.border,
              borderWidth: 1,
              borderStyle: "solid",
              borderRadius: 1,
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: vars.textDim }}>GS</TableCell>
                <TableCell sx={{ color: vars.textDim }}>Region</TableCell>
                <TableCell sx={{ color: vars.textDim }}>Bucket</TableCell>
                <TableCell sx={{ color: vars.textDim }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} sx={{ color: vars.textDim }}>
                    No custom mappings yet. Add one above (optional).
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, i) => (
                  <TableRow key={`${r.gs}-${r.region}`}>
                    <TableCell>{r.gs}</TableCell>
                    <TableCell>
                      {KNOWN_REGION_LABELS[r.region] || r.region}
                    </TableCell>
                    <TableCell>{r.bucket}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => removeRow(i)} size="small">
                        <DeleteOutlineIcon
                          sx={{ fontSize: 18, color: vars.textDim }}
                        />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Box>
      </Card>

      <CaptchaDialog
        open={captchaOpen}
        onCancel={() => {
          setCaptchaOpen(false);
          setCaptchaAction(null);
        }}
        onOk={async () => {
          setCaptchaOpen(false);
          await runAfterCaptcha();
        }}
      />
    </>
  );
}

/* ---------------- AWS Contacts PANEL ---------------- */
function AwsContactsPanel() {
  const { t } = useI18n();

  // Filters
  const [region, setRegion] = React.useState<string>("sa-east-1");
  const [satelliteArn, setSatelliteArn] = React.useState<string>("");
  const [groundStation, setGroundStation] = React.useState<string>("");
  const [missionProfileArn, setMissionProfileArn] = React.useState<string>("");
  const [status, setStatus] = React.useState<string>("AVAILABLE");

  const [startTime, setStartTime] = React.useState<string>(() => {
    const d = new Date(Date.now() - 24 * 3600 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [endTime, setEndTime] = React.useState<string>(() => {
    const d = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });

  // Options from backend (already filtered)
  type Opt = { id: string; label?: string; name?: string; arn?: string };
  const [satOptions, setSatOptions] = React.useState<Opt[]>([]);
  const [gsOptions, setGsOptions] = React.useState<Opt[]>([]);
  const [mpOptions, setMpOptions] = React.useState<Opt[]>([]);
  const [optionsReady, setOptionsReady] = React.useState(false);

  // Contacts table
  type ContactRow = {
    contactId: string;
    status: string;
    catalogLabel: string;
    groundStation: string;
    startTime: string; // ISO
    endTime: string; // ISO
    maxElevationDeg?: number;
  };
  const [rows, setRows] = React.useState<ContactRow[]>([]);
  const [loading, setLoading] = React.useState(false);

  const STATUSES = [
    "AVAILABLE",
    "SCHEDULED",
    "COMPLETED",
    "AWS_CANCELLED",
    "CANCELLED",
  ];

  // Load options from server (curated to 2 satellites, 5 GS)
  const loadOptions = React.useCallback(async () => {
    setOptionsReady(false);
    try {
      const data = await api.get<any>(`/api/aws-contacts/options`, {
        params: { region },
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
      }));
      setGsOptions([{ id: "", label: "Any" }, ...gss]);

      const mps: Opt[] = (data?.missionProfiles || []).map((m: any) => ({
        id: m.arn || m.id,
        label: m.name || m.id,
        arn: m.arn || m.id,
      }));
      setMpOptions([{ id: "", label: "Any" }, ...mps]);

      // With AVAILABLE: pick first sat + mp so call is valid
      if (status === "AVAILABLE") {
        if (!satelliteArn && sats.length)
          setSatelliteArn(sats[0].arn as string);
        if (!missionProfileArn && mps.length)
          setMissionProfileArn((mps[0].arn || mps[0].id) as string);
      }
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to load AWS options"));
    } finally {
      setOptionsReady(true);
    }
  }, [region, status, satelliteArn, missionProfileArn, t]);

  const badAvailableCombo = React.useMemo(
    () => status === "AVAILABLE" && (!satelliteArn || !missionProfileArn),
    [status, satelliteArn, missionProfileArn]
  );

  // Pretty label for the Catalog number column
  const labelForCatalog = React.useCallback(
    (c: any): string => {
      const fromSelected =
        satOptions.find((s) => s.arn === satelliteArn)?.label || "";
      if (fromSelected) return fromSelected;

      const num =
        c.catalogNumber ??
        c.norad ??
        c.noradSatelliteId ??
        c.noradSatelliteID ??
        null;

      if (String(num) === "62459") return "62459 (SPADEX-SD1)";
      if (String(num) === "62460") return "62460 (SPADEX-SD2)";
      return String(num || "—");
    },
    [satOptions, satelliteArn]
  );

  const fmtUtc = (iso?: string | null) =>
    iso ? iso.replace("T", " ").replace("Z", "Z") : "-";

  const loadContacts = React.useCallback(async () => {
    if (badAvailableCombo) {
      setRows([]);
      return;
    }
    try {
      setLoading(true);
      const body = {
        region,
        filters: {
          satellite: satelliteArn || null,
          groundStation: groundStation || null,
          missionProfileArn: missionProfileArn || null,
          statusList: status ? [status] : [],
          startTime: startTime ? new Date(startTime).toISOString() : null,
          endTime: endTime ? new Date(endTime).toISOString() : null,
        },
        pageToken: null,
      };
      const res = await api.post<any>(`/api/aws-contacts/list`, body);
      const items: ContactRow[] = (res?.items || []).map((c: any) => ({
        contactId: "Contact Available",
        status: c.status,
        catalogLabel: labelForCatalog(c),
        groundStation: c.groundStation || "",
        startTime: c.startTime,
        endTime: c.endTime,
        maxElevationDeg:
          typeof c.maximumElevationDeg === "number"
            ? c.maximumElevationDeg
            : undefined,
      }));
      setRows(items);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || t("Failed to list contacts"));
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
    badAvailableCombo,
    t,
    labelForCatalog,
  ]);

  React.useEffect(() => {
    loadOptions();
  }, [loadOptions]);

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
      <Box
        sx={{
          px: 1.25,
          py: 0.7,
          borderBottom: `1px solid ${vars.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 16 }}>
          AWS Contacts
        </Typography>
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button
            size="small"
            onClick={() => loadContacts()}
            disabled={loading}
            sx={{ textTransform: "none", fontWeight: 700, color: vars.accent }}
          >
            Refresh
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
        <FormControl size="small" sx={(t) => ({ ...controlSx, ...filledField(t) })}>
          <InputLabel>Region</InputLabel>
          <Select
            value={region}
            label="Region"
            onChange={(e) => {
              const newRegion = String(e.target.value);
              setRegion(newRegion);

              // IMPORTANT: clear region-scoped ARNs so next loadOptions picks region-valid ones
              setSatelliteArn("");
              setMissionProfileArn("");

              // Optional convenience: default GS for selected region
              setGroundStation(DEFAULT_GS_FOR_REGION[newRegion] || "");
            }}
          >
            {REGION_OPTIONS.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={(t) => ({ ...controlSx, ...filledField(t) })}>
          <InputLabel>Satellite number</InputLabel>
          <Select
            value={satelliteArn}
            label="Satellite number"
            onChange={(e) => setSatelliteArn(String(e.target.value))}
            displayEmpty
            renderValue={(v) =>
              v
                ? satOptions.find((s) => s.arn === v)?.label || v
                : "Select satellite"
            }
          >
            {satOptions.map((s) => (
              <MenuItem key={s.id} value={s.arn as string}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={(t) => ({ ...controlSx, ...filledField(t) })}>
          <InputLabel>Ground station</InputLabel>
          <Select
            value={groundStation}
            label="Ground station"
            onChange={(e) => setGroundStation(String(e.target.value))}
            displayEmpty
            renderValue={(v) => (v ? v : "Any")}
          >
            {gsOptions.map((g) => (
              <MenuItem key={g.id} value={g.id}>
                {g.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={(t) => ({ ...controlSx, ...filledField(t) })}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(String(e.target.value))}
          >
            {["AVAILABLE", "SCHEDULED", "COMPLETED", "AWS_CANCELLED", "CANCELLED"].map(
              (s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              )
            )}
          </Select>
        </FormControl>

        <FormControl size="small" sx={(t) => ({ ...controlSx, ...filledField(t) })}>
          <InputLabel>Mission profile</InputLabel>
          <Select
            value={missionProfileArn}
            label="Mission profile"
            onChange={(e) => setMissionProfileArn(String(e.target.value))}
            displayEmpty
            renderValue={(v) =>
              v
                ? mpOptions.find((m) => (m.arn || m.id) === v)?.label || v
                : "Any"
            }
          >
            {mpOptions.map((m) => (
              <MenuItem key={m.id} value={(m.arn || m.id) as string}>
                {m.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 1,
          }}
        >
          <TextField
            type="datetime-local"
            size="small"
            label={t("Start time")}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            sx={(t) => ({ ...controlSx, ...filledField(t) })}
          />
          <TextField
            type="datetime-local"
            size="small"
            label={t("End time")}
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            sx={(t) => ({ ...controlSx, ...filledField(t) })}
          />
        </Box>
      </Box>

      {/* Table header (Orbit removed, Max elevation column added) */}
      <Box
        sx={{
          px: 1,
          py: 0.5,
          borderTop: `1px solid ${vars.border}`,
          bgcolor: vars.bgCard,
          fontWeight: 700,
          display: "grid",
          gridTemplateColumns:
            "2fr 1fr 1.5fr 1.4fr 1.4fr 1.1fr 1.2fr",
          gap: 1,
          color: vars.text,
        }}
      >
        <Box>Contact Id</Box>
        <Box>Status</Box>
        <Box>Catalog number</Box>
        <Box>Ground station</Box>
        <Box>Start time (UTC)</Box>
        <Box>End time (UTC)</Box>
        <Box>Max elevation (deg)</Box>
      </Box>

      {/* Rows */}
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", ...SCROLLER_SX }}>
        {rows.map((r, idx) => (
          <Box
            key={idx + r.startTime}
            sx={{
              px: 1,
              py: 0.75,
              borderBottom: `1px solid ${vars.border}`,
              display: "grid",
              gridTemplateColumns:
                "2fr 1fr 1.5fr 1.4fr 1.4fr 1.1fr 1.2fr",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography sx={{ fontSize: 13 }}>{r.contactId}</Typography>
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
            <Typography sx={{ fontSize: 13 }}>{r.catalogLabel}</Typography>
            <Typography sx={{ fontSize: 13 }}>
              {r.groundStation || "-"}
            </Typography>
            <Typography sx={{ fontSize: 13 }}>
              {fmtUtc(r.startTime)}
            </Typography>
            <Typography sx={{ fontSize: 13 }}>
              {fmtUtc(r.endTime)}
            </Typography>
            <Typography sx={{ fontSize: 13 }}>
              {typeof r.maxElevationDeg === "number"
                ? r.maxElevationDeg.toFixed(2)
                : "-"}
            </Typography>
          </Box>
        ))}
        {!rows.length && (
          <Box sx={{ p: 2, color: vars.textDim }}>
            {loading ? "Loading contacts…" : "No contacts for selected filters."}
          </Box>
        )}
      </Box>
    </Card>
  );
}

/* ---------- tiny style helpers ---------- */
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
      `1px solid ${
        t.palette.mode === "dark" ? "rgba(124,255,141,0.18)" : "#7CFF8D"
      }`,
    boxShadow: (t: any) =>
      t.palette.mode === "dark"
        ? "inset 0 0 0 1px rgba(124,255,141,0.06)"
        : "inset 0 0 0 1px rgba(124,255,141,0.12)",
  },
  "&.Mui-selected:hover": {
    bgcolor: (t: any) => (t.palette.mode === "dark" ? vars.bgHover : "#FFFFFF"),
  },
} as const;
