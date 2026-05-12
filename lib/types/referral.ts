/**
 * Referral program types.
 * Maps 1:1 to NestJS DTOs from GET /api/referrals/me.
 */

export type ReferralStatus = 'pending' | 'active';

export interface ReferralEntry {
  id: string;
  referredName: string;     // first name only for display
  referredInitial: string;  // for avatar
  createdAt: string;        // ISO date string
  status: ReferralStatus;
  // pending = signed up, not yet launched first campaign
  // active  = first campaign launched, credit awarded
}

export interface ReferralData {
  code: string;               // e.g. "TMAC-X7K2"
  totalReferred: number;
  activeSubscribers: number;
  creditsEarned: number;      // total months earned (all time)
  creditsRemaining: number;   // months not yet applied to Stripe invoice
  referrals: ReferralEntry[];
}

export interface ApplyReferralBody {
  code: string;
}

export interface ApplyReferralResponse {
  success: boolean;
  message: string;
}
