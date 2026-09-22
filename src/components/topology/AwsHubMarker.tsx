import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { AwsHub } from "../../types/topologyTypes";

interface AwsHubMarkerProps {
  hub: AwsHub;
  isSelected: boolean;
  onSelect: (entity: AwsHub) => void;
  x: number;
  y: number;
}

export const AwsHubMarker: React.FC<AwsHubMarkerProps> = ({ hub, isSelected, onSelect, x, y }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hubColor = "#FF9900"; // AWS signature orange / gold

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        zIndex: isSelected ? 35 : 25,
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(hub);
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
            width: isSelected ? 36 : 26,
            height: isSelected ? 36 : 26,
            borderRadius: "50%",
            border: `1.5px solid ${hubColor}`,
            backgroundColor: isSelected ? `${hubColor}22` : `${hubColor}0d`,
            boxShadow: isSelected
              ? `0 0 18px ${hubColor}bb, inset 0 0 10px ${hubColor}44`
              : `0 0 10px ${hubColor}55`,
            transition: "all 0.3s ease",
            animation: "hubPulse 2.5s infinite",
            "@keyframes hubPulse": {
              "0%": { transform: "scale(0.92)", opacity: 0.9 },
              "50%": { transform: "scale(1.18)", opacity: 0.35 },
              "100%": { transform: "scale(0.92)", opacity: 0.9 },
            },
          }}
        />

        {/* Diamond / Hexagon Central Node Icon */}
        <Box
          sx={{
            width: 12,
            height: 12,
            transform: "rotate(45deg)",
            backgroundColor: hubColor,
            borderRadius: "2px",
            boxShadow: `0 0 8px ${hubColor}`,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
            ...(isHovered && {
              transform: "rotate(45deg) scale(1.15)",
            }),
          }}
        >
          <Box
            sx={{
              width: 4,
              height: 4,
              borderRadius: "50%",
              backgroundColor: "#0b1218",
            }}
          />
        </Box>
      </Box>

      {/* Permanent Small Clean Label for Mumbai: Positioned directly below the marker center */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 18,
          transform: "translateX(-50%)",
          bgcolor: "rgba(11, 18, 24, 0.9)",
          backdropFilter: "blur(6px)",
          border: `1px solid ${isSelected ? hubColor : "rgba(255, 153, 0, 0.4)"}`,
          borderRadius: "4px",
          px: 0.9,
          py: 0.25,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.15,
          boxShadow: isSelected
            ? `0 4px 14px rgba(0,0,0,0.85), 0 0 10px ${hubColor}55`
            : "0 2px 6px rgba(0,0,0,0.6)",
          transition: "all 0.2s ease",
          whiteSpace: "nowrap",
          userSelect: "none",
        }}
      >
        <Typography
          sx={{
            fontSize: 9.5,
            fontWeight: 900,
            color: "#FF9900",
            letterSpacing: 0.6,
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          MUMBAI
        </Typography>
        <Typography
          sx={{
            fontSize: 7.5,
            fontWeight: 700,
            color: vars.textDim,
            letterSpacing: 0.4,
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          AWS HUB
        </Typography>
      </Box>
    </Box>
  );
};
