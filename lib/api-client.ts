import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken } from "@/lib/auth";

const API_PREFIX = "/api/v1";

/**
 * Backend API base URL (NestJS). Set via NEXT_PUBLIC_API_URL in .env.local
 * (e.g. http://localhost:3001). We always append /api/v1 if missing.
 * When unset, uses same-origin + /api/v1 so requests go to /api/v1/...
 */
function getApiBaseUrl(): string {
  const raw =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "";
  const base = raw.replace(/\/+$/, "");
  if (!base) return API_PREFIX;
  return base.endsWith(API_PREFIX) ? base : `${base}${API_PREFIX}`;
}

const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * Extract token from API response (signup verify, forgot-password verify).
 * Handles { token }, { data: { token } }, etc.
 */
export function getResponseToken(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const d = data as Record<string, unknown>;
  if (typeof d.token === 'string') return d.token;
  const inner = d.data as Record<string, unknown> | undefined;
  return typeof inner?.token === 'string' ? inner.token : undefined;
}

/**
 * Extract user-facing error message from NestJS API error.
 * Handles ValidationPipe message (string or string[]) and standard message.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error == null) return "Something went wrong. Please try again.";
  const err = error as AxiosError<{ message?: string | string[] }>;
  const msg = err.response?.data?.message;
  if (Array.isArray(msg)) return msg[0] ?? "Something went wrong.";
  if (typeof msg === "string") return msg;
  if (err.message) return err.message;
  return "Something went wrong. Please try again.";
}

/** Called when the API returns 401 Unauthorized (e.g. token expired) */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

// Attach Bearer token to every request when present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Paths where 401 means the token is invalid and we should log the user out.
// Other 401s (e.g. /progress/me, /technician/me) may be endpoint-specific and must not clear session
// or the user gets redirected back to login right after signing in.
const SESSION_CRITICAL_PATHS = ['/user/current', '/auth/signin', '/auth/signup'];

function isSessionCriticalRequest(config: InternalAxiosRequestConfig | undefined): boolean {
  const url = config?.url ?? '';
  return SESSION_CRITICAL_PATHS.some((p) => url.includes(p));
}

// On 401, only clear token and notify app when the failed request was for a session-critical endpoint.
// This prevents redirect loops when e.g. /progress/me returns 401 right after login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && isSessionCriticalRequest(error.config)) {
      removeToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
