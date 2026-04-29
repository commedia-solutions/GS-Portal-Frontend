// p3 
import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import { Link as RouterLink, useNavigate } from "react-router-dom";
// import { useNavigate } from "react-router-dom";
const resolveLandingRoute = () => {
  const role = sessionStorage.getItem("pmgt_role");

  if (role === "admin") return "/dashboard";

  try {
    const raw = sessionStorage.getItem("pmgt_page_access");
const parsed = raw ? JSON.parse(raw) : null;

// ✅ support both formats:
// { pages: [...] } OR { viewerPages:[], editorPages:[] }
let pages: string[] = [];

if (Array.isArray(parsed?.pages)) {
  // if old format objects exist
  pages = parsed.pages.map((p: any) => p.page_key || p).filter(Boolean);
} else {
  pages = [...(parsed?.viewerPages || []), ...(parsed?.editorPages || [])];
}



    if (pages.includes("dashboard")) return "/dashboard";
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

import imgLogin from "../assets/space3.png";
import imgSpace1 from "../assets/space1.jpg";
import imgSpace2 from "../assets/space2.jpg";
import isroLogo from "../assets/isro_logo.png";

// ✅ use centralized client
import { api, setAuthToken } from "../api/http";

const TOAST_OPTS = {
  position: "top-right" as const,
  autoClose: 2500,
};

const LoginPage: React.FC = () => {
  // left carousel
  const slides = [imgLogin, imgSpace1, imgSpace2];
  const [index, setIndex] = useState(0);
  const { setUser } = useAuth();

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(id);
  }, [slides.length]);

  // form state
  const [identifier, setIdentifier] = useState(""); // username OR email
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      toast.error("Username/Email and password are required", TOAST_OPTS);
      return;
    }

    setLoading(true);
    try {
      // ✅ backend expects { usernameOrEmail, password }
     const res = await api.post<{ token: string; user: any }>(
  "/api/auth/login",
  { usernameOrEmail: identifier.trim(), password }
);
const { token, user } = res;

setAuthToken(token, true);

sessionStorage.setItem("token", token);        // ✅ REQUIRED
sessionStorage.setItem("pmgt_token", token);   // ✅ REQUIRED (safe)
sessionStorage.setItem("user", JSON.stringify(user));

// clear old session BEFORE saving new data
sessionStorage.removeItem("pmgt_role");
sessionStorage.removeItem("pmgt_role_type");
sessionStorage.removeItem("pmgt_page_access");
sessionStorage.removeItem("profile");
sessionStorage.removeItem("pmgt_full_name");
sessionStorage.removeItem("pmgt_username");
sessionStorage.removeItem("pmgt_email");

const me: any = await api.get("/api/auth/me");

const pages = Array.isArray(me.pages) ? me.pages : [];

const viewerPages = pages
  .filter((p: any) => p?.access_level === "viewer")
  .map((p: any) => p?.page_key)
  .filter(Boolean);

const editorPages = pages
  .filter((p: any) => p?.access_level === "editor")
  .map((p: any) => p?.page_key)
  .filter(Boolean);

// save access
sessionStorage.setItem(
  "pmgt_page_access",
  JSON.stringify({ viewerPages, editorPages })
);

// save profile
sessionStorage.setItem("profile", JSON.stringify(me));
sessionStorage.setItem("pmgt_full_name", me?.full_name ?? me?.fullName ?? "");
sessionStorage.setItem("pmgt_username", me?.username ?? "");
sessionStorage.setItem("pmgt_email", me?.email ?? "");

// save role & roleType
const resolvedRole = resolveRoleFromMe(me);
sessionStorage.setItem("pmgt_role", resolvedRole);

const isEditorRole =
  editorPages.length > 0 || String(me?.roleType).toLowerCase() === "editor";

sessionStorage.setItem("pmgt_role_type", isEditorRole ? "editor" : "viewer");


// update context
setUser({
  id: Number(me?.id),
  username: String(me?.username || ""),
  roleId: me?.roleId ?? null,
  role: resolvedRole,
  roleName: String(me?.roleName || me?.role || "User"),
});

// notify + redirect
toast.success("Login successful! Redirecting…", TOAST_OPTS);

requestAnimationFrame(() => {
  window.dispatchEvent(new Event("pmgt:page-access-updated"));
  window.location.href = resolveLandingRoute();
});


return;



    } catch (err: any) {
      const msg =
        err?.message === "Unauthorized"
          ? "Invalid credentials"
          : err?.message || "Network error during login";
      toast.error(msg, TOAST_OPTS);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        bgcolor: "#1c1a1fff",
        overflow: "hidden",
      }}
    >
      <ToastContainer />

      <Box
        sx={{
          position: "absolute",
          inset: { xs: 10, md: 16 },
          borderRadius: 3,
        }}
      >
        <Box sx={{ height: "100%", display: "flex", gap: { xs: 2, md: 3 } }}>
          {/* LEFT: Carousel */}
          <Box
            sx={{
              flexBasis: { xs: "100%", md: "50%" },
              flexGrow: 0,
              flexShrink: 0,
              position: "relative",
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "#000",
            }}
          >
            <Box
              component="img"
              src={isroLogo}
              alt="ISRO"
              sx={{
                position: "absolute",
                top: 14,
                left: 18,
                height: 70,
                objectFit: "contain",
                zIndex: 3,
                userSelect: "none",
                pointerEvents: "none",
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
              }}
            />

            {slides.map((src, i) => (
              <Box
                key={i}
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${src})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  opacity: i === index ? 1 : 0,
                  transition: "opacity 600ms ease",
                }}
              />
            ))}

            <Box
              sx={{
                position: "absolute",
                bottom: 18,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1.5,
              }}
            >
              {slides.map((_, i) => (
                <Box
                  key={i}
                  onClick={() => setIndex(i)}
                  sx={{
                    width: 26,
                    height: 6,
                    borderRadius: 999,
                    bgcolor:
                      i === index
                        ? "rgba(255,255,255,1)"
                        : "rgba(255,255,255,0.35)",
                    cursor: "pointer",
                    transition: "background-color 200ms ease",
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* RIGHT: Login form */}
          <Box
            sx={{
              flex: 1,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{
                width: { xs: "92%", sm: "80%", md: "70%" },
                maxWidth: 520,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: 28, md: 40 },
                  fontWeight: 700,
                  color: "#fff",
                  mb: 1,
                }}
              >
                Welcome to I-Portal
              </Typography>

              {/* Identifier */}
              <TextField
                fullWidth
                type="text"
                label="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                sx={{
                  "& .MuiInputBase-input": { color: "#fff" },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.35)" },
                    "&.Mui-focused fieldset": { borderColor: "#9b8cff" },
                  },
                }}
                disabled={loading}
              />

              {/* Password */}
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                sx={{
                  "& .MuiInputBase-input": { color: "#fff" },
                  "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.7)" },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    "& fieldset": { borderColor: "rgba(255,255,255,0.15)" },
                    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.35)" },
                    "&.Mui-focused fieldset": { borderColor: "#9b8cff" },
                  },
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        sx={{ color: "rgba(255,255,255,0.8)" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.4,
                  fontWeight: 600,
                  borderRadius: 2,
                  bgcolor: "#7C57F2",
                  "&:hover": { bgcolor: "#6b49e6" },
                }}
              >
                {loading ? "Logging in…" : "LOGIN"}
              </Button>

              {/* <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mt: 1,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                <Typography variant="body2">For LDAP users</Typography>

                <Button
                  component={RouterLink}
                  to="/ldap-login"
                  variant="text"
                  disableRipple
                  sx={{
                    p: 0,
                    minWidth: "auto",
                    textTransform: "none",
                    color: "#FF8A00",
                    borderBottom: "2px solid #FF8A00",
                    borderRadius: 0,
                    lineHeight: 1.1,
                    "&:hover": { bgcolor: "transparent" },
                  }}
                >
                  click here to login
                </Button>
              </Box> */}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;

