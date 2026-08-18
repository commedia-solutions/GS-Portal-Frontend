import { Box, Card, Typography, TextField, InputAdornment, Button, IconButton } from "@mui/material";
import MainLayout from "../../layouts/MainLayout";
import { TOPBAR_HEIGHT } from "../../components/TopNav";
import { useI18n } from "../../i18n";
import { vars } from "../../ui/toast/themeBridge";
import { PREMIUM_CARD_SX, AmbientLighting } from "../../ui/styles";
import SearchIcon from "@mui/icons-material/Search";
import HubIcon from "@mui/icons-material/Hub";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const ctrlSx = {
  "& .MuiOutlinedInput-root": {
    height: "32px",
    fontSize: 12.5,
    color: vars.text,
    backgroundColor: vars.bgCtrl,
    borderRadius: "9px",
    "& fieldset": { borderColor: vars.border },
    "&:hover fieldset": { borderColor: vars.accent },
    "&.Mui-focused fieldset": { borderColor: vars.accent, borderWidth: 1 },
  },
  "& .MuiInputBase-input": { padding: "0 10px", fontSize: 12.5, color: vars.text },
  "& .MuiInputBase-input::placeholder": { color: vars.textDim, opacity: 1 },
  "& .MuiSvgIcon-root": { fontSize: 16, color: vars.textDim },
} as const;

export default function MonitoringNetworkMap() {
  const { t } = useI18n();

  return (
    <MainLayout title={t("Network Map")}>
      <Box
        sx={{
          px: 3,
          pt: 2,
          pb: 4,
          height: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          bgcolor: vars.bgApp,
        }}
      >
        {/* Toolbar Controls */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 2.5,
            py: 1.5,
            borderBottom: `1px solid ${vars.border}`,
            flexWrap: "wrap",
            position: "relative",
            zIndex: 1,
            borderRadius: "16px",
            bgcolor: vars.bgCard,
            border: `1px solid ${vars.border}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: vars.accent, boxShadow: `0 0 8px ${vars.accent}88` }} />
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: vars.text }}>
              {t("Topology Map")}
            </Typography>
          </Box>

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.2 }}>
            {/* Search node */}
            <TextField
              disabled
              placeholder={t("Search nodes…")}
              size="small"
              sx={{ width: 170, ...ctrlSx }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 15 }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Legend button */}
            <Button
              disabled
              variant="outlined"
              size="small"
              sx={{
                height: 32,
                textTransform: "none",
                fontWeight: 700,
                borderColor: vars.border,
                color: vars.textDim,
                "&.Mui-disabled": { borderColor: vars.borderWeak, color: vars.textWeak },
              }}
            >
              {t("Legend")}
            </Button>
          </Box>
        </Box>

        {/* Map Layout Split Area */}
        <Box sx={{ flex: 1, display: "flex", gap: 3, minHeight: 0 }}>
          {/* SVG Canvas Map Area */}
          <Card
            sx={{
              ...PREMIUM_CARD_SX,
              flex: 1,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderStyle: "dashed",
              overflow: "hidden",
            }}
          >
            <AmbientLighting />

            {/* Virtual canvas markers / grid lines */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
                pointerEvents: "none",
              }}
            />

            <HubIcon sx={{ fontSize: 48, color: vars.textWeak, mb: 2, zIndex: 1 }} />
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: vars.text, mb: 1, zIndex: 1 }}>
              {t("No Topology Available")}
            </Typography>
            <Typography sx={{ fontSize: 12.5, color: vars.textDim, textAlign: "center", maxWidth: 380, zIndex: 1 }}>
              {t("No devices or interconnect links are registered for map rendering. Network topology graphs will be dynamically calculated when discoveries are configured in Phase 5.")}
            </Typography>

            {/* Zoom Controls Overlay */}
            <Box
              sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                bgcolor: "rgba(11, 17, 21, 0.8)",
                border: `1px solid ${vars.border}`,
                borderRadius: "8px",
                p: 0.5,
                backdropFilter: "blur(8px)",
                zIndex: 2,
              }}
            >
              <IconButton size="small" disabled sx={{ color: vars.textDim }}>
                <ZoomInIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" disabled sx={{ color: vars.textDim }}>
                <ZoomOutIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" disabled sx={{ color: vars.textDim }}>
                <RestartAltIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Card>

          {/* Details Sidebar panel */}
          <Card
            sx={{
              ...PREMIUM_CARD_SX,
              width: 280,
              p: 2.5,
              display: "flex",
              flexDirection: "column",
              borderStyle: "dashed",
              flexShrink: 0,
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 900, color: vars.textWeak, textTransform: "uppercase", letterSpacing: "0.05em", mb: 2 }}>
              {t("Node Details")}
            </Typography>
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: `1px dashed ${vars.borderWeak}`, borderRadius: "12px", p: 2 }}>
              <Typography sx={{ fontSize: 11.5, color: vars.textWeak, textAlign: "center" }}>
                {t("Select a node on the map to inspect details.")}
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    </MainLayout>
  );
}
