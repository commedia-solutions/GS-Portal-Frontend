// src/pages/Monitoring/DeviceDetails.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Tabs,
  Tab,
  Divider,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  LinearProgress,
  Skeleton,
  TablePagination,
} from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useParams, Link, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import DataObjectIcon from "@mui/icons-material/DataObject";
import SearchIcon from "@mui/icons-material/Search";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import MonitoringDashboard from "../../components/monitoring/MonitoringDashboard";
import { api } from "../../api/http";
import { useI18n } from "../../i18n";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import toast from "react-hot-toast";

type Device = {
  id: number;
  deviceName: string;
  hostname: string | null;
  ipAddress: string;
  macAddress: string | null;
  vendor: string | null;
  model: string | null;
  serialNumber: string | null;
  firmware: string | null;
  osVersion: string | null;
  deviceType: string | null;
  site: string | null;
  rack: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  snmpVersion: string;
  status: string;
  lastPoll: string | null;
  lastSuccessfulPoll: string | null;
  lastFailedPoll: string | null;
  availability: number;
  healthScore: number;
  responseTime: number | null;
  pollDuration: number | null;
  pollCount: number;
  errorCount: number;
  profileId: number | null;
  lifecycleState: string;
  sysName: string | null;
  sysDescr: string | null;
  sysObjectID: string | null;
  sysUpTime: string | null;
  lastPollError: string | null;
  credentials?: {
    community?: string;
    username?: string;
    securityLevel?: string;
    authProtocol?: string;
    privProtocol?: string;
    port?: number;
    timeout?: number;
    retries?: number;
    contextName?: string;
    contextEngineId?: string;
    engineId?: string;
  } | null;
  cpuUtil?: number | null;
  memUtil?: number | null;
  cpuCores?: number | null;
  totalRam?: number | null;
  bootTime?: string | null;
  // AWS Fields
  provider?: string;
  resourceType?: string;
  instanceId?: string;
  instanceName?: string;
  privateIp?: string;
  publicIp?: string;
  state?: string;
  instanceType?: string;
  region?: string;
  availabilityZone?: string;
  cloudMetadata?: any;
};

type TelemetryItem = {
  metricName: string;
  oid: string;
  rawValue: string;
  convertedValue: number | null;
  unit: string | null;
  timestamp: string;
  source?: string;
  category?: string;
};

type DeviceInterface = {
  id: number;
  interfaceIndex: number | null;
  interfaceName: string;
  alias: string | null;
  description: string | null;
  type: string | null;
  mac: string | null;
  mtu: number | null;
  adminStatus: string;
  operStatus: string;
  speed: string | null;
  duplex: string | null;
  inputTraffic: number;
  outputTraffic: number;
  hcInOctets: number | null;
  hcOutOctets: number | null;
  errors: number;
  inErrors: number;
  outErrors: number;
  inDiscards: number;
  outDiscards: number;
  crcErrors: number;
  bandwidthUtilization: number | null;
  rxRate: number | null;
  txRate: number | null;
  lastChange: string | null;
  lastUpdated?: string;
};

type DeviceHardware = {
  id: number;
  componentName: string;
  componentType: string | null;
  serialNumber: string | null;
  firmwareVersion: string | null;
  modelName: string | null;
  lastUpdated?: string;
};

type DeviceSensor = {
  id: number;
  sensorName: string;
  sensorType: string;
  sensorValue: number;
  unit: string | null;
  status: string;
  lastUpdated?: string;
};

const ctrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "32px",
    fontSize: 12.5,
    color: "#FFF",
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderRadius: "9px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
    "&:hover fieldset": { borderColor: "#0EA5E9" },
    "&.Mui-focused fieldset": { borderColor: "#0EA5E9", borderWidth: 1 },
  },
  "& .MuiInputBase-input": { padding: "0 10px", fontSize: 12.5, color: "#FFF" },
  "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.4)", opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: 16, color: "rgba(255,255,255,0.5)" },
};

export default function DeviceDetailsPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  // Tab dynamic data
  const [telemetry, setTelemetry] = useState<TelemetryItem[]>([]);
  const [interfaces, setInterfaces] = useState<DeviceInterface[]>([]);
  const [hardware, setHardware] = useState<DeviceHardware[]>([]);
  const [sensors, setSensors] = useState<DeviceSensor[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyRange, setHistoryRange] = useState("1H");

  // Live parameter filters & sorting
  const [paramCategory, setParamCategory] = useState("All");
  const [paramSearch, setParamSearch] = useState("");
  const [paramSort, setParamSort] = useState("name_asc");

  // Interface filters
  const [interfaceSearch, setInterfaceSearch] = useState("");
  const [interfaceStatusFilter, setInterfaceStatusFilter] = useState("all");

  // Hardware filters & pagination
  const [hardwareSearch, setHardwareSearch] = useState("");
  const [hardwareTypeFilter, setHardwareTypeFilter] = useState("all");
  const [hardwarePage, setHardwarePage] = useState(0);
  const [hardwareRowsPerPage, setHardwareRowsPerPage] = useState(10);

  // Custom OID Explorer parameters
  const [explorerOid, setExplorerOid] = useState("");
  const [explorerOp, setExplorerOp] = useState("get");
  const [explorerResult, setExplorerResult] = useState<{
    success: boolean;
    output?: string;
    values?: Record<string, string>;
    oid?: string;
    value?: string;
    error?: string;
  } | null>(null);
  const [explorerDuration, setExplorerDuration] = useState<number | null>(null);
  const [queryingOid, setQueryingOid] = useState(false);
  const [nonRepeaters, setNonRepeaters] = useState(0);
  const [maxRepetitions, setMaxRepetitions] = useState(20);

  const loadData = useCallback(async (isSilentRefresh = false) => {
    if (!id) return;
    
    // Only set loading spinners if not doing a silent background refresh
    if (!isSilentRefresh) {
      if (!device) setLoading(true); // Full page load
      setTabLoading(true); // Tab data load
    }

    try {
      const promises: Promise<any>[] = [];

      // Always fetch device on initial load or silent refresh
      promises.push(api.get<{ success: boolean; device: Device }>(`/api/monitoring/devices/${id}`));

      // Conditionally push tab data fetches
      if (activeTab === 2 || activeTab === 4) {
        promises.push(api.get<{ success: boolean; telemetry: TelemetryItem[] }>(`/api/monitoring/devices/${id}/telemetry/current`));
      } else if (activeTab === 3) {
        promises.push(api.get<{ success: boolean; interfaces: DeviceInterface[] }>(`/api/monitoring/devices/${id}/interfaces`));
      } else if (activeTab === 5) {
        promises.push(api.get<{ success: boolean; hardware: DeviceHardware[] }>(`/api/monitoring/devices/${id}/hardware`));
        promises.push(api.get<{ success: boolean; sensors: DeviceSensor[] }>(`/api/monitoring/devices/${id}/sensors`));
      }

      // Execute all API requests concurrently
      const results = await Promise.all(promises);

      // 1. Process Device
      const devRes = results[0];
      if (devRes && devRes.success) {
        setDevice(devRes.device || null);
      } else if (!device) {
        toast.error(t("Device not found"));
        navigate("/monitoring/devices");
        return;
      }

      // 2. Process Tabs
      if (activeTab === 2 || activeTab === 4) {
        const telRes = results[1];
        if (telRes?.success) setTelemetry(telRes.telemetry || []);
      } else if (activeTab === 3) {
        const intRes = results[1];
        if (intRes?.success) setInterfaces(intRes.interfaces || []);
      } else if (activeTab === 5) {
        const hwRes = results[1];
        const sensRes = results[2];
        if (hwRes?.success) setHardware(hwRes.hardware || []);
        if (sensRes?.success) setSensors(sensRes.sensors || []);
      }
    } catch (err) {
      console.error("Failed to load device data:", err);
      if (!isSilentRefresh) toast.error(t("Error loading device details"));
    } finally {
      setLoading(false);
      setTabLoading(false);
    }
  }, [id, activeTab, device, navigate, t]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeTab]); // Only depend on id and activeTab changes

  useEffect(() => {
    if (device?.provider === "AWS" && activeTab === 5) {
      const now = new Date();
      let startTime = new Date();
      let interval = 60; // default 1m
      if (historyRange === "1H") {
        startTime.setHours(now.getHours() - 1);
        interval = 60; // 1m
      } else if (historyRange === "3H") {
        startTime.setHours(now.getHours() - 3);
        interval = 300; // 5m
      } else if (historyRange === "12H") {
        startTime.setHours(now.getHours() - 12);
        interval = 300; // 5m
      } else if (historyRange === "1D") {
        startTime.setDate(now.getDate() - 1);
        interval = 3600; // 1h
      } else if (historyRange === "1W") {
        startTime.setDate(now.getDate() - 7);
        interval = 86400; // 1d
      }

      api.get<any>(`/api/monitoring/devices/${id}/telemetry-history?startTime=${startTime.toISOString()}&endTime=${now.toISOString()}&interval=${interval}`)
        .then(res => setHistoryData(res.data || res.history || []))
        .catch(err => console.error(err));
      
      api.get<any>(`/api/monitoring/devices/${id}/telemetry/current`)
        .then(res => setTelemetry(res.telemetry || []))
        .catch(err => console.error(err));
    }
  }, [id, activeTab, device?.provider, historyRange]);

  // Auto Background Refresh every 5 seconds to pick up latest backend polling
  useEffect(() => {
    const timer = setInterval(() => {
      if (!polling && !tabLoading) {
        loadData(true);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [loadData, polling, tabLoading]);

  const handlePollNow = async () => {
    if (!device) return;
    try {
      setPolling(true);
      toast.loading(t("Polling SNMP device..."), { id: "poll-now" });
      const res = await api.post<any>("/api/monitoring/devices/bulk-poll", { ids: [device.id] });
      if (res && res.success) {
        toast.success(t("Device metrics polled successfully!"), { id: "poll-now" });
        // Silent refresh of data without triggering full page loaders
        await loadData(true);
      } else {
        toast.error(t("Polling command failed"), { id: "poll-now" });
      }
    } catch (err) {
      console.error(err);
      toast.error(t("Failed to poll device"), { id: "poll-now" });
    } finally {
      setPolling(false);
    }
  };

  const handleExecuteExplorer = async () => {
    if (!explorerOid) {
      toast.error(t("Please enter a target OID"));
      return;
    }
    setQueryingOid(true);
    setExplorerResult(null);
    setExplorerDuration(null);
    try {
      const payload: any = { oid: explorerOid, operation: explorerOp };
      if (explorerOp === "getbulk") {
        payload.nonRepeaters = nonRepeaters;
        payload.maxRepetitions = maxRepetitions;
      }
      const response = await api.post<{ success: boolean; result: any; duration: number }>(
        `/api/monitoring/devices/${id}/query-oid`,
        payload
      );
      if (response.success) {
        setExplorerResult(response.result);
        setExplorerDuration(response.duration);
        if (response.result.success) {
          toast.success(t("SNMP Query Successful"));
        } else {
          toast.error(t("SNMP Query returned error"));
        }
      } else {
        toast.error(t("Failed to execute query"));
      }
    } catch (err: any) {
      toast.error(err.message || t("SNMP query error"));
    } finally {
      setQueryingOid(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(t("Copied to clipboard"));
  };

  const handleExportCSV = () => {
    if (filteredTelemetry.length === 0) return toast.error(t("No data to export"));
    const header = ["Parameter", "OID", "Value", "Unit", "Source", "Last Updated"].join(",");
    const rows = filteredTelemetry.map(i => [
      `"${i.metricName}"`, `"${i.oid}"`, `"${i.convertedValue !== null ? i.convertedValue : i.rawValue || ""}"`, `"${i.unit || ""}"`, `"${i.source || ""}"`, `"${new Date(i.timestamp).toISOString()}"`
    ].join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry-${device?.ipAddress || "device"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    if (filteredTelemetry.length === 0) return toast.error(t("No data to export"));
    const blob = new Blob([JSON.stringify(filteredTelemetry, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `telemetry-${device?.ipAddress || "device"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Categorize, Filter, and Sort live parameters
  const filteredTelemetry = useMemo(() => {
    const matched = telemetry.filter((tItem) => {
      const name = (tItem.metricName || "").toLowerCase();
      const oid = (tItem.oid || "").toLowerCase();
      const query = paramSearch.toLowerCase();

      const matchSearch = name.includes(query) || oid.includes(query);
      if (!matchSearch) return false;

      if (paramCategory === "All") return true;
      if (paramCategory === "Identity" && ["sysname", "sysdescr", "sysobjectid"].includes(name)) return true;
      if (paramCategory === "Performance" && ["cpu_util", "mem_util", "latency", "response_time", "uptime"].includes(name)) return true;
      if (paramCategory === "Environment" && ["temperature", "voltage", "power"].includes(name)) return true;
      if (paramCategory === "Interfaces" && ["input_traffic", "output_traffic", "errors", "speed"].includes(name)) return true;
      if (paramCategory === "System" && ["uptime", "sysname", "sysdescr"].includes(name)) return true;

      return false;
    });

    return [...matched].sort((a, b) => {
      if (paramSort === "name_asc") return a.metricName.localeCompare(b.metricName);
      if (paramSort === "name_desc") return b.metricName.localeCompare(a.metricName);
      if (paramSort === "oid_asc") return a.oid.localeCompare(b.oid);
      return 0;
    });
  }, [telemetry, paramCategory, paramSearch, paramSort]);

  const filteredInterfaces = useMemo(() => {
    let result = interfaces;
    if (interfaceSearch) {
      const s = interfaceSearch.toLowerCase();
      result = result.filter(i => 
        i.interfaceName.toLowerCase().includes(s) || 
        (i.alias && i.alias.toLowerCase().includes(s)) ||
        (i.mac && i.mac.toLowerCase().includes(s))
      );
    }
    if (interfaceStatusFilter !== "all") {
      result = result.filter(i => i.operStatus.toLowerCase() === interfaceStatusFilter);
    }
    return result;
  }, [interfaces, interfaceSearch, interfaceStatusFilter]);

  const hardwareTypes = useMemo(() => {
    const types = new Set<string>();
    hardware.forEach(hw => {
      if (hw.componentType && hw.componentType.trim() !== "") {
        types.add(hw.componentType);
      }
    });
    return Array.from(types).sort();
  }, [hardware]);

  const filteredHardware = useMemo(() => {
    let result = hardware;
    if (hardwareTypeFilter !== "all") {
      result = result.filter(hw => hw.componentType === hardwareTypeFilter);
    }
    if (hardwareSearch) {
      const s = hardwareSearch.toLowerCase();
      result = result.filter(hw => 
        (hw.componentName && hw.componentName.toLowerCase().includes(s)) ||
        (hw.componentType && hw.componentType.toLowerCase().includes(s)) ||
        (hw.modelName && hw.modelName.toLowerCase().includes(s)) ||
        (hw.serialNumber && hw.serialNumber.toLowerCase().includes(s)) ||
        (hw.firmwareVersion && hw.firmwareVersion.toLowerCase().includes(s))
      );
    }
    return result;
  }, [hardware, hardwareSearch, hardwareTypeFilter]);

  const paginatedHardware = useMemo(() => {
    const startIndex = hardwarePage * hardwareRowsPerPage;
    return filteredHardware.slice(startIndex, startIndex + hardwareRowsPerPage);
  }, [filteredHardware, hardwarePage, hardwareRowsPerPage]);

  const formatHardwareValue = (val: any) => {
    if (val === null || val === undefined || val === "") return "-";
    if (typeof val === "object") {
      try {
        return JSON.stringify(val);
      } catch {
        return "-";
      }
    }
    return String(val);
  };

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };

  if (loading && !device) {
    return (
      <MainLayout>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70vh" }}>
          <CircularProgress color="primary" />
        </Box>
      </MainLayout>
    );
  }

  if (!device) return null;

  const headerBorderColor = device.status === "ONLINE" ? "#10B981" : device.status === "WARNING" ? "#F59E0B" : "#EF4444";

  return (
    <MainLayout title={`${device.deviceName} ${t("Details")}`}>
      <AmbientLighting />
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
        {/* Toolbar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Button
            variant="text"
            component={Link}
            to="/monitoring/devices"
            startIcon={<ArrowBackIcon />}
            sx={{ color: vars.textDim, textTransform: "none", fontSize: 13 }}
          >
            {t("Back to Devices")}
          </Button>

          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handlePollNow}
              disabled={polling}
              startIcon={polling ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon />}
              sx={{
                backgroundColor: "#0EA5E9",
                color: "#FFF",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#0284C7" },
              }}
            >
              {t("Poll Now")}
            </Button>
          </Box>
        </Box>

        {/* Status Header Card */}
        <Card
          sx={{
            ...PREMIUM_CARD_SX,
            p: 2.5,
            mb: 3,
            borderLeft: `5px solid ${headerBorderColor}`,
            backgroundColor: "rgba(17,25,40,0.7)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: "#FFF" }}>
                {device.deviceName}
              </Typography>
              <Typography sx={{ fontSize: 12, color: vars.textDim, mt: 0.5 }}>
                {device.ipAddress} • {device.vendor || "Generic"} {device.model ? `(${device.model})` : ""}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 4, pr: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 10, color: vars.textWeak, textTransform: "uppercase" }}>{t("Availability")}</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 900, color: (device.provider !== "SNMP" && device.provider !== "AWS") ? "#94A3B8" : "#10B981" }}>
                  {(device.provider !== "SNMP" && device.provider !== "AWS") ? "-" : (device.availability ? `${device.availability.toFixed(1)}%` : "100.0%")}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 10, color: vars.textWeak, textTransform: "uppercase" }}>{t("Health Score")}</Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 900, color: (device.provider !== "SNMP" && device.provider !== "AWS") ? "#94A3B8" : (device.healthScore > 80 ? "#34D399" : "#F59E0B") }}>
                  {(device.provider !== "SNMP" && device.provider !== "AWS") ? "-" : `${device.healthScore}%`}
                </Typography>
              </Box>
              {device.provider === "AWS" ? (
                <>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: vars.textWeak, textTransform: "uppercase" }}>{t("Instance State")}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 900, color: device.state === 'running' ? '#10B981' : '#F59E0B' }}>
                      {device.state ? device.state.toUpperCase() : '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: vars.textWeak, textTransform: "uppercase" }}>{t("Region")}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0EA5E9" }}>
                      {device.region || '-'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: vars.textWeak, textTransform: "uppercase" }}>{t("Instance Type")}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#94A3B8" }}>
                      {device.instanceType || '-'}
                    </Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: vars.textWeak, textTransform: "uppercase" }}>{t("Response Time")}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 900, color: device.provider !== "SNMP" ? "#94A3B8" : "#0EA5E9" }}>
                      {device.provider !== "SNMP" ? "-" : (device.responseTime !== null ? `${device.responseTime} ms` : "N/A")}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10, color: vars.textWeak, textTransform: "uppercase" }}>{t("Status")}</Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 900, color: headerBorderColor }}>
                      {device.status}
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Card>

        {/* Tabs Bar */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            mb: 3,
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            "& .MuiTab-root": { color: "rgba(255,255,255,0.6)", textTransform: "none", fontSize: 13 },
            "& .MuiTab-root.Mui-selected": { color: "#0EA5E9", fontWeight: 700 },
            "& .MuiTabs-indicator": { backgroundColor: "#0EA5E9" },
          }}
        >
          {device.provider === "AWS" ? [
            <Tab key="gen" label={t("General")} />,
            <Tab key="net" label={t("Networking")} />,
            <Tab key="comp" label={t("Compute")} />,
            <Tab key="stor" label={t("Storage")} />,
            <Tab key="sec" label={t("Security")} />,
            <Tab key="mon" label={t("Monitoring")} />,
            <Tab key="tags" label={t("Tags")} />
          ] : [
            <Tab key="ov" label={t("Overview")} />,
            <Tab key="snmp" label={t("SNMP Config")} />,
            <Tab key="live" label={t("Live Parameters")} />,
            <Tab key="intf" label={t("Interfaces")} />,
            <Tab key="perf" label={t("Performance")} />,
            <Tab key="hw" label={t("Hardware")} />,
            <Tab key="hist" label={t("History Logs")} />,
            <Tab key="oid" label={t("OID Explorer")} />
          ]}
        </Tabs>

        {/* Tab contents */}
        {tabLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            <Skeleton variant="rounded" height={200} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
            <Skeleton variant="rounded" height={400} sx={{ bgcolor: "rgba(255,255,255,0.05)" }} />
          </Box>
        ) : (
          <>
            {device.provider === "AWS" ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {activeTab === 0 && (
                  <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>{t("General Information")}</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Instance Name")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.instanceName || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Instance ID")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#60A5FA", fontFamily: "monospace" }}>{device.instanceId || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Region")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.region || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Availability Zone")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.availabilityZone || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Platform")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.Platform || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Architecture")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.Architecture || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Launch Time")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.LaunchTime ? new Date(device.cloudMetadata.LaunchTime).toLocaleString() : "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("AMI ID")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.ImageId || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Key Pair")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.KeyName || "-"}</Typography>
                      </Box>
                    </Box>
                  </Card>
                )}

                {activeTab === 1 && (
                  <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>{t("Networking")}</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Private IP")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>{device.privateIp || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Public IP")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>{device.publicIp || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("VPC ID")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.VpcId || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Subnet ID")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.SubnetId || "-"}</Typography>
                      </Box>
                    </Box>
                  </Card>
                )}

                {activeTab === 2 && (
                  <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>{t("Compute")}</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Instance Type")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.instanceType || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Virtualization Type")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.VirtualizationType || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Tenancy")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.Placement?.Tenancy || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Monitoring Mode")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.Monitoring?.State || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Core Count")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.CpuOptions?.CoreCount || "-"}</Typography>
                      </Box>
                    </Box>
                  </Card>
                )}

                {activeTab === 3 && (
                  <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>{t("Storage")}</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("EBS Optimized")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.EbsOptimized ? "Yes" : "No"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Root Device Name")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.RootDeviceName || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Root Device Type")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.RootDeviceType || "-"}</Typography>
                      </Box>
                      {device.cloudMetadata?.BlockDeviceMappings?.map((mapping: any, idx: number) => (
                        <Box key={idx} sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 1 }}>
                          <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Block Device")}: {mapping.DeviceName}</Typography>
                          <Typography sx={{ fontSize: 11.5, color: "#FFF" }}>
                            Volume ID: {mapping.Ebs?.VolumeId || "-"} <br/>
                            Status: {mapping.Ebs?.Status || "-"} <br/>
                            Delete on Termination: {mapping.Ebs?.DeleteOnTermination ? "Yes" : "No"}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Card>
                )}

                {activeTab === 4 && (
                  <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>{t("Security")}</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("IAM Role")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.cloudMetadata?.IamInstanceProfile?.Arn?.split('/').pop() || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("IAM ARN")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>{device.cloudMetadata?.IamInstanceProfile?.Arn || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Security Groups")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF", whiteSpace: "pre-wrap" }}>
                          {device.cloudMetadata?.SecurityGroups?.map((sg: any) => `${sg.GroupName} (${sg.GroupId})`).join("\n") || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                )}

                {activeTab === 5 && (
                  <MonitoringDashboard deviceId={Number(id)} provider={device.provider} />
                )}

                {activeTab === 6 && (
                  <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>{t("Tags")}</Typography>
                    {device.cloudMetadata?.Tags && device.cloudMetadata.Tags.length > 0 ? (
                      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 3.5 }}>
                        {device.cloudMetadata.Tags.map((tag: any, idx: number) => (
                          <Box key={idx}>
                            <Typography sx={{ fontSize: 11, color: vars.textDim }}>{tag.Key}</Typography>
                            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#FFF", mt: 0.5, wordBreak: "break-all" }}>
                              {tag.Value}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography sx={{ fontSize: 12.5, color: vars.textWeak }}>{t("No tags found.")}</Typography>
                    )}
                  </Card>
                )}
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {activeTab === 0 && (
                  <>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 3 }}>
              {/* System Attributes */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>
                  {t("System Attributes & Uptime")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("System Name")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontWeight: 700 }}>{device.sysName || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("System Uptime")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontWeight: 700 }}>{device.sysUpTime || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("System Object ID")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>{device.sysObjectID || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Boot Time")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.bootTime || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("System Description")}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", whiteSpace: "pre-wrap" }}>
                      {device.sysDescr || "-"}
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {/* Asset Registry */}
              <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>
                  {t("Asset Registry & Details")}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Hostname")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.hostname || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Device Type")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.deviceType || t("Other")}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Vendor")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.vendor || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Model")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.model || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("MAC Address")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>{device.macAddress || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Serial Number")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>{device.serialNumber || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Firmware Version")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.firmware || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("OS Version")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.osVersion || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Site / Rack / Location")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>
                      {[device.site, device.rack, device.location].filter(Boolean).join(" / ") || "-"}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>

            {/* Hardware Telemetry Row */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>
                {t("Core Resources")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("CPU Utilization")}</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#FFF", mt: 0.5 }}>
                    {device.cpuUtil !== null && device.cpuUtil !== undefined ? `${device.cpuUtil.toFixed(1)}%` : "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Memory Utilization")}</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#0EA5E9", mt: 0.5 }}>
                    {device.memUtil !== null && device.memUtil !== undefined ? `${device.memUtil.toFixed(1)}%` : "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("CPU Cores")}</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#34D399", mt: 0.5 }}>
                    {device.cpuCores !== null && device.cpuCores !== undefined ? device.cpuCores : "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Total RAM")}</Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 900, color: "#F59E0B", mt: 0.5 }}>
                    {device.totalRam !== null && device.totalRam !== undefined ? `${(device.totalRam / 1024 / 1024).toFixed(1)} GB` : "-"}
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Diagnostic Metrics Row */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>
                {t("Diagnostics & Polling Statistics")}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 3.5 }}>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Collection Mode")}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#34D399", mt: 0.5 }}>
                    {t("SNMP Direct Polling")}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Data Probe")}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0EA5E9", mt: 0.5 }}>
                    {t("GS Portal Local Node")}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Last Poll")}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#FFF", mt: 0.5 }}>
                    {device.lastPoll ? new Date(device.lastPoll).toLocaleString("en-IN") : "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Avg Poll Cycle")}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#0EA5E9", mt: 0.5 }}>
                    {device.pollDuration !== null ? `${device.pollDuration} ms` : "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Last Successful Poll")}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#34D399", mt: 0.5 }}>
                    {device.lastSuccessfulPoll ? new Date(device.lastSuccessfulPoll).toLocaleString("en-IN") : "-"}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Last Failed Poll")}</Typography>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "#F87171", mt: 0.5 }}>
                    {device.lastFailedPoll ? new Date(device.lastFailedPoll).toLocaleString("en-IN") : "-"}
                  </Typography>
                </Box>
                <Box sx={{ gridColumn: { xs: "span 2", md: "span 4" } }}>
                  <Typography sx={{ fontSize: 11, color: vars.textDim }}>{t("Last Polling Error")}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: device.lastPollError ? "#EF4444" : "#10B981", mt: 0.5, backgroundColor: "rgba(255,255,255,0.02)", p: 1, borderRadius: 1, border: "1px solid rgba(255,255,255,0.05)", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
                    {device.lastPollError || t("No recent polling errors. Device is operating normally.")}
                  </Typography>
                </Box>
              </Box>
            </Card>
                  </>
                )}

                {activeTab === 1 && (
          <Card sx={{ ...PREMIUM_CARD_SX, p: 3, maxWidth: 600, backgroundColor: "rgba(17,25,40,0.6)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>
              {t("SNMP Properties Configuration")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("SNMP Version")}</Typography>
                <Typography sx={{ fontSize: 12.5, color: "#FFF", fontWeight: 700 }}>{device.snmpVersion}</Typography>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Target Port")}</Typography>
                <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.credentials?.port || 161}</Typography>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Request Timeout")}</Typography>
                <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.credentials?.timeout || 2500} ms</Typography>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Retries Limit")}</Typography>
                <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.credentials?.retries || 1}</Typography>
              </Box>

              {device.snmpVersion === "v3" ? (
                <>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Security Username")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.credentials?.username || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Security Level")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontWeight: 700 }}>{device.credentials?.securityLevel || "-"}</Typography>
                  </Box>
                  {["authNoPriv", "authPriv"].includes(device.credentials?.securityLevel || "") && (
                    <>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Auth Protocol")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.credentials?.authProtocol || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Auth Password")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>********</Typography>
                      </Box>
                    </>
                  )}
                  {device.credentials?.securityLevel === "authPriv" && (
                    <>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Privacy Protocol")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.credentials?.privProtocol || "-"}</Typography>
                      </Box>
                      <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Privacy Password")}</Typography>
                        <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>********</Typography>
                      </Box>
                    </>
                  )}
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Context Name")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.credentials?.contextName || "-"}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Context Engine ID")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{device.credentials?.contextEngineId || "-"}</Typography>
                  </Box>
                </>
              ) : (
                <>
                  <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 12.5, color: vars.textDim }}>{t("Read Community String")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontFamily: "monospace" }}>********</Typography>
                  </Box>
                </>
              )}
            </Box>
          </Card>
        )}

        {activeTab === 2 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
            {/* Live Parameters Component */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent }}>
                  {t("Live Parameters feeds")}
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <TextField
                    placeholder={t("Search by OID/name...")}
                    size="small"
                    value={paramSearch}
                    onChange={(e) => setParamSearch(e.target.value)}
                    sx={ctrlSx}
                  />
                  <FormControl size="small" sx={ctrlSx}>
                    <Select value={paramSort} onChange={(e) => setParamSort(e.target.value)}>
                      <MenuItem value="name_asc">{t("Name (A-Z)")}</MenuItem>
                      <MenuItem value="name_desc">{t("Name (Z-A)")}</MenuItem>
                      <MenuItem value="oid_asc">{t("OID numerical")}</MenuItem>
                    </Select>
                  </FormControl>
                  <Tooltip title={t("Export to CSV")}>
                    <IconButton size="small" onClick={handleExportCSV} sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Export to JSON")}>
                    <IconButton size="small" onClick={handleExportJSON} sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <DataObjectIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t("Refresh metrics")}>
                    <IconButton size="small" onClick={() => loadData(false)} sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 0.75, mb: 3, flexWrap: "wrap" }}>
                {["All", "Identity", "Performance", "Environment", "Interfaces", "System"].map((cat) => (
                  <Button
                    key={cat}
                    variant={paramCategory === cat ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setParamCategory(cat)}
                    sx={{
                      textTransform: "none",
                      fontSize: 11,
                      backgroundColor: paramCategory === cat ? "#0EA5E9" : "transparent",
                      color: "#FFF",
                      borderColor: "rgba(255,255,255,0.15)",
                    }}
                  >
                    {t(cat)}
                  </Button>
                ))}
              </Box>

              {telemetry.length === 0 ? (
                <Typography sx={{ color: vars.textDim, fontSize: 12.5 }}>{t("No live parameters collected yet. Awaiting next poll cycle...")}</Typography>
              ) : filteredTelemetry.length === 0 ? (
                <Typography sx={{ color: vars.textDim, fontSize: 12.5 }}>{t("No matching parameters found for the selected category")}</Typography>
              ) : (
                <TableContainer sx={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 1 }}>
                  <Table size="small">
                    <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                      <TableRow>
                        <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Parameter")}</TableCell>
                        <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("OID")}</TableCell>
                        <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Value")}</TableCell>
                        <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Category")}</TableCell>
                        <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Last Updated")}</TableCell>
                        <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Actions")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTelemetry.map((item: TelemetryItem) => (
                        <TableRow key={item.metricName} sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { backgroundColor: "rgba(255,255,255,0.02)" } }}>
                          <TableCell sx={{ color: "#0EA5E9", fontSize: 12, fontWeight: 600 }}>{item.metricName}</TableCell>
                          <TableCell sx={{ color: vars.textWeak, fontSize: 11, fontFamily: "monospace" }}>{item.oid}</TableCell>
                          <TableCell sx={{ color: "#FFF", fontSize: 12.5, fontWeight: 700 }}>
                            {item.convertedValue !== null ? `${item.convertedValue} ${item.unit || ""}` : item.rawValue || "-"}
                          </TableCell>
                          <TableCell sx={{ color: vars.textDim, fontSize: 11 }}>{item.category || "-"}</TableCell>
                          <TableCell sx={{ color: vars.textDim, fontSize: 11 }}>{new Date(item.timestamp).toLocaleTimeString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <Tooltip title={t("Copy OID")}>
                                <IconButton size="small" onClick={() => handleCopy(item.oid)} sx={{ color: "rgba(255,255,255,0.5)", p: 0.5 }}>
                                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("Copy Value")}>
                                <IconButton size="small" onClick={() => handleCopy(String(item.convertedValue !== null ? item.convertedValue : item.rawValue))} sx={{ color: "rgba(255,255,255,0.5)", p: 0.5 }}>
                                  <DataObjectIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Box>
        )}

        {activeTab === 3 && (
          <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent }}>
                {t("Network Interfaces inventory")} ({interfaces.length})
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                <TextField
                  placeholder={t("Search by name/alias/MAC...")}
                  size="small"
                  value={interfaceSearch}
                  onChange={(e) => setInterfaceSearch(e.target.value)}
                  sx={ctrlSx}
                />
                <FormControl size="small" sx={ctrlSx}>
                  <Select value={interfaceStatusFilter} onChange={(e) => setInterfaceStatusFilter(e.target.value)}>
                    <MenuItem value="all">{t("All Statuses")}</MenuItem>
                    <MenuItem value="up">{t("Oper Status: Up")}</MenuItem>
                    <MenuItem value="down">{t("Oper Status: Down")}</MenuItem>
                  </Select>
                </FormControl>
                <Tooltip title={t("Refresh interfaces")}>
                  <IconButton size="small" onClick={() => loadData(false)} sx={{ color: "rgba(255,255,255,0.7)" }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            {interfaces.length === 0 ? (
              <Typography sx={{ color: vars.textDim, fontSize: 13 }}>{t("No network interfaces discovered yet.")}</Typography>
            ) : (
              <TableContainer sx={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 1, maxHeight: 600 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ backgroundColor: "rgba(0,0,0,0.8)", color: vars.textDim, fontSize: 12, fontWeight: 700, width: 40 }}>{t("Index")}</TableCell>
                      <TableCell sx={{ backgroundColor: "rgba(0,0,0,0.8)", color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Interface")}</TableCell>
                      <TableCell sx={{ backgroundColor: "rgba(0,0,0,0.8)", color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Details")}</TableCell>
                      <TableCell sx={{ backgroundColor: "rgba(0,0,0,0.8)", color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Status")}</TableCell>
                      <TableCell sx={{ backgroundColor: "rgba(0,0,0,0.8)", color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Traffic (In/Out)")}</TableCell>
                      <TableCell sx={{ backgroundColor: "rgba(0,0,0,0.8)", color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Errors/Discards")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInterfaces.map((iface) => {
                      const adminColor = iface.adminStatus === "up" ? "#10B981" : "#EF4444";
                      const operColor = iface.operStatus === "up" ? "#10B981" : "#EF4444";
                      // Simple traffic progress calculation (assuming 1Gbps default if MTU/Speed isn't parseable)
                      const speedBits = parseFloat(iface.speed || "1000000000"); 
                      const inBps = iface.inputTraffic * 8;
                      const outBps = iface.outputTraffic * 8;
                      const inPct = Math.min((inBps / (speedBits || 1)) * 100, 100);
                      const outPct = Math.min((outBps / (speedBits || 1)) * 100, 100);

                      const formatBytes = (bytes: number) => {
                        if (bytes === 0) return "0 B";
                        const k = 1024;
                        const sizes = ["B", "KB", "MB", "GB", "TB"];
                        const i = Math.floor(Math.log(bytes) / Math.log(k));
                        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
                      };

                      return (
                        <TableRow key={iface.id} sx={{ "&:last-child td, &:last-child th": { border: 0 }, "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" } }}>
                          <TableCell sx={{ color: vars.textDim, fontSize: 11, fontWeight: 700 }}>{iface.interfaceIndex || "-"}</TableCell>
                          <TableCell>
                            <Typography sx={{ color: "#0EA5E9", fontSize: 12.5, fontWeight: 700 }}>{iface.interfaceName}</Typography>
                            <Typography sx={{ fontSize: 11, color: vars.textDim, mt: 0.5 }}>{iface.description || iface.alias || "-"}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ fontSize: 11, color: "#FFF" }}>{t("MAC:")} <span style={{ fontFamily: "monospace", color: vars.textDim }}>{iface.mac || "-"}</span></Typography>
                            <Typography sx={{ fontSize: 11, color: "#FFF", mt: 0.25 }}>{t("Type:")} <span style={{ color: vars.textDim }}>{iface.type || "-"}</span></Typography>
                            <Typography sx={{ fontSize: 11, color: "#FFF", mt: 0.25 }}>{t("Speed:")} <span style={{ color: vars.textDim }}>{iface.speed || "-"}</span></Typography>
                            <Typography sx={{ fontSize: 11, color: "#FFF", mt: 0.25 }}>{t("MTU:")} <span style={{ color: vars.textDim }}>{iface.mtu || "-"}</span> | {t("Duplex:")} <span style={{ color: vars.textDim, textTransform: "capitalize" }}>{iface.duplex || "-"}</span></Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                                <Typography sx={{ fontSize: 10, color: vars.textDim, width: 35 }}>{t("Admin")}</Typography>
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: adminColor }} />
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: adminColor, textTransform: "capitalize" }}>{iface.adminStatus}</Typography>
                              </Box>
                              <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
                                <Typography sx={{ fontSize: 10, color: vars.textDim, width: 35 }}>{t("Oper")}</Typography>
                                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: operColor }} />
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: operColor, textTransform: "capitalize" }}>{iface.operStatus}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ minWidth: 150 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                              <Tooltip title={`In: ${iface.inputTraffic.toLocaleString()} B`}>
                                <Box>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                    <Typography sx={{ fontSize: 10, color: vars.textDim }}>RX</Typography>
                                    <Typography sx={{ fontSize: 10, color: "#FFF", fontWeight: 700 }}>{formatBytes(iface.inputTraffic)}</Typography>
                                  </Box>
                                  <LinearProgress variant="determinate" value={inPct} sx={{ height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: "#34D399" } }} />
                                </Box>
                              </Tooltip>
                              <Tooltip title={`Out: ${iface.outputTraffic.toLocaleString()} B`}>
                                <Box>
                                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                    <Typography sx={{ fontSize: 10, color: vars.textDim }}>TX</Typography>
                                    <Typography sx={{ fontSize: 10, color: "#FFF", fontWeight: 700 }}>{formatBytes(iface.outputTraffic)}</Typography>
                                  </Box>
                                  <LinearProgress variant="determinate" value={outPct} sx={{ height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: "#0EA5E9" } }} />
                                </Box>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <Tooltip title={t("Inbound Errors")}>
                                  <Typography sx={{ fontSize: 11, color: iface.inErrors > 0 ? "#EF4444" : vars.textDim }}>
                                    <span style={{ color: vars.textWeak }}>InErr:</span> {iface.inErrors || 0}
                                  </Typography>
                                </Tooltip>
                                <Tooltip title={t("Outbound Errors")}>
                                  <Typography sx={{ fontSize: 11, color: iface.outErrors > 0 ? "#EF4444" : vars.textDim }}>
                                    <span style={{ color: vars.textWeak }}>OutErr:</span> {iface.outErrors || 0}
                                  </Typography>
                                </Tooltip>
                              </Box>
                              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                <Tooltip title={t("Inbound Discards")}>
                                  <Typography sx={{ fontSize: 11, color: iface.inDiscards > 0 ? "#F59E0B" : vars.textDim }}>
                                    <span style={{ color: vars.textWeak }}>InDisc:</span> {iface.inDiscards || 0}
                                  </Typography>
                                </Tooltip>
                                <Tooltip title={t("Outbound Discards")}>
                                  <Typography sx={{ fontSize: 11, color: iface.outDiscards > 0 ? "#F59E0B" : vars.textDim }}>
                                    <span style={{ color: vars.textWeak }}>OutDisc:</span> {iface.outDiscards || 0}
                                  </Typography>
                                </Tooltip>
                              </Box>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>
        )}

        {activeTab === 4 && (() => {
          const cpuVal = Number(telemetry.find((tItem) => tItem.metricName === "cpu_util")?.convertedValue || device.cpuUtil || 0);
          const memVal = Number(telemetry.find((tItem) => tItem.metricName === "mem_util")?.convertedValue || device.memUtil || 0);
          const tempVal = Number(telemetry.find((tItem) => tItem.metricName === "temperature")?.convertedValue || 0);
          const cpuColor = cpuVal > 85 ? "#EF4444" : cpuVal > 60 ? "#F59E0B" : "#10B981";
          const memColor = memVal > 85 ? "#EF4444" : memVal > 60 ? "#F59E0B" : "#10B981";
          const tempColor = tempVal > 75 ? "#EF4444" : tempVal > 60 ? "#F59E0B" : "#10B981";
          const availVal = Number(device.availability?.toFixed(1) || 100);
          return (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr", lg: "1fr 1fr 1fr" }, gap: 3 }}>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.textDim, textTransform: "uppercase" }}>{t("CPU Utilization")}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, color: cpuColor }}>{cpuVal.toFixed(0)}%</Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <LinearProgress variant="determinate" value={cpuVal} sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: cpuColor } }} />
                  </Box>
                  <Typography sx={{ fontSize: 11, color: vars.textWeak }}>{t("Updated:")} {new Date().toLocaleTimeString()}</Typography>
                </Card>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.textDim, textTransform: "uppercase" }}>{t("Memory Utilization")}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, color: memColor }}>{memVal.toFixed(0)}%</Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <LinearProgress variant="determinate" value={memVal} sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: memColor } }} />
                  </Box>
                  <Typography sx={{ fontSize: 11, color: vars.textWeak }}>{t("Updated:")} {new Date().toLocaleTimeString()}</Typography>
                </Card>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.textDim, textTransform: "uppercase" }}>{t("Device Temperature")}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900, mt: 1, color: tempColor }}>{tempVal > 0 ? `${tempVal.toFixed(1)}°C` : "N/A"}</Typography>
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <LinearProgress variant="determinate" value={Math.min(tempVal, 100)} sx={{ height: 8, borderRadius: 4, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: tempColor } }} />
                  </Box>
                  <Typography sx={{ fontSize: 11, color: vars.textWeak }}>{t("Updated:")} {new Date().toLocaleTimeString()}</Typography>
                </Card>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                  <Typography sx={{ fontSize: 12, color: vars.textDim, textTransform: "uppercase" }}>{t("Availability")}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: availVal < 99 ? "#F59E0B" : "#10B981" }}>
                    {availVal}%
                  </Typography>
                  <Box sx={{ mt: 1.5 }}>
                    <LinearProgress variant="determinate" value={availVal} sx={{ height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: availVal < 99 ? "#F59E0B" : "#10B981" } }} />
                  </Box>
                </Card>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                  <Typography sx={{ fontSize: 12, color: vars.textDim, textTransform: "uppercase" }}>{t("ICMP Response Time")}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: "#3B82F6" }}>
                    {device.responseTime !== null ? `${device.responseTime} ms` : "N/A"}
                  </Typography>
                  <Box sx={{ mt: 1.5 }}>
                    <LinearProgress variant="determinate" value={Math.min(device.responseTime || 0, 1000) / 10} sx={{ height: 4, borderRadius: 2, bgcolor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { bgcolor: "#3B82F6" } }} />
                  </Box>
                </Card>
                <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                  <Typography sx={{ fontSize: 12, color: vars.textDim, textTransform: "uppercase" }}>{t("Poll Cycle Duration")}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: "#E879F9" }}>
                    {device.pollDuration !== null ? `${device.pollDuration} ms` : "0 ms"}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: vars.textWeak, mt: 1 }}>
                    {t("Poll cycles count:")} {device.pollCount || "0"}
                  </Typography>
                </Card>
              </Box>
            </Box>
          );
        })()}

        {activeTab === 5 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent }}>
                  {t("Hardware Components")} ({filteredHardware.length})
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                  <TextField
                    placeholder={t("Search hardware components...")}
                    size="small"
                    value={hardwareSearch}
                    onChange={(e) => {
                      setHardwareSearch(e.target.value);
                      setHardwarePage(0);
                    }}
                    sx={ctrlSx}
                  />
                  <FormControl size="small" sx={ctrlSx}>
                    <Select 
                      value={hardwareTypeFilter} 
                      onChange={(e) => {
                        setHardwareTypeFilter(e.target.value);
                        setHardwarePage(0);
                      }}
                      displayEmpty
                    >
                      <MenuItem value="all">{t("All Types")}</MenuItem>
                      {hardwareTypes.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Tooltip title={t("Refresh")}>
                    <IconButton size="small" onClick={() => loadData(false)} sx={{ color: "rgba(255,255,255,0.7)" }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {hardware.length === 0 ? (
                <Typography sx={{ color: vars.textDim, fontSize: 13, py: 4, textAlign: "center" }}>
                  {t("No hardware components discovered yet.")}
                </Typography>
              ) : (
                <>
                  <TableContainer sx={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 1, backgroundColor: "rgba(0,0,0,0.2)", overflowX: "auto" }}>
                    <Table size="small" sx={{ minWidth: 800 }}>
                      <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <TableRow>
                          <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700, width: "30%" }}>{t("Component Name")}</TableCell>
                          <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Component Type")}</TableCell>
                          <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Model")}</TableCell>
                          <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Serial Number")}</TableCell>
                          <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Firmware Version")}</TableCell>
                          <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>{t("Last Updated")}</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedHardware.map((hw) => {
                          const compName = formatHardwareValue(hw.componentName);
                          return (
                            <TableRow key={hw.id} sx={{ "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" } }}>
                              <TableCell sx={{ color: "#FFF", fontSize: 12, fontWeight: 600, maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {compName.length > 50 ? (
                                  <Tooltip title={compName} arrow>
                                    <span>{compName.substring(0, 47) + "..."}</span>
                                  </Tooltip>
                                ) : (
                                  compName
                                )}
                              </TableCell>
                              <TableCell sx={{ color: vars.textWeak, fontSize: 12, textTransform: "capitalize" }}>
                                {formatHardwareValue(hw.componentType)}
                              </TableCell>
                              <TableCell sx={{ color: vars.textWeak, fontSize: 12 }}>
                                {formatHardwareValue(hw.modelName)}
                              </TableCell>
                              <TableCell sx={{ color: vars.textWeak, fontSize: 12, fontFamily: "monospace" }}>
                                {formatHardwareValue(hw.serialNumber)}
                              </TableCell>
                              <TableCell sx={{ color: vars.textWeak, fontSize: 12 }}>
                                {formatHardwareValue(hw.firmwareVersion)}
                              </TableCell>
                              <TableCell sx={{ color: vars.textWeak, fontSize: 12 }}>
                                {formatLastUpdated(hw.lastUpdated)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {paginatedHardware.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 3, color: vars.textDim }}>
                              {t("No components match the current filters.")}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={filteredHardware.length}
                    page={hardwarePage}
                    onPageChange={(e, newPage) => setHardwarePage(newPage)}
                    rowsPerPage={hardwareRowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setHardwareRowsPerPage(parseInt(e.target.value, 10));
                      setHardwarePage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    labelDisplayedRows={({ from, to, count }) => `${t("Showing")} ${from}-${to} ${t("of")} ${count} ${t("components")}`}
                    sx={{
                      color: vars.textWeak,
                      ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": { fontSize: 13 },
                      ".MuiTablePagination-select": { fontSize: 13 },
                    }}
                  />
                </>
              )}
            </Card>

            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mt: 2 }}>
              {t("Environmental Sensors")} ({sensors.length})
            </Typography>
            {sensors.length === 0 ? (
              <Typography sx={{ color: vars.textDim, fontSize: 13 }}>{t("No environmental sensors discovered yet.")}</Typography>
            ) : (
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
                {sensors.map((s) => (
                  <Card key={s.id} sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
                    <Typography sx={{ fontSize: 12, color: vars.textDim, textTransform: "uppercase" }}>{s.sensorName}</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, mt: 1, color: s.status === "ok" ? "#34D399" : s.status === "warning" ? "#F59E0B" : "#F87171" }}>
                      {s.sensorValue} {s.unit || ""}
                    </Typography>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak, mt: 0.5 }}>
                      Type: {s.sensorType} | Status: {s.status}
                    </Typography>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}

        {activeTab === 6 && (
          <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.6)" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: vars.accent, mb: 2 }}>
              {t("Recent Polling Sweeps History")}
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ p: 1.5, borderRadius: 1, border: "1px solid rgba(255,255,255,0.06)", bgcolor: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#FFF" }}>{t("SNMP Query successful")}</Typography>
                  <Typography sx={{ fontSize: 11, color: vars.textDim, mt: 0.25 }}>
                    {device.lastPoll ? new Date(device.lastPoll).toLocaleString("en-IN") : "-"}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#34D399" }}>
                  ONLINE • {device.responseTime}ms
                </Typography>
              </Box>

              {device.lastPollError && (
                <Box sx={{ p: 1.5, borderRadius: 1, border: "1px solid rgba(239,68,68,0.15)", bgcolor: "rgba(239,68,68,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#EF4444" }}>{t("SNMP Connection Error")}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#FCA5A5", mt: 0.5, fontFamily: "monospace" }}>
                      {device.lastPollError}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#EF4444" }}>
                    OFFLINE
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        )}
        {activeTab === 7 && (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 3 }}>
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, height: "fit-content", backgroundColor: "rgba(17,25,40,0.6)" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: vars.accent, textTransform: "uppercase", mb: 2 }}>
                {t("OID Explorer troubleshooting")}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl size="small" fullWidth sx={ctrlSx}>
                  <Select value={explorerOp} onChange={(e) => setExplorerOp(e.target.value)}>
                    <MenuItem value="get">SNMP GET</MenuItem>
                    <MenuItem value="getnext">SNMP GETNEXT</MenuItem>
                    <MenuItem value="getbulk">SNMP GETBULK</MenuItem>
                    <MenuItem value="walk">SNMP WALK</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  placeholder="OID Path (e.g. 1.3.6.1.2.1.1.1.0)"
                  value={explorerOid}
                  onChange={(e) => setExplorerOid(e.target.value)}
                  sx={ctrlSx}
                  fullWidth
                />

                {explorerOp === "getbulk" && (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      label={t("Non-Repeaters")}
                      type="number"
                      size="small"
                      value={nonRepeaters}
                      onChange={(e) => setNonRepeaters(Number(e.target.value))}
                      sx={{ ...ctrlSx, flex: 1 }}
                      InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)", fontSize: 12 } }}
                    />
                    <TextField
                      label={t("Max Repetitions")}
                      type="number"
                      size="small"
                      value={maxRepetitions}
                      onChange={(e) => setMaxRepetitions(Number(e.target.value))}
                      sx={{ ...ctrlSx, flex: 1 }}
                      InputLabelProps={{ sx: { color: "rgba(255,255,255,0.7)", fontSize: 12 } }}
                    />
                  </Box>
                )}

                <Button
                  variant="contained"
                  fullWidth
                  size="small"
                  onClick={handleExecuteExplorer}
                  disabled={queryingOid}
                  sx={{
                    backgroundColor: "#0EA5E9",
                    "&:hover": { backgroundColor: "#0284C7" },
                    textTransform: "none",
                  }}
                >
                  {queryingOid ? <CircularProgress size={16} color="inherit" /> : t("Query SNMP")}
                </Button>
              </Box>

              {explorerResult && (
                <Box sx={{ mt: 3, p: 1.5, borderRadius: 1, border: "1px solid rgba(255,255,255,0.1)", bgcolor: "rgba(0,0,0,0.3)" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: explorerResult.success ? "#10B981" : "#EF4444" }}>
                      {explorerResult.success ? t("SUCCESS") : t("FAILED")}
                    </Typography>
                    {explorerDuration !== null && (
                      <Typography sx={{ fontSize: 11, color: vars.textDim }}>
                        Time: {explorerDuration} ms
                      </Typography>
                    )}
                  </Box>

                  {explorerResult.error && (
                    <Typography sx={{ fontSize: 11.5, color: "#EF4444", fontFamily: "monospace" }}>
                      Error: {explorerResult.error}
                    </Typography>
                  )}

                  {explorerResult.values && Object.keys(explorerResult.values).length > 0 && (
                    <Box sx={{ maxHeight: 350, overflowY: "auto", pr: 0.5, mb: 1.5 }}>
                      <TableContainer sx={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 1 }}>
                        <Table size="small">
                          <TableHead sx={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                            <TableRow>
                              <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>OID</TableCell>
                              <TableCell sx={{ color: vars.textDim, fontSize: 12, fontWeight: 700 }}>Value</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(explorerResult.values).map(([oid, val]) => (
                              <TableRow key={oid} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                                <TableCell sx={{ color: "#0EA5E9", fontSize: 11, fontFamily: "monospace" }}>{oid}</TableCell>
                                <TableCell sx={{ color: "#FFF", fontSize: 11.5 }}>{String(val)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {!explorerResult.values && explorerResult.value && (
                    <Box sx={{ mb: 1.5 }}>
                      <Typography sx={{ fontSize: 10.5, color: "#0EA5E9", fontFamily: "monospace" }}>{explorerResult.oid || explorerOid}</Typography>
                      <Typography sx={{ fontSize: 12, color: "#FFF", fontWeight: 700, mt: 0.5 }}>{explorerResult.value}</Typography>
                    </Box>
                  )}

                  {explorerResult.output && (
                    <Box sx={{ mt: 1.5 }}>
                      <Typography sx={{ fontSize: 10, color: vars.textDim, mb: 0.5 }}>Raw output stdout:</Typography>
                      <Typography sx={{ fontSize: 10, color: "#A7F3D0", fontFamily: "monospace", whiteSpace: "pre-wrap", bgcolor: "rgba(0,0,0,0.5)", p: 1, borderRadius: 0.5, maxHeight: 150, overflowY: "auto" }}>
                        {explorerResult.output}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Card>
          </Box>
        )}
              </Box>
            )}
          </>
        )}
      </Box>
    </MainLayout>
  );
}
