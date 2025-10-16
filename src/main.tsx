import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ToastProvider } from "./ui/toast/ToastProvider";
import "./theme.css";
import { applyTheme, getThemePref } from "./ui/toast/themeBridge";
import AppThemeProvider from "./theme/AppThemeProvider";
import { I18nProvider } from "./i18n"; // <-- NEW

// Apply the saved theme preference *before* React renders:
applyTheme(getThemePref());

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    {/* i18n outermost so every page sees language changes */}
    <I18nProvider>
      <AppThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AppThemeProvider>
    </I18nProvider>
  </StrictMode>
);
