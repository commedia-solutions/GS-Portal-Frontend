// src/layouts/MainLayout.tsx
import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar, {
  SIDEBAR_COLLAPSED_WIDTH,
  SIDEBAR_EXPANDED_WIDTH,
} from "../components/Sidebar";
import TopNav, { TOPBAR_HEIGHT } from "../components/TopNav";
import RightPanel, { RIGHT_RAIL_W } from "../components/RightPanel";

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
      <Sidebar 
      
      expanded={expanded} setExpanded={setExpanded} />
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
          bgcolor: "#0F0F0F",
          transition: "left 200ms ease",
          overflow: "hidden",
        }}
      >
        {children ?? null}
      </Box>
    </>
  );
}
