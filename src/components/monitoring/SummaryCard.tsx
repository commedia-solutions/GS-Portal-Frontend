import React from "react";
import { Card, Box, Typography } from "@mui/material";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import { vars } from "../../ui/toast/themeBridge";

interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  valueColor?: string;
  alert?: boolean;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  valueColor = vars.text,
  alert = false,
}) => {
  return (
    <Card sx={{ ...PREMIUM_CARD_SX, p: 2, display: "flex", flexDirection: "column", justifyContent: "space-between", borderColor: alert ? "#EF444455" : undefined, minHeight: 100 }}>
      <AmbientLighting />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Typography sx={{ fontSize: 11, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.05em", maxWidth: "70%" }}>
          {title}
        </Typography>
        <Box sx={{ color: alert ? "#EF4444" : valueColor !== vars.text ? valueColor : vars.accent, opacity: 0.8 }}>
          {icon}
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: "auto" }}>
        <Typography sx={{ fontSize: 28, fontWeight: 900, color: valueColor, lineHeight: 1 }}>{value}</Typography>
        {subtitle && (
          <Typography sx={{ fontSize: 12, color: valueColor, fontWeight: "bold" }}>{subtitle}</Typography>
        )}
      </Box>
    </Card>
  );
};
