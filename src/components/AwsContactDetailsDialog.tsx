// src/components/AwsContactDetailsDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Button,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import HubIcon from "@mui/icons-material/Hub";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HeightIcon from "@mui/icons-material/Height";
import CodeIcon from "@mui/icons-material/Code";

import { vars } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";

export interface ContactItem {
  id: string;
  contactId: string | null;
  status: string;
  satellite?: string;
  satelliteArn?: string | null;
  catalogNumber?: string | number | null;
  catalogLabel?: string;
  groundStation?: string;
  missionProfileArn?: string | null;
  missionProfileName?: string | null;
  startTime: string | null;
  endTime: string | null;
  maximumElevationDeg?: number;
  maxElevationDeg?: number;
  orbit?: number | string | null;
  _raw?: any;
}

interface AwsContactDetailsDialogProps {
  open: boolean;
  contact: ContactItem | null;
  onClose: () => void;
  onReserve?: (contact: ContactItem) => void;
  onCancel?: (contact: ContactItem) => void;
  actionLoading?: boolean;
}

function formatUtc(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "-";
  return (
    d.toISOString().replace("T", " ").replace(/\.\d+Z$/, "") + " UTC"
  );
}

function formatLocal(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(+d)) return "-";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function calculateDuration(start?: string | null, end?: string | null): string {
  if (!start || !end) return "-";
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (Number.isNaN(s) || Number.isNaN(e) || e < s) return "-";
  const sec = Math.round((e - s) / 1000);
  const m = Math.floor(sec / 60);
  const remSec = sec % 60;
  return `${m}m ${remSec}s (${sec}s)`;
}

function getStatusChipColor(status: string) {
  const s = String(status || "").toUpperCase();
  if (s === "AVAILABLE") return { bg: "rgba(16, 185, 129, 0.15)", text: "#10B981", border: "rgba(16, 185, 129, 0.3)" };
  if (s === "SCHEDULED") return { bg: "rgba(14, 165, 233, 0.15)", text: "#0EA5E9", border: "rgba(14, 165, 233, 0.3)" };
  if (s === "COMPLETED") return { bg: "rgba(167, 139, 250, 0.15)", text: "#A78BFA", border: "rgba(167, 139, 250, 0.3)" };
  if (s === "CANCELLED" || s === "AWS_CANCELLED" || s === "FAILED") {
    return { bg: "rgba(244, 63, 94, 0.15)", text: "#F43F5E", border: "rgba(244, 63, 94, 0.3)" };
  }
  return { bg: "rgba(148, 163, 184, 0.15)", text: "#94A3B8", border: "rgba(148, 163, 184, 0.3)" };
}

export const AwsContactDetailsDialog: React.FC<AwsContactDetailsDialogProps> = ({
  open,
  contact,
  onClose,
  onReserve,
  onCancel,
  actionLoading = false,
}) => {
  const { t } = useI18n();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);
  const [showRaw, setShowRaw] = React.useState(false);

  if (!contact) return null;

  const copyText = (key: string, text?: string | null) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const statusStyle = getStatusChipColor(contact.status);
  const maxElev = contact.maximumElevationDeg ?? contact.maxElevationDeg;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: vars.bgCard,
          color: vars.text,
          border: `1px solid ${vars.border}`,
          borderRadius: 2.5,
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${vars.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <SatelliteAltIcon sx={{ color: vars.accent, fontSize: 22 }} />
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: vars.text }}>
              {t("Contact Details")}
            </Typography>
            <Typography sx={{ fontSize: 12, color: vars.textDim, fontFamily: "monospace" }}>
              {contact.contactId || t("Available Opportunity (Not yet scheduled)")}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            size="small"
            label={contact.status}
            sx={{
              height: 24,
              fontSize: 11,
              fontWeight: 700,
              bgcolor: statusStyle.bg,
              color: statusStyle.text,
              border: `1px solid ${statusStyle.border}`,
            }}
          />
          <IconButton size="small" onClick={onClose} sx={{ color: vars.textDim, "&:hover": { color: vars.text } }}>
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Core Parameters Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          {/* Satellite / Catalog */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (t) => (t.palette.mode === "dark" ? "#141416" : "#F8FAFC"),
              border: `1px solid ${vars.border}`,
            }}
          >
            <Typography sx={{ fontSize: 12, color: vars.textDim, fontWeight: 600, mb: 0.5 }}>
              {t("Satellite / Catalog Number")}
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: vars.text, mb: 0.5 }}>
              {contact.catalogLabel || contact.catalogNumber || contact.satellite || "-"}
            </Typography>
            {contact.satelliteArn && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: vars.textDim,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {contact.satelliteArn}
                </Typography>
                <Tooltip title={copiedKey === "satArn" ? t("Copied!") : t("Copy ARN")}>
                  <IconButton
                    size="small"
                    onClick={() => copyText("satArn", contact.satelliteArn)}
                    sx={{ p: 0.5, color: vars.textDim }}
                  >
                    {copiedKey === "satArn" ? (
                      <CheckIcon sx={{ fontSize: 14, color: "#10B981" }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          {/* Ground Station */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (t) => (t.palette.mode === "dark" ? "#141416" : "#F8FAFC"),
              border: `1px solid ${vars.border}`,
            }}
          >
            <Typography sx={{ fontSize: 12, color: vars.textDim, fontWeight: 600, mb: 0.5 }}>
              {t("Ground Station Location")}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <HubIcon sx={{ fontSize: 18, color: "#0EA5E9" }} />
              <Typography sx={{ fontSize: 14, fontWeight: 700, color: vars.text }}>
                {contact.groundStation || "-"}
              </Typography>
            </Box>
            {contact.orbit && (
              <Typography sx={{ fontSize: 12, color: vars.textDim, mt: 1 }}>
                Orbit: <strong style={{ color: vars.text }}>#{contact.orbit}</strong>
              </Typography>
            )}
          </Box>

          {/* Time & Duration */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (t) => (t.palette.mode === "dark" ? "#141416" : "#F8FAFC"),
              border: `1px solid ${vars.border}`,
              gridColumn: { sm: "span 2" },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <AccessTimeIcon sx={{ fontSize: 18, color: vars.accent }} />
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.text }}>
                {t("Pass Timing & Schedule")}
              </Typography>
              <Box sx={{ ml: "auto", fontSize: 12, color: vars.textDim }}>
                Duration:{" "}
                <strong style={{ color: "#10B981" }}>
                  {calculateDuration(contact.startTime, contact.endTime)}
                </strong>
              </Box>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 11, color: vars.textDim, textTransform: "uppercase" }}>
                  {t("Start Time")}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: vars.text }}>
                  {formatUtc(contact.startTime)}
                </Typography>
                <Typography sx={{ fontSize: 11, color: vars.textDim }}>
                  Local: {formatLocal(contact.startTime)}
                </Typography>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 11, color: vars.textDim, textTransform: "uppercase" }}>
                  {t("End Time")}
                </Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 700, fontFamily: "monospace", color: vars.text }}>
                  {formatUtc(contact.endTime)}
                </Typography>
                <Typography sx={{ fontSize: 11, color: vars.textDim }}>
                  Local: {formatLocal(contact.endTime)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Max Elevation */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (t) => (t.palette.mode === "dark" ? "#141416" : "#F8FAFC"),
              border: `1px solid ${vars.border}`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <HeightIcon sx={{ fontSize: 18, color: "#F59E0B" }} />
              <Typography sx={{ fontSize: 12, color: vars.textDim, fontWeight: 600 }}>
                {t("Maximum Elevation")}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: vars.text }}>
              {typeof maxElev === "number" ? `${maxElev.toFixed(1)}°` : "-"}
            </Typography>
          </Box>

          {/* Mission Profile */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (t) => (t.palette.mode === "dark" ? "#141416" : "#F8FAFC"),
              border: `1px solid ${vars.border}`,
            }}
          >
            <Typography sx={{ fontSize: 12, color: vars.textDim, fontWeight: 600, mb: 0.5 }}>
              {t("Mission Profile")}
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 700,
                color: vars.text,
                fontFamily: "monospace",
                wordBreak: "break-all",
              }}
            >
              {contact.missionProfileName ||
                (contact.missionProfileArn ? contact.missionProfileArn.split("/").pop() : "-")}
            </Typography>
            {contact.missionProfileArn && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: 11,
                    color: vars.textDim,
                    fontFamily: "monospace",
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {contact.missionProfileArn}
                </Typography>
                <Tooltip title={copiedKey === "mpArn" ? t("Copied!") : t("Copy ARN")}>
                  <IconButton
                    size="small"
                    onClick={() => copyText("mpArn", contact.missionProfileArn)}
                    sx={{ p: 0.5, color: vars.textDim }}
                  >
                    {copiedKey === "mpArn" ? (
                      <CheckIcon sx={{ fontSize: 14, color: "#10B981" }} />
                    ) : (
                      <ContentCopyIcon sx={{ fontSize: 14 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>
        </Box>

        {/* Collapsible Raw JSON Inspector */}
        {contact._raw && (
          <Box>
            <Button
              size="small"
              startIcon={<CodeIcon sx={{ fontSize: 16 }} />}
              onClick={() => setShowRaw(!showRaw)}
              sx={{ textTransform: "none", color: vars.textDim, fontSize: 12 }}
            >
              {showRaw ? t("Hide Raw AWS Metadata") : t("Inspect Raw AWS Metadata")}
            </Button>

            {showRaw && (
              <Box
                sx={{
                  mt: 1,
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: (t) => (t.palette.mode === "dark" ? "#0A0A0C" : "#F1F5F9"),
                  border: `1px solid ${vars.border}`,
                  maxHeight: 220,
                  overflowY: "auto",
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontFamily: "monospace",
                    color: vars.text,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {JSON.stringify(contact._raw, null, 2)}
                </pre>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider sx={{ borderColor: vars.border }} />

      {/* Dialog Footer Actions */}
      <DialogActions sx={{ px: 3, py: 2, display: "flex", justifyContent: "space-between" }}>
        <Box>
          {contact.status === "AVAILABLE" && onReserve && (
            <Button
              variant="contained"
              disabled={actionLoading}
              onClick={() => onReserve(contact)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#10B981",
                "&:hover": { bgcolor: "#059669" },
              }}
            >
              {t("Reserve This Contact")}
            </Button>
          )}

          {contact.status === "SCHEDULED" && onCancel && (
            <Button
              variant="contained"
              color="error"
              disabled={actionLoading}
              onClick={() => onCancel(contact)}
              sx={{
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              {t("Cancel This Contact")}
            </Button>
          )}
        </Box>

        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderColor: vars.border,
            color: vars.text,
            fontWeight: 600,
          }}
        >
          {t("Close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AwsContactDetailsDialog;
