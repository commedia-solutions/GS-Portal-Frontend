// // src/components/Sidebar.tsx
// import React from "react";
// import {
//   Box,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Divider,
// } from "@mui/material";
// import { NavLink } from "react-router-dom";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
// import DescriptionIcon from "@mui/icons-material/Description";
// import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
// import LogoutIcon from "@mui/icons-material/Logout";
// import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"; // Requests
// import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
// import isroLogo from "../assets/isro_logo.png";

// export const SIDEBAR_EXPANDED_WIDTH = 180;
// export const SIDEBAR_COLLAPSED_WIDTH = 60;

// type SidebarProps = {
//   expanded: boolean;
//   setExpanded: (v: boolean) => void;
// };

// export default function Sidebar({ expanded, setExpanded }: SidebarProps) {
//   const width = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

//   return (
//     <Box
//       onMouseEnter={() => setExpanded(true)}
//       onMouseLeave={() => setExpanded(false)}
//       sx={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         bottom: 0,
//         width,
//         bgcolor: "#0F0F0F",
//         color: "#fff",
//         display: "flex",
//         flexDirection: "column",
//         borderRight: "2px solid rgba(255,255,255,0.08)",
//         transition: "width 200ms ease",
//         zIndex: 10,
//       }}
//     >
//       {/* Logo */}
//       <Box
//         sx={{
//           height: 54,
//           px: expanded ? 2 : 0,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           borderBottom: "2px solid rgba(255,255,255,0.08)",
//         }}
//       >
//         <Box
//           component="img"
//           src={isroLogo}
//           alt="ISRO"
//           sx={{
//             height: expanded ? 50 : 46,
//             transition: "height 180ms ease",
//             userSelect: "none",
//             objectFit: "contain",
//           }}
//         />
//       </Box>

//       {/* Nav groups */}
//       <Box sx={{ overflowY: "auto", flex: 1 }}>
//         <List disablePadding>
//           <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" expanded={expanded} end />
//           <NavItem to="/satellites" icon={<SatelliteAltIcon />} label="Satellites List" expanded={expanded} />
//           <NavItem to="/licenses" icon={<AssignmentIcon />} label="License List" expanded={expanded} />
//           <NavItem to="/passes" icon={<RocketLaunchIcon />} label="Passes List" expanded={expanded} />
//           <NavItem to="/documents" icon={<DescriptionIcon />} label="Documents" expanded={expanded} />
//           <NavItem to="/logs" icon={<ReceiptLongIcon />} label="Logs" expanded={expanded} />

//           {/* NEW: Requests & Report Issue */}
//           <NavItem to="/requests" icon={<AssignmentTurnedInIcon />} label="Requests" expanded={expanded} />
//           <NavItem to="/issues" icon={<HelpOutlineIcon />} label="Report Issue" expanded={expanded} />
//         </List>
//       </Box>

//       {/* Bottom actions */}
//       <Box sx={{ mt: "auto" }}>
//         <Divider sx={{ opacity: 0.12 }} />
//         <List disablePadding>
//           <UtilityItem
//             icon={<LogoutIcon />}
//             label="Logout"
//             expanded={expanded}
//             color="#FF8A00"
//             onClick={() => {
//               if (window.confirm("Log out of I-Portal?")) {
//                 sessionStorage.removeItem("token");
//                 sessionStorage.removeItem("user");
//                 localStorage.removeItem("token");
//                 localStorage.removeItem("user");
//                 window.location.href = "/"; // full reset
//               }
//             }}
//           />
//         </List>
//       </Box>
//     </Box>
//   );
// }

// function NavItem({
//   to,
//   icon,
//   label,
//   expanded,
//   end,
// }: {
//   to: string;
//   icon: React.ReactNode;
//   label: string;
//   expanded: boolean;
//   end?: boolean;
// }) {
//   return (
//     <ListItemButton
//       component={NavLink}
//       to={to}
//       {...(end ? { end: true } : {})}
//       sx={{
//         mx: expanded ? 1 : 0.75,
//         mt: expanded ? 0.5 : 0.75,
//         mb: 0.5,
//         px: expanded ? 1.25 : 0,
//         minHeight: 50,
//         borderRadius: 1.5,
//         justifyContent: expanded ? "flex-start" : "center",
//         alignItems: "center",
//         transition: "all 160ms ease",
//         color: "inherit",
//         "&:link, &:visited, &:hover, &:active, &:focus": {
//           color: "inherit",
//           textDecoration: "none",
//         },
//         "& .MuiListItemText-primary": { color: "inherit" },
//         "&.active": { bgcolor: "rgba(255,255,255,0.08)" },
//         "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
//         "& .MuiListItemIcon-root": {
//           minWidth: 0,
//           mr: expanded ? 1.1 : 0,
//           width: expanded ? "auto" : "100%",
//           display: "flex",
//           justifyContent: expanded ? "flex-start" : "center",
//           color: "rgba(255,255,255,0.65)",
//           "& svg": { fontSize: 22 },
//         },
//       }}
//     >
//       <ListItemIcon>{icon}</ListItemIcon>
//       <Box
//         sx={{
//           overflow: "hidden",
//           opacity: expanded ? 1 : 0,
//           transform: expanded ? "translateX(0)" : "translateX(-6px)",
//           transition: "opacity 140ms ease, transform 140ms ease",
//         }}
//       >
//         <ListItemText
//           primary={label}
//           primaryTypographyProps={{ fontSize: 15.5, lineHeight: 1.15 }}
//         />
//       </Box>
//     </ListItemButton>
//   );
// }

// function UtilityItem({
//   icon,
//   label,
//   expanded,
//   onClick,
//   color,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   expanded: boolean;
//   onClick?: () => void;
//   color?: string;
// }) {
//   return (
//     <ListItemButton
//       onClick={onClick}
//       sx={{
//         my: 0.5,
//         mx: expanded ? 1 : 0,
//         px: expanded ? 1.25 : 0,
//         minHeight: 48,
//         borderRadius: 1.5,
//         justifyContent: expanded ? "flex-start" : "center",
//         alignItems: "center",
//         transition: "all 160ms ease",
//         color: color ?? "inherit",
//         "&:link, &:visited, &:hover, &:active, &:focus": {
//           color: color ?? "inherit",
//           textDecoration: "none",
//         },
//         "& .MuiListItemIcon-root": {
//           minWidth: 0,
//           mr: expanded ? 1.1 : 0,
//           width: expanded ? "auto" : "100%",
//           display: "flex",
//           justifyContent: expanded ? "flex-start" : "center",
//           color: color ?? "rgba(255,255,255,0.65)",
//           "& svg": { fontSize: 22 },
//         },
//         "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
//       }}
//     >
//       <ListItemIcon>{icon}</ListItemIcon>
//       <Box
//         sx={{
//           overflow: "hidden",
//           opacity: expanded ? 1 : 0,
//           transform: expanded ? "translateX(0)" : "translateX(-6px)",
//           transition: "opacity 140ms ease, transform 140ms ease",
//         }}
//       >
//         <ListItemText
//           primary={label}
//           primaryTypographyProps={{ fontSize: 15.5, lineHeight: 1.15 }}
//         />
//       </Box>
//     </ListItemButton>
//   );
// }


// src/components/Sidebar.tsx
import React from "react";
import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LogoutIcon from "@mui/icons-material/Logout";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn"; // Requests
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import isroLogo from "../assets/isro_logo.png";
import { useAuth } from "../auth"; // ✅ RBAC


export const SIDEBAR_EXPANDED_WIDTH = 180;
export const SIDEBAR_COLLAPSED_WIDTH = 60;

type SidebarProps = {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
};

export default function Sidebar({ expanded, setExpanded }: SidebarProps) {
  const width = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  // Show only Dashboard for guests
  const { hasRole } = useAuth();
  const isGuest = hasRole("guest");
  const isAdmin = hasRole("admin"); //

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
        bgcolor: "#0F0F0F",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        borderRight: "2px solid rgba(255,255,255,0.08)",
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
          borderBottom: "2px solid rgba(255,255,255,0.08)",
        }}
      >
        <Box
          component="img"
          src={isroLogo}
          alt="ISRO"
          sx={{
            height: expanded ? 50 : 46,
            transition: "height 180ms ease",
            userSelect: "none",
            objectFit: "contain",
          }}
        />
      </Box>

      {/* Nav groups */}
      <Box sx={{ overflowY: "auto", flex: 1 }}>
        <List disablePadding>
          {/* Always visible */}
          <NavItem to="/dashboard" icon={<DashboardIcon />} label="Dashboard" expanded={expanded} end />

          {/* Hidden for guests */}
          {!isGuest && (
            <>
              <NavItem to="/satellites" icon={<SatelliteAltIcon />} label="Satellites List" expanded={expanded} />
              <NavItem to="/licenses" icon={<AssignmentIcon />} label="License List" expanded={expanded} />
              <NavItem to="/passes" icon={<RocketLaunchIcon />} label="Passes List" expanded={expanded} />
              <NavItem to="/documents" icon={<DescriptionIcon />} label="Documents" expanded={expanded} />

              {/* <NavItem to="/logs" icon={<ReceiptLongIcon />} label="Logs" expanded={expanded} /> */}
              {isAdmin && ( // 👈 only admins see Logs
                <NavItem to="/logs" icon={<ReceiptLongIcon />} label="Logs" expanded={expanded} />
              )}

              <NavItem to="/requests" icon={<AssignmentTurnedInIcon />} label="Requests" expanded={expanded} />
              <NavItem to="/issues" icon={<HelpOutlineIcon />} label="Report Issue" expanded={expanded} />
            </>
          )}
        </List>
      </Box>

      {/* Bottom actions */}
      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ opacity: 0.12 }} />
        <List disablePadding>
          <UtilityItem
            icon={<LogoutIcon />}
            label="Logout"
            expanded={expanded}
            color="#FF8A00"
          

            onClick={() => {
  if (!window.confirm("Log out of I-Portal?")) return;

  // 1) Clear tokens and known user blobs
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("profile");
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // 2) Clear all pmgt_* namespace keys (uid, avatar caches, etc.)
  try {
    const toDelete: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i) || "";
      if (k.startsWith("pmgt_")) toDelete.push(k);
    }
    toDelete.forEach((k) => sessionStorage.removeItem(k));
  } catch {}

  // 3) Hard redirect to login/root
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
        mx: expanded ? 1 : 0.75,
        mt: expanded ? 0.5 : 0.75,
        mb: 0.5,
        px: expanded ? 1.25 : 0,
        minHeight: 50,
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
        "&.active": { bgcolor: "rgba(255,255,255,0.08)" },
        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
        "& .MuiListItemIcon-root": {
          minWidth: 0,
          mr: expanded ? 1.1 : 0,
          width: expanded ? "auto" : "100%",
          display: "flex",
          justifyContent: expanded ? "flex-start" : "center",
          color: "rgba(255,255,255,0.65)",
          "& svg": { fontSize: 22 },
        },
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
        <ListItemText
          primary={label}
          primaryTypographyProps={{ fontSize: 15.5, lineHeight: 1.15 }}
        />
      </Box>
    </ListItemButton>
  );
}

function UtilityItem({
  icon,
  label,
  expanded,
  onClick,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <ListItemButton
      onClick={onClick}
      sx={{
        my: 0.5,
        mx: expanded ? 1 : 0,
        px: expanded ? 1.25 : 0,
        minHeight: 48,
        borderRadius: 1.5,
        justifyContent: expanded ? "flex-start" : "center",
        alignItems: "center",
        transition: "all 160ms ease",
        color: color ?? "inherit",
        "&:link, &:visited, &:hover, &:active, &:focus": {
          color: color ?? "inherit",
          textDecoration: "none",
        },
        "& .MuiListItemIcon-root": {
          minWidth: 0,
          mr: expanded ? 1.1 : 0,
          width: expanded ? "auto" : "100%",
          display: "flex",
          justifyContent: expanded ? "flex-start" : "center",
          color: color ?? "rgba(255,255,255,0.65)",
          "& svg": { fontSize: 22 },
        },
        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
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
        <ListItemText
          primary={label}
          primaryTypographyProps={{ fontSize: 15.5, lineHeight: 1.15 }}
        />
      </Box>
    </ListItemButton>
  );
}
