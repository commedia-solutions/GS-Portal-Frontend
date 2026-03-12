// src/components/RightPanel.tsx
import React from "react";
import {
  Box,
  // Divider,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  // Button,
} from "@mui/material";

import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { useAuth } from "../auth";
import { vars, sxPresets } from "../ui/toast/themeBridge";
import { useI18n } from "../i18n";

/* ---------------- Layout constants ---------------- */
export const APP_BAR_H = 56;
export const RIGHT_RAIL_W = 220;

/* ---------------- API base ---------------- */
const API_BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as any)?.env?.VITE_API_BASE) ||
  (typeof globalThis !== "undefined" &&
    (globalThis as any)?.process?.env?.REACT_APP_API_BASE) ||
  "";
const API = `${String(API_BASE).replace(/\/$/, "")}/api`;

/* ---------------- Types ---------------- */
type TicketLite = {
  id: number;
  ticket_no: string;
  status: string;
  created_at: string;
  categories?: string;
};

const REQ_CARD_MIN_H = 72;
const POLL_MS = 25000;

/* ---------- helpers ---------- */
function getToken() {
  const raw =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("access_token") ||
    localStorage.getItem("access_token") ||
    "";
  return (raw || "").replace(/^Bearer\s+/i, "");
}
function authHeader(): HeadersInit {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

/* ===================== Component ===================== */
export default function RightPanel() {
  const { t } = useI18n();
  const { hasRole } = useAuth();
  const isGuest = hasRole("guest");

  /* ========== NOTE ==========
     The "Upcoming Passes" feature and all reminder/notification logic
     have been intentionally commented out / removed below as requested.
     If you want to re-enable it later, search for "UPCOMING PASSES" in
     your original file and reinstate the code.
  =========================== */

  /* ---------- Recent requests ---------- */
  const [recentReqs, setRecentReqs] = React.useState<TicketLite[]>(
    [] as TicketLite[]
  );
  const [loadingReqs, setLoadingReqs] = React.useState(false);

  const fetchRecent = React.useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingReqs(true);
      const res = await fetch(
        `${API}/tickets?type=request&scope=inbox&page=1&size=12`
        ,
        { headers: { Accept: "application/json", ...authHeader() }, signal }
      );
      const text = await res.text();
      let j: any = null;
      try {
        j = text ? JSON.parse(text) : null;
      } catch { }
      const rows: any[] = Array.isArray(j?.rows) ? j.rows : [];
      const mapped: TicketLite[] = rows
        .map((r) => ({
          id: Number(r.id),
          ticket_no: String(r.ticket_no || ""),
          status: String(r.status || ""),
          created_at: String(r.created_at || ""),
          categories: String(r.categories || ""),
        }))
        .filter((r) => r.status !== "Done");
      setRecentReqs(mapped);
    } catch (e) {
      if ((e as any)?.name !== "AbortError") {
        console.error("recent requests fetch failed", e);
        setRecentReqs([]);
      }
    } finally {
      setLoadingReqs(false);
    }
  }, []);

  React.useEffect(() => {
    if (isGuest) return;
    const ctrl = new AbortController();
    fetchRecent(ctrl.signal);
    const tmr = window.setInterval(() => fetchRecent(ctrl.signal), POLL_MS);
    return () => {
      ctrl.abort();
      window.clearInterval(tmr);
    };
  }, [fetchRecent, isGuest]);

  /* ---------- render ---------- */
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: RIGHT_RAIL_W,
        bgcolor: vars.bgApp,
        color: vars.text,
        borderLeft: `2px solid ${vars.border}`,
        zIndex: 8,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          pt: `calc(${APP_BAR_H}px + 14px)`,
          px: 1.25,
          gap: 1.2,
        }}
      >
        {/* ---------- (Removed) Upcoming Passes ---------- */}
        {/* The whole Upcoming Passes pane was removed as requested. */}

        {/* ---------- Recent Requests ---------- */}
        {!isGuest && (
          <>
            {/* <Divider sx={{ borderColor: vars.border }} /> */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 0.5,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, fontSize: 15 }}
              >
                {t("Recent Requests")}
              </Typography>
              <Typography
                role="button"
                tabIndex={0}
                sx={{
                  fontSize: 12.5,
                  color: "var(--accent)",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => {
                  try {
                    window.location.href = "/requests";
                  } catch { }
                }}
              >
                {t("View all >")}
              </Typography>
            </Box>

            <Box
              sx={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                pr: 0.5,
                pb: 10,
                ...sxPresets.scroller,
              }}
            >
              {loadingReqs ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
                  <CircularProgress size={20} />
                </Box>
              ) : recentReqs.length === 0 ? (
                <Typography sx={{ fontSize: 12.5, color: vars.textDim, mt: 0.5 }}>
                  {t("No active requests.")}
                </Typography>
              ) : (
                recentReqs.map((r) => (
                  <Paper
                    key={r.id}
                    elevation={0}
                    sx={{
                      width: "100%",
                      maxWidth: "100%",
                      boxSizing: "border-box",
                      overflow: "hidden",
                      bgcolor: vars.bgHover,
                      border: `1px solid ${vars.border}`,
                      borderRadius: 2,
                      px: 1,
                      py: 0.9,
                      mb: 1,
                      display: "grid",
                      gridTemplateColumns: "18px 1fr",
                      alignItems: "flex-start",
                      columnGap: 1,
                      minHeight: REQ_CARD_MIN_H,
                    }}
                  >
                    <ChatBubbleOutlineIcon
                      sx={{ fontSize: 18, color: vars.textDim, mt: 0.1 }}
                    />
                    <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          lineHeight: 1.25,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          wordBreak: "break-word",
                          maxWidth: "100%",
                        }}
                      >
                        {r.ticket_no} {r.categories ? `• ${r.categories}` : ""}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.75,
                          rowGap: 0.25,
                          mt: 0.45,
                          minWidth: 0,
                          flexWrap: "wrap",
                        }}
                      >
                        <Chip
                          label={t(r.status)}
                          size="small"
                          sx={{
                            height: 18,
                            "& .MuiChip-label": {
                              px: 0.8,
                              fontSize: 11,
                              fontWeight: 700,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                            bgcolor:
                              r.status === "Submitted"
                                ? "rgba(59,130,246,0.18)"
                                : r.status === "In Progress"
                                  ? "rgba(234,179,8,0.18)"
                                  : r.status === "In Review"
                                    ? "rgba(124,87,242,0.22)"
                                    : "rgba(148,163,184,0.18)",
                            color:
                              r.status === "Submitted"
                                ? "#93c5fd"
                                : r.status === "In Progress"
                                  ? "#fde68a"
                                  : r.status === "In Review"
                                    ? "#c7b8ff"
                                    : "#cbd5e1",
                            borderRadius: 1,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 11,
                            color: vars.textWeak,
                            ml: "auto",
                            flexShrink: 0,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {new Date(r.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}