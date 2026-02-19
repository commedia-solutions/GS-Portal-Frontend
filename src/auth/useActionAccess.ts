import React from "react";

type AccessData = {
  viewerPages: string[];
  editorPages: string[];
  accessLevel: "viewer" | "editor";
};

function readActionAccess(): AccessData {
  const role = sessionStorage.getItem("pmgt_role"); // admin | developer | etc
  const roleType = sessionStorage.getItem("pmgt_role_type"); // viewer | editor

  let viewerPages: string[] = [];
  let editorPages: string[] = [];

  try {
    const raw = sessionStorage.getItem("pmgt_page_access");
    const parsed = raw ? JSON.parse(raw) : {};

    viewerPages = Array.isArray(parsed.viewerPages) ? parsed.viewerPages : [];
    editorPages = Array.isArray(parsed.editorPages) ? parsed.editorPages : [];
  } catch {}

  let accessLevel: "viewer" | "editor" = "viewer";

  // 👑 Admin always editor access
  if (String(role).toLowerCase() === "admin") {
    accessLevel = "editor";
  } else if (String(roleType).toLowerCase() === "editor") {
    accessLevel = "editor";
  }

  return { viewerPages, editorPages, accessLevel };
}

export function useActionAccess() {
  const [data, setData] = React.useState<AccessData>(readActionAccess);
  const [loadingAccess, setLoadingAccess] = React.useState(true);

  React.useEffect(() => {
  const handler = () => {
    setData(readActionAccess());
    setLoadingAccess(false);
  };

  // ✅ first time stop loading also
  handler();

  window.addEventListener("pmgt:page-access-updated", handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener("pmgt:page-access-updated", handler);
    window.removeEventListener("storage", handler);
  };
}, []);

const hasWriteAccess = (pageKey: string) => {
  const role = sessionStorage.getItem("pmgt_role");
  if (String(role).toLowerCase() === "admin") return true;
  return data.editorPages.includes(pageKey);
};

const hasReadAccess = (pageKey: string) => {
  const role = sessionStorage.getItem("pmgt_role");
  if (String(role).toLowerCase() === "admin") return true;
  return data.viewerPages.includes(pageKey) || data.editorPages.includes(pageKey);
};

return {
  viewerPages: data.viewerPages,
  editorPages: data.editorPages,

  isEditor: data.accessLevel === "editor",
  isViewer: data.accessLevel === "viewer",

  hasWriteAccess,
  hasReadAccess,

  loadingAccess,
};

}
