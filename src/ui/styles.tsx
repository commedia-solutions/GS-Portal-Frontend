import { vars } from "./toast/themeBridge";
import { Box } from "@mui/material";
import React from 'react';

/**
 * PREMIUM GLASSMORPHISM STYLE SYSTEM
 * Centralized styles for high-fidelity UI elements.
 */

// We use the theme variables but keep the high-end feel
const ACCENT = vars.accent;
const BORDER = vars.border;
const BORDER_WEAK = vars.borderWeak;
const TEXT = vars.text;

export const PREMIUM_CARD_SX = {
  position: 'relative',
  overflow: 'hidden',
  bgcolor: vars.bgCard,
  backdropFilter: "blur(20px)",
  border: `1px solid ${BORDER}`,
  borderRadius: '20px',
  display: "flex",
  flexDirection: "column",
  backgroundImage: "none",
  boxShadow: '0 20px 50px rgba(0,0,0,0.12)',
} as const;

export const PREMIUM_DIALOG_PAPER_SX = {
  bgcolor: vars.bgCard,
  color: vars.text,
  border: `1px solid color-mix(in srgb, ${vars.accent} 28%, ${vars.border})`,
  borderRadius: "20px",
  backgroundImage: "none",
  boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
  overflow: "hidden",
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
    pointerEvents: "none",
    zIndex: 2,
  },
} as const;

export const PREMIUM_DIALOG_TITLE_SX = {
  fontWeight: 900,
  fontSize: 22,
  color: vars.text,
  letterSpacing: "-0.01em",
  px: 3,
  pt: 3,
  pb: 1.5,
} as const;

export const PREMIUM_DIALOG_CONTENT_SX = {
  px: 3,
  py: 2,
  borderColor: vars.border,
  background: "color-mix(in srgb, var(--bg-card) 94%, var(--accent) 6%)",
} as const;

export const PREMIUM_DIALOG_ACTIONS_SX = {
  px: 3,
  py: 2,
  gap: 1.25,
  borderTop: `1px solid ${vars.border}`,
  background: "color-mix(in srgb, var(--bg-card) 96%, var(--accent) 4%)",
} as const;

export const PREMIUM_FORM_LABEL_SX = {
  fontSize: 10.5,
  fontWeight: 900,
  color: vars.accent,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  mb: 0.8,
} as const;

export const PREMIUM_FORM_CONTROL_SX = {
  "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
    minHeight: 36,
    color: vars.text,
    backgroundColor: vars.bgCtrl,
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "color-mix(in srgb, var(--accent) 60%, var(--border))" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: vars.accent,
    borderWidth: 1,
  },
  "& .MuiInputBase-input, & .MuiOutlinedInput-input": {
    fontSize: 13,
    color: vars.text,
  },
  "& .MuiInputBase-input::placeholder": { color: vars.textDim, opacity: 0.7 },
  "& .MuiSelect-select": {
    minHeight: "34px !important",
    display: "flex",
    alignItems: "center",
    fontSize: 13,
    color: vars.text,
  },
  "& .MuiSvgIcon-root": { color: vars.textDim },
} as const;

export const PREMIUM_MENU_PROPS = {
  PaperProps: {
    sx: {
      bgcolor: vars.bgCard,
      color: vars.text,
      border: `1px solid ${vars.border}`,
      "& .MuiMenuItem-root.Mui-selected": { bgcolor: vars.bgHover },
      "& .MuiMenuItem-root:hover": { bgcolor: vars.bgHover },
    },
  },
} as const;

export const PREMIUM_ACTION_BUTTON_SX = {
  textTransform: "none",
  fontWeight: 800,
  fontSize: 12.5,
  px: 3,
  height: 40,
  borderRadius: "12px",
  color: "#fff",
  background: `linear-gradient(135deg, ${ACCENT}, #0369a1)`,
  boxShadow: "0 8px 20px rgba(14, 165, 233, 0.25)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: "linear-gradient(135deg, #0ea5e9, #075985)",
    transform: "translateY(-1px)",
    boxShadow: "0 10px 25px rgba(14, 165, 233, 0.35)",
  },
  "&.Mui-disabled": { opacity: 0.5, color: "rgba(255,255,255,0.45)" },
} as const;

export const PREMIUM_DANGER_BUTTON_SX = {
  ...PREMIUM_ACTION_BUTTON_SX,
  background: "#FF2E63",
  boxShadow: "0 8px 20px rgba(255, 46, 99, 0.2)",
  "&:hover": {
    background: "#d62654",
    transform: "translateY(-1px)",
    boxShadow: "0 10px 25px rgba(255, 46, 99, 0.3)",
  },
} as const;

export const THEAD_CELL_SX = {
  px: 1,
  py: 1.5,
  fontWeight: 800,
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: "var(--thead-text)",
  bgcolor: vars.bgThead,
  borderBottom: `1px solid ${BORDER}`,
  whiteSpace: "nowrap"
} as const;

export const ROW_CELL_SX = {
  px: 1,
  py: 1,
  fontSize: 13,
  color: TEXT,
  borderBottom: `1px solid ${BORDER_WEAK}`,
} as const;

export const PAGINATION_SX = {
  px: 1,
  bgcolor: vars.bgCard,
  color: vars.text,
  borderTop: `1px solid ${BORDER}`,
  "& .MuiTablePagination-toolbar": { minHeight: 40, p: 0, pl: 1, pr: 1, gap: 0.5 },
  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: 12, m: 0, color: vars.textDim, fontWeight: 600 },
  "& .MuiTablePagination-input": { fontSize: 12, m: 0, color: vars.text },
  "& .MuiTablePagination-select": { bgcolor: vars.bgCtrl, borderRadius: "8px", fontSize: 12, fontWeight: 700, px: 1, mr: 2, display: 'flex', alignItems: 'center', height: 28 },
  "& .MuiIconButton-root": { color: vars.text, p: 0.5, "&:hover": { bgcolor: vars.bgHover }, "&.Mui-disabled": { color: vars.textWeak } },
  ".MuiSvgIcon-root": { fontSize: 20 },
} as const;

/**
 * Ambient Liquid Lighting Effect
 */
export const AmbientLighting: React.FC = () => (
  <React.Fragment>
    <Box sx={{
      position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%',
      background: `radial-gradient(circle, ${ACCENT}14, transparent 70%)`,
      filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
    }} />
    <Box sx={{
      position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%',
      background: 'radial-gradient(circle, rgba(124, 110, 245, 0.08), transparent 70%)',
      filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0,
    }} />
  </React.Fragment>
);

/**
 * Scan Line Effect for tables
 */
export const TableScanLine: React.FC = () => (
  <Box className="table-surface-scan" />
);

/**
 * Glass row hover effect logic
 */
export const glassRowHoverSx = {
  bgcolor: "transparent",
  transition: 'all 0.2s',
  position: 'relative',
  '& > td': { borderBottom: `1px solid ${BORDER_WEAK}` },
  '&:hover': {
    bgcolor: vars.bgHover,
    '& > td:first-of-type': {
      position: 'relative',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        bgcolor: ACCENT,
        boxShadow: `0 0 10px ${ACCENT}`,
      }
    }
  }
};

/**
 * Standard row alternate styling
 */
export const terminalRowSx = (idx: number) => ({
  display: "grid",
  bgcolor: idx % 2 === 0 ? "var(--row-odd)" : "var(--row-even)",
  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": { bgcolor: vars.bgHover }
});
