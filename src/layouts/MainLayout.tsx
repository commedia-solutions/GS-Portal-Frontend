// src/layouts/MainLayout.tsx
import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar, {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
} from "../components/Sidebar";
import TopNav, { TOPBAR_HEIGHT } from "../components/TopNav";
import RightPanel, { RIGHT_RAIL_W } from "../components/RightPanel";

// ⬅️ use the theme bridge vars
import { vars } from "../ui/toast/themeBridge";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../auth";

type MainLayoutProps = {
  /** Text shown in the TopNav on the left */
  title?: string;
  children?: React.ReactNode;
  hideRightPanel?: boolean;
};

export default function MainLayout({ title, children, hideRightPanel = false }: MainLayoutProps) {
  const [expanded, setExpanded] = useState(false);
  const leftWidth = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  const { loading } = useAuth();

if (loading) {
  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        bgcolor: vars.bgApp,
      }}
    />
  );
}

  return (
  <>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: vars.bgCard,
          color: vars.text,
          border: `1px solid ${vars.border}`,
          fontWeight: 600,
        },
        success: {
          iconTheme: {
            primary: "#16a34a",
            secondary: "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: "#dc2626",
            secondary: "#ffffff",
          },
        },
      }}
    />

    <Sidebar expanded={expanded} setExpanded={setExpanded} />
    <TopNav leftOffset={leftWidth} title={title} />
    {!hideRightPanel && <RightPanel />}


      {/* Content area slides with the sidebar and leaves room for the right rail */}
      <Box
        sx={{
          position: "fixed",
          top: TOPBAR_HEIGHT,
          left: leftWidth,
          right: hideRightPanel ? 0 : RIGHT_RAIL_W,
          bottom: 0,
          // 🔁 theme-aware colors
          bgcolor: vars.bgApp,
          color: vars.text,

          transition: "left 200ms ease, right 200ms ease",
          overflow: "hidden",
          // optional: make inner pages that use Cards/containers look clean
          // and pick up scroll with their own scrollers
        }}
      >
        {children ?? null}
      </Box>
    </>
  );
}

