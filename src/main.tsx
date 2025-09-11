// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ToastProvider } from "./ui/toast/ToastProvider"; // ← add this

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>     {/* ← wrap the whole app */}
      <App />
    </ToastProvider>
  </StrictMode>
);
