// src/pages/Monitoring/Devices.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Card,
  Button,
  TextField,
  InputAdornment,
  TablePagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Checkbox,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  LinearProgress,
  Grid,
} from "@mui/material";
import { Link } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { api } from "../../api/http";
import { useI18n } from "../../i18n";
import { vars } from "../../ui/toast/themeBridge";
import {
  PREMIUM_CARD_SX,
  THEAD_CELL_SX,
  ROW_CELL_SX,
  PAGINATION_SX,
  AmbientLighting,
  glassRowHoverSx,
  PREMIUM_DIALOG_PAPER_SX,
  PREMIUM_DIALOG_TITLE_SX,
  PREMIUM_DIALOG_CONTENT_SX,
  PREMIUM_DIALOG_ACTIONS_SX,
  PREMIUM_FORM_LABEL_SX,
  PREMIUM_ACTION_BUTTON_SX,
} from "../../ui/styles";
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
  sysName: string | null;
  sysDescr: string | null;
  sysObjectID: string | null;
  sysUpTime: string | null;
  lastPollError: string | null;
  availability: number;
  healthScore: number;
  responseTime: number | null;
  pollDuration: number | null;
  profileId: number | null;
  lifecycleState: string;
  provider?: string;
  resourceType?: string;
  credentials?: {
    username?: string;
    securityLevel?: string;
    authProtocol?: string;
    authPassword?: string;
    privProtocol?: string;
    privPassword?: string;
    contextName?: string;
    engineId?: string;
    community?: string;
    port?: number;
    timeout?: number;
    retries?: number;
    pollInterval?: number | null;
    maxOidsPerRequest?: number | null;
    maxRepetitions?: number | null;
    preferredOperation?: string | null;
    enableBulkWalk?: boolean | null;
    enableInterfaceDiscovery?: boolean | null;
    enableHistoricalTelemetry?: boolean | null;
    enablePerformancePolling?: boolean | null;
    enableEnvironmentalPolling?: boolean | null;
  } | null;
};

type Profile = {
  id: number;
  name: string;
  description: string;
};

type TestConnectionResult = {
  success: boolean;
  responseTime?: number;
  sysName?: string;
  sysDescr?: string;
  sysUpTime?: string;
  sysObjectID?: string;
  error?: string;
};

const LIFECYCLE_STATES = ["Draft", "Configured", "Testing", "Monitoring", "Maintenance", "Disabled", "Retired"];
const DEVICE_TYPES = ["Router", "Switch", "Server", "Gateway", "Modem", "Ground Station Controller", "Safran Orion", "UPS", "Other"];
const VENDORS = ["Cisco", "Juniper", "Dell", "HP", "Linux", "Windows", "Safran", "AWS", "Generic"];
const PROVIDERS = ["AWS", "SNMP", "REST API"];

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

export default function MonitoringDevices() {
  const { t } = useI18n();
  const [devices, setDevices] = useState<Device[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter/Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProvider, setFilterProvider] = useState("AWS");
  const [filterVendor, setFilterVendor] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterVersion, setFilterVersion] = useState("");
  const [quickFilterStatus, setQuickFilterStatus] = useState("");
  const [pollingActive, setPollingActive] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Modals
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTab, setDialogTab] = useState(0);
  const [editDeviceId, setEditDeviceId] = useState<number | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<TestConnectionResult | null>(null);
  const [testProgressStep, setTestProgressStep] = useState("");
  const [showAdvancedSnmp, setShowAdvancedSnmp] = useState(false);

  // Column Selector
  const [colSelectorOpen, setColSelectorOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    provider: true,
    status: true,
    health: true,
    availability: true,
    latency: true,
    vendor: true,
    lifecycle: true,
    lastPoll: true,
    lastSuccess: false,
    lastFailure: false,
    profile: false,
    type: false,
    location: false,
  });

  // Device Form Fields
  const [deviceName, setDeviceName] = useState("");
  const [hostname, setHostname] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [macAddress, setMacAddress] = useState("");
  const [vendor, setVendor] = useState("");
  const [model, setModel] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [firmware, setFirmware] = useState("");
  const [osVersion, setOsVersion] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [site, setSite] = useState("");
  const [rack, setRack] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [snmpVersion, setSnmpVersion] = useState("v2c");
  const [profileId, setProfileId] = useState("");
  const [lifecycleState, setLifecycleState] = useState("Configured");

  // Credentials
  const [community, setCommunity] = useState("public");
  const [port, setPort] = useState("161");
  const [timeout, setTimeoutVal] = useState("2500");
  const [retries, setRetries] = useState("1");
  const [v3Username, setV3Username] = useState("");
  const [v3SecurityLevel, setV3SecurityLevel] = useState("noAuthNoPriv");
  const [v3AuthProtocol, setV3AuthProtocol] = useState("SHA");
  const [v3AuthPassword, setV3AuthPassword] = useState("");
  const [v3PrivProtocol, setV3PrivProtocol] = useState("AES128");
  const [v3PrivPassword, setV3PrivPassword] = useState("");
  const [v3ContextName, setV3ContextName] = useState("");
  const [v3EngineId, setV3EngineId] = useState("");

  // Password Visibility Toggle
  const [showAuthPass, setShowAuthPass] = useState(false);
  const [showPrivPass, setShowPrivPass] = useState(false);

  // Extended Tuning Parameters
  const [pollInterval, setPollInterval] = useState("");
  const [maxOidsPerRequest, setMaxOidsPerRequest] = useState("20");
  const [maxRepetitions, setMaxRepetitions] = useState("20");
  const [preferredOperation, setPreferredOperation] = useState("GET");
  const [enableBulkWalk, setEnableBulkWalk] = useState(true);
  const [enableInterfaceDiscovery, setEnableInterfaceDiscovery] = useState(true);
  const [enableHistoricalTelemetry, setEnableHistoricalTelemetry] = useState(true);
  const [enablePerformancePolling, setEnablePerformancePolling] = useState(true);
  const [enableEnvironmentalPolling, setEnableEnvironmentalPolling] = useState(true);

  const fetchData = async () => {
    try {
      const [devResp, profResp] = await Promise.all([
        api.get<{ success: boolean; devices: Device[] }>("/api/monitoring/devices"),
        api.get<{ success: boolean; profiles: Profile[] }>("/api/monitoring/profiles").catch(() => ({ success: false, profiles: [] }))
      ]);

      if (devResp && (devResp as any).success) {
        setDevices((devResp as any).devices || []);
      } else if (Array.isArray(devResp)) {
        setDevices(devResp);
      }

      if (profResp && profResp.success) {
        setProfiles(profResp.profiles || []);
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to fetch devices data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtering
  const filteredDevices = useMemo(() => {
    return devices.filter((d) => {
      const matchSearch =
        d.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.ipAddress.includes(searchQuery) ||
        (d.sysName || "").toLowerCase().includes(searchQuery.toLowerCase());

      const dProvider = d.provider || "SNMP";
      const matchProvider = !filterProvider || dProvider === filterProvider;
      const matchVendor = !filterVendor || d.vendor === filterVendor;
      const matchType = !filterType || d.deviceType === filterType;
      const matchStatus = !filterStatus || d.status === filterStatus;
      const matchVersion = !filterVersion || d.snmpVersion === filterVersion;

      let matchQuick = true;
      if (quickFilterStatus) {
        if (quickFilterStatus === "MAINTENANCE") {
          matchQuick = d.lifecycleState === "Maintenance";
        } else if (quickFilterStatus === "DISABLED") {
          matchQuick = d.lifecycleState === "Disabled";
        } else {
          matchQuick = d.status === quickFilterStatus;
        }
      }

      return matchSearch && matchProvider && matchVendor && matchType && matchStatus && matchVersion && matchQuick;
    });
  }, [devices, searchQuery, filterProvider, filterVendor, filterType, filterStatus, filterVersion, quickFilterStatus]);

  // Status counts for quick filter badges
  const statusCounts = useMemo(() => {
    const counts = { all: devices.length, ONLINE: 0, OFFLINE: 0, WARNING: 0, UNKNOWN: 0, MAINTENANCE: 0, DISABLED: 0 };
    devices.forEach((d) => {
      if (d.status === "ONLINE") counts.ONLINE++;
      else if (d.status === "OFFLINE") counts.OFFLINE++;
      else if (d.status === "WARNING") counts.WARNING++;
      else counts.UNKNOWN++;
      if (d.lifecycleState === "Maintenance") counts.MAINTENANCE++;
      if (d.lifecycleState === "Disabled") counts.DISABLED++;
    });
    return counts;
  }, [devices]);

  // Bulk Actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredDevices.map((d) => d.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(t("Are you sure you want to delete the selected devices?"))) return;

    try {
      const response = await api.post<{ success: boolean }>("/api/monitoring/devices/bulk-delete", { ids: selectedIds });
      if (response.success) {
        toast.success(t("Selected devices deleted successfully"));
        setSelectedIds([]);
        fetchData();
      } else {
        toast.error(t("Failed to delete devices"));
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to delete devices"));
    }
  };

  const handleBulkPoll = async () => {
    if (selectedIds.length === 0) return;
    setPollingActive(true);
    toast.loading(t("Polling selected devices..."), { id: "bulk-poll" });
    try {
      const response = await api.post<{ success: boolean }>("/api/monitoring/devices/bulk-poll", { ids: selectedIds });
      if (response.success) {
        toast.success(t("Polling completed successfully"), { id: "bulk-poll" });
        fetchData();
      } else {
        toast.error(t("Failed to poll devices"), { id: "bulk-poll" });
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to poll devices"), { id: "bulk-poll" });
    } finally {
      setPollingActive(false);
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = [
      t("Device Name"),
      t("Hostname"),
      t("IP Address"),
      t("Vendor"),
      t("Model"),
      t("Status"),
      t("Health Score"),
      t("Availability"),
      t("Latency"),
      t("Site"),
      t("Lifecycle"),
    ];

    const rows = filteredDevices.map((d) => [
      d.deviceName,
      d.hostname || "",
      d.ipAddress,
      d.vendor || "Generic",
      d.model || "",
      d.status,
      `${d.healthScore}%`,
      `${d.availability.toFixed(1)}%`,
      d.responseTime !== null ? `${d.responseTime}ms` : "N/A",
      d.site || "",
      d.lifecycleState,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\r\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nms_devices_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const data = filteredDevices.map((d) => ({
      deviceName: d.deviceName,
      hostname: d.hostname || "",
      ipAddress: d.ipAddress,
      vendor: d.vendor || "Generic",
      model: d.model || "",
      status: d.status,
      healthScore: d.healthScore,
      availability: d.availability,
      responseTime: d.responseTime,
      site: d.site || "",
      lifecycleState: d.lifecycleState,
      snmpVersion: d.snmpVersion,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nms_devices_export_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Password strength helper
  const getPasswordStrength = (pwd: string) => {
    if (!pwd || pwd === "********") return { text: "", color: "transparent" };
    if (pwd.length < 6) return { text: t("Weak"), color: "#EF4444" };
    const hasLetters = /[a-zA-Z]/.test(pwd);
    const hasNumbers = /[0-9]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
    if (hasLetters && hasNumbers && hasSpecial && pwd.length >= 8) {
      return { text: t("Strong"), color: "#10B981" };
    }
    return { text: t("Medium"), color: "#F59E0B" };
  };

  // Dialog actions
  const handleOpenDialog = (device: Device | null = null) => {
    setDialogTab(0);
    setTestResult(null);
    setShowAuthPass(false);
    setShowPrivPass(false);

    if (device) {
      setEditDeviceId(device.id);
      setDeviceName(device.deviceName);
      setHostname(device.hostname || "");
      setIpAddress(device.ipAddress);
      setMacAddress(device.macAddress || "");
      setVendor(device.vendor || "");
      setModel(device.model || "");
      setSerialNumber(device.serialNumber || "");
      setFirmware(device.firmware || "");
      setOsVersion(device.osVersion || "");
      setDeviceType(device.deviceType || "");
      setSite(device.site || "");
      setRack(device.rack || "");
      setLocation(device.location || "");
      setLatitude(device.latitude ? String(device.latitude) : "");
      setLongitude(device.longitude ? String(device.longitude) : "");
      setSnmpVersion(device.snmpVersion);
      setProfileId(device.profileId ? String(device.profileId) : "");
      setLifecycleState(device.lifecycleState);

      const creds = device.credentials || {};
      setCommunity(creds.community || "public");
      setPort(String(creds.port || 161));
      setTimeoutVal(String(creds.timeout || 2500));
      setRetries(String(creds.retries || 1));
      setV3Username(creds.username || "");
      setV3SecurityLevel(creds.securityLevel || "noAuthNoPriv");
      setV3AuthProtocol(creds.authProtocol || "SHA");
      setV3AuthPassword(creds.authPassword || "");
      setV3PrivProtocol(creds.privProtocol || "AES128");
      setV3PrivPassword(creds.privPassword || "");
      setV3ContextName(creds.contextName || "");
      setV3EngineId(creds.engineId || "");

      // Extended tuning configurations
      setPollInterval(creds.pollInterval ? String(creds.pollInterval) : "");
      setMaxOidsPerRequest(creds.maxOidsPerRequest ? String(creds.maxOidsPerRequest) : "20");
      setMaxRepetitions(creds.maxRepetitions ? String(creds.maxRepetitions) : "20");
      setPreferredOperation(creds.preferredOperation || "GET");
      setEnableBulkWalk(creds.enableBulkWalk !== false);
      setEnableInterfaceDiscovery(creds.enableInterfaceDiscovery !== false);
      setEnableHistoricalTelemetry(creds.enableHistoricalTelemetry !== false);
      setEnablePerformancePolling(creds.enablePerformancePolling !== false);
      setEnableEnvironmentalPolling(creds.enableEnvironmentalPolling !== false);
    } else {
      setEditDeviceId(null);
      setDeviceName("");
      setHostname("");
      setIpAddress("");
      setMacAddress("");
      setVendor("");
      setModel("");
      setSerialNumber("");
      setFirmware("");
      setOsVersion("");
      setDeviceType("Other");
      setSite("");
      setRack("");
      setLocation("");
      setLatitude("");
      setLongitude("");
      setSnmpVersion("v2c");
      setProfileId("");
      setLifecycleState("Configured");

      setCommunity("public");
      setPort("161");
      setTimeoutVal("2500");
      setRetries("1");
      setV3Username("");
      setV3SecurityLevel("noAuthNoPriv");
      setV3AuthProtocol("SHA");
      setV3AuthPassword("");
      setV3PrivProtocol("AES128");
      setV3PrivPassword("");
      setV3ContextName("");
      setV3EngineId("");

      setPollInterval("");
      setMaxOidsPerRequest("20");
      setMaxRepetitions("20");
      setPreferredOperation("GET");
      setEnableBulkWalk(true);
      setEnableInterfaceDiscovery(true);
      setEnableHistoricalTelemetry(true);
      setEnablePerformancePolling(true);
      setEnableEnvironmentalPolling(true);
    }
    setDialogOpen(true);
  };

  const buildPayload = () => {
    const creds: any = {
      port: parseInt(port) || 161,
      timeout: parseInt(timeout) || 2500,
      retries: parseInt(retries) || 1,
      pollInterval: pollInterval ? parseInt(pollInterval) : null,
      maxOidsPerRequest: maxOidsPerRequest ? parseInt(maxOidsPerRequest) : null,
      maxRepetitions: maxRepetitions ? parseInt(maxRepetitions) : null,
      preferredOperation,
      enableBulkWalk,
      enableInterfaceDiscovery,
      enableHistoricalTelemetry,
      enablePerformancePolling,
      enableEnvironmentalPolling,
    };

    if (snmpVersion === "v3" || snmpVersion === "3") {
      creds.username = v3Username;
      creds.securityLevel = v3SecurityLevel;
      creds.authProtocol = v3AuthProtocol;
      creds.authPassword = v3AuthPassword;
      creds.privProtocol = v3PrivProtocol;
      creds.privPassword = v3PrivPassword;
      creds.contextName = v3ContextName;
      creds.engineId = v3EngineId;
    } else {
      creds.community = community;
    }

    return {
      deviceName,
      hostname: hostname || null,
      ipAddress,
      macAddress: macAddress || null,
      vendor: vendor || null,
      model: model || null,
      serialNumber: serialNumber || null,
      firmware: firmware || null,
      osVersion: osVersion || null,
      deviceType: deviceType || null,
      site: site || null,
      rack: rack || null,
      location: location || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
      snmpVersion,
      profileId: profileId ? parseInt(profileId) : null,
      lifecycleState,
      credentials: creds,
    };
  };

  // Form validity checker
  const isFormValid = useMemo(() => {
    if (!deviceName || !ipAddress) return false;
    if (snmpVersion === "v3" || snmpVersion === "3") {
      if (!v3Username) return false;
      if (v3SecurityLevel === "authNoPriv" && !v3AuthPassword) return false;
      if (v3SecurityLevel === "authPriv" && (!v3AuthPassword || !v3PrivPassword)) return false;
    }
    return true;
  }, [deviceName, ipAddress, snmpVersion, v3Username, v3SecurityLevel, v3AuthPassword, v3PrivPassword]);

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    setTestProgressStep(t("Connecting..."));

    const timers = [
      setTimeout(() => setTestProgressStep(t("Authenticating...")), 500),
      setTimeout(() => setTestProgressStep(t("Reading System OIDs...")), 1000),
    ];

    try {
      const payload = buildPayload();
      const response = await api.post<{ success: boolean; connection: TestConnectionResult }>(
        "/api/monitoring/devices/test-connection",
        payload
      );

      timers.forEach(clearTimeout);

      if (response.success) {
        setTestProgressStep(t("Completed"));
        setTestResult(response.connection);
        if (response.connection.success) {
          toast.success(t("SNMP Connection Successful!"));
        } else {
          toast.error(t("SNMP Connection Failed"));
        }
      } else {
        setTestProgressStep(t("Failed"));
        toast.error(t("Connection test request failed"));
      }
    } catch (err: any) {
      timers.forEach(clearTimeout);
      setTestProgressStep(t("Failed"));
      toast.error(err.message || t("Test Connection Error"));
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async () => {
    if (!isFormValid) return;

    try {
      const payload = buildPayload();
      let response;
      if (editDeviceId) {
        response = await api.put<{ success: boolean }>(`/api/monitoring/devices/${editDeviceId}`, payload);
      } else {
        response = await api.post<{ success: boolean }>("/api/monitoring/devices", payload);
      }

      if (response.success) {
        toast.success(editDeviceId ? t("Device updated successfully") : t("Device added successfully"));
        setDialogOpen(false);
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to save device"));
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("Are you sure you want to delete this device?"))) return;

    try {
      const response = await api.del<{ success: boolean }>(`/api/monitoring/devices/${id}`);
      if (response.success) {
        toast.success(t("Device deleted successfully"));
        fetchData();
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to delete device"));
    }
  };

  const handleManualPoll = async (id: number) => {
    setPollingActive(true);
    toast.loading(t("Polling device metrics..."), { id: `poll-${id}` });
    try {
      const response = await api.post<{ success: boolean }>("/api/monitoring/devices/bulk-poll", { ids: [id] });
      if (response.success) {
        toast.success(t("Device polled successfully"), { id: `poll-${id}` });
        fetchData();
      } else {
        toast.error(t("Polling failed"), { id: `poll-${id}` });
      }
    } catch (err: any) {
      toast.error(err.message || t("Polling error"), { id: `poll-${id}` });
    } finally {
      setPollingActive(false);
    }
  };

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      height: "36px",
      fontSize: 12.5,
      color: "#FFF",
      backgroundColor: "rgba(30, 41, 59, 0.4)",
      borderRadius: "6px",
      "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
      "&:hover fieldset": { borderColor: "#0EA5E9" },
      "&.Mui-focused fieldset": { borderColor: "#0EA5E9", borderWidth: 1 },
    },
    "& .MuiInputBase-input": { color: "#FFF" },
  };

  return (
    <MainLayout title={t("Monitoring Inventory")}>
      <AmbientLighting />
      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 4,
          height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          overflowY: "auto",
          bgcolor: vars.bgApp,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Horizontal Filter Toolbar */}
        <Card sx={{ 
          display: "flex",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "16px",
          p: "20px",
          mb: "16px",
          borderRadius: "16px",
          bgcolor: "#1A2233",
          border: "1px solid rgba(255,255,255,0.08)"
        }}>
          <Box sx={{ width: "100%", mb: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '18px', color: '#0EA5E9' }}>
              {t("Inventory Filters")}
            </Typography>
          </Box>
            <FormControl size="small" sx={{ ...ctrlSx, width: { xs: '100%', sm: 'calc(50% - 8px)', md: '180px' } }}>
              <Typography sx={{ ...PREMIUM_FORM_LABEL_SX, color: "#94A3B8" }}>{t("Provider")}</Typography>
              <Select value={filterProvider} onChange={(e) => setFilterProvider(e.target.value)} displayEmpty sx={{ height: '40px', color: "#F8FAFC" }}>
                {PROVIDERS.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ ...ctrlSx, width: { xs: '100%', sm: 'calc(50% - 8px)', md: '180px' } }}>
              <Typography sx={{ ...PREMIUM_FORM_LABEL_SX, color: "#94A3B8" }}>{t("Vendor")}</Typography>
              <Select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} displayEmpty sx={{ height: '40px', color: "#F8FAFC" }}>
                <MenuItem value="">{t("All Vendors")}</MenuItem>
                {VENDORS.map((v) => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ ...ctrlSx, width: { xs: '100%', sm: 'calc(50% - 8px)', md: '180px' } }}>
              <Typography sx={{ ...PREMIUM_FORM_LABEL_SX, color: "#94A3B8" }}>{t("Device Type")}</Typography>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} displayEmpty sx={{ height: '40px', color: "#F8FAFC" }}>
                <MenuItem value="">{t("All Types")}</MenuItem>
                {DEVICE_TYPES.map((tVal) => (
                  <MenuItem key={tVal} value={tVal}>{tVal}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ ...ctrlSx, width: { xs: '100%', sm: 'calc(50% - 8px)', md: '180px' } }}>
              <Typography sx={{ ...PREMIUM_FORM_LABEL_SX, color: "#94A3B8" }}>{t("Status")}</Typography>
              <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} displayEmpty sx={{ height: '40px', color: "#F8FAFC" }}>
                <MenuItem value="">{t("All Statuses")}</MenuItem>
                <MenuItem value="ONLINE">{t("ONLINE")}</MenuItem>
                <MenuItem value="OFFLINE">{t("OFFLINE")}</MenuItem>
                <MenuItem value="WARNING">{t("WARNING")}</MenuItem>
                <MenuItem value="UNKNOWN">{t("UNKNOWN")}</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ ...ctrlSx, width: { xs: '100%', sm: 'calc(50% - 8px)', md: '180px' } }}>
              <Typography sx={{ ...PREMIUM_FORM_LABEL_SX, color: "#94A3B8" }}>{t("SNMP Version")}</Typography>
              <Select value={filterVersion} onChange={(e) => setFilterVersion(e.target.value)} displayEmpty sx={{ height: '40px', color: "#F8FAFC" }}>
                <MenuItem value="">{t("All Versions")}</MenuItem>
                <MenuItem value="v1">SNMP v1</MenuItem>
                <MenuItem value="v2c">SNMP v2c</MenuItem>
                <MenuItem value="v3">SNMP v3</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => {
                setFilterProvider("AWS");
                setFilterVendor("");
                setFilterType("");
                setFilterStatus("");
                setFilterVersion("");
                setSearchQuery("");
                setQuickFilterStatus("");
              }}
              sx={{ 
                textTransform: "none", 
                borderColor: "#0EA5E9",
                color: "#0EA5E9", 
                width: { xs: '100%', md: '140px' }, 
                height: "40px", 
                borderRadius: "10px",
                ml: { md: "auto" }
              }}
            >
              {t("Clear Filters")}
            </Button>
        </Card>

        {/* Search Toolbar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 0, m: 0, width: "100%", height: "48px", mb: "12px" }}>
            <TextField
              placeholder={t("Search devices, hostnames...")}
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ ...ctrlSx, width: { xs: '100%', md: '700px' }, maxWidth: '700px' }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              {selectedIds.length > 0 && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                    sx={{ textTransform: "none" }}
                  >
                    {t("Delete")} ({selectedIds.length})
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PlayArrowIcon />}
                    onClick={handleBulkPoll}
                    disabled={pollingActive}
                    sx={{ backgroundColor: "#10B981", "&:hover": { backgroundColor: "#059669" }, textTransform: "none" }}
                  >
                    {t("Bulk Poll")}
                  </Button>
                </>
              )}

              <Tooltip title={t("Refresh Inventory")}>
                <IconButton onClick={() => fetchData()} sx={{ color: "rgba(255,255,255,0.7)" }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <IconButton onClick={() => setColSelectorOpen(true)} sx={{ color: "rgba(255,255,255,0.7)" }}>
                <ViewColumnIcon />
              </IconButton>

              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudDownloadIcon />}
                onClick={handleExportCSV}
                sx={{ borderColor: "rgba(255,255,255,0.2)", color: "#FFF", textTransform: "none" }}
              >
                {t("CSV")}
              </Button>

              <Button
                variant="outlined"
                size="small"
                startIcon={<CloudDownloadIcon />}
                onClick={handleExportJSON}
                sx={{ borderColor: "rgba(255,255,255,0.2)", color: "#FFF", textTransform: "none" }}
              >
                {t("JSON")}
              </Button>

              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog(null)}
                sx={{ backgroundColor: "#0EA5E9", "&:hover": { backgroundColor: "#0284C7" }, textTransform: "none" }}
              >
                {t("Add Device")}
              </Button>
            </Box>
          </Box>

          {/* Polling Progress Bar */}
          {pollingActive && (
            <LinearProgress sx={{ borderRadius: 1, height: 3, bgcolor: "rgba(255,255,255,0.05)", "& .MuiLinearProgress-bar": { bgcolor: "#0EA5E9" } }} />
          )}

          {/* Device Table Card */}
          <Card sx={{ 
            bgcolor: '#151C26',
            borderRadius: '16px',
            overflow: "hidden", 
            p: 0,
            m: 0,
            mt: 0,
            pt: 0,
            width: "100%"
          }}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 300px)" }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox" sx={THEAD_CELL_SX}>
                      <Checkbox
                        size="small"
                        checked={filteredDevices.length > 0 && selectedIds.length === filteredDevices.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#0EA5E9" } }}
                      />
                    </TableCell>
                    {filterProvider === "AWS" ? (
                      <>
                        <TableCell sx={THEAD_CELL_SX}>{t("Instance Name")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Instance ID")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Region")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Availability Zone")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Instance Type")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Platform")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("State")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Private IP")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Public IP")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("VPC")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Subnet")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("Launch Time")}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell sx={THEAD_CELL_SX}>{t("Device Name")}</TableCell>
                        <TableCell sx={THEAD_CELL_SX}>{t("IP Address")}</TableCell>
                        {visibleColumns.provider && <TableCell sx={THEAD_CELL_SX}>{t("Provider")}</TableCell>}
                        {visibleColumns.status && <TableCell sx={THEAD_CELL_SX}>{t("Status")}</TableCell>}
                        {visibleColumns.health && <TableCell sx={THEAD_CELL_SX}>{t("Health")}</TableCell>}
                        {visibleColumns.availability && <TableCell sx={THEAD_CELL_SX}>{t("Availability")}</TableCell>}
                        {visibleColumns.latency && <TableCell sx={THEAD_CELL_SX}>{t("Response Time")}</TableCell>}
                        {visibleColumns.vendor && <TableCell sx={THEAD_CELL_SX}>{t("Vendor")}</TableCell>}
                        {visibleColumns.lifecycle && <TableCell sx={THEAD_CELL_SX}>{t("Lifecycle")}</TableCell>}
                        {visibleColumns.lastPoll && <TableCell sx={THEAD_CELL_SX}>{t("Last Poll")}</TableCell>}
                      </>
                    )}
                    <TableCell sx={{ ...THEAD_CELL_SX, textAlign: "right" }}>{t("Actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={11} sx={{ ...ROW_CELL_SX, py: 8, textAlign: "center" }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredDevices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} sx={{ ...ROW_CELL_SX, py: 8, textAlign: "center", color: vars.textDim }}>
                        {t("No devices configured")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDevices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((d) => {
                      const isSelected = selectedIds.includes(d.id);
                      return (
                        <TableRow key={d.id} sx={glassRowHoverSx}>
                          <TableCell padding="checkbox" sx={ROW_CELL_SX}>
                            <Checkbox
                              size="small"
                              checked={isSelected}
                              onChange={(e) => handleSelectOne(d.id, e.target.checked)}
                              sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#0EA5E9" } }}
                            />
                          </TableCell>
                          {filterProvider === "AWS" ? (
                            <>
                              <TableCell sx={{ ...ROW_CELL_SX, fontWeight: 700 }}>
                                <Link to={`/monitoring/devices/${d.id}`} style={{ color: "#0EA5E9", textDecoration: "none" }}>
                                  {d.instanceName || d.deviceName || "-"}
                                </Link>
                              </TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.instanceId || "-"}</TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.region || "-"}</TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.availabilityZone || "-"}</TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.instanceType || "-"}</TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.cloudMetadata?.Platform || "-"}</TableCell>
                              <TableCell sx={ROW_CELL_SX}>
                                {(() => {
                                  let displayStatus = d.state || "UNKNOWN";
                                  const stateMap: Record<string, { status: string; type: "online" | "offline" | "warning" | "neutral" }> = {
                                    running: { status: "RUNNING", type: "online" },
                                    stopped: { status: "STOPPED", type: "neutral" },
                                    pending: { status: "PENDING", type: "warning" },
                                    stopping: { status: "STOPPING", type: "warning" },
                                    "shutting-down": { status: "SHUTTING-DOWN", type: "warning" },
                                    terminated: { status: "TERMINATED", type: "offline" },
                                  };
                                  const mapped = stateMap[displayStatus.toLowerCase()] || { status: displayStatus.toUpperCase(), type: "neutral" };
                                  const isOnline = mapped.type === "online";
                                  const isWarning = mapped.type === "warning";
                                  const isError = mapped.type === "offline";

                                  return (
                                    <Tooltip title={`AWS State: ${d.state || "unknown"}`}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {isOnline ? (
                                          <CheckCircleIcon sx={{ color: "#10B981", fontSize: 16 }} />
                                        ) : isError || isWarning ? (
                                          <ErrorIcon sx={{ color: isWarning ? "#F59E0B" : "#EF4444", fontSize: 16 }} />
                                        ) : (
                                          <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#94A3B8", ml: 0.25 }} />
                                        )}
                                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: isOnline ? "#10B981" : isWarning ? "#F59E0B" : isError ? "#EF4444" : "#94A3B8" }}>
                                          {mapped.status}
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  );
                                })()}
                              </TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.privateIp || d.ipAddress || "-"}</TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.publicIp || "-"}</TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.cloudMetadata?.VpcId || "-"}</TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.cloudMetadata?.SubnetId || "-"}</TableCell>
                              <TableCell sx={{ ...ROW_CELL_SX, fontSize: 11.5, color: vars.textDim }}>
                                {d.cloudMetadata?.LaunchTime ? new Date(d.cloudMetadata.LaunchTime).toLocaleString("en-IN") : "-"}
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell sx={{ ...ROW_CELL_SX, fontWeight: 700 }}>
                                <Link to={`/monitoring/devices/${d.id}`} style={{ color: "#0EA5E9", textDecoration: "none" }}>
                                  {d.deviceName}
                                </Link>
                              </TableCell>
                              <TableCell sx={ROW_CELL_SX}>{d.ipAddress}</TableCell>

                              {visibleColumns.provider && (
                                <TableCell sx={ROW_CELL_SX}>
                                  <Chip 
                                    size="small" 
                                    label={d.provider || "SNMP"} 
                                    sx={{ 
                                      height: 20, 
                                      fontSize: 10, 
                                      fontWeight: 700,
                                      backgroundColor: d.provider === "AWS" ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.1)",
                                      color: d.provider === "AWS" ? "#F59E0B" : "#FFF"
                                    }} 
                                  />
                                </TableCell>
                              )}

                              {visibleColumns.status && (
                                <TableCell sx={ROW_CELL_SX}>
                                  {(() => {
                                    let displayStatus = d.status;
                                    let isError = d.status === "OFFLINE";
                                    let isWarning = d.status === "WARNING";
                                    let isOnline = d.status === "ONLINE";
                                    let tooltipTitle = d.status !== "ONLINE" && d.lastPollError ? `Last Error: ${d.lastPollError}` : d.status;

                                    return (
                                      <Tooltip title={tooltipTitle}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          {isOnline ? (
                                            <CheckCircleIcon sx={{ color: "#10B981", fontSize: 16 }} />
                                          ) : isError || isWarning ? (
                                            <ErrorIcon sx={{ color: isWarning ? "#F59E0B" : "#EF4444", fontSize: 16 }} />
                                          ) : (
                                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#94A3B8", ml: 0.25 }} />
                                          )}
                                          <Typography sx={{ fontSize: 12, fontWeight: 700, color: isOnline ? "#10B981" : isWarning ? "#F59E0B" : isError ? "#EF4444" : "#94A3B8" }}>
                                            {displayStatus}
                                          </Typography>
                                        </Box>
                                      </Tooltip>
                                    );
                                  })()}
                                </TableCell>
                              )}

                              {visibleColumns.health && (
                                <TableCell sx={{ ...ROW_CELL_SX, fontWeight: 700, color: d.provider !== "SNMP" ? "#94A3B8" : (d.healthScore > 80 ? "#34D399" : d.healthScore > 50 ? "#FBBF24" : "#F87171") }}>
                                  {d.provider !== "SNMP" ? (
                                    <span>-</span>
                                  ) : (
                                    <Tooltip title={t("Device Health Score based on telemetry")}>
                                      <span>{d.healthScore}%</span>
                                    </Tooltip>
                                  )}
                                </TableCell>
                              )}

                              {visibleColumns.availability && (
                                <TableCell sx={{ ...ROW_CELL_SX, color: d.provider !== "SNMP" ? "#94A3B8" : "inherit" }}>
                                  {d.provider !== "SNMP" ? "-" : (d.availability ? `${d.availability.toFixed(1)}%` : "100.0%")}
                                </TableCell>
                              )}

                              {visibleColumns.latency && (
                                <TableCell sx={{ ...ROW_CELL_SX, fontWeight: 600, color: d.provider !== "SNMP" ? "#94A3B8" : (d.responseTime !== null ? (d.responseTime < 50 ? "#34D399" : d.responseTime < 150 ? "#FBBF24" : "#F87171") : "inherit") }}>
                                  {d.provider !== "SNMP" ? "-" : (d.responseTime !== null ? `${d.responseTime}ms` : "N/A")}
                                </TableCell>
                              )}

                              {visibleColumns.vendor && <TableCell sx={ROW_CELL_SX}>{d.vendor || "Generic"}</TableCell>}
                              {visibleColumns.lifecycle && (
                                <TableCell sx={ROW_CELL_SX}>
                                  <Typography sx={{ fontSize: 11.5, px: 1, py: 0.25, borderRadius: 0.5, display: "inline-block", backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                                    {d.lifecycleState}
                                  </Typography>
                                </TableCell>
                              )}
                              {visibleColumns.lastPoll && (
                                <TableCell sx={{ ...ROW_CELL_SX, fontSize: 11.5, color: vars.textDim }}>
                                  {d.lastPoll ? new Date(d.lastPoll).toLocaleString("en-IN") : "-"}
                                </TableCell>
                              )}
                            </>
                          )}

                          <TableCell sx={{ ...ROW_CELL_SX, textAlign: "right" }}>
                            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                              <Tooltip title={t("Poll Now")}>
                                <IconButton size="small" onClick={() => handleManualPoll(d.id)} sx={{ color: "#34D399" }}>
                                  <RefreshIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("Edit Credentials")}>
                                <IconButton size="small" onClick={() => handleOpenDialog(d)} sx={{ color: "#FFF" }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t("Delete Device")}>
                                <IconButton size="small" onClick={() => handleDelete(d.id)} sx={{ color: "#EF4444" }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={filteredDevices.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={PAGINATION_SX}
            />
          </Card>
      </Box>

      {/* Column Selector Dialog */}
      <Dialog open={colSelectorOpen} onClose={() => setColSelectorOpen(false)}>
        <DialogTitle sx={PREMIUM_DIALOG_TITLE_SX}>{t("Select Visible Columns")}</DialogTitle>
        <DialogContent sx={{ p: 2, backgroundColor: "#1E293B" }}>
          {Object.keys(visibleColumns).map((col) => (
            <Box key={col} sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                checked={(visibleColumns as any)[col]}
                onChange={(e) => setVisibleColumns((prev) => ({ ...prev, [col]: e.target.checked }))}
                sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#0EA5E9" } }}
              />
              <Typography sx={{ color: "#FFF", textTransform: "capitalize" }}>{col}</Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions sx={PREMIUM_DIALOG_ACTIONS_SX}>
          <Button onClick={() => setColSelectorOpen(false)} sx={{ color: "#FFF" }}>
            {t("Close")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add / Edit Device Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: PREMIUM_DIALOG_PAPER_SX,
        }}
      >
        <DialogTitle sx={PREMIUM_DIALOG_TITLE_SX}>
          {editDeviceId ? t("Edit SNMP Credentials") : t("Add SNMP Device")}
        </DialogTitle>
        <DialogContent dividers sx={PREMIUM_DIALOG_CONTENT_SX}>
          <Tabs
            value={dialogTab}
            onChange={(_, val) => setDialogTab(val)}
            variant="fullWidth"
            sx={{ mb: 2, borderBottom: "1px solid rgba(255,255,255,0.1)" }}
          >
            <Tab label={t("General")} sx={{ color: "#FFF", "&.Mui-selected": { color: "#0EA5E9" } }} />
            <Tab label={t("Location")} sx={{ color: "#FFF", "&.Mui-selected": { color: "#0EA5E9" } }} />
            <Tab label={t("SNMP Config")} sx={{ color: "#FFF", "&.Mui-selected": { color: "#0EA5E9" } }} />
          </Tabs>

          {dialogTab === 0 && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, pt: 1 }}>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Device Display Name *")}</Typography>
                <TextField fullWidth size="small" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("System Hostname")}</Typography>
                <TextField fullWidth size="small" value={hostname} onChange={(e) => setHostname(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("IP Address *")}</Typography>
                <TextField fullWidth size="small" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("MAC Address")}</Typography>
                <TextField fullWidth size="small" value={macAddress} onChange={(e) => setMacAddress(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Vendor")}</Typography>
                <FormControl size="small" fullWidth sx={inputStyle}>
                  <Select value={vendor} onChange={(e) => setVendor(e.target.value)} displayEmpty>
                    <MenuItem value="">{t("Select Vendor")}</MenuItem>
                    {VENDORS.map((v) => (
                      <MenuItem key={v} value={v}>{v}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Model")}</Typography>
                <TextField fullWidth size="small" value={model} onChange={(e) => setModel(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Serial Number")}</Typography>
                <TextField fullWidth size="small" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Firmware Version")}</Typography>
                <TextField fullWidth size="small" value={firmware} onChange={(e) => setFirmware(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("OS Version")}</Typography>
                <TextField fullWidth size="small" value={osVersion} onChange={(e) => setOsVersion(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Device Type")}</Typography>
                <FormControl size="small" fullWidth sx={inputStyle}>
                  <Select value={deviceType} onChange={(e) => setDeviceType(e.target.value)}>
                    {DEVICE_TYPES.map((tVal) => (
                      <MenuItem key={tVal} value={tVal}>{tVal}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Monitoring Profile")}</Typography>
                <FormControl size="small" fullWidth sx={inputStyle}>
                  <Select value={profileId} onChange={(e) => setProfileId(e.target.value)} displayEmpty>
                    <MenuItem value="">{t("Inherit Default profile")}</MenuItem>
                    {profiles.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Lifecycle State")}</Typography>
                <FormControl size="small" fullWidth sx={inputStyle}>
                  <Select value={lifecycleState} onChange={(e) => setLifecycleState(e.target.value)}>
                    {LIFECYCLE_STATES.map((state) => (
                      <MenuItem key={state} value={state}>{state}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          )}

          {dialogTab === 1 && (
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, pt: 1 }}>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Site Name")}</Typography>
                <TextField fullWidth size="small" value={site} onChange={(e) => setSite(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Rack Space / Cabinet ID")}</Typography>
                <TextField fullWidth size="small" value={rack} onChange={(e) => setRack(e.target.value)} sx={inputStyle} />
              </Box>
              <Box sx={{ gridColumn: "span 2" }}>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Chassis Location Info")}</Typography>
                <TextField fullWidth size="small" value={location} onChange={(e) => setLocation(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Latitude (Decimal Coordinates)")}</Typography>
                <TextField fullWidth size="small" value={latitude} onChange={(e) => setLatitude(e.target.value)} sx={inputStyle} />
              </Box>
              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Longitude (Decimal Coordinates)")}</Typography>
                <TextField fullWidth size="small" value={longitude} onChange={(e) => setLongitude(e.target.value)} sx={inputStyle} />
              </Box>
            </Box>
          )}

          {dialogTab === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5, pt: 1 }}>
              {/* Section 1: General Settings */}
              <Box>
                <Typography variant="subtitle2" sx={{ color: vars.accent, fontWeight: 700, mb: 1.5 }}>
                  {t("General SNMP Settings")}
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                  <Box>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("SNMP Version")}</Typography>
                    <FormControl size="small" fullWidth sx={inputStyle}>
                      <Select value={snmpVersion} onChange={(e) => setSnmpVersion(e.target.value)}>
                        <MenuItem value="v1">SNMP v1</MenuItem>
                        <MenuItem value="v2c">SNMP v2c</MenuItem>
                        <MenuItem value="v3">SNMP v3</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("SNMP Port")}</Typography>
                    <TextField fullWidth size="small" value={port} onChange={(e) => setPort(e.target.value)} sx={inputStyle} />
                  </Box>
                </Box>
              </Box>

              {snmpVersion !== "v3" ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                  <Box>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("SNMP Read Community String")}</Typography>
                    <TextField fullWidth size="small" value={community} onChange={(e) => setCommunity(e.target.value)} sx={inputStyle} />
                  </Box>
                  <Box>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Timeout (ms)")}</Typography>
                    <TextField fullWidth size="small" value={timeout} onChange={(e) => setTimeoutVal(e.target.value)} sx={inputStyle} />
                  </Box>
                  <Box>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Retries")}</Typography>
                    <TextField fullWidth size="small" value={retries} onChange={(e) => setRetries(e.target.value)} sx={inputStyle} />
                  </Box>
                </Box>
              ) : (
                <>
                  {/* Section 2: Security credentials */}
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: vars.accent, fontWeight: 700, mb: 1.5 }}>
                      {t("Security Credentials")}
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                      <Box>
                        <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("SNMPv3 Username *")}</Typography>
                        <TextField fullWidth size="small" value={v3Username} onChange={(e) => setV3Username(e.target.value)} sx={inputStyle} />
                      </Box>
                      <Box>
                        <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Security Level")}</Typography>
                        <FormControl size="small" fullWidth sx={inputStyle}>
                          <Select value={v3SecurityLevel} onChange={(e) => setV3SecurityLevel(e.target.value)}>
                            <MenuItem value="noAuthNoPriv">noAuthNoPriv</MenuItem>
                            <MenuItem value="authNoPriv">authNoPriv</MenuItem>
                            <MenuItem value="authPriv">authPriv</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  </Box>

                  {/* Section 3: Authentication (only show if authNoPriv or authPriv) */}
                  {(v3SecurityLevel === "authNoPriv" || v3SecurityLevel === "authPriv") && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: vars.accent, fontWeight: 700, mb: 1.5 }}>
                        {t("Authentication Protocol Settings")}
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                        <Box>
                          <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Authentication Protocol")}</Typography>
                          <FormControl size="small" fullWidth sx={inputStyle}>
                            <Select value={v3AuthProtocol} onChange={(e) => setV3AuthProtocol(e.target.value)}>
                              <MenuItem value="MD5">MD5</MenuItem>
                              <MenuItem value="SHA">SHA</MenuItem>
                              <MenuItem value="SHA224">SHA-224</MenuItem>
                              <MenuItem value="SHA256">SHA-256</MenuItem>
                              <MenuItem value="SHA384">SHA-384</MenuItem>
                              <MenuItem value="SHA512">SHA-512</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <Box>
                          <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Authentication Password *")}</Typography>
                          <TextField
                            fullWidth
                            type={showAuthPass ? "text" : "password"}
                            size="small"
                            value={v3AuthPassword}
                            onChange={(e) => setV3AuthPassword(e.target.value)}
                            sx={inputStyle}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={() => setShowAuthPass(!showAuthPass)} sx={{ color: "rgba(255,255,255,0.6)" }}>
                                    {showAuthPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      navigator.clipboard.writeText(v3AuthPassword);
                                      toast.success(t("Password copied"));
                                    }}
                                    sx={{ color: "rgba(255,255,255,0.6)" }}
                                  >
                                    <ContentCopyIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {v3AuthPassword && (
                            <Typography sx={{ fontSize: 10, mt: 0.5, color: getPasswordStrength(v3AuthPassword).color, fontWeight: 700 }}>
                              {t("Strength")}: {getPasswordStrength(v3AuthPassword).text}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Section 4: Encryption/Privacy (only show if authPriv) */}
                  {v3SecurityLevel === "authPriv" && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: vars.accent, fontWeight: 700, mb: 1.5 }}>
                        {t("Privacy / Encryption Settings")}
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                        <Box>
                          <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Privacy Protocol")}</Typography>
                          <FormControl size="small" fullWidth sx={inputStyle}>
                            <Select value={v3PrivProtocol} onChange={(e) => setV3PrivProtocol(e.target.value)}>
                              <MenuItem value="DES">DES</MenuItem>
                              <MenuItem value="AES128">AES128</MenuItem>
                              <MenuItem value="AES192">AES192</MenuItem>
                              <MenuItem value="AES256">AES256</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                        <Box>
                          <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Privacy Password *")}</Typography>
                          <TextField
                            fullWidth
                            type={showPrivPass ? "text" : "password"}
                            size="small"
                            value={v3PrivPassword}
                            onChange={(e) => setV3PrivPassword(e.target.value)}
                            sx={inputStyle}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton size="small" onClick={() => setShowPrivPass(!showPrivPass)} sx={{ color: "rgba(255,255,255,0.6)" }}>
                                    {showPrivPass ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      navigator.clipboard.writeText(v3PrivPassword);
                                      toast.success(t("Password copied"));
                                    }}
                                    sx={{ color: "rgba(255,255,255,0.6)" }}
                                  >
                                    <ContentCopyIcon />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                          {v3PrivPassword && (
                            <Typography sx={{ fontSize: 10, mt: 0.5, color: getPasswordStrength(v3PrivPassword).color, fontWeight: 700 }}>
                              {t("Strength")}: {getPasswordStrength(v3PrivPassword).text}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Section 5: Collapsible Advanced Settings */}
                  <Box>
                    <Button
                      size="small"
                      onClick={() => setShowAdvancedSnmp(!showAdvancedSnmp)}
                      sx={{ color: vars.accent, textTransform: "none", fontWeight: 700, p: 0 }}
                    >
                      {showAdvancedSnmp ? t("Hide Advanced Settings") : t("Show Advanced Settings")}
                    </Button>

                    {showAdvancedSnmp && (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2, p: 2, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(255,255,255,0.01)" }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Context Name")}</Typography>
                            <TextField fullWidth size="small" value={v3ContextName} onChange={(e) => setV3ContextName(e.target.value)} sx={inputStyle} />
                          </Box>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Context Engine ID")}</Typography>
                            <TextField fullWidth size="small" value={v3EngineId} onChange={(e) => setV3EngineId(e.target.value)} sx={inputStyle} />
                          </Box>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Timeout (Milliseconds)")}</Typography>
                            <TextField fullWidth size="small" value={timeout} onChange={(e) => setTimeoutVal(e.target.value)} sx={inputStyle} />
                          </Box>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Retry Limit")}</Typography>
                            <TextField fullWidth size="small" value={retries} onChange={(e) => setRetries(e.target.value)} sx={inputStyle} />
                          </Box>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Polling Interval (Seconds)")}</Typography>
                            <TextField fullWidth size="small" value={pollInterval} onChange={(e) => setPollInterval(e.target.value)} placeholder={t("Inherit profile")} sx={inputStyle} />
                          </Box>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Preferred Operation")}</Typography>
                            <FormControl size="small" fullWidth sx={inputStyle}>
                              <Select value={preferredOperation} onChange={(e) => setPreferredOperation(e.target.value)}>
                                <MenuItem value="GET">SNMP GET</MenuItem>
                                <MenuItem value="GETNEXT">SNMP GETNEXT</MenuItem>
                                <MenuItem value="GETBULK">SNMP GETBULK</MenuItem>
                                <MenuItem value="WALK">SNMP WALK</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>

                        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />

                        <Box>
                          <Typography variant="subtitle2" sx={{ color: "#FFF", fontWeight: 700, mb: 1.5 }}>
                            {t("Feature Flags")}
                          </Typography>
                          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                            <FormControlLabel
                              control={<Switch size="small" checked={enableBulkWalk} onChange={(e) => setEnableBulkWalk(e.target.checked)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0EA5E9" } }} />}
                              label={<Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{t("Enable Bulk Walk")}</Typography>}
                            />
                            <FormControlLabel
                              control={<Switch size="small" checked={enableInterfaceDiscovery} onChange={(e) => setEnableInterfaceDiscovery(e.target.checked)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0EA5E9" } }} />}
                              label={<Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{t("Enable Interface Discovery")}</Typography>}
                            />
                            <FormControlLabel
                              control={<Switch size="small" checked={enableHistoricalTelemetry} onChange={(e) => setEnableHistoricalTelemetry(e.target.checked)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0EA5E9" } }} />}
                              label={<Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{t("Enable Historical Telemetry")}</Typography>}
                            />
                            <FormControlLabel
                              control={<Switch size="small" checked={enablePerformancePolling} onChange={(e) => setEnablePerformancePolling(e.target.checked)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0EA5E9" } }} />}
                              label={<Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{t("Enable Performance Polling")}</Typography>}
                            />
                            <FormControlLabel
                              control={<Switch size="small" checked={enableEnvironmentalPolling} onChange={(e) => setEnableEnvironmentalPolling(e.target.checked)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0EA5E9" } }} />}
                              label={<Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{t("Enable Environmental Polling")}</Typography>}
                            />
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}

          {/* Test connection report panel */}
          {testingConnection && (
            <Box sx={{ mt: 3, p: 2.5, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.1)", bgcolor: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={20} sx={{ color: "#0EA5E9" }} />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#FFF" }}>{t("Running Diagnostics")}</Typography>
                <Typography sx={{ fontSize: 11.5, color: vars.textDim, mt: 0.25 }}>{testProgressStep}</Typography>
              </Box>
            </Box>
          )}

          {testResult && !testingConnection && (
            <Box sx={{ mt: 3, p: 2.5, borderRadius: 1.5, border: `1px solid ${testResult.success ? "#10B981" : "#EF4444"}`, bgcolor: testResult.success ? "rgba(16,185,129,0.03)" : "rgba(239,68,68,0.03)" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 900, color: testResult.success ? "#34D399" : "#F87171", mb: 2, fontSize: 14 }}>
                {testResult.success ? t("Connection Successful") : t("Connection Failed")}
              </Typography>
              
              {testResult.success ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("Response Time")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontWeight: 700 }}>{testResult.responseTime} ms</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("SNMP Version")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontWeight: 700 }}>{snmpVersion}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("Hostname")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontWeight: 700 }}>{hostname || ipAddress}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("sysName")}</Typography>
                    <Typography sx={{ fontSize: 12.5, color: "#FFF", fontWeight: 700 }}>{testResult.sysName || "-"}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: "span 2" }}>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("sysObjectID")}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "#FFF", fontFamily: "monospace" }}>{testResult.sysObjectID || "-"}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: "span 2" }}>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("sysDescr")}</Typography>
                    <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.85)", fontStyle: "italic", whiteSpace: "pre-wrap" }}>{testResult.sysDescr || "-"}</Typography>
                  </Box>
                  <Box sx={{ gridColumn: "span 2" }}>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("sysUpTime")}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#FFF" }}>{testResult.sysUpTime || "-"}</Typography>
                  </Box>
                  {snmpVersion === "v3" && (
                    <>
                      <Box>
                        <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("Engine ID")}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#FFF", fontFamily: "monospace" }}>{v3EngineId || "-"}</Typography>
                      </Box>
                      <Box>
                        <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("Security Level")}</Typography>
                        <Typography sx={{ fontSize: 12, color: "#FFF" }}>{v3SecurityLevel || "-"}</Typography>
                      </Box>
                    </>
                  )}
                  <Box sx={{ gridColumn: "span 2" }}>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak, mb: 0.5 }}>{t("Supported Operations")}</Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {["GET", "GETNEXT", ...(snmpVersion !== "v1" ? ["GETBULK"] : []), "WALK"].map(op => (
                        <Typography key={op} sx={{ fontSize: 10, fontWeight: 800, px: 1, py: 0.25, borderRadius: 0.5, border: "1px solid #0EA5E9", color: "#0EA5E9", bgcolor: "rgba(14,165,233,0.05)" }}>
                          {op}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("Diagnostic Error Code")}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: "#F87171", fontWeight: 700 }}>
                        {(() => {
                          const err = String(testResult.error || "").toLowerCase();
                          if (err.includes("timeout") || err.includes("no response")) return t("Timeout");
                          if (err.includes("auth") || err.includes("decrypt") || err.includes("security") || err.includes("passphrase")) return t("Authentication Error");
                          if (err.includes("authorization") || err.includes("accessdenied") || err.includes("notwritable")) return t("Authorization Error");
                          if (err.includes("unknown user") || err.includes("usmuser") || err.includes("user")) return t("Unknown User");
                          if (err.includes("unreachable") || err.includes("route") || err.includes("network")) return t("Network Unreachable");
                          return t("Unknown Error");
                        })()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 10.5, color: vars.textWeak }}>{t("Timeout Mode")}</Typography>
                      <Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{timeout} ms</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 10.5, color: vars.textWeak, mb: 0.5 }}>{t("Raw CLI Output Details")}</Typography>
                    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: "rgba(0,0,0,0.4)", maxHeight: 180, overflowY: "auto", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <Typography sx={{ fontSize: 11, fontFamily: "monospace", color: "#FCA5A5", whiteSpace: "pre-wrap" }}>
                        {testResult.error || t("No stderr command output returned")}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={PREMIUM_DIALOG_ACTIONS_SX}>
          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={testingConnection}
            sx={{
              borderColor: "#10B981",
              color: "#34D399",
              textTransform: "none",
              mr: "auto",
              "&:hover": { borderColor: "#059669", backgroundColor: "rgba(16,185,129,0.1)" },
            }}
          >
            {testingConnection ? <CircularProgress size={16} color="inherit" /> : t("Test Connection")}
          </Button>

          <Button onClick={() => setDialogOpen(false)} sx={{ color: "rgba(255,255,255,0.7)" }}>
            {t("Cancel")}
          </Button>
          <Button variant="contained" onClick={handleSave} disabled={!isFormValid} sx={{ ...PREMIUM_ACTION_BUTTON_SX, opacity: isFormValid ? 1 : 0.5 }}>
            {t("Save Device")}
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
