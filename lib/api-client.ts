import axios from "axios";
import { API_BASE_URL } from "@/lib/constants/api";

/**
 * Axios instance for backend API calls.
 * Base URL from NEXT_PUBLIC_API_URL.
 */
export const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, "") || undefined,
  headers: { "Content-Type": "application/json" },
});
