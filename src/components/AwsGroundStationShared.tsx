// src/components/AwsGroundStationShared.tsx
import React from "react";
import {
  Box,
  Button,
  Chip,
  Typography,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Tooltip,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import HubIcon from "@mui/icons-material/Hub";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DnsIcon from "@mui/icons-material/Dns";
import RouterIcon from "@mui/icons-material/Router";

import { vars, sxPresets } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";
import { type ContactItem, AwsContactDetailsDialog } from "./AwsContactDetailsDialog";

export interface Opt {
  id: string;
  label?: string;
  name?: string;
  arn?: string;
  region?: string | null;
}

export interface RegionMetadata {
  id: number;
  name: string;
  code: string;
  awsRegion: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  stations?: Array<{
    stationType: string;
    stationName: string;
    stationId: string;
    groundStation?: string;
    receiver?: string;
    ec2SdrInstanceId?: string;
    ec2ReceiverInstanceId?: string;
  }>;
}

const FIELD_H = 36;
const CONTENT_H = 32;
const FONT_PX = 13;
const HORIZ_PAD = 8;

export const controlSx = {
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

export const filledField = (t: any) => ({
  "& .MuiOutlinedInput-root": {
    backgroundColor: t.palette.mode === "dark" ? "#1B1B1E" : "#fff",
  },
  "& .MuiOutlinedInput-root.Mui-focused": {
    backgroundColor: t.palette.mode === "dark" ? "#1B1B1E" : "#fff",
  },
  "& .MuiInputBase-input": {
    color: t.palette.mode === "dark" ? vars.text : "#000",
    "::placeholder": {
      color: t.palette.mode === "dark" ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
      opacity: 1,
    },
  },
});

export const autocompleteSx = (t: any) => ({
  ...controlSx,
  ...filledField(t),
  "& .MuiAutocomplete-inputRoot": {
    height: `${FIELD_H}px`,
    minHeight: `${FIELD_H}px`,
    padding: `0 ${HORIZ_PAD}px !important`,
  },
  "& .MuiAutocomplete-input": {
    height: `${CONTENT_H}px !important`,
    padding: "0 !important",
  },
});

export function formatUtcTime(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "-";
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  return `${y}-${m}-${day} ${hh}:${mm}:${ss} UTC`;
}

export function toUtcInputFormat(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = d.getUTCFullYear();
  const m = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  return `${y}-${m}-${day}T${hh}:${mm}`;
}

export function fromUtcInput(val: string): string {
  if (!val) return "";
  if (val.endsWith("Z")) return val;
  if (val.length === 19) return `${val}.000Z`;
  if (val.length === 16) return `${val}:00.000Z`;
  return new Date(val).toISOString();
}

export function statusColor(st: string) {
  const s = String(st || "").toUpperCase();
  if (s === "AVAILABLE") return "#10B981";
  if (s === "SCHEDULED") return "#0EA5E9";
  if (s === "COMPLETED") return "#A78BFA";
  if (s === "AWS_CANCELLED" || s === "CANCELLED" || s === "FAILED") return "#F43F5E";
  return "#94A3B8";
}

/* ---------------- Region Metadata Card ---------------- */
export function RegionMetadataCard({
  regions,
  selectedRegion,
  gs,
}: {
  regions: RegionMetadata[];
  selectedRegion: string;
  gs: "gs1" | "gs2";
}) {
  const targetStationType = gs === "gs2" ? "SD2" : "SD1";
  const regionObj = regions.find((r) => r.awsRegion === selectedRegion) || regions[0];

  const stationObj =
    regionObj?.stations?.find(
      (s) => String(s.stationType).toUpperCase() === targetStationType
    ) || null;

  const stationId =
    stationObj?.stationId || (gs === "gs2" ? `${regionObj?.code || "REG"}2` : `${regionObj?.code || "REG"}1`);
  const groundStation = stationObj?.groundStation || "-";
  const receiverId = stationObj?.ec2ReceiverInstanceId || "-";
  const sdrId = stationObj?.ec2SdrInstanceId || "-";

  // Display explicit Account ID
  const accountId = gs === "gs2" ? "586794476605" : "908027376569";
  const accountBadge = gs === "gs2" ? `GS2 / SD2 • Account: ${accountId}` : `GS1 / SD1 • Account: ${accountId}`;
  const accountColor = gs === "gs2" ? "#F59E0B" : "#0EA5E9";

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        bgcolor: (t) => (t.palette.mode === "dark" ? "#161619" : "#F8FAFC"),
        border: `1px solid ${vars.border}`,
        borderRadius: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <HubIcon sx={{ fontSize: 18, color: accountColor }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.text }}>
            {regionObj?.name || selectedRegion} ({regionObj?.awsRegion || selectedRegion})
          </Typography>
        </Box>

        <Chip
          size="small"
          icon={<ShieldOutlinedIcon sx={{ fontSize: 14, color: `${accountColor} !important` }} />}
          label={accountBadge}
          sx={{
            height: 24,
            fontSize: 11,
            fontWeight: 700,
            bgcolor: `${accountColor}15`,
            color: accountColor,
            border: `1px solid ${accountColor}40`,
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, color: vars.textDim, fontSize: 12 }}>
          <Box component="span">
            Station: <strong style={{ color: vars.text }}>{stationId}</strong>
          </Box>
          <Box component="span">•</Box>
          <Box component="span">
            GS: <strong style={{ color: vars.text }}>{groundStation}</strong>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        {receiverId !== "-" && (
          <Tooltip title="Ground Station Receiver EC2 Instance ID">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 11, color: vars.textDim }}>
              <DnsIcon sx={{ fontSize: 14, color: "#10B981" }} />
              <span>Receiver:</span>
              <code
                style={{
                  color: vars.text,
                  fontSize: 11,
                  background: "rgba(255,255,255,0.05)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {receiverId}
              </code>
            </Box>
          </Tooltip>
        )}

        {sdrId !== "-" && (
          <Tooltip title="Ground Station SDR EC2 Instance ID">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 11, color: vars.textDim }}>
              <RouterIcon sx={{ fontSize: 14, color: "#38BDF8" }} />
              <span>SDR:</span>
              <code
                style={{
                  color: vars.text,
                  fontSize: 11,
                  background: "rgba(255,255,255,0.05)",
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {sdrId}
              </code>
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}

/* ---------------- Filter Bar ---------------- */
interface AwsFilterBarProps {
  gs: "gs1" | "gs2";
  onGsChange: (gs: "gs1" | "gs2") => void;
  region: string;
  onRegionChange: (region: string) => void;
  regions: RegionMetadata[];
  satelliteArn: string;
  onSatelliteChange: (arn: string) => void;
  satOptions: Opt[];
  missionProfileArn: string;
  onMissionProfileChange: (arn: string) => void;
  mpOptions: Opt[];
  groundStation: string;
  onGroundStationChange: (gsName: string) => void;
  gsOptions: Opt[];
  status: string;
  onStatusChange: (st: string) => void;
  startTime: string;
  onStartTimeChange: (st: string) => void;
  endTime: string;
  onEndTimeChange: (et: string) => void;
  onQuery: () => void;
  onClear: () => void;
  loading: boolean;
  optionsLoading: boolean;
}

export function AwsGroundStationFilterBar({
  gs,
  onGsChange,
  region,
  onRegionChange,
  regions,
  satelliteArn,
  onSatelliteChange,
  satOptions,
  missionProfileArn,
  onMissionProfileChange,
  mpOptions,
  groundStation,
  onGroundStationChange,
  gsOptions,
  status,
  onStatusChange,
  startTime,
  onStartTimeChange,
  endTime,
  onEndTimeChange,
  onQuery,
  onClear,
  loading,
  optionsLoading,
}: AwsFilterBarProps) {
  const { t } = useI18n();

  // Presets
  const applyPreset = (type: "boundary7d" | "inclusive7d" | "next7d" | "next24h") => {
    if (type === "boundary7d") {
      onStartTimeChange("2026-09-30T00:00");
      onEndTimeChange("2026-10-07T00:00");
    } else if (type === "inclusive7d") {
      onStartTimeChange("2026-09-30T00:00");
      onEndTimeChange("2026-10-07T23:59");
    } else if (type === "next7d") {
      const now = new Date();
      onStartTimeChange(toUtcInputFormat(now));
      onEndTimeChange(toUtcInputFormat(new Date(now.getTime() + 7 * 24 * 3600 * 1000)));
    } else if (type === "next24h") {
      const now = new Date();
      onStartTimeChange(toUtcInputFormat(now));
      onEndTimeChange(toUtcInputFormat(new Date(now.getTime() + 24 * 3600 * 1000)));
    }
  };

  const selectedSatObj = satOptions.find((s) => (s.arn || s.id) === satelliteArn) || null;
  const selectedMpObj = mpOptions.find((m) => (m.arn || m.id) === missionProfileArn) || null;
  const selectedGsObj = gsOptions.find((g) => g.id === groundStation) || gsOptions[0] || null;

  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
      <Box
        sx={{
          p: 2,
          bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#121214" : "#F8FAFC"),
          border: `1px solid ${vars.border}`,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1.75,
        }}
      >
        {/* Container Header */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: vars.textDim }}>
            {t("Filters")}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 11, color: vars.textDim }}>
              {t("UTC Query Window")}
            </Typography>
          </Box>
        </Box>

        {/* Row 1: Primary Resource Selectors */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "1.1fr 1.5fr 1.5fr 1.4fr",
            },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          {/* Region */}
          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Region")}</InputLabel>
            <Select
              value={region}
              label={t("Region")}
              onChange={(e) => onRegionChange(String(e.target.value))}
            >
              {regions.map((r) => (
                <MenuItem key={r.id} value={r.awsRegion}>
                  {r.name} ({r.awsRegion})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Satellite (Searchable Autocomplete) */}
          <Autocomplete
            size="small"
            options={satOptions}
            getOptionLabel={(option) => option.label || option.name || option.id}
            value={selectedSatObj}
            onChange={(_, newVal) => {
              onSatelliteChange(newVal ? newVal.arn || newVal.id : "");
            }}
            isOptionEqualToValue={(option, val) => (option.arn || option.id) === (val.arn || val.id)}
            loading={optionsLoading}
            sx={(tMui) => autocompleteSx(tMui)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Satellite / Catalog")}
                placeholder={t("Select satellite...")}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {optionsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Mission Profile (Searchable Autocomplete) */}
          <Autocomplete
            size="small"
            options={mpOptions}
            getOptionLabel={(option) => option.name || option.label || option.id}
            value={selectedMpObj}
            onChange={(_, newVal) => {
              onMissionProfileChange(newVal ? newVal.arn || newVal.id : "");
            }}
            isOptionEqualToValue={(option, val) => (option.arn || option.id) === (val.arn || val.id)}
            loading={optionsLoading}
            sx={(tMui) => autocompleteSx(tMui)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Mission Profile")}
                placeholder={t("Select mission profile...")}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {optionsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Ground Station (Searchable Autocomplete) */}
          <Autocomplete
            size="small"
            options={gsOptions}
            getOptionLabel={(option) => option.label || option.name || option.id}
            value={selectedGsObj}
            onChange={(_, newVal) => {
              onGroundStationChange(newVal ? newVal.id : "any");
            }}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            loading={optionsLoading}
            sx={(tMui) => autocompleteSx(tMui)}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t("Ground Station")}
                placeholder={t("Any Ground Station")}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {optionsLoading ? <CircularProgress color="inherit" size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

        {/* Row 2: Status, Date Ranges (UTC), Presets & Query Actions */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "1.1fr 1.35fr 1.35fr auto",
            },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          {/* Status */}
          <FormControl size="small" sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}>
            <InputLabel>{t("Status")}</InputLabel>
            <Select
              value={status}
              label={t("Status")}
              onChange={(e) => onStatusChange(String(e.target.value))}
            >
              <MenuItem value="AVAILABLE">AVAILABLE (Available to Schedule)</MenuItem>
              <MenuItem value="SCHEDULED">SCHEDULED (Reserved)</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED / FAILED</MenuItem>
              <MenuItem value="ALL_EXCEPT_AVAILABLE">All except Available</MenuItem>
              <MenuItem value="ALL">All Contacts</MenuItem>
            </Select>
          </FormControl>

          {/* Start Time (UTC) */}
          <TextField
            type="datetime-local"
            size="small"
            label={t("Start Time (UTC)")}
            value={startTime}
            onChange={(e) => onStartTimeChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
          />

          {/* End Time (UTC) */}
          <TextField
            type="datetime-local"
            size="small"
            label={t("End Time (UTC)")}
            value={endTime}
            onChange={(e) => onEndTimeChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={(tMui) => ({ ...controlSx, ...filledField(tMui) })}
          />

          {/* Actions Bar */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Box sx={{ display: "flex", gap: 0.5, border: `1px solid ${vars.border}`, borderRadius: 1.25, p: 0.25, bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#1B1B1E" : "#fff") }}>
              <Tooltip title="Exact 7-day boundary (2026-09-30T00:00Z -> 2026-10-07T00:00Z) -> 7 contacts">
                <Button
                  size="small"
                  variant="text"
                  onClick={() => applyPreset("boundary7d")}
                  sx={{
                    fontSize: 11,
                    py: 0.25,
                    px: 0.75,
                    minWidth: 0,
                    height: 26,
                    fontWeight: 600,
                    textTransform: "none",
                    color: vars.textDim,
                    "&:hover": { color: vars.text, bgcolor: vars.bgHover },
                  }}
                >
                  7D (00:00Z)
                </Button>
              </Tooltip>

              <Tooltip title="Inclusive 7-day window (2026-09-30T00:00Z -> 2026-10-07T23:59Z) -> 8 contacts">
                <Button
                  size="small"
                  variant="text"
                  onClick={() => applyPreset("inclusive7d")}
                  sx={{
                    fontSize: 11,
                    py: 0.25,
                    px: 0.75,
                    minWidth: 0,
                    height: 26,
                    fontWeight: 600,
                    textTransform: "none",
                    color: vars.textDim,
                    "&:hover": { color: vars.text, bgcolor: vars.bgHover },
                  }}
                >
                  7D (23:59Z)
                </Button>
              </Tooltip>
            </Box>

            <Tooltip title={t("Clear and reset all filters")}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<FilterAltOffIcon sx={{ fontSize: 15 }} />}
                onClick={onClear}
                sx={{
                  height: FIELD_H,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 12,
                  borderColor: vars.border,
                  color: vars.textDim,
                  "&:hover": { borderColor: vars.accent, color: vars.text, bgcolor: vars.bgHover },
                }}
              >
                {t("Clear")}
              </Button>
            </Tooltip>

            <Button
              size="small"
              variant="contained"
              startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
              onClick={onQuery}
              disabled={loading || optionsLoading}
              sx={{
                height: FIELD_H,
                px: 2,
                textTransform: "none",
                fontWeight: 700,
                fontSize: 13,
                bgcolor: vars.accent,
                color: "#000",
                "&:hover": { bgcolor: "#0284c7" },
              }}
            >
              {loading ? t("Querying...") : t("Query Contacts")}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

/* ---------------- Table Component ---------------- */
interface AwsContactsTableProps {
  rows: ContactItem[];
  loading: boolean;
  isManualMode?: boolean;
  selectedIds?: string[];
  onToggleSelectAll?: () => void;
  onToggleRow?: (id: string) => void;
  onReserveSingle?: (contact: ContactItem) => void;
  onCancelSingle?: (contact: ContactItem) => void;
  actionLoading?: boolean;
  onRefresh: () => void;
  filterSummary?: string;
}

export function AwsGroundStationContactsTable({
  rows,
  loading,
  isManualMode = false,
  selectedIds = [],
  onToggleSelectAll,
  onToggleRow,
  onReserveSingle,
  onCancelSingle,
  actionLoading = false,
  onRefresh,
  filterSummary,
}: AwsContactsTableProps) {
  const { t } = useI18n();
  const [activeModalContact, setActiveModalContact] = React.useState<ContactItem | null>(null);

  // Export visible contacts to CSV
  const handleExportCsv = () => {
    if (!rows.length) return;
    const headers = [
      "Contact ID",
      "Status",
      "Satellite / Catalog",
      "Ground Station",
      "Start Time (UTC)",
      "End Time (UTC)",
      "Max Elevation (deg)",
      "Satellite ARN",
      "Mission Profile ARN",
    ];
    const csvRows = rows.map((r) => [
      `"${r.contactId || "AVAILABLE"}"`,
      `"${r.status}"`,
      `"${r.catalogLabel || r.catalogNumber || r.satellite || ""}"`,
      `"${r.groundStation || ""}"`,
      `"${r.startTime || ""}"`,
      `"${r.endTime || ""}"`,
      r.maximumElevationDeg ?? r.maxElevationDeg ?? "",
      `"${r.satelliteArn || ""}"`,
      `"${r.missionProfileArn || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...csvRows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `aws_groundstation_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isAllSelected = rows.length > 0 && selectedIds.length === rows.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < rows.length;

  return (
    <>
      <Box sx={{ flex: 1, minHeight: 0, px: 2, pb: 2, display: "flex", flexDirection: "column" }}>
        {/* Table Header Controls */}
        <Box
          sx={{
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, color: vars.text }}>
              {t("Contacts")}
            </Typography>
            <Chip
              size="small"
              label={rows.length}
              sx={{
                height: 22,
                fontWeight: 700,
                fontSize: 12,
                bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "rgba(14, 165, 233, 0.15)" : "#E0F2FE"),
                color: "#0EA5E9",
                border: "1px solid rgba(14, 165, 233, 0.35)",
              }}
            />
            {filterSummary && (
              <Typography sx={{ fontSize: 12, color: vars.textDim, fontWeight: 500 }}>
                • {filterSummary}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<FileDownloadIcon sx={{ fontSize: 15 }} />}
              onClick={handleExportCsv}
              disabled={rows.length === 0}
              sx={{
                fontSize: 12,
                height: 32,
                textTransform: "none",
                fontWeight: 600,
                borderColor: vars.border,
                color: vars.text,
                "&:hover": { borderColor: vars.accent, bgcolor: vars.bgHover },
              }}
            >
              {t("Export CSV")}
            </Button>

            <Tooltip title={t("Refresh table")}>
              <IconButton
                size="small"
                onClick={onRefresh}
                disabled={loading}
                sx={{
                  border: `1px solid ${vars.border}`,
                  borderRadius: 1,
                  p: 0.6,
                  height: 32,
                  width: 32,
                  color: vars.textDim,
                  "&:hover": { color: vars.text, bgcolor: vars.bgHover },
                }}
              >
                <RefreshIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Table Container */}
        <TableContainer
          sx={{
            flex: 1,
            border: `1px solid ${vars.border}`,
            borderRadius: 1.5,
            bgcolor: (tMui) => (tMui.palette.mode === "dark" ? "#141416" : "#fff"),
            overflowX: "auto",
          }}
        >
          <Table stickyHeader size="small" sx={{ minWidth: 880 }}>
            <TableHead>
              <TableRow>
                {isManualMode && (
                  <TableCell sx={{ fontWeight: 700, width: 44, bgcolor: vars.bgCard, p: 0.5, textAlign: "center" }}>
                    <Checkbox
                      size="small"
                      checked={isAllSelected}
                      indeterminate={isIndeterminate}
                      onChange={onToggleSelectAll}
                    />
                  </TableCell>
                )}
                <TableCell sx={{ fontWeight: 700, bgcolor: vars.bgCard, color: vars.text }}>
                  {t("Contact ID")}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: vars.bgCard, color: vars.text }}>
                  {t("Status")}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: vars.bgCard, color: vars.text }}>
                  {t("Satellite / Catalog")}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: vars.bgCard, color: vars.text }}>
                  {t("Ground Station")}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: vars.bgCard, color: vars.text }}>
                  {t("Start Time (UTC)")}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: vars.bgCard, color: vars.text }}>
                  {t("End Time (UTC)")}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: vars.bgCard, color: vars.text }}>
                  {t("Max Elevation (°)")}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, width: 60, bgcolor: vars.bgCard, color: vars.text }}>
                  {t("Details")}
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isManualMode ? 9 : 8} align="center" sx={{ py: 8, color: vars.textDim }}>
                    <CircularProgress size={32} sx={{ color: vars.accent, mb: 1.5 }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                      {t("Querying contacts from AWS Ground Station...")}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isManualMode ? 9 : 8} align="center" sx={{ py: 8, color: vars.textDim }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 700, color: vars.text, mb: 0.75 }}>
                      {t("No contacts found for the selected filters.")}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: vars.textDim, maxWidth: 540, mx: "auto" }}>
                      {t(
                        "For AVAILABLE passes, ensure both a Satellite (e.g. 62459 / SPADEX-SD1) and Mission Profile are selected, and check your time window."
                      )}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r, idx) => {
                  const isSelected = selectedIds.includes(r.id);
                  const maxElev = r.maximumElevationDeg ?? r.maxElevationDeg;

                  return (
                    <TableRow
                      key={r.id || idx}
                      hover
                      selected={isSelected}
                      sx={{
                        cursor: "pointer",
                        "&:nth-of-type(odd)": {
                          backgroundColor: (t) =>
                            t.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "#FAFAFA",
                        },
                        "& td": { borderColor: vars.border, fontSize: 13, py: 1 },
                      }}
                    >
                      {isManualMode && (
                        <TableCell
                          padding="checkbox"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleRow && onToggleRow(r.id);
                          }}
                          sx={{ textAlign: "center" }}
                        >
                          <Checkbox size="small" checked={isSelected} />
                        </TableCell>
                      )}

                      {/* Contact ID */}
                      <TableCell
                        onClick={() => setActiveModalContact(r)}
                        sx={{ fontFamily: "monospace", fontSize: 12, color: vars.accent }}
                      >
                        {r.contactId ? (
                          <span style={{ textDecoration: "underline" }}>{r.contactId}</span>
                        ) : (
                          <em style={{ color: "#10B981" }}>Available Pass</em>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell align="center" onClick={() => setActiveModalContact(r)}>
                        <Chip
                          size="small"
                          label={r.status}
                          sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 700,
                            bgcolor: `${statusColor(r.status)}20`,
                            color: statusColor(r.status),
                            border: `1px solid ${statusColor(r.status)}40`,
                          }}
                        />
                      </TableCell>

                      {/* Satellite */}
                      <TableCell align="center" onClick={() => setActiveModalContact(r)}>
                        {r.catalogLabel || r.catalogNumber || r.satellite || "-"}
                      </TableCell>

                      {/* Ground Station */}
                      <TableCell align="center" onClick={() => setActiveModalContact(r)}>
                        {r.groundStation || "-"}
                      </TableCell>

                      {/* Start Time */}
                      <TableCell align="center" sx={{ fontFamily: "monospace" }} onClick={() => setActiveModalContact(r)}>
                        {formatUtcTime(r.startTime)}
                      </TableCell>

                      {/* End Time */}
                      <TableCell align="center" sx={{ fontFamily: "monospace" }} onClick={() => setActiveModalContact(r)}>
                        {formatUtcTime(r.endTime)}
                      </TableCell>

                      {/* Max Elevation */}
                      <TableCell align="center" onClick={() => setActiveModalContact(r)}>
                        {typeof maxElev === "number" ? `${maxElev.toFixed(1)}°` : "-"}
                      </TableCell>

                      {/* Details button */}
                      <TableCell
                        align="center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModalContact(r);
                        }}
                      >
                        <Tooltip title={t("View full contact details")}>
                          <IconButton size="small" sx={{ color: vars.textDim, "&:hover": { color: vars.text } }}>
                            <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Modal Dialog */}
      <AwsContactDetailsDialog
        open={Boolean(activeModalContact)}
        contact={activeModalContact}
        onClose={() => setActiveModalContact(null)}
        onReserve={
          onReserveSingle
            ? (c) => {
                onReserveSingle(c);
                setActiveModalContact(null);
              }
            : undefined
        }
        onCancel={
          onCancelSingle
            ? (c) => {
                onCancelSingle(c);
                setActiveModalContact(null);
              }
            : undefined
        }
        actionLoading={actionLoading}
      />
    </>
  );
}
