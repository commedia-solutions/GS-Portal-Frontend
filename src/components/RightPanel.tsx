import React from "react";
import {
  Box,
  Divider,
  Typography,
  Paper,
  CircularProgress,
  Chip,
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
  (typeof import.meta !== "undefined" && (import.meta as any)?.env?.VITE_API_BASE) ||
  (typeof globalThis !== "undefined" && (globalThis as any)?.process?.env?.REACT_APP_API_BASE) ||
  "";
const API = `${String(API_BASE).replace(/\/$/, "")}/api`;

/* ---------------- Types ---------------- */
type Stats = {
  ok: boolean;
  range: { from: string; to: string };
  total: number;
  by_status: {
    Completed: number;
    Pending: number;
    Failed: number;
    Canceled: number;
    Other?: number;
  };
  breakdown?: { status: string; count: number }[];
};

type TicketLite = {
  id: number;
  ticket_no: string;
  status: string;
  created_at: string;
  categories?: string;
};

const REQ_CARD_MIN_H = 72;
const POLL_MS = 25000;

/* ---------------- token helpers ---------------- */
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
export default function RightPanel({
  date,
  from,
  to,
}: {
  date?: Date | null;
  from?: Date | null;
  to?: Date | null;
}) {
  const { t } = useI18n();
  const { hasRole } = useAuth();
  const isGuest = hasRole("guest");

  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = React.useState(false);

  const [recentReqs, setRecentReqs] = React.useState<TicketLite[]>([]);
  const [loadingReqs, setLoadingReqs] = React.useState(false);

  const ymd = (d: Date) => new Date(d).toISOString().slice(0, 10);

  /* -------- Fetch Today/Selected-date stats -------- */
  React.useEffect(() => {
    const ctrl = new AbortController();
    let mounted = true;

    (async () => {
      try {
        setLoadingStats(true);
        let qs = "";
        if (from && to) qs = `?from=${ymd(from)}&to=${ymd(to)}`;
        else if (date) qs = `?date=${ymd(date)}`;

        const res = await fetch(`${API}/passes/stats${qs}`, {
          method: "GET",
          headers: { Accept: "application/json", ...authHeader() },
          signal: ctrl.signal,
        });

        if (!mounted || ctrl.signal.aborted) return;

        const text = await res.text();
        let j: any = null;
        try {
          j = text ? JSON.parse(text) : null;
        } catch {}

        if (res.ok && j?.ok) {
          setStats(j);
        } else {
          setStats({
            ok: true,
            range: { from: "", to: "" },
            total: 0,
            by_status: { Completed: 0, Pending: 0, Failed: 0, Canceled: 0, Other: 0 },
          });
        }
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setStats({
            ok: true,
            range: { from: "", to: "" },
            total: 0,
            by_status: { Completed: 0, Pending: 0, Failed: 0, Canceled: 0, Other: 0 },
          });
        }
      } finally {
        if (mounted) setLoadingStats(false);
      }
    })();

    return () => {
      mounted = false;
      ctrl.abort();
    };
  }, [date, from, to]);

  /* -------- Recent Requests (skip for guests) -------- */
  const fetchRecent = React.useCallback(async (signal?: AbortSignal) => {
    try {
      setLoadingReqs(true);
      const res = await fetch(
        `${API}/tickets?type=request&scope=sent&page=1&size=12`,
        { headers: { Accept: "application/json", ...authHeader() }, signal }
      );
      const text = await res.text();
      let j: any = null;
      try {
        j = text ? JSON.parse(text) : null;
      } catch {}

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

  const total = stats?.total ?? 0;
  const completed = stats?.by_status?.Completed ?? 0;
  const pending = stats?.by_status?.Pending ?? 0;
  const failed = stats?.by_status?.Failed ?? 0;
  const canceled = stats?.by_status?.Canceled ?? 0;

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
        overflow: "hidden", // ⛑ stop any child from visually leaking outside
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          pt: `calc(${APP_BAR_H}px + 14px)`,
          px: 1.25, // a hair tighter than 1.5 to gain a few pixels
          gap: 1.2,
        }}
      >
        {/* ---------- Today’s Passes ---------- */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.2, fontSize: 15 }}>
          {t("Today's Passes")}
        </Typography>
        <Divider sx={{ borderColor: vars.border }} />

        {/* Donut */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 1, minHeight: 140 }}>
          {loadingStats ? (
            <Box sx={{ display: "grid", placeItems: "center", height: 120 }}>
              <CircularProgress size={22} />
            </Box>
          ) : (
            <Donut total={total} completed={completed} pending={pending} failed={failed} canceled={canceled} />
          )}
        </Box>

        {/* Legend */}
        <Legend
          completedLabel={t("Completed")}
          pendingLabel={t("Pending")}
          failedLabel={t("Failed")}
          canceledLabel={t("Canceled")}
          completed={completed}
          pending={pending}
          failed={failed}
          canceled={canceled}
        />

        {/* ---------- Recent Requests ---------- */}
        {!isGuest && (
          <>
            <Divider sx={{ borderColor: vars.border }} />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: 15 }}>
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
                  } catch {}
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
                      overflow: "hidden", // ⛑ keep content inside
                      bgcolor: vars.bgHover,
                      border: `1px solid ${vars.border}`,
                      borderRadius: 2,
                      px: 1,  // tighter than 1.2
                      py: 0.9,
                      mb: 1,
                      display: "grid",
                      gridTemplateColumns: "18px 1fr",
                      alignItems: "flex-start",
                      columnGap: 1,
                      minHeight: REQ_CARD_MIN_H,
                    }}
                  >
                    <ChatBubbleOutlineIcon sx={{ fontSize: 18, color: vars.textDim, mt: 0.1 }} />
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
                          flexWrap: "wrap", // ⛑ allow timestamp to wrap below if needed
                        }}
                      >
                        <Chip
                          label={t(r.status)}
                          size="small"
                          sx={{
                            height: 18,
                            maxWidth: "60%",
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
                                : r.status === "On Hold"
                                ? "rgba(148,163,184,0.18)"
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

/* ---------------- Helpers: Donut + Legend ---------------- */
function Donut({
  total,
  completed,
  pending,
  failed,
  canceled,
}: {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  canceled: number;
}) {
  const size = 120;
  const thickness = 22;

  if (!total || total <= 0) {
    return (
      <Box
        sx={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: "var(--donut-track)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box
          sx={{
            width: size - thickness,
            height: size - thickness,
            borderRadius: "50%",
            bgcolor: "var(--bg-card)",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: 22 }}>0</Typography>
        </Box>
      </Box>
    );
  }

  const safe = (n: number) => Math.max(0, Number(n) || 0);
  const c = safe(completed);
  const p = safe(pending);
  const f = safe(failed);
  const x = safe(canceled);
  const t = safe(total);

  const scale = 360 / t;
  const cEnd = c * scale;
  const pEnd = (c + p) * scale;
  const fEnd = (c + p + f) * scale;
  const xEnd = (c + p + f + x) * scale;
  const otherStart = xEnd;
  const otherEnd = 360;

  return (
    <Box
      sx={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: "50%",
        background: `
          conic-gradient(
            #2ecc71 0deg ${cEnd}deg,
            #f1c40f ${cEnd}deg ${pEnd}deg,
            #e74c3c ${pEnd}deg ${fEnd}deg,
            #7f8c8d ${fEnd}deg ${xEnd}deg,
            var(--donut-track) ${otherStart}deg ${otherEnd}deg
          )
        `,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Box
        sx={{
          width: size - thickness,
          height: size - thickness,
          borderRadius: "50%",
          bgcolor: "var(--bg-card)",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 22, mt: 0.2 }}>{total}</Typography>
      </Box>
    </Box>
  );
}

function Legend({
  completedLabel,
  pendingLabel,
  failedLabel,
  canceledLabel,
  completed,
  pending,
  failed,
  canceled,
}: {
  completedLabel: string;
  pendingLabel: string;
  failedLabel: string;
  canceledLabel: string;
  completed: number;
  pending: number;
  failed: number;
  canceled: number;
}) {
  const Row = ({ c, label, val }: { c: string; label: string; val: number }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 12, my: 0.3 }}>
      <Box sx={{ width: 12, height: 12, borderRadius: 2, bgcolor: c }} />
      <Box sx={{ flex: 1 }}>{label}</Box>
      <Box sx={{ fontWeight: 700 }}>{val}</Box>
    </Box>
  );
  return (
    <Box sx={{ mt: 0.5, px: 0.5 }}>
      <Row c="#2ecc71" label={completedLabel} val={completed} />
      <Row c="#f1c40f" label={pendingLabel} val={pending} />
      <Row c="#e74c3c" label={failedLabel} val={failed} />
      <Row c="#7f8c8d" label={canceledLabel} val={canceled} />
    </Box>
  );
}
