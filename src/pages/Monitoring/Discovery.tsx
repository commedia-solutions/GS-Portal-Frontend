// src/pages/Monitoring/Discovery.tsx
import { useState, useEffect, useMemo, useRef } from "react";
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
  Switch,
  FormControlLabel,
  LinearProgress,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import StopIcon from "@mui/icons-material/Stop";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SpeedIcon from "@mui/icons-material/Speed";
import StorageIcon from "@mui/icons-material/Storage";
import NetworkPingIcon from "@mui/icons-material/NetworkPing";
import DevicesIcon from "@mui/icons-material/Devices";
import HistoryIcon from "@mui/icons-material/History";
import WarningIcon from "@mui/icons-material/Warning";
import Timeline from "@mui/lab/Timeline";
import TimelineItem, { timelineItemClasses } from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
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

type DiscoveredNode = {
  id: number;
  hostname: string;
  ipAddress: string;
  vendor: string;
  model: string;
  deviceType: string;
  responseTime: number;
  snmpVersion: string;
  status: string;
  discoverySource: string;
  isDuplicate?: boolean;
  sysName?: string;
  sysDescr?: string;
  sysObjectID?: string;
  sysUpTime?: string;
  macAddress?: string;
  osVersion?: string;
  firmwareVersion?: string;
  serialNumber?: string;
  
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

type ScanStats = {
  networksScanned: number;
  devicesFound: number;
  reachableDevices: number;
  unreachableDevices: number;
  discoverySessions: number;
  avgScanTime: number;
};

type Profile = {
  id: number;
  name: string;
};

type ScanProgress = {
  id: string | null;
  sessionName: string;
  cidr: string;
  mode: string;
  status: string; // idle, running, paused, stopped, completed
  totalIps: number;
  scannedIps: number;
  discoveredDevices: DiscoveredNode[];
  startTime: number | null;
  currentIp: string;
  elapsedTime: number;
  remainingTime: number;
  scanSpeed: number;
  reachableCount: number;
  unreachableCount: number;
  activeWorkers: number;
  events: { timestamp: number; message: string; type: 'info' | 'success' | 'warning' | 'error' }[];
};

const DEVICE_TYPES = ["Router", "Switch", "Server", "Gateway", "Modem", "Ground Station Controller", "Safran Orion", "UPS", "Other"];
const VENDORS = ["Cisco", "Juniper", "Dell", "HP", "Linux", "Windows", "Safran", "Generic"];

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

export default function MonitoringDiscovery() {
  const { t } = useI18n();
  const [stats, setStats] = useState<ScanStats>({
    networksScanned: 0,
    devicesFound: 0,
    reachableDevices: 0,
    unreachableDevices: 0,
    discoverySessions: 0,
    avgScanTime: 0,
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [awsProfiles, setAwsProfiles] = useState<any[]>([]);
  const [discoveredNodes, setDiscoveredNodes] = useState<DiscoveredNode[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Discovery Configuration Fields
  const [discoverySource, setDiscoverySource] = useState("AWS");
  const [discoveryName, setDiscoveryName] = useState("Corporate Network Sweep");
  const [cidr, setCidr] = useState("192.168.1.0/24");
  const [discoveryMode, setDiscoveryMode] = useState("SNMP + Ping");

  // AWS Configuration
  const [awsProfile, setAwsProfile] = useState("");
  const [awsProfileDialogOpen, setAwsProfileDialogOpen] = useState(false);
  const [awsProfileForm, setAwsProfileForm] = useState({ id: "", profileName: "", accessKey: "", secretKey: "", region: "us-east-1", description: "" });
  const [isSavingAwsProfile, setIsSavingAwsProfile] = useState(false);
  const [isDeletingAwsProfile, setIsDeletingAwsProfile] = useState(false);
  
  // SNMP Credentials
  const [snmpVersion, setSnmpVersion] = useState("v2c");
  const [community, setCommunity] = useState("public");
  const [v3Username, setV3Username] = useState("");
  const [v3SecurityLevel, setV3SecurityLevel] = useState("noAuthNoPriv");
  const [v3AuthProtocol, setV3AuthProtocol] = useState("SHA");
  const [v3AuthPassword, setV3AuthPassword] = useState("");
  const [v3PrivProtocol, setV3PrivProtocol] = useState("AES128");
  const [v3PrivPassword, setV3PrivPassword] = useState("");
  const [v3ContextName, setV3ContextName] = useState("");
  const [v3EngineId, setV3EngineId] = useState("");

  const [showAuthPass, setShowAuthPass] = useState(false);
  const [showPrivPass, setShowPrivPass] = useState(false);

  // Tuning Parameters
  const [port, setPort] = useState("161");
  const [timeout, setTimeoutVal] = useState("1000");
  const [retries, setRetries] = useState("1");
  const [concurrentWorkers, setConcurrentWorkers] = useState("20");
  const [delayBetweenRequests, setDelayBetweenRequests] = useState("0");
  
  // Post-scan triggers
  const [autoRegisterDevices, setAutoRegisterDevices] = useState(false);
  const [autoAssignProfile, setAutoAssignProfile] = useState("");

  // Scan live status state
  const [scanState, setScanState] = useState<ScanProgress>({
    id: null,
    sessionName: "",
    cidr: "",
    mode: "SNMP + Ping",
    status: "idle",
    totalIps: 0,
    scannedIps: 0,
    discoveredDevices: [],
    startTime: null,
    currentIp: "",
    elapsedTime: 0,
    remainingTime: 0,
    scanSpeed: 0,
    reachableCount: 0,
    unreachableCount: 0,
    activeWorkers: 0,
    events: [],
  });

  // Table & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // Registration Dialog (Promote Discovered to Inventory)
  const [promoDialogOpen, setPromoDialogOpen] = useState(false);
  const [promoDeviceName, setPromoDeviceName] = useState("");
  const [promoIp, setPromoIp] = useState("");
  const [promoVendor, setPromoVendor] = useState("");
  const [promoModel, setPromoModel] = useState("");
  const [promoMac, setPromoMac] = useState("");
  const [promoVersion, setPromoVersion] = useState("v2c");
  const [promoType, setPromoType] = useState("Other");
  const [promoProfile, setPromoProfile] = useState("");
  const [promoNode, setPromoNode] = useState<DiscoveredNode | null>(null);

  const pollIntervalRef = useRef<any>(null);

  const fetchStatsAndHistory = async () => {
    try {
      const [statsResp, histResp, profResp, awsProfResp] = await Promise.all([
        api.get<{ success: boolean; stats: ScanStats }>("/api/monitoring/discovery/stats"),
        api.get<{ success: boolean; history: any[] }>("/api/monitoring/discovery/history"),
        api.get<{ success: boolean; profiles: Profile[] }>("/api/monitoring/profiles").catch(() => ({ success: false, profiles: [] })),
        api.get<{ success: boolean; profiles: any[] }>("/api/monitoring/aws/profiles").catch(() => ({ success: false, profiles: [] }))
      ]);

      if (statsResp && statsResp.success) {
        setStats(statsResp.stats);
      }
      if (histResp && histResp.success) {
        setHistory(histResp.history || []);
      }
      if (profResp && profResp.success) {
        setProfiles(profResp.profiles || []);
      }
      if (awsProfResp && awsProfResp.success) {
        setAwsProfiles(awsProfResp.profiles || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAwsProfilesOnly = async () => {
    try {
      const awsProfResp = await api.get<{ success: boolean; profiles: any[] }>("/api/monitoring/aws/profiles").catch(() => null);
      if (awsProfResp && awsProfResp.success) {
        setAwsProfiles(awsProfResp.profiles || []);
      }
    } catch (e) { console.error(e); }
  };

  const handleOpenAwsProfile = (profile?: any) => {
    if (profile) {
      setAwsProfileForm({
        id: profile.id,
        profileName: profile.profileName,
        accessKey: profile.accessKey,
        secretKey: "****************",
        region: profile.region || "us-east-1",
        description: profile.description || "",
      });
    } else {
      setAwsProfileForm({ id: "", profileName: "", accessKey: "", secretKey: "", region: "us-east-1", description: "" });
    }
    setAwsProfileDialogOpen(true);
  };

  const handleSaveAwsProfile = async () => {
    try {
      if (!awsProfileForm.profileName || !awsProfileForm.accessKey || !awsProfileForm.secretKey) {
        toast.error(t("Please fill in all required fields"));
        return;
      }
      if (!awsProfileForm.region) {
        toast.error(t("Region is required."));
        return;
      }
      setIsSavingAwsProfile(true);
      if (awsProfileForm.id) {
        const response = await api.put<any>(`/api/monitoring/aws/profiles/${awsProfileForm.id}`, awsProfileForm);
        if (response.success) {
          toast.success(t("Profile Updated"));
          await fetchAwsProfilesOnly();
          setAwsProfileDialogOpen(false);
        }
      } else {
        const response = await api.post<any>("/api/monitoring/aws/profiles", awsProfileForm);
        if (response.success) {
          toast.success(t("Profile Created"));
          await fetchAwsProfilesOnly();
          if (response.profile && response.profile.id) {
            setAwsProfile(response.profile.id.toString());
          }
          setAwsProfileDialogOpen(false);
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || t("Validation Failed"));
    } finally {
      setIsSavingAwsProfile(false);
    }
  };

  const handleDeleteAwsProfile = async () => {
    if (!awsProfileForm.id) return;
    if (!window.confirm(`Delete AWS Profile: ${awsProfileForm.profileName}?\nThis action cannot be undone.`)) return;
    try {
      setIsDeletingAwsProfile(true);
      const response = await api.delete<any>(`/api/monitoring/aws/profiles/${awsProfileForm.id}`);
      if (response.success) {
        toast.success(t("Profile Deleted"));
        await fetchAwsProfilesOnly();
        if (awsProfile === awsProfileForm.id.toString()) {
          setAwsProfile("");
        }
        setAwsProfileDialogOpen(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || t("Network Error"));
    } finally {
      setIsDeletingAwsProfile(false);
    }
  };

  const checkStatus = async () => {
    try {
      const resp = await api.get<{ success: boolean; status: ScanProgress }>("/api/monitoring/discovery/status");
      if (resp && resp.success) {
        const live = resp.status;
        setScanState(live);
        
        // Use the strict standardized property
        if (live.discoveredDevices) {
          setDiscoveredNodes(live.discoveredDevices);
        }

        if (live.status !== "running" && live.status !== "paused") {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          fetchStatsAndHistory();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatsAndHistory();
    checkStatus();
    setLoading(false);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  const handleStartScan = async () => {
    if (discoverySource === "AWS") {
      if (!awsProfile) {
        toast.error(t("AWS Credential Profile is required"));
        return;
      }
      try {
        const payload = { profileId: parseInt(awsProfile), resourceType: "EC2" };
        const response = await api.post<any>("/api/monitoring/aws/discovery/start", payload);
        if (response.success && response.results) {
           setDiscoveredNodes(response.results.instances || []);
           toast.success(t(`AWS Discovery completed: Found ${response.results.instancesFound || 0} instances across ${response.results.regionsScanned || 0} regions`));
        }
      } catch(err: any) {
        toast.error(err.message || t("AWS Discovery failed"));
      }
      return;
    }

    if (!cidr) {
      toast.error(t("CIDR Subnet range is required"));
      return;
    }

    if (snmpVersion === "v3" || snmpVersion === "3") {
      if (!v3Username) {
        toast.error(t("SNMPv3 Username is required"));
        return;
      }
      if (v3SecurityLevel !== "noAuthNoPriv") {
        if (!v3AuthPassword) {
           toast.error(t("SNMPv3 Auth Password is required"));
           return;
        }
      }
      if (v3SecurityLevel === "authPriv") {
        if (!v3PrivPassword) {
           toast.error(t("SNMPv3 Priv Password is required"));
           return;
        }
      }
    }

    try {
      const payload = {
        discoveryName,
        cidr,
        discoveryMode,
        snmpVersion,
        community,
        v3Username,
        v3SecurityLevel,
        v3AuthProtocol,
        v3AuthPassword,
        v3PrivProtocol,
        v3PrivPassword,
        v3ContextName,
        v3EngineId,
        port: parseInt(port) || 161,
        timeout: parseInt(timeout) || 1000,
        retries: parseInt(retries) || 1,
        concurrentWorkers: parseInt(concurrentWorkers) || 10,
        delayBetweenRequests: parseInt(delayBetweenRequests) || 0,
        autoRegisterDevices,
        autoAssignProfile,
      };

      const response = await api.post<{ success: boolean; scan: ScanProgress }>("/api/monitoring/discovery/start", payload);
      if (response.success) {
        toast.success(t("Discovery scan started"));
        setDiscoveredNodes([]);
        setSelectedIds([]);
        checkStatus();

        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(checkStatus, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to start scan session"));
    }
  };

  const handleStopScan = async () => {
    try {
      const response = await api.post<{ success: boolean }>("/api/monitoring/discovery/stop");
      if (response.success) {
        toast.success(t("Scan stopped by operator"));
        checkStatus();
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to stop scan"));
    }
  };

  const handlePauseScan = async () => {
    try {
      const response = await api.post<{ success: boolean }>("/api/monitoring/discovery/pause");
      if (response.success) {
        toast.success(t("Scan paused"));
        checkStatus();
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to pause scan"));
    }
  };

  const handleResumeScan = async () => {
    try {
      const response = await api.post<{ success: boolean }>("/api/monitoring/discovery/resume");
      if (response.success) {
        toast.success(t("Scan resumed"));
        checkStatus();
      }
    } catch (err: any) {
      toast.error(err.message || t("Failed to resume scan"));
    }
  };

  // Promoting Device
  const handleOpenPromoDialog = (node: DiscoveredNode) => {
    setPromoDeviceName(node.hostname || node.deviceName || node.instanceName || "");
    setPromoIp(node.ipAddress || node.privateIp || "");
    setPromoVendor(node.vendor || node.provider || "");
    setPromoModel(node.model || node.instanceType || "");
    setPromoMac(node.macAddress || "");
    setPromoVersion(node.snmpVersion && node.snmpVersion !== "None" ? node.snmpVersion : "v2c");
    setPromoType(node.deviceType || node.resourceType || "Other");
    setPromoProfile("");
    setPromoNode(node);
    setPromoDialogOpen(true);
  };

  const handleSavePromoted = async () => {
    try {
      if ((promoNode?.discoverySource === "AWS" || promoNode?.provider === "AWS") && promoNode) {
        // Prepare the payload preserving the AWS identity and metadata, but applying user edits
        const awsPayload = {
          ...promoNode,
          instanceName: promoDeviceName,
          privateIp: promoIp,
          profileId: promoProfile ? parseInt(promoProfile) : promoNode.profileId
        };
        
        await api.post("/api/monitoring/aws/register", [awsPayload]);
        toast.success(t("AWS Device promoted to main inventory successfully"));
        setPromoDialogOpen(false);
        return;
      }

      const isV3 = promoVersion === "v3" || promoVersion === "3";
      const payload = {
        deviceName: promoDeviceName,
        ipAddress: promoIp,
        macAddress: promoMac || null,
        vendor: promoVendor || null,
        model: promoModel || null,
        snmpVersion: promoVersion,
        deviceType: promoType,
        profileId: promoProfile ? parseInt(promoProfile) : null,
        status: "ONLINE",
        hostname: promoNode?.hostname || null,
        sysName: promoNode?.sysName || null,
        sysDescr: promoNode?.sysDescr || null,
        sysObjectID: promoNode?.sysObjectID || null,
        sysUpTime: promoNode?.sysUpTime || null,
        osVersion: promoNode?.osVersion || null,
        firmwareVersion: promoNode?.firmwareVersion || null,
        serialNumber: promoNode?.serialNumber || null,
        credentials: {
          community: isV3 ? "" : community,
          username: isV3 ? v3Username : "",
          securityLevel: isV3 ? v3SecurityLevel : "noAuthNoPriv",
          authProtocol: isV3 ? v3AuthProtocol : "MD5",
          authPassword: isV3 ? v3AuthPassword : "",
          privProtocol: isV3 ? v3PrivProtocol : "DES",
          privPassword: isV3 ? v3PrivPassword : "",
          contextName: isV3 ? v3ContextName : "",
          engineId: isV3 ? v3EngineId : "",
          port: parseInt(port) || 161,
          timeout: parseInt(timeout) || 2500,
          retries: parseInt(retries) || 1,
        },
      };

      const resp = await api.post<{ success: boolean }>("/api/monitoring/devices", payload);
      if (resp.success) {
        toast.success(t("Device promoted to main inventory successfully"));
        setPromoDialogOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || t("Promotion failed"));
    }
  };

  // Bulk Promoting
  const handleBulkRegister = async () => {
    if (selectedIds.length === 0) return;
    toast.loading(t("Promoting selected nodes..."), { id: "bulk-promo" });
    try {
      for (const id of selectedIds) {
        const node = discoveredNodes.find((n) => (n.instanceId ?? n.id) === id);
        if (node) {
          if (discoverySource === "AWS") {
             // For AWS, hit the AWS registration endpoint
             await api.post("/api/monitoring/aws/register", [node]);
          } else {
             const v = node.snmpVersion !== "None" ? node.snmpVersion : "v2c";
             const isV3 = v === "v3" || v === "3";
             const payload = {
               deviceName: node.hostname,
               ipAddress: node.ipAddress,
               vendor: node.vendor,
               model: node.model,
               snmpVersion: v,
               deviceType: node.deviceType,
               status: "ONLINE",
               hostname: node.hostname || null,
               sysName: node.sysName || null,
               sysDescr: node.sysDescr || null,
               sysObjectID: node.sysObjectID || null,
               sysUpTime: node.sysUpTime || null,
               macAddress: node.macAddress || null,
               osVersion: node.osVersion || null,
               firmwareVersion: node.firmwareVersion || null,
               serialNumber: node.serialNumber || null,
               credentials: {
                 community: isV3 ? "" : community,
                 username: isV3 ? v3Username : "",
                 securityLevel: isV3 ? v3SecurityLevel : "noAuthNoPriv",
                 authProtocol: isV3 ? v3AuthProtocol : "MD5",
                 authPassword: isV3 ? v3AuthPassword : "",
                 privProtocol: isV3 ? v3PrivProtocol : "DES",
                 privPassword: isV3 ? v3PrivPassword : "",
                 contextName: isV3 ? v3ContextName : "",
                 engineId: isV3 ? v3EngineId : "",
                 port: parseInt(port) || 161,
                 timeout: parseInt(timeout) || 2500,
                 retries: parseInt(retries) || 1,
               },
             };
             await api.post("/api/monitoring/devices", payload);
          }
        }
      }
      toast.success(t("Successfully registered devices"), { id: "bulk-promo" });
      setSelectedIds([]);
    } catch (e: any) {
      toast.error(e.message || t("Bulk register error"), { id: "bulk-promo" });
    }
  };

  const handleIgnoreSelected = () => {
    if (selectedIds.length === 0) return;
    setDiscoveredNodes((prev) => prev.filter((n) => !selectedIds.includes(n.instanceId ?? n.id)));
    setSelectedIds([]);
    toast.success(t("Ignored selected devices"));
  };

  // CSV/JSON Export
  const handleExport = (format: "csv" | "json") => {
    if (format === "json") {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(discoveredNodes, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `discovery_results_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.removeChild(downloadAnchor);
      return;
    }

    const headers = [t("Hostname/Name"), t("IP"), t("Vendor/Provider"), t("Model/InstanceType"), t("Type"), t("Response Time"), t("SNMP Version"), t("Source")];
    const rows = discoveredNodes.map((n) => [
      n.hostname || n.deviceName || n.instanceName || "-",
      n.ipAddress || n.privateIp || "-",
      n.vendor || n.provider || "-",
      n.model || n.instanceType || "-",
      n.deviceType || n.resourceType || "-",
      n.responseTime != null ? `${n.responseTime}ms` : "-",
      n.snmpVersion || "-",
      n.discoverySource || n.provider || "-",
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\r\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `discovery_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtering Results
  const filteredNodes = useMemo(() => {
    return discoveredNodes.filter((n) => {
      const searchLower = String(searchQuery ?? "").toLowerCase();
      const matchSearch = String(n.hostname ?? n.deviceName ?? "").toLowerCase().includes(searchLower) || 
                          String(n.ipAddress ?? "").toLowerCase().includes(searchLower);
      const matchVendor = !filterVendor || n.vendor === filterVendor;
      const matchType = !filterType || n.deviceType === filterType;
      const matchStatus = !filterStatus || n.status === filterStatus;
      return matchSearch && matchVendor && matchType && matchStatus;
    });
  }, [discoveredNodes, searchQuery, filterVendor, filterType, filterStatus]);

  const statItems = [
    { title: t("Networks Scanned"), value: stats.networksScanned, icon: <StorageIcon sx={{ color: "#3B82F6" }} /> },
    { title: t("Devices Found"), value: stats.devicesFound, icon: <DevicesIcon sx={{ color: "#10B981" }} /> },
    { title: t("Reachable Devices"), value: stats.reachableDevices, icon: <NetworkPingIcon sx={{ color: "#34D399" }} /> },
    { title: t("Unreachable Devices"), value: stats.unreachableDevices, icon: <StopIcon sx={{ color: "#EF4444" }} /> },
    { title: t("Discovery Sessions"), value: stats.discoverySessions, icon: <HistoryIcon sx={{ color: "#8B5CF6" }} /> },
    { title: t("Average Scan Time"), value: `${stats.avgScanTime}s`, icon: <SpeedIcon sx={{ color: "#F59E0B" }} /> },
  ];

  const progressPercentage = scanState.totalIps > 0 ? Math.round((scanState.scannedIps / scanState.totalIps) * 100) : 0;

  return (
    <MainLayout title={t("Network Discovery")}>
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
        {/* Top Stats Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr", md: "repeat(6, 1fr)" },
            gap: 2.5,
            mb: 3,
          }}
        >
          {statItems.map((item, idx) => (
            <Card key={idx} sx={{ ...PREMIUM_CARD_SX, p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(17,25,40,0.6)" }}>
              <Box>
                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase" }}>
                  {item.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5, color: "#FFF" }}>
                  {item.value}
                </Typography>
              </Box>
              {item.icon}
            </Card>
          ))}
        </Box>

        {/* Configurations Layout */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "5fr 7fr" },
            gap: 3,
            mb: 4,
          }}
        >
          {/* Form Configuration Form */}
          <Box>
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, backgroundColor: "rgba(17,25,40,0.65)", display: "flex", flexDirection: "column", gap: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {t("Discovery Engine Configuration")}
              </Typography>

              <Box>
                <FormControl size="small" sx={{ ...ctrlSx, width: { xs: '100%', sm: 'calc(50% - 8px)', md: '180px' } }}>
                  <Typography sx={{ ...PREMIUM_FORM_LABEL_SX, color: "#94A3B8" }}>{t("Discovery Source")}</Typography>
                  <Select value={discoverySource} onChange={(e) => setDiscoverySource(e.target.value)} displayEmpty sx={{ height: '40px', color: "#F8FAFC" }}>
                    <MenuItem value="AWS">{t("AWS EC2 Discovery")}</MenuItem>
                    <MenuItem value="SNMP">{t("SNMP Discovery")}</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Discovery Name")}</Typography>
                <TextField fullWidth size="small" value={discoveryName} onChange={(e) => setDiscoveryName(e.target.value)} sx={inputStyle} />
              </Box>

              {discoverySource === "AWS" ? (
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
                  <Box>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("AWS Credential Profile *")}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <FormControl size="small" fullWidth sx={inputStyle}>
                        <Select value={awsProfile} onChange={(e) => setAwsProfile(e.target.value)} displayEmpty>
                          <MenuItem value="">{t("Select Profile...")}</MenuItem>
                          {awsProfiles.map((p) => (
                            <MenuItem key={p.id} value={p.id}>{p.profileName}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <Button variant="outlined" size="small" onClick={() => handleOpenAwsProfile()} sx={{ textTransform: "none", minWidth: "120px", borderColor: "rgba(255,255,255,0.2)", color: "#FFF" }}>
                        + {t("New Profile")}
                      </Button>
                      {awsProfile && (
                        <Button variant="outlined" size="small" onClick={() => handleOpenAwsProfile(awsProfiles.find(p => p.id.toString() === awsProfile))} sx={{ textTransform: "none", minWidth: "80px", borderColor: "rgba(255,255,255,0.2)", color: "#34D399" }}>
                          {t("Edit")}
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 2 }}>
                    <Box>
                      <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("CIDR Subnet / Range *")}</Typography>
                  <TextField fullWidth size="small" value={cidr} onChange={(e) => setCidr(e.target.value)} placeholder="192.168.1.0/24" sx={inputStyle} />
                </Box>
                <Box>
                  <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Discovery Mode")}</Typography>
                  <FormControl size="small" fullWidth sx={inputStyle}>
                    <Select value={discoveryMode} onChange={(e) => setDiscoveryMode(e.target.value)}>
                      <MenuItem value="SNMP">{t("SNMP Only")}</MenuItem>
                      <MenuItem value="Ping Only">{t("Ping Only")}</MenuItem>
                      <MenuItem value="SNMP + Ping">{t("SNMP + Ping")}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {discoveryMode.includes("SNMP") && (
                <Box sx={{ border: "1px solid rgba(255,255,255,0.06)", p: 2, borderRadius: 1, backgroundColor: "rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                    {t("SNMP Protocols")}
                  </Typography>

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                    <Box>
                      <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("SNMP Version")}</Typography>
                      <FormControl size="small" fullWidth sx={inputStyle}>
                        <Select value={snmpVersion} onChange={(e) => setSnmpVersion(e.target.value)}>
                          <MenuItem value="v1">v1</MenuItem>
                          <MenuItem value="v2c">v2c</MenuItem>
                          <MenuItem value="v3">v3</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                    <Box>
                      <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("SNMP Port")}</Typography>
                      <TextField fullWidth size="small" value={port} onChange={(e) => setPort(e.target.value)} sx={inputStyle} />
                    </Box>
                  </Box>

                  {snmpVersion !== "v3" ? (
                    <Box>
                      <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Read Community")}</Typography>
                      <TextField fullWidth size="small" value={community} onChange={(e) => setCommunity(e.target.value)} sx={inputStyle} />
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box>
                        <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Username")}</Typography>
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

                      {v3SecurityLevel !== "noAuthNoPriv" && (
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Auth Protocol")}</Typography>
                            <FormControl size="small" fullWidth sx={inputStyle}>
                              <Select value={v3AuthProtocol} onChange={(e) => setV3AuthProtocol(e.target.value)}>
                                <MenuItem value="MD5">MD5</MenuItem>
                                <MenuItem value="SHA">SHA</MenuItem>
                                <MenuItem value="SHA256">SHA-256</MenuItem>
                                <MenuItem value="SHA512">SHA-512</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Auth Password")}</Typography>
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
                                      {showAuthPass ? <VisibilityOffIcon fontSize="inherit" /> : <VisibilityIcon fontSize="inherit" />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                        </Box>
                      )}

                      {v3SecurityLevel === "authPriv" && (
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Priv Protocol")}</Typography>
                            <FormControl size="small" fullWidth sx={inputStyle}>
                              <Select value={v3PrivProtocol} onChange={(e) => setV3PrivProtocol(e.target.value)}>
                                <MenuItem value="DES">DES</MenuItem>
                                <MenuItem value="AES">AES-128</MenuItem>
                                <MenuItem value="AES256">AES-256</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                          <Box>
                            <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Priv Password")}</Typography>
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
                                      {showPrivPass ? <VisibilityOffIcon fontSize="inherit" /> : <VisibilityIcon fontSize="inherit" />}
                                    </IconButton>
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Box>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ color: vars.accent, fontWeight: 700, mb: 1.5 }}>
                  {t("Discovery Scan Tuning")}
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                  <Box>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Timeout (ms)")}</Typography>
                    <TextField fullWidth size="small" value={timeout} onChange={(e) => setTimeoutVal(e.target.value)} sx={inputStyle} />
                  </Box>
                  <Box>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Max Workers")}</Typography>
                    <TextField fullWidth size="small" value={concurrentWorkers} onChange={(e) => setConcurrentWorkers(e.target.value)} sx={inputStyle} />
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: vars.accent, fontWeight: 700, mb: 1 }}>
                  {t("Automations")}
                </Typography>
                <FormControlLabel
                  control={<Switch size="small" checked={autoRegisterDevices} onChange={(e) => setAutoRegisterDevices(e.target.checked)} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: "#0EA5E9" } }} />}
                  label={<Typography sx={{ fontSize: 12.5, color: "#FFF" }}>{t("Auto-Register Reachable SNMP nodes")}</Typography>}
                />
                {autoRegisterDevices && (
                  <Box sx={{ mt: 1 }}>
                    <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Auto-Assign Profile")}</Typography>
                    <FormControl size="small" fullWidth sx={inputStyle}>
                      <Select value={autoAssignProfile} onChange={(e) => setAutoAssignProfile(e.target.value)} displayEmpty>
                        <MenuItem value="">{t("None")}</MenuItem>
                        {profiles.map((p) => (
                          <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>
              </>
              )}

              <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

              {/* Start Control Actions */}
              <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end" }}>
                {scanState.status === "running" && (
                  <>
                    <Button variant="outlined" startIcon={<PauseIcon />} onClick={handlePauseScan} sx={{ textTransform: "none", color: "#F59E0B", borderColor: "#F59E0B" }}>
                      {t("Pause")}
                    </Button>
                    <Button variant="contained" color="error" startIcon={<StopIcon />} onClick={handleStopScan} sx={{ textTransform: "none" }}>
                      {t("Stop")}
                    </Button>
                  </>
                )}
                {scanState.status === "paused" && (
                  <>
                    <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleResumeScan} sx={{ textTransform: "none", backgroundColor: "#10B981" }}>
                      {t("Resume")}
                    </Button>
                    <Button variant="contained" color="error" startIcon={<StopIcon />} onClick={handleStopScan} sx={{ textTransform: "none" }}>
                      {t("Stop")}
                    </Button>
                  </>
                )}
                {scanState.status !== "running" && scanState.status !== "paused" && (
                  <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={handleStartScan} sx={{ textTransform: "none", backgroundColor: "#0EA5E9", "&:hover": { backgroundColor: "#0284C7" } }}>
                    {t("Start Discovery")}
                  </Button>
                )}
              </Box>
            </Card>
          </Box>

          {/* Active scan results panel */}
          <Box>
            <Card sx={{ ...PREMIUM_CARD_SX, p: 3, height: "100%", display: "flex", flexDirection: "column", gap: 3, backgroundColor: "rgba(17,25,40,0.65)" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: vars.accent, textTransform: "uppercase", letterSpacing: 0.5 }}>
                {t("Discovery Diagnostics Dashboard")}
              </Typography>

              {scanState.status !== "idle" && (
                <Box sx={{ p: 2.5, borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: "#FFF", fontWeight: 800 }}>
                        {scanState.sessionName}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)" }}>
                        {t("IP Range")}: {scanState.cidr}
                      </Typography>
                    </Box>
                    <Box sx={{ px: 1.5, py: 0.5, borderRadius: 0.5, backgroundColor: scanState.status === "running" ? "rgba(16,185,129,0.15)" : scanState.status === "paused" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <Typography sx={{ fontSize: 11.5, color: scanState.status === "running" ? "#34D399" : scanState.status === "paused" ? "#FBBF24" : "#FFF", fontWeight: 700, textTransform: "uppercase" }}>
                        {scanState.status}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                        {t("Scanned")}: <b>{scanState.scannedIps} / {scanState.totalIps}</b> IPs
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "#0EA5E9", fontWeight: 700 }}>
                        {progressPercentage}%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={progressPercentage} sx={{ height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.1)", "& .MuiLinearProgress-bar": { backgroundColor: "#0EA5E9" } }} />
                  </Box>

                  <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2.5, mt: 1 }}>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t("Scan Velocity")}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#FFF" }}>{scanState.scanSpeed} IPs / s</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t("Elapsed Time")}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#FFF" }}>{scanState.elapsedTime} s</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t("Remaining Time")}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#FFF" }}>{scanState.remainingTime} s</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t("Current Probe")}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 800, color: "#60A5FA" }}>{scanState.currentIp || "-"}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t("Reachable")}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#34D399" }}>{scanState.reachableCount}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t("Unreachable")}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#F87171" }}>{scanState.unreachableCount}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{t("Active Workers")}</Typography>
                      <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#A78BFA" }}>{scanState.activeWorkers}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Discovery Logs or History */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, flexGrow: 1, overflowY: "auto", minHeight: 200 }}>
                {scanState.status === "running" || scanState.status === "paused" ? (
                  <>
                    <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase" }}>
                      {t("Live Scan Events")}
                    </Typography>
                    <Timeline
                      sx={{
                        [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 },
                        p: 0,
                        m: 0,
                      }}
                    >
                      {[...scanState.events].reverse().slice(0, 50).map((evt, idx) => (
                        <TimelineItem key={idx} sx={{ minHeight: 40 }}>
                          <TimelineSeparator>
                            <TimelineDot
                              sx={{
                                m: 0,
                                mt: 0.5,
                                p: 0.5,
                                backgroundColor:
                                  evt.type === "success"
                                    ? "#10B981"
                                    : evt.type === "warning"
                                    ? "#F59E0B"
                                    : evt.type === "error"
                                    ? "#EF4444"
                                    : "#3B82F6",
                              }}
                            />
                            {idx < Math.min(scanState.events.length, 50) - 1 && <TimelineConnector sx={{ backgroundColor: "rgba(255,255,255,0.1)" }} />}
                          </TimelineSeparator>
                          <TimelineContent sx={{ py: 0.2, px: 2, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Typography sx={{ fontSize: 12, color: "#FFF", fontWeight: 500 }}>{evt.message}</Typography>
                            <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{new Date(evt.timestamp).toLocaleTimeString()}</Typography>
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </>
                ) : (
                  <>
                    <Typography sx={{ fontSize: 11.5, color: "rgba(255,255,255,0.5)", fontWeight: 700, textTransform: "uppercase" }}>
                      {t("Recent Discovery Sessions")}
                    </Typography>
                    {history.length === 0 ? (
                      <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, fontStyle: "italic", mt: 2 }}>
                        {t("No scan sessions logged")}
                      </Typography>
                    ) : (
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {history.slice(0, 4).map((h, idx) => (
                          <Box key={idx} sx={{ p: 1.5, borderRadius: 0.5, border: "1px solid rgba(255,255,255,0.05)", backgroundColor: "rgba(255,255,255,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Box>
                              <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#FFF" }}>{h.sessionName}</Typography>
                              <Typography sx={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)" }}>{h.cidr} • {new Date(h.startTime).toLocaleDateString()}</Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                              <Typography sx={{ fontSize: 11.5, color: "#34D399", fontWeight: 700 }}>+{h.devicesFound} {t("Nodes")}</Typography>
                              <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{h.durationSeconds} s</Typography>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Card>
          </Box>
        </Box>

        {/* Results Toolbar */}
        <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
          <TextField
            placeholder={t("Filter results IP, hostname...")}
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={ctrlSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            {selectedIds.length > 0 && (
              <>
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleBulkRegister} sx={{ backgroundColor: "#10B981", textTransform: "none" }}>
                  {t("Register Selected")}
                </Button>
                <Button variant="contained" size="small" color="error" startIcon={<DeleteIcon />} onClick={handleIgnoreSelected} sx={{ textTransform: "none" }}>
                  {t("Ignore Selected")}
                </Button>
              </>
            )}

            <FormControl size="small" sx={ctrlSx}>
              <Select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} displayEmpty>
                <MenuItem value="">{t("Filter Vendor")}</MenuItem>
                {VENDORS.map((v) => (
                  <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={ctrlSx}>
              <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} displayEmpty>
                <MenuItem value="">{t("Filter Type")}</MenuItem>
                {DEVICE_TYPES.map((tVal) => (
                  <MenuItem key={tVal} value={tVal}>{tVal}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" size="small" onClick={() => handleExport("csv")} sx={{ borderColor: "rgba(255,255,255,0.2)", color: "#FFF", textTransform: "none" }}>
              CSV
            </Button>
            <Button variant="outlined" size="small" onClick={() => handleExport("json")} sx={{ borderColor: "rgba(255,255,255,0.2)", color: "#FFF", textTransform: "none" }}>
              JSON
            </Button>
          </Box>
        </Box>

        {/* Discovered Devices Table */}
        <Card sx={{ ...PREMIUM_CARD_SX, p: 0, overflow: "hidden" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" sx={THEAD_CELL_SX}>
                    <Checkbox
                      size="small"
                      checked={filteredNodes.length > 0 && selectedIds.length === filteredNodes.length}
                      indeterminate={selectedIds.length > 0 && selectedIds.length < filteredNodes.length}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds(filteredNodes.map((n) => n.instanceId ?? n.id));
                        else setSelectedIds([]);
                      }}
                      sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#0EA5E9" } }}
                    />
                  </TableCell>
                  {discoverySource === "AWS" ? (
                    <>
                      <TableCell sx={THEAD_CELL_SX}>{t("Provider")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Region")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("AZ")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Instance Name")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Instance ID")}</TableCell>
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
                      <TableCell sx={THEAD_CELL_SX}>{t("IP Address")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Hostname")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Vendor")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Model")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Device Type")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Response Time")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("SNMP version")}</TableCell>
                      <TableCell sx={THEAD_CELL_SX}>{t("Status")}</TableCell>
                    </>
                  )}
                  <TableCell sx={{ ...THEAD_CELL_SX, textAlign: "right" }}>{t("Actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} sx={{ ...ROW_CELL_SX, py: 8, textAlign: "center", color: vars.textDim }}>
                      {t("No discovered devices found in this range")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((n) => {
                    const rowKey = n.instanceId ?? n.id;
                    const isSelected = selectedIds.includes(rowKey);
                    return (
                      <TableRow key={rowKey} sx={glassRowHoverSx}>
                        <TableCell padding="checkbox" sx={ROW_CELL_SX}>
                          <Checkbox
                            size="small"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds((prev) => [...prev, rowKey]);
                              else setSelectedIds((prev) => prev.filter((id) => id !== rowKey));
                            }}
                            sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#0EA5E9" } }}
                          />
                        </TableCell>
                        {discoverySource === "AWS" ? (
                          <>
                            <TableCell sx={ROW_CELL_SX}>{n.provider || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.region || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.availabilityZone || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.instanceName || "-"}</TableCell>
                            <TableCell sx={{ ...ROW_CELL_SX, fontWeight: 700, color: "#60A5FA" }}>{n.instanceId || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.instanceType || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.cloudMetadata?.PlatformDetails || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>
                              <Typography sx={{ fontSize: 11, fontWeight: 700, color: n.state === "running" ? "#10B981" : "#EF4444" }}>{n.state || "-"}</Typography>
                            </TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.privateIp || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.publicIp || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.cloudMetadata?.VpcId || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.cloudMetadata?.SubnetId || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.cloudMetadata?.LaunchTime ? new Date(n.cloudMetadata.LaunchTime).toLocaleDateString() : "-"}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell sx={{ ...ROW_CELL_SX, fontWeight: 700, color: "#60A5FA" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                {n.ipAddress || "-"}
                                {n.isDuplicate && (
                                  <Tooltip title={t("Device with this IP already exists in inventory")}>
                                    <WarningIcon sx={{ fontSize: 16, color: "#F59E0B" }} />
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.hostname || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.vendor || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.model || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.deviceType || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.responseTime != null ? `${n.responseTime} ms` : "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>{n.snmpVersion || "-"}</TableCell>
                            <TableCell sx={ROW_CELL_SX}>
                              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#10B981" }}>{n.status || "-"}</Typography>
                            </TableCell>
                          </>
                        )}
                        <TableCell sx={{ ...ROW_CELL_SX, textAlign: "right" }}>
                          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                            {n.isDuplicate ? (
                              <>
                                <Button variant="outlined" size="small" color="warning" onClick={() => handleOpenPromoDialog(n)} sx={{ textTransform: "none", fontSize: 11, py: 0.25 }}>
                                  {t("Merge")}
                                </Button>
                                <Button variant="outlined" size="small" color="error" onClick={() => handleOpenPromoDialog(n)} sx={{ textTransform: "none", fontSize: 11, py: 0.25 }}>
                                  {t("Replace")}
                                </Button>
                              </>
                            ) : (
                              <Button variant="outlined" size="small" onClick={() => handleOpenPromoDialog(n)} sx={{ textTransform: "none", fontSize: 11, py: 0.25, color: "#34D399", borderColor: "rgba(52,211,153,0.3)" }}>
                                {t("Register")}
                              </Button>
                            )}
                            <Button variant="text" size="small" color="error" onClick={() => setDiscoveredNodes((prev) => prev.filter((item) => item.id !== n.id))} sx={{ textTransform: "none", fontSize: 11 }}>
                              {t("Ignore")}
                            </Button>
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
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredNodes.length}
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

      {/* Promotion Add Device Modal */}
      <Dialog
        open={promoDialogOpen}
        onClose={() => setPromoDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: PREMIUM_DIALOG_PAPER_SX }}
      >
        <DialogTitle sx={PREMIUM_DIALOG_TITLE_SX}>{t("Register Discovered Device")}</DialogTitle>
        <DialogContent dividers sx={PREMIUM_DIALOG_CONTENT_SX}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, pt: 1 }}>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Device Name")}</Typography>
              <TextField fullWidth size="small" value={promoDeviceName} onChange={(e) => setPromoDeviceName(e.target.value)} sx={inputStyle} />
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("IP Address")}</Typography>
              <TextField fullWidth size="small" value={promoIp} disabled sx={inputStyle} />
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Vendor")}</Typography>
              <TextField fullWidth size="small" value={promoVendor} onChange={(e) => setPromoVendor(e.target.value)} sx={inputStyle} />
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Model")}</Typography>
              <TextField fullWidth size="small" value={promoModel} onChange={(e) => setPromoModel(e.target.value)} sx={inputStyle} />
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("SNMP Version")}</Typography>
              <FormControl size="small" fullWidth sx={inputStyle}>
                <Select value={promoVersion} onChange={(e) => setPromoVersion(e.target.value)}>
                  <MenuItem value="v1">SNMP v1</MenuItem>
                  <MenuItem value="v2c">SNMP v2c</MenuItem>
                  <MenuItem value="v3">SNMP v3</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Device Type")}</Typography>
              <FormControl size="small" fullWidth sx={inputStyle}>
                <Select value={promoType} onChange={(e) => setPromoType(e.target.value)}>
                  {DEVICE_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ gridColumn: "span 2" }}>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Auto-Assign Profile")}</Typography>
              <FormControl size="small" fullWidth sx={inputStyle}>
                <Select value={promoProfile} onChange={(e) => setPromoProfile(e.target.value)} displayEmpty>
                  <MenuItem value="">{t("Inherit Default profile")}</MenuItem>
                  {profiles.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={PREMIUM_DIALOG_ACTIONS_SX}>
          <Button onClick={() => setPromoDialogOpen(false)} sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}>{t("Cancel")}</Button>
          <Button variant="contained" onClick={handleSavePromoted} sx={{ backgroundColor: "#0EA5E9", textTransform: "none" }}>{t("Confirm Registration")}</Button>
        </DialogActions>
      </Dialog>

      {/* AWS Profile Management Modal */}
      <Dialog
        open={awsProfileDialogOpen}
        onClose={() => setAwsProfileDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: PREMIUM_DIALOG_PAPER_SX }}
      >
        <DialogTitle sx={PREMIUM_DIALOG_TITLE_SX}>{awsProfileForm.id ? t("Edit AWS Credential Profile") : t("Create AWS Credential Profile")}</DialogTitle>
        <DialogContent dividers sx={PREMIUM_DIALOG_CONTENT_SX}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Profile Name *")}</Typography>
              <TextField fullWidth size="small" value={awsProfileForm.profileName} onChange={(e) => setAwsProfileForm({ ...awsProfileForm, profileName: e.target.value })} sx={inputStyle} />
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("AWS Access Key ID *")}</Typography>
              <TextField fullWidth size="small" value={awsProfileForm.accessKey} onChange={(e) => setAwsProfileForm({ ...awsProfileForm, accessKey: e.target.value })} sx={inputStyle} />
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("AWS Secret Access Key *")}</Typography>
              <TextField fullWidth size="small" type="password" value={awsProfileForm.secretKey} onChange={(e) => setAwsProfileForm({ ...awsProfileForm, secretKey: e.target.value })} sx={inputStyle} />
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("AWS Region *")}</Typography>
              <FormControl size="small" fullWidth sx={inputStyle}>
                <Select
                  value={awsProfileForm.region}
                  onChange={(e) => setAwsProfileForm({ ...awsProfileForm, region: e.target.value })}
                  displayEmpty
                >
                  <MenuItem value="">{t("Select Region...")}</MenuItem>
                  <MenuItem value="ap-south-1">ap-south-1 (Mumbai)</MenuItem>
                  <MenuItem value="ap-south-2">ap-south-2 (Hyderabad)</MenuItem>
                  <MenuItem value="us-east-1">us-east-1 (N. Virginia)</MenuItem>
                  <MenuItem value="us-east-2">us-east-2 (Ohio)</MenuItem>
                  <MenuItem value="us-west-1">us-west-1 (N. California)</MenuItem>
                  <MenuItem value="us-west-2">us-west-2 (Oregon)</MenuItem>
                  <MenuItem value="eu-west-1">eu-west-1 (Ireland)</MenuItem>
                  <MenuItem value="eu-central-1">eu-central-1 (Frankfurt)</MenuItem>
                  <MenuItem value="ap-northeast-1">ap-northeast-1 (Tokyo)</MenuItem>
                  <MenuItem value="ap-southeast-1">ap-southeast-1 (Singapore)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography sx={PREMIUM_FORM_LABEL_SX}>{t("Description")}</Typography>
              <TextField fullWidth size="small" multiline rows={2} value={awsProfileForm.description} onChange={(e) => setAwsProfileForm({ ...awsProfileForm, description: e.target.value })} sx={inputStyle} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={PREMIUM_DIALOG_ACTIONS_SX}>
          <Box sx={{ flexGrow: 1 }}>
            {awsProfileForm.id && (
              <Button onClick={handleDeleteAwsProfile} disabled={isDeletingAwsProfile} sx={{ color: "#EF4444", textTransform: "none" }}>{isDeletingAwsProfile ? t("Deleting...") : t("Delete Profile")}</Button>
            )}
          </Box>
          <Button onClick={() => setAwsProfileDialogOpen(false)} sx={{ color: "rgba(255,255,255,0.6)", textTransform: "none" }}>{t("Cancel")}</Button>
          <Button variant="contained" onClick={handleSaveAwsProfile} disabled={isSavingAwsProfile} sx={{ backgroundColor: "#0EA5E9", textTransform: "none" }}>{isSavingAwsProfile ? t("Saving...") : t("Save Profile")}</Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
}
