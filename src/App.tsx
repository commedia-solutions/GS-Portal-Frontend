// //p3//
// // src/App.tsx
// import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
// import type { ReactNode } from "react";

// // 🔑 read token from the same place as the API client
// import { getAuthToken } from "./api/http";

// // Auth
// import LoginPage from "./pages/LoginPage";
// import LDAPLogin from "./pages/ldap_login";

// // Main
// import DashboardPage from "./pages/DashboardPage";
// import Documents from "./pages/Documents";

// // Lists
// import SatellitesList from "./pages/List_pages/Satellites_list";
// import LicensesList from "./pages/List_pages/Licenses_list";
// import PassesList from "./pages/List_pages/Passes_list";

// // Add-data pages
// import AddSatellites from "./pages/Add_data_pages/Add_Satellites";
// import AddLicenses from "./pages/Add_data_pages/Add_Licenses";
// import AddPasses from "./pages/Add_data_pages/Add_Passes";

// // Other pages
// import GSoperations from "./pages/GS_&_operations";
// import Userprofile from "./pages/User_profile";
// import Operations from "./pages/Operations";
// import UserLogs from "./pages/Logs/User_logs";
// import Notifications from "./pages/Norifications/Notifications";
// import IAM from "./pages/IAM/IAM";

// // NEW: Requests & Issues pages
// import RequestsPage from "./pages/Requests";
// import IssuesPage from "./pages/Issues";

// /* ---------- Guard that matches the API client's token source ---------- */
// function RequireAuth() {
//   // in-memory token first; fall back to legacy keys just in case
//   const token =
//     getAuthToken() ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token");

//   return token ? <Outlet /> : <Navigate to="/" replace />;
// }

// export default function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public */}
//         <Route path="/" element={<LoginPage />} />
//         <Route path="/ldap-login" element={<LDAPLogin />} />

//         {/* Protected block */}
//         <Route element={<RequireAuth />}>
//           <Route path="/dashboard" element={<DashboardPage />} />
//           <Route path="/documents" element={<Documents />} />

//           {/* Lists */}
//           <Route path="/satellites" element={<SatellitesList />} />
//           <Route path="/licenses" element={<LicensesList />} />
//           <Route path="/passes" element={<PassesList />} />

//           {/* Add-data */}
//           <Route path="/add/satellite" element={<AddSatellites />} />
//           <Route path="/add/license" element={<AddLicenses />} />
//           <Route path="/add/pass" element={<AddPasses />} />

//           {/* Other */}
//           <Route path="/Gsoperations" element={<GSoperations />} />
//           <Route path="/userprofile" element={<Userprofile />} />
//           <Route path="/Operations" element={<Operations />} />
//           <Route path="/logs" element={<UserLogs />} />
//           <Route path="/notifications" element={<Notifications />} />
//           <Route path="/iam" element={<IAM />} />

//           {/* NEW routes */}
//           <Route path="/requests" element={<RequestsPage />} />
//           <Route path="/issues" element={<IssuesPage />} />
//         </Route>

//         {/* Fallback */}
//         <Route path="*" element={<Navigate to="/dashboard" replace />} />
//       </Routes>
//     </Router>
//   );
// }



/// Access management code //

// // src/App.tsx
// import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";

// // 🔑 read token from the same place as the API client
// import { getAuthToken } from "./api/http";

// // Auth
// import LoginPage from "./pages/LoginPage";
// import LDAPLogin from "./pages/ldap_login";

// // Main
// import DashboardPage from "./pages/DashboardPage";
// import Documents from "./pages/Documents";

// // Lists
// import SatellitesList from "./pages/List_pages/Satellites_list";
// import LicensesList from "./pages/List_pages/Licenses_list";
// import PassesList from "./pages/List_pages/Passes_list";

// // Add-data pages
// import AddSatellites from "./pages/Add_data_pages/Add_Satellites";
// import AddLicenses from "./pages/Add_data_pages/Add_Licenses";
// import AddPasses from "./pages/Add_data_pages/Add_Passes";

// // Other pages
// import GSoperations from "./pages/GS_&_operations";
// import Userprofile from "./pages/User_profile";
// import Operations from "./pages/Operations";
// import UserLogs from "./pages/Logs/User_logs";
// import Notifications from "./pages/Norifications/Notifications";
// import IAM from "./pages/IAM/IAM";

// // NEW: Requests & Issues pages
// import RequestsPage from "./pages/Requests";
// import IssuesPage from "./pages/Issues";

// // RBAC helpers
// import { AuthProvider, RequirePermission, PERMISSION } from "./auth";

// /* ---------- Guard that matches the API client's token source ---------- */
// function RequireAuth() {
//   const token =
//     getAuthToken() ||
//     localStorage.getItem("token") ||
//     sessionStorage.getItem("token");

//   return token ? <Outlet /> : <Navigate to="/" replace />;
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           {/* Public */}
//           <Route path="/" element={<LoginPage />} />
//           <Route path="/ldap-login" element={<LDAPLogin />} />

//           {/* Protected block */}
//           <Route element={<RequireAuth />}>
//             <Route path="/dashboard" element={<DashboardPage />} />
//             <Route path="/documents" element={<Documents />} />

//             {/* Lists */}
//             <Route path="/satellites" element={<SatellitesList />} />
//             <Route path="/licenses" element={<LicensesList />} />
//             <Route path="/passes" element={<PassesList />} />

//             {/* Add-data (permission gated) */}
//             <Route
//               path="/add/satellite"
//               element={
//                 <RequirePermission allOf={[PERMISSION.AddSatellite]}>
//                   <AddSatellites />
//                 </RequirePermission>
//               }
//             />
//             <Route
//               path="/add/license"
//               element={
//                 <RequirePermission allOf={[PERMISSION.AddLicense]}>
//                   <AddLicenses />
//                 </RequirePermission>
//               }
//             />
//             <Route
//               path="/add/pass"
//               element={
//                 <RequirePermission allOf={[PERMISSION.AddPass]}>
//                   <AddPasses />
//                 </RequirePermission>
//               }
//             />

//             {/* Other */}
//             <Route
//               path="/Gsoperations"
//               element={
//                 <RequirePermission allOf={[PERMISSION.ViewGSOps]}>
//                   <GSoperations />
//                 </RequirePermission>
//               }
//             />
//             <Route path="/userprofile" element={<Userprofile />} />
//             <Route path="/Operations" element={<Operations />} />
//             <Route path="/logs" element={<UserLogs />} />
//             <Route path="/notifications" element={<Notifications />} />

//             {/* IAM – Admin only */}
//             <Route
//               path="/iam"
//               element={
//                 <RequirePermission allOf={[PERMISSION.ManageUsers]}>
//                   <IAM />
//                 </RequirePermission>
//               }
//             />

//             {/* NEW routes */}
//             <Route path="/requests" element={<RequestsPage />} />
//             <Route path="/issues" element={<IssuesPage />} />
//           </Route>

//           {/* Fallback */}
//           <Route path="*" element={<Navigate to="/dashboard" replace />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }


// p2//
// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { getAuthToken } from "./api/http";

// Auth
import LoginPage from "./pages/LoginPage";
import LDAPLogin from "./pages/ldap_login";

// Main
import DashboardPage from "./pages/DashboardPage";
import Documents from "./pages/Documents";

// Lists
import SatellitesList from "./pages/List_pages/Satellites_list";
import LicensesList from "./pages/List_pages/Licenses_list";
import PassesList from "./pages/List_pages/Passes_list";

// Add-data pages
import AddSatellites from "./pages/Add_data_pages/Add_Satellites";
import AddLicenses from "./pages/Add_data_pages/Add_Licenses";
import AddPasses from "./pages/Add_data_pages/Add_Passes";

// Other pages
import GSoperations from "./pages/GS_&_operations";
import Userprofile from "./pages/User_profile";
import Operations from "./pages/Operations";
import UserLogs from "./pages/Logs/User_logs";
import Notifications from "./pages/Norifications/Notifications";
import IAM from "./pages/IAM/IAM";

// NEW: Requests & Issues pages
import RequestsPage from "./pages/Requests";
import IssuesPage from "./pages/Issues";

// RBAC helpers
import { AuthProvider, RequirePermission, PERMISSION } from "./auth";

function RequireAuth() {
  // Prefer the single canonical key; fall back to in-memory getter
  const token =
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    getAuthToken();

  return token ? <Outlet /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/ldap-login" element={<LDAPLogin />} />

          {/* Protected block */}
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<Documents />} />

            {/* Lists */}
            <Route path="/satellites" element={<SatellitesList />} />
            <Route path="/licenses" element={<LicensesList />} />
            <Route path="/passes" element={<PassesList />} />

            {/* Add-data (permission gated) */}
            <Route
              path="/add/satellite"
              element={
                <RequirePermission allOf={[PERMISSION.AddSatellite]}>
                  <AddSatellites />
                </RequirePermission>
              }
            />
            <Route
              path="/add/license"
              element={
                <RequirePermission allOf={[PERMISSION.AddLicense]}>
                  <AddLicenses />
                </RequirePermission>
              }
            />
            <Route
              path="/add/pass"
              element={
                <RequirePermission allOf={[PERMISSION.AddPass]}>
                  <AddPasses />
                </RequirePermission>
              }
            />

            {/* Other */}
            <Route
              path="/Gsoperations"
              element={
                <RequirePermission allOf={[PERMISSION.ViewGSOps]}>
                  <GSoperations />
                </RequirePermission>
              }
            />
            <Route path="/userprofile" element={<Userprofile />} />
            <Route path="/Operations" element={<Operations />} />
            <Route path="/logs" element={<UserLogs />} />
            <Route path="/notifications" element={<Notifications />} />

            {/* IAM – Admin only */}
            <Route
              path="/iam"
              element={
                <RequirePermission allOf={[PERMISSION.ManageUsers]}>
                  <IAM />
                </RequirePermission>
              }
            />

            {/* NEW routes */}
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/issues" element={<IssuesPage />} />

            {/* ⛑️ Fallback now INSIDE the protected block */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
