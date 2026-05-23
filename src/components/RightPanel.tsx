// src/components/RightPanel.tsx
import React from "react";
import { CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { api } from "../api/http";
import { vars } from "../ui/toast/themeBridge";

/* Icons from MUI */
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";

/* ─────────── Layout constants ─────────── */
export const APP_BAR_H = 56;
export const RIGHT_RAIL_W = 220;

/* ─────────── Charcoal theme tokens ─────────── */
const BG = vars.bgApp;
const BORDER = vars.border;
const TEXT = vars.text;
const DIM = vars.textDim;
const ACCENT = vars.accent;

/* ─────────── Types ─────────── */
type TicketLite = {
  id: number;
  ticket_no: string;
  status: string;
  created_at: string;
  categories?: string;
  requester_name: string;
  target_name: string;
  requester_id: number;
};

const POLL_MS = 25000;

/* ─────────── Status colour helper ─────────── */
function statusStyle(status: string) {
  switch (status) {
    case "Submitted":   return { color: "#38bdf8", bg: "rgba(56,189,248,0.12)", dot: "#38bdf8" };
    case "In Progress": return { color: "#fbbf24", bg: "rgba(245,158,11,0.12)", dot: "#fbbf24" };
    case "In Review":   return { color: "#0EA5E9", bg: "rgba(14,165,233,0.12)", dot: "#0EA5E9" };
    case "Done":        return { color: "#4ade80", bg: "rgba(34,197,94,0.12)", dot: "#4ade80" };
    default:           return { color: DIM,       bg: "rgba(90,93,107,0.12)", dot: DIM };
  }
}

/* ===================== Component ===================== */
export default function RightPanel() {
  const { t } = useI18n();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recentReqs, setRecentReqs] = React.useState<TicketLite[]>([]);
  const [loadingReqs, setLoadingReqs] = React.useState(false);

  const fetchRecent = React.useCallback(async () => {
    try {
      setLoadingReqs(true);
      const j = await api.get<any>("/api/tickets?type=request&scope=inbox&page=1&size=12");
      const rows: any[] = Array.isArray(j?.rows) ? j.rows : [];
      const mapped: TicketLite[] = rows
        .map(r => ({
          id: Number(r.id),
          ticket_no: String(r.ticket_no || ""),
          status: String(r.status || ""),
          created_at: String(r.created_at || ""),
          categories: String(r.categories || ""),
          requester_name: String(r.requester_name || ""),
          target_name: String(r.target_name || ""),
          requester_id: Number(r.requester_id),
        }))
        .filter(r => r.status !== "Done");
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
    fetchRecent();
    const tmr = window.setInterval(() => fetchRecent(), POLL_MS);
    return () => window.clearInterval(tmr);
  }, [fetchRecent]);

  return (
    <>
      {/* Inject shimmer and scroll styling for this panel */}
      <style>{`
        @keyframes rp-scan-line {
          0%   { transform: translateY(-150%); opacity: 0; }
          20%  { opacity: 0.1; }
          50%  { opacity: 0.15; }
          80%  { opacity: 0.1; }
          100% { transform: translateY(250%); opacity: 0; }
        }
        .rp-scan-line {
          animation: rp-scan-line 15s linear infinite;
          background: linear-gradient(180deg, transparent, rgba(139, 92, 246,0.05), transparent);
          pointer-events: none;
        }
        .charcoal-scroll::-webkit-scrollbar { width: 4px; }
        .charcoal-scroll::-webkit-scrollbar-track { background: transparent; }
        .charcoal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); borderRadius: 10px; }
        .charcoal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
      `}</style>

      <div style={{
        position: "fixed",
        top: 0, right: 0,
        height: "100vh",
        width: RIGHT_RAIL_W,
        background: BG,
        borderLeft: `1px solid ${BORDER}`,
        zIndex: 8,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header (Top Nav Alignment) */}
        <div style={{
          height: APP_BAR_H,
          borderBottom: `1px solid ${BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          position: "relative",
          zIndex: 1,
          background: "rgba(9,9,12,0.6)",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 1 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: ACCENT, boxShadow: `0 0 10px ${ACCENT}`,
            }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: TEXT, letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.9 }}>
              {t("Inbox")}
            </span>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "12px 10px 0", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: TEXT }}>{t("Recent Requests")}</span>
            <button
              onClick={() => navigate("/requests?tab=list&scope=inbox")}
              style={{
                display: "flex", alignItems: "center", gap: 3,
                background: "none", border: "none", cursor: "pointer",
                fontSize: 10.5, color: ACCENT, padding: 0,
                fontWeight: 500,
              }}
            >
              {t("View all")}
              <ArrowForwardIcon style={{ width: 12, height: 12 }} />
            </button>
          </div>

          <div className="charcoal-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 16 }}>
            {loadingReqs ? (
              <div style={{ display: "flex", justifyContent: "center", paddingTop: 24 }}>
                <CircularProgress size={18} sx={{ color: ACCENT }} />
              </div>
            ) : recentReqs.length === 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", paddingTop: 32, gap: 10,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(124,110,245,0.08)",
                  border: "1px solid rgba(124,110,245,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <MoveToInboxIcon style={{ width: 18, height: 18, color: ACCENT, opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: 12, color: DIM, textAlign: "center", lineHeight: 1.4 }}>
                  {t("No active requests.")}
                </span>
              </div>
            ) : (
              recentReqs.map(r => {
                const s = statusStyle(r.status);
                const isFromMe = user?.id ? r.requester_id === user.id : false;
                const dateStr = new Date(r.created_at).toLocaleDateString("en-GB", {
                  day: "2-digit", month: "short",
                });
                return <RequestCard key={r.id} r={r} s={s} isFromMe={isFromMe} dateStr={dateStr} t={t} navigate={navigate} />;
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function RequestCard({ r, s, isFromMe, dateStr, t, navigate }: {
  r: TicketLite;
  s: ReturnType<typeof statusStyle>;
  isFromMe: boolean;
  dateStr: string;
  t: (k: string) => string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [hovered, setHovered] = React.useState(false);
  const main = s.color;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/requests?id=${r.id}`)}
      style={{
        position: "relative",
        background: hovered ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.01)",
        border: `1px solid ${hovered ? main : `${main}25`}`,
        borderRadius: 12,
        padding: "12px",
        marginBottom: 8,
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute",
        top: "-15%", right: "-15%",
        width: 70, height: 70,
        background: `radial-gradient(circle, ${main}15 0%, transparent 70%)`,
        filter: "blur(15px)",
        pointerEvents: "none",
        opacity: hovered ? 1 : 0.5,
      }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 9.5, fontWeight: 900, color: main, letterSpacing: "0.06em" }}>{r.ticket_no}</span>
        <span style={{ fontSize: 9.5, color: DIM, fontWeight: 500 }}>{dateStr}</span>
      </div>

      <div style={{
        fontSize: 12, 
        fontWeight: 700, 
        color: TEXT,
        marginBottom: 4,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>{r.categories || t("General Request")}</div>

      <div style={{
        fontSize: 10, 
        color: DIM, 
        fontWeight: 500,
        marginBottom: 10,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}>{isFromMe ? `${t("To")}: ${r.target_name}` : `${t("From")}: ${r.requester_name}`}</div>

      <div style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 8px",
        borderRadius: 5,
        background: s.bg,
        color: s.color,
        fontSize: 8.5,
        fontWeight: 900,
        border: `1px solid ${s.dot}20`,
        letterSpacing: "0.02em",
      }}>
        <div style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: s.dot,
          boxShadow: `0 0 6px ${s.dot}`,
        }} />
        {r.status.toUpperCase()}
      </div>
    </div>
  );
}