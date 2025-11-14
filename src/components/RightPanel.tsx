// src/components/RightPanel.tsx
import React from "react";
import {
  Box,
  Divider,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Dialog,
  Button,
  IconButton,
} from "@mui/material";
import Slide from "@mui/material/Slide";
import type { TransitionProps } from "@mui/material/transitions";

import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

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
const toIst = (iso: string) => {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    ...opts,
  }).format(d);
};
// NEW: UTC formatter (human-friendly UTC start)
const toUtc = (iso: string) => {
  const d = new Date(iso);
  const opts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  };
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    ...opts,
  }).format(d);
};
const hms = (ms: number) => {
  if (ms < 0) return "00:00:00";
  const s = Math.floor(ms / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

/* ---------- regions to scan (all) ---------- */
const ALL_REGIONS = [
  "us-west-2",
  "af-south-1",
  "me-south-1",
  "eu-west-1",
  "sa-east-1",
] as const;
type RegionId = (typeof ALL_REGIONS)[number];

/* Map GS display names → canonical AWS region */
const GS_TO_REGION: Record<string, RegionId> = {
  "Hawaii 1": "us-west-2",
  "Cape Town 1": "af-south-1",
  "Bahrain 1": "me-south-1",
  "Ireland 1": "eu-west-1",
  "Punta Arenas 1": "sa-east-1",
};
/* tolerant resolver */
function inferRegionFromGS(
  gsName: string | null | undefined,
  fallback: RegionId
): RegionId {
  const clean = String(gsName || "").trim();
  if (!clean) return fallback;
  if (GS_TO_REGION[clean as keyof typeof GS_TO_REGION]) {
    return GS_TO_REGION[clean as keyof typeof GS_TO_REGION];
  }
  for (const key of Object.keys(GS_TO_REGION)) {
    if (clean.startsWith(key)) return GS_TO_REGION[key as keyof typeof GS_TO_REGION];
  }
  const m = clean.match(/\b(us-west-2|af-south-1|me-south-1|eu-west-1|sa-east-1)\b/i);
  if (m) return m[1].toLowerCase() as RegionId;
  return fallback;
}

/* -------- alert sound -------- */
function playAlert() {
  try {
    const AudioCtx =
      (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const beep = (f: number, s: number, d: number, v = 0.25) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(g);
      g.connect(ctx.destination);
      const t0 = ctx.currentTime + s;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(v, t0 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      osc.start(t0);
      osc.stop(t0 + d + 0.02);
    };
    beep(1200, 0.0, 0.22, 0.28);
    beep(900, 0.18, 0.28, 0.24);
  } catch {}
}

/* ---------------- upcoming cards ---------------- */
type UpcomingCard = {
  id: string;
  contactId?: string | null;
  gsKey: "GS1" | "GS2";
  region: RegionId;
  groundStation: string;
  startTime: string; // ISO
  endTime: string; // ISO
};

async function listScheduled({
  region,
  sinceIso,
  untilIso,
  gs,
}: {
  region: RegionId;
  sinceIso: string;
  untilIso: string;
  gs: "gs1" | "gs2";
}) {
  const body = {
    region,
    gs,
    filters: {
      satellite: null,
      missionProfileArn: null,
      groundStation: null,
      statusList: ["SCHEDULED"],
      startTime: sinceIso,
      endTime: untilIso,
    },
    pageToken: null,
  };

  const res = await fetch(`${API}/aws-contacts/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) return [] as UpcomingCard[];

  const j = await res.json();
  const items: any[] = Array.isArray(j?.items) ? j.items : [];
  const scheduledOnly = items.filter((c) => String(c?.status) === "SCHEDULED");

  return scheduledOnly.map((c) => {
    const contactId = c?.contactId ?? null;
    const start = String(c?.startTime || "");
    const gsKey = gs === "gs1" ? "GS1" : "GS2";
    const gsName = c?.groundStation || "";
    const resolvedRegion = inferRegionFromGS(gsName, region);
    const uiId =
      (contactId ? `${contactId}:${gsKey}` : `${gsKey}:${gsName}:${start}`) + ":v2";
    return {
      id: uiId,
      contactId,
      gsKey,
      region: resolvedRegion,
      groundStation: gsName,
      startTime: start,
      endTime: String(c?.endTime || ""),
    } as UpcomingCard;
  });
}

/* ------------ transition for top-center dialog ----------- */
const TopSlide = React.forwardRef(function TopSlide(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="down" ref={ref} {...props} />;
});

/* ===================== Component ===================== */
export default function RightPanel() {
  const { t } = useI18n();
  const { hasRole } = useAuth();
  const isGuest = hasRole("guest");

  /* ---------- UPCOMING PASSES ---------- */
  const [loadingUp, setLoadingUp] = React.useState(false);
  const [cards, setCards] = React.useState<UpcomingCard[]>([] as UpcomingCard[]);
  const tick = React.useRef<number | null>(null);

  // reminder popup state
  const [popup, setPopup] = React.useState<{ card: UpcomingCard; mins: 10 | 30 } | null>(null);

  // real-time title countdown for popup
  const [timeLeftLabel, setTimeLeftLabel] = React.useState("");
  React.useEffect(() => {
    if (!popup) return;
    const update = () => {
      const startMs = new Date(popup.card.startTime).getTime();
      const diff = startMs - Date.now();
      if (diff <= 0) {
        setTimeLeftLabel("starting now");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeftLabel(`${mins}m ${secs}s`);
    };
    update();
    const tmr = window.setInterval(update, 1000);
    return () => window.clearInterval(tmr);
  }, [popup]);

  // remember fired reminders so we don't repeat
  const firedRef = React.useRef<Set<string>>(new Set());
  const markFired = (card: UpcomingCard, mins: 10 | 30) =>
    firedRef.current.add(`${card.id}::${mins}`);

  // Auto-close timer (30s)
  const autoCloseRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (autoCloseRef.current) {
      window.clearTimeout(autoCloseRef.current);
      autoCloseRef.current = null;
    }
    if (popup) {
      autoCloseRef.current = window.setTimeout(() => setPopup(null), 30000);
    }
    return () => {
      if (autoCloseRef.current) {
        window.clearTimeout(autoCloseRef.current);
        autoCloseRef.current = null;
      }
    };
  }, [popup]);

  const refreshUpcoming = React.useCallback(async () => {
    setLoadingUp(true);
    try {
      const now = new Date();
      const sinceIso = new Date(now.getTime() - 5 * 60 * 1000).toISOString();
      const untilIso = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
      const promises: Promise<UpcomingCard[]>[] = [];
      for (const r of ALL_REGIONS) {
        promises.push(listScheduled({ region: r, sinceIso, untilIso, gs: "gs1" }));
        promises.push(listScheduled({ region: r, sinceIso, untilIso, gs: "gs2" }));
      }
      const batches = await Promise.all(promises);
      const merged = batches.flat();

      const future = merged.filter((x) => new Date(x.endTime).getTime() > Date.now());
      future.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );

      const byContact = new Set<string>();
      const byFallback = new Set<string>();
      const unique: UpcomingCard[] = [];
      for (const c of future) {
        if (c.contactId) {
          if (byContact.has(c.contactId)) continue;
          byContact.add(c.contactId);
          unique.push(c);
        } else {
          const k = `${c.gsKey}|${c.groundStation}|${c.startTime}`;
          if (byFallback.has(k)) continue;
          byFallback.add(k);
          unique.push(c);
        }
      }

      setCards(unique.slice(0, 30));
    } catch (e) {
      console.error("[upcoming] refresh failed:", e);
      setCards([]);
    } finally {
      setLoadingUp(false);
    }
  }, []);

  // Initial load + refresh every 60s
  React.useEffect(() => {
    refreshUpcoming();
    const tmr = window.setInterval(refreshUpcoming, 60000);
    return () => window.clearInterval(tmr);
  }, [refreshUpcoming]);

  // Countdown ticker; drop finished + fire reminders
  React.useEffect(() => {
    tick.current = window.setInterval(() => {
      const now = Date.now();

      // drop finished
      setCards((prev) => prev.filter((c) => now < new Date(c.endTime).getTime()));

      const THIRTY = 30 * 60 * 1000;
      const TEN = 10 * 60 * 1000;

      cards.slice(0, 6).forEach((c) => {
        const startMs = new Date(c.startTime).getTime();
        const startsIn = startMs - now;

        if (startsIn <= THIRTY && startsIn > 0) {
          const k = `${c.id}::30`;
          if (!firedRef.current.has(k)) {
            markFired(c, 30);
            setPopup({ card: c, mins: 30 });
            playAlert();
          }
        }
        if (startsIn <= TEN && startsIn > 0) {
          const k = `${c.id}::10`;
          if (!firedRef.current.has(k)) {
            markFired(c, 10);
            setPopup({ card: c, mins: 10 });
            playAlert();
          }
        }
      });
    }, 1000) as unknown as number;

    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [cards]);

  /* ---------- Recent requests ---------- */
  const [recentReqs, setRecentReqs] = React.useState<TicketLite[]>([] as TicketLite[]);
  const [loadingReqs, setLoadingReqs] = React.useState(false);

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
        {/* ---------- Upcoming Passes ---------- */}
        <Typography variant="subtitle1" sx={{ fontWeight: 700, letterSpacing: 0.2, fontSize: 15 }}>
          Upcoming Passes
        </Typography>
        <Divider sx={{ borderColor: vars.border }} />

        <Box
          sx={{
            flex: 0,
            maxHeight: 80,
            minHeight: 283,
            overflowY: "auto",
            pr: 0.5,
            ...sxPresets.scroller,
          }}
        >
          {loadingUp ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : cards.length === 0 ? (
            <Typography sx={{ fontSize: 12.5, color: vars.textDim, mt: 0.5 }}>
              No upcoming passes.
            </Typography>
          ) : (
            cards.map((c) => {
              const now = Date.now();
              const startMs = new Date(c.startTime).getTime();
              const endMs = new Date(c.endTime).getTime();
              const startsIn = startMs - now;
              const endsIn = endMs - now;
              const running = startsIn <= 0 && endsIn > 0;
              const countdownLabel = running ? `Ends in ${hms(endsIn)}` : `Starts in ${hms(startsIn)}`;

              return (
                <Paper
                  key={c.id}
                  elevation={0}
                  sx={{
                    width: "100%",
                    boxSizing: "border-box",
                    bgcolor: vars.bgHover,
                    border: `1px solid ${vars.border}`,
                    borderRadius: 2,
                    px: 1,
                    py: 0.9,
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35 }}>
                      <Chip
                        label={c.gsKey}
                        size="small"
                        sx={{
                          height: 18,
                          "& .MuiChip-label": { px: 0.8, fontSize: 11, fontWeight: 800, lineHeight: "18px" },
                          bgcolor: c.gsKey === "GS1" ? "rgba(56,189,248,0.22)" : "rgba(124,87,242,0.22)",
                          color: c.gsKey === "GS1" ? "#93c5fd" : "#c7b8ff",
                          borderRadius: 1,
                          alignSelf: "flex-start",
                        }}
                      />
                      <Chip
                        label={countdownLabel}
                        size="small"
                        sx={{
                          height: 18,
                          alignSelf: "flex-start",
                          "& .MuiChip-label": {
                            px: 0.8,
                            fontSize: 11,
                            fontWeight: 800,
                            lineHeight: "18px",
                            fontVariantNumeric: "tabular-nums lining-nums",
                            fontFeatureSettings: '"tnum" 1, "lnum" 1',
                          },
                          bgcolor: running ? "rgba(34,197,94,0.22)" : "rgba(37,99,235,0.22)",
                          color: running ? "#86efac" : "#93c5fd",
                          borderRadius: 1,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography sx={{ fontSize: 12.5, color: vars.textWeak, mb: 0.25 }}>
                    {c.groundStation || "-"} • {c.region}
                  </Typography>
                  {/* SHOW IST Start and UTC Start */}
                  <Typography sx={{ fontSize: 11.5, color: vars.textDim }}>
                    IST Start: {toIst(c.startTime)}
                  </Typography>
                  <Typography sx={{ fontSize: 11.5, color: vars.textDim }}>
                    UTC Start: {toUtc(c.startTime)}
                  </Typography>
                </Paper>
              );
            })
          )}
        </Box>

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

      {/* ---------- Reminder Popup (top-center, slide, 30s auto-hide, real-time countdown) ---------- */}
      <Dialog
        open={!!popup}
        TransitionComponent={TopSlide}
        onClose={() => setPopup(null)}
        maxWidth="xs"
        fullWidth
        sx={{
          zIndex: (t) => t.zIndex.modal + 2,
          "& .MuiDialog-container": {
            alignItems: "flex-start",   // top
            justifyContent: "center",   // centered horizontally
          },
        }}
        PaperProps={{
          sx: {
            mt: 2.5,
            bgcolor: (t) => (t.palette.mode === "dark" ? "#1E1F23" : "#fff"),
            color: vars.text,
            border: `1px solid ${vars.border}`,
            borderRadius: 4,
            boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
            p: 2,
          },
        }}
      >
        {popup && (
          <Box sx={{ display: "grid", gap: 1.25 }}>
            {/* title row */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                {`Pass starts in ${timeLeftLabel || (popup.mins === 30 ? "30 minutes" : "10 minutes")} (${popup.card.gsKey})`}
              </Typography>
              <Box sx={{ ml: "auto" }}>
                <IconButton
                  size="small"
                  onClick={() => setPopup(null)}
                  sx={{ color: vars.textDim }}
                  aria-label="Close"
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Box>
            </Box>

            {/* body */}
            <Typography sx={{ fontSize: 13.5, color: vars.textWeak, lineHeight: 1.5 }}>
              <strong>{popup.card.gsKey}</strong> • {popup.card.groundStation} • {popup.card.region}
              <br />
              IST Start: {toIst(popup.card.startTime)}
              <br />
              UTC Start: {toUtc(popup.card.startTime)}
            </Typography>

            {/* actions */}
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 0.5, flexWrap: "wrap" }}>
              {popup.mins === 30 && (
                <Button
                  onClick={() => {
                    // ensure 10-min reminder can still fire later
                    const key10 = `${popup.card.id}::10`;
                    if (firedRef.current.has(key10)) {
                      firedRef.current.delete(key10);
                    }
                    setPopup(null);
                  }}
                  startIcon={<TuneRoundedIcon />}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    borderRadius: 999,
                    px: 1.6,
                    border: `1px solid ${vars.border}`,
                    bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(148,163,184,0.12)" : "#f3f4f6"),
                    "&:hover": {
                      bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(148,163,184,0.18)" : "#e5e7eb"),
                    },
                  }}
                >
                  Remind at 10 min
                </Button>
              )}

              <Button
                onClick={() => setPopup(null)}
                startIcon={<CloseRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 1.6,
                  bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(239,68,68,0.18)" : "rgba(239,68,68,0.12)"),
                  color: (t) => (t.palette.mode === "dark" ? "#fecaca" : "#b91c1c"),
                  "&:hover": {
                    bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(239,68,68,0.28)" : "rgba(239,68,68,0.18)"),
                  },
                }}
              >
                Dismiss
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  try {
                    // mark both reminders as fired to avoid repeats
                    firedRef.current.add(`${popup.card.id}::30`);
                    firedRef.current.add(`${popup.card.id}::10`);
                  } catch {}
                  setPopup(null);
                  try {
                    window.location.href = "/pass-schedule";
                  } catch {}
                }}
                startIcon={<CheckCircleRoundedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  borderRadius: 999,
                  px: 1.6,
                  bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(34,197,94,0.35)" : "rgba(34,197,94,0.9)"),
                  color: (t) => (t.palette.mode === "dark" ? "#bbf7d0" : "#052e16"),
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(34,197,94,0.45)" : "rgba(22,163,74,1)"),
                    boxShadow: "none",
                  },
                }}
              >
                Open Contacts
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
