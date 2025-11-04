import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LogoutIcon from "@mui/icons-material/Logout";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import isroLogo from "../assets/isro_logo.png";
import { useAuth } from "../auth";
import { vars } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";

export const SIDEBAR_EXPANDED_WIDTH = 180;
export const SIDEBAR_COLLAPSED_WIDTH = 60;

type SidebarProps = {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
};

export default function Sidebar({ expanded, setExpanded }: SidebarProps) {
  const { t } = useI18n();
  const width = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const { hasRole } = useAuth();
  const isGuest = hasRole("guest");
  const isAdmin = hasRole("admin");

  return (
    <Box
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width,
        bgcolor: vars.bgApp,
        color: vars.text,
        display: "flex",
        flexDirection: "column",
        borderRight: `2px solid ${vars.border}`,
        transition: "width 200ms ease",
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          height: 54,
          px: expanded ? 2 : 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: `2px solid ${vars.border}`,
        }}
      >
        <Box
          component="img"
          src={isroLogo}
          alt="ISRO"
          sx={{
            height: expanded ? 50 : 34, // slightly smaller when collapsed
            transition: "height 180ms ease",
            userSelect: "none",
            objectFit: "contain",
          }}
        />
      </Box>

      {/* Nav groups */}
      <Box sx={{ overflowY: expanded ? "auto" : "hidden", flex: 1 }}>
        <List disablePadding dense={!expanded}>
          <NavItem to="/dashboard" icon={<DashboardIcon />} label={t("Dashboard")} expanded={expanded} end />

          {!isGuest && (
            <>
              <NavItem to="/satellites" icon={<SatelliteAltIcon />} label={t("Satellites List")} expanded={expanded} />
              <NavItem to="/licenses" icon={<AssignmentIcon />} label={t("License List")} expanded={expanded} />
              <NavItem to="/passes" icon={<RocketLaunchIcon />} label={t("Passes List")} expanded={expanded} />
              <NavItem
                to="/pass-schedule"
                icon={<CalendarMonthIcon />}
                label={t("Pass Schedule")}
                expanded={expanded}
              />
              <NavItem to="/documents" icon={<DescriptionIcon />} label={t("Documents")} expanded={expanded} />
              {isAdmin && <NavItem to="/logs" icon={<ReceiptLongIcon />} label={t("Logs")} expanded={expanded} />}
              <NavItem to="/requests" icon={<AssignmentTurnedInIcon />} label={t("Requests")} expanded={expanded} />
              <NavItem to="/issues" icon={<HelpOutlineIcon />} label={t("Report Issue")} expanded={expanded} />
            </>
          )}
        </List>
      </Box>

      {/* Bottom actions */}
      <Box sx={{ mt: "auto" }}>
        <List disablePadding dense={!expanded}>
          <UtilityItem
            icon={<LogoutIcon />}
            label={t("Logout")}
            expanded={expanded}
            textColor="#FF8A00"
            iconColor="#FF8A00"
            onClick={() => {
              if (!window.confirm(t("Log out of I-Portal?"))) return;
              sessionStorage.removeItem("token");
              sessionStorage.removeItem("user");
              sessionStorage.removeItem("profile");
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              try {
                const toDelete: string[] = [];
                for (let i = 0; i < sessionStorage.length; i++) {
                  const k = sessionStorage.key(i) || "";
                  if (k.startsWith("pmgt_")) toDelete.push(k);
                }
                toDelete.forEach((k) => sessionStorage.removeItem(k));
              } catch {}
              window.location.href = "/";
            }}
          />
        </List>
      </Box>
    </Box>
  );
}

function NavItem({
  to,
  icon,
  label,
  expanded,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  end?: boolean;
}) {
  return (
    <ListItemButton
      component={NavLink}
      to={to}
      {...(end ? { end: true } : {})}
      sx={{
        mx: expanded ? 1 : 0.5,
        mt: expanded ? 0.5 : 0.25, // tighter when collapsed
        mb: expanded ? 0.5 : 1.7, // tighter when collapsed
        px: expanded ? 1.25 : 0,
        minHeight: expanded ? 50 : 36, // smaller row height when collapsed
        borderRadius: 1.5,
        justifyContent: expanded ? "flex-start" : "center",
        alignItems: "center",
        transition: "all 160ms ease",
        color: "inherit",
        "&:link, &:visited, &:hover, &:active, &:focus": {
          color: "inherit",
          textDecoration: "none",
        },
        "& .MuiListItemText-primary": { color: "inherit" },
        "&.active": { bgcolor: "var(--bg-hover)" },
        "&:hover": { bgcolor: "var(--bg-hover)" },
        "& .MuiListItemIcon-root": {
          minWidth: 0,
          mr: expanded ? 1.1 : 0,
          width: expanded ? "auto" : "100%",
          display: "flex",
          justifyContent: expanded ? "flex-start" : "center",
          color: vars.textDim,
          "& svg": { fontSize: expanded ? 22 : 22 }, // smaller icon when collapsed I/D size 
        },
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <Box
        sx={{
          overflow: "hidden",
          opacity: expanded ? 1 : 1,
          transform: expanded ? "translateX(0)" : "translateX(-6px)",
          transition: "opacity 140ms ease, transform 140ms ease",
        }}
      >
        <ListItemText primary={label} primaryTypographyProps={{ fontSize: 15.5, lineHeight: 1.15 }} />
      </Box>
    </ListItemButton>
  );
}

function UtilityItem({
  icon,
  label,
  expanded,
  onClick,
  textColor,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onClick?: () => void;
  /** Text color (defaults to inherit). */
  textColor?: string;
  /** Icon color (defaults to vars.textDim). */
  iconColor?: string;
}) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        my: expanded ? 0.5 : 0.5,
        mx: expanded ? 1 : 0.25,
        px: expanded ? 1.25 : 0,
        minHeight: expanded ? 48 : 34, // tighter when collapsed
        borderRadius: 1.5,
        justifyContent: expanded ? "flex-start" : "center",
        alignItems: "center",
        transition: "all 160ms ease",
        color: textColor ?? "inherit",
        "&:link, &:visited, &:hover, &:active, &:focus": {
          color: textColor ?? "inherit",
          textDecoration: "none",
        },
        "& .MuiListItemIcon-root": {
          minWidth: 0,
          mr: expanded ? 1.1 : 0,
          width: expanded ? "auto" : "100%",
          display: "flex",
          justifyContent: expanded ? "flex-start" : "center",
          color: iconColor ?? vars.textDim,
          "& svg": { fontSize: expanded ? 22 : 18 }, // smaller icon when collapsed
        },
        "&:hover": { bgcolor: "var(--bg-hover)" },
      }}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <Box
        sx={{
          overflow: "hidden",
          opacity: expanded ? 1 : 0,
          transform: expanded ? "translateX(0)" : "translateX(-6px)",
          transition: "opacity 140ms ease, transform 140ms ease",
        }}
      >
        <ListItemText primary={label} primaryTypographyProps={{ fontSize: 15.5, lineHeight: 1.15 }} />
      </Box>
    </ListItemButton>
  );
}
