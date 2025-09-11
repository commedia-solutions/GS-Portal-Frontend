// //p2//
// // src/api/http.ts
// export const BASE_URL =
//   (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:4000";

// let AUTH_TOKEN: string | null =
//   localStorage.getItem("auth_token") ||
//   sessionStorage.getItem("auth_token") ||
//   // backward-compat with old key names
//   localStorage.getItem("token") ||
//   sessionStorage.getItem("token") ||
//   null;

// export function getAuthToken(): string | null {
//   return AUTH_TOKEN;
// }

// /** Persist token and keep a memory copy used by the client */
// export function setAuthToken(token: string | null, remember = true) {
//   AUTH_TOKEN = token;

//   // new key
//   if (remember) {
//     token
//       ? localStorage.setItem("auth_token", token)
//       : localStorage.removeItem("auth_token");
//   } else {
//     token
//       ? sessionStorage.setItem("auth_token", token)
//       : sessionStorage.removeItem("auth_token");
//   }

//   // optional legacy keys for existing guards
//   if (remember) {
//     token
//       ? localStorage.setItem("token", token)
//       : localStorage.removeItem("token");
//   } else {
//     token
//       ? sessionStorage.setItem("token", token)
//       : sessionStorage.removeItem("token");
//   }
// }

// export async function apiFetch<T = any>(
//   path: string,
//   opts: RequestInit & { auth?: boolean } = {}
// ): Promise<T> {
//   const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

//   // Build headers; only set JSON content-type if not sending FormData
//   const headers: Record<string, string> = {
//     ...(opts.headers as Record<string, string> | undefined),
//   };
//   const isFormData = typeof FormData !== "undefined" && opts.body instanceof FormData;
//   if (!isFormData && !headers["Content-Type"]) {
//     headers["Content-Type"] = "application/json";
//   }

//   // attach Authorization unless explicitly disabled
//   if (opts.auth !== false && AUTH_TOKEN) {
//     headers.Authorization = `Bearer ${AUTH_TOKEN}`;
//   }

//   const res = await fetch(url, { ...opts, headers });

//   if (res.status === 401) {
//     window.dispatchEvent(new CustomEvent("auth:unauthorized"));
//     throw new Error("Unauthorized");
//   }

//   if (res.status === 204) {
//     // no content
//     return undefined as unknown as T;
//   }

//   const ct = res.headers.get("content-type") || "";
//   const isJson = ct.includes("application/json") || ct.includes("+json");

//   let payload: any = null;

//   try {
//     payload = isJson ? await res.json() : await res.text();
//   } catch {
//     // swallow parse errors; payload stays null
//     payload = null;
//   }

//   if (!res.ok) {
//     // Prefer structured API error; otherwise show a readable snippet for text/HTML
//     const msg =
//       (isJson && payload && (payload.error || payload.message)) ||
//       (typeof payload === "string" && payload.slice(0, 300)) ||
//       `HTTP ${res.status}`;
//     throw new Error(msg);
//   }

//   return (payload as T) ?? (undefined as unknown as T);
// }



// export const api = {
//   get:  <T = any>(p: string) => apiFetch<T>(p, { method: "GET" }),
//   del:  <T = any>(p: string) => apiFetch<T>(p, { method: "DELETE" }),
//   post: <T = any>(p: string, b?: any) =>
//     apiFetch<T>(p, {
//       method: "POST",
//       body: b && typeof b !== "string" && !(b instanceof FormData) ? JSON.stringify(b) : b,
//     }),
//   patch:<T = any>(p: string, b?: any) =>
//     apiFetch<T>(p, {
//       method: "PATCH",
//       body: b && typeof b !== "string" && !(b instanceof FormData) ? JSON.stringify(b) : b,
//     }),
//   put:  <T = any>(p: string, b?: any) =>
//     apiFetch<T>(p, {
//       method: "PUT",
//       body: b && typeof b !== "string" && !(b instanceof FormData) ? JSON.stringify(b) : b,
//     }),
// };

// // optional default export so "import api from ..." also works
// export default api;


//p3//
// src/api/http.ts
export const BASE_URL =
  (import.meta as any).env?.VITE_API_BASE ?? "http://localhost:4000";

// let AUTH_TOKEN: string | null =
//   localStorage.getItem("auth_token") ||
//   sessionStorage.getItem("auth_token") ||
//   // backward-compat with old key names
//   localStorage.getItem("token") ||
//   sessionStorage.getItem("token") ||
//   null;

let AUTH_TOKEN: string | null =
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  null;


export function getAuthToken(): string | null {
  return AUTH_TOKEN;
}

/** Persist token and keep a memory copy used by the client */
export function setAuthToken(token: string | null, remember = true) {
  AUTH_TOKEN = token;

  // new key
  if (remember) {
    token
      ? localStorage.setItem("auth_token", token)
      : localStorage.removeItem("auth_token");
  } else {
    token
      ? sessionStorage.setItem("auth_token", token)
      : sessionStorage.removeItem("auth_token");
  }

  // optional legacy keys for existing guards
  if (remember) {
    token
      ? localStorage.setItem("token", token)
      : localStorage.removeItem("token");
  } else {
    token
      ? sessionStorage.setItem("token", token)
      : sessionStorage.removeItem("token");
  }
}

export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;

  // Build headers; only set JSON content-type if not sending FormData
  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };
  const isFormData =
    typeof FormData !== "undefined" && opts.body instanceof FormData;
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // attach Authorization unless explicitly disabled
  if (opts.auth !== false && AUTH_TOKEN) {
    headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }

  const res = await fetch(url, { ...opts, headers });

  if (res.status === 401) {
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    throw new Error("Unauthorized");
  }

  if (res.status === 204) {
    // no content
    return undefined as unknown as T;
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json") || ct.includes("+json");

  let payload: any = null;

  try {
    payload = isJson ? await res.json() : await res.text();
  } catch {
    payload = null; // swallow parse errors
  }

  if (!res.ok) {
    const msg =
      (isJson && payload && (payload.error || payload.message)) ||
      (typeof payload === "string" && payload.slice(0, 300)) ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return (payload as T) ?? (undefined as unknown as T);
}

/** Build querystring from a params object and append it to a base path. */
function buildQS(params?: Record<string, any>, basePath = ""): string {
  if (!params) return "";
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) v.forEach((item) => qs.append(k, String(item)));
    else qs.append(k, String(v));
  }
  const s = qs.toString();
  if (!s) return "";
  return basePath.includes("?") ? `&${s}` : `?${s}`;
}

type Opts = {
  params?: Record<string, any>;
  auth?: boolean;
  headers?: Record<string, string>;
};

export const api = {
  get: <T = any>(p: string, opts?: Opts) => {
    const withQs = `${p}${buildQS(opts?.params, p)}`;
    return apiFetch<T>(withQs, {
      method: "GET",
      auth: opts?.auth,
      headers: opts?.headers,
    });
  },

  del: <T = any>(p: string, opts?: Opts) => {
    const withQs = `${p}${buildQS(opts?.params, p)}`;
    return apiFetch<T>(withQs, {
      method: "DELETE",
      auth: opts?.auth,
      headers: opts?.headers,
    });
  },

  post: <T = any>(p: string, b?: any, opts?: Opts) => {
    const withQs = `${p}${buildQS(opts?.params, p)}`;
    return apiFetch<T>(withQs, {
      method: "POST",
      body:
        b && typeof b !== "string" && !(b instanceof FormData)
          ? JSON.stringify(b)
          : b,
      auth: opts?.auth,
      headers: opts?.headers,
    });
  },

  patch: <T = any>(p: string, b?: any, opts?: Opts) => {
    const withQs = `${p}${buildQS(opts?.params, p)}`;
    return apiFetch<T>(withQs, {
      method: "PATCH",
      body:
        b && typeof b !== "string" && !(b instanceof FormData)
          ? JSON.stringify(b)
          : b,
      auth: opts?.auth,
      headers: opts?.headers,
    });
  },

  put: <T = any>(p: string, b?: any, opts?: Opts) => {
    const withQs = `${p}${buildQS(opts?.params, p)}`;
    return apiFetch<T>(withQs, {
      method: "PUT",
      body:
        b && typeof b !== "string" && !(b instanceof FormData)
          ? JSON.stringify(b)
          : b,
      auth: opts?.auth,
      headers: opts?.headers,
    });
  },
};

// optional default export so "import api from ..." also works
export default api;
