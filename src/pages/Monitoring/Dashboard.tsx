// src/pages/Monitoring/Dashboard.tsx
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  CircularProgress,
  LinearProgress,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { api } from "../../api/http";
import { useI18n } from "../../i18n";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import DnsIcon from "@mui/icons-material/Dns";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import WarningIcon from "@mui/icons-material/Warning";
import SpeedIcon from "@mui/icons-material/Speed";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import PercentIcon from "@mui/icons-material/Percent";

type Device = {
  id: number;
  deviceName: string;
  ipAddress: string;
  vendor: string;
  model: string;
  snmpVersion: string;
  status: string;
  lastPoll: string | null;
  sysName: string | null;
  sysDescr: string | null;
  sysObjectID: string | null;
  sysUpTime: string | null;
  lastPollError: string | null;
  availability: number;
  healthScore: number;
  responseTime: number | null;
  pollDuration: number | null;
  pollCount: number;
  errorCount: number;
  deviceType?: string | null;
  credentials?: {
    community?: string;
    port?: number;
    timeout?: number;
    retries?: number;
    deviceType?: string;
  } | null;
};

type PollingStatus = {
  enabled: boolean;
  running: boolean;
  intervalMs: number;
  isPolling: boolean;
  lastRunAt: string | null;
  lastResult: {
    startedAt: string;
    finishedAt: string;
    total: number;
    online: number;
    offline: number;
    warning: number;
    unknown: number;
  } | null;
};

export default function MonitoringDashboard() {
  const { t } = useI18n();
  const [devices, setDevices] = useState<Device[]>([]);
  const [pollStatus, setPollStatus] = useState<PollingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [providerFilter, setProviderFilter] = useState("All");
  const [refreshInterval, setRefreshInterval] = useState(30000);

  const fetchData = async () => {
    try {
      const [devResp, statusResp] = await Promise.all([
        api.get<{ success: boolean; devices: Device[] }>("/api/monitoring/devices"),
        api.get<{ success: boolean; status: PollingStatus }>("/api/monitoring/status").catch(() => null)
      ]);

      if (devResp && (devResp as any).success) {
        setDevices((devResp as any).devices || []);
      } else if (Array.isArray(devResp)) {
        setDevices(devResp);
      }

      if (statusResp && (statusResp as any).success) {
        setPollStatus((statusResp as any).status || null);
      }
    } catch (err) {
      console.error("Failed to load monitoring dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  const filteredDevices = devices.filter(d => 
    providerFilter === "All" ? true : (d.provider || "SNMP") === providerFilter
  );

  // Compute status aggregates
  const totalCount = filteredDevices.length;
  const onlineCount = filteredDevices.filter(d => d.status === "ONLINE" || d.state === "running").length;
  const offlineCount = filteredDevices.filter(d => d.status === "OFFLINE" || d.state === "stopped").length;
  const warningCount = filteredDevices.filter(d => d.status === "WARNING").length;
  const unknownCount = filteredDevices.filter(d => d.status === "UNKNOWN").length;

  // Compute average availability & health
  const avgAvailability = totalCount > 0
    ? filteredDevices.reduce((sum, d) => sum + (d.availability ?? 100), 0) / totalCount
    : 100.0;

  const avgHealth = totalCount > 0
    ? filteredDevices.reduce((sum, d) => sum + (d.healthScore ?? 100), 0) / totalCount
    : 100.0;

  const devicesWithLatency = filteredDevices.filter(d => d.responseTime !== null && d.responseTime !== undefined);
  const avgResponseTime = devicesWithLatency.length > 0
    ? devicesWithLatency.reduce((sum, d) => sum + (d.responseTime ?? 0), 0) / devicesWithLatency.length
    : 0;

  // SNMP Success Rate
  const totalPolls = filteredDevices.reduce((sum, d) => sum + d.pollCount, 0);
  const totalErrors = filteredDevices.reduce((sum, d) => sum + d.errorCount, 0);
  const snmpSuccessRate = totalPolls > 0
    ? ((totalPolls - totalErrors) / totalPolls) * 100
    : 100.0;

  // Compute distribution aggregates
  const vendorMap: Record<string, number> = {};
  const typeMap: Record<string, number> = {};

  filteredDevices.forEach(d => {
    const v = d.provider === "AWS" ? "AWS" : (d.vendor?.trim() || "Generic");
    vendorMap[v] = (vendorMap[v] || 0) + 1;

    const t = d.deviceType?.trim() || "Other";
    typeMap[t] = (typeMap[t] || 0) + 1;
  });

  const vendorList = Object.entries(vendorMap).sort((a, b) => b[1] - a[1]);
  const typeList = Object.entries(typeMap).sort((a, b) => b[1] - a[1]);

  // Compute recent errors
  const errorDevices = filteredDevices
    .filter(d => d.lastPollError || d.status === "OFFLINE")
    .sort((a, b) => {
      const aTime = a.lastPoll ? new Date(a.lastPoll).getTime() : 0;
      const bTime = b.lastPoll ? new Date(b.lastPoll).getTime() : 0;
      return bTime - aTime;
    });

  // Recent activity (sorted by last poll time)
  const recentActivity = [...filteredDevices]
    .filter(d => d.lastPoll)
    .sort((a, b) => {
      const aTime = a.lastPoll ? new Date(a.lastPoll).getTime() : 0;
      const bTime = b.lastPoll ? new Date(b.lastPoll).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 8);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONLINE":
        return "#10B981"; // Emerald
      case "OFFLINE":
        return "#EF4444"; // Red
      case "WARNING":
        return "#F59E0B"; // Amber
      default:
        return "#9CA3AF"; // Grey
    }
  };

  return (
    <MainLayout title={t("Monitoring Dashboard")}>
      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 4,
          height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          overflowY: "auto",
          bgcolor: vars.bgApp,
        }}
      >
        {loading && devices.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70%" }}>
            <CircularProgress sx={{ color: vars.accent }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Filters Row */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={providerFilter}
                  onChange={(e) => setProviderFilter(e.target.value)}
                  sx={{
                    color: "#FFF",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#0EA5E9" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0EA5E9" },
                  }}
                >
                  <MenuItem value="All">All Providers</MenuItem>
                  <MenuItem value="SNMP">SNMP</MenuItem>
                  <MenuItem value="AWS">AWS</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(Number(e.target.value))}
                  sx={{
                    color: "#FFF",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#0EA5E9" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#0EA5E9" },
                  }}
                >
                  <MenuItem value={30000}>30s</MenuItem>
                  <MenuItem value={60000}>1m</MenuItem>
                  <MenuItem value={300000}>5m</MenuItem>
                  <MenuItem value={0}>Manual</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Top Stat Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                gap: 2.5,
              }}
            >
              {/* Total Devices */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <AmbientLighting />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Total Devices")}
                    </Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 900, mt: 1, color: vars.text }}>
                      {totalCount}
                    </Typography>
                  </Box>
                  <DnsIcon sx={{ fontSize: 36, color: vars.accent, opacity: 0.8 }} />
                </Box>
              </Card>

              {/* Online Devices */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <AmbientLighting />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Online Devices")}
                    </Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 900, mt: 1, color: "#10B981" }}>
                      {totalCount > 0 ? onlineCount : 0}
                    </Typography>
                  </Box>
                  <CheckCircleIcon sx={{ fontSize: 36, color: "#10B981", opacity: 0.8 }} />
                </Box>
              </Card>

              {/* Offline Devices */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <AmbientLighting />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Offline Devices")}
                    </Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 900, mt: 1, color: "#EF4444" }}>
                      {totalCount > 0 ? offlineCount : 0}
                    </Typography>
                  </Box>
                  <CancelIcon sx={{ fontSize: 36, color: "#EF4444", opacity: 0.8 }} />
                </Box>
              </Card>

              {/* Warning/Critical */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <AmbientLighting />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Warning / Unknown")}
                    </Typography>
                    <Typography sx={{ fontSize: 32, fontWeight: 900, mt: 1, color: "#F59E0B" }}>
                      {warningCount} / {unknownCount}
                    </Typography>
                  </Box>
                  <WarningIcon sx={{ fontSize: 36, color: "#F59E0B", opacity: 0.8 }} />
                </Box>
              </Card>
            </Box>

            {/* AWS Specific Widgets */}
            {(providerFilter === "AWS" || providerFilter === "All") && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                  gap: 2.5,
                }}
              >
                <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                  <AmbientLighting />
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Running EC2")}
                    </Typography>
                    <Typography sx={{ fontSize: 24, fontWeight: 900, mt: 1, color: "#10B981" }}>
                      {filteredDevices.filter(d => d.provider === "AWS" && (d.state === "running" || d.status === "ONLINE")).length}
                    </Typography>
                  </Box>
                </Card>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                  <AmbientLighting />
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Stopped EC2")}
                    </Typography>
                    <Typography sx={{ fontSize: 24, fontWeight: 900, mt: 1, color: "#EF4444" }}>
                      {filteredDevices.filter(d => d.provider === "AWS" && (d.state === "stopped" || d.state === "terminated" || d.status === "OFFLINE")).length}
                    </Typography>
                  </Box>
                </Card>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                  <AmbientLighting />
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Top CPU (Placeholder)")}
                    </Typography>
                    <Typography sx={{ fontSize: 24, fontWeight: 900, mt: 1, color: "#F59E0B" }}>
                      -
                    </Typography>
                  </Box>
                </Card>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                  <AmbientLighting />
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Top Network (Placeholder)")}
                    </Typography>
                    <Typography sx={{ fontSize: 24, fontWeight: 900, mt: 1, color: "#0EA5E9" }}>
                      -
                    </Typography>
                  </Box>
                </Card>
              </Box>
            )}

            {/* Performance Stat Grid */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                gap: 2.5,
              }}
            >
              {/* Avg Availability */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <AmbientLighting />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Average Availability")}
                    </Typography>
                    <Typography sx={{ fontSize: 30, fontWeight: 900, mt: 1, color: "#10B981" }}>
                      {avgAvailability.toFixed(2)}%
                    </Typography>
                  </Box>
                  <PercentIcon sx={{ fontSize: 36, color: "#10B981", opacity: 0.8 }} />
                </Box>
              </Card>

              {/* Avg Health */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <AmbientLighting />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Average Health Score")}
                    </Typography>
                    <Typography sx={{ fontSize: 30, fontWeight: 900, mt: 1, color: avgHealth > 75 ? "#10B981" : avgHealth > 40 ? "#F59E0B" : "#EF4444" }}>
                      {avgHealth.toFixed(0)}%
                    </Typography>
                  </Box>
                  <FavoriteIcon sx={{ fontSize: 36, color: "#EF4444", opacity: 0.8 }} />
                </Box>
              </Card>

              {/* Avg Latency */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <AmbientLighting />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("Avg Response Time")}
                    </Typography>
                    <Typography sx={{ fontSize: 30, fontWeight: 900, mt: 1, color: "#0EA5E9" }}>
                      {avgResponseTime.toFixed(0)} ms
                    </Typography>
                  </Box>
                  <SpeedIcon sx={{ fontSize: 36, color: "#0EA5E9", opacity: 0.8 }} />
                </Box>
              </Card>

              {/* SNMP Success Rate */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <AmbientLighting />
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {t("SNMP Success Rate")}
                    </Typography>
                    <Typography sx={{ fontSize: 30, fontWeight: 900, mt: 1, color: "#10B981" }}>
                      {snmpSuccessRate.toFixed(2)}%
                    </Typography>
                  </Box>
                  <ToggleOnIcon sx={{ fontSize: 36, color: "#10B981", opacity: 0.8 }} />
                </Box>
              </Card>
            </Box>

            {/* Polling Engine Stats Row */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
              <AmbientLighting />
              <Typography sx={{ fontSize: 13, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
                {t("Polling Engine Status")}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                  gap: 3,
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Engine State")}</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, mt: 0.5, color: pollStatus?.running ? "#10B981" : "#EF4444" }}>
                    {pollStatus ? (pollStatus.running ? t("ACTIVE") : t("INACTIVE")) : t("No Data Available")}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Poll Interval")}</Typography>
                  <Typography sx={{ fontSize: 15, fontWeight: 800, mt: 0.5, color: vars.text }}>
                    {pollStatus?.intervalMs ? `${pollStatus.intervalMs / 1000}s` : t("No Data Available")}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Last Poll Cycle")}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, mt: 0.5, color: vars.text }}>
                    {pollStatus?.lastRunAt ? new Date(pollStatus.lastRunAt).toLocaleString("en-IN") : t("No Data Available")}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Last Successful Poll")}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, mt: 0.5, color: vars.text }}>
                    {pollStatus?.lastResult?.finishedAt ? new Date(pollStatus.lastResult.finishedAt).toLocaleString("en-IN") : t("No Data Available")}
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Widgets Section */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              {/* Recent Activity */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5, minHeight: 360 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
                  {t("Recent Device Activity")}
                </Typography>
                {recentActivity.length === 0 ? (
                  <Box sx={{ display: "flex", height: 240, alignItems: "center", justifyContent: "center", color: vars.textDim, fontSize: 13 }}>
                    {t("No Data Available")}
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 300, overflowY: "auto", pr: 0.5 }}>
                    {recentActivity.map(d => (
                      <Box key={d.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1.25, borderRadius: 1, border: "1px solid rgba(255,255,255,0.06)", bgcolor: "rgba(255,255,255,0.02)" }}>
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.text }}>{d.deviceName}</Typography>
                          <Typography sx={{ fontSize: 11, color: vars.textDim, mt: 0.25 }}>
                            {d.ipAddress} • {d.vendor || "Generic"}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 800, px: 1, py: 0.25, borderRadius: 0.5, display: "inline-block", color: getStatusColor(d.status), border: `1px solid ${getStatusColor(d.status)}`, textTransform: "uppercase" }}>
                            {d.status}
                          </Typography>
                          <Typography sx={{ fontSize: 10, color: vars.textWeak, mt: 0.5 }}>
                            {d.lastPoll ? new Date(d.lastPoll).toLocaleTimeString("en-IN") : ""}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>

              {/* Recent Poller Errors */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5, minHeight: 360 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 900, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
                  {t("Active Diagnostic Logs & Errors")}
                </Typography>
                {errorDevices.length === 0 ? (
                  <Box sx={{ display: "flex", height: 240, alignItems: "center", justifyContent: "center", color: "#10B981", fontSize: 13, fontWeight: 600 }}>
                    ✓ {t("All systems operating normally")}
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 300, overflowY: "auto", pr: 0.5 }}>
                    {errorDevices.map(d => (
                      <Box key={d.id} sx={{ p: 1.25, borderRadius: 1, border: "1px solid rgba(239,68,68,0.15)", bgcolor: "rgba(239,68,68,0.02)" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                          <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.text }}>{d.deviceName}</Typography>
                          <Typography sx={{ fontSize: 11, color: "#EF4444", fontWeight: 700 }}>
                            {d.ipAddress}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11.5, color: "#FCA5A5", fontFamily: "monospace" }}>
                          {d.lastPollError || "Device marked offline / Ping failure"}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Card>
            </Box>

            {/* Distribution metrics */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              {/* Vendor Dist */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
                  {t("Vendor Distribution")}
                </Typography>
                {vendorList.length === 0 ? (
                  <Typography sx={{ color: vars.textDim, fontSize: 12 }}>{t("No Data Available")}</Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {vendorList.map(([vendor, count]) => {
                      const percent = totalCount > 0 ? (count / totalCount) * 100 : 0;
                      return (
                        <Box key={vendor}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: vars.text }}>{vendor}</Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: vars.textWeak }}>
                              {count} ({percent.toFixed(0)}%)
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.06)", "& .MuiLinearProgress-bar": { bgcolor: vars.accent } }} />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Card>

              {/* Device Type Dist */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.08em", mb: 2 }}>
                  {t("Device Type Distribution")}
                </Typography>
                {typeList.length === 0 ? (
                  <Typography sx={{ color: vars.textDim, fontSize: 12 }}>{t("No Data Available")}</Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {typeList.map(([type, count]) => {
                      const percent = totalCount > 0 ? (count / totalCount) * 100 : 0;
                      return (
                        <Box key={type}>
                          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography sx={{ fontSize: 12, fontWeight: 700, color: vars.text }}>{type}</Typography>
                            <Typography sx={{ fontSize: 12, fontWeight: 800, color: vars.textWeak }}>
                              {count} ({percent.toFixed(0)}%)
                            </Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={percent} sx={{ height: 6, borderRadius: 3, bgcolor: "rgba(255,255,255,0.06)", "& .MuiLinearProgress-bar": { bgcolor: "#10B981" } }} />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Card>
            </Box>
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
