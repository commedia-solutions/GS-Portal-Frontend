import React, { useState, useEffect, useMemo } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { GroundStation, AwsRegion, AwsHub, TopologyEntity } from "../../types/topologyTypes";
import type { ActivePass } from "../../types/monitoring/dashboard";
import { getTopologyData } from "../../services/topology/topologyService";
import { getAwsRegionData } from "../../services/topology/awsRegionService";
import { getAwsHubData } from "../../services/topology/awsHubService";
import { TopologyMap } from "./TopologyMap";
import { TopologyDetailsPanel } from "./TopologyDetailsPanel";

interface NetworkTopologyProps {
  selectedRegionId?: string | null;
  onRegionSelect?: (regionId: string | null) => void;
  dashboardData?: any; // the real telemetry payload from Dashboard.tsx
  activePasses?: ActivePass[]; // strictly filtered active passes from Dashboard
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  selectedRegionId,
  onRegionSelect,
  dashboardData,
  activePasses = [],
}) => {
  const [stations, setStations] = useState<GroundStation[]>([]);
  const [regions, setRegions] = useState<AwsRegion[]>([]);
  const [hubs, setHubs] = useState<AwsHub[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<TopologyEntity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync topology data on mount and whenever dashboardData updates
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const [stationData, regionData, hubData] = await Promise.all([
          getTopologyData(),
          getAwsRegionData(),
          getAwsHubData(),
        ]);
        if (mounted) {
          setStations(stationData);
          setRegions(regionData);
          setHubs(hubData);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load topology data.");
          console.error("Topology Error:", err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [dashboardData]);

  // Merge dynamic telemetry from dashboardData into the static stations list
  const mergedStations = useMemo<GroundStation[]>(() => {
    if (!dashboardData || !dashboardData.regions) return stations;

    return stations.map((station) => {
      // Find the corresponding region and station in the dashboard data
      for (const region of dashboardData.regions) {
        const liveStation = region.stations?.find((s: any) => s.id === station.id);
        if (liveStation) {
          const livePass = activePasses.find((p) => p.stationId === station.id);

          const fallbackSat = station.id.includes("1") ? "SPADEX-SD1" : "SPADEX-SD2";
          const resolvedSat = livePass?.satellite || liveStation.satellite || liveStation.telemetry?.satellite || fallbackSat;
          return {
            ...station,
            status: liveStation.status || station.status,
            lastUpdate: liveStation.lastUpdate || station.lastUpdate,
            metrics: {
              ebNo: liveStation.ebNo !== null && liveStation.ebNo !== undefined ? liveStation.ebNo : (station.metrics?.ebNo ?? null),
              ifLevel: liveStation.ifLevel !== null && liveStation.ifLevel !== undefined ? liveStation.ifLevel : (station.metrics?.ifLevel ?? null),
              rxLock: liveStation.rx || (station.metrics?.rxLock ?? "UNKNOWN"),
              txState: liveStation.tx || (station.metrics?.txState ?? "UNKNOWN"),
            },
            currentPass: {
              satellite: resolvedSat,
              date: livePass?.date || liveStation.date || "--",
              operations: livePass?.operations || liveStation.operations || "--",
              aos: livePass?.aos || liveStation.aos || "--",
              los: livePass?.los || liveStation.los || "--",
              duration: livePass?.duration || "--",
              status: livePass ? "ACTIVE" : (liveStation.status || "OFFLINE"),
            },
            system: {
              ...station.system,
              connection: liveStation.status || "UNKNOWN",
              health: liveStation.status === "ONLINE" ? "HEALTHY" : (liveStation.status === "OFFLINE" ? "OFFLINE" : "UNKNOWN"),
            },
            infrastructure: {
              receiverEc2: liveStation.receiverEc2 || (liveStation.status === "ONLINE" ? "RUNNING" : "OFFLINE"),
              sdrEc2: liveStation.sdrEc2 || (liveStation.status === "ONLINE" ? "RUNNING" : "OFFLINE"),
              receiverInstanceId: liveStation.receiverInstanceId || station.infrastructure?.receiverInstanceId,
              sdrInstanceId: liveStation.sdrInstanceId || station.infrastructure?.sdrInstanceId,
              rxStatus: liveStation.rx || "OFF",
              txStatus: liveStation.tx || "OFF",
            },
          };
        }
      }
      return station;
    });
  }, [stations, dashboardData, activePasses]);

  // Update selected entity if it matches the newly selected region from parent
  useEffect(() => {
    if (selectedRegionId) {
      const regionEntity = regions.find((r) => r.id === selectedRegionId);
      if (regionEntity && (!selectedEntity || selectedEntity.id !== regionEntity.id)) {
        setSelectedEntity(regionEntity);
      }
    } else {
      if (selectedEntity?.type === "region") {
        setSelectedEntity(null);
      }
    }
  }, [selectedRegionId, regions]);

  const handleEntitySelect = (entity: TopologyEntity | null) => {
    setSelectedEntity(entity);
    if (entity && entity.type === "region" && onRegionSelect) {
      onRegionSelect(entity.id);
    } else if (!entity && onRegionSelect && selectedEntity?.type === "region") {
      onRegionSelect(null);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 550,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0,0,0,0.2)",
        }}
      >
        <CircularProgress sx={{ color: vars.accent }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 550,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(0,0,0,0.2)",
        }}
      >
        <Typography sx={{ color: "#EF4444", fontSize: 13, fontWeight: "bold" }}>{error}</Typography>
      </Box>
    );
  }

  const isPanelOpen = selectedEntity !== null;

  return (
    <Box
      sx={{
        width: "100%",
        height: { xs: 450, md: 550, xl: 620 },
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      {/* Left side: The Interactive World Map */}
      <TopologyMap
        stations={mergedStations}
        regions={regions}
        hubs={hubs}
        activePasses={activePasses}
        selectedEntity={selectedEntity}
        onSelectEntity={handleEntitySelect}
      />

      {/* Right side: Station / Hub Details Panel */}
      <Box
        sx={{
          width: { xs: "100%", md: "340px" },
          flex: isPanelOpen ? "0 0 340px" : "0 0 0px",
          opacity: isPanelOpen ? 1 : 0,
          borderLeft: isPanelOpen ? `1px solid ${vars.border}` : "none",
          bgcolor: vars.bgCard,
          transition: "all 0.3s ease-in-out",
          overflow: "hidden",
        }}
      >
        <Box sx={{ width: "340px", height: "100%" }}>
          <TopologyDetailsPanel
            stations={mergedStations}
            entity={selectedEntity}
            onClose={() => {
              setSelectedEntity(null);
              if (selectedEntity?.type === "region" && onRegionSelect) {
                onRegionSelect(null);
              }
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};
