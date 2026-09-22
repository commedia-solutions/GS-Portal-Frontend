import React from "react";
import { Box, Typography } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { AwsRegion } from "../../types/topologyTypes";

interface AwsRegionMarkerProps {
  region: AwsRegion;
  isSelected: boolean;
  onSelect: (entity: AwsRegion) => void;
  x: number;
  y: number;
}

export const AwsRegionMarker: React.FC<AwsRegionMarkerProps> = ({ region, isSelected, onSelect, x, y }) => {

  const getStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "#10B981"; // Green
      case "WARNING":
        return "#F59E0B"; // Yellow/Orange
      case "CRITICAL":
        return "#EF4444"; // Red
      default:
        return "#475569";
    }
  };

  const statusColor = getStatusColor(region.status);
  const strokeColor = isSelected ? vars.accent : "#475569";
  const fillColor = isSelected ? `${vars.accent}33` : "transparent";

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 5, // Under ground stations
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
      onClick={() => onSelect(region)}
    >
      {/* Small outlined hexagon representation */}
      <Box
        sx={{
          width: 12,
          height: 12,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.2)"
          },
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" style={{ overflow: "visible" }}>
          <polygon 
            points="12,2 22,7.5 22,18.5 12,24 2,18.5 2,7.5" 
            fill={fillColor} 
            stroke={strokeColor} 
            strokeWidth={isSelected ? 2 : 1.5} 
          />
        </svg>
      </Box>

      {/* Basic Tooltip for AWS Region when selected */}
      {isSelected && (
        <Box
          sx={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            mb: 1,
            bgcolor: "rgba(11, 18, 24, 0.95)",
            border: `1px solid ${vars.border}`,
            borderRadius: "4px",
            p: 1,
            minWidth: 80,
            pointerEvents: "none",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <Typography sx={{ fontSize: 9, color: vars.textDim, whiteSpace: "nowrap", textTransform: "uppercase" }}>
            AWS REGION
          </Typography>
          <Typography sx={{ fontSize: 10, fontWeight: "bold", color: vars.text, whiteSpace: "nowrap" }}>
            {region.regionCode}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
