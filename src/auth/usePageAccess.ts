import React from "react";
import { APP_PAGES } from "../config/pageRegistry";

type PageAccessData = {
  viewerPages: string[];
  editorPages: string[];
};

function readPageAccess(): PageAccessData {
  try {
    const raw = sessionStorage.getItem("pmgt_page_access");
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      viewerPages: Array.isArray(parsed.viewerPages) ? parsed.viewerPages : [],
      editorPages: Array.isArray(parsed.editorPages) ? parsed.editorPages : [],
    };
  } catch {
    return { viewerPages: [], editorPages: [] };
  }
}

export function usePageAccess() {
  const [data, setData] = React.useState<PageAccessData>({
    viewerPages: [],
    editorPages: [],
  });

  const [loadingAccess, setLoadingAccess] = React.useState(true);

  React.useEffect(() => {
  const refresh = () => {
  const raw = sessionStorage.getItem("pmgt_page_access");

  // 🔥 if access not loaded yet, keep loading true
if (!raw) {
  setData({ viewerPages: [], editorPages: [] });
  setLoadingAccess(true);
  return;
}
  const newData = readPageAccess();
  setData(newData);

  setLoadingAccess(false);
};


    refresh();

    window.addEventListener("pmgt:page-access-updated", refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("pmgt:page-access-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

const [role, setRole] = React.useState(sessionStorage.getItem("pmgt_role"));
const [roleType, setRoleType] = React.useState(sessionStorage.getItem("pmgt_role_type"));

React.useEffect(() => {
  const sync = () => {
    setRole(sessionStorage.getItem("pmgt_role"));
    setRoleType(sessionStorage.getItem("pmgt_role_type"));
  };

  sync();
  window.addEventListener("pmgt:page-access-updated", sync);
  window.addEventListener("storage", sync);

  return () => {
    window.removeEventListener("pmgt:page-access-updated", sync);
    window.removeEventListener("storage", sync);
  };
}, []);


  const hasPageAccess = React.useCallback(
    (key: string) => {
      const page = APP_PAGES.find((p) => p.key === key);
      if (!page) return false;

      if (String(role).toLowerCase() === "admin") return true;

// ✅ Auto-detect editor if editorPages exist
// ✅ roleType should decide access level, not editorPages length
const effectiveRoleType = String(roleType || "viewer").toLowerCase();

if (page.viewerHidden && effectiveRoleType === "viewer") return false;

// editor can access both viewer + editor pages
if (effectiveRoleType === "editor") {
  return data.editorPages.includes(key) || data.viewerPages.includes(key);
}

// viewer can access only viewer pages
return data.viewerPages.includes(key);

    },
    [data.viewerPages, data.editorPages, role, roleType]
  );

  return {
    viewerPages: data.viewerPages,
    editorPages: data.editorPages,
    hasPageAccess,
    loadingAccess,
  };
}
