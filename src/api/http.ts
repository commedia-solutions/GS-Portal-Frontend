// src/api/http.ts

/**
 * BASE URL logic:
 * - If VITE_API_BASE is defined (non-empty), use it (absolute or relative).
 * - Otherwise, use RELATIVE '' so all calls go through Vite proxy in dev
 *   and same-origin in prod/reverse-proxy.
 */
const raw = (import.meta as any).env?.VITE_API_BASE as string | undefined;

function normalize(u?: string) {
  if (!u) return "";
  return u.replace(/\/+$/g, "");
}

// ✅ default to relative, unless explicitly overridden
export const BASE_URL = normalize(raw ?? "");

// ------------------- Token handling -------------------
let AUTH_TOKEN: string | null =
  localStorage.getItem("auth_token") ||
  sessionStorage.getItem("auth_token") ||
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  null;

export function getAuthToken(): string | null {
  return (
    AUTH_TOKEN ??
    localStorage.getItem("auth_token") ??
    sessionStorage.getItem("auth_token") ??
    localStorage.getItem("token") ??
    sessionStorage.getItem("token") ??
    null
  );
}

export function setAuthToken(token: string | null, remember = true) {
  AUTH_TOKEN = token;

  // primary key
  if (remember) {
    token
      ? localStorage.setItem("auth_token", token)
      : localStorage.removeItem("auth_token");
  } else {
    token
      ? sessionStorage.setItem("auth_token", token)
      : sessionStorage.removeItem("auth_token");
  }

  // legacy keys (optional)
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

// ------------------- Helpers -------------------

// Public endpoints (no auth header, no cookies)
function isPublicPath(p: string) {
  // accept both absolute and relative use
  const path = p.startsWith("http") ? new URL(p).pathname : p;
  return path.startsWith("/api/aws-contacts") || path.startsWith("/api/pass-schedule");
}

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

// ------------------- Fetch wrapper -------------------
export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  // absolute URLs pass through; others are BASE_URL + path
  const url = path.startsWith("http")
    ? path
    : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };

  const isFormData =
    typeof FormData !== "undefined" && opts.body instanceof FormData;

  // only set Content-Type for non-FormData bodies
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Attach token unless explicitly disabled or calling public routes
  const token = getAuthToken();
  if (opts.auth !== false && token && !isPublicPath(path)) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Avoid sending cookies/credentials to public endpoints (prevents 431/500)
  const credentials: RequestCredentials = isPublicPath(path) ? "omit" : "include";

  // Serialize non-FormData bodies
  const body =
    opts.body && typeof opts.body !== "string" && !(opts.body instanceof FormData)
      ? JSON.stringify(opts.body)
      : opts.body;

  const res = await fetch(url, { ...opts, headers, credentials, body });

  if (res.status === 401) {
    // let the app react (e.g., force logout)
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    throw new Error("Unauthorized");
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json") || ct.includes("+json");

  let payload: any = null;
  try {
    payload = isJson ? await res.json() : await res.text();
  } catch {
    payload = null;
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

// ------------------- Convenience helpers -------------------
type Opts = {
  params?: Record<string, any>;
  auth?: boolean;
  headers?: Record<string, string>;
};

export const api = {
  get:   <T = any>(p: string, opts?: Opts) =>
    apiFetch<T>(`${p}${buildQS(opts?.params, p)}`, {
      method: "GET",
      auth: opts?.auth,
      headers: opts?.headers,
    }),

  del:   <T = any>(p: string, opts?: Opts) =>
    apiFetch<T>(`${p}${buildQS(opts?.params, p)}`, {
      method: "DELETE",
      auth: opts?.auth,
      headers: opts?.headers,
    }),

  post:  <T = any>(p: string, b?: any, opts?: Opts) =>
    apiFetch<T>(`${p}${buildQS(opts?.params, p)}`, {
      method: "POST",
      body: b,
      auth: opts?.auth,
      headers: opts?.headers,
    }),

  patch: <T = any>(p: string, b?: any, opts?: Opts) =>
    apiFetch<T>(`${p}${buildQS(opts?.params, p)}`, {
      method: "PATCH",
      body: b,
      auth: opts?.auth,
      headers: opts?.headers,
    }),

  put:   <T = any>(p: string, b?: any, opts?: Opts) =>
    apiFetch<T>(`${p}${buildQS(opts?.params, p)}`, {
      method: "PUT",
      body: b,
      auth: opts?.auth,
      headers: opts?.headers,
    }),
};

export default api;
