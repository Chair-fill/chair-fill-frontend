import type { PlanDetails } from "@/lib/types/subscription";

export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    pricePeriod: 'month',
    features: [
      'Up to 50 contacts',
      'Basic outreach features',
      'Email support',
    ],
    maxContacts: 50,
    maxOutreach: 10,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    pricePeriod: 'month',
    features: [
      'Up to 500 contacts',
      'Unlimited outreach',
      'Email & SMS outreach',
      'Priority support',
      'Basic analytics',
    ],
    maxContacts: 500,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    pricePeriod: 'month',
    features: [
      'Unlimited contacts',
      'Unlimited outreach',
      'Email & SMS outreach',
      'Advanced analytics',
      'API access',
      'Priority support',
      'Custom templates',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    pricePeriod: 'month',
    features: [
      'Unlimited contacts',
      'Unlimited outreach',
      'Email & SMS outreach',
      'Advanced analytics',
      'API access',
      'Dedicated support',
      'Custom integrations',
      'Team collaboration',
      'White-label options',
    ],
  },
];
