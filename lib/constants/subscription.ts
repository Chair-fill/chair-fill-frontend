import type { PlanDetails } from "@/lib/types/subscription";

export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: 'independent',
    name: 'The Independent',
    tagline: 'The solo barber building their own book.',
    subtitle: 'Essential automation for one person.',
    price: 97,
    pricePeriod: 'month',
    features: [
      'AI outreach via iMessage',
      'Reminders, rebooks & fill-ins',
      'Single chair / one barber',
      'Dashboard & analytics',
      'Email support',
    ],
  },
  {
    id: 'professional',
    name: 'The Professional',
    tagline: 'The high-volume barber or booth renter.',
    subtitle: 'Best value for serious volume.',
    badge: 'Most Popular',
    price: 247,
    pricePeriod: 'month',
    features: [
      'Everything in Independent',
      'Higher message volume',
      'Priority rebooks & fill-ins',
      'Advanced analytics',
      'Priority support',
    ],
  },
  {
    id: 'shop-owner',
    name: 'The Shop Owner',
    tagline: 'Shop owners with multiple chairs and barbers.',
    subtitle: 'Management for the whole team and multi-chair analytics.',
    badge: 'Coming Soon',
    price: null,
    pricePeriod: 'month',
    pricePeriodLabel: 'Contact us',
    comingSoon: true,
    features: [
      'Everything in Professional',
      'Multi-chair & multi-barber',
      'Team management',
      'Shop-wide analytics',
      'Dedicated onboarding',
    ],
  },
];
