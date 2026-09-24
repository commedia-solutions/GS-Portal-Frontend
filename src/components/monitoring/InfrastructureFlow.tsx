// src/components/monitoring/InfrastructureFlow.tsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Tooltip,
  Skeleton,
} from "@mui/material";
import { Layers } from "lucide-react";
import { vars } from "../../ui/toast/themeBridge";
import type {
  InfrastructureNodePayload,
  InfrastructureStatus,
  AggregatedInfrastructureData,
} from "../../types/monitoring/infrastructure";
import { getInfrastructureStatus } from "../../services/monitoring/infrastructureService";
import { InfrastructureDetailsModal } from "./InfrastructureDetailsModal";

import CloudIcon from "@mui/icons-material/Cloud";
import RouterIcon from "@mui/icons-material/Router";
import PrivateConnectivityIcon from "@mui/icons-material/VpnKey";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DnsIcon from "@mui/icons-material/Dns";
import PublicIcon from "@mui/icons-material/Public";
import SatelliteIcon from "@mui/icons-material/Satellite";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

interface Props {
  regions?: any[];
  initialStation?: string;
  selectedRegionId?: string | null;
  hideTitle?: boolean;
}

const menuProps = {
  PaperProps: {
    sx: {
      bgcolor: "#0B1120",
      border: `1px solid rgba(255, 255, 255, 0.12)`,
      boxShadow: "0 16px 36px -4px rgba(0, 0, 0, 0.7)",
      borderRadius: "8px",
      backgroundImage: "none",
      "& .MuiMenuItem-root": {
        fontSize: 11.5,
        color: vars.text,
        py: 1,
        px: 1.5,
        "&:hover": {
          bgcolor: "rgba(255, 255, 255, 0.08)",
        },
        "&.Mui-selected": {
          bgcolor: "rgba(14, 165, 233, 0.18)",
          color: vars.accent,
          fontWeight: "bold",
          "&:hover": {
            bgcolor: "rgba(14, 165, 233, 0.28)",
          },
        },
      },
    },
  },
};

const getIconForType = (type: string) => {
  switch (type) {
    case "cloud": return CloudIcon;
    case "router": return RouterIcon;
    case "link": return PrivateConnectivityIcon;
    case "connect": return CompareArrowsIcon;
    case "dns": return DnsIcon;
    case "network": return PublicIcon;
    case "satellite": return SatelliteIcon;
    default: return SettingsIcon;
  }
};

const getStatusColor = (status: InfrastructureStatus | string) => {
  switch (status) {
    case "AVAILABLE":
    case "UP":
    case "HEALTHY":
      return "#10B981"; // Emerald Green
    case "DEGRADED":
      return "#F59E0B"; // Amber / Orange
    case "NOT_AVAILABLE":
    case "DOWN":
    case "OFFLINE":
    case "CRITICAL":
      return "#EF4444"; // Red
    case "NOT_MANAGED":
      return "#38BDF8"; // Sky Blue
    case "NOT_CONFIGURED":
      return "#9CA3AF"; // Gray
    default:
      return "#9CA3AF";
  }
};

export const InfrastructureFlow: React.FC<Props> = ({
  regions = [],
  initialStation = "CP1",
  hideTitle = false,
}) => {
  // Dynamically derive Station options containing Ground Station + Station ID + AWS Region
  const stationOptions = useMemo(() => {
    if (regions && regions.length > 0) {
      const list: Array<{
        key: string;
        stationId: string;
        regionId: string;
        label: string;
        accountType: "GS1" | "GS2";
      }> = [];

      regions.forEach((region: any) => {
        const rName = region.name || region.city || region.id;
        const awsRegion = region.id || region.awsRegion || "af-south-1";
        (region.stations || []).forEach((st: any) => {
          const isGS2 = String(st.id).includes("2");
          list.push({
            key: `${st.id}|${awsRegion}`,
            stationId: st.id,
            regionId: awsRegion,
            label: `${rName} (${st.id}) - ${awsRegion}`,
            accountType: isGS2 ? "GS2" : "GS1",
          });
        });
      });

      if (list.length > 0) return list;
    }

    return [
      { key: "CP1|af-south-1", stationId: "CP1", regionId: "af-south-1", label: "Cape Town (CP1) - af-south-1", accountType: "GS1" as const },
      { key: "CP2|af-south-1", stationId: "CP2", regionId: "af-south-1", label: "Cape Town (CP2) - af-south-1", accountType: "GS2" as const },
      { key: "DU1|eu-west-1", stationId: "DU1", regionId: "eu-west-1", label: "Dublin (DU1) - eu-west-1", accountType: "GS1" as const },
      { key: "DU2|eu-west-1", stationId: "DU2", regionId: "eu-west-1", label: "Dublin (DU2) - eu-west-1", accountType: "GS2" as const },
      { key: "PA1|sa-east-1", stationId: "PA1", regionId: "sa-east-1", label: "Punta Arenas (PA1) - sa-east-1", accountType: "GS1" as const },
      { key: "PA2|sa-east-1", stationId: "PA2", regionId: "sa-east-1", label: "Punta Arenas (PA2) - sa-east-1", accountType: "GS2" as const },
      { key: "DB1|ap-southeast-2", stationId: "DB1", regionId: "ap-southeast-2", label: "Dubbo (DB1) - ap-southeast-2", accountType: "GS1" as const },
      { key: "DB2|ap-southeast-2", stationId: "DB2", regionId: "ap-southeast-2", label: "Dubbo (DB2) - ap-southeast-2", accountType: "GS2" as const },
    ];
  }, [regions]);

  const [selectedKey, setSelectedKey] = useState<string>(() => {
    if (initialStation) {
      const match = stationOptions.find(o => o.stationId === initialStation);
      if (match) return match.key;
    }
    return stationOptions[0]?.key || "CP1|af-south-1";
  });

  // Keep selectedKey valid if stationOptions change
  useEffect(() => {
    if (stationOptions.length > 0 && !stationOptions.some(o => o.key === selectedKey)) {
      setSelectedKey(stationOptions[0].key);
    }
  }, [stationOptions, selectedKey]);

  const selectedOption = useMemo(() => {
    return stationOptions.find(o => o.key === selectedKey) || stationOptions[0];
  }, [stationOptions, selectedKey]);

  const [infraData, setInfraData] = useState<AggregatedInfrastructureData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<InfrastructureNodePayload | null>(null);

  const requestCounter = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchInfra = useCallback(async (targetStation: string, targetRegion: string, isManual = false) => {
    // 1. Abort previous in-flight request if present
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const currentRequestId = ++requestCounter.current;
    if (isManual) {
      setLoading(true);
      setInfraData(null); // Invalidate immediately to prevent showing stale data from previous station
    }

    try {
      const data = await getInfrastructureStatus(targetStation, targetRegion, abortController.signal);
      // Ensure only the latest request updates the state
      if (currentRequestId === requestCounter.current && data) {
        setInfraData(data);
      }
    } catch (err: any) {
      if (err?.name !== "AbortError" && !err?.message?.includes("aborted")) {
        console.error("[InfrastructureFlow] Error fetching data:", err);
      }
    } finally {
      if (currentRequestId === requestCounter.current) {
        setLoading(false);
      }
    }
  }, []);

  // Fetch immediately on station change and start a dedicated single 30s polling timer
  useEffect(() => {
    if (!selectedOption) return;

    fetchInfra(selectedOption.stationId, selectedOption.regionId, true);

    const interval = setInterval(() => {
      fetchInfra(selectedOption.stationId, selectedOption.regionId, false);
    }, 30000); // 30-second live polling interval for currently selected station

    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedOption?.key, fetchInfra]);

  const handleNodeClick = (node: InfrastructureNodePayload) => {
    if (loading) return;
    setSelectedNode(node);
    setModalOpen(true);
  };

  // Node templates (used for layout and loading skeleton placeholders)
  const templateNodes: Array<{ id: string; name: string; type: string; account: "GS1" | "GS2" | "NETWORK" | "EXTERNAL" }> = [
    { id: "aws-vpc", name: "AWS VPC", type: "cloud", account: selectedOption?.accountType || "GS1" },
    { id: "tgw", name: "Transit Gateway", type: "router", account: "NETWORK" },
    { id: "privatelink", name: "VPN", type: "link", account: "NETWORK" },
    { id: "direct-connect", name: "AWS Direct Connect", type: "connect", account: "NETWORK" },
    { id: "hosted-dx", name: "Hosted DX", type: "dns", account: "NETWORK" },
    { id: "isp", name: "ISP / Network", type: "network", account: "EXTERNAL" },
    { id: "mission-network", name: "Mission Network", type: "satellite", account: "EXTERNAL" },
  ];

  const nodes: InfrastructureNodePayload[] = infraData?.nodes || templateNodes.map(t => ({
    id: t.id,
    name: t.name,
    status: "UNKNOWN",
    type: t.type,
    account: t.account,
  }));

  const isAccountConfigured = infraData?.accountConfigured ?? true;
  const accountText = infraData?.accountStatusMessage || `${selectedOption?.accountType || "GS1"} AWS Account`;

  const formatLastUpdated = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + " UTC";
    } catch {
      return dateStr;
    }
  };

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header Row: Title & Subtitle on Left, Station & Account on Right */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          mb: 1.8,
          pb: 1.2,
          borderBottom: `1px solid rgba(255, 255, 255, 0.06)`,
        }}
      >
        {!hideTitle && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                p: 0.7,
                borderRadius: "8px",
                bgcolor: "rgba(14, 165, 233, 0.12)",
                border: "1px solid rgba(14, 165, 233, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: vars.accent,
              }}
            >
              <Layers size={17} />
            </Box>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  sx={{
                    fontSize: 12.5,
                    fontWeight: 900,
                    color: vars.text,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Infrastructure Connection Flow
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 0.8,
                    py: 0.2,
                    borderRadius: "10px",
                    bgcolor: loading ? "rgba(245, 158, 11, 0.12)" : "rgba(16, 185, 129, 0.12)",
                    border: `1px solid ${loading ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      bgcolor: loading ? "#F59E0B" : "#10B981",
                      boxShadow: loading ? "0 0 8px #F59E0B" : "0 0 8px #10B981",
                      animation: "pulseLive 1.5s infinite",
                      "@keyframes pulseLive": {
                        "0%, 100%": { opacity: 1, transform: "scale(1)" },
                        "50%": { opacity: 0.4, transform: "scale(1.2)" },
                      },
                    }}
                  />
                  <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: loading ? "#F59E0B" : "#10B981", letterSpacing: "0.04em" }}>
                    {loading ? "REFRESHING PIPELINE..." : "LIVE PIPELINE"}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 10, color: vars.textDim, fontWeight: 500, mt: 0.1 }}>
                {loading ? "Fetching real-time AWS infrastructure telemetry..." : (infraData?.updatedAt ? `Last updated: ${formatLastUpdated(infraData.updatedAt)} • End-to-End Hybrid Network` : "End-to-End Real-Time AWS & Hybrid Network Telemetry")}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Station Selector & Account Indicator */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, ml: "auto", flexWrap: "wrap" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
              Station:
            </Typography>
            <FormControl size="small">
              <Select
                value={selectedOption?.key || ""}
                onChange={(e) => {
                  const newKey = e.target.value;
                  setSelectedKey(newKey);
                }}
                sx={{
                  height: 30,
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: vars.text,
                  bgcolor: "rgba(15, 23, 42, 0.6)",
                  border: `1px solid rgba(255, 255, 255, 0.12)`,
                  borderRadius: "6px",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "&:hover": {
                    borderColor: vars.accent,
                    bgcolor: "rgba(15, 23, 42, 0.9)",
                  },
                  "& .MuiSelect-select": {
                    py: 0.4,
                    px: 1.2,
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiSvgIcon-root": {
                    color: vars.textDim,
                    fontSize: 18,
                  },
                }}
                MenuProps={menuProps}
              >
                {stationOptions.map((opt) => (
                  <MenuItem key={opt.key} value={opt.key} sx={{ fontSize: 11.5, fontWeight: 700 }}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Account Indicator */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: vars.textDim, fontWeight: 600, whiteSpace: "nowrap" }}>
              Account:
            </Typography>
            {isAccountConfigured ? (
              <Chip
                label={accountText}
                size="small"
                sx={{
                  height: 26,
                  fontSize: 10.5,
                  fontWeight: 800,
                  bgcolor: "rgba(16, 185, 129, 0.12)",
                  color: "#10B981",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  boxShadow: "0 0 10px rgba(16, 185, 129, 0.15)",
                  px: 0.5,
                }}
              />
            ) : (
              <Tooltip title="GS2 AWS credentials are not yet configured in backend environment variables.">
                <Chip
                  icon={<WarningAmberIcon sx={{ fontSize: "15px !important", color: "#F59E0B !important" }} />}
                  label="AWS CREDENTIALS NOT CONFIGURED"
                  size="small"
                  sx={{
                    height: 26,
                    fontSize: 10,
                    fontWeight: 800,
                    bgcolor: "rgba(245, 158, 11, 0.12)",
                    color: "#F59E0B",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                    px: 0.5,
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      {/* Modern High-Tech Flow Cards Grid with Loading / Skeleton State */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          justifyContent: "space-between",
          gap: 1.2,
          py: 0.5,
          overflowX: "auto",
          "&::-webkit-scrollbar": { height: "5px" },
          "&::-webkit-scrollbar-track": { bgcolor: "rgba(0,0,0,0.15)" },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.15)", borderRadius: "3px" },
          "&::-webkit-scrollbar-thumb:hover": { bgcolor: "rgba(255,255,255,0.25)" },
        }}
      >
        {nodes.map((node, index) => {
          const Icon = getIconForType(node.type);
          const color = loading ? "#9CA3AF" : getStatusColor(node.status);
          const isVpn = node.id === "privatelink" || node.name === "VPN";

          // Extract Tata and Airtel statuses for VPN card
          const tataStatusRaw = node.tata?.status || infraData?.privateLink?.tata?.status;
          const tataTunnel1 = node.tata?.tunnel1 || infraData?.privateLink?.tata?.tunnel1;
          const tataTunnel2 = node.tata?.tunnel2 || infraData?.privateLink?.tata?.tunnel2;
          const isTataUp = tataStatusRaw === "AVAILABLE" || tataTunnel1 === "UP" || tataTunnel2 === "UP";
          const tataText = tataStatusRaw === "NOT_CONFIGURED" ? "N/A" : (isTataUp ? "UP" : "DOWN");
          const tataColor = tataStatusRaw === "NOT_CONFIGURED" ? "#9CA3AF" : (isTataUp ? "#10B981" : "#EF4444");

          const airtelStatusRaw = node.airtel?.status || infraData?.privateLink?.airtel?.status;
          const airtelTunnel1 = node.airtel?.tunnel1 || infraData?.privateLink?.airtel?.tunnel1;
          const airtelTunnel2 = node.airtel?.tunnel2 || infraData?.privateLink?.airtel?.tunnel2;
          const isAirtelUp = airtelStatusRaw === "AVAILABLE" || airtelTunnel1 === "UP" || airtelTunnel2 === "UP";
          const airtelText = airtelStatusRaw === "NOT_CONFIGURED" ? "N/A" : (isAirtelUp ? "UP" : "DOWN");
          const airtelColor = airtelStatusRaw === "NOT_CONFIGURED" ? "#9CA3AF" : (isAirtelUp ? "#10B981" : "#EF4444");

          return (
            <React.Fragment key={node.id}>
              <Box
                onClick={() => handleNodeClick(node)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: loading 
                    ? "linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(10, 15, 29, 0.7) 100%)"
                    : "linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(10, 15, 29, 0.95) 100%)",
                  border: `1px solid ${loading ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.08)"}`,
                  borderRadius: "10px",
                  p: 1.4,
                  flex: 1,
                  minWidth: 120,
                  maxWidth: 165,
                  minHeight: 125,
                  cursor: loading ? "wait" : "pointer",
                  transition: "all 0.2s ease-in-out",
                  position: "relative",
                  boxShadow: loading
                    ? "none"
                    : `0 4px 20px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.05)`,
                  "&:hover": loading ? {} : {
                    transform: "translateY(-3px)",
                    borderColor: `${color}80`,
                    background: "linear-gradient(180deg, rgba(20, 30, 55, 0.85) 0%, rgba(12, 18, 35, 0.98) 100%)",
                    boxShadow: `0 8px 24px ${color}20, 0 0 12px ${color}15`,
                  },
                }}
              >
                {loading ? (
                  /* Loading / Skeleton State */
                  <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "space-between" }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "8px",
                        bgcolor: "rgba(255, 255, 255, 0.04)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 0.5,
                      }}
                    >
                      <Skeleton variant="circular" width={20} height={20} sx={{ bgcolor: "rgba(255, 255, 255, 0.08)" }} />
                    </Box>

                    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, my: 0.5 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.textDim, textAlign: "center" }}>
                        {node.name}
                      </Typography>
                      <Skeleton variant="rectangular" width="60%" height={10} sx={{ borderRadius: "4px", bgcolor: "rgba(255, 255, 255, 0.06)" }} />
                    </Box>

                    <Skeleton variant="rectangular" width="80%" height={20} sx={{ borderRadius: "10px", bgcolor: "rgba(255, 255, 255, 0.06)" }} />
                  </Box>
                ) : isVpn ? (
                  /* VPN Card with Dual Provider Sub-Panel */
                  <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "space-between" }}>
                    {/* Top Icon & Title */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.4 }}>
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "8px",
                          bgcolor: `${color}15`,
                          border: `1px solid ${color}35`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Icon sx={{ fontSize: 17, color: color }} />
                      </Box>
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.text, textAlign: "center", letterSpacing: "0.02em" }}>
                        VPN
                      </Typography>
                    </Box>

                    {/* Dual Provider Box */}
                    <Box
                      sx={{
                        width: "100%",
                        px: 0.9,
                        py: 0.5,
                        bgcolor: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.06)",
                        borderRadius: "6px",
                        my: 0.5,
                      }}
                    >
                      {/* Tata */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5, mb: 0.3 }}>
                        <Typography sx={{ fontSize: 9.5, color: vars.textDim, fontWeight: 700 }}>
                          Tata
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: tataColor, boxShadow: `0 0 5px ${tataColor}` }} />
                          <Typography sx={{ fontSize: 8.5, color: tataColor, fontWeight: 800 }}>
                            {tataText}
                          </Typography>
                        </Box>
                      </Box>
                      {/* Airtel */}
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 0.5 }}>
                        <Typography sx={{ fontSize: 9.5, color: vars.textDim, fontWeight: 700 }}>
                          Airtel
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                          <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: airtelColor, boxShadow: `0 0 5px ${airtelColor}` }} />
                          <Typography sx={{ fontSize: 8.5, color: airtelColor, fontWeight: 800 }}>
                            {airtelText}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Aggregated VPN Status Pill */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 0.9,
                        py: 0.3,
                        borderRadius: "12px",
                        bgcolor: `${color}15`,
                        border: `1px solid ${color}35`,
                      }}
                    >
                      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, boxShadow: `0 0 6px ${color}` }} />
                      <Typography sx={{ fontSize: 8.5, color: color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        {node.status.replace("_", " ")}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  /* Standard Node Card */
                  <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "space-between" }}>
                    {/* Top Icon Badge */}
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "8px",
                        bgcolor: `${color}15`,
                        border: `1px solid ${color}35`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 0.5,
                      }}
                    >
                      <Icon sx={{ fontSize: 18, color: color }} />
                    </Box>

                    {/* Node Title & Account Sub-tag */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 0.5 }}>
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: vars.text, textAlign: "center", letterSpacing: "0.02em" }}>
                        {node.name}
                      </Typography>
                      <Typography sx={{ fontSize: 8.5, color: vars.textDim, fontWeight: 600, textTransform: "uppercase", mt: 0.2 }}>
                        {node.account === "EXTERNAL" ? "EXTERNAL" : node.account}
                      </Typography>
                    </Box>

                    {/* Status Pill */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 0.9,
                        py: 0.3,
                        borderRadius: "12px",
                        bgcolor: `${color}15`,
                        border: `1px solid ${color}35`,
                      }}
                    >
                      <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: color, boxShadow: `0 0 6px ${color}` }} />
                      <Typography sx={{ fontSize: 8.5, color: color, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                        {node.status.replace("_", " ")}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>

              {/* High-Tech Flow Pipeline Connector */}
              {index < nodes.length - 1 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 0.2,
                    flexShrink: 0,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#0EA5E9",
                      opacity: 0.75,
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 2,
                        bgcolor: "rgba(14, 165, 233, 0.4)",
                        borderRadius: "1px",
                      }}
                    />
                    <ArrowRightAltIcon sx={{ fontSize: 20, color: "#0EA5E9" }} />
                  </Box>
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {/* Interactive Details Modal */}
      <InfrastructureDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedNode={selectedNode}
        infraData={infraData}
      />
    </Box>
  );
};
