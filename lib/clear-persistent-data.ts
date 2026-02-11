/**
 * Clear all persistent app data (sessionStorage + localStorage).
 * Use on explicit logout so the next session starts clean.
 */

import { removeToken } from '@/lib/auth';
import { STORAGE_KEY_USER } from '@/lib/constants/user';
import { STORAGE_KEYS } from '@/lib/constants/contacts';
import { storage } from '@/lib/utils/storage';
import { FeatureFlag, clearFeatureFlagOverride } from '@/lib/config/feature-flags';

/**
 * Clear only auth session (token + user). Use when landing on the login page
 * so the next user (or re-login) never uses the previous user's token or identity.
 */
export function clearSessionOnly(): void {
  if (typeof window === 'undefined') return;
  try {
    removeToken();
    localStorage.removeItem(STORAGE_KEY_USER);
  } catch (e) {
    console.error('Error clearing session', e);
  }
}

export function clearAllPersistentData(): void {
  if (typeof window === 'undefined') return;
  try {
    removeToken();
    localStorage.removeItem(STORAGE_KEY_USER);
    storage.contacts.remove();
    localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTION);
    for (const flag of Object.values(FeatureFlag)) {
      clearFeatureFlagOverride(flag as FeatureFlag);
    }
  } catch (e) {
    console.error('Error clearing persistent data:', e);
  }
}
