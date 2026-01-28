import axios, { type InternalAxiosRequestConfig } from "axios";
import { getToken, removeToken } from "@/lib/auth";

/**
 * Backend API base URL. Set via NEXT_PUBLIC_API_URL in .env.local
 */
const API_BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL) || "";

/**
 * Axios instance for backend API calls (outreach, payment, CRUD).
 * Uses NEXT_PUBLIC_API_URL as baseURL when set.
 */
export const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, "") || undefined,
  headers: { "Content-Type": "application/json" },
});

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

// On 401, clear token and notify app to clear user/session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  }
);
