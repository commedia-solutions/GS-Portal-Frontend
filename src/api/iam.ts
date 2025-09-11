// // // src/api/iam.ts
// // export type UserType = "Local" | "LDAP";

// // export interface UserRow {
// //   id: string;
// //   username: string;
// //   email: string;
// //   fullName: string;
// //   userType: UserType;
// //   roleId: string | null;
// //   roleName?: string | null;
// //   status: "active" | "inactive" | "suspended";
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // export interface EntityRow {
// //   id: string;
// //   name: string;
// //   description: string | null;
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // export interface DesignationRow {
// //   id: string;
// //   entityId: string;
// //   name: string;
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// // function token() {
// //   return sessionStorage.getItem("token") || "";
// // }

// // async function request<T>(
// //   path: string,
// //   init: RequestInit = {},
// //   auth = true
// // ): Promise<T> {
// //   const headers: Record<string, string> = {
// //     "Content-Type": "application/json",
// //     ...(init.headers as Record<string, string>),
// //   };
// //   if (auth && token()) headers.Authorization = `Bearer ${token()}`;

// //   const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
// //   let body: any = null;
// //   try {
// //     body = await res.json();
// //   } catch {
// //     /* ignore */
// //   }
// //   if (!res.ok) {
// //     const message =
// //       body?.error ||
// //       body?.message ||
// //       `Request failed: ${res.status} ${res.statusText}`;
// //     throw new Error(message);
// //   }
// //   return body as T;
// // }

// // /* ===================== USERS ===================== */

// // export async function listUsers(params?: {
// //   page?: number;
// //   pageSize?: number;
// //   q?: string;
// //   status?: string;
// // }) {
// //   const qs = new URLSearchParams();
// //   if (params?.page) qs.set("page", String(params.page));
// //   if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
// //   if (params?.q) qs.set("q", params.q);
// //   if (params?.status) qs.set("status", params.status);
// //   return request<{ data: UserRow[]; page: number; pageSize: number; total: number }>(
// //     `/api/users${qs.toString() ? `?${qs.toString()}` : ""}`
// //   );
// // }

// // export async function createUser(payload: {
// //   username: string;
// //   email: string;
// //   fullName: string;
// //   userType: UserType;     // "Local" | "LDAP"
// //   password?: string;      // required for Local
// //   ldapDn?: string;        // required for LDAP
// // }) {
// //   return request<{ id: string }>(`/api/users`, {
// //     method: "POST",
// //     body: JSON.stringify(payload),
// //   });
// // }

// // /* ===================== ENTITIES ===================== */

// // export async function getEntities() {
// //   return request<EntityRow[]>(`/api/entities`);
// // }

// // export async function createEntity(payload: { name: string; description?: string | null }) {
// //   return request<{ id: string }>(`/api/entities`, {
// //     method: "POST",
// //     body: JSON.stringify(payload),
// //   });
// // }

// // export async function updateEntity(entityId: string, patch: { name?: string; description?: string | null }) {
// //   return request<{ ok: true; updated: number }>(`/api/entities/${entityId}`, {
// //     method: "PATCH",
// //     body: JSON.stringify(patch),
// //   });
// // }

// // export async function deleteEntity(entityId: string) {
// //   return request<{ ok: true; deleted: number }>(`/api/entities/${entityId}`, {
// //     method: "DELETE",
// //   });
// // }

// // /* ===================== DESIGNATIONS ===================== */

// // export async function getDesignations(entityId: string) {
// //   return request<DesignationRow[]>(`/api/entities/${entityId}/designations`);
// // }

// // export async function createDesignation(entityId: string, payload: { name: string }) {
// //   return request<{ id: string }>(`/api/entities/${entityId}/designations`, {
// //     method: "POST",
// //     body: JSON.stringify(payload),
// //   });
// // }

// // export async function renameDesignation(id: string, payload: { name: string }) {
// //   return request<{ ok: true; updated: number }>(`/api/designations/${id}`, {
// //     method: "PATCH",
// //     body: JSON.stringify(payload),
// //   });
// // }

// // export async function deleteDesignation(id: string) {
// //   return request<{ ok: true; deleted: number }>(`/api/designations/${id}`, {
// //     method: "DELETE",
// //   });
// // }



// // src/api/iam.ts
// export type UserType = "Local" | "LDAP";
// export type AccessType = "Admin" | "User" | "Guest";

// /* ========= Users ========= */
// export interface UserRow {
//   id: string;
//   username: string;
//   email: string;
//   fullName: string;
//   userType: UserType;
//   roleId: string | null;
//   roleName?: string | null;
//   status: "active" | "inactive" | "suspended";
//   createdAt: string;
//   updatedAt: string;
// }

// /* ========= Entities / Designations ========= */
// export interface EntityRow {
//   id: string;
//   name: string;
//   description: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface DesignationRow {
//   id: string;
//   entityId: string;
//   name: string;
//   createdAt: string;
//   updatedAt: string;
// }

// /* ========= Roles ========= */
// export interface RoleRow {
//   id: string;
//   name: string;
//   accessType: AccessType;
//   isSystem: 0 | 1;    // from DB (system defaults)
//   isDisabled: 0 | 1;
// }

// /* ========= Assignments ========= */
// /** Row used by the Assignment table (aggregated per user) */
// export interface AssignmentTableRow {
//   id: string;                 // user id
//   sr: number;
//   user: string;               // username
//   user_id: string;            // user id
//   entities: string[];         // names (empty => global)
//   entity_ids: string[];       // ids (empty => global)
//   role: string;               // role name or ""
//   role_id: string | null;
//   designation: string[];      // distinct set across entities
// }

// /** Modal pre-fill for a single user */
// export interface AssignmentForEdit {
//   userId: string;
//   username: string;
//   roleId: string | null;
//   /** [] means global (no entity scoping) */
//   entityIds: string[];
//   /** Names; must exist within selected entities when not global */
//   designations: string[];
// }

// export interface AssignmentUpdatedPayload {
//   roleId: string | null;
//   /** [] means global. (UI may use [0] as sentinel; normalize to [] before PUT.) */
//   entityIds: string[];
//   designations: string[];
// }

// /* ========= HTTP helper ========= */
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// function token() {
//   return sessionStorage.getItem("token") || "";
// }

// async function request<T>(
//   path: string,
//   init: RequestInit = {},
//   auth = true
// ): Promise<T> {
//   const headers: Record<string, string> = {
//     "Content-Type": "application/json",
//     ...(init.headers as Record<string, string>),
//   };
//   if (auth && token()) headers.Authorization = `Bearer ${token()}`;

//   const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
//   let body: any = null;
//   try {
//     // 204 will throw here; we swallow via try/catch
//     body = await res.json();
//   } catch {
//     /* no body (e.g., 204) */
//   }
//   if (!res.ok) {
//     const message =
//       body?.error ||
//       body?.message ||
//       `Request failed: ${res.status} ${res.statusText}`;
//     throw new Error(message);
//   }
//   return body as T;
// }

// /* ===================== USERS ===================== */

// export async function listUsers(params?: {
//   page?: number;
//   pageSize?: number;
//   q?: string;
//   status?: string;
// }) {
//   const qs = new URLSearchParams();
//   if (params?.page) qs.set("page", String(params.page));
//   if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
//   if (params?.q) qs.set("q", params.q);
//   if (params?.status) qs.set("status", params.status);
//   return request<{ data: UserRow[]; page: number; pageSize: number; total: number }>(
//     `/api/users${qs.toString() ? `?${qs.toString()}` : ""}`
//   );
// }

// export async function createUser(payload: {
//   username: string;
//   email: string;
//   fullName: string;
//   userType: UserType;     // "Local" | "LDAP"
//   password?: string;      // required for Local
//   ldapDn?: string;        // required for LDAP
// }) {
//   return request<{ id: string }>(`/api/users`, {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });
// }

// /* ===================== ENTITIES ===================== */

// export async function getEntities() {
//   return request<EntityRow[]>(`/api/entities`);
// }

// export async function createEntity(payload: { name: string; description?: string | null }) {
//   return request<{ id: string }>(`/api/entities`, {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });
// }

// export async function updateEntity(entityId: string, patch: { name?: string; description?: string | null }) {
//   return request<{ ok: true; updated: number }>(`/api/entities/${entityId}`, {
//     method: "PATCH",
//     body: JSON.stringify(patch),
//   });
// }

// export async function deleteEntity(entityId: string) {
//   // Backend returns 204 No Content
//   return request<void>(`/api/entities/${entityId}`, {
//     method: "DELETE",
//   });
// }

// /* ===================== DESIGNATIONS ===================== */

// export async function getDesignations(entityId: string) {
//   return request<DesignationRow[]>(`/api/entities/${entityId}/designations`);
// }

// export async function createDesignation(entityId: string, payload: { name: string }) {
//   return request<{ id: string }>(`/api/entities/${entityId}/designations`, {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });
// }

// export async function renameDesignation(id: string, payload: { name: string }) {
//   return request<{ ok: true; updated: number }>(`/api/designations/${id}`, {
//     method: "PATCH",
//     body: JSON.stringify(payload),
//   });
// }

// export async function deleteDesignation(id: string) {
//   return request<{ ok: true; deleted: number }>(`/api/designations/${id}`, {
//     method: "DELETE",
//   });
// }

// /* ===================== ROLES ===================== */

// export async function getRoles() {
//   return request<RoleRow[]>(`/api/roles`);
// }

// export async function createRole(payload: { name: string; accessType: AccessType }) {
//   return request<{ id: string }>(`/api/roles`, {
//     method: "POST",
//     body: JSON.stringify(payload),
//   });
// }

// export async function updateRole(
//   roleId: string,
//   patch: Partial<Pick<RoleRow, "name" | "accessType" | "isDisabled">>
// ) {
//   return request<{ ok: true }>(`/api/roles/${roleId}`, {
//     method: "PATCH",
//     body: JSON.stringify(patch),
//   });
// }

// export async function deleteRole(roleId: string) {
//   // 204 No Content
//   return request<void>(`/api/roles/${roleId}`, { method: "DELETE" });
// }

// /* ===================== ASSIGNMENTS ===================== */

// export async function getAssignmentForUser(userId: string) {
//   return request<AssignmentForEdit>(`/api/assignments/user/${userId}`);
// }

// export async function updateAssignment(
//   userId: string,
//   payload: AssignmentUpdatedPayload
// ) {
//   // IMPORTANT: UI may use [0] as "global". Backend expects [] for global.
//   const normalized = {
//     ...payload,
//     entityIds: (payload.entityIds || []).filter((id) => id !== ("0" as any)) as string[],
//   };
//   return request<{ ok: true }>(`/api/assignments/user/${userId}`, {
//     method: "PUT",
//     body: JSON.stringify(normalized),
//   });
// }


// export interface AssignmentListRow {
//   id: string;                 // user id (UUID)
//   user: string;               // username
//   user_id: string;            // same as id
//   entity_ids: string[];       // [] => global
//   entities: string[];         // names
//   role_id: string | null;     // UUID or null
//   role: string;               // role name ("" if none)
//   designation: string[];      // list of names
//   sr: number;                 // serial index injected by server
// }

// export async function listAssignments() {
//   return request<AssignmentListRow[]>(`/api/assignments`);
// }

// // (optional – useful when wiring the modal)
// export async function readAssignmentForUser(userId: string) {
//   return request<{
//     userId: string;
//     username: string;
//     roleId: string | null;
//     entityIds: string[];      // [] => global
//     designations: string[];
//   }>(`/api/assignments/user/${userId}`);
// }

// export async function updateAssignmentForUser(
//   userId: string,
//   payload: {
//     roleId: string | null;
//     entityIds: string[];      // [] => global
//     designations: string[];
//   }
// ) {
//   return request<{ ok: true }>(`/api/assignments/user/${userId}`, {
//     method: "PUT",
//     body: JSON.stringify(payload),
//   });
// }


// src/api/iam.ts
export type UserType = "Local" | "LDAP";
export type AccessType = "Admin" | "User" | "Guest";

/* ========= Users ========= */
export interface UserRow {
  id: string;
  username: string;
  email: string;
  fullName: string;
  userType: UserType;
  roleId: string | null;
  roleName?: string | null;
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  updatedAt: string;
}

/* ========= Entities / Designations ========= */
export interface EntityRow {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DesignationRow {
  id: string;
  entityId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/* ========= Roles ========= */
export interface RoleRow {
  id: string;                     // UUID
  name: string;
  accessType: AccessType;
  isSystem: 0 | 1;
  isDisabled: 0 | 1;
}

/* ========= Assignments ========= */
export interface AssignmentListRow {
  id: string;                 // user id (UUID)
  user: string;               // username
  user_id: string;            // same as id
  entity_ids: string[];       // [] => global
  entities: string[];         // names
  role_id: string | null;     // UUID or null
  role: string;               // role name ("" if none)
  designation: string[];      // list of names
  sr: number;                 // serial index injected by server
}

/** Modal pre-fill for a single user */
export interface AssignmentForEdit {
  userId: string;
  username: string;
  roleId: string | null;
  entityIds: string[];        // [] => global
  designations: string[];
}

export interface AssignmentUpdatedPayload {
  roleId: string | null;
  entityIds: string[];        // [] => global (UI may send ["0"], we normalize)
  designations: string[];
}

/* ========= HTTP helper ========= */
// const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (import.meta as any).env?.VITE_API_BASE_URL ||
  "http://localhost:4000";



function getToken(): string {
  return (
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    ""
  );
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  auth = true
): Promise<T> {
  const headers = new Headers(init.headers || {});
  const isForm = init.body instanceof FormData;

  if (!isForm && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const t = getToken();
    if (t) headers.set("Authorization", `Bearer ${t}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  // tolerate empty/204 responses
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch {}

  if (!res.ok) {
    throw new Error(
      (data && (data.error || data.message)) || `HTTP ${res.status}`
    );
  }

  return (data as T) ?? (undefined as unknown as T);
}

/* ===================== USERS ===================== */

export async function listUsers(params?: {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params?.q) qs.set("q", params.q);
  if (params?.status) qs.set("status", params.status);
  return request<{ data: UserRow[]; page: number; pageSize: number; total: number }>(
    `/api/users${qs.toString() ? `?${qs.toString()}` : ""}`
  );
}

export async function createUser(payload: {
  username: string;
  email: string;
  fullName: string;
  userType: UserType;     // "Local" | "LDAP"
  password?: string;      // required for Local
  ldapDn?: string;        // required for LDAP
}) {
  return request<{ id: string }>(`/api/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ===================== ENTITIES ===================== */

export async function getEntities() {
  return request<EntityRow[]>(`/api/entities`);
}

export async function createEntity(payload: { name: string; description?: string | null }) {
  return request<{ id: string }>(`/api/entities`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateEntity(entityId: string, patch: { name?: string; description?: string | null }) {
  return request<{ ok: true; updated: number }>(`/api/entities/${entityId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteEntity(entityId: string) {
  return request<void>(`/api/entities/${entityId}`, { method: "DELETE" });
}

/* ===================== DESIGNATIONS ===================== */

export async function getDesignations(entityId: string) {
  return request<DesignationRow[]>(`/api/entities/${entityId}/designations`);
}

export async function createDesignation(entityId: string, payload: { name: string }) {
  return request<{ id: string }>(`/api/entities/${entityId}/designations`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function renameDesignation(id: string, payload: { name: string }) {
  return request<{ ok: true; updated: number }>(`/api/designations/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteDesignation(id: string) {
  return request<{ ok: true; deleted: number }>(`/api/designations/${id}`, {
    method: "DELETE",
  });
}

/* ===================== ROLES ===================== */

export async function getRoles() {
  return request<RoleRow[]>(`/api/roles`);
}

export async function createRole(payload: { name: string; accessType: AccessType }) {
  return request<{ id: string }>(`/api/roles`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRole(
  roleId: string,
  patch: Partial<Pick<RoleRow, "name" | "accessType" | "isDisabled">>
) {
  return request<{ ok: true }>(`/api/roles/${roleId}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteRole(roleId: string) {
  return request<void>(`/api/roles/${roleId}`, { method: "DELETE" });
}

/* ===================== ASSIGNMENTS ===================== */

export async function listAssignments() {
  return request<AssignmentListRow[]>(`/api/assignments`);
}

export async function getAssignmentForUser(userId: string) {
  return request<AssignmentForEdit>(`/api/assignments/user/${userId}`);
}

export async function updateAssignmentForUser(
  userId: string,
  payload: AssignmentUpdatedPayload
) {
  // Normalize UI sentinel "0" (global) to [] for the backend
  const normalized: AssignmentUpdatedPayload = {
    ...payload,
    entityIds: (payload.entityIds || []).filter((id) => id !== "0"),
  };
  return request<{ ok: true }>(`/api/assignments/user/${userId}`, {
    method: "PUT",
    body: JSON.stringify(normalized),
  });
}



export async function setUserStatus(
  userId: string,
  status: "active" | "disabled"
) {
  return request(`/api/users/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

