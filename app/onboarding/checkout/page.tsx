'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useSubscription } from '@/app/providers/SubscriptionProvider';
import type { PlanDetails, SubscriptionPlan } from '@/lib/types/subscription';
import { SUBSCRIPTION_PLANS } from '@/lib/constants/subscription';
import { isDemoMode } from '@/lib/demo';
import AuthLayout from '@/app/components/ui/AuthLayout';
import AuthCard from '@/app/components/ui/AuthCard';
import { api } from '@/lib/api-client';
import { API } from '@/lib/constants/api';
import SubscriptionPaymentModal from '@/app/features/subscription/components/SubscriptionPaymentModal';
import FormError from '@/app/components/ui/FormError';

const VALID_PLANS: SubscriptionPlan[] = ['independent', 'professional', 'shop-owner'];

function OnboardingCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  const { subscription, subscribe, isLoading } = useSubscription();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [error, setError] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);

  const plan: PlanDetails | undefined = planId
    ? SUBSCRIPTION_PLANS.find((p) => p.id === planId)
    : undefined;
  const isValidPlan = planId && VALID_PLANS.includes(planId as SubscriptionPlan) && plan && !plan.comingSoon;

  useEffect(() => {
    if (planId && !isValidPlan) {
      setError('Invalid or missing plan. Please choose a plan first.');
    }
  }, [planId, isValidPlan]);

  const handlePayWithStripe = () => {
    setError('');
    if (!isValidPlan || !plan) return;
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!plan?.id) return;
    try {
      await subscribe(plan.id as SubscriptionPlan);
      setShowPaymentModal(false);
      router.replace('/contacts');
      router.refresh();
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
  };

  if (!planId) {
    return (
      <AuthLayout>
        <AuthCard rounded>
          <p className="text-zinc-600 dark:text-zinc-400 text-center">
            No plan selected. Please choose a plan first.
          </p>
          <button
            type="button"
            onClick={() => router.push('/onboarding/choose-plan')}
            className="mt-4 w-full py-2.5 rounded-lg font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
          >
            Choose plan
          </button>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (!isValidPlan) {
    return (
      <AuthLayout>
        <AuthCard rounded>
          {error && <FormError message={error} />}
          <button
            type="button"
            onClick={() => router.push('/onboarding/choose-plan')}
            className="mt-4 w-full py-2.5 rounded-lg font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
          >
            Back to choose plan
          </button>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (plan.price == null) {
    return (
      <AuthLayout>
        <AuthCard rounded className="max-w-md mx-auto">
          <p className="text-zinc-600 dark:text-zinc-400 text-center">
            This plan requires custom pricing. Please contact us.
          </p>
          <button
            type="button"
            onClick={() => router.push('/onboarding/choose-plan')}
            className="mt-4 w-full py-2.5 rounded-lg font-medium bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
          >
            ← Back to plans
          </button>
        </AuthCard>
      </AuthLayout>
    );
  }

  const handleRedirectToStripe = async () => {
    if (!plan?.id) return;
    setError('');
    setIsRedirecting(true);
    try {
      const { data } = await api.get<{ url?: string }>(
        `${API.PAYMENT.CHECKOUT_SESSION}?planId=${encodeURIComponent(plan.id)}`
      );
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch {
      setError('Unable to start checkout. Please try again.');
      setIsRedirecting(false);
    }
  };

  if (isDemoMode()) {
    return (
      <AuthLayout className="onboarding-checkout-page">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50">Checkout and pay</h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">Demo: payment is simulated.</p>
        </div>
        <AuthCard rounded className="max-w-md mx-auto">
          <div className="space-y-6">
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-50">{plan.name}</h2>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">${plan.price}</span>
                <span className="text-zinc-500 dark:text-zinc-400">/{plan.pricePeriod}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePayWithStripe}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-lg font-semibold bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Complete payment (demo)'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/onboarding/choose-plan')}
              className="w-full py-2.5 text-zinc-600 dark:text-zinc-400 text-sm"
            >
              ← Back to plans
            </button>
          </div>
        </AuthCard>
        {plan && (
          <SubscriptionPaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            plan={plan}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </AuthLayout>
    );
  }

  return (
    <AuthLayout className="onboarding-checkout-page">
      <div className="text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Checkout and pay
        </h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-base max-w-md mx-auto">
          You'll complete payment on Stripe. Click below to continue.
        </p>
      </div>

      <AuthCard rounded className="max-w-md mx-auto">
        <div className="space-y-6">
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{plan.name}</h2>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">${plan.price}</span>
              <span className="text-zinc-500 dark:text-zinc-400">/{plan.pricePeriod}</span>
            </div>
          </div>
          {error && <FormError message={error} />}
          <button
            type="button"
            onClick={handleRedirectToStripe}
            disabled={isRedirecting}
            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white dark:text-zinc-900 bg-zinc-900 dark:bg-zinc-50 disabled:opacity-50"
          >
            {isRedirecting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue to Stripe'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/onboarding/choose-plan')}
            className="w-full py-2.5 text-zinc-600 dark:text-zinc-400 text-sm"
          >
            ← Back to plans
          </button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default function OnboardingCheckoutPage() {
  return (
    <Suspense
      fallback={
        <AuthLayout>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-zinc-400" />
          </div>
        </AuthLayout>
      }
    >
      <OnboardingCheckoutContent />
    </Suspense>
  );
}
