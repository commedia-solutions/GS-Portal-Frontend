import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { vars } from "../../ui/toast/themeBridge";
import type { Alert } from "../../types/monitoring/dashboard";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export const ActiveAlerts: React.FC<{ alerts: Alert[] }> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 2, color: "#10B981" }}>
        <CheckCircleOutlineIcon fontSize="small" />
        <Typography sx={{ fontSize: 13, fontWeight: "bold" }}>All systems operating normally</Typography>
      </Box>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "#EF4444";
      case "warning": return "#F59E0B";
      case "success": return "#10B981";
      case "info": return "#0EA5E9";
      default: return vars.textDim;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", p: 1 }}>
      {alerts.map(alert => {
        const color = getSeverityColor(alert.severity);
        const Icon = alert.severity === "critical" ? ErrorOutlineIcon : WarningAmberIcon;
        return (
          <Box key={alert.id} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.75, px: 1, borderBottom: `1px solid ${vars.borderWeak}` }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 8, height: 8, borderRadius: "50%", bgcolor: color, boxShadow: `0 0 6px ${color}88` }} />
            <Typography sx={{ fontSize: 11, fontWeight: "bold", color: vars.text, whiteSpace: "nowrap" }}>
              {alert.stationName}
            </Typography>
            <Typography sx={{ fontSize: 11, color: vars.textDim, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", flex: 1, ml: 1 }}>
              - {alert.message}
            </Typography>
            <Typography sx={{ ml: "auto", fontSize: 9, color: vars.textWeak, whiteSpace: "nowrap" }}>
              {alert.timestamp}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};
