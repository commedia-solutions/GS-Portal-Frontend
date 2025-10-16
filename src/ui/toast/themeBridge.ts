// src/ui/toast/themeBridge.ts
// Centralised theme helpers + tokens (driven by theme.css)

export type ThemePref = "dark" | "light";

/* ---------- read/apply ---------- */
export function getThemePref(): ThemePref {
  return (localStorage.getItem("pmgt_theme") as ThemePref) || "dark";
}


export function applyTheme(pref: ThemePref) {
  const b = document.body;
  b.classList.remove("theme-dark", "theme-light");
  b.classList.add(pref === "dark" ? "theme-dark" : "theme-light");
  localStorage.setItem("pmgt_theme", pref);

  // notify the app (MUI provider / any listeners) to recompute if needed
  window.dispatchEvent(new CustomEvent("pmgt:theme-changed", { detail: { pref } }));
}

/* ---------- optional React hook ---------- */
import * as React from "react";

export function useThemePref() {
  const [pref, setPref] = React.useState<ThemePref>(getThemePref());

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const p = (e as CustomEvent).detail?.pref as ThemePref | undefined;
      setPref(p ?? getThemePref());
    };
    window.addEventListener("pmgt:theme-changed", onChange as EventListener);
    return () => window.removeEventListener("pmgt:theme-changed", onChange as EventListener);
  }, []);

  const set = React.useCallback((p: ThemePref) => applyTheme(p), []);
  const toggle = React.useCallback(() => set(pref === "dark" ? "light" : "dark"), [pref, set]);

  return { pref, set, toggle };
}

/* ---------- CSS var tokens ---------- */
export const vars = {
  bgApp: "var(--bg-app)",
  bgCard: "var(--bg-card)",
  bgCtrl: "var(--bg-ctrl)",
  bgHover: "var(--bg-hover)",
  text: "var(--text)",
  textDim: "var(--text-dim)",
  textWeak: "var(--text-weak)",
  border: "var(--border)",
  borderWeak: "var(--border-weak)",
  accent: "var(--accent)",
  danger: "var(--danger)",
  ok: "var(--ok)",
  scrollbar: "var(--scrollbar)",
  bgThead: "var(--bg-thead)",
  
} as const;

/* ---------- reusable sx presets ---------- */
export const sxPresets = {
  card: {
    bgcolor: vars.bgCard,
    color: vars.text,
    border: `1px solid ${vars.border}`,
    borderRadius: 2,
  },
  headerStrip: {
    bgcolor: vars.bgCard,
    borderBottom: `1px solid ${vars.border}`,
  },
  ctrl: {
    bgcolor: vars.bgCtrl,
    color: vars.text,
    "& .MuiOutlinedInput-notchedOutline": { borderColor: vars.borderWeak },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: vars.border },
    "& .MuiSvgIcon-root": { color: vars.text },
  },
  btnGhost: {
    color: vars.text,
    bgcolor: vars.bgHover,
    border: `1px solid ${vars.borderWeak}`,
    "&:hover": { bgcolor: vars.bgHover },
  },
  btnAccent: {
    color: "#fff",
    bgcolor: vars.accent,
    "&:hover": { bgcolor: vars.accent },
  },
  tableHeader: {
    bgcolor: vars.bgApp,
    borderBottom: `1px solid ${vars.border}`,
    color: vars.text,
  },
  scroller: {
    scrollbarColor: `${vars.scrollbar} transparent`,
    "&::-webkit-scrollbar": { width: 8, height: 8 },
    "&::-webkit-scrollbar-thumb": { background: vars.scrollbar, borderRadius: 8 },
    "&::-webkit-scrollbar-track": { background: "transparent" },
  },
} as const;
