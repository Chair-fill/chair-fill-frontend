/**
 * Demo mode helpers
 *
 * Demo mode allows using the app without a real backend.
 * Uses the centralized feature flag system.
 *
 * To enable:
 *   - Set NEXT_PUBLIC_FF_DEMO_MODE=true in .env.local (dev)
 *   - Or click "Try demo" on the login page (sets localStorage override)
 *
 * @see lib/config/feature-flags.ts for configuration
 */

import { FeatureFlag, isFeatureEnabled, setFeatureFlag, clearFeatureFlagOverride } from './config/feature-flags';

/**
 * Check if demo mode is currently enabled.
 */
export function isDemoMode(): boolean {
  return isFeatureEnabled(FeatureFlag.DEMO_MODE);
}

/**
 * Enable or disable demo mode at runtime.
 * When disabled, clears the override so it falls back to env/default.
 */
export function setDemoMode(enabled: boolean): void {
  if (enabled) {
    setFeatureFlag(FeatureFlag.DEMO_MODE, true);
  } else {
    clearFeatureFlagOverride(FeatureFlag.DEMO_MODE);
  }
}
