export type SubscriptionPlan = 'independent' | 'professional' | 'shop-owner';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
}

/** 'Most Popular' | 'Coming Soon' */
export type PlanBadge = 'Most Popular' | 'Coming Soon';

export interface PlanDetails {
  id: SubscriptionPlan;
  /** Stripe price ID - from plans/list API */
  price_id?: string;
  name: string;
  /** Tagline above the plan name */
  tagline?: string;
  /** Subtitle below price */
  subtitle?: string;
  badge?: PlanBadge;
  /** Monthly price; null = custom / contact us */
  price: number | null;
  pricePeriod: 'month' | 'year';
  pricePeriodLabel?: string;
  features: string[];
  /** If true, show "Contact us" and do not open payment modal */
  comingSoon?: boolean;
  maxContacts?: number;
  maxOutreach?: number;
}

export interface PaymentMethod {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export interface BillingInfo {
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface PaymentRequest {
  planId: SubscriptionPlan;
  amount: number;
  paymentMethod: PaymentMethod;
  billingInfo: BillingInfo;
}
