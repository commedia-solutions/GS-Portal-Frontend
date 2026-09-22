import React from "react";
import { Box, Typography } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { InfrastructureNode } from "../../types/monitoring/dashboard";
import CloudIcon from "@mui/icons-material/Cloud";
import RouterIcon from "@mui/icons-material/Router";
import PrivateConnectivityIcon from "@mui/icons-material/VpnKey";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import DnsIcon from "@mui/icons-material/Dns";
import PublicIcon from "@mui/icons-material/Public";
import SatelliteIcon from "@mui/icons-material/Satellite";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import SettingsIcon from "@mui/icons-material/Settings";

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

export const InfrastructureFlow: React.FC<{ nodes: InfrastructureNode[]; hideTitle?: boolean }> = ({ nodes, hideTitle = false }) => {
  return (
    <Box sx={{ p: hideTitle ? 0 : 1 }}>
      {!hideTitle && (
        <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em", mb: 1 }}>
          Infrastructure Connection Flow
        </Typography>
      )}
      <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 1, py: 0.5 }}>
        {nodes.map((node, index) => {
          const Icon = getIconForType(node.type);
          const isHealthy = node.status === "HEALTHY";
          return (
            <React.Fragment key={node.id}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: vars.bgCard,
                  border: `1px solid ${vars.border}`,
                  borderRadius: "6px",
                  p: 0.75,
                  flex: 1,
                  minWidth: 90,
                  maxWidth: 140,
                  minHeight: 70,
                  boxShadow: isHealthy ? "0 0 8px rgba(16, 185, 129, 0.08)" : "none",
                }}
              >
                <Icon sx={{ fontSize: 18, color: isHealthy ? "#10B981" : vars.textDim, mb: 0.3 }} />
                <Typography sx={{ fontSize: 10, fontWeight: "bold", color: vars.text, textAlign: "center", whiteSpace: "nowrap" }}>
                  {node.name}
                </Typography>
                <Typography sx={{ fontSize: 8.5, color: isHealthy ? "#10B981" : vars.textDim, mt: 0.2, fontWeight: "bold" }}>
                  {node.status}
                </Typography>
              </Box>
              {index < nodes.length - 1 && (
                <Box sx={{ color: vars.textDim, display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <ArrowRightAltIcon sx={{ fontSize: 18, color: "#0EA5E9" }} />
                </Box>
              )}
            </React.Fragment>
          );
        })}
      </Box>
    </Box>
  );
};
