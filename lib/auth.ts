/**
 * Client-side auth token storage.
 * Uses sessionStorage so the token is cleared when the tab closes (session-only).
 * For "remember me" the backend can issue a longer-lived token and you may use localStorage.
 */

const AUTH_TOKEN_KEY = "chairfill-auth-token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (e) {
    console.error("Failed to store auth token", e);
  }
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** Routes that do not require authentication */
export const PUBLIC_ROUTES = ["/login", "/signup", "/forgot-password"] as const;

/** Onboarding steps (require auth; access app only after completing all). */
export const ONBOARDING_ROUTES = [
  "/onboarding/barber-account",
  "/onboarding/choose-plan",
  "/onboarding/checkout",
] as const;

export const ONBOARDING_BARBER_ACCOUNT = "/onboarding/barber-account";
export const ONBOARDING_CHOOSE_PLAN = "/onboarding/choose-plan";
export const ONBOARDING_CHECKOUT = "/onboarding/checkout";

export function isOnboardingRoute(pathname: string): boolean {
  return ONBOARDING_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

/** Routes that require authentication (all others except public) */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export function isProtectedRoute(pathname: string): boolean {
  return !isPublicRoute(pathname) && pathname !== "/";
}
