export type SubscriptionPlan = 'free' | 'basic' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
}

export interface PlanDetails {
  id: SubscriptionPlan;
  name: string;
  price: number;
  pricePeriod: 'month' | 'year';
  features: string[];
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
