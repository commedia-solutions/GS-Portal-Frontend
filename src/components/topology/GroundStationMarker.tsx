import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { GroundStation } from "../../types/topologyTypes";

interface GroundStationMarkerProps {
  station: GroundStation;
  isSelected: boolean;
  onSelect: (entity: GroundStation) => void;
  x: number;
  y: number;
}

export const GroundStationMarker: React.FC<GroundStationMarkerProps> = ({ station, isSelected, onSelect, x, y }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "#00FF66"; // Neon Green for Live/Active Passes
      case "ONLINE":
      case "HEALTHY":
      case "SCHEDULED":
        return "#10B981"; // Green
      case "WARNING":
        return "#F59E0B"; // Orange/Yellow
      case "OFFLINE":
      case "CRITICAL":
        return "#EF4444"; // Red
      case "NO PASS":
      case "UNKNOWN":
      default:
        return "#64748b"; // Gray
    }
  };

  const statusColor = getStatusColor(station.status);

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        zIndex: isSelected ? 30 : 20,
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(station);
      }}
    >
      {/* Marker Center & Rings: Exactly centered at (0, 0) relative to (x%, y%) */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 36,
          height: 36,
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Outer Glowing Ring */}
        <Box
          sx={{
            position: "absolute",
            width: isSelected ? 34 : 22,
            height: isSelected ? 34 : 22,
            borderRadius: "50%",
            border: `1.5px solid ${statusColor}`,
            backgroundColor: isSelected ? `${statusColor}22` : `${statusColor}0a`,
            boxShadow: isSelected
              ? `0 0 16px ${statusColor}aa, inset 0 0 8px ${statusColor}33`
              : `0 0 8px ${statusColor}44`,
            transition: "all 0.3s ease",
            animation: isSelected || station.status === "ACTIVE" ? "pulse 2s infinite" : "none",
            "@keyframes pulse": {
              "0%": { transform: "scale(0.95)", opacity: 0.8 },
              "50%": { transform: "scale(1.15)", opacity: 0.3 },
              "100%": { transform: "scale(0.95)", opacity: 0.8 },
            },
          }}
        />

        {/* Center Solid Dot */}
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: statusColor,
            boxShadow: `0 0 6px ${statusColor}`,
            zIndex: 2,
            transition: "transform 0.2s ease",
            ...(isHovered && {
              transform: "scale(1.25)",
            }),
          }}
        />
      </Box>

      {/* Permanent Small Clean Region Label: Positioned directly below the marker center */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 18,
          transform: "translateX(-50%)",
          bgcolor: "rgba(11, 18, 24, 0.9)",
          backdropFilter: "blur(6px)",
          border: `1px solid ${isSelected ? statusColor : "rgba(255,255,255,0.12)"}`,
          borderRadius: "4px",
          px: 0.9,
          py: 0.25,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.15,
          boxShadow: isSelected
            ? `0 4px 12px rgba(0,0,0,0.8), 0 0 8px ${statusColor}44`
            : "0 2px 6px rgba(0,0,0,0.6)",
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        <Typography
          sx={{
            fontSize: 9.5,
            fontWeight: 800,
            color: "#f8fafc",
            letterSpacing: 0.5,
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          {station.name}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              bgcolor: statusColor,
              boxShadow: `0 0 4px ${statusColor}`,
            }}
          />
          <Typography
            sx={{
              fontSize: 8,
              fontWeight: 700,
              color: statusColor,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              lineHeight: 1,
            }}
          >
            {station.status}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
