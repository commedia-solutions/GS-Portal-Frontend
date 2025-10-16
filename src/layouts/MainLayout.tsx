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

type MainLayoutProps = {
  /** Text shown in the TopNav on the left */
  title?: string;
  children?: React.ReactNode;
};

export default function MainLayout({ title, children }: MainLayoutProps) {
  const [expanded, setExpanded] = useState(false);
  const leftWidth = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  return (
    <>
      <Sidebar expanded={expanded} setExpanded={setExpanded} />
      <TopNav leftOffset={leftWidth} title={title} />
      <RightPanel />

      {/* Content area slides with the sidebar and leaves room for the right rail */}
      <Box
        sx={{
          position: "fixed",
          top: TOPBAR_HEIGHT,
          left: leftWidth,
          right: RIGHT_RAIL_W,
          bottom: 0,
          // 🔁 theme-aware colors
          bgcolor: vars.bgApp,
          color: vars.text,

          transition: "left 200ms ease",
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
