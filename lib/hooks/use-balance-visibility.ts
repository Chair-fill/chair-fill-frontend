"use client";

import { useCallback, useSyncExternalStore } from "react";

const BALANCE_HIDDEN_KEY = "wallet:balance-hidden";
const BALANCE_HIDDEN_EVENT = "wallet:balance-hidden:change";

/** Read current value from localStorage (SSR-safe). */
function readHidden(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(BALANCE_HIDDEN_KEY) === "1";
}

/** Subscribe to changes (custom event in same tab + storage event across tabs). */
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handleStorage = (e: StorageEvent) => {
    if (e.key === BALANCE_HIDDEN_KEY) onChange();
  };
  window.addEventListener(BALANCE_HIDDEN_EVENT, onChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(BALANCE_HIDDEN_EVENT, onChange);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * Shared visibility toggle for monetary balances across the app
 * (wallet card, home dashboard, etc.). Persists in localStorage and
 * syncs across React components via useSyncExternalStore, and across
 * browser tabs via the native `storage` event.
 */
export function useBalanceVisibility() {
  const hidden = useSyncExternalStore(
    subscribe,
    readHidden,
    // Server snapshot — balances are visible by default during SSR.
    () => false,
  );

  const toggle = useCallback(() => {
    if (typeof window === "undefined") return;
    const next = !readHidden();
    window.localStorage.setItem(BALANCE_HIDDEN_KEY, next ? "1" : "0");
    window.dispatchEvent(new Event(BALANCE_HIDDEN_EVENT));
  }, []);

  return { hidden, toggle };
}

/** Mask used in place of monetary values when hidden. */
export const BALANCE_MASK = "••••••";
