// src/components/Sidebar.tsx
import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LogoutIcon from "@mui/icons-material/Logout";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DashboardIcon from "@mui/icons-material/Dashboard";

import isroLogo from "../assets/isro_logo.png";
import { useAuth } from "../auth";
import { usePageAccess } from "../auth/usePageAccess";
import { vars } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";
import { getAuthToken } from "../api/http";

export const SIDEBAR_EXPANDED_WIDTH = 240;
export const SIDEBAR_COLLAPSED_WIDTH = 68;

type SidebarProps = {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
};

export default function Sidebar({ expanded, setExpanded }: SidebarProps) {
  const { t } = useI18n();
  const { hasRole } = useAuth();
  const { hasPageAccess, loadingAccess } = usePageAccess();

  const width = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;
  const isAdmin = hasRole("admin");

  if (loadingAccess) {
    return (
      <Box sx={{ position: "fixed", top: 0, left: 0, bottom: 0, width, bgcolor: "transparent", borderRight: `1px solid ${vars.border}` }} />
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width,
        bgcolor: "var(--sidebar-bg)",
        backdropFilter: "blur(12px)",
        color: vars.text,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--sidebar-border)",
        transition: "width 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 100,
        overflow: "hidden",
      }}
    >
      {/* Scan Effect */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "100%",
          background: "linear-gradient(90deg, transparent, rgba(14, 165, 233, 0.03), transparent)",
          animation: "sc-scan-line 8s linear infinite",
          pointerEvents: "none",
          opacity: 0.2,
        }}
      />

      {/* Header section with Logo center logic */}
      <Box
        sx={{
          height: 64,
          px: expanded ? 2 : 0,
          display: "flex",
          alignItems: "center",
          justifyContent: expanded ? "space-between" : "center",
          mb: 1,
          position: "relative",
        }}
      >
        <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Box
            component="img"
            src={isroLogo}
            alt="ISRO"
            sx={{
              height: expanded ? 54 : 32,
              transition: "all 300ms ease",
              filter: "drop-shadow(0 0 12px rgba(14, 165, 233, 0.4))",
            }}
          />
        </Box>

        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          sx={{
            width: 28,
            height: 28,
            bgcolor: "var(--sidebar-control-bg)",
            border: "1px solid var(--sidebar-border)",
            color: "var(--sidebar-icon)",
            borderRadius: "8px",
            position: expanded ? "relative" : "absolute",
            bottom: expanded ? "auto" : -20,
            transition: "all 0.3s",
            "&:hover": { bgcolor: "rgba(14, 165, 233, 0.16)", color: "#0EA5E9" },
          }}
        >
          {expanded ? <ChevronLeftIcon sx={{ fontSize: 18 }} /> : <ChevronRightIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Box>

      {/* Navigation Groups */}
      <Box sx={{ overflowY: expanded ? "auto" : "hidden", flex: 1, mt: 1 }}>
        <NavGroup label={t("Overview")} expanded={expanded} />
        <List disablePadding>
          {hasPageAccess("dashboard") && (
            <NavItem to="/dashboard" icon={<DashboardIcon />} label={t("Dashboard")} expanded={expanded} end />
          )}
          {hasPageAccess("pass_list") && (
            <NavItem to="/pass-list" icon={<FormatListBulletedIcon />} label={t("Pass List")} expanded={expanded} />
          )}
        </List>

        <NavGroup label={t("Management")} expanded={expanded} />
        <List disablePadding>
          {hasPageAccess("satellites") && (
            <NavItem to="/satellites" icon={<SatelliteAltIcon />} label={t("Satellites")} expanded={expanded} />
          )}
          {hasPageAccess("licenses") && (
            <NavItem to="/licenses" icon={<AssignmentIcon />} label={t("Licenses")} expanded={expanded} />
          )}
          {hasPageAccess("passes") && (
            <NavItem to="/passes" icon={<RocketLaunchIcon />} label={t("Passes")} expanded={expanded} />
          )}
        </List>

        <NavGroup label={t("Operations")} expanded={expanded} />
        <List disablePadding>
          {hasPageAccess("documents") && (
            <NavItem to="/documents" icon={<DescriptionIcon />} label={t("Documents")} expanded={expanded} />
          )}
          {hasPageAccess("requests") && (
            <NavItem to="/requests" icon={<AssignmentTurnedInIcon />} label={t("Requests")} expanded={expanded} />
          )}
          {hasPageAccess("issues") && (
            <NavItem to="/issues" icon={<HelpOutlineIcon />} label={t("Report Issue")} expanded={expanded} />
          )}
        </List>

        {isAdmin && (
          <>
            <NavGroup label={t("Admin")} expanded={expanded} />
            <List disablePadding>
              {hasPageAccess("logs") && (
                <NavItem to="/logs" icon={<ReceiptLongIcon />} label={t("User Logs")} expanded={expanded} />
              )}
            </List>
          </>
        )}
      </Box>

      {/* Logout Footer */}
      <Box sx={{ mt: "auto", p: expanded ? 1.5 : 0.5, borderTop: "1px solid var(--sidebar-border)" }}>
        <UtilityItem
          icon={<LogoutIcon />}
          label={t("Logout")}
          expanded={expanded}
          textColor="#EF4444"
          iconColor="#EF4444"
          onClick={async () => {
            if (!window.confirm(t("Log out of I-Portal?"))) return;
            try {
              const token = getAuthToken();
              await fetch("/api/auth/logout", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              });
            } catch (e) {
              console.log("Logout log failed:", e);
            }
            sessionStorage.clear();
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        />
      </Box>
    </Box>
  );
}

/* --- Helpers (NavGroup, NavItem, UtilityItem) --- */
function NavGroup({ label, expanded }: { label: string; expanded: boolean }) {
  if (!expanded) {
    return (
      <Box sx={{ px: 2, my: 1.5, opacity: 0.7 }}>
        <Box sx={{ height: 1.5, width: "100%", bgcolor: "var(--sidebar-muted)", borderRadius: 1 }} />
      </Box>
    );
  }
  return (
    <Box sx={{ px: 2.5, mt: 2.5, mb: 1, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--sidebar-muted)" }}>
      {label}
    </Box>
  );
}

function NavItem({ to, icon, label, expanded, end }: { to: string; icon: React.ReactNode; label: string; expanded: boolean; end?: boolean; }) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      {...(end ? { end: true } : {})}
      sx={{
        mb: 0.5,
        mx: 1,
        px: expanded ? 1.5 : 0,
        borderRadius: "8px",
        height: 44,
        justifyContent: expanded ? "flex-start" : "center",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        color: "var(--sidebar-text)",
        "&:link, &:visited, &:hover, &:active, &:focus": {
            color: "inherit",
            textDecoration: "none",
        },
        "&.active": {
          bgcolor: "rgba(14, 165, 233, 0.12)",
          color: "#0EA5E9",
          "&::before": {
            content: '""',
            position: "absolute",
            left: -8,
            top: "20%",
            height: "60%",
            width: 3,
            bgcolor: "#0EA5E9",
            borderRadius: "0 4px 4px 0",
            boxShadow: "0 0 10px #0EA5E9",
          },
          "& .MuiListItemIcon-root": { color: "#0EA5E9" },
        },
        "&:hover": { bgcolor: "rgba(255, 255, 255, 0.06)" },
        "& .MuiListItemIcon-root": {
          minWidth: 0,
          mr: expanded ? 2 : 0,
          color: "var(--sidebar-icon)",
          "& svg": { fontSize: 22 },
        },
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      {expanded && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: 700 }} />}
    </ListItemButton>
  );
}

function UtilityItem({ icon, label, expanded, onClick, textColor, iconColor }: any) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        borderRadius: "12px",
        px: expanded ? 1.5 : 0,
        justifyContent: expanded ? "flex-start" : "center",
        color: textColor ?? "inherit",
        "& .MuiListItemIcon-root": {
          minWidth: 0, mr: expanded ? 2 : 0, color: iconColor ?? vars.textDim,
          "& svg": { fontSize: expanded ? 22 : 18 },
        },
        "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" },
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      {expanded && <ListItemText primary={label} primaryTypographyProps={{ fontSize: 14, fontWeight: 700 }} />}
    </ListItemButton>
  );
}
