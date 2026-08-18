// src/pages/Monitoring/Settings.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  TextField,
  Button,
  Divider,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import { api } from "../../api/http";
import { useI18n } from "../../i18n";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";

type SettingsMap = {
  [key: string]: string;
};

export default function Settings() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsMap>({});
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await api.get<{ success: boolean; settings: SettingsMap }>("/api/monitoring/settings");
      if (response.success) {
        setSettings(response.settings);
      } else {
        setMessage({ type: "error", text: t("Failed to load settings") });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || t("Failed to load settings") });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await api.put<{ success: boolean; settings: SettingsMap }>("/api/monitoring/settings", settings);
      if (response.success) {
        setSettings(response.settings);
        setMessage({ type: "success", text: t("Settings saved successfully") });
      } else {
        setMessage({ type: "error", text: t("Failed to save settings") });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || t("Failed to save settings") });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
      "&:hover fieldset": { borderColor: "#0EA5E9" },
      "&.Mui-focused fieldset": { borderColor: "#0EA5E9" },
      color: "#FFF",
      backgroundColor: "rgba(30, 41, 59, 0.4)",
    },
    "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#0EA5E9" },
    input: { color: "#FFF" },
  };

  return (
    <MainLayout>
      <AmbientLighting />
      <Box sx={{ p: 3, maxWidth: 1000, margin: "0 auto" }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#FFF", letterSpacing: 0.5 }}>
            {t("Monitoring Settings")}
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={fetchSettings}
              startIcon={<RefreshIcon />}
              sx={{
                borderColor: "rgba(255,255,255,0.2)",
                color: "#FFF",
                textTransform: "none",
                "&:hover": { borderColor: "#0EA5E9", backgroundColor: "rgba(14,165,233,0.1)" },
              }}
            >
              {t("Refresh")}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              sx={{
                backgroundColor: "#0EA5E9",
                color: "#FFF",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#0284C7" },
              }}
            >
              {t("Save Changes")}
            </Button>
          </Box>
        </Box>

        {message && (
          <Box
            sx={{
              p: 1.5,
              mb: 3,
              borderRadius: 1,
              border: "1px solid",
              backgroundColor: message.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              borderColor: message.type === "success" ? "#10B981" : "#EF4444",
            }}
          >
            <Typography variant="body2" sx={{ color: message.type === "success" ? "#34D399" : "#F87171" }}>
              {message.text}
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
            {/* General & Telemetry */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.75)" }}>
              <Typography variant="h6" sx={{ color: "#FFF", fontWeight: 600, mb: 2 }}>
                {t("Polling & Telemetry Retention")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <TextField
                  label={t("Default Poll Interval (Seconds)")}
                  value={settings.default_poll_interval || ""}
                  onChange={(e) => handleChange("default_poll_interval", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("Default Timeout (Milliseconds)")}
                  value={settings.default_timeout || ""}
                  onChange={(e) => handleChange("default_timeout", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("Default Retries")}
                  value={settings.default_retries || ""}
                  onChange={(e) => handleChange("default_retries", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("Max Concurrent Pollers")}
                  value={settings.max_concurrent_polls || ""}
                  onChange={(e) => handleChange("max_concurrent_polls", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("Telemetry Retention (Days)")}
                  value={settings.telemetry_retention_days || ""}
                  onChange={(e) => handleChange("telemetry_retention_days", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
              </Box>
            </Card>

            {/* SNMP Defaults */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.75)" }}>
              <Typography variant="h6" sx={{ color: "#FFF", fontWeight: 600, mb: 2 }}>
                {t("SNMP Default Credentials")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2.5 }}>
                <TextField
                  label={t("Default SNMP Version")}
                  value={settings.snmp_default_version || ""}
                  onChange={(e) => handleChange("snmp_default_version", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("Default SNMP Community")}
                  value={settings.snmp_default_community || ""}
                  onChange={(e) => handleChange("snmp_default_community", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
              </Box>
            </Card>

            {/* CLI Paths */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.75)" }}>
              <Typography variant="h6" sx={{ color: "#FFF", fontWeight: 600, mb: 2 }}>
                {t("CLI Tool Executable Binary Paths")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2.5 }}>
                <TextField
                  label={t("SNMP Get Binary Path")}
                  value={settings.cli_snmpget_path || ""}
                  onChange={(e) => handleChange("cli_snmpget_path", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("SNMP Walk Binary Path")}
                  value={settings.cli_snmpwalk_path || ""}
                  onChange={(e) => handleChange("cli_snmpwalk_path", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("SNMP Set Binary Path")}
                  value={settings.cli_snmpset_path || ""}
                  onChange={(e) => handleChange("cli_snmpset_path", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("SNMP Bulk Get Binary Path")}
                  value={settings.cli_snmpbulkget_path || ""}
                  onChange={(e) => handleChange("cli_snmpbulkget_path", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
                <TextField
                  label={t("SNMP GetNext Binary Path")}
                  value={settings.cli_snmpgetnext_path || ""}
                  onChange={(e) => handleChange("cli_snmpgetnext_path", e.target.value)}
                  sx={inputStyle}
                  fullWidth
                  size="small"
                />
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
