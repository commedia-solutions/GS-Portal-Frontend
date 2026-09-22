import React, { useState, useEffect, useMemo } from "react";
import { Box, Card, Typography, CircularProgress, Button } from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { useI18n } from "../../i18n";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, PREMIUM_ACTION_BUTTON_SX } from "../../ui/styles";

import { Radio, Globe, Satellite, Unlock, Antenna, AlertTriangle, Plus, Layers } from "lucide-react";

import type { DashboardData, DashboardSummary, ActivePass } from "../../types/monitoring/dashboard";
import { getMonitoringDashboard } from "../../services/monitoring/dashboardService";

import { SummaryCard } from "../../components/monitoring/SummaryCard";
import { ActivePassCard } from "../../components/monitoring/ActivePassCard";
import { ActiveAlerts } from "../../components/monitoring/ActiveAlerts";
import { InfrastructureFlow } from "../../components/monitoring/InfrastructureFlow";
import { GroundStationTable } from "../../components/monitoring/GroundStationTable";
import { ActivePassChart } from "../../components/monitoring/ActivePassChart";
import { UpcomingOperations } from "../../components/monitoring/UpcomingOperations";
import { NetworkTopology } from "../../components/topology/NetworkTopology";
import { RegionInfrastructureHealth } from "../../components/monitoring/RegionInfrastructureHealth";
import { RegionManagementModal } from "../../components/monitoring/RegionManagementModal";

/**
 * Strict pass-level filter: A pass is active ONLY when its real status is ACTIVE/LIVE
 * or when current UTC time is strictly within the [AOS, LOS] window.
 */
export const isPassActive = (pass: ActivePass): boolean => {
  if (!pass) return false;
  
  const now = Date.now();
  let isTimeActive = false;
  let isTimeValid = false;

  // Normalize and parse AOS & LOS timestamps in UTC
  if (pass.aos && pass.los && pass.aos !== "--" && pass.los !== "--") {
    const aosTime = new Date(pass.aos).getTime();
    const losTime = new Date(pass.los).getTime();
    if (!isNaN(aosTime) && !isNaN(losTime)) {
      isTimeValid = true;
      isTimeActive = now >= aosTime && now <= losTime;
    }
  }

  const rawStatus = pass.status?.toUpperCase();
  const isActive = isTimeValid ? isTimeActive : (rawStatus === "ACTIVE" || rawStatus === "LIVE" || rawStatus === "RUNNING");

  console.log(`[PASS STATUS DEBUG]`);
  console.log(`Station: ${pass.stationName || pass.stationId}`);
  console.log(`Pass: ${pass.stationId}`);
  console.log(`AOS: ${pass.aos}`);
  console.log(`LOS: ${pass.los}`);
  console.log(`NOW: ${new Date(now).toISOString()}`);
  console.log(`isActive: ${isActive}`);
  console.log(`Final Status: ${isActive ? "ACTIVE" : "INACTIVE"}`);

  return isActive;
};

export default function MonitoringDashboard() {
  const { t } = useI18n();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [duration, setDuration] = useState<string>('15m');
  const [refreshInterval, setRefreshInterval] = useState<string>('5s');
  const [statistic, setStatistic] = useState<string>('Average');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [regionModalOpen, setRegionModalOpen] = useState<boolean>(false);
  const [regionModalMode, setRegionModalMode] = useState<"list" | "add">("list");
  const requestCounter = React.useRef(0);

  const fetchData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    const currentRequestId = ++requestCounter.current;
    try {
      const dashboardData = await getMonitoringDashboard(duration, statistic);
      if (currentRequestId === requestCounter.current) {
        setData(dashboardData);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      if (currentRequestId === requestCounter.current) {
        setLoading(false);
        if (isManual) setIsRefreshing(false);
      }
    }
  };

  const handleRefresh = () => { fetchData(true); };

  useEffect(() => {
    let mounted = true;
    
    const intervalFetch = async () => {
      const currentRequestId = ++requestCounter.current;
      try {
        const dashboardData = await getMonitoringDashboard(duration, statistic);
        if (mounted && currentRequestId === requestCounter.current) {
          setData(dashboardData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        if (mounted && currentRequestId === requestCounter.current) {
          setLoading(false);
        }
      }
    };

    intervalFetch(); // initial fetch or when duration/statistic changes
    
    if (refreshInterval === "off") {
      return () => {
        mounted = false;
      };
    }

    const refreshMsMap: Record<string, number> = {
      "1s": 1000,
      "5s": 5000,
      "10s": 10000,
      "20s": 20000,
      "30s": 30000,
      "1m": 60000,
      "5m": 300000,
      "15m": 900000,
      "1h": 3600000,
      "6h": 21600000,
      "1d": 86400000,
    };
    const intervalMs = refreshMsMap[refreshInterval] || 5000;

    const interval = setInterval(intervalFetch, intervalMs);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [duration, refreshInterval, statistic]);

  const filteredData = useMemo(() => {
    if (!data) return null;

    // --- GLOBAL DATA ---
    const allStations = data.regions.flatMap(r => r.stations || []);
    const rawPasses = data.regions.flatMap(r => r.activePasses || []);
    
    // Strictly filter genuinely active passes at pass level and normalize status
    const allActivePasses = rawPasses.filter(isPassActive).map(p => ({
      ...p,
      status: "ACTIVE" as const
    }));

    // Debug logging for verification
    console.log(`[ACTIVE PASS FILTER]`);
    console.log(`Total passes received: ${rawPasses.length}`);
    console.log(`Active passes: ${allActivePasses.length}`);
    if (allActivePasses.length > 0) {
      console.log(`Active:`, allActivePasses.map(p => `${p.stationName || p.stationId} (${p.id})`));
    } else {
      console.log(`Active: none`);
    }

    console.log("[CP1 ACTIVE DEBUG]", {
      station: "CP1",
      activePass: allActivePasses.find(p => p.stationId === "CP1" || p.stationName?.includes("CP1")),
    });

    console.log("[CP2 ACTIVE DEBUG]", {
      station: "CP2",
      activePass: allActivePasses.find(p => p.stationId === "CP2" || p.stationName?.includes("CP2")),
    });

    allActivePasses.forEach(p => {
      console.log(`[ACTIVE PASS STATUS]\n${p.stationId}\nAOS: ${p.aos}\nLOS: ${p.los}\nNOW: ${new Date().toISOString()}\nSTATUS: ${p.status}`);
    });

    const allAlerts = data.regions.flatMap(r => r.alerts || []);
    const allUpcomingOperations = data.regions.flatMap(r => r.upcomingOperations || []);

    // --- REGION SPECIFIC DATA ---
    let activeRegions = data.regions;
    if (selectedRegionId) {
      const region = data.regions.find(r => r.id === selectedRegionId);
      if (region) {
        activeRegions = [region];
      }
    }

    // Metric data for the graph across regions (ActivePassChart isolates by selectedStationId)
    const metricData = data.regions.flatMap(r => r.passMetrics || []);
    
    // Pass the relevant region's active passes for the chart's AOS/LOS markers
    const regionActivePasses = selectedRegionId 
      ? allActivePasses.filter(p => {
          const parentRegion = data.regions.find(r => r.id === selectedRegionId);
          return parentRegion?.stations.some(s => s.id === p.stationId);
        })
      : allActivePasses;
    
    let infrastructureNodes = activeRegions[0]?.infrastructureNodes || [];
    
    if (!selectedRegionId && data.regions.length > 0) {
      // Compute a true global infrastructure health by taking the worst status across all regions for each node type
      const globalNodesMap = new Map<string, any>();
      
      data.regions.forEach(region => {
        (region.infrastructureNodes || []).forEach(node => {
          if (!globalNodesMap.has(node.id)) {
            globalNodesMap.set(node.id, { ...node });
          } else {
            const existing = globalNodesMap.get(node.id);
            // Upgrade status severity if needed (CRITICAL > WARNING > HEALTHY)
            if (node.status === "CRITICAL" || (node.status === "WARNING" && existing.status === "HEALTHY")) {
              existing.status = node.status;
            }
          }
        });
      });
      
      infrastructureNodes = Array.from(globalNodesMap.values());
    }

    const summary: DashboardSummary = {
      totalStations: allStations.length,
      onlineStations: allStations.filter(s => s.status === "ACTIVE" || s.status === "ONLINE" || s.status === "HEALTHY").length,
      activePasses: allActivePasses.length,
      rxLocked: allStations.filter(s => s.rx === "LOCKED").length,
      txActive: allStations.filter(s => s.tx === "ACTIVE").length,
      alerts: allAlerts.length
    };

    return {
      summary,
      groundStations: allStations,
      activePasses: regionActivePasses,
      allActivePasses,
      alerts: allAlerts,
      upcomingOperations: allUpcomingOperations,
      metricData,
      infrastructureNodes,
      regionActivePasses,
      activeRegionName: selectedRegionId && activeRegions.length > 0 ? activeRegions[0].name : "GLOBAL VIEW",
      activeRegionCity: selectedRegionId && activeRegions.length > 0 ? activeRegions[0].city : null,
      activeRegionId: selectedRegionId,
    };
  }, [data, selectedRegionId]);

  return (
    <MainLayout title={t("Monitoring Dashboard")} hideRightPanel={true}>
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
        {loading || !filteredData || !data ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "70%" }}>
            <CircularProgress sx={{ color: vars.accent }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            
            {/* 1. TOP ROW: SUMMARY CARDS (FULL WIDTH) */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)", xl: "repeat(6, 1fr)" }, gap: 1.5 }}>
              <SummaryCard 
                title={t("Total Stations")} 
                value={filteredData.summary.totalStations} 
                icon={<Radio size={24} />} 
              />
              <SummaryCard 
                title={t("Online")} 
                value={filteredData.summary.onlineStations} 
                subtitle={filteredData.summary.totalStations > 0 ? `${((filteredData.summary.onlineStations / filteredData.summary.totalStations) * 100).toFixed(1)}%` : "0%"}
                valueColor="#10B981"
                icon={<Globe size={24} />} 
              />
              <SummaryCard 
                title={t("Active Passes")} 
                value={filteredData.summary.activePasses} 
                valueColor="#0EA5E9"
                icon={<Satellite size={24} />} 
              />
              <SummaryCard 
                title={t("RX Locked")} 
                value={filteredData.summary.rxLocked} 
                valueColor="#10B981"
                icon={<Unlock size={24} />} 
              />
              <SummaryCard 
                title={t("TX Active")} 
                value={filteredData.summary.txActive} 
                valueColor="#0EA5E9"
                icon={<Antenna size={24} />} 
              />
              <SummaryCard 
                title={t("Alerts")} 
                value={filteredData.summary.alerts} 
                alert={filteredData.summary.alerts > 0}
                icon={<AlertTriangle size={24} />} 
              />
            </Box>

            {/* 2. MAIN AREA: FULL WIDTH MAP */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 0, overflow: "hidden" }}>
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("Network Topology Overview")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<Layers size={13} />}
                    onClick={() => {
                      setRegionModalMode("list");
                      setRegionModalOpen(true);
                    }}
                    sx={{
                      color: vars.textDim,
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: "none",
                      bgcolor: "rgba(255, 255, 255, 0.04)",
                      border: `1px solid rgba(255, 255, 255, 0.1)`,
                      borderRadius: "6px",
                      px: 1.2,
                      py: 0.3,
                      height: 28,
                      "&:hover": { color: vars.accent, bgcolor: "rgba(255, 255, 255, 0.08)" }
                    }}
                  >
                    Manage Regions
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<Plus size={13} />}
                    onClick={() => {
                      setRegionModalMode("add");
                      setRegionModalOpen(true);
                    }}
                    sx={{
                      ...PREMIUM_ACTION_BUTTON_SX,
                      height: 28,
                      px: 1.5,
                      fontSize: 11,
                      borderRadius: "6px",
                    }}
                  >
                    Add Region
                  </Button>
                </Box>
              </Box>
              <Box sx={{ p: 0 }}>
                <NetworkTopology 
                  selectedRegionId={selectedRegionId} 
                  onRegionSelect={setSelectedRegionId} 
                  dashboardData={data}
                  activePasses={filteredData.allActivePasses}
                />
              </Box>
            </Card>

            {/* 2.5 INFRASTRUCTURE CONNECTION FLOW (FULL WIDTH COMPACT) */}
            <Card sx={{ ...PREMIUM_CARD_SX, overflow: "hidden", height: "auto" }}>
              <Box sx={{ py: 0.8, px: 1.5, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.02)" }}>
                <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("Infrastructure Connection Flow")}
                </Typography>
              </Box>
              <Box sx={{ overflowX: "auto", px: 1.5, py: 1 }}>
                <InfrastructureFlow nodes={filteredData.infrastructureNodes} hideTitle={true} />
              </Box>
            </Card>

            {/* 2.6 PASSES & ALERTS GRID (2 COLUMNS, FIXED 280px HEIGHT) */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1.1fr 1fr" }, gap: 1.5, alignItems: "stretch" }}>
              
              {/* Column 1: Active Passes (Fixed 280px Height with Internal Scroll) */}
              <Card sx={{ ...PREMIUM_CARD_SX, height: 280, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Box sx={{ px: 1.25, py: 0.8, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t(`Current Active Passes (${filteredData.activePasses.length})`)}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1, 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: 1, 
                  overflowY: "auto",
                  flex: 1,
                  "&::-webkit-scrollbar": { width: "5px" },
                  "&::-webkit-scrollbar-track": { bgcolor: "rgba(0,0,0,0.15)" },
                  "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.15)", borderRadius: "3px" },
                  "&::-webkit-scrollbar-thumb:hover": { bgcolor: "rgba(255,255,255,0.25)" }
                }}>
                  {filteredData.activePasses.length === 0 ? (
                    <Typography sx={{ fontSize: 11.5, color: vars.textDim, textAlign: "center", py: 3 }}>
                      No active passes
                    </Typography>
                  ) : (
                    filteredData.activePasses.map(pass => (
                      <ActivePassCard key={pass.id || pass.stationId} pass={pass} />
                    ))
                  )}
                </Box>
              </Card>
              
              {/* Column 2: Alerts (Fixed 280px Height) */}
              <Card sx={{ ...PREMIUM_CARD_SX, height: 280, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <Box sx={{ px: 1.25, py: 0.8, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.02)" }}>
                  <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Active Alerts")}
                  </Typography>
                </Box>
                <Box sx={{ p: 0, flex: 1, overflowY: "auto" }}>
                  <ActiveAlerts alerts={filteredData.alerts} />
                </Box>
              </Card>

            </Box>

            {/* FULL WIDTH: Eb/No Chart */}
            <Card sx={{ ...PREMIUM_CARD_SX, overflow: "hidden", minWidth: 0, height: 400, display: "flex", flexDirection: "column" }}>
              <Box sx={{ py: 1, px: 1.5, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.02)" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("Eb/No (dB) & IF Level (dBm) Live Telemetry")}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, overflow: "hidden", p: 0 }}>
                <ActivePassChart 
                  data={filteredData.metricData}
                  regions={data?.regions}
                  passes={filteredData.regionActivePasses}
                  duration={duration}
                  onDurationChange={setDuration}
                  refreshInterval={refreshInterval}
                  onRefreshIntervalChange={setRefreshInterval}
                  statistic={statistic}
                  onStatisticChange={setStatistic}
                  onRefresh={handleRefresh}
                  isRefreshing={isRefreshing}
                />
              </Box>
            </Card>

            {/* 3. LOWER CONTENT GRID: 2 Columns */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1.1fr 1fr" }, gap: 1.5, alignItems: "stretch" }}>
              
              {/* Column 1: Ground Stations */}
              <Card sx={{ ...PREMIUM_CARD_SX, overflow: "hidden", minWidth: 0, height: 280, display: "flex", flexDirection: "column" }}>
                <Box sx={{ py: 1, px: 1.5, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.02)" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 900, color: vars.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Ground Stations Summary")}
                  </Typography>
                </Box>
                <Box sx={{ overflowX: "auto", flex: 1, overflowY: "hidden" }}>
                  <GroundStationTable stations={filteredData.groundStations} />
                </Box>
              </Card>

              {/* Column 3: Upcoming Operations */}
              <Card sx={{ ...PREMIUM_CARD_SX, overflow: "hidden", minWidth: 0, height: 280, display: "flex", flexDirection: "column" }}>
                <Box sx={{ py: 1, px: 1.5, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.02)" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 900, color: vars.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Upcoming Passes (Next 24 Hours)")}
                  </Typography>
                </Box>
                <Box sx={{ overflowX: "auto", flex: 1, overflowY: "hidden" }}>
                  <UpcomingOperations operations={filteredData.upcomingOperations} />
                </Box>
              </Card>

            </Box>

            {/* 4. FULL WIDTH: Infrastructure Health */}
            <Card sx={{ ...PREMIUM_CARD_SX, overflow: "hidden" }}>
              <Box sx={{ p: 1.5, borderBottom: `1px solid ${vars.border}`, bgcolor: "rgba(255,255,255,0.02)" }}>
                <Typography sx={{ fontSize: 12, fontWeight: 900, color: vars.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t("Infrastructure Health (By Region)")}
                </Typography>
              </Box>
              <RegionInfrastructureHealth regions={data.regions} selectedRegionId={selectedRegionId} />
            </Card>

            {/* Region Management & Add Region Modal */}
            <RegionManagementModal
              open={regionModalOpen}
              onClose={() => setRegionModalOpen(false)}
              onRegionsChanged={handleRefresh}
              initialMode={regionModalMode}
            />
          </Box>
        )}
      </Box>
    </MainLayout>
  );
}
