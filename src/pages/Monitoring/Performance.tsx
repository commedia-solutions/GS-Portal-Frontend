// src/pages/Monitoring/Performance.tsx
import { Box, Card, Typography } from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { useI18n } from "../../i18n";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import HistoryIcon from "@mui/icons-material/History";
import SpeedIcon from "@mui/icons-material/Speed";

export default function MonitoringPerformance() {
  const { t } = useI18n();

  const gridItems = [
    { label: "CPU Utilization", desc: "Average CPU load across all nodes" },
    { label: "Memory Utilization", desc: "Total physical and virtual memory in use" },
    { label: "Temperature", desc: "Chassis temperature diagnostics" },
    { label: "Interface Statistics", desc: "Active port packet count and errors" },
    { label: "Bandwidth Usage", desc: "Inbound and outbound network bandwidth" },
    { label: "Packet Loss", desc: "Ping transmission packet loss percentage" },
    { label: "Response Time Logs", desc: "Device ICMP response times" },
  ];

  return (
    <MainLayout title={t("Monitoring Performance")}>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
          {/* Information Banner */}
          <Card sx={{ ...PREMIUM_CARD_SX, p: 3, border: "1px dashed rgba(14, 165, 233, 0.4)" }}>
            <AmbientLighting />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <HistoryIcon sx={{ fontSize: 42, color: vars.accent }} />
              <Box>
                <Typography sx={{ fontSize: 16, fontWeight: 900, color: vars.text }}>
                  {t("Historical Performance Metrics")}
                </Typography>
                <Typography sx={{ fontSize: 13, color: vars.textDim, mt: 0.5 }}>
                  {t("Historical Metrics will be available in Phase 4. Polling data is currently active in the background, but telemetry graphs, time-series analysis, and database logs will be integrated in the next phase.")}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Grid Placeholders using Box CSS Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
              gap: 3,
            }}
          >
            {gridItems.map((item, idx) => (
              <Card sx={{ ...PREMIUM_CARD_SX, p: 2.5, minHeight: 140, borderStyle: "dashed" }} key={idx}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 900, color: vars.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t(item.label)}
                  </Typography>
                  <SpeedIcon sx={{ fontSize: 18, color: vars.textWeak }} />
                </Box>
                <Typography sx={{ fontSize: 11.5, color: vars.textWeak }}>
                  {t(item.desc)}
                </Typography>
                <Box sx={{ mt: "auto", pt: 2, display: "flex", alignItems: "center", justifyContent: "center", borderTop: `1px solid ${vars.borderWeak}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: vars.textWeak }}>
                    {t("— Placeholder —")}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Box>
      </Box>
    </MainLayout>
  );
}
