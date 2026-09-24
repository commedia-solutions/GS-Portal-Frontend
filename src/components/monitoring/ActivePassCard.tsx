import React, { useState } from "react";
import { Card, Box, Typography, IconButton } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { PREMIUM_CARD_SX } from "../../ui/styles";
import { vars } from "../../ui/toast/themeBridge";
import type { ActivePass } from "../../types/monitoring/dashboard";
import { formatPassDate, formatPassTime, formatPassDuration } from "../../utils/passUtils";
import { ConnectDataDefenderButton } from "./ConnectDataDefenderButton";

export const ActivePassCard: React.FC<{ pass: ActivePass }> = ({ pass }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const isActive = pass.status === "ACTIVE";

  const getStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "RUNNING":
      case "ONLINE":
      case "HEALTHY":
      case "LOCKED":
      case "CONNECTED":
        return "#10B981";
      case "WARNING":
      case "SEARCHING":
      case "PENDING":
      case "STARTING":
        return "#F59E0B";
      case "CRITICAL":
      case "OFFLINE":
      case "STOPPED":
      case "STOPPING":
      case "OFF":
      case "UNLOCKED":
      case "ERROR":
        return "#EF4444";
      default:
        return vars.textDim;
    }
  };

  const isSD1 = String(pass.stationId).includes("1");
  const satelliteVal = (pass.satellite && pass.satellite !== "CP1" && pass.satellite !== "CP2") 
    ? pass.satellite 
    : (isSD1 ? "SPADEX-SD1" : "SPADEX-SD2");

  const dateVal = formatPassDate(pass.aos || pass.date);
  const aosVal = formatPassTime(pass.aos);
  const losVal = formatPassTime(pass.los);
  const durationVal = formatPassDuration(pass.aos, pass.los);

  const receiverEc2Val = pass.receiverEc2 || "RUNNING";
  const sdrEc2Val = pass.sdrEc2 || "RUNNING";

  const rxVal = pass.rxStatus || "--";
  const txVal = pass.txStatus || "--";
  const ebNoVal = pass.ebNo != null 
    ? `${typeof pass.ebNo === 'number' ? pass.ebNo.toFixed(2) : pass.ebNo} dB` 
    : "--";
  const ifLevelVal = pass.ifLevel != null 
    ? `${typeof pass.ifLevel === 'number' ? pass.ifLevel.toFixed(2) : pass.ifLevel} dBm` 
    : "--";

  const connectionVal = pass.connection || (isActive ? "CONNECTED" : "OFFLINE");
  
  const lastUpdateVal = (() => {
    if (!pass.lastUpdate || pass.lastUpdate === "No Data") return "No Data";
    if (pass.lastUpdate === "Live" || pass.lastUpdate === "STALE" || pass.lastUpdate === "ERROR") return pass.lastUpdate;
    const d = new Date(pass.lastUpdate);
    if (!isNaN(d.getTime())) {
      const hh = d.getUTCHours().toString().padStart(2, "0");
      const mm = d.getUTCMinutes().toString().padStart(2, "0");
      return `${hh}:${mm} UTC`;
    }
    return pass.lastUpdate;
  })();

  const rawOperation = (pass as any).operation || pass.operations || (pass as any).oper || (pass as any).passType || (pass as any).type;
  const operationsVal = rawOperation && rawOperation !== "None" && rawOperation !== "null" && rawOperation !== "undefined" && String(rawOperation).trim() !== ""
    ? String(rawOperation).trim()
    : "--";

  const sectionHeaderSx = {
    fontSize: 10,
    fontWeight: 900,
    color: vars.accent,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    mb: 0.35,
    mt: 0.5,
  };

  const labelSx = {
    fontSize: 9,
    color: vars.textDim,
    lineHeight: 1.1,
  };

  const valueSx = {
    fontSize: 10.5,
    color: vars.text,
    fontWeight: 700,
    lineHeight: 1.25,
  };

    console.log("[ACTIVE PASS CARD]", pass.stationId, pass.status, pass.aos, pass.los);
    console.log("[ACTIVE PASS CARD DATA]", {
      stationId: pass?.stationId,
      stationName: pass?.stationName,
      passId: pass?.id,
      satelliteName: pass?.satellite,
      status: pass?.status,
      aos: pass?.aos,
      los: pass?.los,
      duration: pass?.duration
    });

    return (
    <Card 
      sx={{ 
        ...PREMIUM_CARD_SX, 
        p: 1.1, 
        flexShrink: 0,
        border: `1px solid rgba(14, 165, 233, 0.35)`,
        bgcolor: "rgba(15, 23, 42, 0.8)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.35)",
        transition: "all 0.2s ease"
      }}
    >
      {/* Header with Expand / Collapse Toggle */}
      <Box 
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          cursor: "pointer",
          pb: isExpanded ? 0.6 : 0, 
          borderBottom: isExpanded ? "1px solid rgba(255, 255, 255, 0.08)" : "none" 
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 900, color: vars.text, letterSpacing: "0.03em", textTransform: "uppercase" }}>
          {pass.stationName || pass.stationId} ({pass.stationId})
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 0.5, 
            px: 0.6, 
            py: 0.15, 
            borderRadius: "3px", 
            bgcolor: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.3)' 
          }}>
            <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#10B981", boxShadow: "0 0 6px #10B981" }} />
            <Typography sx={{ fontSize: 9, fontWeight: 900, color: '#10B981', letterSpacing: "0.04em" }}>
              {pass.status || "ACTIVE"}
            </Typography>
          </Box>
          <IconButton size="small" sx={{ p: 0.1, color: vars.textDim }}>
            {isExpanded ? <KeyboardArrowUp sx={{ fontSize: 16 }} /> : <KeyboardArrowDown sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>
      </Box>

      {/* Collapsed Compact Preview */}
      {!isExpanded && (
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 0.6, mt: 0.4, borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <Typography sx={{ fontSize: 9, color: vars.textDim }}>Satellite:</Typography>
            <Typography sx={{ fontSize: 10, color: isSD1 ? "#60A5FA" : "#FACC15", fontWeight: 700 }}>
              {satelliteVal}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: 9, color: isSD1 ? "#60A5FA" : "#EAB308", fontWeight: 600 }}>Eb/No: {ebNoVal}</Typography>
            <Typography sx={{ fontSize: 9, color: "#0EA5E9", fontWeight: 600 }}>IF: {ifLevelVal}</Typography>
          </Box>
        </Box>
      )}

      {/* Expanded Full Compact View */}
      {isExpanded && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4, mt: 0.4 }}>
          {/* 1. PASS DETAILS */}
          <Box>
            <Typography sx={sectionHeaderSx}>
              PASS DETAILS
            </Typography>
            {/* Row 1: Satellite | Date */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6, mb: 0.4 }}>
              <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                <Typography sx={labelSx}>Satellite</Typography>
                <Typography sx={{ ...valueSx, color: isSD1 ? "#60A5FA" : "#FACC15", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {satelliteVal}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                <Typography sx={labelSx}>Date</Typography>
                <Typography sx={{ ...valueSx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {dateVal}
                </Typography>
              </Box>
            </Box>
            {/* Row 2: AOS | LOS */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6, mb: 0.4 }}>
              <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                <Typography sx={labelSx}>AOS</Typography>
                <Typography sx={{ ...valueSx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {aosVal}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                <Typography sx={labelSx}>LOS</Typography>
                <Typography sx={{ ...valueSx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {losVal}
                </Typography>
              </Box>
            </Box>
            {/* Row 3: Duration | Operation */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6 }}>
              <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                <Typography sx={labelSx}>Duration</Typography>
                <Typography sx={{ ...valueSx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {durationVal}
                </Typography>
              </Box>
              <Box sx={{ minWidth: 0, overflow: "hidden" }}>
                <Typography sx={labelSx}>Operation</Typography>
                <Typography sx={{ ...valueSx, wordBreak: "break-word" }}>
                  {operationsVal}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 2. INFRASTRUCTURE */}
          <Box sx={{ pt: 0.4, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <Typography sx={sectionHeaderSx}>
              INFRASTRUCTURE
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6, mb: 0.6 }}>
              <Box>
                <Typography sx={labelSx}>Receiver EC2</Typography>
                <Typography sx={{ ...valueSx, color: getStatusColor(receiverEc2Val) }}>
                  {receiverEc2Val}
                </Typography>
              </Box>
              <Box>
                <Typography sx={labelSx}>SDR EC2</Typography>
                <Typography sx={{ ...valueSx, color: getStatusColor(sdrEc2Val) }}>
                  {sdrEc2Val}
                </Typography>
              </Box>
            </Box>
            <ConnectDataDefenderButton pass={pass} />
          </Box>

          {/* 3. RF MONITORING */}
          <Box sx={{ pt: 0.4, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <Typography sx={sectionHeaderSx}>
              RF MONITORING
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6, mb: 0.4 }}>
              <Box>
                <Typography sx={labelSx}>RX</Typography>
                <Typography sx={{ ...valueSx, color: getStatusColor(rxVal) }}>
                  {rxVal}
                </Typography>
              </Box>
              <Box>
                <Typography sx={labelSx}>TX</Typography>
                <Typography sx={{ ...valueSx, color: txVal === "ACTIVE" ? "#0EA5E9" : getStatusColor(txVal) }}>
                  {txVal}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6 }}>
              <Box>
                <Typography sx={labelSx}>Eb/No</Typography>
                <Typography sx={{ ...valueSx, color: "#A855F7" }}>
                  {ebNoVal}
                </Typography>
              </Box>
              <Box>
                <Typography sx={labelSx}>IF Level</Typography>
                <Typography sx={{ ...valueSx, color: "#0EA5E9" }}>
                  {ifLevelVal}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 4. SYSTEM */}
          <Box sx={{ pt: 0.4, borderTop: "1px solid rgba(255, 255, 255, 0.06)" }}>
            <Typography sx={sectionHeaderSx}>
              SYSTEM
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.6 }}>
              <Box>
                <Typography sx={labelSx}>Connection</Typography>
                <Typography sx={{ ...valueSx, color: getStatusColor(connectionVal) }}>
                  {connectionVal}
                </Typography>
              </Box>
              <Box>
                <Typography sx={labelSx}>Last Update</Typography>
                <Typography sx={valueSx}>
                  {lastUpdateVal}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
};
