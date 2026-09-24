import React, { useState, useEffect } from "react";
import { Box, Typography, IconButton, Divider, Collapse } from "@mui/material";
import { X, ChevronDown, ChevronUp, Server, Globe, Network, ShieldCheck } from "lucide-react";
import { vars } from "../../ui/toast/themeBridge";
import type { TopologyEntity, GroundStation, AwsRegion, AwsHub } from "../../types/topologyTypes";
import { formatPassDate, formatPassTime, formatPassDuration } from "../../utils/passUtils";
import { ConnectDataDefenderButton } from "../monitoring/ConnectDataDefenderButton";

interface TopologyDetailsPanelProps {
  entity: TopologyEntity | null;
  stations?: GroundStation[];
  onClose: () => void;
  onSelectStation?: (stationId: string) => void;
}

export const TopologyDetailsPanel: React.FC<TopologyDetailsPanelProps> = ({
  entity,
  stations = [],
  onClose,
  onSelectStation,
}) => {
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  // Reset selected station when the selected location/region changes
  useEffect(() => {
    setSelectedStationId(null);
  }, [entity?.id]);

  if (!entity) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#00FF66"; // Neon Green
      case "HEALTHY":
      case "ONLINE":
      case "LOCKED":
      case "AVAILABLE":
      case "CONFIGURED":
      case "RUNNING":
        return "#10B981";
      case "WARNING":
      case "SEARCHING":
        return "#F59E0B";
      case "CRITICAL":
      case "OFFLINE":
      case "STOPPED":
        return "#EF4444";
      default:
        return vars.textDim;
    }
  };

  // 1. AWS CENTRAL HUB DETAILS PANEL
  if (entity.type === "AWS_HUB") {
    const hub = entity as AwsHub;
    const hubColor = "#FF9900";

    return (
      <Box sx={{ p: 2.5, height: "100%", overflowY: "auto", position: "relative" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  transform: "rotate(45deg)",
                  bgcolor: hubColor,
                  borderRadius: "1px",
                }}
              />
              <Typography sx={{ fontSize: 16, fontWeight: 900, color: hubColor, textTransform: "uppercase" }}>
                {hub.name}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: vars.text, mb: 0.5 }}>
              {hub.locationName || `${hub.city}, ${hub.country}`}
            </Typography>
            <Typography sx={{ fontSize: 11, color: vars.textDim, textTransform: "uppercase", mb: 1 }}>
              AWS REGION: {hub.regionCode}
            </Typography>
            <Box sx={{ display: "inline-flex", flexDirection: "column" }}>
              <Typography sx={{ fontSize: 10, color: vars.textDim, textTransform: "uppercase" }}>
                HUB STATUS
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#10B981", fontWeight: 800, letterSpacing: 0.5 }}>
                {hub.status}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: vars.textDim, mt: -0.5, mr: -0.5 }}>
            <X size={18} />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: vars.borderWeak, mb: 2 }} />

        {/* Central Infrastructure Overview Card */}
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: vars.textDim, textTransform: "uppercase", mb: 1.5 }}>
          Central Infrastructure Overview
        </Typography>

        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.02)",
            border: `1px solid ${vars.borderWeak}`,
            borderRadius: 1,
            p: 1.5,
            mb: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <Box>
              <Typography sx={{ fontSize: 10, color: vars.textDim }}>Hub Role</Typography>
              <Typography sx={{ fontSize: 11, color: vars.text, fontWeight: "bold" }}>
                Central Telemetry Aggregator
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, color: vars.textDim }}>Region Code</Typography>
              <Typography sx={{ fontSize: 11, color: hubColor, fontWeight: "bold" }}>
                {hub.regionCode}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, color: vars.textDim }}>Availability Zones</Typography>
              <Typography sx={{ fontSize: 11, color: vars.text, fontWeight: "bold" }}>
                3 AZs
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 10, color: vars.textDim }}>Network Backbone</Typography>
              <Typography sx={{ fontSize: 11, color: "#10B981", fontWeight: "bold" }}>
                CONNECTED
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Connected Ground Station Regions */}
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: vars.textDim, textTransform: "uppercase", mb: 1.5 }}>
          Connected Ground Stations (4)
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {[
            { name: "Africa (Cape Town)", code: "af-south-1", stations: "CP1, CP2" },
            { name: "Europe (Dublin)", code: "eu-west-1", stations: "DU1, DU2" },
            { name: "South America (Punta Arenas)", code: "sa-east-1", stations: "PA1, PA2" },
            { name: "Asia Pacific (Dubbo)", code: "ap-southeast-2", stations: "DB1, DB2" },
          ].map((item) => (
            <Box
              key={item.code}
              sx={{
                bgcolor: "rgba(255,255,255,0.02)",
                border: `1px solid ${vars.borderWeak}`,
                borderRadius: 1,
                p: 1.2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: "bold", color: vars.text, textTransform: "uppercase" }}>
                  {item.name}
                </Typography>
                <Typography sx={{ fontSize: 10, color: vars.textDim }}>
                  Stations: {item.stations} | {item.code}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#10B981" }} />
                <Typography sx={{ fontSize: 10, color: "#10B981", fontWeight: "bold" }}>
                  LINKED
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  // 2. AWS GROUND STATION REGION DETAILS PANEL
  if (entity.type === "region") {
    const region = entity as AwsRegion;
    const regionStations = stations.filter((s) => region.linkedStations.includes(s.id));
    const statusColor = getStatusColor(region.status);

    return (
      <Box sx={{ p: 2.5, height: "100%", overflowY: "auto", position: "relative" }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 900, color: vars.text, mb: 0.5, textTransform: "uppercase" }}>
              {region.name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: vars.textDim, textTransform: "uppercase", mb: 1 }}>
              AWS REGION: {region.regionCode}
            </Typography>
            <Box sx={{ display: "inline-flex", flexDirection: "column" }}>
              <Typography sx={{ fontSize: 10, color: vars.textDim, textTransform: "uppercase" }}>
                REGION STATUS
              </Typography>
              <Typography sx={{ fontSize: 12, color: statusColor, fontWeight: 800, letterSpacing: 0.5 }}>
                {region.status}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} sx={{ color: vars.textDim, mt: -0.5, mr: -0.5 }}>
            <X size={18} />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: vars.borderWeak, mb: 2 }} />

        {/* Current Active Passes Header */}
        <Typography sx={{ fontSize: 12, fontWeight: 800, color: vars.textDim, textTransform: "uppercase", mb: 1.5 }}>
          CURRENT ACTIVE PASSES ({regionStations.length})
        </Typography>

        {/* Render Station Cards */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {regionStations.map((station, index) => {
            // Default to expanding the first station if none explicitly clicked, or the clicked station
            const isSelected = selectedStationId === station.id || (selectedStationId === null && index === 0);

            // Pass Status derived strictly from pass schedule timing (AOS, LOS, current time)
            const passTimingStatus = (() => {
              const now = Date.now();
              const rawAos = station.currentPass?.aos;
              const rawLos = station.currentPass?.los;

              if (rawAos && rawLos && rawAos !== "--" && rawLos !== "--") {
                const tAos = new Date(rawAos).getTime();
                const tLos = new Date(rawLos).getTime();
                if (!isNaN(tAos) && !isNaN(tLos)) {
                  if (now < tAos) return "UPCOMING";
                  if (now >= tAos && now <= tLos) return "ACTIVE";
                  if (now > tLos) return "ENDED";
                }
              }

              // Fallback to explicit status if timing string wasn't fully parseable ISO
              if (station.currentPass?.status === "ACTIVE" || (station.status as string) === "ACTIVE") {
                return "ACTIVE";
              }
              if (station.status === "ONLINE" || (station.status as string) === "HEALTHY") {
                return "ONLINE";
              }
              return (station.status as string) || "OFFLINE";
            })();

            const sColor = getStatusColor(passTimingStatus);

            const satelliteVal = (station.currentPass?.satellite && station.currentPass.satellite !== "CP1" && station.currentPass.satellite !== "CP2") 
              ? station.currentPass.satellite 
              : (station.id.includes("1") ? "SPADEX-SD1" : "SPADEX-SD2");

            const dateVal = formatPassDate(station.currentPass?.aos || station.currentPass?.date);
            const aosVal = formatPassTime(station.currentPass?.aos);
            const losVal = formatPassTime(station.currentPass?.los);
            const durationVal = formatPassDuration(station.currentPass?.aos, station.currentPass?.los);

            const rawOperation = station.currentPass?.operations || (station.currentPass as any)?.operation;
            const operationsVal = rawOperation && rawOperation !== "None" && rawOperation !== "null" && rawOperation !== "undefined" && String(rawOperation).trim() !== ""
              ? String(rawOperation).trim()
              : "--";

            const receiverEc2Val = (station.infrastructure?.receiverEc2 && station.infrastructure.receiverEc2 !== "UNKNOWN")
              ? station.infrastructure.receiverEc2
              : (station.status === "ONLINE" || station.status === "ACTIVE" ? "RUNNING" : "STOPPED");
            const sdrEc2Val = (station.infrastructure?.sdrEc2 && station.infrastructure.sdrEc2 !== "UNKNOWN")
              ? station.infrastructure.sdrEc2
              : (station.status === "ONLINE" || station.status === "ACTIVE" ? "RUNNING" : "STOPPED");

            const rxVal = station.infrastructure?.rxStatus || "--";
            const txVal = station.infrastructure?.txStatus || "--";
            const ebNoVal = station.metrics?.ebNo != null ? `${station.metrics.ebNo.toFixed(2)} dB` : "--";
            const ifLevelVal = station.metrics?.ifLevel != null ? `${station.metrics.ifLevel.toFixed(2)} dBm` : "--";

            const connectionVal = (station.system?.connection && station.system.connection !== "UNKNOWN")
              ? station.system.connection
              : (station.status === "ONLINE" || station.status === "ACTIVE" || station.metrics?.ebNo != null ? "ONLINE" : "OFFLINE");
            const lastUpdateVal = station.lastUpdate && station.lastUpdate !== "No Data" ? station.lastUpdate : (station.metrics?.ebNo != null ? "Live" : "No Data");

            return (
              <Box
                key={station.id}
                sx={{
                  bgcolor: "rgba(255,255,255,0.02)",
                  border: `1px solid ${isSelected ? vars.accent : vars.borderWeak}`,
                  borderRadius: 1,
                  p: 1.5,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: isSelected ? vars.accent : vars.border,
                    bgcolor: "rgba(255,255,255,0.04)",
                  },
                }}
              >
                {/* Station Header (Click to toggle) */}
                <Box
                  onClick={() => {
                    setSelectedStationId(isSelected ? "NONE" : station.id);
                    if (onSelectStation && !isSelected) {
                      onSelectStation(station.id);
                    }
                  }}
                  sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 900, color: vars.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      {region.name} ({station.id})
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 11,
                        color: sColor,
                        fontWeight: 900,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                        mt: 0.25,
                      }}
                    >
                      {passTimingStatus}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: vars.textDim, p: 0.5 }}>
                    {isSelected ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </IconButton>
                </Box>

                {/* Expanded Details: 4 Explicitly Separated Sections */}
                <Collapse in={isSelected}>
                  <Box sx={{ mt: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
                    
                    {/* 1. PASS DETAILS */}
                    <Box sx={{ pt: 1.25, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                        PASS DETAILS
                      </Typography>
                      {/* Row 1: Satellite | Date */}
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1 }}>
                        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>Satellite</Typography>
                          <Typography sx={{ fontSize: 11, color: station.id.includes("1") ? "#60A5FA" : "#FACC15", fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {satelliteVal}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>Date</Typography>
                          <Typography sx={{ fontSize: 11, color: vars.text, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {dateVal}
                          </Typography>
                        </Box>
                      </Box>
                      {/* Row 2: AOS | LOS */}
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1 }}>
                        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>AOS</Typography>
                          <Typography sx={{ fontSize: 11, color: vars.text, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {aosVal}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>LOS</Typography>
                          <Typography sx={{ fontSize: 11, color: vars.text, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {losVal}
                          </Typography>
                        </Box>
                      </Box>
                      {/* Row 3: Duration | Operation */}
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>Duration</Typography>
                          <Typography sx={{ fontSize: 11, color: vars.text, fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {durationVal}
                          </Typography>
                        </Box>
                        <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>Operation</Typography>
                          <Typography sx={{ fontSize: 11, color: vars.text, fontWeight: "bold", wordBreak: "break-word" }}>
                            {operationsVal}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* 2. INFRASTRUCTURE */}
                    <Box sx={{ pt: 1.25, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                        INFRASTRUCTURE
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1 }}>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>Receiver EC2</Typography>
                          <Typography sx={{ fontSize: 11, color: getStatusColor(receiverEc2Val), fontWeight: "bold" }}>
                            {receiverEc2Val}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>SDR EC2</Typography>
                          <Typography sx={{ fontSize: 11, color: getStatusColor(sdrEc2Val), fontWeight: "bold" }}>
                            {sdrEc2Val}
                          </Typography>
                        </Box>
                      </Box>
                      <ConnectDataDefenderButton pass={station} />
                    </Box>

                    {/* 3. RF MONITORING */}
                    <Box sx={{ pt: 1.25, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                        RF MONITORING
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, mb: 1 }}>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>RX</Typography>
                          <Typography sx={{ fontSize: 11, color: getStatusColor(rxVal), fontWeight: "bold" }}>
                            {rxVal}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>TX</Typography>
                          <Typography sx={{ fontSize: 11, color: getStatusColor(txVal), fontWeight: "bold" }}>
                            {txVal}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>Eb/No</Typography>
                          <Typography sx={{ fontSize: 11, color: "#A855F7", fontWeight: "bold" }}>
                            {ebNoVal}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>IF Level</Typography>
                          <Typography sx={{ fontSize: 11, color: "#0EA5E9", fontWeight: "bold" }}>
                            {ifLevelVal}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* 4. SYSTEM */}
                    <Box sx={{ pt: 1.25, borderTop: `1px solid rgba(255,255,255,0.08)` }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
                        SYSTEM
                      </Typography>
                      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>Connection</Typography>
                          <Typography sx={{ fontSize: 11, color: getStatusColor(connectionVal), fontWeight: "bold" }}>
                            {connectionVal}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ fontSize: 10, color: vars.textDim }}>Last Update</Typography>
                          <Typography sx={{ fontSize: 11, color: vars.text, fontWeight: "bold" }}>
                            {lastUpdateVal}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // 3. SINGLE STATION FALLBACK
  const station = entity as GroundStation;
  const statusColor = getStatusColor(station.status);

  return (
    <Box sx={{ p: 2.5, height: "100%", overflowY: "auto", position: "relative" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 900, color: vars.text, mb: 0.5, textTransform: "uppercase" }}>
            {station.name}
          </Typography>
          <Typography sx={{ fontSize: 11, color: vars.textDim, textTransform: "uppercase", mb: 1 }}>
            STATION ID: {station.id}
          </Typography>
          <Typography sx={{ fontSize: 12, color: statusColor, fontWeight: 800, letterSpacing: 0.5 }}>
            {station.status}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: vars.textDim, mt: -0.5, mr: -0.5 }}>
          <X size={18} />
        </IconButton>
      </Box>
      <Typography sx={{ fontSize: 12, color: vars.textDim }}>
        Please select a region on the map to view grouped station cards.
      </Typography>
    </Box>
  );
};
