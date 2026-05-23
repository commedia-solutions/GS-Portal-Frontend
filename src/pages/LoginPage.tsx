// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const resolveLandingRoute = () => {
  const role = sessionStorage.getItem("pmgt_role");
  if (role === "admin") return "/pass-list";
  try {
    const raw = sessionStorage.getItem("pmgt_page_access");
    const parsed = raw ? JSON.parse(raw) : null;
    let pages: string[] = [];
    if (Array.isArray(parsed?.pages)) {
      pages = parsed.pages.map((p: any) => p.page_key || p).filter(Boolean);
    } else {
      pages = [...(parsed?.viewerPages || []), ...(parsed?.editorPages || [])];
    }
    if (pages.includes("pass_list")) return "/pass-list";
    if (pages.includes("dashboard")) return "/pass-list";
    if (pages.includes("satellites")) return "/satellites";
    if (pages.includes("licenses")) return "/licenses";
    if (pages.includes("passes")) return "/passes";
    if (pages.includes("documents")) return "/documents";
    return "/unauthorized";
  } catch {
    return "/unauthorized";
  }
};

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth, resolveRoleFromMe } from "../auth";

// ✅ correct extensions for your assets
import imgSpace1 from "../assets/satellite_bg.jpg";
import isroLogo from "../assets/isro_logo.png";

import { api, setAuthToken } from "../api/http";

const TOAST_OPTS = { position: "top-right" as const, autoClose: 2500 };

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@300;400;500&display=swap');

  .istrac-root {
    position: fixed; inset: 0;
    background: #020608;
    font-family: 'JetBrains Mono', monospace;
    color: #cce8f4;
    overflow: hidden;
  }

  .istrac-bg {
    position: absolute; inset: 0; z-index: 0;
    width: 100%; height: 100%;
    object-fit: cover; object-position: center 20%;
  }
  .istrac-veil {
    position: absolute; inset: 0; z-index: 1;
    background: linear-gradient(105deg,
      rgba(2,6,8,0.25) 0%,
      rgba(2,6,8,0.30) 45%,
      rgba(2,6,8,0.75) 60%,
      rgba(2,6,8,0.88) 100%
    );
  }

  .istrac-hud-left {
    position: absolute; left: 36px; top: 50%; transform: translateY(-50%);
    z-index: 4; pointer-events: none;
    display: flex; flex-direction: column; gap: 20px;
    animation: istrac-flicker 14s linear infinite;
  }
  @keyframes istrac-flicker {
    0%,100%{opacity:0.5} 8%{opacity:0.18} 13%{opacity:0.55} 50%{opacity:0.6} 52%{opacity:0.2} 57%{opacity:0.55}
  }
  .istrac-hud-row { display: flex; flex-direction: column; }
  .istrac-hud-k { font-size: 7px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(120,180,210,0.28); }
  .istrac-hud-v { font-size: 9px; color: rgba(125,216,240,0.65); margin-top: 2px; }
  .istrac-hud-ring {
    width: 40px; height: 40px; border-radius: 50%;
    border: 0.5px solid rgba(125,216,240,0.3);
    position: relative;
    animation: istrac-spin 10s linear infinite;
  }
  .istrac-hud-ring::before {
    content: ''; position: absolute; top: -2px; left: 50%; transform: translateX(-50%);
    width: 4px; height: 4px; border-radius: 50%;
    background: #e07b20; box-shadow: 0 0 6px #e07b20;
  }
  @keyframes istrac-spin { to { transform: rotate(360deg); } }
  .istrac-hud-bars { display: flex; gap: 3px; margin-top: 3px; }
  .istrac-hud-bar { width: 3px; height: 10px; background: rgba(125,216,240,0.5); }
  .istrac-hud-bar.dim { background: rgba(125,216,240,0.1); }

  .istrac-topbar {
    position: absolute; top: 0; left: 0; right: 0; z-index: 10;
    display: flex; justify-content: space-between; align-items: center;
    padding: 16px 40px;
    background: transparent;
  }
  .istrac-brand { display: flex; align-items: center; gap: 12px; }
  .istrac-topbar-logo { width: 58px; height: 58px; object-fit: contain; filter: brightness(1.1) saturate(1.15); }
  .istrac-topbar-title { display: flex; flex-direction: column; }
  .istrac-topbar-name {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
    letter-spacing: 0.14em; color: #ffffff; line-height: 1;
  }
  .istrac-topbar-sub {
    font-size: 7.5px; letter-spacing: 0.3em; text-transform: uppercase;
    color: #7dd8f0; margin-top: 4px;
  }
  .istrac-topbar-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
  .istrac-enc-label { font-size: 7px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(120,180,210,0.28); }
  .istrac-enc-val { font-size: 9px; color: #7dd8f0; }

  .istrac-main {
    position: absolute; inset: 0; z-index: 5;
    display: flex; align-items: center; justify-content: flex-end;
    padding: 90px 60px 40px 0;
  }

  .istrac-card-wrap { width: 380px; position: relative; }
  .istrac-card-wrap::before {
    content: '';
    position: absolute; inset: -50px;
    background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(46,126,199,0.10), transparent 70%);
    border-radius: 50%; pointer-events: none; z-index: -1;
  }
  .istrac-card {
    position: relative;
    background: rgba(4,12,22,0.22);
    border: 0.5px solid rgba(125,216,240,0.25);
    border-radius: 3px;
    padding: 34px 34px 22px;
    backdrop-filter: blur(6px);
  }
  .istrac-corner { position: absolute; width: 14px; height: 14px; z-index: 10; pointer-events: none; }
  .istrac-corner.tl { top: -1px; left: -1px; border-top: 1.5px solid #7dd8f0; border-left: 1.5px solid #7dd8f0; border-top-left-radius: 3px; opacity: 0.9; }
  .istrac-corner.tr { top: -1px; right: -1px; border-top: 1.5px solid #7dd8f0; border-right: 1.5px solid #7dd8f0; border-top-right-radius: 3px; opacity: 0.9; }
  .istrac-corner.bl { bottom: -1px; left: -1px; border-bottom: 1.5px solid #7dd8f0; border-left: 1.5px solid #7dd8f0; border-bottom-left-radius: 3px; opacity: 0.9; }
  .istrac-corner.br { bottom: -1px; right: -1px; border-bottom: 1.5px solid #7dd8f0; border-right: 1.5px solid #7dd8f0; border-bottom-right-radius: 3px; opacity: 0.9; }

  .istrac-badge {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 4px 10px; margin-bottom: 16px;
    border: 0.5px solid rgba(224,123,32,0.3); border-radius: 2px;
  }
  .istrac-badge-dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: #e07b20;
    animation: istrac-blink 2.4s ease-in-out infinite;
  }
  @keyframes istrac-blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
  .istrac-badge-txt { font-size: 8px; letter-spacing: 0.22em; text-transform: uppercase; color: #e07b20; }

  .istrac-logo-row { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
  .istrac-card-logo {
    width: 54px; height: 54px; object-fit: contain;
    filter: brightness(1.2) saturate(1.2) contrast(1.1);
    mix-blend-mode: screen;
  }
  .istrac-card-title { display: flex; flex-direction: column; }
  .istrac-card-name {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 26px;
    letter-spacing: 0.1em; color: #e8f6ff; line-height: 1;
  }
  .istrac-card-tagline {
    font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
    color: #7dd8f0; margin-top: 4px; opacity: 0.8;
  }
  .istrac-card-desc {
    font-size: 10px; color: rgba(160,210,235,0.5); line-height: 1.75;
    margin: 10px 0 18px; letter-spacing: 0.03em;
  }

  .istrac-field { margin-bottom: 13px; }
  .istrac-field-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .istrac-field-label-txt { font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(160,210,235,0.5); }
  .istrac-field-code { font-size: 7px; color: rgba(120,180,210,0.28); }
  .istrac-input-wrap { position: relative; }
  .istrac-input-icon {
    position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
    font-size: 13px; color: rgba(125,216,240,0.35); pointer-events: none;
  }
  .istrac-input {
    width: 100%; box-sizing: border-box;
    background: rgba(125,216,240,0.04) !important;
    border: 0.5px solid rgba(125,216,240,0.15) !important;
    border-radius: 2px;
    padding: 12px 14px 12px 38px;
    font-size: 12px; font-family: 'JetBrains Mono', monospace;
    color: #cce8f4 !important; outline: none; letter-spacing: 0.06em;
    transition: border-color 0.2s, background 0.2s;
  }
  .istrac-input:-webkit-autofill,
  .istrac-input:-webkit-autofill:hover,
  .istrac-input:-webkit-autofill:focus,
  .istrac-input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px rgba(4,12,22,1) inset !important;
    -webkit-text-fill-color: #cce8f4 !important;
    transition: background-color 5000s ease-in-out 0s;
  }
  .istrac-input::placeholder { color: rgba(120,180,210,0.2) !important; }
  .istrac-input:focus { border-color: rgba(125,216,240,0.4) !important; background: rgba(125,216,240,0.07) !important; }
  .istrac-field-link {
    font-size: 7px; letter-spacing: 0.14em; text-transform: uppercase;
    color: rgba(125,216,240,0.35); text-decoration: underline;
    text-underline-offset: 3px; cursor: pointer; background: none; border: none;
  }

  .istrac-btn {
    width: 100%; margin-top: 16px; padding: 13px 20px;
    background: linear-gradient(90deg, #1a5fa0, #2e7ec7);
    border: none; border-radius: 2px;
    font-family: 'Syne', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase;
    color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    position: relative; overflow: hidden;
    transition: filter 0.2s, transform 0.1s;
    box-shadow: 0 0 20px rgba(46,126,199,0.25);
  }
  .istrac-btn:hover { filter: brightness(1.15); box-shadow: 0 0 32px rgba(46,126,199,0.4); }
  .istrac-btn:active { transform: scale(0.98); }
  .istrac-btn:disabled { opacity: 0.7; cursor: not-allowed; }
  .istrac-btn-shine {
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%); transition: transform 1s;
  }
  .istrac-btn:hover .istrac-btn-shine { transform: translateX(100%); }

  .istrac-card-footer {
    margin-top: 14px; padding-top: 12px;
    border-top: 0.5px solid rgba(125,216,240,0.08);
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .istrac-card-footer-txt {
    font-size: 7px; letter-spacing: 0.22em; text-transform: uppercase;
    color: rgba(125,216,240,0.25);
  }

  @media (max-width: 768px) {
    .istrac-main { justify-content: center; padding: 90px 20px 40px; }
    .istrac-hud-left { display: none; }
    .istrac-card-wrap { width: 100%; max-width: 380px; }
  }
`;

const LoginPage: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error("Username/Email and password are required", TOAST_OPTS);
      return;
    }
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: any }>(
        "/api/auth/login",
        { usernameOrEmail: identifier.trim(), password }
      );
      const { token, user } = res;
      setAuthToken(token, true);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("pmgt_token", token);
      sessionStorage.setItem("user", JSON.stringify(user));
      sessionStorage.removeItem("pmgt_role");
      sessionStorage.removeItem("pmgt_role_type");
      sessionStorage.removeItem("pmgt_page_access");
      sessionStorage.removeItem("profile");
      sessionStorage.removeItem("pmgt_full_name");
      sessionStorage.removeItem("pmgt_username");
      sessionStorage.removeItem("pmgt_email");

      const me: any = await api.get("/api/auth/me");
      const pages = Array.isArray(me.pages) ? me.pages : [];
      const viewerPages = pages.filter((p: any) => p?.access_level === "viewer").map((p: any) => p?.page_key).filter(Boolean);
      const editorPages = pages.filter((p: any) => p?.access_level === "editor").map((p: any) => p?.page_key).filter(Boolean);
      sessionStorage.setItem("pmgt_page_access", JSON.stringify({ viewerPages, editorPages }));
      sessionStorage.setItem("profile", JSON.stringify(me));
      sessionStorage.setItem("pmgt_full_name", me?.full_name ?? me?.fullName ?? "");
      sessionStorage.setItem("pmgt_username", me?.username ?? "");
      sessionStorage.setItem("pmgt_email", me?.email ?? "");
      const resolvedRole = resolveRoleFromMe(me);
      sessionStorage.setItem("pmgt_role", resolvedRole);
      const isEditorRole = editorPages.length > 0 || String(me?.roleType).toLowerCase() === "editor";
      sessionStorage.setItem("pmgt_role_type", isEditorRole ? "editor" : "viewer");
      setUser({ id: Number(me?.id), username: String(me?.username || ""), roleId: me?.roleId ?? null, role: resolvedRole });
      toast.success("Login successful! Redirecting…", TOAST_OPTS);
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("pmgt:page-access-updated"));
        navigate(resolveLandingRoute(), { replace: true });
      });
    } catch (err: any) {
      const msg = err?.message === "Unauthorized" ? "Invalid credentials" : err?.message || "Network error during login";
      toast.error(msg, TOAST_OPTS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="istrac-root">
        <ToastContainer />

        {/* Background */}
        <img src={imgSpace1} alt="background" className="istrac-bg" />
        <div className="istrac-veil" />

        {/* HUD Left */}
        <div className="istrac-hud-left">
          <div className="istrac-hud-ring" />
          <div className="istrac-hud-row">
            <span className="istrac-hud-k">Station Lat</span>
            <span className="istrac-hud-v">13.0827° N</span>
          </div>
          <div className="istrac-hud-row">
            <span className="istrac-hud-k">Station Long</span>
            <span className="istrac-hud-v">80.2707° E</span>
          </div>
          <div className="istrac-hud-row">
            <span className="istrac-hud-k">Uplink</span>
            <span className="istrac-hud-v">NOMINAL</span>
          </div>
          <div className="istrac-hud-row">
            <span className="istrac-hud-k">Orbit Pass</span>
            <span className="istrac-hud-v">08:42 UTC</span>
          </div>
          <div className="istrac-hud-row">
            <span className="istrac-hud-k">Subsystem</span>
            <div className="istrac-hud-bars">
              <div className="istrac-hud-bar" />
              <div className="istrac-hud-bar" />
              <div className="istrac-hud-bar" />
              <div className="istrac-hud-bar dim" />
            </div>
          </div>
        </div>

        {/* Topbar */}
        <nav className="istrac-topbar">
          <div className="istrac-brand">
            <img className="istrac-topbar-logo" src={isroLogo} alt="ISTRAC Logo" />
            <div className="istrac-topbar-title">
              <span className="istrac-topbar-name">ISTRAC</span>
              <span className="istrac-topbar-sub">ISRO Telemetry, Tracking &amp; Command Network</span>
            </div>
          </div>
          {/* <div className="istrac-topbar-right">
            <span className="istrac-enc-label">Encryption Level</span>
            <span className="istrac-enc-val">SECURE_LEVEL_ALPHA</span>
          </div> */}
        </nav>

        {/* Main */}
        <main className="istrac-main">
          <div className="istrac-card-wrap">
            <form className="istrac-card" onSubmit={handleLogin}>
              <div className="istrac-corner tl" />
              <div className="istrac-corner tr" />
              <div className="istrac-corner bl" />
              <div className="istrac-corner br" />

              <div className="istrac-badge">
                <div className="istrac-badge-dot" />
                <span className="istrac-badge-txt">Systems Online · Ready for Auth</span>
              </div>

              <div className="istrac-logo-row">
                <img className="istrac-card-logo" src={isroLogo} alt="ISTRAC" />
                <div className="istrac-card-title">
                  <span className="istrac-card-name">ISTRAC</span>
                  <span className="istrac-card-tagline">Mission Control Access</span>
                </div>
              </div>

              <p className="istrac-card-desc">
                Insert your Username and Password to<br />
                authenticate with the ISTRAC mission network.
              </p>

              {/* Operator ID */}
              <div className="istrac-field">
                <div className="istrac-field-label">
                  <span className="istrac-field-label-txt">Username</span>
                  <span className="istrac-field-code">0x9F22 · AUTH</span>
                </div>
                <div className="istrac-input-wrap">
                  <span className="istrac-input-icon">⊡</span>
                  <input
                    className="istrac-input"
                    type="text"
                    placeholder="Enter Username"
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Access Key */}
              <div className="istrac-field">
                <div className="istrac-field-label">
                  <span className="istrac-field-label-txt">Password</span>
                  <button type="button" className="istrac-field-link" onClick={() => alert("Please Contact Admin")}>Lost access?</button>
                </div>
                <div className="istrac-input-wrap">
                  <span className="istrac-input-icon">◈</span>
                  <input
                    className="istrac-input"
                    type="password"
                    placeholder="Enter Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button className="istrac-btn" type="submit" disabled={loading}>
                <div className="istrac-btn-shine" />
                <span>{loading ? "LINKING..." : "SIGN IN"}</span>
              </button>

              <div className="istrac-card-footer">
                <span className="istrac-card-footer-txt">
                  End-to-end spectral encryption · ISRO Certified
                </span>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
};

export default LoginPage;
