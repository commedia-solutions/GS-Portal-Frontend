import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Snackbar, Alert, Slide } from "@mui/material";
import type { AlertColor, SlideProps } from "@mui/material";



type ToastKind = AlertColor; // "success" | "info" | "warning" | "error"

export type Toast = {
  id: number;
  message: string;
  kind?: ToastKind;
  autoHideMs?: number;
};

type ToastContextValue = {
  success: (message: string, ms?: number) => void;
  error: (message: string, ms?: number) => void;
  info: (message: string, ms?: number) => void;
  warning: (message: string, ms?: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function SlideLeft(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [queue, setQueue] = useState<Toast[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "info", autoHideMs = 3500) => {
    setQueue(q => [...q, { id: Date.now() + Math.random(), message, kind, autoHideMs }]);
  }, []);

  const api = useMemo<ToastContextValue>(() => ({
    success: (m, ms) => push(m, "success", ms),
    error:   (m, ms) => push(m, "error", ms),
    info:    (m, ms) => push(m, "info", ms),
    warning: (m, ms) => push(m, "warning", ms),
  }), [push]);

  const close = (id: number) => setQueue(q => q.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={api}>
      {children}
      {queue.map((t, idx) => (
        <Snackbar
          key={t.id}
          open
          autoHideDuration={t.autoHideMs ?? 3500}
          onClose={() => close(t.id)}
          TransitionComponent={SlideLeft}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          sx={{
            "& .MuiPaper-root": { borderRadius: 2 },
            mt: `${8 + idx * 72}px`, // stack
          }}
        >
          <Alert
            elevation={6}
            variant="filled"
            onClose={() => close(t.id)}
            severity={t.kind ?? "info"}
            sx={{ minWidth: 320, maxWidth: 420 }}
          >
            {t.message}
          </Alert>
        </Snackbar>
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
};
