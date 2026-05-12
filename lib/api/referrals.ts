import { api, getApiErrorMessage } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import {
  ApplyReferralBody,
  ApplyReferralResponse,
  ReferralData,
} from '@/lib/types/referral';

/**
 * GET /api/referrals/me
 *
 * Returns the current user's referral code, stats, and referral history.
 * The backend creates a code automatically if none exists yet.
 *
 * Auth: Bearer token via axios interceptor.
 */
export async function getReferralData(): Promise<ReferralData> {
  const res = await api.get<ReferralData>(API.REFERRAL.ME);
  return res.data;
}

/**
 * POST /api/referrals/apply
 *
 * Applies a referral code for the current user during signup/checkout.
 * Normalizes code (trim + uppercase) before sending.
 *
 * Errors (thrown as AxiosError):
 *   400 — code not found
 *   409 — already used a referral code, or self-referral attempt
 *   429 — rate limited (3 attempts per hour)
 */
export async function applyReferralCode(
  body: ApplyReferralBody,
): Promise<ApplyReferralResponse> {
  const normalized = { code: body.code.trim().toUpperCase() };
  const res = await api.post<ApplyReferralResponse>(API.REFERRAL.APPLY, normalized);
  return res.data;
}

export { getApiErrorMessage };
