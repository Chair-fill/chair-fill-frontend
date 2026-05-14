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
 *   - Don't set the env var (uses default or production defaults)
 *   - Set NEXT_PUBLIC_FF_DEMO_MODE=false
 *
 * For staging environment, ensure NEXT_PUBLIC_APP_ENV=staging is set in your deployment platform.
 *
 * 🚨 MANDATORY RULE: ALL CODE CHANGES MUST BE FEATURE FLAGGED 🚨
 * Every new feature, bug fix, or enhancement must be wrapped in a feature flag.
 * 1. By default, new flags should be enabled in `development` and `staging`.
 * 2. They must be explicitly disabled in `production` by default.
 * 3. Only when the change is fully tested in staging should it be enabled in production.
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

/** Base default values for each flag (used as the ultimate fallback) */
const FLAG_DEFAULTS: Record<FeatureFlag, boolean> = {
  [FeatureFlag.DEMO_MODE]: false,
  // [FeatureFlag.NEW_DASHBOARD]: false,
};

/**
 * Development environment overrides.
 * RULE: Enable new features/fixes here by default for local development.
 */
const DEVELOPMENT_FLAG_DEFAULTS: Partial<Record<FeatureFlag, boolean>> = {
  // [FeatureFlag.NEW_DASHBOARD]: true,
};

/**
 * Staging environment overrides.
 * RULE: Enable new features/fixes here by default for staging QA.
 */
const STAGING_FLAG_DEFAULTS: Partial<Record<FeatureFlag, boolean>> = {
  // [FeatureFlag.NEW_DASHBOARD]: true,
};

/**
 * Production environment overrides.
 * RULE: Keep new features/fixes disabled here until fully tested and approved.
 */
const PRODUCTION_FLAG_DEFAULTS: Partial<Record<FeatureFlag, boolean>> = {
  // [FeatureFlag.NEW_DASHBOARD]: false,
};

/** Get the current environment (development, staging, production) */
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';

// ─────────────────────────────────────────────────────────────
// Feature Flag Helpers
// ─────────────────────────────────────────────────────────────

const STORAGE_PREFIX = 'chairfill-ff-';

/**
 * Check if a feature flag is enabled.
 * Priority:
 * 1. Env = "false" (master switch, always off)
 * 2. localStorage override (client-side only)
 * 3. Env = "true"
 * 4. Environment-specific default (staging/production)
 * 5. Base default
 */
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  const envKey = `NEXT_PUBLIC_FF_${flag}`;
  const envValue = process.env[envKey];

  // 1. Env explicitly false → always off
  if (envValue === 'false') return false;

  // 2. localStorage override (client-side only), when env allows the feature
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${flag}`);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  }

  // 3. Env explicitly true
  if (envValue === 'true') return true;

  // 4. Environment-specific default
  if (APP_ENV === 'development' && DEVELOPMENT_FLAG_DEFAULTS[flag] !== undefined) {
    return DEVELOPMENT_FLAG_DEFAULTS[flag] as boolean;
  }
  if (APP_ENV === 'staging' && STAGING_FLAG_DEFAULTS[flag] !== undefined) {
    return STAGING_FLAG_DEFAULTS[flag] as boolean;
  }
  if (APP_ENV === 'production' && PRODUCTION_FLAG_DEFAULTS[flag] !== undefined) {
    return PRODUCTION_FLAG_DEFAULTS[flag] as boolean;
  }

  // 5. Base default
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
