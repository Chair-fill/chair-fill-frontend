/**
 * Backend API base URL. Set via NEXT_PUBLIC_API_URL.
 * Used for outreach, payment, and CRUD operations.
 */
export const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "";

export function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${p}` : p;
}
