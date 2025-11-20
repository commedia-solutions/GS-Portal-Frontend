// src/i18n.tsx
import * as React from "react";

/** ---- 1) DICTIONARY ----
 * Add keys only once here. Use *English* as keys across the codebase.
 */
const dict = {
  en: {
    // TopNav / common
    "Dashboard": "Dashboard",
    "Dark Mode": "Dark Mode",
    "Light Mode": "Light Mode",
    "Language": "Language",
    "English": "English",
    "Hindi": "हिन्दी",
    "Add Passes +": "Add Passes +",
    "Add License +": "Add License +",
    "Add Satellites +": "Add Satellites +",
    "GS & Operations +": "GS & Operations +",
    "User & Role Management": "User & Role Management",
    "Settings": "Settings",

    // Common table/controls
    "Sr No": "Sr No",
    "Sr": "Sr",
    "Action": "Action",
    "Download": "Download",
    "Remarks": "Remarks",
    "Search…": "Search…",
    "Loading…": "Loading…",
    "Select Type": "Select Type",
    "Update": "Update",
    "Add": "Add",
    "Added By": "Added By",
    "No rows to show yet.": "No rows to show yet.",
    "No passes found.": "No passes found.",
    "Rows per page:": "Rows per page:",
    "No results": "No results",
    "Print": "Print",

    // Documents
    "Documents": "Documents",
    "Passes Schedule": "Passes Schedule",
    "Upload Documents": "Upload Documents",
    "Upload Passes Schedule": "Upload Passes Schedule",
    "Select File": "Select File",
    "Upload": "Upload",
    "Document": "Document",
    "Doc Type": "Doc Type",

    "License report": "License report",
    "Satellite report": "Satellite report",
    "Passes report": "Passes report",
    "Project plan": "Project plan",
    "Flow chart": "Flow chart",
    "Design Document": "Design Document",
    "User manual": "User manual",
    "Other": "Other",

    // Operations
    "Operations": "Operations",
    "Operation Requesters": "Operation Requesters",
    "Operation Supporters": "Operation Supporters",
    "Operation": "Operation",
    "Operation Requester": "Operation Requester",
    "Operation Supporter": "Operation Supporter",
    "Operation name": "Operation name",
    "Operation Requester name": "Operation Requester name",
    "Supporter name": "Supporter name",

    // Dashboard / Passes columns
    "Timeline": "Timeline",
    "Status": "Status",
    "Date": "Date",
    "Date & Time": "Date & Time",
    "User": "User",
    "Module": "Module",
    "Station": "Station",
    "Stations": "Stations",
    "Orbit": "Orbit",
    "Max (El)°": "Max (El)°",
    "AOS / LOS (UT)": "AOS / LOS (UT)",
    "Ops requests": "Ops requests",
    "Ops requester / supporter": "Ops requester / supporter",
    "Clear": "Clear",
    "Satellite": "Satellite",
    "Satellites": "Satellites",
    "Schedule": "Schedule",
    "Pass": "Pass",

    // Passes toolbar / export
    "Filter": "Filter",
    "Export": "Export",
    "Export All": "Export All",
    "From date": "From date",
    "To date": "To date",
    "Pick both From and To dates": "Pick both From and To dates",
    "Export failed": "Export failed",
    "MM/DD/YY": "MM/DD/YY",

    // Option values (logic stays in English; UI shows these)
    "All": "All",
    "Today": "Today",
    "Tomorrow": "Tomorrow",
    "Week": "Week",
    "Month": "Month",
    "Year": "Year",
    "Completed": "Completed",
    "Pending": "Pending",
    "Failed": "Failed",
    "Canceled": "Canceled",
    "Scheduled": "Scheduled",
    "Approved": "Approved",
    "Rejected": "Rejected",
    "Expired": "Expired",

    // Satellites list
    "Satellite ID": "Satellite ID",
    "Satellite Name": "Satellite Name",
    "Norad ID": "Norad ID",
    "ITU Name": "ITU Name",
    "Polarization": "Polarization",
    "No satellites found.": "No satellites found.",

    // Licenses list
    "Applied Date": "Applied Date",
    "Receipt Date": "Receipt Date",
    "Validity": "Validity",
    "Band": "Band",
    "Downlink": "Downlink",
    "Uplink": "Uplink",
    "No licenses found.": "No licenses found.",

    // Logs / misc
    "No logs.": "No logs.",

    // Requests page (tabs, scopes)
    "New Request": "New Request",
    "All Requests": "All Requests",
    "Inbox": "Inbox",
    "Sent": "Sent",

    // Requests form
    "Request Ticket No": "Request Ticket No",
    "Req To": "Req To",
    "Req Category": "Req Category",
    "Priority": "Priority",
    "Req Additional Info": "Req Additional Info",
    "Write request details for Admin": "Write request details for Admin",
    "Submit": "Submit",
    "Submitting…": "Submitting…",
    "Reset": "Reset",
    "Select recipient": "Select recipient",
    "Select category": "Select category",

    // Requests list columns
    "Ticket No": "Ticket No",
    "Category": "Category",
    "Description": "Description",
    "Created At": "Created At",

    // Update dialog
    "Update Request": "Update Request",
    "Requester": "Requester",
    "Categories": "Categories",
    "Remarks (note for this update)": "Remarks (note for this update)",
    "Saving…": "Saving…",

    // Request statuses (display text only)
    "Submitted": "Submitted",
    "Draft": "Draft",
    "In Review": "In Review",
    "Done": "Done",
    "Cancelled": "Cancelled",
    "New": "New",
    "Triaged": "Triaged",
    "In Progress": "In Progress",
    "Resolved": "Resolved",
    "Closed": "Closed",
    "Reopened": "Reopened",
    "On Hold": "On Hold",
    "Need Info": "Need Info",

    // Empty / misc
    "No requests yet.": "No requests yet.",
    "Update failed": "Update failed",

    // CAPTCHA & misc messages
    "Verify you’re human": "Verify you’re human",
    "Type the letters": "Type the letters",
    "Refresh": "Refresh",
    "Cancel": "Cancel",
    "Verify": "Verify",
    "Incorrect code. Try again.": "Incorrect code. Try again.",
    "Download failed": "Download failed",
    "Only admins can upload the passes schedule.": "Only admins can upload the passes schedule.",

    /* ===== Issues page ===== */
    "Report Issue": "Report Issue",
    "All Issues": "All Issues",
    "Report Issue Ticket No": "Report Issue Ticket No",
    "Report To": "Report To",
    "Report Category": "Report Category",
    "Issue Additional Info": "Issue Additional Info",
    "Describe the problem, steps to reproduce, expected vs actual...":
      "Describe the problem, steps to reproduce, expected vs actual...",
    "Attachments": "Attachments",
    "Select Files": "Select Files",
    "Download all attachments": "Download all attachments",
    "No issues yet.": "No issues yet.",
    "Update Issue": "Update Issue",
    "Files": "Files",

    // Alerts/errors on Issues page
    "Please select Report To.": "Please select Report To.",
    "Please select at least one category.": "Please select at least one category.",
    "Failed to submit issue.": "Failed to submit issue.",
    "Failed to open ticket.": "Failed to open ticket.",
    "No attachments found for this ticket.": "No attachments found for this ticket.",

    /* ===== Right Panel ===== */
    "Today's Passes": "Today's Passes",
    "Recent Requests": "Recent Requests",
    "View all >": "View all >",
    "No active requests.": "No active requests.",

    /* ===== Add Passes (Bulk + Form) ===== */
    "Bulk Passes Upload": "Bulk Passes Upload",
    "Step 1: Download the given template": "Step 1: Download the given template",
    "Download Template": "Download Template",
    "Step 2: Fill it & Upload": "Step 2: Fill it & Upload",
    "Uploading...": "Uploading...",
    "Uploading… this may take a while for large files.": "Uploading… this may take a while for large files.",
    "Add Pass Details": "Add Pass Details",
    "Pass Req No *": "Pass Req No *",
    "Date(UT) *": "Date(UT) *",
    "Satellite Name *": "Satellite Name *",
    "Select Satellite": "Select Satellite",
    "Supporting Station *": "Supporting Station *",
    "Select Station": "Select Station",
    "Orbit No *": "Orbit No *",
    "Enter Orbit No": "Enter Orbit No",
    "Max (El) Deg *": "Max (El) Deg *",
    "Enter Max El (Deg)": "Enter Max El (Deg)",
    "AOS (UT) *": "AOS (UT) *",
    "LOS (UT) *": "LOS (UT) *",
    "Select Operations": "Select Operations",
    "Operations Requester": "Operations Requester",
    "Select Requester": "Select Requester",
    "TTL Service provider": "TTL Service provider",
    "Select Supporter": "Select Supporter",
    "Pass Type *": "Pass Type *",
    "Select Pass Type": "Select Pass Type",
    "Normal": "Normal",
    "Emergency": "Emergency",
    "Schedule Status *": "Schedule Status *",
    "Pass Status": "Pass Status",
    "Enter remarks": "Enter remarks",
    "Saving...": "Saving...",
    "Save": "Save",

    // Add Passes alerts/errors
    "Please select a CSV file first.": "Please select a CSV file first.",
    "Only .csv files are supported.": "Only .csv files are supported.",
    "Bulk upload complete.": "Bulk upload complete.",
    "Bulk upload failed.": "Bulk upload failed.",
    "Please fill all required fields.": "Please fill all required fields.",
    "Pass Req No must be unique.": "Pass Req No must be unique.",
    "Failed to save pass.": "Failed to save pass.",
    "Pass saved successfully!": "Pass saved successfully!",
    "Network/API error while saving.": "Network/API error while saving.",

    /* ===== Add License (Form + Bands) ===== */
    "Add License Details": "Add License Details",
    "License Req No *": "License Req No *",
    "Station *": "Station *",
    "Validity (Expiry)": "Validity (Expiry)",
    "Status *": "Status *",
    "Bands": "Bands",
    "Select Band": "Select Band",
    "Enter Uplink": "Enter Uplink",
    "Enter Downlink": "Enter Downlink",
    "remove row": "remove row",

    // Band options (shown in UI)
    "S-Band": "S-Band",
    "X-Band": "X-Band",
    "Ka-Band": "Ka-Band",
    "UHF": "UHF",
    "VHF": "VHF",

    // Add License alerts/toasts
    "Please fill Satellite, Station and Applied Date.": "Please fill Satellite, Station and Applied Date.",
    "License saved successfully.": "License saved successfully.",
    "Failed to save license.": "Failed to save license.",

    /* ===== Add Satellites ===== */
    "Add Satellite Details": "Add Satellite Details",
    "Satellite ID *": "Satellite ID *",
    "Enter Satellite ID": "Enter Satellite ID",
    "Enter Satellite Name": "Enter Satellite Name",
    "Enter Norad ID": "Enter Norad ID",
    "Enter ITU Name": "Enter ITU Name",
    "Polarization *": "Polarization *",
    "Select Polarization": "Select Polarization",
    // Alerts
    "Please fill Satellite ID, Satellite Name, Station and Polarization.": "Please fill Satellite ID, Satellite Name, Station and Polarization.",
    "Satellite saved successfully.": "Satellite saved successfully.",
    "Failed to save satellite.": "Failed to save satellite.",

    /* ===== NEW: GS & Antennas page ===== */
    "Ground Stations": "Ground Stations",
    "Satellite Polarization": "Satellite Polarization",
    "Antennas": "Antennas",

    "Add Ground Station": "Add Ground Station",
    "View Ground Stations": "View Ground Stations",
    "Supporting Partner": "Supporting Partner",
    "Ground Station": "Ground Station",
    "Ground Station Name": "Ground Station Name",
    "Antenna": "Antenna",
    "Station Latitude": "Station Latitude",
    "Station Longitude": "Station Longitude",
    "Enter Supporting Partner": "Enter Supporting Partner",
    "Enter Ground Station Name": "Enter Ground Station Name",
    "Select Antenna": "Select Antenna",
    "e.g. 12.9716": "e.g. 12.9716",
    "e.g. 77.5946": "e.g. 77.5946",
    "Ground Station Details": "Ground Station Details",
    "No data": "No data",

    // Alerts (GS)
    "Please enter Supporting Partner and Ground Station Name.": "Please enter Supporting Partner and Ground Station Name.",
    "Ground Station added successfully ✅": "Ground Station added successfully ✅",
    "Failed to add Ground Station ❌": "Failed to add Ground Station ❌",
    "Ground Station updated ✅": "Ground Station updated ✅",
    "Failed to update ground station": "Failed to update ground station",
    "Ground Station deleted ✅": "Ground Station deleted ✅",
    "Failed to delete ground station": "Failed to delete ground station",

    // Operations quick-add bar labels
    "Add Operation Requester": "Add Operation Requester",
    "Add TTL Service Provider": "Add TTL Service Provider",
    "Operation Details": "Operation Details",
    "Satellite Polarization Details": "Satellite Polarization Details",

    // Alerts (Ops quick-add)
    "Operation added ✅": "Operation added ✅",
    "Failed to add operation ❌": "Failed to add operation ❌",
    "Operation requester added ✅": "Operation requester added ✅",
    "Failed to add requester ❌": "Failed to add requester ❌",
    "Operation supporter added ✅": "Operation supporter added ✅",
    "Failed to add supporter ❌": "Failed to add supporter ❌",

    // Polarization section
    "Add Satellite Polarization": "Add Satellite Polarization",

    // Alerts (Pol)
    "Satellite polarization added ✅": "Satellite polarization added ✅",
    "Failed to add polarization ❌": "Failed to add polarization ❌",
    "Polarization updated ✅": "Polarization updated ✅",
    "Failed to update polarization ❌": "Failed to update polarization ❌",
    "Polarization deleted ✅": "Polarization deleted ✅",
    "Failed to delete polarization ❌": "Failed to delete polarization ❌",

    // Antenna subpage
    "Add Antenna": "Add Antenna",
    "View Antennas": "View Antennas",
    "Antenna Type *": "Antenna Type *",
    "Antenna Size (m)": "Antenna Size (m)",
    "EIRP (dBW)": "EIRP (dBW)",
    "Transmit Polarization": "Transmit Polarization",
    "Antenna Travel Range": "Antenna Travel Range",
    "Tracking Velocity": "Tracking Velocity",
    "Tracking Acceleration": "Tracking Acceleration",
    "Tracking Modes": "Tracking Modes",
    "Enter type": "Enter type",
    "e.g. 3.7": "e.g. 3.7",
    "e.g. 52.5": "e.g. 52.5",
    "e.g. RHCP / LHCP / Linear": "e.g. RHCP / LHCP / Linear",
    "e.g. Az: ±180°, El: 0–90°": "e.g. Az: ±180°, El: 0–90°",
    "e.g. 20°/s": "e.g. 20°/s",
    "e.g. 100°/s²": "e.g. 100°/s²",
    "e.g. Program, TLE, Step-track": "e.g. Program, TLE, Step-track",

    // Bands / GT blocks
    "No bands added.": "No bands added.",
    "Receive G/T": "Receive G/T",
    "Enter G/T": "Enter G/T",
    "No G/T rows added.": "No G/T rows added.",
    "No": "No",
    "Type": "Type",
    "Size (m)": "Size (m)",
    "Tx Pol": "Tx Pol",
    "Travel Range": "Travel Range",
    "Track Vel": "Track Vel",
    "Track Acc": "Track Acc",
    "Track Modes": "Track Modes",
    "Bands / G/T": "Bands / G/T",
    "G/T": "G/T",

    // Alerts (Antenna CRUD)
    "Please enter Antenna Type.": "Please enter Antenna Type.",
    "Antenna added ✅": "Antenna added ✅",
    "Failed to add antenna ❌": "Failed to add antenna ❌",
    "Antenna updated ✅": "Antenna updated ✅",
    "Failed to update antenna ❌": "Failed to update antenna ❌",
    "Antenna deleted ✅": "Antenna deleted ✅",

    /* ===== IAM page ===== */
    "Users": "Users",
    "Entity": "Entity",
    "Role": "Role",
    "Assignment": "Assignment",
    "User Id": "User Id",
    "Full Name": "Full Name",
    "Email": "Email",
    "Add User": "Add User",
    "Add New Entity": "Add New Entity",
    "Entity name": "Entity name",
    "Entity Description": "Entity Description",
    "Add Role": "Add Role",
    "Role name": "Role name",
    "Role description": "Role description",
    "Admin": "Admin",
    "Guest": "Guest",
    "Already Assigned Users": "Already Assigned Users",
    "Assign New created User": "Assign New created User",
    "Role Name": "Role Name",
    "No users found.": "No users found.",
    "No data.": "No data.",
    "No assigned users.": "No assigned users.",
    "No unassigned users.": "No unassigned users.",
    "(global)": "(global)",
    "(disabled)": "(disabled)",
    "Enable": "Enable",
    "Disable": "Disable",
    "Failed to load users": "Failed to load users",
    "Failed to load organization": "Failed to load organization",
    "Failed to load roles": "Failed to load roles",
    "Failed to load assignments": "Failed to load assignments",
    "User created successfully": "User created successfully",
    "Entity created successfully": "Entity created successfully",
    "Failed to create entity": "Failed to create entity",
    "Role created successfully": "Role created successfully",
    "Failed to create role": "Failed to create role",
    "Assignment updated": "Assignment updated",
    "Failed to update assignment": "Failed to update assignment",
    "Entity updated": "Entity updated",
    "Entity deleted": "Entity deleted",
    "User enabled": "User enabled",
    "User disabled": "User disabled",
    "Failed to update role": "Failed to update role",
    "Failed to update user": "Failed to update user",
    "Role enabled successfully": "Role enabled successfully",
    "Role disabled successfully": "Role disabled successfully",

    //Operation page

    // In dict.en (add anywhere inside the "en" object)
"Requester updated ✅": "Requester updated ✅",
"Failed to update requester ❌": "Failed to update requester ❌",
"Requester deleted ✅": "Requester deleted ✅",
"Failed to delete requester ❌": "Failed to delete requester ❌",

"Operation updated ✅": "Operation updated ✅",
"Failed to update operation ❌": "Failed to update operation ❌",
"Operation deleted ✅": "Operation deleted ✅",
"Failed to delete operation ❌": "Failed to delete operation ❌",

"Supporter updated ✅": "Supporter updated ✅",
"Failed to update supporter ❌": "Failed to update supporter ❌",
"Supporter deleted ✅": "Supporter deleted ✅",
"Failed to delete supporter ❌": "Failed to delete supporter ❌",

// (Optional, only if you keep the generic alerts in code)
"Added successfully ✅": "Added successfully ✅",
"Failed to add ❌": "Failed to add ❌",

//sidebar


"Satellites List": "Satellites List",
"License List": "License List",
"Passes List": "Passes List",
"Logs": "Logs",
"Requests": "Requests",
"Logout": "Logout",
"Log out of I-Portal?": "Log out of I-Portal?",

// User Profile page (en)
"User Profile": "User Profile",
"Add User Details": "Add User Details",
"Change avatar": "Change avatar",
"User avatar": "User avatar",
"Adjust your avatar": "Adjust your avatar",
"Zoom": "Zoom",
"Contact No": "Contact No",
"LDAP DN": "LDAP DN",
"(optional)": "(optional)",
"Designation": "Designation",
"Save your profile changes?": "Save your profile changes?",
"Profile saved": "Profile saved",
"Failed to save profile": "Failed to save profile",
"Failed to load profile": "Failed to load profile",
"Missing token. Please log in again.": "Missing token. Please log in again.",


// PassSchedule / AWS panels
"AWS Contacts": "AWS Contacts",
"View Contacts": "View Contacts",
"Schedule Contacts": "Schedule Contacts",
"Update TLE": "Update TLE",
"AWS Contact": "AWS Contact",
"Contact Available": "Contact Available",
"No Contacts Found": "No Contacts Found",
"Contact Id": "Contact Id",
"Catalog number": "Catalog number",
"Start time (UTC)": "Start time (UTC)",
"End time (UTC)": "End time (UTC)",
"Max elevation (deg)": "Max elevation (deg)",
"Region": "Region",
"Satellite number": "Satellite number",
"Select satellite": "Select satellite",
"Ground station": "Ground station",
"Mission profile": "Mission profile",

"Any": "Any",

"Select Ground Station *": "Select Ground Station *",
"Select Region *": "Select Region *",

"Bulk schedule upload complete.": "Bulk schedule upload complete.",

"Only .csv or .txt files are supported.": "Only .csv or .txt files are supported.",

"Regions & Buckets": "Regions & Buckets",
"Bucket name": "Bucket name",
"No custom mappings yet. Add one above (optional).": "No custom mappings yet. Add one above (optional).",
"TLE uploaded.": "TLE uploaded.",
"TLE upload failed.": "TLE upload failed.",
"Select & Upload TLE (.txt / .tle / .json)": "Select & Upload TLE (.txt / .tle / .json)",
"Schedule contact": "Schedule contact",
"Cancel contact": "Cancel contact",
"Select at least one contact.": "Select at least one contact.",
"No valid rows selected.": "No valid rows selected.",
"AVAILABLE": "AVAILABLE",
"SCHEDULED": "SCHEDULED",
"COMPLETED": "COMPLETED",
"AWS_CANCELLED": "AWS_CANCELLED",
"CANCELLED": "CANCELLED",
"Select": "Select",
"selected": "selected",
"No selection": "No selection",

"AWS Operations": "AWS Operations",



  },

  hi: {
    // TopNav / common
    "Dashboard": "डैशबोर्ड",
    "Dark Mode": "डार्क मोड",
    "Light Mode": "लाइट मोड",
    "Language": "भाषा",
    "English": "English",
    "Hindi": "हिन्दी",
    "Add Passes +": "पास जोड़ें +",
    "Add License +": "लाइसेंस जोड़ें +",
    "Add Satellites +": "उपग्रह जोड़ें +",
    "GS & Operations +": "ग्राउंड स्टेशन व संचालन +",
    "User & Role Management": "उपयोगकर्ता व भूमिका प्रबंधन",
    "Settings": "सेटिंग्स",

    // Common table/controls
    "Sr No": "क्र.सं.",
    "Sr": "क्र.",
    "Action": "क्रिया",
    "Download": "डाउनलोड",
    "Remarks": "टिप्पणी",
    "Search…": "खोजें…",
    "Loading…": "लोड हो रहा है…",
    "Select Type": "प्रकार चुनें",
    "Update": "अपडेट",
    "Add": "जोड़ें",
    "Added By": "द्वारा जोड़ा गया",
    "No rows to show yet.": "अभी कोई पंक्ति उपलब्ध नहीं।",
    "No passes found.": "कोई पास नहीं मिला।",
    "Rows per page:": "प्रति पृष्ठ पंक्तियाँ:",
    "No results": "कोई परिणाम नहीं",
    "Print": "प्रिंट",

    // Documents
    "Documents": "दस्तावेज़",
    "Passes Schedule": "पास शेड्यूल",
    "Upload Documents": "दस्तावेज़ अपलोड करें",
    "Upload Passes Schedule": "पास शेड्यूल अपलोड करें",
    "Select File": "फ़ाइल चुनें",
    "Upload": "अपलोड",
    "Document": "दस्तावेज़",
    "Doc Type": "दस्तावेज़ प्रकार",

    "License report": "लाइसेंस रिपोर्ट",
    "Satellite report": "उपग्रह रिपोर्ट",
    "Passes report": "पासेस रिपोर्ट",
    "Project plan": "प्रोजेक्ट योजना",
    "Flow chart": "प्रवाह-चार्ट",
    "Design Document": "डिज़ाइन दस्तावेज़",
    "User manual": "उपयोगकर्ता पुस्तिका",
    "Other": "अन्य",

    // Operations
    "Operations": "ऑपरेशन",
    "Operation Requesters": "ऑपरेशन अनुरोधकर्ता",
    "Operation Supporters": "ऑपरेशन सहयोगी",
    "Operation": "ऑपरेशन",
    "Operation Requester": "ऑपरेशन अनुरोधकर्ता",
    "Operation Supporter": "ऑपरेशन सहयोगी",
    "Operation name": "ऑपरेशन का नाम",
    "Operation Requester name": "अनुरोधकर्ता का नाम",
    "Supporter name": "सहयोगी का नाम",

    // Dashboard / Passes columns
    "Timeline": "टाइमलाइन",
    "Status": "स्थिति",
    "Date": "तिथि",
    "Date & Time": "तिथि व समय",
    "User": "उपयोगकर्ता",
    "Module": "मॉड्यूल",
    "Station": "स्टेशन",
    "Stations": "स्टेशन",
    "Orbit": "कक्षा",
    "Max (El)°": "अधिकतम (El)°",
    "AOS / LOS (UT)": "AOS / LOS (UT)",
    "Ops requests": "ऑप्स अनुरोध",
    "Ops requester / supporter": "ऑप्स अनुरोधकर्ता / सहयोगी",
    "Clear": "साफ़ करें",
    "Satellite": "उपग्रह",
    "Satellites": "उपग्रह",
    "Schedule": "शेड्यूल",
    "Pass": "पास",

    // Passes toolbar / export
    "Filter": "फ़िल्टर",
    "Export": "एक्सपोर्ट",
    "Export All": "सभी एक्सपोर्ट करें",
    "From date": "प्रारंभ तिथि",
    "To date": "समाप्ति तिथि",
    "Pick both From and To dates": "कृपया प्रारंभ और समाप्ति तिथि चुनें",
    "Export failed": "एक्सपोर्ट विफल",
    "MM/DD/YY": "MM/DD/YY",

    // Option values
    "All": "सभी",
    "Today": "आज",
    "Tomorrow": "कल",
    "Week": "सप्ताह",
    "Month": "माह",
    "Year": "वर्ष",
    "Completed": "पूर्ण",
    "Pending": "लंबित",
    "Failed": "विफल",
    "Canceled": "रद्द",
    "Scheduled": "निर्धारित",
    "Approved": "स्वीकृत",
    "Rejected": "अस्वीकृत",
    "Expired": "समाप्त",

    // Satellites list
    "Satellite ID": "उपग्रह आईडी",
    "Satellite Name": "उपग्रह नाम",
    "Norad ID": "नॉरैड आईडी",
    "ITU Name": "आईटीयू नाम",
    "Polarization": "ध्रुवण",
    "No satellites found.": "कोई उपग्रह नहीं मिला।",

    // Licenses list
    "Applied Date": "आवेदन तिथि",
    "Receipt Date": "रसीद तिथि",
    "Validity": "वैधता",
    "Band": "बैंड",
    "Downlink": "डाउनलिंक",
    "Uplink": "अपलिंक",
    "No licenses found.": "कोई लाइसेंस नहीं मिला।",

    // Logs / misc
    "No logs.": "कोई लॉग नहीं।",

    // Requests page (tabs, scopes)
    "New Request": "नया अनुरोध",
    "All Requests": "सभी अनुरोध",
    "Inbox": "इनबॉक्स",
    "Sent": "भेजे गए",

    // Requests form
    "Request Ticket No": "अनुरोध टिकट संख्या",
    "Req To": "किसे अनुरोध",
    "Req Category": "अनुरोध श्रेणी",
    "Priority": "प्राथमिकता",
    "Req Additional Info": "अतिरिक्त जानकारी",
    "Write request details for Admin": "एडमिन के लिए विवरण लिखें",
    "Submit": "सबमिट",
    "Submitting…": "सबमिट हो रहा है…",
    "Reset": "रीसेट",
    "Select recipient": "प्राप्तकर्ता चुनें",
    "Select category": "श्रेणी चुनें",

    // Requests list columns
    "Ticket No": "टिकट संख्या",
    "Category": "श्रेणी",
    "Description": "विवरण",
    "Created At": "निर्माण तिथि",

    // Update dialog
    "Update Request": "अनुरोध अपडेट करें",
    "Requester": "अनुरोधकर्ता",
    "Categories": "श्रेणियाँ",
    "Remarks (note for this update)": "टिप्पणी (इस अपडेट के लिए)",
    "Saving…": "सहेजा जा रहा है…",

    // Request statuses
    "Submitted": "सबमिटेड",
    "Draft": "ड्राफ़्ट",
    "In Review": "समीक्षा में",
    "Done": "पूर्ण",
    "Cancelled": "रद्द",
    "New": "नया",
    "Triaged": "त्रियाज्ड",
    "In Progress": "प्रगति पर",
    "Resolved": "निपटाया गया",
    "Closed": "बंद",
    "Reopened": "पुनः खोला",
    "On Hold": "रुका हुआ",
    "Need Info": "जानकारी आवश्यक",

    // Empty / misc
    "No requests yet.": "अभी कोई अनुरोध नहीं।",
    "Update failed": "अपडेट विफल",

    // CAPTCHA & misc messages
    "Verify you’re human": "पुष्टि करें कि आप इंसान हैं",
    "Type the letters": "अक्षर दर्ज करें",
    "Refresh": "रिफ्रेश",
    "Cancel": "रद्द करें",
    "Verify": "सत्यापित करें",
    "Incorrect code. Try again.": "गलत कोड। दोबारा प्रयास करें।",
    "Download failed": "डाउनलोड विफल",
    "Only admins can upload the passes schedule.": "केवल एडमिन पास शेड्यूल अपलोड कर सकते हैं।",

    /* ===== Issues page ===== */
    "Report Issue": "समस्या दर्ज करें",
    "All Issues": "सभी समस्याएँ",
    "Report Issue Ticket No": "समस्या टिकट संख्या",
    "Report To": "किसे रिपोर्ट करें",
    "Report Category": "समस्या श्रेणी",
    "Issue Additional Info": "समस्या का अतिरिक्त विवरण",
    "Describe the problem, steps to reproduce, expected vs actual...":
      "समस्या का वर्णन करें, पुनरुत्पादन के चरण, अपेक्षित बनाम वास्तविक…",
    "Attachments": "संलग्नक",
    "Select Files": "फाइलें चुनें",
    "Download all attachments": "सभी संलग्नक डाउनलोड करें",
    "No issues yet.": "अभी कोई समस्या नहीं।",
    "Update Issue": "समस्या अपडेट करें",
    "Files": "फाइलें",

    // Alerts/errors on Issues page
    "Please select Report To.": "कृपया रिपोर्ट करने हेतु व्यक्ति चुनें।",
    "Please select at least one category.": "कृपया कम से कम एक श्रेणी चुनें।",
    "Failed to submit issue.": "समस्या सबमिट करने में विफल।",
    "Failed to open ticket.": "टिकट खोलने में विफल।",
    "No attachments found for this ticket.": "इस टिकट के लिए कोई संलग्नक नहीं मिला।",

    /* ===== Right Panel ===== */
    "Today's Passes": "आज के पास",
    "Recent Requests": "हाल के अनुरोध",
    "View all >": "सभी देखें >",
    "No active requests.": "कोई सक्रिय अनुरोध नहीं।",

    /* ===== Add Passes (Bulk + Form) ===== */
    "Bulk Passes Upload": "बल्क पास अपलोड",
    "Step 1: Download the given template": "चरण 1: दिए गए टेम्पलेट को डाउनलोड करें",
    "Download Template": "टेम्पलेट डाउनलोड करें",
    "Step 2: Fill it & Upload": "चरण 2: भरें और अपलोड करें",
    "Uploading...": "अपलोड हो रहा है...",
    "Uploading… this may take a while for large files.": "अपलोड हो रहा है… बड़ी फ़ाइलों में समय लग सकता है।",
    "Add Pass Details": "पास विवरण जोड़ें",
    "Pass Req No *": "पास रिक्वेस्ट नंबर *",
    "Date(UT) *": "तिथि (UT) *",
    "Satellite Name *": "उपग्रह नाम *",
    "Select Satellite": "उपग्रह चुनें",
    "Supporting Station *": "समर्थन स्टेशन *",
    "Select Station": "स्टेशन चुनें",
    "Orbit No *": "कक्षा संख्या *",
    "Enter Orbit No": "कक्षा संख्या दर्ज करें",
    "Max (El) Deg *": "अधिकतम (El) डिग्री *",
    "Enter Max El (Deg)": "अधिकतम El (डिग्री) दर्ज करें",
    "AOS (UT) *": "AOS (UT) *",
    "LOS (UT) *": "LOS (UT) *",
    "Select Operations": "ऑपरेशन्स चुनें",
    "Operations Requester": "ऑपरेशन अनुरोधकर्ता",
    "Select Requester": "अनुरोधकर्ता चुनें",
    "TTL Service provider": "टीटीएल सेवा प्रदाता",
    "Select Supporter": "सहयोगी चुनें",
    "Pass Type *": "पास प्रकार *",
    "Select Pass Type": "पास प्रकार चुनें",
    "Normal": "सामान्य",
    "Emergency": "आपातकालीन",
    "Schedule Status *": "शेड्यूल स्थिति *",
    "Pass Status": "पास स्थिति",
    "Enter remarks": "टिप्पणी दर्ज करें",
    "Saving...": "सेव हो रहा है...",
    "Save": "सेव करें",

    // Add Passes alerts/errors
    "Please select a CSV file first.": "कृपया पहले CSV फ़ाइल चुनें।",
    "Only .csv files are supported.": "केवल .csv फ़ाइलें समर्थित हैं।",
    "Bulk upload complete.": "बल्क अपलोड पूरा हुआ।",
    "Bulk upload failed.": "बल्क अपलोड विफल।",
    "Please fill all required fields.": "कृपया सभी अनिवार्य फ़ील्ड भरें।",
    "Pass Req No must be unique.": "पास रिक्वेस्ट नंबर अद्वितीय होना चाहिए।",
    "Failed to save pass.": "पास सेव करने में विफल।",
    "Pass saved successfully!": "पास सफलतापूर्वक सेव हुआ!",
    "Network/API error while saving.": "सेव करते समय नेटवर्क/API त्रुटि।",

    /* ===== Add License (Form + Bands) ===== */
    "Add License Details": "लाइसेंस विवरण जोड़ें",
    "License Req No *": "लाइसेंस रिक्वेस्ट नंबर *",
    "Station *": "स्टेशन *",
    "Validity (Expiry)": "वैधता (समाप्ति)",
    "Status *": "स्थिति *",
    "Bands": "बैंड",
    "Select Band": "बैंड चुनें",
    "Enter Uplink": "अपलिंक दर्ज करें",
    "Enter Downlink": "डाउनलिंक दर्ज करें",
    "remove row": "पंक्ति हटाएँ",

    // Band options (UI)
    "S-Band": "S-बैंड",
    "X-Band": "X-बैंड",
    "Ka-Band": "Ka-बैंड",
    "UHF": "UHF",
    "VHF": "VHF",

    // Add License alerts/toasts
    "Please fill Satellite, Station and Applied Date.": "कृपया उपग्रह, स्टेशन और आवेदन तिथि भरें।",
    "License saved successfully.": "लाइसेंस सफलतापूर्वक सहेजा गया।",
    "Failed to save license.": "लाइसेंस सहेजने में विफल।",

    /* ===== Add Satellites ===== */
    "Add Satellite Details": "उपग्रह विवरण जोड़ें",
    "Satellite ID *": "उपग्रह आईडी *",
    "Enter Satellite ID": "उपग्रह आईडी दर्ज करें",
    "Enter Satellite Name": "उपग्रह नाम दर्ज करें",
    "Enter Norad ID": "नॉरैड आईडी दर्ज करें",
    "Enter ITU Name": "आईटीयू नाम दर्ज करें",
    "Polarization *": "ध्रुवण *",
    "Select Polarization": "ध्रुवण चुनें",
    // Alerts
    "Please fill Satellite ID, Satellite Name, Station and Polarization.": "कृपया उपग्रह आईडी, उपग्रह नाम, स्टेशन और ध्रुवण भरें।",
    "Satellite saved successfully.": "उपग्रह सफलतापूर्वक सहेजा गया।",
    "Failed to save satellite.": "उपग्रह सहेजने में विफल।",

    /* ===== NEW: GS & Antennas page ===== */
    "Ground Stations": "ग्राउंड स्टेशन",
    "Satellite Polarization": "उपग्रह ध्रुवण",
    "Antennas": "एंटेना",

    "Add Ground Station": "ग्राउंड स्टेशन जोड़ें",
    "View Ground Stations": "ग्राउंड स्टेशन देखें",
    "Supporting Partner": "समर्थन साझेदार",
    "Ground Station": "ग्राउंड स्टेशन",
    "Ground Station Name": "ग्राउंड स्टेशन का नाम",
    "Antenna": "एंटेना",
    "Station Latitude": "स्टेशन अक्षांश",
    "Station Longitude": "स्टेशन देशांतर",
    "Enter Supporting Partner": "समर्थन साझेदार दर्ज करें",
    "Enter Ground Station Name": "ग्राउंड स्टेशन का नाम दर्ज करें",
    "Select Antenna": "एंटेना चुनें",
    "e.g. 12.9716": "उदा. 12.9716",
    "e.g. 77.5946": "उदा. 77.5946",
    "Ground Station Details": "ग्राउंड स्टेशन विवरण",
    "No data": "कोई डेटा नहीं",

    // Alerts (GS)
    "Please enter Supporting Partner and Ground Station Name.": "कृपया समर्थन साझेदार और ग्राउंड स्टेशन का नाम दर्ज करें।",
    "Ground Station added successfully ✅": "ग्राउंड स्टेशन सफलतापूर्वक जोड़ा गया ✅",
    "Failed to add Ground Station ❌": "ग्राउंड स्टेशन जोड़ने में विफल ❌",
    "Ground Station updated ✅": "ग्राउंड स्टेशन अपडेट हुआ ✅",
    "Failed to update ground station": "ग्राउंड स्टेशन अपडेट करने में विफल",
    "Ground Station deleted ✅": "ग्राउंड स्टेशन हटाया गया ✅",
    "Failed to delete ground station": "ग्राउंड स्टेशन हटाने में विफल",

    // Operations quick-add bar labels
    "Add Operation Requester": "ऑपरेशन अनुरोधकर्ता जोड़ें",
    "Add TTL Service Provider": "टीटीएल सेवा प्रदाता जोड़ें",
    "Operation Details": "ऑपरेशन विवरण",
    "Satellite Polarization Details": "उपग्रह ध्रुवण विवरण",

    // Alerts (Ops quick-add)
    "Operation added ✅": "ऑपरेशन जोड़ा गया ✅",
    "Failed to add operation ❌": "ऑपरेशन जोड़ने में विफल ❌",
    "Operation requester added ✅": "अनुरोधकर्ता जोड़ा गया ✅",
    "Failed to add requester ❌": "अनुरोधकर्ता जोड़ने में विफल ❌",
    "Operation supporter added ✅": "सहयोगी जोड़ा गया ✅",
    "Failed to add supporter ❌": "सहयोगी जोड़ने में विफल ❌",

    // Polarization section
    "Add Satellite Polarization": "उपग्रह ध्रुवण जोड़ें",

    // Alerts (Pol)
    "Satellite polarization added ✅": "उपग्रह ध्रुवण जोड़ा गया ✅",
    "Failed to add polarization ❌": "ध्रुवण जोड़ने में विफल ❌",
    "Polarization updated ✅": "ध्रुवण अपडेट हुआ ✅",
    "Failed to update polarization ❌": "ध्रुवण अपडेट करने में विफल ❌",
    "Polarization deleted ✅": "ध्रुवण हटाया गया ✅",
    "Failed to delete polarization ❌": "ध्रुवण हटाने में विफल ❌",

    // Antenna subpage
    "Add Antenna": "एंटेना जोड़ें",
    "View Antennas": "एंटेना देखें",
    "Antenna Type *": "एंटेना प्रकार *",
    "Antenna Size (m)": "एंटेना आकार (मीटर)",
    "EIRP (dBW)": "EIRP (dBW)",
    "Transmit Polarization": "ट्रांसमिट ध्रुवण",
    "Antenna Travel Range": "एंटेना ट्रैवल रेंज",
    "Tracking Velocity": "ट्रैकिंग वेग",
    "Tracking Acceleration": "ट्रैकिंग त्वरण",
    "Tracking Modes": "ट्रैकिंग मोड",
    "Enter type": "प्रकार दर्ज करें",
    "e.g. 3.7": "उदा. 3.7",
    "e.g. 52.5": "उदा. 52.5",
    "e.g. RHCP / LHCP / Linear": "उदा. RHCP / LHCP / Linear",
    "e.g. Az: ±180°, El: 0–90°": "उदा. अजि: ±180°, ऊ: 0–90°",
    "e.g. 20°/s": "उदा. 20°/से",
    "e.g. 100°/s²": "उदा. 100°/से²",
    "e.g. Program, TLE, Step-track": "उदा. प्रोग्राम, TLE, स्टेप-ट्रैक",

    // Bands / GT blocks
    "No bands added.": "कोई बैंड नहीं जोड़ा गया।",
    "Receive G/T": "रिसीव G/T",
    "Enter G/T": "G/T दर्ज करें",
    "No G/T rows added.": "कोई G/T पंक्ति नहीं जोड़ी गई।",
    "No": "क्र.",
    "Type": "प्रकार",
    "Size (m)": "आकार (मीटर)",
    "Tx Pol": "Tx ध्रुवण",
    "Travel Range": "ट्रैवल रेंज",
    "Track Vel": "ट्रैक वेग",
    "Track Acc": "ट्रैक त्वरण",
    "Track Modes": "ट्रैक मोड",
    "Bands / G/T": "बैंड / G/T",
    "G/T": "G/T",

    // Alerts (Antenna CRUD)
    "Please enter Antenna Type.": "कृपया एंटेना प्रकार दर्ज करें।",
    "Antenna added ✅": "एंटेना जोड़ा गया ✅",
    "Failed to add antenna ❌": "एंटेना जोड़ने में विफल ❌",
    "Antenna updated ✅": "एंटेना अपडेट हुआ ✅",
    "Failed to update antenna ❌": "एंटेना अपडेट करने में विफल ❌",
    "Antenna deleted ✅": "एंटेना हटाया गया ✅",

    /* ===== IAM page ===== */
    "Users": "उपयोगकर्ता",
    "Entity": "इकाई",
    "Role": "भूमिका",
    "Assignment": "असाइनमेंट",
    "User Id": "उपयोगकर्ता आईडी",
    "Full Name": "पूरा नाम",
    "Email": "ईमेल",
    "Add User": "यूज़र जोड़ें",
    "Add New Entity": "नई इकाई जोड़ें",
    "Entity name": "इकाई का नाम",
    "Entity Description": "इकाई विवरण",
    "Add Role": "भूमिका जोड़ें",
    "Role name": "भूमिका नाम",
    "Role description": "भूमिका विवरण",
    "Admin": "एडमिन",
    "Guest": "अतिथि",
    "Already Assigned Users": "पहले से असाइन उपयोगकर्ता",
    "Assign New created User": "नए बनाए उपयोगकर्ता को असाइन करें",
    "Role Name": "भूमिका नाम",
    "No users found.": "कोई उपयोगकर्ता नहीं मिला।",
    "No data.": "कोई डेटा नहीं।",
    "No assigned users.": "कोई असाइन किए गए उपयोगकर्ता नहीं।",
    "No unassigned users.": "कोई अनअसाइन उपयोगकर्ता नहीं।",
    "(global)": "(वैश्विक)",
    "(disabled)": "(निष्क्रिय)",
    "Enable": "सक्रिय करें",
    "Disable": "निष्क्रिय करें",
    "Failed to load users": "उपयोगकर्ता लोड करने में विफल",
    "Failed to load organization": "संगठन लोड करने में विफल",
    "Failed to load roles": "भूमिकाएँ लोड करने में विफल",
    "Failed to load assignments": "असाइनमेंट लोड करने में विफल",
    "User created successfully": "उपयोगकर्ता सफलतापूर्वक बनाया गया",
    "Entity created successfully": "इकाई सफलतापूर्वक बनाई गई",
    "Failed to create entity": "इकाई बनाने में विफल",
    "Role created successfully": "भूमिका सफलतापूर्वक बनाई गई",
    "Failed to create role": "भूमिका बनाने में विफल",
    "Assignment updated": "असाइनमेंट अपडेट हुआ",
    "Failed to update assignment": "असाइनमेंट अपडेट करने में विफल",
    "Entity updated": "इकाई अपडेट हुई",
    "Entity deleted": "इकाई हटाई गई",
    "User enabled": "उपयोगकर्ता सक्रिय हुआ",
    "User disabled": "उपयोगकर्ता निष्क्रिय हुआ",
    "Failed to update role": "भूमिका अपडेट करने में विफल",
    "Failed to update user": "उपयोगकर्ता अपडेट करने में विफल",
    "Role enabled successfully": "भूमिका सफलतापूर्वक सक्रिय की गई",
    "Role disabled successfully": "भूमिका सफलतापूर्वक निष्क्रिय की गई",

   // operation page 

"Requester updated ✅": "अनुरोधकर्ता अपडेट हुआ ✅",
"Failed to update requester ❌": "अनुरोधकर्ता अपडेट करने में विफल ❌",
"Requester deleted ✅": "अनुरोधकर्ता हटाया गया ✅",
"Failed to delete requester ❌": "अनुरोधकर्ता हटाने में विफल ❌",

"Operation updated ✅": "ऑपरेशन अपडेट हुआ ✅",
"Failed to update operation ❌": "ऑपरेशन अपडेट करने में विफल ❌",
"Operation deleted ✅": "ऑपरेशन हटाया गया ✅",
"Failed to delete operation ❌": "ऑपरेशन हटाने में विफल ❌",

"Supporter updated ✅": "सहयोगी अपडेट हुआ ✅",
"Failed to update supporter ❌": "सहयोगी अपडेट करने में विफल ❌",
"Supporter deleted ✅": "सहयोगी हटाया गया ✅",
"Failed to delete supporter ❌": "सहयोगी हटाने में विफल ❌",

// (Optional, only if you keep the generic alerts in code)
"Added successfully ✅": "सफलतापूर्वक जोड़ा गया ✅",
"Failed to add ❌": "जोड़ने में विफल ❌",

//sidebar


"Satellites List": "उपग्रह सूची",
"License List": "लाइसेंस सूची",
"Passes List": "पासेस सूची",
"Logs": "लॉग्स",
"Requests": "अनुरोध",
"Logout": "लॉगआउट",
"Log out of I-Portal?": "I-Portal से लॉग आउट करें?",

// User Profile page (hi)
"User Profile": "उपयोगकर्ता प्रोफ़ाइल",
"Add User Details": "उपयोगकर्ता विवरण जोड़ें",
"Change avatar": "अवतार बदलें",
"User avatar": "उपयोगकर्ता अवतार",
"Adjust your avatar": "अपना अवतार समायोजित करें",
"Zoom": "ज़ूम",
"Contact No": "संपर्क नंबर",
"LDAP DN": "LDAP DN",
"(optional)": "(वैकल्पिक)",
"Designation": "पदनाम",
"Save your profile changes?": "क्या आप अपनी प्रोफ़ाइल परिवर्तन सहेजना चाहते हैं?",
"Profile saved": "प्रोफ़ाइल सहेजी गई",
"Failed to save profile": "प्रोफ़ाइल सहेजने में विफल",
"Failed to load profile": "प्रोफ़ाइल लोड करने में विफल",
"Missing token. Please log in again.": "टोकन नहीं मिला। कृपया दोबारा लॉग इन करें।",

// PassSchedule / AWS panels (Hindi)
"AWS Contacts": "AWS संपर्क",
"View Contacts": "संपर्क देखें",
"Schedule Contacts": "कॉन्टैक्ट शेड्यूल करें",
"Update TLE": "TLE अपडेट करें",
"AWS Contact": "AWS कॉन्टैक्ट",
"Contact Available": "संपर्क उपलब्ध",
"No Contacts Found": "कोई संपर्क नहीं मिला",
"Contact Id": "संपर्क आईडी",
"Catalog number": "कैटलॉग नंबर",
"Start time (UTC)": "प्रारम्भ समय (UTC)",
"End time (UTC)": "समाप्ति समय (UTC)",
"Max elevation (deg)": "अधिकतम एलेवेशन (°)",
"Region": "रीजन",
"Satellite number": "उपग्रह संख्या",
"Select satellite": "उपग्रह चुनें",
"Ground station": "ग्राउंड स्टेशन",
"Mission profile": "मिशन प्रोफ़ाइल",

"Any": "कोई भी",

"Select Ground Station *": "ग्राउंड स्टेशन चुनें *",
"Select Region *": "रीजन चुनें *",

"Bulk schedule upload complete.": "बल्क शेड्यूल अपलोड पूरा हुआ।",

"Only .csv or .txt files are supported.": "केवल .csv या .txt फाइलें समर्थित हैं।",


"Regions & Buckets": "रीजन और बकेट",
"Bucket name": "बकेट नाम",
"No custom mappings yet. Add one above (optional).": "अभी कोई कस्टम मैपिंग नहीं। ऊपर जोड़ें (वैकल्पिक)।",
"TLE uploaded.": "TLE अपलोड हो गया।",
"TLE upload failed.": "TLE अपलोड विफल।",
"Select & Upload TLE (.txt / .tle / .json)": "TLE चुनें और अपलोड करें (.txt / .tle / .json)",
"Schedule contact": "कॉन्टैक्ट शेड्यूल करें",
"Cancel contact": "कॉन्टैक्ट रद्द करें",
"Select at least one contact.": "कृपया कम से कम एक संपर्क चुनें।",
"No valid rows selected.": "कोई मान्य पंक्तियाँ नहीं चुनीं।",
"AVAILABLE": "उपलब्ध",
"SCHEDULED": "निर्धारित",
"COMPLETED": "पूर्ण",
"AWS_CANCELLED": "AWS_रद्द",
"CANCELLED": "रद्द",
"Select": "चुनें",
"selected": "चुना गया",
"No selection": "कोई चयन नहीं",
"AWS Operations": "AWS ऑपरेशन्स",

  },
} as const;

type Lang = keyof typeof dict;

const I18nCtx = React.createContext<{ lang: Lang; t: (k: string) => string }>({
  lang: "en",
  t: (k) => k,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Lang>(
    ((localStorage.getItem("pmgt_lang") as Lang) || "en") as Lang
  );

  React.useEffect(() => {
    const onChange = (e: Event) => {
      const l = (e as CustomEvent).detail?.lang as Lang;
      if (l === "en" || l === "hi") setLang(l);
    };
    window.addEventListener("pmgt:lang-changed", onChange as EventListener);
    return () =>
      window.removeEventListener("pmgt:lang-changed", onChange as EventListener);
  }, []);

  const t = React.useCallback((k: string) => (dict[lang] as any)[k] ?? k, [lang]);

  return <I18nCtx.Provider value={{ lang, t }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => React.useContext(I18nCtx);
