// // src/config/pageRegistry.tsx

// import React from "react";

// /* Icons */
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
// import AssignmentIcon from "@mui/icons-material/Assignment";
// import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
// import DescriptionIcon from "@mui/icons-material/Description";
// import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
// import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
// import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// /* ---------------- TYPES ---------------- */

// export type AppPage = {
//   key: string; // stored in DB / permissions
//   label: string; // shown in UI
//   route: string; // react-router path
//   location: "sidebar" | "topbar" | "both";
//   adminOnly?: boolean;
//   guestHidden?: boolean;
//   icon?: React.ReactNode;
// };

// /* ---------------- PAGE REGISTRY ---------------- */
// /**
//  * SINGLE SOURCE OF TRUTH
//  * Sidebar + TopNav + Access Pages Dialog
//  */

// export const APP_PAGES: AppPage[] = [
//   /* -------- COMMON -------- */
//   {
//     key: "dashboard",
//     label: "Dashboard",
//     route: "/dashboard",
//     location: "both",
//     icon: <DashboardIcon />,
//   },

//   /* -------- SIDEBAR -------- */
//   {
//     key: "satellites",
//     label: "Satellites List",
//     route: "/satellites",
//     location: "sidebar",
//     guestHidden: true,
//     icon: <SatelliteAltIcon />,
//   },
//   {
//     key: "licenses",
//     label: "License List",
//     route: "/licenses",
//     location: "sidebar",
//     guestHidden: true,
//     icon: <AssignmentIcon />,
//   },
//   {
//     key: "passes",
//     label: "Passes List",
//     route: "/passes",
//     location: "sidebar",
//     guestHidden: true,
//     icon: <RocketLaunchIcon />,
//   },
//   {
//     key: "documents",
//     label: "Documents",
//     route: "/documents",
//     location: "sidebar",
//     guestHidden: true,
//     icon: <DescriptionIcon />,
//   },
//   {
//     key: "logs",
//     label: "Logs",
//     route: "/logs",
//     location: "sidebar",
//     adminOnly: true,
//     icon: <ReceiptLongIcon />,
//   },
//   {
//     key: "requests",
//     label: "Requests",
//     route: "/requests",
//     location: "sidebar",
//     guestHidden: true,
//     icon: <AssignmentTurnedInIcon />,
//   },
//   {
//     key: "issues",
//     label: "Report Issue",
//     route: "/issues",
//     location: "sidebar",
//     guestHidden: true,
//     icon: <HelpOutlineIcon />,
//   },

//   /* -------- TOP NAV -------- */
//   {
//     key: "gs_operations",
//     label: "GS & Operations",
//     route: "/Gsoperations",
//     location: "topbar",
//   },

//   {
//     key: "add_pass",
//     label: "Add Passes",
//     route: "/add/pass",
//     location: "topbar",
//     adminOnly: true,
//   },
//   {
//     key: "add_license",
//     label: "Add License",
//     route: "/add/license",
//     location: "topbar",
//     adminOnly: true,
//   },
//   {
//     key: "add_satellite",
//     label: "Add Satellites",
//     route: "/add/satellite",
//     location: "topbar",
//     adminOnly: true,
//   },

//   {
//     key: "iam",
//     label: "User & Role Management",
//     route: "/iam",
//     location: "topbar",
//     adminOnly: true,
//   },
// ];


// src/config/pageRegistry.tsx
import React from "react";

import SatelliteAltIcon from "@mui/icons-material/SatelliteAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import DescriptionIcon from "@mui/icons-material/Description";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

/* ---------------- TYPES ---------------- */

export type AppPage = {
  key: string;
  label: string;
  route: string;
  location: "sidebar" | "topbar" | "both" | "none";
  viewerHidden?: boolean;   // 🔥 renamed from adminOnly
  guestHidden?: boolean;
  icon?: React.ReactNode;
};

/* ---------------- PAGE REGISTRY ---------------- */
/**
 * SINGLE SOURCE OF TRUTH
 */

export const APP_PAGES: AppPage[] = [
  /* -------- COMMON -------- */



  // {
  //   key: "dashboard",
  //   label: "Dashboard",
  //   route: "/dashboard",
  //   location: "both",
  //   icon: <DashboardIcon />,
  // },

  /* -------- SIDEBAR -------- */

  {
    key: "pass_list",
    label: "Pass List",
    route: "/pass-list",
    location: "sidebar",
    icon: <FormatListBulletedIcon />,
  },
  {
    key: "satellites",
    label: "Satellites List",
    route: "/satellites",
    location: "sidebar",
    icon: <SatelliteAltIcon />,
  },
  {
    key: "licenses",
    label: "License List",
    route: "/licenses",
    location: "sidebar",
    icon: <AssignmentIcon />,
  },
  // Passes List is hidden as per changes requested by alok sir
  // {
  //   key: "passes",
  //   label: "Passes List",
  //   location: "sidebar",
  //   icon: <RocketLaunchIcon />,
  // },

  {
    key: "documents",
    label: "Documents",
    route: "/documents",
    location: "sidebar",
    icon: <DescriptionIcon />,
  },
  {
    key: "visibility_schedule",
    label: "Visibility Schedule",
    route: "/visibility-schedule",
    location: "sidebar",
    icon: <VisibilityIcon />,
  },
  {
    key: "logs",
    label: "Logs",
    route: "/logs",
    location: "sidebar",
    viewerHidden: true, // 👀 hidden only for viewer
    icon: <ReceiptLongIcon />,
  },
  {
    key: "requests",
    label: "Requests",
    route: "/requests",
    location: "sidebar",
    icon: <AssignmentTurnedInIcon />,
  },
  {
    key: "monitoring_dashboard",
    label: "Monitoring Dashboard",
    route: "/monitoring/dashboard",
    location: "sidebar",
  },
  {
    key: "monitoring_devices",
    label: "Monitoring Devices",
    route: "/monitoring/devices",
    location: "sidebar",
  },
  {
    key: "monitoring_discovery",
    label: "Monitoring Discovery",
    route: "/monitoring/discovery",
    location: "sidebar",
  },
  {
    key: "monitoring_performance",
    label: "Monitoring Performance",
    route: "/monitoring/performance",
    location: "sidebar",
  },
  {
    key: "monitoring_alerts",
    label: "Monitoring Alerts",
    route: "/monitoring/alerts",
    location: "sidebar",
  },
  {
    key: "monitoring_network_map",
    label: "Monitoring Network Map",
    route: "/monitoring/network-map",
    location: "sidebar",
  },
  {
    key: "monitoring_settings",
    label: "Monitoring Settings",
    route: "/monitoring/settings",
    location: "sidebar",
    viewerHidden: true,
  },
  // {
  //   key: "issues",
  //   label: "Report Issue",
  //   route: "/issues",
  //   location: "sidebar",
  //   icon: <HelpOutlineIcon />,
  // },

  /* -------- VISIBILITY TABS (VIRTUAL) -------- */
  {
    key: "pass_availability",
    label: "Pass Availability",
    route: "",
    location: "none",
  },
  {
    key: "pass_scheduled",
    label: "Pass Scheduled",
    route: "",
    location: "none",
  },
  {
    key: "pass_requested",
    label: "Pass Requested",
    route: "",
    location: "none",
  },
  {
    key: "pass_upload",
    label: "Pass Upload",
    route: "",
    location: "none",
  },

  /* -------- TOP NAV -------- */
  {
    key: "gs_operations",
    label: "GS & Operations",
    route: "/gsoperations",
    location: "topbar",
  },
  //  commented as per changes requested by alok sir
  // {
  //   key: "add_pass",
  //   label: "Add Passes",
  //   route: "/add/pass",
  //   location: "topbar",
  //   viewerHidden: true,
  // },
  {
    key: "add_license",
    label: "Add License",
    route: "/add/license",
    location: "topbar",
    viewerHidden: true,
  },
  {
    key: "add_satellite",
    label: "Add Satellites",
    route: "/add/satellite",
    location: "topbar",
    viewerHidden: true,
  },
  {
    key: "iam",
    label: "User & Role Management",
    route: "/iam",
    location: "topbar",
    viewerHidden: true,
  },
];
