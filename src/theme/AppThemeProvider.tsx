import * as React from "react";
import { createTheme, ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

/** Safe read of a CSS var from <body> (returns a HEX/rgb string, not "var(--x)") */
function v(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const val = getComputedStyle(document.body).getPropertyValue(name).trim();
  return val || fallback;
}

/** Bump to force theme recreation when the body class changes */
function useThemeBump() {
  const [bump, setBump] = React.useState(0);
  React.useEffect(() => {
    const onChanged = () => setBump((n) => n + 1);
    window.addEventListener("pmgt:theme-changed", onChanged as EventListener);
    return () => window.removeEventListener("pmgt:theme-changed", onChanged as EventListener);
  }, []);
  return bump;
}

function useCssVarTheme() {
  const bump = useThemeBump(); // re-run when theme toggles

  const mode =
    typeof document !== "undefined" &&
    document.body.classList.contains("theme-light")
      ? "light"
      : "dark";

  // IMPORTANT: any palette color that MUI *parses* must be a concrete color
  const primaryMain = v("--accent", "#6941F5");
  const errorMain   = v("--danger", "#d32f2f");
  const successMain = v("--ok", "#2e7d32");
  const textPrimary = v("--text", "#0B1115");
  const textSecond  = v("--text-dim", "rgba(11,17,21,0.75)");
  const dividerCol  = v("--border", "rgba(0,0,0,0.12)");

  return React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // these are plain strings MUI puts into CSS — CSS vars are OK here
          background: {
            default: "var(--bg-app)",
            paper: "var(--bg-card)",
          },
          text: {
            primary: textPrimary,      // concrete color (safe)
            secondary: textSecond,     // concrete color (safe)
          },
          primary: {
            main: primaryMain,         // concrete color (NO var(...))
            contrastText: mode === "dark" ? "#0B1115" : "#ffffff",
          },
          error:   { main: errorMain },   // concrete
          success: { main: successMain }, // concrete
          divider: dividerCol,            // concrete (keeps MUI happy)
        },

        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                background: "var(--bg-app)",
                color: "var(--text)",
                scrollbarColor: "var(--scrollbar) transparent",
              },
              "*::-webkit-scrollbar": { width: 8, height: 8 },
              "*::-webkit-scrollbar-thumb": {
                background: "var(--scrollbar)",
                borderRadius: 8,
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                borderColor: "var(--border)",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: { textTransform: "none", fontWeight: 600 },
              contained: {
                // visual color comes from CSS vars, but palette.primary.main is concrete
                backgroundColor: "var(--accent)",
                color: mode === "dark" ? v("--bg-app", "#0F0F0F") : "#fff",
                "&:hover": { filter: "brightness(0.95)" },
              },
              text: {
                color: "var(--text)",
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "var(--bg-hover)" },
              },
              outlined: {
                borderColor: "var(--border-weak)",
                color: "var(--text)",
                "&:hover": { backgroundColor: "var(--bg-hover)" },
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                backgroundColor: "var(--bg-ctrl)",
                color: "var(--text)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border-weak)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "var(--border)",
                },
              },
              input: { color: "var(--text)" },
            },
          },
          MuiSelect: {
            styleOverrides: {
              select: { color: "var(--text)" },
              icon: { color: "var(--text)" },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              },
            },
          },
          MuiTablePagination: {
            styleOverrides: {
              toolbar: { color: "var(--text)" },
              selectLabel: { color: "var(--text-dim)" },
              displayedRows: { color: "var(--text-dim)" },
            },
          },
          MuiDivider: {
            styleOverrides: { root: { borderColor: "var(--border)" } },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                backgroundColor: "var(--bg-card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              },
            },
          },
        },
      }),
    [mode, bump, primaryMain, errorMain, successMain, textPrimary, textSecond, dividerCol]
  );
}

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useCssVarTheme();
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
