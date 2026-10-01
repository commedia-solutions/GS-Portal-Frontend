import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { IstracNode } from "../../types/topologyTypes";

interface IstracMarkerProps {
  node: IstracNode;
  isSelected: boolean;
  isReceiving?: boolean;
  onSelect: (entity: IstracNode) => void;
  x: number;
  y: number;
}

export const IstracMarker: React.FC<IstracMarkerProps> = ({ node, isSelected, isReceiving = false, onSelect, x, y }) => {
  const [isHovered, setIsHovered] = useState(false);
  const istracColor = isReceiving ? "#00FF66" : "#06B6D4"; // Signature Neon Green on active pass, Cyan on idle
  const glowColor = isReceiving ? "#00FF66" : "#22D3EE";

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        zIndex: isSelected ? 35 : 26,
        cursor: "pointer",
        pointerEvents: "auto",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node);
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
        {/* Outer Glowing Radar Pulse Ring */}
        <Box
          sx={{
            position: "absolute",
            width: isSelected || isReceiving ? 36 : 26,
            height: isSelected || isReceiving ? 36 : 26,
            borderRadius: "50%",
            border: `1.5px solid ${istracColor}`,
            backgroundColor: isSelected || isReceiving ? `${istracColor}26` : `${istracColor}10`,
            boxShadow: isSelected || isReceiving
              ? `0 0 18px ${glowColor}cc, inset 0 0 10px ${istracColor}55`
              : `0 0 10px ${glowColor}66`,
            transition: "all 0.3s ease",
            animation: "istracPulse 2.4s infinite ease-in-out",
            "@keyframes istracPulse": {
              "0%": { transform: "scale(0.92)", opacity: 0.95 },
              "50%": { transform: "scale(1.22)", opacity: 0.3 },
              "100%": { transform: "scale(0.92)", opacity: 0.95 },
            },
          }}
        />

        {/* Concentric Mission Ring */}
        <Box
          sx={{
            position: "absolute",
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: `1px dashed ${glowColor}`,
            opacity: 0.7,
            animation: "istracRotate 8s linear infinite",
            "@keyframes istracRotate": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />

        {/* Hexagonal / Target Central Node Icon */}
        <Box
          sx={{
            width: 11,
            height: 11,
            borderRadius: "2px",
            backgroundColor: istracColor,
            boxShadow: `0 0 10px ${glowColor}`,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.2s ease",
            ...(isHovered && {
              transform: "scale(1.25)",
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

      {/* Permanent Small Clean Label for ISTRAC Bangalore: Positioned directly below the marker center */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 18,
          transform: "translateX(-50%)",
          bgcolor: "rgba(11, 18, 24, 0.92)",
          backdropFilter: "blur(6px)",
          border: `1px solid ${isSelected ? glowColor : "rgba(6, 182, 212, 0.45)"}`,
          borderRadius: "4px",
          px: 0.9,
          py: 0.25,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.15,
          boxShadow: isSelected
            ? `0 4px 14px rgba(0,0,0,0.85), 0 0 12px ${glowColor}66`
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
            color: "#22D3EE",
            letterSpacing: 0.6,
            textTransform: "uppercase",
            lineHeight: 1.1,
          }}
        >
          BANGALORE
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
          ISTRAC
        </Typography>
      </Box>
    </Box>
  );
};
