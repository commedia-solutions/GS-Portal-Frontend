// src/pages/Monitoring/Alerts.tsx
import { Box, Card, Typography } from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { useI18n } from "../../i18n";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import InfoIcon from "@mui/icons-material/Info";
import NotificationsIcon from "@mui/icons-material/Notifications";

export default function MonitoringAlerts() {
  const { t } = useI18n();

  return (
    <MainLayout title={t("Monitoring Alerts")}>
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
          {/* Quick Counter Grid using Box CSS Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
              gap: 2.5,
            }}
          >
            {/* Critical */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 2 }}>
              <AmbientLighting />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Critical Alerts")}
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 900, mt: 0.5, color: "#EF4444" }}>
                    0
                  </Typography>
                </Box>
                <WarningAmberIcon sx={{ fontSize: 28, color: "#EF4444", opacity: 0.8 }} />
              </Box>
            </Card>

            {/* Warning */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 2 }}>
              <AmbientLighting />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: "#F59E0B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Warning Alerts")}
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 900, mt: 0.5, color: "#F59E0B" }}>
                    0
                  </Typography>
                </Box>
                <NotificationsActiveIcon sx={{ fontSize: 28, color: "#F59E0B", opacity: 0.8 }} />
              </Box>
            </Card>

            {/* Info */}
            <Card sx={{ ...PREMIUM_CARD_SX, p: 2 }}>
              <AmbientLighting />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  <Typography sx={{ fontSize: 10.5, fontWeight: 900, color: vars.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {t("Information Alerts")}
                  </Typography>
                  <Typography sx={{ fontSize: 24, fontWeight: 900, mt: 0.5, color: vars.accent }}>
                    0
                  </Typography>
                </Box>
                <InfoIcon sx={{ fontSize: 28, color: vars.accent, opacity: 0.8 }} />
              </Box>
            </Card>
          </Box>

          {/* Active Alerts Panel */}
          <Card sx={{ ...PREMIUM_CARD_SX, p: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, borderStyle: "dashed" }}>
            <NotificationsIcon sx={{ fontSize: 48, color: vars.textWeak, mb: 2 }} />
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: vars.text, mb: 1 }}>
              {t("No Alerts Available")}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: vars.textDim, textAlign: "center", maxWidth: 360 }}>
              {t("There are currently no active alerts in the network. Device SNMP poll responses are healthy and within thresholds.")}
            </Typography>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
}
