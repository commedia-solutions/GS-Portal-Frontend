export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE?.replace(/\/$/, "") || "";

export const apiUrl = (path: string) =>
  `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
