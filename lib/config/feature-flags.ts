/**
 * Feature Flags Configuration
 *
 * Centralized feature flag management for easy control across environments.
 *
 * Priority (highest to lowest):
 * 1. Environment variable = "false" → always OFF (master switch)
 * 2. localStorage override (for runtime toggling when env allows it)
 * 3. Environment variable = "true" or default value
 *
 * Usage:
 *   import { isFeatureEnabled, FeatureFlag } from '@/lib/config/feature-flags';
 *   if (isFeatureEnabled(FeatureFlag.DEMO_MODE)) { ... }
 *
 * To enable in .env.local (dev):
 *   NEXT_PUBLIC_FF_DEMO_MODE=true
 *
 * To disable in production, either:
 *   - Don't set the env var (uses default)
 *   - Set NEXT_PUBLIC_FF_DEMO_MODE=false
 */

// ─────────────────────────────────────────────────────────────
// Feature Flag Definitions
// ─────────────────────────────────────────────────────────────

export enum FeatureFlag {
  /** Allow users to use the app without a real backend */
  DEMO_MODE = 'DEMO_MODE',

  // Add more flags here as needed, e.g.:
  // NEW_DASHBOARD = 'NEW_DASHBOARD',
  // BETA_FEATURES = 'BETA_FEATURES',
}

/** Default values for each flag (used when env var is not set) */
const FLAG_DEFAULTS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.DEMO_MODE]: false,
  // [FeatureFlag.NEW_DASHBOARD]: false,
};

// ─────────────────────────────────────────────────────────────
// Feature Flag Helpers
// ─────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'chairfill-ff-';

/**
 * Check if a feature flag is enabled.
 * Env = "false" is the master switch (always off). Otherwise localStorage and env/default apply.
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envKey = `NEXT_PUBLIC_FF_${flag}`;
  const envValue = process.env[envKey];

  // 1. Env explicitly false → always off (so .env.local can disable even if user had "Try demo" before)
  if (envValue === 'false') return false;

  // 2. localStorage override (client-side only), when env allows the feature
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${flag}`);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  }

  // 3. Env true or default
  if (envValue === 'true') return true;
  return FLAG_DEFAULTS[flag] ?? false;
}

/**
 * Override a feature flag at runtime (stored in localStorage).
 * Useful for testing or demo purposes.
 */
export function setFeatureFlag(flag: FeatureFlag, enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_PREFIX}${flag}`, String(enabled));
}

/**
 * Clear the localStorage override for a flag (reverts to env/default).
 */
export function clearFeatureFlagOverride(flag: FeatureFlag): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(`${STORAGE_PREFIX}${flag}`);
}

/**
 * Get all feature flags and their current values.
 * Useful for debugging or admin panels.
 */
export function getAllFeatureFlags(): Record<FeatureFlag, boolean> {
  const flags = {} as Record<FeatureFlag, boolean>;
  for (const flag of Object.values(FeatureFlag)) {
    flags[flag] = isFeatureEnabled(flag);
  }
  return flags;
}
