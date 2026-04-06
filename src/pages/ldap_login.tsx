// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   TextField,
//   Button,
//   Typography,
//   InputAdornment,
//   IconButton,
// } from "@mui/material";
// import Visibility from "@mui/icons-material/Visibility";
// import VisibilityOff from "@mui/icons-material/VisibilityOff";
// import { Link as RouterLink } from "react-router-dom";
// import { useNavigate } from "react-router-dom";


// import isroLogo from "../assets/isro_logo.png";
// import imgLogin from "../assets/space3.png";
// import imgSpace1 from "../assets/space1.jpg";
// import imgSpace2 from "../assets/space2.jpg";

// const LDAPLogin: React.FC = () => {
//   // left-side carousel
//   const slides = [imgLogin, imgSpace1, imgSpace2];
//   const [index, setIndex] = useState(0);
//   const [showPassword, setShowPassword] = useState(false);

//   useEffect(() => {
//     const id = setInterval(() => {
//       setIndex((i) => (i + 1) % slides.length);
//     }, 3000);
//     return () => clearInterval(id);
//   }, [slides.length]);

//     const navigate = useNavigate();

//   const handleLDAPLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     // TODO: real LDAP auth later
//     navigate("/dashboard");
//   };

//   return (
//     // MAIN PAGE
//     <Box
//       sx={{
//         position: "fixed",
//         inset: 0,
//         width: "100vw",
//         height: "100vh",
//         bgcolor: "#1c1a1fff",
//         overflow: "hidden",
//       }}
//     >
//       {/* INNER CONTAINER */}
//       <Box
//         sx={{
//           position: "absolute",
//           inset: { xs: 10, md: 16 },
//           borderRadius: 3,
//         }}
//       >
//         {/* ROW: left carousel, right form */}
//         <Box sx={{ height: "100%", display: "flex", gap: { xs: 2, md: 3 } }}>
//           {/* LEFT: CAROUSEL */}
//           <Box
//             sx={{
//               flexBasis: { xs: "100%", md: "50%" },
//               flexGrow: 0,
//               flexShrink: 0,
//               position: "relative",
//               borderRadius: 3,
//               overflow: "hidden",
//               bgcolor: "#000",
//             }}
//           >
//             {/* ISRO logo */}
//             <Box
//               component="img"
//               src={isroLogo}
//               alt="ISRO"
//               sx={{
//                 position: "absolute",
//                 top: 14,
//                 left: 18,
//                 height: 70,
//                 objectFit: "contain",
//                 zIndex: 3,
//                 userSelect: "none",
//                 pointerEvents: "none",
//                 filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.6))",
//               }}
//             />
//             {/* Slides */}
//             {slides.map((src, i) => (
//               <Box
//                 key={i}
//                 sx={{
//                   position: "absolute",
//                   inset: 0,
//                   backgroundImage: `url(${src})`,
//                   backgroundSize: "cover",
//                   backgroundPosition: "center",
//                   opacity: i === index ? 1 : 0,
//                   transition: "opacity 600ms ease",
//                 }}
//               />
//             ))}
//             {/* Dots (— — —) */}
//             <Box
//               sx={{
//                 position: "absolute",
//                 bottom: 18,
//                 left: "50%",
//                 transform: "translateX(-50%)",
//                 display: "flex",
//                 gap: 1.5,
//               }}
//             >
//               {slides.map((_, i) => (
//                 <Box
//                   key={i}
//                   onClick={() => setIndex(i)}
//                   sx={{
//                     width: 26,
//                     height: 6,
//                     borderRadius: 999,
//                     bgcolor:
//                       i === index
//                         ? "rgba(255,255,255,1)"
//                         : "rgba(255,255,255,0.35)",
//                     cursor: "pointer",
//                     transition: "background-color 200ms ease",
//                   }}
//                 />
//               ))}
//             </Box>
//           </Box>

//           {/* RIGHT: LDAP FORM */}
//           <Box
//             sx={{
//               flex: 1,
//               borderRadius: 3,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Box
//               component="form"
//               onSubmit={handleLDAPLogin}
//               sx={{
//                 width: { xs: "92%", sm: "80%", md: "70%" },
//                 maxWidth: 520,
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 2.5,
//               }}
//             >
//               <Typography
//                 variant="h3"
//                 sx={{
//                   fontSize: { xs: 28, md: 40 },
//                   fontWeight: 700,
//                   color: "#fff",
//                   mb: 1,
//                 }}
//               >
//                 LDAP Login
//               </Typography>

//               {/* LDAP Username */}
//               <TextField
//                 fullWidth
//                 label="LDAP Username / Email"
//                 autoComplete="username"
//                 sx={{
//                   "& .MuiInputBase-input": { color: "#fff" },
//                   "& .MuiInputLabel-root": {
//                     color: "rgba(255,255,255,0.7)",
//                   },
//                   "& .MuiOutlinedInput-root": {
//                     bgcolor: "rgba(255,255,255,0.06)",
//                     borderRadius: 2,
//                     "& fieldset": {
//                       borderColor: "rgba(255,255,255,0.15)",
//                     },
//                     "&:hover fieldset": {
//                       borderColor: "rgba(255,255,255,0.35)",
//                     },
//                     "&.Mui-focused fieldset": {
//                       borderColor: "#9b8cff",
//                     },
//                   },
//                 }}
//               />

//               {/* Password with toggle */}
//               <TextField
//                 fullWidth
//                 type={showPassword ? "text" : "password"}
//                 label="Password"
//                 autoComplete="current-password"
//                 sx={{
//                   "& .MuiInputBase-input": { color: "#fff" },
//                   "& .MuiInputLabel-root": {
//                     color: "rgba(255,255,255,0.7)",
//                   },
//                   "& .MuiOutlinedInput-root": {
//                     bgcolor: "rgba(255,255,255,0.06)",
//                     borderRadius: 2,
//                     "& fieldset": {
//                       borderColor: "rgba(255,255,255,0.15)",
//                     },
//                     "&:hover fieldset": {
//                       borderColor: "rgba(255,255,255,0.35)",
//                     },
//                     "&.Mui-focused fieldset": {
//                       borderColor: "#9b8cff",
//                     },
//                   },
//                 }}
//                 InputProps={{
//                   endAdornment: (
//                     <InputAdornment position="end">
//                       <IconButton
//                         onClick={() => setShowPassword((s) => !s)}
//                         edge="end"
//                         aria-label={showPassword ? "Hide password" : "Show password"}
//                         sx={{ color: "rgba(255,255,255,0.8)" }}
//                       >
//                         {showPassword ? <VisibilityOff /> : <Visibility />}
//                       </IconButton>
//                     </InputAdornment>
//                   ),
//                 }}
//               />

//               {/* Login button */}
//               <Button
//                 type="submit"
//                 variant="contained"
//                 fullWidth
//                 sx={{
//                   mt: 1,
//                   py: 1.4,
//                   fontWeight: 600,
//                   borderRadius: 2,
//                   bgcolor: "#7C57F2",
//                   "&:hover": { bgcolor: "#6b49e6" },
//                 }}
//               >
//                 Login with LDAP
//               </Button>

//               {/* Back to regular login */}
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   gap: 1,
//                   mt: 1,
//                   color: "rgba(255,255,255,0.75)",
//                 }}
//               >
//                 <Typography variant="body2">Prefer regular login?</Typography>
//                 <Button
//                   component={RouterLink}
//                   to="/"
//                   variant="text"
//                   disableRipple
//                   sx={{
//                     p: 0,
//                     minWidth: "auto",
//                     textTransform: "none",
//                     color: "#FF8A00",
//                     borderBottom: "2px solid #FF8A00",
//                     borderRadius: 0,
//                     lineHeight: 1.1,
//                     "&:hover": { bgcolor: "transparent" },
//                   }}
//                 >
//                   go back
//                 </Button>
//               </Box>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default LDAPLogin;

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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import isroLogo from "../assets/isro_logo.png";
import imgLogin from "../assets/space3.png";
import imgSpace1 from "../assets/space1.jpg";
import imgSpace2 from "../assets/space2.jpg";

// Use VITE_API_BASE from .env, fallback to localhost
const API_BASE =
  (import.meta as any)?.env?.VITE_API_BASE || "http://localhost:4000";

const TOAST_OPTS = { position: "top-right" as const, autoClose: 2500 };

type AccessType = "Admin" | "User" | "Guest";

type AuthUser = {
  id: number;
  user_type: "local" | "ldap";
  username: string;
  email: string;
  full_name: string;
  contact_no?: string | null;
  ldap_id?: string | null;
  designation?: string | null;
  status: "active" | "disabled";
  profile_photo_path?: string | null;
  created_at: string;
  updated_at: string;
};

type MyRolesResponse = {
  global: Array<{ role_id: number; role_name: string; access_type: AccessType }>;
  entity: Array<{
    entity_id: number;
    entity_name: string;
    role_id: number;
    role_name: string;
    access_type: AccessType;
  }>;
};

const LDAPLogin: React.FC = () => {
  // left-side carousel
  const slides = [imgLogin, imgSpace1, imgSpace2];
  const [index, setIndex] = useState(0);

  // form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 3000);
    return () => clearInterval(id);
  }, [slides.length]);

  const navigate = useNavigate();

  // If a session exists already, try to hydrate + redirect
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const meRes = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meRes.ok) throw new Error("Expired session");
        const user: AuthUser = await meRes.json();

        const roleRes = await fetch(`${API_BASE}/api/iam/my-roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (roleRes.ok) {
          const roles: MyRolesResponse = await roleRes.json();
          sessionStorage.setItem("roles", JSON.stringify(roles));
        }

        sessionStorage.setItem("user", JSON.stringify(user));
        navigate("/pass-list", { replace: true });
      } catch {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("roles");
      }
    })();
  }, [navigate]);

  const handleLDAPLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Username and password are required", TOAST_OPTS);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login/ldap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // backend expects { username, password } for LDAP login
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg =
          data?.error ||
          data?.message ||
          (res.status === 401
            ? "Invalid LDAP credentials"
            : res.status === 404
            ? "LDAP user not found"
            : `Login failed (HTTP ${res.status})`);
        toast.error(msg, TOAST_OPTS);
        return;
      }

      const { token, user } = data as { token: string; user: AuthUser };
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      try {
        const roleRes = await fetch(`${API_BASE}/api/iam/my-roles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (roleRes.ok) {
          const roles: MyRolesResponse = await roleRes.json();
          sessionStorage.setItem("roles", JSON.stringify(roles));
        }
      } catch {
        /* ignore */
      }

      toast.success("LDAP login successful! Redirecting…", TOAST_OPTS);
      setTimeout(() => navigate("/pass-list"), 600);
    } catch (err: any) {
      toast.error(err?.message || "Network error during LDAP login", TOAST_OPTS);
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
          {/* LEFT: CAROUSEL */}
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
            {/* ISRO logo */}
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
            {/* Slides */}
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
            {/* Dots */}
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

          {/* RIGHT: LDAP FORM */}
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
              onSubmit={handleLDAPLogin}
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
                LDAP Login
              </Typography>

              <TextField
                fullWidth
                label="LDAP Username / Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                sx={{
                  "& .MuiInputBase-input": { color: "#fff" },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255,255,255,0.7)",
                  },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.35)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#9b8cff",
                    },
                  },
                }}
                disabled={loading}
              />

              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                sx={{
                  "& .MuiInputBase-input": { color: "#fff" },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255,255,255,0.7)",
                  },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.06)",
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.35)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#9b8cff",
                    },
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
                {loading ? "Logging in…" : "Login with LDAP"}
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  mt: 1,
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                <Typography variant="body2">Prefer regular login?</Typography>
                <Button
                  component={RouterLink}
                  to="/"
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
                  go back
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LDAPLogin;
